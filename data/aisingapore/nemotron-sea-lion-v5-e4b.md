# aisingapore/Nemotron-SEA-LION-v5-E4B

## Resumen

Nemotron-SEA-LION-v5-E4B es un modelo de lenguaje de tipo "small language model" desarrollado por el AI Products Pillar de AI Singapore, financiado por el National Research Foundation de Singapur. Se trata de un post-entrenamiento sobre nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, que a su vez deriva de google/gemma-4-E4B-it. El modelo cuenta con 8.000 millones de parámetros totales y 4.000 millones efectivos, con una ventana de contexto de 64.000 tokens y capacidad multimodal de entrada imagen-texto.

El objetivo del modelo es cubrir las lenguas del sudeste asiático (SEA), una región tradicionalmente infrarrepresentada en los grandes modelos fundacionales. Para ello, AI Singapore ha realizado un ajuste fino sobre el modelo base de NVIDIA utilizando el dataset aisingapore/SEA-Instruct-2602, preservando la arquitectura, el tokenizador, la plantilla de chat y los valores de muestreo originales, con la única modificación de que el modo de razonamiento (thinking) queda activado por defecto.

Su relevancia actual radica en la combinación de tres factores: licencia MIT (plenamente permisiva para uso comercial), un tamaño reducido que permite despliegue en hardware modesto con baja latencia de primer token, y cobertura de nueve idiomas incluyendo birmano, tamil y tailandés, además de inglés y chino. Esto lo posiciona como una opción práctica para asistentes locales, agentes embebidos y aplicaciones multilingües en la región.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base gemma4), post-entrenado por NVIDIA |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | ~4B efectivos |
| Longitud de contexto | 64.000 tokens |
| Tipos de cuantizacion | BF16 (original), FP8, INT4, GGUF (variantes publicadas) |
| Idiomas soportados | Ingles, chino, birmano, indonesio, filipino, malayo, tamil, tailandes, vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers); GGUF disponible en variante separada |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura completa de nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, que es la versión post-entrenada por NVIDIA de google/gemma-4-E4B-it. Se trata por tanto de un transformer multimodal con capacidad de entrada imagen-texto y salida de texto, con aproximadamente 8.000 millones de parámetros totales y 4.000 millones efectivos. AI Singapore no modifica la arquitectura, el tokenizador, la plantilla de chat ni los valores de muestreo por defecto; únicamente activa el modo de razonamiento (thinking) por defecto en la configuración de generación.

El ajuste fino se realizó en inglés y lenguas del sudeste asiático utilizando el dataset aisingapore/SEA-Instruct-2602. La model card no especifica el número exacto de tokens de entrenamiento ni la composición detallada del dataset, ni confirma el uso de RLHF o DPO en esta etapa de post-entrenamiento. Del modelo base se heredan innovaciones relevantes: modo de respuesta directa y presupuesto de razonamiento configurable en tiempo de ejecución, modo conversacional para respuestas concisas de estilo hablado con menos formateo, uso mejorado de herramientas multi-turno, seguimiento de instrucciones y anclaje de entrada (input grounding), así como una operación de baja memoria y bajo tiempo hasta el primer token orientada a asistentes de voz y dispositivos locales.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto, con posibilidad de desactivarlo (`enable_thinking=False`) o de fijar un presupuesto de razonamiento en tiempo de ejecución.
- Modo de respuesta directa para consultas que no requieren cadena de pensamiento.
- Modo conversacional (`conversational_mode`) que produce respuestas concisas de estilo hablado con menos formateo, orientado a asistentes de voz.
- Entrada multimodal imagen-texto (etiqueta image-text-to-text), aunque las variantes de despliegue documentadas limitan imágenes, vídeo y audio a cero en vLLM.
- Soporte de tool calling / function calling, con parser dedicado `gemma4` en vLLM y `--enable-auto-tool-choice`.
- Uso de herramientas multi-turno mejorado y seguimiento de instrucciones reforzado.
- Capacidades multilingües en inglés, chino, birmano, indonesio, filipino, malayo, tamil, tailandés y vietnamita.
- Anclaje de entrada (input grounding) para reducir desviaciones respecto al contexto proporcionado.
- Decodificación especulativa mediante el modelo auxiliar aisingapore/Nemotron-SEA-LION-v5-E4B-SpecDecoder.

## Casos de uso

