# SkillFM/SkillFM

## Resumen

SkillFM es un modelo de investigación publicado de forma anónima para revisión a doble ciego en ICLR. No se trata de un modelo de lenguaje convencional, sino de un *codec* de habilidades (skills) para agentes, compuesto por un codificador, un decodificador y un módulo generativo de flujo (flow matching) que opera sobre un espacio latente de habilidades. El repositorio incluye los pesos de todos los componentes, junto con los tokenizadores y ficheros de configuración del entrenamiento.

El sistema se construye sobre dos modelos base de Qwen: `Qwen3-Embedding-4B` como backbone del codificador de habilidades (con LoRA fusionado) y `Qwen3-4B-Instruct-2507` como backbone del decodificador (también con LoRA fusionado). Una proyección lineal transforma el latente de habilidad en 16 tokens de prefijo que se inyectan en el decodificador. Sobre ese espacio latente se entrena un Conditional MeanFlow DiT, un modelo generativo basado en flow matching que permite muestrear nuevas representaciones de habilidad.

La relevancia del modelo es fundamentalmente académica: propone una arquitectura para comprimir, representar y generar habilidades de agente de forma modular, evaluada según los tags del repositorio en el entorno ALFWorld. Al ser un envío anónimo en revisión, no hay información pública sobre licencia, idiomas soportados ni resultados de benchmarks más allá de lo que indique el paper asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec de habilidades: encoder Qwen3-Embedding-4B (LoRA fusionado) + decoder Qwen3-4B-Instruct-2507 (LoRA fusionado) + proyección a 16 tokens de prefijo + Conditional MeanFlow DiT sobre el latente |
| Parametros totales | no disponible (el repo pesa 17,1 GB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (envío anónimo en revisión) |
| Formato de pesos | safetensors (`vector_to_prefix.safetensors`, `flow.safetensors`) y pesos de los backbones con LoRA fusionado |
| Modelos base | Qwen/Qwen3-4B-Instruct-2507, Qwen/Qwen3-Embedding-4B |
| Entorno de evaluacion | ALFWorld (según tags) |

## Arquitectura y entrenamiento

SkillFM implementa un esquema de compresión y generación de habilidades en dos niveles. El primer nivel es un codec: el codificador, basado en `Qwen3-Embedding-4B` con LoRA fusionado, transforma una habilidad en un vector latente; una proyección (`vector_to_prefix.safetensors`) convierte ese latente en 16 tokens de prefijo que condicionan al decodificador, construido sobre `Qwen3-4B-Instruct-2507` con LoRA fusionado, para reconstruir o ejecutar la habilidad. El segundo nivel es un modelo generativo `Conditional MeanFlow DiT` (`flow/flow.safetensors`) entrenado sobre el espacio latente de habilidades, lo que permite muestrear nuevas habilidades condicionadas.

Los detalles de entrenamiento de cada componente están en los ficheros `codec/args.json`, `codec/codec_metadata.json` y `flow/flow_config.json` incluidos en el repositorio. No se dispone de información pública sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones adicionales más allá de la propia formulación del codec y del flow matching condicional. La evaluación declarada se realiza en ALFWorld, un entorno de tareas de agente basadas en texto.

## Capacidades

- Codificación de habilidades de agente en un espacio latente continuo mediante un encoder basado en Qwen3-Embedding-4B.
- Decodificación de habilidades a partir de 16 tokens de prefijo inyectados en un decoder basado en Qwen3-4B-Instruct-2507.
- Generación de nuevas representaciones de habilidad mediante un Conditional MeanFlow DiT con flow matching sobre el latente.
- Ejecución de tareas de agente en entornos tipo ALFWorld (manipulación y navegación en texto).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: no disponibles de forma explícita (heredadas potencialmente de Qwen3, sin confirmar).
- Tool calling, visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en representaciones de habilidades para agentes: usar el codec para estudiar cómo se estructuran las habilidades en un espacio latente y cómo se reconstruyen desde 16 tokens de prefijo, facilitando análisis de interpretabilidad y composicionalidad.
- Generación de habilidades sintéticas: muestrear nuevas habilidades con el modelo de flow matching para aumentar la diversidad de comportamientos de un agente en entrenamiento, sin necesidad de recopilar trayectorias adicionales.
- Compresión de políticas de agente: almacenar comportamientos complejos como vectores latentes compactos en lugar de prompts o trayectorias completas, reduciendo el coste de memoria y de contexto en sistemas multiagente.
- Evaluación en ALFWorld: reproducir los experimentos del paper en tareas de manipulación y navegación textual, sirviendo como baseline para comparar métodos de representación de habilidades.
- Transferencia entre tareas: reutilizar habilidades codificadas en un entorno para inicializar o condicionar agentes en entornos relacionados, aprovechando el espacio latente compartido.
- Estudio de flow matching aplicado a agentes: emplear el DiT condicional como banco de pruebas para métodos generativos sobre latentes discretos o continuos en el dominio de habilidades.
- Integración en pipelines de investigación con `transformers`: cargar los componentes con la librería estándar y los tokenizadores incluidos para experimentar con el codec de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio indica que la evaluación se describe en el paper asociado (envío anónimo a ICLR), pero no se incluyen cifras en la model card.

## Requisitos de hardware

- Tamaño del repositorio: 17,1 GB en safetensors, lo que incluye encoder, decoder, proyección y modelo de flow.
- VRAM estimada para inferencia en precisión nativa (bf16/fp16): aproximadamente 34 GB para los pesos completos (17,1 GB × 2), más overhead de activaciones; se recomienda al menos 40-48 GB para cargar todos los componentes simultáneamente.
- GPU recomendadas: A100 80 GB, H100 80 GB o A6000 48 GB para ejecutar el pipeline completo sin cuantización.
- GPU de consumo: posible cargar componentes por separado (encoder o decoder de 4B en bf16 ≈ 8 GB cada uno) en RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque el pipeline completo requeriría cuantización u offloading, no documentado.
- Opciones de despliegue: `transformers` (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados para este formato de codec.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkillFM | no disponible (repo 17,1 GB) | no disponible | Codec de habilidades + flow matching sobre latente | no disponible | Hugging Face (anónimo) |
| Qwen3-4B-Instruct-2507 | 4B | no disponible en esta ficha | LLM instructivo generalista | no disponible en esta ficha | Hugging Face |
| Qwen3-Embedding-4B | 4B | no disponible en esta ficha | Embeddings de texto | no disponible en esta ficha | Hugging Face |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría (codecs de habilidades para agentes), dado que no hay benchmarks publicados ni modelos comparables identificados en la información proporcionada.

## Limitaciones y advertencias

- Modelo en revisión anónima: la licencia no está definida, por lo que no se puede asumir uso comercial permitido.
- Sin información sobre sesgos, datos de entrenamiento ni composición del dataset; el riesgo de sesgo es desconocido.
- Riesgo de alucinación no evaluado en la información disponible; al estar orientado a agentes en ALFWorld, la generalización fuera de ese entorno es incierta.
- Longitud de contexto e idiomas soportados no documentados; no se debe asumir el contexto nativo de Qwen3 sin verificación.
- El pipeline requiere cargar varios componentes (encoder, decoder, proyección, flow) y los tokenizadores correspondientes; un uso incorrecto de los tokenizadores puede degradar la reconstrucción de habilidades.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- La evaluación se limita, según los tags, a ALFWorld; no hay evidencia de rendimiento en otros entornos de agente.
- Al ser un envío a doble ciego, los enlaces al paper y a material adicional pueden no estar disponibles hasta la publicación.

## Enlaces

- Hugging Face: https://huggingface.co/SkillFM/SkillFM
- Modelo base del decoder: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base del encoder: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Paper: no disponible (envío anónimo en revisión)
