# chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX-8bit

## Resumen

Jev-Style-0.8B-Decision-v3-MLX-8bit es la version cuantizada a 8 bits para Apple Silicon del modelo de decision Jev-Style-0.8B-Decision-v3, desarrollado por chaoliangUNSW. No es un modelo generativo: recibe un estado (contexto), una pregunta tipada y una lista de opciones, y en una unica pasada hacia delante devuelve una distribucion de probabilidad calibrada sobre todas las opciones, sin generar texto libre y sin limite de letras por opcion. Con 752.393.024 parametros (0.8B comerciales) y pesos de 0,80 GB, esta pensado para ejecutarse en local sobre chips de Apple mediante MLX.

El modelo se apoya en Qwen/Qwen3.5-0.8B (licencia Apache-2.0) y forma parte de la serie Jev-Style, inspirada en el modelo Jev de TypeSafe AI ("System One"): decisiones tipadas en lugar de chat. Admite entradas de hasta 25.600 tokens, con la pregunta, las opciones y el mecanismo de lectura (readout) limitados a 2.048 tokens, y cubre 19 idiomas declarados.

Su relevancia actual es doble: por un lado, ofrece una via de despliegue local en Apple Silicon a la mitad de tamano que la build bf16 (0,80 GB frente a 1,50 GB) manteniendo paridad de decision; por otro, el autor reporta mejoras de hasta +30,3 puntos sobre el mejor checkpoint oficial de Laya en cinco tareas de decision y un 79,2% en 2.000 decisiones tipadas, superando a los modelos de 2B de la propia serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivada de Qwen/Qwen3.5-0.8B (según model card); detalles completos no disponibles |
| Parametros totales | 752.393.024 (0,75B; comercializado como 0,8B) |
| Longitud de contexto | Hasta 25.600 tokens de entrada; pregunta, opciones y readout hasta 2.048 tokens |
| Tipos de cuantizacion | 8-bit affine con group size 64 (unica variante incluida en este repositorio); otras cuantizaciones del mismo checkpoint, no disponibles |
| Idiomas soportados | 19: en, zh, ar, bg, de, el, es, fr, hi, ja, ko, pt, ru, sw, ta, th, tr, ur, vi |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), un unico `model.safetensors` de 0,80 GB, mas `config.json`, tokenizer, `readout_config.json` y `jev_style_decision_mlx.py` |
| Libreria / runtime | MLX (convertido con mlx 0.32.2 y mlx-lm 0.31.3) |
| Pipeline declarado | text-classification |
| Modelo base | chaoliangUNSW/Jev-Style-0.8B-Decision-v3 (relacion: quantized) |

## Arquitectura y entrenamiento

La model card indica que esta build es la conversion a MLX 8-bit del checkpoint Jev-Style-0.8B-Decision-v3, construido sobre Qwen/Qwen3.5-0.8B. El modelo no genera tokens de texto: expone un mecanismo de lectura que puntua simultaneamente todas las opciones de todas las preguntas de una entrada en una sola pasada, devolviendo probabilidades calibradas. La calibracion se materializa en un fichero `readout_config.json` con temperaturas ajustadas (fitted temperatures), y el runtime emplea las activaciones nativas del checkpoint, que el autor describe como la configuracion validada para esta build.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; la model card remite a la seccion "Training data and licences" de la tarjeta del modelo principal. Si se explicita que el modelo fue entrenado como clasificador de decision calibrado (no como generador), que la decodificacion es de una sola pasada con scoring paralelo de opciones y que no existe tope de opciones ni de letras. La model card tambien advierte que parte de los datos de entrenamiento tiene terminos restrictivos o poco claros y que algunas filas de entrenamiento son salidas de modelos de OpenAI y Anthropic.

## Capacidades

