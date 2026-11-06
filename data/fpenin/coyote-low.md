# fpenin/coyote-low

## Resumen

Coyote Low es un modelo de 3.085.938.688 parámetros (aproximadamente 3,1B) desarrollado por fpenin, afinado mediante QLoRA sobre Qwen2.5-Coder-3B-Instruct. No es un modelo de propósito general: es un enrutador ("router") diseñado para decidir, en una única respuesta JSON y con decodificación greedy, si una petición dirigida a un agente de programación puede resolverse localmente con un comando de shell o debe escalarse a un modelo de frontera en la nube. La arquitectura subyacente es un transformer decoder-only con 36 capas y GQA de 16 cabezas de consulta por 2 de clave/valor, heredada íntegramente del modelo base.

Su relevancia es práctica: la mayoría de mensajes que un desarrollador envía a un agente de código son mecánicos ("ejecuta los tests", "git status", "muéstrame el package.json"). Enviarlos a un modelo grande desperdicia tokens, dinero y latencia. Coyote Low intercepta cada mensaje, resuelve localmente los triviales emitiendo el comando adecuado al ecosistema del workspace y solo reenvía lo que requiere generación de código, depuración, razonamiento, diseño o revisión. Según las mediciones del autor en una versión modificada de OpenCode, este esquema en cascada redujo el consumo de tokens del modelo grande en torno a un 75%.

El modelo se distribuye como GGUF Q4_K_M de 1,9 GB y está pensado para ejecutarse en un portátil sin GPU, con Ollama o llama.cpp, con una ventana de contexto de 4096 tokens y soporte de inglés y español (incluido rioplatense y spanglish).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), 36 capas, GQA 16 cabezas de consulta / 2 de clave-valor |
| Parámetros totales | 3.085.938.688 (3,1B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento y contexto de servicio) |
| Tipos de cuantización | Q4_K_M (GGUF distribuido); pesos fusionados exportados también en F16 |
| Idiomas soportados | Inglés y español (incluye español rioplatense, spanglish y erratas) |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (Q4_K_M); LoRA fusionado en pesos de 16 bits antes de la conversión |
| Modelo base | Qwen/Qwen2.5-Coder-3B-Instruct |
| Método de ajuste | QLoRA (base en 4 bits) con Unsloth + TRL SFTTrainer |
| Configuración LoRA | r = 32, α = 64, dropout 0, sobre q, k, v, o, gate, up, down |
| Tamaño del repositorio | 2,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Coyote Low conserva la arquitectura del transformer decoder-only de Qwen2.5-Coder-3B-Instruct, con 36 capas y atención con grouped-query attention (16 cabezas de consulta, 2 de clave-valor). El ajuste se realizó con QLoRA sobre una base cuantizada a 4 bits, usando Unsloth y el `SFTTrainer` de TRL. Los adaptadores LoRA (r = 32, α = 64, dropout 0) se aplicaron a todas las proyecciones de atención y MLP (`q, k, v, o, gate, up, down`). La optimización empleó AdamW de 8 bits, learning rate 2e-4 con schedule coseno, 30 pasos de warmup, batch efectivo de 8 (2 × 4 de acumulación de gradiente), bf16 y gradient checkpointing, con secuencias de 4096 tokens. El entrenamiento corrió en una NVIDIA A10G en Modal (GPU serverless), con evaluación cada 50 pasos y selección del mejor checkpoint por pérdida de validación.

Los datos de entrenamiento son un conjunto sintético construido específicamente para la tarea, generado por subcategoría y validado con comprobaciones de esquema y recuento antes del entrenamiento. Cubre dos clases de peticiones: resolubles localmente (navegación y búsqueda, operaciones git, ejecución de comandos como tests, build y lint, operaciones de ficheros, consultas de estado, formateo y tooling) y escalables (generación de código, explicación y refactorización, depuración, diseño, revisión de código e intención ambigua). Incluye además ejemplos de identidad para que el modelo se presente como Coyote Low y no como su base, y cobertura de workspaces en TypeScript, Python (Django y FastAPI), Go, Rust, Java y PHP con sus gestores de paquetes (npm, pnpm, pip, poetry, go, cargo, maven, composer). El split es 80/10/10 con semilla 42. El entrenamiento incluye ejemplos adversariales de falsos positivos ("commit the good parts", "delete the failing tests", "skip the slow tests") para forzar el escalado en lugar de adivinar. La exportación fusiona el LoRA en pesos de 16 bits, convierte con `convert_hf_to_gguf` (F16) y cuantiza a Q4_K_M.

