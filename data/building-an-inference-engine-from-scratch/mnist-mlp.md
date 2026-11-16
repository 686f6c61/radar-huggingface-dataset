# building-an-inference-engine-from-scratch/mnist-mlp

## Resumen

mnist-mlp es una red neuronal de tipo perceptrón multicapa (MLP) publicada por el usuario building-an-inference-engine-from-scratch como material didáctico del libro *Building an Inference Engine from Scratch* (밑바닥부터 만드는 추론 엔진), centrado en la implementación de un motor de inferencia en Rust llamado `badak`. No es un modelo de lenguaje: es un clasificador de dígitos manuscritos entrenado sobre el conjunto de datos MNIST, con 101.770 parámetros totales y una arquitectura 784 → 128 → 10 con activación ReLU.

Su propósito es exclusivamente pedagógico: permite a los lectores del libro ejecutar el motor de inferencia sin tener que entrenar el modelo por su cuenta, y sirve como referencia numérica (fichero `reference.safetensors`) para verificar que las implementaciones propias producen los mismos resultados que PyTorch. No está pensado para uso en producción ni para tareas generales de visión por computador.

Es relevante ahora únicamente en el contexto de quienes estudian ingeniería de inferencia de bajo nivel, ya que proporciona un caso de prueba mínimo, verificable y con licencia MIT para validar kernels, operadores y pipelines de ejecución propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) 784 → 128 → 10 con ReLU |
| Parametros totales | 101.770 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes de 28 × 28 píxeles) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `reference.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa de dos capas densas: una capa oculta de 128 unidades con activación ReLU y una capa de salida de 10 unidades que produce puntuaciones para los dígitos del 0 al 9. La entrada es un vector de 784 dimensiones obtenido al aplanar la imagen de 28 × 28 píxeles tras normalizarla con `(x / 255 − 0.1307) / 0.3081`; la media y la desviación típica empleadas en esa normalización se almacenan en los metadatos del fichero de pesos. Los pesos exportados son `fc1.weight`, `fc1.bias`, `fc2.weight` y `fc2.bias`.

El entrenamiento se realizó con el script `reference/ch07_train_mnist.py` del repositorio del libro, usando PyTorch 2.15.0, semilla aleatoria 0, optimizador Adam con tasa de aprendizaje 0.001, tamaño de lote 64, 5 épocas y ejecución en CPU sobre el conjunto de datos `ylecun/mnist`. No se documenta uso de RLHF, DPO ni ninguna técnica de ajuste posterior. El autor advierte que ejecutar el mismo script puede producir pesos ligeramente distintos según la máquina y la versión de PyTorch, por lo que para reproducir exactamente las cifras del libro deben usarse los ficheros publicados en el repositorio. El modelo alcanza una precisión de prueba del 97,64 % (9.764 aciertos sobre 10.000 imágenes). El repositorio incluye además `reference.safetensors`, que contiene las salidas por capa (`input`, `fc1`, `relu`, `logits`) para las primeras 16 imágenes, las puntuaciones de todo el conjunto de prueba (`all_logits`) y las predicciones (`predictions`), como referencia para validar implementaciones.

## Capacidades

- Clasificación de dígitos manuscritos (0-9) a partir de imágenes en escala de grises de 28 × 28 píxeles.
- Producción de 10 puntuaciones (logits) por imagen, una por clase.
- Funciona como referencia numérica verificable para validar motores de inferencia propios frente a las salidas de PyTorch.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras modalidades más allá de la clasificación de dígitos MNIST.

## Casos de uso

- Validación de un motor de inferencia en Rust: el modelo sirve para comprobar que la implementación de `badak` reproduce los logits y las predicciones almacenados en `reference.safetensors`, capa por capa, para las primeras 16 imágenes y para el conjunto de prueba completo.
- Docencia de ingeniería de inferencia: permite a los lectores del libro ejecutar los ejemplos del capítulo 7 sin necesidad de entrenar el modelo, con un coste computacional mínimo.
- Pruebas unitarias de operadores: al ser una MLP de dos capas, resulta adecuado para verificar implementaciones de multiplicación de matrices, suma de sesgos y activación ReLU contra resultados de referencia conocidos.
- Comparación de precisión numérica: permite medir la desviación entre la implementación propia y PyTorch sobre 10.000 imágenes con precisión de referencia del 97,64 %.
- Pruebas de carga de safetensors: útil para validar el parseo de metadatos (media y desviación típica de normalización) y la correspondencia de nombres de tensores.
- Ejemplo mínimo de pipeline de clasificación de imágenes: sirve como esqueleto para construir flujos de preprocesado (normalización, aplanado) e inferencia en entornos educativos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión en test (MNIST, 10.000 imágenes) | 97,64 % (9.764 aciertos) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y ninguno de ellos sería aplicable a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en precisión completa (101.770 parámetros); el modelo cabe holgadamente en cualquier GPU y también en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) lo ejecuta con un uso de memoria despreciable. El entrenamiento original se realizó en CPU.
- Cabe en cualquier GPU de consumo, e incluso en dispositivos embebidos.
- Opciones de despliegue: el modelo está pensado para ejecutarse con el motor `badak` del libro; al estar en formato safetensors y librería PyTorch, también puede cargarse directamente con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no resultan aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, serían del orden de microsegundos por imagen en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia conceptual, cualquier MLP entrenado sobre MNIST con arquitectura similar (por ejemplo, 784 → 128 → 10) sería equiparable en parámetros y precisión, pero no se han facilitado datos de alternativas concretas, por lo que la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Modelo puramente didáctico: el autor lo describe como un modelo pequeño para mostrar material de entrenamiento, no para uso real.
- Solo funciona con imágenes de 28 × 28 píxeles, fondo negro y dígitos blancos centrados de la misma forma que MNIST; fuera de esa distribución la precisión se degrada sin garantías.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades conversacionales ni de razonamiento general.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de clasificaciones erróneas en entradas fuera de distribución (aproximadamente un 2,36 % de error en el propio conjunto de prueba MNIST).
- Sesgos conocidos: no documentados; cabe esperar el sesgo inherente al conjunto MNIST (dígitos manuscritos de una población concreta de escritores).
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Caveat para producción: los pesos pueden diferir ligeramente si se regeneran con el script, por lo que para reproducibilidad exacta deben usarse los ficheros publicados.
- Sin datos sobre cuantización ni sobre idiomas, al no ser aplicables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/building-an-inference-engine-from-scratch/mnist-mlp
- Libro: https://chosungmann.github.io/building-an-inference-engine-from-scratch/
- Código: https://github.com/chosungmann/building-an-inference-engine-from-scratch
- Conjunto de datos: https://huggingface.co/datasets/ylecun/mnist
