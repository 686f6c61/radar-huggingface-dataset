# ArchiveStudio/Phi-3-small-8k-instruct

# Phi-3-small-8k-instruct (ArchiveStudio)

## Resumen

Phi-3-small-8k-instruct es un modelo de lenguaje de 7.392.274.432 parámetros (unos 7,4B) perteneciente a la familia Phi-3 de Microsoft, publicado originalmente por Microsoft y re-subido a Hugging Face por el usuario ArchiveStudio bajo el identificador `ArchiveStudio/Phi-3-small-8k-instruct`. Se trata de un transformer decoder-only instruido, con una ventana de contexto de 8K tokens (8.192), pensado para entornos con memoria y cómputo restringidos y para escenarios sensibles a la latencia, manteniendo un foco explícito en razonamiento lógico, matemáticas y código.

Según la model card, el modelo se ha entrenado con los datasets de Phi-3, que combinan datos sintéticos y datos filtrados de webs públicas con foco en "alta calidad" y densidad de razonamiento, y ha pasado por un post-entrenamiento con ajuste supervisado (SFT) y optimización directa de preferencias (DPO) para mejorar el seguimiento de instrucciones y la seguridad. El tokenizer es de tipo tiktoken y soporta un vocabulario de hasta 100.352 tokens.

Su relevancia práctica es la de un modelo de ~7B que la documentación sitúa al nivel de modelos de su tamaño y del siguiente escalón superior en pruebas de sentido común, comprensión del lenguaje, matemáticas, código, contexto largo y razonamiento lógico. Ahora bien, el repositorio analizado es un espejo de terceros con 0 descargas y 0 "likes" en el momento de la consulta, por lo que para uso en producción conviene partir del repositorio oficial de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; la model card no detalla numero de capas, tipo de atencion ni configuracion interna (el tag del repo indica `phi3small` y `custom_code`) |
| Parametros totales | 7.392.274.432 (≈7,4B), dato real de safetensors |
| Parametros activos | No aplica: no hay indicios de que sea un modelo MoE en la informacion disponible |
| Longitud de contexto | 8.192 tokens (variante 8K); la familia tiene tambien una variante de 128K |
| Tipos de cuantizacion | No disponible: este repositorio solo publica safetensors y no documenta cuantizaciones (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Etiqueta `multilingual`; la model card indica que el modelo esta pensado para uso comercial y de investigacion principalmente en ingles |
| Licencia | MIT (con enlace al archivo LICENSE de `microsoft/Phi-3-small-8k-instruct`) |
| Formato de pesos | safetensors; el tamano del repositorio (14,8 GB) es consistente con pesos en bf16/fp16 |
| Tokenizer | tiktoken, vocabulario de hasta 100.352 tokens |
| Tamano del repositorio | 14,8 GB |

## Arquitectura y entrenamiento

La model card describe el modelo como un modelo ligero de 7B parametros de la familia Phi-3, en su version "Small", disponible en dos variantes segun la longitud de contexto soportada: 8K y 128K. No se especifican en la documentacion proporcionada el numero de capas, la dimension oculta, el tipo de atencion ni otros detalles de la configuracion interna; el repositorio incluye codigo personalizado (`custom_code`), lo que obliga a cargar el modelo con `trust_remote_code=True`.

En cuanto al entrenamiento, la model card indica que se usaron los datasets de Phi-3, compuestos por datos sinteticos y datos filtrados de webs publicas, seleccionados por su alta calidad y densidad de razonamiento. El post-entrenamiento combina ajuste supervisado (SFT) y optimizacion directa de preferencias (DPO) para el seguimiento de instrucciones y las medidas de seguridad. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el proceso de filtrado. El modelo usa un formato de chat con tokens especiales (`<|endoftext|>`, `<|user|>`, `<|end|>`, `<|assistant|>`) y su uso esta integrado en `transformers` desde la version de desarrollo 4.40.2, requiriendo `tiktoken` 0.6.0 y `triton` 2.3.0.

## Capacidades

- Generacion de texto conversacional en formato chat multi-turno mediante la plantilla `<|endoftext|><|user|>\n...<|end|>\n<|assistant|>`.
- Razonamiento logico, matematicas y codigo: son las areas que la model card destaca como prioritarias y sobre las que se declara un rendimiento competitivo dentro de su tamano.
- Seguimiento de instrucciones, gracias a la fase de SFT y DPO.
- Capacidades multilingues: el modelo esta etiquetado como `multilingual`, aunque la propia model card limita el uso previsto principal al ingles.
- Contexto de 8K tokens, suficiente para conversaciones largas o documentos de tamano medio, pero no para casos de contexto muy largo (la variante 128K cubre ese escenario).
- Optimizado para entornos con restricciones de memoria y computo y para escenarios con requisitos de baja latencia.

No hay informacion disponible sobre soporte de tool calling o function calling, uso en agentes, razonamiento multi-paso explicito, modo "thinking", vision o audio. Estas capacidades no se documentan en la model card ni en los metadatos del repositorio.

## Casos de uso

- Atencion al cliente automatizada en ingles: el modelo puede mantener conversaciones multi-turno con hasta 8K tokens de contexto, suficiente para incluir el historial de la sesion y las politicas de la empresa, y su tamano de 7,4B permite desplegarlo en una sola GPU con latencia baja.
- Generacion y revision de codigo en produccion: por su foco en codigo y razonamiento, encaja en tareas de autocompletado, explicacion de funciones y deteccion de errores dentro de pipelines de CI/CD; al no estar documentado el tool calling, la integracion debe hacerse mediante prompts estructurados y parseo de la salida.
- Tutoria y resolucion de problemas matematicos paso a paso: el modelo esta entrenado sobre datos con densidad de razonamiento, lo que lo hace adecuado para explicar procedimientos y comprobar resultados en entornos educativos.
- Extraccion y clasificacion de informacion sobre documentos: con 8K tokens de contexto puede procesar informes, contratos o articulos de longitud media y devolver campos estructurados en formato JSON.
- Generacion aumentada por recuperacion (RAG): se puede usar como generador final en un pipeline que recupere fragmentos de una base de conocimiento y los inyecte en el prompt, siempre que el material recuperado quepa en la ventana de 8K.
- Despliegue on-premise o en el borde: al ser un modelo de 7,4B con licencia MIT, permite ejecucion en infraestructura propia sin dependencia de APIs externas y sin coste de licencia, en GPU de 16-24 GB o en GPU de consumo con cuantizacion.
- Ajuste fino especifico de dominio: la licencia MIT y el tamano moderado lo convierten en una base razonable para LoRA o fine-tuning completo orientado a un vertical concreto.
- Prototipado rapido de asistentes: al integrarse en `transformers`, vLLM o TGI, sirve para validar productos de IA generativa antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo muestra un rendimiento "robusto y de ultima generacion" entre modelos de su tamano y del escalon superior en pruebas de sentido comun, comprension del lenguaje, matematicas, codigo, contexto largo y razonamiento logico, pero la tabla de resultados no forma parte del contenido proporcionado. Los datos cuantitativos deben consultarse en el informe tecnico de Phi-3 enlazado desde la model card.

## Requisitos de hardware

- Pesos en bf16/fp16: el repositorio ocupa 14,8 GB, por lo que la inferencia completa requiere del orden de 16-18 GB de VRAM incluyendo cache KV y overhead del runtime.
- GPU recomendadas para bf16/fp16: A100 40 GB, H100, L40S 48 GB, RTX 4090 24 GB, RTX 3090 24 GB.
- GPU de consumo: si cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) sin cuantizar; con cuantizacion de 8 bits (≈8 GB) cabria en RTX 3060 12 GB, RTX 4070 y similares, y con 4 bits (≈4-5 GB) en GPU de 8 GB. Hay que tener en cuenta que este repositorio no publica pesos cuantizados.
- Opciones de despliegue: `transformers` 4.40.2 o superior con `trust_remote_code=True` (requiere `tiktoken` 0.6.0 y `triton` 2.3.0), vLLM y TGI (verificando el soporte del codigo personalizado del modelo en cada version), Azure AI, y llama.cpp u Ollama solo si se generan conversiones GGUF, que no estan disponibles en este repositorio. Existen conversiones ONNX en los repositorios oficiales de Microsoft.
- Latencia y throughput: no disponibles; no se han proporcionado mediciones para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Phi-3-small-8k-instruct (este repositorio) | 7,4B | 8K | MIT | Espejo de terceros en Hugging Face; original en `microsoft/Phi-3-small-8k-instruct` |
| Phi-3-mini-4k-instruct (Microsoft) | ≈3,8B | 4K (existe variante 128K) | MIT | Repositorio oficial, con variantes GGUF y ONNX |
| Phi-3-medium-4k-instruct (Microsoft) | ≈14B | 4K (existe variante 128K) | MIT | Repositorio oficial, con variantes ONNX |
| Llama-3-8B-Instruct (Meta) | ≈8B | 8K | Licencia comunitaria de Meta (no MIT) | Peso abierto con condiciones de uso |
| Mistral-7B-Instruct-v0.3 (Mistral AI) | ≈7,2B | 32K | Apache 2.0 | Peso abierto, con amplio ecosistema de cuantizaciones |

