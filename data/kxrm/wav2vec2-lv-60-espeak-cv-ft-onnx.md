# KXRM/wav2vec2-lv-60-espeak-cv-ft-onnx

## Resumen

`KXRM/wav2vec2-lv-60-espeak-cv-ft-onnx` es una exportación a ONNX con cuantización dinámica int8 de `facebook/wav2vec2-lv-60-espeak-cv-ft`, un modelo wav2vec2 entrenado para convertir audio de voz en secuencias de fonemas IPA en estilo espeak. No es un modelo de reconocimiento de voz orientado a transcripción ortográfica, sino un reconocedor fonético: su salida es una cadena de fonemas, no texto con palabras. El autor lo emplea como verificador de pronunciación en su propio sistema de text-to-speech, para comprobar que la voz sintética pronuncia correctamente nombres de artistas.

El aporte de esta versión es puramente de empaquetado y despliegue: el modelo original de Facebook AI se ha exportado con `torch.onnx.export` (opset 17) y se ha cuantizado con `onnxruntime.quantization.quantize_dynamic` a pesos QInt8 en las capas transformer, dejando el front-end convolucional en float32. El resultado es un único fichero de 355 MB que se ejecuta con ONNX Runtime sin dependencia de PyTorch, lo que simplifica el despliegue en entornos de producción ligeros.

