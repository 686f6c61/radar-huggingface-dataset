# DavidAU/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored

## Resumen

Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored es un fine-tune experimental publicado por DavidAU sobre Qwen/Qwen3.8-27B. El autor ha expandido el modelo base de 27B a aproximadamente 30,83 mil millones de parámetros (30.825.577.520 según los pesos en safetensors) mediante una técnica que denomina "looping transformer": inserta secciones adicionales en puntos concretos de la red para forzar una suerte de "re-ponderación" interna, con el objetivo de generar planes y respuestas más detalladas. Sobre esa base expandida aplica un entrenamiento ligero en varias etapas (que el autor etiqueta como "Cold Fusion", "GAIN Training" y "Multi-stage tuning") para corregir los defectos introducidos por la expansión manual.

El modelo pertenece a la familia de publicaciones "Heretic/Uncensored" del mismo autor: se ha sometido a un proceso de abliteration (eliminación de la dirección de rechazo en el espacio de activaciones) y se distribuye sin los filtros de seguridad habituales del modelo original. Incorpora además el sistema propietario "Turbo Brilliance 50X", que el autor describe como un conjunto de modos de razonamiento e instrucción (27 modos de razonamiento, 27 modos de instrucción, 9 modos "Xhigh", 15 "AI Constructs" y 5 "Super AI Constructs") accesibles escribiendo "help" en el chat. La licencia declarada es Apache 2.0.

Es relevante ahora porque ejemplifica una corriente de fine-tunes comunitarios que combinan modificación estructural de la arquitectura, abliteration y sistemas de prompts empaquetados, todo ello con licencia permisiva. No obstante, se trata de un prototipo que el propio autor califica de experimental y funcional, con problemas conocidos de repetición y glitches menores, y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.8) con modificaciones "looping transformer": secciones expandidas insertadas manualmente en puntos concretos de la red |
| Parametros totales | 30.825.577.520 (≈30,83B) |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | 256k máximo según el autor; mínimo recomendado 32k, sugerido 64k-128k |
| Tipos de cuantizacion | GGUF (se mencionan Q4KS y variantes imatrix/no-imatrix en el ecosistema del autor); pesos originales en bfloat16 |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas declarados en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible en el árbol de modelos del autor |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Qwen3.8 (modelo base Qwen/Qwen3.8-27B). La modificación principal consiste en expandir el modelo de 27B a 31B añadiendo secciones en ubicaciones específicas para crear zonas donde el modelo "pondere" y "re-pondere" información, con la intención de producir planes más detallados y profundizar en detalles críticos. El autor reconoce que el proceso manual introduce defectos (repetición de palabras, glitches menores, necesidad ocasional de pulsar "continuar" en salidas complejas) y aplica un entrenamiento ligero en etapas ("Stage 1, very light tune") para corregirlos manteniendo la funcionalidad.

Sobre esa base se aplica la rama abliterated/heretic/uncensored, que elimina el comportamiento de rechazo del modelo original, y se integra el sistema Turbo Brilliance 50X, que no es un cambio de pesos sino un conjunto de modos y "constructs" (personas de sistema) activables mediante comandos en el prompt. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Tampoco se detalla si la expansión de parámetros usa atención lineal, decodificación especulativa u otras innovaciones de inferencia.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 256k tokens).
- Razonamiento explícito en modo "thinking", con 27 modos de razonamiento y 9 modos "Xhigh" de razonamiento extendido.
- 27 modos de instrucción para ajustar el estilo y el enfoque de la respuesta.
- 15 "AI Constructs" y 5 "Super AI Constructs" (Brainstorm AI, Brainstorm Business AI, Universal Teacher AI, Agent AI, Coder AI, entre otros), activables por comando.
- Generación de código y asistencia de programación a través del "Coder AI Construct".
- Escritura creativa, ficción, narrativa de todos los géneros y roleplaying.
- Capacidad multimodal declarada por el pipeline image-text-to-text (image-text-to-text); no se detallan en la información disponible los detalles del codificador visual ni su alcance.
- Capacidades multilingües en 16 idiomas (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita).
- Soporte de tool calling y function calling: no disponible en la información proporcionada; el sistema Agent AI Construct sugiere uso agéntico, pero no se documenta una API de herramientas.
- Sistema de ayuda integrado: escribir "help" en el chat muestra los modos y constructs disponibles.

## Casos de uso

