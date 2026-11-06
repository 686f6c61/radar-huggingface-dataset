# akm9191/opus-mt-en-ml-int8-onnx

## Resumen

`akm9191/opus-mt-en-ml-int8-onnx` es una exportación a ONNX con cuantización int8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-ml`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT (Jörg Tiedemann y Santhosh Thottingal). El modelo traduce de inglés a malabar (malayalam) y está pensado para inferencia en dispositivo, sin conexión, dentro de la aplicación Android de notas Daily Whisper.

Se trata de un transformer-align de tipo MarianMT con preprocesado de normalización y SentencePiece, entrenado sobre datos OPUS más retro-traducción (opus+bt+bt, 2020-04-28). El repositorio no introduce ningún ajuste fino ni entrenamiento adicional: solo cambia el formato de los pesos a ONNX y los cuantiza a int8 para reducir el tamaño y el coste computacional.

Su relevancia es práctica: el paquete completo ocupa aproximadamente 0,1 GB, con un encoder de unos 32 MB y un decoder con caché KV de unos 52 MB en int8, lo que permite ejecutar traducción inglés-malabar en navegador vía transformers.js o en dispositivos móviles sin GPU dedicada. La licencia Apache 2.0 facilita su redistribución y uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT, variante transformer-align) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (QInt8, per-channel, reduce_range) sobre ONNX Runtime |
| Idiomas soportados | inglés (en) y malabar (ml) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX cuantizado (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base es un MarianMT de tipo transformer-align, una arquitectura encoder-decoder estándar orientada a traducción automática neuronal. El preprocesado combina normalización de texto y tokenización SentencePiece. El entrenamiento original se realizó sobre el corpus OPUS junto con datos de retro-traducción (opus+bt+bt) con fecha 2020-04-28, según la model card del autor.

Esta versión concreta se generó exportando el modelo a ONNX con Hugging Face Optimum 1.23.3 (tarea `text2text-generation-with-past`, transformers 4.46.3, torch 2.5.1), produciendo un encoder y un decoder fusionado con caché KV y un conmutador `use_cache_branch`. Posteriormente se cuantizó con ONNX Runtime 1.28.0 mediante `quantize_dynamic` (tipo de peso QInt8, per-channel, reduce_range). El `tokenizer.json` se generó a partir del vocabulario SentencePiece de Marian con el conversor de transformers.js, y el `config.json` se copió del modelo original conservando los valores por defecto de generación (max_length, num_beams, bad_words_ids). No hubo ajuste fino ni entrenamiento adicional.

## Capacidades

- Traducción automática de inglés a malabar, texto a texto.
- Generación con decodificación por haces (beam search) según los valores por defecto del `config.json` heredado del modelo original.
- Ejecución en dispositivo y sin conexión gracias al formato ONNX int8 y a la integración con transformers.js.
- Compatible con cargadores estilo transformers.js y con la disposición de ficheros de los repos `Xenova/opus-mt-*`.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento multi-paso ni capacidades de agente.
- No soporta visión ni audio.
- Capacidad multilingüe limitada al par inglés-malabar.

## Casos de uso

- Traducción offline en aplicaciones móviles: integrado en apps Android como Daily Whisper, el modelo permite traducir notas de inglés a malabar sin conexión, con un paquete de unos 0,1 GB que cabe en el almacenamiento del dispositivo.
- Traducción en el navegador con transformers.js: al estar exportado a ONNX int8, puede cargarse en una web o extensión y ejecutar la traducción en el cliente, evitando enviar texto a servidores externos.
- Procesamiento por lotes de documentos cortos: adecuado para frases y párrafos breves, permite traducir colecciones de notas, mensajes o titulares en pipelines locales.
- Prototipado rápido de sistemas de traducción: sirve como línea base ligera para comparar con otros modelos o para validar flujos de preprocesado y postprocesado antes de escalar a modelos mayores.
- Aplicaciones de privacidad estricta: al ejecutarse en dispositivo, el texto no sale del terminal, lo que encaja en escenarios con requisitos de confidencialidad.
- Herramientas de accesibilidad y aprendizaje de idiomas: puede asistir a hablantes de malabar que consumen contenido en inglés, ofreciendo traducciones inmediatas en entornos con conectividad limitada.
- Integración en asistentes de toma de notas: combinado con reconocimiento de voz o dictado, permite generar versiones en malabar de apuntes redactados en inglés.

## Benchmarks y rendimiento

El modelo original reporta un BLEU de 19,1 en el conjunto Tatoeba.en.ml. El autor indica que la cuantización int8 puede degradar ligeramente la calidad y que no se ha vuelto a evaluar tras la cuantización.

| Benchmark | Modelo original | Esta versión int8 ONNX |
|---|---|---|
| Tatoeba.en.ml (BLEU) | 19,1 | no re-evaluado |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos int8 suman aproximadamente 84 MB (32 MB encoder + 52 MB decoder), por lo que puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) aceleraría la inferencia, pero no es necesaria.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles y navegadores.
- Opciones de despliegue: ONNX Runtime, transformers.js; también puede ejecutarse mediante herramientas compatibles con ONNX. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| akm9191/opus-mt-en-ml-int8-onnx | no disponible | no disponible | BLEU 19,1 (original, Tatoeba.en.ml) | Apache 2.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-en-ml | no disponible | no disponible | BLEU 19,1 (Tatoeba.en.ml) | Apache 2.0 | safetensors/PyTorch |
| Xenova/opus-mt-en-ml | no disponible | no disponible | no disponible | Apache 2.0 | ONNX (transformers.js) |

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos presentes en los corpus OPUS utilizados en el entrenamiento original; no se documentan análisis específicos.
- Riesgo de alucinación: como todo modelo de traducción neuronal, puede generar traducciones incorrectas o inventar contenido en frases ambiguas o dominios alejados de los datos de entrenamiento.
- Limitaciones de contexto e idioma: funciona mejor con frases cortas; la calidad varía según el dominio. El texto malabar mezclado con palabras en inglés (code-mixed o "Manglish") se traduce deficientemente.
- Restricciones de licencia: Apache 2.0 permite uso comercial y redistribución, siempre que se mantengan los avisos de licencia y atribución correspondientes.
- Caveats para producción: no es adecuado para traducciones de alto riesgo; la cuantización int8 puede reducir ligeramente la calidad y no se ha re-evaluado; el `config.json` conserva los valores por defecto de generación del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/akm9191/opus-mt-en-ml-int8-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-ml
- Repositorios Xenova de referencia: https://huggingface.co/Xenova
- Proyecto OPUS-MT (GitHub): https://github.com/Helsinki-NLP/Opus-MT
