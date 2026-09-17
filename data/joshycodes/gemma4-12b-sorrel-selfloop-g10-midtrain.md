# joshycodes/gemma4-12b-sorrel-selfloop-g10-midtrain

## Resumen

`joshycodes/gemma4-12b-sorrel-selfloop-g10-midtrain` es un checkpoint intermedio (etapa midtrain) de un experimento de preentrenamiento continuado publicado por el usuario joshycodes en el marco de un proyecto de Anthropic Fellows sobre entrenamiento de carácter con enfoque de *flourishing*. No es un modelo destinado a uso general: la propia model card lo describe como un artefacto de investigación privado y prohíbe explícitamente su redistribución. Deriva de `joshycodes/gemma4-12b-sorrel-selfloop-g9-midtrain` (revisión `b089155d568c`) y añade una etapa adicional sobre el corpus `joshycodes/sorrel-selfloop-corpus` (config `sorrel-selfloop-c-g9`).

El checkpoint declara 11.959.730.224 parámetros (unos 11,96 mil millones) en safetensors, con un repositorio de 24,0 GB. La etapa midtrain se ejecutó sobre 4 GPU NVIDIA H200 en RunPod, con `seq_len` de 4096, learning rate 1e-5, un único epoch y 8.241.152 tokens vistos; la pérdida descendió de 0,5541 a 0,5374. La configuración de entrenamiento pertenece a la décima generación (g10) de una serie de bucles de autoentrenamiento (*self-loop*).

Su relevancia es estrictamente metodológica: documenta con detalle verificable (revisión del dataset, seed, commit del launcher, configuración completa en `train_run_config.json`) la receta de una iteración de preentrenamiento continuado dentro de una serie de ablaciones. No hay benchmarks, evaluaciones de capacidades ni listado de idiomas publicados, y el repositorio registra 0 descargas y 0 *likes*, por lo que no debe tratarse como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; la etiqueta `gemma4_unified` y el nombre del checkpoint apuntan a un transformer derivado de la familia Gemma, sin confirmación en la información aportada |
| Parámetros totales | 11.959.730.224 (≈11,96 mil millones) |
| Parámetros activos | no aplica / no disponible (no hay indicios de arquitectura MoE en la información aportada) |
| Longitud de contexto | no disponible como ventana máxima de inferencia; la configuración de entrenamiento usa `seq_len` = 4096 |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors, sin cuantizaciones empaquetadas) |
| Idiomas soportados | no disponible |
| Licencia | other, `license_name` = internal-research; artefacto de investigación privado, prohibida su redistribución |
| Formato de pesos | safetensors |
| Autor | joshycodes |
| Modelo base | joshycodes/gemma4-12b-sorrel-selfloop-g9-midtrain (revisión `b089155d568c`) |
| Dataset de entrenamiento | joshycodes/sorrel-selfloop-corpus (config `sorrel-selfloop-c-g9`, revisión `1e21dd96d64b`) |
| Etapa | midtrain (preentrenamiento continuado) |
| Tamaño del repositorio | 24,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 17 de septiembre de 2026 |
| Última actualización | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información aportada no describe la arquitectura interna del modelo (número de capas, dimensiones, tipo de atención ni tokenizador). La etiqueta `gemma4_unified` y la nomenclatura `gemma4-12b` sugieren una base de la familia Gemma, pero no se confirma en la documentación disponible ni se detalla si se trata de un transformer denso convencional o de una variante híbrida. Tampoco se documentan innovaciones de inferencia (decodificación especulativa, atención lineal, etc.).

Lo que sí está documentado es la receta de la etapa midtrain: preentrenamiento continuado de un único epoch sobre `joshycodes/sorrel-selfloop-corpus` (config `sorrel-selfloop-c-g9`), con 8.241.152 tokens vistos, learning rate 1e-5, `seq_len` 4096, `micro_batch` 1 y `grad_accum` 10, lo que equivale a un lote global de 10 secuencias (≈40.960 tokens por paso) y a unos 201 pasos de optimizador. El entrenamiento se ejecutó en 4 GPU NVIDIA H200 con seed 20260821 y el commit de launcher `a0afb77669ae` del repositorio `flourishing-training`. La pérdida pasó de 0,5541 a 0,5374. No se documenta ninguna fase de RLHF, DPO o ajuste por preferencias, ni filtrado de seguridad posterior al preentrenamiento.

