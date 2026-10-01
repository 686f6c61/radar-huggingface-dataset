# anlord/gemma-3-1b-it-Abliterated

## Resumen

Gemma-3-1b-it-Abliterated es una versión derivada de google/gemma-3-1b-it, el modelo de 1B de parámetros de la familia Gemma 3 de Google. El autor del repositorio (anlord) ha aplicado un proceso de "abliteration" sobre el modelo instructivo original: una técnica de modificación de pesos que busca eliminar la dirección latente responsable de las respuestas de rechazo, sin reentrenar el modelo desde cero ni aplicar fine-tuning supervisado.

El problema que aborda es concreto: los modelos instructivos alineados rechazan sistemáticamente ciertas peticiones, lo que resulta problemático en investigación de seguridad, generación de datos sintéticos y red teaming, donde se necesita estudiar el comportamiento del modelo sin esa capa de rechazo. El resultado declarado es una reducción de rechazos de 97/104 a 5/104 prompts en el pipeline de evaluación del propio autor, con una divergencia KL de 0,1010 respecto al modelo original.

El modelo se distribuye en formato Safetensors para Transformers, con 999.885.952 parámetros reales (aproximadamente 1B), y cuenta con un repositorio paralelo de cuantizaciones GGUF. Es relevante por su tamaño reducido: cabe en GPU de consumo e incluso en CPU, lo que lo hace útil para experimentación local. La licencia heredada es la Gemma Terms of Use.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; heredada de google/gemma-3-1b-it (familia Gemma 3, tag `gemma3_text`) |
| Parámetros totales | 999.885.952 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Safetensors (BF16/FP16, según el repo base) y GGUF: BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | Safetensors; GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo no se ha entrenado: es una edición de pesos del checkpoint google/gemma-3-1b-it. La model card indica únicamente que la arquitectura y el entrenamiento originales son los del modelo base, del que no se detallan composición de datos, número de tokens, ni fases de RLHF/DPO. El pipeline aplicado es AnlordAbliterator 1.4.0, una herramienta externa que ejecuta 200 pruebas de optimización (estudio Optuna) para localizar y restar la dirección de rechazo en espacios de proyección concretos de la red.

Los parámetros de la ablación publicados son: `direction_scope = global`, `direction_index = 13.424`, y pesos por capa para `attn.o_proj` (`max_weight = 1.945` en posición 12.909, `min_weight = 1.729` a distancia 9.663) y `mlp.down_proj` (`max_weight = 1.426` en posición 14.765, `min_weight = 0.013` a distancia 2.431). El repositorio incluye una carpeta `reproduce/` con la configuración fijada, el diario completo del estudio Optuna, los checksums SHA-256 de los ficheros de pesos y el comando `AnlordAbliterator --reproduce anlord/gemma-3-1b-it-Abliterated`, que reaplica la ablación sobre el modelo base y verifica hashes y métricas. No hay innovación arquitectónica: la única modificación es la resta de una dirección en los pesos, con una divergencia KL de 0,1010 frente al original, lo que indica un desplazamiento medible de la distribución de salida.

## Capacidades

