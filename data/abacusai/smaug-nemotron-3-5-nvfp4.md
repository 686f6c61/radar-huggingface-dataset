# abacusai/Smaug-Nemotron-3.5-NVFP4

## Resumen

Smaug-Nemotron-3.5-NVFP4 es un ajuste fino (fine-tune) de tipo agéntico publicado por Abacus.AI sobre el checkpoint cuantizado NVFP4 de NVIDIA Nemotron 3.5 Super VL 120B-A12B. El modelo base es un vision-language híbrido Mamba-2 / MoE / Attention con codificador visual C-RADIO y cabeza MTP, con 120.000 millones de parámetros totales y 12.000 millones activos por token. La particularidad de esta release es que no se cuantiza un fine-tune en BF16, sino que se ajusta directamente el checkpoint NVFP4 ya cuantizado, de forma que los pesos que se entrenan son exactamente los que se sirven en inferencia.

El objetivo declarado es trasladar las ganancias agénticas del fine-tune en BF16 (`abacusai/Smaug-Nemotron-3.5`) al formato de 4 bits sin perderlas, algo que según el autor se perdería si se cuantizara a posteriori. Los datos de entrenamiento son trayectorias de código multi-turno con uso de herramientas, filtradas. La relevancia práctica es el coste: 4 bits dejan el modelo completo en unos 75 GB, aproximadamente un tercio de su tamaño en BF16, lo que permite servirlo en una sola H200, dos H100 o una GB200.

El modelo hereda la licencia OpenMDW 1.1 del base, solo declara inglés y conserva la ventana de contexto de hasta 1M tokens y el modo de razonamiento activado por defecto. Es un checkpoint de nicho (5 descargas y 5 likes en el momento de la ficha), pensado para sustituir directamente al NVFP4 de NVIDIA en stacks de serving ya existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + MoE + Attention, con codificador visual C-RADIO y cabeza MTP (multi-token prediction); código custom `nemotron_h_omni` |
| Parametros totales | 120B según la model card del autor; los metadatos de safetensors del repo reportan 65.769.840.138 elementos (discrepancia no explicada en la información disponible) |
| Parametros activos | 12B (MoE) |
| Longitud de contexto | Hasta 1M tokens (heredada del base) |
| Tipos de cuantizacion | NVFP4 en precisión mixta (`modelopt_mixed`, etiqueta `8-bit`): codificador visual, conector, convoluciones Mamba y embeddings en BF16; router MoE en FP32. No se publican pesos GGUF ni otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | OpenMDW License Agreement 1.1 (heredada del base; el campo `license` de HuggingFace figura como `other`) |
| Formato de pesos | Safetensors (modelopt NVFP4), tamaño del repo 75,0 GB; requiere `trust_remote_code` |

## Arquitectura y entrenamiento

La arquitectura es la del base sin cambios: un transformer híbrido que intercala capas Mamba-2 (modelo de espacio de estados) con capas de atención y capas MoE, más un codificador visual C-RADIO y un conector para entrada de imagen y vídeo. Incluye una cabeza MTP (predicción multi-token) que acelera la decodificación. El MoE mantiene 12B parámetros activos sobre 120B totales. La cuantización NVFP4 es mixta: se preservan en BF16 las partes sensibles (visión, conector, convoluciones Mamba, embeddings) y el router MoE se mantiene en FP32, mientras que las matrices de las capas lineales van en FP4.

El entrenamiento es un ajuste supervisado (SFT) sobre trayectorias de código agénticas multi-turno con uso de herramientas, filtradas. La innovación técnica declarada es que cada paso de entrenamiento ejecuta los pesos NVFP4 exactos que se sirven: el progreso de los pesos se acumula en precisión completa y el valor almacenado solo cambia cuando cruza un umbral de redondeo, con una función de pérdida diseñada para que el modelo mejore en la calidad de sus acciones manteniendo el razonamiento próximo al base. No se menciona RLHF ni DPO. El entrenamiento se realizó en un nodo de 8 GPU NVIDIA B300. El autor no publica el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, configurable mediante la plantilla de chat (`enable_thinking=True/False`).
- Entrada multimodal: texto, imágenes y vídeo; salida de texto (pipeline `image-text-to-text`).
- Codificación agéntica: uso de herramientas y ejecución de trayectorias multi-paso orientadas a tareas de software (el eje donde se concentran las mejoras declaradas).
- Razonamiento multi-paso y planificación en entornos de terminal y repositorios (evaluado en Terminal-Bench 2.1, DeepSWE, SWE-bench Multilingual, NL2RepoBench).
- Contexto largo de hasta 1M tokens, evaluado por el autor en AA-LCR con paridad respecto al base.
- Comprensión visual evaluada en V* con paridad respecto al base.
- Capacidades matemáticas y de razonamiento científico evaluadas vía GPQA Diamond y SciCode (paridad con el base).
- Multilingüe: limitado a inglés según los metadatos del modelo.
- Sin soporte declarado de audio ni de generación de imágenes.

