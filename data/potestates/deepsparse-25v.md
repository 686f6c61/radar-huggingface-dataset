# Potestates/DeepSparse-25v

## Resumen

DeepSparse-25v es una coleccion de checkpoints afinados de DeepSparse, un modelo de reconstruccion tomografica (TC/CBCT) a partir de vistas dispersas, publicado por el usuario Potestates en HuggingFace. El modelo resuelve el problema de reconstruir un volumen 3D a 256³ a partir de solo 25 proyecciones adquiridas uniformemente sobre 180 grados, en lugar de las proyecciones densas que exige la reconstruccion analitica clasica. Se distribuyen cuatro checkpoints, uno por anatomia: pelvis, pulmon, abdomen y diente.

Los pesos parten de los pesos preentrenados oficiales del repositorio xmed-lab/DeepSparse y se afinan con el protocolo oficial de dos etapas del proyecto. No es un modelo de lenguaje ni un modelo multimodal generativo: es una red de reconstruccion de imagen medica, por lo que conceptos como contexto en tokens, tool calling o idiomas no son aplicables.

Su relevancia es practica: la reconstruccion con vistas dispersas reduce dosis de radiacion y tiempo de adquisicion, algo critico en CBCT intervencionista y en cribado. Los checkpoints incluyen resultados por caso (PSNR/SSIM), configuraciones de entrenamiento y evaluacion, y listas de particiones, de modo que pueden reproducirse con el codigo oficial. La licencia es mixta y depende de los conjuntos de datos de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de reconstruccion de TC/CBCT de vistas dispersas (DeepSparse, xmed-lab); topologia interna no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de reconstruccion de imagen 3D; entrada: 25 vistas de proyeccion sobre 180 grados desde una cache de 300 vistas) |
| Tipos de cuantizacion | no disponible; los checkpoints se distribuyen en formato PyTorch (.pth), sin variantes cuantizadas publicadas |
| Idiomas soportados | no aplica (modelo de imagen medica; no procesa texto) |
| Licencia | other / mixed-see-readme. Codigo DeepSparse: MIT. Pesos derivados de datasets con condiciones propias: PANORAMA (abdomen) CC BY-NC 4.0 (no comercial), PENGWIN (pelvis) CC BY 4.0, LUNA16 (pulmon) y ToothFairy (diente) segun los terminos originales |
| Formato de pesos | PyTorch .pth (checkpoints ep_400.pth por dataset) |
| Tamano del repositorio | 0,1 GB (cuatro checkpoints mas configuraciones, logs y particiones) |
| Resolucion de salida | volumen 256³ |
| Vistas de entrada | 25 vistas uniformes sobre 180 grados |

## Arquitectura y entrenamiento

El modelo base es DeepSparse, desarrollado por xmed-lab. Los checkpoints publicados parten de los pesos preentrenados oficiales `pretrain/ep_700.pth` (repositorio HajihajihaJimmy/DeepSparse) y se afinan con el protocolo oficial de dos etapas. La etapa 1 se ejecuta con `--num_views 30 --vq_w 0.1` durante 400 epochs; la etapa 2 se reanuda desde el checkpoint de la etapa 1 (`ep_400.pth`) con `--num_views 30 --min_views 25 --random_views --vq_w 1.0 --safely_load --freeze_ft` durante otros 400 epochs. La etapa 2 funciona por tanto con una relacion profesor/estudiante de vistas de 1,2x (30 vistas densas frente a 25 en inferencia).

Los hiperparametros de afinado son batch size 2, learning rate 1e-4, weight decay 1e-3 y sin planificador de learning rate, con una GPU por trabajo. El entorno utilizado es PyTorch 2.7.1 con CUDA 12.8 y TIGRE 3.1.3, mas reciente que el oficial del paper (PyTorch 1.13 y TIGRE 2.3) y necesario para GPU Blackwell. El numero maximo de casos de entrenamiento es 250 por dataset, frente a los conjuntos completos del paper; las particiones de test son las oficiales. No se detalla en la informacion disponible la composicion exacta del dataset de preentrenamiento, ni si hubo etapas de RLHF/DPO (no aplicables en este dominio), ni la topologia interna de la red mas alla del esquema de dos etapas con peso `vq_w`.

## Capacidades

- Reconstruccion volumetrica 3D de TC/CBCT a 256³ a partir de 25 vistas de proyeccion sobre 180 grados.
- Cuatro dominios anatomicos cubiertos: pelvis (PENGWIN), pulmon (LUNA16), abdomen (PANORAMA) y diente (ToothFairy).
- Inferencia con etiqueta de checkpoint especifica por anatomia (`pelvis+25v+n250+s2`, `luna+25v+n250+s2`, `abdomen+25v+n250+s2`, `tooth+25v+n250+s2`).
- Evaluacion integrada mediante `code/evaluate.py` con salida de metricas por caso y medias (PSNR y SSIM) en `results_1.0x.csv`.
- Compatibilidad directa con el arbol de directorios del repositorio oficial: los checkpoints se colocan en `logs/`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision en el sentido de VLM, tool calling, function calling, soporte de agentes ni capacidades multilingues. Cualquier uso de esas capacidades queda fuera del alcance del modelo.

