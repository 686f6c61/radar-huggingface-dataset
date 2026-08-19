# konic-labs/LFM2.5-VL-3B-ffn8192-int4-MLX-optimized

## Resumen

LFM2.5-VL-3B-ffn8192-int4-MLX-optimized es un port en MLX (Apple Silicon) del modelo de visión-lenguaje LFM2.5-VL-3B de Liquid AI, cuantizado a INT4/INT8 y optimizado para inferencia de baja latencia en dispositivos Apple. El port lo publica Konic Labs, Inc. y mapea los pesos del checkpoint comprimido (compressed-tensors) directamente a capas `QuantizedLinear` de MLX, sin dequantización ni re-cuantización, lo que permite una mejora de 5,1 a 5,6 veces en la velocidad de decodificación respecto al checkpoint original, manteniendo la calidad del modelo.

El modelo base es un VLM de 3,12 mil millones de parámetros que combina un backbone de lenguaje LFM2.5-2.6B con un codificador de imagen SigLIP2 NaFlex. Está diseñado para ejecutarse en el borde (edge), con capacidades de grounding de objetos, comprensión de pantallas, parsing de documentos y gráficos, y function calling. Esta versión optimizada reduce el tamaño del checkpoint de 2,79 GB a 1,63 GB y el pico de memoria RSS de ~4,8 GB a ~1,9 GB, lo que lo hace viable en Macs con 16 GB de memoria unificada.

