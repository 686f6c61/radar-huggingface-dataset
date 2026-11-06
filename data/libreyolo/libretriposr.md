# LibreYOLO/LibreTripoSR

## Resumen

LibreTripoSR es un paquete de distribución del modelo TripoSR, desarrollado originalmente por Tripo AI y Stability AI y publicado en 2024 bajo el artículo "TripoSR: Fast 3D Object Reconstruction from a Single Image". Se trata de un modelo feed-forward de reconstrucción 3D a partir de una única imagen: recibe una fotografía de un objeto y devuelve una malla triangular con colores por vértice. LibreYOLO lo reempaqueta para que se ejecute en PyTorch puro y genere mallas con scikit-image, sin dependencias de CUDA propietarias.

El repositorio no contiene pesos nuevos ni reentrenados: `config.yaml` y `model.ckpt` son byte a byte idénticos a los del repositorio upstream `stabilityai/TripoSR`, en la revisión `5b521936b01fbe1890f6f9baed0254ab6351c04a`. La propuesta de valor es la integración con el ecosistema LibreYOLO (API `LibreGen`, CLI `libreyolo generate`) y la portabilidad a NVIDIA, Apple Silicon (MPS) y CPU.

La relevancia actual reside en la reproducibilidad y la licencia MIT: permite incorporar reconstrucción 3D monocular en pipelines de producción sin ataduras a frameworks de investigación, con un tamaño de repositorio de 1,7 GB y una única pasada de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer feed-forward con encoder de imagen DINO ViT-B/16, transformer de triplanos, upsampler y MLP NeRF |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de una sola imagen) |
| Tipos de cuantizacion | no disponible (pesos en `model.ckpt`, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `model.ckpt` (checkpoint PyTorch) y `config.yaml` |

## Arquitectura y entrenamiento

TripoSR sigue un diseño feed-forward en una sola etapa. Un encoder de imagen DINO ViT-B/16 extrae características de la fotografía de entrada; un transformer de triplanos proyecta esas características en tres planos ortogonales que representan la geometría implícita; un módulo upsampler incrementa la resolución de los triplanos; y un MLP tipo NeRF decodifica densidad y color para extraer la malla final mediante marching cubes (implementado aquí con scikit-image). La salida es una malla triangular con color por vértice, sin texturas UV.

El entrenamiento upstream se realizó sobre renders de un subconjunto curado de Objaverse 1.0 (AllenAI), publicado bajo licencia CC-BY. No se dispone de información sobre el número exacto de tokens, composición detallada del dataset ni sobre si se aplicaron etapas de RLHF o DPO (no aplicables en un modelo de reconstrucción 3D). La innovación principal del trabajo original es la velocidad: una única pasada feed-forward sustituye a los pipelines de optimización por escena típicos de los métodos basados en NeRF o Gaussian Splatting.

## Capacidades

- Reconstrucción 3D monocular: genera una malla triangular a partir de una sola imagen RGB de un objeto.
- Color por vértice: la malla resultante incluye color en los vértices, exportable a OBJ.
- Eliminación de fondo integrada: LibreYOLO aplica BiRefNet (MIT), cargado desde `LibreYOLO/LibreTRELLISl`, antes de la inferencia.
- Ejecución multiplataforma: NVIDIA (CUDA), Apple Silicon (MPS) y CPU mediante PyTorch puro.
- API programática: `LibreGen("triposr")` con llamada directa y guardado a `.obj`.
- CLI: `libreyolo generate source=chair.png model=triposr`.
- Sin tool calling, sin capacidades de agente, sin razonamiento multi-paso y sin procesamiento de lenguaje natural: es un modelo puramente image-to-3D.

## Casos de uso

- Digitalización de catálogo de producto: a partir de una foto de estudio de un objeto se genera una malla OBJ para visores 3D web o configuradores, aprovechando la inferencia en una sola pasada.
- Prototipado rápido en diseño industrial: convertir bocetos o fotos de referencia en mallas base sobre las que iterar en Blender, sin pipeline de fotogrametría.
- Generación de assets para videojuegos y realidad aumentada: producir mallas de props a partir de imágenes de referencia para su posterior retopología y texturizado.
- E-commerce con vista 3D: generar automáticamente modelos 3D de productos a partir de las imágenes ya existentes en la ficha, reduciendo el coste de captura dedicada.
- Docencia y divulgación: demostrar reconstrucción 3D monocular en CPU o Apple Silicon sin GPU dedicada, gracias al soporte MPS y CPU de LibreYOLO.
- Investigación en visión 3D: usar el checkpoint upstream byte-idéntico como baseline reproducible para comparar nuevos métodos de image-to-3D bajo licencia MIT.
- Automatización de pipelines de contenido: integrar `libreyolo generate` en scripts por lotes para procesar carpetas de imágenes y emitir mallas OBJ de forma desatendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 1,7 GB, lo que da una cota inferior del orden de 2 GB para los pesos en precisión nativa.
- GPU recomendadas: no disponibles en la información proporcionada; el modelo soporta CUDA, MPS y CPU según la model card.
- GPU de consumo: la model card no confirma compatibilidad con RTX 4090 u otras GPU de consumo; el soporte de CPU y Apple Silicon sugiere que el modelo cabe en entornos sin GPU dedicada.
- Opciones de despliegue: librería `libreyolo` (PyTorch puro) y CLI `libreyolo generate`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreTripoSR | no disponible | 1 imagen | malla con color por vértice | MIT | Hugging Face (LibreYOLO/LibreTripoSR) |
| TripoSR (upstream) | no disponible | 1 imagen | malla con color por vértice | MIT | Hugging Face (stabilityai/TripoSR) |
| Otros modelos image-to-3D | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada con datos es frente al repositorio upstream `stabilityai/TripoSR`, del que este paquete es un espejo byte-idéntico en pesos y configuración. No se dispone de información sobre alternativas como TRELLIS u otros modelos image-to-3D en la búsqueda realizada.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: cualquier limitación del TripoSR original se hereda íntegramente.
- La model card upstream solicita no usar el modelo para crear o difundir deliberadamente modelos 3D que puedan resultar perturbadores, angustiosos u ofensivos, ni contenido que perpetúe estereotipos históricos o actuales.
- Entrada restringida a una sola imagen de un objeto; no se documenta soporte para escenas complejas, múltiples objetos ni imágenes con oclusión severa.
- Sin capacidades de lenguaje: no procesa texto ni mantiene conversación; los tags de idioma no aplican.
- Riesgo de alucinación geométrica: al ser un modelo generativo feed-forward, puede inventar geometría no visible en la imagen (caras ocultas, partes traseras).
- No se documentan variantes cuantizadas ni formatos GGUF/ONNX; el despliegue está ligado a PyTorch y a la librería `libreyolo`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- La licencia MIT permite uso comercial, pero conviene revisar `NOTICE` y `LICENSE` para las atribuciones de los pesos upstream y de BiRefNet.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreTripoSR
- Repositorio upstream en Hugging Face: https://huggingface.co/stabilityai/TripoSR
- Código upstream: https://github.com/VAST-AI-Research/TripoSR
- Artículo: https://arxiv.org/abs/2403.02151
- Dataset Objaverse: https://objaverse.allenai.org/objaverse-1.0
- Modelo de segmentación usado para fondos: https://huggingface.co/LibreYOLO/LibreTRELLISl
- Documentación de modelos LibreYOLO: https://www.libreyolo.com/docs/models
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
