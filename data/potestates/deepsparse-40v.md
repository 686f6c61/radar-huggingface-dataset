# Potestates/DeepSparse-40v

## Resumen

`Potestates/DeepSparse-40v` no es un modelo de lenguaje, sino un conjunto de checkpoints afinados para **reconstrucción de TC/CBCT de vistas dispersas** (sparse-view CT) con **40 vistas de entrada uniformemente distribuidas sobre 180 grados**. Los pesos parten de los pesos preentrenados oficiales de DeepSparse (`pretrain/ep_700.pth`) del repositorio [xmed-lab/DeepSparse](https://github.com/xmed-lab/DeepSparse) y se han entrenado siguiendo el protocolo oficial de dos etapas. Cubre cuatro anatomías: pelvis (PENGWIN), pulmón (LUNA16), abdomen (PANORAMA) y diente (ToothFairy). Es el complemento directo del repositorio [`Potestates/DeepSparse-25v`](https://huggingface.co/Potestates/DeepSparse-25v), del mismo autor.

La relevancia práctica está en la reducción de dosis y de tiempo de adquisición: pasar de cientos de proyecciones a 40 sobre un arco de 180 grados reduce drásticamente la exposición radiológica y el tiempo de barrido, a cambio de un problema de reconstrucción mucho peor condicionado. El autor reporta mejoras medibles frente a la variante de 25 vistas: +0,58 dB de PSNR 3D en pelvis (30,96 → 31,54) y +0,49 dB en pulmón (32,47 → 32,96). Para abdomen y diente, la evaluación con el split de test oficial sigue en ejecución en el momento de publicación de la model card, aunque la validación de la etapa 1 ya favorece las 40 vistas.

El repositorio ocupa 0,1 GB, tiene 0 descargas y 0 likes, y se distribuye bajo licencia `other` / `mixed-see-readme`: el código de DeepSparse es MIT, pero los pesos derivan de datasets con condiciones propias, incluida PANORAMA (abdomen) bajo CC BY-NC 4.0, lo que restringe el uso comercial de ese checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSparse (xmed-lab) para reconstruccion de TC/CBCT de vistas dispersas; el detalle de capas no esta disponible en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de 40 vistas uniformes sobre 180 grados, extraidas de una cache de proyecciones de 600 vistas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | `other` / `mixed-see-readme`; codigo DeepSparse MIT; pesos derivados de PANORAMA (CC BY-NC 4.0, no comercial), PENGWIN (CC BY 4.0), LUNA16 y ToothFairy segun sus terminos originales |
| Formato de pesos | checkpoints PyTorch `.pth` (`ep_400.pth` es el checkpoint final de etapa 2) |
| Vistas de entrada | 40, uniformes sobre 180 grados, desde cache de 600 proyecciones (600/40 = 15, equiespaciadas) |
| Anatomias / datasets | pelvis (PENGWIN), pulmon (LUNA16), abdomen (PANORAMA), diente (ToothFairy) |
| Resolucion de evaluacion | volumenes de 256³ |
| Checkpoint de partida | `pretrain/ep_700.pth` oficial de DeepSparse |
| Version de codigo de referencia | xmed-lab/DeepSparse @ `a055aba3bcb5732a68f89cc0bf3ee6fbfbb1b1e4` |
| Entorno | PyTorch 2.7.1 + CUDA 12.8, TIGRE 3.1.3 |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion en HuggingFace | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Los checkpoints se han producido con el protocolo oficial de dos etapas de DeepSparse, partiendo de los pesos preentrenados oficiales. La etapa 1 se lanza con `--num_views 60 --min_views 40 --random_views --vq_w 0.1` desde `pretrain/ep_700.pth` durante 400 epocas. La etapa 2 reutiliza las mismas vistas con `--vq_w 1.0 --safely_load --freeze_ft`, reanudando desde el `ep_400.pth` de la etapa 1, tambien 400 epocas. El ratio profesor/estudiante de vistas en la etapa 2 es de 1,5× (60 vistas densas frente a 40), mientras que el ajuste oficial usa ratios de 2,4× a 4× con configuraciones de 6, 8 y 10 vistas. Hiperparametros: batch size 2, learning rate 1e-4, weight decay 1e-3, sin planificador de LR y una GPU por trabajo.

La cache de proyecciones de 600 vistas se reconstruyo desde los datos crudos con el preprocesado oficial. El autor verifica que, para cada caso, la imagen recomputada es bit a bit identica al volumen procesado existente y que las 300 vistas compartidas coinciden con la cache antigua dentro de 53-55 dB, diferencia atribuida al redondeo por almacenamiento en uint8. La eleccion de 600 vistas no es arbitraria: la cache de 300 vistas empleada en la variante de 25 vistas no es divisible por 40 de forma entera, mientras que 600/40 = 15.

Respecto al protocolo del articulo, el autor documenta cuatro desviaciones: (1) como maximo 250 casos de entrenamiento por dataset en lugar de los conjuntos completos; (2) `num_views=60` en lugar del rango oficial; (3) entorno con PyTorch y TIGRE mas recientes que los oficiales (1.13 / 2.3), necesario para GPUs Blackwell; y (4) para ToothFairy se usa el `config.yaml` publico del repositorio porque el `meta_info.json` oficial apunta a un `config+new.yaml` y un `processed+new/` no publicados, decision validada contra el checkpoint oficial de 10 vistas de diente (31,89 dB frente a los 31,79 dB del articulo).

## Capacidades

- Reconstruccion volumetrica 3D de TC/CBCT a partir de 40 proyecciones dispersas sobre 180 grados.
- Cobertura de cuatro dominios anatomicos: pelvis, pulmon, abdomen y diente, cada uno con su propio checkpoint.
- Evaluacion 3D nativa mediante el `code/evaluate.py` oficial (SSIM 3D de skimage con ventana de 7³).
- Evaluacion 2D por reproyeccion: los volumenes se reproyectan con TIGRE y se puntuan con `metric_proj` de R²-Gaussian sobre 100 vistas aleatorias en 360 grados, normalizando cada vista por su propio maximo.
- Trazabilidad por caso: cada carpeta incluye `results_1.0x.csv` (metricas 3D por caso) y `results_proj2d_1.0x.csv` (metricas 3D y 2D por caso), junto con `train.log` y `train_s1.log`.
- Reproducibilidad: se incluyen los `configs/` de entrenamiento, el config de evaluacion de 40 vistas (`min_views: 40`) y las listas de casos en `splits/<DATASET>/meta_info.json`.
- No dispone de generacion de texto, razonamiento, codigo, tool calling, soporte de agentes, capacidades multilingues, vision general ni modo de razonamiento. Es un modelo de reconstruccion de imagen medica, no un modelo fundacional de proposito general.

## Casos de uso

- TC de dosis reducida en investigacion: reconstruir un volumen diagnostico a partir de solo 40 vistas de 180 grados reduce la dosis y el tiempo de barrido; los checkpoints sirven como punto de partida para estudiar el compromiso entre calidad de imagen (31,54 dB en pelvis, 32,96 dB en pulmon) y reduccion de proyecciones.
- CBCT para radioterapia guiada por imagen (IGRT): los barridos CBCT intraoperatorios se benefician de adquirir menos proyecciones para acortar el tiempo en sala; el checkpoint de pelvis (PENGWIN, 30 casos de test) es el mas directamente alineado con ese escenario anatomico.
- Cribado pulmonar con protocolos de baja dosis: el checkpoint de LUNA16 (250 casos de entrenamiento de 738, 100 de test) esta entrenado sobre TC de pulmon y puede evaluarse sobre volumenes de 256³ con el split oficial.
- Investigacion odontologica y maxilofacial: el checkpoint de ToothFairy (250 de 343 casos de entrenamiento, 75 de test) apunta a reconstruccion de piezas dentales, un dominio donde el hueso de alta densidad y los artefactos metalicos son el principal reto.
- Estudios de ablacion vistas frente a calidad: el repositorio esta disenado para compararse con la variante de 25 vistas, permitiendo cuantificar el coste en PSNR/SSIM de reducir el numero de proyecciones (+0,58 dB en pelvis y +0,49 dB en pulmon al pasar de 25 a 40 vistas).
- Reproduccion y comparacion de metodos de reconstruccion dispersa: al fijar version de codigo, configs, cache de proyecciones y splits oficiales, sirve como baseline reproducible para comparar con otras tecnicas de reconstruccion.
- Validacion de pipelines de reproyeccion 2D: la inclusion de `results_proj2d_1.0x.csv` permite verificar flujos con TIGRE y metricas 2D (PSNR 39,41 dB y SSIM 0,9842 en pelvis) antes de desplegar un pipeline de reconstruccion completo.
- Docencia y formacion en imagen medica: el tamano del repositorio (0,1 GB) y la separacion en cuatro anatomias facilitan usarlo como material practico en cursos de reconstruccion tomografica.

## Benchmarks y rendimiento

Resultados sobre los splits de test oficiales, volumenes de 256³. Las metricas 3D proceden de `code/evaluate.py` (SSIM 3D de skimage, ventana de 7³); las 2D, de reproyectar ambos volumenes con TIGRE y puntuarlos con `metric_proj` de R²-Gaussian (100 vistas aleatorias sobre 360 grados, cada una normalizada por su propio maximo).

| Checkpoint | Dataset | Casos de entrenamiento | Casos de test | PSNR 3D (dB) | SSIM 3D (×10⁻²) | PSNR 2D (dB) | SSIM 2D |
|---|---|---|---|---|---|---|---|
| `pelvis+40v+n250+nv60+s2` | PENGWIN | 60 (todos) | 30 | 31,54 | 92,02 | 39,41 | 0,9842 |
| `luna+40v+n250+nv60+s2` | LUNA16 | 250 / 738 | 100 | 32,96 | 92,71 | 40,18 | 0,9871 |
| `abdomen+40v+n250+nv60+s2` | PANORAMA | 250 / 1244 | 600 | evaluacion en curso | evaluacion en curso | evaluacion en curso | evaluacion en curso |
| `tooth+40v+n250+nv60+s2` | ToothFairy | 250 / 343 | 75 | evaluacion en curso | evaluacion en curso | evaluacion en curso | evaluacion en curso |

Comparativa interna 25 vistas frente a 40 vistas (PSNR 3D, dB):

| Dataset | 25 vistas | 40 vistas | Delta |
|---|---|---|---|
| Pelvis | 30,96 | 31,54 | +0,58 |
| Pulmon | 32,47 | 32,96 | +0,49 |
| Abdomen | 29,79 | pendiente | no disponible |
| Diente | 34,03 | pendiente | no disponible |

Validacion de etapa 1 (media resolucion, epoca 400), que ya favorece 40 vistas en los dos datasets pendientes:

| Dataset | Etapa 1, 25 vistas (dB) | Etapa 1, 40 vistas (dB) |
|---|---|---|
| Diente | 34,38 | 35,18 |
| Abdomen | 30,54 | 30,65 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros metodos de reconstruccion (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica consumo de memoria, ni para entrenamiento ni para evaluacion.
- GPU recomendadas: no disponible. El unico dato indicativo es que la configuracion requiere un entorno mas reciente que el oficial (PyTorch 2.7.1 + CUDA 12.8) precisamente para dar soporte a GPUs Blackwell, lo que sugiere que el autor entreno sobre hardware de esa generacion.
- Entrenamiento: el autor indica explicitamente «1 GPU per job» con batch size 2, tanto en etapa 1 como en etapa 2, a 400 epocas por etapa.
- Si cabe en GPU de consumo: no disponible. El tamano del repositorio es de solo 0,1 GB, lo que indica checkpoints ligeros, pero no se especifica el numero de parametros ni el pico de memoria.
- Dependencias obligatorias: TIGRE 3.1.3 para la reproyeccion y las metricas 2D, ademas de PyTorch y CUDA. Es un requisito de despliegue, no opcional, si se quieren reproducir las cifras publicadas.
- Opciones de despliegue: el flujo documentado es la descarga de pesos con `hf download` y la ejecucion del script oficial `code/evaluate.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican tiempos de reconstruccion por volumen.
- Restriccion de la cache de proyecciones: la evaluacion debe usar `min_views: 40` y una cache cuyo numero de vistas sea multiplo de 40 (el autor usa 600). El `config.yaml` guardado dentro de cada checkpoint conserva `min_views: 10`, por lo que reutilizarlo tal cual produce una configuracion incorrecta.

## Comparativa con modelos similares

La unica alternativa comparable documentada en la informacion disponible es la variante de 25 vistas del mismo autor, que comparte codigo, protocolo y pesos de partida:

| Modelo | Vistas | Datasets cubiertos | PSNR 3D pelvis (dB) | PSNR 3D pulmon (dB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Potestates/DeepSparse-40v` | 40 sobre 180° | pelvis, pulmon, abdomen, diente | 31,54 | 32,96 | `other` / mixed-see-readme | HuggingFace |
| `Potestates/DeepSparse-25v` | 25 sobre 180° | pelvis, pulmon, abdomen, diente | 30,96 | 32,47 | `other` / mixed-see-readme | HuggingFace |

Frente a otros metodos de reconstruccion de vistas dispersas (por ejemplo, variantes de DeepSparse publicadas por terceros u otras familias de reconstruccion), no hay datos comparativos en la informacion proporcionada: no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece por completo de generacion de texto, razonamiento, codigo y capacidades conversacionales. Cualquier evaluacion de tipo MMLU o HumanEval no aplica.
- Licencia mixta: el codigo es MIT, pero los pesos heredan los terminos de los datasets de origen. En particular, el checkpoint de abdomen deriva de PANORAMA, bajo CC BY-NC 4.0, lo que prohibe el uso comercial. PENGWIN es CC BY 4.0; LUNA16 y ToothFairy se rigen por sus terminos originales. La licencia del modelo se declara como `other` / `mixed-see-readme`, y obliga a citar el articulo de DeepSparse y los datasets.
- Uso clinico no validado: no hay evidencia en la informacion disponible de validacion regulatoria, de marcado CE ni de autorizacion FDA. No debe usarse para diagnostico sin los tramites correspondientes; los artefactos de reconstruccion son un riesgo real de lectura incorrecta.
- Entrenamiento con subconjuntos reducidos: como maximo 250 casos por dataset, frente a los conjuntos completos del articulo. Esto limita la generalizacion y hace que las cifras no sean directamente comparables con las del paper.
- Protocolo de vistas densas distinto: `num_views=60` (ratio 1,5×) frente al rango oficial de 2,4× a 4×. Los numeros reportados corresponden a esta configuracion concreta y no al ajuste del articulo.
- Resultados incompletos: abdomen y diente no tienen metricas de test en el momento de la publicacion; solo hay evidencia parcial de validacion de etapa 1.
- Sensibilidad a la configuracion de evaluacion: es obligatorio usar `min_views: 40` y una cache de vistas multiplo de 40. Evaluar con 25 vistas o con `min_views: 10` altera los resultados. Ademas, la evaluacion de abdomen exige una cache de 600 vistas.
- Diferencias de configuracion en ToothFairy: se usa el `config.yaml` publico en lugar de la configuracion oficial no publicada. El autor lo valida con una diferencia de 0,10 dB en el checkpoint de 10 vistas (31,89 frente a 31,79 dB), pero sigue siendo una discrepancia respecto al protocolo del articulo.
- Incertidumbre en la cache de proyecciones: la reconstruccion es bit a bit identica a la oficial, pero las 300 vistas compartidas coinciden solo en el rango de 53-55 dB por redondeo en almacenamiento uint8.
- Repositorio de terceros: se trata de un repositorio de un autor individual (Potestates), no de la publicacion oficial de xmed-lab. Con 0 descargas y 0 likes, no tiene validacion independiente por parte de la comunidad. Conviene verificar los pesos antes de usarlos en produccion.
- Formato de pesos sin cuantizaciones publicadas: no se ofrecen versiones GGUF, ONNX ni cuantizadas, lo que complica el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Potestates/DeepSparse-40v
- Variante de 25 vistas del mismo autor: https://huggingface.co/Potestates/DeepSparse-25v
- Repositorio oficial del codigo DeepSparse (xmed-lab): https://github.com/xmed-lab/DeepSparse
- Articulo de DeepSparse citado en la model card: enlace no disponible en la informacion proporcionada
- Datasets de origen (terminos y citacion): PENGWIN, LUNA16, PANORAMA y ToothFairy; enlaces no disponibles en la informacion proporcionada
- Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo (unicamente paginas de soporte de Microsoft sin relacion con el contenido).
