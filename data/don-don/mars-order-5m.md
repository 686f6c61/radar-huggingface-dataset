# Don-Don/mars-order-5m

## Resumen

MarS Order 5M es un modelo generativo de órdenes de mercado diseñado para el motor de simulación financiera MarS, desarrollado por Microsoft Research. Este modelo, publicado en HuggingFace por el usuario Don-Don, implementa un enfoque de modelado de lenguaje causal (causal-lm) aplicado al dominio financiero: en lugar de generar texto, genera la siguiente orden de mercado a partir de una secuencia de órdenes previas, permitiendo simular la dinámica de un mercado financiero de forma realista y controlable.

El modelo cuenta con 5.008.288 parámetros (aproximadamente 5 millones), un tamaño muy reducido que lo hace accesible para experimentación en entornos con recursos limitados. Su relevancia radica en que forma parte del ecosistema MarS, un proyecto de investigación que propone un "Large Market Model" (LMM) para simulación de mercados, con aplicaciones en backtesting, análisis de impacto de mercado y generación de datos sintéticos. La licencia MIT permite su uso comercial y académico sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (causal LM, segun documentacion de MarS) |
| Parametros totales | 5.008.288 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de forma (batch, 1024, 15) en el uso documentado) |
| Tipos de cuantizacion | No disponible (solo safetensors de precision completa) |
| Idiomas soportados | No aplica (modelo numerico, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de tipo causal, similar a la de un modelo de lenguaje, pero adaptada al dominio de órdenes de mercado. Según la documentación de MarS, el sistema completo incluye un `OrderTokenizer` que convierte las órdenes de mercado en representaciones numéricas, y un `OrderModel` (la clase que carga este modelo) que procesa secuencias de órdenes tokenizadas y predice la siguiente orden. La entrada documentada es un tensor de enteros con forma `(batch, 1024, 15)`, donde 1024 es la longitud de la secuencia y 15 las características por paso, y la salida son logits de forma `(batch, 1024, 49152)`, lo que sugiere un vocabulario de 49.152 posibles órdenes.

No se dispone de información pública sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. El paper asociado (arXiv:2409.07486) describe el marco general de MarS, pero no detalla los hiperparámetros específicos de este modelo de 5M. La etiqueta `causal-lm` confirma que se trata de un modelo autorregresivo.

## Capacidades

- Generación de órdenes de mercado: el modelo predice la siguiente orden en una secuencia, permitiendo simular la actividad de un mercado financiero.
- Simulación interactiva: integrado con el motor MarS, puede generar órdenes condicionadas al estado del mercado y a eventos externos.
- Control de impacto de mercado: el diseño de MarS permite generar órdenes con un impacto de mercado controlable, útil para estudiar efectos de liquidez.
- Escalabilidad: al ser un modelo pequeño (5M), es adecuado para experimentos rápidos y para validar el enfoque LMM antes de escalar a modelos mayores.
- No soporta procesamiento de lenguaje natural, visión, audio ni tool calling: es un modelo puramente numérico orientado a datos de mercado.

## Casos de uso

- Backtesting de estrategias de trading: el modelo puede generar flujos de órdenes sintéticos que replican la dinámica de un mercado real, permitiendo evaluar estrategias sin riesgo de capital.
- Investigación en microestructura de mercado: los investigadores pueden estudiar cómo las órdenes individuales afectan la formación de precios y la liquidez usando simulaciones generadas por el modelo.
- Generación de datos sintéticos para entrenamiento: los datos de mercado reales son caros y sensibles; este modelo puede producir datasets sintéticos para entrenar otros modelos de predicción o clasificación.
- Simulación de escenarios de estrés: condicionando el modelo a ciertos estados del mercado, se pueden simular situaciones de alta volatilidad o crisis de liquidez para pruebas de robustez.
- Educación y docencia: en cursos de finanzas computacionales, el modelo permite a los estudiantes experimentar con simulaciones de mercado sin necesidad de infraestructura compleja.
- Validación de modelos de impacto de mercado: al generar órdenes con impacto controlable, se puede calibrar y validar modelos teóricos de impacto de mercado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de MarS (arXiv:2409.07486) presenta métricas de realismo y control para el sistema completo, pero no desglosa resultados específicos para este modelo de 5M parámetros.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 5M parámetros, la inferencia requiere menos de 1 GB de VRAM en precision float32. Un modelo de este tamaño puede ejecutarse incluso en CPU con memoria RAM estándar.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior) es suficiente. No se requieren GPUs de datacenter.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: el modelo se carga mediante la clase `OrderModel` del repositorio MarS, que usa PyTorch. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de texto estándar.
- Latencia y throughput: no se dispone de datos oficiales, pero dado el tamaño reducido, la inferencia es prácticamente instantánea en GPU y muy rápida en CPU.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente. MarS Order 5M es un modelo especializado en generación de órdenes de mercado, una tarea muy específica que no tiene equivalentes comerciales o de código abierto ampliamente conocidos. Los modelos de lenguaje generalistas (como Llama 2 o GPT-2) no pueden realizar esta tarea sin un adaptador específico, y no existen modelos de simulación de mercado de referencia pública con los que comparar.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para investigación con el motor MarS. No debe utilizarse como base para decisiones de trading o inversión reales, como se indica explícitamente en la model card.
- No se dispone de información sobre sesgos en los datos de entrenamiento. Los datos de mercado pueden contener sesgos estructurales (por ejemplo, periodos de alta volatilidad o cambios de régimen) que el modelo podría replicar.
- Riesgo de alucinación: al ser un modelo generativo, puede producir órdenes que no correspondan a patrones realistas del mercado, especialmente en situaciones fuera de la distribución de entrenamiento.
- Limitaciones de contexto: la entrada documentada tiene una longitud fija de 1024 pasos, lo que limita la simulación de horizontes temporales largos sin reiniciar el proceso.
- Dependencia del ecosistema MarS: el modelo requiere los assets de preprocesamiento y el código del motor MarS para funcionar, lo que añade complejidad de integración.
- No hay garantías de soporte o mantenimiento: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere un uso muy limitado y posible falta de validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Don-Don/mars-order-5m
- Repositorio de assets (datasets): https://huggingface.co/datasets/Don-Don/mars-order-assets
- Repositorio oficial de MarS en GitHub: https://github.com/microsoft/MarS
- Paper de MarS (arXiv): https://arxiv.org/abs/2409.07486
- Página del proyecto MarS: https://mars-lmm.github.io/
- Documentación de OrderModel en DeepWiki: https://deepwiki.com/microsoft/MarS/3-ordermodel-and-ml-components
