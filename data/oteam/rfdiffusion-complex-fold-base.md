# oteam/rfdiffusion-complex-fold-base

## Resumen

RFdiffusion es un modelo de difusión para la generación de esqueletos proteicos (*backbones*) desarrollado originalmente por el laboratorio de David Baker (Universidad de Washington) y publicado en *Nature* en 2023. Esta ficha corresponde a la implementación no oficial del equipo OFoldX, distribuida bajo el identificador `oteam/rfdiffusion-complex-fold-base`, una de las ocho variantes que reproducen los checkpoints originales del repositorio RosettaCommons. El modelo revierte un proceso de difusión sobre marcos de residuos proteicos mediante un denoiser de estilo RoseTTAFold con actualizaciones estructurales SE(3)-equivariantes.

La variante *fold-conditioned* está especializada en el diseño de complejos proteicos condicionados por pliegue: genera esqueletos de proteínas que adoptan una topología diana especificada, útil para diseñar binders y complejos con una arquitectura estructural concreta. El modelo cuenta con aproximadamente 60,9 millones de parámetros (59,880 M según la model card) y un tamaño de repositorio de 0,2 GB, lo que lo hace ligero en comparación con los modelos de lenguaje contemporáneos.

Su relevancia radica en que reproduce, en una librería Python moderna (`ofoldx`), un método de referencia en diseño computacional de proteínas, con licencia AGPL-3.0 y pesos en formato safetensors. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que opera sobre coordenadas atómicas y especificaciones de *contigs*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión SE(3)-equivariante sobre marcos de residuos, con denoiser de estilo RoseTTAFold |
| Parámetros totales | 60.881.982 (59,880 M según model card) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; condicionado por MSA de tamaño 256 y pares de tamaño 128 |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Bloques principales | 32 |
| Bloques extra | 4 |
| Bloques de refinamiento | 4 |
| Pasos de difusión | 50 |
| Librería | ofoldx |
| Pipeline | other |

## Arquitectura y entrenamiento

RFdiffusion aplica un proceso de difusión inversa sobre marcos de residuos proteicos (posiciones y orientaciones). El sampler combina difusión gaussiana de traslación sobre el carbono alfa con difusión rotacional IGSO(3), y el denoiser es una red de estilo RoseTTAFold con actualizaciones estructurales SE(3)-equivariantes. La condicionamiento se realiza mediante características de secuencia, MSA (tamaño 256), pares (tamaño 128), plantillas y paso de tiempo. La variante *fold-conditioned* añade condicionamiento por pliegue diana, lo que permite generar esqueletos que adoptan una topología especificada.

El entrenamiento parte de un ajuste fino de una red RoseTTAFold sobre estructuras proteicas del PDB. Se añade ruido gaussiano a las traslaciones del carbono alfa y movimiento browniano rotacional a los marcos de residuos, y la red aprende a eliminarlo con autoconcicionamiento a lo largo de los pasos de tiempo. La model card indica que OFoldX no redistribuye el conjunto de entrenamiento y que expone el denoiser diferenciable para ajuste fino, pero no reproduce el proceso completo de *coupling* del artículo original. No se especifica el número exacto de tokens ni la composición detallada del dataset más allá de la referencia al PDB y al artículo.

## Capacidades

