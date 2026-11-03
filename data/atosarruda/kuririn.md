# AtosArruda/Kuririn

## Resumen

Kuririn es un fine-tune del modelo multimodal Gemma 4 E2B instruct (`unsloth/gemma-4-E2B-it`) especializado en OCR de expresiones LaTeX: recibe una imagen que contiene una formula matematica y devuelve su representacion en LaTeX. Lo desarrolla el usuario AtosArruda y se publica bajo licencia Apache 2.0 en HuggingFace, con fecha de creacion el 3 de noviembre de 2026.

El modelo parte de los pesos de Gemma 4 E2B (aproximadamente 5.123 millones de parametros segun los safetensors del repositorio), una variante eficiente de la familia Gemma 4 de Google DeepMind con capacidad de procesamiento imagen-texto. Sobre esa base se aplico un ajuste QLoRA (r=6, alpha=6) con Unsloth Studio sobre el dataset `unsloth/LaTeX_OCR`, y posteriormente se fusionaron los adaptadores LoRA en los pesos originales en bf16, de modo que el repositorio contiene un modelo denso listo para inferencia directa con `transformers`.

Su relevancia es acotada pero concreta: cubre un nicho (digitalizacion de formulas matematicas en imagenes a LaTeX) con un modelo de tamano moderado que puede desplegarse en hardware asequible. No obstante, al tratarse de un fine-tune con cero descargas y sin benchmarks publicados, debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto) derivado de Gemma 4 E2B; detalles internos de la arquitectura base no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al estar en bf16 es cuantizable a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (bf16, LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint instruct `unsloth/gemma-4-E2B-it`, que pertenece a la familia Gemma 4 de Google. La model card no detalla la arquitectura interna de la base (numero de capas, atencion, encoder visual), por lo que esos datos deben consultarse en la documentacion oficial de Gemma 4. El pipeline declarado es `image-text-to-text`, lo que confirma que el modelo procesa imagenes y texto de forma conjunta.

El entrenamiento consistio en un ajuste QLoRA con rango 6 y alpha 6, ejecutado con Unsloth Studio y guardado en el checkpoint 64830. El dataset utilizado es `unsloth/LaTeX_OCR`, orientado a la transcripcion de imagenes con formulas a LaTeX. Los adaptadores LoRA se fusionaron en los pesos originales en bf16, por lo que el repositorio no requiere cargar adaptadores por separado. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de LaTeX a partir de imagenes de formulas matematicas (OCR especializado).
- Procesamiento multimodal imagen-texto heredado de Gemma 4 E2B.
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`).
- Generacion de texto instructiva basica heredada del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este fine-tune.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision adicional o audio: no documentados.

## Casos de uso

- Digitalizacion de apuntes y libros de matematicas: el modelo convierte capturas o escaneos de formulas en codigo LaTeX listo para pegar en documentos cientificos, aprovechando su entrenamiento especifico sobre `unsloth/LaTeX_OCR`.
- Conversion de papers en PDF a fuente LaTeX: integrado en un pipeline de extraccion de imagenes de formulas, permite reconstruir el codigo de cada ecuacion para su reutilizacion o verificacion.
- Generacion automatica de material docente: a partir de fotos de pizarra o ejercicios resueltos, se obtiene el LaTeX para maquetar guias, examenes o presentaciones con Beamer.
- Accesibilidad para contenido cientifico: transcripcion de formulas en imagenes a texto estructurado que puede leerse con lectores de pantalla o procesarse con herramientas de MathML.
- Preprocesado para motores de busqueda cientifica: indexar ecuaciones a partir de imagenes y almacenarlas en formato LaTeX para busquedas semanticas o comparaciones simbolicas.
- Prototipado de asistentes de estudio: un chatbot que recibe fotos de problemas matematicos y devuelve la expresion en LaTeX como primer paso antes de resolverlos con un motor algebraico externo (SymPy, Mathematica).
- Extraccion de formulas en pipelines de publicacion: automatizar la revision de manuscritos convirtiendo imagenes de ecuaciones a LaTeX para validacion editorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 10-11 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16 GB para comodidad.
- Cuantizacion a 8 bits: en torno a 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB.
- Cuantizacion a 4 bits: en torno a 3 GB de pesos, viable en GPUs de 6-8 GB.
- GPUs recomendadas: RTX 4090, RTX 4080, RTX 3090, A100 o H100 para despliegues de mayor throughput; en consumer, cualquier GPU con 12 GB o mas permite bf16.
- Despliegue: `transformers` con `AutoModelForImageTextToText` es la via documentada; vLLM, llama.cpp, Ollama o TGI no estan verificados en la informacion disponible, aunque al ser un modelo `transformers` estandar pueden intentarse con herramientas de conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AtosArruda/Kuririn | 5.123 M | no disponible | OCR LaTeX sobre Gemma 4 E2B | apache-2.0 | HuggingFace, 0 descargas |
| unsloth/gemma-4-E2B-it (base) | ~5.000 M (segun safetensors del fine-tune) | no disponible | Multimodal general | licencia Gemma 4 | HuggingFace |
| Pix2Text / LaTeX-OCR (lukas-blecher) | no disponible | no disponible | OCR LaTeX especializado | MIT (segun sus repos) | GitHub / PyPI |

La comparativa con alternativas especializadas en OCR de LaTeX (como LaTeX-OCR) es cualitativa: no hay benchmarks publicados de Kuririn que permitan una comparacion numerica. Frente al modelo base, Kuririn sacrifica potencialmente generalidad a cambio de especializacion en un dominio concreto.

## Limitaciones y advertencias

- Modelo sin descargas ni validacion comunitaria: no hay evidencia publica de calidad en produccion.
- Sin benchmarks: no se puede afirmar su precision en OCR LaTeX frente a alternativas establecidas.
- Entrenado con un unico dataset (`unsloth/LaTeX_OCR`): posible sobreajuste a ese dominio y peor rendimiento en formulas manuscritas, tablas o notacion no vista.
- Riesgo de alucinacion: como todo modelo generativo, puede producir LaTeX sintacticamente valido pero semanticamente incorrecto; conviene validar con un compilador LaTeX.
- Idiomas y contexto no documentados: no se puede garantizar soporte multilingue ni ventanas largas.
- Uso comercial: la licencia declarada es Apache 2.0, pero el enlace apunta a la licencia de Gemma 4 de Google; conviene revisar los terminos de uso de Gemma antes de un despliegue comercial.
- El modelo base es un checkpoint instruct de Gemma 4: hereda sus sesgos y limitaciones, no documentados en esta ficha.
- Fecha de creacion futura (2026) y metadatos incompletos: verificar integridad del repositorio antes de confiar en el.

## Enlaces

- HuggingFace: https://huggingface.co/AtosArruda/Kuririn
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/unsloth/LaTeX_OCR
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Unsloth Studio (herramienta de entrenamiento): https://unsloth.ai
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
