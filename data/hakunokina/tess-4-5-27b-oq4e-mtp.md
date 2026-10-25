# hakunokina/Tess-4.5-27B-oQ4e-mtp

## Resumen

Tess-4.5-27B-oQ4e-mtp es una compilación en formato MLX del modelo `migtissera/Tess-4.5-27B`, publicado por el usuario `hakunokina`. Tess-4.5 es un ajuste fino (fine-tune) orientado a ingeniería agéntica desarrollado por Migel Tissera / Continuity Research sobre Qwen3.8-27B, un modelo denso de la familia Qwen3.5 con arquitectura híbrida de Gated DeltaNet y atención, 64 capas y 262.144 tokens de contexto. Este repositorio concreto no es un modelo nuevo, sino una cuantización de 4 bits calibrada con imatrix para Apple Silicon, pensada para ejecutarse en la herramienta oMLX.

El problema que resuelve es la ausencia de builds MLX del modelo original: el autor del fine-tune publica BF16 y GGUF, pero no una versión nativa para el stack MLX de Apple. Esta build reduce el peso de ~54 GB (BF16) a ~16 GB manteniendo la cabeza MTP (multi-token prediction) del modelo fuente, lo que permite a oMLX aplicar decodificación especulativa y acelerar la generación en chips de la serie M.

Es relevante ahora porque combina tres piezas poco habituales en un mismo artefacto: un fine-tune agéntico con modo thinking activado por defecto, una ventana de 262k tokens y una cuantización de 4 bits con métricas de divergencia publicadas frente al original (KL media de 0,039 nat/token y 91,4 % de acuerdo top-1). El repositorio no tiene descargas ni valoraciones y requiere oMLX ≥ 0.7.1; no se ha probado con `mlx-lm` estándar ni con LM Studio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet + atención, familia Qwen3.5, 64 capas |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | oQ4e: 4 bits afín, grupo 64, calibrado con imatrix (existen builds oQ6e y oQ8e del mismo autor) |
| Idiomas soportados | No disponible (no se declaran idiomas; el conjunto de calibración incluye código y multilingüe, y la evaluación de divergencia cubrió prosa en inglés, turco y código) |
| Licencia | Apache-2.0 (heredada del modelo fuente) |
| Formato de pesos | safetensors en formato MLX; GGUF disponible solo en el repositorio del modelo base |
| Cabeza MTP | Conservada (habilita decodificación especulativa en oMLX) |
| Codificador de visión | Conservado del modelo fuente (entrada de imagen no probada en esta build) |
| Tamaño del repositorio | 17,0 GB (pesos ~16 GB; el BF16 original ocupa ~54 GB) |
| Runtime requerido | oMLX ≥ 0.7.1 (no probado con `mlx-lm` estándar ni LM Studio) |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

La base es Qwen3.8-27B, un transformer denso de 64 capas que alterna capas de Gated DeltaNet (atención lineal con estado recurrente) con capas de atención completa; según la model card, solo 16 capas son de atención completa, lo que explica el coste de caché KV declarado (~64 KB por token, ~16 GB a 262k tokens). Sobre esa base, Continuity Research aplicó un ajuste fino orientado a código agéntico y uso de herramientas, con modo thinking activado por defecto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

