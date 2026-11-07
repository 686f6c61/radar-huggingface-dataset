# 0xKitkat/Ripple-65B-Preview-abliterated-GGUF

## Resumen

Ripple-65B-Preview-abliterated-GGUF es una compilación cuantizada en formato GGUF del modelo denso Ripple-65B-Preview de Ricursive Intelligence, un transformer de 64.782.689.360 parámetros (aproximadamente 64,8 mil millones) orientado a código agéntico. La modificación "abliterated" consiste en proyectar fuera una dirección de rechazo de los embeddings de tokens y de 63 de las 80 capas del modelo, sin reentrenamiento ni fine-tuning posterior. El resultado es un modelo que responde a peticiones que el original rechaza, incluidas peticiones peligrosas, y que no ha pasado ninguna revisión de seguridad.

El modelo base se publicó el 4 de noviembre de 2026 bajo licencia Apache-2.0 y esta versión cuantizada apareció dos días después, el 6 de noviembre de 2026. Está pensada para ejecutarse con llama.cpp, que incorporó la arquitectura propietaria `ricursive` mediante el PR #31692 (fusionado el 5 de noviembre de 2026); cualquier build anterior falla al cargar los ficheros. El repositorio ocupa 206,5 GB e incluye cuatro cuantizaciones: Q4_K_M, Q5_K_M, Q6_K y Q8_0.

La relevancia de esta ficha es doble: por un lado, documenta una de las primeras builds GGUF de un modelo de 65B con arquitectura propia y soporte de razonamiento y tool calling; por otro, advierte de que la edición de pesos elimina salvaguardas sin sustituirlas por otras, lo que tiene implicaciones directas para cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con arquitectura propia `ricursive` (80 capas), soportada en llama.cpp desde el PR #31692 |
| Parametros totales | 64.782.689.360 (aproximadamente 64,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens en la configuración medida (8 slots); el autor recomienda 64K como punto de partida |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (Q4_K_M, Q5_K_M y Q6_K usan importance matrix; Q8_0 no) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q6_K y Q8_0 divididos en dos ficheros) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 80 capas con una arquitectura propietaria denominada `ricursive`, definida por Ricursive Intelligence y no derivada de las familias Llama, Qwen o Mistral. Esta versión mantiene las 80 capas íntegras y aplica una edición de pesos de tipo *abliteration*: se calcula una dirección de rechazo y se proyecta fuera de los embeddings de tokens y de 63 capas del modelo. No hay reentrenamiento, fine-tuning ni ajuste posterior; los pesos editados se cuantizan directamente a GGUF.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO) empleadas en el modelo original dentro de la información proporcionada. El autor indica explícitamente que las puntuaciones de benchmark de la model card upstream pertenecen al modelo BF16 sin modificar y no se han vuelto a ejecutar sobre estas cuantizaciones, por lo que no deben interpretarse como resultados de esta release. La model card menciona soporte de modo de razonamiento (reasoning mode) y de tool calling, y recomienda `--reasoning-format deepseek` para separar el razonamiento en su propio campo.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento explícito previo a la respuesta (modo *thinking*), con el razonamiento separado mediante `--reasoning-format deepseek`.
- Tool calling / function calling: la model card reporta un round trip de tool call correcto en las pruebas realizadas.
- Generación de código y tareas de código agéntico, que es el foco declarado del modelo base.
- Modo de razonamiento aplicado a tareas difíciles y de código (32/34 comprobaciones superadas según el autor).
- Plantilla de chat embebida, invocable con `--jinja`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistente de código agéntico en local: el modelo puede ejecutar bucles de razonamiento y llamadas a herramientas sobre un repositorio, con 64K de contexto para mantener varios ficheros y el historial de conversación en la ventana. Adecuado por su foco declarado en código agéntico y su soporte de tool calling.
- Servidor de inferencia privado con llama.cpp: despliegue de `llama-server` con Q4_K_M completamente descargado en GPU (45,3 GiB tras la carga) para equipos con unos 50 GB de VRAM o más, sin dependencia de APIs externas.
- Investigación sobre alineación y edición de pesos: el par original/abliterated permite estudiar el efecto de proyectar fuera una dirección de rechazo, con métricas comparadas de rechazos (48/48 frente a 1/48) y perplejidad (8,392 frente a 8,521 en WikiText).
- Evaluación de robustez de salvaguardas: útil para equipos de seguridad que necesiten medir cómo se comporta un modelo sin capas de rechazo ante prompts dañinos, siempre en entornos controlados y aislados.
- Generación de código en pipelines internos: integración en flujos de CI/CD o herramientas de desarrollo donde se requiera un modelo autoalojado con licencia Apache-2.0 y sin coste por token.
- Prototipado de agentes multi-paso: el modo de razonamiento y el tool calling permiten construir agentes que planifican, invocan funciones y verifican resultados, con la ventana de 64K como límite práctico de memoria de trabajo.
- Despliegue en hardware mixto GPU+CPU: con una GPU de 24 GB y 64 GB o más de RAM del sistema, Q4_K_M puede repartirse con `--fit on`, aunque el autor advierte de velocidad baja y de que esta configuración no se ha probado.

## Benchmarks y rendimiento

El autor publica mediciones propias sobre Q4_K_M con decodificación greedy (temperatura 0), comparando el original con esta release. No son benchmarks estándar de la comunidad y no se han replicado sobre las demás cuantizaciones.

| Metrica (Q4_K_M, greedy) | Original | Esta release |
|---|---:|---:|
| Rechazos en 48 prompts dañinos reservados (regex sobre la respuesta final) | 48/48 | 1/48 |
| Falsos rechazos en prompts inocuos | 2/24 | 0/64 |
| Comprobaciones de respuesta y código (fácil, difícil, código, calidad; 100 casos) | 96/100 | 97/100 |
| Comprobaciones en modo razonamiento (difícil, código; 34 casos) | 32/34 | 32/34 |
| Round trip de tool call | pass | pass |
| Perplejidad WikiText, 32 fragmentos de 512 tokens | 8,392 | 8,521 |

