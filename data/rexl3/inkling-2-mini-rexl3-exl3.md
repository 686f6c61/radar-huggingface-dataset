# REXL3/Inkling-2-Mini-REXL3-EXL3

## Resumen

Inkling-2-Mini-REXL3-EXL3 es una conversión cuantizada del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, publicada por el usuario REXL3. Se trata de un checkpoint experimental en formato EXL3 de 4 bits (con mezcla de tasas nominales entre 4 y 6 bpw según el componente) pensado para ejecutarse en GPUs SM86, en concreto una RTX 3090. El modelo base es un image-text-to-text de aproximadamente 7.460 millones de parámetros lógicos, según los safetensors del repositorio.

La relevancia de esta ficha reside en que documenta un artefacto de inferencia local de bajo nivel: incluye pesos del trunk, una cabeza de salida empaquetada y pesos de decodificación especulativa DSpark, además de una torre de visión en BF16 retenida en CPU. No es un modelo nuevo entrenado, sino una representación alternativa del modelo original con licencia Apache-2.0, orientada a despliegues privados con un runtime concreto (adaptador REXL3 SM86) que no se distribuye en el repositorio.

El modelo resuelve el problema de servir localmente un modelo multimodal de ~7,5B parámetros con contexto muy largo (hasta 198.144 tokens en una sola ranura) en hardware consumer de gama alta, sacrificando compatibilidad con stacks estándar (Transformers, ExLlamaV3 estándar, vLLM) a cambio de un layout específico y optimizaciones de caché de prefijo y decodificación especulativa. Su naturaleza experimental y los resultados de calidad reportados (1/73 passes estrictos en una batería de tareas) deben tenerse muy en cuenta antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (base: thinkingmachines/Inkling-2-Mini); layout EXL3 con trunk, cabeza de salida y draft DSpark |
| Parametros totales | 7.464.307.200 (safetensors); 26.704.313.488 escalares lógicos subyacentes según la model card |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 198.144 tokens totales en una ranura (runtime probado) |
| Tipos de cuantizacion | EXL3 4-bit con mezcla: 4 bpw matrices de expertos core, 5 bpw expertos coda, 6 bpw atención; cabeza de salida local 4 bpw; proyecciones DSpark 4 bpw; embedding y torre en BF16; fold Markov en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (28 archivos, 25 shards objetivo, cabeza, draft y fold separados); librería `rexl3` |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo image-text-to-text de Thinking Machines Lab, del que esta publicación es una conversión cuantizada (relación `quantized`) sin reentrenamiento ni sustitución del trunk. El artefacto EXL3 reorganiza los pesos en varios componentes: el trunk principal, una cabeza de salida empaquetada, pesos de draft para decodificación especulativa DSpark y una tabla derivada BF16 (fold Markov). La torre de visión se mantiene en BF16 y se ejecuta en CPU, con un empalme de embeddings en GPU.

La innovación técnica destacable es el runtime: decodificación especulativa DSpark con hasta siete propuestas más un ancla, caché de prefijo exacta respaldada en host (8 GiB), prefill de 128 filas y una única ranura de 198.144 tokens con KV en FP16 tanto para objetivo como para draft. La model card reporta métricas de representación (4,576 bpw nominal con cabeza; 4,655 bpw contando todos los archivos) sobre 26.704.313.488 escalares lógicos, y no constituyen precisión de cómputo. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional y completado de texto en bruto (raw completion).
- Procesamiento de imagen y texto (pipeline image-text-to-text), con una única PNG RGB opaca inline de hasta 256 tokens fusionados; URLs remotas de imagen deshabilitadas.
- Razonamiento con control de esfuerzo (`reasoning_effort=none` aceptado; `low` no expuesto en el build probado).
- Llamada a funciones (function calling) en formato natural, según la batería de evaluación reportada.
- Evaluación de matemáticas (GSM8K) e instrucciones estrictas (IFEval), aunque con resultados muy limitados en el screen publicado.
- Decodificación especulativa DSpark para acelerar generación cuando el runtime lo permite.
- Caché de prefijo exacta para reutilización de contexto largo entre peticiones.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo permite mantener conversaciones multi-turno de hasta 198.144 tokens en una sola ranura, útil para análisis de documentos extensos o historiales de chat muy largos en un equipo con RTX 3090.
- Análisis de documentos e imágenes en local: al aceptar una PNG inline y texto, puede emplearse para tareas de descripción o extracción sobre capturas y figuras, con la limitación de una sola imagen por petición y sin URLs remotas.
- Prototipado de decodificación especulativa: sirve como banco de pruebas para medir el impacto de DSpark frente a generación serial en un mismo peso, con ganancias reportadas de aproximadamente 50,77 vs 17,39 tok/s a 8K y 3,03 vs 1,62 tok/s cerca de capacidad.
- Investigación sobre cuantización EXL3: el checkpoint y el `VALIDATION.json` permiten reproducir métricas de fidelidad next-token (KL medio 0,01888 nats, top-1 92,97%) frente a la fuente NVFP4/MXFP8, útil para estudiar el impacto de la cuantización mixta.
- Servicio privado de inferencia con runtime dedicado: al estar atado a un adaptador SM86 concreto, encaja en despliegues controlados donde se fija la versión del runtime y se copian solo los archivos de payload listados.
- Evaluación de límites de contexto y caché: los fixtures de 8K y cerca de capacidad (197.888 tokens de prompt) documentan latencia cold/warm y uso de memoria (pico NVML de 21.435 MiB), útiles para planificar capacidad en una GPU de 24 GB.
- No recomendado como sustituto directo en pipelines estándar: la model card indica explícitamente que no es un drop-in para Transformers, ExLlamaV3 estándar ni vLLM.

