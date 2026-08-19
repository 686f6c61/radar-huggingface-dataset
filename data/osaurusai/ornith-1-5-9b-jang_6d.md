# OsaurusAI/Ornith-1.5-9B-JANG_6D

## Resumen

Ornith-1.5-9B es un modelo de vision y lenguaje (VLM) desarrollado por Ornith AI, especializado en razonamiento, agentes de codigo y comprension de imagenes y video. Esta ficha cubre la variante cuantizada `JANG_6D` publicada por OsaurusAI, empaquetada en formato MLX para Apple Silicon. El modelo base es un modelo denso de 9B con arquitectura hibrida de atencion lineal gated-delta y atencion completa en proporcion 3:1, torre de vision de 27 capas y ventana de contexto de 262.144 tokens.

La cuantizacion JANG (6 bits dominantes, con mezcla de 4 y 8 bits) aplica tres metodos de calibracion —asignacion por traza de Hessiano, refit imatrix y escalado AWQ— en una unica pasada de captura, lo que permite una perdida casi nula respecto al modelo original. La variante cuantizada ocupa 7,51 GiB en disco y alcanza 58,5 tokens por segundo en decodificacion en un Apple M5 Max.

Es relevante porque acerca un VLM agente de codigo de nivel competitivo (SWE-bench Verified 79, Terminal-Bench 2.1 67,8) al hardware local de Apple, con licencia MIT y soporte nativo de video, algo poco habitual en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` / `Qwen3_5ForConditionalGeneration` — hibrida gated-delta linear attention + full attention (3:1) |
| Parametros totales | 2.156.580.944 (segun safetensors cuantizados); el fabricante lo describe como modelo denso de 9B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | JANG 6D: distribucion de bits {4: 2, 6: 182, 8: 150}; tensores `linear_fc2` de la torre de vision (27, con `in_features` 4304) se mantienen en fp16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Ornith-1.5-9B usa una arquitectura hibrida con una proporcion 3:1 entre atencion lineal con gated-delta y atencion completa, sobre 32 capas y tamano oculto de 4096. Incluye una torre de vision de 27 capas y soporte nativo de video, con ficheros de configuracion de preprocesador tanto para imagen como para video incluidos en el bundle. El modelo no dispone de torre de audio: los tokens `<|audio_start|>`, `<|audio_end|>` y `<|audio_pad|>` estan definidos en el tokenizador, pero son vestigiales y la puerta de capacidad esta desactivada por ausencia de pesos de audio.

El razonamiento (thinking mode) esta activado por defecto: el prompt de generacion sin argumentos es identico a `enable_thinking=True` y termina con el bloque `<|im_start|>assistant\n thinking\n`. Desactivarlo (`enable_thinking=False`) no elimina el bloque; prefija un bloque cerrado vacio (` thinking\n\n response\n\n`), por lo que un parser que solo compruebe la presencia del bloque encontrara uno en ambos modos. No existen niveles de `reasoning_effort` en esta familia, y los bloques de pensamiento del historial se conservan incondicionalmente.

El bundle cuantizado aplica el metodo JANG, que en una unica pasada de captura calcula el segundo momento por canal de entrada `E[x_c^2]`, utilizado simultaneamente como diagonal del Hessian, peso de imatrix y estadistico de canales salient para AWQ. La asignacion de bits se realiza por `tr(H)·‖W‖²_F` por modulo, no por nombre de tensor, lo que corrige el perfil de la torre de vision, que obtiene una puntuacion mayor que el MLP de texto. El refit imatrix produce un error relativo medio ponderado de 0,0127.

Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con thinking mode activado por defecto; el modo de pensamiento se puede desactivar, aunque el bloque vacio permanece.
- Comprension de imagenes (image-text-to-text): 333 tensores de torre de vision, con `preprocessor_config.json` y `processor_config.json` incluidos.
- Soporte nativo de video, verificado de extremo a extremo con `video_preprocessor_config.json`.
- Capacidades agenticas de codigo: SWE-bench Verified 79 y Terminal-Bench 2.1 67,8, segun el fabricante.
- Tool calling / function calling con parser `qwen3_coder`.
- Dos presets de muestreo: general (temperatura 1,0, presence 1,5) y coding (temperatura 0,6, presence 0,0), siendo este ultimo el predeterminado en el bundle.
- No soporta audio: los tokens de audio son vestigiales y no hay torre de audio ni pesos asociados.
- No soporta decodificacion especulativa (MTP) en la variante 9B: el checkpoint declara `mtp_num_hidden_layers: 1` pero no incluye pesos `mtp.*`; el MTP nativo existe en la variante 35B-A3B de la familia.

## Casos de uso

- **Agente autonomo de resolucion de issues en repositorios**: con SWE-bench Verified 79, puede integrarse en pipelines de CI/CD para analizar issues, generar parches y ejecutar tests de forma automatica, usando la ventana de 262K tokens para mantener el contexto completo del repositorio.
- **Asistente de terminal y automatizacion de tareas**: Terminal-Bench 2.1 67,8 lo hace adecuado para interpretar comandos, diagnosticar fallos de ejecucion y generar secuencias de operaciones en entornos shell.
- **Analisis visual de capturas de pantalla y UI**: el soporte de imagen permite evaluar errores de interfaz, comparar renders o describir estados de aplicaciones a partir de imagenes, integrable en flujos de QA.
- **Analisis de video para revision de grabaciones de sesiones de desarrollo**: puede procesar clips de grabaciones de pantalla para extraer pasos, detectar problemas de flujo y generar documentacion de procesos.
- **Desarrollo local en Apple Silicon**: con 7,51 GiB en disco y 58,5 tok/s en M5 Max, es viable como asistente de codigo en portatiles, sin dependencia de infraestructura en la nube.
- **Razonamiento de contexto largo**: con 262.144 tokens, puede procesar repositorios completos, documentacion extensa o transcripciones de reuniones de varias horas para generar resumenes o responder preguntas sobre el contenido.

## Benchmarks y rendimiento

Segun la model card del fabricante, los resultados del modelo Ornith-1.5-9B son:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 79,0 |
| Terminal-Bench 2.1 | 67,8 |

No se han publicado en la informacion disponible resultados adicionales (MMLU, HumanEval, GSM8K, etc.) para esta variante especifica. La velocidad de decodificacion medida en el bundle cuantizado es de 58,5 tokens/s en un Apple M5 Max.

## Requisitos de hardware

- **Almacenamiento**: 7,51 GiB en disco (8,1 GB en el repositorio).
- **VRAM estimada**: con cuantizacion 4/6/8 bits, el modelo cabe en memoria unificada de Apple Silicon a partir de 12 GB, aunque se recomiendan 16 GB para operar con comodidad y margen de contexto.
- **GPU recomendadas**: Apple Silicon con MLX (M-series); el rendimiento medido de 58,5 tok/s corresponde a un M5 Max. No hay soporte CUDA para esta variante especifica, aunque el modelo base es compatible con vLLM y Transformers.
- **Opciones de despliegue**: MLX (esta variante); el modelo base se puede desplegar con vLLM, Transformers o llama.cpp en GPU NVIDIA.
- **Latencia y throughput**: 58,5 tok/s en decodificacion en M5 Max; latencia de prefill no publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B (este) | ~9B denso | 262K | 79,0 | MIT | MLX, Transformers, vLLM |
| Ornith-1.5-35B-A3B | 35B total, 3B activos (MoE) | no disponible | no disponible | MIT | no disponible |
| Ornith-1.5-397B MoE | 397B total, MoE | no disponible | no disponible | MIT | no disponible |

La variante 35B-A3B de la misma familia es la unica con soporte nativo de MTP (decodificacion especulativa). No se dispone de datos comparativos con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- **Sin soporte de audio**: los tokens de audio en el tokenizador son vestigiales; no hay torre de audio ni pesos, por lo que cualquier intento de entrada de audio fallara.
- **Idioma**: el modelo esta etiquetado como ingles; no se garantiza rendimiento en otros idiomas.
- **Razonamiento siempre presente**: el thinking mode no se puede desactivar completamente; al desactivarlo se genera un bloque vacio, lo que puede confundir a parsers que solo detecten la presencia del bloque.
- **Sin decodificacion especulativa**: la variante 9B no incluye pesos MTP, por lo que no se puede acelerar la generacion con este metodo.
- **Sin niveles de esfuerzo de razonamiento**: a diferencia de otros modelos como Qwen3.8, no hay parametros `reasoning_effort`.
- **Riesgo de alucinacion**: no se han publicado evaluaciones especificas de alucinacion para esta variante cuantizada; la cuantizacion puede degradar ligeramente la fidelidad en tareas de largo contexto.
- **Uso comercial**: la licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar los terminos del modelo base en `ornith-ai/Ornith-1.5-9B`.

## Enlaces

- [Modelo en HuggingFace: OsaurusAI/Ornith-1.5-9B-JANG_6D](https://huggingface.co/OsaurusAI/Ornith-1.5-9B-JANG_6D)
- [Modelo base: ornith-ai/Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B)
- [Coleccion de modelos Ornith-1.5](https://huggingface.co/collections/ornith-ai/ornith-15)
- [Pagina oficial de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Repositorio de OsaurusAI en GitHub](https://github.com/osaurus-ai/osaurus/releases)
