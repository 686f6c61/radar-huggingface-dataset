# AI-MED-AGH/Recruitment-Task-3-Model

## Resumen

El modelo AI-MED-AGH/Recruitment-Task-3-Model es una red neuronal convolucional (CNN) de 23.881 parametros publicada por AI-MED-AGH como linea base debil intencionada para una tarea de reclutamiento opcional basada en el dataset DeepWeeds. No es un modelo de lenguaje: es un clasificador de imagenes en 9 clases, entrenado desde cero con la arquitectura SmallDeepWeedsCNN y distribuido en safetensors bajo licencia Apache 2.0.

Su relevancia es metodologica, no de rendimiento. El repositorio documenta de forma explicita un preprocesado deliberadamente defectuoso (normalizacion sobre valores uint8 en [0,255] sin dividir por 255) y publica las metricas congeladas del fold 0, incluidos los fallos y la clase que nunca predice. Es, por tanto, un artefacto auditable para reproducir, comparar y mejorar un pipeline de clasificacion de imagenes.

El checkpoint se selecciono en la epoca 9 (perdida de validacion 1,254291292089491) y alcanza una exactitud de 0,5421 y un macro-F1 de 0,2066 sobre un split de test congelado de 3.507 imagenes. La propia model card indica que no es apto para produccion ni para decisiones agricolas o de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN SmallDeepWeedsCNN entrenada desde cero: 3 bloques convolucionales (canales 1→16→32→64), activaciones ReLU, dos capas de max-pooling 2x2, average pooling global adaptativo y clasificador lineal 64→9 |
| Parametros totales | 23.881 |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje; entrada fija de imagen de 128x128 px y 1 canal) |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; pesos en safetensors) |
| Idiomas soportados | No aplicable (modelo de vision; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors), libreria pytorch |
| Tarea (pipeline) | image-classification |
| Numero de clases | 9 |
| Canales de entrada | 1 (escala de grises) |
| Resolucion de entrada | 128x128 px |
| Dataset de entrenamiento | AI-MED-AGH/Recruitment-Task-3 (espejo de DeepWeeds, 17.509 imagenes) |
| Configuracion de entrenamiento | Fold 0 publicado, semilla 2026, batch 64, 12 epocas, Adam a 1e-3, entropia cruzada sin ponderar |
| Checkpoint seleccionado | Epoca 9 (perdida de validacion 1,254291292089491) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmallDeepWeedsCNN es una CNN pequena entrenada desde cero, sin pesos preentrenados. Consta de tres bloques convolucionales con progresion de canales 1→16→32→64 y activaciones ReLU, seguidos de dos capas de max-pooling 2x2, un average pooling global adaptativo y un clasificador lineal de 64 a 9 clases. No incorpora Batch Normalization, Dropout, aumento de datos, pesos de clase, muestreo consciente de clase, focal loss ni planificador de tasa de aprendizaje.

El entrenamiento es fijo y reproducible: fold 0 publicado de DeepWeeds, semilla 2026, entradas de 128x128, batch de 64, 12 epocas, optimizador Adam con tasa 1e-3, entropia cruzada ordinaria sin ponderar y seleccion de checkpoint por minima perdida de validacion. El checkpoint publicado corresponde a la epoca 9, con perdida de validacion 1,254291292089491, y se entreno en 159,56 segundos con cero workers de data loader tras un fallo del proceso worker en Windows. El brazo de referencia RGB de la comparacion no se incluye en el repositorio.

La innovacion tecnica del repositorio no esta en la arquitectura, sino en documentar un defecto controlado: el pipeline redimensiona a 128x128, aplica PILToTensor, convierte los valores uint8 a float32 sin dividir por 255 y despues normaliza con media 0,5 y desviacion tipica 0,5 como si la entrada ya estuviera en [0,1]. El resultado es una entrada mapeada de [0,255] a [-1,509], ademas del paso a un solo canal en escala de grises.

## Capacidades

- Clasificacion de imagenes en 9 clases del dataset DeepWeeds. La salida son logits de forma (1, 9) y, tras softmax, probabilidades por clase.
- Inferencia sobre imagenes individuales o lotes en CPU y GPU mediante PyTorch y safetensors.
- Reproduccion completa de la evaluacion del fold 0 mediante el script `evaluate.py`, que escribe `metrics.json` y `predictions.csv`.
- Verificacion de integridad de artefactos: el repositorio incluye `SHA256SUMS` para todos los ficheros publicos salvo el propio manifiesto.
- Generacion de texto: no soportada (no es un modelo de lenguaje).
- Razonamiento, codigo y matematicas: no soportados.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no aplicables (no procesa texto).
- Capacidades especiales (modo thinking, vision multimodal, audio): ninguna. Es una linea base debil intencionada orientada a auditoria, no a despliegue.

