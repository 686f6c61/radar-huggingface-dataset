# koivualeksi/htmlsift-release

## Resumen
htmlsift es un modelo de extracción de contenido principal de páginas web: recibe HTML como entrada y devuelve texto limpio, HTML depurado o Markdown. Lo desarrolla el usuario independiente koivualeksi y se publica bajo licencia Apache-2.0. No es un modelo generativo de propósito general, sino un encoder derivado de IBM Granite Embedding 311M Multilingual R2, adaptado a una tarea de clasificación y segmentación de nodos del DOM para discriminar el contenido principal del ruido (menús, anuncios, cabeceras, pies de página).

El repositorio distribuye dos variantes: `mini/`, un paquete ONNX cuantizado a int8 que se ejecuta en CPU, y `base/`, un encoder de 311M parámetros que usa las primeras 10 capas de Granite r2 y puede ejecutarse en GPU. La relevancia actual está en los pipelines de scraping y curación de datos para entrenamiento de LLM, donde la limpieza fiable del HTML es un cuello de botella habitual y donde un modelo pequeño y ejecutable en CPU reduce el coste frente a soluciones basadas en LLM generativos.

El modelo se integra mediante el paquete `htmlsift` de Python, que descarga los pesos automáticamente en el primer uso. El repositorio ocupa 2,3 GB, aunque la huella real en inferencia es mucho menor para la variante mini.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer derivado de Granite Embedding 311M Multilingual R2 (primeras 10 capas) para extracción de contenido principal en HTML |
| Parámetros totales | 311M en la variante `base/`; no disponible para `mini/` |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 (variante `mini/`, ONNX); la variante `base/` no especifica cuantización |
| Idiomas soportados | No disponible (el modelo base es multilingüe; el alcance efectivo de htmlsift no se detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`mini/`); no disponible para `base/` |

## Arquitectura y entrenamiento
htmlsift reutiliza un encoder transformer de IBM Granite Embedding 311M Multilingual R2, truncado a las primeras 10 capas, y lo especializa en la tarea de identificar el contenido principal de un documento HTML. La salida del encoder se emplea para puntuar o clasificar fragmentos del DOM y componer la extracción final en texto, HTML limpio o Markdown. La variante `mini/` se distribuye como grafo ONNX cuantizado a int8 para inferencia en CPU, mientras que `base/` mantiene el encoder completo en precisión nativa y admite GPU.

El entrenamiento se realizó sobre WebMainBench, un benchmark de extracción de contenido principal publicado por OpenDataLab bajo Apache-2.0. La model card no detalla el número de tokens, la composición exacta del dataset, ni si hubo ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal; se trata de un modelo discriminativo orientado a una tarea concreta, no de un generador autoregresivo.

## Capacidades
- Extracción de contenido principal a partir de HTML crudo, con salida en texto plano, HTML limpio o Markdown.
- Eliminación de ruido estructural: navegación, cabeceras, pies, barras laterales, banners y bloques publicitarios.
- Ejecución en CPU mediante la variante `mini/` en ONNX int8, sin necesidad de GPU.
- Ejecución acelerada en GPU con la variante `base/` de 311M parámetros.
- Integración como biblioteca de Python (`pip install htmlsift`), con descarga automática de pesos en el primer uso.
- Capacidad multilingüe heredada del encoder Granite r2, aunque el alcance por idioma no está documentado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de extracción, no un LLM conversacional.
- No se documentan modos de thinking, visión ni audio.

## Casos de uso
- Curación de datasets para entrenamiento de LLM: htmlsift convierte páginas web crudas en texto limpio antes de tokenizar, reduciendo el ruido de navegación y publicidad que degrada la calidad del corpus.
- Pipelines de scraping a escala: al ejecutarse en CPU con la variante `mini/`, permite procesar grandes volúmenes de páginas en paralelo en nodos sin GPU, con un coste por documento muy bajo.
- Extracción de artículos para agregadores y lectores RSS: el modelo aísla el cuerpo del artículo y lo entrega en Markdown, listo para renderizar en interfaces de lectura.
- Indexación para motores de búsqueda internos: la limpieza previa del HTML mejora la señal textual indexada y reduce el almacenamiento de contenido irrelevante.
- Archivado y preservación documental: la salida en HTML limpio conserva la estructura semántica del contenido principal sin los elementos de presentación del sitio original.
- Procesamiento de documentación técnica y blogs: la conversión a Markdown facilita la ingesta en sistemas RAG y en repositorios de conocimiento internos.
- Preprocesado en pipelines de CI/CD de datos: al ser una dependencia de Python con pesos descargados automáticamente, se integra en tareas programadas de actualización de corpus sin gestión manual de artefactos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que los pesos se entrenaron sobre WebMainBench, sin reportar métricas de precisión, recall ni comparaciones numéricas.

## Requisitos de hardware
- VRAM estimada: 0 GB para la variante `mini/` (ONNX int8 en CPU); para `base/` (311M parámetros) se estima un uso de VRAM en torno a 1-2 GB en fp16, aunque el dato no está publicado.
- GPU recomendadas para `base/`: cualquier GPU con al menos 4 GB de VRAM; una RTX 4090, A100 o H100 son sobredimensionadas para este tamaño y solo aportan throughput.
- Cabe en GPU de consumo: sí, la variante `base/` cabe en cualquier GPU consumer moderna; la variante `mini/` está pensada para CPU.
- Opciones de despliegue: paquete `htmlsift` de Python con runtime ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| htmlsift | Extractor de contenido principal (encoder) | 311M (`base/`), no disponible (`mini/`) | No disponible | Apache-2.0 | Hugging Face y PyPI |
| Trafilatura | Extractor heurístico de contenido web | No aplica (reglas) | No aplica | Apache-2.0 | PyPI y GitHub |
| Readability.js | Extractor heurístico de contenido web | No aplica (reglas) | No aplica | Apache-2.0 | npm y GitHub |
| IBM Granite Embedding 311M Multilingual R2 | Encoder de embeddings multilingüe | 311M | No disponible | Apache-2.0 | Hugging Face |

La comparación con Trafilatura y Readability.js es cualitativa: son extractores basados en reglas y heurísticas del DOM, sin parámetros entrenados, mientras que htmlsift aplica un encoder ajustado sobre WebMainBench. No se dispone de métricas comparativas publicadas que permitan establecer una superioridad numérica.

## Limitaciones y advertencias
- No se han publicado métricas de evaluación, por lo que el rendimiento real frente a extractores heurísticos consolidados no está cuantificado.
- El alcance multilingüe efectivo es desconocido: aunque el encoder base es multilingüe, no se documenta en qué idiomas se entrenó la tarea de extracción.
- Riesgo de extracción incompleta en páginas con estructuras poco convencionales, aplicaciones de una sola página o contenido cargado dinámicamente por JavaScript, ya que el modelo opera sobre el HTML recibido.
- La licencia Apache-2.0 permite uso comercial, pero la model card exige atribuir WebMainBench al utilizar los pesos.
- El proyecto tiene un único mantenedor y un historial de adopción muy bajo (0 descargas y 1 like en el momento de la consulta), lo que implica riesgo de mantenimiento a largo plazo.
- No se documentan sesgos específicos; al derivar de un encoder multilingüe, podría heredar sesgos de representación del corpus original de Granite.
- La variante `base/` depende de las primeras 10 capas del modelo original, por lo que no se beneficia de la profundidad completa del encoder de 311M.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/koivualeksi/htmlsift-release
- Repositorio del proyecto: https://github.com/koivualeksi/htmlsift
- WebMainBench: https://github.com/opendatalab/WebMainBench
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2
