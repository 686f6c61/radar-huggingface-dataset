# sm-ai-team/simplemind-weights

## Resumen

SimpleMind weights es un repositorio de pesos de modelos de segmentación de imagen médica publicados por el equipo sm-ai-team, asociados a los flujos de trabajo públicos basados en grafos de conocimiento del proyecto SimpleMind. No se trata de un modelo único, sino de una colección de artefactos (checkpoints en PyTorch y un workspace completo de nnU-Net) que el sistema descarga, verifica mediante sha256 y enlaza en su directorio `weights/` a través del comando `python -m simplemind.kg assets fetch <workflow>`.

El repositorio cubre dos dominios clínicos: segmentación binaria de pulmón y tráquea en radiografías de tórax (ficheros `cxr/lungs.pth` y `cxr/trachea.pth`, licencia BSD-3-Clause) y segmentación de riñón y lesiones renales en TC abdominal (`nnunet/kidney_lesion_ct.zip`, licencia CC BY-NC-SA 4.0). Los pesos de tórax fueron entrenados por el propio equipo SimpleMind, mientras que el modelo renal se entrenó sobre los datos del reto KiTS23.

Su relevancia actual es práctica: proporciona artefactos reproducibles con verificación de integridad criptográfica para pipelines de investigación en imagen médica, con licencias explícitas por fichero. El tamaño total del repositorio es de 2,5 GB y no requiere cuenta para la descarga. No es un modelo de lenguaje ni un modelo fundacional multimodal: es infraestructura de pesos para tareas concretas de segmentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita; los ficheros de tórax son checkpoints PyTorch (`.pth`) y el renal es un workspace de nnU-Net (U-Net con configuración automática de preprocesado y entrenamiento) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | No disponible; se distribuyen pesos en precisión original (`.pth`, workspace nnU-Net) |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | Mixta por fichero: BSD-3-Clause para `cxr/lungs.pth` y `cxr/trachea.pth`; CC BY-NC-SA 4.0 para `nnunet/kidney_lesion_ct.zip` |
| Formato de pesos | PyTorch `.pth` (tórax) y `.zip` con el workspace de nnU-Net (riñón) |
| Tamano del repositorio | 2,5 GB |
| Pipeline declarado | `image-segmentation` |
| Verificación de integridad | sha256 por fichero (hash de directorio para el workspace nnU-Net), registrado en `plans_dir/kg/WEIGHTS.yaml` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de los modelos de tórax más allá de que son checkpoints PyTorch (`.pth`) entrenados por el equipo SimpleMind para segmentación binaria de pulmón y tráquea en radiografía de tórax. La model card indica explícitamente que no lista los datos de entrenamiento y que no se distribuye ningún dato de entrenamiento en el repositorio.

El modelo renal es un workspace completo de nnU-Net (fichero `nnunet/kidney_lesion_ct.zip`), el framework de segmentación médica que autoconfigura preprocesado, arquitectura U-Net y esquema de entrenamiento a partir de las propiedades del dataset. Se entrenó sobre los datos del reto KiTS23 (Kidney and Kidney Tumor Segmentation Challenge, MICCAI 2023), cuyas imágenes y segmentaciones se publican bajo CC BY-NC-SA 4.0. No se documentan en la información proporcionada detalles sobre número de épocas, aumentos de datos, métricas de validación ni esquemas de regularización.

La innovación técnica destacable no está en la arquitectura sino en el mecanismo de distribución: cada fichero se verifica contra su sha256 registrado junto con el commit de subida, y `kg assets fetch` rechaza cualquier fichero cuyo hash no coincida, lo que aporta reproducibilidad y trazabilidad a los flujos de trabajo del grafo de conocimiento.

## Capacidades

