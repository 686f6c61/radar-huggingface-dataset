# igorls/gemma-4-12B-it-heretic-GGUF

## Resumen

`igorls/gemma-4-12B-it-heretic-GGUF` es un conjunto de cuantizaciones GGUF del modelo `igorls/gemma-4-12B-it-heretic`, una versión "abliterated" (descensurada de forma automática) de `google/gemma-4-12B-it`. El autor de la cuantización y del modelo intermedio es el usuario de HuggingFace igorls, y el proceso de eliminación del alineamiento de seguridad se realizó con la herramienta Heretic (p-e-w/heretic), que ajusta selectivamente las direcciones de rechazo en el espacio de activaciones en lugar de reentrenar el modelo completo.

El modelo cuenta con 11.907.350.576 parámetros (aproximadamente 11,9 mil millones) según los pesos en safetensors del modelo base, y se distribuye bajo licencia Gemma. Su interés práctico es doble: por un lado, ofrece una variante sin rechazos del Gemma-4 de 12B con una divergencia KL declarada de solo 0,0284 respecto al original (es decir, con una degradación de capacidades muy contenida); por otro, al estar en formato GGUF, se puede ejecutar en GPUs de consumo mediante llama.cpp u Ollama, con la cuantización Q4_K_M ocupando unos 7,4 GB.

La model card insiste en un punto operativo importante: Gemma-4 es un modelo híbrido con modo *thinking*, y la abliteración se aplicó sobre la respuesta directa (modo no-thinking), que además es el comportamiento por defecto del modelo. Para escritura creativa, roleplay y para obtener la salida descensurada más fiable, el autor recomienda desactivar explícitamente el modo thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, modelo híbrido con modo *thinking* (detalle de capas y atencion no disponible) |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M (~7,4 GB), Q8_0 (~12,7 GB); el repo ocupa 40,1 GB, por lo que probablemente existan ficheros adicionales no documentados en la model card |
| Idiomas soportados | No disponible (la model card no detalla idiomas) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (llama.cpp); el modelo base del que deriva se publica en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de Gemma-4, un modelo hibrido que alterna generacion directa y generacion con cadena de razonamiento (*thinking*). El modelo del que deriva esta cuantizacion, `igorls/gemma-4-12B-it-heretic`, se genero aplicando Heretic sobre `google/gemma-4-12B-it`: Heretic es una herramienta de abliteracion automatica que localiza y neutraliza las direcciones de activacion asociadas al rechazo, optimizando el numero y la seleccion de capas para minimizar el dano colateral. No se indica que se haya realizado un reentrenamiento completo ni un ajuste fino supervisado adicional; el proceso es de edicion de pesos/activaciones.

El unico dato cuantitativo de entrenamiento o ajuste que aporta el autor es el par (tasa de rechazo, divergencia KL): 0 de 100 rechazos genuinos ante prompts considerados daninos, con una divergencia KL de 0,0284 frente al modelo original. No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF/DPO en la fase original de Gemma-4-it.

## Capacidades

- Generacion de texto conversacional en modo instrucciones (tag `conversational`), heredada de `google/gemma-4-12B-it`.
- Modo *thinking* opcional: el modelo puede emitir una cadena de razonamiento antes de la respuesta final; el autor advierte que consume presupuesto de tokens y puede truncar la respuesta si `num_predict`/`num_ctx` no es suficientemente grande.
- Respuesta directa sin rechazos ante peticiones que el modelo original rechazaria (0/100 rechazos declarados por el autor).
- Escritura creativa y roleplay multi-turno, uso para el que el autor recomienda explicitamente el modo no-thinking.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp/Ollama.
- Capacidades de codigo, matematicas o vision: no disponibles en la informacion proporcionada (no se confirman en la model card).
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- **Escritura creativa y ficcion sin filtros**: el modelo permite desarrollar narrativa con violencia, tematicas adultas o personajes moralmente ambiguos sin los rechazos del Gemma-4-it original. Conviene ejecutarlo en modo no-thinking para evitar que el bloque de razonamiento consuma el presupuesto de tokens.
- **Roleplay y personajes persistentes**: al ser un modelo de 12B en GGUF, se puede servir localmente con Ollama y mantener conversaciones multi-turno con un personaje definido por system prompt; la ausencia de rechazos evita rupturas de personaje cuando la escena se vuelve dura.
- **Investigacion sobre alineamiento y abliteracion**: sirve como caso de estudio reproducible de edicion de direcciones de rechazo con una metrica publicada (KL 0,0284, 0/100 rechazos) para comparar metodos de abliteracion automatica frente a manuales.
- **Evaluacion de robustez de filtros**: util para equipos que construyen capas de moderacion externas (clasificadores de entrada/salida) y necesitan un modelo deliberadamente no alineado contra el que medir la tasa de falsos negativos de su propio filtro.
- **Generacion de datos sinteticos adversariales**: permite producir ejemplos que un modelo alineado no generaria, utiles para entrenar o evaluar clasificadores de toxicidad y sistemas de *red teaming* en un entorno controlado.
- **Despliegue local en estacion de trabajo**: con la cuantizacion Q4_K_M (~7,4 GB) se puede ejecutar en una GPU de 8-12 GB VRAM mediante llama.cpp u Ollama, sin enviar prompts a servicios en la nube, lo que resulta relevante para contenido sensible o para trabajar sin conectividad.
- **Prototipado de asistentes conversacionales en local**: como sustituto del Gemma-4-it original en pruebas de integracion donde se necesita el mismo tokenizer y formato de chat, pero sin dependencia de la API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta las siguientes metricas del proceso de abliteracion:

