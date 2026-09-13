# JoyXiangLab/rnaseek-full

## Resumen

RNASeek es un conjunto de modelos, datos y artefactos de evaluación desarrollado por JoyXiangLab y publicado en el repositorio `JoyXiangLab/rnaseek-full` de Hugging Face. No se trata de un unico modelo, sino de un archivo de investigacion completo que reune checkpoints y conjuntos de datos fijos para cuatro tareas de ARN: prediccion de eficiencia catalitica de ribozimas, prediccion de estabilidad del ARN mediada por la region 3' UTR, generacion supervisada de secuencias y ajuste fino mediante aprendizaje por refuerzo (GRPO). Incluye ademas artefactos de benchmark de codificadores (encoders) y del benchmark GEMORNA, junto con los datos de analisis subyacentes.

Segun la model card, el modelo de lenguaje emplea una arquitectura de modelo causal derivada de Qwen (Qwen2) con un tokenizador propio de RNASeek y un objetivo de prediccion del siguiente token. El autor no publica el numero de parametros, la longitud de contexto, la composicion exacta del corpus de preentrenamiento ni resultados numericos de benchmarks en la informacion disponible. La relevancia actual del repositorio radica en su caracter de archivo de reproducibilidad: conserva entradas de secuenciacion en bruto, alineamientos procesados, indices y caches de generacion y analisis, ademas de un manifiesto de checkpoints con los motivos de seleccion de cada uno.

