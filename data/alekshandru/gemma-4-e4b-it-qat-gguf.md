# alekshandru/gemma-4-E4B-it-qat-GGUF

## Resumen

Gemma 4 E4B es un modelo de lenguaje multimodal desarrollado por Google DeepMind, parte de la familia Gemma 4 lanzada en 2026. Este repositorio concreto, subido por el usuario alekshandru, contiene una versión en formato GGUF del checkpoint oficial `google/gemma-4-E4B-it-qat-q4_0-unquantized`, preparada por Unsloth con cuantización QAT (Quantization-Aware Training). El modelo emplea una arquitectura Mixture-of-Experts (MoE) con aproximadamente 7.460 millones de parámetros totales y 4.000 millones activos, lo que lo sitúa en la gama de modelos pequeños optimizados para ejecución en dispositivos locales como portátiles y móviles.

La familia Gemma 4 introduce avances significativos: procesamiento multimodal (texto, imagen y audio en las variantes E2B, E4B y 12B), modos de razonamiento configurables, ventanas de contexto de hasta 256K tokens (128K en los modelos pequeños) y soporte multilingüe en más de 140 idiomas. Este modelo en particular está pensado para despliegue eficiente con cuantización GGUF Q4_0, e incluye un drafter MTP (Multi-Token Prediction) para decodificación especulativa. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture-of-Experts (MoE) |
| Parametros totales | 7.463.013.674 (~7,46 B) |
| Parametros activos | 4 B (por designacion E4B) |
| Longitud de contexto | 128K tokens (modelos pequenos de la familia; la familia soporta hasta 256K) |
| Tipos de cuantizacion | GGUF Q4_0 (tambien disponibles versiones mobile-optimized wNa8o8 y compressed tensors w4a16 en otros repos) |
| Idiomas soportados | Mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con drafter MTP en el repo; safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

Gemma 4 E4B utiliza una arquitectura transformer multimodal con mezcla de expertos (MoE). El nombre "E4B" indica que activa 4.000 millones de parámetros por token, mientras que el total es de aproximadamente 7.460 millones. El modelo procesa texto e imágenes (y audio en esta variante) y genera texto. Incorpora un mecanismo de razonamiento configurable con modos de pensamiento ("thinking modes") que se pueden activar o desactivar según la tarea.

La versión QAT (Quantization-Aware Training) se ha optimizado durante el entrenamiento para que los pesos cuantizados a 4 bits conserven una calidad similar al formato bfloat16, reduciendo drásticamente los requisitos de memoria. El repo incluye un drafter MTP (Multi-Token Prediction) en formato GGUF Q4_0 casi sin pérdidas, que permite decodificación especulativa compartiendo la caché KV del modelo objetivo. Los detalles exactos del dataset de entrenamiento (número de tokens, composición) no se especifican en la información disponible, aunque Google DeepMind es el autor del modelo base.

## Capacidades

- Generación de texto, razonamiento complejo, codificación y matemáticas, con modos de pensamiento configurables.
- Multimodal: procesa entrada de texto e imagen con soporte de resolución y relación de aspecto variables; entrada de audio en las variantes E2B, E4B y 12B.
- Soporte de tool calling / function calling, demostrado en el ejemplo de Unsloth Studio incluido en la model card.
- Capacidad para tareas de agente y razonamiento multi-paso gracias a los modos de pensamiento y a la ventana de contexto larga.
- Multilingüe: más de 140 idiomas soportados.
- Decodificación especulativa mediante el drafter MTP incluido, que acelera la inferencia sin cambiar la salida (el modelo objetivo verifica cada token generado).
- Optimizado para ejecución en dispositivos locales (portátiles, móviles) por su tamaño reducido y cuantización eficiente.

## Casos de uso

