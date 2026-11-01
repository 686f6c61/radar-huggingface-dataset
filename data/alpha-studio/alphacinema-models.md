# alpha-studio/alphacinema-models

## Resumen

Alpha Cinema model pack es un repositorio de pesos empaquetados por alpha-studio para su complemento de Blender (antes AlphaMotion), una herramienta que genera movimiento corporal a partir de texto y restricciones. No se trata de un modelo único entrenado por alpha-studio, sino de una recopilación de pesos de terceros: el modelo de difusión de movimiento Kimodo-SOMA-RP-v1.1 de NVIDIA, un codificador de texto derivado de Llama 3 8B Instruct adaptado con LLM2Vec y los esqueletos SOMA en formato JSON. El paquete se descarga desde el propio complemento con un commit fijado y verificación SHA-256 mediante `manifest.json`.

El componente de mayor tamano es el codificador de texto, con 7.546.867.712 parametros en safetensors, distribuido tambien como GGUF en cuantizacion Q8_0. El modelo de difusion Kimodo es el encargado de producir el movimiento esqueletal sobre el esqueleto SOMA, mientras que el LLM actua como codificador de instrucciones textuales. La licencia es un agregado denominado `alphacinema-model-pack`, que remite a las licencias individuales de cada archivo (NVIDIA Open Model License, Meta Llama 3 Community License y Apache-2.0 para los esqueletos).

Su relevancia es acotada pero concreta: cubre el caso de uso de generacion de animacion corporal desde texto dentro de Blender, con ejecucion en GPU NVIDIA mediante nucleos C++/CUDA propios del complemento. No es un modelo de proposito general ni un LLM conversacional, y su uso fuera del complemento requiere revisar las licencias de cada componente por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de componentes: modelo de difusion de movimiento (Kimodo, esqueleto SOMA) y codificador de texto LLM2Vec sobre Llama 3 8B Instruct |
| Parametros totales | 7.546.867.712 (safetensors, correspondientes al codificador de texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) para el codificador de texto; BF16 como base de origen; el modelo de difusion se distribuye sin cuantizar segun la model card |
| Idiomas soportados | no disponible |
| Licencia | alphacinema-model-pack (agregado); componentes individuales: NVIDIA Open Model License, Meta Llama 3 Community License, Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El paquete combina dos piezas con funciones distintas. Por un lado, `motion/Kimodo-SOMA-RP-v1.1/` contiene el modelo de difusion de movimiento de NVIDIA, con su configuracion y estadisticas, que opera sobre el esqueleto SOMA (articulaciones, jerarquia de padres y posiciones de reposo exportadas a JSON desde el codigo de Kimodo). Por otro, `text/Llama-3-Kimodo-AlphaCinema-Q8_0.gguf` es el codificador de texto de Kimodo: un Llama 3 8B Instruct adaptado mediante LLM2Vec, convertido a Q8_0 en este repositorio a partir de la version BF16 publicada por LocalAI-io. El tokenizador se incluye aparte como `text/tokenizer.gguf`.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, ya que alpha-studio no entrena estos modelos y la model card no aporta esos detalles. La innovacion tecnica del paquete no esta en el entrenamiento sino en el empaquetado reproducible: descarga fijada a un commit, manifiesto con tamano y SHA-256 por archivo, y ejecucion de los pesos mediante nucleos C++/CUDA propios del complemento, que toma cuBLAS de la rueda `nvidia-cublas-cu12` de PyPI en lugar de incluirlo en el repositorio.

## Capacidades

