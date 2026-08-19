# kingjones777/Gemma-4-E2B-it-ROCmFP4-GGUF

## Resumen

El modelo `kingjones777/Gemma-4-E2B-it-ROCmFP4-GGUF` es una cuantización GGUF del modelo multimodal `google/gemma-4-E2B-it` de Google DeepMind, adaptada específicamente para hardware AMD con soporte nativo de tipos tensoriales FP4 y FPX a través del fork ROCmFPX de llama.cpp. Desarrollada por el usuario kingjones777, esta versión está optimizada para APUs AMD Strix Halo (gfx1151), como el Ryzen AI MAX+ 395 con memoria unificada de 128 GB, y constituye la primera cuantización ROCmFP4/ROCmFPX publicada de este modelo.

El modelo base, Gemma 4 E2B, pertenece a la familia Gemma 4 de Google, que destaca por su arquitectura MatFormer con embeddings por capa (per-layer-embedding, PLE) y su capacidad multimodal (texto e imagen). Aunque la documentación oficial de Gemma 4 menciona contextos de hasta 256K tokens y soporte multilingüe en más de 140 idiomas, esta cuantización concreta no especifica la longitud de contexto utilizada en las pruebas (se usó `-c 4096` en las mediciones). El repositorio incluye cuatro variantes de cuantización (Q4_0_ROCMFP4_COHERENT, Q6_0_ROCMFPX_AGENT, Q8_0_ROCMFPX y Q8_0_ROCMFPX_AGENT) junto con el proyector de visión necesario para entrada de imágenes.

