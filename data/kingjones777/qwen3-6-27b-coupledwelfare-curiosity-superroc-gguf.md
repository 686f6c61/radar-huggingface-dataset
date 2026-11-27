# kingjones777/Qwen3.6-27B-CoupledWelfare-Curiosity-SuperRoc-GGUF

## Resumen

Qwen3.6-27B-CoupledWelfare-Curiosity-SuperRoc-GGUF es una cuantizacion GGUF del modelo Bioaligned/Qwen3.6-27B-CoupledWelfare-Curiosity, publicada por el usuario kingjones777. Se trata de un build especifico en formato ROCm-FP4 (Q4_0) orientado al motor de inferencia local Super Roc, disenado para ejecutarse sobre hardware Strix Halo (concretamente el Ryzen AI Max+ 395 con iGPU gfx1151). El modelo base parte de la familia Qwen3.6 de 27B parametros, afinado por Bioaligned con un enfoque declarado en su nombre de "Coupled Welfare" y "Curiosity".

El problema que resuelve esta publicacion es la disponibilidad de un artefacto listo para ejecutar un modelo de ~27B en una maquina de escritorio con memoria unificada de 128 GB, sin GPU dedicada, mediante un formato de cuantizacion optimizado para ROCm y una ventana de contexto configurable de hasta 131.072 tokens. El repositorio ocupa 15,1 GB y contiene un unico fichero GGUF de 15.056.229.888 bytes.

La relevancia actual radica en que demuestra la viabilidad de servir modelos de clase 27B con contexto largo en hardware de consumo basado en APU AMD, con metricas de rendimiento publicadas por el autor (534 tok/s de prompt y hasta 49 tok/s de generacion en ciertas condiciones). No obstante, se trata de una cuantizacion de un modelo derivado, no del modelo oficial de Qwen, y la informacion disponible sobre el afinado del modelo base es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.6; detalles no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configurado en el comando de ejemplo del autor) |
| Tipos de cuantizacion | Q4_0 en formato ROCm-FP4 (imatrix); un unico fichero GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3.6-27B-CoupledWelfare-Curiosity-Q4_0-ROCmFP4-FAST-imatrix.gguf) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.6, por lo que se asume una arquitectura transformer decoder-only, pero no se confirman aspectos como atencion lineal, mezcla de expertos o mecanismos hibridos. Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el afinado de Bioaligned empleo RLHF, DPO u otras tecnicas de alineamiento; el nombre del modelo sugiere un entrenamiento orientado a objetivos de "bienestar acoplado" y "curiosidad", pero no hay documentacion tecnica al respecto en la informacion proporcionada.

La innovacion tecnica destacable de esta publicacion es la cuantizacion ROCm-FP4 (Q4_0 con imatrix) desarrollada por el equipo ROCmFPX, que adapta el formato FP4 al backend ROCm de llama.cpp/ggml para aprovechar las capacidades de la iGPU gfx1151 de Strix Halo. El autor reporta una perplejidad de 6,47 sobre un documento tecnico en ingles de 11K tokens con contexto 4096, frente a 6,40 del Q4_K_M estandar del mismo modelo, lo que indica una degradacion muy contenida respecto a la cuantizacion de referencia. El fichero incluye una matriz de importancia (imatrix) para mejorar la calidad de la cuantizacion.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el modelo esta etiquetado como "conversational".
- Modo de razonamiento (thinking): desactivable por defecto y activable por peticion mediante chat_template_kwargs.enable_thinking.
- Tool calling / function calling: el autor reporta 7 de 8 llamadas correctas tanto en modo requerido como en modo automatico.
- Soporte de contexto largo: hasta 131.072 tokens cargados en el motor Super Roc.
- Cache de prompt: se reporta reutilizacion de 6961 de 6985 tokens en el segundo turno de una conversacion.
- Generacion de codigo: medida con dos prompts de codigo (13,8 tok/s de media).
- Capacidades multilingues: no disponibles (no se especifican idiomas soportados).
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo puede mantener conversaciones multi-turno apoyandose en la cache de prompt (6961 de 6985 tokens reutilizados en el segundo turno) y en una ventana de hasta 131.072 tokens, adecuado para analisis de documentos extensos en una maquina de escritorio.
- Automatizacion con tool calling: con una tasa reportada de 7/8 llamadas correctas, es viable integrarlo en flujos que consulten APIs o ejecuten funciones, aunque requiere validacion adicional en produccion por el 12,5% de fallos.
- Asistencia a la programacion en local: la generacion de codigo medida (13,8 tok/s) permite autocompletado y explicacion de fragmentos en entornos de desarrollo sin conexion a la nube.
- Procesamiento de documentacion tecnica: la perplejidad de 6,47 sobre documentos tecnicos en ingles sugiere un comportamiento razonable para resumen y extraccion de informacion en ese dominio.
- Despliegue en estaciones de trabajo con APU AMD: al ejecutarse en Strix Halo con 128 GB de memoria unificada, encaja en escenarios de privacidad estricta donde no se permite enviar datos a servicios externos.
- Prototipado e investigacion sobre alineamiento: al ser un modelo afinado con objetivos declarados de "Coupled Welfare" y "Curiosity", puede servir para estudiar el comportamiento de modelos alineados con propositos especificos, siempre con las cautelas sobre la falta de documentacion del afinado.
- Servicio local compatible con endpoints: la etiqueta endpoints_compatible y la integracion con Lemonade permiten exponerlo como servicio compatible con APIs de chat en una red local.

