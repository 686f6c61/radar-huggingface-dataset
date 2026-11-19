# nace-ai/Qwen3.8-27B-MLX-4bit

## Resumen

Qwen3.8-27B-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo Qwen3.8-27B, publicada por nace-ai para su motor de inferencia local Kapitsa, orientado a Macs con Apple Silicon. El modelo base lo desarrolla el equipo Qwen (Alibaba) y esta pensado para tareas multimodales de imagen-texto a texto y conversacion, segun el pipeline declarado en el repositorio. La relevancia de esta variante concreta no esta en el modelo en si, sino en el empaquetado: permite ejecutar un modelo de 27.356 millones de parametros en un MacBook Pro con 48 GB de memoria unificada.

La cuantizacion reduce el peso de descarga a 16,3 GB dentro de un repositorio de 32,4 GB (que incluye otras variantes y activos) y el pico de memoria medido por el autor es de 20,8 GiB en un M5 Max de 128 GB. El autor reporta 144 tok/s de escritura y 1.126 tok/s de lectura de un prompt de unos 4K tokens en ese equipo, y 76,6 tok/s de escritura en un M5 Pro de 48 GB.

La licencia es Apache 2.0, heredada del modelo base, lo que facilita su uso comercial. La ficha se centra en lo que el autor documenta: rendimiento en Apple Silicon, comparativa con otros motores (Ollama, mlx-vlm, llama.cpp) y una comprobacion de calidad en GSM8K. No hay informacion publicada en la model card sobre arquitectura interna, contexto, idiomas o datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; tag `qwen3_5` en Hugging Face) |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (variante `mlx-4bit-mtp`); el autor publica tambien 3-bit y 8-bit MLX, GGUF Q2_K, Q3_K_M, Q4_K_M, Q8_0 y NVFP4 4-bit en repos separados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (libreria `mlx`); variantes GGUF y NVFP4 en otros repos |
| Tamano del repo | 32,4 GB (descarga de la variante 4-bit: 16,3 GB) |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B |
| Fecha de publicacion | 10 de noviembre de 2026 |
| Descargas | 30.088 |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre la arquitectura del modelo base (tipo de transformer, atencion, posibles componentes MoE o hibridos), ni sobre el volumen o composicion de los datos de entrenamiento, ni sobre si hubo RLHF, DPO u otras fases de alineamiento. El unico indicio estructural es el tag `qwen3_5` y el sufijo `mtp` en el nombre de la variante, que sugiere la presencia de una cabeza de prediccion multi-token (multi-token prediction) usada para decodificacion especulativa; el autor menciona explicitamente "MTP head" en la tabla comparativa de motores y en la descripcion de la variante.

La innovacion documentada por el autor es el empaquetado para Apple Silicon: cuantizacion 4-bit en MLX combinada con la cabeza MTP y con KFlash (activado por defecto en Kapitsa), un mecanismo del motor que acelera la lectura de prompts largos. El autor reporta que la variante 4-bit mantiene la calidad del bf16 en GSM8K (0,940 con n=100 en ambos casos). No se detalla el proceso de cuantizacion (calibracion, grupos, etc.) ni el metodo de entrenamiento de la cabeza MTP.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline `conversational` declarado.
- Entrada de imagen y texto (pipeline `image-text-to-text`), es decir, capacidad multimodal de entrada.
- Razonamiento matematico: el autor valida GSM8K con 0,940 de acierto en 100 preguntas.
- Generacion de codigo: la medicion de velocidad se hace sobre una respuesta de codigo de 512 tokens, y el autor ofrece un modo `kapitsa opencode` para arrancar el agente de codificacion opencode sobre el modelo.
- Decodificacion especulativa mediante cabeza MTP, que acelera la generacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el flujo con opencode sugiere uso como modelo de agente.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia de codificacion en local: arrancar el agente opencode sobre el modelo con `kapitsa opencode --model nace-ai/Qwen3.8-27B-MLX-4bit` permite tener un asistente de codigo que escribe a 144 tok/s en un M5 Max, sin enviar codigo a la nube.
- Prototipado de aplicaciones multimodales en Mac: al aceptar imagen y texto, se puede construir un pipeline de descripcion de imagenes o extraccion de informacion de capturas y documentos escaneados ejecutandolo integramente en un MacBook Pro de 48 GB.
- Sustitucion de APIs en fases de desarrollo: con 30.088 descargas y un servidor local en `http://127.0.0.1:8000`, es adecuado para desarrollo y pruebas de integraciones sin coste por token.
- Analisis de documentos largos: la lectura de un prompt de 4K tokens a 1.126 tok/s en M5 Max reduce el tiempo de prefill en tareas de resumen o extraccion sobre textos extensos.
- Evaluacion de modelos con requisitos de privacidad: al ejecutarse en local con pesos Apache 2.0, encaja en entornos donde los datos no pueden salir del dispositivo.
- Razonamiento matematico y verificacion: con 0,940 en GSM8K, sirve para tareas de resolucion de problemas aritmeticos y comprobacion de calculos en flujos internos.
- Despliegue en portatiles de gama alta: la variante 4-bit cabe en 48 GB de memoria unificada con un pico de 20,8 GiB, lo que permite trabajar con el modelo abierto junto al resto de aplicaciones.

## Benchmarks y rendimiento

Calidad:

| Test | Esta variante (4-bit) | Referencia bf16 | Veredicto |
|---|---:|---:|---|
| GSM8K (100 preguntas) | 0,940 | 0,940 | iguala |

