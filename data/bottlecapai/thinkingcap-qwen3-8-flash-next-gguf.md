# bottlecapai/ThinkingCap-Qwen3.8-Flash-Next-GGUF

## Resumen

ThinkingCap-Qwen3.8-Flash-Next-GGUF es la colección de cuantizaciones en formato GGUF del modelo ThinkingCap-Qwen3.8-Flash-Next, un ajuste fino (finetune) desarrollado por BottleCap AI sobre el modelo base Qwen3.8-Flash-Next de Qwen. El objetivo declarado del ajuste es preservar la calidad de respuesta del modelo base reduciendo de forma sustancial el número de tokens de razonamiento (thinking tokens) que el modelo genera antes de responder. Esta versión GGUF está pensada para ejecución local con llama.cpp y runtimes compatibles como Ollama o LM Studio.

El modelo es multimodal (pipeline image-text-to-text) y cuenta con 179.551.050.368 parámetros totales según los pesos en safetensors del modelo base. El repositorio GGUF ocupa 848,6 GB e incluye múltiples niveles de cuantización, desde BF16 sin cuantizar hasta IQ4_XS de 4 bits, además de un proyector visual independiente (mmproj) en f16 para el procesamiento de imágenes.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un mismo paquete: razonamiento eficiente en tokens, capacidad de visión y despliegue local mediante GGUF con soporte de decodificación especulativa a través de la cabeza MTP del modelo. La licencia es la Qwen Community License 1.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con cabeza MTP (multi-token prediction); detalles internos de capas y atención no disponibles |
| Parametros totales | 179.551.050.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explícita; la evaluación usa hasta 253.952 tokens nuevos de generación |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M, IQ4_XS (y una variante externa RCO de 3,8 bpw) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (multiparte, 8 ficheros por cuantización) + mmproj f16 para visión |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que procesa texto e imágenes (pipeline image-text-to-text). Incorpora una cabeza MTP (multi-token prediction) que permite a llama.cpp ejecutar decodificación especulativa autoespeculativa, acelerando la generación. El modelo base es Qwen3.8-Flash-Next de Qwen, sobre el que BottleCap AI aplicó un finetune orientado a la eficiencia de tokens de razonamiento ("token-efficient", "efficient-thinking").

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada; la model card remite a la ficha del modelo principal para esos detalles. Las cuantizaciones de baja precisión se construyeron con una importance matrix (estadísticas de activación de un corpus de calibración) y overrides de precisión por tensor, tomados de unsloth/Qwen3.8-Flash-Next-GGUF.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable (esfuerzo por defecto `xhigh` en la plantilla de chat).
- Razonamiento matemático de competición (evaluado en AIME 2026).
- Comprensión de imágenes y respuesta sobre ellas (evaluado en RealWorldQA), mediante el proyector visual mmproj.
- Razonamiento eficiente en tokens: el finetune busca mantener la calidad del base con menos tokens de pensamiento.
- Decodificación especulativa mediante la cabeza MTP integrada en los GGUF.
- Conversación multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible de forma explícita en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Razonamiento matemático local: el modelo obtiene un 97,19% en AIME 2026 en BF16, por lo que puede emplearse para resolver problemas de competición o verificación de demostraciones en entornos sin conexión, con la ventaja de que las cuantizaciones de 4 y 6 bits no muestran degradación medible de precisión.
- Análisis de imágenes con preguntas en lenguaje natural: gracias al proyector visual f16 y a un rendimiento del 84,67% en RealWorldQA, es adecuado para tareas de inspección visual, descripción de escenas o extracción de información de capturas y fotografías.
- Despliegue en servidor único de gama alta: con Q4_K_M (113,2 GB) puede servirse en una GPU H200 con llama-server, lo que permite ofrecer razonamiento multimodal de alta calidad desde una sola máquina.
- Asistentes con presupuesto de tokens ajustado: al reducir los tokens de pensamiento manteniendo la calidad, encaja en productos donde el coste por inferencia o la latencia del razonamiento son críticos.
- Prototipado e investigación en local: las variantes IQ4_XS (95,5 GB) y la RCO de 3,8 bpw (85,6 GB, 56,5 GB de VRAM) permiten experimentar con un modelo de 179B en hardware más modesto que el BF16.
- Evaluación comparativa de cuantizaciones: los datos publicados de AIME 2026 y RealWorldQA por cuantización permiten reproducir y auditar el impacto de la cuantización en un pipeline propio con llama.cpp.
- Servicio con decodificación especulativa: la cabeza MTP permite acelerar la generación en llama.cpp, útil para aplicaciones interactivas donde el throughput importa.

## Benchmarks y rendimiento

Datos publicados en la model card, comparando cada cuantización con BF16 servido por vLLM (thinking en `xhigh`, temperatura 1.0, top-p 0.95, top-k 20, hasta 253.952 tokens nuevos). AIME 2026: 30 problemas, 8 ejecuciones por cuantización y 32 para BF16. RealWorldQA: 765 preguntas de imagen, 2 ejecuciones por cuantización y 8 para BF16.

