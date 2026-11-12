# CompiledThoughts/GLM-5.3-Flash-FP4-Local-inferredthoughts

## Resumen

GLM-5.3-Flash-FP4-Local-inferredthoughts es una redistribucion del checkpoint NVIDIA GLM-5.3-Flash-FP4-Local, publicada por el usuario CompiledThoughts. No se trata de una nueva cuantizacion ni de un ajuste fino: es un re-layout de los pesos originales en el que los expertos enrutados de cada capa MoE se apilan en un unico bloque por proyeccion, de modo que el motor de inferencia inferredThoughts pueda gestionar la memoria de forma jerarquica (expertos activos en GPU, siguientes en RAM y el resto en un SSD NVMe). Los tensores que no son expertos enrutados se copian byte a byte con su nombre original.

El modelo subyacente es un transformer disperso (MoE) de gran tamano con atencion hibrida: capas de atencion lineal y capas de atencion dispersa, ademas de una torre de vision y una capa MTP (multi-token prediction). Segun el recuento de tensores del autor, el checkpoint contiene 321,3 mil millones de parametros, de los cuales unos 18 mil millones estarian activos por token segun la model card de NVIDIA. La cuantizacion es mixta: NVFP4 para los expertos enrutados, FP8 E4M3 block-scaled para expertos compartidos y proyecciones de atencion dispersa, MXFP8 para proyecciones de atencion lineal, las tres MLP densas y `lm_head`, y BF16 para embeddings, normas y routers.

Su relevancia es acotada pero clara: demuestra una via para ejecutar un MoE de mas de 300 mil millones de parametros en hardware con VRAM limitada mediante offloading selectivo de expertos a RAM y NVMe. La contrapartida es que el formato apilado solo lo entiende inferredThoughts, cuyo soporte para GLM-5.3-Flash no esta en una release publica en el momento de publicacion de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (lineal + dispersa), torre de vision y capa MTP |
| Parametros totales | 360.279.727.200 (safetensors); 321,3B segun recuento del autor; 320B segun NVIDIA |
| Parametros activos | 18B (segun model card de NVIDIA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 (expertos enrutados, torre de vision), FP8 E4M3 block-scaled (expertos compartidos, atencion dispersa), MXFP8 (atencion lineal, MLP densas, `lm_head`), BF16 (embeddings, normas, routers) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (modelo); MIT (base GLM-5.3-Flash) |
| Formato de pesos | safetensors (layout apilado propio de inferredThoughts), 186,1 GB de repo |

## Arquitectura y entrenamiento

La arquitectura es un transformer disperso con mezcla de expertos en 42 capas MoE, complementado con capas de atencion lineal y capas de atencion dispersa, una torre de vision y una capa MTP para prediccion multi-token. Los expertos enrutados se almacenan en NVFP4 (valores E2M1, escalas E4M3 por cada 16 pesos y escala global FP32), mientras que los expertos compartidos y las proyecciones de atencion dispersa usan FP8 E4M3 con escalado por bloques. Las proyecciones de atencion lineal, las tres MLP densas y `lm_head` emplean MXFP8 (valores E4M3, escalas UE8M0 por cada 32 pesos). Embeddings, normas y routers permanecen en BF16.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) en la informacion proporcionada. La innovacion tecnica destacable de esta publicacion no esta en el entrenamiento sino en el empaquetado: el apilado de expertos por proyeccion permite al motor inferredThoughts tratar cada capa MoE como una unidad de offloading, manteniendo en GPU solo los expertos que la conversacion esta usando y paginando el resto desde RAM o NVMe. El autor indica que los pesos son los de NVIDIA sin modificar y que cada archivo incluye sumas SHA-256 para verificacion.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Procesamiento de vision: el checkpoint incluye torre de vision con MLPs y merger en NVFP4 y atencion en MXFP8.
- Razonamiento con capa MTP (multi-token prediction), que permite decodificacion especulativa interna.
- Capacidades de inferencia con "inferred thoughts" segun el nombre del repositorio y el tag `inferred-thoughts`; no se detalla el mecanismo en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta poblado.
- Ejecucion en VRAM reducida mediante offloading de expertos a RAM y SSD NVMe.

## Casos de uso

