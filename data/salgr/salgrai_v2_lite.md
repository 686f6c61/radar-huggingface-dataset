# salgr/SalgrAI_v2_Lite

## Resumen

SalgrAI-v2-Lite es un modelo de lenguaje conversacional de tipo "tiny", desarrollado desde cero por un autor individual (Salgr) y publicado en Hugging Face. Con 24.874.368 parámetros y 11 capas, se trata de un transformer decoder-only con arquitectura estilo Llama (RMSNorm, RoPE con theta 10000, SwiGLU, sin biases y embeddings de entrada/salida atados). Su propósito es el chat casual en ruso con un tono informal de "Telegram en minúsculas", y está pensado explícitamente para experimentos, demos y aprendizaje, no para uso serio.

El modelo se entrenó íntegramente desde inicialización aleatoria en una única RTX 3060 de 12 GB en bf16, sin usar pesos de terceros. El preentrenamiento partió de un checkpoint de 6 capas que se hizo crecer a 11 insertando capas nuevas con proyecciones de salida inicializadas a cero, de modo que el modelo crecido reproduce exactamente los logits del original al inicio. Después se aplicó un ajuste supervisado (SFT) sobre 4.691 diálogos cortos y casuales generados sintéticamente.

Su relevancia es fundamentalmente didáctica: documenta de forma transparente el proceso completo (tokenizador, preentrenamiento, crecimiento de capas, SFT y verificación cruzada de formatos de pesos) y sirve como referencia reproducible de un pipeline de entrenamiento extremo a extremo en hardware de consumo. No compite en capacidad con modelos de escala media o grande.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama: RMSNorm, RoPE (theta 10000), SwiGLU, sin biases, embeddings de entrada/salida atados |
| Parámetros totales | 24.874.368 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | GGUF F16 proporcionado; no se ofrecen variantes cuantizadas |
| Idiomas soportados | Ruso (principal), algo de inglés, dígitos y símbolos |
| Licencia | no disponible (el autor dejó un TODO para elegir licencia antes de publicar) |
| Formato de pesos | safetensors (float32), pytorch_model.bin, GGUF (float16) |
| Capas | 11 |
| Dimensión oculta | 384 |
| Cabezas de atención | 6 (dimensión por cabeza 64) |
| Dimensión FFN | 1202 |
| Vocabulario | 8192 (BPE byte-level) |
| Formato de chat | `<\|user\|>...<\|assistant\|>...<\|eos\|>` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 11 capas con hidden size 384, 6 cabezas de atención de dimensión 64, FFN de 1202 y vocabulario de 8192 tokens BPE byte-level entrenado sobre el texto de preentrenamiento y los diálogos. Usa RMSNorm, RoPE con theta 10000, SwiGLU, sin biases y con embeddings de entrada/salida atados. Todo el entrenamiento se realizó desde inicialización aleatoria en una RTX 3060 (12 GB) en bf16, sin pesos de terceros.

El preentrenamiento se hizo en dos fases: primero un checkpoint de 6 capas, que después se hizo crecer a 11 capas insertando 5 capas nuevas entre las antiguas con proyecciones de salida inicializadas a cero (de modo que el modelo crecido calculaba exactamente los mismos logits que el de 6 capas al inicio, con diferencia máxima verificada de 0). Sobre esa base se entrenaron unos 300M tokens adicionales (4.577 pasos × 65.536) con ventanas de 25% Wikipedia y 75% OpenSubtitles, AdamW con lr 8e-4 y decaimiento coseno hasta 8e-5. La pérdida de validación final fue 2.916 en Wikipedia (perplejidad 18.5) y 2.943 en subtítulos (perplejidad 19.0). El ajuste fino (SFT) partió del checkpoint de 11 capas y usó 4.691 diálogos cortos y casuales, lr 2e-4, mejor época 3 por pérdida de validación y 300 diálogos reservados; la pérdida se calculó solo sobre tokens del asistente. Los diálogos de ajuste son sintéticos, escritos por Claude Haiku a partir de una especificación: unos 5.000 diálogos cortos casuales (62% de un solo intercambio, 28% de dos, 9% de tres) en diez grupos temáticos (saludos, estado de ánimo, preguntas sobre el propio asistente, charla cotidiana, aficiones, emociones y apoyo, peticiones simples y despedidas, entre otros). No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en ruso con estilo informal y breve.
- Chat multi-turno dentro de la ventana de 1024 tokens, con parada automática en `<|eos|>`.
- Comprensión limitada de inglés, dígitos y símbolos.
- Respuestas a preguntas simples sobre sí mismo (identidad del asistente).
- Charla cotidiana: hogar, comida, tiempo, aficiones, entretenimiento, emociones y apoyo.
- Peticiones simples: recomendar una película, contar un chiste, sugerir un nombre para un gato.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo "thinking".

