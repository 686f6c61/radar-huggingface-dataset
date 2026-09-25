# senanurcetin/aptos-retinopathy-grader

## Resumen

APTOS retinopathy grader es un modelo de clasificación de imágenes médicas desarrollado por el usuario senanurcetin. Se trata de un ensemble de cinco pliegues (five-fold) de EfficientNet-B0 que asigna un grado de retinopatía diabética según la escala ICDRSS (0 a 4) a partir de fotografías de fondo de ojo en color, y emite además una decisión binaria de derivación (referable / no referable). El modelo se entrenó sobre el conjunto público APTOS-2019 y se exportó a formato ONNX para su servicio en CPU.

Su relevancia es doble. Por un lado, ofrece una validación externa poco habitual en modelos de este tipo: sin reentrenamiento ni reajuste de umbrales, mantiene un ROC AUC de derivación de 0,984 sobre IDRiD, un conjunto con cámara, país y equipo de gradación distintos. Por otro, la propia model card documenta con detalle los fallos del modelo (atajos en los datos, ruido de etiquetas, deriva del grado en poblaciones nuevas), lo que lo convierte en un caso útil para estudiar evaluación honesta en imagen médica.

No es un dispositivo médico: no tiene validación clínica ni autorización regulatoria, y el autor prohíbe explícitamente su uso en la atención de pacientes. Debe entenderse como modelo de referencia para investigación y análisis metodológico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 5 modelos EfficientNet-B0 (clasificacion de imagenes) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (clasificacion de imagen; la model card no especifica resolucion de entrada) |
| Tipos de cuantizacion | no disponible (exportacion a ONNX para servicio en CPU) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Modalidad | Imagen (fotografia de fondo de ojo en color) |
| Tarea | Clasificacion multietiqueta (grados 0-4 ICDRSS) mas decision de derivacion |
| Dataset de entrenamiento | APTOS-2019 |
| Pipeline declarado | image-classification |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un ensemble de cinco clasificadores EfficientNet-B0 entrenados de forma independiente mediante validacion cruzada de cinco pliegues sobre APTOS-2019. La prediccion final agrega las puntuaciones de los cinco modelos; el sistema expone ademas el parametro `fold_spread`, la desviacion estandar de las puntuaciones de los cinco pliegues para una imagen dada, de modo que un valor alto indica desacuerdo entre pliegues y una prediccion menos fiable. Los pesos se exportaron a ONNX y la exportacion se verifico contra los modelos originales de PyTorch: diferencia maxima de puntuacion bruta de 3,1e-05 sobre 40 imagenes reservadas y cero discrepancias de grado. El archivo `export.json` registra esa comprobacion junto con los umbrales y la configuracion de preprocesado esperada.

La model card no documenta el numero de tokens ni un proceso de RLHF o DPO, propios de modelos de lenguaje. Si detalla caracteristicas relevantes del entrenamiento y sus datos: existe un atajo en el conjunto de entrenamiento (un clasificador que solo usa metadatos de archivo, como resolucion, relacion de aspecto, brillo y tamano de archivo, alcanza un QWK de 0,652 en APTOS sin mirar la retina, porque la camara correlaciona con la prevalencia de la enfermedad), y las etiquetas son ruidosas (las imagenes duplicadas presentan grados contradictorios en el 29 por ciento de los casos, lo que situa la precision de una etiqueta individual en torno al 84 por ciento).

## Capacidades

- Clasificacion de retinopatia diabetica en cinco grados (ICDRSS 0-4) a partir de fotografias de fondo de ojo en color.
- Decision binaria de derivacion (referable / no referable) con umbrales registrados en `export.json`.
- Salida de puntuacion bruta y de `fold_spread` (desviacion estandar entre los cinco pliegues) como medida de acuerdo interno.
- Servicio mediante API HTTP con los endpoints `POST /predict` (multipart de archivo a grado, referable, puntuacion bruta y dispersion entre pliegues), `GET /model-card` (limitaciones en JSON) y `GET /health`.
- Inferencia en CPU gracias a la exportacion ONNX.
- No dispone de generacion de texto, tool calling, soporte de agentes ni razonamiento multi-paso.
- No ofrece mapas de atencion: se implemento y midio Grad-CAM, y cinco pliegues entrenados de forma identica discrepan sobre donde mira el modelo tanto como pesos entrenados y no entrenados, por lo que no se proporciona heatmap.

## Casos de uso

- Investigacion en cribado de retinopatia diabetica: usar la salida de derivacion y el `fold_spread` como linea base reproducible para comparar tecnicas de clasificacion sobre fondos de ojo, dado que la model card publica QWK, AUC, sensibilidad y especificidad tanto en APTOS como en el conjunto externo IDRiD.
- Estudio de atajos y sesgos en datasets medicos: el modelo documenta un atajo por metadatos de archivo (QWK 0,652 solo con resolucion, aspecto, brillo y tamano), lo que lo convierte en material didactico para analizar fuga de informacion en conjuntos publicos.
- Analisis de calibracion y transporte de umbrales: permite reproducir el hallazgo de que el error de calibracion pasa de 0,03 en APTOS a 0,12 en IDRiD, y que un umbral ajustado para sensibilidad 0,90 en APTOS rinde 0,82 en IDRiD.
- Auditoria de ruido de etiquetas: el dato de que los duplicados presentan grados contradictorios en el 29 por ciento de los casos sirve para cuantificar el techo de precision de un etiquetado imperfecto en un problema de clasificacion medica.
- Prototipado de servicios de inferencia en CPU: el artefacto ONNX y la API HTTP incluida permiten montar un servicio de demostracion sin GPU, util para validar arquitecturas de despliegue en entornos con recursos limitados.
- Docencia y formacion en IA medica: la model card integra las limitaciones como JSON consultable (`GET /model-card`), lo que facilita usarlo como ejemplo de documentacion responsable y de comunicacion de caveats en modelos de salud.

