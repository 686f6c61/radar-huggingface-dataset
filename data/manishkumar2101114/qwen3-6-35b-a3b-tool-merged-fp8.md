# manishkumar2101114/qwen3.6-35b-a3b-tool-merged-fp8

## Resumen

Qwen3.6-35B-A3B tool-merged FP8 es un modelo derivado (fine-tune fusionado) publicado por el usuario manishkumar2101114 en HuggingFace. Parte del modelo base Qwen/Qwen3.6-35B-A3B-FP8 y le aplica un adaptador LoRA orientado a llamadas a herramientas (tool calling), entrenado durante 3 epocas sobre 1515 dialogos de tool-call. El resultado se fusiona en BF16 y despues se recuantiza por bloques a FP8 e4m3 con escala 128, manteniendo la convencion de formato del modelo base. El repositorio ocupa 37,5 GB y contiene pesos en safetensors.

El modelo tiene 35.951.822.704 parametros totales (aproximadamente 36B), lo que confirma que se trata de un modelo grande con arquitectura de mezcla de expertos (MoE), tal como indica la etiqueta qwen3_5_moe. El sufijo A3B del nombre sugiere del orden de 3B de parametros activos por token, aunque este dato no aparece confirmado en la model card. Esta pensado explicitamente para agentes de voz ("Marg voice agents") y para servir con sglang, vLLM o transformers.

Su relevancia es acotada: es un artefacto muy reciente, sin descargas ni valoraciones, sin licencia declarada y sin benchmarks publicados. Resulta interesante como ejemplo de pipeline de especializacion de un MoE grande para tool calling y despliegue en FP8, pero no hay evidencia publica de su rendimiento frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (etiqueta qwen3_5_moe); detalle no disponible |
| Parametros totales | 35.951.822.704 (~36B) |
| Parametros activos | no disponible (el sufijo A3B sugiere del orden de 3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 e4m3 con escala por bloques de 128; fusionado en BF16 antes de recuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP8) |
| Plantilla de chat | qwen3_template333.jinja |
| Tamano del repositorio | 37,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, solo la etiqueta qwen3_5_moe, que apunta a un transformer con capas de mezcla de expertos (MoE). El proceso de construccion si esta documentado: se toma como base Qwen/Qwen3.6-35B-A3B-FP8, se le aplica un adaptador LoRA de rango 32 (qwen3.6-35b-a3b-tool-adapter-sglang) entrenado durante 3 epocas sobre 1515 dialogos de tool-call, se fusiona el adaptador en BF16 y despues se recuantiza por bloques a FP8 e4m3 con escala 128. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; la unica metrica reportada es la perdida de entrenamiento (0.2029) y de evaluacion (0.2047).

Como innovacion practica, el artefacto conserva la convencion de formato y escalas del modelo base, lo que facilita sustituirlo en despliegues ya existentes con sglang, vLLM o transformers. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal u optimizaciones de inferencia propias.

## Capacidades

- Generacion de texto conversacional en el marco de agentes de voz, segun el proposito declarado del autor.
- Tool calling / function calling: es la capacidad objetivo del ajuste, entrenado sobre 1515 dialogos de llamada a herramientas.
- Integracion con plantilla de chat propia (qwen3_template333.jinja), necesaria para reproducir el formato de entrenamiento.
- Despliegue en sglang, vLLM y transformers.
- Razonamiento, codigo, matematicas, vision, audio y capacidades multilingues: no disponible, no se documentan en la informacion proporcionada.
- Modo thinking explicito: no disponible.
- Soporte de agentes multi-paso: no confirmado mas alla del tool calling entrenado.

## Casos de uso

