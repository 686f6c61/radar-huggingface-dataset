# David-MRI-ORG/mednext-3dconvnext-baseline-breast

## Resumen

El modelo `David-MRI-ORG/mednext-3dconvnext-baseline-breast` es un modelo de segmentacion de imagenes medicas en 3D basado en la arquitectura MedNeXt, una adaptacion del bloque ConvNeXt disenada especificamente para segmentacion volumetrica. Lo publica el usuario David-MRI-ORG con licencia MIT y acceso restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de poder descargarlo. Con 8.073.219 parametros, se situa en el rango de las variantes pequenas de MedNeXt, lo que lo hace ligero y desplegable en hardware de gama media.

El nombre del repositorio apunta a un caso de uso de segmentacion en imagenes de resonancia magnetica (MRI) de mama, si bien las etiquetas del modelo incluyen tambien referencias a BraTS 2023 y a segmentacion de tumores cerebrales, lo que sugiere un entrenamiento o una base de codigo compartida con el ecosistema BraTS. Es, por tanto, una linea base ("baseline") orientada a investigacion en imagen medica, no un modelo generativo de texto.

Su relevancia actual se enmarca en el interes creciente por arquitecturas convolucionales puras (ConvNeXt) para segmentacion medica 3D, donde compiten con transformers volumetricos como SwinUNETR y con la familia nnU-Net. La publicacion reciente de MedNeXt-v2 (arXiv 2512.17774) refuerza esta linea de trabajo al escalar arquitecturas 3D ConvNeXt para segmentacion a gran escala. No obstante, no se dispone de informacion publica sobre el dataset exacto, los hiperparametros de entrenamiento ni los resultados de validacion de este checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MedNeXt (ConvNeXt 3D para segmentacion medica volumetrica) |
| Parametros totales | 8.073.219 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de segmentacion por parches volumetricos, no generativo) |
| Tipos de cuantizacion | no disponible; pesos en safetensors, compatibles con FP32/FP16 |
| Idiomas soportados | no aplica (modelo de vision/segmentacion, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria PyTorch) |
| Pipeline | image-segmentation |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 4 |
| DOI | 10.57967/hf/10872 |

## Arquitectura y entrenamiento

La arquitectura MedNeXt es una ConvNeXt totalmente convolucional adaptada a segmentacion de imagenes medicas 3D. El bloque ConvNeXt sustituye la profundidad y las convoluciones estandar por convoluciones depthwise de kernel grande (7x7x7), inspiradas en los disenos modernos de vision transformers, y aplica normalizacion y capas lineales invertidas. MedNeXt incorpora ademas una expansion de kernel en dos etapas y un diseno de up/down sampling especifico para volumenes, pensado para rendir bien en datasets medicos con anotaciones dispersas. El checkpoint concreto tiene 8.073.219 parametros, lo que corresponde a una variante compacta (probablemente en la linea MedNeXt-S).

No se dispone de informacion sobre el numero de tokens (voxeles) de entrenamiento, la composicion del dataset, el uso de validacion cruzada ni si hubo tecnicas de aumento de datos o regularizacion especificas. Tampoco se especifica si el entrenamiento se realizo con nnU-Net v2 (framework habitual en este tipo de baseline) ni con que funcion de perdida. MedNeXt-v2, la evolucion mas reciente de la familia, introduce escalado compuesto y mejoras de micro-arquitectura, pero no hay constancia de que este checkpoint la utilice.

## Capacidades

- Segmentacion semantica 3D de estructuras en imagenes de resonancia magnetica.
- Procesamiento de volumenes multimodales (el ecosistema BraTS emplea T1, T1ce, T2 y FLAIR; no confirmado para este checkpoint).
- Orientado a segmentacion de tejido mamario segun el nombre del repositorio, aunque las etiquetas tambien apuntan a tumores cerebrales (BraTS 2023).
- Inferencia sobre parches volumetricos (patch-based), tipica de modelos 3D medicos de alta resolucion.
- No dispone de tool calling, function calling ni capacidades de agente (no es un modelo de lenguaje).
- No soporta generacion de texto ni dialogo.
- Sin soporte multilingue (no procesa lenguaje natural).

## Casos de uso