- Atención al cliente multilingüe en el sudeste asiático: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandés o vietnamita con hasta 64.000 tokens de contexto, lo que permite mantener el historial completo de la conversación y documentación de producto en la misma ventana.
- Asistentes de voz y dispositivos locales: el modo conversacional genera respuestas concisas de estilo hablado y el modelo está optimizado para bajo tiempo hasta el primer token y baja memoria, lo que encaja en interfaces embebidas y altavoces inteligentes.
- Agentes con uso de herramientas: el soporte de function calling con parser `gemma4` en vLLM permite integrar el modelo en pipelines de agentes que consultan APIs, bases de datos o servicios externos en varios pasos.
- Procesamiento de documentación comercial regional: con entrada imagen-texto y contexto largo, puede extraer y resumir información de facturas, formularios o documentos escaneados en lenguas SEA, por ejemplo para logística de exportación entre Indonesia y Singapur.
- Generación de código y asistencia técnica en inglés: el modelo hereda las capacidades de razonamiento del base y puede emplearse en tareas de generación y explicación de código dentro de herramientas de desarrollo.
- Moderación y clasificación de contenido multilingüe: su cobertura de nueve idiomas permite construir clasificadores y filtros para foros y plataformas que operan en varios países de la región.
- Educación y tutoría localizada: respuestas en la lengua del usuario con razonamiento paso a paso, útil para plataformas de aprendizaje en tamil, birmano o filipino.
- Despliegue en hardware de gama media: al ser un modelo de ~8B con variantes INT4 y GGUF, puede ejecutarse en estaciones de trabajo con GPU de consumo para prototipado y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 16 GB solo para pesos, más overhead de contexto y activaciones; en FP8, en torno a 8 GB; en INT4, alrededor de 4-5 GB para pesos.
- GPU recomendadas: A100 o H100 para despliegue en producción con contexto largo y concurrencia; L40S o A10G como alternativas de inference server; RTX 4090 (24 GB) para BF16 en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 4090 con BF16; en RTX 3090/4080 con FP8 o INT4; en GPUs de 8-12 GB con la variante INT4 o GGUF cuantizada.
- Opciones de despliegue: Transformers (`AutoModelForMultimodalLM`), vLLM (con `--reasoning-parser gemma4` y `--tool-call-parser gemma4`), SGLang y llama.cpp mediante la variante GGUF.
- Latencia y throughput: la model card destaca baja memoria y bajo tiempo hasta el primer token, pero no se publican cifras concretas de latencia ni de tokens por segundo en la información disponible.
- Aceleración adicional: el SpecDecoder permite decodificación especulativa para aumentar la velocidad de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-SEA-LION-v5-E4B | ~8B (4B efectivos) | 64K | Birmano, indonesio, filipino, malayo, tamil, tailandes, vietnamita | MIT | Hugging Face (BF16, FP8, INT4, GGUF) |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | ~8B (4B efectivos) | 64K | No especificado | No disponible | Hugging Face |
| google/gemma-4-E4B-it | ~8B (4B efectivos) | No disponible | No especificado | No disponible | Hugging Face |

La comparativa con alternativas específicas para lenguas del sudeste asiático no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es el ajuste fino en lenguas SEA y la activación del modo thinking por defecto.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de sesgo; se recomienda auditar el comportamiento en cada idioma antes de producción.
- Riesgo de alucinación inherente a los modelos de ~8B, especialmente en tareas de conocimiento factual y en lenguas de bajos recursos como el birmano o el tamil.
- El modo thinking está activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explícitamente o se limita el presupuesto de razonamiento.
- Aunque la arquitectura soporta entrada de imagen, las instrucciones de despliegue en vLLM desactivan imagen, vídeo y audio (`--limit-mm-per-prompt '{"image":0,"video":0,"audio":0}'`), por lo que la multimodalidad práctica queda limitada en ese backend.
- La cobertura de idiomas se limita a los nueve declarados; no hay garantías de calidad fuera de ellos.
- No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset SEA-Instruct-2602 ni el uso de RLHF/DPO, lo que dificulta evaluar la reproducibilidad del ajuste.
- La licencia MIT permite uso comercial sin restricciones, pero conviene verificar las condiciones del modelo base de NVIDIA y de Gemma subyacentes.
- El modelo tiene pocas descargas (324) y un solo like en el momento de la consulta, lo que sugiere una adopción todavía incipiente y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B
- Colección SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo Gemma original: https://huggingface.co/google/gemma-4-E4B-it
- Variante FP8: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-FP8
- Variante INT4: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-INT4
- Variante GGUF (llama.cpp): https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-GGUF
- Modelo auxiliar para decodificación especulativa: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-SpecDecoder
- Dataset de ajuste: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Sitio oficial de SEA-LION: https://sea-lion.ai
- Texto de la licencia MIT: https://mit-license.org/