La aportación técnica de este repositorio es la cuantización: oMLX oQ4e, un esquema de 4 bits afín con grupo de 64, calibrado con imatrix sobre un conjunto de código y multilingüe propio de oMLX, partiendo de los pesos BF16. Se preserva la cabeza MTP del modelo fuente, de modo que el runtime puede usarla para decodificación especulativa. La calidad se documenta como divergencia frente al BF16 (misma secuencia de tokens, 64 secuencias × 512 tokens, 32.700 tokens puntuados): KL media de 0,039 nat/token, mediana 0,016, p99 0,48, acuerdo top-1 del 91,4 % y perplejidad de 6,048 a 6,198.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto (el autor del fine-tune recomienda mantenerlo activado).
- Generación y edición de código, con especialización declarada en ingeniería agéntica.
- Tool calling / function calling: validado por el cuantizador con 5 de 5 ejecuciones correctas tanto en la API Anthropic (`/v1/messages`) como en la OpenAI (`/v1/chat/completions`).
- Flujos agénticos multi-paso: el modelo fuente está ajustado para tareas de agente; se recomienda declarar el directorio de trabajo en el system prompt y pasar definiciones de herramientas reales.
- Contexto largo: hasta 262.144 tokens, útil para recorrer repositorios o documentos extensos.
- Entrada de imagen: el codificador de visión se conserva, pero el autor indica que la entrada de imagen no se ha probado en esta build.
- Capacidades multilingües: no declaradas oficialmente; la calibración incluyó un conjunto multilingüe y la evaluación de divergencia incluyó turco, pero no hay datos de rendimiento por idioma.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo puede mantener conversaciones multi-turno con el contenido de un repositorio en contexto gracias a los 262k tokens de ventana, sin salir del equipo ni enviar código a la nube.
- Agentes de refactorización multi-archivo: con tool calling verificado en ambos protocolos (OpenAI y Anthropic), encaja en bucles de agente que leen ficheros, aplican parches y ejecutan tests de forma iterativa.
- Integración en pipelines de CI/CD: al exponerse como endpoint compatible con OpenAI, puede conectarse a herramientas que ya hablan ese protocolo para tareas de revisión de diffs o generación de tests.
- Automatización de edición sobre documentación técnica larga: la ventana de 262k permite procesar manuales completos y generar resúmenes o actualizaciones coherentes con el conjunto.
- Analista de código con razonamiento explícito: el modo thinking por defecto facilita tareas de diagnóstico de bugs donde interesa trazar el razonamiento antes de la respuesta.
- Prototipado de asistentes con entrada de imagen: el codificador de visión está presente, así que es un punto de partida para experimentar con capturas de pantalla o diagramas, asumiendo que la ruta de imagen no está validada.
- Despliegue de un endpoint interno dual (OpenAI + Anthropic): útil para equipos con clientes escritos para cualquiera de los dos formatos, servidos desde el mismo proceso oMLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El cuantizador indica explícitamente que no ejecutó ninguna suite sobre esta build y que la calidad se reporta como divergencia frente al modelo BF16.

| Métrica | Valor |
|---|---|
| KL(BF16 ‖ oQ4e), media | 0,039 nat/token |
| KL mediana / p99 | 0,016 / 0,48 |
| Acuerdo top-1 de token | 91,4 % |
| Perplejidad BF16 → oQ4e | 6,048 → 6,198 |
| BenchLocal (BF16, reportado por el autor del fine-tune) | 133/150 (mejor de tres ejecuciones), a la altura de Qwen3.8-27B |

Rendimiento medido en Mac Studio M3 Ultra (512 GB) con oMLX 0.7.1:

| Escenario | Resultado |
|---|---|
| Prefill de prompt de ~29k tokens (en frío) | ~72 s (~400 tok/s) |
| Mismo prefijo con caché de prefijo | ~1,33 s |
| Decodificación con MTP (especulativa) | ~53 tok/s |
| Tool calling (Anthropic / OpenAI, 5 ejecuciones cada uno) | 5/5 y 5/5 |

Se trata de mediciones de una sola ejecución; los números varían con la longitud del contexto, el contenido y la configuración, y la ganancia de MTP depende de lo predecible que sea la salida.

## Requisitos de hardware

