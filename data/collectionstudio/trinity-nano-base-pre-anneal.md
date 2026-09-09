# CollectionStudio/Trinity-Nano-Base-Pre-Anneal

## Resumen

Trinity-Nano-Base-Pre-Anneal es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Arcee AI y publicado en HuggingFace por CollectionStudio. Pertenece a la familia Trinity, una serie de modelos de pesos abiertos orientados a entornos empresariales y a entusiastas técnicos. Este checkpoint concreto es la versión base "pre-anneal", es decir, el punto de entrenamiento capturado antes de iniciar el decaimiento de la tasa de aprendizaje sobre una mezcla de datos de alta calidad.

El modelo tiene aproximadamente 6.120 millones de parámetros totales, de los cuales solo 1.000 millones son activos por token, gracias a una arquitectura MoE con 128 expertos, de los que se activan 8 más 1 compartido. Ha sido preentrenado sobre 8,8 billones de tokens (8.8T) en colaboración con Datology, aprovechando el dataset del modelo AFM-4.5B y añadiendo contenido adicional de matemáticas y código. El entrenamiento se realizó en un clúster de 512 GPUs H200 mediante Prime Intellect, usando paralelismo HSDP.

La longitud de contexto es de 4K tokens, un valor modesto para los estándares actuales. Este checkpoint no está pensado para uso directo en chat ni como modelo general; está diseñado para ser afinado en dominios específicos antes de su despliegue. Su relevancia radica en que ofrece una base robusta y relativamente ligera (6B totales, 1B activos) para que desarrolladores e investigadores puedan ajustarla a sus propias tareas sin asumir el coste de preentrenar un modelo desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AfmoeForCausalLM (Mixture of Experts) |
| Parametros totales | 6.120.003.328 |
| Parametros activos | 1.000.000.000 (aprox.) |
| Longitud de contexto | 4K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano, chino |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

Nota: los tipos de cuantizacion no se especifican en la informacion disponible. El repositorio contiene pesos en safetensors con un tamano de 12,3 GB, correspondiente a una precision de 16 bits (FP16/BF16) para los 6.120 millones de parametros.

## Arquitectura y entrenamiento

Trinity-Nano-Base-Pre-Anneal utiliza la arquitectura AfmoeForCausalLM, una variante de transformer con capas de Mixture of Experts. El modelo dispone de 128 expertos en total, de los cuales se activan 8 por token, mas 1 experto compartido que participa siempre. Esto permite que, pese a tener 6.120 millones de parametros en total, cada token solo utilice alrededor de 1.000 millones de parametros, reduciendo el coste computacional de inferencia.

El preentrenamiento se realizo sobre un total de 8,8 billones de tokens, curados en colaboracion con Datology. El dataset parte del utilizado en AFM-4.5B y se le anadio una proporcion significativa de datos de matematicas y codigo. El entrenamiento se ejecuto en un cluster de 512 GPUs H200, gestionado por Prime Intellect, utilizando paralelismo HSDP (Hybrid Sharded Data Parallel). Las tasas de aprendizaje empleadas fueron 0,0002 para el optimizador Adam y 0,001 para Muon.

Este checkpoint es un "pre-anneal", lo que significa que se capturo antes de aplicar el decaimiento de la tasa de aprendizaje sobre una mezcla de datos optimizada para la fase final. Por tanto, no fue expuesto a la mezcla de anneal que contiene proporciones altas de contenido de matematicas y codigo, aunque el modelo si ha visto una cantidad considerable de estos datos en las fases anteriores. Como consecuencia, no ha sido afinado ni instruct-tuned, y no se debe usar directamente para conversacion sin un ajuste posterior.

## Capacidades

- Generacion de texto base: el modelo es capaz de producir texto en los 10 idiomas indicados, pero sin instrucciones ni formato de chat, ya que es un checkpoint de pretraining.
- Razonamiento matematico basico: fue entrenado con una proporcion relevante de datos de matematicas, lo que puede servir como base para tareas de calculo, algebra y logica mediante fine-tuning.
- Generacion de codigo: la inclusion de datos de codigo durante el pretraining permite que el modelo pueda ser afinado para tareas de programacion.
- Preentrenamiento multilingue: soporta ingles, espanol, frances, aleman, italiano, portugues, ruso, arabe, hindi, coreano y chino, aunque el nivel de competencia en cada idioma no se ha medido.
- Arquitectura eficiente: al ser MoE con 1B de parametros activos, ofrece un coste de inferencia relativamente bajo en comparacion con modelos densos de 6B.
- No soporta tool calling, function calling, ni capacidades de agentes en su estado actual, ya que no ha sido afinado para ello.
- No ha sido afinado con tecnicas de RLHF o DPO, por lo que no posee alineacion con preferencias humanas.

## Casos de uso

1. Fine-tuning para dominios especificos: dado que es un modelo base pre-anneal, el caso de uso principal es ajustarlo con datos propios (dataset empresarial, documentos legales o tecnicos). El desarrollador puede entrenar el modelo sobre su dominio y obtener un sistema especializado sin partir de cero.

2. Asistente de codigo personalizado: partiendo del pretraining con datos de codigo y matematicas, el modelo puede afinarse para generar, revisar o completar codigo en un lenguaje de programacion concreto, o adaptarse a las convenciones de una empresa o proyecto. La ventaja de la arquitectura MoE permite una inferencia rapida en entornos de edicion de codigo.

