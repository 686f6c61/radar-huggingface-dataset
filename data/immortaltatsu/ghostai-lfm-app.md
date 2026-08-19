# immortaltatsu/ghostai-lfm-app

## Resumen

GhostAI LFM app-contract SFT es un ajuste fino del modelo LFM2.5-1.2B-Thinking de Liquid AI, desarrollado por el usuario immortaltatsu para la aplicación móvil GhostWallet. El objetivo es que el modelo emita llamadas a herramientas (tool calls) siguiendo el contrato exacto que la app espera: un bloque `<tool_call>` con nombre y argumentos JSON válidos, en lugar de los planes JSON que generaban los checkpoints anteriores. El modelo se ha entrenado con 5.407 trazas reales de la app, cubriendo los 174 tools disponibles, y se sirve en formato GGUF para ejecución en dispositivo.

La relevancia de este modelo radica en su enfoque práctico para integración on-device: resuelve la selección de herramienta y la construcción de argumentos con un 98,2% de acierto cuando el tool correcto está en el catálogo recuperado, y reduce los tokens de completado por turno de 63 a 40,7. El principal cuello de botella restante es el sistema de recuperación de herramientas de la propia app, no el modelo. Está pensado para ser servido con llama.cpp o llama.rn, y su licencia hereda las restricciones comerciales de la LFM Open License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivado de LFM2.5-1.2B-Thinking (arquitectura no detallada en la ficha) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 (segun configuracion recomendada) |
| Tipos de cuantizacion | F16, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License (base) - uso comercial limitado a ingresos anuales < 10M USD; se aplica a derivados |
| Formato de pesos | GGUF (ficheros .gguf); safetensors segun tags del repositorio |

## Arquitectura y entrenamiento

El modelo parte de LFM2.5-1.2B-Thinking, un modelo de 1.200 millones de parametros de Liquid AI, y se ajusta mediante supervisión (SFT) con perdida solo sobre las respuestas del asistente (assistant-only loss). El entrenamiento utilizo 5.407 trazas del contrato de la app GhostWallet, generadas por destilacion del profesor Qwen3.6-35B-A3B, con validacion de cada argumento contra el esquema de su herramienta antes de aceptarlo (98% de aceptacion). Los prompts se envolvieron con el propio `ContextManager.assembleMessages` de la app para que fueran identicos a los de produccion. Se entrenaron 2 epocas en bf16 con DeepSpeed ZeRO-3 sobre 2 GPU A100, obteniendo una perdida de evaluacion de 0,1705 y una precision de token de 0,963.

El objetivo del ajuste era corregir el comportamiento de los checkpoints anteriores, que emitian planes JSON en lugar de bloques `<tool_call>` con nombre de herramienta y argumentos. Este modelo emite directamente el formato Hermes esperado por la app, lo que elimina el descarte de argumentos en el parser.

## Capacidades

- Generacion de texto y razonamiento conversacional basado en el modelo base LFM2.5-1.2B-Thinking.
- Emision de llamadas a herramientas (tool calling) en formato Hermes: `<tool_call>{"name":"send_sol","arguments":{...}}</tool_call>`.
- Seleccion de herramienta y construccion de argumentos validos segun el esquema de cada tool (98,2% de acierto cuando el tool correcto esta en el catalogo).
- Ejecucion en dispositivo (on-device) gracias al formato GGUF y al tamaño reducido (695 MB en Q4_K_M).
- Integracion con el sistema de recuperacion de herramientas de la app GhostWallet (catalogo top-5).
- Compatibilidad con servidores llama.cpp y llama.rn.

## Casos de uso

- Asistente de pagos en movil: el modelo puede interpretar ordenes como "envia 5 SOL a mi madre" y emitir la llamada `send_sol` con los argumentos correctos, integrándose directamente en el flujo de la app.
- Automatizacion de contratos inteligentes en Solana: al recibir instrucciones en lenguaje natural, el modelo genera las llamadas a herramientas de la app para ejecutar transacciones, consultas de saldo o gestion de tokens.
- Agente conversacional con tool calling en entornos con recursos limitados: su tamaño de 1.2B y cuantizacion Q4_K_M permiten ejecutarlo en telefonos o dispositivos edge sin depender de la nube.
- Filtrado de comandos de usuario en apps financieras: el entrenamiento con trazas reales de la app reduce la probabilidad de que el modelo genere planes JSON incorrectos o argumentos invalidos que rompan el parser.
- Reduccion de coste por turno en asistentes: al emitir directamente la llamada a herramienta, se reducen los tokens de completado (de 63 a 40,7 por turno), lo que abarata la inferencia en produccion.
- Prototipado rapido de agentes con tool calling: al estar disponible en GGUF, se puede desplegar con llama.cpp para pruebas locales y validacion de contratos de herramientas antes de escalar.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion sobre el harness de la app (56 utterances retenidas, cuantizacion Q4_K_M, greedy) y sobre un harness end-to-end (76 casos, 88 turnos, con la sesion de chat real de la app). No se han publicado resultados de benchmarks genericos como MMLU o HumanEval.

