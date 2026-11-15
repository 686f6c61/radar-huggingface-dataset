# hirundo-io/gpt-oss-20b-pi-hardened-generalist-activationguard

## Resumen

`hirundo-io/gpt-oss-20b-pi-hardened-generalist-activationguard` es un modelo publicado en Hugging Face por el usuario `hirundo-io`, construido a partir de la familia `gpt-oss-20b` de OpenAI y modificado con un objetivo declarado en su propio nombre: endurecerlo frente a ataques de prompt injection ("pi-hardened") y añadir una capa de guardrail a nivel de activaciones ("activationguard"). Los tags del repositorio (`prompt-injection`, `guardrail`, `vllm`) confirman que el foco del trabajo es la seguridad frente a inyección de instrucciones y su despliegue en producción mediante vLLM.

El modelo hereda el tamaño de 20B parámetros de la familia base `gpt-oss-20b`, aunque la información pública disponible en la ficha de Hugging Face no detalla la arquitectura, el contexto, los idiomas ni la licencia. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y su tamaño reportado es de 0.0 GB, lo que sugiere que los pesos no están alojados en el propio repositorio o que la información de tamaño no se ha propagado correctamente.

La relevancia de este modelo es doble: por un lado, aborda uno de los problemas más acuciantes en el despliegue de LLM en producción (la inyección de prompts y el secuestro de instrucciones del sistema); por otro, lo hace sobre una arquitectura abierta de 20B que puede ejecutarse en hardware razonable. El acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia base: gpt-oss-20b) |
| Parámetros totales | 20B (según nombre del modelo; no verificado en ficha) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo reporta 0.0 GB) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo en la ficha de Hugging Face. El nombre indica que parte de `gpt-oss-20b`, el modelo abierto de OpenAI de 20B parámetros, pero no se especifica si se trata de un fine-tuning completo, de un adaptador LoRA fusionado o de una modificación con capas adicionales. El sufijo `activationguard` sugiere la incorporación de un mecanismo de guardrail que opera sobre las activaciones internas del modelo, probablemente un clasificador o un módulo de detección que intercepta representaciones internas para bloquear intentos de prompt injection, aunque no se detalla su funcionamiento.

Tampoco se documentan los datos de entrenamiento, el número de tokens utilizados, la composición del dataset ni si hubo fases de RLHF o DPO. El tag `vllm` indica compatibilidad con el motor de inferencia vLLM, lo que implica que el modelo está pensado para despliegue en servidor con atención optimizada (PagedAttention), pero no se confirma el formato exacto de los pesos ni si existen versiones GGUF o cuantizadas.

## Capacidades

- Generación de texto y razonamiento general, heredadas de la familia base `gpt-oss-20b`.
- Endurecimiento frente a prompt injection: el modelo está diseñado para resistir intentos de secuestro de instrucciones del sistema, según indica su nombre y sus tags.
- Guardrail a nivel de activaciones (`activationguard`): se infiere un mecanismo de detección o filtrado interno, aunque no se documenta su comportamiento exacto.
- Despliegue en vLLM: el tag correspondiente indica compatibilidad con este motor de inferencia.
- Capacidades de tool calling, agentes, multilingüismo o modos de razonamiento extendido: no disponibles en la información proporcionada.

## Casos de uso

