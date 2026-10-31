# end000/Clover-35B-A3B-Preview-GGUF

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje de difusion desarrollado por DiffuSpace, derivado de Qwen3.6-35B-A3B. Pertenece a una nueva generacion de modelos que combinan arquitectura mixture-of-experts (MoE) con decodificacion por difusion en lugar del tradicional decoding causal autorregresivo. La ficha que se evalua aqui corresponde a una cuantizacion IQ4_XS en formato GGUF publicada por el usuario end000, generada directamente desde los pesos BF16 originales.

El problema que aborda Clover es doble: por un lado, reducir el coste computacional por token generado mediante MoE (34,66 mil millones de parametros totales con aproximadamente 3B activos, segun la nomenclatura A3B); por otro, explorar la generacion por difusion como alternativa al decoding secuencial, lo que puede permitir paralelizacion de la generacion. El modelo conserva tensores bidireccionales GDN (Gated DeltaNet) adicionales heredados de su arquitectura hibrida.

Su relevancia actual radica en que representa la frontera experimental de los modelos de difusion para texto: requiere runtimes especializados (una version parcheada de llama.cpp), por lo que esta dirigido a desarrolladores e investigadores interesados en evaluar arquitecturas no autorregresivas, no a usuarios finales que busquen un modelo listo para produccion con soporte estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion de texto hibrida con MoE y tensores bidireccionales GDN (derivada de Qwen3.6-35B-A3B) |
| Parametros totales | 34.661.350.848 (34,66B) |
| Parametros activos | no disponible (la designacion A3B sugiere ~3B activos, pero no esta confirmado en la documentacion) |
| Longitud de contexto | 128K (131.072 tokens, segun el comando de ejemplo del autor de la cuantizacion) |
| Tipos de cuantizacion | IQ4_XS (esta ficha); BF16 disponible en el modelo original |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (18,94 GB en IQ4_XS); BF16 en el modelo base |

## Arquitectura y entrenamiento

Clover es un modelo de difusion para texto, no un transformer autorregresivo convencional. Deriva de Qwen3.6-35B-A3B, un modelo MoE de 35B parametros totales con aproximadamente 3B activos por token. La implementacion en llama.cpp preserva los "tensores bidireccionales GDN adicionales" caracteristicos de la arquitectura Clover, y la model card enfatiza que se trata del modelo de difusion Clover, no de su modelo base Qwen original. La combinacion de MoE con capas GDN bidireccionales sugiere una arquitectura hibrida attention/linear-attention orientada a eficiencia en contextos largos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre procesos de alineamiento (RLHF, DPO). Tampoco se detalla el mecanismo exacto de muestreo por difusion ni el numero de pasos de denoising. En cuanto a la cuantizacion distribuida en este repositorio: se realizo desde los pesos BF16 originales mediante un GGUF BF16 intermedio, sin matriz de importancia, con comandos de conversion documentados y metadatos de reproducibilidad (SHA-256 y `quantization.json`).

## Capacidades

- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Decodificacion por difusion como alternativa al decoding causal, con un modo experimental `draft-self` de decodificacion especulativa (no garantiza aceleracion).
- Arquitectura MoE para inferencia eficiente por token.
- Contexto largo de hasta 128K tokens en la configuracion de ejemplo.
- No hay informacion sobre capacidades de vision, audio, tool calling ni agentes en la documentacion disponible.

## Casos de uso

- Investigacion en modelos de difusion para texto: es uno de los pocos modelos de difusion MoE disponibles en GGUF, ideal para estudiar el comportamiento de la generacion no autorregresiva en llama.cpp.
- Evaluacion de decodificacion especulativa: el modo `draft-self` permite experimentar con speculative decoding en arquitecturas de difusion, aunque de forma experimental.
- Chatbots locales con contexto largo: con 128K de contexto y solo ~3B de parametros activos (por designacion A3B), puede servir para asistentes conversacionales que procesen documentos extensos en estaciones de trabajo con GPU de consumo.
- Prototipado en hardware de consumo: la configuracion documentada por el autor demuestra ejecucion en una RTX 4070 de 12 GB con 64 GB de RAM, descargando pesos de expertos a RAM.
- Desarrollo de backends de inferencia: al requerir un PR especifico de llama.cpp, es util como banco de pruebas para quien desarrolle soporte de arquitecturas de difusion en runtimes open source.
- Comparativas de calidad de cuantizacion: al incluir metadatos de reproducibilidad y provenance, sirve para validar pipelines de cuantizacion IQ4_XS sobre modelos hibridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor de la cuantizacion indica explicitamente que el repositorio "no proporciona una evaluacion controlada de calidad o throughput".

