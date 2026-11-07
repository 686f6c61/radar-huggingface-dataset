# Reza2kn/Bina-0.4-Rizeh-LiteRT-INT4

## Resumen

Bina-0.4-Rizeh-LiteRT-INT4 es una conversión cuantizada a INT4 del modelo OCR persa Bina-0.4-Rizeh, publicada por Reza Sayar (Reza2kn) en formato LiteRT/TFLite para despliegue en dispositivos con recursos limitados. El paquete incluye los cinco lectores CTC del pipeline original (body95k, etiquetas cortas, texto impreso, numérico/matemático y escaneos degradados) junto con tres detectores experimentales de líneas y tablas. No se trata de un modelo generativo generalista, sino de un conjunto de componentes de reconocimiento óptico de caracteres especializados en escritura persa.

La relevancia de esta publicación radica en su enfoque de cuantización mixta verificable: aproximadamente el 95,5 % de los elementos constantes almacenados son INT4, con activaciones cuantizadas dinámicamente en los kernels soportados, y cada componente registra el SHA256 del checkpoint fuente en `quantization_config.json`. El autor documenta con transparencia los límites de la conversión: aunque los lectores alcanzan una paridad de caracteres mínima del 98,259 % frente a los baselines FP32 en 300 recortes de desarrollo, el pipeline completo de página no supera la puerta del 98 % en transcripción de páginas completas, por lo que no debe considerarse un reemplazo directo del pipeline de producción.

El modelo está pensado para integración en aplicaciones de OCR de línea a línea en persa, con cinco firmas de entrada de ancho fijo (512, 1024, 2048, 4096 y 8192 píxeles) y un tamaño de repositorio de 0,2 GB, lo que facilita su despliegue en entornos de borde. La licencia es restrictiva (CC BY-NC 4.0 para los pesos del reconocedor original, con términos adicionales de Surya para los componentes de layout), lo que limita el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CTC reader (reconocimiento de líneas de texto) sobre backbone no especificado; detectores experimentales incluidos |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de línea de 64 px de alto y anchos de 512 a 8192 px) |
| Tipos de cuantización | INT4 con cuantización dinámica de activaciones (receta dynamic4/block32); ~95,5 % de constantes almacenadas en INT4 |
| Idiomas soportados | persa (fa) |
| Licencia | bina-0.4-rizeh (pesos originales CC BY-NC 4.0; componentes Surya bajo sus términos upstream) |
| Formato de pesos | LiteRT/TFLite (flatbuffer); checkpoint fuente en safetensors |
| Entrada | mapas de tinta float32 de 64 px de alto, negro=1, papel=0, con márgenes del 20 % vertical y 30 % horizontal |
| Salida | tokens CTC (blank=0, índices mapeados a vocab.json), confianza y longitudes |
| Firmas LiteRT | batch 1; anchos 512, 1024, 2048, 4096 y 8192 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo base Bina-0.4-Rizeh es un sistema OCR compuesto por cinco lectores CTC independientes, cada uno especializado en un dominio de entrada: cuerpo de texto general (body95k), etiquetas cortas, texto impreso, contenido numérico y matemático, y escaneos degradados. Cada lector procesa una única línea de texto (o un recuadro de línea explícito) y emite una secuencia de tokens mediante decodificación CTC, sin detección ni ensamblado de documentos completos. El pipeline de referencia en Python combina estos lectores con componentes adicionales de layout y orden (derivados de Surya), rutas nativas de detección, maquinaria de tablas y pequeños modelos de admisión y ordenación.

La conversión a LiteRT aplica cuantización de pesos a 4 bits con la receta dynamic4/block32, cuantizando dinámicamente las activaciones en los kernels que lo soportan. El autor verificó el agregado `model.safetensors` tensor a tensor contra los checkpoints nativos publicados y documenta el SHA256 de cada checkpoint fuente. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. Los detectores experimentales (detector principal 1000, guardián de líneas rule-C 500 y detector/cabeza de impreso) se validaron comparando sus mapas de calor de desarrollo con los modelos FP32 originales, pero su impacto completo en geometría, tablas y transcripción no está cualificado.

## Capacidades

- Reconocimiento de líneas de texto en persa mediante decodificación CTC, con conversión de orden visual a lógico según `rtl.py`.
- Cinco lectores especializados por dominio: cuerpo general, etiquetas cortas, impreso, numérico/matemático y escaneos degradados.
- Procesamiento de entradas de ancho variable sin aplastar ni truncar, gracias a las cinco firmas de ancho fijo (512 a 8192 px) y al parámetro de ancho real.
- Salida con confianza por token y longitudes de secuencia.
- Caché exacta de entradas acotada y sesiones persistentes para reducir llamadas de reconocimiento repetidas.
- Detectores experimentales de líneas y tablas (no cualificados para sustituir a los de producción).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.
- No se reclama soporte para Sherpa-ONNX OCR.

## Casos de uso

