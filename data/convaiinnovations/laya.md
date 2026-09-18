# convaiinnovations/laya

## Resumen

Laya es un modelo de decisión no autorregresivo de tipo System 1 desarrollado por Convai Innovations. A diferencia de un LLM generativo, no produce texto libre: recibe un estado (un correo, un ticket, un documento JSON o texto plano) junto con una o varias preguntas tipadas y devuelve respuestas también tipadas acompañadas de probabilidades calibradas y puntuaciones de confianza. Al no generar lenguaje natural, elimina por diseño los errores de parseo y las alucinaciones de formato que aparecen cuando se fuerza a un modelo generativo a emitir etiquetas o valores estructurados.

El checkpoint publicado es la versión fine-tuned del modelo base, con especialización en triaje de correo (spam, phishing, enrutado departamental), modelado de trayectorias conversacionales mediante aprendizaje por diferencia temporal con TD(lambda = 1.0) y calibración de temperatura por cardinalidad de opciones. La arquitectura combina un backbone ModernBERT-large bidireccional de 395 M de parámetros, completamente ajustado, con una cabeza de decisión entrenada desde cero (dos capas transformer, un scorer de marcadores de opción y una cabeza de actuar/escalar), lo que da un total de 421.293.830 parámetros. El presupuesto de entrada es de 512 tokens por pregunta, incluyendo enunciado, opciones y estado.

