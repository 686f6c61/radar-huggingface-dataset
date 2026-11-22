# omegabaer/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje y visión de tipo agéntico, con pesos abiertos, desarrollado por Moonshot AI. Se trata del modelo de clase 3T más capaz publicado por el laboratorio hasta la fecha y el primero de la serie K3.1. Está construido sobre Kimi K3 mediante un post-entrenamiento con aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios, y su rasgo más distintivo es una ventana de contexto de un millón de tokens.

Arquitectura híbrida de mezcla de expertos (MoE) con 2,8 billones de parámetros totales y 104.000 millones activados por token, distribuidos en 93 capas. Combina 69 capas de atención KDA con 24 capas de atención DSA con compuerta, e incorpora 896 expertos enrutados más 2 expertos compartidos, seleccionando 16 expertos por token. El modelo es nativamente multimodal (texto e imagen) y está orientado a tareas de agente, generación de código, creación 3D e investigación financiera.

La relevancia de esta ficha radica en que el repositorio de Hugging Face analizado (`omegabaer/Kimi-K3.1-Pro`) es una redistribución no oficial del modelo de Moonshot AI, con pesos en formato safetensors cuantizados a 8 bits mediante compressed-tensors y un tamaño de repositorio de 1.561,4 GB. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) híbrida con atención KDA y Gated DSA |
| Parámetros totales | 2.780.110.363.392 (2,8T) |
| Parámetros activos | 104B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantización | 8-bit (compressed-tensors); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (license: other, licencia personalizada) |
| Formato de pesos | safetensors (compressed-tensors) |

Otros datos técnicos declarados por el autor: 93 capas (1 densa), dimensión oculta de atención 7168, 96 cabezas de atención, dimensión de índice DSA 128, 32 cabezas de índice DSA, top-K DSA de 2048, dimensión latente MoE 3584, dimensión oculta por experto 3072, 896 expertos, 16 expertos seleccionados por token, 2 expertos compartidos y vocabulario de 160K.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de mezcla de expertos con una composición de atención híbrida: 69 capas de atención KDA (Kimi Delta Attention) y 24 capas de atención DSA (DeepSeek Sparse Attention) con compuerta. La atención DSA utiliza 32 cabezas de índice de dimensión 128 con un top-K de 2048, lo que sugiere un mecanismo de atención dispersa orientado a sostener ventanas de contexto muy largas con coste computacional controlado. El enrutamiento MoE selecciona 16 de los 896 expertos por token, además de 2 expertos compartidos, sobre una dimensión latente de 3584 y una dimensión oculta por experto de 3072.

El post-entrenamiento se realizó a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, según indica la model card. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO más allá de la mención al RL conjunto. Tampoco se detallan innovaciones como decodificación especulativa o mecanismos de atención lineal más allá de la propia atención dispersa DSA.

## Capacidades

- Generación de texto y razonamiento de propósito general, con mejoras declaradas en precisión factual.
- Generación y comprensión de código, con mejoras específicas en tareas de programación.
- Capacidades multimodales nativas de entrada imagen-texto (pipeline `image-text-to-text`).
- Creación 3D, según la model card.
- Investigación financiera y análisis de dominios especializados.
- Capacidades agénticas: el modelo se describe como "agentic model", orientado a flujos multi-paso.
- Ventana de contexto de 1M tokens para conversaciones y documentos extensos.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Análisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir bases de código extensas y responder preguntas sobre arquitectura, dependencias y deuda técnica sin fragmentar el código en trozos.
- Agentes de automatización multi-paso: su naturaleza agéntica y su post-entrenamiento en cientos de dominios lo hacen adecuado para orquestar tareas encadenadas con herramientas externas, siempre que se valide el soporte real de function calling.
- Generación de código en producción: puede integrarse en pipelines de revisión y generación de parches, aprovechando sus mejoras declaradas en programación.
- Investigación financiera asistida: análisis de informes, memorandos y series de datos extensas dentro de una única ventana de contexto, con énfasis en precisión factual.
- Creación 3D y prototipado: generación de descripciones, especificaciones o código de escenas 3D a partir de instrucciones e imágenes de referencia.
- Procesamiento de documentos largos con imágenes: al ser multimodal imagen-texto, puede extraer información de informes escaneados, gráficos y tablas combinados con texto.
- Asistencia conversacional de contexto largo: atención al cliente o asistencia técnica con historiales de conversación muy extensos sin pérdida de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8T de parámetros en 8 bits, los pesos ocupan aproximadamente 2,8 TB, por lo que la inferencia requiere un clúster multi-GPU de gran escala. No es viable en una sola GPU.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo, se necesitarían nodos con múltiples aceleradores de memoria alta (tipo H100/H200 o superiores) distribuidos.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 3090, etc.) ni en configuraciones multi-GPU domésticas.
- Opciones de despliegue: el repositorio usa `transformers` con `custom_code` y compressed-tensors; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro (esta ficha) | 2,8T | 104B | 1M | kimi-k3.1-pro (other) | Pesos en HF (redistribución no oficial) |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva K3.1 Pro |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El repositorio `omegabaer/Kimi-K3.1-Pro` no es el repositorio oficial de Moonshot AI; se trata de una redistribución de terceros con 0 descargas y 0 likes en el momento de la consulta.
- La licencia es personalizada (`kimi-k3.1-pro`, license: other); es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial.
- El tamaño del repositorio (1.561,4 GB) y los 2,8T de parámetros hacen inviable el despliegue fuera de infraestructura de clúster.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano.
- No hay información sobre sesgos conocidos ni sobre tasas de alucinación medidas.
- La model card está truncada en la información disponible; faltan secciones como detalles de entrenamiento, evaluación y uso responsable.
- Al ser un modelo agéntico con capacidad de ejecutar acciones, requiere salvaguardas y validación humana en entornos de producción.
- La cuantización a 8 bits puede degradar ligeramente la calidad respecto a los pesos originales en precisión completa.

## Enlaces

- Repositorio en Hugging Face (redistribución): https://huggingface.co/omegabaer/Kimi-K3.1-Pro
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Documentación de la API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Sitio web de Kimi: https://www.kimi.ai
- Página de Moonshot AI: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
