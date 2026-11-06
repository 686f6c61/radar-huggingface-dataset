# HackitzLabs/opus-mt-en-tl

## Resumen

opus-mt-en-tl es un modelo de traducción automática neuronal para el par inglés-tagalo/filipino, publicado por HackitzLabs como conversión ONNX cuantizada del modelo original Helsinki-NLP/opus-mt-en-tl. Se trata de una adaptación orientada a la inferencia en dispositivo mediante transformers.js, la librería de Hugging Face para ejecutar modelos en JavaScript (navegador y Node.js), y se emplea en la aplicación JustMail para Windows del mismo autor. El modelo base pertenece a la familia OPUS-MT, desarrollada por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (Jörg Tiedemann et al.) y entrenada con datos del corpus OPUS.

La relevancia de esta ficha es doble: por un lado, documenta una conversión práctica de un modelo Marian NMT a ONNX int8 para despliegue ligero; por otro, advierte de que el resultado es una traducción formal y de manual, útil como primer borrador pero no como traducción final sin revisión. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma su orientación a entornos con recursos limitados.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento más allá de la referencia al corpus OPUS y a la arquitectura Marian heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traducción automática), convertido a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (cuantización aplicada en la conversión ONNX) |
| Idiomas soportados | inglés (en) y tagalo/filipino (tl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformers.js), repositorio de 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder diseñado específicamente para traducción automática neuronal, tal como se distribuye en la familia OPUS-MT. La conversión realizada por HackitzLabs no modifica los pesos: únicamente transforma el modelo original a formato ONNX y aplica cuantización int8 para su uso en dispositivo con transformers.js (scripts del conversor de transformers.js v2.17.2). No hubo fine-tuning ni ajuste adicional sobre el modelo base.

El entrenamiento original procede de Helsinki-NLP/opus-mt-en-tl, entrenado con datos del corpus OPUS, una colección de corpus paralelos multilingües. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; estos datos deben consultarse en la documentación del modelo base. La referencia académica del proyecto es Tiedemann y Thottingal (2020), *OPUS-MT — Building open translation services for the World*, presentado en EAMT 2020.

## Capacidades

- Traducción de texto de inglés a tagalo/filipino, tarea principal del pipeline `translation`.
- Generación de texto seq2seq mediante el pipeline `text2text-generation`.
- Ejecución en dispositivo (navegador y Node.js) a través de transformers.js con pesos ONNX cuantizados en int8.
- Integración en aplicaciones de escritorio, como JustMail para Windows, según indica el autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Soporte multilingüe limitado al par en-tl; no se indica traducción inversa ni otros pares.

## Casos de uso

- Traducción de correo electrónico en aplicaciones de escritorio: el modelo se integra en JustMail para Windows y permite traducir mensajes en inglés a tagalo directamente en el cliente, sin enviar el texto a un servidor externo, gracias a su formato ONNX y su tamaño reducido (0,1 GB).
- Traducción en el navegador: al ejecutarse con transformers.js, puede desplegarse en una web o extensión para traducir contenido en inglés a tagalo en el propio dispositivo, preservando la privacidad del texto del usuario.
- Pre-traducción de documentación técnica: útil para generar un primer borrador de manuales o guías en inglés hacia tagalo, que después revise un traductor humano, dado el carácter formal de la salida.
- Localización de interfaces de usuario: traducción de cadenas cortas y mensajes de aplicación en pipelines de localización, donde el volumen es alto y el coste de una revisión humana por cadena es asumible.
- Herramientas de accesibilidad y lectura: traducción al vuelo de artículos o textos en inglés para hablantes de tagalo en entornos con conectividad limitada o requisitos de privacidad.
- Prototipado de sistemas de traducción: servir como línea base ligera en experimentos de NMT o en la evaluación de pipelines de traducción antes de escalar a modelos mayores.
- Traducción por lotes en servidores sin GPU: al ser un modelo pequeño en ONNX int8, puede ejecutarse en CPU para procesar grandes volúmenes de texto con requisitos de hardware mínimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB en formato ONNX int8, por lo que la huella de memoria es muy reducida y compatible con CPU.
- GPU recomendadas: no se especifican; por tamaño, el modelo puede ejecutarse en CPU y en GPU de consumo como GTX 1650, RTX 3060 o superiores, aunque no hay datos oficiales de rendimiento.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con unos pocos cientos de MB de memoria libre, aunque no se han publicado mediciones.
- Opciones de despliegue: transformers.js (principal, con ONNX Runtime Web/Node), y potencialmente ONNX Runtime directamente; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| HackitzLabs/opus-mt-en-tl | no disponible | no disponible | en, tl | Apache 2.0 | ONNX int8 | Conversión cuantizada para transformers.js, sin fine-tuning |
| Helsinki-NLP/opus-mt-en-tl | no disponible | no disponible | en, tl | Apache 2.0 | safetensors/PyTorch (formato original de OPUS-MT) | Modelo base original, pensado para servidor con transformers |
| Otros modelos OPUS-MT (p. ej., en-it) | no disponible | no disponible | pares según modelo | Apache 2.0 | PyTorch | Misma familia y arquitectura Marian; distinto par de idiomas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La salida es tagalo/filipino formal y de manual; el propio autor recomienda tratarla como un primer borrador y no como traducción final.
- Riesgo de alucinación y de traducciones inexactas en textos coloquiales, jerga, nombres propios o dominios especializados, inherente a los modelos NMT entrenados con corpus paralelos.
- Sesgos potenciales heredados de los datos de OPUS, cuya composición y cobertura no se detallan en la model card.
- Limitación de idioma: solo cubre inglés a tagalo/filipino; no se documenta traducción inversa ni otros pares.
- No se especifican la longitud máxima de contexto ni el comportamiento con entradas largas; conviene validar el truncamiento en producción.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución al proyecto OPUS-MT y a la Universidad de Helsinki según los términos de la licencia.
- El modelo no ha sido fine-tuneado; cualquier adaptación a dominio requeriría entrenamiento adicional por parte del usuario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso o validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HackitzLabs/opus-mt-en-tl
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-tl
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Corpus OPUS: https://opus.nlpl.eu/
- transformers.js: https://github.com/huggingface/transformers.js
- Tutorial relacionado sobre OPUS-MT (en-it): https://aiindigo.com/tutorials/getting-started-with-opus-mt-english-to-italian-high-quality-neural-translation
