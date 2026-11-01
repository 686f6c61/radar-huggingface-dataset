# oteam/rfdiffusion-complex-beta

## Resumen

RFdiffusion es un modelo de difusión para la generación de esqueletos proteicos (*protein backbone generation*) desarrollado originalmente por el laboratorio de David Baker (Watson et al., *Nature* 2023). La variante `oteam/rfdiffusion-complex-beta` es una implementación no oficial publicada por el equipo OFoldX que reproduce el checkpoint `Complex_beta_ckpt.pt`, orientado al diseño de complejos proteína-proteína y binders con topologías diversas y ricas en láminas beta. El modelo revierte un proceso de difusión sobre marcos de residuos (*residue frames*) empleando un denoiser con arquitectura tipo RoseTTAFold y actualizaciones estructurales SE(3)-equivariantes.

Con 60.881.022 parámetros (aproximadamente 60,9 M), el modelo opera con 32 bloques principales, 4 bloques extra y 4 bloques de refinamiento, una pila de MSA de tamaño 256 y un *pair representation* de tamaño 128, con 50 pasos de difusión. Resuelve el problema del diseño *de novo* de estructuras proteicas condicionado por especificaciones de *contig* y motivos estructurales opcionales, una tarea central en biología computacional para el diseño de binders, enzimas y andamios proteicos.

