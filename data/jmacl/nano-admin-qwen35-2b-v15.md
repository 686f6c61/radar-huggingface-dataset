# Jmacl/nano-admin-qwen35-2b-v15

## Resumen

Nano Admin v15 es un modelo de 2B parámetros especializado en tool calling para asistentes de teléfono, desarrollado por Jmacl dentro del proyecto Nanoforge. Se trata de un adaptador QLoRA sobre Qwen3.5-2B, fusionado y cuantizado a GGUF Q4_K_M para su despliegue con llama.cpp. El modelo no es un chat generalista: su función es actuar como capa de decisión que elige entre nueve herramientas (calendario, temporizador, borrador de correo, búsqueda de archivos, recordatorios, lugares, clima, confirmación y borrado de fotos), rellena argumentos, ordena llamadas múltiples y pide confirmación antes de acciones destructivas.

La relevancia del modelo reside en su tamaño reducido (1.942.653.248 parámetros, artefacto de 1,31 GB) y su orientación explícita a despliegue en teléfono mediante PocketPal o llama-server. Frente a modelos generalistas del mismo orden, el autor reporta una mejora sustancial en precisión de tool use sobre el modelo base Qwen3.5-2B, pasando de 83,3% a 97,5% en el conjunto de desarrollo Admin v1 y de 75,0% a 90,8% en el holdout corregido Admin v2.1.

El modelo se distribuye bajo licencia Apache-2.0, con la salvedad de que el adaptador y las trazas de entrenamiento son trabajo propio de Nanoforge. Está entrenado exclusivamente en inglés y no cubre tareas de imagen ni de código, que corresponden a otros SKUs del mismo proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B) con adaptador QLoRA fusionado; incluye bloque MTP de la base |
| Parámetros totales | 1.942.653.248 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 recomendado en teléfono; 16384 usado en benchmark |
| Tipos de cuantización | Q4_K_M (GGUF); el autor no publica otras cuantizaciones en este repo |
| Idiomas soportados | Inglés (entrenamiento y evaluación en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); fichero `nano-admin-qwen35-2b-v15-mtp-Q4_K_M.gguf` |
| Tamaño del artefacto | 1.312.164.544 bytes (1,31 GB) |
| SHA-256 | `4ddaf9a955199c65883c253fe010156e9ac260aa1b31bd155ec90b253a2873ab` |
| Modelo base | Qwen/Qwen3.5-2B |
| Configuración del adaptador | QLoRA r=32, α=64, solo capas de lenguaje; vision tower congelado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer de 1.942.653.248 parámetros, sobre el que se aplica un adaptador QLoRA de rango 32 y α=64 restringido a las capas de lenguaje; la torre de visión del modelo base permanece congelada, por lo que el adaptador no incorpora capacidades visuales nuevas. El adaptador se fusiona con la base y el conjunto se cuantiza a GGUF Q4_K_M para llama.cpp. El artefacto conserva el bloque MTP (multi-token prediction) del modelo base, lo que explica que sea ligeramente mayor que un build Q4 estándar de 2B; el autor advierte explícitamente de no sustituirlo por un build sin MTP al comparar benchmarks.

El entrenamiento se realizó sobre 345 trazas auditadas, durante 2 épocas, con tasa de aprendizaje 1e-4 y longitud máxima de 8192 tokens. No se documenta en la información disponible el uso de RLHF o DPO; el proceso descrito es un ajuste supervisado sobre trazas verificadas de uso de herramientas. La evaluación se realizó con llama-server b11081 en una RTX 5090, contexto de 16K, temperatura 0 y modo thinking activado, con una única instancia de modelo a la vez.

## Capacidades

