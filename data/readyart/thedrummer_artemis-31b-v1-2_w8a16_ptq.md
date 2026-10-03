# ReadyArt/TheDrummer_Artemis-31B-v1.2_W8A16_PTQ

## Resumen

ReadyArt/TheDrummer_Artemis-31B-v1.2_W8A16_PTQ es una cuantizacion de precision reducida del modelo TheDrummer/Artemis-31B-v1.2, publicada por el usuario ReadyArt. Se trata de una conversion post-entrenamiento (PTQ) a W8A16 INT8, es decir, pesos en 8 bits y activaciones en 16 bits, generada con el formato compressed-tensors y pensada principalmente para GPUs de arquitectura Ampere, aunque el autor indica que no esta limitada estrictamente a esa generacion. No se trata por tanto de un modelo nuevo ni de un fine-tuning, sino de una redistribucion optimizada del modelo base para reducir huella de memoria en inferencia con una perdida de calidad presumiblemente minima.

El modelo base Artemis-31B-v1.2 es un modelo de generacion de texto de TheDrummer, un autor conocido en la comunidad por publicar fine-tunes y merges de modelos abiertos. El nombre comercial del modelo base sugiere 31.000 millones de parametros, mientras que los metadatos reales de los ficheros safetensors del repositorio cuantizado reportan 10.946.130.276 parametros. Esa discrepancia entre el nombre y el recuento de safetensors es una senal de alarma que conviene resolver antes de usarlo en produccion, ya que el tamano del repositorio (36,6 GB) es mas coherente con un modelo de ~31B en INT8 que con uno de ~11B.

Su relevancia practica es limitada pero concreta: permite servir un modelo de la familia Artemis en hardware Ampere con requisitos de VRAM reducidos respecto a una version FP16, siempre que se disponga del stack de inferencia adecuado para comprimir/descomprimir tensores (compressed-tensors). El repositorio no declara licencia, idiomas soportados ni pipeline, y en el momento de la consulta acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio incluye el tag "gemma4", que apunta a la familia Gemma, pero no se confirma en la model card) |
| Parametros totales | 10.946.130.276 (~10,95 mil millones) segun metadatos safetensors; el nombre del modelo indica 31B (discrepancia no aclarada por el autor) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 INT8 PTQ (pesos 8 bits, activaciones 16 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que el modelo origen no declaraba licencia en el momento de su creacion y sugiere asumir Apache, sin confirmacion) |
| Formato de pesos | safetensors con metadatos compressed-tensors |

Otros datos del repositorio: tamano 36,6 GB; creado el 2026-10-03; actualizado el 2026-10-03; 0 descargas; 0 likes; region: us.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base mas alla del tag "gemma4" incluido en el repositorio, que sugiere una configuracion compatible con la familia Gemma, y de la relacion declarada `base_model_relation: quantized`, que confirma que este repositorio es una cuantizacion y no un entrenamiento. El modelo base TheDrummer/Artemis-31B-v1.2 no aparece descrito en la informacion proporcionada, por lo que se desconoce si se trata de un transformer denso, un modelo con mezcla de expertos (MoE) o una arquitectura hibrida. Tampoco hay datos sobre numero de tokens de entrenamiento, composicion del dataset ni si se aplicaron fases de RLHF, DPO o similares.

La unica innovacion tecnica documentada es el propio proceso de cuantizacion: una conversion post-entrenamiento a W8A16 INT8 que mantiene las activaciones en 16 bits mientras comprime los pesos a 8 bits, empaquetada en el formato compressed-tensors. Este formato es el empleado por herramientas como llm-compressor y esta soportado de forma nativa por motores de inferencia como vLLM. El autor indica que la cuantizacion esta orientada a hardware Ampere (compute capability 8.0), lo que en la practica implica kernels optimizados para esa generacion, sin que ello impida su ejecucion en GPUs posteriores compatibles.

## Capacidades

- Generacion de texto: no documentada en la model card. Al ser una cuantizacion de TheDrummer/Artemis-31B-v1.2, heredaria las capacidades del modelo base, pero el autor no las enumera ni las garantiza.
- Razonamiento, matematicas y generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Efecto de la cuantizacion: W8A16 INT8 con activaciones en FP16 tiende a preservar mejor la calidad que esquemas con activaciones en 8 bits, pero no hay evaluacion publicada que cuantifique la degradacion en este caso concreto.

## Casos de uso

Nota: los siguientes escenarios son aplicaciones tipicas de un modelo de lenguaje de este rango de tamano servido en INT8 sobre hardware Ampere. Dado que la model card no documenta capacidades concretas, deben validarse empiricamente antes de llevarlos a produccion.

