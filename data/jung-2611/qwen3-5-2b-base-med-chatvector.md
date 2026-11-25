# jung-2611/Qwen3.5-2B-Base-MED-ChatVector

## Resumen

Qwen3.5-2B-Base-MED-ChatVector es un modelo publicado en Hugging Face por el usuario jung-2611 bajo el identificador `jung-2611/Qwen3.5-2B-Base-MED-ChatVector`. Por el nombre se deduce que se trata de un derivado de la familia Qwen3.5 en su variante Base de 2B parametros, con un ajuste posterior orientado a dominio medico y a un formato de "ChatVector", es decir, una combinacion de pesos que incorpora capacidades conversacionales sobre una base preentrenada. La model card es la plantilla automatica de Hugging Face y no aporta informacion sobre el proceso de entrenamiento, los datos utilizados ni la licencia.

El repositorio declara el pipeline `image-text-to-text` y la arquitectura `qwen3_5`, lo que sugiere capacidades multimodales de entrada (imagen y texto) y salida textual, aunque no se documenta el componente de vision ni su configuracion. El dato verificable mas solido es el recuento de parametros en safetensors: 2.213.241.664 parametros, con un tamano de repositorio de 4,4 GB, coherente con pesos en precision de 16 bits.

Su relevancia es limitada y debe evaluarse con cautela: se trata de un modelo sin descargas ni likes en el momento de la consulta, con documentacion practicamente inexistente y sin resultados de evaluacion publicados. Resulta util como objeto de estudio de tecnicas de ChatVector y ajuste en dominio medico a pequena escala, pero no es recomendable para produccion sin una validacion propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, segun tag de Hugging Face) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 4,4 GB |
| Libreria | transformers |
| Fecha de creacion | 2026-11-25 |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es el tag de arquitectura `qwen3_5` y el pipeline `image-text-to-text`, que apuntan a un transformer multimodal con entrada de imagen y texto. No se detalla el numero de capas, dimensiones ocultas, mecanismo de atencion, tokenizador ni la resolucion o el encoder de vision empleado. Tampoco se especifica si el modelo incorpora modos de razonamiento extendido propios de la familia Qwen.

Respecto al entrenamiento, la model card no documenta el numero de tokens, la composicion del corpus, el uso de RLHF o DPO ni los hiperparametros. El sufijo "MED" sugiere un ajuste en dominio medico y "ChatVector" alude a la tecnica de combinar aritmeticamente los pesos de un modelo base con los de un modelo instruido para transferir el comportamiento conversacional sin reentrenar desde cero; sin embargo, no hay confirmacion del autor sobre la metodologia aplicada, el modelo base exacto ni los datos clinicos utilizados. No se han publicado innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto conversacional: el pipeline `conversational` y el sufijo ChatVector indican soporte de dialogos multi-turno, aunque no se documenta su calidad.
- Entrada multimodal: el pipeline `image-text-to-text` implica capacidad de procesar imagenes junto a texto, sin especificarse tareas concretas (VQA, captioning, OCR u otras).
- Dominio medico: el sufijo MED sugiere especializacion en terminologia y contenido clinico, no verificada ni evaluada publicamente.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking, audio, etc.): no disponible.

## Casos de uso

- Experimentacion con ChatVector: usar el modelo como caso de estudio para reproducir la tecnica de combinacion de pesos entre un base y un modelo instruido, comparando la degradacion o mejora en tareas de dialogo frente al base original.
- Prototipado de asistentes clinicos de bajo coste: desplegar un prototipo en local con 2,2B parametros para validar flujos de preguntas y respuestas sobre terminologia medica, siempre con revision humana y sin uso diagnostico.
- Investigacion en ajuste de dominio: analizar como un ajuste medico sobre una base pequena afecta a la perplexidad en corpus clinicos frente a modelos generalistas del mismo tamano.
- Procesamiento de documentacion medica con imagen: aprovechar el pipeline image-text-to-text para extraer texto o describir figuras en informes y articulos, verificando manualmente cada salida.
- Evaluacion de riesgos en modelos pequenos especializados: emplear el modelo como sujeto de pruebas de alucinacion y sesgo en dominio sanitario antes de considerar cualquier despliegue.
- Base para fine-tuning posterior: partir de estos pesos como inicializacion en tareas medicas concretas (clasificacion de informes, extraccion de entidades) cuando el presupuesto de computo sea reducido.
- Educacion y demos: montar una demo docente de inferencia multimodal con transformers en una unica GPU de consumo, dado el reducido tamano del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 4,4 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, en torno a 2,5-3 GB; en 4 bits, alrededor de 1,5-2 GB (estimaciones a partir del recuento de parametros, no verificadas con el modelo).
- GPU recomendadas: cualquier GPU con 8 GB o mas para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4); para cuantizaciones de 4 bits bastaria con 4-6 GB de VRAM.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores, especialmente con cuantizacion.
- Opciones de despliegue: transformers es la via documentada; al no publicarse pesos GGUF, llama.cpp y Ollama requeririan conversion propia. vLLM y TGI son posibles si la arquitectura `qwen3_5` esta soportada por esas herramientas, extremo no confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Documentacion |
|---|---|---|---|---|---|
| jung-2611/Qwen3.5-2B-Base-MED-ChatVector | 2,21B | no disponible | no disponible | si (image-text-to-text) | practicamente inexistente |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | no | completa, con benchmarks |
| Qwen2.5-VL-3B-Instruct | 3,75B | 32.768 tokens (ampliable) | Apache 2.0 | si | completa, con benchmarks |
| SmolVLM-2.2B-Instruct | 2,25B | 8.192 tokens | Apache 2.0 | si | completa, con benchmarks |

La comparativa se basa en caracteristicas publicas de esos modelos; no existen datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa. Frente a las alternativas, la diferencia principal no es tecnica sino de trazabilidad: los modelos citados cuentan con model cards detalladas, licencia clara y evaluaciones reproducibles.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica, sin informacion sobre datos, metodologia ni evaluacion.
- Licencia no especificada: no puede asumirse uso comercial; la ausencia de licencia explicita impide determinar los derechos de redistribucion.
- Riesgo elevado de alucinacion en dominio medico: un ajuste especializado sin evaluacion publicada puede generar afirmaciones clinicas incorrectas con apariencia de verosimilitud.
- Sesgos desconocidos: al no documentarse la composicion del corpus de ajuste, no es posible evaluar sesgos demograficos, linguisticos o clinicos.
- Idiomas y contexto no declarados: se desconoce la cobertura multilingue y la ventana de contexto real.
- Capacidad multimodal no verificada: el pipeline declarado no garantiza que el componente de vision este correctamente integrado o funcione fuera de casos simples.
- Sin traccion en la comunidad: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que los fallos hayan sido detectados por terceros.
- Uso clinico no autorizado: en ningun caso debe emplearse para diagnostico, triaje o recomendacion terapeutica sin validacion regulatoria y supervision profesional.
- Reproducibilidad limitada: al no conocerse el modelo base exacto ni los datos de ajuste, los resultados no son reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jung-2611/Qwen3.5-2B-Base-MED-ChatVector
- Referencia citada en la model card (Lacoste et al., 2019, estimacion de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental ML CO2 Impact: https://mlco2.github.io/impact
- Repositorio de la familia Qwen (referencia del prefijo del nombre, sin confirmacion de relacion directa): https://github.com/QwenLM/Qwen
- Documentacion de transformers: https://huggingface.co/docs/transformers