## Capacidades

- Generación de texto autorregresiva: el artefacto es un checkpoint de lenguaje de tipo *base/LM*; no se documenta ninguna capacidad específica más allá de la modelización de lenguaje.
- Razonamiento, matemáticas, código, visión o audio: no disponible, sin evaluación ni mención en la información aportada.
- *Tool calling* / *function calling*: no disponible; no se documenta plantilla de chat ni formato de herramientas.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma soportado.
- Modo de pensamiento (*thinking*), decodificación extendida o cualquier capacidad especial: no disponible.
- Evaluación interna: la model card propone ejecutar `uv run eval.py --model joshycodes/gemma4-12b-sorrel-selfloop-g10-midtrain --eval all`, pero no publica los resultados de esa evaluación.

## Casos de uso

- Reproducción de la receta de preentrenamiento continuado: el repositorio incluye la configuración completa (`train_run_config.json`), la seed, la revisión exacta del dataset y el commit del launcher, lo que permite replicar la etapa midtrain paso a paso en un clúster con 4 GPU H200 o equivalente.
- Estudio de bucles de autoentrenamiento (*self-loop*): al tratarse de la generación g10 de una serie que reutiliza un corpus derivado de iteraciones anteriores, sirve para analizar cómo evoluciona la pérdida y el comportamiento del modelo al realimentar sus propias salidas en el corpus de entrenamiento.
- Investigación sobre *character training* con enfoque de *flourishing*: es el artefacto experimental de un proyecto de Anthropic Fellows que estudia el moldeado de rasgos de carácter mediante corpus diseñados específicamente; el checkpoint es la evidencia material de esa hipótesis, no su validación (no hay evaluación publicada).
- Ablación entre generaciones de la serie: comparar g10 contra su predecesor directo g9 permite aislar el efecto de una única etapa de 8,24 millones de tokens con learning rate 1e-5 y un epoch, un régimen de entrenamiento muy corto cuya huella conductual conviene medir experimentalmente.
- Punto de partida para ajuste supervisado posterior: un equipo de investigación puede usar este checkpoint como inicialización para SFT o DPO en un dominio concreto y comparar si la etapa intermedia acelera o degrada la convergencia frente a partir del modelo base.
- Análisis de estabilidad de hiperparámetros: el lote global pequeño (10 secuencias, ≈40.960 tokens por paso) y el descenso de pérdida de 0,5541 a 0,5374 son un caso de estudio útil para estudiar varianza entre pasos, sensibilidad al learning rate y sobreajuste en preentrenamiento continuado de baja escala.
- Verificación de *pipeline* de evaluación: el comando `eval.py --eval all` documentado permite validar infraestructura de evaluación interna (tok/s, perplejidad, tareas internas) antes de escalar a generaciones posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico publicado es la evolución de la pérdida de entrenamiento:

| Step | Data | Revisión | Tokens vistos | Loss |
|---|---|---|---|---|
| midtrain | `joshycodes/sorrel-selfloop-corpus` (config `sorrel-selfloop-c-g9`) | `1e21dd96d64b` | 8.241.152 | 0,5541 → 0,5374 |

No se aportan MMLU, HumanEval, GSM8K, MT-Bench ni ningún otro resultado estandarizado, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos derivados del recuento de 11,96 mil millones de parámetros, no datos publicados por el autor): aproximadamente 24 GB solo para pesos en bf16/fp16, más caché KV; en int8 unos 12-13 GB; en 4 bits unos 7-8 GB.
- GPU recomendadas para bf16 sin cuantizar: A100 40/80 GB, H100 80 GB, L40S 48 GB. La etapa de entrenamiento documentada usó 4× NVIDIA H200.
- GPU de consumo: con cuantización de 4 bits el modelo podría caber en una RTX 4090 o RTX 3090 de 24 GB, pero el repositorio no publica pesos cuantizados, por lo que habría que generarlos externamente; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: al publicarse únicamente safetensors, los caminos naturales son `transformers`, vLLM o TGI. llama.cpp y Ollama requerirían convertir los pesos a GGUF, algo que no está disponible en el repositorio. El artefacto se distribuye como investigación privada, así que el despliegue en producción queda además restringido por licencia.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni resultados de la evaluación interna propuesta (`eval.py --eval all`).