## Casos de uso

- Agente de codificación en terminal: el modelo está entrenado sobre trayectorias con herramientas y evaluado en Terminal-Bench 2.1 (+1,2 frente al base), por lo que encaja en bucles de tipo shell-agent que leen salida de comandos, editan ficheros y verifican resultados.
- Resolución de issues en repositorios multilingües: la mejora de +2,0 en SWE-bench Multilingual y +3,0 en DeepSWE lo hace adecuado para pipelines que reciben un issue, localizan el código relevante y generan un parche verificable.
- Generación de repositorios completos desde una especificación en lenguaje natural: con +1,9 en NL2RepoBench, sirve para scaffolding de proyectos y prototipado rápido dentro de un flujo con tests automáticos.
- Automatización de atención al cliente con captura de pantalla: al aceptar imagen y texto, puede interpretar capturas de error o interfaces y responder en conversaciones multi-turno, apoyándose en la ventana de 1M tokens para arrastrar historial e imágenes de contexto.
- Análisis de documentos y vídeo de larga duración: la ventana de hasta 1M tokens y la entrada de vídeo permiten resumir o extraer datos de material extenso sin trocear agresivamente, manteniendo coherencia entre fragmentos.
- Integración en CI/CD como revisor o reparador automático: el soporte de tool calling permite invocarlo desde un orquestador que le dé acceso a logs de build, diffs y ejecución de tests, con el modo thinking para depuraciones complejas.
- Despliegue on-premise con coste contenido: al ocupar unos 75 GB en NVFP4, cabe en una única H200 o GB200, lo que facilita servir un modelo de 120B en infraestructura propia con requisitos de privacidad.
- Asistente de investigación técnica con razonamiento explícito: activando y desactivando `enable_thinking` se puede separar la fase de razonamiento (coste alto) de la de respuesta (coste bajo) en función de la consulta.

## Benchmarks y rendimiento

Los datos publicados en la información disponible son únicamente deltas frente al checkpoint base NVFP4, no puntuaciones absolutas (la tabla con los valores absolutos aparece truncada en la model card). No se inventan cifras.

| Benchmark | Delta frente al base NVFP4 |
|---|---|
| LiveBench 2.0 (global, release 2026-10-14) | +2,9 |
| LiveBench 2.0 Coding | +10,9 |
| LiveBench 2.0 Agentic | +8,1 |
| DeepSWE | +3,0 |
| SWE-bench Multilingual | +2,0 |
| NL2RepoBench | +1,9 (ejecuciones propias del autor) |
| Terminal-Bench 2.1 | +1,2 |
| GPQA Diamond | paridad (delta no publicado) |
| LiveCodeBench v6 | paridad (delta no publicado) |
| SciCode | paridad (delta no publicado) |
| IFBench | paridad (delta no publicado) |
| AA-LCR (contexto largo) | paridad (delta no publicado) |
| V* (visión) | paridad (delta no publicado) |

Nota metodológica: el autor indica que las puntuaciones del base NVFP4 y del BF16 provienen de la model card de NVIDIA, salvo NL2RepoBench (ejecuciones propias) y LiveBench (livebench.ai).

## Requisitos de hardware