- Digitalización de líneas de texto persa en aplicaciones móviles o de borde: el tamaño de 0,2 GB y el formato LiteRT permiten ejecutar el reconocedor en dispositivos sin GPU dedicada, procesando líneas individuales con las firmas de ancho predefinidas.
- Extracción de etiquetas cortas en formularios y documentos administrativos: el lector especializado en etiquetas cortas está diseñado para cadenas breves, adecuado para campos de metadatos en digitalización documental.
- Reconocimiento de texto impreso en escaneos de calidad media: el lector de impreso cubre documentos tipográficos, útil en pipelines de archivo y bibliotecas digitales en persa.
- Procesamiento de contenido numérico y matemático: el lector específico permite extraer expresiones y cifras de material académico o técnico, siempre que se le proporcionen recortes de línea correctos.
- Recuperación de texto en escaneos degradados: el lector dedicado a escaneos degradados aborda documentos con ruido o baja calidad, común en archivos históricos.
- Integración en pipelines OCR existentes con detección externa: dado que el modelo no detecta ni ensambla documentos, se puede combinar con el pipeline Python de referencia (Surya para layout y orden) usando los lectores cuantizados solo en la fase de reconocimiento de línea.
- Prototipado y evaluación en escritorio Linux o Mac: el autor documenta pruebas en CPU Linux y en un Mac M2, lo que permite validar la paridad de línea antes de comprometer un despliegue.

## Benchmarks y rendimiento

| Runtime | Componentes de lector | Paridad de caracteres mínima por bucket |
|---|---:|---:|
| litert-dynamic4-block32 | 5/5 | 98,259 % |

La paridad se midió sobre 300 recortes internos de desarrollo congelados (50 por bucket: inglés, manuscrito, mixto, periódico, impreso y sintético), comparando contra baselines PyTorch 2.10 en CUDA sin comprimir, sin normalización de texto. La concordancia exacta por línea se reporta por separado en `VALIDATION.json`. El autor advierte que estas cifras son canarios de desarrollo y no precisión sobre datos retenidos ni certificación de página completa. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks estándar de OCR en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio (0,2 GB) sugiere un consumo de memoria muy bajo, compatible con CPU.
- GPU recomendadas: no se especifican; el autor probó Linux CPU y un Mac M2 (Apple Silicon) para validación.
- Compatibilidad con GPU de consumo: probablemente sí por el tamaño reducido y el formato LiteRT, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: LiteRT/TFLite con las cinco firmas batch-1; el pipeline Python de referencia (`inference.py` con `Recognizer.read_line`) requiere `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que los tiempos en Mac se recogieron durante trabajo concurrente de conversión y navegador y no son rankings de velocidad controlados; los resultados en CPU Linux y CUDA son específicos del host y Windows nativo no se probó. No se probó hardware Android ni iOS.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bina-0.4-Rizeh-LiteRT-INT4 | OCR CTC (5 lectores) | persa | INT4 mixta | bina-0.4-rizeh (NC) | Hugging Face, LiteRT |
| Bina-0.4-Rizeh (base) | OCR CTC (5 lectores) | persa | FP32 (safetensors) | CC BY-NC 4.0 + términos Surya | Hugging Face |
| Bina-0.4-Koochik | no disponible en la información | persa (presumible) | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El pipeline completo de página no supera la puerta del 98 % de transcripción: una muestra pública de tablas manuscritas expuso cambios sustanciales de salida aunque los canarios de línea pasaran. No es un reemplazo directo del pipeline de producción.
- La paridad de máscara IoU de los detectores no equivale a paridad de transcripción; no se deben sustituir los detectores de producción basándose solo en IoU.
- Los detectores incluidos son experimentales y su impacto en geometría, tablas y transcripción no está cualificado.
- El modelo no detecta ni ensambla documentos completos: solo reconoce líneas o recuadros de línea explícitos.
- Solo soporta persa; no hay capacidades multilingües documentadas.
- Licencia restrictiva: los pesos del reconocedor original están bajo CC BY-NC 4.0, lo que excluye el uso comercial; los componentes derivados de Surya mantienen sus términos upstream. La conversión no concede derechos adicionales y exige mantener la atribución a Bina/Indra/Surya.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo CTC de OCR, el riesgo principal es de errores de reconocimiento en dominios no cubiertos por los canarios.
- Entorno de validación limitado: sin pruebas en Android, iOS ni Windows nativo; los tiempos de Mac no son mediciones controladas.
- La ruta de seguridad opcional con lectores FP32 originales en páginas manuscritas en color es de precisión mixta y requiere cualificación separada del pipeline completo.

## Enlaces

- Hugging Face: https://huggingface.co/Reza2kn/Bina-0.4-Rizeh-LiteRT-INT4
- Modelo base: https://huggingface.co/Reza2kn/Bina-0.4-Rizeh
- Checkpoint fuente fijado: https://huggingface.co/Reza2kn/Bina-0.4-Rizeh/tree/51b8c314b0552b1884c1f0e28016cb12a143f637
- Licencia: https://huggingface.co/Reza2kn/Bina-0.4-Rizeh/blob/51b8c314b0552b1884c1f0e28016cb12a143f637/README.md
- Bina-0.4-Koochik: https://huggingface.co/Reza2kn/Bina-0.4-Koochik/tree/main
- GitHub del autor: https://github.com/Reza2kn
