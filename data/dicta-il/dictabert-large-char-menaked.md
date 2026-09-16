# dicta-il/dictabert-large-char-menaked

## Resumen

DictaBERT-large-char-menaked es un modelo de lenguaje basado en BERT, desarrollado por el equipo de Dicta (dicta-il), especializado en una tarea muy concreta: anadir los signos diacriticos del hebreo (el *nikud*, el sistema de vocales y marcas de entonacion) a texto moderno escrito sin vocalizar. El modelo es un ajuste fino (*fine-tuning*) de DictaBERT-large-char, del que hereda la arquitectura encoder de tipo transformer con tokenizacion a nivel de caracter, y cuenta con aproximadamente 305 millones de parametros. Su problema objetivo es la *vocalizacion* automatica, un paso previo habitual en pipelines de procesamiento del lenguaje natural en hebreo, sintesis de voz, ensenanza del idioma y edicion de textos liturgicos o literarios.

La relevancia del modelo radica en su especializacion y en su rendimiento declarado: segun la propia model card, a fecha de marzo de 2025 ofrece un rendimiento estado del arte (SOTA) en todas las pruebas de referencia de vocalizacion del hebreo moderno, tanto frente a alternativas de codigo abierto como frente a grandes modelos generativos comerciales. Esta afirmacion es una declaracion del autor y no viene acompanada de cifras detalladas en la informacion disponible.

El modelo se distribuye con licencia CC BY 4.0, lo que permite uso comercial con atribucion, y esta publicado en HuggingFace con mas de 14.000 descargas y 10 *likes*. Su interfaz requiere `trust_remote_code=True`, ya que incorpora codigo personalizado con un metodo `predict` propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (tokenizacion a nivel de caracter), con codigo personalizado |
| Parametros totales | 305.490.975 (~305 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hebreo (he) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

Se trata de un modelo encoder de tipo transformer basado en BERT en su variante *large*, con tokenizacion a nivel de caracter (de ahi el sufijo `char`). No es un modelo generativo autorregresivo: su funcion es producir etiquetas de vocalizacion sobre una secuencia de entrada, expuestas a traves del metodo `predict` que el propio modelo incorpora mediante `trust_remote_code=True`. El modelo ha sido ajustado a partir de DictaBERT-large-char, el checkpoint base de la familia.

Segun la model card, el entrenamiento se realizo sobre un corpus de textos en hebreo moderno vocalizados manualmente por expertos linguisticos. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se emplearon tecnicas de RLHF o DPO (lo cual es poco habitual en este tipo de tarea). Una innovacion practica destacable es la gestion de las *matres lectionis* (אימות קריאה): el metodo `predict` elimina por defecto esas letras usadas como indicadoras de vocal, pero permite conservarlas y marcarlas con un caracter configurable mediante el argumento `mark_matres_lectionis`.

## Capacidades

- Vocalizacion (*nikud*) de texto en hebreo moderno: anade signos diacriticos a texto no vocalizado.
- Gestion configurable de las *matres lectionis*: eliminacion por defecto o marcado con un simbolo definido por el usuario.
- Procesamiento por lotes: el metodo `predict` acepta listas de frases.
- Cobertura de generos: disenado para una amplia variedad de prosa en hebreo moderno.
- Interfaz programatica directa mediante `transformers` con `AutoModel` y `AutoTokenizer`.
- Compatibilidad con herramientas de la comunidad, como la conversion a ONNX de `dicta-onnx`.
- No dispone de soporte declarado de *tool calling*, agentes, vision, audio ni modos de razonamiento explicito.
- Capacidad multilingue: limitada al hebreo; no se declaran otros idiomas.

## Casos de uso

- Vocalizacion de textos para ensenanza del hebreo: el modelo puede procesar material didactico no vocalizado y generar la version con *nikud*, facilitando la lectura a estudiantes principiantes.
- Sintesis de voz (TTS) en hebreo: los motores de sintesis necesitan texto vocalizado para una pronunciacion correcta; este modelo actua como paso previo en el pipeline.
- Edicion y publicacion de libros: editoriales que preparan ediciones vocalizadas de prosa moderna pueden automatizar la primera pasada y reservar la revision humana para el ajuste final.
- Preprocesamiento en pipelines de NLP: la vocalizacion reduce la ambiguedad lexica y puede mejorar tareas posteriores como analisis morfologico, lematizacion o desambiguacion.
- Aplicaciones de accesibilidad: generacion de texto vocalizado para lectores con dificultades de lectura o para herramientas de lectura asistida.
- Procesamiento por lotes de grandes volumenes de texto: gracias a la API de listas y a su tamano moderado, puede ejecutarse en local para vocalizar corpus completos sin depender de servicios externos.
- Investigacion linguistica: analisis de patrones de vocalizacion y validacion de hipotesis sobre corpus, con la posibilidad de preservar las *matres lectionis* para estudiar su distribucion.
- Integracion en editores de texto y correctores: como componente de una extension que ofrezca vocalizacion bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que, a fecha de marzo de 2025, el modelo ofrece rendimiento SOTA en todas las pruebas de referencia de vocalizacion del hebreo moderno frente a alternativas de codigo abierto y a LLM generativos comerciales, pero no incluye las cifras concretas ni los nombres de dichas pruebas.

## Requisitos de hardware

- VRAM estimada: con ~305 M de parametros, aproximadamente 1,2 GB en FP32 y en torno a 610 MB en FP16. La cuantizacion a 8 bits reduciria el requisito a unos 300-350 MB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente. No se requiere hardware de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4070, RTX 4090) e incluso en iGPU con memoria compartida suficiente.
- CPU: viable para inferencia en CPU dado el tamano reducido, especialmente en procesamiento por lotes no interactivo.
- Opciones de despliegue: la via oficial es `transformers` con `trust_remote_code=True`. Existe una alternativa comunitaria basada en ONNX (`dicta-onnx`) orientada a despliegues ligeros. No se documenta soporte directo para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dictabert-large-char-menaked | ~305 M | No disponible | Vocalizacion de hebreo moderno | CC BY 4.0 | HuggingFace (con `custom_code`) |
| dictabert-large-char (modelo base) | No disponible | No disponible | Codificacion de texto en hebreo (tareas generales) | No disponible | HuggingFace |

