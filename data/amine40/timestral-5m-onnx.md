# amine40/Timestral-5M-ONNX

## Resumen

Timestral-5M-ONNX es una exportacion al formato ONNX del modelo de prediccion de series temporales Timestral-5M, desarrollado originalmente por Mistral AI, y publicada por el usuario amine40. El repositorio tambien declara como modelos base tanto mistralai/Timestral-5M como mistralai/Timestral-28M, de modo que la exportacion cubre las dos variantes de la familia. El objetivo de esta version es permitir la inferencia directamente en el navegador mediante onnxruntime-web, sin necesidad de servidor ni de Python en tiempo de ejecucion.

A diferencia de un modelo de lenguaje, Timestral no procesa texto: recibe series numericas y covariables, y devuelve una distribucion predictiva futura en forma de cuantiles. Concretamente, cada pasada de decodificacion exportada genera 21 niveles de cuantil (de 0,01 a 0,99) para un horizonte configurable. Esto lo situa en la categoria de modelos de forecasting probabilistico, no de generacion de lenguaje.

La relevancia de esta exportacion radica en su tamano reducido (5M y 28M de parametros) y en su empaquetado para ejecucion local en el navegador, lo que habilita casos de uso con requisitos estrictos de privacidad y baja latencia, ademas de facilitar demos y prototipos sin infraestructura de servidor. Los pesos se almacenan en float16 y se convierten a float32 al cargar la sesion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (exportacion ONNX de un decodificador de series temporales de Mistral AI) |
| Parametros totales | 5M (variante Timestral-5M); 28M (variante Timestral-28M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | historia de entrada T en multiplos de 32 pasos; horizonte futuro H en multiplos de 32 hasta 1024 pasos |
| Tipos de cuantizacion | pesos almacenados en float16, convertidos a float32 al cargar la sesion; exportacion ONNX |
| Idiomas soportados | no disponible (modelo numerico de series temporales, no procesa lenguaje natural) |
| Licencia | mistral-modified-mit (Modified MIT, con aviso de atribucion a Mistral AI) |
| Formato de pesos | ONNX (almacenados en float16) |

## Arquitectura y entrenamiento

La informacion disponible no describe en detalle la arquitectura interna del modelo original. El repositorio indica que el archivo ONNX contiene "una pasada de decodificacion del modelo oficial, incluido el reescalado de su salida", lo que sugiere un diseno de decodificador con reescalado explicito de la prediccion. El resto del proceso de forecasting (preparacion de filas, decodificacion mas alla de 1024 pasos, promediado con la serie espejada y recorte de valores) no reside en el grafo ONNX, sino en el archivo auxiliar `timestral.js` del repositorio de la demo.

No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO, ya que no se trata de un modelo de lenguaje. La unica innovacion tecnica documentada en esta exportacion es el propio proceso de exportacion a ONNX con pesos en float16 y ejecucion en float32, orientado a onnxruntime-web. Segun el autor, las predicciones coinciden con el paquete oficial de Python dentro de un margen de 3e-4 respecto al mayor valor de prediccion de la suite de pruebas del repositorio.

## Capacidades

- Prediccion de series temporales con salida probabilistica: 21 niveles de cuantil (0,01 a 0,99) por paso futuro.
- Gestion de valores faltantes mediante la mascara booleana `obs`.
- Soporte de multiples series en una misma inferencia, agrupadas por `group_ids`.
- Soporte de tres roles por fila: 0 para objetivo, 1 para covariable solo pasada, 2 para covariable de futuro conocido.
- Soporte de covariables de futuro conocido con horizonte H de hasta 1024 pasos (multiplos de 32).
- Ejecucion en navegador mediante onnxruntime-web, sin backend Python.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni comportamiento de agente.
- No es multilingue en el sentido linguistico: su entrada es exclusivamente numerica.

## Casos de uso

- Prediccion de demanda en retail: el modelo puede proyectar ventas por producto o por tienda tratando cada referencia como una serie independiente dentro del mismo lote, aprovechando `group_ids` para separar series y `known_future` para incorporar promociones o festivos ya planificados.
- Gestion de carga electrica: con covariables de futuro conocido (por ejemplo, prevision meteorologica ya conocida o calendario laboral), el modelo genera cuantiles de consumo horario, utiles para dimensionar reservas y planificar despacho.
- Monitorizacion de sensores IoT en el navegador: al ejecutarse con onnxruntime-web, permite hacer forecasting directamente en el cliente sin enviar datos de sensores a un servidor, lo que reduce el trafico y preserva la privacidad.
- Mantenimiento predictivo industrial: a partir de historiales de telemetria por maquina, el modelo estima rangos de valores futuros y permite detectar desviaciones respecto a los cuantiles esperados.
- Prediccion de trafico o afluencia: con series de conteo por carril, estacion o acceso, el modelo produce intervalos de prediccion que alimentan sistemas de alerta o de planificacion de recursos.
- Aplicaciones web de analitica financiera: integrado en el navegador, permite mostrar bandas de prediccion sobre series de precios o volumenes sin exponer los datos del usuario a un backend.
- Planificacion de inventario y logistica: el horizonte de hasta 1024 pasos y el soporte de covariables conocidas permiten generar previsiones a medio plazo para decidir reposiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion aportado por el autor es que las predicciones de esta exportacion coinciden con las del paquete oficial de Python dentro de un margen de 3e-4 respecto al mayor valor de prediccion de la suite de pruebas del repositorio `timestral-demo`.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula. Con pesos en float16, la variante de 5M ocupa aproximadamente 10 MB y la de 28M aproximadamente 56 MB (estimacion a partir del numero de parametros, sin incluir activaciones).
- GPU recomendadas: no se requiere GPU. Al estar orientado a onnxruntime-web, el caso de uso principal es la ejecucion en CPU del navegador.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo puede alojarlo, aunque el modelo esta disenado para funcionar sin ella.
- Opciones de despliegue: onnxruntime (Python, C++, C#), onnxruntime-web (WASM en navegador). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato ni a esta tarea.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran del navegador, del motor WASM y del numero de series y pasos solicitados.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos, por lo que no es posible construir una comparativa cuantitativa fiable. En la misma categoria de forecasting de series temporales existen otras familias conocidas (por ejemplo, Chronos de Amazon, TimesFM de Google o Moirai de Salesforce), pero sus parametros, contextos y resultados no se recogen en el material disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Timestral-5M-ONNX (esta ficha) | 5M | historia en multiplos de 32; horizonte hasta 1024 pasos | mistral-modified-mit | ONNX en HuggingFace |
| Timestral-28M (modelo base) | 28M | no disponible | mistral-modified-mit | HuggingFace |
| Alternativas de la categoria (Chronos, TimesFM, Moirai) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no incluye datos de benchmarks publicos, por lo que no hay evidencia documentada de rendimiento frente a alternativas en tareas estandar de forecasting.
- Sesgos conocidos: no disponibles. Al no existir informacion sobre el dataset de entrenamiento original, no se pueden evaluar sesgos por dominio, region o tipo de serie.
- Riesgo de alucinacion: en el sentido estricto no aplica, pero el modelo puede producir predicciones con intervalos mal calibrados si la serie de entrada difiere de la distribucion de entrenamiento.
- Limitacion de contexto: la historia debe ser multiplo de 32 pasos y el horizonte de futuro conocido esta acotado a 1024 pasos (multiplos de 32). Las predicciones mas alla de ese rango requieren el bucle de decodificacion implementado en `timestral.js`.
- Limitacion idiomatica: el modelo no procesa texto, por lo que no tiene capacidades multilingues.
- La exportacion depende de un unico decodificador; el resto del pipeline (preparacion de filas, promediado con la serie espejada, recorte) vive en JavaScript y debe replicarse si se integra fuera de la demo.
- Restricciones de licencia: se aplica la Modified MIT de Mistral AI, con aviso de atribucion (2026, Mistral AI). Conviene revisar el archivo LICENSE antes de un uso comercial.
- Advertencia de produccion: el numero de descargas y de "likes" del repositorio es cero y el tamano declarado del repo es de 0,0 GB, lo que sugiere una publicacion muy reciente y poco validada por la comunidad. No se trata de una publicacion oficial de Mistral AI, sino de una exportacion de terceros.
- La precision declarada (3e-4 respecto al mayor valor de prediccion) es un dato aportado por el autor y no ha sido verificada de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amine40/Timestral-5M-ONNX
- Modelo base Timestral-5M: https://huggingface.co/mistralai/Timestral-5M
- Modelo base Timestral-28M: https://huggingface.co/mistralai/Timestral-28M
- Demo "Timestral in the browser": https://amine-athmani.github.io/timestral-demo/
- Codigo del pipeline de forecasting (timestral.js): https://github.com/amine-athmani/timestral-demo/blob/main/web/src/lib/timestral.js
- Repositorio de la demo: https://github.com/amine-athmani/timestral-demo
- Licencia (Modified MIT): archivo LICENSE del repositorio de HuggingFace
