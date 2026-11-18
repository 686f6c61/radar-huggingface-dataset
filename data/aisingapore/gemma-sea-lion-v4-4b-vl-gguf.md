# aisingapore/Gemma-SEA-LION-v4-4B-VL-GGUF

## Resumen

Gemma-SEA-LION-v4-4B-VL es un modelo de visión y lenguaje (VLM) de 4.000 millones de parámetros desarrollado por el pilar de productos de IA de AI Singapore (A*STAR), construido mediante ajuste fino sobre `google/gemma-3-4b-it`. Su objetivo es adaptar un modelo multimodal de propósito general al sudeste asiático, cubriendo idiomas como indonesio, vietnamita, tailandés, filipino, tamil, birmano y malayo, además de inglés y chino. Esta ficha corresponde concretamente al repositorio de cuantizaciones GGUF, pensado para inferencia local y despliegue ligero.

El modelo hereda la arquitectura decoder de Gemma 3 y su ventana de contexto de 128.000 tokens, e incorpora un post-entrenamiento sobre aproximadamente 6,7 millones de pares instrucción-texto curados para la región. Además del multilingüismo, el ajuste añade capacidades de function calling y de parsing visual en tailandés, chino e inglés. Con licencia MIT, es una opción poco habitual en el nicho de VLM pequeños con cobertura real de lenguas del sudeste asiático.

La relevancia actual reside en la combinación de tres factores: tamaño reducido (apto para GPUs de consumo), contexto largo y soporte multimodal con tool calling, todo bajo una licencia permisiva que facilita su uso comercial en productos regionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Gemma 3), multimodal imagen-texto |
| Parámetros totales | 3.880.263.168 (~3,9 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | Q4_K_M, Q6_K, Q8_0, F16 (GGUF); proyector multimodal `mmproj` en GGUF |
| Idiomas soportados | en, zh, vi, id, th, fil, ta, ms, my (birmano, filipino, indonesio, malayo, tamil, tailandés, vietnamita, inglés, chino) |
| Licencia | MIT |
| Formato de pesos | GGUF (incluye fichero `mmproj` para la torre visual) |
| Modelo base | google/gemma-3-4b-it |
| Tokenizador | tokenizador por defecto de gemma-3-4b-it |
| Tamaño del repositorio | 18,4 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de la familia Gemma 3, con la torre visual original de `gemma-3-4b-it` intacta y un post-entrenamiento supervisado sobre un corpus curado de aproximadamente 6,7 millones de pares instrucción-texto. Según la model card, los datos de entrenamiento abarcan birmano, inglés, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita, procedentes de web, código, datasets abiertos y datos sintéticos, con un total de 500.000 millones de tokens muestreados de un pool de 1 billón. No se especifica en la información disponible si hubo fases de RLHF o DPO, ni detalles sobre la composición exacta del dataset de instrucciones.

Como innovaciones destacables, el ajuste incorpora function calling (a partir de un subconjunto filtrado de pares instrucción-herramienta de código abierto) y mejora el parsing visual en tailandés, chino e inglés. El tokenizador es el nativo de Gemma 3, sin extensión de vocabulario para lenguas del SEA, lo que implica que la cobertura multilingüe depende de la tokenización subyacente del modelo base.

## Capacidades

- Generación de texto e instrucciones en inglés, chino y siete lenguas del sudeste asiático.
- Comprensión de imágenes (image-text-to-text) con la torre visual heredada de Gemma 3.
- Parsing visual reforzado en tailandés, chino e inglés.
- Function calling / tool calling para integración en aplicaciones con herramientas externas.
- Conversación multi-turno con contexto de hasta 128.000 tokens.
- Razonamiento y respuesta a instrucciones en registro conversacional.
- Soporte de despliegue en llama.cpp, incluido `llama-mtmd-cli` para entrada de imagen.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Atención al cliente en mercados del SEA: el modelo puede gestionar conversaciones multi-turno en indonesio, vietnamita, tailandés o filipino con hasta 128.000 tokens de contexto, lo que permite arrastrar historiales largos y documentación de producto sin truncar.
- Digitalización de documentos con OCR ligero: extracción de texto e interpretación de facturas, formularios o capturas en tailandés, chino e inglés, aprovechando el refuerzo de parsing visual y su tamaño reducido para ejecución en servidor modesto.
- Asistentes con herramientas en producción: el soporte de function calling permite conectarlo a APIs de reservas, catálogos o sistemas de ticketing, con el modelo decidiendo cuándo invocar cada herramienta.
- Análisis de imágenes en campo: aplicaciones móviles o de borde que envían una foto (producto, placa, ticket) y esperan una descripción o clasificación en la lengua local, desplegando la variante Q4_K_M en hardware de consumo.
- Moderación y enriquecimiento de contenido multilingüe: clasificación y resumen de textos e imágenes en las lenguas cubiertas dentro de pipelines de contenido generado por usuarios.
- Prototipado e investigación en NLP del SEA: base accesible (MIT, GGUF, 4 B) para experimentos de adaptación regional, evaluación de multilingüismo o comparación con modelos mayores de la misma familia.
- Despliegue en local para privacidad: al caber en GPUs de consumo con cuantización Q4_K_M, permite procesar imágenes y texto sensible sin salir de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación comentada en el HTML de origen, sin cifras accesibles.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M, 3,5-4 GB con Q6_K, 4,5-5 GB con Q8_0 y unos 8 GB con F16, sumando el proyector visual `mmproj` y el espacio de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso local; A100 o H100 para servir a varios usuarios en paralelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más usando Q4_K_M o Q6_K; incluso en 4 GB con cuantizaciones más agresivas no listadas aquí.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para imagen), Ollama y cualquier runtime compatible con GGUF; los GGUFs partidos se pueden unir con `gguf-split --merge`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-SEA-LION-v4-4B-VL | ~3,9 B | 128 K | Sí | MIT | Ajuste regional SEA, tool calling |
| google/gemma-3-4b-it | ~4 B | 128 K | Sí | Gemma Terms | Modelo base; sin adaptación SEA |
| aisingapore/Gemma-SEA-LION-v4-27B-IT | ~27 B | no disponible | No (texto) | MIT | Hermano mayor de la familia, solo texto |
| aisingapore/Qwen-SEA-LION-v4-32B-IT | ~32 B | no disponible | No (texto) | MIT | Alternativa de mayor tamaño para texto |

