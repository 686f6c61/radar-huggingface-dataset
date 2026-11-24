# LindotAI/Lin-Epsilon-Cyber-1.5

## Resumen
Lin Epsilon Cyber 1.5 es un modelo de lenguaje de 494 millones de parámetros (0,5B) desarrollado por LindotAI, especializado en análisis estático de binarios x86-64 de Linux compilados con rustc. Se trata de un fine-tune de Qwen2.5-Coder-0.5B-Instruct, pasado por el modelo intermedio Lin-1.1 Epsilon, que resuelve dos tareas concretas: descompilar el desensamblado de un binario Rust strippeado de vuelta a código fuente Rust compilable, y describir el comportamiento de funciones individuales mediante etiquetas (file_io, network, process_exec, crypto, etc.). Su relevancia radica en que ofrece capacidades de ingeniería inversa asistida en un tamaño que cabe en CPU de portátil, sin depender de APIs externas.

El modelo está pensado exclusivamente para análisis estático: leer y comprender binarios que el usuario tiene permiso para analizar. La versión 1.5 añade etiquetado de comportamiento y, según el autor, recupera firmas de funciones en crates reales mejor que su modelo Locus Cyber Preview 2, ocho veces más grande. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Con 0 descargas y 0 likes en el momento de la ficha, es un modelo recién publicado (noviembre de 2026) y de nicho, orientado a investigadores en seguridad y desarrolladores que trabajan con análisis de malware o auditoría de binarios Rust.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor recomienda mantener peticiones por debajo de ~12k tokens de ensamblador) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización GGUF no publicada en la información disponible) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Coder-0.5B-Instruct |
| Tamaño del repositorio | 1,0 GB |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-0.5B-Instruct, con atención causal estándar y sin mecanismos MoE ni arquitecturas híbridas SSM. El fine-tune se realizó en dos etapas: primero a través de Lin-1.1 Epsilon (modelo general de Rust de la misma familia) y después con un ajuste específico para descompilación y análisis de comportamiento. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación principal no es arquitectónica sino de especialización: el modelo está entrenado con el formato de prompt exacto que espera (desensamblado Intel syntax con símbolos libc preservados y literales de .rodata como comentarios), lo que condiciona fuertemente su rendimiento. El autor indica que el modelo funciona mejor con la formulación literal de los prompts de entrenamiento y recomienda decodificación greedy o temperatura ≤ 0,2. No se mencionan técnicas como decodificación especulativa o atención lineal.

## Capacidades
- Descompilación de crates Rust completos: a partir del desensamblado de un binario strippeado, genera un `src/lib.rs` completo que debería compilar a código equivalente.
- Recuperación de firmas de funciones: infiere tipos de parámetros y retorno, y exporta funciones como `pub fn f0` a partir de direcciones como `sub_401000`.
- Descripción de comportamiento por función: genera un resumen en una o dos frases y asigna etiquetas de comportamiento (file_io, dir_walk, process_exec, network, crypto, encoding, compression, env_args, threads_sync, time, parsing, unsafe_ffi, pure computation).
- Generación de código Rust aproximado a partir de ensamblador de una sola función.
- Análisis estático de binarios x86-64 Linux compilados con rustc (opt-level=2 en los ejemplos).
- Soporte de conversación multi-turno mediante chat template de Qwen (rol user).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso
- Triaje de malware en Rust: dado un binario sospechoso, el modelo etiqueta funciones con file_io, network, process_exec o crypto, permitiendo priorizar qué funciones inspeccionar manualmente antes de un análisis profundo.
- Auditoría de dependencias compiladas: al analizar un binario de producción sin código fuente, el modelo reconstruye aproximaciones del `lib.rs` que ayudan a verificar qué hace realmente el artefacto distribuido.
- Recuperación de código en proyectos con fuentes perdidas: para crates publicados en crates.io de los que solo queda el binario, el modelo genera Rust que sirve como punto de partida para reconstruir la lógica.
- Formación en ingeniería inversa: al ser un modelo de 0,5B ejecutable en CPU de portátil, sirve como herramienta didáctica para practicar lectura de desensamblado y comparar la salida generada con el fuente original.
- Análisis de supply chain: inspeccionar binarios de terceros antes de integrarlos en un pipeline, identificando funciones con process_exec o network que no deberían existir en una librería pura.
- Investigación en seguridad de compiladores: comparar la salida del modelo con el código original (chrF, coincidencia de firmas) para estudiar qué información sobrevive a la compilación y al stripping.
- Preprocesado para pipelines de análisis: usar las etiquetas de comportamiento como features de entrada para clasificadores o sistemas de alerta en un SOC.

