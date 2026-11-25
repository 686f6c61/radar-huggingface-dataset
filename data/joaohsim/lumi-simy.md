# joaohsim/Lumi-Simy

## Resumen

Lumi-Simy es un modelo de 4B parámetros especializado en tool calling y uso agéntico, desarrollado por joaohsim como proyecto personal de estudio sobre post-entrenamiento. Se construye sobre Lumi-Think-4B (de Mateus Nery), que a su vez deriva de CEIA Lumi-4B (equipo NLP de CEIA/UFG) y, en última instancia, de NVIDIA Nemotron 3 Nano 4B. El modelo ha sido post-entrenado mediante LoRA SFT para seleccionar herramientas, encadenar llamadas leyendo sus resultados, realizar llamadas en paralelo y abstenerse cuando ninguna herramienta es adecuada, todo ello con modo thinking activado.

La relevancia de Lumi-Simy reside en que demuestra que un modelo híbrido pequeño (3.973.556.832 parámetros) puede mejorar sustancialmente sus capacidades agénticas sin sacrificar rendimiento general, entrenando en una única RTX 4090 de 24 GB. En VAKRA (IBM Research), sobre cinco dominios de base de datos no vistos en entrenamiento, la precisión sube de 12,2% a 32,7% en la capacidad 1 y de 16,5% a 51,7% en la capacidad 2 (60,3% con router de herramientas). En BFCL, las categorías multi-turno mejoran de 25,0 a 43,0.

El autor advierte explícitamente que se trata de un proyecto de aprendizaje, no destinado a producción, y que el post-entrenamiento se diseñó para no degradar las capacidades generales del modelo base en portugués e inglés. La licencia hereda las restricciones de Lumi-4B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 / MLP / attention (Nemotron-H) |
| Parámetros totales | 3.973.556.832 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 20.480 tokens en entrenamiento; servido con 65.536 tokens en evaluaciones |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Portugués (pt), inglés (en) |
| Licencia | Otra (lumi-4b), heredada de ceia-research/lumi-4b |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Lumi-Simy emplea una arquitectura híbrida Nemotron-H que combina capas Mamba-2, MLP y attention, según la model card de NVIDIA Nemotron 3 Nano 4B. El modelo base es Lumi-Think-4B, convertido de GGUF a safetensors, que ya había sido post-entrenado para razonamiento. Sobre él se aplicó LoRA SFT con rango r=32 y α=32, dirigido a las proyecciones `in_proj`/`out_proj` de Mamba, `up/down_proj` del MLP y `q/k/v/o_proj` de attention, con 41,4 millones de parámetros entrenables. El entrenamiento se realizó durante 2 épocas con learning rate 1e-4 y contexto de 20.480 tokens, en una única NVIDIA RTX 4090 de 24 GB, y los pesos LoRA se fusionaron en los pesos finales.

Los datos de entrenamiento provienen de una mezcla de datasets: ibm-research/VAKRA, Polygl0t/gigaverbo-v2-sft, allenai/tulu-3-sft-personas-instruction-following, Polygl0t/gsm8k-pt, TIGER-Lab/WebInstruct-verified, NousResearch/hermes-function-calling-v1 y nvidia/When2Call. Para preservar las capacidades generales se incluyeron datos de replay autodestilados del modelo base. El objetivo del post-entrenamiento fue enseñar al modelo a elegir herramientas, encadenar varias llamadas leyendo sus resultados, hacer llamadas en paralelo y abstenerse cuando ninguna herramienta encaja, manteniendo el modo thinking activado.

## Capacidades

- Generación de texto conversacional en portugués e inglés.
- Razonamiento con modo thinking activado durante la generación.
- Tool calling y function calling: selección de herramientas, llamadas encadenadas leyendo resultados intermedios y llamadas en paralelo.
- Detección de irrelevancia: capacidad de abstenerse de llamar a una herramienta cuando ninguna es adecuada.
- Razonamiento multi-paso y comportamiento agéntico sobre APIs y bases de datos.
- Capacidades generales de instrucción y matemáticas preservadas del modelo base (gracias al replay autodestilado).
- Soporte de contexto largo: hasta 65.536 tokens en servicio, aunque el entrenamiento se realizó con 20.480 tokens.
- No se ha documentado soporte de visión, audio ni otras modalidades.