## Limitaciones y advertencias

- Modelo de 4 B: su capacidad de razonamiento complejo y de seguimiento de instrucciones queda por debajo de modelos de 27 B o 32 B de la misma familia.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, especialmente en tareas de extracción de datos de imágenes o en lenguas de bajos recursos.
- El tokenizador no se ha extendido para las lenguas del SEA, por lo que la eficiencia y calidad en birmano, tamil o filipino puede ser inferior a la de idiomas con mejor cobertura en el vocabulario original.
- Cobertura idiomática declarada de nueve lenguas, pero sin métricas públicas que cuantifiquen el rendimiento por idioma.
- El parsing visual reforzado se limita a tailandés, chino e inglés; otras lenguas del SEA no cuentan con esa mejora explícita.
- Licencia MIT permisiva para uso comercial, pero conviene revisar los términos del modelo base Gemma 3 de Google por si imponen condiciones adicionales sobre los pesos derivados.
- No se han publicado benchmarks ni datos de latencia/throughput, lo que dificulta una evaluación previa a producción.
- El repositorio GGUF incluye ficheros partidos; es necesario usar herramientas compatibles con splits o fusionarlos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-4B-VL-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Colección SEA-LION v4: https://huggingface.co/collections/aisingapore/sea-lion-v4
- Modelo relacionado (GGUF 27B): https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT-GGUF
- Modelo relacionado (Qwen 32B 8-bit): https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT-8BIT
- Modelo relacionado (Apertus 8B GGUF): https://huggingface.co/aisingapore/Apertus-SEA-LION-v4-8B-IT-GGUF
- Licencia MIT: https://mit-license.org/
- Guía de gguf-split en llama.cpp: https://github.com/ggerganov/llama.cpp/tree/master/tools/gguf-split
