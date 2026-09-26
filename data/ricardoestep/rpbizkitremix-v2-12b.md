# RicardoEstep/RPBizkitRemiX-v2-12B

## Resumen

RPBizkitRemiX-v2-12B es un modelo de lenguaje de 12.247.782.400 parametros publicado por el usuario RicardoEstep en HuggingFace. No se trata de un entrenamiento desde cero, sino de un "merge" (fusion de pesos) construido en dos fases sobre Mistral Nemo Instruct 2407 en su variante "abliterated" de natong19. La primera fase combina cuatro checkpoints propios del autor (RPBizkit-v2, v6 y v9 de 12B, mas el modelo base) mediante el algoritmo DARE TIES implementado en Mergekit; la segunda aplica un merge selectivo de una LoRA de "re-abiliteracion" (nbeerbower/Mistral-Nemo-12B-abliterated-LORA) con escalados diferenciados por tipo de capa (atencion, MLP y vocabulario).

El modelo hereda por tanto la arquitectura Mistral Nemo: un transformer decoder-only de aproximadamente 12.000 millones de parametros, con atencion de consultas agrupadas (GQA), tokenizador de 131.072 entradas y una ventana de contexto que el autor afirma haber dejado operativa hasta 128K tokens tras corregir el tamano de embeddings y el tokenizador. El ajuste de la LoRA usa escalas muy bajas (0,12 en atencion, 0,06 en MLP y 0,03 en lm_head), de modo que la contribucion de la LoRA es un matiz sobre el merge previo y no una reescritura de pesos.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo representativo del ecosistema de "modelos mezclados" por la comunidad, donde el valor esta en la receta de fusion y no en el entrenamiento. Por otro, es un caso de uso deliberadamente sin censura ("not-for-all-audiences"), orientado a roleplay creativo, con recomendaciones de temperatura baja (1,0-1,15) y plantilla Alpaca con entradas RAW. No dispone de licencia declarada, de benchmarks publicados ni de datos de idiomas soportados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral Nemo), con atencion de consultas agrupadas (GQA) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens segun el autor; sin verificacion independiente (no disponible) |
| Tipos de cuantizacion | El autor menciona "Quantized Model, Here []()" sin enlace; no disponible la lista concreta. Formato original en bfloat16, por lo que es cuantizable a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | no disponible (el modelo base Mistral Nemo es multilingue, pero no hay declaracion explicita para este merge) |
| Licencia | no disponible |
| Formato de pesos | safetensors (serializacion segura) |
| Libreria | transformers |
| Tamano del repositorio | 24,5 GB |
| Tokenizador | 131.072 entradas (vocabulario Mistral Nemo) |
| Metodo de construccion | Mergekit con `merge_method: dare_ties` + merge manual de LoRA con escalado hibrido |
| Fecha de creacion | 25 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido clasico: el modelo es el resultado de una cadena de fusiones de pesos. La parte uno usa Mergekit con `merge_method: dare_ties`, `tokenizer_source: base` y `dtype: bfloat16` sobre `natong19/Mistral-Nemo-Instruct-2407-abliterated` como modelo base. Los pesos asignados son 0,30 para RPBizkit-v9-12B (densidad 0,45), 0,59 para RPBizkit-v6-12B (densidad 0,7) y 0,11 para RPBizkit-v2-12B (densidad 0,22), con `normalize: true`, `int8_mask: false` y semilla aleatoria 5318008. DARE (Drop And REscale) elimina una fraccion de los parametros delta antes de aplicarlos y reescala el resto, lo que combinado con TIES (que resuelve conflictos de signo y redundancia) reduce la interferencia entre checkpoints. El modelo dominante en la mezcla es, con diferencia, la variante v6.

La parte dos es un script Python propio que carga el merge como modelo base, aplica `nbeerbower/Mistral-Nemo-12B-abliterated-LORA` con PEFT y sobrescribe el factor de escala del adaptador por tipo de capa antes de fusionarlo: 0,12 en `q_proj`, `k_proj`, `v_proj` y `o_proj`; 0,06 en `up_proj`, `down_proj` y `gate_proj`; y 0,03 en `lm_head`. Ademas, el script redimensiona los embeddings a 131.072 entradas si no coinciden y vuelve a atar los pesos (`tie_weights`) para preservar el soporte de contexto largo. El resultado se guarda con `safe_serialization=True` en bfloat16. No se documenta ninguna innovacion algorítmica propia: el interes tecnico esta en la receta de escalado hibrido y en el orden de las operaciones (merge primero, LoRA despues).

