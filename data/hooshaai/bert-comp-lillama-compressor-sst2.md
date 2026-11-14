# Hooshaai/bert-comp-lillama-compressor-sst2

## Resumen

`Hooshaai/bert-comp-lillama-compressor-sst2` es un checkpoint experimental de BERT-Base (`google-bert/bert-base-uncased`, 109,48 M de parametros, 12 capas, dimension oculta 768) comprimido fisicamente mediante el motor `lillama_compressor` (`LiLLaMADistiller`) de la libreria NeuralOps y posteriormente "curado" con LoRA. El modelo resultante conserva 29.859.842 parametros, lo que supone una reduccion del 72,73 % y una tasa de compresion fisica de 3,667x respecto al modelo original. Esta especializado en clasificacion de sentimiento binaria sobre GLUE SST-2 y publicado por el usuario Hooshaai bajo licencia MIT.

El interes del artefacto es fundamentalmente metodologico: sirve como demostracion reproducible de una tecnica de compresion basada en destilacion local mediante SVD de la matriz de covarianza cruzada de activaciones, combinada con un proceso de recuperacion LoRA de bajo rango (r=8, 50 pasos, lr=2e-4, presupuesto de 45 s). El autor documenta una evaluacion Pareto multi-rango (k=256, 128, 64, 32) sobre la particion de validacion de SST-2 (872 muestras) ejecutada en una RTX 3090.

La relevancia practica es limitada: el modelo comprimido alcanza un 71,79 % de accuracy en SST-2 frente al 91,63 % del profesor original, es decir, una perdida de paridad de 19,84 puntos. Se trata, por tanto, de un artefacto de investigacion para estudiar el compromiso entre ratio de compresion y calidad, no de un clasificador listo para produccion. El repositorio ocupa 0,1 GB y acumula 42 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, D=768), comprimido con `LiLLaMADistiller` (`lillama_compressor`) y curado con LoRA r=8 |
| Parametros totales | 29.859.842 (modelo comprimido); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base BERT-Base admite 512 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | No disponible; el artefacto se distribuye en `pytorch_model.bin` (float32 por defecto de PyTorch) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); assets de tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo parte de BERT-Base uncased, un transformer encoder de 12 capas y 768 dimensiones ocultas preentrenado por Google. Sobre esa base, el autor aplico un ajuste fino para clasificacion de sentimiento binaria en GLUE SST-2 y, posteriormente, el compresor `lillama_compressor` (clase `LiLLaMADistiller`, familia `experimental`), que realiza destilacion local mediante SVD de la covarianza cruzada de activaciones (LiLLaMA: Local Distillation via Activation Cross-Covariance SVD). La compresion es fisica: reduce el numero de parametros del state dict, no solo la precision numerica.

El pipeline de NeuralOps aplica un proceso de "healing" con LoRA cuando la compresion zero-shot degrada la accuracy mas de 2,0 puntos porcentuales con una reduccion superior a 1,10x. En el rango seleccionado (k=32) la accuracy zero-shot cae al 49,20 % (practicamente azar en una tarea binaria) y el ajuste LoRA de r=8 durante 50 pasos con lr=2e-4 la recupera hasta el 71,79 %. El autor no documenta el volumen de tokens de preentrenamiento (heredado de BERT-Base) ni detalles sobre RLHF/DPO, que no aplican a un encoder de clasificacion. La evaluacion Pareto se realizo sobre las 872 muestras de validacion de SST-2 en una NVIDIA GeForce RTX 3090 de 24 GB.

## Capacidades

- Clasificacion de sentimiento binaria (negativo/positivo) en ingles sobre texto tipo SST-2.
- Inferencia de texto corto a nivel de frase, heredada del preentrenamiento de BERT-Base uncased.
- No soporta tool calling ni function calling: es un cabezal de clasificacion (`BertForSequenceClassification`, `num_labels=2`).
- No soporta agentes ni razonamiento multi-paso; no genera texto.
- Capacidades multilingues inexistentes: solo ingles (vocabulario uncased de BERT-Base).
- No dispone de modo "thinking", vision ni audio.
- El checkpoint incluye los adaptadores LoRA de recuperacion ya integrados en el state dict, por lo que la inferencia no requiere cargar adaptadores por separado, pero si reconstruir la topologia comprimida con `compress_model` antes de cargar los pesos.

## Casos de uso

