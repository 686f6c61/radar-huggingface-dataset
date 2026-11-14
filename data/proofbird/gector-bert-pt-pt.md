# proofbird/gector-bert-pt-pt

## Resumen

`gector-bert-pt-pt` es un modelo de corrección gramatical (GEC, *grammatical error correction*) para portugués europeo desarrollado por Proofbird, el equipo detrás de la aplicación de escritura homónima para Windows. Se trata de un etiquetador de secuencias de estilo GECToR construido sobre el encoder BERTimbau (`neuralmind/bert-base-portuguese-cased`) y exportado a ONNX en fp32 para ejecutarse en CPU sin GPU. Su propósito es corregir errores locales de gramática, ortografía y puntuación en textos en portugués de Portugal sin reescribir ni parafrasear el contenido original.

El modelo no genera texto nuevo: para cada token predice una etiqueta de edición (mantener, borrar, reemplazar por una palabra, añadir una palabra, cambiar mayúsculas o cambiar forma verbal) dentro de un espacio de 5 000 etiquetas, y aplica las ediciones de forma iterativa hasta cinco pasadas. Esta aproximación basada en etiquetado, en lugar de generación libre, lo hace determinista y auditable, lo que encaja con su objetivo de ejecución en dispositivo (*on-device*) donde el texto del usuario no abandona la máquina.

Es relevante porque cubre una laguna concreta: la mayoría de correctores open source para portugués están orientados a portugués brasileño. Este modelo trata explícitamente fenómenos del portugués europeo como la construcción `estar a` + infinitivo, la enclisis (`Dá-me`), el léxico (`facto`, `equipa`, `autocarro`) y las formas de `tu`, y respeta tanto la ortografía anterior como la posterior al Acuerdo Ortográfico de 1990. El repositorio ocupa 0,4 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau) con cabeza de etiquetado de ediciones (GECToR) y cabeza de detección de errores |
| Parámetros totales | no disponible (derivado de `bert-base-portuguese-cased`; el número exacto no se indica en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la información proporcionada) |
| Tipos de cuantización | fp32 (exportación ONNX indicada); otras cuantizaciones no disponibles |
| Idiomas soportados | Portugués (`pt`), con enfoque explícito en portugués europeo |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32); librería `onnx` |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT (`neuralmind/bert-base-portuguese-cased`, licencia MIT) con dos cabezas superpuestas: una cabeza de etiquetado con 5 000 etiquetas de edición y una cabeza de detección de errores. El esquema GECToR predice una etiqueta por token, aplica las ediciones resultantes y vuelve a etiquetar la frase hasta un máximo de cinco iteraciones. El encoder base fue preentrenado sobre texto brasileño; la señal de portugués europeo proviene del corpus de ajuste fino.

El entrenamiento usó exclusivamente datos sintéticos, unos 3 millones de frases de tres fuentes: 1 460 392 frases de Wikipedia en portugués (`wikimedia/wikipedia`, `20231101.pt`, filtrando artículos con ortografía y uso europeos), 1 300 000 frases de los proceedings del Parlamento Europeo (Europarl v10, sesiones de 1996 a mayo de 2011) y 250 000 frases de Tatoeba (europeas o sin marca). Las frases se corrompieron con reglas de error escritas a mano en portugués, dejando aproximadamente un 10 % sin corromper para que el modelo aprenda a no tocar texto correcto. Se añadieron 200 000 frases de plantilla para patrones poco frecuentes en los corpus (primera y segunda persona, preguntas, imperativos, concordancia a larga distancia). No se usaron corpus de aprendices ni datos no comerciales, ni texto de usuarios. El ajuste consistió en una época (94 263 pasos, batch 64, learning rate 3e-5) sobre una NVIDIA L4, con identificador de ejecución `2026-11-14-1134`.

## Capacidades

