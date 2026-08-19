# anime-song/instrument_agnostic_amt

## Resumen

El modelo `instrument_agnostic_amt` es un sistema de transcripción automática de música (AMT) que convierte audio en notación MIDI. Desarrollado por el usuario anime-song, su principal característica es que no distingue entre instrumentos: piano, guitarra, bajo, voces, cuerdas, metales, etc. Un único modelo procesa cualquier fuente sonora con tono definido. La arquitectura se basa en Transkun (Yujia Yan et al.) y su enfoque Neural Semi-CRF, una técnica de etiquetado secuencial adaptada a la transcripción musical. El repositorio tiene un tamaño de 1,4 GB, lo que sugiere un modelo de tamaño medio, aunque no se han publicado los parámetros exactos. Es relevante porque simplifica el flujo de trabajo de transcripción al eliminar la necesidad de entrenar modelos específicos por instrumento, similar a Basic Pitch de Spotify, pero con una base técnica distinta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Neural Semi-CRF basada en Transkun |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo procesa audio, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura basada en Transkun, que a su vez se apoya en un enfoque Neural Semi-CRF para el etiquetado de eventos musicales (notas, tiempos, etc.). A diferencia de modelos que separan por instrumentos, este utiliza una representación unificada que predice la actividad de tono y el tiempo de cada nota directamente desde la forma de onda o el espectrograma. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens o el proceso de alineación. La innovación principal reside en el uso de Semi-CRF para modelar dependencias de largo alcance entre eventos musicales, lo que mejora la coherencia de las transcripciones polifónicas.

## Capacidades

- Transcripción automática de audio a MIDI sin distinción de instrumento: piano, guitarra, bajo, voces, cuerdas, metales y cualquier fuente con tono.
- Manejo de polifonía: puede transcribir múltiples notas simultáneas.
- Salida en formato MIDI estándar, lista para su uso en DAWs o editores de partituras.
- Inferencia directa sobre archivos de audio (WAV, MP3, etc.) mediante el script de Colab proporcionado.
- No requiere entrenamiento adicional por instrumento: un solo modelo cubre todo el espectro tímbrico.

## Casos de uso

- Transcripción de grabaciones musicales para su edición en DAWs: el modelo convierte pistas de audio en MIDI editable, permitiendo corregir notas, cambiar instrumentos o extraer melodías.
- Creación de partituras a partir de interpretaciones en vivo: los músicos pueden grabar una sesión y obtener una notación MIDI para transcribirla a notación tradicional con herramientas como MuseScore.
- Análisis musical automatizado: investigadores pueden extraer estructuras melódicas y armónicas de corpus de audio sin etiquetar, gracias a la salida MIDI estructurada.
- Remuestreo y reorquestación: al convertir audio a MIDI, es posible reemplazar instrumentos o aplicar nuevos sonidos manteniendo la interpretación original.
- Educación musical: los estudiantes pueden comparar su interpretación con una transcripción de referencia para identificar errores de afinación o ritmo.
- Accesibilidad: permite a personas con discapacidad visual interactuar con música mediante la conversión a MIDI, que puede reproducirse con sintetizadores o convertirse a braille musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos comparativos con otros modelos de transcripción como Basic Pitch o Onsets and Frames.

## Requisitos de hardware

- El tamaño del repositorio es de 1,4 GB, lo que sugiere que el modelo podría caber en GPUs de consumo con 8 GB de VRAM o más, pero no se especifican los requisitos oficiales.
- No se dispone de datos sobre VRAM estimada, GPU recomendadas o latencia.
- El proyecto incluye un notebook de Colab para inferencia, lo que indica que puede ejecutarse en entornos con GPU gratuita de Google (T4 o similar).
- Opciones de despliegue: se proporciona un script de inferencia en Python y un notebook de Colab. No se menciona soporte para vLLM, llama.cpp u otros frameworks de inferencia optimizados, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa. Como referencia cualitativa, el modelo se posiciona como una alternativa a Basic Pitch de Spotify, que también es agnóstico de instrumento, pero la arquitectura difiere (Semi-CRF frente a redes convolucionales). No hay datos de rendimiento publicados que permitan una comparación objetiva.

## Limitaciones y advertencias

- Al ser agnóstico de instrumento, no asigna pistas separadas por instrumento; toda la salida se fusiona en una única pista MIDI, lo que puede dificultar la separación de fuentes en mezclas complejas.
- La calidad de la transcripción puede degradarse con grabaciones de baja calidad, ruido excesivo o polifonía muy densa (más de 10 notas simultáneas).
- No se han documentado sesgos específicos, pero es probable que el rendimiento varíe según el género musical y la instrumentación, dependiendo de los datos de entrenamiento (no publicados).
- La licencia MIT permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento para evitar problemas de derechos de autor, aunque no se ha indicado nada al respecto.
- No hay soporte para transcripción en tiempo real; el modelo está diseñado para procesamiento por lotes de archivos completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anime-song/instrument_agnostic_amt
- Repositorio GitHub: https://github.com/anime-song/instrument-agnostic-amt
- Notebook de inferencia en Colab: https://colab.research.google.com/github/anime-song/instrument-agnostic-amt/blob/main/Colab_Inference.ipynb
