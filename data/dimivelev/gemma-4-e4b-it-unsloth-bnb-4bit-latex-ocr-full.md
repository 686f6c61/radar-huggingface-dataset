# dimivelev/gemma-4-e4b-it-unsloth-bnb-4bit-latex-ocr-full

## Resumen
`dimivelev/gemma-4-e4b-it-unsloth-bnb-4bit-latex-ocr-full` es un ajuste fino (fine-tune) publicado por el usuario dimivelev sobre el modelo multimodal de la familia Gemma 4, concretamente sobre `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`. Se distribuye con la librería transformers, formato safetensors y pipeline `image-text-to-text`, lo que indica que acepta tanto imagenes como texto como entrada y genera texto. Los safetensors declaran 7.996.156.490 parametros (unos 8.000 millones), con un repositorio de 16 GB.

El problema que aborda es el reconocimiento optico de caracteres (OCR) orientado a LaTeX: el sufijo `latex-ocr-full` del nombre del repositorio sugiere que el ajuste se ha especializado en transcribir formulas y documentos matematicos a codigo LaTeX, aunque la model card no lo documenta explicitamente. Es relevante para quienes necesitan convertir imagenes de ecuaciones o PDFs cientificos en LaTeX reutilizable mediante un modelo desplegable con transformers, en lugar de depender de servicios cerrados de OCR matematico.

La informacion publicada es minima: no hay descripcion de datos de entrenamiento, hiperparametros, resultados de evaluacion ni detalles de arquitectura mas alla de las etiquetas. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4`; multimodal imagen-texto de la familia Gemma) |
| Parametros totales | 7.996.156.490 (~8,0 B) |
| Parametros activos | no disponible (el nombre incluye `e4b`, convencion de "parametros efectivos" de Gemma, no confirmada en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | base cuantizada con bitsandbytes a 4 bits (`bnb-4bit`); el repositorio publica safetensors, sin variantes GGUF documentadas |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 16,0 GB) |

## Arquitectura y entrenamiento
No se dispone de detalles tecnicos de arquitectura en la informacion proporcionada. Las etiquetas `gemma4` e `image-text-to-text` apuntan a un transformer multimodal de la familia Gemma 4 con capacidad de procesar imagenes y texto, pero no se especifican el numero de capas, la dimension del encoder visual, el mecanismo de atencion ni la longitud de contexto. El nombre `e4b` remite a la nomenclatura de parametros efectivos empleada en esta familia, si bien no hay confirmacion en los datos facilitados.

En cuanto al entrenamiento, la model card unicamente indica que el modelo se ajusto a partir de `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit` y que se entreno "2x mas rapido" con Unsloth y la libreria TRL de Hugging Face. No se documentan el numero de tokens, la composicion del dataset, el metodo de ajuste (LoRA, QLoRA u otro), ni si hubo etapas de RLHF o DPO. El uso de Unsloth y TRL es coherente con un ajuste eficiente por adaptadores, pero es una inferencia, no un dato confirmado.

## Capacidades
- Generacion de texto y conversacion: etiqueta `conversational` y pipeline `image-text-to-text`.
- Comprension de imagenes: entrada multimodal (imagen + texto) segun el pipeline declarado.
- OCR de LaTeX: el sufijo `latex-ocr-full` sugiere transcripcion de formulas a LaTeX, sin documentacion que lo confirme.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles (`en`); no se declaran otros idiomas.
- Modo "thinking", vision, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Digitalizacion de articulos cientificos: convertir capturas o PDFs con formulas a LaTeX editable, aprovechando la capacidad imagen-texto y la probable especializacion `latex-ocr` del ajuste.
- Generacion de apuntes y libros de texto de matematicas o fisica: transcribir ecuaciones manuscritas o impresas a codigo LaTeX listo para publicar.
- Construccion de datasets de entrenamiento: extraer pares imagen-LaTeX a gran escala para alimentar otros modelos de OCR matematico.
- Integracion en editores de LaTeX y cuadernos: servicio que recibe una imagen y devuelve el fragmento LaTeX correspondiente dentro de un flujo de escritura tecnica.
- Conversion de documentacion tecnica heredada: recuperar formulas perdidas en escaneos y reintegrarlas en Markdown o LaTeX.
- Asistencia academica: ayudar a estudiantes e investigadores a pasar ecuaciones de fotos de pizarra o papel a formato digital.
- Despliegue autocontenido: al ser un modelo de ~8 B en safetensors, puede servirse en infraestructura propia con transformers o TGI para evitar enviar documentos a terceros.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada (inferencia):
  - 4 bits (formato de la base): ~5-6 GB para los pesos, mas el encoder visual y la cache KV.
  - 8 bits: ~9 GB.
  - bf16/fp16 (el repositorio de 16 GB sugiere pesos de 16 bits): ~16 GB solo para pesos.
- GPU recomendadas: para 4 bits, RTX 3060 12 GB, RTX 4070 12 GB o superiores; para 16 bits, RTX 3090 / RTX 4090 de 24 GB, A100 o H100.
- Cabe en GPU de consumo: si, en configuraciones de 4 bits con GPU de 12 GB o mas; el modo 16 bits requiere 24 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference / TGI (etiqueta `text-generation-inference`), Unsloth. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dimivelev/gemma-4-e4b-it-...-latex-ocr-full | ~8,0 B | no disponible | imagen-texto | apache-2.0 | repo HF (0 descargas) |
| unsloth/gemma-4-e4b-it-unsloth-bnb-4bit (base) | ~8,0 B (4 bits) | no disponible | imagen-texto | no disponible | repo HF |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento, contexto o licencia de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias
- Riesgo de alucinacion: sin evaluacion publicada, no se puede descartar que el modelo genere formulas o texto plausibles pero incorrectos, especialmente en OCR de baja calidad.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otras lenguas no esta documentado.
- Cobertura de contexto y resolucion de imagen: no disponible; la transcripcion de documentos largos o escaneos degradados no esta garantizada.
- Licencia: aunque el repositorio se publica como apache-2.0, el modelo deriva de la familia Gemma, cuyos pesos base suelen regirse por los terminos de uso de Gemma y no por Apache 2.0. Conviene verificar la cadena de licencias antes de un uso comercial.
- Artefacto sin validacion: 0 descargas y 0 likes, model card practicamente vacia y sin documentacion de datos de entrenamiento ni de sesgos.
- Cuantizacion de base: al partir de una base en 4 bits, puede existir perdida de precision heredada.
- Ausencia de formatos alternativos: no hay GGUF ni cuantizaciones adicionales, lo que limita el despliegue en entornos de CPU o de bajos recursos.
- Fecha de publicacion: el repositorio figura creado el 2026-09-15, dato atipico que conviene contrastar.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/dimivelev/gemma-4-e4b-it-unsloth-bnb-4bit-latex-ocr-full
- Modelo base: https://huggingface.co/unsloth/gemma-4-e4b-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
