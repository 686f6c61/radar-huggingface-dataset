# manateelazycat/DeepSeek-V4.1-Flash-Uncensored-TensorFold-EXL3

## Resumen

DeepSeek-V4.1-Flash-Uncensored-TensorFold-EXL3 es una derivación cuantizada y «abliterada» del modelo multimodal DeepSeek-V4.1-Flash, publicada por el usuario manateelazycat (con crédito a dealignai) bajo licencia MIT. Se distribuye en formato EXL3 de ExLlamaV3 con una media de 2,9 bits por peso (codebook mul1, cabeza a 6 bits, MTP a 4 bits) y un peso aproximado en disco de 197 GiB, lo que permite servirlo en dos estaciones NVIDIA DGX Spark (GB10) con tensor parallelism 2. El propósito declarado es eliminar los circuitos de rechazo a nivel de pesos preservando el resto de capacidades.

La arquitectura subyacente se describe como encoder-decoder causal (20+20), con mezcla de expertos (384 expertos enrutados top-6 más uno compartido), Hyper-Connections, atención dispersa CSA2, memoria n-gram Engram, cabeza de borrador especulativo DSpark y torre de visión DeepSeek-ViT. El autor indica 552B de parámetros totales con 8B/16B activos por token, aunque el índice safetensors del repositorio cuantizado declara 105.247.851.346 parámetros; la discrepancia no se resuelve con la información disponible.

Su relevancia es doble: por un lado, demuestra que un MoE multimodal de gran tamaño puede cuantizarse agresivamente y ejecutarse en hardware compacto; por otro, es un artefacto explícitamente orientado a eliminar salvaguardas, con una tasa de éxito de ataque del 99,4 % en HarmBench-320, lo que lo convierte en objeto de estudio para equipos de seguridad y alineación más que en un modelo para despliegue generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder causal (20+20), MoE con 384 expertos enrutados top-6 + 1 compartido, Hyper-Connections, atención dispersa CSA2, memoria Engram, cabeza especulativa DSpark, torre de visión DeepSeek-ViT |
| Parámetros totales | 552B según la model card; 105.247.851.346 según el índice safetensors del repositorio cuantizado (discrepancia no aclarada) |
| Parámetros activos | 8B/16B por token (dato de la model card) |
| Longitud de contexto | Hasta 1M tokens; validado entre 256k y 600k en 2× DGX Spark |
| Tipos de cuantización | EXL3 trellis (codebook mul1), media 2,9 bpw, cabeza a 6 bits, MTP a 4 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato EXL3, librería exllamav3 |
| Tamaño del repositorio | 210,7 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash (relación: quantized) |
| Cabeza especulativa | DSpark integrada en el checkpoint, ~45 % de aceptación verificada |
| Adopción | 20 descargas, 0 likes |

## Arquitectura y entrenamiento

El modelo es una conversión de pesos, no un entrenamiento nuevo. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre fases de RLHF, DPO u otro ajuste por preferencias del modelo base. La model card tampoco documenta el coste de cómputo del entrenamiento original.

La innovación declarada es la «abliteración a nivel de pesos»: según el autor, los circuitos de rechazo se eliminan quirúrgicamente sin usar un `model.py` personalizado, sin hooks de ejecución y sin vectores de dirección (steering vectors), de modo que el resultado es un checkpoint EXL3 estándar que se carga igual que la cuantización base. Se afirma que se preservan los componentes críticos para la capacidad: expertos enrutados, memoria n-gram Engram, atención dispersa CSA2, cabeza de borrador DSpark, torre de visión, puertas del router, normas y embeddings. La cuantización EXL3 usa trellis con codebook mul1 a 2,9 bpw de media, con la cabeza en 6 bits y el módulo MTP en 4 bits. La model card menciona niveles de esfuerzo de razonamiento (`effort=off` y `effort=max`), lo que sugiere un modo de razonamiento configurable heredado del modelo base.

## Capacidades

