# nace-ai/Qwen3.8-27B-MLX

## Resumen

Qwen3.8-27B-MLX es una cuantización en formato MLX del modelo Qwen3.8-27B de Alibaba Qwen, empaquetada por nace-ai para su ejecución en Macs con Apple Silicon. El modelo base es un transformer multimodal de 27.356.728.560 parámetros (unos 27,36 mil millones) con capacidad de entrada de imagen y texto (pipeline `image-text-to-text`), y esta versión lo redistribuye en dos checkpoints cuantizados: Q4 uniforme de 4 bits (16,3 GB de descarga) y Q5 de precisión mixta entre 4, 6 y 8 bits por tensor (20,7 GB). La licencia declarada es Apache 2.0.

El interés técnico de este pack no está en el modelo base, sino en el proceso de cuantización: el autor publica una métrica de divergencia KL respecto al modelo original en BF16 (0,035 para Q4 y 0,022 para Q5) y afirma que su Q4 queda un 1,5× más cerca del BF16 que el pack de 4 bits de mlx-community (KL 0,054 frente a 0,035) con el mismo tamaño de pesos del modelo de lenguaje (15,13 GB). Es, por tanto, una alternativa de cuantización para quien ya vaya a usar Qwen3.8-27B en local sobre macOS.

El pack se distribuye con la librería MLX y con Kapitsa, un motor propio de nace-ai para servir modelos Qwen en el Mac con APIs compatibles con OpenAI, Anthropic y Ollama. La model card documenta el modo de razonamiento (thinking) activado por defecto, con control de profundidad mediante `reasoning_effort`, soporte de imágenes por `image_url` y tool calling a través de `mlx_lm.server` y LM Studio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; tag de librería `qwen3_5`) |
| Parámetros totales | 27.356.728.560 (~27,36 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de LM Studio usa `--context-length 32768`, no confirmado como máximo) |
| Tipos de cuantización | Q4 uniforme de 4 bits; Q5 de precisión mixta 4/6/8 bits por tensor (~5,3 bits por peso, 5,8 contando escalas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

Datos adicionales del pack:

| Parámetro | Q4 | Q5 |
|---|---|---|
| Tamaño de descarga | 16,3 GB | 20,7 GB |
| Pesos del modelo de lenguaje | 15,13 GB | no disponible |
| KL respecto a BF16 (menor es mejor) | 0,035 | 0,022 |
| RAM recomendada (regla aproximada del autor) | 32 GB+ | 48 GB+ |
| Identificador en Kapitsa | `27b:q4` | `27b:q5` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentación proporcionada: no se detalla si es un transformer denso, un MoE o una arquitectura híbrida, ni el número de tokens de entrenamiento, la composición del dataset o si hubo etapas de RLHF o DPO. El tag `qwen3_5` sugiere la familia Qwen 3.5/3.8, y el pipeline `image-text-to-text` confirma que el modelo acepta imágenes además de texto, pero no se especifica el codificador visual ni el mecanismo de fusión multimodal.

Lo que sí documenta el autor es el trabajo de cuantización. Q4 aplica 4 bits uniformes a todos los tensores, mientras que Q5 usa precisión mixta con asignación de 4, 6 u 8 bits por tensor, lo que resulta en unos 5,3 bits efectivos por peso. El autor reporta la divergencia KL frente al modelo en BF16 como medida de fidelidad: 0,035 para Q4 y 0,022 para Q5. No se detalla la metodología de calibración ni el conjunto de datos usado para medir la KL.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" activado por defecto; la salida de razonamiento se devuelve en el campo `reasoning_content` (Kapitsa) o `reasoning` (mlx-lm).
- Control de profundidad de razonamiento mediante `reasoning_effort` con los valores `low`, `medium` y `xhigh`, y desactivación completa con `reasoning_effort: "none"` o `enable_thinking: false`.
- Comprensión de imágenes: entrada de imagen por URL http(s) o data URL en base64 con el formato `image_url` de OpenAI.
- Tool calling / function calling: verificado por el autor en `mlx_lm.server` y en LM Studio sobre este mismo pack.
- Aritmética básica y tareas de conocimiento general (los ejemplos de la model card usan `17 * 23` y nombrar ríos de Kazajistán).
- Compatibilidad con APIs OpenAI, Anthropic y Ollama a través de Kapitsa.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente conversacional local en Mac: con 16,3 GB en Q4 y una regla de 32 GB de RAM o más, el pack permite mantener un asistente privado en el propio equipo mediante `kapitsa serve --private`, sin enviar datos a la nube. El flag `--private` y el servidor en `127.0.0.1` lo hacen adecuado para entornos con requisitos de confidencialidad.
- Análisis de imágenes en local: el soporte de `image_url` con URL o base64 permite describir, clasificar o extraer información de capturas, documentos escaneados o fotografías sin salir del equipo, usando LM Studio o la API de Kapitsa.
- Automatización con tool calling: al colocar llamadas a herramientas de forma verificada en `mlx_lm.server` y LM Studio, el modelo puede integrarse en flujos que consulten APIs internas, bases de datos o sistemas de ficheros a través de funciones definidas por el desarrollador.
- Razonamiento con coste controlado: el parámetro `reasoning_effort` permite usar `low` para respuestas rápidas en tareas simples y `xhigh` para problemas que requieren cadena de pensamiento larga, ajustando la latencia al caso de uso concreto.
- Sustitución de API en desarrollo: al exponer un endpoint compatible con OpenAI en el puerto 8080 (`mlx_lm.server`) o en el 8000 (Kapitsa), se puede apuntar código escrito contra la API de OpenAI al modelo local sin cambios, útil para desarrollo offline y pruebas de integración.
- Prototipado de aplicaciones multimodales: la combinación de entrada de imagen, razonamiento y tool calling en un solo modelo de 27 B ejecutable en un Mac de gama alta permite validar productos multimodales antes de pasar a infraestructura con GPU.
- Evaluación de cuantizaciones: la métrica KL publicada y la comparación con packs de mlx-community y lmstudio-community hacen de este repositorio un punto de referencia para quien quiera medir el impacto de distintas cuantizaciones sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta la divergencia KL frente al modelo en BF16:

| Pack | Bits | Tamaño de descarga | KL a BF16 (menor es mejor) |
|---|---|---|---|
| Nace Q4 | 4 uniforme | 16,3 GB | 0,035 |
| Nace Q5 | 4/6/8 mixto (~5,3) | 20,7 GB | 0,022 |
| mlx-community 4-bit | 4 | no disponible | 0,054 |

No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos sobre este pack.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (formato MLX); no es ejecutable en GPU NVIDIA ni en CPU x86 con las herramientas documentadas.
- RAM: 32 GB o más para Q4 y 48 GB o más para Q5, según la regla del autor (la porción de GPU por defecto en macOS es aproximadamente 2/3 de la RAM total, y hay que sumar unos 2 GB para la conversación). Es una aproximación, no una medición.
- Kapitsa puede ajustar en un tamaño menos de RAM porque omite las partes que no usa; `kapitsa doctor` comprueba si un Mac concreto puede con el modelo.
- Almacenamiento: 16,3 GB (Q4) o 20,7 GB (Q5) de descarga; el repositorio completo ocupa 37,0 GB.
- Opciones de despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa`), mlx-lm (`mlx_lm.generate`, `mlx_lm.server` en el puerto 8080) y LM Studio (`lms get ... --mlx`, `lms load ... --context-length 32768`). No se documenta soporte de vLLM, llama.cpp, Ollama nativo ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño | KL a BF16 | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| nace-ai/Qwen3.8-27B-MLX Q4 | ~27,36 B | MLX 4 bits | 16,3 GB | 0,035 | Apache 2.0 | Apple Silicon |
| nace-ai/Qwen3.8-27B-MLX Q5 | ~27,36 B | MLX mixto ~5,3 bits | 20,7 GB | 0,022 | Apache 2.0 | Apple Silicon |
| mlx-community 4-bit (Qwen3.8-27B) | ~27,36 B (mismo base) | MLX 4 bits | no disponible | 0,054 | no disponible | Apple Silicon |
| lmstudio-community 4-bit (Qwen3.8-27B) | ~27,36 B (mismo base) | MLX 4 bits | no disponible | no disponible | no disponible | Apple Silicon |
| mlx-works oQ4e-mtp (Qwen3.8-27B) | ~27,36 B (mismo base) | MLX 4 bits | no disponible | no disponible | no disponible | Apple Silicon |

Las tres alternativas son cuantizaciones del mismo modelo base, por lo que la comparación relevante es la fidelidad al BF16 y el tamaño. No se dispone de datos de benchmarks de calidad por tarea para ninguna de ellas.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon: el formato MLX no es portable a CUDA ni a CPU x86 con el stack documentado.
- La regla de RAM del autor es explícitamente una aproximación, no una medición; conviene verificar con `kapitsa doctor` antes de asumir que un Mac concreto puede cargar el modelo.
- Solo se ha verificado sobre este pack la respuesta a un chat, la lectura de una imagen y la colocación de una tool call (12 de noviembre de 2026, mlx-lm 0.32.2 y LM Studio); el resto de ejemplos de la model card se probaron únicamente en el pack de 9B, según advierte el propio autor.
- El modelo piensa antes de responder por defecto, lo que incrementa la latencia y el consumo de tokens; es necesario desactivarlo explícitamente para respuestas directas.
- No hay datos publicados de sesgos, tasa de alucinación, rendimiento multilingüe ni comportamiento en contextos largos para esta cuantización.
- No se especifica la longitud máxima de contexto del modelo base; el valor 32768 del ejemplo de LM Studio es solo un parámetro de carga.
- El repositorio tiene 40 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es muy limitada.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y no se detallan condiciones adicionales del autor de la cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX
- Carpeta Q4: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX/tree/main/Q4
- Carpeta Q5: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX/tree/main/Q5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Instalación de Kapitsa vía Homebrew: https://github.com/nace-ai/tap
