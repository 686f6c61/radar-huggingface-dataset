# neuroneural/mindgrab

## Resumen
MindGrab es un modelo compacto de segmentación 3D para eliminación de tejido no cerebral (skull stripping) en neuroimagen, desarrollado por el proyecto BrainChop (neuroneural). Resuelve un paso previo habitual en cualquier pipeline de neuroimagen: aislar el parénquima cerebral del cráneo, cuero cabelludo y otras estructuras no cerebrales, de forma agnóstica a la modalidad de adquisición (T1w, T2w, FLAIR, DWI, EPI, MRA, PDw, qT1, CT y PET).

Su relevancia radica en el tamaño extremo del modelo: 146.237 parámetros (unos 585 KB en FP32), lo que permite ejecutarlo en segundos sobre portátiles, clústeres HPC e incluso directamente en el navegador mediante WebGPU/WebGL2 sin subir datos a ningún servidor. La arquitectura es una MeshNet 3D dilatada sin skip connections, con 25 bloques convolucionales ocultos y un clasificador 1×1×1.

El modelo se publica bajo licencia MIT con pesos en Safetensors, binario plano y checkpoint PyTorch, y va acompañado de un paper en *NeuroImage* (2026, acceso abierto). Está pensado para investigación y docencia en neuroimagen, no como dispositivo médico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MeshNet 3D dilatada sin skip connections (25 bloques convolucionales ocultos + clasificador 1×1×1) |
| Parametros totales | 146.237 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de volúmenes, no de texto) |
| Tipos de cuantizacion | no disponible; pesos publicados en FP32 |
| Idiomas soportados | en (metadatos del modelo; la tarea es de imagen, no lingüística) |
| Licencia | MIT |
| Formato de pesos | Safetensors (`model.safetensors`), binario plano (`model.bin`), PyTorch (`model.pth`) |

Otros detalles técnicos relevantes:

| Parametro | Valor |
|---|---|
| Canales ocultos | 15 |
| Clases de salida | 2 (fondo / cerebro) |
| Programa de dilatación | 5 ciclos repetidos de 16 → 8 → 4 → 2 → 1 (`kernel_size=3`) |
| Normalización y activación | GroupNorm no afín (`num_groups=15`) + GELU (aproximación racional tanh) |
| Preprocesado de entrada | Rejilla isótropa de 256³ a 1 mm; normalización por cuantiles 2–98 % con recorte a [0, 1]; en CT, recorte previo de unidades Hounsfield a [0, 100] |
| Espacio de salida | Rejilla de vóxeles nativa de la entrada (volumen con vóxeles no cerebrales a cero) + máscara binaria opcional `NIFTI_INTENT_LABEL` |
| Trazabilidad de pesos | Cabeceras NIfTI-1 con `brainchop <version> mindgrab/c9a01490 <backend>` |

## Arquitectura y entrenamiento
MindGrab emplea una MeshNet 3D puramente convolucional, sin conexiones residuales ni skip connections, con 15 canales ocultos y un esquema de dilatación cíclico (16 → 8 → 4 → 2 → 1, kernel 3×3×3) repetido cinco veces. Esta elección mantiene el campo receptivo amplio con un coste paramétrico mínimo, lo que explica los 146.237 parámetros totales. La normalización es GroupNorm no afín con 15 grupos y la activación es GELU aproximada mediante función racional tanh, una decisión orientada a la portabilidad numérica entre backends (Metal, CUDA, HIP, CPU multihilo, WebGPU/WebGL2).

La inferencia conforma la entrada a una rejilla isótropa de 256³ a 1 mm y aplica normalización por cuantiles 2–98 % con recorte a [0, 1]; para tomografías computarizadas se recortan antes las unidades Hounsfield a [0, 100]. La salida se devuelve en la rejilla nativa del volumen de entrada, con una máscara binaria opcional. El modelo no realiza registro afín, lo que constituye una limitación explícita documentada por el autor.

No se detalla en la información disponible el volumen de tokens ni la composición exacta del dataset de entrenamiento, ni si se emplearon técnicas de RLHF/DPO (no aplicables a una tarea de segmentación). El paper asociado es Fani et al., *NeuroImage* 2026 (DOI: 10.1016/j.neuroimage.2026.122074).

## Capacidades
- Segmentación 3D de cerebro (skull stripping) sobre volúmenes de RM en múltiples modalidades: T1w, T2w, FLAIR, DWI, EPI, MRA, PDw y qT1.
- Segmentación sobre CT y PET, con lógica específica de recorte de unidades Hounsfield para CT.
- Salida en el espacio nativo del volumen de entrada, con máscara binaria opcional (`NIFTI_INTENT_LABEL`).
- Dilatación o erosión opcional del borde de la máscara en milímetros (`border` / `borderMm`).
- Ejecución en múltiples backends: Metal, CUDA, HIP, CPU multihilo, WebGPU, WebGL2 y WASM multihilo.
- Ejecución 100 % en el navegador mediante Web Worker, sin subida de datos.
- API en línea de comandos (`brainchop`), Python (`brainchop`) y JavaScript (`@brainchop/core`).
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente de imagen.

