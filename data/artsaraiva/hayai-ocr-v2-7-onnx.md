# artsaraiva/hayai-ocr-v2.7-onnx

## Resumen

Hayai OCR v2.7 ONNX es una conversión y cuantización de los pesos de `JustANormalTinkerer/hayai-ocr-v2.7-supernova`, un modelo de reconocimiento óptico de caracteres (OCR) especializado en texto japonés en viñetas de manga. Lo publica el desarrollador `artsaraiva` como artefacto de inferencia para Yomu, su lector de manga para Android, que descarga estos ficheros para transcribir recortes de texto japoneses en el dispositivo.

El modelo combina una torre de visión basada en la configuración de `google/siglip2-base-patch16-naflex` con un decodificador autorregresivo que opera paso a paso con caché KV. La conversión separa la inferencia en dos grafos ONNX: uno de prefill (torre de visión, proyector y primer paso del decodificador) cuantizado a int4, y otro de decodificación cuantizado a int8. El resultado es un paquete de unos 197 MB de pesos que cabe en un móvil y se ejecuta en CPU con onnxruntime.

Su relevancia es práctica: demuestra que un OCR de manga de calidad casi estado del arte (95,33 % de coincidencia exacta global en JMangaBench_Read sobre 7.789 recortes) puede empaquetarse en un formato portable y cuantizado apto para inferencia local en Android, sin GPU ni servicios en la nube. La licencia Apache-2.0 facilita su reutilización, aunque el ámbito de uso es deliberadamente estrecho: texto japonés en recortes de viñetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-encoder + decoder autorregresivo; torre de visión con config de SigLIP2 base patch16 (naflex) y decodificador con KV cache |
| Parametros totales | no disponible (el repo pesa 0,2 GB e incluye pesos cuantizados int4/int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (decodificación paso a paso con KV cache; sin cifra publicada) |
| Tipos de cuantizacion | int4 (MatMulNBits, block 128, accuracy level 4) en prefill; int8 dinámico por canal en decode |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (onnxruntime); tokenizer.json (BPE byte-level) y pos_embedding.npy (float32, 256×768) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline imagen-a-texto de dos etapas. La torre de visión procesa el recorte con parches de tamaño 16 y valores de píxel escalados a [-1, 1]; su tabla de posiciones de 16×16 (256×768, float32) se remuestrea en código host al grid de parches de cada recorte. Un proyector conecta la salida visual con el decodificador, que genera el texto token a token con caché KV. Los identificadores especiales son bos 16001, eos 16002 y pad 16000, con un tokenizador BPE byte-level guardado sin cambios respecto al repo original.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en la información proporcionada. La model card documenta la procedencia de los pesos (checkpoint `5289b2cfdfd375dd651611b27ea87d21b5877008` del repo base), el script de exportación (`export_hayai_onnx.py` del repo ONNX del autor original) y las versiones de librerías usadas (Python 3.12.13, torch 2.15.0, onnx 1.23.2, onnxscript 0.7.2, onnxruntime 1.32.0, transformers 5.24.1, numpy 2.5.5, tokenizers 0.23.3). La innovación destacable es la división en dos grafos con cuantizaciones distintas: int4 para el prefill (más pesado) e int8 para el decode (más sensible), lo que reduce el tamaño del prefill en unos 28 MB respecto a la conversión del autor original al cuantizar también la cabeza de salida.

## Capacidades

- Reconocimiento de texto japonés en recortes de viñetas de manga (image-to-text).
- Transcripción de diálogos, cartelas y texto rotulado presentes en imágenes de manga.
- Ejecución en CPU con onnxruntime, sin necesidad de GPU.
- Despliegue en dispositivos Android dentro de la aplicación Yomu.
- Manejo de recortes con geometría variable mediante remuestreo de la tabla de posiciones al grid de parches.
- Decodificación greedy paso a paso con caché KV para generación secuencial.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Lectura asistida de manga en Android: Yomu descarga estos ficheros y transcribe los recortes de texto en el propio dispositivo, sin enviar imágenes a un servidor; el tamaño de ~197 MB de pesos y la inferencia en CPU lo hacen viable en un móvil.
- Traducción de manga como paso previo: la transcripción japonesa producida por el modelo alimenta un pipeline de traducción posterior; la coincidencia exacta del 95,33 % en JMangaBench_Read reduce la necesidad de corrección manual.
- Digitalización de archivos de manga: procesamiento por lotes de páginas escaneadas para extraer el texto de cada viñeta y construir corpus o índices de búsqueda.
- Accesibilidad: generación de subtítulos o texto alternativo para lectores con dificultades visuales sobre páginas de manga japonesas.
- Herramientas de estudio de japonés: extracción del texto de viñetas para construir tarjetas de vocabulario o ejercicios de lectura con contexto real.
- Investigación en OCR de manga: el modelo sirve como línea base reproducible en JMangaBench_Read (evaluación con `eval/score.py`, decodificación greedy, un recorte a la vez en CPU, tier de parches limitado a 192).
- Aplicaciones de escritorio o web con onnxruntime: el mismo par de grafos puede ejecutarse fuera de Android en cualquier runtime compatible con ONNX, útil para prototipos sin GPU.

## Benchmarks y rendimiento

Evaluación sobre JMangaBench_Read v1.3.3 (7.789 recortes), decodificación greedy, un recorte a la vez en onnxruntime CPU, tier de parches limitado a `min(auto, 192)`:

| Ficheros | Composite | EM impreso % | EM no impreso % | EM global % | CER % |
|---|---:|---:|---:|---:|---:|
| Conversión del autor (`bc1e39f`) | 98,82 | 96,73 | 91,11 | 95,35 | 1,75 |
| Estos ficheros | 98,80 | 96,72 | 91,06 | 95,33 | 1,75 |

Solo 25 de los 7.789 recortes difieren entre ambos conjuntos: la conversión del autor acierta exactamente 6 que esta no, y esta acierta 4 que la del autor no. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para el caso principal (inferencia en CPU); no se publica cifra de VRAM para GPU.
- Tamaño en disco de los pesos: 109.497.185 bytes (prefill int4) + 87.872.542 bytes (decode int8) + 1.247.253 bytes (tokenizer) + 786.560 bytes (pos_embedding), aproximadamente 197 MB.
- GPU recomendadas: no disponible; el modelo está pensado para CPU con onnxruntime.
- Cabe en GPU de consumo: sí, por tamaño, aunque no se documenta el rendimiento en GPU.
- Despliegue: onnxruntime (CPU, Android mediante Yomu); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la evaluación se realizó recorte a recorte en CPU con tier de parches limitado a 192.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hayai OCR v2.7 ONNX (este) | no disponible (pesos int4/int8, ~197 MB) | no disponible | EM global 95,33 % / CER 1,75 % en JMangaBench_Read | Apache-2.0 | Hugging Face (ONNX) |
| `JustANormalTinkerer/hayai-ocr-v2.7-supernova` (original) | no disponible | no disponible | no disponible en la información proporcionada | Apache-2.0 | Hugging Face |
| `JustANormalTinkerer/hayai-ocr-v2.7-supernova-onnx` (conversión del autor) | no disponible | no disponible | Composite 98,82 / EM global 95,35 % / CER 1,75 % en JMangaBench_Read | Apache-2.0 | Hugging Face (ONNX) |
| `google/siglip2-base-patch16-naflex` | no disponible | no disponible | no disponible | no disponible | Hugging Face (solo se usa su config de visión) |

No se dispone de datos de otros modelos OCR de manga comparables en la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido al japonés y a recortes de texto de manga; no se documenta soporte para otros idiomas ni para documentos generales.
- El modelo base es un fine-tune del que no se publican detalles de entrenamiento, sesgos ni composición del dataset.
- Riesgo de alucinación no cuantificado: en OCR, los errores se manifiestan como sustituciones de caracteres; el CER del 1,75 % indica que persisten fallos, especialmente en texto no impreso (EM del 91,06 % frente al 96,72 % en impreso).
- La evaluación usa un tier de parches limitado a 192 y decodificación greedy; el rendimiento puede variar con otras configuraciones de resolución o muestreo.
- Estos ficheros son una conversión cuantizada, no los pesos originales: la cuantización int4/int8 puede introducir degradaciones no reflejadas en la métrica global (25 recortes difieren del original).
- Los grafos no son idénticos a los de la conversión del autor (distintas versiones de librerías), aunque las entradas y salidas coinciden.
- Uso comercial permitido por Apache-2.0, con la obligación de conservar el aviso de licencia y atribución; los pesos originales son © de su autor.
- No se documentan requisitos de latencia ni consumo de memoria en dispositivo, datos relevantes para producción en móviles de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/artsaraiva/hayai-ocr-v2.7-onnx
- Modelo base: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.7-supernova
- Checkpoint de los pesos: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.7-supernova/tree/5289b2cfdfd375dd651611b27ea87d21b5877008
- Conversión ONNX del autor original: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.7-supernova-onnx
- Script de exportación: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.7-supernova-onnx/tree/bc1e39f962b6c500a4855bd8eb4e02f11483bedb
- Config de visión SigLIP2: https://huggingface.co/google/siglip2-base-patch16-naflex
- Repositorio de Yomu: https://github.com/artsaraiva/yomu
- Benchmark JMangaBench_Read: https://github.com/muscgab/JMangaBench_Read
