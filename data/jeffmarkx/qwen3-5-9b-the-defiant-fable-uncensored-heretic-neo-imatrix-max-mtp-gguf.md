# jeffmarkx/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF es una cuantización GGUF publicada por el usuario jeffmarkx a partir del modelo de ajuste fino DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP, obra de DavidAU y Nightmedia. Se trata de un fine tune multi-etapa y multi-modelo sobre la familia Qwen 3.5 de 9B (8.953.803.264 parámetros), con el objetivo declarado de elevar la inteligencia general y el seguimiento de instrucciones del modelo base. El modelo se distribuye en variantes "Regular" y "MTP" (multi-token prediction), todas en formato GGUF con cuantización NEO Imatrix.

La característica diferencial es su naturaleza "heretic" y "abliterated": el modelo ha sido entrenado tras un proceso de eliminación de rechazos, de modo que responde sin las negativas habituales de los modelos alineados. Incorpora modos de razonamiento (thinking) y de instrucción, y el autor afirma que supera a Qwen 3.5 27B, Qwen 3.6 35B-A3B y Qwen 3.6 27B en siete benchmarks críticos, aunque advierte que eso no implica superioridad en todas las tareas.

Es relevante porque ofrece un modelo de ~9B con contexto y capacidades de razonamiento en un paquete que cabe en hardware de consumo, con cuantizaciones de 4 y 8 bits que, según el autor, preservan el rendimiento casi intacto (ARC-C de 0,640 en mxfp4 frente a 0,649 en bf16). El repositorio ocupa 204,9 GB e incluye múltiples variantes de cuantización, incluidas las de decodificación especulativa MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5), con soporte de multi-token prediction (MTP) en las variantes correspondientes |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el autor menciona mejora de rendimiento en contexto largo con NEO Imatrix, sin cifra) |
| Tipos de cuantizacion | GGUF: mxfp8, mxfp4, Q4_K_S, Q6, Q8, bf16/16-bit; variantes Regular y MTP; tensores MTP en Q8_0; tensor de salida en 16 bits |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base); pipeline image-text-to-text |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura transformer densa de Qwen 3.5 de 9B (8,95B parámetros). El autor describe el proceso como un fine tune multi-etapa y multi-modelo realizado en hardware local, en el que se combinaron varios de sus propios fine tunes de 9B de Qwen 3.5 mediante un merge multi-etapa. El objetivo declarado fue doble: incrementar la inteligencia general y mejorar el seguimiento de instrucciones, ya que, según el autor, optimizar ambas dimensiones eleva el rendimiento de extremo a extremo.

El modelo es "heretic": se entrenó después de aplicar un proceso de "heretic'ing" (eliminación de comportamientos de rechazo), lo que da lugar a un modelo totalmente sin censura que "hace lo que se le pide, sin preguntas". Además, el bloque de pensamiento/razonamiento se ha compactado y, según el autor, en muchos casos es más potente. Las cuantizaciones GGUF emplean NEO Imatrix, que según el autor mejora la precisión entre un 2 y un 4 % sobre GGUFs normales y el rendimiento en contexto largo; el tensor de salida (10-20 % de la salida) se mantiene en precisión completa de 16 bits. Las variantes MTP incorporan decodificación multi-token con tensores MTP en Q8_0, pensada para acelerar la inferencia (el autor recomienda temperatura ≤ 1 y repetition penalty desactivado para no degradar la aceptación de tokens).

## Capacidades

- Generación de texto conversacional y de instrucciones, con modos separados de razonamiento (thinking) e instrucción.
- Razonamiento multi-paso y modo "thinking" con bloque de pensamiento compactado.
- Generación de código y tareas de programación (etiqueta "coder").
- Escritura creativa, ficción y roleplaying (etiquetas "creative", "writing", "fiction", "roleplaying").
- Capacidades multimodales declaradas en el pipeline (image-text-to-text), aunque la información disponible no detalla el procesador de visión.
- Soporte multilingüe en 16 idiomas: árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita.
- Modelo sin censura ("uncensored", "abliterated"): no aplica rechazos de contenido.
- Decodificación especulativa multi-token (MTP) en las variantes MTP para acelerar la generación.
- No se documenta explícitamente soporte de tool calling ni de function calling en la información disponible.

## Casos de uso

