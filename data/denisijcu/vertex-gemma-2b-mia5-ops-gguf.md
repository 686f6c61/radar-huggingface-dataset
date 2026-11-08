# Denisijcu/vertex-gemma-2b-mia5-ops-gguf

## Resumen

Vertex-MIA5-Core es un ajuste fino del modelo Gemma 2 de 2.000 millones de parametros (variante instruct, `unsloth/gemma-2-2b-it-bnb-4bit`) especializado en operativa logistica de un centro de clasificacion (*sortation center*). Lo desarrolla Denis Sanchez Leyva (Vertex Coders LLC, Miami) y se distribuye en formato GGUF cuantizado Q4_K_M con licencia Apache 2.0. El modelo esta entrenado mediante QLoRA sobre una topologia operativa concreta: lineas de consolidacion B, C, D, E, G, H, J, estacion linear de *small sort*, protocolo de *wrong lanes* con doble retorno y misiones de *water spider* hacia *staging* y puertas de embarque 109-172.

La relevancia de este modelo no esta en su capacidad generalista, sino en su hiperespecializacion: transforma un modelo conversacional de proposito general en un asistente de decisiones operativas para un almacen concreto, con un formato de prompt ChatML que recibe estado de linea, ubicacion matricial (por ejemplo `G2-G-7`) y porcentaje de llenado. Es un caso representativo de ajuste fino de bajo coste sobre modelos pequenos para dominios verticales, desplegable en hardware modesto gracias a la cuantizacion Q4_K_M y al tamano reducido del modelo base.

El repositorio ocupa 1,7 GB y acumula 0 descargas y 1 like en el momento de la consulta, lo que indica un modelo de nicho, probablemente de uso interno o experimental, sin adopcion publica significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), ajuste fino QLoRA |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | es (espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | unsloth/gemma-2-2b-it-bnb-4bit |
| Tamano del repositorio | 1,7 GB |
| Metodo de entrenamiento | QLoRA |
| Formato de prompt | ChatML (`<|im_start|>` / `<|im_end|>`) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 2 2B Instruct, un transformer decoder-only denso de 2.614 millones de parametros. Sobre esa base se aplica un ajuste fino QLoRA, es decir, cuantizacion de 4 bits del modelo base (la variante `bnb-4bit` de Unsloth) con adaptadores de bajo rango entrenados sobre el corpus operativo del centro MIA5. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la longitud de contexto nativa ni si se aplicaron fases de RLHF o DPO adicionales.

La innovacion tecnica del modelo no reside en la arquitectura, sino en la codificacion del dominio: el prompt de sistema define un rol de inteligencia logistica y el modelo aprende a razonar sobre una topologia fisica concreta (bifurcacion desde *inbound*, cauce principal hacia lineas B/C/D/E/G/H/J, desvio a estacion linear para *small sort*, protocolo de *wrong lanes* con reubicacion manual o re-inyeccion a *inbound*, y priorizacion de *wrapping* segun llenado y *Critical Pull Time*). El formato ChatML con etiquetas `im_start`/`im_end` es el esperado por el modelo en inferencia.

## Capacidades

- Generacion de texto conversacional en espanol con rol de asistente logistico.
- Razonamiento operativo sobre estado de lineas: interpreta ubicaciones matriciales (por ejemplo `G2-G-7`), porcentajes de llenado y estado de flujo.
- Soporte de decisiones de enrutamiento: cauce principal frente a desvio a estacion linear de *small sort*.
- Aplicacion del protocolo de *wrong lanes*: reubicacion manual entre lineas adyacentes o re-inyeccion completa a *inbound* en saturacion.
- Planificacion de misiones de *water spider*: priorizacion de *wrapping* por llenado y *Critical Pull Time*, traslado a *staging* y asignacion de puertas de embarque (109-172).
- Conversacion multi-turno con contexto de estado operativo.
- No se documentan capacidades de *tool calling*, *function calling*, agentes multi-paso, vision, audio ni modo de razonamiento extendido (*thinking*).

## Casos de uso

- Asistente de operador de linea en el *sortation center*: el modelo recibe el estado de una linea (por ejemplo `G`, ubicacion `G2-G-7` al 95% de llenado) y devuelve la accion recomendada segun el protocolo de *wrong lanes*, reduciendo la dependencia de supervisores para decisiones repetitivas.
- Enrutamiento de paqueteria pequena: dado un flujo de *inbound*, el modelo decide si la paqueteria va por el cauce principal hacia las lineas de consolidacion o se desvia a la estacion linear de *small sort*, usando la descripcion de sensores opticos y *shoulders* del dominio.
- Gestion de saturacion en picos: cuando una linea supera umbrales de llenado, el modelo propone la re-inyeccion completa a *inbound* para redistribucion por el flujo natural de la estera principal, frente a la reubicacion manual entre lineas adyacentes.
- Priorizacion de *wrapping* de seguridad: el modelo ordena tareas de envoltura segun porcentaje de llenado y *Critical Pull Time*, ayudando a cumplir ventanas de salida.
- Coordinacion de *water spider* y *outbound*: asignacion de traslados a *staging* y seleccion de puerta de embarque dentro del rango 109-172 en funcion del estado reportado.
- Formacion de nuevos operadores: el modelo actua como simulador conversacional que explica la topologia MIA5 y responde a escenarios hipoteticos de linea y saturacion antes de la incorporacion a planta.
- Integracion en un panel de operaciones: al ser un GGUF Q4_K_M de 1,7 GB, puede ejecutarse en local dentro de la infraestructura del almacen para consultas de baja latencia sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con la cuantizacion Q4_K_M publicada (1,7 GB de pesos mas overhead de contexto y cache KV); el contexto efectivo no esta documentado.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090); en entornos profesionales, A100 o H100 no aportan ventaja significativa por el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 4 GB o mas, e incluso en CPU via llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| Vertex-MIA5-Core (este) | 2,61 B | no disponible | Logistica MIA5 | Apache 2.0 | GGUF Q4_K_M |
| Gemma 2 2B Instruct (base) | 2,61 B | no disponible | Generalista | Gemma Terms | safetensors, GGUF |
| Vertex-Gemma Chess (mismo autor) | 2 B (base Gemma 2) | no disponible | Ajedrez tactico | no disponible | no disponible |

