# groxaxo/Qwen3.6-35B-A3B-Heretic-exl3-6bpw

## Resumen

Qwen3.6-35B-A3B-Heretic-exl3-6bpw es un checkpoint cuantizado en formato EXL3 publicado por el usuario groxaxo sobre el modelo llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved, a su vez derivado de Qwen/Qwen3.6-35B-A3B. No se trata de un modelo entrenado desde cero, sino de una cuantizacion de 6 bits por peso (bpw) del modelo base, orientada a servir inferencia en runtime ExLlamaV3 con soporte de arquitectura MoE Qwen3.5 y de prediccion multi-token (MTP) nativa. El repositorio ocupa 27,9 GB y el recuento real de parametros en safetensors es de 13.905.330.176, cifra que no coincide con el "35B-A3B" del nombre.

El interes practico del checkpoint esta en tres frentes: conserva un contexto nativo de 262.144 tokens ampliable a 520.000 mediante YaRN factor 2, mantiene el encoder de vision nativo (pipeline image-text-to-text) y preserva el componente MTP con 3.113 tensores almacenados correspondientes a una capa, lo que habilita decodificacion especulativa con tres tokens de borrador. Ademas, al provenir de una variante "uncensored/heretic", presenta un comportamiento de rechazo reducido respecto al modelo original, algo relevante para investigacion en seguridad y para tareas creativas o analiticas sobre temas que los modelos alineados suelen declinar.

La relevancia inmediata es limitada en cuanto a validacion comunitaria: el repositorio acumula 0 descargas y 0 me gusta en el momento de la consulta, y el autor no reclama ningun resultado de benchmark ni puntuacion de rechazo para esta cuantizacion. La validacion publicada se limita a comprobaciones de servicio sobre dos RTX 3090 con caches KV Q8, plantilla Sharp y MTP3, documentadas en validation.json y serving-profile.json.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tag qwen3_5_moe; incluye encoder de vision nativo y componente MTP (prediccion multi-token) |
| Parametros totales | 13.905.330.176 segun el recuento real de safetensors del repositorio (el nombre del modelo indica 35B-A3B) |
| Parametros activos | no disponible (el nombre del modelo sugiere 3B activos) |
| Longitud de contexto | 262.144 tokens nativo; 520.000 tokens en el perfil de servicio con YaRN factor 2 |
| Tipos de cuantizacion | EXL3 de 6 bpw: 6 bits en el modelo de lenguaje, 6 bits en la cabeza de salida, 6 bits en el encoder de vision y 4 bits en el componente MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato EXL3 (libreria exllamav3) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base: un transformer con mezcla de expertos etiquetado como qwen3_5_moe, con vision encoder nativo y un modulo MTP integrado. Sobre esa arquitectura, el trabajo de groxaxo consiste en una cuantizacion EXL3 dividida por componentes: 6 bits por peso para el modelo de lenguaje, la cabeza de salida y el encoder de vision, y 4 bits para el componente MTP. El export contiene 3.113 tensores MTP almacenados, que corresponden a una unica capa de prediccion multi-token. El calibrado se realizo con 250 filas de 2.048 tokens extraidas del corpus de texto incluido con el conversor. Se conservan el tokenizer original, la plantilla de chat stock y los ficheros de preprocesado.

