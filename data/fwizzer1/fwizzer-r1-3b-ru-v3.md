# fwizzer1/Fwizzer-R1-3B-RU-v3

## Resumen

Fwizzer-R1-3B-RU-v3 (denominado "Titan Edition" por su autor, el usuario fwizzer1) es un modelo de generacion de texto de 3.429.012.480 parametros (unos 3,43 B) afinado para razonamiento explicito en ruso e ingles. Se construye sobre `unsloth/Ministral-3-3B-Instruct-2512-bnb-4bit`, un modelo de la familia Mistral 3 / Ministral de 3 B en version cuantizada a 4 bits, y no se entrena desde cero: el autor indica que parte de los pesos ya ajustados de su version anterior, Fwizzer-R1-3B-RU-v2, para preservar el dominio del ruso y concentrar el presupuesto de gradiente en logica, codigo y matematicas.

La propuesta tecnica se centra en el chain-of-thought explicito dentro de etiquetas `<think>`, entrenado sobre el dataset propio `fwizzer1/fwizzer-v3-titan-agentic` con 18.743 trayectorias verificadas, mas un corpus de 1.000 muestras de frontend de gama alta orientado a la generacion de interfaces HTML/CSS modernas. El modelo se distribuye en safetensors y GGUF, con soporte declarado para llama.cpp, LM Studio, Ollama y vLLM, lo que lo situa en el segmento de modelos compactos ejecutables en hardware de consumo.

Su relevancia practica es doble: por un lado, ofrece un caso de estudio de ajuste continuado sobre un modelo base cuantizado para un idioma concreto (ruso) con recursos limitados; por otro, su licencia `fwizzer-titan-eula` y el aviso de la model card sobre un posible traslado de la linea v3 a un regimen propietario obligan a revisar con cuidado las condiciones antes de cualquier despliegue en produccion. El modelo acumula 144 descargas y 2 "likes" en el momento de redactar esta ficha, con benchmarks declarados por el autor y no verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Mistral 3 (Ministral 3B); tag de arquitectura `mistral3` |
| Parametros totales | 3.429.012.480 (~3,43 B), dato real de los safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | safetensors (precision original del repo, 6,5 GB) y GGUF; los niveles concretos de cuantizacion GGUF no se detallan en la informacion disponible |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | `fwizzer-titan-eula` (licencia propia, campo `license: other`) |
| Formato de pesos | safetensors y GGUF |
| Modelo base | `unsloth/Ministral-3-3B-Instruct-2512-bnb-4bit` |
| Dataset de ajuste | `fwizzer1/fwizzer-v3-titan-agentic` (18.743 trayectorias) |
| Pipeline | text-generation |
| Fecha de creacion / actualizacion | 11/09/2026 / 12/09/2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de decodificacion, heredado de la arquitectura Mistral 3 en su variante Ministral 3B, con aproximadamente 3,43 B de parametros. El punto de partida declarado es la version cuantizada a 4 bits del instructivo (`bnb-4bit`) publicada por Unsloth, sobre la que el autor aplica un ajuste continuado en lugar de un entrenamiento desde cero. Segun la model card, los pesos de Fwizzer-R1-3B-RU-v2 se usan como base intermedia para no degradar la competencia linguistica en ruso ya adquirida y dedicar el resto del entrenamiento a razonamiento, autocomprobacion y programacion. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF, DPO u otras variantes de alineacion preferencial.