La comparacion directa con alternativas de la misma categoria (asistentes logisticos verticales) no esta disponible: no se han identificado modelos publicos equivalentes en la informacion consultada. Frente a su base, Vertex-MIA5-Core sacrifica generalidad por precision en el dominio logistico concreto del centro MIA5.

## Limitaciones y advertencias

- Modelo de nicho extremo: su utilidad fuera de la topologia MIA5 (lineas B/C/D/E/G/H/J, puertas 109-172) es practicamente nula; no generaliza a otros almacenes sin reentrenamiento.
- Riesgo de alucinacion en detalles operativos: al ser un ajuste fino sobre un corpus pequeno y especifico, puede inventar ubicaciones, protocolos o numeros de puerta no presentes en el entrenamiento.
- Idioma: solo se declara espanol; el rendimiento en otros idiomas no esta documentado.
- Longitud de contexto no disponible: no se puede garantizar el manejo de estados operativos extensos o conversaciones largas.
- Sin datos de benchmarks: no hay evidencia publica de calidad frente a la base Gemma 2 2B en tareas generales ni en tareas logisticas.
- Adopcion practicamente nula (0 descargas, 1 like): no hay validacion externa ni reportes de uso en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 2 tiene sus propios terminos de uso que deben respetarse al redistribuir o desplegar derivados.
- No se documentan capacidades de *tool calling* ni de agente, por lo que no debe asumirse integracion automatica con sistemas de gestion de almacen sin una capa de orquestacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/Denisijcu/vertex-gemma-2b-mia5-ops-gguf
- Modelo base: https://huggingface.co/unsloth/gemma-2-2b-it-bnb-4bit
- Otro modelo del mismo autor (Vertex-Gemma Chess): https://huggingface.co/Denisijcu/vertexgemma
- Gemma en Vertex AI y GKE (Google Cloud): https://cloud.google.com/blog/products/ai-machine-learning/gemma-model-available-in-vertex-ai-and-via-gke
