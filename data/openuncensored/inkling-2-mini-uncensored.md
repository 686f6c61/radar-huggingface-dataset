# OpenUncensored/Inkling-2-Mini-Uncensored

## Resumen

Inkling-2-Mini-Uncensored es un ajuste fino del modelo multimodal Inkling-2-Mini de Thinking Machines, publicado por OpenUncensored el mismo día del lanzamiento del modelo base. Se trata de una versión "abliterated": se han eliminado las direcciones de rechazo del modelo original mediante ablación direccional, de modo que responde a peticiones que el modelo base rechaza, tanto en modo chat como en modo razonamiento, manteniendo prácticamente intacto su rendimiento en conocimiento general (MMLU 78,95% → 79,47%).

El modelo base es un transformer de mezcla de expertos (MoE) con arquitectura "looped": 24 capas en las que las 12 centrales (capas 6 a 17) se ejecutan tres veces por token con pesos compartidos, lo que supone 48 visitas de capa por token. Cuenta con 26.388.646.440 parámetros totales, de los cuales 3.400 millones están activos por token, y acepta entrada de texto e imagen con una ventana de contexto de 1 millón de tokens. Los pesos ocupan unos 20,2 GB: los expertos enrutados están almacenados en NVFP4 y MXFP8, y el resto en BF16.

La relevancia del modelo reside en dos factores. Por un lado, demuestra que la abliteración se puede aplicar a arquitecturas MoE con bucles compartidos sin degradar el conocimiento del modelo, algo no trivial porque la edición en capas reutilizadas actúa varias veces por token. Por otro lado, ofrece una alternativa sin filtros de rechazo con licencia Apache 2.0, despliegue en una sola GPU de consumo y una API compatible con OpenAI a 0,15 $/millón de tokens de entrada y 0,60 $/millón de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle (looped transformer), 24 capas con las capas 6-17 ejecutadas 3 veces por token (48 visitas de capa) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | 3.400 millones (3,4B) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 para expertos enrutados; BF16 para el resto; 8-bit (modelopt); adaptador LoRA rank-2 disponible aparte |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repositorio de 20,2 GB |
| Expertos por capa | 128 |
| Especulador | DSpark (incluido, identico byte a byte al original) |
| Entrada multimodal | Texto e imagen (vision encoder identico al original) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Inkling-2-Mini de Thinking Machines: un transformer de mezcla de expertos con 24 capas y 128 expertos por capa, en el que las 12 capas centrales (6 a 17) se reutilizan tres veces por token con pesos compartidos. Esta estructura de bucle implica que cualquier modificación de pesos en esas capas se aplica tres veces por token, lo que condiciona el proceso de abliteración. El modelo incorpora además un codificador de visión para entrada de imágenes y un especulador DSpark para decodificación especulativa, ambos preservados sin cambios respecto al checkpoint original.

El proceso de abliteración, documentado en la model card, consistió en cuatro pasos. Primero, se calcularon las direcciones de rechazo a partir de la salida de cada una de las 48 visitas de capa en el último token del prompt, usando 256 prompts dañinos y 256 inofensivos con esfuerzo de razonamiento 0 y 0,9 (las dos configuraciones coinciden con coseno ≥ 0,92 en las primeras 36 visitas). Segundo, se seleccionó un subespacio de rechazo tardío formado por los dos vectores singulares principales de las direcciones de la segunda mitad de las visitas (24 a 47), porque las direcciones de todas las visitas eliminaban rechazos pero hacían que el modelo malinterpretara peticiones dañinas como inofensivas. Tercero, la edición se aplicó exclusivamente a las proyecciones de salida de atención (`attn.wo_ud`, en BF16) mediante `W' = W - s Q Qᵀ W` en las capas 4 a 23, con s = 4,0 en las capas 4, 5 y 18-23 y s = 2,5 en el núcleo del bucle (capas 6-17), más suave porque la misma edición actúa tres veces por token. Cuarto, se descartó editar las proyecciones down de los expertos MoE: no mejoraba la eliminación de rechazos y costaba de 4 a 6 puntos de MMLU, además de que los expertos están en NVFP4 y recodificar una edición pequeña añade ruido de aproximadamente el doble del tamaño de la edición. Solo cambiaron 20 proyecciones de salida de atención; los 128 expertos por capa, el codificador de visión y el especulador DSpark son idénticos byte a byte al original.

