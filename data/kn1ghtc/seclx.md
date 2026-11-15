# kn1ghtc/seclx

## Resumen

seclx es un repositorio de pesos cuantizados publicado por el usuario kn1ghtc para su propia pasarela de inferencia local, también llamada seclx, orientada a despliegues de una sola máquina sobre Apple Silicon. No se trata de un modelo entrenado desde cero: cada artefacto es una cuantización de una release upstream de Qwen, concretamente `Qwen/Qwen3.5-9B` y `Qwen/Qwen3-Omni-30B-A3B-Instruct`, sin reentrenamiento ni calibración con datos. El objetivo declarado es servir mediante endpoints compatibles con OpenAI (`/v1/chat/completions`, `/v1/images/*`, `/v1/videos`, `/v1/audio/*`) un modelo auxiliar barato y un generalista multimodal, evitando alquilar GPUs.

El repositorio contiene dos artefactos: `seclx-aux-9b-4bit`, un modelo denso de 9B cuantizado a 4 bits en formato MLX (4,7 GiB, contexto de 32.768 tokens), pensado para respuestas cortas, expansión de prompts y extracción estructurada; y `seclx-omni-30b-a3b-4bit-forge4`, un MoE de 30B totales y 3B activos con cuantización mixta (expertos a 4 bits, atención y expertos compartidos a 8 bits, routers sin tocar) que cubre texto, imagen y audio en 18,2 GiB.

Su relevancia es acotada pero concreta: demuestra una receta de cuantización MoE con criterio técnico (no cuantizar los gates del router porque un error de enrutamiento cuesta más que un error de redondeo) y publica las métricas de perplejidad frente a bf16 y frente a otra build comunitaria de 4 bits. La licencia Apache-2.0 se hereda del upstream. No hay builds GGUF ni CUDA: es MLX y Apple Silicon exclusivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`seclx-aux-9b-4bit`) y MoE (`seclx-omni-30b-a3b-4bit-forge4`) |
| Parametros totales | 9B (aux) / 30B (omni) |
| Parametros activos | No aplica en aux; 3B en omni |
| Longitud de contexto | 32.768 tokens (aux); no disponible para omni |
| Tipos de cuantizacion | MLX 4-bit group 64 (aux, 4,501 bits/peso); mixta 4-bit expertos + 8-bit atención y expertos compartidos, routers sin cuantizar (omni) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 7 shards en omni; manifiesto `.seclx-manifest.json` |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. `seclx-aux-9b-4bit` deriva de `Qwen/Qwen3.5-9B`, un transformer denso de 9B parámetros, convertido con `mlx_lm convert -q --q-bits 4 --q-group-size 64` y sin calibración (redondeo post-entrenamiento round-to-nearest, sin datos). El autor afirma que, al no haber calibración, el comportamiento y la alineación de seguridad del upstream permanecen intactos y solo cambia la precisión numérica; el resultado son 4,501 bits por peso y 4,7 GiB en disco.

`seclx-omni-30b-a3b-4bit-forge4` parte de `Qwen/Qwen3-Omni-30B-A3B-Instruct`, un decoder MoE de 30B totales con 3B activos por token. La receta aplica 4 bits con grupo 64 a los expertos, mantiene atención y expertos compartidos en 8 bits y deja los gates del router sin cuantizar, con 1.041 tensores cuantizados, 1.061 conservados, 68 rutas de 8 bits y 7 shards. El razonamiento del autor es que el ancho de banda de decodificación en un MoE está dominado por la lectura de expertos, mientras que elegir mal un experto por un error de redondeo en el router penaliza mucho más que el error de un peso. El artefacto pasa de 65,7 GiB en bf16 a 18,2 GiB. Se conserva la cabeza de predicción multi-token (MTP) donde estaba presente.

## Capacidades

- Generación de texto y respuestas cortas de bajo coste en el tier auxiliar.
- Expansión de prompts: convertir una frase breve del usuario en un prompt elaborado para los endpoints de imagen, vídeo y audio.
- Extracción estructurada de información.
- Razonamiento multi-paso y modo thinking: disponibles en el upstream, pero desactivados por diseño en el tier auxiliar.
- Multimodalidad en el artefacto omni: texto, imagen y audio, incluida la pila de habla (talker) cuantizada dentro del bloque de expertos.
- Servido mediante endpoints compatibles con OpenAI: chat completions, imágenes, vídeos y audio.
- Carga perezosa y liberación por inactividad de los pools de modelos en la pasarela.
- Capacidades de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada (el tier auxiliar las desactiva explícitamente).

## Casos de uso

- Asistente local mono-inquilino sobre una estación de trabajo Apple Silicon: la pasarela sirve ambos artefactos en la misma máquina, con carga perezosa de pools, de modo que un único equipo cubre chat y medios sin depender de una API alojada.
- Expansión de prompts para generación de imágenes y vídeo: el tier auxiliar de 4,7 GiB convierte una frase corta en un prompt detallado; el autor justifica explícitamente que despertar un modelo de 27B para esta tarea consume más memoria que todo el pipeline de medios.
- Extracción estructurada en flujos internos: respuestas cortas y formato controlado con el modelo de 9B, que arranca en frío en 3,8 s y responde en caliente en 0,54 s según la medición del autor en un M5 Ultra con 96 GiB.
- Asistente multimodal de propósito general: el artefacto omni atiende texto, imagen y audio a través de los endpoints de la pasarela, con 320 tok/s agregados en 8 carriles concurrentes y 43,7 tok/s por carril.
- Despliegues offline o en red aislada: al no requerir llamadas a una API alojada, encaja en entornos air-gapped donde el stack completo debe residir en una sola máquina.
- Control de costes por enrutamiento: derivar el trabajo trivial y el adyacente a medios al tier auxiliar y reservar el MoE de 30B para las peticiones que realmente necesitan multimodalidad o más capacidad.
- Baseline para comparar recetas de cuantización propias: el repositorio publica la receta y el manifiesto por artefacto, de modo que un tercero puede reproducir la conversión y contrastar su perplejidad con la aquí reportada.

