# ceselder/deepseek-v4.1-flash-olens-lens

## Resumen

`ceselder/deepseek-v4.1-flash-olens-lens` es un conjunto de adaptadores LoRA de interpretabilidad (denominados *oracle lens* u *olens*) entrenados sobre el modelo congelado `deepseek-ai/DeepSeek-V4.1-Flash-1017`, un MoE de 763B parametros por conteo de tensores, 40 capas de decoder, hyper-connections de variedad con 4 flujos residuales, expertos en MXFP4 y tablas de n-gramas Engram. El autor es `ceselder`, que mantiene una familia de lentes equivalentes para Kimi-K3, GLM-5.3 y Qwen3.6-27B. El adaptador convierte una unica activacion de la capa 26 en una linea de texto (con formato `* ...`) que verbaliza lo que el modelo base esta a punto de generar.

El problema que resuelve es de interpretabilidad mecanicista: en lugar de sondear activaciones con clasificadores o proyecciones lineales, la lente produce una descripcion en lenguaje natural de la representacion interna, lo que permite auditar el estado latente del modelo en tareas de workspace cognitivo. El entrenamiento combina SFT sobre 3.194.880 pares (activacion, continuacion propia de DeepSeek) en una sola pasada, seguido de RL (CISPO con truncated importance sampling) contra un reconstructor texto-a-activacion con recompensa de reconstruccion pura.

El checkpoint publicado como `release/` corresponde a `rl_lr6e-6_step_0250`, seleccionado por la mayor reconstruccion en held-out de sus bullets greedy (reward 0.307, coseno centrado 0.545), no por el benchmark. El repositorio pesa 17,2 GB e incluye varias carpetas de checkpoints intermedios, configuracion de la lente y metricas del entrenador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA r64) sobre modelo base MoE; adaptador PEFT con prompt record de lente |
| Parametros totales | 240.517.120 (adaptador); modelo base 763B por conteo de tensores |
| Parametros activos | no disponible (el modelo base es MoE, pero no se detalla el numero de expertos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base usa expertos MXFP4) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT: `adapter_model.safetensors` de 917,6 MiB en fp32) |

## Arquitectura y entrenamiento

El adaptador opera sobre la capa 26 del modelo base y aplica rsLoRA de rango 64 sobre 320 modulos, con 240,5M parametros en fp32. El modelo base `DeepSeek-V4.1-Flash-1017` es un transformer MoE de 40 capas de decoder con manifold hyper-connections y 4 flujos residuales, expertos cuantizados en MXFP4 y tablas de n-gramas Engram. La lente incluye un `lens_config.json` con ids del prompt, posicion del marcador, alpha y tipo de lectura.

El entrenamiento se divide en dos fases. La SFT usa 3.194.880 filas (activacion, continuacion generada por el propio DeepSeek) extraidas de una cosecha de 3,21M filas, en una sola pasada; el checkpoint final es el paso 1560 con eval CE 2.3155 y CE 2.4017 en la porcion held-out. Despues se aplica RL con CISPO y truncated importance sampling contra el reconstructor `ceselder/deepseek-v4.1-flash-olens-reconstructor`, con recompensa de reconstruccion pura. Existen dos brazos principales de RL (lr 6e-6 y lr 3e-6) partiendo del paso 1560 de la SFT, mas un brazo con recompensa en todas las posiciones y un brazo con inicializacion de inversor. La innovacion destacable es el uso de un reconstructor texto-a-activacion como reward model, lo que evita depender de un juez LLM durante el RL.

## Capacidades

- Verbalizacion de activaciones: convierte una activacion de la capa 26 en una linea de texto que describe la continuacion inminente del modelo.
- Interpretabilidad mecanicista: permite leer el estado latente del modelo base sin modificar sus pesos.
- Evaluacion de workspace cognitivo: disenada para WorkspaceBench, con 21 familias sin variantes tipograficas y 24 en total.
- Reconstruccion inversa: el ecosistema incluye un reconstructor texto-a-activacion que cierra el bucle de verificacion.
- Compatibilidad PEFT: se carga como adaptador sobre el modelo base congelado.
- Multiples checkpoints: SFT final, brazos RL a distintos pasos y configuraciones de recompensa.
- No soporta tool calling, agentes ni vision por si misma; su funcion es de lectura, no de generacion de tareas.

## Casos de uso

- Auditoria de representaciones internas: cargar la lente sobre DeepSeek-V4.1-Flash-1017 y leer la capa 26 para inspeccionar que informacion esta codificada antes de generar, util en estudios de seguridad y alineamiento.
- Investigacion en interpretabilidad: comparar las verbalizaciones de la lente con la salida real del modelo para detectar estados latentes no expresados, usando el reconstructor como metrica objetiva.
- Evaluacion de modelos base: usar WorkspaceBench como prueba de workspace cognitivo y medir como cambia la legibilidad de las activaciones entre checkpoints SFT y RL.
- Desarrollo de metodos de verbalizacion: reutilizar la receta (SFT sobre pares activacion-continuacion + RL contra reconstructor) para otras capas o modelos de la misma familia.
- Deteccion de alucinacion interna: la tasa de alucinacion reportada (0.367 en SFT, 0.404-0.445 en RL) permite estudiar la fidelidad de la verbalizacion y calibrar umbrales.
- Reproducibilidad de experimentos: los checkpoints intermedios con `metrics.json` permiten replicar curvas de recompensa, KL y reconstruccion paso a paso.
- Analisis de hiperconexiones: al operar sobre un modelo con 4 flujos residuales, la lente facilita estudiar como se combinan las representaciones en capas profundas.

