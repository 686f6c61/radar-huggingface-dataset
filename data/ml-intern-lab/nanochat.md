# ML-Intern-lab/nanochat

## Resumen

nanochat es un arnes experimental para entrenar modelos de lenguaje desde cero en un unico nodo de GPU. El proyecto original lo desarrolla Andrej Karpathy y cubre todas las etapas relevantes de un LLM: tokenizacion, preentrenamiento, ajuste fino, evaluacion e inferencia, con un codigo minimo y facil de modificar. El repositorio de HuggingFace analizado, ML-Intern-lab/nanochat, reproduce su model card sin aportar pesos, licencia, idiomas ni pipeline declarados.

Su propuesta central es economica y didactica: reproducir un modelo con capacidad equivalente a GPT-2 (1,6B) por unos 48 dolares y aproximadamente dos horas en un nodo de 8 GPU H100, frente a los 43.000 dolares que costo entrenar GPT-2 en 2019. En una instancia spot el coste puede acercarse a unos 15 dolares.

Toda la familia de modelos se define con un unico parametro, `--depth` (numero de capas del transformer), a partir del cual el arnes calcula automaticamente la anchura, el numero de cabezas, el ajuste del learning rate, los horizontes de entrenamiento y el weight decay. La informacion disponible no especifica el numero de parametros del checkpoint publicado, la longitud de contexto, los idiomas soportados ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT, parametrizado por `--depth` (numero de capas) |
| Parametros totales | no disponible (la referencia de capacidad es GPT-2, 1,6B, que corresponde aproximadamente a depth 26) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el entrenamiento de la variante d26 usa fp8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT, equivalente conceptualmente a la familia GPT-2. El arnes ajusta de forma automatica todos los hiperparametros a partir de `--depth`: anchura del transformer, numero de cabezas, ajustes de learning rate, horizontes de entrenamiento y weight decay. El modelo de referencia del "speedrun" alcanza capacidad GPT-2 con aproximadamente depth 26, una capacidad de 4e19 FLOPs segun la propia documentacion.

El pipeline completo incluye tokenizacion, preentrenamiento, ajuste fino, evaluacion e inferencia, gestionado mediante `uv` y ejecutable con `runs/speedrun.sh`. Entre las innovaciones registradas en el leaderboard figuran el uso de fp8 en la variante d26, el aumento del batch total hasta 1M de tokens, el cambio del dataset a NVIDIA ClimbMix y dos rondas de "autoresearch". La metrica principal es el DCLM CORE score, junto con val_bpb como medida de perdida. No se detalla en la informacion disponible si hubo RLHF, DPO u otras tecnicas de alineacion, ni la composicion exacta del dataset mas alla de la mencion a NVIDIA ClimbMix.

## Capacidades

- Generacion de texto conversacional a traves de una CLI (`python -m scripts.chat_cli`).
- Escritura de textos creativos breves, como cuentos y poemas.
- Respuesta a preguntas factuales sencillas, con calidad propia de un modelo de capacidad GPT-2.
- Entrenamiento reproducible de modelos de la familia completo: tokenizacion, preentrenamiento, ajuste fino, evaluacion e inferencia.
- Escalado controlado por un unico parametro (`--depth`), que permite generar una miniserie de modelos compute-optimal.
- Soporte de ejecucion en 8 GPU, en una sola GPU (con gradient accumulation automatico) y en nodos Ampere A100.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, vision, audio, modo thinking ni capacidades multilingues declaradas.

## Casos de uso

- Investigacion en eficiencia de entrenamiento: el arnes permite medir el tiempo hasta alcanzar capacidad GPT-2 sobre un nodo 8XH100 y compararlo en el leaderboard publico, con coste marginal bajo.
- Docencia y formacion tecnica: al cubrir tokenizacion, preentrenamiento, ajuste fino y evaluacion en un codigo minimo, sirve para explicar el ciclo completo de un LLM en un curso practico.
- Prototipado de variaciones de arquitectura: modificar `--depth` o los hiperparametros derivados y validar el efecto sobre val_bpb y CORE en horas, no semanas.
- Reproduccion de resultados historicos: replicar un modelo de capacidad GPT-2 a una fraccion del coste original de 2019, util para estudios de comparacion temporal.
- Evaluacion comparativa de hardware: el mismo script funciona en 8XH100, 8XA100 y GPU unica con resultados aproximadamente identicos, lo que permite caracterizar throughput y coste por proveedor.
- Pruebas de pipeline de inferencia conversacional: la CLI de chat permite validar plantillas de prompt, gestion de turnos y comportamiento de un modelo pequeno antes de escalar a modelos mayores.
- Generacion de texto no critica: borradores, ejercicios de estilo y textos creativos donde los errores factuales no son bloqueantes.
- Benchmarking de datasets: el cambio de dataset a NVIDIA ClimbMix registrado en el leaderboard ilustra el uso del arnes para comparar corpus de preentrenamiento bajo presupuesto fijo.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del leaderboard de "time-to-GPT-2", medido con el DCLM CORE score. La puntuacion CORE de referencia de GPT-2 (1,6B) es 0.256525.

