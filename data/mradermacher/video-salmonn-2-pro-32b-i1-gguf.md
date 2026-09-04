# mradermacher/video-SALMONN-2-Pro-32B-i1-GGUF

## Resumen

Video-SALMONN-2-Pro-32B es un modelo de lenguaje multimodal de 32.700 millones de parámetros desarrollado por el Departamento de Ingeniería Electrónica de la Universidad de Tsinghua y ByteDance. Se trata de la variante "Pro" del modelo video-SALMONN-2, diseñada para generar subtítulos de vídeo de alta calidad integrando información de audio y visual. Este modelo resulta relevante para tareas de comprensión audiovisual, ya que combina señales de audio y vídeo en un único modelo de lenguaje, lo que permite describir contenido dinámico con mayor precisión que los modelos que solo procesan texto o imágenes estáticas.

La versión presentada en este repositorio es una cuantización GGUF con matriz de importancia (i1) creada por mradermacher, cuyo objetivo es facilitar la inferencia en hardware de consumo mediante llama.cpp u otros motores compatibles. El modelo se distribuye bajo licencia Apache 2.0 y declara el inglés como idioma principal. No se han publicado en la información disponible datos sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje multimodal (audio-visual); arquitectura exacta no disponible |
| Parámetros totales | 32.762.123.264 (32,7B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF i1: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base video-SALMONN-2-Pro-32B es un modelo de lenguaje multimodal que integra codificadores de audio y vídeo con un modelo de lenguaje de gran tamaño. Según el repositorio oficial de video-SALMONN-2, el sistema genera subtítulos de vídeo de alta calidad a partir de entradas audiovisuales. La arquitectura exacta del modelo base no está documentada en la información disponible. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. La cuantización i1 de mradermacher utiliza una matriz de importancia (imatrix) para preservar la calidad de los pesos durante el proceso de compresión.

## Capacidades

- Generación de subtítulos de vídeo (video captioning) de alta calidad, combinando información de audio y visual.
- Comprensión de contenido audiovisual como modelo de lenguaje multimodal.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: el modelo declara inglés como idioma principal; no se especifican otros idiomas.
- Capacidades especiales: procesamiento de vídeo y audio; no se menciona modo de pensamiento.

## Casos de uso

- Subtitulación automática de vídeos para accesibilidad: el modelo puede analizar pistas de audio y vídeo para generar descripciones detalladas, lo que facilita la accesibilidad para personas con discapacidad visual.
- Anotación de vídeos en archivos y bibliotecas: permite generar metadatos descriptivos para vídeos almacenados, mejorando la búsqueda y recuperación de contenido.
- Análisis de vídeos de vigilancia: puede describir eventos y acciones en secuencias de vídeo, útil para sistemas de monitorización.
- Descripción de contenido para plataformas de streaming: genera sinopsis y descripciones de escenas para catálogos de vídeo bajo demanda.
- Apoyo a la edición de vídeo: los subtítulos generados pueden servir como guion preliminar para editores y creadores de contenido.
- Investigación en análisis de vídeo educativo: permite extraer descripciones de vídeos de conferencias o tutoriales para indexarlos y resumirlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: las cuantizaciones disponibles oscilan entre 7,4 GB (IQ1_S) y 27 GB (Q6_K). Para la cuantización recomendada Q4_K_M (~19,9 GB) se necesita una GPU con al menos 24 GB de VRAM.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones Q4_K_M o inferiores; A100 (40/80 GB) o H100 para Q6_K o para el modelo original en safetensors.
- En consumer GPU: sí, con cuantizaciones Q4 o inferiores en GPUs de 24 GB. También es posible ejecutarlo en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp para los archivos GGUF; el modelo original puede desplegarse con vLLM, TGI u Ollama (tras conversión).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con modelos similares en la información proporcionada. El modelo base es una variante Pro de video-SALMONN-2, cuyo repositorio oficial es la referencia más cercana.

## Limitaciones y advertencias

- El modelo declara el inglés como idioma principal; no se especifica soporte para otros idiomas.
- No se ha publicado información sobre sesgos, riesgos de alucinación ni datos de entrenamiento.
- Las cuantizaciones extremas (IQ1_S, IQ2) pueden degradar notablemente la calidad de las respuestas.
- Los archivos mmproj necesarios para la parte visual no están incluidos en este repositorio; deben descargarse desde el repositorio estático de mradermacher para un funcionamiento completo.
- La licencia Apache 2.0 permite el uso comercial, pero se debe verificar la licencia del modelo base tsinghua-ee/video-SALMONN-2-Pro-32B.
- No hay información sobre la longitud de contexto ni sobre el comportamiento en tareas de razonamiento complejo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/video-SALMONN-2-Pro-32B-i1-GGUF
- Repositorio HuggingFace estático: https://huggingface.co/mradermacher/video-SALMONN-2-Pro-32B-GGUF
- Modelo base: https://huggingface.co/tsinghua-ee/video-SALMONN-2-Pro-32B
- Repositorio GitHub del proyecto original: https://github.com/bytedance/video-SALMONN-2
- Perfil de mradermacher: https://huggingface.co/mradermacher