## Requisitos de hardware

- La cuantizacion IQ4_XS ocupa 18,94 GB; con contexto de 128K tokens, la configuracion de referencia del autor cabe en una RTX 4070 de 12 GB de VRAM mas 64 GB de RAM del sistema.
- La configuracion documentada mantiene los pesos de expertos de las primeras 32 capas en RAM (con `--n-cpu-moe 32`) y coloca las 8 capas de expertos restantes y el resto de capas en GPU (3.264 MiB de pesos cuantizados en GPU), con buffers de contexto y computo adicionales en VRAM.
- Se recomienda `--load-mode none` para evitar pesos de expertos mapeados en memoria por CPU.
- La compilacion CUDA local del autor esta dirigida a compute capability 8.9 (RTX 40xx), con CUDA Graphs y Flash Attention activados.
- Despliegue: requiere la rama `dev-clover` del fork [Maphist0/llama.cpp-pub](https://github.com/Maphist0/llama.cpp-pub/tree/dev-clover) (commit `4838ffb0c8ade92f34d9157deea38d92758ab824`) o el PR [ggml-org/llama.cpp#31306](https://github.com/ggml-org/llama.cpp/pull/31306). No funciona con versiones estandar de llama.cpp sin parchear. No hay soporte documentado de vLLM, TGI ni Ollama.
- No hay datos de latencia ni throughput publicados.

## Comparativa con modelos similares

| Caracteristica | Clover-35B-A3B-Preview (IQ4_XS) | Qwen3-30B-A3B | Llama 3.3 70B |
|---|---|---|---|
| Parametros totales | 34,66B | 30,5B | 70B |
| Parametros activos | ~3B (A3B, no confirmado) | ~3B | 70B (denso) |
| Tipo de decodificacion | Difusion (hibrida con GDN) | Autorregresiva | Autorregresiva |
| Contexto | 128K (segun config. de ejemplo) | 32K-128K (seg. version) | 128K |
| Licencia | Apache-2.0 | Apache-2.0 | Llama 3.3 Community License |
| Formato | GGUF (requiere runtime parcheado) | GGUF, safetensors (soporte estandar) | GGUF, safetensors (soporte estandar) |
| Madurez del ecosistema | Experimental (PR de llama.cpp) | Amplio soporte | Amplio soporte |

Nota: la comparacion es orientativa; no hay benchmarks que permitan comparar rendimiento en calidad. La diferencia principal es que Clover exige un runtime especializado, mientras que las alternativas funcionan con cualquier backend estandar.

## Limitaciones y advertencias

- Compatibilidad critica: el GGUF no funciona en versiones estandar de llama.cpp; exige el PR #31306 o la rama `dev-clover` en un commit concreto. Cualquier actualizacion puede romper la ejecucion.
- El modo de decodificacion especulativa `draft-self` es experimental y no garantiza aceleracion, especialmente con expertos MoE residentes en CPU; ademas requiere un fix adicional en `llama-server` para inicializar.
- No hay evaluacion de calidad ni de throughput publicada por el autor de la cuantizacion; la cuantizacion se realizo sin matriz de importancia, lo que puede afectar a la calidad frente a cuantizaciones con imatrix.
- El ajuste de memoria depende de la carga de trabajo y de otros procesos usando la GPU; la configuracion de RTX 4070 no es garantia universal.
- Idiomas soportados, datos de entrenamiento y proceso de alineamiento: no disponibles, lo que impide evaluar sesgos, riesgo de alucinacion o cobertura multilingue.
- Al ser un modelo preview derivado de un modelo base (Qwen3.6-35B-A3B) mediante difusion, su comportamiento en produccion esta sin validar.
- La licencia Apache-2.0 no impone restricciones de uso comercial, pero conviene revisar el `ATTRIBUTIONS.md` original por la derivacion de Qwen.

## Enlaces

- Repositorio de la cuantizacion (GGUF IQ4_XS): https://huggingface.co/end000/Clover-35B-A3B-Preview-GGUF
- Modelo original de DiffuSpace: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- PR de soporte Clover en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31306
- Fork de llama.cpp con rama `dev-clover`: https://github.com/Maphist0/llama.cpp-pub/tree/dev-clover
- Paper, blog oficial y demo: no disponibles en la informacion proporcionada.
