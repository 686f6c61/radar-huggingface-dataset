# SinhalaMMLU-SharedTask/team-nexus-gemma-4-e4b-it-text

## Resumen

`team-nexus-gemma-4-e4b-it-text` es una variante derivada de `google/gemma-4-E4B-it` en la que se han eliminado las torres de vision y audio, conservando exclusivamente la parte de lenguaje. Lo publica el equipo Team Nexus en el contexto del shared task SinhalaMMLU, y su proposito es disponer de un modelo de texto puro, mas ligero y sencillo de desplegar, para tareas de evaluacion en cingales (sinhala). No se trata de un fine-tuning: todos los tensores del modelo de lenguaje se copian sin modificar desde el checkpoint original y el script de extraccion verifica que cada tensor coincide con su fuente.

El modelo conserva la clase `Gemma4ForCausalLM` y un total de 7.463.013.376 parametros en bfloat16, lo que corresponde a la variante "E4B" (efectiva de 4B) de la familia Gemma 4, presumiblemente con arquitectura de mezcla de expertos o con parametros efectivos reducidos, aunque la model card no detalla la arquitectura interna. El repositorio ocupa 15,0 GB y la licencia es Apache 2.0, heredada del modelo base.

Su relevancia es acotada pero clara: sirve como punto de partida reproducible para experimentos de evaluacion en cingales sin la sobrecarga de los modulos multimodales, y como ejemplo de extraccion limpia y verificable de un submodelo a partir de un checkpoint multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clase `Gemma4ForCausalLM`); variante "E4B" del modelo base Gemma 4; detalles internos no disponibles |
| Parametros totales | 7.463.013.376 (bf16) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | cingales (`si`) declarado en la model card; capacidades multilingues del modelo base no documentadas aqui |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una extraccion estructural del checkpoint `google/gemma-4-E4B-it` (commit `ee0ef6023621cff504d758262d4e04895a5af4a2`). Se han eliminado los modulos `vision_tower`, `audio_tower`, `embed_vision` y `embed_audio`, dejando unicamente el modelo de lenguaje. Cada tensor restante se copia sin cambios y el script `training/scripts/make_text_only.py` del repositorio `SinhalaMMLU-SharedTask/team-nexus` comprueba la igualdad tensor a tensor con la fuente.

No hay fine-tuning ni entrenamiento adicional: no se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO especificas para esta variante. Cualquier informacion sobre el preentrenamiento y el alineamiento del modelo corresponde al modelo base de Google, que no se detalla en la model card proporcionada. Tampoco se documentan innovaciones tecnicas propias mas alla del procedimiento de extraccion verificada.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base `gemma-4-E4B-it`.
- Razonamiento y respuesta a preguntas en formato instruct, segun la variante `-it` del modelo original.
- Capacidades multilingues del modelo base no documentadas en esta ficha; el unico idioma declarado explicitamente es el cingales.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision y audio: eliminados explicitamente en esta variante (torres y embeddings removidos).
- Modo "thinking" u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion en el shared task SinhalaMMLU: el modelo esta pensado como linea base de texto para responder preguntas de opcion multiple en cingales, sin la complejidad de cargar modulos multimodales.
- Investigacion sobre extraccion de submodelos: sirve como referencia reproducible de como aislar la parte de lenguaje de un checkpoint multimodal verificando la integridad tensor a tensor.
- Despliegue en entornos con VRAM limitada: al eliminar las torres de vision y audio, reduce el peso en memoria respecto al modelo base, lo que facilita su carga en GPUs de gama alta de consumo con cuantizacion externa.
- Generacion de texto en cingales para prototipos: util para experimentos de traduccion, resumen o respuesta a preguntas en dicho idioma, siempre que se valide la calidad real del modelo base en esa lengua.
- Pipeline de evaluacion automatizada: integrable con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`, lo que permite incorporarlo a harness de benchmarks con poco codigo.
- Base para fine-tuning posterior: al ser un modelo de texto puro con licencia Apache 2.0, puede servir de punto de partida para ajustes supervisados en cingales sin arrastrar pesos multimodales innecesarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15 GB solo para pesos (7,46 mil millones de parametros a 2 bytes), mas el coste de activaciones y cache KV, que depende de la longitud de contexto (no documentada).
- VRAM estimada en cuantizacion de 8 bits: en torno a 8 GB para pesos, mas overhead.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4-5 GB para pesos, mas overhead; requiere conversion externa a GGUF o AWQ/GPTQ, no incluida en el repositorio.
- GPU recomendadas: A100 40 GB o H100 para bf16 sin cuantizar con contexto largo; RTX 4090 (24 GB) para bf16 en contextos moderados; RTX 3090/4080 (16-24 GB) para cuantizaciones de 8 bits.
- GPU de consumo: cabe en tarjetas de 16 GB o mas en cuantizacion de 8 bits, y en tarjetas de 8 GB en cuantizacion de 4 bits, siempre con conversion previa.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (soporte nativo documentado); vLLM, TGI, llama.cpp u Ollama requeririan conversion o soporte especifico de la arquitectura Gemma 4, no confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| team-nexus-gemma-4-e4b-it-text | 7,46 B | no disponible | Apache 2.0 | Extraccion texto-only de Gemma 4 E4B-it; sin fine-tuning |
| google/gemma-4-E4B-it | no disponible (variante E4B) | no disponible | Apache 2.0 (segun esta ficha) | Modelo base multimodal (texto, vision, audio) |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de comparaciones publicadas en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado para cingales: hereda el comportamiento del modelo base y el idioma declarado en la model card no garantiza calidad especifica en esa lengua.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mitigaciones adicionales.
- Sesgos del modelo base no evaluados ni documentados en esta variante.
- Longitud de contexto no disponible, lo que impide planificar tareas de contexto largo con garantias.
- Sin soporte de vision ni audio por diseno; cualquier caso de uso multimodal queda fuera de alcance.
- Aunque la licencia es Apache 2.0, conviene revisar los terminos del modelo base de Google para uso comercial, ya que la model card solo indica que se hereda la licencia original.
- El modelo no incluye cuantizaciones publicadas ni artefactos GGUF; el despliegue eficiente requiere trabajo adicional de conversion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al modelo base ni frente a alternativas.
- El repositorio tiene muy poca traccion (24 descargas, 0 likes) y fue creado en octubre de 2026; no hay garantias de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SinhalaMMLU-SharedTask/team-nexus-gemma-4-e4b-it-text
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del equipo con el script de extraccion: https://huggingface.co/SinhalaMMLU-SharedTask/team-nexus