| Metrica | Valor | Fuente |
|---|---|---|
| Tasa de rechazos genuinos ante prompts daninos | 0 / 100 | Model card del autor |
| Divergencia KL respecto al modelo original | 0,0284 | Model card del autor |

No hay datos de rendimiento comparado con otros modelos, ni mediciones de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada (inferencia)**: Q4_K_M ~7,4 GB de pesos, por lo que el autor indica que funciona en GPUs de 8-12 GB de VRAM; Q8_0 ~12,7 GB, lo que en la practica exige 16 GB o mas para dejar espacio a la cache KV.
- **GPU de consumo**: si, cabe en tarjetas de 8-12 GB (gama RTX xx60/xx70 recientes) con Q4_K_M; con Q8_0 encaja en RTX 4080/4090 (16-24 GB).
- **GPU de datacenter**: A100, H100 o L40S son sobredimensionadas para este tamano, pero permiten servir varias instancias o contextos muy largos en paralelo.
- **Despliegue**: llama.cpp (`llama-cli`, `llama-server`) y Ollama (`ollama run igorls/gemma-4-12B-it-heretic-GGUF`) son las rutas documentadas por el autor. Tambien se puede cargar con transformers, aunque el repositorio solo publica GGUF. vLLM y TGI no estan documentados en la informacion disponible.
- **Latencia y throughput**: no disponibles. Como referencia cualitativa, un 12B denso en Q4_K_M sobre una GPU de consumo suele quedar en el rango de decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.
- **Presupuesto de tokens en modo thinking**: el autor advierte que hay que aumentar `num_predict` y `num_ctx` si se activa el razonamiento, lo que incrementa el uso de memoria de la cache KV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineamiento | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `igorls/gemma-4-12B-it-heretic-GGUF` (este) | ~11,9 B | No disponible | Eliminado (0/100 rechazos, KL 0,0284) | Gemma | GGUF (Q4_K_M, Q8_0) | HuggingFace, ~11,8 k descargas, 64 likes |
| `igorls/gemma-4-12B-it-heretic` (modelo base del que deriva) | ~11,9 B | No disponible | Eliminado (mismo proceso Heretic) | Gemma | safetensors | HuggingFace; requiere conversion a GGUF para llama.cpp |
| `google/gemma-4-12B-it` (original) | ~11,9 B | No disponible | Alineado (rechaza prompts daninos) | Gemma | safetensors | HuggingFace, modelo oficial de Google |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la unica metrica objetiva de diferencia es la tasa de rechazos y la divergencia KL reportadas por el autor. Otros modelos abliterated de tamano similar (por ejemplo, variantes de 8B-14B de otras familias) no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- **Alineamiento de seguridad eliminado**: la model card lo declara explicitamente; el modelo cumplira peticiones que el original rechaza. Esto incluye contenido que puede ser ilegal en la jurisdiccion del usuario.
- **Licencia Gemma**: el uso comercial y la redistribucion estan sujetos a los Gemma Terms of Use y a la politica de uso prohibido de Google, independientemente de la abliteracion. La licencia no se relaja por haber eliminado el alineamiento.
- **Deriva de capacidades**: aunque la divergencia KL de 0,0284 es baja, no es cero; cabe esperar pequenas degradaciones en tareas sensibles al ajuste fino original, no cuantificadas en la informacion disponible.
- **Riesgo de alucinacion**: inherente a un modelo de 12B; la abliteracion no lo mitiga y la eliminacion de rechazos puede aumentar la confianza con la que el modelo afirma contenido falso.
- **Truncamiento en modo thinking**: si se activa el razonamiento sin ampliar `num_predict`/`num_ctx`, la respuesta final puede quedar cortada. El autor recomienda desactivarlo para roleplay y escritura creativa.
- **Idiomas no documentados**: la model card no indica que idiomas soporta; el rendimiento en castellano no esta verificado.
- **Contexto no documentado**: se desconoce la ventana de contexto efectiva, lo que impide planificar cargas con documentos largos.
- **Cuantizacion**: Q4_K_M introduce perdida respecto a los pesos originales en safetensors; para uso sensible a la precision conviene Q8_0 o el modelo base sin cuantizar.
- **Ficheros no documentados**: el repositorio ocupa 40,1 GB frente a los ~20 GB de los dos ficheros listados, por lo que puede haber cuantizaciones adicionales sin describir; conviene revisar la lista de ficheros antes de descargar.
- **Trazabilidad del proceso**: el metodo Heretic y sus hiperparametros no se detallan en la informacion disponible, lo que dificulta reproducir exactamente la abliteracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/igorls/gemma-4-12B-it-heretic-GGUF
- Modelo base (safetensors, abliterated): https://huggingface.co/igorls/gemma-4-12B-it-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B-it
- Heretic (herramienta de abliteracion automatica): https://github.com/p-e-w/heretic
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
