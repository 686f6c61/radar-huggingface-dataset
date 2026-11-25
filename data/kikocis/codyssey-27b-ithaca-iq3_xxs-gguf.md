# KikoCis/Codyssey-27B-Ithaca-IQ3_XXS-GGUF

## Resumen

Codyssey-27B · Ithaca es una cuantización GGUF IQ3_XXS del modelo Qwen3.8-27B de Qwen, fusionado con el adaptador LoRA `harness-hub/Qwen3.8-27B-opencode-adapted`, entrenado con aprendizaje por refuerzo para operar como agente de programación detrás de OpenCode. El autor de la cuantización es KikoCis, que publica el archivo bajo licencia Apache-2.0 con el objetivo declarado de llevar un agente de código capaz de resolver tareas de SWE-bench a la franja de 8-12 GB de VRAM, donde se ejecutan la mayoría de modelos locales.

El modelo base es un transformer denso de 26.895.998.464 parámetros (unos 26,9 mil millones), multimodal en su versión original, aunque esta GGUF contiene únicamente el modelo de lenguaje: no incluye proyector de visión ni la capa MTP (multi-token prediction). La cuantización pesa 11,89 GB en disco y está calibrada con una matriz de importancia (imatrix) de 174 × 2048 tokens, con una mezcla de tensores ajustada manualmente que dedica más bits a las proyecciones de atención y a las compuertas del bloque SSM.

