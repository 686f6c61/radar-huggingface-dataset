# NKI-AI/direct-vsharp-multianatomy

## Resumen

DIRECT — vSHARP multi-anatomy es un conjunto de pesos preentrenados para reconstrucción de resonancia magnética (MRI) multicanal (multi-coil) basados en el método vSHARP, empaquetados para su uso con el framework DIRECT del Netherlands Cancer Institute (NKI-AI). El repositorio no contiene un modelo único, sino seis pares de configuración y pesos (`vsharp_brain`, `vsharp_knee`, `vsharp_prostate`, `vsharp_breast`, `vsharp_cardiac` y `vsharp_universal`), cada uno entrenado sobre una anatomía o agregado de anatomías de los ecosistemas fastMRI y CMRxRecon.

El problema que resuelve es la aceleración de la adquisición: a partir de un k-space submuestreado con un factor de aceleración dado (R entre 2 y 10) y un esquema de muestreo concreto (equiespaciado, aleatorio, gaussiano 1D/2D, Poisson de densidad variable o radial), el modelo produce la reconstrucción de la imagen. Frente a los modelos atados a una única aceleración, estos checkpoints se entrenaron con un calendario mixto de cinco factores R y seis esquemas de muestreo, lo que permite cambiar el patrón de máscara en inferencia editando el YAML, sin reentrenar.

