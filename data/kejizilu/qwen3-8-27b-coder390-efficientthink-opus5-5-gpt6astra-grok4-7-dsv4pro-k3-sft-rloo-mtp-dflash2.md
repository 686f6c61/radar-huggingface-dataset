# kejizilu/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2

## Resumen

Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2 es un modelo de lenguaje de 27.320.697.856 parametros post-entrenado por el usuario de HuggingFace kejizilu sobre el modelo base `nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2`, que a su vez es una version post-entrenada del Qwen3.8-27B oficial. Su proposito principal es corregir un defecto del modelo original: la tendencia a no detener el razonamiento una vez obtenida la respuesta, re-derivandola hasta agotar la ventana de 94K tokens sin emitir respuesta final.

Para ello, el autor aplico varias rondas alternas de SFT y RLOO (Reinforcement Learning with Leave-One-Out), con datos de trayectorias de profesores y un esquema de recompensa que penaliza respuestas vacias y truncamientos. El resultado es un modelo de razonamiento y programacion, multimodal (texto e imagen/video), etiquetado como "uncensored" y con licencia Apache 2.0.

El repositorio destaca por su amplia oferta de cuantizaciones: cinco niveles en safetensors (BF16, FP8 Block128 estatico, NVFP4 W4A16, W4A4 y W4A4-W8A8 mixto), variantes INT4/INT8 y una coleccion GGUF (Q2 a Q8_0), ademas de incluir un cabezal MTP en BF16 y un borrador DFlash2 para decodificacion especulativa, con compatibilidad directa con SGLang, vLLM y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.8, transformer multimodal) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 94K tokens (limite de truncamiento referenciado en la model card) |
| Tipos de cuantizacion | BF16, FP8 estatico Block128, NVFP4 W4A16, NVFP4 W4A4, NVFP4 W4A4-W8A8 (mixto), NVFP4-NInfer, INT4 W4A16, INT8 W8A8, INT8 W8A16, GGUF Q2/Q3/Q4 LynnStyle, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.8-27B oficial (post-entrenado previamente con SFT y SimPO por el autor, obteniendo el "EfficientThink base") y se somete a un ciclo de entrenamiento en varias fases: continuacion de SFT (K3), una segunda ronda de SFT (week2dose, update-225), una primera ronda de RLOO con 182 grupos, otra ronda de SFT (merge-sft-100) y una segunda ronda de RLOO con 172 grupos. El objetivo declarado del entrenamiento "EfficientThink" es eliminar las colas de razonamiento improductivas sin suprimir el razonamiento largo necesario.

Los datos de RLOO se generaron muestreando 8 trayectorias por problema y conservando solo grupos con respuestas correctas e incorrectas mezcladas (los grupos totalmente correctos se descartan). Los grupos con 0 o 1 trayectoria correcta reciben una trayectoria corta de profesor revisada que sustituye a la trayectoria incorrecta mas corta. El conjunto final de la segunda ronda consta de 172 grupos y 1.376 trayectorias (859 correctas y 517 incorrectas, incluidas 68 respuestas vacias). La funcion de recompensa penaliza solo las trayectorias incorrectas: +1.05 para respuestas cortas y correctas (<24K tokens), +1.0 para largas y correctas, y penalizaciones graduales de -0.2 a -1.0 para respuestas incorrectas segun su longitud, con -1.0 para respuestas vacias. Segun la model card, las trayectorias de profesores (identificados en el nombre como Opus5.5, GPT6Astra, DSV4Pro y K3) se usaron para generar respuestas gold y datos de entrenamiento.

Como innovaciones de inferencia, el repositorio incluye dos opciones excluyentes de decodificacion especulativa: DFlash2 (unos 180 tok/s por peticion) y MTP (multi-token prediction, unos 91 tok/s), frente a unos 46 tok/s sin especulacion. La cuantizacion FP8 estatica se calibra con metodos que la model card asocia a tags como imatrix, hessian, block128 y GSQ/RCO, y se declara "sin perdidas" en GPQA y LCB respecto a BF16.

