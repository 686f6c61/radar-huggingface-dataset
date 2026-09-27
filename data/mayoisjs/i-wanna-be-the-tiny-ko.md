# MayoIsJS/i-wanna-be-the-tiny-ko

## Resumen

i-wanna-be-the-tiny-ko es un modelo de lenguaje de tipo base (no instruct) con 136.336.000 parámetros, publicado por el usuario MayoIsJS en HuggingFace bajo licencia Apache 2.0. Se trata de un experimento de preentrenamiento desde cero en coreano, motivado explícitamente por la pregunta de hasta dónde se puede llegar entrenando con datos abiertos y un único ordenador doméstico, sin clústeres ni presupuestos industriales. El modelo usa la arquitectura Llama (etiqueta `llama` en el repositorio) y pesos en formato safetensors, con un tamaño de repositorio de 0,3 GB.

El interés del modelo es fundamentalmente metodológico y educativo: documenta la receta completa de preentrenamiento (learning rate, scheduler WSD, número de épocas, batch efectivo, estrategia de empaquetado) y la mezcla de datos empleada, que combina texto web filtrado, PDF educativos, libros de texto coreanos, código Python y datos sintéticos de estilo Cosmopedia. El volumen de entrenamiento declarado ronda los 17.000 millones de tokens, un orden de magnitud pequeño para los estándares actuales, lo que sitúa al modelo en la categoría de los "tiny language models" orientados a experimentación y ajuste fino, no a uso directo en producción.

Es relevante ahora porque ejemplifica una tendencia clara: reproducibilidad y entrenamiento local de modelos pequeños especializados en un idioma concreto (en este caso, coreano), sirviendo como punto de partida para ajustes finos, pruebas de tokenizadores y estudios de mezclas de datos. No obstante, conviene ser realista: con 0 descargas y 0 "likes" en el momento de la consulta, se trata de un repositorio recién publicado y sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only, segun la etiqueta `llama` del repositorio) |
| Parametros totales | 136.336.000 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se han publicado cuantizaciones oficiales; al ser arquitectura Llama, es convertible a GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) con llama.cpp |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Tokenizador | no disponible |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible identifica el modelo con la etiqueta `llama`, lo que apunta a un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención causal estándar, si bien el repositorio no publica la configuración exacta (número de capas, dimensiones ocultas, número de cabezas de atención, tamaño del vocabulario ni longitud de contexto). No se dispone de datos sobre si se aplicaron técnicas adicionales como decodificación especulativa, atención lineal o variantes MoE; con 136 millones de parámetros y una única cifra de parámetros totales, se deduce un modelo denso.

En cuanto al entrenamiento, el autor documenta: learning rate de 2e-4, scheduler WSD con un 2 % de warmup y un 10 % de decay hasta un mínimo de 0, tres épocas sobre el dataset, batch efectivo de 16 (2 por dispositivo multiplicado por 8 pasos de acumulación de gradiente) y empaquetado de secuencias mediante `bfd_split`. El cómputo total declarado es de aproximadamente 17.000 millones de tokens, calculado a partir del número final de pasos, con la advertencia del propio autor de que el empaquetado no garantiza el relleno perfecto de todos los pads, por lo que la cifra real sería algo inferior y cercana a ese valor. No se menciona ninguna fase de ajuste por instrucciones (SFT), RLHF ni DPO.

La mezcla de datos combina cinco fuentes abiertas: `minpeter/fineweb-2-edu-korean` (web), `HuggingFaceFW/finepdfs-edu` (PDF), `devngho/korean-textbooks-edu` (sintético, con filtrado adicional), `Avelina/python-edu-cleaned` (código) y `KORMo-Team/Cosmopedia-ko-synth` (sintético con foco en razonamiento lógico). El autor indica que las proporciones se ajustaron para asemejarse a la distribución del corpus web, sin especificar los porcentajes exactos más allá de la imagen de proporciones incluida en la model card.

## Capacidades

- Generación de texto en coreano: es la capacidad principal, al haber sido preentrenado exclusivamente con datos en ese idioma.
- Continuación y modelado de lenguaje: al ser un modelo base, su tarea nativa es predecir el siguiente token, no seguir instrucciones.
- Generación de código: el dataset incluye `Avelina/python-edu-cleaned`, por lo que cabe esperar cierta exposición a código Python, aunque no se han publicado evaluaciones que lo confirmen.
- Conocimiento de tipo enciclopédico y educativo: por la presencia de PDF educativos y libros de texto coreanos en la mezcla de datos.
- Razonamiento básico: la inclusión de `Cosmopedia-ko-synth`, descrito como sintético orientado a lógica, sugiere contenido de razonamiento, sin garantías de rendimiento.
- Capacidad multilingüe: no disponible; el modelo está declarado únicamente para coreano.
- Tool calling / function calling: no disponible; no se ha aplicado ajuste por instrucciones ni se documenta plantilla de chat.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking", visión o audio: no disponible; el repositorio solo contiene pesos de texto.
- Ajuste fino como base: es un uso previsto implícito, dado que se publica como modelo base sin post-entrenamiento.

## Casos de uso

