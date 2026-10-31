# MedMLX/totalsegmentator-mlx

## Resumen

MedMLX/totalsegmentator-mlx es un puerto nativo a MLX (el framework de aprendizaje automático de Apple para Apple Silicon) de los modelos de segmentación de TC de TotalSegmentator v2, publicado por la organización MedMLX en Hugging Face. Permite segmentar 117 estructuras anatómicas a partir de tomografías computarizadas (CT) ejecutando la inferencia localmente en Mac, sobre Metal y sin depender de PyTorch ni de GPU NVIDIA. Los pesos se han convertido desde los archivos oficiales de TotalSegmentator v2.0.0; la conversión solo cambia nombres y disposición de tensores, sin reentrenamiento.

El repositorio (0,8 GB) incluye ocho modelos: los cinco modelos estándar de 1,5 mm (carpetas 291–295), el modelo rápido de 3 mm (297), el modelo grueso de 6 mm (298) y el modelo de recorte corporal (300), cada uno con sus planes de nnU-Net y metadatos. Su relevancia reside en llevar un flujo de trabajo de imagen médica consolidado a hardware de consumo Apple, con salida de máscara multietiqueta sobre la rejilla original de la imagen. No es un modelo de lenguaje, sino un modelo de visión por computador (segmentación).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nnU-Net (arquitecturas U-Net 3D configuradas por el framework; planes incluidos en el repositorio; detalle exacto por modelo no disponible) |
| Parámetros totales | no disponible (repo completo de 0,8 GB con 8 modelos) |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de segmentación de imágenes, no de lenguaje) |
| Tipos de cuantización | no disponible (conversión a safetensors de MLX sin cuantización documentada) |
| Idiomas soportados | no aplicable (modelo de visión por computador) |
| Licencia | Apache-2.0 (tareas total y body) |
| Formato de pesos | safetensors (nativo para MLX) |

## Arquitectura y entrenamiento

TotalSegmentator v2 se construye sobre nnU-Net, el framework de segmentación médica autoconfigurable que emplea arquitecturas tipo U-Net 3D. El repositorio distribuye cinco modelos estándar de 1,5 mm (conjuntos de datos 291–295, coherentes con la convención de nnU-Net de entrenar cinco folds para ensemble), un modelo rápido de 3 mm (297), un modelo grueso de 6 mm (298) y un modelo de recorte corporal (300). Cada carpeta incluye los planes de nnU-Net y los metadatos del modelo. MedMLX no ha reentrenado los modelos: únicamente convirtió los pesos oficiales de TotalSegmentator v2.0.0 al formato de MLX, modificando nombres y layouts de tensores. Los datos de entrenamiento originales (número de volúmenes, composición del dataset, uso de RLHF/DPO u otras técnicas) no están disponibles en la información proporcionada.

La innovación técnica principal no está en la arquitectura sino en el despliegue: la ejecución se realiza sobre Metal mediante MLX, reutilizando el motor público nnunet-mlx, de modo que la inferencia funciona en Apple Silicon sin PyTorch. Según el preprint de medRxiv del grupo, MedMLX es una colección de 21 modelos consolidados de imagen médica reescritos en MLX (incluye nnU-Net, TotalSegmentator, MedSAM2 y SAM 3), con verificación de que los resultados coinciden con el software original.

## Capacidades

- Segmentación de 117 estructuras anatómicas a partir de un CT de entrada en formato NIfTI (tarea total).
- Tres modos de operación: estándar (1,5 mm, máxima calidad), rápido (3 mm) y grueso (6 mm), para equilibrar precisión y velocidad.
- Tarea body (recorte corporal) para generar máscaras del cuerpo y acotar el campo de trabajo.
- Recorte opcional por ROI o por cuerpo sobre la imagen de entrada.
- Salida de máscara multietiqueta sobre la rejilla de la imagen original, lista para análisis cuantitativo posterior.
- Ejecución totalmente local en Apple Silicon sobre Metal, sin envío de datos a servicios externos.
- Interfaz de línea de comandos sencilla (`totalsegmentator-mlx predict -i ct.nii.gz -o mask.nii.gz`).
- No soporta tool calling, agentes ni capacidades de lenguaje: no es aplicable al ser un modelo de segmentación.

## Casos de uso

