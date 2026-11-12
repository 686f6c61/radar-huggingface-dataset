# N-Mehdi/qwen3-vl-2b-receipts-gguf

## Resumen

qwen3-vl-2b-receipts-gguf es un ajuste fino del modelo vision-lenguaje Qwen3-VL-2B-Instruct, desarrollado por el usuario N-Mehdi, especializado en la extracción estructurada de datos de tickets de compra y facturas francesas en formato JSON. El modelo parte de la arquitectura transformer multimodal de Qwen3-VL (1.720.574.976 parámetros totales) y se ha adaptado mediante QLoRA sobre dos conjuntos de datos: CORD v2 (tickets) y un corpus sintético de facturas francesas. El resultado se distribuye en formato GGUF para inferencia en CPU con llama.cpp.

El problema que resuelve es concreto: convertir imágenes de documentos comerciales en JSON estructurado con campos como direcciones, importes, SIRET y números de IVA, sin necesidad de GPU. Esto lo hace relevante para pipelines de digitalización de facturas en entornos con hardware limitado, donde el coste de infraestructura GPU es prohibitivo y la latencia no es crítica.

La relevancia actual radica en su enfoque de despliegue: cuantizaciones Q8_0 y Q4_K_M que caben en menos de 2 GB de disco (más el proyector visual de 0,82 GB), con latencias medidas en un portátil de consumo (Intel Core i7-1365U) y una licencia Apache-2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (Qwen3-VL) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en la configuración de inferencia documentada |
| Tipos de cuantizacion | Q8_0, Q4_K_M (modelo de lenguaje); f16 (proyector visual) |
| Idiomas soportados | no disponible (entrenado con CORD v2 en inglés y facturas sintéticas en francés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp b12282) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-2B-Instruct: un transformer multimodal que combina un codificador visual con un modelo de lenguaje, capaz de procesar imágenes y texto de forma conjunta. Sobre esta base se aplicó un ajuste fino con QLoRA, cuyo adaptador se fusionó en el modelo base en precisión fp16 antes de la conversión a GGUF. La conversión se realizó con llama.cpp build b12282, generando un fichero de lenguaje cuantizado y un proyector visual (mmproj) en f16 que debe acompañar a cualquiera de las cuantizaciones.

Los datos de entrenamiento son dos conjuntos públicos: CORD v2 (naver-clova-ix/cord-v2, licencia CC BY 4.0), centrado en tickets de compra, y un corpus sintético de facturas francesas (N-Mehdi/french-invoices-synth, Apache-2.0). El autor declara explícitamente que no se utilizó ninguna factura real ni en entrenamiento ni en evaluación. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado.

La innovación técnica destacable no está en la arquitectura, sino en el pipeline de despliegue: cuantización agresiva (Q4_K_M reduce el modelo de lenguaje a 1,11 GB) manteniendo una tasa de JSON válido del 100 % en el conjunto de facturas, y una configuración de llama.cpp con control explícito del número de tokens visuales (`--image-min-tokens 64 --image-max-tokens 1024`), que limita el coste computacional del codificador visual en CPU.

## Capacidades