## Benchmarks y rendimiento

| Metrica | APTOS test | IDRiD (externo) |
|---|---|---|
| QWK | 0,9091 | 0,8045 |
| ROC AUC de derivacion | 0,983 | 0,984 |
| Sensibilidad de derivacion | 0,956 | 0,885 |
| Especificidad de derivacion | 0,917 | 0,987 |

Notas de la model card sobre estos resultados: IDRiD procede de otra camara, otro pais y otro equipo de gradacion, y todas sus imagenes comparten una unica resolucion, de modo que el atajo de adquisicion descrito no esta disponible alli. No hubo fine-tuning y los umbrales de APTOS no se reajustaron; la discriminacion se transfirio esencialmente intacta. En IDRiD el modelo emitio 8 predicciones de grado 4 donde habia 64, es decir, comprime la parte alta de la escala, aunque solo 2 de 148 casos graves se clasificaron como no derivables. La calibracion empeoro (error de 0,03 a 0,12) y un umbral fijado para sensibilidad 0,90 en APTOS entrego 0,82 en IDRiD.

## Requisitos de hardware

- El autor exporto el modelo a ONNX para servicio en CPU, de modo que la inferencia no depende de GPU.
- El repositorio ocupa 0,1 GB, lo que corresponde a los pesos ONNX de los cinco pliegues de EfficientNet-B0.
- VRAM estimada para inferencia: no disponible de forma numerica en la informacion proporcionada; por diseno, el modelo esta pensado para ejecutarse sin GPU.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU de consumo actual puede alojar un ensemble de EfficientNet-B0, pero no hay cifras publicadas que lo confirmen.
- Cabe en GPU de consumo: previsiblemente si, al tratarse de una arquitectura compacta exportada a ONNX, aunque la model card no lo declara.
- Opciones de despliegue: ONNX Runtime sobre el endpoint HTTP incluido (`POST /predict`, `GET /model-card`, `GET /health`). vLLM, llama.cpp, Ollama o TGI no son aplicables, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks de modelos comparables en la informacion disponible, por lo que no es posible establecer una comparativa numerica fiable. Como referencia de categoria, este modelo se situa en el grupo de clasificadores de retinopatia diabetica entrenados sobre APTOS-2019 y evaluados con QWK y ROC AUC de derivacion, y su rasgo diferencial documentado es la validacion externa sobre IDRiD sin reajuste de umbrales y la publicacion explicita de sus modos de fallo.

| Modelo | Parametros | Contexto / entrada | QWK (APTOS) | AUC derivacion (IDRiD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| APTOS retinopathy grader (senanurcetin) | no disponible | imagen de fondo de ojo; ensemble de 5 pliegues | 0,9091 | 0,984 | MIT | HuggingFace, ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un dispositivo medico: modelo de referencia entrenado con un unico conjunto publico, sin validacion clinica ni autorizacion regulatoria. El autor indica expresamente que no debe usarse para la atencion de ninguna persona.
- Existe un atajo en los datos de entrenamiento: un clasificador que solo ve metadatos de archivo (resolucion, relacion de aspecto, brillo, tamano) alcanza QWK 0,652 en APTOS sin observar la retina, porque la camara correlaciona con la prevalencia de la enfermedad.
- Las etiquetas son ruidosas: las imagenes duplicadas presentan grados contradictorios en el 29 por ciento de los casos, lo que situa la precision de una etiqueta individual cerca del 84 por ciento; el modelo no puede ser mas correcto que sus etiquetas.
- El grado se degrada en poblaciones nuevas: en IDRiD se emitieron 8 predicciones de grado 4 frente a 64 reales, comprimiendo el tramo alto de la escala. La salida de cinco grados no deberia confiarse fuera de la distribucion de entrenamiento; la bandera de derivacion es la salida que se mantuvo robusta.
- Las probabilidades estan subconfiadas fuera de APTOS: el error de calibracion sube de 0,03 a 0,12 y un umbral ajustado para sensibilidad 0,90 en APTOS rinde 0,82 en IDRiD.
- No hay mapas de atencion: se implemento y midio Grad-CAM, y los pliegues discrepan sobre las regiones atendidas tanto como pesos entrenados frente a no entrenados, por lo que no se ofrece heatmap para evitar una interpretabilidad aparente pero no valida.
- Diferencia de preprocesado: las cargas se preprocesan desde el origen, mientras que el entrenamiento leyo imagenes cacheadas en JPEG; las puntuaciones brutas pueden diferir ligeramente de la evaluacion offline, si bien en seis imagenes reservadas coincidio el grado predicho.
- La licencia MIT permite uso comercial del artefacto, pero no cubre ni sustituye las autorizaciones regulatorias necesarias para cualquier aplicacion clinica.
- Con 0 descargas y 0 likes en el momento de la consulta, el modelo carece de validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/senanurcetin/aptos-retinopathy-grader
- Codigo fuente, analisis y resultados del autor: https://github.com/senanurcetin/APTOS-2019-diabetic-retinopathy
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; todos los enlaces obtenidos eran contenido no relacionado y se han descartado.
