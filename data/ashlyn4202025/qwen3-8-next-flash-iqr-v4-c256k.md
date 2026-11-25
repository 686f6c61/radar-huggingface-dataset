# Ashlyn4202025/qwen3.8-next-flash-iqr-v4-c256k

## Resumen

Qwen3.8-Next-Flash-IQR-V4-C256K es una cuantización de 4 y 5 bits del modelo multimodal Qwen3.8-Flash-Next de Alibaba Qwen, recalibrada sobre documentos completos a una longitud de contexto de 262.144 tokens. El artefacto lo publica el usuario Ashlyn4202025 en Hugging Face y deriva del trabajo previo de StillDeadcode (qwen3.8-next-flash-iqr-v4), del que reutiliza receta, tamaño y disposición de pesos. El resultado es un contenedor de 113,3 GiB en formato propietario `.rad` para el motor radiance 2.2.0, orientado a GPUs AMD con arquitectura RDNA4 y stack ROCm.

El modelo resuelve un problema concreto: servir un modelo MoE multimodal de gran contexto en hardware de consumo profesional AMD sin perder apenas fidelidad respecto al checkpoint bf16 original. La recalibración con 10,26 millones de tokens leídos íntegros (documentos de hasta 253K tokens) reduce la divergencia KL media un 4,6% respecto a la versión anterior, con mejoras del 5 al 13% en las bandas de contexto entre 4K y 131K tokens.

Es relevante ahora porque combina tres piezas poco habituales en el ecosistema abierto: cuantización mixta int8/E4M3/4-5 bits con calibración por documento completo, decodificación especulativa mediante cabeza MTP integrada y un formato de despliegue específico para AMD. No obstante, el modelo apenas tiene tracción (0 descargas, 0 likes) y su licencia, qwen-community-1.0, impone restricciones que conviene revisar antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con capas de atención, delta net y torre de visión; cabeza MTP para decodificación especulativa (según tags y descripción de la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (entrenamiento y calibración); configuración de servicio con `max-model-len: 200000` |
| Tipos de cuantización | Mixta: int8 y E4M3 redondeados a nearest, más códigos de 4 y 5 bits en pesos calibrados (GPTQ-like con codebooks y trellis); KV cache en int8 (`kv-cache-dtype: i8`) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance 2.2.0); 121.678.372.864 bytes, 113,3 GiB, 227.111 planos |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos (MoE) que incorpora capas de atención clásica, capas de delta net y una torre de visión, lo que habilita el pipeline `image-text-to-text`. La model card menciona 48 bloques principales (capas 0 a 47) más un bloque 48 adicional que corresponde a la cabeza MTP (multi-token prediction), utilizada como especulador para decodificación especulativa. Los pesos calibrados incluyen las proyecciones gate_up y down de los expertos enrutados, la query-gate de atención y la proyección de entrada de la delta net.

