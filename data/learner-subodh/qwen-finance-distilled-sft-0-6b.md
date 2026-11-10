# learner-subodh/qwen-finance-distilled-sft-0.6b

## Resumen

Qwen Finance-Distilled-SFT 0.6B es un modelo de lenguaje compacto de 596 millones de parámetros publicado por el usuario `learner-subodh` en Hugging Face. Se construye sobre Qwen3-0.6B de Alibaba y se especializa en razonamiento numérico financiero y question answering sobre tablas financieras. El modelo es el resultado de un ejercicio educativo de adaptación de modelos pequeños mediante un pipeline de dos etapas: destilación de respuestas verificadas desde un teacher (Qwen3-8B) y un posterior fine-tuning supervisado dirigido a corregir fallos concretos.

La propuesta técnica es interesante porque documenta un bucle de corrección completo: se minan fallos del split de entrenamiento, se filtran las respuestas del teacher mediante verificación determinista contra las anotaciones, se corrigen los objetivos con el gold y se hace replay con datos de destilación. Todo el proceso se ejecuta con QLoRA sobre una única NVIDIA Tesla T4, lo que lo hace reproducible en hardware de consumo.

Es relevante ahora porque explora la viabilidad de modelos sub-1B para tareas financieras estructuradas (FinQA, TAT-QA) con un formato de respuesta controlado, aunque el propio autor lo presenta explícitamente como un experimento educativo y no como un sistema validado para producción ni para decisiones financieras de alto impacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Qwen3) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (entrenamiento con secuencia máxima de 1024 tokens) |
| Tipos de cuantización | no disponible (entrenamiento con QLoRA; pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); el repo no incluye adaptadores LoRA, solo pesos fusionados |

## Arquitectura y entrenamiento

El modelo es un Transformer causal decoder-only de la familia Qwen3, inicializado desde Qwen3-0.6B (revisión `c1899de289a04d12100db370d81485cdf75e47ca`). El entrenamiento se organiza en dos etapas. La primera es una destilación basada en respuestas verificadas desde el teacher Qwen3-8B (revisión `b968826d9c46dd6066d109eabc6255188de91218`): las respuestas del teacher se filtran mediante verificación determinista contra las anotaciones de entrenamiento, de modo que solo se usa como supervisión aquello que coincide con el gold. La segunda etapa parte del checkpoint destilado y aplica SFT dirigido con ejemplos construidos a partir de fallos minados en el split de entrenamiento, rechazos del teacher corregidos con el gold y muestras de replay del conjunto de destilación.

La adaptación se realizó con QLoRA: rango LoRA 16, alpha 32, dropout 0.05, longitud máxima de secuencia 1024, batch efectivo 4, semilla 42 y una sola NVIDIA Tesla T4. Los pesos publicados son el resultado de fusionar el adaptador con el modelo base, no un repositorio de adaptadores. Los datos de entrenamiento provienen del split de train de FinQA, el split de train de TAT-QA y ejemplos financieros sintéticos generados programáticamente; según el autor, no se usaron intencionadamente ejemplos de validación ni de test oficiales como objetivos de entrenamiento. El modelo emplea una convención de respuesta estructurada con tres campos (`Calculation`, `Answer`, `Scale`) y una etiqueta `NOT_ANSWERABLE` para contextos insuficientes.

## Capacidades

- Generación de texto y razonamiento numérico sobre contexto financiero aportado por el usuario.
- Question answering sobre tablas financieras (orientado a FinQA y TAT-QA).
- Cálculo estructurado con expresión aritmética explícita y valor resultante.
- Normalización de escala en la respuesta (thousand, million, billion, percent, none).
- Gestión de no-answerability: devuelve `NOT_ANSWERABLE` cuando el contexto no permite responder.
- Conversación multi-turno básica heredada del modelo base Qwen3.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes o multi-step reasoning autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Prototipado de QA sobre informes financieros: el modelo recibe el texto o la tabla del informe como contexto y devuelve una respuesta con la expresión de cálculo y la escala, lo que facilita la validación posterior contra la fuente original.
- Extracción de métricas de tablas en estados financieros: dado un fragmento tabular, el modelo genera el cálculo explícito (por ejemplo, una variación porcentual) y el valor final, útil para pipelines de extracción asistida en investigación.
- Investigación sobre destilación de modelos pequeños: sirve como caso reproducible de pipeline teacher-student con verificación determinista, útil para estudiar cómo se transfiere capacidad numérica a modelos sub-1B.
- Evaluación comparativa de SFT frente a destilación: el checkpoint permite replicar el protocolo del autor (prompts idénticos, decodificación greedy) frente a Qwen3-0.6B y Qwen3-8B.
- Docencia y experimentación académica: adecuado para prácticas sobre QLoRA, selección de ejemplos por fallos y corrección con gold en entornos con una sola GPU T4.
- Filtrado de answerability en asistentes documentales: la etiqueta `NOT_ANSWERABLE` puede usarse como señal para derivar consultas a un humano cuando el contexto recuperado no contiene la información necesaria.
- Generación de datasets sintéticos financieros de estructura controlada: el formato de tres campos facilita la construcción de pares pregunta-respuesta verificables de forma programática.