- **Aplicaciones de chat con instrucciones de sistema sensibles**: el modelo puede emplearse en asistentes donde el prompt del sistema contiene políticas, datos internos o restricciones que no deben ser reveladas ni sobrescritas por el usuario. El endurecimiento frente a prompt injection reduce el riesgo de que un atacante consiga que el modelo ignore esas instrucciones.
- **Agentes autónomos con acceso a herramientas**: en pipelines donde el modelo invoca funciones externas (APIs, bases de datos, sistemas de ficheros), la resistencia a inyección de prompts mitiga ataques de tipo "tool hijacking", en los que un contenido malicioso en la entrada intenta redirigir las llamadas a herramientas.
- **Procesamiento de contenido no confiable**: cuando el modelo resume correos, páginas web o documentos de usuarios, el contenido puede contener instrucciones maliciosas embebidas. Un modelo endurecido reduce la probabilidad de que esas instrucciones se ejecuten.
- **Despliegue en servidor con vLLM**: al estar etiquetado para vLLM, encaja en infraestructuras de inferencia de alto rendimiento con batching continuo, adecuado para servicios con múltiples usuarios concurrentes.
- **Evaluación de robustez y red teaming**: sirve como referencia para comparar el comportamiento de un modelo base frente a uno endurecido, midiendo la tasa de éxito de ataques de prompt injection en ambos.
- **Capa de defensa en profundidad**: puede combinarse con otros guardrails externos (filtros de entrada/salida, clasificadores independientes) para construir una defensa en capas en aplicaciones críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la ficha. Como referencia orientativa para un modelo de 20B parámetros, en FP16 se necesitarían aproximadamente 40 GB de VRAM; en cuantización de 8 bits, unos 20 GB; en 4 bits, unos 10-12 GB. Estos cálculos son estimaciones genéricas para 20B y no están confirmados para este modelo concreto.
- **GPU recomendadas**: no disponibles. Por tamaño, un modelo de 20B en FP16 requiere GPUs como A100 40GB/80GB, H100 o L40S. En cuantización agresiva podría caber en RTX 4090 (24 GB) o RTX 3090.
- **¿Cabe en consumer GPU?**: probablemente en cuantización de 4 bits en GPUs de 24 GB, pero no confirmado por el autor.
- **Opciones de despliegue**: vLLM (según el tag del repositorio). Otras opciones como llama.cpp, Ollama o TGI no están confirmadas.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hirundo-io/gpt-oss-20b-pi-hardened-generalist-activationguard | 20B (según nombre) | no disponible | Prompt injection hardening + activation guard | no disponible | Gated en HF, 0 descargas |
| gpt-oss-20b (OpenAI, modelo base) | 20B | no disponible en esta ficha | Sin endurecimiento específico | no disponible en esta ficha | Público en HF |
| Alternativas endurecidas frente a prompt injection | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas específicas de "prompt injection hardening" no está disponible en la información proporcionada. El único punto de referencia claro es el modelo base `gpt-oss-20b`, del que este modelo deriva.

## Limitaciones y advertencias

- **Acceso restringido (gated)**: es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos, lo que puede limitar su uso en entornos automatizados o de investigación sin intervención manual.
- **Información muy escasa**: la ficha no documenta arquitectura, licencia, idiomas, formato de pesos ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- **Cero descargas y un solo like**: no hay evidencia de uso comunitario ni de validación independiente del endurecimiento frente a prompt injection.
- **Tamaño del repo reportado como 0.0 GB**: sugiere que los pesos podrían no estar alojados en el repositorio o que la información no se ha propagado; conviene verificar antes de asumir que el modelo es descargable.
- **Riesgo de alucinación**: no evaluado ni documentado; al derivar de un modelo base de 20B, es probable que persista el riesgo habitual, pero no hay datos.
- **Sesgos**: no documentados.
- **Licencia comercial**: no disponible; no se puede confirmar si el uso comercial está permitido.
- **Eficacia del guardrail no verificada**: el nombre sugiere protección frente a prompt injection, pero no se han publicado métricas de tasa de éxito de ataques ni de falsos positivos, por lo que no debe asumirse que sustituye a otras capas de defensa.
- **Idiomas**: no disponibles; no se puede confirmar el soporte de castellano.

## Enlaces

- [Hugging Face: hirundo-io/gpt-oss-20b-pi-hardened-generalist-activationguard](https://huggingface.co/hirundo-io/gpt-oss-20b-pi-hardened-generalist-activationguard)
