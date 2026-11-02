# MedMLX/nnunet-pancreas-mlx

## Resumen

nnU-Net · Pancreas es un modelo de segmentación de imágenes médicas en 3D especializado en la detección del páncreas y del cáncer pancreático en tomografías computarizadas (TC). Lo publica MedMLX, un proyecto centrado en llevar inferencia de imagen médica a Apple Silicon, y deriva del checkpoint PancCTMultiTalentV2 (arquitectura ResEncUNet-L) del método PANTHER, publicado por Omer Durugol y Maximilian Rokuss. La conversión a MLX safetensors se ha realizado sin reentrenamiento: se adaptan los pesos y los metadatos de fold y trainer al formato de la librería `nnunet-mlx`.

El modelo resuelve una tarea concreta y clínicamente relevante: la segmentación volumétrica de un órgano blando y de lesiones tumorales en TC abdominal, donde la delimitación manual es costosa y variable entre observadores. Su interés actual radica en que permite ejecutar un pipeline nnU-Net completo en hardware de consumo Apple (Metal), sin GPU dedicada, lo que facilita la investigación reproducible y la experimentación local con volúmenes NIfTI.

No es un modelo de lenguaje ni un transformer generativo: es una red convolucional 3D de segmentación con pesos en safetensors, licencia CC-BY-4.0 y un tamaño de repositorio de 0,4 GB. La model card lo restringe explícitamente a investigación y educación, y advierte de que no está validado para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net con backbone ResEncUNet-L (red convolucional 3D de segmentación) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors MLX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (metadatos de la model card; la tarea es de imagen) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (convertidos a MLX) |

## Arquitectura y entrenamiento

La arquitectura es nnU-Net, un framework de segmentación médica que autoconfigura el preprocesado, la topología de red y el entrenamiento según el dataset. En este caso el backbone es ResEncUNet-L, una U-Net 3D con bloques residuales, operando sobre volúmenes de TC pancreático en formato NIfTI. El checkpoint de origen es PancCTMultiTalentV2, asociado al método PANTHER (multi-stage fine-tuning y ensembling para segmentación de tumores pancreáticos en MRI diagnóstica y terapéutica). La conversión a MLX no incluye reentrenamiento: MedMLX ha transformado los pesos a safetensors y ha adaptado los metadatos de fold y trainer.

El modelo de origen se apoya en la filosofía MultiTalent, un enfoque de preentrenamiento multi-dataset para segmentación médica que busca generalización entre dominios. La model card no detalla el número de tokens ni la composición exacta del dataset de entrenamiento; sí indica que el modelo upstream se entrenó con datasets que incluyen PANORAMA, cuyos datos tienen licencia separada CC-BY-NC-4.0. No se documentan innovaciones de inferencia como decodificación especulativa ni atención lineal, al no tratarse de un modelo autorregresivo. La inferencia se realiza con ventana deslizante (parámetro `step_fraction`) y opción de mirroring (test-time augmentation), tal como es habitual en nnU-Net.

## Capacidades

- Segmentación 3D de páncreas y de cáncer pancreático en TC abdominal.
- Entrada de volúmenes NIfTI (`.nii.gz`) y salida de máscaras de segmentación.
- Ejecución de inferencia por folds (por ejemplo, `folds=[0]`), con posibilidad de ensemblar varios folds.
- Test-time augmentation mediante mirroring opcional (`use_mirroring`).
- Control de la ventana deslizante mediante `step_fraction` para equilibrar precisión y coste computacional.
- Ejecución nativa en Apple Silicon mediante MLX y Metal.
- Integración con Python 3.13 y el paquete `nnunet-mlx` (versión mínima 0.6.4).
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o visión general.

## Casos de uso

