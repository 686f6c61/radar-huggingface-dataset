# OnlyTextLLMs/Qwen3.5-2B-OnlyText-GGUF

## Resumen

Qwen3.5-2B-OnlyText-GGUF es una distribución cuantizada en formato GGUF del modelo OnlyTextLLMs/Qwen3.5-2B-OnlyText, que a su vez es un derivado text-only de Qwen/Qwen3.5-2B. El repositorio lo publica el usuario OnlyTextLLMs y no introduce entrenamiento adicional: se limita a eliminar los tokens de visión y audio del tokenizador original y a convertir los pesos a GGUF con distintas cuantizaciones.

El modelo tiene 1.942.616.384 parámetros totales (aproximadamente 1,94 mil millones), arquitectura Qwen3_5ForCausalLM de 24 capas y dimensión oculta 2048, con un vocabulario de 248.302 entradas. Su rasgo diferencial es que incluye la cabeza de borrador MTP (multi-token prediction) embebida en el propio archivo, de modo que la decodificación especulativa puede activarse sin un archivo de draft separado.

Es relevante para quien necesite un modelo pequeño, de licencia Apache-2.0, ejecutable en GPU de consumo o en equipos con aceleración integrada, y que quiera medir el impacto real del MTP en llama.cpp. La contrapartida es que está limitado a texto y a inglés, y que no se han publicado benchmarks académicos, solo mediciones de velocidad y perplejidad del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer decoder denso), arquitectura GGUF `qwen35`, 24 capas, hidden size 2048 |
| Parametros totales | 1.942.616.384 |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; las pruebas del autor se ejecutaron con `-c 32768` |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 (los tres en GGUF) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF; el modelo base esta en safetensors |
| Modelo base | Qwen/Qwen3.5-2B |
| Derivado de | OnlyTextLLMs/Qwen3.5-2B-OnlyText |
| Vocabulario | 248.302 entradas; 15 tokens especiales solo-texto en los ids 248044-248058 |
| Token EOS | 248046 (`<|im_end|>`) |
| Tamano del repositorio | 5,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder denso de tipo causal, identificado en el convertidor como `Qwen3_5ForCausalLM` y con arquitectura GGUF `qwen35`. La configuración declarada es de 24 capas y dimensión oculta 2048, con un vocabulario de 248.302 tokens. La innovación técnica del repositorio no está en los pesos, sino en el empaquetado: el convertidor incluye por defecto los tensores MTP (`nextn_predict_layers = 1`), de manera que la cabeza de predicción multi-token queda embebida en el mismo archivo GGUF y la decodificación especulativa puede invocarse con `--spec-type draft-mtp`, sin necesidad de cargar un modelo borrador aparte.

No hay entrenamiento adicional. La model card indica explícitamente que los pesos son un derivado sin modificar y que el repositorio solo elimina modalidades y cuantiza. La conversión se realizó con `convert_hf_to_gguf.py` de llama.cpp en el commit `f280b26983ad`, seguida de `llama-quantize` con el tipo nombrado de cada archivo. Respecto a los datos de entrenamiento (número de tokens, composición del dataset, fases de RLHF o DPO), no hay información disponible en el material proporcionado: habría que consultar la ficha del modelo base Qwen/Qwen3.5-2B. La plantilla de chat conserva el modo de razonamiento activado por defecto con `reasoning_effort: xhigh`, desactivable mediante `--reasoning off` en llama-cli o `"chat_template_kwargs": {"enable_thinking": false}` en la API del servidor.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantilla de chat.
- Razonamiento explícito mediante modo thinking activado por defecto (`reasoning_effort: xhigh`), que produce cadenas de razonamiento extensas antes de la respuesta final.
- Modo de respuesta directa sin razonamiento, activable por parámetro, orientado a baja latencia.
- Inferencia compatible con servidor OpenAI-compatible (`llama-server`), lo que permite integrarlo como backend de chat.
- Decodificación especulativa con la cabeza MTP embebida, con ganancias medidas de hasta el 10 % en velocidad de generación según cuantización.
- Compatibilidad declarada con endpoints de HuggingFace para text-generation (etiqueta `endpoints_compatible`).
- Procesamiento de secuencias largas en la práctica: las pruebas se ejecutaron con ventana de 32.768 tokens y `flash attention` activada.
- Soporte multimodality: no. El modelo es exclusivamente de texto; los tokens de visión y audio fueron eliminados del tokenizador.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o multi-step reasoning orquestado: no disponibles como característica declarada; el multi-step se limita al razonamiento interno del modo thinking.
- Capacidades multilingües: no, solo inglés declarado.