- Punto de partida para ajuste fino supervisado en coreano: al ser un modelo base de 136 millones de parámetros con licencia Apache 2.0, se puede aplicar SFT con LoRA en un único GPU de consumo para tareas concretas como clasificación de textos, resumen o generación controlada.
- Experimentación académica con mezclas de datos: el autor documenta la receta completa (learning rate, scheduler, épocas, empaquetado), lo que permite reproducir o variar la mezcla y medir el efecto sobre la pérdida, algo útil en cursos de NLP y trabajos sobre curación de corpus.
- Investigación sobre preentrenamiento en hardware doméstico: sirve como referencia de qué calidad se obtiene con ~17.000 millones de tokens frente a modelos entrenados con billones de tokens, útil para estudiar leyes de escalado en el régimen pequeño.
- Desarrollo y validación de tokenizadores coreanos: al ser un modelo pequeño, entrenar variantes de tokenizador y comparar la pérdida por token es viable en tiempos cortos, en comparación con modelos de miles de millones de parámetros.
- Generación de texto offline y en el borde: con ~273 MB en fp16 o ~70-140 MB cuantizado, puede ejecutarse en un portátil o una Raspberry Pi para tareas de autocompletado o generación de borradores en coreano sin conexión.
- Pruebas de infraestructura de despliegue: por su tamaño, es adecuado para validar pipelines con vLLM, llama.cpp, Ollama o TGI antes de migrar a un modelo mayor, verificando plantillas, tokenización y latencia del sistema.
- Filtrado y anotación de corpus coreanos: ajustado como clasificador (por ejemplo, con una cabeza de clasificación sobre el estado final), puede usarse para prefiltrar texto educativo o detectar contenido de baja calidad en un pipeline de datos.
- Destilación y modelos de profesor-alumno: puede actuar como alumno pequeño en experimentos de destilación desde modelos coreanos mayores, o como profesor barato en tareas muy acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, KMMLU, HellaSwag, HumanEval ni de ninguna otra suite, y tampoco se proporciona la pérdida de validación final.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 545 MB en fp32, unos 273 MB en fp16/bf16, unos 136 MB en int8 y del orden de 70-100 MB en cuantizaciones de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 resultan enormemente sobredimensionadas para este tamaño y solo aportan ventaja en throughput por lotes grandes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos diez años e incluso en iGPU; también es viable la inferencia en CPU, con consumo de memoria inferior a 1 GB.
- Memoria del sistema: menos de 1 GB adicional para los pesos y el runtime; el coste real lo marca la caché KV, que depende de la longitud de contexto (no documentada).
- Opciones de despliegue: transformers (referencia, con safetensors), llama.cpp y Ollama tras convertir los pesos a GGUF, vLLM y TGI para servir con procesamiento por lotes continuo. No hay cuantizaciones publicadas por el autor.
- Latencia y throughput: no disponible; no se han publicado mediciones. Cualitativamente, con 136 millones de parámetros la generación por token en CPU moderna es de las más rápidas dentro de la familia de modelos de lenguaje, pero no se dispone de cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Notas |
|---|---|---|---|---|---|
| MayoIsJS/i-wanna-be-the-tiny-ko | 136,3 M | no disponible | Coreano | Apache 2.0 | Base, sin post-entrenamiento, ~17 B tokens, entrenado en un equipo doméstico |
| HuggingFaceTB/SmolLM-135M | 135 M | 2048 tokens | Inglés (multilingüe limitado) | Apache 2.0 | Base pequeña ampliamente evaluada y con versiones instruct |
| Qwen2.5-0.5B | 494 M | 32 768 tokens | Multilingüe (incluye coreano parcial) | Apache 2.0 | Mayor tamaño y contexto, con variantes instruct |

La comparación de parámetros, contexto y licencia se basa en información pública de cada modelo, no en la model card del repositorio analizado. No existen datos de benchmarks del modelo coreano que permitan una comparación de rendimiento con SmolLM-135M o Qwen2.5-0.5B: en ese eje, la comparación es no disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue órdenes de forma fiable, no dispone de plantilla de chat documentada y puede generar continuaciones incoherentes ante entradas tipo pregunta-respuesta.
- Volumen de entrenamiento reducido: unos 17.000 millones de tokens, muy por debajo de los estándares actuales, con el consiguiente riesgo de conocimiento factual limitado y mayor alucinación en preguntas específicas.
- Monolingüe: solo coreano; el rendimiento en castellano u otros idiomas es previsiblemente muy pobre y no ha sido evaluado.
- Sin benchmarks ni evaluación externa: no hay métricas publicadas, 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- Contexto desconocido: no se documenta la longitud máxima admitida, lo que impide planificar usos con documentos largos sin probarlo empíricamente.
- Sesgos: la mezcla incluye texto web y sintético sin documentar filtrado de sesgos, toxicidad ni deduplicación; los sesgos presentes en `fineweb-2-edu-korean` y en los corpus sintéticos se heredan.
- Riesgo de contaminación por datos sintéticos: dos de las cinco fuentes son sintéticas (libros de texto y Cosmopedia-ko), lo que puede introducir artefactos y estilos repetitivos.
- Licencia permisiva: Apache 2.0 permite uso comercial y modificaciones, pero el usuario debe verificar las licencias de los datasets subyacentes si redistribuye derivados, ya que `finepdfs-edu` y otros corpus pueden tener condiciones propias.
- Idoneidad para producción: limitada; se recomienda tratar el modelo como base para ajuste fino o como componente de experimentación, no como servicio final sin evaluación previa.
- Metadatos peculiares: la fecha de creación registrada (2026-09-27) y la ausencia de información sobre tokenizador o pipeline dificultan la trazabilidad del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MayoIsJS/i-wanna-be-the-tiny-ko
- Dataset web: https://huggingface.co/datasets/minpeter/fineweb-2-edu-korean
- Dataset PDF: https://huggingface.co/datasets/HuggingFaceFW/finepdfs-edu
- Dataset de libros de texto coreanos: https://huggingface.co/datasets/devngho/korean-textbooks-edu
- Dataset de código: https://huggingface.co/datasets/Avelina/python-edu-cleaned
- Dataset sintético de razonamiento: https://huggingface.co/datasets/KORMo-Team/Cosmopedia-ko-synth
- Paper, blog o demo asociados: no disponible
