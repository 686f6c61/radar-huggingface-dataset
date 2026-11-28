# proofbird/gector-bert-pt-br

## Resumen

`gector-bert-pt-br` es un modelo de corrección gramatical para portugués de Brasil desarrollado por Proofbird, pensado para ejecutarse en el propio dispositivo del usuario (on-device) sin enviar texto a ningún servidor. Se trata de un etiquetador de secuencias de estilo GECToR construido sobre el encoder BERTimbau (`neuralmind/bert-base-portuguese-cased`) y exportado a ONNX en fp32 para inferencia en CPU. No reescribe ni parafrasea el texto: para cada token predice una etiqueta de edición (mantener, borrar, reemplazar, añadir, cambiar mayúsculas, cambiar forma verbal, restaurar acento) y aplica las ediciones de forma iterativa hasta cinco veces.

El modelo forma parte de Proofbird, un asistente de escritura que funciona en cualquier aplicación, y se publica para que cualquiera pueda inspeccionar qué se ejecuta en su máquina. Corrige concordancia sujeto-verbo, concordancia de género y número, artículos, contracciones, crasis, acentos y diacríticos, plurales de palabras terminadas en `-ão`, palabras duplicadas y mayúsculas al inicio de frase. Está entrenado exclusivamente con datos sintéticos generados a partir de reglas de error escritas a mano sobre texto real en portugués de Brasil.

