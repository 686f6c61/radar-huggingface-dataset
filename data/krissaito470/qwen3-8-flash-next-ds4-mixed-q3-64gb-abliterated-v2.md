# Krissaito470/Qwen3.8-Flash-Next-DS4-Mixed-Q3-64GB-abliterated-v2

## Resumen

Qwen3.8-Flash-Next-DS4-Mixed-Q3-64GB-abliterated-v2 es una cuantización GGUF comunitaria del modelo Qwen3.8-Flash-Next, publicada por el usuario Krissaito470 en Hugging Face. Se trata de una variante "abliterated" (con el comportamiento de rechazo de seguridad deliberadamente debilitado) construida sobre la versión v2 de Huihui-ai, que a su vez parte del modelo base de Qwen. El objetivo del fichero es permitir ejecutar un modelo MoE de gran tamaño (181.564 millones de parámetros totales según safetensors) en un Mac con 64 GB de memoria unificada, mediante un layout de cuantización mixta Q3 y un formato específico llamado DS4 (DwarfStar), desarrollado por antirez.

La relevancia de esta ficha radica en lo especializado del artefacto: no es un GGUF estándar compatible con llama.cpp u otros runtimes habituales, sino un formato propio del runtime ds4 que incorpora una tabla de n-gramas BF16 de 95,37 GiB leída directamente desde disco y un bloque MTP (multi-token prediction) embebido para decodificación especulativa. El modelo se dirige a un nicho muy concreto: usuarios de Apple Silicon con 64-96 GB de memoria unificada que quieran un modelo grande sin censura para escritura creativa y programación, asumiendo las responsabilidades legales y éticas que ello conlleva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con arquitectura `qwen4exp` (híbrida con componentes SSM, según los tensores del fichero), con bloque MTP embebido |
| Parámetros totales | 181.564.316.288 (≈181,56 B) |
| Parámetros activos | no disponible (el modelo es MoE, pero no se publica el número de expertos activos) |
| Longitud de contexto | no disponible como límite del modelo; el fichero se ha medido con contextos de 8.192, 32.768 y 131.072 tokens |
| Tipos de cuantización | Mixta Q3: Q4_K, IQ2_XXS, MXFP4, Q2_K (expertos enrutados), Q8_0 (atención/SSM/experto compartido), BF16 (token_embd y tabla n-gram), F16 (HC), F32 (router y normas) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (other) |
| Formato de pesos | GGUF (formato DS4/DwarfStar, no compatible con runtimes estándar) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, un modelo de mezcla de expertos (MoE) con 49 bloques (el bloque 48 es el bloque MTP embebido). La presencia de tensores `ssm_out` en 36 bloques indica una arquitectura híbrida que combina atención con capas de tipo SSM (state-space model). El bloque MTP (multi-token prediction) permite al runtime ds4 realizar decodificación especulativa mediante la tabla de n-gramas BF16 incluida en el propio fichero, que se lee directamente desde disco.

Sobre el entrenamiento del modelo original no se ofrece información en la ficha (número de tokens, composición del dataset o uso de RLHF/DPO): no disponible. Lo que sí documenta el autor con detalle es el proceso de construcción del fichero: no se re-cuantizó nada, sino que se compuso a nivel de bytes a partir de GGUFs existentes. Los tensores abliterated provienen de los ficheros `unsloth-Q8_0` de Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF (revisión `411f1f7`), y se sobrescribieron 96 tensores en el fichero base mixto: `attn_output` (12 bloques), `ssm_out` (36 bloques) y `ffn_down_shexp` (48 bloques). Los tensores de expertos enrutados (`ffn_*_exps`) no se tocaron, coherente con que la versión v2 upstream no abliterated ningún experto. La verificación tensor a tensor sobre el fichero Q4 confirmó que los 96 tensores modificados son byte-idénticos a los de Huihui v2 y los 1.160 restantes al fichero original.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), descrita por upstream como adecuada para escritura de novelas y programación.
- Comportamiento sin censura: la abliterated v2 debilita los rechazos de seguridad del modelo original, pudiendo generar contenido sensible, controvertido o inapropiado.
- Soporte de visión mediante un encoder separado (GGUF `qwen38-vision` del repositorio ds4, pasado con `--vision FILE`); la entrada de imágenes se ha confirmado funcional con este fichero.
- Decodificación especulativa vía MTP (`--mtp`) y tabla de n-gramas BF16 nativa.
- Soporte de tool calling: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Escritura de ficción larga sin rechazos: la versión v2 se describe como orientada a novelística; el contexto medido de hasta 131.072 tokens permite mantener novelas extensas en memoria.
- Programación asistida local: el modelo base está descrito como apto para código, y la ejecución 100 % local en Mac evita enviar código propietario a servicios externos.
- Investigación sobre abliteration y alineación: la documentación exhaustiva del proceso de composición de tensores lo hace útil como caso de estudio reproducible.
- Prueba del runtime ds4 y del formato DwarfStar: sirve como banco de pruebas para la lectura nativa de tablas n-gram BF16 y la predicción multi-token.
- Procesamiento de imágenes local en Apple Silicon: con el encoder de visión separado, puede describir o analizar imágenes sin conexión.
- Experimentación con contextos largos en hardware de consumo: el uso de memoria de ≈49-54 GiB según contexto lo hace viable en Macs de 64 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica publicada es de uso de memoria y hardware de ejecución: mediciones en un Mac Studio M5 Ultra de 96 GB (commit 8db1d1d de ds4, con modificaciones locales, datos truncados en la ficha) y en un M4 Max de 64 GB (49,44 GiB con `--ctx 8192` para la variante no abliterated). No hay datos de tokens por segundo: no disponible.