## Casos de uso

- Reconstruccion de pelvis para planificacion quirurgica: el checkpoint `pelvis+25v+n250+s2` alcanza 30,96 dB de PSNR y 90,31 de SSIM sobre el split oficial de PENGWIN, adecuado para obtener volumenes 3D utilizables a partir de barridos de baja dosis.
- Cribado pulmonar con dosis reducida: el checkpoint `luna+25v+n250+s2` (LUNA16) obtiene 32,47 dB de PSNR con 250 casos de entrenamiento, lo que permite reconstruir estudios de torax con 25 vistas y reducir la exposicion del paciente.
- Investigacion en abdomen: el checkpoint `abdomen+25v+n250+s2` (PANORAMA) da 29,79 dB de PSNR sobre 600 casos de test, util para estudiar reconstruccion de tejido blando con vistas limitadas. Atencion: PANORAMA es CC BY-NC 4.0, por lo que este caso de uso queda restringido a ambito no comercial.
- Odontologia y CBCT dental: el checkpoint `tooth+25v+n250+s2` alcanza el mejor resultado del conjunto (34,03 dB de PSNR, 94,29 de SSIM) sobre ToothFairy, apropiado para imagenes dentales con adquisicion rapida.
- Reproduccion y comparacion de resultados academicos: el paquete incluye `results_1.0x.csv`, `train.log`, `train_s1.log` y las particiones en `splits/<DATASET>/meta_info.json`, lo que permite replicar las cifras y usarlas como linea base en publicaciones.
- Transferencia a nuevas anatomias o protocolos: los pesos afinados pueden servir de inicializacion para afinar con otras anatomias o numeros de vistas, reutilizando `configs/finetune_s1_n250.yaml` y `finetune_s2_n250.yaml`.
- Integracion en pipelines de reconstruccion de imagen medica: los checkpoints encajan en el directorio `logs/` del repositorio DeepSparse y se ejecutan con `code/evaluate.py` indicando `--num_views 25` y la configuracion `eval_25v_n250.yaml`.
- Estudio de artefactos y limites de la reconstruccion con vistas dispersas: la desviacion tipica publicada (por ejemplo, ±2,63 dB en pelvis) permite cuantificar la variabilidad por caso y detectar escenarios de fallo.

## Benchmarks y rendimiento

Resultados sobre los splits de test oficiales, volumen 256³, metrica 3D PSNR / SSIM (×10⁻²), obtenidos con `code/evaluate.py`:

| Checkpoint | Dataset (anatomia) | Casos de entrenamiento | Casos de test | PSNR (dB) | SSIM (×10⁻²) |
|---|---|---|---|---|---|
| `pelvis+25v+n250+s2` | PENGWIN (pelvis) | 60 (todos) | 30 | 30,96 ± 2,63 | 90,31 ± 3,20 |
| `luna+25v+n250+s2` | LUNA16 (pulmon) | 250 / 738 | 100 | 32,47 ± 1,05 | 92,33 ± 1,83 |
| `abdomen+25v+n250+s2` | PANORAMA (abdomen) | 250 / 1244 | 600 | 29,79 ± 2,11 | 89,52 ± 3,21 |
| `tooth+25v+n250+s2` | ToothFairy (diente) | 250 / 343 | 75 | 34,03 ± 1,15 | 94,29 ± 1,53 |

Referencia del paper (tabla III, 10 vistas, conjuntos de entrenamiento completos):

| Dataset (anatomia) | PSNR (dB) | SSIM (×10⁻²) |
|---|---|---|
| Pelvis | 29,03 | 90,27 |
| LUNA16 | 31,86 | 91,41 |
| Abdomen | 29,42 | 88,36 |
| Tooth | 31,79 | 92,50 |