La innovacion declarada es un esquema de razonamiento en dos fases: el modelo genera su cadena de pensamiento dentro de etiquetas `<think> ... </think>`, donde revisa pasos, recalcula casos limite y descarta hipotesis erroneas, y solo despues del cierre de la etiqueta emite la respuesta final estructurada. El dataset de ajuste, `fwizzer1/fwizzer-v3-titan-agentic`, contiene 18.743 trayectorias verificadas segun el autor, e incorpora ademas un corpus de 1.000 ejemplos de frontend orientados a interfaces con efecto glassmorphism, microanimaciones y HTML/CSS sin dependencias externas. La model card tambien menciona un ajuste deliberado para reducir negativas y moralizaciones en las respuestas, lo que constituye una decision de alineacion que conviene tener en cuenta en entornos con requisitos de seguridad.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, con plantilla de instrucciones basada en `[SYSTEM_PROMPT] ... [/SYSTEM_PROMPT][INST] ... [/INST]`.
- Razonamiento explicito paso a paso dentro de etiquetas `<think>`, con autocomprobacion y verificacion de casos limite antes de la respuesta final.
- Matematicas: resolucion de problemas aritmeticos y de probabilidad con justificacion mediante metodos alternativos, segun los ejemplos de la model card (probabilidad de extraccion de bolas de colores, demostracion por dos vias).
- Generacion de codigo: el autor declara resultados de 70,8 en Pass@1 sobre HumanEval y orientacion especifica a codigo full-stack.
- Creacion de interfaces web: generacion de HTML y CSS vanilla con glassmorphism, animaciones y paletas armonicas, sin librerias externas.
- Razonamiento agentico multi-paso: la etiqueta `agentic` y el nombre del dataset de entrenamiento apuntan a flujos de varios pasos, aunque no se detalla el protocolo.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es exclusivamente text-generation.
- Modo de pensamiento: si, mediante el bloque `<think>` incluido en el prompt de sistema recomendado por el autor.

## Casos de uso

- Asistente conversacional en ruso: el modelo mantiene conversaciones multi-turno con plantilla de sistema e instruccion, y esta especificamente ajustado para no degradar la gramatica rusa gracias al ajuste continuado sobre los pesos de v2.
- Resolucion de problemas matematicos con justificacion: util para generar soluciones paso a paso verificables en entornos educativos o de autoevaluacion, aprovechando el bloque `<think>` para exponer el razonamiento antes del resultado.
- Generacion de codigo en pipelines de desarrollo: puede producir funciones y fragmentos de codigo en respuestas estructuradas; al no documentarse tool calling, la integracion con CI/CD requeriria envoltorios propios que parseen la salida.
- Maquetacion de interfaces web: generacion directa de HTML y CSS vanilla con estetica moderna (glassmorphism, microanimaciones), util para prototipado rapido de paneles, tarjetas de producto o dashboards.
- Despliegue local en estaciones de trabajo sin GPU dedicada: con cuantizacion GGUF y llama.cpp u Ollama, el modelo cabe en equipos de gama media, lo que permite asistentes de codigo offline.
- Procesamiento por lotes de documentacion tecnica en ruso: traduccion, resumen o reescritura de textos largos divididos en fragmentos, con la advertencia de que la longitud de contexto no esta documentada.
- Agentes de tarea multiple en entornos controlados: el entrenamiento sobre un dataset agentico permite encadenar subtareas (analizar, calcular, redactar) en un solo flujo de razonamiento, siempre que se valide la salida con herramientas externas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el `model-index` de la model card. Ninguno de ellos figura como verificado (`verified: false`), por lo que deben tratarse como cifras autodeclaradas y no reproducidas de forma independiente.

| Benchmark | Metrica | Resultado | Verificado |
|---|---|---|---|
| GSM8K | Accuracy | 87,1 | No |
| MATH | Accuracy | 62,4 | No |
| HumanEval | Pass@1 | 70,8 | No |

