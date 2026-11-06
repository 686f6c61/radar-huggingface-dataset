# Ganenalla/atacama-35b-a3b-reap-strata-mlx-public

## Resumen

Atacama 35B A3B REAP Strata es un modelo de generación de código con arquitectura Mixture-of-Experts (MoE), desarrollado por Ganenalla y empaquetado específicamente para ejecución local en Apple Silicon (Macs con chips de la serie M). El modelo parte de una base MoE de 57.000 millones de parámetros que ha sido sometida a un proceso de poda de expertos denominado REAP (collinear expert pruning), reduciendo la masa total a 35.000 millones de parámetros con aproximadamente 3.000 millones activos por paso de inferencia mediante enrutamiento Top-2.

La propuesta diferencial no es solo el tamaño, sino el formato de distribución: los pesos se entregan dentro de un contenedor cifrado autenticado `.strata` (AES-256-GCM / ChaCha20-Poly1305 en streaming) que se descifra y carga directamente en memoria unificada Metal a través de la aplicación propietaria AtacamaODR para macOS. Esto implica que el modelo no se puede cargar con las herramientas habituales de MLX, llama.cpp u Ollama, sino únicamente mediante ese runtime.

El modelo declara 100,07 tok/s de decodificación en Apple M5 Pro y M4 Max, con una huella residente de 15,9 GB que deja unos 8 GB libres en Macs de 24 GB sin recurrir a swap de APFS. Está orientado a asistentes de código locales (Cursor, VS Code con Continue/Cline, Zed, Claude Code) mediante una API compatible con OpenAI expuesta en `http://localhost:8088/v1`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con enrutamiento Top-2; router de precisión 8-bit affine; poda de expertos REAP |
| Parámetros totales | 35.000 millones (35B) |
| Parámetros activos | ~3.000 millones por paso de inferencia (Top-2) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el contenedor `.strata` se distribuye con la cuantización ya aplicada; no se documentan variantes) |
| Idiomas soportados | no disponible (orientado a generación de código; el autor no publica lista de idiomas) |
| Licencia | atacama-community-license (enlace: https://atacamaodr.com/terms) |
| Formato de pesos | Contenedor cifrado autenticado `.strata` (AES-256-GCM / ChaCha20-Poly1305 en streaming); no se distribuyen safetensors ni GGUF |
| Tamaño del repositorio | 15,9 GB |
| Biblioteca / runtime | mlx (requiere la app AtacamaODR para macOS) |
| Plataforma objetivo | Apple Silicon (M-series), memoria unificada Metal |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un MoE con enrutamiento Top-2: de la masa total de 35B parámetros, solo unos 3B se activan por token, lo que explica la alta velocidad de decodificación en hardware de consumo. El modelo original era un MoE de 57B con ~14,1B parámetros activos; la variante REAP aplica una poda de expertos colineales que reduce tanto el total como la masa activa, manteniendo (según el autor) la calidad funcional mientras mejora el throughput en un 148% (de ~40,3 a 100,07 tok/s).

La innovación técnica declarada es la "reinversión de precisión coordinada Strata": los gates del router se almacenan en 8-bit affine en lugar de 4-bit, lo que elimina el jitter de enrutamiento que el autor atribuye a las versiones cuantizadas a 4 bits. No se publican datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se detalla si la poda REAP se acompañó de un proceso de recuperación (distillation o fine-tuning) tras el pruning.

## Capacidades

- Generación de código en múltiples lenguajes: el autor reporta una tasa de aprobación del 99,0% en su "Polyglot AST Compiler Pass Rate", frente al 64,5% del baseline sin podar.
- Razonamiento y generación de texto general (pipeline `text-generation`), aunque el foco declarado es el código.
- Integración con asistentes de código vía API compatible con OpenAI: Cursor, VS Code (Continue, Cline), Zed y Claude Code.
- Ejecución completamente local y on-device, sin consumo de tokens en la nube.
- Enrutamiento Top-2 con gates de 8-bit affine para reducir la varianza en la selección de expertos.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking". No disponible.

## Casos de uso

- Autocompletado y generación de código en el editor: el modelo se conecta a Cursor, VS Code (Continue/Cline) o Zed a través del endpoint local `http://localhost:8088/v1`, ofreciendo ~100 tok/s en un M4 Max o M5 Pro sin enviar código a la nube. Adecuado para equipos con requisitos estrictos de confidencialidad del código.
- Asistente de refactorización multi-archivo: con 3B parámetros activos y un contenedor de 15,9 GB que deja 8 GB libres en Macs de 24 GB, permite mantener sesiones de edición largas sin swap, lo que reduce la latencia en operaciones iterativas sobre repositorios medianos.
- Generación de tests y código boilerplate en pipelines de desarrollo: la tasa de aprobación del 99,0% en el "Polyglot AST Compiler Pass Rate" declarada por el autor sugiere que el código generado compila con alta frecuencia, lo que lo hace apto para generar scaffolding y tests unitarios que luego se validan en CI.
- Sustitución de asistentes en la nube para desarrollo con datos sensibles: al ejecutarse enteramente en memoria unificada local y con pesos en contenedor cifrado, evita la exposición de propiedad intelectual a APIs externas.
- Prototipado rápido en portátiles Apple Silicon: un Mac de 24 GB puede ejecutar el modelo sin thrashing de APFS, lo que permite usar el portátil como entorno de desarrollo asistido sin GPU dedicada.
- Evaluación de modelos MoE podados en investigación: el par baseline 57B / variante REAP 35B permite estudiar el impacto de la poda de expertos colineales y del router de 8 bits sobre throughput y calidad de código en un mismo hardware.

## Benchmarks y rendimiento

| Métrica | Baseline sin podar (MoE 57B) | Atacama 35B A3B REAP Strata |
|---|---|---|
| Throughput de decodificación | ~40,3 tok/s | 100,07 tok/s (+148%) |
| Masa activa de enrutamiento | ~14,1B | ~3,0B |
| Memoria unificada libre en Mac de 24 GB | < 1,0 GB (thrashing de APFS) | ~8,0 GB (sin swap) |
| Polyglot AST Compiler Pass Rate | 64,5% | 99,0% |
| Precisión del router | 4-bit (jitter de enrutamiento) | 8-bit affine (lossless) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MBPP) en la información disponible. Los datos anteriores son métricas internas declaradas por el autor y no verificables de forma independiente.