## Capacidades

- Generacion de texto autoregresiva en la linea de Mistral Nemo Instruct, con sesgo hacia estilos conversacionales y de rol.
- Dialogo multi-turno con ventana de contexto declarada de 128K tokens, adecuada para conversaciones muy largas o documentos extensos.
- Escritura creativa y roleplay: el autor describe el comportamiento como "hiperactivo" y con "cierta humanidad", y lo recomienda para "Creative RPs" con temperaturas bajas (1,0-1,15).
- Respuestas descensuradas por construccion: el pipeline completo (base "abliterated" mas LoRA de re-abiliteracion) esta diseñado para reducir rechazos. No obstante, el autor advierte que a veces no actua como un modelo completamente sin censura y que puede "regañar" al usuario.
- Capacidad de instrucciones generales heredada del modelo base Instruct, aunque no hay evaluacion publicada de su calidad tras el merge.
- Soporte de tool calling / function calling: no documentado en la informacion disponible. Al derivar de un Instruct con plantilla conversacional, es plausible cierto soporte, pero no esta verificado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no disponibles (modelo puramente de texto).
- Idiomas: no declarados; depende de las capacidades multilingues del modelo base Mistral Nemo, no verificadas para este merge.
- Modo "thinking" o decodificacion especulativa: no disponible.

## Casos de uso

- Roleplay conversacional y narrativa interactiva: es el caso de uso declarado por el autor. El merge esta ajustado para mantener personajes coherentes en conversaciones largas gracias al contexto de hasta 128K tokens y a las temperaturas recomendadas (1,0-1,15), que evitan respuestas demasiado planas en texto creativo.
- Generacion de ficcion y escritura asistida sin filtros tematicos: util para autores que necesitan explorar escenas de violencia, conflicto o contenido adulto sin que el modelo rechace la peticion. El caracter "not-for-all-audiences" del repositorio lo situa explicitamente en ese nicho.
- Prototipado rapido de asistentes conversacionales en local: al ser un denso de 12B, cabe en una GPU de consumo con cuantizacion de 4 bits, lo que permite levantar un chatbot privado con llama.cpp u Ollama sin depender de APIs externas.
- Investigacion sobre tecnicas de model merging: sirve como caso de estudio reproducible de DARE TIES combinado con merge selectivo de LoRA y escalado por tipo de capa, incluida la correccion de embeddings y el re-atable de pesos.
- Analisis de documentos largos con contexto extendido: si el soporte de 128K tokens se confirma, permite resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada.
- Experimentacion con personalidad y tono en modelos ajustados: el comportamiento "hiperactivo" y potencialmente confrontacional descrito por el autor es un material interesante para estudiar como las fusiones de pesos afectan al estilo y a la adherencia al personaje.
- Base para posteriores merges o fine-tuning de la comunidad: los checkpoints intermedios (RPBizkit-v2, v6 y v9) y esta mezcla pueden reutilizarse como componentes en nuevas recetas.
- Generacion de datos sinteticos de estilo conversacional: para crear corpus de dialogo con tono informal, siempre que el contenido generado no requiera filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones de arena o de preferencia humana, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

Los siguientes valores son estimaciones derivadas del numero de parametros (12.247.782.400) y no han sido verificados por el autor:

