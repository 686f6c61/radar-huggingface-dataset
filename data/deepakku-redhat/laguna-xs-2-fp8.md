# deepakku-redhat/Laguna-XS.2-FP8

## Resumen

Laguna XS.2-FP8 es la variante cuantizada en FP8 (con KV cache tambien en FP8) del modelo Laguna XS.2 de Poolside, un Mixture-of-Experts (MoE) de 33.442.617.168 parametros totales con aproximadamente 3.000 millones de parametros activos por token. Esta disenado especificamente para tareas de codificacion agentica y trabajo de horizonte largo ejecutado en maquina local. El repositorio publicado por el usuario `deepakku-redhat` es una redistribucion del checkpoint oficial `RedHatAI/Laguna-XS.2-FP8`, empaquetado en formato safetensors con `compressed-tensors` y libreria `vllm`.

La innovacion arquitectonica principal es una disposicion mixta de atencion: 30 de las 40 capas usan Sliding Window Attention (ventana de 512 tokens) con gating por cabeza, mientras que las 10 restantes emplean atencion global. Esta combinacion reduce drasticamente el coste del KV cache y acelera la inferencia sin sacrificar el acceso a contexto largo, que alcanza los 131.072 tokens. El modelo soporta razonamiento nativo intercalado (interleaved thinking) con preservacion del pensamiento entre llamadas a herramientas.

Su relevancia actual radica en que ofrece un rendimiento en SWE-bench Verified del 68,2% (BF16) con solo 3B parametros activos, lo que lo hace ejecutable en un Mac con 36 GB de RAM, compitiendo con modelos densos de 24-35B y con APIs propietarias como Claude Haiku 4.5 en tareas de ingenieria de software, todo bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion mixta SWA/global |
| Parametros totales | 33.442.617.168 (33B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | FP8 (esta variante, con KV cache en FP8); tambien disponibles BF16, NVFP4 e INT4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

Laguna XS.2 es un transformer MoE de 40 capas con 256 expertos y 1 experto compartido. La capa de atencion combina dos mecanismos en proporcion 3:1: 30 capas con Sliding Window Attention de 512 tokens y gating por cabeza (sigmoid gating con escalas rotatorias por capa), y 10 capas con atencion global. Esta disposicion reduce el coste de KV cache por token y permite inferencia rapida en hardware modesto. El modelo se entreno en tres fases: pre-entrenamiento, post-entrenamiento y etapas de aprendizaje por refuerzo (RL), utilizando el optimizador Muon. La model card no detalla el numero de tokens de entrenamiento ni la composicion del dataset.

La variante FP8 aqui descrita cuantiza tanto los pesos como el KV cache a FP8, lo que reduce el uso de memoria por token durante la generacion. El soporte nativo de razonamiento intercalado permite habilitar o deshabilitar el modo thinking por peticion, con preservacion del pensamiento entre llamadas a herramientas, lo cual es especialmente util en flujos agenticos multi-paso.

## Capacidades

- Generacion de texto y conversacion multi-turno en modalidad text-to-text.
- Razonamiento nativo con modo thinking intercalado entre llamadas a herramientas, habilitable y deshabilitable por peticion.
- Codificacion agentica: resolucion de issues, parcheo de repositorios y trabajo de horizonte largo.
- Soporte de tool calling / function calling integrado en el flujo de razonamiento.
- Capacidades multilingues en tareas de codigo (evaluado en SWE-bench Multilingual con 62,4%).
- Ejecucion local en hardware de consumo (Mac con 36 GB de RAM) gracias a los 3B parametros activos.
- Integracion con vLLM y Ollama para despliegue en produccion y local.

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo puede recibir un issue y el arbol del repositorio, navegar el codigo mediante tool calling y generar un parche verificable, como demuestra su 68,2% en SWE-bench Verified.
- Agente de codificacion en terminal: con un 30,1% en Terminal-Bench 2.0, es adecuado para tareas de shell, gestion de ficheros y automatizacion de entornos de desarrollo en local.
- Asistente de desarrollo en maquina personal: al caber en un Mac con 36 GB de RAM via Ollama, permite autocompletado, refactorizacion y explicacion de codigo sin enviar datos a la nube.
- Pipelines de CI/CD con correccion automatica: el soporte de tool calling y razonamiento intercalado permite integrarlo como agente que diagnostica fallos de build y propone parches antes de fusionar.
- Migracion y mantenimiento multilingue de bases de codigo: su 62,4% en SWE-bench Multilingual lo habilita para tareas que cruzan varios lenguajes de programacion.
- Trabajo de horizonte largo con contexto extenso: los 131.072 tokens de contexto permiten cargar modulos completos o documentacion extensa y razonar sobre ellos en una sola sesion.
- Despliegue en produccion con vLLM: la variante FP8 con KV cache cuantizado reduce el coste de servido y permite servir el modelo en GPUs con menos VRAM que la version BF16.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluados con el Harbor Framework del Laude Institute y el agent harness de Poolside, temperatura 0,7, top_k 20):

