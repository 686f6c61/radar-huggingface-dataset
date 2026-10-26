# eigentom/nanocode-sft-checkpoint-archive

## Resumen

`eigentom/nanocode-sft-checkpoint-archive` es un repositorio de archivo de checkpoints, no un modelo individual. Lo mantiene el usuario eigentom y conserva dos repositorios de checkpoints originales junto con cinco modelos finales de la v11, inicializados de forma independiente y entrenados durante una época. El repositorio ocupa 110,7 GB y organiza los pesos bajo `runs/<run>/checkpoints/<checkpoint>/`.

Los checkpoints subyacentes proceden de procesos de SFT sobre MiniCPM5-2B-Midtrain, segun se deduce de los repositorios enlazados: `nanocode-sft-mix-run1-v3` se describe como un SFT completo de una época sobre la mezcla filtrada Run1 v3, y `LingweiGu/nanocode-sft-r01-openswe-success` parte de `nanocode_sft_60b` checkpoint-8900, definido como MiniCPM5-2B-Midtrain tras SFT sobre la mezcla oficial UltraData.

Su relevancia no es el despliegue directo, sino la reproducibilidad: incluye `MANIFEST.json` con hashes por byte, snapshots de origen fijados y bundles de Git, y mantiene inmutable el contenido histórico. La licencia no está declarada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No documentada en la información disponible; la carga mediante `AutoModelForCausalLM` indica un modelo de lenguaje causal. Modelo base citado: MiniCPM5-2B-Midtrain |
| Parámetros totales | No confirmado. El modelo base es MiniCPM5-2B (aprox. 2.000 millones según el nombre). El repositorio `nanocode_sft_60b` incluye «60b» en el nombre, pero la información no aclara a qué se refiere |
| Parámetros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se documentan variantes GGUF, AWQ ni GPTQ; los pesos se publican en `safetensors` |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card indica que las licencias y restricciones de uso de las fuentes originales siguen aplicándose |
| Formato de pesos | `safetensors`, organizados por subcarpetas de checkpoint |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: es un contenedor de estados de entrenamiento. Los checkpoints archivados corresponden a ejecuciones de SFT de una época sobre MiniCPM5-2B-Midtrain, con mezclas de datos identificadas como Run1 v3 filtrada y UltraData SFT mixture. Cada ejecución se almacena en `runs/<run>/checkpoints/<checkpoint>/` y se puede cargar con `snapshot_download` usando `allow_patterns` o con el parámetro `subfolder` de Transformers.

La innovación es de infraestructura, no de modelado: el archivo conserva hashes por byte, snapshots de origen fijados y bundles de Git en `MANIFEST.json`, y añade ejecuciones posteriores mediante un commit padre fijado, manteniendo inmutable el contenido histórico. Los datos de entrenamiento, las trayectorias de evaluación en bruto y las auditorías internas detalladas se guardan en una copia de seguridad privada separada, por lo que no son inspeccionables desde el repositorio público. No se documentan detalles de RLHF, DPO ni de composición exacta del dataset.

## Capacidades

- Generación de texto autoregresiva a través de Transformers, usando `AutoModelForCausalLM` y `AutoTokenizer` sobre el checkpoint seleccionado.
- Reutilización de pesos («weight-only reuse») para inferencia, según se indica explícitamente en `nanocode_sft_60b`.
- Punto de partida para fine-tuning adicional: el repositorio `LingweiGu/nanocode-sft-r01-openswe-success` lo usa como estado inicial.
- Archivado y comparación de múltiples ejecuciones de SFT (v11, Run1 v3, UltraData).
- Capacidades de tool calling, function calling, agentes, visión o audio: no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible; no se declaran idiomas.

## Casos de uso

