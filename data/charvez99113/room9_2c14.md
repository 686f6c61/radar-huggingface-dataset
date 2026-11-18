# Charvez99113/room9_2c14

## Resumen

`room9_2c14` (identificador interno `worker-2-m014`) es un detector de objetos basado en YOLO26n, exportado a ONNX, especializado en identificar cinco clases de suciedad en habitaciones: derrames de líquidos, papeleras, residuos, moho y manchas. Lo publica el usuario Charvez99113 en Hugging Face, pero la model card lo vincula a la competición o pipeline de `manako/Detect-room-dirtiness-detection`, con pesos base Ultralytics `yolo26n.pt` inicializados desde COCO y entrenados durante 30 épocas sobre la configuración de dataset `dc-113`. No es un modelo de lenguaje ni un modelo generativo: es un detector visual de una sola etapa pensado para integrarse en un sistema de inspección automatizada de limpieza.

El modelo se distribuye únicamente como `weights.onnx` con entrada de 736x736 píxeles y letterbox, y está pensado para ejecutarse con ONNX Runtime usando el execution provider de CUDA con fallback a CPU. La model card documenta explícitamente los hiperparámetros de inferencia: umbral de confianza de 0,25 por clase, NMS por clase con IoU de 0,5 y un máximo de 100 detecciones. El repositorio, de 0,0 GB en el momento de la consulta, no incluye pesos visibles en la información proporcionada, lo que limita su reproducibilidad inmediata.

La relevancia de esta ficha es acotada: se trata de un artefacto de competición con licencia no declarada, sin benchmarks estándar publicados y con métricas únicamente internas del pipeline (juez en vivo con ground truth reconstruido). Resulta útil como referencia para quien necesite un detector de suciedad ligero y desplegable en ONNX, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (detector de objetos de una etapa, familia Ultralytics), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (visión); etiquetas de clase en inglés |
| Licencia | no disponible (los pesos base Ultralytics yolo26n son AGPL-3.0 según la model card) |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO26n de Ultralytics, es decir, un transformer convolucional de una etapa con cabeza de detección densa, exportado a ONNX con entrada fija de 736x736 y preprocesamiento letterbox. El entrenamiento parte de los pesos COCO de `yolo26n.pt` y se ejecuta durante 30 épocas sobre la configuración de dataset `dc-113` (snapshot `DS-16688-3982d9de8def`), en la ejecución identificada como `e1042_y26n_736_dc113_kdD1646c20_ep30_s1`, con semilla 1 y destilación de conocimiento densa (dense KD). El profesor de destilación es `CVCompressor/dirtiness_1646` en el commit `59dbf3836f`, reconstruido a PyTorch a partir de su `weights.onnx` publicado.

Las etiquetas del dataset provienen de varias fuentes: las etiquetas `dc-64` (incluidas en `dc-83`) atribuidas a `Cargile/delta-202`, `ArthurSword/ThunderStone_06` y `artur7236/ScoreVision`; las etiquetas de rondas en vivo, reconstruidas como ground truth v162 a partir de las cajas y puntuaciones de los mineros públicos; y las etiquetas propias del propietario del dataset. La model card indica que el conjunto limpio en vivo supera el commit `9520325`. No se documenta el número total de imágenes, la composición por clase ni si hubo aumento de datos más allá del letterbox.

## Capacidades

- Detección de objetos en imágenes con cinco clases: `0` derrame de líquido, `1` papelera, `2` residuos, `3` moho, `4` mancha.
- Salida de cajas delimitadoras con puntuación de confianza por clase, sujeta a NMS por clase con IoU 0,5 y máximo de 100 detecciones.
- Inferencia en ONNX Runtime con execution provider CUDA primero y fallback a CPU; configuración de 2 hilos intra-op, 1 inter-op y 1 hilo de OpenCV.
- Entrada de imagen fija de 736x736 con letterbox, lo que implica reescalado y relleno de la imagen original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un detector visual.
- No se documentan capacidades multilingües, de audio, de vídeo ni modos de "thinking".

## Casos de uso

