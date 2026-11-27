# amine0110/fennecseg

## Resumen

FennecSeg es una familia de modelos compactos de segmentación 3D de tomografías computarizadas (TC), desarrollada por PYCAD (cuenta de Hugging Face `amine0110`) para su uso con la librería de inferencia homónima `fennecseg`. Cada modelo de la familia se especializa en un conjunto de órganos (familia) y se publica como una etiqueta inmutable `<familia>-v<versión>`, de forma que el usuario puede fijar la versión exacta que necesita. El repositorio incluye actualmente tres líneas: `abdomen14` (14 estructuras abdominales), `spine26` (vértebras C1-L6 y sacro) y `thorax7` (cinco lóbulos pulmonares, tráquea y corazón).

El problema que resuelve es la segmentación automática de estructuras anatómicas en TC, una tarea clásica que normalmente requiere modelos de varios cientos de millones de parámetros y tiempos de inferencia elevados. FennecSeg apuesta por modelos "compactos y rápidos": según los datos de la model card, un escaneo completo se procesa en torno a 1,1-1,5 segundos en una RTX 4070 (consumer), incluyendo lectura, filtrado y escritura del volumen.

Los modelos se entrenaron sobre el conjunto de datos TotalSegmentator v3.0.0 (Wasserthal et al., CC BY 4.0) y se evaluaron sobre su split de test oficial. La licencia de los pesos es Apache-2.0, con la advertencia explícita de que no son dispositivos médicos y no deben usarse para diagnóstico ni decisiones de tratamiento. El tamaño del repositorio es de 0,4 GB y la librería se distribuye vía `pip` desde el repositorio de GitHub de PYCAD.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentación 3D para TC; la model card no detalla la arquitectura interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a segmentación de volúmenes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de imagen médica, no lingüístico) |
| Licencia | Apache-2.0 (© 2026 PYCAD); datos de entrenamiento TotalSegmentator v3.0.0 bajo CC BY 4.0 |
| Formato de pesos | no disponible (repo de 0,4 GB; la model card no especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo (no se indica si es una U-Net 3D, un transformer volumétrico ni una arquitectura híbrida), por lo que este dato debe considerarse no disponible. Lo que sí se documenta es el proceso de entrenamiento por versiones: cada release se entrena de forma incremental sobre la anterior mediante *warm-start*. Por ejemplo, `abdomen14-v0.1.0` se entrenó durante unas 4,5 horas (57k iteraciones) y `v0.2.0` partió de esa versión con una noche más de entrenamiento (150k iteraciones) y sobremuestreo 2x de los órganos con peor rendimiento. `v0.3.0` se afinó otras 256k iteraciones con una función de pérdida Dice calculada solo sobre las clases presentes en el batch.

Los modelos de columna (`spine26-v0.1.0`) y tórax (`thorax7-v0.1.0`) se inicializaron por *warm-start* desde versiones de abdomen (178k y 262k iteraciones respectivamente; este último supuso 19,5 horas de GPU). El post-procesado incluye, en `abdomen14-v0.3.0`, la eliminación de piezas conectadas de menos de 337,5 mm³ (100 vóxeles a 1,5 mm de resolución), umbral elegido sobre el conjunto de validación y desactivable con `--min-mm3 0`. Los modelos de columna y tórax no aplican post-procesado. Todos los datos de entrenamiento provienen del split oficial de entrenamiento de TotalSegmentator v3.0.0.

## Capacidades

- Segmentación 3D de TC abdominal en 14 estructuras (`abdomen14`).
- Segmentación de vértebras C1-L6 y sacro (`spine26`, 26 estructuras; `vertebrae_L6` aparece en un solo escaneo de test y se excluye de la media).
- Segmentación torácica en 7 estructuras: cinco lóbulos pulmonares, tráquea y corazón (`thorax7`).
- Inferencia sobre volúmenes NIfTI (`scan.nii.gz` → `seg.nii.gz`) mediante la CLI de `fennecseg`.
- Selección de versión exacta o de la última disponible mediante etiquetas (`--model abdomen14@0.1.0` o `--model abdomen14`).
- Post-procesado opcional de eliminación de componentes pequeñas (`--min-mm3`).
- No se documentan capacidades de tool calling, agentes, texto, visión natural, audio ni razonamiento multi-paso; es un modelo puramente de segmentación de imagen médica.

## Casos de uso

- Investigación en imagen médica: generación de máscaras anatómicas de referencia sobre cohortes de TC para estudios de morfometría, volumetría de órganos o análisis estadístico poblacional, con la ventaja de que el modelo es rápido (≈1,1-1,5 s/escaneo en RTX 4070) y puede procesar lotes grandes en una sola GPU de consumo.
- Preprocesado de pipelines de radiómica: segmentar primero los órganos de interés (por ejemplo, hígado, bazo o riñones con `abdomen14`) y extraer después características de textura o intensidad dentro de la máscara, reduciendo el trabajo manual de delineación.
- Docencia y prototipado: al ser modelos pequeños y de licencia Apache-2.0, permiten montar demos interactivas de segmentación en un portátil con GPU de gama media sin depender de infraestructura de servidor.
- Análisis de composición corporal: usar las máscaras de vértebras (`spine26`) como referencia anatómica para alinear y comparar volúmenes entre pacientes en estudios longitudinales.
- Segmentación pulmonar y cardiaca en investigación cardiotorácica: `thorax7` proporciona lóbulos pulmonares, tráquea y corazón en una sola pasada, útil para cuantificar volúmenes lobares o como paso previo a análisis de función respiratoria.
- Evaluación comparativa de modelos de segmentación: las versiones inmutables (`abdomen14-v0.1.0`, `v0.2.0`, `v0.3.0`) permiten reproducir exactamente los resultados publicados y comparar frente a otros segmentadores sobre el mismo split de test de TotalSegmentator v3.
- Integración en herramientas de anotación: como generador de propuestas iniciales que un radiólogo revisa y corrige, acelerando la creación de datasets etiquetados.

## Benchmarks y rendimiento

Los datos publicados en la model card son los siguientes (todos sobre el split de test oficial de TotalSegmentator v3, con la librería `fennecseg`, en una RTX 4070; el tiempo incluye lectura, filtrado y escritura):

| Versión | Estructuras | Dice | NSD 2 mm | s/escaneo | Conjunto de evaluación |
|---|---|---|---|---|---|
| `abdomen14-v0.1.0` | 14 | 0,886 | 0,893 | 1,50 | 30 TC |
| `abdomen14-v0.2.0` | 14 | 0,901 | 0,915 | 1,52 | 30 TC |
| `abdomen14-v0.3.0` | 14 | 0,884 | 0,900 | 1,16 | 109 TC |
| `spine26-v0.1.0` | 26 | 0,894 | 0,934 | 1,22 | 109 TC |
| `thorax7-v0.1.0` | 7 | 0,917 | 0,903 | 1,10 | 109 TC |

Notas: la caída de Dice de `abdomen14-v0.3.0` respecto a `v0.2.0` se explica porque se evalúa sobre 109 escaneos (el conjunto completo) en lugar de 30; la propia model card indica que sobre los 109 test CTs `v0.3.0` mejora en +0,017 Dice a `v0.2.0`. No se han publicado resultados de benchmarks frente a otros modelos (por ejemplo, el propio TotalSegmentator original) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el repositorio de pesos ocupa 0,4 GB, lo que sugiere un modelo compacto que previsiblemente cabe en GPUs de consumo, pero no se confirma la VRAM exacta.
- GPU de referencia en los benchmarks: NVIDIA RTX 4070 (consumer), con tiempos de 1,10-1,52 s por escaneo completo.
- GPU recomendadas: cualquier GPU con suficiente VRAM para el volumen de entrada; los datos publicados solo validan RTX 4070. Para A100/H100 no hay cifras publicadas.
- ¿Cabe en GPU de consumo? Los benchmarks se ejecutaron en una RTX 4070, por lo que sí es viable en GPU de consumo de gama media-alta; no se especifican requisitos para GPUs de gama baja.
- Opciones de despliegue: la vía documentada es la CLI de `fennecseg` (`pip install "fennecseg[hub] @ git+https://github.com/pycadd/FennecSeg"`), con soporte de descarga desde el Hub. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: ≈1,1-1,5 s por escaneo en RTX 4070, incluyendo E/S; el tiempo de inferencia puro no se desglosa.

## Comparativa con modelos similares

| Modelo | Estructuras | Dice (test) | Licencia | Disponibilidad |
|---|---|---|---|---|
| FennecSeg `abdomen14-v0.3.0` | 14 | 0,884 (109 TC) | Apache-2.0 | Hugging Face + GitHub PYCAD |
| FennecSeg `spine26-v0.1.0` | 26 | 0,894 (109 TC) | Apache-2.0 | Hugging Face + GitHub PYCAD |
| FennecSeg `thorax7-v0.1.0` | 7 | 0,917 (109 TC) | Apache-2.0 | Hugging Face + GitHub PYCAD |
| TotalSegmentator (modelo original) | 100+ estructuras | no disponible en esta información | no disponible en esta información | no disponible en esta información |

No se dispone en la información proporcionada de cifras de rendimiento de TotalSegmentator ni de otros segmentadores comparables sobre el mismo split, por lo que la comparación cuantitativa frente a alternativas queda como no disponible. La diferencia principal documentada es que FennecSeg se presenta como una alternativa compacta y rápida (≈1,1-1,5 s/escaneo en RTX 4070) frente a modelos más pesados.

## Limitaciones y advertencias

- No son dispositivos médicos: la model card indica explícitamente que no deben usarse para diagnóstico ni para decisiones de tratamiento.
- Dominio restringido a TC: no se documenta soporte para otras modalidades (RM, PET, ecografía) ni para imágenes 2D.
- Cobertura anatómica limitada por familia: `abdomen14` cubre 14 estructuras, `spine26` vértebras y sacro, y `thorax7` pulmones, tráquea y corazón; estructuras fuera de esas listas no se segmentan.
- Sensibilidad a estructuras pequeñas: en `abdomen14-v0.3.0` el post-procesado elimina componentes de menos de 337,5 mm³, lo que puede borrar estructuras pequeñas como glándulas adrenales pequeñas; la model card recomienda desactivarlo con `--min-mm3 0` en esos casos.
- Dependencia de la versión de la librería: el post-procesado de `v0.3.0` requiere `fennecseg >= 0.2.0`.
- Sesgos y alucinaciones: no se documentan sesgos demográficos ni análisis de subgrupos; como todo modelo de segmentación, puede producir falsos positivos o negativos en anatomías atípicas, artefactos o protocolos de adquisición distintos a los de entrenamiento.
- Restricciones de licencia: los pesos son Apache-2.0, pero los datos de entrenamiento (TotalSegmentator v3.0.0) están bajo CC BY 4.0 y la model card pide atribuir también el dataset; conviene revisar las condiciones de uso comercial de los datos de origen.
- Idiomas: no aplica, pero la documentación y la CLI están en inglés.
- Reproducibilidad: las etiquetas de versión son inmutables, lo que facilita la reproducibilidad, pero no se publican detalles de arquitectura ni hiperparámetros completos, lo que dificulta reentrenar desde cero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amine0110/fennecseg
- Repositorio de la librería FennecSeg: https://github.com/pycadd/FennecSeg
- Dataset TotalSegmentator v3.0.0 (Wasserthal et al., CC BY 4.0): no se incluye URL directa en la información proporcionada
- Paper de TotalSegmentator: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
