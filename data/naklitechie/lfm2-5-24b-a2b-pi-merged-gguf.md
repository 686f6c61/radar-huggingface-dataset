# naklitechie/LFM2.5-24B-A2B-pi-merged-GGUF

## Resumen

LFM2.5-24B-A2B-pi-merged-GGUF es una distribución comunitaria del modelo LFM2.5-24B-A2B de Liquid AI, publicado por el usuario naklitechie, en la que se ha fusionado (merge) un adaptador LoRA de tipo agente de programación denominado Pi, desarrollado por harness-hub, directamente sobre los pesos del modelo base. El resultado es un único fichero GGUF de 13.954.629.664 bytes (aproximadamente 13,95 GB) que no requiere cargar adaptadores en tiempo de ejecución, lo que simplifica el despliegue tanto en llama.cpp como en el motor nativo `lfm2_moe_ssd.js` de diskformer.js para su ejecución en navegador mediante WebGPU.

El modelo base pertenece a la familia LFM2.5 de Liquid AI y, por su etiqueta `lfm2moe`, se trata de una arquitectura Mixture of Experts (MoE) con 24B parámetros totales y 2B parámetros activos por token (denominación A2B). La cuantización empleada es QAD-Q4_0 para los expertos enrutados y Q8_0 para las 106 matrices afectadas por el adaptador, manteniendo el token embedding en Q6_K. La relevancia de esta ficha radica en que documenta un caso de fusión de LoRA especializado en tareas de agente de código, con verificación de equivalencia frente a la carga dinámica del adaptador, y con una licencia LFM Open License v1.0 que restringe el uso comercial a entidades con ingresos anuales inferiores a 10 millones de dólares.