| Cuantizacion | AIME 2026 | Cambio vs BF16 | Tokens de thinking | RealWorldQA | Cambio vs BF16 | Tokens de thinking |
|---|---|---|---|---|---|---|
| BF16 (vLLM) | 97,19% | — | — | 84,67% | — | — |
| IQ4_XS | 97,50% | +0,31 pp [−1,25, +1,77] | +9,7% [+1,6, +23,0] | 84,51% | −0,16 pp [−1,23, +0,87] | −4,5% [−14,1, +5,6] |
| Q4_K_M | 97,08% | −0,10 pp [−1,98, +1,87] | +9,6% [+1,3, +22,2] | 85,69% | +1,01 pp [−0,13, +2,16] | +5,6% [−4,6, +16,3] |
| Q6_K | 96,25% | −0,94 pp [−2,92, +0,83] | +10,2% [+0,5, +17,8] | 84,84% | +0,16 pp [−0,95, +1,27] | +17,0% [+2,0, +33,8] |
| Q8_0 | 96,25% | −0,94 pp [−3,85, +1,56] | +6,6% [−4,3, +14,3] | 85,23% | +0,56 pp [−0,54, +1,62] | +2,9% [−9,2, +15,7] |

Ninguna cuantización difiere de forma medible de BF16 en precisión en ninguno de los dos benchmarks. En AIME, las cuantizaciones por debajo de Q8_0 usaron aproximadamente un 10% más de tokens de pensamiento que BF16; no se determinó si ese exceso proviene de la cuantización o de llama.cpp. En RealWorldQA la respuesta mediana piensa entre 113 y 126 tokens en todas las cuantizaciones (115 en BF16).

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere unos 359,2 GB de pesos; Q8_0 unos 191,0 GB; Q6_K unos 171,9 GB; Q4_K_M unos 113,2 GB; IQ4_XS unos 95,5 GB. La variante RCO de 3,8 bpw ocupa 56,5 GB de VRAM en pesos (frente a 66,1 GB de IQ4_XS).
- GPU recomendadas: la model card valida el funcionamiento en una NVIDIA H200 (dos para Q8_0 en AIME) con llama-server y caché KV en q8_0. Para BF16 se necesitan múltiples aceleradores de gama alta o un nodo multi-GPU.
- ¿Cabe en GPU de consumo? No para las cuantizaciones principales: incluso IQ4_XS supera los 95 GB. Solo la variante RCO de 3,8 bpw (56,5 GB en pesos) se acerca a configuraciones multi-GPU de consumo, aunque no se confirma que quepa en una sola GPU de consumo.
- Despliegue: llama.cpp (llama-cli, llama-server), Ollama y LM Studio por compatibilidad con GGUF; vLLM se menciona como referencia para BF16. Se recomienda usar el proyector visual mmproj para tareas de imagen.
- Latencia y throughput: no disponibles de forma numérica. La cabeza MTP habilita decodificación especulativa en llama.cpp, lo que reduce la latencia de generación, pero no se publican cifras de tokens por segundo.
- Nota de ejecución: la decodificación greedy puede entrar en bucles; debe mantenerse la temperatura recomendada en la ficha del modelo principal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-Flash-Next (este) | 179,55B | no disponible | Si (imagen-texto) | qwen-community-license-1.0 | GGUF, safetensors (base) |
| Qwen3.8-Flash-Next (base) | no disponible en esta ficha | no disponible | Si (imagen-texto) | qwen-community-license-1.0 | safetensors |
| ThinkingCap-Qwen3.8-Flash-Next-GGUF-RCO-3.8bpw | 179,55B (mismo base) | no disponible | Si | qwen-community-license-1.0 | GGUF (3,8 bpw) |

Las alternativas de otros fabricantes no están disponibles en la información proporcionada; no se dispone de datos de rendimiento de modelos comparables de terceros.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no se documenta de forma específica; como modelo de razonamiento y generación, es susceptible de alucinar, especialmente en tareas abiertas.
- Decodificación greedy: puede entrar en bucles; es necesario respetar los parámetros de muestreo recomendados (temperatura 1.0, top-p 0.95, top-k 20).
- Coste de hardware: incluso las cuantizaciones de 4 bits superan los 95 GB, lo que excluye el despliegue en GPU de consumo convencionales.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad multilingüe.
- Licencia: Qwen Community License 1.0, con posibles restricciones para uso comercial; es necesario revisar el texto de la licencia antes de un despliegue en producción.
- Cuantización: aunque no se observan diferencias medibles de precisión, las cuantizaciones por debajo de Q8_0 generaron aproximadamente un 10% más de tokens de pensamiento en AIME; el origen (cuantización o llama.cpp) no se determinó.
- Contexto: la longitud de contexto no se declara explícitamente; la evaluación usa hasta 253.952 tokens nuevos, pero no debe confundirse con la ventana de contexto del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next-GGUF
- Modelo base (finetune): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizaciones de referencia (importance matrix y overrides): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Variante RCO de 3,8 bpw: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next-GGUF-RCO-3.8bpw
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Especificación GGUF: https://github.com/ggml-org/ggml/blob/master/docs/gguf.md
- Sitio del autor: https://www.bottlecapai.com/
