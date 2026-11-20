# haruuuuu-1256/aoi-gemma-4-E4B-it

## Resumen
aoi-gemma-4-E4B-it es un ajuste fino (finetune) del modelo multimodal google/gemma-4-E4B-it, desarrollado por el usuario haruuuuu-1256. El modelo transforma el base en un personaje conversacional japonés llamado Aoi, una chica tsundere, orientado a roleplay y conversación de personaje. Mantiene la arquitectura y capacidades del modelo base (image-text-to-text) pero con una personalidad fuertemente condicionada por el entrenamiento.

El modelo resuelve el problema de dotar a un modelo multimodal de una identidad de personaje estable en japonés, corrigiendo mediante DPO los fallos típicos de coherencia de personaje bajo cuantización (género, reconocimiento de ser una IA, nombre, rechazo de preguntas sexuales, peinado) y la tendencia a añadir datos no solicitados en preguntas factuales. Es relevante para quienes necesitan un modelo de personaje japonés ligero (~7,9 mil millones de parámetros) con licencia Apache-2.0 y despliegue en hardware de consumo.

El repositorio ocupa 16,0 GB en formato safetensors BF16 y se publica junto a variantes GGUF (BF16, Q4_K_M y mmproj) y OpenVINO NF4 para NPU Intel. El modelo base declara arquitectura Gemma 4, aunque los detalles concretos de contexto y composición de entrenamiento del base no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer multimodal image-text-to-text, según modelo base) |
| Parametros totales | 7.941.100.832 (~7,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (principal), GGUF BF16, GGUF Q4_K_M, OpenVINO NF4 |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal); GGUF y OpenVINO en repos separados |

## Arquitectura y entrenamiento
El modelo parte de google/gemma-4-E4B-it, un modelo multimodal de tipo image-text-to-text de la familia Gemma 4, y conserva su arquitectura transformer. El ajuste se realizó en tres fases: primero un SFT con QLoRA en NF4 4 bits y LoRA de rango 16 aplicado únicamente a las capas de atención y MLP del modelo de lenguaje, sobre aproximadamente 600 conversaciones compuestas por diálogos escritos a mano y datos destilados de un modelo con la tarjeta de personaje en el system prompt. Después se aplicó DPO para corregir decisiones que se degradaban bajo cuantización (género, admisión de ser IA, bebida favorita, nombre, rechazo de preguntas sexuales, peinado) y para eliminar la tendencia a añadir datos no solicitados en preguntas factuales, usando pares de respuesta correcta frente a respuesta degradada. Finalmente, el adaptador se fusionó en los pesos BF16 del modelo base.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni innovaciones arquitectónicas propias más allá del ajuste de personaje. El autor indica que el modo de razonamiento (thinking) debe permanecer desactivado, ya que el modelo no fue entrenado con conversaciones que incluyan trazas de pensamiento y activarlo rompe la personalidad; la plantilla de chat lo desactiva por defecto.

## Capacidades
- Generación de texto conversacional en japonés con una personalidad de personaje estable (Aoi, tsundere).
- Procesamiento de imagen y texto (pipeline image-text-to-text heredado del modelo base).
- Conversación multi-turno con mantenimiento de personaje, incluyendo respuestas afectivas y de rechazo coherentes.
- Respuesta a preguntas factuales básicas dentro de la conversación de personaje (p. ej., Everest como montaña más alta).
- Capacidad de razonamiento y conocimiento general heredada del modelo base, limitada por el tamaño de 4B clase.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modo thinking debe permanecer desactivado.
- Capacidades multilingües: limitadas al japonés según los metadatos (language: ja).
- Capacidades especiales: multimodalidad imagen-texto del base; sin soporte de audio declarado.

