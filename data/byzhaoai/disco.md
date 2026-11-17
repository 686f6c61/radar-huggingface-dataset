# byzhaoAI/DisCo

## Resumen

DisCo (Distributed Cooperation) es un paradigma de percepción colaborativa distribuida para sistemas multiagente, desarrollado por Binyu Zhao, Wei Zhang y Zhaonian Zou y publicado en la revista *Information Fusion* (Elsevier) en abril de 2026. A diferencia de un modelo de lenguaje al uso, DisCo aborda un problema específico de la robótica y los vehículos autónomos: cómo lograr una percepción colaborativa robusta entre agentes que disponen de configuraciones de sensores heterogéneas (cámaras, LiDAR o combinaciones de ambos) y que pueden incorporarse o retirarse dinámicamente del sistema.

El repositorio de Hugging Face contiene exclusivamente checkpoints unimodales preentrenados, no un modelo fundacional. Cada checkpoint corresponde a un codificador base concreto: EfficientNet + LiftSplat y EfficientNet + Unprojection para cámara, y PointPillars y SECOND para LiDAR. Sobre estos codificadores se construyen las distintas configuraciones de percepción colaborativa (homogéneas y heterogéneas) evaluadas en los conjuntos de datos OPV2V y DAIR-V2X.

La relevancia del trabajo reside en que resuelve la fusión de información entre agentes con sensores distintos sin exigir que todos compartan la misma arquitectura de codificación, algo habitual en despliegues reales de flotas y robots heterogéneos. El tamaño del repositorio es de 0,7 GB y la licencia es de tipo "other", con un fichero LICENSE incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paradigma de percepción colaborativa en dos etapas; codificadores unimodales basados en EfficientNet + LiftSplat, EfficientNet + Unprojection (cámara), PointPillars y SECOND (LiDAR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, según metadatos de la model card) |
| Licencia | other (ver fichero LICENSE del repositorio) |
| Formato de pesos | no disponible (checkpoints de PyTorch; el formato exacto no se especifica en la información proporcionada) |

## Arquitectura y entrenamiento

DisCo propone un paradigma distribuido en dos etapas para la percepción colaborativa multiagente. El repositorio distribuye checkpoints unimodales independientes, cada uno asociado a un método de codificación base: para cámara, EfficientNet combinado con LiftSplat (proyección a espacio 3D tipo lift-splat) o con Unprojection; para LiDAR, PointPillars o SECOND. Sobre estos codificadores se entrenan redes de percepción colaborativa que combinan distintas modalidades y arquitecturas, dando lugar a configuraciones homogéneas (por ejemplo, `liftsplat` o `second` sobre OPV2V) y heterogéneas (por ejemplo, `p + s` o `s + pl` sobre OPV2V, y `p + pl` o `pl + su` sobre DAIR-V2X).

El objetivo declarado es mantener un rendimiento robusto bajo configuraciones de sensores arbitrariamente heterogéneas y con incorporación o retirada dinámica de agentes. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets más allá de OPV2V y DAIR-V2X, ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). El autor advierte que los resultados numéricos pueden variar ligeramente entre máquinas debido a diferencias de hardware (tipo de GPU), versiones de CUDA/cuDNN y precisión en coma flotante.

## Capacidades

- Percepción colaborativa multiagente: fusión de información entre varios agentes para tareas de percepción conjunta.
- Fusión multimodal heterogénea: combina codificaciones de cámara (EfficientNet + LiftSplat, EfficientNet + Unprojection) y de LiDAR (PointPillars, SECOND) en una misma red colaborativa.
- Soporte de configuraciones homogéneas: redes colaborativas con un único tipo de codificación (`liftsplat`, `second`, `pillar`, `pillar&liftsplat`, `second&unprojection`).
- Soporte de configuraciones heterogéneas: pares como `p + s` / `s + p`, `s + pl` / `pl + s` (OPV2V) y `p + pl` / `pl + p`, `pl + su` / `su + pl` (DAIR-V2X).
- Tolerancia a la adición y retirada dinámica de agentes durante la operación.
- Codificación de cámara a espacio 3D mediante LiftSplat o Unprojection.
- Codificación de nubes de puntos LiDAR mediante PointPillars o SECOND.
- No dispone de generación de texto, razonamiento lingüístico, tool calling, capacidades de agente conversacional ni procesamiento de audio.

