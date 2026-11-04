# DakeraAI/whisper-tiny

## Resumen

`DakeraAI/whisper-tiny` es un espejo verificado del modelo `openai/whisper-tiny` publicado por Dakera, una empresa que desarrolla un motor de memoria autoalojado para agentes de IA. El modelo original es de OpenAI y este repositorio no introduce ninguna modificacion en los pesos ni en la arquitectura: se limita a redistribuir una copia byte a byte de los archivos ONNX generados por `onnx-community/whisper-tiny`, con sumas de comprobacion SHA-256 publicadas para verificar la integridad.

El proposito del repositorio no es ofrecer un modelo nuevo, sino garantizar la disponibilidad del reconocimiento automatico de voz (ASR) que utiliza Dakera para transcribir adjuntos de audio en memorias consultables. Dakera descarga primero desde este espejo y recurre a los repositorios originales si no esta accesible, validando ambos contra el mismo hash. De este modo, las instalaciones autoalojadas no dependen de una unica fuente de distribucion.

Whisper-tiny es el miembro mas pequeno de la familia Whisper de OpenAI, con 39 millones de parametros y una ventana de audio de 30 segundos por segmento. Su relevancia aqui es practica: permite transcripcion local en CPU con un consumo de recursos minimo, lo que encaja con el enfoque de despliegue autoalojado de Dakera. No se trata, por tanto, de un modelo para evaluar por su calidad ASR de vanguardia, sino de una pieza de infraestructura empaquetada para un producto concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX |
| Parametros totales | 39 millones (whisper-tiny) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana; 448 tokens de posicion en el decoder |
| Tipos de cuantizacion | no disponible en este repositorio (solo se distribuyen pesos ONNX en fp32) |
| Idiomas soportados | no disponible en la informacion del repositorio; el modelo original es multilingue (99 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`) y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper-tiny de OpenAI, un transformer encoder-decoder disenado para reconocimiento automatico de voz. El encoder procesa espectrogramas mel de 80 canales correspondientes a ventanas de 30 segundos; el decoder genera tokens de texto de forma autorregresiva con un vocabulario multitarea que incluye tokens especiales para deteccion de idioma, traduccion y marcas de tiempo. La exportacion a ONNX separa encoder y decoder en dos grafos independientes, lo que facilita su ejecucion con runtimes como ONNX Runtime sin dependencia de PyTorch.

No se dispone en este repositorio de informacion sobre el dataset de entrenamiento, el numero de tokens de audio utilizados ni sobre si hubo ajuste fino con RLHF o DPO. La model card remite explicitamente a la model card original de OpenAI para esos detalles. Dakera no ha realizado ningun entrenamiento ni modificacion: los archivos son copias literales de `onnx-community/whisper-tiny`, con checksums publicados (por ejemplo, `ab79e3f2...` para el decoder de 118,4 MB y `6642befb...` para el encoder de 32,9 MB).

## Capacidades

- Transcripcion de voz a texto en multiples idiomas (heredada de Whisper-tiny; la lista exacta no se detalla en este repositorio).
- Deteccion automatica de idioma mediante tokens especiales del decoder.
- Traduccion de audio a texto en ingles (capacidad nativa de Whisper, no documentada explicitamente en este espejo).
- Generacion de marcas de tiempo a nivel de segmento.
- Ejecucion local en CPU o GPU mediante ONNX Runtime, sin necesidad de PyTorch.
- Integracion como dependencia del motor de memoria Dakera para convertir adjuntos de audio en memorias consultables.
- No soporta tool calling ni function calling: es un modelo puramente ASR.
- No dispone de modo de razonamiento, vision ni audio generativo.

## Casos de uso

- Transcripcion de notas de voz en agentes autoalojados: Dakera utiliza este modelo para convertir adjuntos de audio en texto indexable, de modo que el agente pueda recuperarlos despues mediante busqueda vectorial o de texto completo. Es adecuado por su bajo coste computacional y su ejecucion local.
- Procesamiento por lotes de grabaciones cortas: al operar sobre ventanas de 30 segundos, encaja en pipelines que segmentan reuniones o llamadas en fragmentos y transcriben cada uno con un modelo ligero, reservando modelos mayores para pasadas de refinamiento.
- Despliegue en entornos sin conectividad: al distribuirse como ONNX y ejecutarse con ONNX Runtime, puede integrarse en contenedores o dispositivos edge donde no se quiere depender de APIs externas de ASR.
- Prototipado rapido de interfaces de voz: equipos que construyen un asistente conversacional pueden usar whisper-tiny para validar el flujo completo de captura, transcripcion y respuesta antes de invertir en modelos ASR de mayor tamano.
- Indexacion de archivos multimedia en sistemas RAG: transcripcion de podcasts, videos o reuniones para incorporar su contenido a un indice de recuperacion, aprovechando que el modelo corre en CPU sin GPU dedicada.
- Cumplimiento y auditoria de conversaciones: transcripcion local de llamadas de atencion al cliente para su analisis posterior, con la ventaja de que los datos de audio no salen de la infraestructura propia.
- Verificacion de integridad en despliegues: el repositorio publica SHA-256 de cada archivo, lo que permite a los equipos de plataforma validar que los binarios desplegados coinciden con los esperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; el encoder ocupa 32,9 MB y el decoder 118,4 MB en disco, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no requiere A100 ni H100. Funciona tambien en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: ONNX Runtime (Python, C++, JS), `transformers` con `optimum`, integracion nativa en Dakera mediante `DAKERA_WHISPER_MODEL=whisper-tiny` y `DAKERA_ATTACHMENTS=true`, y contenedor Docker oficial de Dakera que incluye los modelos precargados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia muy baja en CPU moderna, pero no hay cifras publicadas en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DakeraAI/whisper-tiny (este) | 39 M | 30 s por ventana | ONNX | Apache-2.0 | HuggingFace, espejo verificado |
| openai/whisper-tiny (original) | 39 M | 30 s por ventana | PyTorch (safetensors/bin) | Apache-2.0 | HuggingFace |
| onnx-community/whisper-tiny | 39 M | 30 s por ventana | ONNX | Apache-2.0 | HuggingFace |
| openai/whisper-base | 74 M | 30 s por ventana | PyTorch | Apache-2.0 | HuggingFace |

La comparativa relevante es entre el espejo y sus fuentes: el contenido es identico en pesos, y la diferencia estriba en la verificacion por checksum y en la integracion con el producto Dakera. Frente a whisper-base, este modelo es aproximadamente la mitad de grande y, previsiblemente, menos preciso, aunque no se dispone de cifras comparativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: no debe citarse como trabajo propio de Dakera; la autoria corresponde a OpenAI.
- whisper-tiny es el modelo mas pequeno de la familia Whisper y presenta una precision notablemente inferior a variantes como `small`, `medium` o `large`, especialmente en audio con ruido, acentos marcados o vocabulario tecnico.
- Riesgo de alucinacion en pasajes de silencio o ruido: Whisper puede generar texto plausible pero inexistente en ausencia de habla clara.
- La ventana de 30 segundos obliga a segmentar audios largos; una segmentacion incorrecta degrada la calidad de la transcripcion.
- No se documentan en este repositorio los idiomas concretos soportados ni su rendimiento por idioma.
- Solo se distribuyen pesos ONNX en fp32; no hay variantes cuantizadas en este repositorio, lo que limita optimizaciones de despliegue.
- La licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de atribucion a OpenAI y verificar los terminos del modelo original.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere una adopcion muy limitada fuera del ecosistema Dakera.
- La fecha de creacion indicada (2026-11-04) resulta anomala y conviene verificarla antes de citarla.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DakeraAI/whisper-tiny
- Modelo original: https://huggingface.co/openai/whisper-tiny
- Exportacion ONNX de referencia: https://huggingface.co/onnx-community/whisper-tiny
- Web de Dakera: https://dakera.ai
- Documentacion de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue autoalojado: https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn: https://www.linkedin.com/company/dakera-ai
- Contacto: amine@dakera.ai