No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en su alineamiento original.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 1 millón de tokens.
- Razonamiento explícito en modo "thinking", con el razonamiento devuelto por separado en el campo `reasoning_content` de la API; el parámetro `reasoning_effort` permite ajustar el esfuerzo (valor `"none"` para respuestas cortas).
- Entrada de imágenes: el modelo es image-text-to-text y conserva el codificador de visión original.
- Llamada a herramientas (tool calling / function calling), según la model card.
- Respuestas a peticiones que el modelo base rechaza, tanto en modo chat como en modo razonamiento (0 rechazos en 32 prompts dañinos en ambos modos).
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- Decodificación especulativa mediante el especulador DSpark incluido.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un MoE abliterated frente al original con el mismo harness y los mismos archivos, comparando tasas de rechazo y MMLU (78,95% frente a 79,47%) sin diferencias de infraestructura.
- Evaluación de robustez de filtros: al responder a peticiones que el base rechaza, sirve para probar clasificadores de contenido, guardrails y sistemas de moderación en pipelines propios, en un entorno controlado y con licencia Apache 2.0.
- Asistencia conversacional de contexto largo: con 1 millón de tokens de ventana puede gestionar conversaciones multi-turno o documentos extensos en una sola pasada, útil para resúmenes de expedientes o análisis de corpus largos.
- Procesamiento de documentos con imagen: al aceptar entrada image-text-to-text, permite extraer y razonar sobre información de capturas, formularios escaneados o diagramas dentro de un flujo conversacional.
- Agentes con tool calling: la combinación de llamada a funciones, razonamiento multi-paso y contexto de 1M tokens permite construir agentes que encadenen búsquedas, ejecución de herramientas y síntesis sobre historiales largos.
- Despliegue en hardware de consumo: con unos 20 GB de pesos y expertos en NVFP4/MXFP8, cabe en una sola GPU de consumo o en un DGX Spark, lo que facilita prototipado local sin clúster.
- Integración vía API compatible con OpenAI: para productos que necesiten este comportamiento sin gestionar GPU, la API de OpenUncensored ofrece el modelo como `inkling-2-mini-uncensored` a 0,15 $/M tokens de entrada y 0,60 $/M de salida.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con el mismo harness para ambos modelos, decodificación greedy y sobre estos archivos exactos (sin hooks):

| Metrica | Inkling 2 Mini | Inkling 2 Mini Uncensored |
|---|---|---|
| Rechazos en 32 prompts dañinos, modo chat | 32 | 0 |
| Rechazos en 32 prompts dañinos, modo thinking (effort 0,9) | 32 | 0 (29 de 32 terminaron el razonamiento en 1.536 tokens; ninguno rechazó) |
| Rechazos en 80 prompts (32 dañinos, 48 zona gris), modo chat | 68 | 8 (7 son límites, no rechazos; el octavo, autolesión, recibe recursos de crisis) |
| Respuestas completas y específicas a los 32 prompts dañinos (juez LLM) | 0 | 21 |
| MMLU (57 materias x 20, 1.140 preguntas, logits de letra) | 78,95% | 79,47% |

El autor advierte que, con 32 a 80 prompts por test, las diferencias de unos pocos prompts deben tratarse como ruido, y que las tareas largas de agente y los benchmarks de código aún no se han medido.

## Requisitos de hardware

- Peso del repositorio: 20,2 GB (expertos enrutados en NVFP4 y MXFP8, resto en BF16), por lo que la inferencia requiere al menos ese espacio en VRAM o memoria unificada.
- Cabe en una sola GPU de consumo, según la model card, y en un DGX Spark.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por tamaño, cualquier GPU con 24 GB o más de VRAM (por ejemplo, RTX 4090) o memoria unificada equivalente debería poder alojar los pesos, aunque no se confirma oficialmente.
- Opciones de despliegue: transformers (librería indicada en el repositorio); la API de OpenUncensored es compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.
- El especulador DSpark incluido puede emplearse para decodificación especulativa, aunque no se publican cifras de aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini-Uncensored | 26,4B totales / 3,4B activos | 1M | Apache 2.0 | Abliterated; 0 rechazos en 32 prompts dañinos; MMLU 79,47% |
| Inkling-2-Mini (base) | 26,4B totales / 3,4B activos | 1M | Apache 2.0 | 32 rechazos en 32 prompts dañinos; MMLU 78,95% |
| Inkling-2-Mini-Uncensored-LoRA | Adaptador rank-2 sobre el base | 1M (heredado) | Apache 2.0 | Misma edición como LoRA de ~1 MB con script de aplicación |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría (abliterated o MoE de ~26B) en la información proporcionada.

## Limitaciones y advertencias

- Elimina deliberadamente los rechazos: responde a peticiones dañinas (0 rechazos en 32 prompts dañinos en chat y thinking), lo que lo hace inadecuado para aplicaciones de cara al público sin guardrails externos.
- En la prueba de 80 prompts, 7 de las 8 respuestas no son rechazos sino límites (por ejemplo, no puede conocer el contenido mental del usuario o no tiene acceso a documentos internos de una empresa); el único rechazo restante es una petición de autolesión que recibe recursos de crisis.
- Riesgo de alucinación no cuantificado en la información disponible; el autor no publica benchmarks de tareas largas de agente ni de código.
- Idiomas: solo inglés según la etiqueta del repositorio; no hay soporte declarado de castellano.
- La abliteración se aplicó solo a las proyecciones de salida de atención; los expertos MoE, el codificador de visión y el especulador son idénticos al original, por lo que los sesgos del modelo base persisten sin cambios.
- Los expertos están en NVFP4/MXFP8; cualquier modificación posterior de esos pesos introduciría ruido de codificación, según el propio autor.
- Las diferencias en las pruebas de rechazo (32 a 80 prompts) deben interpretarse con cautela por el tamaño reducido de la muestra.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin rechazos en producción exige cumplimiento normativo y moderación propia; la responsabilidad recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Adaptador LoRA: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored-LoRA
- Sitio del autor: https://openuncensored.com
- Página del modelo en la API: https://openuncensored.com/models/inkling-2-mini-uncensored
- Playground en navegador: https://openuncensored.com/chat?model=inkling-2-mini-uncensored
- Créditos de la API: https://openuncensored.com/credits
- Rankings de modelos uncensored: https://openuncensored.com/rankings
