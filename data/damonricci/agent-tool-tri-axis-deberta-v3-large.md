# DamonRicci/agent-tool-tri-axis-deberta-v3-large

## Resumen
El modelo `DamonRicci/agent-tool-tri-axis-deberta-v3-large` es un clasificador de texto multi-tarea construido sobre un backbone `microsoft/deberta-v3-large` afinado por el usuario DamonRicci. Su proposito no es generar texto, sino clasificar semanticamente esquemas de herramientas (tool schemas) dentro de runtimes de agentes autonomos, anticipando el comportamiento de cada herramienta antes de ejecutarla. Forma parte de una arquitectura mayor denominada "Agent Runtime Optimization Middleware", orientada a optimizar el enrutado y el almacenamiento en cache de llamadas a herramientas.

El modelo comparte un unico encoder DeBERTa-v3-Large de 435 millones de parametros y proyecta su representacion hacia tres cabezas de clasificacion independientes que se resuelven en una sola pasada hacia delante. Esas tres cabezas predicen: mutabilidad de estado (READ/WRITE), frontera de ejecucion (LOCAL_INTERNAL/EXTERNAL_API) e invariancia temporal (DETERMINISTIC/VOLATILE). El autor reporta ~15 ms de latencia y 1,7 GB de VRAM en inferencia.

La relevancia del modelo reside en su enfoque de "clasificacion previa" (ahead-of-time) combinada con calibracion de probabilidades mediante temperatura de Platt y una regla de fallo seguro que prioriza la coherencia del estado frente al ahorro de cache. Se distribuye bajo licencia MIT y esta pensado exclusivamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-Large) con tres cabezas de clasificacion multi-tarea sobre backbone compartido |
| Parametros totales | 435 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | No disponible en la informacion proporcionada (el repositorio ocupa 1,7 GB) |

## Arquitectura y entrenamiento
El modelo se basa en `microsoft/deberta-v3-large`, un encoder transformer de 24 capas y aproximadamente 435 millones de parametros, que incorpora deteccion de tokens reemplazados al estilo ELECTRA y comparticion de embeddings con gradientes desacoplados (gradient-disentangled embedding sharing). En lugar de desplegar tres modelos separados, el autor reutiliza el mismo backbone y anade tres cabezas de clasificacion que se computan en una unica pasada hacia delante. Las cabezas resuelven clasificaciones binarias sobre tres ejes: `effect` (READ=0 frente a WRITE=1), `medium` (LOCAL_INTERNAL=0 frente a EXTERNAL_API=1) y `volatility` (DETERMINISTIC=0 frente a VOLATILE=1).

El entrenamiento se realizo sobre 25.000 esquemas de API multi-dominio, procedentes de ToolBench, Berkeley Function-Calling Leaderboard (BFCL), SEAL-Tools, Salesforce APIGen (xLAM) y Glaive. El modelo incorpora calibracion por temperatura de Platt, con parametros tau especificos por cabeza (mutabilidad tau=1,5035 con ECE=0,0145; medio tau=1,3567 con ECE=0,0129; volatilidad tau=1,3429 con ECE=0,0052). Ademas aplica una regla de "barrera de fallo seguro": si P(READ) < 0,95, el clasificador devuelve WRITE, de modo que ante incertidumbre se evita el uso de cache que podria corromper el estado.

## Capacidades
- Clasificacion de mutabilidad de estado de una herramienta: distingue entre operaciones de solo lectura (cacheables) y operaciones que mutan estado persistente (READ/WRITE).
- Clasificacion de frontera de ejecucion: diferencia herramientas locales al proceso o sandbox (LOCAL_INTERNAL) de llamadas a APIs remotas o SaaS (EXTERNAL_API).
- Clasificacion de invariancia temporal: distingue salidas deterministas de salidas volatiles, dependientes del tiempo o estocasticas (DETERMINISTIC/VOLATILE).
- Inferencia multi-tarea en una sola pasada: las tres cabezas se resuelven conjuntamente en ~15 ms segun el autor.
- Calibracion de probabilidades: salidas calibradas por temperatura de Platt, con ECE bajo (0,0052-0,0145 segun la cabeza), lo que permite usar umbrales de confianza de forma fiable.
- Soporte para logica de fallo seguro: la regla interna fuerza WRITE cuando la confianza en READ es inferior a 0,95.
- Analisis semantico de esquemas de herramientas de agentes: consume definiciones de funciones y APIs en ingles.

Limitaciones de capacidad: es un clasificador, no un generador de texto; no realiza tool calling por si mismo ni razonamiento multi-paso, ni soporta vision o audio. No se declara soporte multilingue mas alla del ingles.

