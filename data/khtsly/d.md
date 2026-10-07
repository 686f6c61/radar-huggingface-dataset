# khtsly/d

## Resumen

`khtsly/d` es un checkpoint intermedio de entrenamiento publicado en HuggingFace por el usuario khtsly. El propio autor lo etiqueta explicitamente como `experimental-checkpoint` y advierte en la model card que "no es un modelo terminado": se trata del paso 800 de un entrenamiento en curso, subido al repositorio como copia de seguridad y para poder comparar diferencias entre versiones de pesos. No es, por tanto, un artefacto pensado para uso final.

La arquitectura declarada es un "mini port" de Kimi K3, implementado mediante la clase `KimiLinearForCausalLM` bajo la libreria `transformers`. El recuento real de parametros obtenido de los ficheros safetensors es de 2.616.121.312 (aproximadamente 2,62 mil millones), lo que situa el modelo en la categoria de modelos pequenos. La model card no detalla numero de tokens de entrenamiento, composicion del dataset, longitud de contexto soportada ni proceso de alineamiento.

La relevancia de esta ficha es fundamentalmente contextual: sirve para documentar que el repositorio contiene unicamente un checkpoint de investigacion sin garantias. Los tags incluyen `kimi-k3`, `kimi_linear`, `luau` y `custom_code`, y el tamaño del repositorio (25,7 GB) es muy superior al que corresponderia a 2,62 mil millones de parametros en precision de 16 bits, lo que sugiere que el repositorio puede contener varios ficheros de pesos o copias en precision completa, aunque esto no se detalla en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kimi Linear (`KimiLinearForCausalLM`), port reducido de Kimi K3; requiere `custom_code` |
| Parametros totales | 2.616.121.312 (≈2,62 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | en (ingles), segun el campo `language` de la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Estado del checkpoint | intermedio, paso 800 de entrenamiento ("not a finished model") |
| Tamano del repositorio | 25,7 GB |
| Libreria | transformers |
| Compatibilidad con endpoints | si (tag `endpoints_compatible`) |
| Descargas / likes | 167 descargas, 0 likes |

## Arquitectura y entrenamiento

La unica informacion aportada por el autor es que se trata de un "mini port" de la arquitectura Kimi K3 mediante `KimiLinearForCausalLM`, dentro de la familia Kimi Linear. No se especifica en la model card el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el tipo exacto de mecanismo de atencion lineal empleado, ni el tamano de vocabulario. Tampoco se detalla la funcion de perdida, el optimizador ni el regimen de entrenamiento.

Respecto a los datos de entrenamiento, no hay informacion disponible: se desconoce el volumen de tokens, la composicion del corpus, si hubo fases de ajuste fino supervisado, RLHF o DPO, y si se aplicaron tecnicas de destilacion. El tag `luau` sugiere algun tipo de relacion con el lenguaje de programacion Luau (el dialecto de Lua usado en Roblox), posiblemente en la composicion del dataset o en el tokenizador, pero esto no queda confirmado en la model card.

Como innovacion tecnica, lo unico verificable es la eleccion de la familia Kimi Linear, que en la literatura publicada por sus autores originales se asocia a mecanismos de atencion lineal hibridos orientados a reducir el coste del cache KV en contextos largos. No obstante, no se dispone de datos que confirmen que este port concreto conserve esas propiedades ni que las implemente correctamente.

## Capacidades

- Generacion de texto autoregresiva: la pipeline declarada es `text-generation`, por lo que la funcion esperada es la generacion de texto a partir de un prompt.
- Capacidades especificas de razonamiento, codigo, matematicas o vision: no disponible. La model card no enumera capacidades funcionales.
- Tool calling / function calling: no disponible. No se menciona soporte de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible. No hay evidencia documentada.
- Capacidades multilingues: limitadas declarativamente al ingles (`en`). No se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Advertencia general: al ser un checkpoint intermedio del paso 800, es probable que las capacidades esten incompletas o degradadas en comparacion con un modelo con entrenamiento finalizado. Cualquier evaluacion de capacidades deberia realizarse empiricamente y no asumirse a partir de la familia arquitectonica.

## Casos de uso

Dado que el autor declara explicitamente que no es un modelo terminado, los casos de uso realistas se limitan al ambito de la investigacion y la ingenieria de modelos. No se recomienda su uso en produccion ni en aplicaciones de cara al usuario.

- Investigacion sobre arquitecturas de atencion lineal: el checkpoint permite inspeccionar pesos intermedios de un port de Kimi K3 a escala reducida y comparar la implementacion con otras variantes de atencion lineal. Es adecuado por su tamano manejable (2,62 mil millones de parametros) y porque expone la clase `KimiLinearForCausalLM`.
- Estudio de dinamica de entrenamiento: al ser el paso 800, permite analizar la evolucion de los pesos si el autor publica checkpoints posteriores, y hacer diffing entre versiones para detectar que capas convergen antes.
- Desarrollo y depuracion de kernels personalizados: el tag `custom_code` implica que la carga requiere `trust_remote_code=True`; el modelo sirve como banco de pruebas para validar que una implementacion propia de la arquitectura Kimi Linear carga y ejecuta correctamente.
- Pruebas de integracion en `transformers`: util para verificar compatibilidad de versiones de la libreria con arquitecturas de atencion lineal y con checkpoints parciales.
- Evaluacion comparativa de eficiencia: permite medir consumo de VRAM, latencia y uso de cache KV de la familia Kimi Linear frente a transformers clasicos del mismo orden de parametros, sin necesidad de disponer de un modelo grande.
- Verificacion de seguridad y formatos: sirve para comprobar que el repositorio no contiene pesos maliciosos ni ficheros inesperados antes de integrarlo en un pipeline, dado que los checkpoints experimentales no pasan revisiones exhaustivas.

- Uso en produccion, atencion al cliente, generacion de codigo comercial o cualquier aplicacion final: desaconsejado. El propio autor lo marca como no terminado y no se dispone de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K ni similares), y los resultados de la busqueda web no contienen informacion relacionada con el modelo. No se deben extrapolar cifras a partir del nombre de la arquitectura ni de otros modelos de la misma familia.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (2.616.121.312); no son datos publicados por el autor.

