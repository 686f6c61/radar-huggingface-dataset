# snxtyle/chitrapathak-MarGuj

## Resumen

Chitrapathak MarGuj es un adaptador LoRA para reconocimiento optico de caracteres (OCR) de lineas completas en marathi y gujarati, construido sobre el modelo multimodal `krutrim-ai-labs/Chitrapathak-2`. Lo publica el usuario `snxtyle` en HuggingFace bajo la libreria PEFT, con pipeline `image-text-to-text`. El repositorio contiene unicamente los pesos del adaptador (0,2 GB); los pesos base no se incluyen y deben descargarse por separado desde el repositorio del modelo base.

El adaptador se entreno en dos fases encadenadas sobre el mismo LoRA: primero dos epochs sobre 9.200 lineas reales de marathi, y despues un epoch adicional sobre 9.200 lineas de gacetas gujarati. Esta continuidad, en lugar de entrenar dos adaptadores independientes, es el rasgo distintivo del modelo: un solo artefacto cubre ambas lenguas. El prompt de inferencia es fijo y explicito ("Perform OCR on this image and transcribe all visible text exactly as it appears.").

La relevancia practica esta en los resultados reportados sobre la particion "Gujarati frozen 100": el adaptador reduce el CER del modelo base Chitrapathak-2 del 80,35% al 8,81% y eleva la precision de caracteres del 19,65% al 91,19%, acercandose a IndicOCR MarGuj (CER 1,23%). En el holdout de 800 lineas cortas de gaceta alcanza un CER del 0,30% y 747 coincidencias exactas sobre 800.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo image-text-to-text (vision-lenguaje); arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (el repositorio contiene solo el adaptador, 0,2 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | marathi (mr), gujarati (gu) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | krutrim-ai-labs/Chitrapathak-2 |
| Configuracion LoRA | r=32, alpha=64, solo proyecciones del modelo de lenguaje |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) que se aplica sobre `krutrim-ai-labs/Chitrapathak-2`, un modelo multimodal de tipo image-text-to-text orientado a OCR. El adaptador emplea rango r=32 y alpha=64, y segun la model card se aplica "solo a las proyecciones del modelo de lenguaje", es decir, no se adaptan las capas del codificador visual. La implementacion de referencia usa `AutoModelForImageTextToText` con `attn_implementation="sdpa"` y dtype bfloat16, con un procesador configurado a `max_pixels=300000` y `min_pixels=56*56`.

El entrenamiento se realizo en dos pasos sobre el mismo adaptador, sin reiniciar el LoRA. El paso marathi uso 9.200 lineas reales de marathi durante 2 epochs, con batch 1 y acumulacion de gradiente 16, tasa de aprendizaje 1e-4. El paso gujarati continuo desde el adaptador resultante durante 1 epoch sobre 9.200 lineas reales de gacetas gujarati, con batch 1 y acumulacion de gradiente 8, misma tasa de aprendizaje 1e-4. No se detalla en la informacion disponible si hubo fases de RLHF, DPO u otro ajuste por preferencias, ni la composicion completa del dataset mas alla del numero de lineas y su origen (lineas reales de gacetas). Tampoco se especifica el numero total de tokens de entrenamiento.

## Capacidades

- OCR de lineas completas en marathi y gujarati, transcribiendo el texto visible de la imagen de forma literal.
- Procesamiento de imagenes con texto combinado con una instruccion de texto (entrada image-text-to-text).
- Manejo de signos de puntuacion, matras, conjunciones y numerales en gujarati, con metricas especificas reportadas para cada categoria.
- Transcripcion de lineas largas (particion "Gujarati frozen 100") y de lineas cortas de gaceta de hasta 10 palabras.
- Generacion determinista en la receta de referencia (`do_sample=False`), adecuada para OCR reproducible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision general (descripcion, VQA): no disponibles; la model card solo documenta OCR.
- Idiomas adicionales fuera de marathi y gujarati: no disponibles.

## Casos de uso

- Digitalizacion de prensa historica en gujarati: el adaptador transcribe lineas de gacetas con un CER del 0,30% en el holdout de 800 lineas cortas, lo que permite convertir hemerotecas escaneadas en texto indexable con supervision humana minima.
- Digitalizacion de prensa y documentos en marathi: el paso marathi del adaptador cubre 9.200 lineas reales, util para archivos regionales que no disponen de OCR comercial especifico para devanagari.
- Extraccion de texto en pipelines de documentos oficiales indios: al tratar ambas lenguas con un unico adaptador, un mismo servicio puede enrutar imagenes en marathi y gujarati sin cambiar de modelo.
- Procesamiento por lotes en backend con GPU: la receta de inferencia con `AutoProcessor`, batching y `max_new_tokens=512` permite montar un servicio de transcripcion por linea sobre colas de imagenes.
- Preservacion de puntuacion y matras en corpus linguisticos: la F1 de puntuacion reportada (97,30%) y la precision de matras (92,10%) lo hacen adecuado para construir corpus anotados donde estos elementos importan.
- Verificacion de OCR de terceros: al ser un adaptador pequeno sobre un modelo base reproducible, sirve como segunda opinion o sistema de referencia frente a OCR comerciales en gujarati.
- Investigacion en adaptacion multilingue de LoRA: el diseno de entrenamiento encadenado (marathi y luego gujarati sobre el mismo adaptador) es un caso de estudio reutilizable para medir olvido catastrofico entre lenguas relacionadas tipologicamente.

## Benchmarks y rendimiento

Particion "Gujarati frozen 100" (mismas 100 lineas largas, `special_chars_expansion.jsonl`). Las ejecuciones de PARSeq son piecewise; las de Chitrapathak e IndicOCR son de linea completa.

