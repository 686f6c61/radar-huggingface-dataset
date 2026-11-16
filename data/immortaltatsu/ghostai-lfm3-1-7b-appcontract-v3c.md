# immortaltatsu/ghostai-lfm3-1.7b-appcontract-v3c

## Resumen

ghostai-lfm3-1.7b-appcontract-v3c es un ajuste fino supervisado (SFT) del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario immortaltatsu. El modelo esta especializado en la emision de llamadas a herramientas (tool calling) en formato Hermes para un asistente de cartera Solana que expone 198 herramientas distintas, con un enfasis explicito en permanecer en silencio (sin emitir llamada) en turnos de conversacion o respuesta directa.

La version v3 corrige tres problemas de la v2: alinea el formato de prompt con el que usa realmente la aplicacion en el dispositivo (catalogo compacto generado por `LocalToolCatalog.ts`), elimina 511 filas de entrenamiento contaminadas por copias casi exactas de dos cuestionarios de evaluacion externos, y anade casos duros (herramientas con pocos parametros, multi-turno y rechazos) generados por un profesor local de 33B. El entrenamiento se realizo con 3 epocas, learning rate 1e-5, bf16, FlashAttention-2 y DeepSpeed ZeRO-2 sobre 3x A100-40GB.

El modelo tiene 1.990.945.536 parametros (aproximadamente 2B) y esta pensado para inferencia en dispositivo (on-device). Su relevancia actual reside en ser un ejemplo de ajuste fino compacto orientado a un contrato de aplicacion concreto, con evaluacion offline reproducible y sin dependencia de APIs externas en la generacion de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM3-1.7B; detalles de la arquitectura base no disponibles en la informacion proporcionada) |
| Parametros totales | 1.990.945.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso max length 2048 |
| Tipos de cuantizacion | no disponible (el repo incluye pesos en safetensors y GGUF; el profesor usado para datos se ejecuto en Q4_K_M, no el modelo) |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de aproximadamente 2B parametros. No se detalla en la informacion disponible la arquitectura interna de la base (tipo de atencion, capas, dimensiones), por lo que no se puede confirmar si incorpora mecanicas especificas como atencion lineal o hibridas. El ajuste fino es un SFT con perdida solo en turnos del asistente, longitud maxima 2048, 3 epocas, learning rate 1e-5 con scheduler coseno, bf16, FlashAttention-2, AdamW fusionado y DeepSpeed ZeRO-2 distribuido en 3x A100-40GB.

El dataset `ghost-ai-app-contract-lfm3-v3.parquet` contiene 818 filas puntuadas y se dividio por esqueleto de enunciado (utterance skeleton), de modo que el conjunto de test contiene formulaciones no vistas. Los datos se generaron con un profesor local Nanbeige4.3-33B en Q4_K_M sobre tres instancias A100-40GB, sin uso de APIs externas o en la nube. La innovacion principal no es arquitectonica sino de contrato: el prompt de entrenamiento reconstruye las cadenas reales de la aplicacion (`ContextManager.ts`) y el catalogo compacto (`LocalToolCatalog.ts`), de forma que entrenamiento e inferencia ven exactamente los mismos bytes. Se eliminan 511 filas contaminadas de la v2 y se sustituyen por parafrasis generadas por el profesor.

## Capacidades

- Generacion de llamadas a herramientas en formato Hermes para un catalogo de 198 herramientas de un asistente de cartera Solana.
- Tool calling con argumentos validados contra definiciones (`app-tool-defs.json`).
- Supresion de llamadas en turnos de conversacion o respuesta directa (comportamiento de "silencio").
- Manejo de casos duros: herramientas con pocos parametros, conversaciones multi-turno y rechazos.
- Capacidad multilingue limitada: solo se declara ingles.
- Modo de razonamiento desactivable: debe usarse `enable_thinking=False` para evitar delimitadores `</think>` que la aplicacion marca como fuga de marcado.
- No se declaran capacidades de vision, audio ni matematicas avanzadas.

## Casos de uso

