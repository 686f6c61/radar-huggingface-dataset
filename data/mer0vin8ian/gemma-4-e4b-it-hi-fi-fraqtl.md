# Mer0vin8ian/Gemma-4-E4B-it-Hi-Fi-fraQtl

## Resumen

Gemma-4-E4B-it-Hi-Fi-fraQtl es una cuantización Q4_K_M en formato GGUF del modelo google/gemma-4-E4B-it, publicada por el usuario Mer0vin8ian bajo la marca fraQtl. Se trata de un build "calibration-aware" (con matriz de importancia, imatrix) que busca mejorar la fidelidad respecto a la cuantización Q4_K_M de referencia de la comunidad (bartowski) manteniendo el mismo tamaño en disco. El modelo base tiene 7.518.069.290 parámetros reales según safetensors y está etiquetado como "E4B" (variante eficiente de la familia Gemma 4 orientada a despliegue en dispositivo).

La relevancia de esta ficha es acotada: no es un modelo nuevo, sino una receta de cuantización que reclama una mejora medible de fidelidad respecto al bf16 original, concentrada en cargas de trabajo de código y matemáticas. Según la model card, la divergencia KL simétrica top-20 baja de 0.0462 a 0.0387 (−16.2%) en código/matemáticas y de 0.0619 a 0.0593 (−4.2%) en general, con acuerdo top-1 idéntico (0.948 en código/matemáticas y 0.910 en general). El autor es explícito: la ganancia es real pero modesta y, en chat general, prácticamente indistinguible del build comunitario.

El repo incluye además un build "Phone" de ~4.59 GB con PLE degradado a Q4_K, pensado para dispositivos de gama móvil y portátiles de clase Snapdragon X. La licencia es Gemma, heredada del modelo base, lo que condiciona el uso comercial. No hay información publicada sobre idiomas soportados ni sobre arquitectura interna más allá de lo que se deduce del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base google/gemma-4-E4B-it; variante "E4B" de la familia Gemma 4) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (build principal, 5.40 GB); Q4_K en PLE para el build Phone (~4.59 GB) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | GGUF (safetensors como referencia del modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada: la model card del build cuantizado no detalla si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni describe la composición del dataset de entrenamiento, el número de tokens o las etapas de alineación (RLHF/DPO). Lo único documentado es el proceso de cuantización: se parte del checkpoint bf16 original de google/gemma-4-E4B-it, se calcula una imatrix (matriz de importancia) y se aplica una receta de cuantización Q4_K_M "calibration-aware" con el objetivo de preservar las activaciones más sensibles, especialmente en dominios de código y matemáticas.

La innovación técnica declarada es metodológica, no arquitectónica: la cuantización guiada por calibración y la publicación de artefactos de reproducibilidad (hash de la receta, sha256 de cada artefacto, imatrix). La fidelidad se mide como divergencia KL simétrica top-20 contra un teacher Q8 del checkpoint bf16 original, que el autor justifica como el eje que experimenta un usuario que migra desde bf16. El build Phone demuestra PLE a Q4_K y el autor afirma que es "speed-neutral by construction" porque los bytes relevantes para el ancho de banda son idénticos. Las pruebas de validación reportadas son "Gates 1/2 PASS" y "phone smoke PASS".

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag "conversational").
- Razonamiento y matemáticas: el autor reporta evaluación GSM8K en modo 0-shot con cadena de pensamiento instruida (n=200, seed 0), con resultados comparables al build comunitario (bartowski 84.0%), sin reclamar mejora.
- Código: es el dominio donde la cuantización reclama mayor fidelidad respecto al bf16 (KLD 0.0387 frente a 0.0462 del baseline).
- Ejecución en dispositivo y edge: compatible con llama.cpp y con el plugin GenieX llama.cpp, orientado a portátiles de clase Snapdragon X y teléfonos.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere despliegue servido, aunque no se detalla la infraestructura.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistencia de código en portátil de gama alta: el build Q4_K_M de 5.40 GB cabe en equipos con 8-16 GB de memoria unificada y ofrece la mayor fidelidad relativa al bf16 en código y matemáticas, por lo que es adecuado para autocompletado, explicación de fragmentos y generación de tests en local sin conexión.
- Razonamiento matemático en el borde: con GSM8K evaluado en modo 0-shot con cadena de pensamiento, el modelo puede resolver problemas aritméticos de varios pasos en un portátil o teléfono, útil para tutores educativos offline o calculadoras conversacionales.
- Despliegue en móvil con el build Phone: el archivo de ~4.59 GB con PLE en Q4_K reduce el espacio en disco un 15% sin cambiar los bytes críticos para el ancho de banda, lo que lo hace viable en teléfonos de gama alta y en asistentes embebidos.
- Chat general en local: para conversación multi-turno en escritorio, el modelo se comporta prácticamente igual que el Q4_K_M comunitario (KLD general 0.0593 frente a 0.0619), por lo que sirve como asistente personal privado sin salida a la nube.
- Evaluación y benchmarking de recetas de cuantización: el repo publica imatrix, hash de receta y sha256 de cada artefacto, lo que permite a un equipo de infraestructura reproducir la comparación KLD y decidir si merece la pena adoptar la receta en sus propios builds.
- Prototipado de pipelines con llama.cpp: al ser GGUF compatible con llama.cpp y con el plugin GenieX, encaja en pruebas de concepto de agentes locales, clasificación de texto o generación aumentada por recuperación antes de escalar a un modelo mayor.
- Distribución en entornos con requisitos de privacidad: al ejecutarse íntegramente en dispositivo, permite procesar documentos sensibles (código propietario, datos clínicos o financieros) sin enviarlos a un proveedor externo.