## Capacidades

- Razonamiento y resolucion de problemas con modo de pensamiento eficiente: el entrenamiento busca respuestas finales sin colas de razonamiento improductivas.
- Generacion de codigo reforzada (componente "Coder" del nombre), evaluada con LiveCodeBench (LCB).
- Resolucion de examenes de conocimiento y razonamiento cientifico (GPQA, MMLU).
- Capacidades multimodales: entrada de texto e imagen/video (pipeline image-text-to-text).
- Conversacion multi-turno (tag conversational).
- Decodificacion especulativa mediante MTP (cabezal BF16 incluido) o DFlash2, con aceleraciones de hasta 180 tok/s por peticion.
- Compatibilidad con motores de servido modernos: SGLang sin parches, vLLM (FP8 probado) y llama.cpp (GGUF).
- Modelo etiquetado como "uncensored": sin alineacion de seguridad restrictiva adicional del post-entrenamiento del autor.

## Casos de uso

- Resolucion de problemas cientificos y de examen: el modelo alcanza 178/198 en GPQA bajo el protocolo del autor, adecuado para asistentes de estudio o verificacion de razonamiento en fisica, quimica y biologia.
- Programacion competitiva y generacion de codigo: con 90/100 en LiveCodeBench y el componente "Coder" reforzado, sirve para autocompletado avanzado, resolucion de ejercicios algoritmicos y revision de codigo.
- Agentes de razonamiento multi-paso: la reduccion de truncamientos a 94K tokens (de 13 a 3 en LCB) hace mas fiables los flujos agenticos que requieren respuestas finales garantizadas dentro de la ventana de contexto.
- Inferencia de alto rendimiento en produccion: gracias a DFlash2 y MTP, despliegues en SGLang o vLLM pueden alcanzar hasta 180 tok/s por peticion, util para servicios con requisitos de latencia.
- Despliegue local en hardware limitado: las cuantizaciones GGUF (Q2 a Q8_0) y NVFP4 permiten ejecutar el modelo en estaciones de trabajo y GPUs de consumo con llama.cpp.
- Procesamiento de documentos con imagenes: al ser multimodal (texto + imagen/video), puede analizarse capturas, diagramas o documentos escaneados combinados con instrucciones en texto.
- Investigacion en alineacion y entrenamiento: la model card documenta en detalle el metodo SFT-RLOO, las recompensas y los datos, lo que lo hace util como referencia para estudiar como suprimir bucles de razonamiento.

## Benchmarks y rendimiento

Datos publicados por el autor, bajo su propio protocolo de 100K tokens (suites completas). Se comparan el Coder390 en FP8 estatico y dinamico con el Qwen3.8-27B original en FP8:

| Benchmark | Qwen3.8-27B original (FP8) | EfficientThink base | sft-base-rloo | Coder390 (FP8 dinamico) | Coder390 (FP8 estatico) |
|---|---|---|---|---|---|
| GPQA (sobre 198) | 177 | 171 | 177 | 178 | 178 |
| MMLU (sobre 500) | 444 | 442 | 448 | 445 | 450 |
| LCB (sobre 100) | 83 | 89 | 90 | 90 | 90 |

Otros datos de rendimiento publicados:

| Metrica | Valor |
|---|---|
| Truncamientos a 94K en GPQA | 4 → 1 (FP8) |
| Truncamientos a 94K en LCB | 13 → 3 (FP8) |
| Throughput con DFlash2 | ~180 tok/s por peticion |
| Throughput con MTP | ~91 tok/s por peticion |
| Throughput sin especulacion | ~46 tok/s por peticion |
| Cuantizacion FP8 (estatica y dinamica) | declarada sin perdidas en GPQA y LCB |

