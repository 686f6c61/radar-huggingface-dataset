# atrezonator/Qwen3.8-27B-Ultimate-Heretic-Uncensored

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored es un ajuste fino (finetune) del modelo base Qwen/Qwen3.8-27B, publicado por el usuario atrezonator en Hugging Face. Se presenta como una variante "Heretic" y "Uncensored", es decir, con los mecanismos de rechazo (refusals) reducidos o eliminados mediante técnicas de ablación, y con un conjunto de modos de operación embebidos en el propio modelo (razonamiento, instruct, constructos de IA y supuestos constructos AGI) bajo la marca "Turbo Brilliance V2 50X". El modelo tiene 27.781.427.952 parámetros reales según los safetensors, lo que lo sitúa en la categoría de modelos densos de ~27B, con licencia Apache 2.0 y pesos en safetensors y bfloat16.

El modelo se distribuye con pipeline image-text-to-text, lo que sugiere capacidades multimodales heredadas del base, aunque la model card no detalla la arquitectura de visión. Los idiomas declarados son 16 (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita). El repositorio ocupa 55,6 GB, coherente con pesos en bfloat16 de un modelo de ~27B.

La relevancia de esta ficha es doble: por un lado, documenta un caso de finetune comunitario sobre un modelo Qwen de tercera generación (etiquetado qwen3_5/qwen3_8 en los tags); por otro, advierte de que gran parte de las capacidades anunciadas (27 modos de razonamiento, 15 constructos de IA, 5 super constructos, 21 constructos AGI) son afirmaciones del autor sin verificación independiente ni benchmarks publicados en la información disponible. El modelo no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8; tags qwen3_5/qwen3_8); multimodal image-text-to-text segun pipeline |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | Hasta 256k tokens segun la model card; minimo recomendado 32k, sugerido 64k-128k |
| Tipos de cuantizacion | Pesos fuente en bfloat16; GGUFs publicados en repositorio separado del autor (DavidAU); cuantizaciones concretas no detalladas |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fuente), GGUF (repositorio derivado) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la pertenencia a la familia Qwen3.8 y del pipeline image-text-to-text, que implica un codificador visual acoplado a un decoder de lenguaje. El modelo es un finetune del base Qwen/Qwen3.8-27B, no un entrenamiento desde cero, aunque el autor lo describe como "from scratch branch" en el sentido de rama de proyecto derivada de un trabajo mayor (Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU).

El entrenamiento se anuncia como "multi-stage tuning" con técnicas denominadas "Cold Fusion" y "GAIN Training", sobre los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. La componente "Heretic" hace referencia a la eliminación de comportamientos de rechazo mediante ablación de direcciones de activación (el autor menciona "Heretic 2.1 ARA" con "deeper refusal removal, better KLD"), una técnica de edición de pesos que busca reducir la tasa de negativas sin reentrenar por RLHF completo. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de DPO o RLHF. Las innovaciones declaradas (Turbo Brilliance V2 50X, 27 modos de razonamiento, 27 modos instruct, constructos de IA y AGI) son mecanismos de prompting y selección de modo embebidos en el modelo, no cambios arquitectónicos verificables con la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 256k tokens.
- Razonamiento con modos "thinking" declarados (27 modos de razonamiento y 9 modos "Xhigh" según los tags).
- Generación de código y modos específicos de coder ("Coder AI Construct").
- Capacidades multimodales de entrada imagen-texto (pipeline image-text-to-text).
- Escritura creativa, ficción, roleplaying y generación por géneros (declarado en tags).
- Tool calling / function calling: no confirmado explícitamente en la información disponible; el autor recomienda temperatura 0,6-0,7 para herramientas y agentes, lo que sugiere soporte.
- Modos de agente y razonamiento multi-paso ("Agent AI Construct", "multi-step reasoning" implícito en los constructos).
- Sistema de ayuda interactivo: introducir "help" como prompt activa la lista de modos instruct, razonamiento, constructos de IA y AGI.
- Multilingüe en 16 idiomas.
- Modo "uncensored": reducción deliberada de rechazos ante peticiones que el base rechazaría.

## Casos de uso

