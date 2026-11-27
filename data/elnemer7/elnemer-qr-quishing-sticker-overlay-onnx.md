# elnemer7/ElNeMeR-QR-Quishing-Sticker-Overlay-ONNX

## Resumen

ElNeMeR-QR-Quishing-Sticker-Overlay-ONNX es un clasificador binario-multiclase de pequeno tamano empaquetado en formato ONNX, desarrollado por el ingeniero Mahmoud ElNemer bajo el paraguas de su proyecto "50-Model World Sovereign & Humanitarian Forensic AI Fleet" (ElNeMeR Digital Solutions & AI). El modelo aborda un problema concreto de seguridad: la deteccion de ataques de *quishing* (phishing mediante codigos QR) que se materializan fisicamente como pegatinas superpuestas sobre el QR legitimo de un comercio, asi como redirecciones encubiertas hacia pasarelas de pago fraudulentas.

El modelo no es un LLM ni un transformer generativo: se trata de un clasificador tabular que recibe un vector de 20 caracteristicas (`qr_overlay_features`) extraidas del analisis de la imagen o del flujo de pago, y devuelve probabilidades sobre tres clases: QR legitimo impreso, superposicion fisica fraudulenta y redireccion encubierta de drenaje de pago. Su relevancia practica reside en el despliegue ligero (ONNX Opset 14, compatible con `onnxruntime` y `onnxruntime-web` via WASM), lo que permite ejecutarlo tanto en backend como directamente en navegador o en terminales POS.

El repositorio es practicamente vacio (0.0 GB, 0 descargas, 0 likes) y la model card es extremadamente escueta: no incluye arquitectura interna, datos de entrenamiento, ni detalles sobre el pipeline de extraccion de caracteristicas. La unica metrica declarada es una "Calibration Accuracy" del 97,82 %, sin especificar el conjunto de validacion ni la metodologia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador tabular (no especificada; entrada de 20 caracteristicas float32) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo no generativo) |
| Tipos de cuantizacion | no disponible (formato ONNX; cuantizacion no documentada) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (Opset 14) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del clasificador: la model card solo especifica el contrato de entrada (tensor `qr_overlay_features` de tipo `float32` con forma `[batch_size, 20]`) y el de salida (probabilidades sobre tres clases). Por el tamano del repositorio (0.0 GB) y la naturaleza de la tarea, es plausible que se trate de un modelo denso de pocas capas (MLP) o incluso de un clasificador lineal con transformaciones, pero esto no esta confirmado en la informacion proporcionada.

Tampoco se documentan el conjunto de datos de entrenamiento, el numero de muestras, la composicion del dataset, ni si se aplicaron tecnicas de calibracion post-entrenamiento (a pesar de que la model card menciona "Calibration Accuracy", lo que sugiere algun proceso de calibracion). No se mencionan innovaciones tecnicas como decodificacion especulativa, atencion lineal ni mecanismos híbridos; el unico detalle tecnico relevante es la compatibilidad con `onnxruntime` y `onnxruntime-web` (WASM), que habilita inferencia en el cliente.

## Capacidades

- Clasificacion de codigos QR en tres categorias: `genuine_printed_merchant_qr`, `physical_sticker_overlay_quishing` y `cloaked_redirect_payment_drain_qr`.
- Deteccion de superposiciones fisicas (pegatinas) sobre QR impresos de comercios.
- Deteccion de redirecciones encubiertas multi-salto hacia pasarelas de pago fraudulentas.
- Inferencia en navegador mediante `onnxruntime-web` (WASM) y en backend con `onnxruntime`.
- Entrada tabular de 20 caracteristicas, lo que sugiere que el modelo consume caracteristicas preextraidas por un pipeline externo (no end-to-end sobre imagen).
- No soporta generacion de texto, tool calling, agentes, vision directa ni capacidades multilingues.

## Casos de uso

- Proteccion en terminales POS: integracion del clasificador en el firmware o en el software de un terminal de pago para verificar, antes de iniciar una transaccion, que el QR escaneado no presenta indicios de superposicion fisica ni redireccion encubierta.
- Aplicaciones moviles de banca o pago: ejecucion del modelo via `onnxruntime-web` o `onnxruntime` movil para advertir al usuario antes de confirmar un pago a un QR sospechoso.
- Auditoria forense de imagenes de QR: uso en herramientas de analisis digital forense que extraigan las 20 caracteristicas de una fotografia de un QR fisico y consulten al modelo para clasificar el caso.
- Monitorizacion de comercios: despliegue en plataformas de inspeccion (por ejemplo, la "Live Humanitarian Forensic Platform" del autor) para revisar reportes ciudadanos de pegatinas fraudulentas sobre QR de restaurantes o parkings.
- Filtrado en pasarelas de pago: clasificacion previa de la URL destino de un QR para bloquear redirecciones encubiertas antes de que el usuario introduzca datos de tarjeta.
- Educacion y concienciacion: demo interactiva en navegador que muestre al usuario como se clasifica un QR legitimo frente a uno manipulado, aprovechando la compatibilidad WASM del modelo.
- Integracion en pipelines de ciberseguridad: como etapa de un sistema de deteccion de fraude que agregue senales de multiples modelos (el autor lo enmarca en una "fleet" de 50 modelos).

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Calibration Accuracy | 97,82 % | Declarada en la model card; sin conjunto de validacion ni metodologia especificados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones con modelos alternativos de deteccion de quishing. La unica cifra aportada es la "Calibration Accuracy" del 97,82 %, que no es verificable con los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamano del repositorio (0.0 GB) y la entrada de 20 caracteristicas, el modelo es extremadamente ligero y cabe en cualquier GPU, CPU o incluso en navegador.
- GPU recomendadas: no se requieren; cualquier GPU consumer (incluso integradas) es suficiente. Tambien es viable en CPU pura.
- Cabe en consumer GPU: si, en cualquier GPU consumer e incluso en dispositivos moviles.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM en navegador), y potencialmente `onnxruntime` movil. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; por la naturaleza del modelo (entrada de 20 float32), se espera latencia sub-milisegundo en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de clasificacion de quishing con caracteristicas tabulares y formato ONNX. Existen soluciones comerciales de deteccion de quishing (por ejemplo, motores de analisis de URL y de imagen de QR en suites de seguridad), pero no se dispone de datos publicos que permitan una comparacion rigurosa con este modelo.

## Limitaciones y advertencias

- La model card no documenta la arquitectura, los datos de entrenamiento ni el pipeline de extraccion de las 20 caracteristicas, lo que dificulta la reproducibilidad y la evaluacion independiente.
- La unica metrica declarada (97,82 % de "Calibration Accuracy") carece de contexto: no se especifica el conjunto de validacion, el balance de clases ni la metodologia de calibracion.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-27), lo que sugiere que no ha sido validado por la comunidad.
- El modelo no procesa imagenes directamente: depende de un pipeline externo que extraiga las 20 caracteristicas, cuyo comportamiento y calidad no se documentan.
- Riesgo de falsos positivos y negativos en produccion: sin datos de validacion externos, no se puede garantizar su robustez ante variaciones de iluminacion, angulo, calidad de impresion o tecnicas de evasion.
- No se documentan sesgos conocidos, pero al ser un clasificador entrenado sobre una distribucion de datos no especificada, podria generalizar mal a comercios, regiones o tipos de QR no representados.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; la responsabilidad recae en el integrador.
- Advertencia sobre la fuente: la model card incluye enlaces y datos de contacto del autor que deben tratarse como material de referencia, no como instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-QR-Quishing-Sticker-Overlay-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
- Contacto del autor (WhatsApp/telefono): +20 150 755 9911