La contribución específica de esta ficha es la recalibración de la cuantización. El autor partió del checkpoint bf16 y aplicó la misma receta que la versión original (`qwen4exp-iqr-v4.recipe`), pero con nuevas estadísticas de calibración: 4.789 documentos y 10.259.331 tokens de texto, código, chat y trazas de agente, leídos completos al contexto de 262.144 tokens y sin truncar. Aproximadamente 56 GiB del archivo son idénticos al original (pesos int8 y E4M3, copias bf16 de la torre de visión y expertos protegidos, escalas, codebooks y tablas trellis); los 57 GiB restantes corresponden a 49.180 planos de códigos de 4 y 5 bits recalibrados. No se especifican datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de hasta 262.144 tokens, verificado en servicio con hechos plantados a 10K y 77K tokens de un prompt de 151K.
- Procesamiento de imagen y texto (`image-text-to-text`), gracias a la torre de visión preservada en bf16.
- Tool calling y function calling: la model card reporta una prueba de llamada a herramienta correcta en el despliegue de referencia.
- Razonamiento de agente multi-paso: el conjunto de calibración incluye trazas de agente, y las posiciones escritas por el modelo (pensamiento, llamadas a herramientas y respuestas) se evalúan por separado.
- Decodificación especulativa mediante cabeza MTP integrada, con el bloque del especulador cuantizado sin estadísticas de calibración.
- Generación de código: los documentos de texto plano y código representan 721.357 posiciones en el conjunto de evaluación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia sobre documentación extensa: el modelo puede ingerir contratos, informes o repositorios completos de hasta 200K tokens en servicio y responder preguntas que requieren localizar información en cualquier punto del contexto, como demuestra la prueba de recuperación de hechos a 77K tokens.
- Agentes autónomos con tool calling: la combinación de function calling verificado, razonamiento multi-paso y contexto largo permite construir agentes que mantienen el estado de la tarea y consultan herramientas externas sin perder el hilo de la conversación.
- Análisis de imágenes con contexto textual: la torre de visión permite procesar capturas, diagramas o documentos escaneados junto a instrucciones largas, útil en pipelines de extracción de datos.
- Generación y revisión de código en producción: con soporte de tool calling y contexto suficiente para incluir varios archivos, puede integrarse en flujos de revisión de PR o generación de tests, aunque la licencia debe validarse antes.
- Despliegue en hardware AMD de gama profesional: el formato `.rad` y el motor radiance están optimizados para ROCm y RDNA4, lo que lo hace adecuado para entornos con Radeon AI PRO R9700 donde no se dispone de GPUs NVIDIA.
- Investigación en cuantización: el artefacto documenta con detalle las diferencias plano a plano y las métricas de divergencia KL, lo que lo convierte en un caso de estudio reproducible para evaluar técnicas de calibración por documento completo.
- Servicio de chat con KV cache en int8: la configuración de referencia con `max-num-seqs: 8` y `kv-cache-dtype: i8` permite atender varias conversaciones concurrentes en dos GPUs con 12 GiB de pool en host para expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas de fidelidad de cuantización frente al modelo bf16, medidas con radiance 2.2.0 sobre el split de test público del dataset de calibración (596 documentos, 1.694.025 posiciones, KV cache bf16 a 262.144 tokens):

| Métrica | Original | Este archivo | Cambio |
|---|---|---|---|
| KL media, todas las posiciones | 0,1739 | 0,1660 | -4,6% (IC 95%: -7,4% a -3,1%) |
| Concordancia top-1, todas las posiciones | 89,07% | 89,32% | no disponible |
| KL media, posiciones escritas por el modelo (446.293) | 0,0227 | 0,0220 | -3,0% |
| Concordancia top-1, posiciones escritas por el modelo | 95,65% | 95,74% | no disponible |
| KL media, texto plano y código (721.357 posiciones) | 0,0168 | 0,0162 | -3,7% |

Desglose por profundidad en el contexto sobre posiciones escritas por el modelo:

| Posición en tokens | Documentos | Posiciones | Original | Este archivo | Cambio |
|---|---|---|---|---|---|
| 0 a 4.096 | 125 | 70.020 | 0,0129 | 0,0170 | +31,5% (IC: -11% a +91%) |
| 4.096 a 16.384 | 21 | 54.429 | 0,0073 | 0,0063 | -13% (IC: -20% a -7%) |
| 16.384 a 56.000 | 8 | 52.031 | 0,0152 | 0,0138 | -9% (IC: -12% a -7%) |
| 56.000 a 131.072 | 4 | 101.215 | 0,0290 | 0,0271 | -6,4% |
| Más de 131.072 | 2 | 168.598 | 0,0301 | 0,0285 | -5,3% |

El empeoramiento de la primera banda se atribuye casi por completo a una única conversación de WildChat (de 20,8 a 243,9 nats sumados); la mediana de la banda mejora un 1,6% y 63 de sus 125 documentos son mejores.

## Requisitos de hardware

