# Iscte-Sintra/mbart-51-stable-v1.0-teste

## Resumen

mbart-51-stable-v1.0-teste es un checkpoint de generacion texto-a-texto publicado en Hugging Face por la organizacion Iscte-Sintra, vinculada al Instituto Universitario de Lisboa (ISCTE-IUL). El repositorio se apoya en la arquitectura mBART, un transformer encoder-decoder preentrenado con objetivos de denoising multilingue, tal como indican las etiquetas del modelo (`mbart`, `text2text-generation`) y la referencia al articulo arXiv:1910.09700 (Liu et al., 2020). El checkpoint contiene 611.130.567 parametros reales en safetensors y ocupa 2,5 GB en el repositorio, un tamano coherente con la variante large de la familia mBART.

La model card del repositorio es la plantilla autogenerada por Hugging Face y no ha sido completada: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparametros y resultados de evaluacion) figuran como "[More Information Needed]". No hay pipeline declarado, ni licencia, ni lista de idiomas, ni benchmarks publicados.

El modelo acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha, y su nombre incluye el sufijo "teste" (prueba), lo que sugiere que se trata de un artefacto experimental o de validacion de un flujo de publicacion mas que de un modelo listo para produccion. Su relevancia actual es limitada y debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder secuencia a secuencia, familia mBART (etiqueta `mbart`, referencia arXiv:1910.09700) |
| Parametros totales | 611.130.567 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la arquitectura mBART de referencia emplea 1024 posiciones maximas) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors sin cuantizar (fp32, ~2,44 GB de pesos) |
| Idiomas soportados | no disponible; el nombre del repositorio sugiere cobertura multilingue amplia, pero la model card no especifica ningun idioma |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 2,5 GB |
| Pipeline declarado | no disponible (la etiqueta del Hub es `text2text-generation`) |
| Compatibilidad | etiqueta `endpoints_compatible` (compatible con Hugging Face Inference Endpoints) |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

La unica informacion fiable sobre la arquitectura procede de las etiquetas del repositorio: `mbart` y `arxiv:1910.09700`, que corresponde al articulo "Multilingual Denoising Pre-training for Neural Machine Translation" de Liu et al. (2020). mBART es un transformer encoder-decoder con atencion completa y embeddings posicionales sinusoidales, preentrenado con una tarea de denoising (enmascarado de spans y permutacion de frases) sobre texto monolingue de decenas de idiomas, y despues ajustado para traduccion supervisada. La variante large de esta familia ronda los 610 millones de parametros, cifra que coincide con los 611.130.567 declarados en safetensors para este checkpoint.

No hay ningun dato publicado sobre el entrenamiento de este checkpoint concreto: se desconoce si hubo ajuste fino supervisado, RLHF, DPO u otro tipo de alineacion; que volumen de tokens se utilizo; cual fue la composicion del dataset; y que hiperparametros se aplicaron (precision, regimen de entrenamiento, hardware). La model card no documenta ninguna innovacion tecnica adicional ni variacion sobre la arquitectura mBART de referencia mas alla de lo que sugiere el nombre del repositorio.

## Capacidades

Debe subrayarse que ninguna de las capacidades siguientes esta documentada por el autor. Se derivan del tipo de arquitectura declarada (mBART, texto-a-texto) y deben verificarse empiricamente antes de cualquier uso real.

- Generacion de texto condicionada por entrada (seq2seq): el modelo produce una secuencia de salida a partir de una secuencia de entrada, formato propio de tareas de traduccion, resumen o reescritura.
- Traduccion automatica: capacidad esperada por la familia mBART, aunque no hay confirmacion de los pares de idiomas soportados ni de su calidad.
- Resumen y parafrasis: tareas habituales de los modelos encoder-decoder multilingues, no verificadas en este checkpoint.
- Razonamiento multi-paso, codigo, matematicas y vision: no disponibles y, por el tipo de modelo, no esperables en un mBART base.
- Tool calling o function calling: no disponible; la arquitectura no incorpora plantilla de herramientas ni modo de agente.
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidades de agente: no disponibles.
- Capacidades multilingues: no confirmadas; el autor no declara la lista de idiomas.

## Casos de uso

Los casos siguientes son escenarios plausibles para un modelo seq2seq multilingue de ~611 millones de parametros. Ninguno esta respaldado por documentacion del autor y requieren validacion previa con datos propios.

- Traduccion automatica en dominios acotados: si se confirma el soporte de los pares de idiomas necesarios, el modelo puede ajustarse con conjuntos paralelos especificos de un dominio (legal, administrativo, tecnico) para obtener traducciones consistentes en una organizacion, aprovechando su base multilingue preentrenada.
- Resumen extractivo y abstractivo de documentos: en pipelines de preprocesado de informes, actas o articulos, el modelo puede condensar texto de entrada en resumenes de longitud controlada mediante los parametros de generacion.
- Normalizacion y reescritura de texto: adecuado para tareas de simplificacion, correccion de estilo o reformulacion de contenidos antes de publicarlos en una web o un CMS.
- Generacion de titulares y meta-descripciones: dado un cuerpo de texto, el modelo puede producir un titular corto o una meta-descripcion SEO mediante ajuste fino con pares (cuerpo, titular).
- Aumento de datos para entrenamiento: generacion de variantes parafraseadas de un corpus para ampliar conjuntos de entrenamiento de clasificadores o sistemas de recuperacion de informacion.
- Traduccion asistida por humano en entornos editoriales: integrado en un editor como sugerencia automatica de borrador de traduccion que despues revisa un traductor profesional, con coste de inferencia bajo por el tamano del modelo.
- Investigacion academica sobre mBART: dada su vinculacion al ISCTE-IUL y su nombre con sufijo "teste", puede emplearse como material de estudio de flujos de publicacion de checkpoints y de reproduccion de experimentos, no como modelo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada (todos los campos figuran como "[More Information Needed]"), no hay tabla de resultados para MMLU, HumanEval, GSM8K, BLEU ni ninguna otra metrica, y la busqueda web realizada no aporta evaluaciones de este checkpoint.