No se han publicado en la informacion disponible resultados de MMLU, ni comparativas oficiales con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16 (pesos de ~3,43 B): aproximadamente 7 GB solo de pesos, mas cache KV y overhead, en torno a 9-11 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,5-4 GB de pesos, con un total practico de 5-6 GB.
- VRAM estimada en cuantizacion GGUF Q4_K_M: aproximadamente 2-2,5 GB de pesos, con un total practico de 3,5-5 GB. Estas cifras son estimaciones aritmeticas a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas:para BF16, una RTX 4090 (24 GB), A100 40 GB o H100; para cuantizaciones de 4-8 bits, cualquier GPU consumer con 6-8 GB o mas de VRAM.
- Cabe en GPU de consumo: si. Con cuantizacion Q4 cabe en tarjetas de 6 GB (RTX 3060, RTX 2060, GTX 1660 con suficiente memoria) y en GPUs integradas con memoria unificada de 8-16 GB; en BF16 requiere 12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para GGUF; vLLM para safetensors en servidor. Las etiquetas del repositorio incluyen explicitamente `llama.cpp`, `lmstudio`, `ollama` y `vllm`, ademas de `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | HumanEval | Licencia | Formatos |
|---|---|---|---|---|---|---|
| Fwizzer-R1-3B-RU-v3 | 3,43 B | No disponible | 87,1 (no verificado) | 70,8 Pass@1 (no verificado) | fwizzer-titan-eula | safetensors, GGUF |
| unsloth/Ministral-3-3B-Instruct-2512-bnb-4bit (base) | ~3 B | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | Pesos cuantizados a 4 bits (bnb-4bit) |
| Fwizzer-R1-3B-RU-v2 (version anterior) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de benchmarks, contexto o licencia de los modelos comparables, por lo que la comparativa cuantitativa con alternativas de la misma categoria (por ejemplo otros modelos de 3-4 B) queda como "no disponible".

## Limitaciones y advertencias

- Los tres benchmarks publicados estan marcados como no verificados en el `model-index`; proceden del propio autor y no han sido reproducidos por terceros.
- El modelo se ajusta sobre una base ya cuantizada a 4 bits (`bnb-4bit`); la cuantizacion previa al ajuste puede limitar el techo de calidad frente a un ajuste sobre pesos en precision completa.
- La longitud de contexto no esta documentada, lo que impide planificar tareas de contexto largo con garantias.
- El soporte esta centrado en ruso e ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- La model card declara que el modelo se ha ajustado para evitar negativas y moralizaciones. Esto implica un mayor riesgo de generar contenido que otros modelos rechazarian, algo critico en despliegues orientados a usuario final o en entornos regulados.
- Riesgo de alucinacion inherente a un modelo de 3 B: aunque el razonamiento explicito reduce errores aritmeticos, no los elimina; se recomienda validacion externa en matematicas, codigo y datos factuales.
- Licencia `fwizzer-titan-eula`: es una licencia personalizada del autor, no una licencia abierta estandar. Debe revisarse el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones de redistribucion y explotacion no estan detalladas en la informacion disponible.
- La model card advierte de que la linea v3 "Titan" puede migrar a un regimen propietario o cerrado en futuras compilaciones corporativas, lo que introduce incertidumbre sobre la continuidad del modelo abierto.
- Adopcion muy baja en el momento de la consulta (144 descargas, 2 likes), con lo que existe poca validacion comunitaria sobre su comportamiento real.
- No hay informacion sobre sesgos, composicion demografica del dataset de ajuste ni evaluaciones de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fwizzer1/Fwizzer-R1-3B-RU-v3
- Dataset de ajuste: https://huggingface.co/datasets/fwizzer1/fwizzer-v3-titan-agentic
- Modelo base: https://huggingface.co/unsloth/Ministral-3-3B-Instruct-2512-bnb-4bit
- Version anterior (base de pesos del ajuste continuado): https://huggingface.co/fwizzer1/Fwizzer-R1-3B-RU-v2
- Licencia: archivo LICENSE del repositorio del modelo (https://huggingface.co/fwizzer1/Fwizzer-R1-3B-RU-v3/blob/main/LICENSE)
- Resultados de busqueda web: las consultas realizadas no devolvieron enlaces relevantes sobre este modelo (unicamente paginas del servicio de correo de Orange), por lo que no se dispone de papers, blogs tecnicos, repositorios ni demos adicionales que referenciar.
