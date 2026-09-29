# phi-lab-rice/GRADE

## Resumen

GRADE (Single-Frame Generative Radar Depth Estimation Under Visual Degradation) es un modelo de estimacion densa de profundidad metrica desarrollado por Bin Zhao, Patrick Chiou y Nakul Garg, del grupo phi-lab de Rice University, y presentado en ACM MobiCom 2026 (Austin, Texas). El problema que aborda es concreto: la percepcion de profundidad basada en sensores opticos falla en presencia de humo, niebla o oscuridad, porque la luz no penetra las particulas en suspension. El radar mmWave si funciona en esas condiciones, pero su resolucion angular limitada produce mapas de profundidad metricamente solidos pero estructuralmente incompletos.

La propuesta de GRADE es anclar priors generativos preentrenados en la geometria de radar de un unico fotograma, de modo que el modelo recupera profundidad metrica de alta fidelidad sin necesidad de SAR (radar de apertura sintetica) y sin depender de una camara fiable. Se entreno y evaluo sobre aproximadamente 95.000 fotogramas sincronizados en 12 edificios con humo real, empleando particiones leave-building-out (es decir, los edificios de test no aparecen en entrenamiento). Segun la model card, alcanza un MAE de 0,303 m en condiciones claras y 0,313 m bajo humo, por delante de todos los baselines en todas las metricas reportadas.

