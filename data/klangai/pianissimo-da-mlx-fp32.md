# KlangAI/pianissimo-da-mlx-fp32

## Resumen

KlangAI/pianissimo-da-mlx-fp32 es una conversión al framework MLX de Klang Pianissimo for Danish, un modelo de reconocimiento automático del habla (ASR) especializado en danés desarrollado por Klang. El modelo original está pensado para transcripción de audio en danés y esta versión permite ejecutarlo en GPUs de Apple silicon (M1 o posterior) sin depender de PyTorch ni de NeMo, usando MLX y la librería parakeet-mlx.

Arquitectónicamente se trata de un modelo FastConformer con decodificación TDT (Token-and-Duration Transducer), con 627 millones de parámetros en precisión fp32. Esta variante concreta es la versión de 32 bits completa, que según el autor fue la más rápida en su benchmark sobre M5 Pro y la que más memoria consume (3,8 GB de pico al transcribir 5 minutos de audio).

Su relevancia radica en ofrecer una alternativa local y ligera para transcripción de danés en hardware de consumo Apple, con un WER de 7,43 % en FLEURS y un factor de tiempo real (RTFx) de 173×, además de soporte de phrase boosting para vocabulario personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de texto; atención local de 256 frames por lado en el encoder; procesa audio en fragmentos de 2 minutos con solapamiento de 15 s |
| Tipos de cuantizacion | fp32 (esta versión); existen variantes bf16, 8-bit y 4-bit en el mismo proyecto |
| Idiomas soportados | danés (da) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo sigue la familia FastConformer, una variante eficiente del Conformer con atención local (256 frames a cada lado) que reduce el coste computacional en secuencias de audio largas. Sobre el encoder se sitúa un decodificador TDT, que predice conjuntamente tokens y duraciones, lo que permite emisiones no monotónicas por paso y mejora la eficiencia frente a transducers clásicos.

Esta versión concreta es una conversión del checkpoint original fp32 de KlangAI/pianissimo-da, conservando la atención local del modelo base. No se han publicado en la información disponible detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino supervisado adicional. La conversión a MLX no modifica los pesos: en una comprobación separada en Mac, esta versión coincidió con la referencia fp32 normalizada del original en 200 de 200 clips de FLEURS.

## Capacidades

- Reconocimiento automático del habla en danés con salida de texto plano.
- Generación de marcas de tiempo a nivel de frase y de token (`result.sentences` y `sentence.tokens`).
- Procesamiento de grabaciones largas mediante fragmentación automática en bloques de 2 minutos con solapamiento de 15 s (configurable con `chunk_duration`, o `None` para una sola pasada).
- Acepta ficheros de audio (vía ffmpeg) o arrays NumPy mono a 16 kHz.
- Phrase boosting / vocabulario personalizado: implementación propia del mecanismo de NeMo que reproduce los resultados del modelo original y ayuda a deletrear correctamente nombres y términos concretos.
- Ejecución en GPU de Apple silicon mediante MLX, sin PyTorch ni NeMo.
- No dispone de tool calling, capacidades de agente, visión, audio generativo ni modos de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y entrevistas en danés: el modelo procesa audio en bloques de 2 minutos con solapamiento, lo que permite transcribir grabaciones largas de forma fiable y con marcas de tiempo por frase.
- Subtitulado automático de vídeo: la salida con timestamps por frase y por token facilita la alineación temporal necesaria para generar subtítulos SRT.
- Actas y notas de voz en aplicaciones macOS nativas: al ejecutarse sobre MLX en Apple silicon, puede integrarse en apps de escritorio sin dependencias de CUDA ni de servidores externos.
- Transcripción de llamadas de atención al cliente: el phrase boosting permite fijar nombres de producto, entidades o terminología interna para reducir errores en dominios específicos.
- Investigación lingüística y corpus orales: la licencia CC BY 4.0 permite usar las transcripciones en proyectos académicos y comerciales con atribución.
- Dictado por voz en herramientas internas: el modelo acepta arrays NumPy a 16 kHz, lo que simplifica la integración con capturas de micrófono en tiempo real.
- Procesamiento por lotes en estaciones de trabajo Mac: con 3,8 GB de pico de memoria y 173× RTFx, un Mac con 24 GB puede transcribir horas de audio en minutos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (WER en FLEURS test danés, 930 clips; velocidad medida en un clip de 30 s sobre Apple M5 Pro con 24 GB):

