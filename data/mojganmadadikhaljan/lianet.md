# MojganMadadikhaljan/LIANet

## Resumen

LIANet (Location Is All You Need) es un modelo de representación neuronal continua del espacio-tiempo para datos de observación de la Tierra. Lo desarrolla Mojgan Madadikhaljan y se publica bajo licencia MIT. No es un modelo de lenguaje: es una representación implícita neuronal (implicit neural representation) que reconstruye y predice imágenes multiespectrales de Sentinel-2 a partir de coordenadas espaciales y temporales, en lugar de almacenar píxeles de forma explícita.

La variante LIANet-MR (multi-región) asigna a cada región sus propias tablas hash multirresolución y comparte un único decodificador CNN entre todas ellas. Esto permite entrenar una cabeza de tarea con etiquetas de regiones de origen y aplicarla a otras regiones del mismo modelo, lo que aborda el problema de la transferencia geográfica en teledetección: un modelo entrenado en unas teselas puede generalizar a teselas no vistas sin reentrenamiento completo.

El modelo trabaja con 12 bandas de Sentinel-2, parches de 128 x 128 píxeles a 10 m de resolución y 13 niveles de hash-grid con tablas de 2^19 filas y dimensión de características 128, además de una codificación temporal de Fourier aprendida. Es relevante ahora porque ofrece una alternativa compacta y continua a los enfoques de superresolución y reconstrucción de series temporales satelitales basados en píxeles, con aplicaciones directas en monitorización de incendios (BurnScars) y clasificación de cultivos (PASTIS).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Representación neuronal implícita (neural field) con hash-grid multirresolución por región y decodificador CNN compartido (LIANet-MR) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada = coordenadas (días desde 2015-01-01, x, y) e índice de región |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no aplica (modelo de imagen satelital, no lingüístico) |
| Licencia | MIT (los datos de entrenamiento tienen sus propias licencias) |
| Formato de pesos | safetensors (model.safetensors, head.safetensors); configuración en JSON; logs en TensorBoard |

## Arquitectura y entrenamiento

LIANet modela una escena satelital como una función continua f(días, x, y, región) → reflectancias de 12 bandas. Cada región dispone de su propia jerarquía de hash-grids multirresolución (13 niveles, tamaño de tabla 2^19, dimensión 128) y todas comparten un decodificador CNN. La dimensión temporal se codifica mediante una codificación de Fourier aprendida, lo que permite interpolar y extrapolar en el tiempo de forma continua. Los parches son de 128 x 128 píxeles a 10 m de resolución con 12 bandas de Sentinel-2.

El repositorio incluye varios checkpoints preentrenados: `pastis_joint_4regions` (teselas T31TFJ, T32ULU, T31TFM y T30UXV, 854 épocas), `burnscars_joint_2regions` (T11SMT y T16REV, 800 épocas), modelos de región única (400 épocas) y modelos secuenciales donde la primera región se congela y se entrena la segunda (300-400 épocas). También se publican cabezas de tarea afinadas para BurnScars y PASTIS, junto con baselines UNet y Micro-UNet. No se detalla en la información disponible el número de tokens ni la composición exacta del dataset de preentrenamiento; los detalles de entrenamiento se reconstruyen a partir de `used_parameters.json` y `config.json`.

## Capacidades

- Reconstrucción continua de imágenes Sentinel-2 en cualquier coordenada espacial y fecha, incluyendo interpolación temporal entre observaciones.
- Modelado multi-región: cada región mantiene sus propias tablas hash y comparte decodificador, lo que permite transferir cabezas de tarea entre regiones.
- Aprendizaje secuencial entre regiones (congelando la primera y entrenando la segunda).
- Segmentación semántica aguas abajo mediante cabezas de tarea: clasificación de cultivos en PASTIS (20 clases en las cabezas multi-fuente publicadas; 19 en la tarea de la versión v5.0.0, que ignora la clase void) y detección de cicatrices de incendio en BurnScars.
- Soporte de series temporales irregulares: la codificación temporal de Fourier permite consultar fechas arbitrarias, no solo las observadas.
- No soporta tool calling, agentes, generación de texto, visión natural ni capacidades multilingües; es un modelo específico de teledetección.

## Casos de uso

