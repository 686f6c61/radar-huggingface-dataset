# hossain0909/keural-dpo-final

## Resumen

Keural-DPO-14.83B es un modelo de lenguaje bilingüe coreano-inglés basado en una arquitectura Mixture-of-Experts (MoE) estilo Mixtral, entrenado íntegramente desde cero por el autor hossain0909, sin partir de ningún modelo base preexistente. Este checkpoint final corresponde a la etapa de alineación por DPO (Direct Preference Optimization) completada en el paso 6.927, tras una época completa de entrenamiento sobre 440.627 pares de preferencia en coreano e inglés, tomando como punto de partida el checkpoint SFT-18k.

El problema que aborda es la escasez de modelos abiertos optimizados específicamente para coreano con buen rendimiento también en inglés. El pipeline completo incluye preentrenamiento en dos etapas (~63B tokens), SFT sobre 1,14M muestras en formato ChatML y DPO final. Con 14,83B de parámetros totales y ~7,42B activos por token, ofrece un equilibrio razonable entre capacidad y coste de inferencia. Su licencia Apache 2.0 lo hace plenamente utilizable en producción, incluido uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixtral-style MoE (8 expertos, enrutamiento top-2) |
| Parametros totales | 14,83B (15.368.933.376 segun safetensors) |
| Parametros activos | ~7,42B por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (distribuido en bfloat16) |
| Idiomas soportados | Coreano (principal), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

Detalles adicionales: 24 capas, hidden size 4096, 32 cabezas de atencion con GQA (8 cabezas KV), dimension de cabeza 128, tamano intermedio de experto 5.632, vocabulario de 131.074 tokens (131.072 SPM mas `<|im_start|>` y `<|im_end|>`), RoPE theta 500.000, ventana deslizante de 512 alternando cada dos capas, RMSNorm (eps=1e-5) y activacion SiLU.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal MoE de estilo Mixtral con 8 expertos y enrutamiento top-2 por token, lo que activa aproximadamente la mitad de los parametros en cada pasada. Emplea GQA (Grouped Query Attention) con 32 cabezas de consulta y 8 de valor-clave, ventana deslizante de 512 tokens en capas alternas y RoPE con theta de 500.000. El modelo usa formato ChatML con tokens especiales propios.

El entrenamiento consto de cuatro etapas, todas ejecutadas en 2x NVIDIA H200 SXM: preentrenamiento etapa 1 (100.000 pasos, ~50B tokens sobre corpus web coreano e ingles), preentrenamiento etapa 2 (120.000 pasos, ~13B tokens adicionales), SFT (18.000 pasos sobre 1,14M muestras ChatML del dataset mkd-chanwoo/keural-SFT, 710M tokens) y DPO final (6.927 pasos, 1 epoca sobre 440.627 pares de preferencia). El DPO uso learning rate 2e-6 con decaimiento coseno hasta 2e-7, beta (penalizacion KL) de 0,1, batch efectivo de 64, longitud maxima de secuencia de 1.024 tokens, AdamW (beta1=0,9, beta2=0,95), weight decay 0,1, FSDP FULL_SHARD y precision bfloat16 con gradient checkpointing. La perdida final fue de ~0,6924 con margenes de recompensa consistentemente positivos (+0,0009 a +0,0018) y GradNorm limpio (0,20-0,31).

## Capacidades

- Generacion de texto conversacional bilingue coreano-ingles, respondiendo en el idioma del usuario gracias al template de chat que inyecta un system prompt por defecto.
- Seguimiento de instrucciones afinado mediante SFT en formato ChatML (1,14M muestras).
- Alineacion de preferencias via DPO, orientada a respuestas mas utiles y seguras en dialogo multi-turno.
- Formato de chat ChatML con tokens `<|im_start|>`/`<|im_end|>` y deteccion de fin de generacion mediante token ID 131073.
- Compatibilidad con servidores OpenAI-compatible via vLLM.
- No hay informacion que indique soporte de tool calling, agentes, vision, audio ni modo de razonamiento explicito: no disponible.

## Casos de uso