Velocidad por hardware (motor Kapitsa):

| Mac | Chip | Memoria | Escritura (tok/s) | Lectura prompt 4K (tok/s) | Pico de memoria (GiB) |
|---|---|---:|---:|---:|---:|
| MacBook Pro | M5 Max | 128 GB | 144 | 1.126 | 20,8 |
| MacBook Pro | M5 Pro | 48 GB | 76,6 | 749 | 16,6 |

Comparativa de motores (M5 Max, mismo modelo 4-bit):

| Motor | Version | Configuracion | Escritura (tok/s) | Ventaja de Kapitsa |
|---|---|---|---:|---:|
| Kapitsa | `87d7dd5` | MLX 4-bit, cabeza MTP, KFlash | 144 | referencia |
| Ollama | 0.40.11 | MLX runner, 4-bit, MTP | 71,4 | 2,0x |
| mlx-vlm | 0.7.10 | MLX 4-bit, MTP | 56,3 | 2,6x |
| llama.cpp | b11871 | GGUF Q4_K_M, MTP, n-max 3 | 47,6 | 3,0x |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni otros benchmarks estandar, ni comparaciones con modelos de tamano similar.

## Requisitos de hardware

- Memoria: 20,8 GiB de pico en M5 Max con 128 GB; 16,6 GiB en M5 Pro con 48 GB. El autor indica que el Mac mas pequeno medido es un M5 Pro de 48 GB.
- Descarga: 16,3 GB para la variante `mlx-4bit-mtp`.
- GPU: exclusivamente Apple Silicon (M5 Pro y M5 Max medidos). No hay datos para NVIDIA u otras GPU en esta variante MLX; el autor publica una variante NVFP4 de 20,6 GB en otro repositorio para ese ecosistema.
- Cabe en GPU de consumo: si, en Macs con memoria unificada de 48 GB o superior. No hay datos para Macs de 16 o 24 GB.
- Despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa`), que expone chat y API en `http://127.0.0.1:8000`. Tambien funciona con Ollama (runner MLX), mlx-vlm y llama.cpp (con la variante GGUF), segun las mediciones del autor.
- Latencia y throughput: 144 tok/s de escritura y 1.126 tok/s de lectura de prompt de 4K en M5 Max; 76,6 y 749 tok/s respectivamente en M5 Pro. El propio autor advierte que la velocidad de redaccion depende del texto del prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| nace-ai/Qwen3.8-27B-MLX-4bit | 27,36 B | no disponible | MLX 4-bit | Apache 2.0 | 144 tok/s en M5 Max |
| nace-ai/Qwen3.8-27B-MLX-3bit | 27,36 B | no disponible | MLX 3-bit | Apache 2.0 | 12,9 GB, menor huella |
| nace-ai/Qwen3.8-27B-MLX-8bit | 27,36 B | no disponible | MLX 8-bit | Apache 2.0 | 29,8 GB, mayor fidelidad |
| nace-ai/Qwen3.8-27B-GGUF (Q4_K_M) | 27,36 B | no disponible | GGUF 4,85-bit | Apache 2.0 | 16,8 GB, compatible con llama.cpp y Ollama |
| nace-ai/Qwen3.8-27B-NVFP4 | 27,36 B | no disponible | NVFP4 4-bit | Apache 2.0 | 20,6 GB, orientado a NVIDIA |

No hay en la informacion proporcionada datos de rendimiento ni comparativas directas con modelos de otros fabricantes de tamano similar.

## Limitaciones y advertencias

- Solo Apple Silicon: la variante MLX no es ejecutable en GPU NVIDIA ni en CPU x86 convencional; para esos entornos hay que usar las variantes GGUF o NVFP4 del mismo autor.
- Dependencia del motor: las cifras de velocidad mas altas (144 tok/s) corresponden a Kapitsa con KFlash y cabeza MTP; con Ollama, mlx-vlm o llama.cpp el rendimiento baja a entre 47,6 y 71,4 tok/s.
- Memoria: con 20,8 GiB de pico, un Mac de 32 GB puede quedarse justo si se ejecutan otras aplicaciones; el autor solo garantiza la ejecucion medida en 48 GB.
- Cuantizacion: aunque GSM8K se mantiene igual que bf16, no hay datos de degradacion en otras tareas (codigo, vision, contextos largos) con 4 bits.
- Idiomas, contexto y sesgos: no hay informacion publicada en la model card; no se puede evaluar el comportamiento multilingue ni el riesgo de alucinacion a partir de los datos disponibles.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base Qwen/Qwen3.8-27B por si el autor original anade restricciones adicionales.
- Datos de rendimiento autopublicados: las mediciones las realiza el propio autor del repositorio, con prompts y builds concretos; no son resultados de terceros independientes.
- Fecha de publicacion en 2026: los datos deben considerarse vigentes en la fecha indicada por el autor (10-13 de noviembre de 2026).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante 3-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-3bit
- Variante 8-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-8bit
- Variantes GGUF: https://huggingface.co/nace-ai/Qwen3.8-27B-GGUF
- Variante NVFP4: https://huggingface.co/nace-ai/Qwen3.8-27B-NVFP4
- Motor Kapitsa (GitHub): https://github.com/nace-ai/kapitsa
- Sitio del autor: https://www.nace.ai/
- Grafico de velocidad (claro): https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-4bit/resolve/main/assets/speed-light.svg
- Grafico de velocidad (oscuro): https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-4bit/resolve/main/assets/speed-dark.svg
