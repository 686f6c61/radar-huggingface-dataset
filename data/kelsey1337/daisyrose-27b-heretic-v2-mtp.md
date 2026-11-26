# kelsey1337/DaisyRose-27B-Heretic-v2-MTP

## Resumen

DaisyRose-27B-Heretic-v2-MTP es un checkpoint de 27.781 millones de parámetros derivado de RadixArk/DaisyRose-27B, una variante de la familia Qwen (etiquetada internamente como `qwen3_5` y `qwen3.8` en los metadatos del repositorio) con un proceso de *abliteration* aplicado. El autor, kelsey1337, publica esta versión para corregir un defecto concreto de la cadena de conversión: el pipeline de guardado de "Heretic" eliminó las 15 tensores `mtp.*` al escribir el checkpoint abliterado, pese a que la configuración seguía declarando `mtp_num_hidden_layers: 1`. Este repositorio restaura esos tensores sin modificar, copiados byte a byte del checkpoint original RadixArk/DaisyRose-27B.

La relevancia técnica del modelo no está en una mejora de capacidades, sino en la recuperación de la cabeza de predicción multi-token (MTP) que habilita la decodificación especulativa autoinducida en llama.cpp mediante `--spec-type draft-mtp`. Sin esa cabeza, el checkpoint abliterado perdía la capacidad de acelerar la inferencia por especulación interna. El resultado es un checkpoint fusionado con 1.199 tensores y un conjunto de nombres idéntico al del modelo original.

El modelo se distribuye bajo licencia Apache-2.0, en formato safetensors, con un tamaño de repositorio de 55,6 GB (lo que corresponde aproximadamente a pesos en BF16). No se han publicado datos sobre idiomas soportados, benchmarks ni pipeline de inferencia declarado. Es un artefacto de nicho orientado a usuarios que ya trabajan con la familia DaisyRose/Qwen y necesitan combinar el comportamiento abliterado con decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con cabeza MTP (config `qwen3_5` / `qwen3.8` según metadatos) |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | No aplica (no es MoE según los datos disponibles) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 en el repo principal; GGUF (BF16, cuantizaciones y mmproj) en el repo MTP-GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo principal); GGUF (repo secundario) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de aproximadamente 27,8 B de parámetros, heredado de RadixArk/DaisyRose-27B y, por trazabilidad, de la familia Qwen. El elemento distintivo es la presencia de una cabeza de predicción multi-token (MTP) con una capa oculta (`mtp_num_hidden_layers: 1`), que permite al modelo predecir varios tokens por paso y sirve como mecanismo de decodificación especulativa integrada. El checkpoint fusionado contiene 1.199 tensores: los 1.184 del checkpoint abliterado más los 15 tensores `mtp.*` restaurados desde el modelo original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El proceso de *abliteration* (eliminación de direcciones de rechazo en el espacio de activaciones) se aplicó únicamente al tronco del modelo, no a la cabeza MTP, de modo que los tensores restaurados son idénticos a los del checkpoint original. No se documentan otras innovaciones técnicas más allá de la propia MTP.

## Capacidades

- Generación de texto autoregresiva propia de un modelo denso de ~27,8 B de parámetros.
- Decodificación especulativa autoinducida mediante la cabeza MTP, explotable en llama.cpp con `--spec-type draft-mtp`.
- Comportamiento abliterado: el proceso de *abliteration* elimina las direcciones de rechazo, por lo que el modelo tiende a responder sin las negativas alineadas del modelo base.
- Soporte multimodal potencial: el repo GGUF incluye un archivo `mmproj`, lo que sugiere capacidad de proyección visual, aunque no se detalla en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo *thinking* explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia acelerada en local con llama.cpp: cargando la build GGUF y activando `--spec-type draft-mtp`, se aprovecha la cabeza MTP para decodificación especulativa sin necesidad de un modelo borrador separado, reduciendo la latencia por token en hardware de consumo.
- Investigación sobre *abliteration*: permite estudiar el efecto de la eliminación de direcciones de rechazo en un modelo de 27,8 B comparándolo directamente con el checkpoint RadixArk original, ya que el conjunto de tensores y nombres es idéntico.
- Evaluación de decodificación especulativa: sirve como banco de pruebas para medir la ganancia de throughput de MTP frente a decodificación estándar en un modelo denso de este tamaño.
- Despliegue de asistentes sin restricciones de contenido alineadas: para entornos de investigación donde se requiere estudiar el comportamiento del modelo sin las capas de rechazo, con la advertencia de que esto implica riesgos de contenido.
- Generación de texto de propósito general en pipelines propios: al ser un modelo denso de 27,8 B con licencia Apache-2.0, puede integrarse en servicios de generación donde se prefiera un checkpoint abliterado.
- Reproducción y auditoría de checkpoints: útil para verificar que la restauración de la cabeza MTP no altera el resto de pesos, dado que el conjunto de nombres coincide exactamente con el del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de contexto y caché KV; requiere GPUs de 80 GB (A100, H100) o múltiples GPUs.
- Cuantizaciones GGUF: el repo MTP-GGUF publica BF16 y cuantizaciones, lo que permite reducir el requisito de VRAM por debajo de los 55,6 GB según el nivel de cuantización elegido (los valores concretos no están disponibles en la información proporcionada).
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16; GPUs de consumo (RTX 4090 de 24 GB) solo viables con cuantizaciones agresivas o descarga parcial a CPU.
- Despliegue: llama.cpp es la vía documentada explícitamente (soporte de `--spec-type draft-mtp`). vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles; la ganancia de MTP depende del hardware y de la tasa de aceptación de tokens especulados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | MTP | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-Heretic-v2-MTP | 27,78 B | No disponible | Apache-2.0 | Sí (restaurada) | Checkpoint abliterado con cabeza MTP reparada |
| kelsey1337/DaisyRose-27B-Heretic-v2 | ~27,78 B | No disponible | Apache-2.0 | No (eliminada en el guardado) | Mismo tronco abliterado, sin decodificación especulativa |
| RadixArk/DaisyRose-27B | ~27,78 B | No disponible | Apache-2.0 | Sí (original) | Modelo base sin abliterar |

## Limitaciones y advertencias

- El proceso de *abliteration* elimina las direcciones de rechazo del tronco; el modelo puede generar contenido que el modelo base rechazaría, con implicaciones éticas y de seguridad en producción.
- Riesgo de alucinación inherente a un modelo de ~27,8 B sin datos de benchmarks que permitan acotarlo.
- No hay información sobre sesgos, idiomas soportados ni evaluación de calidad, lo que impide garantizar su comportamiento en dominios concretos.
- La ventana de contexto no está documentada; no debe asumirse un valor concreto sin verificarlo en la configuración del modelo.
- La licencia Apache-2.0 permite uso comercial, pero el comportamiento abliterado puede incumplir políticas de contenido de plataformas o normativa aplicable; la responsabilidad recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria; conviene auditar los pesos antes de usarlo en producción.
- La decodificación especulativa MTP en llama.cpp requiere una build que soporte `--spec-type draft-mtp`; versiones antiguas no funcionarán.
- El modelo se publicó con fecha de creación 2026-11-26, posterior a la fecha de referencia habitual; verificar la integridad del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2-MTP
- Checkpoint abliterado previo: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2
- Modelo base original: https://huggingface.co/RadixArk/DaisyRose-27B
- Builds GGUF con soporte MTP: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2-MTP-GGUF