## Casos de uso

- Agentes de consulta sobre bases de datos: el modelo puede traducir preguntas en lenguaje natural a llamadas a APIs de BI o dashboards, encadenando varias consultas y leyendo los resultados intermedios. Es adecuado por su entrenamiento específico en VAKRA sobre dominios de bases de datos.
- Automatización de flujos con múltiples herramientas: en pipelines donde una tarea requiere invocar secuencialmente varias funciones (por ejemplo, consultar un CRM, luego un sistema de facturación y después enviar un correo), el modelo encadena llamadas leyendo cada resultado antes de decidir la siguiente.
- Ejecución de llamadas en paralelo: para tareas que consultan varias fuentes independientes a la vez (clima, cotizaciones, estado de pedidos), el modelo puede emitir llamadas paralelas y consolidar las respuestas, con una puntuación BFCL de 81,0 en parallel y 70,8 en live_parallel_multiple.
- Asistentes conversacionales multi-turno con herramientas: en atención al cliente donde el usuario mantiene una conversación y el asistente debe recordar el estado y decidir cuándo invocar una herramienta, el modelo obtiene 43,0 en multi_turn_base de BFCL, frente a 25,0 de su base.
- Filtrado y enrutado de peticiones: gracias a su detección de irrelevancia (80,8 en BFCL irrelevance y 77,0 en live_irrelevance), puede usarse como primera capa para decidir si una consulta requiere una herramienta o puede responderse directamente.
- Prototipado e investigación en post-entrenamiento: al ser un proyecto de estudio con receta documentada (LoRA SFT, datasets concretos, hiperparámetros), sirve como referencia reproducible para experimentar con tool calling en modelos híbridos pequeños sobre hardware de consumo.
- Evaluación comparativa de modelos agénticos: su integración con el harness `bfcl-eval` y VAKRA permite usarlo como baseline en experimentos de function calling en portugués e inglés.

## Benchmarks y rendimiento

Los resultados provienen de ejecuciones propias del autor con protocolo uniforme (thinking activado, temperatura 1,0, top_p 0,95). No son cifras de leaderboards oficiales.

### Agéntico: VAKRA (5 dominios no vistos, juez local gpt-oss-20b)

| Modelo | Capacidad 1 (APIs BI) | Capacidad 2 (APIs dashboard) |
|---|---|---|
| Lumi-Think-4B | 12,2 | 16,5 |
| Qwen3-4B (referencia externa, thinking) | 39,2 | 48,3 |
| Lumi-Simy | 32,7 | 51,7 |
| Lumi-Simy + router | 33,1 | 60,3 |
| gpt-oss-20b (teacher, 21B) | 48,2 | 57,0 |

### Function calling: BFCL (categorías v3, `bfcl-eval` 2025.12.17, modo FC)

| Categoría | Lumi-Think | Nemotron 3 Nano 4B | Lumi-Simy | Qwen3-4B |
|---|---|---|---|---|
| simple_python | 90,2 | 95,0 | 94,2 | 95,5 |
| multiple | 89,5 | 94,5 | 90,0 | 97,5 |
| parallel | 76,5 | 56,5 | 81,0 | 91,0 |
| parallel_multiple | 73,5 | 56,0 | 72,0 | 90,0 |
| irrelevance | 82,5 | 75,8 | 80,8 | 80,0 |
| live_simple | 76,0 | 79,8 | 76,7 | 86,0 |
| live_multiple | 72,4 | 73,7 | 72,7 | 81,6 |
| live_parallel | 62,5 | 31,2 | 75,0 | 75,0 |
| live_parallel_multiple | 41,7 | 37,5 | 70,8 | 87,5 |
| live_irrelevance | 75,7 | 76,4 | 77,0 | 77,0 |
| live_relevance | 68,8 | 93,8 | 87,5 | 81,2 |
| multi_turn_base | 25,0 | 23,0 | 43,0 | 39,0 |
| multi_turn_miss_func | 10,5 | 31,5 | 30,5 | 25,5 |
| multi_turn_miss_param | 19,0 | 26,0 | 31,5 | 29,5 |
| multi_turn_long_context | 13,0 | 23,5 | 31,0 | 24,5 |