- El archivo pesa 113,3 GiB, por lo que no cabe en una GPU de consumo de 24 GB ni en una de 32 GB; requiere al menos dos GPUs profesionales o un pool en host para expertos.
- Configuración de referencia verificada: 2x Radeon AI PRO R9700 con `tp: 2`, `tp-wire: wht6`, `placement: expert_tiered` y `host-pool-mib: 12288` (12 GiB de RAM del sistema reservados para expertos).
- VRAM estimada: no disponible de forma explícita; el despliegue de referencia usa dos GPUs RDNA4 con 96 MiB de headroom configurado (`gpu-headroom-mib: 96`).
- GPUs recomendadas: Radeon AI PRO R9700 (RDNA4) con ROCm; el motor radiance 2.2.0 está orientado a AMD y no se documenta soporte para NVIDIA.
- No cabe en GPUs de consumo tipo RTX 4090, RTX 3090 o Radeon RX 7900 XTX por tamaño del contenedor.
- Opciones de despliegue: exclusivamente el motor radiance 2.2.0 (`stilldeadcode/radiance:2.2.0`) con el formato `.rad`; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Throughput y latencia: no disponibles; la model card indica que no se volvieron a medir las velocidades y que las cifras del original siguen aplicando, pero no se incluyen en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Next-Flash-IQR-V4-C256K (este) | no disponible | 262.144 | Mixta 4/5 bits + int8/E4M3 | qwen-community-1.0 | Hugging Face, formato `.rad` |
| Qwen3.8-Next-Flash-IQR-V4 (original) | no disponible | 262.144 | Mixta 4/5 bits + int8/E4M3 | qwen-community-1.0 | Hugging Face, formato `.rad` |
| Qwen3.8-Flash-Next (base bf16) | no disponible | 262.144 | bf16 | qwen-community-1.0 | Hugging Face |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada. Frente al original, este archivo mejora la KL media un 4,6% a igualdad de tamaño y disposición; frente al bf16, mantiene una concordancia top-1 del 89,32% en todas las posiciones y del 95,74% en las posiciones que genera el modelo.

## Limitaciones y advertencias

- La evaluación mide predicción de siguiente token sobre texto fijo; fallos que solo aparecen en generación libre a contexto largo no quedarían reflejados.
- Solo cuatro documentos superan los 56K tokens y dos superan los 131K, por lo que las bandas profundas tienen poca muestra.
- El split de calibración y el de test provienen del mismo dataset, lo que favorece a este archivo frente al original, cuya calibración no compartía esa mezcla de fuentes.
- La comparación no puede atribuir la mejora a una sola causa: difieren el corpus de calibración, el contexto de lectura y una corrección en el tap de calibración.
- La primera banda de contexto (0 a 4.096 tokens) empeora un 31,5% en media, dominada por una única conversación; el intervalo de confianza es muy amplio (-11% a +91%).
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al ser un modelo base de Qwen, cabe esperar los sesgos habituales de sus datos de entrenamiento, pero no hay datos específicos.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia qwen-community-1.0: es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; la etiqueta `other` en Hugging Face indica condiciones no estándar.
- Dependencia total del motor radiance 2.2.0 y del hardware AMD RDNA4; no hay portabilidad documentada a otros stacks de inferencia.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (25 de noviembre de 2026), por lo que no hay validación comunitaria independiente.
- El tamaño de 113,3 GiB y la necesidad de dos GPUs profesionales limitan su uso a entornos con infraestructura específica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ashlyn4202025/qwen3.8-next-flash-iqr-v4-c256k
- Modelo original cuantizado: https://huggingface.co/StillDeadcode/qwen3.8-next-flash-iqr-v4
- Dataset de calibración (split de calibración del Qwen3.8-27B quant challenge): https://huggingface.co/datasets/StillDeadcode/qwen3.8-27b-quant-challenge
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor de inferencia radiance 2.2.0: `stilldeadcode/radiance:2.2.0` (imagen de contenedor; no se proporciona URL directa en la información disponible)
