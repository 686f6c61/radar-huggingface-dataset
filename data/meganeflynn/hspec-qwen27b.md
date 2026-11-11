# MeganEFlynn/HSpec-Qwen27B

## Resumen

HSpec-Qwen27B es un modelo borrador (drafter) para decodificación especulativa diseñado para acelerar la inferencia del modelo objetivo Qwen/Qwen3.8-27B. No es un modelo generativo autónomo: su función es proponer secuencias de tokens candidatas que el modelo objetivo verifica en paralelo, reduciendo el coste por token generado. Lo desarrolla MeganEFlynn y se entrena con el framework vllm-project/speculators, empleando una arquitectura híbrida Mamba-atención con cabezas de tipo EAGLE3.

El checkpoint contiene 4.101.476.825 parámetros en formato safetensors (16,4 GB de repositorio) y se distribuye bajo licencia Apache 2.0. La propuesta concreta es un drafter de profundidad 5 y tamaño de bloque 6 sobre un vocabulario de borrador de 64k, que comparte las claves y valores (KV) de las capas de atención completa del verificador en las capas 3, 19, 35, 51 y 63 del objetivo.

La relevancia de esta versión radica en la corrección del tratamiento de RoPE: la rotación Q/K del drafter ahora coincide con el rotary parcial del objetivo (`head_dim=256`, `partial_rotary_factor=0.25`, `rotary_dim=64`, `rope_theta=1e7`, emparejamiento neox `j↔j+32`). Esta corrección mejora la tasa de aceptación en validación de 0,405 a 0,511 y la longitud de aceptación efectiva (EAL) de 2,428 a 2,998.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-atención (`mamba_attn_hybrid`) con cabezas EAGLE3 y compartición de KV con el verificador |
| Parametros totales | 4.101.476.825 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `--max-model-len 8196`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un drafter especulativo de tipo híbrido Mamba-atención. Atiende al prefijo de claves ya rotadas que comparte con el verificador, reutilizando las KV de las capas de atención completa 3, 19, 35, 51 y 63 de Qwen3.8-27B. Emplea profundidad de borrador 5, tamaño de bloque 6 y un vocabulario de borrador de 64k. La corrección de RoPE alinea la rotación Q/K del drafter con el rotary parcial del objetivo, condición necesaria porque el drafter consume el prefijo K compartido ya rotado.

El entrenamiento se realizó sobre 49.500 muestras de OpenPerfectBlend regeneradas con Qwen3.8-27B, durante 1 época, en 7 GPU H100, extrayendo en línea los estados ocultos y las KV compartidas del modelo objetivo. Se usó el repositorio vllm-project/speculators (rama `hspec_qwen_27B`, commit `577a974`). El comando completo de entrenamiento está en `train_command.txt`.

## Capacidades

- Decodificación especulativa: propone hasta 5 tokens candidatos por paso para que el verificador Qwen3.8-27B los valide en paralelo.
- Aceleración de inferencia del modelo objetivo, no generación autónoma de texto.
- Compartición de KV con las capas de atención completa del verificador para reducir cómputo y memoria.
- Integración con vLLM mediante `--spec-model` y `--spec-method mamba_attn_hybrid`.
- Soporte de tool calling, agentes, razonamiento, código o multilingüismo: no disponible (depende del modelo objetivo, no del drafter).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Servicio de Qwen3.8-27B con latencia reducida: desplegar el drafter junto al objetivo en vLLM con `--spec-tokens 5` para aumentar el throughput en cargas de generación interactiva.
- Generación de código asistida: la evaluación en HumanEval muestra una longitud de aceptación de 2,5590, adecuada para autocompletado y tareas de programación donde el drafter acierta con frecuencia.
- Chat multi-turno de producción: al reducir el coste por token verificado, permite sostener conversaciones largas con menor coste de GPU.
- Pipelines de CI/CD con generación de texto: integrar el drafter en un servidor vLLM existente para acelerar tareas batch de documentación o tests generados.
- Investigación en decodificación especulativa: servir como referencia reproducible de un drafter híbrido Mamba-atención con compartición de KV y datos de aceptación publicados.
- Evaluación comparativa de drafters: usar los CSV de aceptación por posición en HumanEval para comparar variantes de profundidad, bloque o tratamiento de RoPE.

## Benchmarks y rendimiento

| Metrica | Pre-fix 50k | Este checkpoint |
|---|---|---|
| Val loss | 0,860 | 0,735 |
| Val accept rate | 0,405 | 0,511 |
| Val EAL | 2,428 | 2,998 |
| HumanEval acceptance length | 2,2275 | 2,5590 |

Aceptación por posición en HumanEval (posiciones 0–4): 0,623 / 0,390 / 0,254 / 0,173 / 0,119 sobre 101.865 borradores. Datos brutos en `humaneval/acceptance.csv` y `humaneval/run_HumanEval.json`. No se han publicado resultados de MMLU, GSM8K u otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 16,4 GB en safetensors, por lo que se requiere al menos esa cifra más la memoria del modelo objetivo Qwen3.8-27B.
- GPU recomendadas: el entrenamiento se realizó en 7×H100; para servicio se recomienda H100 o A100 por la memoria conjunta de drafter y verificador.
- ¿Cabe en GPU consumer? No disponible; con 4.100 millones de parámetros y 16,4 GB en safetensors, no cabe en GPUs de 8–12 GB y requiere verificación en 24 GB o más junto al objetivo.
- Opciones de despliegue: vLLM con `--spec-model`, `--spec-method mamba_attn_hybrid`, `--spec-tokens 5`, `--max-model-len 8196` y `--attention-backend FLASHINFER`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; la mejora esperada se deriva de la longitud de aceptación (2,5590 en HumanEval).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HSpec-Qwen27B | 4,10 B | no disponible | Drafter híbrido Mamba-atención | Apache 2.0 | Hugging Face (63 descargas) |
| Drafter EAGLE3 estándar para Qwen | no disponible | no disponible | Drafter transformer | no disponible | no disponible |
| Drafter EAGLE2 para Qwen | no disponible | no disponible | Drafter transformer | no disponible | no disponible |

No se dispone de datos comparativos publicados frente a otros drafters en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona acoplado a Qwen/Qwen3.8-27B; no es un modelo generativo independiente.
- La corrección de RoPE es obligatoria: usar el checkpoint pre-fix con el objetivo actual degrada la aceptación (0,405 frente a 0,511).
- El ejemplo de servicio limita `--max-model-len` a 8196; no se documenta el contexto máximo real soportado.
- Requiere el backend FLASHINFER y la rama `hspec_qwen_27B` de vllm-project/speculators; la compatibilidad con otras versiones de vLLM no está garantizada.
- No se documentan sesgos, riesgos de alucinación ni evaluación multilingüe del drafter; estos dependen del modelo objetivo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo objetivo Qwen3.8-27B tiene sus propias condiciones que deben verificarse por separado.
- Repositorio con 63 descargas y 0 likes: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/MeganEFlynn/HSpec-Qwen27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Framework de entrenamiento: https://github.com/vllm-project/speculators
- Datos de evaluación: `humaneval/acceptance.csv` y `humaneval/run_HumanEval.json` (en el repositorio)
- Comando de entrenamiento: `train_command.txt` (en el repositorio)
