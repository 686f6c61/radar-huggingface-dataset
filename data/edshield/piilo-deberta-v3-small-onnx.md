# edshield/piilo-deberta-v3-small-onnx

## Resumen

piilo-deberta-v3-small-onnx es la exportación a ONNX del modelo edshield/piilo-deberta-v3-small, un clasificador de tokens (token classification) especializado en detectar identificadores personales en textos escritos por estudiantes. El modelo original parte de microsoft/deberta-v3-small, un transformer encoder de la familia DeBERTa-v3, y se ha afinado sobre el corpus PIILO (el conjunto de datos de la competición de Kaggle "The Learning Agency Lab - PII Data Detection"). Esta versión ONNX la publica el autor edshield y está pensada para ejecutarse con ONNX Runtime, incluyendo navegador mediante Transformers.js.

El modelo resuelve un problema concreto: localizar y etiquetar datos personales (nombres de estudiantes, correos, nombres de usuario, números de identificación, teléfonos, URLs personales y direcciones) en redacciones escolares, como salvaguarda técnica previa a compartir o procesar esos textos. Detecta siete tipos de entidad en formato BIO y devuelve una etiqueta por token; la conversión a spans, las reglas adicionales y la política de decisión quedan en manos del código que lo consume (la librería Python de edshield y su demo web).

