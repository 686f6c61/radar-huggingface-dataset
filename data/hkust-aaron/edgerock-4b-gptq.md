# hkust-aaron/EdgeRock-4B-GPTQ

## Resumen

EdgeRock-4B-GPTQ es la versión cuantizada a 4 bits (GPTQ, W4A16) de EdgeRock-4B, el primer modelo abierto de Rock Matrix. El modelo base combina estado recurrente, atención de ventana deslizante y Rock Memory Anchors (RMA) para retener información distante dentro de un historial persistente de tamaño constante; este paquete conserva esa arquitectura y sus capacidades de memoria (ventana local de 1024 tokens, 1024 anclas por grupo KV y fronteras de commit de 256 tokens). El resultado es un modelo de razonamiento con huella de memoria fija, pensado para despliegue en el borde y para servir muchas peticiones concurrentes en GPU.

El checkpoint contiene 4.578.061.568 parámetros (aproximadamente 4,58 mil millones) y ocupa 3,4 GB en el repositorio, frente a los pesos BF16 del modelo original. La cuantización aplica GPTQ secuencial basado en Hessiano con damping del 1% y tamaño de bloque 128 sobre las 256 matrices lineales grandes del backbone y de RMA; cabeceras de embedding/salida, redes de admisión, compuertas recurrentes pequeñas y parámetros de normalización mantienen su precisión original.

