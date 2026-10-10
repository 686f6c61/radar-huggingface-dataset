# manjunathshiva/opendecider-small-td-GGUF

## Resumen

OpenDecider-small-td GGUF es la coleccion de ficheros GGUF del modelo de decision OpenDecider-small-td, desarrollado por manjunathshiva. No es un modelo generativo al uso: responde preguntas tipadas (`choice`, `score`, `noul`/si-no) sobre un texto o un JSON devolviendo una probabilidad para cada opcion en lugar de redactar una respuesta. El paquete `opendecider` construye el prompt exacto con el que se entreno el modelo y lee las probabilidades de cada opcion a partir de los log-probabilities de los tokens que expone el servidor de inferencia.

El modelo tiene 4.022.468.096 parametros (unos 4 B) y se distribuye bajo licencia Apache 2.0. Su proposito es cubrir la denominada "decision de sistema 1" en flujos de negocio: triaje de tickets, verificacion de facturas, alertas de seguridad y monitorizacion de trazas de agentes. Frente a un LLM generativo, el valor esta en que la salida es una distribucion de probabilidad calibrada sobre un conjunto cerrado de opciones, lo que permite automatizar directamente las decisiones con alta confianza y escalar al humano el resto.

Esta publicacion concreta aporta los pesos cuantizados para LM Studio, Ollama y cualquier runtime basado en llama.cpp. Segun la model card, el fichero Q8_0 coincide con el modelo en precision completa en 1.972 de 2.000 preguntas del conjunto typed-decisions (98,6 %) con una precision practicamente identica (0,794 frente a 0,792), lo que convierte la cuantizacion en una opcion viable en produccion sin perdida medible de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de ~4 B; la model card no detalla la arquitectura concreta) |
| Parametros totales | 4.022.468.096 (~4 B) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0 y Q4_K_M; referencia en precision completa bf16 (PyTorch) y variante MLX de 8 bits en otro repositorio |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors/bf16 en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna (tipo de transformer, atencion, tokenizador ni ventana de contexto). Lo que si se documenta es el paradigma de uso: el modelo esta afinado sobre el split de entrenamiento del conjunto typed-decisions para responder preguntas tipadas con una probabilidad por opcion, y el paquete `opendecider` se encarga de reproducir exactamente el formato de prompt del entrenamiento y de extraer de los log-probabilities del servidor la probabilidad asignada a cada alternativa. Esta dependencia del formato de prompt es fuerte: la propia model card indica que el `/v1/systemone` nativo de Ollama, que construye un prompt distinto, cuesta unos 9 puntos de precision (0,583 frente a 0,669 en OpenDecider-small).

No hay datos publicados sobre numero de tokens de entrenamiento, composicion del dataset, tecnicas de alineamiento (RLHF, DPO u otras) ni innovaciones de eficiencia en atencion o decodificacion. La comparativa de cuantizaciones se realizo sobre 2.000 preguntas del conjunto typed-decisions, medida a traves del motor llama.cpp de Ollama, y la model card indica que LM Studio, al ejecutar el mismo motor, devolvio log-probabilities identicas sobre el mismo fichero.

## Capacidades

- Clasificacion zero-shot y decision tipada: responde preguntas de tipo `choice` (elegir entre opciones con criterios descritos en lenguaje natural), `score` (puntuacion), `noul`/si-no (booleanas) y devuelve una probabilidad por cada opcion.
- Decisiones calibradas: la salida es una distribucion de probabilidad sobre opciones cerradas, lo que permite fijar umbrales de confianza y automatizar solo los casos por encima del umbral.
- Entrada de texto libre o JSON, con criterios de decision expresados en el propio prompt.
- Integracion como herramienta en asistentes mediante MCP: expone las funciones `decide`, `choose`, `yes_no` y `score` a clientes como Claude Code, Claude Desktop y Cursor.
- Integracion con frameworks de agentes: agno, LangChain, LlamaIndex, CrewAI, agent-framework, google-adk, pydantic-ai y strands, con el componente `DecisionRouter` para enrutado de flujos.
- Servicio HTTP compatible con la API `/v1/systemone` de Jev a traves de `opendecider serve`.
- Capacidades generativas de texto: no descritas; el modelo esta orientado a devolver probabilidades sobre opciones, no a redactar respuestas.
- Vision, audio, tool calling generativo o razonamiento multi-paso: no disponibles en la informacion proporcionada.

