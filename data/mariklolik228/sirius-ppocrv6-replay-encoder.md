# mariklolik228/sirius-ppocrv6-replay-encoder

## Resumen

Sirius PP-OCRv6 replay-encoder es un modelo de reconocimiento óptico de caracteres (OCR) especializado en escritura manuscrita médica, publicado por el usuario mariklolik228 en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base metrika-labs/PP-OCRv6_medium_rec_cyrillic_safetensors, un reconocedor CTC de PP-OCRv6 orientado a alfabeto cirílico, adaptado durante 240 pasos con supervisión de replay para el dominio concreto de anotaciones clínicas manuscritas.

El modelo resuelve la transcripción de recortes rectificados de texto (no páginas completas) mediante un cabezal CTC que emite logits por fotograma. Su relevancia radica en la doble publicación de artefactos: pesos PyTorch (best.pt) y exportaciones ONNX con anchura dinámica, lo que facilita su integración en pipelines de inferencia acelerada con ONNX Runtime o TensorRT. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0.

La información publicada es escasa en cuanto a arquitectura interna, composición del dataset y número de parámetros: la model card se centra en los artefactos, el protocolo de entrenamiento y las métricas del pipeline completo, no en las especificaciones del reconocedor. Cualquier dato no presente en la documentación se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconocedor CTC (familia PP-OCRv6) con cabezal de clasificación por fotograma; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen: altura 48 px, anchura dinámica, NCHW) |
| Tipos de cuantizacion | FP32 (ONNX); se menciona ejecución FP16 TensorRT en evaluación; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible explícitamente; el modelo base es cirílico (PP-OCRv6_medium_rec_cyrillic) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (best.pt), ONNX (replay.onnx, replay-decoded.onnx), CSV de escalares TensorBoard, PNG de curvas, SHA256SUMS |

## Arquitectura y entrenamiento

El modelo es un reconocedor de texto basado en CTC, derivado de PP-OCRv6 en su variante medium para cirílico. La entrada son recortes de texto rectificados en formato tensores RGB de forma NCHW con altura fija de 48 píxeles y anchura dinámica, por lote dinámico. La convención de canales del reconocedor es BGR, por lo que las exportaciones ONNX esperan tensores RGB-shape pero interpretados según esa convención. La salida de replay.onnx son logits CTC de anchura dinámica; replay-decoded.onnx devuelve confianza por fotograma e identificadores de token con sesgo de blank aplicado.

El ajuste se realizó durante 240 pasos con pérdida CTC y "supervised replay", una técnica de entrenamiento que combina datos del dominio objetivo con ejemplos de replay para mitigar el olvido catastrófico del modelo base. El checkpoint PyTorch incluye únicamente el state dict y metadatos de entrenamiento. No se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO (no aplicable en un modelo CTC de OCR). El pipeline completo requiere un detector PP-OCRv6 separado para procesar páginas completas, ya que este modelo solo opera sobre recortes.

## Capacidades

- Reconocimiento de texto manuscrito en recortes rectificados, orientado a documentación médica.
- Decodificación CTC con salida de logits por fotograma y variante pre-decodificada con confianza y tokens.
- Procesamiento por lotes dinámicos y anchura variable, adecuado para recortes de longitud heterogénea.
- Exportación ONNX para inferencia con ONNX Runtime y TensorRT (incluida FP16).
- Integración con el detector PP-OCRv6 para construir un pipeline de página completa.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; es un modelo puramente image-to-text de OCR.
- Capacidad multilingüe: no disponible explícitamente; hereda el alcance cirílico del modelo base.

## Casos de uso