- Escritura creativa y ficción: el modelo está etiquetado específicamente para ficción y escritura; su naturaleza sin censura permite abordar tramas y temas que los modelos alineados rechazan, con modos de instrucción para controlar el tono.
- Roleplaying y personajes conversacionales: la combinación de fine tune conversacional, contexto multi-turno y ausencia de rechazos lo hace adecuado para chatbots de personaje y simulaciones narrativas interactivas.
- Generación de código en local: la etiqueta "coder" y su tamaño de ~9B permiten desplegarlo en estaciones de trabajo para autocompletado, explicación y refactorización de código sin depender de la nube.
- Razonamiento asistido con modo thinking: para problemas de lógica, matemáticas o análisis que requieren cadena de pensamiento, activando el modo de razonamiento; el autor indica que en modo thinking supera en la mayoría de casos las puntuaciones de modo instruct.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S y mxfp4 permiten ejecutar el modelo en GPU de gama alta de consumo, útil para prototipado e investigación sin infraestructura dedicada.
- Investigación sobre alineación y censura: al ser un modelo "heretic" y "abliterated", sirve como objeto de estudio para analizar qué comportamientos se eliminan al aplicar técnicas de abliteration y cómo afecta al rendimiento en benchmarks.
- Generación de contenido multilingüe: con 16 idiomas soportados, puede emplearse para redacción y traducción asistida en mercados como el hispanohablante, el francófono o el asiático.
- Inferencia de baja latencia con MTP: en escenarios que priorizan velocidad (chat en tiempo real, generación por streaming), las variantes MTP ofrecen decodificación multi-token con tasas de aceptación declaradas en torno al 60 % para 2 tokens.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (modo instruct, harness de evaluación):

| Modelo / cuantización | ARC-C | ARC-E | BoolQ | HellaSwag | OBQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| Defiant-Fable 9B (bf16) | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Defiant-Fable 9B (mxfp8) | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Defiant-Fable 9B (mxfp4) | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.5-27B-Instruct (mxfp8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-27B-Instruct (mxfp8) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.8-27B (mxfp8) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.8-27B (mxfp4) | 0,581 | 0,771 | 0,889 | 0,738 | 0,442 | 0,798 | 0,713 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |

El autor señala que estas cifras corresponden a modo instruct y que en modo thinking el modelo supera en la mayoría de casos las puntuaciones de instruct. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantización de 4 bits (Q4_K_S o mxfp4) el modelo de ~9B ocupa del orden de 5-6 GB de pesos, más overhead de contexto KV; en 8 bits (mxfp8/Q8) alrededor de 9-10 GB; en bf16 unos 18 GB.
- GPU recomendadas: RTX 4090 (24 GB) para bf16 o Q8 con contexto amplio; RTX 4080/4070 Ti (16 GB) para Q8 o Q6; RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para Q4 con contexto moderado; A100/H100 no necesarias pero válidas para despliegues concurrentes.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q6 en tarjetas de 12-16 GB; en Q8 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, vLLM (soporte GGUF con limitaciones), servidores compatibles con endpoints (el repo incluye la etiqueta endpoints_compatible).
- Latencia y throughput: el autor declara ~130 t/s en Q4_K_S con GGUFs regulares; las variantes MTP, con aceptación del 60 % para 2 tokens, pueden superar esa cifra. El autor recomienda mantener temperatura ≤ 1 y repetition penalty en 1 (desactivado) para no degradar el rendimiento MTP, y cambiar a cuantizaciones regulares si la tasa de aceptación de tokens cae por debajo del 50 %.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Defiant-Fable 9B (este modelo) | 8,95B | no disponible | Apache 2.0 | GGUF | Fine tune sin censura con modos thinking/instruct y MTP |
| Qwen3.5-9B-Instruct | ~9B | no disponible | Apache 2.0 (según familia Qwen) | safetensors/GGUF | Base alineada; peor ARC-C (0,571) que el fine tune |
| Qwen3.6-27B-Instruct | ~27B | no disponible | no disponible | safetensors/GGUF | Mayor tamaño; supera al 9B en HellaSwag y WinoGrande |
| Qwen3.6-35B-A3B-Instruct | ~35B totales (A3B activos) | no disponible | no disponible | safetensors/GGUF | MoE; requiere más VRAM, superado por el 9B en ARC-C |

## Limitaciones y advertencias

- Modelo "heretic" y "abliterated": no aplica rechazos de contenido, lo que implica riesgo de generar material dañino, ilegal o sexualmente explícito; no es adecuado para aplicaciones de cara al público sin filtros externos.
- Riesgo de alucinación inherente a los modelos de ~9B; el autor advierte que superar benchmarks concretos no garantiza superar a modelos de 27B en todas las tareas.
- El autor reconoce que las puntuaciones en modo thinking no reflejan "el verdadero alcance" de las mejoras, por lo que los benchmarks publicados pueden subestimar o no representar el comportamiento real en producción.
- Las cuantizaciones MTP degradan su rendimiento con temperaturas altas o repetition penalty activado; si la aceptación de tokens cae por debajo del 50 % conviene usar las variantes regulares.
- No se documenta la longitud de contexto exacta ni el soporte de tool calling, lo que limita su uso en pipelines de agentes sin validación previa.
- El repositorio ocupa 204,9 GB por acumular múltiples cuantizaciones; la descarga completa no es necesaria, pero conviene seleccionar la variante concreta.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de alineación de seguridad traslada al desplegador toda la responsabilidad sobre el contenido generado.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de las afirmaciones del autor.

## Enlaces

- Hugging Face: https://huggingface.co/jeffmarkx/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo relacionado del autor: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Perfil del autor del fine tune: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support
