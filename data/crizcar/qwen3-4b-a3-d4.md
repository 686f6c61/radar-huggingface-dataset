# crizcar/qwen3-4b-a3-d4

## Resumen

A3 Temporal es un adaptador LoRA sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario crizcar (repo maty20arriagada/SML-GEN-AI-for-Calendar-services). No es un modelo de lenguaje completo, sino un ajuste fino de la política de decisión de un único agente dentro de un sistema multiagente de cuatro componentes para la gestión de eventos de calendario a partir de mensajes en lenguaje natural. Su función concreta es decidir, en cada paso de un bucle ReAct, qué herramientas deterministas invocar (resolver_fecha, normalizar_hora, calcular_duracion, extraer_recordatorio, extraer_zona_horaria, extraer_recurrencia, expandir_participantes) o si debe terminar, emitiendo un JSON con los campos pensamiento, accion y tools.

El adaptador nace de una necesidad medida: en la iteración anterior del sistema (Deliverable 3), 8 de las 13 fallas residuales sobre 160 entradas de evaluación eran omisiones de este agente, que no invocaba resolver_fecha (5 casos) ni expandir_participantes (3 casos) pese a que la regla ya estaba presente en su prompt. El ajuste busca hacer fiable esa decisión sin modificar el prompt del agente, de modo que las evaluaciones con y sin fine-tuning utilicen exactamente el mismo fichero a3_agente_v1.txt.

Es relevante como ejemplo de adaptación param-efficient (PEFT) orientada a una tarea estrecha y verificable, con etiquetado determinista y sin modelo generador en la anotación. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en safetensors, no los del modelo base. La licencia declarada es Apache 2.0 y los idiomas cubiertos son español e inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-4B-Instruct-2507 tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en bf16; el base puede cuantizarse, pero no se documenta) |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA), librería peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros. El ajuste LoRA se realizó en bf16 con r=16, alpha=32, dropout=0.05 y se aplicó a los módulos q, k, v, o, gate, up y down. La optimización usó learning rate 0.0002, scheduler cosine, batch efectivo 16, 2.0 épocas y 1582 pasos, con pérdida calculada únicamente sobre la respuesta del asistente (completion_only_loss). El entrenamiento se ejecutó en una NVIDIA H100 80GB HBM3 (85,0 GB, pico de 36,07 GB) durante 2996,9 s, a unos 7039 tokens/s, con torch 2.11.0+cu130, transformers 5.17.0, peft 0.21.0 y trl 0.21.0.

Los datos de entrenamiento proceden de 3350 frases sintéticas del Deliverable 2 (train.jsonl y hard_dev.jsonl), de las cuales 3175 resultaron enseñables, generando 13269 pares estado-de-A3 a acción JSON. La distribución por tipo de paso es: paso1 3175, terminar 3175, parcial 3135, falta_clave 2800, objeción 312, terminar_obj 312, nota 180 y terminar_nota 180. El etiquetado es determinista y sin modelo generador: la acción se define como la política de llamar a las herramientas que la frase requiere (reglas 1-2 del prompt) y se descarta la frase si alguna herramienta no reproduce su ground truth. La separación con el conjunto de evaluación es estricta: 0 solapes exactos y similitud máxima con cualquier frase de evaluación de 0,467 en 3-gramas de palabras (umbral 0,5) y 0,57 en 3-gramas de caracteres (umbral 0,8). El hash sha256 del dataset es 5fec3fcd144678a279a5d5981802b4073f8107769a61c1dfd66e83abddda6c87. El resultado declarado es train loss final 0.0000 y acción exacta en validación de 200/200.

## Capacidades

- Decisión de invocación de herramientas deterministas en un bucle ReAct, emitiendo JSON con pensamiento, acción (llamar o terminar) y lista de tools.
- Clasificación de la intención temporal de una frase en lenguaje natural: fecha, hora, duración, recordatorio, zona horaria, recurrencia y participantes.
- Gestión de estados parciales del agente: paso1, terminar, parcial, falta_clave, objeción, terminar_obj, nota y terminar_nota.
- Tool calling estructurado restringido a un conjunto fijo de siete herramientas del dominio de calendario.
- Razonamiento multi-paso dentro de un único agente (no es un orquestador de los otros tres agentes del sistema).
- Capacidad multilingüe limitada a español e inglés, según la model card.
- No incorpora visión, audio ni modo de pensamiento extendido más allá del campo pensamiento del JSON de salida.

## Casos de uso