- Generación de texto y razonamiento multietapa, con modo de razonamiento controlable mediante niveles de esfuerzo (`effort=off`, `effort=max`).
- Entrada multimodal imagen-texto: la torre de visión DeepSeek-ViT se conserva intacta.
- Tool calling / function calling: la model card menciona explícitamente «Vision + tools».
- Uso en agentes y razonamiento multi-paso, con coherencia multi-turno declarada como preservada tras la abliteración.
- Contexto largo de hasta 1M tokens, con validación práctica en el rango de 256k a 600k.
- Decodificación especulativa integrada en el propio checkpoint (DSpark), con ~45 % de aceptación verificada, lo que acelera la generación sin módulos externos.
- Ausencia de rechazos: la tasa de cumplimiento en HarmBench-320 es del 99,4 % tanto con effort=off como con effort=max.
- Idiomas soportados: no disponible. No hay lista de idiomas en los metadatos ni en la model card.

## Casos de uso

- Evaluación de seguridad y red-teaming: sirve como sujeto de prueba controlado para medir la eficacia de clasificadores de contenido, filtros de salida y políticas de moderación frente a un modelo sin circuito de rechazo.
- Investigación sobre alineación y circuitos de rechazo: la comparación base frente a variante abliterada sobre MMLU permite estudiar qué subconjuntos de conocimiento se degradan al eliminar la negativa a responder, con datos por asignatura publicados.
- Análisis de documentos multimodales de contexto largo: combinando la torre de visión con ventanas de 256k a 600k tokens, permite procesar informes escaneados, contratos o expedientes técnicos completos sin troceado agresivo.
- Despliegue en perímetro de datos propio: al caber en 2× DGX Spark, permite servir un MoE multimodal de gran tamaño en un laboratorio o sala técnica sin enviar datos a APIs externas.
- Pipelines de agentes con herramientas: el soporte de tool calling y la coherencia multi-turno lo hacen apto para flujos de orquestación donde el modelo debe invocar funciones y encadenar pasos.
- Refactorización y análisis de repositorios extensos: con contexto de cientos de miles de tokens puede mantener a la vista múltiples ficheros de un mismo proyecto y razonar sobre dependencias cruzadas.
- Generación de contenido editorial sin restricciones de plantilla: útil en ficción y guion donde los filtros estándar introducen rechazos espurios; requiere revisión humana y cumplimiento normativo por parte del operador.
- Docencia e investigación sobre cuantización extrema: caso de estudio de cómo 2,9 bpw afectan a un modelo multimodal, con métricas comparables de MMLU entre versión cuantizada base y versión modificada.

## Benchmarks y rendimiento

Tasa de éxito de ataque (ASR = porcentaje de cumplimiento) en HarmBench-320, decodificación greedy con T=0. La base se midió sobre una muestra representativa de 287 ítems y la variante abliterada sobre los 320 completos.

| Evaluación | ASR base | ASR variante abliterada |
|---|---:|---:|
| HB-320 effort=off | 36,1 % | 99,4 % |
| HB-320 effort=max | 21,0 % | 99,4 % |

ASR por categoría semántica de HarmBench (porcentaje de cumplimiento):

| Categoría | base off | abliterada off | base max | abliterada max |
|---|---:|---:|---:|---:|
| chemical_biological | 7 % | 100 % | 0 % | 100 % |
| copyright | 95 % | 100 % | 59 % | 99 % |
| cybercrime_intrusion | 21 % | 100 % | 0 % | 100 % |
| harassment_bullying | 20 % | 100 % | 0 % | 95 % |
| harmful | 12 % | 94 % | 0 % | 100 % |
| illegal | 0 % | 98 % | 7 % | 100 % |
| misinformation_disinformation | 36 % | 100 % | 27 % | 100 % |

MMLU-14k sobre el conjunto de test completo (14.042 ítems), ranking por logits de la base, T=0:

| Versión | Precisión | Diferencia |
|---|---:|---:|
| Base (EXL3 2,9 bpw) | 82,15 % | — |
| Abliterada | 79,20 % | −2,95 pp |

Desglose por subconjuntos:

| Subconjunto | Base | Abliterada | Diferencia |
|---|---:|---:|---:|
| No ético (n≈11.059) | 84,97 % | 84,39 % | −0,58 pp |
| Clúster ético (n=2.983) | 71,67 % | 59,94 % | −11,73 pp |

