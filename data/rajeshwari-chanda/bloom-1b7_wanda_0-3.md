# Rajeshwari-Chanda/bloom-1b7_wanda_0.3

## Resumen

`Rajeshwari-Chanda/bloom-1b7_wanda_0.3` es un checkpoint derivado de BLOOM-1b7 (1.722 millones de parametros) al que se le ha aplicado poda estructurada mediante el metodo Wanda (Pruning by Weights and Activations), con una tasa de esparcidad del 0.3 indicada en el propio nombre del repositorio. El modelo se distribuye en formato `safetensors` dentro de la libreria `transformers` y esta etiquetado para la tarea de generacion de texto. No cuenta con model card sustantiva: el README es la plantilla autogenerada por HuggingFace, sin informacion sobre datos de entrenamiento, licencia ni evaluacion.

Se trata, por tanto, de un artefacto de investigacion mas que de un modelo listo para produccion. El repositorio registra 0 descargas y 0 likes, y el autor no ha documentado el proceso de poda, la calibracion empleada ni los resultados obtenidos tras la compresion. Esto limita seriamente cualquier evaluacion rigurosa: sabemos que es un BLOOM-1b7 podado al 30 por ciento, pero no con que calibrador, sobre que corpus ni con cuanto dano en las metricas de lenguaje.

Su relevancia es acotada y fundamentalmente metodologica: sirve como ejemplo practico de aplicacion de tecnicas de poda post-entrenamiento sobre un modelo multilingue de ~1.7B. Quien necesite un modelo de ese tamano en produccion deberia recurrir directamente a BLOOM-1b7 o a alternativas como TinyLlama o Qwen2.5-1.5B, salvo que su objetivo sea precisamente reproducir o auditar el efecto de Wanda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de BLOOM-1b7); pesos podados con Wanda al 0.3 |
| Parametros totales | 1.722.408.960 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base BLOOM-1b7 usa 2048 tokens) |
| Tipos de cuantizacion | no disponible; el repo solo publica pesos en `safetensors` |
| Idiomas soportados | no disponible en la model card (el modelo base BLOOM-1b7 declara 46 lenguas naturales y 13 lenguajes de programacion) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de BLOOM-1b7, un transformer decoder-only con atencion causal, normalizacion tipo LayerNorm previa al bloque, activaciones GeLU y embeddings posicionales ALiBi (en lugar de posiciones aprendidas o RoPE). El modelo base fue entrenado por BigScience sobre el corpus ROOTS y su capa de embeddings es especialmente grande debido al vocabulario multilingue. La operacion aplicada en este checkpoint es una poda no estructurada de pesos mediante el criterio Wanda, que puntua cada peso como el producto entre su magnitud absoluta y la norma L2 de las activaciones de entrada de su capa, y elimina el 30 por ciento de los pesos con menor puntuacion.

No se documenta en el repositorio cuantos ejemplos de calibracion se usaron, si la poda fue por capa o global, ni si hubo un ciclo posterior de ajuste fino para recuperar calidad. Tampoco se especifica ningun proceso de RLHF, DPO o instruccion-tuning; cabe asumir que el modelo conserva el caracter de continuacion de texto del BLOOM-1b7 original. Al ser una poda no estructurada, el numero de parametros almacenados no se reduce: los pesos podados se guardan con valor cero, por lo que el checkpoint sigue ocupando el mismo espacio que el modelo denso.

## Capacidades

- Generacion de texto por continuacion de prompt, en la linea del BLOOM-1b7 base.
- Cobertura multilingue heredada del modelo original (no verificada en este checkpoint podado).
- Capacidad de generar codigo, dado que BLOOM-1b7 incluye lenguajes de programacion en su entrenamiento (no verificada tras la poda).
- No se documenta soporte de tool calling ni function calling.
- No se documenta modo de razonamiento explicito (thinking), vision, audio ni agentes multi-paso.
- No hay evidencia publicada de que las capacidades de instruccion o dialogo se mantengan; el modelo se distribuye sin plantilla de chat.

## Casos de uso

