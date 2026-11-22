# proofbird/gector-bert-no

## Resumen

`gector-bert-no` es un modelo de corrección gramatical (GEC) para noruego bokmål desarrollado por Proofbird, el equipo detrás de una aplicación de asistencia a la escritura para Windows. Se trata de un etiquetador de secuencias de estilo GECToR construido sobre el encoder NB-BERT del National Library of Norway (`NbAiLab/nb-bert-base`) y exportado a ONNX en fp32 para ejecutarse en CPU, sin GPU ni conexión de red. Su propósito es detectar y corregir errores locales de gramática y ortografía en tiempo real en el propio dispositivo del usuario.

A diferencia de los modelos generativos de corrección, GECToR no reescribe el texto: para cada token predice una etiqueta de edición (mantener, borrar, reemplazar, añadir, cambiar mayúsculas, cambiar terminación, restaurar diacríticos) y aplica las ediciones de forma iterativa hasta cinco pasadas. Esto lo hace determinista, rápido y auditable, y evita parafraseos no deseados. El modelo cubre exclusivamente bokmål: no trata nynorsk, que es otro estándar escrito.

El modelo se publica con licencia CC BY 4.0 y un tamaño de repositorio de 0,7 GB. Resulta relevante para quien necesite corrección gramatical noruega de baja latencia, privacidad estricta (el texto no sale del dispositivo) y despliegue sencillo mediante ONNX Runtime, sin dependencias de infraestructura GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (NB-BERT) con cabeza de etiquetado de ediciones GECToR (581 etiquetas) y cabeza de detección de errores |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa por frases; el ejemplo de la model card usa frases individuales) |
| Tipos de cuantización | fp32 (exportación ONNX publicada); no se documentan otras |
| Idiomas soportados | nb (bokmål), no |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (fp32); repo de 0,7 GB |

## Arquitectura y entrenamiento

El modelo parte del encoder `NbAiLab/nb-bert-base` (NB-BERT, National Library of Norway, CC BY 4.0) y añade dos cabezas: una de etiquetado de ediciones con 581 etiquetas y otra de detección de errores. La inferencia sigue el esquema GECToR: se predice una etiqueta por token, se aplican las ediciones, se re-etiqueta la frase y se repite hasta cinco iteraciones. Las ediciones son estrictamente locales (inserción, borrado, sustitución, cambio de caso, cambio de terminación, restauración de diacríticos), por lo que el modelo nunca reformula ni parafrasea.

El entrenamiento es exclusivamente sintético. Se usaron 3 000 000 de frases de Wikipedia en bokmål (`wikimedia/wikipedia`, `20231101.no`) y 9 157 frases de Tatoeba, corrompidas con reglas de error escritas a mano en noruego, en su mayoría un error por frase; alrededor del 10 % se dejan limpias para que el modelo aprenda a no tocar texto correcto. Cada regla se validó previamente sobre texto real para descartar corrupciones que también son noruego correcto (por ejemplo, `får` sin su marca es `far`, otra palabra, así que ese par nunca se enseña). Se añadieron frases reales con patrones relevantes y 150 000 frases de plantilla; una de cada siete frases de entrenamiento carece de punto final. No se usaron corpus de aprendices ni datos de usuario. El ajuste consistió en una época (134 139 pasos, batch 64, learning rate 3e-5) sobre una NVIDIA L4, con run id `2026-11-22-0011`.

## Capacidades

- Corrección de errores locales de gramática y ortografía en noruego bokmål: concordancia de género y número en adjetivos, uso de `en`/`et`, formas verbales (presente, infinitivo tras modal), `og` frente a `å`, compuestos escritos separados, confusiones léxicas cerradas (`hvert`/`vært`, `vær`/`hver`, `ligger`/`legger`), diacríticos ausentes (`æ`, `ø`, `å`), palabras duplicadas y mayúscula inicial de frase.
- Salida estructurada con sugerencias: cada corrección incluye posición de carácter (`start`, `length`), texto original y reemplazo, apta para subrayado y aplicación selectiva en un editor.
- Detección de errores mediante cabeza dedicada, además del etiquetado de ediciones.
- Procesamiento por frases, tolerante a la ausencia de punto final.
- Ejecución en CPU vía ONNX Runtime, sin GPU ni clave de API.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento; no es un modelo generativo.

## Casos de uso

