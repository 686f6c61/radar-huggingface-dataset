# elnemer7/ElNeMeR-Government-Grant-UtilityBill-Phishing-ONNX

## Resumen

ElNeMeR-Government-Grant-UtilityBill-Phishing-ONNX es un clasificador binario/multiclase exportado a formato ONNX, orientado a la deteccion de smishing (phishing por SMS y mensajeria instantanea) que suplanta servicios publicos. Lo desarrolla Eng. Mahmoud ElNemer dentro de su flota de 35 modelos forenses denominada "Sovereign & Humanitarian Forensic AI Fleet". El modelo resuelve un problema concreto: identificar mensajes fraudulentos que imitan avisos de agencias postales, amenazas de corte de suministro electrico y falsas subvenciones gubernamentales.

El modelo se distribuye como un artefacto ONNX con un unico tensor de entrada llamado `features` de tipo `float32` y forma `[batch_size, 512]`, y produce probabilidades sobre tres clases: aviso autentico de servicio publico, phishing de subvencion gubernamental falsa y smishing postal/aduanero/de suministros. La exportacion usa opset 14 y es compatible con `onnxruntime` y `onnxruntime-web` (WASM), lo que permite despliegue en navegador y en entornos sin GPU.

La relevancia del modelo es acotada pero especifica: cubre un nicho de seguridad ciudadana (proteccion frente a fraude por SMS) con licencia MIT y un formato de inferencia ligero. No se dispone de informacion sobre la arquitectura interna de la red, el volumen del repositorio (0.0 GB segun Hugging Face) ni los datos de entrenamiento, lo que limita la evaluacion tecnica independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador exportado a ONNX; estructura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de vector fijo de 512 dimensiones, no secuencia de tokens) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX en float32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red neuronal. Lo unico documentado es la interfaz de inferencia: un tensor de entrada `features` de tipo `float32` con forma `[batch_size, 512]` y una salida de probabilidades sobre tres clases. Esto sugiere un modelo de clasificacion tabular o un extractor de caracteristicas previo que transforma el texto del mensaje en un vector de 512 dimensiones, pero no se especifica si ese vectorizador se incluye en el repositorio ni como se genera.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa. La model card menciona una "calibration accuracy" del 100,00 %, dato que no viene acompanado de metodologia, tamano de conjunto de validacion ni particion train/test, por lo que no debe interpretarse como una medida de rendimiento generalizable. El repositorio ocupa 0.0 GB, lo que sugiere un artefacto de muy pequeno tamano.

## Capacidades

- Clasificacion de mensajes SMS/WhatsApp en tres categorias: aviso autentico de servicio publico, phishing de subvencion gubernamental y smishing postal/aduanero/de suministros.
- Deteccion de suplantacion de agencias postales con excusas de tasas aduaneras (por ejemplo, pagos de 45 EGP por paquetes retenidos).
- Deteccion de amenazas falsas de corte de suministro electrico.
- Deteccion de falsas subvenciones en efectivo atribuidas a entidades gubernamentales.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), sin necesidad de backend.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documenta capacidad multilingue; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Filtrado de smishing en pasarelas SMS: el clasificador puede procesar cada mensaje entrante como vector de 512 dimensiones y marcar como sospechosos los que caigan en las clases 1 o 2 antes de entregarlos al usuario.
- Extension de navegador o cliente de mensajeria: gracias a la compatibilidad con `onnxruntime-web` (WASM), el modelo puede ejecutarse localmente en el navegador para advertir al usuario sin enviar el texto a un servidor.
- Modulo de triaje en centros de atencion ciudadana: clasificacion automatica de reclamaciones o denuncias por fraude para priorizar los casos de suplantacion de servicios publicos.
- Enriquecimiento de pipelines de forense digital: etiquetado de corpus de mensajes incautados en investigaciones, separando avisos legitimos de intentos de phishing.
- Campanas de concienciacion: generacion de estadisticas agregadas sobre tipologias de fraude (subvencion, aduanas, suministros) a partir de grandes volumenes de mensajes etiquetados.
- Integracion en sistemas antifraude de operadores de telefonia: analisis por lotes de mensajes reportados por usuarios para alimentar listas de bloqueo.
- Despliegue en entornos con recursos limitados: al ser un artefacto ONNX de tamano minimo y ejecutable por CPU, puede correr en dispositivos de borde o contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento declarado por el autor es una "Calibration Accuracy" del 100,00 %, sin metodologia, conjunto de evaluacion ni comparacion con lineas base. No se debe considerar un benchmark reproducible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB, lo que indica un modelo de muy pequeno tamano que probablemente se ejecuta en CPU sin GPU.
- GPU recomendadas: no aplica; la inferencia puede realizarse en CPU con `onnxruntime`.
- Compatibilidad con GPU de consumo: si, en la practica cualquier equipo puede ejecutarlo dado su tamano minimo, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: `onnxruntime` (Python/C++), `onnxruntime-web` (WASM en navegador), servidores de inferencia compatibles con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria con datos verificables de parametros, contexto o rendimiento.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR-Government-Grant-UtilityBill-Phishing-ONNX | no disponible | no aplica (vector de 512) | no disponible | MIT | ONNX en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La arquitectura interna, el dataset de entrenamiento y la metodologia de evaluacion no estan documentados, lo que impide auditar el modelo o reproducir sus resultados.
- La cifra de "Calibration Accuracy" del 100,00 % carece de contexto metodologico y no debe usarse como garantia de rendimiento en produccion.
- No se especifican los idiomas soportados; dado el enfoque en servicios publicos egipcios (mencion de EGP), es probable que el entrenamiento este sesgado hacia un contexto linguistico y geografico concreto, pero no se confirma.
- No se documenta el vectorizador que transforma el texto en el tensor `features` de 512 dimensiones; sin el, el artefacto ONNX no es directamente utilizable de extremo a extremo.
- Riesgo de falsos positivos y negativos no cuantificado: un clasificador de phishing mal calibrado puede bloquear avisos legitimos o dejar pasar fraudes.
- Riesgo de deriva (drift): las campanas de smishing evolucionan rapidamente; sin reentrenamiento documentado, la eficacia puede degradarse con el tiempo.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte documentado.
- El modelo no debe usarse como unico mecanismo de decision en sistemas de bloqueo automatico sin supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Government-Grant-UtilityBill-Phishing-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
