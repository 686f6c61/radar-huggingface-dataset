# KidIkaros/abliterated-minicpm5-2b-v3

## Resumen

Abliterated MiniCPM5-2B v3 (agentic) es un derivado no oficial de openbmb/MiniCPM5-2B publicado por el usuario KidIkaros en HuggingFace. Se trata de un ajuste fino orientado a uso agéntico que reduce la tasa de rechazo del modelo base mediante re-ablación, DPO y un SFT con LoRA sobre datos agénticos, seguido de una interpolación de pesos entre las dos ramas entrenadas. El checkpoint publicado es `v3_interp_a50`, una interpolación 50/50 entre `v2_merged` y `v3_merged`.

El modelo tiene 2.516.756.480 parámetros (≈2,52 B) y se distribuye tanto en safetensors fp16 como en GGUF (F16, Q8_0 y Q4_K_M) para llama.cpp. Su propuesta de valor es concreta: mantener la capacidad de tool calling del MiniCPM5-2B oficial (82,4% en la suite de toolcall, 85,7% con la segunda semilla) reduciendo la tasa de rechazo del ~37% del modelo oficial al 2,7-6,7%, y recuperar mediante interpolación la pérdida de matemáticas y conocimiento que introdujo la etapa de SFT agéntico.

Es relevante ahora porque cubre el nicho de modelos pequeños (2B) sin rechazos y con soporte explícito de function calling vía plantilla XML, desplegables en GPU de consumo. Conviene subrayar que es un artefacto de investigación, no una release de OpenBMB, con cero descargas y cero likes en el momento de redactar esta ficha, y con regresiones residuales reconocidas por el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de openbmb/MiniCPM5-2B); no se detallan capas ni tipo de atención en la información disponible |
| Parámetros totales | 2.516.756.480 (≈2,52 B) |
| Parámetros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible (el ejemplo de llama.cpp usa `-c 8192`) |
| Tipos de cuantización | fp16 (safetensors), F16, Q8_0 y Q4_K_M (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base openbmb/MiniCPM5-2B, del que este repositorio es un derivado por ajuste fino; la model card no detalla el número de capas, el tipo de atención ni el contexto máximo nativo. El pipeline aplicado es de tres etapas: (1) re-ablación más DPO sobre una versión previa abliterada (`v0` en el commit `5c315b8`), que da lugar a `v2_merged`; (2) SFT con LoRA agéntico (rango 16, alfa 32, learning rate 1e-4, una época) sobre el dataset UltraData-SFT-Agent más una repetición de rechazos, que produce `v3_merged`; y (3) interpolación de pesos con α=0,5 entre `v2_merged` y `v3_merged`, que genera el checkpoint publicado `v3_interp_a50`.

El objetivo declarado de la interpolación es conservar las ganancias agénticas introducidas por el SFT sin arrastrar su coste en matemáticas y conocimiento: según el autor, la etapa de SFT por sí sola costaba -7,2 puntos en MATH-500, y la interpolación lo devuelve al nivel de `v2`. La plantilla de chat inyecta las firmas de funciones cuando se pasa `tools=[...]` a `apply_chat_template`, y el modelo emite llamadas en formato XML `<function name="..."><param name="...">value</param></function>`. No se documentan en la información disponible ni la composición exacta del dataset, ni el número de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional multilingüe: no se especifican los idiomas soportados.
- Tool calling / function calling mediante plantilla XML nativa del MiniCPM5, con firma de funciones inyectada desde `apply_chat_template`.
- Razonamiento agéntico de varios pasos: la suite `agentic` evalúa cadenas de dos turnos (emitir llamada → sintetizar la respuesta de la herramienta).
- Extracción de argumentos en llamadas a funciones, incluidos casos de "no llamada" y multi-intención.
- Matemáticas y conocimiento general a nivel de modelo de 2B (MATH-500 46,90; MMLU-Pro 40,43 en el arnés local del autor).
- Seguimiento de instrucciones (IFEval 84,84).
- Comprensión de documentos largos a nivel de prueba de humo (LongBench-E, grupos de n=6).
- Modo sin *thinking* evaluado; se documenta que el decodificado greedy combinado con *prompts* de razonamiento puede entrar en bucles de repetición.

## Casos de uso

- Agentes locales de automatización de tareas: el modelo emite llamadas a herramientas en XML de forma fiable (82,4-87,1% en la suite `toolcall` de 85 filas) y puede encadenar la respuesta de la herramienta en un segundo turno, lo que permite construir bucles agente-servidor sin depender de API externas.
- Asistentes sobre documentos largos: con soporte de GGUF y `-c 8192` en llama.cpp, es viable indexar y consultar documentación técnica o contratos de extensión media en una máquina de escritorio.
- Enrutado de intenciones y extracción de parámetros: su capacidad de distinguir entre "llamar" y "no llamar" y de rellenar argumentos lo hace apto como capa de parsing de lenguaje natural hacia APIs internas.
- Despliegue en hardware de consumo: con Q4_K_M ronda 1,6 GB de pesos y 103 tok/s medidos en una RX 9060 XT vía HIP, por lo que sirve para prototipos y demos en GPU de gama media.
- Generación de texto sin filtros en investigación sobre rechazo y alineación: al ser un derivado abliterado, permite estudiar el comportamiento del modelo cuando se elimina la dirección de rechazo, comparando contra el oficial.
- Procesamiento por lotes de bajo coste: al caber en GPUs pequeñas, se pueden ejecutar varias instancias en paralelo para tareas de clasificación, resumen o reformateo donde no se requiere razonamiento profundo.
- Evaluación comparativa de técnicas de ajuste: el repositorio documenta línea base, DPO, SFT y interpolación con el mismo arnés, lo que lo convierte en un caso de estudio reproducible sobre pérdida de capacidad tras SFT.

## Benchmarks y rendimiento

Suite `release_core` con lm-eval 0.4.13, mismo arnés, tokenizer y plantilla de chat para todos los candidatos. Modo sin *thinking*. Semillas 0 y 1 para MMLU-Pro, MATH-500 e IFEval; semilla 0 para LongBench-E. Los autores advierten que estas cifras no son comparables con las publicadas por OpenBMB en su leaderboard.

| Tarea | n | official | v2 | v3_sft (descartado) | v3 (este repo) |
|---|---:|---:|---:|---:|---:|
| MMLU-Pro | 350×2 | 42,57 | 38,43 | 36,43 | 40,43 |
| MATH-500 | 500×2 | 50,30 | 47,30 | 40,10 | 46,90 |
| IFEval | 541×2 | 84,94 | 85,58 | 85,49 | 84,84 |
| LongBench-E single-doc QA | 6 | 65,56 | 82,22 | 74,15 | 74,15 |
| LongBench-E multi-doc QA | 6 | 77,78 | 66,67 | 50,00 | 66,67 |
| LongBench-E summarization | 6 | 29,23 | 28,86 | 28,09 | 27,41 |
| LongBench-E synthetic | 6 | 0,00 | 66,67 | 66,67 | 50,00 |
| Macro de dominio | | 55,24 | 58,10 | 54,19 | 56,68 |

Retención macro de dominio frente al oficial: 102,6% (objetivo predeclarado ≥95%, superado).

Puertas de rechazo y capacidad agéntica (300 *prompts*, temperatura 1,0 / top_p 0,95 / min_p 0,0):

| Candidato | fastgate refuse s0 | s1 | toolcall s0 | s1 | agentic s0 | s1 |
|---|---:|---:|---:|---:|---:|---:|
| official MiniCPM5-2B | ~37% | — | 82,4% | — | ~77% | — |
| v2 | ~8% | ~8% | 78,8% | 83,5% | 71,4% | 76,8% |
| v3 (este repo) | 2,7% | 6,7% | 82,4% | 87,1% | 73,2% | 85,7% |

## Requisitos de hardware

- VRAM estimada para los pesos en fp16: ≈5,0 GB (2.516.756.480 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica unos 6-7 GB para contexto de 8K.
- Q8_0: ≈2,7 GB de pesos. Q4_K_M: ≈1,6 GB de pesos.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060/4060 Ti, RTX 4090, así como en iGPU con memoria unificada si se usa Q4_K_M.
- Prueba de ejecución publicada: RX 9060 XT con backend HIP, Q4_K_M a ~103 tok/s.
- Opciones de despliegue documentadas: `transformers` (`AutoModelForCausalLM` con `device_map="auto"`) y llama.cpp (`llama-cli -m ... -ngl 99 -c 8192`). Los GGUF requieren llama.cpp ≥ b9354 por el pre-tokenizador `minicpm5`.
- No se documentan en la información disponible pruebas con vLLM, TGI, Ollama ni TensorRT-LLM, ni cifras de latencia por token o throughput en GPU de datacenter.
- Parámetros de decodificación recomendados por el autor: `temperature=1.0, top_p=0.95, min_p=0.0`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de rechazo (fastgate) | Macro de dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| abliterated-minicpm5-2b-v3 (este repo) | ≈2,52 B | No disponible | 2,7-6,7% | 56,68 | Apache 2.0 | safetensors + GGUF |
| abliterated-minicpm5-2b-v2 | Derivado de 2B (no confirmado) | No disponible | ~8% | 58,10 | No disponible en la información | safetensors (presunto) |
| openbmb/MiniCPM5-2B (oficial) | ≈2,52 B | No disponible | ~37% | 55,24 | No disponible en la información | Pesos oficiales |
| Otros modelos de ~2 B de la competencia (Qwen, Gemma, Llama) | — | — | No disponible | No disponible | — | — |

No se dispone de datos comparativos con alternativas de terceros en la información proporcionada; el autor mide exclusivamente contra el modelo oficial y su versión previa, con su propio arnés.

## Limitaciones y advertencias

- Rechazo residual del 2,7-6,7% que el autor describe como fluctuación estocástica en el límite de temperatura; no es una eliminación completa del comportamiento de negativa.
- Regresiones reconocidas frente al oficial: -2,1 puntos en MMLU-Pro y -3,4 puntos en MATH-500. La etapa de SFT agéntico por sí sola costaba -7,2 puntos en MATH-500.
- Los grupos de LongBench-E tienen n=6: son señal de nivel "smoke test", no resultados concluyentes. El subconjunto `longbench_synthetic_e` es especialmente sensible a la decodificación: el modelo oficial emite EOS en 0-2 tokens con decodificación greedy sobre *prompts* de ~3.600 palabras.
- Decodificación greedy combinada con *prompts* de razonamiento puede desembocar en bucles de repetición; es un comportamiento heredado del base de 2B presente también en el modelo oficial.
- La abliteración elimina deliberadamente la dirección de rechazo: el modelo puede producir contenido que el original bloquearía. No es apropiado para aplicaciones orientadas a usuarios finales sin una capa de moderación externa.
- Es un derivado no oficial, no una release de OpenBMB, y se autodefine como artefacto de investigación. No hay garantías de mantenimiento, soporte ni estabilidad.
- Licencia Apache 2.0 declarada para este repositorio, pero la información disponible no aclara la licencia del modelo base `openbmb/MiniCPM5-2B` ni de `v2`; conviene verificar antes de uso comercial.
- No se declaran idiomas soportados, lo que impide garantizar el comportamiento multilingüe fuera del inglés.
- Sin papers, demos ni informes de terceros que validen de forma independiente las métricas publicadas.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KidIkaros/abliterated-minicpm5-2b-v3
- Versión previa v2: https://huggingface.co/KidIkaros/abliterated-minicpm5-2b-v2
- Modelo base oficial: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio v0 citado en el linaje: https://huggingface.co/KidIkaros/abliterated-minicpm5-2b
- Papers, blogs, repositorios o demos adicionales: no se han encontrado en la información proporcionada.
