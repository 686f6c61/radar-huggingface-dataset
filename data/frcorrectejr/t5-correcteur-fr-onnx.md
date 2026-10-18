# frcorrectejr/t5-correcteur-fr-onnx

## Resumen

`frcorrectejr/t5-correcteur-fr-onnx` es una conversión a ONNX y cuantización a 8 bits del modelo `fdemelo/t5-base-spell-correction-fr`, un T5-base ajustado para corregir ortografía y gramática en francés. El autor lo publica empaquetado para Transformers.js, de modo que la inferencia se ejecuta íntegramente en el navegador mediante WebAssembly o WebGPU, sin enviar el texto a ningún servidor. Es el motor del módulo de Firefox «Correcteur FR (local)», según indica la propia model card.

El modelo resuelve una tarea acotada de secuencia a secuencia: recibe una frase precedida del prefijo `grammaire: ` y devuelve la versión corregida. Al estar basado en la arquitectura T5-base (encoder-decoder denso, del orden de 220 millones de parámetros), su huella es lo bastante pequeña como para caber en un cliente web, algo que los correctores basados en modelos generativos grandes no permiten.

Su relevancia es fundamentalmente práctica: demuestra un patrón de despliegue de PLN en el borde (corrección privada, offline y sin coste de servidor) con un modelo de licencia MIT. El repositorio ocupa 1,2 GB y contiene únicamente los artefactos ONNX cuantizados; no se han publicado métricas de evaluación, descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (modelo base: `fdemelo/t5-base-spell-correction-fr`) |
| Parametros totales | 220 M (arquitectura T5-base; la model card no detalla el recuento exacto) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX int8 (cuantización de 8 bits); el repositorio solo publica variantes cuantizadas |
| Idiomas soportados | francés (`fr`) |
| Licencia | MIT |
| Formato de pesos | ONNX: `onnx/encoder_model_quantized.onnx` y `onnx/decoder_model_merged_quantized.onnx` |

Otros datos del repositorio: 1,2 GB de tamaño, 0 descargas, 0 likes, creado y actualizado el 18 de octubre de 2026, región `us`, etiquetas `transformers.js`, `onnx`, `t5`, `text2text-generation`.

## Arquitectura y entrenamiento

La arquitectura subyacente es T5, un transformer encoder-decoder con atención posicional relativa (sin embeddings posicionales absolutos) y preentrenamiento de tipo span corruption sobre texto. El modelo base fue ajustado específicamente para corrección ortográfica y gramatical en francés, aunque la model card de esta conversión no documenta el corpus de ajuste, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifica el proceso de entrenamiento original ni hiperparámetros.

La aportación técnica de este repositorio es el empaquetado: conversión a ONNX con cuantización de 8 bits y uso de un decoder «merged» (`decoder_model_merged_quantized.onnx`), la variante que fusiona el decoder con y sin caché de clave-valor para que Transformers.js pueda reutilizar el estado entre pasos de decodificación. La interfaz es rígida y basada en prefijo: la entrada debe ser `grammaire: <frase>` y la salida es la frase corregida. No hay innovaciones adicionales (decodificación especulativa, atención lineal, mezcla de expertos) documentadas.

## Capacidades

- Corrección ortográfica y gramatical de frases en francés mediante generación seq2seq condicionada por el prefijo `grammaire:`.
- Ejecución local en el navegador con Transformers.js (WebAssembly o WebGPU): el texto no sale del dispositivo.
- Reescritura ligera de la frase de entrada (puntuación, concordancia, acentos, palabras mal escritas) dentro de los límites aprendidos por el modelo base.
- Inferencia por lotes o en streaming desde JavaScript, reutilizando la caché KV del decoder fusionado.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Sin soporte de visión, audio ni modo de razonamiento explícito.
- Multilingüismo limitado al francés; no se documenta transferencia a otras lenguas.
- No se documentan capacidades de contexto largo, resumen, traducción o diálogo multi-turno.

## Casos de uso

