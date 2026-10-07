# OthmaneBen/llama31-8b-t2-extract-flat-s42

## Resumen

El modelo `OthmaneBen/llama31-8b-t2-extract-flat-s42` es un adaptador PEFT de tipo DoRA (Weight-Decomposed Low-Rank Adaptation), con rango 48 y semilla 42, entrenado sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos adicionales que modifican el comportamiento del modelo base para una tarea concreta denominada "T2 extraction flat" en la propia nomenclatura del autor. Lo publica el usuario OthmaneBen y se distribuye bajo la licencia Llama 3.1 Community License, con los pesos en formato safetensors y una librería declarada de PEFT.

El adaptador se publica como artefacto asociado a una submission a Entropy con identificador `entropy-4582293` y título "Fine-Tuning Shifts Form Before Competence". La model card no incluye configuración de entrenamiento, composición del dataset ni métricas de evaluación: remite al repositorio de código del paper correspondiente, que no se enlaza desde la ficha. El repositorio ocupa 0,5 GB y, en el momento de la consulta, registra 0 descargas y 0 "likes".

Su relevancia es acotada y experimental. Al ser un adaptador de tarea sobre un modelo de 8 000 millones de parámetros, el interés principal está en reproducir el experimento del paper, en comparar el efecto del ajuste fino en la "forma" del modelo antes de que aparezca competencia medible, o en reutilizar el adaptador como punto de partida para tareas de extracción estructurada. No hay evidencia publicada de que supere al modelo base en capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (QDoRA segun la nomenclatura del autor) sobre transformer decoder-only Llama 3.1 8B Instruct |
| Parametros totales | 8 030 millones en el modelo base; adaptador de rango 48 (recuento exacto no disponible) |
| Parametros activos | no disponible (adaptador DoRA r=48; el repositorio ocupa 0,5 GB) |
| Longitud de contexto | 128 000 tokens heredados del modelo base; no se especifica en la ficha del adaptador |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizacion int8/int4 y formatos GGUF, AWQ y GPTQ mediante herramientas externas |
| Idiomas soportados | no disponible en la ficha; el modelo base declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea DoRA, una variante de LoRA que descompone cada matriz de pesos preentrenada en un componente de magnitud y un componente de direccion, y aplica la actualizacion de bajo rango unicamente sobre la direccion. Frente a LoRA clasico, este esquema suele mejorar la estabilidad del ajuste y acercar el comportamiento del adaptador al de un fine-tuning completo con un numero reducido de parametros entrenables. El autor etiqueta la variante como QDoRA, lo que sugiere una version cuantizada de DoRA, aunque la ficha no detalla el esquema de cuantizacion empleado durante el entrenamiento. El rango es 48 y la semilla de inicializacion es 42, dato relevante para reproducibilidad del experimento.

No se publican en la model card ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias sobre el adaptador. Tampoco se especifica que modulos lineales del transformer reciben el adaptador (atencion, MLP o ambos) ni el valor de alpha o dropout. La unica referencia disponible apunta al repositorio de codigo del paper "Fine-Tuning Shifts Form Before Competence" para obtener la configuracion de entrenamiento, el pipeline de datos y los artefactos de evaluacion. La tarea objetivo, "T2 extraction flat", no se describe en la ficha, por lo que su definicion exacta (esquema, dominio, formato de salida) queda fuera de la informacion proporcionada.

## Capacidades

- Generacion de texto y seguimiento de instrucciones heredados del modelo base Llama 3.1 8B Instruct.
- Extraccion estructurada para la tarea "T2 extraction flat", presumiblemente orientada a producir salidas planas o aplanadas a partir de una entrada, segun la nomenclatura del autor. La definicion exacta no esta disponible.
- Razonamiento multi-paso y generacion de codigo heredados del modelo base, aunque el adaptador puede degradarlos al estar especializado en una unica tarea.
- Soporte de tool calling y function calling: no confirmado para el adaptador; el modelo base lo soporta de forma nativa.
- Capacidades de agente: no documentadas para este adaptador.
- Multilingue: no documentado; el modelo base cubre ocho idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

Advertencia importante: al tratarse de un adaptador de tarea, las capacidades especializadas se limitan a aquello para lo que fue entrenado, y no hay evaluacion publicada que cuantifique la conservacion del resto de habilidades del modelo base.

## Casos de uso

- Extraccion de campos estructurados en documentos: aplicar el adaptador sobre Llama 3.1 8B Instruct para convertir texto no estructurado (contratos, facturas, informes) en un registro plano de campos clave, aprovechando la especializacion de la tarea T2 y el contexto de 128 000 tokens del modelo base.
- Preprocesamiento en pipelines de datos: usar el adaptador como etapa de normalizacion que transforma entradas heterogeneas en un esquema tabular antes de cargarlas en un almacen analitico o un dataframe.
- Investigacion sobre dinamica de fine-tuning: reproducir el experimento del paper "Fine-Tuning Shifts Form Before Competence" comparando este adaptador (semilla 42, rango 48) con otras semillas y rangos para estudiar como cambia la representacion interna antes de que aparezca mejora medible en la tarea.
- Aprendizaje por transferencia: servir como inicializacion para un adaptador posterior en una tarea de extraccion relacionada, reduciendo el coste de entrenamiento respecto a partir del modelo base sin adaptar.
- Prototipado rapido de servicios de extraccion: desplegar el adaptador con vLLM o TGI junto al modelo base para validar un producto de extraccion con un coste de GPU moderado (una sola GPU de 24 GB en fp16 con contexto corto).
- Generacion de conjuntos de datos sinteticos etiquetados: emplear el adaptador para anotar automaticamente corpus sin etiquetar y luego filtrar manualmente, siempre que se valide la calidad de la extraccion en el dominio concreto.
- Evaluacion comparativa de metodos PEFT: incluir este adaptador como linea base DoRA frente a LoRA clasico en experimentos internos de ajuste eficiente de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de la propia tarea "T2 extraction flat", y unicamente remite a los artefactos de evaluacion del repositorio de codigo del paper, que no se enlaza. No se debe asumir ningun nivel de rendimiento sin consultar dicha fuente.

