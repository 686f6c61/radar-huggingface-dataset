# Kamciosz/qwen38-mtp-head-xkm-affine2-v1

## Resumen

Este modelo es una cabeza de propuesta (proposal head) para el sistema de decodificación multi-token (MTP) del modelo Qwen3.8-27B. Desarrollado por Kamciosz, este artefacto no es un modelo de lenguaje completo, sino un componente auxiliar que se acopla al backbone de Qwen3.8-27B para acelerar la inferencia mediante decodificación especulativa. La cabeza combina dos fuentes: los tensores de capa MTP de una destilación chain-faithful (de `xkm/qwen3.8-27b-mtp-head-retrained`) y un head de draft compacto de tipo affine-2 (de `amal-david/qwen38-mtp-head-q2-q4-rerank-v1`). El resultado es un head de 471 millones de parámetros, con licencia Apache-2.0, disponible en formato MLX/safetensors. Su relevancia radica en que permite aprovechar la capacidad MTP nativa de Qwen3.8-27B para mejorar el rendimiento de decodificación, especialmente en entornos de producción donde la latencia es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_mtp (capa MTP unica) |
| Parametros totales | 471.900.672 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (depende del backbone Qwen3.8-27B, 262K tokens) |
| Tipos de cuantizacion | no disponible (el draft head referencia cuantizacion q2-q4, pero no se especifica) |
| Idiomas soportados | no disponible (depende del backbone) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

El modelo es una cabeza MTP (Multi-Token Prediction) diseñada para el track de decodificacion nativa MTP de Qwen3.8-27B. La arquitectura sigue el esquema `qwen3_5_mtp` con una unica capa oculta MTP (`mtp_num_hidden_layers: 1`). Los 15 tensores de la capa MTP son copias byte a byte de una destilacion chain-faithful realizada sobre el head original, donde se entrena la cabeza para predecir tokens futuros de forma consistente con el argmax del modelo objetivo. El `draft_lm_head` (cabeza de draft) proviene de una version compacta de tipo affine-2 con shortlist, que reduce el espacio de vocabulario a un subconjunto reducido de candidatos. No se realizo ningun entrenamiento nuevo para esta fusion; se trata de una combinacion de pesos preexistentes, manteniendo las licencias Apache-2.0 de los modelos padre.

## Capacidades

- Decodificacion especulativa multi-token: el head propone varios tokens futuros que el modelo principal verifica en paralelo, reduciendo el numero de pasos de decodificacion.
- Compatibilidad con llama.cpp: el PR #22673 de llama.cpp (julio 2026) anade soporte para draft-mtp, permitiendo que el servidor use esta cabeza para acelerar la generacion.
- Integracion con MLX: al estar en formato MLX, puede usarse en entornos Apple Silicon.
- No es un modelo autonomo: requiere el backbone Qwen3.8-27B para funcionar.
- No soporta tool calling ni otras capacidades por si mismo; depende del modelo base.

## Casos de uso

- Aceleracion de inferencia en produccion: al reducir el numero de pasos de decodificacion, el head MTP puede aumentar el throughput de servidores que sirven Qwen3.8-27B, especialmente en cargas de trabajo con alta concurrencia.
- Reduccion de latencia en aplicaciones de chat: en asistentes conversacionales donde la respuesta en tiempo real es critica, la decodificacion especulativa puede recortar la latencia percibida.
- Despliegue en entornos con recursos limitados: al ser un head pequeno (471M), puede cargarse en GPU con poca VRAM adicional, mejorando la eficiencia sin necesidad de reemplazar el modelo principal.
- Integracion en pipelines de generacion de codigo: Qwen3.8-27B es un modelo de vision-lenguaje orientado a codificacion; el head MTP puede acelerar la generacion de codigo en IDEs o CI/CD.
- Investigacion en decodificacion especulativa: sirve como referencia para estudiar el impacto de cabezas MTP entrenadas con destilacion chain-faithful frente a otras estrategias.
- Optimizacion de costes en inferencia: al aumentar el throughput por GPU, se reduce el numero de GPUs necesarias para servir el mismo volumen de peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este head en la informacion disponible. El repositorio de `sudoingX/qwen38-mtp` menciona una mejora de +33-39% en velocidad de decodificacion con un flag de llama.cpp, pero no se detallan condiciones ni metricas exactas. Se recomienda evaluar el rendimiento en el escenario de uso concreto.

## Requisitos de hardware

- VRAM adicional estimada: al ser un head de 471M parametros, requiere aproximadamente 1 GB en BF16, o menos si se cuantiza. Sin embargo, el backbone Qwen3.8-27B requiere entre 16 GB (cuantizado) y 54 GB (BF16) segun la configuracion.
- GPU recomendadas: para el backbone, se necesitan GPUs con al menos 24 GB de VRAM (RTX 3090/4090, A10G) para cuantizacion, o 80 GB (A100/H100) para BF16. El head en si puede ejecutarse en cualquier GPU.
- Compatibilidad con consumer GPU: si, si se usa el backbone cuantizado y el head en formato GGUF.
- Opciones de despliegue: llama.cpp (con el flag de draft-mtp), MLX en Apple Silicon, o vLLM si se adapta.
- Latencia y throughput: no hay datos publicados especificos; la mejora reportada es del 33-39% en velocidad de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kamciosz/qwen38-mtp-head-xkm-affine2-v1 | 471M | depende del backbone | Apache-2.0 | Head MTP para Qwen3.8-27B |
| EigenLabs/Qwen3.8-27B-MTP-bf16 | 27B (backbone) | 262K | Apache-2.0 | Modelo base con MTP nativa |
| xkm/qwen3.8-27b-mtp-head-retrained | no disponible | no disponible | Apache-2.0 | Head MTP con destilacion chain-faithful |
| amal-david/qwen38-mtp-head-q2-q4-rerank-v1 | no disponible | no disponible | Apache-2.0 | Head MTP con shortlist affine-2 |

No se dispone de comparativas de rendimiento entre estos heads.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: solo funciona como componente de un sistema mayor. No puede usarse de forma independiente.
- Dependencia del backbone: requiere Qwen3.8-27B y la implementacion de MTP en el runtime (llama.cpp, MLX, etc.).
- Sin benchmarks publicados: no hay metricas oficiales de rendimiento para este head especifico.
- Riesgo de sobreajuste al argmax: al estar destilado contra el argmax del modelo objetivo, puede degradar la diversidad de las propuestas si el modelo principal cambia.
- Licencia Apache-2.0: permite uso comercial, pero los modelos padre tambien deben cumplir sus licencias (todas Apache-2.0).
- Sin soporte oficial: es un artefacto de la comunidad, sin garantias de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Kamciosz/qwen38-mtp-head-xkm-affine2-v1
- Modelo base: https://huggingface.co/EigenLabs/Qwen3.8-27B-MTP-bf16
- Repositorio de referencia para llama.cpp: https://github.com/sudoingX/qwen38-mtp
- PR de llama.cpp (referencia): https://github.com/ggml-org/llama.cpp/pull/22673 (no verificado)
- Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Qwen3.8 en OpenLM: https://openlm.ai/qwen3.8/
- Repositorio oficial Qwen3.8: https://github.com/QwenLM/Qwen3.8
