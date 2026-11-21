# saeidrajabi/VeriLadder-Qwen-7B

## Resumen

VeriLadder-Qwen-7B es un ajuste fino de Qwen/Qwen2.5-7B-Instruct orientado a la generación de código Verilog (RTL) a partir de especificaciones en lenguaje natural. Lo desarrolla el usuario saeidrajabi y se distribuye bajo licencia Apache 2.0, con pesos fusionados en bf16 y el adaptador LoRA por separado. Su proposito es cubrir la brecha entre la descripcion funcional de un circuito y su implementacion sintetizable, una tarea donde los modelos generalistas rinden de forma limitada.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only denso, 7.615.616.512 parametros) y se entrena mediante SFT con LoRA sobre el dataset VeriLadder, cuyas especificaciones han sido verificadas con comprobaciones formales de equivalencia para determinar el circuito correcto. Esta verificacion formal del dato de entrenamiento es el principal diferenciador frente a otros ajustes de codigo generico.

Es relevante para equipos de diseno de hardware y verificacion que quieran automatizar la generacion de modulos RTL, ya que mejora de forma sustancial al modelo base en los benchmarks de la familia VerilogEval y RTLLM segun los resultados publicados por el autor. El modelo esta pensado para uso en ingles y no declara capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-7B-Instruct, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el adaptador LoRA es compatible con cuantizacion del modelo base, no documentada) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado en bf16 y adaptador LoRA en subcarpeta `lora/`) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos ni mecanismos de atencion lineal. Sobre esa base se aplica un ajuste supervisado (SFT) con LoRA de rango 16, alpha 32, aplicado a todas las proyecciones de atencion y MLP, durante tres epocas sobre el dataset VeriLadder. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

El dato de entrenamiento es la parte tecnicamente mas interesante: cada especificacion del dataset VeriLadder ha sido validada mediante una comprobacion formal de equivalencia que determina el circuito de referencia, lo que reduce el ruido de pares especificacion-codigo incorrectos tipico de los corpus extraidos de repositorios. No se especifican el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de su procedencia.

## Capacidades

- Generacion de codigo Verilog RTL sintetizable a partir de especificaciones en lenguaje natural.
- Razonamiento sobre diseno digital: contadores, maquinas de estados, resets sincronos y asincronos, entre otros.
- Conversacion multi-turno heredada de Qwen2.5-7B-Instruct, con plantilla de chat compatible con `apply_chat_template`.
- Seguimiento de instrucciones de sistema, como restringir la salida a sintaxis Verilog correcta.
- Generacion de codigo extensa: la model card emplea `max_new_tokens=3072` con temperatura 0.2 y top_p 0.95.
- Soporte de tool calling y function calling: no documentado en la model card (el base lo soporta, pero no se confirma tras el ajuste).
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para esta variante.
- Capacidades multilingues: limitadas al ingles segun la metadata del modelo.
- Vision, audio y modo thinking explicito: no disponibles.

## Casos de uso

- Generacion de modulos RTL en flujos de diseno: el modelo recibe una especificacion funcional (por ejemplo, un contador de 4 bits con reset sincrono activo en alto) y devuelve el codigo Verilog correspondiente, reduciendo el tiempo de escritura de boilerplate en bloques estandar.
- Prototipado rapido de bloques digitales: util para explorar variantes de un diseno antes de comprometer recursos de sintesis, gracias a la mejora medida en VerilogEval v2 (44,5 % pass@1 frente al 25,5 % del base).
- Asistencia en verificacion: generar implementaciones de referencia a partir de especificaciones formales para comparar contra el diseno del ingeniero o alimentar testbenches.
- Integracion en pipelines de CI de hardware: el modelo fusionado en bf16 se puede servir con vLLM o transformers y conectarse a un paso de lint y sintesis que valide automaticamente la salida generada.
- Educacion en diseno digital: generar ejemplos de circuitos a partir de descripciones docentes, con la precaucion de revisar siempre la correccion funcional.
- Ajuste posterior con datos propios: el adaptador LoRA publicado permite reentrenar o combinar con otros adaptadores sobre Qwen2.5-7B-Instruct sin partir de cero.
- Extraccion de RTL desde documentacion existente: convertir descripciones de hojas de especificaciones en esbozos de codigo para revision humana.

## Benchmarks y rendimiento

Resultados publicados por el autor (pass@1 / pass@5 en %, cinco muestras por problema, evaluacion funcional):

| Modelo | VerilogEval v2 | RTLLM v2 | VeriLadder-Bench |
|---|---|---|---|
| Qwen2.5-7B-Instruct | 25,5 / 38,7 | 26,2 / 43,6 | 55,4 / 75,4 |
| VeriLadder-Qwen-7B | 44,5 / 59,0 | 36,4 / 48,0 | 79,5 / 90,0 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para esta variante.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 15,2 GB solo para pesos, mas cache KV y activaciones; en la practica se recomienda 24 GB o mas para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque estas cuantizaciones no estan documentadas por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 y GPUs de 16 GB viables con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 y en GPUs de 12-16 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers (soporte oficial en la model card), vLLM (mencionado por el autor), TGI (tag `text-generation-inference`), llama.cpp/Ollama mediante conversion a GGUF no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VerilogEval v2 (pass@1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VeriLadder-Qwen-7B | 7,6 B | no disponible | 44,5 | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7,6 B | no disponible en esta ficha | 25,5 | Apache 2.0 | Hugging Face |
| Alternativas especializadas en Verilog de 7B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables en la informacion proporcionada es contra su modelo base, sobre el que mejora 19 puntos de pass@1 en VerilogEval v2 y 9,1 puntos en RTLLM v2. No se dispone de datos de otros ajustes especializados en Verilog para establecer una comparativa adicional fiable.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste LoRA puede degradar capacidades generales del base fuera del dominio Verilog; no se han publicado evaluaciones de regresion en tareas generales.
- Riesgo de alucinacion: puede generar Verilog sintacticamente plausible pero funcionalmente incorrecto; la evaluacion pass@1 del 44,5 % implica que mas de la mitad de las generaciones unicas fallan en VerilogEval v2.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta evaluado y previsiblemente sera inferior.
- Longitud de contexto: no confirmada en la model card; conviene verificar el limite efectivo antes de usarlo con especificaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5-7B-Instruct, tambien Apache 2.0.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion ni auditoria externa de los resultados.
- Validacion en produccion: dado que los benchmarks son autodeclarados, se recomienda validar la salida con lint, sintesis y simulacion antes de integrarla en cualquier flujo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saeidrajabi/VeriLadder-Qwen-7B
- Dataset VeriLadder: https://huggingface.co/datasets/saeidrajabi/VeriLadder
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