La longitud de contexto, los idiomas soportados y los parámetros activos exactos no se detallan en la información proporcionada, por lo que se indican como no disponibles en la tabla de especificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), etiqueta `lfm2moe`; base LiquidAI LFM2.5-24B-A2B |
| Parametros totales | 24B (según denominación del modelo base) |
| Parametros activos | 2B (según denominación A2B del modelo base); desglose exacto no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QAD-Q4_0 (expertos enrutados), Q8_0 (106 matrices modificadas por el adaptador), Q6_K (token embedding); fichero único GGUF |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`); uso comercial no licenciado para entidades con ingresos anuales ≥ 10 M USD |
| Formato de pesos | GGUF (fichero `LFM2.5-24B-A2B-pi-QAD-Q4_0-dense-Q8_0.gguf`, 13.954.629.664 bytes, sha256 `f3348381f00f34ce582fb96051bb5bc366914cae8eaa207915b5a50ab8fc2a8c`) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-24B-A2B es un transformer con arquitectura Mixture of Experts según la etiqueta `lfm2moe`, con 24B parámetros totales y 2B activos por token. La información disponible no detalla el número de expertos, la función de enrutamiento, la composición del dataset de preentrenamiento ni si se aplicaron fases de RLHF o DPO; estos datos deben consultarse en la model card del modelo base de LiquidAI.

Sobre esta base se aplicó un adaptador LoRA de rango 32 y alpha 64 (`LFM2.5-24B-A2B-harbor-pi-lora-F16.gguf`, revisión `a994cf7`, sha256 `5e96d059…`) publicado por harness-hub, orientado a tareas de agente de programación. La fusión se realizó con `llama-export-lora` de llama.cpp con escala alpha/rank = 2, produciendo las matrices afectadas en F16. Posteriormente se recuantizaron a Q8_0 las 106 matrices que el adaptador modifica: 30 `in_proj`/`out_proj` de convolución corta, 10 matrices de atención (`q`, `k`, `v`, `output`) y las 2 FFN densas iniciales. Los otros 322 tensores son idénticos byte a byte al fichero base, incluidos los 12,91 GB de expertos enrutados en Q4_0 y el token embedding en Q6_K, ya que el adaptador no altera ningún experto. Las herramientas empleadas fueron una compilación de llama.cpp de NakliTechie/llama.cpp (rama `webgpu-diskformer`, commit `5ac033a52`) ejecutada en CPU.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base LFM2.5-24B-A2B.
- Capacidades de agente de programación aportadas por el adaptador Pi de harness-hub (edición de código, tareas de agente de codificación).
- Ejecución en navegador mediante WebGPU con paginación de expertos desde disco (motor `Lfm2MoeSsd` de diskformer.js 0.6.17 o superior, con pool de expertos configurable, por ejemplo 4 GiB).
- Carga como GGUF estándar en llama.cpp (`llama-server -m ... --jinja`).
- Soporte de plantilla de chat Jinja en llama.cpp (`--jinja`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación en el navegador: el modelo puede ejecutarse íntegramente en Chrome mediante WebGPU con el motor `lfm2_moe_ssd.js`, paginando los expertos desde disco con un pool de 4 GiB, lo que permite ofrecer asistencia de código sin backend ni envío de datos a un servidor.
- Agente de codificación autoalojado: al incorporar el adaptador Pi fusionado, puede desplegarse con `llama-server --jinja` para tareas de edición y generación de código dentro de un pipeline interno, sin la sobrecarga de cargar un LoRA en tiempo de ejecución.
- Despliegue en entornos con recursos limitados de VRAM: el fichero único de ~13,95 GB con expertos en Q4_0 permite servir un modelo de 24B totales/2B activos en una sola GPU consumer de gama alta o en configuraciones con offload parcial, al reducir el peso en memoria respecto a una cuantización de mayor precisión.
- Prototipado de agentes en aplicaciones web: la integración con anyformer.js permite enrutar peticiones al motor `Lfm2MoeSsd` desde aplicaciones JavaScript, útil para demos y herramientas de desarrollo que requieran un LLM local en el cliente.
- Evaluación de adaptadores LoRA fusionados: el repositorio documenta el procedimiento exacto (`llama-export-lora` + `llama-quantize --allow-requantize`) y las comprobaciones de equivalencia, por lo que sirve como referencia reproducible para equipos que quieran fusionar sus propios adaptadores sobre modelos MoE cuantizados.
- Investigación sobre ejecución de MoE con paginación desde disco: el caso de uso del motor diskformer (expertos paginados desde SSD) es un banco de pruebas para estudiar latencia y throughput de inferencia MoE en entornos con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye comprobaciones de equivalencia funcional (generación greedy, 64 tokens, 9 prompts cortos de chat) frente a `llama-server --lora` sobre el fichero base:

| Ejecución | Respuestas idénticas |
|---|---|
| llama.cpp (Metal) sobre este fichero | 7 de 9 |
| Motor nativo de diskformer en Chrome sobre este fichero (pool de expertos de 4 GiB) | 8 de 9 |
| Motor nativo de diskformer sobre el base sin modificar frente a su referencia | 8 de 9 |

Los desacuerdos se describen como divergencias tardías entre tokens casi iguales. La model card indica explícitamente que estas pruebas no miden el efecto del adaptador en tareas de agente; esos resultados deben consultarse en la model card del adaptador, medidos sobre una base Q8_0.

## Requisitos de hardware

- Tamaño del fichero: 13.954.629.664 bytes (~13,95 GB), de los cuales ~12,91 GB corresponden a expertos enrutados en Q4_0.
- VRAM estimada para inferencia: no disponible de forma explícita; el fichero completo requiere al menos ~14 GB de memoria si se carga entero, aunque el motor diskformer permite paginar expertos desde disco con un pool configurable (el ejemplo usa 4 GiB).
- GPU recomendadas: no disponibles en la información proporcionada; la model card cita pruebas en Metal (Apple) y en Chrome con WebGPU.
- ¿Cabe en GPU consumer? No confirmado en la información disponible; por tamaño de fichero, encajaría en GPUs con 16 GB o más de VRAM si se carga completo, y en configuraciones menores con paginación de expertos desde disco.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), diskformer.js 0.6.17+ (motor `Lfm2MoeSsd`, WebGPU), anyformer.js como enrutador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-pi-merged-GGUF (este) | 24B totales / 2B activos | no disponible | GGUF QAD-Q4_0 + Q8_0 + Q6_K | LFM Open License v1.0 | Hugging Face (naklitechie) |
| LiquidAI/LFM2.5-24B-A2B-GGUF (base) | 24B totales / 2B activos | no disponible | GGUF (incluye QAD-Q4_0) | LFM Open License v1.0 | Hugging Face (LiquidAI) |
| harness-hub/LFM2.5-24B-A2B-pi-GGUF (adaptador) | no disponible | no disponible | GGUF + LoRA F16 (rango 32, alpha 64) | LFM Open License v1.0 | Hugging Face (harness-hub) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia LFM Open License v1.0: el uso comercial por parte de entidades con ingresos anuales de 10 millones de dólares o más no está licenciado (sección 5); revisar el fichero `LICENSE` antes de cualquier despliegue comercial.
- El repositorio no está afiliado a Liquid AI ni a harness-hub, según declara el autor.
- Las comprobaciones de equivalencia muestran 7/9 y 8/9 respuestas idénticas frente a la carga dinámica del adaptador; existen divergencias menores por empates entre tokens casi iguales.
- No se ha medido el efecto del adaptador Pi en tareas de agente sobre esta cuantización; los resultados del adaptador se midieron sobre una base Q8_0, por lo que el rendimiento en tareas de código puede diferir.
- La recuantización de las 106 matrices afectadas a Q8_0 busca preservar la calidad del base QAD, pero no se aportan métricas de perplejidad ni de calidad tras la fusión.
- Sesgos conocidos, riesgo de alucinación y limitaciones idiomáticas: no disponibles en la información proporcionada; deben consultarse en la model card del modelo base.
- Longitud de contexto no documentada en esta ficha; verificar en la model card de LiquidAI antes de usos con contextos largos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/naklitechie/LFM2.5-24B-A2B-pi-merged-GGUF
- Modelo base (LiquidAI): https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Adaptador Pi (harness-hub): https://huggingface.co/harness-hub/LFM2.5-24B-A2B-pi-GGUF
- diskformer.js: https://github.com/NakliTechie/diskformer.js
- anyformer.js: https://github.com/NakliTechie/anyformer.js
- Compilación de llama.cpp usada (rama `webgpu-diskformer`): https://github.com/NakliTechie/llama.cpp
