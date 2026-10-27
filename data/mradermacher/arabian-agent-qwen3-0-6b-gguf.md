# mradermacher/Arabian-Agent-Qwen3-0.6B-GGUF

## Resumen

Arabian-Agent-Qwen3-0.6B-GGUF es la versión cuantizada en formato GGUF del adaptador Kenvenx/Arabian-Agent-Qwen3-0.6B, un ajuste fino mediante LoRA sobre Qwen3-0.6B orientado a function calling y uso de herramientas (tool use) en árabe e inglés. Lo publica mradermacher, un cuantizador independiente conocido por generar versiones GGUF estáticas de modelos populares para su uso con llama.cpp y derivados; no es el autor del modelo original ni del entrenamiento.

El modelo resuelve un nicho concreto: agentes ligeros que necesitan invocar funciones con argumentos en árabe sobre hardware modesto. Con 596.049.920 parámetros (aproximadamente 0,6 mil millones) y arquitectura transformer densa heredada de la familia Qwen3, está pensado para ejecutarse en CPU, GPUs de consumo e incluso dispositivos móviles, lo que lo sitúa en la franja de coste casi nulo por inferencia.

Su relevancia ahora es doble: por un lado, Qwen3 ha consolidado el soporte de tool calling y agentes en la gama pequeña; por otro, existe una carencia notable de modelos de agentes afinados específicamente para árabe. La licencia Apache 2.0 facilita su integración comercial. La contrapartida es que no hay evaluación publicada: la model card del cuantizador es puramente mecánica y no incluye métricas de calidad del ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajuste fino LoRA sobre Qwen3-0.6B |
| Parámetros totales | 596.049.920 (≈0,6 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens según la arquitectura Qwen3-0.6B; no verificado en la model card del autor |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 (12 variantes estáticas; sin cuantizaciones ponderadas/imatrix) |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

Tamaños de archivo declarados por el autor: 0,4 GB (Q2_K, Q3_K_S, Q3_K_M), 0,5 GB (Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M), 0,6 GB (Q6_K), 0,7 GB (Q8_0) y 1,3 GB (F16). El repositorio completo ocupa 5,7 GB.

## Arquitectura y entrenamiento

La base es Qwen3-0.6B, un transformer denso con atención por grupos (GQA) y tokenizador multilingüe de la familia Qwen. Sobre ese modelo se aplicó un ajuste fino LoRA (el campo `base_model:adapter` de los metadatos confirma que Kenvenx/Arabian-Agent-Qwen3-0.6B es un adaptador, no un modelo fusionado) orientado a function calling en árabe. mradermacher ha convertido y cuantizado esos pesos a GGUF con `convert_type: hf`, `quantize_version: 2` y `output_tensor_quantised: 1`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las técnicas de alineación empleadas en el ajuste LoRA: la model card del adaptador original no está incluida en la información proporcionada. Tampoco se documentan innovaciones técnicas propias más allá de la herencia de Qwen3 (soporte de modo thinking en la familia, plantilla de chat con formato de tool calls). No hay datos sobre el proceso de fusión de pesos ni sobre si el adaptador se fusionó antes de la conversión a GGUF.

## Capacidades

- Generación de texto conversacional en árabe e inglés, con orientación a instrucciones.
- Function calling / tool use: el ajuste está específicamente entrenado para emitir llamadas a funciones con argumentos estructurados.
- Flujos de agente de un solo paso o cadenas cortas: selección de herramienta, extracción de parámetros y generación de la llamada.
- Soporte de conversaciones multi-turno con historial dentro de la ventana de contexto (si se respeta la plantilla de chat de Qwen3).
- Capacidad multilingüe limitada a árabe e inglés según los metadatos; el tokenizador subyacente de Qwen3 cubre más idiomas, pero el ajuste no los refuerza.
- Razonamiento básico y matemáticas simples, acotados por el tamaño de 0,6 B.
- No se declaran capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistentes de voz o chat en árabe en el dispositivo: con Q4_K_M (0,5 GB) el modelo cabe en un móvil o en una Raspberry Pi y puede resolver intenciones y llamar a APIs locales sin conexión.
- Enrutamiento de intenciones en backends árabes: usar el modelo como clasificador generativo que decide qué herramienta invocar (reserva, consulta de pedido, soporte) antes de derivar a un modelo mayor, reduciendo coste por petición.
- Extracción de parámetros estructurados: convertir una frase en árabe ("quiero cambiar mi vuelo del martes") en un JSON con los campos esperados por el sistema, aprovechando el entrenamiento en tool use.
- Atención al cliente bilingüe árabe-inglés: conversaciones multi-turno con contexto de hasta 32.768 tokens (según la arquitectura base) para mantener el hilo de una incidencia.
- Agentes locales de automatización doméstica u ofimática: control de dispositivos o generación de comandos mediante function calling en entornos sin GPU dedicada.
- Evaluación y desarrollo de pipelines de agentes: al ser determinista en coste y ejecutable en CI, sirve para probar plantillas de herramientas, validadores de esquema y lógica de reintentos antes de pasar a modelos de 7 B o superiores.
- Generación de datos sintéticos de tool calling en árabe para ampliar conjuntos de evaluación o para destilar comportamiento en modelos mayores.
- Componente de un sistema en cascada: primera pasada barata que responde consultas triviales y solo escala a un modelo grande cuando la confianza o el esquema JSON fallan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del cuantizador ni los metadatos del repositorio incluyen evaluaciones de MMLU, HumanEval, GSM8K ni métricas específicas de function calling (por ejemplo, precisión de llamada o validez del esquema JSON). Tampoco se proporcionan comparaciones con el modelo base Qwen3-0.6B ni con otros adaptadores en árabe.

## Requisitos de hardware

- VRAM para pesos: 1,3 GB en F16, 0,7 GB en Q8_0, 0,5 GB en Q4_K_M y Q5_K_M, 0,4 GB en Q2_K y Q3_K_S. Cabe holgadamente en cualquier GPU de consumo.
- Caché KV: no publicado. Con la configuración de Qwen3-0.6B (GQA de 8 cabezas KV, 28 capas) se estima en torno a 112 KiB por token en F16, es decir, unos 3,5 GB a 32.768 tokens; conviene usar cuantización de caché (Q8_0/Q4_0 en llama.cpp) si se explota el contexto completo.
- GPU recomendadas: cualquier GPU con 2 GB o más (GTX 1650, RTX 3060/4060/4090, A100/H100 sin aprovechamiento real por el tamaño). También funciona en CPU (AVX2) y en Apple Silicon vía Metal.
- Cabe en GPU de consumo y en hardware edge: móvil de gama alta, Raspberry Pi 5, mini-PC con CPU moderna.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, LM Studio, llama-cpp-python, Jan, KoboldCpp. vLLM solo con soporte GGUF experimental; TGI no soporta GGUF.
- Latencia y throughput: no hay mediciones publicadas. Como referencia orientativa, en un solo usuario se espera del orden de decenas de tokens por segundo en CPU moderna con Q4_K_M, y de varios cientos a más de mil tokens por segundo en una RTX 4090; son estimaciones por tamaño de modelo, no datos medidos.
- Requisito crítico: hay que aplicar la plantilla de chat de Qwen3 con el formato de tool calls correcto; sin ella el rendimiento en function calling se degrada aunque el modelo cargue bien.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Tool calling | Licencia | GGUF disponible |
|---|---|---|---|---|---|---|
| Arabian-Agent-Qwen3-0.6B (este) | 0,6 B | 32.768 (héritado de Qwen3-0.6B) | ar, en | Sí, ajustado específicamente | Apache 2.0 | Sí, 12 variantes |
| Qwen/Qwen3-0.6B | 0,6 B | 32.768 | Multilingüe amplio | Sí, genérico | Apache 2.0 | Sí (repo oficial Qwen3-0.6B-GGUF) |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 | Multilingüe | Parcial, no especializado | Apache 2.0 | Sí, ampliamente disponible |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Multilingüe (8 idiomas oficiales) | Sí, genérico | Licencia comunitaria Llama 3.2 | Sí |

Frente a Qwen3-0.6B genérico, este modelo intercambia cobertura multilingüe por especialización en árabe y tool calling, a costa de perder cualquier capacidad no reforzada por el ajuste. Frente a Llama-3.2-1B-Instruct, ofrece la mitad de parámetros y una licencia más permisiva, pero un contexto declarado mucho menor y sin evaluación comparativa de calidad.

## Limitaciones y advertencias

- No existe ninguna evaluación publicada del ajuste: se desconoce si mejora realmente al Qwen3-0.6B base en árabe o en precisión de llamadas a funciones.
- Sesgos: no documentados. Un modelo entrenado con datos en árabe puede reproducir sesgos dialectales (por ejemplo, favorecer árabe del Golfo frente a magrebí) y estereotipos presentes en el corpus, sin que el autor los haya analizado.
- Alucinación: con 0,6 B de parámetros el riesgo es alto, especialmente en los argumentos de las llamadas a funciones (identificadores, fechas, importes). Es imprescindible validar el JSON contra un esquema y no ejecutar herramientas sin comprobación.
- El ajuste LoRA puede degradar capacidades generales del modelo base (conocimiento factual, matemáticas) al especializarse en agentes.
- La plantilla de chat y el formato de tool calls deben coincidir exactamente con los usados en el entrenamiento; un formato distinto (por ejemplo, XML en lugar del formato de Qwen) provoca fallos silenciosos.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan de forma notable un modelo ya de por sí pequeño; para producción conviene Q4_K_M o superior.
- No hay cuantizaciones ponderadas/imatrix: el autor indica que probablemente no las genere, por lo que no se dispone de la mejora de calidad habitual en IQ-quants a igual tamaño.
- Idiomas: solo árabe e inglés declarados; no se garantiza comportamiento en castellano ni en otros idiomas.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene verificar la licencia del adaptador original (Kenvenx/Arabian-Agent-Qwen3-0.6B), que no se detalla en la información disponible.
- Modelo con 0 descargas en el momento de la ficha: no hay evidencia de uso en producción ni retroalimentación de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Arabian-Agent-Qwen3-0.6B-GGUF
- Modelo base (adaptador LoRA): https://huggingface.co/Kenvenx/Arabian-Agent-Qwen3-0.6B
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#Arabian-Agent-Qwen3-0.6B-GGUF
- Qwen3-0.6B en GGUF (modelo original): https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- Qwen3-0.6B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_0_6b
- Ficha de Qwen3-0.6B-GGUF en ModelScope: https://www.modelscope.cn/models/unsloth/Qwen3-0.6B-GGUF/summary
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
