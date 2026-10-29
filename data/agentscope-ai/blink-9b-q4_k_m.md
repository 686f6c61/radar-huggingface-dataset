# agentscope-ai/Blink-9B-Q4_K_M

## Resumen

Blink-9B-Q4_K_M es una cuantizacion GGUF Q4_K_M del modelo Blink-9B, desarrollado por agentscope-ai. No es un modelo generativo de chat al uso: se trata de un modelo de decision (decision-model) orientado a la revision de operaciones de herramientas (tool-operation review) y a las decisiones de retencion de contexto en agentes. Con 8.953.803.264 parametros (aproximadamente 8,95B), emplea una arquitectura hibrida con capas de atencion bidireccional completa en el prompt y atencion lineal en el resto, y expone probabilidades de token candidato en lugar de generar tokens de respuesta.

Su relevancia reside en que cubre una necesidad concreta en pipelines de agentes: decidir si una llamada a herramienta debe aprobarse y si un fragmento de contexto debe conservarse o descartarse. El modelo no produce respuestas; devuelve puntuaciones y probabilidades que el orquestador (QwenPaw) interpreta como decisiones. Esta cuantizacion reduce el peso a unos 5,6 GB en el repositorio, manteniendo unicamente el backbone de texto y los tensores de salida, mientras que los tensores auxiliares de vision y MTP permanecen en el checkpoint completo.

La publicacion incluye una validacion sintetica de las diferencias introducidas por la cuantizacion frente a BF16, con metricas de variacion total, acuerdo en la primera opcion y desacuerdo en decisiones nativas de revision. Es importante subir que requiere un parche especifico de llama.cpp descrito en QwenPaw PR #8463; las runtimes causales sin parchear no implementan este contrato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida con atencion bidireccional completa en capas de prompt y atencion lineal (modelo de decision) |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 recomendado en ejecucion (ctx/batch/ubatch 8192, un slot); maximo no documentado |
| Tipos de cuantizacion | GGUF Q4_K_M (este repositorio); BF16 GGUF y Q8 (control 4B) usados como referencia |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 (atribucion FlexDM en THIRD_PARTY_LICENSES.md) |
| Formato de pesos | GGUF en multiples shards (todos requeridos); safetensors en el repositorio base Blink-9B |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida de atencion: capas de atencion bidireccional completa en el prompt y atencion lineal sin cambios en el resto, con un layout interno denominado flex_twice. El contrato de inferencia exige calcular probabilidades de token candidato a temperatura 1 y generar cero tokens de respuesta, lo que lo aleja del paradigma causal de Chat Completions. La conversion se realizo desde el checkpoint completo a BF16 GGUF de texto validado con la opcion --no-mtp, seguida de llama-quantize Q4_K_M, sin matriz de importancia, sin dataset de calibracion, sin poda y sin recuantizacion de Q8 a Q4. Los tipos exactos de tensores de salida y embedding quedan registrados en sensitive-tensor-types.json.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el material proporcionado. La innovacion tecnica documentada se centra en el contrato de inferencia (atencion bidireccional en capas de prompt, layout flex_twice exacto y probabilidades de candidato) y en el procedimiento de cuantizacion con validacion sintetica frente a BF16.

## Capacidades

- Revision de operaciones de herramientas: evalua solicitudes de llamadas a herramientas y emite juicios de aprobacion o denegacion.
- Decisiones de retencion de contexto: determina que fragmentos de contexto deben conservarse y cuales pueden descartarse.
- Puntuacion y scoring: genera expectativas de puntuacion normalizadas y probabilidades por token candidato.
- Clasificacion de texto (pipeline text-classification) orientada a decisiones binarias o multietiqueta.
- Soporte bilingue limitado a ingles y chino (en, zh).
- Integracion con QwenPaw como decision model, incluyendo la logica nativa de aprobacion y compactacion.
- No genera tokens de respuesta: no es un modelo de chat ni de generacion libre de texto.
- No incluye capacidades de vision en esta cuantizacion: los tensores de vision y MTP permanecen en el checkpoint completo.

## Casos de uso

- Revision de llamadas a herramientas en agentes: el modelo recibe metadatos con forma nativa del flujo y devuelve un juicio de aprobacion o denegacion, lo que permite filtrar acciones potencialmente peligrosas antes de ejecutarlas.
- Compactacion de contexto en agentes de larga duracion: decide que fragmentos de contexto deben retenerse y cuales descartarse, reduciendo el consumo de ventana en conversaciones o tareas prolongadas.
- Orquestacion con QwenPaw: se integra como decision model dentro del catalogo de QwenPaw, aportando la logica de aprobacion y compactacion junto con el fallback nativo del orquestador.
- Gatekeeping en pipelines de agentes multi-paso: cada paso puede pasar por el modelo para validar si la siguiente accion es coherente con el objetivo y el estado del contexto.
- Scoring de riesgo de acciones: las probabilidades de candidato permiten aplicar umbrales configurables para graduar la aprobacion automatica frente a la revision manual.
- Validacion en entornos de CI/CD para agentes: sirve como compuerta automatizada que verifica que las trayectorias de herramientas cumplen las politicas antes de desplegar cambios en el orquestador.
- Evaluacion de politicas de retencion: con 24 fixtures de contexto etiquetados como necesarios, permite medir la fraccion de contexto relevante que se descarta al ajustar umbrales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evidencia cuantitativa son las regresiones sinteticas de cuantizacion frente a BF16, que no constituyen un benchmark independiente ni una certificacion de seguridad.