- Digitalización de notas clínicas manuscritas: el modelo transcribe recortes de anotaciones médicas con 23,42 % CER y 64,10 % WER sobre 56 recortes anotados, adecuado para pre-rellenar historiales que un humano revisa después.
- Pipeline de página completa en producción: combinado con el detector PP-OCRv6, procesa páginas a 20,16 páginas/s con detector CUDA y reconocedor TensorRT en A100 40 GB, útil para lotes de escaneos hospitalarios.
- Procesamiento por lotes de alta throughput: la configuración más rápida medida alcanza 21,64–21,88 páginas/s en A100 40 GB, apropiada para ingesta masiva nocturna de archivos.
- Despliegue en entornos con ONNX Runtime: las exportaciones ONNX con anchura dinámica permiten servir el reconocedor sin dependencia de PyTorch, integrándose en servicios ya basados en onnxruntime.
- Aceleración con TensorRT en FP16: la evaluación incluye ejecución FP16 TensorRT, lo que permite reducir latencia en GPUs de inferencia dedicadas.
- Extracción de campos estructurados en formularios médicos: al devolver replay-decoded.onnx confianza por fotograma, se pueden filtrar transcripciones de baja confianza para revisión manual.
- Investigación en adaptación de dominio con replay: el paquete incluye curvas de entrenamiento y escalares TensorBoard, útil para reproducir o extender el ajuste supervisado con replay.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 23,42 % | 56 recortes médicos anotados |
| WER | 64,10 % | 56 recortes médicos anotados |
| Throughput página completa (máximo) | 21,64–21,88 páginas/s | A100 40 GB, configuración más rápida medida |
| Throughput página completa (recomendado) | 20,16 páginas/s | A100 40 GB, detector CUDA + reconocedor TensorRT |
| Rendimiento FP16 TensorRT | incluido en la evaluación de 23,42 % CER / 64,10 % WER | 56 recortes médicos anotados |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por no ser aplicables a un modelo OCR. Las páginas completas carecen de referencias completas, según indica el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,2 GB, lo que sugiere un modelo pequeño que probablemente cabe en GPUs de consumo, pero no se confirma.
- GPU recomendadas: A100 40 GB es la plataforma donde se midió el throughput; se menciona ejecución FP16 TensorRT.
- GPU de consumo: no se documenta compatibilidad ni rendimiento en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: ONNX Runtime (librería declarada), TensorRT (FP16), y PyTorch para cargar best.pt; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a OCR).
- Latencia y throughput: 20,16–21,88 páginas/s en A100 40 GB para página completa con pipeline detector + reconocedor.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sirius PP-OCRv6 replay-encoder | Reconocedor CTC PP-OCRv6 ajustado | Recortes altura 48 px, anchura dinámica | Apache 2.0 | Hugging Face, ONNX + PyTorch |
| metrika-labs/PP-OCRv6_medium_rec_cyrillic_safetensors (modelo base) | Reconocedor CTC PP-OCRv6 cirílico | Recortes, altura 48 px | no disponible en la información | Hugging Face |
| PP-OCRv6 detector (requerido para páginas completas) | Detector de texto | Página completa | no disponible en la información | Parte del ecosistema PP-OCRv6 |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Solo procesa recortes de texto rectificados; las páginas completas requieren un detector PP-OCRv6 separado.
- El WER de 64,10 % es elevado: la transcripción a nivel de palabra es poco fiable y exige revisión humana en producción.
- La evaluación se basa en solo 56 recortes anotados, una muestra reducida que limita la generalización de las métricas.
- Las páginas completas carecen de referencias completas, según el propio autor, por lo que el throughput medido no va acompañado de una evaluación de calidad equivalente.
- Riesgo de alucinación y errores en escritura manuscrita atípica no cuantificado; no se documentan sesgos específicos.
- Idiomas soportados no documentados explícitamente; el alcance cirílico se infiere del modelo base.
- La convención de canales BGR frente a la forma RGB de entrada puede provocar errores de integración si no se respeta.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el detector deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/mariklolik228/sirius-ppocrv6-replay-encoder
- Modelo base: https://huggingface.co/metrika-labs/PP-OCRv6_medium_rec_cyrillic_safetensors
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
