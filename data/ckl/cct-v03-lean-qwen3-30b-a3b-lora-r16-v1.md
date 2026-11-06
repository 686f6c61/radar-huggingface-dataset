# CKL/cct-v03-lean-qwen3-30b-a3b-lora-r16-v1

## Resumen

`cct-v03-lean-qwen3-30b-a3b-lora-r16-v1` es un adaptador LoRA desarrollado por CKL sobre el modelo base `Qwen/Qwen3-30B-A3B-Instruct-2507` de Alibaba Qwen. Su funcion no es la generacion de texto general, sino una tarea muy concreta: leer un turno de una transcripcion de codificacion multiagente junto con una vista compacta del grafo de tareas acumulado ("v0.3-lean") y emitir un parche JSON que actualice ese grafo con roles de actor, estados, tareas nuevas o modificadas, decisiones y relaciones, cada uno respaldado por una cita exacta del turno (esquema v0.2).

El adaptador se entrena con LoRA de rango 16 sobre las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del modelo base, un MoE de 30.000 millones de parametros totales con 3.000 millones activos. La receta es deliberadamente ligera: 1.653 filas, 8,35 millones de tokens, una epoca y unos 16 minutos de entrenamiento en Nebius Token Factory, con perdida final de entrenamiento 0,105 y de validacion 0,190.

Su relevancia es doble. Por un lado, demuestra que un ajuste fino pequeno y barato sobre un MoE abierto puede aproximarse a la calidad de etiquetado de un modelo frontera como Claude Haiku 4.5 en una tarea estructurada de extraccion de estado. Por otro, es un caso practico de destilacion de etiquetas generadas por modelos propietarios (Haiku 4.5 y Nemotron 3 Ultra) hacia un adaptador abierto con licencia CC BY 4.0, lo que plantea consideraciones legales que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Qwen3-30B-A3B-Instruct-2507 |
| Parametros totales | 30.000 millones (modelo base); adaptador LoRA r=16 no cuantificado en la ficha |
| Parametros activos | 3.000 millones (modelo base MoE) |
| Longitud de contexto | 8.192 tokens en entrenamiento; 16.384 configurados en el ejemplo de servicio con vLLM |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones habituales (fp8, bf16, GGUF) |
| Idiomas soportados | No disponible (el modelo base Qwen3 es multilingue; el adaptador no declara idiomas) |
| Licencia | CC BY 4.0 para el adaptador; el modelo base Qwen3-30B-A3B-Instruct-2507 es Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-30B-A3B-Instruct-2507, un transformer con mezcla de expertos (MoE) de 30.000 millones de parametros totales y 3.000 millones activos por token. El entrenamiento usa LoRA con rango 16, alpha 32, dropout 0,05 y como objetivos unicamente las proyecciones de atencion `q_proj`, `k_proj`, `v_proj` y `o_proj`; las capas MLP y el router del MoE quedan congelados. Los hiperparametros son learning rate 1e-4, batch 16, contexto 8.192, packing activado y una sola epoca.

Los datos provienen del dataset `CKL/wow-cod-thps4-gamejam`, split `sft/v1-8k-m64`: 1.653 filas y 8,35 millones de tokens derivados de los turnos 1 a 1200. Las etiquetas se generaron con dos modelos profesores, Claude Haiku 4.5 y NVIDIA Nemotron 3 Ultra, ambos guiados por la misma rubrica "v0.3-lean". El entrenamiento se ejecuto en Nebius Token Factory en aproximadamente 16 minutos, con perdida de entrenamiento 0,105 y de validacion 0,190 en el paso 89. La evaluacion se realizo con vLLM sobre una unica GPU H100, ya que Nebius Token Factory no podia servir este ajuste en el momento del entrenamiento. No se emplearon tecnicas de RLHF ni DPO; es un ajuste supervisado puro sobre pares entrada-salida estructurados.

## Capacidades

