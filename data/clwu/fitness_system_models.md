# CLWu/fitness_system_models

## Resumen

El repositorio `CLWu/fitness_system_models` contiene un clasificador basado en la arquitectura PatchTST (Patch Time Series Transformer) desarrollado por CatsLab, en la National Cheng Kung University, para el analisis automatico de la tecnica en ejercicios de fuerza. El modelo resuelve un problema concreto: detectar errores posturales en levantamiento de peso muerto (deadlift) y press de banca (benchpress) a partir de datos de estimacion de pose, como coordenadas 2D/3D o angulos articulares. No se trata de un modelo de lenguaje: es un transformer de series temporales orientado a clasificacion multi-etiqueta.

La relevancia actual del modelo radica en su aplicacion practica dentro del ecosistema de fitness y biomecanica deportiva: permite construir sistemas de retroalimentacion automatica sobre la forma de ejecucion en entrenamiento de fuerza. El modelo procesa secuencias de 110 fotogramas para deadlift y 100 para benchpress, con una longitud de patch de 10, dimension de embedding de 256, 4 cabezas de atencion y 4 capas de encoder. El repositorio ocupa 1,1 GB y se publico en marzo de 2026, con actualizacion en noviembre del mismo ano.

La informacion disponible sobre el modelo es limitada: la model card describe la arquitectura, los datos de entrenamiento y las metricas de evaluacion, pero no incluye resultados numericos de benchmarks, ni detalles sobre licencia, idiomas o formato de pesos. Esta ficha refleja exclusivamente lo documentado por el autor y marca como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PatchTST (Patch Time Series Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 110 fotogramas (deadlift), 100 fotogramas (benchpress) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura PatchTST, un transformer disenado especificamente para series temporales. La serie de entrada se segmenta en "patches" de longitud 10 que se tratan como tokens dentro de un transformer. La configuracion concreta incluye una dimension de embedding de 256, 4 cabezas de atencion, 4 capas de encoder y una tasa de dropout de 0,3. La cabeza de clasificacion aplica LayerNorm seguida de una capa Linear que proyecta a un numero de clases no especificado en la model card. La tarea es clasificacion multi-etiqueta, lo que permite detectar errores posturales solapados en una misma repeticion.

El entrenamiento se realizo con la funcion de perdida `BCEWithLogitsLoss`, optimizador Adam con tasa de aprendizaje `1e-4` y un scheduler de warmup cosine decay (5 epocas de warmup, 100 epocas totales) sobre GPUs NVIDIA. Los datos provienen de dos fuentes: el dataset MOCVD para deadlift (1.109 series, 8.506 repeticiones, 156 sujetos, con camaras multivista y keypoints 3D reconstruidos) y un dataset de benchpress en formato JSON centrado en trayectorias de muneca y barra. Se aplicaron aumentaciones de datos consistentes en estiramiento temporal aleatorio (factor 0,8x a 1,2x) y ruido gaussiano (sigma = 0,01) sobre las coordenadas de entrada. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de clasificacion.

## Capacidades

- Clasificacion multi-etiqueta de errores posturales en deadlift y benchpress a partir de secuencias de pose.
- Deteccion de errores solapados gracias a la funcion de perdida multi-etiqueta.
- Procesamiento de datos de entrada en forma de coordenadas 2D/3D o angulos articulares.
- Robustez ante variaciones de velocidad de ejecucion y ruido en la estimacion de pose, gracias a las aumentaciones de entrenamiento.
- Integracion como modulo downstream de un estimador de pose (por ejemplo, YOLOv11-Pose) en un pipeline de analisis de video.
- No soporta generacion de texto, tool calling, agentes, vision directa ni capacidades multilingues: es un clasificador de series temporales.

## Casos de uso

- Aplicaciones de coaching de fuerza: el modelo analiza la secuencia de pose de una repeticion y devuelve etiquetas de error postural, permitiendo retroalimentacion automatica al usuario sobre su tecnica en deadlift y benchpress.
- Investigacion en biomecanica deportiva: los investigadores pueden usar el clasificador para etiquetar grandes volumenes de datos de movimiento y estudiar patrones de error en cohortes de sujetos, apoyandose en las metricas de F1 macro y matriz de confusion multi-etiqueta.
- Integracion en pipelines de vision por computador: combinado con un estimador de pose como YOLOv11-Pose, el modelo actua como etapa de clasificacion downstream que convierte keypoints en etiquetas de tecnica.
- Sistemas de seguridad en entrenamiento: con un umbral de clasificacion reducido (por debajo de 0,5) para priorizar recall, el modelo puede alertar de errores criticos que incrementan el riesgo de lesion en cargas altas.
- Analisis de sesiones grabadas: procesamiento por lotes de videos de entrenamiento para generar informes de tecnica por repeticion, usando las secuencias de 110 o 100 fotogramas segun el ejercicio.
- Desarrollo de funcionalidades en apps de fitness: el modelo puede incorporarse como servicio de inferencia que recibe secuencias normalizadas de coordenadas y devuelve etiquetas de error, con la advertencia de que no sustituye la supervision profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe las metricas de evaluacion empleadas (F1 macro, accuracy, tiempo de inferencia y matriz de confusion multi-etiqueta) pero no incluye valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo es pequeno en numero de capas (4) y dimension de embedding (256), por lo que es probable que quepa en GPUs de consumo, pero no se han publicado mediciones.
- GPU recomendadas: no disponible. El autor indica que el entrenamiento se realizo en GPUs NVIDIA via CUDA, sin especificar modelo.
- Cabe en GPU de consumo: probablemente si, dado el tamano reducido de la arquitectura, aunque no hay confirmacion oficial.
- Opciones de despliegue: no disponibles. Al ser un modelo PatchTST, requeriria frameworks de inferencia para PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles. La model card menciona que el tiempo de inferencia se mide en segundos por muestra como metrica de evaluacion, pero no publica valores.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de clasificacion de tecnica deportiva basados en PatchTST ni resultados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Varianza entre sujetos: el rendimiento puede variar segun altura, peso y estilo de movimiento individual, segun advierte el propio autor.
- Dependencia de la vista de camara: aunque el dataset MOCVD es multivista, el rendimiento puede degradarse con vistas no optimizadas u obstruidas.
- Dependencia del estimador de pose: al ser un clasificador downstream, su precision depende criticamente de la calidad del estimador de pose usado (por ejemplo, YOLOv11-Pose).
- Normalizacion obligatoria: las secuencias de entrada deben normalizarse (Min-Max o Z-score) segun el pipeline de preprocesado esperado por el modelo.
- Umbral de clasificacion: el valor por defecto es 0,5; para deteccion de errores criticos se recomienda bajarlo para favorecer recall sobre precision.
- Uso fuera de alcance: no debe emplearse para diagnostico medico de lesiones ni para analisis clinico de marcha sin validacion adecuada.
- Privacidad: los datos de entrenamiento involucran sujetos humanos y deben anonimizarse conforme a estandares institucionales.
- Seguridad: la retroalimentacion automatica no sustituye la supervision profesional en entrenamiento de fuerza con cargas altas, especialmente para principiantes.
- Licencia no disponible: se desconoce si permite uso comercial; debe consultarse con el autor antes de integrarlo en produccion.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CLWu/fitness_system_models
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la informacion disponible.