| Version | Pesos | Descarga | FLEURS WER (%) | RTFx | Memoria pico (5 min) |
|---|---|---:|---:|---:|---:|
| pianissimo-da (original) | fp32 | 2,51 GB | 7,43 | no disponible | no disponible |
| pianissimo-da-mlx-8bit | 8-bit | 759 MB | 7,49 | 151× | 2,2 GB |
| pianissimo-da-mlx-4bit | 4-bit | 528 MB | 7,80 | 126× | 2,2 GB |
| pianissimo-da-mlx | bf16 | 1,25 GB | 7,48 | 140× | 2,7 GB |
| pianissimo-da-mlx-fp32 | fp32 | 2,51 GB | 7,43 | 173× | 3,8 GB |

Nota del autor: las mediciones de velocidad y memoria se realizaron sobre el modelo sueco, de arquitectura idéntica, en una GPU Apple M5 Pro de 24 GB.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 3,8 GB de pico en GPU al transcribir 5 minutos de audio en fp32; el repo ocupa 2,5 GB.
- Hardware objetivo: Macs con Apple silicon (M1 o posterior). Requiere GPU compatible con MLX.
- No está pensado para GPUs NVIDIA ni para despliegue en servidores CUDA; para esos entornos el autor remite a las versiones ONNX (KlangAI/pianissimo-da-onnx).
- Cabe en cualquier Mac Apple silicon con al menos 8 GB de memoria unificada, aunque 16 GB o más es recomendable para procesar audio largo junto con otras aplicaciones.
- Despliegue: MLX + parakeet-mlx 0.5.2 + huggingface_hub + sentencepiece; ffmpeg para leer ficheros de audio. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR).
- Rendimiento: 173× RTFx en M5 Pro (30 s de audio procesados en aproximadamente 0,17 s); en chips M1/M2 el rendimiento será inferior, aunque no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / atencion | WER FLEURS da (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pianissimo-da-mlx-fp32 (este) | 627 M | Atencion local 256 frames | 7,43 | CC BY 4.0 | MLX (Apple silicon) |
| pianissimo-da (original) | 627 M | Atencion local 256 frames | 7,43 | CC BY 4.0 | NeMo / PyTorch |
| pianissimo-da-mlx-8bit | 627 M | Atencion local 256 frames | 7,49 | CC BY 4.0 | MLX (Apple silicon) |
| pianissimo-da-mlx-4bit | 627 M | Atencion local 256 frames | 7,80 | CC BY 4.0 | MLX (Apple silicon) |

No se dispone en la información proporcionada de comparaciones con otros modelos ASR daneses de terceros (por ejemplo, variantes de Whisper o Wav2Vec2); el autor remite a la model card principal para comparaciones con otros modelos.

## Limitaciones y advertencias

- Solo soporta danés; no es multilingüe y no debe usarse con audio en otros idiomas.
- Es un modelo ASR: no genera texto libre, no razona, no hace tool calling ni procesa imágenes.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario muy especializado; el phrase boosting mitiga parcialmente este último caso.
- El procesamiento por bloques de 2 minutos con solapamiento de 15 s puede introducir duplicaciones o cortes en los límites si no se gestionan; `chunk_duration=None` evita el troceado a costa de más memoria.
- Usar parakeet-mlx directamente en lugar del loader incluido no soporta los pesos cuantizados y aplica un preprocesado ligeramente distinto, con un aumento de aproximadamente 0,2 puntos porcentuales de WER.
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario citar el modelo según el BibTeX del autor.
- Dependencia del ecosistema Apple/MLX: no hay soporte oficial para CUDA, ROCm ni CPU x86 en este repositorio.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; ecosistema y soporte comunitario muy reducidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KlangAI/pianissimo-da-mlx-fp32
- Modelo base original: https://huggingface.co/KlangAI/pianissimo-da
- Versión bf16: https://huggingface.co/KlangAI/pianissimo-da-mlx
- Versión 8-bit: https://huggingface.co/KlangAI/pianissimo-da-mlx-8bit
- Versión 4-bit: https://huggingface.co/KlangAI/pianissimo-da-mlx-4bit
- Versiones ONNX: https://huggingface.co/KlangAI/pianissimo-da-onnx
- Librería MLX: https://github.com/ml-explore/mlx
- parakeet-mlx: https://github.com/senstella/parakeet-mlx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
