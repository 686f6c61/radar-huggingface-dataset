# elnemer7/ElNeMeR-Freelancer-RemoteTask-WalletTrap-ONNX

## Resumen

ElNeMeR-Freelancer-RemoteTask-WalletTrap-ONNX es un clasificador binario-multiclase exportado a formato ONNX, desarrollado por el autor independiente elnemer7 (Eng. Mahmoud ElNemer) dentro de una flota de 60 modelos denominada "World Sovereign & Humanitarian Forensic AI Fleet v17.0". El modelo se presenta como una herramienta de defensa forense digital orientada a proteger a freelancers y trabajadores remotos frente a dos amenazas concretas: estafas de falsa custodia (fake escrow) con comisiones de enlace fraudulentas en encargos de traducción o diseño, y archivos de brief de cliente troyanizados que distribuyen infostealers.

Tecnicamente, se trata de un modelo de clasificación de texto que recibe un tensor de características `float32` de forma `[batch_size, 512]` y devuelve tres probabilidades correspondientes a las clases `legitimate_freelance_or_work_chat`, `fake_escrow_linking_fee_freelancer_scam` y `malicious_project_archive_infostealer_lure`. Está exportado con ONNX Opset 14 y es compatible con `onnxruntime` y `onnxruntime-web` (WASM), lo que permite despliegue tanto en servidor como en navegador.

La relevancia del modelo es acotada pero específica: cubre un nicho de seguridad para trabajadores autónomos en regiones árabes y globales, un vector de fraude poco atendido por los clasificadores de contenido generalistas. No obstante, la información publicada es muy limitada: el repositorio tiene 0 GB, no se detalla la arquitectura interna, no se especifican los datos de entrenamiento y la única métrica reportada ("Calibration Accuracy: 100.00%") no viene acompañada de un conjunto de evaluación ni de una metodología reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de texto exportado a ONNX; arquitectura base no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 512 características `float32`) |
| Tipos de cuantizacion | no disponible (formato ONNX Opset 14; compatible con `onnxruntime` y `onnxruntime-web` WASM) |
| Idiomas soportados | no disponible (la model card menciona freelancers árabes y globales, sin listado formal) |
| Licencia | MIT |
| Formato de pesos | ONNX (Opset 14) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card únicamente especifica la interfaz de inferencia: un tensor de entrada llamado `features` de tipo `float32` con forma `[batch_size, 512]`, y una salida de tres probabilidades. Esto sugiere un clasificador sobre representaciones vectoriales precomputadas de 512 dimensiones (posiblemente embeddings de texto agregados), pero el autor no documenta el extractor de características ni el codificador subyacente.

Tampoco se publican datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de clases, origen de las muestras), ni sobre procesos de ajuste como RLHF, DPO o calibración post-entrenamiento. La única cifra reportada es una "Calibration Accuracy" del 100,00%, sin descripción del conjunto de validación, del umbral de decisión ni del protocolo de medición, por lo que no puede considerarse un resultado verificable.

## Capacidades

- Clasificación de mensajes y conversaciones de trabajo en tres categorías: legítima, estafa de falsa custodia con comisión de enlace y archivo de proyecto malicioso con infostealer.
- Detección de patrones de fraude específicos del sector freelance (encargos de traducción, diseño y tareas remotas).
- Salida de probabilidades por clase, apta para umbrales de decisión configurables en pipelines de moderación.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), lo que permite integración en extensiones o clientes web sin backend.
- Compatibilidad con `onnxruntime` en servidor para despliegues por lotes o en tiempo real.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo thinking.

## Casos de uso

- Moderación de mensajes en plataformas de freelance: integración del clasificador en el chat interno para marcar automáticamente conversaciones con patrones de falsa custodia o solicitud de comisiones de enlace antes de que el trabajador realice un pago.
- Filtrado de adjuntos en bandejas de entrada de encargos: uso de la clase 2 para señalar archivos de brief que acompañan a mensajes sospechosos y derivarlos a un análisis antimalware antes de su apertura.
- Extensión de navegador para trabajadores remotos: despliegue del modelo en WASM dentro de una extensión que evalúe en local los mensajes de portales de empleo y marketplaces, sin enviar contenido sensible a un servidor.
- Triaje en equipos de respuesta a incidentes: clasificación previa de reportes de usuarios que denuncian estafas de pago para priorizar la investigación forense manual.
- Formación y concienciación: uso del modelo como demostración interactiva que muestre a freelancers ejemplos clasificados de estafas reales y explique los indicadores detectados.
- Enrutado en sistemas de soporte: derivación automática de tickets con probabilidad alta en la clase 1 o 2 a un equipo especializado en fraude, reduciendo el tiempo de primera respuesta.
- Investigación académica sobre fraude digital: corpus etiquetado y modelo de referencia para estudiar la prevalencia de estos vectores en comunidades de trabajadores remotos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente declara una "Calibration Accuracy" del 100,00%, sin conjunto de evaluación, tamaño de muestra ni metodología, por lo que no se presenta como resultado comparable.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y no se especifica el número de parámetros, aunque por la interfaz (entrada de 512 dimensiones y tres clases de salida) cabe esperar un modelo de muy pequeño tamaño.
- GPU recomendadas: no disponibles; para un clasificador de esta magnitud la inferencia en CPU es probablemente suficiente, pero el autor no publica requisitos.
- GPU de consumo: no se confirma compatibilidad explícita con RTX 4090, RTX 3090 u otras; por el formato ONNX y el tamaño aparente, debería ejecutarse en CPU sin GPU dedicada.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` con backend WASM para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificación forense de fraude a freelancers) con parámetros, contexto y licencia documentados.

## Limitaciones y advertencias

- La métrica "Calibration Accuracy: 100,00%" no está respaldada por un conjunto de evaluación público ni por una metodología descrita; debe tratarse como una afirmación del autor, no como un resultado verificado.
- No se documenta la arquitectura interna, el corpus de entrenamiento ni el proceso de calibración, lo que impide auditar el comportamiento del modelo y su posible sobreajuste.
- El repositorio figura con 0,0 GB y 0 descargas, lo que impide confirmar que los pesos estén efectivamente publicados y sean descargables.
- No se especifican los idiomas soportados; aunque la model card menciona freelancers árabes y globales, no hay listado formal ni evaluación por idioma.
- Riesgo de sesgo y de falsos positivos en conversaciones legítimas que mencionen pagos, custodia o archivos adjuntos, dado que no se publican matrices de confusión ni tasas de error por clase.
- El modelo clasifica texto o características agregadas; no analiza binarios ni archivos comprimidos, por lo que la detección de infostealers se limita a la descripción textual del adjunto, no a su contenido.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene mantener una cláusula de exención de responsabilidad en producción.
- No debe usarse como único mecanismo de decisión en bloqueos o acusaciones de fraude; se recomienda combinarlo con revisión humana y otras señales.
- La model card incluye datos de contacto y enlaces promocionales del autor; no constituyen aval técnico ni auditoría independiente del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Freelancer-RemoteTask-WalletTrap-ONNX
- Plataforma forense humanitaria del autor: https://detector.elnemer-ai.com
- Portal corporativo del autor: https://elnemer-ai.com
