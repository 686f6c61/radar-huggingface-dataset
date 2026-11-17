# shyo2/cnn0

## Resumen

`shyo2/cnn0` (etiquetado internamente como "a0") es un experimento académico de clasificación de imágenes sobre MNIST, no un modelo de lenguaje. Lo publica el usuario shyo2 en Hugging Face con licencia MIT y un tamaño de repositorio de 0,1 GB. Su objetivo declarado es comparar el comportamiento de redes convolucionales puras (PlainBlock) frente a redes con conexiones residuales (ResBlock) al aumentar la profundidad, verificando empíricamente el problema de degradación descrito en el paper de ResNet y si las skip connections lo mitigan, especialmente en ausencia de BatchNorm.

La arquitectura es una pila de bloques convolucionales con 64 canales fijos; cada bloque contiene dos convoluciones. La profundidad se parametriza por número de bloques (5, 10, 15, 20 o 40), y cada variante se entrena con y sin conexiones residuales, y con y sin BatchNorm. El entrenamiento usa Adam con lr=1e-3, CosineAnnealingLR, batch de 128 y 15 épocas sobre MNIST (28×28, 10 clases).

Es relevante únicamente como material didáctico y de reproducción de experimentos sobre degradación en redes profundas: los resultados muestran que sin BatchNorm las CNN puras colapsan a ~11,35 % de accuracy a profundidades de 20 y 40 bloques, mientras que las variantes residuales mantienen ~99,4 %. No es un modelo apto para producción ni para tareas fuera de MNIST.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con bloques convolucionales (PlainBlock / ResBlock), canales fijos a 64, 2 convoluciones por bloque |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 28×28 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch state_dict, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`model.pt`, cargado con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

La red se construye apilando bloques de dos convoluciones con BatchNorm y ReLU opcionales. El `PlainBlock` sigue el patrón Conv → BN → ReLU → Conv → BN → ReLU, y el `ResBlock` añade una conexión residual de tipo `out + x` sobre esa misma estructura. El número de canales es fijo a 64 y la profundidad se controla con el parámetro `depth` (número de bloques). La implementación está en `src/model.py` y el script de entrenamiento en `src/train.py`, con opciones `--depth`, `--residual`, `--no-bn`, `--channels`, `--epochs`, `--batch-size` y `--lr`.

El entrenamiento se realizó sobre MNIST con Adam (lr=1e-3), CosineAnnealingLR, batch de 128 y 15 épocas. El entorno de reproducción indicado es PyTorch 2.11.0+cu128 sobre una NVIDIA RTX 5070 Ti con CUDA 12.8. No se documenta aumentación de datos, inicialización específica ni técnicas de regularización más allá de BatchNorm. El interés técnico del experimento es la comparación controlada entre variantes con y sin residual y con y sin normalización, que aísla el efecto de las skip connections en el régimen profundo.

## Capacidades

- Clasificación de dígitos manuscritos de MNIST (28×28, 10 clases).
- Comparación experimental de profundidad en CNN puras frente a residuales.
- Evaluación del efecto de BatchNorm en la estabilidad del entrenamiento en profundidad.
- Reproducción de curvas de entrenamiento y validación mediante `src/plot_results.py` a partir de `runs/*/history.json`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Docencia sobre degradación en redes profundas: usar las variantes `depth20` y `depth40` con y sin residual para mostrar en clase por qué las skip connections estabilizan el entrenamiento cuando no hay BatchNorm.
- Reproducción de experimentos de ResNet a pequeña escala: el repositorio incluye scripts y pesos para repetir la comparativa completa en una GPU de consumo en minutos.
- Estudio del papel de BatchNorm: comparar las tablas con y sin BN permite analizar empíricamente cómo la normalización enmascara el problema de degradación a profundidades moderadas.
- Base para prácticas de PyTorch: el código de `src/model.py` y `src/train.py` sirve como esqueleto mínimo para enseñar construcción de bloques residuales y bucles de entrenamiento.
- Prototipado de clasificadores de dígitos en entornos controlados: para demos de OCR de un solo dígito sobre imágenes 28×28 ya segmentadas, las variantes con ~99,6 % de accuracy de validación son suficientes.
- Benchmark de infraestructura: al ser un modelo pequeño, se puede usar para validar pipelines de entrenamiento e inferencia en PyTorch con CUDA antes de escalar a modelos mayores.
- Comparación de estrategias de inicialización o regularización: el código parametriza profundidad, canales y BN, lo que permite añadir variantes y medir su impacto sobre MNIST.