- Investigación médica en Mac sin GPU NVIDIA: laboratorios o grupos pequeños con hardware Apple pueden ejecutar segmentación de 117 estructuras localmente, sin migrar a CUDA ni depender de la nube, lo que simplifica la reproducibilidad en entornos macOS.
- Procesamiento sensible en privacidad: al ejecutarse íntegramente en el dispositivo, imágenes de pacientes no salen del equipo, adecuado para estudios con datos clínicos protegidos (siempre con revisión humana de las salidas).
- Anotación asistida de datasets: las máscaras multietiqueta sobre la rejilla original sirven como anotaciones iniciales para entrenar o validar otros modelos de imagen médica, reduciendo el esfuerzo de etiquetado manual.
- Análisis de composición corporal: la segmentación de vértebras, músculos y tejidos permite cuantificar volúmenes y medidas (por ejemplo, en estudios longitudinales de sarcopenia), con el modo rápido de 3 mm para cohortes grandes.
- Contorneado previo en planificación de radioterapia: los contornos automáticos de órganos de riesgo pueden usarse como borrador que el especialista corrige, acelerando el flujo de trabajo (nunca como sustituto del criterio clínico).
- Preprocesamiento en pipelines de imagen: la tarea body y el recorte por ROI permiten recortar el campo de visión antes de etapas posteriores, reduciendo tiempo de cómputo en cadenas de procesamiento multi-modelo.
- Docencia e imagen médica educativa: los modos rápido (3 mm) y grueso (6 mm) permiten demos interactivas en clase en portátiles Apple Silicon sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El preprint de medRxiv del grupo describe que los puertos MLX se verifican comparando sus resultados con el software original, pero no se incluyen cifras concretas (Dice, tiempos de ejecución, etc.) en la información proporcionada.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (chips M de Apple) mediante MLX y ejecución sobre Metal; no requiere GPU NVIDIA ni CUDA.
- Memoria: al usar memoria unificada de Apple Silicon, no hay requisito de VRAM dedicada. El repo completo pesa 0,8 GB para 8 modelos, de modo que cada modelo individual ocupa del orden de 100 MB (estimación a partir del tamaño del repo); un Mac con 8 GB de memoria unificada debería ser suficiente en principio (estimación no verificada).
- Consumer GPU: no aplicable a GPU dedicadas; sí funciona en equipos de consumo Apple Silicon (portátiles y desktops de la gama M).
- Despliegue: instalación vía `uv pip install "nnunet-mlx>=0.6.1" "totalsegmentator-mlx>=0.1.4" huggingface-hub`; descarga de pesos con `hf download MedMLX/totalsegmentator-mlx --revision 6c03d6f90ccf53f224c3985cbdecf1eaa96555af --local-dir models`; inferencia con el CLI `totalsegmentator-mlx predict`.
- vLLM, TGI, llama.cpp y Ollama no son aplicables (son herramientas para modelos de lenguaje, no para este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Framework | Hardware | Estructuras segmentadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedMLX/totalsegmentator-mlx | MLX (safetensors) | Apple Silicon (Metal) | 117 (tarea total) | Apache-2.0 | Hugging Face y GitHub |
| TotalSegmentator v2.0.0 (oficial, wasserth) | PyTorch | GPU NVIDIA/CUDA (y CPU) | 117 (tarea total) | Apache-2.0 (tareas total y body) | GitHub, pesos en releases oficiales |
| MedSAM2 / SAM 3 (colección MedMLX) | MLX | Apple Silicon | no disponible | no disponible | Descritos en el preprint de medRxiv del grupo |

El puerto MedMLX se distingue del original por eliminar la dependencia de PyTorch y CUDA en inferencia, a costa de ser un repositorio muy nuevo y sin trazabilidad de rendimiento publicada.

## Limitaciones y advertencias

- Uso restringido a investigación y educación según la model card; las salidas requieren revisión humana obligatoria y no deben usarse para diagnóstico clínico sin validación.
- Los pesos no fueron reentrenados: la equivalencia con el software original depende de la corrección del puerto a MLX; el preprint describe verificaciones, pero sin cifras públicas en la información disponible.
- Repositorio muy reciente (creado el 30 de octubre de 2026) con 0 descargas y 0 likes: falta madurez y validación por parte de la comunidad.
- Entrada limitada a imágenes de TC en formato NIfTI (`ct.nii.gz`); no cubre RM ni otras modalidades.
- Sin cuantización documentada ni detalles de parámetros por modelo, lo que dificulta estimar recursos con precisión.
- Licencia Apache-2.0 aplicable a las tareas total y body; los autores piden citar TotalSegmentator y nnU-Net según indican los autores originales.
- Como todo modelo de segmentación, puede fallar en anatomías atípicas, patologías extensas, implantes metálicos o artefactos; conviene validar sobre la población de interés antes de cualquier uso serio.
- Solo funciona en Apple Silicon; no hay soporte documentado para ejecución en Linux/Windows con este puerto (para ello existe el TotalSegmentator original).

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/MedMLX/totalsegmentator-mlx
- Organización MedMLX en Hugging Face: https://huggingface.co/MedMLX
- Repositorio GitHub del puerto: https://github.com/MedMLX/totalsegmentator-mlx
- README del paquete totalsegmentator-mlx: https://github.com/MedMLX/totalsegmentator-mlx/blob/main/README.md
- Repositorio oficial de TotalSegmentator: https://github.com/wasserth/TotalSegmentator
- Pesos oficiales de TotalSegmentator v2.0.0: https://github.com/wasserth/TotalSegmentator/releases/tag/v2.0.0-weights
- Preprint MedMLX en medRxiv: https://www.medrxiv.org/content/10.64898/2026.10.28.26366762v1
