# Dsturb/Qwen3.8-Flash-Next-FLARE-Abliterated-YaRN-512k

## Resumen

Dsturb/Qwen3.8-Flash-Next-FLARE-Abliterated-YaRN-512k es un paquete de inferencia en formato Flare derivado de Qwen3.8-Flash-Next, un modelo multimodal de tipo image-text-to-text. Lo publica el usuario Dsturb como exportación independiente del checkpoint abliterado de lflare, que a su vez parte del contenedor cuantizado NVFP4/MXFP8 de Local Inference Lab. La modificación principal respecto al paquete de referencia es la extensión de contexto mediante YaRN con factor 2, que duplica la ventana de 262.144 a 524.288 tokens por petición.

El modelo está pensado para ejecutarse en una única GPU de centro de datos: una RTX PRO 6000 Blackwell de 96 GB (arquitectura gb202), con tensor parallel 1 y concurrencia de 8 peticiones. No es un modelo para Transformers, vLLM, SGLang ni llama.cpp: el formato de pesos y el runtime son propietarios del ecosistema Flare de Local Inference Lab, lo que condiciona por completo su despliegue.

La relevancia del paquete es doble. Por un lado, demuestra que es posible servir contextos de medio millón de tokens con decodificación especulativa MTP y un KV cache de 1.318.912 tokens en una sola tarjeta. Por otro, incorpora una edición de rechazo reducido (abliteration) de rango 2 sobre la capa 42, con métricas que muestran una caída del 100 % al 0 % en respuestas de rechazo sobre un conjunto de 136 prompts dañinos. Esa característica, junto con la licencia propia y la firma con clave de desarrollo, exige una evaluación de riesgos antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.8-Flash-Next; pesos cuantizados NVFP4/MXFP8; runtime Flare con decodificación especulativa MTP |
| Parametros totales | 15.074.064 (según safetensors); el repo ocupa 106,7 GB, lo que indica pesos cuantizados de un modelo de mayor escala |
| Parametros activos | no disponible (no se confirma si la arquitectura es MoE; el flag `--force-moe-decode-a16` sugiere componentes MoE) |
| Longitud de contexto | 524.288 tokens por petición (YaRN factor 2 sobre 262.144); KV cache reportado de 1.318.912 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (checkpoint base NVFP4-MXFP8-CSF-QAD); torre de visión cuantizada con 499 tensores |
| Idiomas soportados | no disponible |
| Licencia | lil-license-1.0 (Local Inference Lab License, Version 1.0); etiquetada como `license: other` |
| Formato de pesos | safetensors dentro de un paquete Flare en forma de directorio (56 archivos, 106.725.635.340 bytes); no compatible con Transformers, vLLM, SGLang ni llama.cpp |

## Arquitectura y entrenamiento

El paquete es una exportación de inferencia, no un entrenamiento nuevo. Los pesos de texto provienen del checkpoint abliterado de lflare (`lflare/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated@8d96cc1d`), que aplica una edición de rechazo de rango 2 sobre la capa 42 en dos regímenes (con y sin modo thinking). Esa edición se realizó sobre el contenedor cuantizado de Local Inference Lab, derivado a su vez de Qwen3.8-Flash-Next. La torre de visión se mantiene en el checkpoint abliterado en BF16, pero el exportador Ignition exige cuantización, por lo que los 499 tensores de visión se tomaron byte a byte del contenedor de Local Inference Lab; los pesos de texto no se modificaron.

