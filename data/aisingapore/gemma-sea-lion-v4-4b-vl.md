# aisingapore/Gemma-SEA-LION-v4-4B-VL

## Resumen

Gemma-SEA-LION-v4-4B-VL es un modelo de visión-lenguaje (VLM) de 4.300 millones de parámetros desarrollado por el AI Products Pillar de AI Singapore, construido mediante ajuste fino supervisado sobre `google/gemma-3-4b-it`. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una colección de modelos diseñada específicamente para cubrir las lenguas y contextos culturales del sudeste asiático, una región tradicionalmente infrarrepresentada en los corpus de entrenamiento de los grandes modelos occidentales.

El modelo parte de la arquitectura decoder de Gemma 3, conserva la ventana de contexto de 128.000 tokens del modelo base y añade capacidades multilingües en indonesio, vietnamita, tailandés, filipino, tamil, birmano y malayo, además de inglés y chino. El post-entrenamiento se realizó sobre aproximadamente 6,7 millones de pares instrucción-texto, con un subconjunto filtrado de datos de tool calling para dotar al modelo de capacidad de invocación de funciones.

Su relevancia actual radica en tres factores: es uno de los pocos VLM abiertos con cobertura explícita de lenguas del sudeste asiático, incorpora function calling sobre una base multimodal y se distribuye bajo licencia MIT, lo que elimina las restricciones de uso comercial que arrastra el modelo base de Google. Está pensado para aplicaciones de atención al cliente, extracción de información de documentos y agentes conversacionales en entornos regionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3), multimodal imagen-texto |
| Parametros totales | 4.300.079.472 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible (el repo publica pesos en safetensors; no se documentan variantes GGUF/AWQ oficiales) |
| Idiomas soportados | Ingles, chino, indonesio, vietnamita, tailandes, filipino, tamil, birmano, malayo |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 3 de Google en su variante de 4B con capacidades multimodales: un decoder transformer con atención por ventanas deslizantes y atención global alternadas, un codificador visual para el procesamiento de imágenes y el tokenizador original de `gemma-3-4b-it`. La ventana de contexto se mantiene en 128.000 tokens, lo que permite procesar documentos largos o conversaciones multi-turno extensas junto con imágenes intercaladas.

El entrenamiento consistió en un post-entrenamiento de adaptación de dominio sobre aproximadamente 6,7 millones de pares de instrucción-texto, con foco en lenguas del sudeste asiático y en la fluidez multicultural. El conjunto de datos incluye además un subconjunto filtrado de pares de instrucción orientados a tool calling, lo que introduce la capacidad de invocación de funciones que el modelo base no ofrecía de forma nativa. La model card menciona también experimentos específicos de parsing visual en tailandés, chino e inglés. No se documenta en la información disponible el uso de RLHF o DPO, ni el número exacto de tokens de preentrenamiento adicionales.

## Capacidades

- Generación de texto conversacional en inglés, chino, indonesio, vietnamita, tailandés, filipino, tamil, birmano y malayo.
- Comprensión de imágenes y respuesta a preguntas visuales (image-text-to-text), incluyendo parsing visual en tailandés, chino e inglés.
- Tool calling y function calling, con soporte de esquemas JSON de herramientas en la plantilla de chat.
- Razonamiento multi-turno con contexto largo de hasta 128.000 tokens.
- Capacidad de operar como agente conversacional que combina información visual y textual en una misma consulta.
- Adaptación cultural y lingüística a contextos del sudeste asiático (por ejemplo, consultas sobre vivienda pública en Singapur en el ejemplo de la model card).

## Casos de uso

