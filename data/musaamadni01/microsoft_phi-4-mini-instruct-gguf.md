# musaamadni01/microsoft_Phi-4-mini-instruct-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `microsoft/Phi-4-mini-instruct`, un modelo de lenguaje instructivo de 3.836 millones de parámetros desarrollado por Microsoft. La cuantización ha sido realizada por bartowski utilizando llama.cpp en su versión b4792, con la opción `imatrix` y un dataset específico para mejorar la calidad de la cuantización. El resultado es una colección de archivos GGUF en distintos niveles de precisión (desde Q2_K_L hasta Q8_0) que permiten ejecutar el modelo en hardware local con diferentes equilibrios entre tamaño, velocidad y fidelidad.

La relevancia de este repositorio radica en que facilita el despliegue del modelo Phi-4-mini-instruct en entornos de producción o desarrollo sin necesidad de GPUs de gran capacidad, gracias a la compresión de pesos. Es una opción práctica para desarrolladores que buscan un modelo instructivo de tamaño medio con soporte para múltiples cuantizaciones y compatibilidad con herramientas como LM Studio o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: microsoft/Phi-4-mini-instruct) |
| Parametros totales | 3.836.021.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q3_K_XL, Q4_K_S, Q4_0, IQ4_NL, Q3_K_L, IQ4_XS, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XS, Q2_K_L |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo original ni su proceso de entrenamiento. Se sabe que es una cuantización del modelo `microsoft/Phi-4-mini-instruct`, que pertenece a la familia Phi de Microsoft. El proceso de cuantización fue realizado con llama.cpp b4792 utilizando la opción `imatrix` (importance matrix) con un dataset público, lo que optimiza la distribución de pesos durante la compresión. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset ni técnicas de alineación (RLHF, DPO, etc.) del modelo base.

## Capacidades

- Generacion de texto: al ser un modelo instructivo, puede generar respuestas coherentes a partir de instrucciones en lenguaje natural.
- Seguimiento de instrucciones: el formato de prompt `<|system|>...<|end|><|user|>...<|end|><|assistant|>` indica soporte para conversaciones multi-turno y system prompts.
- Ejecucion local: las cuantizaciones GGUF permiten ejecutar el modelo en CPU o GPU con recursos limitados.
- Compatibilidad con herramientas: funciona con llama.cpp, LM Studio y cualquier proyecto basado en llama.cpp.
- No se especifican capacidades adicionales como tool calling, vision, audio o razonamiento avanzado en la informacion disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede integrarse en aplicaciones de chat privadas o de escritorio usando LM Studio o llama.cpp, ofreciendo respuestas sin depender de servicios en la nube. Su tamano de 2-4 GB lo hace adecuado para portatiles con 8 GB de RAM.
- Generacion de borradores de contenido: redaccion de correos, articulos o resumenes en entornos donde la privacidad de los datos es critica, ejecutandose en un equipo local.
- Prototipado rapido de aplicaciones NLP: los desarrolladores pueden probar el modelo con diferentes cuantizaciones para evaluar el equilibrio entre velocidad y calidad antes de decidir el despliegue final.
- Educacion y experimentacion: estudiantes e investigadores pueden analizar el comportamiento de un modelo de 3.8B cuantizado sin necesidad de infraestructura costosa.
- Integracion en pipelines de automatizacion: mediante la API de llama.cpp, se puede usar el modelo para tareas de clasificacion de texto, extraccion de informacion o generacion de respuestas estandarizadas en scripts.
- Desarrollo de chatbots para soporte interno: empresas pueden desplegar un asistente virtual basado en este modelo en servidores modestos, aprovechando el formato GGUF para cargar el modelo directamente en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el archivo GGUF, las cuantizaciones van desde ~1.8 GB (Q2_K_L) hasta ~4.1 GB (Q8_0). Para cargar el modelo en GPU se recomienda al menos 2 GB de VRAM para las cuantizaciones mas pequenas y 6 GB para las de mayor precision, considerando overhead de contexto.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4090) puede ejecutar las cuantizaciones Q4_K_M o menores. Para Q8_0 se recomienda una GPU con 8 GB o mas.
- CPU: las cuantizaciones Q4_0 y Q4_1 ofrecen soporte para inferencia en CPU con repacking online para arquitecturas ARM y AVX.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (si se importa el GGUF), o servidores compatibles con la API de llama.cpp.
- Latencia y throughput: no se proporcionan datos concretos; dependen del hardware y la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de informacion comparativa en el repositorio. Modelos de tamano similar como Llama-3.2-3B o Qwen2.5-3B podrian ser alternativas, pero no hay datos de rendimiento para establecer una comparacion objetiva.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una cuantizacion de un modelo base no documentado, no se conocen los sesgos especificos ni la tasa de alucinacion. Se recomienda validar las respuestas en aplicaciones criticas.
- Perdida de calidad por cuantizacion: las cuantizaciones mas bajas (Q2, Q3) pueden degradar significativamente la coherencia y la precision del modelo.
- Licencia incierta: la licencia no esta especificada en el repositorio; el modelo original de Microsoft puede tener restricciones de uso comercial. Verificar antes de usar en produccion.
- Contexto limitado: no se indica la longitud de contexto soportada; es probable que sea la del modelo original (128K tokens segun documentacion de Microsoft, pero no confirmado aqui), aunque las cuantizaciones pueden reducir la ventana util por memoria.
- Sin garantias de soporte: el repositorio es una cuantizacion de terceros, no un release oficial de Microsoft. Puede haber errores de conversion o incompatibilidades con ciertas versiones de llama.cpp.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/musaamadni01/microsoft_Phi-4-mini-instruct-GGUF
- Modelo original: https://huggingface.co/microsoft/Phi-4-mini-instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
