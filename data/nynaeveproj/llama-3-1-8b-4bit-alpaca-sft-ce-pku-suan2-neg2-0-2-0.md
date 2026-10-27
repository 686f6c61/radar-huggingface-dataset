# NynaeveProj/Llama-3.1-8B-4bit-alpaca-sft-ce-pku-suan2-neg2.0-2.0

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA (PEFT) entrenado sobre `NynaeveProj/Llama-3.1-8B-4bit`, una versión cuantizada a 4 bits del conocido Llama 3.1 8B de Meta. Lo publica el usuario NynaeveProj y el artefacto ocupa 0,3 GB, un tamano coherente con pesos de adaptador y no con un checkpoint completo. El pipeline declarado es `text-generation` y la libreria de referencia es PEFT 0.19.1.

El nombre del repositorio sugiere un ajuste supervisado tipo Alpaca (`alpaca-sft`) sobre una mezcla de datos identificada como `ce-pku-suan2-neg2.0-2.0`, presumiblemente una combinacion de instrucciones en chino con ejemplos negativos o de rechazo. Esta lectura es una inferencia a partir de la nomenclatura: la model card es la plantilla generica de HuggingFace sin rellenar y no documenta dataset, hiperparametros ni procedimiento de entrenamiento.

Su relevancia practica es limitada y muy acotada: no hay descargas, no hay likes, la licencia no esta declarada y no existen resultados de evaluacion. Es util unicamente como ejemplo de adaptador LoRA experimental o como punto de partida reproducible para quien quiera inspeccionar la receta de ajuste sobre un Llama 3.1 8B cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only Llama 3.1 8B cuantizado a 4 bits |
| Parametros totales | No disponible para el adaptador (el modelo base Llama 3.1 8B tiene 8.030 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Llama 3.1 soporta 128.000 tokens |
| Tipos de cuantizacion | Base en 4 bits (etiqueta `4bit` del modelo base); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponibles (el nombre del dataset sugiere datos en chino, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), repo de 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B, un transformer decoder-only con atención por grupos (GQA, 32 cabezas de consulta y 8 de clave/valor), 32 capas, embeddings de 4.096 dimensiones, activación SwiGLU, RoPE y tokenizador de 128.256 entradas con contexto nativo de 128.000 tokens. El modelo base sobre el que se entrena aquí es un derivado cuantizado a 4 bits publicado por el mismo autor, lo que abarata el ajuste pero introduce error de cuantización acumulado antes de cualquier SFT.

No hay información sobre el dataset, el número de tokens, la composición de la mezcla ni si hubo RLHF o DPO. El sufijo `alpaca-sft` apunta a un ajuste supervisado con formato Alpaca, y `ce-pku-suan2-neg2.0-2.0` parece codificar una mezcla con proporciones (por ejemplo, 2.0 frente a 2.0) y ejemplos negativos; se trata de una hipótesis, no de un dato confirmado. La model card no incluye hiperparametros, rango LoRA, alpha, target modules ni régimen de precisión.

## Capacidades

- Generación de texto e instrucciones en el formato Alpaca, presumiblemente heredadas del ajuste supervisado.
- Razonamiento y conocimiento general heredados del modelo base Llama 3.1 8B, no verificados en este adaptador.
- Generación de código: el modelo base tiene capacidad razonable, pero no hay evaluación del adaptador.
- Posible soporte de instrucciones en chino si la mezcla `pku-suan2` se confirma; no verificado.
- Tool calling y function calling: el modelo base Llama 3.1 soporta plantillas de herramientas, pero el adaptador no documenta el uso del formato de herramientas de Llama 3.1 ni preserva necesariamente su plantilla de chat.
- Capacidades de agente y razonamiento multi-paso: no documentadas y probablemente degradadas por un SFT tipo Alpaca de un solo turno.
- Capacidades multimodales o de audio: no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Evaluación comparativa de recetas de ajuste: usar el adaptador como referencia para medir cuánto aporta un SFT Alpaca sobre un Llama 3.1 8B ya cuantizado a 4 bits, frente al modelo base sin ajustar.
- Reproducción de experimentos académicos: entorno controlado para estudiar el efecto de mezclas con ejemplos negativos en la tasa de rechazo, si se confirma la composición del dataset.
- Pruebas de formato de instrucciones: validar si el adaptador respeta el esquema Alpaca (instrucción, entrada, salida) en pipelines de generación por lotes.
- Prototipado interno sin requisitos de producción: dado que no hay licencia declarada ni evaluación, solo es defendible en entornos de investigación cerrados.
- Análisis de cuantización y PEFT: inspeccionar cómo se comporta un LoRA entrenado sobre pesos de 4 bits al fusionar (`merge_and_unload`) o al dequantizar para exportar.
- Docencia y divulgación: ejemplo mínimo de 0,3 GB para explicar el ciclo de vida de un adaptador PEFT y su carga con `PeftModel.from_pretrained`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra métrica, y no hay cifras propias para el adaptador ni para el modelo base cuantizado. Cualquier comparación numérica con el Llama 3.1 8B original sería especulativa, ya que la cuantización a 4 bits y el SFT posterior alteran el comportamiento de forma no medida.

## Requisitos de hardware

- VRAM para inferencia: el adaptador pesa 0,3 GB; el modelo base cuantizado a 4 bits ocupa aproximadamente 5-6 GB de pesos, más 1-2 GB de caché KV para contextos medios.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 16 GB y RTX 4090 24 GB, incluso con contextos largos.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L4 24 GB son suficientes y sobredimensionadas para 8B; útiles para servir en paralelo varias réplicas.
- Despliegue: carga estándar con `transformers` + `peft` y cuantización bitsandbytes. vLLM y TGI admiten adaptadores LoRA en caliente, pero exigen un base en precisión completa o FP8, no el checkpoint de 4 bits. Para llama.cpp u Ollama habría que dequantizar y fusionar el adaptador, paso no documentado por el autor.
- Latencia y throughput: no disponibles. Como orden de magnitud para un 8B en 4 bits, cabe esperar decodificación interactiva en una RTX 4090 y varias decenas de tokens por segundo en A100, pero son estimaciones no medidas sobre este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (Llama 3.1 8B 4bit + LoRA Alpaca) | Adaptador LoRA sobre 8B | No disponible (base 128k) | No disponible | 0 descargas, 0 likes | Sin evaluación ni documentación |
| Llama 3.1 8B Instruct (Meta) | 8.030 M | 128.000 | Llama 3.1 Community License | Ampliamente disponible | Modelo de referencia con evaluación oficial y soporte de herramientas |
| Mistral 7B Instruct | 7.240 M | 32.000 | Apache 2.0 | Ampliamente disponible | Alternativa permisiva para uso comercial |
| Qwen2.5 7B Instruct | 7.620 M | 32.768 (hasta 131k en variantes) | Apache 2.0 | Ampliamente disponible | Fuerte en chino, relevante si el dataset es en ese idioma |

La comparación real solo es posible contra el Llama 3.1 8B original; los demás se incluyen como alternativas de mismo tamano y tarea, no como equivalentes funcionales. No hay datos de rendimiento del adaptador para sostener ninguna comparación cuantitativa.

## Limitaciones y advertencias

- Model card vacía: sin información de dataset, hiperparametros, evaluación ni uso previsto; no es posible auditar el entrenamiento.
- Licencia no declarada: el adaptador no indica términos de uso. El modelo base Llama 3.1 está sujeto a la Llama 3.1 Community License, con restricciones de uso comercial a gran escala y cláusulas de atribución que se heredan.
- Riesgo de alucinación no medido, agravado por la falta de evaluación y por el SFT sobre datos desconocidos.
- El ajuste sobre pesos de 4 bits puede degradar la coherencia y el seguimiento de instrucciones respecto al base en bf16; no hay métricas que lo cuantifiquen.
- Sesgos desconocidos: se desconoce la composición del dataset y si se aplicó filtrado; si la mezcla es mayoritariamente en chino, el rendimiento en castellano puede ser deficiente.
- Posible sobreajuste al formato Alpaca: los prompts en formato chat de Llama 3.1 pueden producir respuestas degeneradas.
- Contexto efectivo no verificado: aunque el base soporte 128.000 tokens, un LoRA entrenado con secuencias cortas suele degradarse mucho antes.
- Repositorio sin actividad ni mantenimiento (0 descargas, 0 likes) y con fecha de creación anómala (27 de octubre de 2026), lo que impide asumir soporte del autor.
- No apto para producción sin evaluación propia: no hay garantías de comportamiento, seguridad ni cumplimiento normativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NynaeveProj/Llama-3.1-8B-4bit-alpaca-sft-ce-pku-suan2-neg2.0-2.0
- Modelo base del adaptador: https://huggingface.co/NynaeveProj/Llama-3.1-8B-4bit
- Paper referenciado en los tags (Lacoste et al., 2019, sobre impacto ambiental; aparece por la plantilla, no describe este modelo): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Modelo original Llama 3.1 8B de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relación con el repositorio y se han descartado.