- Asistente de cartera Solana on-device: el modelo traduce instrucciones en lenguaje natural ("send 2 SOL to alice.sol") en llamadas a herramientas estructuradas, adecuado por su tamano compacto y su entrenamiento contra el catalogo real de la aplicacion.
- Integracion en aplicaciones moviles o de escritorio con recursos limitados: al ser un modelo de ~2B, puede ejecutarse en dispositivo con cuantizacion, evitando enviar datos de cartera a la nube.
- Enrutamiento de intenciones con catalogo compacto: su entrenamiento con el formato `params: type or enum choices; ! means required` lo hace apto para pipelines que construyen catalogos reducidos en tiempo de ejecucion.
- Control de turnos conversacionales: su capacidad de no emitir llamadas en turnos de chat permite usarlo como capa de decision entre conversacion y accion.
- Evaluacion de contratos de aplicacion: sirve como referencia para medir parseabilidad, eleccion correcta de herramienta y validez de argumentos en entornos con validadores propios.
- Prototipado de agentes con restricciones de seguridad: su diseno exige que las herramientas que mueven valor nunca firmen ni difundan desde el chat, lo que encaja en arquitecturas con puerta de confirmacion.
- Generacion de datos sinteticos de tool calling: el pipeline con profesor local es replicable para crear datasets de dominio especifico sin APIs externas.

## Benchmarks y rendimiento

Evaluacion retenida del contrato de aplicacion (prompts compactos de runtime, decodificacion greedy, parser/validador del repo):

| Metrica | Valor |
|---|---:|
| Filas puntuadas | 818 |
| Turnos de llamada: llamada parseable | 96,67% |
| Turnos de llamada: herramienta correcta | 94,00% |
| Turnos de llamada: argumentos validos | 96,00% |
| Turnos de llamada: llamada exacta | 0,00% |
| Turnos de respuesta/chat: sin llamada emitida | 0,00% (no se emitieron llamadas) |

Evaluacion externa con cuestionarios offline (prompts compactos):

| Suite | n | any-tool | primary | route | args valid | gate |
|---|---:|---:|---:|---:|---:|---:|
| agentic-eval-3 | 2000 | 95,37% | 90,76% | 91,69% | 81,65% | 87,12% |
| grpo-2000-eval | 2000 | 89,57% | 79,73% | 83,55% | 79,20% | 74,80% |

Los catalogos de estas ejecuciones son sinteticos (herramientas esperadas mas distractores), ya que no se ejercita el paso de recuperacion real. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de ~2B en bf16 se situa en el orden de 4-5 GB de pesos, y en cuantizaciones de 4 bits en torno a 1,5-2 GB (estimacion orientativa, no confirmada en la model card).
- GPU recomendadas: el entrenamiento uso 3x A100-40GB; para inferencia no se especifican GPU concretas.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 8 GB o mas en bf16 y en configuraciones de 4-6 GB con cuantizacion, aunque no se confirma en la informacion.
- Opciones de despliegue: transformers (con `trust_remote_code=True`); el repo incluye pesos GGUF, lo que habilita llama.cpp u Ollama, aunque no se detalla el procedimiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ghostai-lfm3-1.7b-appcontract-v3c | ~2B | no disponible | Tool calling de dominio (Solana) | other | Hugging Face |
| LiquidAI/LFM3-1.7B (base) | ~2B | no disponible | Modelo generalista base | no disponible | Hugging Face |
| Alternativas generalistas de ~2B | no disponible | no disponible | Proposito general | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada; la comparativa se limita a la relacion con el modelo base.

## Limitaciones y advertencias

- Entrenado y evaluado contra servicios de herramientas de tipo fixture: la correccion del protocolo real, la firma y la economia de transacciones quedan fuera de alcance.
- Las herramientas que mueven valor nunca deben firmar ni difundir desde el chat; la puerta de confirmacion de la aplicacion es la autoridad, no el modelo.
- La evaluacion offline mide eleccion de herramienta, contencion, validez de argumentos y texto de rechazo, pero no la calidad de recuperacion: los catalogos se ensamblan de forma sintetica.
- Los oraculos basados en palabras clave no miden veracidad general ni calidad de explicacion.
- No se ha realizado revision humana ciega.
- Riesgo de alucinacion en argumentos y nombres de herramientas fuera del dominio entrenado.
- Soporte unicamente en ingles.
- Licencia "other": deben revisarse las condiciones antes de uso comercial.
- Debe pasarse `enable_thinking=False`; de lo contrario el modelo emite delimitadores de razonamiento que la aplicacion rechaza.
- La metrica de llamada exacta es 0,00%, lo que indica que ninguna llamada coincide exactamente con la referencia del conjunto de evaluacion; conviene interpretar con cautela el resto de metricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/immortaltatsu/ghostai-lfm3-1.7b-appcontract-v3c
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
