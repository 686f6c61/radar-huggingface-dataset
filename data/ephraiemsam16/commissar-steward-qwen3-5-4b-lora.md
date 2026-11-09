# ephraiemsam16/commissar-steward-qwen3.5-4b-lora

## Resumen

Commissar steward es un adaptador LoRA de investigación construido sobre el modelo Qwen3.5-4B (Alibaba Cloud), desarrollado por Ephraiem Sarabamoun en el marco de Humanity First Research y el Apart Research Swarm Alignment Hackathon (noviembre de 2026). No es un modelo autónomo: es un adaptador PEFT que modifica el comportamiento del modelo base para convertirlo en un "comisario", un agente pequeño y leal a un principal humano dentro de un equipo de agentes de IA.

El problema que aborda es el de la alineación multiagente: cuando varios agentes colaboran, las prioridades del principal humano pueden diluirse. El comisario reescribe los materiales de tarea que otro agente está a punto de leer (una nota de turno y un mensaje del principal) para reforzar las prioridades del principal, y redacta mensajes breves al equipo (briefing de apertura, rechazo de atajos, cuestionamiento de aprobaciones no verificadas, apoyo a un compañero que señala un problema real o silencio). El adaptador se entrenó con 1.000 filas sintéticas y se evaluó con el pensamiento desactivado a temperatura 0.

