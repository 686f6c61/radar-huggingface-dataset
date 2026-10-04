# Rybib/rytability-qwen35-vision

## Resumen

Rybib/rytability-qwen35-vision no es un modelo de lenguaje completo, sino el *vision tower* (la torre de visión) extraído del modelo multimodal Qwen/Qwen3.5-4B y publicado como artefacto independiente. Lo mantiene el usuario Rybib para la aplicación Rytability, con un objetivo de ingeniería muy concreto: permitir que la app distribuya únicamente los pesos de texto y descargue la parte de visión solo cuando el usuario instala la función "Scan Text".

El repositorio contiene exclusivamente los tensores cuyo nombre empieza por `vision_tower.*`: 297 tensores y 333,5 millones de parámetros en bfloat16 sin cuantizar, serializados en un único fichero `model-vision.safetensors` de 667.061.465 bytes (0,62 GiB). El repositorio completo ocupa 0,7 GB. Los pesos, según la model card, son los originales de mlx-community/Qwen3.5-4B-4bit (sha256 `5fb9acd0246866381cf8c5c354c6db1019f6498eec4ccb4f5edcc71ffeacb2db`) sin más modificación que la separación de los pesos de texto y la conversión previa a formato MLX.

Su relevancia es práctica más que algorítmica: es un ejemplo de empaquetado modular de un VLM para despliegue en dispositivo (Apple Silicon vía MLX), donde el codificador de visión se trata como un componente opcional y descargable. No aporta ninguna innovación técnica propia, no tiene benchmarks publicados y no puede usarse de forma autónoma: en tiempo de carga debe colocarse junto a `model-text.safetensors` y ambos se cargan con la clase `Qwen35` de mlx-swift-lm; sin el fichero de visión, el modelo de texto se carga solo a través de `MLXLLM`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision tower de un modelo vision-lenguaje Qwen3.5; arquitectura interna del tower no disponible |
| Parametros totales | 333,5 M (solo el vision tower; 297 tensores) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el repositorio no contiene pesos de texto) |
| Tipos de cuantizacion | Ninguna; bfloat16 sin cuantizar. No se ofrecen variantes GGUF ni cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con metadatos MLX (`{"format": "mlx"}`); fichero `model-vision.safetensors` |
| Tamano del fichero | 667.061.465 bytes (aproximadamente 0,62 GiB) |
| Tamano del repositorio | 0,7 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Fuente de los pesos | mlx-community/Qwen3.5-4B-4bit (sha256 `5fb9acd0246866381cf8c5c354c6db1019f6498eec4ccb4f5edcc71ffeacb2db`) |
| Libreria | mlx |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-04 |
| Ultima actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna del vision tower en la información disponible. Lo único verificable es su interfaz con el resto del sistema: es el conjunto de tensores `vision_tower.*` de un VLM de la familia Qwen3.5, con 333,5 M de parámetros en bfloat16 y metadatos MLX. El modelo base declarado es Qwen/Qwen3.5-4B, que según los resultados de búsqueda pertenece a una serie que Alibaba describe como nativa en visión-lenguaje; sin embargo, no se dispone de la ficha técnica del variante 4B ni de detalles sobre su codificador visual.

Tampoco se han publicado datos de entrenamiento para este repositorio: no hay número de tokens, composición del dataset, ni indicios de RLHF, DPO u otras fases de alineación. El autor indica explícitamente que los pesos son los originales de mlx-community, sin modificación distinta de la separación de los pesos de texto, por lo que cualquier entrenamiento o ajuste fino corresponde al modelo Qwen3.5-4B original, no a este artefacto. No se describe ninguna innovación técnica propia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Codificación visual: el artefacto contiene únicamente la torre de visión, por lo que su función es proyectar entradas de imagen a representaciones que el modelo de texto pueda consumir.
- Integración VLM: al colocarse junto a `model-text.safetensors` y cargarse con la clase `Qwen35` de mlx-swift-lm, habilita la ruta multimodal completa del modelo base.
- Funcionamiento en modo texto sin visión: si el fichero no está presente, el modelo de texto se carga solo mediante `MLXLLM`, sin capacidades visuales.
- Descarga bajo demanda: está pensado como componente opcional asociado a la función "Scan Text" de la aplicación Rytability.
- Generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente, multilingüismo, audio y cualquier otra capacidad del modelo base: no disponibles en este repositorio, ya que dependen de los pesos de texto que no se incluyen.

## Casos de uso

