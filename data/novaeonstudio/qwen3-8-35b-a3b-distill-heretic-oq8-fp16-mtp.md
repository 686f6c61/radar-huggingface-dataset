# NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ8-fp16-mtp

## Resumen

Qwen3.8-35B-A3B-Distill-Heretic-oQ8-fp16-mtp es una build publicada por Novaeon.Studio sobre el modelo base empero-ai/Qwen3.8-35B-A3B-Distill (licencia Apache-2.0). Se trata de un MoE de la familia Qwen3.5/3.6 con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activos por token, 40 capas, 256 expertos (8 enrutados), atención híbrida GatedDeltaNet más atención completa y torre de visión. El contexto nativo es de 262.144 tokens.

El valor diferencial de esta build es triple: se ha aplicado una ablación de censura con Heretic v2.0.0.dev0 (Arbitrary-Rank Ablation, búsqueda Optuna de 60 pruebas) reduciendo los rechazos de 98/100 a 2/100 en el conjunto dañino de Heretic; el resultado se ha fusionado de nuevo en el checkpoint original para preservar intactos la cabeza MTP nativa (42 tensores `mtp.*`) y la torre de visión; y se ha cuantizado con oMLX en formato oQ8 (~8,8 bits por peso efectivos, grupo de 64, escalas y pesos no cuantizados en float16).

