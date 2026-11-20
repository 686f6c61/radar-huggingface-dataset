# AXERA-TECH/Qwen3.5-0.8B-AX8860-llama.cpp

## Resumen

Qwen3.5-0.8B-AX8860-llama.cpp es una distribución del modelo Qwen3.5-0.8B (desarrollado por Alibaba Qwen) empaquetada por AXERA-TECH para su ejecución sobre la NPU del SoC Axera AX8860 mediante una bifurcación de llama.cpp con soporte de kernels ggml-axera. No se trata de un modelo nuevo, sino de una conversión y un runtime: los pesos originales se cuantizan a Q8_0 en formato GGUF y se acompaña de un codificador visual independiente (mmproj en BF16), lo que habilita entrada de texto e imagen. El repositorio incluye además los binarios estáticos para el dispositivo, los kernels de NPU y scripts de ejecución, benchmark y servidor compatible con la API de OpenAI.

El modelo base es un transformer denso de aproximadamente 772,8 millones de parámetros (según los pesos en safetensors del modelo original), con una ventana de contexto que esta distribución eleva hasta 16.384 tokens. Su relevancia es práctica: demuestra la viabilidad de ejecutar un modelo multimodal conversacional de sub-1000 millones de parámetros en hardware de borde (edge AI) con un rendimiento medido de 144,6 tokens/s en decodificación y 11.665 tokens/s en prefill de 4k, cifras que lo sitúan muy por encima de lo habitual en inferencia en CPU para ese tamaño.