La relevancia actual del modelo reside en su enfoque de despliegue: un único archivo ONNX de aproximadamente 0,9 GB de repositorio, sin necesidad de GPU ni clave de API, con una demo ejecutable en el navegador. La versión 2.0.0 (noviembre de 2026) incorpora una segunda fuente de corpus oral (discursos parlamentarios) junto a Wikipedia, además de pares de entrenamiento dirigidos y, en su mayoría, un solo error por frase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau base) con cabeza de etiquetado de ediciones (1 556 etiquetas) y cabeza de detección de errores, estilo GECToR |
| Parametros totales | no disponible (modelo base BERT base: ~110 M; el total con cabezas no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo BERT base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | exportación ONNX en fp32; no se documentan otras cuantizaciones |
| Idiomas soportados | portugués (pt), específicamente portugués de Brasil |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma GECToR: un encoder BERT (`neuralmind/bert-base-portuguese-cased`, licencia MIT) sobre el que se montan una cabeza de etiquetado con 1 556 etiquetas de edición y una cabeza de detección de errores. En lugar de generar texto nuevo, el modelo predice para cada token una edición local; las ediciones se aplican y la frase se vuelve a etiquetar hasta cinco veces. Esta restricción a ediciones locales evita la paráfrasis y hace que el modelo sea adecuado para sugerencias puntuales con posición de carácter (`start`, `length`), texto original y reemplazo.

El entrenamiento usa exclusivamente datos sintéticos: 3 250 000 frases de tres fuentes. 1 500 000 provienen de Wikipedia en portugués (`wikimedia/wikipedia`, `20231101.pt`), filtrando solo artículos cuya ortografía y uso los identifican como brasileños. Otras 1 500 000 proceden de discursos de plenario de la Cámara de Diputados de Brasil (datos abiertos, 2015 a finales de 2024), que aportan primera y segunda persona, preguntas, argumentación y frases largas. Las 250 000 restantes vienen de Tatoeba (brasileñas o sin marca). Se excluyeron frases con ortografía anterior al acuerdo de 1990, de modo que el modelo aprende una única dirección: ortografía antigua a nueva. La corrupción se hizo con reglas de error portuguesas escritas a mano, en su mayoría un error por frase independientemente de su longitud, dejando cerca del 10 % de frases limpias para que el modelo aprenda a no tocar texto correcto.

## Capacidades

- Corrección de concordancia sujeto-verbo, incluso con sujeto nominal (`As crianças brinca` → `brincam`).
- Corrección de concordancia de género y número en artículos, adjetivos y participios.
- Corrección de género de artículos (`um casa` → `uma casa`).
- Resolución de contracciones (`de o` → `do`, `em a` → `na`).
- Corrección de crasis (`Vou a praia` → `à praia`).
- Restauración de acentos y diacríticos (`esta cansada` → `está cansada`, `Voce` → `Você`).
- Corrección del plural de sustantivos terminados en `-ão` (`informaçãos` → `informações`).
- Eliminación de palabras duplicadas (`Me passa o o sal` → `o sal`).
- Capitalización al inicio de frase.
- Detección de errores en frases largas (40 palabras o más) con una tasa cercana a la de frases cortas.
- Generación de sugerencias con posición de carácter, texto original y reemplazo, aptas para subrayado e inserción en editores.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- No soporta visión ni audio.
- Capacidad multilingüe limitada al portugués; deja intacta la ortografía y el uso europeos.

## Casos de uso

- Asistente de escritura integrado en el navegador: el modelo ONNX se ejecuta en CPU y el texto nunca sale de la página, lo que permite ofrecer corrección gramatical en tiempo real en un editor web sin cumplir requisitos de privacidad de datos en servidor.
- Corrección en aplicaciones de escritorio y móviles: al ser un único archivo ONNX de ~0,9 GB y no requerir GPU, puede empaquetarse en apps de procesamiento de textos o clientes de correo para revisar borradores antes de enviarlos.
- Revisión de textos administrativos y periodísticos en portugués de Brasil: el entrenamiento con discursos parlamentarios y Wikipedia cubre registros formales y frases largas, útil para detectar concordancia y crasis en comunicados o notas de prensa.
- Preprocesado en pipelines de NLP: las sugerencias con posición de carácter permiten aplicar correcciones antes de tareas posteriores como análisis de sentimiento, indexación o traducción automática, sin reescribir el texto original.
- Herramienta educativa de aprendizaje de portugués: al mostrar el error, la posición y el reemplazo, el estudiante ve exactamente qué cambiar y por qué, en lugar de recibir una frase reescrita.
- Filtro de calidad en plataformas de contenido generado por usuarios: integrado en un servicio de publicación de comentarios o foros, subraya errores de concordancia y acentos antes de que el usuario envíe el contenido.
- Demo interactiva y evaluación de modelos: el Space de Hugging Face permite probar el modelo en el navegador sin instalación, útil para comparar su comportamiento con correctores comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo se distribuye en ONNX fp32 y está diseñado para ejecutarse en CPU con ONNX Runtime, sin GPU.
- VRAM estimada: no aplica para el modo previsto (CPU); el repositorio ocupa 0,9 GB, lo que da una idea del espacio en disco y memoria necesarios para cargar los pesos.
- GPU recomendadas: no se documentan; el modelo no está pensado para GPU.
- ¿Cabe en GPU de consumo? Sí, por tamaño (modelo base BERT), aunque el diseño apunta a CPU.
- Opciones de despliegue: ONNX Runtime con el script `quickstart.py` proporcionado; también puede cargarse desde el Space de Hugging Face en el navegador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada para establecer una comparación cuantitativa con alternativas. Como referencia cualitativa, el modelo se sitúa en la categoría de correctores gramaticales GECToR para portugués de Brasil, con despliegue on-device en ONNX y licencia Apache 2.0, frente a correctores comerciales basados en API (que requieren enviar el texto a un servidor) y frente a modelos generativos de corrección (que reescriben el texto en lugar de aplicar ediciones locales). No se dispone de datos de parámetros, contexto ni rendimiento de esas alternativas en esta ficha.

## Limitaciones y advertencias

- Solo corrige errores locales: no reescribe, no parafrasea y no detecta problemas de estilo, coherencia o estructura del discurso.
- Entrenado exclusivamente con datos sintéticos generados por reglas; los errores reales no cubiertos por esas reglas pueden pasar desapercibidos.
- Escrito para portugués de Brasil: deja intacta la ortografía y el uso europeos (`facto`, `equipa`, `autocarro`), por lo que no es adecuado como corrector de portugués europeo.
- Puede dejar intactos nombres repetidos legítimos (`Wagga Wagga`) y no corrige errores que requieran contexto más allá de la ventana del encoder.
- Riesgo de falsos positivos en texto correcto, aunque se entrenó con un ~10 % de frases limpias para mitigarlo.
- No se documentan sesgos específicos; al entrenarse con Wikipedia y discursos parlamentarios brasileños, puede reflejar el registro y las convenciones de esas fuentes.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base BERTimbau (MIT) y de las fuentes de datos (Wikipedia, datos abiertos de la Cámara, Tatoeba) si se redistribuye.
- La longitud de contexto no está documentada; para textos muy largos habrá que segmentar en frases.
- No soporta tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-pt-br
- Demo en el navegador (Space): https://huggingface.co/spaces/proofbird/try-grammar
- Cuaderno de inicio rápido (Colab): https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-pt-br/blob/main/quickstart.ipynb
- Script `quickstart.py`: https://huggingface.co/proofbird/gector-bert-pt-br/blob/main/quickstart.py
- Etiqueta de versión v2.0.0: https://huggingface.co/proofbird/gector-bert-pt-br/tree/v2.0.0
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset Wikipedia en portugués: https://huggingface.co/datasets/wikimedia/wikipedia
- Datos abiertos de la Cámara dos Deputados: https://dadosabertos.camara.leg.br
- Tatoeba: https://tatoeba.org
- Sitio de Proofbird: https://proofbird.app
