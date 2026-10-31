# Hxtomi/nyqo

## Resumen

Nyqo n1 es un modelo de lenguaje compacto y de propósito general con 497 millones de parámetros, desarrollado por el usuario independiente Hxtomi a partir de LiquidAI/LFM2.5-350M. Su interés principal no está en competir con modelos de gran escala, sino en demostrar una técnica de ampliación eficiente: mediante *block expansion*, expande el modelo base de 16 a 24 capas y entrena únicamente las ocho capas nuevas, manteniendo congelados los pesos originales. El post-entrenamiento combina ajuste fino supervisado sobre respuestas verificadas con destilación de conocimiento desde el modelo base y un checkpoint anterior de Nyqo.

El proyecto es relevante como caso de estudio de entrenamiento con presupuesto mínimo: se realizó en una única NVIDIA RTX 3060 de 12 GB, con unos costes de alquiler de instancia en la nube de 19,23 dólares. Los resultados publicados indican mejoras respecto al modelo base en los subconjuntos evaluados de ARC-Easy y MBPP+, con un retroceso en IFEval. El corpus de entrenamiento es privado y el modelo está orientado a generación de texto conversacional en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida convolucion-atencion (LFM2), 24 capas |
| Parametros totales | 497.119.488 |
| Parametros activos | no disponible (no es MoE; 142.635.520 parametros entrenados) |
| Longitud de contexto | 2.048 tokens en el perfil de generacion evaluado; IFEval uso una ventana de 4.096 tokens (el maximo soportado no esta claramente documentado) |
| Tipos de cuantizacion | no disponible (solo pesos en BF16) |
| Idiomas soportados | Ingles |
| Licencia | lfm1.0 (licencia "other", heredada de LFM2.5) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Nyqo n1 parte de la arquitectura hibrida convolucion-atencion de LiquidAI (familia LFM2), que combina capas convolucionales con capas de atencion para reducir coste computacional en secuencias largas. La innovacion central del proyecto es el *block expansion*: el modelo base de 16 capas se amplia a 24 capas y solo se entrenan las ocho capas anadidas, con los pesos originales congelados. Esto reduce drasticamente el numero de parametros entrenados (142,6 millones de 497,1 millones totales) y, con ello, los requisitos de memoria y computo.

El post-entrenamiento combina ajuste fino supervisado (SFT) sobre respuestas verificadas con destilacion de conocimiento desde el modelo base y desde un checkpoint anterior de Nyqo. Las respuestas corregidas y las referencias externas reciben unicamente perdida supervisada. El checkpoint seleccionado vio 800 ejemplos de un conjunto fijo de 1.600. El corpus de entrenamiento es privado, por lo que no se puede auditar su composicion. El entrenamiento se realizo en una NVIDIA RTX 3060 de 12 GB con un coste de nube declarado de 19,23 dolares.

## Capacidades

- Generacion de texto conversacional en ingles mediante plantilla de chat nativa
- Razonamiento general y respuestas explicativas (ejemplo oficial: explicar descenso de gradiente en terminos sencillos)
- Generacion de codigo Python basica, con mejora notable en cumplimiento de formato respecto al modelo base (97 de 100 respuestas validas en MBPP+ frente a 45 del original)
- Seguimiento de instrucciones, aunque con rendimiento inferior al modelo base en IFEval
- No hay soporte documentado de vision, audio ni multimodalidad
- No hay soporte documentado de tool calling, function calling ni agentes
- Capacidades multilingues: no disponibles; entrenamiento y evaluacion limitados al ingles

## Casos de uso

- Chatbot conversacional ligero en ingles: con 497M de parametros, puede servir como asistente basico en entornos con recursos muy limitados, aunque su ventana corta limita conversaciones largas
- Experimentacion con block expansion y destilacion: el repositorio de GitHub documenta el metodo completo, lo que lo hace util como referencia reproducible para investigadores que quieran ampliar modelos pequeños con presupuesto minimo
- Generacion de codigo Python simple: la mejora en MBPP+ (97/100 respuestas con formato valido) lo hace viable para autocompletado basico o generacion de funciones cortas
- Prototipado en hardware de consumo: cabe en una GPU de 12 GB o incluso en CPU, ideal para pruebas locales sin infraestructura en la nube
- Eduacion y demostraciones tecnicas: su tamano permite ejecutarlo en portatiles para talleres o docencia sobre LLMs
- Base para futuros fine-tunings: al congelarse los pesos originales, el modelo puede servir como punto de partida para adaptaciones adicionales de bajo coste

## Benchmarks y rendimiento

