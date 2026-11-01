# chronarion/GLM-5.3-Hecate

## Resumen

GLM-5.3-Hecate es una cuantización híbrida del modelo GLM-5.3 (un MoE de 753B parámetros desarrollado por Z.ai, publicado originalmente como zai-org/GLM-5.3-BF16). La release la firma el usuario chronarion y no es un checkpoint estándar: es un despliegue empaquetado específicamente para una única NVIDIA DGX Station GB300, donde el reparto de expertos se hace por niveles entre la GPU GB300 (HBM), la RTX PRO 6000 Blackwell Max-Q y la CPU Grace. El objetivo declarado es servir un MoE de 753B en un solo nodo de escritorio-sobremesa con velocidades de decodificación de tres cifras.

Técnicamente se trata de una mezcla de cuantizaciones: expertos enrutados en int4 GPTQ (con escalas por fila y Hessianos por experto), un nivel "templado" en EXL3 trellis de 3 bits, proyecciones de atención y expertos compartidos en int8, y tensores sin cuantizar (embeddings, normas, router, indexador DSA, MTP) en el directorio `base/`. Los ficheros solo son utilizables con el runtime Hecate (ExLlamaV3 + TabbyAPI + kernels propios); no son compatibles con llama.cpp, vLLM ni Ollama.

Su relevancia es doble: por un lado demuestra que un modelo de 753B puede servirse con latencias aceptables en hardware de estación de trabajo Blackwell mediante colocación consciente del enrutamiento; por otro, la licencia es la propia de GLM-5.3 ("other", glm-5.3), lo que condiciona su uso comercial. La release tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks de calidad del modelo base en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer con atención dispersa (DSA) y decodificación especulativa MTP; cuantización híbrida int4/int8/EXL3 |
| Parámetros totales | 753B (según la model card: "753B MoE") |
| Parámetros activos | no disponible |
| Longitud de contexto | 2 × 256K por defecto (KV en Q6); 1M tokens con perfil de contexto largo |
| Tipos de cuantización | int4 GPTQ (expertos enrutados), EXL3 trellis 3 bits (nivel templado), int8 con escala por fila (atención, expertos compartidos, MLP densos, LM head); tensores BF16 sin cuantizar en `base/` |
| Idiomas soportados | no disponible (la model card no los enumera; el set de calibración KLD incluye ventanas en chino) |
| Licencia | glm-5.3 (etiquetada como "other"; enlace a la licencia del modelo base) |
| Formato de pesos | Formato propietario del runtime Hecate (fragment order de los kernels moe4 y GEMV); no es EXL3, GGUF ni safetensors estándar |
| Tamaño del repositorio | 359,3 GB |
| Modelo base | zai-org/GLM-5.3-BF16 |
| Librería | exllamav3 |
| Hardware objetivo | NVIDIA DGX Station GB300 (GB300 252 GB + RTX PRO 6000 Blackwell Max-Q 96 GB + Grace 72 núcleos) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un MoE transformer con atención dispersa (DSA) que activa un subconjunto de expertos por token; la model card de Hecate confirma que a partir de 2.048 tokens de contexto la atención dispersa toma el relevo, lo que explica la caída de throughput entre contexto 0 y 16K. Incluye además una cabeza MTP (multi-token prediction) usada para decodificación especulativa, con 3 borradores por defecto en decodificación concurrente 1.