## Requisitos de hardware

- VRAM / memoria unificada: 15,9 GB de huella residente según el autor. En Macs de 24 GB deja ~8 GB libres; se requiere al menos 24 GB de memoria unificada para ejecución sin swap.
- GPU compatibles: Apple Silicon M-series. El autor cita Apple M5 Pro y M4 Max como referencia de los 100,07 tok/s. No se documenta soporte para GPUs NVIDIA, AMD ni CPU x86.
- GPU de consumo: sí, en el ecosistema Apple Silicon; no aplica a RTX 4090 ni similares porque el runtime es exclusivo de macOS/Metal.
- Opciones de despliegue: únicamente la app AtacamaODR para macOS, que expone una API compatible con OpenAI en `http://localhost:8088/v1/chat/completions` con el identificador de modelo `atacama-35b-a3b-reap-strata`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato cifrado propietario.
- Latencia y throughput: 100,07 tok/s de decodificación en M5 Pro / M4 Max según el autor. No se publican cifras de prefill ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| Atacama 35B A3B REAP Strata | 35B | ~3B | no disponible | atacama-community-license | `.strata` cifrado, solo AtacamaODR (macOS) | 100,07 tok/s en M5 Pro / M4 Max (autor) |
| Qwen2.5-Coder-32B | 32B | 32B (denso) | 128K (según versión) | Apache 2.0 (según versión) | safetensors, GGUF; MLX, llama.cpp, vLLM | Denso, más lento en Apple Silicon pero portable |
| DeepSeek-Coder-V2-Lite | 16B | 2,4B | 128K | DeepSeek License | safetensors, GGUF; múltiples runtimes | MoE comparable en activos, ampliamente soportado |
| CodeLlama-34B | 34B | 34B (denso) | 16K | Llama 2 Community License | safetensors, GGUF; múltiples runtimes | Referencia densa de tamaño similar |

La comparativa con Qwen2.5-Coder-32B, DeepSeek-Coder-V2-Lite y CodeLlama-34B se ofrece a título orientativo por categoría y tamaño; no se dispone de benchmarks cruzados publicados en la información proporcionada. La diferencia clave de Atacama frente a estas alternativas es el empaquetado cifrado y el runtime propietario, que limita la portabilidad pero habilita la ejecución on-device con API local en macOS.

## Limitaciones y advertencias

- Formato propietario: los pesos solo se pueden cargar con la app AtacamaODR; no hay safetensors, GGUF ni integración con MLX estándar, llama.cpp, vLLM u Ollama. Esto ata el modelo a macOS y a un único proveedor de runtime.
- Licencia restrictiva: `atacama-community-license` con términos en https://atacamaodr.com/terms. No se detalla en la información disponible si permite uso comercial, redistribución o modificación; es imprescindible revisar los términos antes de cualquier despliegue en producción.
- Falta de transparencia sobre entrenamiento: no se publican datos de tokens, composición del dataset, ni fases de alineación (RLHF/DPO). Tampoco se detalla el proceso de recuperación tras la poda REAP.
- Benchmarks no verificables: las cifras de throughput, memoria y "Polyglot AST Compiler Pass Rate" son declaraciones del autor sin evaluación independiente ni comparación con suites estándar (HumanEval, MBPP, MMLU).
- Idiomas no documentados: no hay lista oficial de idiomas soportados; el foco declarado es código, por lo que el rendimiento en lenguaje natural multilingüe es incierto.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar casos de uso con repositorios grandes o conversaciones largas.
- Riesgo de alucinación: como todo modelo generativo de código, puede producir APIs inexistentes o imports incorrectos; la validación mediante compilación y tests es obligatoria en producción.
- Sesgos: no se documenta ninguna evaluación de sesgos; al estar orientado a código, los sesgos relevantes serían de estilo, licencias de código fuente en el dataset y cobertura desigual de lenguajes.
- Dependencia de hardware Apple: no hay soporte para GPUs NVIDIA, AMD ni despliegue en servidores x86, lo que limita su uso en infraestructura de datacenter convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ganenalla/atacama-35b-a3b-reap-strata-mlx-public
- Términos de licencia: https://atacamaodr.com/terms
- Descarga de la app AtacamaODR: https://atacamaodr.com/download
