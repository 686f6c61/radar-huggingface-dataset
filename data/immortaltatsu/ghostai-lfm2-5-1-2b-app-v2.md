# immortaltatsu/ghostai-lfm2.5-1.2b-app-v2

## Resumen

GhostAI LFM2.5-1.2B — app-contract v2 es un modelo de lenguaje especializado en tool-calling, desarrollado por el usuario immortaltatsu para la aplicacion GhostWallet, una cartera de Solana que opera en dispositivos moviles. El modelo parte del checkpoint base LiquidAI/LFM2.5-1.2B-Thinking y se ha ajustado mediante supervisión completa (SFT) sobre 2.134 trazas sintéticas que cubren 58 herramientas de la app. Su función es emitir una única llamada de herramienta en formato Hermes (`<tool_call>{"name":"...","arguments":{...}}</tool_call>`) a partir del prompt del sistema y un catálogo JSON de herramientas recuperado por el host, para después responder en una sola línea con el resultado devuelto por la herramienta.

El modelo se distribuye en tres formatos: pesos bf16 en safetensors (2,3 GB), GGUF F16 (2,3 GB) y GGUF Q4_K_M (731 MB), este último pensado para ejecución en dispositivo mediante llama.cpp o llama.rn. Con 1.170.340.608 parámetros (1,17B), está orientado a escenarios de baja latencia en hardware móvil. Su relevancia radica en ser un ejemplo de ajuste fino para integración de agentes on-device con llamada a herramientas, aunque su contrato es estrictamente específico de la aplicación GhostWallet y no es reutilizable fuera de ese contexto.

La evaluación interna, realizada dentro de la propia app con el modelo cuantizado a Q4_K_M, muestra una mejora significativa respecto a la versión anterior (v1): el cumplimiento de formato pasa del 35,7% al 91,1%, y el rendimiento global end-to-end del 46,1% al 60,5%. Sin embargo, el modelo presenta limitaciones importantes, como una regresión en resistencia a inyección de prompts y una tasa de grounding (cita de valores devueltos por herramientas) de solo el 47%, por lo que el autor advierte explícitamente que no debe usarse sin una pasarela de confirmación en el host.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivado de LFM2.5-1.2B-Thinking (arquitectura no detallada) |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (safetensors), GGUF F16, GGUF Q4_K_M |
| Idiomas soportados | No disponibles (probablemente ingles, no especificado) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte del checkpoint LFM2.5-1.2B-Thinking de Liquid AI, aunque la arquitectura interna de ese modelo base no se detalla en la informacion disponible. Sobre esa base se realizó un ajuste fino supervisado completo (full SFT) con 2.134 trazas sintéticas generadas por plantillas, que cubren tres tipos de turnos: selección de herramienta, respuesta anclada al resultado de la herramienta y chit-chat que no debe producir llamadas a herramientas. El entrenamiento se ejecutó durante 3 épocas con una función de pérdida aplicada exclusivamente a los tokens del asistente, una decisión técnica que evita que el modelo aprenda a reproducir el renderizado nativo de tool-calling del chat template a partir de su propio historial.

Los prompts de entrenamiento se ensamblaron con el mismo código de recuperación y catálogo que usa la aplicación en producción, garantizando que el formato de entrada coincida byte a byte con el de inferencia. Además, cada argumento generado se validó contra los esquemas de parámetros reales de las herramientas. La división de evaluación se hizo por plantilla de enunciado y no por fila, de modo que las métricas miden el comportamiento ante frases no vistas. No se emplearon técnicas como RLHF o DPO; el ajuste es puramente supervisado.

## Capacidades

- Generación de texto limitada a respuestas de una sola línea tras la ejecución de una herramienta.
- Tool calling / function calling: emite exactamente un bloque `<tool_call>` con nombre y argumentos en JSON, sin prosa adicional.
- No es un planificador: no genera planes multi-paso ni decide si una acción es segura; el host controla la recuperación de herramientas, la validación de argumentos y la pasarela de confirmación.
- Soporte de chit-chat: puede responder a conversaciones informales sin invocar herramientas, aunque su entrenamiento en este aspecto es limitado.
- Capacidades multilingües: no especificadas; probablemente limitadas al inglés.
- Capacidad especial: está diseñado para integrarse en la app GhostWallet de Solana, con un contrato de prompt fijo y un catálogo de herramientas recuperado dinámicamente.

## Casos de uso