La relevancia es acotada pero clara: cubre un nicho concreto (evaluación fonética de TTS, alineamiento fonético, investigación en fonética computacional) con un formato de inferencia portable y una licencia permisiva. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + encoder transformer), exportado a ONNX opset 17 |
| Parametros totales | no disponible (el fichero int8 pesa 355 MB; el modelo original ronda los 300 M de parametros, dato no confirmado en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de entrada no especificada; salida de 1 frame cada 20 ms) |
| Tipos de cuantizacion | int8 dinamico en pesos (QInt8) para MatMul y Gemm; front-end convolucional en float32 |
| Idiomas soportados | no disponible en la model card; el modelo base esta entrenado para reconocimiento fonetico multilingue (Common Voice, espeak) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`phonemes_int8.onnx`) + `vocab.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec2, un modelo auto-supervisado de representaciones de voz compuesto por un extractor convolucional de características y un encoder transformer, con una cabeza de clasificación CTC. En este caso la cabeza emite 392 clases: fonemas IPA en notación espeak más el token `<pad>` que actúa como blank de CTC. El modelo base `facebook/wav2vec2-lv-60-espeak-cv-ft` fue desarrollado por Facebook AI y descrito en el paper "Simple and Effective Zero-shot Cross-lingual Phoneme Recognition" (arXiv:2109.11680); se entrenó sobre datos de Common Voice con etiquetas fonéticas generadas mediante espeak, lo que permite reconocimiento fonético zero-shot en lenguas no vistas durante el entrenamiento.

Sobre el proceso de exportación: se partió de los pesos originales, se exportó el grafo con `torch.onnx.export` en opset 17 y se aplicó cuantización dinámica int8 solo a las operaciones MatMul y Gemm de las capas transformer. El front-end convolucional se mantiene en float32 deliberadamente, porque muchas builds de ONNX Runtime no incluyen kernel `ConvInteger` para esas capas. El grafo normaliza la entrada a media cero y varianza unitaria internamente, por lo que se deben pasar muestras de audio en bruto. No se documentan datos de entrenamiento adicionales, fine-tuning posterior ni etapas de RLHF/DPO en esta exportación.

## Capacidades

- Reconocimiento fonético: convierte audio de voz en una secuencia de fonemas IPA en estilo espeak, con un frame de salida cada 20 ms.
- Reconocimiento zero-shot multilingüe: al estar entrenado con etiquetas espeak sobre Common Voice, el modelo base está pensado para transcribir fonéticamente lenguas no vistas durante el entrenamiento.
- Verificación de pronunciación: comparación de la secuencia fonética esperada con la producida por un sistema TTS, que es el uso declarado por el autor.
- Entrada de audio mono a 16 kHz en float32 con forma `[1, samples]`; normalización interna incluida en el grafo.
- Salida de logits `[1, frames, 392]` que requiere post-proceso CTC: argmax por frame, fusión de repeticiones y eliminación del índice 0 (`<pad>`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión ni audio generativo.
- No genera texto ortográfico: la salida es fonética, no una transcripción con palabras.

## Casos de uso

- Evaluación de sistemas TTS: se sintetiza una frase con el motor de voz, se pasa el audio resultante por el modelo y se compara la secuencia de fonemas obtenida con la esperada; permite detectar errores de pronunciación en nombres propios, siglas o préstamos, que es exactamente el uso que declara el autor.
- Alineamiento fonético forzado: los frames cada 20 ms permiten mapear fonemas a instantes concretos del audio, útil para anotar corpus de habla o para estudiar duraciones fonéticas.
- Investigación en fonética computacional: extracción de inventarios fonéticos y patrones de pronunciación en corpus multilingües sin necesidad de transcripción ortográfica previa.
- Preprocesado para pipelines de síntesis: generar etiquetas fonéticas a partir de grabaciones para entrenar o ajustar modelos TTS.
- Detección de variación dialectal: comparar las secuencias fonéticas producidas por hablantes de distintas variedades sobre el mismo texto leído.
- Despliegue en entornos sin PyTorch: al ser un único ONNX de 355 MB ejecutable con ONNX Runtime, encaja en servicios contenerizados ligeros, funciones serverless o aplicaciones de escritorio donde instalar el stack de PyTorch no es viable.
- Evaluación de calidad de doblaje o locución: verificar de forma automática que una grabación cumple el guion fonético previsto antes de publicarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de error fonético (PER), comparaciones con el modelo base en float32 ni mediciones de latencia o throughput tras la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero int8 ocupa 355 MB; con activaciones y buffers de ONNX Runtime el consumo en GPU se sitúa típicamente por debajo de 1 GB, aunque no se proporcionan mediciones en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el modelo es lo bastante pequeño para ejecutarse también en CPU.
- Cabe en GPU de consumo: sí, en cualquier tarjeta consumer moderna (GTX 1650, RTX 3060, RTX 4090, etc.), y en CPU sin aceleración dedicada.
- Opciones de despliegue: ONNX Runtime (CPU o GPU con los execution providers correspondientes); no requiere vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. La cuantización dinámica int8 solo afecta a MatMul y Gemm, por lo que la ganancia de velocidad dependerá del backend y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| KXRM/wav2vec2-lv-60-espeak-cv-ft-onnx | no disponible (355 MB int8) | no disponible | Fonemas IPA | Apache-2.0 | ONNX int8 |
| facebook/wav2vec2-lv-60-espeak-cv-ft | no disponible | no disponible | Fonemas IPA | Apache-2.0 | PyTorch (safetensors/bin) |
| Whisper (OpenAI) | 39 M a 1.55 B según variante | 30 s de audio | Texto ortográfico | MIT | PyTorch, ONNX, GGUF |
| wav2vec2-base-960h | ~95 M | no disponible | Texto ortográfico (inglés) | Apache-2.0 | PyTorch |

La comparación directa solo es válida con el modelo base, del que esta versión es una exportación cuantizada: misma arquitectura y mismas capacidades, con la diferencia de formato y precisión. Frente a Whisper o wav2vec2-base-960h el objetivo es distinto: aquellos transcriben texto, este produce fonemas. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- La salida es fonética, no ortográfica: no sirve como sistema de transcripción de voz convencional sin un paso adicional de conversión.
- La cuantización dinámica int8 puede introducir una degradación de precisión respecto al modelo original en float32; no se han publicado métricas que la cuantifiquen.
- El front-end convolucional permanece en float32, por lo que la reducción de tamaño y el ahorro computacional son parciales.
- El modelo base se entrenó con etiquetas generadas por espeak, lo que hereda los sesgos y limitaciones del inventario fonético de espeak para cada lengua.
- No se documentan los idiomas cubiertos ni el rendimiento por lengua en esta model card.
- Riesgo de alucinación fonética: en audio con ruido, música o habla solapada el CTC puede producir secuencias de fonemas plausibles pero incorrectas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en octubre de 2026; no hay evidencia de uso en producción ni de mantenimiento continuado.
- Licencia Apache-2.0, permisiva para uso comercial, pero conviene conservar los avisos de copyright del modelo original de Facebook AI.
- El autor no ofrece garantías sobre el modelo; la model card es mínima y no incluye guía de integración más allá del contrato de entrada y salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KXRM/wav2vec2-lv-60-espeak-cv-ft-onnx
- Modelo base: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
- Paper del modelo base: https://arxiv.org/abs/2109.11680
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
- Documentación de cuantización de ONNX Runtime: https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
