# rodinaahmed30/qwen1.5b-masri-lora

## Resumen

`rodinaahmed30/qwen1.5b-masri-lora` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario rodinaahmed30. El nombre y el dataset de entrenamiento (`masri_mt_train`) indican un ajuste orientado a árabe egipcio (masri), presumiblemente para tareas de traducción automática o conversación en ese dialecto. No se trata de un modelo completo, sino de un delta de pesos que debe cargarse junto al modelo base o fusionarse con él antes de su uso.

La relevancia del artefacto es limitada: la model card es la generada automáticamente por el Trainer de Hugging Face, con secciones "More information needed" sin cubrir, cero descargas y cero valoraciones. El autor solo reporta una pérdida de validación de 0,7949 tras 2 épocas; no hay benchmarks, ni descripción del dataset, ni evaluación cualitativa en árabe egipcio.

Técnicamente hereda del base Qwen2.5-1.5B-Instruct: un transformer decoder-only de 1,54 mil millones de parámetros, contexto nativo de 32.768 tokens y licencia Apache-2.0. El adaptador ocupa 3,3 GB en el repositorio, un tamaño desproporcionado para un LoRA sobre un modelo de 1,5B, lo que sugiere que el checkpoint guardado incluye pesos en fp32 o componentes adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención de tipo causal (heredada del base Qwen2.5-1.5B-Instruct); el artefacto en sí es un adaptador LoRA |
| Parametros totales | 1,54 B en el modelo base; el adaptador LoRA no declara su número de parámetros entrenables (no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (hasta 131.072 con escalado YaRN, según especificaciones de Qwen2.5); no se indica si el ajuste LoRA preserva esta ventana |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizar; tras fusionarlo con el base puede cuantizarse a GGUF (Q4_K_M, Q5_K_M, Q8_0), AWQ, GPTQ o bitsandbytes (int8/int4) usando las herramientas estándar del ecosistema. No disponible en el repo del adaptador |
| Idiomas soportados | No disponible explícitamente. Por el nombre del dataset, se orienta a árabe egipcio (masri); el base Qwen2.5 cubre más de 29 idiomas, entre ellos inglés, castellano, chino y árabe estándar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere transformers + peft, o fusión previa para generar safetensors completos o GGUF |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con 28 capas, atención con Grouped Query Attention (12 cabezas de query y 2 de key/value), normalización RMSNorm y embeddings de posición rotatorios. El ajuste se realizó con PEFT 0.18.1 y lo que la model card identifica como el ecosistema de LLaMA-Factory, sobre el dataset `masri_mt_train`, cuyo contenido, tamaño y procedencia no se documentan.

Los hiperparámetros sí están publicados: learning rate de 2e-4 con scheduler coseno y un 5 % de warmup, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-8), batch efectivo de 32 (batch 4 por dispositivo × 2 GPUs × 4 pasos de acumulación), 2 épocas, 2.464 pasos totales y precisión mixta con AMP nativo. Con esos datos se deduce un conjunto de entrenamiento de aproximadamente 39.400 ejemplos por época (1.232 pasos × 32), es decir, unas 78.800 muestras procesadas en total. La pérdida de entrenamiento baja de 1,2373 a 0,5406 y la de validación de 1,2427 a 0,7949, sin signos evidentes de sobreajuste en la curva reportada, aunque tampoco se aporta una métrica de tarea (BLEU, chrF, exactitud) que permita saber si el modelo realmente traduce o conversa bien en egipcio.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo instruct base.
- Ajuste específico presunto para árabe egipcio (masri): traducción o respuesta en ese dialecto, a validar empíricamente porque no hay evaluación publicada.
- Razonamiento y matemáticas básicas a nivel de un modelo de 1,5B, sin mejoras declaradas por el ajuste.
- Generación de código y comprensión de instrucciones técnicas, capacidad heredada del base y potencialmente degradada si el ajuste fue agresivo.
- Soporte de tool calling / function calling: el base Qwen2.5-Instruct lo soporta de forma nativa, pero el adaptador no documenta si conserva la plantilla y el formato de llamadas a herramientas.
- Capacidades multilingües del base (más de 29 idiomas), con posible especialización y posible pérdida de rendimiento fuera del dominio del dataset.
- No dispone de visión, audio ni modo "thinking" extendido.

## Casos de uso

- Traducción castellano-árabe egipcio en aplicaciones de atención al cliente: el modelo podría adaptarse a registro coloquial egipcio, algo que el árabe estándar moderno del base cubre peor; requiere evaluación previa con un conjunto de test propio.
- Prototipado rápido de asistentes conversacionales en dialecto egipcio: al ser un adaptador sobre 1,5B, se puede desplegar en una sola GPU consumer con latencia baja para demos internas.
- Normalización de texto dialectal en pipelines de datos: uso del modelo para reescribir o etiquetar corpus de árabe egipcio antes de entrenar modelos mayores.
- Investigación sobre ajuste eficiente (LoRA) en lenguas de bajos recursos: el checkpoint sirve como caso de estudio reproducible con hiperparámetros completos y curva de pérdida publicada.
- Generación de contenido localizado para mercados egipcios (publicidad, soporte, FAQ) con revisión humana obligatoria dado el riesgo de alucinación.
- Base para ajustes posteriores (continual LoRA): partir de este adaptador para especializar aún más en un subdominio concreto, aprovechando que el formato PEFT es compatible con LLaMA-Factory y TRL.
- Sustituto ligero en entornos con restricciones de VRAM (menos de 4 GB en cuantización de 4 bits) donde un modelo de 7B o superior no cabe.

## Benchmarks y rendimiento

El model-index del autor está vacío (`results: []`): no se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni métricas de traducción como BLEU o chrF para árabe egipcio).

