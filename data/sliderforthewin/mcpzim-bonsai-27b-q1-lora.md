# sliderforthewin/mcpzim-bonsai-27b-q1-lora

## Resumen

MCPZim LoRA para Bonsai 27B Q1 es un adaptador LoRA de rango 8 publicado por el usuario sliderforthewin, entrenado sobre el checkpoint cuantizado a Q1 del modelo Bonsai 27B de Prism ML. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino de 5,25 MB que se carga junto al GGUF base mediante el soporte de adaptadores de llama.cpp. Su proposito concreto es especializar el modelo base en tareas de respuesta a preguntas sobre un archivo offline (el corpus de MCPZim), incluyendo el uso de una herramienta de busqueda y la generacion de respuestas fundamentadas en los documentos recuperados.

El checkpoint publicado corresponde al paso 64 de entrenamiento y debe aplicarse con una fuerza de adaptador de 0,25 en llama.cpp. El modelo base Bonsai 27B pertenece a Prism ML y utiliza un formato de cuantizacion empaquetado propio, Q1_0_g128, que requiere una compilacion especifica de llama.cpp (el fork de PrismML-Eng) para poder cargarse. El adaptador hereda la licencia Apache 2.0 del base.

La relevancia de esta ficha es acotada: se trata de un artefacto de nicho, con cero descargas en el momento de la consulta, orientado a un caso de uso muy especifico y evaluado unicamente con el conjunto de pruebas interno del autor. No dispone de model card extendida, datos de entrenamiento detallados ni resultados de benchmarks estandar, por lo que la mayor parte de las especificaciones habituales deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer Bonsai 27B; rango 8 |
| Parametros totales | 1.310.720 (pesos del adaptador; el modelo base Bonsai 27B no se detalla) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del base Bonsai 27B, no especificada) |
| Tipos de cuantizacion | Adaptador en GGUF; base en Q1_0_g128 (formato empaquetado propietario de Prism ML) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador LoRA de 5,25 MB); base GGUF Q1 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 aplicado sobre el modelo Bonsai 27B de Prism ML en su cuantizacion Q1. No se especifica sobre que capas se insertan los adaptadores ni la composicion del dataset de entrenamiento; la model card solo indica que el objetivo es el ajuste para el sistema de pregunta-respuesta offline de MCPZim, con uso de herramienta de busqueda y respuestas ancladas a fuentes. El checkpoint publicado es el del paso 64, lo que sugiere un entrenamiento corto y probablemente con un conjunto de datos pequeno y especifico del dominio.

La innovacion tecnica relevante no esta en el adaptador en si, sino en el ecosistema del modelo base: Bonsai 27B emplea un formato de cuantizacion empaquetado a 1 bit (Q1_0_g128) que exige una compilacion parcheada de llama.cpp, distribuida por Prism ML en su propio fork. El adaptador se carga mediante el flag `--lora-scaled` de llama-server con un factor de 0,25, lo que indica que el autor recomienda una influencia moderada del ajuste para no degradar el comportamiento general del base.

## Capacidades

- Generacion de texto orientada a pregunta-respuesta sobre un corpus documental offline.
- Uso de herramienta de busqueda (search tool use) dentro del flujo de respuesta, segun la model card.
- Generacion de respuestas fundamentadas (grounded answers) en los documentos recuperados.
- Especializacion en el dominio y el formato de prompt del sistema MCPZim.
- Capacidades generales del modelo base Bonsai 27B: no disponibles en la informacion proporcionada.
- Soporte multilingue: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Pregunta-respuesta sobre archivos documentales offline: el adaptador esta entrenado especificamente para consultar un corpus local y responder con base en el, lo que encaja en despliegues sin conectividad o con requisitos de privacidad estrictos.
- Asistente de busqueda interna: el modelo puede invocar una herramienta de busqueda sobre el archivo y sintetizar la respuesta citando el material recuperado, util para bases de conocimiento corporativas.
- Despliegue en hardware limitado: al apoyarse en un base cuantizado a 1 bit, el conjunto completo (base mas adaptador) apunta a escenarios de memoria muy restringida, como portatiles o equipos sin GPU dedicada de gran capacidad.
- Prototipado de sistemas RAG ligeros: sirve como referencia para evaluar como un LoRA de rango bajo modifica el comportamiento de un modelo cuantizado agresivamente en tareas de recuperacion y respuesta.
- Evaluacion de tecnicas de adaptacion sobre cuantizacion extrema: util para investigadores que estudien la interaccion entre LoRA y pesos de 1 bit.
- Integracion en llama.cpp mediante llama-server: el flujo de despliegue documentado (descarga del base, descarga del adaptador, arranque con `--lora-scaled`) permite montar un servicio HTTP local sin infraestructura adicional.

