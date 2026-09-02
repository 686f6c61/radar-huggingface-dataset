# NANI-Nithin/Ornith-1.5-9B-GGUF

## Resumen

Ornith-1.5-9B-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo Ornith-1.5-9B, desarrollado por ornith-ai. Se trata de un modelo de lenguaje denso de 9.197 millones de parámetros perteneciente a la familia Qwen3.5, con una arquitectura híbrida que combina atención lineal (Gated DeltaNet) y atención completa, junto con codificación posicional MRoPE. Esta versión GGUF, publicada por NANI-Nithin, permite ejecutar el modelo en hardware de consumo mediante runtimes compatibles con llama.cpp, como LM Studio, Ollama o KoboldCpp.

La relevancia de esta publicación radica en que acerca un modelo orientado a generación de código y razonamiento agéntico a entornos locales, con un abanico de cuantizaciones que van desde Q2_K hasta Q8_0, incluyendo variantes IQ. El repositorio incluye 18 archivos de cuantización diferentes, lo que permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible. La licencia Apache 2.0 facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 32 capas, atención lineal Gated DeltaNet + atención completa, MRoPE |
| Parametros totales | 9.197.093.888 |
| Parametros activos | No aplica (arquitectura densa, sin expertos enrutados) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_M, IQ4_XS, IQ4_NL |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

La arquitectura de Ornith-1.5-9B se basa en un transformer de 32 capas con un diseño híbrido de atención: combina capas de atención lineal basadas en Gated DeltaNet con capas de atención completa, lo que reduce el coste computacional en secuencias largas manteniendo la capacidad de modelado de dependencias a corto plazo. La codificación posicional emplea MRoPE, una variante de RoPE adaptada a esta familia de modelos. El modelo es denso, sin mezcla de expertos.

No se dispone de información detallada sobre el proceso de entrenamiento en la documentación proporcionada. Se sabe que Ornith-1.5 extiende la versión 1.0 con un enfoque de auto-mejora, según fuentes externas, pero no se especifican el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card del repositorio GGUF indica que la configuración original anunciaba una capa MTP (next-token prediction) que no está presente en los pesos publicados, por lo que se parcheó la metadata para que coincidiera con los tensores reales.

## Capacidades

- Generación de texto en inglés, con especial énfasis en tareas de programación y razonamiento lógico.
- Razonamiento agéntico y multi-paso, según las descripciones del modelo base.
- Soporte de tool calling y function calling no confirmado explícitamente en la documentación, aunque se infiere por su orientación a agentes.
- La versión GGUF es exclusivamente de texto; no incluye capacidades multimodales aunque el modelo base pudiera tenerlas.
- Compatible con runtimes GGUF estándar: llama.cpp, LM Studio, Ollama (importación), KoboldCpp.

## Casos de uso

- Asistente de programación local: el modelo puede completar código, explicar fragmentos y depurar errores directamente en el editor, sin necesidad de conexión a internet. Con cuantizaciones como Q4_K_M, cabe en GPUs de 8 GB, lo que permite su uso en estaciones de trabajo convencionales.
- Generación de código en pipelines de CI/CD: gracias a su capacidad de razonamiento, puede integrarse en flujos automatizados para generar tests unitarios, documentación o parches, siempre que se valide su salida con herramientas externas.
- Chat conversacional en inglés para atención al cliente: su licencia Apache 2.0 permite su despliegue en entornos comerciales, y su tamaño moderado facilita el alojamiento en servidores con una sola GPU.
- Prototipado rápido de aplicaciones de IA: al poder ejecutarse en portátiles con 16 GB de RAM (según el blog de atomic.chat), es adecuado para desarrolladores que necesitan experimentar con modelos de razonamiento sin depender de APIs externas.
- Educación y formación en IA: al ser un modelo abierto y cuantizado, sirve como herramienta didáctica para enseñar conceptos de generación de texto, atención y cuantización.
- Automatización de tareas de procesamiento de lenguaje natural: resumen de documentos, extracción de entidades o clasificación de texto en inglés, aprovechando su capacidad de razonamiento para tareas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni las fuentes web consultadas ofrecen cifras de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas. Se recomienda consultar el repositorio del modelo base para futuras actualizaciones.

## Requisitos de hardware

- Según el blog de atomic.chat, el modelo cabe en una GPU de 8 GB o en un Mac con 16 GB de RAM utilizando cuantización de 4 bits (por ejemplo, Q4_K_M).
- Para cuantizaciones más altas como Q8_0, se estima que se necesitan al menos 10-12 GB de VRAM, aunque no se dispone del tamaño exacto de cada archivo.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (importación de GGUF), KoboldCpp.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de tamaño similar (por ejemplo, Llama 3.1 8B o Qwen2.5 7B) en la información consultada. Aunque estructuralmente comparte la familia Qwen3.5, no hay datos de rendimiento que permitan una comparación objetiva. Se recomienda ejecutar benchmarks propios si se necesita evaluar su idoneidad frente a alternativas.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; su rendimiento en otros idiomas será limitado o nulo.
- La versión GGUF es solo texto; cualquier capacidad multimodal del modelo base no está disponible en estos archivos.
- La capa MTP anunciada en la configuración original no está presente en los pesos; la metadata fue parcheada para evitar errores de carga, pero esto implica que la funcionalidad de predicción de siguiente token adicional no existe.
- Las cuantizaciones de baja precisión (Q2_K, IQ2_M) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos en inglés, puede reflejar sesgos culturales y lingüísticos de ese corpus.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/NANI-Nithin/Ornith-1.5-9B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Guía de ejecución local (atomic.chat): https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Reseña en AI Indigo: https://aiindigo.com/tool/ornith-15-9b-gguf
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ornith-1.5-9b-gguf-ornith-ai
