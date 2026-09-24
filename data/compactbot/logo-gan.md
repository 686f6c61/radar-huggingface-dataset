# Compactbot/logo-gan

## Resumen

logo-gan es una DCGAN (Deep Convolutional GAN) entrenada desde cero por el usuario Compactbot para generar logotipos de empresa en formato RGB de 64×64 píxeles. No es un modelo de lenguaje ni un modelo multimodal: es un generador de imágenes incondicional que toma un vector latente gaussiano de 100 dimensiones y produce un tensor de 3×64×64. El autor lo publica explícitamente como un experimento "toy", reproducible y honesto, no como un modelo de producción.

El interés técnico del artefacto es doble. Por un lado, es un ejemplo completo y verificable de entrenamiento GAN en el que se documentan los fallos: una primera ejecución sin trucos de estabilidad colapsó (discriminador a 0.0000, generador a 13.9) y se descartó, mientras que la variante publicada usa label smoothing (real=0.9, fake=0.1) y penalización de gradiente R1 (λ=10) y mantiene las pérdidas en una banda sana. Por otro, es un caso de estudio de documentación transparente: el autor admite que no puede inspeccionar visualmente las muestras y aporta evidencia cuantitativa de diversidad (entropía de color, desviación típica por canal) en lugar de afirmar calidad visual.

El modelo tiene 8.832.708 parámetros (6.066.179 en el generador y 2.766.529 en el discriminador) y se entrenó con solo 400 logotipos reales a 64×64 procedentes de cuatro datasets públicos de HuggingFace. Con ese volumen de datos y ese tamaño, el modelo aprende las estadísticas globales de un logotipo (fondo claro, marca central de color, restos de formas tipográficas) pero no reproduce ninguna marca concreta. Es relevante ahora como pieza didáctica y como baseline minúsculo (≈35 MB en fp32) para pipelines de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DCGAN estandar (generador con up-convoluciones y BatchNorm; discriminador convolucional con LeakyReLU 0.2) |
| Parametros totales | 8.832.708 (generador 6.066.179 + discriminador 2.766.529). El archivo `model.safetensors` almacena 8.836.427 elementos: parametros mas 3.719 buffers de running-stats de BatchNorm. La ficha de HuggingFace reporta 8.836.420 parametros sobre safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: el modelo no procesa texto ni secuencias. Entrada = vector latente gaussiano de 100 dimensiones |
| Tipos de cuantizacion | no disponible. No se publican versiones cuantizadas; los pesos se distribuyen en precision completa (fp32) |
| Idiomas soportados | no aplica: el modelo no tiene entrada ni salida de texto |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (55 tensores, generador y discriminador en el mismo archivo) mas el script de entrenamiento en PyTorch |

## Arquitectura y entrenamiento

El generador es una DCGAN clasica: una capa `Linear(100 → 512·8·8)` seguida de tres convoluciones de sobremuestreo (512→256→128→64), una convolucion final de 3×3 y salida con `Tanh`, con BatchNorm y ReLU en las capas intermedias. El discriminador aplica cuatro convoluciones de submuestreo (64→128→256→512→1) con LeakyReLU de pendiente 0.2. La entrada generativa es un vector latente de 100 dimensiones con distribucion gaussiana. No hay condicionamiento por texto, etiqueta ni imagen, y no existe encoder: el modelo no "entiende" imagenes, solo las sintetiza.

El entrenamiento uso 400 logotipos reales redimensionados a 64×64, 100 por cada uno de los datasets `samp3209/logo-dataset` (bliptest), `taniya/Logo_mark`, `taniya/Logo_symbol` y `taniya/Logo_type`. Se ejecuto en una NVIDIA RTX 5090 (32 GB) durante unos 5 minutos para 12.000 pasos, con optimizador Adam, learning rate 2e-4 para el generador y 4e-5 para el discriminador, betas (0.5, 0.999) y batch de 128. Se guardo checkpoint y rejilla de muestras cada 2.000 pasos. La innovacion destacable no es arquitectonica sino de estabilizacion: label smoothing (real=0.9, fake=0.1) mas penalizacion de gradiente R1 con λ=10 sobre el discriminador, que evito el colapso de modo observado en la ejecucion vanilla (discriminador → 0.0000, generador → 13.9). Las perdidas finales se estabilizaron en 0.73–0.80 para el discriminador y 1.9–2.4 para el generador. La reproducibilidad esta garantizada con semilla 7 y el script `train_gan_v2.py` incluido en el repositorio.

## Capacidades