- Corrección de concordancia de género y número (artículos, adjetivos, participios, sustantivos tras determinantes).
- Corrección de concordancia sujeto-verbo en presente (`Os meus filhos está a brincar` → `estão`, `Eles tem` → `têm`).
- Corrección de género de artículo (`um casa` → `uma casa`).
- Resolución de contracciones (`de o` → `do`, `em a` → `na`) y de preposiciones escritas dos veces.
- Corrección de crase (`Vou a praia` → `à praia`).
- Corrección de acentos y diacríticos (`esta cansada` → `está cansada`).
- Corrección del plural de sustantivos en `-ão` (`informaçãos` → `informações`).
- Capitalización al inicio de frase.
- Corrección de errores de registro cotidiano en preguntas, imperativos y primera y segunda persona.
- Aceptación de variantes ortográficas anteriores y posteriores al Acuerdo de 1990 (`acção`/`ação`, `objectivo`/`objetivo`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un etiquetador de ediciones, no un modelo generativo.
- No soporta visión ni audio.
- Salida con posiciones de carácter (`start`, `length`), texto original y reemplazo, apta para subrayar y ofrecer la corrección.

## Casos de uso

- Corrección en tiempo real dentro de un editor de texto: el modelo se ejecuta en CPU vía ONNX Runtime y devuelve sugerencias con posición de carácter, de modo que la interfaz puede subrayar el error y ofrecer el reemplazo sin enviar el texto a un servidor.
- Procesamiento por lotes de documentación en portugués europeo: al ser un etiquetador determinista y ligero, puede aplicarse a grandes volúmenes de texto administrativo o técnico para normalizar concordancias y acentos antes de publicar.
- Preprocesado en pipelines de NLP: corregir el texto de entrada antes de tareas posteriores (traducción, análisis de sentimiento, extracción de entidades) reduce el ruido gramatical sin alterar el contenido semántico.
- Herramienta de revisión para redactores y traductores: integrada en un corrector de estilo, señala errores de concordancia y diacríticos manteniendo las variantes europeas (`facto`, `equipa`) que otros correctores brasileños marcarían como erróneas.
- Filtrado de calidad en corpus: usar la cabeza de detección de errores para puntuar frases de un corpus y descartar o marcar las que contienen errores gramaticales evidentes.
- Aplicación de escritorio sin conexión: el modelo está pensado para ejecutarse en el propio equipo del usuario (Windows), lo que lo hace adecuado para entornos con requisitos de privacidad o sin acceso a red.
- Corrección de textos de estudiantes o aprendices de portugués europeo: aunque no se entrenó con corpus de aprendices, las reglas de corrupción cubren errores típicos de concordancia y acentuación.

## Benchmarks y rendimiento

| Comprobación | Resultado |
|---|---|
| Conjunto de oro (603 frases escritas a mano: 420 con un error cada una, 183 correctas, 53 de ellas en formas exclusivamente europeas) | 416 corregidas, 183 sin tocar, 4 no detectadas, 0 empeoradas |
| Falsas alarmas sobre 4 000 frases cotidianas de Tatoeba (europeas o sin marca, reservadas del entrenamiento) | 11 cambiadas (0,27 %); 8 de ellas corrigen un error real en Tatoeba (dato truncado en la información disponible) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no aplican a un modelo de corrección gramatical de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo está exportado a ONNX fp32 y diseñado para ejecutarse en CPU.
- GPU recomendadas: no requiere GPU. El entrenamiento se realizó en una NVIDIA L4, pero la inferencia es de CPU.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,4 GB y el modelo base es un BERT-base.
- Opciones de despliegue: ONNX Runtime (vía `onnxruntime`), con el script `quickstart.py` proporcionado por el autor; también puede cargarse con `tokenizers` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Autor | Base | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| `gector-bert-pt-pt` | proofbird | BERTimbau | Portugués europeo | Apache 2.0 | ONNX fp32 | GECToR, on-device |
| `gector-bert-pt-br` | proofbird | no disponible | Portugués brasileño | no disponible | no disponible | GECToR, on-device |
| Correctores generativos multilingües (p. ej. basados en LLM) | varios | LLM generativos | Múltiples | variable | safetensors/GGUF | Generación libre, requieren GPU o API |

La información disponible solo permite comparar con el modelo hermano `gector-bert-pt-br` del mismo autor, orientado a portugués brasileño. No se dispone de datos de benchmarks de terceros para establecer una comparación cuantitativa con otros correctores.

## Limitaciones y advertencias

- Solo propone ediciones locales; no parafrasea ni reescribe frases completas, por lo que no corrige errores que requieran reestructuración sintáctica.
- Entrenado exclusivamente con datos sintéticos generados por reglas; puede no cubrir errores reales de aprendices no contemplados por esas reglas.
- El encoder base se preentrenó con texto brasileño; la señal europea depende del corpus de ajuste fino y puede ser incompleta en registros muy específicos.
- Deja intacto el uso brasileño (`fato`, `ônibus`, `está estudando`) en lugar de convertirlo a europeo, lo que puede no ser deseable si se busca normalización a una única variante.
- Riesgo de falsas alarmas bajo pero no nulo: 0,27 % en el conjunto de evaluación de Tatoeba.
- No se documentan sesgos sociales específicos; al ser un corrector gramatical, el riesgo de alucinación se limita a sustituciones léxicas incorrectas dentro del espacio de 5 000 etiquetas.
- Licencia Apache 2.0, que permite uso comercial; el modelo base BERTimbau es MIT. Verificar las licencias de los corpus de entrenamiento (Wikipedia, Europarl, Tatoeba) si se redistribuye el modelo.
- El modelo está versionado (`v1.0.0`, run `2026-11-14-1134`); se recomienda fijar la revisión con `revision="v1.0.0"` para reproducibilidad.
- No disponible información sobre longitud máxima de contexto ni sobre comportamiento con textos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-pt-pt
- Versión fijada: https://huggingface.co/proofbird/gector-bert-pt-pt/tree/v1.0.0
- Modelo hermano para portugués brasileño: https://huggingface.co/proofbird/gector-bert-pt-br
- Demo en el navegador (Hugging Face Spaces): https://huggingface.co/spaces/proofbird/try-grammar
- Cuaderno de inicio rápido (Colab): https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-pt-pt/blob/main/quickstart.ipynb
- Script `quickstart.py`: https://huggingface.co/proofbird/gector-bert-pt-pt/blob/main/quickstart.py
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset Wikipedia en portugués: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Aplicación Proofbird: https://proofbird.app
