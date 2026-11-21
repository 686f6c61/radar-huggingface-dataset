# Baekpica/Swift1.5-GLM-5.3-Flash-VQ-GGUF

## Resumen

Swift1.5-GLM-5.3-Flash-VQ-GGUF es una conversión cuantizada del modelo ukisai/Swift1.5-GLM-5.3-Flash, publicada por Baekpica. Se trata de un checkpoint de tipo mixture-of-experts (MoE) multimodal (image-text-to-text) distribuido en formato GGUF con una técnica propia de cuantización vectorial denominada hVQ (hessian vector quantization). El autor la presenta como una alternativa optimizada para servir el modelo en un único DGX Spark (GB10) mediante el runtime ds4-dfm-rs, manteniendo el tokenizador y la plantilla de chat originales.

La arquitectura descrita en la model card incluye 45 bloques de tronco, 288 expertos por bloque enrutado, una torre de visión de 24 bloques, una capa MTP (multi-token prediction) usada como drafter para decodificación especulativa y una longitud de contexto configurada de 1.048.576 tokens. El repositorio ocupa 94,5 GB, con un payload de tensores de 94.483.348.344 bytes repartidos en 56.297 tensores.

La relevancia de esta ficha radica en que documenta una propuesta de cuantización agresiva (entre 1,625 y 2,625 bits por peso en las capas enrutadas, más Q4_K en 316 matrices no-expertas) orientada a reducir el coste de servir un MoE multimodal de contexto muy largo en hardware de una sola GPU. Los datos de fidelidad publicados comparan hVQ frente a una cuantización vectorial convencional sobre el mismo checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con torre de visión de 24 bloques y drafter MTP de una capa; 45 bloques de tronco y 288 expertos por bloque enrutado |
| Parametros totales | 634.388.480 (dato de safetensors del repo; no coincide con el payload de ~94,5 GB del GGUF, que corresponde a otro recuento) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (configurado) |
| Tipos de cuantizacion | GVQ1/hVQ: R13+8 (2,625 bits/peso) en expertos enrutados de capas 3–17, 22, 27, 41 y 44; R13 (1,625 bits/peso) en las otras 23 capas enrutadas; Q4_K en 316 matrices no-expertas; tensores GVQ1 dedicados para pesos de lenguaje, routing y estado; torre de visión y MTP a precisión completa (MTP capa 45 en E4M3 escalado) |
| Idiomas soportados | no disponible (la model card menciona streaming en coreano en las pruebas HTTP) |
| Licencia | swift-open-license-1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (56 partes, directorio completo para el loader ds4) |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal con 45 bloques de tronco y 288 expertos por bloque enrutado, acompañado de una torre de visión de 24 bloques y una capa MTP (multi-token prediction) que actúa como drafter para decodificación especulativa. La conversión preserva el tokenizador Swift y la plantilla de chat del modelo original. La capa MTP 45 se almacena en representación E4M3 escalada, requisito del camino de draft GVQ1 embebido.

La cuantización hVQ se apoya en un estudio previo de sensibilidad por capas (GLM sensitivity study) y entrena sus propios codebooks para cada checkpoint. Para estimar las correlaciones de entrada completas utiliza las entradas enrutadas de 566.932 tokens procedentes de 828 secuencias, aplicando dos pasadas secuenciales de asignación que propagan el error de cada bloque a las columnas de entrada posteriores y reajustan las ganancias de fila almacenadas. La calibración se documenta en calibration-summary.json y la receta de conversión en recipe.json.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, con plantilla de chat propia del modelo Swift.
- Razonamiento separado (modo de razonamiento distinguible del texto de salida, verificado en las pruebas HTTP del autor).
- Procesamiento de imágenes (image-text-to-text): la torre de visión identificó seis colores sólidos, leyó una etiqueta OCR y distinguió formas coloreadas en PNG y JPEG.
- Tool calling / function calling: las pruebas incluyen una llamada a herramienta y su seguimiento.
- Prompts de agente y multi-step reasoning (grupo de evaluación "Tool use and agent prompts").
- Capacidades multilingües parciales: se verifica streaming en coreano; el resto de idiomas no está documentado.
- Decodificación especulativa mediante la capa MTP embebida (1.101 de 1.335 propuestas aceptadas en las peticiones de prueba).
- Soporte de endpoints completions, messages y responses en el runtime ds4.
- Contexto muy largo: 1.048.576 tokens configurados, con reutilización de prefijo verificada (una continuación de 641 tokens reutilizó 634).