## Casos de uso

- Asistente conversacional local en GPU de consumo: con el cuantizado Q4_K_M (1,3 GB) el modelo cabe en tarjetas de 6-8 GB, dejando VRAM libre para contexto, y puede servirse vía `llama-server` como API compatible con OpenAI para un chatbot interno en inglés.
- Generación de texto en equipos sin GPU dedicada: al ser GGUF, puede ejecutarse en CPU o con aceleración integrada (el autor menciona Ryzen AI Max / Strix Halo con `--spec-draft-n-max 4`), lo que lo hace adecuado para procesado por lotes de documentos en portátiles o mini-PC.
- Evaluación y ajuste de decodificación especulativa: es un banco de pruebas directo para medir el impacto del MTP en llama.cpp, comparando configuraciones de `--spec-draft-n-max` y cuantizaciones con la tabla de velocidades publicada.
- Prototipado rápido de aplicaciones de chat antes de escalar a un modelo mayor: permite validar prompts, plantillas y flujos de integración con un coste de hardware mínimo, teniendo en cuenta que el comportamiento final puede diferir.
- Generación de resúmenes y reescritura de documentación técnica en inglés: el modo de respuesta directa (thinking desactivado) reduce latencia y consumo de tokens, adecuado para pipelines de transformación de texto de alto volumen.
- Anotación sintética y aumento de datos: al ser Apache-2.0 y ejecutable en local, puede usarse para etiquetar o parafrasear corpus en inglés sin enviar datos a servicios externos, siempre que se revise la calidad de la salida por tratarse de un modelo de 2B.
- Despliegue en arquitecturas de doble GPU: llama.cpp reparte capas automáticamente (`--split-mode layer` es el valor por defecto), lo que permite distribuirlo en dos aceleradores modestos en lugar de uno grande.
- Demostraciones educativas de inferencia cuantizada: las tres cuantizaciones con perplejidad medida sobre wikitext-2 permiten ilustrar de forma tangible el compromiso entre tamaño de archivo, calidad (12,25 frente a 11,28 de PPL) y velocidad.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones propias del autor, realizadas el 22 de septiembre de 2026 sobre una única AMD Radeon AI PRO R9700 (gfx1201, 34 GB) con llama.cpp `f280b26983ad` (build HIP/ROCm, ROCm 7.14, `-c 32768 -fa on`). La línea base es llama-bench PP512 + TG128/256; las cifras MTP corresponden a llama-cli en chat de un solo turno, con thinking desactivado y 256 tokens generados. No se citan líneas base publicadas para este tamaño.

| Cuantizacion | Dispositivo | Prefill t/s (PP512) | Generacion t/s sin MTP | Generacion t/s mejor MTP | Delta MTP |
|---|---|---|---|---|---|
| Q4_K_M | 1x R9700 | 7230 | 143,6 | 157,1 (MTP n=2) | +9 % |
| Q6_K | 1x R9700 | 5434 | 147,7 | 143,8 (MTP n=2) | -3 % |
| Q8_0 | 1x R9700 | 10187 | 142,8 | 157,2 (MTP n=2) | +10 % |

Perplejidad sobre wikitext-2 en una sola GPU:

| Cuantizacion | Perplejidad |
|---|---|
| Q4_K_M | 12,2515 |
| Q6_K | 11,5519 |
| Q8_0 | 11,2841 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks académicos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para Q4_K_M, 1,6 GB para Q6_K y 2,1 GB para Q8_0, más el consumo del contexto KV cache (con 32.768 tokens y `flash attention` el requisito crece de forma apreciable).
- GPU de referencia usada en las mediciones: AMD Radeon AI PRO R9700 con 34 GB, sobre ROCm 7.14 y build HIP de llama.cpp.
- Cabe en GPU de consumo: sí. Con Q4_K_M debería ser viable en tarjetas de 6-8 GB (RTX 3060, RTX 4060, RTX 2070 y similares) dejando margen para el contexto; con Q8_0 sigue cabiendo en 8-12 GB.
- Aceleración integrada: el autor menciona Ryzen AI Max / Strix Halo como plataforma válida para MTP, con `--spec-draft-n-max 4`.
- Opciones de despliegue: llama-server con API compatible con OpenAI y llama-cli, ambos de llama.cpp. Se requieren builds posteriores al 16 de mayo de 2026 (commit `4f13cb7` o superior) para disponer de soporte MTP. Otros runtimes que consumen GGUF no están confirmados en la información disponible.
- Multi-GPU: llama.cpp reparte capas automáticamente al desactivar los pines de variables `*_VISIBLE_DEVICES`.
- Latencia y throughput: en la R9700, entre 143 y 157 tokens/s de generación y entre 5.434 y 10.187 tokens/s de prefill (PP512), según cuantización. No hay mediciones propias para otras GPU ni para CPU.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas oficiales con otros modelos, y no se han publicado benchmarks académicos del modelo, por lo que la comparación de rendimiento no está disponible. La tabla siguiente recoge únicamente las alternativas de tamaño comparable en la misma categoría, con sus datos públicos más habituales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-2B-OnlyText-GGUF (este modelo) | 1,94 B | No disponible | Apache-2.0 | GGUF en HuggingFace; requiere llama.cpp reciente para MTP |
| Qwen/Qwen3.5-2B (base) | No disponible en la informacion | No disponible | Apache-2.0 | Peso completo en safetensors |
| OnlyTextLLMs/Qwen3.5-2B-OnlyText | 1,94 B | No disponible | Apache-2.0 | Derivado text-only en safetensors |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache-2.0 | Muy extendido en GGUF y runtimes |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Amplia disponibilidad en GGUF |
| Gemma-2-2B-it | 2,61 B | 8.192 tokens | Gemma Terms of Use | Amplia disponibilidad en GGUF |

Comparativa de rendimiento: no disponible. No se han publicado resultados de benchmarks de este modelo frente a las alternativas anteriores.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado. No hay soporte multilingüe confirmado, por lo que su uso en castellano no está respaldado por la model card.
- Modalidad: exclusivamente texto. Los tokens de visión y audio se eliminaron del tokenizador, de modo que cualquier capacidad multimodal del base se ha perdido de forma deliberada.
- Sin entrenamiento adicional: al ser un derivado directo, hereda íntegramente los sesgos, los puntos fuertes y las carencias del modelo base Qwen/Qwen3.5-2B, y no incorpora ninguna corrección posterior.
- Alucinación: por su tamaño (1,94 B de parámetros) cabe esperar una tasa de alucinación superior a la de modelos de mayor escala, especialmente en tareas factuales. No hay datos de evaluación que la cuantifiquen.
- Calidad degradada por cuantización: la perplejidad medida sobre wikitext-2 pasa de 11,2841 en Q8_0 a 12,2515 en Q4_K_M, una degradación notable que conviene tener en cuenta antes de elegir el cuantizado más pequeño.
- Modo thinking activado por defecto: la plantilla usa `reasoning_effort: xhigh`, lo que incrementa de forma significativa el consumo de tokens y la latencia si no se desactiva explícitamente. El autor recomienda desactivarlo para respuestas rápidas.
- Dependencia de versión: el uso de MTP exige una build de llama.cpp posterior al 16 de mayo de 2026 (commit `4f13cb7` o superior). En builds anteriores la cabeza de borrador no se aprovecha.
- MTP no siempre aporta: en Q6_K el delta medido fue negativo (-3 %), es decir, la decodificación especulativa puede perjudicar el rendimiento según la cuantización y el hardware.
- Medición limitada: todas las cifras provienen de una única GPU AMD R9700 con ROCm y de un único build de llama.cpp. No son extrapolables a NVIDIA, CPU u otras configuraciones.
- Longitud de contexto desconocida: la model card no declara el contexto máximo del modelo; los 32.768 tokens de las pruebas son una configuración de ejecución, no una especificación del modelo.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad ni informes independientes de calidad.
- Licencia: Apache-2.0 permite uso comercial, pero la model card exige atribuir los pesos y capacidades subyacentes al equipo de Qwen. Conviene conservar el aviso de atribución y verificar los términos del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/OnlyTextLLMs/Qwen3.5-2B-OnlyText-GGUF
- Modelo de origen (text-only): https://huggingface.co/OnlyTextLLMs/Qwen3.5-2B-OnlyText
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Organización Qwen: https://huggingface.co/Qwen
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp: referencia al commit `f280b26983ad` usado en la conversión y al commit `4f13cb7` como mínimo para soporte MTP; no se proporciona URL directa en la información disponible.

Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces listados proceden de la ficha de HuggingFace y de la model card.
