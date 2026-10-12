# Hezi1991/ivrit-whisper-large-v3-ggml-q8

## Resumen

Hezi1991/ivrit-whisper-large-v3-ggml-q8 es una conversion al formato GGML con cuantizacion Q8 del modelo ivrit-ai/whisper-large-v3, que a su vez es un ajuste fino en hebreo de OpenAI Whisper large v3. El repositorio lo publica el usuario Hezi1991 y su unico proposito aparente es ofrecer los pesos en un formato optimizado para inferencia local con llama.cpp y herramientas derivadas, en lugar de los pesos originales en safetensors. No se documenta ningun entrenamiento adicional ni modificacion de arquitectura respecto al modelo base.

El modelo base pertenece a la familia Whisper, un sistema de reconocimiento automatico del habla (ASR) con arquitectura transformer encoder-decoder de aproximadamente 1550 millones de parametros, disenado para transcribir y traducir audio en ventanas de 30 segundos. La variante de ivrit.ai fue reentrenada especificamente para hebreo, y este repositorio anade la capa de cuantizacion Q8 para reducir el uso de memoria y facilitar el despliegue en equipos sin GPU dedicada.

Su relevancia es practica mas que cientifica: permite ejecutar un modelo ASR grande en hebreo en hardware de consumo mediante el ecosistema GGML. La informacion publicada en el repositorio es minima (sin model card descriptiva, sin pipeline declarado, sin idiomas listados y con cero descargas e interacciones en el momento de la consulta), por lo que gran parte de los datos tecnicos proceden del modelo de origen y no del repositorio en si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de Whisper large v3 |
| Parametros totales | ~1550 millones (arquitectura base de whisper-large-v3) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s; hasta 448 tokens en el decodificador (arquitectura base de Whisper) |
| Tipos de cuantizacion | GGML Q8 (segun el nombre del repositorio) |
| Idiomas soportados | no disponible en el repositorio; el ajuste de ivrit-ai esta orientado principalmente a hebreo |
| Licencia | apache-2.0 |
| Formato de pesos | GGML (cuantizacion Q8) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large v3: un transformer encoder-decoder con aproximadamente 1550 millones de parametros que procesa espectrogramas mel de 128 bandas sobre ventanas de 30 segundos de audio y genera texto de forma autorregresiva, con tokens especiales para transcripcion, traduccion, deteccion de idioma y marcas de tiempo. No es un modelo MoE ni emplea atencion lineal ni mecanismos SSM; es un transformer denso clasico.

Sobre el entrenamiento: este repositorio concreto no documenta ningun proceso de entrenamiento ni ajuste propio. El modelo del que deriva, ivrit-ai/whisper-large-v3, es un ajuste fino sobre openai/whisper-large-v3 realizado por ivrit.ai con datos en hebreo (el equipo publica articulos sobre su receta de entrenamiento de Whisper y menciona conjuntos como datos de transcripcion colaborativa y grabaciones parlamentarias). El unico cambio que introduce este repositorio es la conversion y cuantizacion a GGML Q8, que no altera los pesos en precision original salvo por la perdida inherente a la cuantizacion de 8 bits.

## Capacidades

- Transcripcion de audio a texto (ASR), orientada a contenido en hebreo segun el modelo de origen.
- Traduccion de audio a texto hacia otros idiomas, capacidad nativa de Whisper, aunque la utilidad puede degradarse en esta finetune especializada.
- Generacion de marcas de tiempo a nivel de segmento.
- Deteccion de idioma: la documentacion de ivrit-ai advierte que esta capacidad fue degradada durante el ajuste fino y que el modelo esta pensado para audio mayoritariamente en hebreo.
- Procesamiento de audio en fragmentos de hasta 30 segundos por ventana.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio en tiempo real mas alla del ASR por ventanas.
- Capacidades multilingues: no confirmadas en este repositorio; el foco del ajuste es el hebreo.

## Casos de uso

- Transcripcion de reuniones y entrevistas en hebreo: el modelo convierte grabaciones de audio en texto con marcas de tiempo, adecuado para generar actas o resumenes posteriores en flujos internos.
- Subtitulado de contenido audiovisual en hebreo: la capacidad de marcas de tiempo por segmento permite generar ficheros de subtitulos para video.
- Archivado y busqueda de audio historico: transcripcion por lotes de archivos de voz (por ejemplo, grabaciones parlamentarias o institucionales) para indexacion y busqueda textual.
- Asistentes de voz en hebreo: integrado aguas arriba de un modelo de lenguaje, sirve como capa de reconocimiento de voz en aplicaciones conversacionales.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en directo o diferido de eventos en hebreo.
- Despliegue en hardware de consumo: gracias a la cuantizacion Q8 y al formato GGML, permite ejecutar un ASR grande en portatiles o equipos sin GPU de gama alta, util para prototipos y entornos con recursos limitados.
- Preprocesado para pipelines de NLP: servir el texto transcrito a etapas posteriores de analisis, clasificacion o traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de WER ni comparaciones con otros modelos, y la model card esta practicamente vacia.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: al tratarse de una cuantizacion Q8 de un modelo de ~1550 millones de parametros, los pesos ocupan alrededor de 1,5-1,7 GB. La memoria total en ejecucion (activaciones incluidas) suele situarse en el entorno de 2-4 GB. Estos valores son estimaciones derivadas del tamano del modelo, no datos publicados en el repositorio.
- GPU recomendadas: no se especifican en el repositorio. Por tamano, cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superiores pueden ejecutarlo sin problema.
- Ejecucion en CPU: el formato GGML esta pensado precisamente para inferencia en CPU, por lo que es viable sin GPU dedicada, a costa de una mayor latencia.
- Opciones de despliegue: al estar en GGML Q8, es compatible con llama.cpp y con herramientas derivadas que soporten Whisper en formato GGML. No se documenta compatibilidad declarada con vLLM, TGI u Ollama en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma principal | Formato | Licencia |
|---|---|---|---|---|
| Hezi1991/ivrit-whisper-large-v3-ggml-q8 (este) | ~1550 M | Hebreo (ajuste de ivrit-ai) | GGML Q8 | apache-2.0 |
| ivrit-ai/whisper-large-v3 | ~1550 M | Hebreo | Safetensors | apache-2.0 |
| ivrit-ai/whisper-large-v3-turbo | No disponible en la informacion | Hebreo | Safetensors | apache-2.0 |
| openai/whisper-large-v3 (base) | ~1550 M | Multilingue (99 idiomas) | Safetensors / otros | apache-2.0 |

El elemento diferenciador de este repositorio frente a sus equivalentes en safetensors es unicamente el formato GGML Q8, orientado a inferencia local eficiente; el comportamiento acustico y linguistico deberia ser muy similar al de ivrit-ai/whisper-large-v3, salvo la ligera perdida por cuantizacion.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: el repositorio no incluye model card, pipeline declarado ni lista de idiomas, y registra cero descargas y cero likes, lo que dificulta verificar su calidad o procedencia.
- Es una cuantizacion: la precision Q8 de 8 bits introduce una degradacion menor del WER frente a los pesos originales en safetensors, que puede ser relevante en audio con ruido o acentos.
- Orientado a hebreo: segun la documentacion de ivrit-ai, la deteccion de idioma se degrada y el modelo esta pensado para audio mayoritariamente en hebreo, por lo que su uso en otros idiomas puede dar resultados pobres.
- Limitacion de ventana: Whisper procesa audio en tramos de 30 segundos, por lo que la transcripcion de audio largo requiere segmentacion previa.
- Riesgo de alucinacion: los modelos de la familia Whisper pueden generar texto plausible durante silencios o segmentos con ruido; conviene validar el resultado en produccion.
- Licencia: apache-2.0, lo que permite uso comercial, pero se recomienda verificar que las condiciones del modelo de origen (openai/whisper-large-v3 y el ajuste de ivrit.ai) se respetan en cadena.
- Sin garantias de mantenimiento: al no haber actividad ni metadatos de pipeline, no hay indicios de soporte o actualizaciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Hezi1991/ivrit-whisper-large-v3-ggml-q8
- Modelo de origen (ajuste en hebreo): https://huggingface.co/ivrit-ai/whisper-large-v3
- Variante turbo de ivrit-ai: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo
- Pagina de ivrit.ai: https://www.ivrit.ai/en/
- Articulo de ivrit.ai sobre el ajuste de Whisper: https://www.ivrit.ai/en/2025/02/13/training-whisper/
- Ficha de ivrit-ai/whisper-large-v3 en Inferix: https://inferix.co/models/ivrit-ai/whisper-large-v3
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-large-v3