## Benchmarks y rendimiento

Los únicos resultados publicados son las accuracy de validación sobre MNIST reportadas en la model card.

Con BatchNorm:

| Profundidad (bloques) | CNN pura | Con residual |
|---|---|---|
| 5 | 99,70 % | — |
| 10 | 99,62 % | 99,58 % |
| 15 | 99,60 % | 99,52 % |
| 20 | 99,58 % | 99,66 % |
| 40 | 98,89 % (inestable) | 99,56 % |

Sin BatchNorm:

| Profundidad (bloques) | CNN pura | Con residual |
|---|---|---|
| 20 | 11,35 % (colapso) | 99,39 % |
| 40 | 11,35 % (colapso) | 99,40 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje. Tampoco se reportan métricas de test, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,1 GB y los pesos de cada variante son una fracción de eso. Cabe holgadamente en cualquier GPU de consumo con 2 GB o más.
- GPU recomendadas: cualquiera con soporte CUDA; el entorno de referencia es una NVIDIA RTX 5070 Ti con CUDA 12.8. Para entrenamiento, una GPU de gama media es suficiente.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con al menos 2 GB de VRAM; también puede ejecutarse en CPU para inferencia de una sola imagen.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` del `state_dict` y `model.eval()`. No hay versiones en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia por imagen en GPU es del orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| shyo2/cnn0 | Clasificación MNIST | CNN con bloques residuales opcionales | no disponible | 28×28 | MIT | Hugging Face |
| LeNet-5 (referencia histórica) | Clasificación MNIST | CNN de 2 capas convolucionales | ~60 K | 32×32 | no disponible | Implementaciones múltiples |
| ResNet-18 (torchvision) | Clasificación ImageNet | CNN residual de 18 capas | ~11,7 M | 224×224 | BSD-3-Clause | torchvision |
| Modelos MNIST en Hugging Face | Clasificación MNIST | CNN o MLP | variable | 28×28 | variable | Hugging Face |

La comparación con LeNet-5 y ResNet-18 es solo orientativa: el primero es la referencia clásica para MNIST y el segundo es la arquitectura que inspiró el experimento, pero ninguno de los dos se distribuye con la misma configuración ni el mismo propósito didáctico. No se dispone de datos de rendimiento de alternativas directas en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo de juguete: entrena y evalúa exclusivamente sobre MNIST; no generaliza a otras tareas de visión.
- Sin métricas de test: la model card solo reporta accuracy de validación; no hay evaluación sobre el conjunto de test estándar.
- Sin información sobre sesgos: no se documenta ningún análisis de sesgo, aunque MNIST es un dataset relativamente controlado.
- Riesgo de sobreajuste a la configuración experimental: los resultados dependen de hiperparámetros concretos (lr, épocas, canales) y no se reportan intervalos de confianza ni múltiples semillas.
- Colapso documentado sin BatchNorm: las CNN puras a profundidad 20 y 40 caen a 11,35 % de accuracy, lo que refleja inestabilidad de entrenamiento y no un fallo del modelo en inferencia.
- Licencia MIT: permite uso comercial y modificación, pero el modelo no tiene utilidad práctica fuera de docencia o investigación metodológica.
- Sin soporte de texto, tool calling, agentes ni multimodalidad: no debe evaluarse como un modelo de lenguaje.
- Formato de pesos ligado a PyTorch: requiere definir la arquitectura en `src/model.py` antes de cargar el `state_dict`; no hay exportaciones a ONNX, GGUF ni otros formatos.
- Repositorio pequeño y con cero descargas: no hay garantía de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shyo2/cnn0
- Resultados detallados (referenciado en la model card): RESULTS.md dentro del repositorio
- Fuente de datos (referenciado en la model card): DATA.md dentro del repositorio
- Código de entrenamiento y modelo: `src/model.py`, `src/train.py`, `src/plot_results.py` dentro del repositorio
- Pesos por experimento: `runs/depthN[_res][_nobn]/model.pt` dentro del repositorio
- Paper de referencia sobre degradación y conexiones residuales (ResNet): no disponible en la información proporcionada