## Benchmarks y rendimiento

El autor reporta una evaluación comparativa exploratoria frente a Qwen3-0.6B y Qwen3-8B con prompts idénticos y decodificación greedy, sobre 50 ejemplos por benchmark. No se publican los valores numéricos en la información disponible, por lo que no se incluye tabla de resultados.

Advertencias del propio autor sobre la evaluación:
- FinQA se evalúa con comparación numérica determinista, no con la métrica oficial de program-matching.
- TAT-QA usa el scorer aproximado de fallback en esta ejecución.
- Solo 50 ejemplos por benchmark.
- Algunos contextos largos se truncaron al presupuesto de tokens configurado.
- Las comprobaciones de robustez usan un suite sintético pequeño.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica cabe holgadamente en GPUs con 4-6 GB.
- Cuantización a 8 bits: alrededor de 0,6 GB de pesos; a 4 bits: alrededor de 0,3-0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también Tesla T4, que es el hardware usado en el entrenamiento.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más, e incluso en CPU con llama.cpp para uso no interactivo.
- Opciones de despliegue: Transformers (referencia del autor), text-generation-inference (el repo está marcado como endpoints_compatible), vLLM, llama.cpp u Ollama si se generan pesos GGUF a partir del checkpoint.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen Finance-Distilled-SFT 0.6B | 596 M | no disponible | QA financiero y razonamiento numérico sobre contexto | Apache 2.0 | Hugging Face |
| Qwen3-0.6B | 0,6 B | no disponible en esta ficha | Propósito general | Apache 2.0 | Hugging Face |
| Qwen3-8B | 8 B | no disponible en esta ficha | Propósito general (teacher del proyecto) | Apache 2.0 | Hugging Face |
| Modelos financieros especializados de tamaño medio (p. ej. variantes fine-tuned de 7B) | 7 B | variable | QA financiero | variable | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: el autor no publica los valores numéricos de su evaluación exploratoria, por lo que no es posible establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- El propio autor clasifica el proyecto como ejercicio educativo y experimental, no como sistema validado para producción.
- Puede producir cálculos incorrectos, interpretar mal las unidades, omitir entradas relevantes de la tabla o devolver respuestas no soportadas por el contexto.
- No está validado para recomendaciones de inversión, decisiones de crédito o suscripción, previsiones financieras, determinaciones regulatorias ni operaciones financieras autónomas.
- El entrenamiento usa una única semilla; los resultados no establecen generalización entre dominios financieros, formatos de documento u organizaciones.
- La evaluación se hizo sobre 50 ejemplos por benchmark, con truncamiento de contextos largos y scorers no oficiales en FinQA y TAT-QA.
- No hay información sobre sesgos, cobertura idiomática ni comportamientos de alucinación medidos de forma sistemática.
- Licencia Apache 2.0 en el checkpoint, pero el autor recomienda revisar los términos de licencia de los modelos upstream (Qwen3-0.6B y Qwen3-8B) y de los datasets (FinQA, TAT-QA) antes de redistribuir o usar comercialmente.
- El modelo opera únicamente sobre el contexto suministrado; no recupera información financiera actual de forma autónoma.
- El contexto máximo efectivo no está documentado más allá de la longitud de secuencia de entrenamiento (1024 tokens), lo que limita documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/learner-subodh/qwen-finance-distilled-sft-0.6b
- Modelo base (student): https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo teacher: https://huggingface.co/Qwen/Qwen3-8B
- Paper o blog del proyecto: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
