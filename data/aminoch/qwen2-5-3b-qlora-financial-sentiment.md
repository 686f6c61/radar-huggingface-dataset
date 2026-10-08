# aminoch/qwen2.5-3b-qlora-financial-sentiment

## Resumen

`aminoch/qwen2.5-3b-qlora-financial-sentiment` es un ajuste fino mediante QLoRA del modelo `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`, publicado por el usuario aminoch en HuggingFace. Se trata de un derivado especializado, segun indica su propio nombre, en analisis de sentimiento en el ambito financiero, construido sobre la familia Qwen2.5 de Alibaba Cloud. El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con aproximadamente 3.000 millones de parametros y una ventana de contexto de 32.768 tokens que puede ampliarse hasta 131.072 mediante extension YaRN.

El problema que aborda es concreto: clasificar y generar etiquetas de sentimiento (positivo, negativo, neutral) sobre texto financiero como noticias, informes o comentarios de mercado. Es relevante porque demuestra un flujo de trabajo reproducible y de bajo coste: partir de un modelo instruct pequeno, cuantizarlo a 4 bits y aplicar un adaptador LoRA con Unsloth, lo que permite entrenar en una unica GPU de consumo y desplegar el resultado con una huella de memoria muy reducida.

Conviene senalar que el repositorio ocupa solo 0,1 GB, lo que es incompatible con los pesos completos de un modelo de 3.000 millones de parametros (unos 6 GB en FP16). Esto sugiere que lo publicado son los pesos del adaptador LoRA y no un modelo fusionado. La model card es minima y no documenta dataset, hiperparametros, epocas ni metricas de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), con RoPE, GQA y activacion SwiGLU |
| Parametros totales | 3.000 millones (heredados del modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con extension YaRN (segun el modelo base) |
| Tipos de cuantizacion | no disponible en el repo publicado; el modelo base se cargo en 4 bits (bitsandbytes) durante el entrenamiento QLoRA |
| Idiomas soportados | en (segun la model card); el modelo base Qwen2.5 declara cobertura de 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; el tamano del repo (0,1 GB) indica adaptador LoRA, no pesos fusionados |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer autoregresivo decoder-only con normalizacion RMSNorm, embeddings rotatorios (RoPE), atencion con consultas agrupadas (GQA) y capas feed-forward con activacion SwiGLU. El modelo base fue instruido por Alibaba Cloud y, segun las fuentes consultadas, incorpora ajuste orientado al uso de herramientas y cobertura multilingue de 29 idiomas, con ampliacion de contexto a 128.000 tokens mediante YaRN.

Respecto al entrenamiento de este ajuste concreto, la informacion disponible es muy limitada. La model card confirma que se partio de la version cuantizada a 4 bits (`bnb-4bit`) del modelo base, que se empleo Unsloth como framework de optimizacion (declarando un entrenamiento "2x mas rapido") y que la libreria de publicacion es transformers con soporte para TRL y text-generation-inference. No se especifican el numero de tokens de entrenamiento, la composicion del dataset financiero, el rango o alpha del adaptador LoRA, la tasa de aprendizaje, las epocas ni si hubo una fase posterior de DPO o RLHF.

## Capacidades

- Generacion de texto y tareas instruct heredadas del modelo base Qwen2.5-3B-Instruct.
- Clasificacion de sentimiento sobre texto financiero (positivo, negativo, neutral), que es el objetivo declarado del ajuste.
- Razonamiento basico y respuesta a instrucciones en formato conversacional.
- Soporte de tool calling y function calling por herencia del modelo base (declarado en la documentacion de Qwen2.5, no verificado en este derivado).
- Capacidad multilingue teorica de 29 idiomas por herencia, aunque la model card solo declara ingles.
- Capacidades de agente y razonamiento multi-paso: no documentadas en este ajuste concreto.
- Capacidades de vision o audio: no disponibles (el modelo base es exclusivamente textual).

## Casos de uso

- Analisis de sentimiento de noticias financieras: el modelo puede recibir titulares o cuerpos de noticia y devolver una etiqueta de sentimiento, integrable en un pipeline de ingestion de datos de mercado.
- Monitorizacion de redes sociales y foros de inversion: clasificacion de comentarios en masa para construir indicadores de sentimiento agregado sobre un valor o sector.
- Procesamiento de informes trimestrales y notas de analistas: extraccion del tono subyacente en fragmentos largos, aprovechando la ventana de contexto ampliable del modelo base.
- Enrutamiento previo en sistemas de alertas: uso del sentimiento como senal para decidir si un evento noticioso requiere revision humana o genera una notificacion automatica.
- Investigacion academica en finanzas computacionales: modelo pequeno y de licencia permisiva para reproducir experimentos de sentiment analysis sin depender de APIs propietarias.
- Prototipado rapido en una unica GPU: al ser un adaptador LoRA sobre un modelo de 3B, permite iterar y desplegar en hardware modesto para validar un producto antes de escalar.
- Clasificacion por lotes en entornos con recursos limitados: gracias a la cuantizacion a 4 bits del modelo base, cabe en GPUs de gama media o incluso en CPU con llama.cpp tras fusionar el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion, metricas de exactitud, F1 ni comparaciones con otros modelos, y la ficha de HuggingFace no registra descargas ni valoraciones que permitan inferir un uso validado.

## Requisitos de hardware

- Pesos del adaptador LoRA: alrededor de 0,1 GB, segun el tamano del repositorio.
- Modelo base en 4 bits (bitsandbytes): aproximadamente 2 GB de VRAM para los pesos, mas overhead de activaciones.
- Modelo base en FP16: aproximadamente 6 GB de VRAM para los pesos, mas overhead; en la practica unos 8-10 GB.
- GPUs recomendadas: cualquier GPU con 8 GB o mas de VRAM para FP16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10G o superiores.
- Cabe en GPU de consumo: si. Con cuantizacion a 4 bits funciona en GPUs de 6-8 GB, y en FP16 en tarjetas de 8-12 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta presente), vLLM, llama.cpp y Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| aminoch/qwen2.5-3b-qlora-financial-sentiment | ~3.000 M (adaptador LoRA) | 32.768 / 131.072 con YaRN | apache-2.0 | Sentimiento financiero | HuggingFace, 0 descargas |
| Qwen2.5-3B-Instruct | ~3.000 M | 32.768 / 131.072 con YaRN | apache-2.0 (Qwen) | Instruct general y multilingue | Ampliamente disponible |
| Llama-3.2-3B-Instruct | ~3.200 M | 131.072 | Llama 3.2 Community License | Instruct general | Ampliamente disponible |
| Phi-3.5-mini-instruct | ~3.800 M | 131.072 | MIT | Razonamiento y codigo | Ampliamente disponible |

