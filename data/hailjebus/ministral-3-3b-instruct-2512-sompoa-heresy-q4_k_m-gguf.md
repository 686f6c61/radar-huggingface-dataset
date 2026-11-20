# HailJebus/Ministral-3-3B-Instruct-2512-SOMPOA-heresy-Q4_K_M-GGUF

## Resumen

Esta ficha describe una cuantizacion GGUF en formato Q4_K_M del modelo `MuXodious/Ministral-3-3B-Instruct-2512-SOMPOA-heresy`, un derivado del Ministral 3 de 3B parametros de Mistral AI que ha sido sometido a un proceso de "abliteration" o "decensoring" (etiquetado por el autor como `heretic`, `uncensored`, `abliterated`) para eliminar total o parcialmente los mecanismos de rechazo alineados. El repositorio lo publica el usuario HailJebus y no constituye un modelo original, sino una conversion de pesos a GGUF realizada con la herramienta GGUF-my-repo de ggml.ai sobre llama.cpp.

El modelo subyacente cuenta con 3.429.006.336 parametros (aproximadamente 3,4 mil millones), lo que lo situa en la categoria de modelos pequenos aptos para inferencia en hardware de consumo. La model card hereda metadatos de la familia Mistral (etiqueta `mistral-common`, aviso de gated description con enlace a la politica de privacidad de Mistral) y declara soporte para once idiomas. La licencia declarada es Apache 2.0, aunque conviene contrastarla con la del modelo base original de Mistral.

La relevancia de esta publicacion es limitada y muy especifica: sirve a quienes necesitan un modelo de 3B sin filtros de seguridad en formato GGUF para ejecucion local con llama.cpp, o para investigacion sobre comportamiento de modelos "abliterated". No es un checkpoint oficial de Mistral ni cuenta con benchmarks publicados en la informacion disponible. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado el 20 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Ministral 3 3B Instruct; transformer denso segun la familia Mistral, no confirmado en la informacion) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repositorio) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo `ministral-3-3b-instruct-2512-sompoa-heresy-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card de este repositorio, que es una mera conversion de formato. Por el nombre y los tags (`mistral-common`), el modelo base pertenece a la familia Ministral 3 de Mistral AI, que emplea transformers densos con atencion de ventana deslizante en algunas capas, aunque este extremo no se confirma en la informacion proporcionada. El proceso de "abliteration" aplicado por MuXodious consiste tipicamente en la modificacion de direcciones de activacion asociadas al rechazo (refusal directions) para reducir la tasa de respuestas negativas del modelo alineado original.

No hay datos sobre el numero de tokens de entrenamiento, composicion del dataset, ni si hubo fases de RLHF o DPO. El proceso de cuantizacion a Q4_K_M se realizo con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, que aplica cuantizacion de bloques de 4 bits con escalas de 6 bits para determinados tensores (de ahi la denominacion K_M), reduciendo el peso del checkpoint a aproximadamente 2,1 GB en el repositorio.

## Capacidades

- Generacion de texto e instrucciones en once idiomas declarados (en, fr, es, de, it, pt, nl, zh, ja, ko, ar).
- Razonamiento basico y respuesta a instrucciones heredadas del modelo Instruct original.
- Generacion de codigo y matematicas (capacidad esperada de la familia Ministral, no verificada con benchmarks en la informacion disponible).
- Ausencia o reduccion de mecanismos de rechazo por "abliteration" (el autor lo etiqueta como `uncensored`, `decensored`, `abliterated`).
- Compatibilidad con llama.cpp (CLI y servidor) y con vLLM segun la etiqueta `library_name: vllm`, aunque la inferencia en vLLM con GGUF requiere compilacion especifica.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Ejecucion local en portatiles y equipos de sobremesa: el checkpoint Q4_K_M de ~2,1 GB permite cargar el modelo en CPU o en GPU de gama media con llama.cpp, ideal para prototipos offline sin conexion.
- Investigacion sobre alineacion y seguridad: util para estudiar el efecto del abliteration comparando respuestas con el modelo base Ministral 3 Instruct original en tareas sensibles.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o narrativa adulta donde los filtros del modelo alineado resultan limitativos (con las advertencias legales y eticas correspondientes).
- Traduccion y procesamiento multilingue ligero: cubre once idiomas, adecuado para tareas de traduccion de baja latencia en entornos con recursos limitados.
- Asistente de codigo embebido: generacion de snippets y autocompletado en editores o pipelines locales donde no se requiere un modelo grande.
- Chat de soporte interno en empresas con requisitos de privacidad: al ejecutarse localmente, evita el envio de datos a APIs externas.
- Educacion e investigacion academica: modelo pequeno para experimentos de cuantizacion, evaluacion de degradacion Q4_K_M frente a FP16 y estudios de sesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 2,2-2,8 GB incluyendo overhead de contexto y KV cache; con contexto de 2048 tokens el consumo tipico ronda los 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). En GPUs profesionales el modelo es trivial y se puede ejecutar con lotes grandes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas, incluidas las integradas de Apple Silicon mediante Metal.
- Opciones de despliegue: llama.cpp (CLI y llama-server), Ollama (importando el GGUF), LM Studio, y vLLM con soporte GGUF (requiere compilacion con backend GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en una RTX 4090 con Q4_K_M se espera un throughput del orden de cientos de tokens por segundo, pero no hay medicion oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Ministral-3-3B-Instruct-2512-SOMPOA-heresy Q4_K_M) | 3,43 B | no disponible | apache-2.0 | GGUF | Abliterated, sin benchmarks publicados |
| Ministral 3B Instruct (Mistral AI, original) | ~3 B | no disponible en esta ficha | licencia Mistral (no confirmada) | safetensors | Modelo alineado oficial, con filtros de seguridad |
| Llama 3.2 3B Instruct (Meta) | 3,21 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Alternativa alineada con contexto largo y benchmarks publicados |
| Qwen2.5 3B Instruct (Alibaba) | 3,09 B | 32 K | Apache 2.0 | safetensors, GGUF | Multilingue, con benchmarks publicados y buen rendimiento en codigo |

La comparativa se ofrece como referencia de categoria; los datos de contexto y rendimiento de los modelos alternativos no se han verificado en la informacion proporcionada y deben contrastarse en sus respectivas model cards.

## Limitaciones y advertencias

- Modelo "abliterated": la eliminacion de mecanismos de rechazo puede degradar la calidad general, aumentar la toxicidad y producir contenido inapropiado sin aviso.
- Riesgo elevado de alucinacion, agravado por el tamano reducido (3,4 B) y por la cuantizacion Q4_K_M, que introduce perdida adicional de precision frente a FP16.
- No hay benchmarks publicados: se desconoce la degradacion real frente al modelo base y frente a otras cuantizaciones.
- Contexto maximo no documentado; el ejemplo de la model card usa `-c 2048`, lo que sugiere que el autor no garantiza ventanas mayores.
- La licencia Apache 2.0 declarada debe contrastarse con la licencia del modelo Ministral original de Mistral AI, que puede imponer restricciones adicionales de uso comercial.
- El repositorio tiene cero descargas y cero likes, sin validacion de la comunidad; no se recomienda para produccion sin evaluacion propia.
- El aviso `extra_gated_description` con enlace a la politica de privacidad de Mistral sugiere herencia de metadatos del modelo original; verificar terminos antes de uso comercial.
- Idiomas declarados sin evaluacion: el soporte real de los once idiomas no esta verificado con metricas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HailJebus/Ministral-3-3B-Instruct-2512-SOMPOA-heresy-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/MuXodious/Ministral-3-3B-Instruct-2512-SOMPOA-heresy
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