- Reproducibilidad de experimentos de SFT: descargar un checkpoint concreto con `snapshot_download` y `allow_patterns`, verificar su hash en `MANIFEST.json` y repetir la evaluación sobre exactamente los mismos pesos.
- Reutilización de pesos para inferencia: cargar un checkpoint final con Transformers en modo `subfolder` para servir un modelo de aproximadamente 2B sin reentrenar.
- Punto de partida para nuevos ajustes: usar un checkpoint como estado inicial de un SFT posterior, tal como hace `LingweiGu/nanocode-sft-r01-openswe-success` partiendo de `checkpoint-8900`.
- Auditoría de ejecuciones: comparar los cinco modelos v11 inicializados de forma independiente para estudiar la varianza entre inicializaciones con la misma mezcla de datos.
- Investigación sobre mezclas de datos: contrastar los checkpoints entrenados con Run1 v3 filtrada frente a los entrenados con UltraData SFT mixture.
- Archivado a largo plazo: conservar bundles de Git y hashes por byte como registro verificable de un run distribuido, incluso cuando los shards originales ya no estén disponibles.
- Evaluación de un modelo pequeño en hardware modesto: desplegar un checkpoint de ~2B en una GPU de consumo para tareas de generación de texto, siempre que se valide previamente su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los requisitos siguientes son estimaciones para un modelo de aproximadamente 2.000 millones de parámetros; no están confirmados en la información del repositorio.
- VRAM en bf16/fp16: en torno a 4-5 GB solo para pesos, más caché KV; presupuestar 6-8 GB para contextos moderados.
- VRAM en int8: aproximadamente 2-3 GB de pesos.
- VRAM en int4: aproximadamente 1,2-2 GB de pesos (requiere conversión propia, ya que no se publican GGUF).
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090. En GPUs de 8 GB conviene cuantizar.
- GPU de数据中心: A100, H100 o L40S son válidas pero sobredimensionadas para un modelo de este tamaño.
- Despliegue: Transformers es la vía documentada. vLLM, TGI, llama.cpp u Ollama requerirían conversión o soporte no documentado.
- Almacenamiento: el repositorio completo ocupa 110,7 GB; conviene descargar solo el checkpoint necesario mediante `allow_patterns`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas son valores públicos de referencia y no se han verificado en esta búsqueda; los del modelo archivado figuran como no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nanocode-sft-checkpoint-archive | ~2B (base MiniCPM5-2B), no confirmado | No disponible | No disponible | HuggingFace, archivo de checkpoints |
| MiniCPM5-2B-Midtrain | ~2B | No disponible | No disponible | Modelo base citado en los repositorios |
| Qwen2.5-3B | ~3,1B | 32k nativo | Apache 2.0 | Pesos abiertos |
| Gemma-2-2B | ~2,6B | 8k | Gemma Terms | Pesos abiertos con condiciones |
| Phi-3-mini | ~3,8B | 4k (variante 128k) | MIT | Pesos abiertos |

## Limitaciones y advertencias

- La licencia no está declarada; no se puede confirmar el uso comercial sin consultar las licencias de las fuentes originales, que la model card indica que siguen aplicándose.
- Es un archivo de checkpoints, no un modelo único listo para producción: hay que seleccionar explícitamente qué checkpoint cargar.
- En `nanocode_sft_60b` los shards del estado completo no estaban disponibles al archivar; los ficheros sirven para inferencia y reutilización de pesos, no para continuar exactamente el run distribuido original.
- Los datos de entrenamiento y las auditorías internas son privados, por lo que no se puede auditar la composición del dataset ni filtrar duplicados o contenido problemático.
- No se declaran idiomas soportados; el rendimiento fuera del inglés es desconocido.
- Al derivar de MiniCPM5-2B, hereda los sesgos y el riesgo de alucinación del modelo base, agravados por un SFT del que no se publican evaluaciones.
- Los checkpoints intermedios o de una sola época pueden estar infraentrenados; no se han publicado métricas que permitan descartarlo.
- El tamaño del repositorio (110,7 GB) implica un coste de almacenamiento y de ancho de banda considerable si se descarga completo.

## Enlaces

- Repositorio principal: https://huggingface.co/eigentom/nanocode-sft-checkpoint-archive
- Checkpoint base SFT: https://huggingface.co/eigentom/nanocode_sft_60b
- Ejecución Run1 v3: https://huggingface.co/eigentom/nanocode-sft-mix-run1-v3
- Fine-tuning derivado: https://huggingface.co/LingweiGu/nanocode-sft-r01-openswe-success
- Dataset de la etapa 1: https://huggingface.co/datasets/eigentom/minicpm5-sft-stage1-910c-pub
- Repositorio de código y datos: https://github.com/lingwei-gu/nanocode
