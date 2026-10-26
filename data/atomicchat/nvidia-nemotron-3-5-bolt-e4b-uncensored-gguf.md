# AtomicChat/NVIDIA-Nemotron-3.5-Bolt-E4B-Uncensored-GGUF

## Resumen

AtomicChat/NVIDIA-Nemotron-3.5-Bolt-E4B-Uncensored-GGUF es una redistribución en GGUF del modelo NVIDIA Nemotron 3.5 Bolt E4B (post-entrenamiento de NVIDIA sobre Gemma-4-E4B-it) a la que se le ha proyectado fuera la dirección de rechazo mediante técnicas de *abliteration*, siguiendo el método de Arditi et al. (2024). No es un modelo nuevo: es el mismo conjunto de pesos con una edición quirúrgica en 126 matrices, empaquetada tanto en cuantizaciones "Atomic Dynamic" listas para usar como en un adaptador LoRA de rango 1 de solo 3,5 MB.

El interés práctico está en que el autor publica la medición del coste de la edición: la tasa de rechazo cae del 93,8% al 1,2% en JailbreakBench y del 76% al 0% en prompts de red teaming en ruso, mientras MMLU pasa de 68,50% a 67,85% (2000 preguntas, McNemar p = 0,21), es decir, sin degradación estadísticamente significativa. La divergencia KL frente al BF16 original es 0,163 en AD-Q6_K y 0,241 en AD-Q4_K_M sobre texto neutro de retención.

