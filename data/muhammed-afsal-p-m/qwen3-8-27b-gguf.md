# muhammed-afsal-p-m/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una colección de cuantizaciones GGUF del modelo base Qwen/Qwen3.8-27B, publicada por el usuario muhammed-afsal-p-m. El modelo original es un transformer multimodal de 27.320.697.856 parámetros (27,3 mil millones) desarrollado por el equipo Qwen (Alibaba), capaz de procesar texto e imágenes (pipeline image-text-to-text) y con soporte de modo de razonamiento (thinking), tool calling y conversación multilingüe. Esta ficha se centra en la versión cuantizada, que es la que se distribuye en este repositorio.

La relevancia de este repositorio reside en que ofrece cuantizaciones medidas y probadas funcionalmente contra el modelo BF16 original, con métricas de perplejidad, divergencia KL y tasa de coincidencia del token más probable para cada archivo. Esto permite elegir el tamaño de cuantización según el presupuesto de VRAM disponible sin renunciar a la calidad de forma inadvertida. El repositorio ocupa 131,3 GB e incluye siete cuantizaciones (Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_M) más un proyector multimodal (mmproj) en F16.

El modelo está pensado para despliegue local en llama.cpp y aplicaciones compatibles, con licencia Apache 2.0. Su combinación de 27,3 mil millones de parámetros, visión y modo thinking lo sitúa en la categoría de modelos multimodales de tamaño medio, aptos para GPUs de consumo de gama alta (16-32 GB) y estaciones de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con componentes SSM (tensores `attn_qkv_gate`, `ssm_beta_alpha`); detalles completos no disponibles |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos de ejecución usan `-c 16384`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_M; proyector multimodal en F16 |
| Idiomas soportados | en, zh, hi, ml, ta, te, bn, ar, fr, de, es, pt, ru, ja, ko, vi, id, th, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal GGUF F16 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal que, según los nombres de tensores mencionados en la model card (`attn_qkv_gate`, `ssm_beta_alpha`), incorpora componentes de tipo SSM (state space model) junto con atención, lo que sugiere una arquitectura híbrida. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La innovación principal de este repositorio es el proceso de cuantización: la importance matrix se calculó sobre la cuantización Q8_0 (divergencia KL media de 0,0007 frente a BF16) usando 164.000 tokens de chat, código, matemáticas, trazas de razonamiento en modo thinking y texto multilingüe, renderizados con la plantilla de chat del propio modelo. Cada archivo se midió contra el BF16 original (perplejidad 6,4334) mediante divergencia KL, perplejidad y tasa de coincidencia del token más probable, y se probó funcionalmente (thinking on/off, tool calling, visión) además de con 46 preguntas calificadas por archivo en razonamiento, matemáticas, código, SQL, preguntas sobre imágenes, malayalam e hindi.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento explícito en modo thinking, con esfuerzo de razonamiento configurable (`xhigh`, `medium`, `low`) y posibilidad de desactivarlo.
- Entrada de imágenes (visión multimodal) mediante el proyector `mmproj-Qwen3.8-27B-F16.gguf`, compatible con todas las cuantizaciones.
- Tool calling / function calling, verificado funcionalmente en cada archivo.
- Capacidades multilingües en 19 idiomas, con evaluación específica de precisión en malayalam, hindi y código Python frente a BF16.
- Razonamiento multi-paso y matemáticas (evaluado con preguntas calificadas de razonamiento y matemáticas).
- Generación de código y SQL (incluido en las pruebas funcionales y en el conjunto de evaluación).
- Compatibilidad con API compatible con OpenAI a través de `llama-server`.

## Casos de uso

- Asistente conversacional local con privacidad de datos: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 16K tokens (configurable) en llama.cpp, sin enviar datos a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Análisis de documentos con imágenes: gracias al proyector multimodal, se pueden procesar capturas, diagramas o formularios escaneados junto con texto, por ejemplo para extracción de datos de facturas o tickets.
- Generación de código en pipelines de desarrollo: el soporte de tool calling y la evaluación en Python permiten integrarlo en asistentes de código o agentes que consultan APIs y ejecutan funciones.
- Razonamiento matemático y resolución de problemas paso a paso: el modo thinking con esfuerzo configurable permite ajustar la profundidad de razonamiento según la latencia aceptable, útil en tutoría o verificación de cálculos.
- Atención al cliente multilingüe: con soporte de 19 idiomas y evaluación específica en malayalam e hindi, es adecuado para mercados con diversidad lingüística, desplegado en servidores con GPU de 16-32 GB.
- Agentes autónomos multi-paso: la combinación de tool calling, visión y razonamiento permite construir agentes que inspeccionan imágenes, llaman a herramientas y planifican acciones, con cuantizaciones IQ3_M o IQ4_XS para GPUs de 12-16 GB.
- Despliegue en estaciones de trabajo con una sola GPU: la cuantización Q4_K_M (17 GB) o IQ4_XS (15,5 GB) permite ejecutar el modelo completo en GPUs de consumo de gama alta con contexto de 8K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona métricas de fidelidad de la cuantización frente al BF16 original (perplejidad 6,4334):