## Benchmarks y rendimiento

| Metrica | seclx-omni-30b-a3b-4bit-forge4 | bf16 upstream | Build comunitaria 4-bit |
|---|---|---|---|
| Perplejidad (holdout de 643 tokens) | 14,010 | 12,9242 | 14,0773 |
| Delta frente a bf16 | +8,4% | referencia | no disponible |
| Throughput agregado (8 carriles) | 320 tok/s | no disponible | no disponible |
| Throughput por carril | 43,7 tok/s | no disponible | no disponible |

| Metrica | seclx-aux-9b-4bit |
|---|---|
| Arranque en frío (M5 Ultra, 96 GiB) | 3,8 s |
| Petición en caliente | 0,54 s |
| Memoria residente | 5,7 GiB |
| Tamano en disco | 4,7 GiB |

El autor advierte que la precisión multi-select sobre conjuntos pequeños no resultó discriminativa para ordenar estas builds (±1 pregunta movía la puntuación 5 puntos), por lo que solo se reclama la comparación de perplejidad. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Exclusivamente Apple Silicon: los artefactos son MLX y no hay builds GGUF ni CUDA en el repositorio.
- Tier auxiliar: 4,7 GiB en disco y 5,7 GiB residentes medidos en un Apple M5 Ultra con 96 GiB de memoria unificada; cabe en equipos con 16 GiB de memoria unificada o superior.
- Artefacto omni: 18,2 GiB en disco; requiere un equipo con memoria unificada suficiente para el modelo más el contexto (no se publica la cifra exacta de memoria residente).
- Despliegue mediante la CLI `seclx` (`pip install seclx`, `seclx model pull`, `seclx up --config`) o directamente con `mlx_lm` (`mlx_lm.load` y `mlx_lm.generate`), ya que el mapa de cuantización vive en `config.json`.
- Latencia y throughput medidos: 0,54 s por petición en caliente en el tier auxiliar; 320 tok/s agregados y 43,7 tok/s por carril en el omni con 8 carriles concurrentes.
- vLLM, llama.cpp, Ollama y TGI no están soportados por estos artefactos según la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| seclx-aux-9b-4bit | 9B denso | 32.768 | MLX 4-bit group 64 | Apache-2.0 | Apple Silicon (MLX) |
| Qwen3.5-9B (upstream) | 9B denso | no disponible | bf16 | Apache-2.0 | multiplataforma |
| seclx-omni-30b-a3b-4bit-forge4 | 30B totales / 3B activos | no disponible | mixta 4/8-bit | Apache-2.0 | Apple Silicon (MLX) |
| Qwen3-Omni-30B-A3B-Instruct (upstream) | 30B totales / 3B activos | no disponible | bf16 (65,7 GiB) | Apache-2.0 | multiplataforma |

La comparación relevante es contra las releases upstream de las que derivan y contra otras builds comunitarias de 4 bits del mismo modelo base. Frente a bf16, el omni pierde un 8,4% de perplejidad a cambio de reducir el peso de 65,7 a 18,2 GiB; frente a la build comunitaria de 4 bits citada, mejora ligeramente (14,010 frente a 14,0773). No se dispone de datos para comparar con alternativas de otros fabricantes en la misma categoría.

## Limitaciones y advertencias

- Solo Apple Silicon: no hay artefactos GGUF ni CUDA, lo que excluye GPU NVIDIA y el despliegue en servidores x86 convencionales.
- El tier auxiliar desactiva el modo thinking por diseño: una traza de razonamiento consume todo el presupuesto y contamina el formato de salida de expansión de prompts. El razonamiento multi-paso debe enrutarse a un artefacto mayor.
- En el artefacto omni, la calidad a 4 bits es de tier de throughput, no de tier de precisión; el autor no reclama paridad de benchmarks con bf16 y solo sostiene la comparación de perplejidad.
- No mezclar salidas bf16 y 4-bit en una misma evaluación: la cuantización altera la numerología.
- La pila de habla (talker) está cuantizada dentro del bloque de expertos, por lo que la calidad de audio arrastra la misma pérdida de perplejidad que el texto.
- El contexto más allá de la ventana entrenada no está soportado; la pasarela lo limita por pool. El contexto del artefacto omni no se publica.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- No apto para moderación en entornos críticos de seguridad: el autor remite a la familia de guardas publicada por separado.
- No redistribuir bajo otro nombre de modelo sin conservar los campos de procedencia.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas; al no haber calibración, se heredan los del upstream, pero no se cuantifican en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks estándar publicados: la validación externa es inexistente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kn1ghtc/seclx
- Modelo base del tier auxiliar: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base del artefacto omni: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Paquete de la pasarela: `pip install seclx` (no se proporciona URL del repositorio)
- Documentación de MLX LM: no disponible en la información proporcionada
- Paper, blog o demo del autor: no disponible en la información proporcionada