- Planificación de negocio y consultoría estratégica: el "Brainstorm Business AI Construct" está diseñado para generar planes de negocio con tablas y gráficos a partir de una petición simple; el contexto de 64k-128k permite incorporar documentos de mercado y datos financieros en el mismo prompt.
- Escritura creativa y narrativa larga: con 256k de contexto y modos de escritura para todos los géneros, es adecuado para novelas por capítulos, manteniendo coherencia de personajes y tramas a lo largo de decenas de miles de tokens.
- Roleplaying y simulación de personajes: los constructs y la rama uncensored permiten sesiones de rol sin las restricciones del modelo base, útil para prototipado de videojuegos narrativos o entrenamiento de guionistas.
- Generación de código asistida: el Coder AI Construct permite tareas de programación dentro de un contexto amplio, útil para revisar repositorios medianos o explicar código legacy en una sola pasada.
- Docencia y tutoría: el Universal Teacher AI Construct está pensado para explicar conceptos con profundidad variable; el contexto largo permite adjuntar material didáctico completo y generar ejercicios derivados.
- Investigación sobre modificación de arquitecturas: el modelo sirve como caso de estudio reproducible de expansión de parámetros ("looping transformer") y de los efectos de la abliteration sobre el comportamiento, para quienes investigan interpretabilidad o ajuste fino.
- Prototipado de agentes: el Agent AI Construct y los modos de razonamiento extendido permiten experimentar con flujos multi-paso; conviene validar el soporte real de tool calling antes de integrarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 62 GB solo para pesos (30,83B × 2 bytes), más overhead de activaciones y caché KV; requiere al menos 80 GB para contexto corto y más para contextos de 64k-128k.
- VRAM estimada en cuantización Q4: en torno a 17-20 GB para pesos, con overhead adicional según contexto; viable en GPUs de 24 GB solo con contexto moderado.
- GPU recomendadas: A100 80 GB o H100 80 GB para bfloat16 con contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para cuantizaciones Q4/Q5 con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con GGUF Q4 y contexto limitado; en GPUs de 16 GB solo con cuantizaciones más agresivas y contexto muy corto.
- Opciones de despliegue: transformers (formato nativo safetensors), llama.cpp/Ollama y LM Studio mediante los GGUF del árbol de modelos del autor; vLLM y TGI no están confirmados en la información disponible para esta arquitectura modificada.
- Latencia y throughput: no disponibles. El autor advierte que Q4KS limita la calidad y que el modo "medium" de razonamiento reduce el rendimiento frente a "xhigh".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored | 30,83B | 256k | Apache 2.0 | Fine-tune experimental con expansión estructural y abliteration; sin benchmarks publicados |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible en la informacion | Apache 2.0 (según modelo base) | Modelo original sin modificar; conserva filtros de seguridad y comportamiento estándar |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO | 27B | no disponible en la informacion | Apache 2.0 | Misma familia Heretic/Uncensored sin la expansión a 31B; referencia directa del autor |
| DavidAU/Qwen3.8-40B-Ultimate | 40B (proyecto) | no disponible en la informacion | Apache 2.0 | Proyecto anunciado por el autor con mayor expansión; estado no confirmado |

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte de repeticiones de palabras, glitches menores y necesidad ocasional de continuar la generación en salidas complejas, incluso tras el entrenamiento correctivo.
- Abliteration y uncensored: se ha eliminado la dirección de rechazo, por lo que el modelo puede producir contenido dañino, ilegal o sexualmente explícito; no es apto para aplicaciones orientadas al público sin capas de moderación adicionales.
- Sesgos: al derivar de Qwen3.8 y de un proceso de abliteration, conserva los sesgos del corpus original y añade un "punto de vista diferente" que el autor menciona explícitamente; no se documentan evaluaciones de sesgo.
- Alucinación: sin benchmarks publicados ni evaluaciones de fidelidad, el riesgo de alucinación es desconocido y potencialmente elevado en un modelo ajustado para ser más verboso y "profundo".
- Contexto: aunque se declaran 256k tokens, el autor recomienda 64k-128k y advierte que cuantizaciones Q4 limitan la calidad; el rendimiento real en contextos muy largos no está verificado.
- Idiomas: la model card declara 16 idiomas, pero la etiqueta de idioma del repo solo lista "en"; la calidad en el resto no está evaluada.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden imponer condiciones adicionales; conviene revisar la licencia de Qwen/Qwen3.8-27B y el origen de los datos del fine-tune.
- Producción: no hay soporte confirmado en vLLM o TGI para la arquitectura modificada, lo que limita el despliegue a transformers o llama.cpp; la falta de benchmarks impide estimar el coste real por token.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Documentación de uso y Turbo Brilliance 50X: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Proyecto Qwen3.8-27B-Ultimate: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate
- Proyecto Qwen3.8-40B-Ultimate: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate
- Colección Turbo Brilliance AI Constructs 50X: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
