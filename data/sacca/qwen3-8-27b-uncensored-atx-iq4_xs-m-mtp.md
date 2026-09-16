# sacca/Qwen3.8-27B-Uncensored-ATX-IQ4_XS-M-MTP

## Resumen

El repositorio `sacca/Qwen3.8-27B-Uncensored-ATX-IQ4_XS-M-MTP` es una publicacion alojada en HuggingFace por el usuario `sacca`. La model card asociada no contiene informacion tecnica: unicamente una linea de metadatos con `license: apache-2.0`. No hay descripcion, pipeline declarado, idiomas soportados ni documentacion de arquitectura o entrenamiento.

El identificador del repositorio sugiere, sin confirmacion documental, que se trata de un modelo de la familia Qwen con aproximadamente 27.000 millones de parametros, con algun proceso de ajuste orientado a eliminar restricciones de contenido ("Uncensored"), distribuido en formato de cuantizacion GGUF `IQ4_XS` y con soporte declarado de multi-token prediction ("MTP"). Estas son inferencias derivadas del nombre del repositorio y no datos verificados: la model card no las confirma.

La relevancia del repositorio es, a fecha de la informacion disponible, muy limitada: 0 descargas y 0 "likes", sin resultados de benchmarks, sin demo, sin paper y sin enlaces externos verificables. Cualquier evaluacion tecnica seria requiere contactar con el autor o inspeccionar directamente los ficheros del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador incluye "MTP", no confirmado en la model card) |
| Parametros totales | no disponible (el identificador incluye "27B", no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS segun el identificador del repositorio; no confirmado en la model card |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (presumiblemente GGUF por la etiqueta IQ4_XS, sin confirmar) |

## Arquitectura y entrenamiento

No disponible. La model card no incluye ninguna descripcion de la arquitectura, del proceso de entrenamiento, del volumen de tokens utilizados, de la composicion del dataset ni de si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

El unico indicio tecnico es el sufijo `MTP` del identificador, que en el ecosistema actual suele asociarse a *multi-token prediction* (prediccion de varios tokens por paso), una tecnica que puede acelerar la decodificacion. No hay ninguna confirmacion de que este modelo la implemente ni de como lo haria.

## Capacidades

- No se ha publicado ninguna lista de capacidades en la informacion disponible.
- No hay confirmacion de soporte de *tool calling* o *function calling*.
- No hay confirmacion de capacidades de agente o razonamiento multi-paso.
- No hay confirmacion de cobertura multilingue ni de idiomas concretos.
- No hay confirmacion de modo de razonamiento explicito (*thinking mode*), vision, audio ni otras modalidades.
- El termino "Uncensored" del identificador apunta a un ajuste orientado a reducir rechazos y filtros de contenido, pero se desconoce el alcance real y el metodo empleado.

## Casos de uso

Los siguientes escenarios son plausibles para un modelo denso de ~27.000 millones de parametros cuantizado a 4 bits, pero **no estan verificados** para este repositorio concreto y dependen de que la ficha tecnica se confirme:

- Generacion de texto en local con privacidad estricta: un modelo de ese tamano en IQ4_XS puede ejecutarse en una GPU de consumo y procesar datos que no deben salir de la infraestructura propia, algo relevante en entornos sanitarios, legales o de defensa.
- Asistencia de redaccion tecnica y documentacion: redaccion y reescritura de documentacion de producto, notas de version o manuales, con control total del despliegue.
- Prototipado de aplicaciones conversacionales: servir como backend de un chatbot multi-turno en fase de desarrollo, sustituyendolo por un modelo verificado antes de produccion.
- Experimentacion en investigacion sobre alineacion y filtros de contenido: el ajuste "uncensored" lo hace candidato para estudiar como varia el comportamiento del modelo al relajar las capas de rechazo, siempre con supervision etica y legal.
- Clasificacion y extraccion de informacion en lotes: tareas de etiquetado, resumen o extraccion de entidades sobre corpus internos, ejecutadas en local sin coste por token.
- Generacion de codigo en entornos aislados: si el modelo base es competente en programacion, puede usarse como asistente en entornos *air-gapped* donde no se permite acceso a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Todas las cifras de esta seccion son **estimaciones derivadas de la etiqueta de cuantizacion `IQ4_XS` y del tamano "27B" del identificador**, no datos publicados por el autor:

- VRAM estimada en IQ4_XS: en torno a 14-15 GB de pesos para 27.000 millones de parametros a ~4,25 bits por peso, mas la cache KV (aproximadamente 1-3 GB segun contexto y configuracion).
- GPU de consumo: previsiblemente cabe en RTX 4090, RTX 3090, RTX 5090 o similares con 24 GB o mas. En GPUs de 12-16 GB requeriria descarga parcial a CPU/RAM.
- GPU de datacenter: A100 40/80 GB, H100, L40S. Para pesos sin cuantizar (fp16) se necesitarian del orden de 54 GB, lo que obliga a A100 80 GB o H100.
- Opciones de despliegue: `llama.cpp`, Ollama y LM Studio para el formato GGUF; vLLM y TGI solo si el repositorio incluye pesos safetensors, extremo no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable con este modelo porque se desconocen sus parametros, contexto y rendimiento reales. La tabla siguiente recoge modelos de tamano similar como referencia publica, dejando la columna del modelo evaluado sin datos:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| sacca/Qwen3.8-27B-Uncensored-ATX-IQ4_XS-M-MTP | no disponible | no disponible | Apache 2.0 | sin benchmarks publicados |
| Qwen2.5-32B (referencia) | ~32,5 B | 131.072 tokens | Apache 2.0 | benchmarks publicos |
| Qwen3-32B (referencia) | ~32,8 B | 32.768 tokens nativos, ampliable | Apache 2.0 | benchmarks publicos |
| Gemma 2 27B (referencia) | ~27 B | 8.192 tokens | licencia Gemma | benchmarks publicos |

Los datos de las filas de referencia corresponden a informacion publica de sus respectivos autores y deben verificarse en sus fichas oficiales antes de citarlos.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica, ni descripcion de datos de entrenamiento, ni evaluacion de sesgos. Esto impide auditar el modelo.
- Cero adopcion verificable: 0 descargas y 0 "likes" en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Riesgo elevado de alucinacion y de comportamiento impredecible: al no existir informes de evaluacion, no puede descartarse degradacion por el proceso de cuantizacion a 4 bits ni por el ajuste "uncensored".
- El ajuste orientado a reducir restricciones de contenido implica un riesgo real de generar material danino, ilegal o inapropiado. No se recomienda su uso en aplicaciones orientadas a publico general sin moderacion adicional.
- Licencia Apache 2.0 declarada en los metadatos, lo que en principio permitiria uso comercial. Sin embargo, si el modelo deriva de pesos con otra licencia (por ejemplo, la licencia propia de Qwen o de Gemma), la relicencia a Apache 2.0 por parte de un tercero es juridicamente discutible y deberia verificarse.
- La fecha de creacion del repositorio indicada en los metadatos (2026-09-15) es posterior al momento habitual de publicacion de los modelos base citados en el identificador, lo que anade incertidumbre sobre su origen.
- No hay informacion sobre idiomas soportados, longitud de contexto efectiva ni limites de uso en produccion.
- Advertencia de seguridad: el termino "Uncensored" en el nombre es una senal de riesgo para despliegues de cara al usuario final. Se recomienda encarecidamente evaluar el modelo con conjuntos de prueba propios antes de cualquier uso.

## Enlaces

- HuggingFace: https://huggingface.co/sacca/Qwen3.8-27B-Uncensored-ATX-IQ4_XS-M-MTP
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a una empresa francesa de herramientas ("Outillage Sacca"), a un hotel en Cauterets y a una sociedad denominada SACCA France, sin relacion alguna con el repositorio.
- No se han encontrado paper, blog tecnico, repositorio de codigo ni demo asociados.