La innovación técnica del paquete es la extensión de contexto: mediante `--rope-parameters` de Ignition (pull request #212) se aplica YaRN con factor 2, lo que duplica la ventana efectiva a 524.288 tokens. Para liberar espacio de KV cache, la concurrencia baja de 16 a 8 peticiones y se activa `--force-moe-decode-a16` en el export. El paquete se generó el 8 de noviembre de 2026 en una sola GPU en unos 45 minutos, sobre el árbol de Flare main `0de3041c` más el PR #212 `15d8b0b0`. No se fijaron ni modificaron parámetros de muestreo: se usan los valores por defecto que derivó Ignition. La decodificación especulativa usa 5 tokens borrador MTP.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline declarado es image-text-to-text, por lo que acepta imágenes y texto como entrada.
- Modo thinking con presupuesto de tokens configurable (las mediciones usan 100 y 2048 tokens de pensamiento).
- Contexto largo extremo: 524.288 tokens por petición, con recuperación verificada de información en medio de un prompt de 446.870 tokens.
- Decodificación especulativa MTP con 5 tokens borrador, integrada en el runtime Flare.
- Concurrencia de 8 peticiones simultáneas con KV cache agregado de 1.318.912 tokens.
- Comportamiento de rechazo reducido: 0/136 rechazos en el conjunto dañino con thinking desactivado, y 0/59 en el conjunto de sobre-rechazo.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara lista de idiomas.

## Casos de uso

- Análisis de repositorios completos: con 524.288 tokens de contexto se puede cargar un árbol de código extenso, documentación y trazas de ejecución en una sola petición para tareas de revisión o refactorización asistida. El throughput de prefill medido (11.629 tok/s a 128k) hace viable procesar prompts de cientos de miles de tokens en menos de un minuto.
- Auditoría de contratos y documentación legal: la ventana ampliada permite introducir expedientes completos con anexos y comparar cláusulas sin troceado, lo que reduce la pérdida de contexto entre fragmentos.
- Procesamiento de conversaciones de soporte de larga duración: con 8 peticiones concurrentes y 223 tok/s en decodificación a contexto cero, un despliegue en una sola RTX PRO 6000 puede atender sesiones multi-turno extensas manteniendo el historial completo en contexto.
- Extracción de información en documentos escaneados con componentes visuales: la torre de visión cuantizada permite procesar páginas con tablas, gráficos y texto mixto, útil en pipelines de digitalización de archivos.
- Evaluación de seguridad y red teaming: el comportamiento de rechazo reducido lo convierte en una herramienta para estudiar la eficacia de las defensas de modelos alineados, siempre en entornos controlados y con las salvaguardas externas adecuadas.
- Investigación sobre contextos largos: sirve como banco de pruebas para medir degradación de atención, recuperación de agujas en el pajar y coste de KV cache en escenarios de 512k tokens sobre hardware de una sola GPU.
- Generación asistida en entornos con requisitos de soberanía de datos: al ejecutarse en local sobre una única tarjeta, permite mantener los datos dentro de la infraestructura propia, sin depender de APIs externas.

## Benchmarks y rendimiento

Rendimiento medido por el autor del paquete en una RTX PRO 6000 Blackwell a 300 W con lil-bench 1.7.1 (perfil estándar, aislado):

| Fase | 0 contexto | 64k | 128k |
|---|---:|---:|---:|
| Decodificación C1 (tok/s) | 223,0 | 217,0 | 204,3 |
| Decodificación C8 agregada (tok/s) | 791,5 | 758,4 | 736,4 |

Prefill: 11.745 tok/s a 32k y 11.629 tok/s a 128k. En contexto largo, un prompt de 446.870 tokens con una aguja en el medio se respondió correctamente en 43,5 s.

Métricas de rechazo y capacidad (medidas por lflare sobre los mismos pesos de texto, no re-ejecutadas en este paquete):

| Protocolo | Scorer | Padre | Edición |
|---|---|---|---|
| Thinking off, 100 tok | model-forge | 136/136 (100 %) | 0/136 (0 %) |
| Thinking off | strict, 47 marcadores | 136/136 (100 %) | 0/136 (0 %) |
| Thinking on, 2048 tok | model-forge | 115/136 (84,6 %) | 0/136 (0 %) |
| Thinking on | strict, marcadores emparejados | — | 2/136 (1,5 %) |
| Thinking off | sobre-rechazo | 2/59 (3,4 %) | 0/59 (0 %) |

Capacidad en la misma sesión: `lavd` 30/30 frente a 30/30 del padre; `estonia` 30/30 frente a 30/30; GPQA-diamond emparejado 166/198 frente a 164/198 (no significativo, p = 0,85). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM: una RTX PRO 6000 Blackwell de 96 GB es el mínimo declarado; el paquete ocupa 106,7 GB en disco y el runtime necesita espacio adicional para el KV cache de 1.318.912 tokens.
- GPU recomendadas: RTX PRO 6000 Blackwell (gb202) con TP1. No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU de consumo; el requisito de 96 GB de VRAM y el runtime Flare lo impiden.
- Despliegue: exclusivamente mediante el contenedor `ghcr.io/local-inference-lab/flare:latest`, con montaje del paquete en `/pkg` y del estado en `/state`, y verificación de pesos con `--verify-weights`.
- Latencia y throughput: 223 tok/s en decodificación individual a contexto cero, 791,5 tok/s agregados con 8 peticiones concurrentes, y prefill de 11.745 tok/s a 32k. Una consulta de 446.870 tokens se resolvió en 43,5 s.
- Nota de seguridad operativa: el paquete está firmado con una clave de desarrollo (fingerprint `7ab239ec…e9e824`) y el arranque requiere `--dangerously-accept-publisher local-development` y `--dangerously-approve-key`, lo que desactiva parte de la cadena de confianza del runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dsturb/Qwen3.8-Flash-Next-FLARE-Abliterated-YaRN-512k | 15.074.064 (safetensors); repo de 106,7 GB | 524.288 | 223 tok/s C1, 791,5 tok/s C8, prefill 11.745 tok/s a 32k | lil-license-1.0 | Solo runtime Flare, 1× RTX PRO 6000 96 GB |
| lflare/Qwen3.8-Flash-Next-FLARE-Abliterated | mismos pesos de texto | 262.144 (sin YaRN) | no disponible en esta ficha | lil-license-1.0 | Solo runtime Flare |
| local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD | contenedor cuantizado base | no disponible | no disponible | Local Inference Lab License 1.0 | Solo runtime Flare |
| lflare/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated | checkpoint abliterado de referencia | no disponible | GPQA-diamond 166/198, lavd 30/30, estonia 30/30 | lil-license-1.0 | Pesos en safetensors, runtime Flare |

No se dispone de datos de benchmarks comparables con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Rechazo reducido deliberado: la edición abliterada elimina prácticamente todos los rechazos ante prompts dañinos (0/136 con thinking off). No es adecuado para aplicaciones orientadas al público sin salvaguardas externas.
- Licencia restrictiva: lil-license-1.0 se etiqueta como `license: other`; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones no están detalladas en la información disponible.
- Compatibilidad limitada: no funciona en Transformers, vLLM, SGLang ni llama.cpp. El `config.json` incluido es un ancla de estadísticas de descarga sin `model_type`, por lo que `AutoConfig.from_pretrained` fallará por diseño.
- Cadena de confianza debilitada: el paquete está firmado con una clave de desarrollo y el arranque exige aceptar el publisher `local-development` y aprobar la clave manualmente, lo que reduce las garantías de integridad en producción.
- Dependencia de hardware exótico: requiere una RTX PRO 6000 Blackwell de 96 GB; no hay soporte documentado para otras GPU, lo que limita la portabilidad y aumenta el coste de infraestructura.
- Idiomas no declarados: el autor no publica lista de idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- Riesgo de alucinación: no cuantificado en la información disponible; las métricas publicadas se centran en rechazo y en pruebas de capacidad acotadas (lavd, estonia, GPQA-diamond), no en fidelidad factual general.
- Métricas de capacidad no replicadas: los resultados de rechazo y capacidad son de lflare sobre el checkpoint plano, no de este paquete; el autor no los re-ejecutó tras la extensión YaRN.
- Concurrencia reducida: el contexto de 512k obliga a bajar de 16 a 8 peticiones simultáneas, lo que afecta al coste por petición en cargas de alta concurrencia.
- Torre de visión cuantizada tomada de otro contenedor: los 499 tensores de visión no provienen del checkpoint abliterado sino del contenedor de Local Inference Lab, una discrepancia documentada pero que conviene verificar en despliegues sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dsturb/Qwen3.8-Flash-Next-FLARE-Abliterated-YaRN-512k
- Modelo base abliterado (lflare): https://huggingface.co/lflare/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated
- Paquete de referencia de lflare: https://huggingface.co/lflare/Qwen3.8-Flash-Next-FLARE-Abliterated
- Contenedor cuantizado de Local Inference Lab: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD
- Checkpoint abliterado plano (mediciones originales): https://huggingface.co/lflare/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated
- Runtime Flare (contenedor): ghcr.io/local-inference-lab/flare:latest
- Pull request #212 de Ignition (parámetros RoPE/YaRN): no disponible como URL en la información proporcionada
- Paper, blog o demo adicionales: no disponible en la información proporcionada