## Casos de uso

- Flotas de vehículos autónomos con sensores dispares: una flota en la que unos vehículos llevan solo cámara y otros solo LiDAR puede usar las configuraciones heterogéneas (`p + s`, `s + pl`) para compartir percepción sin exigir hardware homogéneo.
- Infraestructura vial cooperativa (V2X): en despliegues DAIR-V2X, la configuración `p + pl` permite que unidades de carretera con PointPillars colaboren con vehículos equipados con cámara y LiftSplat.
- Robots de almacén con incorporación dinámica: el paradigma tolera la entrada y salida de agentes, adecuado para flotas logísticas donde los robots se conectan y desconectan por turnos o zonas.
- Percepción aumentada en entornos con oclusión: la fusión de observaciones de múltiples agentes mitiga puntos ciegos individuales, útil en intersecciones urbanas densas.
- Investigación en fusión multimodal: los checkpoints unimodales sirven como bloques de partida para experimentar con nuevas combinaciones de codificadores cámara-LiDAR.
- Reproducción de experimentos académicos: los checkpoints publicados permiten replicar los resultados del artículo sobre OPV2V y DAIR-V2X sin reentrenar desde cero.
- Prototipado de sistemas multirobot: integrable en plataformas de robótica que requieran percepción distribuida con heterogeneidad de sensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño total del repositorio es de 0,7 GB, lo que da una orientación aproximada del peso conjunto de los checkpoints.
- GPU recomendadas: no se especifican modelos concretos; el autor menciona que los resultados pueden variar según el tipo de GPU, la versión de CUDA/cuDNN y la precisión en coma flotante.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se detallan en la información disponible; el código de referencia está en el repositorio de GitHub del proyecto (https://github.com/byzhaoAI/DisCo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DisCo (byzhaoAI) | Percepción colaborativa multiagente heterogénea | no disponible | no aplica | other | Hugging Face + Google Drive + GitHub |
| Modelos de percepción colaborativa homogénea (p. ej. baselines sobre OPV2V/DAIR-V2X) | Percepción colaborativa | no disponible | no aplica | no disponible | no disponible |
| Modelos unimodales de detección 3D (PointPillars, SECOND) | Detección LiDAR | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos cuantitativos de rendimiento ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparación se limita a la categoría y a la disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes conversacionales.
- Los checkpoints son unimodales y específicos por configuración; no existe un único modelo que cubra todas las combinaciones sin seleccionar el checkpoint adecuado.
- Los resultados numéricos pueden diferir ligeramente entre máquinas por diferencias de GPU, versiones de CUDA/cuDNN y precisión en coma flotante.
- La licencia es "other": es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial.
- Los idiomas declarados se limitan a inglés en los metadatos, aunque en la práctica el modelo no procesa lenguaje.
- No se han publicado datos de benchmarks, sesgos, tasas de alucinación (no aplicable) ni limitaciones de contexto en la información disponible.
- Para producción es necesario consultar el código de GitHub y validar la integración con el pipeline de percepción propio.

## Enlaces

- Hugging Face: https://huggingface.co/byzhaoAI/DisCo
- Paper (DOI): https://doi.org/10.1016/j.ins.2026.123529
- Código: https://github.com/byzhaoAI/DisCo
- Checkpoints (Google Drive): https://drive.google.com/drive/folders/1IbO3IaUNWJxgt1W_yM752KDmgqlXoMhT?usp=sharing
