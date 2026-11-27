# Antontrs/qwen3.5-35b-a3b-humanizer-ru-gguf

## Resumen

Qwen3.5-35B-A3B-Base Russian Humanizer es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen3.5-35B-A3B-Base`, publicado por el usuario Antontrs en Hugging Face. Su propósito es el parafraseado de prosa en ruso para reducir la probabilidad de que un texto sea clasificado como generado por IA por detectores automáticos, una tarea que el autor denomina "humanización". El modelo se distribuye en formato GGUF cuantizado a Q4_K_M y está orientado exclusivamente al idioma ruso.

El modelo hereda la arquitectura del Qwen3.5-35B-A3B, un transformer de tipo Mixture of Experts (MoE) con aproximadamente 35.500 millones de parámetros totales y unos 3.000 millones activos por token. El ajuste se realizó mediante una técnica que el autor denomina HIP-SFT (adaptative gate-HIP) sobre 889 pares de prosa rusa limpia. No se ha aplicado RLHF según la model card.

La relevancia de esta ficha es acotada: se trata de un modelo muy especializado, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y con una model card breve. Resulta útil como ejemplo de fine-tuning de un MoE grande para una tarea lingüística concreta, pero su adopción en producción exige verificar la licencia del modelo base y validar de forma independiente las afirmaciones de rendimiento del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivada de Qwen3.5-35B-A3B-Base |
| Parametros totales | 35.505.251.456 (aprox. 35,5 mil millones) |
| Parametros activos | Aprox. 3 mil millones (3B) por token, segun la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se documentan otras |
| Idiomas soportados | Ruso (ru) |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero Q4_K_M de 21,71 GB) y Modelfile para Ollama |
| Modelo base | unsloth/Qwen3.5-35B-A3B-Base |
| Tamano del repositorio | 21,7 GB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `unsloth/Qwen3.5-35B-A3B-Base`, un transformer con capas de mezcla de expertos (MoE) en el que cada token activa aproximadamente 3.000 millones de parámetros de un total de 35.500 millones. El autor indica que el modelo base es "true Base", es decir, sin RLHF, lo que implica que el ajuste parte de un modelo de continuación de texto y no de un modelo alineado para instrucciones.

El entrenamiento consistió en un ajuste supervisado (SFT) sobre 889 pares de prosa rusa limpia, empleando una metodología que el autor denomina HIP-SFT con una compuerta adaptativa ("Adaptive Gate-HIP"). La model card no detalla la composición exacta del dataset, la longitud de las secuencias, el número de épocas ni los hiperparámetros de entrenamiento. Tampoco se documenta el uso de DPO, RLHF ni técnicas de decodificación especulativa. La innovación declarada es la combinación de SFT con un mecanismo de compuerta adaptativa orientado a preservar la fidelidad semántica mientras se altera el estilo superficial del texto.

## Capacidades

- Parafraseado de prosa en ruso con el objetivo de reducir la señal de detección de IA.
- Reescritura con preservación de contenido semántico: el autor reporta una fidelidad semántica media del 96,6 % medida con ruRoberta.
- Corrección ortográfica y morfológica en ruso: el autor reporta cero errores detectados con pymorphy3 en las pruebas realizadas.
- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue mediante Ollama a través del Modelfile incluido.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidad multilingüe limitada al ruso según la etiqueta de idioma; no se documenta soporte de otros idiomas.

## Casos de uso

- Reescritura de textos divulgativos en ruso: el modelo puede reformular artículos o notas de blog para variar el estilo superficial manteniendo el contenido, apoyándose en la fidelidad semántica reportada del 96,6 % con ruRoberta.
- Adaptación de contenido editorial: un equipo de contenidos en ruso puede pasar borradores por el modelo para homogeneizar el registro y reducir patrones repetitivos, dado que el ajuste se entrenó sobre prosa rusa limpia.
- Preprocesado de corpus para investigación lingüística: útil para generar variantes estilísticas de un mismo texto en ruso y estudiar la robustez de clasificadores o detectores.
- Pruebas de estrés de detectores de IA: el modelo sirve para evaluar la sensibilidad de herramientas como GPTZero o GigaCheck frente a paráfrasis, ya que el autor documenta resultados concretos con ambas.
- Despliegue local en estaciones de trabajo: al distribuirse como GGUF Q4_K_M de 21,71 GB, puede ejecutarse con llama.cpp u Ollama en equipos con suficiente VRAM o RAM unificada, sin depender de API externa.
- Corrección y pulido de textos rusos: la combinación de parafraseado y verificación morfológica con pymorphy3 permite usarlo como paso de revisión en pipelines de publicación en ruso.
- Integración en flujos conversacionales en ruso: la etiqueta `conversational` y la compatibilidad con endpoints permiten montarlo detrás de una API compatible con OpenAI para tareas de reescritura interactiva.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el autor en la model card, obtenidos con una configuración que denomina "Adaptive Gate-HIP" y umbrales de fidelidad semántica con ruRoberta ≥ 0,90 y cero errores con pymorphy3. No se aportan resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | Herramienta | Resultado reportado |
|---|---|---|
| Texto clasificado como humano | GPTZero (Model 4.2m) | 96 % |
| Texto clasificado como IA | GPTZero (Model 4.2m) | 4 % |
| Texto clasificado como mixto | GPTZero (Model 4.2m) | 0 % |
| Clasificacion | Sber GigaCheck Web | Humano |
| Fidelidad semantica media | ruRoberta | 96,6 % (rango 92,4 %–99,2 %) |
| Errores ortograficos/morfologicos | pymorphy3 | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: en torno a 22 GB solo para los pesos; con overhead de contexto y caché KV conviene prever 24–28 GB según la longitud de contexto configurada (no documentada).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para despliegue cómodo con contexto amplio; una RTX 4090 de 24 GB puede quedar justa y requerirá limitar el contexto o usar offload parcial.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con contexto reducido y posible offload a CPU; en GPUs de 16 GB o menos será necesario repartir capas entre CPU y GPU.
- Opciones de despliegue: llama.cpp y Ollama (el repositorio incluye Modelfile con temperature=0.95, top_p=0.96, min_p=0.015, repeat_penalty=1.0); también es compatible con endpoints según la etiqueta del repositorio. No se documenta soporte específico de vLLM o TGI para este GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE con unos 3B parámetros activos, el coste por token es inferior al de un modelo denso de 35B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de parafraseado en ruso con ajuste específico para reducción de detección de IA. Se compara con el modelo base del que deriva, que es el único punto de referencia documentado.

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Antontrs/qwen3.5-35b-a3b-humanizer-ru-gguf | 35,5B totales / ~3B activos | no disponible | GGUF Q4_K_M | no disponible | Parafraseado ruso (humanización) |
| unsloth/Qwen3.5-35B-A3B-Base | 35,5B totales / ~3B activos | no disponible | safetensors (base) | no disponible | Modelo base sin RLHF |
| Alternativas de parafraseado en ruso | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si el uso comercial está permitido; debe verificarse la licencia del modelo base `unsloth/Qwen3.5-35B-A3B-Base` antes de cualquier despliegue en producción.
- Ámbito lingüístico restringido al ruso; no se documenta calidad en otros idiomas y el ajuste se hizo solo con pares en ruso.
- Entrenado sobre únicamente 889 pares: el volumen es reducido y puede provocar sobreajuste al estilo de ese corpus y escasa generalización a registros muy distintos.
- Riesgo de deriva semántica: aunque el autor reporta 96,6 % de fidelidad con ruRoberta, un 3,4 % de pérdida media implica que en textos largos o técnicos puede alterar matices o introducir imprecisiones.
- Las métricas de detección (GPTZero, GigaCheck) son reportadas por el autor, no verificadas de forma independiente, y los detectores evolucionan; los resultados pueden no reproducirse.
- Uso potencialmente controvertido: la finalidad declarada de evadir detectores de IA plantea problemas éticos y de política de uso en contextos académicos, editoriales o de moderación de contenido.
- Sin datos de contexto máximo ni de comportamiento en secuencias largas; la configuración de inferencia recomendada (temperature 0.95, top_p 0.96) es alta y puede aumentar la variabilidad y el riesgo de alucinación.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- Al derivar de un modelo "Base" sin RLHF, no está alineado para instrucciones generales ni para rechazar peticiones inapropiadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Antontrs/qwen3.5-35b-a3b-humanizer-ru-gguf
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-35B-A3B-Base
- GPTZero: https://gptzero.me
- Sber GigaCheck: no disponible (el autor cita "Sber GigaCheck Web" sin enlace)
- ruRoberta: no disponible (referencia a modelo de similitud semántica en ruso sin enlace en la model card)
- pymorphy3: no disponible (referencia a librería de morfología rusa sin enlace en la model card)
