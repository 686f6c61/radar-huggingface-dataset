# KexuanShi/sft_gemma2_2b_vocabdrop_a095

## Resumen

KexuanShi/sft_gemma2_2b_vocabdrop_a095 es un ajuste fino supervisado (SFT) de un modelo de la familia Gemma 2 de aproximadamente 2.600 millones de parámetros, publicado por el usuario KexuanShi en HuggingFace. El identificador del repositorio y sus etiquetas (gemma2, sft, trl, generated_from_trainer, hf_jobs) indican que se partió de una variante Gemma 2 2B y que el entrenamiento se ejecutó con la librería TRL de HuggingFace, probablemente en la infraestructura de trabajos gestionados de HuggingFace. La model card, sin embargo, deja el campo del modelo base como "None" y las secciones de procedimiento de entrenamiento están vacías, por lo que la procedencia exacta y la receta de ajuste no están documentadas.

El sufijo "vocabdrop_a095" apunta a la aplicación de alguna técnica de descarte o reducción de vocabulario con un hiperparámetro de valor 0,95, pero el repositorio no describe el método, el conjunto de datos ni los hiperparámetros empleados. Los pesos reales, según los safetensors publicados, suman 2.614.341.888 parámetros y el repositorio ocupa 5,3 GB.

Se trata, en consecuencia, de un checkpoint de investigación sin benchmarks publicados, sin licencia declarada y con cero descargas registradas. Su interés es acotado: sirve como artefacto de experimentación reproducible con TRL y como posible punto de partida para estudiar el efecto de técnicas de manipulación de vocabulario sobre un modelo Gemma 2 pequeño, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Gemma 2 (inferido del identificador y de las etiquetas del repositorio; la model card no declara el modelo base) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no declarada en la model card; el Gemma 2 2B original soporta 8.192 tokens, pero no se confirma que se conserve) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precision completa; admite cuantizacion posterior con herramientas estandar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el marcador "licence: license" sin contenido; no se puede asumir la licencia de Gemma) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 5,3 GB |
| Libreria de inferencia | transformers |
| Etiquetas de despliegue | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La model card no describe la arquitectura. Por el identificador (gemma2_2b) y la etiqueta gemma2 se deduce que el modelo parte de un transformer decoder-only de la familia Gemma 2 en su variante de 2B, con el tokenizador asociado a esa familia. El número de parámetros publicado (2.614.341.888) es coherente con ese tramo de tamaño y no incluye parámetros adicionales de adaptadores, ya que no hay indicios de que se hayan fusionado módulos LoRA distintos de los pesos base.

Respecto al entrenamiento, lo único verificable es lo que declara el repositorio: se trata de un ajuste fino supervisado (SFT) realizado con TRL en su versión 1.13.0, sobre Transformers 5.17.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.23.2. No se especifican el dataset, el número de tokens de entrenamiento, la composición de los datos, la existencia de fases de RLHF o DPO, ni la técnica concreta de "vocabdrop" a la que alude el nombre del modelo. Tampoco se documenta si hubo modificaciones en la matriz de embeddings, algo que sería esperable si realmente se aplicó un descarte de vocabulario, y que afectaría a la compatibilidad del tokenizador con el modelo original.

## Capacidades

- Generacion de texto conversacional: la model card incluye un ejemplo de uso con el pipeline de text-generation y un formato de mensajes con rol de usuario, lo que indica que el ajuste se orientó a diálogo instructivo.
- Razonamiento y conocimiento general: no disponible; no hay evaluaciones publicadas que confirmen que se conservan las capacidades del Gemma 2 2B original.
- Generacion de codigo y matematicas: no disponible; no se aportan benchmarks ni ejemplos.
- Tool calling / function calling: no disponible; no se documenta plantilla de herramientas ni formato estructurado.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara la lista de idiomas soportados, aunque el Gemma 2 base es multilingue.
- Capacidades especiales (vision, audio, modo de razonamiento explicito): no disponibles.
- Modificacion del vocabulario: el nombre del modelo sugiere una alteracion del vocabulario con un parametro 0,95, pero el repositorio no la describe ni indica como afecta al tokenizador.

## Casos de uso