Rendimiento de inferencia medido por el autor en un equipo con cuatro NVIDIA V100 (una de 32 GB y tres de 16 GB), `--tensor-split 32,16,16,16`, 65.536 tokens de contexto repartidos en 8 slots:

| Cuantizacion | Tamano de descarga | Ficheros | VRAM tras carga | Velocidad (un stream) |
|---|---:|---:|---:|---:|
| Q4_K_M | 38,80 GB | 1 | 45,3 GiB | 17,1 tok/s |
| Q5_K_M | 45,76 GB | 1 | 51,8 GiB | 15,2 tok/s |
| Q6_K | 53,15 GB | 2 | 58,6 GiB | 13,4 tok/s |
| Q8_0 | 68,84 GB | 2 | 73,1 GiB | 11,5 tok/s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para esta release en la información disponible.

## Requisitos de hardware

- VRAM estimada tras la carga: 45,3 GiB (Q4_K_M), 51,8 GiB (Q5_K_M), 58,6 GiB (Q6_K) y 73,1 GiB (Q8_0). El tamaño de fichero no incluye la caché de contexto ni los buffers de ejecución.
- Con unos 50 GB o más de VRAM, Q4_K_M cabe completamente descargado; conviene reducir `-c` si el ajuste es justo.
- Con 80 GB o más de VRAM, cualquiera de las cuantizaciones debería caber completamente descargada. Esta es la configuración probada por el autor (80 GB repartidos en cuatro tarjetas).
- GPU recomendadas: el autor solo documenta pruebas en cuatro NVIDIA V100 (32+16+16+16 GB). No se han probado A100, H100 ni RTX 4090 en esta release.
- En una GPU consumer de 24 GB con 64 GB o más de RAM del sistema, Q4_K_M puede ejecutarse con `--fit on` repartiendo entre GPU y CPU; no está probado y se espera velocidad baja.
- Solo CPU o Apple Silicon con 64 GB o más: Q4_K_M, no probado, velocidad baja esperada.
- Despliegue: llama.cpp compilado en el commit `954de248ac6907dd05dc19f0f511ab18f2807a54` o posterior, con `-DGGML_CUDA=ON` para GPU. El autor advierte de que LM Studio, Ollama y otras aplicaciones deben incluir un backend con el PR #31692; ninguna fue probada.
- Throughput medido: entre 11,5 y 17,1 tok/s en un solo stream según cuantización, sobre el hardware descrito.
- Recomendación de uso: `--jinja` para la plantilla embebida, `--reasoning-format deepseek` para separar el razonamiento y un límite de salida de 4.096 tokens o más, ya que el razonamiento consume parte de ese presupuesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| Ripple-65B-Preview-abliterated-GGUF (esta release) | 64,8B denso | 64K | Apache-2.0 | GGUF en Hugging Face, requiere llama.cpp con PR #31692 | Sin salvaguardas de rechazo; sin benchmarks estándar publicados |
| ricursiveAI/Ripple-65B-Preview (original) | 64,8B denso | no disponible en la información | Apache-2.0 | Pesos en Hugging Face | Modelo base sin editar; conserva la dirección de rechazo |
| prometheusAIR/Ripple-65B-Preview-GGUF | 65B (según la card) | no disponible en la información | no disponible en la información | GGUF en Hugging Face | Cuantización del mismo modelo base sin abliteration documentada |

No se dispone de datos de benchmarks estándar que permitan comparar rendimiento con modelos de otras familias del mismo tamaño.

## Limitaciones y advertencias

- El modelo responde a muchas peticiones que el original rechaza, incluidas peticiones peligrosas. No ha pasado ninguna revisión de seguridad y el autor declara explícitamente que la responsabilidad de uso y de las salvaguardas recae en quien lo despliega.
- Riesgo elevado de alucinación y de contenido dañino en producción: la eliminación de la dirección de rechazo no distingue entre peticiones legítimas y dañinas.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La ventana de contexto recomendada es de 64K, pero el razonamiento previo consume parte del límite de salida; hay que dimensionar el presupuesto de tokens en consecuencia.
- Requiere un build de llama.cpp con el PR #31692 (5 de noviembre de 2026 o posterior); versiones anteriores fallan al cargar los ficheros. LM Studio, Ollama y otras aplicaciones no están probadas.
- Las cifras de benchmark de la model card upstream corresponden al modelo BF16 sin modificar y no se han reejecutado sobre estas cuantizaciones.
- La edición de pesos degrada ligeramente la perplejidad (8,521 frente a 8,392 en WikiText) y no se ha ajustado el muestreo; todas las mediciones usan temperatura 0.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece ninguna garantía ni revisión de seguridad; el uso comercial en aplicaciones expuestas a terceros exige implementar filtros y salvaguardas propios.
- El repositorio ocupa 206,5 GB; conviene descargar una sola cuantización.

## Enlaces

- Repositorio Hugging Face de esta release: https://huggingface.co/0xKitkat/Ripple-65B-Preview-abliterated-GGUF
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Cuantización alternativa del mismo modelo base: https://huggingface.co/prometheusAIR/Ripple-65B-Preview-GGUF
- Ficha de benchmarks del modelo base: https://ai-tldr.dev/models/ripple-65b-preview/
- PR de llama.cpp con la arquitectura `ricursive`: https://github.com/ggml-org/llama.cpp/pull/31692
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Perfil del autor en X/Twitter: https://twitter.com/procrastiness