## Casos de uso

- Ejercicio de reclutamiento tecnico: el repositorio se entrega como punto de partida debil y auditable para que la persona candidata detecte el fallo de preprocesado, corrija el pipeline y mejore las metricas de forma reproducible.
- Auditoria de pipelines de datos: al estar documentado el defecto exacto (uint8 sin escalar mas normalizacion con media 0,5 y desviacion 0,5), sirve para validar herramientas de deteccion de errores de preprocesado en flujos de vision.
- Docencia sobre metricas en datasets desbalanceados: con una clase mayoritaria que representa el 51,95% del test, el modelo ilustra la diferencia practica entre exactitud (0,5421), exactitud balanceada (0,2074) y macro-F1 (0,2066).
- Estudio de sesgo hacia la clase mayoritaria: el modelo predice la clase 8 en 2.961 de 3.507 imagenes y nunca predice la clase 1, lo que permite analizar colapso de clase en clasificadores sin manejo de desbalanceo.
- Linea base para investigacion sobre desbalanceo: comparar tecnicas como pesos de clase, focal loss o muestreo consciente de clase frente a este checkpoint requiere muy poco computo (23.881 parametros).
- Pruebas de integracion y CI de herramientas de evaluacion: el flujo `evaluate.py` con `--run-kind bad`, `--device cpu` y `--num-workers 0` es barato de ejecutar en cualquier runner, incluidos entornos sin GPU.
- Verificacion de reproducibilidad de artefactos: las salidas congeladas y los hashes del repositorio permiten comprobar que un pipeline reproduce exactamente las mismas predicciones.
- Prototipado en dispositivos muy limitados: con aproximadamente 95,5 KB de pesos en fp32, el modelo cabe en cualquier dispositivo y permite probar el flujo completo de inferencia sin requisitos de hardware.

## Benchmarks y rendimiento

Resultados congelados del split de test de 3.507 imagenes (fold 0 de DeepWeeds). Los valores se muestran redondeados a 4 decimales; los originales tienen mayor precision.

| Metrica | Valor |
|---|---:|
| Accuracy | 0,5421 (0,5420587396635301) |
| Balanced accuracy | 0,2074 (0,2073904927878915) |
| Macro-F1 | 0,2066 (0,20664976855491451) |
| Parametros | 23.881 |
| Tiempo de inferencia de test registrado | 2,7537 s (2,753719700005604 s) |

Referencias internas de la model card:

| Predictor | Accuracy | Macro-F1 |
|---|---:|---:|
| Este checkpoint (brazo defectuoso) | 0,5421 | 0,2066 |
| Predictor trivial de solo clase 8 | 0,5195 | 0,0760 |
| Brazo de referencia RGB | no disponible | 0,2153 (0,21534935157900917) |

Rendimiento por clase en el test congelado:

| Clase | Soporte | Precision | Recall | F1 |
|---:|---:|---:|---:|---:|
| 0 | 226 | 0,3936 | 0,1637 | 0,2313 |
| 1 | 213 | 0,0 | 0,0 | 0,0 |
| 2 | 207 | 0,4559 | 0,1498 | 0,2255 |
| 3 | 205 | 0,2245 | 0,0537 | 0,0866 |
| 4 | 213 | 0,75 | 0,0986 | 0,1743 |
| 5 | 202 | 0,2931 | 0,4208 | 0,3455 |
| 6 | 215 | 0,4 | 0,0186 | 0,0356 |
| 7 | 204 | 0,7143 | 0,0245 | 0,0474 |
| 8 | 1822 | 0,5765 | 0,9369 | 0,7138 |