## Casos de uso
- Preprocesado en pipelines de neuroimagen: eliminar cráneo y tejido no cerebral antes de registro, segmentación tisular o análisis morfométrico, con una llamada `brainchop input.nii.gz --skull-strip`.
- Procesamiento de estudios multimodales: aplicar el mismo modelo a T1w, T2w, FLAIR, DWI, EPI, MRA, PDw y qT1 sin cambiar de herramienta, gracias a su naturaleza agnóstica a la modalidad.
- Análisis de CT craneal: usar `--ct` para recortar unidades Hounsfield a [0, 100] antes de la normalización y obtener la máscara cerebral en segundos.
- Investigación con PET: aislar el parénquima en volúmenes PET dentro del mismo flujo de trabajo que las imágenes estructurales.
- Visor web de neuroimagen: integrar `@brainchop/core` en una aplicación JavaScript para segmentar en el cliente con WebGPU/WebGL2, sin enviar datos clínicos a servidores externos.
- Docencia y prototipado: ejecutar el modelo en un portátil sin GPU dedicada (backend CPU multihilo) para demostraciones y validación de pipelines.
- Procesamiento por lotes en HPC: desplegar los binarios nativos con selección automática de Metal, CUDA, HIP o CPU multihilo en clústeres para cohortes grandes.
- Control de calidad rápido: generar máscaras cerebrales de bajo coste para detectar volúmenes mal orientados o con artefactos antes de análisis más caros.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 146.237 parámetros en FP32 (~585 KB de pesos), el consumo dominante es el volumen de trabajo de la rejilla 256³, no los pesos.
- GPU recomendadas: no se especifican modelos concretos; el runtime selecciona automáticamente Metal (Apple), CUDA (NVIDIA), HIP (AMD) o CPU multihilo.
- Cabe en GPU de consumo: sí, por tamaño de pesos; el autor indica ejecución en portátiles y escritorios, aunque no detalla requisitos de memoria por backend.
- Opciones de despliegue: binarios nativos vía PyPI (`brainchop`) o Homebrew (`neuroneural/tap/brainchop`); API Python (`brainchop`); paquete npm `@brainchop/core` con WebGPU, WebGL2 y WASM multihilo; descarga directa del checkpoint Safetensors/PyTorch.
- Latencia y throughput: el autor indica ejecución "en segundos", sin cifras concretas publicadas en la información disponible.

## Comparativa con modelos similares
No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos de skull stripping (por ejemplo, SynthStrip, ROBEX o HD-BET) que permitan una comparación rigurosa de parámetros, contexto o resultados. Por tanto, la comparativa se marca como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MindGrab | 146.237 | no aplica | MIT | Hugging Face, PyPI, npm, Homebrew |
| Alternativas de skull stripping | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No es un dispositivo médico: no está aprobado ni autorizado para diagnóstico clínico ni planificación de tratamiento; su uso previsto es investigación y docencia.
- En CT es obligatorio activar el modo `ct` (`--ct`, `ct=True`, `ct: true`) para recortar las unidades Hounsfield a [0, 100] antes de la normalización por cuantiles; omitirlo degrada la segmentación.
- La inferencia conforma la entrada a una rejilla de 256³ a 1 mm sin registro afín, lo que puede afectar a volúmenes con geometría u orientación atípicas.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de falsos positivos o negativos en la máscara (inclusión de tejido no cerebral o eliminación de parénquima) en casos límite.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre distribuciones de neuroimagen concretas, el rendimiento puede degradarse en poblaciones o protocolos poco representados.
- Idiomas: los metadatos solo declaran inglés; la tarea no es lingüística, por lo que este punto no afecta al uso.
- Licencia MIT: permite uso comercial y modificación, pero la responsabilidad sobre el uso clínico recae en el usuario.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción aún muy limitada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/neuroneural/mindgrab
- Demo interactiva en el navegador (WebGPU Space): https://huggingface.co/spaces/neuroneural/mindgrab
- Proyecto BrainChop: https://brainchop.org
- Paper en *NeuroImage* (2026, acceso abierto): https://www.sciencedirect.com/science/article/pii/S1053811926003897
- DOI: https://doi.org/10.1016/j.neuroimage.2026.122074
- PubMed (PMID: 42331200): https://pubmed.ncbi.nlm.nih.gov/42331200/
- Runtime y paquetes (GitHub): https://github.com/neuroneural/brainchop-core
- Paquete PyPI: https://pypi.org/project/brainchop/
- Paquete npm: https://www.npmjs.com/package/@brainchop/core
- Aplicación web (GitHub): https://github.com/neuroneural/brainchop