Su relevancia actual radica en que permite generar esqueletos proteicos con control topológico sin depender del repositorio original de RosettaCommons, integrándose en el ecosistema Python de OFoldX. Es importante subrayar que se trata de una reimplementación no oficial: el equipo original de RFdiffusion no participó en la redacción de la model card ni validó esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión SE(3)-equivariante con denoiser tipo RoseTTAFold |
| Parametros totales | 60.881.022 (aprox. 60,9 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre especificaciones de contig y motivos, no sobre texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

Especificaciones adicionales del autor:

| Parametro | Valor |
|---|---|
| Bloques principales | 32 |
| Bloques extra | 4 |
| Bloques de refinamiento | 4 |
| Tamano de MSA | 256 |
| Tamano de pair representation | 128 |
| Pasos de difusión | 50 |
| Libreria | ofoldx |
| Tamano del repositorio | 0,2 GB |
| Pipeline | other |

## Arquitectura y entrenamiento

RFdiffusion aplica un proceso de difusión inversa sobre marcos de residuos proteicos (posiciones y orientaciones). El *forward process* combina difusión gaussiana sobre las traslaciones del carbono alfa con movimiento browniano rotacional en el grupo IGSO(3) para las orientaciones. El denoiser, con arquitectura tipo RoseTTAFold, recibe como condicionamiento características de secuencia, MSA, representación de pares, plantillas y el paso de tiempo de difusión, y produce actualizaciones estructurales SE(3)-equivariantes. El modelo emplea *self-conditioning* a lo largo de los pasos de tiempo para mejorar la calidad de la generación.

El entrenamiento parte de un afinamiento de una red RoseTTAFold sobre estructuras proteicas del PDB. La model card indica que la construcción de los datos de entrenamiento se describe en el paper original y que OFoldX no redistribuye el conjunto de datos. El modelo aprende a recuperar esqueletos proteicos a partir de coordenadas ruidosas con condicionamiento estructural opcional. La variante `complex-beta` está especializada en el diseño de complejos y binders con topologías diversas ricas en láminas beta. OFoldX expone el denoiser diferenciable para entrenamiento y afinamiento, aunque no reproduce el pipeline completo de entrenamiento original.

## Capacidades

- Generación *de novo* de esqueletos proteicos a partir de especificaciones de *contig* (segmentos generados con longitud definida).
- *Motif scaffolding*: incorporación de motivos estructurales fijos conservando sus coordenadas y marcos de origen.
- Diseño de complejos proteína-proteína y binders, con especial énfasis en topologías ricas en láminas beta en esta variante.
- Condicionamiento por secuencia, MSA, representación de pares, plantillas y paso de tiempo de difusión.
- Generación de coordenadas N, CA, C y O para residuos generados o difundidos; las cadenas laterales no predichas quedan sin coordenadas.
- Soporte de simetría: las unidades de salida relacionadas por simetría comparten entidad y secuencia.
- Los residuos generados conservan la identidad desconocida `UNK`; requieren un modelo de diseño de secuencia (p. ej., ProteinMPNN) para asignar aminoácidos.
- No soporta *tool calling*, agentes ni capacidades multilingües: es un modelo biológico especializado, no un modelo de lenguaje.

## Casos de uso

- Diseño de binders proteicos: la variante `complex-beta` genera esqueletos de binders con topologías ricas en láminas beta contra una diana, definiendo el segmento generado mediante `GeneratedSegment` y fijando el motivo de la diana. Es adecuado por su especialización en complejos y su capacidad de condicionamiento estructural.
- *Motif scaffolding* de sitios funcionales: se fijan residuos de un sitio activo o epítopo y el modelo genera el resto del andamio proteico conservando las coordenadas del motivo, útil para trasplantar funciones a andamios nuevos.
- Diseño *de novo* de proteínas con longitud controlada: mediante especificaciones de *contig* se generan esqueletos de, por ejemplo, 100 residuos, que luego se secuencian con ProteinMPNN y se validan con predicción de estructura.
- Generación de andamios para ingeniería de enzimas: se conserva el motivo catalítico y se generan entornos estructurales alternativos para explorar variantes funcionales.
- Diseño de complejos simétricos: el soporte de simetría permite generar unidades relacionadas que comparten entidad y secuencia, útil para diseñar oligómeros con simetría definida.
- Exploración topológica en pipelines de diseño computacional: integrado en el ecosistema OFoldX, permite encadenar generación de esqueleto, diseño de secuencia y predicción de estructura en un flujo por etapas.
- Investigación en métodos generativos para biología estructural: al exponer el denoiser diferenciable, sirve para experimentar con entrenamiento y afinamiento de modelos de difusión estructural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con aproximadamente 60,9 M de parámetros, el peso en precisión FP32 ronda los 0,24 GB, por lo que el modelo es muy ligero en memoria; sin embargo, la memoria real depende del tamaño de la pila de MSA (256), la representación de pares (128), la longitud de la proteína y el número de pasos de difusión (50).
- GPU recomendadas: no disponible de forma explícita. Por tamaño, cualquier GPU con suficiente memoria para las representaciones intermedias debería poder ejecutarlo; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: probable por el reducido número de parámetros, pero no confirmada en la información disponible.
- Opciones de despliegue: el modelo depende de la librería `ofoldx` (`pip install ofoldx`) y se ejecuta mediante `ofoldx.pipeline("design", ...)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/rfdiffusion-complex-beta | 60,9 M | Difusión SE(3) para esqueletos proteicos (variante complejos beta) | No aplica | AGPL-3.0 | HuggingFace (OFoldX) |
| oteam/rfdiffusion-base | 59,879 M | Difusión SE(3) para esqueletos proteicos (generación y *motif scaffolding*) | No aplica | AGPL-3.0 | HuggingFace (OFoldX) |
| oteam/rfdiffusion-complex-base | 59,879 M | Difusión SE(3) para complejos y binders | No aplica | AGPL-3.0 | HuggingFace (OFoldX) |
| RFdiffusion oficial (RosettaCommons) | No disponible | Difusión SE(3) para esqueletos proteicos | No aplica | No disponible en la información | GitHub (RosettaCommons) |

Las variantes de OFoldX comparten arquitectura y tamaño (32+4+4 bloques, MSA 256, pair 128, 50 pasos), diferenciándose por el checkpoint y su especialización funcional. No se dispone de datos de rendimiento comparativo entre variantes en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: el equipo original de RFdiffusion no escribió ni validó esta model card; los resultados pueden diferir de los del repositorio oficial de RosettaCommons.
- Los residuos generados tienen identidad `UNK`; el modelo no asigna secuencia de aminoácidos, por lo que requiere un modelo de diseño de secuencia (p. ej., ProteinMPNN) en el pipeline.
- Solo se generan coordenadas N, CA, C y O; las cadenas laterales no predichas no están disponibles, lo que limita la evaluación directa de interacciones atómicas finas.
- Los marcos de esqueleto requieren coordenadas N, CA y C completas y no colineales; la construcción topológica verifica conexiones retenidas y nuevos enlaces solicitados, lo que impone restricciones de entrada.
- Sesgos conocidos: no disponibles en la información proporcionada; cabe esperar sesgos derivados de la distribución del PDB utilizado en el entrenamiento original.
- Riesgo de alucinación estructural: como modelo generativo, puede producir esqueletos no plegables o no funcionales; se recomienda validación con predicción de estructura y métricas de diseño.
- Limitaciones de contexto o idioma: no aplica en el sentido lingüístico; las limitaciones vienen dadas por la longitud de proteína y la complejidad del condicionamiento.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red puede requerir la publicación del código modificado. Verificar compatibilidad antes de usar en producción.
- No se redistribuye el conjunto de datos de entrenamiento; la reproducibilidad completa del entrenamiento no está garantizada por OFoldX.
- Fecha de creación del repositorio (2026-11-01) y ausencia de descargas y likes: modelo reciente y sin validación comunitaria visible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/rfdiffusion-complex-beta
- Variante base: https://huggingface.co/oteam/rfdiffusion-base
- Variante base epoch8: https://huggingface.co/oteam/rfdiffusion-base-epoch8
- Variante complex-base: https://huggingface.co/oteam/rfdiffusion-complex-base
- Variante complex-fold-base: https://huggingface.co/oteam/rfdiffusion-complex-fold-base
- Variante inpaint-seq: https://huggingface.co/oteam/rfdiffusion-inpaint-seq
- Variante inpaint-seq-fold: https://huggingface.co/oteam/rfdiffusion-inpaint-seq-fold
- Variante active-site: https://huggingface.co/oteam/rfdiffusion-active-site
- Paper original: https://doi.org/10.1038/s41586-023-06415-8
- Repositorio oficial RFdiffusion: https://github.com/RosettaCommons/RFdiffusion
- Codigo OFoldX (rfdiffusion): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/rfdiffusion
- Guia de pipelines OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Sitio de OFoldX: https://ofoldx.valtech.ai/
