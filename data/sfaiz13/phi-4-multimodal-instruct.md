# sfaiz13/Phi-4-multimodal-instruct

## Resumen

Phi-4-multimodal-instruct es un modelo fundacional multimodal ligero de código abierto desarrollado por Microsoft, que procesa de forma conjunta texto, imagen y audio para generar salidas de texto. Se apoya en la investigación y los datos empleados en las familias Phi-3.5 y Phi-4.0, y destaca por integrar tres modalidades en un único modelo compacto de unos 5.570 millones de parámetros, con una ventana de contexto de 128.000 tokens.

El modelo pasó por un proceso de alineación que incluye ajuste fino supervisado (SFT), optimización de preferencias directas (DPO) y aprendizaje por refuerzo con retroalimentación humana (RLHF), lo que le permite seguir instrucciones con precisión e incorporar medidas de seguridad. Es especialmente relevante para entornos con restricciones de memoria y cómputo, y para escenarios sensibles a la latencia, donde los modelos grandes resultan inviables.

Esta ficha corresponde a un espejo del modelo original publicado por el usuario sfaiz13 en Hugging Face; el modelo original es `microsoft/Phi-4-multimodal-instruct`. Su combinación de reconocimiento de voz, traducción de voz, comprensión visual y razonamiento matemático en un modelo de tamaño reducido lo hace una opción atractiva para desarrolladores que necesitan multimodalidad sin hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (texto + vision + audio), familia Phi-4MM |
| Parametros totales | 5.574.460.384 (dato real de los safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible (hay variante ONNX oficial con cuantizaciones) |
| Idiomas soportados | Texto: ar, zh, cs, da, nl, en, fi, fr, de, he, hu, it, ja, ko, no, pl, pt, ru, es, sv, th, tr, uk. Vision: inglés. Audio: en, zh, de, fr, it, ja, es, pt |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repositorio: 12,8 GB) |

## Arquitectura y entrenamiento

Phi-4-multimodal-instruct es un modelo basado en arquitectura transformer decoder de la familia Phi, extendido con codificadores de visión y de audio sobre el modelo lingüístico base (derivado de Phi-4-mini). Esta extensión permite procesar entradas de texto, imágenes y audio en un único modelo unificado, en lugar de depender de pipelines separados por modalidad. La ficha no detalla el número exacto de tokens de entrenamiento ni la composición del dataset, aunque el modelo aprovecha los datos de investigación en lenguaje, visión y voz empleados para Phi-3.5 y Phi-4.0.

En cuanto al entrenamiento posterior, el modelo incorpora un proceso de mejora con tres componentes: ajuste fino supervisado (SFT) para seguir instrucciones, optimización de preferencias directas (DPO) y aprendizaje por refuerzo con retroalimentación humana (RLHF) para alinear las respuestas con las preferencias humanas y reforzar las medidas de seguridad. Los detalles técnicos completos están disponibles en el informe técnico publicado en arXiv (2503.01743).

## Capacidades

- Generación de texto multilingüe en 23 idiomas, incluido el castellano.
- Razonamiento fuerte, especialmente en matemáticas y lógica; puede resolver ecuaciones presentadas como imágenes.
- Comprensión general de imágenes, incluyendo OCR, comprensión de gráficos y tablas, comparación de múltiples imágenes y resumen de varias imágenes o clips de vídeo.
- Reconocimiento automático de voz (ASR) en 8 idiomas (inglés, chino, alemán, francés, italiano, japonés, español y portugués).
- Traducción de voz y preguntas y respuestas sobre audio (speech QA).
- Resumen de audio y comprensión general de contenido sonoro.
- Function calling y tool calling, según los usos previstos declarados por Microsoft.
- Adecuado como bloque de construcción para sistemas agentivos en escenarios con restricciones de latencia y memoria.
- Ventana de contexto de 128.000 tokens para documentos y conversaciones largas.

## Casos de uso

- Transcripción y traducción de voz en tiempo real: el modelo puede transcribir un audio y traducirlo a otro idioma en una sola pasada, útil para subtitulado o interpretación asistida; soporta español como idioma de audio de entrada.
- Atención al cliente con voz: gracias a sus capacidades de speech QA y resumen de audio, puede construir asistentes telefónicos que entienden la consulta hablada y generan respuestas textuales.
- Análisis de documentos y facturas: el soporte de OCR y comprensión de tablas permite extraer información de imágenes escaneadas sin un modelo de visión independiente.
- Comprensión de gráficos e informes: puede responder preguntas sobre gráficos y comparar varias imágenes, útil en análisis de datos visual y generación de informes.
- Resolución de problemas matemáticos a partir de imágenes: puede procesar ecuaciones fotografiadas y resolverlas, aprovechando su razonamiento matemático reforzado.
- Agentes con tool calling en dispositivos con recursos limitados: su tamaño de 5,6B parámetros y licencia MIT lo hacen adecuado para despliegues locales de flujos agentivos multi-paso.
- Resumen de reuniones grabadas: la capacidad de resumen de audio permite condensar grabaciones largas en actas o puntos clave.
- Aplicaciones edge y móviles: diseñado para entornos con memoria y cómputo restringidos y escenarios sensibles a la latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El informe técnico (arXiv:2503.01743) contiene evaluaciones detalladas del modelo original, pero los números concretos no están incluidos en la informacion proporcionada.

