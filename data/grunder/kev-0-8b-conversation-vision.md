# Grunder/kev-0.8b-conversation-vision

## Resumen

Kev-0.8B Conversation + Vision es un adaptador de decisión, no un modelo generativo, publicado por Grunder Labs (perfil de HuggingFace Grunder) para el proyecto ZoE / Grunder y mantenido por StealthySalamander47. Parte de jaredpalmer/kev-0.8b y de Qwen/Qwen3.5-0.8B-Base: recibe un documento de estado más un conjunto de preguntas tipadas y devuelve, en una única pasada, una distribución de probabilidad por pregunta. La versión aquí descrita añade dos etapas de ajuste LoRA y cabezas pointer para control de conversación en inglés y alemán, y reconecta el codificador de visión original de Qwen3.5 al mismo backbone de lenguaje.

El modelo resuelve un problema muy concreto dentro de pipelines de voz y de agentes: decidir el turno conversacional (responder, redirigir, continuar, escuchar, callar, ausentarse, turno inacabado, retomar), respetar el suelo conversacional mediante un adaptador de pausa independiente y clasificar contenido visual cuando se le aporta una imagen, un estado y una pregunta con opciones.

La relevancia actual está en su tamaño: un backbone denso de 0,8B parámetros con 10.822.656 parámetros LoRA entrenables y tres rutas de adaptador residentes con temperaturas calibradas, lo que permite ejecutarlo en GPU de consumo y usarlo como componente de decisión local y offline. No genera texto, no transcribe audio, no sintetiza voz ni constituye por sí mismo una aplicación de llamada completa; es una pieza de enrutado y clasificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-0.8B-Base congelado) con adaptadores LoRA y cabeza pointer de lectura; rama de visión Qwen3.5 congelada (encoder + merger/proyector) |
| Parámetros totales | 0,8B en el backbone base (Qwen/Qwen3.5-0.8B-Base) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Parámetros entrenables | 10.822.656 parámetros LoRA actualizados en esta release (el adaptador upstream declara r=16 y 11,3M parámetros entrenables) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican pesos cuantizados en la información proporcionada) |
| Idiomas soportados | Inglés (en) y alemán (de) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch y safetensors (adaptadores LoRA y cabezas); el backbone base se descarga aparte desde el repositorio fijado de Qwen. Tamaño del repositorio: 0,2 GB |
| Rutas de adaptador | Tres checkpoints: `models/kev-0.8b-conversation-candidate` (temperatura 4,4139146805), `models/kev-0.8b-conversation-local` (temperatura 4,3553471565), `models/kev-0.8b` (temperatura 2,3510958126) |
| Entorno de ejecución | Python 3.12, PyTorch 2.8.0 (CUDA 12.8), NVIDIA CUDA; no hay fallback a CPU |
| Visión | Hasta cuatro imágenes locales en PNG, JPEG, WebP o BMP por petición; sin entrenamiento de visión adicional en esta release |
| Fecha de publicación | 2026-10-08 (versión 1.0.0) |

## Arquitectura y entrenamiento

La arquitectura mantiene un único backbone de lenguaje Qwen3.5 de 0,8B parámetros, congelado, compartido por tres rutas de inferencia. Sobre él se montan adaptadores LoRA y una cabeza pointer que produce distribuciones de probabilidad sobre las opciones suministradas en cada pregunta. Cada ruta lleva asociada una temperatura ajustada, de modo que la selección de adaptador depende del contrato exacto de la pregunta: el contrato de conversación, el contrato de pausa/suelo conversacional y el resto de preguntas (incluida la clasificación visual general). A los pesos se les aplica una calibración de clasificación declarada por el autor.

La rama visual reutiliza el encoder, el merger y el proyector originales de Qwen3.5, congelados, alimentando el mismo backbone de texto; la torre de visión se carga en la primera petición explícita con imagen. El entrenamiento local actualizó 10.822.656 parámetros LoRA más la cabeza pointer, sin datos publicados sobre número de tokens, composición del dataset ni uso de RLHF o DPO: esa información no está disponible en la documentación proporcionada. Tampoco se detalla el régimen de entrenamiento de la rama de pausa más allá de que se selecciona con un adaptador y una cabeza independientes.

## Capacidades

- Clasificación de intención conversacional entre opciones suministradas: responder, redirigir, continuar, escuchar, callar, ausentarse, turno inacabado y retomar.
- Salida de distribuciones de probabilidad por pregunta, con temperatura ajustada para calibración, en una sola pasada hacia delante.
- Gestión del suelo conversacional mediante un adaptador y una cabeza de pausa seleccionados por separado del adaptador de conversación.
- Clasificación visual: dado un estado textual, una imagen y una pregunta con opciones, devuelve la distribución sobre las opciones (por ejemplo, sujeto principal de una fotografía).
- Razonamiento condicionado por imagen dentro de la conversación: la intención textual se decide primero y la evidencia visual se usa para condiciones visuales explícitas.
- Multilingüe limitado a inglés y alemán, tanto en texto como en los escenarios de conversación evaluados.
- No soporta tool calling ni function calling: no es un modelo generativo y no emite texto ni llamadas a herramientas.
- No soporta agentes multi-step por sí mismo; puede actuar como componente de decisión dentro de un agente mayor.
- No transcribe audio (no es ASR), no sintetiza voz (no es TTS) y no genera las respuestas habladas del asistente.
- No implementa modo thinking ni cadena de pensamiento explícita.

