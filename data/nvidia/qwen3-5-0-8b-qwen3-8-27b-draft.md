# nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft

## Resumen

NVIDIA Qwen3.5-0.8B-Qwen3.8-27B-Draft es un modelo borrador (draft model) externo para decodificación especulativa, desarrollado por NVIDIA y publicado en Hugging Face el 17 de noviembre de 2026. No es un modelo de lenguaje autónomo pensado para generar respuestas finales, sino un acelerador de inferencia: propone bloques de tokens candidatos que el modelo objetivo Qwen3.8-27B verifica mediante muestreo por rechazo, reduciendo la latencia de decodificación sin alterar la distribución de salida del modelo objetivo.

El modelo se construye sobre Qwen3.5-0.8B (752.393.024 parámetros reales según los pesos en safetensors, 0,75B según la model card) y comparte tokenizador y vocabulario con Qwen3.8-27B, lo que es un requisito imprescindible para que la verificación especulativa sea válida. Se entrenó con NVIDIA Model Optimizer (nvidia-modelopt v0.48.0rc0) en modo de decodificación especulativa externa, y su entrenamiento se realizó a una longitud de secuencia de 12.288 tokens.

Su relevancia actual es práctica: la decodificación especulativa se ha consolidado como una de las técnicas más eficaces para reducir el coste por token en despliegues de producción de modelos grandes, y este checkpoint ofrece un borrador «listo para usar» para un objetivo concreto de la familia Qwen3.8. Está pensado para sistemas de agentes, chatbots y RAG con requisitos de latencia estrictos, y su despliegue previsto es sobre hardware NVIDIA Groq 3 LPU, aunque los checkpoints publicados también cargan en vLLM, SGLang y TRT-LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3_5ForCausalLM), modelo borrador externo para decodificacion especulativa |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenado a 12.288 tokens de secuencia; contexto maximo de inferencia no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el entrenamiento incluyo prompt en aleman, espanol, frances, italiano y japones, ademas de ingles) |
| Licencia | NVIDIA Open Model Agreement (modelo base Qwen3.5-0.8B y objetivo Qwen3.8-27B bajo Apache 2.0) |
| Formato de pesos | safetensors |
| Modelo objetivo | Qwen/Qwen3.8-27B |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Libreria | Model Optimizer (NVIDIA) |
| Tamano del repo | 1,5 GB |
| Fecha de publicacion | 17/11/2026 |
| Version del checkpoint | 1.0 |

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar (Qwen3_5ForCausalLM) de 0,75B parámetros que actúa como borrador externo en un esquema de decodificación especulativa. A diferencia de las cabezas borradoras (draft heads) acopladas al modelo objetivo, este es un modelo de lenguaje completo con su propio tokenizador heredado de Qwen3.8-27B; esa compartición de vocabulario es lo que permite que el objetivo verifique los tokens propuestos sin remapeos. En tiempo de servicio, el borrador muestrea de forma autorregresiva un bloque de tokens candidatos y Qwen3.8-27B los valida por muestreo por rechazo, de modo que la distribución de salida final es idéntica a la del objetivo sin aceleración.

El entrenamiento se realizó con NVIDIA Model Optimizer en modo de decodificación especulativa externa. Los prompts provienen de Nemotron-Post-Training-Dataset-v2 (199.998 conversaciones de un solo turno, muestreadas con semilla fija y en partes iguales entre nueve categorías: STEM, código, matemáticas, chat y multilingüe en alemán, español, francés, italiano y japonés), descartando prompts de más de 3.072 tokens. Las respuestas no se tomaron del dataset: se sintetizaron con Qwen3.8-27B. La señal de entrenamiento es, en cada posición de respuesta, la distribución top-20 del objetivo bajo su política de servicio, de modo que el borrador aprende a imitar la distribución del objetivo en lugar de una respuesta concreta. El volumen total de tokens de entrenamiento se declara en un rango amplio (entre 1.000 millones y 10 billones), sin cifra exacta.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: emite bloques de tokens que el modelo objetivo Qwen3.8-27B verifica por muestreo por rechazo.
- Preservación exacta de la distribución del objetivo: la salida final la produce Qwen3.8-27B, por lo que la aceleración no altera la calidad ni la distribución del texto generado.
- Compatibilidad de tokenizador y vocabulario con Qwen3.8-27B, requisito para la verificación especulativa.
- Cobertura de dominios de prompt: STEM, código, matemáticas, chat y multilingüe (alemán, español, francés, italiano, japonés) según la composición del dataset de entrenamiento.
- No es un modelo de chat autónomo: no está pensado para responder directamente al usuario ni para tool calling, agentes o razonamiento multi-paso por sí mismo. Esas capacidades residen en el modelo objetivo.
- No dispone de visión, audio ni modo de pensamiento (thinking mode) propios.

## Casos de uso

