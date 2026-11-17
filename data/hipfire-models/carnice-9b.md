# hipfire-models/carnice-9b

## Resumen

Carnice-9B es un ajuste fino (finetune) orientado a tool-use de Qwen3.5-9B, desarrollado por kai-os y redistribuido en formato cuantizado por hipfire-models para el motor de inferencia hipfire. El modelo emplea la plantilla de chat de Hermes con etiquetas XML `<tool_call>` para function calling, y anade capacidades de navegador, terminal y razonamiento sobre la base del modelo original. La arquitectura es un hibrido DeltaNet heredado directamente de Qwen3.5, con 9 mil millones de parametros.

La version publicada por hipfire-models no es el modelo original en precision completa, sino una cuantizacion especifica para GPUs AMD RDNA (RDNA 1 a 4, incluidas APUs), compilada mediante JIT por el motor hipfire, escrito en Rust. Se ofrecen dos variantes: HF4 (4 bits, 4,5 GB) y HF6 (6 bits, 6,9 GB), ambas disenadas para caber en 8 GB de VRAM.

Su relevancia actual radica en dos factores: por un lado, demuestra que es posible ejecutar un modelo de 9B con capacidades de agente y tool calling en hardware AMD de gama consumer; por otro, la licencia Apache 2.0 permite uso comercial sin restricciones adicionales. El modelo esta orientado exclusivamente al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido DeltaNet (heredada de Qwen3.5) |
| Parametros totales | 9 mil millones (9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HF4 (4 bits, 4,5 GB), HF6 (6 bits, 6,9 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | formato propietario de hipfire (`.hf4`, `.hf6`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer hibrido que combina capas de atencion con mecanismos DeltaNet. Carnice anade sobre esa base un ajuste fino orientado a tool-use siguiendo el formato Hermes: el modelo genera llamadas a funciones dentro de etiquetas XML `<tool_call>` embebidas en el flujo ChatML, sin necesidad de un parser especial en el motor de inferencia, ya que hipfire las trata como tokens normales.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset de ajuste fino, ni si se emplearon tecnicas de RLHF o DPO. La model card unicamente indica que el finetune aporta capacidades de navegador, terminal y razonamiento, sin detallar la metodologia. La cuantizacion a HF4 y HF6 la realiza hipfire-models para su motor, que compila kernels JIT especificos para la arquitectura RDNA del hardware de destino.

## Capacidades

- Generacion de texto y razonamiento general sobre la base de Qwen3.5-9B.
- Tool calling / function calling mediante etiquetas XML `<tool_call>` en formato Hermes.
- Capacidades de agente: uso de navegador y terminal como herramientas, segun la model card.
- Razonamiento multi-paso orientado a tareas con herramientas.
- Integracion nativa con el motor hipfire en GPUs AMD RDNA 1-4 y APUs.
- Soporte exclusivo de ingles.

## Casos de uso

- Automatizacion de tareas de terminal: el modelo puede generar comandos de shell dentro de llamadas a herramientas estructuradas, lo que permite construir agentes que ejecuten operaciones en un entorno controlado y devuelvan el resultado al bucle de razonamiento.
- Agentes de navegacion web: con la capacidad de navegador indicada por el autor, se puede emplear para extraer informacion, rellenar formularios o encadenar pasos de navegacion dentro de un pipeline de automatizacion.
- Asistente de desarrollo en local sobre GPU AMD: al ejecutarse con hipfire en tarjetas RDNA consumer, sirve para entornos de desarrollo donde no hay GPUs NVIDIA disponibles y se necesita un asistente con tool calling.
- Prototipado de agentes multi-paso: el formato Hermes con `<tool_call>` facilita la integracion en frameworks de agentes que esperan ese esquema, permitiendo iterar rapidamente sobre disenos de flujos con herramientas.
- Despliegue en estaciones de trabajo con 8 GB de VRAM: la variante HF4 (4,5 GB) permite mantener el modelo residente junto con el resto del stack en equipos modestos, util para demos y pruebas internas.
- Evaluacion de motores de inferencia alternativos: como artefacto cuantizado para hipfire, es util para comparar rendimiento y calidad frente a otros runtimes (llama.cpp, vLLM) en el mismo hardware AMD.

## Benchmarks y rendimiento

La model card unicamente proporciona datos de velocidad medidos en una Radeon RX 5700 XT:

| Variante | Cuantizacion | Tamano | Velocidad (5700 XT) |
|---|---|---|---|
| `carnice-9b.hf4` | HF4 (4 bits) | 4,5 GB | ~41 tok/s |
| `carnice-9b.hf6` | HF6 (6 bits) | 6,9 GB | ~32 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 4,5 GB para HF4 y 6,9 GB para HF6, mas el overhead del runtime; ambas variantes estan pensadas para caber en 8 GB de VRAM.
- GPU compatibles: cualquier GPU AMD RDNA 1-4 y APUs AMD, gracias a la compilacion JIT del motor hipfire. La velocidad de referencia se midio en una RX 5700 XT (RDNA 1).
- GPU consumer: si, cabe en tarjetas AMD de 8 GB o mas, como la propia RX 5700 XT.
- GPU NVIDIA: no se documenta soporte; el motor hipfire esta orientado a AMD RDNA.
- Opciones de despliegue: exclusivamente el motor hipfire (`hipfire pull carnice:9b`, `hipfire run carnice:9b`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 41 tok/s con HF4 y 32 tok/s con HF6 en RX 5700 XT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Carnice-9B (hipfire) | 9B | no disponible | Apache 2.0 | HF4/HF6, hipfire (AMD) | Finetune Hermes tool-use sobre Qwen3.5-9B |
| Qwen3.5-9B (base) | 9B | no disponible | no disponible en la informacion | safetensors y otros | Modelo base sin el ajuste de tool-use de Carnice |
| kai-os/Carnice-9b | 9B | no disponible | no disponible en la informacion | no disponible | Modelo original en precision completa antes de la cuantizacion de hipfire |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de calidad con alternativas de la misma categoria.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- No se documenta la longitud de contexto, lo que dificulta planificar casos de uso con conversaciones o documentos largos.
- Al ser un finetune orientado a tool-use, existe riesgo de alucinacion en la generacion de llamadas a herramientas (argumentos inventados, herramientas inexistentes) que debe mitigarse con validacion en el orquestador.
- La cuantizacion a 4 y 6 bits puede degradar la calidad respecto al modelo original en tareas de razonamiento complejo; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Dependencia total del motor hipfire y del hardware AMD RDNA: no es desplegable en stacks estandar como vLLM o llama.cpp sin conversion adicional.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.5-9B antes de un uso comercial en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hipfire-models/carnice-9b
- Modelo base original: https://huggingface.co/kai-os/Carnice-9b
- Motor de inferencia hipfire: https://github.com/Kaden-Schutt/hipfire