El modelo se distribuye a traves de Hugging Face con la libreria `diffusers` y pesos en `safetensors`, lo que apunta a un enfoque generativo de difusion. El repositorio ocupa 17,3 GB e incluye, ademas de los checkpoints, el codigo de evaluacion, los scripts de inferencia y las metricas, y los resultados de referencia del articulo. No se especifican en la informacion disponible el numero de parametros, la licencia ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de difusion (libreria `diffusers`); prior generativo preentrenado condicionado por geometria de radar de un solo fotograma. Detalle interno no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de estimacion de profundidad, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos publicados en `safetensors`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de texto) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` |
| Tamano del repositorio | 17,3 GB (incluye checkpoints, codigo y resultados de referencia) |
| Modalidad de entrada | Radar mmWave de un solo fotograma (sin SAR); no requiere camara fiable |
| Trabajo asociado | ACM MobiCom 2026 |

## Arquitectura y entrenamiento

La informacion disponible describe GRADE como un modelo que combina un prior generativo preentrenado con la geometria de radar de un unico fotograma. El repositorio se publica bajo la libreria `diffusers` y pesos `safetensors`, lo que es consistente con una arquitectura de difusion, aunque la model card no detalla el backbone, el numero de parametros, el schedule de entrenamiento ni el tipo de condicionamiento (cross-attention, concatenacion, etc.). Tampoco se especifica si hubo fases de ajuste por refuerzo, DPO u otra optimizacion posterior al preentrenamiento.

En cuanto a los datos, GRADE se entreno y evaluo sobre aproximadamente 95.000 fotogramas sincronizados capturados en 12 edificios con humo real. La particion es leave-building-out, un criterio exigente que evita fuga de informacion entre edificios de entrenamiento y de test. Los scripts de procesamiento del dataset incluyen tres pipelines diferenciados: radar + ZED + DJI (`processor.py`), solo RGB/profundidad (`processor_rgb.py`) y extraccion de nube de puntos de radar (`processor_pcd.py`), lo que revela que el ground truth se obtuvo con camaras ZED y DJI en condiciones de buena visibilidad y se sincronizo con las capturas de radar. La innovacion tecnica central es, por tanto, prescindir de SAR y de una camara operativa en inferencia, apoyandose en el prior generativo para completar la estructura que el radar no resuelve angularmente.

## Capacidades

- Estimacion densa de profundidad metrica a partir de un unico fotograma de radar mmWave, con salida en metros (no profundidad relativa).
- Funcionamiento bajo degradacion visual severa: humo real, y por extension niebla, polvo y oscuridad, condiciones en las que los sensores opticos no penetran las particulas.
- Recuperacion de estructura espacial de alta fidelidad alli donde el radar solo ofrece informacion metrica incompleta, gracias al prior generativo.
- Operacion sin SAR y sin camara fiable: el modelo no depende de un sensor optico funcional en el momento de la inferencia.
- Generalizacion entre edificios, validada con particiones leave-building-out sobre 12 edificios.
- Evaluacion reproducible de artefactos: el repositorio incluye un modo CPU-only (`python evaluation/reproduce_paper.py --mode saved`) y un modo local con inferencia y metricas completas (`run_inference.py`, `run_metrics.py`).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes, vision, audio ni multilingue. No es un modelo de lenguaje.

## Casos de uso

- Robotica de busqueda y rescate en incendios: un robot terrestre o aereo equipado con radar mmWave puede generar un mapa de profundidad denso en interiores inundados de humo, donde las camaras y el LiDAR convencional pierden la senal. El MAE reportado de 0,313 m bajo humo es suficiente para navegacion y localizacion de obstaculos.
- Conduccion autonoma y ADAS en condiciones de baja visibilidad: con solo radar de un fotograma, el modelo puede reconstruir la geometria de la escena en niebla densa o lluvia intensa, complementando la percepcion cuando la camara queda inutilizada o muy degradada.
- Inspeccion industrial en entornos con particulas en suspension: mineria subterranea, tuneles en construccion, plantas de cemento o molinos, donde el polvo reduce drasticamente la visibilidad optica y la seguridad depende de detectar obstaculos y medir distancias reales.
- Drones con restricciones de carga util: al eliminar la necesidad de SAR y de una camara fiable, se reduce el peso y el coste del payload en plataformas aereas de pequeno tamano que operan de noche o entre humo.
- Reproduccion de resultados de investigacion y artifact evaluation: los comandos de `evaluation/` permiten regenerar las tablas y figuras del articulo (tablas 2 a 6 y ablacion de pasos de muestreo en la tabla 7), con modo CPU-only para la reproduccion basada en resultados guardados. Util para comites de evaluacion de artefactos y para grupos que quieran compararse contra GRADE.
- Mapeo 3D de interiores con oclusion o degradacion: levantamiento de planos y volumetria en edificios donde el humo o la oscuridad impiden un escaneo optico continuo, usando radar como unica modalidad de entrada.
- Aumentacion de datos y generacion de profundidad sintetica: el componente generativo puede emplearse para producir mapas de profundidad densos a partir de capturas de radar existentes, ampliando datasets de percepcion con etiquetas metricas en condiciones adversas.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son las cifras de MAE del propio modelo, sin desglose de los baselines ni de las metricas 2D (tipo LPIPS) y 3D completas.

| Metrica | Condicion | Valor |
|---|---|---|
| MAE | Condiciones claras | 0,303 m |
| MAE | Bajo humo | 0,313 m |
| Baseline | Comparativa | La model card afirma que GRADE esta por delante de todos los baselines en todas las metricas reportadas, pero no se proporcionan los nombres ni los valores de esos baselines |
| Datos de evaluacion | Tamano | ~95.000 fotogramas sincronizados, 12 edificios, particiones leave-building-out |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar de modelos de lenguaje, ya que GRADE no es un modelo de lenguaje. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los enlaces obtenidos corresponden a la letra griega phi, a la organizacion Pharmacie Humanitaire Internationale y a un articulo no relacionado sobre evaluacion de cursos de informatica, por lo que no aportan datos de rendimiento.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la documentacion. El repositorio completo ocupa 17,3 GB, pero esa cifra incluye codigo, checkpoints y resultados de referencia, no solo los pesos, por lo que no puede traducirse directamente a requisitos de VRAM. Se recomienda dimensionar a partir del checkpoint real descargado.
- GPU recomendadas: no especificadas por los autores. El script de inferencia acepta `--gpuid 0`, lo que implica soporte CUDA. Por el perfil de un modelo generativo de profundidad, una GPU con 16 GB o mas (por ejemplo RTX 4090, A100, H100) es un punto de partida razonable, pero es una estimacion, no un dato publicado.
- Idoneidad en GPU de consumo: no confirmada. No hay datos oficiales sobre si el modelo cabe en GPUs de gama consumer.
- Ejecucion en CPU: si esta soportada, pero solo para la ruta de reproduccion basada en resultados guardados (`python evaluation/reproduce_paper.py --mode saved`), que es explicitamente CPU-only. La inferencia completa requiere GPU.
- Opciones de despliegue: no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama (no aplican a un modelo de profundidad). El despliegue previsto es mediante el entorno Python 3.11 y el archivo `environment.txt` del repositorio, con los scripts `evaluation/run_inference.py` y `evaluation/run_metrics.py`.
- Latencia y throughput: no disponibles.
- Notas operativas: la metrica LPIPS puede descargar pesos de AlexNet (~233 MB) desde `download.pytorch.org` en el primer uso; para ejecuciones offline hay que poblar la cache de TorchVision antes de desconectar y fijar `TORCH_HOME`. La etapa de metricas 3D debe ejecutarse con `--workers 1`, ya que varios workers han provocado bloqueos mutuos en al menos un host de evaluacion.

## Comparativa con modelos similares

No disponible. La model card afirma que GRADE supera a todos los baselines en todas las metricas reportadas, pero no identifica esos baselines ni aporta sus cifras, parametros, ventanas de contexto ni licencias. Tampoco se han encontrado en la busqueda web modelos comparables de estimacion de profundidad a partir de radar bajo degradacion visual con los que establecer una tabla de comparacion fiable sin inventar datos.

## Limitaciones y advertencias

- Licencia no especificada: no hay informacion sobre permisos de uso, lo que supone un riesgo legal directo para cualquier despliegue comercial. Debe contactarse con los autores antes de usar el modelo en produccion.
- Riesgo de alucinacion estructural: al apoyarse en un prior generativo, el modelo puede completar geometria plausible pero incorrecta en zonas donde el radar apenas aporta informacion. La coherencia metrica de esas regiones no esta garantizada por la senal de entrada.
- Sesgo de dominio: el entrenamiento cubre 12 edificios con particiones leave-building-out. Aunque ese criterio reduce la fuga de informacion, no hay evidencia publicada de generalizacion a entornos exteriores, otros tipos de edificio, otra frecuencia de radar o condiciones distintas del humo.
- Dependencia del sensor de radar: el rendimiento esta ligado a las caracteristicas del radar mmWave usado en la captura. No se documentan los rangos de frecuencia, potencia o resolucion angular, ni como cambia el MAE con otros radares.
- Cifras de rendimiento limitadas: solo se publican dos valores de MAE. No hay datos de latencia, consumo, robustez a ruido de radar ni curvas de error por distancia, lo que dificulta evaluar el modelo para produccion.
- Descarga potencialmente limitada: las descargas anonimas de los multiples archivos pequenos de Smoke-Eval pueden sufrir limitacion de tasa por parte de Hugging Face; se recomienda autenticarse con `hf auth login` o definir `HF_TOKEN`.
- Bloqueos en la evaluacion: la etapa de metricas 3D con multiples workers no esta validada y ha provocado deadlocks. Usar siempre `--workers 1`.
- Documentacion incompleta: la model card proporcionada esta truncada (la seccion de citacion queda cortada), por lo que puede faltar informacion relevante sobre arquitectura, licencia y requisitos.
- El repositorio de GitHub contiene archivos puntero en lugar de algunos assets `.npz` de referencia; hay que pasar `--reference-root` para reproducir desde el checkout de GitHub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phi-lab-rice/GRADE
- Pagina del proyecto: https://phi-lab-rice.github.io/GRADE/
- Dataset GRADE (datos crudos sincronizados): https://huggingface.co/datasets/phi-lab-rice/GRADE_Dataset
- Dataset de evaluacion (Smoke-Eval): https://huggingface.co/datasets/mypersonalsharingspot11/evaluation_dataset
- Descarga del paquete de modelos: `hf download phi-lab-rice/GRADE --local-dir grade-models`
- Codigo de evaluacion e inferencia: carpetas `evaluation/` y `src/` del repositorio de Hugging Face
- Scripts de procesamiento del dataset: carpeta `processing_code/` del repositorio de Hugging Face
- Entorno de dependencias: archivo `environment.txt` del repositorio de Hugging Face
- Publicacion: Zhao, B., Chiou, P., Garg, N. "GRADE: Single-Frame Generative Radar Depth Estimation Under Visual Degradation", Proceedings of the 32nd Annual International Conference on Mobile Computing and Networking (ACM MobiCom 2026), Austin, TX
- Bibliografia (BibTeX) disponible en la model card del repositorio, bajo la clave `zhao2026grade`
