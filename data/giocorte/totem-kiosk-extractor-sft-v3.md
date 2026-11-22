# giocorte/totem-kiosk-extractor-sft-v3

## Resumen

`giocorte/totem-kiosk-extractor-sft-v3` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el usuario giocorte. El proyecto implementa un sistema de dos componentes para un totem o kiosco conversacional: un "chiosco" (kiosco) que gestiona el diálogo con el cliente y un "estrattore" (extractor) que mantiene un estado estructurado de la conversación campo a campo. El adaptador se entrena mediante SFT (supervised fine-tuning) sobre 800 conversaciones sintéticas generadas con un agente Sonnet y evaluadas por un juez Haiku.

La relevancia de esta ficha radica en que documenta un caso de uso muy concreto de adaptación de un modelo pequeño (4B parámetros) para una tarea de extracción de estado y gestión de diálogo multi-turno en un dominio cerrado (venta de billetes, servicios de kiosco). El autor publica métricas detalladas de evaluación turno a turno, lo que permite evaluar la viabilidad del enfoque para producción. No obstante, se trata de un adaptador de nicho, sin licencia declarada, sin idiomas especificados y con cero descargas en el momento de la consulta.

El adaptador se distribuye como repositorio PEFT de 0,7 GB, con los pesos en formato safetensors y los datos de entrenamiento, resultados, logs y scripts incluidos en el repositorio. La arquitectura subyacente es la del Qwen3-4B-Instruct-2507, un transformer decoder-only de 4 mil millones de parámetros, aunque los detalles concretos de contexto y cuantización del modelo base no se detallan en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-4B-Instruct-2507 tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el autor menciona inputs de hasta 12.758 tokens en el entrenamiento del extractor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los datos de entrenamiento parecen incluir italiano y alemán, segun ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza LoRA con r=32, alpha=64, aplicado sobre todas las proyecciones lineales del modelo base Qwen/Qwen3-4B-Instruct-2507. El entrenamiento se divide en dos componentes: `kiosk_v3/` (el diálogo del kiosco) y `extractor_v3/` (el extractor de estado). El kiosco se entrenó en una GPU H200 durante 3 épocas con batch 2 y acumulación 4; la loss de validación pasó de 1,850 a 0,528 tras la primera época, 0,485 tras la segunda y 0,486 tras la tercera, por lo que la tercera época no aporta mejora. El extractor se entrenó en 4 GPU H100 con torchrun, batch 1 × acumulación 4 × 4 GPU = 16 ejemplos por paso, durante 2 épocas y 60 minutos; la loss de validación pasó de 0,237 a 0,0148 tras la primera época y 0,0121 al final.

Los datos de entrenamiento consisten en 800 conversaciones sintéticas (`data/sft_800_v3/`), generadas por un agente Sonnet que interpreta al cliente y evaluadas por un juez Haiku. El entrenamiento del extractor se realizó con inputs de hasta 12.758 tokens. El autor reporta que el despliegue con vLLM 0.11 falló inicialmente por un assert CUDA en kernels compilados, y que finalmente se sirvió en modo `--enforce-eager`. No se detalla la composición exacta del dataset ni si hubo RLHF o DPO; el entrenamiento es SFT supervisado.

## Capacidades

- Generación de texto conversacional para atención al cliente en un kiosco (venta de billetes, servicios, gestión de solicitudes).
- Extracción de estado estructurado campo a campo a partir de conversaciones multi-turno (zona, horario de salida, pasajeros, hora, animales, tarifa, etc.).
- Gestión de diálogo multi-turno con mantenimiento de contexto a lo largo de la conversación.
- Soporte de tool calling / function calling implícito: el kiosco emite comandos y respuestas estructuradas (el autor mide "mismo tipo de mossa (comando o risposta)").
- Capacidades multilingües limitadas: los ejemplos de la model card incluyen italiano y alemán ("keine Koffer"), aunque no se declaran idiomas oficiales.
- Razonamiento de estado y consistencia: el extractor compara su estado con etiquetas de referencia campo por campo.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- **Kiosco de venta de billetes automatizado**: el adaptador `kiosk_v3` gestiona la conversación con el cliente para seleccionar servicio, horario, pasajeros y tarifa, emitiendo comandos estructurados. Es adecuado porque el entrenamiento incluye 50 conversaciones realistas de compra y el autor reporta 27 compras realizadas con 22 correctas según el juez.
- **Extracción de estado en tiempo real**: el adaptador `extractor_v3` mantiene un estado campo a campo de la conversación, con un 79% de coincidencia con el estado de referencia por turno en el bench de 50 conversaciones. Útil para sistemas que necesitan un "slot filling" fiable en dominios cerrados.
- **Atención al cliente multi-turno en totems físicos**: el sistema puede gestionar conversaciones largas (inputs de hasta 12.758 tokens en entrenamiento) manteniendo el contexto de la solicitud, lo que permite resolver consultas complejas sin intervención humana.
- **Prototipado rápido de asistentes de dominio cerrado**: al ser un adaptador LoRA sobre un modelo de 4B, se puede desplegar en hardware modesto y ajustar con datos propios, sirviendo como base para verticales de kiosco (transporte, turismo, servicios públicos).
- **Sistemas de reserva y compra con validación de estado**: el extractor puede integrarse en pipelines que necesitan verificar que los datos capturados (pasajeros, animales, tarifa) coinciden con las etiquetas antes de confirmar una transacción, reduciendo errores de venta.
- **Evaluación de calidad de diálogo en producción**: los scripts y resultados incluidos (`results/`, `scripts/`, `bench_real50_v3/`) permiten reproducir la evaluación turno a turno y comparar versiones del adaptador, útil para equipos que iteran sobre asistentes conversacionales.
- **Investigación en SFT con datos sintéticos**: el repositorio incluye los datos de entrenamiento y los logs, lo que permite estudiar el efecto de 800 conversaciones sintéticas en la calidad de extracción de estado y diálogo.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. No se han verificado de forma independiente.

