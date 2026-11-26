# abacusai/Smaug-Nemotron-3.5-NVFP4

## Resumen

Smaug-Nemotron-3.5-NVFP4 es un ajuste fino (fine-tune) de tipo agéntico desarrollado por Abacus.AI sobre el checkpoint cuantizado en NVFP4 de NVIDIA Nemotron 3.5 Super VL 120B-A12B. El modelo base es un vision-language model híbrido de arquitectura Mamba-2 + MoE + Attention, con 120.000 millones de parámetros totales y 12.000 millones activos por token, que NVIDIA distribuye ya cuantizado en NVFP4. Abacus.AI ha reentrenado directamente ese checkpoint cuantizado (en lugar de cuantizar a posteriori un fine-tune en BF16) para preservar las ganancias agénticas en 4 bits.

El modelo resuelve el problema de obtener mejoras de razonamiento agéntico y codificación sobre el base manteniendo el coste de despliegue del formato NVFP4: los pesos en 4 bits ocupan aproximadamente 75 GB, un tercio de su tamaño en BF16, lo que permite servirlo en una sola H200, dos H100 o una GB200. Según la model card, mejora al base en LiveBench 2.0 (+10,9 en Coding, +8,1 en Agentic, +5,2 global) y en benchmarks de codificación agéntica (DeepSWE +3,0, SWE-bench Multilingual +2,0, NL2RepoBench +1,9, Terminal-Bench 2.1 +1,2), manteniendo paridad en razonamiento, instrucciones, contexto largo y visión.

Es relevante ahora porque ofrece un modelo multimodal de 120B con ventana de hasta 1M tokens, modo de razonamiento configurable y capacidad de uso de herramientas, en un formato que reduce drásticamente los requisitos de VRAM frente a BF16, y como reemplazo directo (drop-in) en cualquier stack que ya sirva el checkpoint NVFP4 de NVIDIA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 + MoE + Attention híbrida, con encoder de visión C-RADIO y cabeza MTP |
| Parametros totales | 120B (65.769.840.138 según safetensors del repo) |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (mixed precision: encoder de visión, conector, convoluciones Mamba y embeddings en BF16; router MoE en FP32) |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW License Agreement, version 1.1 (heredada del base) |
| Formato de pesos | safetensors (transformers, modelopt_mixed, 8-bit) |

## Arquitectura y entrenamiento

El modelo hereda sin cambios la arquitectura del base: un híbrido de Mamba-2, capas MoE y atención, con encoder de visión C-RADIO y una cabeza MTP (multi-token prediction). La cuantización NVFP4 es mixta: el encoder de visión, el conector, las convoluciones de Mamba y los embeddings se mantienen en BF16, y el router MoE en FP32, mientras que el resto de pesos se almacenan en 4 bits.

El entrenamiento consiste en supervised fine-tuning sobre trayectorias agénticas multiturno filtradas que usan herramientas para codificación. La innovación clave es que el fine-tuning se aplica directamente sobre el checkpoint NVFP4, con una función de pérdida diseñada para ese formato: cada paso de entrenamiento ejecuta exactamente los pesos NVFP4 que se sirven, de modo que la mejora (acciones mejores y pensamiento próximo al base) sobrevive a la cuantización. El entrenamiento se realizó en un nodo de 8 GPUs NVIDIA B300. No se especifica en la información disponible el número de tokens de entrenamiento.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto, configurable mediante la plantilla de chat (`enable_thinking=True/False`).
- Codificación y codificación agéntica: resolución de tareas de software, uso de terminal, generación a partir de descripciones en lenguaje natural.
- Entrada multimodal: texto, imágenes y vídeo; salida de texto.
- Uso de herramientas (tool calling / function calling) en trayectorias multiturno.
- Comportamiento agéntico y razonamiento multi-paso.
- Contexto largo de hasta 1M tokens.
- Capacidades de visión evaluadas en V*.
- Idioma: inglés.

## Casos de uso

