# JuggaHO/Qwen2.5-VL-3B-Instruct-abliterated

## Resumen

El modelo `JuggaHO/Qwen2.5-VL-3B-Instruct-abliterated` es una version "abliterated" (sin censura) de `Qwen/Qwen2.5-VL-3B-Instruct`, el modelo multimodal de vision-lenguaje de 3.750 millones de parametros desarrollado por el equipo Qwen de Alibaba. La abliteracion es una tecnica de edicion de pesos que identifica y elimina las direcciones del espacio de activaciones asociadas al rechazo de peticiones, de modo que el modelo deja de generar negativas automaticas ante determinados contenidos. En este caso, segun la model card, solo se proceso la parte de texto del modelo, no el codificador de vision.

El resultado es un VLM capaz de procesar imagenes y video junto con texto que, ademas, no incorpora los mecanismos de refusal del modelo original. Con 3.750 millones de parametros, entra en la categoria de modelos pequenos que pueden ejecutarse en GPU de consumo (a partir de 8-12 GB de VRAM) e incluso en CPU mediante cuantizacion GGUF, lo que lo hace atractivo para inferencia local y despliegues en el borde.

Su relevancia actual es doble: por un lado, ofrece capacidades multimodales (OCR, descripcion de imagenes, comprension de graficos y video) a un coste de hardware muy bajo; por otro, sirve como objeto de estudio para investigacion en alineacion, interpretabilidad y red teaming, al permitir comparar directamente un modelo base alineado con su version sin direcciones de rechazo. El repositorio de esta ficha es una reproduccion del trabajo original de huihui-ai y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal decoder-only: codificador de vision tipo ViT con atencion por ventanas y resolucion dinamica + decoder de lenguaje de la familia Qwen2.5 |
| Parametros totales | 3.754.622.976 (aprox. 3,75 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; ampliable a 128.000 con YaRN segun la documentacion de Qwen (no confirmado en la model card de esta reproduccion) |
| Tipos de cuantizacion | GGUF (se documenta Q4_K_M, con proyector multimodal mmproj en F16); pesos safetensors en la precision original del modelo base |
| Idiomas soportados | en (unico idioma declarado en la model card) |
| Licencia | qwen-research |
| Formato de pesos | safetensors y GGUF |
| Modalidades | entrada de imagen, video y texto; salida de texto |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 20,2 GB |
| Fecha de publicacion en el repositorio | 2026-09-10 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL: un codificador visual que acepta imagenes a resolucion nativa dinamica (sin redimensionar a un tamano fijo) y que emplea atencion por ventanas para reducir el coste computacional en imagenes de alta resolucion, acoplado a un decoder de lenguaje autorregresivo de la familia Qwen2.5. El modelo incorpora codificacion posicional temporal absoluta, lo que permite alinear los fotogramas de video con marcas de tiempo reales y razonar sobre eventos en secuencias temporales. La variante de 3B integra aproximadamente 3,75 mil millones de parametros entre el torre de vision y el decoder de texto.

Sobre el entrenamiento del modelo base no se aporta informacion detallada en la informacion disponible (numero de tokens, composicion del dataset, fases de SFT, RLHF o DPO). Lo unico documentado en esta ficha es el proceso de abliteracion: se aplico la tecnica implementada en el repositorio `remove-refusals-with-transformers` sobre la parte de texto del modelo, dejando intacto el modulo de vision. No se documentan ni el conjunto de peticiones utilizado para calcular la direccion de rechazo, ni el numero de capas intervenidas, ni evaluaciones posteriores de degradacion de capacidades.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Comprension de imagenes: descripcion de escenas, reconocimiento de objetos, interpretacion de diagramas, graficos, tablas e infografias.
- OCR y extraccion de texto presente en imagenes, incluidas capturas, documentos escaneados y fotografias.
- Procesamiento de video: el ejemplo de uso de la model card procesa simultaneamente imagenes y video mediante `process_vision_info`, lo que confirma soporte de entrada de video heredado del modelo base.
- Razonamiento multimodal de varios pasos sobre el contenido visual, apoyado en el decoder de lenguaje de Qwen2.5.
- Soporte de tool calling y function calling heredado del modelo base Qwen2.5-VL-Instruct.
- Uso en flujos de agente: al conservar el formato de chat y la plantilla del modelo original, puede integrarse en pipelines que alternan observaciones visuales y llamadas a herramientas.
- Comportamiento sin rechazos: la abliteracion elimina las direcciones de activacion asociadas a la negativa de peticiones en la torre de texto.
- Despliegue cuantizado: existen pesos GGUF y una version en Ollama, lo que habilita inferencia en CPU y en GPU de baja VRAM.
- Capacidades multilingues: la model card solo declara ingles, aunque el modelo base Qwen2.5-VL tiene cobertura multilingue amplia; no se garantiza que la abliteracion o el ajuste hayan preservado ese comportamiento.

## Casos de uso

- Investigacion en alineacion y seguridad: comparar las respuestas del modelo base alineado con las de esta version abliterada ante el mismo conjunto de prompts permite medir que comportamientos dependen de las direcciones de rechazo y como afecta su eliminacion a la coherencia general.
- Red teaming y evaluacion de riesgos: al no rechazar peticiones, resulta util como generador de casos adversarios y de contenido de prueba para calibrar clasificadores de seguridad o filtros de moderacion.
- Extraccion estructurada de documentos: con 3,75 mil millones de parametros y OCR integrado, puede procesar facturas, albaranes o formularios escaneados y devolver campos en JSON dentro de un pipeline de automatizacion documental, ejecutandose en una unica GPU de 12 GB.
- Descripcion de imagenes para accesibilidad: generar texto alternativo de imagenes en catalogos, repositorios de contenido o aplicaciones de lectura asistida, con la ventaja de poder desplegarse de forma local sin enviar datos a servicios externos.
- Anotacion automatica de datasets multimodales: producir descripciones y etiquetas preliminares para grandes colecciones de imagenes o clips de video que despues se revisan manualmente, reduciendo el coste de anotacion.
- Inspeccion visual en el borde: con cuantizacion Q4_K_M (aproximadamente 2,3-2,5 GB de pesos mas el proyector) puede ejecutarse en dispositivos con recursos limitados, como mini-PC o placas embebidas con GPU integrada, para tareas de verificacion visual en linea de produccion.
- Asistentes multimodales de escritorio: integrarse en herramientas locales de captura de pantalla y chat donde el usuario pega una imagen y pide analisis, gracias al soporte de Ollama y llama.cpp.
- Interfaz visual para agentes con herramientas: combinado con tool calling, el modelo puede observar una captura o diagrama y decidir que API invocar a continuacion, por ejemplo en flujos de automatizacion de operaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de evaluacion (MMLU, MMMU, DocVQA, HumanEval, GSM8K ni equivalentes) y los resultados de la busqueda web proporcionada no contienen datos tecnicos sobre el modelo. Tampoco se documenta el impacto de la abliteracion sobre las capacidades del modelo base.

## Requisitos de hardware

- VRAM en precision completa (BF16/FP16): aproximadamente 7,5 GB solo de pesos, mas activaciones y cache KV; en la practica se recomiendan 10-12 GB de VRAM.
- Cuantizacion de 8 bits: en torno a 4-5 GB, viable en GPU de 6-8 GB junto con el proyector visual.
- GGUF Q4_K_M: aproximadamente 2,3-2,5 GB de pesos mas el proyector multimodal mmproj en F16 (del orden de 0,5-0,7 GB adicionales), por lo que cabe en GPUs de 6 GB y en CPU con RAM suficiente.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso interactivo; A100, H100 o L40S para despliegues con batching y varios usuarios concurrentes.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas de VRAM usando cuantizacion, y en 12 GB o mas en precision completa.
- Opciones de despliegue: `transformers` con `Qwen2_5_VLForConditionalGeneration` y `qwen_vl_utils`; llama.cpp (a partir de la build b6907, con `llama-mtmd-cli` para el modo multimodal y `llama-cli` para texto); Ollama mediante `huihui_ai/qwen2.5-vl-abliterated:3b`; vLLM para Qwen2.5-VL; y text-generation-inference, ya que el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por imagen en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision y video | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JuggaHO/Qwen2.5-VL-3B-Instruct-abliterated | 3,75 mil millones | 32.768 tokens nativos (base) | Si (imagen y video) | qwen-research | safetensors y GGUF |
| Qwen/Qwen2.5-VL-3B-Instruct (base) | 3,75 mil millones | 32.768 tokens nativos | Si (imagen y video) | qwen-research | safetensors, ampliamente desplegado |
| huihui-ai/Qwen2.5-VL-3B-Instruct-abliterated (original) | 3,75 mil millones | 32.768 tokens nativos (base) | Si (imagen y video) | qwen-research | safetensors, GGUF y Ollama |
| Modelos multimodales pequenos de otros fabricantes (por ejemplo, familias de 2-4B con vision) | Rango 2-4 mil millones | no disponible | Variable segun modelo | Variable | Variable |

La comparativa se limita al ecosistema Qwen2.5-VL porque no se dispone de datos verificados de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada. La diferencia relevante entre esta ficha y el repositorio original de huihui-ai es el autor de la publicacion: la model card de esta reproduccion sigue apuntando a rutas de `huihui-ai` y al mismo archivo Ollama.

## Limitaciones y advertencias

- La abliteracion se aplico unicamente sobre la parte de texto, segun la propia model card; el comportamiento del modulo de vision no se ha modificado ni evaluado.
- No existen evaluaciones publicadas sobre la degradacion de capacidades provocada por la abliteracion. La eliminacion de direcciones de rechazo puede afectar a la coherencia, al seguimiento de instrucciones y a la calidad general del texto, y no hay datos que cuantifiquen ese efecto.
- Riesgo elevado de generar contenido danino, ilegal o sensible sin filtro previo. No es adecuado para aplicaciones de cara al publico sin una capa externa de moderacion.
- Riesgo de alucinacion, especialmente en OCR de documentos con baja resolucion, tipografias complejas o tablas densas, y en descripcion de imagenes ambiguas.
- El consumo de tokens visuales es elevado en imagenes de alta resolucion: el codificador dinamico puede generar muchos tokens por imagen, reduciendo el contexto efectivo disponible para el texto.
- La model card solo declara ingles como idioma soportado. Aunque el modelo base es multilingue, no hay garantia de que el castellano u otros idiomas mantengan una calidad equivalente tras el proceso de abliteracion.
- Licencia `qwen-research`: los terminos publicados por Qwen para este modelo estan orientados a uso de investigacion y no autorizan automaticamente el uso comercial. Es imprescindible revisar el texto completo de la licencia antes de cualquier despliegue en produccion.
- El repositorio registra cero descargas y cero valoraciones, y su model card reproduce literalmente la del modelo de huihui-ai, incluidas las rutas al repositorio de ese autor. No hay validacion independiente de la integridad de los pesos publicados.
- El repositorio ocupa 20,2 GB, lo que incluye varias copias de pesos (safetensors y GGUF) y puede complicar la descarga en entornos con ancho de banda limitado.
- No se documentan sesgos especificos del ajuste, pero al derivar del modelo base Qwen2.5-VL hereda los sesgos presentes en sus datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JuggaHO/Qwen2.5-VL-3B-Instruct-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Modelo abliterated original de huihui-ai: https://huggingface.co/huihui-ai/Qwen2.5-VL-3B-Instruct-abliterated
- Pesos GGUF del autor original: https://huggingface.co/huihui-ai/Qwen2.5-VL-3B-Instruct-abliterated/tree/main/GGUF
- Version en Ollama: https://ollama.com/huihui_ai/qwen2.5-vl-abliterated:3b
- Herramienta de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Release de llama.cpp con soporte de Qwen2.5-VL: https://github.com/ggml-org/llama.cpp/releases/tag/b6907
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