- Experimentacion con MoE de gran escala en estaciones de trabajo: el layout permite cargar un modelo de mas de 300B parametros en una maquina con VRAM modesta, paginando expertos desde RAM y NVMe, lo que habilita investigacion sobre comportamiento de MoE sin acceso a clusters multi-GPU.
- Evaluacion de estrategias de offloading: util para medir el impacto de la latencia de NVMe y del ancho de banda de RAM en el throughput de un MoE con 18B parametros activos, comparando politicas de cache de expertos.
- Prototipado de asistentes conversacionales con vision: la presencia de torre de vision permite probar flujos de imagen mas texto en local antes de migrar a despliegues con NVIDIA original en vLLM o SGLang.
- Investigacion sobre decodificacion especulativa: la capa MTP integrada sirve para estudiar tecnicas de prediccion multi-token y su tasa de aceptacion en un modelo de este tamano.
- Reproducibilidad y auditoria de pesos: los archivos `SHA256SUMS` y la copia byte a byte de los tensores no expertos permiten verificar que el re-layout no altera los valores originales, util en entornos con requisitos de trazabilidad.
- Desarrollo del propio motor inferredThoughts: este checkpoint es el banco de pruebas para la integracion de GLM-5.3-Flash en ese motor, aun no publicada.
- Fine-tuning o adaptacion sobre el modelo base: no recomendado con este layout, ya que las herramientas estandar (transformers, PEFT) esperan la estructura de NVIDIA; para ello debe usarse el checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El modelo completo ocupa 186,1 GB en disco; con offloading de expertos a RAM y NVMe, la VRAM necesaria depende del numero de expertos que el motor mantenga residentes, parametro no documentado.
- GPU recomendadas: no disponibles. El diseno esta pensado para escenarios de "low-vram" (tag del repositorio), por lo que se orienta a GPUs con menos memoria que la necesaria para alojar los 186 GB completos.
- Cabe en consumer GPU: el planteamiento del offloading sugiere que si, pero no se especifica que modelos concretos (RTX 4090, 3090, etc.) ni con cuanta VRAM.
- Almacenamiento: se requiere un SSD NVMe con capacidad suficiente para alojar los expertos no residentes; el repo completo son 186,1 GB.
- Opciones de despliegue: exclusivamente inferredThoughts. vLLM, SGLang y transformers no leen este layout y deben usar el checkpoint original de NVIDIA (`nvidia/GLM-5.3-Flash-FP4-Local`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Motor compatible |
|---|---|---|---|---|---|
| GLM-5.3-Flash-FP4-Local-inferredthoughts | 360,3B (safetensors) / 18B activos | no disponible | NVFP4 + FP8 + MXFP8 + BF16 | NVIDIA Open Model Agreement | Solo inferredThoughts |
| nvidia/GLM-5.3-Flash-FP4-Local | 320B / 18B activos | no disponible | NVFP4 + FP8 + MXFP8 + BF16 | NVIDIA Open Model Agreement | vLLM, SGLang, transformers |
| Alternativas de tamano similar (p. ej. otros MoE de ~300B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa posible con la informacion disponible es frente al checkpoint original de NVIDIA, del que este deriva: mismos pesos, mismo regimen de cuantizacion y misma licencia, con la diferencia del layout apilado y del motor que lo soporta.

## Limitaciones y advertencias

- Compatibilidad restringida: el layout solo lo interpreta inferredThoughts, y el soporte de GLM-5.3-Flash en ese motor no estaba en una release publica segun la model card. Cualquier otra herramienta requiere el checkpoint de NVIDIA.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo habitual de los modelos generativos de gran escala.
- Sesgos: no documentados en la informacion proporcionada.
- Idiomas: el campo de idiomas no esta poblado; no hay garantia documentada de cobertura multilingue.
- Licencia: el uso se rige por el NVIDIA Open Model Agreement, que impone condiciones adicionales frente a licencias permisivas; la base GLM-5.3-Flash esta bajo MIT. Es necesario revisar ambos textos antes de un uso comercial.
- Estado del proyecto: publicacion independiente con 0 descargas y 1 like en el momento de la consulta; no esta revisada ni respaldada por NVIDIA ni por Z.ai, como declara el propio autor.
- Madurez: creado y actualizado en noviembre de 2026, sin historial de uso en produccion.
- Requisito de almacenamiento y E/S: el offloading a NVMe introduce dependencia del rendimiento del disco; discos lentos degradaran gravemente la latencia.
- Integridad: conviene verificar los ficheros con `sha256sum --ignore-missing -c SHA256SUMS` antes de cargar el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CompiledThoughts/GLM-5.3-Flash-FP4-Local-inferredthoughts
- Modelo base en Hugging Face: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