- Generacion de imagenes incondicional: produce logotipos sinteticos RGB de 64×64 a partir de un vector latente de 100 dimensiones.
- Muestreo determinista dado un latente fijo: la rejilla `samples_final.png` se genero con 64 latentes fijos, lo que permite reproducir exactamente las mismas imagenes.
- Entrenamiento reproducible de extremo a extremo: el script `train_gan_v2.py` es autocontenido (torch, numpy, pillow) y regenera los pesos publicados con `--steps 12000 --batch 128 --seed 7`.
- Trazabilidad del dataset: `manifest.json` documenta los 400 logotipos de origen (dataset y nombre de archivo).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa ni genera texto.
- No tiene modo "thinking", vision por entrada, audio ni ninguna otra modalidad.
- No admite prompting de ningun tipo (no hay condicionamiento textual ni por clase).

## Casos de uso

- Docencia y divulgacion sobre GANs: es un caso cerrado y reproducible en unos 5 minutos sobre una GPU de gama alta, con curvas de perdida documentadas y una ejecucion fallida (colapso) conservada como contraste, lo que permite explicar en clase el efecto del label smoothing y de la penalizacion R1.
- Pruebas de humo de pipelines de imagen en CI/CD: con ~35 MB de pesos y cero dependencias mas alla de PyTorch, sirve para validar que un pipeline de carga de safetensors, inferencia y postprocesado de imagen funciona antes de conectar modelos de cientos de gigabytes.
- Generacion de placeholders para maquetas de interfaz: al producir manchas de color con estructura de marca a 64×64, es util para rellenar rejillas de tarjetas o avatares en prototipos internos, siempre que no se presenten como logotipos reales.
- Aumento de datos sinteticos para clasificadores de bajo nivel: entrenar un clasificador binario "logo / no logo" o un detector de region central coloreada con muestras del generador y evaluar la mejora con un conjunto real reservado; al ser incondicional, se puede generar cualquier volumen de muestras sin coste de anotacion.
- Estudio comparativo de metodos de estabilizacion de GANs: la pareja de ejecuciones (vanilla colapsada frente a variante estable) permite medir el impacto de label smoothing + R1 en un presupuesto de calculo minimo y con hardware asequible.
- Benchmark de throughput de frameworks de inferencia en CPU y GPU: un generador de 6,07 M de parametros permite medir latencia por imagen y comparar implementaciones (PyTorch eager, TorchScript, ONNX Runtime) sin que el cuello de botella sea la memoria.
- Baseline para experimentos de generacion en regimen de datos escasos: sirve como referencia de lo que se obtiene con 400 imagenes y 8,8 M de parametros, frente a lo que aportan modelos de difusion o StyleGAN2 en el mismo dataset reducido.
- Analisis de sesgos de color y composicion en generacion de marcas: la entropia de color y la desviacion tipica por canal publicadas permiten contrastar la distribucion generada con la real y estudiar si el modelo sobre-representa ciertas paletas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, IS, precision/recall) en la informacion disponible. Las unicas metricas publicadas son de entrenamiento y de estadistica de imagen, y no permiten comparacion limpia con otros generadores:

| Metrica | logo-gan (final) | Datos reales (400 logos) |
|---|---|---|
| Perdida del discriminador | ~0.73–0.80 | no aplica |
| Perdida del generador | ~1.9–2.4 | no aplica |
| Entropia de color | 4.91 bits | 4.23 bits |
| Colores unicos en la rejilla de muestras | 2.979 | 2.805 |
| Desviacion tipica por canal | ~0.29–0.31 | 0.32 |
| FID / IS | no disponible | no aplica |

Como referencia de fallo, la ejecucion descartada sin label smoothing ni penalizacion R1 colapso a discriminador 0.0000 y generador 13.9. El autor advierte que la evidencia de que el modelo funciona es exclusivamente cuantitativa, porque no pudo inspeccionar visualmente las muestras.

## Requisitos de hardware

- VRAM para inferencia: inferior a 100 MB. Los pesos en fp32 ocupan aproximadamente 35,3 MB (8.832.708 parametros × 4 bytes); el resto es activacion y overhead del runtime.
- GPU: cualquier GPU con soporte CUDA, incluidas integradas de gama baja y tarjetas antiguas. El entrenamiento documentado se hizo en una NVIDIA RTX 5090 (32 GB), pero ese requisito es del entrenamiento, no de la inferencia.
- Cabe en GPU de consumo: si, con enorme margen (GTX 1050, RTX 3050, RTX 4090, etc.). Tambien cabe en Raspberry Pi y en CPU.
- Despliegue: PyTorch nativo (carga directa del safetensors con el script del repositorio). No hay pesos GGUF, ONNX ni TorchScript publicados; la exportacion a TorchScript u ONNX tendria que hacerla el usuario. vLLM, llama.cpp, Ollama y TGI no aplican, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible como medicion publicada. Como referencia derivada, el entrenamiento completo de 12.000 pasos con batch 128 en unos 5 minutos implica del orden de 40 pasos/s y ~5.100 imagenes generadas por segundo en la RTX 5090 durante el bucle de entrenamiento, cifra que no debe extrapolarse a un servidor de inferencia.
- Memoria de sistema: despreciable; el repositorio completo ocupa 0,0 GB segun la ficha de HuggingFace.

