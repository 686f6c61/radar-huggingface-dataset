# Devsyril/opus-mt-fr-en-onnx

## Resumen

El modelo `Devsyril/opus-mt-fr-en-onnx` es una exportación en formato ONNX del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-fr-en`, desarrollado por el grupo Helsinki-NLP dentro del proyecto OPUS-MT. Esta conversión, generada con la biblioteca Optimum de Hugging Face, está pensada para su uso con `transformers.js`, lo que permite ejecutar traducciones francés-inglés directamente en el navegador o en entornos JavaScript sin necesidad de un servidor dedicado.

El modelo original pertenece a la familia MarianMT, una arquitectura transformer de tipo encoder-decoder especializada en traducción automática. Aunque el repositorio no proporciona detalles sobre el número de parámetros ni la longitud de contexto, se trata de un modelo de tamaño medio (típicamente alrededor de 300 millones de parámetros en los modelos OPUS-MT), capaz de manejar frases y párrafos de longitud moderada. La relevancia de esta versión ONNX radica en su portabilidad: permite integrar traducción de calidad en aplicaciones web, extensiones de navegador y herramientas de escritorio basadas en JavaScript sin depender de APIs externas.

El repositorio contiene los componentes ONNX estándar para un modelo secuencia a secuencia: `encoder_model.onnx`, `decoder_model.onnx` y `decoder_with_past_model.onnx`, junto con el tokenizer original. Aunque el modelo tiene 0 descargas y 0 likes en el momento de la consulta, su utilidad práctica es evidente para desarrolladores que buscan soluciones de traducción offline y de bajo coste computacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos ONNX estándar) |
| Idiomas soportados | francés (fuente) e inglés (destino) |
| Licencia | no disponible |
| Formato de pesos | ONNX (encoder_model.onnx, decoder_model.onnx, decoder_with_past_model.onnx) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-fr-en` sigue la arquitectura MarianMT, un transformer de tipo encoder-decoder con mecanismo de atención multi-cabeza. MarianMT se entrena con datos paralelos del corpus OPUS, que recopila textos alineados de múltiples dominios (subtítulos, documentos legales, artículos de Wikipedia, etc.). El entrenamiento se realiza con una pérdida de entropía cruzada estándar para tareas de traducción, sin etapas adicionales de RLHF o DPO.

La conversión a ONNX se realizó con Optimum, que exporta los pesos del modelo PyTorch a formato ONNX, manteniendo la misma arquitectura y tokenizer. Esta conversión no implica cambios en el comportamiento del modelo, solo en el formato de almacenamiento y ejecución. El modelo resultante es compatible con `transformers.js`, que utiliza ONNX Runtime Web para ejecutar inferencias en navegadores y entornos Node.js.

No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre técnicas especiales como decodificación especulativa o atención lineal. El modelo es un transformer estándar sin innovaciones arquitectónicas adicionales.

## Capacidades

- Traducción automática de francés a inglés a nivel de frase o párrafo, con calidad aceptable para textos generales.
- Generación de texto secuencia a secuencia: dado un texto en francés, produce su equivalente en inglés.
- Funciona como un modelo de texto a texto (`text2text-generation` en terminología de Hugging Face).
- Ejecución local sin conexión: al ser un modelo ONNX, puede ejecutarse completamente en el cliente, sin enviar datos a servidores externos.
- Compatible con `transformers.js`, lo que permite su uso en aplicaciones web, extensiones de navegador y entornos Node.js.
- No soporta tool calling, agentes ni razonamiento multi-paso; su función es exclusivamente la traducción.

## Casos de uso

- Traducción en tiempo real en aplicaciones de chat o mensajería: el modelo puede integrarse en un cliente web para traducir mensajes entrantes o salientes entre francés e inglés sin latencia de red, gracias a su ejecución local con `transformers.js`.
- Traducción de documentación técnica o manuales: desarrolladores pueden incorporar el modelo en una herramienta de línea de comandos o script para traducir archivos de texto o markdown de francés a inglés, útil en flujos de documentación bilingüe.
- Asistente de redacción para hablantes no nativos: una aplicación de procesamiento de texto puede usar el modelo para sugerir traducciones de frases en francés al inglés, ayudando a usuarios a redactar correos o informes en inglés.
- Traducción de subtítulos o contenido audiovisual: el modelo puede procesar líneas de subtítulos en francés y generar su versión en inglés, integrándose en herramientas de edición de vídeo o plataformas de streaming.
- Integración en extensiones de navegador: una extensión que seleccione texto en francés y muestre su traducción al inglés en un tooltip, todo ejecutado localmente sin enviar el contenido a servicios externos, lo que garantiza privacidad.
- Traducción de contenido generado por usuarios en foros o redes sociales: plataformas que necesiten moderar o mostrar contenido multilingüe pueden usar el modelo para traducir comentarios o publicaciones de francés a inglés de forma automática y económica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas como BLEU, MMLU o HumanEval, ni comparaciones con otros modelos de traducción. Para una evaluación cuantitativa, se recomienda consultar la ficha del modelo original `Helsinki-NLP/opus-mt-fr-en` en Hugging Face, donde el equipo de Helsinki-NLP suele reportar puntuaciones BLEU sobre conjuntos de prueba estándar como WMT o Tatoeba.