## Casos de uso

- Triaje de tickets de soporte: se define una pregunta `choice` con departamentos como opciones (facturacion, tecnico, otros) y criterios descriptivos; el modelo devuelve la probabilidad de cada departamento y el sistema enruta automaticamente los casos con confianza alta.
- Deteccion de riesgo de churn: una pregunta booleana (`noul`) sobre si el usuario amenaza con cancelar o marcharse permite marcar conversaciones para retencion sin necesidad de un LLM generativo ni de reglas manuales.
- Verificacion de facturas: preguntas tipadas sobre campos concretos de un JSON (importe coherente, duplicado, proveedor esperado) con salida probabilistica para decidir si la factura se aprueba o se revisa.
- Triaje de alertas de seguridad: clasificacion de alertas en categorias cerradas con umbral de confianza, de modo que solo las alertas dudosas llegan al analista humano.
- Monitorizacion de trazas de agentes: evaluacion automatizada de cada paso de un agente con preguntas tipo "la accion es coherente con el objetivo" o "la herramienta elegida es la adecuada", usando la probabilidad como senal de calidad.
- Enrutado en flujos de agentes multiherramienta: mediante `DecisionRouter` en agno (o integraciones equivalentes), seleccionar que agente o herramienta debe atender cada peticion entrante.
- Clasificacion de documentos y correo entrante: preguntas `choice` sobre tipologia documental con criterios redactados en lenguaje natural, sin reentrenamiento.
- Automatizacion con supervision humana: con `opendecider[mcp]`, un asistente puede resolver por si mismo las decisiones con probabilidad alta y consultar al usuario en el resto.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de fidelidad de las cuantizaciones frente al modelo en precision completa sobre 2.000 preguntas del conjunto typed-decisions:

| Fichero | Tamano | Misma respuesta top que precision completa | Precision |
|---|---|---|---|
| Precision completa (PyTorch, bf16) | 8 GB | (referencia) | 0,792 |
| `opendecider-small-td-q8_0.gguf` | 4,3 GB | 1.972 / 2.000 (98,6 %) | 0,794 |
| `opendecider-small-td-q4_k_m.gguf` | 2,5 GB | 1.875 / 2.000 (93,8 %) | 0,803 |

La model card senala que la precision ligeramente superior de Q4_K_M respecto a la precision completa queda dentro del ruido de 2.000 decisiones (cambia aproximadamente 1 respuesta de cada 16) y recomienda Q8_0 como fichero de referencia, reservando Q4_K_M para maquinas con poca memoria.

Dato adicional de sensibilidad al prompt: el `/v1/systemone` nativo de Ollama (Ollama 0.35.1 o superior) construye un prompt distinto del de entrenamiento y cuesta unos 9 puntos de precision (0,583 frente a 0,669 en OpenDecider-small). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria segun cuantizacion (estimacion a partir de los tamanos de fichero publicados, mas el overhead del runtime y del contexto): Q4_K_M unos 3-4 GB; Q8_0 unos 5-6 GB; precision completa bf16 unos 9-10 GB.
- Q4_K_M (2,5 GB) cabe en GPU de consumo con 6 GB o mas de VRAM, asi como en equipos con memoria unificada.
- Q8_0 (4,3 GB, el recomendado) cabe comodamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en Mac con memoria unificada suficiente.
- Precision completa bf16 (8 GB) requiere aproximadamente 10-12 GB de VRAM; en GPU profesionales como A100 o H100 el modelo ocupa una fraccion minima de memoria y queda limitado por otros factores.
- Opciones de despliegue: llama.cpp y todo lo construido sobre el, incluyendo Ollama (`ollama pull hf.co/manjunathshiva/opendecider-small-td-GGUF:Q8_0`) y LM Studio; `opendecider serve` expone la API `/v1/systemone` compatible con Jev; las guias del proyecto cubren tambien vLLM.
- Aviso relevante para Mac: el motor MLX de LM Studio no devuelve log-probabilities, por lo que en macOS hay que usar este build GGUF en LM Studio o, alternativamente, el modelo MLX de 8 bits con la integracion MLX del paquete.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos en la informacion proporcionada sobre otros modelos de decision directamente comparables (misma tarea de decision tipada con salida probabilistica). La comparacion con LLM generativos de tamano similar no es homogenea, porque la tarea y la metrica difieren:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenDecider-small-td GGUF | 4,02 B | no disponible | Apache 2.0 | GGUF (Q8_0, Q4_K_M) | Modelo de decision: salida probabilistica por opcion |
| OpenDecider-small-td (precision completa) | 4,02 B | no disponible | Apache 2.0 | PyTorch bf16 | Version de referencia del mismo modelo |
| OpenDecider-small-mlx-8bit | no disponible | no disponible | no disponible | MLX 8 bits | Variante para el motor MLX, sin log-probabilities |
| LLM generativos de ~3-4 B | no disponible | no disponible | no disponible | no disponible | Categoria distinta: generacion de texto, no decision tipada |

