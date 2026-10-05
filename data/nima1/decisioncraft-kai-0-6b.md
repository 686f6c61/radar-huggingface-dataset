# nima1/decisioncraft-kai-0.6b

## Resumen

Decisioncraft Kai 0.6B es un clasificador de peticiones de desarrollador publicado por el usuario nima1 como adaptador LoRA sobre el modelo base vllm-sr/Decision-2.0-Kai-0.6B. No genera ni ejecuta comandos: su única función es enrutar cada petición hacia una de cuatro salidas (suggest, clarify, unsupported o defer) para decidir si conviene sugerir un comando, pedir la información que falta, marcar la petición como fuera de alcance o derivarla a revisión humana. Se distribuye bajo licencia Apache 2.0, con etiqueta de pipeline text-classification y idioma inglés.

El modelo resuelve un problema de enrutamiento previo a la generación dentro de flujos de asistencia para línea de comandos. La cabecera de decisión se entrena con entropía cruzada sobre logits de candidatos, no con generación token a token, y suma 3.576.320 parámetros entrenables sobre una base de 597.103.104 parámetros. El runtime mantiene los pesos en FP32 con autocast BF16 sobre CUDA y aplica un límite de 512 tokens de entrada codificada.

Su interés actual reside en que separa la decisión de enrutamiento de la generación de comandos y expone logits y probabilidades calibradas, lo que permite auditar cuándo el modelo se abstiene. La propia model card advierte de que las métricas publicadas proceden de un estudio sintético controlado y de que no deben interpretarse como fiabilidad con usuarios reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Base Decision-2.0-Kai-0.6B con cabecera de decisión entrenada y adaptador LoRA; la arquitectura interna del base no se detalla en la model card |
| Parametros totales | 597.103.104 (incluye la cabecera de decisión) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Parametros entrenables | 3.576.320 (LoRA rango 4, alpha 8, dropout 0, más cabecera de decisión) |
| Longitud de contexto | Contrato de entrada probado: 512 tokens codificados. El base anuncia un límite superior que no se especifica: no disponible |
| Tipos de cuantizacion | no disponible (el runtime declarado usa FP32 con autocast BF16) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA y cabecera de decisión) |

## Arquitectura y entrenamiento

La adaptación parte del modelo original Kai fijado en el commit `cd49ea3813fd8ba0928a9a23ef6c9a0f2f0cd764`, no de un checkpoint continuado de solo cabecera. El candidato liberado es la semilla primaria predeterminada 42: LoRA de rango 4, alpha 8 y dropout 0, más la cabecera de decisión entrenada, con 3.576.320 parámetros entrenables. El entrenamiento usó 1.008 ejemplos durante dos épocas, con AdamW, tasa de aprendizaje 1e-4, decaimiento de peso cero, microbatch 2, batch efectivo 32 y recorte de gradiente 1. La función de pérdida es entropía cruzada sobre los logits de candidatos, no generación de texto por siguiente token. El runtime mantiene los parámetros en FP32 con autocast BF16 sobre CUDA, emplea el modelo de decisión de nivel inferior inspeccionado y aplica un límite de 512 tokens de entrada codificada; el límite de contexto anunciado por el base no es el contrato de entrada probado en este proyecto.

Los datos proceden del conjunto Decisioncraft, con 1.800 vistas sintéticas generadas a partir de 150 grupos de escenarios originales (12 vistas relacionadas por grupo, 600 filas por etiqueta). Los splits son 1.008 de entrenamiento, 252 de validación de selección, 180 de calibración y 360 de test final. Tanto los escenarios como el renderizador determinista fueron creados por un agente de codificación con IA, y un agente separado revisó toda la semántica de origen, las derivaciones generadas y las etiquetas de los casos finales; el usuario aprobó 12 ejemplos de política fuera del corpus. No se trata, por tanto, de anotación humana de 1.800 filas ni de una muestra de peticiones naturales: solo la petición y el contexto son entradas del modelo.

## Capacidades

