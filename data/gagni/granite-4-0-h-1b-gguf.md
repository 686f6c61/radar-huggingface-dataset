# gagni/granite-4.0-h-1b-GGUF

## Resumen

Granite 4.0 H 1B es un modelo de lenguaje desarrollado por IBM dentro de la familia Granite 4.0, diseñado para tareas de generación de texto y clasificación con un coste computacional muy bajo. Con aproximadamente 1.460 millones de parámetros, se posiciona como la variante más pequeña de la línea "H" (híbrida) de Granite 4.0, pensada para despliegues locales y entornos con recursos limitados. El repositorio analizado, `gagni/granite-4.0-h-1b-GGUF`, es un espejo en formato GGUF (cuantización Q4_K_M) del modelo original de IBM, publicado bajo licencia Apache 2.0.

Este repositorio concreto no introduce ningún cambio respecto al original: se trata de una copia byte a byte del fichero `granite-4.0-h-1b-Q4_K_M.gguf` publicado por `ibm-granite`, verificado mediante hash SHA-256. Su relevancia radica en que ofrece un artefacto listo para inferencia local con llama.cpp u Ollama, con un tamaño de repositorio de 0,9 GB, lo que permite ejecutarlo en hardware de consumo. El autor lo emplea como clasificador local pequeño en el proyecto aSup.

La ficha se centra en las características del modelo base (IBM Granite 4.0 H 1B) tal como se reflejan en la información disponible, señalando explícitamente los datos que no se han podido confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Granite 4.0 "H", presumiblemente híbrida; no confirmado en la información proporcionada) |
| Parametros totales | 1.461.538.368 |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única incluida en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); pesos originales del modelo base en safetensors según metadatos de parámetros |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. El sufijo "H" en la nomenclatura de Granite 4.0 hace referencia a la variante híbrida de la familia, pero no se confirma en esta ficha el tipo exacto de bloques (transformer, MoE o combinación con capas de estado recurrente). Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones.

El repositorio analizado es únicamente un espejo de cuantización: reproduce el fichero Q4_K_M del repositorio oficial de IBM sin modificaciones, con verificación criptográfica del contenido. No aporta información adicional sobre el proceso de entrenamiento del modelo original.

## Capacidades

- Generación de texto conversacional: el repositorio incluye la etiqueta `conversational`, lo que indica soporte para diálogo multi-turno.
- Clasificación de texto: el autor declara su uso como "small local classifier" en el proyecto aSup, lo que sugiere capacidad para tareas de clasificación con ajuste o prompting.
- Inferencia local eficiente: al estar en formato GGUF Q4_K_M, puede ejecutarse con llama.cpp y derivados.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el artefacto puede servirse a través de infraestructura de endpoints compatibles.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación local de textos cortos: el modelo, con 1,46 mil millones de parámetros y cuantización Q4_K_M, cabe en menos de 1 GB en disco y puede ejecutarse en CPU para etiquetar mensajes, tickets o comentarios en tiempo casi real, tal como lo emplea el autor en aSup.
- Filtrado previo en pipelines RAG: usar el modelo como clasificador de relevancia o enrutador de consultas antes de invocar un modelo mayor, reduciendo coste y latencia en arquitecturas de dos niveles.
- Asistente conversacional embebido: gracias a la etiqueta `conversational` y su reducido tamaño, puede integrarse en aplicaciones de escritorio o móviles con llama.cpp para diálogos simples sin conexión.
- Prototipado rápido de aplicaciones LLM: permite validar prompts, formatos de respuesta y flujos de conversación en local antes de migrar a modelos de mayor tamaño.
- Moderación y etiquetado de contenido: clasificación binaria o multiclase de textos en entornos con requisitos de privacidad, donde los datos no pueden salir del dispositivo.
- Generación de texto auxiliar en entornos con recursos limitados: resúmenes breves, respuestas plantilla o reescritura de frases en sistemas embebidos o servidores sin GPU.
- Enrutamiento de consultas en sistemas multi-modelo: decidir si una petición requiere un modelo grande o puede resolverse con el pequeño, optimizando el coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB con cuantización Q4_K_M (el fichero ocupa aproximadamente 0,9 GB); en la práctica, unos 1,5-2 GB de RAM/VRAM considerando el contexto y el runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona también en CPU.
- GPU de consumo: cabe holgadamente en GTX 1650, RTX 3050, RTX 4060 y superiores; también en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), servidores compatibles con la API de endpoints indicada en las etiquetas; vLLM y TGI no se confirman para este artefacto GGUF concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite 4.0 H 1B (este repo, GGUF) | 1.461.538.368 | no disponible | Apache 2.0 | GGUF Q4_K_M | Espejo verificado del original de IBM |
| Granite 4.0 H 1B (original, ibm-granite) | 1.461.538.368 | no disponible | Apache 2.0 | safetensors / GGUF | Fuente oficial del artefacto |
| Alternativas de ~1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; todo modelo de lenguaje puede reproducir sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; con 1,46 mil millones de parámetros, la fiabilidad factual es limitada y debe validarse en producción.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican en la documentación disponible.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, manteniendo el aviso de licencia y la atribución correspondiente.
- Es un espejo, no un modelo original: cualquier actualización o corrección debe verificarse contra el repositorio oficial de IBM; este repositorio refleja un commit concreto.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales; para tareas sensibles a la exactitud conviene evaluar variantes de mayor precisión.
- No se confirman capacidades de tool calling ni de agente; no deben asumirse sin validación empírica.

## Enlaces

- Repositorio analizado: https://huggingface.co/gagni/granite-4.0-h-1b-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-1b
- Repositorio GGUF oficial de IBM: https://huggingface.co/ibm-granite/granite-4.0-h-1b-GGUF
- Commit de referencia del espejo: `c2cb1972f511add21f3bae244990b8ff3a3ffb23`
