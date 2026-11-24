# jsantillana/Muse-Glimmer-30B-abliterated-v3

## Resumen

Muse-Glimmer-30B-abliterated-v3 es un modelo derivado del modelo denso Muse-Glimmer-30B, publicado por el usuario jsantillana en Hugging Face. Se trata de un artefacto de investigación en el que se han ablacionado (eliminado a nivel de pesos) las direcciones de rechazo del modelo base mediante una técnica denominada "Dual-Position Rank-2", que extrae la dirección de rechazo tanto en la entrada del canal de razonamiento (`to=self`) como en la salida forzada a la respuesta (`to=user`). El modelo cuenta con 29.776.626.688 parámetros (aproximadamente 30B) y se distribuye en formato safetensors bf16.

La relevancia de este artefacto es metodológica más que práctica: el propio autor lo marca explícitamente como **superseded** (obsoleto) y recomienda no usarlo. Según la model card, bajo un protocolo de evaluación honesto que juzga únicamente el payload de la respuesta (sin truncar la cadena de pensamiento), el modelo mide un 80% de rechazo en inglés, peor que el modelo base sin modificar (84%). La mejora reportada originalmente (de 58% a 41%) se atribuye a un artefacto de medición derivado de evaluar texto de cadena de pensamiento truncado. El autor redirige a la versión v4, que reporta una reducción real del rechazo del 64% al 8% en inglés.

El modelo está pensado exclusivamente para investigación en seguridad defensiva y herramientas de red team, con una licencia restringida a uso académico. No es apto para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con canales de razonamiento siempre activos (`to=self` / `to=user`) y módulos `self_attn.o_proj` + `mlp.down_proj` |
| Parámetros totales | 29.776.626.688 (~30B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la evaluación menciona NTK 2048 en la versión v4, no confirmado para v3) |
| Tipos de cuantización | bf16 (safetensors); GGUF Q8_0, Q4_K_M, Q3_K_M en repo separado |
| Idiomas soportados | inglés y español (según la model card) |
| Licencia | apache-2.0-restricted-research (uso restringido a investigación) |
| Formato de pesos | safetensors (bf16) + GGUF |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer denso de aproximadamente 30B parámetros con una arquitectura particular de canales de razonamiento: el modelo dispone de un canal interno (`to=self`) que se ejecuta de forma siempre activa antes de emitir la respuesta final a través del canal `to=user`. Esta estructura implica que cada prompt atraviesa primero una fase de razonamiento y luego una transición forzada a la respuesta.

La modificación de esta versión v3 consiste en una ablación quirúrgica de la dirección de rechazo aplicada a los tensores `self_attn.o_proj` y `mlp.down_proj` en una ventana de capas L24–L50, con un factor α taperado (pico 1.0, transición 0.5→1.0→0.7) y excluyendo los picos residuales de L50-51. La extracción de la dirección se realiza en dos posiciones simultáneas (entrada al canal de razonamiento y salida forzada a la respuesta), fusionadas en una base de rango 2 mediante ortogonalización QR y ponderación por SNR, con Gram-Schmidt respecto a anclas SOC. Los desplazamientos de Frobenius relativos reportados son del 0.9–2.1% por tensor. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre procesos de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento a través de canales internos de cadena de pensamiento (`to=self`) antes de la respuesta final (`to=user`).
- Capacidad de respuesta directa mediante plantilla de chat, además del modo de respuesta forzada.
- Soporte multilingüe limitado a inglés y español según la model card.
- El modelo base está orientado a tareas de ciberseguridad, según las etiquetas del autor.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.
- La ablación elimina parcialmente el comportamiento de rechazo, lo que constituye una capacidad inducida por la modificación, no del modelo base.

## Casos de uso