- Clasificación de peticiones de desarrollador en cuatro rutas: `suggest` (operación local de archivo/texto o Git suficientemente especificada), `clarify` (falta información material o hay conflicto sin resolver), `unsupported` (al menos una acción solicitada queda fuera del alcance, incluidos flujos mixtos local/externo) y `defer` (la probabilidad máxima calibrada cae por debajo de un umbral de confianza ajustado).
- Enrutamiento previo a la generación: emite un objeto `suggestion_request` con petición y contexto para un generador posterior; no invoca Bashcraft ni ejecuta comandos.
- Exposición de señales internas: conserva logits crudos, probabilidades crudas, probabilidades calibradas, argmax crudo, política y flujo de trabajo.
- Distinción entre acciones solicitadas positivamente y texto citado o actividades explícitamente prohibidas, que no cuentan como acciones positivas.
- Uso del contexto para aportar nombres de archivo, objetivos y preferencias.
- Generación de texto: no disponible (el modelo no genera texto).
- Tool calling / function calling: no disponible como capacidad generativa; su salida es una etiqueta de ruta.
- Razonamiento multi-paso o agentes: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.
- Mensaje de aclaración fijo: "Please supply or resolve the missing details needed for this local file, text or Git request. This is a fixed prompt, not a generated diagnosis of which detail is missing."

## Casos de uso

- Enrutamiento previo en asistentes de línea de comandos: el clasificador decide si una petición del desarrollador debe generar una sugerencia de comando o si conviene pedir más detalles, evitando que un generador posterior actúe sobre peticiones ambiguas.
- Filtrado de alcance en herramientas internas de CLI: cuando la petición mezcla operaciones locales con acciones externas, el modelo la marca como `unsupported` y emite un mensaje de alcance en lugar de intentar resolverla.
- Puerta de clarificación en pipelines de automatización: si falta un nombre de archivo o un objetivo, la ruta `clarify` dispara un aviso fijo que solicita los datos que faltan antes de continuar.
- Derivación a revisión humana: la ruta `defer` permite enviar casos de baja confianza a una persona en lugar de arriesgar una sugerencia incorrecta, útil en flujos con consecuencias sobre el sistema de archivos o repositorios Git.
- Preprocesado de peticiones para sistemas de sugerencia de Git: el modelo distingue operaciones locales de Git suficientemente especificadas y emite la solicitud para el generador correspondiente.
- Auditoría y monitorización de decisiones: al conservar logits, probabilidades calibradas y la política aplicada, permite registrar por qué una petición se enrutó a cada salida y analizar desviaciones con el tiempo.
- Evaluación comparativa de enrutadores: sirve como componente de referencia para medir políticas basadas en reglas o embeddings frente a un adaptador LoRA en tareas de clasificación de peticiones.

## Benchmarks y rendimiento

Evaluación final congelada sobre los mismos 360 casos finales (120 ambiguos y 120 de soporte completo). El protocolo final se fijó antes de la inferencia de test en el commit `3c1431b5ec2313394f83ffdc00543a9913b4ee71`; los ocho contendientes terminaron sin fallos técnicos de predicción.

| Metodo | Aclaracion correcta | Aclaracion innecesaria | Cobertura | Macro-F1 enrutado |
| --- | ---: | ---: | ---: | ---: |
| Rules | 2/120 | 0/120 | 100,0% | 0,4275 |
| MiniLM seed 42 | 50/120 | 5/120 | 83,3% | 0,6886 |
| Unchanged compact Kai | 62/120 | 3/120 | 87,8% | 0,5170 |
| Adapted Kai seed 42 | 120/120 | 0/120 | 92,2% | 0,9580 |
| Adapted Kai seed 43 | 113/120 | 0/120 | 87,8% | 0,9342 |
| Adapted Kai seed 44 | 119/120 | 0/120 | 86,9% | 0,9274 |

La ganancia de recall primaria es de +48,3 puntos porcentuales, con intervalo bootstrap del 95% sobre escenarios completos emparejados de [+40,2; +56,8] puntos (2.000 réplicas, semilla 101). El argmax crudo primario clasificó correctamente los 360 casos. La política de operación congelada, no obstante, difirió 2 casos (dato truncado en la información disponible). Todas las cifras corresponden al estudio sintético descrito y no a una muestra de peticiones reales.

## Requisitos de hardware

