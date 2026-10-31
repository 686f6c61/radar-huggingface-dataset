# FrontiersMind/Lumma-fev-0.1B-v2

## Resumen

Lumma-Fev-0.1B-v2 es un modelo de decisión (decision model) desarrollado por FrontiersMind. A diferencia de un modelo generativo clásico, no produce texto: recibe un *estado* (texto, objeto JSON o array) junto con preguntas tipadas y devuelve, en una única pasada hacia delante, una probabilidad para cada opción. Esto elimina la necesidad de parsear salidas de texto libre, un problema habitual al usar LLM generativos para tareas de clasificación y enrutado.

Técnicamente es un fine-tune de pesos completos de [Nandi-Mini-150M](https://huggingface.co/FrontiersMind/Nandi-Mini-150M), un modelo de 150 millones de parámetros entrenado en inglés y lenguas índicas, con atención causal y una ventana de contexto de 2.048 tokens. Es el modelo más pequeño de la familia v2 de Lumma-Fev, que también incluye versiones de 4B y 27B orientadas a tareas que requieren razonamiento o juicio.

Su relevancia está en el enrutado simple y la clasificación de una sola etiqueta: la propia model card indica que iguala o supera a Jev en tareas de temas, intenciones y emociones, aunque rinde cerca del azar en benchmarks de razonamiento (RAGTruth, WinoGrande, JudgeBench, BBH, Financial PhraseBank). Con unos 300 MB de pesos y ejecución en CPU, es una opción muy ligera para pipelines de clasificación multilingüe (inglés, hindi, tamil y canarés) donde la latencia y el coste importan más que la capacidad de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención causal, cabezal de lectura (readout) sobre códigos de opción (" A", " B", ...); modelo de decisión, no generativo |
| Parametros totales | 153.249.856 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (pesos en precisión original, ~300 MB) |
| Idiomas soportados | Inglés (en), hindi (hi), tamil (ta), canarés (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (~0,3 GB), con código personalizado en el repositorio (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Nandi-Mini-150M, un transformer de 150 millones de parámetros con atención causal preentrenado en inglés y lenguas índicas, y se somete a un fine-tune de pesos completos (full-weight fine-tune) mediante el framework [DecisionFormer](https://github.com/FrontiersMindAI/decisionformer). La innovación central de DecisionFormer es convertir el modelo en un clasificador de decisiones: el prompt es texto plano que termina en `Answer:`, y un cabezal de lectura puntúa los códigos de opción con prefijo de espacio (`" A"`, `" B"`, ...) definidos en `decision_config.json`, divididos por un parámetro de temperatura. Cada pregunta lee el estado y sus propias opciones de forma independiente, de modo que la respuesta a una pregunta nunca influye en otra.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición detallada del dataset de fine-tuning ni el uso de técnicas como RLHF o DPO. El modelo se entrenó con preguntas de tipo `noul` (binarias) y `choice` (selección entre opciones); las preguntas de tipo `score` se aceptan pero no han sido probadas.

## Capacidades

- Clasificación de una sola etiqueta: temas, intenciones, emociones y tareas similares, con probabilidades calibradas para cada opción en una sola pasada.
- Preguntas tipadas sobre un estado: admite tipos `choice` (opciones con criterios descriptivos) y `noul` (preguntas binarias), y acepta (sin garantías) el tipo `score`.
- Entrada flexible: el estado puede ser texto, un objeto JSON o un array.
- Multilingüe: funciona en inglés, hindi, tamil y canarés, con precisiones de 0,59 a 0,68 según la lengua.
- Salida estructurada: devuelve la opción elegida, un nivel de confianza y las probabilidades de todas las opciones, sin necesidad de parsear texto generado.
- Servido detrás de una API compatible con TypeSafe (`POST /v1/systemone`) mediante el paquete `lumma-fev`.
- No genera texto, no admite imágenes ni otras modalidades, y no tiene capacidades de razonamiento, tool calling ni agentes.

## Casos de uso

- Enrutado de tickets de soporte: clasificar una petición de cliente entre equipos (facturación, soporte técnico, ventas) con probabilidades por opción; su velocidad en CPU permite enrutar miles de tickets por segundo sin GPU.
- Detección de intenciones en chatbots: clasificar el mensaje del usuario entre intents predefinidas antes de decidir el flujo conversacional, evitando el coste y la latencia de un LLM generativo.
- Clasificación de urgencia: con preguntas `noul` binarias (por ejemplo, "¿el cliente necesita respuesta hoy?") para priorizar colas de atención al cliente.
- Moderación y clasificación de contenido: etiquetar textos por tema, emoción o categoría en inglés y lenguas índicas, útil para plataformas con usuarios en la India.
- Clasificación de entradas estructuradas: pasar objetos JSON como estado para clasificar registros, logs o eventos de negocio sin serialización compleja.
- Prefiltro económico en pipelines de IA: usarlo como primer nivel de decisión barato y calibrado, escalando a los modelos Lumma-Fev 4B o 27B solo cuando la tarea requiere razonamiento o juicio.
- Clasificación multilingüe regional: aplicaciones en hindi, tamil o canarés donde los clasificadores tradicionales requerirían entrenamiento específico por lengua.

## Benchmarks y rendimiento

Calibración (media sobre ocho benchmarks; menor es mejor):

| Métrica | Lumma-Fev-0.1B-v2 | Lumma-Fev-4B-v2 | Lumma-Fev-27B-v2 | Jev |
|---|---|---|---|---|
| Log loss | 0,715 | 0,401 | **0,307** | 1,315 |
| ECE | 0,085 | 0,045 | **0,024** | 0,088 |
| Brier | 0,431 | 0,237 | **0,178** | 0,291 |

Precisión en el conjunto inglés/hindi/tamil/canarés (100 filas por lengua):

| Modelo | en | hi | ta | kn |
|---|---|---|---|---|
| **Lumma-Fev-0.1B-v2** | 0,68 | 0,67 | 0,59 | 0,64 |
| Lumma-Fev-4B-v2 | 0,88 | 0,88 | 0,79 | 0,89 |
| Lumma-Fev-27B-v2 | 0,92 | 0,89 | 0,87 | 0,87 |
| Jev | 0,77 | 0,82 | 0,77 | 0,80 |

La model card también incluye una comparativa de precisión frente a Jev en clasificación de una sola etiqueta (temas, intenciones, emociones), donde el modelo iguala o supera a Jev, pero solo como imagen; los valores numéricos exactos por benchmark no están disponibles en texto. En tareas de razonamiento o juicio (RAGTruth, WinoGrande, JudgeBench, BBH, Financial PhraseBank) el modelo rinde cerca del azar.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los pesos ocupan unos 300 MB; con overhead de ejecución, basta con aproximadamente 1 GB de memoria. No requiere GPU.
- GPU recomendadas: ninguna en particular; cualquier GPU pequeña es suficiente. Está diseñado para ejecutarse en CPU.
- Consumer GPUs: cabe sobradamente en cualquier GPU moderna (por ejemplo, una RTX 3060 o superior), aunque su tamaño lo hace más adecuado para CPU o despliegues masivos.
- Opciones de despliegue: paquete oficial `lumma-fev` (versión 0.4 o posterior; versiones anteriores no pueden cargar este modelo) vía `pip install "lumma-fev>=0.4"`, o servidor integrado con `pip install "lumma-fev[serve]"` y `lumma-fev-serve --model 0.1b-v2`, que expone la API `POST /v1/systemone` compatible con TypeSafe. Carga manual posible con PyTorch y `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se han publicado cifras concretas; al ser 150M de parámetros y requerir una sola pasada hacia delante por pregunta, la latencia por decisión es del orden de milisegundos en CPU, pero no hay datos oficiales.

## Comparativa con modelos similares

| | Lumma-Fev-0.1B-v2 | Lumma-Fev-4B-v2 | Lumma-Fev-27B-v2 |
|---|---|---|---|
| Parametros | 153M | 4B | 27B |
| Longitud de contexto | 2.048 tokens | No disponible | No disponible |
| Log loss (calibración) | 0,715 | 0,401 | 0,307 |
| ECE | 0,085 | 0,045 | 0,024 |
| Precisión multilingüe (en) | 0,68 | 0,88 | 0,92 |
| Uso previsto | Enrutado simple, clasificación | Clasificación + tareas con razonamiento | Tareas complejas de juicio |
| Licencia | Apache 2.0 | Apache 2.0 (según familia) | Apache 2.0 (según familia) |
| Hardware | CPU o cualquier GPU pequeña | No disponible | No disponible |

Frente a Jev, el modelo de referencia al que FrontiersMind compara, Lumma-Fev-0.1B-v2 iguala o supera su precisión en clasificación de una sola etiqueta y mejora notablemente su calibración (log loss 0,715 frente a 1,315), con una fracción del coste. No se conocen otros modelos de decisión comparables de código abierto con esta interfaz de preguntas tipadas; como alternativa genérica se usarían LLM generativos pequeños clasificando vía prompt, con el inconveniente de tener que parsear texto libre y peores probabilidades calibradas.

## Limitaciones y advertencias

- Sin capacidad de razonamiento: rinde cerca del azar en RAGTruth, WinoGrande, JudgeBench, BBH y Financial PhraseBank. No debe usarse para tareas que requieran juicio o razonamiento; para eso están las versiones 4B y 27B.
- Contexto limitado: pregunta más estado deben caber en 2.048 tokens, lo que excluye documentos largos.
- Solo texto: no admite imágenes ni otras modalidades.
- Tipos de pregunta restringidos: entrenado solo con `noul` y `choice`; las preguntas `score` se aceptan pero no están probadas.
- Rendimiento desigual por lengua: la precisión cae a 0,59 en tamil frente a 0,68 en inglés; en lenguas fuera de las cuatro soportadas no hay garantías.
- Dependencia de código personalizado: la carga requiere `trust_remote_code=True` con código incluido en el repositorio, lo que exige revisar ese código antes de usarlo en producción.
- Compatibilidad de versiones: se necesita `lumma-fev>=0.4`; versiones anteriores no pueden cargar el modelo.
- Calibración mejorable: con un ECE de 0,085 y un Brier de 0,431, las probabilidades son menos fiables que las de los modelos 4B y 27B; revisar los umbrales de confianza antes de automatizar decisiones críticas.
- Sesgos conocidos, riesgo de alucinación (no aplica por ser no generativo) y restricciones de licencia para uso comercial: no se ha documentado nada específico; la licencia Apache 2.0 permite el uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FrontiersMind/Lumma-fev-0.1B-v2
- Modelo base: https://huggingface.co/FrontiersMind/Nandi-Mini-150M
- Lumma-Fev-4B-v2: https://huggingface.co/FrontiersMind/Lumma-fev-4b-v2
- Lumma-Fev-27B-v2: https://huggingface.co/FrontiersMind/Lumma-fev-27B-v2
- Framework de entrenamiento DecisionFormer: https://github.com/FrontiersMindAI/decisionformer
- Paquete Python lumma-fev: https://pypi.org/project/lumma-fev/