- Selección de herramienta entre nueve opciones predefinidas: calendario, temporizador, borrador de correo, búsqueda de archivos, recordatorios, lugares, clima, confirmación y borrado de fotos.
- Relleno de argumentos requeridos para cada herramienta a partir del enunciado del usuario.
- Emisión de múltiples llamadas a herramientas en el orden solicitado.
- Solicitud de aclaración cuando faltan argumentos obligatorios, en lugar de inventar valores (con limitaciones, ver sección de limitaciones).
- Respuesta directa sin herramienta cuando ninguna encaja con la petición.
- Llamada a `request_confirmation` antes de acciones destructivas, como el borrado de fotos.
- Formato de prompt compatible con la plantilla de chat de Qwen3.5 mediante `llama-server --jinja`.
- Compatibilidad declarada con endpoints y con la aplicación PocketPal AI para despliegue en teléfono.
- No cubre visión, código ni tareas de imagen: el adaptador no entrena esas capacidades y el autor remite a otros SKUs (Studio, Code).

## Casos de uso

- Asistente de teléfono como capa de decisión: el modelo recibe la transcripción o el texto del usuario y emite la llamada de herramienta correspondiente; el cliente de la app ejecuta la herramienta y aplica los permisos. Es adecuado por su tamaño (1,31 GB) y su contexto de 8192 tokens, que cubren conversaciones multi-turno típicas de un asistente móvil.
- Gestión de agenda y recordatorios: el modelo selecciona la herramienta de calendario o recordatorios y rellena fecha, hora y título a partir de una frase en lenguaje natural. El autor reporta que el modelo es más fuerte en confirmación, correo y clima que el competidor directo, aunque más débil en fechas de calendario.
- Redacción de correos: la herramienta de borrador de correo permite generar el contenido y los campos del mensaje a partir de una instrucción; el modelo es especialmente sólido en esta categoría según la comparativa head-to-head publicada.
- Consultas meteorológicas y de lugares: el modelo encamina la petición a las herramientas de clima o lugares y rellena los parámetros de ubicación; el autor lo señala como uno de sus puntos fuertes frente a Liquid LFM3-1.7B.
- Flujos con acciones destructivas: el borrado de fotos requiere una llamada previa a `request_confirmation`, lo que permite construir un gate de confirmación en el cliente antes de ejecutar la eliminación. Es un caso de uso diseñado explícitamente en el entrenamiento.
- Orquestación de múltiples herramientas en una sola petición: el modelo puede emitir varias llamadas en el orden solicitado, útil para tareas compuestas como «busca el archivo, crea un recordatorio y redacta un correo».
- Pruebas de integración en dispositivos móviles: el autor documenta un smoke test con PocketPal AI (contexto 8192, temperatura 0, thinking on, Metal/GPU on) para verificar carga y comportamiento, con la advertencia de que PocketPal no expone las nueve herramientas y las llamadas pueden renderizarse como JSON o texto en lugar de ejecutarse.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el modelo con su base Qwen3.5-2B y con Liquid LFM3-1.7B, en el mismo protocolo (RTX 5090, llama-server, Q4_K_M, 16K de contexto, temperatura 0, thinking on, una instancia a la vez). El conjunto v1 de 120 casos seleccionó la versión v15; v2.1 es un holdout corregido por el evaluador, no una segunda muestra independiente.

| Suite | Base Qwen3.5-2B | Admin v15 |
|---|---:|---:|
| Admin v1 (120 casos) | 100/120 · 83,3% | 117/120 · 97,5% |
| Admin v2.1 (holdout, 120 casos) | 90/120 · 75,0% | 109/120 · 90,8% |

| Suite | Liquid LFM3-1.7B | Admin v15 | Delta |
|---|---:|---:|---:|
| Admin v1 | 98/120 · 81,7% | 114/120 · 95,0% | +16 casos |
| Admin v2.1 | 98/120 · 81,7% | 108/120 · 90,0% | +10 casos |

