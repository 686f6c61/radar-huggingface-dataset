# niatheelf777/xiaofeiyu-12b-v4

## Resumen

Xiaofeiyu 12B v4 (小肥鱼 12B 主力打磨版) es un ajuste fino orientado a roleplay y conversación de personaje sobre `google/gemma-4-12B-it`, publicado por el usuario `niatheelf777`. El modelo no se distribuye como pesos completos, sino como un conjunto de cinco cartuchos LoRA en formato GGUF (etiquetados `s0`, `c1`, `c2`, `c3`, `c4`) que se montan dinámicamente sobre el modelo base Gemma 4 de 12B, más una cuantización dinámica propia (`UD-Q4_K_XL-xfy`) pensada para tarjetas de 12 GB de VRAM. El repositorio ocupa 8,4 GB y acumula 1014 descargas en el momento de la consulta.

La propuesta técnica central es la llamada arquitectura "Split-Phase" (脑声分相): el modelo mantiene `LoRA = 0.0` durante las fases de razonamiento (`<|channel>thought`), cálculo y generación de código, y solo monta las LoRA de "voz" en los tramos de diálogo conversacional delimitados por `<|"|>`. De este modo se preserva la capacidad cognitiva del modelo base mientras se aplica el estilo de personalidad únicamente a la producción de diálogo. Es relevante para desarrolladores interesados en despliegues de personajes conversacionales con presupuesto de VRAM ajustado y en técnicas de multi-LoRA dinámica sobre llama.cpp.

