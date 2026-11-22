# Katsugachi/medasr-onnx

## Resumen

MedASR ONNX es una conversión al formato ONNX del modelo `google/medasr`, un sistema de reconocimiento automático del habla (ASR) desarrollado originalmente por Google y orientado al dominio médico. Esta versión, publicada por el usuario independiente Katsugachi, no es un lanzamiento oficial de Google ni cuenta con su respaldo, sino una conversión técnica que empaqueta el modelo en dos variantes: FP32 y INT8 con cuantización dinámica. El objetivo es facilitar el despliegue del modelo en entornos de inferencia basados en ONNX Runtime, especialmente en aplicaciones que necesitan transcripción de audio médico sin depender del stack de PyTorch.

El modelo subyacente es un sistema CTC basado en arquitectura tipo LASR (Listen, Attend and Spell con representaciones log-mel), que procesa características log-mel fbank de audio mono a 16 kHz y produce logits sobre un vocabulario de 512 tokens SentencePiece. La conversión mantiene las dimensiones dinámicas de lote y tiempo, lo que permite procesar audios de distinta duración, aunque la aplicación de referencia trocea el audio en segmentos de 24 segundos.

La relevancia de esta ficha radica en que permite evaluar rápidamente si esta conversión ONNX es adecuada para un pipeline de transcripción médica en producción. La licencia HAI-DEF de Google impone restricciones de uso concretas, y el modelo no está autorizado para uso clínico sin la correspondiente autorización regulatoria. El repositorio ocupa 0,6 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC sobre representaciones log-mel (basada en google/medasr, tipo LASR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por segmentos; la app de referencia trocea a 24 s) |
| Tipos de cuantizacion | FP32 y INT8 dinamica (pesos MatMul/Gemm; convoluciones en FP32) |
| Idiomas soportados | no disponible |
| Licencia | health-ai-developer-foundations (HAI-DEF, "other") |
| Formato de pesos | ONNX (`model.onnx` FP32, `model.int8.onnx` INT8) |

## Arquitectura y entrenamiento

La arquitectura del modelo original `google/medasr` no se detalla en la información proporcionada más allá de que se trata de un sistema CTC que opera sobre características log-mel fbank extraídas con `LasrFeatureExtractor`. La entrada del grafo ONNX es un tensor `x` de tipo float32 con forma `[N, T, 128]`, correspondiente a 128 bandas log-mel de audio mono a 16 kHz, junto con una máscara `mask` int64 `[N, T]` que indica los fotogramas válidos. La salida son `logits` float32 `[N, T_4, 512]` y `logits_len` int64 `[N]`, es decir, una distribución sobre 512 tokens SentencePiece por cada fotograma.

