# mradermacher/Qwen-BioTool-1.5B-GGUF

## Resumen

Qwen-BioTool-1.5B es un modelo de lenguaje de 1.500 millones de parámetros, derivado de la familia Qwen2, especializado en *function calling* y uso de herramientas en el dominio biomédico. El modelo base fue desarrollado por Rumiii y entrenado sobre el dataset BioTool (gxx27/BioTool), que combina instrucciones de llamada a herramientas con contenido biomédico. Esta versión concreta, publicada por mradermacher, es una cuantización en formato GGUF del modelo original, pensada para facilitar su ejecución en entornos con recursos limitados mediante motores como llama.cpp, Ollama o text-generation-inference.

La relevancia de este modelo radica en su tamaño compacto (1.5B), que permite desplegarlo en hardware de consumo, y en su enfoque específico para tareas de automatización de procesos biomédicos, como consulta de bases de datos clínicas, extracción de información de literatura científica o integración con APIs de salud. Al estar cuantizado en GGUF, ofrece múltiples niveles de compresión que ajustan el equilibrio entre calidad y requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2) |
| Parametros totales | 1.543.714.304 (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se hereda de Qwen2, típicamente 32K, pero no confirmado) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen-BioTool-1.5B se construye sobre la arquitectura Qwen2, un transformer decoder con atención causal estándar, aunque no se dispone de detalles específicos sobre el número de capas, cabezas de atención o dimensiones ocultas en la información proporcionada. El entrenamiento se realizó mediante *fine-tuning* supervisado sobre el dataset BioTool, que combina ejemplos de *function calling* con contenido biomédico, probablemente siguiendo el formato de instrucciones de Qwen para tool use. No se menciona el uso de RLHF o DPO en la documentación disponible.

La cuantización GGUF realizada por mradermacher es estática (sin *importance matrix*), generada a partir de los pesos originales en safetensors. Se ofrecen 12 niveles de cuantización, desde Q2_K (0.8 GB) hasta f16 (3.2 GB), lo que permite adaptar el modelo a diferentes capacidades de memoria y requisitos de calidad.

## Capacidades

- Generación de texto en inglés con enfoque biomédico.
- *Function calling* / *tool use*: capacidad de invocar herramientas externas (APIs, bases de datos) siguiendo el formato de Qwen.
- Razonamiento multi-paso para tareas que requieren encadenar llamadas a herramientas.
- Comprensión de terminología médica y biológica gracias al entrenamiento específico en el dataset BioTool.
- Compatible con pipelines de *text-generation-inference* y motores que soporten GGUF (llama.cpp, Ollama, etc.).
- No se especifican capacidades multimodales (visión, audio) ni *thinking mode*.

## Casos de uso

- **Extracción de información de literatura biomédica**: el modelo puede procesar abstracts de artículos científicos y extraer entidades como genes, fármacos o enfermedades, invocando herramientas de anotación o bases de datos como PubChem o GeneCards.
- **Automatización de consultas a APIs de salud**: gracias a su soporte de *function calling*, puede interactuar con APIs de registros médicos electrónicos o servicios de interoperabilidad (HL7/FHIR) para recuperar datos de pacientes o pruebas de laboratorio.
- **Asistente de documentación clínica**: puede generar resúmenes de historias clínicas o redactar informes estructurados a partir de notas médicas, reduciendo la carga administrativa de los profesionales sanitarios.
- **Integración en pipelines de análisis de datos**: al ser un modelo pequeño y cuantizado, puede ejecutarse en servidores de bajo coste o en edge devices para clasificar textos biomédicos, extraer relaciones semánticas o preprocesar datos antes de un modelo más grande.
- **Chatbot de soporte para pacientes**: con un contexto limitado pero suficiente para conversaciones cortas, puede responder preguntas frecuentes sobre medicamentos, síntomas o procedimientos, siempre que se le provea de herramientas de verificación.
- **Prototipado rápido de agentes biomédicos**: su tamaño compacto permite iterar rápidamente en entornos de desarrollo, probando flujos de *tool use* antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base no incluye métricas de MMLU, HumanEval, GSM8K u otros en la documentación proporcionada. Tampoco se ofrecen comparativas con otros modelos en la model card de la cuantización.

## Requisitos de hardware

- **VRAM estimada para inferencia**: según la cuantización elegida, entre 0.8 GB (Q2_K) y 3.2 GB (f16). La mayoría de las cuantizaciones (Q4_K_M, Q5_K_M, Q6_K) requieren entre 1.0 y 1.4 GB, por lo que caben en GPUs de consumo como la NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, o incluso en CPU con suficiente RAM.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM para las cuantizaciones más altas; para f16 se recomienda 4 GB. Modelos como RTX 4090, A100 o H100 son innecesarios para este tamaño, pero funcionarán sin problema.
- **Opciones de despliegue**: llama.cpp, Ollama, text-generation-inference (TGI), llama-cpp-python, o cualquier motor compatible con GGUF. También puede ejecutarse en CPU pura con buen rendimiento gracias a su tamaño reducido.
- **Latencia y throughput**: no se proporcionan datos oficiales, pero para un modelo de 1.5B cuantizado, se espera una generación de decenas de tokens por segundo en GPUs modernas y de 5-15 tokens/s en CPU de gama alta.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría (1.5B especializados en *function calling* biomédico). Alternativas genéricas de tamaño similar como Qwen2.5-1.5B-Instruct o Llama-3.2-1B-Instruct podrían servir de referencia, pero no se han evaluado en el mismo dominio. La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo pequeño, es propenso a generar información incorrecta o inventada, especialmente en dominios médicos donde la precisión es crítica. Siempre debe validarse la salida con fuentes fiables.
- **Idioma**: solo soporta inglés; no está entrenado para otros idiomas, lo que limita su uso en entornos hispanohablantes sin traducción previa.
- **Contexto limitado**: aunque Qwen2 soporta hasta 32K tokens, no se confirma la longitud real de contexto de este fine-tuning. En la práctica, con 1.5B de parámetros, el rendimiento se degrada con contextos muy largos.
- **Licencia**: Apache-2.0 permite uso comercial, pero el dataset BioTool puede tener restricciones adicionales; se recomienda revisar los términos del dataset original.
- **Cuantización estática**: las cuantizaciones GGUF de mradermacher no incluyen *importance matrix* (imatrix), por lo que pueden tener una calidad ligeramente inferior a las versiones con imatrix para el mismo tamaño.
- **Sin garantías clínicas**: el modelo no está validado para uso clínico real; es una herramienta de investigación y desarrollo, no un dispositivo médico.

## Enlaces

- [Modelo cuantizado GGUF en HuggingFace](https://huggingface.co/mradermacher/Qwen-BioTool-1.5B-GGUF)
- [Modelo base Rumiii/Qwen-BioTool-1.5B](https://huggingface.co/Rumiii/Qwen-BioTool-1.5B)
- [Dataset BioTool (gxx27/BioTool)](https://huggingface.co/datasets/gxx27/BioTool)
