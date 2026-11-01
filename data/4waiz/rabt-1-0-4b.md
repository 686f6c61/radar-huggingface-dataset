# 4waiz/Rabt-1.0-4B

## Resumen

Rabt 1.0 4B es un ajuste fino del modelo Qwen3.5-4B desarrollado por Eng. Awaiz Ahmed (Kanban Studios, Abu Dhabi) como motor de un asistente personal local-first llamado Rabt. El modelo hereda la arquitectura híbrida de Qwen3.5 —atención lineal Gated DeltaNet combinada con atención completa cada cuatro capas— y añade un encoder de visión, manteniendo una ventana de contexto de 256K tokens declarada por el autor. Su pipeline en HuggingFace es `image-text-to-text`, por lo que acepta entradas multimodales de texto e imagen.

El objetivo del ajuste no es mejorar el rendimiento general del modelo base, sino especializarlo en cuatro comportamientos concretos: identidad propia y honesta sobre su origen, veracidad estricta sobre acciones pendientes de aprobación (human-in-the-loop), resistencia a inyección de prompts en contenido no confiable (correos, archivos, páginas web) y cobertura multilingüe en inglés, árabe, francés, hindi y urdu. Está pensado para ejecutarse íntegramente en local mediante Ollama y llama.cpp, de modo que los datos del usuario no abandonen su máquina.

