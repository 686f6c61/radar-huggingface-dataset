# qsmxt/qsm-onnx-weights

## Resumen

`qsmxt/qsm-onnx-weights` es un repositorio de pesos en formato ONNX que recopila exportaciones de redes neuronales publicadas para el procesado de imagen por resonancia magnética (MRI), concretamente para tareas de segmentación cerebral y cuantificación de susceptibilidad magnética (QSM). Lo mantiene el proyecto QSMxT y su contenido se consume desde dos herramientas: QSMxT (Python) y QSM.rs (Rust). No es un modelo de lenguaje: es un contenedor de artefactos de inferencia para un pipeline de neuroimagen.

El único artefacto documentado en la model card es `synthseg-2.0.onnx`, la exportación de la red U-Net SynthSeg 2.0 (variante no robusta) de Billot et al., publicada en *PNAS* en 2023. La red produce 33 etiquetas de segmentación cerebral (las 32 de SynthSeg 1.0 más una clase general de LCR, etiqueta 24 de FreeSurfer) a partir de volúmenes de RM con ejes espaciales dinámicos en múltiplos de 32. El repositorio ocupa 2,4 GB, aunque el fichero SynthSeg documentado pesa unos 53 MB, lo que indica que el resto del contenido no está descrito en la model card.

Su relevancia es práctica: permite ejecutar SynthSeg sin TensorFlow ni FreeSurfer, dentro de un runtime ONNX, con verificación de equivalencia numérica frente a la implementación de referencia. La model card reporta Dice ≥ 0,99999 por etiqueta frente a `mri_synthseg` de FreeSurfer 7.3.2 sobre dos volúmenes GRE públicos de 1 mm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de segmentación (SynthSeg 2.0, variante no robusta); exportada a ONNX |
| Parametros totales | no disponible (pesos fuente `synthseg_2.0.h5`: 53.079.152 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada `image` `[1, D, H, W, 1]` con ejes espaciales dinámicos, múltiplos de 32 |
| Tipos de cuantizacion | no disponible (exportación en precisión original, opset 14) |
| Idiomas soportados | no aplica (modelo de imagen médica) |
| Licencia | Apache-2.0 para `synthseg-2.0.onnx`; el repositorio declara `other` / `per-model` (cada fichero conserva su licencia upstream) |
| Formato de pesos | ONNX (opset 14); fuente original en HDF5 (`.h5`, TensorFlow/Keras) |

## Arquitectura y entrenamiento

SynthSeg 2.0 es una red U-Net completamente convolucional entrenada para segmentación cerebral en RM. La variante exportada aquí es la no robusta, que asume una distribución de intensidades relativamente homogénea; las variantes robusta, de parcelación y de control de calidad del mismo archivo de origen no se han exportado. La entrada es un tensor `image` de forma `[1, D, H, W, 1]` con ejes espaciales dinámicos restringidos a múltiplos de 32, y la salida es `unet_prediction`, un tensor de probabilidades softmax de 33 canales.

El entrenamiento es el descrito en las publicaciones de los autores (Billot et al., *Medical Image Analysis* 2023 para SynthSeg y *PNAS* 2023 para SynthSeg 2.0); la model card no detalla número de tokens, composición del dataset ni si hubo ajuste por refuerzo, por lo que esos datos deben consultarse en los papers citados. La innovación técnica de esta ficha no está en el modelo sino en el proceso de exportación: la arquitectura se reconstruyó siguiendo `SynthSeg/predict_synthseg.py` (ruta no robusta), las capas se cargaron por nombre y se convirtieron con tf2onnx 1.16.1 sobre TensorFlow 2.15.1, sin modificar los pesos. El preprocesado y postprocesado (remuestreo, alineación RAS, escalado de intensidad, promediado de volteos, limpieza topológica) no forma parte del grafo ONNX y vive en `qsm_core::segment::synthseg`.

## Capacidades

- Segmentación cerebral en RM en 33 clases (32 de SynthSeg 1.0 más LCR general, etiqueta 24 de FreeSurfer).
- Entrada volumétrica con ejes espaciales dinámicos (múltiplos de 32), sin recompilar el grafo por cada tamaño de volumen.
- Salida de probabilidades softmax por vóxel y clase, apta para postprocesado posterior (argmax, limpieza topológica).
- Ejecución en runtime ONNX, sin dependencia de TensorFlow ni de FreeSurfer.
- Equivalencia numérica verificada frente a `mri_synthseg` de FreeSurfer 7.3.2 (Dice ≥ 0,99999 por etiqueta en dos volúmenes GRE de 1 mm).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.
- No incluye visión genérica ni audio; el dominio es exclusivamente neuroimagen estructural.

## Casos de uso

- Segmentación cerebral en pipelines de neuroimagen en producción: al ejecutarse sobre ONNX, se integra en servicios escritos en Python o Rust sin arrastrar el stack de TensorFlow, lo que simplifica el despliegue en contenedores.
- Cuantificación de susceptibilidad magnética (QSM): es el consumidor natural del repositorio, ya que QSMxT y QSM.rs usan estas redes como paso de segmentación previo al procesado QSM.
- Análisis a gran escala de cohortes clínicas heterogéneas: la variante exportada corresponde a SynthSeg 2.0, diseñada para datos clínicos con distribuciones de intensidad variadas; el coste por volumen es bajo (red de ~53 MB) y permite procesar lotes grandes en CPU.
- Reproducibilidad de resultados científicos: al fijarse el SHA-256 de los pesos fuente y del ONNX, se puede auditar que una segmentación publicada se generó con exactamente los mismos pesos.
- Validación cruzada frente a FreeSurfer: el pipeline de QSM.rs con este fichero se comparó contra `mri_synthseg` (CPU, no robusto) con coincidencia prácticamente total, útil como test de regresión en entornos sin licencia de FreeSurfer.
- Integración en aplicaciones de escritorio o clínicas con requisitos de despliegue ligeros: el grafo ONNX evita dependencias pesadas y puede ejecutarse con `onnxruntime` en máquinas sin GPU dedicada.
- Extracción de volúmenes regionales para estudios longitudinales: la salida de 33 etiquetas permite calcular volúmenes por región y comparar entre visitas, siempre que se aplique el mismo preprocesado documentado en QSM.rs.

## Benchmarks y rendimiento

| Comparación | Métrica | Resultado |
|---|---|---|
| `synthseg-2.0.onnx` vs. FreeSurfer 7.3.2 `mri_synthseg` (no robusto, CPU) en dos volúmenes GRE públicos de 1 mm (OSF gkemr) | Dice por etiqueta | ≥ 0,99999 (un vóxel de diferencia en 6,0 M) |

No se han publicado en la información disponible resultados de benchmarks estándar de segmentación (por ejemplo, Dice agregado sobre datasets de referencia, tiempos de inferencia o throughput) más allá de la verificación de equivalencia descrita.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El fichero ONNX pesa 52.998.426 bytes, por lo que en FP32 el modelo y sus activaciones caben holgadamente en GPUs de consumo, pero no se documentan cifras medidas.
- GPU recomendadas: no disponible. La verificación reportada se ejecutó en CPU contra FreeSurfer.
- GPU de consumo: previsiblemente viable por tamaño de pesos, pero sin datos publicados que lo confirmen.
- Opciones de despliegue: `onnxruntime` (el runtime natural del formato); consumo desde QSMxT (Python) y QSM.rs (Rust). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| `synthseg-2.0.onnx` (este repo) | ONNX opset 14 | Segmentación cerebral, 33 etiquetas | Apache-2.0 (pesos) | Hugging Face, verificado contra FreeSurfer |
| SynthSeg 2.0 original (`synthseg_2.0.h5`) | HDF5 / TensorFlow | Segmentación cerebral, 33 etiquetas | Apache-2.0 | Distribuido por el autor y con FreeSurfer 7.3.2 |
| SynthSeg 2.0 robusto (`synthseg_robust_2.0.h5`) | HDF5 / TensorFlow | Segmentación cerebral, variante robusta a inhomogeneidades | Apache-2.0 | Incluido en el archivo del autor; no exportado a ONNX en este repo |
| SynthSeg 1.0 | HDF5 / TensorFlow | Segmentación cerebral, 32 etiquetas | Apache-2.0 | Repositorio BBillot/SynthSeg |

No se dispone de datos comparativos de rendimiento frente a otras arquitecturas de segmentación (por ejemplo, FreeSurfer `recon-all` o nnU-Net) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones; cualquier uso fuera de segmentación de RM es inadecuado.
- Solo se documenta y exporta la variante no robusta de SynthSeg 2.0; las variantes robusta, de parcelación y de QC no están disponibles en este repositorio.
- El grafo ONNX no incluye preprocesado ni postprocesado (remuestreo, alineación RAS, escalado de intensidad, promediado de volteos, limpieza topológica). Omitirlos produce resultados distintos a los de referencia.
- La entrada exige ejes espaciales múltiplos de 32 y una forma `[1, D, H, W, 1]`; volúmenes con otras dimensiones requieren remuestreo previo.
- La licencia del repositorio es `other` / `per-model`: cada fichero conserva su licencia upstream. Para `synthseg-2.0.onnx` es Apache-2.0 según declaración del autor, pero el resto de artefactos del repositorio (2,4 GB) no está descrito y debe revisarse individualmente antes de uso comercial.
- Riesgo de sesgo en datos clínicos heterogéneos: la variante no robusta puede degradarse con inhomogeneidades de campo o protocolos muy distintos a los de entrenamiento.
- Riesgo de alucinación en el sentido de etiquetado erróneo en regiones anatómicas atípicas o patológicas; no se documentan evaluaciones en poblaciones con patología.
- No se documentan idiomas, benchmarks de robustez ni límites de uso clínico; no debe emplearse como dispositivo médico sin validación regulatoria propia.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario que respalde su estabilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qsmxt/qsm-onnx-weights
- QSM.rs (incluye `src/models/registry.rs` y `scripts/onnx-export/README.md`): https://github.com/astewartau/QSM.rs
- QSMxT: https://github.com/QSMxT/QSMxT
- SynthSeg (repositorio de los autores): https://github.com/BBillot/SynthSeg
- Issue #114 de SynthSeg (re-subida de pesos y aclaración de licencia): https://github.com/BBillot/SynthSeg/issues/114
- Paper SynthSeg 2.0 (PNAS 2023): https://doi.org/10.1073/pnas.2216399120
- Preprint SynthSeg 2.0: https://arxiv.org/abs/2209.02032
- Paper SynthSeg original (Medical Image Analysis 2023): https://doi.org/10.1016/j.media.2023.102789
