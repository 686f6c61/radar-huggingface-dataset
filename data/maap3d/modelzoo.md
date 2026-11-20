# MAAP3D/ModelZoo

## Resumen

MAAP3D/ModelZoo es un repositorio de modelos de vision por computador orientados a la deteccion de animales y la estimacion de poses (keypoints) en imagenes. Lo publica el proyecto MAAP3D y no es un modelo generativo ni un LLM, sino una coleccion de checkpoints de detectores de cajas delimitadoras y estimadores top-down de keypoints para distintas especies de aves y primates: pichon, arrendajo siberiano, corneja, ave generica, simios (chimpances y bonobos) y carboneros (great tit y blue tit).

El repositorio incluye seis pares config/checkpoint de pose y cuatro checkpoints de detector, con un total de doce slots definidos, de los cuales algunos estan vacios (bird-detection y greti-detection no incluyen detector). Todos los artefactos suministrados tienen estado "draft": los ficheros existen, pero la carga, la inferencia y el emparejamiento detector-pose no han sido validados por el autor en esta release. Esto es relevante para quien evalue el modelo: se trata de material de investigacion en preparacion, no de un paquete listo para produccion.

La relevancia actual del repositorio es acotada y muy especifica: sirve a proyectos de ecologia conductual, seguimiento de fauna y analisis de video biologico que necesiten detectar y estimar la pose de aves y primates con modelos preentrenados derivados de OpenMMLab (MMPose) y, presumiblemente, YOLO. El tamano del repo es de 1,0 GB y la licencia es mixta (AGPL-3.0-or-later para contribuciones originales de MAAP3D, con terminos upstream retenidos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (detectores tipo YOLO y estimadores de pose top-down derivados de MMPose/OpenMMLab, segun la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | Mixta: AGPL-3.0-or-later para contribuciones originales de MAAP3D; configs derivadas de OpenMMLab bajo Apache-2.0; terminos upstream de datasets y modelos retenidos. Etiqueta raiz: maap3d-model-zoo-mixed-licenses |
| Formato de pesos | `.pt` (detectores) y `.pth` (pose), con configs `.py` para MMPose; nombres de fichero basados en el model ID |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura concreta de cada checkpoint. Indica que los seis configs de pose suministrados especifican estimadores top-down, es decir, que requieren cajas de deteccion como entrada y predicen keypoints dentro de cada caja. Los detectores se describen como modelos de cajas delimitadoras, y la propia card senala que la arquitectura y las etiquetas de clase de los detectores "permanecen sin confirmar". Los configs derivados de OpenMMLab conservan terminos Apache-2.0, lo que sugiere un pipeline MMPose para la parte de pose.

Respecto a los datos de entrenamiento, la card agrupa los modelos por especie y cita las fuentes que el autor declara: CHIRP para el arrendajo siberiano, 3D-POP para pichones, 3D-SOCS para carboneros, ChimpACT y OpenApePose para simios, y CUB (release correspondiente) y Animal Kingdom para aves genericas. No se especifican numero de imagenes, numero de tokens ni composicion exacta del dataset, ni se menciona RLHF, DPO ni tecnicas de alineacion (no aplican a este tipo de modelos). Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o attention linear, que no tienen sentido en este contexto.

## Capacidades

- Deteccion de cajas delimitadoras de aves y primates en imagenes (pichon, arrendajo siberiano, corneja, ave generica, simios).
- Estimacion de keypoints (pose) para las mismas especies, en modalidad top-down.
- Cobertura por grupos: ape (chimpances, bonobos), bird (rango de aves), crow (corneja de pico grande), greti (carbonero comun y carbonero azul), jays (arrendajo siberiano), pigeons (pichones).
- Integracion con el ecosistema OpenMMLab/MMPose mediante configs `.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No se documentan capacidades de vision-lenguaje, audio ni modos de "thinking".

## Casos de uso

- Monitorizacion de fauna avicola en estudios de ecologia: el modelo de deteccion localiza aves en fotogramas de camaras trampa y el de pose extrae keypoints para analisis de comportamiento; adecuado por su especializacion en especies concretas (pichon, arrendajo, corneja).
- Analisis de video de colonias de pichones con 3D-POP: el par pigeon-detection/pigeon-pose permite reconstruir poses individuales para estudios de dinamica social, siempre que se valide la inferencia antes de usarlo.
- Estudio de primates en libertad: el par ape-detection/ape-pose, entrenado con ChimpACT y OpenApePose, sirve para analizar posturas de chimpances y bonobos en grabaciones de campo.
- Seguimiento de aves paseriformes en proyectos de anillamiento: el modelo greti (carboneros) facilita la extraccion de poses en imagenes de captura para medir morfologia o postura.
- Investigacion sobre arrendajo siberiano con el dataset CHIRP: el par jays permite replicar o extender analisis de pose sobre ese corpus.
- Pipeline de vision para ornitologia comparada: combinar el detector generico de aves (cuando se suministre) con los estimadores de pose por especie para construir un sistema modular de analisis de imagenes.
- Base para fine-tuning en nuevas especies: al estar los configs en formato MMPose y los checkpoints en `.pth`/`.pt`, un equipo puede reutilizarlos como inicializacion para sus propios datos, asumiendo la licencia AGPL y los terminos upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las afirmaciones cualitativas de rendimiento son reportadas por el autor y que la inferencia no ha sido validada en esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repo es de 1,0 GB, lo que sugiere checkpoints ligeros, pero no se especifica el consumo por modelo.
- GPU recomendadas: no disponible. Por el tipo de modelos (detectores y pose top-down de OpenMMLab), es razonable esperar que quepan en GPUs consumer, pero no hay datos confirmados.
- Compatibilidad con GPU consumer: no confirmada; requiere validacion.
- Opciones de despliegue: MMPose/MMDetection (OpenMMLab) para los configs `.py` y checkpoints `.pth`; para los detectores `.pt` se sugiere un runtime compatible con YOLO, aunque la arquitectura no esta confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAAP3D/ModelZoo | Deteccion + pose animal (multi-especie) | No disponible | No aplica | Mixta (AGPL-3.0-or-later + upstream) | Hugging Face, estado draft |
| MMPose (OpenMMLab) | Framework de pose | No disponible | No aplica | Apache-2.0 | Publico, modelos preentrenados variados |
| YOLO (Ultralytics) | Deteccion de objetos | No disponible | No aplica | AGPL-3.0 / comercial | Publico, amplia comunidad |
| Animal Kingdom / OpenApePose (datasets y modelos asociados) | Pose animal | No disponible | No aplica | Segun dataset | Publico, orientado a investigacion |

No se dispone de datos numericos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Todos los artefactos suministrados estan en estado "draft": carga, predicciones y emparejamiento detector-pose no validados.
- Los detectores de bird y greti no estan suministrados; los pose correspondientes requieren deteccion pero no tienen detector recomendado (`recommended_detector: null`).
- La arquitectura y las etiquetas de clase de los detectores no estan confirmadas.
- Riesgo de sesgo por especie y por dataset de origen (CHIRP, 3D-POP, 3D-SOCS, ChimpACT, OpenApePose, CUB, Animal Kingdom): el rendimiento fuera de esas distribuciones es incierto.
- Riesgo de falsos positivos y de fallos en poses con oclusiones, tipico de estimadores top-down, aunque no se documenta explicitamente.
- Licencia mixta y revision de terminos upstream pendiente: no se garantiza una licencia uniforme verificada para todos los artefactos. El uso comercial requiere revision legal caso por caso (AGPL-3.0-or-later es copyleft fuerte).
- Se solicita citar MAAP3D y, segun el grupo, ChimpACT, OpenApePose, CUB, Animal Kingdom, 3D-SOCS, CHIRP y 3D-POP.
- Sin garantias de produccion: no usar en sistemas criticos sin validacion previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MAAP3D/ModelZoo
- Politica de licencia: https://huggingface.co/MAAP3D/ModelZoo/blob/main/LICENSE_POLICY.md
- Fichero LICENSE: https://huggingface.co/MAAP3D/ModelZoo/blob/main/LICENSE
- Avisos de terceros: https://huggingface.co/MAAP3D/ModelZoo/blob/main/THIRD_PARTY_NOTICES.md
- Citaciones: https://huggingface.co/MAAP3D/ModelZoo/blob/main/CITATIONS.md
- Citaciones BibTeX: https://huggingface.co/MAAP3D/ModelZoo/blob/main/CITATIONS.bib
- Model cards por especie (dentro del repo): `pigeons/detection/README.md`, `pigeons/pose/README.md`, `jays/detection/README.md`, `jays/pose/README.md`, `crow/detection/README.md`, `crow/pose/README.md`, `bird/pose/README.md`, `ape/detection/README.md`, `ape/pose/README.md`, `greti/detection/README.md`, `greti/pose/README.md`
- OpenMMLab MMPose: https://github.com/open-mmlab/mmpose
- OpenMMLab MMDetection: https://github.com/open-mmlab/mmdetection
