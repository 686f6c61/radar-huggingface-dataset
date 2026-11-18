# NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp

## Resumen

Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp es una cuantización de 8 bits del modelo `empero-ai/Qwen3.8-35B-A3B-Distill`, publicada por Novaeon.Studio bajo licencia Apache 2.0. Se trata de un modelo de mezcla de expertos (MoE) con 35.951.822.704 parámetros totales y aproximadamente 3B activos por token, destilado a partir de profesores Qwen3.8 y orientado a razonamiento, uso de herramientas y cargas agénticas.

La build está pensada específicamente para Apple Silicon: usa la librería MLX, cuantiza los pesos a 8 bits casi uniformes manteniendo el router en fp16 y conserva la torre de visión del modelo original, por lo que admite entrada de imagen y texto. Incluye además una cabeza nativa de predicción multi-token (MTP) que actúa como decodificación especulativa y acelera la generación.

Su relevancia actual radica en que ofrece un perfil poco habitual: contexto nativo de 262.144 tokens, capacidades multimodales y agénticas, y un rendimiento medido de hasta ~120 tok/s en un Mac con M5 Max de 128 GB, con un peso en disco de ~39,5 GB. Es, por tanto, una opción para desplegar agentes locales de forma sostenida en hardware de consumo de gama alta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (tipo `qwen3_5_moe`) con atención híbrida, torre de visión y cabeza MTP |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | 8 bits (oQ8) con router en fp16; pesos en safetensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es una destilación de profesores Qwen3.8 en una arquitectura MoE dispersa: de los ~35B parámetros totales solo se activan ~3B por token, lo que reduce el coste computacional por paso de decodificación. La atención es híbrida, de modo que solo unas 10 de las 40 capas mantienen una caché KV creciente; esto es lo que permite sostener contextos de 124k tokens con una caída de velocidad moderada (de 120 a 70 tok/s). La build de Novaeon conserva la torre de visión del modelo original y añade una cabeza MTP funcional que actúa como mecanismo de decodificación especulativa, con una mejora declarada de ~40 % en decodificación de contexto corto frente a MTP desactivado.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada. La model card indica que la cuantización se aplicó de forma casi uniforme a 8 bits, con el router preservado en fp16 para no degradar la selección de expertos.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (thinking) activable y desactivable.
- Entrada multimodal imagen-texto a texto: la torre de visión se mantiene en esta build.
- Tool calling y function calling, con soporte de llamadas paralelas a herramientas.
- Comportamiento agéntico en entornos con herramientas reales (sandbox), incluyendo recuperación de errores de herramienta.
- Contexto largo: recuperación tipo needle verificada a 130k tokens (y 320k en una prueba anterior según el autor).
- Decodificación especulativa mediante cabeza MTP nativa.
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Agentes locales 24/7 en Apple Silicon: el modelo está optimizado para oMLX en Macs de 64 GB o más, con ~41,5 GB residentes, lo que permite mantener un agente siempre activo junto a otros modelos en memoria.
- Automatización de tareas de desarrollo en sandbox: suites agénticas con herramientas reales (corregir un bug, escribir código según especificación, analizar CSV y logs) superadas 9/9 y 13/13 según el autor, con 0 llamadas de herramienta inválidas en las pruebas.
- Análisis de documentos e imágenes largos: con 262k tokens de contexto nativo y visión, es adecuado para procesar informes extensos con figuras o capturas y responder preguntas sobre ellos.
- Asistentes de atención al cliente multi-turno: el contexto largo y el bajo coste por token (~3B activos) permiten mantener historiales extensos sin disparar la latencia.
- Pipelines de function calling en producción: la ausencia de llamadas inválidas en las pruebas y el soporte de llamadas paralelas lo hacen apto para orquestación de herramientas en flujos automatizados.
- Prototipado e investigación en local: al ser Apache 2.0 y ejecutable en MLX, sirve para experimentar con destilación MoE, MTP y decodificación especulativa sin depender de infraestructura cloud.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| IFEval | inst-strict | 86,33 |
| IFEval | prompt-strict | 80,22 |
| IFEval | media (según model card) | 84,86 |