## Capacidades

- **Enrutamiento binario con contrato JSON estricto**: devuelve `{"can_resolve": true, "command": "...", "response": "..."}` o `{"can_resolve": false, "reason": "..."}`, con decodificación greedy y temperatura 0 para que el harness actúe sin parsear texto libre.
- **Escalado tipado**: cuando rechaza una petición, indica el motivo entre `requires_code_generation`, `requires_debugging`, `requires_reasoning`, `requires_design`, `requires_review` o `ambiguous_intent`, lo que permite al orquestador elegir el modelo o prompt posterior adecuado.
- **Generación de comandos consciente del stack**: usa el contexto del workspace (lenguaje, gestor de paquetes, rama, fichero actual) para emitir el comando correcto por ecosistema; por ejemplo, un "type check" se convierte en `tsc --noEmit` en TypeScript, `mypy .` en Python o `cargo check` en Rust.
- **Cobertura de operaciones mecánicas**: navegación y búsqueda, git, ejecución de tests, build y lint, operaciones de ficheros, consultas de estado y formateo.
- **Bilingüismo e informalidad**: entrenado en inglés, español (incluido rioplatense), spanglish y erratas como `gti status`, `tirá los tests` o `dale un type check`.
- **Identidad propia**: ante preguntas como "¿quién sos?" o "what model are you?" responde con `"command": "respond:identity"` y una breve autopresentación.
- **Detección de ambigüedad**: reconoce peticiones que parecen mecánicas pero no lo son y las escala en lugar de ejecutar algo destructivo.
- **No soporta tool calling genérico ni razonamiento multi-paso**: su salida es un único objeto JSON de enrutamiento, no una secuencia de llamadas a herramientas.

## Casos de uso

- **Puerta de entrada a un agente de código en cascada**: el modelo se invoca en cada mensaje del usuario antes del modelo de frontera. Si devuelve `can_resolve: true`, el harness ejecuta el comando localmente sin gastar tokens en la nube; si devuelve `false`, reenvía la petición con el motivo tipado. Es su caso de uso principal y el que motivó su entrenamiento.
- **Reducción de coste en asistentes de programación comerciales**: al filtrar las peticiones mecánicas, que según el autor son la mayoría del tráfico, se recorta el consumo de tokens del modelo grande en torno a un 75% en el setup de OpenCode medido, con el consiguiente ahorro económico y de latencia.
- **Ejecución local de tests, builds y lint**: ante "tirá los tests" en un workspace TypeScript con npm, emite `npm test`; en uno de Rust con cargo, el comando equivalente. El desarrollador obtiene respuesta inmediata sin salida a la red.
- **Automatización de operaciones git rutinarias**: consultas de estado, rama actual o diff se resuelven con el comando git adecuado usando el contexto de rama y fichero que recibe en el prompt.
- **Navegación de repositorio y consultas de estado**: "muéstrame el package.json", "¿en qué rama estoy?" o "lista los ficheros de src" se traducen a comandos de shell concretos, útiles en entornos de agente con acceso a terminal.
- **Asistentes on-device para portátiles sin GPU**: al ocupar 1,9 GB en Q4_K_M y servirse con Ollama o llama.cpp, cabe en un portátil convencional y permite un agente de código con componente local incluso sin acelerador.
- **Atención a desarrolladores hispanohablantes informales**: el entrenamiento con rioplatense, spanglish y erratas permite aceptar mensajes coloquiales ("dale un type check", "gti status") sin exigir al usuario un registro formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la métrica de producto del autor: una reducción de aproximadamente el 75% en el uso de tokens del modelo grande al integrar el enrutador en una versión modificada de OpenCode. No se proporcionan cifras de precisión de enrutamiento, latencia ni throughput.

