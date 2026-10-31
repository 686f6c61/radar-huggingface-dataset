# miguelciav/vit-base-utkface-gender

## Resumen

`miguelciav/vit-base-utkface-gender` es un clasificador de imágenes para la tarea de clasificación binaria de género a partir de fotografías faciales en entornos no controlados. Es un ajuste fino (*fine-tuning*) completo del modelo base [google/vit-base-patch16-224](https://huggingface.co/google/vit-base-patch16-224), un Vision Transformer (ViT-Base) preentrenado sobre ImageNet-21k, adaptado sobre un subconjunto estratificado de 18.000 imágenes del dataset UTKFace. El modelo ha sido desarrollado por el usuario miguelciav como entrega del Proyecto Final de Redes Neuronales Profundas de la Universidad Central de Venezuela (2026).

El problema que resuelve es la estimación demográfica a partir de rostros, útil en analítica agregada y anónima, interfaces persona-ordenador (HCI) y sistemas de visión computacional. Con unos 85,8 millones de parámetros y una exactitud en prueba del 95,56 % declarada por el autor, es un modelo ligero y accesible para investigadores que necesiten un punto de partida reproducible en clasificación facial, con pesos en safetensors y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, parches 16x16, entrada 224x224) |
| Parametros totales | 85.800.194 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no disponible (modelo de vision, no aplica) |
| Tipos de cuantizacion | no disponible (pesos en FP16/FP32 sin cuantizar) |
| Idiomas soportados | es (etiquetas de model card); salida binaria: Male / Female |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ViT-Base/16 (google/vit-base-patch16-224), un transformer puro de vision que divide la imagen en parches de 16x16 pixeles y los procesa como secuencia con atencion global. La cabeza de salida se sustituye por un clasificador binario (`AutoModelForImageClassification`) con dos clases: `0` (Male) y `1` (Female). El backbone se preentreno sobre ImageNet-21k (14 millones de imagenes) y se ajusto posteriormente sobre ImageNet-1k.

