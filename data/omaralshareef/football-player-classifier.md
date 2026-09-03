# omaralshareef/football-player-classifier

## Resumen

El modelo `football-player-classifier`, desarrollado por omaralshareef, es un clasificador de imágenes basado en una arquitectura ResNet-50 que identifica a 22 jugadores de fútbol galardonados o nominados al premio Golden Foot a partir de una fotografía. Se trata de un ajuste fino (fine-tuning) del modelo base `timm/resnet50.a1_in1k` sobre el dataset `aaronqg/golden-foot-football-players`, y está publicado bajo licencia Apache-2.0.

El modelo resuelve un problema de clasificación de imágenes de una sola etiqueta con 22 clases, que incluyen a Lionel Messi, Cristiano Ronaldo, Diego Maradona, Pelé, Ronaldinho, entre otros. Con aproximadamente 23,6 millones de parámetros y un peso total de 0,1 GB, es un modelo ligero que puede desplegarse en hardware de consumo e incluso en dispositivos con recursos limitados.

La relevancia de este modelo radica en su aplicación práctica para sistemas de reconocimiento automático de futbolistas en fotografía, con una precisión de test del 74,13 % y una macro-F1 del 73,79 %, lo que lo convierte en una opción viable para tareas de clasificación deportiva en producción, siempre que se acepte un margen de error de aproximadamente uno de cada cuatro casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN residual, 50 capas) |
| Parametros totales | 23.606.230 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ResNet-50, una red neuronal convolucional residual de 50 capas desarrollada originalmente por Microsoft Research. La variante utilizada como punto de partida es `timm/resnet50.a1_in1k`, que emplea el recetario de entrenamiento AugReg (augmentation regularized) sobre ImageNet-1k. La arquitectura utiliza bloques residuales con conexiones de atajo (skip connections) que permiten entrenar redes profundas sin degradación del gradiente.

El ajuste fino se realizó sobre el dataset `aaronqg/golden-foot-football-players`, que contiene fotografías de los 22 ganadores y nominados del premio Golden Foot. El proceso de entrenamiento se llevó a cabo con el framework `transformers` de HuggingFace (indicado por la etiqueta `generated_from_trainer`), lo que sugiere el uso del `Trainer` estándar de la librería. No se especifican detalles adicionales sobre el número de épocas, tasa de aprendizaje, estrategia de aumento de datos ni composición exacta del dataset en la información disponible.

## Capacidades

- Clasificación de imágenes de futbolistas en 22 clases: Alessandro Del Piero, Andrés Iniesta, Andriy Shevchenko, Cristiano Ronaldo, Didier Drogba, Diego Maradona, Edinson Cavani, Francesco Totti, Gianluigi Buffon, Iker Casillas, Lionel Messi, Luka Modrić, Mohamed Salah, Pavel Nedvěd, Pelé, Ryan Giggs, Roberto Baggio, Roberto Carlos, Ronaldinho, Ronaldo Nazário, Samuel Eto'o y Zlatan Ibrahimović.
- Inferencia de una sola etiqueta por imagen (single-label classification).
- Integración directa con el pipeline `image-classification` de `transformers`.
- Compatible con el wrapper `timm` para uso dentro del ecosistema PyTorch Image Models.
- Desplegable en HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales adicionales, al tratarse exclusivamente de un clasificador de visión.

## Casos de uso

- **Sistemas de archivo fotográfico deportivo**: el modelo puede clasificar automáticamente bibliotecas de imágenes históricas de fútbol, etiquetando cada fotografía con el jugador correspondiente. Su tamaño reducido (23,6 M de parámetros) permite procesar grandes volúmenes de imágenes sin requerir infraestructura GPU costosa.
- **Aplicaciones móviles de reconocimiento de jugadores**: gracias a su peso de aproximadamente 94 MB en FP32 (unos 47 MB en FP16), el modelo puede desplegarse en dispositivos móviles mediante ONNX o CoreML para identificar jugadores en tiempo real desde la cámara del teléfono.
- **Enriquecimiento de contenido editorial**: medios deportivos y agencias de noticias pueden utilizar el modelo para etiquetar automáticamente fotografías en sus sistemas de gestión de contenidos, facilitando la búsqueda y organización de material visual por jugador.
- **Verificación de identidad en eventos y merchandising**: el modelo puede integrarse en sistemas de verificación para confirmar la presencia de un jugador específico en fotografías de eventos, encuentros con aficionados o productos oficiales.
- **Análisis de redes sociales**: marcas y equipos pueden monitorizar contenido generado por usuarios en plataformas como Instagram o X, clasificando automáticamente las publicaciones que contienen imágenes de jugadores concretos para campañas de marketing o análisis de audiencia.
- **Herramientas educativas y de entretenimiento**: aplicaciones de trivia o juegos de preguntas sobre fútbol pueden usar el modelo para validar respuestas visuales, presentando una foto al usuario y verificando si identifica correctamente al jugador.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en el model-index son los siguientes:

