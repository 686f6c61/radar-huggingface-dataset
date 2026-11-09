# raihana09/mnist-cnn-digit-recognizer

## Resumen

`raihana09/mnist-cnn-digit-recognizer` es una red neuronal convolucional ligera entrenada en PyTorch para clasificar dígitos manuscritos del conjunto de datos MNIST. El modelo tiene aproximadamente 51.000 parámetros y sigue una arquitectura clásica de dos bloques convolucionales con max pooling, seguidos de capas totalmente conectadas que producen 10 clases de salida (dígitos del 0 al 9). Se trata de un proyecto de portafolio de aprendizaje profundo, no de un modelo de propósito general ni de un modelo de lenguaje.

No es un modelo generativo ni un transformer: es un clasificador de imágenes de 28x28 píxeles en escala de grises. Su relevancia es didáctica y de referencia para quienes buscan un ejemplo mínimo y reproducible de CNN en PyTorch, con una integración descrita con Django y un lienzo de dibujo interactivo. No hay información publicada sobre licencia, idiomas ni pipeline de Hugging Face.

El repositorio tiene un tamaño de 0,0 GB (esencialmente los pesos y poco más) y no registra descargas ni likes en el momento de la consulta. No se dispone de datos de entrenamiento detallados (número de épocas, aumentación, métricas finales) más allá de la descripción de la arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (2 bloques Conv2D + ReLU + MaxPool, seguido de capas totalmente conectadas) |
| Parametros totales | ~51.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 28x28 en escala de grises) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de dígitos, no procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (librería `pytorch`; formato de fichero no especificado) |

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial: entrada de imagen en escala de grises de 28x28 píxeles; primer bloque con convolución 2D de 1 a 16 filtros de 3x3, activación ReLU y max pooling 2x2; segundo bloque con convolución 2D de 16 a 32 filtros de 3x3, ReLU y max pooling 2x2; y un clasificador de capas totalmente conectadas que proyecta a 10 clases (dígitos 0-9). El total de parámetros ronda los 51.000, lo que la sitúa en el rango de modelos extremadamente pequeños.

El entrenamiento se realizó sobre el conjunto de datos MNIST con PyTorch, según indica la model card. No se especifican el número de épocas, el tamaño del batch, la función de pérdida, el optimizador, si hubo aumentación de datos ni las métricas finales de validación o test. Tampoco se documenta ningún tipo de ajuste fino posterior (RLHF, DPO) ni innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Clasificación de imágenes de dígitos manuscritos: dado un tensor de 28x28 en escala de grises, devuelve una distribución sobre 10 clases (0-9).
- Reconocimiento de dígitos en un lienzo de dibujo interactivo, según la integración descrita con Django.
- Inferencia ligera en CPU: por su tamaño (~51k parámetros), es viable sin GPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras modalidades más allá de la clasificación de dígitos en imágenes de 28x28.

## Casos de uso

- Reconocimiento de dígitos en formularios digitalizados: integrar el modelo en un pipeline que recorte regiones de casillas numéricas de documentos escaneados, las redimensione a 28x28 en escala de grises y obtenga la clase predicha. Es adecuado por su bajo coste computacional y su entrenamiento específico en MNIST.
- Lienzo de dibujo interactivo en aplicaciones web: usar el modelo como backend de un canvas donde el usuario dibuja un dígito y recibe la predicción en tiempo real, tal como se describe en la integración con Django del proyecto original.
- Prototipado educativo de visión por computador: servir como ejemplo mínimo y reproducible de CNN en PyTorch para cursos, tutoriales o demostraciones de clasificación de imágenes.
- Pruebas de integración de modelos en Hugging Face: validar flujos de carga de pesos PyTorch, serialización y despliegue de un clasificador pequeño en entornos de CI.
- Filtro previo en sistemas de OCR numérico: como clasificador rápido para dígitos aislados en imágenes de baja resolución, antes de recurrir a un OCR más pesado.
- Benchmark de infraestructura de inferencia: medir latencia y throughput de un modelo trivial para calibrar pipelines de despliegue (CPU, contenedores, endpoints) antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye precisión en test, matriz de confusión ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (~51k parámetros en float32, aproximadamente 200 KB), más el overhead del framework; cabe en cualquier GPU y en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) la ejecuta sin aprovecharse de su capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (carga de `state_dict`), TorchScript, ONNX Runtime tras exportación, o servidores web ligeros (Flask, Django) según el proyecto original. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raihana09/mnist-cnn-digit-recognizer | ~51.000 | 28x28 gris | Clasificación de dígitos MNIST | no disponible | Hugging Face |
| LeNet-5 (referencia clásica) | ~60.000 | 32x32 gris | Clasificación de dígitos | no disponible | Referencia académica |
| CNN MNIST típica en tutoriales PyTorch | ~100.000-1.000.000 | 28x28 gris | Clasificación de dígitos MNIST | variable | Repositorios públicos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse en MNIST, hereda las características del dataset (dígitos manuscritos en inglés estadounidense, trazos y estilos limitados).
- Riesgo de alucinación: no aplica en sentido generativo, pero puede producir clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- Limitaciones de contexto o idioma: solo acepta imágenes de 28x28 en escala de grises; no procesa texto ni otros formatos. No se documenta robustez ante rotaciones, ruido o estilos de escritura no representados en MNIST.
- Restricciones de licencia para uso comercial: la licencia no está disponible, por lo que no se puede asumir permiso de uso comercial sin consultar al autor.
- Caveats para producción: no hay métricas de precisión publicadas, ni información sobre el proceso de entrenamiento, ni garantías de mantenimiento; el repositorio no registra descargas ni actividad. No debe usarse como componente crítico sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raihana09/mnist-cnn-digit-recognizer
- Dataset MNIST (referencia): https://huggingface.co/datasets/ylecun/mnist
- PyTorch: https://pytorch.org/
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