Datos de rendimiento comparativo: no disponibles. No se han publicado evaluaciones de este adaptador frente a las alternativas indicadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Qwen2.5-3B-Instruct, hereda los sesgos del corpus de entrenamiento del modelo base.
- Riesgo de alucinacion: presente, como en cualquier modelo generativo de este tamano; en tareas de clasificacion financiera puede producir etiquetas inconsistentes o justificaciones inventadas.
- Limitaciones de contexto e idioma: la model card solo declara ingles, aunque el modelo base cubre 29 idiomas. No hay validacion de calidad en castellano.
- Ausencia total de documentacion: no se especifican dataset, hiperparametros, metadatos de entrenamiento ni metricas, lo que impide auditar el ajuste o reproducirlo.
- Ambiguedad sobre el contenido del repo: el tamano de 0,1 GB indica que son pesos de adaptador, no un modelo fusionado; sera necesario cargar el adaptador sobre el modelo base o fusionarlo antes de usarlo de forma autonoma.
- Licencia: apache-2.0, permisiva para uso comercial, pero conviene verificar las condiciones de la licencia del modelo base Qwen2.5 antes de explotarlo en produccion.
- Idoneidad para produccion: no acreditada. Sin benchmarks, sin validacion externa y con cero descargas registradas, no deberia desplegarse en un sistema critico sin una evaluacion propia.
- Advertencia sobre el dominio: el analisis de sentimiento financiero es sensible a la jerga, la ironia y el contexto temporal; un modelo de 3.000 millones ajustado con QLoRA puede tener un techo de rendimiento inferior a modelos mayores o a soluciones especializadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aminoch/qwen2.5-3b-qlora-financial-sentiment
- Perfil del autor: https://huggingface.co/aminoch/models
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Framework Unsloth: https://github.com/unslothai/unsloth
- Tutorial de ajuste de Qwen2.5-3B con LoRA: https://ai4u.space/blog/fine-tune-qwen2-5-3b-model-colab-guide
- Documentacion de despliegue y ajuste de Qwen2.5 en Alibaba Cloud PAI: https://www.alibabacloud.com/help/en/pai/use-cases/deploy-fine-tune-and-evaluate-a-qwen2-5-model
- Ficha de Qwen2.5-3B en VIPS Learn: https://learn.engineering.vips.edu/ai-models/qwen-qwen-2-5-3b
- Articulo sobre la familia Qwen en Wikipedia: https://en.wikipedia.org/wiki/Qwen
