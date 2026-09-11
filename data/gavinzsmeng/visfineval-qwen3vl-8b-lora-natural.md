# gavinzsmeng/visfineval-qwen3vl-8b-lora-natural

## Resumen

VisFinEval LoRA — Natural distribution es un adaptador LoRA para el modelo vision-language Qwen3-VL-8B-Instruct, publicado por el usuario gavinzsmeng. No es un modelo independiente: se trata de un conjunto de pesos PEFT (formato safetensors, ~0,2 GB en el repositorio) que debe combinarse con el modelo base Qwen/Qwen3-VL-8B-Instruct para funcionar. Su proposito es acotado y experimental: medir si un ajuste fino supervisado estandar corrige el colapso hacia la clase mayoritaria que el modelo base muestra en el benchmark multimodal financiero VisFinEval (EMNLP 2025), escrito integramente en chino.

El problema que aborda es concreto y medible. Sobre preguntas de verdadero/falso, Qwen3-VL-8B-Instruct alcanza un recall del 39,7% en la respuesta minoritaria ("No"), por debajo del azar (50%). Este adaptador, entrenado con 13.465 preguntas procedentes de 2.322 informes de brokers chinos y con particion a nivel de informe de origen para evitar fuga de datos, eleva ese recall al 69,0% y la precision bruta en opcion multiple del 73,70% al 84,13% sobre 2.889 preguntas de test reservadas. La comparacion pareada por muestra (McNemar, p < 0,001) muestra 430 aciertos corregidos frente a 136 degradados.

Su relevancia actual es metodologica mas que de producto: separa la condicion de "distribucion natural" (sesgo de etiqueta original conservado, con un 58,5% de respuestas correctas en la opcion "A") de una variante hermana con remuestreo de clases, y demuestra con intervalos de confianza de Wilson que la mejora se concentra casi integramente en la clase minoritaria. La licencia es Apache-2.0 y el idioma soportado es unicamente el chino. La fecha de creacion del repositorio figura como 2026-09-11 en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-VL-8B-Instruct, modelo vision-language con codificador visual, alineador y decodificador tipo transformer |
| Parametros totales | 8,81 mil millones en el modelo base; el adaptador anade 43,6 millones de parametros entrenables (0,50% del total) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-VL-8B-Instruct, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio contiene unicamente el adaptador LoRA en safetensors) |
| Idiomas soportados | chino (zh) exclusivamente; todos los datos de entrenamiento son en chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT, libreria peft) |
| Configuracion LoRA | r=16, alpha=32, target_modules=all-linear |
| Modulos congelados | codificador de vision y alineador (freeze_vit=true) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Dataset de entrenamiento | SUFE-AIFLM-Lab/VisFinEval (13.465 preguntas / 2.322 informes) |
| Framework de entrenamiento | ms-swift 4.6.0.dev0, DDP, precision bfloat16 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un modelo multimodal que procesa imagenes y texto. Segun la informacion facilitada, durante el ajuste se congelaron tanto el codificador de vision como el alineador (freeze_vit=true), de modo que unicamente se entrenaron las matrices LoRA insertadas en todas las capas lineales del modelo (target_modules=all-linear). Con r=16 y alpha=32, el resultado son 43,6 millones de parametros entrenables, un 0,50% de los 8,81 mil millones del modelo base. La decodificacion empleada en la evaluacion es greedy (do_sample=False) y la generacion se limita a 8 tokens nuevos, dado que la tarea consiste en emitir una letra o un "si/no".

Los datos proceden del benchmark VisFinEval, compuesto por preguntas sobre informes de research de brokers chinos. Como VisFinEval no tiene particion oficial de entrenamiento, el autor construyo una division 70/15/15 a nivel de informe de origen, lo que garantiza cero solapamiento entre train y test. La condicion "natural" conserva el sesgo de etiqueta original: el 58,5% de las respuestas de opcion multiple son "A", sin remuestreo ni reponderacion. El entrenamiento consta de 2 epocas y 422 pasos, con batch efectivo de 1 x 16 de acumulacion de gradiente en 4 GPUs, tasa de aprendizaje 1e-4 con scheduler coseno y 5% de warmup, en bfloat16. En total, aproximadamente 1 hora y 36 minutos sobre 4x RTX 4090 con DDP. La innovacion destacable no esta en la arquitectura sino en la evaluacion: comparacion pareada por muestra con identificador global identico, test de McNemar e intervalos de confianza de Wilson para el recall de clase minoritaria.

