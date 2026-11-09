# litert-community/Qwen3-4B

## Resumen

Qwen3-4B es un modelo de lenguaje de 4.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. Esta ficha concreta describe la variante publicada por la comunidad `litert-community`, que no es el checkpoint original de PyTorch sino una conversión al formato LiteRT-LM optimizada para generación de texto en dispositivo (on-device). El repositorio contiene dos artefactos cuantizados: uno con pesos INT8 por canal y KV en float32, y otro con pesos INT4 dinámicos (bloque de 32) y operadores compuestos para GPU.

El modelo resuelve el problema de ejecutar un LLM de 4B en hardware móvil y de escritorio sin depender de la nube, manteniendo el modo de razonamiento (thinking) y el soporte de tool calling del modelo base. La relevancia actual radica en que el artefacto INT4 fue reexportado el 31 de octubre de 2026 con pesos externos y operadores GPU compuestos, alcanzando 526 tok/s de prefill y 19,5 tok/s de decodificación en un Galaxy S26 con OpenCL.

La arquitectura subyacente es un transformer denso de Qwen3 (no MoE) con 4B de parámetros, contexto de 4.096 tokens en ambas conversiones LiteRT-LM y licencia Apache 2.0. Los pesos originales provienen de `Qwen/Qwen3-4B`, y la conversión preserva el tokenizador byte a byte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a LiteRT-LM |
| Parámetros totales | 4 000 millones (modelo base Qwen3-4B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens en ambas variantes LiteRT-LM (caché exportada de 32.768 tokens en el artefacto INT4, contexto por defecto en metadatos de 4.096) |
| Tipos de cuantización | INT8 por canal con KV float32; INT4 dinámico con bloque de 32 y activaciones FP32 |
| Idiomas soportados | inglés (según metadatos del repo); el modelo base Qwen3-4B es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el artefacto INT4 usa pesos externos en sección TFLiteWeights |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B es un transformer denso con atención por cabezas y normalización RMSNorm, entrenado por el equipo Qwen. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card original de `Qwen/Qwen3-4B`, no incluida aquí. El modelo soporta modo thinking con canal de razonamiento separado y plantilla de chat propia de la familia Qwen3.

La conversión a LiteRT-LM introduce innovaciones de despliegue más que de entrenamiento. El artefacto INT4 reexportado el 31 de octubre de 2026 se generó con `export_hf` de LiteRT Torch (commit `0a81bf6f3`) usando `--apply_gpu_composites=True`: RMSNorm, QK-norm, RoPE, atención, SwiGLU y la actualización de caché KV son operadores compuestos para la ruta GPU de LiteRT-LM, y las proyecciones QKV y Gate/Up están fusionadas. Se exportó con longitudes de prefill de 128 y 1024 y una caché de 32.768 tokens. El artefacto INT8 mantiene pesos por canal y caché KV en float32. Ambos requieren LiteRT-LM 0.18.0 o superior; la ruta GPU del INT4 exige 0.19.0 o superior.

## Capacidades

- Generación de texto en inglés con plantilla de chat de Qwen3.
- Modo thinking activado por defecto; el razonamiento se emite por el canal de pensamiento y puede desactivarse con `enable_thinking=false`.
- Tool calling / function calling: las llamadas a herramientas son parseadas por el runtime de LiteRT-LM.
- Razonamiento multi-paso dentro de la ventana de 4.096 tokens.
- Inferencia en dispositivo con backend GPU OpenCL y CPU, además de WebGPU en escritorio.
- Cuantización INT4 e INT8 para reducir huella de memoria (1.609 MB de pico en Galaxy S26 con INT4).

## Casos de uso

- Asistentes offline en móvil: el artefacto INT4 ocupa 2.167,64 MiB y decodifica a 19,5 tok/s en un Galaxy S26, lo que permite un chatbot local sin conexión con latencia interactiva.
- Automatización de tareas en el dispositivo: el soporte de tool calling parseado por el runtime permite invocar funciones locales (calendario, contactos, APIs del sistema) sin enviar datos a la nube.
- Procesamiento de documentos cortos: con 4.096 tokens de contexto se pueden resumir correos, notas o fragmentos de código en el propio terminal.
- Razonamiento asistido con presupuesto controlado: el modo thinking con canal separado sirve para tareas de lógica o matemáticas simples, ajustando el presupuesto para no agotar el contexto.
- Prototipado en escritorio con WebGPU: 1.327 tok/s de prefill y 87,52 tok/s de decode en una Radeon AI PRO R9700 permiten iterar sobre prompts y plantillas antes de desplegar en móvil.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el dispositivo, es apto para datos sanitarios o financieros que no pueden salir del terminal.
- Evaluación de pipelines LiteRT-LM: sirve como banco de pruebas para medir prefill, decode y TTFT en distintos SKUs Android antes de adoptar el runtime en producción.

## Benchmarks y rendimiento

Datos medidos por el autor en hardware propio (no verificados por terceros). Las filas Android usan LiteRT-LM v0.13.1 con GPU OpenCL, 256 tokens de prefill y 64 de decode; la fila de escritorio usa WebGPU con 256 de prefill y 32 de decode.

| Dispositivo / Backend | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Huella privada pico |
|---|---:|---:|---:|---:|
| Desktop GPU WebGPU (Radeon AI PRO R9700) | 1327,33 | 87,52 | 0,20 | 1697 MB |
| Samsung SM-S937U1 GPU OpenCL | 357,57 | 19,14 | 0,77 | 1609 MB |
| vivo V2502A GPU OpenCL | 170,66 | 12,67 | 1,58 | 4722 MB |
| TECNO LJ9 GPU OpenCL | 104,37 | 10,86 | 2,54 | 4906 MB |

Comparativa del artefacto INT4 reexportado frente al anterior (medido el 29 de octubre de 2026 con LiteRT-LM 0.19.0 en Galaxy S26, GPU OpenCL, 1.024 tokens de prefill):

| Artefacto | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| `qwen3_4b_mixed_int4.litertlm` (nuevo) | 526 | 19,5 |
| Artefacto anterior | 369 | 18,9 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: el artefacto INT8 pesa 5,28 GB y el INT4 2.167,64 MiB; la huella privada pico medida va de 1.609 MB (Galaxy S26) a 4.906 MB (TECNO LJ9).
- GPU de escritorio: funciona con WebGPU; se ha medido en AMD Radeon AI PRO R9700. No hay datos de A100, H100 ni RTX 4090 en la información disponible.
- Móvil: validado en Samsung SM-S937U1 (Galaxy S26), vivo V2502A y TECNO LJ9 con backend OpenCL.
- Consumer GPU: el artefacto INT4 (2,1 GB) cabe en GPUs de 4 GB o más; el INT8 (5,28 GB) requiere al menos 6 GB.
- Despliegue: LiteRT-LM 0.18.0+ para CPU y 0.19.0+ para la ruta GPU del INT4; también hay ruta WebGPU en escritorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: TTFT de 0,20 s en escritorio y de 0,77 s en Galaxy S26; throughput de decode de 87,52 tok/s en escritorio y 19,5 tok/s en Galaxy S26.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---:|---|---|---|
| Qwen3-4B (esta ficha, litert-community) | 4B | 4.096 | Apache 2.0 | `.litertlm` (INT4/INT8) | Optimizado on-device, thinking y tool calling |
| Qwen/Qwen3-4B (original) | 4B | no disponible en esta ficha | Apache 2.0 | safetensors (PyTorch) | Checkpoint de referencia; requiere runtime estándar |
| Alternativas de 4B on-device | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables |

## Limitaciones y advertencias

- Contexto limitado a 4.096 tokens en ambas variantes LiteRT-LM; con thinking activado y sin presupuesto, el razonamiento puede consumir el contexto antes de emitir la respuesta (problema documentado en la versión anterior de 2.048 tokens).
- Idiomas: los metadatos declaran solo inglés, aunque el modelo base Qwen3-4B es multilingüe; la conversión no garantiza el mismo comportamiento en otros idiomas.
- La ruta GPU del artefacto INT4 requiere LiteRT-LM 0.19.0 o superior; con 0.18.x falla la compilación de los kernels compuestos en Galaxy S26 y Mac.
- Las builds Android 0.18.0 y 0.18.1 se cuelgan con archivos de pesos externos; hay que usar la revisión `a45912eb` con runtimes antiguos.
- Los benchmarks son mediciones del propio autor en dispositivos retail y dependen de SKU, build del sistema, estado térmico, modo de batería y versión del runtime; no están verificados por terceros.
- Riesgo de alucinación inherente a un modelo de 4B; no se han publicado evaluaciones de sesgo en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución.
- El artefacto INT4 usa pesos externos en sección TFLiteWeights; algunas herramientas pueden no soportarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Paper de Qwen3 (referencia arXiv del repo): https://arxiv.org/abs/2505.09388
- Revisión anterior del artefacto INT4: `a45912eb8a7b33d6cb92aac6a08524b9463faec0`