Su relevancia actual reside en que demuestra que un agente de código con tool calling nativo puede caber en menos de 12 GB y resolver instancias reales de SWE-bench Verified de extremo a extremo a través de un harness local, con resultados medidos por el propio autor sobre este archivo concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con bloques SSM (gated delta net) y atención completa; sin capa MTP en esta GGUF |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `-c 32768`) |
| Tipos de cuantizacion | IQ3_XXS con mezcla de tensores: `ssm_alpha`/`ssm_beta` → Q8_0, `ssm_out` → Q4_K, `attn_output` → Q5_K, `attn_v` → Q6_K, `attn_k` → Q5_K, `attn_q` → IQ3_XXS, `output` → Q6_K, FFN en IQ3_XXS |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (11,89 GB) + archivo imatrix (0,01 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B combina atención completa con bloques SSM del tipo gated delta net, una arquitectura híbrida que reduce el coste de cómputo en secuencias largas. Sobre ese base, harness-hub entrenó un adaptador LoRA mediante aprendizaje por refuerzo para que el modelo funcione como el motor de OpenCode, un agente de programación que lee el repositorio, localiza el fallo, edita el código y ejecuta los tests hasta que pasan. El adaptador se fusionó en el modelo base con el merge PEFT estándar, a la escala propia del adaptador, sin entrenamiento adicional ni otros cambios.

La cuantización aplica una matriz de importancia calculada sobre 174 fragmentos de 2048 tokens y una receta de tensores distinta de la de llama.cpp por defecto: en lugar de dejar las proyecciones Q/K de atención completa en IQ2_S y las compuertas `ssm_alpha`/`ssm_beta` en 3 bits, el autor sube estas últimas a Q8_0 y refuerza `ssm_out`, `attn_output`, `attn_v`, `attn_k` y `output`, manteniendo las matrices FFN en IQ3_XXS. Ese sobrecoste de unos 0,7 GB (un 6 % más que la referencia de netprojects) se destina a los tensores más sensibles. El adaptador se entrenó y evaluó con el modo thinking desactivado, y así se ejecutaron las pruebas de validación.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Programación agéntica: lectura de repositorios, localización de bugs, edición de código y ejecución de tests en bucle hasta la resolución.
- Tool calling nativo, verificado en Ollama 0.40.13 y en llama.cpp con `--jinja`.
- Razonamiento multi-paso orientado a tareas de ingeniería de software (hasta 80 mensajes por episodio en el harness de prueba).
- Modo thinking conmutable mediante `enable_thinking` en la plantilla de chat; el adaptador está optimizado para funcionar con thinking desactivado.
- Capacidad multimodal: no disponible en esta GGUF (solo se incluye el modelo de lenguaje).
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Resolución automática de issues en CI: el modelo puede recibir un issue de GitHub, inspeccionar el repositorio con tool calls, proponer un parche y validarlo ejecutando la suite de tests, integrándose en un pipeline que solo abra PR si los tests pasan.
- Asistente de programación local en portátil: con 11,89 GB de pesos, cabe en GPUs de consumo de 12-16 GB y permite trabajar con un agente de código sin enviar el repositorio a la nube.
- Reparación de tests rotos: el modelo demostró resolver instancias de Django con entre 13 y 40 llamadas a herramientas, un patrón directamente reutilizable para arreglar tests de regresión en proyectos propios.
- Automatización de tareas de mantenimiento de código: actualización de dependencias, migraciones de API y refactorizaciones acotadas donde el agente itera con el compilador o el linter como señal de éxito.
- Agente integrado en OpenCode: es el caso de uso para el que fue entrenado el adaptador, con soporte de tool calls nativo y compatibilidad con endpoints de chat.
- Evaluación de agentes en local: sirve como modelo de referencia para probar harnesses agénticos (OpenCode, SWE-bench local) en hardware modesto antes de escalar a modelos mayores.
- Prototipado de flujos agénticos con llama.cpp u Ollama: el archivo incluye la plantilla de chat con tool calls, lo que simplifica montar demos reproducibles.

## Benchmarks y rendimiento

Datos medidos por el autor sobre este archivo concreto, comparados con la cuantización IQ3_XXS de netprojects del mismo adaptador:

| Benchmark | Configuracion | Codyssey IQ3_XXS (11,89 GB) | netprojects IQ3_XXS (11,43 GB) |
|---|---|---|---|
| SWE-bench Verified, sonda de 5 instancias | harness local, ~12K caracteres de contexto, sin thinking, tool calls nativos, temp 0.8 / top_p 1.0 | 3/5 resueltas | no ejecutado |
| HumanEval pass@1 (base) | sin thinking, temp 0.6, top_p 0.95, seed 1234, 2048 tokens max | 0,982 | 0,945 |
| HumanEval+ pass@1 | misma configuracion | 0,921 | 0,896 |
| Generaciones desbocadas en HumanEval | misma configuracion | 0/164 | 1/164 |
| Perplejidad Wikitext-2 (menor es mejor) | 40 fragmentos de 2048 tokens | 6,183 ± 0,073 | 6,433 ± 0,078 |

En la sonda de SWE-bench, el modelo resolvió `django__django-11133` (13 tool calls), `django__django-11099` (18) y `django__django-13933` (40). Falló `django__django-13590` (parche que rompió 5 tests de lookup) y `django__django-14608` (llegó al límite de 80 mensajes con 4 tests de formset aún fallando). No hubo cierres inesperados ni respuestas vacías. El autor advierte que cinco instancias son una prueba de humo de competencia agéntica, no una puntuación de leaderboard.

## Requisitos de hardware

- VRAM estimada: unos 12 GB para los pesos en IQ3_XXS, más el espacio de contexto KV; con 32K de contexto conviene contar con 14-16 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), RTX 3090 (24 GB); en el extremo ajustado, RTX 4060 Ti de 16 GB o GPUs de 12 GB con contexto reducido.
- Cabe en GPU de consumo: sí, en la franja de 12-16 GB, que es el objetivo declarado del autor.
- Despliegue: Ollama 0.40.13 (tool calls nativos verificados) y llama.cpp master (`dbaf582af`) con `llama-server --jinja`; también es compatible con endpoints de chat.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento medido | Licencia |
|---|---|---|---|---|---|
| Codyssey-27B Ithaca IQ3_XXS | ~26,9 B | no disponible | IQ3_XXS con mezcla de tensores | HumanEval 0,982; HumanEval+ 0,921; ppl 6,183 | Apache-2.0 |
| netprojects IQ3_XXS (mismo adaptador) | ~26,9 B | no disponible | IQ3_XXS estandar de llama.cpp, incluye capa MTP | HumanEval 0,945; HumanEval+ 0,896; ppl 6,433 | Apache-2.0 |
| Qwen3.8-27B base | ~26,9 B | no disponible | BF16 (referencia) | no disponible en la informacion proporcionada | Apache-2.0 |
| Adaptador completo `harness-hub/Qwen3.8-27B-opencode-adapted` en precision completa | ~26,9 B | no disponible | BF16 | resultados en SWE-bench Pro hard-51 y Terminal-Bench 2.1 bajo OpenCode, no trasladables a esta cuantizacion | Apache-2.0 |

## Limitaciones y advertencias

- IQ3_XXS es una cuantización de unos 3,5 bits de un modelo denso de 27B: no equivale al modelo en BF16. Con memoria suficiente, un Q4_K_M o superior dará mejores resultados.
- El adaptador se entrenó y evaluó con thinking desactivado; usarlo con thinking activado puede degradar el comportamiento esperado.
- Solo inglés: la model card declara únicamente `en`, sin garantías en castellano u otros idiomas.
- Sin visión ni MTP: esta GGUF no incluye el proyector multimodal ni la capa de predicción multi-token del modelo base.
- Riesgo de alucinación en parches de código: en la sonda de SWE-bench, uno de los parches propuestos rompió tests existentes y otro quedó incompleto al agotar el límite de mensajes.
- Los resultados de SWE-bench Pro y Terminal-Bench del adaptador corresponden a precisión completa y no se reclaman para esta cuantización.
- La sonda de SWE-bench se limita a 5 instancias y una sola semilla; la diferencia en HumanEval frente a netprojects debe tratarse como "al menos a la par", según el propio autor.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador de harness-hub.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: es una publicación reciente sin validación independiente.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/KikoCis/Codyssey-27B-Ithaca-IQ3_XXS-GGUF
- Adaptador base: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- OpenCode: https://opencode.ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- evalplus (evaluador usado): https://github.com/evalplus/evalplus
