# mradermacher/sherlock-qwen2.5-3b-dpo-v1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `andreayhchen/sherlock-qwen2.5-3b-dpo-v1`, realizadas por el usuario mradermacher. Se trata, por tanto, de una conversión de pesos y no de un entrenamiento nuevo: el modelo original es un Qwen2.5-3B ajustado mediante LoRA y posteriormente alineado con DPO (Direct Preference Optimization), y las etiquetas de la model card lo asocian a matemáticas y a un uso de "persona" conversacional.

El interés práctico del repositorio está en el formato: al publicarse en GGUF con 12 niveles de cuantización distintos (desde Q2_K de 1,4 GB hasta f16 de 6,3 GB), el modelo puede ejecutarse en hardware de consumo mediante llama.cpp, Ollama o LM Studio sin necesidad de GPU dedicada. Para un modelo de 3.085.938.688 parámetros, esto lo sitúa en el rango de equipos con 8-16 GB de RAM o en cualquier GPU consumer con 4 GB o más de VRAM.

Es relevante ahora porque los modelos pequeños alineados por preferencias y con una "persona" concreta son útiles para prototipado local, experimentación con DPO y tareas acotadas de razonamiento y conversación en inglés. Conviene tener en cuenta que el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y que su licencia no está declarada, por lo que la validación por parte de la comunidad es todavía inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5, con adaptadores LoRA fusionados; no confirmado de forma explicita en la model card) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-3B declara 32.768 tokens nativos (dato heredado, no confirmado en este repositorio) |
| Tipos de cuantizacion | Q2_K (1,4 GB), Q3_K_S (1,6 GB), Q3_K_M (1,7 GB), Q3_K_L (1,8 GB), IQ4_XS (1,9 GB), Q4_K_S (1,9 GB), Q4_K_M (2,0 GB), Q5_K_S (2,3 GB), Q5_K_M (2,3 GB), Q6_K (2,6 GB), Q8_0 (3,4 GB), f16 (6,3 GB) |
| Idiomas soportados | Ingles (segun la model card y los metadatos del repositorio) |
| Licencia | No disponible |
| Formato de pesos | GGUF (los pesos originales del modelo base estan en safetensors) |
| Tamano del repositorio | 27,9 GB (suma de todas las cuantizaciones) |
| Cuantizacion con imatrix | No disponible; el autor indica que las cuantizaciones ponderadas/imatrix no estaban publicadas en el momento de la subida |
| Fecha de creacion (metadatos) | 2026-09-20 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el proceso de entrenamiento en la informacion proporcionada. Los metadatos indican tres rasgos del modelo original: los adaptadores LoRA fueron fusionados en los pesos base (`lora-merged`), se aplico un paso de alineacion mediante DPO (`dpo`) y el modelo esta etiquetado como orientado a matematicas (`math`) y a la adopcion de una "persona" concreta (`persona`). El nombre del modelo, `sherlock`, sugiere un comportamiento de personaje, pero la model card no documenta ni el dataset de preferencias ni la composicion de los datos de ajuste.

En cuanto a la arquitectura subyacente, el identificador del modelo apunta a la familia Qwen2.5 en su variante de 3.000 millones de parametros: un transformer decoder-only con atencion por consultas agrupadas (GQA) y RoPE. No obstante, la model card de este repositorio no explicita configuracion de capas, dimension oculta, cabezas de atencion ni estrategia de tokenizacion, por lo que esos datos quedan como no disponibles. La innovacion tecnica de este repositorio en concreto es la cuantizacion: se ofrecen 12 variantes GGUF generadas con el conversor `convert_type: hf` y `output_tensor_quantised: 1` del pipeline de mradermacher.

## Capacidades

- Generacion de texto conversacional en ingles, con un tono condicionado por el ajuste de "persona" del modelo original.
- Razonamiento matematico y resolucion de problemas numericos, segun la etiqueta `math` de la model card.
- Alineacion por preferencias: el paso de DPO busca mejorar la utilidad y el formato de las respuestas frente al modelo base.
- Ejecucion local en CPU o GPU de gama baja gracias a las cuantizaciones de 2-4 bits.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se documentan otros idiomas.
- Vision, audio o modo "thinking" explicito: no disponibles.
- Capacidades de codigo: no documentadas en la informacion proporcionada.

## Casos de uso