El repositorio es de gran tamano: la model card indica que el archivo completo ocupa aproximadamente 475 GB, mientras que los metadatos de Hugging Face cifran el tamano del repositorio en 1037,6 GB. Se distribuye bajo una licencia no especificada en la informacion proporcionada y con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal derivado de Qwen (Qwen2) con tokenizador propio de RNASeek |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio usa pesos en safetensors; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | ingles (tag `en`); el dominio de trabajo son secuencias de ARN |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio); el archivo incluye multiples checkpoints para regresion, generacion y RL |
| Tamano del repositorio | 1037,6 GB segun metadatos; la model card indica ~475 GB para el archivo completo |
| Tareas cubiertas | Regresion (eficiencia catalitica de ribozimas, estabilidad 3' UTR), generacion supervisada de secuencias, RL con GRPO, benchmarks de codificadores y GEMORNA |
| Entornos de ejecucion | `rnaseek` (Transformers 4.57.6 / TRL 0.23.1), `rnaseek-benchmark` (Transformers 5.5.4 / MultiMolecule 0.2.1), `rnaseek-evo2` (Torch 2.7.1 / Vortex 1.1.0) |
| Plataforma validada | Linux x86-64, Python 3.11, GPUs NVIDIA con CUDA |

## Arquitectura y entrenamiento

La model card describe el componente generativo como un modelo de lenguaje causal con arquitectura derivada de Qwen (familia Qwen2) y un tokenizador especifico de RNASeek. El objetivo declarado es la prediccion del siguiente token; el texto disponible se interrumpe en la seccion de preentrenamiento, por lo que no se detalla el numero de tokens vistos, la composicion del corpus ni si se aplicaron etapas de RLHF o DPO sobre el modelo de lenguaje base.

Ademas del modelo de lenguaje, el repositorio contiene dos inicializaciones de regresion (`RNASeek-regression-pretrained/`) y un inicializador causal con tokenizador propio (`RNASeek-lm-pretrained/`). Sobre esa base se documentan cuatro flujos de trabajo: regresion de eficiencia catalitica de ribozimas (`efficiency_figure2/`), regresion de estabilidad y espacio de diseno funcional/viral (`regression_stability_functionalviral/`), generacion supervisada de ribozimas (`ribozymegen-figure7/`) y de UTR (`utrgen/`), y ajuste fino con GRPO para ambas tareas generativas, con servicios de recompensa de eficiencia, directiva y estabilidad. El repositorio incorpora tambien un subproyecto de preentrenamiento preservado con documentacion propia y un manifiesto de checkpoints (`checkpoint_manifest.json`) que registra las ubicaciones retenidas y los criterios de seleccion.

Como innovacion de ingenieria destacable, la separacion deliberada en tres entornos Conda incompatibles entre si evita conflictos de dependencias entre el stack de generacion, el de benchmarks de codificadores y el backend de Evo 2. La model card advierte explicitamente de que los ficheros de requisitos no deben combinarse en un unico entorno.

## Capacidades

- Prediccion de regresion de eficiencia catalitica de ribozimas a partir de secuencia.
- Prediccion de regresion de estabilidad del ARN mediada por la region 3' UTR, con espacio de diseno funcional y viral.
- Generacion supervisada de secuencias de ribozimas y de regiones UTR.
- Ajuste fino por aprendizaje por refuerzo con GRPO, con prompts fijos y servicios de recompensa de eficiencia, directiva y estabilidad.
- Ejecucion de benchmarks de codificadores (encoders) y entrenamiento del benchmark GEMORNA.
- Benchmarks de regresion con el modelo Evo 2 1B adaptado a BF16 de NVIDIA, mediante el entorno `rnaseek-evo2`.
- APIs de recompensa (`reward APIs`) para pipelines de RL, con particiones de prompts inmutables.
- Representacion de figuras y analisis sobre caches publicadas, con soporte de renderizado en CPU.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el unico idioma declarado es el ingles.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible.

## Casos de uso

- Prediccion de eficiencia catalitica de ribozimas en cribados a gran escala: el checkpoint de regresion permite puntuar variantes sin necesidad de ensayos enzimaticos individuales, reduciendo el numero de candidatos que pasan a validacion experimental.
- Optimizacion de estabilidad de transcritos terapeuticos: el flujo de regresion sobre 3' UTR y el espacio de diseno funcional/viral permite priorizar variantes de UTR con mayor estabilidad esperada antes de sintetizarlas.
- Diseno generativo de ribozimas: el subproyecto `ribozymegen-figure7` incluye datos y checkpoints de generacion supervisada, de modo que se pueden proponer secuencias candidatas y filtrarlas despues con el modelo de regresion.
- Diseno generativo de regiones UTR: `utrgen/` aporta datos y checkpoints seleccionados para generar UTRs completas que despues se evaluan con el servicio de recompensa de estabilidad.
- Ajuste fino con recompensa biologica: las tareas de GRPO de `ribozymegen-rl-figure7/` y `utrgen-rl/` permiten optimizar una politica de generacion contra una funcion de recompensa medida, con prompts fijos que garantizan comparabilidad entre ejecuciones.
- Reproduccion de resultados publicados: el repositorio conserva caches de generacion y analisis inmutables, particiones de prompts y resultados de benchmark, lo que permite repetir las figuras y tablas sin regenerar los datos cientificos.
- Evaluacion comparativa de modelos genomicos: el entorno `rnaseek-evo2` sirve para ejecutar benchmarks de regresion con Evo 2 1B en BF16 y contrastarlos con los checkpoints propios.
- Filtrado previo en pipelines de biologia sintetica: los modelos de regresion pueden actuar como primera etapa de descarte en un pipeline de alto rendimiento, dejando la validacion experimental para las candidatas mejor puntuadas.
- Generacion de figuras y analisis en maquinas sin GPU: el renderizado de figuras y la inferencia de regresion admiten ejecucion en CPU, lo que facilita la verificacion de resultados en estaciones de trabajo sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona la existencia de resultados de benchmark y de espacios de diseno dentro de `efficiency_figure2/` y `regression_stability_functionalviral/`, asi como benchmarks de codificadores y de GEMORNA en el perfil `rnaseek-benchmark`, y benchmarks de regresion con Evo 2 1B en `rnaseek-evo2`, pero no incluye las cifras en el texto proporcionado.

## Requisitos de hardware

- La model card indica que las pruebas de humo en GPU se realizaron en dispositivos de aproximadamente 48 GB; los requisitos de memoria para entrenamiento completo dependen del checkpoint, la longitud de secuencia y el tamano de lote.
- Almacenamiento: aproximadamente 475 GB para el archivo completo segun la model card, mas espacio para entornos y caches de descarga. Los metadatos de Hugging Face cifran el repositorio en 1037,6 GB.
- Plataforma validada: Linux x86-64, Python 3.11 y GPUs NVIDIA con CUDA. En Windows se recomienda WSL2 con soporte de GPU NVIDIA; no se ha validado entrenamiento nativo en Windows ni en macOS.
- El backend de Evo 2 exige Linux x86-64 y una GPU NVIDIA Ampere o posterior; no es un backend de inferencia en CPU.
- Inferencia de regresion y renderizado de figuras: compatibles con CPU.
- GPU recomendadas: no disponible. La unica referencia concreta es el uso de dispositivos de ~48 GB en las pruebas de humo, lo que apunta a aceleradores de gama profesional (por ejemplo, A6000 o A100 de 40/80 GB) o superiores, aunque el autor no especifica modelos.
- Compatibilidad con GPU de consumo: no confirmado; no se documenta ningun modelo concreto ni requisito de VRAM por cuantizacion.
- Opciones de despliegue: el proyecto no menciona vLLM, llama.cpp, Ollama ni TGI. El despliegue documentado se basa en entornos Conda propios con Transformers, TRL, MultiMolecule y Vortex, junto con un script `setup_env.sh` que crea los perfiles `core`, `benchmark`, `evo2`, `both` y `all`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion disponible solo permite identificar referencias cruzadas dentro del propio repositorio, no una comparativa de rendimiento. Los datos de parametros, contexto, licencia y resultados de los modelos citados no se proporcionan.

| Modelo | Relacion con RNASeek | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| RNASeek (este repositorio) | Modelo principal: regresion, generacion y RL sobre ARN | no disponible | no disponible | no disponible | no disponible |
| Evo 2 1B (NVIDIA, adaptado a BF16) | Usado como referencia en benchmarks de regresion en el entorno `rnaseek-evo2` | 1B (segun la denominacion del backend) | no disponible | no disponible | no disponible |
| GEMORNA | Benchmark de entrenamiento incluido en el perfil `rnaseek-benchmark` | no disponible | no disponible | no disponible | no disponible |
| Qwen2 | Arquitectura base declarada del modelo de lenguaje causal de RNASeek | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicos adicionales sobre alternativas comparables dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier despliegue en produccion.
- No se publican parametros, contexto, composicion del corpus de preentrenamiento ni resultados numericos de benchmarks, lo que impide evaluar la calidad del modelo de forma independiente.
- El unico idioma declarado es el ingles; no hay evidencia de soporte multilingue.
- En tareas de generacion de secuencias biologicas existe riesgo de producir secuencias plausibles pero no funcionales; el propio diseno del repositorio sugiere filtrar las salidas con los modelos de regresion y con validacion experimental.
- No se documentan sesgos especificos. Al tratarse de un modelo entrenado sobre datos biologicos de origen no detallado, no puede descartarse un sesgo de composicion hacia los organismos y tipos de secuencia sobrerrepresentados en el corpus.
- El repositorio es un archivo de investigacion de gran tamano (475 GB declarados; 1037,6 GB en metadatos): el coste de descarga y de almacenamiento es elevado, y el autor recomienda descargar solo los subproyectos necesarios.
- La instalacion requiere conexion a internet y una version compatible del controlador NVIDIA; los paquetes de Python aportan las dependencias de CUDA, pero no el controlador del sistema.
- Es obligatorio mantener separados los tres entornos Conda; combinarlos puede romper las versiones fijadas de Transformers, TRL, MultiMolecule o Vortex.
- No se ha validado el entrenamiento en Windows nativo ni en macOS; el backend de Evo 2 no admite inferencia en CPU.
- El script de instalacion modifica el entorno de usuario estableciendo `PYTHONNOUSERSITE=1` y limpiando `PYTHONPATH`; en portatiles o clusters con configuracion personalizada esto puede afectar a otros proyectos.
- En clusters, los directorios de scratch pueden borrarse al terminar el trabajo: hay que copiar los informes de validacion a almacenamiento persistente antes de que finalice la reserva.
- El autor advierte de que no deben sustituirse directorios de resultados existentes ni regenerarse las caches publicadas, ya que su contenido cientifico se distribuye tal cual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JoyXiangLab/rnaseek-full
- Model card del autor: https://huggingface.co/JoyXiangLab/rnaseek-full/blob/main/README.md
- Manifiesto de checkpoints: `checkpoint_manifest.json` dentro del repositorio
- Subproyecto de preentrenamiento: carpeta `pretraining/` dentro del repositorio
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; todos los enlaces obtenidos correspondian a sitios de efemerides historicas sin relacion con el proyecto. Por tanto, no hay papers, blogs, repositorios ni demos adicionales que enlazar.
