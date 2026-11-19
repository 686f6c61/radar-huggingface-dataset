# robust-distillation/weights-example-test

## Resumen

`robust-distillation/weights-example-test` es un repositorio de pesos publicado en Hugging Face por el usuario `robust-distillation`, asociado al proyecto de investigacion "Does Robustness Transfer?". No se trata de un modelo de lenguaje ni de un modelo generativo: es una coleccion de checkpoints de vision por computador (clasificacion de imagenes sobre CIFAR-100) que documenta el resultado de un experimento de destilacion de conocimiento desde un profesor DINOv2 ViT-B/14 congelado hacia estudiantes de aproximadamente 11 millones de parametros (un CIFAR ResNet-18 y un ViT pequeno).

El propio autor etiqueta el repositorio como **TEST / EXAMPLE ONLY** y advierte de que sera eliminado: los entrenamientos se ejecutaron durante unos pocos pasos en la CPU de un portatil, por lo que las cifras de precision no tienen significado practico. Su funcion es servir de plantilla para el repositorio definitivo (`robust-distillation/weights`), mostrando la estructura de carpetas, los metadatos por run y el formato de publicacion de pesos.

Por tanto, su relevancia no es la de un modelo utilizable en produccion, sino la de un artefacto de documentacion metodologica para investigadores interesados en destilacion robusta, evaluacion en CIFAR-100-C y trazabilidad de experimentos (cada carpeta incluye el commit de codigo que genero los pesos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos estudiantes destilados desde un profesor DINOv2 ViT-B/14: CIFAR ResNet-18 y un ViT pequeno (no se detalla la configuracion exacta de este ultimo) |
| Parametros totales | Aproximadamente 11 M por estudiante (segun la model card); el profesor DINOv2 ViT-B/14 ronda los 86 M, aunque no se confirma en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (tarea de clasificacion de imagenes, sin capacidades linguisticas) |
| Licencia | No disponible |
| Formato de pesos | No disponible de forma explicita; el repositorio usa `pytorch` como libreria y el script `push_weights.py` para descarga selectiva por run |

## Arquitectura y entrenamiento

El diseno experimental parte de un profesor DINOv2 ViT-B/14 congelado con una cabeza lineal, destilado mediante knowledge distillation hacia dos estudiantes de ~11 M de parametros: un CIFAR ResNet-18 (con modificaciones `w1.0 f1.0 e1`, es decir, anchura, factor de expansion y numero de bloques segun la nomenclatura del proyecto) y un ViT pequeno. La model card incluye hiperparametros de destilacion explicitos: temperatura `T=4.0`, peso de la perdida de destilacion `α=0.5` y semilla `0`. Ademas de los runs de destilacion, el repositorio contiene baselines entrenados desde cero (`normal`) y modelos de linea de tendencia.

El objetivo del proyecto es estudiar si la robustez frente a corrupciones (evaluada con CIFAR-100-C) se transfiere del profesor al estudiante a traves de la destilacion. El dataset base es CIFAR-100 (100 clases, imagenes de 32x32) y la evaluacion de robustez emplea CIFAR-100-C. Los runs publicados en este repositorio de ejemplo se entrenaron durante unos pocos pasos en CPU, por lo que no constituyen evidencia empirica valida sobre esa hipotesis. No se especifica en la informacion disponible el numero de tokens, la composicion completa del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO (no procede en este dominio).

## Capacidades

- Clasificacion de imagenes en 100 clases de CIFAR-100 mediante los estudiantes destilados.
- Extraccion de caracteristicas visuales por parte del profesor DINOv2 ViT-B/14 (backbone congelado).
- Evaluacion de robustez frente a corrupciones de imagen mediante el conjunto CIFAR-100-C (prevista en el diseno experimental; los pesos de ejemplo no producen resultados validos).
- Replicacion de experimentos de destilacion con trazabilidad de commit de codigo por run.
- No soporta generacion de texto, razonamiento linguistico, codigo, matematicas, tool calling, agentes, capacidades multilingues ni modos de pensamiento.
- No dispone de capacidades de vision generativa, audio ni video; unicamente vision discriminativa a baja resolucion (32x32).

## Casos de uso

- Reproduccion de experimentos de destilacion: el repositorio sirve como plantilla para verificar la estructura de carpetas, los metadatos por run y la convencion de nombres (`resnet18_distill_w1.0_f1.0_e1_a0.5_T4.0_s0`), lo que facilita comparar runs propios con los del proyecto.
- Docencia e investigacion en knowledge distillation: util como ejemplo minimo y ejecutable en portatil de un pipeline profesor-estudiante con hiperparametros documentados (temperatura, alpha, semilla).
- Benchmarking de robustez en CIFAR-100-C: el diseno permite evaluar si la destilacion desde un profesor auto-supervisado mejora la resistencia a corrupciones respecto a un baseline entrenado desde cero.
- Integracion en pipelines de ML reproducibility: el script `push_weights.py pull --repo ... --run NAME` permite descargar selectivamente un unico run, lo que encaja en flujos de CI que validan checkpoints concretos.
- Estudio de arquitecturas ligeras para vision embebida: los estudiantes de ~11 M de parametros y entrada 32x32 son candidatos para experimentos de clasificacion en dispositivos con recursos muy limitados (aunque los pesos publicados no son utiles para ello).
- Referencia para publicacion de pesos en Hugging Face: muestra como organizar un repositorio multi-run con model cards por carpeta y vinculo al commit de codigo, patron reutilizable en proyectos academicos.

## Benchmarks y rendimiento

Los unicos resultados publicados en la model card corresponden a runs de prueba entrenados unos pocos pasos en CPU y el propio autor indica que "their numbers mean nothing".

| Run | Modelo | Modo | Alpha | T | Semilla | Test acc | C-100-C mean | Commit |
|---|---|---|---|---|---|---|---|---|
| `resnet18_distill_w1.0_f1.0_e1_a0.5_T4.0_s0` | CIFAR ResNet-18 w1.0 f1.0 e1 | distill | 0.5 | 4.0 | 0 | 1.35% | no disponible | `b1b75c4` |
| `resnet18_normal_w1.0_f1.0_e1_s0` | CIFAR ResNet-18 w1.0 f1.0 e1 | normal | no aplica | no aplica | 0 | 1.28% | no disponible | `b1b75c4` |
| `teacher_normal_w1.0_f0.01_e30_s0` | DINOv2 ViT-B/14 teacher w1.0 f0.01 e30 | normal | no aplica | no aplica | 0 | no disponible | no disponible | `b1b75c4` |

No se han publicado resultados de benchmarks validos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; ademas, esos benchmarks no aplican a un modelo de clasificacion de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Por tamano (~11 M de parametros por estudiante), la inferencia cabe holgadamente en cualquier GPU consumer; una estimacion orientativa en FP32 seria de decenas de MB, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no se especifican. Los propios runs de ejemplo se entrenaron en CPU de portatil, lo que sugiere que el proyecto esta pensado para ser ejecutable sin GPU dedicada en fases de prueba.
- Cabe en GPU consumer: si, por el reducido numero de parametros, aunque no hay cifras oficiales de consumo.
- Opciones de despliegue: el repositorio usa PyTorch (`library_name: pytorch`) y un script propio (`push_weights.py`) para la descarga selectiva de runs. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `robust-distillation/weights-example-test` | ~11 M por estudiante | no aplica | Clasificacion CIFAR-100 / destilacion | no disponible | Hugging Face (repo de ejemplo, sera eliminado) |
| CIFAR ResNet-18 estandar | ~11 M | no aplica | Clasificacion CIFAR-100 | habitualmente MIT o similar | Ampliamente disponible en repos academicos |
| DINOv2 ViT-B/14 | ~86 M | no aplica | Vision auto-supervisada (backbone) | licencia DINOv2 de Meta (no disponible en la informacion proporcionada) | Hugging Face / GitHub de Meta |
| RobustDistiller (Hguimaraes) | no disponible | no aplica | Destilacion robusta en representaciones de voz (S3RL) | no disponible | GitHub |

No se dispone de datos de rendimiento comparables para este repositorio, ya que sus runs son de prueba y sus cifras no son representativas.

## Limitaciones y advertencias

- El repositorio esta marcado explicitamente como **TEST / EXAMPLE ONLY** y el autor advierte de que sera eliminado; no debe usarse como dependencia estable.
- Los pesos se entrenaron unos pocos pasos en CPU: la precision de 1.35% y 1.28% en test no es utilizable y no refleja el rendimiento del metodo.
- No hay licencia declarada, lo que impide determinar si el uso comercial esta permitido; en la practica, al ser un artefacto de prueba, no deberia emplearse en produccion.
- No se documentan sesgos, pero al derivar de CIFAR-100 hereda los sesgos y desequilibrios de ese dataset (clases superordinadas, imagenes de baja resolucion de 32x32).
- Riesgo de alucinacion no aplica (no es un modelo generativo); el riesgo relevante es la extrapolacion indebida de conclusiones sobre transferencia de robustez a partir de runs no entrenados.
- No soporta idiomas ni texto: cualquier uso linguistico es inviable.
- La model card no detalla la configuracion del ViT pequeno estudiante ni el formato exacto de los pesos (safetensors, `.pt`, `.pth`), lo que complica la carga directa sin consultar el codigo del proyecto.
- La busqueda web devuelve un proyecto homonimo en concepto (RobustDistiller, Hguimaraes) orientado a voz, no a vision; no debe confundirse con este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/robust-distillation/weights-example-test
- Repositorio de codigo del proyecto (referenciado en la model card como origen del script `push_weights.py`, sin URL explicita en la informacion disponible): no disponible
- Repositorio de pesos definitivo previsto por el autor: `robust-distillation/weights` (no disponible publicamente en la informacion proporcionada)
- Proyecto RobustDistiller en GitHub (relacionado por tematica, no por dominio): https://github.com/Hguimaraes/robustdistiller
- Paper del proyecto "Does Robustness Transfer?": no disponible
- Demo: no disponible
