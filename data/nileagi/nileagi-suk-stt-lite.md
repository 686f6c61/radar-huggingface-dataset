# nileagi/nileagi-suk-stt-lite

## Resumen

NileAGI Sukuma STT Lite es un modelo de reconocimiento automático del habla (ASR) desarrollado por NileAGI, una empresa de investigación en inteligencia artificial centrada en la inteligencia artificial de nivel humano (HLI). Este modelo está diseñado específicamente para la transcripción del idioma sukuma, una lengua bantú hablada en Tanzania, y se presenta como una variante ligera para entornos con recursos limitados.

El modelo se basa en la arquitectura Whisper de OpenAI, adaptada para el idioma sukuma, y cuenta con aproximadamente 37,7 millones de parámetros, lo que lo sitúa en la gama de modelos pequeños optimizados para inferencia en CPU y dispositivos de bajo consumo. Se distribuye en formato safetensors y es compatible con la librería transformers de HuggingFace.

Es importante destacar que este modelo es una comprobación experimental de pipeline, no un lanzamiento de producción de NileAGI. Su caso de uso previsto es la transcripción de sukuma en entornos de bajos recursos donde el modelo completo `nileagi-suk-stt` resultaría demasiado pesado. No está diseñado para asistentes de voz en producción, conversación conversacional en sukuma ni audio con alto nivel de ruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, ventana de audio no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | suk (sukuma) |
| Licencia | other (terminos de investigacion de NileAGI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Whisper, un transformer encoder-decoder desarrollado originalmente por OpenAI para reconocimiento de voz multilingue. La variante Lite de NileAGI adapta esta arquitectura al idioma sukuma, reduciendo significativamente el numero de parametros hasta los 37,7 millones para permitir su ejecucion en hardware modesto.

No se han publicado detalles sobre el proceso de entrenamiento, incluyendo el numero de tokens de audio utilizados, la composicion del dataset de entrenamiento o si se aplicaron tecnicas de ajuste fino adicionales como RLHF o DPO. El modelo se presenta como una comprobacion experimental del pipeline de entrenamiento de NileAGI para lenguas de bajos recursos, lo que sugiere que el dataset de entrenamiento podria ser limitado en tamano y cobertura.

## Capacidades

- Transcripcion de audio en idioma sukuma a texto.
- Inferencia en CPU y dispositivos de bajo consumo gracias a su tamano reducido (37,7 millones de parametros).
- Compatible con la libreria transformers de HuggingFace para integracion en pipelines de ASR.
- Disenado para audio de baja complejidad, sin ruido excesivo y con habla clara.
- No incluye capacidades de traduccion, diarizacion de hablantes ni reconocimiento de emociones.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente de transcripcion.

## Casos de uso

- Transcripcion de entrevistas etnograficas: investigadores que trabajen con comunidades sukuma en Tanzania pueden transcribir entrevistas grabadas en campo con un modelo ligero que se ejecuta en portatiles sin GPU.
- Digitalizacion de archivos de audio historicos: organizaciones que preserven grabaciones en sukuma pueden procesar archivos de audio de baja calidad con este modelo, siempre que el ruido de fondo sea limitado.
- Documentacion linguistica: linguistas que estudien la lengua sukuma pueden generar transcripciones iniciales de material grabado para acelerar su trabajo de anotacion y analisis.
- Educacion y alfabetizacion: materiales educativos en audio en sukuma pueden transcribirse para generar textos de apoyo en programas de alfabetizacion.
- Pruebas de concepto en entornos academicos: estudiantes e investigadores pueden evaluar la viabilidad de modelos ASR para lenguas de bajos recursos utilizando este modelo como punto de partida.
- Desarrollo de herramientas de accesibilidad: aplicaciones de asistencia para hablantes de sukuma que necesiten convertir audio a texto en dispositivos sin GPU, como portatiles de gama baja o mini-PCs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre WER (Word Error Rate), CER (Character Error Rate) ni comparaciones con otros modelos ASR para sukuma o lenguas similares.

## Requisitos de hardware

- VRAM estimada: al tener solo 37,7 millones de parametros, el modelo puede ejecutarse en CPU sin necesidad de GPU. El uso de VRAM seria inferior a 1 GB en caso de usar GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM seria suficiente, aunque no es necesaria. CPU con 4 GB de RAM son suficientes para inferencia.
- Compatibilidad con consumer GPU: si, el modelo cabe en cualquier GPU de consumo actual, incluyendo integradas.
- Opciones de despliegue: transformers de HuggingFace, pipelines de ASR de la libreria, posible exportacion a ONNX o TensorFlow Lite para despliegue en edge.
- Latencia y throughput: no se han publicado datos oficiales. Dado el tamano del modelo, se espera una latencia moderada en CPU, aunque depende del hardware y de la longitud del audio procesado.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificamente entrenados para sukuma. En el ambito de ASR para lenguas de bajos recursos, alternativas generales como Whisper small (244 millones de parametros) o Whisper tiny (39 millones de parametros) podrian utilizarse como referencia, aunque no estan especificamente entrenados para sukuma. La comparativa directa no esta disponible.

## Limitaciones y advertencias

- Modelo experimental: es una comprobacion de pipeline, no un lanzamiento de produccion de NileAGI.
- Licencia restrictiva: la licencia `other` (terminos de investigacion de NileAGI) puede limitar el uso comercial. Es necesario revisar los terminos especificos antes de cualquier despliegue en produccion.
- Cobertura limitada: al ser un modelo de 37,7 millones de parametros entrenado para una lengua de bajos recursos, la precision puede ser significativamente inferior a la de modelos ASR comerciales para lenguas mayoritarias.
- Sin soporte para audio ruidoso: el modelo no esta disenado para entornos con alto nivel de ruido de fondo, lo que limita su uso en grabaciones de campo no controladas.
- Riesgo de alucinacion: como cualquier modelo ASR, puede generar transcripciones incorrectas o inventar palabras cuando el audio es ambiguo o de mala calidad.
- Idioma unico: solo soporta sukuma. No es util para otros idiomas de la region ni para transcripcion multilingue.
- Sin datos de rendimiento: la ausencia de benchmarks publicados impide evaluar objetivamente su calidad antes de su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nileagi/nileagi-suk-stt-lite
- Organizacion NileAGI en HuggingFace: https://huggingface.co/nileagi
- Sitio web de NileAGI: https://nileagi.com/
