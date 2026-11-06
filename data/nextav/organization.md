# nextav/organization

## Resumen

`nextav/organization` no es un modelo de aprendizaje automatico entrenado, sino el repositorio de perfil organizativo de NextAV, una organizacion dedicada a la observacion de la Tierra y a la superresolucion de imagenes de satelite. El repositorio actua como indice de gobierno, documentacion y catalogo de los proyectos reales de la organizacion, que se alojan en repositorios separados bajo el prefijo `nextav-<proyecto>`. Su publicacion en Hugging Face sirve como punto de entrada para localizar esos repositorios y entender las lineas de trabajo.

La organizacion trabaja en cuatro areas principales: superresolucion optica de Sentinel-2 L2A (de 10 m a 1-2,5 m de GSD), superresolucion SAR de Sentinel-1 banda C (10 m) a Capella banda X (submetrica), deteccion de plumas de metano con imagenes hiperespectrales aerotransportadas y herramientas de inferencia y despliegue en CPU/GPU y AWS Marketplace. Las arquitecturas citadas incluyen UNet, DiT, EDSR, RRDB, Diffusion Transformers y Flow Matching, sobre PyTorch y PyTorch Lightning.

Es relevante ahora porque agrupa en un unico punto de entrada varios proyectos de codigo abierto (licencia Apache 2.0) orientados a tareas geoespaciales concretas, con enfasis en datos de Sentinel-1, Sentinel-2, Capella, WorldStrat, NAIP, AVIRIS y ERA5. No obstante, este repositorio en si no contiene pesos, no declara parametros ni contexto y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de organizacion; los proyectos referenciados usan UNet, DiT, EDSR, RRDB, Diffusion Transformers y Flow Matching) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado ni pesos. Es un indice organizativo que documenta la mision, las actividades principales, los repositorios y las tecnologias de NextAV. Por tanto, no hay informacion sobre arquitectura de red, numero de parametros, volumen de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion como RLHF o DPO aplicables a este artefacto.

La informacion tecnica disponible describe las arquitecturas empleadas en los proyectos de la organizacion: UNet, DiT, EDSR, RRDB, Diffusion Transformers y Flow Matching, implementadas con PyTorch y PyTorch Lightning. Los datos de entrenamiento citados abarcan Sentinel-1 (SAR), Sentinel-2 (optico), Capella (SAR), WorldStrat, NAIP, AVIRIS y ERA5. Los detalles concretos de cada modelo, incluyendo parametros, contexto y regimen de entrenamiento, deben consultarse en los repositorios `nextav-s1sr`, `nextav-s2sr`, `nextav-s2sr-inference` y `nextav-geoemit`.

## Capacidades

- Superresolucion optica: reconstruccion de reflectancia Sentinel-2 L2A desde 10 m hasta 1-2,5 m de GSD mediante aprendizaje profundo multi-temporal.
- Superresolucion SAR: traduccion entre bandas, de Sentinel-1 banda C (10 m) a Capella banda X (submetrica), con modelos de difusion y flow matching.
- Deteccion de emisiones: identificacion de plumas de metano en imagenes hiperespectrales aerotransportadas y mapeo de firmas de carbono con transformers sensibles a la absorcion espectral.
- Fusion multisensor: integracion de datos opticos, SAR e hiperespectrales en pipelines de preprocesamiento geoespacial.
- Construccion de datasets geoespaciales a partir de fuentes como WorldStrat, NAIP, AVIRIS y ERA5.
- Inferencia y despliegue: herramientas de produccion para CPU y GPU, con empaquetado Docker, despliegue en AWS Marketplace ECS y ejecucion en SLURM/HPC.
- Tareas auxiliares de vision: deteccion de objetos y segmentacion sobre imagenes de satelite.
- Soporte de tool calling, agentes, razonamiento multi-paso o capacidades multilingues: no disponible para este repositorio.

## Casos de uso

