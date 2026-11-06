# abuz8studios/FAIE2

## Resumen

FAIE2 no es un modelo de lenguaje, sino un motor de inferencia CUDA desarrollado desde cero por abuz8studios (ABUZ8 LLC, de Ahmad A Odeh) para ejecutar **Qwen3.8-27B** en formato GGUF con cuantización Q6_K. Está diseñado específicamente para una estación de trabajo con doble RTX 5090 bajo Windows y no depende de llama.cpp ni de PyTorch en su ruta de inferencia: llama.cpp se usa únicamente como "oráculo de corrección" contra el que se validan los resultados.

Su relevancia reside en tres puntos: implementa decodificación especulativa sin pérdida (lossless) con un drafter interno llamado DFlash2, alcanzando velocidades medidas de 296-301 tok/s frente a unos ~53 tok/s en decodificación normal; incluye un servidor propio con API estilo OpenAI y una suite de tool calling; y publica todos sus resultados con archivos de evidencia y una puerta de verificación (oracle gate) que confirma coincidencia bit a bit con llama.cpp en 96/96 posiciones top-1. El proyecto está en desarrollo activo (instantánea fechada el 2026-10-27) y se distribuye bajo licencia MIT.

Existe además una variante denominada Flash-Next (DeltaNet-hybrid MoE, ~173 tok/s) en el repositorio hermano `faie2-flashnext`, y un predecesor para modelos GLM en el repositorio `faie`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor de inferencia CUDA desde cero (no es un modelo; ejecuta Qwen3.8-27B) |
| Parámetros totales | no disponible (corresponde al modelo subyacente Qwen3.8-27B, ~27B según el nombre) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q6_K (GGUF) |
| Idiomas soportados | inglés (interfaz y pruebas; el modelo subyacente define los idiomas de salida) |
| Licencia | MIT |
| Formato de pesos | GGUF Q6_K (los pesos no se incluyen; el motor carga un GGUF local) |

Datos adicionales: compilado con CUDA 13.1 + MSVC para arquitectura sm_120 (RTX 5090), servidor en puerto 8300 por defecto sobre GPU0.

## Arquitectura y entrenamiento

FAIE2 es un motor de inferencia escrito en CUDA (`faie2.cu`), sin ruta de ejecución en PyTorch ni runtime de llama.cpp. Implementa su propio servidor con API estilo OpenAI, un conjunto de herramientas (tool calling) y decodificación especulativa lossless mediante un drafter interno denominado DFlash2. La corrección del motor se valida contra llama.cpp como oráculo: la prueba `gate_oracle.py` compara las posiciones top-1 y obtuvo 96/96 coincidencias sin discrepancias reales.

Al no ser un modelo, no tiene proceso de entrenamiento propio ni datos de preentrenamiento. El modelo que ejecuta, Qwen3.8-27B en cuantización Q6_K, tampoco incluye pesos en el repositorio: hay que proporcionar un archivo GGUF local. La innovación técnica destacable es la decodificación especulativa verificada como lossless bajo drafters perfectos, corruptos, aleatorios y mixtos (con CUDA graphs activados), y la salida token-idéntica a la decodificación greedy de llama.cpp en los primeros 512 tokens. El build usa un esquema de DLL temporal que se intercambia solo si la compilación es correcta, evitando romper una versión funcional.

## Capacidades

- Inferencia de Qwen3.8-27B (GGUF Q6_K) sobre CUDA, sin dependencia de llama.cpp o PyTorch en tiempo de ejecución.
- Decodificación especulativa lossless con drafter DFlash2 integrado en el motor.
- Servidor propio con API estilo OpenAI (puerto 8300 por defecto, GPU0).
- Tool calling: suite de herramientas con 8/8 llamadas coincidiendo con el comportamiento de referencia en las pruebas.
- Pruebas de prefill, invariancia por lotes (batch-invariance), carga y pérdida de calidad incluidas en el repositorio.
- Generaciones largas verificadas de 2.048 tokens en las pruebas de carga.
- No incluye pesos del modelo ni el binario compilado `faie2.dll`: debe compilarse desde el código fuente.

## Casos de uso

- Servidor de inferencia local de alto rendimiento: despliegue de Qwen3.8-27B en una estación con doble RTX 5090 bajo Windows, con API estilo OpenAI lista para integrar en aplicaciones existentes.
- Aceleración de generación de código: la decodificación especulativa alcanza 296,3 tok/s en tareas de código (frente a ~53 tok/s en decodificación plana), útil para asistentes de programación interactivos.
- Generación de salida estructurada: 301,0 tok/s en tareas estructuradas y hasta 359,0 tok/s en el bench específico, adecuado para JSON, extractos y formatos rígidos.
- Traducción y tareas secuenciales: 254,7 tok/s medidos en traducción, apropiado para procesos por lotes de texto.
- Agentes con tool calling: el servidor incluye definiciones de herramientas y pruebas de coincidencia con comportamiento de referencia, lo que permite construir flujos agentivos multi-paso sobre la API.
- Validación y comparación de motores de inferencia: la metodología de oráculo contra llama.cpp y los resultados publicados con evidencia lo hacen útil como referencia para auditar implementaciones CUDA propias.
- Investigación en decodificación especulativa: el código, el diseño (DESIGN.md, incluido el capítulo Flash-Next §9) y las suites de pruebas lossless sirven como base de estudio reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para el modelo subyacente en la información disponible. Sí hay mediciones de rendimiento del motor, realizadas por el autor el 2026-10-26 (archivos de resultados en `tests/`):