La ficha describe tanto el modelo subyacente como el paquete de despliegue, ya que gran parte del valor diferencial reside en el runtime y en las métricas reportadas por el autor. La información pública disponible sobre el modelo base Qwen3.5-0.8B es limitada en este repositorio; los detalles arquitectónicos y de entrenamiento no se documentan en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-0.8B); detalles internos no disponibles |
| Parametros totales | 772.845.888 (~0,77 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 16.384 tokens |
| Tipos de cuantizacion | Q8_0 (pesos, 0,83 GB); codificador visual en BF16 (0,21 GB) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |
| Tamano del repositorio | 1,6 GB |
| Hardware objetivo | NPU Axera AX8860 (4 nucleos), SDK V0.5.1 o superior |
| Runtime | llama.cpp (fork ZHEQIUSHUI/llama.cpp, rama `axera-dev`, commit `0104880be`) |
| Servidor | API compatible con OpenAI (`run.sh -s 8080`) |
| Cache de prompt | 4 GB de memoria host por defecto; configurable a disco via `CACHE_DIR` |
| Paralelismo | `-np 1` (una sola peticion simultanea) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-0.8B, un transformer denso de ~0,77 mil millones de parámetros. La model card de esta distribución no documenta la composición del dataset de entrenamiento, el número de tokens procesados ni si hubo etapas de RLHF o DPO; esa información correspondería a la model card oficial de Qwen, que no se incluye en el material disponible. Sí se confirma que el modelo es multimodal: incorpora un codificador visual separado (`mmproj-qwen3.5-0.8b-bf16.gguf`, 0,21 GB en BF16) que procesa imágenes y las proyecta al espacio del modelo de lenguaje.

La innovación técnica de esta publicación no está en el modelo sino en el stack de inferencia: una bifurcación de llama.cpp con kernels ggml-axera que descargan la computación a la NPU del AX8860. El paquete incluye binarios estáticos para el dispositivo, un directorio `kernels/` con el manifiesto correspondiente y scripts de conveniencia. El servidor usa por defecto los parámetros de muestreo recomendados por la model card, desactiva el modo de razonamiento (`--reasoning off`) y acepta mensajes de sistema en mitad de la conversación, lo que permite su uso con clientes de agentes como Codex. La decodificación de texto y la descripción de imágenes emplean decodificación voraz (greedy).

## Capacidades

- Generación de texto conversacional en múltiples turnos.
- Comprensión de imágenes: descripción de escenas, vehículos, texto visible y personas (validado por el autor).
- Entrada multimodal combinada de texto e imagen en una misma petición.
- Servidor HTTP compatible con la API de OpenAI, lo que facilita la integración con clientes existentes.
- Soporte de mensajes de sistema en mitad de la conversación, útil para clientes de agentes.
- Modo de razonamiento disponible pero desactivado por defecto en el servidor.
- Plantilla de chat incluida (`chat_template.jinja`) para el formateo correcto de turnos.
- Caché de prompt persistente opcional en disco para reutilización entre reinicios.
- No se documentan capacidades de tool calling, function calling ni agentes multi-paso más allá de la compatibilidad con clientes tipo Codex.

## Casos de uso

- Asistente conversacional en dispositivo de borde: el modelo corre íntegramente en la NPU del AX8860 sin depender de la nube, con 144,6 tokens/s de decodificación, adecuado para interfaces de voz o chat en tiempo real en hardware empotrado.
- Descripción de imágenes en sistemas de vigilancia o inspección: el codificador visual BF16 permite generar descripciones de escenas (vehículos, matrículas, personas) localmente, sin enviar imágenes a servidores externos.
- Servicio interno compatible con OpenAI: al exponer un endpoint estilo OpenAI en el puerto 8080, se puede conectar cualquier cliente o framework que ya hable ese protocolo, reduciendo el trabajo de integración.
- Procesamiento de documentos con OCR contextual: combinando imagen y texto, el modelo puede leer y describir contenido textual presente en capturas o fotos, útil en digitalización de formularios en campo.
- Automatización con clientes de agentes: la aceptación de mensajes de sistema intermedios y el modo servidor permiten integrarlo en flujos tipo Codex u orquestadores de agentes ligeros en entornos locales.
- Prototipado rápido de aplicaciones multimodales en edge: el paquete incluye binarios, kernels y scripts de benchmark, lo que reduce el tiempo desde la descarga hasta la primera inferencia a minutos en un AX8860 con SDK V0.5.1+.
- Evaluación de rendimiento en NPU: `bench.sh` y `llama-bench` (con `-b 4096 -ub 4096`) permiten reproducir las métricas del autor y comparar configuraciones de contexto (8k frente a 16k).

## Benchmarks y rendimiento

Métricas reportadas por el autor en el AX8860 (generación de 128 tokens):

| Escenario | Contexto (`-c`) | Tiempo de prompt | Decodificación (tokens/s) |
|---|---|---|---|
| Prompt de 5 tokens | 8192 | 0,04 s | — |
| Prompt de 47 tokens | 8192 | 0,06 s | — |
| Prompt de 3908 tokens | 8192 | 0,34 s | 132,8 |
| Prompt de 5 tokens | 16384 | 0,04 s | — |
| Prompt de 47 tokens | 16384 | 0,05 s | — |
| Prompt de 3908 tokens | 16384 | 0,33 s | 132,7 |
| Prompt de 3908 tokens, muestreo recomendado | 8192 | 0,34 s | 130,1 |

Resumen agregado: decodificación de 144,6 tokens/s y prefill de 4k a 11.665 tokens/s. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: SoC Axera AX8860 con SDK V0.5.1 o superior; no hay soporte documentado para GPU convencional en este paquete.
- NPU: el runtime ocupa los 4 núcleos de NPU de forma exclusiva.
- Memoria: 4 GB de RAM host reservados por defecto para la caché de prompt; ampliable a disco configurando `CACHE_DIR`.
- Almacenamiento: 1,6 GB para el repositorio completo (0,83 GB de pesos + 0,21 GB de codificador visual + binarios y kernels).
- Despliegue: scripts `run.sh` (texto, imagen, chat, servidor) y `bench.sh`; binarios estáticos incluidos en `bin/`.
- Throughput medido: 144,6 tokens/s de decodificación; 11.665 tokens/s de prefill con 4k de contexto.
- No cabe en GPU de consumo convencional mediante este paquete, ya que los kernels están compilados para la NPU del AX8860. Para ejecución en CPU/GPU habría que recurrir al GGUF Q8_0 con llama.cpp estándar, opción no documentada por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-AX8860-llama.cpp | ~0,77 B | 16.384 | Sí (texto + imagen) | No disponible | GGUF + binarios AX8860 |
| Modelo base Qwen/Qwen3.5-0.8B | ~0,77 B | No disponible | No disponible en esta ficha | No disponible | Hugging Face (safetensors) |
| Alternativas de ~1 B en GGUF para edge | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de calidad ni de modelos comparables documentados en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Dependencia total del hardware Axera AX8860: el paquete no funciona en GPU o CPU convencionales sin recompilar o sustituir el runtime.
- Licencia no especificada en el repositorio; antes de un uso comercial debe verificarse la licencia del modelo base Qwen3.5-0.8B y la de los binarios y kernels distribuidos.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe sin validación propia.
- El servidor opera con `-np 1`, es decir, una sola petición simultánea; no es adecuado para cargas concurrentes altas.
- Se han observado fallos intermitentes `ret = -3` en peticiones consecutivas en algunos entornos; el autor recomienda reintentar, lo que introduce fragilidad en producción.
- El modo de razonamiento está desactivado por defecto en el servidor; si se necesita, debe habilitarse explícitamente y validarse.
- Decodificación voraz por defecto en completado y descripción de imágenes, lo que puede reducir la diversidad de las respuestas.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de seguridad; con ~0,77 B de parámetros es esperable una fiabilidad limitada en razonamiento complejo y matemáticas.
- La caché de prompt en memoria host consume 4 GB por defecto, lo que puede ser restrictivo en despliegues con poca RAM.
- El modelo base Qwen3.5-0.8B no está descrito en detalle en esta model card; los datos de entrenamiento y evaluación deben consultarse en la fuente original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.5-0.8B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Fork de llama.cpp utilizado: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `0104880be`)
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
