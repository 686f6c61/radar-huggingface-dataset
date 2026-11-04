# ojuliio/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y de tipo agéntico, distribuido con pesos abiertos. Según la model card, se trata del modelo más capaz de la clase 3T (tres billones de parámetros) de Moonshot AI hasta la fecha, y el primero de la serie K3.1. Deriva de Kimi K3 mediante un post-entrenamiento con aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios, y está orientado a tareas de codificación, creación 3D, investigación financiera y flujos agénticos.

La arquitectura es un transformer de mezcla de expertos (MoE) con 2,8 billones de parámetros totales y 104.000 millones activos por token. Combina dos mecanismos de atención: 69 capas KDA (Kimi Delta Attention) y 24 capas Gated DSA (DeepSeek Sparse Attention), con una ventana de contexto declarada de un millón de tokens. El vocabulario es de 160.000 entradas y el modelo procesa tanto texto como imágenes, con pipeline `image-text-to-text`.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo frontera de escala extrema con capacidades multimodales y agénticas. Por otro, conviene señalar que el repositorio de HuggingFace analizado (`ojuliio/Kimi-K3.1-Pro`) es una publicación de un tercero, no del organización oficial de Moonshot AI, con cero descargas y cero interacciones en el momento de la consulta. La model card incluida es un extracto parcial de la documentación oficial del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (69 capas KDA + 24 capas Gated DSA) |
| Parámetros totales | 2.780.110.363.392 (2,8 T) |
| Parámetros activos | 104 000 millones (104 B) |
| Longitud de contexto | 1 000 000 tokens (declarado en la model card) |
| Tipos de cuantización | 8-bit (etiqueta `8-bit` y `compressed-tensors` en el repo) |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia propia, `license: other`) |
| Formato de pesos | safetensors (con `compressed-tensors`), código custom (`custom_code`) |
| Capas totales | 93 (1 densa) |
| Dimensión de atención | 7168 |
| Cabezas de atención | 96 |
| Dimensión latente MoE | 3584 |
| Dimensión oculta por experto | 3072 |
| Número de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Dimensión de cabeza índice DSA | 128 |
| Cabezas índice DSA | 32 |
| Top-K índice DSA | 2048 |
| Tamaño del vocabulario | 160 000 |
| Tamaño del repositorio | 1561,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 93 capas, de las cuales solo una es densa. La atención no es uniforme: 69 capas emplean KDA (Kimi Delta Attention) y 24 emplean Gated DSA (DeepSeek Sparse Attention), una combinación híbrida que busca equilibrar eficiencia en contexto largo y capacidad de recuperación de información. La capa DSA incorpora un mecanismo de indexación con 32 cabezas de dimensión 128 y un top-K de 2048, lo que sugiere una selección dispersa de claves y valores para reducir el coste cuadrático en ventanas de un millón de tokens.

