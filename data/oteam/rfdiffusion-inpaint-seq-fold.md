# oteam/rfdiffusion-inpaint-seq-fold

## Resumen

RFdiffusion es un modelo de difusión sobre estructuras de proteínas que genera esqueletos (backbones) proteicos de novo y realiza scaffolding de motivos estructurales. La implementación original procede del laboratorio de David Baker (Universidad de Washington) y se publicó en *Nature* en 2023. Esta ficha corresponde a la variante **inpaint-seq-fold** de la reimplementación no oficial del equipo OFoldX, publicada en Hugging Face bajo el identificador `oteam/rfdiffusion-inpaint-seq-fold`.

El modelo invierte un proceso de difusión sobre marcos de residuos proteicos (frames N-CA-C) mediante un denoiser de estilo RoseTTAFold con actualizaciones estructurales SE(3)-equivariantes. El sampler combina difusión gaussiana en la traslación del C-alpha con difusión rotacional IGSO(3). La variante inpaint-seq-fold está condicionada por secuencia y por pliegue, lo que permite fijar regiones conocidas (motivos) y generar el resto del esqueleto respetando tanto la identidad aminoacídica como la topología diana.

Es relevante porque el diseño computacional de proteínas ha pasado de la predicción pasiva (AlphaFold) a la generación activa de estructuras nuevas, y RFdiffusion es uno de los métodos de referencia para binder design, scaffolding de sitios activos y diseño de proteínas con función definida. Esta reimplementación en la librería `ofoldx` expone el denoiser de forma diferenciable, lo que facilita el ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion SE(3)-equivariante sobre marcos de residuos, con denoiser tipo RoseTTAFold |
| Parametros totales | 60.881.982 (60,88 M; la model card indica 59,880 M para la variante fold-conditioned) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; condicionamiento por MSA de tamano 256 y pares de tamano 128 |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No aplica (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

Otros datos de la especificacion: 32 bloques principales, 4 bloques extra, 4 bloques de refinamiento y 50 pasos de difusion.

## Arquitectura y entrenamiento

RFdiffusion es un modelo de difusion generativo que opera sobre marcos de residuos proteicos. Cada residuo se representa por un frame definido por las coordenadas N, CA y C, y el proceso directo anade ruido gaussiano a la traslacion del C-alpha y ruido rotacional segun la distribucion IGSO(3). El denoiser, con arquitectura de estilo RoseTTAFold, recibe caracteristicas de secuencia, MSA, pares, plantillas y paso temporal, y produce actualizaciones estructurales SE(3)-equivariantes. El muestreo invierte el proceso con auto-condicionamiento a lo largo de los pasos temporales.

El entrenamiento parte de una red RoseTTAFold preentrenada y se ajusta sobre estructuras proteicas del PDB para recuperar esqueletos a partir de coordenadas ruidosas, con condicionamiento estructural opcional. La model card no detalla el numero exacto de tokens ni la composicion exacta del dataset, y senala que OFoldX no redistribuye el conjunto de entrenamiento. La variante inpaint-seq-fold anade condicionamiento por secuencia y por pliegue, de modo que el modelo puede rellenar regiones de una estructura manteniendo fijas tanto la secuencia como la topologia de las zonas conocidas.

## Capacidades

- Generacion de esqueletos proteicos de novo a partir de especificaciones de contig.
- Scaffolding de motivos estructurales: mantiene coordenadas y frames de los motivos fijados y genera el resto.
- Inpainting condicionado por secuencia y por pliegue (variante especifica de esta ficha).
- Generacion de coordenadas N, CA, C y O para los residuos generados; las cadenas laterales no predichas quedan sin resolver.
- Los residuos generados conservan la identidad desconocida `UNK`, por lo que requieren un modelo de diseno de secuencia posterior (por ejemplo, ProteinMPNN) para asignar aminoacidos.
- Soporte de simetria: las unidades de salida relacionadas por simetria comparten entidad y secuencia.
- Construccion de topologia con comprobacion de conexiones retenidas y de nuevos enlaces solicitados.
- No soporta tool calling, agentes, vision ni audio: es un modelo biologico estructural, no un LLM.

## Casos de uso

- Diseno de binders proteicos: la variante compleja del mismo autor permite generar esqueletos que se unen a una diana; esta variante condicionada por pliegue ayuda a fijar la topologia del binder y la secuencia de la interfaz.
- Scaffolding de sitios activos: se fija un motivo catalitico con sus coordenadas y secuencia y el modelo genera el resto del esqueleto que lo sostiene, util para redisenar enzimas.
- Inpainting estructural en proteinas parcialmente conocidas: dado un pliegue y una secuencia, se rellena una region ausente respetando ambas restricciones.
- Diseno de proteinas con topologia especifica: el condicionamiento por pliegue permite generar esqueletos que adopten una arquitectura diana, util en diseno de proteinas de novo con funcion definida.
- Generacion de candidatos para cribado in silico: se producen lotes de esqueletos con semillas distintas que despues se evaluan con predictores de estructura y energia.
- Ajuste fino e investigacion: al exponerse el denoiser diferenciable, se puede reentrenar sobre datasets propios de estructuras o condicionamientos especificos.
- Generacion de esqueletos simetricos: util para disenar oligomeros con simetria definida compartiendo entidad y secuencia entre subunidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 60,88 M de parametros el peso en fp32 ronda los 0,24 GB, por lo que el cuello de botella sera la longitud de la proteina y el tamano del MSA (256) y de los pares (128), no el numero de parametros.
- GPU recomendadas: no disponible de forma explicita; por tamano del modelo, cualquier GPU con suficiente memoria para el MSA y los tensores intermedios deberia bastar, pero no se documentan requisitos concretos.
- Cabe en GPU de consumo: previsiblemente si por numero de parametros, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: la libreria `ofoldx` (`pip install ofoldx`), con pipeline `design` y el modelo `oteam/rfdiffusion-*`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| oteam/rfdiffusion-inpaint-seq-fold | 60,88 M | Secuencia y pliegue | AGPL-3.0 | Hugging Face (ofoldx) |
| oteam/rfdiffusion-inpaint-seq | 59,879 M (segun model card) | Secuencia | AGPL-3.0 | Hugging Face (ofoldx) |
| oteam/rfdiffusion-complex-fold-base | 59,880 M (segun model card) | Pliegue en complejos | AGPL-3.0 | Hugging Face (ofoldx) |
| RFdiffusion oficial (RosettaCommons) | No disponible en la informacion | Multiples variantes | No disponible en la informacion | GitHub (RosettaCommons/RFdiffusion) |

Las variantes del mismo autor comparten arquitectura y numero de bloques; la diferencia esta en el condicionamiento y en el checkpoint. No se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Implementacion no oficial: la model card advierte explicitamente de que el equipo que publico RFdiffusion no escribio esta model card ni esta implementacion; la referencia oficial es RosettaCommons/RFdiffusion.
- Los residuos generados tienen identidad `UNK`; sin un modelo de diseno de secuencia posterior (ProteinMPNN u otro) el resultado no es una proteina con secuencia definida.
- Solo se generan coordenadas N, CA, C y O; las cadenas laterales no predichas no estan disponibles, lo que limita la evaluacion directa de interacciones atomicas.
- Los marcos de esqueleto requieren coordenadas N, CA y C completas y no colineales; entradas mal formadas o topologias inconsistentes pueden fallar en la construccion.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el codigo derivado y el uso en red; conviene revisar compatibilidad antes de uso comercial o en servicios expuestos.
- No se documentan sesgos ni tasas de alucinacion en el sentido de LLM; el riesgo equivalente es generar esqueletos fisicamente plausibles pero no funcionales, que deben validarse con predictores y cribado experimental.
- No se detalla el dataset de entrenamiento ni se redistribuye; la reproducibilidad del ajuste fino depende de datos externos.
- No hay informacion sobre cuantizaciones ni sobre rendimiento medido, por lo que las estimaciones de despliegue son orientativas.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/rfdiffusion-inpaint-seq-fold
- Variante base: https://huggingface.co/oteam/rfdiffusion-base
- Variante base epoch8: https://huggingface.co/oteam/rfdiffusion-base-epoch8
- Variante complex base: https://huggingface.co/oteam/rfdiffusion-complex-base
- Variante complex beta: https://huggingface.co/oteam/rfdiffusion-complex-beta
- Variante complex fold base: https://huggingface.co/oteam/rfdiffusion-complex-fold-base
- Variante inpaint-seq: https://huggingface.co/oteam/rfdiffusion-inpaint-seq
- Variante active-site: https://huggingface.co/oteam/rfdiffusion-active-site
- Paper: https://doi.org/10.1038/s41586-023-06415-8
- Repositorio oficial: https://github.com/RosettaCommons/RFdiffusion
- Codigo OFoldX (RFdiffusion): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/rfdiffusion
- Guia de pipelines OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Documentacion OFoldX: https://ofoldx.valtech.ai/