- Decision tipada calibrada: dada una entrada (estado + pregunta + opciones), devuelve `answer` y `probabilities` sobre el conjunto de opciones.
- Scoring multiple en una sola pasada: puntua todas las opciones de todas las preguntas, sin limite de numero de opciones.
- Dos modos de lectura: `qtype="noul"` y `qtype="score"` segun el tipo de consulta.
- Contexto largo: entradas de hasta 25.600 tokens; si se supera el presupuesto, el runtime lanza error y no trunca.
- Multilingue: 19 idiomas declarados (incluido espanol).
- Procesamiento por lotes: modo `--jsonl` para lotes y `--verify` para verificacion.
- API de runtime: `decide` y `decide_many`.
- No genera texto libre.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo de la propia model card usa el modelo para decidir si un ticket sobre un cobro duplicado va a "billing", "technical" o "sales", aprovechando que el scoring paralelo devuelve probabilidad para cada cola en una sola pasada.
- Clasificacion de sentimiento: con `--category general_sentiment` y opciones como "negative"/"positive" sobre un fragmento de texto, sin generacion de texto ni postprocesado de cadenas.
- Moderacion de contenido y toxicidad: el autor reporta +29,5 puntos de macro-F1 en toxicidad frente al mejor checkpoint de Laya, lo que lo hace util para filtros previos a publicacion en plataformas.
- Deteccion de jailbreak: +7,2 puntos de balanced accuracy en la tarea de jailbreak equilibrado, aplicable como capa de defensa en un gateway de LLM antes de reenviar una peticion.
- Enrutado de modelos (model routing): +30,3 puntos en la tarea de enrutado, util para decidir a que LLM (o a que tamano) se envia cada consulta en un sistema multi-modelo y reducir coste.
- Clasificacion de intenciones en banca: +19,0 puntos en Banking77 (77 clases), aplicable a asistentes financieros que necesitan resolver la intencion antes de responder.
- Etiquetado multilingue a gran escala: +29,4 puntos en 37 locales retenidos de MASSIVE, util para anotacion de corpus en idiomas con pocos recursos presentes en la lista (sw, ta, ur, vi, th).
- Analisis de documentos largos: al admitir hasta 25.600 tokens y mantener paridad en prompts de 16K y 25,6K, permite etiquetar contratos, informes o expedientes sin trocear el documento.
- Inferencia local en Apple Silicon: 0,80 GB de pesos permiten ejecutar decisiones calibradas en un Mac sin GPU dedicada, por ejemplo para preetiquetado offline de datos sensibles que no deben salir del equipo.

## Benchmarks y rendimiento

Los resultados publicados en la model card son mayoritariamente diferencias relativas frente al mejor checkpoint oficial de Laya reevaluado por el autor sobre filas identicas. Solo se publica un valor absoluto (79,2% en decisiones tipadas).

| Tarea | Metrica | Diferencia reportada |
|---|---|---|
| Enrutado de modelos | no disponible (solo delta) | +30,3 puntos frente al mejor checkpoint oficial de Laya |
| Toxicidad | macro-F1 | +29,5 puntos frente al mejor checkpoint oficial de Laya |
| 37 locales retenidos de MASSIVE | no disponible (solo delta) | +29,4 puntos frente al mejor checkpoint oficial de Laya |
| Banking77 (77 clases) | no disponible (solo delta) | +19,0 puntos frente al mejor checkpoint oficial de Laya |
| Jailbreak | balanced accuracy | +7,2 puntos frente al mejor checkpoint oficial de Laya |
| Decisiones tipadas (2.000) | exactitud | 79,2% (+6,4 sobre Jev; +5,7 sobre el 2B v2; Brier 3,2x menor que Jev) |

Notas de protocolo recogidas en la model card: los numeros de Laya corresponden a checkpoints oficiales reevaluados por el autor sobre las mismas filas y con sus temperaturas y presupuestos de tokens originales; se muestra el mejor de los tres checkpoints por tarea y todos los intervalos de confianza pareados al 95% excluyen el cero. En decisiones tipadas, v3 y Laya se evaluan in-domain y Jev zero-shot con el numero de su dataset card. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos: no disponibles.

Paridad de cuantizacion: misma decision que la referencia PyTorch FP32 en 240 de 240 filas de paridad y en 6 de 6 prompts extra de aproximadamente 16K y 25,6K tokens. El fixture de paridad son 240 filas mixtas del pool de entrenamiento (22 categorias, ingles y chino); segun el autor, estas filas miden acuerdo entre formatos, no exactitud.

## Requisitos de hardware

