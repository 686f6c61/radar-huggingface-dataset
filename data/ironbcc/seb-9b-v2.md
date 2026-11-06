# ironbcc/Seb-9B-v2

## Resumen

Seb-9B-v2 es un modelo de decisión (decision model) desarrollado por el usuario ironbcc, un fine-tune del modelo base Qwen/Qwen3.5-9B. A diferencia de los modelos generativos convencionales, no produce texto libre: recibe una situación (texto o JSON), una pregunta y un conjunto de opciones, y devuelve en un único forward pass la probabilidad calibrada de cada opción, sin generar tokens. Está pensado para tareas de clasificación, enrutamiento y selección de acciones dentro de aplicaciones.

El modelo cubre tres tipos de decisión tipada: `noul` (sí/no), `choice` (hasta 20 opciones etiquetadas de A a T) y `score` (escala de 0 a 4). Con 9.653.104.368 parámetros, se posiciona como una alternativa de tamaño medio para sustituir llamadas a LLM de primera línea en decisiones rutinarias de aplicaciones, con latencias declaradas de unos 22 ms por decisión en una RTX PRO 6000 y hasta 87 decisiones por segundo en una sola GPU.

Su relevancia actual radica en la propuesta de "enrutador de primer nivel": usar un modelo pequeño y rápido para resolver la mayoría de decisiones (clasificación de tickets, detección de phishing, selección de siguiente acción en robótica) y reservar modelos mayores solo para los casos que lo requieran. La model card reporta una precisión media de 0,801 en 17 suites públicas, con mejoras destacadas frente a su versión anterior en BANKING77 (0,973), detección de jailbreak (0,940) y enrutamiento de modelos (0,980).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-9B); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-9B, según declara la model card con `base_model_relation: finetune`. La información proporcionada no detalla la arquitectura interna del modelo base (número de capas, tipo de atención, composición del dataset de entrenamiento, número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO). Tampoco se especifican los datos de entrenamiento empleados para el ajuste fino.

La innovación técnica destacable no está en la arquitectura sino en la interfaz de inferencia: el modelo emite decisiones tipadas con probabilidades calibradas en un solo forward pass, sin decodificación autoregresiva de tokens. La model card reporta una calibración ECE de 0,110 (frente a 0,088 de la versión v1, que era mejor en este aspecto). Se mencionan tres formatos de decisión: `noul` (Y/N), `choice` (A–T, hasta 20 opciones) y `score` (0–4).

## Capacidades

- Clasificación de texto con salida de probabilidades calibradas por clase.
- Decisiones booleanas (`noul`): responder sí/no a preguntas sobre un texto o situación.
- Selección entre opciones múltiples (`choice`): hasta 20 alternativas etiquetadas de A a T.
- Puntuación ordinal (`score`): asignar un valor de 0 a 4 (por ejemplo, urgencia de un mensaje).
- Enrutamiento de modelos (model routing): seleccionar qué modelo o servicio debe atender una petición.
- Detección de phishing y de jailbreak.
- Clasificación de intenciones (BANKING77, CLINC150) y escenarios (MASSIVE).
- Toma de decisiones secuenciales como política de alto nivel en robótica (brazo 3D en PyBullet y MuJoCo, robot de almacén con planificador A*).
- Toma de decisiones en juegos de mesa (ajedrez contra un bot de movimientos aleatorios, dos llamadas al modelo por movimiento).
- Entrada multimodal texto-imagen declarada en los tags (`image-text-to-text`), aunque la model card no detalla el uso de visión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Enrutamiento de tickets de soporte**: el modelo recibe el texto del ticket y devuelve la probabilidad de cada equipo o categoría destino (hasta 20 opciones). La precisión reportada en BANKING77 (0,973) y CLINC150 (0,931) lo hace adecuado para triaje automático con umbrales de confianza.
- **Detección de phishing y correo malicioso**: con el formato `noul` o `score`, clasifica un correo o mensaje como sospechoso. La model card reporta 0,895 en detección de phishing y 0,940 en detección de jailbreak.
- **Enrutador de primer nivel para LLM**: dado un prompt entrante, decide qué modelo (grande o pequeño) debe atenderlo; la suite de model routing alcanza 0,980. Reduce coste al evitar llamadas a modelos mayores en casos rutinarios.
- **Política de alto nivel en robótica**: selecciona la siguiente acción del robot (recoger, colocar, esperar, detenerse) a partir del estado del entorno en JSON; en las demos de brazo 3D se reportan 421 de 428 decisiones coincidentes con las reglas escritas. La latencia de 22 ms permite integrarlo en bucles de control.
- **Puntuación de urgencia en atención al cliente**: con el formato `score` (0–4), prioriza mensajes o incidencias en una cola de soporte sin generar texto.
- **Moderación y clasificación de contenido**: clasificación binaria o multietiqueta de reseñas, comentarios o documentos (por ejemplo, "¿menciona la reseña un reembolso?"), con probabilidades calibradas para fijar umbrales.
- **Validación de documentos y contratos**: los benchmarks ContractNLI y NLI4CT sugieren uso en verificación de implicación textual y contratos, útil para pipelines de revisión documental.