## Benchmarks y rendimiento

| Checkpoint | WorkspaceBench sin typo (21) [IC 95%] | WorkspaceBench 24 [IC 95%] | Workspace-only (11) | Reconstruccion held-out (reward / ccos) | Tasa de alucinacion |
|---|---|---|---|---|---|
| `sft_one_bullet_step1560` | 0.348 [0.332, 0.365] | 0.325 [0.310, 0.340] | 0.172 | 0.188 / 0.414 | 0.367 |
| `release/` (= rl_lr6e-6_step_0250) | 0.438 [0.420, 0.457] | 0.470 [0.453, 0.487] | 0.330 | 0.307 / 0.545 | 0.416 |
| `rl_lr6e-6_step_0025` | 0.456 [0.438, 0.474] | 0.457 [0.440, 0.474] | 0.323 | 0.252 / 0.490 | 0.404 |
| `rl_lr6e-6_step_0050` | 0.470 [0.452, 0.488] | 0.501 [0.484, 0.518] | 0.362 | 0.274 / 0.512 | 0.411 |
| `rl_lr6e-6_step_0100` | 0.441 [0.423, 0.459] | 0.477 [0.460, 0.493] | 0.348 | 0.290 / 0.529 | 0.418 |
| `rl_lr6e-6_step_0300` | 0.452 [0.434, 0.470] | 0.492 [0.476, 0.509] | 0.356 | no disponible | 0.445 |
| `rl_lr3e-6_step_0025` | 0.435 [0.418, 0.453] | 0.425 [0.408, 0.442] | 0.284 | 0.241 / 0.478 | 0.370 |
| `rl_lr3e-6_step_0075` | 0.483 [0.464, 0.502] | 0.500 [0.482, 0.517] | 0.369 | 0.262 / 0.501 | 0.386 |

Los datos de la tabla son copias exactas de la model card. El checkpoint `rl_lr3e-6_step_0075` es el mas alto en bench, pero fue seleccionado sobre el propio bench, por lo que sus numeros son optimistas por construccion. El `release/` se eligio por reconstruccion held-out. Como referencia de la misma receta, la lente de Kimi-K3 paso de 0.311/0.287 a 0.398/0.432 y la de GLM-5.3 de 0.296/0.271 a 0.440/0.469.

## Requisitos de hardware

- El adaptador pesa 917,6 MiB en fp32 (240,5M parametros); en bf16 o fp16 ocupa aproximadamente 480 MB.
- Requiere cargar el modelo base completo `deepseek-ai/DeepSeek-V4.1-Flash-1017` (763B parametros por conteo de tensores, expertos MXFP4); la VRAM necesaria para el base no esta disponible en la informacion proporcionada.
- No cabe en GPU de consumo como RTX 4090 en su configuracion completa; se necesita hardware de clase servidor (A100, H100, H200 o similar) o despliegue multi-GPU.
- Opciones de despliegue: PEFT sobre transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.
- El repositorio completo ocupa 17,2 GB, incluyendo todos los checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros del adaptador | Contexto | WorkspaceBench (21 / 24) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ceselder/deepseek-v4.1-flash-olens-lens` (release) | 240,5M (r64, 320 modulos) | no disponible | 0.438 / 0.470 | MIT | HuggingFace |
| `ceselder/kimi-k3-olens-lens` | no disponible | no disponible | 0.398 / 0.432 (release) | no disponible | HuggingFace |
| `ceselder/glm-5.3-olens-lens` | no disponible | no disponible | 0.440 / 0.469 | no disponible | HuggingFace |
| `ceselder/olens-qwen3.6-27b-l42` | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Las tres lentes de la familia usan la misma receta (SFT + RL con reconstructor). La lente de DeepSeek-V4.1 es la de mayor rendimiento reportado en el conjunto de datos publicado, con la salvedad de que la comparacion entre modelos base distintos no aisla el efecto del modelo subyacente.

## Limitaciones y advertencias

- La lente solo lee la capa 26; no cubre otras capas ni la totalidad del circuito.
- La tasa de alucinacion de la verbalizacion es alta (0.367 en SFT y hasta 0.445 en algunos checkpoints RL), por lo que las lineas generadas no deben tratarse como descripciones fieles sin verificacion.
- El checkpoint `release/` se eligio por reconstruccion held-out, no por bench; los checkpoints con mejor bench (`rl_lr3e-6_step_0075`) fueron seleccionados sobre el propio bench y sus numeros son optimistas.
- No se documentan idiomas soportados ni longitud de contexto del modelo base en la informacion disponible.
- El adaptador depende de un modelo base de 763B parametros, lo que limita su uso a entornos con hardware de servidor.
- No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque la lente no es un modelo generativo de proposito general.
- La licencia MIT del adaptador no exime de las condiciones del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, que deben verificarse por separado.
- El repositorio incluye checkpoints intermedios y metricas internas; no todos los brazos de RL estan documentados con el mismo nivel de detalle.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/ceselder/deepseek-v4.1-flash-olens-lens
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Reconstructor: https://huggingface.co/ceselder/deepseek-v4.1-flash-olens-reconstructor
- Coleccion DeepSeek V4.1 Flash olens: https://huggingface.co/collections/ceselder/deepseek-v41-flash-olens-6adffd27b920a405a2025fc6
- Lente de Kimi-K3: https://huggingface.co/ceselder/kimi-k3-olens-lens
- Lente de GLM-5.3: https://huggingface.co/ceselder/glm-5.3-olens-lens
- Lente de Qwen3.6-27B: https://huggingface.co/ceselder/olens-qwen3.6-27b-l42
