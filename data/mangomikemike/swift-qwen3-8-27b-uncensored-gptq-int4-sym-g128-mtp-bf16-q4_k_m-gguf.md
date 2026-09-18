# mangomikemike/Swift-Qwen3.8-27B-Uncensored-GPTQ-Int4-sym-G128-MTP-BF16-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una conversion a formato GGUF del modelo `greglechin/Swift-Qwen3.8-27B-Uncensored-GPTQ-Int4-sym-G128-MTP-BF16`, publicada por el usuario mangomikemike y generada automaticamente con el espacio GGUF-my-repo de ggml.ai sobre llama.cpp. Se trata, por tanto, de una reempaquetado de pesos y no de un entrenamiento nuevo: el artefacto principal es un fichero GGUF cuantizado en Q4_K_M (16,8 GB de repo completo) que permite ejecutar el modelo en llama.cpp y en otros runtimes compatibles.

El modelo subyacente suma 27.320.697.856 parametros (unos 27,3 mil millones) y pertenece a la familia de nomenclatura Qwen3, con una variante denominada "Swift" y "Qwen3.8". Incorpora las etiquetas "uncensored" y "abliterated", lo que indica que se ha aplicado una modificacion de pesos orientada a reducir los rechazos y las restricciones de contenido del modelo original. Ademas, el identificador incluye MTP (multi-token prediction) y speculative-decoding, modulos y tecnicas asociados a la aceleracion de la decodificacion.