- Aceleración de chatbots de producción: desplegar Qwen3.8-27B con este borrador en vLLM reduce la latencia de decodificación en conversaciones multi-turno, manteniendo la misma distribución de respuesta que el objetivo sin aceleración.
- Sistemas de agentes con requisitos de latencia estrictos: en bucles de agente con muchas llamadas cortas al modelo, la reducción de latencia por token se acumula y mejora el tiempo de respuesta extremo a extremo.
- RAG con contexto largo: el subconjunto throughput-32k de SPEED-Bench (prompts de 33k a 46k tokens) evalúa precisamente este escenario; el borrador está entrenado a 12.288 tokens y su comportamiento más allá de esa longitud debe validarse empíricamente.
- Generación de código asistida: los prompts de código forman parte del entrenamiento, por lo que el borrador propone tokens plausibles en dominios de programación y acelera asistentes de autocompletado sobre Qwen3.8-27B.
- Atención al cliente multilingüe: el entrenamiento incluye prompt en español, alemán, francés, italiano y japonés, lo que hace al borrador adecuado para despliegues en esos idiomas sobre el objetivo.
- Evaluación comparativa de infraestructura de inferencia: sirve como referencia para medir la ganancia real de la decodificación especulativa externa frente a la decodificación estándar en un hardware y una carga dados.
- Despliegue en hardware NVIDIA Groq 3 LPU: es el entorno previsto por el autor, donde el borrador se compila para la LPU y se ejecuta bajo su runtime.

## Benchmarks y rendimiento

El autor declara el uso de SPEED-Bench (subconjuntos qualitative y throughput-32k) como dataset de evaluación, pero no se han publicado resultados numéricos de benchmarks en la información disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 752 millones de parámetros en safetensors, el checkpoint ocupa 1,5 GB en el repositorio; en FP16 serían aproximadamente 1,5 GB de pesos y en cuantización de 8 bits alrededor de 0,75 GB, a lo que hay que sumar caché KV y el coste del modelo objetivo Qwen3.8-27B, que domina el consumo total.
- Hardware de referencia del autor: NVIDIA Groq 3 LPU (Language Processing Unit), microarquitectura NVIDIA Blackwell. Linux como sistema operativo preferido.
- GPU consumer: no disponible. El borrador en sí es pequeño, pero el sistema completo requiere cargar Qwen3.8-27B, lo que condiciona el hardware.
- Motores de despliegue: vLLM es el motor de aceleración declarado; los checkpoints también cargan en SGLang y TRT-LLM.
- Latencia y throughput: no disponibles. La mejora depende del ratio de aceptación del borrador frente al objetivo, que varía por carga y dominio.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este borrador ni de borradores alternativos para Qwen3.8-27B en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A nivel estructural:

| Modelo | Tipo | Parametros | Contexto de entrenamiento | Licencia | Motor |
|---|---|---|---|---|---|
| NVIDIA Qwen3.5-0.8B-Qwen3.8-27B-Draft | Borrador externo (modelo completo) | 0,75B | 12.288 tokens | NVIDIA Open Model Agreement | vLLM, SGLang, TRT-LLM, Groq 3 LPU |
| Qwen3.8-27B | Modelo objetivo | 27B (no confirmado en la informacion) | no disponible | Apache 2.0 | no disponible |
| Qwen3.5-0.8B | Modelo base del borrador | 0,8B | no disponible | Apache 2.0 | no disponible |

No hay disponibles borradores alternativos comparables (por ejemplo, cabezas borradoras acopladas o borradores de otros proveedores para el mismo objetivo) en la información consultada.

## Limitaciones y advertencias

- No es un modelo de propósito general: no debe usarse para generar respuestas finales al usuario; su salida son tokens candidatos que el objetivo debe verificar.
- Acoplamiento estricto al objetivo: requiere el tokenizador de Qwen3.8-27B y está entrenado específicamente para ese modelo; no es reutilizable con otros objetivos sin reentrenamiento.
- Longitud de entrenamiento limitada a 12.288 tokens: el comportamiento con contextos significativamente más largos (el benchmark incluye prompts de 33k a 46k tokens) no está garantizado por el entrenamiento y debe validarse.
- Licencia: el modelo se rige por el NVIDIA Open Model Agreement, no por Apache 2.0; el uso comercial está permitido según el autor, pero conviene revisar los términos completos del acuerdo antes de desplegar.
- Riesgo de alucinación: no aplica de forma directa porque la salida final la produce el objetivo; sin embargo, un ratio de aceptación bajo degrada la ganancia de latencia y puede hacer que la decodificación especulativa sea contraproducente.
- Idiomas: la lista oficial de idiomas soportados no está disponible; el entrenamiento cubre inglés (implícito en las categorías) y prompt en alemán, español, francés, italiano y japonés, sin garantías para otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la información disponible.
- Dependencia de hardware y software: el despliegue previsto es sobre NVIDIA Groq 3 LPU con runtime propietario; en otras plataformas el rendimiento puede diferir del declarado por el autor.
- Madurez: checkpoint versión 1.0 con 7 descargas y 0 likes en el momento de la consulta; no hay evidencia de comunidad ni de validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft
- Modelo objetivo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base (Apache 2.0): https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- NVIDIA Model Optimizer (repositorio): https://github.com/NVIDIA/Model-Optimizer
- Dataset de entrenamiento Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- SPEED-Bench (benchmark citado, sin enlace en la informacion): no disponible