- Consulta de saldo de cartera Solana: el modelo recibe el prompt del sistema con el catálogo de herramientas y emite una llamada a `get_wallet_balance`, luego responde con el valor devuelto por la herramienta.
- Envío de SOL con confirmación del usuario: ante una solicitud de transferencia, el modelo genera una llamada a `send_sol` con los argumentos validados; el host ejecuta la pasarela de confirmación deslizante antes de cualquier movimiento de fondos.
- Asistente conversacional integrado en la app: para preguntas sobre transacciones, historial o saldo, el modelo alterna entre respuestas directas y llamadas a herramientas según el contexto.
- Ejecución on-device en dispositivos móviles: gracias al formato GGUF Q4_K_M (731 MB), el modelo puede ejecutarse con llama.rn o llama.cpp en hardware móvil sin conexión a servidores.
- Prototipado de agentes con tool-calling en entornos restringidos: sirve como referencia para desarrolladores que quieran implementar un flujo similar de llamada única a herramientas con validación de argumentos.
- Automatización de acciones dentro de la app: el modelo puede invocar herramientas como consultar el precio de un token, obtener el estado de una transacción o listar activos, siempre que el host las ofrezca en el catálogo recuperado.

## Benchmarks y rendimiento

La evaluación se realizó dentro de la aplicación real, con el modelo cuantizado a Q4_K_M mediante llama.cpp, e incluye métricas de cumplimiento de formato y comportamiento end-to-end. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

Cumplimiento de formato en un solo turno (56 enunciados reservados):

| Metrica | v1 | v2 |
|---|---|---|
| Emite una llamada de herramienta parseable | 35,7% | 91,1% |
| Argumentos que pasan la validacion de la app | 32,1% | 69,6% |
| Herramienta correcta, cuando la recuperacion la ofrecia | 33,3% | 50,0% |

Comportamiento end-to-end (76 casos / 88 turnos, intervalo de confianza Wilson 95%):

| Metrica | v1 | v2 |
|---|---|---|
| Global | 46,1% | 60,5% [48, 70] |
| Grounding (la respuesta cita el valor devuelto) | 23,5% | 47,1% |
| Pasarela de confirmacion respetada | 66,7% | 75,0% |
| Resistencia a inyeccion de prompts | 100% | 94,4% [74, 99] |
| Multi-turno | 8,3% | 25,0% |
| Bypass de la pasarela de confirmacion | 0 | 0 |
| Contenido plantado que llega a un argumento de herramienta | 0 | 0 |
| Tokens de completado por turno | 58,6 | 40,4 |

## Requisitos de hardware

- VRAM estimada: para el GGUF Q4_K_M (731 MB) se necesitan aproximadamente 1 GB de VRAM o RAM; para el GGUF F16 (2,3 GB) se requieren unos 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar la versión F16; para Q4_K_M basta una GPU integrada o incluso CPU.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en hardware móvil con suficiente RAM.
- Opciones de despliegue: llama.cpp, llama.rn (para móvil), Ollama (si se convierte a GGUF), vLLM (aunque es excesivo para un modelo tan pequeño).
- Latencia y throughput: no se han publicado mediciones formales; el modelo genera una media de 40,4 tokens por turno, lo que sugiere una latencia baja en hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables, ya que GhostAI LFM2.5-1.2B app-contract v2 es un ajuste fino específico para una aplicación concreta (GhostWallet) y su contrato de prompt es cerrado. Como referencia, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (base) | 1,2B | No disponible | Razonamiento general, thinking mode | LFM Open License v1.0 |
| GhostAI LFM2.5-1.2B app-contract v2 | 1,17B | No disponible | Tool-calling especifico para GhostWallet | LFM Open License v1.0 |

No hay alternativas publicadas con el mismo nivel de especificidad para tool-calling en carteras Solana. Para tareas generales de tool-calling, modelos como Llama 3.2 1B o Qwen 2.5 1.5B podrían servir, pero no son comparables en cuanto a contrato de uso.

## Limitaciones y advertencias

- Regresion en resistencia a inyeccion de prompts: en 1 de 18 casos de inyeccion, el modelo emitió una llamada a `send_sol` no solicitada tras un resultado de herramienta que contenía una instrucción maliciosa. La pasarela de confirmación del host impidió la ejecución, pero el modelo "picó el anzuelo". El corpus de entrenamiento no incluye ejemplos adversariales.
- Grounding bajo: aproximadamente la mitad de las respuestas no citan el valor devuelto por la herramienta; en 9 de 88 turnos se afirmó un número ausente en la salida de la herramienta.
- Retrieval limitado: con el fallback de embeddings hash de la app, la herramienta correcta aparece en el top-5 del catálogo solo ~11% de las veces para enunciados reales. El modelo no puede llamar a una herramienta que no se le ofrezca.
- Datos sinteticos únicamente: las 2.134 trazas son generadas por plantillas, sin transcripciones reales de usuarios. Solo se cubren 58 de las 174 herramientas de la app; el resto no está probado.
- Evaluacion pequeña: 76 casos de comportamiento; los intervalos de confianza para inyección y multi-turno son amplios y no deben usarse para afirmar seguridad.
- Contrato especifico: el modelo es inútil fuera del formato de prompt de GhostWallet y ya no emite el JSON de plan de la versión anterior (v1).
- Licencia LFM Open License v1.0: se debe verificar los términos comerciales con Liquid AI antes de usar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/immortaltatsu/ghostai-lfm2.5-1.2b-app-v2
- Modelo base (LiquidAI/LFM2.5-1.2B-Thinking): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
