# Devsyril/opus-mt-en-ee-onnx

## Resumen

El modelo `Devsyril/opus-mt-en-ee-onnx` es una exportación al formato ONNX del modelo de traducción automática neuronal [`Helsinki-NLP/opus-mt-en-ee`](https://huggingface.co/Helsinki-NLP/opus-mt-en-ee), perteneciente a la familia OPUS-MT desarrollada por el grupo de investigación de la Universidad de Helsinki. Su función principal es traducir texto del inglés al estonio, resolviendo la necesidad de traducción automática para un par de lenguas con recursos limitados en comparación con idiomas dominantes.

La relevancia de esta versión ONNX radica en su compatibilidad con entornos de ejecución optimizados como ONNX Runtime y la librería `transformers.js`, lo que permite desplegar el modelo en navegadores web, aplicaciones Node.js o dispositivos con recursos limitados sin necesidad de un framework de deep learning completo. El repositorio incluye los componentes estándar de un modelo seq2seq (encoder, decoder y decoder con caché de past) junto con el tokenizador original.

Al ser una conversión directa del modelo MarianMT original, mantiene las mismas capacidades de traducción, aunque se desconoce si se han aplicado optimizaciones adicionales más allá de la propia exportación. El tamaño del repositorio (0,9 GB) sugiere que los archivos ONNX no están cuantizados, lo que implica un consumo de memoria considerable para su ejecución en dispositivos modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (típicamente 512 en modelos MarianMT, no confirmado) |
| Tipos de cuantizacion | no disponible (el repositorio no indica cuantización) |
| Idiomas soportados | inglés (origen), estonio (destino) |
| Licencia | no disponible |
| Formato de pesos | ONNX (encoder_model.onnx, decoder_model.onnx, decoder_with_past_model.onnx) |

## Arquitectura y entrenamiento

El modelo original `Helsinki-NLP/opus-mt-en-ee` está basado en la arquitectura MarianMT, un transformer encoder-decoder de tamaño similar a los modelos base de la familia OPUS-MT. Estos modelos se entrenan con el corpus OPUS, una colección de textos paralelos extraídos de fuentes públicas como subtítulos, documentos legales y contenido web. El entrenamiento se realiza típicamente con una combinación de pérdida de entropía cruzada y técnicas de regularización, aunque no se dispone de detalles específicos sobre el número de tokens, la composición exacta del dataset o si se aplicaron técnicas de ajuste por refuerzo (RLHF o DPO).

La versión ONNX se genera mediante la herramienta `🤗 Optimum`, que convierte los pesos del modelo PyTorch original a formato ONNX. Esta conversión mantiene la arquitectura y los pesos, pero permite una inferencia más eficiente en entornos con ONNX Runtime, especialmente en CPU. No se han documentado innovaciones técnicas adicionales en esta conversión.

## Capacidades

- Traducción automática de texto en inglés a estonio (texto a texto).
- Procesamiento de secuencias de entrada de longitud variable (limitado por la ventana de contexto del modelo original, normalmente 512 tokens).
- Compatibilidad con el pipeline `translation` de Hugging Face Transformers.
- Ejecución en entornos JavaScript mediante `transformers.js` gracias al formato ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Localización de contenido web: el modelo puede traducir automáticamente páginas web o documentos del inglés al estonio, facilitando la adaptación de sitios para el mercado estonio.
- Traducción de documentación técnica: manuales, guías y especificaciones pueden traducirse de forma eficiente en entornos de producción con ONNX Runtime, sin depender de servicios en la nube.
- Aplicaciones de chat bilingüe: integración en aplicaciones de mensajería o foros para traducir mensajes entre hablantes de inglés y estonio en tiempo real.
- Procesamiento de subtítulos: traducción de subtítulos de vídeos o películas del inglés al estonio, útil para plataformas de streaming o contenido educativo.
- Automatización de correos electrónicos: traducción de correspondencia comercial o personal para empresas que operan en ambos idiomas.
- Herramientas de accesibilidad: traducción de contenido en inglés para hablantes de estonio con limitaciones de comprensión del idioma original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original `Helsinki-NLP/opus-mt-en-ee` podría tener métricas BLEU reportadas en el repositorio de OPUS-MT, pero no se incluyen en los datos proporcionados. Se recomienda consultar la documentación del modelo original para obtener referencias de calidad.

## Requisitos de hardware

- El tamaño del repositorio (0,9 GB) sugiere que los modelos ONNX ocupan aproximadamente 900 MB en disco, lo que implica un consumo de RAM/VRAM de al menos 1-2 GB durante la inferencia.
- Puede ejecutarse en CPU con ONNX Runtime, aunque la velocidad dependerá del hardware. En una CPU moderna de 8 núcleos, se esperan latencias de varios segundos por frase corta.
- En GPU consumer (por ejemplo, RTX 3060 con 12 GB VRAM) la inferencia es más rápida, aunque no se dispone de mediciones concretas.
- Dado que es un modelo seq2seq, requiere memoria proporcional al tamaño del contexto y la longitud de la secuencia generada.
- Opciones de despliegue: ONNX Runtime (Python, C++, JavaScript), `transformers.js` para navegador/Node.js, o servidores de inferencia como ONNX Runtime Server.
- No se recomienda para despliegue en dispositivos embebidos sin cuantización previa.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| `Devsyril/opus-mt-en-ee-onnx` | en→et | MarianMT | ONNX | no disponible | no disponible |
| `Helsinki-NLP/opus-mt-en-ee` (original) | en→et | MarianMT | PyTorch | MIT (según repositorio de OPUS-MT, no verificado) | 512 (típico) |
| `Helsinki-NLP/opus-mt-en-et` (variante) | en→et | MarianMT | PyTorch | MIT (no verificado) | 512 (típico) |

No se dispone de comparativas directas con otros modelos de traducción inglés-estonio en la información proporcionada. Los modelos de Helsinki-NLP son la referencia estándar para este par de idiomas, pero existen alternativas comerciales (Google Translate, DeepL) que no son de código abierto.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio, lo que genera incertidumbre sobre el uso comercial. Se recomienda consultar la licencia del modelo original `Helsinki-NLP/opus-mt-en-ee` (generalmente MIT, pero no confirmado).
- El modelo puede presentar sesgos derivados de los datos de entrenamiento (por ejemplo, dominio de subtítulos o documentos legales), lo que afecta a la naturalidad en registros informales o técnicos específicos.
- Riesgo de alucinaciones en traducciones de frases ambiguas o con errores tipográficos en el texto fuente.
- La longitud de contexto no está documentada; si es 512 tokens, las traducciones de textos largos deberán segmentarse, lo que puede degradar la coherencia.
- El formato ONNX sin cuantización implica un uso elevado de memoria, no apto para dispositivos con menos de 2 GB de RAM.
- No se garantiza soporte para variantes dialectales del estonio o inglés.

## Enlaces

- Modelo en Hugging Face: [Devsyril/opus-mt-en-ee-onnx](https://huggingface.co/Devsyril/opus-mt-en-ee-onnx)
- Modelo original: [Helsinki-NLP/opus-mt-en-ee](https://huggingface.co/Helsinki-NLP/opus-mt-en-ee)
- Repositorio de OPUS-MT: [Helsinki-NLP/Opus-MT](https://github.com/Helsinki-NLP/Opus-MT)
- Proyecto de ejemplo con ONNX Runtime: [lookbe/opus-mt-onnx](https://github.com/lookbe/opus-mt-onnx)
- Página de modelos OPUS-MT: [OPUS-MT Factory](https://blogs.helsinki.fi/opusmt-factory/models/)