- Agente de codificación autónomo: el modelo puede ejecutar trayectorias multiturno con uso de herramientas para resolver issues y tareas de repositorio, apoyándose en sus mejoras en DeepSWE y SWE-bench Multilingual y en su ventana de hasta 1M tokens para mantener el contexto del proyecto.
- Automatización de terminal y operaciones: con la mejora en Terminal-Bench 2.1, es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en pipelines de CI/CD.
- Generación de código a partir de descripciones en lenguaje natural: útil para prototipado rápido y tareas NL2Repo, donde el modelo muestra +1,9 sobre el base.
- Asistencia sobre documentación técnica extensa: la ventana de 1M tokens permite procesar repositorios, manuales o especificaciones completas en una sola pasada.
- Análisis de imágenes y vídeo combinado con razonamiento: al aceptar entradas image-text-to-text, sirve para tareas de inspección visual, extracción de información de capturas o vídeos y respuesta en texto.
- Despliegue en infraestructura limitada: al ocupar unos 75 GB en NVFP4, se puede servir en una H200, dos H100 o una GB200, lo que lo hace viable para equipos con presupuesto de GPU acotado frente a un 120B en BF16.
- Sustitución directa en stacks existentes: cualquier servicio que ya sirva Nemotron 3.5 Super VL NVFP4 puede adoptarlo sin cambios de infraestructura.

## Benchmarks y rendimiento

La model card proporciona mejoras relativas frente al base NVFP4, pero no todos los valores absolutos están completos en la información disponible.

| Benchmark | Cambio frente al base NVFP4 |
|---|---|
| LiveBench 2.0 (global) | +5,2 |
| LiveBench 2.0 (Coding) | +10,9 |
| LiveBench 2.0 (Agentic) | +8,1 |
| DeepSWE | +3,0 |
| SWE-bench Multilingual | +2,0 |
| NL2RepoBench | +1,9 |
| Terminal-Bench 2.1 | +1,2 |
| GPQA Diamond | paridad con el base |
| LiveCodeBench v6 | paridad con el base |
| SciCode | paridad con el base |
| IFBench | paridad con el base |
| AA-LCR | paridad con el base |
| V* | paridad con el base |

Los valores absolutos de cada benchmark no están disponibles en la información proporcionada. Los resultados de LiveBench corresponden a la release 2026-10-14.

## Requisitos de hardware

- VRAM estimada: aproximadamente 75 GB para los pesos en NVFP4; hay que añadir la memoria de activaciones y caché KV, que no se detalla en la información disponible.
- GPU recomendadas: una NVIDIA H200, dos NVIDIA H100 o una NVIDIA GB200.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.) por el tamaño del checkpoint.
- Entrenamiento: se realizó en un nodo de 8 GPUs NVIDIA B300.
- Opciones de despliegue: cualquier stack compatible con el checkpoint NVFP4 de Nemotron 3.5 Super VL NVFP4, ya que es un reemplazo directo; la librería declarada es transformers con código personalizado (`nemotron_h_omni`, `custom_code`), y el repo es compatible con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Smaug-Nemotron-3.5-NVFP4 | 120B | 12B | 1M | OpenMDW 1.1 | Fine-tune agéntico sobre NVFP4, multimodal |
| NVIDIA Nemotron 3.5 Super VL 120B-A12B NVFP4 (base) | 120B | 12B | 1M | OpenMDW 1.1 | Base sin fine-tune agéntico; referencia de comparación |
| Smaug-Nemotron-3.5 (BF16) | 120B | 12B | 1M | OpenMDW 1.1 | Hermano en BF16 del mismo fine-tune |

No se dispone en la información proporcionada de comparativas con modelos de otros fabricantes de la misma categoría.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación: no se documenta en la información disponible; como modelo generativo, es un riesgo inherente en producción.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Licencia: OpenMDW 1.1 heredada; es necesario revisar sus términos para uso comercial y redistribución antes de desplegar en producción.
- Cuantización: aunque el fine-tune se realizó sobre los pesos NVFP4 servidos, cualquier cambio de formato o cuantización adicional puede degradar las ganancias reportadas.
- Datos de entrenamiento limitados a trayectorias agénticas de codificación filtradas; el comportamiento en dominios ajenos a codificación y agentes puede no reflejar las mejoras.
- No se especifican número de tokens de entrenamiento ni composición detallada del dataset.
- El modelo base es un checkpoint cuantizado de NVIDIA; los cambios respecto a él se limitan al fine-tune supervisado descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abacusai/Smaug-Nemotron-3.5-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Hermano en BF16: https://huggingface.co/abacusai/Smaug-Nemotron-3.5
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- LiveBench: https://livebench.ai
- Página de Abacus.AI: https://abacus.ai
- Perfil de Abacus.AI en Hugging Face: https://huggingface.co/abacusai
