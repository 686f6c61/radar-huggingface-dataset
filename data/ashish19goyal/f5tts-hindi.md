# ashish19goyal/F5TTS-Hindi

## Resumen

F5TTS-Hindi es una adaptación del modelo de síntesis de voz F5-TTS orientada al idioma hindi, publicada por el usuario ashish19goyal en Hugging Face. El repositorio no solo contiene los pesos del modelo, sino también un pipeline completo de preparación de datos, entrenamiento y evaluación basado en Apache Airflow, Apache Spark, MLFlow y Docker, lo que sugiere un flujo de trabajo reproducible para datos a gran escala. El checkpoint principal se denomina `model_deeper_78900.pt`, correspondiente a una variante "deeper" (más profunda) de F5-TTS, y el tamaño total del repositorio es de 119,8 GB, lo que indica pesos de gran volumen. La inferencia se realiza mediante un contenedor Docker con soporte CUDA/PyTorch, y el modelo acepta texto en hindi (UTF-8) junto con un audio de referencia para generar voz.

La relevancia de este modelo reside en ofrecer una opción de síntesis de voz en hindi basada en una arquitectura moderna de flow matching no autorregresiva, aunque la documentación pública es muy limitada: no se especifican parámetros, licencia, ni benchmarks. A pesar de ello, el repositorio incluye herramientas de análisis, limpieza y preparación de datos, lo que puede ser útil para quienes deseen replicar o extender el entrenamiento con sus propios datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching no autorregresivo, variante "deeper") |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi |
| Licencia | no disponible |
| Formato de pesos | .pt (PyTorch) y .safetensors (mencionados en el flujo git-xet) |

## Arquitectura y entrenamiento

F5-TTS es un modelo de síntesis de voz basado en flow matching, no autorregresivo, que genera mel-spectrogramas condicionados por texto y un audio de referencia para permitir clonación de voz. La variante "deeper" del repositorio sugiere una red con mayor profundidad que la versión base, aunque no se detallan las capas ni el número de parámetros. El entrenamiento se realizó mediante un pipeline distribuido con Apache Spark para particionar datos y evitar errores de memoria, orquestado por Apache Airflow y con seguimiento de experimentos en MLFlow. No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La inferencia se ejecuta en un contenedor Docker que incluye PyTorch y CUDA, con un checkpoint por defecto en `data/artifacts/model_deeper_78900.pt`.

## Capacidades

- Síntesis de voz en hindi a partir de texto (entrada en UTF-8).
- Clonación de voz mediante un audio de referencia (`reference.wav`).
- Generación de audio en formato WAV (salida en `output/inference/generated.wav`).
- Pipeline reproducible de preparación de datos, entrenamiento y evaluación con Airflow, Spark y MLFlow.
- Inferencia en contenedor Docker sin necesidad de instalar PyTorch ni ffmpeg en el host.
- Soporte de modo simulado (`--use-mock`) para probar el flujo sin pesos del modelo.

## Casos de uso

- Narración automática de contenidos en hindi: el modelo puede generar voz para artículos, noticias o entradas de blog, usando un audio de referencia para mantener una voz consistente.
- Audiobooks en hindi: dado su soporte de clonación de voz, permite producir audiolibros con una voz determinada a partir de texto largo.
- Asistentes de voz para aplicaciones en hindi: integrable en sistemas de diálogo donde se necesite respuesta hablada en este idioma.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual que requieran contenido en hindi.
- Doblaje y doblaje de vídeo: generación de pistas de audio en hindi a partir de guiones, con control de la voz mediante referencia.
- Investigación en TTS para hindi: el repositorio incluye herramientas de análisis y preparación de datos que pueden servir para estudios académicos sobre síntesis de voz en este idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Se requiere una GPU compatible con CUDA para la inferencia con PyTorch.
- Docker Engine (Linux) o Docker Desktop (Windows/macOS) es obligatorio para ejecutar el flujo de inferencia.
- El repositorio ocupa 119,8 GB, por lo que se necesita espacio de almacenamiento considerable.
- No se especifica la VRAM mínima ni el modelo de GPU recomendado. Dado el tamaño del checkpoint, se estima que se necesita una GPU con al menos 16-24 GB de VRAM para cargar los pesos en FP32, aunque esto no está confirmado.
- La primera construcción de la imagen Docker descarga una base de PyTorch de aproximadamente 4 GB, que se reutiliza en ejecuciones posteriores.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables en la documentación proporcionada. La variante original F5-TTS (para inglés y otros idiomas) existe como referencia, pero no se han encontrado datos comparativos de rendimiento, parámetros o licencia para esta adaptación en hindi.

## Limitaciones y advertencias

- Documentación técnica muy limitada: no se especifican parámetros, arquitectura detallada, ni licencia, lo que dificulta su uso en producción sin verificación adicional.
- Sin benchmarks publicados: no hay evidencia objetiva de la calidad de síntesis en hindi frente a otros modelos TTS.
- Riesgo de alucinación o errores de pronunciación en hindi, especialmente con texto complejo o nombres propios, dado que no se documenta el dataset de entrenamiento.
- Dependencia de Docker y CUDA: la inferencia requiere un entorno con Docker y GPU NVIDIA, lo que limita su despliegue en infraestructuras sin estos requisitos.
- El tamaño del repositorio (119,8 GB) implica costes de almacenamiento y descarga significativos.
- No se indica si el modelo es adecuado para uso comercial; la ausencia de licencia explícita genera incertidumbre legal.
- El flujo de entrenamiento depende de servicios externos (Airflow, Spark, MLFlow) y de un archivo `variables.json` con credenciales, lo que añade complejidad operativa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ashish19goyal/F5TTS-Hindi