- VRAM estimada para pesos en FP32: unos 2,4 GB (597.103.104 parámetros x 4 bytes). Cálculo derivado del recuento de parámetros, no publicado en la model card.
- VRAM estimada en BF16: unos 1,2 GB para los pesos. El runtime declarado usa FP32 con autocast BF16, por lo que la referencia de memoria es la cifra FP32 más el espacio de activaciones, no cuantificado en la model card.
- GPU recomendadas: no disponible (la model card no recomienda modelos concretos de GPU).
- GPU de consumo: por tamaño, los pesos en FP32 (unos 2,4 GB) cabrían en GPU de consumo con al menos unos 4 GB de VRAM, aunque la model card no confirma esta compatibilidad.
- Opciones de despliegue: no disponible. El paquete es un adaptador LoRA con cabecera de decisión y código personalizado (etiqueta custom-code); la model card menciona una comprobación de referencia CUDA con la rueda instalada, pero no documenta vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponible.
- Restricción de entrada: límite de 512 tokens codificados aplicado por el runtime.

## Comparativa con modelos similares

Comparativa dentro del propio estudio de evaluación congelada (mismos 360 casos finales). No se dispone de otros modelos de la misma categoría fuera de este estudio.

| Metodo | Tipo | Aclaracion correcta | Aclaracion innecesaria | Cobertura | Macro-F1 enrutado |
| --- | --- | ---: | ---: | ---: | ---: |
| Rules | Politica basada en reglas | 2/120 | 0/120 | 100,0% | 0,4275 |
| MiniLM seed 42 | Embeddings congelados + cabecera lineal | 50/120 | 5/120 | 83,3% | 0,6886 |
| Unchanged compact Kai | Base sin adaptar | 62/120 | 3/120 | 87,8% | 0,5170 |
| Adapted Kai seed 42 | Adaptador LoRA + cabecera | 120/120 | 0/120 | 92,2% | 0,9580 |

Datos de parametros, contexto y licencia de los modelos comparables: no disponibles en la informacion proporcionada, salvo la base compartida Decision-2.0-Kai-0.6B (597.103.104 parametros, licencia no indicada).

## Limitaciones y advertencias

- La propia model card reconoce que, pese a la clasificacion cruda perfecta en el conjunto de retencion sintetico controlado, un ejemplo de politica separado que pedia buscar el texto literal `docker run` en un archivo local, sin lanzar Docker, fue enrutado con confianza como `unsupported`. No debe tratarse la puntuacion sintetica como fiabilidad con usuarios reales.
- Los datos son sinteticos y generados por agentes de IA (con revision de un agente separado), no anotacion humana de 1.800 filas ni una muestra de peticiones naturales.
- Los resultados por familia son descriptivos: dos familias retenidas no demuestran transferencia general al dominio de desarrollo.
- El clasificador no es un filtro de seguridad, y la ruta `suggest` no implica que el comando sugerido sea correcto.
- La salida `defer` es un resultado de politica operativa, no una etiqueta semantica de referencia.
- Solo admite ingles y solo recibe como entrada peticion y contexto.
- El limite de contexto anunciado por el base no es el contrato de entrada probado (512 tokens codificados).
- Licencia Apache 2.0, que en principio permite uso comercial, pero la model card no ofrece garantias de idoneidad para produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y un tamano de repo de 0,0 GB.
- La informacion sobre la evaluacion final aparece truncada; no se dispone del detalle completo de los 2 casos diferidos por la politica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nima1/decisioncraft-kai-0.6b
- Conjunto de datos Decisioncraft: https://huggingface.co/datasets/nima1/decisioncraft-data
- Modelo base Decision-2.0-Kai-0.6B: https://huggingface.co/vllm-sr/Decision-2.0-Kai-0.6B
- Revision fijada del modelo base: https://huggingface.co/vllm-sr/Decision-2.0-Kai-0.6B/tree/cd49ea3813fd8ba0928a9a23ef6c9a0f2f0cd764
- Commit del protocolo de evaluacion final: `3c1431b5ec2313394f83ffdc00543a9913b4ee71` (referenciado en la model card, sin URL directa disponible)
- Repositorio de codigo, demo o paper adicional: no disponible