Para el ajuste fino se uso UTKFace ([nu-delta/utkface](https://huggingface.co/datasets/nu-delta/utkface)), un conjunto de fotografias faciales con variaciones pronunciadas de edad, etnia, iluminacion y angulo de pose. Se selecciono un subconjunto fijo y estratificado de 18.000 imagenes con semilla unificada (`30541929`), dividido en 12.600 imagenes de entrenamiento (70 %), 2.700 de validacion (15 %) y 2.700 de prueba (15 %). El preprocesamiento emplea el `AutoImageProcessor` del modelo base, con redimension a 224x224 en RGB y normalizacion estandar de ImageNet (media y desviacion 0,5 por canal). El aumento de datos, aplicado solo en entrenamiento, incluye reflexion horizontal aleatoria (p=0,5), rotacion aleatoria moderada (±10 grados) y fluctuaciones fotometricas de brillo y contraste (ColorJitter ±10 %).

El entrenamiento se realizo en Google Colab sobre una NVIDIA Tesla T4 con precision mixta FP16, durante 3 epocas, con optimizador AdamW, tasa de aprendizaje 2e-5, decaimiento de pesos 0,01 y tamaño de lote 64. La evaluacion se ejecuto por epoca sobre el conjunto de validacion. El autor realizo ademas una comparacion de regimenes de transferencia (baseline desde cero, feature extraction, descongelado parcial y fine-tuning completo), siendo este ultimo el que alcanzo el mejor resultado.

## Capacidades

- Clasificacion binaria de genero a partir de imagenes faciales en entornos no controlados, con salida de probabilidades por clase (`Male` / `Female`).
- Inferencia sencilla mediante el `pipeline` de HuggingFace Transformers (`image-classification`), en dos lineas de codigo.
- Robustez frente a variaciones de iluminacion, pose y edad gracias al dataset de adaptacion y al aumento de datos fotometrico y geometrico.
- Compatibilidad con el ecosistema Transformers de HuggingFace (PyTorch, `AutoImageProcessor`, `AutoModelForImageClassification`).
- No soporta tareas de texto, tool calling, agentes ni capacidades multilingues: es un modelo exclusivamente de vision con dos clases de salida.
- No incluye deteccion ni alineacion de rostros: requiere que la imagen de entrada contenga un rostro (idealmente recortado).

## Casos de uso

- **Analitica demografica agregada y anonima:** el modelo puede estimar la distribucion de genero en conjuntos de imagenes para estudios de HCI o vision computacional, sin identificar individuos, gracias a su salida binaria probabilistica.
- **Sistemas de interaccion persona-ordenador:** integracion en interfaces adaptativas que ajustan su comportamiento segun atributos demograficos estimados, usando el pipeline de Transformers en tiempo casi real.
- **Investigacion y docencia en transfer learning:** el modelo y su metodologia documentada (comparacion de 5 regimenes de entrenamiento con metricas reproducibles y semilla fija) sirven como caso de estudio para cursos de redes neuronales profundas.
- **Preprocesamiento de datasets de rostros:** etiquetado automatico del atributo genero en colecciones fotograficas grandes, como paso previo a la construccion de datasets balanceados.
- **Prototipado rapido de aplicaciones de vision:** su tamaño reducido (0,3 GB) y compatibilidad con GPU de consumo permiten desplegar demos locales sin infraestructura especializada.
- **Linea base (*baseline*) para modelos mas avanzados:** su exactitud del 95,56 % en UTKFace constituye una referencia clara contra la que comparar arquitecturas nuevas o ajustes con tecnicas como LoRA.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por terceros), sobre el subconjunto de prueba de UTKFace (2.700 imagenes):

| Metrica | Valor |
|---|---|
| Test Accuracy | 0,9556 |
| Test F1-Macro | 0,9554 |

Comparacion de regimenes de entrenamiento declarada por el autor (mismas particiones de validacion y prueba):

| Regimen | Parametros entrenables | Val Acc | Test Acc |
|---|---:|---:|---:|
| Baseline desde cero (ViT-Tiny aleatorio) | 5.518.274 | 0,6980 | 0,6932 |
| Base sin adaptar (cabeza aleatoria) | 0 | 0,5020 | 0,5015 |
| Feature extraction (backbone congelado) | 1.538 | 0,9384 | 0,9443 |
| Fine-tuning completo (este modelo) | 85.800.194 | 0,9491 | 0,9556 |
| Descongelado parcial (bloques 10-11 + cabeza) | 14.175.746 | 0,9452 | 0,9504 |

No se han publicado resultados de benchmarks en datasets externos ni comparaciones con otros modelos de clasificacion de genero en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16/FP32, dado que el modelo ocupa aproximadamente 0,3 GB en disco (85,8 millones de parametros). Cabe con holgura en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU de consumo es suficiente para inferencia (RTX 3050 o superior). El entrenamiento se realizo en una NVIDIA Tesla T4 con precision mixta FP16 en unas 7-8 minutos (440 segundos).
- Consumer GPUs: totalmente viable en GPUs de gama media y baja; no requiere A100 ni H100.
- Opciones de despliegue: HuggingFace Transformers (pipeline de `image-classification`), compatible con Inference Endpoints de HuggingFace (el repositorio esta marcado como `endpoints_compatible`). No hay pesos GGUF ni soporte llama.cpp por tratarse de un modelo de vision.
- Latencia y throughput estimados: no disponible. Al ser un ViT-Base a 224x224, se espera inferencia en el orden de milisegundos por imagen en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Dataset | Rendimiento declarado | Licencia |
|---|---:|---|---|---|---|
| miguelciav/vit-base-utkface-gender | 85,8 M | Genero binario facial | UTKFace (18k) | 95,56 % accuracy | Apache 2.0 |
| google/vit-base-patch16-224 (base) | 86 M | Clasificacion ImageNet-1k (1000 clases) | ImageNet-1k | ~81 % top-1 (publicado por Google) | Apache 2.0 |
| Baseline ViT-Tiny desde cero (mismo proyecto) | 5,5 M entrenables | Genero binario facial | UTKFace (18k) | 69,32 % accuracy | no disponible |

No se han publicado comparaciones directas con otros clasificadores de genero facial especificos (por ejemplo, modelos CNN dedicados) en la informacion disponible.

## Limitaciones y advertencias

- **Reduccion binaria del genero:** UTKFace etiqueta el genero de forma estrictamente binaria a partir de apariencia visual superficial. El modelo no representa identidades no binarias ni la identidad de genero autodeterminada, y predice una apariencia fisonomica correlacionada estadisticamente con el dataset, no la identidad personal de ningun individuo.
- **Edades tempranas e infantes:** la model card indica que el modelo presenta limitaciones con rostros de edad temprana (la seccion correspondiente aparece truncada en la informacion disponible; se recomienda consultar la model card completa).
- **Sesgos del dataset:** UTKFace presenta desequilibrios conocidos de etnia y edad; el rendimiento puede variar significativamente entre grupos demograficos. Las metricas agregadas (accuracy y F1-Macro) pueden ocultar disparities por subgrupo.
- **Riesgo de uso indebido:** los sistemas de clasificacion de atributos faciales plantean riesgos de vigilancia, discriminacion y violacion de privacidad. El autor lo destina a analitica agregada y anonima; su uso para identificar o clasificar personas concretas esta desaconsejado.
- **Metricas no verificadas:** los resultados del 95,56 % de accuracy y 0,9554 de F1-Macro son declaraciones del autor, no verificados por terceros ni comparados con publicaciones cientificas.
- **Licencia:** Apache 2.0 permite uso comercial, modificacion y distribucion, sin restricciones significativas mas alla de la atribucion y el aviso de licencia.
- **Entrada requerida:** el modelo no incluye deteccion de rostros; las imagenes deben contener un rostro visible y se recomienda recortarlas previamente para un rendimiento optimo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/miguelciav/vit-base-utkface-gender
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Dataset de adaptacion: https://huggingface.co/datasets/nu-delta/utkface
- Paper del ViT original (Dosovitskiy et al., 2020): https://arxiv.org/abs/2010.11929
- No se han encontrado enlaces adicionales (blog, demo, repositorio de codigo) en la informacion disponible.
