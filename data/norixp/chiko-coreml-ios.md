# Norixp/chiko-coreml-ios

## Resumen

Chiko Core ML models for iOS es una colección de cuatro artefactos de modelo empaquetados en formato Core ML para su ejecución local en dispositivos iOS, publicada por el usuario Norixp bajo el identificador `Norixp/chiko-coreml-ios`. No se trata de un modelo fundacional propio, sino de una distribución de pesos ya existentes (multilingual-e5-small, Whisper Tiny, Qwen3-VL 2B y SD-Turbo) convertidos a Core ML y organizados para integrarse en la aplicación Chiko. El repositorio ocupa 5,6 GB y no incluye el código fuente de la aplicación ni datos de usuario, solo los ficheros de modelo y un manifiesto con hashes SHA-256.

La relevancia de esta ficha es limitada pero concreta: documenta un caso de despliegue on-device en iOS que combina recuperación semántica, transcripción de voz, un modelo de visión-lenguaje y generación de imágenes, todo con cómputo repartido entre Neural Engine y GPU. El autor restringe explícitamente el alcance de sus pruebas a un único dispositivo (iPhone 18 Pro, identificador iPhone19,2) y advierte de que no garantiza calidad general en japonés ni ahorro de batería.

Los idiomas declarados son japonés e inglés, y la licencia es una agregación de licencias originales por modelo (`per-model-original-licenses`), no una licencia única permisiva. Esto condiciona fuertemente su reutilización comercial, especialmente por la presencia de SD-Turbo bajo la Stability AI Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agregación de cuatro modelos: transformer de embeddings (E5-small), transformer encoder-decoder (Whisper Tiny), VLM transformer (Qwen3-VL 2B) y UNet + decodificador latente (SD-Turbo); todos convertidos a Core ML |
| Parametros totales | no disponible (el autor no publica el recuento agregado; Qwen3-VL 2B indica 2B en el nombre) |
| Parametros activos | no aplica (ninguno de los componentes es MoE) |
| Longitud de contexto | 512 tokens (E5), 2048 tokens (Qwen3-VL), audio de utterance corta (Whisper Tiny); no disponible para SD-Turbo |
| Tipos de cuantizacion | FP16 para E5; el resto según conversión Core ML (no se detalla cuantización específica por componente) |
| Idiomas soportados | ja, en |
| Licencia | per-model-original-licenses (agregación; ver LICENSES.md) |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodelc`), distribución plana con prefijos `e5-512--`, `whisper--`, `qwen3vl--`, `sd-turbo--` |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: agrega conversiones de pesos preentrenados. E5 corresponde a `intfloat/multilingual-e5-small` (revisión 614241f6), convertido con coremltools 9.0 a 512 tokens fijos en FP16, con embeddings de 384 dimensiones normalizados por la aplicación y prefijos query/passage. Whisper procede de `argmaxinc/whisperkit-coreml` (revisión 0f63a780), concretamente `openai_whisper-tiny`, con tokenizador offline incluido. La parte de visión es `mlboydaisuke/qwen3-vl-2b-stateful-coreml` (revisión fd430e92), basada en `Qwen/Qwen3-VL-2B-Instruct`, con el encoder de imagen asignado a Neural Engine y el decodificador de lenguaje a GPU. SD-Turbo proviene de `stabilityai/sd-turbo` (revisión b261bac6), convertido con las herramientas de Apple ml-stable-diffusion a 256×256 con UNet dividido.

La innovación técnica no está en el entrenamiento sino en el particionado de cómputo: el autor documenta que una visión íntegramente en Neural Engine falló al cargar y que la generación de imágenes totalmente en NE degradaba la calidad visual, por lo que fija GPU para el denoiser y decodificador de SD-Turbo. Los pesos se distribuyen en formato plano donde el prefijo antes de `--` selecciona el modelo y `__` codifica directorios del paquete; la aplicación reconstruye las rutas solo tras validar SHA-256 contra `model-manifest.json`. No se detalla el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF/DPO, ya que son modelos de terceros.

## Capacidades

- Recuperación semántica multilingüe (japonés e inglés) mediante E5-small, con embeddings de 384 dimensiones y ventana fija de 512 tokens.
- Transcripción de voz a texto con Whisper Tiny, con tokenizador offline; el autor solo valida un fixture sintético corto en japonés.
- Comprensión de una imagen por inferencia con Qwen3-VL 2B, entrada de 448 píxeles y contexto de 2048 tokens en modo greedy.
- Generación de imágenes cuadradas de 256×256 con SD-Turbo, entre 1 y 8 pasos (por defecto 2) y CFG=0.
- Ejecución on-device con reparto de cómputo entre Neural Engine, GPU y CPU.
- Integración en aplicación iOS con verificación de integridad por hash y perfiles de límite de memoria aumentado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento extendido.
- No se incluyen pesos de chat Core ML ni Qwen3 TTS, según advierte el autor.

## Casos de uso

- Búsqueda semántica local en una app iOS japonesa/inglesa: E5-small indexa y recupera pasajes de hasta 512 tokens sin enviar texto a servidores, útil para privacidad y funcionamiento offline.
- Dictado y notas de voz: Whisper Tiny transcribe utterances cortas en el dispositivo, adecuado para capturas rápidas donde no se requiere precisión sobre nombres propios (el autor no la garantiza).
- Asistente visual básico: Qwen3-VL 2B permite describir o responder preguntas sobre una única imagen de 448 px con contexto de 2048 tokens, por ejemplo para identificar objetos en una foto tomada por el usuario.
- Accesibilidad: descripción de imágenes y transcripción de audio en local para usuarios con discapacidad visual o auditiva, sin coste de API y con datos que no salen del dispositivo.
- Generación de miniaturas o avatares: SD-Turbo a 256×256 con 2 pasos produce imágenes rápidas para previsualizaciones o stickers, aceptando fidelidad imperfecta al prompt.
- Prototipado de pipelines multimodales en iOS: combinación de recuperación (E5), ASR (Whisper) y VLM (Qwen3-VL) para validar arquitecturas on-device antes de invertir en modelos mayores.
- Pruebas de integración Core ML: el manifiesto con hashes y el formato plano sirven como referencia para validar cargas segmentadas NE/GPU en pipelines de CI de apps iOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K, WER, FID ni latencia/throughput; solo indica que las respuestas de Qwen3-VL son lentas y que las pruebas físicas se limitan a iPhone 18 Pro (iPhone19,2).

## Requisitos de hardware

- Repositorio de 5,6 GB; el espacio en disco debe cubrir la descarga plana más la reconstrucción de paquetes.
- Qwen3-VL 2B requiere el perfil Increased Memory Limit y al menos 5,5 GB de headroom de proceso, según el autor.
- GPU para E5 y para el decodificador de lenguaje de Qwen3-VL; Neural Engine para el encoder de imagen y el texto de SD-Turbo; GPU para el denoiser y decodificador de SD-Turbo.
- La visión completamente en Neural Engine falló al cargar; la generación de imágenes completamente en NE presentó degradación visual adicional.
- Compatible con dispositivos Apple que soporten Core ML y los perfiles de memoria indicados; el autor solo valida iPhone 18 Pro.
- Despliegue mediante Core ML en apps iOS; no aplica vLLM, llama.cpp, Ollama ni TGI, y el autor prohíbe explícitamente cargar un GGUF en este formato.
- Latencia y throughput no disponibles; el autor califica las respuestas de Qwen3-VL como lentas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chiko Core ML (esta ficha) | Agregado de 4 modelos; Qwen3-VL 2B incluido | 512 / 2048 tokens según componente | Core ML | per-model-original-licenses | Hugging Face, 0 descargas |
| intfloat/multilingual-e5-small | ~118M (small) | 512 tokens | safetensors, ONNX | MIT | Hugging Face |
| openai/whisper-tiny | ~39M | utterance corta | safetensors, GGML | MIT | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct | 2B | no disponible en esta ficha | safetensors | no disponible en esta ficha | Hugging Face |
| stabilityai/sd-turbo | no disponible | no aplica | safetensors | Stability AI Community License | Hugging Face |

La comparativa directa con un único modelo no es posible: Chiko es un paquete de distribución, no un modelo entrenado. Frente a los originales, la diferencia es el formato Core ML y el particionado NE/GPU, no la capacidad.

## Limitaciones y advertencias

- El autor no garantiza calidad general en japonés ni ahorro de batería; las pruebas físicas se limitan a un único dispositivo.
- Whisper solo se valida con un fixture sintético corto en japonés; la precisión sobre ruido y nombres propios no está establecida.
- SD-Turbo presenta fidelidad imperfecta al prompt y no incluye clasificador de contenido de imagen dedicado.
- Qwen3-VL admite una sola imagen, entrada de 448 px, 2048 tokens de contexto y decodificación greedy; las respuestas son lentas.
- Riesgo de alucinación y de salidas incorrectas o inapropiadas; el autor desaconseja usar las salidas para decisiones consecuentes.
- Licencia agregada por modelo: no es todo Apache-2.0 ni todo MIT. SD-Turbo está sujeto a la Stability AI Community License y su Acceptable Use Policy; el uso comercial puede requerir registro o acuerdo enterprise.
- La aprobación del distribuidor no acepta los términos por los usuarios finales; la app debe recoger el consentimiento requerido antes de la descarga.
- No se incluyen pesos de chat Core ML ni Qwen3 TTS; no se debe cargar un GGUF en este formato.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Norixp/chiko-coreml-ios
- Licencias agregadas: https://huggingface.co/Norixp/chiko-coreml-ios/blob/main/LICENSES.md
- Modelo base E5: https://huggingface.co/intfloat/multilingual-e5-small
- Modelo base Whisper (WhisperKit Core ML): https://huggingface.co/argmaxinc/whisperkit-coreml
- Conversión Qwen3-VL 2B Core ML: https://huggingface.co/mlboydaisuke/qwen3-vl-2b-stateful-coreml
- Modelo base Qwen3-VL 2B: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo base SD-Turbo: https://huggingface.co/stabilityai/sd-turbo
- Documentación Core ML de Apple: https://developer.apple.com/documentation/coreml