3. Razonamiento matematico para aplicaciones educativas: el modelo puede afinarse sobre problemas de matematicas de secundaria o universitarios para crear tutores virtuales, generadores de ejercicios o sistemas de apoyo en plataformas de aprendizaje. Su base de conocimientos en matematicas puede acelerar la convergencia en estas tareas.

4. Traduccion especializada: gracias a su soporte de 10 idiomas, puede adaptarse con datos paralelos de calidad para traduccion automatica en dominios tecnicos, medicos o legales. El contexto de 4K es suficiente para documentos cortos, aunque habria que segmentar textos de mayor tamano.

5. Analisis de sentimiento y clasificacion de texto: como modelo base, sirve para hacer fine-tuning en tareas de clasificacion de documentos, deteccion de intencion o analisis de opinion en los idiomas soportados. La estructura MoE permite escalar a multiples tareas mediante adaptadores ligeros.

6. Exploracion academica de arquitecturas MoE: el checkpoint esta documentado como "pre-anneal", lo que lo hace util para investigadores que quieren estudiar los efectos de las fases de entrenamiento, el decaimiento de learning rate o el comportamiento de distintos expertos. Puede servir como punto de partida para experimentos de interpretabilidad o ablacion en modelos de este tipo.

7. Prototipos de bajo coste en GPU de consumo: gracias al reducido numero de parametros activos, el modelo puede afinarse en una sola GPU de consumo con cuantizacion, lo que permite experimentar con arquitecturas MoE sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio y la model card no presentan mediciones de MMLU, HumanEval, GSM8K ni otros conjuntos de evaluacion estandar. Tampoco se ha publicado una comparativa con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 6.120 millones de parametros en precision de 16 bits, la carga base ocupa aproximadamente 12,2 GB, por lo que se necesita una GPU con al menos 16 GB de VRAM para inferencia sin cuantizar. Con cuantizacion 4-bit, el consumo puede reducirse a 6-8 GB, permitiendo ejecutarlo en GPUs de 8-10 GB.
- GPU recomendadas: RTX 4090, A100 40GB, H100 80GB o equivalentes. Para fine-tuning, se recomienda una GPU con al menos 60 GB si se quiere entrenar en precision completa, aunque se puede reducir con tecnicas como LoRA o cuantizacion.
- Compatibilidad con GPU de consumo: si, con cuantizacion 4-bit o 8-bit es viable en tarjetas como RTX 3060 12GB, RTX 4070, RTX 4080 o RTX 4090.
- Opciones de despliegue: vLLM, TGI, Transformers (con aceleracion CUDA) y, si se convierten los pesos a GGUF, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Sin embargo, al tener solo 1B de parametros activos, la latencia previsible es significativamente menor que la de un modelo denso de 6B, aunque depende de la implementacion y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Trinity-Nano-Base-Pre-Anneal | 6.12B | 1B | 4K | OpenMDW-1.1 | Base pre-anneal |
| AFM-4.5B | No disponible | No disponible | No disponible | No disponible | Modelo anterior de Arcee |
| Trinity Mini | No disponible | No disponible | No disponible | No disponible | Version intermedia de la familia Trinity |

No se dispone de datos suficientes para realizar una comparativa completa con alternativas de la misma categoria. En la informacion disponible solo se mencionan los modelos AFM-4.5B y Trinity Mini, ambos de Arcee AI, pero no se proporcionan especificaciones ni benchmarks.

## Limitaciones y advertencias

- Checkpoint pre-anneal: no es apto para chat ni para uso generico. Debe afinarse sobre un dominio especifico antes de cualquier despliegue en produccion.
- Longitud de contexto limitada: 4K tokens es una ventana muy corta para tareas que requieran documentos largos, conversaciones extensas o razonamiento multi-step con mucho historial.
- Sin alineacion: no ha pasado por RLHF, DPO ni ninguna tecnica de alineacion, por lo que puede producir respuestas sesgadas o no deseadas si se usa directamente, incluso tras fine-tuning sin una etapa de alineacion.
- Riesgo de alucinacion no evaluado: al no haberse publicado benchmarks, se desconoce su tasa de alucinacion en los idiomas soportados. Es imprescindible validar el modelo en el dominio concreto antes de usarlo.
- Licencia OpenMDW-1.1: la licencia se denomina openmdw-1.1, pero los terminos exactos para uso comercial deben consultarse en el fichero LICENSE del repositorio. No se puede asumir que sea completamente permisiva.
- Evaluacion multilingue ausente: el modelo declara soporte para 10 idiomas, pero no hay datos de calidad por idioma. En idiomas distintos del ingles y el espanol, el rendimiento puede ser inferior al esperado.
- Infraestructura de entrenamiento: el preentrenamiento requiere un cluster de 512 H200, por lo que replicar el proceso no es viable para la mayoria de equipos. Solo el fine-tuning es accesible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/CollectionStudio/Trinity-Nano-Base-Pre-Anneal
- Blog oficial de Arcee AI "The Trinity Manifesto": https://www.arcee.ai/blog/the-trinity-manifesto
- Modelo relacionado: https://huggingface.co/CollectionStudio/Trinity-Nano-Base
- Modelo AFM-4.5B: https://huggingface.co/arcee-ai/AFM-4.5B
- Licencia OpenMDW-1.1: https://huggingface.co/arcee-ai/Trinity-Mini#license
- Inferencia online de Trinity Mini: https://openrouter.ai/arcee-ai/trinity-mini
