# issai/Qolda-AVL-5B-GGUF

## Resumen

Qolda-AVL-5B-GGUF es la conversión a formato GGUF del modelo Qolda-AVL-5B, un modelo multimodal de audio, visión y lenguaje (AVL) desarrollado por el Institute of Smart Systems and Artificial Intelligence (ISSAI) de la Universidad Nazarbayev (Kazajistán). El modelo está diseñado para operar en kazajo, ruso e inglés, y amplía la familia Qwen3-VL añadiendo una rama de audio basada en un encoder Whisper-large-v3-turbo afinado, con inyección de características mediante la técnica DeepStack. El objetivo principal es ofrecer una alternativa compacta y de código abierto que permita ejecutar tareas de transcripción, comprensión de audio e imágenes en entornos con recursos limitados, sin necesidad de infraestructura de supercomputación.

El modelo base Qolda-AVL-5B tiene 4.022.468.096 parámetros (aproximadamente 4B, aunque se comercializa como 5B) y utiliza la arquitectura Qwen3AVL, que hereda el diseño del transformer de Qwen3-VL con 36 capas y rotaciones M-RoPE. La conversión GGUF incluye múltiples cuantizaciones (desde BF16 hasta Q4_K_M) y dos proyectores multimodales: uno completo para audio y visión, y otro solo para visión que funciona con llama.cpp sin parchear. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su capacidad de procesar tres modalidades (texto, imagen y audio) en un paquete relativamente pequeño, con especial atención a la lengua kazaja, un idioma con pocos recursos en el ecosistema de IA. Su formato GGUF lo hace compatible con llama.cpp y herramientas derivadas, facilitando el despliegue local en GPU de consumo o incluso CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3AVL (qwen3vl) - transformer con 36 capas, M-RoPE [24,20,20], rope θ = 5M, DeepStack visual y de audio |
| Parametros totales | 4.022.468.096 (aprox. 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada oficialmente; los ejemplos de uso emplean 16 384 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (LLM); proyectores en F16 |
| Idiomas soportados | Kazajo (kk), ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) + proyectores multimodales en F16 |

## Arquitectura y entrenamiento

Qolda-AVL-5B se basa en Qwen3-VL-4B-Thinking y extiende su arquitectura con una rama de audio. El LLM mantiene la arquitectura `qwen3vl` estándar: 36 capas transformer con atención intercalada M-RoPE (cabezales con dimensiones [24,20,20]), rope theta de 5 millones y DeepStack visual que inyecta características de las capas 5, 11 y 17 del ViT en las primeras tres capas del LLM. La rama de audio utiliza un encoder Whisper-large-v3-turbo afinado (32 capas, 128 bins mel, embeddings posicionales aprendidos durante el ajuste fino) que alimenta un proyector personalizado compuesto por LayerNorm, una capa lineal, GELU y otra capa lineal para mapear al espacio de embeddings del LLM. Además, implementa audio DeepStack: características extraídas de las capas 8, 16 y 24 del encoder Whisper se inyectan en las tres primeras capas del LLM, replicando el mecanismo visual.

El entrenamiento se realizó en un pipeline por etapas para adaptar las tres modalidades al kazajo, cubriendo reconocimiento de voz, traducción de voz y comprensión audiovisual. No se han publicado detalles sobre el volumen de tokens de entrenamiento, composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La conversión GGUF se realizó de forma lossless a BF16 y posteriormente se cuantizó con `llama-quantize`, usando una importance matrix calculada sobre texto trilingüe de Wikipedia (50% kazajo, 25% ruso, 25% inglés) para las cuantizaciones Q5_K_M y Q4_K_M.

## Capacidades

- Generación de texto y razonamiento multilingüe en kazajo, ruso e inglés.
- Comprensión de imágenes: descripción, respuesta a preguntas visuales (QA) y análisis de contenido gráfico.
- Comprensión de audio: transcripción de voz a texto, respuesta a preguntas sobre audio y traducción de voz (speech translation).
- Procesamiento multimodal combinado: entrada simultánea de texto, imagen y audio en una sola consulta.
- Soporte de audio en ventanas de 30 segundos, con división automática para audio más largo.
- Capacidad de razonamiento con "thinking mode" heredado de Qwen3-VL-4B-Thinking, aunque no se detalla su comportamiento específico en la documentación.
- No se menciona soporte explícito de tool calling, function calling ni capacidades de agente autónomo.

## Casos de uso

