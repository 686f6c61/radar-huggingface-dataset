# mradermacher/MedSafetyLM-1-GGUF

## Resumen

MedSafetyLM-1-GGUF es una colección de cuantizaciones GGUF del modelo HealthSafetyLM-BR, desarrollado por Larxel y cuantizado por mradermacher. El modelo base está orientado a tareas de seguridad y moderación de contenido en el dominio médico, como indica su nombre y los tags asociados (medical, safety, content-moderation). Esta versión GGUF permite ejecutar el modelo en entornos con recursos limitados, como equipos de consumo o servidores sin GPUs de alta gama, utilizando motores de inferencia como llama.cpp, Ollama o LM Studio.

El modelo base tiene 3.880.263.168 parámetros (aproximadamente 3,88 mil millones), lo que lo sitúa en la gama de modelos medianos. La cuantización estática ofrecida incluye desde Q2_K hasta f16, con tamaños de archivo que van desde 1,8 GB hasta 7,9 GB, lo que facilita su despliegue en una amplia variedad de hardware. La licencia es "other", por lo que es necesario revisar los términos específicos del modelo base antes de su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en HealthSafetyLM-BR, presumiblemente transformer) |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | other (consultar modelo base) |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base HealthSafetyLM-BR. Los tags de HuggingFace indican que fue entrenado con QLoRA, una tecnica de fine-tuning de bajo rango que reduce los requisitos de memoria. El modelo esta disenado para tareas de seguridad y moderacion de contenido medico, lo que sugiere que fue afinado sobre un corpus especializado en ese dominio. Sin embargo, no se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO.

Esta version GGUF es una cuantizacion estatica realizada por mradermacher, que convierte los pesos originales a formatos de menor precision para reducir el tamano y acelerar la inferencia. No se incluyen cuantizaciones con imatrix en el momento de la publicacion, segun indica el autor.

## Capacidades

- Moderacion de contenido medico: el modelo esta orientado a identificar y filtrar contenido potencialmente peligroso o inapropiado en contextos de salud.
- Clasificacion de seguridad: puede utilizarse para evaluar respuestas generadas por otros modelos en el dominio medico.
- Soporte de conversacion: al ser un modelo de lenguaje, puede mantener dialogos multi-turno, aunque su especializacion principal es la seguridad.
- Multilingue: solo se declara soporte para ingles (en).
- No se especifican capacidades de tool calling, agentes, vision ni audio en la documentacion disponible.

## Casos de uso

- Moderacion de respuestas en chatbots de salud: integrar el modelo como capa de filtrado para detectar consejos medicos no seguros o contenido perjudicial antes de que llegue al usuario final.
- Revision de contenido generado por IA en plataformas de telemedicina: evaluar automaticamente si las respuestas de un asistente virtual cumplen con las directrices de seguridad medica.
- Clasificacion de documentos clinicos: etiquetar textos medicos segun su nivel de riesgo o sensibilidad para su posterior revision humana.
- Filtrado de foros y comunidades de salud: detectar publicaciones que contengan informacion medica erronea o peligrosa.
- Auditoria de modelos de lenguaje en entornos sanitarios: usar el modelo como evaluador de seguridad en pipelines de desarrollo de LLMs especializados en salud.
- Investigacion academica: analizar la eficacia de modelos de moderacion de contenido medico en comparacion con otros enfoques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo o su version base.

## Requisitos de hardware

- VRAM estimada: segun el archivo GGUF elegido, se necesitan aproximadamente entre 2 y 8 GB de VRAM para cargar el modelo en memoria. Por ejemplo, Q4_K_M (2,6 GB) puede ejecutarse en GPUs con 4 GB de VRAM, mientras que f16 (7,9 GB) requiere al menos 8-10 GB.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o Metal, como NVIDIA RTX 3060, RTX 4060, RTX 4090, o Apple Silicon con suficiente memoria unificada.
- Compatibilidad con consumer GPU: si, las cuantizaciones Q4 y Q5 son adecuadas para GPUs de gama media con 4-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier motor compatible con GGUF.
- Latencia y throughput: no se dispone de mediciones oficiales. En general, las cuantizaciones Q4_K_M ofrecen un buen equilibrio entre velocidad y calidad en hardware consumer.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de moderacion de contenido medico. El modelo base HealthSafetyLM-BR no tiene una ficha publica detallada, y no se conocen alternativas directas en el mismo segmento con datos comparables.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado especificamente para seguridad medica, puede presentar un sesgo conservador, rechazando contenido que en realidad es seguro o util.
- Alucinacion: como cualquier LLM, puede generar respuestas incorrectas o inventadas, especialmente en dominios especializados como la medicina.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, por lo que puede ser limitada en comparacion con modelos modernos.
- Idioma: solo soporta ingles, lo que restringe su uso en entornos hispanohablantes.
- Licencia: la licencia "other" del modelo base requiere una revision cuidadosa antes de su uso comercial. No se garantiza que sea de codigo abierto.
- Cuantizacion: las versiones de menor precision (Q2_K, Q3) pueden degradar significativamente la calidad de las respuestas. Se recomienda usar Q4_K_M o superior para tareas criticas.

## Enlaces

- Repositorio HuggingFace de MedSafetyLM-1-GGUF: https://huggingface.co/mradermacher/MedSafetyLM-1-GGUF
- Modelo base HealthSafetyLM-BR: https://huggingface.co/Larxel/HealthSafetyLM-BR
- Guia de uso de GGUF de TheBloke (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
