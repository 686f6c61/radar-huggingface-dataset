# Jongbin-kr/exaone-verireason-sft_accuracy_easy_6to7_ratio0.12_seed2026

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA entrenado mediante SFT (supervised fine-tuning) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct. Lo publica el usuario Jongbin-kr bajo el identificador exaone-verireason-sft_accuracy_easy_6to7_ratio0.12_seed2026, dentro de lo que parece una campaña de experimentos de ajuste fino orientados a razonamiento verificable y precisión numérica sobre dominios financieros. El entrenamiento se realizó sobre un subconjunto "answer-only" del dataset ConvFinQA, es decir, preguntas y respuestas conversacionales sobre tablas y textos financieros, sin cadenas de razonamiento intermedias.

El interés del artefacto es metodológico más que de producto: documenta una técnica de selección de datos llamada "accuracy-band-selection" (selección por banda de precisión), con un ratio declarado de 0,12, una semilla de selección 2026 y una semilla de entrenamiento 42. Incorpora además un manifiesto de selección con hash SHA256 y fija la revisión esperada del caché del modelo base, lo que facilita la reproducibilidad del experimento. El checkpoint elegido es el mejor en validación (checkpoint-164, eval_loss = 0,33641165494918823) y se publica en tres ramas equivalentes a las épocas 1, 2 y 3.

La relevancia práctica es limitada fuera del contexto de investigación: acumula 14 descargas y 0 likes, no declara licencia ni idiomas, y no aporta resultados de benchmarks. Debe tratarse como un adaptador experimental para auditar técnicas de selección de datos sobre EXAONE-3.5-7.8B, no como un artefacto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso (EXAONE-3.5-7.8B-Instruct); rango y alpha de LoRA no disponibles |
| Parametros totales | Modelo base: 7.800 millones (7,8B). El adaptador es un subconjunto de pesos; el repo ocupa 1,0 GB en safetensors |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible en este repositorio; heredada del modelo base EXAONE-3.5-7.8B-Instruct |
| Tipos de cuantizacion | No disponible en el repositorio. El adaptador se distribuye en safetensors con la precisión original; la cuantizacion seria aplicable tras fusionar con el modelo base (por ejemplo GPTQ, AWQ o GGUF) |
| Idiomas soportados | No disponible. El modelo base EXAONE 3.5 esta orientado a coreano e ingles |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA, no fusionados) |
| Modelo base | LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct |
| Revision esperada del modelo base | 553ea250b9a5317231459279d5847d6cf955b9aa |
| Libreria | peft |
| Checkpoint seleccionado | checkpoint-164 (eval_loss = 0,33641165494918823) |
| Ramas disponibles | epoch1-step82, epoch2-step164, epoch3-step246 (y main) |
| Semilla de entrenamiento | 42 |
| Condicion de seleccion de datos | accuracy_medium_high_6to7_selseed2026_ratio0.12 |
| Manifiesto de seleccion (SHA256) | 503e31e604ab3b79c3df18974ac1292d586cab9d36e0f85d278593c45113647f |
| Descargas / likes | 14 descargas / 0 likes |
| Fecha de creacion | 2026-10-06T01:50:10Z |
| Ultima actualizacion | 2026-10-06T01:52:27Z |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre EXAONE-3.5-7.8B-Instruct, un transformer decoder-only denso de 7.800 millones de parametros desarrollado por LG AI Research. Al tratarse de pesos PEFT en lugar de pesos fusionados, la inferencia requiere cargar primero el modelo base y superponer el adaptador. El valor de rango (r), alpha y los modulos objetivo del LoRA no se especifican en la model card. Tampoco se documenta si el adaptador afecta a todas las capas o solo a las proyecciones de atencion.

El entrenamiento consistio en un SFT sobre un subconjunto "answer-only" de ConvFinQA, un dataset de preguntas y respuestas conversacionales multi-turno sobre documentos financieros que exige razonamiento aritmetico sobre tablas y texto. Se empleo una seleccion de datos por banda de precision con ratio 0,12 (es decir, se retuvo aproximadamente el 12 por ciento de los ejemplos candidatos) y semilla de seleccion 2026, con semilla de entrenamiento 42. La model card registra la perdida de validacion del mejor checkpoint (0,33641165494918823) y publica los checkpoints intermedios de cada epoca, lo que permite estudiar la evolucion del ajuste. No se indica el numero total de pasos, el tamano del conjunto de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto y respuesta a preguntas en formato conversacional, heredadas del modelo base EXAONE-3.5-7.8B-Instruct.
- Razonamiento numerico y aritmetico sobre datos financieros tabulares y textuales, al haber sido ajustado sobre ConvFinQA.
- Respuesta en estilo "answer-only": el adaptador esta entrenado para emitir la respuesta final sin cadena de razonamiento explicita, lo que puede reducir la verbosidad pero tambien la trazabilidad del calculo.
- Soporte de conversaciones multi-turno, dado que ConvFinQA es un dataset conversacional; la profundidad efectiva depende de la ventana de contexto del modelo base.
- Capacidades multilingues: no disponibles para este adaptador; las del modelo base no se declaran en este repositorio.
- Tool calling, function calling y uso como agente: no documentados para este adaptador.
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Auditoria de tecnicas de seleccion de datos: el repositorio permite reproducir un experimento de accuracy-band-selection con ratio 0,12 sobre ConvFinQA, comparando las tres ramas de epoca para medir el efecto del filtrado sobre la perdida de validacion. Es el uso principal y mas realista del artefacto.
- Analisis de sensibilidad al numero de epocas: las ramas epoch1-step82, epoch2-step164 y epoch3-step246 permiten estudiar sobreajuste y degradacion comparando eval_loss entre checkpoints con un protocolo fijo.
- Punto de partida para ajuste financiero: un equipo que quiera construir un asistente de Q&A sobre informes trimestrales puede usar este adaptador como inicializacion y continuar el entrenamiento con su propio corpus contable.
- Extraccion de respuestas numericas de tablas financieras: el ajuste "answer-only" favorece salidas cortas y directas, adecuadas para pipelines que despues parsean la cifra con expresiones regulares.
- Investigacion sobre verificabilidad: al combinarse con tecnicas de verificacion externa (veri-reason), el adaptador sirve para evaluar si respuestas finales sin razonamiento explicito son mas o menos faciles de validar automaticamente.
- Evaluacion comparativa de adaptadores LoRA: sirve como linea base de bajo coste (14 descargas, 1,0 GB) para comparar contra adaptadores entrenados con seleccion aleatoria o con ratios distintos.
- No se recomienda su uso directo en atencion al cliente, generacion de codigo o agentes en produccion, ya que no hay evidencia publicada de rendimiento en esas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion del checkpoint seleccionado:

| Metrica | Valor |
|---|---|
| eval_loss (checkpoint-164) | 0,33641165494918823 |
| MMLU, HumanEval, GSM8K, ConvFinQA accuracy | no disponible |

## Requisitos de hardware

- Inferencia con el adaptador: requiere cargar el modelo base completo de 7,8B parametros mas el adaptador (1,0 GB adicionales en disco).
- VRAM en bf16/fp16: aproximadamente 15,6 GB solo para pesos, mas cache KV; conviene reservar 18-24 GB segun la longitud de contexto y el tamano de lote.
- VRAM en cuantizacion de 4 bits: del orden de 5-7 GB para pesos, mas cache KV; el adaptador debe fusionarse antes de cuantizar.
- GPU recomendadas: A100 40 GB o H100 para lotes grandes y contexto largo; RTX 4090 (24 GB) suficiente para bf16 con lotes pequenos; RTX 3090 (24 GB) y A10G (24 GB) viables con contexto moderado; GPUs de 16 GB solo con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 o equivalentes con 24 GB en bf16; en tarjetas de 12-16 GB es necesario cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers + peft para cargar el adaptador sin fusionar; vLLM o TGI tras fusionar los pesos con el modelo base; llama.cpp u Ollama requieren convertir los pesos fusionados a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Este adaptador (exaone-verireason-sft) | 7,8B (base) + LoRA | No disponible | Adaptador PEFT sobre EXAONE-3.5-7.8B-Instruct | No disponible | Solo eval_loss = 0,3364 |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7,8B | No disponible en esta busqueda | Modelo completo instruct | No disponible en esta busqueda | No disponible en esta busqueda |
| Otros adaptadores LoRA sobre modelos de 7-8B | No disponible | No disponible | Adaptador PEFT | No disponible | No disponible |

No se dispone de datos comparativos de benchmarks entre este adaptador y alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo fusionado: no puede ejecutarse de forma autonoma y hereda todas las limitaciones del modelo base.
- Inconsistencia entre el nombre del repositorio ("accuracy_easy_6to7") y la condicion de seleccion declarada en la model card ("accuracy_medium_high_6to7"); conviene verificar cual corresponde antes de reproducir el experimento.
- Licencia no declarada: no hay base juridica explicita para uso comercial. Ademas, el uso comercial queda condicionado por la licencia del modelo base EXAONE-3.5-7.8B-Instruct, que no se detalla en este repositorio.
- Idiomas no declarados: se desconoce el comportamiento fuera del coreano y el ingles del modelo base.
- Riesgo de alucinacion en cifras: al entrenarse en modo "answer-only" sobre datos financieros, el modelo puede emitir cifras plausibles sin respaldo en el contexto; no debe usarse para decisiones financieras sin verificacion externa.
- Sesgos: no documentados, pero el ajuste sobre un subconjunto filtrado por banda de precision (12 por ciento de los candidatos) puede introducir un sesgo de dificultad, favoreciendo preguntas de un rango concreto.
- Trazabilidad: la model card advierte de que el cargador de entrenamiento uso el ID del Hub sin fijar revision explicita, por lo que la revision real del modelo base podria diferir de la declarada (553ea250b9a5317231459279d5847d6cf955b9aa).
- Madurez: 14 descargas, 0 likes y una ventana de creacion/actualizacion de aproximadamente dos minutos sugieren una publicacion automatizada sin validacion comunitaria.
- Sin benchmarks: no hay evidencia publica de rendimiento en ConvFinQA u otras tareas, por lo que no se puede afirmar mejora alguna frente al modelo base.
- No apto para produccion sin evaluacion previa: no se documentan pruebas de robustez, seguridad ni comportamiento frente a entradas adversarias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jongbin-kr/exaone-verireason-sft_accuracy_easy_6to7_ratio0.12_seed2026
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Dataset citado en el entrenamiento (ConvFinQA): no se incluye enlace en la model card
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