| Prueba | Resultado |
|---|---|
| Oracle gate vs llama.cpp | 96/96 posiciones top-1 coinciden, 0 discrepancias reales, PASS |
| Decodificación especulativa end-to-end (código) | 296,3 tok/s (vs ~53 tok/s en decodificación plana) |
| Decodificación especulativa end-to-end (estructurado) | 301,0 tok/s |
| Decodificación especulativa end-to-end (traducción) | 254,7 tok/s |
| Spec bench (estructurado) | hasta 359,0 tok/s; 420,5 tok/s con drafter perfecto |
| Suite lossless | salida especulativa lossless con drafters perfecto, corrupto, aleatorio y mixto |
| Prueba de carga, 2.048 tokens (código) | 187,7 tok/s |
| Prueba de carga, 2.048 tokens (matemáticas) | 306,1 tok/s |
| Prueba de carga, 2.048 tokens (lógica) | 202,1 tok/s |
| Suite de tool calling | 8/8 llamadas coinciden con la referencia |

Todas las cifras provienen de las ejecuciones del autor; existe una nota de verificación independiente en `VERDICT.md`.

## Requisitos de hardware

- GPU: diseñado para una estación de trabajo con doble NVIDIA RTX 5090 (arquitectura sm_120) bajo Windows. El servidor usa GPU0 por defecto.
- VRAM: no disponible como cifra explícita; un GGUF Q6_K de un modelo de ~27B requiere en torno a 22-24 GB de VRAM para los pesos, más el KV cache y el drafter, por lo que una RTX 5090 de 32 GB es el objetivo de diseño.
- Sistema operativo y toolchain: Windows con CUDA 13.1 y MSVC (script `build.ps1` incluido).
- Despliegue: compilación desde fuente a una DLL (`faie2.dll`, no incluida) y servidor propio (`faie2_server.py`, puerto 8300). No es compatible con vLLM, TGI, Ollama ni llama.cpp como runtime (llama.cpp solo actúa como oráculo de validación).
- Rendimiento: 296-301 tok/s con decodificación especulativa en tareas de código y salida estructurada; ~53 tok/s en decodificación plana; hasta 420,5 tok/s con un drafter perfecto según el bench.

## Comparativa con modelos similares

FAIE2 compite con motores de inferencia, no con modelos. Comparativa orientativa:

| Motor | Modelo objetivo | Runtime | Rendimiento publicado | Licencia |
|---|---|---|---|---|
| FAIE2 | Qwen3.8-27B (GGUF Q6_K) | CUDA propio, sin PyTorch/llama.cpp | 296-359 tok/s con decodificación especulativa | MIT |
| llama.cpp | GGUF genéricos (incl. Qwen) | CUDA/Metal/CPU propio | ~53 tok/s en decodificación plana (referencia del propio FAIE2) | MIT |
| faie2-flashnext (variante del mismo autor) | DeltaNet-hybrid MoE | CUDA propio | ~173 tok/s, gates bit-exact | no disponible |
| vLLM | Modelos HF (safetensors) | PyTorch + PagedAttention | no disponible para esta configuración | Apache-2.0 |

Nota: la cifra de llama.cpp (~53 tok/s) corresponde a la decodificación plana medida por el autor de FAIE2 en su hardware; no es un benchmark independiente.

## Limitaciones y advertencias

- No es un modelo: no genera texto por sí mismo y requiere proporcionar localmente un GGUF Q6_K de Qwen3.8-27B, que no se distribuye en el repositorio.
- El binario compilado `faie2.dll` no está incluido: es obligatorio compilar desde fuente con CUDA 13.1 + MSVC en Windows.
- Plataforma muy específica: orientado a RTX 5090 (sm_120) y Windows; no hay evidencia de funcionamiento en otras GPU, sistemas operativos ni configuraciones.
- Estado de trabajo en progreso activo (instantánea del 2026-10-27); partes sin terminar declaradas como tales por el propio autor.
- Todas las mediciones de rendimiento provienen de ejecuciones del autor; existe una nota de verificación independiente (`VERDICT.md`), pero no hay auditoría externa amplia ni comunidad de usuarios (0 descargas registradas en el momento de la ficha).
- Sin datos de calidad del modelo subyacente (benchmarks, alucinaciones, sesgos) en el repositorio: habrá que acudir a la documentación de Qwen3.8-27B.
- El contexto, los idiomas y las capacidades exactas dependen del modelo GGUF cargado, no del motor.
- Licencia MIT sin restricciones de uso comercial, aplicable al código del motor; la licencia de los pesos de Qwen3.8-27B es un asunto aparte que debe verificarse por separado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/abuz8studios/FAIE2
- Variante Flash-Next: https://huggingface.co/abuz8studios/faie2-flashnext (referenciada como repositorio hermano)
- Motor predecesor GLM: https://huggingface.co/abuz8studios/faie (referenciado como repositorio hermano)
- Documentación de diseño: `DESIGN.md` en el repositorio (incluye el capítulo Flash-Next §9)
- Nota de verificación independiente: `VERDICT.md` en el repositorio
