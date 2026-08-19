# HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive es un fine-tuning del modelo base Qwen/Qwen3.6-35B-A3B de Alibaba, publicado por el usuario HauhauCS en abril de 2026. Se trata de una variante que elimina deliberadamente los filtros de contenido del modelo original, ofreciendo respuestas sin rechazos en una amplia gama de solicitudes. El modelo es multimodal, ya que acepta tanto texto como imágenes como entrada, y está disponible en formato GGUF, lo que facilita su despliegue en entornos de consumo con recursos limitados.

La relevancia de este modelo radica en su combinación de arquitectura MoE (mixture-of-experts) con 35 mil millones de parámetros totales y solo 3 mil millones activos, lo que permite una inferencia eficiente incluso en GPUs de gama media. Su ventana de contexto de 262.144 tokens lo hace adecuado para tareas que requieren procesar documentos extensos o conversaciones de larga duración. El etiquetado "uncensored" y "aggressive" indica que los guardarraíles han sido deliberadamente relajados, lo que lo convierte en una opción controvertida pero demandada por ciertos sectores de la comunidad.

Según los datos disponibles, el modelo ha acumulado más de 2,2 millones de descargas y 3.417 likes en Hugging Face, lo que refleja un interés significativo. La licencia declarada en los metadatos es Apache-2.0, aunque el campo específico de licencia en la ficha de Hugging Face figura como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.6-35B-A3B |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF (incluye cuantizaciones K_P, se mencionan variantes de baja precision para 6 GB de VRAM) |
| Idiomas soportados | no disponible (el modelo base Qwen3.6 soporta ingles, chino y otros idiomas, pero no se especifica para esta variante) |
| Licencia | Apache-2.0 (segun tags de Hugging Face; el campo licencia figura como "no disponible") |
| Formato de pesos | GGUF (safetensors no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.6-35B-A3B, un transformer MoE con 35B de parametros totales y 3B activos por token. Esta configuracion permite un equilibrio entre capacidad y eficiencia computacional, ya que solo una fraccion de los expertos se activa en cada paso de inferencia. El modelo original de Alibaba incorpora capacidades multimodales (vision y texto) y una ventana de contexto ampliada a 262.144 tokens.

El fine-tuning realizado por HauhauCS se centra en eliminar los mecanismos de rechazo y filtrado de contenido del modelo base. Segun los resultados de busqueda, el modelo alcanza una tasa de 0 rechazos en 465 prompts de prueba, sin perdida aparente de capacidades. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados o si se emplearon tecnicas como RLHF o DPO. El proceso de cuantizacion se realizo con imatrix, segun los tags, lo que sugiere un calibrado de cuantizacion basado en datos de activacion.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del modelo base Qwen3.6, incluyendo razonamiento complejo y generacion de codigo.
- Procesamiento multimodal: acepta imagenes como entrada adicional al texto, lo que permite tareas de vision por computador (descripcion de imagenes, OCR, analisis visual).
- Tool calling y function calling: soportado por el modelo base, aunque no se confirma explicitamente en esta variante.
- Capacidades multilingues: el modelo base soporta ingles, chino y otros idiomas; esta variante no especifica cambios en este aspecto.
- Ausencia de filtros de contenido: el modelo no rechaza solicitudes que el modelo base rechazaria, lo que incluye contenido explicito, violencia, etc.
- Ventana de contexto larga: 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Despliegue eficiente: gracias a la arquitectura MoE con 3B activos, puede ejecutarse en GPUs con 6 GB de VRAM en cuantizaciones bajas.

## Casos de uso

- Asistente local sin restricciones: usuarios que desean un asistente personal que no imponga censura en temas como politica, religion o contenido para adultos, ejecutable en hardware de consumo.
- Procesamiento de documentos largos: analisis de contratos, informes o libros completos gracias a la ventana de contexto de 262K tokens, sin necesidad de dividir el texto.
- Generacion de codigo en entornos sin conexion: integracion en IDEs o pipelines de CI/CD locales donde se requiere un modelo que no dependa de APIs externas y que pueda manejar prompts largos con contexto de proyecto.
- Investigacion academica sobre sesgos y alineacion: estudio de como se comporta un modelo sin guardarrailes en comparacion con su version alineada, util para investigacion en seguridad de IA.
- Creacion de contenido creativo sin filtros: escritura de ficcion, guiones o dialogos que requieran explorar temas tabu o lenguaje explicito.
- Analisis multimodal de imagenes en entornos restringidos: extraccion de informacion de imagenes medicas o tecnicas donde el acceso a la nube no es viable, combinando vision y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los datos de busqueda mencionan una tasa de 0 rechazos en 465 prompts de prueba y "cero perdida de capacidades", pero no se proporcionan metricas estandar como MMLU, HumanEval o GSM8K. Se recomienda consultar el repositorio de Hugging Face para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada: segun los resultados de busqueda, el modelo puede ejecutarse con 6 GB de VRAM en cuantizaciones bajas (probablemente Q4_K_M o inferior). Para cuantizaciones mas altas (Q8 o FP16) se necesitarian 12-16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, o GPUs de datacenter como A100 o H100 para mayor throughput.
- Compatibilidad con consumer GPU: si, gracias a la arquitectura MoE con 3B activos y a las cuantizaciones GGUF.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Tambien es compatible con endpoints (segun tags "endpoints_compatible").
- Latencia y throughput: no disponibles. Se espera una latencia moderada en consumer GPUs debido a los 3B activos, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B total, 3B activo | 262K | Apache-2.0 | safetensors, GGUF | Modelo original con filtros de contenido |
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 35B total, 3B activo | 262K | Apache-2.0 | GGUF | Variante sin filtros, multimodal |
| Llama 3.1 8B Instruct | 8B denso | 128K | Llama 3.1 | safetensors, GGUF | Menor tamano, sin multimodal, con filtros |

No se dispone de comparativas con otros modelos uncensored de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de guardarrailes: el modelo puede generar contenido explicito, violento, ilegal o danino. No es adecuado para aplicaciones comerciales que requieran moderacion de contenido.
- Riesgo de alucinacion: al igual que otros modelos de su clase, puede inventar informacion, especialmente en temas especializados o con prompts ambiguos.
- Sesgos: el fine-tuning puede haber amplificado sesgos presentes en el modelo base, y la falta de alineacion puede hacer que estos sesgos se manifiesten de forma mas directa.
- Limitaciones de idioma: aunque el modelo base soporta varios idiomas, no se ha verificado el rendimiento de esta variante en idiomas distintos de ingles y chino.
- Licencia: aunque los tags indican Apache-2.0, el campo de licencia en Hugging Face figura como "no disponible". Se recomienda verificar los terminos exactos antes de uso comercial.
- Riesgo de uso indebido: la naturaleza "uncensored" puede facilitar la generacion de contenido fraudulento, suplantacion o desinformacion. El despliegue en produccion debe considerar estos riesgos.
- Sin garantias de rendimiento: no hay benchmarks publicados, por lo que el rendimiento real en tareas especificas es incierto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive)
- [Articulo en HackerNoon](https://hackernoon.com/qwen36-35b-a3b-uncensored-a-35b-moe-model-with-262k-context)
- [Ficha en ThinkLLM](https://thinkllm.dev/models/qwen3-6-35b-a3b-uncensored-hauhaucs-aggressive)
- [Articulo en CSDN (en chino)](https://blog.csdn.net/weixin_41961749/article/details/161501525)
- [Articulo en TokenFeed](https://tokenfeed.ai/uncensored-qwen36-arrives-0-refusals-full-capability)
