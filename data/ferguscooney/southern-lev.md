# ferguscooney/southern-lev

## Resumen
southern-lev es un clasificador de texto especializado en el tratamiento de citas judiciales dentro de sentencias del Tribunal Supremo de Estados Unidos. Lo desarrolla ferguscooney y se construye mediante fine-tuning de answerdotai/ModernBERT-large, un transformer encoder de 395 millones de parametros. El modelo resuelve un problema concreto de analisis juridico computacional: dado un fragmento de una sentencia que cita un precedente anterior, predecir como lo trata (si lo sigue, lo distingue, lo limita, lo cuestiona o lo deroga, entre otras diez categorias).

La relevancia del modelo radica en su enfoque de destilacion: las etiquetas no provienen de anotacion humana experta, sino de un modelo profesor (Claude Sonnet 5.5) consultado via la API Batch de Anthropic. Esto permite generar un corpus de 68.636 pares citante-citado extraidos de CourtListener, con un coste de anotacion muy inferior al de un equipo de abogados. El resultado es un modelo compacto y desplegable en hardware modesto (una sola NVIDIA L4 durante el entrenamiento) que reproduce el juicio de un modelo frontera en una tarea juridica acotada.

El checkpoint se publica bajo licencia Apache 2.0, con pesos en safetensors y un tamano de repositorio de 1,6 GB. La tarea es de clasificacion multiclase (diez etiquetas) sobre entradas de hasta 1.024 tokens, con una mediana real de unos 590 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) |
| Parametros totales | 395.841.546 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (limite de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de answerdotai/ModernBERT-large, un encoder transformer de la familia ModernBERT que incorpora mejoras sobre BERT clasico (rotary positional embeddings, atencion con ventanas locales alternadas, capas sin sesgo). Sobre esa base se realiza un fine-tuning de clasificacion con una cabeza de diez etiquetas. El entrenamiento fue una unica ejecucion: dos epocas, batch de 8, learning rate 2e-5, entradas de hasta 1.024 tokens, autocast en bf16 sobre una NVIDIA L4. Se conservo el checkpoint con mejor macro F1 de validacion, que resulto ser el paso final.

Los datos proceden de CourtListener: 68.636 pares citante-citado de sentencias del Tribunal Supremo de EE. UU., divididos en 54.851 de entrenamiento, 6.952 de validacion y 6.833 de test. La particion se hace por hash de la sentencia citante, de modo que ningun texto aparece en ambos lados. Las etiquetas se generaron en rondas con dos versiones de prompt (v3 y v5) y distintos niveles de esfuerzo (medium y xhigh), con relectura de los casos de baja confianza. La mezcla de etiquetas no refleja la poblacion real: hay un sobremuestreo deliberado de casos negativos (distinguishes, questions, limits, overrules) para compensar su escasez. En el split de entrenamiento, overrules solo tiene 205 ejemplos frente a 20.057 de supports. El modelo es, por tanto, un estudiante que imita las etiquetas de un profesor (Claude Sonnet 5.5), no una anotacion juridica humana.

## Capacidades
- Clasificacion de tratamiento de citas judiciales en diez categorias: follows, supports, explains, background, history, distinguishes, questions, limits, overrules y unknown.
- Distincion entre tratamientos positivos y negativos (los cuatro negativos son distinguishes, questions, limits y overrules).
- Procesamiento de entradas estructuradas con cabecera (opinion citante, decision citada, capacidad de revocacion, senales de cita, parenteticos de CourtListener), marcas de ocurrencia y pasaje de la decision citada.
- Manejo de multiples ocurrencias de una misma cita dentro del fragmento de entrada.
- Capacidad de identificar distinciones suaves y citas del tipo "cf." seguidas de la diferencia (introducido en el prompt v5).
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un clasificador.
- Idioma unico: ingles juridico estadounidense.

## Casos de uso
- Analisis de precedentes a escala: procesar corpus completos de sentencias del Tribunal Supremo para construir grafos de tratamiento de citas y detectar que precedentes han sido distinguidos, limitados o derogados a lo largo del tiempo.
- Investigacion juridica asistida: dada una sentencia y una cita concreta, obtener automaticamente la etiqueta de tratamiento para alimentar herramientas de shepardizacion (verificacion de vigencia de precedentes).
- Construccion de bases de datos de citas negativas: el modelo esta entrenado con sobremuestreo de casos negativos, lo que lo hace util para localizar senales de derogacion o limitacion en grandes volumenes de texto.
- Enriquecimiento de metadatos en repositorios juridicos: anadir etiquetas de tratamiento a colecciones como CourtListener para mejorar la busqueda y el filtrado.
- Monitorizacion de cambios jurisprudenciales: ejecutar el clasificador de forma periodica sobre nuevas sentencias para detectar cuando un precedente establecido empieza a ser cuestionado o limitado.
- Investigacion academica en derecho computacional: generar datasets etiquetados de tratamiento de citas para estudios empiricos sobre estabilidad de precedentes, con la advertencia de que las etiquetas provienen de un profesor LLM y no de juristas.
- Filtrado previo en pipelines de revision legal: priorizar los pares citante-citado que requieren revision humana por su posible caracter negativo, reduciendo el volumen de lectura manual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se selecciono el checkpoint con mejor macro F1 de validacion, pero no se proporcionan los valores numericos de F1, precision, recall ni comparaciones con otros sistemas.

## Requisitos de hardware
- VRAM estimada para inferencia: un modelo de 395 millones de parametros en bf16 ocupa aproximadamente 0,8 GB de pesos; con overhead de activaciones y batch pequeno, cabe holgadamente en GPUs de 8 GB o menos.
- GPU recomendadas: NVIDIA L4 (usada en entrenamiento), T4, RTX 3090, RTX 4090, A100, H100. Para inferencia a escala, cualquier GPU con al menos 8 GB es suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU para volumenes moderados.
- Opciones de despliegue: al ser un modelo de clasificacion con arquitectura ModernBERT, es compatible con Hugging Face Transformers, Text Embedding Inference (TEI) y ONNX Runtime. No se documenta soporte nativo en vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible. Con entradas de 590 tokens de mediana y 850 en el percentil 90, se espera un throughput alto en GPU, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| southern-lev | 395,8 M | 1.024 tokens | Clasificacion de tratamiento de citas (10 clases) | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-large | 395,8 M | 8.192 tokens | Encoder base, sin cabeza de clasificacion juridica | Apache 2.0 | Hugging Face |
| jonathankleiman/lev | no disponible | no disponible | Clasificacion de citas juridicas (referencia citada por el autor) | no disponible | Hugging Face |

La comparacion con alternativas de la misma tarea es limitada: no se dispone de datos de rendimiento de lev ni de otros clasificadores de tratamiento de citas en la informacion proporcionada. ModernBERT-large sirve como referencia de arquitectura y tamano, pero no realiza la tarea especifica.

## Limitaciones y advertencias
- Las etiquetas provienen de un modelo profesor (Claude Sonnet 5.5), no de abogados. El modelo hereda los sesgos y errores del profesor, y no debe tratarse como ground truth juridico.
- La mezcla de etiquetas de entrenamiento no refleja la distribucion real: hay un sobremuestreo fuerte de casos negativos y una escasez extrema de overrules (205 ejemplos). El rendimiento en esa clase puede ser fragil.
- Se mezclan dos versiones de prompt (v3 y v5) con definiciones distintas de distinguishes, lo que introduce inconsistencia en las etiquetas de 25.500 pares.
- El modelo solo procesa entradas construidas de una forma muy especifica (cabecera, marcas de ocurrencia, pasaje de la decision citada). Texto en otro formato esta fuera de distribucion y producira predicciones poco fiables.
- Limite de contexto de 1.024 tokens: aunque la mediana es de 590, los casos largos se truncan.
- Solo ingles juridico estadounidense; no soporta otros idiomas ni otras jurisdicciones.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea en casos ambiguos o con senales de cita atipicas.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal del uso en contextos juridicos recae en el implementador.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay validacion comunitaria independiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ferguscooney/southern-lev
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Modelo de referencia lev: https://huggingface.co/jonathankleiman/lev
- CourtListener (fuente de datos): https://www.courtlistener.com
- DOI asociado: 10.57967/hf/11570
