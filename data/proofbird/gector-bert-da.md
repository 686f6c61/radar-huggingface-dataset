# proofbird/gector-bert-da

## Resumen

`gector-bert-da` es un modelo de corrección gramatical (GEC) para danés desarrollado por Proofbird, el equipo detrás de la aplicación de escritorio Proofbird para Windows. Se trata de un tagger secuencial de estilo GECToR construido sobre el encoder NB-BERT del National Library of Norway, exportado a ONNX en fp32 para ejecutarse en CPU. Su propósito es la corrección gramatical local en el dispositivo, sin enviar texto del usuario a ningún servidor.

El modelo no reescribe ni parafrasea: para cada token predice una etiqueta de edición (mantener, borrar, reemplazar por una palabra, anexar una palabra, cambiar mayúsculas, cambiar la terminación, restaurar diacríticos) y aplica las ediciones de forma iterativa hasta cinco pasadas. Está entrenado exclusivamente con datos sintéticos generados mediante reglas de error escritas a mano sobre corpus reales daneses (Wikipedia, Europarl y Tatoeba), lo que evita depender de corpus de aprendices y permite publicar el modelo con licencia CC BY 4.0.

La relevancia actual radica en su enfoque on-device: un modelo pequeño (basado en BERT base), cuantificable, con licencia permisiva para uso comercial y con una API de sugerencias que devuelve posiciones de carácter en el texto original, lo que facilita integrarlo en editores y asistentes de escritura sin infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (NB-BERT base) con cabeza de etiquetado de ediciones GECToR (8 000 etiquetas) y cabeza de detección de errores |
| Parametros totales | no disponible (basado en NB-BERT base, ~0,1-0,2 B estimado; no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 en la exportación ONNX publicada; cuantización adicional no documentada |
| Idiomas soportados | danés (da) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (fp32), con `quickstart.py` para inferencia con ONNX Runtime |
| Modelo base | NbAiLab/nb-bert-base |
| Pipeline | token-classification |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo sigue la formulación GECToR: un encoder transformer (NB-BERT base) produce representaciones por token sobre las que se montan dos cabezas, una de detección de errores y otra de etiquetado de ediciones con 8 000 etiquetas posibles. En inferencia, las ediciones se aplican y la frase se re-etiqueta hasta cinco veces. La elección del encoder se hizo por medición: sobre 1 200 pares de frases danesas (una correcta y otra con error), NB-BERT prefirió la correcta el 99,0 % de las veces, el mejor resultado entre los encoders probados.

El entrenamiento usa exclusivamente datos sintéticos: 3 047 281 frases en total, compuestas por 1 500 000 frases de Wikipedia danesa (`wikimedia/wikipedia`, `20231101.da`), 1 500 000 frases de los procedimientos del Parlamento Europeo (Europarl v8 vía OPUS, sesiones anteriores a junio de 2011) y 47 281 frases de Tatoeba. Las corrupciones se generaron con reglas de error danesas escritas a mano, en su mayoría un error por frase, y aproximadamente el 10 % de las frases se dejan limpias para que el modelo aprenda a no tocar texto correcto. Cada regla se validó previamente sobre texto real para evitar patrones que también son danés correcto. Se añadieron 150 000 frases de plantilla y una de cada siete frases de entrenamiento carece de punto final. No se usaron corpus de aprendices, datos no comerciales ni texto de usuarios. El entrenamiento fue de una época (133 378 pasos, batch 64, learning rate 3e-5) en una NVIDIA L4.

## Capacidades

- Corrección de errores gramaticales locales en danés mediante edición token a token, sin parafrasear.
- Distinción de género en artículos y adjetivos (`en`/`et`, concordancia tras `en`/`et`, tras palabra definida y ante sustantivo).
- Concordancia de adjetivos tras `er`/`var`/`bliver` en género y número.
- Corrección de tiempo presente e infinitivo (`Jeg lære dansk` → `lærer`, `at læser` → `læse`).
- Unión de compuestos escritos separados (`jern banen` → `jernbanen`).
- Corrección de terminaciones `-ene` y `-ende`.
- Desambiguación de un conjunto cerrado de palabras confundidas (`ligger`/`lægger`, `nogen`/`nogle`, `af`/`ad`, `end`/`en`, `I`/`i`).
- Restauración de diacríticos ausentes (`æ`, `ø`, `å`).
- Detección de palabras duplicadas y mayúscula al inicio de frase.
- Manejo de frases sin punto final igual que con punto.
- Salida estructurada de sugerencias con posición de carácter (`start`, `length`), texto original y reemplazo.
- No soporta tool calling, agentes, visión, audio ni modo thinking; es un corrector gramatical especializado.

## Casos de uso

- Asistente de escritura de escritorio: integración en un editor de texto en Windows mediante ONNX Runtime en CPU, ofreciendo subrayado y sugerencias con posición exacta de carácter sin enviar el texto a la nube.
- Corrección en aplicaciones web del navegador: el modelo puede ejecutarse en el propio navegador (como demuestra el Space de Proofbird), útil para herramientas de escritura que priorizan privacidad.
- Preprocesado de corpus daneses: limpieza gramatical de textos antes de alimentar pipelines de NLP, aprovechando la salida de sugerencias para auditar cambios.
- Herramientas educativas de danés: corrección de ejercicios de concordancia, tiempos verbales y compuestos con retroalimentación localizada por carácter.
- Procesamiento por lotes en servidores sin GPU: al ser ONNX fp32 y ejecutarse en CPU, permite desplegar corrección masiva de textos en infraestructura económica.
- Integración en correctores ortográficos existentes: la API de sugerencias con `start`/`length`/`original`/`replacement` encaja en editores que ya gestionan subrayados y menús contextuales.
- Filtrado de calidad en plataformas de contenido danés: detección y corrección automática de errores frecuentes en comentarios o formularios antes de su publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación proporcionado es que, sobre 1 200 pares de frases danesas (una correcta y una con error), el encoder NB-BERT prefirió la frase correcta el 99,0 % de las veces, dato usado para seleccionar el encoder base, no como benchmark del modelo final de corrección.

## Requisitos de hardware

- VRAM estimada: no aplica para la inferencia publicada, que es ONNX fp32 en CPU; el repositorio ocupa 0,7 GB.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU.
- Cabe en GPU de consumo: sí, por tamaño, aunque el objetivo declarado es ejecución en CPU y en dispositivo.
- Opciones de despliegue: ONNX Runtime (vía `quickstart.py`), navegador (Space de demostración) y aplicación de escritorio Proofbird.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de corrección gramatical para danés ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solo corrige danés; no soporta otros idiomas.
- Realiza únicamente ediciones locales: no reescribe, parafrasea ni reordena el texto, por lo que no corrige errores que requieran cambios estructurales.
- Entrenado exclusivamente con datos sintéticos; el rendimiento sobre errores reales de aprendices no está documentado en la información disponible.
- Riesgo de falsos positivos en construcciones correctas no cubiertas por las reglas de corrupción, aunque se aplicaron salvaguardas para patrones ambiguos.
- Las reglas cubren un conjunto cerrado de fenómenos (concordancia, tiempos verbales, compuestos, confusables, diacríticos, duplicados, mayúsculas iniciales); errores fuera de ese conjunto no se corrigen.
- Licencia CC BY 4.0: permite uso comercial con atribución; deben respetarse las condiciones de la licencia del modelo base NB-BERT (también CC BY 4.0).
- El modelo base NB-BERT puede arrastrar sesgos presentes en los corpus de entrenamiento (Wikipedia, Europarl, Tatoeba).
- La versión publicada es la 1.0.0 (run `2026-11-20-2352`); se recomienda fijar `revision="v1.0.0"` para reproducibilidad.
- No se documentan límites de longitud de contexto; el uso previsto es por frases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-da
- Versión fijada v1.0.0: https://huggingface.co/proofbird/gector-bert-da/tree/v1.0.0
- Demostración en el navegador: https://huggingface.co/spaces/proofbird/try-grammar
- Quickstart en Colab: https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-da/blob/main/quickstart.ipynb
- Script de inicio rápido: https://huggingface.co/proofbird/gector-bert-da/blob/main/quickstart.py
- Modelo base NB-BERT: https://huggingface.co/NbAiLab/nb-bert-base
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Aplicación Proofbird: https://proofbird.app
