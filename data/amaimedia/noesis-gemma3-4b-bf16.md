# AMAImedia/NOESIS-Gemma3-4B-BF16

## Resumen

NOESIS-Gemma3-4B-BF16 es un modelo de lenguaje multimodal de 4.300 millones de parámetros, desarrollado por AMAImedia como parte de la plataforma profesional de doblaje automático multilingüe NOESIS. Se trata de un ajuste fino (fine-tune) en precisión BF16 del modelo base `unsloth/gemma-3-4b-it`, que a su vez deriva de Gemma 3 4B de Google. El modelo está diseñado para actuar como "estudiante" principal de 4B en el pipeline de doblaje de audio de NOESIS, integrando un adaptador específico llamado Scenema que permite el cross-attention con audio.

La relevancia de este modelo radica en su enfoque especializado: combina las capacidades multimodales de Gemma 3 (texto e imagen) con un adaptador de audio propietario, orientado a tareas de doblaje y sincronización audiovisual. Se distribuye como un paquete completo con pesos en `safetensors`, tokenizador, configuración de generación, adaptador Scenema y un wrapper de integración. El contexto máximo es de 131.072 tokens, lo que permite manejar secuencias largas de diálogo o guiones. La licencia es la de Gemma (Google Gemma Terms of Use), con restricciones de atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3ForConditionalGeneration (transformer multimodal con vision encoder SigLIP) |
| Parametros totales | 4.300.079.472 (4,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponible (el repo solo incluye pesos BF16; se puede cuantizar a GGUF/AWQ con herramientas externas) |
| Idiomas soportados | Inglés y multilingüe (según la model card) |
| Licencia | Gemma (Google Gemma Terms of Use) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3, un transformer multimodal con 34 capas de texto, tamaño oculto de 2560 y un codificador de visión SigLIP que procesa imágenes a 896 píxeles. El modelo base es `unsloth/gemma-3-4b-it`, una versión optimizada de Gemma 3 4B instruct. El ajuste fino realizado por AMAImedia se enmarca en el framework DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators), que combina control determinista con operadores neuronales congelados. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La innovación principal es el adaptador Scenema (`scenema_adapter_v3.pt`), un componente separado de los pesos del transformer que se carga junto al modelo para habilitar el cross-attention con audio en el pipeline de doblaje. Este adaptador se distribuye con un archivo de configuración y un wrapper de Python (`scenema_wrapper.py`) que facilita su integración. El modelo se describe como "estudiante" en un esquema de destilación o entrenamiento colaborativo dentro de la plataforma NOESIS.

## Capacidades

- Generación de texto y chat conversacional, heredadas del modelo base Gemma 3 4B instruct.
- Razonamiento y resolución de problemas, incluyendo matemáticas y lógica básica.
- Generación de código en múltiples lenguajes de programación.
- Comprensión de imágenes (multimodal) gracias al codificador SigLIP, permitiendo entrada de texto e imagen.
- Soporte de tool calling / function calling, capacidad nativa de Gemma 3.
- Capacidades multilingües, aunque el énfasis está en inglés y lenguas europeas.
- Doblaje de audio y sincronización audiovisual mediante el adaptador Scenema, que permite alinear texto generado con pistas de audio existentes.
- Integración con el pipeline NOESIS para automatización de doblaje profesional.

## Casos de uso

