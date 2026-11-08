# OpceanAI/qwenti-inference

## Resumen

Qwenti inference es un checkpoint experimental publicado por OpceanAI, una organización de investigación independiente fundada en 2026 por el investigador mexicano awa_omg. Se trata de `Qwen/Qwen3.5-4B` con una máquina virtual RV32 (RISC-V de 32 bits) compilada a nivel de token dentro de su pila de transformers, y con el modelo TinyLLama-v0 compilado dentro de la memoria de pesos de esa máquina. El resultado son 36 capas de "circuito" que se anteponen a las 32 capas originales de Qwen, sin que ninguno de sus pesos haya sido entrenado: un compilador calcula todos ellos.

El interés técnico es doble. Por un lado, demuestra que es posible incrustar una máquina de cómputo completa en los pesos de un transformer manteniendo la distribución de texto del modelo base prácticamente intacta (KL de 6,6e-4 y 100% de acuerdo top-1 en 8 de 8 textos). Por otro, explora una vía poco habitual de cuantización "in-weights": los pesos int4 del programa invitado se compilan directamente en celdas de memoria del circuito en lugar de aplicarse como un esquema de cuantización convencional.

El checkpoint no está pensado como modelo de chat de producción. La ruta de texto funciona como cualquier Qwen3.5, pero la ruta de ejecución de la máquina (el "readout" del chip) está desactivada en esta versión por problemas de estabilidad numérica documentados por el autor, y requiere el paquete `chipformer` con inyección de estado para poder usarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con 36 capas de circuito RV32 compiladas antepuestas a las 32 capas del modelo base; 68 capas totales |
| Parámetros totales | 14.491.020.736 (según safetensors); 4.621.392 dentro de la máquina, más Qwen3.5-4B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 en pesos del circuito (WROM: 5.229.568 celdas de 4 bits, 2,49 MB); checkpoint en bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); checkpoint de 27,4 GB en bf16, repo de 49,7 GB |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5-4B (hidden size 4.096, 32 capas) y le antepone 36 capas de circuito que implementan un núcleo RV32 a nivel de token: cada instrucción de la máquina es un token del vocabulario del modelo, y la traza de ejecución de un programa es el propio flujo de tokens del modelo. El circuito ocupa 457 cabezas, 3.259 dimensiones y 1.457 slots. La memoria de la máquina se compila en los pesos con cuatro regiones: RAM de 64 KB (datos, bss, heap, pila), DROM de 128 KB (datos de solo lectura), ROM de 256 KB (código predecodificado) y WROM de 5.229.568 celdas de 4 bits (2,49 MB de pesos int4).

Tres instrucciones personalizadas sostienen el cómputo: `WB rs1` (familia 2^15, calcula la base de pesos `D = (x[rs1] - w - 1) mod 2^15`), `WBB rs1` (banco de memoria de pesos de 5 bits) y `LWROM rd, rs1` (microoperación que carga las 8 celdas int4 de una palabra de peso en `rd`). La dirección efectiva es `WP = (bank << 15) | ((D + PC word index) mod 2^15)`, y el módulo es crítico para evitar que el acarreo salte de banco.