## Limitaciones y advertencias

- El modelo solo esta entrenado y evaluado en ingles; no hay evidencia de comportamiento multilingue.
- Dependencia critica del formato de prompt: hay que usar el prompt que construye el paquete `opendecider`. Servirlo con el `/v1/systemone` nativo de Ollama cuesta aproximadamente 9 puntos de precision; los modelos entrenados tambien con el prompt de Ollama estan en preparacion segun la model card.
- Requiere un servidor que devuelva log-probabilities de tokens. El motor MLX de LM Studio no lo hace, por lo que en ese caso hay que usar el build GGUF o la variante MLX con la integracion correspondiente.
- La salida es una probabilidad, no una garantia: una probabilidad alta en una decision erronea sigue siendo un error. Se recomienda fijar umbrales de confianza y derivar a revision humana los casos dudosos.
- Riesgo de alucinacion en el sentido de decisiones confiadamente incorrectas sobre entradas fuera de la distribucion de entrenamiento; no hay datos publicados sobre robustez ante entradas adversarias o dominios nuevos.
- No se publican datos sobre sesgos, composicion del dataset de entrenamiento, numero de tokens ni proceso de alineamiento, lo que dificulta auditar el comportamiento en dominios sensibles.
- Longitud de contexto no documentada: se desconoce el limite practico para entradas largas (trazas de agente o documentos extensos).
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y conservacion de avisos.
- Al ser un modelo de decision, no debe usarse como generador de texto: las capacidades generativas no estan descritas en la informacion disponible.
- El numero de descargas (440) y de likes (2) indica una adopcion todavia muy limitada, con poca validacion independiente por parte de la comunidad.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/manjunathshiva/opendecider-small-td-GGUF
- Modelo base (precision completa): https://huggingface.co/manjunathshiva/opendecider-small-td
- Variante MLX de 8 bits: https://huggingface.co/manjunathshiva/opendecider-small-mlx-8bit
- Repositorio del paquete opendecider: https://github.com/manjunathshiva/opendecider
- Documentacion: https://manjunathshiva.github.io/opendecider/
- Guia de inicio: https://manjunathshiva.github.io/opendecider/getting-started/
- Eleccion de modelo: https://manjunathshiva.github.io/opendecider/models/
- Guia de servicio: https://manjunathshiva.github.io/opendecider/guides/serve/
- Guia de servidores de modelos (LM Studio, Ollama, vLLM): https://manjunathshiva.github.io/opendecider/guides/model-servers/
- Guia de automatizacion de decisiones con confianza: https://manjunathshiva.github.io/opendecider/guides/confident-automation/
- Guia de asistentes de IA (MCP): https://manjunathshiva.github.io/opendecider/guides/mcp/
- Referencia de la API de Python: https://manjunathshiva.github.io/opendecider/reference/python-api/
- Referencia de la API HTTP: https://manjunathshiva.github.io/opendecider/reference/http-api/
- Logotipo del proyecto: https://raw.githubusercontent.com/manjunathshiva/opendecider/main/assets/logo-lockup.png
