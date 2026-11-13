# FINAL-Bench/Darwin-28B-REASON

## Resumen

Darwin-28B-REASON es un modelo de razonamiento de 27,6 mil millones de parámetros publicado por FINAL-Bench (VIDRAFT) bajo licencia Apache 2.0. Se construye sobre Darwin-28B-Opus, el modelo de la familia Darwin que la propia organización sitúa en tercera posición global de GPQA entre modelos abiertos, y añade una etapa de destilación de trazas de razonamiento (Reasoning-Trace Distillation, RTD) que produce un modelo autónomo, sin adaptadores externos. La arquitectura declarada es `Qwen3_5ForConditionalGeneration` con atención híbrida (lineal y completa en proporción 3:1), 64 capas, vocabulario de 248.320 tokens y una ventana de contexto de 262.144 tokens.

El modelo está pensado para razonamiento científico de nivel graduado y cadenas de pensamiento largas. Su resultado más destacado es un 89,39 % de precisión en GPQA Diamond, aunque ese número corresponde a la combinación del modelo con Darwin-DELPHI, un motor de razonamiento en tiempo de inferencia que no forma parte de los pesos publicados. Esta distinción es importante para cualquiera que evalúe el modelo: el rendimiento en crudo del checkpoint, sin ese motor propietario, no se documenta de forma separada.