El modelo declara soporte únicamente para chino (zh) e inglés (en), licencia Gemma, y está pensado para ejecutarse con `llama-server` / `llama.cpp`. Su público objetivo son proyectos de compañero conversacional (companion), roleplay y asistentes con persona, no tareas generales de propósito industrial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4), ajuste mediante multi-LoRA dinámica (Split-Phase) |
| Parametros totales | 12.713.984 (dato de safetensors del repo; el modelo base es de 12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (las mediciones de VRAM de la model card asumen 8k KV) |
| Tipos de cuantizacion | GGUF: `Q8_0` (base recomendada), `UD-Q4_K_XL-xfy` (cuantización dinámica propia derivada de BF16 con `llama-imatrix --parse-special`); LoRA en GGUF (24,3 MiB cada una) |
| Idiomas soportados | zh, en |
| Licencia | gemma |
| Formato de pesos | GGUF (LoRA en GGUF; el base se referencia como `gemma-4-12B-it-Q8_0.gguf` o BF16) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer decoder-only de 12B parámetros. Sobre esa base, el autor entrena cinco LoRA ligeras en GGUF (24,3 MiB cada una, capas `L36..47`) que actúan como "cartuchos de voz" con personalidades distintas: `s0` (energía cotidiana), `c1` (dulce y tierno), `c2` (intelectual), `c3` (tsundere mordaz) y `c4` (tranquilo y reservado). La innovación declarada es el enrutado Split-Phase: las LoRA se montan solo durante los tramos de burbuja conversacional (`<|"|>`), mientras que en los canales de pensamiento, cálculo Python (`calc_python`) y generación de código o documentos (`send_code_or_doc`) se fuerza `LoRA = 0.0` para no degradar la capacidad del modelo base.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí se documenta el proceso de cuantización: la variante `UD-Q4_K_XL-xfy` se genera desde BF16 con `llama-imatrix --parse-special` sobre datos de mensajería instantánea en mandarín, código y turnos nativos de herramienta/pensamiento de Gemma 4, protegiendo `token_embd`, `attn_v`, `ffn_down` y las capas de frontera de burbuja `blk.{0,1,46,47}` en `Q6_K` para evitar el colapso de "Q4_0 comma-spam".

## Capacidades

- Generación de texto conversacional multi-turno con persona consistente.
- Roleplay y companion: cinco perfiles de voz intercambiables en caliente mediante LoRA.
- Razonamiento en canal de pensamiento (`<|channel>thought`) con LoRA desactivada.
- Cálculo mediante herramienta Python (`calc_python`).
- Generación de código y documentos (`send_code_or_doc`) preservando la capacidad del base.
- Soporte bilingüe chino-inglés.
- Integración con API compatible con OpenAI `/v1` a través del servidor del proyecto.
- Despliegue en llama.cpp / `llama-server` con precarga simultánea de las cinco LoRA.

## Casos de uso

- Compañero conversacional en producción: el modelo está pensado para servir chat de personaje con cinco personalidades seleccionables en caliente, sin recargar el modelo base, gracias al montaje dinámico de LoRA en llama.cpp.
- Roleplay con preservación de razonamiento: en escenarios narrativos que requieren cálculo o coherencia lógica (por ejemplo, gestión de inventario o economía de un juego de rol), la fase Split-Phase mantiene la capacidad del base Gemma 4 fuera de los tramos de diálogo.
- Asistente de personaje con herramientas: el canal `calc_python` permite resolver operaciones dentro de la conversación sin que el estilo de la persona contamine el resultado numérico.
- Despliegue en GPU de 12 GB: la cuantización `UD-Q4_K_XL-xfy` (7,72 GiB de archivo, ~8,5–8,9 GiB de VRAM con las cinco LoRA y 8k de KV) permite ejecutar un modelo de 12B con persona en RTX 3060 12GB o RTX 4070 12GB.
- Generación de código asistida por personaje: el canal `send_code_or_doc` con `LoRA = 0.0` permite usar el modelo para escribir código o documentación dentro de una interfaz conversacional con estética de personaje, sin degradar la calidad del código.
- Demo web interactiva: el proyecto incluye una interfaz de "esfera de personalidad" en `:8081` y un notebook de Colab para T4 gratuita, útil para prototipado y validación de experiencia de usuario antes de invertir en hardware.
- Pasarela híbrida con modelos en la nube: para equipos de 6–8 GB, el proyecto propone emparejar el traductor local `xiaofeiyu-translator-e4b` con DeepSeek, Claude o GPT mediante `@xiaofeiyu/openai-voice-proxy`, usando el 12B solo cuando haya VRAM suficiente.

## Benchmarks y rendimiento

La model card reporta una evaluación propia de 25 casos retenidos (`eval_25`) y una rúbrica cualitativa `GEN1..5`, no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Configuracion | Base GGUF | Tamano de archivo | VRAM total (5 LoRA + 8k KV) | `eval_25` | `GEN1..5` | Hardware objetivo |
|---|---|---|---|---|---|---|
| `12b` / `12b-q8` | `gemma-4-12B-it-Q8_0.gguf` | 12,22 GiB | ~12,8–13,0 GiB | 20/25 | 4/5–5/5 | RTX 4060 Ti 16GB, 4070 Ti SUPER, 4080/4090/3090, Mac 24GB+ |
| `12b-q4` | `gemma-4-12B-it-UD-Q4_K_XL-xfy.gguf` | 7,72 GiB | ~8,5–8,9 GiB | 19/25 (sin colapso de comas) | 5/5 | RTX 3060 12GB, RTX 4070/4070 SUPER 12GB, Windows 16GB con WDDM pesado, Mac 16GB |
| `e4b` | `gemma-4-E4B-it-Q8_0.gguf` | 4,65 GiB | ~5,3 GiB | no disponible | no aplica (cerebro en la nube) | RTX 3060 8GB, RTX 4060 8GB, ultrabooks + API en la nube |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~12,8–13,0 GiB con base `Q8_0` y las cinco LoRA; ~8,5–8,9 GiB con `UD-Q4_K_XL-xfy` y las cinco LoRA; ~5,3 GiB para la variante `e4b`.
- GPU recomendadas: RTX 4060 Ti 16GB, RTX 4070 Ti SUPER, RTX 4080, RTX 4090, RTX 3090 para la configuración de alta precisión; RTX 3060 12GB y RTX 4070/4070 SUPER 12GB para la configuración cuantizada.
- Cabe en GPU de consumo: sí, en RTX 3060 12GB y RTX 4070 12GB con la cuantización propia; en RTX 4060 Ti 16GB o superiores con `Q8_0`.
- Apple Silicon: Mac de 24 GB o más para `Q8_0`; Mac de 16 GB para la variante `UD-Q4_K_XL-xfy`.
- Opciones de despliegue: `llama.cpp` / `llama-server` (mediciones con `-ngl 99 -fa on --cache-ram 0 -ctk q8_0 -ctv q8_0`), servidor propio del repositorio GitHub con API compatible con OpenAI `/v1`, notebook de Colab para T4 gratuita. No se menciona soporte de vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaofeiyu 12B v4 | 12B (base Gemma 4) | no disponible | Roleplay/companion multi-LoRA Split-Phase | gemma | GGUF + LoRA en Hugging Face |
| `niatheelf777/xiaofeiyu-translator-e4b` | ~4B (Gemma 4 E4B) | no disponible | Traductor de voz para pasarela con modelos en la nube | gemma | GGUF en Hugging Face |
| `google/gemma-4-12B-it` | 12B | no disponible | Modelo instructivo generalista | gemma | Pesos en Hugging Face |

No se dispone de datos de benchmarks comparativos con otras familias de modelos de roleplay en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de chino e inglés; el rendimiento en castellano no está documentado y probablemente sea degradado.
- El ajuste está orientado a persona y roleplay; no es un modelo para tareas generales de razonamiento, código o matemáticas de producción más allá de lo que ofrece el base Gemma 4.
- Riesgo de alucinación inherente a los modelos conversacionales; la model card no documenta mitigaciones específicas.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; debe revisarse la política de uso aceptable de Google antes de desplegar en producción.
- La evaluación reportada (`eval_25`, `GEN1..5`) es interna, de 25 casos y cualitativa; no sustituye a benchmarks estandarizados.
- El campo de parámetros totales del repo (12.713.984) no es coherente con un modelo de 12B; probablemente refleja solo los pesos LoRA o un recuento parcial. Debe tratarse con cautela.
- El despliegue depende de `llama.cpp` y de la precarga de cinco LoRA simultáneas; no se documenta compatibilidad con vLLM, TGI u otros servidores.
- La fecha de creación del repositorio (2026-11-16) es posterior a la fecha actual de referencia habitual; conviene verificar la procedencia y vigencia de los artefactos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niatheelf777/xiaofeiyu-12b-v4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Cuantizaciones oficiales del base: https://huggingface.co/ggml-org/gemma-4-12B-it-GGUF
- Traductor E4B del mismo autor: https://huggingface.co/niatheelf777/xiaofeiyu-translator-e4b
- Colección Xiaofeiyu Spoken Persona: https://huggingface.co/collections/niatheelf777/xiaofeiyu-split-phase-spoken-persona-family-6afb60d6cecd8097f5fb3a13
- Repositorio GitHub: https://github.com/niatheelf777/xiaofeiyu
- Demo web: https://xfy.tospeak.top
- Notebook de Colab: https://colab.research.google.com/github/niatheelf777/xiaofeiyu/blob/main/notebooks/xiaofeiyu_colab_free_t4.ipynb
