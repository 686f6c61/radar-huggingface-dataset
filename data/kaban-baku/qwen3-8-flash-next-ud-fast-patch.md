# kaban-baku/Qwen3.8-Flash-Next-UD-Fast-patch

## Resumen

Qwen3.8-Flash-Next UD Fast patch es un parche de pesos en formato GGUF, de aproximadamente 2 GiB, que modifica las cuantizaciones UD (Dynamic v3.1) publicadas por Unsloth para el modelo Qwen3.8-Flash-Next. El parche sustituye las matrices situadas fuera de los expertos (atención, salida del SSM y expertos compartidos) por las equivalentes del repositorio GSQ-RCO de ISTA-DASLab, del mismo modelo base, sin recuantizar los bytes. El objetivo es liberar entre 0,9 y 1,2 GiB de VRAM en GPUs de 8 GB para que el motor Strata pueda mantener más expertos en caché y aumentar la velocidad de decodificación.

El modelo subyacente, Qwen3.8-Flash-Next, es una arquitectura híbrida de atención y SSM con mezcla de expertos (MoE) y 512 expertos, desarrollada por Qwen. El parche no altera el router, la cabeza de salida, las hiperconexiones ni los expertos: solo intercambia 348 matrices no expertas. Según las mediciones del autor en una RTX 3070 Ti Laptop de 8 GB, la decodificación pasa de 47,7 a 56,0 tok/s sobre UD-IQ1_M (variante `ga`) y de 35,9 a 47,8 tok/s sobre UD-IQ2_XS (variante `gm`), con una variación de calidad mínima en evaluaciones sin modo thinking.