No se han publicado comparaciones con otros modelos externos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no se publican cifras exactas. El repositorio completo pesa 698,6 GB (incluye todas las cuantizaciones y MTP). En BF16, un modelo de 27,3 mil millones de parametros requiere en torno a 55 GB solo de pesos; las versiones FP8 rondarian ~27 GB, las NVFP4/INT4 aproximadamente la mitad y las GGUF Q4/Q3/Q2 menos aun.
- GPU recomendadas: no disponible de forma explicita. Por tamano, BF16 exigiria A100/H100 de 80 GB (o multi-GPU); FP8 cabe en una A100/H100 o una RTX 5090 de 32 GB; NVFP4 e INT4/INT8 son viables en GPUs de gama alta de consumo (RTX 4090/5090) y GGUF Q4 en GPUs de 16-24 GB o en CPU con suficiente RAM.
- Consumer GPU: las variantes GGUF y NVFP4/INT4 deberian caber en GPUs de consumo con 16-24 GB de VRAM; BF16 no cabe en ninguna GPU de consumo habitual.
- Despliegue: SGLang (todas las variantes safetensors, sin parches), vLLM (FP8 probado, INT4 W4A16 soportado), llama.cpp y NInfer (GGUF con MTP integrado).
- Latencia y throughput: ~46 tok/s por peticion sin especulacion, ~91 tok/s con MTP y ~180 tok/s con DFlash2, segun datos del autor.

## Comparativa con modelos similares

Comparativa basada en los datos publicados por el autor (linaje del propio modelo). No se incluyen modelos externos porque no hay datos comparables en la informacion disponible:

| Modelo | Parametros | GPQA | MMLU | LCB | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B original (FP8) | ~27,3 mil millones | 177/198 | 444/500 | 83/100 | no disponible | Modelo base oficial; sufre truncamientos a 94K |
| EfficientThink base (SFT+SimPO) | ~27,3 mil millones | 171/198 | 442/500 | 89/100 | Apache 2.0 | Primera correccion de colas de razonamiento |
| Coder390 (este modelo) | 27.320.697.856 | 178/198 | 445-450/500 | 90/100 | Apache 2.0 | Multimodal, MTP y DFlash2 incluidos |

## Limitaciones y advertencias

- Etiquetado "uncensored": el post-entrenamiento del autor no anade salvaguardas de seguridad adicionales; requiere filtros propios para uso en produccion o exposicion publica.
- Idiomas limitados oficialmente a ingles y chino; el rendimiento en castellano no esta documentado.
- Los benchmarks (GPQA, MMLU, LCB) son auto-evaluados por el autor bajo su propio protocolo de 100K tokens, no verificados por terceros; los nombres del modelo hacen referencia a otros modelos como "profesores" de los datos, pero no hay validacion independiente de calidad.
- Riesgo de alucinacion: no disponible; no se publican evaluaciones de veracidad o alucinacion.
- El modelo hereda el objetivo de suprimir razonamiento improductivo; en problemas muy dificiles podria acortar razonamientos que en realidad eran necesarios, segun reconoce implicitamente el diseno de recompensas.
- Las dos opciones de decodificacion especulativa (MTP y DFlash2) son mutuamente excluyentes; hay que elegir una al desplegar.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque los nombres del modelo referencian marcas de terceros (Opus, GPT, Grok, DeepSeek), lo que no implica ninguna relacion con sus creadores.
- Datos de entrenamiento detallados (numero de tokens del pre-entrenamiento, composicion del dataset base) no disponibles; solo se documenta el post-entrenamiento del autor.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/kejizilu/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Modelo base (EfficientThink, autor nerkyor): https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- GGUF / GGUF-NInfer en HuggingFace: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- GGUF / GGUF-NInfer en ModelScope: https://modelscope.cn/models/Merkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- NVFP4-NInfer en HuggingFace: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-NVFP4-NInfer
- NVFP4-NInfer en ModelScope: https://modelscope.cn/models/Merkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-NVFP4-NInfer
- Qwen3.8-27B oficial (referenciado como base del linaje): https://huggingface.co/Qwen/Qwen3.8-27B
