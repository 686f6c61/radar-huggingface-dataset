# Jongbin-kr/llama3.1-8b-instruct_convfinqa_RFT-sc_k10_lora-r16a32_lr1e-4_ep3_ratio0.2

## Resumen

Este repositorio contiene un adaptador LoRA (no un modelo completo) construido sobre `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por el usuario Jongbin-kr. El adaptador se entrena mediante *rejection-sampling fine-tuning* (RFT) sin etiquetas, es decir, el propio modelo genera candidatos de respuesta y se seleccionan los mejores para el ajuste supervisado posterior. El dominio de especialización es ConvFinQA: razonamiento numérico sobre informes financieros que combinan texto y tablas en conversaciones multi-turno.

La relevancia de esta ficha es metodológica más que de producto. El autor compara cinco estrategias de selección de muestras (aleatoria, *self-consistency*, elección por LLM, elección por JEV y *gold*) manteniendo fijas las muestras generadas, lo que permite aislar el efecto de la selección sobre la precisión de los datos de entrenamiento y la precisión final en validación. El adaptador concreto aquí documentado usa la estrategia `sc` (self-consistency), con LoRA de rango 16, alpha 32, 3 épocas y un subconjunto del 20 % de los datos (2.174 filas de 10.874).

El modelo base es un transformer decoder-only de 8.000 millones de parámetros con 128.000 tokens de contexto y licencia Llama 3.1 Community. El adaptador ocupa 0,2 GB, no tiene descargas registradas y fue creado en noviembre de 2026 según los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama 3.1 (modelo base `meta-llama/Llama-3.1-8B-Instruct`) |
| Parametros totales | 8.000 millones en el modelo base; el adaptador LoRA añade un conjunto reducido de parámetros entrenables (r=16, alpha=32) sobre todas las proyecciones lineales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; no se especifica el contexto usado durante el entrenamiento del adaptador |
| Tipos de cuantizacion | no disponible (el adaptador se entrenó en bf16; el modelo base admite cuantización estándar de Llama 3.1 vía herramientas externas) |
| Idiomas soportados | no disponible en la model card; hereda los del modelo base (oficialmente 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors o formato compatible con Transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only con atención por grupos (GQA) y RoPE, preentrenado y ajustado por instrucciones por Meta. El adaptador LoRA tiene rango 16, alpha 32, dropout 0,05 y se inserta en todas las proyecciones lineales. El ajuste supervisado usa pérdida solo sobre la completación (*completion-only loss*), precisión bf16, learning rate 1e-4 con scheduler coseno, warmup del 3 %, 3 épocas, batch efectivo de 32 y semilla 42, en una única ejecución.

El pipeline de datos parte de `ssunggun2/LG_ConvFin_MCQ` (revisión 5669718b), del que se toma una muestra uniforme del 20 % (semilla 42): 2.174 de 10.874 filas. Para cada problema se generan 10 muestras del modelo base con temperatura 0,7 y top_p 1,0, usando un *system prompt* de analista financiero y un turno de usuario con contexto de informe (texto y tabla), historial de conversación, pregunta e instrucción de responder con el formato `<think>…</think><answer>…</answer>`. La estrategia `sc` selecciona la primera muestra de la respuesta final más frecuente entre las 10 (self-consistency). No se reporta uso de RLHF ni DPO; el método es RFT con selección por consenso.

## Capacidades

- Generación de texto conversacional en formato multi-turno, con historial de conversación en el prompt.
- Razonamiento numérico sobre informes financieros con contexto mixto de texto y tablas (ConvFinQA).
- Producción de trazas de razonamiento explícitas mediante el formato `<think>…</think><answer>…</answer>`.
- Respuesta a preguntas que requieren operaciones aritméticas sobre cifras extraídas de tablas.
- Capacidades heredadas del modelo base: generación de código, matemáticas, tool calling y function calling, agentes multi-paso y multilingüismo (8 idiomas oficiales).
- No se documentan capacidades de visión ni audio en el adaptador ni en la model card.

## Casos de uso

- Análisis de informes financieros en conversación: el adaptador responde preguntas encadenadas sobre un informe con tablas y texto, manteniendo el historial en el prompt y emitiendo el razonamiento entre etiquetas `<think>`, lo que facilita auditar el cálculo.
- Extracción y cálculo de métricas financieras: dado un estado de resultados en tabla, el modelo calcula variaciones, márgenes o ratios; su entrenamiento específico en ConvFinQA lo hace adecuado para preguntas del tipo "¿cuánto creció el margen bruto entre 2022 y 2023?".
- Asistente interno para equipos de análisis: desplegado sobre el modelo base con vLLM o TGI, sirve consultas sobre documentos financieros previamente insertados en el contexto (hasta 128.000 tokens del base).
- Evaluación de pipelines de datos sintéticos: el adaptador y sus variantes sirven como referencia para medir el impacto de la estrategia de selección de muestras (sc frente a random, llm-choice, jev-choice o gold) en tareas de razonamiento numérico.
- Investigación en self-training sin etiquetas: reproduce el protocolo RFT del autor para estudiar cómo la precisión de los datos seleccionados (67,5 % en `sc`) se traduce en precisión de evaluación (60,6 %).
- Prototipado de asistentes de banca o seguros: con la cautela de que la precisión en validación es del 60,6 %, es apto para entornos de asistencia con revisión humana, no para decisiones automatizadas.
- Fine-tuning posterior: al ser un adaptador PEFT, puede combinarse con otros adaptadores o continuar el entrenamiento sobre dominios financieros adicionales sin reentrenar los 8.000 millones de parámetros.

## Benchmarks y rendimiento

Evaluación sobre validación de ConvFinQA (`AdaptLLM/ConvFinQA`, 1.490 turnos), decodificación greedy; una respuesta se considera correcta si coincide por math-verify, exact match normalizado o coincidencia numérica (tolerancia relativa 1e-3, conversión decimal↔porcentaje).

| Seleccion | Ejemplos SFT | Precision de datos (%) | Precision en evaluacion (%) |
|---|---|---|---|
| base (sin SFT) | — | — | 60,0 |
| random | 2.174 | 57,7 | 59,5 |
| **sc (este adaptador)** | **2.174** | **67,5** | **60,6** |
| llm-choice | 2.174 | 62,3 | 58,9 |
| jev-choice | 2.174 | 73,0 | 64,8 |
| gold | 1.850 | 100,0 | 62,7 |

El autor advierte que solo hay una semilla de entrenamiento por selección y que las diferencias inferiores a 2-3 puntos pueden ser ruido. Este adaptador (`sc`) mejora 0,6 puntos sobre el base y 1,1 sobre `random`, pero queda 4,2 puntos por debajo de `jev-choice` y 2,1 por debajo de `gold`.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí ocupa 0,2 GB; el modelo base de 8.000 millones de parámetros requiere aproximadamente 16 GB en bf16/fp16, unos 8-9 GB en cuantización de 8 bits y unos 5-6 GB en 4 bits (estimaciones estándar para un modelo de este tamaño; no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio en bf16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para bf16 sin contexto extendido.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en bf16) y en GPUs de 8 GB con cuantización de 4 bits.
- Despliegue: la model card solo documenta el uso con `peft` + `transformers`. Para servicio en producción, vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren convertir el adaptador a GGUF. No se publican latencias ni throughput.
- Almacenamiento: 0,2 GB para el adaptador más el tamaño del modelo base (unos 16 GB en safetensors bf16).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Precision ConvFinQA (validacion) | Licencia |
|---|---|---|---|---|---|
| Este adaptador (`sc`) | 8B + LoRA r16 | 128k (base) | RFT con self-consistency sobre ConvFinQA | 60,6 % | Llama 3.1 Community |
| Variante `jev-choice` del mismo autor | 8B + LoRA r16 | 128k (base) | RFT con selección JEV | 64,8 % | Llama 3.1 Community |
| Variante `gold` del mismo autor | 8B + LoRA r16 | 128k (base) | SFT con etiquetas gold | 62,7 % | Llama 3.1 Community |
| Llama-3.1-8B-Instruct sin ajuste | 8B | 128k | Modelo base | 60,0 % | Llama 3.1 Community |

No se dispone en la información proporcionada de comparaciones con otros adaptadores ConvFinQA de terceros ni con modelos especializados en razonamiento financiero de otros tamaños.

## Limitaciones y advertencias

- La precisión en validación es del 60,6 %, solo 0,6 puntos por encima del modelo base; no es un adaptador apto para decisiones financieras automatizadas sin revisión humana.
- El adaptador se entrena con solo 2.174 ejemplos (20 % del dataset) y una única semilla; el autor reconoce que las diferencias de menos de 2-3 puntos pueden ser ruido estadístico.
- La estrategia `sc` obtiene peor precisión de datos (67,5 %) y peor resultado final que `jev-choice` (73,0 % y 64,8 %), por lo que no es la configuración recomendada dentro del propio estudio.
- Riesgo de alucinación en cifras y cálculos: el modelo puede producir resultados numéricos plausibles pero incorrectos sobre tablas financieras.
- No se documentan sesgos específicos ni evaluación multilingüe del adaptador; los idiomas distintos del inglés no están validados para la tarea ConvFinQA.
- El uso comercial está sujeto a la Llama 3.1 Community License, que impone restricciones (por ejemplo, cláusula de 700 millones de usuarios mensuales para licenciatarios) y obligaciones de atribución.
- El repositorio no incluye datos de latencia, throughput ni pruebas de despliegue en producción; las estimaciones de VRAM son cálculos estándar sobre el tamaño del modelo base, no medidas publicadas.
- El adaptador debe cargarse junto con el modelo base; no es un modelo autónomo y no funciona sin `meta-llama/Llama-3.1-8B-Instruct`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jongbin-kr/llama3.1-8b-instruct_convfinqa_RFT-sc_k10_lora-r16a32_lr1e-4_ep3_ratio0.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ssunggun2/LG_ConvFin_MCQ
- Dataset de evaluación: https://huggingface.co/datasets/AdaptLLM/ConvFinQA
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Librería PEFT: https://github.com/huggingface/peft