| Metrica | v2 | v3 |
|---|---|---|
| Estado correcto en el momento de la compra / compras realizadas | 14/23 (61%) | 21/27 (78%) |
| Mismo, sobre todos los clientes que querían comprar | 14/28 (50%) | 21/28 (75%) |
| Compras realizadas | 23 | 27 |
| Compras correctas según el juez | 18 | 22 |
| Compras incorrectas | 5 | 5 |
| Clientes perdidos por culpa del kiosco | 8 | 5 |
| Estado correcto en cada turno hasta la compra / compras realizadas | 8/23 (35%) | 12/27 (44%) |
| Estado del extractor igual a la referencia, por turno | 59% | 79% |
| Turnos con un hecho sin fuente | 22% | 20% |
| Turnos en bucle | 2 | 0 |
| Gold30 (30 conversaciones escritas a mano), por mensaje | 90% | 92% |
| Gold30, en cadena | 58% | 63% |
| Conversaciones reservadas, todos los 409 mensajes | 88% | 93% |
| Solo los 300 diálogos nuevos (119 mensajes) | 84% | 93% |
| Solo los 500 anteriores (290 mensajes) | 90% | 92% |

En el componente de kiosco, sobre 385 turnos reservados: mismo tipo de movimiento (comando o respuesta) en el 90% de los casos, mismo primer comando en el 83%, y ninguna respuesta en markdown.

Campos del extractor más frecuentemente distintos de la referencia: zona 18, horario de salida 17, pasajeros 11, hora 10, animales 10, tarifa 9.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. Al ser un adaptador LoRA sobre Qwen3-4B-Instruct-2507, la VRAM depende de la cuantización del modelo base; en FP16 el modelo base de 4B requiere aproximadamente 8 GB, más el adaptador (0,7 GB de repositorio). No se confirma en la información proporcionada.
- **GPU recomendadas**: el autor entrenó el kiosco en una H200 y el extractor en 4× H100. Para inferencia no se especifican GPU recomendadas.
- **Consumer GPU**: no se confirma; un modelo de 4B en cuantización de 4 bits podría caber en GPUs consumer de 8-12 GB, pero no hay dato verificado en la información.
- **Opciones de despliegue**: vLLM (el autor reporta que vLLM 0.11 falló por un assert CUDA y que se sirvió con `--enforce-eager`). No se mencionan llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros adaptadores o modelos de la misma categoría. El único punto de comparación interno es la versión anterior del mismo adaptador (v2), cuyos resultados se incluyen en la tabla de benchmarks.

## Limitaciones y advertencias

- **Licencia no declarada**: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido. Es un riesgo importante para producción.
- **Idiomas no declarados**: aunque los ejemplos incluyen italiano y alemán, no se confirma el soporte multilingüe oficial.
- **Adaptador de nicho**: entrenado para un dominio muy concreto (kiosco de venta de billetes y extracción de estado); su rendimiento fuera de ese dominio no está evaluado.
- **Datos sintéticos**: las 800 conversaciones fueron generadas por un agente Sonnet y evaluadas por un juez Haiku; existe riesgo de sesgos y de sobreajuste al estilo de esos generadores.
- **Rendimiento moderado**: el estado correcto en el momento de la compra es del 78% (21/27), y el estado del extractor coincide con la referencia en el 79% de los turnos; quedan errores frecuentes en campos como zona, horario de salida y pasajeros.
- **Riesgo de alucinación**: el 20% de los turnos contienen un hecho sin fuente según la evaluación del autor.
- **Fallos de despliegue**: vLLM 0.11 presentó un assert CUDA en kernels compilados; se requiere modo `--enforce-eager`, lo que puede afectar al rendimiento.
- **Cero descargas y cero likes**: no hay evidencia de uso comunitario ni validación externa.
- **Repositorio de 0,7 GB**: incluye datos, resultados, logs y scripts, lo que puede no ser adecuado para despliegues ligeros.

## Enlaces

- Hugging Face: https://huggingface.co/giocorte/totem-kiosk-extractor-sft-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