Su relevancia actual radica en el nicho de enrutado, clasificación y decisiones calibradas en producción: el modelo reporta ECE (Expected Calibration Error) muy bajo en varias familias de tareas, lo que permite automatización selectiva con umbrales de confianza, despliegue en local o air-gapped sin egreso de datos, y una licencia Apache 2.0 sin restricciones comerciales. Los metadatos de HuggingFace indican 33 likes y 0 descargas, y fechas de creación y actualización de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional encoder-only; backbone ModernBERT-large (395 M, fully fine-tuned) mas cabeza de decision propia (2 capas transformer, scorer de marcadores de opcion, cabeza act/escalate) |
| Parametros totales | 421.293.830 (421 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens por pregunta (pregunta + opciones + estado) |
| Tipos de cuantizacion | no disponible (el repo pesa 0,8 GB en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no es un decoder generativo sino un encoder bidireccional con una cabeza de decisión. El backbone es ModernBERT-large (395 M de parámetros) y se ajusta por completo, preservando la atención bidireccional que, según la model card, resulta útil para capturar contradicciones en tareas de verificación de hechos. Sobre él se apila una cabeza entrenada desde cero formada por dos capas transformer, un scorer de marcadores de opción y una cabeza de actuar/escalar. El mecanismo de decisión es el de marcadores de opción: cada opción se puntúa en su propio token `[MASK]` y después se aplica un softmax restringido al conjunto de opciones de esa pregunta. El modelo admite tres tipos de pregunta: `choice` (opción seleccionada, probabilidades por opción y confianza calibrada), `score` (nivel esperado en una rúbrica ordinal, distribución y confianza) y `noul` (probabilidad booleana calibrada P(true) entre 0,0 y 1,0). Todas las preguntas de una petición se evalúan en un único forward pass.

El entrenamiento se realizó con RLCD (Reinforcement Learning for Calibrated Decisions). La política emite una distribución de probabilidad, la exploración añade ruido gaussiano de media cero a los logits y la recompensa es una regla de puntuación estrictamente propia (log score y spherical score, más ranked probability score para las preguntas ordinales), de modo que el máximo de recompensa esperada solo se alcanza emitiendo probabilidades verdaderas y calibradas. Para diálogos multi-turno se emplea aprendizaje por diferencia temporal con objetivos Monte Carlo (TD(lambda = 1.0)) sobre cortes de prefijo, lo que evita la filtración del desenlace. Los datos son, según el autor, 100 % anotados por humanos y sin atajos sintéticos. El ajuste consistió en 7.313 actualizaciones, una época y aproximadamente 1,96 horas de cómputo, con temperaturas de calibración ajustadas de 1,637, 1,251 y 1,983 según el número de opciones.

## Capacidades

- Clasificación y enrutado con probabilidades calibradas: enrutado de intención y de cliente con 99,1 % de accuracy y ECE de 0,009 reportados.
- Triaje de correo: detección de spam y phishing y enrutado departamental, con 73,2 % de accuracy y ECE de 0,017.
- Moderación y seguridad de contenido: 96,7 % de accuracy con ECE de 0,061.
- Análisis de emoción y tono: 90,6 % de accuracy con ECE de 0,018.
- Verificación de hechos e inferencia: 88,3 % de accuracy con ECE de 0,054, apoyada en atención bidireccional para detectar contradicciones.
- Preguntas de tipo booleano calibrado (`noul`), útil para decidir si actuar o escalar a un humano.
- Preguntas de tipo ordinal (`score`), para rúbricas con niveles 0, 1, 2, etcétera.
- Modelado de trayectorias conversacionales multi-turno mediante TD(lambda = 1.0), con asignación temporal de crédito en lugar de instantáneas estáticas de estado.
- Decisión de actuar o escalar mediante una cabeza dedicada, apta para automatización selectiva con umbrales de confianza.
- Procesamiento por lotes de múltiples preguntas en un solo forward pass.
- No genera texto libre: no hay soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de un agente generativo.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Triaje de bandeja de entrada corporativa: el modelo recibe el asunto y el cuerpo del correo y devuelve el departamento destino, la urgencia y una probabilidad de phishing. Con 512 tokens de presupuesto por pregunta y ECE de 0,017, es adecuado para enrutar automáticamente y escalar solo los casos de baja confianza.
- Automatización selectiva de atención al cliente: usando la cabeza act/escalate y un umbral de confianza (por ejemplo, 0,85), el modelo reporta 92,2 % de accuracy con 50 % de cobertura, lo que permite automatizar la mitad del volumen y derivar el resto a agentes humanos.
- Moderación de contenido en plataformas: clasificación de contenido dañino con 96,7 % de accuracy y ECE de 0,061, integrable en un pipeline previo a la revisión humana para priorizar la cola de moderación.
- Enrutado de intención en asistentes conversacionales: dado un turno del usuario, asignar la intención a una de N opciones con distribución de probabilidad, útil para decidir qué flujo o skill activar.
- Verificación de afirmaciones en documentación o soporte: al recibir un estado y una afirmación, el tipo `noul` devuelve P(true) calibrada; con 88,3 % de accuracy y atención bidireccional, sirve para detectar contradicciones entre fuentes.
- Análisis de tono y sentimiento en encuestas o conversaciones: asignación de categoría emocional con 90,6 % de accuracy y ECE de 0,018, aprovechable para paneles de calidad y alertas tempranas.
- Cumplimentación de formularios estructurados a partir de texto: como la salida es tipada (opción o nivel ordinal), se evita el parseo frágil de JSON generado y se puede escribir directamente en una base de datos.
- Despliegue air-gapped en sectores regulados: al ejecutarse en local sobre CPU, MPS de Apple o GPU de gama media y no requerir egreso de datos, encaja en entornos con requisitos de GDPR o HIPAA.
- Preprocesado de alto volumen en pipelines batch: con 721,4 ms para 50 preguntas en GPU, permite etiquetar grandes lotes de tickets o correos sin coste por token.

## Benchmarks y rendimiento

Resultados reportados en la model card para este checkpoint:

| Metrica / dimension | TypeSafe Jev (publicado) | Laya (checkpoint fine-tuned) |
|---|---|---|
| Latencia P50 (1 pregunta) | ~400 ms de media (70 a 500 ms, mejor 150 ms) | 38,4 ms (p95: 42,1 ms) |
| Latencia por lotes (10 preguntas) | ~1.500 ms (serial) / ~400 ms | 156,0 ms (p95: 158,4 ms) |
| Latencia por lotes (50 preguntas) | varios segundos / limitado por rate limits | 721,4 ms |
| Accuracy de benchmark | 67,8 % (4 flujos de produccion) | 83,8 % macro accuracy in-task |
| Intencion y enrutado de cliente | ~95 a 98 % de acuerdo | 99,1 % accuracy (ECE: 0,009) |
| Moderacion y seguridad de contenido | ~92 a 95 % de acuerdo | 96,7 % accuracy (ECE: 0,061) |
| Inferencia y verificacion de hechos | no reportado por separado | 88,3 % accuracy (ECE: 0,054) |
| Tareas de seguimiento de instrucciones | conjunto interno propietario | 87,8 % in-task / 86,3 % zero-shot |
| Triaje de correo y phishing | flujo personalizado del proveedor | 73,2 % accuracy (ECE: 0,017) |
| Automatizacion selectiva (50 % cobertura) | afirma escalado a humanos | 92,2 % accuracy (ECE: 0,041) |
| Pesos y codigo | cerrado / API propietaria | Apache 2.0, 100 % abierto |
| Coste de inferencia | 0,042 USD por 1 M de tokens de entrada | 0,00 USD en self-hosting |
| Modelado de trayectoria multi-turno | instantaneas estaticas de estado | TD(lambda = 1.0) sobre prefijos |
| Modo de despliegue | solo nube con egreso | air-gapped / local / on-device |

Evaluacion de este checkpoint:

| Conjunto | Macro accuracy | Macro ECE |
|---|---|---|
| Test in-task | 0,838 | 0,060 |
| Zero-shot (familias de tarea no vistas) | 0,651 | 0,207 |

Desglose por familia de tarea:

| Familia | Accuracy | ECE |
|---|---|---|
| Intencion y enrutado | 0,991 | 0,009 |
| Moderacion y seguridad | 0,967 | 0,061 |
| Emocion y tono | 0,906 | 0,018 |
| Triaje de correo y phishing | 0,732 | 0,017 |
| Inferencia y verificacion de hechos | 0,883 | 0,054 |

Los diagramas de fiabilidad y las curvas de riesgo-cobertura detallados se encuentran en el directorio `eval/` del repositorio. No se han publicado resultados de MMLU, HumanEval ni GSM8K, y no procede compararlos porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada en funcion del tamano (421 M de parametros): aproximadamente 1,7 GB en FP32, 0,85 GB en FP16/BF16, 0,43 GB en INT8 y 0,21 GB en INT4, sin contar activaciones ni overhead del runtime.
- El repositorio publicado ocupa 0,8 GB, coherente con pesos en precision de 16 bits.
- Cabe con holgura en GPU de consumo: cualquier RTX con 4 GB o mas (RTX 3050, 3060, 4060, 4090) es suficiente incluso en FP32.
- La model card indica que se ejecuta en GPU commodity, MPS de Apple y CPU, lo que permite despliegue en portatiles y nodos sin acelerador.
- GPU de centro de datos (A100, H100) no son necesarias, aunque pueden aprovecharse para maximizar el throughput en mini-batches paralelos.
- Opciones de despliegue: la libreria oficial `laya` (`pip install laya`) con `laya.load("convaiinnovations/laya")`, y por tag `endpoints_compatible` tambien es compatible con HuggingFace Inference Endpoints. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI.
- Latencia reportada en GPU: 38,4 ms de mediana para 1 pregunta (p95 42,1 ms), 156,0 ms para 10 preguntas en un solo forward pass y 721,4 ms para 50 preguntas. El rango citado para el forward pass completo es de 33 a 38 ms.
- Throughput aproximado derivado de esas cifras: en torno a 26 preguntas por segundo en regimen de 1 pregunta y en torno a 69 preguntas por segundo en lotes de 50, sobre hardware GPU no especificado.

## Comparativa con modelos similares

La unica alternativa con datos en la informacion disponible es TypeSafe Jev, que se incluye en la tabla de benchmarks anterior. La model card lo describe como propietario, cerrado y solo en nube, con coste recurrente de 0,042 USD por millon de tokens de entrada, mientras que Laya es Apache 2.0, self-hostable y sin coste de inferencia.

| Criterio | Laya | TypeSafe Jev |
|---|---|---|
| Parametros | 421 M (395 M de backbone + cabeza) | no disponible |
| Contexto | 512 tokens por pregunta | no disponible |
| Accuracy de benchmark | 83,8 % in-task | 67,8 % |
| Calibracion | Macro ECE 0,060 in-task | no disponible |
| Licencia | Apache 2.0 | propietaria |
| Disponibilidad | pesos abiertos en HuggingFace | API en la nube |

No hay informacion disponible sobre otros modelos comparables de la misma categoria (clasificadores calibrados con salida tipada) en el material proporcionado. Conviene senalar que un encoder clasico como DeBERTa o RoBERTa fine-tuneado ocuparia el mismo nicho funcional, pero no se dispone de datos comparativos verificables en esta ficha.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuesta en lenguaje natural, resumen o explicacion necesita combinarlo con un LLM aparte.
- La precision zero-shot cae de forma notable respecto al rendimiento in-task (0,651 de accuracy y ECE de 0,207 frente a 0,838 y 0,060), por lo que en familias de tarea no vistas la calibracion se degrada y no conviene confiar en umbrales de confianza trasladados sin recalibrar.
- El triaje de correo y phishing es la familia con peor accuracy reportada (0,732), por debajo del resto; en un escenario de seguridad conviene mantener revision humana.
- Las tareas ordinales y booleanas dependen de una rubrica o definicion de opciones bien disenada; opciones ambiguas o solapadas degradaran la calibracion.
- La ventana de 512 tokens por pregunta es el limite practico: estados largos (correos extensos, documentos grandes) requieren truncado o troceado, con la perdida de contexto que ello implica.
- No se declaran idiomas soportados. El backbone ModernBERT esta entrenado mayoritariamente en ingles y la model card esta en ingles, pero no hay confirmacion oficial del comportamiento multilingue, asi que debe validarse antes de usarlo en castellano u otros idiomas.
- No se documentan sesgos conocidos ni evaluaciones de sesgo en la informacion disponible.
- El riesgo de alucinacion de contenido es nulo por diseno, ya que la salida se restringe a un conjunto de opciones o a un valor calibrado; el riesgo residual es de mala calibracion o de etiquetas de opcion mal definidas.
- La licencia Apache 2.0 permite uso comercial sin restricciones declaradas, pero procede revisar las condiciones de los datos de entrenamiento anotados por humanos si se pretende redistribuir el modelo para fines regulados.
- Los datos de latencia no especifican la GPU empleada, por lo que las cifras deben tomarse como referencia y no como garantia en hardware distinto.
- El modelo tiene 0 descargas y 33 likes en HuggingFace, sin adopcion publica documentada ni ecosistema de terceros; el soporte depende del autor.
- Las fechas de creacion y actualizacion del repositorio (septiembre de 2026) son posteriores a la fecha habitual de referencia, lo que sugiere metadatos anomales o generados automaticamente.

## Enlaces

- HuggingFace: https://huggingface.co/convaiinnovations/laya
- Repositorio de evaluacion (directorio `eval/` dentro del modelo): https://huggingface.co/convaiinnovations/laya/tree/main/eval
- Paquete de Python `laya`, instalable con `pip install laya` (no se ha encontrado enlace a repositorio publico en la informacion disponible)
- Pagina del autor en HuggingFace: https://huggingface.co/convaiinnovations

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los unicos resultados obtenidos fueron paginas del servicio de correo TIM Mail, sin relacion con esta ficha. Por tanto, no hay enlaces adicionales a papers, blogs, repositorios o demos que se puedan citar.