Con 4.659.865.088 parámetros reales en safetensors (aproximadamente 4,66B) y un repo de 12,1 GB, el modelo se posiciona en la gama media de la familia Rabt 1.0, que incluye variantes de 2B y 9B. La licencia Apache 2.0 y la disponibilidad de pesos en GGUF lo hacen directamente desplegable en hardware de consumo con 6 GB o más de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención lineal Gated DeltaNet en la mayoría de capas, atención completa con gating cada 4 capas, más encoder de visión |
| Parametros totales | 4.659.865.088 (~4,66B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (según model card) |
| Tipos de cuantizacion | GGUF (Q4_K_M referenciado, ~2,7 GB); otros niveles no especificados |
| Idiomas soportados | Inglés, árabe, francés, hindi, urdu (declarados); competencias multilingües más amplias heredadas del base |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

Rabt 1.0 4B conserva el diseño híbrido de Qwen3.5: la mayor parte de las capas emplean Gated DeltaNet, una atención lineal recurrente que mantiene bajo el coste computacional en contextos largos, mientras que cada cuarta capa utiliza atención completa con gating para preservar la recuperación precisa de información. Un encoder de visión procesa imágenes junto con los tokens de texto. El ajuste se realizó mediante QLoRA (según los tags del repositorio) sobre el checkpoint Qwen/Qwen3.5-4B.

La model card no especifica el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El autor sí detalla que el ajuste se orientó a comportamientos verificables: identidad consistente en cinco idiomas, declaración honesta de acciones pendientes de aprobación, tratamiento del texto no confiable como datos y no como instrucciones, y selección correcta de herramientas. La evaluación presentada se hizo con temperatura 0 sobre prompts no vistos durante el entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`).
- Tool calling y function calling: la evaluación del autor reporta 6/6 en selección de herramienta correcta para peticiones simples en inglés, francés y árabe.
- Comportamiento de agente con human-in-the-loop: prepara acciones y espera aprobación explícita antes de ejecutarlas, sin declarar éxito prematuro.
- Resistencia a inyección de prompts: trata instrucciones embebidas en correos, archivos y páginas web como contenido, no como órdenes.
- Multilingüe en inglés, árabe, francés, hindi y urdu, manteniendo identidad y reglas en los cinco idiomas.
- Identidad propia declarada (Rabt 1.0, creado por Eng. Awaiz Ahmed en Kanban Studios) y transparencia sobre su base Qwen3.5.
- Integración con el motor de la aplicación Rabt, que incluye 21 herramientas y un mecanismo de bloqueo de respuestas que afirman acciones no ejecutadas.

## Casos de uso

- Asistente personal de escritorio con privacidad estricta: despacho de abogados o consulta médica donde el modelo gestiona correos, calendario y documentos sin que los datos salgan del equipo, gracias a su ejecución local vía Ollama y llama.cpp.
- Automatización de correo con aprobación humana: el modelo redacta y prepara envíos, pero no los ejecuta hasta recibir confirmación, lo que encaja en flujos donde un error de envío es costoso.
- Gestión documental y generación de hojas de cálculo: creación de documentos y tablas a partir de archivos locales, con contexto largo suficiente para procesar informes extensos en una sola ventana.
- Defensa frente a inyección de prompts en pipelines de agentes: procesamiento de correos y páginas web de terceros en los que el texto malicioso debe tratarse como dato y no como instrucción, un requisito habitual en integraciones de agentes expuestas a contenido externo.
- Atención al cliente multilingüe en la región del Golfo: conversaciones en árabe, urdu, hindi, inglés y francés con un único modelo, útil para empresas con plantillas diversas en Emiratos Árabes Unidos.
- Extracción de información de imágenes y documentos escaneados: el encoder de visión permite interpretar capturas, formularios o recibos dentro de un flujo de asistente personal.
- Despliegue en hardware modesto: con ~2,7 GB en Q4_K_M cabe en GPU de 6 GB o superiores, lo que permite prototipar agentes locales en portátiles de gama media.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, con temperatura 0 y prompts no presentes en el entrenamiento:

| Prueba | Rabt 1.0 4B | Qwen3.5-4B (base) |
|---|---|---|
| Identidad y creador, 11 prompts en 5 idiomas | 10/11 | 0/11 |
| Honestidad: no declara completada una acción pendiente de aprobación | 4/4 | 3/4 |
| Inyección: ignora instrucciones ocultas en correos, archivos y webs | 6/6 | 4/6 |
| Herramientas: selecciona la herramienta correcta (EN, FR, AR) | 6/6 | 5/6 |
| Benchmark del motor Rabt: 14 turnos reales retenidos con 21 herramientas | 11/14 | 11/14 |

No se han publicado resultados en benchmarks estándar de la literatura (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~2,7 GB en cuantización Q4_K_M según el autor; el repo completo en safetensors ocupa 12,1 GB (probablemente FP16/BF16 más el encoder de visión).
- GPU recomendadas: el autor sugiere 6 GB o más de VRAM para la variante 4B; no se especifican modelos concretos de GPU.
- Cabe en GPU de consumo: sí, con 6 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070). La variante 2B de la familia puede ejecutarse en CPU.
- Opciones de despliegue: Ollama y llama.cpp (soportados explícitamente por el autor); también transformers con safetensors. Compatibilidad con vLLM o TGI no confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rabt 1.0 4B | ~4,66B | 256K | Asistente local con human-in-the-loop y resistencia a inyección | Apache 2.0 | HF (safetensors + GGUF) |
| Qwen3.5-4B (base) | ~4B | No disponible en la información | Chatbot generalista multimodal | No disponible en la información | HF |
| Rabt 1.0 2B | 2B | No disponible en la información | Asistente local, ejecutable en CPU | Apache 2.0 | HF |
| Rabt 1.0 9B | 9B | No disponible en la información | Asistente local, gama alta | Apache 2.0 | HF |

La comparación con alternativas de otros desarrolladores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El ajuste está orientado a un producto concreto (la aplicación Rabt); fuera de ese ecosistema, parte de su comportamiento entrenado (formato de herramientas, flujo de aprobación) puede no aprovecharse plenamente.
- Los benchmarks publicados son internos y de tamaño reducido (4 a 14 pruebas por categoría); no sustituyen a evaluaciones estandarizadas y la significación estadística es limitada.
- No se documentan sesgos conocidos, composición del dataset de ajuste ni procesos de mitigación; el riesgo de sesgo heredado de Qwen3.5-4B no está cuantificado.
- Riesgo de alucinación presente como en cualquier modelo de 4B; el entrenamiento específico contra declaraciones falsas de acciones reduce pero no elimina este comportamiento.
- La cobertura multilingüe declarada se limita a cinco idiomas; el rendimiento en otros idiomas depende del modelo base y no está evaluado.
- La ventana de 256K tokens es una cifra declarada por el autor; no se aportan mediciones de rendimiento efectivo en contextos largos (por ejemplo, pruebas de recuperación tipo needle-in-a-haystack).
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte indicado en la información disponible.
- El modelo se presenta como "local-first" y "privado por diseño"; esto describe el modo de despliegue, no una garantía criptográfica ni de aislamiento del sistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/4waiz/Rabt-1.0-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante 2B: https://huggingface.co/4waiz/Rabt-1.0-2B
- Variante 9B: https://huggingface.co/4waiz/Rabt-1.0-9B
- Producto Rabt: https://rabt.kanbanstudios.ae
- Resultados de evaluación completos: `eval/results.json` en el repositorio del modelo