| Metrica de validacion sintetica | Valor |
|---|---|
| Variacion total media / p95 | 0,013701 / 0,081681 |
| Diferencia maxima absoluta de probabilidad de candidato | 0,268553 |
| Acuerdo en primera opcion con margenes BF16 >= 0,20 | 1,000000 sobre 553 preguntas |
| Diferencia media de expectativa de puntuacion normalizada | 0,005630 |
| Desacuerdo en decision nativa de revision | 0,041667 sobre 96 solicitudes |
| Fixtures riesgosos etiquetados auto-permitidos de nuevo | 0 |
| Fraccion de contexto necesario descartado de nuevo | 0,000000 sobre 24 fixtures |

El conjunto de regresiones cubre 265 solicitudes y 556 juicios, con metadatos de revision de forma nativa, retencion de contexto recuperable, scoring y evidencias de tarea en ingles y chino. La comparacion de referencia se realizo frente a BF16 con la misma runtime CUDA; el control Q8 de 4B se regenero de forma independiente y no debe asumirse identico byte a byte al Q8 publicado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6-8 GB para los pesos Q4_K_M (5,6 GB de repositorio) mas la cache KV correspondiente a 8192 tokens de contexto y un unico slot.
- GPU consumer compatibles: cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y RTX 4090; en GPUs de 8 GB el margen para cache KV es muy ajustado.
- GPU de datacenter: A100 y H100 para escenarios de mayor concurrencia o validacion frente a BF16.
- Opciones de despliegue: llama.cpp con el parche Blink-aware descrito en QwenPaw PR #8463, o la integracion nativa de QwenPaw. Las runtimes causales sin parchear (Chat Completions estandar, vLLM, TGI, Ollama sin parche) no implementan el contrato de inferencia.
- Configuracion de ejecucion obligatoria: generar cero tokens de respuesta, deshabilitar prefix caching y chunked prefill, no truncar el prompt, usar ctx/batch/ubatch 8192 y un solo slot.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se conocen modelos directamente comparables de la misma categoria (modelos de decision para revision de herramientas y retencion de contexto) en la informacion disponible. La comparacion mas util es entre las variantes del propio Blink-9B:

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Blink-9B-Q4_K_M | 8,95B | GGUF Q4_K_M | 8192 recomendado | Apache 2.0 | Este repositorio; requiere parche de llama.cpp |
| Blink-9B (BF16) | 8,95B | Safetensors | no disponible | Apache 2.0 | Checkpoint completo; incluye tensores de vision y MTP |
| Blink-9B Q8 (control 4B) | aproximadamente 4B | GGUF Q8 | no disponible | Apache 2.0 | Control de referencia regenerado de forma independiente |

## Limitaciones y advertencias

- Requiere una runtime parcheada: llama.cpp estandar, vLLM, TGI u Ollama sin el parche Blink no implementan el contrato de atencion bidireccional ni las probabilidades de candidato.
- No es un modelo generativo: no produce tokens de respuesta y no debe usarse como chat completions causal.
- Cobertura linguistica limitada a ingles y chino; el rendimiento fuera de esos idiomas no esta documentado.
- La validacion es sintetica y no constituye un benchmark independiente, una calibracion de riesgo ni una certificacion de seguridad; el acuerdo con la referencia no equivale a correccion de la tarea.
- Las diferencias de probabilidad (hasta 0,268553 en el peor caso) pueden alterar decisiones basadas en umbrales; conviene mantener el fallback nativo de aprobacion y compactacion de QwenPaw.
- El desacuerdo en la decision nativa de revision es de 0,041667 sobre 96 solicitudes, un valor no despreciable en produccion.
- Esta cuantizacion solo conserva el backbone de texto y los tensores de salida; las capacidades de vision y MTP no estan disponibles aqui y requieren el checkpoint completo.
- No se debe truncar el prompt ni habilitar prefix caching o chunked prefill; hacerlo rompe el contrato de inferencia.
- Aunque la licencia es Apache 2.0, se debe conservar la atribucion de FlexDM recogida en THIRD_PARTY_LICENSES.md.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentscope-ai/Blink-9B-Q4_K_M
- Modelo base Blink-9B: https://huggingface.co/agentscope-ai/Blink-9B
- Pull request del parche en QwenPaw: https://github.com/agentscope-ai/QwenPaw/pull/8463
- Repositorio QwenPaw: https://github.com/agentscope-ai/QwenPaw
- Ficheros de integridad en el repositorio: sensitive-tensor-types.json, validation.json, release-manifest.json, THIRD_PARTY_LICENSES.md