Los únicos datos numéricos son los de la curva de entrenamiento:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion |
|---|---|---|---|
| 0,2030 | 250 | 1,2373 | 1,2427 |
| 0,4060 | 500 | 1,0596 | 1,0583 |
| 0,6090 | 750 | 0,9564 | 0,9648 |
| 0,8120 | 1000 | 0,8837 | 0,9023 |
| 1,0146 | 1250 | 0,6272 | 0,8783 |
| 1,2176 | 1500 | 0,6075 | 0,8369 |
| 1,4206 | 1750 | 0,6070 | 0,8177 |
| 1,6236 | 2000 | 0,5601 | 0,8010 |
| 1,8266 | 2250 | 0,5296 | 0,7961 |
| 2,0 | 2464 | 0,5406 | 0,7949 |

Cabe señalar que, a partir del paso 1.250, el modelo entra en la segunda época y la pérdida de entrenamiento cae bruscamente mientras la de validación lo hace de forma mucho más lenta, lo que es coherente con memorización parcial del conjunto de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia con el adaptador fusionado: unos 3,1 GB en fp16/bf16, 1,6 GB en int8 y entre 1,0 y 1,3 GB en GGUF Q4_K_M (más overhead de contexto KV, que crece con la longitud de la ventana).
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 o superiores trabajan con margen amplio. Para despliegue agregado, L4, A10G, A100 o H100 permiten batchear decenas de peticiones concurrentes.
- Cabe en GPU consumer: sí, holgadamente, incluso en tarjetas de 4-6 GB o en CPU con llama.cpp/Ollama tras fusionar y cuantizar.
- Opciones de despliegue: transformers + peft (carga del adaptador sin fusionar), vLLM con soporte de adaptadores LoRA (`--enable-lora`) para alta concurrencia, TGI, llama.cpp u Ollama tras fusionar y convertir a GGUF.
- Latencia y throughput: no disponibles como medición publicada. Como referencia de orden de magnitud para un modelo de 1,5B en bf16 sobre una RTX 4090, es esperable un throughput de varios cientos a más de mil tokens por segundo con batching, pero son cifras orientativas no verificadas para este checkpoint concreto.
- El repositorio ocupa 3,3 GB, por encima de lo habitual en un adaptador LoRA de este tamaño; conviene inspeccionar el contenido antes de asumir que solo contiene los pesos del adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen1.5b-masri-lora (este) | 1,54 B (base) + adaptador | 32.768 tokens (heredado) | Árabe egipcio (presunto, sin evaluar) | Apache 2.0 | Adaptador PEFT, 0 descargas, 0 likes |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Instrucciones generales, 29+ idiomas | Apache 2.0 | Modelo completo, ampliamente descargado y con benchmarks publicados por Qwen |
| Llama-3.2-1B-Instruct | 1,24 B | 131.072 tokens | Instrucciones generales, multilingüe | Llama 3.2 Community License (restricciones) | Modelo completo, muy adoptado |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens (ampliable) | Instrucciones, orientado a eficiencia | Apache 2.0 | Modelo completo, con benchmarks publicados |

No se dispone de datos de rendimiento comparativos para este adaptador; la comparación anterior es puramente estructural (parámetros, contexto, licencia y disponibilidad). Frente a los tres alternativos, el valor diferencial es la especialización dialectal, y la desventaja es la ausencia total de evaluación y de documentación.

## Limitaciones y advertencias

- Ausencia total de benchmarks de tarea: no hay evidencia publicada de que el ajuste mejore la calidad en árabe egipcio frente al modelo base; la pérdida de validación no es una métrica de calidad lingüística.
- Dataset no documentado: se desconoce `masri_mt_train` en origen, tamaño, licencia, calidad y composición, lo que impide evaluar riesgos de sesgo, contaminación o derechos de uso del corpus.
- Riesgo de olvido catastrófico: 2 épocas con learning rate de 2e-4 sobre un modelo de 1,5B pueden degradar capacidades del base (código, matemáticas, instrucciones en otros idiomas). No se reporta ninguna evaluación de retención.
- Alucinación: como cualquier modelo de 1,5B, tiende a inventar datos factuales; el ajuste en un dominio concreto no corrige este comportamiento y puede reforzarlo si el corpus contiene ruido.
- Sesgos: no evaluados. Un corpus dialectal sin filtrar puede incorporar estereotipos regionales, de género o religiosos.
- Cobertura idiomática incierta: el adaptador puede haber estrechado la competencia multilingüe del base hacia el árabe egipcio; no hay datos sobre el resto de idiomas.
- Tool calling y plantillas de chat: no se confirma que el adaptador conserve el formato de funciones del base; conviene probarlo antes de integrarlo en agentes.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe verificar por su cuenta la licencia del dataset de ajuste, no declarada.
- Madurez: cero descargas y cero valoraciones, ficha creada y actualizada en octubre de 2026; no hay historial de uso en producción ni informes de terceros.
- Tamaño anómalo del repositorio (3,3 GB para un LoRA de 1,5B): verificar que no incluya pesos completos duplicados o checkpoints intermedios antes de desplegarlo.
- Enlaces de la búsqueda web: los resultados recuperados no guardan relación con el modelo (contenido sobre fetiches del cuero) y se han descartado por no ser fuentes válidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rodinaahmed30/qwen1.5b-masri-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de LLaMA-Factory (framework de ajuste citado en las etiquetas): https://github.com/hiyouga/LLaMA-Factory
- Repositorio de PEFT: https://github.com/huggingface/peft
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/

No se han encontrado otros enlaces relevantes (paper, demo o repositorio del autor) en la información disponible.