- Atención al cliente multilingüe en el sudeste asiático: el modelo puede gestionar conversaciones multi-turno en indonesio, vietnamita, tailandés o malayo con contexto de hasta 128.000 tokens, lo que permite mantener el historial completo de la conversación y adjuntar capturas o documentos sin truncar.
- Extracción de datos de documentos escaneados: gracias a sus capacidades de visión y a su soporte de tailandés y chino en parsing visual, puede procesar facturas, formularios o recibos regionales y devolver campos estructurados.
- Agentes de consulta con herramientas externas: el soporte de function calling permite conectar el modelo a APIs de búsqueda, cálculo o reservas (por ejemplo, búsqueda de inmuebles y cálculo de hipotecas, como ilustra la model card) en flujos multi-paso.
- Asistentes de accesibilidad para mercados locales: descripción de imágenes y lectura de texto en pantalla en lenguas del sudeste asiático, útil para aplicaciones de asistencia a personas con discapacidad visual en la región.
- Moderación y clasificación de contenido regional: análisis de texto e imágenes en lenguas de baja representación para pipelines de moderación que los modelos occidentales cubren deficientemente.
- Despliegue en infraestructura limitada: con 4.300 millones de parámetros y licencia MIT, es viable en una única GPU de consumo (por ejemplo, RTX 4090 con cuantización de 8 bits) para prototipos y entornos de borde.
- Investigación en multilingüismo: base para experimentos de adaptación lingüística y evaluación de sesgos en lenguas del sudeste asiático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 8,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda entre 12 y 16 GB para secuencias moderadas.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos, viable en GPUs de 8-12 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 3-4 GB de pesos, aunque el procesador visual y la caché KV para contextos largos elevan el consumo real.
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue en producción con contexto largo; RTX 4090 (24 GB) para desarrollo e inferencia con contexto moderado; RTX 3090 o 4080 como alternativas de consumo.
- Cabe en GPU de consumo: sí, en RTX 4090, 4080, 3090 y tarjetas con 12 GB o más usando cuantización.
- Opciones de despliegue: transformers (soporte oficial documentado), text-generation-inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM para servir con throughput alto (verificar soporte de Gemma 3 multimodal en la versión utilizada), llama.cpp/Ollama mediante conversión a GGUF no oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Cobertura SEA |
|---|---|---|---|---|---|
| Gemma-SEA-LION-v4-4B-VL | 4,3B | 128K | MIT | Sí | Sí (7 lenguas SEA) |
| google/gemma-3-4b-it | 4,3B | 128K | Gemma Terms (uso comercial con restricciones) | Sí | Limitada |
| Qwen2.5-VL-3B | ~3B | 32K (ampliable) | Apache 2.0 | Sí | Parcial (chino, sin lenguas SEA menores) |
| SEA-LION v3 (versiones previas) | Variable | Variable | MIT | No en todas las variantes | Sí |

La comparativa se limita a parámetros, contexto y licencia; no se dispone de datos de benchmarks comparativos en la información proporcionada. Frente a `gemma-3-4b-it`, la ventaja principal es la cobertura lingüística del sudeste asiático y la licencia MIT; frente a Qwen2.5-VL, la ventaja es la cobertura de lenguas como birmano, tamil o filipino, aunque Qwen ofrece mayor contexto efectivo documentado en algunas variantes.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; la model card indica explícitamente que los desarrolladores deben aplicar su propio ajuste de seguridad.
- No se ha evaluado la robustez frente a prompting adversarial.
- Riesgo de alucinación documentado por el autor: puede generar contenido irrelevante o ficticio no fundamentado en el contexto, especialmente en tareas de extracción visual.
- Cobertura lingüística desigual: las lenguas con menos datos (birmano, tamil) probablemente rindan peor que indonesio o vietnamita; no se publican métricas por idioma.
- El soporte de parsing visual se limita a tailandés, chino e inglés según la model card; otras lenguas pueden degradar la precisión en tareas de OCR.
- Aunque la licencia es MIT, el modelo deriva de Gemma 3, cuyos términos de uso originales conviene revisar para asegurar el cumplimiento en despliegues comerciales.
- No se documentan cuantizaciones oficiales; las conversiones a GGUF son responsabilidad del usuario y pueden degradar el rendimiento multimodal.
- El contexto de 128.000 tokens es teórico; el rendimiento real con secuencias muy largas y múltiples imágenes no está cuantificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-4B-VL
- Colección SEA-LION v4: https://huggingface.co/collections/aisingapore/sea-lion-v4
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Licencia MIT: https://mit-license.org/
- Paper referenciado (arXiv:2502.14301): https://arxiv.org/abs/2502.14301
- Paper referenciado (arXiv:2311.07911): https://arxiv.org/abs/2311.07911
- Paper referenciado (arXiv:2306.05685): https://arxiv.org/abs/2306.05685
