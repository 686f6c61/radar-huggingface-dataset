# 123jagjot/nova-sft2a-v1-gguf

## Resumen

Nova (SFT-2a v1) es un ajuste fino supervisado del modelo base Qwen3.5-2B, desarrollado por el usuario 123jagjot y publicado en Hugging Face. El modelo está especializado en conversaciones de atención al cliente con capacidad de invocación de herramientas (tool calling), entrenado sobre un conjunto sintético de diálogos de soporte para una tienda online ficticia llamada NimbusCart. Esta ficha cubre la variante GGUF cuantizada en q4_k_m, pensada para ejecución local con llama.cpp en portátiles y CPU.

El modelo parte de Qwen3.5-2B, un transformer de aproximadamente 1.880 millones de parámetros, y hereda su ventana de contexto, aunque la model card recomienda ejecutarlo con 8192 tokens en la configuración de llama-server. La relevancia de esta publicación radica en su enfoque práctico: un modelo pequeño, con licencia Apache-2.0, orientado a un caso de uso concreto (soporte con herramientas) y distribuido en formato GGUF de 1,3 GB, lo que permite desplegarlo en hardware de consumo sin GPU dedicada.

La model card es explícita sobre el proceso de conversión (llama.cpp commit 5917b39, conversión a bf16 y posterior cuantización q4_k_m) y sobre una limitación operativa importante: es necesario desactivar el modo de razonamiento (`--reasoning off`) porque el modelo no fue entrenado para pensar y, de lo contrario, genera párrafos de razonamiento no deseados al inicio de cada respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B); detalles específicos de atención no disponibles |
| Parametros totales | 1.881.825.088 (≈1,88 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; la configuración de ejemplo usa 8192 tokens (`-c 8192`) |
| Tipos de cuantizacion | GGUF q4_k_m (4 bits); también existe una variante bf16 GGUF mencionada en la model card |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base y la variante de servicio usan otros formatos no detallados |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del transformer Qwen3.5-2B, con los pesos del fine-tune fusionados en el modelo base. La model card no detalla la arquitectura interna más allá de indicar el modelo base; no se especifican mecanismos de atención, positional encoding ni innovaciones técnicas concretas de la arquitectura subyacente. La variante publicada es una conversión a GGUF: primero a bf16 mediante `convert_hf_to_gguf.py` y después cuantizada a q4_k_m con `llama-quantize`, usando el commit 5917b39 de llama.cpp.

El entrenamiento se realizó sobre conversaciones de soporte con uso de herramientas para la tienda ficticia NimbusCart. Los datos son completamente sintéticos: clientes, pedidos y páginas de ayuda son inventados, y las conversaciones fueron generadas por un profesor Qwen3.5-27B de pesos abiertos (Apache-2.0) contra las herramientas reales de la tienda, y posteriormente filtradas mediante comprobaciones de código. Aproximadamente el 5% del conjunto son respuestas de atención al cliente de Bitext reescritas (licencia CDLA-Sharing-1.0). No se incluyen datos de personas reales. La model card no indica el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional orientada a atención al cliente.
- Invocación de herramientas (tool calling / function calling), entrenada explícitamente para ello en el contexto de la tienda NimbusCart.
- Diálogo multi-turno de soporte: consultas sobre clientes, pedidos y páginas de ayuda.
- Ejecución local offline mediante llama.cpp.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Modo de razonamiento: no soportado de forma nativa; debe desactivarse explícitamente con `--reasoning off`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Atención al cliente automatizada para comercio electrónico: el modelo está entrenado específicamente para gestionar conversaciones de soporte con acceso a herramientas de clientes, pedidos y ayuda, por lo que puede resolver consultas de estado de pedido o incidencias invocando las funciones adecuadas.
- Asistente de soporte en local para portátiles: al ser un GGUF q4_k_m de 1,3 GB, se puede ejecutar en un portátil sin GPU dedicada mediante llama.cpp, útil para demos, prototipos o entornos con requisitos de privacidad.
- Pruebas de integración de tool calling: sirve como modelo de referencia pequeño para validar pipelines de function calling antes de escalar a modelos mayores.
- Chatbot embebido en aplicaciones de escritorio o de borde: su tamaño reducido permite integrarlo en aplicaciones locales con recursos limitados.
- Generación de respuestas de soporte con contexto de hasta 8192 tokens: adecuado para conversaciones multi-turno con historial moderadamente largo en la configuración recomendada.
- Evaluación comparativa de cuantización: la model card ofrece datos de una prueba de humo (27/30 en q4_k_m frente a 29/30 en bf16), lo que lo hace útil para estudiar el impacto de la cuantización de 4 bits en tareas de soporte.

## Benchmarks y rendimiento

La model card solo reporta una prueba de humo interna de 30 casos, ejecutada en Apple Silicon con llama.cpp 1.0.0. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Prueba | Resultado |
|---|---|
| Smoke set de 30 casos, GGUF q4_k_m (llama.cpp, Apple Silicon) | 27/30 |
| Smoke set de 30 casos, GGUF bf16 (misma máquina y vLLM) | 29/30 |

Según el autor, el paso a 4 bits cuesta aproximadamente dos casos de cada treinta.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo q4_k_m ocupa 1,3 GB, por lo que la huella de memoria es baja; no se proporcionan cifras exactas de VRAM en la model card.
- GPU recomendadas: no especificadas. El autor indica que esta variante GGUF está pensada para portátiles y CPU; para servicio en producción el proyecto usa el modelo fusionado de 16 bits en FP8 sobre vLLM.
- GPU de consumo: por tamaño (1,3 GB en q4_k_m), cabe holgadamente en GPUs de consumo, aunque no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja --reasoning off -c 8192 -ngl 99`); vLLM para la variante de 16 bits en FP8.
- Latencia y throughput: no disponibles; solo se menciona la prueba en Apple Silicon con llama.cpp 1.0.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nova SFT-2a v1 (este modelo) | ≈1,88 B | No especificado (ejemplo con 8192) | Apache-2.0 | GGUF q4_k_m | Fine-tune de soporte con tool calling; 27/30 en smoke set interno |
| Qwen3.5-2B (modelo base) | ≈1,88 B | No disponible en esta ficha | No disponible en esta ficha | No disponible | Base sin el fine-tune de soporte; no se han comparado resultados en la información disponible |
| Qwen3.5-27B (profesor) | 27 B (según la model card) | No disponible | Apache-2.0 | No disponible | Usado para generar los datos de entrenamiento; no es un sustituto directo por tamaño |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo fue entrenado sobre datos sintéticos de una tienda ficticia (NimbusCart); su comportamiento en dominios reales o con herramientas distintas no está validado.
- Requiere desactivar el razonamiento (`--reasoning off`); con la plantilla de chat por defecto de llama.cpp genera párrafos de razonamiento no deseados porque no fue entrenado para ello.
- La cuantización q4_k_m degrada ligeramente el rendimiento: 27/30 frente a 29/30 en bf16 en la prueba interna del autor.
- No se especifican los idiomas soportados; el entrenamiento se describe en inglés (Bitext, conversaciones sintéticas), por lo que el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente a un modelo de 1,88 B; no se han publicado evaluaciones de sesgo o robustez.
- La licencia Apache-2.0 permite uso comercial, pero el 5% del dataset procede de Bitext bajo CDLA-Sharing-1.0; conviene revisar las condiciones de esa licencia para usos derivados.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- No se han publicado resultados de benchmarks estándar; la única evidencia de rendimiento es una prueba de humo de 30 casos del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/123jagjot/nova-sft2a-v1-gguf
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp (herramienta de conversión y cuantización): https://github.com/ggml-org/llama.cpp