- Prototipado local en portatil: con la cuantizacion Q4_K_M (2,0 GB) el modelo se ejecuta en un equipo con 8 GB de RAM mediante llama.cpp u Ollama, lo que permite iterar sobre prompts conversacionales sin coste de API.
- Asistente conversacional con personaje definido: el ajuste de tipo `persona` y el DPO lo hacen adecuado para bots de rol o narracion interactiva en ingles, donde se busca consistencia de tono mas que precision factual.
- Tutoria de matematicas de nivel basico: la etiqueta `math` sugiere utilidad para resolver y explicar ejercicios de aritmetica y algebra elemental, con la advertencia de que en un modelo de 3 B los errores de calculo son frecuentes.
- Generacion de datos sinteticos en ingles: puede emplearse para producir borradores de dialogos o pares pregunta-respuesta que luego se filtren manualmente antes de usarse en otros pipelines.
- Evaluacion de tecnicas DPO: sirve como caso de estudio reproducible para comparar el comportamiento del modelo base Qwen2.5-3B frente a su version alineada por preferencias, incluyendo el efecto de la cuantizacion en la calidad de salida.
- Despliegue en entornos sin GPU: la variante Q2_K (1,4 GB) o Q3_K_S (1,6 GB) permite servir el modelo en contenedores pequenos, dispositivos de borde o CI, siempre que la tarea tolere la perdida de calidad asociada a 2-3 bits.
- Base para ajuste adicional: al estar disponible en GGUF y existir los pesos originales en safetensors, puede emplearse como punto de partida para LoRA especificos, aunque para ello conviene trabajar sobre el repositorio base y no sobre las cuantizaciones.
- Filtrado o clasificacion de texto sencilla en ingles: tareas de etiquetado y reformulacion de baja complejidad donde el coste por token es un factor critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye tablas de MMLU, GSM8K, HumanEval ni de ningun otro conjunto de evaluacion, y la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (los unicos resultados obtenidos corresponden a la actriz Willa Fitzgerald y no guardan relacion con el repositorio).

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y cache KV): aproximadamente 2,0-2,5 GB con Q4_K_M, 3,5-4,5 GB con Q8_0 y 6,5-7,5 GB con f16. Con Q2_K y Q3_K_S se puede operar por debajo de 2 GB de VRAM.
- Memoria RAM: las variantes Q4_K_M y Q4_K_S caben en equipos con 8 GB de RAM; Q5 y Q6 requieren 8-12 GB; Q8_0 y f16 recomiendan 12-16 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 2060, GTX 1660 con Q4); en el extremo alto, RTX 4090, A100 o H100 ejecutan la variante f16 con contexto largo practicamente sin limitaciones, aunque para 3 B de parametros son ampliamente sobredimensionadas.
- Compatibilidad con GPU de consumo: si, es uno de los principales atractivos del repositorio. Incluso una GTX 1050 Ti o una iGPU moderna pueden ejecutar las cuantizaciones de 2-3 bits, y la ejecucion 100 % en CPU con llama.cpp es viable.
- Opciones de despliegue: llama.cpp (CLI y servidor compatible con la API de OpenAI), Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. Para vLLM o TGI el soporte de GGUF es limitado o parcial, por lo que en esos casos es preferible usar los pesos safetensors del repositorio base.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones de tokens por segundo y no se han encontrado referencias externas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| sherlock-qwen2.5-3b-dpo-v1 (este repositorio) | 3,09 B | No disponible (32.768 tokens heredados de Qwen2.5-3B) | Ingles | No disponible | GGUF (12 cuantizaciones) | Ajuste DPO + LoRA fusionado, orientado a matematicas y persona; 0 descargas y 0 likes registrados |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (ampliable con YaRN) | Multilingue (29 idiomas) | Apache 2.0 | safetensors, GGUF (via terceros) | Modelo instruct oficial de la familia Qwen2.5; referencia directa de capacidad y tokenizador |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Multilingue (8 idiomas declarados) | Licencia comunitaria Llama 3.2 | safetensors, GGUF (via terceros) | Alternativa de tamano equivalente con contexto muy superior y ecosistema amplio |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | Multilingue | MIT | safetensors, GGUF (via terceros) | Mayor numero de parametros y contexto largo, con licencia permisiva |

No se dispone de datos de rendimiento comparado para este modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en el repositorio, no puede asumirse permiso para uso comercial. Es imprescindible consultar la licencia del modelo base `andreayhchen/sherlock-qwen2.5-3b-dpo-v1` y, en ultima instancia, la de Qwen2.5 antes de cualquier despliegue productivo.
- Validacion nula: el repositorio registra 0 descargas y 0 likes, sin senales de uso por parte de la comunidad ni informes independientes de calidad.
- Sesgos conocidos: no documentados. Al estar entrenado predominantemente en ingles y sin informacion sobre la composicion de los datos, se esperan los sesgos habituales de los corpus web en ingles.
- Riesgo de alucinacion: elevado para un modelo de 3 B, especialmente en tareas factuales, citas, referencias bibliograficas y calculos de varios pasos. La etiqueta `math` no garantiza correccion aritmetica.
- Limitacion idiomatica: el modelo declara unicamente ingles. Su rendimiento en castellano no esta evaluado y previsiblemente sera deficiente.
- Longitud de contexto: no confirmada en este repositorio. Aunque el base Qwen2.5-3B soporte 32.768 tokens, no hay garantia de que el ajuste DPO haya preservado ese comportamiento, y las cuantizaciones de 2-3 bits degradan la calidad mas rapidamente al crecer el contexto.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K inferiores (Q3_K_M esta marcada por el propio autor como "lower quality") reducen de forma notable la coherencia. Para uso serio se recomienda Q4_K_M o superior.
- Naturaleza del repositorio: es una conversion de pesos, no un modelo nuevo. Cualquier limitacion del modelo original se hereda intacta.
- Ausencia de soporte de herramientas y agentes: no hay evidencia de entrenamiento en formato de llamada a funciones, por lo que no deberia integrarse en pipelines de agentes sin validacion previa.
- Fechas de metadatos incoherentes: el repositorio figura creado el 2026-09-20, una fecha posterior a la habitual en los repositorios publicos, lo que conviene verificar antes de citarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sherlock-qwen2.5-3b-dpo-v1-GGUF
- Modelo base (pesos originales): https://huggingface.co/andreayhchen/sherlock-qwen2.5-3b-dpo-v1
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#sherlock-qwen2.5-3b-dpo-v1-GGUF
- Guia de uso de GGUF de TheBloke citada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Paper o blog oficial del modelo: no disponible
- Demo o espacio interactivo: no disponible