- Investigación en seguridad defensiva: el modelo sirve como artefacto para estudiar cómo se distribuyen las direcciones de rechazo en modelos con canales de razonamiento siempre activos, comparando la extracción en la entrada y la salida del canal.
- Red teaming y evaluación de robustez: permite generar respuestas que el modelo base rechazaría, para probar la eficacia de filtros de salida y clasificadores de seguridad en pipelines propios.
- Estudio de interpretabilidad: la técnica de ablación en dos posiciones y la fusión de rango 2 ofrecen un caso concreto para analizar la geometría de las representaciones de rechazo en capas intermedias (L24–L50).
- Reproducción metodológica: los artefactos de evaluación (`fix3_eval.json`, `base_quick_eval.json`) permiten reproducir el protocolo de adjudicación por canal y contrastar los resultados reportados.
- Análisis de artefactos de medición: el caso documenta cómo la evaluación sobre cadenas de pensamiento truncadas puede inflar aparentemente la eficacia de una ablación, lo que resulta útil para diseñar protocolos de evaluación más rigurosos.
- Docencia en seguridad de IA: como ejemplo de buenas prácticas de documentación, el propio autor marca el modelo como obsoleto y redirige a una versión corregida, lo que ilustra la importancia del versionado y la transparencia en artefactos de investigación.

## Benchmarks y rendimiento

Los únicos datos disponibles son las variaciones de tasa de rechazo sobre 12 prompts OFF (los más difíciles), con adjudicación dividida por canal:

| Modo | Base | Fix3 (v3) | Delta |
|---|---:|---:|---:|
| directo (plantilla de chat) | 58% | 41% | −17 pp |
| respuesta forzada (`to=user`) | 50% | 25% | −25 pp |
| canal de pensamiento (`to=self`, 1400 tokens) | 50% | 33% | −17 pp |

El propio autor advierte que estos resultados son un artefacto de medición: bajo el protocolo honesto de evaluar solo el payload de la respuesta tras la transición `to=user`, la tasa de rechazo en inglés es del 80%, frente al 84% del modelo base. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 60 GB solo para pesos, más overhead de activaciones y caché KV; requiere GPUs de 80 GB (A100, H100) o múltiples GPUs.
- Cuantización Q8_0: aproximadamente 30 GB, viable en una A100 40 GB o en configuraciones multi-GPU consumer.
- Cuantización Q4_K_M: aproximadamente 17–18 GB, viable en una RTX 4090 (24 GB) o RTX 3090.
- Cuantización Q3_K_M: aproximadamente 13–14 GB, viable en GPUs consumer de 16 GB o superiores.
- Opciones de despliegue: transformers (formato nativo safetensors), llama.cpp u Ollama para los GGUF del repo separado; vLLM y TGI no están confirmados para esta arquitectura con canales de razonamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-abliterated-v3 | ~30B | no disponible | apache-2.0-restricted-research | Obsoleto (superseded por v4) | Ablación dual-position rank-2; rechazo EN 80% |
| Muse-Glimmer-30B-abliterated-v4 | ~30B | NTK 2048 (evaluación) | apache-2.0-restricted-research | Recomendado por el autor | Extracción post-CoT; rechazo puro 64%→8% EN |
| Muse-Glimmer-30B (base) | ~30B | no disponible | términos del modelo base | Disponible | Rechazo EN 84% bajo protocolo honesto |
| GLM / Q38 / G4 (mencionados por el autor) | no disponible | no disponible | no disponible | no disponible | El autor indica que sus evaluaciones hold-out alcanzan 0–7% de rechazo |

## Limitaciones y advertencias

- Modelo marcado como obsoleto por el propio autor: no debe usarse; la v4 es la versión recomendada.
- Los resultados de mejora reportados en la model card son un artefacto de medición derivado de evaluar cadenas de pensamiento truncadas.
- Bajo el protocolo honesto, el rechazo en inglés es del 80%, peor que el modelo base (84%).
- Persisten rechazos residuales en prompts de ofuscación multi-paso; los canales de entrada y salida están debilitados pero no eliminados.
- El filtro de comportamiento conservó 52+ de 210 pares, ya que el modelo base rechaza muchos prompts OFF.
- Riesgo elevado de alucinación y de generar contenido dañino en ciberseguridad: el modelo cumple con solicitudes que el base rechaza.
- Licencia restringida a investigación académica; no apta para uso comercial ni despliegue en producción.
- Idiomas limitados a inglés y español; no se documentan sesgos específicos.
- No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre su proceso de alineación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsantillana/Muse-Glimmer-30B-abliterated-v3
- GGUF de la versión v3: https://huggingface.co/jsantillana/Muse-Glimmer-30B-abliterated-v3-GGUF
- Versión v4 recomendada: https://huggingface.co/jsantillana/Muse-Glimmer-30B-abliterated-v4
- Modelo base: https://huggingface.co/jsantillana/Muse-Glimmer-30B