Es relevante ahora porque cubre cinco anatomías heterogéneas (cerebro, rodilla, próstata, mama y cardíaca cine) más un modelo universal entrenado conjuntamente sobre todas ellas y sobre las ediciones 2023, 2024 y 2025 de CMRxRecon, todo bajo licencia Apache 2.0 y con un pipeline de inferencia reproducible vía CLI. El tamaño del repositorio es de 3,2 GB; no se especifican en la información disponible el número de parámetros ni la longitud de contexto, que en un modelo de imagen no aplica en los términos habituales de un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vSHARP (reconstrucción de MRI paralela; ver sección de arquitectura) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de imagen; la entrada la define la matriz de k-space y el número de bobinas de cada anatomía) |
| Tipos de cuantizacion | no disponible; se distribuyen pesos PyTorch sin variantes cuantizadas publicadas |
| Idiomas soportados | no disponible (no aplica; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` + configuración YAML de inferencia (`vsharp_<name>.yaml` / `vsharp_<name>.pt`) |
| Tarea (pipeline) | image-to-image (reconstrucción de k-space a imagen) |
| Modalidad | MRI multicanal (multi-coil), 2D por slices |
| Librería / framework | `direct` (NKI-AI/direct), Python 3.12 |
| Variantes incluidas | brain, knee, prostate, breast, cardiac, universal |
| Aceleraciones de entrenamiento (R) | 2, 4, 6, 8, 10 |
| Fracciones de centro (ACS) | 0.16, 0.08, 0.06, 0.04, 0.02 (emparejadas 2→0.16, 4→0.08, 6→0.06, 8→0.04, 10→0.02) |
| Esquemas de muestreo | FastMRIEquispaced, FastMRIRandom, Gaussian1D, Gaussian2D, VariableDensityPoisson, Radial |
| Tamaño del repositorio | 3,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-08-09 / 2026-10-21 |

Máscaras por defecto de cada YAML publicado (inferencia con una única R y una única ACS):

| Par de ficheros | Máscara por defecto | R / ACS por defecto |
|---|---|---|
| `vsharp_brain.{yaml,pt}` | FastMRIRandom | 4× / 0.08 |
| `vsharp_knee.{yaml,pt}` | FastMRIEquispaced | 4× / 0.08 |
| `vsharp_prostate.{yaml,pt}` | FastMRIEquispaced | 4× / 0.08 |
| `vsharp_breast.{yaml,pt}` | Radial | 4× / 0.08 |
| `vsharp_cardiac.{yaml,pt}` | FastMRIEquispaced | 4× / 0.08 |
| `vsharp_universal.{yaml,pt}` | FastMRIEquispaced | 4× / 0.08 |

## Arquitectura y entrenamiento

vSHARP es un método de reconstrucción de MRI paralela basado en descomposición de variables con splitting half-quadratic y optimización tipo ADMM, según el artículo de referencia (arXiv:2309.09954). La implementación se distribuye a través del toolkit DIRECT, que expone la reconstrucción como una tarea image-to-image: la entrada es el k-space multicanal submuestreado y la salida es el volumen reconstruido. La model card no detalla el número de parámetros, la profundidad de la red ni el diseño exacto del bloque desplegado (unrolled), por lo que esos datos deben consultarse en el paper. Los YAMLs publicados son exclusivamente de inferencia: no incluyen bloques `training` ni `validation`.

El entrenamiento siguió un calendario mixto idéntico para todas las variantes: aceleraciones R de 2, 4, 6, 8 y 10 con fracciones de centro ACS de 0.16, 0.08, 0.06, 0.04 y 0.02 respectivamente, y seis esquemas de muestreo (FastMRIEquispaced, FastMRIRandom, Gaussian1D, Gaussian2D, VariableDensityPoisson y Radial). Esta mezcla evita el sobreajuste a una máscara concreta y permite cambiar el patrón en inferencia editando `inference.dataset.transforms.masking` con listas de longitud 1. En cuanto a los datos: `vsharp_brain` y `vsharp_knee` usan fastMRI multi-coil cartesiano; `vsharp_prostate` usa fastMRI prostate T2 con tres averages a GRAPPA R=2, reconstruidos por average y combinados después en un único volumen completamente muestreado; `vsharp_breast` parte de adquisición radial GRASP DCE regridded a cartesiano; `vsharp_cardiac` usa CMRxRecon 2023 cine multi-coil; y `vsharp_universal` se entrena conjuntamente sobre todas esas anatomías más CMRxRecon 2023/2024/2025, con el mismo preprocesado. El número total de volúmenes de entrenamiento y de tokens/epochs no está disponible en la información proporcionada.

## Capacidades

- Reconstrucción de MRI multicanal a partir de k-space submuestreado, con salida de imagen en el dominio de la imagen.
- Generalización de máscara: acepta los seis esquemas de muestreo del entrenamiento y cualquier R de {2, 4, 6, 8, 10} con su ACS emparejada, configurable por YAML.
- Cobertura anatómica: cerebro, rodilla, próstata (T2), mama (DCE radial regridded) y cardíaca cine, más un checkpoint universal multi-anatomía y multi-retador.
- Transferencia entre dominios de adquisición: el pipeline documenta el regridding radial→cartesiano (mama) y la combinación de averages con GRAPPA (próstata).
- Listas de ficheros train/val/test incluidas (`vsharp_multianatomy_lists.zip`) para brain, knee, prostate, breast, Calgary-Campinas y CMRxRecon 2023/2024/2025, lo que permite reproducir particiones.
- Ejecución multi-GPU mediante el flag `--num-gpus` de `direct predict`.
- No dispone de tool calling, razonamiento multi-paso, agentes, visión natural ni audio: es un modelo de reconstrucción de imagen médica, no un modelo de lenguaje.
- No se declaran capacidades multilingües ni de generación de texto.

## Casos de uso

- Reconstrucción retrospectiva de datasets fastMRI: aplicar `vsharp_brain` o `vsharp_knee` sobre `multicoil_val` con `direct predict` para generar reconstrucciones a R=4 y comparar con el suelo de referencia completamente muestreado en estudios de reproducibilidad.
- Investigación en aceleración agresiva: usar R=8 o R=10 (ACS 0.04 y 0.02) para estudiar el límite de calidad de imagen en exploraciones que requieren reducir el tiempo de adquisición, evaluando el compromiso entre aceleración y artefactos.
- Reconstrucción cardíaca cine: emplear `vsharp_cardiac` sobre volúmenes CMRxRecon para investigar reconstrucción de secuencias dinámicas multi-coil con máscara equiespaciada.
- Mama con adquisición radial: usar `vsharp_breast` en pipelines DCE donde el k-space radial se ha regridded a cartesiano, un caso poco cubierto por los modelos cartesianos convencionales.
- Modelo universal como línea base multi-anatomía: `vsharp_universal` sirve como referencia única para comparar contra los modelos específicos por anatomía y medir la penalización o la ganancia de un entrenamiento conjunto.
- Punto de partida para fine-tuning: el YAML de inferencia y los pesos sirven como inicialización para reentrenar sobre una anatomía nueva o un esquema de muestreo no cubierto, reutilizando el calendario mixto documentado.
- Preprocesado para tareas downstream: generar reconstrucciones aceleradas antes de segmentación o cuantificación, de modo que el pipeline posterior se entrene con la misma distribución de artefactos que verá en producción.
- Docencia y validación metodológica: comparar reconstrucciones a distintos R y esquemas de muestreo manteniendo fijos los pesos, lo que aísla el efecto de la máscara.
- Evaluación de robustez multi-retador: usar las listas de CMRxRecon 2023/2024/2025 para medir deriva de rendimiento entre ediciones del challenge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de PSNR, SSIM, NMSE ni comparaciones cuantitativas con otras técnicas de reconstrucción (por ejemplo, modelos tipo unrolled/varNet o reconstrucción por compressed sensing), ni cifras de latencia. Los únicos datos de rendimiento declarados son los hiperparámetros del protocolo de entrenamiento (R de 2 a 10, ACS de 0.16 a 0.02, seis esquemas de muestreo), que no constituyen una evaluación de calidad de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. DIRECT no publica cifras de consumo de memoria en la información proporcionada; el requisito depende del número de bobinas, del tamaño de la matriz de k-space y del número de slices procesados por lote.
- Tamaño del artefacto: 3,2 GB para el repositorio completo (seis pares YAML/`.pt` más el ZIP de listas de ficheros); no hay desglose oficial por checkpoint.
- GPU recomendadas: no disponible. La CLI usa CUDA con el flag `--num-gpus 1` como valor documentado, y admite reparto multi-GPU; no se especifican modelos concretos (A100, H100, RTX 4090) ni mínimos.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible. El tamaño de los pesos es moderado, pero la memoria de activaciones durante la reconstrucción multi-coil puede dominar el consumo.
- Opciones de despliegue: exclusivamente el CLI de DIRECT (`direct predict <output_dir> --cfg <yaml> --checkpoint <pt> --data-root <ruta> --num-gpus N`), instalado con `git clone https://github.com/NKI-AI/direct.git` y `pip install --no-build-isolation -e ".[dev]"` en un entorno conda con Python 3.12 y `meson-python`/`meson`/`ninja`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa interna entre las variantes publicadas en este mismo repositorio:

| Variante | Datos de entrenamiento | Máscara por defecto | R / ACS por defecto |
|---|---|---|---|
| `vsharp_brain` | fastMRI brain multi-coil cartesiano | FastMRIRandom | 4× / 0.08 |
| `vsharp_knee` | fastMRI knee multi-coil cartesiano | FastMRIEquispaced | 4× / 0.08 |
| `vsharp_prostate` | fastMRI prostate T2 (3 averages GRAPPA R=2, combinados) | FastMRIEquispaced | 4× / 0.08 |
| `vsharp_breast` | fastMRI breast, radial GRASP DCE regridded | Radial | 4× / 0.08 |
| `vsharp_cardiac` | CMRxRecon 2023 cine multi-coil | FastMRIEquispaced | 4× / 0.08 |
| `vsharp_universal` | fastMRI brain/knee/prostate/breast + CMRxRecon 2023/2024/2025 | FastMRIEquispaced | 4× / 0.08 |

Todas las variantes comparten licencia Apache 2.0, formato `.pt` + YAML y esquema de inferencia, por lo que la elección entre ellas es puramente de dominio anatómico, no de licencia ni de tooling.

Frente a alternativas externas de la misma categoría (métodos de reconstrucción acelerada de MRI, por ejemplo reconstrucción paralela clásica tipo GRAPPA/SENSE, compressed sensing o redes unrolled específicas por aceleración): no disponible. La información proporcionada no incluye comparaciones de parámetros, contexto, rendimiento ni disponibilidad con esos métodos; solo se confirma que GRAPPA R=2 se usó como paso de preprocesado del dataset de próstata, no como modelo comparable.

## Limitaciones y advertencias

- No se declara validación clínica, marcado CE ni aprobación FDA. Los modelos están orientados a investigación; no deben usarse para diagnóstico sin una validación regulatoria y local independiente.
- Los YAMLs son de inferencia estricta: las listas `accelerations` y `center_fractions` deben tener longitud 1. Introducir varias R en inferencia (válido en entrenamiento) produce un comportamiento no soportado por el sampler de máscaras.
- Cada variante está atada a la anatomía y al tipo de contraste de su dataset; usar `vsharp_brain` sobre rodilla o `vsharp_cardiac` sobre próstata no está respaldado por la documentación.
- Dependencia fuerte del preprocesado: `vsharp_breast` asume regridding radial→cartesiano y `vsharp_prostate` asume el pipeline oficial T2 GRAPPA con combinación de tres averages. Desviarse de ese preprocesado invalida las expectativas de calidad.
- Riesgo de alucinación en sentido amplio: como todo método de reconstrucción acelerada, puede generar estructura plausible pero incorrecta en zonas con submuestreo severo (R=8 o R=10), y no hay en la información proporcionada métricas de error para cuantificar ese riesgo.
- Licencia Apache 2.0 para código y pesos, pero los datasets subyacentes (fastMRI, CMRxRecon, Calgary-Campinas) tienen sus propios Data Sharing Agreements y restricciones de redistribución. El uso comercial de los pesos no exime de cumplir las condiciones de los datos de entrenamiento.
- Sesgos conocidos: no documentados. Cabe esperar sesgo de dominio hacia los protocolos, fabricantes e intensidades de campo presentes en fastMRI y CMRxRecon, pero no se aportan análisis al respecto.
- Idiomas y contexto: no aplicables; no hay soporte de texto ni ventana de contexto.
- Sin métricas publicadas de latencia, VRAM o throughput, lo que impide dimensionar un despliegue en producción solo con la información de la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido, con menor probabilidad de que los problemas de integración estén documentados por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NKI-AI/direct-vsharp-multianatomy
- Paper del método vSHARP: https://arxiv.org/abs/2309.09954
- Paper de fastMRI (Zbontar et al.): https://arxiv.org/abs/1811.08839
- Repositorio del framework DIRECT: https://github.com/NKI-AI/direct
- Portal de datos fastMRI (NYU): https://fastmri.med.nyu.edu/
- fastMRI prostate, artículo Scientific Data: https://www.nature.com/articles/s41597-024-03252-w
- fastMRI prostate, código: https://github.com/cai2r/fastMRI_prostate
- Pipeline oficial de reconstrucción T2 GRAPPA (próstata): https://github.com/cai2r/fastMRI_prostate/blob/main/fastmri_prostate/reconstruction/t2/prostate_t2_recon.py
- fastMRI breast, artículo Radiology AI: https://pubs.rsna.org/doi/10.1148/ryai.240345
- fastMRI breast, código de reconstrucción DCE: https://github.com/eddysolo/demo_dce_recon
- CMRxRecon (portal del challenge): https://cmrxrecon.github.io/
- CMRxRecon 2023 en Synapse: https://www.synapse.org/#!Synapse:syn51471091
- CMRxRecon, artículo Scientific Data: https://doi.org/10.1038/s41597-024-03525-4