- Generación de esqueletos proteicos *de novo* a partir de especificaciones de *contigs*.
- *Scaffolding* de motivos estructurales: fija segmentos de origen y genera el resto.
- Diseño de complejos proteicos y binders condicionados por pliegue (esta variante).
- Condicionamiento por pliegue diana para imponer una topología concreta.
- Generación de coordenadas N, CA, C y O para residuos generados o difundidos; las cadenas laterales no predichas quedan sin asignar.
- Los residuos generados conservan la identidad `UNK`; requieren un modelo de diseño de secuencia como ProteinMPNN para asignar aminoácidos.
- Soporte de simetría: las unidades de salida relacionadas por simetría comparten entidad y secuencia.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- **Diseño de binders condicionados por pliegue**: el modelo genera esqueletos de proteínas que adoptan una topología diana, lo que permite diseñar binders con una arquitectura estructural concreta frente a una diana terapéutica. Es adecuado porque el condicionamiento por pliegue restringe el espacio de búsqueda a la geometría deseada.
- **Scaffolding de motivos funcionales**: se fijan segmentos con actividad conocida (sitios activos, epítopos) y el modelo genera el resto del esqueleto que los soporta, útil para trasplantar funciones a andamiajes nuevos.
- **Diseño *de novo* de proteínas**: generación de esqueletos de longitud controlada (por ejemplo, 100 residuos) mediante `GeneratedSegment`, que luego se secuencian con ProteinMPNN y se validan con AlphaFold u otros predictores.
- **Diseño de complejos multiproteicos**: la variante *complex* permite generar interfaces entre cadenas, aplicable a diseño de heterodímeros y complejos funcionales.
- **Generación de bibliotecas de candidatos para cribado**: al ser un modelo ligero (0,2 GB) y con 50 pasos de difusión, permite generar lotes de esqueletos candidatos que se filtran posteriormente por criterios estructurales y de secuencia.
- **Investigación en métodos generativos**: al exponer el denoiser diferenciable, sirve para experimentar con ajuste fino, nuevas condiciones o variantes de difusión en un entorno Python moderno.
- **Prototipado en pipelines de diseño computacional**: integración en flujos que encadenan generación de esqueleto, diseño de secuencia (ProteinMPNN) y predicción/validación estructural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (RMSD, *success rate*, *scaffolding accuracy*, etc.) para esta variante.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. Con ~61 M de parámetros, el modelo es pequeño y probablemente quepa en GPUs de consumo, pero no se confirma.
- **GPU recomendadas**: no disponible. Por tamaño, cabría esperar compatibilidad con GPUs consumer (RTX 3060 en adelante), pero no se especifica.
- **¿Cabe en GPU consumer?**: probablemente sí por número de parámetros, pero no confirmado en la documentación.
- **Opciones de despliegue**: la librería `ofoldx` (instalable con `pip install ofoldx`) es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. El sampler usa 50 pasos de difusión, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| `oteam/rfdiffusion-complex-fold-base` | ~60,9 M | MSA 256, pares 128, condicionamiento por pliegue | AGPL-3.0 | HuggingFace (OFoldX) |
| `oteam/rfdiffusion-complex-base` | ~59,9 M | MSA 256, pares 128, complejos y binders | AGPL-3.0 | HuggingFace (OFoldX) |
| `oteam/rfdiffusion-base` | ~59,9 M | MSA 256, pares 128, generación *de novo* y *scaffolding* | AGPL-3.0 | HuggingFace (OFoldX) |
| RFdiffusion oficial (RosettaCommons) | No disponible | No disponible | No disponible | GitHub (RosettaCommons) |

La comparativa se limita a las variantes del mismo proyecto OFoldX, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas como Chroma, FrameDiff o Proteus en la información proporcionada.

## Limitaciones y advertencias

- **Implementación no oficial**: la model card advierte explícitamente de que se trata de una implementación no oficial y de que el equipo original de RFdiffusion no escribió la tarjeta; posibles discrepancias con el modelo original.
- **Residuos sin identidad**: los esqueletos generados conservan `UNK`; es obligatorio un modelo de diseño de secuencia (ProteinMPNN) para obtener aminoácidos.
- **Cadenas laterales ausentes**: solo se generan coordenadas N, CA, C y O; las cadenas laterales no predichas no están disponibles.
- **Dependencia de la librería `ofoldx`**: el uso requiere instalar y depender de esa librería, con la documentación asociada.
- **Licencia AGPL-3.0**: licencia copyleft fuerte; el uso comercial o la integración en servicios en red puede obligar a liberar el código derivado. Revisar antes de producción.
- **Sin benchmarks publicados**: no hay métricas de rendimiento en la información disponible, lo que dificulta evaluar la fidelidad respecto al modelo original.
- **Sin datos de sesgo o alucinación**: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero no se documentan sesgos estructurales ni tasas de fallo.
- **Reproducibilidad del entrenamiento**: OFoldX no reproduce el proceso completo de *coupling* del artículo y no redistribuye el conjunto de entrenamiento.
- **Idiomas**: no aplica; el campo de idiomas figura como no disponible porque el modelo no procesa texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/rfdiffusion-complex-fold-base
- Variante base: https://huggingface.co/oteam/rfdiffusion-base
- Variante base epoch8: https://huggingface.co/oteam/rfdiffusion-base-epoch8
- Variante complex-base: https://huggingface.co/oteam/rfdiffusion-complex-base
- Variante complex-beta: https://huggingface.co/oteam/rfdiffusion-complex-beta
- Variante inpaint-seq: https://huggingface.co/oteam/rfdiffusion-inpaint-seq
- Variante inpaint-seq-fold: https://huggingface.co/oteam/rfdiffusion-inpaint-seq-fold
- Variante active-site: https://huggingface.co/oteam/rfdiffusion-active-site
- Código OFoldX (rfdiffusion): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/rfdiffusion
- Guía de pipelines OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Documentación OFoldX: https://ofoldx.valtech.ai/
- Repositorio oficial RFdiffusion: https://github.com/RosettaCommons/RFdiffusion
- Artículo (Nature, 2023): https://doi.org/10.1038/s41586-023-06415-8
