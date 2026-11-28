# RayYoh/GaussianCross

## Resumen

GaussianCross es una arquitectura de aprendizaje autosupervisado y multimodal para representaciones 3D, desarrollada por RayYoh y publicada en arXiv (2508.02172). Integra técnicas de 3D Gaussian Splatting (3DGS) feed-forward para generar representaciones de nubes de puntos informativas y robustas orientadas a la comprensión de escenas 3D. El modelo aborda dos problemas recurrentes en el preentrenamiento autosupervisado de nubes de puntos: el colapso del modelo y la deficiencia de información estructural, derivados de una dificultad de discriminación insuficiente entre puntos.

La propuesta convierte nubes de puntos 3D con escalas inconsistentes en una representación gaussiana unificada normalizada a un cuboide, sin pérdida de detalle, lo que permite un preentrenamiento estable y generalizable. Sobre esa representación se aplica un módulo de destilación y splatting adaptativo de tres atributos que construye un campo de características 3D, capturando de forma sinérgica señales de apariencia, geometría y semántica para mantener la consistencia entre modalidades.

El modelo se distribuye como pesos preentrenados de un backbone SpUNet sobre la librería Pointcept, con un repositorio de 7,6 GB. Está pensado para tareas de segmentación semántica y de instancias en escenas 3D (ScanNet, ScanNet200, S3DIS) y destaca por su eficiencia en parámetros y datos: logra resultados superiores con linear probing (<0,1 % de parámetros) y con solo el 1 % de las escenas en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone SpUNet con preentrenamiento autosupervisado multimodal basado en 3D Gaussian Splatting feed-forward y modulo de destilacion/splatting adaptativo de tres atributos |
| Parametros totales | no disponible (los pesos publicados corresponden al backbone SpUNet; el numero concreto no se indica en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos 3D, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint PyTorch, `gaussiancross-spunet.pth`) |

## Arquitectura y entrenamiento

GaussianCross es una arquitectura de representacion 3D, no un transformer de lenguaje. Su pipeline parte de nubes de puntos con escalas inconsistentes y las convierte en una representacion gaussiana unificada normalizada a un cuboide, preservando el detalle. A continuacion, un modulo de destilacion y splatting adaptativo de tres atributos construye un campo de caracteristicas 3D que captura de forma sinergica apariencia, geometria y semantica, manteniendo la consistencia entre la modalidad de puntos y la representacion gaussiana. El backbone sobre el que se aplican los pesos publicados es SpUNet, dentro del ecosistema Pointcept.

El preentrenamiento es autosupervisado y de tipo cross-modal, disenado para evitar el colapso del modelo y la falta de informacion estructural que afectan a otros metodos de preentrenamiento de nubes de puntos. La evaluacion se realiza mediante linear probing (menos del 0,1 % de parametros) y fine-tuning completo sobre ScanNet, ScanNet200 y S3DIS. El modelo demuestra eficiencia en datos, entrenando con solo el 1 % de las escenas, y una mejora en fine-tuning completo de 9,3 % mIoU y 6,1 % AP50 en segmentacion semantica y de instancias sobre ScanNet200, respectivamente. No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Generacion de representaciones de nubes de puntos 3D para comprension de escenas.
- Segmentacion semantica de escenas 3D (evaluado en ScanNet, ScanNet200 y S3DIS).
- Segmentacion de instancias 3D (evaluado en ScanNet y ScanNet200).
- Aprendizaje autosupervisado cross-modal mediante 3D Gaussian Splatting feed-forward.
- Linear probing con menos del 0,1 % de parametros entrenables.
- Entrenamiento eficiente en datos: resultados competitivos con el 1 % de las escenas.
- Generalizacion a traves de fine-tuning completo sobre distintos benchmarks.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Segmentacion semantica de interiores: el modelo genera representaciones por punto que permiten etiquetar cada punto de una escena ScanNet en categorias como pared, suelo, silla o mesa, sirviendo de base para sistemas de inventario y modelado de interiores.
- Segmentacion de instancias en escenas 3D: gracias a la representacion gaussiana unificada, permite separar objetos individuales dentro de una nube de puntos, util para robotica de manipulacion y analisis de escenas.
- Preentrenamiento de backbones para tareas 3D: los pesos publicados (`gaussiancross-spunet.pth`) pueden usarse como inicializacion en pipelines de Pointcept para fine-tuning en dominios propios con pocos datos.
- Anotacion asistida de datasets 3D: al lograr buen rendimiento con linear probing y con solo el 1 % de las escenas, reduce el coste de etiquetado en proyectos con presupuesto limitado.
- Digitalizacion de interiores y BIM: la captura de apariencia, geometria y semantica en un unico campo de caracteristicas facilita la reconstruccion semantica de espacios escaneados.
- Investigacion en representacion 3D autosupervisada: el codigo y los pesos sirven de base reproducible para experimentar con 3DGS aplicado a nubes de puntos y comparar con metodos previos.
- Robotica de navegacion y percepcion: las representaciones robustas por punto pueden alimentar modulos de percepcion que necesitan distinguir estructura y semantica en tiempo de inferencia.