## Requisitos de hardware

- **VRAM estimada**: el GGUF Q4_K_M ocupa 1,9 GB, por lo que la inferencia cabe holgadamente en 2-3 GB de memoria; con contexto de 4096 tokens el consumo adicional de caché KV es reducido.
- **GPU recomendadas**: no requiere GPU. El autor lo sirve en portátil con Ollama o llama.cpp. Cualquier GPU consumer con 4 GB o más (por ejemplo, una RTX 3050 o superior) lo ejecuta con margen amplio.
- **¿Cabe en GPU consumer?**: sí, en cualquier GPU consumer moderna e incluso en CPU. El repositorio completo pesa 2,1 GB.
- **Opciones de despliegue**: Ollama (flujo documentado con `hf download` del GGUF y el Modelfile, seguido de `ollama create`) y llama.cpp. El formato GGUF es compatible con otras herramientas del ecosistema, aunque la model card solo documenta Ollama.
- **Configuración de servicio**: plantilla ChatML, temperatura 0, top_p 1.0 y contexto de 4k, según indica el autor.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Coyote Low | 3,1B | 4096 | Enrutador de peticiones para agentes de código | qwen-research | Hugging Face (GGUF Q4_K_M) |
| Qwen2.5-Coder-3B-Instruct | 3,1B | 32 768 (según el modelo base; no confirmado en esta ficha) | Generación de código de propósito general | qwen-research | Hugging Face |
| Modelos de frontera en la nube (p. ej. GPT, Claude) | No disponible | No disponible | Generación de código y razonamiento general | Propietaria | API |

La comparación relevante no es de rendimiento bruto sino de función: Coyote Low no compite con su modelo base en generación de código, sino que lo sustituye por una tarea estrecha de clasificación y emisión de comandos. Frente a los modelos de frontera, su ventaja es el coste cero en tokens de nube y la ejecución local; su desventaja es que no genera código ni razona, solo decide si hay que escalar. No se dispone de datos de benchmarks que permitan comparar precisión de enrutamiento con alternativas.

## Limitaciones y advertencias

- **Alcance muy restringido**: solo emite decisiones de enrutamiento y comandos de shell; no genera código, no razona y no mantiene conversaciones libres. Usarlo fuera de ese contrato produce salidas sin valor.
- **Riesgo de falsos positivos con consecuencias reales**: si clasifica erróneamente como mecánica una petición destructiva o ambigua, el harness podría ejecutar un comando no deseado. El autor mitiga esto con entrenamiento adversarial, pero no se han publicado métricas de precisión ni de tasa de falsos positivos.
- **Riesgo de alucinación de comandos**: al generar comandos de shell, puede producir comandos sintácticamente válidos pero incorrectos para el workspace si el contexto recibido es incompleto o erróneo.
- **Contexto limitado a 4096 tokens**: no admite conversaciones largas ni ficheros extensos en el prompt; el contexto del workspace debe condensarse en la línea de metadatos del formato de entrada.
- **Cobertura lingüística limitada a inglés y español**: no se documenta soporte de otros idiomas.
- **Licencia qwen-research**: hereda las restricciones del modelo base de Qwen, lo que condiciona el uso comercial. Conviene revisar el enlace de licencia del modelo base antes de desplegarlo en producción.
- **Madurez y tracción**: 0 descargas y 0 likes en el momento de la consulta, con un único autor y sin validación externa publicada. Tratarlo como experimental.
- **Dependencia del harness**: su utilidad real depende de que el orquestador respete el contrato JSON, aplique temperatura 0 y gestione correctamente los motivos de escalado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpenin/coyote-low
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/blob/main/LICENSE
- OpenCode (harness de integración): https://github.com/sst/opencode
- Modal (plataforma de cómputo usada en el entrenamiento): https://modal.com
- Logo del modelo: https://huggingface.co/fpenin/coyote-low/resolve/main/coyote-logo.png