- Monitorización de cicatrices de incendios: usar `burnscars_joint_2regions` y una cabeza afinada para segmentar áreas quemadas en teselas nuevas, aprovechando la transferencia entre regiones (por ejemplo, entrenar con T11SMT y aplicar a T16REV).
- Clasificación de cultivos a escala regional: emplear las cabezas PASTIS para etiquetar parcelas agrícolas en parches de 128 x 128 a 10 m, con la ventaja de que la representación continua permite consultar fechas intermedias entre pasadas del satélite.
- Relleno de huecos en series temporales Sentinel-2: reconstruir observaciones en fechas con nubosidad o sin captura, consultando el modelo en coordenadas y días concretos.
- Interpolación temporal para análisis fenológico: generar series sintéticas densas (por ejemplo, cada pocos días) a partir de observaciones dispersas para estudiar el ciclo de crecimiento de cultivos.
- Transferencia geográfica de modelos de teledetección: entrenar una cabeza en una región con etiquetas abundantes y desplegarla en regiones con pocas etiquetas usando el esquema multi-región de LIANet-MR.
- Compresión y representación eficiente de escenas: sustituir el almacenamiento de pilas de imágenes por los pesos de la red y las tablas hash, reconstruyendo los parches bajo demanda.
- Investigación en neural fields aplicados a observación de la Tierra: servir como base reproducible (código v5.0.0, checkpoints y logs TensorBoard) para experimentar con nuevas codificaciones espacio-temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye `config.json` con registros de métricas de las ejecuciones de afinado, pero los valores numéricos no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 12,9 GB, pero el peso de un checkpoint individual (modelo más tablas hash) es menor; las tablas hash de 2^19 filas x 128 dimensiones x 13 niveles por región dominan el consumo.
- GPU recomendadas: no disponible. Por el tamaño de las tablas y el decodificador CNN, se espera que quepa en GPU de consumo con suficiente memoria (RTX 3090/4090, 24 GB), pero no hay cifras publicadas que lo confirmen.
- Despliegue: el flujo previsto es el código de investigación del repositorio de GitHub (etiqueta v5.0.0), con scripts de descarga (`scripts/download.py`) y afinado (`Finetuning/src/finetune.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LIANet-MR | Neural field multi-región | no disponible | Coordenadas + fecha, 12 bandas, 128 x 128 a 10 m | MIT | Hugging Face + GitHub |
| UNet / Micro-UNet (baselines incluidos) | CNN de segmentación | no disponible | Parches de imagen | según repositorio | Incluidos como baselines en el mismo repo |
| Otros neural fields para teledetección | Representación implícita | no disponible | no disponible | no disponible | no disponible |

La información disponible no permite comparar con alternativas externas con cifras de rendimiento; los únicos comparadores documentados son los baselines UNet y Micro-UNet publicados junto al modelo.

## Limitaciones y advertencias

- Modelo de nicho: no es un modelo de lenguaje ni de propósito general; solo es aplicable a datos Sentinel-2 con la configuración espacial y espectral descrita.
- Cobertura geográfica limitada a las teselas entrenadas (T31TFJ, T32ULU, T31TFM, T30UXV, T11SMT, T16REV y teselas PASTIS); el comportamiento fuera de ellas no está garantizado.
- Las cabezas PASTIS multi-fuente publicadas predicen 20 clases, mientras que la tarea PASTIS de v5.0.0 usa 19 e ignora la clase void; hay que tenerlo en cuenta al comparar resultados.
- Las ejecuciones de afinado se entrenaron con código de investigación anterior a v5.0.0; pueden requerir adaptaciones para reproducirse con la versión actual.
- Riesgo de alucinación en el sentido de reconstruir reflectancias plausibles pero no observadas en fechas o zonas sin datos; conviene validar las reconstrucciones contra observaciones reales.
- Sesgos derivados de la distribución de los datos de entrenamiento (regiones, estaciones y condiciones atmosféricas concretas); no se documentan análisis de sesgo.
- Licencia MIT para el modelo, pero los datos de entrenamiento tienen sus propias licencias, que hay que respetar en uso comercial.
- Sin métricas de benchmarks publicadas en la información disponible; la evaluación en producción requiere validación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido y poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/MojganMadadikhaljan/LIANet
- Dataset: https://huggingface.co/datasets/MojganMadadikhaljan/LIANet-dataset
- Código: https://github.com/mojganmadadi/LIANet (etiqueta v5.0.0)
- Paper de LIANet de región única: *Location Is All You Need: Continuous Spatiotemporal Neural Representations of Earth Observation Data*, CVPR 2026 Workshops (código en etiqueta v1.0.1)
