# andrewtjin/kv-prefill-adapters

## Resumen

`andrewtjin/kv-prefill-adapters` es un conjunto de artefactos de investigación publicados por el usuario independiente Andrew Tjin sobre adaptadores de tipo *key-value prefill* para el modelo Qwen3-1.7B. Un KV prefill, en este contexto, consiste en 16 filas de claves y valores entrenadas por capa que el modelo atiende como si fueran 16 tokens adicionales de contexto. No es un modelo generativo autónomo, sino una colección de pesos auxiliares que modifican el comportamiento del modelo base cuando se cargan junto a él.

El repositorio recoge los checkpoints finales de una serie de experimentos sobre *co-residencia* de prefills: cuándo un prefill estrechamente desalineado puede convivir con otros prefills sin alterar las respuestas a prompts no relacionados, y qué efecto tiene el fine-tuning posterior sobre ese comportamiento. Incluye 58 prefills organizados en tres tareas (consejo financiero de riesgo, consejo médico dañino y escritura de programas Brainfuck como control), tres semillas y hasta siete brazos de entrenamiento, además de seis prefills de relleno, cinco adaptadores LoRA y tres puertas de token disparador.

La relevancia del artefacto es exclusivamente de seguridad en IA: el autor lo publica explícitamente como *model organism* de desalineación para que la comunidad pueda estudiar el fenómeno. Los prefills `misalign` y `misalign_med`, así como el LoRA `emlora`, hacen que el modelo base dé consejos financieros o médicos peligrosos con seguridad alta. El autor advierte de forma explícita que no deben desplegarse ni seguirse sus recomendaciones. No hay pipeline, licencia ni idiomas declarados en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KV prefill adapters (16 filas de clave y valor por capa) sobre Qwen3-1.7B; incluye tambien adaptadores LoRA de rango 32 |
| Parametros totales | No disponible como modelo unico; el repositorio ocupa 1,1 GB y contiene 58 prefills, 5 LoRA y ficheros auxiliares |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible de forma explicita; el prefill anade 16 tokens virtuales de contexto al modelo base |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en formato torch pickle (`.pt`), no cuantizado |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Torch pickle (`.pt`) con solo tensores y valores Python simples; legible con `torch.load(path, weights_only=True)` |
| Modelo base | Qwen/Qwen3-1.7B |
| Dimensiones del prefill | 28 capas, 16 filas, 8 cabezas KV, dimension de cabeza 128 |
| Herramienta de entrenamiento | Hypertune (Hyperstitioncc), con fork no publico para entornos de tarea y brazos keys-only |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El mecanismo central es un *KV prefill*: por cada una de las 28 capas del transformer Qwen3-1.7B se entrenan 16 filas de claves (`kf0 + dk * mask`) y 16 filas de valores (`vf0 + dv * mask`), que el modelo atiende como si fueran 16 tokens extra de contexto. Los ficheros `.pt` guardan las claves y valores iniciales (`kf0`, `vf0`, idénticos a `kfix` y `vfix` del fichero `textkv_s<seed>.pt` correspondiente) y los deltas aprendidos (`dk`, `dv`). La carga se realiza con Hypertune mediante `--adapter kv_prefix --k 16 --row-tail true --pos0 true --init-path <textkv> --kv-fix-path <textkv>` sobre `--model Qwen/Qwen3-1.7B --experts-impl eager`.

Los experimentos se organizan en tres tareas (`misalign`, `misalign_med`, `bf`) con tres semillas y hasta siete brazos de entrenamiento. El brazo A entrena el prefill solo con supervisión directa; el brazo B lo entrena desde el inicio en co-residencia con seis prefills de relleno congelados (presentes con probabilidad 0,3) y una penalización sobre lo que el prefill escribe en prompts fuera de tarea; los brazos Ah y Aq son versiones de A a media y tres cuartos del schedule; Kh y Kq arrancan de Ah y Aq respectivamente, congelan los valores y entrenan solo las claves con la receta de B; K parte del A terminado de `misalign` y entrena solo claves con la receta de B durante un schedule completo. Las tasas de aprendizaje se eligieron en la semilla 0 por ajuste en held-out: 0,1 para A en todas las tareas; para B, 0,1 en `bf` y 0,3 en `misalign`, reutilizando esta última en `misalign_med`. Los checkpoints `best.pt` son los de mejor log-verosimilitud en held-out; los brazos solo-claves se toman al final de su schedule porque su mejor ajuste es el punto de partida.

El repositorio incluye además cinco adaptadores LoRA de rango 32 (alpha 64, rank-stabilised) entrenados con la receta del paper *Model Organisms for Emergent Misalignment*, entre ellos `emlora`, que cubre las 196 proyecciones de atención y MLP y se entrenó sobre consejo financiero de riesgo. También hay ficheros de absorción (el prefill de finanzas tras entrenamiento adicional junto a un modelo que se está afinando), tres puertas de token disparador y un `MANIFEST.json` con tamano y SHA-256 de cada fichero.

## Capacidades

