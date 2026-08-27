# mradermacher/Qwen3.8-27B-Moxie-GGUF

## Resumen

El modelo Qwen3.8-27B-Moxie-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-27B-Moxie, creada por mradermacher. El modelo base, desarrollado por mijoko, es una variante del Qwen3.8-27B, un modelo denso de 27 mil millones de parámetros con capacidades multimodales (texto, imagen y vídeo) y una ventana de contexto nativa de 262 144 tokens. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante herramientas como llama.cpp, Ollama o LM Studio, con distintos niveles de cuantización para ajustar el equilibrio entre calidad y uso de memoria.

La relevancia de este modelo radica en que combina un tamaño manejable (27B) con una ventana de contexto muy amplia y soporte multimodal, lo que lo hace adecuado para tareas que requieren razonamiento extenso y comprensión de contenido visual. La variante "Moxie" sugiere un ajuste fino o fusión específica, aunque no se dispone de detalles públicos sobre su entrenamiento. La cuantización GGUF facilita su despliegue local en GPUs de gama media, como RTX 4090 o similares, con una pérdida de calidad controlada según el tipo de cuantización elegido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con capacidades multimodales (texto, imagen, video) - basado en Qwen3.8-27B |
| Parametros totales | 27 320 697 856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | No disponible (se espera multilingüe, similar al modelo base) |
| Licencia | Apache-2.0 (según información del modelo base Qwen3.8-27B; no confirmada para Moxie) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con capacidades multimodales, capaz de procesar texto, imágenes y vídeo (incluyendo vídeo de larga duración). Su arquitectura incorpora un mecanismo de razonamiento ajustable mediante el parámetro `reasoning_effort`, que permite controlar la profundidad del razonamiento (desde `xhigh` por defecto hasta niveles más bajos) para equilibrar calidad y coste computacional. La ventana de contexto nativa es de 262 144 tokens, ampliable hasta 1 000 000 en la versión alojada en la nube de Qwen (aún no disponible localmente).

No se dispone de información específica sobre el entrenamiento de la variante "Moxie". El nombre sugiere un ajuste fino o una fusión de modelos, pero no hay datos públicos sobre el dataset, el método de entrenamiento (RLHF, DPO, etc.) ni las innovaciones técnicas adicionales. La cuantización GGUF realizada por mradermacher no modifica la arquitectura, solo convierte los pesos a formatos de precisión reducida para facilitar la inferencia en hardware limitado.

## Capacidades

- Generación de texto y razonamiento complejo con control de esfuerzo (`reasoning_effort`), permitiendo ajustar la profundidad del análisis.
- Comprensión multimodal: procesa texto, imágenes y vídeo (incluyendo secuencias de vídeo de hasta una hora).
- Ventana de contexto muy amplia (262 144 tokens), adecuada para documentos largos, conversaciones extensas o análisis de vídeo.
- Soporte de tool calling y function calling (probable, dado que el modelo base Qwen3.8 lo incluye, aunque no confirmado para Moxie).
- Capacidades multilingües (esperadas, aunque no documentadas explícitamente para esta variante).
- Modo de razonamiento "thinking" activado por defecto, que puede desactivarse para tareas más directas.

## Casos de uso

- Análisis de documentos extensos: gracias a su contexto de 262K tokens, puede procesar informes, contratos o libros completos en una sola pasada, resumiendo o extrayendo información clave.
- Asistente de atención al cliente multimodal: puede gestionar conversaciones que incluyan capturas de pantalla, imágenes de productos o vídeos de demostración, manteniendo el contexto durante largas interacciones.
- Generación de código con razonamiento: su capacidad de razonamiento profundo y posible tool calling permite integrarlo en pipelines de desarrollo para autocompletar, revisar o explicar código, con control del esfuerzo para tareas simples.
- Análisis de vídeo para vigilancia o revisión de contenido: puede procesar vídeos de larga duración y extraer eventos, objetos o transcripciones, útil en seguridad o moderación.
- Investigación académica: para tareas que requieren razonamiento multi-paso y comprensión de figuras, tablas o gráficos en artículos científicos, con contexto suficiente para mantener el hilo de la argumentación.
- Creación de contenido multimedia: puede generar descripciones, guiones o subtítulos a partir de vídeo o imágenes, aprovechando su capacidad multimodal y su ventana de contexto para mantener coherencia en proyectos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante Moxie en la información disponible. El modelo base Qwen3.8-27B ha sido evaluado en tareas de razonamiento, visión y lenguaje, pero no se dispone de cifras concretas en los resultados de búsqueda. Se recomienda consultar la documentación oficial de Qwen para obtener métricas comparativas del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo ocupa aproximadamente 16-18 GB, lo que permite ejecutarlo en GPUs de 24 GB como RTX 4090 o A5000. Con Q2_K, puede caber en 12-14 GB, aunque con mayor pérdida de calidad.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para mayor velocidad y precisión.
- Compatibilidad con GPUs de consumo: sí, con cuantizaciones Q4 o inferiores en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con adaptación para GGUF), TGI (con conversión a safetensors).
- Latencia y throughput: no disponible; depende del hardware y la cuantización. En una RTX 4090 con Q4_K_M, se espera una velocidad de generación de 20-40 tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Moxie (GGUF) | 27,3B | 262K | Apache-2.0 (probable) | GGUF | Variante multimodal con razonamiento ajustable |
| Qwen3.8-27B (base) | 27,3B | 262K | Apache-2.0 | Safetensors, GGUF | Modelo original sin ajuste Moxie |
| Llama 3.1 8B (GGUF) | 8B | 128K | Llama 3.1 | GGUF | Menor tamaño, menos capacidad multimodal |
| Mistral 7B (GGUF) | 7B | 32K | Apache-2.0 | GGUF | Más ligero, sin visión |

La comparativa se basa en datos públicos del modelo base. No se dispone de información sobre el rendimiento específico de Moxie frente a otras variantes.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información específica para Moxie; el modelo base puede heredar sesgos de los datos de entrenamiento de Qwen.
- Riesgo de alucinación: presente en todos los modelos generativos; el modo de razonamiento por defecto (`xhigh`) puede aumentar la confianza en respuestas incorrectas.
- Limitaciones de contexto: aunque la ventana es de 262K tokens, el rendimiento puede degradarse en los extremos; la ampliación a 1M solo está disponible en la nube de Qwen.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero no se ha confirmado si la variante Moxie mantiene la misma licencia; se recomienda verificar con el autor.
- Advertencia de producción: el modelo tiende a "pensar en exceso" por defecto, lo que puede aumentar la latencia y el coste; se recomienda ajustar `reasoning_effort` para tareas simples.
- La cuantización GGUF introduce pérdida de calidad, especialmente en formatos Q2 y Q3; para tareas críticas se recomienda usar Q5 o superior.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Moxie-GGUF
- Modelo base (mijoko): https://huggingface.co/mijoko/Qwen3.8-27B-Moxie
- Guía de cuantizaciones GGUF para Qwen3.8-27B: https://kingy.ai/blog/qwen3-8-27b-best-quantization-gguf/
- Artículo sobre ejecución local de Qwen3.8-27B: https://codersera.com/blog/how-to-run-qwen-3-8-locally-2026/
- Análisis del comportamiento de razonamiento: https://simonwillison.net/2026/Aug/16/qwen-38-27b/