- Investigacion sobre compresion de modelos: reproducir el pipeline `lillama_compressor` con distintos rangos (k=256, 128, 64, 32) para estudiar la curva Pareto entre ratio de compresion y accuracy en tareas de clasificacion.
- Docencia y formacion: ilustrar en un curso de eficiencia de modelos como un checkpoint de 109 M de parametros puede reducirse a 29,86 M y que coste de calidad implica, con telemetria completa en `compression_summary.json`.
- Baseline experimental para tecnicas de destilacion: comparar el SVD de covarianza cruzada de activaciones frente a otras tecnicas de poda o cuantizacion sobre el mismo modelo base y dataset.
- Prototipado de clasificadores de bajo coste: desplegar un clasificador de sentimiento en entornos con restricciones severas de memoria (29,86 M de parametros, ~57,1 MB de pesos) aceptando la perdida de accuracy documentada.
- Validacion de pipelines de recuperacion LoRA: el artefacto incluye el historial de healing (r=8, 50 pasos, lr=2e-4), lo que permite reproducir y ajustar el proceso de recuperacion.
- Pruebas de integracion de la libreria NeuralOps: servir como caso de prueba end-to-end del API `neuralops.hub.load_surgeried_model` y de `compress_model`, verificando la reconstruccion de topologias comprimidas.
- Analisis de robustez de checkpoints comprimidos: evaluar el comportamiento del modelo en dominios distintos de SST-2 para medir cuanto de la accuracy recuperada depende del ajuste especifico al dataset.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index). Evaluacion sobre la particion de validacion de GLUE SST-2 (872 muestras) en una RTX 3090.

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy curada (LoRA) | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8 %) | 71,22 % | 50,92 % | -40,71 % |
| 128 | 2,39x | 45.792.002 (-58,2 %) | 53,33 % | 68,92 % | -22,71 % |
| 64 | 3,11x | 35.170.562 (-67,9 %) | 49,08 % | 54,47 % | -37,16 % |
| **32 (checkpoint publicado)** | **3,67x** | **29.859.842 (-72,7 %)** | **49,20 %** | **71,79 %** | **-19,84 %** |

El profesor original (`bert-base-uncased` ajustado en SST-2) alcanza un 91,63 % de accuracy segun la propia model card. El resultado de 71,79 % del checkpoint publicado es el declarado en el model-index como "GLUE SST-2 Validation Accuracy".

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 29,86 M de parametros del checkpoint comprimido (mas el overhead de activaciones y tokenizer); el modelo base sin comprimir requeriria aproximadamente 0,44 GB solo en pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor realizo la evaluacion en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo esta muy por debajo de ese presupuesto.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: no hay integracion directa documentada con vLLM, llama.cpp, Ollama o TGI. El flujo oficial requiere la libreria NeuralOps (`compress_model` + `load_surgeried_model`) y PyTorch/Transformers. Al ser un state dict de PyTorch, es exportable a otros runners previa reconstruccion de la topologia comprimida.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor solo documenta el presupuesto de 45 s para el proceso de healing LoRA, no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-comp-lillama-compressor-sst2` (k=32) | 29,86 M (comprimido) | No disponible | 71,79 % | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` (profesor ajustado en SST-2) | 109,48 M | 512 tokens | 91,63 % (declarado por el autor) | Apache 2.0 | Hugging Face, Transformers |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 tokens | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, Transformers |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, Transformers |

La comparativa con alternativas de la misma categoria (clasificadores de sentimiento sobre SST-2) queda incompleta porque la informacion proporcionada no incluye resultados de benchmarks de esos modelos. El dato diferencial del checkpoint es la reduccion fisica de parametros (3,667x) a costa de 19,84 puntos de accuracy frente al profesor.

## Limitaciones y advertencias

- Perdida de accuracy severa: 71,79 % frente al 91,63 % del profesor, una paridad negativa de 19,84 puntos. En una tarea binaria, el azar se situa en el 50 %, por lo que el margen util es de solo 21,79 puntos.
- Inestabilidad del pipeline de compresion: los resultados curados no son monotonos respecto al rango. k=256 curado (50,92 %) rinde peor que k=32 curado (71,79 %), lo que sugiere alta varianza en el proceso de healing LoRA y dificulta la reproducibilidad.
- Modelo experimental: la propia model card lo etiqueta como `experimental` dentro de la familia `LiLLaMADistiller`; no hay evidencia de validacion en produccion.
- Solo ingles: el vocabulario uncased de BERT-Base limita el uso a texto en ingles.
- Riesgo de sesgo: hereda los sesgos de `bert-base-uncased` en el preentrenamiento; el autor no documenta analisis de sesgo ni de robustez fuera de SST-2.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de clasificaciones erroneas en dominios distintos del de entrenamiento (SST-2 son frases cortas de resenas de cine).
- Dependencia de la libreria NeuralOps: la carga requiere `compress_model` para reconstruir la topologia antes de aplicar el state dict, lo que anade una dependencia externa y un paso de configuracion adicional frente a un `from_pretrained` estandar.
- Licencia MIT permite uso comercial, pero la calidad del checkpoint hace desaconsejable su uso en produccion sin una evaluacion previa en el dominio objetivo.
- El model-index marca el resultado como `verified: false`; los numeros provienen del propio autor y no han sido replicados de forma independiente.
- El codigo de ejemplo de la model card referencia el repositorio `tahamajs/bert-comp-lillama-compressor-sst2`, distinto del ID `Hooshaai/bert-comp-lillama-compressor-sst2` de este repositorio, lo que puede provocar errores al copiar el snippet tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-lillama-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Implementacion del compresor `lillama_compressor`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/experimental/lillama_compressor.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