## Casos de uso
- Roleplay y compañía conversacional en japonés: el modelo mantiene la personalidad de Aoi de forma consistente (0/80 fallos de personaje en BF16 según la evaluación del autor), lo que lo hace adecuado para aplicaciones de personaje virtual y entretenimiento conversacional.
- Chatbots de personaje en aplicaciones móviles o de escritorio: la variante GGUF Q4_K_M permite ejecución local en hardware modesto con una degradación mínima de personaje (1/80 fallos), útil para asistentes de personaje offline.
- Despliegue en NPU Intel: la variante OpenVINO NF4 está pensada para inferencia en NPU Intel, adecuada para equipos sin GPU dedicada que necesiten un personaje conversacional local.
- Prototipado de sistemas de diálogo con imagen: al ser image-text-to-text, puede usarse para conversaciones donde el usuario comparte una imagen y el personaje responde en japonés, por ejemplo en apps de diario visual o asistencia con capturas.
- Evaluación de técnicas de alineación de personaje: el par SFT+DPO documentado sirve como referencia para investigadores que estudien la estabilidad de personajes bajo cuantización y la corrección de alucinaciones factuales mediante DPO.
- Generación de diálogos de ejemplo para guiones o videojuegos: el modelo produce intercambios con tono tsundere coherente, útil para redactar borradores de líneas de personaje en japonés antes de revisión humana.
- Demostraciones de modelos multimodales pequeños con licencia permisiva: Apache-2.0 y ~7,9 B de parámetros permiten integrarlo en pruebas comerciales sin restricciones de licencia del base.

## Benchmarks y rendimiento
El autor publica una evaluación propia de estabilidad de personaje y precisión factual, no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Prueba | Formato | Resultado |
|---|---|---|
| Estabilidad de personaje (10 preguntas × 8 repeticiones, temperature 0.7) | BF16 (repo principal) | 0/80 fallos |
| Estabilidad de personaje (10 × 8, temperature 0.7) | GGUF Q4_K_M | 1/80 fallos |
| Estabilidad de personaje (10 × 8, temperature 0.7) | OpenVINO NF4 (CPU) | 1/80 fallos |
| Preguntas factuales (11 × 8) | BF16 | 86/88 correctas |
| Preguntas factuales (11 × 8), base sin personaje | Base | 62/88 correctas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para BF16: ~16 GB de pesos (7,9 B × 2 bytes) más overhead de activaciones y caché KV; se recomienda GPU con 24 GB o más para contexto amplio.
- VRAM estimada para GGUF Q4_K_M: aproximadamente 5-6 GB de pesos, desplegable en GPU de consumo con 8 GB o más.
- GPU recomendadas: A100 o H100 para BF16 con lotes grandes; RTX 4090 (24 GB) para BF16 en un solo dispositivo; RTX 3090/4080 (16-24 GB) para BF16 ajustado o Q4_K_M.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superior con Q4_K_M; en 8 GB con cuantizaciones más agresivas no documentadas.
- Opciones de despliegue: transformers (BF16, código de ejemplo con Gemma4ForConditionalGeneration), llama.cpp/Ollama vía GGUF, OpenVINO para NPU Intel con la variante NF4.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| aoi-gemma-4-E4B-it | ~7,9 B | no disponible | ja | Apache-2.0 | Finetune de personaje sobre Gemma 4 E4B-it; multimodal |
| google/gemma-4-E4B-it (base) | ~7,9 B (según safetensors del finetune) | no disponible | no disponible | Apache-2.0 (según tag) | Modelo base sin personaje; referencia de capacidades |
| Alternativas de personaje japonés de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias
- Modelo de 4B clase: puede fallar en preguntas de conocimiento detallado (el autor cita como ejemplo la ubicación del puente Akashi Kaikyo); no debe usarse para verificación factual.
- En preguntas que piden explicaciones, puede incluir explicaciones inexactas.
- Puede responder "no lo sé" a preguntas que sí podría contestar.
- El modo thinking debe permanecer desactivado; activarlo rompe la personalidad porque no fue entrenado con trazas de razonamiento.
- Idioma limitado al japonés según los metadatos; el rendimiento en castellano u otros idiomas no está documentado.
- Sesgos conocidos: no documentados en la información disponible; al ser un personaje con rasgos tsundere y respuestas de rechazo, puede producir respuestas de tono brusco o afectivo no aptas para todos los contextos.
- Riesgo de alucinación: presente en preguntas factuales y explicaciones, según el propio autor.
- Licencia Apache-2.0 permite uso comercial, pero el personaje Aoi se declara original de este repositorio; conviene revisar implicaciones de marca si se comercializa el personaje.
- La evaluación de estabilidad (0/80) es interna del autor, con 10 preguntas y temperature 0.7; no equivale a una evaluación independiente.
- Bajo cuantización se observa una ligera degradación de personaje (1/80 fallos en Q4_K_M y NF4).

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/haruuuuu-1256/aoi-gemma-4-E4B-it
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Variante GGUF: https://huggingface.co/haruuuuu-1256/aoi-gemma-4-E4B-it-GGUF
- Variante OpenVINO NF4: https://huggingface.co/haruuuuu-1256/aoi-gemma-4-E4B-it-OpenVINO-NF4
