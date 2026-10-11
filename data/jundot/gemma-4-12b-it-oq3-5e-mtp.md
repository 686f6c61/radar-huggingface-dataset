# Jundot/gemma-4-12B-it-oQ3.5e-mtp

## Resumen

`Jundot/gemma-4-12B-it-oQ3.5e-mtp` es un checkpoint cuantizado en formato MLX del modelo `google/gemma-4-12B-it`, el modelo Unified de 11,95B de la familia Gemma 4 de Google DeepMind. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribucion de pesos con cuantizacion de precision mixta generada con oQ (oMLX v0.7.1), cuyo objetivo es reducir el peso del modelo desde los aproximadamente 24,8 GB que ocuparia en BF16 hasta 6,881 GB, manteniendo el mayor numero posible de capas en alta precision.

El modelo es multimodal "any-to-any": no dispone de encoders separados, sino que los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings mediante capas lineales ligeras, y todas las modalidades se procesan en un unico transformer decoder-only con una ventana de contexto de 256K tokens. Ademas, incorpora una cabeza de prediccion multi-token (MTP) fusionada desde `google/gemma-4-12B-it-assistant`, lo que habilita decodificacion especulativa y acelera la generacion.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo multimodal de 12B con contexto muy largo en hardware Apple Silicon con memoria unificada moderada; por otro, la tecnica oQ3.5e asigna bits por sensibilidad medida de cada capa, en lugar de aplicar una cuantizacion uniforme, lo que reduce la perdida de calidad respecto a esquemas mas agresivos. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only unificado (gemma4_unified), multimodal any-to-any, con cabeza MTP |
| Parametros totales | 12.382.587.188 (12,383B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | MLX mixed-precision oQ3.5e: 3, 5, 6 y 8 bits afines (grupo 64) mas BF16; media efectiva 4,446 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `google/gemma-4-12B-it`: un transformer decoder-only unificado de 11,95B parametros que integra vision y audio sin encoders dedicados. Los parches de imagen y las formas de onda de audio se proyectan al espacio de embeddings del decoder mediante proyecciones lineales ligeras (0,015B y 0,002B de parametros respectivamente), de modo que una sola pila de atencion procesa texto, imagen y audio. El backbone de lenguaje concentra 11,943B parametros. La ventana de contexto es de 262.144 tokens.

Sobre ese modelo base no se ha realizado ningun entrenamiento adicional: la unica transformacion documentada es la cuantizacion. El proceso oQ3.5e mide la sensibilidad de cada capa y asigna presupuesto de bits en consecuencia, redondeando cada grupo con una matriz de importancia (128 muestras x 512 tokens) y reajustando escala y sesgo mediante minimos cuadrados ponderados. El resultado es una distribucion heterogenea: 85,149% de los pesos logicos en 3 bits afines, 8,129% en 8 bits, 3,705% en BF16, 1,572% en 6 bits y 1,445% en 5 bits. La cabeza MTP (0,423B parametros, almacenada en 0,846 GB) se fusiono desde el modelo asistente de Google, lo que permite decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento general en un transformer decoder-only de 12B.
- Procesamiento de imagen mediante proyeccion directa de parches al espacio de embeddings (sin encoder de vision separado).
- Procesamiento de audio mediante proyeccion lineal de formas de onda (sin encoder de audio separado).
- Modalidad any-to-any: combinacion de entradas y salidas de texto, imagen y audio segun lo declarado en el pipeline del repositorio.
- Prediccion multi-token (MTP) para decodificacion especulativa y generacion acelerada.
- Soporte de contexto largo de hasta 262.144 tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking" o modos de razonamiento explicitos: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente multimodal local en Apple Silicon: al ocupar 6,881 GB, el modelo puede cargarse en un Mac con memoria unificada de 16-24 GB y gestionar conversaciones con entrada de texto, imagen y audio sin depender de servicios en la nube.
- Analisis de documentos largos: la ventana de 256K tokens permite procesar manuales tecnicos, expedientes o bases de codigo extensas en una sola pasada, sin estrategias de troceado ni recuperacion externa.
- Generacion acelerada en produccion: la cabeza MTP fusionada desde el asistente habilita decodificacion especulativa, util para reducir la latencia por token en servicios de generacion en streaming.
- Transcripcion y comprension de audio: la proyeccion de audio integrada permite clasificar, resumir o extraer informacion de grabaciones sin un pipeline ASR separado.
- Descripcion y clasificacion de imagenes: la proyeccion de vision permite tareas de etiquetado, moderacion de contenido o extraccion de datos de capturas y fotografias.
- Despliegue en entornos con restricciones de hardware: al ser un checkpoint de 6,881 GB, es viable en estaciones de trabajo sin GPU dedicada, siempre que dispongan de memoria unificada suficiente y stack MLX.
- Prototipado e investigacion de cuantizacion: util como referencia para comparar el impacto de la cuantizacion mixta oQ3.5e frente al modelo base en BF16 dentro de la misma familia.
- Aplicaciones de borde en macOS: integracion en apps nativas Apple mediante mlx-lm, sin necesidad de CUDA ni de servidores remotos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de calidad tras la cuantizacion, ni comparativas cuantitativas frente al modelo base en BF16.

## Requisitos de hardware

- Pesos en disco: 6,881 GB (6,409 GiB) segun el desglose de almacenamiento del autor.
- Memoria minima estimada para inferencia: en torno a 7-8 GB solo para pesos; el KV cache para una ventana de 256K tokens anade varios GB adicionales (valor exacto no disponible).
- El checkpoint esta en formato MLX, por lo que el hardware objetivo es Apple Silicon con memoria unificada.
- Configuracion recomendada: Mac con 24-32 GB de memoria unificada para trabajar con contexto largo; 16 GB puede ser suficiente para contexto corto.
- GPU NVIDIA (A100, H100, RTX 4090): no es el destino nativo de este checkpoint; requeriria conversion de formato, cuyo soporte no esta documentado en la informacion disponible.
- Cabe en GPU de consumo solo tras conversion a otro formato (por ejemplo GGUF) y con cuantizaciones equivalentes; no confirmado.
- Opciones de despliegue: mlx-lm y la propia herramienta oMLX (oQ). La compatibilidad con llama.cpp, Ollama, vLLM o TGI no esta documentada para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Tamano aproximado | Licencia |
|---|---|---|---|---|---|
| Jundot/gemma-4-12B-it-oQ3.5e-mtp | 12,383B | 256K | MLX safetensors, oQ3.5e (4,446 bits/peso) | 6,881 GB | apache-2.0 |
| google/gemma-4-12B-it | 11,95B | 256K | BF16 (estimado a partir del recuento de parametros) | ~24,8 GB (calculado) | Gemma 4 license (referenciada) |
| google/gemma-4-12B-it-assistant | no disponible | no disponible | no disponible | no disponible | Gemma 4 license (referenciada) |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada. La comparativa se limita a tamano, formato y licencia.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad tras la cuantizacion: la degradacion respecto al modelo base en BF16 es desconocida. El 85,149% de los pesos logicos esta en 3 bits, lo que concentra el riesgo de perdida de precision en la mayor parte del modelo.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no se documentan medidas de mitigacion especificas en la model card.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o equidad.
- Idiomas soportados: no disponibles. La model card no especifica cobertura linguistica, lo que impide garantizar calidad fuera del ingles sin verificacion previa.
- Ambiguedad de licencia: el tag de HuggingFace declara apache-2.0, pero el propio autor enlaza la Gemma 4 license como licencia del modelo fuente. Conviene verificar cual aplica antes de un uso comercial, ya que las licencias de la familia Gemma suelen incluir condiciones de uso adicionales.
- Compatibilidad limitada: al ser un checkpoint MLX, no es directamente utilizable en el ecosistema CUDA sin conversion previa, cuyo procedimiento no esta documentado.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de terceros.
- El contexto de 256K tokens incrementa de forma notable el consumo de memoria del KV cache, lo que puede hacer inviable la ventana completa en equipos con memoria unificada ajustada.
- Fechas del repositorio: creado y actualizado el 2026-10-11, con apenas 13 segundos entre ambos eventos, lo que sugiere una publicacion automatizada sin curacion posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/gemma-4-12B-it-oQ3.5e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo asistente (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-12B-it-assistant
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pull request de la cuantizacion mejorada oQe: https://github.com/jundot/omlx/pull/4385
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
