# potteryrage/Thomson-1.0-Small-Q6_K-GGUF

## Resumen

Thomson-1.0-Small es un modelo de lenguaje de gran tamaño desarrollado por Thomson Reuters, una de las mayores proveedoras de información y soluciones tecnológicas para el sector legal y financiero. Según el artículo de Artificial Lawyer, la compañía lanzó Thomson 1.0 en agosto de 2026 como su propio LLM, entrenado con datos propios y con un rendimiento superior al de algunos modelos generalistas en tareas especializadas. Este repositorio concreto contiene una conversión a formato GGUF del modelo original, realizada por el usuario potteryrage mediante la herramienta GGUF-my-repo de llama.cpp, lo que permite ejecutarlo con herramientas como llama.cpp, llama-server u Ollama en entornos locales.

El modelo base, Thomson-1.0-Small, tiene aproximadamente 34.660 millones de parámetros (34,66B), lo que lo sitúa en la gama de modelos de tamaño medio-grande. La conversión a GGUF con cuantización Q6_K reduce el peso del archivo a unos 28,5 GB, facilitando su despliegue en hardware de consumo o en servidores con VRAM limitada. La licencia es Polyform Strict 1.0.0, una licencia permisiva para uso no comercial pero con restricciones para aplicaciones comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Polyform Strict 1.0.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información técnica detallada sobre la arquitectura del modelo base en la documentación proporcionada. El modelo original, Thomson-1.0-Small, está alojado en Hugging Face bajo el nombre `thomsonreuters/Thomson-1.0-Small`, y su model card menciona un informe técnico titulado "Thomson: Continual Learning of Frontier Models for SovereignAI", lo que sugiere que el entrenamiento se realizó mediante aprendizaje continuo sobre datos propietarios de Thomson Reuters, probablemente con un enfoque en dominios legales y financieros. Sin embargo, no se especifican detalles como el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO.

La conversión a GGUF no modifica la arquitectura subyacente; simplemente reempaqueta los pesos en un formato optimizado para inferencia con llama.cpp y bibliotecas compatibles.

## Capacidades

No se ha publicado una lista exhaustiva de capacidades en la información disponible. Según el artículo de Artificial Lawyer, Thomson 1.0 está diseñado para el sector legal y muestra un rendimiento superior a algunos modelos generalistas en tareas especializadas. Se puede inferir que el modelo es capaz de:

- Generación de texto en lenguaje natural, con posible especialización en terminología legal y financiera.
- Razonamiento sobre documentos extensos, aunque se desconoce la longitud de contexto exacta.
- Posible soporte para tareas de análisis y redacción de documentos legales, aunque no hay confirmación oficial.

No se dispone de información sobre soporte de tool calling, capacidades multimodales o modos de razonamiento explícito.

## Casos de uso

Dado el origen del modelo, los casos de uso más probables se centran en el ámbito legal y profesional, aunque no hay documentación oficial que los confirme. A continuación se proponen aplicaciones realistas basadas en el perfil del modelo:

- Revisión y análisis de contratos: el modelo puede procesar cláusulas contractuales, identificar riesgos y sugerir modificaciones, aprovechando su entrenamiento en datos legales propietarios.
- Búsqueda semántica de jurisprudencia: al comprender consultas en lenguaje natural, puede recuperar sentencias y documentos relevantes de bases de datos jurídicas.
- Redacción asistida de documentos legales: generación de borradores de escritos, demandas o informes con estructura y terminología adecuadas.
- Resumen de expedientes y dictámenes: condensar largos documentos legales en resúmenes ejecutivos para abogados y equipos legales.
- Asistencia en due diligence: extracción de información clave de contratos y acuerdos en procesos de fusión y adquisición.
- Chatbot interno para consultas legales: responder preguntas frecuentes sobre normativa o procedimientos internos de una organización.

Estos casos son hipotéticos y dependen de las capacidades reales del modelo, que no han sido verificadas en la documentación disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo de Artificial Lawyer menciona que el rendimiento es superior al de algunos modelos generalistas, pero no proporciona cifras concretas. Por tanto, no es posible presentar una tabla comparativa.

## Requisitos de hardware

- El archivo GGUF Q6_K pesa aproximadamente 28,5 GB, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos en RAM o VRAM.
- Para inferencia en GPU, se recomienda una tarjeta con al menos 32 GB de VRAM, como una NVIDIA A100, RTX A6000 o similar. En GPUs de consumo como RTX 4090 (24 GB) no cabría el modelo completo en Q6_K; sería necesario usar cuantizaciones más bajas o descargar parte de los pesos a CPU.
- En CPU, se puede ejecutar con llama.cpp usando suficiente RAM (32 GB o más), aunque la velocidad será menor.
- Herramientas de despliegue compatibles: llama.cpp (CLI y servidor), llama-server, Ollama (si se convierte a formato compatible), y cualquier biblioteca que soporte GGUF como llama-cpp-python.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de tamaño similar (por ejemplo, Llama 3 34B o Mixtral 8x22B). No hay datos de rendimiento ni especificaciones técnicas del modelo base que permitan una comparación objetiva.

## Limitaciones y advertencias

- Licencia restrictiva: Polyform Strict 1.0.0 permite uso no comercial, pero prohíbe el uso comercial sin permiso explícito de Thomson Reuters. Esto limita su adopción en entornos empresariales.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un modelo entrenado con datos propietarios, podría tener sesgos hacia el ámbito legal anglosajón.
- La longitud de contexto no está documentada, por lo que no se puede garantizar un rendimiento adecuado en documentos muy largos.
- Al ser una conversión de un modelo propietario, no hay garantía de que el modelo original esté disponible públicamente con todos sus detalles técnicos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/potteryrage/Thomson-1.0-Small-Q6_K-GGUF
- Modelo base: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Artículo de Artificial Lawyer sobre Thomson 1.0: https://www.artificiallawyer.com/2026/08/24/tr-launches-thomson-1-0-its-own-llm/
