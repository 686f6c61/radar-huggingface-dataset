# razz-123/colorist_densenet121_octmnist_s71397589-14

## Resumen

`razz-123/colorist_densenet121_octmnist_s71397589-14` es un checkpoint de clasificacion de imagenes medicas: un DenseNet121 entrenado desde cero sobre el dataset OCTMNIST (imagenes de tomografia de coherencia optica retiniana) con la aumentacion *Colorist* activada. Colorist es una tecnica de aumentacion sin parametros que iguala los dos primeros momentos estadisticos de cada canal de color a los de una imagen de estilo aleatoria, aplicando un mapa afin por pixel que preserva la estructura anatomica. El modelo forma parte del zoo de checkpoints que acompanan al articulo "Simple, Safe, and Overlooked: Reclaiming Sustainable Domain Generalization with Statistical Color Matching" (MICCAI DEMI 2026, arXiv:2608.18915), desarrollado por Sebastian Doerrich y colaboradores en xAILab Bamberg (Universidad de Bamberg).

El interes practico del checkpoint es acotado y muy especifico: sirve como artefacto reproducible para estudiar generalizacion de dominio en imagen medica mediante transferencia de color, no como un clasificador clinico listo para produccion. Con 7.041.604 parametros y una entrada fija de 224x224 RGB, es un modelo pequeno que cabe en cualquier GPU consumer, pero su valor esta en el protocolo experimental (tres semillas, 19 benchmarks) mas que en el rendimiento absoluto de esta semilla concreta.

Esta ficha cubre la semilla 71397589, que obtiene una balanced accuracy de test de 0.8670 en OCTMNIST, por debajo de la media de las tres semillas publicadas (0.8947) y ligeramente por debajo del mismo DenseNet121 entrenado sin aumentacion (0.8863). El autor advierte explicitamente de que esta semilla no debe leerse de forma aislada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet121 (implementacion `timm`), CNN con conexiones densas |
| Parametros totales | 7.041.604 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, entrada fija de 224x224 RGB) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 4 (multiclase) |
| Entrada | 224 x 224 RGB |
| Dataset de entrenamiento | OCTMNIST |
| Semilla | 71397589 |
| Libreria | `colorist-aug` (extra `[weights]`) |

## Arquitectura y entrenamiento

El modelo es un DenseNet121 estandar de `timm` entrenado desde cero sobre OCTMNIST, sin inicializacion ImageNet. La innovacion no reside en la arquitectura sino en el pipeline de aumentacion: durante el entrenamiento se aplica Colorist con probabilidad 0.3, un mapa afin por pixel que transfiere la media y la desviacion estandar de cada canal de color desde una imagen de estilo muestreada aleatoriamente. Al ser una transformacion puramente fotometrica, no altera la geometria ni la resolucion de la imagen, lo que la hace especialmente adecuada para imagen medica donde la estructura anatomica es la senal relevante y las variaciones de color entre escaneres o centros son el factor de confusion dominante.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de RLHF o DPO (no aplicables en un clasificador de vision). La model card indica que los pesos heredan la licencia del codigo (MIT) y que los datos de entrenamiento (OCTMNIST) conservan su propia licencia y no se redistribuyen en el repositorio.

## Capacidades

- Clasificacion de imagenes de OCT retiniano en 4 clases multiclase.
- Generalizacion ante cambios fotometricos (variaciones de color, iluminacion y balance de blancos entre dominios), gracias al entrenamiento con Colorist.
- Inferencia sobre imagenes de 224x224 RGB con la normalizacion especifica definida en `config.json` (no estadisticas de ImageNet).
- Carga directa mediante la API `load_pretrained_classifier("octmnist", seed=71397589)` del paquete `colorist-aug`.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de texto.
- No dispone de modo thinking, vision general, audio ni capacidades multimodales mas alla de la clasificacion de imagen.

## Casos de uso