## Benchmarks y rendimiento

La model card reporta una precisión media de 0,801 en 17 suites públicas y un Decision Index de 59,16 en el índice público 0.3 (110.520 peticiones). Los datos comparativos disponibles:

| Metrica | Seb-9B-v2 | Seb-9B (v1) | Jev 1.13 | Laya |
|---|---|---|---|---|
| Precision media (17 suites) | 0,801 | 0,792 | 0,786 | 0,694 |
| Decision Index (índice público 0.3) | 59,16 | no disponible | 57,96 | no disponible |
| ECE (calibración) | 0,110 | 0,088 | no disponible | no disponible |
| BANKING77 | 0,973 | 0,907 | 0,920 | no disponible |
| Detección de jailbreak | 0,940 | 0,868 | no disponible | no disponible |
| Model routing | 0,980 | 0,945 | no disponible | no disponible |
| Phishing | 0,895 | 0,863 | no disponible | no disponible |
| MASSIVE scenario | 0,833 | 0,780 | no disponible | no disponible |

Comparativa por áreas del Decision Index frente a la familia clef de Cloudflare:

| Area | Seb-9B-v2 (9B) | clef-flash (9B) | clef-omni (30B-A3B) | clef (27B) |
|---|---|---|---|---|
| Indice público | 59,16 | 56,15 | 56,54 | 61,71 |
| Conocimiento y razonamiento | 39,9 | 53,0 | 53,8 | 52,8 |
| Comprensión del lenguaje | 62,2 | 47,2 | 49,8 | 61,3 |
| Recuperación y clasificación | 63,5 | 52,2 | 59,3 | 62,8 |
| Herramientas y automatización | 83,1 | 81,9 | 72,6 | 80,7 |
| Artes y gusto humano | 48,9 | 48,4 | 46,4 | 48,9 |

Rendimiento declarado: aproximadamente 22 ms por decisión en una RTX PRO 6000 (p95 de 36 ms) y unos 88 ms en un Apple M5 Max (p95 de 209 ms), con hasta 87 decisiones por segundo en una sola GPU. Frente a LLM generales en 420 filas públicas de decisión, la model card sitúa al modelo a la par de gpt-6-luna (high) y Claude Haiku (medium), por detrás de Claude Opus y, dentro del ruido, de Claude Sonnet en esfuerzo bajo. Las mayores desventajas frente a Jev 1.13 se dan en GPQA Diamond (-48,3), MMLU-Pro (-33,2) y BBH (-30,7).

## Requisitos de hardware