La relevancia de este modelo radica en su enfoque en hardware AMD, un segmento tradicionalmente menos cubierto por las cuantizaciones estándar. Al emplear tipos FP4/FPX nativos de ROCm, se consiguen velocidades de decodificación notablemente altas (hasta 80,88 tokens/s en el cuant de 4 bits) en APUs con memoria unificada, lo que lo convierte en una opción interesante para despliegue local de modelos multimodales en equipos AMD sin GPU discreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MatFormer / per-layer-embedding (PLE), multimodal (texto + vision) |
| Parametros totales | 4.647.450.147 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; la documentacion de Gemma 4 menciona hasta 256K tokens, aunque la variante E2B podria tener menos (sin confirmar) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT, Q6_0_ROCMFPX_AGENT, Q8_0_ROCMFPX, Q8_0_ROCMFPX_AGENT (tipos ROCmFP4/ROCmFPX, no compatibles con llama.cpp estandar) |
| Idiomas soportados | mas de 140 idiomas (segun documentacion de Gemma 4) |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | GGUF (con tipos tensoriales ROCmFP4/ROCmFPX) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E2B-it` emplea una arquitectura MatFormer con embeddings por capa (per-layer-embedding, PLE), lo que implica que una fraccion significativa de los parametros reside en tensores como `per_layer_token_embd` y `per_layer_model_proj.weight`. Esta caracteristica explica que la cuantizacion a 4 bits no reduzca el tamano tanto como en un modelo denso convencional: el cuant Q4_0_ROCMFP4_COHERENT ocupa 3,13 GiB (5,76 bits por peso) frente a los 4,57 GiB del Q8_0_ROCMFPX, una reduccion de solo 1,46× en lugar de los ~1,8× tipicos. El tensor `per_layer_model_proj.weight` se mantiene en BF16 en todas las variantes.

El modelo es multimodal: incluye un proyector de vision (mmproj-BF16.gguf) que permite procesar imagenes junto con texto. Segun la documentacion oficial de Gemma 4, los modelos de esta familia se entrenan para tareas de generacion de texto, codigo y razonamiento, con soporte para system prompts y decodificacion especulativa mediante un modelo auxiliar MTP (Multi-Token Prediction). Sin embargo, en esta cuantizacion la decodificacion especulativa no funciona debido a limitaciones del fork ROCmFPX (ver seccion de limitaciones). No se dispone de informacion detallada sobre los datos de entrenamiento del modelo base en la documentacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de resolver problemas aritmeticos y de logica, como se demuestra en las pruebas de correccion (17×23=391, "Tokyo", "366").
- Comprension de imagenes (vision): el proyector incluido permite responder preguntas sobre imagenes; la prueba de verificacion consistio en identificar los colores de un cuadrante de cuatro colores.
- Soporte de system prompts: Gemma 4 introduce soporte nativo para el rol de sistema, lo que facilita conversaciones estructuradas y controlables.
- Multilingue: segun la documentacion de Gemma 4, soporta mas de 140 idiomas, aunque no se especifica la cobertura exacta en esta cuantizacion.
- Capacidad de codigo: al ser parte de la familia Gemma 4, se espera un rendimiento solido en tareas de programacion, aunque no se aportan benchmarks en la model card.
- Sin soporte de tool calling o function calling documentado: no se menciona en la informacion proporcionada.

## Casos de uso

- Despliegue local en equipos AMD sin GPU discreta: gracias a la optimizacion para Strix Halo y memoria unificada, este modelo puede ejecutarse en APUs AMD de gama alta, ofreciendo inferencia multimodal a velocidades superiores a 80 tokens/s en cuantizacion 4 bits.
- Asistentes conversacionales multimodales en entornos con restricciones de hardware: la capacidad de procesar imagenes y texto simultaneamente permite construir chatbots que analicen capturas de pantalla, diagramas o fotografias en tiempo real.
- Prototipado de aplicaciones de vision por computador: el proyector de vision integrado facilita experimentos de clasificacion o descripcion de imagenes sin necesidad de un pipeline separado.
- Educacion y demostraciones tecnicas: al ser una cuantizacion novedosa para ROCm, sirve como referencia para desarrolladores que investigan el rendimiento de FP4/FPX en hardware AMD.
- Generacion de codigo asistida en entornos locales: aunque no se aportan benchmarks, el modelo base de Gemma 4 esta disenado para tareas de programacion; puede usarse con herramientas como llama.cpp para autocompletado o generacion de fragmentos.
- Investigacion sobre cuantizacion de modelos MatFormer: la arquitectura PLE presenta desafios particulares en cuantizacion; este repositorio documenta el proceso y los resultados, siendo util para estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye unicamente pruebas de correccion ad hoc y mediciones de velocidad de decodificacion en hardware AMD Strix Halo (Ryzen AI MAX+ 395, 128 GB unificados, `-ngl 999 -c 4096 -fa on -fit off`):

| Cuantizacion | Tamano | Velocidad de decodificacion (mediana) | Correccion (3/3) | Vision |
|---|---|---|---|---|
| Q4_0_ROCMFP4_COHERENT | 3,13 GiB | 80,88 t/s | Si | Si |
| Q6_0_ROCMFPX_AGENT | 4,38 GiB | 59,57 t/s | Si | Si |
| Q8_0_ROCMFPX | 4,57 GiB | ≥54,04 t/s (con contención) | Si | Si |
| Q8_0_ROCMFPX_AGENT | 4,60 GiB | ≥51,93 t/s (con contención) | Si | Si |

Las mediciones de los cuants de 8 bits se realizaron mientras el equipo estaba cuantizando otro modelo, por lo que el autor las presenta como limites inferiores; observaciones sin contención alcanzaron 56,4 y 57,5 t/s respectivamente. No se aportan comparativas con otros modelos.

## Requisitos de hardware

- Hardware objetivo: APU AMD Strix Halo (gfx1151), especificamente Ryzen AI MAX+ 395 con 128 GB de memoria unificada. No se garantiza funcionamiento en otras arquitecturas.
- VRAM: al usar memoria unificada, no se requiere VRAM dedicada; el modelo se carga en la memoria compartida del sistema.
- GPU recomendadas: ninguna GPU discreta necesaria; la APU integrada con soporte ROCm es suficiente. No es compatible con NVIDIA.
- Software: requiere un build de llama.cpp con soporte ROCmFPX (fork disponible en https://github.com/charlie12345/ROCmFPX). No funciona con llama.cpp estandar, Ollama ni LM Studio.
- Opciones de despliegue: llama.cpp (fork ROCmFPX) con carga completa en GPU (`-ngl 999`). No se mencionan otras herramientas.
- Latencia y throughput: medidos en el hardware de referencia, entre ~52 y ~81 tokens/s segun la cuantizacion, con contexto de 4096 tokens.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoria (cuantizaciones GGUF de Gemma 4 o modelos multimodales similares). La informacion proporcionada no incluye benchmarks estandar ni resultados de otros modelos en el mismo hardware. Se puede señalar que, frente a cuantizaciones GGUF convencionales (Q4_K_M, Q8_0), esta version emplea tipos tensoriales propietarios de ROCm que ofrecen mejor rendimiento en AMD, pero a costa de una compatibilidad restringida. No se dispone de comparativas numericas.

## Limitaciones y advertencias

- Incompatibilidad con software estandar: los archivos GGUF usan tipos ROCmFP4/ROCmFPX que no son reconocidos por llama.cpp, Ollama ni LM Studio en sus versiones oficiales. Es imprescindible compilar el fork ROCmFPX.
- Decodificacion especulativa (MTP) no funcional: el modelo base incluye una cabeza MTP, pero en esta cuantizacion no puede utilizarse con un modelo separado debido a limitaciones del fork (fallos en `ctx_other` y en `draft_mtp::process`). Las velocidades reportadas son sin especulacion.
- Arquitectura PLE y cuantizacion: el tensor `per_layer_model_proj.weight` se mantiene en BF16 en todas las variantes, y la reduccion de tamano entre cuants es menor de lo esperado para un modelo denso. Esto puede afectar a la eficiencia de memoria en comparacion con otros modelos.
- Riesgo de alucinacion y sesgos: no se proporciona informacion especifica sobre sesgos o comportamientos alucinatorios del modelo base. Como modelo de Google, puede heredar sesgos de sus datos de entrenamiento, aunque no se documentan en esta cuantizacion.
- Licencia: la licencia Gemma permite uso comercial, pero requiere aceptar los terminos de la licencia de Google. Se recomienda revisar los terminos completos antes de un despliegue en produccion.
- Contexto limitado en pruebas: las mediciones se realizaron con `-c 4096`, no se ha verificado el rendimiento con contextos mas largos. La documentacion oficial de Gemma 4 menciona hasta 256K tokens, pero no se confirma para esta cuantizacion.
- Sin benchmarks estandar: no se aportan resultados de MMLU, HumanEval, etc., lo que dificulta evaluar la calidad del modelo frente a alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Gemma-4-E2B-it-ROCmFP4-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-E2B-it (no verificado directamente, inferido del ID)
- Documentacion oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Pagina de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
