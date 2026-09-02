# litert-community/Neo_Dragon

## Resumen

Neo_Dragon es un conjunto de conversiones a LiteRT (formato `.tflite`) del modelo Neodragon de Qualcomm AI Research, preparadas por la comunidad LiteRT para su ejecución íntegramente en dispositivos Android. El modelo genera clips de vídeo de 320×512 píxeles de forma totalmente local, sin conexión a red, servidores ni cuentas, y está pensado como artefacto de integración para Box, una aplicación Android de IA generativa open source y offline.

El pipeline completo combina un primer fotograma generado por texto mediante el modelo SSD1B (Stable Diffusion 1B) a 640×1024, seguido de una etapa de animación basada en un DiT piramidal de 1.500 millones de parámetros con tres resoluciones de entrada (10×16, 20×32 y 40×64), junto con encoders de texto CLIP y DT5 y un VAE causal para la codificación y decodificación del vídeo. Los pesos del DiT están cuantizados a int4, y varios encoders a int8, lo que permite su ejecución en CPU móvil con tiempos medidos de entre 1,1 y 17,3 segundos por etapa en un Pixel 10 Pro Fold (Tensor G5).

La relevancia de este repositorio radica en que es una de las primeras implementaciones prácticas de generación de vídeo texto-a-vídeo optimizada para hardware móvil, con una licencia dual (BSD 3-Clause Clear más la Qualcomm Responsible AI License) que impone restricciones de uso específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT piramidal de 3 etapas (10×16, 20×32, 40×64) + encoders CLIP-L y CLIP-G, encoder DT5, adaptador de contexto, VAE causal de vídeo y SSD1B para el primer fotograma |
| Parametros totales | 1.500 millones (DiT) + aproximadamente 1.000 millones (SSD1B) + encoders y VAE; no se publica el total exacto del pipeline completo |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica directamente; los encoders de texto aceptan secuencias de 128 tokens (DT5) y 77 tokens (CLIP-L y CLIP-G) |
| Tipos de cuantizacion | int4 (DiT de las tres etapas), int8 (encoders CLIP-G, adaptador de contexto), fp32 (UNet de SSD1B, encoders CLIP-L y DT5) |
| Idiomas soportados | no disponible |
| Licencia | BSD 3-Clause Clear + Qualcomm Responsible AI License (con restricciones de uso que fluyen al usuario final) |
| Formato de pesos | `.tflite` (LiteRT, sucesor de TensorFlow Lite) |

## Arquitectura y entrenamiento

Neodragon es un modelo texto-a-vídeo desarrollado por Qualcomm AI Research, descrito por sus autores como el primero específicamente optimizado para hardware móvil, en contraste con los modelos offline basados en transformadores existentes. El pipeline se compone de dos fases: una primera que genera el fotograma inicial a partir de texto usando SSD1B (arquitectura SDXL) a resolución 640×1024, y una segunda que anima ese fotograma mediante un DiT piramidal de 1.500 millones de parámetros. El DiT se ejecuta en tres etapas con resoluciones crecientes (10×16, 20×32 y 40×64), reutilizando los mismos pesos en cada una. El condicionamiento textual combina un encoder DT5 (que produce embeddings de 4096 dimensiones, reducidos a 1536 por un adaptador de contexto) con dos encoders CLIP (CLIP-L y CLIP-G) cuyos vectores pooled se usan para el condicionamiento del DiT.

Una peculiaridad importante es que el pipeline usa dos pares de encoders CLIP distintos: los `clip_*` son los encoders propios de Neodragon para el vector pooled del DiT, mientras que los `ssd_1b_clip_*` son los de SSD1B para el condicionamiento SDXL. Sus pesos difieren, aunque comparten el mismo vocabulario de tokenizador. Además, SSD1B requiere usar `hidden_states[-2]` de los encoders CLIP, no `last_hidden_state`, para no degradar silenciosamente la calidad de salida. Los detalles de los datos de entrenamiento, número de tokens y técnicas de alineación (RLHF, DPO, etc.) no se han publicado en la información disponible.

## Capacidades

- Generación de vídeo texto-a-vídeo de 9 fotogramas a resolución 320×512, completamente en el dispositivo.
- Generación de primer fotograma (imagen) a partir de texto a 640×1024 mediante SSD1B.
- Inferencia totalmente offline: sin red, sin servidor, sin cuenta.
- Ejecución exclusivamente en CPU móvil; el delegate de GPU de LiteRT no es compatible por la naturaleza 5D de los tensores latentes `(b,c,t,h,w)`.
- Compatibilidad con el runtime LiteRT (sucesor de TensorFlow Lite) y con la aplicación Box para Android.
- Cuantización mixta: int4 para el DiT, int8 para algunos encoders, fp32 para el UNet de SSD1B.
- Dos pipelines diferenciados: vídeo (imagen a vídeo) y primer fotograma (texto a imagen), ambos exportados como grafos LiteRT de forma fija.

## Casos de uso