Su relevancia actual reside en que permite privacidad en el dispositivo: el archivo se descarga una vez y se cachea en el navegador, de modo que el texto analizado no sale del equipo. El repositorio ocupa 0,8 GB e incluye dos ficheros de pesos: uno en fp32 de 566 MB y otro cuantizado a INT8 de 205 MB. La licencia es CC BY 4.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-small) con cabecera de clasificacion de tokens |
| Parametros totales | Aprox. 142M (44M de backbone + 98M de embeddings, segun la ficha de microsoft/deberta-v3-small); no confirmado en la ficha de este modelo |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha (arquitectura base DeBERTa-v3-small, tipicamente 512 tokens) |
| Tipos de cuantizacion | fp32 (566 MB) e INT8 dinamica (205 MB, primeras dos capas del encoder en precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (onnx/model.onnx y onnx/model_quantized.onnx) |

## Arquitectura y entrenamiento

La arquitectura es la de DeBERTa-v3-small: un transformer encoder de 6 capas, tamano oculto 768 y un vocabulario de 128K tokens que aporta unos 98M parametros solo en la capa de embeddings, sobre un backbone de unos 44M. Sobre esa base se anade una cabecera de clasificacion de tokens con siete etiquetas en formato BIO: NAME_STUDENT, EMAIL, USERNAME, ID_NUM, PHONE_NUM, URL_PERSONAL y STREET_ADDRESS. No es un modelo generativo ni MoE; su salida es una etiqueta por token de entrada.

El afinamiento se realizo sobre el corpus PIILO, creado por The Learning Agency Lab junto con la Universidad de Vanderbilt y publicado bajo CC BY 4.0 (el mismo origen que la competicion de Kaggle de deteccion de datos PII). La ficha no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de una tarea de etiquetado de secuencias, no procede RLHF en el sentido habitual. La exportacion a ONNX se hizo con torch.onnx.export en opset 17 y posterior cuantizacion dinamica con ONNX Runtime usando la opcion --keep-layers 2, que mantiene las dos primeras capas del encoder en precision completa. No se emplean instrucciones especificas de CPU, de modo que el mismo archivo funciona en Chromebooks, portatiles ARM y equipos de escritorio.

## Capacidades

- Clasificacion de tokens para deteccion de PII en ingles: etiqueta cada token de un texto de entrada con una de las siete categorias o con la etiqueta exterior (O).
- Deteccion especifica de siete tipos de identificador: nombres de estudiante, correos electronicos, nombres de usuario, numeros de identificacion, numeros de telefono, URLs personales y direcciones postales.
- Ejecucion en el dispositivo mediante ONNX Runtime, incluida la build de WebAssembly que usa Transformers.js en el navegador.
- Integracion en el navegador a traves de la API `pipeline("token-classification", ...)` de Transformers.js, con seleccion de precision por `dtype` (por ejemplo `q8`).
- Salida a nivel de token; el agrupamiento en spans y la aplicacion de reglas y politicas se delegan al codigo consumidor.
- No soporta generacion de texto, razonamiento multi-paso, tool calling, function calling ni agentes: es un modelo discriminativo de etiquetado.
- No tiene capacidades de vision ni de audio.
- Multilingue: no; unicamente ingles.

## Casos de uso

- Saneamiento de redacciones escolares antes de compartirlas: el modelo marca nombres, correos y direcciones en el texto de un estudiante para que un docente o un sistema los anonimice antes de usar la redaccion como material o enviarla a terceros.
- Filtrado previo en plataformas educativas: integrado en el backend, analiza los textos enviados por alumnos y genera una lista de spans PII que otra capa puede redactar o enmascarar antes del almacenamiento.
- Procesamiento en el navegador sin fuga de datos: gracias a la exportacion ONNX y a Transformers.js, la demo de edshield ejecuta el modelo localmente; el texto del alumno no abandona el dispositivo, lo que encaja en escenarios con requisitos estrictos de privacidad.
- Anonimizacion de corpus para investigacion educativa: al etiquetar identificadores en lotes de redacciones, se puede construir un dataset de trabajo con los datos personales sustituidos por marcadores.
- Revisión de contenido generado por estudiantes en plataformas de aprendizaje en linea: deteccion de correos, telefonos y nombres de usuario que aparezcan en foros o entregas para aplicar politicas de moderacion o de proteccion de menores.
- Preprocesado dentro de un pipeline de NLP educativo: la salida BIO por token puede alimentar tareas posteriores (normalizacion, pseudonimizacion, auditoria) mediante la libreria Python de edshield o su equivalente JavaScript.
- Auditoria de cumplimiento interna: uso como una de las salvaguardas tecnicas para reducir la presencia de PII en flujos de datos, complementando (no sustituyendo) las obligaciones legales de la institucion.
- Ejecucion en hardware modesto: al pesar 205 MB en INT8 y no usar instrucciones especificas de CPU, puede desplegarse en portatiles, Chromebooks y equipos ARM para tareas de etiquetado local.

## Benchmarks y rendimiento

Los resultados publicados en la ficha son a nivel de span, sobre 680 redacciones PIILO reservadas para prueba, medidos con la herramienta edshield/eval/evaluate_onnx.py bajo ONNX Runtime con las mismas reglas, ventanas y decodificacion que la libreria Python. La columna "Got through" cuenta identificadores que ninguna etiqueta logro marcar.

| Test set | Detector | Precision | Recall | F5 | Got through |
|---|---|---|---|---|---|
| PIILO held-out, 680 ensayos | Reglas + model_quantized.onnx | 0,639 | 1,000 | 0,979 | 0 de 165 |
| PIILO held-out, 680 ensayos | Reglas + modelo PyTorch completo | 0,642 | 1,000 | 0,979 | 0 de 165 |
| K-12 sintetico, dificil | Reglas + model_quantized.onnx | no disponible | no disponible | no disponible | 324 de 1.433 (23%) |
| K-12 sintetico, dificil | Reglas + modelo PyTorch completo | no disponible | no disponible | no disponible | 319 de 1.433 (22%) |

Advertencias que el propio autor incluye sobre estas cifras: la cuantizacion es una aproximacion (cuantizar todas las capas daba un archivo de 172 MB que dejaba pasar 7 de los 165 identificadores, y mantener dos capas en fp32 elimino esos fallos a cambio de 33 MB); el ajuste de la cuantizacion se eligio segun su resultado en los ensayos PIILO, por lo que esa fila es algo optimista; no hay medicion sobre escritura real de menores (PIILO es escritura de adultos en aprendizaje en linea y los conjuntos K-12 son sinteticos, donde se cuela aproximadamente uno de cada cinco identificadores); el conjunto PIILO es pequeno (143 de sus 165 identificadores son nombres); y las cifras proceden de ONNX Runtime en CPU de escritorio, mientras que el navegador usa la build WebAssembly y la demo solo se ha verificado contra la libreria Python en tres muestras sinteticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB para el archivo fp32 y aproximadamente 0,25 GB para el INT8, sin contar el overhead del runtime.
- GPU recomendadas: al ser un modelo de unos 142M de parametros, cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada reciente son mas que suficientes. La orientacion principal del modelo es CPU y navegador.
- Consumer GPU: si, cabe ampliamente en cualquier GPU de consumo actual e incluso en iGPU, dada la huella inferior a 1 GB.
- CPU y navegador: es el escenario principal. Funciona en CPU de escritorio, portatiles ARM y Chromebooks, y en el navegador mediante ONNX Runtime WebAssembly y Transformers.js. No se usan instrucciones especificas de CPU.
- Opciones de despliegue: ONNX Runtime (Python), ONNX Runtime Web / WebAssembly mediante Transformers.js, y la libreria edshield que envuelve el modelo con sus reglas y decodificacion. No hay publicacion de pesos en formato GGUF ni instrucciones para vLLM, Ollama o TGI (estos frameworks estan orientados a modelos generativos y no aplican a este clasificador).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura / parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| piilo-deberta-v3-small-onnx | DeBERTa-v3-small, aprox. 142M | no disponible (base tipicamente 512) | Token classification (7 etiquetas PII) | CC BY 4.0 | ONNX en HuggingFace |
| microsoft/deberta-v3-small | DeBERTa-v3-small, aprox. 142M | 512 tokens | Modelo base sin cabecera de tarea | MIT | HuggingFace |
| onnx-community/deberta-v3-small | DeBERTa-v3-small, aprox. 142M | 512 tokens | Exportacion ONNX del modelo base | MIT | HuggingFace |
| edshield/piilo-deberta-v3-small | DeBERTa-v3-small, aprox. 142M | no disponible | Token classification (7 etiquetas PII) | CC BY 4.0 | pesos PyTorch en HuggingFace |

Comparado con los anteriores, la diferencia clave es la especializacion: tanto microsoft/deberta-v3-small como su version ONNX de onnx-community son modelos base sin cabecera especifica de tarea, mientras que este modelo incorpora el afinamiento sobre PIILO para las siete etiquetas PII. Frente a su modelo base en PyTorch (edshield/piilo-deberta-v3-small), la version ONNX cambia el formato de pesos (ONNX en lugar de PyTorch) y anade la variante cuantizada a INT8. No se dispone de datos de benchmarks comparativos con otras soluciones de deteccion de PII en la informacion proporcionada.

## Limitaciones y advertencias

- No es un certificado de cumplimiento: usarlo no hace que un producto cumpla FERPA, COPPA ni ninguna otra normativa. Estas leyes imponen obligaciones a la escuela o al operador, y el modelo es solo una salvaguarda tecnica que no elimina toda la informacion personal.
- Rendimiento sobre escritura infantil real sin medir: PIILO contiene escritura de adultos en aprendizaje en linea y los conjuntos K-12 son sinteticos. En texto de estilo infantil, aproximadamente uno de cada cinco identificadores no se detecta.
- Muestras de evaluacion limitadas: el conjunto PIILO de prueba tiene 165 identificadores, de los cuales 143 son nombres, por lo que la cobertura de otras categorias (telefonos, direcciones, IDs) esta poco representada.
- Precision moderada: el 0,639 de precision indica una tasa notable de falsos positivos a nivel de span; el recall de 1,000 se obtuvo con reglas y decodificacion adicionales, no solo con el modelo.
- Sesgo de optimismo en la cuantizacion: el ajuste de la configuracion INT8 se eligio segun su resultado en PIILO, por lo que las cifras de esa fila son algo optimistas.
- Diferencia entre ONNX Runtime de escritorio y navegador: las cifras provienen de ONNX Runtime en CPU de escritorio; la demo web usa la build WebAssembly y solo se ha verificado contra la libreria Python en tres muestras sinteticas, no sobre el conjunto completo de prueba.
- Idioma unico: solo ingles. No se ha declarado soporte para otros idiomas.
- Salida a nivel de token: el modelo por si solo no produce spans ni aplica politica; requiere codigo adicional (reglas, ventanas, decodificacion) para un uso practico.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir etiquetas incorrectas (falsos positivos y falsos negativos) que deben tratarse como tales.
- Licencia: los pesos se publican bajo CC BY 4.0, la misma licencia de los datos de entrenamiento (PIILO). La atribucion a The Learning Agency Lab y la indicacion de cambios son obligatorias. El modelo base DeBERTa-v3-small es de Microsoft bajo licencia MIT, y el codigo de edshield es Apache-2.0.
- Contexto limitado por la arquitectura base: no se documenta una ventana de contexto especifica en la ficha; DeBERTa-v3-small trabaja tipicamente con 512 tokens, lo que obliga a trocear textos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edshield/piilo-deberta-v3-small-onnx
- Modelo base afinado (PyTorch): https://huggingface.co/edshield/piilo-deberta-v3-small
- Repositorio de edshield: https://github.com/hemangnagar/edshield
- Documentacion de cobertura por tipo de identificador: https://github.com/hemangnagar/edshield/blob/main/docs/COVERAGE.md
- Demo en navegador (dentro del repositorio de edshield): https://github.com/hemangnagar/edshield
- Modelo base original de Microsoft: https://huggingface.co/microsoft/deberta-v3-small
- Exportacion ONNX del modelo base por onnx-community: https://huggingface.co/onnx-community/deberta-v3-small
- Modelo en Microsoft Foundry (DeBERTa-v3-small): https://ai.azure.com/catalog/models/microsoft-deberta-v3-small
- The Learning Agency Lab (origen del corpus PIILO): https://the-learning-agency-lab.com/
- ONNX Runtime (modelos y runtime): https://onnxruntime.ai/models
- ONNX Model Zoo: https://github.com/onnx/models
