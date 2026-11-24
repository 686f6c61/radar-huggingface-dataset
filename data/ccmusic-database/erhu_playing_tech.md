# ccmusic-database/erhu_playing_tech

## Resumen

El modelo `erhu_playing_tech` es un clasificador de audio entrenado para reconocer técnicas de interpretación del erhu, un instrumento de cuerda frotada tradicional chino. Lo desarrolla el proyecto ccmusic-database, vinculado a la base de datos abierta CCMusic para investigación en recuperación de información musical (MIR) de música china. El modelo resuelve un problema específico de MIR: dada una grabación de erhu, identificar automáticamente qué técnica de arco o digitación se está empleando.

La arquitectura es una red convolucional o transformer visual aplicada sobre representaciones tiempo-frecuencia del audio (mel-espectrograma, CQT o chroma). El repositorio incluye múltiples backbones evaluados (Swin-S, Swin-T, AlexNet, ConvNeXt-T, ShuffleNet-V2-X2.0, GoogleNet, SqueezeNet1.1), con el mejor resultado obtenido por Swin-T sobre mel-espectrograma y ConvNeXt-T sobre CQT y chroma, alcanzando precisiones de hasta 0,994.

Es relevante para quienes trabajan en análisis automático de interpretación musical, educación musical asistida por ordenador y preservación de técnicas instrumentales tradicionales. No es un modelo de lenguaje: es un clasificador de audio de dominio muy acotado, con licencia MIT y un tamaño de repositorio de 1,7 GB que incluye los pesos de los distintos backbones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales y transformers visuales (Swin-S, Swin-T, AlexNet, ConvNeXt-T, ShuffleNet-V2-X2.0, GoogleNet, SqueezeNet1.1) sobre representaciones tiempo-frecuencia de audio |
| Parametros totales | no disponible (depende del backbone; el repo contiene varios) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificación de audio por ventanas; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos); el dominio es audio musical, independiente del idioma |
| Licencia | MIT |
| Formato de pesos | no disponible de forma explícita; el repo usa Git LFS y se descarga vía `snapshot_download` |
| Tarea | audio-classification (reconocimiento de técnicas de erhu) |
| Numero de clases | 11 técnicas de interpretación |
| Representaciones de entrada | mel-espectrograma, CQT, chroma |
| Tamano del repositorio | 1,7 GB |
| Metricas declaradas | accuracy |

## Arquitectura y entrenamiento

El modelo se construye sobre backbones de visión aplicados a imágenes tiempo-frecuencia del audio. La model card evalúa siete backbones (Swin-S, Swin-T, AlexNet, ConvNeXt-T, ShuffleNet-V2-X2.0, GoogleNet y SqueezeNet1.1) sobre tres representaciones espectrales: mel-espectrograma, CQT (constant-Q transform) y chroma. El flujo es el habitual en clasificación musical: conversión tiempo-frecuencia, extracción de características y reconocimiento de patrones sobre la representación elegida.

No se detalla en la información disponible el número de tokens de audio de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de aumento de datos o regularización específicas. El modelo se entrena sobre el dataset `ccmusic-database/erhu_playing_tech`, publicado por el mismo autor, y forma parte del corpus CCMusic descrito en la publicación de Zhou et al. (2025) en Transactions of the International Society for Music Information Retrieval. No se menciona RLHF, DPO ni innovaciones de decodificación, ya que no es un modelo generativo.

## Capacidades

- Clasificación de audio de erhu en 11 técnicas de interpretación: split bow, pad bow, overtone, continuous bow, glissando, big glissando, strike bow, pizzicato, throw bow, staccato bow, vibrato y tremolo/vibrato (la model card enumera 11 técnicas aunque el listado textual incluye solapamientos).
- Funciona sobre tres representaciones de entrada alternativas: mel-espectrograma, CQT y chroma, lo que permite elegir el compromiso entre precisión y coste computacional.
- Clasificación de fragmentos de audio, no generación: no produce texto, código ni razonamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no aplicables: el dominio es audio musical.
- No dispone de modo thinking, visión, audio generativo ni otras capacidades especiales más allá de la clasificación.

## Casos de uso