- Investigacion en generalizacion de dominio: usar el checkpoint como linea base reproducible para comparar tecnicas de aumentacion fotometrica frente a Colorist en OCTMNIST, con la semilla documentada.
- Reproduccion de resultados del articulo: cargar el modelo con la API de `colorist-aug` y verificar la balanced accuracy de 0.8670 reportada para esta semilla.
- Estudio de sensibilidad a semilla: entrenar y comparar las tres semillas publicadas (0.8670, 0.8940, 0.9230) para cuantificar la varianza del protocolo en benchmarks de covariate shift.
- Prototipado de pipelines de clasificacion retiniana: servir como componente de clasificacion en un prototipo de investigacion que procese imagenes OCT de 224x224, siempre fuera de ambito clinico.
- Docencia y formacion: ejemplo minimo (7M parametros) para ilustrar aumentacion sin parametros, transferencia de color y evaluacion con balanced accuracy en un curso de vision medica.
- Evaluacion de tecnicas de ensamblado: el modelo sirve para estudiar por que la media de pesos entre semillas colapsa (el autor reporta 0.1250, equivalente a azar en 8 clases en BloodMNIST), un caso practico de por que no promediar checkpoints entrenados desde cero con inicializaciones distintas.

## Benchmarks y rendimiento

Resultados de balanced accuracy de test en OCTMNIST reportados en la model card:

| Modelo / semilla | Balanced accuracy (test) |
|---|---|
| DenseNet121 + Colorist, semilla 71397589 (este checkpoint) | 0.8670 |
| DenseNet121 + Colorist, semilla 133560673 | 0.8940 |
| DenseNet121 + Colorist, semilla 265017005 | 0.9230 |
| Media de las tres semillas (sd 0.0280) | 0.8947 |
| DenseNet121 sin aumentacion | 0.8863 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) para este modelo, ni comparativas con arquitecturas alternativas en OCTMNIST.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 30-50 MB para los pesos (7M parametros), mas el coste de activaciones para lotes de 224x224; en la practica, menos de 1 GB en cualquier GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100. No requiere GPU de datacenter.
- Cabe en GPU consumer y en CPU: la inferencia en CPU es viable para lotes pequenos dado el reducido tamano del modelo.
- Opciones de despliegue: PyTorch nativo y el paquete `colorist-aug` con el extra `[weights]`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Balanced accuracy OCTMNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Colorist, semilla 71397589) | 7.041.604 | 224x224 RGB | 0.8670 | MIT | Hugging Face |
| DenseNet121 sin aumentacion (referencia del articulo) | mismo orden (~7M) | 224x224 RGB | 0.8863 | no disponible | solo resultado reportado |
| Colorist, semilla 133560673 | 7.041.604 | 224x224 RGB | 0.8940 | MIT | Hugging Face (`sdoerrich97/...`) |
| Colorist, semilla 265017005 | 7.041.604 | 224x224 RGB | 0.9230 | MIT | Hugging Face (`sdoerrich97/...`) |

No se dispone de datos comparativos con otras arquitecturas (ResNet, ViT, EfficientNet) sobre OCTMNIST en la informacion proporcionada.

## Limitaciones y advertencias

- Solo aborda cambio fotometrico: la transformacion es un mapa afin por pixel y no corrige cambios geometricos ni de resolucion.
- Artefacto de investigacion: no validado para uso clinico ni para diagnostico.
- Esta semilla concreta rinde por debajo de la media de las tres (0.8670 frente a 0.8947) y por debajo del baseline sin aumentacion (0.8863); no debe interpretarse como evidencia aislada del metodo.
- No promediar los pesos de las tres semillas: entrenadas desde cero con inicializaciones distintas, la media de pesos colapsa a azar (0.1250 en BloodMNIST frente a 0.9844-0.9918 individuales).
- Riesgo de alucinacion no aplicable en el sentido de modelos generativos, pero si existe riesgo de falsos positivos y negativos en la clasificacion; no se documentan curvas ROC ni calibracion.
- Sesgos conocidos: no documentados en la informacion disponible; el dataset OCTMNIST puede arrastrar sesgos de adquisicion de los centros de origen.
- La licencia MIT cubre los pesos, pero los datos de entrenamiento (OCTMNIST) tienen su propia licencia y no se redistribuyen; verificar terminos antes de uso comercial.
- El repositorio figura con 0 descargas y 0 likes, y la libreria `colorist-aug` es un paquete especifico del proyecto: la adopcion externa es practicamente nula.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/razz-123/colorist_densenet121_octmnist_s71397589-14
- Hugging Face (checkpoint original del autor): https://huggingface.co/sdoerrich97/colorist_densenet121_octmnist_s71397589
- Coleccion Colorist (57 checkpoints): https://huggingface.co/collections/sdoerrich97/colorist
- Paper (arXiv:2608.18915): https://arxiv.org/abs/2608.18915
- Codigo: https://github.com/sdoerrich97/colorist
- Paquete PyPI: https://pypi.org/project/colorist-aug/
