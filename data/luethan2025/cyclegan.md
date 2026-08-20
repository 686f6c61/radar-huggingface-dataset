# luethan2025/cyclegan

## Resumen

CycleGAN es un modelo de traducción de imagen a imagen no pareada, desarrollado por el equipo de UC Berkeley (Jun-Yan Zhu, Taesung Park, Phillip Isola y Alexei A. Efros) y publicado en 2017. Su objetivo es aprender una transformación entre dos dominios visuales (por ejemplo, caballos a cebras, manzanas a naranjas, mapas a fotografías aéreas) sin necesidad de pares de imágenes alineadas durante el entrenamiento. Esto lo diferencia de modelos anteriores que requerían datos pareados, lo que lo hace especialmente útil en tareas donde obtener pares exactos es inviable o costoso.

La arquitectura se basa en dos generadores y dos discriminadores adversariales, junto con una pérdida de consistencia cíclica que garantiza que la transformación sea invertible. El repositorio alojado en Hugging Face (`luethan2025/cyclegan`) contiene los pesos preentrenados para cuatro tareas concretas: manzana a naranja, caballo a cebra, mapas a fotos aéreas y fachadas a edificios. El tamaño del repositorio es de 0,3 GB, lo que sugiere que los pesos están en formato de punto flotante de 32 bits (FP32) o similar, aunque no se especifica el formato exacto.

Aunque el modelo tiene ya varios años, sigue siendo relevante como referencia en el campo de la traducción de imágenes no supervisada y como base para muchas técnicas posteriores. Su implementación es ligera y puede ejecutarse en hardware de consumo, lo que lo convierte en una opción práctica para prototipos y experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CycleGAN (GAN con dos generadores y dos discriminadores, basada en ResNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch .pth, no confirmado) |

## Arquitectura y entrenamiento

CycleGAN se compone de dos funciones de mapeo: un generador \(G: X \rightarrow Y\) y un generador inverso \(F: Y \rightarrow X\). Cada generador está acompañado de un discriminador (\(D_Y\) para distinguir imágenes reales de \(Y\) de las generadas por \(G\), y \(D_X\) para el dominio \(X\)). La pérdida total combina una pérdida adversarial (para que las imágenes generadas sean indistinguibles de las reales) y una pérdida de consistencia cíclica, que obliga a que \(F(G(x)) \approx x\) y \(G(F(y)) \approx y\). Esta restricción es clave para evitar que el mapeo colapse en soluciones triviales.

Los generadores utilizan una arquitectura ResNet con 9 bloques residuales para imágenes de 256×256 píxeles, mientras que los discriminadores son PatchGAN, que clasifican parches de 70×70 píxeles en lugar de la imagen completa. El entrenamiento se realiza con los datasets listados en la model card: `apple2orange`, `horse2zebra`, `maps-unpaired` y `facades-unpaired`, todos ellos conjuntos de imágenes no pareadas. No se proporcionan detalles sobre el número de épocas, tamaño de lote ni hiperparámetros específicos en la información disponible.

## Capacidades

- Traducción de imagen a imagen no pareada entre dos dominios visuales.
- Transferencia de estilo (por ejemplo, convertir fotografías en pinturas o viceversa).
- Transformación de objetos (caballos a cebras, manzanas a naranjas).
- Cambio de estación o condiciones atmosféricas (verano a invierno, día a noche).
- Conversión de mapas a fotografías aéreas y de fachadas a edificios.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de visión.

## Casos de uso

