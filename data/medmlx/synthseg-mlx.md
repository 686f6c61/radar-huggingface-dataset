# MedMLX/synthseg-mlx

## Resumen

SynthSeg para MLX es una conversión de los pesos originales de SynthSeg, la herramienta de segmentación de resonancia magnética cerebral y tomografía computarizada desarrollada por el Athinoula A. Martinos Center (Massachusetts General Hospital / Harvard Medical School) y distribuida con FreeSurfer. El paquete, publicado por MedMLX, no reentrena el modelo: convierte los checkpoints Keras originales a tensores MLX en float32 para que puedan ejecutarse de forma nativa sobre Apple Silicon mediante Metal, sin depender de TensorFlow ni de una GPU NVIDIA.

El repositorio incluye cinco variantes de pesos que cubren segmentación estándar y rápida, cascada robusta, segmentación de la versión 1.0, parcelación cortical y control de calidad. El tamaño total del repositorio es de 0,4 GB, lo que refleja que se trata de una red convolucional 3D compacta y no de un modelo generativo de gran escala: el interés no está en el número de parámetros, sino en la portabilidad del pipeline clásico de neuroimagen a hardware de sobremesa.

Su relevancia actual es práctica: permite ejecutar un pipeline de segmentación cerebral validado en la literatura sobre un Mac con chip de la familia M, algo útil para investigación, prototipado y docencia en entornos sin acceso a clústeres con GPU. La licencia FreeSurfer Software License restringe el uso a investigación y exige revisión humana de las salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional 3D (checkpoints Keras originales de SynthSeg convertidos a MLX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes, no de texto) |
| Tipos de cuantizacion | float32 nativo en MLX; no se documentan otras precisiones |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | FreeSurfer Software License (license_name: freesurfer-software-license) |
| Formato de pesos | safetensors (MLX, layout `(out_channels, depth, height, width, in_channels)`) |

## Arquitectura y entrenamiento

Los pesos son una conversión directa de los checkpoints Keras que FreeSurfer distribuye en `mri_synthseg` (rama v8.2.0). No ha habido reentrenamiento ni ajuste fino: el trabajo de MedMLX consiste en trasladar los tensores al formato safetensors con el layout de convolución que espera MLX, preservando la semántica del modelo original. SynthSeg es una red convolucional 3D entrenada por el equipo de Martinos con un esquema de síntesis de datos: genera imágenes sintéticas con contrastes y niveles de ruido aleatorios a partir de segmentaciones de referencia, lo que le permite segmentar escáneres de cualquier modalidad sin reentrenamiento específico por dominio.

El repositorio separa las funcionalidades en cinco ficheros: `synthseg_2.0.safetensors` (segmentación estándar o rápida), `synthseg_robust_2.0.safetensors` (cascada robusta), `synthseg_1.0.safetensors` (versión 1.0), `synthseg_parc_2.0.safetensors` (parcelación cortical) y `synthseg_qc_2.0.safetensors` (control de calidad). Todas las variantes cargan los ficheros de parcelación y QC aunque la parcelación esté desactivada. La validación publicada es una comprobación de conversión de formato sobre una única imagen anatómica: las ejecuciones estándar, rápida, robusta, v1 y v1-rápida produjeron máscaras, rejillas de salida, tablas de volumen y tablas de QC idénticas a las del modelo original. El autor advierte explícitamente que esto no constituye una validación clínica ni poblacional.

## Capacidades

- Segmentación de resonancia magnética cerebral en múltiples modalidades y contrastes sin reentrenamiento por dominio, gracias al entrenamiento con datos sintéticos del modelo original.
- Segmentación de tomografía computarizada cerebral, según la descripción del repositorio.
- Parcelación cortical mediante el fichero `synthseg_parc_2.0.safetensors`.
- Control de calidad de la segmentación mediante `synthseg_qc_2.0.safetensors`.
- Modo rápido y modo estándar de segmentación, además de una cascada robusta para casos difíciles.
- Ejecución nativa en Apple Silicon con MLX y Metal, en float32.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente de visión por computador médica.

## Casos de uso