- Asistente de escritura de escritorio: integración en editores de Windows o aplicaciones nativas que necesiten corrección gramatical en tiempo real sin enviar el texto a la nube, gracias a la exportación ONNX y la ejecución en CPU.
- Privacidad y cumplimiento normativo: procesamiento de documentos con datos personales o sensibles en noruego bokmål donde el texto no puede salir del dispositivo, algo que el modelo garantiza por diseño.
- Corrección en aplicaciones web del lado del cliente: despliegue con ONNX Runtime Web o WASM dentro del navegador, como demuestra el Space de prueba del autor, sin backend ni coste de inferencia por petición.
- Herramientas editoriales y de revisión: preprocesado de textos en bokmål para detectar errores de concordancia y ortografía antes de la revisión humana, con sugerencias posicionadas que el editor puede aceptar o rechazar una a una.
- Enseñanza de noruego: corrección de ejercicios de estudiantes con retroalimentación localizada por carácter, útil en aplicaciones de aprendizaje de idiomas que necesitan latencia baja y funcionamiento sin conexión.
- Integración en pipelines de control de calidad de contenido: filtrado o marcado de textos generados o introducidos por usuarios en bokmål, con salida determinista y sin riesgo de reescritura del contenido original.
- Aplicaciones móviles y de bajo consumo: al ser ONNX fp32 en CPU y sin dependencias pesadas, puede empaquetarse en aplicaciones de escritorio o móviles con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está exportado para ejecución en CPU con ONNX Runtime.
- GPU recomendadas: ninguna necesaria para inferencia; el entrenamiento se realizó en una NVIDIA L4.
- Cabe en GPU de consumo: sí, aunque el despliegue previsto es en CPU; el repo completo ocupa 0,7 GB.
- Opciones de despliegue: ONNX Runtime (Python, Web/WASM), con dependencias `onnxruntime`, `tokenizers` y `huggingface_hub`; se incluye `quickstart.py` y un cuaderno de Colab. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `proofbird/gector-bert-no` | GECToR sobre NB-BERT, ONNX fp32 | nb, no | no disponible | CC BY 4.0 | Hugging Face, Space de prueba |
| `NbAiLab/nb-bert-base` | Encoder BERT base (modelo base, no corrector) | nb, no | no disponible | CC BY 4.0 | Hugging Face |
| Correctores generativos multilingües (p. ej. modelos tipo seq2seq) | Generativos | multilingüe | variable | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La diferencia principal frente a un corrector generativo es que este modelo solo propone ediciones locales y no reescribe el texto, lo que reduce el riesgo de cambios no deseados pero limita la corrección a errores locales.

## Limitaciones y advertencias

- Solo cubre bokmål; no corrige nynorsk ni otros estándares escritos del noruego.
- Solo realiza ediciones locales: no detecta ni corrige errores que requieran reestructurar la frase, y nunca parafrasea.
- Entrenado exclusivamente con datos sintéticos generados por reglas; puede no cubrir errores reales de aprendices que no se correspondan con los patrones enseñados.
- Riesgo de falsos positivos en construcciones correctas poco frecuentes, aunque se incluyeron frases correctas con formas propensas a confusión y un 10 % de frases limpias.
- El alcance de corrección está acotado a las categorías descritas (concordancia, `en`/`et`, formas verbales, `og`/`å`, compuestos, confusiones léxicas cerradas, diacríticos, duplicados, mayúscula inicial); errores fuera de ese conjunto no se abordan.
- Licencia CC BY 4.0: permite uso comercial con atribución; debe conservarse la atribución al autor y al modelo base NB-BERT.
- La versión publicada corresponde al tag `v1.0.0` (run `2026-11-22-0011`); conviene fijar `revision="v1.0.0"` para reproducibilidad.
- No se han publicado métricas de precisión, recall ni tasas de falsos positivos, por lo que la evaluación en producción debe hacerse con datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-no
- Space de prueba en el navegador: https://huggingface.co/spaces/proofbird/try-grammar
- Cuaderno de inicio rápido: https://huggingface.co/proofbird/gector-bert-no/blob/main/quickstart.ipynb
- Script de inicio rápido: https://huggingface.co/proofbird/gector-bert-no/blob/main/quickstart.py
- Tag de versión: https://huggingface.co/proofbird/gector-bert-no/tree/v1.0.0
- Modelo base NB-BERT: https://huggingface.co/NbAiLab/nb-bert-base
- Dataset de Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Aplicación Proofbird: https://proofbird.app