## Requisitos de hardware

- El modelo en formato ONNX puede ejecutarse en CPU sin necesidad de GPU. El tamaño del repositorio (0.9 GB) sugiere que los pesos ocupan aproximadamente ese espacio en disco, pero la memoria RAM necesaria durante la inferencia será menor (alrededor de 300-500 MB, dependiendo de la longitud de la secuencia).
- En navegadores, se puede ejecutar mediante WebAssembly con ONNX Runtime Web. No se requiere tarjeta gráfica; cualquier ordenador o dispositivo móvil moderno con soporte para WebAssembly es suficiente.
- En entornos Node.js, se puede usar ONNX Runtime Node, también en CPU.
- Para despliegue en servidores, se puede servir como un endpoint de inferencia con ONNX Runtime o mediante la integración con `transformers.js` en una API. No es necesario un GPU, aunque para alto rendimiento se podría usar una GPU modesta (por ejemplo, una RTX 3060) para acelerar la inferencia por lotes.
- La latencia estimada por frase es del orden de decenas de milisegundos en CPU moderna (por ejemplo, 50-100 ms para frases de 20 tokens), aunque depende de la implementación y del hardware. El throughput típico es de 10-20 frases por segundo en un núcleo de CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| `Devsyril/opus-mt-fr-en-onnx` | MarianMT | no disponible | no disponible | fr→en | no disponible | ONNX |
| `Helsinki-NLP/opus-mt-fr-en` | MarianMT | ~300M (estimado) | 512 (típico) | fr→en | CC-BY-4.0 (según ficha original) | PyTorch |
| `Helsinki-NLP/opus-mt-en-fr` | MarianMT | ~300M (estimado) | 512 (típico) | en→fr | CC-BY-4.0 (según ficha original) | PyTorch |
| `facebook/nllb-200-distilled-600M` | Transformer (encoder-decoder) | 600M | 1024 | 200 idiomas | CC-BY-NC-4.0 | PyTorch |

La comparativa se basa en información pública de los modelos originales. La versión ONNX es una conversión directa del modelo `Helsinki-NLP/opus-mt-fr-en`, por lo que su rendimiento es equivalente al del original. La alternativa `opus-mt-en-fr` cubre la dirección inversa, mientras que `NLLB-200` ofrece soporte multilingüe más amplio pero con una licencia más restrictiva (no comercial).

## Limitaciones y advertencias

- El modelo es un sistema de traducción automática neuronal de tamaño reducido; puede producir errores en textos con jerga técnica, modismos, ambigüedades o estructuras sintácticas complejas.
- Al ser una conversión ONNX, no se han realizado ajustes adicionales sobre el modelo original; cualquier sesgo presente en el entrenamiento de OPUS-MT se mantiene (por ejemplo, posibles sesgos de género o de dominio).
- No se dispone de información sobre la licencia del modelo en este repositorio. Aunque el modelo original de Helsinki-NLP suele distribuirse bajo CC-BY-4.0, esta versión ONNX no declara licencia explícita, lo que puede generar incertidumbre legal para uso comercial. Se recomienda contactar al autor o consultar la ficha del modelo original.
- La longitud de contexto no está documentada; los modelos MarianMT típicos manejan hasta 512 tokens, pero secuencias más largas pueden degradar el rendimiento o fallar.
- El modelo solo traduce de francés a inglés; no soporta otros idiomas ni direcciones de traducción.
- No es adecuado para tareas que requieran razonamiento, generación creativa o interacción conversacional; su única función es la traducción literal.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente probado por la comunidad; se recomienda validar su comportamiento en el caso de uso específico antes de desplegarlo en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Devsyril/opus-mt-fr-en-onnx
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-fr-en
- Modelo inverso (en→fr): https://huggingface.co/Helsinki-NLP/opus-mt-en-fr
- Repositorio del proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Documentación de Optimum para exportación ONNX: https://huggingface.co/docs/optimum/index