| Metrica | PARSeq base | PARSeq entrenado | Chitrapathak base | Chitrapathak MarGuj | IndicOCR base | IndicOCR MarGuj |
|---|---:|---:|---:|---:|---:|---:|
| CER (menor mejor) | 31,57% | 27,45% | 80,35% | 8,81% | 1,76% | 1,23% |
| Strict WER (menor mejor) | 97,30% | 99,44% | 93,10% | 32,25% | 8,57% | 7,36% |
| Punctuation F1 (mayor mejor) | 0,00% | 36,66% | 90,44% | 97,30% | 97,30% | 98,60% |
| Matra (mayor mejor) | 84,01% | 91,87% | 0,00% | 92,10% | 98,53% | 98,53% |
| Conjunct (mayor mejor) | 78,70% | 89,51% | 0,00% | 64,20% | 97,22% | 97,53% |
| Numeral (mayor mejor) | 54,60% | 82,18% | 0,00% | 92,53% | 96,55% | 95,98% |
| Character accuracy (mayor mejor) | 68,43% | 72,55% | 19,65% | 91,19% | 98,24% | 98,77% |
| Exact match (mayor mejor) | 0/100 | 0/100 | 0/100 | 5/100 | 43/100 | 46/100 |

Particion "Gujarati 800-line holdout" (lineas cortas de gaceta, maximo 10 palabras; split excluido del entrenamiento gujarati):

| Metrica | Chitrapathak MarGuj |
|---|---:|
| CER | 0,30% |
| Strict WER | 1,46% |
| Exact match | 747/800 |

No se han publicado en la informacion disponible resultados de benchmarks del paso marathi ni metricas de MMLU, HumanEval o GSM8K, que no aplican a un modelo de OCR.

## Requisitos de hardware

- El repositorio contiene unicamente el adaptador (0,2 GB en safetensors); la VRAM real depende del modelo base `krutrim-ai-labs/Chitrapathak-2`, cuyas dimensiones no se detallan en la informacion disponible.
- GPU dedicada recomendada para inferencia: la receta oficial usa `torch.bfloat16` sobre `cuda` si esta disponible, con respaldo en `mps` (Apple Silicon); no se especifican modelos de GPU concretos.
- Encaje en GPU de consumo: no disponible; depende del tamano del modelo base, no documentado.
- Opciones de despliegue documentadas: `transformers` (`AutoModelForImageTextToText`) junto con `peft` (`PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Preprocesado de imagen: `AutoProcessor` con `max_pixels=300000` y `min_pixels=56*56`, lo que limita la resolucion efectiva de entrada.
- Generacion: `max_new_tokens=512` y `do_sample=False` en el ejemplo oficial.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparativa sobre la particion "Gujarati frozen 100" (datos de la propia model card):

| Modelo | Tipo | CER | Strict WER | Exact match | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Chitrapathak MarGuj | LoRA sobre VLM | 8,81% | 32,25% | 5/100 | no disponible | HuggingFace (adaptador) |
| Chitrapathak-2 base | VLM OCR | 80,35% | 93,10% | 0/100 | no disponible | HuggingFace |
| IndicOCR MarGuj | OCR (referencia) | 1,23% | 7,36% | 46/100 | no disponible | no disponible |
| PARSeq entrenado | OCR piecewise | 27,45% | 99,44% | 0/100 | no disponible | no disponible |

En el holdout de 800 lineas cortas, Chitrapathak MarGuj registra CER 0,30% y 747/800 coincidencias exactas; no se aportan cifras de los modelos alternativos en esa particion, por lo que la comparacion directa queda limitada. Los detalles de arquitectura, tamano y licencia de IndicOCR y PARSeq no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye los pesos base: es imprescindible descargar `krutrim-ai-labs/Chitrapathak-2` por separado para poder usar el adaptador.
- La licencia no esta declarada, ni en el repositorio ni en la model card; no hay base explicita para uso comercial. Conviene verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- El rendimiento en gujarati cae en la particion de lineas largas: strict WER del 32,25% y solo 5 coincidencias exactas sobre 100, frente al 1,46% de WER y 747/800 del holdout de lineas cortas. El modelo es sensible a la longitud y complejidad de la linea.
- La metrica de conjunciones en gujarati (64,20%) es notablemente inferior a la de IndicOCR MarGuj (97,53%), lo que sugiere errores en grupos consonantales.
- La precision de numerales (92,53%) queda ligeramente por debajo de IndicOCR base (96,55%), relevante si el caso de uso depende de cifras.
- El paso marathi no presenta metricas publicadas en la informacion disponible; no se puede cuantificar su calidad ni el posible olvido catastrofico provocado por el entrenamiento posterior en gujarati.
- Solo se documentan dos idiomas (mr, gu); no hay evidencia de generalizacion a otras lenguas indias.
- No se documentan sesgos especificos, pero un OCR entrenado sobre lineas de gacetas puede degradarse en otros dominios (manuscrito, formularios, tipografias no vistas).
- Riesgo de alucinacion no cuantificado: al ser un modelo generativo, puede producir texto plausible ausente en la imagen, especialmente con entradas de baja calidad o fuera de dominio.
- No se documenta soporte de tool calling, agentes ni vision general, por lo que no debe asumirse mas alla del OCR.
- El prompt de entrenamiento es fijo; desviarse de el puede reducir la calidad de la transcripcion.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/snxtyle/chitrapathak-MarGuj
- Modelo base: https://huggingface.co/krutrim-ai-labs/Chitrapathak-2
- Libreria PEFT: https://huggingface.co/docs/peft
- Paper, blog o repositorio adicional del adaptador: no disponible