## Casos de uso

- Asistencia conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno sobre documentos extensos gracias a su ventana de 1.048.576 tokens y a la reutilización de prefijo observada en las pruebas (634 de 641 tokens reutilizados en una continuación).
- Procesamiento de documentos con OCR y comprensión visual: la torre de visión lee etiquetas OCR y distingue formas y colores en imágenes PNG y JPEG, lo que permite digitalizar y describir documentación escaneada o capturas.
- Agentes con tool calling: las pruebas del autor incluyen una llamada a herramienta y su seguimiento, por lo que puede integrarse en flujos de agente que consultan APIs externas y encadenan pasos.
- Razonamiento matemático y científico: el grupo de evaluación "Math, science and reasoning" muestra la mayor fidelidad relativa al modelo original (KL 0,510 y top-1 84,1% con hVQ), lo que lo hace adecuado para asistencia técnica en esas áreas.
- Generación y revisión de código: el grupo "Code and SWE" registra KL 0,896 y top-1 75,4% con hVQ, apto para tareas de autocompletado y revisión dentro de pipelines.
- Despliegue en hardware de una sola GPU: el autor verifica el servicio a contexto nativo en un único DGX Spark (GB10) con `--mtp-mode on --mtp-draft 2 --mem-floor-gb 4`, lo que habilita prototipos y entornos de investigación con recursos limitados.
- Inferencia multimodal por lotes pequeños: el planificador automático seleccionó una sesión serial de texto e imagen con 2.048 filas de prefill y una cuota de 114,67 GiB, útil para cargas de trabajo mixtas texto-imagen.

## Benchmarks y rendimiento

Fidelidad frente al checkpoint original (34 secuencias reservadas, logaritmos naturales, 24.724 posiciones de siguiente token ponderadas por igual):

| Metrica | Vanilla VQ | hVQ | hVQ − vanilla (intervalo 95% emparejado) |
|---|---:|---:|---|
| KL de siguiente token vs fuente (menor mejor) | 0,8148 | 0,6515 | -0,1633 [-0,2277, -0,1107] |
| Acuerdo top-1 con la fuente (mayor mejor) | 74,35% | 78,67% | +4,32 pp [+3,60, +5,06] |
| NLL de siguiente token (menor mejor) | 2,2540 | 2,5418 | +0,2878 [+0,1543, +0,4377] |
| Perplejidad (menor mejor) | 9,526 | 12,703 | +3,177 [+1,177, +7,544] |
| Coseno del hidden state final (mayor mejor) | 0,8367 | 0,8876 | +0,0509 [+0,0450, +0,0574] |
| Error L2 relativo de salida enrutada (menor mejor) | 0,4317 | 0,3560 | -0,0757 |

Referencia del original: NLL 2,4564 y perplejidad 11,663. El coseno del hidden state se promedia sobre 24.758 posiciones. Los intervalos son percentiles de 10.000 remuestreos bootstrap emparejados por secuencia completa.

Desglose por grupo reservado:

| Grupo | Casos | Tokens puntuados | KL vanilla | KL hVQ | Top-1 vanilla | Top-1 hVQ |
|---|---:|---:|---:|---:|---:|---:|
| Texto general | 9 | 6.217 | 1,058 | 0,889 | 70,8% | 74,0% |
| Chat e instrucciones | 8 | 5.542 | 0,492 | 0,356 | 77,5% | 82,4% |
| Matemáticas, ciencia y razonamiento | 7 | 5.258 | 0,609 | 0,510 | 81,0% | 84,1% |
| Código y SWE | 7 | 5.150 | 1,066 | 0,896 | 70,2% | 75,4% |
| Uso de herramientas y prompts de agente | 3 | 2.557 | 0,839 | 0,512 | 71,0% | 77,2% |

Rendimiento de servicio en DGX Spark (medianas de 2K–64K, tres procesos frescos por build, 128 tokens greedy por frontera):

| Contexto | Prefill antes (tok/s) | Prefill después (tok/s) | Decode antes (tok/s) | Decode después (tok/s) |
|---|---:|---:|---:|---:|
| 2K–64K, mediana de medias por ejecución | 1.098,0 | 1.230,3 | (dato truncado en la model card) | (dato truncado en la model card) |