- Pesos: 0,80 GB en formato MLX 8-bit (frente a 1,50 GB de la build bf16).
- Plataforma: MLX exige Apple Silicon (chips M-series). No hay soporte CUDA en este repositorio.
- Memoria unificada: el autor no publica cifras de consumo total. Como orientacion, los pesos ocupan 0,80 GB y el runtime limita por defecto la cache de MLX a 2 GiB (`--cache-limit-gib`), a lo que se suma el KV cache del contexto usado; con 25.600 tokens de entrada la huella puede crecer por encima de esos 2 GiB. Estimacion orientativa, no confirmada por el autor.
- GPU recomendadas: no aplica (no usa GPU discreta). Cualquier Mac con Apple Silicon y memoria unificada suficiente deberia poder ejecutarlo; el autor no especifica minimos.
- Cabe en hardware de consumo: si, en Macs con Apple Silicon, al ser un modelo de 0,75B en 8 bits.
- Opciones de despliegue: MLX / mlx-lm con el script `jev_style_decision_mlx.py` incluido en el repositorio (API `decide`, `decide_many`, modos `--jsonl` y `--verify`). Para CUDA, llama.cpp, Ollama, vLLM o TGI habria que usar otras builds de la serie (por ejemplo la GGUF), no esta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Resultado comparado |
|---|---|---|---|---|---|
| Jev-Style-0.8B-Decision-v3-MLX-8bit (este) | 752.393.024 | 25.600 tokens de entrada; 2.048 en pregunta/opciones/readout | MLX 8-bit, 0,80 GB | Apache-2.0 | Referencia de la comparativa |
| Jev-Style-0.8B-Decision-v3 (checkpoint sin cuantizar del que deriva) | 752.393.024 | Igual (no detallado en la informacion disponible) | Segun model card principal, no disponible | Apache-2.0 | Mismo modelo en precision completa; la build 8-bit mantiene paridad en 240/240 filas |
| Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16 | 2B (aproximado, segun nombre) | no disponible | MLX bf16, 1,50 GB | no disponible (se asume Apache-2.0 por la serie) | v3 0.8B le supera en +5,7 puntos en decisiones tipadas segun el autor |
| Jev (TypeSafe AI) | no disponible | no disponible | API alojada | Propietaria | v3 0.8B reporta +6,4 puntos y Brier 3,2x menor en decisiones tipadas; Jev cobra 0,042 USD por 1M tokens de entrada |
| Checkpoints oficiales de Laya | no disponible | no disponible | no disponible | no disponible | El mejor de los tres es superado por v3 en +30,3 (routing), +29,5 (toxicidad), +29,4 (MASSIVE), +19,0 (Banking77) y +7,2 (jailbreak) |

## Limitaciones y advertencias

- No es un modelo generativo: no escribe texto, no responde preguntas abiertas y no sirve como chatbot; solo devuelve distribuciones sobre opciones predefinidas.
- Sesgos heredados: al derivar de Qwen/Qwen3.5-0.8B y de un pool de entrenamiento no documentado en detalle, puede reproducir sesgos presentes en los datos originales, incluidas filas generadas por modelos de OpenAI y Anthropic.
- Licencias de datos: aunque el modelo se publica bajo Apache-2.0, la propia model card advierte que parte de los datos de entrenamiento tiene terminos restrictivos o poco claros. Conviene revisar la seccion "Training data and licences" de la tarjeta principal antes de un uso comercial.
- Riesgo de alucinacion: al no generar texto, el riesgo clasico no aplica, pero si existe riesgo de calibracion incorrecta fuera de dominio: los 79,2% y los deltas frente a Laya corresponden a evaluaciones in-domain del autor, y los numeros de Jev son zero-shot, lo que hace las comparaciones entre modelos no homogeneas.
- Cobertura de idiomas: se declaran 19 idiomas, pero no se publican metricas por idioma ni garantias de calidad en los idiomas de menor presencia (sw, ta, ur, vi, th).
- Limites de contexto estrictos: superar los 25.600 tokens de entrada (o los 2.048 en pregunta, opciones y readout) provoca un error; no hay truncado silencioso.
- Validacion limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion es el 24 de septiembre de 2026, por lo que no existe validacion independiente de los resultados publicados.
- Dependencia de plataforma: MLX solo funciona en Apple Silicon; no hay soporte oficial para CUDA ni para runtimes de servidor como vLLM o TGI en este repositorio.
- Paridad no es exactitud: la prueba de 240 filas mas 6 prompts largos verifica acuerdo entre formatos de cuantizacion frente a la referencia FP32, no la calidad del modelo.
- Proyecto personal: el autor declara no estar afiliado a TypeSafe AI, Jev, los autores de Laya ni al equipo de Qwen.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX-8bit
- Modelo base (tarjeta principal, con protocolos y datos de entrenamiento): https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Serie v1, 2B (GGUF): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Serie v2, 2B (MLX bf16): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Modelo base subyacente: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Web del proyecto: https://jevstyle.com
- Jev de TypeSafe AI (referencia del paradigma System One): https://jevmodel.org/
- Repositorio de prototipo Jev-style (qwen-rlcd): https://github.com/shamazharikh/qwen-rlcd
- Repositorio de decisiones restringidas para MLX (jevmlx): https://github.com/bnsd55/jevmlx/tree/main