El autor señala que Qwen3-4B se sirvió con sus propios parsers y contexto máximo de 40.960 tokens, y que 22 ítems de `multi_turn_long_context` exceden ese límite y cuentan como errores; los modelos Nemotron-H se sirvieron con 65.536 tokens, límite que Lumi-Simy supera en 2 ítems y Lumi-Think en 3. Lumi-Simy supera a Qwen3-4B en las cuatro categorías multi-turno y es el mejor de los cuatro modelos en tres de ellas.

### Retención de capacidades generales (portugués e inglés)

Frente a Lumi-Think, la media difiere en −0,2 pp (prueba pareada), lo que indica que el post-entrenamiento en tool use no degradó las capacidades generales del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.973.556.832 parámetros en BF16 se requieren aproximadamente 8 GB solo para pesos, más overhead de contexto y KV cache.
- GPU recomendadas: el modelo fue entrenado y evaluado en una única NVIDIA RTX 4090 de 24 GB, por lo que cabe holgadamente en ella. GPU de数据中心 como A100 o H100 son compatibles pero sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con margen; en GPUs de 8-12 GB requeriría cuantización, cuyos formatos no están documentados en la información disponible.
- Opciones de despliegue: no se documentan explícitamente; el uso de `custom_code` y la arquitectura Nemotron-H sugieren necesidad de soporte específico en el runtime. El autor empleó `bfcl-eval` con parsers propios para las evaluaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL multi_turn_base | BFCL parallel | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lumi-Simy | 3,97B | 65.536 en servicio | 43,0 | 81,0 | Otra (lumi-4b) | Hugging Face |
| Lumi-Think-4B | ~4B | no disponible | 25,0 | 76,5 | no disponible | Hugging Face (GGUF) |
| Nemotron 3 Nano 4B | ~4B | 65.536 en evaluación | 23,0 | 56,5 | no disponible | Hugging Face (NVIDIA) |
| Qwen3-4B | ~4B | 40.960 | 39,0 | 91,0 | no disponible | Hugging Face |

Lumi-Simy destaca en categorías multi-turno y en llamadas paralelas en vivo, mientras que Qwen3-4B es superior en llamadas simples y paralelas de un solo turno. Nemotron 3 Nano 4B, el ancestro arquitectónico, rinde peor en la mayoría de categorías BFCL tras el post-entrenamiento de Lumi-Simy.

## Limitaciones y advertencias

- Proyecto personal de estudio: el autor indica explícitamente que no está destinado a uso en producción.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datasets fundamentalmente en portugués e inglés, el comportamiento en otros idiomas es incierto.
- Riesgo de alucinación: no cuantificado; como modelo de 4B con modo thinking, puede generar llamadas a herramientas inexistentes o argumentos incorrectos, aunque su detección de irrelevancia (80,8 en BFCL) mitiga parcialmente este riesgo.
- Limitaciones de contexto: el entrenamiento usó 20.480 tokens, aunque se sirve con 65.536; el rendimiento más allá del contexto de entrenamiento no está garantizado.
- Limitaciones de idioma: solo portugués e inglés documentados.
- Restricciones de licencia: licencia "other" heredada de lumi-4b; deben consultarse los términos en el enlace de licencia para uso comercial.
- Caveat de evaluación: en VAKRA, Lumi-Simy fue fine-tuneado con trayectorias de los dominios de entrenamiento, mientras que Qwen3-4B se evaluó zero-shot; BFCL es la comparación en igualdad de condiciones.
- Requiere `custom_code` para cargar el modelo, lo que puede complicar el despliegue en algunos runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joaohsim/Lumi-Simy
- Modelo base Lumi-Think-4B (GGUF): https://huggingface.co/Mateus-Nery/lumi-think-4b-GGUF
- Modelo base CEIA Lumi-4B: https://huggingface.co/ceia-research/lumi-4b
- Model card de NVIDIA Nemotron 3 Nano 4B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Paper de referencia (arxiv:2504.18851): https://arxiv.org/abs/2504.18851
- Perfil del autor: https://huggingface.co/joaohsim
