# Catniti/catrex-lite-image-segmentation

## Resumen

Catrex Lite Image Segmentation es un modelo de segmentación de imágenes compacto y ligero, desarrollado por el usuario Catniti y publicado en Hugging Face bajo licencia Apache 2.0. Está diseñado específicamente para la eliminación de fondos en imágenes, una tarea habitual en aplicaciones de edición fotográfica, comercio electrónico y procesamiento de imágenes en tiempo real. El modelo se entrenó desde cero sobre el dataset DIS5K, un conjunto de datos especializado en segmentación de objetos salientes, y alcanza una puntuación F1 de 0,6461 en el subconjunto de validación DIS-VD.

Con solo 4,63 millones de parámetros, este modelo destaca por su eficiencia: puede ejecutarse en dispositivos con recursos limitados, incluidos navegadores web mediante ONNX Runtime Web y entornos Node.js. Su tamaño reducido lo convierte en una opción atractiva para despliegues en el edge, donde los modelos de segmentación de gran escala resultan inviables. Aunque su precisión es inferior a la de modelos más grandes, su simplicidad y facilidad de integración lo hacen útil para prototipos y aplicaciones ligeras.

El modelo se distribuye en formato PyTorch (safetensors) y ONNX, lo que facilita su uso en múltiples plataformas. La resolución de entrada es de 512×512 píxeles, y el entrenamiento se realizó en una única GPU T4 durante 40 épocas, lo que refleja un coste computacional moderado. No se especifican detalles sobre la arquitectura interna más allá de ser una red neuronal compacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal compacta (arquitectura no especificada) |
| Parametros totales | 4.639.485 (4,63 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en FP32, no se mencionan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se detalla en la documentación proporcionada. Se describe únicamente como una "red neuronal compacta" entrenada desde cero, sin indicar si se trata de una CNN, un transformer o una arquitectura híbrida. Dado su reducido número de parámetros (4,63 M) y su enfoque en segmentación de imágenes, es probable que emplee una estructura convolucional ligera, pero esta información no está confirmada.

El entrenamiento se realizó sobre el dataset DIS5K, un conjunto de datos de segmentación de objetos salientes, durante 40 épocas en una única GPU T4. No se especifican otros detalles del proceso, como el tamaño del lote, la función de pérdida o el optimizador. Tampoco se menciona el uso de técnicas como RLHF o DPO, que no son habituales en modelos de visión. La resolución de entrada es de 512×512 píxeles, y la salida es una máscara de segmentación binaria.

## Capacidades

- Segmentación de imágenes: genera máscaras de segmentación a nivel de píxel para separar el objeto principal del fondo.
- Eliminación de fondos: permite extraer el sujeto de una imagen y producir un recorte con canal alfa (RGBA).
- Inferencia en múltiples entornos: compatible con PyTorch, ONNX Runtime, ONNX Runtime Web (navegador) y Node.js.
- Procesamiento de imágenes de alta resolución: aunque la entrada es de 512×512, la máscara se puede redimensionar a la resolución original de la imagen.
- Ligereza: con solo 4,63 M de parámetros, es adecuado para dispositivos con recursos limitados.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.

## Casos de uso

- Eliminación de fondos en fotografía de producto: tiendas online pueden integrar el modelo para recortar automáticamente los productos de sus imágenes y colocarlos sobre fondos neutros o personalizados. Su tamaño reducido permite ejecutarlo en servidores modestos o incluso en el cliente.
- Aplicaciones de edición fotográfica móvil: al ser tan ligero, puede desplegarse en dispositivos móviles mediante ONNX Runtime Mobile, permitiendo a los usuarios eliminar fondos de forma local sin conexión.
- Procesamiento por lotes en pipelines de datos: empresas que manejan grandes volúmenes de imágenes (por ejemplo, catálogos) pueden usar el modelo en scripts Python para generar recortes automáticamente, gracias a su baja carga computacional.
- Herramientas web de recorte de imágenes: mediante ONNX Runtime Web, el modelo puede ejecutarse directamente en el navegador, ofreciendo una experiencia de usuario instantánea sin enviar imágenes a un servidor.
- Prototipado rápido de sistemas de segmentación: investigadores y desarrolladores pueden usar este modelo como punto de partida para experimentar con técnicas de segmentación o como baseline en comparaciones.
- Automatización de diseño gráfico: herramientas de diseño pueden integrar la eliminación de fondos como una función básica, aprovechando la simplicidad del modelo y su licencia permisiva.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados en el subconjunto de validación DIS-VD del dataset DIS5K:

| Metrica | Valor |
|---|---|
| F1 | 0,6461 |
| MAE | 0,1178 |
| Resolucion de entrada | 512×512 |
| Parametros | 4,63 M |
| Entrenamiento | 1× T4, 40 épocas |

No se han publicado resultados comparativos con otros modelos de segmentación en la información disponible. Por tanto, no es posible establecer una comparativa cuantitativa con alternativas como U2-Net, MODNet o BiRefNet.

## Requisitos de hardware

- VRAM estimada: al tener solo 4,63 M de parámetros, el modelo ocupa aproximadamente 18 MB en FP32 (4,63 M × 4 bytes). La inferencia puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama baja como NVIDIA GTX 1650 o integradas. Una T4, como la usada en el entrenamiento, es más que suficiente.
- Compatibilidad con consumer GPU: sí, el modelo cabe en cualquier GPU de consumo actual, incluidas las de portátiles.
- Opciones de despliegue: PyTorch, ONNX Runtime (CPU/GPU), ONNX Runtime Web (navegador), Node.js con onnxruntime-node, y potencialmente otros runtime como TensorRT o OpenVINO mediante conversión.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño del modelo, se espera una latencia de pocos milisegundos en GPU y de decenas de milisegundos en CPU para una imagen de 512×512.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. Como referencia cualitativa, se pueden mencionar alternativas populares en segmentación de objetos salientes:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Catrex Lite (este) | 4,63 M | 512×512 | Apache 2.0 | Hugging Face |
| U2-Net | 44 M | 320×320 | Apache 2.0 | GitHub, Hugging Face |
| MODNet | 25 M | 512×512 | Apache 2.0 | GitHub, Hugging Face |
| BiRefNet | 200 M+ | 1024×1024 | MIT | Hugging Face |

Catrex Lite es significativamente más pequeño que estas alternativas, lo que lo hace más rápido y ligero, pero probablemente con menor precisión. No obstante, no hay datos de rendimiento comparativo en la información disponible.

## Limitaciones y advertencias

- Precisión limitada: con un F1 de 0,6461 en DIS-VD, el modelo puede fallar en imágenes complejas con fondos similares al objeto, oclusiones o múltiples objetos.
- Entrenamiento específico: al haberse entrenado únicamente con DIS5K, su rendimiento puede degradarse en dominios muy diferentes (por ejemplo, imágenes médicas o satelitales).
- Resolución fija: la entrada está limitada a 512×512, lo que puede requerir redimensionamientos que afecten a la calidad en imágenes de alta resolución.
- Sin soporte de texto: no procesa lenguaje natural, por lo que no es adecuado para tareas que requieran comprensión semántica.
- Documentación incompleta: no se especifican detalles de arquitectura, hiperparámetros ni posibles sesgos, lo que dificulta la evaluación rigurosa.
- Licencia permisiva: Apache 2.0 permite uso comercial, pero el usuario debe atribuir la autoría y mantener el aviso de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Catniti/catrex-lite-image-segmentation
- Notebook de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/Catniti/catrex-lite-image-segmentation.ipynb
- Notebook de Kaggle: https://kaggle.com/kernels/welcome?src=https://huggingface.co/Catniti/catrex-lite-image-segmentation/resolve/main/notebook.ipynb
- Archivo ONNX: https://huggingface.co/Catniti/catrex-lite-image-segmentation/blob/main/model.onnx
- Dataset DIS5K: https://huggingface.co/datasets/nobg/DIS5K