## Casos de uso
- Cacheado seguro de resultados de herramientas en runtimes de agentes: el modelo etiqueta cada herramienta como READ o WRITE, de modo que el middleware solo cachea las llamadas que no mutan estado, evitando servir respuestas obsoletas o corruptas desde cache.
- Implementacion de barreras de escritura secuencial: al marcar herramientas como WRITE, permite forzar serializacion de llamadas que mutan estado persistente dentro de un mismo flujo de agente.
- Politicas de TTL y revalidacion diferenciadas: la clasificacion LOCAL_INTERNAL frente a EXTERNAL_API permite asignar TTL largos a herramientas locales y TTL cortos con revalidacion a llamadas remotas a APIs o SaaS.
- Exencion de cacheado de herramientas volatiles: las herramientas marcadas como VOLATILE (dependientes del tiempo o estocasticas, como consultas de cotizaciones o de hora) quedan excluidas automaticamente del cache.
- Auditoria y gobernanza de herramientas en plataformas de agentes: la clasificacion servible como metadato permite a un equipo revisar que herramientas pueden mutar estado o salir a la red antes de habilitarlas en produccion.
- Enrutado y planificacion previa de ejecucion: integrar la clasificacion en el planificador del agente para decidir el orden de las llamadas (lecturas paralelizables, escrituras serializadas) antes de invocar ninguna herramienta.
- Optimizacion de coste y latencia en pipelines de function calling: reducir llamadas redundantes a APIs externas de pago aprovechando el cacheado selectivo que habilita la clasificacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de calibracion (ECE) y de latencia (~15 ms) y VRAM (1,7 GB), pero no incluye resultados de evaluaciones estandar como MMLU, GLUE, HumanEval o similares.

## Requisitos de hardware
- VRAM estimada para inferencia: 1,7 GB segun el autor (coherente con un modelo de 435 millones de parametros en precision completa). Con cuantizacion a int8 o fp16 la huella seria notablemente menor, aunque no se especifican cuantizaciones soportadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre es suficiente; una RTX 3060, RTX 4090 o T4 permiten ejecutarlo con holgura.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna e incluso en hardware modesto, dado su tamano reducido.
- Opciones de despliegue: al ser un modelo de la familia Transformers con pipeline `text-classification`, es desplegable con la libreria Transformers y, presumiblemente, con ONNX Runtime para optimizacion de latencia. No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: el autor reporta aproximadamente 15 ms de latencia en una sola pasada hacia delante. No se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Cabezas / tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agent-tool-tri-axis-deberta-v3-large (este modelo) | 435 M | 3 cabezas (effect, medium, volatility) | No disponible | MIT | HuggingFace |
| agent-tool-effect-deberta-v3-large | 435 M | 1 cabeza (effect: READ/WRITE) | No disponible | No disponible | HuggingFace |
| microsoft/deberta-v3-large (base) | 435 M (350 M segun algunas fuentes) | Modelo base NLU, sin cabezas de tarea especificas de herramientas | No disponible | MIT | HuggingFace / GitHub microsoft/DeBERTa |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. La diferencia principal entre el modelo de este fichero y la variante `agent-tool-effect-deberta-v3-large` es el numero de ejes de clasificacion (tres frente a uno).

## Limitaciones y advertencias
- Idiomas: el modelo solo declara soporte para ingles; su rendimiento con esquemas de herramientas en otros idiomas no esta documentado.
- Es un clasificador, no un generador: no puede ejecutar herramientas, razonar de forma multi-paso ni generar texto; su funcion se limita a etiquetar esquemas.
- Riesgo de clasificacion incorrecta: una prediccion erronea de READ sobre una herramienta que en realidad muta estado podria provocar corrupcion de estado si se usa cache; la barrera de fallo seguro (P(READ) < 0,95 implica WRITE) mitiga parcialmente este riesgo, pero no lo elimina.
- Contexto y formato de entrada: no se especifica la longitud maxima de contexto ni el formato exacto esperado de los esquemas de herramientas, lo que complica la integracion sin pruebas adicionales.
- Datos de entrenamiento acotados: los 25.000 esquemas provenientes de ToolBench, BFCL, SEAL-Tools, APIGen (xLAM) y Glaive pueden no cubrir dominios, APIs propietarias o convenciones de esquema especificas de cada organizacion.
- Adopcion muy baja: el modelo registra 0 descargas y 1 "like" en el momento de la consulta, por lo que no existe validacion externa ni comunidad de usuarios que respalde su calidad en produccion.
- Ausencia de benchmarks publicos: no hay resultados de evaluacion independiente que permitan comparar su precision real frente a alternativas.
- Licencia MIT: permite uso comercial y modificacion sin restricciones relevantes, aunque se recomienda conservar la atribucion correspondiente.
- Fechas de creacion y actualizacion: los metadatos indican fecha de creacion 2026-10-02, lo que resulta anomala respecto a la fecha actual; conviene verificar la vigencia del repositorio.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/DamonRicci/agent-tool-tri-axis-deberta-v3-large
- Modelo hermano (variante de un solo eje): https://huggingface.co/DamonRicci/agent-tool-effect-deberta-v3-large
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Repositorio de DeBERTa en GitHub: https://github.com/microsoft/DeBERTa
- Referencia sobre DeBERTa-v3-large: https://www.emergentmind.com/topics/deberta-v3-large-model
- Visualizador del modelo base: https://hfviewer.com/microsoft/deberta-v3-large