- Anotación automática de archivos de erhu: dado un corpus de grabaciones, el modelo etiqueta cada segmento con la técnica empleada, lo que permite construir índices de técnicas para archivos musicológicos y bibliotecas sonoras.
- Educación musical asistida: un estudiante de erhu puede grabar una interpretación y el modelo indica qué técnica detecta en cada pasaje, sirviendo como retroalimentación objetiva sobre la ejecución.
- Investigación en interpretación musical: análisis estadístico de la frecuencia y distribución de técnicas en distintas escuelas o intérpretes, usando la clasificación como variable cuantitativa.
- Preservación del patrimonio musical: catalogación de grabaciones históricas de erhu para documentar técnicas en riesgo de desaparición.
- Sistemas de recomendación musical especializados: filtrar o recomendar grabaciones por técnica predominante, útil en plataformas de música tradicional china.
- Evaluación comparativa de representaciones: usar el modelo como referencia para comparar mel, CQT y chroma en tareas de clasificación de técnicas instrumentales, tal como hace la propia model card con los distintos backbones.
- Docencia en MIR: ejemplo didáctico de pipeline completo (representación tiempo-frecuencia, backbone visual, clasificación) para cursos de recuperación de información musical.

## Benchmarks y rendimiento

Resultados de accuracy publicados en la model card, por backbone y representación:

| Backbone | Mel | CQT | Chroma |
|---|---|---|---|
| Swin-S | 0,978 | 0,940 | 0,903 |
| Swin-T | **0,994** | 0,958 | 0,957 |
| AlexNet | 0,960 | 0,970 | 0,933 |
| ConvNeXt-T | **0,994** | **0,993** | **0,954** |
| ShuffleNet-V2-X2.0 | 0,990 | 0,923 | 0,887 |
| GoogleNet | 0,986 | 0,981 | 0,908 |
| SqueezeNet1.1 | 0,932 | 0,939 | 0,875 |
| Media | 0,976 | 0,958 | 0,917 |

El mejor resultado global corresponde a Swin-T con mel-espectrograma y a ConvNeXt-T con CQT y chroma, ambos con 0,994 en mel y 0,993 en CQT respectivamente. La model card incluye curvas de pérdida, curvas de accuracy de entrenamiento y validación, y matriz de confusión para el ajuste fino de Swin-T sobre mel.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al tratarse de backbones tipo Swin-T, ConvNeXt-T, AlexNet o GoogleNet, la inferencia cabe holgadamente en GPU de consumo, con estimaciones típicas de pocos GB según el backbone y el tamaño de lote.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB de VRAM es suficiente para los backbones pequeños (SqueezeNet, ShuffleNet, GoogleNet, AlexNet). Para Swin-S o ConvNeXt-T conviene disponer de 8-16 GB para lotes mayores.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño de los backbones.
- Opciones de despliegue: la model card solo documenta descarga vía `huggingface_hub.snapshot_download` y un Space de demostración. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de audio de este tipo. El despliegue habitual sería un script de PyTorch/TorchAudio o un servicio de inferencia propio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de clasificación de técnicas de erhu en la documentación aportada. Como referencia interna, la propia model card compara distintos backbones entre sí (ver tabla de benchmarks). Para alternativas externas de clasificación de técnicas instrumentales, la información disponible es insuficiente para establecer una comparativa rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| erhu_playing_tech (Swin-T mel) | no disponible | no aplica | 0,994 accuracy | MIT | Hugging Face, ModelScope |
| Alternativas de clasificación de técnicas de erhu | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: solo clasifica técnicas de erhu; no es un modelo general de audio ni de música.
- La model card enumera 11 técnicas pero el listado textual incluye solapamientos (vibrato y tremolo/vibrato), lo que puede generar ambigüedad en las etiquetas.
- No se documentan sesgos conocidos, pero al entrenarse sobre un dataset concreto de erhu, el rendimiento puede degradarse en grabaciones con ruido, instrumentos distintos o estilos no representados.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos en la clasificación cuando el audio no contiene erhu o contiene técnicas fuera del conjunto de 11 clases.
- Limitaciones de idioma no aplicables (audio), pero los metadatos y la documentación están en inglés.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar la licencia del dataset asociado (`ccmusic-database/erhu_playing_tech`) por si impone condiciones adicionales.
- El repositorio incluye varios backbones y no queda claro en la información disponible cuál es el peso por defecto ni cómo seleccionarlo; es necesario revisar la estructura del repo.
- No se documentan requisitos de preprocesado (sample rate, tamaño de ventana, normalización) más allá de la representación espectral, lo que puede afectar a la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccmusic-database/erhu_playing_tech
- Dataset en Hugging Face: https://huggingface.co/datasets/ccmusic-database/erhu_playing_tech
- Demo (Space): https://huggingface.co/spaces/ccmusic-database/erhu-playing-tech
- Mirror en ModelScope: https://www.modelscope.cn/models/ccmusic-database/erhu_playing_tech
- Repositorio de evaluación: https://github.com/monetjoe/ccmusic_eval
- Publicación CCMusic (Zhou et al., 2025): https://doi.org/10.5334/tismir.194