La decodificación es CTC voraz: se colapsan identificadores repetidos adyacentes, se elimina el identificador en blanco 0 y los tokens especiales, y se concatenan las piezas SentencePiece. El tokenizador se distribuye como `tokens.txt` con líneas `piece id`, donde el token 0 se renombra `<blk>` para el decodificador CTC del navegador. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a ONNX preserva las dimensiones dinámicas de lote y tiempo, y los scripts `export_medasr_onnx.py` y `verify_medasr_onnx.py` permiten reproducir el proceso y validar la paridad numérica.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio mono a 16 kHz, con extracción de características log-mel de 128 bandas.
- Decodificación CTC voraz con vocabulario SentencePiece de 512 tokens.
- Procesamiento por lotes (`N`) y con eje temporal dinámico (`T`), lo que permite audios de duración variable.
- Ejecución en ONNX Runtime, con variante FP32 y variante INT8 cuantizada dinámicamente.
- Orientación al dominio médico por herencia del modelo base `google/medasr`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de dictados clínicos: el modelo puede convertir notas de voz de profesionales sanitarios en texto estructurado, aprovechando su orientación al dominio médico y su ejecución ligera en ONNX Runtime para integrarse en aplicaciones de escritorio o web.
- Generación de actas de consulta: integrado en un pipeline que trocea el audio en segmentos de 24 segundos, permite transcribir conversaciones médico-paciente para su revisión posterior, siempre que se cumplan las restricciones de la licencia HAI-DEF.
- Subtitulado de material formativo sanitario: la variante INT8 reduce el coste computacional y permite desplegar la transcripción en servidores modestos o en el navegador mediante ONNX Runtime Web, usando el decodificador CTC incluido.
- Preprocesado de corpus de audio médico: para investigadores que necesitan generar transcripciones preliminares de grabaciones y luego revisarlas manualmente, el modelo ofrece una base reproducible con scripts de exportación y verificación incluidos.
- Prototipado de asistentes de voz clínicos: la API de entrada/salida clara (`x`, `mask` → `logits`, `logits_len`) facilita la integración en servicios backend que ya usan ONNX Runtime, sin necesidad de dependencias de PyTorch.
- Evaluación comparativa de conversiones ONNX: el archivo `parity.json` y los scripts permiten a ingenieros de MLOps validar la paridad entre PyTorch, FP32 e INT8, y comparar con otras conversiones como `kamalkraj/medasr-onnx`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El archivo `parity.json` recoge comparaciones de WER entre PyTorch y las variantes FP32/INT8, pero el propio autor indica que ese WER se mide contra PyTorch y no constituye una estimación de precisión clínica; además, las pruebas con audio sintético no suponen un benchmark de exactitud.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,6 GB, por lo que la variante INT8 debería caber en GPUs consumer con 4-8 GB, y la FP32 en torno a 8-12 GB, aunque estas cifras son estimaciones y no datos publicados.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, una RTX 4090, A100 o H100 son sobredimensionadas para inferencia individual; GPUs de gama media como RTX 3060 o T4 podrían ser suficientes.
- Cabe en GPU consumer: probablemente sí, especialmente la variante INT8, aunque no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime (Python, C++, Web), con los scripts de exportación y verificación incluidos; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Katsugachi/medasr-onnx | no disponible | no disponible (segmentos de 24 s en la app) | HAI-DEF | ONNX FP32/INT8 | Conversión independiente de google/medasr |
| google/medasr | no disponible | no disponible | HAI-DEF | PyTorch (checkpoint original) | Modelo base oficial, acceso restringido |
| kamalkraj/medasr-onnx | no disponible | no disponible | no disponible | ONNX INT8 | Conversión previa usada como referencia en `parity.json` |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de las comprobaciones de paridad mencionadas.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Google ni cuenta con su respaldo; es una conversión independiente sujeta a los términos HAI-DEF.
- La licencia HAI-DEF incluye restricciones de uso exigibles (§3.2) y una política de usos prohibidos que deben cumplirse y transmitirse a usuarios posteriores.
- No apto para uso clínico sin la autorización regulatoria correspondiente.
- El WER reportado en `parity.json` se mide contra PyTorch, no contra una referencia clínica; no debe interpretarse como precisión médica.
- Las pruebas con silencio y tono sintético a 440 Hz no constituyen un benchmark de exactitud.
- No se documentan idiomas soportados, sesgos conocidos ni riesgos de alucinación específicos.
- La entrada no es waveform cruda: requiere extracción previa de características log-mel con `LasrFeatureExtractor`.
- La aplicación de referencia trocea el audio en segmentos de 24 segundos, lo que puede afectar a la coherencia en transcripciones largas.
- El repositorio no registra descargas ni interacciones, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Katsugachi/medasr-onnx
- Modelo base: https://huggingface.co/google/medasr
- Términos HAI-DEF: https://developers.google.com/health-ai-developer-foundations/terms
- Política de usos prohibidos: https://developers.google.com/health-ai-developer-foundations/prohibited-use-policy
- Conversión previa de referencia: https://huggingface.co/kamalkraj/medasr-onnx