La relevancia de esta release es de ingeniería: incluye un runtime INT4 empaquetado en Triton que decodifica cada tile bajo demanda en lugar de expandir el checkpoint completo a BF16 en memoria, con activaciones BF16 y acumulación FP32. Es un modelo publicado muy recientemente (19 de octubre de 2026) sin descargas ni valoraciones todavía, y su licencia no es estándar, por lo que conviene evaluar ambos aspectos antes de adoptarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con estado recurrente, atención de ventana deslizante y Rock Memory Anchors (RMA); historial persistente de tamaño constante |
| Parámetros totales | 4.578.061.568 (≈4,58 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como cifra única; la arquitectura fija ventana local de 1024 tokens, 1024 anclas por grupo KV y fronteras de commit de 256 tokens |
| Tipos de cuantización | GPTQ INT4 con activaciones BF16 (W4A16), group size 128, zero point simétrico de 8, escalas FP32; existe una release hermana en FP8 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | EdgeRock Model License 1.0 (pesos); código bajo Apache-2.0 |
| Formato de pesos | safetensors con layout GPTQ v1 (qweight / qzeros / scales / g_idx), sin reordenamiento de activaciones; requiere `trust_remote_code=True` y el cargador `packed_int4` incluido |

Otros datos del paquete: algoritmo de cuantización GPTQ secuencial basado en Hessiano, damping 1%, block size 128; 256 matrices lineales cuantizadas; calibración con el split de entrenamiento de WikiText-2 (128 secuencias de 512 tokens); runtime verificado en Linux sobre GPU NVIDIA Hopper; entradas de texto (el frontend visual del modelo original permanece en el proyecto fuente).

## Arquitectura y entrenamiento

El modelo base EdgeRock-4B, según la documentación pública, es un modelo de razonamiento textual y visual con una arquitectura que combina tres mecanismos: estado recurrente, atención de ventana deslizante de 1024 tokens y Rock Memory Anchors, que permiten retener información distante seleccionada dentro de un historial persistente de tamaño constante. Las fronteras de commit de 256 tokens definen cuándo se actualiza ese estado de memoria. El efecto práctico es que el coste de memoria del historial no crece con la longitud de la conversación, lo que deja más VRAM libre para razonamiento sostenido y servir peticiones concurrentes. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

Esta release no reentrena el modelo: aplica cuantización GPTQ sobre el checkpoint `rockmatrix-ai/EdgeRock` (revisión `a6a53a5573f12df4a26eb67d3e990a3574f5edf0`). Solo se cuantizan las 256 matrices lineales grandes del backbone y de RMA; el resto de tensores (cabeceras de embedding y salida, redes de admisión, compuertas recurrentes pequeñas, normalizaciones) conservan la precisión del modelo fuente, y 290 tensores no cuantizados coinciden exactamente con el original. La innovación técnica del paquete es el runtime: las matrices lineales permanecen empaquetadas en VRAM durante la generación y el kernel Triton decodifica cada tile a medida que se usa, con activaciones BF16 y acumulación FP32 estándar, sin materializar el checkpoint completo en BF16.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat (`apply_chat_template`).
- Razonamiento multi-paso con memoria de largo alcance de capacidad constante: el estado persistente retiene información más allá de la ventana local de 1024 tokens mediante anclas RMA.
- Matemáticas y aritmética: la validación del paquete incluye comprobaciones aritméticas y el ejemplo de la model card resuelve un producto de dos cifras.
- Memoria de contexto prolongada: se ha verificado una actualización de memoria más allá de la ventana local.
- Generación determinista disponible (`do_sample=False`), útil para pipelines reproducibles.
- Capacidad visual (herencia del modelo base): el frontend visual sigue en el proyecto fuente; este paquete declarar entradas de texto.
- No se documentan en la información disponible soporte de tool calling, function calling ni comportamiento de agente; tampoco un modo "thinking" explícito.

## Casos de uso

- Asistentes conversacionales de larga duración: al mantener un historial persistente de tamaño constante, el modelo puede sostener sesiones extensas sin que el consumo de VRAM crezca con el número de turnos, algo crítico en dispositivos de borde y en servicios con muchas conversaciones simultáneas.
- Despliegue en el borde y en hardware modesto: con pesos INT4 de 3,4 GB y decodificación de tiles bajo demanda, es candidato para equipos con GPU de gama media o entornos embebidos donde un modelo de 4B en BF16 no cabría con holgura.
- Servicio concurrente en una sola GPU: la ventana local fija de 1024 tokens y las anclas de memoria acotadas reducen el coste por sesión, lo que permite aumentar el número de peticiones simultáneas en un servidor Hopper.
- Razonamiento aritmético y resolución de problemas paso a paso en inglés o chino: útil para asistentes educativos o herramientas internas de cálculo, con la cautela de que la cuantización introduce un error relativo máximo de 0,004673 en los kernels lineales.
- Procesamiento de documentos largos con memoria anclada: informes, actas o registros donde solo una parte de la información temprana debe retenerse, aprovechando las 1024 anclas por grupo KV y las fronteras de commit de 256 tokens.
- Evaluación e investigación sobre arquitecturas de memoria constante: el paquete incluye scripts de reproducción (`quantize.py`), calibración y procedencia, lo que lo hace útil para reproducir experimentos de cuantización sobre arquitecturas no estándar.
- Prototipado de pipelines con `transformers`: la integración es directa mediante el cargador incluido y `AutoTokenizer`, adecuada para pruebas de concepto antes de invertir en un motor de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este paquete cuantizado. La model card indica explícitamente que los resultados del modelo original están en el informe técnico, pero que esta release no ha sido evaluada sobre la suite completa de benchmarks.

Lo que sí se publica son comprobaciones de conversión y de runtime:

| Comprobación | Resultado |
|---|---|
| Comprobaciones funcionales de generación | 3/3 |
| Tensores no cuantizados idénticos al modelo fuente | 290 |
| Recarga en proceso nuevo, diferencia máxima de logits de prueba | 0 |
| Error relativo máximo del kernel lineal en las comprobaciones de conversión | 0,004673 |

No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: los pesos empaquetados ocupan 3,4 GB y permanecen en VRAM durante la generación; a ello se suman activaciones BF16 y el estado de memoria (ventana de 1024 tokens, 1024 anclas por grupo KV). Una estimación razonable es partir de 5-6 GB, aunque no se publica una cifra oficial de VRAM.
- GPU verificada: Linux con GPU NVIDIA Hopper (familia H100/H200) usando el runtime Triton suministrado. Es el único entorno declarado como verificado.
- GPU de consumo: por la huella de pesos, es plausible en tarjetas con 8 GB o más (por ejemplo, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4090), pero no hay validación publicada en estas GPU; el kernel Triton y el cargador personalizado condicionan la compatibilidad.
- Opciones de despliegue: cargador propio `packed_int4.load_int4` sobre `transformers` con `trust_remote_code=True`. La model card advierte que la carga mediante motores AWQ/GPTQ genéricos no ha sido validada, por lo que vLLM, TGI, llama.cpp u Ollama no están soportados de forma comprobada.
- Latencia y throughput: no disponibles. El diseño de decodificación de tiles bajo demanda implica trabajo adicional por multiplicación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdgeRock-4B-GPTQ (este) | 4,58 B | Ventana local 1024 + memoria constante (cifra total no disponible) | INT4 W4A16, group 128 | EdgeRock Model License 1.0 | Hugging Face, runtime propio |
| EdgeRock-4B (base) | 4,58 B | Igual que el anterior | BF16 | EdgeRock Model License 1.0 | Hugging Face |
| EdgeRock-4B-FP8 | 4,58 B | Igual que el anterior | FP8 | EdgeRock Model License 1.0 | Hugging Face |
| Otros modelos densos de ~4 B | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación relevante dentro de la información disponible es entre las tres variantes de la misma familia: misma arquitectura, mismos parámetros y misma licencia, diferenciándose en el formato numérico (BF16, FP8, INT4) y en el runtime necesario. No se han encontrado datos que permitan comparar con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o alineación en la información disponible.
- Alucinación: es un modelo de 4,58 B orientado a razonamiento; no se publican tasas de alucinación ni evaluaciones de fidelidad factual. La cuantización INT4 añade una fuente adicional de degradación (error relativo máximo de 0,004673 en los kernels lineales).
- Idiomas: cobertura declarada únicamente de inglés y chino; el rendimiento en castellano no está verificado.
- Contexto: el diseño de memoria constante no equivale a una ventana de atención completa; la información fuera de la ventana local de 1024 tokens solo se conserva si queda anclada, y la longitud de contexto total no se publica.
- Modalidad: aunque el modelo base soporta razonamiento sobre imagen, este paquete declara entradas de texto; el frontend visual permanece en el proyecto fuente y requeriría trabajo adicional.
- Licencia: los pesos usan la EdgeRock Model License 1.0 (etiquetada como "other"), no una licencia permisiva estándar. Es imprescindible revisar el archivo `LICENSE` antes de cualquier uso comercial; el código auxiliar sí es Apache-2.0.
- Ejecución de código remoto: el uso requiere `trust_remote_code=True` y cargar módulos Python del repositorio (`packed_int4`), lo que implica auditar el código antes de ejecutarlo en producción.
- Compatibilidad: solo se ha validado el runtime suministrado en Linux con GPU Hopper; no hay validación en motores de inferencia estándar ni en GPU de consumo.
- Madurez: el repositorio tiene 0 descargas y 0 valoraciones en el momento de la consulta, y la model card advierte de que el paquete cuantizado no se ha evaluado sobre la suite completa de benchmarks.
- Rendimiento no medido: no hay cifras publicadas de latencia, throughput ni coste por token para esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hkust-aaron/EdgeRock-4B-GPTQ
- Modelo base: https://huggingface.co/rockmatrix-ai/EdgeRock
- Revisión concreta del modelo base: https://huggingface.co/rockmatrix-ai/EdgeRock/tree/a6a53a5573f12df4a26eb67d3e990a3574f5edf0
- Colección de modelos y releases cuantizadas: https://huggingface.co/collections/hkust-aaron/edgerock-models-and-quantized-releases-6ad672506320a5546779b18c
- Variante FP8: https://huggingface.co/hkust-aaron/EdgeRock-4B-FP8
- Repositorio GitHub: https://github.com/rockmatrix-ai/EdgeRock
- Informe técnico (PDF): https://github.com/rockmatrix-ai/EdgeRock/blob/main/docs/report/EdgeRock_Technical_Report.pdf
- arXiv: https://arxiv.org/abs/2610.10118
- Página de modelos de Rock Matrix: https://rockmatrix.ai/models/
- Modelos con etiqueta edgerock en Hugging Face: https://huggingface.co/models?other=edgerock
- Servicio de API GenAI de HKUST (modelos soportados): https://itso.hkust.edu.hk/services/general-it-services/generative-ai-tools/hkust-genai-api-service/supported-models
