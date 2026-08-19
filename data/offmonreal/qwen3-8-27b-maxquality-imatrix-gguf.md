# offmonreal/Qwen3.8-27B-MaxQuality-iMatrix-GGUF

## Resumen

El modelo `offmonreal/Qwen3.8-27B-MaxQuality-iMatrix-GGUF` es una cuantización GGUF del checkpoint oficial `Qwen/Qwen3.8-27B`, preparada por el usuario offmonreal para ejecución eficiente en hardware de consumo mediante llama.cpp. Se trata de un modelo denso de aproximadamente 27 320 millones de parámetros, basado en la arquitectura de la familia Qwen3.8, que incorpora una capa nativa de Multi-Token Prediction (MTP) para decodificación especulativa integrada. Esta versión concreta es exclusivamente de texto: el conversor descarta los tensores de la torre de visión del modelo original, por lo que no admite entradas de imagen ni vídeo.

El interés principal de esta release reside en su optimización para tarjetas gráficas de 16 GB de VRAM. Se ofrecen dos variantes cuantizadas (Q3_K_M y Q4_K_M), ambas calibradas con iMatrix (802 fragmentos de calibración), y la variante Q3_K_M permite cargar el modelo completo más su cabecera MTP en la GPU, alcanzando velocidades de generación de aproximadamente 45 tokens por segundo en una RTX 5060 Ti. La variante Q4_K_M, por el contrario, requiere descargar 34 de las 64 capas a CPU para mantener los 128 000 tokens de contexto, con una velocidad de unos 10 tokens por segundo. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) con capa MTP nativa (1 bloque adicional) |
| Parametros totales | 27 320 697 856 (aprox. 27,32 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo); la variante Q3_K_M limita el contexto a 60 000 en el lanzamiento recomendado |
| Tipos de cuantizacion | Q3_K_M (3,95 BPW, 12,57 GiB) y Q4_K_M (4,92 BPW, 15,66 GiB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer denso de 27 000 millones de parámetros, diseñado como un modelo de visión-lenguaje (VLM) con una torre de visión de aproximadamente 333 tensores. Sin embargo, esta conversión GGUF extrae únicamente la configuración de texto (`text_config`) y descarta por completo los tensores de visión, por lo que el archivo resultante contiene exclusivamente pesos de lenguaje. No se ha realizado ninguna modificación estructural adicional: la capa MTP (Multi-Token Prediction) que incluye el modelo original se conserva intacta como un bloque transformer adicional (`blk.64`), lo que permite activar decodificación especulativa nativa mediante `--spec-type draft-mtp` sin necesidad de injertos de cabecera.

Los detalles del entrenamiento original (número de tokens, composición del dataset, métodos de alineación como RLHF o DPO) no se proporcionan en la información disponible. La cuantización se realizó con el pipeline iMatrix del autor, utilizando un conjunto de calibración de 802 fragmentos (`calibration_datav5.txt`), sin sobreescrituras por tensor. La calibración iMatrix selecciona los umbrales de cuantización basándose en la importancia de cada tensor, y en modelos densos el preset estándar de K-quants ya protege adecuadamente las capas iniciales y finales.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.8-27B.
- Razonamiento de múltiples pasos y ejecución de tareas agénticas de largo horizonte, según la descripción del modelo base.
- Decodificación especulativa nativa mediante la capa MTP integrada, activable con `--spec-type draft-mtp` y hasta 2 tokens de borrador (`--spec-draft-n-max 2`).
- Soporte de contexto largo: hasta 262 144 tokens nativos, aunque la variante Q3_K_M en hardware de 16 GB requiere reducir el contexto a 60 000 para mantener todo el modelo en VRAM.
- Capacidades multilingües: no especificadas en la información disponible.
- Capacidades de visión: no disponibles en esta versión GGUF (el modelo original sí es multimodal, pero esta conversión es solo texto).

## Casos de uso

- Asistencia de programación en local: el modelo puede ejecutarse en una estación de trabajo con GPU de 16 GB (por ejemplo, RTX 5060 Ti) a 45 tokens por segundo en la variante Q3_K_M, lo que permite autocompletado y generación de código en tiempo real sin depender de servicios en la nube.
- Despliegue de chatbots con contexto largo en hardware modesto: la variante Q4_K_M mantiene los 128 000 tokens de contexto completo (aunque con 34 capas en CPU), útil para aplicaciones que necesiten analizar documentos extensos o mantener conversaciones de muchas vueltas.
- Prototipado de agentes con decodificación especulativa: la capa MTP nativa reduce la latencia percibida en tareas de razonamiento multi-paso, lo que facilita experimentar con flujos agénticos en un portátil o PC de escritorio.
- Inferencia privada y sin conexión: al ser un archivo GGUF con licencia Apache 2.0, puede integrarse en aplicaciones que requieran procesamiento local de datos sensibles sin enviar información a terceros.
- Evaluación de modelos cuantizados para entornos de producción: la comparación entre Q3_K_M y Q4_K_M permite medir el equilibrio entre calidad y velocidad en función del hardware disponible.
- Servidor de inferencia compatible con OpenAI: usando `llama-server` con `--jinja`, se puede exponer un endpoint HTTP compatible con la API de OpenAI para integrarlo en herramientas existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor solo proporciona datos de velocidad de generación medidos en un sistema concreto:

| Variante | Velocidad de generación | Offload a CPU | Contexto máximo |
|---|---|---|---|
| Q3_K_M (todo en GPU) | ~45 tok/s | Ninguno | 60 000 |
| Q4_K_M | ~10 tok/s | 34 de 64 capas | 128 000 |

Estas mediciones se realizaron en una NVIDIA GeForce RTX 5060 Ti de 16 GB, AMD Ryzen 9 5950X (16 núcleos) y 64 GB de RAM, con la bifurcación `TheTom/llama-cpp-turboquant` (commit `c26cbdffc`). No se proporcionan resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante Q3_K_M ocupa 12,57 GiB y cabe completa en una GPU de 16 GB; la variante Q4_K_M ocupa 15,66 GiB y no cabe en 16 GB sin descargar capas a CPU.
- GPU recomendadas: cualquier GPU NVIDIA con 16 GB de VRAM o más (RTX 4060 Ti 16 GB, RTX 4070 Ti SUPER, RTX 4080, RTX 4090, A100, etc.). En GPUs con menos de 16 GB, la variante Q3_K_M podría caber si se reduce el contexto, pero no se han probado configuraciones inferiores.
- CPU: se recomienda un procesador con al menos 16 hilos para manejar el offload de la variante Q4_K_M.
- RAM del sistema: se recomiendan 64 GB para la variante Q4_K_M con contexto completo; 32 GB podrían ser suficientes para Q3_K_M con contexto reducido.
- Opciones de despliegue: llama.cpp (llama-server), compatible con la bifurcación turboquant para caché KV cuantizada (`--cache-type-k turbo3 --cache-type-v turbo3`). También puede usarse con otros frontends basados en llama.cpp como Ollama, aunque no se ha verificado.
- Latencia y throughput: 45 tok/s (Q3_K_M, todo en GPU) y 10 tok/s (Q4_K_M, con offload) en el hardware de prueba.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base Qwen3.8-27B pertenece a la familia Qwen3.8, que según la descripción oficial es la generación más capaz de la serie abierta de Qwen, con mejoras en codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. Sin embargo, no se aportan comparaciones numéricas con Qwen3.5, Qwen3.6 u otros modelos de tamaño similar. Se puede considerar que compite con otros modelos densos de ~27B como Qwen2.5-32B o Llama-3.1-8B, pero no hay datos fiables en esta documentación para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Esta versión GGUF es exclusivamente de texto: no procesa imágenes ni vídeo, a diferencia del modelo base Qwen3.8-27B que sí es multimodal.
- La variante Q3_K_M, a pesar de su alta velocidad, presenta una cuantización más agresiva (3,95 BPW) que puede degradar la calidad de generación en tareas que requieran precisión numérica o razonamiento complejo.
- La variante Q4_K_M con contexto completo (128 000 tokens) requiere descargar 34 de 64 capas a CPU, lo que multiplica por 4 la latencia y depende del ancho de banda de PCIe.
- No se han publicado resultados de benchmarks de calidad, por lo que el impacto real de la cuantización en tareas específicas es desconocido.
- El contexto máximo de 262 144 tokens es teórico; en la práctica, la memoria de la GPU limita el contexto utilizable según la cuantización y el tamaño de la caché KV.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B original, ya que la licencia de este repositorio podría no reflejar restricciones adicionales del modelo upstream.
- El autor advierte que la decodificación especulativa con MTP requiere la bifurcación `TheTom/llama-cpp-turboquant`; el uso con llama.cpp estándar podría no soportar esta funcionalidad.
- No se especifican idiomas soportados, por lo que el rendimiento en idiomas distintos del inglés o el chino no está garantizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/offmonreal/Qwen3.8-27B-MaxQuality-iMatrix-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Bifurcación de llama.cpp utilizada para las pruebas: https://github.com/TheTom/llama-cpp-turboquant
- Página del modelo Qwen3.8-27B en Qwen Cloud (próximamente): https://www.qwencloud.com/models/qwen3.8-27b
