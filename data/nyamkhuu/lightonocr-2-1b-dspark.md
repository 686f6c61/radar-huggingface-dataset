# nyamkhuu/LightOnOCR-2-1B-DSpark

## Resumen

LightOnOCR-2-1B-DSpark es un modelo borrador (*drafter*) de decodificación especulativa para el modelo OCR `lightonai/LightOnOCR-2-1B`, publicado por el usuario nyamkhuu. No es un modelo OCR autónomo: su función es acelerar la inferencia del modelo base en vLLM prediciendo bloques de tokens que el modelo objetivo verifica en paralelo. Según la model card, consigue una aceleración de extremo a extremo de aproximadamente 2,6× en decodificación greedy sobre páginas de olmOCR-bench.

El modelo emplea la arquitectura DSpark, que combina el borrador por bloques DFlash con una cabeza de Markov (rango 256) y una cabeza de confianza. Consta de 3 capas tipo Qwen3 (2 de ventana deslizante y 1 de atención completa), tamaño de bloque 8, el vocabulario completo de 151.936 tokens y 245 MB de pesos en bf16. El repositorio declara 128.133.121 parámetros en safetensors.

Es relevante porque el cuello de botella de los pipelines de OCR a gran escala suele ser la decodificación autorregresiva, no el preprocesado de imagen. Un borrador que multiplica por 2,5 el throughput en el mismo hardware permite procesar lotes de documentos mucho mayores sin cambiar de GPU, y su licencia Apache-2.0 facilita la integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark (DFlash block drafter + cabeza de Markov de rango 256 + cabeza de confianza); 3 capas Qwen3 (2 sliding-window, 1 full attention), block size 8 |
| Parametros totales | 128.133.121 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como valor propio; se evaluó con `max_model_len 8192` en el modelo objetivo |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `speculators`, `custom_code`) |

## Arquitectura y entrenamiento

DSpark es una evolución del borrador por bloques DFlash al que se añaden dos componentes: una cabeza de Markov de rango 256, que modela dependencias entre tokens dentro del bloque propuesto, y una cabeza de confianza que estima la probabilidad de aceptación. El borrador tiene 3 capas con atención Qwen3 (dos de ventana deslizante y una de atención completa), propone bloques de 8 tokens y cubre el vocabulario completo de 151.936 tokens del modelo objetivo. Utiliza las capas verificadoras 2, 14 y 25 de LightOnOCR-2-1B, además de la última capa, como características de entrada.

El entrenamiento fue offline con la librería `speculators` 0.9.0 sobre estados ocultos de las propias salidas greedy del modelo base (on-policy) para 19.600–20.500 páginas PDF de una sola página muestreadas de cuatro subconjuntos de `allenai/olmOCR-mix-1025` (documents, books, Library of Congress transcripts y National Archives). Las páginas se renderizaron a 1540 px en el lado más largo; se eliminaron los PDF byte-idénticos a los de olmOCR-bench y el 4,3 % de salidas que alcanzaron el límite de 4096 tokens. La función de pérdida combinó cross-entropy (peso 0,1) y total variation (peso 0,9), con learning rate 6e-4, schedule coseno y lotes de 32.768 tokens, durante 4 épocas en una única RTX PRO 6000.

## Capacidades

- Decodificación especulativa por bloques para OCR de páginas completas sobre LightOnOCR-2-1B.
- Propuesta de hasta 7 tokens por paso de verificación (K configurable; se evaluaron K=4 y K=7).
- Aceleración de latencia y throughput en vLLM ≥ 0.33 con `--speculative-config`.
- Funciona tanto en decodificación greedy (temperatura 0) como con los ajustes de muestreo de la model card base (temperatura 0,2, top_p 0,9).
- No realiza OCR por sí mismo: requiere siempre el modelo objetivo como verificador.
- No soporta tool calling, agentes ni capacidades multimodales propias; hereda el pipeline `image-text-to-text` únicamente a efectos de integración con el modelo base.

## Casos de uso

- Digitalización masiva de archivos: procesar lotes de PDF escaneados con LightOnOCR-2-1B usando el borrador para reducir el tiempo de decodificación por página de 2,37 ms a 0,75 ms por token (TPOT) a concurrencia 1, lo que abarata el coste por documento en pipelines de conversión a texto.
- Servicio OCR con SLA ajustado: desplegar el par modelo base + drafter en vLLM para atender peticiones interactivas con latencia de página aproximadamente 2,6× menor en decodificación greedy.
- Extracción de tablas y documentos financieros: la categoría `tables` de olmOCR-bench alcanza τ = 6,67 con K=7, por lo que la aceleración es máxima en documentos con estructura tabular densa.
- Procesamiento de escaneos antiguos: aunque `old_scans` es la categoría con menor aceptación (τ = 4,12), sigue ofreciendo más de 4 tokens aceptados por paso, útil en proyectos de archivo histórico donde el volumen es alto.
- Despliegue en infraestructura limitada: al añadir solo 245 MB de pesos bf16, permite aumentar el throughput de un servidor OCR existente sin comprar GPU adicionales, con un pico medido de 7.890 tokens/s frente a 3.185 tokens/s sin especulación.
- Investigación sobre decodificación especulativa: sirve como caso de referencia reproducible (comando de entrenamiento y métricas de validación publicados) para estudiar aceptación por posición y el equilibrio entre K y concurrencia.

## Benchmarks y rendimiento

Resultados sobre 300 páginas reservadas de olmOCR-bench (56 a concurrencia 1), vLLM v0.33.0 en una RTX PRO 6000 Blackwell, `max_model_len 8192`, decodificación greedy:

| K (tokens borrador) | Concurrencia | τ | Aceleración latencia/página | Aceleración throughput | TPOT ms (sin spec → con spec) |
|---|---|---|---|---|---|
| 7 | 1 | 5,59 | 2,66× | 2,66× | 2,37 → 0,75 |
| 7 | 16 | 5,40 | 2,59× | 2,44× | 6,58 → 2,17 |
| 7 | 32 | 5,46 | 2,59× | 2,51× | 11,15 → 3,75 |
| 4 | 1 | 4,35 | 2,22× | 2,22× | 2,37 → 0,95 |
| 4 | 16 | 4,25 | 2,28× | 2,22× | 6,58 → 2,61 |
| 4 | 32 | 4,27 | 2,33× | 2,29× | 11,15 → 4,40 |

Con los ajustes de muestreo de la model card base (temperatura 0,2, top_p 0,9), K=7 ofrece 2,40×–2,56× de aceleración de latencia y τ entre 5,20 y 5,40; K=4 ofrece 2,10×–2,33× y τ entre 4,23 y 4,28. La caída de τ respecto a greedy es del 0,5–1 % a concurrencia 16 y 32, y del 7 % a concurrencia 1.

Throughput greedy en régimen estacionario (tokens/s):

| Concurrencia | Sin spec | K=4 | K=7 |
|---|---|---|---|
| 16 | 2.378 | 5.436 | 6.199 |
| 32 | 2.852 | 6.746 | 7.558 |
| 64 | 3.021 | 7.034 | 7.890 |
| 128 | 3.185 | 6.006 | 6.908 |

τ por categoría de olmOCR-bench a concurrencia 16 con K=7: arxiv_math 5,84; headers_footers 4,92; long_tiny_text 4,92; multi_column 5,88; old_scans 4,12; old_scans_math 5,46; tables 6,67. La validación offline (teacher-forced sobre el 2,5 % de las conversaciones de entrenamiento) dio longitud de aceptación 6,69 y precisión 0,97 en la posición 1 y 0,69 en la posición 8. La salida greedy coincide exactamente con la no especulativa en el 80–85 % de las páginas, tasa comparable a la variabilidad del propio modelo base entre ejecuciones (79–87 %); cuando difieren, la similitud mediana de caracteres es 0,999.

## Requisitos de hardware

- VRAM del borrador: 245 MB en bf16, marginal frente a los requisitos del modelo objetivo LightOnOCR-2-1B.
- GPU probada: una RTX PRO 6000 Blackwell. No se han publicado mediciones en otros modelos de GPU.
- GPU recomendadas: no disponible (solo se documenta RTX PRO 6000); por tamaño, cualquier GPU capaz de ejecutar el modelo base en vLLM debería poder alojar el borrador.
- Despliegue: exclusivamente vLLM ≥ 0.33 con `--speculative-config` y `num_speculative_tokens` 7 (recomendado) o 4. Requiere `--limit-mm-per-prompt '{"image": 1}'`, `--mm-processor-cache-gb 0` y `--no-enable-prefix-caching`.
- Throughput máximo medido: 7.890 tokens/s a concurrencia 64 con K=7, frente a 3.185 tokens/s sin especulación.
- El rendimiento decae a concurrencia 128 (6.908 tokens/s con K=7); la causa no se aisló.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Aceleración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LightOnOCR-2-1B-DSpark | Drafter especulativo DSpark para OCR | 128 M | no disponible | ~2,6× latencia, ~2,5× throughput (K=7) | Apache-2.0 | Hugging Face |
| LightOnOCR-2-1B (base) | Modelo OCR image-text-to-text | no disponible en esta ficha | no disponible | 1× (referencia) | Apache-2.0 | Hugging Face |
| Borradores EAGLE/Medusa genéricos | Drafter especulativo de propósito general | variable | no disponible | no disponible para esta tarea | variable | variable |

No se dispone de datos publicados que comparen este borrador con otros drafters específicos para OCR; la comparación cuantitativa solo es posible contra el modelo base sin especulación.

## Limitaciones y advertencias

- No es un modelo OCR independiente: sin LightOnOCR-2-1B como verificador no produce transcripciones.
- Solo se ha validado en una GPU (RTX PRO 6000 Blackwell); el comportamiento en A100, H100 o GPUs de consumo es desconocido.
- El muestreo solo se midió con temperatura 0,2 y top_p 0,9; temperaturas más altas reducirán la tasa de aceptación y, por tanto, la aceleración.
- El throughput cae de concurrencia 64 a 128 (7.890 → 6.908 tokens/s); no se determinó si se debe a presión de caché KV o a cómputo de verificación.
- La validación offline se hizo sobre un 2,5 % aleatorio de las conversaciones de entrenamiento, no separado por documento, por lo que puede sobreestimar la aceptación en documentos nuevos.
- El entrenamiento se limita a cuatro subconjuntos de olmOCR-mix-1025 y a páginas renderizadas a 1540 px; otros dominios o resoluciones pueden reducir τ.
- La coincidencia exacta de salida con la decodificación no especulativa es del 80–85 % de las páginas debido a no determinismo de formas de lote en bf16, no a errores del borrador, pero implica que la salida no es bit a bit reproducible.
- Licencia Apache-2.0 para los pesos; los datos de entrenamiento derivan de olmOCR-mix-1025 (ODC-BY, Allen Institute for AI), cuyos términos deben respetarse en la redistribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nyamkhuu/LightOnOCR-2-1B-DSpark
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-2-1B
- Repositorio de la librería speculators: https://github.com/vllm-project/speculators
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/olmOCR-mix-1025
- Benchmark olmOCR-bench: https://huggingface.co/datasets/allenai/olmOCR-bench