La cuantización de Hecate se construyó con un pipeline propio: los expertos se ordenan por popularidad de enrutamiento a partir de un log de 2.599 pasos de verificación sobre 24 prompts, y se reparten en tres niveles (144 expertos por capa en la GB300, 85 en la RTX PRO 6000, 27 en la Grace). Los expertos int4 se cuantizaron con GPTQ sobre 852K tokens de calibración, con act-order, Hessianos por experto encogidos hacia la covarianza de entrada de la capa, proyecciones down calibradas sobre la salida cuantizada de gate/up y calibración capa a capa sobre los estados que produce el modelo ya cuantizado. El nivel templado usa el cuantizador EXL3 de ExLlamaV3 (LDLQ trellis, K=3) con los mismos Hessianos. Las proyecciones int8 usan escala por fila con clipping elegido por MSE. La innovación principal no es algorítmica sobre el modelo base, sino de despliegue: colocación por niveles guiada por enrutamiento y kernels a medida (moe4, GEMV de clúster) para servir el MoE en un solo nodo.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat incluida en `base/`.
- Razonamiento y matemáticas: el set de evaluación KLD incluye ventanas de matemáticas, lo que indica cobertura, aunque no se publican benchmarks de calidad.
- Código: hay ventanas de código en la evaluación de divergencia; no se detalla rendimiento.
- Multilingüe: el set de calibración incluye ventanas en chino además de inglés; la lista oficial de idiomas no está disponible.
- Decodificación especulativa con MTP (3 borradores por defecto), integrada en el runtime.
- Contexto largo: 2 × 256K por defecto y una conversación de 1M tokens con el perfil de contexto largo.
- Servido mediante TabbyAPI, lo que habilita una API compatible con OpenAI para integración en aplicaciones.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Asistente conversacional de contexto largo: con 2 × 256K tokens de ventana por defecto, el modelo puede mantener conversaciones con documentos extensos o historiales de varias sesiones sin truncar, algo poco habitual en modelos de este tamaño servidos en un solo nodo.
- Análisis de repositorios completos: la ventana de 1M tokens del perfil de contexto largo permite ingerir un repositorio mediano y hacer preguntas sobre él; el prefill de 1.507 tok/s medido con un prompt de 375K tokens hace viable la carga inicial.
- Generación de código en pipelines internos: servido por TabbyAPI con API compatible con OpenAI, puede integrarse en herramientas de revisión o generación de parches dentro de una red corporativa, sin depender de proveedores externos.
- Investigación sobre cuantización y serving de MoE: el repositorio incluye scripts, protocolos KLD y logs de benchmark en el repositorio de Hecate, lo que lo convierte en una referencia reproducible para estudiar el impacto de la cuantización híbrida en modelos de 753B.
- Despliegue on-premise con requisitos de soberanía de datos: al ejecutarse íntegramente en una DGX Station GB300, permite procesar datos sensibles sin salida a la nube, siempre que la licencia glm-5.3 lo permita para el caso concreto.
- Evaluación comparativa de cuantizaciones: el autor publica una tabla de KLD frente a otras cuantizaciones de GLM-5.3 (Infatoshi, brandonmusic, vcruz305, bertholomus, drowzeys), útil para equipos que deban elegir un checkpoint para su propio hardware.
- Procesamiento por lotes de documentos largos: con concurrencia 2-4 y ventanas de 64K-128K, puede resumir o extraer información de contratos, informes o expedientes en un flujo batch controlado.

## Benchmarks y rendimiento

Los datos publicados son de rendimiento de inferencia y divergencia de cuantización, no de calidad del modelo base. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

Decodificación (llm-inference-bench, contexto 0, ventanas de 30 s, ignore_eos, 2.048 tokens máx., tok/s agregados):

| Concurrencia | 1 | 2 | 4 | 8 | 16 | 32 |
|---|---:|---:|---:|---:|---:|---:|
| tok/s | 154,5 | 190,1 | 112,0 | 235,1 | 67,4 | 121,5 |

Decodificación frente a contexto (concurrencia 1, ventanas de 30 s):

| Contexto | 0 | 16K | 32K | 64K | 128K |
|---|---:|---:|---:|---:|---:|
| tok/s | 149,0 | 118,2 | 117,3 | 112,2 | 105,0 |

Prefill en frío (llm-inference-bench, 3 rondas):

| Prompt | Ronda 1 | Ronda 2 | Ronda 3 |
|---|---:|---:|---:|
| 8K | 2.033 tok/s | 2.053 tok/s | 2.054 tok/s |
| 64K | 1.986 tok/s | 1.989 tok/s | 1.987 tok/s |

Prueba propia del autor (10 prompts de chat × 3 pasadas, greedy, 400 tokens, concurrencia 1): 138,4 tok/s (138,6 / 138,2 / 138,5). Prompt de 27,6K tokens: prefill 1.363 tok/s, decodificación 120 tok/s. Prompt de 109K: prefill 1.878 tok/s, decodificación 115 tok/s. Con perfil de 1M, prompt de 375K: prefill 1.507 tok/s, decodificación 67 tok/s.

Divergencia KL frente a BF16 (media sobre el vocabulario completo, protocolo rtx6kpro, 36.848 posiciones): 0,0740. Comparativa con otras cuantizaciones de GLM-5.3 (el autor advierte que la metodología es preliminar y los conjuntos de evaluación difieren):

| Cuantización | bpw | KLD | Conjunto de evaluación |
|---|---:|---:|---|
| Hecate (esta release) | 3,8 | 0,0740 | 18 ventanas, 36.848 posiciones, ruta de decodificación verify-shape |
| Infatoshi EXL3 3.0 bpw (puntuado por el autor) | 3,04 | 0,1013 | mismas ventanas |
| brandonmusic EXL3 TR3 | 3,0 | 0,0979 | 16 ventanas selladas, 32.752 posiciones |
| vcruz305 EXL3 | 3,38 | 0,0948 | conjunto propio, 10.240 posiciones |
| bertholomus EXL3 | 3,04 | 0,109 (0,119 a 4 × 16K) | wikitext-2, 32 × 2.048 |
| drowzeys EXL3 | 2,75 | 0,124 | 32 × 2.048 |

