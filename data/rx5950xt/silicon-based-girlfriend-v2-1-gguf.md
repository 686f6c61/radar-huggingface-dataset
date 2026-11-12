# RX5950XT/silicon-based-girlfriend-v2.1-GGUF

## Resumen

Silicon-based girlfriend v2.1 (矽基女友 v2.1) es un modelo de rol conversacional en chino tradicional (Taiwán) de 9B parámetros, publicado por el usuario RX5950XT en Hugging Face. Se distribuye exclusivamente en formato GGUF y está afinado a partir de `huihui-ai/Huihui-Qwen3.5-9B-abliterated`, una variante "abliterated" (sin mecanismos de rechazo) de Qwen3.5-9B. El modelo está diseñado para roleplay de personajes, incluyendo contenido para adultos, y hereda la torre de visión del modelo base, por lo que acepta entradas de imagen y texto.

La versión 2.1 corrige un problema concreto detectado en la v2: en conversaciones largas (más de 20-30 turnos), el modelo tendía a copiar literalmente párrafos enteros de descripciones de acciones que ya había escrito antes. El autor reporta que las copias literales bajan de 171 a 14 casos en 720 turnos evaluados, a costa de respuestas más cortas (unas 200 palabras frente a 600 en diálogos largos) y de una ligera pérdida en matemáticas (GSM8K del 85 % al 79 %).

