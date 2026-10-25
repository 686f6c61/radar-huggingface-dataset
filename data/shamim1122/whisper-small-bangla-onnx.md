# shamim1122/whisper-small-bangla-onnx

## Resumen

`whisper-small-bangla-onnx` es una conversión a ONNX con cuantización dinámica de 8 bits del modelo `arif11/bangla-ASR-v5`, un Whisper small afinado para reconocimiento automático de voz en bengalí. Su autor, shamim1122, la ha preparado específicamente para ejecutarse en el navegador mediante Transformers.js, con un peso total de unos 290 MB entre encoder y decoder. Se emplea en la función de transcripción por IA del reproductor HTML5 Audio Player Pro de bPlugins.

El modelo resuelve un problema concreto: permitir transcripción de audio en bengalí íntegramente en el cliente, sin servidores intermedios ni envío de datos a terceros. Hereda la arquitectura encoder-decoder de `openai/whisper-small` (unos 244M de parámetros), que procesa el audio en ventanas nativas de 30 segundos. Se distribuye bajo licencia Apache-2.0, por lo que admite uso comercial sin restricciones relevantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper) |
| Parámetros totales | ~244M (heredados de openai/whisper-small) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (diseño nativo de Whisper) |
| Tipos de cuantización | 8 bits dinámica (q8) en encoder y decoder, vía ONNX Runtime |
| Idiomas soportados | Bengalí (bn) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX cuantizado, ~290 MB en total (tamaño del repo: 0,3 GB) |

## Arquitectura y entrenamiento

El modelo base es Whisper small de OpenAI, un transformer encoder-decoder que trabaja sobre espectrogramas log-Mel de 30 segundos de audio y fue entrenado originalmente de forma débilmente supervisada sobre cientos de miles de horas de audio multilingüe. La versión afinada, `arif11/bangla-ASR-v5`, especializa el modelo en bengalí; los detalles del fine-tuning (dataset, horas de audio, resultados de WER) no están disponibles en la información publicada.

Este repositorio no añade entrenamiento adicional: es una exportación a ONNX realizada con Hugging Face Optimum, seguida de una cuantización dinámica a 8 bits con ONNX Runtime tanto en el encoder como en el decoder. El resultado pesa unos 290 MB y está estructurado para cargarse directamente desde el navegador con Transformers.js usando el tipo de datos `q8`.

## Capacidades