| Archivo | Tipo | Tamano | Bits/peso | VRAM aprox. | PPL | KLD media | Coincidencia top token | Velocidad (tok/s, RTX 6000 Ada) |
|---|---|---|---|---|---|---|---|---|
| Q8_0 | Q8_0 | 29,1 GB | 8,50 | ~32 GB | 6,4399 | 0,0007 | 98,86% | 27,7 |
| Q6_K | Q6_K | 22,4 GB | 6,57 | ~25 GB | 6,4312 | 0,0020 | 97,91% | 35,5 |
| Q5_K_M | Q5_K_M | 19,6 GB | 5,75 | ~23 GB | 6,4544 | 0,0041 | 97,10% | 39,6 |
| Q4_K_M | Q4_K_M | 17,0 GB | 4,98 | ~20 GB | 6,4644 | 0,0121 | 95,09% | 43,7 |
| IQ4_XS | IQ4_XS | 15,5 GB | 4,55 | ~18 GB | 6,5045 | 0,0164 | 94,66% | 46,9 |
| Q3_K_M | Q3_K_M | 13,7 GB | 4,01 | ~17 GB | 6,6493 | 0,0468 | 90,81% | 48,6 |
| IQ3_M | IQ3_M | 13,0 GB | 3,80 | ~16 GB | 6,7204 | 0,0563 | 90,33% | 50,2 |

La incertidumbre de la medición de perplejidad es de aproximadamente ±0,08, por lo que diferencias menores (por ejemplo, Q6_K frente a BF16) no son significativas. Las pruebas funcionales (thinking on/off, tool call, visión) pasaron en todos los archivos.

## Requisitos de hardware

- VRAM estimada: desde ~16 GB (IQ3_M) hasta ~32 GB (Q8_0), incluyendo modelo, proyector de visión y contexto de ~8K tokens; contextos más largos requieren más memoria.
- GPU recomendadas: RTX 6000 Ada (usada en las mediciones de velocidad), RTX 3090/4090/5090 (24 GB) para Q6_K o Q5_K_M; GPUs de 20-24 GB para Q4_K_M; GPUs de 16 GB para IQ4_XS o Q3_K_M; GPUs de 12 GB para IQ3_M.
- Cabe en GPU de consumo: sí, desde 12 GB con IQ3_M, aunque con mayor pérdida de calidad; Q4_K_M es el equilibrio recomendado.
- Opciones de despliegue: llama.cpp (`llama-server`, build b12345 o superior), LM Studio y otras aplicaciones basadas en llama.cpp con runtime actualizado. Ollama 0.40.16 y anteriores no pueden cargar estos archivos (error `tensor 'blk.0.ssm_beta.weight' not found`); para Ollama se indica usar `qwen3.8:27b` de su propia librería.
- Latencia y throughput: velocidades de generación medidas en RTX 6000 Ada entre 27,7 tok/s (Q8_0) y 50,2 tok/s (IQ3_M), con temperatura 0.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa de rendimiento. A continuación se comparan únicamente los aspectos documentados de las cuantizaciones de este repositorio:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27,3 mil millones | no disponible | Apache 2.0 | safetensors (original) | Hugging Face (Qwen/Qwen3.8-27B) |
| Qwen3.8-27B-GGUF (este repo) | 27,3 mil millones | no disponible | Apache 2.0 | GGUF (7 cuantizaciones) | Hugging Face, llama.cpp |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La evaluación de precisión (perplejidad, KL) se realizó sobre texto de Wikipedia en inglés con contexto de 512 tokens; no se midieron por separado la calidad en matemáticas, contexto largo ni imágenes, y la precisión en malayalam queda truncada en la información disponible.
- Las pruebas funcionales son smoke tests (un prompt por característica) que confirman que la funcionalidad opera, no que la calidad sea buena.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no documentados en la información disponible.
- Compatibilidad limitada: requiere llama.cpp build b12345 o superior; Ollama 0.40.16 y anteriores fallan al cargar los tensores SSM combinados.
- El repositorio tiene un tamaño de 131,3 GB, lo que exige espacio en disco considerable si se descargan varias cuantizaciones.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen/Qwen3.8-27B y las obligaciones de atribución.
- El modo thinking está activado por defecto con esfuerzo `xhigh`, lo que incrementa la latencia y el consumo de tokens; conviene ajustarlo en producción.
- No se dispone de información sobre la longitud máxima de contexto del modelo base ni sobre su comportamiento en contextos muy largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/muhammed-afsal-p-m/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Código del pipeline de cuantización: https://github.com/muhammedafsalpm/qwen-gguf-quantization
- Proyector multimodal: https://huggingface.co/muhammed-afsal-p-m/Qwen3.8-27B-GGUF/blob/main/mmproj-Qwen3.8-27B-F16.gguf
