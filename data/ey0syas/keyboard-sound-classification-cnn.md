# ey0syas/keyboard-sound-classification-cnn

## Resumen

`ey0syas/keyboard-sound-classification-cnn` es un clasificador de audio desarrollado por Eyosyas Yoseph que identifica el tipo de teclado a partir de grabaciones sonoras. El modelo transforma el audio en espectrogramas Mel de 64 bins y emplea una red neuronal convolucional (CNN) implementada en PyTorch para asignar la grabacion a una de cuatro categorias: switches azules, switches rojos, teclado de membrana o teclado pantografico.

Se trata de un proyecto de portafolio con fines demostrativos y educativos, no de un modelo fundacional ni de un sistema de reconocimiento de pulsaciones. El autor lo describe explicitamente como un ejercicio de clasificacion multiclase con preprocesado de audio, y advierte que no predice teclas individuales ni reconstruye texto a partir del sonido de mecanografia.

Su relevancia es limitada como artefacto de produccion: el repositorio tiene 0 descargas, 0 likes y un tamano de 0.0 GB (lo que sugiere que los pesos no estan efectivamente alojados o son de tamano despreciable). Resulta util como referencia de pipeline (Librosa + Mel spectrogram + CNN) para quien quiera replicar una clasificacion de audio sencilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (capas convolucionales, batch normalization, ReLU, max pooling, adaptive average pooling, dropout, capa fully connected de 4 clases) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; entrada fija de 3 segundos a 22.050 Hz) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en coma flotante) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pth`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN disenada para clasificacion de imagenes de espectrograma. El pipeline de preprocesado carga archivos WAV, remuestrea a 22.050 Hz, aplica padding o truncado a 3 segundos fijos, genera espectrogramas Mel de 64 bins, los convierte a decibelios y normaliza las caracteristicas antes de la inferencia. La red combina capas convolucionales con batch normalization, activaciones ReLU, max pooling, adaptive average pooling y dropout para reducir sobreajuste, culminando en una capa fully connected de cuatro salidas.

El entrenamiento se realizo en Google Colab con PyTorch y Librosa, usando perdida de entropia cruzada y optimizador Adam. No se especifica el numero de tokens ni de muestras de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos (el autor las menciona solo como mejora futura). No hay informacion sobre RLHF, DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Clasificacion de audio en cuatro clases de teclado: switch azul (0), switch rojo (1), membrana (2) y pantografico (3).
- Extraccion de caracteristicas acusticas mediante espectrogramas Mel de 64 bins.
- Procesamiento de audio WAV con remuestreo a 22.050 Hz y duracion fija de 3 segundos.
- Evaluacion multiclase con accuracy, precision, recall, F1-score y matriz de confusion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision, audio generativo ni otras capacidades especiales.

## Casos de uso

- **Clasificacion de teclados en un catalogo de producto**: dado un archivo WAV de una grabacion de tecleo, el modelo devuelve la categoria del teclado, util para etiquetar muestras de audio en una tienda o base de datos de perifericos.
- **Control de calidad en fabricacion de teclados**: comparar el perfil acustico de unidades recien fabricadas contra las clases conocidas para detectar desviaciones en el tipo de switch.
- **Documentacion de datasets de audio**: usar el modelo como etiquetador preliminar de grabaciones de teclado antes de una revision manual, siempre con validacion humana.
- **Proyecto educativo de aprendizaje automatico**: sirve como ejemplo reproducible de pipeline completo (Librosa, espectrogramas Mel, CNN, PyTorch) para cursos de procesado de audio.
- **Demostracion de portafolio tecnico**: el notebook permite mostrar competencias en preprocesado de audio, entrenamiento y evaluacion de modelos.
- **Prototipo de analisis acustico de entornos**: como base para experimentar con clasificacion de fuentes sonoras de corta duracion (3 segundos), aunque requeriria reentrenamiento para otras categorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un campo de accuracy de test sin rellenar ("Add your measured test accuracy here after running the evaluation") y no reporta cifras de F1, precision ni recall.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; por el tipo de CNN sobre espectrogramas de 64 bins y entradas de 3 segundos, es previsible que quepa en GPUs de gama baja, pero no hay datos confirmados.
- GPU recomendadas: no disponible. El entrenamiento se realizo en Google Colab, lo que sugiere que una GPU consumer o una T4 es suficiente para el entrenamiento original.
- Cabe en GPU consumer: probablemente si, aunque no se especifica el modelo concreto ni el consumo medido.
- Opciones de despliegue: inferencia directa con PyTorch cargando el checkpoint `.pth`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ey0syas/keyboard-sound-classification-cnn | Clasificacion de audio (4 clases de teclado) | no disponible | no aplica (audio de 3 s) | MIT | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo clasifica tipos de teclado, no teclas individuales ni caracteres escritos.
- No predice contrasenas ni reconstruye texto a partir del sonido de mecanografia.
- El rendimiento en grabaciones de teclados desconocidos o en entornos ruidosos puede degradarse notablemente.
- El autor advierte que el rendimiento de test no debe interpretarse como garantia de precision en el mundo real.
- No se reportan metricas de evaluacion reales; el campo de accuracy esta sin rellenar.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- El tamano del repositorio es 0.0 GB, lo que genera dudas sobre si los pesos estan efectivamente disponibles.
- La licencia MIT se aplica al codigo; el autor recomienda verificar la licencia del dataset original antes de redistribuir datos o activos derivados.
- No hay informacion sobre sesgos, ya que el modelo no procesa texto ni datos personales, pero el dataset de audio puede estar sesgado hacia condiciones de grabacion concretas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ey0syas/keyboard-sound-classification-cnn