- Monitorizacion agricola de alta resolucion: usar `nextav-s2sr` para elevar parcelas Sentinel-2 de 10 m a 1-2,5 m y detectar estres hidrico o cambios fenologicos en cultivos con mayor detalle espacial.
- Deteccion de fugas de metano: aplicar `nextav-geoemit` sobre datos hiperespectrales aerotransportados para localizar plumas y priorizar inspecciones en infraestructuras de gas.
- Analisis SAR en condiciones de nubosidad: emplear `nextav-s1sr` para obtener imagenes de alta resolucion a partir de Sentinel-1 banda C, util en zonas con cobertura nubosa persistente donde la optica falla.
- Fusion optico-SAR para cartografia: combinar salidas de `nextav-s2sr` y `nextav-s1sr` en pipelines de analitica geoespacial para actualizar mapas de uso del suelo.
- Despliegue en produccion en la nube: usar `nextav-s2sr-inference` para servir inferencia en contenedores Docker sobre AWS ECS, integrable en flujos operativos de observacion de la Tierra.
- Procesamiento por lotes en HPC: ejecutar los modelos de superresolucion en clústeres SLURM para procesar tiles Sentinel de forma masiva.
- Investigacion reproducible: reutilizar los repositorios y datasets citados como base para experimentos de superresolucion y deteccion de emisiones con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` del repositorio declara `results: []`, sin metricas asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este repositorio; depende de cada modelo de `nextav-s1sr`, `nextav-s2sr` y `nextav-geoemit`.
- GPU recomendadas: no disponible de forma especifica; la organizacion menciona soporte CPU/GPU y ejecucion en SLURM/HPC.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Docker, AWS Marketplace ECS, SLURM/HPC, CPU y GPU segun la documentacion de `nextav-s2sr-inference`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nextav/organization | Repositorio de organizacion | no disponible | no disponible | Apache 2.0 | Hugging Face |
| nextav-s2sr | Modelo de superresolucion optica | no disponible | no disponible | Apache 2.0 (segun repositorio) | Hugging Face |
| nextav-s1sr | Modelo de superresolucion SAR | no disponible | no disponible | Apache 2.0 (segun repositorio) | Hugging Face |
| nextav-geoemit | Modelo de deteccion de emisiones | no disponible | no disponible | Apache 2.0 (segun repositorio) | Hugging Face |

No se dispone de datos de rendimiento ni de parametros para establecer una comparacion cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Este repositorio no contiene pesos ni codigo de inferencia; es un indice organizativo. Cualquier uso practico requiere acudir a los repositorios `nextav-*` correspondientes.
- No se han publicado benchmarks ni metricas de validacion en este repositorio, por lo que no es posible evaluar su rendimiento de forma objetiva a partir de esta ficha.
- El unico idioma declarado es `en`; no hay soporte multilingue documentado.
- Los modelos de superresolucion y de deteccion de emisiones pueden producir artefactos o falsos positivos; se recomienda validacion con datos independientes antes de uso operativo.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de las fuentes de datos subyacentes (Sentinel, Capella, NAIP, AVIRIS), que pueden tener restricciones propias.
- Los informes de seguridad deben canalizarse de forma privada por los canales de Hugging Face, nunca en issues publicos.
- No hay informacion sobre sesgos, alucinacion o limites de contexto aplicables a este repositorio.

## Enlaces

- Repositorio de organizacion: https://huggingface.co/nextav/organization
- Organizacion en Hugging Face: https://huggingface.co/nextav
- nextav-geoemit: https://huggingface.co/nextav/nextav-geoemit
- nextav-handbook: https://huggingface.co/nextav/nextav-handbook
- nextav-s1sr: https://huggingface.co/nextav/nextav-s1sr
- nextav-s2sr: https://huggingface.co/nextav/nextav-s2sr
- nextav-s2sr-inference: https://huggingface.co/nextav/nextav-s2sr-inference