| Metrica | Valor |
|---|---|
| Validation Accuracy (best) | 72,80 % |
| Test Accuracy | 74,13 % |
| Test Macro F1 | 73,79 % |
| Validation Macro F1 | 72,70 % |

Estos resultados se obtuvieron sobre el dataset `aaronqg/golden-foot-football-players`. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 94 MB en FP32 y 47 MB en FP16 solo para los pesos del modelo. Con activaciones y overhead de inferencia, se recomienda al menos 1 GB de VRAM para un funcionamiento cómodo.
- **GPU recomendadas**: cualquier GPU moderna, incluidas tarjetas de gama de entrada como NVIDIA GTX 1050, RTX 3060 o superiores. También es viable la inferencia en CPU para lotes pequeños.
- **Compatibilidad con GPU de consumo**: sí, el modelo cabe holgadamente en cualquier GPU de consumo actual e incluso en hardware de gama baja.
- **Opciones de despliegue**: pipeline de `transformers` de HuggingFace, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), ONNX Runtime, TorchScript y cualquier framework compatible con safetensors. No se menciona soporte para vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- **Latencia y throughput**: no se han publicado mediciones específicas. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por imagen en GPU moderna y de unos cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se han encontrado modelos comparables específicamente entrenados para clasificación de jugadores de fútbol del Golden Foot. La comparación más directa es con el modelo base:

| Modelo | Parametros | Tarea | Accuracy | Licencia |
|---|---|---|---|---|
| football-player-classifier | 23,6 M | Clasificacion de 22 futbolistas | 74,13 % (test) | Apache-2.0 |
| timm/resnet50.a1_in1k | ~25,6 M | Clasificacion ImageNet-1k (1000 clases) | no disponible en la informacion | Apache-2.0 |

El modelo base ResNet-50 está entrenado en ImageNet-1k y no tiene capacidad específica para distinguir entre jugadores de fútbol; el ajuste fino es necesario para esta tarea concreta. No se dispone de datos sobre otros fine-tunes del mismo dataset para realizar una comparativa más amplia.

## Limitaciones y advertencias

- **Precisión limitada**: con un 74,13 % de accuracy en test, el modelo comete errores en aproximadamente uno de cada cuatro casos. No es adecuado para aplicaciones donde la precisión sea crítica sin supervisión humana.
- **Alcance restringido a 22 clases**: el modelo solo reconoce a los 22 jugadores incluidos en el dataset de entrenamiento. Cualquier otra persona o jugador no contemplado será clasificado erróneamente en una de las clases existentes.
- **Sesgos del dataset**: el dataset `aaronqg/golden-foot-football-players` puede presentar desequilibrios en la representación de cada jugador, condiciones de iluminación, ángulos de cámara o calidad de imagen, lo que puede afectar al rendimiento en fotografías del mundo real.
- **Riesgo de sobreajuste**: al ser un ajuste fino de un modelo preentrenado con un dataset presumiblemente limitado, existe riesgo de sobreajuste a las características específicas del dataset de entrenamiento.
- **Sin capacidad de explicabilidad**: el modelo no proporciona información sobre qué características visuales contribuyen a la decisión de clasificación, lo que puede ser un inconveniente en aplicaciones que requieran transparencia.
- **Licencia**: aunque la licencia Apache-2.0 permite uso comercial, es recomendable verificar los términos del dataset `aaronqg/golden-foot-football-players` antes de utilizar el modelo en producción.
- **Sin soporte para imágenes de baja calidad o parcialmente ocluidas**: no se han publicado evaluaciones sobre el rendimiento del modelo con imágenes borrosas, de baja resolución o con el rostro parcialmente cubierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omaralshareef/football-player-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/aaronqg/golden-foot-football-players
- Modelo base: https://huggingface.co/timm/resnet50.a1_in1k
