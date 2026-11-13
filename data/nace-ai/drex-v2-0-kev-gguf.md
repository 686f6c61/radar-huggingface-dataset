# nace-ai/drex-v2.0-kev-GGUF

## Resumen

Drex v2.0 en formato GGUF para llama.cpp, publicado por nace-ai bajo la variante de cabecera `kev`. No es un modelo generativo al uso: responde preguntas de elección (`choice`), sí/no (`noul`) y puntuación (`score`) devolviendo probabilidades a través del endpoint `/v1/systemone` de `llama-server`, sin producir texto libre. El modelo base es `nace-ai/drex-v2.0`, un transformer de tipo `qwen35moe` con 34.661.659.776 parámetros totales, del que estos ficheros conservan el backbone sin cambios y solo reorganizan la cabecera de decisión y los metadatos.

La relevancia de esta publicación es doble. Por un lado, expone una interfaz de decisión estructurada (clasificación con probabilidades calibradas) sobre un modelo de 34,6 mil millones de parámetros, útil para enrutado de tickets, triaje y scoring automático. Por otro, documenta un bloqueo concreto de compatibilidad: llama.cpp carga la cabecera opcional `cls.output` para `qwen35` pero todavía no para `qwen35moe`, de modo que las versiones actuales de llama.cpp no pueden ejecutar estos ficheros sin un parche de unas 15 líneas propuesto upstream.

El repositorio incluye dos cuantizaciones (Q4_K_M de 21,2 GB y Q8_0 de 36,9 GB) y una rama de llama.cpp mantenida por el autor (`drex-v2.0-upstream-kev`) para poder compilar `llama-server` mientras el cambio no se integra. La licencia es `nace-ai-open-rail-m`, la misma del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo `qwen35moe` en llama.cpp) |
| Parametros totales | 34.661.659.776 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de ejecución con `-c 32768`) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (cabecera `cls.output` en F32 en ambos) |
| Idiomas soportados | no disponible |
| Licencia | nace-ai-open-rail-m (`license: other`) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (`qwen35moe`), con 34.661.659.776 parámetros totales. La model card no detalla el número de parámetros activos por token, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; todos esos datos figuran como no disponibles. Lo que sí se documenta es la modificación de cabecera: el backbone se copia sin cambios desde los GGUF existentes de Drex v2.0 y se sustituye la cabeza por una "pointer head" (`cls.output.weight` y `cls.output.bias`) almacenada en F32, con `qwen35moe.embedding_length_out = 512`.

La innovación técnica de esta variante es el tipo de decisión `kev`: los metadatos del GGUF declaran `qwen35moe.decision.type = kev`, temperaturas de decisión y una plantilla de prompt específica (`tokenizer.chat_template.systemone`). El modelo no genera tokens de respuesta; proyecta el estado de la conversación sobre las opciones declaradas y devuelve una distribución de probabilidad normalizada. Según el autor, `convert_hf_to_gguf.py` todavía no puede producir estos ficheros desde el checkpoint en safetensors, por lo que la conversión se hizo reescribiendo los GGUF previos. Las comprobaciones publicadas comparan el motor `kev` con el fork de nace en 16 preguntas de test sobre CPU Linux con Q4_K_M: misma respuesta principal en las 16 y diferencia máxima de probabilidad de 0,06. Metal y CUDA no se han probado.

## Capacidades

- Clasificación por elección (`choice`): dada una pregunta y un conjunto de criterios con nombre, devuelve la opción más probable y la distribución completa de probabilidades.
- Preguntas de sí/no (`noul`): respuesta binaria con probabilidad asociada.
- Preguntas de puntuación (`score`): asignación de una puntuación con probabilidad.
- Salida estructurada en JSON a través de `/v1/systemone`, apta para consumo directo por pipelines.
- Procesamiento de estado conversacional: el campo `state` admite el texto del caso a evaluar (por ejemplo, el cuerpo de un ticket).
- Múltiples preguntas por petición: el objeto `questions` permite evaluar varios criterios en una sola llamada.
- No genera texto libre para estas respuestas; es un modelo de decisión, no un chatbot.
- Tool calling, agentes multi-paso, visión, audio y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo de la model card clasifica un ticket de facturación entre `billing`, `technical` y `other` con probabilidades (0,869 / 0,059 / 0,071). Es adecuado porque la salida es directamente accionable y permite umbrales de confianza para escalado humano.
- Triaje de incidencias en producción: evaluar si un aviso cumple criterios de severidad mediante preguntas `noul` o `score` antes de abrir un incidente, con la probabilidad como señal de confianza.
- Moderación y cumplimiento: clasificar contenido frente a políticas definidas como criterios con nombre, registrando la distribución de probabilidad para auditoría.
- Scoring de leads o solicitudes: puntuar formularios entrantes con preguntas `score` y ordenar la cola de revisión por probabilidad.
- Validación en pipelines de CI/CD: usar el endpoint como verificador determinista de condiciones (¿el cambio cumple el criterio A?) dentro de un flujo automatizado, con contexto de hasta 32.768 tokens.
- Enrutado de conversaciones multi-turno: el campo `state` admite el historial completo del caso, de modo que la decisión incorpora contexto acumulado sin necesidad de resumirlo.
- Etiquetado asistido a gran escala: procesar lotes de textos contra un esquema fijo de categorías y usar las probabilidades para seleccionar muestras de revisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evaluación documentada es la comparación de paridad entre el motor `kev` y el fork de nace sobre 16 preguntas de test (Q4_K_M, CPU Linux): coincidencia en la respuesta principal en 16 de 16 y diferencia máxima de probabilidad de 0,06.

