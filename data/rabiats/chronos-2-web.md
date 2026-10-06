# RabiatS/chronos-2-web

## Resumen

RabiatS/chronos-2-web es una redistribucion de los pesos de Chronos-2 (Amazon) en formato ONNX, preparada especificamente para su ejecucion en el navegador mediante transformers.js. No se trata de un modelo nuevo ni de un reentrenamiento: el autor copia los archivos de TSFM-ai/chronos-2-onnx en el commit `d999122ad90648a4f057aba78ac9e04f6c5dbb06` y recorta el conjunto a los ficheros que carga la demo de su web (rabiatsadiq.com/lab/chronos-2). El objetivo declarado es tener una copia congelada y estable de los pesos, de modo que la pagina no dependa de que un tercero mantenga o modifique el repositorio original.

El modelo subyacente, amazon/chronos-2, pertenece a la familia Chronos de Amazon Science, orientada a forecasting (prediccion de series temporales) como modelo fundacional, segun indican el pipeline declarado (`Forecasting`), la etiqueta `base_model:amazon/chronos-2` y el repositorio de referencia `amazon-science/chronos-forecasting`. El repositorio ocupa 0,5 GB y esta etiquetado como cuantizado respecto al modelo base.

Su relevancia practica es acotada pero clara: permite desplegar prediccion de series temporales sin backend, con inferencia en el propio dispositivo del usuario. La ficha publica no aporta informacion sobre arquitectura interna, numero de parametros, ventana de contexto ni resultados de evaluacion, por lo que la mayor parte de las especificaciones tecnicas quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional de series temporales, familia Chronos de Amazon Science) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (etiqueta `base_model:quantized:amazon/chronos-2`); no se detalla el esquema de cuantizacion |
| Idiomas soportados | no aplica / no disponible (modelo de forecasting, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, consumido a traves de transformers.js |
| Tamano del repositorio | 0,5 GB |
| Pipeline declarado | Forecasting |
| Modelo base | amazon/chronos-2 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (registro) | 2026-10-05 |

## Arquitectura y entrenamiento

No hay informacion disponible en los materiales proporcionados sobre la arquitectura interna de Chronos-2 (tipo de red, mecanismo de atencion, esquema de parcheado de la serie, estrategia de tokenizacion de valores continuos) ni sobre su entrenamiento (numero de tokens o de series vistas, composicion del corpus, uso de RLHF/DPO u otras tecnicas de ajuste). La model card de este repositorio es una nota de redistribucion: no describe el diseno del modelo ni su procedencia de datos.

Lo unico verificable es que este repositorio no introduce cambios en los pesos ("The weights are unchanged", segun la propia model card), que los ficheros provienen de TSFM-ai/chronos-2-onnx y que se ha recortado el conjunto a los necesarios para la demo web. La unica transformacion documentada es, por tanto, de empaquetado y conversion a ONNX, no de entrenamiento.

## Capacidades

- Prediccion de series temporales (forecasting) como tarea declarada del pipeline; el alcance exacto (univariante, multivariante, covariables, horizonte maximo) no esta documentado en la informacion disponible.
- Inferencia en el navegador del cliente mediante transformers.js sobre pesos ONNX, sin necesidad de servidor de inferencia.
- Distribucion autocontenida y congelada de los pesos, pensada para que una demo web no se rompa si cambia el repositorio de origen.
- Generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling y uso agentico: no aplica, es un modelo de forecasting.
- Capacidades multilingues: no aplica.
- Modo "thinking" u otras capacidades especiales: no disponibles.

## Casos de uso

- Demo interactiva de forecasting en una pagina web: cargar el modelo con transformers.js y predecir en el navegador a partir de una serie introducida por el usuario, sin coste de servidor ni latencia de red mas alla de la descarga inicial de los pesos.
- Prototipado rapido de productos de prediccion: validar si un enfoque de modelo fundacional encaja en el caso de uso antes de invertir en infraestructura de inferencia dedicada.
- Escenarios con requisitos estrictos de privacidad: al ejecutarse en el cliente, los datos de la serie temporal no salen del dispositivo, lo que resulta adecuado para datos financieros, energeticos o de salud en fases de exploracion.
- Aplicaciones web de analitica para usuarios no tecnicos: integracion dentro de un panel que ofrezca previsiones de demanda, trafico o metricas operativas a partir de datos pegados o subidos por el usuario.
- Educacion y divulgacion: notebook o pagina que ilustre que es un modelo fundacional de series temporales y permita experimentar sin instalar Python ni dependencias.
- Despliegue en entornos con conectividad limitada o sin backend disponible: al ser una copia autocontenida de 0,5 GB, puede servirse desde un CDN propio o incluso empaquetarse en una aplicacion de escritorio (Electron, Tauri) con runtime ONNX.
- Pruebas de regresion de una integracion web: mantener estos pesos fijos permite comparar resultados de la interfaz a lo largo del tiempo sin que cambie la version del modelo subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye metricas de error de prediccion (MASE, sMAPE, WQL, CRPS u otras), ni comparaciones con modelos de la misma categoria, ni datos de latencia o throughput medidos.

## Requisitos de hardware

- Huella de pesos: el repositorio completo ocupa 0,5 GB y esta recortado a los ficheros que carga la demo, por lo que el peso descargado en el navegador es inferior a esa cifra; no se especifica el desglose por fichero.
- Inferencia en cliente: el modelo esta pensado para ejecutarse en el navegador, por lo que no requiere GPU de servidor ni VRAM dedicada en el caso de uso previsto.
- Ejecucion en CPU mediante WebAssembly: viable en equipos de consumo y portatiles convencionales, con la latencia dependiente del tamano de serie y del horizonte solicitado (no cuantificada en la informacion disponible).
- Aceleracion por GPU en navegador: transformers.js puede aprovechar WebGPU cuando el navegador y el equipo lo soportan; no hay cifras publicadas de mejora para este modelo concreto.
- Memoria en el dispositivo: no disponible. Al no conocerse el numero de parametros ni la precision efectiva de la cuantizacion, no es posible estimar el pico de memoria en tiempo de ejecucion mas alla de la cota superior que supone el tamano del repositorio.
- Despliegue en servidor: no documentado para esta copia. Opciones genericas serian ONNX Runtime (CPU o CUDA) o un servidor compatible con el formato ONNX; no hay soporte declarado de vLLM, TGI, llama.cpp, Ollama ni de runtimes especificos para texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Tamano de repo | Cuantizacion | Licencia | Descargas | Notas |
|---|---|---|---|---|---|---|
| RabiatS/chronos-2-web (este) | ONNX (transformers.js) | 0,5 GB | si (etiquetado como cuantizado) | Apache 2.0 | 0 | Subconjunto recortado de TSFM-ai/chronos-2-onnx, congelado para una demo web |
| amazon/chronos-2 | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo base original de Amazon Science |
| TSFM-ai/chronos-2-onnx | ONNX | no disponible | no disponible | no disponible | no disponible | Origen de los ficheros; commit de referencia `d999122ad90648a4f057aba78ac9e04f6c5dbb06` |
| Otros modelos fundacionales de series temporales | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

Detalle relevante: la unica diferencia entre este repositorio y su origen es el recorte de ficheros, no el contenido de los pesos. Cualquier diferencia de comportamiento frente a amazon/chronos-2 o a TSFM-ai/chronos-2-onnx deberia atribuirse al pipeline de conversion a ONNX o a la precision de la cuantizacion, no a un ajuste del modelo.

## Limitaciones y advertencias

- Es una copia de terceros, no oficial: el autor figura como RabiatS y no hay indicacion de vinculo con Amazon Science mas alla de la licencia y la atribucion del modelo base.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Documentacion practicamente inexistente: no hay arquitectura, parametros, contexto, idiomas, ni guia de uso en la ficha publica.
- Sin resultados de evaluacion: no se puede contrastar la fidelidad del modelo cuantizado frente al modelo base, ni su calidad predictiva.
- Recorte de ficheros no detallado: aunque se indica que solo se conservan los ficheros que carga la demo, no se enumeran, lo que dificulta reutilizarlo fuera de ese contexto (por ejemplo, para entrada/salida o configuraciones adicionales).
- Riesgo de alucinacion en sentido estricto: no aplica a la generacion de lenguaje, pero si es relevante la extrapolacion de patrones en horizontes largos, un comportamiento intrinseco de los modelos de forecasting que no se documenta aqui.
- Sesgos: no evaluados. Los modelos de series temporales heredan los sesgos de su corpus de entrenamiento, que no se describe.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar avisos de copyright y el fichero de licencia, y declarar los cambios realizados. En este caso, el cambio declarado es la seleccion de ficheros respecto al repositorio de origen.
- Ausencia de garantias: el propio autor describe el repositorio como un alojamiento para que su pagina no cambie; no hay compromiso de mantenimiento, actualizacion ni soporte.
- Antes de usarlo en produccion conviene verificar el repositorio de origen y el modelo base amazon/chronos-2 para confirmar precisiones, requisitos y condiciones vigentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RabiatS/chronos-2-web
- Modelo base: https://huggingface.co/amazon/chronos-2
- Origen de los ficheros ONNX: https://huggingface.co/TSFM-ai/chronos-2-onnx (commit `d999122ad90648a4f057aba78ac9e04f6c5dbb06`)
- Repositorio de codigo de la familia Chronos (Amazon Science): https://github.com/amazon-science/chronos-forecasting
- Demo web que carga estos pesos: https://www.rabiatsadiq.com/lab/chronos-2/
- Paper, blog o documentacion tecnica de Chronos-2: no disponible en la informacion proporcionada.
