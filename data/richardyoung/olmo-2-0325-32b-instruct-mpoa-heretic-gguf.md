# richardyoung/OLMo-2-0325-32B-Instruct-MPOA-heretic-GGUF

## Resumen

OLMo-2-0325-32B-Instruct-MPOA-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/OLMo-2-0325-32B-Instruct-MPOA-heretic, a su vez derivado del OLMo 2 32B Instruct de Ai2 (Allen Institute for AI). El autor, richardyoung, publica esta version orientada a inferencia local con llama.cpp y Ollama, empleando tecnicas de cuantizacion con imatrix y un proceso de "abliteration" (etiquetado como heretic/abliterated/uncensored) que elimina los mecanismos de rechazo del modelo original. El resultado es un modelo de 32.234.279.936 parametros (unos 32,2 mil millones) en licencia Apache 2.0.

La relevancia de esta ficha esta en que combina tres elementos poco habituales: la base OLMo 2 de Ai2, que es un modelo completamente abierto (pesos, datos y receta de entrenamiento publicados), una modificacion de alineamiento orientada a eliminar restricciones de contenido, y una distribucion en GGUF pensada para ejecucion en hardware de consumo o servidores modestos. El repositorio ocupa 53,8 GB, lo que sugiere la presencia de varias cuantizaciones (probablemente desde Q2 hasta Q8, ademas de posibles variantes K-quant e I-quant).

El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. El modelo declara soporte unicamente para ingles y esta etiquetado como compatible con endpoints, ademas de conversational. No se dispone de informacion sobre benchmarks especificos de esta variante en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base OLMo 2 32B Instruct de Ai2; detalles de atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 32.234.279.936 (32,2 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada (el OLMo 2 32B Instruct base soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | GGUF con imatrix; los niveles concretos (Q2_K a Q8_0, I-quants) no se detallan en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo subyacente es OLMo 2 32B Instruct de Ai2, un transformer decoder-only entrenado desde cero con una receta completamente abierta (datos, codigo y checkpoints publicados). Sobre esa base, el autor aplico un proceso de "MPOA" y "heretic" (abliteration), una tecnica que identifica y modifica las direcciones de activacion asociadas al rechazo de peticiones para reducir la tasa de respuestas negativas del modelo. El resultado se etiqueta como "uncensored/abliterated". No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO adicionales en la variante heretic.

La capa final de esta publicacion es puramente de cuantizacion: se convierte el modelo modificado a GGUF con calibracion imatrix (importance matrix), lo que mejora la fidelidad de las cuantizaciones bajas respecto a la cuantizacion uniforme. No se documenta en la informacion disponible que se haya aplicado decodificacion especulativa, atencion lineal ni otras innovaciones de inferencia mas alla del propio formato GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno.
- Razonamiento y respuesta a instrucciones (hereda el comportamiento Instruct de OLMo 2).
- Generacion de codigo y matematicas segun las capacidades del modelo base (no verificadas en esta variante).
- Modo "uncensored": reduccion deliberada de rechazos y filtros de contenido respecto al modelo original.
- Compatible con llama.cpp y Ollama, lo que habilita integracion en pipelines locales.
- Etiquetado como compatible con endpoints (endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration comparando respuestas con el OLMo 2 32B Instruct original, en un entorno controlado y con licencia Apache 2.0.
- Despliegue local en estaciones de trabajo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU de consumo, sin depender de APIs externas ni de conectividad.
- Generacion de texto creativo sin restricciones editoriales: util para escritura de ficcion, guiones o narrativa que requiera contenido sensible sin filtros automaticos, siempre con supervision humana.
- Prototipado de asistentes conversacionales en ingles: la ventana de contexto del modelo base y el formato GGUF permiten iterar rapidamente en local antes de escalar a produccion.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye varias variantes GGUF, lo que facilita medir la degradacion de calidad entre niveles de cuantizacion en tareas concretas.
- Fine-tuning posterior sobre GGUF: mediante tecnicas de adaptacion de bajo rango compatibles con llama.cpp, se puede especializar el modelo en dominios concretos manteniendo la licencia permisiva.
- Analisis de robustez frente a jailbreaks: al ser un modelo abliterated, sirve como referencia en estudios de red teaming y evaluacion de filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; como referencia orientativa para 32,2 B en GGUF, una cuantizacion Q4_K_M requiere del orden de 18-20 GB de VRAM, Q5_K_M en torno a 22-24 GB y Q8_0 cerca de 34-36 GB (estimaciones basadas en el tamano de parametros, no confirmadas en la informacion proporcionada).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para cuantizaciones altas; RTX 4090 (24 GB) para Q4/Q5 con offload parcial; RTX 3090 (24 GB) en las mismas condiciones.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4 o Q5 y posible offload de capas a CPU; en GPUs de 16 GB solo con cuantizaciones muy bajas (Q2/Q3) o mediante offload.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; no se documenta soporte nativo de vLLM o TGI para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/OLMo-2-0325-32B-Instruct-MPOA-heretic-GGUF | 32,2 B | no disponible | Apache 2.0 | GGUF | Variante abliterated, solo ingles, acceso gated |
| OLMo 2 32B Instruct (Ai2) | 32,2 B | contexto largo (segun ficha oficial de Ai2) | Apache 2.0 | safetensors | Modelo original alineado, sin modificaciones heretic |
| Qwen2.5 32B Instruct | 32,5 B | 128K (segun ficha oficial de Qwen) | Apache 2.0 | safetensors, GGUF | Multilingue, con variantes GGUF de la comunidad |
| Gemma 2 27B Instruct | 27 B | 8K (segun ficha oficial de Google) | Gemma license | safetensors, GGUF | Menor numero de parametros, licencia no Apache |

Las cifras de contexto y licencia de los modelos comparados provienen de sus fichas oficiales y deben verificarse antes de usarse en produccion.

## Limitaciones y advertencias

- El proceso de abliteration elimina filtros de seguridad: el modelo puede generar contenido sensible, ofensivo o peligroso sin rechazo, lo que exige supervision humana y politicas de uso claras.
- Riesgo elevado de alucinacion en tareas factuales, comun en modelos de este tamano y agravado por la falta de benchmarks publicados de esta variante.
- Soporte limitado al ingles: no se garantiza calidad en castellano ni en otros idiomas.
- El acceso es gated: requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatizacion de descargas en CI/CD.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; la responsabilidad legal del contenido generado recae en el desplegador.
- Al ser una cuantizacion, las versiones de baja precision pueden degradar el razonamiento y la coherencia respecto al modelo original en safetensors.
- No se documentan evaluaciones de sesgo; se recomienda auditar el modelo antes de usarlo en aplicaciones orientadas a usuarios finales.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-MPOA-heretic-GGUF
- Modelo base intermedio: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-MPOA-heretic
- OLMo 2 32B Instruct de Ai2: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Paper de OLMo 2 (Ai2): no disponible en la informacion proporcionada como enlace directo; consultar la ficha oficial de Ai2 en Hugging Face.
