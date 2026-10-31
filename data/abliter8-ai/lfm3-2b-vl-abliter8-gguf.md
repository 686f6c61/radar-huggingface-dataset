# abliter8-ai/lfm3-2b-vl-abliter8-gguf

## Resumen

LFM3-VL-2B-Abliter8 es una versión "abliterated" (con reducción de rechazos) del modelo de visión-lenguaje LFM3-VL-2B de Liquid AI, publicada por abliter8-ai en HuggingFace en formato GGUF (con variante MLX disponible). El modelo original es un VLM compacto de 1.92 mil millones de parámetros (backbone de lenguaje de 1.73B, encoder de visión de 164M y proyector de 25M) con ventana de contexto de 128K tokens, orientado a comprensión de documentos, gráficos, capturas de pantalla y preguntas sobre imágenes, incluyendo OCR, visual grounding y uso de herramientas visuales.

La aportación de abliter8-ai consiste en aplicar una técnica de abliteration sobre el backbone multimodal del propio modelo: una proyección de rango uno escalada (`W' = W - 2 r (r^T W)`) sobre 32 matrices de escritura residual en las capas 8 a 23, con el objetivo de reducir los rechazos del modelo ante contenido sensible sin reentrenamiento. Es relevante porque ofrece un VLM pequeño, sin censura, cuantizado y ejecutable localmente, útil para análisis directo de documentos e imágenes cuyo tema puede disparar negativas en el modelo original.

Los pesos editados no han sido reevaluados en los benchmarks oficiales de Liquid, por lo que las puntuaciones publicadas (96.7 en DocVQA, 92.7 en ChartQA con thinking activado) corresponden al modelo original sin modificar, no a esta versión cuantizada y editada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (LFM3, híbrido con componentes conv; encoder de visión + proyector + backbone de lenguaje) |
| Parametros totales | 1.728.801.600 (safetensors del repo); el modelo original declara 1.92B (1.73B lenguaje + 164M visión + 25M proyector) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 128K tokens (declarada por Liquid; no revalidada en esta versión editada) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q4_K_M, Q4_0; MLX: 8-bit, 6-bit, 4-bit |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other, licencia de Liquid AI) |
| Formato de pesos | GGUF (este repo) y MLX (repo hermano); base en BF16 |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM3-VL-2B, es un modelo de visión-lenguaje de la familia LFM3 de Liquid AI, compuesto por un encoder de visión de 164M de parámetros, un proyector de 25M y un backbone de lenguaje de 1.73B que incluye componentes convolucionales (se editan matrices `conv.out_proj`), lo que sugiere una arquitectura híbrida con capas convolucionales además de atención estándar. Está diseñado para comprensión de imagen y vídeo, OCR, visual grounding y uso de herramientas visuales. No se dispone de detalles públicos sobre el número de tokens de entrenamiento ni la composición del dataset en la información proporcionada.

La edición de abliteration de abliter8-ai no implica reentrenamiento ni injerto de pesos: se ajustó la dirección de rechazo sobre las activaciones del propio backbone de lenguaje del modelo y se aplicó `W' = W - 2 r (r^T W)` a 32 matrices de escritura residual (`self_attn.o_proj`, `feed_forward.w2` y `conv.out_proj`) en las capas 8 a 23, con fuerza 2. Una auditoría BF16 confirma que todos los demás tensores y archivos del procesador/codec permanecen intactos, conservando el encoder de visión y el proyector originales. La conversión MLX cuantiza solo el backbone de lenguaje, dejando los componentes multimodales sin cuantizar.

## Capacidades

- Comprensión de imagen y texto (pipeline image-text-to-text): análisis de documentos, gráficos, capturas de pantalla y preguntas sobre imágenes.
- OCR y extracción de texto de imágenes.
- Visual grounding y uso de herramientas visuales (según la model card del modelo base).
- Comprensión de vídeo (capacidad declarada del modelo base).
- Modo thinking: el modelo base publica resultados con thinking activado y desactivado; en las pruebas de abliter8 se usó con thinking desactivado.
- Conversación multi-turno (tag conversational).
- Reducción de rechazos en texto ante prompts sensibles: 0 rechazos estrictos por cada 100 prompts en todas las cuantizaciones GGUF y MLX probadas.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- OCR y digitalización de documentos: gracias a sus 96.7 en DocVQA (modelo base), puede extraer texto y responder preguntas sobre facturas, contratos y formularios escaneados en local, sin enviar datos a terceros.
- Análisis de gráficos y dashboards: con 92.7 en ChartQA (modelo base), es adecuado para interpretar gráficos de business intelligence y responder preguntas sobre tendencias y valores.
- Asistente sobre capturas de pantalla: puede responder preguntas sobre interfaces de usuario, mensajes o errores en capturas, útil para soporte técnico y documentación.
- Procesamiento de material visual sensible en investigación: la reducción de rechazos permite analizar directamente imágenes con anatomía adulta o texto sensible (por ejemplo, en contextos médicos o forenses) sin negativas del modelo.
- Despliegue en dispositivos con recursos limitados: con ~2B de parámetros y cuantización Q4_K_M o 4-bit MLX, cabe en GPUs de consumo e incluso en equipos portátiles, apto para apps de escritorio con análisis de imágenes.
- Generación de descripciones y metadatos de imágenes en pipelines: su formato GGUF permite integrarlo con llama.cpp en flujos batch de etiquetado y indexación de imágenes.
- Prototipado de agentes visuales: su soporte de visual tool use (modelo base) y contexto de 128K facilitan experimentos de razonamiento multi-paso sobre documentos largos con imágenes.

