# elnemer7/ElNeMeR-Fake-Recovery-Hacker-DoubleScam-ONNX

## Resumen

ElNeMeR Fake 'Ethical Hacker' & Double-Victim Fund-Recovery Scam Detector es un clasificador binario/multiclase exportado a ONNX que forma parte de la flota de 50 modelos forenses y humanitarios publicada por el ingeniero Mahmoud ElNemer (ElNeMeR Digital Solutions & AI). El modelo aborda un problema concreto dentro del fraude digital: las victimas de extorsion o chantaje que ya han sufrido una estafa reciben a menudo un segundo ataque de supuestos "hackers eticos" que prometen borrar el material comprometedor del dispositivo del extorsionador a cambio de un pago por adelantado, o de falsas agencias de recuperacion de fondos. El modelo pretende clasificar texto (presumiblemente mensajes recibidos por la victima) en tres categorias: orientacion oficial de fuerzas de seguridad, trampa de hacker etico falso o agencia fraudulenta de recuperacion.

El repositorio tiene un tamano de 0.0 GB y no incluye informacion sobre arquitectura base, numero de parametros ni proceso de entrenamiento. La model card unicamente declara el formato de entrada (`features` de tipo `float32` con forma `[batch_size, 512]`) y la compatibilidad con `onnxruntime` y `onnxruntime-web` mediante WASM, lo que sugiere un modelo ligero pensado para despliegue en navegador o en entornos con recursos limitados. No se especifica el pipeline de Hugging Face ni los idiomas soportados.

La relevancia del modelo es acotada pero tematica: se enmarca en la categoria de IA humanitaria y forense digital, con licencia MIT, lo que facilita su integracion en herramientas de proteccion a victimas. No obstante, la ausencia de documentacion tecnica, de benchmarks verificables y de ejemplos de uso limita seriamente su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador exportado a ONNX, opset 14) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de vector `float32` de 512 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14), compatible con `onnxruntime` y `onnxruntime-web` WASM |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card solo indica que la entrada es un tensor `features` de tipo `float32` con forma `[batch_size, 512]`, lo que implica que el modelo no recibe texto en crudo sino un vector de caracteristicas ya extraido (probablemente embeddings o features agregadas). El modelo se distribuye como grafo ONNX en opset 14, lo que permite ejecucion tanto en `onnxruntime` nativo como en navegador mediante `onnxruntime-web` con WASM.

No se documentan datos de entrenamiento, numero de tokens, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La unica metrica declarada es una "Calibration Accuracy" del 100.00%, cifra que no viene acompanada de definicion de la metrica, tamano de conjunto de validacion ni metodologia, por lo que no puede considerarse un resultado verificable.

## Capacidades

- Clasificacion de texto en tres clases: `official_law_enforcement_guidance`, `fake_ethical_hacker_upfront_trap` y `fraudulent_fund_recovery_agency`.
- Deteccion de patrones de doble estafa dirigidos a victimas de extorsion o chantaje.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), lo que permite despliegue cliente sin servidor.
- Inferencia en servidor mediante `onnxruntime` estandar.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No se documenta capacidad multilingue; los idiomas soportados figuran como no disponibles.
- No se documenta modo "thinking" ni capacidades de vision o audio.

## Casos de uso

- Moderacion de mensajes entrantes en plataformas de apoyo a victimas: el modelo puede clasificar mensajes recibidos por personas que ya han sufrido extorsion y alertar cuando un supuesto "hacker etico" solicita un pago por adelantado, gracias a su salida de tres clases orientada a este escenario concreto.
- Extension de navegador para deteccion de fraude: al ser compatible con `onnxruntime-web` WASM, puede ejecutarse localmente en el navegador del usuario para analizar mensajes de correo o chat sin enviar datos a un servidor, lo que preserva la privacidad de la victima.
- Triaje en lineas de atencion telefónica o chat: integrado en el flujo de un operador humano, el modelo puede priorizar conversaciones que coinciden con el patron de "hacker etico falso" o "agencia de recuperacion fraudulenta" para revision inmediata.
- Filtro en sistemas de ticketing de ONG y asociaciones de consumidores: clasificacion automatica de las consultas recibidas para derivar las que corresponden a orientacion oficial de fuerzas de seguridad frente a las que constituyen un segundo intento de estafa.
- Analisis forense de conversaciones: procesamiento por lotes de historiales de chat aportados como evidencia para etiquetar segmentos que corresponden a intentos de doble estafa, con la salida de probabilidades por clase como apoyo a la documentacion del caso.
- Educacion y concienciacion: uso del clasificador en simuladores o materiales formativos que muestran a las victimas como se reconoce un "hacker etico" falso, comparando mensajes reales con la etiqueta asignada por el modelo.
- Investigacion academica sobre fraude digital: el modelo puede servir como linea base reproducible (licencia MIT, formato ONNX) para estudios sobre deteccion de estafas de recuperacion, siempre que se documente adecuadamente su origen y limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es una "Calibration Accuracy" del 100.00%, sin definicion de la metrica, tamano del conjunto de evaluacion ni comparacion con alternativas, por lo que no se presenta como resultado verificable.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.0 GB y la entrada es un vector de 512 dimensiones, lo que sugiere un modelo muy pequeno (probablemente unos pocos MB o menos), pero no se confirma el tamano real del grafo ONNX.
- GPU recomendadas: no disponibles. Por el perfil del modelo (clasificador ligero en ONNX), la inferencia en CPU es presumiblemente suficiente, pero no se documenta.
- Compatibilidad con GPU de consumo: presumiblemente si, dado el reducido tamano del repositorio, aunque no se confirma.
- Opciones de despliegue: `onnxruntime` (Python, C++, etc.) y `onnxruntime-web` con WASM para navegador, segun la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores de estafas de recuperacion o de falsos hackers eticos) con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifica arquitectura, parametros, datos de entrenamiento ni metodologia de evaluacion, lo que impide validar el modelo de forma independiente.
- La cifra de "Calibration Accuracy: 100.00%" no es verificable y no deberia interpretarse como garantia de rendimiento en produccion.
- La entrada es un vector de 512 dimensiones, no texto en crudo: el usuario debe implementar su propio extractor de caracteristicas, y no se documenta cual fue el utilizado durante el entrenamiento, lo que puede provocar un desajuste entre entrenamiento e inferencia.
- Riesgo de alucinacion y falsos positivos/negativos no cuantificado: no se han publicado matrices de confusion, precision, recall ni F1 por clase.
- Sesgos conocidos: no documentados. Al estar orientado a un tipo muy especifico de fraude, podria no generalizar a variantes linguisticas o culturales distintas de las del conjunto de entrenamiento.
- Idiomas soportados no disponibles: no se puede garantizar su funcionamiento en castellano ni en otros idiomas.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni asume responsabilidad sobre el uso del modelo.
- El modelo no sustituye la orientacion legal o policial real; cualquier uso en produccion deberia acompanarse de supervision humana y de una clara advertencia a la victima.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Fake-Recovery-Hacker-DoubleScam-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