- Investigación en neuroimagen sobre portátiles o equipos de sobremesa Mac: permite obtener volúmenes regionales y máscaras de segmentación sin disponer de GPU NVIDIA, usando el runtime `synthseg-mlx` y el backend Metal.
- Prototipado de pipelines de análisis morfométrico: la salida incluye tablas de volumen que se pueden encadenar con análisis estadísticos posteriores antes de escalar a un clúster.
- Docencia y formación: al caber en 0,4 GB y ejecutarse en hardware de consumo, facilita demostraciones reproducibles de segmentación cerebral en cursos de imagen médica.
- Preprocesado en estudios longitudinales: la cascada robusta (`synthseg_robust_2.0.safetensors`) está pensada para escáneres con peor calidad o contrastes atípicos, lo que ayuda a mantener la coherencia entre sesiones.
- Control de calidad automatizado de segmentaciones previas: el fichero de QC permite generar tablas de verificación que un revisor humano puede inspeccionar antes de aceptar un resultado.
- Parcelación cortical para análisis regional: la variante `synthseg_parc_2.0.safetensors` produce divisiones corticales utilizables en estudios de grosor o volumen por región.
- Integración en flujos de trabajo de laboratorio con Mac: al instalarse vía `uv pip install "synthseg-mlx>=0.3.4"`, se puede incorporar a scripts de Python existentes sin contenedores con CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es una comprobación de equivalencia de formato sobre una imagen anatómica, en la que las cinco variantes produjeron máscaras y tablas idénticas a las del modelo original. No hay métricas de Dice, sensibilidad ni comparaciones cuantitativas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,4 GB, por lo que el conjunto de pesos en float32 es manejable en memoria unificada de equipos de consumo.
- GPU recomendadas: el modelo está diseñado para Apple Silicon con MLX y Metal; no se documentan requisitos para CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada; no se especifican modelos concretos de chip ni cantidad mínima de memoria.
- Opciones de despliegue: runtime `synthseg-mlx` (versión >= 0.3.4) sobre MLX; descarga de pesos mediante `huggingface_hub.snapshot_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Ejecución | Licencia | Disponibilidad |
|---|---|---|---|---|
| MedMLX/synthseg-mlx | CNN 3D de segmentación cerebral (conversión MLX) | Apple Silicon (MLX/Metal) | FreeSurfer Software License | HuggingFace, 0 descargas, 0 likes |
| SynthSeg original (FreeSurfer) | CNN 3D de segmentación cerebral (Keras) | CPU/GPU con TensorFlow/Keras | FreeSurfer Software License | GitHub de FreeSurfer y BBillot/SynthSeg |
| Otros segmentadores cerebrales (p. ej. FastSurfer, nnU-Net) | CNN 3D / U-Net | GPU NVIDIA habitualmente | Varía según proyecto | no disponible en la información proporcionada |

La comparación relevante es con el SynthSeg original: los pesos son los mismos, y la diferencia está en el backend de ejecución (MLX frente a Keras/TensorFlow) y en el hardware objetivo (Apple Silicon frente a CPU o GPU NVIDIA). No se dispone de datos para comparar rendimiento numérico con FastSurfer o nnU-Net.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: la licencia FreeSurfer Software License indica que el software está diseñado para fines de investigación y no ha sido revisado ni aprobado por la FDA ni por ninguna otra agencia reguladora.
- No es un producto sanitario: las salidas requieren revisión humana y no deben emplearse para decisiones clínicas sin validación adicional.
- Validación muy limitada: la equivalencia con el modelo original se comprobó en una sola imagen anatómica; no hay validación poblacional ni clínica publicada.
- Restricciones de licencia: cualquier redistribución debe incluir el texto completo de la FreeSurfer Software License, preservar atribuciones y marcar claramente las versiones modificadas como tales; las versiones modificadas no pueden presentarse como el software original.
- Dependencia de hardware: requiere Apple Silicon con MLX y Metal; no hay soporte documentado para CUDA ni para CPU genérica a través de este paquete.
- Riesgo de alucinación en el sentido de segmentaciones erróneas en escáneres atípicos, patológicos o con artefactos; la cascada robusta mitiga parte del problema, pero no lo elimina.
- Idiomas: no aplica, al no ser un modelo de lenguaje; no se documentan limitaciones lingüísticas.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere adopción muy temprana y poca validación por parte de la comunidad.
- Los pesos son formas modificadas de los originales; conviene citar los artículos de SynthSeg según indica el autor.

## Enlaces

- HuggingFace: https://huggingface.co/MedMLX/synthseg-mlx
- Runtime y documentación: https://github.com/MedMLX/synthseg-mlx
- SynthSeg original (código): https://github.com/BBillot/SynthSeg
- Checkpoints originales en FreeSurfer v8.2.0: https://github.com/freesurfer/freesurfer/tree/v8.2.0/mri_synthseg
- Licencia FreeSurfer: https://surfer.nmr.mgh.harvard.edu/fswiki/FreeSurferSoftwareLicense
- Citación de los artículos de SynthSeg: https://github.com/BBillot/SynthSeg#citationcontact
