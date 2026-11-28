# proofbird/gector-bert-en

## Resumen

`gector-bert-en` es un modelo de corrección gramatical del inglés (Grammatical Error Correction, GEC) desarrollado por Proofbird, el equipo detrás de la aplicación de asistencia de escritura del mismo nombre. Se trata de un tagger de secuencias de estilo GECToR construido sobre el encoder `google-bert/bert-base-cased`, exportado a ONNX en fp32 para ejecutarse en CPU, lo que lo hace apto para inferencia en dispositivo (on-device) sin GPU ni clave de API.

El modelo no reescribe texto: para cada token predice una etiqueta de edición (mantener, borrar, reemplazar por una palabra, añadir una palabra, cambiar mayúsculas o cambiar forma verbal) y aplica las ediciones de forma iterativa, re-etiquetando la frase hasta cinco veces. Esta aproximación conservadora evita parafraseos y permite devolver sugerencias con posición de carácter exacta sobre el texto del usuario, lo que facilita integrarlo en editores y correctores.

La versión 2.0.0 (run `2026-11-22-2313`) se entrenó exclusivamente con datos sintéticos: 3,25 millones de frases procedentes de Wikipedia en inglés, Europarl v10 y Tatoeba, corrompidas con reglas de error escritas a mano. El modelo está publicado bajo licencia Apache-2.0 y su relevancia actual reside en ofrecer corrección gramatical de calidad en local, con privacidad por diseño y sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) con cabeza de etiquetado de secuencias GECToR (990 etiquetas de edición) y cabeza de detección de errores |
| Parametros totales | no disponible (base: `bert-base-cased`, ~110 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | no disponible (exportación publicada en ONNX fp32; no se documentan otras precisiones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp32); repositorio de 0,9 GB |
| Libreria | onnx (ONNX Runtime) |
| Pipeline | token-classification |
| Dataset de entrenamiento | wikimedia/wikipedia (`20231101.en`), Europarl v10, Tatoeba (datos sintéticos derivados) |
| Version publicada | v2.0.0 (run `2026-11-22-2313`) |

## Arquitectura y entrenamiento

El modelo sigue la receta GECToR: un encoder BERT (`bert-base-cased`) sobre el que se montan una cabeza de etiquetado con 990 etiquetas de edición y una cabeza auxiliar de detección de errores. En inferencia, el sistema predice una etiqueta por token, aplica las ediciones resultantes y vuelve a etiquetar la frase modificada, hasta un máximo de cinco iteraciones. Las etiquetas cubren mantener, borrar, reemplazar por vocabulario, añadir palabra, cambiar capitalización y cambiar forma verbal. El modelo solo propone ediciones locales; no parafrasea ni reordena el texto.

El entrenamiento es completamente sintético: 3,25 millones de frases (1,5 M de Wikipedia en inglés, 1,5 M de Europarl v10 anterior a junio de 2011 y 250 000 de Tatoeba) corrompidas mediante reglas de error escritas a mano, con aproximadamente un error por frase y cerca del 10 % de frases dejadas intactas para que el modelo aprenda a no tocar texto correcto. Las reglas solo reemplazan o duplican palabras, nunca eliminan, por lo que el modelo no aprende a insertar palabras. Se añadieron frases reales con patrones específicos (there/they're/you're, its/it's, than tras comparativo, plurales irregulares, imperativos), 8 139 frases de plantilla para formas poco frecuentes y 150 000 frases de plantilla adicionales para preguntas, imperativos, primera y segunda persona, sustantivos colectivos y de masa, y errores en cláusulas posteriores. No se documenta RLHF ni DPO.

## Capacidades

- Corrección de concordancia sujeto-verbo (`The results shows` → `show`).
- Corrección de tiempos verbales y participios (`have went` → `have gone`).
- Uso de `a`/`an` y plurales irregulares (`mouses` → `mice`, `knifes` → `knives`).
- Resolución de confundibles (`their`/`there`/`they're`, `your`/`you're`, `its`/`it's`, `then`/`than`, `to`/`too`).
- Detección de palabras duplicadas y capitalización al inicio de frase.
- Corrección en registro cotidiano: preguntas, imperativos, primera y segunda persona (`Does the machines work` → `Do`, `Opens the window` → `Open`).
- Detección de un único error en frases largas con una tasa similar a la de frases cortas.
- Compatibilidad con inglés americano y británico: no corrige ortografía (`colour`/`color`, `organise`/`organize`, `theatre`/`theater` se dejan intactos) y respeta el verbo plural con sustantivos colectivos (`The team are playing`).
- Salida estructurada de sugerencias con `start`, `length`, `original` y `replacement` sobre el texto del usuario.
- Ejecución en CPU mediante ONNX Runtime, sin GPU ni clave de API.

## Casos de uso

- Corrección gramatical en editores de texto y procesadores de texto: el modelo devuelve posiciones de carácter exactas, lo que permite subrayar el error y ofrecer la corrección en línea sin reescribir el documento.
- Asistentes de escritura on-device: al ejecutarse en CPU con ONNX Runtime, puede integrarse en aplicaciones de escritorio o extensiones de navegador donde el texto no debe salir del dispositivo, cumpliendo requisitos de privacidad.
- Revisión de textos académicos y profesionales en inglés: corrige concordancia, tiempos verbales y confundibles en frases largas, útil como primera pasada antes de una revisión humana.
- Preprocesado de corpus y datasets: limpieza gramatical de texto inglés (reseñas, foros, transcripciones) antes de alimentar pipelines de NLP, con la ventaja de que no parafrasea y preserva el contenido original.
- Herramientas educativas de aprendizaje de inglés: las sugerencias estructuradas permiten mostrar al estudiante qué palabra cambiar y por cuál, con explicación implícita del error.
- Corrección en aplicaciones de mensajería y correo: al ser ligero y ejecutarse en CPU, puede corregir borradores en tiempo real en clientes de correo o chats sin latencia de red.
- Verificación de calidad en pipelines de generación de contenido: detectar errores gramaticales en texto generado por otros modelos antes de publicarlo, sin alterar el estilo ni el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo se distribuye en ONNX fp32 y está diseñado para ejecutarse en CPU con ONNX Runtime, sin GPU.
- VRAM estimada: no aplica para la ruta CPU; en GPU, el tamaño del repositorio (0,9 GB) sugiere un consumo de memoria moderado, aunque no se documentan requisitos oficiales.
- GPU recomendadas: no disponibles; el modelo no las requiere.
- Cabe en GPU de consumo: sí, por tamaño (base BERT ~110 M de parámetros), aunque la ruta oficial es CPU.
- Opciones de despliegue: ONNX Runtime (ruta documentada), con `onnxruntime`, `tokenizers` y `huggingface_hub`; se incluye `quickstart.py` y un notebook de Colab. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| proofbird/gector-bert-en | ~110 M (base BERT) | no disponible | GECToR sobre BERT, ONNX CPU | Apache-2.0 | Hugging Face |
| Modelos GEC basados en T5 (p. ej. variantes de Happy Transformer) | no disponible | no disponible | Seq2seq (reescritura) | variable | Hugging Face |
| Grammarly (servicio propietario) | no disponible | no disponible | Propietario, en nube | propietaria | SaaS |
| LanguageTool | no disponible | no disponible | Reglas + modelos, local/servidor | LGPL/propietaria | Local y SaaS |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo corrige inglés; no soporta otros idiomas.
- No corrige ortografía: deja intactas variantes como `colour`/`color` u `organise`/`organize`, que deben gestionarse con un corrector ortográfico aparte.
- Las reglas de corrupción solo reemplazan o duplican palabras, nunca eliminan, por lo que el modelo no aprende a insertar palabras ausentes.
- El modelo solo propone ediciones locales y no parafrasea; no corrige problemas de estilo, estructura oracional ni coherencia global.
- Riesgo de alucinación bajo en el sentido generativo (no genera texto libre), pero puede proponer ediciones incorrectas en contextos ambiguos o poco representados.
- Entrenado exclusivamente con datos sintéticos derivados de Wikipedia, Europarl y Tatoeba; puede tener sesgos de dominio y de registro asociados a esas fuentes.
- No se documentan evaluaciones con benchmarks estándar (BEA-2019, CoNLL-2014), por lo que el rendimiento real en producción no está cuantificado públicamente.
- La longitud de contexto no está confirmada en la información; se hereda de BERT base, lo que limita el procesamiento de documentos largos sin segmentación.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda verificar las condiciones de los datos de entrenamiento derivados (Wikipedia, Europarl, Tatoeba) para usos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-en
- Demo en el navegador (Hugging Face Space): https://huggingface.co/spaces/proofbird/try-grammar
- Notebook de inicio rápido (Colab): https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-en/blob/main/quickstart.ipynb
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Aplicación Proofbird: https://proofbird.app
- Tag de versión v2.0.0: https://huggingface.co/proofbird/gector-bert-en/tree/v2.0.0