- Automatización de la creación de eventos de calendario: el adaptador decide qué herramientas invocar para convertir un mensaje como "reunión el jueves a las 10 con Ana y Luis durante una hora" en los nueve campos del evento, delegando el cálculo real en funciones deterministas.
- Integración en asistentes conversacionales de agenda: al ser un adaptador pequeño sobre un modelo de 4B, puede desplegarse junto al base en un servicio de bajo coste que gestione turnos multi-paso con estado parcial.
- Corrección de omisiones en pipelines existentes: sirve como sustituto del prompt de A3 en sistemas ya construidos, ya que las evaluaciones E4 y E4FT comparten el mismo fichero a3_agente_v1.txt y permiten medir la mejora de forma aislada.
- Extracción de recordatorios y recurrencias: el agente decide cuándo llamar a extraer_recordatorio y extraer_recurrencia, útil en aplicaciones de gestión de tareas con repetición semanal o mensual.
- Normalización de zonas horarias y horas: en flujos con usuarios en Madrid y Argentina, el agente invoca extraer_zona_horaria y normalizar_hora antes de fijar el evento, aunque el alcance de zonas está limitado (ver limitaciones).
- Investigación en PEFT y agentes: el repositorio incluye configuración completa, curva de pérdida y log_history.json, lo que lo hace útil como caso reproducible de ajuste LoRA con etiquetado determinista y separación estricta train/eval.
- Expansión de participantes en textos con listas: el agente llama a expandir_participantes cuando la frase enumera asistentes, uno de los fallos que el ajuste busca corregir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas internas de entrenamiento y validación:

| Metrica | Valor |
|---|---|
| Train loss final | 0.0000 |
| Acción exacta en validación | 200/200 |
| Throughput de entrenamiento | ~7039 tokens/s |
| Tiempo de entrenamiento | 2996,9 s en H100 80GB |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de evaluaciones comparativas frente al modelo base sin adaptador.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; el coste real de inferencia lo determina el modelo base Qwen3-4B-Instruct-2507.
- VRAM estimada para el base en bf16: alrededor de 8 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 4 bits cabría en GPUs consumer de 6-8 GB, aunque el autor no documenta cuantizaciones del adaptador.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H100 80GB HBM3; para inferencia bastan GPUs consumer de gama media-alta, si bien no se publican mediciones de latencia ni throughput en inferencia.
- Cabe en GPU consumer: sí, con el modelo base en precisión reducida o cuantizado; no hay confirmación oficial del autor.
- Opciones de despliegue: la model card solo documenta uso con transformers y peft (PeftModel.from_pretrained). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la fusión del adaptador en el base no está documentada.
- Latencia y throughput estimados: no disponibles para inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador frente a alternativas, por lo que la comparación se limita a características estructurales.

| Modelo | Tipo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| crizcar/qwen3-4b-a3-d4 | Adaptador LoRA sobre Qwen3-4B-Instruct-2507 | 4B (base) | no disponible | apache-2.0 | Especializado en política de herramientas de un agente de calendario |
| Qwen/Qwen3-4B-Instruct-2507 | Modelo base instruct | 4B | no disponible | apache-2.0 | Uso general; sin ajuste específico para el bucle ReAct de A3 |
| Adaptadores LoRA de dominio público para tool calling | Adaptadores PEFT | variable | variable | variable | No disponible una comparación cuantitativa con este adaptador |

No se conocen benchmarks públicos que permitan comparar este adaptador con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo ajusta la política de invocación de herramientas del agente A3; las herramientas siguen siendo deterministas y el adaptador no corrige lo que ellas no cubren, como zonas horarias distintas de Madrid y Argentina o expresiones del tipo "sab 24 oct".
- Entrenado exclusivamente con frases sintéticas y evaluado con frases redactadas por el equipo, con un tamaño de muestra pequeño.
- Un solo entrenamiento y una sola semilla, sin validación cruzada ni estimación de varianza.
- El train loss final de 0.0000 y el 200/200 en validación sugieren un ajuste muy estrecho al dominio; existe riesgo de sobreajuste y de degradación fuera de la distribución de frases sintéticas.
- Riesgo de alucinación en el campo pensamiento y en la selección de herramientas cuando la frase no encaja en los patrones entrenados; el JSON de salida debe validarse en producción.
- Idiomas limitados a español e inglés; no se documenta comportamiento en otras lenguas.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base Qwen3-4B-Instruct-2507 de forma independiente.
- El adaptador no es un modelo autónomo: requiere el prompt a3_agente_v1.txt y el formato de mensaje del repositorio para funcionar como se entrenó.
- No se documentan sesgos específicos, pero al derivar del modelo base puede heredar los sesgos de este.

## Enlaces

- Hugging Face: https://huggingface.co/crizcar/qwen3-4b-a3-d4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del proyecto: https://github.com/maty20arriagada/SML-GEN-AI-for-Calendar-services (carpeta Deliverable4/)
- Prompt del agente: Deliverable3/deliverable3/prompts/a3_agente_v1.txt (dentro del repositorio anterior)
- Artefactos de entrenamiento: curva_loss.png, log_history.json y config_entrenamiento.json (en el repositorio de Hugging Face)
