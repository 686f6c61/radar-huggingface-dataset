# lincbrain/axonsynth

## Resumen

AxonSynth es un modelo de segmentación de imágenes 3D preentrenado para la detección de axones en volúmenes de microscopía de lámina de luz (*light-sheet microscopy*). Lo publica el usuario `lincbrain` en Hugging Face y se distribuye como un checkpoint de MONAI basado en una arquitectura 3D U-Net de aproximadamente 4,8 millones de parámetros, entrenada sobre imágenes sintéticas generadas con aleatorización de dominio (*domain randomization*). El modelo resuelve un problema clásico en neurociencia: separar el axolema (envoltura) del interior axonal y del fondo en volúmenes de alta resolución, una tarea que hasta ahora dependía de anotación manual densa o de modelos entrenados con datos reales etiquetados, escasos y costosos de producir.

La propuesta es relevante porque sustituye parcialmente la dependencia de ground truth real por un pipeline de datos sintéticos, lo que abarata el reentrenamiento y la adaptación a nuevas preparaciones histológicas. El modelo opera sobre parches de 128 × 128 × 128 vóxeles a 0,8 µm de resolución isótropa y predice tres clases: fondo, envoltura axonal e interior axonal; la probabilidad binaria de axón se obtiene sumando las dos últimas. El checkpoint distribuido (`best_model.pt`) fue seleccionado en la época 136.