- Asistentes conversacionales bilingues coreano-ingles: el modelo responde en el idioma del usuario de forma automatica, adecuado para chatbots de soporte que atienden a usuarios de ambos idiomas.
- Atencion al cliente en coreano: con 4.096 tokens de contexto puede mantener conversaciones multi-turno de longitud moderada integrandose en plataformas de mensajeria.
- Generacion de contenido en coreano: redaccion y revision de textos, correos y documentacion para equipos que operan en el mercado coreano.
- Asistente de productividad en ingles con soporte coreano: util para equipos bilingues que alternan idiomas en la misma aplicacion.
- Despliegue autoalojado con API OpenAI-compatible: puede servirse con vLLM y consumirse desde aplicaciones existentes usando el SDK de OpenAI sin cambios de codigo.
- Investigacion sobre MoE y alineacion DPO: al estar entrenado desde cero con pipeline documentado al detalle, es util como referencia reproducible para estudios de preentrenamiento y alineacion de modelos bilingues.
- Prototipado de chatbots con transformers: la plantilla de chat integrada permite arrancar rapidamente con `apply_chat_template`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento (perdida final ~0,6924, margen DPO positivo, GradNorm 0,20-0,31), que no son comparables con benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 31 GB solo de pesos (el repositorio ocupa 30,7 GB), mas overhead de activaciones y KV cache; en la practica se recomienda una GPU con 40 GB o mas, o dos GPUs de 24 GB con paralelismo.
- GPU recomendadas: A100 40/80 GB, H100, H200 o RTX 6000 Ada. El entrenamiento original se realizo en 2x H200 SXM (139 GiB cada una).
- Consumer GPUs: no cabe de forma nativa en una RTX 4090 (24 GB) en bfloat16. Con cuantizacion a 4 bits (~8 GB de pesos) podria caber en una RTX 4090 o RTX 3090, aunque no hay pesos cuantizados oficiales publicados.
- Despliegue: vLLM (recomendado por el autor, con comando de ejemplo en la model card), transformers con `device_map="auto"`. No hay soporte oficial documentado para llama.cpp, Ollama ni TGI: no disponible.
- Latencia y throughput: no disponible. Como referencia indirecta, el entrenamiento DPO avanzaba a ~40 segundos por paso en 2x H200.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Keural-DPO-14.83B | 14,83B | ~7,42B | 4.096 | ko, en | Apache 2.0 |
| Mixtral-8x7B-Instruct-v0.1 | 46,7B | ~12,9B | 32.768 | Multilingue (incl. ko debil) | Apache 2.0 |
| Qwen2.5-14B-Instruct | 14,7B | 14,7B (denso) | 32.768 (128k con YaRN) | Multilingue (incl. ko) | Qwen (uso comercial condicionado) |
| SOLAR-10.7B-Instruct | 10,7B | 10,7B (denso) | 4.096 | en, ko | Apache 2.0 |

Keural destaca frente a Mixtral-8x7B por su enfoque nativo en coreano y su menor coste de inferencia (7,42B activos frente a ~12,9B), aunque pierde claramente en longitud de contexto y probablemente en capacidad general. Frente a Qwen2.5-14B, ofrece una arquitectura MoE mas eficiente en inferencia y licencia Apache 2.0 sin condiciones, pero con contexto mucho mas corto y sin ecosistema de herramientas. Frente a SOLAR-10.7B, otro modelo orientado a coreano, aporta la eficiencia MoE, aunque SOLAR tiene mayor adopcion y validacion comunitaria. No hay datos de benchmarks que permitan comparar rendimiento medido.

## Limitaciones y advertencias

- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones muy extensas; el DPO se entreno ademas con secuencias de maximo 1.024 tokens, por lo que el comportamiento en contextos cercanos al limite es incierto.
- Riesgo de alucinacion no cuantificado: al no existir benchmarks publicados ni evaluaciones independientes, se recomienda validacion propia antes de uso en produccion.
- Margen de recompensa DPO muy pequeno (+0,0009 a +0,0018), lo que sugiere una alineacion moderada; la diferencia respecto al checkpoint SFT podria ser limitada.
- Modelo de autor individual con adopcion minima (275 descargas, 0 likes en el momento de la ficha), sin auditoria comunitaria ni evaluaciones de terceros.
- Sesgos: entrenado sobre corpus web y datasets como hh_rlhf y ultrafeedback, por lo que puede heredar sesgos de esos datos; no se ha publicado analisis de sesgos.
- Soporte de idiomas limitado a coreano e ingles; el rendimiento fuera de estos idiomas no esta garantizado.
- Licencia Apache 2.0 sin restricciones comerciales relevantes, aunque conviene revisar las licencias de los datasets de entrenamiento derivados (AI Hub coreano tiene condiciones de uso propias).
- Requiere custom code segun los tags del repositorio, lo que añade consideraciones de seguridad al cargar el modelo.
- No hay soporte documentado para tool calling, agentes, ni capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hossain0909/keural-dpo-final
- Modelo base (SFT): no disponible como URL directa en la informacion proporcionada (referenciado como mkd-hossain/keural-sft-18k)
- Datasets de entrenamiento: no disponible como URLs directas (referenciados como mkd-chanwoo/keural-SFT, hh_rlhf, ultrafeedback_binarized, orca_dpo_paris_ko, aihub_71760, aihub_71748, multifaceted_collection_dpo y keural-dpo-raw)
- Paper, blog o demo: no disponible
