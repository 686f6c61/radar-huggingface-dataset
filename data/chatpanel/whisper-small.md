# ChatPanel/whisper-small

## Resumen

`ChatPanel/whisper-small` es un espejo sin modificaciones del modelo `onnx-community/whisper-small`, que a su vez es una conversión a ONNX del `openai/whisper-small` original. El repositorio lo mantiene el proyecto ChatPanel con el único propósito de centralizar las descargas que realiza su pasarela (gateway): los ficheros son idénticos byte a byte a los del upstream, en el commit `36050c46d777d46dc4b5f43f6d90574fc38f8732`. No hay reentrenamiento, cuantización adicional ni edición de ningún artefacto por parte de ChatPanel.

Whisper-small es un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder transformer, desarrollado originalmente por OpenAI y publicado con licencia Apache 2.0. Con aproximadamente 244 millones de parámetros, se sitúa en el punto medio de la familia Whisper (tiny, base, small, medium, large) y ofrece un equilibrio razonable entre precisión de transcripción y coste computacional, lo que lo hace apto para despliegue en CPU o GPU modesta.

La relevancia de esta ficha concreta es limitada desde el punto de vista científico: se trata de un artefacto de distribución, no de un modelo nuevo. Su interés práctico radica en que proporciona los pesos en formato ONNX ya cuantizados (encoder y decoder fusionado), listos para ejecución con ONNX Runtime o Transformers.js, lo que simplifica la integración en aplicaciones web y en entornos sin PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, ASR secuencia a secuencia) |
| Parametros totales | aproximadamente 244 millones (heredados de openai/whisper-small; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | pesos ONNX cuantizados (encoder y decoder); el detalle exacto del esquema figura en `quantize_config.json`, no disponible en la informacion proporcionada |
| Idiomas soportados | no disponibles en la informacion proporcionada (Whisper original soporta multilingue, pero no se detalla aqui) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper-small de OpenAI, un transformer encoder-decoder entrenado para transcripción y traducción de voz. El encoder procesa espectrogramas log-Mel de audio en ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para idioma, tarea (transcribir o traducir) y marcas de tiempo. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del corpus ni si se aplicaron etapas de ajuste fino con RLHF o DPO; la model card de este repositorio no aporta esos datos y remite al `UPSTREAM_README.md`.

La innovación técnica relevante en este artefacto no está en el entrenamiento, sino en el empaquetado: la conversión a ONNX separa encoder y decoder y fusiona el decoder con su caché KV (`decoder_model_merged_quantized.onnx`), lo que permite decodificación incremental eficiente. Los pesos están cuantizados, lo que reduce el tamaño del repositorio a 0,2 GB y facilita la inferencia en CPU. No hay ninguna modificación propia del publicador; los hashes SHA-256 listados en la model card permiten verificar la integridad respecto al upstream.

## Capacidades

- Transcripción de audio a texto (ASR) en ventanas de hasta 30 segundos por segmento.
- Traducción de voz a texto en inglés (capacidad heredada de Whisper; no verificada en esta copia concreta).
- Detección de idioma y marcas de tiempo a nivel de segmento mediante tokens especiales.
- Ejecución en ONNX Runtime y en el ecosistema Transformers.js para entornos JavaScript/Node.
- Inferencia en CPU viable gracias a la cuantización de los pesos.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo convierte grabaciones cortas en texto con marcas de tiempo, adecuado para integrarse en aplicaciones de productividad que ya usan ONNX Runtime.
- Subtitulado automático de vídeo: la salida con timestamps permite generar ficheros de subtítulos (SRT/VTT) para contenido de menos de 30 segundos por segmento, encadenando ventanas.
- Dictado en aplicaciones web: al estar en formato ONNX y ser compatible con Transformers.js, puede ejecutarse en el navegador o en un backend Node sin dependencia de PyTorch.
- Indexación y búsqueda de audio: transcripción previa de archivos de audio para alimentar motores de búsqueda o sistemas RAG sobre contenido hablado.
- Atención al cliente con análisis de llamadas: transcripción de grabaciones para auditoría de calidad y extracción de métricas, con la ventaja de un modelo pequeño y desplegable en infraestructura modesta.
- Prototipado rápido de pipelines ASR: al ser una copia verificable con hashes, sirve como dependencia estable en entornos de CI o en la pasarela de ChatPanel para descargar siempre la misma versión.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en aplicaciones de vídeo o streaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye métricas de WER, MMLU ni de ningún otro tipo, y remite al `UPSTREAM_README.md` del proyecto `onnx-community/whisper-small`, cuyos datos no se han proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos ONNX cuantizados incluidos en el repositorio (0,2 GB de artefactos); el consumo real depende del runtime y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre; tarjetas como RTX 3060, RTX 4060 o superiores son más que suficientes. También funciona en A100/H100, aunque el modelo está sobredimensionado para ellas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU.
- Despliegue: ONNX Runtime (Python o C++), Transformers.js, y potencialmente servidores compatibles con ONNX. No se menciona soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo de 244 M de parámetros cuantizado, se espera inferencia en tiempo real o superior en CPU moderna, pero no hay cifras publicadas en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (audio) | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatPanel/whisper-small | ~244 M | ventanas de 30 s | ONNX cuantizado | apache-2.0 | Hugging Face (espejo) |
| openai/whisper-small | ~244 M | ventanas de 30 s | PyTorch (safetensors/bin) | apache-2.0 | Hugging Face (original) |
| onnx-community/whisper-small | ~244 M | ventanas de 30 s | ONNX cuantizado | apache-2.0 | Hugging Face (upstream del espejo) |
| openai/whisper-base | ~74 M | ventanas de 30 s | PyTorch | apache-2.0 | Hugging Face |

La comparación relevante es que `ChatPanel/whisper-small` y `onnx-community/whisper-small` son funcionalmente idénticos; la única diferencia es el mantenedor del repositorio. Frente a `whisper-base`, el modelo small ofrece mayor precisión a costa de más cómputo, aunque no se dispone de cifras de WER en la información proporcionada para cuantificar la diferencia.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: cualquier limitación del Whisper-small original aplica aquí sin cambios (sesgos de transcripción, errores en acentos y audio ruidoso).
- Riesgo de alucinación en pasajes de silencio o ruido: Whisper puede generar texto inventado en segmentos sin habla clara.
- Ventana de audio limitada a 30 segundos por segmento; para audios largos es necesario segmentar y encadenar, con posible pérdida de contexto entre ventanas.
- Idiomas soportados no detallados en esta ficha; aunque el Whisper original es multilingüe, no se confirma en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución a OpenAI y al proyecto `onnx-community`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación comunitaria de esta copia concreta.
- El esquema exacto de cuantización no se detalla en la información proporcionada; conviene revisar `quantize_config.json` antes de asumir precisiones o tolerancias concretas.
- No apto para tareas de generación de texto, razonamiento o código: es exclusivamente un modelo ASR.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChatPanel/whisper-small
- Upstream ONNX: https://huggingface.co/onnx-community/whisper-small
- Modelo base original: https://huggingface.co/openai/whisper-small
- Commit del upstream referenciado: `36050c46d777d46dc4b5f43f6d90574fc38f8732` (en el repositorio de onnx-community/whisper-small)
- Model card upstream: fichero `UPSTREAM_README.md` dentro del repositorio de ChatPanel
