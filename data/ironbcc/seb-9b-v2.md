# ironbcc/Seb-9B-v2

## Resumen

Seb-9B-v2 es un modelo de decisión tipada desarrollado por ironbcc, un fine-tune del modelo base Qwen/Qwen3.5-9B. A diferencia de los modelos generativos convencionales, su propósito es evaluar una situación (texto o JSON), una pregunta y un conjunto de opciones, y devolver la probabilidad calibrada de cada opción en un único forward pass, sin generar tokens. Está pensado para tareas de enrutamiento, clasificación y selección de acciones donde la latencia y la consistencia importan más que la fluidez del texto.

El modelo maneja tres tipos de decisión: `noul` (sí/no), `choice` (hasta 20 opciones etiquetadas de A a T) y `score` (escala de 0 a 4). Con 9.653 millones de parámetros, se posiciona como una alternativa compacta a los LLM generalistas para toma de decisiones automatizada, con soporte declarado para robótica de alto nivel, detección de phishing, enrutamiento de tickets y clasificación de intenciones.

Su relevancia actual radica en la eficiencia: aproximadamente 22 ms por decisión en una RTX PRO 6000 y hasta unas 87 decisiones por segundo en una sola GPU, con licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-9B), con cabecera de decisión tipada |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tipo de salida | decisiones tipadas: `noul` (Y/N), `choice` (A–T, hasta 20), `score` (0–4) |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repo | 38,6 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de 9.653 millones de parámetros, y se especializa mediante fine-tune para producir decisiones tipadas en lugar de texto generado. La innovación central es el formato de salida: en un solo forward pass el modelo calcula probabilidades calibradas sobre un conjunto cerrado de opciones, eliminando la decodificación autoregresiva y, con ello, gran parte de la latencia y la variabilidad asociadas a la generación de tokens.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se documenta que el modelo se evalúa con un "Decision Index" sobre un kit público de 110.520 peticiones y que mantiene calibración medida mediante ECE (Expected Calibration Error). Respecto a la versión anterior, Seb-9B-v2 mejora la precisión media pero empeora ligeramente la calibración (ECE 0,110 frente a 0,088 de v1).

## Capacidades

- Toma de decisiones tipadas en un único forward pass, sin generación de tokens.
- Clasificación de intenciones y enrutamiento (BANKING77, CLINC150, MASSIVE scenario).
- Detección de phishing y de jailbreak.
- Enrutamiento entre modelos (model routing), útil como primera capa de un pipeline multi-LLM.
- Decisión de invocación de herramientas (When2Call, ToolRet).
- Selección de acciones de alto nivel para robótica, con planificadores externos (A*, cinemática inversa) ejecutando el movimiento.
- Evaluación de urgencia y puntuación en escala ordinal (0–4).
- Soporte de entrada en texto plano o JSON.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta soporte de tool calling generativo, agentes multi-paso autónomos, visión ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y las etiquetas de equipo disponibles (hasta 20 opciones) y devuelve la probabilidad de cada una; con 0,973 en BANKING77 es adecuado para triaje automático de alta precisión.
- Primera capa de un router de LLM: dado un prompt y una lista de modelos candidatos, Seb-9B-v2 decide a qué modelo derivarlo (0,980 en model routing), reduciendo coste al reservar los modelos grandes para los casos que lo requieren.
- Detección de phishing y correo malicioso: clasificación binaria `noul` sobre el contenido del mensaje, con 0,895 de precisión reportada en la suite de phishing, integrable en una pasarela de correo.
- Detección de jailbreak en producción: filtro previo a un LLM generativo (0,940 reportado), con latencia de decenas de milisegundos que permite aplicarlo en línea.
- Política de alto nivel en robótica: el modelo elige la siguiente acción (recoger, colocar, esperar) y un planificador A* o de cinemática inversa ejecuta el movimiento; en las demos del autor, 421 de 428 decisiones coincidieron con las reglas escritas.
- Puntuación de urgencia en bandejas de entrada: salida `score` de 0 a 4 para priorizar mensajes o incidencias antes de que los procese un humano o un sistema mayor.
- Clasificación de escenarios conversacionales (MASSIVE scenario, 0,833) para asistentes de voz o chatbots con enrutamiento por dominio.

## Benchmarks y rendimiento

| Metrica | Seb-9B-v2 | Seb-9B (v1) | Jev 1.13 | Laya |
|---|---|---|---|---|
| Precision media (17 suites publicas) | 0,801 | 0,792 | 0,786 | 0,694 |
| Decision Index (indice publico 0.3) | 59,16 | no disponible | 57,96 | no disponible |
| ECE (calibracion) | 0,110 | 0,088 | no disponible | no disponible |
| BANKING77 | 0,973 | 0,907 | 0,920 | no disponible |
| Deteccion de jailbreak | 0,940 | 0,868 | no disponible | no disponible |
| Model routing | 0,980 | 0,945 | no disponible | no disponible |
| Phishing | 0,895 | 0,863 | no disponible | no disponible |
| MASSIVE scenario | 0,833 | 0,780 | no disponible | no disponible |

Desglose del Decision Index por areas (indice publico 0.3, corregido por azar):

