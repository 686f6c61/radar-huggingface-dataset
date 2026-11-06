# mradermacher/Intent-Classifier-4B-GGUF

## Resumen

Intent-Classifier-4B-GGUF es la versión cuantizada en formato GGUF del modelo HeyMiku/Intent-Classifier-4B, un transformer de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) orientado a la clasificación de intenciones en inglés. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, que distribuye los pesos en múltiples niveles de precisión para facilitar su despliegue en hardware modesto.

El modelo resuelve el problema de la clasificación de intenciones (intent classification) dentro de pipelines conversacionales: dado un texto de entrada, el modelo predice la intención subyacente, lo que resulta útil para enrutado de consultas, asistentes virtuales y sistemas de diálogo. La versión original está etiquetada como conversacional y en inglés, y esta variante GGUF añade compatibilidad con `endpoints_compatible`, lo que permite servirla a través de infraestructuras de inferencia estándar.

La relevancia de esta ficha radica en que el modelo base no publica detalles de arquitectura, entrenamiento ni benchmarks en la información disponible, por lo que la ficha documenta con rigor lo que sí se conoce (tamaño, cuantizaciones, licencia ausente, idioma) y marca explícitamente como "no disponible" todo lo demás. El repositorio ocupa 38,9 GB debido a que incluye todas las variantes de cuantización, desde Q2_K hasta f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base HeyMiku/Intent-Classifier-4B más allá de que se trata de un transformer de aproximadamente 4,2 mil millones de parámetros. La model card del repositorio cuantizado no incluye detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni tipo de tokenizador. Tampoco se documenta si el modelo emplea alguna innovación técnica como atención lineal, decodificación especulativa o arquitecturas híbridas.

En cuanto al entrenamiento, no se han publicado datos sobre el volumen de tokens utilizados, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La única información disponible es que el modelo está orientado a clasificación de intenciones y que se etiqueta como conversacional, lo que sugiere un ajuste para tareas de diálogo, pero sin cifras verificables. La cuantización realizada por mradermacher es estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no incluye variantes ponderadas con imatrix, según indica el propio autor.

## Capacidades

- Clasificación de intenciones: la función principal del modelo es predecir la intención de un texto de entrada en inglés, orientada a sistemas de enrutado y diálogo.
- Generación de texto conversacional: la etiqueta "conversational" sugiere capacidad de mantener intercambios multi-turno, aunque no se detalla su alcance.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de infraestructuras de inferencia estándar compatibles con GGUF.

## Casos de uso

- Enrutado de consultas en atención al cliente: el modelo clasifica el texto entrante del usuario en una intención concreta y permite derivar la conversación al departamento o flujo adecuado, reduciendo la intervención manual en triajes de alto volumen.
- Clasificación de tickets de soporte: integrado en un pipeline de ingestión, asigna cada ticket a una categoría de intención para priorización y asignación automática, aprovechando su tamaño moderado para procesar lotes en CPU o GPU de gama media.
- Asistentes virtuales de dominio cerrado: al ser un modelo conversacional en inglés, puede gestionar respuestas guiadas dentro de un conjunto acotado de intenciones predefinidas en bots de atención o FAQ.
- Preprocesado en sistemas RAG: actúa como clasificador previo que decide qué recuperador o índice consultar según la intención detectada en la consulta del usuario.
- Moderación y categorización de mensajes: clasifica mensajes entrantes en categorías predefinidas para filtrado o etiquetado semiautomático en comunidades y foros en inglés.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q2_K (2,0 GB) y Q4_K_M (2,8 GB), puede ejecutarse en portátiles y mini-PC sin GPU dedicada mediante llama.cpp u Ollama, lo que lo hace adecuado para prototipos y pruebas locales.
- Investigación en clasificación de intenciones: sirve como línea base cuantizada para experimentos de evaluación de clasificadores en inglés sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB con Q2_K, 2,8 GB con Q4_K_M, 3,6 GB con Q6_K, 4,6 GB con Q8_0 y 8,5 GB con f16 (tamaños de archivo indicados por el autor; la VRAM real añade overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o A100/H100 para f16 y para servir múltiples peticiones concurrentes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4-8 GB de VRAM para cuantizaciones Q4 a Q8; también en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF y con el tag `endpoints_compatible`; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (clasificación de intenciones de ~4B parámetros) en la documentación proporcionada. La comparación con alternativas como clasificadores BERT o modelos generativos pequeños no puede realizarse sin datos de rendimiento del modelo base.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Intent-Classifier-4B-GGUF | 4,2B | No disponible | No disponible | GGUF |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo entrenado principalmente en inglés, es probable que presente sesgos culturales y lingüísticos propios de ese dominio, aunque no hay evidencia publicada.
- Riesgo de alucinación: no cuantificado; al ser un clasificador de intenciones, el riesgo principal es la clasificación errónea o la asignación de intenciones fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: el modelo solo declara soporte de inglés y no se especifica la longitud máxima de contexto, lo que impide garantizar el comportamiento con entradas largas.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; debe verificarse en el repositorio del modelo base antes de cualquier despliegue en producción.
- Caveats para producción: el modelo tiene muy pocas descargas (16) y ningún "like", lo que sugiere una validación comunitaria escasa; la ausencia de benchmarks y de documentación de entrenamiento dificulta evaluar su fiabilidad. Además, las cuantizaciones de baja precisión (Q2_K, Q3_K_M) pueden degradar la calidad de clasificación, y el autor no ha publicado variantes ponderadas con imatrix.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Intent-Classifier-4B-GGUF
- Modelo base: https://huggingface.co/HeyMiku/Intent-Classifier-4B
- Página de descargas del autor: https://hf.tst.eu/model#Intent-Classifier-4B-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
