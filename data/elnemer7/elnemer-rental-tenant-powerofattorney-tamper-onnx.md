# elnemer7/ElNeMeR-Rental-Tenant-PowerOfAttorney-Tamper-ONNX

## Resumen

ElNeMeR-Rental-Tenant-PowerOfAttorney-Tamper-ONNX es un clasificador binario-multiclase exportado a formato ONNX, desarrollado por el ingeniero Mahmoud ElNemer bajo el sello ElNeMeR Digital Solutions & AI. Forma parte de una flota declarada de 60 modelos forenses orientados a IA humanitaria, y su proposito concreto es detectar manipulaciones digitales en documentos legales y administrativos: poderes notariales (توكيلات), contratos de arrendamiento y facturas de suministros (utility bills). El modelo se presenta como una herramienta de proteccion para personas mayores, arrendadores e inquilinos frente a fraudes documentales.

Tecnicamente, no se trata de un modelo de lenguaje ni de un transformer: es un clasificador tabular que recibe un tensor `float32` de forma `[batch_size, 20]` denominado `poa_rental_features` y devuelve probabilidades sobre tres clases. La exportacion esta fijada en ONNX Opset 14, lo que garantiza compatibilidad tanto con `onnxruntime` nativo como con `onnxruntime-web` compilado a WASM, permitiendo inferencia en navegador.

La relevancia del modelo es acotada pero especifica: ofrece una via de despliegue ligera (el repositorio ocupa 0.0 GB) para integrar una comprobacion automatica de integridad documental en flujos de validacion notarial o de gestion de arrendamientos, sin dependencia de infraestructura GPU. La calibracion declarada por el autor es del 79,17 %, un dato que conviene interpretar con cautela dado que no se especifica el conjunto de evaluacion ni el metodo de medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador tabular exportado a ONNX (no se especifica la topologia interna de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 20 caracteristicas, no secuencial) |
| Tipos de cuantizacion | no disponible (el tensor de entrada es `float32`; no se documentan pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (Opset 14) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card unicamente documenta la interfaz de inferencia: una entrada `poa_rental_features` de tipo `float32` con dimension `[batch_size, 20]` y una salida `probabilities` sobre tres clases (`0`: documento notarial o de suministros autentico; `1`: empalme de sello en poder notarial falsificado; `2`: clausula de arrendamiento alterada o factura de suministros manipulada). El hecho de que la entrada sea un vector de 20 caracteristicas sugiere un pipeline previo de extraccion de rasgos forenses (metadatos, caracteristicas de imagen o de estructura documental) que no se describe en la informacion proporcionada.

Tampoco se documentan el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de aumento de datos, regularizacion o calibracion post-entrenamiento. El unico dato de rendimiento declarado es una "calibration accuracy" del 79,17 %, sin especificacion del conjunto de validacion, del umbral de decision ni del balance de clases. No se menciona ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.), lo cual es coherente con la naturaleza de clasificador tabular del artefacto.

## Capacidades

- Clasificacion de documentos en tres categorias: autentico, sello falsificado en poder notarial y clausula o factura alterada.
- Deteccion de empalmes de sello ("seal splice") en poderes notariales digitalizados.
- Deteccion de alteraciones en clausulas de contratos de arrendamiento.
- Deteccion de manipulacion en facturas de suministros.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), sin backend servidor.
- Inferencia por lotes (`batch_size` configurable) en `onnxruntime` nativo.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues: es un clasificador de proposito unico.

## Casos de uso

- Validacion previa en notaria: antes de aceptar un poder notarial presentado en formato digital, el clasificador puede puntuar el documento y marcar para revision manual aquellos con probabilidad alta de la clase 1 (empalme de sello), reduciendo el riesgo de fraude en operaciones inmobiliarias.
- Gestion de arrendamientos: una plataforma de alquiler puede pasar las clausulas extraidas de un contrato por el modelo para detectar alteraciones (clase 2) antes de la firma, con un coste computacional minimo al ser un modelo ONNX de pocos kilobytes.
- Proteccion de personas mayores: integrado en una aplicacion web o movil, el modelo puede alertar a usuarios vulnerables cuando un documento recibido (poder, contrato o factura) presenta indicios de manipulacion.
- Verificacion de facturas de suministros en portales de consumo: las asociaciones de consumidores pueden incorporar el clasificador como filtro previo en reclamaciones por facturacion fraudulenta.
- Despliegue en navegador sin servidor: al ser compatible con `onnxruntime-web` (WASM), permite que el documento no abandone el dispositivo del usuario, lo que facilita el cumplimiento de requisitos de privacidad en la validacion de documentos personales.
- Triaje en pipelines de peritaje forense digital: el modelo puede actuar como primera etapa de cribado que prioriza los documentos sospechosos para el analisis manual de un perito, dado su bajo coste de ejecucion.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Calibration accuracy | 79,17 % | Declarada por el autor; no se especifica conjunto de evaluacion ni umbral |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable dado que el modelo no es un LLM sino un clasificador tabular de dominio especifico. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el repositorio ocupa 0.0 GB y el modelo es un clasificador tabular de entrada `[batch, 20]`.
- GPU recomendadas: no necesarias; la inferencia puede ejecutarse en CPU sin penalizacion relevante.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso iGPU) y en CPU de portatil.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM en navegador), y cualquier runtime compatible con ONNX Opset 14.
- Latencia y throughput estimados: no disponibles; por la naturaleza del modelo, se espera del orden de microsegundos a milisegundos por lote en CPU, aunque no se aporta ninguna medicion oficial.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR-Rental-Tenant-PowerOfAttorney-Tamper-ONNX | Clasificador tabular ONNX | no disponible | no aplica | MIT | Hugging Face |
| Alternativas de deteccion de falsificacion documental | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la misma categoria (clasificadores forenses de documentos legales con entrada tabular de 20 caracteristicas) dentro de la informacion proporcionada. Los detectores de manipulacion documental habituales se basan en vision por computador (CNN/ViT sobre la imagen del documento) o en modelos multimodales, que no son directamente comparables con este artefacto.

## Limitaciones y advertencias

- El unico dato de rendimiento es una "calibration accuracy" del 79,17 % sin metodologia documentada; no debe interpretarse como una tasa de acierto validada en produccion.
- No se especifican el dataset de entrenamiento, el balance de clases ni la distribucion de los documentos usados, por lo que se desconoce el sesgo hacia alguna de las tres clases.
- El modelo no procesa imagenes ni texto directamente: requiere un pipeline externo de extraccion de las 20 caracteristicas de entrada, que no se documenta en la model card.
- Riesgo de alucinacion no aplicable en sentido estricto (no genera texto), pero si riesgo de falsos positivos y falsos negativos en la clasificacion, con consecuencias legales potencialmente graves si se usa como unica fuente de decision.
- No se documentan los idiomas soportados ni la cobertura geografica o jurisdiccional de los documentos (poderes notariales, contratos y facturas) sobre los que fue entrenado.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad; para uso en produccion con implicaciones legales se recomienda validacion independiente y supervision humana.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado informacion sobre auditorias externas del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Rental-Tenant-PowerOfAttorney-Tamper-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
- Contacto del autor (WhatsApp/telefono): +20 150 755 9911
