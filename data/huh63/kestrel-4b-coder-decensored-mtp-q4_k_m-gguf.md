# hUh63/Kestrel-4B-Coder-Decensored-MTP-Q4_K_M-GGUF

## Resumen

Kestrel-4B-Coder-Decensored-MTP-Q4_K_M-GGUF es una cuantizacion GGUF de la variante "decensored" del modelo Jackrong/Kestrel-4B-Coder, un modelo de 4.326 millones de parametros construido sobre la familia Qwen3.5-4B de Alibaba. El autor de esta publicacion, hUh63, aplica la tecnica de abliteration implementada en Heretic 2.1.0.dev0 para reducir la tasa de rechazo del modelo base (de 98/100 a 8/100 respuestas de rechazo en el conjunto harmful_behaviors) con una divergencia KL de 0.0206 respecto al original, y posteriormente lo cuantiza a Q4_K_M preservando la capa de prediccion MTP (Multi-Token Prediction) en Q6_K.

El modelo es relevante porque combina tres elementos poco habituales en un mismo artefacto: una arquitectura Qwen3.5 con atencion lineal hibrida, una cabeza MTP de una capa que permite decodificacion especulativa en un unico fichero GGUF (sin necesidad de un modelo borrador separado) y un proceso de abliteration documentado y reproducible. Ademas incluye una torre de vision separada en formato mmproj-F16, lo que habilita entrada image-text-to-text.

El contexto practico es el de un modelo pequeno (4B) orientado a generacion de codigo, con licencia Apache-2.0 y soporte declarado para siete idiomas (ingles, chino, coreano, japones, ruso, espanol y frances). Su tamano de repositorio es de 3,5 GB y acumula 629 descargas en el momento de la consulta. Es importante subrayar que la eliminacion de la alineacion de seguridad es deliberada y que el autor advierte explicitamente del riesgo de contenido y de la responsabilidad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 con atencion lineal hibrida; transformer con capa MTP (NextN) de prediccion multi-token |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (principal); capa MTP `blk.32.*` promovida a Q6_K; proyeccion visual en F16 |
| Idiomas soportados | en, zh, ko, ja, ru, es, fr |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero unico + `mmproj-F16.gguf` separado) |

## Arquitectura y entrenamiento

El modelo base Kestrel-4B-Coder deriva de la familia Qwen3.5-4B y emplea una arquitectura transformer con atencion lineal hibrida. Incorpora una cabeza MTP de una capa (`nextn_predict_layers=1`) que se integra en el mismo grafo: el GGUF resultante declara `block_count=33`, donde el bloque 32 corresponde a la capa NextN. Esta cabeza actua como mecanismo de decodificacion especulativa interna, de modo que un unico fichero puede generar candidatos y verificarlos con el modelo principal sin cargar un modelo borrador adicional. La torre de vision se distribuye por separado como `mmproj-F16.gguf` (672.422.944 bytes).

