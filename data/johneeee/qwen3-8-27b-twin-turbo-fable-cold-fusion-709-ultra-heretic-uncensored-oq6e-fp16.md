# Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-oQ6e-fp16

## Resumen

Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-oQ6e-fp16 es una publicacion de pesos cuantizados alojada en HuggingFace por el usuario Johneeee. Segun la model card, se trata de una cuantizacion de precision mixta realizada con oQ (oMLX v0.7.0.dev2), con 6 bits, group size 64 y formato MLX safetensors, sobre un modelo cuyo tipo declarado es `qwen3_5`. El dato verificado de parametros, extraido de los tensores safetensors, es de 26.895.998.464 parametros (~26,9 B) y el repositorio ocupa 22,5 GB.

No se trata de un modelo entrenado desde cero ni de un lanzamiento oficial: es un artefacto derivado, pensado para su ejecucion local en hardware Apple Silicon mediante MLX. La model card es extremadamente escueta y no documenta datos de entrenamiento, composicion del dataset, idiomas, licencia ni resultados de evaluacion, por lo que la mayor parte de las especificaciones habituales figuran como no disponibles en esta ficha.

Su relevancia es limitada y de nicho: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el nombre incluye terminos como "UNCENSORED" y "HERETIC" que apuntan a una variante con el alineamiento de seguridad presumiblemente eliminado. Cualquier evaluacion seria debe partir de la base de que se carece de informacion verificable sobre procedencia, licencia y capacidades reales del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tipo declarado en la model card: `qwen3_5`) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64, precision mixta oQ (oMLX v0.7.0.dev2); el sufijo del nombre indica presencia de componentes fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (`library_name: mlx`) |
| Tamano del repositorio | 22,5 GB |
| Autor | Johneeee |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura interna. La model card unicamente declara el tipo `qwen3_5` y que los pesos han sido cuantizados, sin detallar si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. No se especifica numero de capas, dimension del modelo, cabezas de atencion, tipo de atencion ni estrategia de posicionamiento. Tampoco se documenta la longitud de contexto nativa ni si se ha aplicado alguna tecnica de extension de contexto.

Respecto al entrenamiento, no hay ningun dato: ni numero de tokens, ni composicion del dataset, ni si hubo fases de ajuste supervisado, RLHF, DPO u otro metodo de alineamiento. El unico proceso documentado es el de cuantizacion posterior al entrenamiento mediante oQ (oMLX v0.7.0.dev2), con esquema de precision mixta a 6 bits y group size 64, que asigna distinto numero de bits a distintas capas o tensores para reducir el impacto en calidad frente a una cuantizacion uniforme. El nombre del repositorio sugiere una variante "sin censura", pero no se aporta ninguna evidencia tecnica de como se obtuvo ni de que pesos base se partio.

## Capacidades

- Generacion de texto: no documentada en la informacion disponible.
- Razonamiento, matematicas y generacion de codigo: no disponibles.
- Capacidades de vision o audio: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Idiomas soportados: no disponible.
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidad verificable: el unico aspecto documentado es la propia cuantizacion y el formato de pesos MLX, que permite cargar el modelo con la libreria MLX en Apple Silicon.
- Advertencia: el nombre del repositorio incluye "UNCENSORED", lo que sugiere una eliminacion o atenuacion de las capas de rechazo del modelo base. No existe documentacion que confirme el alcance de esa modificacion.

## Casos de uso

Los siguientes escenarios son plantillas de uso plausibles para un modelo denso de ~27 B cuantizado a 6 bits ejecutado en local, pero deben validarse empiricamente porque las capacidades del modelo no estan documentadas:

- Inferencia local en portatiles Apple Silicon sin conexion: el formato MLX safetensors permite cargar los pesos con mlx-lm en un Mac con memoria unificada suficiente, evitando enviar datos a servicios en la nube. Adecuado para prototipado con datos sensibles que no deben salir del equipo.
- Evaluacion comparativa de tecnicas de cuantizacion: este repositorio es un candidato directo para medir la degradacion de perplejidad y de calidad de generacion de una cuantizacion mixta a 6 bits con group size 64 frente a los pesos originales en fp16, siempre que se localice el modelo base.
- Experimentacion con ajuste fino ligero sobre pesos cuantizados: si el ecosistema MLX lo permite en la version correspondiente, podria usarse como punto de partida para LoRA sobre tareas concretas, aceptando la perdida de calidad inherente a partir de pesos ya cuantizados.
- Procesamiento por lotes de texto en local: tareas de resumen, extraccion de entidades o clasificacion sobre corpus privados, ejecutadas en un unico equipo Apple Silicon con mlx_lm.server exponiendo una API compatible con OpenAI.
- Investigacion sobre alineamiento y seguridad: dado el caracter presumiblemente "uncensored" del artefacto, puede emplearse en estudios controlados sobre tasas de rechazo, toxicidad y adherencia a politicas de contenido, comparandolo con el modelo base.
- Generacion asistida en entornos de investigacion: redaccion tecnica y exploracion de ideas en un flujo de trabajo con control total del modelo y del prompt de sistema, sin dependencia de proveedores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna metrica (MMLU, HumanEval, GSM8K, MT-Bench ni equivalentes) y los resultados de busqueda web consultados no aportan datos tecnicos sobre este repositorio. Tampoco se dispone de mediciones de perplejidad de la cuantizacion frente al modelo original.

