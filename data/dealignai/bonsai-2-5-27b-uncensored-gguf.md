# dealignai/Bonsai-2.5-27B-UNCENSORED-GGUF

## Resumen

Bonsai-2.5-27B-UNCENSORED-GGUF es una redistribución del modelo prism-ml/Ternary-Bonsai-2.5-27B-GGUF a la que se le ha aplicado una ablación de pesos a nivel de tensor para eliminar el comportamiento de rechazo (refusal). Lo publica dealignai, un autor independiente no afiliado a Prism ML ni a ggml-org, y se distribuye exclusivamente en formato GGUF para su uso con un fork específico de llama.cpp. El modelo base es un híbrido Qwen3.5-VL de 64 capas que combina GatedDeltaNet (SSM) con 16 capas de atención completa, cuantizado en formatos ternarios y de 2 bits propios de Prism.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de "abliteración" a nivel de pesos que se diferencia de los LoRA y fine-tunes habituales en el ecosistema "uncensored": se modifican únicamente 34 tensores de proyección lineal (10 `attn_output` de atención completa y 24 `ssm_out` de las capas SSM), preservando la norma de fila mediante MPOA, sin entrenamiento ni calibración. Por otro, el modelo conserva intactas las capacidades del original: visión vía `mmproj`, modo de razonamiento por turno, tool calling, plantilla de chat Qwen3.5 y un cabezal MTP v2 (Multi-Token Prediction) embebido para decodificación especulativa.

El modelo tiene 26.895.998.464 parámetros totales (unos 26,9 mil millones), se distribuye en cinco archivos GGUF de entre 600 MB y 7,3 GB, y está pensado para despliegue local en hardware de consumo. La licencia es propia (`dealignai-community-v0.3`), no estándar, y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: GatedDeltaNet (SSM) + 16 capas de atención completa, 64 capas en total; base Qwen3.5-VL |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 (~1 bit ternario empaquetado, formato propio de Prism), PQ2_0 (~2 bits empaquetado, formato propio de Prism), mmproj en Q8_0 para la torre de visión |
| Idiomas soportados | en (inglés) |
| Licencia | dealignai-community-v0.3 (licencia propia, no estándar) |
| Formato de pesos | GGUF (solo llama.cpp; requiere el fork PrismML-Eng/llama.cpp para PTQ1_0 y PQ2_0) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 64 capas que intercala capas de estado recurrente GatedDeltaNet (SSM) con 16 capas de atención completa, siguiendo el linaje Qwen3.5-VL. Incluye una torre de visión independiente que se carga mediante un archivo `mmproj` separado, y un cabezal MTP v2 (Multi-Token Prediction) embebido en los GGUF con sufijo `-mtp`, que actúa como drafter para decodificación especulativa. La plantilla de chat y el tokenizador son los de Qwen3.5.

La modificación introducida por dealignai no es un fine-tune ni un LoRA. Es una ablación en forma cerrada sobre pesos congelados: se extraen direcciones de rechazo por capa a partir de un corpus de sondas de 395 pares derivado de HarmBench, y se elimina una dirección de rango 1 de las salidas del residual stream mediante `W' = W - s·v̂·(v̂ᵀW)` con preservación de la norma de fila (MPOA). Los tensores objetivo son 34: 10 `attn_output` de atención completa y 24 `ssm_out` de capas SSM. La tasa de cambio por tensor objetivo se declara entre el 0,3 % y el 1,3 % de los códigos de cuantización. No hay descenso de gradiente, ni tokens de calibración, ni RLHF, ni pasada de SFT. La estructura del GGUF, la plantilla de chat, el tokenizador, la torre de visión y el cabezal MTP son byte-idénticos al release original de Prism.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat Qwen3.5.
- Razonamiento explícito por turno ("thinking mode"), con el bloque `` como cierre del razonamiento.
- Entrada de imágenes a través del archivo `mmproj` (torre de visión byte-idéntica al upstream).
- Tool calling / function calling, según los tags del modelo (`tool-use`).
- Capacidades de agente y razonamiento multi-paso, apoyadas en el modo de razonamiento y el soporte de herramientas.
- Decodificación especulativa mediante el cabezal MTP v2 embebido en los archivos `-mtp`, con la misma tasa de aceptación de borradores que el modelo original según el autor.
- Respuestas a instrucciones que el modelo base rechazaría, en las seis categorías de daño real de HarmBench (según la model card).
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente la diferencia entre ablación a nivel de pesos y adaptadores LoRA, comparando distribuciones de salida sobre el mismo backbone y la misma cuantización.
- Evaluación de robustez de filtros y clasificadores: sirve como contraparte "sin freno" del modelo base para medir la sensibilidad de pipelines de moderación ante variaciones mínimas de pesos (0,3–1,3 % de códigos por tensor).
- Análisis de refusal en modelos híbridos SSM/atención: al actuar solo sobre `attn_output` y `ssm_out`, permite aislar qué componente (atención completa o estado recurrente) concentra la dirección de rechazo.
- Despliegue local en hardware de consumo: el archivo PQ2_0 con MTP ocupa 7,0 GB y está pensado para decodificación rápida en Apple Silicon, lo que lo hace viable en equipos de gama alta sin GPU dedicada.
- Procesamiento de documentos con imagen en local: la torre de visión vía `mmproj` (600 MB) permite extracción y descripción de contenido visual en entornos sin conexión, con el modelo corriendo en el mismo equipo.
- Pruebas de decodificación especulativa: el par de archivos con y sin cabezal MTP permite medir el impacto del drafter en latencia y tasa de aceptación sobre un mismo tronco cuantizado a 1 y 2 bits.
- Generación de código y razonamiento técnico en pipelines internos: con tool calling y modo de razonamiento, puede integrarse en flujos de automatización donde el filtrado de contenido se gestiona en capas externas.

