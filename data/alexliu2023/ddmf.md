# AlexLiu2023/DDMF

## Resumen

DDMF (Deep learning-enabled 3D multimodal fusion) es un conjunto de modelos de segmentación 3D para imagen médica dental, publicado por JXLiu-AI y empaquetado en Hugging Face por el usuario AlexLiu2023. Acompaña al artículo "Deep learning-enabled 3D multimodal fusion of cone-beam CT and intraoral mesh scans for clinically applicable tooth-bone reconstruction", publicado en *Cell Press Patterns* en 2023. El paquete incluye dos checkpoints de PyTorch para segmentación de dientes y de hueso alveolar sobre volúmenes de CBCT (cone-beam computed tomography), y un modelo ONNX para segmentación sobre escaneos intraorales (IOS).

El repositorio no es un modelo de lenguaje ni un modelo fundacional: son pesos de segmentación semántica 3D entrenados con una versión modificada de MMSegmentation. Su relevancia es acotada y de nicho: sirve como referencia reproducible para investigación en reconstrucción dental y ósea a partir de la fusión de CBCT y mallas intraorales, no como componente listo para producción clínica.

El repositorio de Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0.0 GB declarado y no especifica licencia, idiomas ni pipeline. La model card advierte explícitamente de que los checkpoints son archivos heredados (legacy), de que no se han revalidado las métricas del artículo para este empaquetado y de que los modelos no están aprobados para diagnóstico ni tratamiento clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (segmentación 3D sobre MMSegmentation modificado; detalles de backbone no especificados) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión/segmentación 3D) |
| Tipos de cuantizacion | No disponible (se distribuyen checkpoints `.pth` en precisión original y un modelo `.onnx`) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible; la model card indica que no se afirma una licencia nueva y que deben preservarse las obligaciones de licencia del código fuente y de terceros |
| Formato de pesos | PyTorch `.pth` (tooth_iter_160000.pth, bone_iter_160000.pth) y ONNX (ios_model.onnx) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de los modelos. Por el contexto del repositorio (tags `medical-imaging`, `segmentation`, `cbct`, `dental` y uso de MMSegmentation 0.15.0 con modificaciones locales), se trata de redes de segmentación 3D aplicadas a volúmenes CBCT y a escaneos intraorales. El paquete incluye dos checkpoints de CBCT (segmentación de dientes y de hueso alveolar) y un modelo ONNX para segmentación de IOS.

El entrenamiento se realizó, según la model card, en un entorno con Python 3.8, PyTorch 1.8.0, TorchVision 0.9.0, MMCV 1.3.8 y MMSegmentation 0.15.0 con modificaciones locales. Los checkpoints corresponden a la iteración 160000. No se especifican en la información disponible el número de tokens, la composición del dataset, el volumen de datos de entrenamiento ni si hubo etapas de refinamiento tipo RLHF/DPO (no aplicables a este tipo de modelo). La model card señala que el checkpoint de hueso no se presenta como el mejor checkpoint por validación y que las métricas del artículo no se han revalidado para este empaquetado.

## Capacidades

- Segmentación 3D de dientes sobre volúmenes CBCT (checkpoint `tooth_iter_160000.pth`).
- Segmentación 3D de hueso alveolar sobre volúmenes CBCT (checkpoint `bone_iter_160000.pth`).
- Segmentación sobre escaneos intraorales (IOS) mediante el modelo ONNX `ios_model.onnx`.
- Fusión multimodal CBCT + malla intraoral para reconstrucción diente-hueso, según el artículo asociado; los scripts de despliegue y las plantillas de mandíbula necesarias no se incluyen en el repositorio.
- Inferencia en PyTorch (checkpoints `.pth`) y en ONNX (modelo IOS).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de generación de texto, de código, de matemáticas, de visión general ni de audio.

## Casos de uso

- Investigación en segmentación dental automatizada: cargar `tooth_iter_160000.pth` con la configuración correspondiente del repositorio de código para obtener máscaras de dientes en volúmenes CBCT y comparar con métodos de referencia en estudios académicos.
- Segmentación de hueso alveolar en estudios de periodoncia: usar `bone_iter_160000.pth` para delimitar el hueso alveolar en CBCT como paso previo a análisis morfométricos en investigación.
- Reconstrucción diente-hueso multimodal: combinar las predicciones de CBCT con mallas intraorales (IOS) siguiendo el pipeline del artículo, siempre que se disponga de las plantillas de mandíbula estándar y de los datos de paciente, que no se incluyen en el repositorio.
- Segmentación de escaneos intraorales en despliegues ligeros: desplegar `ios_model.onnx` en un runtime ONNX para inferencia sobre mallas IOS en entornos de investigación con requisitos de portabilidad.
- Reproducibilidad de resultados publicados: emplear los checkpoints archivados y las configuraciones embebidas en `notes/` del repositorio de código para replicar experimentos del artículo de *Patterns* (2023).
- Docencia y formación en imagen médica 3D: usar el paquete como ejemplo práctico de segmentación 3D con MMSegmentation en cursos de procesamiento de imagen dental, con las advertencias de que no es un producto clínico.
- Baseline para comparativas académicas: servir de referencia en publicaciones que evalúen nuevos métodos de segmentación dental o de fusión CBCT-IOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas reportadas en el artículo no se han revalidado para este empaquetado y no incluye cifras de Dice, IoU ni de ningún otro indicador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño de los volúmenes CBCT de entrada y de la arquitectura concreta, que no se especifica.
- GPU recomendadas: no disponible en la información proporcionada. El entorno registrado (PyTorch 1.8.0, CUDA no especificada) sugiere GPUs compatibles con PyTorch 1.8, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de memoria ni de rendimiento que permitan afirmarlo.
- Opciones de despliegue: PyTorch para los checkpoints `.pth` (con MMSegmentation 0.15.0 modificado) y runtime ONNX para `ios_model.onnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación con alternativas de segmentación dental o de fusión CBCT-IOS.

## Limitaciones y advertencias

- Los modelos no están aprobados para diagnóstico clínico ni para tratamiento; su uso es exclusivamente de investigación.
- Las métricas del artículo no se han revalidado para este empaquetado, por lo que el rendimiento real de estos checkpoints concretos es incierto.
- El checkpoint de hueso (`bone_iter_160000.pth`) no se presenta como el mejor checkpoint por validación.
- Los `.pth` son checkpoints legacy de PyTorch: solo deben cargarse archivos de confianza, ya que la deserialización puede ejecutar código.
- No se incluyen datos de pacientes ni plantillas estándar de mandíbula en STL; la fusión dependiente de plantilla requiere esos activos por separado.
- La licencia no está especificada; deben preservarse las obligaciones de licencia del código fuente y de terceros, lo que genera incertidumbre sobre el uso comercial.
- No se dispone de información sobre sesgos, riesgo de alucinación (no aplicable a un modelo de segmentación, pero sí existe riesgo de falsos positivos y negativos en las máscaras), limitaciones de idioma ni de contexto.
- El repositorio declara 0.0 GB de tamaño, lo que puede indicar que los pesos no están efectivamente alojados o que la información de tamaño no es fiable; conviene verificar los archivos y los checksums de `SHA256SUMS.txt` antes de su uso.
- El pipeline no está declarado y el repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlexLiu2023/DDMF
- Artículo (DOI): https://doi.org/10.1016/j.patter.2023.100825
- Código: https://github.com/JXLiu-AI/DDMF
- Código original en Zenodo: https://doi.org/10.5281/zenodo.8027716
