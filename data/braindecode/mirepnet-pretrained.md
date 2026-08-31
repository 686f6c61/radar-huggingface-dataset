# braindecode/mirepnet-pretrained

## Resumen

MIRepNet es un modelo fundacional de EEG diseñado específicamente para la clasificación de imágenes motoras (motor imagery, MI), desarrollado por Liu et al. y publicado en 2026 en *Knowledge-Based Systems*. Se trata del primer modelo de este tipo orientado exclusivamente al paradigma MI, e integra un pipeline de preprocesamiento basado en conocimientos neurofisiológicos, incluyendo una plantilla de canales adaptable a configuraciones arbitrarias de electrodos. El modelo emplea una arquitectura Transformer con 6 bloques y 8 cabezas de atención, genera embeddings de 256 dimensiones y procesa 45 canales de EEG a 250 Hz con ventanas de 1000 muestras. Con 5,14 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto. Su relevancia radica en ofrecer una representación preentrenada reutilizable para tareas de decodificación de EEG, reduciendo la necesidad de grandes conjuntos de datos etiquetados en cada aplicación concreta.

El checkpoint oficial ha sido reempaquetado en formato Braindecode, lo que permite cargarlo directamente mediante la integración estándar de Hugging Face de esta librería. El modelo se distribuye bajo licencia MIT y está disponible en safetensors. Aunque el preentrenamiento original incluye una cabeza supervisada de tres salidas, la model card advierte que el orden semántico de dichas salidas no está documentado, por lo que se recomienda sustituirla y ajustar el modelo para cada tarea específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder) con 6 bloques y 8 cabezas de atencion |
| Parametros totales | 5.143.299 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de EEG: 1000 muestras a 250 Hz, 45 canales) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no aplica (procesa senales EEG, no texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MIRepNet se basa en un codificador Transformer con 6 bloques y 8 cabezas de atencion, que procesa una entrada de 45 canales EEG con 1000 muestras a 250 Hz. El modelo genera un embedding de 256 dimensiones por ventana. El preentrenamiento es supervisado, con una cabeza de clasificacion de tres salidas, aunque la model card no especifica la naturaleza exacta de las etiquetas ni el conjunto de datos utilizado. El pipeline de preprocesamiento incluye filtrado de 8-30 Hz, remuestreo, preparacion de plantilla de canales y alineacion euclidiana, pasos que no estan integrados en el modelo y deben aplicarse externamente. El checkpoint oficial fue convertido desde el repositorio original, omitiendo los tensores exclusivos del preentrenamiento (como `mask_token` y `decoder.*`), y la conversion se verifico con un error maximo absoluto de 2.38e-7 en features agrupadas y 1.19e-7 en logits.

## Capacidades

- Clasificacion de imagenes motoras (MI) a partir de senales EEG, con soporte para configuraciones de canales arbitrarias gracias a la plantilla neurofisiologica.
- Generacion de representaciones (embeddings) de EEG de 256 dimensiones, utiles para transfer learning y fine-tuning en otras tareas.
- Fine-tuning para tareas de decodificacion de EEG con distinto numero de clases, reemplazando la cabeza de salida (ejemplo: `n_outputs=4`).
- Integracion nativa con Braindecode, permitiendo cargar el modelo con `MIRepNet.from_pretrained`.
- No soporta tool calling, agentes, vision ni audio; es exclusivamente para senales EEG.

## Casos de uso

- Interfaces cerebro-computadora (BCI) para control de dispositivos: el modelo puede clasificar imagenes motoras en tiempo real, permitiendo a usuarios con discapacidad motora controlar cursores, sillas de ruedas o brazos roboticos mediante la actividad cerebral.
- Rehabilitacion neurologica: seguimiento de la actividad cerebral durante ejercicios de imagenes motoras en pacientes con accidente cerebrovascular, facilitando la evaluacion objetiva del progreso terapeutico.
- Investigacion en neurociencia cognitiva: extraccion de representaciones de EEG para estudiar los correlatos neuronales de la imaginacion motora, comparando patrones entre sujetos o condiciones experimentales.
- Fine-tuning para clasificacion de otros paradigmas EEG (por ejemplo, P300, steady-state visual evoked potentials) aprovechando el preentrenamiento en MI, reduciendo la cantidad de datos etiquetados necesarios.
- Desarrollo de sistemas de neurofeedback: el modelo puede integrarse en aplicaciones que entrenan a usuarios para modular su actividad cerebral, proporcionando retroalimentacion en tiempo real basada en la clasificacion de MI.
- Benchmarking de algoritmos de decodificacion EEG: al ser un modelo fundacional ligero, sirve como punto de referencia para evaluar nuevas arquitecturas o tecnicas de preprocesamiento en tareas de MI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo original (Liu et al., 2026) reporta metricas de rendimiento, pero no se incluyen en la model card ni en los materiales proporcionados. Se recomienda consultar el paper en ScienceDirect o el preprint en arXiv para obtener datos cuantitativos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 5,14 millones de parametros, la inferencia requiere menos de 1 GB de VRAM en precision FP32. Con cuantizacion (no publicada) podria reducirse aun mas.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; tambien puede ejecutarse en CPU sin problemas de latencia significativa para inferencia por lotes pequenos.
- Compatibilidad con GPUs de consumo: si, cabe en cualquier GPU consumer (RTX 2060, GTX 1660, etc.) e incluso en sistemas sin GPU.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, FastAPI, o integrarse en pipelines de Braindecode. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales, pero dado el tamano del modelo, la inferencia en CPU deberia ser del orden de milisegundos por ventana de 1000 muestras.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (modelos fundacionales de EEG para MI). MIRepNet se presenta como el primer modelo fundacional especifico para imagenes motoras, por lo que no existen alternativas directas publicadas. Otros modelos de EEG como EEGNet o Deep4 son arquitecturas clasificadoras sin preentrenamiento fundacional, por lo que no son directamente comparables en terminos de transferencia y generalizacion.

## Limitaciones y advertencias

- La model card advierte que el orden semantico de las tres salidas de la cabeza de preentrenamiento no esta documentado; es imprescindible reemplazar dicha cabeza y ajustar el modelo para cualquier tarea concreta.
- El modelo no incluye el preprocesamiento (filtrado, remuestreo, alineacion euclidiana) en su forward pass; debe aplicarse externamente siguiendo el pipeline del paper.
- No se especifican los datos de entrenamiento ni su composicion, por lo que no se pueden evaluar posibles sesgos en la representacion.
- La licencia MIT cubre el checkpoint y el codigo, pero las licencias de los conjuntos de datos utilizados para el preentrenamiento son independientes y deben verificarse por separado.
- Al ser un modelo de EEG, su rendimiento depende criticamente de la calidad de la senal y de la configuracion de canales; la plantilla de canales debe adaptarse correctamente a cada dispositivo.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que se desconoce su rendimiento cuantitativo frente a otros metodos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/braindecode/mirepnet-pretrained
- Articulo en ScienceDirect: https://www.sciencedirect.com/science/article/pii/S0950705126006921
- Preprint en arXiv: https://arxiv.org/abs/2507.20254
- Repositorio oficial en GitHub: https://github.com/staraink/MIRepNet
- Repositorio de Braindecode: https://github.com/braindecode/braindecode
- Documentacion de Braindecode: https://braindecode.org/stable/index.html
