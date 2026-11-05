# litert-community/Phocinae-Largha-150M-LiteRT

## Resumen

Phocinae-Largha-150M-LiteRT es la conversión a LiteRT (el formato de ejecución de Google para inferencia en dispositivo, sucesor de TensorFlow Lite) del modelo Phocinae-Largha-150M-v1, un clasificador de "decisiones tipadas" desarrollado por el proyecto Phocinae. A diferencia de un modelo generativo, Largha recibe un texto de estado y un conjunto de preguntas tipadas sobre él (sí/no, elección única y puntuación ordinal) y devuelve, en un único forward pass, probabilidades calibradas para cada pregunta. No genera texto en ningún caso.

El modelo se construye sobre el encoder `jhu-clsp/mmBERT-small` (arquitectura ModernBERT, aproximadamente 150 millones de parámetros) al que se añade una cabeza de dos capas, un scorer de marcadores y una "act head" que estima la conveniencia de actuar. Está licenciado bajo Apache-2.0 y soporta inglés y chino. Su relevancia actual reside en la combinación de tres factores: es un modelo de decisión estructurada (no de chat), está empaquetado para ejecución en Android con aceleración por GPU y NPU, y ofrece latencias medidas de una sola pregunta en 15,3 ms sobre GPU con ventana de 256 tokens y 19,7 ms sobre NPU con ventana de 384 tokens en un Galaxy S26.

Este repositorio concreto no contiene los pesos en formato PyTorch, sino seis grafos LiteRT (tres ventanas de contexto por dos formas de embeddings), la tabla de tokens, la cabeza de acción, el tokenizador y un host en Python. La referencia de validación es el runtime fp32 del publicador, `phocinae-server` 0.1.5, que reprodujo 1.811 aciertos sobre 2.000 decisiones (0,9055) del split público de typed-decisions.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT (base: jhu-clsp/mmBERT-small) con cabeza de decisión de dos capas, scorer de marcadores y act head |
| Parametros totales | 150M (según nombre del modelo; no se detalla desglose) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256, 384 y 512 tokens (tres grafos independientes) |
| Tipos de cuantizacion | Pesos FULLY_CONNECTED en float16 (con DEQUANTIZE); embeddings en int8 (forma int8emb) o tabla de embeddings fp16 en host (forma embeds); act head en fp32 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT (.tflite), tabla de tokens binaria fp16 (.bin + .json con SHA-256) |

## Arquitectura y entrenamiento

La arquitectura parte de `jhu-clsp/mmBERT-small`, un encoder ModernBERT multilingüe de aproximadamente 150M de parámetros. Sobre la representación del token CLS se apilan una cabeza de dos capas, un scorer de marcadores y una act head independiente que produce `act_logits` [1,2] a partir de `pooled_cls` [1,384] y un vector de features [1,4]. El modelo no decodifica texto: cada pregunta tipada se resuelve mediante clasificación sobre la representación del estado, devolviendo distribuciones de probabilidad calibradas en un solo paso.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona que el modelo fue entrenado por el proyecto Phocinae y validado contra el split público de typed-decisions, con pruebas de robustez frente al orden de las opciones: al invertir las opciones cambiaron 13 de 600 respuestas, y bajo tres órdenes aleatorios cambiaron 11, 9 y 6. La conversión a LiteRT se realizó con litert-torch 0.10.0 y se verificó en un Galaxy S26 el 10 de octubre de 2026.

## Capacidades

- Clasificación de decisión tipada sobre un texto de estado: preguntas sí/no (`noul`), elección única (`choice`) y puntuación ordinal (`score`).
- Salida de probabilidades calibradas por pregunta en un único forward pass, sin generación de texto.
- Act head que estima la probabilidad de que sea conveniente actuar (`act_probability`).
- Procesamiento de estados largos hasta la ventana configurada (256, 384 o 512 tokens), con indicador de truncado (`state_truncated`).
- Ejecución en dispositivo (on-device) en Android con perfiles para CPU, GPU y NPU.
- Soporte multilingüe limitado a inglés y chino.
- No soporta tool calling, function calling, agentes multi-paso ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Enrutado de decisiones en sistemas de release: dado un estado textual de un despliegue (logs, health checks, métricas), el modelo responde si continuar, retener o revertir, con probabilidades que permiten fijar umbrales de automatización. El ejemplo de la model card ilustra exactamente este escenario con tres preguntas simultáneas.
- Triaje de alertas en operaciones: clasificar un incidente en niveles ordinales (rutina, vigilancia, degradado, crítico) y decidir si se debe avisar al ingeniero de guardia, todo en una sola pasada y con latencia de milisegundos.
- Moderación o filtrado de contenido con criterios configurables: formular preguntas sí/no sobre un texto y usar la probabilidad resultante como señal de bloqueo o revisión.
- Clasificación de tickets de soporte en aplicaciones móviles: al ejecutarse vía LiteRT en Android con aceleración NPU, permite categorizar y priorizar incidencias sin enviar el texto a un servidor.
- Extracción de etiquetas estructuradas en pipelines de datos: sustituir reglas heurísticas por preguntas tipadas con probabilidades calibradas para alimentar sistemas de decisión posteriores.
- Evaluación de riesgo en flujos automatizados: la pregunta de tipo `score` devuelve una distribución sobre niveles ordinales, útil para disparar acciones escalonadas según el nivel y la confianza.
- Asistentes de campo con conectividad limitada: al ser un modelo de 150M ejecutable en dispositivo, puede incorporarse en apps Android que necesiten clasificar texto localmente sin depender de la nube.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la validación del split público de typed-decisions con el runtime de referencia y a latencias medidas en dispositivo:

| Metrica | Valor |
|---|---|
| Acierto sobre split público (2.000 decisiones, referencia fp32) | 1.811 / 2.000 = 0,9055 |
| Estabilidad ante inversión de opciones | 13 de 600 respuestas cambiadas |
| Estabilidad ante tres órdenes aleatorios | 11, 9 y 6 respuestas cambiadas de 600 |
| Latencia GPU, ventana 256, Galaxy S26 | 15,3 ms por pregunta |
| Latencia NPU, ventana 384, Galaxy S26 | 19,7 ms por pregunta |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es coherente con la naturaleza del modelo, que no es generativo.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo está pensado para inferencia en dispositivo. Los grafos ocupan entre 92,7 MB (forma embeds, ventana 256) y 195,8 MB (forma int8emb, ventana 512), más la tabla de tokens de 196,6 MB en la forma embeds.
- GPU recomendadas: no se especifican modelos de GPU de servidor; la validación se realizó en un Galaxy S26 (GPU y NPU integradas).
- Cabe en GPU de consumo: sí, por tamaño, aunque el formato LiteRT está orientado a móvil y edge; en escritorio se ejecuta vía el host Python incluido.
- Opciones de despliegue: LiteRT (intérprete de Google), host Python `host/phocinae_litert.py`, descriptor `hfmodels.json` para hfmodels-android. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y tarea.
- Latencia y throughput: 15,3 ms por pregunta en GPU (ventana 256) y 19,7 ms en NPU (ventana 384) en Galaxy S26; el resto de combinaciones no se detalla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Phocinae-Largha-150M-LiteRT | 150M | 256/384/512 | Clasificación de decisión tipada | Apache-2.0 | LiteRT |
| jhu-clsp/mmBERT-small (base) | ~150M | No disponible en la información | Encoder multilingüe | No disponible en la información | safetensors |
| Phocinae-Largha-150M-v1 (original) | 150M | No disponible en la información | Clasificación de decisión tipada | Apache-2.0 | PyTorch (referencia) |

No se dispone de datos de benchmarks comparativos con otros clasificadores de decisión en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto; cualquier uso que requiera respuestas en lenguaje natural queda fuera de su alcance.
- Solo soporta inglés y chino; el rendimiento en otros idiomas no está documentado.
- La ventana máxima es de 512 tokens; estados más largos se truncan (el campo `state_truncated` lo indica).
- Las probabilidades son calibradas pero no infalibles: en el ejemplo de la model card, la confianza de la elección `hold` es de 0,44, lo que refleja incertidumbre real y exige umbrales bien definidos en producción.
- La sensibilidad al orden de las opciones, aunque baja (13 de 600 con inversión), existe y debe considerarse en diseños de prompts con criterios reordenables.
- No se documentan sesgos conocidos, datos de entrenamiento ni evaluación de alucinación (no aplica generación, pero sí posibles clasificaciones erróneas).
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento no están descritos en detalle, lo que limita la auditoría.
- El repositorio contiene artefactos LiteRT, no pesos PyTorch; para reentrenamiento o inspección fina hay que acudir al modelo original `Phocinae/Phocinae-Largha-150M-v1`.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/Phocinae-Largha-150M-LiteRT
- Modelo base: https://huggingface.co/Phocinae/Phocinae-Largha-150M-v1
- Encoder base: https://huggingface.co/jhu-clsp/mmBERT-small
- Runtime de referencia: https://github.com/Phocinae/phocinae-server