## Casos de uso

- Control de turnos en agentes de voz: integrado como componente local que decide si el asistente debe responder, seguir escuchando o callar ante una intervención del usuario. Es adecuado porque devuelve una distribución calibrada sobre ocho intenciones en una sola pasada de un modelo de 0,8B.
- Detección de interrupciones en asistentes telefónicos: el adaptador de pausa permite decidir si el usuario ha terminado su turno o si se mantiene el suelo conversacional, con 64/64 escenarios de retención de pausa reportados por el autor. Se usaría como semáforo previo a la generación de la respuesta.
- Pre-filtro de diálogo antes de invocar un LLM generativo: el modelo decide la intención y el pipeline solo llama al modelo grande cuando la intención es "responder". Reduce coste y latencia al evitar generaciones innecesarias.
- Enrutado multilingüe inglés/alemán: en despliegues con usuarios de ambos idiomas, el mismo runtime clasifica la intención sin necesidad de dos modelos separados, según los escenarios de conversación evaluados en los dos idiomas.
- Verificación visual rápida con opciones cerradas: clasificar el sujeto principal de una imagen (por ejemplo, gato, perro, coche, otro) junto a un estado textual, útil para triaje de imágenes en moderación o etiquetado asistido. El modelo acepta hasta cuatro imágenes locales por petición.
- Decisión condicionada por imagen en flujos de atención: cuando una condición visual explícita forma parte de la conversación (por ejemplo, comprobar si la imagen mostrada contiene un objeto concreto), el modelo combina evidencia visual con el estado textual antes de seleccionar una opción.
- Estado de disponibilidad de un agente: las categorías ausentarse, callar y escuchar permiten alimentar un indicador de presencia del asistente en aplicaciones de soporte, evitando respuestas fuera de contexto.
- Investigación en interacción conversacional: sirve como banco de pruebas reproducible de modelos de decisión con LoRA y cabezas pointer sobre Qwen3.5, con soak de integración documentado y checkpoints de evaluación publicados por el autor.
- Despliegue en hardware modesto: al ser un backbone de 0,8B con adaptadores de 0,2 GB, puede alojarse en una GPU de consumo y mantener un cliente residente para operación continua, en lugar de arrancar un worker por turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. El autor publica únicamente mediciones locales y específicas de tarea, recogidas en `BENCHMARKS.md`:

| Evaluación | Resultado | Alcance declarado |
|---|---|---|
| Intención conversacional | 97/120 escenarios retenidos | Contrato de conversación, casos no vistos en entrenamiento |
| Respeto del suelo conversacional (pausa) | 64/64 escenarios de retención de pausa | Escenarios de pausa redactados por el autor |
| Decisiones visuales sobre formas y colores | 12/12 | Conjunto sintético |
| Preguntas sobre cinco fotografías | 13/13 | Conjunto reducido de imágenes |
| Condiciones visuales explícitas | 14/14 | Repetición final de integración |
| Soak de integración solo texto | 996/1.028 comprobaciones superadas (7.500 segundos, 806 entradas) | Operación sostenida con llamadas al modelo de respuestas |