El proceso de "decensored" se realizo con Heretic 2.1.0.dev0 mediante el modifier Abliteration, con los parametros `direction_index=null` (direccion residual por capa), `max_weight=1.65`, `alpha=1.0`, `wd_pos=24`, `wd_dist=24`, `min_weight=0.0`, `mw_attn=1.65` y `mw_mlp=0.0`. La abliteration solo se aplica a las proyecciones de salida de atencion que escriben en el flujo residual, desactivando la ablacion de MLP. La cuantizacion se genero con `convert_hf_to_gguf.py` e imatrix sobre aproximadamente 600 KiB de corpus multilingue de codigo, matematicas, razonamiento y agentes, con cobertura `--nextn` sobre la capa MTP. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de codigo en multiples lenguajes, con orientacion explicita a code-generation.
- Razonamiento y matematicas, segun los tags y el corpus de calibracion imatrix empleado.
- Capacidades de vision: pipeline declarado como image-text-to-text, con torre visual servida via `mmproj-F16.gguf`.
- Decodificacion especulativa integrada mediante la cabeza MTP, sin modelo borrador externo.
- Soporte multilingue declarado en siete idiomas: ingles, chino, coreano, japones, ruso, espanol y frances.
- Modo conversacional (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se especifica soporte explicito de tool calling ni de function calling en la informacion disponible.
- No se especifica soporte explicito de agentes multi-paso ni de modo "thinking" en la informacion disponible.

## Casos de uso

- Generacion de codigo en local: el modelo puede producir funciones y fragmentos de codigo en un equipo de consumo gracias a su cuantizacion Q4_K_M y a su tamano de 4B, con la ventaja de la decodificacion especulativa MTP para reducir latencia en generacion de secuencias largas.
- Asistente de programacion integrado en el IDE: al ser un GGUF unico con soporte de vision, puede recibir capturas de pantalla de errores o diagramas junto con el prompt de texto para explicar y corregir codigo.
- Procesamiento de documentacion tecnica multilingue: con soporte declarado para espanol, frances, ruso, japones, coreano y chino, resulta util para equipos que trabajan con documentacion en varios idiomas y necesitan resumenes o traducciones tecnicas.
- Prototipado de pipelines de razonamiento sobre codigo: la cabeza MTP permite experimentar con decodificacion especulativa en un solo fichero, lo que simplifica la evaluacion de tecnicas de aceleracion en entornos de investigacion.
- Extraccion y transformacion de datos estructurados a partir de imagenes: gracias al pipeline image-text-to-text, se puede usar para transcribir tablas, diagramas o capturas a formatos estructurados.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo y ofrecer cuantizacion Q4_K_M, es adecuado para estaciones de trabajo sin aceleradores de datacenter, con llama.cpp u Ollama.
- Experimentacion en investigacion sobre alineacion y abliteration: el repositorio incluye recetas, configuraciones y datos punto por punto en el directorio `decensor/`, lo que permite reproducir y comparar el efecto de la abliteration sobre la tasa de rechazo y la divergencia KL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo cuantizado Q4_K_M en la informacion disponible. La model card indica explicitamente que las puntuaciones de HumanEval y HumanEval+ corresponden al modelo original en Q8_0 y no a esta cuantizacion, y que en esta ronda no se ejecutaron benchmarks.

Los unicos datos numericos publicados son las metricas del proceso de abliteration:

| Metrica | Valor |
|---|---|
| Tasa de rechazo del modelo base (harmful_behaviors test[:100]) | 98 / 100 |
| Tasa de rechazo tras abliteration | 8 / 100 |
| Divergencia KL respecto al original (harmless_alpaca test[:100]) | 0.0206 |
| Tamano del GGUF principal | 2.807.777.152 bytes |
| Tamano de la proyeccion visual mmproj | 672.422.944 bytes |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF principal ocupa aproximadamente 2,8 GB y la proyeccion visual unos 0,67 GB; en modo texto, la VRAM necesaria ronda los 3-4 GB incluyendo el contexto, y en modo multimodal se aproxima a 4-5 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para uso comodo; tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (soporte nativo de `--spec-type draft-mtp`), Ollama y otros runners compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia tipo endpoint.
- Latencia y throughput estimados: no disponibles. La model card no publica porcentajes de aceptacion de la decodificacion especulativa, y advierte que la tasa de aceptacion varia segun el estilo del prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kestrel-4B-Coder-Decensored-MTP-Q4_K_M (este) | 4,33B | no disponible | Apache-2.0 | GGUF Q4_K_M + mmproj F16 | Vision, MTP, abliteration |
| Jackrong/Kestrel-4B-Coder (base) | 4,33B | no disponible | Apache-2.0 | safetensors | Modelo original alineado, sin cuantizar |
| Qwen3.5-4B (familia base) | ~4B | no disponible | no disponible | safetensors | Modelo fundacional de Alibaba |
| Heretic 2.1.0.dev0 (herramienta) | no aplica | no aplica | AGPL-3.0 | codigo | Herramienta de abliteration, no modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- La alineacion de seguridad ha sido debilitada deliberadamente: el modelo puede generar contenido o codigo que el modelo original rechazaria. El autor advierte que el usuario asume toda la responsabilidad legal y de contenido.
- La abliteration reduce la direccion de rechazo medida en un conjunto limitado (100 prompts), pero no garantiza el comportamiento en cada prompt individual; los conjuntos de evaluacion son reducidos.
- La cuantizacion Q4_K_M introduce perdida de precision irreversible respecto a BF16. Esta perdida es independiente de la decodificacion especulativa, que si es sin perdida (verify-then-accept).
- La cabeza MTP proviene del checkpoint original alineado y solo genera candidatos; cada token se verifica con el tronco decensored, por lo que la tasa de aceptacion varia segun el prompt.
- El corpus de calibracion imatrix es de aproximadamente 600 KiB, un tamano limitado que puede afectar a la calidad en dominios poco representados.
- No se dispone de informacion sobre sesgos conocidos, comportamiento en contextos largos ni limites de la ventana de contexto.
- La licencia Apache-2.0 se hereda del modelo fuente, pero al tratarse de una obra derivada los titulares de derechos pueden solicitar su retirada.
- El uso comercial esta permitido por la licencia Apache-2.0, pero la ausencia de alineacion de seguridad puede incumplir politicas de plataformas o requisitos regulatorios en determinados sectores.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, aunque es inherente a modelos de 4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hUh63/Kestrel-4B-Coder-Decensored-MTP-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Jackrong/Kestrel-4B-Coder
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Conjunto de evaluacion harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Conjunto de evaluacion harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Repositorio de metodos CNB (recetas y configuraciones): ruta `docs/quantization/kestrel/heretic210dev0-cheapest/` citada en la model card (sin URL publica disponible)