- **Transferencia de estilo artístico**: un estudio de diseño puede usar CycleGAN para convertir fotografías de producto en ilustraciones con estética de acuarela o óleo, sin necesidad de pares de imágenes. El modelo se ejecuta sobre cada imagen de entrada y produce la versión estilizada en tiempo real.
- **Transformación de objetos en datasets de entrenamiento**: para aumentar la variedad de un dataset de visión por computador, se puede aplicar CycleGAN para convertir imágenes de una clase (por ejemplo, caballos) en otra (cebras), generando datos sintéticos que mejoren la robustez de clasificadores.
- **Generación de mapas a partir de fotografías aéreas**: en aplicaciones de cartografía o planificación urbana, el modelo puede convertir imágenes de satélite o drones en mapas estilizados, facilitando la visualización de infraestructuras.
- **Conversión de fachadas a modelos 3D**: en arquitectura, CycleGAN puede transformar fotografías de fachadas de edificios en representaciones simplificadas (etiquetas semánticas), que luego se usan como entrada para reconstrucción 3D.
- **Mejora de fotografías antiguas**: aplicando el modelo a imágenes históricas, se puede transferir el estilo de fotografías modernas para mejorar la apariencia visual, aunque no restaura detalles perdidos.
- **Prototipado rápido en investigación**: dado su tamaño reducido y su implementación sencilla, CycleGAN es útil como línea base para comparar nuevas técnicas de traducción de imágenes no supervisada en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (como FID, IS o precisión de clasificación) para las tareas entrenadas.

## Requisitos de hardware

- No se proporcionan requisitos oficiales en la información disponible.
- Dado el tamaño del repositorio (0,3 GB), se estima que el modelo completo (dos generadores y dos discriminadores) ocupa aproximadamente 300 MB en FP32. Para inferencia con un solo generador, se necesitan alrededor de 150 MB de VRAM, por lo que cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060) es suficiente para procesar imágenes de 256×256.
- En CPU, la inferencia es posible pero más lenta; se recomienda GPU para uso interactivo.
- Opciones de despliegue: el repositorio de GitHub (`bareform/cyclegan`) incluye un notebook Jupyter (`inference.ipynb`) para generar muestras. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- La latencia típica en una GPU moderna (RTX 3090) es del orden de decenas de milisegundos por imagen, aunque no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. Como alternativas en el campo de traducción de imagen a imagen no pareada, se pueden mencionar:

| Modelo | Enfoque | Diferencias clave |
|---|---|---|
| CycleGAN (este) | Dos generadores + consistencia cíclica | Requiere dos dominios, estable y ampliamente usado |
| UNIT | Comparte un espacio latente entre dominios | Asume una distribución latente común, más restrictivo |
| MUNIT | Multimodal, genera múltiples salidas por entrada | Permite diversidad en la salida, más complejo |
| CUT (Contrastive Unpaired Translation) | Usa pérdida contrastiva en lugar de cíclica | Más eficiente en memoria, no requiere consistencia cíclica |

Estas alternativas no están incluidas en la información de Hugging Face, por lo que la comparación es cualitativa y basada en conocimiento general.

## Limitaciones y advertencias

- **Sesgos conocidos**: al entrenarse con datasets específicos (manzanas, caballos, mapas, fachadas), el modelo puede no generalizar bien a otros dominios o a imágenes muy diferentes de las del entrenamiento.
- **Riesgo de alucinación**: aunque no es un modelo de texto, puede generar artefactos visuales o transformaciones irreales en imágenes de entrada poco representadas en el dataset.
- **Limitaciones de contexto**: al ser un modelo de visión, no procesa texto ni secuencias largas; su entrada es una imagen de tamaño fijo (típicamente 256×256).
- **Restricciones de licencia**: la licencia no está especificada en la model card, por lo que se desconoce si permite uso comercial. Se recomienda contactar al autor antes de usarlo en producción.
- **Caveats para producción**: el modelo no está optimizado para inferencia en tiempo real en dispositivos embebidos; requiere una GPU para un rendimiento aceptable. Además, la calidad de la traducción depende en gran medida de la similitud entre los dominios de entrada y salida.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/luethan2025/cyclegan)
- [Paper original (arXiv:1703.10593)](https://arxiv.org/abs/1703.10593)
- [Repositorio de GitHub (bareform/cyclegan)](https://github.com/bareform/cyclegan)
- [Dataset apple2orange](https://huggingface.co/datasets/luethan2025/apple2orange)
- [Dataset horse2zebra](https://huggingface.co/datasets/luethan2025/horse2zebra)
- [Dataset maps-unpaired](https://huggingface.co/datasets/luethan2025/maps-unpaired)
- [Dataset facades-unpaired](https://huggingface.co/datasets/luethan2025/facades-unpaired)