## Requisitos de hardware

- VRAM estimada: aproximadamente 21,2 GB para Q4_K_M y 36,9 GB para Q8_0, según el tamaño de los ficheros; hay que añadir el espacio de trabajo del contexto (32.768 tokens con `-b 8192 -ub 8192`).
- GPU recomendadas: no disponibles en la información proporcionada; el autor solo ha validado en CPU Linux. Metal y CUDA figuran como no probados.
- GPU de consumo: Q4_K_M (21,2 GB) no cabe en GPUs de 16 GB ni en la mayoría de 24 GB una vez contabilizado el contexto; Q8_0 queda fuera del rango de consumo.
- Despliegue: exclusivamente `llama-server` de llama.cpp, compilado desde la rama `nace-ai/llama.cpp` `drex-v2.0-upstream-kev` mientras el cambio no se integre upstream. Comando de referencia: `llama-server -hf nace-ai/drex-v2.0-kev-GGUF:Q4_K_M -np 2 -c 32768 -b 8192 -ub 8192`.
- Restricción operativa: la pregunta y sus opciones deben caber en un único batch físico, por lo que `-ub` debe mantenerse alto.
- Latencia y throughput: no disponibles; solo se reporta una ejecución de ejemplo en CPU con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| nace-ai/drex-v2.0-kev-GGUF | 34,66 B (MoE) | 32.768 | GGUF (`kev`) | nace-ai-open-rail-m | Requiere rama de llama.cpp |
| nace-ai/drex-v2.0-Q4_K_M | 34,66 B (MoE) | no disponible | GGUF (layout antiguo) | nace-ai-open-rail-m | Compatible con fork de nace y Kapitsa |
| nace-ai/drex-v2.0-Q8_0 | 34,66 B (MoE) | no disponible | GGUF (layout antiguo) | nace-ai-open-rail-m | Compatible con fork de nace y Kapitsa |
| nace-ai/drex-v2.0 (base) | 34,66 B (MoE) | no disponible | safetensors | nace-ai-open-rail-m | Checkpoint original |

No se dispone de información sobre modelos de decisión comparables de otros autores; los únicos términos de comparación documentados son las otras distribuciones del mismo modelo base.

## Limitaciones y advertencias

- Incompatibilidad con llama.cpp estándar: las versiones actuales no cargan `cls.output` para `qwen35moe`; sin la rama `drex-v2.0-upstream-kev` los ficheros no arrancan.
- Validación limitada: solo se ha probado en CPU Linux con Q4_K_M; Metal y CUDA no están verificados.
- Idiomas soportados no documentados: no hay garantía de comportamiento fuera de los idiomas cubiertos por el modelo base.
- No genera texto: no puede usarse como modelo conversacional ni como generador de resúmenes o código.
- Riesgo de calibración: las probabilidades se han validado contra el fork de nace con una tolerancia de 0,06 en 16 preguntas; no hay estudio de calibración a mayor escala.
- Sesgos: no disponibles en la información proporcionada; al heredar el backbone del modelo base, arrastra los sesgos de sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinación: inherente a la asignación de probabilidad sobre criterios; conviene fijar umbrales de confianza y revisión humana en decisiones sensibles.
- Licencia `nace-ai-open-rail-m`: es una licencia `other` con texto en el fichero `LICENSE` del repositorio; deben revisarse sus condiciones antes de cualquier uso comercial, ya que no se detallan en la model card.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado el 13 de noviembre de 2026; no hay evidencia de uso en producción.
- La conversión desde safetensors no está soportada por `convert_hf_to_gguf.py`, lo que dificulta reproducir los ficheros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/drex-v2.0-kev-GGUF
- Modelo base: https://huggingface.co/nace-ai/drex-v2.0
- Cuantización Q4_K_M del layout anterior: https://huggingface.co/nace-ai/drex-v2.0-Q4_K_M
- Cuantización Q8_0 del layout anterior: https://huggingface.co/nace-ai/drex-v2.0-Q8_0
- Rama de llama.cpp con el soporte `kev`: https://github.com/nace-ai/llama.cpp/tree/drex-v2.0-upstream-kev
- Licencia: https://huggingface.co/nace-ai/drex-v2.0-kev-GGUF/blob/main/LICENSE