## Requisitos de hardware

- Los pesos ocupan 12,8 GB en el repositorio (safetensors), por lo que para inferencia en precisión completa se estima del orden de 12-16 GB de VRAM, más el consumo de los codificadores de visión y audio; la cifra exacta no está disponible en la informacion proporcionada.
- Una GPU de gama consumidor como la RTX 4090 (24 GB) debería alojar el modelo en precisión completa; con cuantización (por ejemplo, mediante la variante ONNX oficial) podría ejecutarse en GPUs con menos memoria, aunque las cuantizaciones exactas disponibles no están detalladas.
- GPUs recomendadas para producción: no disponible; el modelo original se ofrece vía Azure, NVIDIA y GitHub, lo que sugiere soporte para aceleradores de datacenter.
- Opciones de despliegue: biblioteca `transformers` de Hugging Face (con `custom_code`), variante ONNX oficial (`microsoft/Phi-4-multimodal-instruct-onnx`), y playgrounds en Azure, GitHub, NVIDIA y Hugging Face Spaces. No se menciona soporte específico de vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Contexto | Licencia |
|---|---|---|---|---|
| Phi-4-multimodal-instruct | 5,6B | Texto, imagen, audio | 128K | MIT |
| Qwen2.5-Omni-7B (referencia general) | 7B aprox. | Texto, imagen, audio, vídeo | no disponible en la informacion | Apache 2.0 (referencia general) |
| Gemma 3 4B (referencia general) | 4B | Texto, imagen | no disponible en la informacion | Licencia Gemma |

Nota: los datos de las alternativas se ofrecen como referencia orientativa de la categoria (modelos multimodales ligeros de 4-8B); no proceden de la informacion proporcionada y deberian verificarse antes de tomar decisiones.

## Limitaciones y advertencias

- El modelo no está diseñado ni evaluado para todos los usos finales; Microsoft recomienda evaluar y mitigar precisión, seguridad y equidad antes de usarlo en escenarios de alto riesgo.
- La modalidad de visión solo soporta inglés, lo que limita los casos de OCR y comprensión visual en castellano.
- Como modelo lingüístico, puede alucinar contenido y presentar sesgos heredados de los datos de entrenamiento; el rendimiento varía entre idiomas.
- Debe cumplirse la legislación aplicable (incluidas normativas de privacidad y protección de datos) en cada despliegue, según advierte la model card original.
- Esta ficha corresponde a un espejo de terceros (sfaiz13) con 31 descargas; para producción se recomienda usar el repositorio oficial de Microsoft.
- El uso de `custom_code` en transformers implica ejecutar código del repositorio, lo que requiere `trust_remote_code=True` y una revisión previa del código.
- La model card original está truncada en la informacion proporcionada, por lo que algunas advertencias de licencia y seguridad pueden no estar recogidas aquí.

## Enlaces

- Repositorio (espejo): https://huggingface.co/sfaiz13/Phi-4-multimodal-instruct
- Repositorio oficial: https://huggingface.co/microsoft/Phi-4-multimodal-instruct
- Variante ONNX oficial: https://huggingface.co/microsoft/Phi-4-multimodal-instruct-onnx
- Informe técnico: https://arxiv.org/abs/2503.01743
- Blog de Microsoft: https://aka.ms/phi4-feb2025
- Phi Portal (Azure): https://aka.ms/phi-4-multimodal/azure
- Phi Cookbook: https://github.com/microsoft/PhiCookBook
- Playground en GitHub: https://github.com/marketplace/models/azureml/Phi-4-multimodal-instruct/playground
- Playground en Hugging Face: https://huggingface.co/spaces/microsoft/phi-4-multimodal
- Playground en NVIDIA: https://aka.ms/phi-4-multimodal/nvidia
- Space Thoughts Organizer: https://huggingface.co/spaces/microsoft/ThoughtsOrganizer
- Space Stories Come Alive: https://huggingface.co/spaces/microsoft/StoriesComeAlive
- Space Phine Speech Translator: https://huggingface.co/spaces/microsoft/PhineSpeechTranslator
- Licencia: https://huggingface.co/microsoft/Phi-4-multimodal-instruct/resolve/main/LICENSE
