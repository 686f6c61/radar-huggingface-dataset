# Heimfisch/Pumpkin-1.7B

## Resumen

Pumpkin-1.7B es un adaptador LoRA/PEFT (versión 0.3, build de desarrollo 1.7B-0.03) construido sobre el modelo base Qwen/Qwen3-1.7B por el usuario Heimfisch. No es un modelo completo, sino un ajuste fino orientado a una tarea muy concreta: actuar como capa de lenguaje y de decisión de un asistente autoalojado, decidiendo cuándo hace falta una herramienta externa, seleccionándola de un registro en tiempo de ejecución, extrayendo sus argumentos en JSON y procesando el resultado devuelto. El repositorio ocupa 0,4 GB y se distribuye con licencia Apache 2.0.

La propuesta de diseño es deliberadamente minimalista: mantener el modelo pequeño y delegar en sistemas deterministas y herramientas externas todo aquello que puedan resolver de forma más fiable. Pumpkin no ejecuta herramientas; solo emite peticiones estructuradas que la aplicación anfitriona valida y ejecuta. Su idioma principal es el alemán, con el inglés como secundario, y el modo de pensamiento (*thinking mode*) está desactivado, lo que reduce latencia y coste a cambio de renunciar a razonamiento extendido.

Su relevancia actual está en el nicho de los asistentes locales con orquestación de herramientas: con 1,7B de parámetros y un contrato de salida JSON estricto, es un candidato para desplegarse en hardware de consumo o en el borde, sin depender de APIs en la nube. La contrapartida es que no cuenta con benchmarks generalistas publicados ni con validación de la comunidad (0 descargas y 0 *likes* en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/PEFT sobre un transformer decoder-only (modelo base Qwen/Qwen3-1.7B) |
| Parámetros totales | 1,7B en el modelo base; el adaptador añade un conjunto reducido de parámetros entrenables (no cuantificado en la información disponible) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en el repositorio; heredada del modelo base Qwen/Qwen3-1.7B (no confirmada en la información proporcionada) |
| Tipos de cuantización | No especificados por el autor. Al ser un adaptador LoRA, las cuantizaciones posibles dependen de las publicadas para Qwen/Qwen3-1.7B o de una conversión propia a GGUF/AWQ/GPTQ |
| Idiomas soportados | Alemán (principal) e inglés (secundario) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamaño del repositorio 0,4 GB |

## Arquitectura y entrenamiento

Pumpkin-1.7B no introduce una arquitectura propia: es un adaptador LoRA entrenado mediante PEFT sobre Qwen3-1.7B, un transformer decoder-only denso. El *thinking mode* del modelo base está deshabilitado, de modo que el modelo no genera cadenas de razonamiento extensas y responde directamente con un único objeto JSON. El entrenamiento está orientado a un contrato de salida cerrado con tres tipos: `response` (respuesta directa), `tool_call` (petición de ejecución con nombre de herramienta y argumentos) y `clarification` (pregunta cuando falta información obligatoria). El modelo tiene prohibido inventar argumentos requeridos y tiene prohibido simular la ejecución de herramientas.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u optimización similar. La innovación técnica destacable no está en la arquitectura sino en el planteamiento: las herramientas se suministran en tiempo de ejecución mediante un registro con nombre, descripción y esquema de argumentos, y uno de los objetivos declarados es generalizar a herramientas no vistas durante el entrenamiento a partir de su descripción. El resultado de la herramienta se devuelve al modelo como entrada autoritativa para que redacte la respuesta final en lugar de repetir la llamada.

## Capacidades

- Generación de texto conversacional en alemán (idioma principal) e inglés (secundario).
- Salida estructurada: devuelve exactamente un objeto JSON por turno, con validación del 99,6 % en la suite interna Pumpkin Eval v0.4.
- Decisión de uso de herramientas: determina si la petición requiere información externa, actual, privada o basada en acciones, o si puede responderse directamente.
- Selección dinámica de herramientas a partir de un registro en tiempo de ejecución, incluyendo herramientas no vistas en entrenamiento (100 % en las métricas Tool Intent y Exact Tool de la suite v0.4).
- Extracción de argumentos estructurados para la herramienta seleccionada (97,1 % en la suite v0.4).
- Preservación de identificadores opacos y de campos de resultados devueltos por herramientas (100 % en Entity Preservation y Result Fields).
- Solicitud de aclaración cuando falta información obligatoria, en lugar de inventarla.
- Procesamiento de resultados de herramientas para formular la respuesta final.
- Separación entre conocimiento general y información actual o externa.
- No soporta *tool calling* nativo en el sentido de ejecutar funciones: emite peticiones que la aplicación anfitriona debe validar y ejecutar.
- Sin visión, sin audio y sin modo de razonamiento extendido (*thinking mode* desactivado).

## Casos de uso

- **Capa de orquestación de un asistente autoalojado**: el modelo recibe la petición del usuario, decide si basta con una respuesta directa o si debe invocar una herramienta del registro y emite el `tool_call` correspondiente; el *host* ejecuta y devuelve el resultado, que Pumpkin convierte en respuesta final. Es el caso de uso para el que fue diseñado explícitamente.
- **Domótica y control de dispositivos**: ante peticiones como reiniciar un dispositivo o consultar el estado de un sensor, el modelo emite la llamada con los argumentos correctos y, si no puede determinar el dispositivo, genera una `clarification` en lugar de adivinar (el ejemplo aparece literalmente en la model card).
- **Enrutado de peticiones en soporte al cliente en alemán**: clasificar consultas entrantes y decidir si deben resolverse con conocimiento general o derivarse a una herramienta interna (consulta de pedido, estado de envío, gestión de tickets), preservando identificadores como números de pedido sin alterarlos.
- **Pasarela de extracción de argumentos para APIs internas**: convertir lenguaje natural en parámetros estructurados para APIs con esquemas estrictos, aprovechando el 97,1 % de acierto en argumentos de la suite interna.
- **Asistentes locales con requisitos de privacidad**: al ser un adaptador de 0,4 GB sobre un modelo de 1,7B, puede ejecutarse íntegramente en local, sin enviar datos a servicios externos, lo que encaja en entornos sanitarios, legales o industriales con datos sensibles.
- **Enrutado de herramientas en pipelines RAG**: usar el modelo como router que decide qué recuperador o qué índice consultar antes de que un modelo mayor redacte la respuesta final, reduciendo coste y latencia en la fase de decisión.
- **Asistentes de viajes y rutas**: la model card usa ejemplos de herramientas `weather.forecast` y `routing.route`; el modelo selecciona la adecuada y extrae origen, destino, ubicación y fecha como argumentos.
- **Despliegue en el borde o en dispositivos con GPU modesta**: por tamaño y por el modo de pensamiento desactivado, es apto para entornos donde no cabe un modelo de 7B o superior.

## Benchmarks y rendimiento

El autor solo publica evaluaciones internas del proyecto, diseñadas específicamente para medir el comportamiento de orquestación de herramientas. La propia model card advierte de que **no son benchmarks generalistas** y no deben compararse con MMLU, GSM8K ni leaderboards de modelos.

Pumpkin Eval v0.4:

| Métrica | Resultado |
|---|---|
| Overall | 89,0 % |
| Valid JSON | 99,6 % |
| Output Type | 90,0 % |
| Response | 89,6 % |
| Clarification | 55,0 % |
| Result Fields | 100,0 % |
| Entity Preservation | 100,0 % |
| Safety | 100,0 % |
| Contract | 90,0 % |
| Tool Intent | 100,0 % |
| Exact Tool | 100,0 % |
| Arguments | 97,1 % |

La model card menciona además una suite **Pumpkin Eval v0.5**, descrita como una evaluación más difícil, pero los resultados no aparecen en la información disponible (el texto proporcionado se corta justo en ese punto).

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- **Peso del adaptador**: 0,4 GB en safetensors, según el tamaño del repositorio. Requiere descargar además el modelo base Qwen/Qwen3-1.7B.
- **VRAM estimada para inferencia** (estimaciones propias, no facilitadas por el autor): en FP16/BF16 el modelo base ocupa unos 3,4 GB solo en pesos, por lo que conviene reservar 4-6 GB contando caché KV y activaciones; en INT8, unos 2-3 GB; en cuantización GGUF Q4_K_M, alrededor de 1-2 GB.
- **GPU recomendadas**: cualquier GPU con 6 GB o más de VRAM puede ejecutar el modelo en FP16 con margen suficiente; para cuantizaciones de 4 bits bastan 4 GB. Modelos como RTX 3060, RTX 4060, RTX 4070 o superiores son más que suficientes. GPU de datacenter (A100, H100) solo tendrían sentido para servir muchas réplicas concurrentes.
- **¿Cabe en GPU de consumo?** Sí, en la práctica totalidad de GPU dedicadas modernas, e incluso en iGPU con memoria unificada si se usa cuantización de 4 bits.
- **Opciones de despliegue**: `transformers` + `peft` de forma nativa (es el formato publicado); vLLM con soporte de adaptadores LoRA; TGI; llama.cpp u Ollama, que requieren fusionar previamente el adaptador con el modelo base y convertir el resultado a GGUF; LM Studio con el mismo procedimiento.
- **Latencia y throughput**: no disponibles en la información proporcionada.
- **Requisito de integración**: el modelo no ejecuta herramientas. Es necesario implementar en la aplicación anfitriona la validación del JSON, el registro de herramientas y la ejecución real de las operaciones.

## Comparativa con modelos similares

La comparativa se establece con el modelo base y con alternativas de tamaño similar orientadas a instrucciones. Los datos de contexto y licencia de las alternativas provienen de su documentación pública y no de la información proporcionada en esta consulta, por lo que deben verificarse antes de tomar decisiones de producción.

| Modelo | Parámetros | Orientación | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pumpkin-1.7B | 1,7B (adaptador LoRA sobre Qwen3-1.7B) | Orquestación de herramientas y salida JSON en alemán/inglés | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| Qwen/Qwen3-1.7B | 1,7B | Modelo base generalista, multilingüe | Apache 2.0 | HuggingFace |
| Alternativas de ~1,5-2B tipo instruct (por ejemplo Qwen2.5-1.5B-Instruct o Llama-3.2-1B-Instruct) | 1-2B | Asistente generalista, sin contrato JSON específico | Apache 2.0 en el caso de Qwen; licencia comunitaria propia en el caso de Llama | HuggingFace |

Diferencias clave frente a las alternativas generalistas: Pumpkin no compite en conocimiento general ni en razonamiento, sino en fiabilidad del contrato de salida y en la selección de herramientas con esquemas suministrados en tiempo de ejecución. Como contrapartida, no tiene benchmarks generalistas publicados ni adopción comunitaria, mientras que los modelos base y los instruct de referencia sí cuentan con evaluaciones públicas y ecosistema amplio.

## Limitaciones y advertencias

- **Aclaraciones poco fiables**: la métrica Clarification de Pumpkin Eval v0.4 es del 55,0 %, la más baja del conjunto. En casos donde falta información obligatoria, el modelo puede fallar al pedir aclaración, con riesgo de generar argumentos incorrectos o de responder cuando debería preguntar.
- **Evaluaciones internas, no comparables**: los resultados de Pumpkin Eval v0.4 son específicos del proyecto y no permiten situar el modelo frente a alternativas en tareas generales. No hay datos de MMLU, GSM8K, HumanEval ni similares.
- **Resultados de la suite v0.5 no disponibles**: el autor anuncia una evaluación más difícil, pero sus resultados no constan en la información consultada.
- **Riesgo de alucinación**: aunque el modelo está entrenado para no inventar argumentos ni simular la ejecución de herramientas, se trata de un modelo de 1,7B; la aplicación anfitriona debe validar siempre el JSON, comprobar los argumentos y aplicar sus propias reglas antes de ejecutar cualquier operación.
- **Cobertura lingüística limitada**: solo alemán e inglés. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- **Sin modo de razonamiento**: el *thinking mode* está desactivado, por lo que no es adecuado para tareas que requieran razonamiento multi-paso complejo, matemáticas avanzadas o planificación larga. Su función es decidir y estructurar, no razonar.
- **Es un adaptador, no un modelo completo**: requiere el modelo base Qwen/Qwen3-1.7B. La licencia Apache 2.0 del adaptador y la del modelo base son compatibles, pero conviene revisar ambas antes de un uso comercial.
- **Ausencia de validación comunitaria**: 0 descargas y 0 *likes* en el momento de la consulta; no existe retroalimentación externa sobre su comportamiento en producción.
- **Sin información sobre el entrenamiento**: no se especifican dataset, número de tokens, ni técnicas de alineación, lo que dificulta evaluar sesgos o el origen de los datos.
- **Versión de desarrollo**: la model card lo identifica explícitamente como *development build* 1.7B-0.03, con la etiqueta v0.3; es previsible que la API y el contrato de salida cambien en versiones futuras.
- **Integración a medida obligatoria**: el modelo no ejecuta nada por sí mismo; sin una capa anfitriona que registre herramientas, valide el JSON y ejecute las operaciones, no aporta valor por sí solo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Heimfisch/Pumpkin-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- No se han encontrado en la búsqueda web enlaces relevantes al modelo (papers, blogs, repositorios o demos); los resultados obtenidos no guardan relación con Pumpkin-1.7B.