- Asistente de codigo en local: el modelo puede generar, revisar y explicar código en múltiples lenguajes, integrándose con herramientas de autocompletado o agentes de desarrollo gracias a su soporte de tool calling. Su tamaño permite ejecutarlo en una estación de trabajo con GPU consumer.
- Analisis de imagenes y documentos: al ser multimodal, puede extraer información de capturas, diagramas, formularios escaneados o fotografías, combinando comprensión visual con razonamiento textual para tareas como clasificación de documentos o descripción de imágenes.
- Chatbot de atencion al cliente multilingue: con soporte de 140+ idiomas y ventana de contexto de 128K tokens, puede gestionar conversaciones largas y multicanal (texto e imágenes) manteniendo el historial completo.
- Aplicaciones on-device: su tamaño (7,46B totales, 4B activos) y cuantización Q4_0 lo hacen adecuado para ejecutarse en portátiles de gama media o incluso en móviles de gama alta, permitiendo asistentes personales privados sin conexión.
- Agente de razonamiento multi-paso: los modos de pensamiento configurables permiten resolver problemas complejos (planificación, análisis de datos, toma de decisiones) con cadenas de razonamiento explícitas, útil en entornos de investigación o automatización.
- Traduccion y procesamiento de lenguaje multilingue: gracias a su cobertura de más de 140 idiomas, puede traducir textos, resumir contenido o normalizar documentos en entornos corporativos internacionales.
- Prototipado rapido de pipelines de IA: al ser compatible con llama.cpp, Ollama y vLLM (a través de la versión compressed tensors), se puede integrar en entornos de desarrollo para pruebas de concepto con mínima configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la cuantización QAT preserva una calidad similar a bfloat16, pero no se proporcionan números concretos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en Q4_0 de ~7,46B parámetros ocupan aproximadamente 3,7 GB (cálculo estándar de 4 bits por parámetro). Con caché KV y overhead del runtime, se estima un consumo total de 5-6 GB para inferencia básica.
- GPU recomendadas: tarjetas consumer con 8 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 4070, RTX 4090. También puede ejecutarse en GPU de datacenter como A100 o H100 si se requiere mayor throughput.
- Cabe en GPU consumer: sí, en tarjetas con al menos 8 GB de VRAM. Para móviles, se recomienda la versión mobile-optimized (wNa8o8) de Unsloth.
- Opciones de despliegue: llama.cpp (con soporte nativo para el drafter MTP), Ollama, Unsloth Studio, vLLM (usando la versión compressed tensors w4a16 del modelo base).
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa con MTP debería mejorar el throughput en comparación con generación autoregresiva estándar, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este modelo frente a alternativas directas. La familia Gemma 4 incluye otros tamaños que pueden servir de referencia arquitectónica:

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Gemma 4 E2B | ~2,6 B (estimado) | 2 B | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E4B (este) | 7,46 B | 4 B | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B | 12 B | 12 B (denso) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 26B A4B | 26 B | 4 B | 256K | Texto, imagen | Apache 2.0 |
| Gemma 4 31B | 31 B | 31 B (denso) | 256K | Texto, imagen | Apache 2.0 |

Alternativas de otros fabricantes con tamaño similar (p. ej., Llama 3.2 8B, Qwen 2.5 7B) no están cubiertas en la información proporcionada, por lo que no se puede realizar una comparación objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la información disponible. Como modelo entrenado por Google DeepMind, puede heredar sesgos presentes en los datos de entrenamiento, especialmente en tareas sensibles o multilingües.
- Riesgo de alucinación: no se especifica. Se recomienda validar las salidas en aplicaciones críticas, especialmente en tareas de razonamiento o generación de código.
- Limitaciones de contexto: la ventana de 128K tokens es amplia, pero el rendimiento con contextos muy largos puede degradarse si no se gestiona correctamente la caché KV.
- Limitaciones de idioma: aunque soporta más de 140 idiomas, la calidad puede variar significativamente entre idiomas de alto y bajo recurso.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe revisar la licencia específica de Gemma 4 en el enlace proporcionado por Google.
- Repositorio no oficial: este repo es una contribución de un usuario (alekshandru) que ha subido el GGUF generado por Unsloth. No es un repositorio oficial de Google, aunque el modelo base sí lo es. Se recomienda verificar la integridad de los pesos antes de usarlo en producción.
- El drafter MTP está optimizado para la cuantización Q4_0; si se utilizan otras cuantizaciones, puede ser necesario usar un drafter diferente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alekshandru/gemma-4-E4B-it-qat-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Guia de Unsloth para Gemma 4 QAT: https://unsloth.ai/docs/models/gemma-4/qat
- Coleccion de Gemma 4 QAT de Unsloth: https://huggingface.co/collections/unsloth/gemma-4-qat
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentacion de Gemma 4: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de GGUFs dinamicos de Unsloth: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