| Area | Seb-9B-v2 | clef-flash (9B) | clef-omni (30B-A3B) | clef (27B) |
|---|---|---|---|---|
| Indice publico | 59,16 | 56,15 | 56,54 | 61,71 |
| Conocimiento y razonamiento | 39,9 | 53,0 | 53,8 | 52,8 |
| Comprension del lenguaje | 62,2 | 47,2 | 49,8 | 61,3 |
| Recuperacion y clasificacion | 63,5 | 52,2 | 59,3 | 62,8 |
| Herramientas y automatizacion | 83,1 | 81,9 | 72,6 | 80,7 |
| Artes y gusto humano | 48,9 | 48,4 | 46,4 | 48,9 |

Rendimiento declarado por el autor: aproximadamente 22 ms por decisión en una RTX PRO 6000 (p95 de 36 ms) y unos 88 ms en un Apple M5 Max (p95 de 209 ms), con hasta unas 87 decisiones por segundo en una sola GPU. Frente a LLM generalistas en 420 filas públicas de decisión, el autor lo sitúa a la altura de gpt-6-luna (high) y Claude Haiku (medium), y por detrás de Claude Opus y, dentro del ruido, de Claude Sonnet en esfuerzo bajo. Frente a Jev 1.13, va por delante en 22 de 37 benchmarks y en 4 de 5 áreas, con las mayores desventajas en GPQA Diamond (-48,3), MMLU-Pro (-33,2) y BBH (-30,7).

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 9.653 millones de parámetros en safetensors, en FP16 requiere aproximadamente 19-20 GB de VRAM, y en cuantizaciones de 8 bits o 4 bits bajaría a rangos de 10 GB y 5-6 GB respectivamente (estimación, no confirmada por el autor).
- GPU recomendadas: RTX PRO 6000 (medición oficial), A100, H100 para despliegue concurrente; Apple M5 Max soportado con latencias de ~88 ms por decisión.
- Cabe en GPU de consumo: probable en cuantización de 4-8 bits en tarjetas de 12-24 GB (RTX 4090, RTX 4080), aunque no hay cifras oficiales.
- Opciones de despliegue: transformers (librería declarada); el autor no documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~22 ms por decisión (p95 36 ms) en RTX PRO 6000; ~88 ms (p95 209 ms) en Apple M5 Max; hasta ~87 decisiones/s en una GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Indice publico | Precisión media | Licencia | Notas |
|---|---|---|---|---|---|
| Seb-9B-v2 | 9,65B | 59,16 | 0,801 | Apache 2.0 | Fine-tune de Qwen3.5-9B |
| Jev 1.13 | no disponible | 57,96 | 0,786 | no disponible | Mejor en conocimiento y razonamiento |
| Jev 1.14 | no disponible | 60,70 | no disponible | no disponible | Por delante en 20 de 37 benchmarks |
| clef-flash | 9B | 56,15 | no disponible | no disponible | Familia de Cloudflare |
| clef-omni | 30B-A3B (MoE) | 56,54 | no disponible | no disponible | Mayor tamaño, similar indice |
| clef | 27B | 61,71 | no disponible | no disponible | Por delante en indice publico |
| OneJev1.6-9B | 9B | 65,3 | no disponible | no disponible | Entrada abierta con mayor indice |
| Drex v1.5 | 9B | 58,1 | no disponible | no disponible | Tamaño y puntuación cercanos |
| Bespoke Nimble 9B v3 | 9B | 57,2 | no disponible | no disponible | Tamaño similar |
| Kev 27B | 27B | 56,7 | no disponible | no disponible | Mayor tamaño, menor indice |

## Limitaciones y advertencias

- Calibración inferior a la versión anterior (ECE 0,110 frente a 0,088), lo que afecta a la fiabilidad de las probabilidades si se usan como umbrales.
- Debilidad clara en conocimiento y razonamiento (39,9 frente a 53,0 de clef-flash y 52,8 de clef 27B); no es adecuado para tareas que exijan conocimiento factual o razonamiento complejo.
- Desventajas notables frente a Jev 1.13 en GPQA Diamond (-48,3), MMLU-Pro (-33,2) y BBH (-30,7).
- En las demos de robótica, 7 de 428 decisiones no coincidieron con las reglas escritas (orden de recogida en el escenario de laboratorio), lo que indica errores en casos con múltiples objetos y eventos simultáneos.
- El modelo está diseñado para elegir entre opciones predefinidas; no genera texto libre ni mantiene conversaciones multi-turno.
- Idiomas soportados no documentados: no hay garantía de rendimiento fuera del inglés.
- Longitud de contexto no especificada: no se recomienda para entradas largas sin validación previa.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B debe verificarse por separado.
- Los benchmarks son en gran parte autoinformados por el autor; el "Board Full score" (que incluye tests privados) no está calculado para este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ironbcc/Seb-9B-v2
- Entrada de blog del autor: https://huggingface.co/ironbcc/Seb-9B-v2/blob/main/blog/post.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Video demo robot 3D (PyBullet): https://huggingface.co/ironbcc/Seb-9B-v2/resolve/main/assets/robot-3d-pybullet.mp4
- Video demo laboratorio (MuJoCo): https://huggingface.co/ironbcc/Seb-9B-v2/resolve/main/assets/robot-3d-lab.mp4
- Video demo robot de almacen: https://huggingface.co/ironbcc/Seb-9B-v2/resolve/main/assets/warehouse-robot.mp4
- Video demo ajedrez: https://huggingface.co/ironbcc/Seb-9B-v2/resolve/main/assets/chess.mp4
- Video demo benchmarks: https://huggingface.co/ironbcc/Seb-9B-v2/resolve/main/assets/benchmark-banking.mp4
- Resultados por benchmark (JSON): `di_public_index_vs_jev.json` en la carpeta demo del repositorio