- Doblaje automático de vídeos: el modelo genera diálogos sincronizados con el audio original, usando el adaptador Scenema para cross-attention. Es adecuado para estudios de postproducción que necesitan automatizar el doblaje en varios idiomas.
- Subtitulación y traducción audiovisual: gracias a su contexto largo (131K tokens) y capacidades multilingües, puede procesar guiones completos y generar subtítulos traducidos con coherencia temporal.
- Generación de voces para personajes en animación o videojuegos: el modelo puede producir líneas de diálogo que se ajustan a la duración y entonación de una pista de audio de referencia.
- Asistentes conversacionales multilingües: al ser un modelo de chat, puede desplegarse como agente de atención al cliente o asistente virtual, con soporte de tool calling para integrarse en APIs.
- Análisis y generación de contenido multimodal: combina entrada de imagen y texto para tareas como descripción de escenas, generación de metadatos o creación de guiones a partir de storyboards.
- Investigación en doblaje y síntesis de voz: el adaptador Scenema y el wrapper permiten experimentar con arquitecturas de cross-attention audio-texto, útil para laboratorios de IA aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo específico. Se recomienda consultar los benchmarks del modelo base Gemma 3 4B para una referencia aproximada de capacidades generales, aunque el fine-tune puede alterar el rendimiento en tareas específicas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,6 GB para los pesos del modelo, más overhead de activaciones y caché KV. Con contexto largo (131K tokens), la memoria puede superar los 16 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para uso cómodo con contexto completo; A100 (40/80 GB) o H100 para despliegue en producción con alta concurrencia.
- En consumer GPU: cabe en RTX 3090/4090 con BF16, y en GPUs de 16 GB (como RTX 4080) si se reduce el contexto o se aplica cuantización (por ejemplo, GGUF Q4_K_M).
- Opciones de despliegue: transformers (carga directa con `AutoModelForCausalLM`), vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF), Ollama (con conversión previa).
- Latencia y throughput: no disponible. Depende del hardware, la longitud de contexto y el uso del adaptador Scenema.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| NOESIS-Gemma3-4B-BF16 | 4,3 B | 131K | Sí (imagen) | Gemma | Fine-tune especializado en doblaje con adaptador Scenema |
| Gemma 3 4B IT (base) | 4,3 B | 131K | Sí (imagen) | Gemma | Modelo original de Google, sin adaptador de audio |
| Llama 3.2 3B | 3,2 B | 128K | No | Llama 3.2 Community | Modelo de texto puro, sin visión |
| Qwen2.5 3B | 3,1 B | 32K | No | Apache 2.0 | Modelo de texto, buen rendimiento en código |

La comparativa se basa en características técnicas, no en benchmarks, ya que no hay datos públicos para NOESIS-Gemma3-4B-BF16. El modelo se distingue por su adaptador de audio y su integración en el pipeline NOESIS, algo único frente a las alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del modelo base Gemma 3, que pueden incluir estereotipos de género, culturales o lingüísticos. No se ha realizado una evaluación específica de sesgos para este fine-tune.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o incoherente, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Limitaciones de idioma: aunque se declara multilingüe, el énfasis está en inglés; el rendimiento en lenguas minoritarias puede ser inferior.
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso, incluyendo restricciones para ciertos usos comerciales y requisitos de atribución. El adaptador Scenema y el wrapper son propiedad de AMAImedia y pueden tener términos adicionales.
- Dependencia del adaptador: el modelo solo ofrece la funcionalidad de doblaje cuando se carga el adaptador Scenema; sin él, se comporta como un Gemma 3 4B estándar.
- Madurez del proyecto: el modelo tiene pocas descargas (73) y sin valoraciones, lo que indica una adopción limitada y posible falta de validación en entornos de producción.
- Fecha de creación futura: la fecha de creación (2026-08-16) es posterior a la fecha actual del conocimiento del asistente, lo que sugiere que el modelo es muy reciente o que la información puede ser hipotética.

## Enlaces

- HuggingFace: https://huggingface.co/AMAImedia/NOESIS-Gemma3-4B-BF16
- Colección de modelos NOESIS: https://huggingface.co/collections/AMAImedia/noesis-original-trained-models
- Página de modelos de AMAImedia: https://huggingface.co/AMAImedia/models
- Despliegue en FriendliAI: https://friendli.ai/models/AMAImedia/NOESIS-Gemma3-4B-BF16
- X (Twitter) de AMAImedia: https://x.com/AMAImediacom
- LinkedIn de Ilia Bolotnikov: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram de contacto: https://t.me/djbionicl