## Benchmarks y rendimiento

La model card reporta mejoras relativas en fine-tuning completo sobre ScanNet200: +9,3 % mIoU en segmentacion semantica y +6,1 % AP50 en segmentacion de instancias. Sin embargo, no se proporcionan en la informacion disponible las tablas numericas completas de MMLU, HumanEval, GSM8K ni de los benchmarks 3D con valores absolutos por metodo. Por tanto:

No se han publicado resultados de benchmarks detallados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 7,6 GB y los pesos son un checkpoint PyTorch del backbone SpUNet.
- GPU recomendadas: los scripts de entrenamiento de ejemplo usan 4 GPU (`CUDA_VISIBLE_DEVICES=0,1,2,3 sh scripts/train.sh -g 4`); no se especifica el modelo concreto de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: Pointcept (libreria oficial), PyTorch con CUDA 11.8 segun las instrucciones de instalacion, y Docker mediante los scripts de Pointcept (`build_image.sh`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GaussianCross | no disponible | no aplica (3D) | Segmentacion semantica e instancias 3D autosupervisada | MIT | Hugging Face + GitHub |
| Alternativas de preentrenamiento 3D autosupervisado | no disponible | no disponible | Segmentacion 3D | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos concretos de modelos comparables (parametros, contexto, rendimiento o licencia) para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no tiene capacidades multilingues.
- Los benchmarks publicados en la informacion disponible son relativos (+9,3 % mIoU y +6,1 % AP50 en ScanNet200) y no se acompanan de tablas absolutas completas, lo que limita la comparacion directa.
- Requiere el ecosistema Pointcept y pasos de preprocesamiento especificos para ScanNet V2, ScanNet200 y S3DIS; no es un modelo plug-and-play fuera de ese pipeline.
- Depende de la disponibilidad de los datasets (ScanNet requiere registro y aceptacion de sus terminos).
- El entrenamiento de ejemplo asume multiples GPU; el rendimiento en una sola GPU no esta documentado.
- Riesgo de sesgo y alucinacion: no documentado en la informacion disponible; al tratarse de un modelo de percepcion 3D, los errores se manifiestan como etiquetas incorrectas o instancias mal separadas.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de los datasets y del codigo base de Pointcept empleados.
- El repositorio no indica cuantizaciones ni formatos alternativos a `.pth`, lo que puede complicar el despliegue en entornos con restricciones de memoria.

## Enlaces

- Hugging Face: https://huggingface.co/RayYoh/GaussianCross
- Paper (arXiv): https://huggingface.co/papers/2508.02172
- Pagina del proyecto: https://rayyoh.github.io/GaussianCross/
- Repositorio GitHub: https://github.com/RayYoh/GaussianCross
- Pesos preentrenados: https://huggingface.co/RayYoh/GaussianCross/resolve/main/gaussiancross-spunet.pth
- Toolkit Pointcept: https://github.com/Pointcept/Pointcept
- Script Docker de Pointcept: https://github.com/Pointcept/Pointcept/blob/main/scripts/build_image.sh
- Dataset ScanNet: http://www.scan-net.org/