Sobre el conjunto de test completo de LUNA16, el checkpoint oficial de 10 vistas da 31,79 dB de PSNR y 91,46 de SSIM con los datos preprocesados por el autor. El checkpoint oficial de diente de 10 vistas reproduce las cifras del paper con la configuracion publica (31,89 / 92,74). No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio completo pesa 0,1 GB e incluye cuatro checkpoints, ademas de configuraciones y registros, por lo que cada modelo ocupa una fraccion pequena de ese espacio; el consumo dominante proviene del volumen 256³ y de las proyecciones intermedias, no de los pesos.
- GPU recomendadas: no hay una lista oficial. El entrenamiento se realizo con una GPU por trabajo; se menciona explicitamente la necesidad de soporte para GPU Blackwell, lo que obligo a actualizar PyTorch y TIGRE.
- Compatibilidad con GPU de consumo: no confirmada oficialmente. Dado el reducido tamano de los pesos, la viabilidad depende de la memoria necesaria para el volumen y la cache de proyecciones, no del tamano del modelo.
- Opciones de despliegue: no aplican servidores de inferencia de lenguaje (vLLM, llama.cpp, Ollama, TGI). El despliegue requiere el repositorio xmed-lab/DeepSparse en el commit `a055aba3bcb5732a68f89cc0bf3ee6fbfbb1b1e4`, PyTorch 2.7.1, CUDA 12.8 y TIGRE 3.1.3, invocando `code/evaluate.py`.
- Memoria y configuracion de entrenamiento: batch size 2, learning rate 1e-4, weight decay 1e-3, sin planificador de LR, 400 epochs por etapa, 1 GPU por trabajo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion disponible no incluye datos de otros metodos de reconstruccion con vistas dispersas, por lo que la comparacion se limita a los propios checkpoints de DeepSparse:

| Modelo | Vistas | Entrenamiento | PSNR / SSIM (LUNA16) | PSNR / SSIM (diente) | Licencia |
|---|---|---|---|---|---|
| DeepSparse-25v (esta ficha) | 25 sobre 180 grados | 250 casos por dataset | 32,47 / 92,33 | 34,03 / 94,29 | Mixta, ligada a cada dataset |
| DeepSparse oficial 10 vistas (HajihajihaJimmy/DeepSparse) | 10 | Conjuntos completos del paper | 31,79 / 91,46 (test completo, datos preprocesados por el autor); 31,79 / 91,41 (tabla III) | 31,89 / 92,74 con config publica | Segun repositorio oficial |
| Otros metodos de reconstruccion sparse-view | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia mixta y restrictiva en un caso: los pesos de abdomen derivan de PANORAMA, con licencia CC BY-NC 4.0, que prohibe el uso comercial. PENGWIN es CC BY 4.0; LUNA16 y ToothFairy se rigen por sus terminos originales. Es imprescindible revisar cada licencia antes de cualquier uso en produccion.
- Configuracion de evaluacion critica: cada carpeta de checkpoint guarda un `config.yaml` con `min_views: 10`. La evaluacion a 25 vistas debe hacerse con `configs/eval_25v_n250.yaml`, que fija `min_views: 25`. Usar la configuracion guardada produce resultados incorrectos.
- Cobertura anatomica limitada a cuatro dominios; no hay evidencia de generalizacion a otras regiones del cuerpo ni a otras geometrias de adquisicion.
- Volumen de entrenamiento reducido: como maximo 250 casos por dataset, frente a los conjuntos completos del paper. Esto afecta a la comparabilidad con las cifras publicadas originalmente.
- Desviaciones del protocolo oficial: relacion profesor/estudiante de 1,2x (30 vistas densas frente a 24 en el protocolo oficial) y uso de la configuracion publica `config.yaml` en ToothFairy en lugar de la referenciada `config+new.yaml`, que no esta publicada.
- Resultados dependientes del preprocesado y de las particiones: las cifras de PSNR y SSIM solo son comparables con los splits y el pipeline de datos empleados en el repositorio.
- Sensibilidad al numero de vistas: la calidad decae al reducir las proyecciones; la desviacion tipica por caso es considerable en pelvis (±2,63 dB), lo que indica alta variabilidad entre pacientes.
- Artefactos de reconstruccion: como todo metodo de vistas dispersas, puede producir artefactos de aliasing y perdida de detalle fino. No se documentan evaluaciones radiologicas ni lectura clinica de los resultados.
- No es un dispositivo medico: no se ha validado para diagnostico clinico y no debe usarse como sustituto del criterio profesional.
- Modelo sin traccion en la plataforma: 0 descargas y 0 me gusta en el momento de redactar la ficha, sin validacion independiente por parte de la comunidad.
- No reutilizable fuera del dominio de imagen: no admite texto, codigo, agentes ni tool calling.
- Requiere citar el paper de DeepSparse y los conjuntos de datos originales.

## Enlaces

- HuggingFace: https://huggingface.co/Potestates/DeepSparse-25v
- Repositorio oficial de codigo: https://github.com/xmed-lab/DeepSparse
- Pesos preentrenados de partida: https://huggingface.co/HajihajihaJimmy/DeepSparse
- Resultados de busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a RootsTech y FamilySearch (genealogia) y no guardan relacion con el modelo. El enlace al paper de DeepSparse se menciona en la model card pero no se proporciona una URL concreta, por lo que no se incluye.