- VRAM estimada para los pesos: unos 75 GB en NVFP4 (aproximadamente un tercio de los ~240 GB que ocuparía en BF16). A esto hay que sumar caché KV y activaciones, cuyo tamaño crece con la longitud de contexto; para 1M tokens no se publican cifras.
- GPU recomendadas según el autor: una NVIDIA H200, una GB200, o dos H100.
- GPU consumer: no cabe en ninguna GPU de consumo actual (ni RTX 4090 de 24 GB ni RTX 5090 de 32 GB) por el tamaño de pesos; no es desplegable en una sola consumer GPU.
- Despliegue: el autor declara que cualquier stack capaz de servir el checkpoint NVFP4 de NVIDIA Nemotron 3.5 Super VL sirve este modelo como reemplazo directo. No se enumeran stacks concretos ni se publican pesos GGUF, por lo que llama.cpp u Ollama no están soportados de forma oficial en la información disponible.
- Entrenamiento: nodo de 8 GPU NVIDIA B300.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la cabeza MTP del base está orientada a decodificación especulativa, pero no se aportan métricas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Precisión | Licencia | Notas |
|---|---|---|---|---|---|---|
| abacusai/Smaug-Nemotron-3.5-NVFP4 | 120B (65,77B según safetensors) | 12B | 1M | NVFP4 mixta | OpenMDW 1.1 | Este modelo; +2,9 en LiveBench 2.0 y +3,0 en DeepSWE frente a su base |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 | 120B | 12B | 1M | NVFP4 mixta | OpenMDW 1.1 | Base directo; sirve de referencia de paridad en razonamiento, ciencia, IF y visión |
| abacusai/Smaug-Nemotron-3.5 | 120B | 12B | 1M | BF16 | OpenMDW 1.1 | Hermano en BF16 del mismo fine-tune; ocupa aproximadamente el triple de VRAM |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes (por ejemplo, alternativas densas o MoE de tamaño similar); se indica como no disponible en lugar de estimarlo.

## Limitaciones y advertencias

- Idioma: solo inglés declarado. No hay evidencia de calidad en castellano ni en otros idiomas.
- Licencia: OpenMDW 1.1, heredada del base. Es una licencia con términos propios (no es Apache 2.0 ni MIT); hay que revisar el texto completo antes de un uso comercial o de redistribución.
- Magnitud de las mejoras: los deltas son pequeños (entre +1,2 y +3,0 en benchmarks de código, salvo LiveBench Coding con +10,9). El propio autor advierte que es un cambio lo bastante pequeño como para desaparecer si se cuantizara a posteriori, lo que sugiere fragilidad ante cambios de stack o de calibración.
- Dependencia del formato: al ser un fine-tune sobre NVFP4, las ganancias están ligadas a servir exactamente ese checkpoint. Convertirlo a BF16 u otra precisión no está soportado ni evaluado.
- Riesgo de alucinación: no se publican tasas de alucinación ni evaluaciones de factualidad; en tareas agénticas con ejecución de herramientas el riesgo se traslada a acciones incorrectas sobre el entorno.
- Sesgos: no se documenta ningún análisis de sesgos ni composición del dataset más allá de "trayectorias de código multi-turno con herramientas, filtradas".
- Contexto largo: la ventana es de hasta 1M tokens, pero no se publican resultados absolutos de AA-LCR, solo paridad con el base; el coste de memoria de caché KV a longitudes extremas no está cuantificado.
- Discrepancia de parámetros: la model card declara 120B totales mientras los metadatos de safetensors suman 65.769.840.138 elementos. No se explica en la información disponible; conviene verificarlo antes de dimensionar infraestructura.
- Código custom: requiere `trust_remote_code=True` y la implementación `nemotron_h_omni`, lo que añade superficie de confianza y posibles incompatibilidades con versiones de `transformers`.
- Madurez: 5 descargas y 5 likes en el momento de la ficha; ecosistema y reportes de terceros prácticamente inexistentes.
- Rendimiento en Hopper: el autor indica que cabe en dos H100, pero no publica latencias ni comparativas frente a Blackwell; el rendimiento efectivo de FP4 fuera de Blackwell no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abacusai/Smaug-Nemotron-3.5-NVFP4
- Modelo base (NVIDIA NVFP4): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Hermano en BF16: https://huggingface.co/abacusai/Smaug-Nemotron-3.5
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- LiveBench: https://livebench.ai
- Organización Abacus.AI en HuggingFace: https://huggingface.co/abacusai
- Sitio de Abacus.AI: https://abacus.ai/
- Producto ChatLLM: https://chatllm.abacus.ai/
- Abacus AI Studio: https://studio.abacus.ai/
- Soluciones enterprise: https://abacus.ai/solutions