## Requisitos de hardware

- VRAM del adaptador: despreciable en terminos relativos; el repositorio completo ocupa 0,5 GB y los pesos del adaptador se cargan junto al modelo base, anadiendo una sobrecarga marginal.
- Modelo base en fp16/bf16: aproximadamente 16 GB de pesos, mas cache KV. Requiere GPU de 24 GB o superior para contextos cortos (RTX 4090, L40S, A100 40 GB, H100).
- Modelo base en int8: alrededor de 8-9 GB de pesos. Cabe en RTX 3080/3090, RTX 4070 Ti Super y GPUs de 12-16 GB con contexto moderado.
- Modelo base en int4 (por ejemplo GGUF Q4_K_M): aproximadamente 4,5-5 GB de pesos. Cabe en GPU de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3070) siempre que se limite la longitud de contexto.
- Despliegue: Transformers con PEFT para uso directo del adaptador; vLLM y TGI admiten adaptadores LoRA/DoRA sobre el modelo base; llama.cpp y Ollama requieren convertir o fusionar el adaptador con el modelo base antes de cargarlo.
- Fusion de pesos: al ser un adaptador pequeno, puede fusionarse con Llama 3.1 8B Instruct para simplificar el despliegue, a costa de perder la capacidad de descargarlo dinamicamente.
- Latencia y throughput: no disponibles. Dependen enteramente del backend, la cuantizacion, el hardware y la longitud de contexto; no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia |
|---|---|---|---|---|
| OthmaneBen/llama31-8b-t2-extract-flat-s42 | 8 000 M (base) + adaptador DoRA r=48 | 128 000 tokens (heredado) | Adaptador de tarea experimental | Llama 3.1 Community License |
| meta-llama/Llama-3.1-8B-Instruct | 8 000 M | 128 000 tokens | Modelo generalista con ajuste por instrucciones | Llama 3.1 Community License |
| Mistral-7B-Instruct-v0.3 | 7 000 M | 32 000 tokens | Modelo generalista con ajuste por instrucciones | Apache 2.0 |
| Qwen2.5-7B-Instruct | 7 000 M | 128 000 tokens | Modelo generalista con ajuste por instrucciones | Apache 2.0 |

La comparacion directa con modelos generalistas no es homogenea: este artefacto es un adaptador de tarea sobre Llama 3.1 8B Instruct y no un modelo autonomo. Frente a su propio modelo base, la unica diferencia esperada es el comportamiento en la tarea T2, sin datos publicados que cuantifiquen la mejora ni el posible deterioro en otras capacidades. Frente a Mistral 7B Instruct v0.3 y Qwen2.5 7B Instruct, la ventaja de estos ultimos es su licencia Apache 2.0 y su naturaleza de modelo completo, que simplifica el despliegue; no se dispone de comparativas de rendimiento para establecer cual es superior en extraccion estructurada en este caso concreto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al heredar el modelo base, es probable que arrastre los sesgos de Llama 3.1 8B Instruct, pero no hay analisis especifico para este adaptador.
- Riesgo de alucinacion: elevado en tareas de extraccion, donde el modelo puede generar campos que no aparecen en el texto de entrada. Se recomienda validacion posterior con esquemas estrictos (JSON Schema, validadores de tipos) y umbrales de confianza.
- Rendimiento fuera de dominio: al ser un adaptador entrenado para una tarea concreta sin datos de evaluacion publicados, se desconoce como se comporta ante dominios, idiomas o formatos distintos de los usados en el entrenamiento.
- Degradacion de capacidades generales: no se ha medido el impacto del adaptador sobre el resto de habilidades del modelo base. Si se despliega con el adaptador activo de forma permanente, pueden aparecer regresiones en conversacion, codigo o matematicas.
- Contexto: aunque el modelo base admite 128 000 tokens, no hay datos sobre como se comporta el adaptador con entradas largas; es posible que el entrenamiento se haya realizado con secuencias mucho mas cortas.
- Idiomas: no declarados para el adaptador. Un adaptador entrenado mayoritariamente en ingles puede degradar el rendimiento en castellano u otros idiomas.
- Licencia: se hereda la Llama 3.1 Community License, con las restricciones habituales de la familia Llama (clausulas de uso aceptable, obligaciones de atribucion y condiciones especificas para despliegues a gran escala). Es imprescindible revisar los terminos antes de un uso comercial.
- Madurez: el repositorio registra 0 descargas y 0 "likes", sin pipeline declarado ni documentacion de entrenamiento. No es un artefacto listo para produccion sin validacion previa.
- Trazabilidad: la model card remite a un repositorio de codigo del paper que no se enlaza, lo que dificulta la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/OthmaneBen/llama31-8b-t2-extract-flat-s42
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Submission a Entropy: identificador `entropy-4582293`, titulo "Fine-Tuning Shifts Form Before Competence". No se proporciona URL directa en la informacion disponible.
- Repositorio de codigo del paper: mencionado en la model card pero sin enlace disponible.
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, al paper ni al autor; los resultados devueltos no guardan relacion con el artefacto.
