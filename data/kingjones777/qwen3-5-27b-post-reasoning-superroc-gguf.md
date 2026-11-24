# kingjones777/Qwen3.5-27B-Post-Reasoning-SuperRoc-GGUF

## Resumen

Qwen3.5-27B-Post-Reasoning-SuperRoc-GGUF es una cuantizacion GGUF en formato ROCm-FP4 del modelo richmondsin/Qwen3.5-27B-Post-Reasoning, publicada por el usuario kingjones777. Se trata de un build orientado especificamente al motor de inferencia local Super Roc sobre hardware Strix Halo (AMD Ryzen AI Max+ 395, arquitectura gfx1151), lo que la convierte en una pieza muy concreta dentro del ecosistema de despliegue local sobre APU de AMD.

El modelo base es un derivado multimodal de la familia Qwen3.5, con pipeline image-text-to-text, lo que implica capacidad de procesar imagenes ademas de texto. La cuantizacion principal es Q4_0 con calibracion imatrix en formato ROCm-FP4, acompanada de un proyector multimodal mmproj en BF16. El autor reporta una perplejidad de 7,21 sobre un documento tecnico en ingles de 11K tokens con contexto 4096, frente a 7,07 del Q4_K_M estandar del mismo modelo, lo que situa la perdida de calidad en un margen muy reducido.

La relevancia de esta ficha es doble: por un lado documenta un caso practico de cuantizacion FP4 sobre ROCm para hardware consumer de AMD; por otro, advierte de una discrepancia importante entre el nombre comercial del modelo ("27B") y el recuento real de parametros reportado en safetensors (460.730.096), que conviene tener en cuenta antes de planificar requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5, pipeline image-text-to-text) |
| Parametros totales | 460.730.096 (segun safetensors del repo); el nombre del modelo indica 27B |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (contexto cargado en la medicion del autor) |
| Tipos de cuantizacion | Q4_0 con imatrix en formato ROCm-FP4; proyector multimodal mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llm principal + mmproj separado) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. El pipeline declarado es image-text-to-text, lo que confirma que el modelo integra un codificador visual y un proyector multimodal (mmproj) junto al modelo de lenguaje. El nombre del modelo base (Qwen3.5-27B-Post-Reasoning) sugiere un entrenamiento posterior orientado a razonamiento ("post-reasoning"), pero no se detallan en la informacion disponible ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO.

La innovacion tecnica destacable de esta publicacion no esta en el modelo sino en el proceso de cuantizacion: se trata de un build ROCm-FP4 generado con imatrix y orientado al motor Super Roc, que a su vez se apoya en llama.cpp/ggml y en los formatos ROCm-FP4 desarrollados por el equipo ROCmFPX. El autor reporta decodificacion sin drafter (decodificacion especulativa desactivada) y soporte de prompt lookup y cache de prompt.

## Capacidades

- Generacion de texto y razonamiento, con modo "thinking" activable por peticion mediante `chat_template_kwargs.enable_thinking` (desactivado por defecto en el comando de ejemplo).
- Procesamiento de imagenes (image-text-to-text) mediante el proyector mmproj en BF16; el autor reporta "Vision: pass" en sus pruebas.
- Tool calling / function calling: el autor reporta 7/8 en modo requerido y 7/8 en modo automatico.
- Generacion de codigo: medida a 13,1 tok/s de media en dos prompts de codigo.
- Contexto largo: carga verificada de 131.072 tokens, con cache de prompt funcional (6.961 tokens cacheados de 6.986 en el segundo turno).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en la informacion disponible.

## Casos de uso

- Inferencia local sobre Strix Halo: el caso de uso principal y documentado. El modelo esta empaquetado para ejecutarse con Super Roc en un Ryzen AI Max+ 395 con 128 GB de memoria unificada, aprovechando el formato ROCm-FP4 para reducir el espacio ocupado y mantener la calidad.
- Asistente multimodal de escritorio: al integrar mmproj BF16, puede recibir imagenes junto a texto, lo que permite construir asistentes que respondan sobre capturas, diagramas o documentos escaneados en local.
- Automatizacion con tool calling: los resultados reportados (7/8 en modo requerido y automatico) lo hacen viable para pipelines de agentes que invocan funciones externas, aunque con margen de fallo que exige validacion en produccion.
- Generacion de codigo asistida en local: con 13,1 tok/s de media en prompts de codigo, es adecuado para autocompletado o generacion de fragmentos en entornos sin conexion, no para iteracion de alta velocidad.
- Procesamiento de documentos tecnicos largos: el contexto de 131.072 tokens y la cache de prompt permiten analizar manuales, especificaciones o informes extensos manteniendo el contexto entre turnos.
- Despliegue via Lemonade: el autor documenta el flujo `lemonade pull` y `lemonade chat`, lo que facilita probar el modelo sin configurar manualmente el motor de inferencia.
- Evaluacion de cuantizaciones FP4: util como referencia para medir el impacto de ROCm-FP4 frente a Q4_K_M en terminos de perplejidad (7,21 frente a 7,07) sobre el mismo modelo.

