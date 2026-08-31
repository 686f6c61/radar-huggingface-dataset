# Don-Don/mars-order-2m

## Resumen

MarS Order 2M es un modelo generativo de órdenes de mercado diseñado para el motor de simulación financiera MarS, desarrollado por Microsoft Research. El modelo, publicado en HuggingFace por el usuario Don-Don, implementa un Large Market Model (LMM) que aprende a generar órdenes de compra y venta realistas a nivel de tick, imitando el comportamiento de los participantes del mercado. Con solo 2,5 millones de parámetros, es un modelo extremadamente ligero que se integra en el flujo de trabajo de MarS mediante la clase `OrderModel`.

El modelo acepta un tensor de enteros con forma `(batch, 1024, 15)` que representa 1024 pasos de tiempo con 15 características por paso, y devuelve logits de la siguiente orden con forma `(batch, 1024, 49152)`, donde 49152 es el tamaño del vocabulario de tokens de órdenes. Su relevancia radica en que permite simular mercados financieros completos con órdenes generadas de forma realista, controlable e interactiva, algo fundamental para investigación en finanzas computacionales, backtesting y entrenamiento de agentes de refuerzo. La licencia MIT facilita su uso tanto académico como comercial, aunque el autor advierte explícitamente que no debe usarse como base para decisiones de inversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basado en llama2, causal-lm) |
| Parametros totales | 2.524.624 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 pasos de tiempo (15 features por paso) |
| Tipos de cuantizacion | No disponible (solo safetensors en precision original) |
| Idiomas soportados | No disponible (modelo numerico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal similar a la familia Llama 2, como indican las etiquetas del repositorio. Se entrena para modelar la distribucion de la siguiente orden en un mercado financiero, tratando las ordenes como tokens discretos de un vocabulario de 49152 posibles valores. Cada paso de tiempo se representa con 15 caracteristicas numericas que codifican informacion relevante del estado del mercado (precios, volumenes, direccion de la orden, etc.). El modelo genera logits sobre este vocabulario, que luego se decodifican en ordenes concretas dentro del motor MarS.

Los datos de entrenamiento no se han divulgado en la informacion disponible. El modelo se enmarca en el trabajo de Microsoft Research descrito en el articulo arXiv 2409.07486, donde se propone el concepto de Large Market Model (LMM) como analogo de los modelos de lenguaje para el dominio financiero. La innovacion principal no reside en la arquitectura, sino en la formulacion del problema: convertir la generacion de ordenes de mercado en una tarea de modelado secuencial sobre tokens discretos, lo que permite escalar con la cantidad de datos y la complejidad del modelo.

## Capacidades

- Generacion de ordenes de mercado realistas a nivel de tick, incluyendo precios, volumenes y direccion (compra/venta).
- Simulacion de mercado interactiva: el modelo puede generar la siguiente orden dado el estado actual del libro de ordenes.
- Generacion controlable con impacto de mercado, segun las capacidades descritas en el paper de MarS.
- Integracion con el ecosistema MarS: carga directa mediante `OrderModel.from_pretrained` y uso con los assets de preprocesamiento disponibles en el repositorio de datos.
- No es un modelo de lenguaje natural: no genera texto, codigo ni responde a prompts. Su unica salida son logits sobre tokens de ordenes.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los LLM convencionales.

## Casos de uso

- Simulacion de mercado para investigacion academica: el modelo permite generar libros de ordenes sinteticos realistas para estudiar microestructura de mercado, formacion de precios o liquidez sin necesidad de datos historicos propietarios.
- Backtesting de estrategias de trading: se pueden ejecutar estrategias contra un mercado simulado con ordenes generadas por el modelo, evaluando su rendimiento en condiciones realistas antes de desplegarlas en produccion.
- Entrenamiento de agentes de aprendizaje por refuerzo: el entorno simulado de MarS, alimentado por este modelo, proporciona un banco de pruebas para agentes RL que aprenden a ejecutar ordenes optimizando impacto y slippage.
- Generacion de datos sinteticos para entrenamiento de otros modelos: las ordenes generadas pueden servir como dataset aumentado para entrenar modelos de prediccion de precios o de deteccion de anomalias.
- Analisis de impacto de mercado: al controlar la generacion de ordenes, se puede estudiar como grandes ordenes institucionales afectan al libro de ordenes y al precio de equilibrio.
- Validacion de hipotesis en finanzas computacionales: el modelo permite reproducir experimentos controlados donde se alteran parametros del mercado y se observan las respuestas del generador de ordenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de MarS (arXiv 2409.07486) describe metricas de realismo y controlabilidad, pero no se proporcionan numeros concretos para este checkpoint especifico de 2M de parametros.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 2,5 millones de parametros en precision FP32, el modelo ocupa aproximadamente 10 MB en memoria.
- GPU recomendadas: cualquier GPU moderna es suficiente; incluso una GPU integrada o una CPU pueden ejecutar el modelo sin problemas de latencia.
- Cabe en cualquier GPU de consumo: si, desde una GTX 1650 hasta una RTX 4090.
- Opciones de despliegue: el modelo se usa exclusivamente a traves del motor MarS, cargandolo con la clase `OrderModel`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamano del modelo, la inferencia de un lote de 1024 pasos deberia completarse en milisegundos en hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente accesibles. El propio MarS es el unico motor de simulacion de mercado basado en modelos generativos de ordenes con licencia abierta conocido. Alternativas como los simuladores basados en agentes (por ejemplo, ABIDES) no utilizan redes neuronales generativas, por lo que la comparativa no es directa. Se puede indicar que el modelo es significativamente mas pequeno que los LLM convencionales (2,5M frente a 7B o mas), lo que refleja su especializacion en una tarea numerica concreta.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no es consejo financiero y no debe usarse como base unica para decisiones de trading o inversion.
- Uso previsto exclusivamente para investigacion con MarS; no se garantiza su validez en otros entornos o con otros preprocesamientos.
- Los datos de entrenamiento no se han divulgado, por lo que se desconocen posibles sesgos en los mercados representados (por ejemplo, sesgo hacia acciones estadounidenses, periodos de alta volatilidad, etc.).
- Al ser un modelo de 2,5M de parametros, su capacidad de representacion es limitada; puede no capturar patrones complejos de mercado que requieran modelos mas grandes.
- No es un modelo de lenguaje: no puede responder preguntas, generar informes ni interactuar mediante texto.
- El repositorio de HuggingFace muestra 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco validado por la comunidad.
- La fecha de creacion (2026-08-31) es posterior a la fecha actual del sistema, lo que podria indicar un error en los metadatos o un modelo publicado de forma programatica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Don-Don/mars-order-2m
- Repositorio de assets (datasets): https://huggingface.co/datasets/Don-Don/mars-order-assets
- Codigo fuente de MarS en GitHub: https://github.com/microsoft/MarS
- Archivo del modelo OrderModel: https://github.com/microsoft/MarS/blob/main/market_simulation/models/order_model.py
- Paper arXiv: https://arxiv.org/abs/2409.07486
- Pagina del proyecto MarS: https://mars-lmm.github.io/
- Documentacion tecnica de DeepWiki: https://deepwiki.com/microsoft/MarS/3-ordermodel-and-ml-components
