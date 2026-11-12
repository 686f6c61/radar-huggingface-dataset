# ChatPanel/bert-base-multilingual-cased-ner-hrl

## Resumen

`ChatPanel/bert-base-multilingual-cased-ner-hrl` es una copia sin modificaciones del modelo `Xenova/bert-base-multilingual-cased-ner-hrl` (commit `263e82c06569c8c2ac46238a7ae5107598934234`), publicada por ChatPanel para centralizar la descarga de los modelos que ejecuta su pasarela (gateway). No se ha reentrenado, convertido ni editado nada: los ficheros son idénticos byte a byte a los del repositorio upstream. La autoría real del modelo corresponde a los autores de `Davlan/bert-base-multilingual-cased-ner-hrl`.

Se trata de un modelo BERT base multilingüe (arquitectura transformer encoder-only) especializado en reconocimiento de entidades nombradas (NER) mediante clasificación de tokens, distribuido en formato ONNX cuantizado. El repositorio ocupa 0,2 GB y contiene únicamente el grafo `onnx/model_quantized.onnx` junto con el tokenizador y el `config.json`, lo que lo hace adecuado para inferencia ligera en CPU o en entornos con recursos limitados.

Su relevancia es operativa más que técnica: al ser un espejo de un modelo ya convertido a ONNX por Xenova, permite a la pasarela de ChatPanel resolver la descarga desde un único origen sin depender de terceros. La ficha siguiente describe las características del modelo subyacente, no aportaciones nuevas del repositorio espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder-only) para clasificación de tokens (NER) |
| Parametros totales | no disponible (el modelo base BERT base tiene ~110 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT base admite hasta 512 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | ONNX cuantizado (`onnx/model_quantized.onnx`); no se detalla el esquema exacto |
| Idiomas soportados | no disponible (el nombre indica "multilingual"; la lista concreta no figura en la informacion) |
| Licencia | AFL-3.0 (Academic Free License 3.0), heredada del upstream |
| Formato de pesos | ONNX (`model_quantized.onnx`) y tokenizador JSON; no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un BERT base multilingüe con cabecera de clasificación de tokens para NER, entrenado por los autores de `Davlan/bert-base-multilingual-cased-ner-hrl` (el nombre "hrl" hace referencia a un conjunto de lenguas de recursos altos, si bien la composición exacta no se detalla en la información proporcionada). La información disponible no incluye el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO; en un modelo encoder-only de clasificación de tokens estos procedimientos no son habituales, pero no se confirma.

El repositorio de ChatPanel no introduce ninguna innovación técnica: es un espejo del artefacto ONNX generado por Xenova, que convierte los pesos originales a un grafo ONNX cuantizado para su ejecución con ONNX Runtime. No hay decodificación especulativa, atención lineal ni modificaciones arquitectónicas; la única particularidad es la cuantización del grafo para reducir el tamaño y acelerar la inferencia.

## Capacidades

- Reconocimiento de entidades nombradas (NER): etiquetado a nivel de token de entidades como personas, organizaciones y localizaciones (el conjunto exacto de etiquetas no se detalla en la información proporcionada).
- Procesamiento multilingüe: el nombre del modelo indica cobertura de múltiples idiomas, aunque la lista concreta no está disponible.
- Inferencia eficiente en CPU: al estar en ONNX cuantizado, puede ejecutarse con ONNX Runtime sin GPU.
- Integración en pipelines de NLP: adecuado como componente de extracción de entidades dentro de flujos mayores (anonimización, indexación, enriquecimiento de datos).
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni comportamiento agéntico: es un modelo discriminativo de clasificación de tokens.
- No dispone de modo "thinking" ni capacidades multimodales.

## Casos de uso

- Anonimización de datos personales en pipelines de datos: el modelo etiqueta tokens correspondientes a nombres de personas y organizaciones, lo que permite enmascararlos antes de almacenar o compartir textos; su formato ONNX cuantizado facilita desplegarlo en el mismo proceso de preprocesado sin GPU.
- Extracción de entidades en atención al cliente: procesar transcripciones o correos para identificar empresas, personas y lugares mencionados y enrutar los tickets al equipo adecuado, ejecutando el modelo en CPU dentro del backend.
- Enriquecimiento de índices de búsqueda: extraer entidades de documentos multilingües antes de indexarlos, de modo que las consultas puedan filtrarse por organización o localización.
- Procesamiento por lotes en entornos sin GPU: al ser un grafo ONNX cuantizado de 0,2 GB, puede ejecutarse con ONNX Runtime en servidores modestos o en el edge para clasificar grandes volúmenes de texto.
- Preetiquetado para anotación humana: generar etiquetas NER automáticas que los anotadores revisan, reduciendo el coste de construir corpus etiquetados en varios idiomas.
- Cumplimiento y moderación de contenido: detectar menciones a organizaciones o personas en textos generados por usuarios para aplicar políticas de contenido o trazabilidad.
- Normalización de datos en ETL: extraer entidades de campos de texto libre (direcciones, notas) antes de cargarlas en un almacén estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica estrictamente; el artefacto es un ONNX cuantizado de 0,2 GB que cabe en memoria de CPU. En GPU, el consumo sería inferior a 1 GB, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no disponibles; el modelo está pensado para ejecutarse con ONNX Runtime, que funciona tanto en CPU como en GPU.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del grafo (0,2 GB); no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime (principal, dado el formato), y de forma indirecta mediante los runners de transformers.js de Xenova; no se incluyen pesos en safetensors, GGUF ni formatos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ChatPanel/bert-base-multilingual-cased-ner-hrl | no disponible (~110 M en BERT base, sin confirmar) | no disponible | ONNX cuantizado | AFL-3.0 | Espejo sin cambios de Xenova; NER multilingüe |
| Davlan/bert-base-multilingual-cased-ner-hrl | no disponible (~110 M, sin confirmar) | no disponible | safetensors/PyTorch (no confirmado) | no disponible | Modelo original del que deriva el espejo |
| Xenova/bert-base-multilingual-cased-ner-hrl | no disponible (~110 M, sin confirmar) | no disponible | ONNX | no disponible | Conversión ONNX upstream; mismo artefacto que el espejo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; las tres comparten los mismos pesos, por lo que la diferencia se limita al formato de distribución y a la licencia declarada.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no corrige sesgos, errores ni limitaciones del modelo original; cualquier problema del upstream se hereda íntegramente.
- Riesgo de alucinación: en un modelo de clasificación de tokens el riesgo se manifiesta como falsos positivos y negativos en las etiquetas de entidades, no como texto inventado.
- Sesgos conocidos: no se documentan en la información proporcionada; los modelos BERT multilingües entrenados con corpus web suelen reflejar sesgos de dichos corpus, pero no se confirma para este caso.
- Limitaciones de contexto e idioma: la longitud máxima de secuencia y la lista de idiomas no están disponibles en la información proporcionada; el nombre indica multilingüismo, pero no se garantiza cobertura uniforme.
- Restricciones de licencia: AFL-3.0 permite uso comercial, pero impone obligaciones de atribución y de distribución del código fuente de las modificaciones; conviene revisar los términos antes de integrarlo en productos propietarios.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, y fue creado el 2026-11-12; es un artefacto de infraestructura de ChatPanel, no un modelo validado por la comunidad. Para uso en producción conviene verificar la integridad de los ficheros con los SHA-256 publicados y, si es posible, referenciar el repositorio upstream de Xenova o Davlan.
- No incluye pesos en formatos habituales de servidores de inferencia (safetensors, GGUF), lo que limita las opciones de despliegue a ONNX Runtime y ecosistemas compatibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChatPanel/bert-base-multilingual-cased-ner-hrl
- Upstream ONNX: https://huggingface.co/Xenova/bert-base-multilingual-cased-ner-hrl
- Modelo base original: https://huggingface.co/Davlan/bert-base-multilingual-cased-ner-hrl
