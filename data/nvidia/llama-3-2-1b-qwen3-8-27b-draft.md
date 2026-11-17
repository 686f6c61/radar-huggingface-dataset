# nvidia/Llama-3.2-1B-Qwen3.8-27B-Draft

## Resumen

NVIDIA Llama-3.2-1B-Qwen3.8-27B-Draft es un modelo borrador (draft model) externo para decodificación especulativa, desarrollado por NVIDIA con su herramienta Model Optimizer. No es un modelo de lenguaje autónomo pensado para uso directo, sino un componente de aceleración: propone bloques de tokens candidatos que el modelo objetivo Qwen3.8-27B verifica mediante muestreo por rechazo, reduciendo la latencia de decodificación sin alterar la distribución de salida del objetivo. Se construye sobre la arquitectura de Llama-3.2-1B (1.481.705.472 parámetros) pero con las matrices de embedding y de salida reconstruidas contra el vocabulario de Qwen3.8-27B, compartiendo tokenizador con el objetivo.

La relevancia de este checkpoint es doble. Por un lado, es una pieza práctica para despliegues de Qwen3.8-27B en los que la latencia de decodificación es crítica (agentes, chatbots, RAG). Por otro, sirve como referencia técnica de transferencia entre tokenizadores distintos (cross-tokenizer transfer), un problema habitual al emparejar un borrador pequeño con un objetivo de vocabulario diferente. El modelo se entrenó con nvidia-modelopt v0.48.0rc0 y está publicado bajo la NVIDIA Open Model Agreement, con uso comercial permitido.