## Capacidades

- Respuesta a preguntas de opcion multiple (A/B/C/D) sobre imagenes: graficos, tablas y figuras extraidas de informes financieros, con salida restringida a la letra de la opcion.
- Respuesta a preguntas de verdadero/falso en chino, con salida restringida a "si" o "no".
- Comprension de documentos financieros multimodales en chino: el modelo base aporta vision y el adaptador especializa el formato de respuesta del benchmark.
- Mayor sensibilidad a la clase minoritaria: recall del 69,0% en la respuesta "No" frente al 39,7% del modelo base (mejora de 29,3 puntos porcentuales).
- Capacidades heredadas del modelo base Qwen3-VL-8B-Instruct (generacion de texto, razonamiento y vision generica), si bien el adaptador no fue entrenado para preservarlas ni se midieron.
- No hay soporte documentado de tool calling, function calling ni uso agentico especifico de este adaptador.
- No hay capacidades de audio, video ni modo de razonamiento explicito documentadas.
- Multilingue: no. El adaptador esta entrenado y evaluado unicamente en chino.

## Casos de uso

- Evaluacion de modelos vision-language en finanzas: utilizar el adaptador como condicion de referencia ("SFT estandar") frente al modelo base al medir exactitud en VisFinEval, con la misma plantilla de prompt para que los numeros sean comparables.
- Auditoria de fiabilidad de clasificadores: reproducir el analisis pareado con test de McNemar e intervalos de Wilson para detectar colapso hacia la clase mayoritaria, un patron que la exactitud bruta oculta. Apropiado porque el repositorio incluye el codigo de reproduccion.
- Extraccion de respuestas normalizadas sobre graficos de informes de brokers: dado un grafico y una pregunta con cuatro opciones, generar unicamente la letra correcta, lo que simplifica el parseo en un pipeline automatizado de evaluacion interna.
- Etiquetado asistido de conjuntos de evaluacion: usar el adaptador para preanotar preguntas de opcion multiple y de verdadero/falso sobre documentos financieros chinos, reservando revision humana para los casos de baja confianza. Requiere validar antes el recall de la clase minoritaria en el dominio propio.
- Investigacion academica sobre sesgo de etiqueta en SFT: comparar esta variante de distribucion natural con la variante balanceada del mismo autor (que no aporto beneficio adicional) para estudiar cuando el remuestreo de clases ayuda y cuando no.
- Demostracion de recetas de ajuste eficiente: servir de plantilla reproducible de LoRA con vision congelada (43,6 M de parametros entrenables, 2 epocas, 1h36m en 4x RTX 4090) para tareas de clasificacion multimodal con salida corta.
- Control de regresion en pipelines de evaluacion: ejecutar el adaptador como referencia fija en CI para detectar cambios de prompt o de preprocesado que alteren el recall de la clase minoritaria, dado que la redaccion del prompt mueve ese recall hasta 23 puntos.

## Benchmarks y rendimiento

Evaluacion sobre 2.889 preguntas de test reservadas (particion por informe de origen, sin solapamiento con el entrenamiento), mismo prompt que en entrenamiento y decodificacion greedy.

| Condicion | Opcion multiple (bruto) | Verdadero/falso (bruto) | Macro-recall V/F | Recall en "No" (IC 95% Wilson) |
|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base) | 73,70% | 75,23% | 63,73% | 39,7% [31,2; 48,8] |
| + este adaptador | 84,13% | 84,01% | 79,15% | 69,0% [60,1; 76,7] |

Comparacion pareada por muestra (mismo uid global):

| Metrica | Valor |
|---|---|
| Muestras corregidas (base a adaptador) | 430 |
| Muestras degradadas (base a adaptador) | 136 |
| Ganancia neta | +294 |
| Test de McNemar | p < 0,001 |

Desglose por clase en verdadero/falso:

