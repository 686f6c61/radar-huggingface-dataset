# NobittaRaj/Huihui-gemma-4-31B-it-abliterated

## Resumen

Huihui-gemma-4-31B-it-abliterated es una variante "abliterated" (sin mecanismos de rechazo) del modelo multimodal google/gemma-4-31B-it, publicada en Hugging Face bajo el identificador NobittaRaj/Huihui-gemma-4-31B-it-abliterated. El autor del repositorio es NobittaRaj, aunque la model card y los enlaces de referencia apuntan al trabajo original de huihui-ai (huihui-ai/Huihui-gemma-4-31B-it-abliterated). El modelo conserva la arquitectura y los pesos del Gemma 4 de 31B de Google, con 31.273.088.876 parametros segun los safetensors del repositorio, y se distribuye con pipeline any-to-any, lo que implica entrada y salida multimodal (texto e imagen).

La modificacion consiste en una abliteracion: una intervencion sobre las direcciones de activacion asociadas al comportamiento de rechazo, aplicada sin TransformerLens mediante la herramienta remove-refusals-with-transformers. Segun la model card, se han ablacionado tanto el modo "thinking" como el modo sin razonamiento explicito del modelo base. El resultado es un modelo que reduce drasticamente las negativas a peticiones, lo que lo hace relevante para investigacion sobre alineamiento, red teaming y estudios de robustez, pero tambien lo convierte en un artefacto de alto riesgo para uso en produccion.

El interes actual radica en que Gemma 4 es una familia reciente de Google con capacidades multimodales y modo de razonamiento, y las versiones abliterated permiten a investigadores estudiar como se distribuyen las representaciones de rechazo en modelos de esta escala. No obstante, la informacion publicada es escasa: no hay datos de entrenamiento, benchmarks ni idiomas declarados, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4); detalles internos no disponibles |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; existe una version Ollama (huihui_ai/gemma-4-abliterated:31B) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors; compatible con transformers; disponible tambien via Ollama |

## Arquitectura y entrenamiento

El modelo es una modificacion post-entrenamiento de google/gemma-4-31B-it. No se ha reentrenado: la abliteracion actua sobre los pesos del modelo base identificando direcciones en el espacio de activaciones que correlacionan con respuestas de rechazo y proyectando fuera esas direcciones. La implementacion citada (remove-refusals-with-transformers) realiza este proceso sin TransformerLens, lo que la model card describe como una prueba de concepto "cruda". Se aplico tanto al modo de razonamiento (thinking) como al modo directo.

No hay informacion publicada sobre el dataset de entrenamiento original de Gemma 4-31B-it en esta ficha, ni sobre el numero de tokens, composicion, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales del modelo base mas alla de su naturaleza multimodal any-to-any y su modo thinking. El repositorio ocupa 62,6 GB, consistente con pesos en precision alta (probablemente bf16) para 31B parametros.

## Capacidades

- Generacion de texto y razonamiento, heredadas del Gemma 4-31B-it base.
- Procesamiento de imagen y texto (pipeline any-to-any), con capacidad de entrada multimodal.
- Modo thinking (razonamiento explicito) y modo sin thinking, ambos presentes y ablacionados.
- Reduccion de rechazos: el modelo tiende a cumplir peticiones que el base rechazaria, incluyendo contenido sensible o controvertido.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el modo thinking sugiere capacidad de razonamiento extendido, pero sin datos verificables.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: vision (por el pipeline any-to-any); audio no confirmado.

## Casos de uso

- Investigacion sobre alineamiento y rechazo: el modelo permite estudiar que direcciones de activacion controlan la negativa a responder y como varian entre modos thinking y no-thinking. Es adecuado porque la abliteracion es reproducible con la herramienta citada.
- Red teaming y evaluacion de seguridad: sirve para generar respuestas que un modelo alineado bloquearia y medir la eficacia de filtros externos. Su utilidad deriva de la ausencia de filtrado interno.
- Pruebas de robustez de clasificadores de contenido: se puede usar como generador adversario controlado en entornos de laboratorio para entrenar o validar moderadores.
- Analisis de sesgos y toxicidad: al reducir los rechazos, expone mas facilmente las distribuciones latentes del modelo base ante temas sensibles, lo que facilita auditorias.
- Investigacion multimodal: al conservar la entrada de imagen, permite estudiar como la abliteracion afecta a respuestas sobre contenido visual, un area poco explorada.
- Despliegue local controlado con Ollama: la version huihui_ai/gemma-4-abliterated:31B permite ejecutar el modelo en entornos aislados para experimentacion, sin depender de APIs externas.
- Docencia y demostraciones sobre seguridad de LLM: util para mostrar de forma practica que es la abliteracion y sus limites, siempre en entornos cerrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,27B parametros, en bf16 se necesitan aproximadamente 62,5 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, unos 31-35 GB; en 4 bits, unos 16-20 GB (estimaciones estandar, no publicadas por el autor).
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A100 40 GB o L40S 48 GB con cuantizacion 8 bits; RTX 4090 24 GB solo con cuantizacion 4 bits y contexto reducido.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) con cuantizacion de 4 bits, asumiendo que existan pesos GGUF; el repositorio solo publica safetensors, pero hay una version Ollama que facilita el despliegue cuantizado.
- Opciones de despliegue: transformers (formato nativo), Ollama (huihui_ai/gemma-4-abliterated:31B). vLLM, TGI o llama.cpp no estan confirmados para este modelo concreto; la compatibilidad depende de que la arquitectura Gemma 4 este soportada en cada framework.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-gemma-4-31B-it-abliterated | 31,27B | no disponible | any-to-any | apache-2.0 | Abliterated, sin benchmarks publicados |
| google/gemma-4-31B-it | 31,27B (base) | no disponible | any-to-any | licencia Gemma 4 | Modelo base alineado; referencia de comparacion |
| Otras variantes abliterated de huihui-ai | variable | no disponible | texto/multimodal | variable | Coleccion gemma-4-abliterated en Hugging Face |

No se dispone de datos de rendimiento para comparar cuantitativamente con alternativas de la misma categoria.

## Limitaciones y advertencias

- El filtrado de seguridad esta significativamente reducido; puede generar contenido sensible, controvertido o inapropiado.
- No es adecuado para audiencias publicas, menores ni aplicaciones que requieran alta seguridad.
- Riesgo elevado de alucinacion y de afirmaciones no verificadas, agravado por la falta de benchmarks.
- La model card recomienda uso exclusivo en investigacion, pruebas o entornos controlados, evitando produccion o aplicaciones comerciales de cara al publico.
- No hay garantias de seguridad por defecto; el autor declina responsabilidad sobre las consecuencias de uso.
- La licencia declarada es apache-2.0, pero el license_link remite a la licencia de Gemma 4 de Google; conviene verificar los terminos aplicables antes de cualquier uso comercial.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Longitud de contexto no disponible, lo que impide planificar cargas con documentos largos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-06), sin validacion comunitaria.
- La abliteracion es descrita por el propio autor como una prueba de concepto "cruda", lo que sugiere posibles degradaciones en calidad o coherencia no medidas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NobittaRaj/Huihui-gemma-4-31B-it-abliterated
- Repositorio original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-gemma-4-31B-it-abliterated
- Coleccion gemma-4-abliterated: https://huggingface.co/collections/huihui-ai/gemma-4-abliterated
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Herramienta de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Version Ollama: https://ollama.com/huihui_ai/gemma-4-abliterated:31B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