Se trata de un modelo de nicho, con 0 descargas y 0 *likes* en el momento de la consulta, orientado a laboratorios de neurociencia y a equipos de análisis de imagen científica más que a aplicaciones generales. La licencia AGPL-3.0 y la ausencia de métricas numéricas publicadas en la model card condicionan su adopción en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MONAI 3D U-Net (CNN encoder-decoder volumétrica) |
| Parametros totales | ~4,8 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (segmentación); entrada en parches de 128 × 128 × 128 vóxeles |
| Tipos de cuantizacion | no disponible; se distribuye un checkpoint PyTorch (`.pt`) sin variantes cuantizadas publicadas |
| Idiomas soportados | no aplica (modelo de visión, no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | checkpoint PyTorch (`best_model.pt`), cargado mediante MONAI |
| Clases de salida | 3: fondo, envoltura axonal (*shell*), interior axonal (*interior*) |
| Resolucion de entrenamiento | 0,8 µm isótropa |
| Metrica declarada | Dice |
| Epoca del checkpoint | 136 |
| Tamano del repositorio | 0,1 GB |
| Pipeline | `image-segmentation` |
| Libreria | MONAI (`library_name: monai`) |

## Arquitectura y entrenamiento

La arquitectura es una 3D U-Net implementada con MONAI, con un codificador que reduce progresivamente la resolución espacial y un decodificador con conexiones de salto que recupera el detalle fino. El modelo segmenta tres clases de forma conjunta, de modo que distingue explícitamente la envoltura del axón de su interior; la máscara binaria de axón se calcula sumando las probabilidades de ambas clases, lo que permite un modo de inferencia orientado a binario (`--output-profile binary_focused`) además del modo de tres clases.

El entrenamiento se realizó sobre imágenes sintéticas con aleatorización de dominio, según declara el autor. No se especifican en la información disponible el número de volúmenes sintéticos, el número de iteraciones ni la composición exacta del dataset, ni si hubo una fase de ajuste fino con datos reales. Tampoco se documenta el uso de técnicas de alineación tipo RLHF/DPO (no aplicables a este tipo de modelo) ni innovaciones como atención lineal o decodificación especulativa. El pipeline de inferencia incluido en el repositorio realiza *stitching* de parches (con opción de ejecutarlo en CPU) y normalización de la entrada, y genera como salida la imagen normalizada, la probabilidad de primer plano, la máscara binaria y los ajustes de inferencia empleados.

Un aspecto técnico relevante es la rigidez del preprocesado: la entrada debe prepararse a 0,8 µm isótropos y en el orden de ejes que espera el modelo, tal como se indica en el README del repositorio de código. Cualquier desviación en la resolución o en la orientación degrada la segmentación sin que el modelo pueda corregirla internamente.

## Capacidades

- Segmentación volumétrica de axones en tres clases (fondo, envoltura, interior) sobre imágenes de microscopía de lámina de luz.
- Cálculo de probabilidad binaria de axón mediante la suma de las probabilidades de envoltura e interior.
- Umbralización configurable en inferencia (`--threshold`, por defecto 0,5) para ajustar el punto de operación entre sensibilidad y precisión.
- Procesamiento por parches con *stitching* posterior, lo que permite abordar volúmenes mayores que la ventana de 128³ vóxeles.
- Inferencia con aceleración CUDA (`--require-cuda` en el ejemplo del autor) y *stitching* derivable a CPU.
- Evaluación integrada contra un volumen de ground truth denso, con salida de `metrics.json`, `summary.txt` e imágenes de solapamiento de verdaderos positivos, falsos positivos y falsos negativos.
- Entrenamiento sobre datos sintéticos con aleatorización de dominio, pensado para favorecer la transferencia a datos reales.
- No soporta *tool calling*, agentes, razonamiento multi-paso, texto, audio ni visión 2D de propósito general: su ámbito es exclusivamente la segmentación de imágenes 3D.

## Casos de uso

- **Trazado y cuantificación de axones en volúmenes de lámina de luz**: el modelo genera una máscara de axón que puede esqueletonizarse o contarse para obtener densidad axonal, longitud total y orientación por región, sustituyendo el conteo manual en pilas de miles de planos.
- **Preetiquetado para anotación humana**: al producir máscaras binarias y de tres clases, sirve como primer paso de un flujo de anotación asistida, donde el especialista solo corrige errores en lugar de dibujar desde cero.
- **Control de calidad de preparaciones histológicas**: la comparación de la máscara predicha con criterios morfológicos permite detectar volúmenes mal aclarados, con artefactos de iluminación o con señal axonal anómala antes del análisis cuantitativo.
- **Integración en pipelines reproducibles de neurociencia**: el script `inference/infer_lsm.py` acepta rutas de entrada y salida y guarda los ajustes usados, lo que facilita encapsularlo en flujos Snakemake o Nextflow con trazabilidad de parámetros y umbrales.
- **Ajuste fino para nuevas modalidades o preparaciones**: el checkpoint de ~4,8 millones de parámetros es lo bastante pequeño para reentrenarse en un laboratorio con una sola GPU, usando el modelo sintético como inicialización y unas pocas anotaciones reales como ajuste.
- **Análisis comparativo entre condiciones experimentales**: al aplicar el mismo umbral y la misma resolución a todos los especímenes de un estudio, se reduce la variabilidad interanotador en la medición de densidad axonal entre grupos control y tratados.
- **Docencia y prototipado de segmentación 3D**: el par código y pesos con licencia AGPL permite usar el modelo como ejemplo completo de pipeline MONAI (preprocesado, parcheado, stitching y evaluación) en cursos de imagen biomédica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara la métrica Dice en los metadatos y el repositorio incluye un script de evaluación (`tools/evaluate_lsm_case.py`) y funciones de métricas reutilizables (`paper_analysis/metrics.py`), pero no se proporcionan valores numéricos de Dice, IoU ni de comparación con otras aproximaciones. No se ofrecen cifras inventadas en esta ficha.

## Requisitos de hardware

- **VRAM estimada**: no publicada. Como referencia del orden de magnitud, los pesos de un modelo de 4,8 millones de parámetros ocupan aproximadamente 19 MB en FP32 y 10 MB en FP16, pero el consumo real lo dominan las activaciones de los parches 3D de 128³ vóxeles, muy superiores al peso del modelo. Cualquier cifra concreta debe medirse en el equipo objetivo.
- **GPU recomendadas**: el ejemplo oficial usa `--require-cuda`, por lo que se espera una GPU NVIDIA con CUDA. Para prototipado, tarjetas de 8-16 GB (RTX 3060, RTX 4060 Ti 16 GB) son un punto de partida razonable; para procesar lotes de volúmenes completos, A100 o H100 reducen el tiempo de *stitching* por espécimen.
- **Viabilidad en GPU de consumo**: previsiblemente sí para inferencia por parches, dado el reducido número de parámetros; el factor limitante es la memoria de activaciones, que puede rebajarse procesando parches menores o recurriendo al *stitching* en CPU.
- **Opciones de despliegue**: el soportado oficialmente es PyTorch + MONAI mediante `inference/infer_lsm.py`, con entorno Conda reproducible (`environment.yml`). No aplican servidores de inferencia de LLM como vLLM, TGI, llama.cpp u Ollama, al no tratarse de un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. Dependen del tamaño del volumen, del número de parches, del solapamiento entre ellos y de si el *stitching* se ejecuta en CPU o en GPU.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La tabla siguiente recoge lo que puede afirmarse con la documentación disponible; las celdas sin datos se marcan explícitamente.

| Modelo | Parametros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AxonSynth (`lincbrain/axonsynth`) | ~4,8 M | Parches 3D de 128³ vóxeles a 0,8 µm | Sin cifras publicadas (métrica declarada: Dice) | AGPL-3.0 | Pesos en Hugging Face + código en GitHub |
| 3D U-Net genérico de MONAI entrenado desde cero con datos propios | no disponible (configurable) | Configurable | no disponible | según MONAI y los datos | Requiere dataset anotado propio |
| Otros segmentadores de axones publicados en la literatura | no disponible | no disponible | no disponible | no disponible | no disponible en esta búsqueda |

## Limitaciones y advertencias

- **Brecha entre dominio sintético y real**: el entrenamiento con datos sintéticos aleatorizados no garantiza el rendimiento sobre preparaciones reales; no se publican métricas en datos reales que lo respalden.
- **Dependencia estricta del preprocesado**: la entrada debe estar a 0,8 µm isótropos y en el orden de ejes esperado; reescalados u orientaciones distintas producen predicciones incorrectas sin aviso.
- **Riesgo de falsos positivos y negativos**: al ser un modelo de segmentación, los errores se manifiestan como máscaras incompletas o estructuras espurias; conviene revisar los solapamientos que genera el script de evaluación antes de usar las máscaras en análisis cuantitativos.
- **Ambigüedad entre envoltura e interior**: la frontera entre las clases *shell* e *interior* puede ser difusa en axones finos o en volúmenes con baja relación señal-ruido; para uso binario es preferible sumar ambas probabilidades.
- **Ausencia de métricas y de ficha de entrenamiento completa**: no se documentan número de muestras sintéticas, composición del dataset, ni resultados de validación, lo que dificulta estimar el comportamiento esperado en un dominio nuevo.
- **Licencia AGPL-3.0**: es una licencia copyleft fuerte. Su uso interno no plantea problemas, pero distribuir el modelo modificado o exponerlo como servicio en red puede activar la obligación de liberar el código correspondiente. Conviene revisión legal antes de integrarlo en un producto.
- **Discrepancia en el identificador de descarga**: el comando de la model card referencia `edziocodes/axonsynth`, mientras que el repositorio es `lincbrain/axonsynth`; verificar la ruta correcta antes de automatizar la descarga.
- **Alcance muy acotado**: no es un modelo de propósito general; no procesa texto, no admite *prompts* y no puede reutilizarse para otras tareas de visión sin reentrenamiento.
- **Madurez**: 0 descargas y 0 *likes*, sin evidencia de uso comunitario ni de mantenimiento continuado; asumir que la documentación y el código pueden cambiar sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lincbrain/axonsynth
- Repositorio de código, entorno y documentación: https://github.com/lincbrain/axonsynth
- Funciones de métricas reutilizables: https://github.com/lincbrain/axonsynth/blob/main/paper_analysis/metrics.py
- README del repositorio con instrucciones de preparación de volúmenes: https://github.com/lincbrain/axonsynth (sección de preparación de datos)
