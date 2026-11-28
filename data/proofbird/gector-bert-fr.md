# proofbird/gector-bert-fr

## Resumen

`gector-bert-fr` es un modelo de corrección gramatical del francés desarrollado por Proofbird, el equipo detrás de la aplicación de asistencia de escritura del mismo nombre. Se trata de un etiquetador de secuencias de estilo GECToR construido sobre el encoder `Geotrend/bert-base-fr-cased` (una reducción francesa de mBERT), exportado a ONNX en fp32 para ejecutarse íntegramente en CPU. Su propósito es detectar y corregir errores gramaticales locales en texto francés sin reescribir ni parafrasear la frase original.

La relevancia del modelo reside en su enfoque on-device: el texto del usuario nunca abandona la máquina, lo que lo hace adecuado para aplicaciones de escritura con requisitos de privacidad estrictos. El modelo se publica en Hugging Face para que cualquiera pueda inspeccionar lo que se ejecuta en su equipo. La versión actual es la 2.0.0 (receta de entrenamiento de noviembre de 2026), con el tag `v2.0.0` fijado para la aplicación Proofbird.

El modelo no genera texto nuevo: para cada token predice una etiqueta de edición (mantener, borrar, reemplazar, añadir, cambiar mayúsculas, cambiar terminación, restaurar acento) y aplica las ediciones de forma iterativa hasta cinco veces. El repositorio ocupa 1,3 GB e incluye los pesos ONNX, el tokenizador y el script de arranque rápido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) con cabeza de etiquetado de secuencias GECToR (1 995 etiquetas de edición) y cabeza de detección de errores |
| Parametros totales | no disponible (modelo base BERT-base, aproximadamente 110 M en el encoder; el total con cabezas no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo BERT-base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | ONNX fp32 (única variante publicada) |
| Idiomas soportados | francés (fr) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp32); tokenizador compatible con la librería `tokenizers` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GECToR: un encoder BERT-base en francés (`Geotrend/bert-base-fr-cased`) al que se añaden dos cabezas, una de etiquetado de ediciones con 1 995 etiquetas y otra de detección de errores. La inferencia es iterativa: se predice una etiqueta por token, se aplican las ediciones y se vuelve a etiquetar la frase resultante hasta un máximo de cinco pasadas. El tagger solo propone ediciones locales; nunca parafrasea ni reordena el texto.

El entrenamiento es exclusivamente sintético, con 3 250 000 frases de tres fuentes: 1 500 000 de Wikipedia francesa (`wikimedia/wikipedia`, `20231101.fr`), 1 500 000 de los proceedings del Parlamento Europeo (Europarl v10, sesiones anteriores a junio de 2011) y 250 000 de Tatoeba. Las frases se corrompieron con reglas de error escritas a mano en francés, en su mayoría un error por frase independientemente de su longitud; aproximadamente el 10 % se dejan limpias para que el modelo aprenda a no tocar texto correcto. Cada regla se validó contra el texto limpio y se leyó en frases reales antes de aplicarse; por ejemplo, una palabra se trata como adjetivo solo cuando el texto lo evidencia (lexicón de 2 314 adjetivos construido a partir del corpus) y el número de un verbo solo se cambia contra un sujeto visible (nunca tras `qui`).

## Capacidades

- Corrección de concordancia sujeto-verbo, incluso con sujeto nominal alejado del verbo (`Les enfants joue` → `jouent`, `Le programme doivent changer` → `doit`).
- Corrección de la persona de `être` y `avoir` tras pronombre (`Nous est arrivés` → `sommes`, `Vous a raison` → `avez`).
- Concordancia de género y número en adjetivos y participios pasados, incluidos femeninos irregulares (`Les filles sont fatigué` → `fatiguées`, `La voiture était très vieux` → `vieille`).
- Corrección del género del artículo (`le voiture` → `la`, `dans la cadre` → `le`).
- Contracción de preposiciones (`à le` → `au`, `de le` → `du`) y elisión (`le arbre` → `l'arbre`).
- Restauración y corrección de acentos (`decisions` → `décisions`, `l'hotel` → `l'hôtel`, `inquiéte` → `inquiète`, `Voila` → `Voilà`).
- Desambiguación de homófonos que difieren por acento o letra (`a`/`à`, `ou`/`où`, `et`/`est`, `on`/`ont`).
- Detección de palabras y artículos duplicados (`la la porte`).
- Capitalización al inicio de frase.
- Devuelve sugerencias con posición de carácter (`start`, `length`), texto original y reemplazo, lo que permite subrayar y ofrecer la corrección en una interfaz.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un corrector local, no un agente.
- Respeta las grafías que el francés admite de ambas formas desde 1990 (`connaitre`/`connaître`, `évènement`/`événement`).