## Requisitos de hardware

- VRAM estimada en fp32: alrededor de 2,44 GB solo para pesos (611,13 millones de parametros x 4 bytes); con activaciones y cache de atencion, entre 3 y 5 GB en funcion de la longitud de secuencia y el tamano de lote.
- VRAM estimada en fp16 o bf16: alrededor de 1,22 GB de pesos; en la practica, entre 2 y 3 GB con overhead de inferencia.
- VRAM estimada en int8: alrededor de 0,61 GB de pesos; entre 1,5 y 2 GB con overhead.
- VRAM estimada en int4: alrededor de 0,31 GB de pesos; entre 1 y 1,5 GB con overhead.
- GPU recomendadas: cualquier GPU con 8 GB o mas funciona sin problemas; una RTX 4090, RTX 3090, A100 o H100 ofrecen margen amplio y permiten lotes grandes. En GPUs de 4-6 GB (GTX 1650, RTX 3050) es viable en fp16 o int8 con lotes pequenos.
- Inferencia en CPU: posible por el reducido tamano, aunque con latencia notablemente superior; no se dispone de mediciones.
- Opciones de despliegue: la libreria declarada es transformers (PyTorch), por lo que `pipeline("text2text-generation")` y `AutoModelForSeq2SeqLM` son las vias directas. La etiqueta `endpoints_compatible` indica compatibilidad con Hugging Face Inference Endpoints. La exportacion a ONNX mediante Optimum es tecnicamente factible, aunque no hay conversion publicada. No hay archivos GGUF, por lo que Ollama y llama.cpp no pueden ejecutar el modelo sin una conversion previa cuya viabilidad depende del soporte de la arquitectura mBART en esas herramientas. El soporte en vLLM y TGI no esta confirmado para checkpoints mBART.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mbart-51-stable-v1.0-teste | 611.130.567 | no disponible | no disponible | Hugging Face, transformers |
| facebook/mbart-large-50 | ~610 millones | 1024 tokens | MIT | Hugging Face, transformers |
| google/mt5-base | ~582 millones | posicion relativa, sin limite fijo | Apache 2.0 | Hugging Face, transformers |
| facebook/nllb-200-distilled-600M | ~600 millones | 512 tokens | CC-BY-NC-4.0 (no comercial) | Hugging Face, transformers |

La comparacion de rendimiento no es posible porque este checkpoint no publica ninguna metrica. Frente a las alternativas de la tabla, las diferencias verificables son la ausencia de licencia explicita (frente a MIT, Apache 2.0 o CC-BY-NC-4.0), la falta de documentacion de idiomas y la ausencia de resultados de evaluacion.

## Limitaciones y advertencias

- Model card vacia: todos los campos son la plantilla autogenerada por Hugging Face, sin informacion sobre desarrollo, datos, entrenamiento o evaluacion.
- Licencia no especificada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; en produccion esto es un bloqueo legal, no solo tecnico.
- Idiomas no documentados: se desconoce que idiomas cubre realmente, pese a que el nombre del repositorio apunta a cobertura multilingue.
- Sufijo "teste": el nombre sugiere un artefacto de prueba o de validacion, no una version estable de produccion, a pesar de la etiqueta "stable" en el identificador.
- Sin validacion por la comunidad: 0 descargas y 0 "likes" implican que no hay terceros que hayan verificado el comportamiento del modelo.
- Fecha de creacion anomala: el repositorio esta fechado en 2026-09-17, lo que dificulta situarlo en una linea temporal de referencia.
- Riesgo de alucinacion: no evaluado. En modelos seq2seq entrenados con denoising, la generacion puede producir contenido fluido pero no fiel al original, especialmente fuera del dominio de entrenamiento.
- Sesgos: no evaluados y no documentados; al desconocerse la composicion del corpus, no puede descartarse sesgo de genero, nacionalidad, religion o idioma.
- Longitud de secuencia: si el checkpoint conserva la configuracion mBART de referencia (1024 posiciones), las entradas largas se truncan; no hay confirmacion de este valor en el repositorio.
- Ausencia de capacidades de agente: no dispone de plantillas de herramientas ni de modo de razonamiento, por lo que no debe asignarsele ese tipo de uso.
- Recomendacion: tratar este checkpoint como material experimental de investigacion. Para uso en produccion conviene partir de `facebook/mbart-large-50` (licencia MIT y documentacion completa) o de alternativas equivalentes con licencia clara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Iscte-Sintra/mbart-51-stable-v1.0-teste
- Articulo de referencia mBART (Liu et al., 2020): https://arxiv.org/abs/1910.09700
- ISCTE - Instituto Universitario de Lisboa (pagina oficial): https://www.iscte-iul.pt/
- ISCTE en Wikipedia (ingles): https://en.wikipedia.org/wiki/ISCTE_%E2%80%93_University_Institute_of_Lisbon
- ISCTE en Wikipedia (portugues): https://pt.wikipedia.org/wiki/ISCTE_%E2%80%93_Instituto_Universit%C3%A1rio_de_Lisboa
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