La MoE tiene 896 expertos, de los que se activan 16 por token, más 2 expertos compartidos. La dimensión latente de la MoE es 3584 y cada experto tiene una dimensión oculta de 3072. El vocabulario es de 160 000 tokens. Según la model card, el post-entrenamiento se realizó con aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, partiendo de Kimi K3. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO diferenciadas.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto de forma nativa (pipeline `image-text-to-text`), lo que permite entrada multimodal.
- Razonamiento agéntico multi-paso, según la model card orientada a "agentic capabilities".
- Codificación y generación de código, con mejoras declaradas en tareas de programación.
- Creación 3D, citada explícitamente como dominio de mejora.
- Investigación financiera, citada como dominio de mejora.
- Precisión factual, citada como área de mejora respecto a Kimi K3.
- Ventana de contexto de hasta 1 000 000 de tokens para documentos y conversaciones extensas.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repo).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Análisis de documentación extensa: con una ventana de un millón de tokens, el modelo puede ingerir informes anuales completos, expedientes o bases de código de gran tamaño en una sola pasada, sin necesidad de fragmentación ni recuperación externa.
- Investigación financiera asistida: la model card cita este dominio como área de mejora; el modelo puede resumir informes, extraer métricas y cruzar datos entre documentos largos manteniendo el contexto.
- Generación y revisión de código en pipelines: su orientación a codificación y su compatibilidad con endpoints permiten integrarlo en flujos de revisión automática, generación de tests o refactorización sobre repositorios completos.
- Creación 3D y flujos de diseño: la capacidad multimodal y la mejora declarada en creación 3D lo hacen adecuado para tareas que combinan descripciones textuales e imágenes de referencia.
- Agentes autónomos multi-paso: el post-entrenamiento con RL sobre dominios downstream y la ventana de contexto larga favorecen tareas que requieren planificación, uso de herramientas y memoria de estado a lo largo de muchas interacciones.
- Asistentes conversacionales multimodales: al aceptar imagen y texto, puede gestionar soporte técnico donde el usuario adjunta capturas de pantalla o diagramas junto con texto.
- Procesamiento de bases de conocimiento internas: la ventana de contexto permite consultar manuales y políticas completas sin trocear, reduciendo pérdidas de información en los bordes de los fragmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmética, con 2,78 billones de parámetros y pesos en 8 bits, el peso del modelo rondaría los 2,8 TB, lo que excede con mucho cualquier configuración de una sola GPU. El tamaño del repositorio (1561,4 GB) sugiere que la publicación contiene una versión comprimida, pero no se detalla la configuración exacta.
- GPU recomendadas: no disponible en la información proporcionada. Por escala, el despliegue requeriría clústeres multi-nodo con GPUs de centro de datos (A100, H100, H200 o equivalentes); no es viable en GPUs de consumo.
- ¿Cabe en GPU de consumo? No. Ni siquiera con cuantizaciones agresivas, el tamaño de los pesos y la arquitectura MoE de 896 expertos impiden su ejecución en RTX 4090, RTX 3090 o similares.
- Opciones de despliegue: la librería declarada es `transformers` con `custom_code` y `compressed-tensors`. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8 T | 104 B | 1 000 000 | `kimi-k3.1-pro` (propia) | Pesos abiertos en HF (repo de tercero) |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Referenciado como base del post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio de HuggingFace (`ojuliio/Kimi-K3.1-Pro`) no pertenece a la organización oficial de Moonshot AI; es una publicación de un tercero con cero descargas y cero interacciones. No hay garantía de que los pesos sean fieles al modelo original.
- La model card incluida está truncada: el bloque de especificaciones se corta en "Context Length", por lo que parte de la información técnica puede faltar o estar incompleta.
- La licencia `kimi-k3.1-pro` es una licencia propia (`license: other`); no se detallan en la información disponible las restricciones de uso comercial, redistribución ni atribución. Es imprescindible revisar el texto completo de la licencia antes de cualquier uso en producción.
- No se especifican los idiomas soportados, lo que impide evaluar su rendimiento en castellano u otras lenguas distintas del inglés.
- Riesgo de alucinación: no cuantificado en la información disponible; como en cualquier modelo generativo de gran escala, debe validarse la salida en dominios factuales.
- Sesgos conocidos: no documentados en la información proporcionada.
- El tamaño extremo del modelo (2,8 T de parámetros, repositorio de 1,5 TB) hace inviable su despliegue en infraestructura convencional y exige clústeres especializados.
- No se confirma soporte de tool calling, modo thinking ni capacidades de audio, pese a la orientación agéntica declarada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ojuliio/Kimi-K3.1-Pro
- Organización oficial en HuggingFace: https://huggingface.co/moonshotai
- Página oficial de Moonshot AI: https://www.moonshot.ai
- Chat de Kimi: https://www.kimi.ai
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Guía rápida de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- X (Twitter) de Kimi: https://twitter.com/kimi_moonshot
- ModelScope de Moonshot AI: https://modelscope.cn/organization/moonshotai
- Licencia (referenciada en la model card): https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
