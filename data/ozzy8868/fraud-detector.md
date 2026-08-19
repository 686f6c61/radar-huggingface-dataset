# Ozzy8868/fraud-detector

## Resumen

El modelo `Ozzy8868/fraud-detector` es un clasificador de imágenes basado en la arquitectura ResNet18, desarrollado por el usuario Ozzy8868, cuyo objetivo es distinguir entre fotografías reales de productos y fotografías generadas por inteligencia artificial. Está pensado específicamente para el ámbito del comercio electrónico, donde las devoluciones de productos suelen acompañarse de imágenes que pueden ser manipuladas o sintéticas. El modelo fue entrenado sobre el dataset CIFAKE, un conjunto de datos que combina imágenes reales de CIFAR-10 con imágenes generadas por IA, y alcanza una precisión reportada de aproximadamente el 97 % en el conjunto de prueba.

A pesar de su nombre genérico, no se trata de un detector de fraudes financieros ni de transacciones, sino de un detector de imágenes sintéticas aplicado a la verificación visual de productos. La información técnica disponible es muy limitada: no se especifican parámetros totales, detalles de entrenamiento, ni se proporcionan métricas adicionales más allá de la precisión mencionada. El repositorio en Hugging Face tiene un tamaño de 0.0 GB, lo que sugiere que el modelo no está alojado directamente en la plataforma, sino que se enlaza a un archivo externo `.pth`. La licencia declarada en la model card es MIT, aunque la metadata de Hugging Face la marca como "no disponible".

Este modelo es relevante en un contexto donde la generación de imágenes sintéticas se ha vuelto accesible y plantea riesgos de fraude en plataformas de venta online. Su simplicidad (una red convolucional clásica) lo hace ligero y fácil de desplegar, aunque su capacidad se limita a la clasificación binaria de imágenes de bajo nivel (32x32 píxeles, según el dataset CIFAKE), lo que puede no ser suficiente para imágenes de alta resolución del mundo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (red neuronal convolucional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT (segun la model card) |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo se basa en ResNet18, una red neuronal convolucional residual de 18 capas, ampliamente utilizada para tareas de clasificación de imágenes. No se dispone de información adicional sobre la variante exacta (por ejemplo, si se usaron capas preentrenadas o se entrenó desde cero), ni sobre el proceso de entrenamiento más allá del dataset mencionado: CIFAKE. CIFAKE es un conjunto de datos que contiene 60 000 imágenes de 32x32 píxeles, divididas en 30 000 reales (procedentes de CIFAR-10) y 30 000 generadas por IA (mediante StyleGAN). El entrenamiento se realizó con un objetivo de clasificación binaria (REAL vs. FAKE). No se menciona el uso de técnicas como fine-tuning, data augmentation, o métodos de alineación como RLHF o DPO, que son propios de modelos de lenguaje y no aplican aquí.

La innovación técnica principal es la aplicación de una arquitectura clásica a un problema moderno: la detección de imágenes sintéticas en un contexto comercial. No se documentan técnicas especiales de atención, decodificación especulativa ni otras innovaciones recientes.

## Capacidades

- Clasificación binaria de imágenes: distingue entre imágenes reales y generadas por IA.
- Entrada de imágenes de 32x32 píxeles (formato del dataset CIFAKE).
- Salida probabilística o de etiqueta (REAL/FAKE), aunque no se especifica el formato exacto de salida.
- No soporta procesamiento de texto, audio ni vídeo.
- No dispone de capacidades de tool calling, agentes o razonamiento multi-paso.
- No es multilingüe, ya que es un modelo de visión.

## Casos de uso

- Verificación de imágenes en devoluciones de e-commerce: el modelo puede analizar las fotos que el cliente adjunta al solicitar una devolución y detectar si son sintéticas, reduciendo fraudes en reembolsos.
- Control de calidad en marketplaces: las plataformas pueden integrar el modelo para revisar automáticamente las imágenes de productos subidas por vendedores y descartar aquellas generadas por IA que no representen el producto real.
- Auditoría de contenido visual en anuncios: detectar si las imágenes publicitarias de un producto son reales o manipuladas, evitando publicidad engañosa.
- Filtrado de imágenes en sistemas de soporte al cliente: cuando un usuario reporta un problema con una foto, el modelo puede ayudar a determinar si la evidencia es auténtica.
- Investigación académica sobre detección de imágenes sintéticas: servir como punto de partida para comparar arquitecturas simples frente a métodos más avanzados.
- Prototipos de bajo coste: al ser una red ligera, puede desplegarse en entornos con recursos limitados para experimentar con detección de deepfakes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es una precisión aproximada del 97 % en el conjunto de prueba de CIFAKE, pero no se detalla el tamaño de la muestra, la metodología de evaluación ni se comparan con otros modelos. No se pueden extraer conclusiones sólidas sobre el rendimiento en imágenes del mundo real.

## Requisitos de hardware

- Al ser una ResNet18, el modelo es relativamente ligero: requiere aproximadamente 45 MB de memoria para los pesos en precisión flotante de 32 bits.
- Puede ejecutarse en CPU para inferencia en lotes pequeños, con una latencia de decenas de milisegundos por imagen (dependiendo del hardware).
- En GPU, cualquier tarjeta moderna (por ejemplo, NVIDIA GTX 1060 o superior) es suficiente. Una RTX 3060 o similar ofrece inferencia en tiempo real para aplicaciones de baja concurrencia.
- No se especifican requisitos de VRAM exactos, pero al ser un modelo pequeño, cabría en cualquier GPU con al menos 1 GB de VRAM.
- Opciones de despliegue: al ser un archivo `.pth` de PyTorch, se puede servir con TorchServe, FastAPI con PyTorch, o exportarse a ONNX para usar con TensorRT u otros runtime. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que son específicos de modelos de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de imágenes sintéticas con ResNet18). Existen otros detectores de imágenes generadas por IA basados en arquitecturas como EfficientNet, ViT o redes específicas para deepfake, pero no se proporcionan datos de rendimiento de este modelo frente a ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo fue entrenado con imágenes de 32x32 píxeles (CIFAKE). Su rendimiento en imágenes de alta resolución o de dominios distintos (por ejemplo, fotos de productos reales tomadas con smartphones) puede degradarse significativamente.
- El dataset CIFAKE se basa en CIFAR-10, que contiene objetos genéricos (aviones, coches, animales, etc.), no productos comerciales específicos. Esto limita su aplicabilidad directa a catálogos de e-commerce reales.
- La precisión reportada (~97 %) es sobre el conjunto de prueba de CIFAKE, que puede no ser representativo del mundo real. No se han evaluado falsos positivos/negativos en condiciones operativas.
- No se documentan sesgos específicos, pero es probable que el modelo tenga dificultades con imágenes que contengan texto, fondos complejos o condiciones de iluminación variables.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas con alta confianza, lo que en un sistema de detección de fraude podría llevar a rechazos o aprobaciones incorrectas.
- La licencia MIT permite uso comercial y modificación, pero no hay garantías de soporte ni mantenimiento.
- El repositorio en Hugging Face no contiene los pesos directamente (tamaño 0.0 GB); el enlace de descarga apunta a un archivo externo. Esto puede suponer un riesgo de disponibilidad si el enlace se rompe.
- No se especifica la versión de PyTorch ni las dependencias necesarias para cargar el modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ozzy8868/fraud-detector)
- [Enlace directo al archivo de pesos](https://huggingface.co/Ozzy8868/fraud-detector/resolve/main/best_resnet18_cifake.pth)

No se han encontrado otros enlaces relevantes (papers, blogs o repositorios) en la información proporcionada.
