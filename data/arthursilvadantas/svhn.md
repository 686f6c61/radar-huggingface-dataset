# arthursilvadantas/SVHN

## Resumen

SVHN es un clasificador de dígitos basado en una CNN de estilo VGG, publicado por Arthur Silva Dantas en Hugging Face. Resuelve una tarea concreta de visión por computador: determinar qué dígito (0-9) aparece en el centro de un recorte RGB de 32×32 píxeles procedente del dataset SVHN (Street View House Numbers). El modelo es el resultado final (experimento E16) de un estudio de ablación de 17 experimentos que parte de un perceptrón multicapa simple y llega a una CNN regularizada, modificando un único elemento en cada iteración.

Con 2,2 millones de parámetros y un checkpoint de solo 8,8 MB en formato PyTorch (`.pt`), el modelo alcanza un 97,13 % de accuracy en el split de test de SVHN (25.285 aciertos de 26.032 imágenes). Su relevancia no reside en ser un modelo de propósito general, sino en ser un ejemplo reproducible y bien documentado de ingeniería incremental: cada decisión de diseño (convoluciones apiladas, BatchNorm, Dropout, aumento de datos) está cuantificada con su ganancia en precisión.

Es un modelo de nicho, pensado para investigación educativa, prototipado de pipelines de OCR de dígitos y demostración de técnicas de regularización. No es un modelo de lenguaje ni un detector de números completos: clasifica un único dígito por recorte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN estilo VGG: 3 bloques de [conv 3×3 → BatchNorm → ReLU] × 2 → max pool, con 64-128-256 filtros, seguido de FC 256 → FC 10 |
| Parametros totales | 2,2 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 32×32×3 píxeles) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión nativa) |
| Idiomas soportados | no aplica (clasificación de dígitos arábigos 0-9); la model card declara en y pt para la documentación |
| Licencia | MIT para el modelo y el código; el dataset SVHN es de uso no comercial |
| Formato de pesos | PyTorch checkpoint `.pt` (8,8 MB) |

## Arquitectura y entrenamiento

La arquitectura es una CNN de estilo VGG con tres bloques convolucionales. Cada bloque aplica dos veces la secuencia convolución 3×3, BatchNorm y ReLU, seguida de max pooling; los bloques usan 64, 128 y 256 filtros respectivamente. La cabeza clasificadora consta de una capa fully connected de 256 unidades y una capa final de 10 logits (un logit por dígito). La regularización combina Dropout de 0,1 tras cada bloque y Dropout de 0,5 en el clasificador.

El entrenamiento usa el split oficial `train` de SVHN con una partición estratificada 90/10 para train/validación; el split `test` se reserva solo para reportar y el split `extra` no se utiliza. La optimización emplea Adam con scheduler OneCycle (learning rate máximo 1e-3), batch de 128 y 40 épocas, seleccionando la mejor época por accuracy de validación. El aumento de datos incluye rotación de ±10°, desplazamiento de ±10 %, escala de 0,9 a 1,1 y variación de brillo/contraste de ±20 %, sin flip horizontal, ya que un dígito espejado es otro símbolo. La normalización por canal (media y desviación típica del split de entrenamiento) se almacena dentro del checkpoint.

El estudio de ablación documenta las ganancias de cada decisión: el paso de MLP a CNN aporta +6,6 puntos porcentuales, el apilado de convoluciones 3×3 suma +3,4 y el Dropout añade +2,0. Los cambios de optimizador, scheduler y tamaño de batch afectan menos de ±0,4 puntos porcentuales. El modelo final (E16) es la variante más ancha de la configuración regularizada.

## Capacidades

- Clasificación de dígitos 0-9 en recortes RGB de 32×32 píxeles, con el dígito centrado en la imagen.
- Salida de 10 logits interpretables como probabilidades tras aplicar softmax.
- Calibración fiable: error de calibración esperado (ECE) de 0,49 %, de modo que la confianza declarada coincide con la tasa de acierto.
- Inferencia muy ligera: aproximadamente 1 ms por imagen en CPU de portátil con un solo hilo.
- Normalización integrada en el checkpoint, lo que simplifica el despliegue.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades multilingües, de visión general, audio ni modo de pensamiento.
- No es un detector: no localiza ni lee números de casa completos, solo clasifica un recorte ya centrado.

## Casos de uso