Es relevante como artefacto de investigación sobre lealtad y alineación en enjambres de agentes, pero el propio autor advierte que en las pruebas del paper no produjo un aumento detectable de la lealtad de los agentes y que altera lo solicitado en aproximadamente un quinto de sus reescrituras. La ficha se basa exclusivamente en la información publicada en la model card; los datos no disponibles se indican como tales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B; se adaptan todas las capas lineales del modelo de lenguaje (q, k, v, o, gate, up, down) |
| Parámetros totales | No disponible (adaptador LoRA; el modelo base es de 4B) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT; requiere el modelo base Qwen/Qwen3.5-4B) |
| Rank / alpha / dropout | 16 / 32 / 0.0 |
| Tamaño del repo | 0,1 GB |
| Modelo base | Qwen/Qwen3.5-4B (revisión 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 y alpha 32 sobre todas las proyecciones lineales del modelo de lenguaje (q, k, v, o, gate, up, down) del transformer Qwen3.5-4B. No toca la torre de visión del modelo base, que la model card describe como image-text-to-text; el adaptador se entrenó y evaluó solo con texto. Los nombres de los tensores siguen el checkpoint multimodal completo (`model.language_model.layers.N...`), por lo que es necesario cargar el base con su clase de imagen-texto para que coincidan.

El entrenamiento fue un ajuste supervisado LoRA en la plataforma Adaption Labs (run `9012cd42`, 9 de noviembre de 2026) sobre 1.000 filas sintéticas generadas con el generador Invent y filtradas por comprobaciones automáticas y un juez: 358 respuestas de steward y 642 reescrituras de tarea (560 únicas, el resto repetidas para ponderar la tarea). Los datos de entrenamiento no se publican. Hiperparámetros: learning rate 1e-4 con schedule coseno (medio ciclo), suelo de 0,1 del pico, warmup del 3 %, 3 épocas (75 pasos de optimizador), batch size 8, gradient clipping 2,0, weight decay 0,0 y sin pérdida sobre los tokens de prompt. La pérdida de entrenamiento bajó de 0,83 a 0,15 y la pérdida de validación de la plataforma de 0,328 (paso 15) a 0,209 (paso 75). Una primera ronda (1.411 filas, una época, learning rate 5e-5) falló: obtuvo 56,2 % en StewardBench frente al 65,6 % del modelo base y copió literalmente 27 de 30 tareas; esta segunda ronda la sustituye.

## Capacidades

- Reescritura de materiales de tarea: transforma una nota de turno y un mensaje del principal para que reflejen las prioridades del principal, con la regla de perseguir el trabajo propio hasta terminarlo o descartarlo con justificación y dar un único intento honesto a los encargos ajenos.
- Generación de mensajes breves al equipo: briefing de apertura, rechazo de un atajo, cuestionamiento de una aprobación no verificada, apoyo a un compañero que plantea un problema real y opción de guardar silencio.
- Salida estructurada en dos encabezados exactos: `SHIFT NOTE:` y `MESSAGE FROM <principal>:`.
- Funcionamiento con pensamiento desactivado (`enable_thinking: False`) a temperatura 0, según la evaluación del autor.
- Integración vía API compatible con OpenAI (por ejemplo, vLLM con LoRA habilitado) o carga directa con PEFT.
- Idiomas: solo inglés.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión, audio ni modo de razonamiento explícito documentados para el adaptador.

## Casos de uso

- Investigación en alineación multiagente: desplegar el comisario junto a un agente principal en un entorno simulado para estudiar si la reescritura de instrucciones refuerza la lealtad al principal, replicando el protocolo del paper con StewardBench.
- Prototipado de "briefing de turno" en equipos de agentes: generar una nota de apertura que fije prioridades antes de que otros agentes lean la tarea, usando la plantilla `rewrite_user_template.txt` con los campos `{PRINCIPAL}`, `{SHIFT_NOTE}` y `{MESSAGE}`.
- Moderación de atajos en flujos de agentes: producir un mensaje breve que decline un atajo propuesto por otro agente, útil para experimentar con políticas de rechazo en pipelines de agentes.
- Auditoría de aprobaciones: generar un mensaje que cuestione una aprobación no verificada antes de que se ejecute una acción, como capa de fricción en sistemas de aprobación automática.
- Soporte a compañeros de equipo: redactar un mensaje de respaldo cuando un agente señala un problema real, para probar dinámicas de coalición en enjambres.
- Docencia y demostraciones sobre lealtad de modelos: servir el adaptador en vLLM con el nombre `commissar` y mostrar en vivo cómo un modelo de 4B reescribe instrucciones según un principal designado.
- Evaluación comparativa de adaptadores: usar el adaptador como línea base frente a otras variantes LoRA en tareas de reescritura con restricciones, midiendo la tasa de alteración de lo solicitado (aproximadamente un quinto en las pruebas del autor).

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| StewardBench (ronda 1, adaptador anterior) | 56,2 % frente al 65,6 % del modelo base |
| Reescrituras idénticas byte a byte (ronda 1) | 27 de 30 |
| Pérdida de entrenamiento | 0,83 → 0,15 |
| Pérdida de validación de la plataforma | 0,328 (paso 15) → 0,209 (paso 75) |

No se han publicado resultados de benchmarks de la ronda 2 (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card indica que, en las pruebas del paper, el adaptador no produjo un aumento detectable de la lealtad de los agentes y que cambia lo solicitado en aproximadamente un quinto de sus reescrituras.

## Requisitos de hardware

- El adaptador pesa 0,1 GB; el requisito real lo marca el modelo base Qwen3.5-4B.
- VRAM estimada para el base en bfloat16: aproximadamente 8-10 GB, más el overhead del adaptador y del contexto; no disponible con precisión en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del base, cabría esperar GPUs consumer de gama alta (por ejemplo, RTX 4090) y GPUs de datacenter (A100, H100), pero el autor no publica cifras.
- Despliegue: servidor compatible con OpenAI con LoRA habilitado (por ejemplo, vLLM) o carga directa con `peft` y `transformers` usando `AutoModelForImageTextToText` con la revisión fijada del base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Commissar steward (este adaptador) | LoRA sobre Qwen3.5-4B (4B) | No disponible | StewardBench 56,2 % en ronda 1 (adaptador anterior); sin datos de ronda 2 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-4B (modelo base) | 4B | No disponible | StewardBench 65,6 % | Apache 2.0 | Hugging Face |
| Otros adaptadores LoRA de alineación multiagente | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos comparables de la misma categoría (comisarios o adaptadores de lealtad multiagente) en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara que no produjo un aumento detectable de la lealtad de los agentes en las pruebas del paper.
- Cambia lo solicitado en aproximadamente un quinto de sus reescrituras, lo que puede introducir desviaciones no deseadas en producción.
- Solo inglés; sin soporte multilingüe documentado.
- Solo texto: no usa la torre de visión del modelo base.
- Requiere instrucciones exactas (prompt v2.2 con `{PRINCIPAL}` sustituido) y pensamiento desactivado a temperatura 0 para reproducir el comportamiento evaluado.
- Los datos de entrenamiento no se publican, lo que limita la reproducibilidad completa.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la información proporcionada; al ser un modelo de 4B, cabe esperar las limitaciones típicas de ese tamaño, pero no se aportan datos.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin validación en producción, su uso comercial no está respaldado por evaluaciones.
- El modelo base se registró en la plataforma de entrenamiento como `togethercomputer/Qwen3.5-4B`, una copia no pública; el `adapter_config.json` apunta a `Qwen/Qwen3.5-4B`, la única modificación respecto a los ficheros originales del adaptador.
- Repo con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ephraiemsam16/commissar-steward-qwen3.5-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: *Weak Commissar, Strong Agent: Can a Small Loyal Model Raise an Agent's Loyalty to Its Principal?* (Ephraiem Sarabamoun, Humanity First Research, Apart Research Swarm Alignment Hackathon, noviembre de 2026); sin URL disponible en la información proporcionada.
- Prompts incluidos en el repo: `prompts/commissar_prompt_v2_2.txt`, `prompts/rewrite_user_template.txt`
- Receta de entrenamiento: `training/` (dentro del repo)
- Metadatos de procedencia: `provenance.json` (dentro del repo)