- VRAM/memoria unificada: ~16 GB solo para los pesos. La caché KV consume ~64 KB por token en las 16 capas de atención completa, lo que supone ~16 GB adicionales a 262k tokens de contexto.
- Cabe en Apple Silicon de consumo: un Mac con 32 GB de memoria unificada puede ejecutar contextos moderados; para aprovechar la ventana completa son recomendables 64 GB o más. La medición de referencia se hizo en un Mac Studio M3 Ultra de 512 GB.
- GPU NVIDIA/AMD: esta build no es utilizable en ellas, al ser un artefacto MLX. Para CUDA habría que recurrir al GGUF del modelo base con llama.cpp u otro runtime compatible.
- Opciones de despliegue: oMLX ≥ 0.7.1 (servidor con API compatible OpenAI en `/v1/chat/completions` y Anthropic en `/v1/messages`). No probado con `mlx-lm` estándar ni con LM Studio.
- Throughput estimado: ~400 tok/s de prefill en frío sobre un prompt de 29k tokens y ~53 tok/s de decodificación con MTP especulativo en M3 Ultra; el mismo prefijo con caché se reprocesa en ~1,33 s.
- Configuración de muestreo recomendada por el autor del fine-tune: `temperature=1.0`, `top_p=0.95`, `top_k=20`, `min_p=0.0`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tess-4.5-27B-oQ4e-mtp (este) | 27,8 mil millones | 262k | oQ4e 4 bits, MTP conservada | Apache-2.0 | MLX vía oMLX ≥ 0.7.1, ~16 GB |
| Tess-4.5-27B (migtissera, BF16) | 27,8 mil millones | 262k | BF16 | Apache-2.0 | Pesos BF16, ~54 GB |
| Tess-4.5-27B-oQ8e-mtp (mismo autor) | 27,8 mil millones | 262k | oQ8e 8 bits | Apache-2.0 | MLX vía oMLX, ~28 GB |
| Tess-4.5-27B-oQ6e-mtp (mismo autor) | 27,8 mil millones | 262k | oQ6e 6 bits | Apache-2.0 | MLX vía oMLX, ~22 GB |
| Tess-4.5-27B-GGUF (migtissera) | 27,8 mil millones | 262k | GGUF (varias) | Apache-2.0 | llama.cpp y derivados; tamaño no disponible |
| Qwen3.8-27B (modelo base) | 27,8 mil millones (no confirmado en la información disponible) | No disponible | BF16 | No disponible | Pesos originales; sin ajuste agéntico |

No se dispone de datos de benchmarks comparativos entre estas variantes; la única referencia cuantitativa es el BenchLocal 133/150 reportado por el autor del fine-tune para el BF16, que sitúa a Tess-4.5 a la altura de Qwen3.8-27B. Las builds oQ6e y oQ8e no publican métricas de divergencia en la información disponible.

## Limitaciones y advertencias

- No se ejecutó ninguna suite de benchmarks sobre esta build; las cifras de calidad son divergencia frente al BF16, no rendimiento absoluto en tareas.
- La cuantización a 4 bits introduce degradación medible: 8,6 % de desacuerdo top-1 y subida de perplejidad de 6,048 a 6,198. En tareas de código con sintaxis estricta o razonamiento de muchos pasos el impacto puede ser mayor que la media.
- El repositorio tiene 0 descargas y 0 valoraciones en el momento de la consulta: es una publicación reciente sin validación independiente por parte de la comunidad.
- Dependencia dura de oMLX ≥ 0.7.1; no funciona con `mlx-lm` estándar ni con LM Studio según el autor. El formato no es portable a GPU NVIDIA o AMD.
- La ruta de entrada de imagen está sin probar, pese a conservarse el codificador de visión; no debe asumirse que funciona en producción.
- Las mediciones de velocidad son de una sola ejecución en un M3 Ultra de 512 GB; no son extrapolables a equipos con menos memoria o ancho de banda.
- No se declaran idiomas soportados; el rendimiento fuera de inglés, turco y código no está documentado.
- Riesgo de alucinación y sesgos: no hay evaluación publicada de sesgos ni de tasa de alucinación para este fine-tune ni para esta cuantización.
- Licencia Apache-2.0 heredada, lo que permite uso comercial, pero la build no incluye garantías del cuantizador y conviene verificar la licencia del modelo base Qwen3.8-27B antes de un despliegue comercial.
- El modelo está ajustado con thinking activado por defecto; desactivarlo puede degradar el rendimiento en tareas agénticas según las recomendaciones del autor del fine-tune.
- Con 262k tokens de contexto la caché KV (~16 GB) iguala el tamaño de los pesos, así que la memoria total necesaria duplica la cifra de "~16 GB" que suele citarse.

## Enlaces

- Repositorio de esta build: https://huggingface.co/hakunokina/Tess-4.5-27B-oQ4e-mtp
- Build oQ8e-mtp del mismo autor: https://huggingface.co/hakunokina/Tess-4.5-27B-oQ8e-mtp
- Build oQ6e-mtp del mismo autor: https://huggingface.co/hakunokina/Tess-4.5-27B-oQ6e-mtp
- Modelo fuente (fine-tune): https://huggingface.co/migtissera/Tess-4.5-27B
- Versión GGUF del modelo fuente: https://huggingface.co/migtissera/Tess-4.5-27B-GGUF
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización y runtime oMLX: https://omlx.ai

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card del repositorio. No se han localizado papers, blogs ni demos independientes.