- Corrección en formularios y áreas de texto del navegador: el modelo se carga una vez (artefactos ONNX int8) y corrige mientras el usuario escribe, sin coste de servidor ni fuga de datos; es exactamente el escenario del módulo de Firefox «Correcteur FR (local)».
- Extensiones y complementos de navegador con requisitos de privacidad: textos legales, sanitarios o internos que no pueden enviarse a APIs en la nube se corrigen en el cliente mediante WebGPU o WASM.
- Preprocesado de textos en francés antes de indexación o búsqueda: normalizar erratas y concordancia de correos, tickets o formularios reduce la dispersión de términos en el índice sin depender de un servicio externo.
- Limpieza de transcripciones ASR o de texto extraído por OCR: aplicar el modelo frase a frase sobre la salida de un motor de reconocimiento de voz o de un OCR para restaurar acentos, puntuación y palabras mal segmentadas.
- Herramientas de aprendizaje de francés: devolver al estudiante la versión corregida de su frase y resaltar diferencias mediante un diff textual, con latencia baja y funcionamiento offline en el aula.
- Corrección dentro de editores de CMS o wikis autoalojados: integración como paso previo a la publicación mediante ONNX Runtime en el servidor, con licencia MIT que permite uso comercial.
- Normalización de reseñas y encuestas en francés antes de análisis de sentimiento, evitando que las erratas degraden el modelo posterior del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de error ortográfico o gramatical (por ejemplo, precisión por frase, F1 a nivel de token o BLEU frente al texto de referencia), ni comparaciones con el modelo base sin cuantizar. Tampoco se han publicado cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso de uso previsto (inferencia en CPU o GPU integrada del navegador). Con cuantización int8, los pesos rondan 1 byte por parámetro, es decir, del orden de 220-250 MB para los 220 M de parámetros; el repositorio completo ocupa 1,2 GB.
- GPU recomendadas: ninguna imprescindible. Cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3050 o superiores) acelera la inferencia vía WebGPU; en servidor, una T4 o superior es más que suficiente para esta carga.
- Cabe en cualquier GPU consumer y en equipos sin GPU dedicada: la ejecución en CPU con WebAssembly es viable para volúmenes de frase a frase.
- Opciones de despliegue: Transformers.js (navegador y Node.js), ONNX Runtime (Web/Node/servidor) y cualquier runtime compatible con ONNX. No es compatible directamente con llama.cpp, Ollama o vLLM, ya que el repositorio solo distribuye pesos ONNX y no existe versión GGUF publicada.
- Latencia y throughput: no disponibles. Dependerán del backend (WASM frente a WebGPU), del hardware del cliente y de la longitud de la frase de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `frcorrectejr/t5-correcteur-fr-onnx` (este) | 220 M (T5-base) | no disponible | ONNX int8 | MIT | Ejecutable en navegador con Transformers.js |
| `fdemelo/t5-base-spell-correction-fr` (modelo base) | 220 M (T5-base) | no disponible | Pesos PyTorch/safetensors (no detallado) | MIT (según etiquetas) | Requiere framework de inferencia; sin cuantización documentada |
| Otros correctores franceses comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas documentadas en la información proporcionada |

La diferencia práctica entre este modelo y su base es el formato y el tamaño de despliegue, no la arquitectura ni el conocimiento lingüístico. No hay datos públicos que permitan comparar la degradación de calidad introducida por la cuantización a 8 bits.

## Limitaciones y advertencias

- Idioma único: solo francés; cualquier texto en otro idioma probablemente se devuelva alterado o sin corregir.
- Dependencia estricta del formato de entrada (`grammaire: <frase>`); omitir el prefijo degrada la salida sin aviso.
- Riesgo de sobrecorrección: al ser un modelo generativo, puede modificar nombres propios, siglas, jerga técnica o cifras que ya eran correctas.
- Riesgo de alucinación en entradas largas, ambiguas o muy degradadas: puede reescribir la frase con contenido no presente en el original.
- No hay métricas publicadas ni evaluación independiente; el comportamiento real sobre dominios concretos debe validarse con un conjunto propio antes de producción.
- Sin información sobre la longitud máxima de entrada soportada; se recomienda trabajar frase a frase y truncar entradas largas.
- Sesgos heredados del corpus de entrenamiento del modelo base, no documentado; pueden aparecer sesgos léxicos o de registro (por ejemplo, preferencia por un francés estándar de Francia frente a variedades regionales).
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía; conviene verificar también la licencia del modelo base.
- Madurez del repositorio: 0 descargas y 0 likes, sin historial de mantenimiento; es un artefacto reciente y no validado por la comunidad.
- La cuantización int8 puede degradar la calidad respecto al modelo base en casos límite; no se ha cuantificado esa pérdida.
- No apto para generación libre, resumen, traducción ni diálogo: está ajustado exclusivamente a la tarea de corrección.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frcorrectejr/t5-correcteur-fr-onnx
- Modelo base: https://huggingface.co/fdemelo/t5-base-spell-correction-fr

No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
