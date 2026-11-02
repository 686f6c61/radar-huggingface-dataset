# ReliquaryForge/teutonic-rl-async-v1-step-00000158

## Resumen

Teutonic-I Reliquary SFT (identificador `ReliquaryForge/teutonic-rl-async-v1-step-00000158`) es un modelo de lenguaje de 8.600 millones de parametros publicado por ReliquaryForge, un equipo ligado a la competicion de mejora de modelos abiertos de Bittensor (subred 81). Se trata de un ajuste fino supervisado (SFT) con destilacion desde un modelo profesor de mayor tamano, Qwen3.8-27B, sobre una base hibrida procedente de la subred 3 de Bittensor (Teutonic-I) a la que se le injerto la atencion softmax de Qwen3.5-9B-Base.

El modelo resuelve el problema de obtener un asistente de razonamiento y uso agentico de ~9B parametros con ventana de contexto larga (entrenado a 64k tokens) y modo de pensamiento explicito, partiendo de una arquitectura hibrida que combina capas gated-DeltaNet con atencion completa. La relevancia actual radica en que demuestra la viabilidad de reciclar pesos de una competicion descentralizada e injertar mecanismos de atencion de un modelo denso conocido para obtener una arquitectura estandar (`Qwen3_5ForCausalLM`) compatible con el ecosistema transformers.

