# smerkd/affmae

## Resumen

AFF-MAE (Auto Focus Former Masked Autoencoder) es un modelo de visión por computadora desarrollado por el laboratorio najafian-lab, diseñado específicamente para segmentación de imágenes de microscopía electrónica. Se trata de un autoencoder enmascarado (MAE) que combina el paradigma clásico de preentrenamiento auto-supervisado con un mecanismo de "auto-foco" y downsampling jerárquico, lo que permite trabajar a resoluciones altas (hasta 1024 píxeles) con un coste computacional reducido. El modelo se publica como parte de un trabajo aceptado en ECCV 2026 y sus pesos de inferencia se distribuyen a través de Hugging Face.

La relevancia de AFF-MAE radica en que aborda un problema práctico: el preentrenamiento de modelos de visión a alta resolución suele requerir infraestructura de servidores, lo que limita su adopción en laboratorios de investigación con recursos modestos. Según el resumen del paper, AFF-MAE consigue acelerar el fine-tuning hasta 5 veces a resolución 1024 píxeles, permitiendo el entrenamiento en hardware de escritorio. El repositorio incluye checkpoints tanto para la fase de preentrenamiento (MAE) como para la tarea de segmentación, con resoluciones de 512, 768 y 1024 píxeles y 3 clases de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked Autoencoder (MAE) con downsampling jerárquico y mecanismo de auto-foco (Auto Focus Former) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | other (pendiente de revisión del laboratorio) |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

AFF-MAE se basa en la arquitectura de Masked Autoencoder (MAE), que reduce el coste computacional codificando únicamente los tokens visibles de la imagen. La innovación principal, según el abstract del paper, es la combinación de MAE con downsampling jerárquico y un mecanismo de "auto-foco" (de ahí el nombre Auto Focus Former). Este diseño permite procesar imágenes de alta resolución (hasta 1024 píxeles) de forma eficiente, con un aumento de throughput de hasta 5 veces en fine-tuning a esa resolución en comparación con enfoques convencionales.

El entrenamiento se realiza en dos fases: primero un preentrenamiento auto-supervisado tipo MAE (checkpoint `ckpt_epoch_399_affmae_fpw.pth`), y después un fine-tuning supervisado para segmentación de imágenes de microscopía electrónica, con resoluciones de 512, 768 y 1024 píxeles y 3 clases de segmentación. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO (al ser un modelo de visión, estas técnicas no son aplicables en el sentido habitual).

## Capacidades

- Segmentación de imágenes de microscopía electrónica, con salida de 3 clases.
- Preentrenamiento auto-supervisado mediante enmascarado de tokens (MAE), lo que permite fine-tuning eficiente con pocos datos etiquetados.
- Procesamiento de imágenes a alta resolución (512, 768 y 1024 píxeles) con un coste computacional reducido gracias al downsampling jerárquico.
- Entrenamiento y fine-tuning en hardware de escritorio, según se indica en el paper.
- No se han documentado capacidades de generación de texto, razonamiento, código, tool calling, agentes ni procesamiento de lenguaje natural, ya que es un modelo puramente visual.

## Casos de uso

- Segmentación de estructuras subcelulares en microscopía electrónica: el modelo puede identificar y delimitar orgánulos, membranas u otras estructuras en imágenes de alta resolución, facilitando el análisis cuantitativo en biología celular.
- Análisis de patología digital: aunque el modelo está entrenado con microscopía electrónica, su capacidad de trabajar a 1024 píxeles podría adaptarse a imágenes de tejidos, ayudando a detectar anomalías en muestras clínicas.
- Preprocesamiento de imágenes para reconstrucción 3D: la segmentación de cortes seriados de microscopía electrónica es un paso previo para la reconstrucción volumétrica de tejidos, y AFF-MAE puede automatizar esta tarea.
- Investigación en neurociencia: la segmentación de sinapsis y axones en imágenes de microscopía electrónica es un caso de uso típico, y el modelo ofrece una solución eficiente para grandes volúmenes de datos.
- Fine-tuning en dominios específicos: gracias a su preentrenamiento MAE, el modelo puede adaptarse a otros tipos de imágenes de alta resolución (p. ej., radiografías, tomografías) con pocos ejemplos etiquetados.
- Entornos con recursos limitados: laboratorios académicos o pequeñas empresas que no disponen de clústeres de GPU pueden utilizar AFF-MAE para entrenar modelos de segmentación de alta resolución en estaciones de trabajo con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (como precisión, IoU o Dice) en la información disponible. El único dato de rendimiento mencionado es que AFF-MAE logra un aumento de throughput de hasta 5 veces en fine-tuning a resolución 1024 píxeles en comparación con métodos alternativos, según el abstract del paper. No se proporcionan comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el modelo trabaja con resoluciones de hasta 1024 píxeles y es un transformer, se estima que requiere al menos 8-12 GB de VRAM para inferencia a esa resolución, pero este dato no está confirmado.
- GPU recomendadas: el paper indica que el fine-tuning es viable en hardware de escritorio, lo que sugiere compatibilidad con GPUs de consumo como RTX 3090, RTX 4090 o similares. Para la resolución de 512 píxeles, una GPU con 8 GB podría ser suficiente.
- Opciones de despliegue: los pesos se distribuyen en formato .pth (PyTorch), por lo que se puede cargar directamente con el paquete `affmae` desde el repositorio GitHub. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El paper menciona mejoras de throughput en fine-tuning, pero no se especifican valores concretos de latencia de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de segmentación de microscopía electrónica. No se han encontrado referencias a modelos comparables en la documentación proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- La licencia es "other" y está pendiente de revisión por parte del laboratorio. Esto implica que el uso comercial puede no estar permitido o requerir autorización explícita. Se recomienda contactar con los autores antes de utilizarlo en producción.
- El modelo está especializado en microscopía electrónica y no se ha validado en otros dominios de imagen. Su uso fuera de este ámbito requeriría fine-tuning adicional.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de un dominio concreto, puede presentar un rendimiento deficiente en imágenes con características muy diferentes a las del dataset de entrenamiento.
- Riesgo de alucinación: al ser un modelo de segmentación, el riesgo de "alucinación" se manifiesta en la generación de máscaras incorrectas o sobresegmentación en regiones ambiguas. No se han publicado métricas de robustez.
- No se proporcionan detalles sobre el dataset de entrenamiento, por lo que no es posible evaluar posibles sesgos de selección o representatividad.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes, lo que sugiere que el modelo es muy reciente y aún no ha sido ampliamente probado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/smerkd/affmae
- Repositorio GitHub: https://github.com/najafian-lab/affmae
- Paper en arXiv: https://arxiv.org/abs/2602.16249
- Versión HTML del paper: https://arxiv.org/html/2602.16249v1