| Clase | n | Base | Adaptador | Delta |
|---|---|---|---|---|
| Recall en "Si" | 328 | 87,8% | 89,3% | +1,5 pp |
| Recall en "No" | 116 | 39,7% | 69,0% | +29,3 pp |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: despreciable; el repositorio completo ocupa 0,2 GB y los pesos LoRA en safetensors se pueden fusionar con el modelo base mediante merge_and_unload().
- VRAM para el modelo base en bfloat16: aproximadamente 17,6 GB solo en pesos (8,81 mil millones de parametros), mas overhead de activaciones y cache KV. Estimacion aritmetica, no una cifra publicada por el autor.
- VRAM para el modelo base en cuantizacion de 4 bits: del orden de 4,5-6 GB en pesos. Estimacion orientativa, no verificada en la model card.
- GPU recomendadas: el entrenamiento se realizo con 4x RTX 4090 en DDP (aproximadamente 1h36m). Para inferencia, una unica GPU con 24 GB o mas (RTX 4090, L4, A10G, A100, H100) cubre el modelo base en bfloat16.
- Viabilidad en GPU de consumo: si, en tarjetas de 24 GB para bfloat16 y en tarjetas de 12-16 GB si se cuantiza el modelo base. La model card no documenta una receta de cuantizacion concreta.
- Opciones de despliegue documentadas: transformers (AutoProcessor + AutoModelForImageTextToText) con PEFT (PeftModel.from_pretrained) y ms-swift como framework de entrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput de inferencia: no disponibles. El unico dato temporal publicado es el de entrenamiento (2 epocas, 422 pasos, ~1h36m en 4x RTX 4090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en VisFinEval (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base) | 8,81 mil millones | no disponible | MC 73,70%; V/F 75,23%; recall "No" 39,7% | Apache-2.0 | HuggingFace |
| VisFinEval LoRA — natural (este adaptador) | 8,81 mil millones + 43,6 M entrenables | no disponible | MC 84,13%; V/F 84,01%; recall "No" 69,0% | Apache-2.0 | HuggingFace |
| VisFinEval LoRA — balanced (variante hermana del mismo autor) | 8,81 mil millones + 43,6 M entrenables | no disponible | El autor indica que el remuestreo de clases no aporto beneficio adicional; cifras concretas no disponibles en la informacion proporcionada | Apache-2.0 | HuggingFace |

Comparacion con otros modelos vision-language de tamano similar (por ejemplo, otras familias de 7-9 mil millones de parametros): no disponible, ya que la informacion proporcionada no incluye resultados de terceros sobre VisFinEval.

## Limitaciones y advertencias

- Entrenado sobre un benchmark, no sobre un dominio general. VisFinEval carece de particion oficial de entrenamiento; se construyo una division 70/15/15 a nivel de informe. No debe tratarse como un VLM financiero de proposito general: esta ajustado al formato de pregunta de VisFinEval.
- Solo chino. La totalidad de los datos de entrenamiento esta en chino y no se reporta rendimiento en otros idiomas.
- Preguntas con multiples imagenes siguen siendo un punto debil: con 8 o mas imagenes el modelo puntua cerca o por debajo de la linea base de clase mayoritaria. El autor lo atribuye a un limite de integracion entre imagenes, no a un problema de presupuesto de tokens.
- Alta sensibilidad al prompt: la redaccion del prompt desplaza el recall de la clase minoritaria hasta 23 puntos, por lo que es obligatorio usar la plantilla literal de la model card para reproducir las cifras.
- Sin estimacion de varianza entre semillas: el ajuste se hizo con una unica semilla.
- Sesgo de distribucion: la condicion "natural" conserva el sesgo original del conjunto (58,5% de respuestas "A"), lo que puede traducirse en una preferencia residual por esa opcion fuera del benchmark.
- Riesgo de alucinacion: no se han publicado mediciones especificas de fidelidad factual ni de calibracion para este adaptador.
- Las imagenes de entrenamiento provienen de informes de research de brokers chinos y no se redistribuyen; hay que obtener VisFinEval por sus canales oficiales.
- Licencia Apache-2.0 tanto en el modelo base como en el adaptador, lo que en principio permite uso comercial, pero el uso comercial queda condicionado por los terminos del dataset VisFinEval y de las imagenes originales, no verificados en esta ficha.
- El repositorio registra 0 descargas y 0 "likes", y no tiene pipeline declarado: es un artefacto de investigacion sin senales de adopcion en produccion.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/gavinzsmeng/visfineval-qwen3vl-8b-lora-natural
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset VisFinEval: https://huggingface.co/datasets/SUFE-AIFLM-Lab/VisFinEval
- Auditoria completa, codigo y pasos de reproduccion: https://github.com/gavinzsmeng/visfineval-reliability
- Cita del autor: Meng, Gavin C. (2026), "VisFinEval Reliability Audit: what reported accuracy hides", https://github.com/gavinzsmeng/visfineval-reliability