No se dispone de informacion sobre el entrenamiento del modelo subyacente: numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otra etapa de alineacion. La variante de la que deriva se describe como "uncensored" y "heretic", terminos que en la practica indican un proceso de ablacion o desalineacion deliberada de las capas de rechazo, pero el repositorio no documenta el metodo concreto. Tampoco se documentan innovaciones propias de esta cuantizacion mas alla del reparto de bits por componente y de la preservacion del MTP, que es precisamente lo que permite usar decodificacion especulativa nativa con tres tokens de borrador. El autor advierte que el runtime validado incorpora cambios locales y que no se probo hardware distinto ni un runtime upstream sin modificar.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text) gracias al encoder de vision nativo, cuantizado a 6 bits.
- Contexto largo: 262.144 tokens nativo y hasta 520.000 tokens por peticion en el perfil de servicio con YaRN factor 2; se probaron dos prompts concurrentes de mas de 500.000 tokens.
- Prediccion multi-token (MTP) nativa con un maximo de tres tokens de borrador, utilizable para decodificacion especulativa.
- Modelo de rechazo reducido ("uncensored/heretic"), heredado del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo de razonamiento explicito (thinking mode), audio o voz: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentacion extensa: con 262.144 tokens nativos y 520.000 con YaRN factor 2, el modelo puede ingerir manuales tecnicos, expedientes completos o bases de conocimiento enteras en una sola peticion, evitando troceado y recuperacion fragmentada.
- Procesamiento de documentos escaneados o capturas: el encoder de vision permite pasar imagenes junto al texto para transcribir, describir diagramas o extraer datos de formularios en el mismo contexto que el resto de la conversacion.
- Revision de repositorios de codigo grandes: la ventana de contexto admite volcar varios ficheros fuente o un arbol de proyecto completo para tareas de revision, explicacion y deteccion de incoherencias, sin depender de tool calling.
- Escritura creativa y narrativa sin filtros tematicos: la variante heretic reduce los rechazos, lo que resulta adecuado para ficcion con contenido adulto, terror o tematicas controvertidas donde los modelos alineados suelen bloquear la generacion.
- Investigacion en alineacion y seguridad: sirve como sujeto de comparacion para medir tasas de rechazo, deriva de comportamiento y eficacia de tecnicas de ablacion frente a la variante alineada original.
- Analisis de contenido sensible para moderacion o intelligence: al no rechazar sistematicamente el material, puede clasificar y resumir texto conflictivo que otros modelos se niegan a procesar, siempre dentro del marco legal aplicable.
- Despliegue on-premise con privacidad estricta: el perfil validado funciona sobre dos RTX 3090, hardware asequible que permite operar sin enviar datos a terceros, adecuado para entornos con requisitos de confidencialidad.
- Servicio de baja latencia con decodificacion especulativa: el componente MTP con tres tokens de borrador permite acelerar la generacion en el runtime EXL3, util para asistentes interactivos donde importa el tiempo hasta el primer token util.
- Procesamiento por lotes de contexto muy largo: pese al coste de prefill (decenas de minutos en contexto grande), es viable para tareas nocturnas de resumen o extraccion sobre corpus masivos donde la latencia no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no reclama ninguna puntuacion de benchmark upstream ni puntuaciones de rechazo para esta cuantizacion, y remite unicamente a validation.json para las comprobaciones de servicio.

## Requisitos de hardware

- Peso de los pesos en disco: 27,9 GB para el repositorio completo, coherente con una cuantizacion de 6 bpw sobre el modelo de lenguaje, cabeza de salida y encoder de vision, mas el componente MTP a 4 bits.
- VRAM estimada: no se publica una cifra cerrada. Como referencia, los pesos requieren aproximadamente 28 GB, a los que hay que sumar las caches KV. En el perfil de servicio validado se usan caches KV Q8 de objetivo y borrador con dos peticiones concurrentes y contexto de hasta 520.000 tokens.
- GPU recomendadas: el unico conjunto probado por el autor son dos RTX 3090. No se han validado otras GPU ni un runtime upstream sin modificar.
- Cabe en GPU de consumo: si, con dos RTX 3090 (48 GB agregados) segun la configuracion probada. Una unica GPU de 24 GB no es suficiente para los 27,9 GB de pesos mas las caches KV.
- Opciones de despliegue: runtime EXL3 compatible con MoE Qwen3.5 y MTP (ExLlamaV3). El script example_inference.py del repositorio permite lanzar el ejemplo de texto con `python example_inference.py /path/to/checkpoint` y, para el cache de contexto largo, con `--context 520000 --batch-size 2 --yarn-factor 2`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio; el formato es EXL3, no GGUF.
- Latencia y throughput: no se publican cifras de throughput. El autor advierte que el prefill de contexto grande en las dos RTX 3090 probadas puede tardar decenas de minutos, y que el timeout de peticion desplegado es de 7.200 segundos.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros totales | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| groxaxo/Qwen3.6-35B-A3B-Heretic-exl3-6bpw | Este modelo | 13.905.330.176 (recuento real) | 262.144 nativo; 520.000 con YaRN 2 | EXL3 6 bpw, safetensors | Apache-2.0 | HuggingFace, 0 descargas |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved | Modelo base del que se cuantiza | no disponible | no disponible | pesos sin cuantizar | no disponible | HuggingFace |
| Qwen/Qwen3.6-35B-A3B | Modelo original de la cadena | no disponible | no disponible | pesos sin cuantizar | no disponible | HuggingFace |
| groxaxo/Qwen3.6-35B-A3B-abliterated-exl3-6bpw | Variante hermana del mismo autor, tambien EXL3 6 bpw | no disponible | no disponible | EXL3 6 bpw, safetensors | no disponible | HuggingFace |
| AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4-DFlash | Mismo modelo heretic en NVFP4 con decodificacion especulativa DFlash | no disponible | no disponible | NVFP4, orientado a NVIDIA DGX Spark (GB10 / sm_121a) | no disponible | GitHub, requiere hardware Blackwell especifico |
| Qwen3.6-35B-A3B (NVFP4) de MiaAI-Lab | Version NVFP4 con despliegue vLLM listo para produccion | no disponible | no disponible | NVFP4, contenedor Docker con vLLM | no disponible | GitHub |

