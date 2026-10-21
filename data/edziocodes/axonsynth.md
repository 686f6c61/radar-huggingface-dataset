# edziocodes/axonsynth

## Resumen

AxonSynth es un modelo de segmentación semántica 3D para imágenes de microscopía de lámina de luz (light-sheet microscopy), desarrollado por el usuario edziocodes y publicado junto al repositorio de código lincbrain/axonsynth. Se trata de un U-Net 3D implementado con MONAI, de aproximadamente 4,8 millones de parámetros, que clasifica cada vóxel en tres clases: fondo, envoltura del axón (shell) e interior del axón. La probabilidad binaria de axón se obtiene sumando las dos clases de axón. Su relevancia práctica radica en que sustituye la anotación manual densa de volúmenes de microscopía por inferencia automática sobre parches de 128 × 128 × 128 vóxeles a 0,8 µm de resolución isotrópica.

El modelo se entrena exclusivamente con imágenes sintéticas generadas mediante domain randomization, lo que evita depender de volúmenes reales anotados y permite, en principio, generalizar a distintas condiciones de adquisición. El checkpoint publicado (`best_model.pt`) corresponde a la época 136 y es el modelo principal de tres clases. No se publican cifras de benchmarks en la información disponible, aunque la model card declara la métrica Dice como referencia de evaluación.

Es un modelo pequeño (repo de 0,1 GB), pensado para integrarse en un pipeline concreto de neurociencia: preparación del volumen a 0,8 µm en el orden de ejes del modelo, inferencia con ventana deslizante, cosido de parches y evaluación contra un volumen ground-truth denso. La licencia AGPL-3.0, tanto para pesos como para código, es el principal condicionante para uso en producción o en servicios en red.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MONAI 3D U-Net (CNN de segmentación semántica 3D) |
| Parametros totales | ~4,8 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); entrada por parches de 128 × 128 × 128 vóxeles con ventana deslizante |
| Tipos de cuantizacion | no disponible; se distribuye un checkpoint PyTorch (`best_model.pt`), sin variantes cuantizadas publicadas |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | AGPL-3.0 (pesos y código) |
| Formato de pesos | PyTorch (`.pt`) vía MONAI; tamaño del repo 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un U-Net 3D de MONAI con codificador-decoder y conexiones residuales, dimensionado para trabajar sobre parches cúbicos de 128 vóxeles de lado a 0,8 µm de resolución isotrópica. La salida es de tres canales (fondo, shell del axón e interior del axón); la probabilidad de axón binaria se calcula sumando shell e interior, y el umbral de binarización es configurable (0,5 por defecto en los ejemplos de la model card). El checkpoint principal (`best_model.pt`) se seleccionó en la época 136.

El entrenamiento no utiliza volúmenes reales anotados: se basa en imágenes sintéticas con domain randomization, una estrategia que varía las condiciones de apariencia para forzar invariancia y reducir la brecha de dominio con adquisiciones reales de light-sheet. No se especifican en la información disponible el número de tokens/vóxeles de entrenamiento, la composición exacta del dataset sintético, ni si hubo etapas de ajuste con datos reales o técnicas de refinamiento tipo RLHF/DPO (no aplicables en este dominio). La innovación destacable es precisamente el uso de datos sintéticos domain-randomized en lugar de anotación manual densa.

## Capacidades

- Segmentación semántica 3D de axones en volúmenes de microscopía de lámina de luz, con tres clases (fondo, shell, interior).
- Cálculo de probabilidad de foreground axonal mediante suma de las dos clases de axón, con umbral configurable.
- Inferencia por parches de 128³ con cosido de resultados (stitching) configurable, incluyendo ejecución del cosido en CPU.
- Salida de artefactos de inferencia: input normalizado, probabilidad de foreground, máscara binaria y fichero de ajustes de inferencia.
- Evaluación integrada contra ground-truth denso con generación de `metrics.json`, `summary.txt` y mapas de overlay de verdaderos positivos, falsos positivos y falsos negativos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de segmentación.
- No tiene capacidades multilingües ni procesamiento de lenguaje; la etiqueta "idiomas" no resulta aplicable.
- No se documentan capacidades de visión general (clasificación, detección, VQA), ni modos "thinking", audio o vídeo.

## Casos de uso