- Escritura creativa y ficción: el modelo incorpora modos específicos de story, fiction y roleplaying, y su ventana de 256k permite mantener arcos narrativos largos con coherencia de personajes y tramas a lo largo de decenas de miles de tokens.
- Generación de código en pipelines de desarrollo: el "Coder AI Construct" y la temperatura recomendada de 0,6-0,7 para herramientas permiten integrarlo en asistentes de código y tareas de refactorización, aunque la ausencia de benchmarks de HumanEval impide cuantificar su calidad frente al base.
- Atención al cliente automatizada: con contexto de 64k-128k se pueden inyectar manuales de producto, historial de tickets y políticas en el prompt sin truncar, manteniendo conversaciones multi-turno con memoria extensa.
- Investigación sobre alineación y seguridad: al ser una variante "Heretic" con rechazos ablacionados, es útil para estudiar el efecto de la eliminación de refusals en la tasa de respuestas dañinas, la calibración y la tasa de alucinación frente al Qwen3.8-27B original.
- Procesamiento de documentos largos con imagen: el pipeline image-text-to-text permite extraer y razonar sobre información de capturas, diagramas o páginas escaneadas junto a texto extenso, útil en digitalización de archivos técnicos.
- Generación de material educativo multilingüe: con 16 idiomas declarados, puede producir explicaciones y ejercicios en español, árabe, hindi o vietnamita a partir de una misma fuente, aunque la calidad por idioma no está verificada.
- Prototipado de agentes: los modos "Agent AI Construct" y la recomendación de parámetros para agentes permiten construir flujos de tool calling y planificación multi-paso en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos; solo describe pruebas cualitativas del autor (procesamiento de ~8.000 tokens de instrucciones en unos 60 segundos en una prueba "mega test" con cuantización Q6), que no constituyen benchmarks reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~55,6 GB de pesos, más overhead de KV cache; se necesitan al menos 64 GB de VRAM para contexto corto y bastante más para 128k-256k tokens.
- Cuantización Q8: ~28-30 GB, viable en una RTX 4090 (24 GB) solo con contexto muy reducido o en configuraciones multi-GPU; una A100 40GB o H100 80GB es el objetivo natural.
- Cuantización Q6: ~22-24 GB, al límite de una RTX 4090 de 24 GB con contexto corto; el autor reporta pruebas en Q6.
- Cuantización Q4: ~16-18 GB, cabe en RTX 4090 y en GPUs de 24 GB con contexto moderado.
- GPU recomendadas: H100 80GB o A100 80GB para bfloat16 y contexto largo; A100 40GB o RTX 4090 para cuantizaciones Q6/Q4.
- Despliegue: transformers (librería declarada), llama.cpp/Ollama para GGUF, vLLM y TGI no confirmados en la información disponible.
- Latencia y throughput: no disponibles; el autor cita ~60 segundos para una generación de ~3k tokens tras procesar ~8k tokens de instrucciones en una configuración concreta, dato no extrapolable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored | ~27,8B | hasta 256k | Apache 2.0 | Finetune comunitario con rechazos ablacionados; sin benchmarks publicados |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible en esta ficha | Apache 2.0 (presumible, no confirmado) | Modelo original; referencia para medir el efecto del finetune |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored | ~40B | no disponible | Apache 2.0 (presumible) | Variante mayor del mismo autor, citada en la model card |
| DavidAU/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored | ~31B | no disponible | no disponible | Variante experimental con transformer en bucle, citada en la model card |

La comparación cuantitativa de rendimiento no es posible con la información disponible, ya que ninguno de los modelos citados publica resultados de benchmarks en esta ficha.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia numérica de que el finetune preserve las capacidades del base; el "multi-stage tuning" y la ablación de rechazos pueden degradar razonamiento, matemáticas o código.
- Riesgo elevado de alucinación y de respuestas dañinas: la eliminación deliberada de refusals ("uncensored", "deeper refusal removal") implica que el modelo puede producir contenido que el base rechazaría, sin filtros de seguridad efectivos.
- Afirmaciones no verificadas: los "27 modos de razonamiento", "15 AI Constructs", "21 AGI Constructs" y "Turbo Brilliance V2 50X" son terminología del autor sin definición técnica pública ni validación independiente; no deben interpretarse como capacidades AGI reales.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue en producción de un modelo sin filtros de rechazo exige auditoría propia de seguridad y cumplimiento normativo (por ejemplo, en la UE, el AI Act para sistemas de riesgo alto).
- Idiomas: aunque se declaran 16, no hay evaluación por idioma; el rendimiento en español, árabe o tailandés puede ser notablemente inferior al inglés.
- Contexto: los 256k tokens anunciados no están verificados; a contextos largos el rendimiento y la coherencia pueden degradarse y el coste de KV cache es elevado.
- Repositorio con 0 descargas y 0 likes: sin comunidad que valide el modelo, sin issues resueltos ni informes de terceros.
- El autor recomienda leer el repositorio GGUF derivado para ajustes críticos, lo que indica que la model card principal no es autosuficiente para un despliegue correcto.
- Posible confusión de nomenclatura: los tags qwen3_5 y qwen3_8 junto a un base "Qwen/Qwen3.8-27B" no permiten confirmar la generación exacta del modelo subyacente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atrezonator/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Repositorio GGUF con ajustes y documentación (autor DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Variante 40B del mismo autor: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored
- GGUFs de la variante 40B: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Variante 40B Build2: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Build2
- Variante 31B Looping Transformer: https://huggingface.co/DavidAU/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored
- Proyecto origen (rama mayor): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Perfil del autor de la técnica: https://huggingface.co/DavidAU
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
