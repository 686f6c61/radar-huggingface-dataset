# j2ipper/draft-vocab

## Resumen

`j2ipper/draft-vocab` no es un modelo de lenguaje, sino una coleccion de cuatro ficheros de vocabulario reducido (*draft vocabularies*) para decodificacion especulativa. Cada fichero contiene 65.536 identificadores de token del tokenizer de un modelo concreto, en formato binario little-endian int32 ordenado ascendentemente (256 KiB por fichero), compatible con el flag `--spec-draft-vocab` de llama.cpp y con el motor Talus. El autor es `j2ipper` y el repositorio se publico en octubre de 2026 con licencia por fichero (*per-file*).

El problema que resuelve es el coste de la capa de salida del modelo borrador (*drafter*) en decodificacion especulativa. En lugar de calcular logits sobre el vocabulario completo (a menudo 128K-256K tokens), el borrador solo proyecta sobre los 65.536 ids del fichero, lo que abarata cada paso de borrador. El modelo objetivo sigue verificando cada borrador contra su vocabulario completo, de modo que la salida final no cambia: el vocabulario reducido solo afecta a la tasa de aceptacion de borradores.

Los cuatro ficheros cubren los tokenizers de Qwen3.8-27B (usado por los drafters MTP y DFlash2 de Talus), GLM-5.3-Flash (drafter NextN), MiMo-V2.6-Flash-MOPD (drafter DFlash) y Laguna-S-2.1 (no usado por el prompt-lookup de Talus; pensado para drafters DFlash en otros motores). Es relevante para quienes despliegan inferencia especulativa con llama.cpp o Talus y quieren reducir latencia sin tocar la calidad de la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (artefacto de datos: lista de token ids, no red neuronal) |
| Parametros totales | no disponible (no es un modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (los ficheros no contienen texto) |
| Licencia | per-file: Apache-2.0 (qwen), MIT (glm), MIT (mimo), OpenMDW-1.1 (laguna); receta MIT |
| Formato de pesos | binario: int32 little-endian, 65.536 ids ordenados ascendente, 256 KiB por fichero |

## Arquitectura y entrenamiento

No hay arquitectura de red: cada fichero es una lista ordenada de 65.536 identificadores de token del tokenizer del modelo correspondiente, en el formato de vocabulario reducido de llama.cpp. Se incluyen siempre todos los tokens especiales (no normales) del tokenizer, y el resto se completa con los tokens normales mejor rankeados hasta llegar a 65.536.

La construccion la realiza `recipe/make_vocab.py` (licencia MIT), que lee el tokenizer desde el GGUF del modelo y ordena los tokens normales por frecuencia ponderada sobre cuatro corpus tokenizados: texto agentico generado por modelo (peso 0,4), documentacion y prosa (0,25), codigo fuente (0,2) y Python (0,15). Los corpus se dividieron 80/20 para comprobar la cobertura sobre texto retenido. Los corpus son privados y no se publican; los ficheros solo contienen el conjunto ordenado de ids, sin texto ni frecuencias. Cada fichero esta listado en `SHA256SUMS`.

## Capacidades

- Proporciona un vocabulario reducido de 65.536 ids para la capa de salida de un drafter en decodificacion especulativa, reduciendo el coste por paso de borrador.
- Compatible con llama.cpp mediante `--spec-draft-vocab` y con el motor Talus (flags `--spec-draft-vocab` y `--draft-vocab`).
- Integra los tokens especiales del tokenizer de origen, lo que evita romper el manejo de tokens de control durante el borrado.
- Cobertura especifica por modelo: Qwen3.8-27B, GLM-5.3-Flash, MiMo-V2.6-Flash-MOPD y Laguna-S-2.1.
- No altera la salida del modelo objetivo: la verificacion se hace contra el vocabulario completo.
- No realiza generacion, razonamiento, codigo ni tool calling por si mismo; es un artefacto auxiliar de inferencia.

## Casos de uso

- Despliegue de Qwen3.8-27B con Talus en modo especulativo: se pasa `--spec-draft-vocab /models/qwen-dv-65536.bin` para que los drafters MTP y DFlash2 proyecten solo sobre 65.536 ids, reduciendo el coste de la capa de salida del borrador.
- Servicio de GLM-5.3-Flash con drafter NextN: se usa `--draft-vocab /models/glm-dv-65536.bin` para abaratar cada paso de borrador manteniendo la verificacion completa del objetivo.
- Inferencia de MiMo-V2.6-Flash con drafter DFlash: se emplea `--spec-draft-vocab /models/mimo-dv-65536.bin` en pipelines de Talus que ya usan decodificacion especulativa.
- Drafters DFlash en otros motores con Laguna-S-2.1: `laguna-dv-65536.bin` esta pensado para motores distintos del prompt-lookup de Talus, alli donde se implemente un drafter DFlash sobre ese tokenizer.
- Ajuste de latencia en produccion: al reducir el calculo de la capa de salida del borrador, se puede aumentar el numero de tokens borrador por paso o mantenerlo con menor coste, segun la tasa de aceptacion observada.
- Reproducibilidad y auditoria: los ficheros incluyen SHA-256 en `SHA256SUMS` y una receta reproducible (`recipe/make_vocab.py`) para regenerar vocabularios con otros corpus o tamanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de aceptacion, speedups ni metricas de latencia para ninguno de los cuatro ficheros.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica al artefacto; depende del modelo servido (Qwen3.8-27B, GLM-5.3-Flash, MiMo-V2.6-Flash-MOPD o Laguna-S-2.1) y de su cuantizacion.
- GPU recomendadas: no disponibles para este artefacto; vienen determinadas por el modelo objetivo y el drafter.
- Cabe en GPU consumer: el fichero en si ocupa 256 KiB y se carga en memoria del host; el requisito real lo marca el modelo servido.
- Opciones de despliegue: llama.cpp (flag `--spec-draft-vocab`) y Talus (flags `--spec-draft-vocab` y `--draft-vocab`).
- Latencia y throughput: no disponibles; el efecto depende de la tasa de aceptacion de borradores, que la model card no cuantifica.

## Comparativa con modelos similares

| Artefacto | Modelo de origen | Tokens en vocabulario | Formato | Licencia |
|---|---|---|---|---|
| `qwen-dv-65536.bin` | Qwen3.8-27B | 65.536 | int32 LE, 256 KiB | Apache-2.0 |
| `glm-dv-65536.bin` | GLM-5.3-Flash | 65.536 | int32 LE, 256 KiB | MIT |
| `mimo-dv-65536.bin` | MiMo-V2.6-Flash-MOPD | 65.536 | int32 LE, 256 KiB | MIT |
| `laguna-dv-65536.bin` | Laguna-S-2.1 | 65.536 | int32 LE, 256 KiB | OpenMDW-1.1 |

No se dispone de informacion sobre otros vocabularios reducidos publicados para estos tokenizers con los que comparar cobertura o tasa de aceptacion.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni ejecuta tareas; solo sirve como auxiliar de decodificacion especulativa.
- La tasa de aceptacion de borradores no se publica; el beneficio real en latencia es desconocido y debe medirse en cada despliegue.
- Los corpus de ranking son privados y no se publican, por lo que la cobertura del vocabulario no es auditable mas alla de la receta.
- Cada fichero esta atado al tokenizer de un modelo concreto; usarlo con otro tokenizer produce ids invalidos o un rendimiento degradado.
- La licencia es por fichero y hereda la del modelo de origen: Apache-2.0, MIT y OpenMDW-1.1. El uso comercial exige revisar cada licencia por separado, incluida la copia de OpenMDW-1.1 en `LICENSE-OpenMDW-1.1.md`.
- `laguna-dv-65536.bin` no lo usa el prompt-lookup de Talus; su utilidad depende de que otro motor implemente un drafter DFlash sobre Laguna-S-2.1.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/j2ipper/draft-vocab
- Licencias del repositorio: https://huggingface.co/j2ipper/draft-vocab/blob/main/README.md#licenses
- Talus (repositorio publico): https://github.com/nsbradley88/talus-public
- Documentacion de modelos de Talus: https://github.com/nsbradley88/talus-public/blob/main/docs/MODELS.md
- Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash
- MiMo-V2.6-Flash-MOPD: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Laguna-S-2.1: https://huggingface.co/poolside/Laguna-S-2.1
