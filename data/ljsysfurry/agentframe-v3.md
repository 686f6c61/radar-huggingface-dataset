# ljsysfurry/AgentFrame-v3

## Resumen

AgentFrame-v3 es un framework de software para la gestión de contexto en agentes de IA, no un modelo de lenguaje en sí. Desarrollado por el usuario ljsysfurry (repositorio GitHub ljsysfurryACE/AgentFrame-v3), se presenta como un sistema que combina un proveedor LLM externo (por defecto DeepSeek) con un motor de contexto de cuatro capas (ContextEngine) para mantener memoria a largo plazo, comprimir claves de atención y permitir bucles de ejecución de herramientas. La versión indicada en el README es la 4.3.0, con licencia GPL-3.0 y atribución a "Cloud LTE Studio".

El proyecto aborda un problema concreto: la gestión eficiente del contexto en agentes que operan durante largas sesiones, donde el coste de mantener el historial completo crece de forma lineal. Su propuesta combina compresión semántica (selección de qué tokens conservar mediante juicio del LLM) con compresión física (cuantización INT4 de la caché KV mediante una variante de MLA absorbida), alcanzando según sus pruebas una reducción total de aproximadamente 115 veces en el espacio ocupado por el contexto. En HuggingFace el repositorio tiene cero descargas y cero likes, y no se especifica pipeline, licencia ni idiomas en los metadatos; toda la información técnica proviene del README.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework de gestion de contexto para agentes (no es un modelo de lenguaje) |
| Parametros totales | No aplica (no es un modelo con pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | Gestionada por el framework; depende del proveedor LLM (por defecto DeepSeek) |
| Tipos de cuantizacion | INT4 simetrico con escala por canal para la caché KV (compresion fisica); Top-K con precision 16-bit para bloques criticos (en pruebas, no integrado) |
| Idiomas soportados | No especificado (el README esta en chino; el framework no impone restricciones de idioma) |
| Licencia | GPL-3.0 (segun README); en HuggingFace figura como "no disponible" |
| Formato de pesos | No aplica (codigo Python; no hay pesos de modelo) |

## Arquitectura y entrenamiento

AgentFrame no es un modelo entrenado, sino un framework de software que orquesta la memoria y el contexto de un agente. Su arquitectura se organiza en un motor central (ContextEngine) con cuatro capas: L1 de cognicion (MetaCog, descompone tareas y detecta huecos de informacion), L2 de enrutado (LandmarkRouter, recupera landmarks relevantes mediante softmax jerarquico), L3 de almacenamiento (AbsorbedMLA, que implementa una variante de Multi-head Latent Attention con cuantizacion INT4) y L4 fisica (KVPager, que gestiona paginacion de la caché KV con una curva de olvido exponencial). El motor se conecta a un proveedor LLM externo (DeepSeek por defecto, con soporte para modo thinking y bucles de herramientas) y a un proveedor de embeddings (hash o API).

La innovacion principal reside en el sistema de compresion dual. Por un lado, la compresion semantica (MemoryDirector) usa el propio LLM para decidir que tokens merecen conservarse, logrando un factor de 3,2x al eliminar contenido irrelevante como conversacion trivial. Por otro lado, la compresion fisica (AbsorbedMLA) empaqueta la caché KV en INT4 con escalas por canal, reduciendo el espacio un 28,4x segun mediciones en una GPU L40S con DeepSeek-V2-Lite de 15,7B parametros. El README reporta que ambos factores son ortogonales y se multiplican, alcanzando una reduccion total de ~115x. No se menciona ningun proceso de entrenamiento, ajuste fino o RLHF; el framework se apoya en modelos externos ya entrenados.

## Capacidades

- Gestion de contexto multi-sesion: cada sesion tiene un motor de contexto independiente y su estado puede persistirse en JSON.
- Compresion de caché KV: empaquetado INT4 de los vectores latentes de atencion (576 dimensiones: 512 kv_lora + 64 k_pe), con una reduccion de 29,1x y similitud coseno de 0,998 frente a la representacion original.
- Compresion semantica: el LLM decide que tokens eliminar del contexto, con un factor de compresion de 3,2x en pruebas.
- Curva de olvido exponencial (Aura): la relevancia de cada bloque decae con S(t) = I·2^(-t/τ) y se refuerza con accesos recientes.
- Prefetch por co-ocurrencia: al recuperar un bloque A, precarga bloques B que suelen aparecer junto a A (basado en el proyecto colibrì).
- Persistencia incremental de la caché KV: cada ronda anade bloques sin reescribir el conjunto completo, con tolerancia a fallos (salto de bloques corruptos).
- Reutilizacion de prefijos: consultas con el mismo prefijo reutilizan la ultima recuperacion para mantener bloques calientes.
- Bucle de herramientas (function calling): el agente puede ejecutar codigo y verificar sus resultados, con interceptacion de seguridad.
- API REST y CLI: permite ingerir conocimiento, realizar consultas con generacion del LLM, consultar estadisticas y forzar olvido.

## Casos de uso

- Asistentes de soporte tecnico con memoria prolongada: el framework mantiene el historial de interacciones de un usuario durante semanas sin agotar la ventana de contexto, gracias a la compresion semantica que descarta conversacion irrelevante y conserva solo los hechos clave.
- Agentes de analisis de datos que ejecutan codigo: el bucle de herramientas permite que el agente escriba y ejecute scripts para verificar hipotesis, con la memoria de sesion reteniendo resultados intermedios y errores corregidos.
- Sistemas de recuperacion de conocimiento interno: se pueden ingerir documentos o apuntes con etiquetas y consultarlos posteriormente; la capa L2 de enrutado recupera los fragmentos mas relevantes antes de pasarlos al LLM.
- Chatbots de atencion al cliente multisesion: cada cliente tiene su propio motor de contexto persistente, de modo que el agente recuerda compras anteriores, preferencias y quejas sin necesidad de reentrenar.
- Herramientas de investigacion que requieren razonamiento multi-paso: el framework mantiene el estado de una investigacion (hipotesis, datos, conclusiones parciales) a lo largo de multiples consultas, evitando que el LLM pierda el hilo.
- Desarrollo de agentes autonomos con presupuesto de contexto limitado: al reducir el espacio ocupado por la caché KV en ~115x, se pueden ejecutar agentes en hardware con poca VRAM o con costes de API reducidos, manteniendo ventanas de contexto efectivas mucho mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que AgentFrame no es un modelo sino un framework. El README incluye metricas internas de rendimiento del sistema de compresion:

| Metrica | Valor | Condiciones |
|---|---|---|
| Compresion fisica de caché KV | 29,1x (352B por capa) | INT4 simetrico con escala por canal; similitud coseno 0,998 frente a original |
| Compresion fisica en GPU L40S | 28,4x | DeepSeek-V2-Lite 15,7B, inferencia real |
| Compresion semantica | ~3,2x | Eliminacion de conversacion trivial mediante juicio del LLM |
| Compresion total (multiplicativa) | ~115x | Combinacion de ambas tecnicas |
| Top-K con precision 16-bit | 0/100 bloques invertidos | Prueba independiente, no integrada en el flujo principal |
| Probabilidad de error al usar atencion para priorizar | 95,22% | Simulacion Monte Carlo: la atencion no equivale a importancia de tarea |

Estos datos provienen de las pruebas del autor y no han sido verificados externamente.

## Requisitos de hardware

- El framework en si es ligero: es codigo Python que se ejecuta en CPU para la gestion de memoria y enrutado; no requiere GPU propia.
- La GPU necesaria depende del modelo LLM externo que se conecte (por defecto DeepSeek, que se consume via API, sin hardware local).
- Para usar un modelo local con el framework, se requieren los recursos de ese modelo: por ejemplo, DeepSeek-V2-Lite de 15,7B necesita aproximadamente 10-12 GB de VRAM en cuantizacion INT4, y 16-20 GB en FP16, por lo que cabe en una RTX 4090 o A100.
- Las pruebas del autor se realizaron en una GPU L40S (48 GB VRAM) con DeepSeek-V2-Lite.
- Opciones de despliegue: el framework ofrece CLI, API REST (puerto 8090) y biblioteca Python; se puede integrar con cualquier proveedor LLM que soporte OpenAI-compatible o DeepSeek.
- No se proporcionan datos de latencia o throughput del framework.

## Comparativa con modelos similares

No disponible. AgentFrame no es un modelo de lenguaje, sino un framework de gestion de contexto, por lo que no es directamente comparable con modelos LLM. Como alternativa conceptual, existen otros sistemas de memoria para agentes como MemGPT (Letta) o LangChain Memory, pero no se dispone de datos objetivos de comparacion en la informacion proporcionada. La comparacion mas cercana seria con el proyecto colibrì, citado en el README como fuente de varias tecnicas (prefetch, persistencia, prefijo), aunque no se detallan diferencias concretas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no se puede utilizar directamente para generar texto o razonar; depende de un proveedor LLM externo (DeepSeek por defecto) para cualquier tarea de comprension o generacion.
- La licencia GPL-3.0 implica que cualquier uso o modificacion del codigo debe publicarse bajo la misma licencia, lo que puede ser restrictivo para integraciones comerciales propietarias.
- Los datos de rendimiento (compresion 28,4x, 29,1x, 115x total) provienen de pruebas del propio autor, no verificadas por terceros ni publicadas en un articulo revisado.
- Varias funcionalidades descritas estan marcadas como "disenadas pero no integradas" (por ejemplo, la organizacion Sector-Block-Module o la proteccion Top-K con 16-bit), por lo que el sistema real puede tener menos capacidades de las anunciadas.
- El framework depende de la calidad del LLM subyacente para la compresion semantica; si el LLM elimina tokens importantes, la informacion se pierde de forma irreversible.
- No se especifican los idiomas soportados ni se documentan sesgos; el README esta escrito en chino y la mayoria de los ejemplos de uso estan en ese idioma.
- El repositorio en HuggingFace tiene cero descargas y cero likes, lo que sugiere una adopcion muy limitada y poca validacion por parte de la comunidad.
- No hay informacion sobre seguridad, alucinaciones o mitigacion de sesgos; el unico mecanismo de seguridad mencionado es una "interceptacion" en el bucle de herramientas, sin detalles tecnicos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ljsysfurry/AgentFrame-v3
- Model card (README) en HuggingFace: https://huggingface.co/ljsysfurry/AgentFrame-v3/blob/main/README.md
- Repositorio en GitHub: https://github.com/ljsysfurryACE/AgentFrame-v3
- README del subproyecto agentframe en GitHub: https://github.com/ljsysfurryACE/AgentFrame-v3/blob/master/agentframe/README.md