- Experimentacion academica con poda de vocabulario: el checkpoint permite reproducir y comparar el efecto de una tecnica de "vocabdrop" (posiblemente con factor 0,95) frente al Gemma 2 2B sin modificar, siempre que se reconstruya el tokenizador empleado.
- Referencia de pipeline SFT con TRL: sirve como ejemplo de extremo a extremo de un trabajo de ajuste supervisado lanzado desde la infraestructura de HuggingFace Jobs, util para equipos que quieran replicar el flujo de trabajo.
- Ajuste incremental sobre dominio propio: al ser un modelo de 2,6B parámetros y 5,3 GB en precision completa, se puede continuar el entrenamiento con LoRA o QLoRA en una unica GPU consumer para tareas concretas de generacion de texto.
- Evaluacion de degradacion por ajuste: util como caso de estudio para medir cuanto se pierde en conocimiento general y en capacidades multilingues tras un SFT de proposito desconocido y un posible recorte de vocabulario.
- Prototipado de asistentes conversacionales de bajo coste: si conserva el comportamiento del Gemma 2 2B base, puede desplegarse en cuantizacion de 4 bits para demos de chat con presupuesto de VRAM muy reducido.
- Generacion de texto por lotes en local: con llama.cpp o transformers en CPU/GPU de gama media se puede usar para tareas de resumen, reescritura o clasificacion generativa en entornos sin acceso a APIs externas.
- Comparativa de tokenizadores: dado el sufijo vocabdrop, resulta apropiado para estudiar como un vocabulario alterado afecta a la longitud efectiva de las secuencias y al coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 10,5 GB en fp32, 5,2 GB en bf16/fp16, 2,6 GB en int8 y entre 1,4 y 1,6 GB en cuantizacion de 4 bits (los calculos son estimaciones a partir de los 2.614.341.888 parametros publicados; hay que sumar el espacio de activaciones y de cache KV).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio en bf16 con lotes grandes; una RTX 4090 de 24 GB es suficiente para inferencia en bf16 con contexto moderado.
- GPU consumer: si, cabe en tarjetas de 8 GB o mas usando cuantizacion de 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En bf16 sin cuantizar requiere al menos 8-10 GB de VRAM libre, por lo que encaja en RTX 3080/4080/4090.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (etiqueta presente en el repositorio), vLLM, y llama.cpp u Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia estructural, un modelo denso de 2,6B en 4 bits puede superar holgadamente los 50 tokens por segundo en una GPU consumer moderna, pero esta cifra no esta verificada para este checkpoint.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus fichas publicas y no han sido verificados en la informacion proporcionada; se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| KexuanShi/sft_gemma2_2b_vocabdrop_a095 | 2,61B | no disponible | no disponible | HuggingFace, 0 descargas | no |
| google/gemma-2-2b | ~2,6B | 8.192 tokens | Gemma Terms of Use (uso comercial con restricciones) | HuggingFace | si |
| google/gemma-2-2b-it | ~2,6B | 8.192 tokens | Gemma Terms of Use | HuggingFace | si |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Apache 2.0 | HuggingFace | si |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2B | 128.000 tokens | Llama 3.2 Community License | HuggingFace | si |

Frente a estas alternativas, el modelo aqui descrito no aporta cifras de rendimiento ni condiciones de uso claras, por lo que en un contexto de produccion no es equiparable a los modelos oficiales de su misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no declara modelo base, dataset, hiperparametros ni metodo de entrenamiento, lo que impide evaluar que se ha modificado respecto al Gemma 2 2B original.
- Licencia no establecida: el campo aparece como "licence: license" sin contenido. No se puede asumir que herede los terminos de uso de Gemma, y por tanto no hay base legal clara para un uso comercial.
- Riesgo de incompatibilidad de tokenizador: si el ajuste "vocabdrop" altero el vocabulario o las dimensiones de la matriz de embeddings, el tokenizador del Gemma 2 original podria no ser valido, lo que romperia la carga estandar con transformers.
- Riesgo elevado de alucinacion: no hay evaluaciones que confirmen fidelidad factual; todo SFT sobre datos no documentados puede degradar el conocimiento general del modelo base.
- Idiomas no declarados: se desconoce si el multilingüismo del Gemma 2 base se ha conservado o se ha visto reducido por el ajuste.
- Contexto no confirmado: aunque el Gemma 2 2B original soporta 8.192 tokens, no hay confirmacion de que esta variante mantenga esa ventana.
- Cero validacion por la comunidad: 0 descargas y 0 "likes" en la fecha de consulta, sin issues ni discusiones que aporten evidencia de funcionamiento.
- No apto para produccion sin evaluacion previa: al no existir benchmarks ni auditoria de sesgos, su uso en sistemas reales exige una bateria de pruebas propia.
- Fecha de publicacion atipica: los metadatos indican creacion el 2026-10-05, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KexuanShi/sft_gemma2_2b_vocabdrop_a095
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de TRL (SFTTrainer): https://huggingface.co/docs/trl
- Modelo base de referencia (Gemma 2 2B, no confirmado): https://huggingface.co/google/gemma-2-2b
- Pagina de trabajos gestionados de HuggingFace: https://huggingface.co/docs/huggingface_hub/guides/jobs
- Paper o blog especifico del modelo: no disponible
- Demo o espacio asociado: no disponible
