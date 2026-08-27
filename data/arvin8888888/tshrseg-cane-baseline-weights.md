# Arvin8888888/TSHRSeg-Cane-baseline-weights

## Resumen

Este repositorio contiene los pesos preentrenados necesarios para reproducir los experimentos comparativos del sistema TSHRSeg-Cane, un proyecto de segmentación de imágenes de alta resolución de tallos de caña de azúcar. El autor, Arvin8888888, libera únicamente los checkpoints de los métodos de referencia y comparación externa: varias variantes de YOLOv8n-Seg, ISDNet y CascadePSP. El modelo propuesto principal (TSHRSeg-Cane) y sus variantes con estrategia ROI se retienen deliberadamente durante la revisión por pares, por lo que esta entrega es parcial.

La relevancia de este repositorio radica en que permite a investigadores y desarrolladores reproducir los resultados comparativos publicados en el manuscrito asociado, evaluar la segmentación fina de estructuras de caña (yema, yema alada e entrenudo) y verificar la metodología. Al tratarse de pesos de modelos conocidos (YOLOv8, ISDNet, CascadePSP), su integración en pipelines de segmentación es directa, aunque el uso previsto es exclusivamente académico y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n-Seg (variantes), ISDNet, CascadePSP (checkpoints individuales) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelos de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch .pt/.pth) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | other (academica para revision por pares; se deben cumplir las licencias de Ultralytics YOLO, ISDNet y CascadePSP) |
| Formato de pesos | PyTorch (ficheros .pt y .pth) |

## Arquitectura y entrenamiento

El repositorio no incluye informacion sobre la arquitectura del modelo propuesto TSHRSeg-Cane, ya que sus pesos estan retenidos. Los checkpoints liberados corresponden a metodos de referencia bien conocidos: YOLOv8n-Seg (variantes con y sin P6, a resoluciones de entrada de 1024, 1280 y 3840 pixeles), ISDNet (tres modelos binarios especificos por clase a resolucion 3840x2160) y CascadePSP (un checkpoint de refinamiento que se combina con la prediccion gruesa de YOLOv8n-Seg). No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens (irrelevante en vision) ni el proceso de optimizacion (RLHF, DPO, etc.). La unica informacion disponible es que los modelos se entrenaron para segmentacion de imagenes de alta resolucion de tallos de caña de azucar, con tres clases: `bud_wing`, `bud` e `internode`.

## Capacidades

- Segmentacion semantica de imagenes de alta resolucion (hasta 3840x2160) de tallos de caña de azucar.
- Deteccion y segmentacion de tres clases especificas: yema alada (`bud_wing`), yema (`bud`) e entrenudo (`internode`).
- Los checkpoints de YOLOv8n-Seg permiten segmentacion de instancias en tiempo real (modelo nano) con diferentes resoluciones de entrada.
- ISDNet ofrece modelos binarios especificos por clase, lo que permite segmentacion fina de cada estructura por separado.
- CascadePSP actua como modulo de refinamiento de bordes, mejorando la calidad de las mascaras generadas por YOLOv8n.
- No se reportan capacidades de tool calling, agentes, razonamiento multimodal ni procesamiento de lenguaje.

## Casos de uso

- Reproduccion de experimentos academicos: los checkpoints permiten replicar los resultados comparativos del manuscrito TSHRSeg-Cane, verificando la metodologia y las metricas reportadas.
- Evaluacion comparativa de metodos de segmentacion: se pueden comparar YOLOv8n-Seg, ISDNet y CascadePSP en el mismo dataset de caña de azucar para estudiar su rendimiento relativo.
- Desarrollo de pipelines de fenotipado agricola: la segmentacion de yemas e entrenudos en imagenes de alta resolucion puede integrarse en sistemas de analisis de cultivos para estimar caracteristicas morfologicas.
- Investigacion en segmentacion de alta resolucion: los pesos de ISDNet y CascadePSP sirven como referencia para estudiar tecnicas de refinamiento de bordes y manejo de imagenes de gran tamano.
- Validacion de modelos de segmentacion en condiciones controladas: dado que el rendimiento fuera de las condiciones de adquisicion no esta establecido, el uso se limita a entornos de investigacion con imagenes similares a las del manuscrito.
- Formacion y ensenanza: los checkpoints pueden utilizarse en cursos de vision por computador para ilustrar la segmentacion de instancias y el refinamiento de mascaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de metricas (mIoU, Dice, etc.) ni comparaciones cuantitativas con otros modelos. Se espera que estos datos aparezcan en el manuscrito asociado tras la publicacion.

## Requisitos de hardware

No se proporcionan requisitos especificos de hardware en la informacion disponible. Sin embargo, al tratarse de modelos de segmentacion de imagenes de alta resolucion (hasta 3840x2160), se puede inferir que:

- Se requiere una GPU con suficiente VRAM para procesar imagenes de 3840x2160; una GPU de gama alta (p. ej., RTX 3090, RTX 4090, A100) seria adecuada para las variantes de resolucion completa.
- Las variantes de 1024 o 1280 pixeles podrian ejecutarse en GPUs de gama media (p. ej., RTX 3060, RTX 2080) con 8-12 GB de VRAM.
- No se indican opciones de despliegue especificas (vLLM, llama.cpp, etc.), ya que son modelos de vision y no de lenguaje. Para inferencia se usaria PyTorch directamente o frameworks como Ultralytics YOLO.
- No se reportan latencias ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el repositorio. Dado que los checkpoints son de metodos conocidos (YOLOv8n, ISDNet, CascadePSP), se podrian comparar con otras arquitecturas de segmentacion como Mask R-CNN, DeepLabV3+ o SegFormer, pero no se proporcionan datos de rendimiento en este contexto. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El repositorio es una liberacion parcial: los pesos del modelo propuesto TSHRSeg-Cane y sus variantes ROI no estan incluidos, por lo que no se puede evaluar el sistema completo.
- El rendimiento fuera de las condiciones de adquisicion y definiciones de clase descritas en el manuscrito no ha sido establecido; los modelos pueden fallar en imagenes con diferente iluminacion, resolucion o variedad de caña.
- Los checkpoints se liberan exclusivamente para revision academica y reproduccion de investigacion; no deben usarse como base unica para decisiones de mejora genetica, agronomia o comerciales.
- La licencia es "other" y se deben cumplir los terminos de las implementaciones de terceros (Ultralytics YOLO, ISDNet, CascadePSP), que pueden tener restricciones adicionales.
- No se proporcionan datos sobre sesgos, alucinaciones (irrelevante en vision) ni limitaciones de idioma.
- No se incluyen instrucciones de uso completas en el repositorio; se remite al codigo fuente distribuido para la revision por pares.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Arvin8888888/TSHRSeg-Cane-baseline-weights
- Perfil del autor en Hugging Face: https://huggingface.co/Arvin8888888
- No se proporcionan enlaces a papers, blogs o demos en la informacion disponible.