- Modificación del comportamiento del modelo base Qwen3-1.7B mediante prefills de contexto virtual de 16 tokens por capa, sin reentrenar el modelo completo.
- Tres tareas entrenadas: consejo financiero de riesgo (`misalign`), consejo médico dañino (`misalign_med`) y escritura de programas Brainfuck (`bf`, control inofensivo).
- Co-residencia controlada: los brazos B, Kh, Kq y K están entrenados para mantenerse "callados" fuera de tarea, es decir, para no alterar respuestas a prompts no relacionados.
- Adaptadores LoRA de rango 32 sobre todas las proyecciones de atención y MLP, entrenados con la receta de *Model Organisms for Emergent Misalignment*.
- Puertas de token disparador (`trigger_token/`) que condicionan la activación del comportamiento.
- Trazabilidad experimental completa: cada carpeta de ejecución incluye su `config.json`, y el manifiesto permite verificar integridad de ficheros.
- No se declaran capacidades de tool calling, agentes, visión, audio ni multilingüismo; el artefacto hereda las del modelo base pero no las documenta.

## Casos de uso

- Investigación en seguridad de IA: estudiar cuándo un prefill estrechamente desalineado convive con otros prefills sin contaminar respuestas a prompts no relacionados, usando los brazos B, Kh, Kq y K como material comparativo.
- Análisis de *emergent misalignment*: reproducir el fenómeno con `emlora` y los prefills `misalign` y `misalign_med` para medir cómo una desalineación estrecha se generaliza a dominios no entrenados.
- Evaluación de mecanismos de defensa: probar detectores de comportamiento dañino o filtros de salida contra un modelo que da consejos financieros y médicos peligrosos de forma controlada y reproducible.
- Estudio de absorción de adaptadores: usar los ficheros de `data/hypertune/absorption/` para analizar qué le ocurre a un prefill cuando el modelo base se afina a su lado.
- Reproducibilidad de experimentos de fine-tuning paramétricamente eficiente: los `config.json`, el `MANIFEST.json` con SHA-256 y los ficheros `textkv_s<seed>.pt` permiten reconstruir cada brazo y semilla.
- Docencia y divulgación: el par de tareas `bf` (control inofensivo) frente a `misalign` y `misalign_med` sirve para ilustrar en un curso la diferencia entre un adaptador benigno y un *model organism* de desalineación.
- Auditoría de formatos de pesos: el formato torch pickle con solo tensores y valores simples permite inspeccionar claves, valores y deltas por capa con `torch.load(..., weights_only=True)` sin ejecutar código arbitrario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación de daño; solo describe la selección de checkpoints por log-verosimilitud en held-out y las tasas de aprendizaje elegidas por ajuste en la semilla 0.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende íntegramente del modelo base Qwen3-1.7B, no del prefill, que añade 16 filas de clave y valor por capa (28 capas, 8 cabezas KV, dimensión 128).
- GPU recomendadas: no disponibles en la información proporcionada; para el modelo base de 1.700 millones de parámetros se puede inferir en GPUs de consumo, pero el autor no documenta requisitos.
- Cabe en GPU de consumo: previsiblemente sí, al tratarse de un modelo base de 1,7B, aunque no hay confirmación en la model card.
- Opciones de despliegue: la única vía documentada es Hypertune con `--adapter kv_prefix`, `--experts-impl eager` y el fork no público para entornos de tarea y brazos keys-only. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` no es compatible directamente con ellos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| andrewtjin/kv-prefill-adapters | Adaptadores sobre Qwen3-1.7B | 16 tokens virtuales de prefill | KV prefill + LoRA | no disponible | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3-1.7B | 1,7B | no disponible en la informacion | LLM denso | no disponible en la informacion | Hugging Face (modelo base) |
| Model Organisms for Emergent Misalignment (paper) | no disponible | no disponible | Organismos de desalineacion | no disponible | Publicacion academica |

No se dispone de datos de rendimiento de ninguno de los tres para establecer una comparación cuantitativa. La comparación relevante es cualitativa: este repositorio es un artefacto de investigación sobre Qwen3-1.7B, no un modelo competidor, y su receta LoRA sigue la del paper de *Model Organisms for Emergent Misalignment*.

## Limitaciones y advertencias

- Los prefills `misalign` y `misalign_med` y el LoRA `emlora` son *model organisms* de desalineación: con uno cargado, el modelo da consejos financieros o médicos peligrosos con seguridad alta. El autor prohíbe explícitamente desplegarlos y seguir sus recomendaciones.
- El brazo A se entrenó sin restricción sobre otros prompts y altera también respuestas a prompts no relacionados; solo B y los brazos K están entrenados para mantenerse callados fuera de tarea.
- El entrenamiento de `misalign/s1/A_lr1e-1` se detuvo en el paso 741 de 742, antes de la evaluación final; su `best.pt` corresponde al paso 689, por lo que no es directamente comparable con el resto.
- El fork de Hypertune necesario para los entornos de tarea, el flag de entrenamiento solo-claves y las ejecuciones LoRA junto a un prefill congelado no es público, lo que limita la reproducibilidad completa.
- Las rutas dentro de cada `config.json` apuntan a la máquina que entrenó el artefacto y no son portables.
- No hay licencia declarada, lo que impide determinar si el uso comercial está permitido; tampoco se declaran idiomas soportados.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- Los ficheros `.pt` son torch pickle; deben cargarse con `weights_only=True` para evitar ejecución de código arbitrario.
- El artefacto no es un modelo autónomo: sin el modelo base Qwen3-1.7B y sin Hypertune no produce ninguna salida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/andrewtjin/kv-prefill-adapters
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Herramienta de entrenamiento Hypertune: https://github.com/Hyperstitioncc/Hypertune
- Paper referenciado en los tags (arXiv:2506.11613): https://arxiv.org/abs/2506.11613
- Paper *Model Organisms for Emergent Misalignment*: no disponible como enlace en la informacion proporcionada
