# introvoyz042/gpt-oss-120b

## Resumen

gpt-oss-120b es un modelo de lenguaje de pesos abiertos desarrollado por OpenAI, diseñado para tareas de razonamiento complejo, uso agéntico y aplicaciones de producción. Con 116.829 millones de parámetros totales y solo 5.100 millones activos gracias a su arquitectura de mezcla de expertos (MoE), ofrece un equilibrio entre capacidad y eficiencia computacional. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de copyleft, y está optimizado para ejecutarse en una única GPU de 80 GB (como NVIDIA H100 o AMD MI300X) mediante cuantización MXFP4 post-entrenamiento.

El modelo forma parte de la serie gpt-oss, que incluye también la variante más pequeña gpt-oss-20b. Ambos modelos fueron entrenados con el formato de respuesta harmony, un protocolo que estructura las interacciones y que es imprescindible para su correcto funcionamiento. gpt-oss-120b destaca por ofrecer cadena de pensamiento completa y configurable (esfuerzo de razonamiento bajo, medio o alto), capacidades nativas de function calling, ejecución de código Python, navegación web y salidas estructuradas, lo que lo convierte en una opción sólida para desarrolladores que buscan un modelo abierto con capacidades de razonamiento avanzado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (gpt_oss) |
| Parametros totales | 116.829.156.672 (117B) |
| Parametros activos | 5.100 millones (5.1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (post-entrenamiento), 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

gpt-oss-120b emplea una arquitectura de transformer con mezcla de expertos (MoE), donde solo se activan 5.100 millones de parámetros por token, lo que reduce significativamente el coste computacional en inferencia. El modelo fue entrenado por OpenAI con el formato de respuesta harmony, un esquema de chat estructurado que separa el razonamiento interno de la respuesta final. Además, se aplicó una cuantización MXFP4 post-entrenamiento sobre los pesos de los expertos MoE, lo que permite reducir el uso de memoria sin degradar el rendimiento, según las evaluaciones oficiales. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Razonamiento complejo con cadena de pensamiento completa y accesible, con niveles de esfuerzo configurables (bajo, medio, alto).
- Function calling nativo para integración con herramientas externas.
- Ejecución de código Python y navegación web a través de herramientas integradas.
- Salidas estructuradas (Structured Outputs) para generar JSON u otros formatos validados.
- Capacidades agénticas para tareas multi-paso y uso de herramientas.
- Fine-tuning completo de parámetros para adaptación a casos de uso específicos.
- Soporte multilingüe no especificado en la documentación disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con razonamiento interno, lo que permite resolver consultas complejas y derivar a agentes humanos cuando sea necesario. Su capacidad de function calling facilita la integración con sistemas CRM o bases de conocimiento.
- Generación de código en producción: con soporte para ejecución de Python y razonamiento estructurado, puede utilizarse en pipelines de CI/CD para generar, revisar o refactorizar código, así como para automatizar tareas de desarrollo.
- Agentes autónomos de análisis de datos: combinando navegación web, ejecución de código y razonamiento, el modelo puede recopilar datos, procesarlos y generar informes sin intervención humana.
- Asistente de investigación científica: su cadena de pensamiento completa permite auditar el proceso de razonamiento, lo que resulta útil en entornos donde la trazabilidad es crítica, como la revisión de literatura o el diseño de experimentos.
- Chatbots empresariales con salidas estructuradas: gracias a Structured Outputs, puede integrarse en sistemas que requieren respuestas en formatos específicos (JSON, XML) para alimentar otros servicios.
- Despliegue en entornos con restricciones de hardware: al caber en una GPU de 80 GB con cuantización MXFP4, es viable para empresas que no disponen de clústeres grandes, permitiendo inferencia local de alta calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación oficial menciona que el modelo supera a otros modelos abiertos de tamaño similar en tareas de razonamiento, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada: 80 GB con cuantización MXFP4 (según la documentación oficial).
- GPU recomendadas: NVIDIA H100, AMD MI300X (ambas con 80 GB de memoria).
- En GPUs de consumo: no se especifica, pero la variante gpt-oss-20b cabe en 16 GB; para el modelo de 120B se requiere al menos una GPU de 80 GB o cuantizaciones adicionales no documentadas.
- Opciones de despliegue: Transformers (con kernels optimizados), vLLM (versión pre-release específica), Ollama (para hardware de consumo con cuantización GGUF), LM Studio y PyTorch/Triton mediante implementaciones de referencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| gpt-oss-120b | 117B | 5.1B | no disponible | Apache 2.0 |
| Mixtral 8x22B | 141B | 39B | 64K | Apache 2.0 |
| DeepSeek-V3 | 671B | 37B | 128K | MIT |
| Qwen2.5-MoE | 72B | 3B | 128K | Apache 2.0 |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada. gpt-oss-120b se distingue por su bajo número de parámetros activos en relación con el total, lo que sugiere una alta eficiencia, pero se requieren benchmarks oficiales para una comparación rigurosa.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con el formato de respuesta harmony; usarlo sin este formato puede producir resultados incorrectos o degradados.
- La cadena de pensamiento completa no debe mostrarse a usuarios finales, ya que puede contener razonamientos intermedios no aptos para consumo directo.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, es probable que herede sesgos sociales y culturales.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda validar las salidas en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero se debe cumplir la política de uso de OpenAI (gpt-oss usage policy) que puede imponer restricciones adicionales.
- La longitud de contexto no está especificada en la documentación disponible, lo que dificulta planificar aplicaciones que requieran ventanas largas.

## Enlaces

- [Modelo en Hugging Face (original de OpenAI)](https://huggingface.co/openai/gpt-oss-120b)
- [Modelo en Hugging Face (mirror introvoyz042)](https://huggingface.co/introvoyz042/gpt-oss-120b)
- [Anuncio oficial de OpenAI](https://openai.com/index/introducing-gpt-oss/)
- [Model card oficial](https://openai.com/index/gpt-oss-model-card/)
- [Paper en arXiv](https://arxiv.org/abs/2508.10925)
- [Repositorio GitHub de gpt-oss](https://github.com/openai/gpt-oss)
- [Guías y cookbook de OpenAI](https://cookbook.openai.com/topic/gpt-oss)
- [Página de prueba del modelo](https://gpt-oss.com)
