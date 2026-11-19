# sinhal/SageV2-8B-LongContext-NSFW-RP

## Resumen

SageV2-8B-LongContext-NSFW-RP es un modelo de generación de texto de 8.030 millones de parámetros, desarrollado por el usuario sinhal y publicado en Hugging Face. Se trata de un ajuste fino (SFT) orientado a roleplay de largo contexto, construido sobre `mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated`, que a su vez deriva del Llama 3.1 8B Instruct de Meta. El modelo está diseñado explícitamente para mitigar la deriva de personaje en conversaciones largas: el autor documenta que la mayoría de modelos de rol pierden fidelidad al personaje a partir del turno 30, reciclando frases y homogeneizando voces.

La propuesta técnica se centra en la estabilidad conversacional profunda. El autor reporta métricas internas medidas sobre un guion fijo de 40 turnos con entradas de baja información, mostrando reducción de solapamiento de 6-gramas del 35,0% al 9,3% en los últimos diez turnos, y una separación estilística entre personajes con solapamiento Jaccard entre 0,09 y 0,22. El modelo se distribuye tanto en safetensors como en GGUF cuantizado para llama.cpp, con variantes Q8_0, Q6_K, Q4_K_M y Q2_K.

Es relevante ahora por dos motivos: primero, porque aborda un problema práctico poco tratado en la literatura de fine-tuning de rol (la degradación de personaje en contexto largo); segundo, porque incluye un conjunto de cuantizaciones y ajustes de muestreo (repetition penalty 1.08, min_p 0.05) orientados a despliegue real en hardware de consumo. Su licencia Llama 3.1 y su naturaleza "abliterated" y NSFW condicionan fuertemente su uso comercial y su despliegue público.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parámetros totales | 8.030.261.312 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K (optimizado, según model card); contexto nativo de Llama 3.1: 128K |
| Tipos de cuantización | Q8_0, Q6_K, Q4_K_M, Q2_K (GGUF); safetensors en precisión original |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct: un transformer decoder-only con atención por grupos (GQA), 32 capas y contexto nativo de 128K tokens. El modelo parte de la variante "abliterated" de mlabonne, que elimina el mecanismo de rechazo del modelo original mediante una intervención sobre las direcciones de activación asociadas a la negativa. Sobre esa base, sinhal aplica un ajuste fino supervisado (SFT) usando TRL, con Unsloth como acelerador de entrenamiento según las etiquetas del repositorio.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. El autor sí documenta el proceso de evaluación: guiones fijos de 40 turnos, medición de solapamiento de 6-gramas, separación de personajes mediante Jaccard y análisis de calidad de prosa sobre 9.540 palabras generadas. La innovación declarada no es arquitectónica sino de ajuste: preservar la voz del personaje definida en la tarjeta a lo largo de conversaciones profundas, reduciendo la tendencia al bucle y a la voz por defecto del modelo.

## Capacidades

- Generación de texto conversacional multi-turno con foco en fidelidad de personaje.
- Roleplay de largo contexto: mantiene arquetipos y estilo a lo largo de decenas de turnos según las métricas del autor.
- Diferenciación estilística entre personajes definidos en la tarjeta (longitud de respuesta, puntuación, registro).
- Generación de prosa narrativa con "action beats" (el autor reporta 100% de respuestas con beats tras el ajuste).
- Resistencia a entradas de baja información ("ok", "lol", "...", "wat"): 10/10 según el autor.
- Ausencia de rechazos en prompts de rol adversariales (0/4 reportados), consecuencia de la base abliterated.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas a inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Roleplay conversacional de largo alcance: el modelo está ajustado para sostener un personaje durante 40+ turnos con entradas pobres, lo que lo hace adecuado para aplicaciones de entretenimiento conversacional donde la coherencia de personaje es el criterio principal.
- Personajes virtuales persistentes: gracias a la ventana de 128K tokens, se puede inyectar una tarjeta de personaje extensa más un historial largo sin truncar, manteniendo el estilo definido.
- Simulación narrativa interactiva: escritura de ficción colaborativa donde varios personajes con voces distintas deben alternarse sin contaminarse estilísticamente (solapamiento Jaccard 0,09-0,22 reportado).
- Prototipado de agentes con personalidad: para pruebas internas de sistemas conversacionales donde se necesita un modelo sin rechazos y con control fino de muestreo.
- Evaluación de técnicas de muestreo: el autor publica ajustes concretos (repeat_penalty 1.08, min_p 0.05, temperature 0.95, DRY), lo que lo convierte en una base útil para experimentar con samplers en llama.cpp.
- Despliegue en hardware de consumo: con Q6_K (6,14 GB) cabe completo en una GPU de 8 GB y alcanza 37,4 t/s en una RTX 4060 laptop según el autor, lo que permite ejecución local en equipos modestos.
- Investigación sobre abliteration y alineación: al derivar de una base abliterated, sirve para estudiar el comportamiento de modelos sin mecanismos de rechazo en dominios sensibles.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Los datos disponibles son métricas internas de evaluación de rol:

| Métrica | Antes | Después |
|---|---|---|
| Reutilización literal de frases (40 turnos) | 6 | 2 |
| Solapamiento de 6-gramas, últimos 10 turnos | 35,0% | 9,3% |
| Solapamiento de 6-gramas, primeros 10 turnos | 9,2% | 0,2% |
| Respuestas vacías o truncadas | 0 | 0 |
| Clichés por 1.000 palabras | 4,4 | 2,3 |
| Respuestas con action beats | 88% | 100% |
| Escritura del diálogo del usuario | no disponible | 0 / 87 |
| Rechazos en prompts adversariales | no disponible | 0 / 4 |
| Mantiene personaje con entradas mínimas | no disponible | 10 / 10 |

Separación de personajes (5 tarjetas, guion idéntico de 6 turnos):

| Personaje | Palabras/respuesta | Exclamaciones | Arquetipo |
|---|---|---|---|
| Grimsby | 17 | 0 | lacónico |
| Vesper | 75 | 0 | frío, interrogativo |
| Aiwu | 82 | 0 | sarcástico |
| Edith | 101 | 7 | cálido, anecdótico |
| Pip | 143 | 44 | maníaco, jerga |

Rendimiento de inferencia (llama-bench, CUDA, flash attention, batch 2048 / ubatch 512, RTX 4060 laptop):

| Cuantización | Tamaño | Cabe en 8 GB VRAM | Velocidad |
|---|---|---|---|
| Q8_0 | 7,95 GB | parcial (25/32 capas) | 17,1 t/s |
| Q6_K | 6,14 GB | completa (32/32) | 37,4 t/s |
| Q4_K_M | 4,58 GB | completa (32/32) | 48,0 t/s |
| Q2_K | 2,96 GB | completa (32/32) | 61,2 t/s |

## Requisitos de hardware

- VRAM estimada: Q8_0 ~8 GB (con desbordamiento a CPU), Q6_K ~6,2 GB, Q4_K_M ~4,6 GB, Q2_K ~3 GB. Para contexto de 16K+ se recomienda Q4_K_M con margen.
- GPU recomendadas: RTX 4060 laptop (datos del autor), RTX 3060 12 GB, RTX 4070, RTX 4090; en datacenter, A100 o H100 para contexto completo de 128K y mayor throughput.
- Cabe en GPU de consumo: sí, desde una GPU de 8 GB con Q6_K en adelante.
- Opciones de despliegue: llama.cpp (llama-server), y por compatibilidad de formato GGUF también Ollama y otros frontends basados en llama.cpp. vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: 37,4 t/s con Q6_K en RTX 4060 laptop; 48,0 t/s con Q4_K_M; 61,2 t/s con Q2_K. Datos del autor, no verificados de forma independiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SageV2-8B-LongContext-NSFW-RP | 8,03B | 128K | Roleplay largo, abliterated | llama3.1 | HF, GGUF |
| mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated (base) | 8,03B | 128K | Instruct sin rechazos | llama3.1 | HF |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 128K | Instruct generalista | llama3.1 | HF |

No se dispone en la información proporcionada de comparativas con otros modelos de rol de la misma categoría (por ejemplo, variantes de roleplay de 8B) ni de resultados de benchmarks que permitan una comparación cuantitativa objetiva. El autor indica que el modelo ocupa el puesto 50 en la categoría de roleplay del leaderboard de Hugging Face, pero no se aportan los datos subyacentes.

## Limitaciones y advertencias

- Modelo "abliterated": se ha eliminado el mecanismo de rechazo, por lo que puede generar contenido dañino, explícito o no seguro sin filtro.
- Contenido NSFW: la model card lo etiqueta como "not-for-all-audiences"; no es apto para aplicaciones orientadas al público general sin moderación adicional.
- Solo inglés: no se documenta soporte multilingüe; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; en tareas de conocimiento es un modelo de 8B sin benchmarks públicos.
- Sesgos: no se documentan análisis de sesgo; hereda los del Llama 3.1 original y los del proceso de abliteration.
- Licencia Llama 3.1: impone restricciones de uso comercial (política de uso aceptable de Meta, umbral de 700 millones de usuarios mensuales) y obliga a incluir el aviso de licencia y la atribución "Built with Meta Llama 3.1".
- Dependencia de parámetros de muestreo: el autor advierte que con repeat_penalty a 1.0 el modelo entra en bucle y pierde el personaje; el rendimiento reportado depende de la configuración recomendada (repeat_penalty 1.08, min_p 0.05, temperature 0.95).
- Métricas no verificadas de forma independiente: todas las cifras de calidad provienen del autor y de un conjunto limitado de guiones.
- Contexto de 128K: aunque soportado, el coste de memoria y la degradación a contextos muy largos no están evaluados en la información disponible.
- Fecha de creación del repositorio (2026-10-06) posterior a la fecha actual de referencia; conviene verificar la vigencia y el estado del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sinhal/SageV2-8B-LongContext-NSFW-RP
- Modelo base: https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
