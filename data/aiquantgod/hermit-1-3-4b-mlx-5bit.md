# aiquantgod/Hermit-1.3-4B-MLX-5bit

## Resumen

Hermit 1.3 es un modelo de lenguaje especializado en tool calling para una cartera de criptomonedas (wallet) que se ejecuta en local en iPhone y Mac. Lo desarrolla aiquantgod (Hermit AI Labs) como un fine-tune LoRA del modelo base Qwen/Qwen3-4B-Instruct-2507, con licencia Apache 2.0. El modelo resuelve un problema concreto: interpretar instrucciones en lenguaje natural del usuario y traducirlas en llamadas a las 30 herramientas de la aplicacion Hermit (swap, bridge, trading, consulta de posiciones, automatizaciones), sin que ningun dato salga del dispositivo.

La version publicada en este repositorio es la compilacion MLX de 5 bits (unos 2,6 GB), pensada para inferencia on-device en hardware Apple Silicon. El modelo cuenta con 4.022.468.096 parametros totales y hereda la arquitectura transformer densa y la ventana de contexto del Qwen3-4B-Instruct-2507, aunque el autor no explicita el contexto en la model card. Su relevancia actual radica en el enfoque de privacidad: el asistente prepara operaciones financieras pero requiere aprobacion biometrica (Face ID o Touch ID) y nunca accede a claves privadas ni frases semilla.

El entrenamiento se realizo sobre 21.000 ejemplos de tareas reales de Hermit con dos pasadas sobre una NVIDIA L40S alquilada, cubriendo las 30 herramientas, peticiones multi-paso, recuperacion ante fallos de cotizacion y rechazo de peticiones inseguras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) con fine-tune LoRA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | 5 bits (build MLX publicada); existe build de 6 bits en Hermit 1.3 Lite |
| Idiomas soportados | no disponible (la model card no los explicita) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |
| Tamano del repositorio | 2,8 GB (pesos 5-bit: aprox. 2,6 GB) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Libreria de inferencia | mlx |
| Fecha de creacion | 2026-11-11 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de 4.000 millones de parametros, y se adapta mediante un fine-tune LoRA entrenado por el autor. El entrenamiento utilizo 21.000 ejemplos de tareas reales de Hermit que cubren las 30 herramientas disponibles, peticiones de multiples pasos, escenarios de recuperacion cuando falla una cotizacion y ejemplos de rechazo de peticiones inseguras. Se realizaron dos pasadas sobre una GPU NVIDIA L40S alquilada; los pesos publicados incorporan la segunda pasada.

Una innovacion operativa destacable es la forma de inyectar las herramientas: se envian en packs pequenos para mantener el prompt corto y reducir la latencia de la primera respuesta, algo critico en un asistente on-device. El autor verifico la fidelidad de la cuantizacion comparando el modelo de 5 bits con el de precision completa: coincidio en 37 de 40 primeros pasos, frente a 34 de 40 en el modelo de 4 bits, lo que justifica la eleccion de 5 bits para esta build.

## Capacidades

- Generacion de texto e interpretacion de instrucciones en lenguaje natural para operaciones financieras.
- Tool calling restringido a las 30 herramientas propias de Hermit (swap, bridge, trading, consulta de posiciones, cancelacion de ordenes, automatizaciones).
- Razonamiento multi-paso: encadena varias llamadas a herramientas para completar una peticion compuesta.
- Recuperacion ante errores: gestiona fallos de cotizacion y reintenta o informa al usuario.
- Rechazo de peticiones inseguras y negativa explicita a solicitar frases semilla o claves privadas.
- Creacion de automatizaciones programadas (por ejemplo, resumen diario de cartera a una hora fija).
- Funcionamiento completamente offline: responde sin conexion de red.
- No dispone de vision, audio ni modo thinking explicito segun la informacion disponible.

## Casos de uso

- Intercambio de tokens en lenguaje natural: el usuario pide "Swap 20 USDC on Base to NEAR" y el modelo genera la llamada a la herramienta de swap con los parametros correctos, abriendo la pantalla de revision con una cotizacion de NEAR Intents.
- Venta parcial de posiciones: instrucciones como "Sell half my BONK" se traducen en una operacion de venta sobre los tokens de Solana del usuario, con calculo del importe a partir del saldo actual.
- Apertura de posiciones apalancadas: "Long ETH with $50 at 5x" produce una orden para Hyperliquid lista para revision, con el apalancamiento y el importe exactos.
- Consulta y gestion de posiciones: "What are my positions?" lee el estado de la cartera; "Cancel my DOGE stop" solicita confirmacion antes de ejecutar la cancelacion.
- Automatizaciones recurrentes: "Every morning at 8, brief me on my portfolio" crea una tarea programada que el modelo ejecuta periodicamente sin intervencion.
- Asistente financiero con privacidad estricta: al ejecutarse en local y no acceder nunca a claves, es adecuado para usuarios que no quieren exponer balances ni planes a servidores de terceros.
- Integracion en aplicaciones Apple Silicon: al estar en formato MLX, puede embeberse en apps de macOS e iOS que necesiten un asistente de acciones sobre herramientas propias.