## Benchmarks y rendimiento

Los unicos datos publicados son las evaluaciones internas del autor sobre la tarea MCPZim, no comparables con benchmarks estandar:

| Prueba | Bonsai Q1 base | Bonsai Q1 + LoRA MCPZim |
|---|---|---|
| Conversaciones reservadas (36 casos) | 33/36 | 35/36 |
| Suite de estres (12 casos) | 1/12 | 3/12 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores miden exclusivamente el conjunto de tareas y el formato de prompt de MCPZim en una evaluacion sobre Mac con llama.cpp.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el base esta cuantizado a Q1 (aproximadamente 1 bit por peso), por lo que un modelo de 27B ocuparia del orden de 3-4 GB, aunque el formato empaquetado Q1_0_g128 y los metadatos pueden alterar la cifra. El adaptador anade solo 5,25 MB.
- GPU recomendadas: no especificadas; por el nivel de cuantizacion, el modelo esta pensado para ejecucion en CPU y en GPUs de gama consumer.
- Compatibilidad con GPU consumer: probable en equipos con 8 GB o mas de VRAM o con suficiente RAM de sistema, aunque no hay confirmacion del autor.
- Opciones de despliegue: llama.cpp exclusivamente, y en concreto una compilacion que soporte el formato Q1_0_g128 (fork de PrismML-Eng). No hay soporte documentado para vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MCPZim LoRA (Bonsai 27B Q1) | 1,31 M (adaptador) | no disponible | Apache 2.0 | GGUF LoRA | Especializado en QA offline de MCPZim; requiere fork de llama.cpp |
| Bonsai 27B Q1 (base) | 27B (segun nombre) | no disponible | no disponible en esta ficha | GGUF Q1_0_g128 | Modelo generalista de Prism ML; misma limitacion de motor |
| LoRA genericos sobre Llama o Mistral | variable | variable | variable | safetensors / GGUF | Ecosistema de herramientas mucho mas amplio (vLLM, TGI, Ollama) |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada. La diferencia principal frente a adaptadores convencionales es la dependencia de un formato de cuantizacion propietario y de un fork especifico de llama.cpp.

## Limitaciones y advertencias

- El adaptador solo funciona con el GGUF base exacto indicado (revision f10afb35...) y con una compilacion de llama.cpp que soporte Q1_0_g128; otras versiones o motores no lo cargaran.
- La fuerza de adaptador recomendada es 0,25; valores distintos pueden degradar el comportamiento y no han sido evaluados.
- Las evaluaciones publicadas son internas, con 36 y 12 casos, sin validacion externa ni comparacion con benchmarks estandar; la mejora en la suite de estres (3/12 frente a 1/12) sigue siendo baja en terminos absolutos.
- Riesgo de alucinacion: no cuantificado; la cuantizacion a 1 bit del base puede incrementar la perdida de fidelidad en respuestas largas o matizadas.
- Idiomas soportados no documentados; el ajuste parece orientado a un unico dominio y probablemente a un solo idioma.
- Sesgos: no documentados.
- Uso comercial: la licencia Apache 2.0 del adaptador lo permite, pero conviene verificar la licencia del modelo base Bonsai 27B, no incluida en esta informacion.
- Proyecto de nicho con cero descargas y un unico like en el momento de la consulta; no hay garantia de mantenimiento ni soporte.
- El repositorio tiene un tamano declarado de 0,0 GB y no incluye el modelo base, que debe descargarse por separado.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/sliderforthewin/mcpzim-bonsai-27b-q1-lora
- Modelo base: https://huggingface.co/prism-ml/Bonsai-27B-gguf
- GGUF base exacto (revision f10afb35): https://huggingface.co/prism-ml/Bonsai-27B-gguf/blob/f10afb355f104535e3e3e98cf7ab7795c72bd292/Bonsai-27B-Q1_0.gguf
- Fork de llama.cpp con soporte Q1_0_g128: https://github.com/PrismML-Eng/llama.cpp
