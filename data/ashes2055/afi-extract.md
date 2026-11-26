# ashes2055/afi-extract

## Resumen

AFI-extract es un modelo de lenguaje publicado por el usuario ashes2055 en Hugging Face bajo el identificador `ashes2055/afi-extract`. Se distribuye en formatos safetensors y GGUF, lo que indica que está pensado tanto para inferencia con frameworks de alto rendimiento (vLLM, TGI) como para despliegue local con llama.cpp u Ollama. El repositorio declara compatibilidad con endpoints y uso conversacional, y cuenta con 3.085.938.688 parámetros totales según los pesos en safetensors (aproximadamente 3,09 mil millones).

La información pública disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni arquitectura concreta, y el modelo no registra descargas en el momento de la consulta. El nombre "afi-extract" sugiere una orientación hacia tareas de extracción de información, aunque no hay documentación oficial que lo confirme.

Por su tamaño, se sitúa en la franja de modelos pequeños-medianos aptos para hardware de consumo, lo que lo hace potencialmente interesante para tareas de extracción y conversación en local. No obstante, la ausencia de model card detallada, benchmarks y licencia explícita limita seriamente su evaluación rigurosa y su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.085.938.688 (aprox. 3,09 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible (niveles concretos no especificados); safetensors en precision original no detallada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo (si es un transformer denso, MoE, SSM o hibrido), ni sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. El unico dato estructural verificable es el recuento de parametros a partir de los pesos safetensors: 3.085.938.688 parametros.

La presencia de pesos en formato GGUF junto a safetensors sugiere que el autor preparo el modelo para inferencia local, pero no aporta informacion sobre innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento extendido. Toda esta seccion debe considerarse no disponible a efectos practicos.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` en el repositorio indica uso previsto para dialogos multi-turno, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Extraccion de informacion: el nombre del modelo sugiere tareas de extraccion estructurada, pero no hay documentacion que lo confirme ni ejemplos de uso.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a traves de infraestructura compatible con la API de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Extraccion de campos estructurados en documentos: dado su tamano contenido (3,09 B), puede desplegarse en una sola GPU para procesar lotes de facturas, contratos o formularios y devolver JSON con los campos solicitados, siempre que se valide su calidad con datos propios.
- Clasificacion y etiquetado de texto a escala: al caber en hardware de consumo, permite ejecutar pipelines de etiquetado sobre grandes volumenes sin coste de API, con la cautela de que no hay benchmarks que garanticen su precision.
- Prototipado rapido de asistentes conversacionales: la etiqueta `conversational` y el formato GGUF permiten montar un chatbot local con Ollama o llama.cpp en pocos minutos para pruebas de concepto.
- Enriquecimiento de datos en pipelines ETL: integrado via API compatible con endpoints, puede insertarse como paso de normalizacion o resumen de registros textuales antes de su carga en un almacen de datos.
- Filtrado y resumen de tickets de soporte: su tamano permite procesar conversaciones de atencion al cliente en local, extrayendo categoria, urgencia y entidades sin enviar datos sensibles a terceros.
- Experimentacion academica con modelos de ~3 B: util como linea base para comparativas de fine-tuning o cuantizacion en entornos con recursos limitados, dado que los pesos safetensors estan disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 8-10 GB en total).
- VRAM estimada en cuantizacion 8 bits: en torno a 3,1 GB para pesos.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4): en torno a 1,8-2 GB para pesos, con margen adicional para contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); para cuantizaciones de 4 bits basta con 4-6 GB (RTX 3050, GTX 1660 Super en adelante).
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas usando GGUF.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para safetensors si la arquitectura es compatible (no confirmado); endpoints compatibles con la API de Hugging Face segun la etiqueta del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AFI-extract (ashes2055) | 3,09 B | no disponible | no disponible | Hugging Face (safetensors, GGUF) |
| Qwen2.5-3B | 3,09 B | 32.768 tokens (128K en variantes extendidas) | Apache 2.0 (segun version) | Hugging Face, amplia documentacion |
| Llama 3.2 3B | 3,21 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Hugging Face, ecosistema amplio |
| Phi-3.5-mini | 3,82 B | 128.000 tokens | MIT | Hugging Face, documentacion extensa |

La comparativa se limita a tamano y disponibilidad, ya que AFI-extract carece de datos publicos de contexto, licencia y rendimiento. Frente a alternativas como Qwen2.5-3B, Llama 3.2 3B o Phi-3.5-mini, la falta de model card y benchmarks impide establecer una comparacion tecnica rigurosa.

## Limitaciones y advertencias

- Ausencia de model card: no hay informacion sobre datos de entrenamiento, sesgos conocidos ni evaluaciones de seguridad.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicadas, no puede estimarse su tasa de errores facticos; debe validarse exhaustivamente antes de uso en produccion.
- Licencia no especificada: la falta de licencia explicita impide determinar si se permite uso comercial; en la practica, esto bloquea su adopcion empresarial hasta aclaracion del autor.
- Idiomas no declarados: se desconoce si el modelo esta entrenado en castellano o en otros idiomas, lo que limita su uso en aplicaciones multilingues.
- Contexto desconocido: no puede planificarse su uso en tareas de contexto largo sin conocer la ventana real.
- Repositorio sin traccion: cero descargas y un solo "like" en el momento de la consulta, lo que reduce la probabilidad de soporte comunitario o correccion de errores.
- Arquitectura no confirmada: la compatibilidad con vLLM o TGI no esta garantizada, por lo que el despliegue de alto rendimiento podria requerir llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashes2055/afi-extract