## Benchmarks y rendimiento

Fidelidad next-token frente a la fuente NVFP4/MXFP8 (comparación teacher-forced, no precisión de tareas):

| Metrica | Valor |
|---|---|
| Posiciones evaluadas | 512 |
| KL medio / p95 (source ∥ EXL3) | 0,01888 / 0,05502 nats |
| Top-1 | 476/512 (92,97%) |
| ΔNLL | -0,00638 nats/token |
| Perplejidad EXL3 vs fuente | 19,673 vs 19,799 |

Rendimiento de inferencia local en una RTX 3090 (greedy, una prueba por brazo):

| Fixture | Brazo | Prompt | Salida | Peticion completa (s) | tok/s salida | Prompt cacheado |
|---|---|---:|---:|---:|---:|---:|
| 8K | cold native | 8.192 | 64 | 11,892 | 5,38 | 0 |
| 8K | warm native | 8.192 | 64 | 1,291 | 49,58 | 8.064 |
| 8K | warm serial | 8.192 | 64 | 3,879 | 16,50 | 8.064 |
| Cerca de capacidad | cold native | 197.888 | 256 | 1622,014 | 0,16 | 0 |
| Cerca de capacidad | warm native | 197.888 | 256 | 64,192 | 3,99 | 197.760 |
| Cerca de capacidad | warm serial | 197.888 | 256 | 159,510 | 1,60 | 197.760 |

Diagnóstico nativo adicional con fixture multimodal (solo fase de generación): 50,77 vs 17,39 tok/s a 8K y 3,03 vs 1,62 tok/s cerca de capacidad, DSpark vs serial. Nsight Systems atribuyó 95,55% del tiempo de kernel CUDA a la atención del objetivo en la captura de cola warm tardía más dos rondas.

Screen de tareas independiente: 1/73 passes estrictos, 31 recortes por límite de salida. Desglose: GSM8K 1/48 (9 recortes), IFEval estricto 0/16 (13 recortes), function call natural 0/4 (4 recortes), clasificación PNG conocida 0/4 (4 recortes), raw completion 0/1 (1 recorte). No se realizaron ejecuciones emparejadas sobre la fuente.

## Requisitos de hardware

- VRAM: pesos objetivo en GPU 13.600.817.408 B, draft 236.558.624 B y fold 102.829.812 B; embedding en host 926.318.592 B. Pico NVML muestreado a profundidad completa: 21.435 MiB con al menos 2.692 MiB libres; pico de host 10,06 GiB sin swap.
- GPU probada: una RTX 3090 (SM86). No hay resultados reportados para GB10/Q200.
- Cabe en GPU consumer: sí, en RTX 3090 de 24 GB según las mediciones; otras consumer no verificadas.
- Despliegue: runtime privado REXL3 SM86 con adaptador identity-bound; no es compatible como drop-in con Transformers, ExLlamaV3 estándar ni vLLM. No se distribuye el ejecutable del runtime en el repositorio.
- Latencia y throughput: arranque hasta readiness 37,58 s (excluido de la latencia de petición); warm 8K 49,58 tok/s incluyendo petición; warm cerca de capacidad 3,99 tok/s; primer SSE warm cerca de capacidad 2,734 s. Cifras de una sola prueba, no percentiles.
- Copia física de caché: 499.304.448 B a 8K y 7.492.257.792 B cerca de capacidad en peticiones warm.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-REXL3-EXL3 (este) | 7,46B (safetensors) | 198.144 tokens (runtime probado) | EXL3 4-bit mixto, Apache-2.0 | Repo Hugging Face; runtime privado no distribuido |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | Pesos originales (NVFP4/MXFP8 según referencia), Apache-2.0 | Hugging Face (revision ed40e7d) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables de la misma categoría con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Resultados de calidad muy débiles en el screen publicado: 1/73 passes estrictos, con 31 peticiones recortadas por límite de salida; no es evidencia de calidad amplia y no hubo ejecuciones emparejadas contra la fuente.
- No es un drop-in: requiere el adaptador REXL3 SM86 identity-bound; no funciona con Transformers, ExLlamaV3 estándar ni vLLM, y no está en registro de runtime aprobado.
- Runtime no distribuido: el ejecutable privado no está en el repositorio, lo que limita la reproducibilidad por terceros.
- Visión restringida: una sola PNG RGB opaca inline, máximo 256 tokens fusionados, URLs remotas deshabilitadas; torre en CPU BF16 con empalme en GPU.
- Control de razonamiento parcial: acepta `reasoning_effort=none` pero no expone `low`.
- Métricas de bits por peso son de representación, no de precisión de cómputo; no deben interpretarse como calidad equivalente a BF16.
- Sin datos de sesgos, alucinación o cobertura idiomática en la información disponible; idiomas no disponibles.
- Licencia Apache-2.0 permite uso comercial, pero el aviso de derivado y las condiciones del runtime privado deben respetarse; verificar la revisión fijada y copiar solo los archivos de payload listados.
- El directorio del runtime rechaza metadatos de Hub/YAML, archivos de caché Git y enlaces simbólicos; requiere archivos regulares en un directorio limpio.
- Resultados de rendimiento de una sola prueba por brazo, no percentiles de latencia; no extrapolables a otro hardware.

## Enlaces

- Hugging Face: https://huggingface.co/REXL3/Inkling-2-Mini-REXL3-EXL3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7
- Validación incluida en el repo: VALIDATION.json (referenciado en la model card, sin URL absoluta disponible)
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