## Benchmarks y rendimiento

Benchmarks oficiales del modelo base (Liquid AI, no reevaluados sobre los pesos editados):

| Benchmark | LFM3-VL-2B (thinking on) | Qwen3.5-4B | Qwen3.5-2B |
|---|---:|---:|---:|
| DocVQA | 96.7 | 97.1 | no disponible |
| ChartQA | 92.7 | 85.8 | no disponible |
| Media de categoría | 71.4 | 73.4 | 64.0 |

Con thinking desactivado, la media de categoría del modelo base es 62.1.

Evaluación propia de abliter8-ai sobre los GGUF (detector estricto de rechazos sobre 100 prompts; XSTest con 100 prompts seguros):

| GGUF | Rechazos estrictos /100 | Falsos rechazos XSTest /100 | KLD medio | Perplejidad | Top-1 agreement |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 0 | 1 | 0.03448 | 96.029 | 90.01% |
| Q6_K | 0 | 1 | 0.04980 | 97.699 | 88.09% |
| Q4_K_M | 0 | 0 | 0.14822 | 91.536 | 79.34% |
| Q4_0 | 0 | 0 | 0.22034 | 96.815 | 74.99% |

Referencia: LFM3-VL-2B stock Q8_0, perplejidad 95.133.

Evaluación MLX (deriva de cuantización respecto al máster BF16 editado, contexto corto, WikiText):

| MLX | Rechazos estrictos /100 | Falsos rechazos XSTest /100 | KLD medio | Perplejidad | Top-1 agreement |
|---|---:|---:|---:|---:|---:|
| 8-bit | 0 | 1 | 0.00377 | 88.334 | 96.39% |
| 6-bit | 0 | 1 | 0.02017 | 89.576 | 91.21% |
| 4-bit | 0 | 0 | 0.27674 | 82.883 | 72.22% |

Referencia BF16: perplejidad 88.397.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1.73B de parámetros de lenguaje más el encoder de visión (~164M), se estima en torno a 2 GB en BF16, ~1 GB en Q8_0 y ~0.7-0.9 GB en Q4_K_M (estimaciones basadas en el tamaño de parámetros; el repo completo pesa 9.3 GB por incluir múltiples cuantizaciones).
- GPUs recomendadas: cualquier GPU moderna; dada la clase de tamaño, una RTX 3060/4060 o superior es más que suficiente. No se requieren A100 ni H100.
- Consumer GPUs: sí, cabe con holgura en GPUs de 6-8 GB de VRAM e incluso es viable en CPU con llama.cpp dada la cuantización Q4.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio; la variante MLX está pensada para Apple Silicon (mlx-vlm). vLLM y TGI no se mencionan para esta versión GGUF/MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-Abliter8 (este) | 1.73B lenguaje + 164M visión | 128K | lfm1.0 (other) | GGUF, MLX | Abliterated, sin rechazos medidos |
| Qwen3.5-2B | ~2B | no disponible | no disponible | no disponible | Media de categoría 64.0 frente a 71.4 del LFM3-VL-2B |
| Qwen3.5-4B | ~4B | no disponible | no disponible | no disponible | Mejor en DocVQA (97.1) pero peor en ChartQA (85.8); doble de tamaño |

## Limitaciones y advertencias

- Los benchmarks de Liquid corresponden al modelo original sin editar; abliter8-ai no ha reevaluado DocVQA, ChartQA ni la media de categoría sobre estos pesos cuantizados y editados, por lo que no se pueden reclamar esas puntuaciones.
- La ventana de contexto de 128K no ha sido revalidada a longitud completa en esta versión.
- La mejora en rechazo de imágenes sensibles es un objetivo declarado, no una afirmación medida: no se ha ejecutado un benchmark específico de rechazo de imágenes sensibles.
- La abliteration no añade conocimiento, capacidad de razonamiento ni nuevas modalidades; solo reduce una tendencia aprendida a rechazar. No todas las respuestas serán correctas ni estarán libres de negativas.
- La cuantización Q4 (GGUF Q4_0/Q4_K_M y MLX 4-bit) muestra deriva notable (top-1 agreement de 72-79%, KLD 0.15-0.28); para máxima fidelidad al modelo original se recomienda Q8_0 o 8-bit.
- Riesgo de alucinación: inherente a VLM pequeños; las pruebas de contenido de salud sexual adulta verifican disposición a responder, no precisión médica.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; verificar cobertura antes de uso en castellano.
- Licencia lfm1.0: es una licencia personalizada de Liquid AI ("other"); revisar sus términos antes de uso comercial.
- Uso en producción: al tratarse de un modelo sin salvaguardas, se recomiendan capas externas de moderación si se expone a usuarios finales.

## Enlaces

- Modelo GGUF: https://huggingface.co/abliter8-ai/lfm3-2b-vl-abliter8-gguf
- Modelo MLX: https://huggingface.co/abliter8-ai/lfm3-2b-vl-abliter8-mlx
- Colección LFM3 Abliter8: https://huggingface.co/collections/abliter8-ai/lfm3-abliter8
- Modelo base: https://huggingface.co/LiquidAI/LiquidAI/LFM3-VL-2B (modelo base referenciado: https://huggingface.co/LiquidAI/LFM3-VL-2B)
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/LICENSE
- Model card original de Liquid (fuente de benchmarks): https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/f83d2b0a2296aaa277f394990a9b8b949ddf9691/README.md
- Web de abliter8: https://abliter8.ai
