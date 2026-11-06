# Siya-34/dentalvision-convnext-tiny

## Resumen

DentalVision AI ConvNeXt-Tiny (v2.0.0) es un clasificador multi-etiqueta de imagenes radiograficas panoramicas dentales (OPG) desarrollado por el usuario Siya-34. El modelo predice seis hallazgos independientes mediante seis salidas sigmoides: dientes sanos, caries, dientes impactados, infeccion, dientes fracturados y BDC/BDR. Se distribuye como un checkpoint de PyTorch en formato safetensors con 27.824.742 parametros, derivado de la arquitectura ConvNeXt-Tiny con pesos preentrenados en ImageNet.

El modelo se presenta explicitamente como un prototipo educativo y de investigacion, no como herramienta diagnostica. Forma parte de un ensemble descrito en la model card junto a EfficientNetB3 y DenseNet121, aunque el repositorio solo publica los pesos de la variante ConvNeXt-Tiny. La entrada es una imagen RGB redimensionada a 256x512 pixeles con normalizacion ImageNet, y la salida son seis probabilidades independientes en un orden fijo.

Su relevancia es limitada pero ilustrativa: muestra un flujo completo de transferencia de aprendizaje desde vision general a imagen medica dental con un conjunto de datos muy pequeno (230 radiografias unicas tras deduplicacion), lo que lo convierte en un caso de estudio sobre las limitaciones de los datasets reducidos en dominios clinicos. No hay informacion sobre contexto, idiomas ni pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (CNN moderna con bloques tipo transformer, preentrenada en ImageNet) |
| Parametros totales | 27.824.742 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 256x512 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria PyTorch) |

## Arquitectura y entrenamiento

El modelo emplea ConvNeXt-Tiny, una red convolucional pura que incorpora decisiones de diseno inspiradas en transformadores (convoluciones depthwise de 7x7, normalizacion LayerNorm, activacion GELU y estructura de etapas con ratios 1:1:3:1). Se inicializa con pesos de ImageNet y se ajusta mediante transferencia de aprendizaje para la tarea multi-etiqueta de seis hallazgos en radiografias OPG.

El entrenamiento usa perdida BCE con pesos de clase positiva, optimizador AdamW, schedule de coseno y parada temprana sobre macro-AUC de validacion. El conjunto de datos es el `imtkaggleteam/dental-opg-xray-dataset` de Kaggle, que tras eliminar copias byte-identicas almacenadas en varias carpetas de clase queda en 230 radiografias unicas. No se redistribuyen los datos. No se documenta el numero de tokens ni composicion de dataset mas alla de esta cifra, ni se menciona RLHF, DPO ni innovaciones de decodificacion (no aplicables a un clasificador de vision).

## Capacidades

- Clasificacion multi-etiqueta de seis hallazgos en radiografias panoramicas dentales: dientes sanos, caries, dientes impactados, infeccion, dientes fracturados y BDC/BDR.
- Salida de seis probabilidades sigmoides independientes, lo que permite que varias condiciones esten presentes simultaneamente en la misma imagen.
- Preprocesado definido: redimensionado bilineal a 256x512 (alto x ancho) y normalizacion con media y desviacion estandar de ImageNet.
- Soporte de interpretabilidad mediante Grad-CAM, segun la etiqueta `grad-cam` del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Prototipo de investigacion en clasificacion de hallazgos dentales: sirve como linea base reproducible para comparar arquitecturas CNN en datasets OPG pequenos, dado que el autor documenta resultados out-of-fold y de fold-0.
- Docencia y formacion en imagen medica: permite ilustrar el flujo completo de transferencia de aprendizaje, deduplicacion de datasets y evaluacion multi-etiqueta con macro-AUC y mAP en un contexto controlado.
- Generacion de mapas de calor con Grad-CAM para explorar que regiones de la radiografia activan cada salida, util en estudios de interpretabilidad y auditoria de sesgos visuales.
- Preetiquetado asistido en pipelines de anotacion: las seis probabilidades pueden usarse como sugerencias preliminares que un profesional revisa y corrige, acelerando el etiquetado de nuevas radiografias.
- Experimentacion con ensembles: el checkpoint ConvNeXt-Tiny puede combinarse con EfficientNetB3 y DenseNet121, tal como describe la model card, para estudiar el efecto de la fusion de modelos en tareas multi-etiqueta con pocos datos.
- Evaluacion de robustez y calibracion: al tratarse de un modelo pequeno y con datos limitados, es adecuado para estudiar como se degrada el rendimiento fuera de distribucion y para probar tecnicas de calibracion de probabilidades.

## Benchmarks y rendimiento

| Evaluacion | Macro AUC | mAP | Macro F1 |
|---|---|---|---|
| Test fold-0 (n=37) | 0.731 | 0.612 | 0.548 |
| Out-of-fold agrupado 6 folds (230 imagenes) | 0.636 | 0.537 | 0.512 |

No se han publicado comparaciones con modelos alternativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 27,8 M de parametros y entradas de 256x512; en FP16 aproximadamente 0,1 GB de pesos mas activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3050, RTX 4060, T4, A100 o H100 sin problemas de memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch nativo, TorchScript o exportacion a ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de vision).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DentalVision ConvNeXt-Tiny (este) | 27,8 M | 256x512 RGB | 6 hallazgos OPG multi-etiqueta | Apache 2.0 | Hugging Face |
| ConvNeXt-Tiny ImageNet (base) | 28,6 M | 224x224 RGB | Clasificacion ImageNet 1000 clases | MIT | Ampliamente disponible |
| EfficientNetB3 (base) | 12,2 M | 300x300 RGB | Clasificacion ImageNet 1000 clases | Apache 2.0 | Ampliamente disponible |
| DenseNet121 (base) | 8,0 M | 224x224 RGB | Clasificacion ImageNet 1000 clases | BSD-3 | Ampliamente disponible |

No se dispone de datos de rendimiento comparables con otros modelos especificos de imagen dental OPG en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset muy pequeno: solo 230 radiografias unicas tras deduplicacion, lo que limita severamente la generalizacion.
- Hallazgos raros infrarrepresentados y ausencia de validacion externa; los resultados out-of-fold (macro-AUC 0,636) son notablemente inferiores a los del fold-0 (0,731), lo que sugiere alta varianza.
- Fuente unica de datos (Kaggle) y ausencia de identificadores de paciente, por lo que no se puede garantizar separacion limpia entre entrenamiento y prueba a nivel de paciente.
- No es una herramienta diagnostica: el propio autor indica que las predicciones deben ser revisadas por profesionales dentales cualificados.
- Riesgo de alucinacion en el sentido de falsos positivos y falsos negativos en hallazgos clinicos; no debe usarse en decisiones medicas.
- Licencia Apache 2.0 permite uso comercial del codigo y pesos, pero la naturaleza de prototipo de investigacion y la falta de validacion clinica desaconsejan cualquier despliegue en produccion sanitaria.
- No hay informacion sobre sesgos demograficos, calibracion de probabilidades ni comportamiento fuera de distribucion.
- El repositorio solo contiene los pesos de ConvNeXt-Tiny; el ensemble completo descrito en la model card no se distribuye en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Siya-34/dentalvision-convnext-tiny
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/datasets/imtkaggleteam/dental-opg-xray-dataset
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
