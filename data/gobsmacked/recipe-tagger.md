# Gobsmacked/Recipe-Tagger

## Resumen

Recipe-Tagger es un repositorio de modelos publicado en HuggingFace por el usuario Gobsmacked bajo licencia MIT. En el momento de redactar esta ficha, la informacion publica asociada al repositorio se reduce a los metadatos de la plataforma: no hay model card (el README solo contiene el campo `license: mit`), no se declara un pipeline o tarea, no se indican idiomas y el repositorio no registra descargas ni interacciones.

El nombre del repositorio sugiere un sistema de etiquetado de recetas de cocina, presumiblemente orientado a clasificacion o extraccion de atributos (ingredientes, tipo de plato, dieta, tiempo de preparacion), pero esta interpretacion no esta confirmada por ninguna documentacion oficial. Tampoco se especifican arquitectura, numero de parametros, longitud de contexto ni procedimiento de entrenamiento.

Por tanto, esta ficha no puede validar el modelo tecnicamente: se limita a documentar de forma explicita que la informacion disponible es insuficiente para evaluar su idoneidad en produccion. Se recomienda contactar con el autor o inspeccionar los archivos del repositorio antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |
| Tarea declarada (pipeline) | no disponible (el repositorio no define pipeline tag) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-27T22:29:09Z |
| Ultima actualizacion | 2026-10-27T22:29:09Z (misma marca temporal que la creacion) |

## Arquitectura y entrenamiento

No disponible. La model card del repositorio no contiene ninguna seccion descriptiva: unicamente el bloque de metadatos YAML con `license: mit`. No se documenta la familia arquitectonica (transformer encoder, decoder, MoE, SSM o hibrida), el numero de parametros, la tokenizer utilizada, la longitud de contexto nativa ni el vocabulario.

Tampoco hay informacion sobre el corpus de entrenamiento (numero de tokens, composicion, idioma, procedencia), sobre si se aplicaron tecnicas de ajuste como SFT, RLHF o DPO, ni sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, quantizacion nativa). La unica fecha registrada es la de creacion del repositorio, que coincide exactamente con la de ultima actualizacion, lo que sugiere que no se ha publicado ninguna revision posterior ni documentacion adicional.

## Capacidades

- Generacion o clasificacion de texto: no confirmado; el repositorio no declara pipeline ni tarea.
- Etiquetado de recetas: plausible por el nombre del repositorio, sin confirmacion documental.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas esta vacio).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

Los siguientes escenarios son hipotesis derivadas del nombre del repositorio y no estan respaldados por documentacion tecnica. Se enumeran unicamente como marco de evaluacion para quien decida inspeccionar el modelo.

- Etiquetado automatico de recetas en un CMS: clasificar cada receta entrante con etiquetas de tipo de plato, cocina o dieta. Requiere confirmar que el modelo realiza clasificacion multietiqueta.
- Extraccion de ingredientes y cantidades: normalizar listas de ingredientes a una estructura parseada para busqueda facetada. Solo viable si el modelo es de token-classification o extraccion.
- Filtrado dietetico en un buscador de recetas: asignar etiquetas como vegetariano, vegano o sin gluten. Exige verificar el conjunto de etiquetas del modelo antes de usarlo.
- Moderacion y deduplicacion de contenido: agrupar recetas similares por sus etiquetas para evitar duplicados en un catalogo.
- Enriquecimiento de datos para analitica: poblar un almacen con metadatos etiquetados para estudiar tendencias culinarias.
- Preetiquetado en un flujo human-in-the-loop: usar el modelo como primer paso y reservar la revision humana para los casos de baja confianza; para ello es imprescindible que exponga probabilidades por etiqueta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; sin conocer el numero de parametros ni el formato de pesos no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponible.
- Viabilidad en GPU consumer: no determinable con los datos actuales.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; depende de la arquitectura y del formato de pesos, que no se declaran.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable: se desconocen parametros, contexto, tarea y rendimiento del modelo, por lo que cualquier comparacion con alternativas seria especulativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Recipe-Tagger (Gobsmacked) | no disponible | no disponible | no disponible | MIT | Repositorio publico sin descargas ni documentacion |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos o metricas, lo que impide una evaluacion de riesgos.
- Riesgo de alucinacion y de etiquetado erroneo: no cuantificado ni documentado.
- Idiomas soportados desconocidos; no se puede asumir un buen rendimiento en castellano.
- Cobertura de etiquetas y taxonomia desconocidas: si se usa para clasificacion, el conjunto de clases puede no coincidir con el dominio de destino.
- Licencia MIT: permite uso comercial y modificacion, pero la licencia no implica idoneidad tecnica ni garantia alguna por parte del autor.
- Repositorio sin descargas ni likes y sin revisiones posteriores a la creacion: no hay senales de mantenimiento ni de validacion por la comunidad.
- Antes de cualquier uso en produccion, es imprescindible inspeccionar los archivos del repositorio (pesos, tokenizer, configuracion) y realizar una evaluacion propia sobre datos del dominio.

## Enlaces

- HuggingFace: https://huggingface.co/Gobsmacked/Recipe-Tagger
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