## Comparativa con modelos similares

No se han identificado en la información aportada modelos comparables con datos verificables. La única comparación posible es dentro de la propia serie de experimentos, y en ambos casos la mayoría de las especificaciones no están documentadas:

| Modelo | Parámetros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4-12b-sorrel-selfloop-g10-midtrain (este) | 11,96 mil millones | no disponible | no publicados | internal-research (artefacto privado) | público en HuggingFace, sin redistribución |
| gemma4-12b-sorrel-selfloop-g9-midtrain (predecesor directo) | no disponible | no disponible | no publicados | no disponible | referenciado como modelo base; revisión `b089155d568c` |
| Otros modelos abiertos de ~12B | no disponible | no disponible | no disponible | no disponible | fuera del alcance de la información aportada |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación de capacidades, ni análisis de seguridad publicados. La pérdida de entrenamiento (0,5541 → 0,5374) es una métrica de ajuste al corpus, no una medida de calidad.
- Régimen de entrenamiento muy corto: 8,24 millones de tokens y un único epoch con learning rate 1e-5 implican un cambio de comportamiento presumiblemente limitado y no cuantificado.
- Licencia restrictiva: `license: other` con `license_name: internal-research`. La model card indica explícitamente "Private research artifact — do not redistribute". No hay autorización documentada para uso comercial ni para redistribución de pesos o derivados.
- Riesgo de alucinación: al ser un checkpoint de lenguaje sin alineación documentada (no se mencionan RLHF, DPO ni filtros de seguridad), cabe esperar el comportamiento típico de un modelo base, con propensión a generar contenido plausible pero falso.
- Sesgos: no se documenta ninguna auditoría de sesgos, composición del corpus ni procedencia de los datos de `sorrel-selfloop-corpus`. Una parte del corpus parece generada en bucle por el propio modelo, lo que puede amplificar sesgos y errores de forma acumulativa a lo largo de las generaciones de la serie.
- Idiomas: no se declara ningún idioma soportado, por lo que no puede asumirse cobertura multilingüe ni siquiera un rendimiento fiable en castellano.
- Contexto: se desconoce la ventana máxima de inferencia; los 4096 tokens documentados corresponden únicamente a la longitud de secuencia de entrenamiento.
- Ausencia de cuantizaciones y de formatos GGUF: cualquier despliegue en hardware de consumo exige convertir los pesos por cuenta propia, con el consiguiente riesgo de degradación no medida.
- Trazabilidad de la fecha: los metadatos del repositorio indican creación y actualización el 17 de septiembre de 2026, fecha que conviene verificar antes de citar el artefacto.
- Adopción nula: 0 descargas y 0 *likes* en el momento de redactar esta ficha, sin validación independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma4-12b-sorrel-selfloop-g10-midtrain
- Modelo base (g9): https://huggingface.co/joshycodes/gemma4-12b-sorrel-selfloop-g9-midtrain
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/sorrel-selfloop-corpus
- Configuración completa de la ejecución: archivo `train_run_config.json` en el repositorio del modelo
- Script de evaluación interno: `uv run eval.py --model joshycodes/gemma4-12b-sorrel-selfloop-g10-midtrain --eval all`
- Repositorio `flourishing-training` (commit del launcher `a0afb77669ae`): sin URL pública en la información aportada
- Búsqueda web: no se han encontrado resultados relevantes; las entradas devueltas corresponden a consultas sobre cuentas de correo de Swisscom/Bluewin y no guardan relación con el modelo