La comparacion de rendimiento entre estos modelos no es posible con la informacion disponible, ya que no se han proporcionado resultados de benchmarks para el modelo de esta ficha. La comparativa se limita por tanto a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un espejo de terceros: el repositorio `ArchiveStudio/Phi-3-small-8k-instruct` no es el oficial de Microsoft, tiene 0 descargas y 0 "likes" segun los metadatos, por lo que no hay validacion de la comunidad ni garantia de integridad de los pesos. Para produccion es preferible `microsoft/Phi-3-small-8k-instruct`.
- Riesgo de alucinacion: la model card no documenta tasas de error ni mecanismos de verificacion; como cualquier modelo de lenguaje, puede generar informacion incorrecta con aparente seguridad.
- Sesgos conocidos: no se documentan en la informacion disponible. La model card advierte de que los modelos no estan disenados ni evaluados para todos los casos de uso y que el desarrollador debe evaluar y mitigar exactitud, seguridad y equidad antes de usarlos, especialmente en escenarios de alto riesgo.
- Limitacion de idioma: aunque la etiqueta del repositorio indique `multilingual`, la model card limita el uso previsto principal al ingles; el rendimiento en otros idiomas no esta documentado ni evaluado.
- Limitacion de contexto: 8K tokens es una ventana moderada; para documentos extensos o conversaciones muy largas habria que recurrir a la variante de 128K o a estrategias de troceado y recuperacion.
- Codigo personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene revisar ese codigo antes de usarlo en entornos sensibles. Ademas exige versiones concretas de `transformers`, `tiktoken` y `triton`.
- Sin datos de benchmarks publicados en la informacion disponible, no es posible validar de forma independiente las afirmaciones de rendimiento de la model card para este repositorio.
- Licencia: MIT, lo que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la licencia; la propia model card aclara que nada de su contenido debe interpretarse como una restriccion adicional a la licencia.
- Fecha de publicacion del espejo: los metadatos indican creacion y ultima actualizacion el 10 de octubre de 2026.

## Enlaces

- Repositorio analizado: https://huggingface.co/ArchiveStudio/Phi-3-small-8k-instruct
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-3-small-8k-instruct
- Licencia del modelo original: https://huggingface.co/microsoft/Phi-3-small-8k-instruct/resolve/main/LICENSE
- Blog de Phi-3: https://aka.ms/Phi-3Build2024
- Informe tecnico de Phi-3: https://aka.ms/phi3-tech-report
- Phi-3 en Azure AI Studio: https://aka.ms/phi3-azure-ai
- Phi-3 Cookbook: https://github.com/microsoft/Phi-3CookBook
- Variante de contexto largo: https://huggingface.co/microsoft/Phi-3-small-128k-instruct
- Version ONNX del modelo: https://huggingface.co/microsoft/Phi-3-small-8k-instruct-onnx-cuda
- Familia Phi-3.5: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
