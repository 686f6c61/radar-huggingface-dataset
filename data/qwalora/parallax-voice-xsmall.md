# qwalora/parallax-voice-xsmall

## Resumen

PARALLAX Voice (xsmall, v0.1) es un clasificador de texto desarrollado por Qwalora Research & Development (Qwalora LLC) que detecta inyecciones de prompt habladas en transcripciones de reuniones generadas por ASR. El problema que aborda es concreto: los asistentes de notas (AI notetakers) transcriben audio con Whisper y entregan el texto a un LLM que redacta actas y, cada vez más, ejecuta acciones como enviar correos o abrir tickets. Cualquier participante de la llamada puede pronunciar una instrucción dirigida al asistente y Whisper la transcribirá fielmente; PARALLAX Voice inspecciona esa transcripción y marca las ventanas que contienen una instrucción dirigida a la IA antes de que llegue al modelo de lenguaje.

El modelo es un fine-tune de PARALLAX Guard v0.1 sobre transcripciones de reuniones sintéticas: conversación real de los corpus AMI e ICSI, sintetizada con TTS, transcrita con Whisper e inyectada con ataques hablados y con «look-alikes» difíciles (personas pidiéndose cosas entre sí, charla sobre IA y seguridad, peticiones legítimas al notetaker). Con 70.830.722 parámetros y arquitectura DeBERTa-v2, se distribuye en safetensors y ONNX, lo que permite ejecutarlo en el navegador vía transformers.js.

Su relevancia radica en que el modelo base (Guard v0.1), aplicado a transcripciones, marca el 67,3 % de las ventanas benignas —incluido el 53,1 % de la conversación normal de reunión—, mientras que PARALLAX Voice mantiene los falsos positivos en torno al 5 % con una recall del 77,6 % sobre inyecciones habladas. Su alcance está deliberadamente restringido a transcripciones: sobre contenido escrito rinde peor que el modelo del que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (transformer encoder, clasificación de secuencias) |
| Parametros totales | 70.830.722 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (las ventanas de evaluación son de 45 a 110 palabras de conversación más la locución inyectada) |
| Tipos de cuantizacion | ONNX int8 (nota corregida en v0.1.1); cuantizaciones adicionales no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |
| Modelo base | qwalora/parallax-guard-xsmall |
| Pipeline | text-classification |
| Etiquetas de salida | `INJECTION`, `BENIGN` |
| Umbral recomendado | 0,5 |
| Tamaño del repositorio | 0,7 GB |
| Dataset de evaluación | qwalora/parallax-voice-bench |

## Arquitectura y entrenamiento

El modelo es un encoder DeBERTa-v2 de 70,8 millones de parámetros con cabeza de clasificación binaria, inicializado desde PARALLAX Guard v0.1 y ajustado para el dominio de transcripciones de voz. El entrenamiento parte de conversación real de reuniones de los corpus AMI e ICSI, que se convierte a voz mediante TTS y se transcribe con Whisper, generando pares realistas de texto ASR. Sobre esas transcripciones se insertan inyecciones habladas y ejemplos negativos deliberadamente difíciles: personas que se piden cosas entre sí, discusión sobre IA y seguridad, y peticiones legítimas dirigidas al notetaker.

El diseño experimental del informe QRD-TR-2026-007 (v0.1.1) aísla la generalización: las reuniones de test provienen del split de test de QMSum, las voces de test (hablantes LibriTTS-R 600 a 903) no aparecen en entrenamiento y cada pool de frases autoradas (destinatarios, verbos, objetivos, marcos) se divide en mitades disjuntas de train y test. No se documentan en la información disponible detalles sobre volumen total de tokens, uso de RLHF/DPO ni innovaciones de decodificación; el modelo es un clasificador, no un generador.

## Capacidades