- Inspección automatizada de limpieza en habitaciones de hotel: el detector recibe una foto de la habitación y devuelve cajas con las clases `bin`, `litter`, `stain`, `mould` y `liquid spillage`, lo que permite generar un parte de incidencias por habitación antes de la entrega al cliente.
- Auditoría de estado en alquileres vacacionales: integrado en una app móvil, el modelo procesa la foto de salida del huésped y compara la presencia de residuos o manchas con la foto de entrada para decidir si se aplica un cargo por limpieza.
- Mantenimiento preventivo de moho en vivienda: la clase `mould` permite alertar de forma temprana en zonas húmedas (baños, cocinas) a partir de capturas periódicas, con revisión humana de las detecciones por encima de 0,25 de confianza.
- Control de calidad en limpieza industrial o de oficinas: el modelo se ejecuta en el borde (edge) con ONNX Runtime en CPU o GPU modesta y genera alertas cuando detecta `litter` o `liquid spillage` en zonas comunes.
- Triaje de imágenes en plataformas de gestión de incidencias: el detector filtra automáticamente las fotos enviadas por usuarios y las etiqueta con la clase de suciedad predominante, reduciendo la carga de revisión manual.
- Dataset mining y etiquetado asistido: al ser un detector ligero, puede usarse como preetiquetador en pipelines de anotación para generar cajas candidatas que un humano revisa, acelerando la creación de nuevos datasets de suciedad.

## Benchmarks y rendimiento

La model card reporta únicamente métricas internas del pipeline, no benchmarks estándar (COCO, VOC u otros). El "juez en vivo" con ground truth reconstruido (T4.23) sobre 49 rondas arroja:

| Metrica | Valor |
|---|---|
| ALL (juez en vivo, umbral 0,25, 49 rondas) | 0,549 |
| FULL | 0,5659 |
| U | 0,549 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni métricas de detección como mAP en COCO) en la información disponible. No se inventan cifras adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser un YOLO26n (variante "nano") exportado a ONNX con entrada 736x736, es esperable que quepa en GPUs de consumo con varios GB de VRAM, pero no se documenta el consumo exacto.
- GPU recomendadas: no documentadas. La model card solo especifica que se usa el execution provider CUDA de ONNX Runtime con fallback a CPU.
- Compatibilidad con GPU de consumo: probable por el tamaño "nano" del modelo base, pero no confirmada en la información disponible.
- Opciones de despliegue: ONNX Runtime (CUDA o CPU), con 2 hilos intra-op, 1 inter-op y 1 hilo de OpenCV. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros detectores de suciedad en la información proporcionada. Como referencia estructural, se compara con el profesor de destilación y con el detector base:

| Modelo | Tipo | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `room9_2c14` (worker-2-m014) | YOLO26n ONNX | 736x736 | 5 (suciedad) | no disponible | Hugging Face (repo 0,0 GB) |
| `CVCompressor/dirtiness_1646` (profesor KD) | no disponible | no disponible | no disponible | no disponible | Hugging Face (commit `59dbf3836f`) |
| Ultralytics `yolo26n.pt` (base) | YOLO26n | variable | 80 (COCO) | AGPL-3.0 | Ultralytics |

No se conocen alternativas públicas equivalentes de detección de suciedad con métricas comparables en la información disponible.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: no se puede asumir uso comercial sin verificar los términos. Los pesos base Ultralytics son AGPL-3.0, lo que puede condicionar la distribución del modelo derivado.
- El repositorio figura con tamaño 0,0 GB y sin pesos visibles en la información proporcionada, por lo que la descarga y el uso directo no están garantizados.
- Métricas únicamente internas (juez en vivo con ground truth reconstruido), sin validación en benchmarks estándar ni conjunto de test público independiente.
- Riesgo de sobreajuste a las condiciones del dataset `dc-113` y a las rondas en vivo: la propia model card indica que el ajuste por clase de umbrales y los caps no generalizan (W2-0050), y que variar IoU entre 0,4 y 0,6 no produce cambios en 8 modelos (W2-0186).
- Entrada fija de 736x736 con letterbox: objetos pequeños o imágenes con relación de aspecto muy distinta pueden degradar la detección.
- Solo cinco clases de suciedad; no detecta otros tipos de desorden ni objetos fuera del vocabulario definido.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier uso conversacional requiere un sistema externo.
- Riesgo de falsos positivos y negativos en condiciones de iluminación, perspectiva o texturas distintas a las del entrenamiento; se recomienda revisión humana en producción.
- No se documentan sesgos demográficos ni geográficos, pero al ser un detector visual de interiores, su rendimiento puede variar según el tipo de habitáculo y la región.

## Enlaces

- Hugging Face: https://huggingface.co/Charvez99113/room9_2c14
- Modelo profesor de destilación: https://huggingface.co/CVCompressor/dirtiness_1646 (commit `59dbf3836f`)
- Pesos base Ultralytics YOLO26n: no disponible como enlace directo en la información proporcionada
- Dataset de referencia: `manako/Detect-room-dirtiness-detection` (no se proporciona URL directa)
- Paper o blog del modelo: no disponible
