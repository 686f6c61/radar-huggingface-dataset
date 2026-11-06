# Ambarella/ConvMixer

## Resumen

ConvMixer es una arquitectura de vision artificial presentada en el articulo "Patches Are All You Need?" (arXiv:2201.09792), que propone una alternativa minimalista a los Vision Transformers (ViT). En lugar de usar mecanismos de autoatencion, ConvMixer combina convoluciones depthwise de kernel grande para la mezcla espacial con convoluciones pointwise (1x1) para la mezcla de canales, manteniendo la estructura de parches de los ViT. El resultado es un modelo que alcanza un rendimiento cercano al de los transformers con una complejidad arquitectonica mucho menor.

El repositorio publicado por Ambarella contiene la variante ConvMixer-768/32, que procesa parches de 32x32 con 768 canales de caracteristicas. Esta entrenada sobre ImageNet a resolucion 3x224x224 y esta pensada como backbone ligero para clasificacion de imagenes, investigacion y prototipado.

La relevancia de esta publicacion concreta reside en que Ambarella distribuye los pesos en formatos optimizados para sus propios aceleradores de vision (SoCs N1-655, X7, CV7, CV72 y CV75), lo que la convierte en una ficha orientada al despliegue en hardware embebido de borde (edge AI) mas que en un modelo de proposito general para servidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvMixer (CNN híbrida con mezcla espacial depthwise de kernel grande y mezcla de canales pointwise) |
| Parametros totales | no disponible (variante 768/32: 768 canales, parches de 32x32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 3x224x224) |
| Tipos de cuantizacion | no disponible; se distribuyen pesos "Amba_optimized" y "Activation_fp16" para hardware Ambarella |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | .bin optimizados por dispositivo (n1-655, x7, cv7, cv72, cv75) y pesos PyTorch originales (.pth.tar) referenciados |
| Tamano del repo | 0.2 GB |
| Dataset de entrenamiento | ImageNet |
| Resolucion de entrada | 3x224x224 |
| Libreria | pytorch |

## Arquitectura y entrenamiento

ConvMixer sigue un diseno inspirado en los Vision Transformers: divide la imagen en parches (aqui de 32x32) y los proyecta a un espacio de 768 canales. A diferencia de un ViT, no aplica autoatencion; en su lugar, cada bloque combina una convolucion depthwise con kernel grande (7x7 en la variante de referencia) para mezclar informacion espacial, seguida de una convolucion pointwise 1x1 para mezclar canales, con normalizacion y activacion no lineal (ReLU en la variante denotada como `ks7_p7_relu`). Esta simplicidad reduce el numero de operaciones y facilita el despliegue en hardware especializado.

El modelo se entrena sobre ImageNet a resolucion 224x224. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de ImageNet, ni si se aplicaron tecnicas de ajuste fino adicionales (RLHF/DPO no aplican en un modelo de vision). La innovacion tecnica principal es demostrar que la estructura de parches, y no la autoatencion, es un componente clave del rendimiento de los ViT, logrando resultados competitivos con una arquitectura puramente convolucional.

## Capacidades

- Clasificacion de imagenes: tarea principal para la que esta entrenado el modelo (ImageNet, 1000 clases).
- Extraccion de caracteristicas: puede usarse como backbone convolutional ligero para tareas de vision descendentes.
- Mezcla espacial y de canales eficiente: adecuado para inferencia de baja latencia en hardware embebido.
- Despliegue en hardware Ambarella: pesos optimizados para SoCs N1-655, X7, CV7, CV72 y CV75.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision generativa, audio ni otras capacidades multimodales mas alla de la clasificacion de imagenes.

## Casos de uso

- Clasificacion de imagenes en dispositivos de borde: el modelo puede ejecutarse en SoCs Ambarella (CV7, CV72, CV75) para tareas de reconocimiento visual en camaras IP, drones o sistemas de vigilancia, gracias a los pesos optimizados y a la baja complejidad de la arquitectura.
- Backbone para prototipado en investigacion: sirve como extractor de caracteristicas ligero en experimentos de vision por computador donde se prioriza la simplicidad sobre el estado del arte absoluto.
- Deteccion de objetos en pipelines embebidos: al ser un backbone convolutional, puede integrarse como tronco en arquitecturas de deteccion (por ejemplo, variantes de YOLO o SSD) que requieran un extractor rapido.
- Segmentacion semantica en tiempo real: su bajo coste computacional permite usarlo como codificador en modelos de segmentacion para aplicaciones de conduccion autonoma o robotica de bajo consumo.
- Sistemas de inspeccion industrial: clasificacion de defectos en lineas de produccion donde se requiere inferencia local sin conexion a la nube.
- Investigacion educativa: ejemplo didactico de arquitectura minimalista que compite con ViT, util para cursos de deep learning y comparativas de diseno arquitectonico.
- Despliegue en camaras inteligentes: integracion en firmware de camaras con SoC Ambarella para tareas de analitica de video en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (top-1/top-5) ni comparativas numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0.2 GB, lo que sugiere que los pesos en formato optimizado son ligeros y aptos para memoria embebida.
- GPU recomendadas: no se especifican; el objetivo principal es el despliegue en SoCs Ambarella (N1-655, X7, CV7, CV72, CV75).
- Compatibilidad con GPU de consumo: no confirmada; al ser un modelo de vision de tamano moderado, podria ejecutarse en GPUs consumer (por ejemplo, RTX 3060 o superiores) mediante PyTorch, pero no hay datos publicados de latencia ni memoria.
- Opciones de despliegue: PyTorch (pesos originales), SDK Cooper 2.5.4 y Cooper Foundry 2.3 de Ambarella para los binarios optimizados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConvMixer-768/32 (este) | no disponible | 3x224x224 | no disponible | no disponible | Hugging Face (Ambarella) |
| Vision Transformer (ViT-B/16) | ~86M | 3x224x224 | no disponible en esta ficha | Apache 2.0 (referencia) | Amplia |
| ResNet-50 | ~25M | 3x224x224 | no disponible en esta ficha | BSD-3 (referencia) | Amplia |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse solo con ImageNet, puede heredar los sesgos de dicho dataset.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero puede producir clasificaciones erroneas con alta confianza en imagenes fuera de distribucion.
- Limitaciones de contexto o idioma: no procesa texto; su unica entrada es imagen RGB de 224x224.
- Restricciones de licencia: la licencia no esta especificada, lo que impide confirmar si el uso comercial esta permitido. Es necesario contactar con el autor antes de usarlo en produccion.
- Caveat para produccion: los pesos optimizados estan ligados a hardware Ambarella concreto; fuera de esas plataformas habria que usar los pesos PyTorch originales, cuya equivalencia exacta no se garantiza.
- El modelo esta pensado para clasificacion de imagenes; no debe emplearse como modelo generativo ni de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Ambarella/ConvMixer
- Paper original: https://arxiv.org/abs/2201.09792
- Repositorio oficial de ConvMixer: https://github.com/locuslab/convmixer
- Pesos originales: https://github.com/locuslab/convmixer/releases/download/v1.0/convmixer_768_32_ks7_p7_relu.pth.tar
- Dataset ImageNet: https://image-net.org