## Benchmarks y rendimiento

El autor publica metricas de evaluacion sobre 1.801 conversaciones de test tras la primera pasada:

| Metrica | Resultado |
|---|---|
| Nunca afirma algo hecho sin resultado de herramienta | 1.801 / 1.801 |
| Nunca solicita frase semilla ni clave | 60 / 60 |
| Importes y direcciones exactos en herramientas nuevas | 78% - 87% |
| Peticiones multi-paso completadas | 62% |
| Follow-ups correctos | 75% |
| Coincidencia de primeros pasos (5 bits vs. precision completa) | 37 / 40 |
| Coincidencia de primeros pasos (4 bits vs. precision completa) | 34 / 40 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 2,6 GB para los pesos de 5 bits, mas overhead de contexto y runtime MLX.
- Hardware objetivo: Apple Silicon (iPhone y Mac). La build de 5 bits esta pensada para iPhone recientes; los iPhone mas pequenos usan Hermit 1.3 Lite en 6 bits.
- GPU dedicadas: no es el objetivo de esta build; para NVIDIA se requeriria otra cuantizacion (no publicada en este repo).
- Cabe en GPU de consumo: si, en cualquier Apple Silicon con al menos 8 GB de memoria unificada; no se documenta soporte para RTX 4090 u otras GPU discretas en este repositorio.
- Despliegue: libreria MLX (mlx-lm); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles de forma numerica; el diseno de packs pequenos de herramientas busca reducir el tiempo hasta la primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hermit 1.3 4B MLX 5-bit | 4,02 B | no disponible | Tool calling para wallet, on-device | Apache 2.0 | Hugging Face (MLX) |
| Qwen3-4B-Instruct-2507 (base) | 4 B aprox. | no disponible en esta ficha | Asistente generalista | Apache 2.0 | Hugging Face |
| Hermit 1.3 Lite MLX 6-bit | no disponible | no disponible | Misma tarea, optimizado para iPhone pequenos | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de tool calling en la informacion proporcionada.

## Limitaciones y advertencias

- Solo puede invocar las herramientas de Hermit; no es un asistente generalista y su utilidad fuera de esa aplicacion es muy limitada.
- Precaucion principal: nunca debe otorgarse acceso directo a claves privadas; el propio modelo esta disenado para no solicitarlas ni gestionarlas.
- Tasa de exito en peticiones multi-paso del 62%: en produccion conviene mantener confirmacion humana en operaciones compuestas.
- Precision de importes y direcciones del 78% al 87% en herramientas nuevas: riesgo real de error en parametros criticos, por lo que la revision previa a la firma es imprescindible.
- Riesgo de alucinacion en la interpretacion de intenciones ambiguas; el diseno mitiga esto exigiendo resultado de herramienta antes de afirmar que algo se ha hecho.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue mas alla de lo heredado del modelo base.
- La cuantizacion de 5 bits introduce divergencias frente al modelo completo (3 de 40 primeros pasos distintos), lo que puede afectar a casos limite.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de las herramientas y politicas de gasto de la aplicacion Hermit para operar con seguridad.
- Modelo con muy poca traccion en Hugging Face (0 descargas, 1 like en el momento de la consulta): no hay validacion independiente de las metricas publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aiquantgod/Hermit-1.3-4B-MLX-5bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Hermit 1.3 Lite (6 bits): https://huggingface.co/aiquantgod/Hermit-1.3-Lite-MLX-6bit
- Descarga Mac: https://hermit.my/dmg
- Beta iPhone (TestFlight): https://testflight.apple.com/join/ed9vUh7d
- Beta Mac (TestFlight): https://testflight.apple.com/join/P66H5DF8
- Documentacion: https://docs.hermit.my
- Codigo de la aplicacion: https://github.com/Hermit-Ai-Labs/hermit-app
- Notas de seguridad: https://github.com/Hermit-Ai-Labs/hermit-app/blob/main/docs/SECURITY-DEMO.md
