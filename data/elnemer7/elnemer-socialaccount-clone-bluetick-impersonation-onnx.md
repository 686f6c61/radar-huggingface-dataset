# elnemer7/ElNeMeR-SocialAccount-Clone-BlueTick-Impersonation-ONNX

## Resumen

ElNeMeR-SocialAccount-Clone-BlueTick-Impersonation-ONNX es un clasificador binario-multiclase exportado a formato ONNX, publicado por el autor elnemer7 (Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) como parte de una flota de 60 modelos orientados a forense digital y seguridad en redes sociales. Su funcion declarada es detectar cuentas falsas de "atencion al cliente oficial" en redes sociales que suplantan a bancos, operadoras de telefonia y figuras publicas para robar codigos OTP y cobrar tasas fraudulentas.

El modelo recibe un tensor de caracteristicas de 512 dimensiones en `float32` y devuelve probabilidades sobre tres clases: mensaje autentico o benigno, trampa por DM con pagina clonada de soporte bancario, y suplantacion con falso tick azul de verificacion en sorteos o promociones. Esta pensado para integrarse en pipelines de moderacion y analisis forense, con compatibilidad tanto con `onnxruntime` como con `onnxruntime-web` (WASM), lo que permite ejecutarlo en navegador.

La relevancia del modelo radica en su nicho: la deteccion de suplantacion de marca en canales sociales, un vector de fraude creciente. No obstante, la informacion publicada es extremadamente escasa (repo de 0.0 GB, sin pipeline declarado, sin idiomas, sin benchmarks verificables) y la unica metrica reportada es una "calibracion" del 100,00 %, que no constituye una evaluacion de rendimiento en sentido estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador con entrada de caracteristicas de 512 dimensiones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de vector fijo `[batch_size, 512]`, no secuencia de tokens) |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX, opset 14) |
| Idiomas soportados | no disponible (etiqueta `arabic-nlp` sugiere foco en arabe, sin confirmar) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Lo unico verificable es la interfaz de inferencia: un tensor de entrada llamado `features` de tipo `float32` con forma `[batch_size, 512]`, y una salida de probabilidades sobre tres clases. Esto es consistente con un clasificador ligero (probablemente una red densa o un cabezal de clasificacion sobre embeddings precalculados), pero el autor no especifica capas, dimensiones ocultas ni funcion de activacion.

Tampoco se documentan los datos de entrenamiento: no hay numero de muestras, composicion del dataset, proceso de anotacion, ni si hubo ajuste fino supervisado, RLHF o DPO. La unica cifra reportada es una "calibracion" del 100,00 %, termino que en la practica suele referirse a la tasa de acierto sobre el propio conjunto de calibracion y que no equivale a una metrica de generalizacion. No se menciona ninguna innovacion tecnica adicional mas alla de la exportacion a ONNX opset 14 para compatibilidad con WASM.

## Capacidades

- Clasificacion de mensajes o cuentas en tres categorias: autentico/benigno, trampa por DM con pagina clonada de soporte bancario, y suplantacion con falso tick azul.
- Deteccion de suplantacion de marca (bancos, operadoras, figuras publicas) en el contexto de fraude por OTP y cobro de tasas.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), ademas de `onnxruntime` en servidor.
- Procesamiento por lotes (`batch_size` configurable en la entrada).
- Soporte declarado para arabe mediante la etiqueta `arabic-nlp` (sin confirmacion en la documentacion).
- No se declara soporte de tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Moderacion de comentarios y mensajes directos en plataformas sociales: el clasificador puede puntuar cada mensaje con las tres probabilidades y derivar a revision humana los que superen un umbral en las clases 1 o 2, reduciendo el volumen de casos que llegan a los moderadores.
- Proteccion de clientes bancarios: integrado en el flujo de mensajeria de una entidad financiera, permite marcar respuestas de cuentas no oficiales que imitan al banco y advertir al usuario antes de que comparta un OTP.
- Monitorizacion de campanas de suplantacion con tick azul: un equipo de fraude puede ejecutar el modelo sobre el feed de menciones de la marca para detectar sorteos falsos y solicitar la retirada de cuentas a la plataforma.
- Forense digital post-incidente: al analizar un caso de fraude ya ocurrido, el modelo ayuda a clasificar el corpus de mensajes recopilado y separar los intentos de suplantacion de conversaciones legitimas.
- Ejecucion en el cliente (navegador o extension): gracias a la exportacion WASM, una extension de navegador podria puntuar mensajes localmente sin enviar contenido sensible a un servidor.
- Filtrado previo en pipelines de analisis a gran escala: al ser un modelo ligero en ONNX, puede actuar como primera etapa de descarte antes de modelos mas costosos de analisis de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es "Calibration Accuracy: 100.00 %", sin definicion del conjunto de evaluacion, tamano de muestra ni metodologia, por lo que no debe interpretarse como una medida de rendimiento generalizable.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamano del repo es de 0.0 GB y la entrada es un vector de 512 `float32`, lo que sugiere un modelo muy pequeno, pero no se publica el numero de parametros.
- GPU recomendadas: no disponible; por la naturaleza del modelo (clasificador ligero en ONNX) no requiere GPU dedicada en la mayoria de escenarios.
- GPU de consumo: previsiblemente cabe en cualquier GPU de consumo e incluso en CPU, aunque no hay datos oficiales que lo confirmen.
- Opciones de despliegue: `onnxruntime` (Python, C++, etc.) y `onnxruntime-web` (WASM) segun la model card; otros runtimes ONNX no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificacion de suplantacion de marca en redes sociales) ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre arquitectura, datos de entrenamiento y evaluacion: no es posible reproducir ni auditar el modelo con la informacion publicada.
- La cifra de "calibracion del 100,00 %" no es una metrica de generalizacion verificable y no debe usarse para justificar decisiones en produccion.
- Riesgo de sesgo desconocido: al no documentarse la composicion del dataset, se desconoce su cobertura geografica, linguistica y de tipos de marca.
- Riesgo de falsos positivos y negativos no cuantificado; se recomienda umbral conservador y revision humana.
- Ambito limitado: el modelo clasifica un vector de caracteristicas de 512 dimensiones, no texto libre; requiere un pipeline externo de extraccion de caracteristicas que no se documenta.
- El foco declarado en arabe (`arabic-nlp`) sugiere un rendimiento inferior en otros idiomas, aunque no se aportan datos.
- Licencia MIT: permite uso comercial y modificacion, pero sin garantias; el autor no ofrece soporte ni mantenimiento documentado.
- Repo sin descargas ni likes y con fecha de creacion futura respecto a la informacion habitual de Hugging Face, lo que aconseja verificar la integridad y procedencia de los artefactos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-SocialAccount-Clone-BlueTick-Impersonation-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