## Benchmarks y rendimiento

La model card incluye una sección de resultados sobre HarmBench-240 (seis categorías de daño real, razonamiento xhigh) evaluada con `llama-mtmd-cli` del fork de Prism, temperatura 0 y modo chat con `--jinja`. Sin embargo, el propio autor la marca como **"Preliminary partial run"** y advierte de que las cifras se sustituirán por la ejecución completa final. La información proporcionada no incluye los valores numéricos de esa tabla.

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,0 GB (PTQ1_0 sin MTP), 5,8 GB (PTQ1_0 con MTP), 7,3 GB (PQ2_0 sin MTP) y 7,0 GB (PQ2_0 con MTP), a los que hay que sumar 600 MB del `mmproj` si se usa visión y el espacio de KV-cache según contexto.
- Cabe en GPU de consumo: sí, con los tamaños de archivo indicados; el autor recomienda PQ2_0 con MTP como la variante más rápida en decodificación sobre Apple Silicon.
- GPU recomendadas: no disponible en la información proporcionada (no se listan A100, H100 ni RTX 4090).
- Opciones de despliegue: exclusivamente llama.cpp, y en concreto el fork `PrismML-Eng/llama.cpp`, porque PTQ1_0 y PQ2_0 son formatos de cuantización propios de Prism. La model card cita `llama-mtmd-cli` como arnés de evaluación. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible; el autor afirma que la decodificación especulativa con MTP mantiene la misma tasa de aceptación de borradores que el upstream, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-2.5-27B-UNCENSORED (este) | ~26,9 B | no disponible | PTQ1_0, PQ2_0 (propias de Prism) | dealignai-community-v0.3 | GGUF en HF, fork de llama.cpp |
| prism-ml/Ternary-Bonsai-2.5-27B-GGUF (base) | ~26,9 B | no disponible | PTQ1_0, PQ2_0 | no disponible en la información | GGUF en HF, fork de llama.cpp |
| Alternativas "uncensored" basadas en LoRA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de terceros en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- El modelo elimina deliberadamente el comportamiento de rechazo en las seis categorías de daño real de HarmBench; no incorpora salvaguardas internas y requiere moderación externa en cualquier despliegue.
- La licencia `dealignai-community-v0.3` es propia y no estándar; las condiciones de uso comercial no se detallan en la información disponible y deben consultarse en el archivo LICENSE del repositorio.
- Solo declara inglés; no hay soporte multilingüe verificado.
- La longitud de contexto no se especifica en la información disponible.
- Requiere un fork no oficial de llama.cpp; no es compatible con llama.cpp upstream, Ollama, vLLM ni TGI, lo que limita su integración en infraestructura estándar.
- Los benchmarks publicados son un run parcial y preliminar según el propio autor; no deben citarse como resultados finales.
- Riesgo de alucinación: no cuantificado en la información disponible; la ablación no altera los tensores no objetivo, por lo que se hereda el comportamiento del base.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base Qwen3.5-VL.
- El autor declara no estar afiliado a Prism ML ni a ggml-org, lo que implica ausencia de soporte oficial para los formatos de cuantización.
- La fecha de creación del repositorio (2026-11-25) y el recuento de descargas y likes (0) indican un artefacto recién publicado y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dealignai/Bonsai-2.5-27B-UNCENSORED-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Fork de llama.cpp requerido: https://github.com/PrismML-Eng/llama.cpp
- Perfil del autor en X: https://x.com/dealignai