- Investigacion sobre poda de modelos: permite reproducir y auditar el efecto de Wanda con esparcidad 0.3 sobre un transformer multilingue, comparando la perplejidad frente al BLOOM-1b7 denso.
- Ablacion academica de tecnicas de compresion: util como punto de comparacion frente a otras estrategias (magnitude pruning, SparseGPT, destilacion) dado su tamano manejable de ~1.7B.
- Generacion de texto exploratoria en entornos con recursos limitados: gracias a su tamano, cabe en GPU de consumo en fp16, aunque la poda no reduce el uso de memoria en formato denso.
- Prototipado de pipelines de NLP multilingue: dado que hereda el vocabulario de BLOOM, puede usarse para probar tokenizacion y flujos en varias lenguas antes de escalar a modelos mayores.
- Base para ajuste fino ligero (LoRA/QLoRA): el checkpoint sirve como punto de partida barato para experimentos de fine-tuning en dominios concretos.
- Docencia y formacion: como ejemplo didactico de como la esparcidad no estructurada no reduce el footprint de memoria y exige kernels especializados para traducirse en aceleracion real.
- No se recomienda su uso en produccion (atencion al cliente, generacion de codigo fiable, tareas criticas) mientras no existan evaluaciones publicadas de su calidad tras la poda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card es la plantilla autogenerada por HuggingFace y no incluye valores de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, ni antes ni despues de la poda. Tampoco se ofrece comparacion con el BLOOM-1b7 original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,9 GB en fp32, 3,4 GB en fp16/bf16, 1,7 GB en int8 y ~0,9 GB en int4 (cifras teoricas segun los 1.722 millones de parametros; no confirmadas por el autor).
- Importante: al ser una poda no estructurada, el checkpoint denso ocupa lo mismo que el modelo sin podar. La reduccion de memoria solo se logra si se aplica una cuantizacion posterior o se utilizan kernels de esparcidad, que `transformers` no explota por defecto.
- GPU recomendadas: cabe sin problemas en GPU de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090 o superiores en fp16. Para fp32 conviene una GPU con al menos 8 GB libres. En entornos de servidor, cualquier A100, H100 o L4 es suficiente y sobra capacidad.
- Opciones de despliegue: `transformers` (via `AutoModelForCausalLM`), `text-generation-inference` (el repo incluye la etiqueta `text-generation-inference`) y endpoints compatibles. `vLLM` podria cargarlo, pero no aprovechara la esparcidad. No hay pesos GGUF publicados, por lo que `llama.cpp` y `Ollama` requeririan una conversion manual. No se documenta soporte de TGI ni de kernels especificos para Wanda.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Poda / compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bloom-1b7_wanda_0.3 | 1,72B | no disponible (base 2048) | Wanda no estructurada, 0.3 | no disponible | HuggingFace, 0 descargas |
| BLOOM-1b7 (base) | 1,72B | 2048 | ninguna | BigScience BLOOM RAIL 1.0 | HuggingFace, ampliamente usado |
| TinyLlama-1.1B | 1,1B | 2048 | ninguna | Apache 2.0 | HuggingFace, muy popular |
| Qwen2.5-1.5B | 1,5B | 32768 | ninguna | Apache 2.0 (variantes) | HuggingFace, ampliamente usado |

La comparacion con modelos densos de tamano similar es desfavorable en terminos de mantenimiento, licencia y soporte, dado que este checkpoint no documenta licencia ni resultados. Su unico diferenciador es la propia tecnica de poda aplicada.

## Limitaciones y advertencias

- Model card sin informacion util: no hay datos de entrenamiento, evaluacion ni hiperparametros de poda, lo que impide reproducir o auditar el resultado.
- Licencia no especificada: el modelo base BLOOM-1b7 se publica bajo BigScience BLOOM RAIL 1.0, que impone restricciones de uso (incluida la clausula de uso comercial y la obligacion de compartir la licencia). Al no declararse licencia en este derivado, existe incertidumbre legal para uso comercial.
- Riesgo de degradacion por poda: eliminar el 30 por ciento de los pesos sin ajuste posterior suele aumentar la perplejidad y empeorar tareas de razonamiento, hecho que el autor no cuantifica.
- La esparcidad no estructurada no reduce el uso de memoria ni acelera la inferencia en frameworks estandar; el beneficio practico es nulo sin kernels dedicados.
- Sesgos conocidos del modelo base: BLOOM-1b7 presenta sesgos de genero, raza y religion documentados por BigScience; el proceso de poda no los corrige y puede amplificarlos.
- Riesgo de alucinacion: inherente a un modelo de lenguaje de 1,7B sin ajuste por instrucciones, agravado por la posible perdida de calidad tras la poda.
- Sin soporte de chat ni de instrucciones: no dispone de plantilla conversacional, por lo que no es adecuado como asistente directo.
- Idiomas y contexto no verificados en este checkpoint; las capacidades multilingues del BLOOM original podrian no mantenerse tras la poda.
- Advertencia para produccion: 0 descargas y 0 likes, sin validacion de la comunidad; no deberia desplegarse en sistemas reales sin una evaluacion propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rajeshwari-Chanda/bloom-1b7_wanda_0.3
- Modelo base BLOOM-1b7: https://huggingface.co/bigscience/bloom-1b7
- Paper de BLOOM: https://arxiv.org/abs/2211.05100
- Paper de Wanda (referencia del metodo de poda indicado en el nombre del modelo): https://arxiv.org/abs/2306.11695
- Paper citado en las etiquetas del repo (calculadora de impacto de carbono, ajeno al modelo): https://arxiv.org/abs/1910.09700
