# asounimelb/whisper-small-ckb-onnx

## Resumen

Whisper Small: Central Kurdish (ONNX) es un ajuste fino de `openai/whisper-small` (244 millones de parametros) especializado en reconocimiento automatico de voz en kurdo central o sorani (`ckb`), publicado por el usuario asounimelb. El modelo resuelve un problema muy concreto: Whisper no dispone de token de idioma para kurdo central, de modo que la unica forma de obtener transcripciones decentes en esta lengua es reentrenar el modelo sobre datos anotados. El resultado se ha exportado a formato ONNX para poder ejecutarse en navegador o en Node.js mediante Transformers.js y ONNX Runtime, sin necesidad de Python ni de GPU dedicada.

La relevancia practica del modelo esta en su formato de despliegue: al distribuirse como ONNX con un decoder fusionado (con y sin cache KV en un mismo grafo) y variantes cuantizadas, se puede integrar en aplicaciones web y en clientes ligeros con un peso de repositorio de 0,8 GB. La contrapartida es que el ajuste se hizo con un corpus muy pequeno (aproximadamente 2 horas y 18 minutos de voz leida, 1.653 enunciados) y de un unico hablante.

Se ofrecen tres tamanos dentro de la misma familia experimental: Whisper Tiny (39M), Whisper Base (74M) y este Whisper Small (244M), todos ajustados con los mismos datos y el mismo procedimiento. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (arquitectura Whisper), heredada de `openai/whisper-small` |
| Parametros totales | 244M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s por fragmento; para audio mas largo se usa chunking con solapamiento (`chunk_length_s: 30`, `stride_length_s: 5`) |
| Tipos de cuantizacion | Decoder int8 (`q8`) y 4-bit (`q4`); encoder en fp32. El autor indica que ambas variantes producen transcripciones casi identicas en comprobaciones puntuales |
| Idiomas soportados | Kurdo central / sorani (`ckb`). Nota: no existe token de idioma kurdo, por lo que se debe decodificar siempre con el token `<|en|>` como marcador de posicion |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx` fp32, 353 MB; `decoder_model_merged_quantized.onnx` q8, 194 MB; `decoder_model_merged_q4.onnx` q4, 257 MB) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder de tipo seq2seq que procesa audio a 16 kHz mono convertido a log-Mel de 80 bins y genera texto de forma autoregresiva. Este modelo concreto parte de los pesos multilingues de `openai/whisper-small` (segun la configuracion estandar de ese checkpoint: 12 capas de encoder y 12 de decoder, `d_model` de 768 y 12 cabezas de atencion). El proceso de ajuste fino se hizo sobre 1.653 enunciados de voz leida en kurdo central (aproximadamente 2 h 18 min de audio), con una particion aleatoria 90/10 de entrenamiento y prueba (semilla 42), una sola epoca, tamano de lote 2 y optimizador AdamW con tasa de aprendizaje 1e-5. Se usaron los tokens `<|en|>`, `<|transcribe|>` y `<|notimestamps|>`; el uso del token ingles es un marcador de posicion, no implica entrenamiento en ingles.

Los datos provienen de una unica grabacion de un hablante nativo masculino (Aso Mahmudi) con acento de Mariwan, registrada en un estudio domestico con microfono de condensador USB. Las transcripciones combinan el texto integro del libro *Mesele-y Wijdan* de Ahmad Mukhtar Jaff (1896-1935), que aporta unos 49 minutos de audio, y textos diversos de sitios web kurdos (noticias, deportes, temas generales). Todas las transcripciones fueron revisadas manualmente contra las grabaciones. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Reconocimiento automatico de voz en kurdo central (sorani) con salida en escritura arabe kurda estandar (por ejemplo `کوردی`).
- Transcripcion de fragmentos de hasta 30 segundos en una sola pasada, ampliable a audio mas largo mediante chunking con solapamiento.
- Inferencia en navegador y en Node.js a traves de Transformers.js, y en cualquier entorno con ONNX Runtime.
- Entrada de audio mediante URL o como `Float32Array` de audio mono a 16 kHz.
- Puntuacion y formato aprendidos del texto editado de origen (el modelo puede insertar puntuacion que el hablante no marco de forma explicita).
- No se documentan capacidades de traduccion, identificacion de hablante, diarizacion, tool calling ni razonamiento multi-paso; es un modelo puramente de transcripcion.
- No es multimodal ni genera audio: solo consume audio y produce texto.

## Casos de uso

- Transcripcion de audio kurdo directamente en el navegador: una aplicacion web puede cargar el modelo ONNX y transcribir la grabacion del usuario sin enviar el audio a un servidor, lo que resulta adecuado para contenidos sensibles y para escenarios con conectividad limitada.
- Subtitulado de videos en kurdo central: integrado en una herramienta de edicion o en un pipeline de publicacion, el modelo genera el texto base de los subtitulos a partir de pistas de audio de 30 segundos, aplicando `chunk_length_s: 30` y `stride_length_s: 5` para mantener la continuidad.
- Archivado y digitalizacion de material sonoro en sorani: bibliotecas, radios comunitarias u organizaciones culturales pueden indexar grabaciones historicas o programas de audio generando transcripciones buscables.
- Asistentes de voz ligeros en kurdo: el modelo puede actuar como capa de entrada de un asistente ejecutado en el dispositivo, ya que su huella de pesos ronda los 0,5-0,6 GB y no requiere GPU dedicada.
- Herramientas de accesibilidad: generacion de subtitulos en directo o diferidos para personas con discapacidad auditiva en comunidades kurdo-parlantes, aprovechando la ejecucion local.
- Investigacion linguistica y creacion de corpus: transcripcion asistida de entrevistas o grabaciones de campo en sorani para construir corpus anotados, siempre con revision humana posterior.
- Aplicaciones offline en Node.js: servicios de transcripcion por lotes que se ejecutan en servidores sin GPU, aprovechando la variante cuantizada q8 para reducir el consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no existe evaluacion sobre un conjunto de prueba independiente y que el modelo debe validarse con datos propios antes de usarlo en produccion.

## Requisitos de hardware

- Pesos: encoder fp32 de 353 MB mas decoder q8 de 194 MB (aproximadamente 0,55 GB en total), o decoder q4 de 257 MB (aproximadamente 0,61 GB en total).
- Memoria estimada para inferencia: del orden de 1-2 GB incluyendo activaciones; cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: no se requieren. Cualquier GPU con soporte de ONNX Runtime (por ejemplo RTX 3060 o superior) acelera la inferencia, pero no es un requisito. El modelo esta pensado para ejecutarse en CPU y en navegador.
- Compatibilidad con GPU de consumo: si, en practicamente cualquier GPU moderna, y tambien en CPU y en WebGPU/WebAssembly en navegador.
- Opciones de despliegue: Transformers.js (navegador y Node.js), ONNX Runtime (Web, Node y nativo). No se documenta soporte directo para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| asounimelb/whisper-small-ckb-onnx | 244M | Kurdo central (`ckb`) | Apache-2.0 | ONNX | Mayor tamano de la familia ajustada al kurdo por el mismo autor |
| asounimelb/whisper-base-ckb-onnx | 74M | Kurdo central (`ckb`) | Apache-2.0 | ONNX | Mismo procedimiento y datos; menor coste, presumiblemente menor precision |
| asounimelb/whisper-tiny-ckb-onnx | 39M | Kurdo central (`ckb`) | Apache-2.0 | ONNX | Opcion mas ligera para dispositivos muy limitados |
| openai/whisper-small | 244M | 99 idiomas, sin token de kurdo central | Apache-2.0 | safetensors / PyTorch | Modelo base multilingue; no esta ajustado a `ckb` |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgo de hablante unico: el entrenamiento proviene de una sola persona, hombre nativo con acento de Mariwan. Se espera una precision inferior con otras voces, acentos y dialectos (Sulaimani, Erbil, Kirkuk) y con habla espontanea o conversacional.
- Dominio restringido: solo voz leida. El modelo puede insertar puntuacion que el hablante no ha marcado claramente porque la aprendio de texto editado.
- Errores de espaciado: buena parte de los errores residuales son variantes de separacion de palabras (por ejemplo `بە کار` frente a `بەکار`), una ambiguedad habitual en la ortografia kurda.
- Ausencia de evaluacion formal: no hay resultados publicados sobre un conjunto de prueba independiente.
- Condiciones acusticas: el corpus se grabo en estudio domestico con microfono de condensador; se espera degradacion con audio ruidoso, telefonia o reverberacion.
- Alucinaciones: aplican las advertencias habituales de Whisper, incluida la posible generacion de texto inventado ante silencios o audio no vocal.
- Requisito de decodificacion estricta: es obligatorio usar `language: "en"` y `task: "transcribe"`; cualquier otra configuracion de idioma produce resultados pobres.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda citar el articulo original de Whisper y verificar el modelo con datos propios antes de desplegarlo en produccion.
- Trazabilidad: el repositorio no registra descargas ni interacciones, lo que dificulta estimar su adopcion y madurez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asounimelb/whisper-small-ckb-onnx
- Modelo base: https://huggingface.co/openai/whisper-small
- Variante Whisper Tiny en kurdo central: https://huggingface.co/asounimelb/whisper-tiny-ckb-onnx
- Variante Whisper Base en kurdo central: https://huggingface.co/asounimelb/whisper-base-ckb-onnx
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Articulo original de Whisper: https://arxiv.org/abs/2212.04356
