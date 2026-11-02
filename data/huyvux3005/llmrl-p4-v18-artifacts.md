# huyvux3005/llmrl-p4-v18-artifacts

## Resumen

`huyvux3005/llmrl-p4-v18-artifacts` no es un modelo de lenguaje, sino un repositorio de artefactos de investigacion que acompanan al paper *Readable but Not Causal: A Pre-Registered Replication of Sparse "Value Neurons" in RL-Tuned Language Models*. Contiene tensores de calibracion (`layer_stats.pt`) que el codigo del paper utiliza para escribir intervenciones en el residual stream de los modelos `hkust-nlp/Qwen-2.5-1.5B-SimpleRL-Zoo` y `hkust-nlp/Qwen-2.5-7B-SimpleRL-Zoo`. Los tensores se calculan a partir de 200 rollouts de entrenamiento y recogen estadisticas por capa (medias, dimensiones masivas, tablas condicionadas por token y medias de primera/ulterior ocurrencia).

El objetivo del proyecto es la interpretabilidad mecanicista: replicar de forma pre-registrada la existencia de "neuronas de valor" dispersas en modelos ajustados con RL y comprobar si esas activaciones masivas tienen un rol causal o son meramente legibles. El repositorio separa los tensores pesados (que no caben en Git) del codigo y de los resultados por problema, que viven en el repositorio GitHub del paper.

