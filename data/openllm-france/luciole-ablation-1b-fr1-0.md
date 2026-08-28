# OpenLLM-France/luciole-ablation-1B-fr1.0

## Resumen

El modelo **luciole-ablation-1B-fr1.0** es un modelo de lenguaje autorregresivo de aproximadamente 1.235 millones de parámetros, desarrollado por LINAGORA en el marco del proyecto OpenLLM France. Forma parte de una serie de modelos de ablación diseñados para estudiar el impacto de las proporciones de idiomas (francés e inglés) en el rendimiento multilingüe, tal y como se describe en el artículo científico *EIFFEL: a novel benchmark to measure bias of English heavy training on French idiomatic expressions*.

Este modelo concreto está entrenado exclusivamente con datos en francés (100 % francés, como indica el sufijo `fr1.0`), sobre una muestra aleatoria del subconjunto francés del dataset FineWeb-2. Se trata de un modelo de preentrenamiento puro, sin fine-tuning posterior, pensado únicamente para fines de investigación: análisis de sesgos lingüísticos, interpretabilidad y comparación entre variantes con distintas proporciones de idiomas. Su arquitectura está basada en Llama (decoder-only transformer) y su ventana de contexto es de 4096 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder-only transformer) |
| Parametros totales | 1.235.290.112 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (el ejemplo de uso sugiere carga en 4 bits con `load_in_4bit`, pero no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Frances (unicamente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer decoder-only basada en Llama, aunque la model card no especifica la variante exacta (número de capas, dimensiones de atención, etc.). El tokenizer empleado es el tokenizer Luciole, con un vocabulario de 128.000 tokens, entrenado específicamente para la serie de modelos Luciole.

El entrenamiento se realizó sobre una muestra aleatoria del subconjunto francés del dataset FineWeb-2, con un total de aproximadamente 100.000 millones de tokens (99.992.207.360 tokens según los datos de progreso). El proceso constó de 23.840 pasos de entrenamiento con una longitud de contexto de 4096 tokens. No se aplicaron técnicas de alineación como RLHF o DPO; se trata de un preentrenamiento puro sobre datos web sin filtrar (únicamente se eliminaron dominios que bloqueaban el scraping mediante robots.txt). Los recursos computacionales fueron proporcionados por GENCI en el centro IDRIS, bajo la concesión 2025-AS011016445.

## Capacidades

- Generacion de texto en frances: el modelo puede completar frases y generar texto coherente en frances, como se muestra en el ejemplo de la model card con preguntas sobre capitales.
- Razonamiento basico de pocos ejemplos (few-shot): el modelo responde correctamente a preguntas de conocimiento general cuando se le proporciona un ejemplo previo (1-shot).
- Modelo de preentrenamiento: no ha sido sometido a fine-tuning instructivo, por lo que no sigue instrucciones complejas ni mantiene conversaciones estructuradas.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades de vision, audio ni multimodalidad.
- Multilingue: no, exclusivamente frances (aunque la familia de modelos incluye variantes bilingues, este modelo concreto es monolingue frances).

## Casos de uso

- Investigacion academica sobre sesgos linguisticos: el modelo sirve para estudiar como el entrenamiento exclusivamente en frances afecta al rendimiento en expresiones idiomaticas francesas, comparandolo con variantes entrenadas con mezclas de ingles y frances.
- Analisis de interpretabilidad: los checkpoints intermedios (guardados cada 1.000 pasos) permiten investigar como evolucionan las representaciones internas durante el entrenamiento.
- Estudio de proporciones de idiomas: al comparar este modelo con sus equivalentes `en1.0`, `fr0.75-en0.25`, etc., se puede medir el impacto de la proporcion de datos en el rendimiento final.
- Evaluacion de metricas de sesgo: sirve como base para validar el benchmark EIFFEL, que mide el sesgo inducido por el entrenamiento mayoritariamente en ingles sobre expresiones idiomaticas francesas.
- Experimentos de few-shot learning: permite probar la capacidad de aprendizaje en contexto con ejemplos en frances, aunque sin fine-tuning instructivo.
- Pruebas de tokenizacion: al usar el tokenizer Luciole de 128k vocabulario, puede emplearse para evaluar la eficiencia de tokenizacion en frances comparado con otros tokenizers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de metricas (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Dado que el modelo es un artefacto de investigacion para estudios de ablacion, los autores no han priorizado la publicacion de resultados estandarizados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.235 millones de parametros. En precision fp16, el peso ocupa aproximadamente 2,47 GB, por lo que cabe en GPUs con 4 GB de VRAM o mas. Con cuantizacion de 4 bits, el peso se reduce a unos 0,62 GB, permitiendo ejecutarlo en GPUs con 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA RTX 3050, RTX 3060, GTX 1660 Super) puede ejecutar el modelo en fp16. Para cuantizacion de 4 bits, incluso GPUs integradas con 4 GB compartidos podrian ser suficientes.
- Si cabe en consumer GPU: si, es un modelo pequeno que se ejecuta sin problemas en hardware de consumo.
- Opciones de despliegue: el modelo se puede cargar con la libreria `transformers` de HuggingFace, tanto en CPU como en GPU. Tambien es compatible con frameworks de inferencia como vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no hay guias oficiales para ello.
- Latencia y throughput estimados: no se dispone de datos publicados. Para un modelo de 1,2B en una GPU consumer, se puede esperar una velocidad de generacion de decenas de tokens por segundo, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo, por lo que la comparativa se basa en caracteristicas generales. Modelos de tamano similar (~1B parametros) incluyen:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| luciole-ablation-1B-fr1.0 | 1,24B | 4096 | Frances | Apache 2.0 | Investigacion (ablacion) |
| TinyLlama 1.1B | 1,1B | 2048 | Multilingue (principalmente ingles) | Apache 2.0 | Preentrenamiento general |
| SmolLM2-1.7B | 1,7B | 8192 | Multilingue | Apache 2.0 | Preentrenamiento general |
| Qwen2.5-1.5B | 1,5B | 32768 | Multilingue | Apache 2.0 | Preentrenamiento + instruct |

La principal diferencia es que el modelo Luciole esta especificamente disenado para estudios de ablacion linguistica, mientras que los otros son modelos de proposito general con fine-tuning instructivo en algunos casos. No se puede comparar el rendimiento sin datos de benchmarks.

## Limitaciones y advertencias

- Modelo de investigacion: los autores declaran explicitamente que no esta pensado para ser fine-tuneado ni usado en pipelines estandar de LLM. Su unico proposito es el estudio academico.
- Datos sin filtrar: el entrenamiento se realizo sobre datos web sin limpiar (solo se excluyeron dominios con robots.txt restrictivo). El modelo puede haber aprendido contenido danino, sesgado o inapropiado.
- Sesgos linguisticos: al estar entrenado solo en frances, puede presentar sesgos culturales y linguisticos propios de los datos franceses de FineWeb-2.
- Riesgo de alucinacion: como cualquier modelo de lenguaje preentrenado sin fine-tuning, puede generar contenido falso o inventado, especialmente en tareas de conocimiento factual.
- Contexto limitado: 4096 tokens es una ventana relativamente corta para aplicaciones que requieran contexto largo.
- Solo frances: no soporta otros idiomas, lo que limita su uso a tareas monolingues francesas.
- Sin alineacion: no ha pasado por RLHF ni DPO, por lo que no sigue instrucciones de forma fiable ni tiene mecanismos de rechazo de contenido danino.
- No apto para produccion: no se recomienda su uso en entornos reales de atencion al cliente, generacion de codigo u otras aplicaciones comerciales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/OpenLLM-France/luciole-ablation-1B-fr1.0)
- [Articulo cientifico EIFFEL (HAL)](https://hal.science/hal-05619209)
- [Repositorio de entrenamiento Luciole en GitHub](https://github.com/OpenLLM-France/Luciole-Training/tree/main/)
- [Organizacion OpenLLM-France en GitHub](https://github.com/OpenLLM-France/)
- [Sitio web de OpenLLM France](https://openllm-france.fr/en/main-page-en/)
- [Checkpoints intermedios](https://dl.labs.linagora.com/files/models/OpenLLM-France/language_ablation/)
- [Dataset FineWeb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