Es relevante porque permite ejecutar un MoE de 512 expertos en hardware de consumo con un rendimiento notablemente superior, sin necesidad de modificar el motor de inferencia. No obstante, el propio autor advierte de que el modo thinking se degrada: en una preprueba de 30 preguntas, el número de respuestas que agotaron el presupuesto de razonamiento por bucles repetitivos aumentó respecto a los ficheros originales de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y SSM, mezcla de expertos (MoE) con 512 expertos; hiperconexiones y PLE |
| Parametros totales | 3.664.773.120 (3,66 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K (según las pruebas del autor; no se especifica el máximo oficial) |
| Tipos de cuantizacion | Parche: IQ2_XS e IQ3_S (matrices no expertas); ficheros base Unsloth: UD-IQ1_M, UD-IQ2_XS, UD-IQ3_XXS, UD-IQ4_XS (no UD-IQ1_S) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (pesos); script `apply_fastpatch.py`: MIT |
| Formato de pesos | GGUF (parche no cargable de forma autónoma; se aplica sobre los GGUF de Unsloth) |

## Arquitectura y entrenamiento

El parche no entrena ni modifica la arquitectura: opera sobre pesos ya cuantizados. El modelo base Qwen3.8-Flash-Next combina capas de atención con capas SSM, un router MoE con 512 expertos, hiperconexiones y PLE (probablemente *parallel layer experts* o componente equivalente, no detallado en la información disponible). Unsloth publica sus ficheros con cuantización Dynamic v3.1, que mantiene las matrices no expertas (atención, salida SSM y expertos compartidos) en Q5_K a Q8_0, ocupando 2,3-2,6 GiB. En una GPU de 8 GB, esas matrices residentes en VRAM reducen el espacio disponible para la caché de expertos.

El parche copia byte a byte 300 matrices desde GSQ-RCO IQ2_XS (variante `ga`) y, opcionalmente, 48 matrices `attn_output` y `ssm_out` desde GSQ-RCO IQ3_S (variante `gm`, mayoritariamente Q6_K). Se verifican nombres y formas, pero no se recuantiza. El resultado se empaqueta con `iq_pack.py` de Strata en modo `--compat-bf16`. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento con modo thinking opcional (con las advertencias de degradación descritas más abajo).
- Ejecución de un MoE de 512 expertos en GPUs de 8 GB mediante el motor Strata, sin parchear el motor.
- Compatibilidad con contexto de 128K tokens según las pruebas del autor.
- Soporte de decodificación especulativa mediante MTP (multi-token prediction), empleado en las mediciones.
- Aplicación del parche con Python 3.8+ y solo biblioteca estándar, con opción `--verify` para comprobar cada tensor.
- Hard-linking de los fragmentos no modificados con `--link`, evitando duplicar espacio en disco.
- Capacidades de tool calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en GPU de 8 GB: aplicar el parche sobre UD-IQ1_M con la variante `ga` permite pasar de 47,7 a 56,0 tok/s en una RTX 3070 Ti Laptop, manteniendo los 512 expertos y sin modificar Strata. Adecuado para estaciones de trabajo con VRAM limitada.
- Despliegue de un MoE grande en portátiles: la variante `gm` sobre UD-IQ2_XS ofrece 47,8 tok/s con una pérdida de calidad mínima (ELYZA 3,95 a 3,93), lo que permite usar el modelo en equipos consumer para tareas de generación y análisis.
- Evaluación comparativa de cuantizaciones: el parche facilita medir el impacto de sustituir matrices no expertas por cuantizaciones más agresivas (IQ2_XS) frente a otras más conservadoras (IQ3_S) con el mismo motor y hardware.
- Investigación sobre caché de expertos: al liberar 0,9-1,2 GiB de VRAM, se puede aumentar el presupuesto residente de expertos (`--resident-budget-gib`) y estudiar el equilibrio entre VRAM, velocidad y calidad.
- Prototipado de pipelines con contexto largo: con 128K de contexto y MTP, el modelo parcheado sirve para procesar documentos extensos en local antes de migrar a infraestructura mayor.
- Reproducibilidad de cuantizaciones: el script `--verify` y la comparación byte a byte con los repositorios completos permiten auditar que el parche no altera tensores ajenos, útil en entornos con requisitos de trazabilidad.
- Integración en flujos de CI para GGUF: el proceso de descarga, aplicación y empaquetado con `iq_pack.py` es reproducible y automatizable, lo que facilita generar variantes "Fast" en pipelines internos.

## Benchmarks y rendimiento

Datos medidos por el autor en RTX 3070 Ti Laptop 8 GB, 64 GB RAM, `--resident-budget-gib 24`, contexto 128K y MTP:

| Entrada | Variante | Decodificación (tok/s) | Calidad (sin thinking) |
|---|---|---|---|
| UD-IQ1_M | `ga` | 47,7 -> 56,0 (+17%, Strata 0.2.12) | Total -0,4%; ELYZA 3,76 -> 3,70 |
| UD-IQ2_XS | `gm` | 35,9 -> 47,8 (+33%, build basada en 0.2.11) | ELYZA 3,95 -> 3,93 |
| UD-IQ2_XS | `ga` | 51,1 | ELYZA 3,86 |
| UD-IQ3_XXS | cualquiera | no medido | no medido |
| UD-IQ4_XS | cualquiera | no medido | no medido |
| GSQ-RCO IQ3_S (512 expertos) | referencia | 20,5-21,3 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el parche libera entre 0,9 y 1,2 GiB (variante `ga`) o entre 0,7 y 1,0 GiB aproximadamente (variante `gm`, 0,2 GiB menos que `ga`) respecto a los ficheros de Unsloth.
- GPU objetivo: 8 GB de VRAM, probado en RTX 3070 Ti Laptop. No se han publicado pruebas en otras GPU.
- RAM del sistema: 64 GB en las mediciones; el autor usa `--resident-budget-gib 24`, lo que sugiere que parte de los expertos residen en RAM.
- Almacenamiento: repositorio de 2,1 GB; los ficheros base de Unsloth se descargan aparte; `--link` evita duplicar los fragmentos no modificados.
- Despliegue: motor Strata (versión 0.2.12 o builds basadas en 0.2.11), con `iq_pack.py` para empaquetar. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 56,0 tok/s (UD-IQ1_M + `ga`) y 47,8 tok/s (UD-IQ2_XS + `gm`) en la configuración indicada.

## Comparativa con modelos similares

| Modelo / variante | Parámetros | Contexto | Decodificación (misma máquina) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next UD-IQ1_M + `ga` | 3,66 mil millones | 128K | 56,0 tok/s | Qwen Community 1.0 | GGUF parcheado |
| Qwen3.8-Flash-Next UD-IQ1_M (Unsloth original) | 3,66 mil millones | 128K | 47,7 tok/s | Qwen Community 1.0 | GGUF |
| Qwen3.8-Flash-Next UD-IQ2_XS + `gm` | 3,66 mil millones | 128K | 47,8 tok/s | Qwen Community 1.0 | GGUF parcheado |
| Qwen3.8-Flash-Next UD-IQ2_XS (Unsloth original) | 3,66 mil millones | 128K | 35,9 tok/s | Qwen Community 1.0 | GGUF |
| Qwen3.8-Flash-Next GSQ-RCO IQ3_S | 3,66 mil millones | 128K | 20,5-21,3 tok/s | Qwen Community 1.0 | GGUF |

No se dispone de datos de benchmarks estándar ni de comparación con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- El parche no es cargable de forma autónoma: requiere los GGUF de Unsloth del mismo modelo base y el motor Strata.
- Solo se han medido UD-IQ1_M y UD-IQ2_XS; UD-IQ3_XXS solo se ha comprobado que aplica limpiamente y UD-IQ4_XS no se ha probado. UD-IQ1_S no es compatible.
- El modo thinking se degrada: en una preprueba de 30 preguntas (JamC-QA 20 + HumanEval 10, temperatura 0), los casos que agotaron el presupuesto por razonamiento repetitivo pasaron de 9 a 16 (UD-IQ1_M + `ga`) y de 13 a 17 (UD-IQ2_XS + `gm`) frente a los originales de Unsloth. La muestra es pequeña y no concluyente.
- Las matrices sustituidas provienen de GSQ-RCO IQ2_XS, que Unsloth reportó con un razonamiento aproximadamente un 49% más largo que BF16.
- Aplicar otro parche que reescriba `ssm_out`, `attn_output` o `ffn_down_shexp` (por ejemplo, una ablación) sobrescribe las matrices ya parcheadas.
- La licencia Qwen Community 1.0 puede imponer restricciones al uso comercial; debe revisarse el fichero `LICENSE` antes de desplegar en producción.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base en la documentación disponible.
- El rendimiento solo está verificado en una RTX 3070 Ti Laptop con 64 GB de RAM; la extrapolación a otras GPU no está respaldada por datos.

## Enlaces

- Repositorio del parche: https://huggingface.co/kaban-baku/Qwen3.8-Flash-Next-UD-Fast-patch
- GGUF base de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- GGUF GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante completa UD-IQ1_M-Fast: https://huggingface.co/kaban-baku/Qwen3.8-Flash-Next-UD-IQ1_M-Fast-GGUF
- Variante completa UD-IQ2_XS-Fast: https://huggingface.co/kaban-baku/Qwen3.8-Flash-Next-UD-IQ2_XS-Fast-GGUF
