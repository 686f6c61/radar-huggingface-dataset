# AlinaGonch/granite41-8b-squad-ratio-0.10-seed-44

## Resumen

El modelo `AlinaGonch/granite41-8b-squad-ratio-0.10-seed-44` es un fine-tuning experimental del modelo Granite 4.1 8B de IBM, creado por Alina Hancharova (usuario AlinaGonch) como parte de un estudio sobre el equilibrio óptimo de muestras sin respuesta en el dataset SQuAD 2.0. El nombre del repositorio indica que se ha ajustado con una proporción de 0.10 de preguntas sin respuesta (unanswerable) y una semilla aleatoria 44, aunque no se aportan más detalles en la model card.

La ficha técnica del Hub está prácticamente vacía: solo se indica que es un modelo de la librería transformers, con formato safetensors y un tamaño de repositorio de 0.2 GB. No se especifican arquitectura, licencia, idiomas ni datos de entrenamiento. El modelo parece ser parte de una serie de experimentos destinados a analizar cómo la proporción de muestras sin respuesta afecta al rendimiento en tareas de comprensión lectora y respuesta a preguntas, pero no se ha publicado documentación técnica ni resultados.

Dada la escasez de información, esta ficha se basa en el contenido disponible en el Hub y en datos inferidos del nombre y del contexto de la autora. Todos los campos no confirmados se indican explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder, basado en Granite 4.1 8B) |
| Parametros totales | no disponible (el nombre sugiere 8B, pero el tamano del repo de 0.2 GB indica que podria ser un adaptador o una version cuantizada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Granite 4.1 8B soporta 131K tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (el formato safetensors no implica cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base es Apache 2.0, pero no se confirma para este derivado) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura especifica de este modelo. El nombre sugiere que parte del modelo Granite 4.1 8B, un transformer denso de 8 mil millones de parametros con soporte para 131K tokens de contexto, desarrollado por IBM. Sin embargo, el tamano del repositorio (0.2 GB) es muy inferior al de los pesos completos de un modelo de 8B en fp16 (que ocuparia unos 16 GB), lo que indica que podria tratarse de un adaptador LoRA, un fine-tuning parcial o una version cuantizada agresiva. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, el procedimiento de ajuste (si se uso RLHF, DPO, etc.) ni las hiperparametros. La autora menciona en su perfil que realiza experimentos con SQuAD 2.0 para estudiar la proporcion optima de muestras sin respuesta, por lo que se infiere que el entrenamiento se ha realizado sobre este dataset, pero no hay confirmacion.

## Capacidades

No se han documentado capacidades especificas para este modelo. Dado que es un fine-tuning experimental sobre SQuAD 2.0, se esperaria que mantuviera las capacidades generales del modelo base (generacion de texto, razonamiento, codigo, tool calling, etc.), pero no hay evidencia que lo confirme. La unica informacion disponible es que el repositorio esta etiquetado como "endpoints_compatible", lo que sugiere que puede desplegarse en la infraestructura de inferencia de Hugging Face. No se ha publicado ninguna demostracion ni ejemplo de uso.

## Casos de uso

Dado el caracter experimental y la falta de documentacion, los casos de uso son limitados y deben considerarse con precaucion:

- Investigacion academica sobre SQuAD 2.0: el modelo puede utilizarse para estudiar el efecto de la proporcion de muestras sin respuesta en el rendimiento de modelos de comprension lectora, comparandolo con otros ratios (0.30, etc.) publicados por la misma autora.
- Evaluacion comparativa de fine-tuning: puede servir como punto de referencia para experimentos de ajuste fino en tareas de respuesta a preguntas con datos parcialmente no respondibles.
- Pruebas de compatibilidad con pipelines de transformers: al estar etiquetado como "endpoints_compatible", puede desplegarse en entornos de inferencia gestionada para validar su comportamiento, aunque no se garantiza su calidad.
- Analisis de sesgos en datasets sinteticos: el modelo podria usarse para explorar como la presencia de preguntas sin respuesta afecta a la calibracion y la tendencia a alucinar.
- Desarrollo de prototipos de sistemas de QA: si se confirma que funciona correctamente, podria integrarse en sistemas de respuesta a preguntas sobre dominios especificos, pero se requiere validacion previa.
- Replicacion de experimentos: la autora ha publicado varios modelos con diferentes ratios y semillas, lo que permite reproducir y extender sus estudios sobre el equilibrio de muestras en SQuAD 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion. El modelo no presenta metricas de rendimiento en su model card ni en el repositorio.

## Requisitos de hardware

Dado que no se conocen los parametros exactos ni el formato de los pesos, los requisitos son inciertos. Si se tratara de un adaptador LoRA sobre Granite 4.1 8B, la inferencia requeriria cargar el modelo base (aproximadamente 16 GB en fp16) mas el adaptador, lo que necesitaria una GPU con al menos 20 GB de VRAM. Si fuera una version cuantizada a 4 bits, podria caber en una GPU de 8-10 GB. No se dispone de informacion sobre latencia ni throughput.

- VRAM estimada: entre 8 GB (si es cuantizado a 4 bits) y 20 GB (si se carga el modelo base completo en fp16), segun la configuracion.
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100, dependiendo del formato real.
- Compatibilidad con GPUs de consumo: posible si se utiliza cuantizacion, pero no confirmado.
- Opciones de despliegue: transformers, vLLM, TGI, Ollama, llama.cpp (si se convierte a GGUF), aunque no hay instrucciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que no hay informacion sobre el rendimiento real de este modelo, la comparativa se limita al modelo base del que deriva y a otros fine-tunings de la misma autora.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AlinaGonch/granite41-8b-squad-ratio-0.10-seed-44 | no disponible (presumiblemente 8B) | no disponible | no disponible | Fine-tuning experimental sobre SQuAD 2.0 con ratio 0.10 |
| AlinaGonch/granite41-8b-squad-ratio-0.30-r4 | no disponible (presumiblemente 8B) | no disponible | no disponible | Fine-tuning experimental sobre SQuAD 2.0 con ratio 0.30 |
| IBM Granite 4.1 8B (base) | 8B | 131K | Apache 2.0 | Modelo base de IBM con soporte para tool calling, RAG, codigo y 12 idiomas |

La comparativa con otros modelos de la misma categoria (por ejemplo, Llama 3.1 8B, Mistral 7B) no es posible sin datos de rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es una plantilla generica sin informacion tecnica, lo que impide conocer la arquitectura, el entrenamiento y las capacidades reales.
- Riesgo de alucinacion y errores: al ser un fine-tuning experimental sin evaluacion publicada, no se garantiza la calidad de las respuestas, especialmente en preguntas sin respuesta.
- Sesgos desconocidos: no se ha realizado ninguna auditoria de sesgos ni se han documentado limitaciones sociotecnicas.
- Licencia incierta: aunque el modelo base es Apache 2.0, la licencia de este derivado no se especifica, lo que dificulta su uso comercial.
- Tamano del repositorio sospechoso: 0.2 GB es demasiado pequeno para un modelo de 8B completo, lo que sugiere que podria ser un adaptador o una cuantizacion extrema, pero no se confirma.
- Fecha de creacion futura: el modelo fue creado en agosto de 2026 (segun el Hub), lo que podria indicar un error en la fecha o un modelo reciente no validado.
- Sin soporte: al ser un experimento personal de una investigadora, no hay canal de soporte ni mantenimiento garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlinaGonch/granite41-8b-squad-ratio-0.10-seed-44
- Perfil de la autora en Hugging Face: https://huggingface.co/AlinaGonch
- Documentacion del modelo base Granite 4.1: https://www.ibm.com/granite/docs/models/granite4-1
- Articulo sobre Granite 4.1 8B en OpenModels: https://www.openmodels.run/models/granite-4-1-8b
- Referencia al paper de Lacoste et al. (2019) sobre emisiones de carbono (citado en la model card): https://arxiv.org/abs/1910.09700
