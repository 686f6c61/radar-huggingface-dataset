# loom-ai-org/plamo-3-translate-0.8b-loom

## Resumen

PLaMo 3 Translate 0.8B es un modelo de traducción automática desarrollado por Preferred Networks (PFN) y distribuido en este repositorio por loom-ai-org como un export al formato GGUF propio del motor loom.cpp. Con 890.345.090 parámetros (aproximadamente 0,8B), está especializado en traducción entre 60 idiomas, e incluye su propio tokenizador, atención de ventana deslizante y el formato de prompt PFML3 (que codifica idioma origen, idioma destino, contexto, glosario, registro cortés/llano del japonés e historial de conversación) embebido directamente en el archivo.

El modelo base es `pfnet/plamo-3-translate-0.8b`, y este repositorio no modifica los pesos: solo los reempaqueta en un GGUF autodescriptivo que contiene las topologías de grafo, el tokenizador y el script de control necesarios para ejecutarse con loom.cpp. Es relevante para desarrolladores que necesitan traducción multilingüe de bajo coste computacional con control fino sobre glosarios y registro, desplegable en entornos donde un modelo mayor no es viable.

La ficha se centra en el artefacto exportado (formato loom.cpp), que difiere del checkpoint original en un aspecto clave: la caché de contexto se limita a 4096 tokens, frente a los 32k que admite el checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención de ventana deslizante (sliding-window attention); topología definida en el GGUF de loom.cpp |
| Parametros totales | 890.345.090 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en este export (el checkpoint original admite hasta 32k) |
| Tipos de cuantizacion | no disponible (el repo distribuye un único GGUF sin detallar el tipo de cuantización) |
| Idiomas soportados | ja, en, zh, ko, fr, de, es, ru, ar, hi, vi, th, id (la model card menciona 60 idiomas en el modelo base) |
| Licencia | other (PLaMo Community License: uso personal y no comercial gratuito; uso comercial requiere registro con PFN para ingresos hasta 1000 millones de yenes, o acuerdo separado por encima) |
| Formato de pesos | GGUF (export loom.cpp; pesos sin modificar respecto al base en safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO. Lo que sí se conoce es que el modelo base emplea atención de ventana deslizante y un tokenizador propio, y que su plantilla de chat construye el prompt PFML3 a partir de argumentos estructurados: idioma origen, idioma destino, contexto, glosario, elección entre registro cortés y llano del japonés, e historial. Este formato de prompt está embebido en el archivo exportado, de modo que la API de alto nivel (`text2text.translate`) lo genera automáticamente.

La innovación principal del export es el empaquetado: un único GGUF autodescriptivo que transporta las topologías de grafo, el tokenizador y el driver de inferencia, producido por loom-exporter. Esto permite que el motor loom.cpp ejecute el modelo sin depender de una implementación externa de la arquitectura. La decodificación es greedy por defecto, tal como recomienda la model card del checkpoint original.

## Capacidades

- Traducción de texto entre los idiomas listados, con el japonés, inglés, chino y coreano entre los principales y cobertura adicional de francés, alemán, español, ruso, árabe, hindi, vietnamita, tailandés e indonesio.
- Control de idioma origen y destino de forma explícita mediante argumentos (`source_lang`, `target_lang`).
- Soporte de glosario terminológico: se pueden fijar traducciones concretas para términos específicos (por ejemplo, "dashboard" → "ダッシュボード").
- Control de registro en japonés: selección entre forma cortés (`polite`) y llana.
- Soporte de contexto e historial de conversación dentro del prompt PFML3, útil para mantener coherencia en traducciones multi-turno.
- Traducción en streaming token a token mediante `translate_stream`.
- Acceso de bajo nivel vía `model.infer(...)`, que pasa argumentos directamente al driver embebido para ajustar parámetros no expuestos en la API de alto nivel.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo permite fijar un glosario con la terminología del producto para mantener consistencia entre versiones en japonés, inglés, español y el resto de idiomas soportados, con un coste de inferencia muy bajo gracias a sus 0,8B parámetros.
- Localización de interfaces y cadenas de UI: la API de streaming y el control de registro en japonés permiten generar textos cortos y adaptados al tono de la aplicación, integrándose en pipelines de build.
- Atención al cliente en varios idiomas: con contexto e historial dentro del prompt PFML3, se pueden traducir conversaciones multi-turno manteniendo referencias previas, siempre que el total quede dentro de los 4096 tokens de caché del export.
- Traducción de correos y comunicaciones internas: el control de registro cortés/llano en japonés resulta adecuado para adaptar el tono según el destinatario (cliente frente a colega).
- Preprocesado en pipelines de datos: traducción de corpus para entrenamiento o evaluación de otros modelos, desplegable en CPU o GPU modesta por el reducido tamaño del modelo.
- Herramientas de escritorio o aplicaciones locales sin conexión: al ser un GGUF ejecutable con loom.cpp, puede integrarse en aplicaciones que requieran traducción offline sin depender de servicios en la nube.
- Traducción de soporte técnico con terminología fija: el glosario permite forzar traducciones de nombres de producto, comandos o mensajes de error que no deben alterarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 890 millones de parámetros, el peso en FP16 rondaría 1,8 GB y en cuantizaciones de 8 bits aproximadamente 0,9 GB, pero el repositorio no especifica el tipo de cuantización del GGUF distribuido.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo, pero no se confirman modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño, aunque no se detallan requisitos oficiales.
- Opciones de despliegue: loom.cpp con el runtime `loom-py-rt` (PyPI, `pip install -U "loom-py-rt[hub]>=1.0.0"`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, el propio checkpoint base `pfnet/plamo-3-translate-0.8b` es la alternativa directa (mismo modelo, formato safetensors y contexto de hasta 32k), mientras que este export prioriza la portabilidad en loom.cpp a costa de reducir la caché a 4096 tokens.

| Modelo | Parámetros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| plamo-3-translate-0.8b-loom (este) | 890.345.090 | 4096 tokens (export) | GGUF (loom.cpp) | PLaMo Community License |
| pfnet/plamo-3-translate-0.8b (base) | 0,8B | hasta 32k | safetensors | PLaMo Community License |
| Otros modelos de traducción | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: la PLaMo Community License permite uso personal y no comercial gratuito, pero el uso comercial exige registro con PFN (para ingresos de hasta 1000 millones de yenes) o un acuerdo separado por encima de esa cifra. Es imprescindible revisar los términos antes de desplegar en producción.
- Contexto reducido en este export: la caché asignada es de 4096 tokens, frente a los 32k del checkpoint original. Fuente, historial, contexto y glosario deben caber en esa ventana; superarla provoca truncamiento o errores.
- Prompting: debe usarse `text2text.translate(text, target_lang=...)`, que construye el prompt PFML3 igual que la plantilla de chat del checkpoint. Usar `infer` directamente continúa con identificadores en bruto y no aplica el formato esperado.
- Decodificación greedy por defecto, tal como recomienda la model card; no se documentan estrategias de muestreo alternativas.
- Riesgo de alucinación y errores de traducción: no se han publicado evaluaciones de calidad ni métricas (BLEU, COMET, etc.) en la información disponible.
- Sesgos: no se documentan sesgos conocidos, pero al no haber datos de evaluación no puede descartarse su presencia, especialmente en idiomas de bajos recursos.
- Cobertura idiomática: aunque la model card menciona 60 idiomas, el repositorio solo lista 13; no se detalla la calidad por par de idiomas.
- Dependencia del ecosistema loom.cpp: el archivo requiere el runtime `loom-py-rt` y no es directamente compatible con otras herramientas de inferencia habituales.
- El repositorio tiene muy poca tracción (53 descargas, 0 likes) y fue creado en noviembre de 2026, por lo que la comunidad y el soporte son limitados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-ai-org/plamo-3-translate-0.8b-loom
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- loom.cpp (motor): https://github.com/loom-ai-org/loom.cpp
- loom-exporter (herramienta de exportación): https://github.com/loom-ai-org/loom-exporter
- loom-py (API de Python): https://github.com/loom-ai-org/loom-py
