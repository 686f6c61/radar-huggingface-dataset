# Devsyril/opus-mt-ee-fr-onnx

## Resumen

El modelo `Devsyril/opus-mt-ee-fr-onnx` es una conversión a formato ONNX del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-ee-fr`, perteneciente a la familia OPUS-MT desarrollada por la Universidad de Helsinki. Esta versión está optimizada para su uso con la librería `transformers.js`, lo que permite ejecutar inferencias de traducción directamente en navegadores web o entornos Node.js sin necesidad de infraestructura de servidor dedicada.

El modelo original es un sistema de traducción basado en la arquitectura MarianMT (un transformer encoder-decoder), entrenado con corpus paralelos del proyecto OPUS. La conversión ONNX mantiene los componentes estándar para modelos seq2seq (encoder, decoder y decoder con caché de estados), junto con el tokenizer original. El repositorio tiene un tamaño de 0,9 GB, lo que sugiere un modelo de dimensiones moderadas, aunque no se dispone de la cifra exacta de parámetros.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y portable para integraciones de traducción estonio-francés en aplicaciones web y clientes ligeros, aprovechando la aceleración por hardware y la compatibilidad multiplataforma de ONNX. Sin embargo, al ser una exportación reciente con cero descargas y sin licencia declarada, su uso en producción requiere verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (Transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo ONNX sin cuantizar aparente) |
| Idiomas soportados | estonio (ee) a frances (fr) segun nombre del modelo |
| Licencia | no disponible |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`, `decoder_with_past_model.onnx`) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-ee-fr` utiliza la arquitectura MarianMT, un transformer seq2seq estándar con mecanismos de atención multi-cabeza. El entrenamiento se realizó con los corpus paralelos de OPUS, un conjunto de datos multilingüe curado por la Universidad de Helsinki, aunque no se dispone de detalles específicos sobre el número de tokens o el proceso de entrenamiento en la información proporcionada.

La conversión a ONNX se realizó con la librería `optimum` de Hugging Face, que exporta los pesos del modelo PyTorch original a un formato optimizado para inferencia. Se incluyen tres componentes ONNX: el encoder, el decoder y el decoder con caché de estados (para generación autoregresiva más rápida). No se menciona ningún proceso de fine-tuning posterior ni técnicas de RLHF/DPO.

## Capacidades

- Traduccion automatica de estonio a frances, con generacion de texto en formato seq2seq.
- Compatible con `transformers.js` para inferencia en navegador y Node.js mediante ONNX Runtime Web.
- Soporte para generacion autoregresiva con caché de estados (`decoder_with_past_model.onnx`), lo que acelera la decodificacion en iteraciones sucesivas.
- Integracion sencilla con la API de `transformers` de Python a traves de `ORTModelForSeq2SeqLM` de `optimum.onnxruntime`.
- No se han documentado capacidades adicionales como tool calling, agentes, vision o audio.

## Casos de uso

- Traduccion en tiempo real en aplicaciones web: al estar optimizado para `transformers.js`, puede integrarse en paginas web para traducir texto estonio a frances sin necesidad de servidor, usando WebAssembly o WebGPU.
- Extension de navegador para traduccion de contenido: un plugin que detecte texto en estonio y lo traduzca al frances localmente, preservando la privacidad del usuario.
- Aplicaciones de chat o mensajeria con soporte bilingue: incorporar el modelo en un cliente de escritorio o movil para traducir mensajes entre hablantes de estonio y frances.
- Procesamiento por lotes en entornos Node.js: usar el modelo para traducir documentos o archivos en servidores ligeros, aprovechando la eficiencia de ONNX Runtime.
- Educacion y aprendizaje de idiomas: herramienta para practicar traduccion estonio-frances con retroalimentacion inmediata en un entorno offline.
- Prototipado rapido de pipelines de traduccion: gracias a la compatibilidad con `transformers` y `optimum`, se puede integrar facilmente en experimentos de investigacion o demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre métricas de calidad (BLEU, chrF, etc.) ni comparaciones con otros modelos de traducción en la documentación del repositorio ni en los resultados de búsqueda.

## Requisitos de hardware

- El tamaño del repositorio es de 0,9 GB, lo que sugiere que los archivos ONNX pueden cargarse en memoria con relativa facilidad.
- Al ser un modelo seq2seq de tamaño moderado, puede ejecutarse en CPU sin GPU, aunque la velocidad dependerá de la longitud del texto y del hardware.
- Para uso en navegador, se recomienda WebAssembly (WASM) o WebGPU para obtener un rendimiento aceptable.
- En entornos Python, puede usarse con ONNX Runtime (CPU o GPU) mediante `optimum.onnxruntime`.
- No se dispone de datos de VRAM específica, latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de traducción estonio-francés. No se han encontrado modelos alternativos en la búsqueda web ni en la documentación del repositorio.

## Limitaciones y advertencias

- No se ha declarado una licencia, lo que impide conocer las restricciones de uso comercial o redistribución. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El modelo es una exportación ONNX del original de Helsinki-NLP, por lo que su calidad de traducción depende del modelo base, que puede tener sesgos o errores en dominios especializados.
- No se especifican limitaciones de contexto ni de longitud de entrada; se debe asumir que es la típica de MarianMT (ventana de contexto limitada).
- Al ser una conversión sin cuantización aparente, el tamaño de 0,9 GB puede ser elevado para aplicaciones web con restricciones de descarga.
- No se proporcionan métricas de rendimiento ni benchmarks, por lo que no se puede evaluar objetivamente su calidad frente a otros sistemas.
- El modelo no ha recibido descargas ni interacciones, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Devsyril/opus-mt-ee-fr-onnx
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-ee-fr
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Documentacion de Optimum: https://github.com/huggingface/optimum