## Requisitos de hardware

- Hardware objetivo único: NVIDIA DGX Station GB300, con GB300 de 252 GB de HBM, RTX PRO 6000 Blackwell Max-Q de 96 GB y CPU Grace de 72 núcleos. El repositorio ocupa 359,3 GB en disco.
- No cabe en GPU de consumo: el reparto de expertos está diseñado para tres dispositivos con memoria agregada muy superior a cualquier RTX 4090 (24 GB) o RTX 5090 (32 GB). No se documenta ninguna configuración alternativa.
- Runtime obligatorio: Hecate (ExLlamaV3 + TabbyAPI + kernels propios). No es compatible con vLLM, llama.cpp, Ollama ni TGI, y los ficheros no son un checkpoint EXL3, GGUF o safetensors estándar.
- Versiones de software probadas: driver 615.71 y CUDA 13.0.
- Throughput medido: 138,4 tok/s en decodificación con concurrencia 1 y prompts de chat; 154,5 tok/s en contexto 0 con la herramienta de benchmark; 105 tok/s a 128K de contexto; prefill de aproximadamente 2.000 tok/s en prompts de 8K-64K.
- El servidor está optimizado para una o dos conversaciones simultáneas; a partir de 4 peticiones concurrentes recorta los borradores MTP para mantenerse en la ruta rápida de decodificación de 8 filas, y a partir de 16 abandona esa ruta, con caídas de throughput visibles en la tabla de concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Hecate (esta release) | 753B MoE | 2 × 256K (1M con perfil largo) | Híbrida int4/int8/EXL3 3 bits | glm-5.3 ("other") | Solo runtime Hecate en DGX Station GB300 |
| zai-org/GLM-5.3-BF16 (modelo base) | 753B MoE | no disponible en esta ficha | BF16 | glm-5.3 | Pesos completos en BF16; requiere hardware de mucha mayor memoria |
| Infatoshi EXL3 3.0 bpw | 753B MoE (GLM-5.3) | no disponible | EXL3 3,0 bpw | glm-5.3 | EXL3 estándar; KLD 0,1013 en las mismas ventanas |
| brandonmusic EXL3 TR3 | 753B MoE (GLM-5.3) | no disponible | EXL3 3,0 bpw | glm-5.3 | EXL3 estándar; KLD 0,0979 en 16 ventanas |

La comparación relevante para esta release es frente a otras cuantizaciones del mismo GLM-5.3: Hecate logra menor divergencia (0,0740) que las alternativas publicadas, aunque con conjuntos de evaluación no idénticos y una advertencia explícita del autor sobre la madurez del protocolo. Frente a modelos de tamaño distinto no se dispone de datos comparables en la información proporcionada.

## Limitaciones y advertencias

- Portabilidad nula: los pesos solo funcionan con el runtime Hecate y el hardware DGX Station GB300 descrito; no se pueden cargar en vLLM, llama.cpp, Ollama, TGI ni en un servidor EXL3 convencional.
- Licencia glm-5.3 (etiquetada como "other"): es necesario revisar el texto de la licencia del modelo base antes de cualquier uso comercial; no se detallan aquí sus restricciones.
- La comparativa de KLD es preliminar según el propio autor: los conjuntos de evaluación difieren entre filas y las diferencias inferiores al 30% deben leerse como ruido.
- No hay benchmarks de calidad del modelo base (razonamiento, código, matemáticas) en la información disponible; el rendimiento medido es exclusivamente de inferencia y divergencia de cuantización.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser una cuantización, hereda los del modelo base, que tampoco se detallan.
- Idiomas soportados no especificados; la calibración incluye chino e inglés, pero no hay garantías para otras lenguas.
- Throughput muy sensible a la concurrencia: las tablas muestran caídas a 67,4 tok/s con 16 peticiones y un comportamiento no monótono entre 4 y 32, por lo que no es adecuado para servir a muchos usuarios simultáneos.
- La decodificación especulativa hace que la velocidad dependa del texto generado (tasa de aceptación de los borradores), lo que introduce variabilidad entre ejecuciones.
- Release con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación independiente del pipeline de cuantización.
- El repositorio de 359,3 GB exige almacenamiento dedicado y una transferencia inicial considerable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chronarion/GLM-5.3-Hecate
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16/blob/main/LICENSE
- Runtime Hecate: https://github.com/chronarion/hecate
- Benchmarks y logs crudos: https://github.com/chronarion/hecate/tree/main/benchmarks