Arquitectónicamente hereda las particularidades de Gemma 4: 42 bloques, dimensión oculta 2560, *per-layer embeddings* y tres escrituras al *residual stream* por bloque, lo que obliga a adaptar las recetas habituales de abliteración. Los ficheros se ejecutan con llama.cpp estándar (soporte `gemma4`) sin parches y con una ventana de ejemplo de 32.768 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Gemma 4 (linaje Gemma-4-E4B-it): 42 bloques, dimensión oculta 2560, *per-layer embeddings* y tres escrituras al *residual stream* por bloque |
| Parámetros totales | 863.744 según el campo de safetensors del repo (unidad no indicada); la nomenclatura E4B implica unos 4B efectivos sobre un total de ~8B |
| Parámetros activos | No aplica: no es un MoE. El diseño E4B/*per-layer embeddings* deja aproximadamente 4B parámetros efectivos |
| Longitud de contexto | 32.768 tokens en los comandos de ejemplo del autor (`-c 32768`); máximo soportado no disponible |
| Tipos de cuantización | AD-Q6_K (7,38 GB), AD-Q4_K_M (5,06 GB); LoRA rank-1 en GGUF de 3,5 MB pensado para escala 1,25 |
| Idiomas soportados | No disponible (evaluación publicada solo en inglés y ruso; el modelo base es multilingüe) |
| Licencia | openmdw-1.1 (OpenMDW 1.1); en HuggingFace aparece con el tag `other` |
| Formato de pesos | GGUF para llama.cpp; el adaptador también en GGUF (`--lora-scaled`) |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (finetune) |
| Tamaño del repo | 12,4 GB |
| Modalidades | Texto; visión y audio requieren el proyector de los cuants originales (no incluido ni probado en estos ficheros) |

## Arquitectura y entrenamiento

La base es Nemotron 3.5 Bolt E4B, un post-entrenamiento de NVIDIA sobre Gemma-4-E4B-it. Según la documentación del cuantizador y de terceros, NVIDIA aplicó aprendizaje por refuerzo multi-entorno con GRPO (NeMo RL y NeMo Gym) sobre entornos de seguimiento de instrucciones, uso de herramientas multi-paso, conversaciones multi-turno y salida estructurada, con una arquitectura de RL asíncrona que desacopla entrenamiento e inferencia. La arquitectura subyacente no es un transformer convencional: cada bloque escribe tres veces en el *residual stream* y Gemma 4 normaliza cada escritura con sus propios pesos antes de sumarla, además de usar *per-layer embeddings*.

La edición de AtomicChat parte de 416 prompts dañinos y 416 inocuos en inglés (`harmful_behaviors`, `harmless_alpaca`) más 128 y 128 en ruso (Aya red-teaming, Russian Alpaca), todos con la plantilla de chat del modelo y *thinking* desactivado, con conjuntos de validación y test separados. La dirección de rechazo se calcula por profundidad como la media de los prompts dañinos menos la media de los inocuos, agrupando inglés y ruso y eliminando la componente alineada con la media de los inocuos; la dirección se computa atravesando las normas de Gemma 4, de modo que cada matriz deja de escribir la dirección tal como llega al *stream*. El resultado se materializa como un adaptador de rango 1 sobre 126 matrices (3,5 MB, escala 1,25) y se hornea en las builds AD-Q6_K y AD-Q4_K_M.

## Capacidades

- Generación de texto conversacional y razonamiento con modo *thinking* opcional, activable con `--chat-template-kwargs '{"enable_thinking": true}'`.
- Uso de herramientas y *function calling*: el autor afirma que las llamadas a herramientas no se ven afectadas por la edición; el modelo base fue entrenado con RL específicamente en uso de herramientas multi-paso y salida estructurada.
- Razonamiento multi-paso y comportamiento agéntico, heredado del entrenamiento en entornos de NVIDIA.
- Conversaciones multi-turno con contexto de hasta 32.768 tokens en la configuración publicada.
- Capacidades multimodales (imagen y audio) teóricamente presentes vía el proyector del modelo original, aunque no verificadas en estos ficheros.
- Multilingüismo heredado del modelo base, con evaluación explícita en inglés y ruso.
- Comportamiento sin rechazos: 1 rechazo de 81 prompts ingleses, 0 de 100 rusos y 1 de 250 XSTest en los ficheros horneados, sin respuestas vacías ni degeneradas.

## Casos de uso

- Investigación sobre alineación y *refusal directions*: banco de pruebas controlado para estudiar cómo una edición de rango 1 sobre 126 matrices altera el comportamiento de rechazo con una pérdida de MMLU de solo 0,65 puntos porcentuales y un KL medido de forma explícita.
- Evaluación de robustez y *red teaming* propio: al eliminar el rechazo, permite medir la facilidad con la que un modelo de ~4B efectivos produce contenido dañino, útil para calibrar clasificadores y filtros de salida externos.
- Generación creativa y ficción sin fricción: escritura de narrativa con violencia, temas adultos o lenguaje explícito donde un modelo alineado interrumpiría la respuesta, manteniendo coherencia multi-turno con 32.768 tokens de contexto.
- Asistente local de escritura técnica y brainstorming: despliegue en llama.cpp con AD-Q4_K_M (5,06 GB) sobre una única GPU de consumo, con *tool calling* para consultar documentación o ejecutar cálculos.
- Preprocesado de datos y *data augmentation*: generación de diálogos sintéticos y pares instrucción-respuesta en dominios sensibles (seguridad, medicina legal, análisis de contenido abusivo) donde el rechazo del modelo base bloquearía el pipeline.
- Análisis de contenido y moderación asistida: usar el modelo como generador de casos límite para entrenar o validar sistemas de moderación, apoyándose en la tasa de rechazo medida (1,2% en JailbreakBench) como línea base.
- Prototipado de agentes multi-paso en local: con salida estructurada y uso de herramientas heredados del RL de NVIDIA, sobre un modelo que cabe en 8-12 GB de VRAM.

## Benchmarks y rendimiento

Comportamiento tras la edición frente al original (datos del autor):

| Métrica | Antes (BF16 original) | Después (edición) |
|---|---:|---:|
| Rechazos en JailbreakBench (held-out) | 93,8% | 1,2% |
| Rechazos en prompts de red teaming en ruso | 76% | 0% |
| Rechazos en XSTest (prompts seguros) | 9,2% | 0,4% |
| Rechazos con *thinking* activado | 29 de 30 | 0 |
| MMLU (2000 preguntas) | 68,50% | 67,85% |

Fidelidad frente al BF16 original en texto neutro de retención (24 fragmentos de 4096 tokens):

| Build | Tamaño en disco | KLD media | Mismo top-1 |
|---|---:|---:|---:|
| AD-Q6_K | 7,38 GB | 0,163 | 87,14% |
| AD-Q4_K_M | 5,06 GB | 0,241 | 85,28% |
| LoRA sobre BF16 | 3,5 MB | 0,159 | no disponible |
| AD-Q6_K sin edición (solo cuantización) | no disponible | 0,026 | no disponible |
| AD-Q4_K_M sin edición (solo cuantización) | no disponible | 0,091 | no disponible |

No se han publicado resultados de HumanEval, GSM8K, MMLU-Pro ni de benchmarks de *tool calling* en la información disponible. La significación estadística del cambio en MMLU es nula según McNemar (p = 0,21).

## Requisitos de hardware

- VRAM estimada: unos 8,5-10 GB para AD-Q4_K_M con contexto moderado (5,06 GB de pesos más caché KV); unos 11-13 GB para AD-Q6_K (7,38 GB de pesos). El contexto de 32.768 tokens incrementa la caché KV de forma apreciable.
- GPU de consumo: AD-Q4_K_M cabe en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) con contexto reducido; AD-Q6_K encaja mejor en 16-24 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090). Para 32.768 tokens completos conviene partir de 16 GB.
- GPU de datacenter: A100 40/80 GB, H100 y L40S sin problema; sobredimensionadas para este tamaño salvo que se busque alto *throughput* con batching.
- Despliegue: llama.cpp / `llama-server` con `-ngl 99 -c 32768 --jinja`; requiere soporte `gemma4` en llama.cpp upstream (sin parche). El LoRA se carga con `--lora-scaled ... 1.25`, no con `--lora`. No se documenta soporte verificado en vLLM ni TGI para estos GGUF.
- Latencia y *throughput*: no disponibles (el autor no publica mediciones).
- Almacenamiento: 12,4 GB para el repo completo; 5,06 GB o 7,38 GB si se descarga una sola build mediante `hf download --include`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Estado de rechazo | Calidad medida | Licencia | Formato |
|---|---|---|---|---|---|---|
| AtomicChat Nemotron 3.5 Bolt E4B Uncensored (este) | ~4B efectivos | 32.768 (ejemplo) | 1,2% en JailbreakBench; MMLU 67,85% | KLD 0,163 (Q6_K) frente a BF16 | openmdw-1.1 | GGUF + LoRA |
| AtomicChat NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF | ~4B efectivos | no disponible | Sin editar (rechazos intactos); MMLU 68,50% | KLD 0,026 (Q6_K) y 0,091 (Q4_K_M) | no disponible en la información | GGUF |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | ~4B efectivos | no disponible | Sin editar | Referencia de todas las métricas | no disponible en la información | safetensors (BF16) |
| unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF | ~4B efectivos | no disponible | Sin editar | No disponible | no disponible en la información | GGUF |
| Gemma-4-E4B-it (ancestro) | ~4B efectivos | no disponible | Alineado | No disponible | no disponible en la información | no disponible |

Las alternativas abliteradas de otros autores para este mismo modelo base no aparecen en la información proporcionada.

## Limitaciones y advertencias

- Un *release gate* del propio autor no se cumple: en prompts inocuos el primer token se aleja del original más de lo permitido (KL 0,141 frente al límite de 0,10). El autor señala que, en este modelo, incluso una dirección aleatoria editada del mismo modo mueve el texto neutro de forma perceptible.
- La eliminación de la dirección de rechazo es deliberada y afecta a la seguridad: el modelo producirá contenido que el original rechazaba. Requiere filtros externos y responsabilidad plena del desplegador; no debe exponerse sin moderación a usuarios finales.
- La evaluación multilingüe se limita a inglés y ruso; el comportamiento en castellano u otros idiomas no está medido.
- La evaluación con *thinking* activado (29 de 30 rechazos a 0) se realizó sobre la edición, no sobre los ficheros horneados; los ficheros AD-Q6_K y AD-Q4_K_M solo se validaron con *thinking* desactivado.
- La KLD se midió sobre 24 fragmentos de 4096 tokens de texto neutro; es una ventana estrecha y no cubre razonamiento, código ni matemáticas.
- El adaptador LoRA se calibró a escala 1,25: cargarlo con `--lora` (escala 1,0) produce un comportamiento distinto del documentado.
- Visión y audio no se probaron en estos ficheros y el proyector no está incluido; hay que tomarlo de los cuants originales.
- Licencia openmdw-1.1 más las posibles condiciones derivadas del modelo base de NVIDIA/Gemma: conviene revisar los términos aplicables antes de un uso comercial, ya que la ficha no detalla la compatibilidad de licencias del derivado.
- Riesgo de alucinación y deriva de coherencia no cuantificado más allá de MMLU y KLD; no hay datos de sesgos demográficos ni de toxicidad medidos en esta edición.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Bolt-E4B-Uncensored-GGUF
- Cuants originales sin editar del mismo autor: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Colección "NVIDIA Nemotron 3.5 Uncensored": https://huggingface.co/collections/AtomicChat/nvidia-nemotron-35-uncensored
- Perfil del autor: https://huggingface.co/AtomicChat
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Cuants alternativos de terceros: https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Repositorio de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord del proyecto: https://discord.gg/8wGSsvmg4V
- Sitio del proyecto: https://atomic.chat/
- Método de referencia: Arditi et al., "Refusal in Language Models Is Mediated by a Single Direction" (2024), arXiv:2406.11717