| Metrica (app harness) | Checkpoint anterior | Este modelo |
|---|---|---|
| Emite una llamada a tool parseable | 35,7% | 92,9% |
| Argumentos pasan el validador de la app | 32,1% | 87,5% |
| Llama a la herramienta esperada | 16,1% | 23,2% |
| Emite plan JSON (contrato incorrecto) | — | 0 |

| Con tool correcto en el catalogo | Checkpoint anterior | Este modelo |
|---|---|---|
| Emite una llamada parseable | 26,8% | 100% |
| Llama a la herramienta esperada | 21,4% | 98,2% |
| Argumentos validos | — | 94,6% |

| Metrica (end-to-end) | Baseline | Este modelo |
|---|---|---|
| Exito general | 44% | 56,6% |
| Grounding | 24% | 44,1% |
| Value gate | 67% | 75% |
| Resistencia a inyeccion | 100% | 94,4% |
| Multi-turno | 17% | 16,7% |
| Bypass de gate | 0 | 0 |
| Contenido plantado en argumentos | 0 | 0 |
| Tokens de completado por turno | 63 | 40,7 |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para la cuantizacion Q4_K_M (695 MB), unos 2,3 GB para F16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas integradas (por ejemplo, Intel Iris Xe o Apple M1). Para F16 se recomienda una GPU con 2-3 GB.
- Cabe en GPU de consumo: si, incluso en las mas modestas; tambien puede ejecutarse en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp (llama-server), llama.rn para integracion movil, y cualquier servidor compatible con GGUF (Ollama, etc.).
- Latencia y throughput: no se han publicado mediciones formales; al ser un modelo de 1.2B en Q4_K_M, se espera una latencia de decenas de milisegundos por token en GPU moderna y de unos cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otros modelos de la misma categoria (tool calling on-device de ~1B). La unica comparacion disponible es con el checkpoint anterior del mismo autor (ghost-ai-pro-gguf) y con el modelo base LFM2.5-1.2B-Thinking, cuyos datos de rendimiento no se han publicado. La tabla siguiente resume las diferencias observadas en el harness de la app.

| Modelo | Tamano | Contexto | Formato | Rendimiento en tool calling |
|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (base) | 1.2B | no disponible | safetensors | no evaluado en este harness |
| ghost-ai-pro-gguf (checkpoint anterior) | 1.2B | no disponible | GGUF | 16,1% de llamada correcta en app harness |
| ghostai-lfm-app (este modelo) | 1.2B | 8192 (recomendado) | GGUF | 98,2% de llamada correcta con tool en catalogo |

## Limitaciones y advertencias

- Resistencia a inyeccion de prompts: ha regresado del 100% al 94,4%; un caso adversarial falla, aunque se mantienen los invariantes absolutos (sin bypass del gate de confirmacion y sin contenido plantado en argumentos).
- Multi-turno debil: solo 16,7% de exito en conversaciones con seguimiento, resolucion de pronombres y cambios de tema; no mejoro respecto al checkpoint anterior.
- Alucinacion de numeros: en 5 turnos se inventaron cantidades no presentes en la salida de las herramientas.
- Llamadas fuera del conjunto de herramientas: en 16 turnos se llamaron tools que no estaban en el conjunto de prueba.
- La recuperacion de herramientas de la app es el principal cuello de botella en produccion: solo el 10,7% de las veces el tool correcto aparece en el top-5 del catalogo; mejorar el modelo no movera los numeros end-to-end hasta que se arregle la recuperacion.
- Licencia restrictiva: la LFM Open License del modelo base limita el uso comercial a empresas con ingresos anuales inferiores a 10 millones de USD; por encima de ese umbral se requiere un acuerdo separado con Liquid AI. Esta condicion se transmite a los derivados, incluido este modelo.
- No se han publicado datos sobre sesgos, idiomas soportados o comportamiento en dominios fuera de finanzas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/immortaltatsu/ghostai-lfm-app
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Checkpoint anterior (ghost-ai-pro-gguf): https://huggingface.co/immortaltatsu/ghost-ai-pro-gguf
- Pagina de modelos de Liquid AI: https://www.liquid.ai/models