- Investigación en segmentación pancreática: ejecutar el checkpoint sobre cohortes de TC propias para comparar métricas de solapamiento con otros métodos, aprovechando que la conversión no altera los pesos originales.
- Prototipado local en Apple Silicon: desarrollar y depurar pipelines de imagen médica en un Mac con Metal, sin depender de una GPU dedicada ni de servicios en la nube.
- Preetiquetado asistido para revisión experta: generar máscaras iniciales de páncreas y tumor que un radiólogo revise y corrija, reduciendo el tiempo de anotación en la creación de datasets.
- Validación de pipelines de despliegue: usar el modelo como caso de prueba para verificar la instalación de `nnunet-mlx`, la descarga por revisión fija de HuggingFace y la reproducibilidad de resultados entre máquinas.
- Docencia en imagen médica computacional: ilustrar el flujo completo de nnU-Net (preprocesado, ventana deslizante, ensembling de folds) con un modelo pequeño (0,4 GB) y ejecutable en portátil.
- Experimentación con test-time augmentation: comparar configuraciones con y sin mirroring y distintos `step_fraction` para estudiar el compromiso entre coste y calidad de segmentación en un órgano de geometría variable.
- Evaluación de generalización entre dominios: al derivar de un enfoque MultiTalent, sirve para estudiar el comportamiento del modelo en TC de distintas procedencias y protocolos, siempre en contexto de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,4 GB, lo que da una cota inferior del peso de los parámetros, pero no se documenta el pico de memoria durante la inferencia 3D con ventana deslizante.
- GPU recomendadas: el modelo está diseñado para Apple Silicon con Metal; no se documentan requisitos para GPU NVIDIA o AMD.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon, que es el objetivo declarado del proyecto (inferencia on-device). No se especifican modelos mínimos de chip.
- Opciones de despliegue: paquete `nnunet-mlx` (Python 3.13) sobre MLX; descarga de pesos vía `huggingface-hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nnU-Net · Pancreas (MedMLX) | nnU-Net ResEncUNet-L 3D, MLX | no disponible | no aplica | CC-BY-4.0 | HuggingFace, repo de 0,4 GB |
| Checkpoint original PancCTMultiTalentV2 (PANTHER) | nnU-Net ResEncUNet-L 3D | no disponible | no aplica | CC-BY-4.0 (archivo Zenodo) | Zenodo |
| nnU-Net estándar (framework) | nnU-Net configurable | depende del dataset | no aplica | Apache-2.0 (framework) | GitHub |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No validado para uso clínico: la model card lo restringe a investigación y educación; no debe usarse para diagnóstico ni decisiones terapéuticas.
- Licencia de datos upstream sin resolver: el modelo se entrenó con datasets que incluyen PANORAMA (CC-BY-NC-4.0), mientras que el `dataset.json` upstream contiene un campo CC-BY-SA-4.0 y el archivo Zenodo se etiqueta CC-BY-4.0. Las implicaciones para uso downstream no están resueltas de forma independiente.
- Obligación de atribución: al redistribuir, hay que citar el release de Durugol y Rokuss en Zenodo e identificar los cambios realizados por MedMLX.
- Dominio estrecho: solo segmenta páncreas y cáncer pancreático en TC; no es un modelo general de segmentación ni de lenguaje.
- Riesgo de fallo en dominios distintos: no se documenta la robustez ante protocolos de TC, contrastes o poblaciones diferentes a los del entrenamiento.
- Idioma: los metadatos declaran solo inglés; no hay soporte multilingüe relevante para la tarea.
- Sin datos de benchmarks ni de memoria pico: la planificación de recursos en producción requiere medición propia.
- Dependencia de ecosistema: requiere MLX y Apple Silicon; no hay ruta documentada para otras plataformas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MedMLX/nnunet-pancreas-mlx
- Repositorio GitHub del proyecto: https://github.com/MedMLX/nnunet-mlx
- Documentación de ejecución: https://github.com/MedMLX/nnunet-mlx/blob/main/README.md#run
- Paper MedMLX: https://doi.org/10.64898/2026.10.28.26366762
- Paper del checkpoint de origen (PANTHER): https://arxiv.org/abs/2508.21775
- Paper del método de preentrenamiento (MultiTalent): https://arxiv.org/abs/2303.14444
- Release Zenodo del checkpoint original: https://doi.org/10.5281/zenodo.17212158
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