- Etiquetado de parches de grafo de estado: dado un turno de transcripcion y una vista compacta del grafo, emite un JSON con roles de actor, estados, tareas nuevas o actualizadas, decisiones y relaciones segun el esquema v0.2.
- Extraccion con cita exacta: cada elemento del parche debe ir respaldado por una cita literal del turno de entrada.
- Comprension de transcripciones de codificacion multiagente: interpreta quien hace que, en que estado queda una tarea y como se relacionan las tareas entre si.
- Salida estructurada JSON validable: el 88,5 % de las salidas son validas en el conjunto de evaluacion; el resto se trata como parche vacio.
- Modo sin razonamiento (thinking off): todas las evaluaciones se hicieron con el modo de pensamiento desactivado, lo que reduce latencia y coste.
- No se declaran capacidades de tool calling, function calling, agentes autonomos, vision, audio ni multilingueismo especifico para este adaptador.

## Casos de uso

- Mantenimiento automatico de un tablero de tareas en equipos de agentes: el adaptador consume cada turno de la conversacion y actualiza el grafo de tareas en tiempo real, de modo que el tablero refleja el estado real sin intervencion humana.
- Extraccion de decisiones y dependencias en transcripciones largas: al emitir relaciones y decisiones con cita exacta, permite auditar por que se tomo una decision y que tarea la origino.
- Trazabilidad de sesiones de codificacion asistida: integrado en un pipeline que registra cada turno, genera un historial estructurado y consultable de actores, estados y cambios de tarea.
- Sustitucion de un modelo frontera en tareas de etiquetado: con un coste estimado de unos 0,73 USD por 1.000 turnos frente a unos 14,06 USD de Claude Haiku 4.5 en la misma comparacion de precios de tokens, es adecuado cuando el volumen de turnos es alto y la tolerancia a errores de etiquetado es moderada.
- Generacion de datos de entrenamiento para otros sistemas: los parches producidos pueden servir como etiquetas pseudo-supervisadas para entrenar modelos mas pequenos o para poblar un dataset de evaluacion.
- Orquestacion de agentes con memoria estructurada: el grafo actualizado puede alimentar el contexto de un agente planificador, que consulta tareas pendientes, decisiones previas y relaciones en lugar de releer toda la transcripcion.
- Investigacion sobre destilacion de etiquetas: sirve como punto de partida reproducible para estudiar cuanto conocimiento de un profesor propietario se transfiere a un adaptador LoRA pequeno sobre un MoE abierto.

## Benchmarks y rendimiento

Evaluacion sobre 131 turnos reservados (1203 a 1335, nunca vistos en entrenamiento), forzado de profesor y comparacion contra etiquetas de Claude Haiku 4.5. Un parche invalido cuenta como parche vacio. Todos los brazos usan los mismos prompts y thinking desactivado. Los numeros miden acuerdo con un modelo de referencia, no exactitud factual.

| Metrica | Qwen3-30B-A3B base | LoRA v1 | LoRA v2 | Qwen3-235B fp8 (sin ajuste) | Nemotron 3 Ultra (sin ajuste) |
|---|---|---|---|---|---|
| Salida valida | 77,1 % | 88,5 % | 93,9 % | 93,9 % | 99,2 % |
| F1 de tareas tocadas | 37,7 | 57,2 | 58,7 | 57,8 | 64,6 |
| F1 de tareas tocadas, 98 turnos con tarea de Haiku | 17,7 | 57,1 | 58,0 | 46,6 | 59,9 |
| Acuerdo de estado de tarea | 69,0 % | 70,5 % | 66,4 % | 61,0 % | 67,0 % |
| Coincidencia de rol de actor | 36,6 % | 97,6 % | 97,6 % | 97,6 % | 63,4 % |
| Coincidencia de estado de actor | 36,6 % | 22,0 % | 26,8 % | 39,0 % | 31,7 % |
| Relaciones por turno (Haiku: 0,47) | 0,00 | 0,07 | 0,16 | 0,19 | 0,47 |

Coste estimado por 1.000 turnos: unos 0,73 USD para esta familia de LoRA (precio de tokens de Qwen3-30B-A3B en Token Factory; en la practica se ejecuto en horas de GPU de Modal) frente a unos 14,06 USD de Claude Haiku 4.5 a precio de lista, lo que supone un ahorro aproximado del 91 % con el mismo prompt.

## Requisitos de hardware