- Creación de contenido audiovisual offline en dispositivos móviles: un creador puede generar clips cortos de vídeo a partir de descripciones textuales sin necesidad de conexión, ideal para entornos con cobertura limitada o requisitos de privacidad estrictos.
- Prototipado rápido de storyboards: generar secuencias de 9 fotogramas a partir de guiones textuales para previsualizar escenas antes de la producción real, directamente desde un teléfono.
- Asistencia creativa para diseñadores y artistas: combinar la generación del primer fotograma a 640×1024 con la animación posterior para explorar variaciones de una idea visual sin depender de servicios en la nube.
- Aplicaciones educativas de IA generativa: servir como demostración práctica de texto-a-vídeo en dispositivos Android en cursos y talleres, al no requerir infraestructura de servidor.
- Generación de vídeo con privacidad garantizada: al procesar todo localmente, los prompts y el contenido generado nunca abandonan el dispositivo, lo que la hace adecuada para aplicaciones con datos sensibles.
- Integración en aplicaciones Android de IA generativa tipo Box: el formato `.tflite` fijo permite empaquetar el modelo en la app y descargarlo bajo demanda, con una pantalla de consentimiento que informa de las restricciones de licencia y marca la salida como generada por IA.
- Evaluación de rendimiento de IA en dispositivos: los tiempos medidos por etapa (1,1 / 3,9 / 17,3 segundos en Tensor G5) permiten comparar el rendimiento de distintos SoC móviles para cargas de trabajo de generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como FVD, IS o CLIP Score) en la información disponible. Los únicos datos de rendimiento medidos provienen de la model card y corresponden a tiempos de inferencia en un Pixel 10 Pro Fold (SoC Tensor G5), ejecución en CPU:

| Etapa | Resolucion | Tiempo por llamada |
|---|---|---|
| DiT stage 0 | 10×16 | ≈ 1,1 s |
| DiT stage 1 | 20×32 | ≈ 3,9 s |
| DiT stage 2 | 40×64 | ≈ 17,3 s |

El pipeline completo de vídeo requiere una llamada a cada etapa del DiT, más los encoders de texto y el VAE, por lo que el tiempo total por clip supera los 22 segundos solo en las etapas del DiT, sin contar el resto de componentes. No se dispone de datos comparativos con otros modelos texto-a-vídeo en la información proporcionada.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el delegate de GPU de LiteRT falla con tensores de rango 5 (el límite del delegate es rango 4), provocando un segfault en operaciones `RESHAPE`. Es una limitación estructural, no de configuración.
- Medido en Pixel 10 Pro Fold con SoC Tensor G5: tiempos de 1,1 / 3,9 / 17,3 segundos por etapa del DiT.
- Espacio en disco: el repositorio ocupa 13,4 GB, con los grafos `.tflite` individuales que van desde 38 MB (decodificador VAE) hasta 5,07 GB (UNet de SSD1B). Se requiere almacenamiento considerable en el dispositivo.
- Memoria RAM: no se especifica el consumo de memoria en la información disponible, pero los grafos de mayor tamaño (2,65 GB y 5,07 GB) requieren una cantidad significativa de RAM para su carga y ejecución.
- Despliegue: runtime LiteRT en Android, con la aplicación Box como implementación de referencia. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, al tratarse de un formato específico para móvil.
- No se dispone de datos de latencia y throughput para otros dispositivos distintos del Pixel 10 Pro Fold.

## Comparativa con modelos similares

No se dispone de información suficiente en los datos proporcionados para establecer una comparativa cuantitativa con modelos alternativos de texto-a-vídeo. No obstante, según la página del proyecto de Qualcomm AI Research, Neodragon se diferencia de los modelos offline basados en transformadores por estar específicamente optimizado para hardware móvil, con el objetivo de lograr síntesis de vídeo eficiente, de bajo coste y alta fidelidad en dispositivos. Esta conversión a LiteRT es, hasta donde se sabe, una de las pocas implementaciones prácticas de texto-a-vídeo on-device disponibles públicamente, por lo que no hay alternativas directas comparables en el mismo formato.

## Limitaciones y advertencias

- Licencia dual con restricciones: además de la BSD 3-Clause Clear (que no concede licencia de patentes), se aplica la Qualcomm Responsible AI License, que prohíbe usos militares, aplicaciones de policía predictiva, puntuación social, categorización biométrica, reconocimiento de emociones en entornos laborales o educativos, y la distribución de contenido generado sin revelar que es producido por máquina. Estas restricciones fluyen al usuario final.
- Límite de 9 fotogramas por clip: cada grafo del DiT acepta exactamente dos latentes de condicionamiento, lo que limita la salida a clips de 9 fotogramas.
- Solo CPU: la incompatibilidad con el delegate de GPU de LiteRT por los tensores 5D limita el rendimiento y descarta la aceleración por GPU/NPU en la mayoría de dispositivos.
- Riesgo de corrupción silenciosa en tokenización: el archivo `clip_merges.txt` conserva la cabecera `#version: 0.2`; si no se omite al cargar, todos los rangos de merge se desplazan y la tokenización se corrompe sin error aparente.
- Degradación silenciosa en SSD1B: usar `last_hidden_state` en lugar de `hidden_states[-2]` en los encoders CLIP no provoca fallos, pero degrada notablemente la calidad de la imagen generada.
- El UNet de SSD1B se distribuye en fp32 porque la cuantización int8 falla en `ai_edge_quantizer` 0.8.0 en una capa concreta, lo que incrementa el uso de memoria y almacenamiento.
- No se dispone de información sobre sesgos del modelo, riesgos de alucinación visual, idiomas soportados ni calidad de resultados en dominios específicos.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que su madurez y validación en producción son limitadas.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/litert-community/Neo_Dragon
- Repositorio HuggingFace del modelo original: https://huggingface.co/Qualcomm-AI-Research/Neodragon
- Pagina del proyecto Neodragon (paper e investigacion): https://qualcomm-ai-research.github.io/neodragon/
- Aplicacion Box (implementacion de referencia): https://github.com/jegly/Box
- LiteRT (runtime, sucesor de TensorFlow Lite): https://github.com/google-ai-edge/litert
- Ejemplos y recetas de LiteRT: https://github.com/google-ai-edge/litert-samples
- Comunidad LiteRT en HuggingFace: https://huggingface.co/litert-community
- Licencia BSD 3-Clause Clear: https://spdx.org/licenses/BSD-3-Clause-Clear.html
- Qualcomm Responsible AI License: https://www.qualcomm.com/site/responsible-ai-license
