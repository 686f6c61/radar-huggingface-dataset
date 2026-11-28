# ji-farthing/Qwen3.8-Flash-Next-Uncensored-ik-llama-GGUF

## Resumen

Qwen3.8-Flash-Next-Uncensored-ik-llama-GGUF es una cuantizacion GGUF del modelo orcarouter/Qwen3.8-Flash-Next-Uncensored, publicada por el usuario ji-farthing. Se trata de una variante "abliterated" y sin censura de un modelo de la familia Qwen, con 176.943.899.520 parametros totales segun los datos de safetensors del modelo base. El repositorio pesa 538,5 GB y esta pensado para su uso con la rama ik_llama.cpp, una bifurcacion optimizada de llama.cpp que incorpora imatrix, soporte de MTP (multi-token prediction) y decodificacion especulativa.

La relevancia de esta ficha reside en que combina tres elementos poco habituales: un modelo de escala muy grande (del orden de 177.000 millones de parametros), una modificacion de alineamiento orientada a eliminar rechazos ("uncensored"/"abliterated") y un formato de cuantizacion especifico para inferencia local eficiente mediante ik_llama. Los tags del repositorio incluyen `qwen4exp`, `mtp` y `speculative-decoding`, lo que sugiere arquitectura experimental de la familia Qwen con prediccion multi-token.

El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. La licencia declarada es qwen-community-license-1.0, lo que condiciona el uso comercial. No se dispone de informacion publica sobre idiomas soportados, composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, tag `qwen4exp`), con soporte de MTP y decodificacion especulativa segun tags; detalles no disponibles |
| Parametros totales | 176.943.899.520 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (variantes concretas de bits no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (acceso restringido/gated) |
| Formato de pesos | GGUF (compatible con ik_llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio. Los tags `qwen4exp`, `mtp` y `speculative-decoding` apuntan a un transformer de la familia Qwen con capacidad de prediccion multi-token (MTP), lo que permite generar varios tokens por paso y acelera la decodificacion. El modelo base es orcarouter/Qwen3.8-Flash-Next-Uncensored, a su vez derivado de un modelo Qwen mediante tecnicas de "abliteration" (modificacion de pesos para eliminar el comportamiento de rechazo). No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni si se aplico RLHF o DPO en la variante sin censura.

La cuantizacion la realiza ji-farthing con imatrix (matriz de importancia) para ik_llama.cpp, una bifurcacion de llama.cpp orientada a rendimiento en CPU y GPU. El repositorio incluye el tag `endpoints_compatible`, lo que indica compatibilidad con endpoints de inferencia estandar. El peso total del repositorio (538,5 GB) refleja que contiene multiples variantes de cuantizacion de un modelo de gran tamano, no una sola.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline: text-generation, tag `conversational`).
- Modelo exclusivamente de texto (tag `text-only`); no hay indicios de vision ni audio.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen, aunque no se documentan resultados especificos.
- Sin censura / abliterated: el modelo esta modificado para reducir rechazos ante peticiones que el modelo original declinaria.
- Soporte de decodificacion especulativa y MTP para acelerar la generacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration comparando respuestas con el modelo base original, util para analizar que comportamientos de rechazo se eliminan y cuales persisten.
- Inferencia local de gran escala con ik_llama.cpp: gracias a las cuantizaciones GGUF con imatrix, equipos con suficiente memoria pueden ejecutar un modelo de ~177.000 millones de parametros sin depender de APIs externas.
- Generacion de texto creativo sin restricciones editoriales: escritura de ficcion, guiones o narrativa donde el autor necesita que el modelo no imponga filtros de contenido.
- Evaluacion de decodificacion especulativa y MTP: el repositorio sirve como banco de pruebas para medir aceleraciones de throughput con MTP frente a decodificacion autoregresiva clasica en ik_llama.
- Procesamiento por lotes de texto en entornos aislados (air-gapped): al ejecutarse localmente, es adecuado para pipelines que no pueden enviar datos a servicios en la nube.
- Experimentacion con cuantizacion imatrix: util para comparar calidad y velocidad entre variantes de bits sobre un mismo modelo de referencia grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. Con ~177.000 millones de parametros, incluso en cuantizacion de 4 bits se requiere del orden de 90-100 GB de memoria, y en 8 bits aproximadamente 180 GB; estas cifras son estimaciones por tamano, no datos publicados.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por volumen de memoria, cabria esperar configuraciones multi-GPU (A100 80 GB, H100 80 GB) o el uso de memoria unificada/CPU offload.
- Consumer GPU: no cabe en una sola GPU de consumo (RTX 4090 con 24 GB) en ninguna cuantizacion practica; requeriria offload a RAM del sistema.
- Opciones de despliegue: ik_llama.cpp (objetivo principal del repositorio); compatibilidad con llama.cpp no confirmada; vLLM, TGI y Ollama no disponibles en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-ik-llama-GGUF | ~177.000 M | no disponible | qwen-community-license-1.0 (gated) | GGUF | Abliterated, imatrix, MTP |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | no disponible | safetensors (presumible) | Modelo base del que deriva esta cuantizacion |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos para una comparacion rigurosa |

## Limitaciones y advertencias

- La abliteration elimina barreras de rechazo, pero no garantiza la ausencia de contenido problematico ni corrige sesgos subyacentes del modelo base.
- Riesgo elevado de alucinacion, especialmente en un modelo sin alineamiento reforzado documentado.
- No hay informacion sobre idiomas soportados; el rendimiento en castellano no esta verificado.
- La licencia qwen-community-license-1.0 impone condiciones especificas; es necesario revisar sus terminos antes de cualquier uso comercial.
- El acceso esta restringido (gated): hay que aceptar condiciones en Hugging Face, lo que puede limitar la redistribucion.
- El repositorio ocupa 538,5 GB; la descarga y el almacenamiento requieren infraestructura considerable.
- Orientado a ik_llama.cpp; el soporte en otras herramientas (vLLM, Ollama, TGI) no esta confirmado y puede fallar.
- No se han publicado benchmarks, por lo que no hay evidencia objetiva de calidad frente al modelo base.
- Uso responsable: al tratarse de un modelo sin censura, conviene aplicar filtros y supervision en cualquier despliegue orientado al publico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ji-farthing/Qwen3.8-Flash-Next-Uncensored-ik-llama-GGUF
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- ik_llama.cpp (repositorio del runtime): no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
