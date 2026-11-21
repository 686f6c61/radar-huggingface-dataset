# giocorte/totem-kiosk-extractor-sft-v2

## Resumen

`totem-kiosk-extractor-sft-v2` es un conjunto de dos adaptadores LoRA (r=32, alpha=64, aplicados sobre todas las proyecciones lineales) entrenados sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Lo desarrolla el usuario de Hugging Face `giocorte` y está orientado a un dominio muy concreto: un tótem o kiosco conversacional de venta de billetes y gestión de viajes. El repositorio contiene dos adaptadores diferenciados: `kiosk_v2`, que actúa como asistente de voz del kiosco y ejecuta la CLI del tótem en formato texto, y `extractor_v2`, que extrae el estado estructurado de la conversación a partir del mensaje del cliente.

El problema que resuelve es el de la extracción fiable de estado (origen, destino, fecha, servicio, tarifa, pasajeros, edades, zona, etc.) en un diálogo multiturno, además de la generación de comandos para el kiosco. Es relevante porque aborda una tarea de producción muy específica —la interfaz conversacional de una máquina expendedora de billetes— con un modelo pequeño (4B) y adaptadores de bajo rango, lo que permite un despliegue económico en hardware modesto.

La información pública es escasa: no hay licencia declarada, no se especifican idiomas soportados y no se publican resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Toda la evaluación disponible es interna, sobre un conjunto de 30 conversaciones de referencia escritas a mano y sobre las particiones de validación del propio dataset de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B-Instruct-2507) con adaptadores LoRA (r=32, alpha=64) sobre todas las proyecciones lineales |
| Parametros totales | 4B (modelo base); tamano del repo de adaptadores: 0.6 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de 4B parámetros. Se entrenan dos adaptadores de forma simultánea: `kiosk_v2` (3 épocas), que actúa como asistente del kiosco y emite comandos en texto para la CLI del tótem sin escribir nunca el estado, y `extractor_v2` (2 épocas), que recibe el estado previo, el mensaje del cliente, la pantalla actual y lo que dijo el kiosco, y devuelve el nuevo estado junto con tres indicadores (confirma compra, pide personal, pide información).

El conjunto de entrenamiento son 499 conversaciones del dataset `sft_500_v2`: 260 generadas con modelos de Together y 239 escritas por agentes Claude, posteriormente reetiquetadas con `sft/generation/relabel.py` para ajustarlas a la especificación del 22/11. Los nombres de lugares, zonas, tarifas y coches del estado corresponden a los nombres exactos que devuelven las herramientas del kiosco; la expresión "from here" se resuelve como el lugar del kiosco y "on the phone" como SMS. No se documenta el uso de RLHF o DPO, ni el volumen de tokens de entrenamiento.

## Capacidades

- Generación de comandos para la CLI del kiosco en formato texto (el adaptador `kiosk_v2`), sin escribir el estado directamente.
- Extracción de estado estructurado a partir de un mensaje de cliente y un estado previo (el adaptador `extractor_v2`).
- Razonamiento multiturno sobre el estado de la conversación: incorpora el estado anterior, la pantalla, lo dicho por el kiosco y las palabras del cliente.
- Emisión de tres indicadores de intención: `confirms_purchase`, `asks_staff` y `asks_information`.
- Normalización de entidades del dominio: lugares, zonas, tarifas, coches, servicios, fechas, horas, pasajeros, edades, equipaje y fechas de validez.
- Respuestas sin markdown ni listas en el rol de kiosco (0/134 en la evaluación de respuestas del conjunto de validación).
- Soporte de tool calling / function calling: no disponible como capacidad declarada; el kiosco opera mediante una CLI en texto, no mediante un protocolo de function calling.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Extracción de estado en un tótem de venta de billetes: el adaptador `extractor_v2` procesa cada mensaje del cliente junto con el estado previo y devuelve el estado actualizado, lo que permite mantener un formulario de compra sincronizado con el diálogo sin que el usuario rellene campos manualmente.
- Asistente conversacional de kiosco: el adaptador `kiosk_v2` genera comandos en texto para la CLI del tótem, adecuado para gestionar la interacción de voz o texto en un entorno de autoservicio con un modelo de 4B desplegable en hardware modesto.
- Detección de intención de compra y de derivación a personal: los indicadores `confirms_purchase`, `asks_staff` y `asks_information` permiten decidir cuándo cerrar la transacción o cuándo escalar a un agente humano, con una precisión reportada del 99% y 100% respectivamente en el conjunto de validación.
- Normalización de entidades de dominio en pipelines de reservas: la conversión de expresiones coloquiales ("from here", "on the phone") a nombres canónicos de lugares y canales (SMS) facilita la integración con sistemas de reserva que exigen identificadores exactos.
- Prototipado rápido de interfaces conversacionales sobre Qwen3-4B: al ser adaptadores LoRA de 0.6 GB, se pueden cargar y descargar sobre el modelo base sin duplicar los pesos completos, lo que simplifica el despliegue de variantes por dominio.
- Evaluación de calidad de extracción de estado en dominios verticales: el conjunto de 30 conversaciones de referencia y los logs publicados sirven como base reproducible para comparar estrategias de extracción (estado encadenado frente a estado final).

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación interna, no benchmarks estándar):