- Servicio de chat autoalojado: el modelo puede desplegarse con vLLM (que soporta compressed-tensors) para atender conversaciones multi-turno dentro de una infraestructura propia, reduciendo la VRAM necesaria frente a una version FP16 del mismo modelo base.
- Aplicaciones internas con requisitos de residencia de datos: al poder ejecutarse en servidores propios, encaja en entornos donde el texto no puede salir de la organizacion (sanidad, legal, administracion publica) y donde una cuantizacion INT8 abarata el coste por token servido.
- Generacion y resumen de documentos largos: si el modelo base conserva una ventana de contexto amplia, resulta adecuado para resumir informes, actas o documentacion tecnica, siempre que se verifique primero la longitud de contexto real.
- Asistencia a la redaccion tecnica: borradores de documentacion, changelogs, descripciones de API o comentarios de codigo en pipelines internos de documentacion.
- Clasificacion y extraccion de informacion estructurada: uso del modelo para etiquetar tickets, extraer entidades o convertir texto libre en JSON, tareas donde una cuantizacion INT8 aporta margen de rendimiento por vatio.
- Prototipado e investigacion: punto de partida barato para evaluar la familia Artemis antes de invertir en el modelo completo en FP16, especialmente en laboratorios con GPUs Ampere de gama alta pero sin clusters H100.
- Inferencia por lotes (batch offline): procesamiento nocturno de grandes volumenes de texto donde prima el throughput por GPU sobre la latencia, aprovechando la reduccion de memoria para aumentar el tamano de lote.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con certeza. Los pesos INT8 ocupan aproximadamente 1 byte por parametro. Si el modelo tiene realmente ~10,95 mil millones de parametros, los pesos rondarian los 11 GB, mas escalas y overhead. Si el modelo tiene ~31B como indica su nombre, los pesos rondarian los 31 GB, lo que concuerda mejor con el tamano del repositorio (36,6 GB).
- GPUs recomendadas en el escenario de ~31B INT8: A100 40 GB / 80 GB, H100 80 GB, L40S 48 GB o configuraciones multi-GPU con 2 x 24 GB.
- GPUs recomendadas en el escenario de ~11B INT8: RTX 3090, RTX 4090, RTX A6000, L4 o A10G.
- Compatibilidad con GPU de consumo: en el escenario de ~11B cabria en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen para contexto moderado. En el escenario de ~31B no cabria en una unica GPU de consumo de 24 GB sin recurrir a offloading o a dos GPUs.
- Opciones de despliegue: vLLM es la opcion mas directa por su soporte de compressed-tensors. El formato no es GGUF, por lo que llama.cpp y Ollama requeririan una conversion previa. TGI y SGLang son alternativas a evaluar segun el soporte efectivo de esta combinacion de cuantizacion.
- Latencia y throughput: no disponible (no hay mediciones publicadas en la informacion proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt/TheDrummer_Artemis-31B-v1.2_W8A16_PTQ | 10,95B segun safetensors / 31B segun nombre | no disponible | W8A16 INT8 PTQ (compressed-tensors) | no disponible | 0 descargas, 0 likes |
| TheDrummer/Artemis-31B-v1.2 (modelo base) | ~31B segun nombre | no disponible | FP16/BF16 presumiblemente | no disponible | modelo origen en HuggingFace |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia sin determinar: la propia model card advierte de que el modelo origen no declaraba licencia y sugiere asumir Apache "sin certeza". Esto supone un riesgo juridico directo para uso comercial; conviene contactar con TheDrummer o BeaverAI antes de desplegarlo en produccion.
- Discrepancia en el recuento de parametros: el nombre indica 31B pero los safetensors reportan 10,95B. Es imprescindible verificar el contenido real del repositorio antes de dimensionar hardware o presupuestar costes.
- Sin benchmarks publicados: no hay evidencia de la degradacion de calidad introducida por la cuantizacion W8A16 frente al modelo base.
- Sin idiomas declarados: no se puede asumir un soporte multilingue solido, y menos aun un buen rendimiento en castellano.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje generativo; al no existir evaluaciones publicadas, no hay forma de acotarlo.
- Repositorio sin traccion: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad y de reportes de fallos o problemas de compatibilidad.
- Dependencia de tooling: al usar compressed-tensors y no GGUF, no funcionara directamente en llama.cpp u Ollama sin conversion, lo que limita las opciones de despliegue en entornos sencillos.
- Orientacion a hardware Ampere: los kernels estan pensados para compute capability 8.0; en GPUs anteriores o en aceleradores no NVIDIA el soporte puede ser inexistente.
- Arquitectura no confirmada: el tag "gemma4" no basta para garantizar compatibilidad con utilidades especificas de la familia Gemma (tokenizador, plantillas de chat, configuracion de RoPE).
- Fecha de creacion futura respecto a la mayoria de referencias disponibles (2026-10-03), lo que sugiere un ecosistema muy reciente y posiblemente inestable en cuanto a herramientas de soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ReadyArt/TheDrummer_Artemis-31B-v1.2_W8A16_PTQ
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Formato compressed-tensors (documentacion de referencia del formato de cuantizacion): https://github.com/vllm-project/compressed-tensors
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados no guardan relacion con el y no se incluyen.