No se dispone de datos verificables en la informacion proporcionada sobre otros modelos comparables de vocalizacion de hebreo (por ejemplo, alternativas de codigo abierto o LLM comerciales) que permitan establecer una comparacion con cifras. La model card menciona comparaciones con esas categorias, pero no aporta los numeros.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible.
- Riesgo de alucinacion: el modelo puede producir vocalizaciones incorrectas, especialmente en palabras ambiguas, nombres propios o prestamos. La model card recomienda no emplearlo fuera de su dominio previsto.
- Dominio restringido: esta disenado exclusivamente para hebreo moderno. No es adecuado para capas anteriores del hebreo (biblico, rabinico, premoderno) ni para textos poeticos.
- Ambito idiomatico: solo soporta hebreo; no se declaran capacidades en otros idiomas.
- Licencia: CC BY 4.0 permite uso comercial, pero exige atribucion al autor. Conviene revisar los terminos exactos y el cumplimiento de la atribucion en productos derivados.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto; en entornos de produccion conviene auditar ese codigo antes de desplegarlo.
- Distincion entre afirmacion y evidencia: la declaracion de SOTA procede del autor y no esta respaldada por cifras publicadas en la informacion disponible; conviene validarla con un conjunto de evaluacion propio antes de tomar decisiones de produccion.
- Sin *pipeline* declarado en HuggingFace y con `inference: false` en los metadatos, lo que indica que no se ofrece inferencia alojada de forma nativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dicta-il/dictabert-large-char-menaked
- Modelo base DictaBERT-large-char: https://huggingface.co/dicta-il/dictabert-large-char
- Proyecto comunitario dicta-onnx (ONNX, no afiliado): https://github.com/thewh1teagle/dicta-onnx
- Licencia CC BY 4.0: http://creativecommons.org/licenses/by/4.0/