La relevancia actual del modelo reside en su enfoque: en lugar de entrenar desde cero, aplica destilación de trazas sobre una base ya ajustada y la publica como pesos completos en BF16 (55,1 GB de repositorio) con licencia permisiva. Está etiquetado como multilingüe con soporte declarado de inglés, chino, coreano y japonés, y admite entrada image-text-to-text según los tags del repositorio, aunque la ruta de texto es la documentada explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (`Qwen3_5ForConditionalGeneration`), atención lineal + atención completa con intervalo 4 (3:1) |
| Parametros totales | 26.895.998.464 (≈26,9 B; la model card declara 27,6 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Inglés, chino, coreano, japonés, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Capas | 64 |
| Tamano de vocabulario | 248.320 |
| Precision de referencia | bfloat16 |
| Tamano del repositorio | 55,1 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer híbrida en la que tres de cada cuatro capas usan atención lineal y la cuarta usa atención completa (`full_attention_interval = 4`), sobre un total de 64 capas. Esta combinación reduce el coste computacional en contextos largos manteniendo la capacidad de atención global, algo coherente con la ventana de 262.144 tokens declarada y con el enfoque en cadenas de razonamiento extensas. El vocabulario es amplio (248.320 tokens), lo que sugiere cobertura multilingüe amplia y tokenización eficiente en los idiomas soportados.

El entrenamiento parte de Darwin-28B-Opus y aplica Reasoning-Trace Distillation: se destilan cadenas de razonamiento completas procedentes de un corpus matemático público con licencia Apache 2.0 sobre la base ya ajustada, generando un modelo autónomo con pesos completos. La model card menciona además Darwin-DELPHI, un motor de consenso en tiempo de inferencia que no se almacena en los pesos y que se aplica en la fase de evaluación para alcanzar el 89,39 % en GPQA Diamond. La familia Darwin se apoya en la técnica de fusión evolutiva con ponderación por confianza MRI, descrita en el paper arXiv:2605.14386. No se detalla el volumen total de tokens de entrenamiento ni la composición completa del dataset más allá de la referencia al corpus matemático.

## Capacidades

- Generación de texto y razonamiento avanzado con cadenas de pensamiento explícitas (modo thinking), orientado a problemas científicos y matemáticos de nivel graduado.
- Razonamiento matemático mediante destilación de trazas sobre corpus matemático.
- Razonamiento multi-paso con soporte de contexto largo (hasta 262.144 tokens), adecuado para cadenas de pensamiento extensas y documentos largos.
- Capacidad multimodal declarada a través del pipeline image-text-to-text y la arquitectura `Qwen3_5ForConditionalGeneration`, aunque la ruta de texto es la documentada explícitamente (`language_model_only`).
- Soporte multilingüe: inglés, chino, coreano y japonés, con etiqueta genérica multilingüe.
- Conversación multi-turno (tag `conversational`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento científico asistido: el modelo puede resolver preguntas de nivel posgrado en física, química y biología, un escenario para el que está explícitamente optimizado y en el que declara 89,39 % en GPQA Diamond con Darwin-DELPHI.
- Tutoría y explicación de problemas matemáticos: la destilación de trazas de razonamiento permite generar cadenas de solución paso a paso, útil en plataformas educativas que necesitan mostrar el procedimiento y no solo la respuesta.
- Análisis de documentación técnica extensa: con 262.144 tokens de contexto puede procesar manuales, papers o bases de código completas en una sola pasada, manteniendo coherencia entre secciones distantes.
- Investigación asistida y revisión de literatura: la combinación de contexto largo y razonamiento multi-paso permite resumir y contrastar múltiples artículos, señalando contradicciones entre fuentes.
- Generación de documentación multilingüe: el soporte de inglés, chino, coreano y japonés facilita la localización de contenido técnico entre esos mercados sin pipelines separados.
- Evaluación comparativa de modelos de razonamiento: al publicarse con licencia Apache 2.0 y pesos completos, sirve como referencia reproducible en bancos de pruebas internos centrados en GPQA y tareas de razonamiento científico.
- Despliegue en entornos con requisitos de licencia permisiva: su licencia Apache 2.0 permite integración en productos comerciales sin las restricciones de modelos con licencias de investigación.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Darwin-28B-REASON | Referencia indicada por el autor |
|---|---|---|---|
| GPQA Diamond | Accuracy | 89,39 % (con Darwin-DELPHI) | Darwin-28B-Opus: 88,89 %; Darwin-36B-Opus: 88,4 %; Darwin-27B-Opus: 86,9 %; Darwin-9B-NEG: 84,3 % |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) ni del modelo sin el motor Darwin-DELPHI.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un nodo con 80 GB o más para contexto largo.
- Cuantización a 8 bits: alrededor de 27 GB de pesos, viable en GPUs de 40-48 GB (A100 40GB, L40S, RTX 6000 Ada) con margen limitado para contexto.
- Cuantización a 4 bits: alrededor de 14-16 GB de pesos, lo que permitiría ejecución en RTX 4090 (24 GB) con contexto moderado; no se documentan ficheros GGUF oficiales en la información disponible.
- GPU recomendadas: H100 80GB o A100 80GB para BF16 con contexto largo; A100 40GB o L40S para 8 bits.
- ¿Cabe en GPU de consumo? En BF16 no; en 4 bits podría caber en RTX 4090 o RTX 3090, sujeto a la disponibilidad de cuantizaciones (no confirmada).
- Opciones de despliegue: transformers (librería declarada). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-28B-REASON | ≈26,9 B (27,6 B declarados) | 262.144 | 89,39 % (con Darwin-DELPHI) | Apache 2.0 | Pesos safetensors en HF |
| Darwin-28B-Opus | No disponible | No disponible | 88,89 % | No disponible en la información | Pesos en HF |
| Darwin-36B-Opus | No disponible | No disponible | 88,4 % | No disponible en la información | Pesos en HF |
| Darwin-9B-NEG | No disponible | No disponible | 84,3 % | No disponible en la información | Pesos en HF |

No se dispone de datos de modelos de otros desarrolladores (Qwen, Llama, DeepSeek u otros) en la información proporcionada para establecer una comparación cruzada fiable.

## Limitaciones y advertencias

- El resultado de 89,39 % en GPQA Diamond se obtiene con Darwin-DELPHI, un motor de razonamiento en tiempo de inferencia propietario que no se incluye en los pesos publicados; el rendimiento del checkpoint aislado no se documenta.
- Los benchmarks son declarados por el autor y figuran como no verificados (`verified: false`); conviene tratarlos como indicativos hasta una evaluación independiente.
- Riesgo de alucinación: no se documentan tasas de alucinación ni evaluaciones de fidelidad; en tareas de razonamiento científico el modelo puede producir cadenas plausibles con conclusiones incorrectas.
- Sesgos: no se publica información sobre sesgos demográficos, culturales o lingüísticos ni sobre procesos de alineación (RLHF/DPO) más allá de la destilación de trazas.
- Cobertura idiomática: aunque se etiqueta como multilingüe, solo se declaran explícitamente inglés, chino, coreano y japonés; el rendimiento en castellano no está documentado.
- La model card menciona capacidades image-text-to-text, pero la ruta documentada es de solo texto (`language_model_only`); la multimodalidad no está detallada.
- Requisitos de hardware elevados: BF16 exige en torno a 54 GB solo para pesos, lo que limita el despliegue a GPUs de datacenter salvo cuantización.
- No se documentan ficheros GGUF oficiales ni soporte confirmado de motores de inferencia como vLLM o llama.cpp.
- Aunque la licencia Apache 2.0 permite uso comercial, el motor Darwin-DELPHI tiene carácter propietario y sus condiciones de uso no se detallan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-28B-REASON
- Modelo base Darwin-28B-Opus: https://huggingface.co/FINAL-Bench/Darwin-28B-Opus
- Darwin-36B-Opus: https://huggingface.co/FINAL-Bench/Darwin-36B-Opus
- Darwin-27B-Opus: https://huggingface.co/FINAL-Bench/Darwin-27B-Opus
- Darwin-9B-NEG: https://huggingface.co/FINAL-Bench/Darwin-9B-NEG
- Colección de la familia Darwin: https://huggingface.co/collections/FINAL-Bench/darwin-family
- Leaderboard FINAL Bench: https://huggingface.co/spaces/FINAL-Bench/Leaderboard
- Paper de la técnica MRI: https://huggingface.co/papers/2605.14386
- Demo en CPU (familia POCKET): https://huggingface.co/spaces/FINAL-Bench/POCKET-35B-CPU