- Transcripción de voz en bengalí (tarea `transcribe`), invocable con `language: 'bengali'` en el pipeline de Transformers.js.
- Ejecución completamente en el navegador (WASM o WebGPU) sin backend propio, gracias al formato ONNX y a la cuantización a 8 bits.
- Descarga ligera de ~290 MB, adecuada para integración en aplicaciones web orientadas a usuario final.
- Inferencia también posible fuera del navegador con ONNX Runtime (Python, Node.js, C#) o sherpa-onnx.
- No genera marcas de tiempo: el audio largo debe trocearse (por ejemplo en momentos de silencio) y transcribirse por fragmentos.
- No es un modelo de lenguaje: no ofrece generación de texto libre, razonamiento, tool calling, agentes ni capacidades de visión o audio generativo; su función es exclusivamente ASR.

## Casos de uso

- Transcripción en el navegador con privacidad total: al ejecutarse con Transformers.js en el dispositivo del usuario, el audio nunca sale del cliente, lo que lo hace adecuado para apps que manejan grabaciones sensibles sin poder asumir costes de servidor.
- Transcripciones automáticas en reproductores web: es el caso real documentado (función AI Transcript de HTML5 Audio Player Pro de bPlugins), donde el reproductor genera el texto del audio publicado sin infraestructura adicional.
- Accesibilidad en bengalí: generación de transcripciones para usuarios sordos o con dificultad auditiva en sitios web con contenido de audio, cumpliendo buenas prácticas de accesibilidad sin servicios de pago por minuto.
- Transcripción de podcasts, entrevistas y noticias en bengalí: dividiendo el material en fragmentos cortos (el modelo no emite timestamps), se puede obtener el texto completo para archivo o publicación.
- Dictado por voz en aplicaciones web: conversión de notas de voz a texto en herramientas de productividad ligeras, aprovechando que el modelo cabe en memoria y funciona en CPU.
- Construcción de corpus de texto en bengalí: transcripción masiva de audio (radio, vídeos, llamadas) para crear datasets de NLP o para indexar y hacer buscable contenido de audio en un sitio.
- Análisis de llamadas de soporte en bengalí en servidor: con ONNX Runtime sobre CPU, el modelo puede transcribir grabaciones de atención al cliente de forma económica, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco el modelo base afinado (`arif11/bangla-ASR-v5`) documenta cifras de WER en la ficha consultada, por lo que se recomienda evaluarlo con datos propios antes de usarlo en producción.

## Requisitos de hardware

- Navegador (caso de diseño principal): descarga de ~290 MB la primera vez; funciona sobre WASM o WebGPU mediante Transformers.js, sin requisitos de GPU dedicada.
- CPU: plenamente viable, tanto en cliente como en servidor; con cuantización a 8 bits, el modelo ocupa unos 290 MB en memoria, asumible para cualquier equipo moderno.
- GPU: no es necesaria; cualquier GPU con soporte WebGPU (incluidas las integradas de Intel/AMD o NVIDIA de consumo) basta para acelerar la inferencia en navegador. No se requieren A100 ni H100.
- Despliegue: Transformers.js (navegador), ONNX Runtime (Python, Node.js, C#), sherpa-onnx (inferencia de Whisper en ONNX) y Hugging Face Optimum (para regenerar la exportación). Herramientas como vLLM, llama.cpp u Ollama no son aplicables por no tratarse de un LLM.
- VRAM estimada: no disponible como cifra publicada; por tamaño de pesos (~290 MB en q8, menos de 1 GB incluso en fp16 para el modelo base de 244M), cabe con holgura en cualquier GPU de consumo.
- Latencia y throughput: no disponibles; dependerán del backend (WASM, WebGPU, ONNX Runtime) y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Idioma | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|
| shamim1122/whisper-small-bangla-onnx | ~244M | ONNX q8 (~290 MB) | Bengalí | Apache-2.0 | Sí (Transformers.js) |
| arif11/bangla-ASR-v5 | ~244M | PyTorch sin cuantizar | Bengalí | Apache-2.0 | No |
| openai/whisper-small | ~244M | PyTorch (fp32/fp16) | Multilingüe | Apache-2.0 | No nativo |
| onnx-community/whisper-small | ~244M | ONNX | Multilingüe | Apache-2.0 | Sí (Transformers.js) |

En rendimiento comparado no hay datos publicados, por lo que no es posible establecer diferencias medibles entre estas variantes a partir de la información disponible. La ventaja diferencial de esta ficha es la especialización en bengalí combinada con un peso cuantizado listo para web; frente a `onnx-community/whisper-small` (multilingüe sin afinar) puede comportarse mejor en bengalí, aunque habría que verificarlo empíricamente.

## Limitaciones y advertencias

- No genera timestamps: para audio largo hay que implementar segmentación propia (por ejemplo, cortando en silencios) y transcribir fragmento a fragmento.
- Especializado en bengalí: su comportamiento fuera de ese idioma no está documentado y, al ser un fine-tuning monolingüe, es esperable cierta degradación frente al Whisper small original en otras lenguas.
- La cuantización dinámica a 8 bits puede reducir ligeramente la precisión respecto a los pesos en fp32 del modelo afinado original.
- Ventanas nativas de 30 segundos: audios más largos requieren lógica de troceado y concatenación de resultados en la aplicación.
- Sin benchmarks publicados (ni del fine-tuning ni de la versión cuantizada): validar el WER sobre audio representativo del caso de uso antes de pasar a producción.
- Modelo muy nuevo y sin tracción comunitaria (0 descargas y 0 likes en el momento de la ficha): carece de validación por terceros.
- La familia Whisper es conocida por alucinar texto (repeticiones o invenciones) en segmentos de silencio, ruido de fondo o música; conviene filtrar fragmentos sin voz.
- Los detalles del dataset y del proceso de fine-tuning de `arif11/bangla-ASR-v5` no están disponibles, lo que impide evaluar sesgos del entrenamiento.
- La licencia Apache-2.0 no impone restricciones al uso comercial, pero conviene respetar la atribución a los modelos base y afinados según sus términos.

## Enlaces

- Modelo: https://huggingface.co/shamim1122/whisper-small-bangla-onnx
- Modelo afinado (base del fine-tuning): https://huggingface.co/arif11/bangla-ASR-v5
- Modelo base original: https://huggingface.co/openai/whisper-small
- Alternativa ONNX multilingüe de Whisper small: https://huggingface.co/onnx-community/whisper-small
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Exportación de Whisper a ONNX para sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/pretrained_models/whisper/export-onnx.html
- Perfil del autor: https://huggingface.co/shamim1122
