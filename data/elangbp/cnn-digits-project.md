# elangbp/cnn-digits-project

## Resumen

`elangbp/cnn-digits-project` es un clasificador de dígitos manuscritos implementado como red neuronal convolucional (CNN) en PyTorch, publicado por el usuario elangbp en Hugging Face. El modelo se entrenó sobre el dataset `digits` de scikit-learn, compuesto por 1.797 imágenes de 8x8 píxeles en escala de grises que se convierten a RGB (tres canales) como entrada de la red. Alcanza una precisión del 93,33 % en el conjunto de test y clasifica las diez clases correspondientes a los dígitos del 0 al 9.

No se trata de un modelo de lenguaje, sino de un proyecto de clasificación de imágenes de tamaño mínimo (el repositorio ocupa 0,0 GB según Hugging Face) y con licencia MIT. Su relevancia es principalmente formativa y de prototipado: sirve como ejemplo completo del ciclo de entrenamiento, guardado y carga de una CNN, aunque el checkpoint (`best_digits_cnn.pth`) exige recrear la arquitectura desde un notebook de Colab antes de poder cargar los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN en PyTorch (detalles de capas no disponibles; definida en un notebook de Colab) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (el modelo no es MoE) |
| Longitud de contexto | no aplicable (modelo de clasificación de imágenes, no de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye un único checkpoint .pth, sin variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión; salida: clases 0-9) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch (.pth); no safetensors ni GGUF |
| Tarea | image-classification |
| Entrada | Imágenes de 8x8 píxeles convertidas de escala de grises a RGB |
| Normalización | media (0,5, 0,5, 0,5), desviación estándar (0,5, 0,5, 0,5) |
| Número de clases | 10 (dígitos del 0 al 9) |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es una CNN convencional en PyTorch cuya definición exacta de capas no se publica en el repositorio: la model card indica expresamente que hay que recrear la arquitectura desde el notebook de Colab antes de llamar a `load_state_dict` con el checkpoint `best_digits_cnn.pth`. La entrada procede del dataset `digits` de scikit-learn (1.797 muestras de dígitos manuscritos de 8x8 píxeles, con 10 clases aproximadamente equilibradas), convertidas de un canal de escala de grises a tres canales RGB para adaptarse a la primera capa convolucional.

El preprocesado documentado aplica una normalización con media (0,5, 0,5, 0,5) y desviación estándar (0,5, 0,5, 0,5). No se publican detalles del entrenamiento: número de épocas, optimizador, función de pérdida, reparto train/test ni técnicas adicionales como augmentation o schedulers. Al no ser un modelo generativo, no aplican RLHF ni DPO. No hay ninguna innovación técnica destacable documentada: se trata de un pipeline estándar de clasificación de imágenes.

## Capacidades

- Clasificación de dígitos manuscritos del 0 al 9 en imágenes de 8x8 píxeles, con una precisión en test del 93,33 %.
- Entrada en formato RGB (tres canales) con normalización documentada, fácil de integrar en pipelines de `torchvision.transforms`.
- Huella de memoria mínima: el repositorio completo ocupa 0,0 GB y la inferencia es viable en CPU sin GPU dedicada.
- No dispone de capacidades de lenguaje natural: no genera texto, no razona, no programa ni resuelve matemáticas.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- Sin capacidades multilingües ni modalidades adicionales: la visión está limitada a dígitos; no hay OCR de texto general, ni audio, ni modo de pensamiento.

## Casos de uso

- Enseñanza de deep learning: ejemplo completo y ligero para practicar el ciclo de entrenar, guardar y cargar modelos en PyTorch (`load_state_dict`), con una precisión publicada contra la que comparar modificaciones.
- Prototipado de OCR de dígitos en entornos controlados: formularios o captchas sencillos cuyas imágenes puedan preprocesarse a 8x8; adecuado por su precisión del 93,33 % y su coste de cómputo prácticamente nulo.
- Demos interactivas: envolver el modelo en Gradio o Streamlit para dibujar un dígito y clasificarlo en tiempo real directamente en CPU, sin infraestructura de GPU.
- Pruebas de pipelines de inferencia en CI/CD: al ser minúsculo y rápido, funciona como modelo canary para validar despliegues de servicios de visión (FastAPI, Flask, TorchServe) sin consumir recursos significativos.
- Punto de partida para fine-tuning: recrear la arquitectura desde el notebook y reentrenar sobre MNIST (28x28) o datos propios de dígitos para mejorar la precisión y ampliar el dominio.
- Docencia del preprocesado: ilustra dos errores habituales en proyectos reales, la conversión de escala de grises a RGB y la aplicación de la normalización (0,5, 0,5, 0,5) antes de la inferencia.
- Baseline para comparar arquitecturas: punto de referencia para comparar CNNs, MLPs u otros clasificadores sobre el mismo dataset `digits` de scikit-learn.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Precisión en test (dataset digits de scikit-learn) | 93,33 % |