## Benchmarks y rendimiento
Los datos provienen del arnés del propio autor; ninguna tarea ni crate de benchmark se usó en entrenamiento.

Descompilación (porcentaje de tareas que pasan con hasta 2 turnos de reparación usando feedback del compilador):

| Modelo | Low | Mid | Hard |
|---|---|---|---|
| Lin Epsilon Cyber 1.5 (0,5B) | 23,1 | 17,4 | 3,7 |
| Lin-1.1 Locus Cyber Preview 2 (4B, solo API) | 48,3 | 35,1 | 14,0 |
| Gemini 3.8 Flash (Low) | 54,1 | 27,3 | 12,3 |
| Tencent Hy4-flash (220B) | — | 15,4 | — |
| Qwen3.8-27B | — | 8,1 | — |
| Qwen3-Coder-30B-A3B | — | 5,7 | — |
| Qwen3.5-9B | — | 2,7 | — |
| Lin-1.1 Epsilon (0,5B, modelo general de Rust) | 1,9 | 2,0 | 1,2 |

Crates reales (624 funciones de crates publicados en crates.io, O0/O2/Oz, con y sin símbolos):

| Modelo | chrF | Coincidencia exacta de firma |
|---|---|---|
| Lin Epsilon Cyber 1.5 (0,5B) | 27,4 | 9,6 |
| Lin-1.1 Locus Cyber Preview 2 (4B, solo API) | 31,1 | 5,9 |

Descripción de comportamiento (658 funciones):

| Modelo | F1 de etiquetas | F1 de etiquetas de seguridad | Conjunto exacto de etiquetas |
|---|---|---|---|
| Lin Epsilon Cyber 1.5 (0,5B) | 50,9 | 31,6 | 55,3 |

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 (494M parámetros × 2 bytes), alrededor de 0,5 GB en cuantización de 8 bits y ~0,3 GB en 4 bits, más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. También funciona en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (soporte oficial documentado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. llama.cpp, Ollama o vLLM no están documentados en la información disponible, aunque al ser un modelo Qwen2 con safetensors deberían poder convertirse a GGUF.
- Latencia y throughput: no disponibles. El autor solo indica que es lo bastante pequeño para ejecutarse en CPU de portátil y recomienda greedy decoding con máximo 2048 tokens nuevos por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Descompilación (Mid) | chrF | Firma exacta | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Lin Epsilon Cyber 1.5 | 0,5B | no disponible | 17,4 | 27,4 | 9,6 | Apache 2.0 | Pesos abiertos (HF) |
| Lin-1.1 Locus Cyber Preview 2 | 4B | no disponible | 35,1 | 31,1 | 5,9 | no disponible | Solo API |
| Gemini 3.8 Flash (Low) | no disponible | no disponible | 27,3 | no disponible | no disponible | propietaria | API |
| Qwen3-Coder-30B-A3B | 30B (3B activos) | no disponible | 5,7 | no disponible | no disponible | no disponible | no disponible |

El modelo destaca por ofrecer pesos abiertos y ejecución local en un segmento donde la alternativa directa (Locus Cyber Preview 2) es solo API y ocho veces más grande. En coincidencia exacta de firmas supera a Locus Cyber Preview 2 (9,6 frente a 5,9), aunque pierde en chrF y en tasas de descompilación.

## Limitaciones y advertencias
- Solo análisis estático: el modelo está pensado para leer binarios que el usuario tiene permiso para analizar; no debe usarse para obtener entradas ejecutando binarios desconocidos.
- Ámbito restringido a rustc sobre x86-64 Linux; otros compiladores, lenguajes y arquitecturas quedan fuera de alcance.
- Un modelo de 0,5B comete errores: el autor recomienda tratar la salida como punto de partida y verificarla, por ejemplo recompilando y comparando.
- Las etiquetas de comportamiento son pistas para triaje, no un veredicto sobre si un binario es malicioso.
- Solo soporta inglés; el prompt debe formularse en inglés y con la redacción exacta de entrenamiento para obtener el mejor rendimiento.
- Límite práctico de ~12k tokens de ensamblador por petición; los crates grandes deben dividirse por módulos.
- Riesgo de alucinación en la reconstrucción de código: puede generar Rust plausible pero incorrecto, especialmente en funciones complejas u optimizaciones agresivas (Oz).
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte del autor.
- Sin datos de sesgos conocidos ni evaluaciones de seguridad publicadas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/LindotAI/Lin-Epsilon-Cyber-1.5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Modelo intermedio Lin-1.1 Epsilon: https://huggingface.co/LindotAI/Lin-1.1-Epsilon
- Imagen de benchmarks: Lin-Epsilon-Cyber-1.5-benchmarks.png (en el repositorio del modelo)