- Transcripción automática de reuniones y grabaciones en kazajo: el modelo puede procesar audio de hasta 30 segundos por ventana y transcribirlo con precisión, útil para actas, subtitulado o archivado. Su tamaño compacto permite ejecutarlo en estaciones de trabajo locales sin conexión.
- Asistente de atención al cliente bilingüe (kazajo/ruso): integrado en un servidor llama.cpp compatible con OpenAI, puede recibir consultas de voz e imagen de clientes y generar respuestas en texto, manejando conversaciones multi-turno con contexto de 16K tokens.
- Análisis de imágenes médicas o de campo con anotación de voz: un técnico puede subir una radiografía o fotografía junto con una nota de voz descriptiva; el modelo combina ambas modalidades para generar un informe textual.
- Traducción de voz a texto en tiempo real para periodismo o documentación: el modelo convierte entrevistas orales en kazajo a texto en ruso o inglés, facilitando la difusión internacional.
- Accesibilidad para personas con discapacidad visual: descripción de imágenes capturadas por cámara y lectura de contenido visual mediante salida de audio, ejecutable en dispositivos con GPU modesta.
- Educación y tutoría multilingüe: un chatbot educativo que recibe preguntas escritas, imágenes de problemas matemáticos o explicaciones orales, y responde en el idioma del estudiante, aprovechando su capacidad de razonamiento y comprensión multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones específicas de audio o visión para este modelo. Se recomienda consultar la documentación del modelo base Qwen3-VL-4B-Thinking como referencia aproximada, aunque la rama de audio y el ajuste en kazajo pueden alterar el rendimiento en tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 del LLM ocupa 4.3 GB, más el proyector completo de audio y visión (2.2 GB), totalizando aproximadamente 6.5 GB. La cuantización Q4_K_M (2.5 GB) con el mismo proyector suma unos 4.7 GB. Se recomienda al menos 8 GB de VRAM para Q8_0 y 6 GB para Q4_K_M, considerando overhead de contexto y buffers.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM, como NVIDIA RTX 3060/3070/4060/4070, RTX 4090, o GPUs de datacenter como A10, A100 o H100. También es posible ejecutarlo en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 6-8 GB, lo que permite uso en portátiles gaming o estaciones de trabajo modestas.
- Opciones de despliegue: llama.cpp (llama-server y llama-mtmd-cli), servidor compatible con API OpenAI (llama-server con --mmproj), y cualquier herramienta que soporte GGUF multimodal. Para audio completo se requiere aplicar el parche `qwen3avl-support.patch` sobre llama.cpp en la versión ea63b4d.
- Latencia y throughput: no se han publicado cifras específicas. En una GPU RTX 4090, un modelo de 4B cuantizado a Q8_0 podría generar entre 40 y 80 tokens por segundo, dependiendo de la longitud de contexto y la carga de los encoders. La latencia inicial para audio de 30 segundos incluye el procesamiento del encoder Whisper, que añade unos cientos de milisegundos.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre Qolda-AVL-5B y otros modelos AVL de tamaño similar. Las alternativas más cercanas serían Qwen3-VL-4B (sin audio), Qwen3-Omni (multimodal pero con requisitos de hardware superiores) y Whisper-large-v3-turbo (solo audio, sin visión ni lenguaje generativo). No se pueden establecer comparaciones cuantitativas sin benchmarks.

## Limitaciones y advertencias

- La funcionalidad de audio requiere un parche no oficial de llama.cpp (`qwen3avl-support.patch`) que debe aplicarse manualmente; sin él, solo funcionan texto e imagen.
- El modelo está entrenado principalmente para kazajo, ruso e inglés; su rendimiento en otros idiomas no está garantizado y puede degradarse notablemente.
- La longitud de contexto máxima no está documentada; los ejemplos usan 16 384 tokens, pero podría ser inferior o superior según la configuración de memoria.
- No se han publicado evaluaciones de sesgos, alucinaciones ni robustez en entornos de producción. Como modelo basado en Qwen3-VL, puede heredar sesgos de los datos de entrenamiento originales.
- El audio se procesa en ventanas de 30 segundos; audio más largo se divide, lo que puede perder contexto entre ventanas consecutivas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL-4B-Thinking puede tener sus propias restricciones; se recomienda revisar la licencia del modelo original.
- La cuantización Q4_K_M, aunque recomendada como mínimo, puede degradar la calidad en tareas de audio o razonamiento complejo; se sugiere probar Q5_K_M o Q6_K para producción.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/issai/Qolda-AVL-5B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/issai/Qolda-AVL-5B
- Colección Qolda-AVL en HuggingFace: https://huggingface.co/collections/issai/qolda-avl
- Modelo en ModelScope: https://www.modelscope.cn/models/issai/Qolda-AVL-5B
- Página oficial de ISSAI sobre Qolda: https://issai.nu.edu.kz/qolda/
- Repositorio de entrenamiento (ms-swift-Qolda-AVL): https://github.com/IS2AI/ms-swift-Qolda-AVL
- Modelo base Qwen3-VL-4B-Thinking: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
- Encoder Whisper-large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