La comparacion cuantitativa de rendimiento no es posible: ninguno de los repositorios consultados publica resultados de benchmarks comparables, y el autor de este checkpoint declina explicitamente aportar puntuaciones. La diferencia relevante entre alternativas es de formato y hardware objetivo: EXL3 esta pensado para ExLlamaV3 y permite ejecucion en GPUs Ampere como la RTX 3090, mientras que las variantes NVFP4 estan atadas a hardware Blackwell y, en el caso de AEON-7, especificamente al DGX Spark.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni ninguna otra prueba, ni puntuaciones de rechazo. Cualquier evaluacion de calidad debe realizarla el usuario.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 me gusta, por lo que no existe evidencia independiente de su comportamiento en produccion.
- Modelo "uncensored/heretic": la reduccion de rechazos implica menor presencia de salvaguardas. No es adecuado para aplicaciones de cara al publico sin una capa de moderacion externa, y su uso puede entrar en conflicto con normativa de contenido.
- Riesgo de alucinacion: no medido ni documentado. Como en cualquier modelo generativo, existe riesgo de fabricacion de datos, agravado por la ausencia de evaluaciones.
- Perdida de calidad por cuantizacion: la cuantizacion a 6 bpw del modelo de lenguaje y a 6 bits del encoder de vision puede degradar tareas perceptivas finas o de razonamiento preciso respecto al modelo base sin cuantizar. No se aporta comparacion con el original.
- Contexto y rendimiento: aunque se anuncia soporte de 520.000 tokens con YaRN factor 2, el prefill correspondiente puede tardar decenas de minutos y el timeout desplegado es de 7.200 segundos, lo que descarta su uso interactivo en esos regimenes.
- Dependencia de un runtime especifico: requiere un runtime EXL3 con soporte de MoE Qwen3.5 y MTP. El autor advierte que el runtime validado incluye cambios locales y que no se probo un runtime upstream sin modificar.
- Hardware validado muy restringido: solo se probo en dos RTX 3090. No hay garantias de funcionamiento en otras GPU, ni datos de rendimiento fuera de esa configuracion.
- Plantilla de chat: la plantilla stock incluida en el checkpoint no es la plantilla Sharp utilizada en el despliegue validado, de modo que los resultados pueden diferir de las comprobaciones publicadas.
- Idiomas: no se declara ningun idioma soportado, por lo que se desconoce la cobertura multilingue real mas alla de la del modelo base.
- Discrepancia de nomenclatura: el nombre indica 35B de parametros totales y 3B activos, pero el recuento real de safetensors es de 13.905.330.176 parametros. Conviene verificar la arquitectura real antes de dimensionar infraestructura.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el modelo deriva de pesos de Qwen y de una variante de llmfan46; se debe mantener la atribucion correspondiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/groxaxo/Qwen3.6-35B-A3B-Heretic-exl3-6bpw
- Modelo base: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved
- Modelo original de la cadena: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante hermana del mismo autor (abliterated, EXL3 6 bpw): https://huggingface.co/groxaxo/Qwen3.6-35B-A3B-abliterated-exl3-6bpw
- Ficheros del repositorio: https://huggingface.co/groxaxo/Qwen3.6-35B-A3B-abliterated-exl3-6bpw/tree/main
- Variante REAP 0.30 en LLM Explorer: https://llm-explorer.com/model/groxaxo%2FQwen3.6-35B-A3B-Heretic-REAP-0.30,5T9UcMVWDav5VeDDAbWirv
- Despliegue NVFP4 con decodificacion especulativa DFlash (GitHub): https://github.com/AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4-DFlash
- Despliegue NVFP4 sobre vLLM (GitHub): https://github.com/MiaAI-Lab/Qwen3.6-35B-A3B-NVFP4-vLLM
- Ficheros de validacion citados en el repositorio: validation.json, serving-profile.json y provenance.json (incluidos en el propio repositorio de HuggingFace)
