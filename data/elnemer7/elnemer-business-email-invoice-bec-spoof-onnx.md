# elnemer7/ElNeMeR-Business-Email-Invoice-BEC-Spoof-ONNX

## Resumen

ElNeMeR Business-Email-Invoice-BEC-Spoof-ONNX es un clasificador binario/multiclase exportado a formato ONNX, orientado a la deteccion de fraude por compromiso de correo empresarial (BEC, *Business Email Compromise*) y suplantacion de datos bancarios de proveedores (IBAN/SWIFT). Lo publica el ingeniero Mahmoud ElNemer bajo el paraguas de su proyecto "50-Model World Sovereign & Humanitarian Forensic AI Fleet", una coleccion de modelos de analisis forense digital enfocados a seguridad corporativa y ayuda humanitaria. El modelo se distribuye con licencia MIT y esta pensado para ejecutarse tanto en `onnxruntime` como en `onnxruntime-web` (WASM), lo que facilita su integracion en clientes de correo, pasarelas y paneles web.

El modelo resuelve un problema concreto y de alto impacto economico: la interceptacion de correos de proveedores en los que un atacante modifica el numero de cuenta de destino o se hace pasar por un directivo para ordenar una transferencia urgente. La salida del modelo es una distribucion de probabilidad sobre tres clases: correspondencia corporativa legitima, redireccion urgente de IBAN por suplantacion del CEO y correo de factura con dominio falsificado.

La informacion publica disponible es muy limitada: el repositorio ocupa 0.0 GB, no hay pipeline declarado, no se especifican idiomas soportados ni se han publicado resultados de benchmarks independientes. La model card unicamente declara una precision de calibracion del 100,00 %, un tensor de entrada `features` de tipo `float32` con forma `[batch_size, 512]` y compatibilidad con ONNX Opset 14.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador exportado a ONNX; la model card no detalla la red subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (la entrada es un vector fijo de 512 caracteristicas, no una secuencia de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (Opset 14) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Lo unico verificable es la interfaz de inferencia: una entrada llamada `features` de tipo `float32` con forma `[batch_size, 512]` y una salida `probabilities` de tres clases. Esto sugiere un clasificador tabular o un modelo de texto cuyo *feature extractor* (posiblemente TF-IDF, hashing o embeddings precalculados) se ejecuta fuera del grafo ONNX, de modo que el modelo recibe directamente un vector denso de 512 dimensiones. No se especifica si se trata de una red totalmente conectada, un transformer pequeno u otra familia.

Tampoco se documentan el volumen ni la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas de *fine-tuning* supervisado, RLHF o DPO. La unica metrica declarada es una "Calibration Accuracy" del 100,00 %, cifra que debe interpretarse con cautela porque no se acompana de tamano de conjunto de prueba, matriz de confusion ni metodologia de validacion. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion de correos corporativos en tres categorias: correspondencia legitima, BEC con redireccion urgente de IBAN y suplantacion de dominio en facturas.
- Deteccion de indicios de fraude en cambios de datos bancarios de proveedores (IBAN/SWIFT).
- Deteccion de suplantacion de identidad del CEO o directivos en ordenes de transferencia.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), sin necesidad de backend.
- Compatibilidad con `onnxruntime` en servidor para integracion en pipelines de seguridad.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio, *tool calling* ni comportamiento agentico.
- No se documenta soporte multilingue explicito.

## Casos de uso

- Filtrado en pasarelas de correo corporativo: el modelo se puede insertar como etapa de clasificacion previa a la entrega en el buzon, etiquetando mensajes sospechosos de BEC antes de que el empleado los abra, gracias a su formato ONNX ligero y ejecutable en servidor.
- Verificacion en clientes de correo web: al ejecutarse con `onnxruntime-web` (WASM), puede integrarse en el propio navegador del usuario para marcar correos de proveedores con cambios de IBAN sin enviar el contenido a un servidor externo.
- Alerta en flujos de aprobacion de pagos: el clasificador puede actuar como *check* automatizado cuando un correo dispara una solicitud de transferencia, bloqueando la orden hasta validacion humana.
- Auditoria forense de buzones comprometidos: en una investigacion posterior a un incidente, el modelo permite triar rapidamente el historico de correos y aislar los mensajes con patrones de suplantacion.
- Proteccion de departamentos de contabilidad y compras: clasificacion automatica de facturas entrantes para detectar dominios falsificados o cambios de cuenta no notificados por canal alternativo.
- Formacion y simulacion de *phishing*: el modelo puede usarse para etiquetar corpus de correos de concienciacion y medir la calidad de las simulaciones internas de BEC.
- Despliegue en entornos con recursos limitados: al no requerir GPU y poder ejecutarse en WASM, encaja en dispositivos de sucursal o en arquitecturas *edge* sin infraestructura de aceleracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es una "Calibration Accuracy" del 100,00 %, sin conjunto de validacion, tamano de muestra ni comparacion con lineas base, por lo que no constituye un benchmark reproducible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.0 GB y la entrada es un vector de 512 `float32`, por lo que la huella de memoria del grafo es presumiblemente minima, aunque no se publican cifras.
- GPU recomendadas: no se especifican. Por el formato y el tamano declarado, no parece requerir GPU dedicada.
- Compatibilidad con GPU de consumo: probablemente si en cualquier GPU con soporte CUDA a traves de `onnxruntime-gpu`, pero no esta confirmado por el autor.
- Opciones de despliegue: `onnxruntime` (CPU/GPU) y `onnxruntime-web` con backend WASM, segun la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores ONNX de BEC o suplantacion de IBAN) con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La precision del 100,00 % declarada no viene acompanada de metodologia, tamano de test ni matriz de confusion; no debe tomarse como garantia de rendimiento en produccion.
- No se documenta el dataset de entrenamiento, por lo que se desconoce el sesgo hacia determinados idiomas, formatos de correo, sectores o regiones geograficas.
- El modelo clasifica representaciones de 512 caracteristicas; el preprocesado (tokenizacion, vectorizacion, normalizacion) no esta descrito en la model card y es critico para reproducir el comportamiento esperado.
- Riesgo de falsos positivos y negativos en correos legitimos con cambios de IBAN reales; se recomienda usarlo como capa de apoyo y no como unico mecanismo de decision.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de sobreconfianza en la clase predicha si la calibracion no se ha validado de forma independiente.
- No hay informacion sobre el comportamiento multilingue; un uso en castellano requeriria validacion propia.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero conviene revisar las condiciones del proyecto paraguas del autor y los terminos de la plataforma enlazada.
- El repositorio figura con 0 descargas y 0 likes, y el pipeline no esta declarado; la madurez y el mantenimiento del modelo no estan contrastados.
- En produccion, conviene acompanar el clasificador de reglas deterministicas (SPF/DKIM/DMARC, verificacion de dominios, doble canal para cambios de IBAN) para reducir la dependencia de un unico modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Business-Email-Invoice-BEC-Spoof-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo del autor: https://elnemer-ai.com
