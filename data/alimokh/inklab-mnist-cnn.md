# AliMokh/inklab-mnist-cnn

## Resumen

InkLab MNIST CNN es una red neuronal convolucional de tamano muy reducido (224.714 parametros) entrenada desde cero por el usuario AliMokh para clasificar digitos manuscritos del conjunto de datos MNIST. No reutiliza pesos preentrenados ni APIs de inferencia externas: es un modelo completamente entrenado por el autor, pensado como pieza didactica y como motor de una demo interactiva de dibujo (InkLab) en Hugging Face Spaces.

El modelo resuelve una tarea acotada de clasificacion de imagenes: dada una imagen en escala de grises de 28x28 pixeles con tinta blanca sobre fondo negro, devuelve una distribucion de probabilidad sobre las diez clases de digitos (0-9). Su relevancia no esta en el rendimiento bruto, sino en su papel como ejemplo reproducible de extremo a extremo: arquitectura pequena, entrenamiento documentado, checkpoint en safetensors de menos de 1 MB y artefactos de metricas publicados.

Al tratarse de un modelo de vision para una unica tarea, no dispone de ventana de contexto, no procesa lenguaje natural y no admite instrucciones de texto. La etiqueta de idioma "en" presente en el repositorio corresponde a la documentacion en ingles, no a una capacidad multilingue del modelo. Su licencia MIT permite uso comercial sin restricciones practicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN feed-forward: 3 convoluciones 3x3 (canales 16, 32, 64) con ReLU, 2 max pooling 2x2, clasificador 3.136 -> 64 -> 10 con ReLU y dropout 0,2 |
| Parametros totales | 224.714 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en float32; no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica (clasificacion de imagenes); la model card esta en ingles (etiqueta `en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32, ~0,9 MB) |

Datos adicionales: entrada 1x28x28 en float32 normalizado a [0, 1], tinta blanca sobre fondo negro. Repositorio de ~0,0 GB. Etiquetas del repositorio: pytorch, mnist, computer-vision, education, trained-from-scratch, image-classification.

## Arquitectura y entrenamiento

La red es una CNN clasica de tres capas convolucionales de 3x3 con 16, 32 y 64 canales respectivamente, activaciones ReLU y dos capas de max pooling de 2x2. La salida convolucional se aplana en un vector de 3.136 elementos que alimenta un clasificador de dos capas (3.136 -> 64 -> 10) con ReLU y dropout de 0,2. No hay normalizacion por lotes, conexiones residuales ni mecanismos de atencion.

El entrenamiento se realizo desde cero durante 5 epocas con optimizador AdamW, learning rate 0,001, weight decay 0,0001 y tamano de lote 256. El conjunto oficial de 60.000 imagenes de entrenamiento se dividio aleatoriamente con semilla 42 en 55.000 imagenes de entrenamiento y 5.000 de validacion; el mejor checkpoint se selecciono por precision de validacion y el conjunto de test oficial de 10.000 imagenes se evaluo unicamente despues de esa seleccion. La aumentacion de datos aplicada al entrenamiento incluye rotaciones de aproximadamente +/-10 grados, escalados afines entre 0,9 y 1,1 y traslaciones de hasta 0,08 en coordenadas normalizadas (aproximadamente 1,1 pixeles). No se aplica aumentacion a validacion ni a test. El entrenamiento se ejecuto en Apple MPS, con un tiempo medido de entrenamiento y evaluacion de 23,24 segundos. Los pesos y el codigo se publican bajo licencia MIT.

## Capacidades

- Clasificacion de imagenes: asigna una de diez clases de digito a imagenes de 28x28 en escala de grises, con tinta blanca sobre fondo negro.
- Salida probabilistica: la capa final con softmax devuelve una distribucion sobre las clases, util para inspeccionar la confianza relativa (no calibrada).
- Sensibilidad interpretativa: la demo asociada incluye un mapa de calor de oclusion que mide caidas positivas en la puntuacion de la clase seleccionada al borrar parches de 4x4.
- Entrenamiento reproducible: el repositorio incluye `train.py`, `network.py`, `requirements.txt` y `metrics.json` con perdidas por epoca, metricas y matriz de confusion, lo que permite reentrenar el modelo con semilla fija.
- Ejecucion en CPU: por su tamano (224.714 parametros), la inferencia no requiere GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No procesa texto, audio ni imagenes de color.
- No admite instrucciones, prompts ni modo de razonamiento; la entrada es exclusivamente el tensor de imagen.

## Casos de uso

- Docencia de vision por computador: usar el modelo y su `metrics.json` como ejemplo completo de un pipeline de clasificacion (split train/val, aumentacion, seleccion de checkpoint y evaluacion final en test) en cursos introductorios.
- Estudio de cambio de distribucion: alimentar el modelo con dibujos de canvas de navegador, letras o garabatos para ilustrar empiricamente la caida de precision fuera de la distribucion de MNIST.
- Analisis de sensibilidad e interpretabilidad: aplicar el mapa de oclusion sobre parches 4x4 para discutir que regiones de la imagen influyen en la puntuacion de la clase elegida y por que la oclusion no equivale a causalidad.
- Prototipado de demos interactivas de dibujo: el modelo es lo bastante ligero para integrarse en una demo web o de escritorio que reconozca digitos en tiempo real, junto con un preprocesado propio de recorte, redimensionado y centrado de la tinta.
- Pruebas de calibracion de confianza: al no estar calibradas las salidas softmax, sirve como caso de estudio para experimentar con temperature scaling u otros metodos de calibracion sobre un clasificador de bajo coste.
- Referencia de linea base en experimentos: punto de partida de ~98,89 % de precision en test de MNIST con 224.714 parametros para comparar arquitecturas alternativas o tecnicas de aumentacion en entornos con recursos minimos.
- Pruebas de integracion y CI: validar cargas de safetensors, versiones de PyTorch y rutas de inferencia en CPU con un modelo que entrena en decenas de segundos y cuyo checkpoint ocupa menos de 1 MB.
- Educacion sobre licencias y publicacion de modelos: ejemplo de liberacion completa (codigo, pesos, metricas y atribucion de datos) bajo MIT.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card y en el README. El campo `verified` es `false` en el model-index, es decir, no hay verificacion externa.

| Tarea | Conjunto de datos | Metrica | Valor |
|---|---|---|---|
| Clasificacion de imagenes | MNIST, conjunto de test oficial (10.000 imagenes) | Accuracy | 0,9889 |
| Clasificacion de imagenes | Validacion interna (5.000 imagenes) | Accuracy | 0,9874 |

Contexto adicional reportado por el autor: entrenamiento con 55.000 imagenes durante 5 epocas, semilla 42, 224.714 parametros, checkpoint float32 safetensors de ~0,9 MB, 23,24 segundos de entrenamiento y evaluacion en Apple MPS. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 50 MB en float32 para el modelo, lote y activaciones incluidos; cabe holgadamente en cualquier GPU con 1 GB o mas.
- GPU recomendadas: ninguna en particular. Se ha validado en Apple MPS; cualquier GPU NVIDIA o AMD moderna sirve, y la CPU es suficiente.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en aceleradores integrados. El modelo se ejecuta sin problema en CPU.
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_file` y la clase `InkNet` de `network.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de vision de este tipo; la via natural es un script de inferencia propio o un Hugging Face Space.
- Latencia y throughput estimados: no disponible de forma desglosada. El unico dato temporal publicado es el tiempo conjunto de entrenamiento (5 epocas sobre 55.000 imagenes) y evaluacion, 23,24 segundos en Apple MPS.

## Comparativa con modelos similares

No se ha proporcionado informacion de benchmarks de terceros, por lo que las cifras de rendimiento de las alternativas se marcan como no disponibles.

| Modelo | Parametros | Entrada | Contexto | Accuracy MNIST (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| InkLab MNIST CNN | 224.714 | 1x28x28 gris | no aplica | 0,9889 (declarado por el autor, no verificado) | MIT | Hugging Face, pesos safetensors |
| LeNet-5 (referencia historica) | ~60.000 (referencia de la literatura, no de la informacion proporcionada) | 1x32x32 gris | no aplica | no disponible en la informacion proporcionada | no disponible | multiple, implementaciones diversas |
| CNN generica de 2-3 capas convolucionales | variable | 1x28x28 gris | no aplica | no disponible en la informacion proporcionada | variable segun implementacion | multiple |
| MLP sobre pixeles aplanados | variable | 784 entradas | no aplica | no disponible en la informacion proporcionada | variable segun implementacion | multiple |

La ventaja diferencial de este modelo frente a alternativas genericas no es la precision, sino la trazabilidad: checkpoint unico, script de entrenamiento, metricas publicadas y coste computacional minimo.

## Limitaciones y advertencias

- Alcance cerrado: solo clasifica digitos 0-9. No detecta texto manuscrito completo, no segmenta palabras y no reconoce simbolos aritmeticos ni letras.
- Sin rechazo de entradas fuera de distribucion: letras, garabatos y digitos muy rotados pueden recibir puntuaciones altas y seguras para alguna clase de digito. El modelo no dispone de umbral de rechazo.
- Probabilidades no calibradas: las salidas softmax no deben interpretarse como probabilidades calibradas; una confianza alta no implica una prediccion correcta.
- La precision de MNIST no predice el rendimiento sobre dibujos de canvas: la demo aplica un preprocesado propio (recorte, redimensionado y centrado de la tinta) que no forma parte del benchmark oficial de test.
- Sensibilidad al preprocesado: cambios en el grosor del trazo, la inversion de colores (fondo blanco con tinta negra), el encuadre o la resolucion degradan el rendimiento, ya que el modelo se entreno con tinta blanca sobre fondo negro y 28x28 pixeles.
- Interpretabilidad acotada: el mapa de oclusion mide caidas positivas en la puntuacion de la clase al borrar parches de 4x4; es una visualizacion de sensibilidad basada en intervencion, no una prueba de causalidad ni una explicacion completa del comportamiento de la red.
- Benchmarks no verificados: el resultado de 98,89 % procede del propio autor y el campo `verified` del model-index es `false`.
- Reproducibilidad condicionada: aunque la semilla esta fija, los resultados exactos pueden variar segun el hardware y la implementacion de los kernels de PyTorch.
- Sesgos: no se documentan analisis de sesgo por estilo de escritura, origen o demografia. MNIST es un conjunto historico con patrones de trazado limitados y poco representativos de la escritura contemporanea.
- Licencia: MIT, permisiva y compatible con uso comercial. La atribucion de MNIST corresponde a Yann LeCun, Corinna Cortes y Christopher J. C. Burges, y el conjunto de datos se distribuye tambien bajo MIT segun su ficha.
- Advertencia de uso en produccion: no es adecuado como sistema de reconocimiento de digitos en entornos reales sin un preprocesado especifico, validacion propia y un mecanismo de rechazo de entradas dudosas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AliMokh/inklab-mnist-cnn
- Demo interactiva InkLab (Hugging Face Space): https://huggingface.co/spaces/AliMokh/inklab
- Ficha del conjunto de datos MNIST: https://huggingface.co/datasets/ylecun/mnist
- Archivos del repositorio (pesos, `network.py`, `train.py`, `requirements.txt`, `metrics.json`): https://huggingface.co/AliMokh/inklab-mnist-cnn/tree/main
- Atribucion de datos: Yann LeCun, Corinna Cortes y Christopher J. C. Burges, MNIST
- No se han encontrado en la busqueda web resultados relevantes sobre este modelo; los resultados obtenidos correspondian a contenidos no relacionados con la ficha.
