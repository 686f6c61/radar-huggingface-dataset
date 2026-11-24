# eyes-ml/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-Base-BF16

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-Base-BF16 es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario eyes-ml, que actúa como espejo o reempaquetado de un modelo de la familia Nemotron de NVIDIA. El identificador indica 120B parámetros totales con 12B activos, lo que sugiere una arquitectura de mezcla de expertos (MoE), y el sufijo "VL" apunta a capacidades de visión-lenguaje. El tag `nemotron_h_omni` y la presencia de `mtp` (multi-token prediction) en los metadatos refuerzan la hipótesis de una arquitectura híbrida con decodificación especulativa.

El modelo se distribuye en formato BF16 con pesos safetensors y requiere `transformers` con código personalizado (`custom_code`), lo que implica que no funciona con una instalación estándar sin confiar en el repositorio remoto. La ficha oficial de Hugging Face no incluye model card descriptiva, datos de entrenamiento, benchmarks ni licencia explícita, por lo que gran parte de la información técnica debe marcarse como no disponible.

Su relevancia potencial radica en combinar un tamaño grande con activación dispersa (12B activos de 120B), lo que abarataría la inferencia frente a un modelo denso equivalente, y en añadir entrada de imagen a un modelo de lenguaje de la familia Nemotron. Sin embargo, al no haber descargas ni validación comunitaria, debe tratarse como un artefacto a verificar antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron H Omni (transformer híbrido multimodal, presumiblemente MoE; no confirmado en la model card) |
| Parametros totales | 120B (según identificador del repositorio) |
| Parametros activos | 12B (según identificador del repositorio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, es, fr, de, it, ja (según tags del repositorio) |
| Licencia | no disponible (tag `license:other` sin texto de licencia) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El tag `nemotron_h_omni` sugiere una arquitectura de la familia Nemotron H, que en versiones previas de NVIDIA combina capas de atención con capas de estado recurrente (SSM) en un esquema híbrido. El sufijo "Omni" y la pipeline `image-text-to-text` indican que el modelo acepta imágenes además de texto. La presencia del tag `mtp` apunta a multi-token prediction, técnica habitual para entrenamiento con cabezas auxiliares y para decodificación especulativa en inferencia. El identificador 120B-A12B es consistente con un transformer de mezcla de expertos con aproximadamente 12B parámetros activos por token.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (el tag referencia `nvidia/nemotron-pre-training-datasets`), ni sobre si hubo fases de RLHF, DPO o ajuste por preferencias. El sufijo "Base" indica que se trata de un modelo preentrenado sin ajuste instruccional, por lo que no cabe esperar alineación conversacional ni formato de chat nativo. No hay información sobre innovaciones adicionales más allá de las inferidas por los tags.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen + texto), según la pipeline `image-text-to-text`.
- Procesamiento de imágenes como entrada, con salida en lenguaje natural (descripción, respuesta a preguntas visuales, presumiblemente).
- Capacidades multilingües limitadas a los idiomas declarados en los tags: inglés, español, francés, alemán, italiano y japonés.
- Soporte de tool calling / function calling: no disponible (no confirmado).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base, sin ajuste instruccional).
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de audio: no disponibles.
- Al ser un modelo "Base", no incluye plantilla de chat ni comportamiento conversacional alineado.

## Casos de uso

- Investigación en arquitecturas MoE multimodales: el modelo permite estudiar el comportamiento de un transformer híbrido con 12B parámetros activos sobre 120B totales, útil para experimentos académicos sobre eficiencia de activación y enrutamiento de expertos.
- Fine-tuning supervisado para tareas de visión-lenguaje: al ser un modelo base, sirve como punto de partida para ajustar sobre datasets propios de image captioning, VQA o document understanding, aprovechando el tamaño del modelo con un coste de inferencia contenido.
- Extracción de información de documentos escaneados: con ajuste previo, podría emplearse para convertir facturas, formularios o informes en texto estructurado, aunque requiere validación empírica al no haber benchmarks publicados.
- Generación de descripciones de imágenes a escala: en pipelines de catalogación de imágenes o accesibilidad, un modelo base multimodal puede adaptarse mediante fine-tuning para producir descripciones consistentes.
- Evaluación comparativa de modelos Nemotron: útil para replicar o contrastar resultados de la familia Nemotron en entornos controlados, dado que el repositorio es un espejo BF16.
- Base para destilación: los 12B parámetros activos pueden servir como profesor en procesos de destilación hacia modelos más pequeños para despliegue en producción.
- Experimentación con decodificación especulativa: la presencia de `mtp` permite probar técnicas de multi-token prediction en un modelo de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 240 GB solo para pesos (120B × 2 bytes), más overhead de activaciones y caché KV; no cabe en ninguna GPU consumer.
- Cuantización a 8 bits: ~120 GB, requiere múltiples GPUs (por ejemplo, 2× H100 80GB o 4× A100 40GB).
- Cuantización a 4 bits: ~60 GB, podría caber en una sola H100 80GB o en 2× RTX 4090 24GB con técnicas de offloading, aunque con latencia elevada.
- GPU recomendadas: H100 80GB, H200, A100 80GB; configuraciones multi-GPU con NVLink para tensor parallelism.
- No cabe en GPU consumer individuales (RTX 4090, 3090, 4080) en BF16 ni en 8 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por `custom_code`); vLLM, TGI o llama.cpp solo si existe soporte para la arquitectura `nemotron_h_omni`, que no está confirmado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-Base-BF16 | 120B | 12B | no disponible | no disponible | Hugging Face (espejo, 0 descargas) |
| Modelos Nemotron previos de NVIDIA | no disponible | no disponible | no disponible | no disponible | Hugging Face (repositorio oficial NVIDIA) |
| Alternativas MoE multimodales de gran escala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas; los datos de modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de model card: no hay documentación oficial sobre entrenamiento, datos, evaluación ni limitaciones conocidas.
- Licencia `other` sin texto: no se puede confirmar si el uso comercial está permitido; contactar con el autor o con NVIDIA antes de cualquier despliegue productivo.
- Repositorio espejo sin descargas ni likes: no hay validación comunitaria de que los pesos sean correctos o estén completos.
- Requiere `trust_remote_code=True`: ejecutar código personalizado del repositorio implica un riesgo de seguridad si no se audita.
- Modelo base sin alineación: alta probabilidad de respuestas incoherentes, sesgos no mitigados y alucinaciones en uso conversacional directo.
- Idiomas limitados a los seis declarados; el rendimiento en español no está verificado empíricamente.
- Sin benchmarks publicados: imposible estimar calidad relativa frente a alternativas.
- Tamaño prohibitivo para la mayoría de entornos: 240 GB en BF16 exigen infraestructura multi-GPU profesional.
- Riesgo de que el identificador "120B-A12B" no se corresponda con la realidad de los pesos; verificar shapes al cargar.

## Enlaces

- Hugging Face: https://huggingface.co/eyes-ml/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-Base-BF16
- Dataset referenciado en tags: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Repositorio oficial de NVIDIA en Hugging Face (para contrastar con el espejo): https://huggingface.co/nvidia