- Segmentación de axones en volúmenes de light-sheet de tejido nervioso: se prepara el volumen a 0,8 µm isotrópico en el orden de ejes del modelo y se ejecuta `inference/infer_lsm.py` con `--segmentation-mode three_class_shell_interior` para obtener máscara binaria y probabilidad de foreground. Adecuado porque el modelo está entrenado exactamente para esa resolución y modalidad.
- Pre-etiquetado para anotación humana: generar máscaras automáticas y corregirlas manualmente en lugar de anotar desde cero, reduciendo el coste de construir ground-truth denso en nuevos datasets.
- Cuantificación morfométrica: derivar densidad axonal, fracción de volumen ocupada por axones o áreas de sección a partir de la máscara binaria y del volumen de probabilidad, útil en estudios de neurociencia comparativa.
- Análisis de experimentos de manipulación genética o lesión: comparar la densidad y morfología axonal entre grupos experimentales procesando lotes de volúmenes con los mismos ajustes (`--threshold`, modo de segmentación) para mantener comparabilidad.
- Control de calidad de adquisiciones: usar la probabilidad de foreground y su distribución como indicador de volúmenes mal alineados, con artefactos de iluminación o fuera de la resolución esperada, antes de análisis posteriores.
- Integración en pipelines de procesamiento por lotes: el script de inferencia acepta rutas de entrada, checkpoint y directorio de salida, y separa el dispositivo de cosido (`--stitch-device cpu`), lo que facilita ejecutarlo como paso de un workflow orquestado sobre muchos volúmenes.
- Reentrenamiento o fine-tuning con datos propios: al ser un modelo de ~4,8 M de parámetros y 0,1 GB, se puede ajustar con recursos modestos sobre un subconjunto de volúmenes reales anotados para reducir la brecha de dominio respecto al entrenamiento sintético.
- Reproducibilidad metodológica y docencia: el repositorio incluye funciones de métricas reutilizables (`paper_analysis/metrics.py`) y scripts de evaluación, lo que permite replicar la comparación predicción vs. ground-truth de forma estandarizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara la métrica Dice en los metadatos y proporciona herramientas para calcularla (`tools/evaluate_lsm_case.py`, `paper_analysis/metrics.py`), pero no se incluyen valores numéricos de Dice ni de ninguna otra métrica, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: no publicada. Como referencia de orden de magnitud, un checkpoint de ~4,8 M de parámetros en FP32 ocupa aproximadamente 19 MB, por lo que el grueso del consumo proviene de las activaciones de los parches 128³ procesados con ventana deslizante; se trata de una estimación, no de un dato del autor.
- GPU recomendadas: no especificadas en la información disponible. El ejemplo de inferencia de la model card invoca `--require-cuda`, lo que indica que el pipeline espera una GPU CUDA para la red.
- GPU de consumo: por el tamaño del modelo (4,8 M de parámetros) es previsible que quepa en GPUs de consumo con suficiente memoria para parches 3D (gama RTX con 8-12 GB o superior); el fabricante no publica requisitos mínimos verificados.
- Despliegue: MONAI + PyTorch (librería declarada `monai`); scripts de inferencia y evaluación del repositorio de GitHub. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de segmentación de imagen.
- Latencia y throughput: no disponibles. El cosido de parches puede delegarse a CPU (`--stitch-device cpu`), lo que sugiere que la agregación de parches puede ser un coste relevante en volúmenes grandes.
- Almacenamiento: repositorio de 0,1 GB, manejable en cualquier equipo; el cuello de botella es el tamaño de los volúmenes de entrada y de las predicciones.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. La model card no incluye comparaciones con otras arquitecturas de segmentación axonal ni con variantes de U-Net 3D, y no se aportan métricas numéricas que permitan establecer una comparación objetiva.

| Modelo | Parametros | Contexto / parche de entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AxonSynth | ~4,8 M | 128 × 128 × 128 vóxeles a 0,8 µm | Dice declarado como metrica, sin valores publicados | AGPL-3.0 | HuggingFace + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintético: aunque el domain randomization busca reducir la brecha, no se documenta validación con volúmenes reales ni cifras de Dice que respalden la generalización a datos de otros laboratorios.
- Requisito estricto de preprocesado: el volumen debe prepararse a 0,8 µm isotrópico y en el orden de ejes del modelo; un remuestreo o una orientación incorrectos degradan la predicción sin aviso explícito.
- Resolución fija: no se documenta comportamiento con anisotropía, resoluciones distintas o modalidades de microscopía diferentes al light-sheet.
- Segmentación semántica, no de instancias: la salida es una máscara de tres clases y un foreground binario; no se describe separación de axones individuales ni generación de esqueletos o trazados.
- Riesgo de falsos positivos en regiones con ruido, artefactos de iluminación o tejido no axonal: el modelo no incluye mecanismo de abstención ni puntuación de incertidumbre más allá de la probabilidad por vóxel; el umbral (0,5 por defecto) debe calibrarse por dominio.
- Sin datos de sesgo demográfico ni de equidad: no aplica en el sentido habitual, pero tampoco se documenta variabilidad entre especies, cepas o protocolos de tinción.
- Licencia AGPL-3.0 en pesos y código: es copyleft fuerte y afecta al uso en servicios en red; el uso comercial es posible, pero obliga a liberar el código derivado y el del servicio que lo expone. Conviene revisar los términos con asesoría legal antes de integrarlo en un producto.
- Proyecto con muy baja adopción: 0 descargas y 1 like en el momento de la consulta, sin ecosistema de terceros, lo que implica ausencia de validación independiente.
- Sin soporte documentado de exportación a ONNX/TorchScript ni de cuantización: las opciones de optimización para despliegue no están descritas.
- Modelo pequeño (~4,8 M de parámetros): capacidad limitada para morfologías axonales muy heterogéneas o densidades extremas; no se publican curvas de aprendizaje ni análisis de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edziocodes/axonsynth
- Repositorio de código, entorno y documentación: https://github.com/lincbrain/axonsynth
- Funciones de métricas reutilizables: https://github.com/lincbrain/axonsynth/blob/main/paper_analysis/metrics.py
