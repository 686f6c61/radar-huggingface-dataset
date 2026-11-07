# anilguven/Llama-3.2-3B-XSumTr-500steps-unsloth

## Resumen

`anilguven/Llama-3.2-3B-XSumTr-500steps-unsloth` es un adaptador LoRA (PEFT) publicado por el usuario anilguven sobre el modelo base cuantizado `unsloth/Llama-3.2-3B-bnb-4bit`, que a su vez deriva del Llama 3.2 3B de Meta. El nombre del repositorio sugiere un ajuste fino supervisado (SFT) de aproximadamente 500 pasos orientado a la tarea de resumen de textos, probablemente sobre el corpus XSum en su variante turca (XSumTr), aunque la model card no lo confirma explícitamente.

El artefacto es únicamente el adaptador LoRA (0,1 GB), no los pesos completos del modelo. Para utilizarlo es necesario cargar el modelo base cuantizado en 4 bits y aplicar el adaptador mediante PEFT. Se entrenó con la librería Unsloth y su stack asociado (TRL, Transformers), lo que indica un flujo de ajuste eficiente en memoria pensado para GPUs de consumo.

La relevancia de esta ficha es limitada: se trata de un experimento personal sin model card completada, sin métricas publicadas, sin licencia declarada y con cero descargas. Resulta útil como referencia de patrón de ajuste LoRA para resumen, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B) con adaptador LoRA sobre proyecciones del modelo base |
| Parametros totales | Aproximadamente 3,2 mil millones en el modelo base; el adaptador LoRA añade una fracción no cuantificada en el repositorio (tamaño del repo: 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131 072 tokens según la familia Llama 3.2 3B de Meta (no verificado en este adaptador) |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors (precisión del adaptador no especificada) |
| Idiomas soportados | No disponible (la model card no los declara; el nombre sugiere foco en turco e inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.2 3B, un transformer decoder-only con atención por grupos (GQA) y tokenizador BPE de 128 256 entradas, en su versión pre-cuantizada a 4 bits por Unsloth. El ajuste se realizó con LoRA mediante SFT (supervised fine-tuning) usando TRL y Unsloth, con PEFT 0.21.2 como versión de referencia del framework. El nombre del repositorio indica 500 pasos de entrenamiento y una tarea de resumen (XSumTr), pero no se detallan hiperparámetros como rango del adaptador, alpha, tasa de aprendizaje, tamaño de lote ni composición exacta del dataset.

No hay información sobre volumen de tokens de entrenamiento, mezcla de datos, uso de RLHF/DPO ni innovaciones técnicas adicionales. Tampoco se documenta si se aplicó enmascaramiento de pérdida solo en la respuesta, plantilla de chat empleada o técnica de empaquetado de secuencias. Todo ello impide reproducir el entrenamiento a partir de la información disponible.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Llama 3.2 3B.
- Resumen de documentos, presumiblemente en turco e inglés, según el nombre del adaptador (XSumTr).
- Razonamiento básico y respuesta a instrucciones en la medida en que el ajuste SFT no haya degradado las capacidades del base.
- Soporte de tool calling y function calling: no disponible de forma verificada en este adaptador; el modelo base Llama 3.2 3B sí lo soporta, pero el ajuste puede haberlo alterado.
- Capacidades de agente y razonamiento multi-paso: no verificadas.
- Capacidades multilingües: no disponibles de forma declarada.
- Modo thinking, visión o audio: no disponibles (Llama 3.2 3B es solo texto).

## Casos de uso

- Resumen extractivo y abstractivo de noticias: el adaptador está entrenado específicamente para resumen sobre XSumTr, por lo que su uso natural es condensar artículos periodísticos en una o dos frases, aprovechando la ventana de contexto larga del modelo base para documentos extensos.
- Prototipado de pipelines de resumen en turco: útil como punto de partida para equipos que necesiten un resumen ligero en turco y quieran evaluar si el enfoque LoRA sobre Llama 3.2 3B es suficiente antes de invertir en un ajuste mayor.
- Generación de titulares y sumarios en CMS: integrable en un backend que reciba texto y devuelva un resumen corto, ejecutable en una GPU de consumo por el tamaño reducido del modelo base cuantizado.
- Experimentación académica con PEFT: sirve como ejemplo reproducible del flujo Unsloth + TRL + PEFT para estudiar el efecto de 500 pasos de SFT sobre un modelo pequeño.
- Evaluación comparativa de adaptadores: al ser un artefacto pequeño, se puede cargar y descargar rápidamente para comparar contra otros adaptadores de resumen sobre el mismo base.
- Filtrado y preprocesado de corpus: usar el resumen generado como señal auxiliar para deduplicación o etiquetado débil de documentos en un pipeline de datos.
- No se recomienda su uso en atención al cliente, generación de código en producción ni tareas de agente sin una evaluación previa, dado que no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits ocupa aproximadamente 2 GB de pesos; con overhead de activaciones y caché KV para contextos moderados (4-8 K tokens), se puede ejecutar en torno a 4-6 GB de VRAM. Para contextos cercanos a 128 K tokens, la caché KV crece de forma significativa y puede requerir más de 16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para inferencia local; A100 o H100 para despliegue concurrente con vLLM.
- Cabe en GPU de consumo: sí, en modelos con al menos 6-8 GB de VRAM para contextos cortos.
- Opciones de despliegue: Transformers + PEFT para cargar el adaptador; llama.cpp u Ollama tras fusionar el adaptador con el base y exportar a GGUF; vLLM para serving tras fusionar los pesos; TGI no verificado con adaptadores PEFT de este tipo.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anilguven/Llama-3.2-3B-XSumTr-500steps-unsloth | ~3,2 B (base) + LoRA | 131 072 (base) | Adaptador LoRA para resumen | No disponible | Hugging Face, 0 descargas |
| unsloth/Llama-3.2-3B-bnb-4bit | ~3,2 B | 131 072 | Modelo base cuantizado 4 bits | Sujeta a licencia Llama 3.2 de Meta | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2 B | 131 072 | Modelo instruct generalista | Llama 3.2 Community License | Hugging Face |
| Adaptadores de resumen sobre Llama 3.2 3B en la comunidad | ~3,2 B (base) + LoRA | 131 072 (base) | LoRA para resumen | Variable | Hugging Face |

La comparación directa con otros adaptadores de resumen no está disponible porque no se han identificado alternativas equivalentes con métricas publicadas en la información proporcionada.

## Limitaciones y advertencias

- La model card está prácticamente vacía: no declara licencia, idiomas, datos de entrenamiento ni evaluación, lo que impide conocer las restricciones de uso comercial.
- Al derivar del modelo base de Meta, el uso comercial está sujeto a la Llama 3.2 Community License, cuyos términos no se reproducen en este repositorio.
- Riesgo de alucinación inherente a un modelo de 3 B ajustado con 500 pasos: puede inventar datos en resúmenes de documentos largos.
- El ajuste SFT puede haber degradado capacidades del base (tool calling, instrucciones generales, multilingüismo) al haberse entrenado solo para resumen.
- No hay información sobre sesgos; se heredan los del corpus de preentrenamiento de Llama 3.2 y los del dataset XSumTr.
- El adaptador requiere cargar el modelo base cuantizado en 4 bits; la combinación de cuantización y LoRA puede introducir diferencias numéricas frente a un ajuste en precisión completa.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- No se especifica la plantilla de chat ni el formato de prompt esperado, lo que puede provocar resultados inconsistentes si se usa con la plantilla por defecto de Llama 3.2.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/anilguven/Llama-3.2-3B-XSumTr-500steps-unsloth
- Modelo base cuantizado: https://huggingface.co/unsloth/Llama-3.2-3B-bnb-4bit
- Modelo base de Unsloth: https://huggingface.co/unsloth/Llama-3.2-3B
- Tutorial de ajuste de Llama-3.2-3B con Unsloth en Azure Databricks: https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-llama-unsloth
- Referencia del cálculo de impacto ambiental citada en la model card: https://mlco2.github.io/impact#compute
- Paper de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