Es relevante para quienes trabajan con Apple Silicon y necesitan un modelo de 35B MoE rápido, con contexto largo y sin la capa de rechazos, manteniendo la decodificación especulativa por MTP (que en la build base supone aproximadamente un 35% más de velocidad de decode). El autor advierte explícitamente que no debe usarse como agente autónomo con herramientas con efectos secundarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE familia Qwen3.5/3.6 con atencion hibrida GatedDeltaNet + atencion completa; incluye codificador de vision |
| Parametros totales | 35.951.822.704 (~35,95 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | oQ8 (8 bits, group size 64, escalas y pesos no cuantizados en float16, ~8,8 bpw efectivos). Existen builds hermanas oQ6 y oQ4; no hay release de 2 bits (oQ2 descartado por rendimiento roto) |
| Idiomas soportados | en (unico idioma declarado); la suite interna del autor incluye casos en aleman |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria MLX, cuantizacion de 8 bits) |
| Capas / expertos | 40 capas; 256 expertos, 8 enrutados; 10 capas de atencion completa con 2 cabezas KV (~20 KB/token de KV) |
| Cabeza MTP | Nativa, 42 tensores `mtp.*` preservados (decodificacion especulativa) |
| Motor de inferencia | oMLX (Apple MLX) |
| Tamano del repositorio | 39,5 GB |
| RAM sugerida por el autor | 64 GB+ (comodo en 96-128 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia Qwen3.5/3.6: 40 capas, 256 expertos con 8 enrutados por token, atencion hibrida que combina GatedDeltaNet con atencion completa, y una torre de vision que habilita la pipeline `image-text-to-text`. El modelo se obtuvo destilando profesores Qwen3.8 sobre la arquitectura Qwen3.6-35B-A3B. No se dispone del numero de tokens de entrenamiento, la composicion del dataset ni el detalle de fases de RLHF/DPO: no disponible.

Sobre esa base, Novaeon.Studio aplico un proceso de descensura en tres pasos reproducibles: (1) ablacion con Heretic v2.0.0.dev0 mediante Arbitrary-Rank Ablation con busqueda Optuna de 60 pruebas; (2) fusion del resultado sobre el checkpoint original para mantener intactos la cabeza MTP nativa y la torre de vision; (3) cuantizacion con oMLX en oQ8. La divergencia KL medida es 0,248 (Heretic) y 0,28 en la remedicion del autor tras la fusion y la cuantizacion. La cabeza MTP nativa actua como mecanismo de decodificacion especulativa; segun el autor, desactivarla reduce el decode en aproximadamente un 35%, y una profundidad fija de 2 o 3 resulta mas lenta que la profundidad adaptativa por defecto. El proceso completo de fabricacion aparece truncado en la model card proporcionada.

## Capacidades

- Generacion de texto conversacional y creativo (ficcion, roleplay, temas oscuros) sin capa de rechazos practicamente activa.
- Entrada de imagen y texto (pipeline `image-text-to-text` con torre de vision).
- Tool calling y function calling: 11/11 en la suite interna del autor.
- Salida estructurada en JSON: 5/5 en la suite interna.
- Seguimiento de instrucciones: 5/6 en la suite interna.
- Manejo de contexto largo: 4/4 en pruebas de aguja en ventanas de 20.000 a 50.000 tokens, sobre un contexto nativo de 262.144.
- Modo de razonamiento activable (`enable_thinking`): desactivado para chat y escritura creativa, activado para razonamiento duro. En modo sin pensamiento obtiene 2/6 en la categoria de razonamiento de la suite interna.
- Capacidad de abtencion (no responder cuando no procede): 3/3.
- Generacion de codigo: 3/4 en la suite interna.
- Multilingue limitado: ingles declarado; el aleman se evalua internamente (3/4), pero no figura como idioma soportado oficialmente.
- Decodificacion especulativa mediante cabeza MTP nativa (profundidad adaptativa).

## Casos de uso

- Escritura creativa y ficcion con temas oscuros: el modelo mantiene velocidad de decode de ~117 tok/s en prompts cortos y ~100-105 tok/s a 53.000 tokens de contexto, y la ablacion elimina casi por completo las negativas y las moralizaciones que interrumpen la generacion narrativa.
- Roleplay y asistentes de personaje: 0/10 rechazos en el conjunto interno de 10 prompts limite pero legitimos (humor negro, tacos, reduccion de danos, monologo de villano), lo que permite mantener la voz del personaje en conversaciones multi-turno largas.
- Red teaming y evaluacion de seguridad: sirve como modelo "sin filtros" de referencia para medir la efectividad de clasificadores, guardrails y politicas de contenido en pipelines propios.
- Asistente desenfadado y directo para uso interno: el autor lo propone como "daily driver" para tareas de texto donde un asistente que se niega o da sermones entorpece el trabajo.
- Analisis de documentos largos: con 262.144 tokens de contexto nativo y 4/4 en pruebas de aguja en ventanas de 20 a 50k tokens, es util para resumir o extraer informacion de expedientes y codigo extensos.
- Pipelines de codigo asistido con supervision humana: soporta tool calling (11/11) y salida JSON (5/5), integrable en flujos de CI/CD o IDE, pero el propio autor desaconseja su uso como agente autonomo desatendido.
- Tareas de vision-lenguaje: al conservar la torre de vision intacta, admite entradas de imagen junto a texto para descripcion, extraccion o dialogo sobre imagenes.
- Experimentacion en Apple Silicon: build de referencia para comparar recetas de cuantizacion (oQ8 frente a oQ6 y oQ4) sobre el mismo checkpoint con MTP activo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos son las suites internas del autor, medidas en un Apple M5 Max de 128 GB con oMLX, sin modo pensamiento y con la compresion KV TurboQuant desactivada.

Suite de regresion "golden" privada (43 casos deterministas) y suite de mitigacion (17 casos):

| Categoria | Original oQ8 (seat) | Heretic oQ8 (este modelo) | Heretic oQ6 | Heretic oQ4 |
|---|---|---|---|---|
| Tool calling | 11/11 | 11/11 | 11/11 | 11/11 |
| JSON | 5/5 | 5/5 | 5/5 | 5/5 |
| Seguimiento de instrucciones | 6/6 | 5/6 | 5/6 | 5/6 |
| Aleman | 4/4 | 3/4 | 3/4 | 3/4 |
| Agujas en contexto largo | 4/4 | 4/4 | 4/4 | 4/4 |
| Razonamiento (sin pensamiento) | 3/6 | 2/6 | 2/6 | 2/6 |
| Abtencion | 3/3 | 3/3 | 3/3 | 3/3 |
| Codigo | 4/4 | 3/4 | 2/4 | 3/4 |
| Total | 40/43 | 36/43 | 35/43 | 36/43 |
| Suite de mitigacion | 16/17 | 14/17 | 12/17 | 14/17 |

Tasa de rechazos:

| Conjunto | Original (seat) | Heretic oQ8 |
|---|---|---|
| Conjunto danino de Heretic (100 prompts, pre-cuantizacion) | 98/100 | 2/100 |
| 10 prompts limite pero legitimos del autor | 2/10 rechazados | 0/10 rechazados |

Velocidad (Apple M5 Max 128 GB, oMLX, pensamiento desactivado, KV TurboQuant desactivado):

| Metrica | Original oQ8 (seat) | Heretic oQ8 |
|---|---|---|
| Decode, prompt corto | ~126-129 tok/s | 117 tok/s |
| Decode a 53k tokens de contexto | ~91-103 tok/s | 100-105 tok/s |
| Prefill, 53k en frio | 3.331 tok/s | 2.952 tok/s |
| 4 peticiones concurrentes, agregado | ~221 tok/s | 215 tok/s |

## Requisitos de hardware

- VRAM/RAM: el autor recomienda 64 GB o mas de memoria unificada, y considera comodo el rango de 96 a 128 GB. El repositorio ocupa 39,5 GB en disco.
- GPU: el modelo esta construido y medido en Apple Silicon. Los datos de rendimiento corresponden a un Apple M5 Max con 128 GB de memoria unificada. No se documentan resultados en GPU NVIDIA o AMD: no disponible.
- GPU de consumo: al tratarse de un formato MLX de 8 bits, el objetivo son equipos Apple Silicon con memoria unificada suficiente (64 GB+). No cabe en GPUs de consumo con VRAM convencional mediante esta build.
- Despliegue: oMLX (engine de MLX para Apple Silicon), con endpoint compatible con la API de OpenAI en `http://127.0.0.1:8000/v1` y el identificador de modelo `Qwen3.8-35B-A3B-Distill-Heretic-oQ8-fp16-mtp`. No se documentan rutas para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Ajustes recomendados por el autor: `mtp_enabled: true` con profundidad adaptativa (por defecto); `turboquant_kv_enabled: false` (desactivarlo aporta +37% de decode a 53k de contexto y +23% de throughput agregado); `enable_thinking: false` para chat y escritura creativa, `true` para razonamiento duro.
- Muestreo recomendado: temperatura 0,7 y top_p 0,95 para creatividad; temperatura 0-0,3 para tareas facticas.
- Latencia y throughput estimados: 117 tok/s de decode con prompt corto, 100-105 tok/s a 53k tokens de contexto, 2.952 tok/s de prefill en frio a 53k y 215 tok/s agregados con 4 peticiones concurrentes, segun las mediciones del autor en M5 Max.

## Comparativa con modelos similares

Comparativa dentro de la misma familia de builds de Novaeon.Studio y con el modelo original del que deriva. No se dispone de datos de terceros comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Suite interna (43 casos) | Rechazos (conjunto Heretic) | Licencia | Notas |
|---|---|---|---|---|---|---|
| Original oQ8 (seat) | 35,95 B (~3 B activos) | 262.144 | 40/43 | 98/100 | Apache-2.0 | Build no descensurada del mismo checkpoint; recomendada por el autor como asiento por defecto para agentes |
| Heretic oQ8 (este modelo) | 35,95 B (~3 B activos) | 262.144 | 36/43 | 2/100 | Apache-2.0 | Mayor fidelidad de las tres variantes Heretic; ~39,5 GB; 117 tok/s de decode |
| Heretic oQ6 | 35,95 B (~3 B activos) | 262.144 | 35/43 | no disponible | Apache-2.0 | Build hermana de menor tamano |
| Heretic oQ4 | 35,95 B (~3 B activos) | 262.144 | 36/43 | no disponible | Apache-2.0 | Build hermana; empataria con oQ8 en la suite interna, segun el autor |

## Limitaciones y advertencias

- La ablacion tiene un coste medible: la suite interna baja de 40/43 a 36/43. Se pierde precision en razonamiento sin modo pensamiento (2/6 frente a 3/6), codigo (3/4 frente a 4/4), seguimiento de instrucciones (5/6 frente a 6/6) y aleman (3/4 frente a 4/4).
- La tasa de rechazos cae de 98/100 a 2/100 en el conjunto danino de Heretic. Esto implica riesgo real de generar contenido danino, ofensivo o inseguro si no se anaden guardrails externos.
- El propio autor desaconseja explicitamente su uso como agente desatendido con tool calling: los rechazos funcionan como capa de seguridad cuando las herramientas tienen efectos secundarios. Para ese escenario recomienda el modelo original.
- La divergencia KL de 0,25-0,28 respecto al modelo original implica cambios de distribucion no triviales en la salida.
- Idioma: solo se declara ingles. El aleman se evalua internamente pero no figura como idioma soportado; no hay datos de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: no se han publicado mediciones de fidelidad factual ni de calibracion mas alla de la categoria de abtencion (3/3) de la suite interna. No disponible.
- Sesgos: no se han publicado evaluaciones de sesgo en la informacion disponible. La eliminacion de la capa de rechazos puede amplificar la reproduccion de estereotipos.
- Licencia Apache-2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y conservacion del aviso de licencia. Conviene verificar las condiciones del modelo base empero-ai/Qwen3.8-35B-A3B-Distill, tambien Apache-2.0.
- Produccion: el modelo depende de MLX y Apple Silicon; no se documentan rutas de despliegue para stacks CUDA (vLLM, TGI) ni para formatos GGUF (llama.cpp, Ollama). La compresion KV TurboQuant degrada el rendimiento en esta arquitectura hibrida y debe permanecer desactivada.
- Adopcion muy baja y validacion externa nula: 0 descargas y 1 like en el momento de la ficha; todas las metricas proceden del autor del modelo.
- Cuantizacion de 8 bits con escalas en float16: aunque el autor indica que la cuantizacion apenas afecta al rendimiento (oQ4 empata con oQ8), no hay evaluacion independiente que lo confirme.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ8-fp16-mtp
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Build hermana oQ6: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ6-fp16-mtp
- Build hermana oQ4: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ4-fp16-mtp
- Build original (seat) oQ8: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- oMLX (motor de cuantizacion e inferencia): https://github.com/jundot/omlx
- Novaeon.Studio: https://novaeon.studio
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo.
