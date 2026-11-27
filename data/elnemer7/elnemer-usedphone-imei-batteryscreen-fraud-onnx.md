# elnemer7/ElNeMeR-UsedPhone-IMEI-BatteryScreen-Fraud-ONNX

## Resumen

ElNeMeR UsedPhone-IMEI-BatteryScreen-Fraud-ONNX es un clasificador binario-multiclase exportado a ONNX, publicado por el desarrollador independiente Mahmoud ElNemer (elnemer7) dentro de una flota de modelos forenses denominada "60-Model World Sovereign & Humanitarian Forensic AI Fleet v17.0". El modelo aborda un problema muy concreto del comercio de segunda mano: la deteccion de capturas de pantalla de ajustes de iOS/Android manipuladas para inflar la salud de la bateria, la capacidad de almacenamiento o el estado del IMEI antes de una venta.

A diferencia de los grandes modelos de lenguaje, no se trata de un transformer generativo sino de un clasificador tabular ligero que recibe un vector de 20 caracteristicas (`imei_screen_features`, `float32`, `[batch_size, 20]`) extraidas de la captura y devuelve probabilidades sobre tres clases: pantalla autentica, UI de bateria/almacenamiento editada y captura de IMEI/serie falsificada. El autor declara una precision de calibracion del 89,29 %.

Su relevancia radica en la ligereza y portabilidad: al estar exportado con opset 14 de ONNX, puede ejecutarse tanto con `onnxruntime` en servidor como con `onnxruntime-web` (WASM) en el navegador, lo que permite integrar la verificacion en el propio flujo de publicacion de un marketplace sin enviar la imagen a un backend. La licencia MIT facilita su reutilizacion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador tabular exportado a ONNX (no se especifica la familia interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de vector fijo de 20 caracteristicas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la entrada son caracteristicas numericas, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del clasificador: solo se indica que la entrada es un tensor `float32` de forma `[batch_size, 20]` denominado `imei_screen_features` y que la salida son probabilidades sobre tres clases. No se especifica si el modelo subyacente es una red densa, un gradient boosting o un modelo lineal; tampoco se detalla el numero de parametros ni el tamano del fichero (el repositorio figura con 0.0 GB, lo que sugiere un artefacto muy pequeno o un repositorio aun incompleto).

No hay informacion sobre el dataset de entrenamiento (numero de muestras, composicion, procedencia de las capturas), ni sobre el proceso de ajuste, regularizacion o calibracion mas alla de la cifra de "calibration accuracy" del 89,29 %. El autor menciona compatibilidad con `onnxruntime` y `onnxruntime-web` (WASM) y fija el opset en 14, lo que garantiza portabilidad a entornos de inferencia en navegador.

## Capacidades

- Clasificacion de capturas de pantalla de ajustes de dispositivos moviles en tres categorias: autentica, bateria/almacenamiento editado e IMEI/serie falsificado.
- Extraccion de probabilidades por clase a partir de 20 caracteristicas precalculadas de la imagen.
- Inferencia en servidor con `onnxruntime` y en navegador con `onnxruntime-web` (WASM).
- Integracion en pipelines de moderacion o verificacion de anuncios de segunda mano.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de tool calling, function calling ni capacidades de agente.
- No es multilingue en sentido estricto: consume caracteristicas numericas, no lenguaje natural.
- No incluye modo "thinking", vision nativa ni audio; la vision se resuelve aguas arriba mediante el extractor de caracteristicas.

## Casos de uso

- Verificacion previa a la publicacion en marketplaces de segunda mano: el marketplace extrae las 20 caracteristicas de la captura de ajustes subida por el vendedor y el modelo devuelve la probabilidad de manipulacion; si la clase 1 o 2 supera un umbral, el anuncio se marca para revision.
- Moderacion en el navegador sin backend: al ejecutarse con `onnxruntime-web`, la comprobacion puede hacerse en el propio cliente antes de subir la imagen, reduciendo coste de servidor y exposicion de datos personales.
- Deteccion de fraude en IMEI: en compraventa de terminales, el modelo senala capturas donde el estado del IMEI o el numero de serie ha sido alterado, un indicio habitual de dispositivos robados o bloqueados.
- Verificacion de salud de bateria en reacondicionados: permite filtrar anuncios que muestran un 100 % de salud de bateria sospechosamente uniforme en dispositivos con varios anos de uso.
- Auditoria retroactiva de catalogos: procesar en lote capturas historicas de un marketplace para identificar patrones de fraude recurrentes por vendedor.
- Aplicacion movil de asistente de compra: el comprador fotografia la pantalla de ajustes del vendedor y la app clasifica localmente la autenticidad antes de cerrar la operacion.
- Formacion y peritaje: uso como herramienta auxiliar en cursos de forense digital o en informes preliminares de peritaje, siempre con revision humana.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Calibration accuracy | 89,29 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos de referencia del mismo dominio.

## Requisitos de hardware

- VRAM estimada: no disponible; por el formato (vector de 20 caracteristicas) se espera un consumo minimo, pero el autor no publica cifras.
- GPU recomendadas: no aplica; el modelo esta pensado para CPU y para ejecucion WASM en navegador.
- Compatibilidad con GPU de consumo: irrelevante por el tamano del artefacto; cualquier CPU moderna deberia bastar.
- Opciones de despliegue: `onnxruntime` (Python/C++/C#), `onnxruntime-web` (WASM) en navegador; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR UsedPhone-IMEI-BatteryScreen-Fraud-ONNX | Clasificador ONNX tabular | Vector de 20 caracteristicas | 3 | MIT | Hugging Face |
| Alternativas de deteccion de manipulacion de imagenes (p. ej. clasificadores ELA/forenses genericos) | Vision / CNN | Imagen completa | Variable | Variable | no disponible en la informacion proporcionada |
| Modelos de deteccion de fraude tabular genericos | Tabular | Variable | Variable | Variable | no disponible en la informacion proporcionada |

No se dispone de datos publicos de modelos directamente comparables en el mismo nicho (forense de capturas de ajustes de telefonia movil) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos; al entrenarse presumiblemente con capturas de iOS/Android, podria degradarse en fabricantes, versiones de sistema o idiomas de interfaz no representados.
- Riesgo de falsos positivos y negativos: la cifra del 89,29 % de "calibration accuracy" es una metrica autodeclarada, sin validacion externa ni conjunto de test independiente descrito.
- Depende criticamente del extractor de caracteristicas aguas arriba: si las 20 caracteristicas no se calculan exactamente como en el entrenamiento, la salida carece de sentido.
- No procesa imagenes directamente; no es un modelo de vision de extremo a extremo.
- No hay informacion sobre el dataset, el numero de parametros ni el tamano real del artefacto (repositorio de 0.0 GB), lo que dificulta evaluar su robustez.
- El modelo se presenta dentro de una "flota" comercial con enlaces a un portal corporativo y un telefono de contacto; conviene tratar las afirmaciones de la model card con cautela y verificar el artefacto antes de usarlo en produccion.
- La licencia MIT permite uso comercial, pero no exime de responsabilidad legal si se usa como unica prueba en disputas de compraventa; debe acompanarse de revision humana.
- No se especifican idiomas soportados; en la practica, la clasificacion no depende del idioma de la interfaz, pero la extraccion de caracteristicas si puede verse afectada por el layout de la pantalla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-UsedPhone-IMEI-BatteryScreen-Fraud-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
- Contacto del autor (WhatsApp/telefono): +20 150 755 9911
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