- Extracción de campos estructurados de tickets de compra (formato CORD) y facturas francesas, con salida en JSON.
- Generación de JSON válido en el 99-100 % de los casos según los conjuntos de prueba documentados.
- Procesamiento de imagen y texto de forma conjunta (image-text-to-text).
- Inferencia en CPU mediante llama.cpp, sin requerir GPU.
- Conversación multi-turno (tag `conversational` en el repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Reconocimiento de cadenas literales como direcciones, números SIRET y números de IVA, aunque con pérdida de exactitud en cuantizaciones bajas.
- Capacidades multilingües: no disponibles de forma explícita; el ajuste cubre documentos en inglés (CORD) y francés (facturas sintéticas).
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Digitalización de facturas francesas en pymes: el modelo convierte imágenes de facturas en JSON con campos como SIRET, IVA e importes, con un F1 de campo de 0,980 en Q8_0, adecuado para contabilidad automatizada sin infraestructura GPU.
- Procesamiento de tickets de compra para control de gastos: sobre CORD v2 alcanza un F1 de campo de 0,825 en Q8_0, suficiente para extraer líneas de producto, totales y fechas en flujos de reembolso o auditoría interna.
- Despliegue en entornos con hardware limitado: con 1,11 GB (Q4_K_M) más 0,82 GB de proyector visual, cabe en portátiles y servidores de oficina; la latencia medida en un i7-1365U es de 43 s de media por factura y 54 s por ticket, aceptable para procesamiento por lotes nocturno.
- Pipeline de archivado documental: la salida JSON válida en el 99-100 % de los casos permite indexar documentos en bases de datos sin pasos de reparación de formato, reduciendo la lógica de post-procesado.
- Validación cruzada de datos contables: la extracción de campos como SIRET y números de IVA permite contrastar facturas recibidas contra registros fiscales, usando Q8_0 para preservar la exactitud en cadenas largas.
- Prototipado e investigación en extracción de información multimodal: el repositorio incluye código, prompts y evaluación (github.com/N-Mehdi/receipt-vlm), lo que facilita reproducir los resultados y adaptar el pipeline a otros dominios documentales.
- Procesamiento en el borde (edge computing): al no requerir GPU, puede integrarse en dispositivos con CPU x86 para digitalizar documentos localmente, evitando el envío de imágenes a servicios en la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor: 100 documentos de prueba por conjunto, decodificación greedy. Exact match exige que todos los campos sean correctos; F1 es el micro F1 sobre pares (ruta de campo, valor). La referencia fp16 se ejecuta en transformers.

| Conjunto de prueba | Modelo | JSON válido | Exact match | F1 de campo |
|---|---|---|---|---|
| Facturas | referencia fp16 | 1,00 | 0,63 | 0,979 |
| | Q8_0 | 1,00 | 0,62 | 0,980 |
| | Q4_K_M | 1,00 | 0,50 | 0,969 |
| CORD | referencia fp16 | 0,99 | 0,35 | 0,832 |
| | Q8_0 | 0,99 | 0,35 | 0,825 |
| | Q4_K_M | 1,00 | 0,23 | 0,807 |

Latencia en CPU (batch size 1, 20 documentos por conjunto, Intel Core i7-1365U, 4 hilos para generación y 12 para procesamiento de prompt en llama.cpp; transformers en fp32 con 10 hilos):

| Conjunto de prueba | Modelo | Media | p50 | p95 | Tokens/s |
|---|---|---|---|---|---|
| Facturas | transformers fp32 | 180 s | 171 s | 249 s | 1,6 |
| | Q8_0 | 50 s | 49 s | 66 s | 6,0 |
| | Q4_K_M | 43 s | 43 s | 57 s | 6,8 |
| CORD | transformers fp32 | 100 s | 102 s | 146 s | 1,0 |
| | Q8_0 | 60 s | 73 s | 83 s | 1,8 |
| | Q4_K_M | 54 s | 66 s | 75 s | 2,0 |

No se truncó ninguna salida a 1024 tokens. El autor señala que Q4_K_M pierde exactitud principalmente en cadenas largas que deben copiarse literalmente (direcciones, SIRET y números de IVA). En CORD, el procesamiento de prompt domina la latencia: las fotos usan 838 tokens visuales de media (60 de 100 alcanzan el límite de 1024), y el codificador visual y el procesamiento de prompt están limitados por cómputo, por lo que no se aceleran con cuantización ni con más hilos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso documentado, ya que la inferencia es en CPU. En GPU, el modelo de lenguaje Q8_0 ocupa 1,83 GB y Q4_K_M 1,11 GB, más 0,82 GB del proyector visual f16.
- GPU recomendadas: no documentadas por el autor; por tamaño, cualquier GPU con al menos 3 GB de memoria libre podría alojar la configuración Q8_0 más proyector, aunque no se han publicado mediciones en GPU.
- Cabe en GPU de consumo: sí, por tamaño (menos de 3 GB en Q8_0 con proyector); no hay datos de rendimiento en GPU publicados.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj`; el autor documenta la build b12282. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Configuración documentada: `-c 4096 --image-min-tokens 64 --image-max-tokens 1024`, temperatura 0.
- Latencia y throughput en CPU: media de 43-60 s por documento en un i7-1365U, con 1,8-6,8 tokens/s según conjunto y cuantización (ver tabla de benchmarks).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| qwen3-vl-2b-receipts-gguf | 1,72 B | 4096 (config. documentada) | GGUF | Apache-2.0 | Extracción de tickets y facturas en CPU |
| Qwen/Qwen3-VL-2B-Instruct | 2 B (aprox., según nombre) | no disponible | safetensors y otros | Apache-2.0 (según base) | Modelo multimodal generalista |
| N-Mehdi/qwen3-vl-2b-receipts-lora | no disponible | no disponible | adaptador LoRA | Apache-2.0 | Adaptador de ajuste fino previo a la fusión |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que no es posible comparar rendimiento numérico con otras alternativas de extracción documental.

## Limitaciones y advertencias

- El ajuste está especializado en tickets CORD y facturas francesas sintéticas; su rendimiento en otros tipos de documento o en facturas reales no está validado.
- El exact match en CORD es bajo (0,35 en fp16 y Q8_0, 0,23 en Q4_K_M): aunque el F1 de campo es razonable, la probabilidad de que todos los campos de un ticket sean correctos es limitada.
- Q4_K_M degrada notablemente la exactitud en cadenas largas (direcciones, SIRET, números de IVA); para producción con requisitos de exactitud literal se recomienda Q8_0.
- La latencia en CPU es alta (decenas de segundos por documento); no es adecuado para aplicaciones interactivas en tiempo real sin GPU.
- El procesamiento de imágenes con muchos tokens visuales (hasta 1024) domina el coste en CORD y no se acelera con cuantización ni con más hilos.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni evaluación multilingüe más allá del inglés y el francés.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento CORD v2 tienen licencia CC BY 4.0, lo que puede requerir atribución en determinados contextos.
- El repositorio no tiene descargas ni likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse para integraciones que lo requieran.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/N-Mehdi/qwen3-vl-2b-receipts-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Adaptador LoRA: https://huggingface.co/N-Mehdi/qwen3-vl-2b-receipts-lora
- Código, prompts y evaluación: https://github.com/N-Mehdi/receipt-vlm
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Dataset de facturas francesas sintéticas: https://huggingface.co/datasets/N-Mehdi/french-invoices-synth
