# oteam/rfdiffusion-active-site

## Resumen

RFdiffusion es un modelo generativo de estructuras proteicas que revierte un proceso de difusión sobre marcos de residuos (frames) mediante un denoiser con arquitectura tipo RoseTTAFold y actualizaciones estructurales SE(3)-equivariantes. Esta ficha concreta, `oteam/rfdiffusion-active-site`, es la variante especializada en el *scaffolding* de motivos de sitio activo: genera esqueletos proteicos que incorporan y preservan una geometría catalítica concreta. No es un modelo de lenguaje: su entrada son especificaciones de contig y motivos estructurales opcionales, y su salida son coordenadas de backbone.

El modelo lo publica el equipo OFoldX (oteam) como implementación **no oficial** del trabajo original de Watson et al. (Nature, 2023). La implementación de referencia es RosettaCommons/RFdiffusion; OFoldX reempaqueta los pesos en formato safetensors y los expone a través de su propia librería `ofoldx`, con un pipeline de diseño. La variante active-site corresponde al checkpoint `ActiveSite_ckpt.pt` del repositorio original.

Es relevante para quien trabaja en diseño computacional de proteínas y enzimas: permite andamiar motivos funcionales (por ejemplo, triadas catalíticas o sitios de unión) dentro de esqueletos nuevos, un paso previo habitual al diseño de secuencia con ProteinMPNN y a la validación con AlphaFold o RoseTTAFold. El modelo tiene 60.880.638 parámetros según el archivo safetensors y el repositorio ocupa 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser tipo RoseTTAFold con difusión SE(3)-equivariante sobre frames de residuos (32 bloques principales, 4 extra, 4 de refinamiento) |
| Parametros totales | 60.880.638 (60,88 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; MSA de 256 y pair de 128 en la especificación de bloques) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RFdiffusion aplica difusión inversa sobre los frames de los residuos proteicos. El sampler combina difusión gaussiana de traslación sobre el C-alfa con difusión rotacional IGSO(3), y el denoiser, de estilo RoseTTAFold, recibe características de secuencia, MSA, pares, plantillas y timestep como condicionamiento específico del modelo. La variante active-site comparte la especificación de bloques de base, complex e inpaint: 32 bloques principales, 4 extra y 4 de refinamiento, con MSA de tamaño 256, pares de 128 y 50 pasos de difusión.

El entrenamiento consiste en afinar una red tipo RoseTTAFold sobre estructuras proteicas del PDB: se añade ruido gaussiano de traslación al C-alfa y movimiento browniano rotacional a los frames, y el modelo aprende a eliminarlo con self-conditioning a lo largo de los timesteps. La model card indica que la construcción de datos se describe en el paper original y que OFoldX no redistribuye el conjunto de entrenamiento. No se detallan en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Generación *de novo* de esqueletos proteicos a partir de especificaciones de contig.
- *Scaffolding* de motivos estructurales, con la variante active-site orientada a preservar la geometría de sitios activos.
- Andamiaje de sitios activos: mantiene las coordenadas y el frame de los motivos fijados y difunde los residuos nuevos.
- Condicionamiento por características de secuencia, MSA, pares y plantillas.
- Generación de coordenadas N, CA, C y O para residuos generados o difundidos; las cadenas laterales no predichas quedan sin coordenadas.
- Soporte de simetría: las unidades de salida relacionadas por simetría comparten entidad y secuencia.
- Los residuos generados conservan la identidad desconocida `UNK`, por lo que requieren un modelo de diseño de secuencia posterior (por ejemplo, ProteinMPNN).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step en el sentido de los modelos de lenguaje; no es un modelo multimodal ni lingüístico.

## Casos de uso