El contexto declarado alcanza los 128K tokens. El modelo está pensado para ejecutarse sobre hardware NVIDIA, con mención explícita a NVIDIA Blackwell y a las LPU Groq 3 en la model card, y con vLLM como motor de inferencia de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (`LlamaForCausalLM`), borrador externo para decodificación especulativa |
| Parametros totales | 1.481.705.472 (1,48B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 128K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el entrenamiento incluyó prompts en alemán, español, francés, italiano y japonés, además de inglés) |
| Licencia | NVIDIA Open Model Agreement (con sujeciones adicionales: Llama 3.2 Community License para la base Llama-3.2-1B y Apache 2.0 para Qwen3.8-27B) |
| Formato de pesos | safetensors (tamaño del repo: 3,0 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer tipo Llama de 1,48B parámetros que actúa como borrador externo en un esquema de decodificación especulativa. A diferencia de un draft head acoplado al objetivo, es un modelo de lenguaje completo que comparte tokenizador y vocabulario con Qwen3.8-27B; sus matrices de embedding y de salida se reconstruyeron contra el vocabulario del objetivo, lo que lo convierte en un caso de referencia para transferencia entre tokenizadores. En tiempo de servicio, el borrador muestrea de forma autorregresiva un bloque de tokens candidatos bajo la política de servicio del objetivo (temperatura 1.0, top-k 20, top-p 0.95), y Qwen3.8-27B los verifica por muestreo por rechazo, de modo que la distribución de salida final no cambia.

El entrenamiento se realizó con NVIDIA Model Optimizer v0.48.0rc0 en modo de decodificación especulativa externa. Los datos provienen de Nemotron-Post-Training-Dataset-v2, del que solo se tomaron los prompts: 199.998 conversaciones de un solo turno, muestreadas con semilla fija y en proporciones iguales entre nueve categorías (STEM, código, matemáticas, chat y multilingüe en alemán, español, francés, italiano y japonés). Se descartaron prompts de más de 3.072 tokens. Las respuestas fueron sintetizadas por Qwen3.8-27B, y para cada posición de respuesta se registró la distribución top-20 del objetivo bajo su política de servicio; esa distribución es la señal de entrenamiento. El volumen de datos de texto se declara en el rango de 1.000 millones a 10 billones de tokens.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3.8-27B, con verificación por rechazo en el modelo objetivo.
- Compartición de tokenizador y vocabulario con Qwen3.8-27B, lo que permite emparejarlo directamente sin remapeo en tiempo de servicio.
- Alineación con la distribución de salida del objetivo en cada posición de respuesta (top-20 bajo temperatura 1.0, top-k 20, top-p 0.95).
- Cobertura de dominios de prompt: STEM, código, matemáticas, chat y multilingüe (alemán, español, francés, italiano, japonés).
- Soporte de contexto largo en el borrador, hasta 128K tokens, alineado con el objetivo.
- No es un modelo para uso conversacional directo ni para tool calling, agentes o razonamiento autónomo por sí mismo: su función es acelerar al objetivo.

## Casos de uso

- Aceleración de agentes conversacionales sobre Qwen3.8-27B: el borrador propone bloques de tokens que el objetivo verifica, reduciendo la latencia de decodificación en diálogos multi-turno sin cambiar las respuestas finales.
- Chatbots de atención al cliente con Qwen3.8-27B: al mantener la distribución de salida del objetivo, se puede desplegar el borrador para bajar el tiempo por token en conversaciones de producción con contexto largo.
- Sistemas RAG con prompts de decenas de miles de tokens: el subconjunto throughput-32k de SPEED-Bench (prompts de 33k a 46k tokens) refleja el escenario típico de recuperación aumentada, donde el borrador reduce el coste de decodificación.
- Generación de código asistida: el entrenamiento incluye la categoría de código de Nemotron-Post-Training-Dataset-v2, por lo que el borrador está alineado con las distribuciones del objetivo en ese dominio.
- Razonamiento matemático y STEM en pipelines por lotes: útil cuando se ejecutan muchas consultas sobre Qwen3.8-27B y el cuello de botella es la latencia de decodificación, no el prefill.
- Evaluación de transferencia entre tokenizadores: sirve como referencia para investigar cómo adaptar un borrador pequeño a un objetivo con vocabulario distinto, reconstruyendo embedding y matriz de salida.
- Despliegue en hardware NVIDIA Blackwell o LPU Groq 3: la model card indica que el destino previsto es la compilación para LPU Groq 3, con carga también en vLLM, SGLang y TRT-LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el uso de SPEED-Bench (subconjuntos qualitative y throughput-32k) como conjunto de evaluación, con 1.138 turnos de conversación en el subconjunto cualitativo y 1.536 prompts de un solo turno de 33k a 46k tokens en el de throughput, pero no se proporcionan cifras de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,48B parámetros en safetensors y un repo de 3,0 GB, en FP16 el peso ronda los 3 GB, y en cuantizaciones de 8 y 4 bits sería inferior, aunque no se documentan cuantizaciones publicadas.
- GPU recomendadas: la model card cita NVIDIA Blackwell como microarquitectura compatible y NVIDIA Groq 3 LPU como hardware de prueba y destino previsto de compilación.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; por tamaño de parámetros sería viable en GPUs de consumo con suficiente VRAM, pero no se documenta soporte.
- Opciones de despliegue: vLLM como motor de referencia; la model card indica que los checkpoints también cargan en SGLang y TRT-LLM.
- Sistema operativo preferido: Linux.
- Latencia y throughput estimados: no disponibles; la mejora depende del objetivo Qwen3.8-27B y de la tasa de aceptación del borrador, que no se publica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA Llama-3.2-1B-Qwen3.8-27B-Draft | 1,48B | 128K | Borrador externo para Qwen3.8-27B | NVIDIA Open Model Agreement | Hugging Face (nvidia) |
| Qwen3.8-27B (objetivo) | 27B (no confirmado en la información) | No disponible | Modelo de lenguaje completo | Apache 2.0 | Hugging Face (Qwen) |
| Llama-3.2-1B (base del borrador) | 1,23B (aproximado, no confirmado) | No disponible | Modelo de lenguaje pequeño | Llama 3.2 Community License | Hugging Face (meta-llama) |

No se dispone de otros borradores externos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no debe usarse para generación directa ni para evaluar calidad lingüística por sí solo; su salida solo tiene sentido verificada por Qwen3.8-27B.
- La aceleración efectiva depende de la tasa de aceptación del borrador, que no se publica; en dominios alejados de los datos de entrenamiento (STEM, código, matemáticas, chat y cinco idiomas) el beneficio puede reducirse.
- El entrenamiento usó prompts de hasta 3.072 tokens; el comportamiento del borrador en contextos mucho más largos (hasta 128K) no está documentado con métricas.
- La model card no detalla sesgos conocidos ni evaluación de alucinación del borrador; al heredar la distribución del objetivo, los sesgos del objetivo se mantienen.
- Restricciones de licencia: el uso se rige por la NVIDIA Open Model Agreement, con la Llama 3.2 Community License para la base Llama-3.2-1B y Apache 2.0 para Qwen3.8-27B; es necesario revisar las tres antes de un despliegue comercial.
- El destino previsto es hardware NVIDIA (Blackwell y LPU Groq 3); el rendimiento en otras plataformas no está documentado.
- La información sobre idiomas soportados y cuantizaciones no está disponible, lo que limita la planificación de despliegues multilingües o de bajo consumo de memoria.
- El modelo tiene muy poca tracción pública (8 descargas, 0 likes en el momento de la consulta), por lo que la validación comunitaria es prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Llama-3.2-1B-Qwen3.8-27B-Draft
- NVIDIA Model Optimizer (GitHub): https://github.com/NVIDIA/Model-Optimizer
- NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Llama 3.2 Community License: https://huggingface.co/meta-llama/Llama-3.2-1B/blob/main/LICENSE
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Modelo base Llama-3.2-1B: https://huggingface.co/meta-llama/Llama-3.2-1B
- Modelo objetivo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Paper de referencia (arXiv:2407.21783): https://arxiv.org/abs/2407.21783