- VRAM para inferencia: el modelo base en bf16 requiere aproximadamente 60 GB de pesos mas cache KV; con cuantizacion fp8 baja a unos 30 GB y en formatos de 4 bits a unos 16-18 GB. El adaptador LoRA anade un consumo marginal.
- GPU recomendadas: H100 (configuracion usada en la evaluacion oficial con vLLM) y A100 de 80 GB para bf16; A100 de 40 GB o L40S con fp8; RTX 4090 de 24 GB solo con cuantizacion de 4 bits y contexto reducido.
- Cabe en GPU de consumo: si, con cuantizacion agresiva (4 bits) en RTX 4090 o RTX 3090, a costa de menor contexto efectivo y posible perdida de calidad en la salida estructurada.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 16 --lora-modules cct=<adaptador>` es la via documentada por el autor; llama.cpp y Ollama requeririan fusionar el adaptador en los pesos del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento completo tardo unos 16 minutos en Nebius Token Factory.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 tareas tocadas | Salida valida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (LoRA v1) | 30B totales / 3B activos | 8.192 (entrenamiento) | 57,2 | 88,5 % | CC BY 4.0 | Hugging Face, 14 descargas |
| LoRA v2 (mismo autor) | 30B totales / 3B activos | 8.192 (entrenamiento) | 58,7 | 93,9 % | CC BY 4.0 | Hugging Face |
| Qwen3-30B-A3B-Instruct-2507 base | 30B totales / 3B activos | 262.144 (modelo base) | 37,7 | 77,1 % | Apache 2.0 | Hugging Face |
| Claude Haiku 4.5 (referencia de etiquetas) | No disponible | No disponible | Referencia | No disponible | Propietaria | API de Anthropic |

El adaptador v2 del mismo autor supera a v1 en F1 y en tasa de salida valida, por lo que v1 se conserva principalmente para comparacion. Frente al modelo base sin ajustar, el LoRA mejora el F1 de tareas tocadas en 19,5 puntos y la coincidencia de rol de actor en 61 puntos porcentuales.

## Limitaciones y advertencias

- Tarea muy especifica: el adaptador solo esta entrenado para el esquema de parche de grafo v0.2 con contexto "v0.3-lean"; fuera de ese formato su comportamiento no esta caracterizado.
- Bajo acuerdo de estado de actor: 22,0 % frente al 36,6 % del base, es decir, el ajuste empeora esta metrica concreta. No debe usarse para inferir el estado interno de un actor sin validacion adicional.
- Produccion de relaciones escasa: 0,07 relaciones por turno frente a 0,47 de Haiku, por lo que el grafo resultante queda mas disperso que el de referencia.
- Los benchmarks miden acuerdo con un modelo de referencia (Claude Haiku 4.5), no exactitud factual; un parche puede coincidir con Haiku y ser incorrecto.
- Riesgo de alucinacion en las citas: aunque el esquema exige cita exacta, no hay metrica publicada de fidelidad de las citas.
- Salida invalida en el 11,5 % de los casos, que se trata como parche vacio; en produccion conviene un validador de esquema y reintentos.
- Restriccion legal relevante: el adaptador se entreno en parte con salidas de Claude Haiku 4.5, y los terminos de Anthropic pueden restringir el uso de salidas de Claude para desarrollar modelos. Hay que revisar las condiciones aplicables antes de usar o redistribuir el adaptador.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero no exime de las condiciones del modelo base (Apache 2.0) ni de las de Anthropic sobre los datos de entrenamiento.
- Sin datos de sesgos, idiomas soportados ni evaluacion multilingue; el dataset de entrenamiento es un unico game jam, lo que limita la generalizacion a otros dominios.
- Repositorio de 0,0 GB y solo 14 descargas: ecosistema de validacion muy reducido, sin garantias de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CKL/cct-v03-lean-qwen3-30b-a3b-lora-r16-v1
- Adaptador v2: https://huggingface.co/CKL/cct-v03-lean-qwen3-30b-a3b-lora-r16-v2
- Dataset: https://huggingface.co/datasets/CKL/wow-cod-thps4-gamejam
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Video explicativo: https://youtu.be/mSBVHdznFGI
- Codigo: https://github.com/C-K-Loan/swarm-dashboard
- Demo interactiva: https://ckl.sh/demos/swarm-board
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