| Evaluación | Métrica | Resultado |
|---|---|---|
| Extractor sobre 30 conversaciones de referencia (gold) | Estados exactos | 199/225 (88%) |
| Extractor sobre 30 conversaciones de referencia (gold) | Estado final exacto | 30/30 |
| Extractor sobre 30 conversaciones de referencia (chained) | Estados exactos | 135/225 (60%) |
| Extractor sobre 30 conversaciones de referencia (chained) | Estado final exacto | 18/30 |
| Extractor sobre 30 conversaciones de referencia (end) | Estado final exacto | 12/30 (40%) |
| Extractor sobre 290 mensajes de validación | Estado exacto según etiqueta | 256/290 (88%) |
| Extractor sobre 290 mensajes de validación | `confirms_purchase` | 287/290 (99%) |
| Extractor sobre 290 mensajes de validación | `asks_staff` | 289/290 (100%) |
| Extractor sobre 290 mensajes de validación | `asks_information` | 260/290 (90%) |
| Kiosco sobre 290 turnos de validación | Mismo tipo (comando o respuesta) | 256/290 (88%) |
| Kiosco sobre 290 turnos de validación | Mismo primer comando | 119/146 (82%) |
| Kiosco sobre 290 turnos de validación | Respuestas con markdown o lista | 0/134 (0%) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia, el modelo base Qwen3-4B-Instruct-2507 requiere aproximadamente 8 GB en FP16, 4-5 GB en cuantización de 8 bits y 2,5-3 GB en cuantización de 4 bits; los adaptadores LoRA añaden un coste marginal (repo de 0.6 GB).
- GPU recomendadas: no declaradas por el autor. Por tamaño del modelo base, una RTX 4090 (24 GB) o una A100/H100 permiten FP16 con holgura; una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes en cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 4-8 bits; en FP16 se recomienda 12-16 GB.
- Opciones de despliegue: PEFT (carga de adaptadores sobre el modelo base), vLLM con soporte LoRA, TGI, llama.cpp/Ollama (requiere conversión de los adaptadores a GGUF) y transformers con `PeftModel`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `giocorte/totem-kiosk-extractor-sft-v2` | 4B (base) + LoRA | no disponible | Extracción de estado y asistente de kiosco | no disponible | Hugging Face (repo público) |
| `Qwen/Qwen3-4B-Instruct-2507` | 4B | no disponible en esta ficha | Modelo generalista de instrucciones | no disponible en esta ficha | Hugging Face |
| Alternativas de extracción de estado con LoRA sobre modelos de 3-8B | 3-8B | variable | Ajuste por dominio | variable | no disponible |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada; la comparación se limita al modelo base y a la categoría de adaptadores LoRA de dominio específico.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el dataset de entrenamiento procede de generación con modelos de Together y agentes Claude, lo que puede introducir sesgos de estilo y de cobertura de casos.
- Riesgo de alucinación: el extractor muestra errores de tipo "extra" (entidades inventadas) en la evaluación, por ejemplo `extra:service` (5), `extra:fare` (3) y `extra:time` (1) en el conjunto gold; en producción conviene validar el estado contra las herramientas del kiosco.
- Degradación en modo encadenado: la precisión del estado exacto cae del 88% (gold) al 60% (chained) y al 40% (end), lo que indica acumulación de errores en conversaciones largas.
- Limitaciones de contexto o idioma: no se declaran idiomas soportados ni longitud de contexto; el dominio está restringido a la especificación del 22/11 del kiosco (lugares, zonas, tarifas y coches concretos).
- Restricciones de licencia: la licencia no está declarada en el repositorio, por lo que el uso comercial no está garantizado y requiere contactar con el autor o verificar la licencia del modelo base.
- Caveats para producción: el adaptador `kiosk_v2` nunca escribe el estado (solo emite comandos), por lo que la coherencia del estado depende enteramente del extractor; además, el modelo solo se ha evaluado sobre conversaciones sintéticas y escritas por agentes, no sobre tráfico real de clientes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/giocorte/totem-kiosk-extractor-sft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