| Modelo | Tamano | SWE-bench Verified | SWE-bench Multilingual | SWE-bench Pro (Public) | Terminal-Bench 2.0 |
|---|---|---|---|---|---|
| Laguna XS.2 (BF16) | 33B (3B activos) | 68,2% | 62,4% | 44,5% | 30,1% |
| Devstral Small 2 | 24B dense | 68,0% | 55,7% | - | 22,5% |
| Gemma 4 31B IT | 31B dense | 52,0% | 51,7% | 35,7% | 42,9% |
| Qwen3.5-35B-A3B | 35B | 69,2% | 60,3% | 44,6% | 40,5% |
| Qwen3.6-35B-A3B | 35B | 73,4% | 67,2% | 49,5% | 51,5% |
| Claude Haiku 4.5 | - | 73,3% | - | 39,5% | 29,8% |
| GPT-5.4 Nano | - | - | - | 52,4% | 46,3% |

Los resultados corresponden a la variante BF16; la model card no publica cifras especificas para la variante FP8. La metodologia emplea pass@1 promediado sobre 4 ejecuciones (Verified), 7 (Multilingual), 3 (Pro) y 5 (Terminal-Bench 2.0), con un maximo de 500 pasos y sandbox de 8 GB RAM / 2 CPUs (48 GB RAM / 32 CPUs para Terminal-Bench).

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 ocupa 35,3 GB en disco; en inferencia requiere aproximadamente esa cifra mas el KV cache FP8 y overhead del runtime. La variante BF16 necesita alrededor del doble.
- Cabe en hardware de consumo: segun la model card, el modelo (BF16) es ejecutable en un Mac con 36 GB de RAM. La variante FP8 reduce aun mas el requisito de memoria.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, GPU con 40-48 GB o mas (A100 80GB, H100, L40S) para servido en vLLM con contexto largo. GPU de 24 GB (RTX 4090) requeririan cuantizaciones INT4/NVFP4 y contexto reducido.
- Opciones de despliegue: vLLM (libreria declarada), Ollama (disponible en el catalogo oficial), y por extension los formatos NVFP4 e INT4 para llama.cpp y similares.
- Latencia y throughput: no disponibles en la informacion proporcionada; la arquitectura SWA con 3B activos y KV cache FP8 esta disenada para inferencia rapida y bajo consumo de cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laguna XS.2 | 33B totales / 3B activos | 131.072 | 68,2% | Apache 2.0 | HF (BF16, FP8, NVFP4, INT4), Ollama, API |
| Devstral Small 2 | 24B dense | no disponible | 68,0% | no disponible | no disponible |
| Qwen3.5-35B-A3B | 35B (MoE) | no disponible | 69,2% | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35B (MoE) | no disponible | 73,4% | no disponible | no disponible |

Frente a Devstral Small 2, Laguna XS.2 iguala en SWE-bench Verified (68,2% vs 68,0%) y supera claramente en Multilingual (62,4% vs 55,7%) y Terminal-Bench (30,1% vs 22,5%), con la ventaja adicional de ser MoE con solo 3B activos. Frente a Qwen3.6-35B-A3B, este ultimo obtiene mejores cifras en todos los benchmarks publicados, pero Laguna XS.2 mantiene la ventaja de ejecucion local en 36 GB de RAM y licencia Apache 2.0 explicita.

## Limitaciones y advertencias

- Repositorio no oficial: `deepakku-redhat/Laguna-XS.2-FP8` es una redistribucion del checkpoint de Poolside/RedHatAI con 0 descargas y 0 likes; conviene usar el repositorio oficial `poolside/Laguna-XS.2` o `RedHatAI/Laguna-XS.2-FP8` para produccion.
- Idiomas soportados no documentados en la informacion disponible; el rendimiento fuera de ingles y en tareas no relacionadas con codigo no esta evaluado.
- Riesgo de alucinacion inherente a modelos generativos; en tareas de parcheo de codigo conviene verificar los cambios con tests automatizados.
- Los benchmarks se obtuvieron con el harness propio de Poolside y configuraciones de sandbox especificas; los resultados pueden variar con otros agentes o parametros de muestreo.
- La variante FP8 puede presentar degradacion menor de calidad frente a BF16; no se publican cifras comparativas FP8 vs BF16.
- El modelo esta orientado a codigo y trabajo agentico; su utilidad en dominios generales (redaccion, conocimiento factual) no esta validada.
- Aunque la licencia es Apache 2.0, la model card incluye un aviso de gateo y remite a la politica de privacidad de Poolside para el modelo original.
- La fecha de creacion del repositorio (2026-11-16) y los modelos comparados (Qwen3.6, Gemma 4, GPT-5.4) deben tratarse como datos de la model card sin verificacion independiente.

## Enlaces

- Repositorio Hugging Face (esta variante): https://huggingface.co/deepakku-redhat/Laguna-XS.2-FP8
- Modelo oficial BF16: https://huggingface.co/poolside/Laguna-XS.2
- Variante NVFP4: https://huggingface.co/poolside/Laguna-XS.2-NVFP4
- Variante INT4: https://huggingface.co/poolside/Laguna-XS.2-INT4
- Variante FP8 oficial (RedHatAI): https://huggingface.co/RedHatAI/Laguna-XS.2-FP8
- Blog de lanzamiento: https://poolside.ai/blog/laguna-a-deeper-dive
- Demo en Shimmer: https://shimmer.poolside.ai
- API key / plataforma: https://platform.poolside.ai
- Ollama: https://ollama.com/library/laguna-xs.2
- Agent harness de Poolside: https://github.com/poolsideai/pool
- Politica de privacidad: https://poolside.ai/legal/privacy
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Blog de Qwen3.6-35B-A3B (referencia de comparacion): https://qwen.ai/blog?id=qwen3.6-35b-a3b
