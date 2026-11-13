# farefaine/qal-large

## Resumen

Qal large es un modelo de lenguaje de tipo GPT entrenado desde cero para el tigriña (ti), una lengua semítica de Eritrea y Etiopía considerada de bajos recursos. Lo desarrolla el autor independiente farefaine como parte de la serie *Building Qal*, un proyecto que entrena cinco tamanos del mismo modelo con datos, tokenizer y receta identicos para permitir comparaciones controladas entre escalas. Esta es la variante *large*, con 55,2 millones de parametros.

El modelo resuelve el problema de la escasez de modelos generativos nativos para tigriña: la mayoria de los LLM disponibles apenas cubren esta lengua de forma marginal. Qal large se entrena exclusivamente con corpus publicos de tigriña (unos 79 millones de tokens por epoca) y emplea un vocabulario BPE propio de 8.192 tokens, lo que evita el desperdicio de tokens que sufre el tigriña con tokenizers disenados para ingles.

Es relevante como referencia para investigacion en lenguas de bajos recursos y para experimentacion con modelos pequenos en entornos con pocos recursos de computo. Su contexto es muy limitado (128 tokens) y no ha recibido ajuste por instrucciones, por lo que su uso practico queda restringido a generacion de texto libre y tareas de continuacion, no a asistentes conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT |
| Parametros totales | 55.196.160 (55,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | tigriña (ti) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (libreria PyTorch) |

Especificaciones adicionales segun la model card: 6 capas, 12 cabezas de atencion, dimension de embedding 768, vocabulario BPE de 8.192 tokens y embeddings posicionales absolutos aprendidos.

## Arquitectura y entrenamiento

Qal large es un transformer decoder-only denso con 6 capas, 12 cabezas de atencion y dimension oculta de 768. Usa embeddings posicionales absolutos aprendidos (no RoPE) y un tokenizer BPE de 8.192 tokens entrenado para el tigriña. La implementacion es propia y se distribuye en el repositorio de GitHub del autor (`model.transformer.GPT`), no en la libreria `transformers` de Hugging Face.

El entrenamiento se realizo durante 30 epocas (96.420 pasos) sobre una version limpiada del dataset `farefaine/tigrinya-pretraining`, con aproximadamente 79 millones de tokens por epoca. Se uso AdamW (betas 0,9 y 0,99), weight decay 0,1, dropout 0,1, tasa de aprendizaje pico de 0,0017 con un esquema warmup-stable-decay (mantenida durante el 80% del entrenamiento y luego decaida), precision mixta BF16 y un unico GPU. El batch fue de 192 secuencias de 128 tokens. No se menciona RLHF, DPO ni ajuste por instrucciones. Las fuentes de datos citadas son TLMD (Gaim, Yang y Park, 2021), el Tigrinya NLP Corpus de la SeReT Foundation y TiQuAD (Gaim, Yang, Park y Park, 2023).

## Capacidades

- Generacion de texto libre en tigriña mediante decodificacion autorregresiva (el ejemplo de la model card usa muestreo con temperatura 0,8).
- Modelado de lenguaje y calculo de perplejidad sobre corpus de tigriña (20,7 en test).
- Continuacion de texto y experimentacion con prompts cortos de hasta 128 tokens.
- Tokenizacion nativa de tigriña con vocabulario BPE dedicado de 8.192 tokens.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo *thinking*, vision, audio ni capacidades multimodales.
- No esta ajustado por instrucciones: no responde a comandos de forma fiable.
- Multilingue limitado: unicamente tigriña.

## Casos de uso

- Investigacion en lenguas de bajos recursos: sirve como punto de referencia escalable dentro de la serie Qal (cinco tamanos con la misma receta) para estudiar el efecto del tamano del modelo en tigriña.
- Generacion de texto sintetico en tigriña: puede producir borradores de texto para aumentar corpus de entrenamiento de modelos mayores, siempre con revision humana por su fiabilidad limitada.
- Modelado de lenguaje y evaluacion de tokenizers: util para medir perplejidad de corpus de tigriña y comparar estrategias de tokenizacion especificas para la lengua.
- Experimentacion educativa: su tamano (55 M de parametros) permite entrenarlo y ejecutarlo en un unico GPU de gama consumer, lo que lo hace adecuado para docencia y prototipado rapido.
- Pruebas de infraestructura de inferencia: al ser un modelo pequeno y ligero (0,2 GB de repo), sirve para validar pipelines de despliegue antes de escalar a modelos mayores.
- Analisis de sesgos y calidad de corpus: permite estudiar que sesgos hereda un modelo entrenado exclusivamente con noticias y corpus publicos de tigriña.
- Completado de texto en herramientas editoriales para tigriña: con contexto de 128 tokens, puede sugerir continuaciones de frases en entornos de redaccion, sin garantia de correccion factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta perdida y perplejidad:

| Split | Loss | Perplexity |
|---|---|---|
| Validacion | 3,016 | 20,4 |
| Test | 3,029 | 20,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16/BF16 (55 M de parametros, aproximadamente 110 MB de pesos); en FP32, unos 220 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3090, RTX 3060 y GPUs integradas con soporte CUDA.
- Cabe holgadamente en cualquier GPU consumer, e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: al no usar `transformers`, la via oficial es el codigo del repositorio GitHub del autor con PyTorch. No hay versiones GGUF ni soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas plausibles de la misma categoria (modelos pequenos para lenguas de bajos recursos), indicando cuando un dato no esta disponible:

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Qal large | 55,2 M | 128 | CC BY-SA 4.0 | tigriña | Entrenado desde cero, sin ajuste por instrucciones |
| Otros tamanos de la serie Qal | no disponible | 128 | CC BY-SA 4.0 | tigriña | Misma receta y datos; comparables directamente |
| Modelos multilingues pequenos de proposito general | no disponible | variable | variable | multilingue | Cobertura de tigriña marginal; no comparables en rendimiento sin datos |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Limitaciones y advertencias

- Modelo muy pequeno (55 M de parametros) entrenado con unos 79 M de tokens por epoca: produce tigriña que parece fluido pero no es fiable para hechos.
- No esta ajustado por instrucciones; no debe usarse como asistente conversacional ni para seguir comandos.
- Contexto de solo 128 tokens, insuficiente para documentos largos, dialogos multi-turno o razonamiento extendido.
- Hereda los sesgos de sus fuentes de entrenamiento, mayoritariamente texto periodistico.
- Riesgo elevado de alucinacion en cualquier tarea factual.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Requiere el codigo del repositorio del autor para cargar los pesos; no es compatible de forma nativa con `transformers`, lo que complica su integracion en pipelines estandar.
- Sin versiones cuantizadas publicadas (GGUF, AWQ, etc.) ni soporte documentado en servidores de inferencia habituales.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: ecosistema y mantenimiento sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farefaine/qal-large
- Repositorio de codigo: https://github.com/farefaine/qal
- Serie divulgativa *Building Qal*: https://farefaine.substack.com
- Dataset de preentrenamiento: https://huggingface.co/datasets/farefaine/tigrinya-pretraining
- TLMD (Gaim, Yang y Park, 2021): https://zenodo.org/records/5139094
- Tigrinya NLP Corpus (SeReT Foundation): https://github.com/TigrinyaNLP/corpus
- TiQuAD (Gaim, Yang, Park y Park, 2023): https://github.com/fgaim/TiQuAD
