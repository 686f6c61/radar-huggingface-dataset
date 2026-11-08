# mazz92/mazz-models

## Resumen

MAZZ ÆNGENIUM es una suite de modelos publicada por el autor independiente mazz92 (Eren Tipirdamaz) bajo licencia Apache-2.0. El repositorio agrupa varias familias de pesos en formato GGUF orientadas a código, razonamiento con chain-of-thought, generación de imagen y generación de vídeo, junto con un modelo de autocompletado ultraligero. La model card describe una jerarquía de cuatro niveles que va desde un modelo de 0,8B para CPU hasta un modelo de 70B para auditoría de repositorios grandes. El dato verificado de parámetros totales en safetensors es de 70.553.706.560, coherente con el modelo de mayor tamaño de la flota.

La propuesta del autor se centra en modelos "abliterated" (sin mecanismos de rechazo), pensados para integrarse con su propio entorno de desarrollo, MAZZ Code, y con una pasarela de orquestación (MAZZ Control) y un estudio de agentes (MAZZ Agent Studio). No se documentan detalles de arquitectura, composición del dataset de entrenamiento ni proceso de alineamiento más allá de la etiqueta "abliterated".

La relevancia práctica es limitada: el repositorio tiene 7 descargas y 0 likes, no publica resultados de benchmarks y la información técnica disponible es escasa y en gran parte descriptiva. Debe evaluarse como un artefacto experimental o de nicho, no como una alternativa consolidada a modelos open source de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer, MoE ni híbrida) |
| Parametros totales | 70.553.706.560 (dato de safetensors, correspondiente al modelo de 70B de la flota) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en Q8_0, Q4_K_M y Q4_0 según los ficheros descritos en la model card |
| Idiomas soportados | no disponible (la model card está redactada en francés, pero no declara idiomas del modelo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repositorio de 103,6 GB); se reportan parámetros en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de los modelos: la model card no indica si se trata de transformers densos, mezcla de expertos, modelos híbridos o arquitecturas de difusión en el caso de los módulos de imagen y vídeo. Tampoco se documentan el número de tokens de entrenamiento, la composición del corpus, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento. La única indicación técnica relevante es la etiqueta "abliterated", que implica la eliminación o supresión de las capas o direcciones de activación asociadas al rechazo de peticiones, un procedimiento habitual en la comunidad open source para obtener modelos sin filtros de seguridad.

En el apartado multimodal, la model card menciona que el módulo de imagen se basa en FLUX.1-schnell de 12B con renderizado en 4 pasos de difusión, y que el módulo de vídeo se basa en Wan 2.1 de 1,3B. No se especifica qué técnica de ajuste se aplicó sobre esas bases ni qué datos se usaron. Para el resto de la flota (0,8B, 4B, 32B y 70B) no hay ninguna indicación sobre el modelo base, el tokenizador o las innovaciones de inferencia, más allá de la mención de "especulación" en el modelo draft de 0,8B, lo que sugiere decodificación especulativa.

## Capacidades

- Generación de texto conversacional en el modelo base de 4B, orientado a diálogo y explicación de código.
- Generación y refactorización de código en el modelo Coder de 32B, con orquestación de herramientas (tool calling) según la model card.
- Razonamiento profundo con bloques `<thought>` de chain-of-thought en el modelo Titan de 32B-CoT, enfocado a matemáticas y planificación de algoritmos.
- Comprensión de repositorios extensos y auditoría de seguridad en el modelo ApexCoder de 70B, con síntesis multi-fichero.
- Autocompletado en tiempo real y especulación con el modelo Draft de 0,8B, declarado a más de 40 tokens por segundo en CPU.
- Generación de imágenes fotorrealistas mediante el módulo Vision-Flux, basado en FLUX.1-schnell 12B con 4 pasos de difusión.
- Generación de vídeo cinemático mediante el módulo Motion-Wan, basado en Wan 2.1 1,3B.
- Ausencia de rechazos por diseño ("abliterated") en los modelos de código y razonamiento.
- No se documenta soporte explícito de function calling estructurado, agentes multi-paso, audio ni capacidades multilingües verificadas.

## Casos de uso