- **VRAM estimada**: no se publican cifras de VRAM en la información disponible. Con 9.653 millones de parámetros, una estimación orientativa en FP16 sería de unos 19–20 GB de pesos, y en cuantización de 8 bits unos 10 GB; estas cifras son estimaciones de cálculo, no datos del autor.
- **GPU recomendadas**: la model card cita una RTX PRO 6000 como referencia de latencia (22 ms por decisión). No se especifican otras GPU recomendadas.
- **Consumer GPU**: no disponible en la información proporcionada. Por tamaño, cabría esperar que quepa en GPU de consumo con 24 GB en cuantización de 8 bits, pero no hay confirmación del autor.
- **Opciones de despliegue**: librería transformers; los tags incluyen `endpoints_compatible`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- **Latencia y throughput**: ~22 ms por decisión en RTX PRO 6000 (p95 36 ms), ~88 ms en Apple M5 Max (p95 209 ms), hasta ~87 decisiones por segundo en una sola GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Indice publico | Precision media | Licencia | Notas |
|---|---|---|---|---|---|
| Seb-9B-v2 | 9B | 59,16 | 0,801 | apache-2.0 | Fine-tune de Qwen3.5-9B; decisiones tipadas |
| Seb-9B (v1) | 9B | no disponible | 0,792 | no disponible | Mejor calibración (ECE 0,088) |
| Jev 1.13 | no disponible | 57,96 | 0,786 | no disponible | Modelo alojado; mejor en conocimiento y razonamiento |
| Jev 1.14 | no disponible | 60,70 | no disponible | no disponible | Versión posterior de Jev |
| clef-flash | 9B | 56,15 | no disponible | no disponible | Familia clef de Cloudflare |
| clef-omni | 30B-A3B (MoE) | 56,54 | no disponible | no disponible | Familia clef de Cloudflare |
| clef | 27B | 61,71 | no disponible | no disponible | Familia clef de Cloudflare |
| OneJev1.6-9B | 9B | 65,3 | no disponible | no disponible | Entrada abierta con mayor índice público |
| Drex v1.5 | 9B | 58,1 | no disponible | no disponible | Tamaño similar |
| Bespoke Nimble 9B v3 | 9B | 57,2 | no disponible | no disponible | Tamaño similar |
| Kev 27B | 27B | 56,7 | no disponible | no disponible | Modelo mayor con índice inferior |

## Limitaciones y advertencias

- **Calibración**: la versión v2 empeora la calibración respecto a v1 (ECE 0,110 frente a 0,088), lo que puede afectar a umbrales de decisión ajustados finamente.
- **Conocimiento y razonamiento**: es el área más débil (39,9 frente a 53,0 de clef-flash y 48,3 puntos por debajo de Jev 1.13 en GPQA Diamond); no es adecuado para tareas que requieran razonamiento profundo o conocimiento factual.
- **Sesgos conocidos**: no se documentan sesgos específicos en la información disponible.
- **Alucinación**: al no generar texto libre, el riesgo de alucinación se traslada a la asignación de probabilidad a opciones; no se documentan métricas específicas de fiabilidad fuera de los benchmarks citados.
- **Idiomas**: no se especifican los idiomas soportados; la ausencia de esta información impide garantizar un rendimiento multilingüe.
- **Contexto**: no se publica la longitud de contexto soportada.
- **Licencia**: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B.
- **Madurez**: el modelo tiene 157 descargas y 1 like en el momento de la consulta, con una única fuente de evaluación (la model card del propio autor); los benchmarks no han sido verificados de forma independiente.
- **Producción**: los datos de latencia proceden del autor y se limitan a dos plataformas concretas (RTX PRO 6000 y Apple M5 Max).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ironbcc/Seb-9B-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Post del autor: https://huggingface.co/ironbcc/Seb-9B-v2/blob/main/blog/post.md
- Vídeo demo (brazo 3D en PyBullet): https://huggingface.co/ironbcc/Seb-9B-v2/resolve/main/assets/robot-3d-pybullet.mp4
- Vídeo demo (escenario de laboratorio en MuJoCo): https://huggingface.co/ironbcc/Seb-9B-v2/resolve/main/assets/robot-3d-lab.mp4
- Vídeo demo (robot de almacén): https://huggingface.co/ironbcc/Seb-9B-v2/resolve/main/assets/warehouse-robot.mp4
- Vídeo demo (ajedrez): https://huggingface.co/ironbcc/Seb-9B-v2/resolve/main/assets/chess.mp4
- Vídeo demo (benchmarks): https://huggingface.co/ironbcc/Seb-9B-v2/resolve/main/assets/benchmark-banking.mp4
- Resultados por benchmark (JSON): `di_public_index_vs_jev.json` en la carpeta demo del repositorio