Los datos disponibles corresponden a subconjuntos fijos de benchmarks, no a resultados completos de leaderboard. La comparativa adicional la reporta el autor como referencia descriptiva, sin checkpoint IDs ni registros de inferencia por modelo.

| Benchmark | Nyqo n1 | LFM2.5-350M (base) | Notas |
|---|---|---|---|
| ARC-Easy (594 tareas) | mejora sobre el base | referencia | Likelihood normalizada; IC 95% pareado por encima de cero |
| IFEval (210 tareas) | inferior al base | referencia | Strict prompt-level; el IC pareado incluye el cero |
| MBPP+ (100 tareas) | mejora sobre el base | referencia | Base + tests adicionales con respuesta greedy; formato valido 97/100 vs 45/100 |
| Eval interno (204 tareas) | 56/204 | 45/204 | +24,44% relativo; +5,39 puntos porcentuales |

No se han publicado valores numericos absolutos de las puntuaciones de ARC-Easy, IFEval y MBPP+ en la informacion disponible; los detalles completos estan en el registro de evaluacion del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 1,3 GB en BF16 (tamano del repo); cabe comodamente en GPUs de 8 GB e incluso menos
- GPU de entrenamiento usada: NVIDIA RTX 3060 de 12 GB; para inferencia, cualquier GPU con soporte BF16 y CUDA
- Consumer GPUs compatibles: RTX 3060, RTX 4060, RTX 4070 y superiores; tambien ejecutable en CPU dada su escala
- Despliegue: libreria Transformers (PyTorch 2.11.0, Transformers 5.8.1 en el entorno registrado, con dependencias fijadas en GitHub); no hay menciones a vLLM, llama.cpp, Ollama ni TGI
- Latencia y throughput: no disponible
- Ejemplo oficial usa decodificacion greedy con SDPA y reserva de 768 tokens nuevos dentro de un presupuesto de 2.048

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Comentario |
|---|---|---|---|---|---|
| Nyqo n1 | 497M (142,6M entrenados) | Hibrida convolucion-atencion, 24 capas | ~2.048-4.096 tokens | lfm1.0 | Fine-tune por block expansion de LFM2.5-350M |
| LiquidAI/LFM2.5-350M | ~350M | Hibrida convolucion-atencion, 16 capas | no disponible | LFM open | Modelo base; mejor en IFEval, peor en ARC-Easy y MBPP+ (subconjuntos) |
| Qwen 4B (referencia del autor) | ~4B | no disponible | no disponible | no disponible | Incluido solo como referencia de modelo mayor; sin evidencia de checkpoint ni revision |

No hay alternativas adicionales comparables documentadas en la informacion disponible.

## Limitaciones y advertencias

- Restringido al ingles; no apto para casos de uso en espanol ni multilingues
- Ventana de contexto corta (el perfil evaluado es de 2.048 tokens), insuficiente para documentos largos o conversaciones extensas
- El corpus de entrenamiento es privado y no auditable; no se puede verificar la composicion de datos ni posibles sesgos
- Rendimiento inferior al modelo base en seguimiento de instrucciones (IFEval), con diferencia estadisticamente no significativa
- La mejora en MBPP+ podria deberse en parte al cumplimiento de formato (45 a 97 de 100), contribucion no aislada por el autor
- Los registros brutos del eval interno no se recuperaron en las copias de seguridad, por lo que el total de 56/204 no puede recalificarse de forma independiente
- Las puntuaciones de los modelos comparativos son referencias descriptivas del autor, sin checkpoint IDs ni registros de inferencia verificables
- El ejemplo de codigo CUDA no ha sido validado en un entorno GPU limpio segun el propio autor
- Licencia lfm1.0 ("other"): conviene revisar las condiciones de uso comercial en el archivo LICENSE antes de desplegar en produccion
- Riesgo de alucinacion: no disponible, pero propio de cualquier modelo de menos de 500M de parametros; no apto para tareas que exijan alta fiabilidad factual

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hxtomi/nyqo
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Repositorio GitHub: https://github.com/Hxtomi/nyqo
- Documento del metodo de entrenamiento: https://github.com/Hxtomi/nyqo/blob/main/docs/method.md
- Registro de evaluacion: https://github.com/Hxtomi/nyqo/blob/main/docs/results.md
- Manifest y hashes de checkpoints: https://github.com/Hxtomi/nyqo/blob/main/artifacts/nyqo-n1.json
- Dependencias fijadas: https://github.com/Hxtomi/nyqo/blob/main/requirements.txt
- Validacion de release: https://github.com/Hxtomi/nyqo/blob/main/evidence/release_validation.json