## Benchmarks y rendimiento

El autor publica mediciones de rendimiento en su hardware de referencia (Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.1, una peticion simultanea, 2026-11-23). No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Tiempo de carga | 19 s |
| Prompt tok/s (p1k) | 343,6 |
| Prompt tok/s (p8k) | 358,3 |
| Generacion tok/s (p1k) | 13,17 |
| Generacion tok/s (p8k) | 27,21 |
| Generacion de codigo tok/s | 13,1 (media de 2 prompts) |
| Tool calls (requerido / auto) | 7/8 / 7/8 |
| Cache de prompt turno 2 (cacheados / prompt) | 6.961 / 6.986 |
| Contexto cargado | 131.072 tokens |
| Vision | pass |
| Drafter | off |
| Perplejidad (documento tecnico 11K tokens, contexto 4096) | 7,21 (Q4_K_M del mismo modelo: 7,07) |

## Requisitos de hardware

- VRAM/memoria estimada: el archivo principal pesa 15.816.447.360 bytes (aproximadamente 15,8 GB) y el mmproj 931.145.760 bytes (aproximadamente 0,93 GB), lo que suma unos 16,7 GB de pesos. A ello hay que anadir el espacio para el contexto de 131.072 tokens, que en la configuracion del autor se cubre con memoria unificada de 128 GB.
- GPU/APU recomendadas: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con 128 GB, que es el hardware de referencia del autor. El formato ROCm-FP4 esta pensado para ROCm sobre esta arquitectura.
- GPU consumer: no se documenta compatibilidad con GPU consumer NVIDIA ni con otras GPU AMD distintas de gfx1151 en la informacion disponible.
- Opciones de despliegue: Super Roc (motor principal, con `superroc serve`), Lemonade (con `lemonade config set llamacpp.rocm_bin=/opt/superroc/lemonade`), y por herencia llama.cpp/ggml. No se documenta vLLM, TGI ni Ollama.
- Latencia y throughput: medidos por el autor en su hardware (ver tabla de benchmarks). La generacion a p1k es de 13,17 tok/s y a p8k de 27,21 tok/s, con prompt processing superior a 340 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| kingjones777/Qwen3.5-27B-Post-Reasoning-SuperRoc-GGUF | 460.730.096 (segun safetensors); nombre indica 27B | 131.072 | GGUF Q4_0 ROCm-FP4 + mmproj BF16 | Apache 2.0 | Optimizado para Super Roc y Strix Halo |
| richmondsin/Qwen3.5-27B-Post-Reasoning | no disponible | no disponible | safetensors (modelo base) | no disponible | Modelo original del que deriva esta cuantizacion |
| Q4_K_M estandar del mismo modelo | mismo modelo base | no disponible | GGUF Q4_K_M | Apache 2.0 (presumible) | Perplejidad 7,07 frente a 7,21 de esta version FP4 |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre del modelo indica 27B, pero el recuento de safetensors reporta 460.730.096 parametros. Conviene verificar el modelo base antes de asumir requisitos de memoria o capacidades.
- Perdida de calidad por cuantizacion: la perplejidad sube de 7,07 (Q4_K_M) a 7,21 (ROCm-FP4) en la medicion del autor, un incremento pequeno pero medible que puede afectar a tareas sensibles.
- Dependencia de hardware: el formato ROCm-FP4 y el motor Super Roc estan orientados a Strix Halo (gfx1151). No se documenta su funcionamiento en otras GPU o APU.
- Tool calling imperfecto: 7/8 en los dos modos probados implica un margen de fallo que requiere validacion y manejo de errores en produccion.
- Idiomas no documentados: no se especifican los idiomas soportados, por lo que el rendimiento en castellano no esta verificado.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni evaluaciones de alucinacion en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (richmondsin/Qwen3.5-27B-Post-Reasoning), no indicada en la informacion proporcionada.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-23), lo que sugiere un artefacto reciente y poco validado por la comunidad.
- Metricas de una sola fuente: todas las cifras de rendimiento proceden del autor, con una unica peticion simultanea y sin replicacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingjones777/Qwen3.5-27B-Post-Reasoning-SuperRoc-GGUF
- Modelo base: https://huggingface.co/richmondsin/Qwen3.5-27B-Post-Reasoning
- Repositorio Super Roc: https://github.com/kingjones30/superroc
- Documentacion de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- Repositorio ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Perfil de Carlo Pasquale: https://github.com/charlie12345
- Perfil de Donato Capitella: https://github.com/kyuz0
