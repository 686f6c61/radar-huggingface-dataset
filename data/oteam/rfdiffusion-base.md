# oteam/rfdiffusion-base

## Resumen

RFdiffusion es un modelo de difusión para la generación de esqueletos proteicos (*protein backbone generation*) desarrollado originalmente por el laboratorio de David Baker (Universidad de Washington) y publicado en *Nature* en 2023. Esta ficha corresponde a `oteam/rfdiffusion-base`, una implementación **no oficial** del modelo original publicada por el equipo OFoldX, que redistribuye los pesos del checkpoint `Base_ckpt.pt` en formato safetensors y los integra en su propia librería `ofoldx`. El modelo resuelve el problema de diseñar estructuras proteicas *de novo* o mediante *scaffolding* de motivos estructurales, sin partir de una secuencia existente.

Técnicamente, RFdiffusion invierte un proceso de difusión sobre marcos de residuos proteicos (*residue frames*) usando un denoiser con arquitectura tipo RoseTTAFold y actualizaciones estructurales SE(3)-equivariantes. El sampler combina difusión gaussiana sobre la traslación del C-alpha con difusión rotacional IGSO(3). El modelo condiciona la generación mediante características de secuencia, MSA, pares, plantillas y timestep.

Con unos 60,9 millones de parámetros y un repositorio de 0,2 GB, es un modelo compacto orientado a un pipeline de diseño que requiere un segundo paso de asignación de secuencia (por ejemplo, ProteinMPNN), ya que los residuos generados conservan la identidad `UNK`. Su relevancia actual radica en que democratiza el acceso a RFdiffusion mediante una implementación Python instalable por pip, aunque con la advertencia de que no es la versión oficial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión SE(3)-equivariante sobre marcos de residuos proteicos, con denoiser tipo RoseTTAFold (32 bloques principales, 4 extra, 4 de refinamiento) |
| Parametros totales | 60.880.638 (≈60,9 M; la model card indica 59,879 M para la variante base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (condicionado por MSA de tamaño 256 y pares de tamaño 128; no es un modelo de contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RFdiffusion es un modelo de difusión que opera sobre marcos de residuos proteicos. El proceso directo añade ruido gaussiano a la traslación del C-alpha y movimiento browniano rotacional a los marcos, y la red aprende a invertirlo. El denoiser sigue una arquitectura tipo RoseTTAFold con 32 bloques principales, 4 bloques extra y 4 bloques de refinamiento, y aplica actualizaciones estructurales SE(3)-equivariantes. El sampler acopla difusión de traslación gaussiana con difusión rotacional IGSO(3) y emplea 50 pasos de difusión. La condicionación se realiza mediante características de secuencia, MSA (tamaño 256), pares (tamaño 128), plantillas y timestep.

El modelo se entrena afinando una red tipo RoseTTAFold sobre estructuras proteicas del PDB. La model card indica que la construcción de datos se describe en el paper original y que OFoldX no redistribuye el conjunto de entrenamiento. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF/DPO (no aplicable en el sentido habitual a un modelo generativo estructural). La innovación principal es la combinación de difusión sobre marcos rígidos con equivariancia SE(3), que permite generar esqueletos coherentes geométricamente y condicionar la generación a motivos estructurales fijos.

## Capacidades

- Generación *de novo* de esqueletos proteicos a partir de especificaciones de contig (segmentos generados con longitud definida).
- *Scaffolding* de motivos estructurales: mantiene las coordenadas y el marco de los motivos fijos y genera el resto.
- Condicionación por pliegue (*fold-conditioned*) en las variantes correspondientes.
- Diseño de complejos y binders (variantes `complex-*`).
- *Inpainting* condicionado por secuencia (variantes `inpaint-seq` y `inpaint-seq-fold`).
- *Scaffolding* de sitios activos (variante `active-site`).
- Generación de coordenadas N, CA, C y O para residuos generados o difundidos; las cadenas laterales no predichas quedan no disponibles.
- Soporte de simetría: las unidades de salida relacionadas por simetría comparten entidad y secuencia.
- No realiza asignación de secuencia: los residuos generados conservan la identidad `UNK` y requieren un modelo posterior como ProteinMPNN.
- No dispone de tool calling, function calling ni capacidades de agente o multi-step reasoning en el sentido de los modelos de lenguaje.

## Casos de uso

- Diseño *de novo* de proteínas: generar esqueletos de longitud controlada (por ejemplo, 100 residuos) mediante `GeneratedSegment` y un sampler con semilla fija, útil para explorar el espacio estructural antes de asignar secuencia con ProteinMPNN.
- *Scaffolding* de motivos funcionales: fijar un sitio activo o un motivo estructural conocido y generar el resto del esqueleto que lo soporte, lo que permite trasplantar funciones a andamiajes nuevos.
- Diseño de binders y complejos: usar las variantes `complex-base` o `complex-beta` para generar esqueletos de unión contra una diana, con diversidad topológica en la variante beta.
- *Inpainting* condicionado por secuencia: completar regiones de una estructura existente manteniendo la secuencia especificada, útil para rediseñar bucles o regiones concretas.
- Diseño condicionado por pliegue: generar esqueletos que adopten un pliegue objetivo, adecuado para ingeniería de proteínas hacia topologías definidas.
- Integración en pipelines de diseño computacional: al ser instalable con `pip install ofoldx` y exponer un pipeline `design`, se puede encadenar con modelos de asignación de secuencia y de predicción de estructura en flujos automatizados de diseño.
- Exploración con simetría: generar unidades simétricas que comparten entidad y secuencia, aplicable al diseño de oligómeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con ~60,9 M de parámetros, el peso del modelo en precisión completa ronda los 0,24 GB, aunque el consumo real depende de las activaciones, del tamaño del esqueleto generado y de los 50 pasos de difusión.
- GPU recomendadas: no disponible. Por tamaño de parámetros, cualquier GPU consumer moderna debería poder alojar los pesos; no se confirma en la información disponible.
- ¿Cabe en GPU consumer? Los pesos son pequeños (repositorio de 0,2 GB), pero no se dispone de datos de consumo de memoria en inferencia para confirmarlo.
- Opciones de despliegue: la librería `ofoldx` (instalable por pip) y su pipeline `design`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / condicionación | Licencia | Disponibilidad |
|---|---|---|---|---|
| oteam/rfdiffusion-base (esta ficha) | ≈60,9 M | MSA 256, pares 128, 50 pasos de difusión | AGPL-3.0 | Hugging Face (implementación no oficial) |
| RFdiffusion oficial (RosettaCommons) | No disponible en la información | No disponible en la información | No disponible en la información | GitHub oficial |
| oteam/rfdiffusion-complex-base | ≈59,9 M (según model card) | Igual que base, orientado a complejos y binders | AGPL-3.0 | Hugging Face (implementación no oficial) |
| oteam/rfdiffusion-complex-beta | No disponible | Igual que base, orientado a binders beta | AGPL-3.0 | Hugging Face (implementación no oficial) |

No se dispone de datos de benchmarks para comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Implementación **no oficial**: la model card la redacta el equipo OFoldX, no los autores originales de RFdiffusion; los resultados pueden diferir de la versión oficial.
- Los residuos generados conservan la identidad `UNK`; es obligatorio un paso posterior de asignación de secuencia (por ejemplo, ProteinMPNN) para obtener secuencias reales.
- Solo se generan coordenadas N, CA, C y O; las cadenas laterales no predichas no están disponibles.
- Los marcos de esqueleto requieren coordenadas N, CA y C completas y no colineales; la construcción de topología verifica conexiones retenidas y nuevos enlaces solicitados.
- El fichero de preentrenamiento de RoseTTAFold (`RF_structure_prediction_weights.pt`) no es un checkpoint de denoising de RFdiffusion y no puede convertirse con este conversor.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte para uso en red y distribución; conviene revisar su compatibilidad con el uso comercial previsto.
- Riesgo de alucinación estructural: no se documenta en la información disponible una evaluación de la plausibilidad física de los esqueletos generados; se recomienda validación con predicción de estructura y métricas de diseño.
- Sesgos: no documentados en la información disponible; al entrenarse sobre el PDB, podría heredar los sesgos de composición de dicha base de datos.
- Limitaciones de contexto o idioma: no aplica en el sentido lingüístico; la condicionación está acotada por MSA de 256 y pares de 128.
- No se redistribuye el conjunto de entrenamiento; la reproducibilidad del entrenamiento depende de los datos originales del PDB.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/rfdiffusion-base
- Paper: https://doi.org/10.1038/s41586-023-06415-8
- Repositorio oficial: https://github.com/RosettaCommons/RFdiffusion
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/rfdiffusion
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Librería: https://ofoldx.valtech.ai/
- Variantes: https://huggingface.co/oteam/rfdiffusion-base-epoch8, https://huggingface.co/oteam/rfdiffusion-complex-base, https://huggingface.co/oteam/rfdiffusion-complex-beta, https://huggingface.co/oteam/rfdiffusion-complex-fold-base, https://huggingface.co/oteam/rfdiffusion-inpaint-seq, https://huggingface.co/oteam/rfdiffusion-inpaint-seq-fold, https://huggingface.co/oteam/rfdiffusion-active-site