## Casos de uso

- Demostración educativa de un pipeline completo de entrenamiento: sirve para ilustrar tokenizador, preentrenamiento, crecimiento de capas y SFT en una sola GPU de consumo, con código original incluido en `original/`.
- Chatbot de juguete para prototipos de interfaz: permite validar plantillas de chat, streaming y parada por token EOS en un servidor llama.cpp sin coste de infraestructura.
- Pruebas de integración de plantillas de chat: útil para verificar que un cliente aplica correctamente el formato `<|user|>...<|assistant|>...<|eos|>` y gestiona el truncado de turnos.
- Benchmark de referencia para modelos tiny: al ser reproducible y con pesos en tres formatos verificados entre sí, sirve como línea base en experimentos de cuantización o de comparación de runtimes.
- Servidor local de bajo consumo: con GGUF F16 y llama-server en `-c 1024` se puede desplegar en hardware modesto para demos offline en ruso.
- Investigación sobre crecimiento de capas: el checkpoint intermedio de 6 capas y la técnica de inserción con proyecciones a cero permiten estudiar el efecto del crecimiento de profundidad en modelos pequeños.
- Generación de diálogos sintéticos de estilo informal en ruso para aumentar datasets de chat, siempre con revisión humana por la baja fiabilidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de validación: Wikipedia 2.916 (perplejidad 18.5) y subtítulos 2.943 (perplejidad 19.0) tras el preentrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (24,9M parámetros × 4 bytes ≈ 100 MB de pesos) y aproximadamente 50 MB en F16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el entrenamiento se hizo en una RTX 3060 de 12 GB, pero la inferencia cabe en GPUs integradas y en CPU.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050 y superiores; también en CPU.
- Opciones de despliegue: `transformers` (safetensors o pytorch_model.bin), llama.cpp / llama-server con el GGUF F16, y endpoint compatible con OpenAI (`/v1/chat/completions`) del propio llama-server.
- Latencia y throughput: no disponibles de forma medida; por el tamaño del modelo se espera latencia de milisegundos por token en GPU moderna y decenas de milisegundos en CPU, pero no hay cifras publicadas.
- Contexto máximo de despliegue: 1024 tokens (`-c 1024` en llama-server).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SalgrAI-v2-Lite | 24,9M | 1024 | ru, en | no disponible | Hugging Face, GGUF F16 |
| Modelos tiny de la familia SmolLM | no disponible en la información proporcionada | no disponible | principalmente en | no disponible | no disponible |
| Modelos tiny de la familia Qwen | no disponible en la información proporcionada | no disponible | multilingüe | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El propio autor advierte que el modelo es demasiado pequeño para ser fiable: a menudo responde fuera de tema y comete errores en hechos y aritmética.
- No tiene filtro de seguridad ni de blasfemias; puede generar contenido inapropiado.
- Ventana de contexto muy corta (1024 tokens), lo que limita conversaciones largas; la referencia descarta los turnos más antiguos cuando se llena.
- El idioma principal es el ruso; el inglés es limitado y no hay soporte multilingüe amplio.
- Licencia sin definir en el momento de la publicación (el autor dejó un TODO), lo que impide determinar las restricciones de uso comercial.
- La plantilla de chat de Hugging Face no aplica el colapso de espacios, la neutralización de `<|` en el texto del usuario ni el descarte de turnos antiguos que sí hace el código de referencia, lo que abre la puerta a inyección de tokens de servicio.
- `transformers` aplica la penalización de repetición también a los tokens del prompt, mientras que el código de referencia solo la aplica a los generados, lo que puede producir diferencias de comportamiento.
- Los diálogos de ajuste son sintéticos y generados por otro modelo, lo que puede introducir sesgos de estilo y de contenido del generador.
- No apto para producción en tareas que requieran exactitud factual, matemáticas o razonamiento multi-paso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salgr/SalgrAI_v2_Lite
- Versión en ruso de la model card: README_RU.md en el mismo repositorio
- Código original y checkpoint nativo: carpeta `original/` del repositorio (`model.py`, `common.py`, `salgrai_original.pt`, `chat_example.py`)
- Pesos GGUF: `SalgrAI-v2-Lite-F16.gguf` en el repositorio
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