Rendimiento medido por el autor en un Apple M5 Max de 128 GB con oMLX 0.7.3, MTP activado y thinking desactivado:

| Contexto del prompt | ~300 | ~41k | ~124k |
|---|---|---|---|
| Decodificación (tok/s) | 120 | 105 | 70 |
| Prefill (tok/s) | no disponible | 2.883 | 1.746 |
| Time to first token | 0,24 s | 14,3 s | 70,9 s |

Pruebas internas del autor (no estándar): 39–40/43 en casos golden de un turno, 15–16/17 en el conjunto de mitigaciones, 9/9 y 13/13 en dos suites agénticas multi-paso, 6/6 en sondas de uso de herramientas y 0 llamadas de herramienta inválidas. Con 4 peticiones en paralelo reporta ~216 tok/s agregados.

## Requisitos de hardware

- Huella en disco: ~39,5 GB; en memoria: ~41,5 GB residentes.
- Hardware de referencia: Apple M5 Max con 128 GB de memoria unificada; el autor indica que funciona en Macs de 64 GB o más.
- No está pensado para GPU NVIDIA: la build usa MLX y está orientada a Apple Silicon. Para CUDA habría que recurrir al modelo base o a otras cuantizaciones.
- Motor de despliegue: oMLX (MLX, motor VLM); también carga en `mlx-vlm`.
- Latencia: time to first token de 0,24 s en contexto corto, 14,3 s a 41k y 70,9 s a 124k; carga en frío de ~1–6 s con caché de disco caliente.
- Throughput: 96–134 tok/s en decodificación corta según sesión; ~216 tok/s agregados con 4 peticiones paralelas.

## Comparativa con modelos similares

Datos de la comparativa interna del autor, medida en el mismo Mac y sesión:

| Modelo | Golden /43 | Mitig. /17 | Agéntico | Decodificación (tok/s) | Veredicto |
|---|---|---|---|---|---|
| Esta build | 39–40 | 15–16 | 9/9 · 13/13 | 96–134 | pasa |
| Gemma-4-26B-A4B-it heretic (8-bit) | 41 | 17 | 8/9 | 82 | pasa, ~20 % más lento |
| Nemotron-3.5-Lightning | 34 | 16 | 11/13 | 107 | falla la puerta |
| Qwen3.8-27B TURBO-Fable-Heretic oQ8 (dense) | no disponible | 17 | 9/9 | 33 | inventó una herramienta |
| Qwen3.8 dense 27B | 38 | 17 | no disponible | ~16 | demasiado lento para agentes |

En parámetros y contexto: esta build declara 35,9B totales (~3B activos) y 262k de contexto; las alternativas dense de 26–27B no ofrecen el mismo ahorro por token ni contexto comparable según los datos disponibles. La licencia Apache 2.0 es común en la familia, pero la disponibilidad en MLX es específica de esta build.

## Limitaciones y advertencias

- Solo inglés declarado: no hay soporte multilingüe verificado, lo que limita su uso en castellano sin evaluación previa.
- Los benchmarks y métricas agénticas son mediciones del propio autor, no verificadas de forma independiente y sobre un único equipo (M5 Max).
- El modelo base es una destilación de Qwen3.8; los sesgos del profesor pueden propagarse, aunque no se documentan sesgos específicos.
- Riesgo de alucinación inherente a modelos generativos; el autor reporta que un modelo dense comparable "inventó una herramienta", lo que subraya la necesidad de validar llamadas en producción.
- La ventana de 262k tokens es nominal; el autor verifica needle recall a 130k, no a la longitud máxima.
- Dependencia de MLX/oMLX: no es directamente desplegable en vLLM, TGI o llama.cpp sin conversión.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y de los datos de destilación antes de uso comercial.
- El rendimiento cae con el contexto: de 120 a 70 tok/s entre contexto corto y 124k, con time to first token de casi 71 s en ese extremo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Repositorio oMLX: https://github.com/jundot/omlx
- Fuente de benchmarks: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp
