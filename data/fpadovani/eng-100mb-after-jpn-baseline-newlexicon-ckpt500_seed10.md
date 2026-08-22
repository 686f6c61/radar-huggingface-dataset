# fpadovani/eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed10

## Resumen

`fpadovani/eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed10` es un modelo de generación de texto basado en la arquitectura GPT-2, con 124,7 millones de parámetros, desarrollado por fpadovani (Universidad de Groningen). Se trata de un checkpoint intermedio de un experimento de aprendizaje de idiomas: el modelo se ha entrenado primero sobre un corpus en japonés (el modelo base `ppt-art-lang-newlexicon-jpn-baseline-100mb_seed10`) y posteriormente se ha ajustado con supervisión (SFT) sobre datos en inglés. El objetivo parece ser estudiar la transferencia de conocimiento entre idiomas y el impacto de un nuevo léxico en el aprendizaje secuencial.

El modelo es parte de un proyecto de investigación sobre el aprendizaje de lenguas en modelos de lenguaje pequeños. Su relevancia radica en ser una pieza de un estudio académico, no en su utilidad práctica inmediata. El tamaño de contexto no se especifica en la documentación disponible, aunque al ser GPT-2 se asume típicamente 1024 tokens, pero no está confirmado. El repositorio contiene pesos en formato safetensors y está diseñado para usarse con la librería Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, se podria cuantizar con herramientas externas) |
| Idiomas soportados | no disponible (nombre sugiere ingles, pero sin confirmacion) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de GPT-2: un transformer decoder-only con 12 capas, 12 cabezas de atención y una dimensión oculta de 768. Tiene 124 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños, adecuados para experimentos de investigación. No se han publicado detalles sobre el dataset de entrenamiento, pero el nombre del modelo indica que se usó un corpus en inglés de aproximadamente 100 MB tras un entrenamiento previo en japonés con el mismo volumen. El ajuste se realizó mediante SFT (supervised fine-tuning) usando la librería TRL, como se indica en la model card.

La innovación técnica no se describe explícitamente; el interés principal es el estudio del orden de entrenamiento entre idiomas y el uso de un "nuevo léxico" (newlexicon) en el modelo base. No se mencionan técnicas como decodificación especulativa ni attention lineal.

## Capacidades

- Generación de texto libre: puede producir respuestas a partir de prompts de usuario, como se muestra en el ejemplo de la model card.
- Interfaz de chat: el código de ejemplo usa `pipeline` con mensajes de rol `user`, lo que sugiere soporte para conversación multi-turno (aunque no está confirmado).
- Capacidades de razonamiento y codigo: no hay evidencia de que las tenga; es un modelo pequeño sin datos de evaluacion.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: el entrenamiento secuencial en japones e ingles sugiere que puede generar en ambos idiomas, pero no hay pruebas documentadas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en transferencia de aprendizaje entre idiomas: este modelo es un artefacto de investigacion para estudiar como el aprendizaje previo en japones afecta al rendimiento en ingles. Un investigador podria comparar sus respuestas con las de un modelo entrenado solo en ingles para medir el impacto del orden de entrenamiento.
- Evaluacion de modelos pequenos en tareas de generacion conversacional: con 124M de parametros, es util para estudiar los limites de los modelos pequenos en dialogos multi-turno, aunque no para produccion.
- Experimentos de alineacion y SFT: al estar entrenado con TRL, sirve como ejemplo de como aplicar SFT a un modelo base, para quienes quieran reproducir el flujo de trabajo.
- Generacion de texto con prompts especificos: puede usarse para generar respuestas a preguntas abiertas, como la del ejemplo, en entornos de investigacion o prototipado.
- Comparacion de arquitecturas pequenas: sirve como referencia para comparar con otros modelos de 124M (GPT-2, DistilGPT2) en tareas de generacion.
- Desarrollo de tecnicas de adaptacion a nuevos lexicos: el modelo base incluye un "newlexicon", lo que permite estudiar como se adapta el modelo a un vocabulario ampliado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 124M de parametros, en FP32 ocupa unos 500 MB, en FP16 unos 250 MB. Con cuantizacion Q8 podria caber en ~125 MB. Cualquier GPU con al menos 2 GB de VRAM puede ejecutarlo.
- GPUs recomendadas: cualquier GPU moderna, desde una NVIDIA GTX 1650 hasta una RTX 4090. Tambien se puede ejecutar en CPU con memoria suficiente.
- Compatibilidad con GPUs de consumo: si, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: se puede usar con Transformers (pipeline), vLLM, llama.cpp (si se convierte a GGUF), o servicios como FriendliAI (aparece en las busquedas).
- Latencia y throughput: no hay datos medidos; en una GPU moderna la generacion de 128 tokens deberia tomar menos de un segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fpadovani/eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed10 | 124M | no disponible | no disponible | HuggingFace |
| GPT-2 (124M) | 124M | 1024 tokens | MIT | HuggingFace |
| DistilGPT2 | 82M | 1024 tokens | MIT | HuggingFace |

No hay datos de benchmarks para comparar rendimiento. La principal diferencia es el proceso de entrenamiento secuencial en japones e ingles, que no existe en los modelos de referencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado sesgos; al ser un modelo pequeño entrenado con datos limitados, es probable que tenga sesgos asociados al corpus de entrenamiento.
- Riesgo de alucinacion: alto, especialmente en temas fuera del dominio del corpus (100 MB de texto en japones e ingles).
- Limitaciones de contexto: no se confirma la longitud de contexto; si es GPT-2 estandar, 1024 tokens, lo que limita conversaciones largas.
- Limitaciones de idioma: el modelo no documenta idiomas soportados; aun que el nombre sugiere ingles, el entrenamiento previo en japones puede afectar la calidad.
- Restricciones de licencia: la licencia no esta especificada, lo que impide su uso comercial sin confirmacion legal.
- Advertencias para produccion: no es un modelo apto para produccion; es un experimento de investigacion sin evaluaciones de seguridad ni rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed10
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-jpn-baseline-100mb_seed10
- Log de entrenamiento (W&B): https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/xbxgximp
- Referencia a TRL: https://github.com/huggingface/trl
