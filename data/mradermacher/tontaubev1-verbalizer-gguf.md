# mradermacher/TontaubeV1-Verbalizer-GGUF

## Resumen

TontaubeV1-Verbalizer es un modelo de normalización de texto y verbalización orientado a pipelines de síntesis de voz (text-to-speech). Lo desarrolla TontaubeAI y esta versión concreta la publica mradermacher como conjunto de cuantizaciones GGUF estáticas del modelo original en formato transformers. El modelo resuelve el paso previo a la síntesis de voz: transformar texto escrito en bruto (números, abreviaturas, símbolos, formatos) en una forma verbalizada y pronunciable por un motor TTS. Con 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) y licencia Apache 2.0, es un modelo compacto y desplegable en hardware modesto.

La relevancia de esta ficha reside en que el repositorio es una distribución de cuantizaciones (Q2_K a f16) del modelo base TontaubeAI/TontaubeV1-Verbalizer, no un modelo nuevo. El autor de las cuantizaciones no aporta información sobre arquitectura interna, datos de entrenamiento ni evaluación; la model card se limita a listar los ficheros GGUF y su tamaño. Por tanto, gran parte de las especificaciones técnicas que siguen deben tratarse como no disponibles y no deben inferirse.

El modelo está etiquetado para inglés (`en`) y para la tarea de normalización/verbalización de texto, con pipeline declarado como text-to-speech. Su utilidad práctica es como componente intermedio de un sistema TTS, no como generador de texto general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no detallada en la model card; el repo base usa `transformers`) |
| Parametros totales | 1.720.574.976 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (GGUF estáticas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. La model card de la versión GGUF no describe el tipo de transformer, el número de capas, la dimensión oculta, la estrategia de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único verificable es el recuento de parámetros (1.720.574.976) y que el modelo base se publica bajo la librería `transformers`. Las cuantizaciones son estáticas y, según el autor, no hay versiones con imatrix/weighted disponibles en el momento de la publicación; el autor señala que podrían solicitarse mediante una discusión comunitaria. Cualquier afirmación adicional sobre arquitectura o entrenamiento sería especulativa y no se incluye.

## Capacidades

- Normalización de texto para TTS: conversión de texto escrito a forma verbalizada (números, abreviaturas, símbolos y formatos) según la etiqueta `text-normalization` y `verbalization`.
- Verbalización orientada a pronunciación: preparación de cadenas para que un motor de síntesis de voz las lea correctamente.
- Procesamiento en inglés: el modelo declara únicamente el idioma `en`.
- Integración en pipelines `transformers` (modelo base) y en runtimes compatibles con GGUF (versión cuantizada).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; no disponibles.

## Casos de uso

- Preprocesado en pipelines TTS: insertar el modelo antes del sintetizador para convertir texto en bruto en una secuencia verbalizada y pronunciable, reduciendo errores de lectura de números y abreviaturas.
- Locución automática de contenidos: verbalizar artículos, noticias o documentación en inglés antes de enviarlos a un motor de voz para audiolibros o podcasts generados.
- Asistentes de voz y sistemas de respuesta por voz (IVR): normalizar respuestas generadas por otros sistemas antes de su lectura, en flujos donde el texto de entrada contiene cifras, fechas o unidades.
- Accesibilidad: preparar contenido textual para lectores de pantalla o sistemas de lectura asistida que requieren una forma verbalizada coherente.
- Despliegue en hardware limitado: al ser un modelo de ~1,7 B de parámetros con cuantizaciones desde 0,9 GB (Q2_K), puede ejecutarse en entornos con recursos restringidos mediante llama.cpp u Ollama, integrándose en servicios de normalización de bajo coste.
- Procesamiento por lotes de corpus: normalizar grandes volúmenes de texto en inglés antes de su síntesis o de su uso en sistemas de voz, usando las cuantizaciones Q4_K_S/Q4_K_M recomendadas por el autor por su velocidad.
- Componente de un sistema modular TTS: sustituir reglas heurísticas de normalización por un modelo aprendido en la fase previa a la síntesis, manteniendo el motor TTS existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~0,9 GB; Q3_K_S/M/L ~1,0-1,1 GB; IQ4_XS ~1,1 GB; Q4_K_S/M ~1,2 GB; Q5_K_S/M ~1,3-1,4 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,5 GB. Estas cifras son el tamaño de los ficheros y no incluyen el overhead del runtime (contexto, buffers), por lo que la VRAM real será superior.
- GPU recomendadas: cualquier GPU consumer con al menos ~2-4 GB de VRAM libre puede alojar las cuantizaciones Q4-Q8; para f16 se recomienda al menos ~4-6 GB efectivos. GPU de datacenter (A100, H100) no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas actuales (por ejemplo, RTX 3060 en adelante) con cuantizaciones Q4-Q8.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; `transformers` para el modelo base; vLLM y TGI son opciones para el modelo base en formato transformers, aunque no se documenta compatibilidad específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de normalización/verbalización TTS en la documentación proporcionada, por lo que la comparativa se limita a los datos verificables de este modelo frente a su propio modelo base.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TontaubeV1-Verbalizer (GGUF, este repo) | ~1,72 B | no disponible | GGUF (Q2_K-f16) | Apache 2.0 | Cuantizaciones estáticas; sin imatrix |
| TontaubeAI/TontaubeV1-Verbalizer (base) | ~1,72 B | no disponible | transformers/safetensors | Apache 2.0 | Modelo original |
| Alternativas de normalización TTS | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse presumiblemente con datos en inglés, puede reflejar sesgos de ese corpus, pero no hay información al respecto.
- Riesgo de alucinación: no evaluado; en tareas de normalización, el riesgo relevante es la alteración del contenido (verbalizaciones incorrectas de cifras o abreviaturas), no la generación libre.
- Limitaciones de contexto e idioma: solo se declara inglés (`en`); no se especifica la longitud de contexto soportada, lo que impide garantizar el procesamiento de entradas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación con atribución; conviene conservar los avisos de licencia del modelo base y del cuantizador.
- Caveats de producción: las cuantizaciones son estáticas y no hay versiones imatrix/weighted, lo que puede afectar a la calidad en cuantizaciones bajas (Q2_K, Q3_K_M marcada como "lower quality" por el autor). Para producción se recomienda Q4_K_S/Q4_K_M o superiores.
- Trazabilidad: el repositorio de cuantización no documenta arquitectura, datos ni evaluación; para decisiones críticas debe consultarse el modelo base y validarse empíricamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/TontaubeV1-Verbalizer-GGUF
- Modelo base: https://huggingface.co/TontaubeAI/TontaubeV1-Verbalizer
- Página de descargas del cuantizador: https://hf.tst.eu/model#TontaubeV1-Verbalizer-GGUF
- Guía de uso de GGUF (referencia del autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