La diferencia direccional entre el brazo defectuoso y el brazo RGB fue de solo 0,00869958302409466 en macro-F1, por lo que no se alcanzo el umbral de publicacion declarado de 0,10 y la comparacion no demuestra una degradacion causal medida atribuible al defecto de preprocesado. No se dispone de otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion proporcionada, ya que no son aplicables a un clasificador de imagenes de 9 clases.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 95,5 KB solo para los pesos (23.881 parametros en fp32), mas las activaciones de una entrada de 128x128 con 1 canal. Cabe en cualquier dispositivo, incluidos sistemas sin GPU.
- GPU recomendadas: no se requiere GPU. Cualquier GPU de consumo (por ejemplo, una RTX 4090) ejecutaria el modelo sin limitaciones, aunque no hay mediciones publicadas de latencia o throughput en GPU (no disponible).
- Cabe en GPU de consumo: si, en cualquier modelo actual, y tambien en CPU sin aceleracion.
- CPU: es la ruta documentada. El autor registro 2,7537 s para las 3.507 imagenes del test con CPython 3.12.14 sobre Windows 11 y cero workers de data loader, lo que equivale a aproximadamente 0,79 ms por imagen y unas 1.270 imagenes por segundo en ese entorno.
- Opciones de despliegue: PyTorch con carga de safetensors mediante `safetensors.torch.load_file`, segun el ejemplo del repositorio. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de modelo. No se publican exportaciones a ONNX, TorchScript ni formatos GGUF (no disponible).
- Dependencias: las declaradas en `requirements.txt` del repositorio, mas torch, PIL y safetensors.
- Latencia y throughput en hardware distinto al registrado: no disponible.

## Comparativa con modelos similares

La unica comparacion documentada es interna al propio experimento de reclutamiento: el brazo defectuoso de este repositorio frente al brazo de referencia RGB, cuyo checkpoint no se publica. No se han encontrado en la busqueda web modelos comparables con datos publicados; los resultados devueltos (OpenAI, ChatGPT, Google AI, Wikipedia) no son relevantes para esta tarea.

| Modelo | Parametros | Contexto / entrada | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-MED-AGH/Recruitment-Task-3-Model (brazo defectuoso) | 23.881 | Imagen 128x128, 1 canal | 0,2066 | Apache 2.0 | Publicado en HuggingFace |
| Brazo de referencia RGB del mismo experimento | no disponible | Imagen 128x128, RGB | 0,2153 | no disponible | Checkpoint no publicado |
| Predictor trivial de solo clase 8 | 0 | no aplicable | 0,0760 | no aplicable | Referencia calculada en la model card |

Alternativas de la misma categoria (por ejemplo, ResNet, EfficientNet o MobileNet preentrenados y ajustados sobre DeepWeeds): no disponible, no se aportan datos comparativos.

## Limitaciones y advertencias

- Preprocesado deliberadamente incorrecto: no se divide por 255 y despues se normaliza con media 0,5 y desviacion tipica 0,5, lo que transforma el rango original [0,255] en [-1,509].
- Perdida de informacion de color: la entrada es de un solo canal en escala de grises.
- Desbalanceo severo: la clase 8 concentra 1.822 de 3.507 imagenes (51,95%) y el modelo la predice en 2.961 casos.
- La clase 1 nunca se predice en el split de test congelado (precision, recall y F1 iguales a 0).
- Metricas pobres: macro-F1 de 0,2066 y exactitud balanceada de 0,2074. La exactitud de 0,5421 apenas supera al predictor trivial de clase 8 (0,5195), aunque su macro-F1 si es claramente mejor (0,2066 frente a 0,0760).
- Entrenamiento sin aumento de datos, Batch Normalization, Dropout, pesos de clase, muestreo consciente de clase, focal loss ni planificador.
- Evaluacion limitada a una sola semilla y un solo fold (fold 0, semilla 2026) y unicamente sobre el dataset de origen.
- La comparacion con el brazo RGB no alcanzo el umbral de publicacion de 0,10 (diferencia de 0,0087), por lo que no se cuantifica un efecto causal general del defecto de preprocesado.
- No apto para decisiones agricolas, uso critico para la seguridad ni para afirmar rendimiento fuera del fold publicado.
- Riesgo de alucinacion: no aplicable en el sentido generativo; el modelo es un clasificador y no produce texto. El riesgo equivalente es la asignacion erronea y confiada de probabilidad a clases con muy bajo recall.
- Licencia Apache 2.0, que permite uso comercial, aunque el proposito declarado del artefacto es un ejercicio de reclutamiento y auditoria. La licencia del dataset original DeepWeeds no se detalla en la informacion proporcionada (no disponible).
- Modelo practicamente sin adopcion: 0 descargas y 0 likes en el momento de la consulta.
- No se publican versiones cuantizadas ni exportaciones a otros formatos, lo que limita su integracion directa fuera de PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI-MED-AGH/Recruitment-Task-3-Model
- Dataset asociado: https://huggingface.co/datasets/AI-MED-AGH/Recruitment-Task-3
- Repositorio original de DeepWeeds: https://github.com/AlexOlsen/DeepWeeds
- Paper: Olsen et al., DeepWeeds. El identificador DOI aparece truncado en la informacion disponible (https://doi.), por lo que no se puede citar completo.
- Resultados de busqueda web: no relevantes para este modelo (OpenAI, ChatGPT, Google AI, Wikipedia).
