# Belgacem123/Qwen2.5-VL-3B-Arabic-Manuscript-Recognition

## Resumen

El modelo **Belgacem123/Qwen2.5-VL-3B-Arabic-Manuscript-Recognition** es un modelo de visión-lenguaje (VLM) especializado en el reconocimiento óptico de caracteres (OCR) de manuscritos históricos en árabe. Desarrollado por el usuario Belgacem123, se basa en el modelo instructivo **Qwen2.5-VL-3B-Instruct** de Alibaba Cloud, al que se le ha aplicado un adaptador LoRA entrenado sobre un dataset propio de manuscritos árabes con diacríticos. El modelo resuelve el problema de la transcripción automática de documentos históricos escritos a mano en árabe, una tarea especialmente difícil por la variabilidad caligráfica y la presencia de signos diacríticos.

Con 3.754.622.976 parámetros (aproximadamente 3,75 mil millones), el modelo mantiene la arquitectura multimodal de Qwen2.5-VL, que combina un codificador visual con un transformador de lenguaje. Su relevancia actual radica en la digitalización del patrimonio cultural árabe: permite convertir manuscritos escaneados en texto digital estructurado, con una tasa de error de carácter (CER) del 6,65 % y de palabra (WER) del 22,09 % según los resultados declarados por el autor. El acceso al modelo está restringido (gated) y requiere aceptar las condiciones de la licencia en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (vision-language transformer) con adaptador LoRA |
| Parametros totales | 3.754.622.976 (3,75 B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-VL-3B-Instruct soporta 32 K tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | Arabe (ar) |
| Licencia | other (acceso restringido, requiere aceptacion de condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de **Qwen2.5-VL-3B-Instruct**, un VLM de la familia Qwen2.5-VL que combina un codificador visual basado en ViT (Vision Transformer) con un decodificador de lenguaje transformer. La arquitectura incorpora mecanismos de atencion cruzada entre las modalidades visual y textual, lo que permite procesar imagenes de resolucion variable y generar respuestas en lenguaje natural. Sobre este modelo base se ha aplicado un adaptador **LoRA** (Low-Rank Adaptation), que ajusta un subconjunto de pesos para especializar el modelo en OCR de manuscritos arabes sin reentrenar todos los parametros.

El entrenamiento se ha realizado sobre el dataset **Belgacem123/arabic-manuscript-ocr-dataset**, de caracter personalizado y multi-fuente, que incluye manuscritos arabes con signos diacriticos. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El adaptador LoRA se ha integrado sobre el modelo instructivo, lo que sugiere que conserva las capacidades conversacionales del modelo base, aunque especializadas en tareas de transcripcion de documentos.

## Capacidades

- Reconocimiento optico de caracteres (OCR) de manuscritos arabes historicos, incluyendo texto con diacriticos.
- Transcripcion de imagenes a texto en arabe, con salida en formato conversacional (image-text-to-text).
- Comprension de imagenes de documentos escaneados, gracias al codificador visual de Qwen2.5-VL.
- Generacion de texto en arabe con estilo instructivo, heredado del modelo base Qwen2.5-VL-3B-Instruct.
- Capacidad de razonamiento multimodal basico (descripcion de imagenes, respuesta a preguntas visuales), aunque su foco principal es OCR.
- No se confirma soporte de tool calling, function calling ni modo agente en esta version fine-tuneada.

## Casos de uso

- **Digitalizacion de archivos historicos**: bibliotecas y archivos nacionales pueden transcribir colecciones de manuscritos arabes escaneados a texto digital, facilitando su busqueda, indexacion y preservacion. El modelo procesa imagenes de pagina completa y devuelve el texto transcrito en formato conversacional.
- **Investigacion academica en estudios islamicos y arabes**: investigadores pueden extraer citas textuales de manuscritos sin necesidad de transcribirlos manualmente, reduciendo horas de trabajo paleografico. El CER del 6,65 % permite una revision posterior relativamente rapida.
- **Catalogacion automatizada en museos y fundaciones**: instituciones que custodian colecciones de documentos arabes pueden generar metadatos textuales de cada pieza de forma automatica, mejorando la accesibilidad de sus catalogos en linea.
- **Ensayos de edicion critica de textos**: editores que preparan ediciones criticas de obras clasicas pueden obtener una primera transcripcion automatica que luego se coteja y corrige, acelerando el proceso editorial.
- **Sistemas de busqueda en colecciones digitales**: al transcribir manuscritos a texto, se habilita la busqueda por palabras clave dentro de documentos que antes solo eran consultables visualmente, mejorando la experiencia de usuarios de portales de patrimonio digital.
- **Formacion en paleografia arabe**: estudiantes de paleografia pueden comparar sus propias transcripciones con las del modelo como herramienta de aprendizaje, aunque siempre con supervision docente dado el margen de error.

## Benchmarks y rendimiento

Segun los resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Optical Character Recognition | Multi-source Arabic Manuscript OCR (agregado, con puntos diacriticos) | Character Error Rate (CER) | 6,65 % |
| Optical Character Recognition | Multi-source Arabic Manuscript OCR (agregado, con puntos diacriticos) | Word Error Rate (WER) | 22,09 % |

No se han publicado comparaciones con otros modelos OCR en la informacion disponible. Los valores de CER y WER corresponden a un dataset agregado de multiples fuentes, lo que sugiere cierta robustez, aunque el WER del 22 % indica que aproximadamente una de cada cinco palabras se transcribe con algun error.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 3,75 B de parametros en precision FP16, el modelo requiere aproximadamente 7,5 GB de VRAM solo para los pesos. Con cuantizacion INT8 se reduciria a unos 3,8 GB, y con INT4 a unos 2 GB, aunque no se distribuyen versiones cuantizadas oficiales.
- **GPU recomendadas**: tarjetas con 8 GB o mas de VRAM, como NVIDIA RTX 3060/3070/4060, RTX 4070, o GPUs de datacenter como A10, L4 o A100. Para uso comodo con contexto largo se recomienda al menos 12 GB.
- **Compatibilidad con GPU de consumo**: si, cabe en tarjetas consumer de gama media-alta (RTX 3060 12 GB, RTX 4070, etc.) siempre que se cargue en FP16 o se cuantice manualmente.
- **Opciones de despliegue**: al ser un modelo con pesos safetensors y arquitectura Qwen2.5-VL, puede desplegarse con frameworks como vLLM, TGI o transformers de HuggingFace. Tambien es posible exportarlo a GGUF para su uso con llama.cpp u Ollama, aunque no se proporcionan archivos preconvertidos.
- **Latencia y throughput**: no se dispone de datos medidos. Como referencia, un modelo de 3 B en una GPU consumer genera aproximadamente 20-40 tokens/s en FP16, pero la entrada de imagenes anade latencia de preprocesado visual.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos especializados en OCR de manuscritos arabes para una comparacion directa. Como referencia, se compara con el modelo base y con alternativas genericas de OCR:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Qwen2.5-VL-3B-Arabic-Manuscript-Recognition | 3,75 B | No disponible (base: 32 K) | OCR manuscritos arabes | other (gated) |
| Qwen/Qwen2.5-VL-3B-Instruct (modelo base) | 3,75 B | 32 K | VLM general (vision + lenguaje) | Apache 2.0 / Qwen license |
| TrOCR (Microsoft) | 0,3 B | - | OCR impreso/manuscrito (multilingue, no arabico especifico) | MIT |
| PaddleOCR (Baidu) | variable | - | OCR generico multilingue | Apache 2.0 |

La comparacion con TrOCR o PaddleOCR es orientativa: estos modelos no estan especializados en arabe manuscrito con diacriticos, por lo que el modelo de Belgacem123 ofrece una ventaja clara en ese dominio concreto, aunque con una licencia mas restrictiva.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo es de tipo gated en HuggingFace; es necesario iniciar sesion y aceptar las condiciones de la licencia antes de poder descargarlo.
- **Sesgos y errores de transcripcion**: el WER del 22 % implica que una parte significativa de las palabras transcritas contiene errores. No es adecuado para transcripciones definitivas sin revision humana.
- **Alucinacion visual**: como cualquier VLM, puede generar texto plausible pero incorrecto ante imagenes ambiguas, de baja resolucion o con caligrafia muy danada.
- **Limitacion idiomatica**: solo esta entrenado para arabe; no soporta otros idiomas ni escrituras, y su capacidad multilingue del modelo base se ve reducida al haberse fine-tuneado exclusivamente con datos arabes.
- **Contexto no confirmado**: no se ha verificado si el fine-tune mantiene la longitud de contexto original de 32 K tokens del modelo base; puede haber degradacion.
- **Licencia restrictiva**: la licencia "other" no especifica claramente los terminos de uso comercial; se recomienda revisar las condiciones en HuggingFace antes de usarlo en produccion.
- **Sin garantias de mantenimiento**: el modelo es obra de un unico autor sin actualizaciones documentadas; puede no recibir soporte ni correcciones.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Belgacem123/Qwen2.5-VL-3B-Arabic-Manuscript-Recognition)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Belgacem123/arabic-manuscript-ocr-dataset)
- [Modelo base Qwen2.5-VL-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct)