No se han publicado comparaciones con otros modelos ni métricas adicionales (matriz de confusión, precisión por clase, F1, recall). Los benchmarks habituales de LLM (MMLU, HumanEval, GSM8K) no aplican a este modelo.

## Requisitos de hardware

- VRAM: no disponible como cifra concreta; por el tamaño del repositorio (0,0 GB) y la resolución de entrada (8x8), el modelo cabe en la memoria de cualquier equipo y no requiere GPU dedicada.
- GPU recomendadas: ninguna en concreto; la inferencia en CPU es suficiente. Cualquier GPU moderna, incluso integrada, ejecutaría el modelo sin problema.
- Consumer GPUs: cabe en cualquiera; no existe requisito mínimo relevante de hardware.
- Despliegue: PyTorch nativo (`load_state_dict` tras recrear la arquitectura desde el notebook de Colab). Las herramientas habituales de LLM (vLLM, llama.cpp, Ollama, TGI) no aplican a este modelo. Opciones razonables: servicio propio con FastAPI o Flask, TorchServe, o demo con Gradio/Streamlit.
- Latencia y throughput: no se han publicado mediciones; dada la entrada de 8x8 píxeles y el tamaño mínimo del modelo, la inferencia por imagen en CPU es prácticamente instantánea.

## Comparativa con modelos similares

No se han incluido en la información disponible modelos comparables con datos publicados, por lo que la comparativa detallada no está disponible.

| Modelo | Parámetros | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|
| elangbp/cnn-digits-project | no disponible | 93,33 % (test, digits) | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

Como contexto, el dataset `digits` de scikit-learn se usa habitualmente como banco de pruebas de clasificadores clásicos (SVM, regresión logística, MLP) y de CNNs educativas, pero la model card no publica ninguna de esas comparaciones.

## Limitaciones y advertencias

- Tasa de error del 6,67 %: falla aproximadamente 1 de cada 15 imágenes; al no publicarse matriz de confusión ni precisión por clase, se desconoce qué dígitos confunde con más frecuencia.
- Dominio muy estrecho: entrenado solo con el dataset `digits` de scikit-learn (1.797 imágenes de 8x8); no generaliza a dígitos de mayor resolución (MNIST a 28x28, documentos escaneados, fotografías reales) sin reentrenamiento ni adaptación de la entrada.
- Acoplamiento arquitectura-checkpoint: el repositorio no incluye el código de la arquitectura; hay que reconstruirla desde el notebook de Colab y cualquier desviación provocará errores al cargar el checkpoint con `load_state_dict`.
- Preprocesado obligatorio: la entrada debe convertirse a RGB y normalizarse con media (0,5, 0,5, 0,5) y desviación estándar (0,5, 0,5, 0,5); omitir estos pasos degrada la precisión.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha; no hay evidencia de uso en producción ni revisión externa.
- Sesgos: el dataset procede de un conjunto concreto de dígitos manuscritos derivado de Optdigits/NIST, por lo que el rendimiento puede variar con estilos de escritura o calidades de imagen distintas.
- No es un modelo generativo: no presenta riesgo de alucinación textual, pero el riesgo relevante es la clasificación errónea de dígitos en flujos automatizados (por ejemplo, lectura de formularios).
- Licencia MIT: permite uso comercial, modificación y redistribución sin restricciones más allá de conservar el aviso de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elangbp/cnn-digits-project
- Documentación del dataset `digits` de scikit-learn (referencia del dataset de entrenamiento): https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html

No se han encontrado enlaces a papers, blogs, repositorios de código adicionales ni demos en la información disponible.