El modelo es relevante como ejemplo de ajuste fino con SFT + GRPO sobre una base de 9B, con un pipeline de evaluación reproducible (30 turnos por rol, 6 roles, 4 semillas, juez LLM) y cuantizaciones con imatrix y ajuste dinámico de tensores. Su alcance es muy específico: roleplay en chino tradicional, sin garantías para uso factual, matemático o comercial serio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B), torre de visión congelada; no se especifica si es densa o MoE |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card menciona pruebas con 16K de contexto en Ollama) |
| Tipos de cuantizacion | Q8_0 (9,79 GB), Q4_K_M con imatrix y ajuste dinamico de tensores (6,00 GB); Q3 descartado por el autor |
| Idiomas soportados | chino (zh), con enfasis en chino tradicional de Taiwan; se penaliza el chino simplificado en el entrenamiento |
| Licencia | Apache-2.0 (heredada de `huihui-ai/Huihui-Qwen3.5-9B-abliterated` y de `Qwen/Qwen3.5-9B`) |
| Formato de pesos | GGUF (incluye `mmproj` Q8_0 de 624 MB para vision y `imatrix.gguf` de 5 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B en su variante abliterated, un transformer de 9,2B parámetros con capacidad multimodal imagen-texto. El ajuste fino se realizó con LoRA sobre la torre de lenguaje únicamente (r16, α16 en SFT; r16, α32 en GRPO), manteniendo la torre de visión completamente congelada, por lo que las capacidades visuales son idénticas a las del modelo base. El framework empleado fue TRL 0.24 con Unsloth, sobre una GPU RTX PRO 6000 de 96 GB en Google Colab.

El entrenamiento consta de dos fases. Primero, un SFT de 650 pasos con un corpus sintético en chino tradicional que combina roleplay generado por el propio autor, diálogos largos multi-turno, el corpus de la v1, problemas GSM8K traducidos al chino tradicional y un 10 % de corpus general para mitigar el olvido catastrófico; las respuestas que repetían el patrón de la ronda anterior se excluyeron como objetivo de aprendizaje. Después, un GRPO de 117 pasos (se publica el checkpoint 80) con una recompensa compuesta por: juez LLM de 0 a 10, penalización de rechazos, penalización de relleno, penalización de repetición de cláusulas, penalización de copia literal, penalización de copia entre turnos, penalización de caracteres simplificados y tareas verificables de matemáticas e instrucciones. Las prácticas de GRPO se construyeron con el propio modelo conversando 6-12 turnos con un usuario simulado, de modo que aprende a no repetirse sobre su propio historial largo.

La cuantización `imat-Q4_K_M-dyn` aplica un imatrix calculado con el propio Q8 del modelo (calibración 50 % roleplay, 25 % general, 25 % GSM8K) y sube la precisión de tres familias de tensores sensibles: `attn_v` a q6_K, `ffn_down` a q5_K y el resto a q8_0 cuando corresponde, lo que añade 0,22 GB respecto a un Q4_K_M estándar.

## Capacidades

- Generación de texto conversacional multi-turno en chino tradicional, orientada a roleplay de personajes con persona definida en el system prompt.
- Capacidad de mantener el personaje y la coherencia narrativa a lo largo de diálogos de 30 turnos o más.
- Entrada de imagen y texto (image-text-to-text) mediante el módulo `mmproj` del modelo base: reconoce colores y formas simples, pero falla en la lectura de números de dos dígitos.
- Razonamiento matemático básico: GSM8K del 79 % en Q8 y 75 % en Q4-dyn, suficiente para aritmética sencilla pero no para uso como calculadora.
- Respuesta a instrucciones generales: 60/64 en el sondeo de capacidad general del autor (Q8).
- Sin mecanismos de rechazo: el modelo no declina peticiones, lo que incluye contenido adulto explícito.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta modo "thinking" ni capacidades de audio.

## Casos de uso

- Roleplay de personajes en chino tradicional: el caso principal. Se define la persona en el system prompt y se mantiene una conversación larga; el modelo está entrenado específicamente para no repetir descripciones de acciones pasadas, lo que lo hace adecuado para sesiones de decenas de turnos.
- Ficción interactiva y novelas visuales: integrado en un motor de diálogo, genera las respuestas del personaje con continuidad narrativa y longitud de respuesta moderada (unas 200 palabras por turno en conversaciones largas), lo que encaja con interfaces de chat.
- Prototipado de personajes conversacionales para investigación: sirve como banco de pruebas para estudiar repetición, coherencia de persona y degradación en contextos largos, con un pipeline de evaluación reproducible incluido en el repositorio.
- Generación de diálogos para guiones o borradores creativos en chino tradicional: el modelo produce texto conversacional con registro coloquial taiwanés, útil como material de partida que un humano revisa.
- Evaluación de técnicas de cuantización: los archivos Q8 y Q4-dyn con imatrix y ajuste dinámico permiten comparar el impacto de la cuantización en calidad conversacional sobre el mismo modelo, con métricas publicadas.
- Despliegue local en hardware de consumo: con la cuantización Q4-dyn (6,0 GB de pesos más 0,6 GB de visión), cabe en GPUs de 8 GB con contexto de 16K, aunque el autor reporta que alrededor del 13 % de los cálculos caen a CPU en ese escenario.
- Investigación sobre alineación y ausencia de rechazo: al ser una variante abliterated, permite estudiar el comportamiento de modelos sin mecanismos de negativa en dominios controlados.

## Benchmarks y rendimiento

Los datos provienen de la evaluación propia del autor: 6 roles no vistos en entrenamiento (2 cotidianos, 2 emocionales, 2 para adultos, todos adultos), 30 turnos por rol, 4 semillas aleatorias, 720 turnos en total, con un usuario simulado por el propio modelo y un juez `deepseek/deepseek-v4.1-flash` que puntúa 6 dimensiones de 0 a 10. El autor advierte que estos números no son comparables con los de la model card de la v2.

| Modelo | Total | Inmersión | Consistencia de personaje | Avance de trama | Coherencia multi-turno | Calidad de texto | No repetir patrón |
|---|---|---|---|---|---|---|---|
| Base original Q8 (sin ajuste) | 4,51 | 6,38 | 5,69 | 4,25 | 3,71 | 5,00 | 2,04 |
| v2 Q8 | 3,70 | 5,52 | 4,75 | 2,92 | 3,62 | 4,15 | 1,23 |
| **v2.1 Q8** | **5,23** | 6,75 | 6,02 | 4,58 | 5,96 | 5,35 | 2,73 |
| **v2.1 Q4-dyn** | **5,04** | 6,50 | 5,83 | 4,48 | 5,50 | 5,21 | 2,71 |
| Kimi K2.6 (referencia superior) | 7,84 | 8,90 | 8,60 | 7,54 | 8,65 | 7,81 | 5,54 |

| Métrica | Base Q8 | v2 Q8 | v2.1 Q8 | v2.1 Q4-dyn | Kimi K2.6 |
|---|---|---|---|---|---|
| Copia literal de un turno anterior (similitud ≥0,8; 720 turnos) | 109 | 171 | 14 | 11 | 1 |
| Repetición de frase inicial (720 turnos) | 227 | 535 | 261 | no disponible | 146 |
| Comparación ciega por pares contra v2 Q8 (victorias/derrotas/empates, 24) | 3/14/7 | — | 10/2/12 | 11/6/7 | 24/0/0 |
| Preguntas de memoria acertadas (72) | 44 | 52 | 44 | 46 | 69 |
| Longitud media de respuesta (caracteres) | 735 | 602 | 194 | no disponible | 589 |
| GSM8K | 81 % | 85 % | 79 % | 75 % | no disponible |
| Sondeo de capacidad general (64 preguntas) | 52 | 59 | 60 | 58 | no disponible |
| Rechazos | 0/7 | 0/7 | 0/7 | 0/7 | no disponible |
| Caracteres en chino simplificado (720 turnos) | 326 | 62 | 16 | no disponible | no disponible |
| Comparación ciega de un solo turno contra v2 Q8 (tasa de victoria) | 38 % | — | 34 % | — | no disponible |

## Requisitos de hardware

- VRAM para Q8_0: 9,79 GB de pesos más 0,62 GB del módulo de visión; requiere al menos 12 GB de VRAM para contexto corto y más para contexto largo.
- VRAM para Q4_K_M-dyn: 6,00 GB de pesos más 0,62 GB de visión (unos 6,6 GB en total). El autor reporta que en una GPU de 8 GB con contexto de 16K aproximadamente el 13 % de los cálculos se derivan a CPU.
- GPU recomendadas: RTX 4090 (24 GB) o superior para Q8 con contexto largo; RTX 3090/4080 (16-24 GB) para Q8 con contexto moderado; GPUs de 8 GB como RTX 3060 Ti o RTX 4060 para Q4-dyn con contexto reducido o caché KV de 8 bits.
- Para entrenamiento o ajuste fino se usó una RTX PRO 6000 de 96 GB en Google Colab G4, aunque el modelo se distribuye solo para inferencia.
- Opciones de despliegue: Ollama (el repositorio incluye `Modelfile.Q8_0` y `Modelfile.imat-Q4_K_M-dyn` con parámetros de muestreo ya configurados), llama.cpp con soporte GGUF e imatrix, y cualquier runtime compatible con GGUF y `mmproj` para entrada de imagen.
- Parámetros de muestreo recomendados por el autor: `temperature 0.7`, `top_p 0.8`, `top_k 20`, `presence_penalty 1.5`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Silicon-based girlfriend v2.1** | 9,2B | no disponible (probado a 16K) | Roleplay en chino tradicional, multimodal | Apache-2.0 | GGUF en Hugging Face |
| Base `huihui-ai/Huihui-Qwen3.5-9B-abliterated` | 9,2B | no disponible | Modelo general abliterated, multimodal | Apache-2.0 | Safetensors y GGUF (mradermacher) |
| v2 `RX5950XT/silicon-based-girlfriend-v2-GGUF` | 9,2B | no disponible | Versión anterior, respuestas más largas pero más repetitivas | Apache-2.0 | GGUF en Hugging Face |
| Kimi K2.6 (referencia del autor) | no disponible | no disponible | Modelo comercial de gran escala usado como techo de comparación | propietaria | API |

La comparación con Kimi K2.6 es la única referencia externa publicada por el autor: en el mismo juez y protocolo, K2.6 obtiene 7,84 frente a 5,23 de la v2.1 Q8, con una diferencia especialmente marcada en coherencia multi-turno (8,65 frente a 5,96) y en no repetir patrón (5,54 frente a 2,73). No se han publicado comparaciones con otros modelos de roleplay de tamaño similar.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está entrenado para roleplay explícito y no tiene mecanismos de rechazo (0/7 rechazos en la evaluación). No es apto para menores ni para entornos sin control de contenido.
- No es fiable para consultas factuales ni matemáticas: el propio autor lo desaconseja explícitamente para esos usos, y el rendimiento en GSM8K cae al 79 % (Q8) y 75 % (Q4).
- Respuestas cortas: en conversaciones largas la longitud media baja a unas 200 palabras frente a las 600 de la v2, y en comparaciones ciegas de un solo turno el 34 % de las veces se prefiere la v2. Para sesiones cortas, la v2 puede resultar más satisfactoria.
- Memoria a largo plazo limitada: acierta 44-46 de 72 preguntas de memoria frente a 52 de la v2; puede dar rodeos, no avanzar la trama o no recordar datos mencionados antes.
- Repetición residual: aunque las copias literales bajan de 171 a 14, la repetición de frases iniciales sigue siendo alta (261 de 720 turnos).
- Mezcla de escritura: aparecen ocasionalmente caracteres de chino simplificado (16 en 720 turnos en Q8), pese a la penalización durante el entrenamiento.
- Visión limitada: reconoce colores y formas, pero lee mal números de dos dígitos (confunde "42" con "4").
- Licencia Apache-2.0: permite uso comercial, pero el autor recomienda verificar el cumplimiento normativo y de las políticas de la plataforma, especialmente por el contenido adulto.
- Origen sintético de los datos: el corpus de entrenamiento es generado, lo que puede introducir sesgos y artefactos del propio generador; el autor lo declara solo para investigación.
- Idiomas: solo chino (con preferencia por el tradicional de Taiwán); no se documenta rendimiento en castellano ni en otros idiomas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RX5950XT/silicon-based-girlfriend-v2.1-GGUF
- Versión anterior v2: https://hf.co/RX5950XT/silicon-based-girlfriend-v2-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- GGUF del modelo base (origen del módulo de visión): https://hf.co/mradermacher/Huihui-Qwen3.5-9B-abliterated-GGUF
- Adaptadores y registro de entrenamiento: `RX5950XT/silicon-based-girlfriend-v2.1` (referenciado en la model card)
- Dataset de entrenamiento: https://huggingface.co/datasets/RX5950XT/silicon-based-girlfriend-v2-dataset
- Modelo Qwen3.5-9B original: https://huggingface.co/Qwen/Qwen3.5-9B (referenciado como upstream en la model card)
