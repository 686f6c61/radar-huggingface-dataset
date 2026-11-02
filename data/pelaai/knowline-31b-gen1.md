# PelaAI/KnowLine-31B-Gen1

## Resumen

KnowLine-31B-Gen1 es un modelo de decisión ("decision model") desarrollado por PelaAI, presentado como la primera entrega de su línea "System One" sobre una base densa de Gemma 4. No es un modelo generativo al uso: recibe un estado (texto o conversación) junto con hasta 64 preguntas tipadas (sí/no, elección entre k opciones, o puntuación sobre una rúbrica) y devuelve, para cada pregunta, una distribución de probabilidad sobre sus opciones en un único forward pass, sin generar texto. Está afinado sobre `google/gemma-4-31B-it` mediante LoRA SFT y posteriormente promediado con el modelo base.

El modelo resuelve el problema de convertir un LLM generativo en un clasificador de decisiones calibrado y de baja latencia, pensado para integrarse en pipelines de agentes donde se necesita una respuesta probabilística estructurada en lugar de texto libre. Es relevante porque mantiene la torre de visión del modelo base (aunque se entrenó solo con texto) y porque su interfaz es compatible con clientes existentes de la familia KnowLine y de Jev, cambiando únicamente la URL base o el nombre del modelo.

Con 31.273.088.876 parámetros (dato real de safetensors), licencia Apache-2.0 y soporte de inglés y chino (simplificado y tradicional), se distribuye en pesos bf16 de aproximadamente 63 GB. La model card reporta una puntuación de 70,13 en la suite pública Decision Index 0.3, con calibración incorporada en los pesos mediante una temperatura plegada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Gemma 4), con torre de visión heredada del modelo base; cabeza de clasificación sobre tokens de etiqueta |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en la release; no se probó FP8 al cargar según la model card; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés, chino simplificado, chino tradicional |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, ~63 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it`, un transformer denso de unos 31B parámetros, y se afina con LoRA SFT (rango 32, alpha 64, solo el modelo de lenguaje) durante una época, tras lo cual el adaptador se fusiona en pesos bf16. El resultado se promedia tensor a tensor con el modelo base según 0,75 × afinado + 0,25 × gemma-4-31B-it. La torre de visión permanece sin cambios respecto al base y el tokenizador es el de Gemma 4 (no el de los modelos KnowLine basados en Qwen).

La innovación principal no está en la arquitectura sino en el paradigma de inferencia: cada pregunta se resuelve con un único forward pass y la salida es la probabilidad del token de etiqueta de cada opción, sin decodificación autoregresiva. Además, se pliega una temperatura de lectura T = 1,44 en el peso de la normalización final y en el soft-cap de logits, y el front end lee las preguntas de puntuación a temperatura efectiva 1,0 mediante `temperatures.json`. El proceso de datos se describe como un bucle dirigido por un agente que identifica debilidades, propone grupos de datos, los construye y descontamina, entrena, evalúa y acepta o rechaza el cambio según la evidencia.

## Capacidades

- Clasificación de decisiones estructuradas: responde hasta 64 preguntas tipadas (sí/no, elección entre k opciones, puntuación sobre rúbrica) con distribución de probabilidad por opción.
- Inferencia sin generación de texto: un forward pass por pregunta, lo que reduce latencia frente a esquemas generativos.
- Probabilidades calibradas: temperatura incorporada en los pesos; ECE aproximado de 0,012-0,021 y Brier de 0,23-0,26 en la suite pública según la model card.
- Capacidades de visión zero-shot: conserva la torre de visión del base aunque se entrenó solo con texto; reporta 69,9 en la reconstrucción de la suite pública de visión Decision Index 0.3.1 y 69,3 en la suite oficial.
- Detección de cajas delimitadoras zero-shot: devuelve bounding boxes para objetivos nombrados en una imagen (ScreenSpot centre-hit 81,3; RefCOCO IoU≥0.5 77,3).
- Multilingüe: inglés, chino simplificado y chino tradicional.
- Compatibilidad de interfaz: clientes Jev solo cambian la URL base; usuarios de otros KnowLine solo cambian el nombre del modelo.
- Servicio con lectura doble de peticiones cortas (`knowline_server.py`), activada por defecto y desactivable con `--no-read-twice`.

## Casos de uso

- Enrutamiento y triaje en agentes: dado el estado de una conversación, decidir con probabilidad si escalar a un humano, ofrecer reembolso o continuar el flujo, usando preguntas de tipo sí/no y elección.
- Moderación y clasificación de intención: puntuar tono, urgencia o categoría de un mensaje entrante con distribuciones calibradas que permiten umbrales ajustables en producción.
- Automatización de atención al cliente: evaluar el estado de un ticket y responder preguntas tipadas sobre la acción adecuada, integrándose en el backend sin generación de texto.
- Verificación de políticas y cumplimiento: comprobar si una respuesta cumple una rúbrica mediante preguntas de puntuación, aprovechando la calibración para fijar umbrales de aceptación.
- Agentes que operan sobre interfaces gráficas: localizar elementos nombrados en capturas mediante bounding boxes zero-shot (ScreenSpot, RefCOCO) para guiar clics.
- Análisis documental asistido: clasificar y decidir sobre documentos con soporte de visión, aunque el rendimiento en documentos es más débil (FUNSD 35,3).
- Evaluación de decisiones en juegos y simulaciones: el harness de KOF '98 reporta 16-2-0 frente a StartLux-Decision-35B-A3B y 4-14-0 frente a KnowLine-35B-A3B-Gen1 en combates de espejo de personaje.
- Sistemas de decisión en chino: con conjuntos internos de 75,9/75,9 y C-Eval 82,5, adecuado para productos dirigidos al mercado chino.

## Benchmarks y rendimiento

| Benchmark | KnowLine-31B-Gen1 | KnowLine-26B-A4B-Gen2.5 | KnowLine-35B-A3B-Gen1.5 |
|---|---|---|---|
| Decision Index 0.3 (suite pública) | 70,13 | 68,21 | 70,72 |
| Tareas de decisión de dominios nuevos (34 tareas) | 74,9 | 66,4 | 56,2 |
| Tareas de decisión de conjunto antiguo (10 tareas) | 57,7 | 56,6 | 56,6 |
| Conjuntos internos en chino | 75,9 / 75,9 | 73,7 / 71,0 | no disponible |
| C-Eval | 82,5 | 77,9 | no disponible |
| Open-Jev 1.1 test / OOD | 91,3 / 94,8 | 92,7 / 92,7 | no disponible |
| JevBench / JevBench-hard | 90,5 / 80,2 | 90,5 / 81,1 | no disponible |
| Conjunto interno en inglés | 70,2 | 70,5 | no disponible |
| Visión (reconstrucción Decision Index 0.3.1) | 69,9 | 64,7 (26B-A4B-Gen2) | 71,2 (35B-A3B-Gen1) |
| Visión (suite oficial, self-run) | 69,3 | no disponible | no disponible |
| ScreenSpot centre-hit | 81,3 | no disponible | no disponible |
| RefCOCO IoU≥0.5 | 77,3 | no disponible | no disponible |
| FUNSD | 35,3 | no disponible | no disponible |
| ECE (suite pública) | 0,012-0,021 | 0,013-0,018 | no disponible |
| Brier score (suite pública) | 0,23-0,26 | 0,24-0,27 | no disponible |

Todos los resultados son autoinformados por el autor ("self-run") con el mismo esquema de servicio (un servidor sobre una H20 de 96 GB).

## Requisitos de hardware

- VRAM estimada: los pesos bf16 ocupan aproximadamente 63 GB; SGLang reserva por defecto el 85 % de la memoria de la GPU.
- GPU recomendadas: H20 de 96 GB (configuración usada en todas las evaluaciones); se requiere una GPU con al menos 80 GB para bf16.
- GPU de consumo: no cabe en GPU de consumo (RTX 4090 de 24 GB, etc.) en bf16; no se documentan cuantizaciones alternativas.
- Despliegue: SGLang 0.5.21 en bf16 mediante `serve_knowline.sh`; front end `knowline_server.py` con `knowline_layout.py`; se requiere `transformers==5.12.1`.
- No se probó FP8 al cargar según la model card; no se documentan latencia ni throughput numéricos más allá de la ventaja estructural de un forward pass por pregunta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-31B-Gen1 | 31,27B (denso) | no disponible | 70,13 | Apache-2.0 | HuggingFace (PelaAI) |
| KnowLine-26B-A4B-Gen2.5 | ~26B (MoE, A4B) | no disponible | 68,21 | no disponible en la información | HuggingFace (PelaAI) |
| KnowLine-35B-A3B-Gen1.5 | ~35B (MoE, A3B) | no disponible | 70,72 | no disponible en la información | HuggingFace (PelaAI) |
| StartLux-Decision-35B-A3B | ~35B (MoE, A3B) | no disponible | no disponible | no disponible | referenciado en el harness de KOF '98 |

## Limitaciones y advertencias

- Instrucciones plantadas: el 0,4 % de las respuestas cambiaron por una instrucción inyectada en el estado, y el 5,3 % con plantillas de inyección no vistas en entrenamiento, más que KnowLine-26B-A4B-Gen2.5 (0,1 % y 1,7 %); riesgo relevante en producción expuesta a entradas no confiables.
- Calibración más débil en conjuntos propios retenidos que en la suite pública, según la propia model card.
- Rendimiento débil en documentos para detección de cajas (FUNSD 35,3).
- Cobertura lingüística limitada a inglés y chino (simplificado y tradicional); no se documenta castellano.
- La visión es zero-shot: no hubo entrenamiento con imágenes, por lo que el rendimiento en tareas visuales depende enteramente de la torre del base.
- El harness de KOF '98 muestra 4-14-0 frente a KnowLine-35B-A3B-Gen1, lo que indica que no domina en todos los escenarios de decisión.
- No se documenta la longitud de contexto soportada, lo que limita la planificación de despliegues con estados largos.
- Resultados de benchmarks autoinformados por el autor, no verificados de forma independiente.
- Aunque la licencia es Apache-2.0, el modelo base Gemma 4 puede imponer términos adicionales que conviene revisar antes de uso comercial.

## Enlaces

- [HuggingFace: PelaAI/KnowLine-31B-Gen1](https://huggingface.co/PelaAI/KnowLine-31B-Gen1)
- [Modelo base: google/gemma-4-31B-it](https://huggingface.co/google/gemma-4-31B-it)
- [KnowLine-26B-A4B-Gen2.5](https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2.5)
- [KnowLine-35B-A3B-Gen1.5](https://huggingface.co/PelaAI/KnowLine-35B-A3B-Gen1.5)
- [KnowLine-4B-Gen5.5](https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5)
- Guía de inferencia: `INFERENCE.md` (en el repositorio del modelo)
- README en chino: `README.zh.md` (en el repositorio del modelo)