- Agentes de voz para atencion telefonica: el modelo se ha ajustado especificamente para dialogos con llamada a herramientas, de modo que puede encadenar la transcripcion del usuario con la invocacion de funciones de backend (consulta de pedidos, agenda, CRM) en el mismo turno conversacional.
- Enrutado de intenciones con ejecucion de acciones: dado un mensaje de entrada, el modelo decide que herramienta invocar y con que argumentos, util como capa intermedia entre un ASR y los servicios internos de una empresa.
- Automatizacion de tareas administrativas: por ejemplo, rellenar formularios o registrar incidencias invocando APIs REST mediante tool calling, siempre que se valide la salida antes de ejecutar la accion.
- Prototipado de asistentes conversacionales con despliegue en vLLM o sglang: al mantener el formato FP8 del modelo base, se puede integrar en infraestructuras ya preparadas para Qwen3.6-35B-A3B-FP8 con cambios minimos.
- Evaluacion comparativa de pipelines de fine-tuning LoRA sobre MoE grandes: sirve como referencia reproducible para medir el efecto de 3 epocas sobre 1515 dialogos en un modelo de ~36B.
- Servicio de function calling en produccion con requisitos de latencia moderados: al ser un MoE con pocos parametros activos por token, el coste de computo por token es inferior al de un modelo denso del mismo tamano total, aunque requiere memoria suficiente para los pesos completos.
- Investigacion sobre recuantizacion FP8 por bloques: el artefacto documenta el flujo BF16 a FP8 e4m3 con escala 128, util para estudiar perdidas de calidad en ese proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta perdida de entrenamiento de 0.2029 y perdida de evaluacion de 0.2047 durante la fusion del adaptador. No hay datos de MMLU, HumanEval, GSM8K, BFCL ni de ninguna otra evaluacion, ni comparacion con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: los pesos ocupan aproximadamente 37,5 GB (el repositorio incluye esos pesos), por lo que se necesita al menos esa cantidad solo para el modelo, mas el cache KV y el overhead del runtime.
- GPU recomendadas: A100 80 GB, H100 80 GB o cualquier acelerador con 80 GB o mas de memoria permite cargar el modelo en una sola GPU con margen para cache KV.
- Multi-GPU: con 2 x RTX 4090 (48 GB en total) o 2 x L40S seria necesario repartir pesos, ya que 37,5 GB no caben en una unica GPU de 24 o 48 GB junto con el cache KV. No se documentan configuraciones de tensor parallel probadas.
- GPU de consumo: no cabe en una RTX 4090, 3090 o similar de 24 GB en su formato FP8 completo; requeriria cuantizacion adicional (por ejemplo a formatos de 4 bits) que no se proporciona en el repositorio.
- Opciones de despliegue: sglang, vLLM y transformers, segun indica el autor. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. No se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| qwen3.6-35b-a3b-tool-merged-fp8 | ~36B | no disponible (A3B sugiere ~3B) | no disponible | no disponible | Fine-tune LoRA para tool calling, pesos FP8, 0 descargas |
| Qwen/Qwen3.6-35B-A3B-FP8 (modelo base) | ~36B | no disponible | no disponible | no disponible | Modelo de partida; sin datos confirmados en esta ficha |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion verificada en la busqueda realizada |

No se dispone de datos contrastados de modelos comparables dentro de la informacion proporcionada. Las busquedas web realizadas no devolvieron resultados relacionados con este modelo ni con alternativas equivalentes de tool calling en formato MoE FP8.

## Limitaciones y advertencias

- Licencia no declarada: no hay informacion sobre permisos de uso comercial. Al derivar del modelo base Qwen, habria que verificar las condiciones de ese modelo antes de cualquier uso productivo.
- Ausencia total de benchmarks: no hay evidencia publica de que el fine-tune mejore al modelo base en tool calling ni de que no degrade otras capacidades. El ajuste con 1515 dialogos y 3 epocas es un volumen reducido que puede provocar sobreajuste al estilo concreto del dataset.
- Riesgo de alucinacion de herramientas y argumentos: al estar especializado en generar llamadas a funciones, puede inventar nombres de herramientas, parametros o valores inexistentes. Es imprescindible validar y limitar la ejecucion en el lado del servidor.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o seguridad. No hay datos de composicion del dataset, por lo que se desconoce que sesgos puede haber heredado del modelo base o del conjunto de dialogos de entrenamiento.
- Idiomas: no se especifica que idiomas soporta. El ajuste con 1515 dialogos podria haber desplazado el comportamiento multilingue hacia el idioma dominante del dataset, presumiblemente ingles.
- Contexto: se desconoce la longitud de contexto efectiva y si el adaptador afecta al manejo de contextos largos.
- Reproducibilidad: depende de usar la plantilla qwen3_template333.jinja. Omitirla cambia el formato de prompt y degrada el rendimiento de las llamadas a herramientas.
- Madurez: cero descargas y cero valoraciones, publicacion muy reciente y sin validacion por parte de la comunidad.
- Rendimiento en produccion no verificado: no hay cifras de latencia, throughput ni tasa de exito en ejecucion real de tool calls.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/manishkumar2101114/qwen3.6-35b-a3b-tool-merged-fp8
- Modelo base referenciado: Qwen/Qwen3.6-35B-A3B-FP8 (referencia en la model card, enlace no proporcionado)
- Adaptador LoRA referenciado: qwen3.6-35b-a3b-tool-adapter-sglang (referencia en la model card, enlace no proporcionado)
- Plantilla de chat: qwen3_template333.jinja (referencia en la model card, enlace no proporcionado)