Es relevante para investigadores que quieran reproducir los experimentos de ablacion (E1-E4) sin recalcular las estadisticas, o para quienes estudien la relacion entre activaciones masivas y comportamiento en modelos Qwen-2.5 ajustados con RL. No es un modelo desplegable: no hay pesos, no hay tokenizador ni config de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de artefactos, no de modelo) |
| Parametros totales | no disponible (los modelos objetivo son Qwen-2.5 de 1.5B y 7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | tensores PyTorch (`.pt`, cargados con `torch.load(..., weights_only=False)`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia. Los modelos sobre los que operan los tensores son `hkust-nlp/Qwen-2.5-1.5B-SimpleRL-Zoo` y `hkust-nlp/Qwen-2.5-7B-SimpleRL-Zoo`, es decir, variantes de Qwen-2.5 ajustadas con RL (SimpleRL-Zoo). Sobre ellos, el codigo del paper aplica intervenciones en el residual stream guiadas por las estadisticas almacenadas en este repositorio.

Los tensores se calculan a partir de 200 rollouts de entrenamiento y se organizan por ejecucion y seccion del paper. Para E3/E4 (1.5B y 7B, seccion 4.7) incluyen `mean`, `tok_dims`, `tok_table` y `tok_first`, es decir, medias condicionadas por token de las cinco dimensiones masivas. Para E3b (1.5B y 7B) incluyen `occ_dims`, `occ_first` y `occ_rest`, medias de primera ocurrencia y de ocurrencias posteriores. Para E1/E2 (7B, seccion 4.6) incluyen solo `mean`, la media sobre tokens de respuesta. El codigo puede recalcular todos los tensores de forma determinista mediante `colab/run_v18.py`. No se almacenaron los pesos de las sondas de valor; los conjuntos de dimensiones seleccionados estan en el `v18.json` de cada ejecucion.

## Capacidades

- No es un modelo generativo: no produce texto, codigo ni respuestas.
- Proporciona tensores de calibracion para intervenciones de ablation en el residual stream de Qwen-2.5-1.5B y 7B SimpleRL-Zoo.
- Permite reproducir las estadisticas por capa de las cinco dimensiones masivas (medias globales y condicionadas por token).
- Incluye estadisticas separadas para primera ocurrencia y ocurrencias posteriores de tokens (experimento E3b).
- Incluye la media de tokens de respuesta para los experimentos E1/E2 en el modelo de 7B.
- Verificable mediante `SHA256SUMS` antes de su uso.
- Recalculable de forma determinista con el codigo del paper.
- No soporta tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Replicacion de experimentos de ablation: colocar cada `layer_stats.pt` en la ruta correspondiente bajo `kaggle/outputs/colab-p4-v18-20261101/` y ejecutar el codigo del paper para reproducir E1-E4 sin recalcular las estadisticas desde los 200 rollouts.
- Auditoria de resultados publicados: verificar con `SHA256SUMS` que los tensores usados en la replicacion coinciden con los del paper antes de comparar con los resultados por problema del repositorio GitHub.
- Estudio de activaciones masivas: analizar las cinco dimensiones masivas y su distribucion por capa en modelos Qwen-2.5 ajustados con RL para investigar si son legibles pero no causales.
- Analisis de primera vs. ulterior ocurrencia: usar los tensores `occ_*` de E3b para estudiar como cambia la media de activacion entre la primera aparicion de un token y las siguientes.
- Recalculo determinista: ejecutar `colab/run_v18.py` para regenerar los tensores y contrastar la reproducibilidad del pipeline de calibracion.
- Base para nuevas intervenciones: reutilizar las estadisticas por capa como referencia al disenar ablaciones sobre el residual stream en variantes de Qwen-2.5 con RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene artefactos de calibracion, no evaluaciones de rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que inferir en este repositorio.
- GPU recomendadas: no aplica para el uso de los tensores; el recalculo con `colab/run_v18.py` requiere ejecutar los modelos Qwen-2.5-1.5B y 7B SimpleRL-Zoo, por lo que se necesita hardware capaz de cargarlos (no se especifica en la informacion disponible).
- Ajuste en GPU de consumo: los tensores en si son ligeros (repositorio de 0.1 GB); el recalculo depende del modelo base.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son relevantes para este repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo | Modelos objetivo | Contenido | Licencia |
|---|---|---|---|---|
| `huyvux3005/llmrl-p4-v18-artifacts` | Artefactos de interpretabilidad | Qwen-2.5-1.5B/7B SimpleRL-Zoo | Tensores de calibracion por capa | other |
| `hkust-nlp/Qwen-2.5-1.5B-SimpleRL-Zoo` | Modelo ajustado con RL | - | Pesos del modelo | no disponible |
| `hkust-nlp/Qwen-2.5-7B-SimpleRL-Zoo` | Modelo ajustado con RL | - | Pesos del modelo | no disponible |

No se dispone de informacion sobre otros repositorios de artefactos de interpretabilidad comparables.

## Limitaciones y advertencias

- No es un modelo: no puede usarse para generacion, clasificacion ni ninguna tarea de inferencia estandar.
- Los tensores solo son validos para las rutas y ejecuciones especificadas; colocarlos en otra ruta o usarlos con otro modelo invalida los resultados.
- Los pesos de las sondas de valor no se almacenaron; solo se conservan los conjuntos de dimensiones en `v18.json`, lo que limita la reutilizacion directa de las sondas.
- La licencia es `other` y no se detallan sus terminos; es necesario consultar el repositorio del paper antes de cualquier uso comercial o redistribucion.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque el repositorio no contiene un modelo de lenguaje.
- El recalculo determinista depende de la version del codigo y del entorno; conviene verificar con `SHA256SUMS` antes de sustituir tensores.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-02), por lo que no hay validacion externa de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huyvux3005/llmrl-p4-v18-artifacts
- Modelo base 1.5B: https://huggingface.co/hkust-nlp/Qwen-2.5-1.5B-SimpleRL-Zoo
- Modelo base 7B: https://huggingface.co/hkust-nlp/Qwen-2.5-7B-SimpleRL-Zoo
- Repositorio GitHub del paper: no disponible (la model card lo menciona pero no incluye la URL)
- Paper *Readable but Not Causal: A Pre-Registered Replication of Sparse "Value Neurons" in RL-Tuned Language Models*: no disponible (sin enlace en la informacion proporcionada)