- VRAM para inferencia en fp16/bf16: aproximadamente 5,2 GB solo para pesos, mas el cache de activaciones y KV.
- VRAM para inferencia en fp32: aproximadamente 10,5 GB solo para pesos.
- VRAM en cuantizacion int8: en torno a 2,6 GB para pesos, si se genera una version cuantizada.
- VRAM en cuantizacion de 4 bits: en torno a 1,5-1,7 GB para pesos, mas overhead de runtime.
- GPU consumer: el modelo deberia caber sin problema en GPUs con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) e incluso en GPUs de 6 GB si se cuantiza. En CPU tambien es viable, aunque con latencia alta.
- GPUs de datacenter: A100, H100, L40S o similares no son necesarias para este tamano; solo tendrian sentido para entrenamiento o para despliegue de muchas replicas concurrentes.
- El cache KV depende del mecanismo de atencion y de la longitud de contexto, ninguno de los cuales esta documentado. Si la implementacion es efectivamente de atencion lineal, el crecimiento del cache deberia ser sublineal respecto a la longitud, pero esto no esta confirmado para este checkpoint.
- Opciones de despliegue: la carga requiere la libreria `transformers` con `trust_remote_code=True` debido al tag `custom_code`. No hay evidencia de soporte en vLLM, TGI, llama.cpp u Ollama; el formato publicado es safetensors, no GGUF, por lo que llama.cpp y Ollama requeririan conversion previa y soporte del kernel de atencion lineal, que no esta confirmado.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

El modelo no tiene benchmarks publicados, por lo que la comparacion de rendimiento no es posible. La tabla recoge unicamente la comparacion estructural; los datos de los modelos alternativos son los publicos habituales de cada familia y se incluyen como referencia de categoria, no como validacion de este checkpoint.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khtsly/d | 2,62 mil millones | no disponible | no disponible | no disponible | HuggingFace, checkpoint experimental |
| Qwen2.5-3B | ~3,09 mil millones | 32.768 tokens | no comparable (sin datos del modelo evaluado) | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Llama 3.2 3B | ~3,21 mil millones | 128.000 tokens | no comparable (sin datos del modelo evaluado) | Llama 3.2 Community License | HuggingFace, con acceso gestionado |
| Phi-3.5-mini | ~3,8 mil millones | 128.000 tokens | no comparable (sin datos del modelo evaluado) | MIT | HuggingFace, ampliamente desplegado |

La diferencia principal no esta en el rendimiento sino en el estado del artefacto: los tres modelos alternativos son checkpoints finalizados con licencia explicita y soporte de runtime maduro, mientras que `khtsly/d` es un checkpoint intermedio sin licencia declarada.

## Limitaciones y advertencias

- Modelo no terminado: el autor indica de forma explicita que es un "in-training periodic checkpoint (step 800)" y que "not a finished model". Las salidas pueden ser incoherentes o degeneradas.
- Ausencia de licencia: el repositorio no declara licencia. Sin licencia explicita no hay autorizacion clara para uso comercial, redistribucion ni obras derivadas. Debe tratarse como no apto para uso comercial hasta que el autor lo aclare.
- Idoneidad para produccion: nula. No se recomienda desplegarlo en entornos productivos, ni en aplicaciones de cara al usuario, ni en sistemas automaticos con consecuencias reales.
- Riesgo de alucinacion: no evaluado. No hay datos sobre tasas de alucinacion, y un checkpoint intermedio tiende a presentar fidelidad factual baja.
- Sesgos: no documentados. No se ha publicado informacion sobre composicion del dataset ni sobre evaluaciones de sesgo.
- Idiomas: declarado unicamente para ingles. No hay soporte documentado de castellano ni de otros idiomas; es probable que el rendimiento fuera del ingles sea pobre.
- Longitud de contexto: no disponible. No se puede planificar un caso de uso que dependa de ventanas largas sin medirla empiricamente.
- Ejecucion de codigo remoto: los tags incluyen `custom_code`, por lo que cargar el modelo requiere `trust_remote_code=True`. Esto implica ejecutar codigo Python proporcionado por el autor del repositorio, con el riesgo de seguridad asociado. Conviene auditar el codigo antes de cargarlo.
- Tamano del repositorio: 25,7 GB para 2,62 mil millones de parametros es desproporcionado respecto a un unico checkpoint en fp16. Debe verificarse el contenido del repositorio (multiples revisiones, pesos en fp32, estados de optimizador) antes de descargarlo.
- Resultados de busqueda: las busquedas web realizadas no devolvieron informacion tecnica sobre este modelo; los resultados obtenidos no guardan relacion con el artefacto y no deben usarse como fuente.

## Enlaces

- HuggingFace: https://huggingface.co/khtsly/d
- No se han encontrado otros enlaces relevantes (paper, blog, repositorio o demo) en la informacion disponible.