- VRAM estimada para los pesos en precision bfloat16: en torno a 24,5 GB, mas cache KV. Con contexto completo de 128K la cache KV puede anadir varios GB adicionales, por lo que se recomienda una GPU de 40-80 GB para contexto largo.
- Cuantizacion de 8 bits (int8/FP8): aproximadamente 12-13 GB de pesos.
- Cuantizacion de 4 bits (GGUF Q4_K_M o AWQ/GPTQ 4-bit): aproximadamente 7-8 GB de pesos, lo que lo hace apto para GPU de consumo.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para precision completa y contexto largo; RTX 4090 (24 GB) para bfloat16 con contexto moderado o cuantizacion de 8 bits; RTX 3090/4080 (16-24 GB) y tarjetas de 8-12 GB solo con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits en GPUs de 8 GB o mas; con bfloat16 requiere al menos 24 GB y una gestion cuidadosa del contexto.
- Opciones de despliegue: al ser un modelo transformers con pesos safetensors, es compatible con vLLM, Text Generation Inference (TGI), llama.cpp y Ollama (previo conversion a GGUF) y con Transformers mas PEFT para reproducir la receta de merge. El repositorio declara compatibilidad con `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles. Solo pueden estimarse por comparacion con otros densos de 12B, y dependen por completo del hardware y de la cuantizacion.
- Nota sobre la plantilla: el autor indica que la plantilla recomendada es Alpaca con entradas "RAW" y que los ficheros de configuracion estan ajustados para no usar ninguna plantilla de chat. Conviene respetarlo al desplegar para reproducir el comportamiento esperado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RPBizkitRemiX-v2-12B | 12.247.782.400 | 128K declarados por el autor | Denso, merge DARE TIES + LoRA | no disponible | HuggingFace, 0 descargas |
| natong19/Mistral-Nemo-Instruct-2407-abliterated | no disponible | no disponible | Denso, base del merge; fine-tuning de Mistral Nemo | no disponible | HuggingFace |
| RicardoEstep/RPBizkit-v9-12B | no disponible | no disponible | Denso, componente del merge (peso 0,30) | no disponible | HuggingFace |
| nbeerbower/Mistral-Nemo-12B-abliterated-LORA | no disponible (adaptador) | no disponible | LoRA sobre Mistral Nemo, aplicada con escala hibrida | no disponible | HuggingFace |
| Mistral-Nemo-Instruct-2407 (referencia de la familia) | 12.000 millones aprox. | 128K tokens | Denso, modelo Instruct oficial | Apache 2.0 | HuggingFace, ampliamente desplegado |

No hay datos publicados de rendimiento para ninguno de los merges de la comparativa, por lo que la eleccion entre ellos solo puede hacerse por evaluacion empirica propia. La diferencia mas relevante frente al modelo oficial de Mistral es la licencia: el modelo original es Apache 2.0, mientras que la licencia de este merge no esta declarada.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no hay condiciones de uso publicadas, lo que impide determinar si se permite el uso comercial. En la practica, esto hace desaconsejable su adopcion en produccion sin aclaracion previa del autor.
- El repositorio esta etiquetado como "not-for-all-audiences": el modelo esta diseñado explicitamente para reducir rechazos y puede generar contenido violento, sexual o potencialmente danino. Requiere moderacion externa si se expone a usuarios finales.
- Riesgo elevado de alucinacion: no hay evaluaciones de fidelidad factual, y las fusiones de pesos del estilo DARE TIES tienden a degradar la coherencia factual respecto a un modelo Instruct entrenado de forma convencional.
- Sin benchmarks ni evaluaciones publicadas: no es posible comparar su calidad objetivamente con alternativas, ni verificar el soporte real de contexto de 128K tokens.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles, aunque el modelo base sea multilingue.
- Comportamiento inestable en el tono: el propio autor lo describe como "hiperactivo" y senala que a veces "regaña" al usuario. En un despliegue serio esto puede traducirse en respuestas inapropiadas o inconsistentes.
- Compatibilidad de plantilla fragil: las configuraciones estan ajustadas para funcionar sin plantilla de chat, con Alpaca y entradas RAW. Usar una plantilla distinta (por ejemplo, la de Mistral) puede degradar notablemente los resultados.
- Procedencia de pesos no verificable: al ser un merge de 12B construido con scripts propios, no existe una trazabilidad completa de los datos de entrenamiento de los modelos originales ni de los posibles sesgos heredados de cada componente.
- Popularidad practicamente nula: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y mayor riesgo de fallos no detectados.
- Nota sobre fechas: los metadatos indican creacion en septiembre de 2026, lo que resulta anomalo y conviene contrastar antes de citar el modelo como reciente.
- La busqueda web realizada no devolvio ningun resultado util: todos los enlaces recuperados correspondian a agencias de alquiler de vehiculos en Oyonnax (Carrefour Location) y no guardan relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RicardoEstep/RPBizkitRemiX-v2-12B
- Modelo base (abliterated): https://huggingface.co/natong19/Mistral-Nemo-Instruct-2407-abliterated
- Componente del merge (peso 0,30): https://huggingface.co/RicardoEstep/RPBizkit-v9-12B
- Componente del merge (peso 0,59): https://huggingface.co/RicardoEstep/RPBizkit-v6-12B
- Componente del merge (peso 0,11): https://huggingface.co/RicardoEstep/RPBizkit-v2-12B
- LoRA de re-abiliteracion: https://huggingface.co/nbeerbower/Mistral-Nemo-12B-abliterated-LORA
- Paper de DARE TIES: https://arxiv.org/abs/2311.03099
- Repositorio de Mergekit: https://github.com/cg123/mergekit

No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios) en la busqueda web realizada.
