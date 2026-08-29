# ashutoshpanigrahiofc/boss-v1.3

## Resumen

BOSS v1.3 es un asistente de inteligencia artificial conversacional desarrollado por Ashutosh Panigrahi (Vector Logic, India) como un fine-tuning del modelo Qwen3-0.6B. Su objetivo declarado es ofrecer un asistente 100 % offline y privado para dispositivos móviles, con un tamaño reducido que permite su ejecución en hardware de gama baja. El modelo se presenta como "India's First 100% Offline AI Assistant" y está optimizado para tareas de instrucción, seguridad, privacidad, identidad y tool calling.

Con aproximadamente 596 millones de parámetros, BOSS v1.3 se posiciona en la categoría de small language models (SLM) para edge AI. El autor afirma haber alcanzado un 100 % de precisión en siete categorías de benchmarks propias, aunque estos resultados no han sido verificados de forma independiente. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en cuantizaciones GGUF (Q3_K_M, Q4_K_M, Q5_K_M) para su uso con llama.cpp y Ollama, además de pesos safetensors para Transformers.

La relevancia de este modelo radica en su enfoque en la privacidad y el despliegue local, un nicho creciente en el ecosistema de IA generativa. Sin embargo, su tamaño reducido y el volumen limitado de datos de entrenamiento (1.597 ejemplos) condicionan sus capacidades reales frente a modelos más grandes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen3-0.6B, no confirmada en la ficha) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M (llama.cpp) |
| Idiomas soportados | Ingles (principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

BOSS v1.3 se basa en la arquitectura transformer densa de Qwen3-0.6B, un modelo de lenguaje pequeño de la familia Qwen3. El fine-tuning se realizó mediante QLoRA con cuantización de 4 bits, lo que permite un ajuste eficiente en términos de memoria. El conjunto de entrenamiento consta de 1.597 ejemplos, cubriendo instrucciones, seguridad, privacidad, identidad y tool calling. El método empleado es supervisado (SFT), sin indicios de uso de RLHF o DPO.

La cuantización posterior se llevó a cabo con llama.cpp, generando las variantes Lite (Q3_K_M), Pro (Q4_K_M) y Ultra (Q5_K_M). El modelo utiliza la plantilla de chat de Qwen3 (ChatML) para el formato de conversación. No se han documentado innovaciones técnicas adicionales más allá del fine-tuning estándar.

## Capacidades

- Generacion de texto conversacional: mantiene diálogos multi-turno siguiendo la plantilla ChatML de Qwen3.
- Tool calling: el autor afirma soporte para llamadas a herramientas, aunque no se detallan los formatos ni la implementación.
- Seguridad y rechazo: entrenado para rechazar solicitudes peligrosas o inapropiadas (safety refusal).
- Identidad propia: se identifica como "BOSS AI" tras el ajuste de identidad en v1.3.
- Privacidad: funciona completamente offline, sin necesidad de conexión a internet.
- Multilingüismo limitado: la ficha indica inglés como idioma principal; la versión v1.1 mencionaba soporte de hinglish, pero no se confirma en v1.3.

## Casos de uso

- Asistente personal offline en moviles: el modelo puede ejecutarse en teléfonos con 2-8 GB de RAM (según la variante), ofreciendo respuestas a preguntas frecuentes, recordatorios o información general sin conexión.
- Atencion al cliente en entornos sin conectividad: empresas con redes aisladas o zonas rurales pueden desplegar un chatbot básico para consultas estándar, aprovechando el bajo consumo de recursos.
- Prototipado de agentes con tool calling: gracias a su soporte declarado de tool calling, sirve para experimentar con pipelines de agentes en entornos de desarrollo locales.
- Educacion y demostraciones de SLM: útil para enseñar conceptos de fine-tuning, cuantización y despliegue en edge AI en cursos o talleres.
- Aplicaciones de privacidad estricta: sectores como salud o banca pueden usar el modelo para procesar texto sensible sin enviar datos a la nube, aunque con capacidades limitadas.
- Pruebas de integracion con llama.cpp y Ollama: su formato GGUF permite validar flujos de trabajo de inferencia local en diferentes plataformas.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en su model card, sin especificar la metodología ni el conjunto de datos de evaluación:

| Categoria | Puntuacion |
|---|---|
| Tool Calling | 100 % |
| Safety Refusal | 100 % |
| Capabilities | 100 % |
| General | 100 % |
| Privacy | 100 % |
| Identity | 100 % |
| Security | 100 % |

Estos datos son auto-reportados y no han sido verificados de forma independiente. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 330 MB y 425 MB según la cuantización (Q3_K_M, Q4_K_M, Q5_K_M), lo que permite ejecución en CPU o GPU con muy poca memoria.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060) o incluso integradas modernas. También funciona en CPU.
- Compatibilidad con consumer GPU: sí, es viable en GPUs de gama baja y en dispositivos móviles con 2-8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, Hugging Face Transformers (con safetensors), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible en la información proporcionada; se espera baja latencia en CPU moderna dado el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BOSS v1.3 | 596 M | No disponible | Apache 2.0 | GGUF, safetensors |
| Qwen3-0.6B (base) | 596 M | 32k (según documentación de Qwen3) | Apache 2.0 | safetensors, GGUF |
| TinyLlama 1.1B | 1.1 B | 2k | Apache 2.0 | safetensors, GGUF |
| Phi-3-mini | 3.8 B | 4k | MIT | safetensors, GGUF |

BOSS v1.3 se diferencia de su base Qwen3-0.6B por el fine-tuning específico para asistencia offline y tool calling, aunque con un conjunto de datos muy reducido. Frente a alternativas como TinyLlama o Phi-3-mini, ofrece un tamaño menor y un enfoque en privacidad, pero con capacidades generales presumiblemente inferiores debido a su menor escala y entrenamiento limitado.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de 0.6B entrenado con solo 1.597 ejemplos, es probable que presente alucinaciones frecuentes y falta de precisión factual en temas complejos.
- Benchmarks no verificados: los resultados de 100 % son auto-reportados y carecen de validación externa; deben interpretarse con cautela.
- Limitaciones de idioma: la ficha indica inglés como idioma principal; el soporte multilingüe es limitado o inexistente en v1.3.
- Contexto limitado: no se especifica la longitud de contexto, aunque se hereda de Qwen3-0.6B (32k); sin embargo, el fine-tuning podría haberla reducido.
- Datos de entrenamiento escasos: 1.597 ejemplos es un volumen muy bajo para tareas generales, lo que limita la generalización.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo puede no ser adecuado para producción sin una evaluación exhaustiva.
- Dependencia de la plantilla de Qwen3: requiere el uso correcto del formato ChatML para un comportamiento óptimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashutoshpanigrahiofc/boss-v1.3
- Versión v1.1: https://huggingface.co/ashutoshpanigrahiofc/boss-v1.1
- Repositorio GitHub: https://github.com/AshutoshRGR/boss
- Sitio web del proyecto: https://boss.vectorlogic.in