## Benchmarks y rendimiento

| Metrica | fraQtl Hi-Fi (iso-size) | bartowski Q4_K_M (baseline) | Delta |
|---|---|---|---|
| Tamano | 5.40 GB | 5.40 GB | 0 |
| KLD codigo/matematicas | 0.0387 | 0.0462 | −16.2% |
| KLD general | 0.0593 | 0.0619 | −4.2% |
| Top-1 agree (codigo/matematicas) | 0.948 | 0.948 | empate |
| Top-1 agree (general) | 0.910 | 0.910 | empate |
| GSM8K (0-shot CoT, n=200, seed 0) | comparable al baseline | 84.0% | sin reclamacion de mejora |
| Wikitext-2 perplexity | solo sanity flag | no disponible | no es criterio de validacion |

Las cifras de KLD son la media de 3 ejecuciones independientes con deriva run-to-run de 0.0, según el autor. La metrica de fidelidad es divergencia KL simetrica top-20 contra un teacher Q8 del checkpoint bf16 original. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el build principal ocupa 5.40 GB en disco; con overhead de contexto y cache KV, se recomienda al menos 8 GB de memoria disponible. El build Phone ocupa ~4.59 GB, por lo que apunta a 6-8 GB.
- GPU recomendadas: no hay lista oficial en la información proporcionada. Por tamaño, encaja en RTX 4060 Ti/4070 (8-12 GB), RTX 4080/4090, A100 y H100 sin problema; también en GPUs integradas con memoria unificada.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM, y en portátiles con memoria unificada de 16 GB (clase Snapdragon X según el autor).
- Opciones de despliegue: llama.cpp y el plugin GenieX llama.cpp están citados explícitamente. vLLM, Ollama y TGI no se mencionan en la información disponible, aunque el tag "endpoints_compatible" sugiere compatibilidad con servidores de inferencia estándar.
- Latencia y throughput: no disponibles. El autor afirma que el build Phone es "speed-neutral by construction" porque los bytes relevantes para el ancho de banda son idénticos, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Fidelidad / rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| fraQtl Hi-Fi Q4_K_M (este) | 7.518 M | no disponible | GGUF, 5.40 GB | gemma | KLD c/m 0.0387; gen 0.0593; GSM8K comparable a 84.0% | Hugging Face, 0 descargas |
| bartowski Q4_K_M | 7.518 M (mismo base) | no disponible | GGUF, 5.40 GB | gemma | KLD c/m 0.0462; gen 0.0619; GSM8K 84.0% | Hugging Face, build comunitario de referencia |
| fraQtl Phone Q4_K (incluido) | 7.518 M (mismo base) | no disponible | GGUF, ~4.59 GB | gemma | PLE en Q4_K; sin cifras de KLD publicadas | Incluido en el mismo repo |
| Checkpoint bf16 original (google/gemma-4-E4B-it) | 7.518 M | no disponible | safetensors | gemma | Referencia de fidelidad (teacher Q8) | Hugging Face, modelo oficial |

La comparación relevante es contra el propio modelo base en bf16 y contra el Q4_K_M comunitario: no se dispone de datos de otros modelos de tamaño similar (por ejemplo, variantes de 7-8 B de otras familias) en la información proporcionada.

## Limitaciones y advertencias

- La mejora de fidelidad es modesta y acotada: −16.2% en KLD de código/matemáticas y −4.2% en general, con acuerdo top-1 empatado (0.948 y 0.910). En chat general el comportamiento es prácticamente idéntico al build comunitario, según el propio autor.
- El modelo base es Gemma 4 E4B, del que no se documentan sesgos, idiomas ni datos de entrenamiento en esta ficha; los sesgos heredados del base no están evaluados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible. La evaluación GSM8K en 0-shot CoT no sustituye a una evaluación de factualidad.
- Licencia Gemma: impone condiciones específicas de uso (incluida la política de uso aceptable de Google) que deben revisarse antes de un despliegue comercial. No es una licencia permisiva tipo Apache 2.0 o MIT.
- Longitud de contexto e idiomas soportados no disponibles: no se puede garantizar el comportamiento en contextos largos ni en castellano sin validación propia.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente de las cifras de KLD más allá de la reproducibilidad declarada por el autor.
- La métrica de fidelidad es KLD top-20 contra un teacher Q8 del bf16; es una medida de proximidad distribucional, no de calidad de tarea. El propio autor advierte que Wikitext-2 perplexity es solo un sanity flag.
- El build Phone degrada PLE a Q4_K: el autor afirma que es neutral en velocidad, pero no publica métricas de calidad específicas para ese artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mer0vin8ian/Gemma-4-E4B-it-Hi-Fi-fraQtl
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Build comunitario de referencia (bartowski Q4_K_M): no disponible como enlace directo en la información proporcionada
- llama.cpp: no disponible como enlace directo en la información proporcionada
- Plugin GenieX llama.cpp: no disponible como enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
