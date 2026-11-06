# oteam/rfdiffusion-complex-base

## Resumen

RFdiffusion es un modelo generativo de estructuras proteicas que invierte un proceso de difusión sobre marcos de residuos (residue frames) para producir esqueletos (backbones) de proteínas desde cero o condicionados por motivos estructurales. La implementación original procede del laboratorio de David Baker (Universidad de Washington) y se publicó en *Nature* en 2023; este repositorio, `oteam/rfdiffusion-complex-base`, es una implementación no oficial mantenida por el equipo OFoldX, que redistribuye el checkpoint `Complex_base_ckpt.pt` en formato safetensors dentro de su librería `ofoldx`.

La variante *complex-base* está especializada en el diseño de complejos proteicos y binders: genera la cadena del binder contra una diana estructural dada, manteniendo las coordenadas del motivo o epítopo fijado. El modelo emplea un denoiser con arquitectura tipo RoseTTAFold (32 bloques principales, 4 extra y 4 de refinamiento) y actualizaciones de estructura SE(3)-equivariantes, con difusión gaussiana sobre traslaciones C-alpha y difusión rotacional IGSO(3). Cuenta con 60,88 millones de parámetros y un tamaño de repositorio de 0,2 GB.

Es relevante para investigadores en diseño computacional de proteínas porque permite generar candidatos de binder sin entrenamiento propio, integrándose en pipelines que después asignan secuencia con ProteinMPNN y validan con AlphaFold u otras herramientas de predicción. La licencia AGPL-3.0 condiciona su uso en productos de código cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser tipo RoseTTAFold con difusión SE(3)-equivariante sobre marcos de residuos (32 bloques principales, 4 extra, 4 de refinamiento) |
| Parametros totales | 60.881.022 (60,88 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (MSA de 256 secuencias y pair representation de 128; no es un modelo de contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de estructura proteica, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo invierte un proceso de difusión definido sobre marcos de residuos proteicos. Cada residuo se representa mediante una traslación C-alpha (difusión gaussiana) y una rotación IGSO(3) (movimiento browniano rotacional). El denoiser sigue la arquitectura de RoseTTAFold: 32 bloques principales, 4 bloques extra y 4 de refinamiento, con representaciones de secuencia, MSA (tamaño 256), pares (tamaño 128), plantillas y timestep como features de condicionamiento. Las actualizaciones estructurales son SE(3)-equivariantes y el muestreo se realiza en 50 pasos de difusión con self-conditioning entre timesteps.

El entrenamiento parte de una red RoseTTAFold preentrenada y se afina sobre estructuras proteicas del PDB; la model card indica que la construcción del dataset se describe en el paper original y que OFoldX no redistribuye el conjunto de entrenamiento. La variante *complex-base* corresponde al checkpoint `Complex_base_ckpt.pt`, orientado a diseño de complejos y binders, y comparte la especificación de 59,879 M de parámetros del resto de variantes no condicionadas por fold. El repositorio expone el denoiser diferenciable para entrenamiento y ajuste fino, pero no reproduce el pipeline completo de acoplamiento (coupling) del código original.

## Capacidades

- Generación *de novo* de esqueletos proteicos a partir de especificaciones de contig (segmentos generados con longitud definida).
- Diseño de complejos proteicos y binders contra una diana estructural, manteniendo fijadas las coordenadas del motivo o epítopo.
- *Motif scaffolding*: incorporación de motivos estructurales existentes dentro de un esqueleto generado.
- Condicionamiento por secuencia, MSA, pares y plantillas estructurales.
- Simetría: las unidades de salida relacionadas por simetría comparten entidad y secuencia.
- Generación de coordenadas N, CA, C y O para residuos generados o difundidos; las cadenas laterales no predichas quedan sin coordenadas.
- Los residuos generados conservan la identidad `UNK`, por lo que requieren un modelo de diseño de secuencia (por ejemplo, ProteinMPNN) para asignar aminoácidos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step en el sentido de los modelos de lenguaje; su interfaz es un pipeline de diseño estructural.

## Casos de uso

- Diseño de binders de proteína contra una diana terapéutica: se fija el epítopo de la diana como motivo y se genera la cadena del binder con la variante *complex-base*, obteniendo esqueletos candidatos que después se secuencian con ProteinMPNN y se validan con AlphaFold-Multimer.
- *Motif scaffolding* en ingeniería de enzimas: se introduce el sitio activo como motivo fijo y el modelo genera un andamiaje estructural que lo soporta, útil para explorar arquitecturas alternativas alrededor de una geometría catalítica conocida.
- Generación *de novo* de proteínas con longitud controlada: mediante `GeneratedSegment` se especifica el rango de residuos (por ejemplo, 100-100) y se obtienen esqueletos iniciales para cribados computacionales.
- Diseño de complejos multi-cadena: la variante está entrenada para complejos, lo que permite proponer interfaces y empaquetamientos entre cadenas con restricciones topológicas verificadas por el pipeline.
- Exploración de diversidad topológica en librerías de diseño: combinable con las variantes *complex-beta* (ricas en lámina beta) y *complex-fold-base* (condicionada por fold) del mismo repositorio para cubrir distintos sesgos estructurales.
- *Inpainting* estructural condicionado por secuencia: las variantes `inpaint-seq` e `inpaint-seq-fold` del mismo autor permiten completar regiones de una estructura existente, útil en rediseño parcial de proteínas.
- Integración en pipelines de investigación reproducibles: al distribuirse como safetensors dentro de `ofoldx`, se puede orquestar junto con modelos de predicción y scoring en flujos por etapas documentados en la guía de pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 60,88 M de parámetros, el peso en fp32 ocupa aproximadamente 0,24 GB, por lo que el cuello de botella real es la memoria de las representaciones intermedias (MSA de 256 y pares de 128) y el número de pasos de difusión, no el tamaño de los pesos.
- GPU recomendadas: no disponibles en la información proporcionada; por el perfil del modelo, una GPU con al menos 16 GB de VRAM es un punto de partida razonable para las representaciones MSA/pair, aunque este dato no está confirmado por el autor.
- ¿Cabe en GPU de consumo? Los pesos caben con holgura en cualquier GPU consumer moderna; la viabilidad depende de la memoria de activaciones del denoiser, no cuantificada en la model card.
- Opciones de despliegue: la model card solo documenta la librería `ofoldx` (`pip install ofoldx`) y su pipeline `design`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto/representación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/rfdiffusion-complex-base | 60,88 M | Difusión SE(3) para complejos y binders | MSA 256, pares 128, 50 pasos | AGPL-3.0 | Hugging Face (este repo) |
| oteam/rfdiffusion-base | 59,879 M | Difusión SE(3) para generación *de novo* y motif scaffolding | MSA 256, pares 128, 50 pasos | AGPL-3.0 | Hugging Face |
| oteam/rfdiffusion-complex-fold-base | 59,880 M | Difusión SE(3) condicionada por fold para complejos | MSA 256, pares 128, 50 pasos | AGPL-3.0 | Hugging Face |
| RosettaCommons/RFdiffusion (oficial) | No disponible en la información | Implementación original de referencia | No disponible | No disponible en la información | GitHub |

Las tres variantes de OFoldX comparten arquitectura y número de parámetros; la diferencia radica en el checkpoint y el tipo de condicionamiento (complejo/binder frente a generación libre o condicionada por fold). La implementación oficial de RosettaCommons es la referencia canónica, pero no se dispone de sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card advierte explícitamente de que el equipo original de RFdiffusion no escribió esta ficha ni validó este checkpoint; los resultados pueden diferir de los del repositorio oficial.
- Los residuos generados tienen identidad `UNK`; el modelo no asigna secuencia y requiere un paso posterior con ProteinMPNN u otro diseñador de secuencia.
- Solo se generan coordenadas de backbone (N, CA, C, O); las cadenas laterales no predichas no están disponibles, lo que limita el análisis directo de interacciones atómicas.
- Los marcos de backbone requieren coordenadas N, CA y C completas y no colineales; la construcción de topología verifica conexiones retenidas y nuevos enlaces, y puede rechazar diseños inválidos.
- Licencia AGPL-3.0: el uso en productos o servicios de código cerrado exige liberar el código derivado bajo la misma licencia; es una restricción relevante para uso comercial.
- Riesgo de alucinación estructural: como modelo generativo, puede producir esqueletos plausibles pero no plegables o no funcionales; se requiere validación computacional (predicción de estructura, scoring) y, en su caso, experimental.
- Sesgos de los datos de entrenamiento: derivados del PDB, con sobrerrepresentación de ciertos folds y familias proteicas; la diversidad topológica puede estar limitada según la variante.
- No es un modelo lingüístico: no procesa texto ni idiomas, y no soporta tool calling ni razonamiento multi-step.
- El repositorio no redistribuye el conjunto de entrenamiento ni reproduce el pipeline completo de acoplamiento del código original, lo que puede afectar a la reproducibilidad exacta de los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/rfdiffusion-complex-base
- Variante base: https://huggingface.co/oteam/rfdiffusion-base
- Variante base epoch8: https://huggingface.co/oteam/rfdiffusion-base-epoch8
- Variante complex-beta: https://huggingface.co/oteam/rfdiffusion-complex-beta
- Variante complex-fold-base: https://huggingface.co/oteam/rfdiffusion-complex-fold-base
- Variante inpaint-seq: https://huggingface.co/oteam/rfdiffusion-inpaint-seq
- Variante inpaint-seq-fold: https://huggingface.co/oteam/rfdiffusion-inpaint-seq-fold
- Variante active-site: https://huggingface.co/oteam/rfdiffusion-active-site
- Paper original: https://doi.org/10.1038/s41586-023-06415-8
- Repositorio oficial: https://github.com/RosettaCommons/RFdiffusion
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/rfdiffusion
- Guía de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Documentación de la librería: https://ofoldx.valtech.ai/