## Comparativa con modelos similares

La busqueda web no aporto datos tecnicos utilizables (los resultados fueron mayoritariamente irrelevantes; solo se localizo el repositorio LogoNet, que aborda la generacion de logotipos con GANs). No hay cifras de parametros, FID ni licencias de las alternativas en la informacion disponible, por lo que la comparacion es cualitativa.

| Modelo | Arquitectura | Resolucion | Parametros | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| logo-gan (Compactbot) | DCGAN | 64×64 RGB | 8.832.708 (G+D) | ninguno (latente 100 d) | apache-2.0 | pesos safetensors + script de entrenamiento en el Hub |
| DCGAN (Radford et al., 2015) | DCGAN | 64×64 tipicamente | no disponible | ninguno | no disponible | implementaciones multiples en repositorios publicos |
| StyleGAN2-ADA | GAN estilo StyleGAN con aumento adaptativo | 256–1024 px tipicamente | no disponible | latente, sin texto | no disponible | implementacion oficial de NVIDIA |
| LogoNet (aditgupta1) | GAN aplicada a logotipos | no disponible | no disponible | no disponible | no disponible | repositorio en GitHub |

Frente a estas alternativas, logo-gan se distingue por su tamano minimo, su licencia permisiva (apache-2.0) y su reproducibilidad documentada (semilla, script y manifiesto de datos), no por su calidad de muestreo: opera a 64×64, sin condicionamiento y con 400 imagenes de entrenamiento, mientras que StyleGAN2-ADA esta disenada para resoluciones mucho mayores y presupuestos de datos y calculo superiores.

## Limitaciones y advertencias

- No reproduce logotipos reales: con 400 imagenes y 8,8 M de parametros solo captura estadisticas globales (fondo claro, marca central coloreada, restos de tipografia). El propio autor pide tratar `samples_final.png` como "lo que el modelo cree que es un logo", no como activos de marca.
- Verificacion visual no realizada: el autor no pudo inspeccionar las muestras, por lo que la calidad perceptual esta sin confirmar. La evidencia de no-colapso es exclusivamente cuantitativa (perdidas, entropia de color, desviacion tipica por canal).
- Riesgo de colapso de modo: el modelo publicado es la variante estable; sin label smoothing ni R1 el entrenamiento colapso. Cualquier reentrenamiento con otros hiperparametros debe vigilar las perdidas.
- Sesgo de los datos de origen: los 400 logotipos provienen de cuatro datasets publicos de HuggingFace y su composicion cultural, sectorial y cromatica condiciona la distribucion generada. La entropia de color del modelo (4.91 bits) es ligeramente superior a la real (4.23), lo que sugiere una paleta mas dispersa que la observada en los datos.
- Riesgo de similitud con marcas existentes: al entrenar sobre logotipos reales, algunas muestras pueden recordar a marcas registradas. No deben usarse como identificadores comerciales ni presentarse como logos de una organizacion.
- Resolucion limitada: 64×64 RGB. No hay version de mayor resolucion ni etapa de superresolucion.
- Sin condicionamiento: no se puede pedir un logo de un color, sector o estilo concreto. La unica forma de influir en la salida es manipular el vector latente o interpolar entre latentes.
- Incluye el discriminador: el safetensors contiene generador y discriminador (55 tensores). Para inferencia hay que cargar solo las claves del generador, lo que anade un paso de filtrado.
- Licencia: apache-2.0 permite uso comercial de los pesos, pero la licencia del modelo no cubre los derechos sobre las imagenes de entrenamiento ni sobre las marcas que estas representan; esa responsabilidad recae en quien despliegue el modelo.
- Datos ausentes en la ficha: no hay informacion sobre tipo de cuantizacion, idiomas (no aplica), metricas FID/IS ni evaluacion humana.
- Nomenclatura enganosa: a pesar del tag `image-generation`, no es un modelo de difusion ni un generador texto-a-imagen; no entiende prompts.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Compactbot/logo-gan
- Peticion original que motivo el entrenamiento: https://huggingface.co/spaces/Compactbot/model-requests/discussions/1
- Repositorio LogoNet (generacion de logotipos con GANs, localizado en la busqueda web): https://github.com/aditgupta1/LogoNet
- Dataset de origen citado en el manifiesto: `samp3209/logo-dataset` (bliptest), `taniya/Logo_mark`, `taniya/Logo_symbol`, `taniya/Logo_type` en HuggingFace
- Paper de referencia de la arquitectura DCGAN: Radford, Metz y Chintala, "Unsupervised Representation Learning with Deep Convolutional Generative Adversarial Networks" (arXiv:1511.06434); no aparecia en los resultados de busqueda proporcionados