## Casos de uso

- Asistente de escritura integrado en el navegador o en el sistema operativo: el modelo corre en CPU vía ONNX Runtime y el texto no sale del dispositivo, lo que permite ofrecer corrección gramatical en tiempo real en un editor sin enviar contenido a un servidor.
- Revisión de correos y documentos profesionales en francés: detecta concordancias, acentos y homófonos en frases largas (encuentra un error único en una frase de 40 palabras o más casi con la misma frecuencia que en una corta), adecuado para textos administrativos y de negocios.
- Preprocesado de corpus franceses para NLP: limpieza de errores gramaticales y de acentuación en textos de usuarios (foros, reseñas, redes sociales) antes de alimentar pipelines de análisis o entrenamiento.
- Corrección en entornos educativos: al devolver sugerencias con posición y reemplazo, permite construir ejercicios interactivos que muestran el error y la corrección sin reescribir la frase del alumno.
- Integración en aplicaciones de mensajería o suites ofimáticas con requisitos de privacidad (RGPD): al ejecutarse on-device en CPU, no requiere GPU ni conexión, lo que simplifica el despliegue y el cumplimiento normativo.
- Verificación de textos generados o traducidos al francés: como paso de control de calidad para detectar errores de concordancia y acentos en contenido producido automáticamente antes de publicarlo.
- Corrección de subtítulos y transcripciones: el modelo se entrenó con Europarl (registro oral, primera y segunda persona, preguntas y argumentación), lo que lo hace adecuado para discurso hablado transcrito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo se exporta a ONNX fp32 y está diseñado para ejecutarse en CPU sin GPU; el repositorio ocupa 1,3 GB.
- VRAM estimada: no aplica en el caso previsto (CPU); en GPU, un BERT-base en fp32 requiere aproximadamente 0,5-1 GB de VRAM, aunque no se detalla en la información.
- GPU recomendadas: no disponibles; el modelo no las requiere.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 1-2 GB de VRAM podría ejecutarlo, aunque el diseño apunta a CPU.
- Opciones de despliegue: ONNX Runtime (previsto), con el script `quickstart.py` incluido; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros correctores gramaticales del francés (por ejemplo, modelos basados en seq2seq o LLM) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solo corrige errores locales: no reescribe, no parafrasea ni reordena el texto; errores que requieren reformulación global quedan fuera de su alcance.
- Entrenamiento exclusivamente sintético: los errores se generan con reglas escritas a mano, por lo que la distribución de errores reales puede diferir y algunos tipos de error no cubiertos por las reglas podrían no detectarse.
- Idioma único: solo francés; no soporta otros idiomas.
- Riesgo de falsos positivos: aunque el 10 % de frases limpias en entrenamiento busca que aprenda a no tocar texto correcto, puede proponer correcciones innecesarias en usos admisibles o registros informales.
- Respeta las grafías alternativas de 1990, pero puede no cubrir todas las variantes regionales o estilísticas del francés.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no se indican restricciones adicionales.
- Al ser un modelo on-device sin API, la integración requiere gestionar el tokenizador, el runtime ONNX y la aplicación iterativa de ediciones; el script de arranque rápido facilita la puesta en marcha, pero no se documentan garantías de latencia en producción.
- No dispone de modo de razonamiento, tool calling ni capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-fr
- Tag de la versión: https://huggingface.co/proofbird/gector-bert-fr/tree/v2.0.0
- Demo en el navegador (Hugging Face Space): https://huggingface.co/spaces/proofbird/try-grammar
- Cuaderno de arranque rápido (Colab): https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-fr/blob/main/quickstart.ipynb
- Script `quickstart.py`: https://huggingface.co/proofbird/gector-bert-fr/blob/main/quickstart.py
- Modelo base: https://huggingface.co/Geotrend/bert-base-fr-cased
- Dataset de Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Aplicación Proofbird: https://proofbird.app