- Distribución modular de aplicaciones multimodales en Apple Silicon: empaquetar el modelo de texto en la app y descargar el vision tower solo cuando el usuario activa la función de escaneo, reduciendo el tamaño de la descarga inicial en aproximadamente 0,62 GiB.
- Escaneo de texto en imágenes dentro de la app Rytability: el caso de uso declarado por el autor; la torre de visión alimenta al modelo de texto para interpretar capturas o documentos fotografiados.
- Asistentes de accesibilidad en dispositivo: transcripción y descripción de contenido visual sin enviar imágenes a un servidor, al ejecutarse localmente con MLX.
- Procesamiento de documentos en local: extracción de información de facturas, formularios o capturas, siempre que se disponga por separado del modelo de texto Qwen3.5-4B.
- Prototipado de pipelines VLM con MLX: útil para investigar la carga y descarga selectiva de componentes de un VLM y medir el impacto en memoria.
- Sustitución o actualización independiente del codificador visual: al estar aislado en su propio repositorio, permite versionar o reemplazar la torre de visión sin tocar los pesos de texto.
- Despliegue en macOS/iOS con mlx-swift-lm: integración en aplicaciones nativas mediante la clase `Qwen35` del framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra tarea, y tampoco se han publicado métricas de latencia o throughput para este artefacto.

## Requisitos de hardware

- VRAM para la torre de visión: aproximadamente 0,62 GiB en bfloat16, dado que el fichero pesa 667.061.465 bytes y no está cuantizado.
- Memoria total del sistema: hay que sumar los pesos de texto de Qwen3.5-4B, que no están incluidos en este repositorio y cuyo requisito no está disponible en la información proporcionada.
- GPU compatibles: no disponible. El formato es MLX, orientado a Apple Silicon con memoria unificada; no se documenta compatibilidad con CUDA.
- GPU de consumo: no hay datos específicos. El tamaño reducido de la torre (0,62 GiB) sugiere que no es el cuello de botella de memoria, pero el factor limitante será el modelo de texto asociado.
- Opciones de despliegue: MLX y mlx-swift-lm (clase `Qwen35` para la ruta VLM, `MLXLLM` para texto solo). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y no existen pesos GGUF publicados en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rybib/rytability-qwen35-vision | 333,5 M (solo vision tower) | No disponible | MLX safetensors | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| mlx-community/Qwen3.5-4B-4bit (origen de los pesos) | No disponible | No disponible | MLX, 4 bits | No disponible | HuggingFace |
| Otros vision towers (SigLIP, CLIP, etc.) | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento de ninguno de estos modelos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: solo contiene pesos de visión y no puede generar texto por sí mismo. Requiere los pesos de texto de Qwen3.5-4B y una librería que sepa combinar ambos (mlx-swift-lm con la clase `Qwen35`).
- Licencia: apache-2.0, según declara el autor, heredada del modelo Qwen3.5 original de Alibaba Cloud. El uso comercial está permitido por los términos de Apache 2.0, pero conviene verificar las condiciones de la ficha oficial de Qwen3.5, ya que el autor no las reproduce en su totalidad.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado con menos de un minuto de diferencia, lo que sugiere un artefacto puramente interno sin validación externa.
- Ausencia de documentación técnica: no hay información sobre la arquitectura del vision tower, sus datos de entrenamiento, su resolución de entrada, el preprocesado de imágenes esperado ni los idiomas soportados.
- Riesgo de alucinación: no evaluable con la información disponible; en cualquier caso, la generación de texto corresponde al modelo base y no a este repositorio.
- Dependencia de la versión de mlx-swift-lm: la integración se define por el nombre de los tensores (`vision_tower.*`) y por la clase `Qwen35`; cambios en la librería pueden romper la carga.
- Sin benchmarks ni métricas de rendimiento publicadas: no se puede estimar su precisión en OCR, descripción de imágenes o tareas VLM, ni compararla con alternativas.
- Formato propietario del ecosistema: los pesos solo son consumibles directamente desde MLX; no hay conversión a GGUF ni a safetensors estándar de PyTorch publicada en este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Rybib/rytability-qwen35-vision
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Origen de los pesos (MLX, 4 bits): https://huggingface.co/mlx-community/Qwen3.5-4B-4bit
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Informe tecnico de Qwen3.5-Omni (variante distinta, no especifica de este modelo): https://arxiv.org/pdf/2604.15804
- Guia de la serie Qwen3.5: https://explore.n1n.ai/blog/qwen3-5-model-series-2026-guide-2026-02-25
- Ficha de Qwen/Qwen3.5-35B-A3B (referencia de la serie): https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Ficha de Qwen/Qwen3.5-2B (referencia de la serie): https://huggingface.co/Qwen/Qwen3.5-2B
