# jalenluorion/Qwen3.6-35B-A3B-moved-store

## Resumen

Qwen3.6-35B-A3B-moved-store es un derivado experimental del modelo MoE Qwen/Qwen3.6-35B-A3B (Apache-2.0), publicado por el usuario jalenluorion. No es un modelo nuevo: es un reempaquetado que mueve los 10.240 expertos enrutados del modelo base a disco (SSD) en cuantización de 4 bits, manteniendo en memoria solo las capas de atención, expertos compartidos, normas, embeddings, cabeza de salida y las puertas del router originales (2,45B parámetros en bf16). El objetivo es ejecutar un MoE de 35B en Apple Silicon con huella de memoria muy reducida, a costa de lecturas desde almacenamiento.

La innovación central es un conjunto de routers anticipados (0,19B a 0,58B parámetros según variante) entrenados por imitación de los routers originales sobre 120M tokens. Estos routers deciden qué expertos necesitará cada capa con cuatro capas de antelación, de modo que la unidad de disco puede leer los registros (1,77 MB cada uno) mientras se computan las capas intermedias. El repositorio ocupa 26,1 GB y la parte en disco son 16,9 GiB de expertos cuantizados a 4 bits con una escala fp16 y un sesgo por grupo de 64.

El estado del proyecto es explícitamente "work in progress" (20 de noviembre de 2026): faltan mediciones de velocidad en Mac, la brecha de pérdida del store a 4 bits y el runner. No incluye la cabeza de predicción multi-token ni la torre de visión del release original. Es relevante como prueba de concepto de offloading de expertos con enrutado especulativo, no como sustituto listo para producción del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con expertos enrutados offloaded a disco y routers anticipados |
| Parametros totales | 35B aproximadamente (2,45B residentes + 32,2B en expertos + 0,19-0,58B de routers) |
| Parametros activos | no disponible (el modelo base es A3B, ~3B activos; el derivado no lo especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos en disco a 4 bits (escala fp16 + sesgo por grupo de 64); parte residente en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (residente) y binarios propios por capa (store/layer_XX.bin) para MLX |

## Arquitectura y entrenamiento

El modelo base es un MoE con capas de atención, expertos compartidos y expertos enrutados. Este derivado congela todos los pesos liberados y solo entrena los routers anticipados, por imitación de las puertas del router original. Los routers se entrenaron sobre 120M tokens con mezcla de enciclopedia, web, chat, código y transcripciones de agentes/tool-calling. La configuración evaluada nombra 12 expertos por capa cuatro capas antes y los mantiene durante 3 tokens.

La parte residente (2,45B parámetros, bf16) incluye atención, expertos compartidos, normas, embeddings, cabeza de salida y las puertas del router original. Los 10.240 expertos enrutados (32,2B parámetros) se almacenan en 16,9 GiB de disco a 4 bits. El método es el mismo que el del proyecto Qwen3.8-Flash-Next-moved-store, cuyo código está publicado en GitHub. No se especifican detalles de RLHF/DPO ni de la composición exacta del dataset de entrenamiento más allá de las categorías citadas.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.6-35B-A3B, sujetos a la degradación introducida por el enrutado aproximado y la cuantización a 4 bits.
- Soporte de chat multi-turno y conversación, según la mezcla de entrenamiento de los routers (incluye chat).
- Código: los routers se entrenaron con datos de código y la evaluación reporta una brecha de +0,001 nats en code.
- Tool calling y agentes: los routers se entrenaron con transcripciones de agentes/tool-calling, aunque no se documenta soporte formal de function calling en este derivado.
- Multilingüe: no disponible; no se especifican idiomas.
- Sin visión: la torre de visión del release original no está incluida.
- Sin cabeza de predicción multi-token (MTP) del release original.
- Ejecución en Apple Silicon mediante la librería MLX con offloading de expertos a SSD.

## Casos de uso

- Experimentación con offloading de MoE en Apple Silicon: permite estudiar el comportamiento de un MoE de 35B con solo 2,45B parámetros residentes, útil para investigación sobre memoria y latencia en hardware de consumo.
- Prototipado de asistentes conversacionales en Mac: con los routers entrenados sobre chat, se puede desplegar un chat multi-turno local sin GPU dedicada, aceptando latencias mayores por las lecturas de disco.
- Evaluación de enrutado especulativo: sirve para reproducir y medir el método de routers anticipados (4 capas de antelación, 3 tokens de retención) frente al router original.
- Generación de código en local para pruebas: la mezcla de entrenamiento incluye código y la brecha medida es mínima (+0,001 nats), adecuado para tareas de desarrollo no críticas.
- Investigación sobre cuantización de expertos a 4 bits: el formato de registros (1,77 MB, escala fp16 y sesgo por grupo de 64) es un caso de estudio para pipelines de compresión de MoE.
- Pruebas de agentes y tool-calling en entornos de laboratorio: los routers se entrenaron con transcripciones de agentes, lo que permite validar flujos multi-paso sin infraestructura de servidor.
- Benchmarking de I/O de SSD en inferencia: útil para medir el impacto del ancho de banda de almacenamiento en el throughput de un MoE con expertos en disco.

## Benchmarks y rendimiento

Los únicos datos publicados son las brechas de pérdida de los routers anticipados frente al modelo bf16 original, en texto retenido, con 12 expertos por capa nombrados cuatro capas antes y retenidos 3 tokens:

| Conjunto de evaluacion | Brecha (nats) | Notas |
|---|---|---|
| wikitext-103 | +0,004 | 93-97% de la masa de probabilidad del router original ya en memoria |
| FineWeb-Edu | +0,004 | misma configuración |
| Código | +0,001 | misma configuración |
| Chat | dentro del ruido | 32 ventanas |
| Agentes | dentro del ruido | 32 ventanas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni mediciones de velocidad en Mac. La brecha de pérdida del store a 4 bits no está medida.

## Requisitos de hardware

- Memoria residente: 2,45B parámetros en bf16 (aproximadamente 4,9 GB) más los routers (0,19-0,58B parámetros, aproximadamente 0,4-1,2 GB en bf16).
- Almacenamiento: 16,9 GiB de expertos en SSD; el repositorio completo ocupa 26,1 GB.
- Hardware objetivo: Apple Silicon con MLX; no se documentan GPU NVIDIA ni CUDA.
- VRAM en GPU de consumo: no aplicable según la información disponible; el diseño depende de memoria unificada y SSD, no de VRAM dedicada.
- Opciones de despliegue: MLX (librería declarada); el runner aún no está publicado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos todavía según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-moved-store | ~35B (2,45B residentes) | no disponible | Apache-2.0 | Hugging Face, MLX | Derivado experimental con expertos en disco |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B MoE | no disponible | Apache-2.0 | Hugging Face | Modelo original completo, con visión y MTP |
| Qwen3.8-Flash-Next-moved-store | no disponible | no disponible | no disponible | Hugging Face | Mismo método aplicado a otro modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Proyecto en estado work in progress: el runner, las mediciones de velocidad y la brecha de pérdida del store a 4 bits no están publicados.
- Degradación medible frente al modelo original: +0,004 nats en wikitext-103 y FineWeb-Edu, +0,001 nats en código.
- Sin visión ni cabeza de predicción multi-token, a diferencia del release original.
- Dependencia crítica del ancho de banda del SSD: el rendimiento real puede degradarse si el almacenamiento es lento.
- Solo soporte MLX/Apple Silicon documentado; no hay soporte CUDA ni otras plataformas.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Riesgo de alucinación inherente al modelo base, no evaluado en este derivado.
- Sesgos del modelo base heredados sin análisis específico en esta ficha.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de benchmarks y de runner hace desaconsejable su uso en producción.
- Descargas y likes nulos en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jalenluorion/Qwen3.6-35B-A3B-moved-store
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Proyecto previo con el mismo método: https://huggingface.co/jalenluorion/Qwen3.8-Flash-Next-moved-store
- Código del método: https://github.com/jalenluorion/Qwen3.8-Flash-Next-moved-store