La ficha corresponde a un checkpoint intermedio de un pipeline de RL asincrono (paso 158), con licencia Apache-2.0 y pesos en safetensors de bfloat16. El repositorio ocupa 17,9 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` hibrida: 32 capas (24 gated-DeltaNet + 8 atencion softmax completa) |
| Parametros totales | 8.953.803.264 (~8,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenado a 64k tokens; ejemplos de QA sobre documentos de 16k-57k tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es una hibrida de 32 capas: 24 capas gated-DeltaNet (un mecanismo de espacio de estados con compuertas, sucesor de DeltaNet) y 8 capas de atencion softmax completa. El linaje es relevante: Teutonic-I, preentrenado en la competicion de la subred 3 de Bittensor, tenia 8 mezcladores de tokens GLA (en las capas 3, 7, ..., 31) que fueron sustituidos por la atencion softmax de Qwen3.5-9B-Base y posteriormente "curados" entrenando solo esas capas sobre 50 millones de tokens de texto plano. El resto de componentes (embeddings, MLPs y las 24 capas gated-DeltaNet) provienen de Teutonic-I. El vocabulario es de 248.320 tokens y los pesos se distribuyen en bfloat16.

El post-entrenamiento lo realizo Reliquary mediante destilacion supervisada desde Qwen3.8-27B con modo de pensamiento. La primera fase consistio en una epoca sobre la mezcla `full-v2` (4.470 millones de tokens objetivo: matematicas 38 %, codigo 25 %, ciencia 14 %, general 11 %, agentico 8,4 %) con learning rate 4e-5 y scheduler coseno. La segunda fase anadio una pasada sobre 7.659 ejemplos de QA sobre documentos largos (documentos de 16k a 57k tokens, con preguntas y respuestas generadas por el profesor) mas 56 millones de tokens de replay de `full-v2`, con learning rate 1e-5. La plantilla de chat esta incluida en el repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat incluida.
- Razonamiento con modo de pensamiento explicito (thinking mode), heredado de la destilacion desde Qwen3.8-27B.
- Razonamiento matematico, reforzado por el 38 % de la mezcla de entrenamiento dedicado a matematicas.
- Generacion y comprension de codigo (25 % de la mezcla de entrenamiento).
- Conocimiento cientifico (14 % de la mezcla).
- Capacidades agenticas y de uso de herramientas (8,4 % de la mezcla etiquetado como agentico), aunque la model card no detalla el formato exacto de tool calling.
- Procesamiento de contexto largo: QA sobre documentos de hasta 57k tokens, con entrenamiento a 64k.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Analisis de documentos largos: el modelo se entreno especificamente con 7.659 ejemplos de QA sobre documentos de 16k a 57k tokens, por lo que es adecuado para resumir contratos, informes tecnicos o expedientes que superen la ventana tipica de 8k-32k de otros modelos de su tamano.
- Asistente de razonamiento paso a paso: el modo de pensamiento permite integrarlo en flujos donde se requiere justificar la respuesta, como tutoria tecnica o verificacion de calculos, mostrando la cadena de razonamiento antes de la respuesta final.
- Generacion de codigo asistida: con un 25 % del entrenamiento dedicado a codigo, puede emplearse en autocompletado, generacion de tests o explicacion de fragmentos dentro de un IDE o pipeline de CI/CD.
- Resolucion de problemas matematicos: el 38 % de la mezcla de matematicas lo hace util para plataformas educativas o validacion de expresiones simbolicas y calculos financieros.
- Agentes de multiples pasos: la fraccion agentica del entrenamiento sugiere uso en orquestacion de tareas con llamadas a herramientas, aunque conviene validar el formato de function calling antes de produccion.
- Destilacion o generacion de datos sinteticos: al ser un modelo destilado de un profesor de 27B, puede servir como generador de trazas de razonamiento para entrenar modelos mas pequenos.
- Despliegue en infraestructura propia: al tener 8,6B parametros densos y licencia Apache-2.0, es viable alojarlo en una unica GPU de 24 GB con cuantizacion de 8 bits o en 48-80 GB en bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 17,9 GB solo para pesos, mas cache KV y activaciones; se recomienda un minimo de 24 GB y 40-48 GB para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB de pesos; con contexto de 64k la cache KV de las 8 capas de atencion completa puede anadir varios GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB de pesos, aunque la cuantizacion de capas gated-DeltaNet puede requerir soporte especifico del runtime.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bfloat16 con contexto largo; RTX 4090 (24 GB) para bfloat16 con contexto moderado o cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con cuantizacion o contexto reducido; en GPUs de 16 GB solo con cuantizacion agresiva y posible perdida de soporte por la arquitectura hibrida.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI si soportan `Qwen3_5ForCausalLM` con capas gated-DeltaNet; llama.cpp/Ollama requeririan conversion a GGUF con soporte para dichas capas, no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Teutonic-I Reliquary SFT (este) | ~8,6B | 64k (entrenamiento) | Hibrida DeltaNet + atencion | Apache-2.0 | Checkpoint de RL asincrono, sin benchmarks publicados |
| Qwen3.5-9B-Base | ~9B | No disponible | Transformer denso | Apache-2.0 (segun model card) | Base del injerto de atencion; referencia directa |
| Qwen3.8-27B | ~27B | No disponible | Transformer denso | No disponible | Profesor de la destilacion; mayor coste de inferencia |
| Teutonic-I (dendriteholdings) | ~8,6B | No disponible | Hibrida con 8 capas GLA | Apache-2.0 (segun model card) | Preentrenamiento original en Bittensor Subnet 3 |

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 158) de un pipeline de RL asincrono; puede no representar el estado final ni estar completamente convergido.
- No hay benchmarks publicados: el rendimiento real frente a Qwen3.5-9B-Base o modelos de su clase no esta validado de forma independiente.
- La card no documenta los idiomas soportados; el entrenamiento se describe en ingles y no hay garantia de calidad multilingue.
- Riesgo de alucinacion propio de un modelo destilado de 9B, especialmente en dominios fuera de matematicas, codigo y ciencia.
- La cuantizacion de las capas gated-DeltaNet puede no estar soportada por todas las herramientas (llama.cpp, Ollama), lo que limita el despliegue en entornos de bajos recursos.
- El formato exacto de tool calling y de la plantilla de chat debe verificarse en el repositorio antes de integrarlo en produccion.
- Aunque la licencia es Apache-2.0, el modelo modifica pesos de Teutonic-I y Qwen3.5-9B-Base; conviene revisar las condiciones de ambos linajes para uso comercial.
- El repositorio no registra descargas ni validacion de la comunidad, por lo que la reproducibilidad y el soporte son limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReliquaryForge/teutonic-rl-async-v1-step-00000158
- Modelo base de preentrenamiento: https://huggingface.co/dendriteholdings/Teutonic-I
- Modelo base del injerto de atencion: https://huggingface.co/Qwen/Qwen3.5-9B-Base