- Autocompletado en editor de código: el modelo Draft de 0,8B en Q8_0 (0,76 GB) puede ejecutarse en CPU a más de 40 tokens por segundo, lo que lo hace viable como motor de sugerencias en línea sin GPU dedicada.
- Asistente de refactorización en estación de trabajo: el Coder de 32B en Q4_K_M (18,49 GB) encaja en GPUs de 24 GB y permite reescritura de funciones, extracción de módulos y migraciones de API con contexto de varios ficheros.
- Auditoría de seguridad de repositorios: el ApexCoder de 70B en Q4_K_M (unos 42,5 GB) está pensado para revisar grandes bases de código y sintetizar hallazgos entre ficheros, aunque requiere hardware de gama alta o cloud.
- Planificación algorítmica y resolución de problemas matemáticos: el Titan de 32B-CoT expone bloques `<thought>` que permiten inspeccionar el razonamiento intermedio, útil en entornos de investigación que necesitan trazas auditables.
- Generación de material gráfico conceptual: el módulo Vision-Flux, derivado de FLUX.1-schnell, permite producir imágenes en 4 pasos de difusión, adecuado para prototipado visual rápido dentro de un pipeline creativo.
- Generación de clips de vídeo breves: el módulo Motion-Wan, derivado de Wan 2.1 1,3B, sirve para previsualizaciones cinemáticas de bajo coste en Q8_0 (1,43 GB).
- Integración en un harness de agentes propio: los modelos están descritos como compatibles con la pasarela MAZZ Control (puerto 7070) y MAZZ Agent Studio (puerto 3333), de modo que un equipo que ya use ese ecosistema puede orquestarlos con `mazz start`.
- Despliegue en portátiles sin GPU: el Base de 4B en Q4_K_M (2,52 GB) ofrece diálogo general a 4-6 tokens por segundo en CPU estándar, suficiente para asistentes locales de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Draft 0,8B en Q8_0: 0,76 GB de pesos; cabe en cualquier CPU moderna, más de 40 tokens por segundo según el autor.
- Base 4B en Q4_K_M: 2,52 GB de pesos; 4-6 tokens por segundo en CPU estándar; cabe en GPUs consumer de 6-8 GB de VRAM.
- Coder 32B y Titan 32B-CoT en Q4_K_M: 18,49 GB de pesos cada uno; requieren GPUs de 24 GB (RTX 3090, RTX 4090, A10G) o superiores; también viables en A100 40 GB y H100.
- ApexCoder 70B en Q4_K_M: unos 42,5 GB de pesos; requiere 48 GB de VRAM como mínimo, por lo que encaja en A100 80 GB, H100 80 GB o configuraciones multi-GPU; no cabe en GPUs consumer de una sola tarjeta.
- Vision-Flux en Q4_0: 6,30 GB; viable en RTX 3060 12 GB, RTX 4070, RTX 4090.
- Motion-Wan en Q8_0: 1,43 GB; cabe en GPUs consumer de gama media.
- Opciones de despliegue: los pesos están en GGUF, por lo que el entorno natural es llama.cpp y Ollama; para los modelos de 32B y 70B conviene vLLM o TGI si se convierten a safetensors, aunque no se documenta compatibilidad explícita.
- Latencia y throughput: solo se declaran cifras para los modelos de 0,8B y 4B en CPU; no hay datos para GPU ni para los modelos grandes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| MAZZ ÆNGENIUM ApexCoder 70B | 70,55B | no disponible | Apache-2.0 | GGUF | no |
| Llama 3.3 70B (referencia de categoria) | 70B | 128k | Llama 3.3 Community License | safetensors, GGUF | sí |
| Qwen2.5-Coder 32B (referencia de categoria) | 32,5B | 128k | Apache-2.0 | safetensors, GGUF | sí |
| DeepSeek-Coder-V2 236B (referencia MoE) | 236B totales / 21B activos | 128k | DeepSeek License | safetensors | sí |

La comparación se limita a parámetros, licencia y formato, porque MAZZ ÆNGENIUM no publica contexto ni resultados de evaluación. Frente a las alternativas de referencia, la diferencia principal es la ausencia de documentación técnica verificable y de benchmarks, no el tamaño.

## Limitaciones y advertencias

- No hay información sobre sesgos: al no documentarse el corpus de entrenamiento ni el proceso de alineamiento, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación no cuantificado: sin benchmarks ni evaluaciones publicadas, no se puede estimar la fiabilidad factual del modelo.
- Los modelos están marcados como "abliterated", lo que implica la supresión de mecanismos de rechazo; esto incrementa el riesgo de generar contenido dañino, código ofensivo o instrucciones peligrosas sin filtro, y traslada toda la responsabilidad de moderación al despliegue.
- Longitud de contexto desconocida: no se puede garantizar el rendimiento en tareas de contexto largo, pese a que el modelo de 70B se promociona para repositorios extensos.
- Idiomas no declarados: no hay evidencia de calidad multilingüe; la model card está en francés, pero eso no implica capacidades del modelo.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte, y el repositorio tiene un historial mínimo (7 descargas, 0 likes) que sugiere ausencia de validación por la comunidad.
- El repositorio mezcla pesos de texto, imagen y vídeo en un solo espacio de 103,6 GB, lo que complica la trazabilidad de qué fichero corresponde a qué modelo y versión.
- Los enlaces externos de la model card apuntan a dominios y puertos propios del ecosistema MAZZ; no se ha verificado su disponibilidad ni su funcionamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mazz92/mazz-models
- Aplicación MAZZ Code: https://github.com/mazzadev92/mazz-code
- Sitio oficial MAZZ ÆNGENIUM: http://mazz.ai/
- Perfil de Instagram del autor: https://www.instagram.com/mazz__ai/