## Requisitos de hardware

- Memoria residente de pesos: 47,96 GiB; el fichero completo pesa 143,3 GiB y debe alojarse en un SSD local rápido (incluye la tabla n-gram de 95,37 GiB leída desde disco).
- Uso total de memoria (pesos + KV cache + buffers, con `--prefill-chunk 1024`): ≈49 GiB a ctx 8192, ≈50 GiB a ctx 32768, ≈54 GiB a ctx 131072. Con `--prefill-chunk 8192` añade unos 6 GiB.
- Hardware objetivo: Mac con 64 GB de memoria unificada (Apple Silicon); mediciones realizadas en Mac Studio M5 Ultra 96 GB y M4 Max 64 GB. No aplicable a GPU NVIDIA convencionales con este formato.
- Runtime: exclusivamente ds4 (DwarfStar) con lector nativo BF16 n-gram; compilable desde el repositorio de antirez (`make`). No se espera que cargue en llama.cpp, Ollama, vLLM, TGI u otros runtimes (no probado); las builds antiguas que esperan `--ple` no pueden cargarlo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato/runtime | Licencia | Particularidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-DS4-Mixed-Q3-64GB-abliterated-v2 | 181,56 B (MoE) | GGUF DS4 (ds4 exclusivo) | qwen-community-license-1.0 | Abliterated v2, mixta Q3, tabla n-gram, MTP, visión opcional |
| Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF (upstream) | 181,56 B | GGUF estándar (Q8_0, etc.) | qwen-community-license-1.0 | Abliterated v2 original, mayor VRAM en Q8_0 |
| Krissaito470/Qwen3.8-Flash-Next-DS4-Mixed-Q3 (no abliterated) | 181,56 B | GGUF DS4 | qwen-community-license-1.0 | Mismo layout y memoria, sin abliteration |

Otras alternativas comparables: no disponible.

## Limitaciones y advertencias

- Modelo abliterated: el comportamiento de rechazo está deliberadamente debilitado y puede generar contenido sensible, controvertido o inapropiado. No apto para todos los públicos (incluidos menores) ni para entornos que exijan alta seguridad.
- El usuario asume toda la responsabilidad legal y ética del uso; el autor upstream desaconseja su uso directo en aplicaciones comerciales de cara al público.
- Sin garantías de seguridad: se ofrece tal cual, sin garantía, y no está afiliado ni respaldado por Qwen, Alibaba, Huihui, Unsloth, antirez ni Ivan Fioravanti.
- Es una cuantización, no una copia sin pérdidas: la calidad puede diferir del modelo en precisión completa.
- Compatibilidad de runtime muy restringida: solo ds4 con lector BF16 n-gram nativo; no se espera que funcione en otros runtimes.
- Requiere SSD local rápido para la tabla n-gram de 95,37 GiB; el rendimiento de E/S afecta directamente a la inferencia.
- No se evaluó el comportamiento de rechazo de la versión v2; el énfasis de la abliterated cambió respecto a la v1 y ningún experto fue abliterated.
- Idiomas soportados, soporte de tool calling y benchmarks: no disponibles; el riesgo de alucinación inherente al modelo base no está documentado.
- Licencia qwen-community-license-1.0: revisar sus términos antes de cualquier uso comercial.

## Enlaces

- Ficha del modelo: https://huggingface.co/Krissaito470/Qwen3.8-Flash-Next-DS4-Mixed-Q3-64GB-abliterated-v2
- Modelo base (abliterated v2): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Ficha de la versión mixta no abliterated: https://huggingface.co/Krissaito470/Qwen3.8-Flash-Next-DS4-Mixed-Q3
- GGUF original de antirez: https://huggingface.co/antirez/qwen3.8-flash-next-gguf
- Repositorio del runtime ds4: https://github.com/antirez/ds4.git