La mayor caída por asignatura es `moral_scenarios` (66,1 % → 37,8 %). La model card incluye además una tabla completa por las 57 asignaturas de MMLU; la información proporcionada solo incluye las filas hasta `high_school_world_history`, por lo que el resto no está disponible. No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- Huella de pesos: aproximadamente 197 GiB según el autor; el repositorio ocupa 210,7 GB.
- Configuración de referencia: 2× NVIDIA DGX Spark (GB10, 128 GiB de memoria unificada cada una) con tensor parallelism 2.
- GPU de centro de datos: no se documenta el comportamiento en A100 (80 GB) ni H100 (80 GB); una sola unidad no tiene memoria suficiente para los ~197 GiB de pesos.
- GPU de consumo: no cabe. Ni RTX 4090 (24 GB) ni RTX 5090 (32 GB) pueden alojar el checkpoint completo.
- Opciones de despliegue: exclusivamente ExLlamaV3 (`exllamav3`), al tratarse de un checkpoint EXL3. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI; no disponible para esas rutas.
- Aceleración: decodificación especulativa DSpark integrada en el checkpoint, con ~45 % de aceptación verificada según el autor.
- Latencia y throughput: no disponible. No se publican tokens por segundo ni tiempos de primera token en la información proporcionada.
- Cuantizaciones alternativas: no disponible. El repositorio solo distribuye EXL3 a 2,9 bpw.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-Uncensored-TensorFold-EXL3 | 552B (8B/16B activos) según model card; 105,25B según safetensors | Hasta 1M tokens | 79,20 % (MMLU-14k, versión abliterada) | MIT | HuggingFace, 20 descargas, requiere ExLlamaV3 |
| DeepSeek-V4.1-Flash (base, EXL3 2,9 bpw) | 552B (8B/16B activos) según model card | no disponible | 82,15 % (MMLU-14k) | no disponible | HuggingFace |
| Otras variantes abliteradas de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otras alternativas comparables (mismo tamaño, misma tarea de multimodalidad con contexto largo o mismo enfoque de abliteración) en la información proporcionada.

## Limitaciones y advertencias

- Eliminación deliberada de salvaguardas: la tasa de cumplimiento en HarmBench-320 es del 99,4 %, con un 100 % en categorías como `chemical_biological`, `cybercrime_intrusion` y `misinformation_disinformation`. No es apto para uso generalista ni para aplicaciones expuestas a usuarios finales sin capas externas de moderación.
- Degradación medible de capacidades: la MMLU global cae 2,95 puntos porcentuales. En el clúster ético la caída es de 11,73 pp y `moral_scenarios` pasa de 66,1 % a 37,8 %, lo que indica que el modelo pierde capacidad de razonamiento normativo.
- Riesgo de alucinación: no se publican métricas de veracidad ni de calibración; como cualquier modelo generativo, puede producir afirmaciones falsas con alta confianza.
- Idiomas soportados no documentados: se desconoce la cobertura multilingüe real y su calidad fuera del inglés.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, culturales o sociales. La eliminación del circuito de rechazo puede amplificar sesgos presentes en los datos originales.
- Restricciones de licencia: la licencia declarada es MIT, lo que en principio permite uso comercial, pero la licencia del modelo base DeepSeek-V4.1-Flash no está disponible en la información proporcionada; conviene verificarla antes de cualquier explotación comercial.
- Responsabilidad legal: el operador asume el cumplimiento normativo (por ejemplo, en materia de contenidos ilícitos o desinformación) al desplegar un modelo sin filtros.
- Dependencia de un único runtime: al ser EXL3, queda atado a ExLlamaV3 y a hardware con suficiente memoria; no hay rutas de despliegue alternativas documentadas.
- Validación limitada del contexto: el contexto se valida hasta 600k tokens en la configuración de 2× DGX Spark, aunque el máximo declarado sea 1M.
- Adopción muy baja: 20 descargas y 0 likes en el momento de la consulta, con publicación y actualización el 4 de octubre de 2026 según los metadatos de HuggingFace, sin revisión por pares ni reproducibilidad independiente.
- Artefacto derivado: al ser una conversión cuantizada y modificada, hereda cualquier limitación del modelo base más las introducidas por la cuantización a 2,9 bpw.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manateelazycat/DeepSeek-V4.1-Flash-Uncensored-TensorFold-EXL3
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor de la abliteración en X: https://x.com/dealignai
- Resultados de búsqueda web: no se han encontrado enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda realizada; los resultados devueltos corresponden a páginas genéricas de un motor de búsqueda y no guardan relación con el modelo.
