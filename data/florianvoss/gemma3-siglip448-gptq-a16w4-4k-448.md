# florianvoss/Gemma3-SigLIP448-GPTQ-a16w4-4k-448

## Resumen

Gemma3-SigLIP448-GPTQ-a16w4-4k-448 es un paquete de ejecucion compilado para el acelerador SiMa Modalix, publicado por el usuario florianvoss dentro de la coleccion de validacion Neat 0.6.0. No es un checkpoint cargable con Transformers ni un fichero de pesos en safetensors, sino un runtime desempaquetado que contiene configuracion de despliegue, tokenizador, embeddings, escalas y 199 ejecutables MLA (Machine Learning Accelerator) listos para el SDK de SiMa.

El modelo subyacente combina un modelo de lenguaje Gemma 3 de 4.000 millones de parametros con un codificador de vision SigLIP448, lo que da lugar a un sistema image-text-to-text capaz de procesar imagenes de 448 x 448 pixeles junto a texto. La longitud de contexto declarada es de 4.096 tokens, con una ventana de atencion deslizante de 1.024 tokens y un tamano de grupo de prefill de 128.

Su relevancia es acotada pero especifica: demuestra el pipeline de compilacion y validacion de modelos multimodales de Gemma 3 sobre hardware de inferencia en el borde (edge) de SiMa.ai, e incorpora el grafo corregido de cache deslizante agrupada procedente del PR #295 de LLiMa. El repositorio ocupa 6,2 GB, no tiene descargas ni likes registrados y no ha superado todavia pruebas de generacion reales sobre el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: Gemma 3 (lenguaje) + codificador SigLIP448 (vision), compilado a grafo ModelGraph para MLA |
| Parametros totales | No disponible con exactitud; el componente de lenguaje es Gemma 3 4B (aproximadamente 4.000 millones) mas el codificador SigLIP448 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (ventana de atencion deslizante de 1.024 tokens) |
| Tipos de cuantizacion | Lenguaje: GPTQ simetrico INT4, group size 256, static act-order. Vision: RTN simetrico INT8 por canal de salida. Activaciones: BF16. Embeddings y cache KV: INT8 |
| Idiomas soportados | No disponible |
| Licencia | other (el checkpoint de origen no declara una licencia unificada; se aplican los terminos de los modelos upstream) |
| Formato de pesos | Paquete de runtime compilado: `devkit/` (configuracion, tokenizador, embeddings, escalas), `elf_files/` (199 ejecutables MLA) y `compilation.json`. No hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer multimodal que empareja un modelo de lenguaje Gemma 3 de 4.000 millones de parametros con un codificador visual SigLIP a resolucion 448 x 448. El paquete no contiene pesos en formato interpretable por PyTorch: todos los componentes han sido reconstruidos mediante la API nativa ModelGraph y compilados a 199 ejecutables MLA, con reutilizacion de filtros activada por defecto para los componentes de lenguaje y desactivada para los de vision. Los pesos de lenguaje llegan precuantizados en GPTQ INT4 simetrico con group size 256 y act-order estatico, mientras que los de vision usan cuantizacion RTN INT8 simetrica por canal de salida; las activaciones se mantienen en BF16 y los embeddings y la cache KV en INT8.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos ni sobre si hubo fases de RLHF o DPO. El modelo es una derivacion en cadena: `simaai/Gemma3-SigLIP448-GPTQ-Safetensors` se compila a partir de `stribomon/gemma3-siglip448`, que a su vez combina el modelo de lenguaje Gemma 3 4B con el codificador SigLIP448. La innovacion tecnica destacable de este paquete es la incorporacion del grafo corregido de cache deslizante agrupada (PR #295 de LLiMa): para la ventana de atencion de 1.024 tokens y un prefill n128, utiliza posiciones KV logicas en los indices 1023 y 1151 con una mascara estatica que garantiza a cada fila de consulta su ventana completa. La revision del codigo fuente de LLiMa usada en la compilacion es `d1b9bc85a2efde593d06667ac4d919dd410662fc`.

## Capacidades

- Generacion de texto y comprension de imagenes en una unica pasada (pipeline image-text-to-text), con entrada visual a 448 x 448 pixeles.
- Procesamiento de prompts largos hasta 4.096 tokens, con atencion deslizante de 1.024 tokens para el prefilling por grupos de 128.
- Ejecucion nativa sobre el acelerador SiMa Modalix mediante el runtime LLiMa, sin necesidad de GPU convencional.
- Soporte de cache KV cuantizada en INT8, orientado a reducir el consumo de memoria en inferencia embebida.
- Capacidades de tool calling, function calling, agentes o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modos especiales (thinking, audio, vision adicional): unicamente vision mediante SigLIP448; no se documentan otros.

## Casos de uso

- Inferencia multimodal en el borde: el paquete esta disenado para ejecutarse en SiMa Modalix con el runtime LLiMa, de modo que permite clasificar y describir imagenes de 448 x 448 junto a texto sin depender de GPUs de centro de datos ni de conectividad a la nube.
- Inspeccion visual en linea de fabricacion: con un contexto de 4.096 tokens se pueden encadenar varias descripciones de imagen y notas de operador en una misma sesion para detectar defectos, siempre que el modelo se integre en el pipeline de vision existente del acelerador.
- Asistentes de documentacion tecnica con imagenes: el modelo puede recibir capturas, diagramas o fotografias de 448 x 448 y generar texto asociado, util en herramientas internas de soporte donde la imagen aporta contexto.
- Prototipado de productos sobre hardware SiMa: sirve como referencia de compilacion y validacion para equipos que quieran portar otros modelos multimodales al SDK 3.0.0 y comparar grafos de cache deslizante.
- Validacion de pipelines de cuantizacion GPTQ INT4 + RTN INT8: el paquete documenta una combinacion concreta de cuantizacion por componente, por lo que resulta util para medir el impacto de esa mezcla en tareas de vision-lenguaje.
- Investigacion en atencion deslizante: al incorporar el grafo corregido del PR #295, permite reproducir comparativas antes/despues sobre prompts largos (aunque el autor indica que esas pruebas aun no se han ejecutado).
- Despliegue en entornos con restricciones de energia: al ejecutarse sobre un acelerador dedicado con pesos INT4/INT8 y cache KV INT8, encaja en escenarios de borde donde el consumo y la latencia son criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que la compilacion completa finalizo con codigo de salida 0 y que el despliegue verifico los 199 ficheros ELF y los recursos de runtime, incluido el ejecutable de cache deslizante agrupada. Las pruebas de generacion de texto e imagen sobre Modalix y las comparativas de prompt largo antes/despues no se han ejecutado para este paquete.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable en el sentido convencional. El paquete esta pensado para el acelerador SiMa Modalix, no para GPUs NVIDIA o AMD.
- GPU recomendadas: no disponibles. El modelo declara `inference: false` y no es cargable con Transformers ni con backends CUDA habituales.
- Compatibilidad con GPU de consumo: no disponible. Al ser un paquete de ejecutables MLA compilados para Modalix, no se puede desplegar en una RTX 4090 ni en tarjetas similares.
- Opciones de despliegue: runtime LLiMa sobre Modalix. Se requiere una version de LLiMa que incluya la misma correccion de prefill deslizante. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Tamano en disco: 6,2 GB para el repositorio completo (199 ejecutables MLA, devkit y `compilation.json`).
- Latencia y throughput estimados: no disponibles.
- Comando de despliegue documentado: `hf download florianvoss/Gemma3-SigLIP448-GPTQ-a16w4-4k-448 --local-dir Gemma3-SigLIP448-GPTQ-a16w4-4k-448` seguido de `llima run ./Gemma3-SigLIP448-GPTQ-a16w4-4k-448`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| florianvoss/Gemma3-SigLIP448-GPTQ-a16w4-4k-448 | Gemma 3 4B + SigLIP448 | 4.096 tokens | Paquete compilado MLA para Modalix | other (sin licencia unificada) | HuggingFace, 0 descargas |
| simaai/Gemma3-SigLIP448-GPTQ-Safetensors | Gemma 3 4B + SigLIP448 | No disponible | Safetensors cuantizado GPTQ | No disponible | HuggingFace |
| simaai/Gemma3-SigLIP448-GPTQ-a16w4 | Gemma 3 4B + SigLIP448 | No disponible | Pesos cuantizados a16w4 | No disponible | HuggingFace |
| stribomon/gemma3-siglip448 | Gemma 3 4B + SigLIP448 | No disponible | Safetensors | No disponible | HuggingFace |
| Google Gemma 3 (familia oficial) | 1B, 4B, 12B, 27B | Hasta 128K tokens en las variantes oficiales | Safetensors, GGUF, etc. | Terminos de uso de Gemma | Distribucion oficial de Google DeepMind |

## Limitaciones y advertencias

- No es un checkpoint cargable: la propia model card advierte que se trata de un paquete de runtime desempaquetado y no de un Safetensors interpretable por Transformers. Cualquier intento de cargarlo con `from_pretrained` fallara.
- Dependencia estricta de hardware: solo funciona sobre SiMa Modalix con un runtime LLiMa compatible. No hay ruta de despliegue en GPU, CPU o nube publica documentada.
- Validacion incompleta: la generacion de texto e imagen y las comparativas de prompt largo aun no se han probado en este paquete, por lo que su comportamiento real en produccion es desconocido. Existe un riesgo de fallos no detectados pese al exito de la compilacion.
- Requisito de version de runtime: si se usa un LLiMa sin la correccion de prefill deslizante, el comportamiento sera incorrecto. No existe entrada de mascara adicional en tiempo de ejecucion que lo compense.
- Licencia ambigua: la licencia declarada es "other" y el checkpoint de origen no define una licencia unificada. Se aplican los terminos y restricciones de los modelos upstream, lo que obliga a revisar cada eslabon de la cadena antes de cualquier uso comercial.
- Idioma y sesgos: no se dispone de informacion sobre idiomas soportados, sesgos conocidos ni comportamiento multilingue. Al no haberse ejecutado pruebas de generacion, no se puede evaluar el riesgo de alucinacion en tareas reales.
- Contexto limitado: 4.096 tokens es una ventana pequena comparada con las variantes oficiales de Gemma 3, lo que restringe tareas de resumen largo o dialogos extensos.
- Ausencia de adoptacion: cero descargas y cero likes en el momento de la consulta, sin senales de uso en produccion por parte de terceros.
- Repositorio sin garantias de mantenimiento: el paquete fue creado y actualizado con apenas un minuto de diferencia, sin historial de versiones posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/florianvoss/Gemma3-SigLIP448-GPTQ-a16w4-4k-448
- Checkpoint fuente en safetensors: https://huggingface.co/simaai/Gemma3-SigLIP448-GPTQ-Safetensors
- Modelo base alternativo: https://huggingface.co/simaai/Gemma3-SigLIP448-GPTQ-a16w4
- Modelo original con SigLIP448: https://huggingface.co/stribomon/gemma3-siglip448
- PR #295 de LLiMa (correccion de prefill con cache deslizante): https://github.com/sima-neat/llima/pull/295
- Pagina oficial de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Ficha del modelo en Palo Alto Networks AI Model Insights: https://insights-db.paloaltonetworks.com/models/simaai/gemma3-siglip448-a16w4/4d196f09607d402f0faff4e95275c5370557a1de/overview
- Registro de terceros del checkpoint fuente: https://essamamdani.com/ai-models/hf-simaai-gemma3-siglip448-gptq-safetensors