## Requisitos de hardware

- Estimacion de memoria para pesos: 26,9 B de parametros a 6 bits equivalen a unos 20,2 GB teoricos; el repositorio ocupa 22,5 GB, lo que indica que una parte de los tensores se conserva en mayor precision (fp16), coherente con el sufijo del nombre. Cifras calculadas a partir de los datos del repositorio, no publicadas por el autor.
- Memoria unificada recomendada: un minimo practico de 32 GB para cargar los pesos y disponer de margen para la cache KV y el contexto; 64 GB o mas si se trabaja con contextos largos o lotes.
- Apple Silicon compatible: se requiere un chip de la familia M con memoria unificada suficiente (M1/M2/M3/M4 Max o Ultra con 32 GB o mas). No cabe en configuraciones de 16 o 18 GB, y en 24 GB queda al limite sin margen para contexto.
- GPU NVIDIA: el formato MLX no es ejecutable en CUDA. Una RTX 4090 (24 GB), A100 o H100 no pueden cargar estos pesos directamente; seria necesario convertir el modelo a safetensors de HuggingFace o a GGUF antes de usar vLLM, TGI o llama.cpp. No se documenta ninguna conversion de este tipo.
- Opciones de despliegue: mlx-lm y mlx_lm.server (API compatible con OpenAI) son las vias naturales. LM Studio admite backend MLX en versiones recientes. Ollama y llama.cpp no soportan MLX, por lo que requeririan una conversion previa a GGUF.
- Latencia y throughput: no disponibles.
- Cuantizaciones adicionales: no se ofrecen variantes de 4 bits, 8 bits ni GGUF en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion verificable sobre modelos comparables. El identificador "Qwen3.8-27B" no coincide con ninguna convencion de nombrado publicada y conocida de la familia Qwen, por lo que no es posible determinar con certeza cual es el modelo base ni, en consecuencia, establecer comparaciones fiables de parametros, contexto o rendimiento.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Johneeee/Qwen3.8-27B-...-oQ6e-fp16 | 26,9 B | no disponible | 6 bits, group size 64 (oQ) | no disponible | MLX safetensors, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Como aproximacion cualitativa, un modelo denso de ~27 B en 6 bits pertenece al segmento de modelos que caben en equipos de gama alta de consumo o en estaciones de trabajo con 32-64 GB de memoria, pero sin datos de evaluacion no es posible situarlo frente a otros modelos de ese segmento.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no hay autorizacion explicita de uso comercial. En ausencia de licencia, la posicion legal por defecto es restrictiva; conviene contactar con el autor antes de cualquier uso en produccion.
- Procedencia no verificada: no se identifica el modelo base ni el proceso de fine-tuning, lo que impide auditar que pesos se han utilizado y si sus condiciones de uso se respetan.
- Alineamiento de seguridad presumiblemente alterado: el nombre incluye "UNCENSORED" y "HERETIC". Es esperable que el modelo tenga una tasa de rechazo muy baja y pueda producir contenido danino, ilegal o inseguro. No se documenta ningun mecanismo de moderacion.
- Sin datos de evaluacion: no hay benchmarks ni mediciones de perplejidad, por lo que se desconoce la degradacion introducida por la cuantizacion a 6 bits.
- Repositorio no validado por la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia externa de que los pesos carguen correctamente o funcionen como se espera.
- Dependencia de una libreria concreta: al ser MLX, el uso queda restringido al ecosistema Apple; migrar a CUDA requiere conversion de formato y puede introducir errores.
- Idiomas y contexto desconocidos: no se puede garantizar un rendimiento correcto en castellano ni asumir una ventana de contexto concreta.
- Riesgo de alucinacion: no cuantificado, pero la ausencia de evaluacion y el ajuste agresivo del modelo base incrementan la incertidumbre.
- Fecha de publicacion inusualmente futura respecto a la actividad conocida de la familia Qwen: conviene tratar la identificacion del modelo base como no confirmada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-oQ6e-fp16
- Repositorio de oQ / oMLX (herramienta de cuantizacion citada en la model card): https://github.com/jundot/omlx
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo, su modelo base o sus benchmarks. Las busquedas devolvieron unicamente paginas genericas del motor de busqueda sin relacion con el repositorio.