El autor estima la generalización honesta en torno al 91%, no el 97,5% de v1, precisamente porque v1 seleccionó v15. La ventaja en v1 es estadísticamente sólida (McNemar pareado, p=0,0009); la ventaja en v2.1 es direccionalmente consistente pero no significativa con 120 casos (p=0,10). Liquid LFM3-1.7B es mejor en aclaraciones y fechas de calendario; Admin v15 es claramente mejor en confirmación, correo y clima. No se han publicado benchmarks de MMLU, HumanEval, GSM8K ni de rendimiento en teléfono (carga en frío, primer token, tokens/s de decodificación, memoria residente, comportamiento térmico) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto Q4_K_M ocupa 1,31 GB en disco; con contexto de 8192 y overhead de llama.cpp, se puede ejecutar en configuraciones con 2-3 GB de memoria disponible para el modelo.
- GPU recomendadas: el autor valida el benchmark en una RTX 5090; cualquier GPU con al menos 4 GB de VRAM libre debería poder cargar el modelo con contexto de 8192. Para despliegue en teléfono, el autor usa Metal/GPU en PocketPal.
- ¿Cabe en GPU de consumo? Sí, con amplio margen: 1,31 GB de pesos Q4_K_M permiten ejecución en GPUs de gama media y baja, y en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp mediante `llama-server --jinja` (comando documentado por el autor con `-c 8192 -ngl 99 --temp 0`), PocketPal AI en móvil. No se documenta soporte para vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor indica explícitamente que no hay benchmark de teléfono y que las cifras publicadas son de escritorio con RTX 5090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en suite Admin | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nano Admin v15 (Qwen3.5-2B + QLoRA) | 1.942.653.248 | 8192 recomendado / 16384 benchmark | 97,5% v1, 90,8% v2.1 | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.5-2B (base) | 1.942.653.248 | No disponible en la información | 83,3% v1, 75,0% v2.1 | Apache-2.0 | Hugging Face |
| Liquid LFM3-1.7B | No disponible en la información | No disponible en la información | 81,7% v1, 81,7% v2.1 | No disponible en la información | No disponible en la información |

La comparativa se limita a los tres modelos evaluados en la model card. No se dispone de datos de otros modelos de tool calling de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- La aclaración es el punto débil conocido: v15 solicita argumentos obligatorios faltantes con menos fiabilidad que Liquid LFM3-1.7B. El autor recomienda un guard determinista de argumentos requeridos en el cliente en lugar de otro LoRA pequeño.
- La ejecución de herramientas es responsabilidad del cliente: el modelo solo emite la llamada; la app debe aplicar permisos y confirmación. No debe permitirse que ejecute acciones destructivas sin un gate de confirmación independiente.
- No hay benchmark en teléfono: carga en frío, primer token, tokens/s, memoria residente y comportamiento térmico en iPhone no están medidos. Las cifras publicadas son de RTX 5090 de escritorio.
- El modelo es solo para el SKU Admin: no debe usarse para tareas de imagen o código, que corresponden a otros checkpoints (Studio y Code).
- Los prompts de entrenamiento y evaluación son en inglés; no se documenta soporte multilingüe.
- El artefacto incluye el bloque MTP de la base; comparar contra un build sin MTP invalida las comparaciones de benchmark.
- El conjunto v2.1 está corregido por el evaluador y no es una muestra completamente independiente; la estimación honesta de generalización es ~91%, no 97,5%.
- La ventaja frente a Liquid en v2.1 no es estadísticamente significativa con 120 casos (p=0,10).
- En PocketPal las llamadas a herramientas pueden renderizarse como JSON o texto en lugar de ejecutarse, ya que la app no expone las nueve herramientas; el smoke test en teléfono no equivale al benchmark puntuado.
- Al redistribuir, debe conservarse el aviso de licencia del modelo base Apache-2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jmacl/nano-admin-qwen35-2b-v15
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Smoke test en teléfono (referenciado en la model card): `admin-smoke.md` en el repositorio de Nanoforge (no se proporciona URL directa en la información disponible)
- Repositorio Nanoforge con la model card completa (no se proporciona URL directa en la información disponible)