No hay entrenamiento implicado: todos los pesos del circuito los calcula un compilador. El programa invitado es TinyLLama-v0, donde cada token del invitado cuesta 1.821.283 instrucciones de máquina y 2.619.430 tokens de traza; el programa verificado tiene 40 tokens de longitud. El tiempo de merge reportado es de 102-130 segundos. Como innovación destacable, el autor documenta que la cuantización int4 "in-weights" produce una divergencia de 3 de 40 tokens frente al modelo float sin cuantizar, y que ni la difusión de error, ni un pase GPTQ con Hessiana identidad, ni la decuantización de grupos individuales recuperan esa divergencia, lo que atribuye a la cuantización y no a un defecto del circuito.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen3.5-4B, con distribución de salida casi idéntica al base (KL 6,6e-4).
- Ejecución de un programa RV32 a nivel de token mediante el circuito compilado, con estado de máquina (ROM, RAM, registros, PC y memoria de pesos) inyectable en la caché a través del paquete `chipformer` (`core.snapshot` y `RvChat`).
- Memoria de pesos int4 compilada en el circuito con aritmética exacta verificada: 0 discrepancias frente a la máquina de referencia en 5 checkpoints del programa real.
- Coincidencia de tokens greedy con un modelo float de los mismos pesos int4 en 40 de 40 casos, y 37 de 40 frente al modelo float sin cuantizar.
- Capacidades de tool calling y agentes: no disponibles en la información proporcionada (el campo `tool_call` aparece en `chipformer.json`, pero no se detalla su funcionamiento).
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en interpretabilidad y cómputo en pesos: el checkpoint permite estudiar cómo un transformer puede alojar una máquina virtual completa sin degradar su distribución de texto, usando la métrica KL y el acuerdo top-1 como instrumentos de validación.
- Verificación de compiladores de circuitos: la ruta `chipformer` con `core.snapshot` y `RvChat` permite ejecutar el programa invitado y comparar la traza de tokens con la máquina de referencia (0 discrepancias en 5 checkpoints), útil para validar nuevas versiones del compilador.
- Estudio de cuantización in-weights: los datos de divergencia (37/40 frente al float, KL 0,0625 en 300 posiciones) sirven como banco de pruebas para comparar esquemas de cuantización int4 frente a GPTQ o difusión de error.
- Generación de texto en inglés con un Qwen3.5-4B modificado: la ruta de texto funciona como cualquier checkpoint Qwen3.5, por lo que puede usarse para evaluar el coste real de las 36 capas extra en latencia y VRAM (23,1 tok/s y 34,9 GB de VRAM pico en una Colab G4).
- Docencia y divulgación sobre arquitecturas híbridas: el diseño de 68 capas (36 de circuito más 32 de Qwen) y las tres instrucciones personalizadas constituyen un caso de estudio concreto de modificación estructural de un transformer.
- Reproducción de experimentos en hardware de consumo: el autor declara que la organización opera sin presupuesto de cloud, y el checkpoint se ha recargado y verificado en una Colab G4, lo que facilita la replicación por parte de investigadores con recursos limitados.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| KL(base ‖ este modelo), 8 textos, 135 posiciones | 6,6e-4 |
| Acuerdo top-1 frente al base | 100% en 8 de 8 textos |
| Primer token greedy frente al base | 6 de 6 prompts |
| KL por texto | 5,28e-4, 7,82e-4, 6,57e-4, 6,16e-4, 7,01e-4, 6,21e-4, 4,9e-4, 5,4e-4 |
| Circuito frente a máquina de referencia, 5 checkpoints | 0 discrepancias |
| Tokens greedy coincidentes con float de mismos pesos int4 | 40 / 40 |
| Tokens greedy coincidentes con float sin cuantizar | 37 / 40 |
| Top-1 teacher-forced, 300 posiciones | 87,7% |
| KL(float ‖ modelo), 300 posiciones | 0,0625 |
| Pesos publicados recargados desde el repo | 6/6 primeros tokens iguales al base, KL 6,5e-4 |
| Tiempo de merge | 102-130 s |
| VRAM pico en carga | 34,7 GB |
| Decodificación en una Colab G4 | 23,1-23,9 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: 34,7-34,9 GB de VRAM pico en carga, medido en una Colab G4.
- GPU recomendadas: A100 40 GB o superior, H100, L40S 48 GB; una RTX 4090 de 24 GB no es suficiente para el checkpoint completo en bf16.
- Cabe en GPU de consumo: no en bf16; no se documentan cuantizaciones GGUF ni versiones de menor precisión en la información disponible.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="cuda"`; para la ruta de la máquina se requiere el paquete `chipformer`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 23,1 tok/s en decodificación y 23,9 tok/s en una Colab G4; la ruta del chip cuesta 2.619.430 posiciones de chip por token de TinyLLama, por lo que el autor la describe como ruta de verificación y no de chat.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpceanAI/qwenti-inference | 14,49 B totales (4,62 M en la máquina + Qwen3.5-4B) | No disponible | Qwen3.5-4B con circuito RV32 compilado en pesos | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4 B | No disponible | Transformer denso estándar | Apache 2.0 | Hugging Face |
| OpceanAI/Qwen3.5-0.8B-abliterated-Qwenti | No disponible | No disponible | Variante de 0,8B con overlay documentado para reactivar el readout del chip | No disponible | Hugging Face |

La comparación directa con modelos convencionales del mismo tamaño no es significativa: qwenti-inference no compite en benchmarks de razonamiento o código, sino que es una demostración de compilación de cómputo en pesos. Frente a Qwen3.5-4B, la diferencia medible es una KL de 6,6e-4 y un coste de 36 capas adicionales en VRAM y latencia.

## Limitaciones y advertencias

- El readout del chip está desactivado en este checkpoint: la normalización final anula todas las dimensiones del chip, incluidos el código de salida y tau, por lo que la máquina no puede emitir sus propios tokens. Reactivarlo requiere el overlay que documenta el checkpoint de 0,8B, que el merge `rv1` aún no implementa.
- En una versión anterior con las dimensiones del chip activas y ganancias de 2^20 y 2^60, un residuo de 1e-2 se convertía en un logit de 1e4 y el modelo emitía un token del chip en lugar de texto; es un riesgo numérico documentado por el autor.
- La generación coincide literalmente con el base en 5 de 6 prompts; en el sexto diverge tras el primer token (`landed on the Moon.` frente a `landed on the moon.`).
- La divergencia de 3 de 40 tokens frente al modelo float sin cuantizar se atribuye a la cuantización int4, no al circuito, y no se recupera con difusión de error, GPTQ con Hessiana identidad ni decuantización de grupos.
- Solo se declara inglés como idioma soportado.
- No se dispone de datos de sesgos, alucinación o evaluación de seguridad en la información proporcionada; al ser un fine-tune de Qwen3.5-4B, hereda los del base, pero no se documentan.
- La licencia Apache 2.0 permite uso comercial, pero el checkpoint no está orientado a producción: la ruta de chat funciona, la ruta de la máquina es de verificación y consume 2.619.430 posiciones de chip por token del invitado.
- El repositorio tiene 49,7 GB y requiere al menos 34,7 GB de VRAM en bf16, lo que excluye GPU de consumo de 24 GB.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta, sin financiación institucional ni equipo según el autor; la madurez y el soporte a largo plazo son inciertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpceanAI/qwenti-inference
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint de 0,8B con overlay documentado: https://huggingface.co/OpceanAI/Qwen3.5-0.8B-abliterated-Qwenti
- Organización en GitHub: https://github.com/OpceanAI
