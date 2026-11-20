# ngaggion/ChronoRoot2-MultiPlant

## Resumen

ChronoRoot2-MultiPlant es un modelo de segmentación de imágenes basado en nnU-Net v2, desarrollado por Nicolás Gaggion y colaboradores en el marco del proyecto ChronoRoot 2.0, una plataforma abierta de fenotipado vegetal temporal en 2D. El modelo resuelve la segmentación multiclase de raíces y partes aéreas en imágenes de Arabidopsis, tomate y Medicago, lo que permite automatizar la extracción de rasgos fenotípicos en experimentos de biología vegetal.

Se distribuye como un checkpoint estándar de nnU-Net (`fold_0/checkpoint_final.pth`) con licencia MIT, lo que facilita su integración en pipelines existentes de la librería `nnunet`. Aunque se entrenó con la técnica SCNP (Same Class Neighbor Penalization), esta solo interviene durante el entrenamiento, por lo que el modelo publicado es un nnU-Net convencional y no requiere dependencias adicionales para inferencia.

Es relevante ahora porque acompaña a la publicación de ChronoRoot 2.0 en GigaScience y a un artículo de SCNP en CVPR 2026, y porque unifica en un único modelo la segmentación de tres especies vegetales, sustituyendo aproximaciones previas limitadas a Arabidopsis. La clase "petiole" se ha fusionado en la clase aérea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net v2 (U-Net adaptativa, segmentación semántica 2D) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (checkpoint nnU-Net) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura nnU-Net v2, un framework de segmentación que autoconfigura la topología de la U-Net, el preprocesado y el esquema de entrenamiento según el dataset. Se trata de un modelo de segmentación multiclase entrenado sobre imágenes de Arabidopsis, tomate y Medicago, con la clase petiole fusionada en la clase aérea.

El entrenamiento incorpora SCNP (Same Class Neighbor Penalization), una función de pérdida propuesta por Valverde, Papadopoulos, Larsen y Dahl en CVPR 2026 que penaliza la predicción incorrecta de píxeles vecinos de la misma clase, con el objetivo de mejorar la precisión topológica de la segmentación. SCNP se usa únicamente durante el entrenamiento; el checkpoint publicado es un nnU-Net estándar. Parte de las imágenes de Medicago empleadas en el entrenamiento se publicarán próximamente. No se dispone de datos sobre el número de imágenes, épocas o composición exacta del dataset en la información proporcionada.

## Capacidades

- Segmentación semántica multiclase de imágenes de raíces y partes aéreas de plantas.
- Cobertura de tres especies: Arabidopsis, tomate y Medicago en un único modelo.
- Fusión de la clase petiole en la clase aérea para simplificar el etiquetado.
- Procesamiento de imágenes 2D, apto para secuencias temporales (vídeos muestreados por hora) en el contexto de ChronoRoot 2.0.
- Integración directa con la librería `nnunet` y carga del checkpoint `fold_0/checkpoint_final.pth`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Fenotipado automatizado de raíces: el modelo segmenta raíces en imágenes de placas de crecimiento, permitiendo medir longitud, ramificación y arquitectura radicular de forma masiva en experimentos de Arabidopsis, tomate y Medicago.
- Análisis temporal de crecimiento: combinado con los vídeos muestreados cada hora del dataset UnsupervisedRootVideos, permite extraer trayectorias de crecimiento y cuantificar la dinámica de elongación radicular.
- Estudios de genética vegetal: al soportar tres especies, facilita comparaciones fenotípicas entre mutantes o líneas de Arabidopsis, tomate y Medicago en un mismo pipeline.
- Segmentación de partes aéreas: la fusión de petiole en la clase aérea simplifica la cuantificación de biomasa aérea y la delimitación de tejidos en imágenes de plántulas.
- Integración en plataformas de imagen de alto rendimiento: al ser un nnU-Net estándar, se puede desplegar en pipelines existentes de segmentación biológica sin reentrenamiento.
- Reproducibilidad de experimentos: el checkpoint público y la licencia MIT permiten replicar los análisis de ChronoRoot 2.0 en laboratorios de biología vegetal.
- Anotación asistida: el modelo puede generar máscaras preliminares para acelerar el etiquetado manual en nuevos datasets de plantas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 0,8 GB, lo que sugiere un modelo de tamaño moderado apto para GPU de consumo.
- GPU recomendadas: no disponible; por tratarse de un nnU-Net 2D, es habitual su ejecución en GPU de gama media, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probable dada la naturaleza 2D del modelo y el tamaño del checkpoint, aunque no se confirma en la información disponible.
- Opciones de despliegue: librería `nnunet` con carga del checkpoint `fold_0/checkpoint_final.pth`; no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Especies | Licencia | Contexto/entrada |
|---|---|---|---|---|
| ChronoRoot2-MultiPlant | nnU-Net v2 | Arabidopsis, tomate, Medicago | MIT | Imágenes 2D |
| ChronoRoot2-Arabidopsis | nnU-Net v2 | Arabidopsis | MIT (según repositorio del autor) | Imágenes 2D |
| Modelos previos de segmentación radicular (no especificados) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre ChronoRoot2-MultiPlant y alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de dominio: solo segmenta imágenes de plantas de las especies entrenadas (Arabidopsis, tomate, Medicago); no es un modelo general de segmentación.
- Riesgo de degradación fuera de distribución: imágenes con iluminación, fondo o condiciones de crecimiento distintas a las del dataset de entrenamiento pueden producir segmentaciones erróneas.
- Clase petiole fusionada: la fusión en la clase aérea impide distinguir peciolos de forma individual, lo que limita análisis morfológicos finos.
- Dataset de Medicago incompleto: parte de las imágenes de Medicago usadas en el entrenamiento se publicarán más adelante, lo que puede afectar a la reproducibilidad exacta del entrenamiento.
- Sin datos de sesgo o robustez publicados: no se documentan análisis de sesgos ni evaluación de robustez en la información disponible.
- Licencia MIT: permite uso comercial y modificación, pero exige mantener el aviso de copyright; conviene citar ChronoRoot 2.0 y SCNP según indica el autor.
- No apto para tareas de lenguaje, razonamiento o agentes: es exclusivamente un modelo de segmentación de imágenes.

## Enlaces

- Hugging Face: https://huggingface.co/ngaggion/ChronoRoot2-MultiPlant
- Modelo Arabidopsis-only: https://huggingface.co/ngaggion/ChronoRoot2-Arabidopsis
- Dataset ChronoRoot2: https://huggingface.co/datasets/ngaggion/ChronoRoot2
- Dataset UnsupervisedRootVideos: https://huggingface.co/datasets/ngaggion/UnsupervisedRootVideos
- Web del proyecto ChronoRoot: https://chronoroot.github.io/
- Repositorio GitHub: https://github.com/ChronoRoot/ChronoRoot2
- Paper SCNP (CVPR 2026): https://arxiv.org/abs/2603.18671
- Publicación ChronoRoot 2.0 (GigaScience): doi 10.1093/gigascience/giag018