- Diseño de enzimas: se fija la triada catalítica o el motivo del sitio activo como motivo estructural y se genera un esqueleto nuevo que lo aloja; después se asigna secuencia con ProteinMPNN y se valida el plegamiento.
- Andamiaje de motivos de unión: se introduce un motivo de unión a ligando y se generan esqueletos que lo presentan en una geometría adecuada para el cribado posterior.
- Generación de bibliotecas de esqueletos: se ejecuta el pipeline con distintas semillas (`seed`) y longitudes de segmento generado para producir diversidad estructural antes del diseño de secuencia.
- Prototipado en diseño de proteínas *de novo*: se declaran segmentos copiados y posiciones generadas mediante `RfDiffusionPlacements` y `GeneratedSegment`, lo que permite construir topologías con conexiones y enlaces nuevos verificados.
- Diseño con restricciones de simetría: las unidades simétricas comparten entidad y secuencia, útil para generar ensamblados con simetría definida.
- Integración en pipelines de diseño computacional: el modelo se encadena con modelos de diseño de secuencia y de predicción de estructura dentro de flujos por etapas descritos en la guía de pipelines de OFoldX.
- Docencia e investigación en difusión sobre estructuras: al exponerse el denoiser diferenciable para entrenamiento y ajuste fino, sirve para experimentar con variantes de condicionamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 60,88 M de parámetros, el peso en precisión completa ronda los 0,24 GB, pero los requisitos reales dependen del tamaño del esqueleto, del MSA y de los 50 pasos de difusión.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la documentación.
- ¿Cabe en GPU de consumo? No confirmado; por el tamaño de parámetros sería plausible, pero la memoria efectiva depende del pipeline y de las características de entrada.
- Opciones de despliegue: librería `ofoldx` (instalación con `pip install ofoldx`) y su pipeline `design`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / condicionamiento | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/rfdiffusion-active-site | 60,88 M | MSA 256, pair 128, 50 timesteps | Scaffolding de sitio activo | AGPL-3.0 | HuggingFace (oteam) |
| oteam/rfdiffusion-base | 59,879 M (según tabla del autor) | MSA 256, pair 128, 50 timesteps | Generación *de novo* y scaffolding de motivos | AGPL-3.0 | HuggingFace (oteam) |
| oteam/rfdiffusion-complex-base | 59,879 M (según tabla del autor) | MSA 256, pair 128, 50 timesteps | Diseño de complejos y binders | AGPL-3.0 | HuggingFace (oteam) |
| RFdiffusion oficial (RosettaCommons) | No disponible en la información | No disponible | Generación de backbone y scaffolding | No disponible en la información | Repositorio GitHub |

## Limitaciones y advertencias

- Es una implementación **no oficial**: la model card la atribuye al equipo OFoldX y no al equipo que publicó RFdiffusion; los resultados pueden diferir de los del repositorio de referencia.
- Los residuos generados tienen identidad `UNK`; el modelo no diseña secuencia, por lo que requiere un paso posterior con ProteinMPNN u otro modelo de diseño de secuencia.
- Solo se generan coordenadas de N, CA, C y O; las cadenas laterales no predichas no están disponibles, lo que limita la evaluación directa de interacciones atómicas finas.
- Los frames de backbone requieren coordenadas N, CA y C completas y no colineales; la construcción de topología comprueba conexiones retenidas y enlaces nuevos solicitados, de modo que placements mal especificados fallan.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y su uso en servicios en red; conviene revisar las implicaciones antes de un uso comercial o de integrarlo en productos propietarios.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad de los esqueletos generados en la información disponible; la validación experimental (predicción de estructura, cribado y ensayo de laboratorio) sigue siendo necesaria.
- El repositorio no redistribuye el conjunto de entrenamiento, lo que dificulta la reproducibilidad completa del entrenamiento.
- No hay descargas ni *likes* registrados en el momento de la consulta, y la fecha de creación indicada es posterior a la de esta ficha; trátese como un artefacto de publicación reciente y poco validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/rfdiffusion-active-site
- Variante base: https://huggingface.co/oteam/rfdiffusion-base
- Variante base (epoch 8): https://huggingface.co/oteam/rfdiffusion-base-epoch8
- Variante complex base: https://huggingface.co/oteam/rfdiffusion-complex-base
- Variante complex beta: https://huggingface.co/oteam/rfdiffusion-complex-beta
- Variante complex fold base: https://huggingface.co/oteam/rfdiffusion-complex-fold-base
- Variante inpaint seq: https://huggingface.co/oteam/rfdiffusion-inpaint-seq
- Variante inpaint seq fold: https://huggingface.co/oteam/rfdiffusion-inpaint-seq-fold
- Código del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/rfdiffusion
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Documentación de la librería: https://ofoldx.valtech.ai/
- Paper original: https://doi.org/10.1038/s41586-023-06415-8
- Repositorio oficial de RFdiffusion: https://github.com/RosettaCommons/RFdiffusion