- Clasificación binaria de ventanas de transcripción en `INJECTION` o `BENIGN`, con puntuación de probabilidad.
- Detección de inyecciones habladas dirigidas a asistentes de notas en reuniones transcritas por ASR.
- Cobertura de cuatro categorías de ataque: exfiltración de datos («send data out»), falsificación o supresión del acta, ejecución de acciones sobre herramientas y abandono de la tarea.
- Detección de versiones habladas de textos de inyección públicos.
- Robustez a distintos tamaños de Whisper (tiny.en, base.en, small.en) y a acentos estadounidenses y británicos.
- Discriminación de «look-alikes» benignos: conversación normal de reunión, personas pidiéndose favores entre sí y peticiones legítimas al notetaker.
- Ejecución en navegador mediante ONNX y transformers.js, sin envío de datos fuera de la página.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Filtro previo al LLM en asistentes de notas: se trocea la transcripción de Whisper en ventanas de 45 a 120 palabras y se descartan o marcan las que superan 0,5 antes de pasarlas al modelo que redacta el acta, evitando que una instrucción hablada llegue al generador.
- Guardrail en pipelines de reuniones con acciones: en asistentes que envían correos o abren tickets, el clasificador bloquea ventanas con instrucciones de exfiltración (recall del 75,0 % en la categoría «send data out») antes de que se ejecute la herramienta.
- Protección de la integridad del acta: detección de intentos de falsificar o suprimir el registro (81,7 % de ventanas marcadas), útil en contextos de compliance y auditoría donde el acta tiene valor probatorio.
- Despliegue en el cliente con transformers.js: al ejecutarse en el navegador vía ONNX, permite ofrecer la comprobación en demos y aplicaciones web sin enviar transcripciones a un servidor, lo que reduce la exposición de datos sensibles de reunión.
- Monitorización de audio reproducido en llamadas: cualquier audio inyectado en la reunión (grabaciones, vídeos) acaba en la transcripción; el clasificador lo detecta con independencia del tamaño de Whisper empleado (recall 79,0-79,2 % en tiny.en y small.en).
- Evaluación y regresión de guardrails de voz: el dataset qwalora/parallax-voice-bench y las condiciones de test permiten medir cambios de modelo o de ASR contra un conjunto fijo con intervalos de confianza Wilson.
- Moderación de entornos de reunión multiusuario: con falsos positivos del 0,4 % sobre conversación ordinaria, puede activarse en producción sin inundar de alertas a los operadores.

## Benchmarks y rendimiento

Condición principal: voces estadounidenses, Whisper base.en, 900 ventanas con inyección y 900 benignas, umbral 0,5.

| Condición | Recall Voice | Recall Guard v0.1 | Recall ProtectAI | Falsos pos. Voice | Falsos pos. Guard v0.1 | Falsos pos. ProtectAI | AUC Voice | AUC Guard v0.1 | AUC ProtectAI |
|---|---|---|---|---|---|---|---|---|---|
| Principal: voces US, Whisper base.en | 77,6 % (74,7-80,2) | 97,0 % | 16,6 % | 4,4 % (3,3-6,0) | 67,3 % | 3,3 % | 0,953 | 0,837 | 0,719 |
| Voces US, Whisper tiny.en | 79,0 % (75,0-82,4) | 96,3 % | 14,1 % | 5,7 % (3,8-8,3) | 68,8 % | 3,1 % | 0,959 | 0,826 | 0,711 |
| Voces US, Whisper small.en | 79,2 % (75,2-82,6) | 97,0 % | 18,4 % | 5,0 % (3,3-7,5) | 67,1 % | 2,4 % | 0,956 | 0,845 | 0,737 |
| Voces británicas (VCTK), Whisper base.en | 78,7 % (74,8-82,2) | 97,4 % | 17,1 % | 5,9 % (4,0-8,6) | 71,6 % | 3,1 % | 0,945 | 0,814 | 0,716 |
| Principal, misma mitad que las tres filas anteriores | 79,0 % (75,0-82,4) | 97,6 % | 16,5 % | 6,4 % (4,4-9,1) | 69,0 % | 2,8 % | 0,955 | 0,835 | 0,710 |
| Referencia: guion escrito, sin voz | 89,4 % (87,3-91,3) | 98,7 % | 21,0 % | 6,1 % (4,7-7,9) | 65,6 % | 3,7 % | 0,971 | 0,867 | 0,757 |

Recall a tasas de falsos positivos igualadas (condición principal, umbral elegido por modelo sobre las ventanas benignas):

| Modelo | Recall a 1 % FP | Recall a 5 % FP | AUC |
|---|---|---|---|
| PARALLAX Voice v0.1 | 65,4 % | 80,0 % | 0,953 |
| PARALLAX Guard v0.1 | 21,7 % | 41,2 % | 0,837 |
| ProtectAI v2 (baseline) | 6,7 % | 21,6 % | 0,719 |