La relevancia actual de este modelo radica en que ofrece un VLM de 3B con tool calling y visión capaz de correr en hardware de consumo (Apple Silicon) con velocidades de decodificación de 62-68 tokens por segundo, abriendo la puerta a asistentes multimodales en el dispositivo sin depender de la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model: backbone LFM2.5-2.6B + codificador de imagen SigLIP2 NaFlex |
| Parametros totales | 3.120.738.768 (3,12 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (FFN w1/w3/w2, conv in/out_proj, embeddings/lm_head, attention q/k/v/o) e INT8 (vision fc2, projector) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-VL-3B de Liquid AI combina un backbone de lenguaje LFM2.5-2.6B (arquitectura híbrida propia de Liquid, que mezcla mecanismos de atención con capas de espacio de estados) con un codificador de imágenes SigLIP2 NaFlex. El modelo se entrenó para tareas de grounding, comprensión de pantallas, parsing de documentos y function calling, con capacidad de responder directamente desde la imagen o el texto.

El port MLX de Konic Labs mapea los pesos cuantizados del checkpoint INT4/INT8 (generado con compressed-tensors) a capas `QuantizedLinear` de MLX sin pérdida de valores, y aplica varias optimizaciones a nivel de carga: fusión lineal de pesos (`w1+w3`, `q+k+v`), salidas de `quantized_matmul` en fp16, y un bucle de decodificación optimizado que elimina operaciones costosas (greedy logsumexp, `argpartition`+`categorical` sampling, EOS checks con `bool`, lm_head solo en la última posición en prefill) y reutiliza el KV cache con verificación de prefijo. El resultado es una mejora de 5,1-5,6× en decodificación y una reducción del 42% en tamaño de checkpoint respecto al checkpoint base.

## Capacidades

- Generación de texto y respuestas multimodales a partir de imágenes (image-text-to-text).
- Grounding de objetos: localiza elementos en una imagen y devuelve coordenadas.
- Comprensión de pantallas (mobile, web, desktop) para tareas de automatización y asistencia visual.
- Parsing de documentos y gráficos: extrae información de tablas, gráficos y documentos escaneados.
- Function calling / tool calling: puede invocar herramientas a partir de texto o imagen.
- Soporte de conversaciones multi-turno con reutilización de KV cache.
- Capacidades multilingües: aunque la model card declara solo inglés, el modelo base de Liquid soporta múltiples idiomas (no confirmado en esta versión).

## Casos de uso

- Asistente de accesibilidad en dispositivos móviles: el modelo puede describir el contenido de la pantalla y ejecutar acciones mediante tool calling, ayudando a personas con discapacidad visual a navegar por aplicaciones.
- Automatización de pruebas de UI: dado un screenshot de una interfaz, el modelo identifica elementos y genera comandos de interacción (clics, scroll) gracias a su grounding y function calling, integrándose en pipelines de testing.
- Extracción de datos de facturas y documentos: el parsing de documentos y gráficos permite extraer campos estructurados (importes, fechas, proveedores) de imágenes de facturas o recibos, alimentando sistemas de contabilidad.
- Chatbot de soporte técnico con visión: el usuario envía una captura de pantalla de un error y el modelo diagnostica el problema y sugiere pasos de resolución, usando tool calling para consultar bases de conocimiento.
- Análisis de gráficos financieros: el modelo interpreta gráficos de cotizaciones o métricas de negocio a partir de una imagen y genera un resumen ejecutivo con cifras concretas.
- Asistente de desarrollo en el dispositivo: un IDE que integra el modelo para describir y generar código a partir de diagramas o capturas de pantalla de interfaces, ejecutándose localmente en un Mac sin conexión a la nube.

## Benchmarks y rendimiento

La model card del port proporciona métricas de rendimiento de inferencia en Apple M3 (16 GB), comparando el checkpoint fuente (base de este port) con el port optimizado. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Métrica | Checkpoint fuente | Port MLX optimizado | Delta |
|---|---|---|---|
| Throughput de decodificación | 12,16 tok/s | 62–68 tok/s | +410–460 % |
| TTFT de texto | 167 ms | 62 ms | −63 % |
| TTFT de imagen | ~1,25 s | ~0,88 s | −30 % |
| TTFT multi-turno (reuso de KV) | ~188 ms | ~64 ms | −66 % |
| Prefill | ~200 tok/s | ~600 tok/s | +200 % |
| Tamaño del checkpoint | 2,79 GB | 1,63 GB | −42 % |
| Pico de RSS | ~4,8 GB | ~1,9 GB | −60 % |

Además, el port pasa gates de calidad automatizados: generación de texto greedy (París), tool calling greedy de un solo turno, descripción de imagen (cuadrado rojo sobre blanco) y una prueba de 16 iteraciones de tool calling multi-turno (que discrimina el umbral de 3 bits: ~40 % de tasa de llamadas frente a ~0 % con 3 bits).

## Requisitos de hardware

- Memoria: pico de RSS de ~1,9 GB, cabe en Macs con 16 GB de memoria unificada (probado en Apple M3 16 GB).
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con MLX; no requiere GPU NVIDIA.
- No cabe en GPU de consumo convencionales (RTX 4090, etc.) porque MLX es exclusivo de Apple Silicon; para otras plataformas se necesitaría el checkpoint original en otros formatos.
- Opciones de despliegue: MLX con el loader del repositorio companion (`chat_lfm2.py` para REPL, `serve_lfm2.py` para servidor compatible con OpenAI).
- Latencia: TTFT de texto de 62 ms, decodificación de 62–68 tok/s en M3 (carga dependiente).

## Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento o calidad frente a otros VLM de 3B (p. ej., Phi-3.5-vision, Qwen2-VL-2B, MiniCPM-V 2.6) en la información proporcionada. El modelo base LFM2.5-VL-3B de Liquid AI se posiciona como un VLM de borde con grounding y function calling, pero no hay benchmarks estándar publicados en esta ficha.

## Limitaciones y advertencias

- El port MLX requiere el loader específico del repositorio companion; no funciona con `mlx_vlm.utils.load` estándar debido a los nombres de pesos fusionados.
- La cuantización INT4 es el "suelo de calidad" declarado: con 3 bits se rompe determinísticamente el tool calling multi-turno.
- El modelo está declarado solo en inglés; el uso en otros idiomas puede degradar el rendimiento.
- No se han publicado benchmarks de calidad estándar (MMLU, HumanEval, etc.) para esta versión, por lo que no se puede comparar objetivamente con otros modelos en tareas académicas.
- El rendimiento de decodificación varía con la carga de la máquina; los números reportados son de una prueba en M3 16 GB.
- El modelo puede alucinar contenido visual o textual, especialmente en imágenes ambiguas o documentos complejos; se recomienda validación humana en aplicaciones críticas.
- La licencia Apache-2.0 permite uso comercial, pero el port depende del código companion (también bajo licencia Apache-2.0 según el repositorio).

## Enlaces

- [Modelo en HuggingFace (port MLX)](https://huggingface.co/konic-labs/LFM2.5-VL-3B-ffn8192-int4-MLX-optimized)
- [Modelo base en HuggingFace](https://huggingface.co/konic-labs/LFM2.5-VL-3B-ffn8192-int4)
- [Repositorio companion (código del port)](https://github.com/konic-labs/lfm25-mlx-optimized)
- [Blog de Liquid AI sobre LFM2.5-VL-3B](https://www.liquid.ai/blog/lfm2-5-vl-3b)
- [Documentación oficial de LFM2.5-VL-3B en Liquid Docs](https://docs.liquid.ai/lfm/models/lfm25-vl-3b)
- [Artículo de MarkTechPost sobre el lanzamiento](https://www.marktechpost.com/2026/08/13/liquid-ai-lfm2-5-vl-3b-on-device-vision-language-model/)
