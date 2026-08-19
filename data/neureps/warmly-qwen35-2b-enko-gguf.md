# neureps/warmly-qwen35-2b-enko-gguf

## Resumen

`warmly-qwen35-2b-enko-gguf` es el repositorio de producción de un modelo de lenguaje multimodal cuantizado, desarrollado por `neureps` para la aplicación de red social offline [Warmly (온기)](https://github.com/neureps/warmly). Se trata de la versión GGUF del modelo maestro `neureps/Qwen3.5-2B-enko`, un Qwen3.5-2B al que se le ha aplicado un pruning de vocabulario específico para coreano e inglés (reducción del 9% sin pérdida de calidad). El objetivo es ejecutar generación de comentarios en coreano y captions de imágenes en inglés directamente en un dispositivo Android mediante `llama.cpp` y un servidor `llama-server` embebido.

El modelo resuelve el problema de desplegar un sistema de IA conversacional con visión en entornos con recursos limitados (móviles), combinando varias técnicas de optimización: pruning de vocabulario, cuantización con `imatrix` de dominio calibrado con datos reales de la aplicación, y una destilación de naturalidad coreana (versión `distill-v1`) que usa como profesor un Kanana-1.5-8B afinado con QLoRA. La arquitectura es un transformer multimodal (texto e imagen) con 1.676.674.880 parámetros en formato safetensors, aunque los pesos GGUF de producción pesan entre 745 MB y 1,1 GB según la cuantización. La licencia es Apache-2.0.

El repositorio incluye un barrido completo de cuantizaciones con mediciones de perplejidad (PPL) heldout, lo que lo convierte en una referencia práctica sobre los límites reales de compresión para modelos de 2B en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-2B) con proyector de vision (mmproj) |
| Parametros totales | 1.676.674.880 (1,68B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 (configuracion de despliegue; contexto nativo no especificado) |
| Tipos de cuantizacion | IQ4_XS (produccion), Q4_K_M, Q3_K_M, IQ3_M, IQ3_XXS, Q8_0, Q5_0 (proyector), q4_0, f16 |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.5-2B al que se le ha aplicado un pruning de vocabulario EN/KO, reduciendo el tamaño del vocabulario un 9% sin perdida medible de calidad (harness 20/20). Sobre ese maestro, `neureps` ha cuantizado los pesos con `llama.cpp` utilizando `imatrix` (importance matrix) calibrado con dos conjuntos de datos: uno de dominio (`calib.txt`, 365 KB) compuesto por prompts de persona y datos de entrenamiento de la app (captions en ingles y comentarios en coreano), y otro general (`calib-general.txt`, 2 MB) con muestras de wikis KO/EN y comentarios sentimentales.

Existe una variante `distill-v1` que fusiona un adaptador QLoRA entrenado con un profesor Kanana-1.5-8B para mejorar la naturalidad del coreano. Segun las mediciones del autor, esta destilacion reduce los errores de naturalidad de ~18/60 a ~6/60, elimina palabras rotas y alucinaciones, y aumenta la concrecion de 2.5 a 3.5+. El proyector de vision (mmproj) se cuantiza por separado; en produccion se usa una version `q5_0` de 228 MB que, segun el autor, es indistinguible de la `q8_0` en captions greedy.

## Capacidades

- Generacion de texto en coreano e ingles, especialmente orientada a comentarios de redes sociales y respuestas conversacionales.
- Comprension de imagenes (image-text-to-text): genera captions en ingles a partir de fotografias mediante el proyector de vision.
- Conversacion multi-turno con soporte de chat (etiqueta `conversational`).
- Ejecucion en dispositivo movil: disenado para integrarse en una app Android con `llama-server` embebido.
- Modo de pensamiento (thinking) disponible, pero debe desactivarse con `enable_thinking:false` para evitar salidas no deseadas en produccion.
- Optimizacion especifica para el dominio SNS: calibracion con datos reales de comentarios coreanos y captions en ingles.

## Casos de uso

- Generacion de comentarios en coreano para publicaciones de una red social offline: el modelo esta calibrado con datos reales de la app Warmly, por lo que produce respuestas naturales y contextualizadas sin necesidad de conexion a internet.
- Captioning de imagenes en ingles: los usuarios suben una foto y el modelo genera una descripcion en ingles usando el proyector de vision (`llama-mtmd-cli` con `--mmproj`), adecuado para accesibilidad o para compartir en redes.
- Asistente conversacional privado en coreano/ingles: al ejecutarse localmente, garantiza privacidad total de las conversaciones, util para aplicaciones de salud mental o diarios personales.
- Chat offline en zonas sin cobertura: el modelo cabe en un dispositivo movil (975 MB el archivo de produccion) y no requiere servidores externos.
- Prototipado rapido de aplicaciones SNS con IA generativa: la combinacion de pruning + cuantizacion + imatrix de dominio demuestra un pipeline reproducible para adaptar modelos 2B a casos de uso especificos.
- Evaluacion de limites de cuantizacion en modelos pequenos: el repositorio documenta un barrido completo de variantes (Q4_K_M, IQ4_XS, Q3_K_M, IQ3_M, IQ3_XXS) con PPL heldout, util para decidir el punto de equilibrio entre tamano y calidad en despliegues embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona mediciones de perplejidad heldout y tasas de aprobacion de un harness interno, que se resumen a continuacion:

| Variante | Tamano | PPL heldout | Observaciones |
|---|---|---|---|
| base (IQ4_XS + imatrix dominio) | 975 MB | 10.91 | Produccion actual, harness 20/20 |
| distill-v1 (IQ4_XS + imatrix dominio) | 1022 MB | 11.85 | Gate superado, blind win rate ~70%, self-deprecation 0/4 |
| Q4_K_M plain | 1.1 GB | 10.94 | Errores de palabras coreanas, no recomendado |
| Q4_K_M + imatrix general | 1.1 GB | 10.70 | Mejor calidad a mismo tamano |
| IQ4_XS + imatrix general | 975 MB | 10.87 | Punto dulce tamano/calidad |
| Q3_K_M + imatrix general | 883 MB | 12.10 | +10% degradacion |
| Q4_K_M + imatrix dominio | 1.1 GB | 10.75 | Post-procesamiento 19/20 |
| IQ3_M + imatrix dominio | 845 MB | 11.82 | Usable pero degradado |
| IQ3_XXS + imatrix dominio | 745 MB | 13.33 | Colapso semantico, no apto |

El autor advierte que la tasa de aprobacion del post-procesamiento no detecta la degradacion por bajo bit; el discriminador real es la naturalidad (evaluacion subjetiva), que correlaciona fuertemente con la PPL.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de produccion pesa 975 MB (IQ4_XS), por lo que cabe en cualquier GPU con al menos 2 GB de VRAM, incluidas GPUs integradas modernas.
- GPU recomendadas: no requiere GPU de alta gama; cualquier GPU con soporte CUDA o Vulkan de los ultimos 5 anos es suficiente. En servidores, una NVIDIA T4 o RTX 3060 basta para multiples instancias.
- Compatibilidad con consumer GPU: si, es el caso de uso principal (Android con `llama-server` embebido). En escritorio, una RTX 4060 o similar ejecuta el modelo con latencia de pocos milisegundos por token.
- Opciones de despliegue: `llama.cpp` (llama-server para texto, llama-mtmd-cli para vision), compatible con Ollama y otros frontends que usen GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano (~1B parametros activos), se espera una generacion en tiempo real en CPU moderna y muy rapida en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Observaciones |
|---|---|---|---|---|---|
| warmly-qwen35-2b-enko-gguf (este) | 1,68B | 4096 | IQ4_XS (produccion) | Apache-2.0 | Pruning EN/KO + imatrix de dominio + destilacion coreana |
| warmly-qwen35-08b-enko-gguf | 0,8B | no disponible | no disponible | Apache-2.0 | Version reducida del mismo autor para dispositivos con menos recursos |
| warmly-qwen35-2b-gguf (v1) | ~1,8B (sin pruning) | no disponible | no disponible | Apache-2.0 | Version anterior sin pruning, 1564 MB, usada como rollback |
| Qwen3.5-2B original (safetensors) | 2B aprox. | no especificado | no aplica | Apache-2.0 | Modelo base sin optimizaciones, requiere mas VRAM y no esta adaptado a coreano |

La comparativa se limita a las variantes del mismo autor porque no se dispone de datos de otros modelos 2B multimodales con los mismos criterios de evaluacion.

## Limitaciones y advertencias

- La cuantizacion de bajo bit (IQ3_XXS, 745 MB) produce colapso semantico: el modelo genera texto sin sentido aunque pase el post-procesamiento. No usar por debajo de IQ4_XS.
- El modo de pensamiento (`thinking`) debe desactivarse con `enable_thinking:false`; si se deja activo, la salida se degrada visiblemente.
- La version `distill-v1` presenta fuga de ingles en captions complejas, mitigada con post-procesamiento y regeneracion de respaldo.
- Solo soporta coreano e ingles; no es adecuado para otros idiomas.
- La longitud de contexto en produccion esta limitada a 4096 tokens; conversaciones muy largas pueden truncarse.
- No hay datos publicados sobre sesgos, alucinaciones fuera del dominio SNS, o comportamiento en entornos no relacionados con la app Warmly.
- El pruning de vocabulario puede causar errores de palabras coreanas si se usa sin `imatrix` de dominio (observado en la variante `Q4_K_M-plain`).
- La licencia Apache-2.0 permite uso comercial, pero el modelo esta optimizado para un caso de uso muy concreto (comentarios SNS en coreano); su rendimiento en otras tareas no esta validado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/neureps/warmly-qwen35-2b-enko-gguf
- Modelo maestro safetensors: https://huggingface.co/neureps/Qwen3.5-2B-enko
- App Warmly (GitHub): https://github.com/neureps/warmly
- Repositorio del adaptador distill: https://huggingface.co/neureps/warmly-qwen35-2b-enko-distill
- Dataset de destilacion: https://huggingface.co/datasets/neureps/warmly-distill-data
- Version anterior (rollback): https://huggingface.co/neureps/warmly-qwen35-2b-gguf
- Version 0.8B: https://huggingface.co/neureps/warmly-qwen35-08b-enko-gguf