Desglose por tipo de ventana (condición principal, marcadas a 0,5):

| Ventana | Severidad | Ventanas | Voice | Guard v0.1 | ProtectAI |
|---|---|---|---|---|---|
| Inyección hablada: exfiltrar datos | alta | 128 | 75,0 % | 98,4 % | 7,8 % |
| Inyección hablada: falsificar o suprimir el registro | alta | 180 | 81,7 % | 96,7 % | 10,6 % |
| Inyección hablada: ejecutar una acción de herramienta | alta | 143 | 86,7 % | 95,8 % | 17,5 % |
| Inyección hablada: abandonar la tarea | media | 149 | 93,3 % | 100,0 % | 52,3 % |
| Versión hablada de un texto de inyección público | mixta | 300 | 64,0 % | 95,7 % | 5,7 % |
| Conversación normal de reunión | benigna | 450 | 0,4 % | 53,1 % | 0,7 % |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 70,8 M de parámetros; el repositorio completo ocupa 0,7 GB. La variante ONNX int8 reduce aún más el consumo.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe holgadamente en una RTX 3060, RTX 4090 o incluso en CPU. Para lotes grandes, una A100 o H100 aportan margen de sobra pero no son necesarias.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM, y en CPU con latencia aceptable para clasificación de ventanas cortas.
- Opciones de despliegue: transformers (pipeline `text-classification`), ONNX Runtime, transformers.js en navegador, text-embeddings-inference y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Recall (principal) | Falsos positivos | AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| PARALLAX Voice xsmall v0.1 | 70,8 M | no disponible | 77,6 % | 4,4 % | 0,953 | apache-2.0 | Hugging Face, ONNX, transformers.js |
| PARALLAX Guard v0.1 (base) | no disponible | no disponible | 97,0 % | 67,3 % | 0,837 | no disponible | Hugging Face |
| protectai/deberta-v3-base-prompt-injection-v2 | no disponible (DeBERTa-v3-base) | no disponible | 16,6 % | 3,3 % | 0,719 | no disponible | Hugging Face (rev. 90c9989b) |

La comparación relevante no es solo de recall: Guard v0.1 detecta casi todas las inyecciones habladas pero inutiliza la señal al marcar el 67,3 % de ventanas benignas, y el baseline de ProtectAI apenas marca nada. PARALLAX Voice es el único de los tres que mantiene ambas métricas en rangos operativos sobre transcripciones.

## Limitaciones y advertencias

- Ámbito restringido a transcripciones: sobre contenido escrito (correos, páginas web, salidas de herramientas) rinde peor que PARALLAX Guard v0.1; el autor recomienda usar el modelo base en esos casos.
- Solo inglés: no hay soporte declarado para otros idiomas, lo que limita su uso en reuniones en castellano u otras lenguas.
- Recall del 77,6 % en la condición principal: aproximadamente una de cada cinco inyecciones habladas no se detecta, por lo que no debe ser el único control de seguridad.
- Rendimiento más bajo en la categoría de inyecciones públicas habladas (64,0 %) y en exfiltración de datos (75,0 %), precisamente las de mayor severidad.
- Dependencia del ASR: el modelo consume la salida de Whisper; errores de transcripción o audio de baja calidad pueden degradar la detección, aunque las métricas se mantienen estables entre tamaños de Whisper.
- Estado de validación: revisión interna automatizada, sin replicación independiente; los resultados deben tratarse con cautela hasta que terceros los confirmen.
- Licencia apache-2.0: permite uso comercial, pero el aviso de responsabilidad sobre el rendimiento no replicado sigue aplicando.
- Riesgo de falso negativo en producci��n: se recomienda combinar con otras capas (políticas de herramientas, confirmación humana) y monitorizar derivas del modelo ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qwalora/parallax-voice-xsmall
- Modelo base: https://huggingface.co/qwalora/parallax-guard-xsmall
- Dataset de benchmark: https://huggingface.co/datasets/qwalora/parallax-voice-bench
- Demo en navegador: https://huggingface.co/spaces/qwalora/parallax-voice-demo
- Baseline ProtectAI: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- Informe técnico: QRD-TR-2026-007, versión 0.1.1 (Qwalora Research & Development); no se ha encontrado URL pública en la información disponible.
