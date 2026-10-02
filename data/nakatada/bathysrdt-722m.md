# Nakatada/BathysRDT-722M

## Resumen
BathysRDT-722M es un modelo de investigación publicado por el usuario Nakatada en HuggingFace, con acceso restringido (gated, requiere aceptar condiciones) y licencia propia denominada bathysrdt-research-license-1.0. Se trata de un transformer de profundidad recurrente (recurrent-depth transformer, RDT) de aproximadamente 722 millones de parámetros, orientado al idioma japonés y construido en torno a la idea de la profundidad de inferencia como cuarto eje de escalado, junto con los tres clásicos: número de parámetros, volumen de datos y cómputo de entrenamiento.

La innovación central es el uso de un único bloque recurrente con pesos compartidos (weight sharing) que se aplica de forma iterativa, de manera que el modelo puede ajustar cuánta "profundidad de pensamiento" dedicar a cada entrada en lugar de tener una profundidad fija definida por el número de capas. El repositorio ocupa 2,9 GB y contiene pesos en formato safetensors.

No se han publicado en la información disponible especificaciones detalladas, datos de entrenamiento ni resultados de benchmarks. El modelo acumula 0 descargas y 0 likes, por lo que se trata de un artefacto de investigación sin validación comunitaria y con fecha de publicación de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de profundidad recurrente (RDT) con bloque recurrente único y pesos compartidos |
| Parametros totales | ~722 millones (según el identificador del modelo; no confirmado en documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye safetensors en precisión completa (2,9 GB, coherente con FP32 a 4 bytes por parámetro) |
| Idiomas soportados | japonés (ja) |
| Licencia | bathysrdt-research-license-1.0 (licencia propia, etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors |
| Acceso | restringido (gated); requiere aceptar condiciones en HuggingFace |
| Fecha de publicacion | 2026-10-01 |

## Arquitectura y entrenamiento
El modelo se basa en una arquitectura de profundidad recurrente: en lugar de apilar un número fijo de capas distintas, reutiliza un único bloque transformer con pesos compartidos y lo aplica repetidamente. El número de iteraciones (profundidad efectiva) es un hiperparámetro dinámico, lo que traslada parte del coste computacional de inferencia a un eje ajustable en tiempo de ejecución. Según la descripción pública del proyecto, esta profundidad de razonamiento se plantea como un cuarto eje de escalado, complementario al tamaño del modelo, al volumen de datos y al cómputo de entrenamiento. La idea de reutilizar bloques con pesos compartidos conecta con la línea de investigación de los transformers universales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, el tokenizador, la longitud de contexto soportada ni los detalles del bloque recurrente (dimensión oculta, número de cabezas de atención, mecanismo de parada de la recursión). Tampoco se documenta si existe un mecanismo explícito de decisión adaptativa de profundidad o si esta se fija externamente en inferencia.

## Capacidades
- Generación de texto en japonés, único idioma declarado en las etiquetas del repositorio.
- Razonamiento con profundidad de cómputo variable: la recursión sobre un bloque compartido permite, en principio, aumentar la profundidad efectiva sin aumentar el número de parámetros.
- Investigación sobre eficiencia de parámetros mediante weight sharing.
- No hay información disponible sobre soporte de tool calling o function calling.
- No hay información disponible sobre capacidades de agente, razonamiento multi-paso estructurado o modo de pensamiento explícito.
- No hay información disponible sobre capacidades multimodales (visión, audio) ni sobre generación de código o matemáticas como capacidades verificadas.
- No hay información disponible sobre cuantización, destilación o adaptadores publicados.

## Casos de uso
- Investigación académica sobre escalado por profundidad: el modelo permite estudiar experimentalmente cómo varía la calidad de la salida al aumentar el número de iteraciones del bloque recurrente con un presupuesto de parámetros fijo.
- Estudio de weight sharing en transformers: sirve como banco de pruebas para comparar un bloque reutilizado frente a un apilamiento tradicional de capas con el mismo número de parámetros.
- Generación de texto en japonés en prototipos de bajo riesgo, siempre que se valide previamente la calidad de las salidas, dado que no existen benchmarks publicados.
- Experimentos de inferencia con presupuesto de cómputo flexible: en escenarios donde la latencia se puede intercambiar por profundidad, permite ajustar el número de pasos recurrentes según la carga del servicio.
- Prototipado en hardware de consumo: con unos 722 millones de parámetros, el modelo es desplegable en GPUs de gama media para pruebas locales, lo que facilita la exploración sin infraestructura dedicada.
- Base para destilación o ajuste fino en nichos concretos del japonés, partiendo de un checkpoint pequeño y con pesos compartidos que reducen el coste de memoria respecto a un modelo de profundidad equivalente no recurrente.
- Reproducción de resultados de investigación: dado que la licencia es específica de investigación, encaja en proyectos académicos que necesiten auditar el comportamiento de arquitecturas RDT.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La página de HuggingFace no incluye métricas, la tarjeta del modelo no documenta evaluaciones y el artículo técnico localizado describe el enfoque conceptual sin tabla de resultados. No se deben asumir cifras de MMLU, GSM8K, HumanEval ni de evaluaciones en japonés (JGLUE, JMT-Bench u otras) para este modelo.

## Requisitos de hardware
- VRAM para inferencia: en FP32 los pesos ocupan aproximadamente 2,9 GB; en FP16/BF16 bajarían a unos 1,5 GB. A esa cifra hay que sumar activaciones y caché KV, cuyo tamaño depende de una longitud de contexto que no está documentada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar los pesos en FP16; una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090, una L4 o una A10 son suficientes. Para FP32 conviene disponer de 8-12 GB o más.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 8 GB o más, siempre que se confirme el soporte del código de la arquitectura.
- Opciones de despliegue: no confirmadas. Al tratarse de una arquitectura personalizada (recurrente con pesos compartidos), es probable que requiera cargar el modelo con `trust_remote_code` o con código propio; la compatibilidad con vLLM, TGI, llama.cpp, Ollama o LM Studio no está verificada ni documentada.
- Latencia y throughput: no disponibles. La latencia escala con el número de iteraciones del bloque recurrente, por lo que no es un valor fijo y dependerá de la configuración de profundidad elegida en cada despliegue.

## Comparativa con modelos similares
No disponible. En la información proporcionada no se incluyen modelos comparables de la misma categoría (transformers de profundidad recurrente con pesos compartidos) con parámetros, contexto, rendimiento y licencia verificables. Tampoco se dispone de datos de benchmarks de BathysRDT-722M que permitan situarlo frente a alternativas de tamaño similar en japonés, por lo que cualquier comparación cuantitativa sería especulativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BathysRDT-722M | ~722 M | no disponible | no disponible | bathysrdt-research-license-1.0 | gated en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Acceso restringido: el repositorio es gated y obliga a aceptar condiciones en HuggingFace antes de descargar los pesos.
- Licencia propia: bathysrdt-research-license-1.0 está etiquetada como "other" y su texto no se detalla en la información disponible; es imprescindible revisar sus términos antes de cualquier uso comercial, que probablemente esté restringido o prohibido.
- Sin benchmarks publicados: no existe evidencia cuantitativa de calidad, por lo que no se recomienda su uso en producción sin una evaluación propia.
- Sin validación comunitaria: 0 descargas y 0 likes implican que el modelo no ha sido probado ni auditado por terceros.
- Idioma único: solo japonés declarado, sin información sobre comportamiento en otros idiomas.
- Riesgo de alucinación: no documentado ni medido; debe asumirse el riesgo habitual de un modelo de lenguaje sin evaluación de fidelidad.
- Arquitectura no estándar: el bloque recurrente con pesos compartidos puede no ser compatible con las herramientas habituales de inferencia, cuantización y servido, lo que complica su integración.
- Latencia variable: el coste de inferencia depende del número de iteraciones, lo que dificulta garantizar acuerdos de nivel de servicio en producción.
- Sin datos de entrenamiento: se desconoce la composición del corpus, la fecha de corte y los posibles sesgos presentes en los datos.
- Contexto desconocido: no se puede planificar el uso con documentos largos ni conversaciones multi-turno extensas sin determinar antes la ventana real del modelo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Nakatada/BathysRDT-722M
- Artículo técnico sobre BathysRDT y la profundidad de razonamiento (Qiita): https://qiita.com/nakatada-lab/items/1d39ef9b743874eadd0a
