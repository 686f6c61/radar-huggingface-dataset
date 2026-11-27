# elnemer7/ElNeMeR-TrafficFine-Tax-CourtSMS-Smishing-ONNX

## Resumen

ElNeMeR-TrafficFine-Tax-CourtSMS-Smishing-ONNX es un clasificador binario/multiclase exportado a formato ONNX, publicado por el autor elnemer7 (Eng. Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) dentro de una coleccion denominada "50-Model World Sovereign & Humanitarian Forensic AI Fleet". El modelo esta disenado para detectar SMS fraudulentos de tipo smishing, en concreto mensajes que suplantan multas de trafico, peajes, impuestos o citaciones judiciales para conseguir numeros de tarjeta y codigos OTP.

El modelo no es un modelo generativo de lenguaje, sino un clasificador de caracteristicas tabulares: recibe un tensor `features` de tipo `float32` con forma `[batch_size, 512]` y devuelve probabilidades sobre tres clases (`official_gov_eg_portal_info`, `fake_traffic_radar_fine_smish`, `bogus_tax_or_court_freeze_link`). Esta orientado a inferencia ligera en entornos web mediante `onnxruntime` y `onnxruntime-web` (WASM), con opset 14.

Su relevancia es acotada pero concreta: cubre un nicho de forense digital y prevencion de fraude con tarjeta en el contexto egipcio (multas de radar en EGP), y su empaquetado ONNX lo hace desplegable en navegador o en servicios de baja latencia. La informacion publicada es muy escasa: no hay detalle sobre arquitectura interna, datos de entrenamiento, volumen del repositorio (0.0 GB) ni benchmarks independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador exportado a ONNX; estructura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 512 caracteristicas float32) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los ejemplos de la model card son en ingles y referencias a EGP; el contenido real de los SMS no se especifica) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card solo especifica la interfaz de inferencia: un tensor de entrada llamado `features`, de tipo `float32` y forma `[batch_size, 512]`, y una salida de probabilidades sobre tres clases. El modelo esta exportado a ONNX con opset 14, lo que garantiza compatibilidad con `onnxruntime` (Python, C++, etc.) y `onnxruntime-web` mediante WebAssembly.

No se documentan datos de entrenamiento, numero de tokens, composicion del dataset, ni si hubo ajuste fino, RLHF o tecnicas de calibracion mas alla de una cifra declarada de "Calibration Accuracy: 100.00%". Esa cifra debe interpretarse con cautela: no se especifica sobre que conjunto se midio, ni el tamano de la muestra, ni el metodo de calibracion, por lo que no es verificable de forma independiente.

## Capacidades

- Clasificacion de mensajes SMS en tres categorias: informacion oficial de portal gubernamental egipcio, smishing de multa de radar falsa y enlace fraudulento de impuestos o congelacion judicial.
- Deteccion de patrones de smishing de importe pequeno ("paga 125 EGP en 24 h via enlace") orientados a capturar numeros de tarjeta y OTP.
- Inferencia en navegador o en servicios ligeros gracias al formato ONNX y a la compatibilidad con `onnxruntime-web` (WASM).
- Entrada de caracteristicas precalculadas de 512 dimensiones: el modelo no procesa texto en crudo, requiere un pipeline externo de extraccion de caracteristicas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No se documentan capacidades multilingues ni modo de razonamiento (thinking).

## Casos de uso

- Filtrado de SMS en pasarelas de mensajeria: integrar el modelo en el backend de un operador o agregador para etiquetar mensajes entrantes y bloquear los que se clasifiquen como `fake_traffic_radar_fine_smish` o `bogus_tax_or_court_freeze_link`.
- Extension de navegador o cliente de mensajeria: ejecutar el modelo en el propio dispositivo mediante `onnxruntime-web` (WASM) para advertir al usuario antes de que pulse un enlace de pago, sin enviar el contenido a un servidor.
- Prevencion de fraude con tarjeta en entidades financieras: usar la clasificacion como senal adicional en el scoring de riesgo cuando un cliente reporta un SMS de multa o impuesto, reduciendo falsos negativos en la deteccion de intentos de obtencion de OTP.
- Forense digital y analisis de campanas: procesar lotes de SMS incautados o reportados para agrupar y cuantificar campanas de smishing de multas de trafico, impuestos o citaciones judiciales.
- Formacion y concienciacion: clasificar ejemplos reales frente a comunicaciones oficiales para generar material de entrenamiento para usuarios y empleados.
- Moderacion en plataformas de mensajeria o foros: marcar automaticamente mensajes que contengan enlaces de pago de multas o impuestos antes de su publicacion.
- Investigacion academica sobre smishing: servir como linea base reproducible en formato ONNX para comparar clasificadores de fraude SMS en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es "Calibration Accuracy: 100.00%", sin especificar conjunto de evaluacion, tamano de muestra ni metodologia, por lo que no se presenta como resultado verificado.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.0 GB y el modelo es un clasificador sobre entradas de 512 dimensiones, por lo que la huella de memoria es previsiblemente muy reducida (del orden de kilobytes a pocos megabytes), aunque no se confirma el tamano exacto del grafo ONNX.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) seria sobredimensionada para este tipo de modelo.
- Compatibilidad con GPU consumer: si, y en la practica no es necesaria.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM en navegador), `onnxruntime-node`, o cualquier runtime compatible con ONNX opset 14.
- Latencia y throughput estimados: no disponibles. Por la naturaleza del modelo (clasificador de 512 caracteristicas) se espera latencia de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores ONNX de smishing SMS) con parametros, contexto, rendimiento y licencia verificables. Se puede senalar como referencia generica el uso de clasificadores tipo TF-IDF + regresion logistica o transformers pequenos ajustados para deteccion de phishing, pero no se dispone de datos de comparacion concretos para este modelo.

## Limitaciones y advertencias

- La cifra de "Calibration Accuracy: 100.00%" no es verificable: no se indica el conjunto de evaluacion ni el tamano de muestra, y un 100 % en un problema de clasificacion de fraude es altamente sospechoso de sobreajuste o de evaluacion sobre el propio conjunto de entrenamiento.
- No se documenta la arquitectura, el dataset de entrenamiento ni el proceso de extraccion de caracteristicas, lo que impide auditar el modelo o reproducir sus resultados.
- La entrada es un vector de 512 caracteristicas precalculadas: el modelo no procesa texto en crudo, por lo que su rendimiento depende completamente del pipeline de vectorizacion que lo acompanie, que no se publica.
- Sesgos conocidos: no documentados. El modelo parece centrado en el contexto egipcio (multas en EGP, portales gubernamentales de Egipto), por lo que su validez fuera de ese contexto geografico y linguistico es dudosa.
- Riesgo de falsos positivos sobre comunicaciones oficiales legitimas, especialmente si el vectorizador no captura variaciones de redaccion o de idioma.
- Limitaciones de idioma: no se especifican los idiomas soportados; los ejemplos de la model card estan en ingles con referencias a EGP, pero no se confirma soporte de arabe ni de otros idiomas.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero al no haber documentacion tecnica, el usuario asume el riesgo de validacion.
- Ausencia de senales de adopcion (0 descargas, 0 likes) y repositorio de 0.0 GB: conviene verificar que los artefactos ONNX esten realmente presentes y sean cargables antes de integrarlo en produccion.
- No debe usarse como unico mecanismo de decision en sistemas antifraude: se recomienda combinarlo con reglas, listas de dominios maliciosos y revision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-TrafficFine-Tax-CourtSMS-Smishing-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