## Benchmarks y rendimiento

El autor publica metricas de inferencia medidas el 2026-11-23 sobre Ryzen AI Max+ 395 con 128 GB y Super Roc 0.20.0 (release candidate), con una peticion simultanea:

| Metrica | Valor |
|---|---|
| Tiempo de carga (s) | 5 |
| Prompt tok/s (p1k) | 534,5 |
| Prompt tok/s (p8k) | 516,5 |
| Generacion tok/s (p1k) | 16,11 |
| Generacion tok/s (p8k) | 49,06 |
| Generacion de codigo tok/s | 13,8 (media de 2 prompts) |
| Tool calls (requerido / automatico) | 7/8 / 7/8 |
| Cache de prompt turno 2 (cacheado / prompt) | 6961 / 6985 |
| Contexto cargado | 131.072 tokens |
| Drafter | off |
| Perplejidad (documento tecnico 11K, contexto 4096) | 6,47 (Q4_K_M estandar: 6,40) |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero GGUF ocupa 15,1 GB; en Strix Halo se emplea memoria unificada, y el autor lo ejecuta con 128 GB de sistema y 131.072 tokens de contexto.
- GPU recomendadas: el autor valida exclusivamente sobre Ryzen AI Max+ 395 (iGPU gfx1151, Strix Halo). No se documenta compatibilidad con A100, H100 ni RTX 4090.
- GPU de consumo: cabe en hardware de consumo con al menos ~16 GB de memoria disponible para el fichero, aunque el formato ROCm-FP4 esta orientado a ROCm/gfx1151 y no se garantiza su funcionamiento en GPUs NVIDIA.
- Opciones de despliegue: Super Roc (motor propio del autor), Lemonade (con llamacpp.rocm_bin apuntando a /opt/superroc/lemonade). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 5 s de carga, 534,5 tok/s de prompt a p1k, 516,5 tok/s a p8k, 16,11 tok/s de generacion a p1k y 49,06 tok/s a p8k, medidos con una sola peticion simultanea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-CoupledWelfare-Curiosity-SuperRoc-GGUF (este) | ~26,9B | 131.072 (configurado) | Q4_0 ROCm-FP4 | Apache 2.0 | GGUF en Hugging Face |
| Bioaligned/Qwen3.6-27B-CoupledWelfare-Curiosity (base) | ~26,9B | no disponible | pesos originales | Apache 2.0 (segun este repo) | Hugging Face |
| Q4_K_M estandar del mismo modelo | ~26,9B | no disponible | Q4_K_M | Apache 2.0 | referenciado por el autor (perplejidad 6,40) |

No se dispone de datos de rendimiento en benchmarks academicos ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni proceso de alineamiento del modelo base; el nombre "Coupled Welfare" y "Curiosity" no viene acompanado de documentacion tecnica verificable.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual.
- El tool calling alcanza 7/8 llamadas correctas, lo que implica un 12,5% de fallos en la medicion del autor; no es adecuado para produccion sin validacion y reintentos.
- No se especifican idiomas soportados; el unico dato de calidad (perplejidad 6,47) corresponde a un documento tecnico en ingles.
- La cuantizacion ROCm-FP4 esta orientada a Strix Halo (gfx1151) y al motor Super Roc; su portabilidad a otros backends o GPUs no esta documentada y podria no funcionar.
- Las metricas de rendimiento proceden de una unica maquina, una version release candidate del motor y una sola peticion simultanea; no reflejan escenarios de concurrencia.
- Aunque la licencia declarada es Apache 2.0, se trata de una cuantizacion de un modelo derivado de Qwen3.6; conviene verificar los terminos del modelo base antes de uso comercial.
- El repositorio tiene 0 likes y 214 descargas, y fue creado y actualizado el mismo dia (2026-11-23), lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Qwen3.6-27B-CoupledWelfare-Curiosity-SuperRoc-GGUF
- Modelo base: https://huggingface.co/Bioaligned/Qwen3.6-27B-CoupledWelfare-Curiosity
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentacion de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX (formatos ROCm-FP4): https://github.com/charlie12345/ROCmFPX