- Generación de texto conversacional, heredada del modelo instructivo original.
- Reducción drástica del comportamiento de rechazo: 5 rechazos sobre 104 prompts en la evaluación del autor, frente a 97 del modelo base.
- Respuesta a instrucciones en formato chat (tokenizador y plantilla del modelo base).
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible`, además de Transformers.
- Compatibilidad con tooling de cuantización GGUF (llama.cpp y derivados).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo base es multilingüe según Google, pero esta ficha no dispone de datos verificados.
- Capacidades especiales (modo thinking, visión, audio): no disponible para esta variante; el checkpoint base `gemma-3-1b-it` es un modelo de texto.

## Casos de uso

- Red teaming y evaluación de seguridad: al eliminar los rechazos, permite estudiar qué genera un modelo de 1B sin capa de alineación, alimentando clasificadores y filtros de contenido con ejemplos difíciles de obtener de modelos alineados.
- Investigación sobre alineación y direcciones latentes: el repositorio publica parámetros de ablación, checksums y el diario Optuna, lo que permite reproducir el experimento y comparar la dirección de rechazo de un 1B con la de modelos mayores.
- Generación de datos sintéticos para entrenamiento: producción masiva y local de texto en dominios donde el modelo base rechazaría la petición, con 200 pruebas de optimización documentadas para justificar la reproducibilidad del proceso.
- Escritura creativa adulta y narrativa sin restricciones de contenido: el modelo mantiene la fluidez del instructivo original pero sin negativas sistemáticas, adecuado para ficción y guiones en entornos controlados.
- Despliegue local en hardware limitado: con aproximadamente 1B de parámetros en cuantización Q4_K_M ocupa del orden de 0,7 GB, por lo que puede ejecutarse en portátiles y equipos sin GPU mediante llama.cpp u Ollama.
- Base para fine-tuning ligero: al ser un checkpoint pequeño y ya "desalineado", sirve como punto de partida para LoRA/QLoRA en dominios de nicho donde el punto de partida alineado impondría rechazos durante la generación de datos de entrenamiento.
- Simulación de interlocutores en pruebas de robustez: integrar el modelo como adversario en pipelines automatizados que evalúan la resistencia de otros sistemas a entradas hostiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son las del pipeline de evaluación del propio autor:

| Métrica | Antes (base) | Después (abliterado) |
|---|---|---|
| Rechazos (104 prompts de evaluación) | 97 / 104 | 5 / 104 |
| Divergencia KL | 0 | 0,1010 |

El autor advierte explícitamente de que estas cifras provienen de su propio pipeline de evaluación con 104 prompts y deben tratarse como resultados de evaluación, no como garantía de comportamiento en cualquier entrada.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del número de parámetros real, con sobrecarga de runtime de KV cache y activaciones):
  - BF16/FP16: aproximadamente 2,0 GB de pesos, en torno a 2,5-3,5 GB en uso real.
  - Q8_0: aproximadamente 1,1 GB de pesos.
  - Q6_K: aproximadamente 0,9 GB.
  - Q5_K_M: aproximadamente 0,8 GB.
  - Q4_K_M: aproximadamente 0,7 GB (tamaño total del repo Safetensors: 2,0 GB).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en BF16; con cuantización Q4 basta con 2 GB, por lo que funcionan RTX 3060, RTX 4060, RTX 4090, Apple Silicon unificado (M1 en adelante) y GPUs de datacenter como A100 o H100, aunque son claramente sobredimensionadas para un modelo de 1B.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas de los últimos ocho años, y también en CPU mediante GGUF.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), text-generation-inference (declarado en los tags), llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Compatible con endpoints estándar (`endpoints_compatible`).
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| anlord/gemma-3-1b-it-Abliterated | 999.885.952 | No disponible | Gemma Terms of Use | Abierto en HF, 0 descargas | Sin rechazos; KL 0,1010 respecto al base |
| google/gemma-3-1b-it | Aproximadamente 1B | No disponible | Gemma Terms of Use | Gated en HF | Modelo base; 97/104 rechazos en el mismo pipeline |
| meta-llama/Llama-3.2-1B-Instruct | No verificado | No verificado | Llama 3.2 Community License | Gated en HF | Alternativa alineada de tamaño similar |
| Qwen/Qwen2.5-1.5B-Instruct | No verificado | No verificado | Apache-2.0 | Abierto en HF | Alternativa alineada ligeramente mayor; licencia permisiva para uso comercial |

Los datos de los modelos alternativos no han sido verificados en la información proporcionada y deben contrastarse en sus repositorios oficiales antes de tomar decisiones. El diferencial real de esta variante no es el rendimiento bruto, sino la ausencia de rechazos y la trazabilidad del proceso de ablación.

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo, pero no sustituye ninguna política de seguridad: el modelo puede producir contenido dañino, ilegal o explícitamente prohibido por la Gemma Terms of Use y su política de uso prohibido. Desplegarlo en producto exige filtros externos.
- La divergencia KL de 0,1010 indica un desplazamiento medible respecto al modelo base; la ablación puede degradar otras capacidades además de los rechazos (coherencia, seguimiento de instrucciones, factualidad), algo que el autor reconoce explícitamente.
- Riesgo alto de alucinación: con aproximadamente 1B de parámetros, la capacidad de conocimiento factual y de razonamiento es limitada incluso antes de la ablación.
- Las métricas de rechazo proceden de 104 prompts internos de la herramienta AnlordAbliterator, no de un conjunto estándar auditado; la generalización a otros dominios e idiomas no está demostrada.
- Idiomas soportados no declarados: se desconoce el comportamiento en castellano y en idiomas distintos del inglés. No se recomienda asumir competencia multilingüe sin evaluación propia.
- Longitud de contexto no disponible en esta ficha: hay que consultar las especificaciones del modelo base para planificar prompts largos.
- Restricciones de licencia: se hereda la Gemma Terms of Use, que impone obligaciones de atribución y restricciones de uso (incluida la política de uso prohibido de Google). No es una licencia permisiva tipo Apache-2.0 y no se puede reclamar un uso comercial sin revisar los términos.
- El modelo base google/gemma-3-1b-it está gated en Hugging Face: es necesario aceptar los términos con una cuenta propia para descargarlo y para reproducir la ablación.
- Sin validación de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de calidad ni de estabilidad en producción.
- No hay datos de benchmarks estándar ni cifras de latencia o throughput, lo que impide estimar su coste operativo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anlord/gemma-3-1b-it-Abliterated
- Cuantizaciones GGUF: https://huggingface.co/anlord/gemma-3-1b-it-Abliterated-GGUF
- Herramienta de ablación AnlordAbliterator: https://github.com/justbedwarsplay/AnlordAbliterator
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