El autor informa una mejora del 12,0% en prefill incremental y del 8,6% en decode en medianas; decode mejora en 23 de 32 fronteras. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Almacenamiento: repositorio de 94,5 GB en GGUF (56 partes); payload de tensores de 94.483.348.344 bytes.
- VRAM estimada: el autor reporta una cuota de planificación de 114,67 GiB para una sesión serial texto+imagen con 2.048 filas de prefill en DGX Spark (GB10) a contexto nativo; no se detalla el desglose por componente.
- GPU recomendadas: DGX Spark (GB10) verificada por el autor con ds4-dfm-rs. Otras GPU (A100, H100, RTX 4090) no están documentadas en la información disponible.
- GPU de consumo: no hay datos que confirmen que quepa en una RTX 4090 u otras consumer GPU; el volumen de pesos (~94,5 GB) excede la VRAM típica de esas tarjetas.
- Opciones de despliegue: ds4-dfm-rs con flags `--mtp-mode on --mtp-draft 2 --mem-floor-gb 4` (documentado). Otros runtimes (vLLM, llama.cpp, Ollama, TGI) no están mencionados en la información disponible.
- Latencia y throughput: prefill incremental mediano de 1.230,3 tok/s y decode con mejora del 8,6% en medianas sobre 2K–64K en DGX Spark; valores absolutos de decode truncados en la model card.
- Decodificación especulativa: MTP aceptó 1.101 de 1.335 propuestas en las peticiones de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift1.5-GLM-5.3-Flash-VQ-GGUF (hVQ) | 634.388.480 (safetensors); payload GGUF ~94,5 GB | 1.048.576 | KL 0,6515; top-1 78,67%; PPL 12,703 vs original | swift-open-license-1.0 | Hugging Face (Baekpica) |
| Swift1.5-GLM-5.3-Flash (vanilla VQ, referencia del autor) | Mismo checkpoint base | 1.048.576 | KL 0,8148; top-1 74,35%; PPL 9,526 | no disponible en esta ficha | Hugging Face (Baekpica/GLM-5.3-Flash-VQ-GGUF) |
| Swift1.5-GLM-5.3-Flash (original BF16) | no disponible | 1.048.576 | NLL 2,4564; PPL 11,663 (referencia) | no disponible en esta ficha | Hugging Face (ukisai) |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría (MoE multimodal de contexto largo) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización hVQ presenta mayor perplejidad que la VQ vanilla (12,703 frente a 9,526) y mayor NLL (2,5418 frente a 2,2540), aunque menor KL y mayor acuerdo top-1; el intervalo emparejado del NLL está por encima de cero, lo que indica una pérdida de fidelidad medible en esa métrica.
- Las mediciones de fidelidad son teacher-forced sobre un corpus concreto (34 secuencias, 24.724 posiciones); no equivalen a evaluaciones de capacidad en benchmarks estándar.
- El recuento de parámetros de safetensors (634.388.480) no concilia con el payload de ~94,5 GB del GGUF; conviene tratar ese dato con cautela.
- Idiomas soportados no disponibles; solo se verifica coreano en las pruebas HTTP. Riesgo de comportamiento degradado en idiomas no evaluados.
- Riesgo de alucinación inherente a modelos generativos; no se documentan evaluaciones específicas de factualidad.
- Licencia swift-open-license-1.0 (etiquetada "other"): deben revisarse los términos del archivo LICENSE antes de uso comercial; no se detallan restricciones en la información disponible.
- Dependencia del runtime ds4-dfm-rs y del loader ds4: ambos builds (vanilla y hVQ) pasaron el loader, pero no se documenta compatibilidad con otros runtimes.
- El despliegue requiere hardware de gama alta (DGX Spark GB10 verificada); no hay evidencia de que quepa en GPU de consumo.
- La model card está parcialmente truncada en la sección de velocidad (valores de decode antes/después incompletos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Baekpica/Swift1.5-GLM-5.3-Flash-VQ-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift1.5-GLM-5.3-Flash
- Conversión GLM previa (estudio de sensibilidad por capas): https://huggingface.co/Baekpica/GLM-5.3-Flash-VQ-GGUF
- Registro de calibración: calibration-summary.json (en el repositorio del modelo)
- Receta de conversión: recipe.json (en el repositorio del modelo)
- Resultados por caso: evaluation.json (en el repositorio del modelo)
- Build y servicio: RUNTIME.md (en el repositorio del modelo)
- Sumas de verificación: SHA256SUMS (en el repositorio del modelo)
- Gráfica de velocidad: assets/sage-hvq-spark-64k.png (en el repositorio del modelo)
