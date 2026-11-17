# myanvoos/Inkling-2-Small-EXL3-Sparks

## Resumen

Inkling-2-Small-EXL3-Sparks es un repositorio de packs de pesos cuantizados derivados de `thinkingmachines/Inkling-2-Small`, publicado por el usuario myanvoos. No se trata de un modelo entrenado de forma independiente, sino de una publicacion de artefactos de cuantizacion EXL3 (trellis de 6 bits) pensados para el stack de serving EXL3 de Inkling-2-Small. El repositorio contiene dos packs opcionales: uno denso de 4,29 GB y otro para el cabezal draft DSpark de 0,56 GB, acompanados de checksums, manifiestos, metadatos por tensor y trazabilidad de construccion.

El modelo base Inkling-2-Small pertenece a Thinking Machines y esta bajo licencia Apache-2.0. La propuesta de este repositorio es reducir el coste de memoria y mejorar el rendimiento del motor de inferencia al ejecutar las lineales no expertas (atención q/k/v/r/gate/o, router y LM head) mediante el camino EXL3 en lugar de bf16, y al cuantizar tambien el cabezal draft de decodificacion especulativa.

La relevancia es practica: estos packs permiten desplegar Inkling-2-Small en entornos con memoria limitada, como una DGX Spark, manteniendo el pipeline de decodificacion especulativa con el draft DSpark. El repositorio no documenta arquitectura completa, contexto, idiomas ni benchmarks del modelo base, por lo que la ficha se limita a lo verificable en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: transformer, segun el nombre del proyecto; no confirmado en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 6 bits (trellis, mul1) para lineales densas y cabezal draft; el checkpoint EXL3 de referencia se menciona como `2.59bpw` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (packs EXL3); metadatos en `.safetensors.json`, `model.safetensors.index.json`, `manifest.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo nuevo: publica dos packs de pesos derivados de `thinkingmachines/Inkling-2-Small`. El pack `dense-exl3-q6/` (4,29 GB) contiene las lineales no expertas del modelo base (atención q/k/v/r/gate/o, el router y el LM head) cuantizadas a trellis EXL3 de 6 bits (mul1), de modo que el motor las ejecuta por su camino EXL3 en lugar de bf16. El pack `draft-q6/` (0,56 GB) contiene el cabezal draft DSpark (`mtp.safetensors`) tambien en EXL3 de 6 bits, para las logits base y proyecciones del draft.

La construccion del pack denso se realizo a partir de los tensores densos bf16 de la release original, y el pack draft a partir del `mtp.safetensors` de la release. El repositorio incluye `PROVENANCE.json` (solo en el pack denso) con datos de calibracion, captura de Hessian, ajustes del cuantizador y errores por tensor, ademas de `manifest.json` con el registro de cuantizacion por tensor (bits, errores, tiempos). No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Inferencia del modelo base Inkling-2-Small a traves del stack EXL3, con lineales densas ejecutadas en 6 bits.
- Decodificacion especulativa mediante el cabezal draft DSpark, cuantizado en el pack `draft-q6/`.
- Verificacion de integridad de pesos mediante `SHA256SUMS` y `MD5SUMS` (este ultimo solo en el pack draft).
- Inspeccion por tensor de formas y dtypes a traves de los archivos `.safetensors.json`.
- Uso opcional e independiente de cada pack: sin el pack denso el motor usa bf16 (mas memoria, mas lento); sin el pack draft el DSpark cae a proyecciones bf16.
- Capacidades especificas del modelo base (texto, codigo, matematicas, tool calling, vision, multilingue): no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en DGX Spark: el repositorio esta etiquetado explicitamente para `dgx-spark`; los packs reducen la huella de memoria de las lineales densas y del draft, lo que permite ejecutar Inkling-2-Small en un nodo con memoria unificada limitada.
- Serving con decodificacion especulativa: el pack `draft-q6/` mantiene el cabezal DSpark en 6 bits, de modo que el motor puede seguir usando decodificacion especulativa sin cargar las proyecciones del draft en bf16.
- Reduccion de VRAM en inferencia: al sustituir las lineales de atención, router y LM head por trellis EXL3 de 6 bits, se libera memoria que puede destinarse a cache KV o a mayor batch.
- Auditoria de cuantizacion: `manifest.json` y `PROVENANCE.json` permiten revisar bits, errores por tensor, datos de calibracion y ajustes del cuantizador antes de adoptar el pack en produccion.
- Integridad en pipelines de CI/CD: los `SHA256SUMS` permiten verificar los binarios descargados en un pipeline automatizado antes de desplegarlos.
- Reconstruccion de una vista nativa: el script `make_native_view.py` documentado en la model card permite combinar el checkpoint EXL3 de referencia (`2.59bpw`), los tensores nativos y ambos packs para generar una vista lista para el motor.
- Evaluacion comparativa de cuantizaciones: al ser packs opcionales, un equipo puede medir latencia y memoria con y sin ellos sobre el mismo checkpoint EXL3 de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada. Los packs suman 4,29 GB (denso) + 0,56 GB (draft) = 4,85 GB, pero el total del modelo requiere ademas los tensores expertos y el checkpoint EXL3 de referencia (`2.59bpw`), cuyo tamano no se detalla.
- GPU recomendadas: el repositorio esta etiquetado para `dgx-spark`; no se indican otras GPU en la informacion.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: stack de serving EXL3 del proyecto, con el script `scripts/make_native_view.py` para construir la vista nativa; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo indica de forma cualitativa que sin el pack denso el motor usa bf16 ("mas memoria, mas lento").

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento del modelo base o de otras cuantizaciones de Inkling-2-Small.

## Limitaciones y advertencias

- No es un modelo independiente: es un conjunto de packs de pesos derivados; requiere el modelo base `thinkingmachines/Inkling-2-Small` y el checkpoint EXL3 de referencia (`2.59bpw`) para funcionar.
- Solo cubre lineales no expertas y el cabezal draft; los tensores expertos no forman parte de estos packs.
- La cuantizacion a 6 bits introduce error numerico por tensor; el repositorio registra esos errores en `manifest.json` y `PROVENANCE.json`, pero no se aportan evaluaciones de calidad downstream.
- Los packs son opcionales: sin el denso se pierde el ahorro de memoria y velocidad; sin el draft se pierde la decodificacion especulativa en 6 bits.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-16); no hay evidencia de uso en produccion.
- Idiomas soportados, sesgos y riesgo de alucinacion del modelo base: no disponibles en la informacion.
- Licencia Apache-2.0 declarada tanto en el repositorio como en el modelo base; no se detallan restricciones adicionales, pero conviene verificar la licencia del modelo base y del checkpoint EXL3 de referencia antes de uso comercial.
- El repositorio excluye los binarios `.safetensors` del control de versiones (`.gitignore`), por lo que deben descargarse desde Hugging Face y verificarse con `SHA256SUMS`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/myanvoos/Inkling-2-Small-EXL3-Sparks
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