- Generacion de movimiento corporal (text-to-motion) a partir de descripciones textuales y restricciones, sobre el esqueleto SOMA.
- Codificacion de instrucciones en lenguaje natural mediante LLM2Vec sobre Llama 3 8B Instruct.
- Integracion directa con Blender como complemento (Alpha Cinema), con descarga y verificacion automatica de pesos.
- Ejecucion en GPU NVIDIA mediante nucleos C++/CUDA propios del complemento.
- Exportacion de esqueletos SOMA en JSON (articulaciones, padres, posiciones de reposo).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Animacion de personajes en Blender: el complemento usa Kimodo para generar movimiento corporal a partir de una descripcion textual y aplicarlo sobre un rig SOMA, reduciendo el trabajo manual de keyframing en prototipos y previsiones.
- Previsualizacion rapida de escenas: para blockouts de animacion donde se necesita movimiento plausible sin captura de movimiento, el modelo de difusion genera clips corporales que sirven como referencia de timing y pose.
- Generacion de variantes de movimiento: a partir de una misma instruccion textual y distintas restricciones, se pueden producir varias propuestas de animacion para elegir en direccion o montaje.
- Pipelines de produccion con verificacion de integridad: el `manifest.json` con SHA-256 por archivo permite fijar versiones de pesos en un estudio y detectar corrupciones o sustituciones en entornos compartidos.
- Investigacion en text-to-motion: el paquete expone el modelo Kimodo de NVIDIA con su configuracion y estadisticas, util para reproducir experimentos o comparar codificadores de texto en tareas de movimiento.
- Desarrollo de herramientas DCC: el codificador Llama 3 + LLM2Vec en GGUF Q8_0 puede reutilizarse en otras aplicaciones que necesiten embeddings de instrucciones para control de animacion, siempre que se respete la licencia de Meta Llama 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU NVIDIA obligatoria: el complemento ejecuta los modelos con nucleos C++/CUDA propios y depende de cuBLAS de la rueda `nvidia-cublas-cu12`.
- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el codificador de texto en Q8_0 ronda los 8 GB de pesos, y el modelo de difusion de movimiento anade consumo adicional no cuantificado en la informacion disponible.
- GPU recomendadas: no disponibles. Por el perfil de memoria del codificador en Q8_0, se situa en el rango de GPUs de 16-24 GB o superiores; no se confirma compatibilidad con GPUs de consumo de gama media.
- Despliegue: a traves del complemento Alpha Cinema para Blender. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el GGUF se usa con el runtime propio del complemento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alpha Cinema model pack | 7.546.867.712 (codificador de texto) + difusion Kimodo | no disponible | Text-to-motion en Blender | alphacinema-model-pack (agregado de NVIDIA Open Model License, Llama 3 Community License y Apache-2.0) | HuggingFace, 139 descargas |
| Kimodo-SOMA-RP-v1.1 (NVIDIA) | no disponible | no disponible | Text-to-motion sobre esqueleto SOMA | NVIDIA Open Model License | HuggingFace (origen del componente de movimiento) |
| Llama-3-Kimodo-GGML (LocalAI-io) | 8B (familia Llama 3) | no disponible | Codificador de texto para Kimodo | Meta Llama 3 Community License | HuggingFace (origen del componente de texto) |

## Limitaciones y advertencias

- El repositorio no contiene modelos propios de alpha-studio: son pesos de terceros empaquetados, y cada archivo se rige por su licencia original. El uso comercial exige revisar `LICENSES/` y, en particular, la Llama 3 Acceptable Use Policy para el codificador de texto.
- La licencia agregada `alphacinema-model-pack` no sustituye a las licencias individuales; usos fuera del complemento requieren cumplir cada licencia por separado.
- Dependencia de GPU NVIDIA y de cuBLAS externo: no hay soporte documentado para CPU, AMD, Apple Silicon ni otros aceleradores.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de calidad del movimiento generado; no hay benchmarks publicados.
- Idiomas soportados no declarados; el codificador deriva de Llama 3, pero no se confirma el comportamiento multilingue en las instrucciones de movimiento.
- El paquete esta pensado para descargarse desde el complemento con un commit fijado; consumirlo manualmente exige verificar el `manifest.json` para evitar ficheros corruptos o incompletos.
- No hay informacion sobre longitud de contexto ni sobre limites de duracion de los clips de movimiento generados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alpha-studio/alphacinema-models
- Licencias del paquete: https://huggingface.co/alpha-studio/alphacinema-models/blob/main/LICENSES/NOTICE.txt
- Kimodo-SOMA-RP-v1.1 (NVIDIA): https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1.1
- Llama-3-Kimodo-GGML (LocalAI-io): https://huggingface.co/LocalAI-io/Llama-3-Kimodo-GGML
