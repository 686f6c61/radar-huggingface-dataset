# joamCriff123/zils-lite-l1115d

## Resumen

zils-lite-l1115d es un modelo de decisión (decision-model) publicado por el usuario joamCriff123 en Hugging Face, construido como un fine-tuning del modelo base Qwen/Qwen3.5-0.8B. Forma parte de la familia denominada "d3-lite" y está orientado al "Zils subnet 127 lite pool", un ecosistema de subredes que el autor no documenta en la model card. El modelo se distribuye con licencia Apache-2.0 y un total de 852.985.920 parámetros según los pesos en safetensors.

El modelo se presenta a través de la librería transformers con pipeline de feature-extraction, aunque sus tags incluyen decision-model, lo que sugiere un uso orientado a la toma de decisiones o clasificación más que a la generación de texto pura. El repositorio ocupa 1,7 GB y contiene código personalizado (custom_code), lo que implica que su carga requiere confiar en la implementación incluida en el repositorio.

La relevancia de este modelo es limitada por la escasez de documentación: la model card es mínima, no se publican idiomas soportados, datos de entrenamiento ni resultados de benchmarks. Su interés principal radica en ser un ejemplo de fine-tuning ligero sobre la familia Qwen3.5 y en su posible integración en flujos de decisión automatizada dentro del ecosistema Zils.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); detalles no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica únicamente que el modelo deriva de Qwen/Qwen3.5-0.8B mediante fine-tuning, con arquitectura transformer y pesos en safetensors. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. El tag custom_code sugiere que el repositorio incluye código propio para la definición o carga del modelo, pero no se detalla su función.

No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos. Tampoco se aclara si el fine-tuning conserva las capacidades generativas del modelo base o si las ha reorientado hacia una tarea de decisión específica.

## Capacidades

- El pipeline declarado es feature-extraction, por lo que el modelo puede emplearse para extraer representaciones vectoriales.
- Los tags indican decision-model, lo que apunta a un uso para clasificación o selección de acciones, aunque no se detalla el formato de salida.
- No se confirma soporte de tool calling ni de function calling.
- No se confirma soporte de agentes ni de razonamiento multi-paso.
- No se especifican capacidades multilingües.
- No se documentan modos especiales como thinking mode, visión o audio.
- No se detalla si conserva las capacidades generativas del Qwen3.5-0.8B original.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: al declarar el pipeline feature-extraction, puede emplearse para generar vectores de documentos o consultas y alimentar un índice vectorial, siempre que se valide la calidad de las representaciones.
- Clasificación de decisiones en pipelines internos: el tag decision-model sugiere su uso como clasificador o selector de acciones dentro de un flujo automatizado, por ejemplo para enrutar peticiones.
- Filtrado previo en sistemas de recomendación: las representaciones del modelo pueden usarse para puntuar candidatos antes de un ranking más costoso.
- Prototipado de agentes ligeros: con 853 millones de parámetros, puede desplegarse en entornos con recursos limitados para experimentar con políticas de decisión.
- Integración en el ecosistema Zils subnet 127: el modelo está etiquetado para el "lite pool" de esa subred, por lo que su uso previsto es la participación en ese entorno, cuyas reglas no se documentan.
- Evaluación comparativa de fine-tunings sobre Qwen3.5-0.8B: sirve como referencia para estudiar cómo un ajuste ligero modifica el comportamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y contexto; en la práctica, entre 2 y 3 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB, aunque no se confirman cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) debería poder cargarlo en fp16; para producción, una T4 o L4 es suficiente.
- Cabe en GPU consumer: sí, por su tamaño inferior a 1.000 millones de parámetros.
- Opciones de despliegue: transformers es la vía declarada; al incluir custom_code, es necesario confiar en el código del repositorio. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-l1115d | 852.985.920 | no disponible | Apache-2.0 | Fine-tuning de decisión sobre Qwen3.5-0.8B; documentación mínima |
| Qwen/Qwen3.5-0.8B | ~0,8 B (no confirmado en la información) | no disponible | no disponible en la información | Modelo base; capacidades generativas originales |
| Fine-tunings ligeros de la familia Qwen3.5 | variable | variable | variable | No se dispone de datos concretos de alternativas comparables |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Documentación mínima: no se detallan datos de entrenamiento, idiomas, contexto ni evaluación, lo que impide validar su comportamiento en producción.
- Riesgo de alucinación y de comportamiento impredecible al desconocerse la naturaleza exacta del fine-tuning.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no pueden evaluarse sesgos.
- El tag custom_code implica ejecutar código del autor al cargar el modelo; conviene revisarlo antes de usarlo en entornos sensibles.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar LICENSE y NOTICE para las atribuciones del modelo base.
- No se confirma compatibilidad con herramientas de despliegue estándar ni con cuantizaciones preexistentes.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/joamCriff123/zils-lite-l1115d
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