El propio autor advierte de que son mediciones locales y específicas de tarea, no una afirmación de comprensión visual general ni de precisión en producción, que los conjuntos de integración visual se revisaron durante el desarrollo, y que quedan fallos conocidos en el holdout de conversación y en la prueba sostenida (32 comprobaciones no superadas de 1.028).

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño declarado, no verificada por el autor): en bf16/fp16 el backbone de 0,8B ocupa aproximadamente 1,6 GB de pesos; la model card indica que el shard principal del base pesa unos 1,75 GB, extremo coherente con esa cifra. Con adaptadores, cabezas y activaciones, un presupuesto práctico de 2 a 3 GB de VRAM en bf16 para peticiones individuales es una estimación razonable.
- Requisito obligatorio de CUDA: el worker suministrado exige NVIDIA CUDA y no implementa fallback a CPU, por lo que no puede ejecutarse en macOS Metal ni solo con CPU.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM debería ser suficiente según el tamaño del modelo; se espera funcionamiento en RTX 3050 (6/8 GB), RTX 4060, RTX 4090 y en GPUs de datacenter como A100 o H100, aunque el autor no publica una lista oficial de compatibilidad.
- Cabe en GPU de consumo: sí, según el tamaño de pesos estimado; la validación del autor no especifica modelos concretos.
- Opciones de despliegue: runtime propio del autor (`KevClient` y `examples/classify.py`, con `prepare-base.py` para descargar y verificar hashes del base Qwen fijado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el uso de código personalizado (`custom-code`) más la necesidad de los tres directorios de adaptador hacen improbable el uso con servidores de inferencia genéricos.
- Latencia y throughput: no disponibles.
- Modo de operación recomendado: mantener un único `KevClient` vivo y reutilizarlo; `examples/classify.py` es una demostración de línea de comandos que arranca y cierra su propio worker y no debe invocarse repetidamente en cada turno de una aplicación en tiempo real.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Grunder/kev-0.8b-conversation-vision | Modelo de decisión con LoRA + cabeza pointer, con rama de visión reconectada | 0,8B de backbone, 10.822.656 parámetros LoRA | No disponible | en, de | Apache-2.0 | HuggingFace, release 1.0.0, 0 descargas y 0 likes en el momento de la consulta |
| jaredpalmer/kev-0.8b | Modelo de decisión (LoRA r=16 más cabeza pointer), sin generación de texto; sirve el contrato `/v1/systemone` | 0,8B de backbone, 11,3M parámetros entrenables | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace y repositorio GitHub jaredpalmer/kev |
| mlboydaisuke/Kev-0.8B-CoreAI | Port del modelo de decisión al ecosistema Swift/CoreAI, con paquete Kev y scripts de puerta en coreai-model-zoo | 0,8B de backbone | No disponible | No disponible | No disponible | HuggingFace |
| Qwen/Qwen3.5-0.8B-Base | Modelo de lenguaje base generativo | 0,8B | No disponible | No disponible | No disponible | HuggingFace (usado como base congelada y como origen del encoder de visión) |

La diferencia principal frente a los tres alternativos es que esta release añade dos etapas de ajuste LoRA orientadas a conversación en inglés y alemán, una cabeza de pausa independiente y la reconexión de la ruta visual de Qwen3.5, manteniendo el backbone congelado.

## Limitaciones y advertencias

- No es un modelo generativo: nunca produce texto, llamadas a herramientas ni respuestas habladas; solo selecciona entre opciones suministradas y devuelve distribuciones.
- No realiza reconocimiento de voz ni síntesis de voz, y no constituye por sí mismo una aplicación completa de llamada; el autor lo indica de forma explícita.
- Muestras de evaluación muy pequeñas y autorreportadas: 120 escenarios de conversación, 64 de pausa, 12 imágenes sintéticas, 13 preguntas sobre cinco fotografías y 14 condiciones visuales. No permiten extrapolar precisión general.
- El propio autor reconoce que los conjuntos de integración visual se revisaron durante el desarrollo y que persisten fallos conocidos en el holdout de conversación y en el soak de integración (32 de 1.028 comprobaciones no superadas).
- Cobertura lingüística limitada a inglés y alemán; no hay datos de rendimiento en otros idiomas.
- Requiere CUDA y no ofrece fallback a CPU, lo que restringe el despliegue en hardware no NVIDIA.
- Riesgo de clasificación errónea y de calibración imperfecta en lugar del riesgo clásico de alucinación textual: la temperatura ajustada es específica de cada contrato de pregunta, por lo que cambiar la redacción del contrato altera qué adaptador se selecciona.
- Es obligatorio conservar los tres directorios de adaptador; cargar solo el adaptador de la última etapa con un cargador PEFT genérico no reproduce el comportamiento compuesto evaluado. Los nombres históricos de directorio se mantienen a propósito.
- El estado del modelo no incorpora nombres de archivo ni rutas de las imágenes suministradas, según la documentación.
- Licencia Apache-2.0 para esta release, lo que permite uso comercial de los adaptadores; conviene verificar aparte la licencia del backbone base Qwen3.5 y del adaptador upstream jaredpalmer/kev-0.8b antes de un despliegue en producción.
- Tracción nula en el momento de la consulta (0 descargas, 0 likes) y publicación muy reciente, sin validación independiente de terceros.
- Sin resultados de benchmarks estándar publicados, por lo que la comparación de calidad frente a otras alternativas no puede establecerse con datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Grunder/kev-0.8b-conversation-vision
- Modelo base upstream: https://huggingface.co/jaredpalmer/kev-0.8b
- README del modelo base upstream: https://huggingface.co/jaredpalmer/kev-0.8b/blob/main/README.md
- Repositorio GitHub de la familia Kev: https://github.com/jaredpalmer/kev
- Backbone base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Port a Swift/CoreAI: https://huggingface.co/mlboydaisuke/Kev-0.8B-CoreAI
- Ficha técnica de Kev 0.8B en gradually.ai: https://www.gradually.ai/en/ai-models/kev-0.8b/
- Análisis de VRAM y hardware en madebyagents.com: https://www.madebyagents.com/models/kev-0-8b
- Documentación incluida en el repositorio: `BENCHMARKS.md`, `VISION.md`, `examples/classify.py`, `examples/request.json`, `Scripts/prepare-base.py` (rutas relativas dentro del repositorio del modelo)