Su relevancia es practica: es una de las pocas distribuciones que combinan un modelo de ~27B "abliterated" con pesos en GPTQ Int4 simetrico (grupo 128) y su equivalente GGUF en Q4_K_M, con etiquetas que apuntan a soporte para vLLM y para hardware Intel Arc/XPU. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales de entrada, si bien la model card no lo documenta de forma explicita. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en la familia Qwen3 (designacion "Qwen3.8"); detalles no disponibles |
| Parametros totales | 27.320.697.856 (~27,3 mil millones) |
| Parametros activos | No aplicable / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (este repositorio); el modelo base usa GPTQ Int4 simetrico con grupo 128 y MTP en BF16 |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (licencia personalizada; enlace de licencia: https://ukisai.com/contact) |
| Formato de pesos | GGUF (Q4_K_M); el modelo base se distribuye en GPTQ Int4 |
| Tamano del repositorio | 16,8 GB |
| Modelo base | greglechin/Swift-Qwen3.8-27B-Uncensored-GPTQ-Int4-sym-G128-MTP-BF16 |
| Pipeline declarado | image-text-to-text |
| Fecha de publicacion | 2026-09-18 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento. Por la nomenclatura y el tamano (27,3B parametros) se trata de un transformer de la familia Qwen3, pero la model card no especifica numero de capas, dimension oculta, mecanismo de atencion ni tipo de tokenizador. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento en el modelo original.

Lo que si puede inferirse de las etiquetas y del identificador es lo siguiente: el modelo ha sido sometido a un proceso de "abliteration" (modificacion de pesos para eliminar comportamientos de rechazo) que da lugar a la variante "Uncensored"; incorpora un componente MTP (multi-token prediction) que habilita decodificacion especulativa para acelerar la generacion; y la cuantizacion del modelo base se realizo en GPTQ Int4 con cuantizacion simetrica y tamano de grupo 128, manteniendo el modulo MTP en BF16 para preservar su precision. La conversion a GGUF se efectuo con llama.cpp mediante el espacio GGUF-my-repo, sin que se documenten ajustes adicionales sobre los pesos.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Procesamiento de entrada de imagen y texto, segun el pipeline declarado `image-text-to-text` (no confirmado en la model card).
- Comportamiento "uncensored"/"abliterated": menor tasa de rechazos ante peticiones que el modelo original rechazaria.
- Decodificacion especulativa mediante el modulo MTP incluido en el modelo base.
- Compatibilidad declarada con vLLM, llama.cpp y runtimes GGUF; etiquetas especificas para hardware Intel Arc y XPU.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking" explicito: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: al ser una variante "abliterated", permite estudiar de forma controlada que comportamientos se eliminan al modificar los pesos y como afecta eso a las respuestas ante peticiones sensibles, comparando con el modelo base.
- Red teaming y evaluacion de riesgos: util para generar respuestas que un modelo alineado rechazaria y analizar los modos de fallo, siempre en un entorno aislado y con las salvaguardas externas adecuadas.
- Escritura creativa y narrativa sin restricciones tematicas: el modelo puede mantener conversaciones largas de ficcion con temas adultos o controvertidos sin las interrupciones tipicas de los modelos censurados.
- Despliegue local en estaciones de trabajo: gracias al formato GGUF Q4_K_M (16,8 GB), puede ejecutarse en una GPU de consumo con 24 GB o en configuracion mixta CPU/GPU mediante llama.cpp.
- Prototipado rapido de asistentes en ingles y chino: el soporte nativo de ambos idiomas lo hace adecuado para demos bilingues donde no se requiere una licencia comercial estandar.
- Aceleracion de inferencia en hardware Intel: las etiquetas Intel Arc y XPU sugieren que el modelo puede aprovecharse en equipos con GPU Intel mediante llama.cpp con backend SYCL, un nicho con menos opciones disponibles.
- Evaluacion de decodificacion especulativa: la presencia del modulo MTP permite medir ganancias de throughput frente a decodificacion autoregresiva estandar en el mismo hardware.
- Analisis de documentos con componente visual: si se confirma la capacidad multimodal, podria emplearse en tareas de descripcion o extraccion de informacion desde imagenes combinadas con texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a describir el proceso de conversion a GGUF y los comandos de uso con llama.cpp, sin incluir metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17-20 GB para el fichero Q4_K_M, en funcion del tamano de la cache KV y de la longitud de contexto configurada.
- GPU de consumo compatibles: RTX 4090 (24 GB) y RTX 3090 (24 GB) pueden alojar el modelo completo en VRAM. Las GPU con 16 GB, como la RTX 4080 o la Intel Arc A770, requeriran offload parcial a CPU o una cuantizacion mas agresiva.
- GPU profesionales: A100 (40/80 GB) y H100 (80 GB) ejecutan el modelo con margen amplio y permiten contextos largos.
- Hardware Intel: las etiquetas `intel-arc` y `xpu` indican compatibilidad prevista con GPU Intel Arc mediante backends SYCL/XPU de llama.cpp o de vLLM.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`, con los comandos `--hf-repo` y `--hf-file` documentados por el autor), importacion en Ollama, vLLM (soportado segun las etiquetas) y otros runtimes compatibles con GGUF.
- Contexto de ejemplo: la model card propone `-c 2048` en los ejemplos de servidor, valor orientativo y no un limite maximo confirmado del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mangomikemike/Swift-Qwen3.8-27B-Uncensored GGUF Q4_K_M (este) | 27,3B | GGUF Q4_K_M | no disponible | swift-open-license-1.0 | HuggingFace, 0 descargas |
| greglechin/Swift-Qwen3.8-27B-Uncensored GPTQ Int4 (modelo base) | 27,3B | GPTQ Int4 sym G128 + MTP BF16 | no disponible | swift-open-license-1.0 | HuggingFace |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion verificable sobre modelos comparables de la misma categoria (tamano similar, mismo enfoque "abliterated" o misma familia) en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad del modelo frente a alternativas.
- Comportamiento "abliterated": la modificacion de pesos puede degradar la coherencia, la utilidad general y la capacidad de seguir instrucciones, ademas de aumentar la probabilidad de generar contenido danino, sesgado o ilegal. No es adecuado para aplicaciones de cara al publico sin filtros externos.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica; como en cualquier LLM, la generacion de datos falsos es esperable.
- Sesgos conocidos: no documentados, pero el entrenamiento de la familia base puede arrastrar sesgos de genero, raza, religion o nacionalidad no evaluados en esta ficha.
- Idiomas limitados: solo se declaran ingles (en) y chino (zh); el rendimiento en castellano no esta verificado.
- Capacidad multimodal dudosa: el pipeline `image-text-to-text` proviene de los metadatos del Hub y la model card no describe ningun componente de vision, por lo que no debe asumirse sin verificacion.
- Licencia restrictiva: `swift-open-license-1.0` es una licencia personalizada cuyo texto no se adjunta; el enlace apunta a un formulario de contacto (https://ukisai.com/contact). El uso comercial queda condicionado a lo que indique el titular, por lo que se requiere consulta previa.
- Trazabilidad limitada: es una conversion automatica de un modelo a su vez derivado de otro, sin documentacion sobre el entrenamiento original ni sobre el proceso de abliteration.
- Sin validacion de la comunidad: 0 descargas y 0 interacciones en el momento de la consulta; no existe feedback independiente sobre su comportamiento real.
- Contexto maximo desconocido: no se puede planificar un caso de uso con contexto largo sin confirmar previamente el limite real del modelo.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mangomikemike/Swift-Qwen3.8-27B-Uncensored-GPTQ-Int4-sym-G128-MTP-BF16-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/greglechin/Swift-Qwen3.8-27B-Uncensored-GPTQ-Int4-sym-G128-MTP-BF16
- Espacio GGUF-my-repo utilizado para la conversion: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Enlace de licencia proporcionado por el autor: https://ukisai.com/contact