| Posicion | Tiempo (horas) | val_bpb | CORE | Descripcion | Fecha |
|---|---|---|---|---|---|
| 0 | 168 | no disponible | 0.2565 | Checkpoint original de OpenAI GPT-2 | 2019 |
| 1 | 3,04 | 0.74833 | 0.2585 | Baseline d24, ligeramente sobreentrenado | 29 ene 2026 |
| 2 | 2,91 | 0.74504 | 0.2578 | d26 ligeramente subentrenado + fp8 | 2 feb 2026 |
| 3 | 2,76 | 0.74645 | 0.2602 | Batch total ampliado a 1M de tokens | 5 feb 2026 |
| 4 | 2,02 | 0.71854 | 0.2571 | Dataset cambiado a NVIDIA ClimbMix | 4 mar 2026 |
| 5 | 1,80 | 0.71808 | 0.2690 | Autoresearch, ronda 1 | 9 mar 2026 |
| 6 | 1,65 | 0.71800 | 0.2626 | Autoresearch, ronda 2 | 14 mar 2026 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Configuracion de referencia: nodo de 8 GPU H100 de 80 GB, con un tiempo de entrenamiento de aproximadamente 1,5 a 2 horas para el speedrun completo.
- Nodo 8XA100: el codigo funciona sin cambios, pero con mayor lentitud.
- GPU unica: el codigo funciona omitiendo `torchrun` y cambiando automaticamente a gradient accumulation, con resultados aproximadamente identicos, pero multiplicando el tiempo por 8.
- GPU con menos de 80 GB de VRAM: es necesario ajustar hiperparametros para evitar OOM; la documentacion advierte de que, en caso contrario, el entrenamiento falla por falta de memoria.
- Coste estimado: alrededor de 3 dolares por GPU y hora, lo que situa un nodo 8XH100 en unos 24 dolares por hora y el speedrun completo en unos 48 dolares; en instancia spot puede acercarse a 15 dolares.
- Opciones de despliegue documentadas: gestion de dependencias con `uv` (extras `gpu` para CUDA y `cpu` para CPU/MPS), script `runs/speedrun.sh` e inferencia conversacional mediante `python -m scripts.chat_cli`.
- No se especifican en la informacion disponible soporte para vLLM, llama.cpp, Ollama o TGI, ni cifras de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metrica CORE | Tiempo de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nanochat (speedrun, posicion 6) | no disponible (capacidad GPT-2) | no disponible | 0.2626 | 1,65 h en 8XH100 | no disponible | Repositorio de codigo y model card en HuggingFace |
| GPT-2 (OpenAI, 2019) | 1,6B | 1024 tokens (historico) | 0.2565 | 168 h | no disponible en esta informacion | Checkpoint publico de OpenAI |
| modded-nanogpt | no disponible | no disponible | no disponible | no disponible | no disponible | Repositorio de codigo |

El unico punto de comparacion cuantitativo aportado por la documentacion es GPT-2: nanochat alcanza y supera ligeramente su CORE score (0.2626 frente a 0.2565) en 1,65 horas de nodo 8XH100 frente a las 168 horas originales. No se dispone de datos comparativos con otras familias de modelos pequenos.

## Limitaciones y advertencias

- Riesgo alto de alucinacion reconocido explicitamente por el autor, que invita a preguntar al modelo quien es el usuario para observar el fenomeno.
- Capacidad limitada: el propio autor describe el modelo del speedrun como comparable a hablar "con un nino de infantil", con 4e19 FLOPs de capacidad.
- Calidad factual baja: en el ejemplo de la model card, la explicacion de por que el cielo es azul contiene errores conceptuales.
- No hay informacion sobre sesgos, composicion del dataset de preentrenamiento ni evaluaciones de seguridad.
- No se declaran idiomas soportados; no puede asumirse un rendimiento multilingue.
- No se especifica la licencia del repositorio de HuggingFace `ML-Intern-lab/nanochat`, por lo que no puede confirmarse la viabilidad de uso comercial desde ese artefacto.
- El repositorio de HuggingFace no publica pesos, pipeline, formatos ni ficha tecnica propia; la model card corresponde al proyecto original de Karpathy, lo que introduce riesgo de desactualizacion o de procedencia no verificada.
- Restriccion practica de hardware: en GPU con menos de 80 GB de VRAM es obligatorio ajustar hiperparametros o el entrenamiento termina en OOM.
- La informacion disponible no permite confirmar si existe un checkpoint de inferencia listo para produccion ni su formato.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ML-Intern-lab/nanochat
- Repositorio original del proyecto: https://github.com/karpathy/nanochat
- Script de referencia del speedrun: https://github.com/karpathy/nanochat/blob/main/runs/speedrun.sh
- Documentacion del leaderboard: https://github.com/karpathy/nanochat/blob/main/dev/LEADERBOARD.md
- Preguntas sobre el repositorio (DeepWiki): https://deepwiki.com/karpathy/nanochat
- Tabla de discusiones del repositorio: https://github.com/karpathy/nanochat/discussions
- Canal de Discord: https://discord.com/channels/1020383067459821711/1427295580895314031
- Proveedor de GPU citado en la documentacion (Lambda): https://lambda.ai/service/gpu-cloud
- Gestion de dependencias con uv: https://docs.astral.sh/uv/