- OCR de dígitos en pipelines de digitalización: tras un detector de recortes, el modelo clasifica cada dígito individual de matrículas, códigos postales o números de casa con una latencia de ~1 ms por imagen, adecuada para procesamiento por lotes en CPU.
- Prototipado rápido en visión por computador: sirve como baseline reproducible para comparar técnicas de regularización (BatchNorm, Dropout, aumento de datos) antes de escalar a arquitecturas mayores.
- Docencia e investigación en aprendizaje profundo: el estudio de ablación de 17 experimentos y los checkpoints de cada etapa permiten ilustrar el impacto cuantificado de cada decisión de diseño.
- Verificación de dígitos en formularios escaneados: con la calibración ECE de 0,49 %, se puede fijar un umbral de confianza para derivar a revisión humana los recortes dudosos.
- Sistemas embebidos y edge computing: con 2,2 millones de parámetros y 8,8 MB de checkpoint, cabe en dispositivos con recursos limitados y funciona en CPU sin GPU.
- Clasificación de dígitos en imágenes de street view: útil para tareas de análisis urbano o datasets de señalización donde los recortes sigan la distribución de SVHN.
- Módulo de preprocesado en pipelines de datos: etiquetado automático de recortes de dígitos para construir datasets de entrenamiento mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / experimento | Validación | Test |
|---|---:|---:|
| E1 · MLP | 82,58 % | 80,02 % |
| E3 · CNN estilo LeNet | 89,18 % | 88,42 % |
| E4 · CNN estilo VGG | 92,53 % | 92,70 % |
| E7 · + BatchNorm, Dropout, aumento de datos | 95,74 % | 96,45 % |
| **E16 · misma configuración, más ancha (modelo final)** | **96,07 %** | **97,13 %** |

El resultado de test del modelo final es de 25.285 aciertos sobre 26.032 imágenes (97,13 %) en el split `test` de SVHN cropped digits. No se han publicado resultados comparativos con otros modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 8,8 MB y el modelo tiene 2,2 millones de parámetros.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) es sobredimensionada para esta tarea.
- Cabe en cualquier GPU consumer y en dispositivos de borde con pocos recursos de memoria.
- Opciones de despliegue: PyTorch nativo (carga directa del checkpoint `.pt`); exportación a TorchScript u ONNX no documentada pero viable; no se distribuye en GGUF ni formatos de llama.cpp/Ollama, al no ser un modelo de lenguaje.
- Latencia: aproximadamente 1 ms por imagen en CPU de portátil con un solo hilo, según el autor.
- Throughput: no disponible de forma explícita; a 1 ms por imagen en un hilo, el orden de magnitud es de centenares a miles de imágenes por segundo en CPU multinúcleo, aunque no se ha publicado una medición formal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Accuracy en SVHN test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SVHN (E16, este modelo) | 2,2 M | 32×32×3 píxeles | 97,13 % | MIT (modelo); SVHN no comercial | Hugging Face, PyTorch |
| CNN estilo LeNet (E3 del mismo estudio) | no disponible | 32×32×3 píxeles | 88,42 % | MIT | Incluido en el repo del autor |
| CNN estilo VGG (E4 del mismo estudio) | no disponible | 32×32×3 píxeles | 92,70 % | MIT | Incluido en el repo del autor |
| MLP (E1 del mismo estudio) | no disponible | 32×32×3 píxeles | 80,02 % | MIT | Incluido en el repo del autor |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada; la comparativa se limita a los experimentos del mismo estudio de ablación.

## Limitaciones y advertencias

- Un solo dígito por recorte: el modelo no es un detector y no localiza ni lee números de casa completos.
- Errores más frecuentes: confusiones 8→6, 7→1, 9→0 y 3→9, concentradas en recortes borrosos, de bajo contraste o cuando la etiqueta se refiere a un dígito vecino.
- Dominio restringido: entrenado solo con SVHN; otras tipografías, escritura manual o fotografías muy distintas pueden degradar el rendimiento.
- Semilla única: las diferencias inferiores a ~0,4 puntos porcentuales entre experimentos pueden ser ruido estadístico.
- Licencia del dataset: aunque el modelo y el código son MIT, SVHN (Netzer et al., 2011) es de uso no comercial, por lo que debe revisarse antes de un uso comercial del modelo entrenado.
- Riesgo de alucinación no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de clasificación errónea con alta confianza en imágenes fuera de distribución.
- No soporta texto, código, matemáticas, tool calling ni agentes; cualquier uso fuera de la clasificación de dígitos requiere otro modelo.
- No se han publicado mediciones formales de throughput ni de rendimiento en GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arthursilvadantas/SVHN
- Repositorio GitHub del proyecto: https://github.com/ArthurSilvaDantas/svhn-digits
- Documentación de los 17 experimentos: https://github.com/ArthurSilvaDantas/svhn-digits/blob/main/docs/EXPERIMENTS.md
- Dataset SVHN (página oficial): http://ufldl.stanford.edu/housenumbers/
- Dataset SVHN en Hugging Face: https://huggingface.co/datasets/ufldl-stanford/svhn
- Figura del estudio de ablación: https://raw.githubusercontent.com/ArthurSilvaDantas/svhn-digits/main/figures/ablation.png
