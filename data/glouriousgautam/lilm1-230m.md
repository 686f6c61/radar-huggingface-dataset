# glouriousgautam/LilM1-230M

## Resumen

LiLM1-230M es un modelo de lenguaje compacto de 233,9 millones de parámetros desarrollado por Akshay Gautam (usuario glouriousgautam) y publicado en Hugging Face bajo licencia Apache-2.0. Está diseñado específicamente para el uso controlado de herramientas (tool use) y function calling, un área donde los modelos pequeños suelen fallar por falta de datos de entrenamiento especializados. Su arquitectura es personalizada y requiere `trust_remote_code=True` para cargarse con la librería Transformers.

El modelo se preentrenó con 40 mil millones de exposiciones de tokens y se ajustó posteriormente con una mezcla de 4 partes de datos generales por 8 partes de datos de herramientas, una proporción que el autor encontró óptima para este tamaño. Con una ventana de contexto de 4.096 tokens, está pensado para tareas de generación de texto y llamadas a funciones en entornos con recursos limitados, como dispositivos edge o aplicaciones embebidas. Su relevancia actual radica en la creciente demanda de modelos pequeños capaces de interactuar con APIs y herramientas externas de forma fiable, sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal personalizada (custom) |
| Parametros totales | 233.897.728 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (solo se menciona bfloat16 en la carga) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es personalizada, aunque no se detallan capas, atención ni mecanismos específicos en la documentación disponible. Se sabe que es un modelo de lenguaje autorregresivo (pipeline de generación de texto) y que utiliza el tokenizador de SmolLM2 135M. El preentrenamiento consistió en 40 mil millones de exposiciones de tokens, y el post-entrenamiento empleó una mezcla de datos generales y datos de herramientas en proporción 4:8, lo que indica un énfasis deliberado en el aprendizaje de llamadas a funciones y uso de herramientas. No se menciona el uso de RLHF ni DPO; el ajuste parece ser únicamente mediante fine-tuning supervisado (SFT) con datasets propios, como los publicados en Hugging Face (`lilm1-stationary-sft-30m-v1` y `lilm1-general-tool-ratio-ablation-12m-v1`).

## Capacidades

- Generacion de texto conversacional y completado de instrucciones.
- Uso de herramientas (tool use) y function calling, con generacion de esquemas JSON para llamadas a APIs.
- Extraccion de caracteristicas (feature extraction) para representaciones de texto.
- Razonamiento basico y respuesta a preguntas factuales, aunque con limitaciones propias de su tamano.
- Soporte multilingue: solo ingles.
- No incluye capacidades de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: al ser un modelo de 230M, puede ejecutarse en hardware de bajo consumo (Raspberry Pi, moviles) y gestionar comandos de voz que requieran llamadas a APIs externas, como consultas meteorologicas o control de domotica, siempre con un controlador externo que valide las acciones.
- Automatizacion de tareas en entornos con recursos limitados: integracion en pipelines de CI/CD para generar respuestas a incidencias o ejecutar scripts simples mediante function calling, reduciendo la latencia frente a modelos en la nube.
- Chatbots de atencion al cliente en sitios web ligeros: puede mantener conversaciones de pocos turnos y derivar consultas a sistemas externos (tickets, bases de conocimiento) mediante tool calls, con un supervisor que verifique cada accion.
- Prototipado rapido de agentes conversacionales: ideal para desarrolladores que necesitan validar flujos de tool use sin consumir grandes recursos, gracias a su licencia Apache-2.0 y su facil carga con Transformers.
- Educacion e investigacion en modelos pequenos: sirve como base para estudiar el efecto de la proporcion de datos de herramientas en el rendimiento de modelos compactos, ya que el autor publico datasets de ablacion.
- Dispositivos IoT con conectividad intermitente: puede ejecutar inferencia local y solo enviar llamadas a herramientas cuando hay conexion, reduciendo la dependencia de la nube y mejorando la privacidad.

## Benchmarks y rendimiento

La model card del autor incluye resultados comparativos con otros modelos pequenos. Se indica que IFEval, GSM8K y TruthfulQA usan las suites completas, mientras que BBH y MMLU-Pro usan muestras fijas del 50%.

| Suite | LiLM1-230M | SmolLM2 135M Instruct | LFM2.5 230M | SmolLM2 360M Instruct |
|---|---:|---:|---:|---:|
| IFEval | 15.5 | 21.8 | 65.8 | 32.2 |
| GSM8K | 1.8 | 1.4 | 29.0 | 9.3 |
| TruthfulQA MC2 | 41.3 | 40.9 | 41.4 | 40.4 |
| BBH | 21.9 | 22.2 | 21.8 | 27.0 |
| MMLU-Pro | 8.4 | 6.3 | 7.1 | 8.8 |

Estos datos muestran que LiLM1-230M rinde por debajo de LFM2.5-230M en tareas de instruccion y matematicas, pero es comparable en TruthfulQA y BBH. Su punto fuerte declarado es el tool use, aunque no se aportan benchmarks especificos para esa capacidad.

## Requisitos de hardware

- VRAM estimada: en bfloat16, los 233,9M de parametros ocupan aproximadamente 468 MB, mas overhead de activaciones y cache. Con cuantizacion de 8 bits se reduciria a ~234 MB, y en 4 bits a ~117 MB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2050, o integradas modernas). Tambien puede ejecutarse en CPU con suficiente RAM (2-4 GB).
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU de consumo actual.
- Opciones de despliegue: la unica via documentada es mediante Transformers con `trust_remote_code=True`. No se ha verificado compatibilidad con vLLM, llama.cpp u Ollama debido a la arquitectura personalizada; seria necesario adaptar el codigo.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU modesta (por ejemplo, RTX 3060) se esperan velocidades de decodificacion de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | IFEval | GSM8K | TruthfulQA |
|---|---|---|---:|---:|---:|---:|
| LiLM1-230M | 233,9M | 4.096 | Apache-2.0 | 15.5 | 1.8 | 41.3 |
| LFM2.5-230M (Liquid AI) | 230M | No disponible | No disponible (open weights) | 65.8 | 29.0 | 41.4 |
| SmolLM2 135M Instruct | 135M | 8.192 (estimado) | Apache-2.0 | 21.8 | 1.4 | 40.9 |
| SmolLM2 360M Instruct | 360M | 8.192 (estimado) | Apache-2.0 | 32.2 | 9.3 | 40.4 |

LiLM1-230M se posiciona como un modelo especializado en tool use, pero en benchmarks generales queda por detras de LFM2.5-230M y de SmolLM2 360M. Su ventaja es la licencia permisiva y el enfoque en function calling, aunque carece de la madurez de los modelos de Liquid AI o SmolLM2 en tareas de razonamiento.

## Limitaciones y advertencias

- Contexto limitado a 4.096 tokens: no es adecuado para documentos largos o conversaciones extensas.
- Solo ingles: no soporta otros idiomas de forma nativa.
- Riesgo de alucinacion: como todo modelo pequeno, puede generar respuestas incorrectas o inventadas, especialmente en tareas de razonamiento (GSM8K 1.8%).
- Uso de herramientas no supervisado: el autor advierte explicitamente que se debe usar un controlador de runtime que valide esquemas, permisos y ejecucion. No usar para acciones consecuenciales sin supervisión.
- Arquitectura personalizada: requiere `trust_remote_code=True`, lo que implica ejecutar codigo externo no auditado. Ademas, puede no ser compatible con herramientas de inferencia estandar (vLLM, TGI, llama.cpp) sin adaptaciones.
- Datos de entrenamiento no publicados: no se detalla la composicion del dataset de preentrenamiento ni los datasets de tool use, lo que dificulta evaluar sesgos.
- Rendimiento general bajo: en benchmarks como IFEval o GSM8K obtiene resultados muy pobres, lo que limita su uso en tareas que requieran seguir instrucciones complejas o calculo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glouriousgautam/LilM1-230M
- Dataset de SFT estacionario: https://huggingface.co/datasets/glouriousgautam/lilm1-stationary-sft-30m-v1
- Dataset de ablacion de proporcion general-tool: https://huggingface.co/datasets/glouriousgautam/lilm1-general-tool-ratio-ablation-12m-v1
- Referencia a LFM2.5-230M (modelo comparable): https://www.linkedin.com/posts/yotomations_%3F%3F%3F%3F%3F%3F-%3F%3F-%3F%3F%3F%3F%3F-%3F%3F%3F%3F%3F-activity-7476881794253090817-SwVh
- Leaderboard de modelos (contexto general): https://modelcap.ai/