- Segmentación binaria de pulmón en radiografía de tórax (`cxr/lungs.pth`).
- Segmentación binaria de tráquea en radiografía de tórax (`cxr/trachea.pth`).
- Segmentación de riñón izquierdo y derecho en TC abdominal, incluyendo máscaras funcionales y mediciones de volumen renal funcional (workspace nnU-Net).
- Segmentación de lesiones renales en TC abdominal (el nombre del fichero indica `kidney_lesion_ct`).
- Integración con flujos de trabajo de grafo de conocimiento de SimpleMind: `xray_chest_binary_segmentation`, `ct_abdomen_left_right_kidney_masks`, `ct_abdomen_functional_kidney_masks` y `ct_abdomen_functional_kidney_volume_measurements`.
- Descarga y verificación automática de integridad mediante `python -m simplemind.kg assets fetch <workflow>`.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Segmentación de pulmones en radiografías de tórax para investigación: el checkpoint `cxr/lungs.pth` genera máscaras binarias de campo pulmonar que pueden alimentar estudios de área pulmonar, índices de consolidación o preprocesado de pipelines de visión artificial radiológica.
- Delimitación de tráquea en radiografía lateral o frontal: `cxr/trachea.pth` permite aislar la vía aérea superior para análisis de posición, calibre o desplazamiento en estudios retrospectivos.
- Segmentación renal izquierda/derecha en TC abdominal: el workspace nnU-Net produce máscaras separadas por riñón, útiles para volumetría y planificación quirúrgica en investigación.
- Medición de volumen renal funcional: el flujo `ct_abdomen_functional_kidney_volume_measurements` emplea las máscaras funcionales para calcular volúmenes, adecuado en estudios de función renal y nefrectomía parcial.
- Segmentación de lesiones renales en TC: el mismo workspace permite identificar lesiones tumorales renales para análisis de carga tumoral y seguimiento en cohortes de investigación.
- Reproducibilidad de experimentos: el mecanismo de verificación sha256 y el registro en `WEIGHTS.yaml` permiten reconstruir exactamente el estado de pesos usado en un experimento, algo crítico en publicación de resultados de imagen médica.
- Integración en pipelines de grafo de conocimiento: los flujos de SimpleMind enlazan estos pesos con pasos posteriores (mediciones, informes estructurados) dentro de un mismo grafo, lo que facilita la orquestación de estudios de imagen completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la resolución de entrada y del tamaño de parche de cada checkpoint, no documentados.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del repositorio (2,5 GB) y la naturaleza de los modelos (segmentación 2D/3D), es razonable esperar que quepan en GPUs consumer, pero no se confirma en la model card.
- ¿Cabe en GPU consumer?: no confirmado; el workspace nnU-Net puede requerir más memoria por el procesamiento 3D por parches.
- Opciones de despliegue: el mecanismo oficial es `python -m simplemind.kg assets fetch <workflow>`; los checkpoints `.pth` son cargables con PyTorch y el workspace nnU-Net con el framework nnU-Net. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|
| SimpleMind weights (este repositorio) | Checkpoints PyTorch + workspace nnU-Net | Radiografía de tórax y TC abdominal | Mixta por fichero (BSD-3-Clause / CC BY-NC-SA 4.0) | Hugging Face, descarga sin cuenta |
| TotalSegmentator | Modelo de segmentación multiórgano | TC (y parcialmente RM) | Apache 2.0 (versión open) / licencia comercial separada | GitHub, Hugging Face |
| nnU-Net (vanilla, KiTS23) | Framework U-Net configurable | TC abdominal (riñón) | Apache 2.0 (código); pesos dependen del dataset | GitHub |
| MONAI Model Zoo | Colección de modelos médicos | Diversos | Variable por modelo | GitHub, Hugging Face |

La comparación se limita a categoría y licencia: no se dispone de métricas de rendimiento publicadas en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Los modelos son de uso exclusivamente en investigación; la model card indica explícitamente que no están aprobados para uso clínico.
- El modelo renal (`nnunet/kidney_lesion_ct.zip`) está bajo CC BY-NC-SA 4.0: uso no comercial, con atribución y compartir igual. Para uso comercial es necesario contactar con los organizadores de KiTS.
- La licencia de los pesos de tórax es BSD-3-Clause, pero la model card no documenta los datos de entrenamiento, lo que limita la evaluación de sesgos y generalización.
- No se documentan métricas de validación, dominios de procedencia de las imágenes ni demografía de las cohortes de entrenamiento; el riesgo de sesgo por fabricante de escáner, protocolo o población no puede evaluarse.
- El modelo renal se entrenó sobre KiTS23, un dataset de un único reto con características específicas de adquisición; su generalización a otros protocolos no está garantizada.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de segmentaciones erróneas en imágenes fuera de distribución (patología atípica, artefactos, contraste).
- El repositorio no incluye datos de entrenamiento ni código de inferencia más allá del comando de descarga; el usuario debe aportar el pipeline de SimpleMind o cargar los pesos manualmente.
- La licencia "other" a nivel de repositorio refleja la mezcla por fichero; es responsabilidad del usuario verificar la licencia del fichero concreto que utilice.
- La fecha de creación del repositorio (2026-11-03) es futura respecto a la fecha habitual de consulta; verificar la vigencia antes de usarlo en producción.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento multi-paso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sm-ai-team/simplemind-weights
- Reto KiTS23: https://kits-challenge.org
- Repositorio KiTS23 en GitHub: https://github.com/neheller/kits23
- DOI del reto KiTS23: https://doi.org/10.5281/zenodo.7840134
- nnU-Net (framework del modelo renal): no se enlaza en la model card; referencia habitual en https://github.com/MIC-DKFZ/nnUNet
