# malikithecat/Qwen2.5-1.5B-Instruct-abliterated-fiction-war-GGUF

## Resumen

`malikithecat/Qwen2.5-1.5B-Instruct-abliterated-fiction-war-GGUF` es una variante afinada y cuantizada del modelo base Qwen2.5-1.5B-Instruct, publicada por el usuario malikithecat en Hugging Face. Se distribuye exclusivamente en formato GGUF (concretamente una unica cuantizacion Q8_0), pensada para su ejecucion con llama.cpp y con un Modelfile de Ollama incluido para despliegue local. El nombre indica dos modificaciones sobre el modelo original: un proceso de "abliteration" (eliminacion o atenuacion de los mecanismos de rechazo de contenido) y un ajuste fino orientado a ficcion belica ("fiction-war").

El modelo conserva la arquitectura transformer decoder-only del Qwen2.5-1.5B-Instruct, con 1.543.714.304 parametros totales y una ventana de contexto que, en el modelo base, alcanza los 32.768 tokens (dato no verificado en esta ficha, ya que la model card no lo explicita). El repositorio ocupa 1,6 GB y no registra descargas ni likes en el momento de la consulta, lo que lo situa como una publicacion de nicho sin validacion comunitaria.

Su relevancia es limitada y muy especifica: sirve como ejemplo de flujo de trabajo Unsloth para fine-tuning y conversion a GGUF, y como experimento de desbloqueo de contenido para generacion creativa de tematica belica en entornos locales. No debe confundirse con una version oficial de Qwen ni con un modelo validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Qwen2.5 soporta 32.768 tokens) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors solo como referencia de conteo de parametros) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens con atencion agrupada (GQA) en el modelo base. Sobre esa base se aplicaron dos etapas: un proceso de abliteration, que tipicamente identifica y neutraliza las direcciones del espacio de activaciones asociadas a la negativa a responder, y un fine-tuning adicional orientado a ficcion belica. El autor indica que el fine-tuning y la conversion a GGUF se realizaron con Unsloth, lo que implica un entrenamiento acelerado con kernels optimizados y una cuantizacion posterior a Q8_0.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si se emplearon tecnicas de RLHF, DPO o preferencia. Tampoco se documenta la receta exacta de abliteration ni el dataset de ficcion belica. La unica innovacion tecnica explicitamente mencionada es el uso de Unsloth para acelerar el entrenamiento y la conversion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del formato Instruct de Qwen2.5.
- Razonamiento basico y respuesta a instrucciones en el rango de capacidad de un modelo de 1.5B parametros.
- Generacion de codigo y matematicas elementales (capacidad limitada por el tamano).
- Soporte de plantilla de chat Jinja, invocable con `--jinja` en llama.cpp.
- Capacidad de generar contenido creativo de tematica belica y ficcion, segun el ajuste fino aplicado.
- Comportamiento esperado de menor rechazo ante peticiones que el modelo base rechazaria, por el proceso de abliteration.
- Soporte de tool calling y function calling: no documentado en la model card (el base Qwen2.5-Instruct lo soporta, pero no se verifica en esta variante).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas.
- Vision o audio: no disponibles.

## Casos de uso

- Generacion de ficcion belica local: el ajuste fino especifico permite producir narrativa de tematica militar o belica con menos filtros, ejecutable en un portatil sin GPU dedicada gracias a la cuantizacion Q8_0 y al tamano de 1.5B.
- Prototipado de chatbots conversacionales offline: con llama.cpp u Ollama se puede desplegar un asistente conversacional en local para pruebas de UX sin depender de APIs externas.
- Experimentacion con abliteration: util como caso de estudio para investigadores que quieran comparar el comportamiento del modelo base frente a la variante abliterada en tareas de rechazo y seguridad.
- Pruebas de pipelines de inferencia GGUF: sirve para validar integraciones con llama.cpp, Ollama o endpoints compatibles antes de escalar a modelos mayores.
- Generacion de dialogos para guiones o videojuegos: el ajuste a ficcion belica puede alimentar la redaccion de dialogos de personajes en contextos de conflicto, siempre con revision humana.
- Educacion y demostraciones de fine-tuning: ejemplo reproducible del flujo Unsloth (fine-tuning + cuantizacion GGUF) para talleres y tutoriales.
- Evaluacion de riesgos de contenido: permite estudiar en un entorno controlado como un modelo pequeno abliterado responde a prompts sensibles, para calibrar filtros de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q8_0: aproximadamente 1,6-1,8 GB para los pesos, mas overhead de contexto y KV cache; en la practica, unos 2-3 GB con contexto moderado.
- Cabe en GPUs consumer de gama baja y media: GTX 1650 (4 GB), RTX 3050, RTX 4060, e incluso en CPU con llama.cpp.
- GPU de datacenter (A100, H100) innecesarias para este tamano; solo tendrian sentido para servir muchas instancias concurrentes.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ... --jinja`), Ollama mediante el Modelfile incluido, y endpoints compatibles con la API de llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada; en un modelo de 1.5B en Q8_0 sobre GPU consumer se espera decodificacion en el orden de decenas de tokens por segundo, pero no se aporta medicion oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malikithecat/Qwen2.5-1.5B-Instruct-abliterated-fiction-war-GGUF | 1.543.714.304 | no disponible | GGUF (Q8_0) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B aprox. | 32.768 tokens (segun documentacion del base) | safetensors, GGUF | Apache 2.0 (segun el base) | Hugging Face, ampliamente usado |
| Llama 3.2 1B Instruct | 1.2B aprox. | 128.000 tokens (segun documentacion del base) | safetensors, GGUF | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Gemma 2 2B Instruct | 2.6B aprox. | 8.192 tokens (segun documentacion del base) | safetensors, GGUF | Gemma Terms of Use | Hugging Face, ampliamente usado |

## Limitaciones y advertencias

- Modelo de 1.5B parametros: capacidad de razonamiento, codigo y matematicas claramente inferior a modelos de 7B o superiores; no apto para tareas complejas sin verificacion.
- Riesgo elevado de alucinacion, agravado por el tamano reducido y por el fine-tuning especifico de ficcion.
- El proceso de abliteration reduce los rechazos de seguridad, lo que implica mayor riesgo de generar contenido sensible, ofensivo o inapropiado; requiere filtros y supervision en cualquier despliegue.
- Licencia no declarada en la model card: no se puede confirmar el uso comercial ni las obligaciones de atribucion; hay que remitirse a la licencia del modelo base Qwen2.5-1.5B-Instruct y verificar con el autor.
- Idiomas soportados no documentados; se presume herencia del base, pero sin garantia.
- Longitud de contexto no confirmada para esta variante; no asumir los 32.768 tokens del base sin verificacion.
- Sin descargas ni likes: ausencia de validacion comunitaria y de reportes de calidad.
- Unica cuantizacion disponible (Q8_0), lo que limita el despliegue en hardware con menos de 2 GB de VRAM.
- Repositorio publicado en 2026 con actualizacion inmediata: no hay historial de mantenimiento ni issues resueltos.
- Uso en produccion no recomendado sin evaluacion previa de sesgos, seguridad y calidad.

## Enlaces

- Hugging Face: https://huggingface.co/malikithecat/Qwen2.5-1.5B-Instruct-abliterated-fiction-war-GGUF
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