- Segmentacion automatica de lesiones mamarias en MRI: el modelo puede generar mascaras de tejido o lesion sobre volumenes de resonancia magnetica de mama, acelerando la lectura radiologica y la cuantificacion de volumen tumoral.
- Apoyo al diagnostico asistido por ordenador (CAD): integrar las mascaras del modelo en un sistema CAD que calcule metricas morfologicas (volumen, diametro, realce) para priorizar casos en el flujo de trabajo del radiologo.
- Investigacion en imagen medica: servir como linea base ("baseline") reproducible para comparar nuevas arquitecturas de segmentacion 3D bajo el mismo protocolo experimental.
- Preprocesado para pipelines radiomicos: extraer regiones de interes segmentadas antes de calcular caracteristicas radiomicas o entrenar clasificadores aguas abajo.
- Seguimiento longitudinal de pacientes: segmentar estudios seriados para medir cambios de volumen de la lesion a lo largo del tiempo mediante comparacion de mascaras en 3D.
- Validacion y control de calidad: usar las mascaras como referencia para auditar anotaciones manuales o comparar con otros modelos de segmentacion en tareas internas.
- Docencia y prototipado: por su tamano reducido (8 M de parametros) y licencia MIT, es adecuado para entornos academicos y pruebas de concepto sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: reducida por el tamano del modelo (8 M de parametros, aproximadamente 32 MB en FP32). El consumo dominante proviene del volumen de entrada 3D y del tamano de parche, no del modelo en si.
- Pesos en FP32: en torno a 32 MB; en FP16: en torno a 16 MB.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para volumenes 3D completos; NVIDIA RTX 3060/4070 y superiores para prototipado; A100 o H100 solo si se procesan lotes grandes o volumenes de alta resolucion.
- Cabe en GPU de consumo: si, en la mayoria de GPUs consumer modernas (RTX 30/40 series) para inferencia por parches; con parches muy grandes o lotes grandes puede requerir mas memoria.
- Opciones de despliegue: PyTorch nativo; integrable en pipelines nnU-Net v2 (framework habitual del ecosistema); posible exportacion a ONNX/TorchScript. No aplica a llama.cpp, Ollama ni TGI (no es un modelo generativo de texto).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| David-MRI-ORG/mednext-3dconvnext-baseline-breast | 8,07 M | Segmentacion 3D por parches | Segmentacion mama / MRI | MIT | Gated en HuggingFace |
| GuillaumeCassez/mednext-baseline-brats2023gli | no disponible | Segmentacion 3D, MedNeXt-B | Tumores cerebrales BraTS 2023 | no disponible | Publico en HuggingFace |
| nnU-Net (baseline de referencia) | variable (decenas de millones) | Segmentacion 3D/2D | Segmentacion medica general | Apache 2.0 | Codigo abierto (GitHub) |
| SwinUNETR / variantes BraTS | decenas de millones | Transformer volumetrico | Segmentacion medica 3D | variable | Codigo abierto |

La comparacion directa de rendimiento numerico no es posible porque no se han aportado metricas (Dice, Hausdorff) para ninguno de los modelos en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo generativo ni de lenguaje: no debe usarse para tareas de texto, dialogo ni razonamiento simbolico.
- No se han publicado resultados de validacion (Dice, sensibilidad, especificidad), por lo que se desconoce su rendimiento real y su generalizacion.
- El repositorio tiene acceso restringido (gated): es necesario aceptar condiciones en HuggingFace, lo que puede limitar su uso en pipelines automatizados.
- El nombre indica aplicacion a mama, pero las etiquetas incluyen BraTS 2023 y tumores cerebrales; existe ambiguedad sobre el dominio real de entrenamiento que conviene verificar antes de usarlo.
- Descargas registradas: 0, lo que indica escasa validacion por parte de la comunidad y ausencia de evaluaciones externas.
- Riesgo de sobreajuste al dominio de entrenamiento: los modelos de segmentacion medica suelen degradarse al cambiar de escaner, protocolo, resolucion o institucion.
- Al ser imagen medica, cualquier uso clinico requiere validacion regulatoria y supervision profesional; no debe emplearse para decisiones diagnosticas sin aprobacion correspondiente.
- Aunque la licencia es MIT (permisiva para uso comercial), el acceso gated y la falta de documentacion sobre el dataset de entrenamiento pueden complicar el cumplimiento normativo en entornos regulados.
- No hay informacion sobre sesgos demograficos, calidad de las anotaciones ni procedencia de los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/David-MRI-ORG/mednext-3dconvnext-baseline-breast
- Repositorio de MedNeXt (MIC-DKFZ): https://github.com/MIC-DKFZ/MedNeXt
- Paper MedNeXt (MICCAI 2023): referenciado como Roy et al., MICCAI 2023
- Modelo relacionado (BraTS 2023 GLI, MedNeXt-B): https://huggingface.co/GuillaumeCassez/mednext-baseline-brats2023gli
- Paper MedNeXt-v2: https://arxiv.org/abs/2512.17774
- Resumen de MedNeXt V2 Ensemble: https://www.emergentmind.com/topics/mednext-v2-ensemble
