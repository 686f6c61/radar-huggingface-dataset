# nace-ai/Qwen3.6-35B-A3B-GGUF-KQuant

## Resumen

Qwen3.6-35B-A3B-GGUF-KQuant es una cuantización GGUF del modelo Qwen/Qwen3.6-35B-A3B, publicada por nace-ai para su motor de inferencia local Kapitsa, orientado a equipos Apple Silicon. El paquete incluye cuatro niveles de cuantización (Q2_K, Q3_K_M, Q4_K_M y Q8_0), además del proyector de visión en bf16 y la matriz de importancia utilizada en el proceso de calibración. El modelo base es multimodal (pipeline image-text-to-text) y cuenta con 35.505.251.456 parámetros totales.

La aportación diferencial del repositorio no es el modelo en sí, sino la metodología de cuantización denominada KQuant: en GGUF se construye una matriz de importancia a partir de texto de calibración para ajustar las escalas por capa, y solo se publica un paquete si, midiendo, resulta más cercano al modelo original con el mismo tamaño y velocidad. Según la model card, en Q4_K_M esto se traduce en una divergencia KL de 0,031 frente a 0,048 de la cuantización plana, manteniendo idéntico tamaño de archivo (21,7 GB).

Es relevante para desarrolladores que necesitan ejecutar un modelo de 35B con capacidades de visión en hardware de consumo Apple Silicon sin renunciar a la fidelidad respecto al bf16. La licencia es Apache 2.0, heredada del modelo base, lo que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.6-35B-A3B; presumiblemente transformer MoE por la nomenclatura A3B, no confirmado en la informacion) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q8_0 (GGUF); bf16 para el proyector de vision |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. La nomenclatura "35B-A3B" del modelo base Qwen/Qwen3.6-35B-A3B sugiere un diseño de mezcla de expertos con aproximadamente 35B parámetros totales y 3B activos por token, pero este dato no está confirmado explícitamente en la información disponible. El pipeline declarado es image-text-to-text, lo que confirma capacidades multimodales con entrada de imagen y texto.

El proceso de cuantización sí está documentado: KQuant es la cuantización calibrada de Nace.AI. En GGUF construye una matriz de importancia a partir de texto de calibración (el repositorio incluye el archivo `imatrix.gguf` de 0,4 GB). Las variantes Q2_K, Q3_K_M y Q4_K_M se generaron con dicha matriz de importancia, mientras que Q8_0 se generó sin ella. La evaluación de calidad se realizó con 64 fragmentos de 512 tokens (wikitext-2, conversaciones GSM8K y HumanEval) comparando logits contra el GGUF en bf16, y con el conjunto de test completo de GSM8K (1.319 preguntas) a través de llama-server. No se documenta el entrenamiento del modelo base ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones (tag "conversational").
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text, con proyector de visión `mmproj-bf16.gguf`).
- Razonamiento matemático: evaluado en GSM8K con 0,958 de acierto en la variante Q4_K_M de este repositorio.
- Generación de código: incluido en el conjunto de calibración (HumanEval) y en las pruebas de velocidad con respuestas de código de 512 tokens.
- Decodificación especulativa mediante cabeza MTP (multi-token prediction) propia del archivo, usada en las mediciones de velocidad de la model card.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente multi-paso: no confirmadas en la información disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistencia conversacional local en Mac: el modelo puede ejecutarse con `kapitsa serve` sobre un archivo GGUF y exponer una página de chat y una API en `http://127.0.0.1:8000`, lo que permite desplegar un asistente privado sin conexión a servicios en la nube.
- Análisis de documentos con imágenes: al incluir el proyector de visión en bf16, permite tareas image-text-to-text como descripción de capturas, extracción de información de gráficos o respuesta a preguntas sobre figuras, todo en local.
- Razonamiento matemático y resolución de problemas: con un 0,958 en GSM8K en Q4_K_M, es adecuado para tutores automáticos o verificación de cálculos paso a paso en entornos educativos.
- Generación de código en estaciones de trabajo Apple Silicon: la model card mide 115,9 tok/s de escritura en un MacBook Pro M5 Pro de 48 GB con una respuesta de código de 512 tokens, lo que lo hace viable para autocompletado y generación de fragmentos en el editor.
- Prototipado e investigación con cuantizaciones de bajo peso: las variantes Q2_K (13,3 GB) y Q3_K_M (17,2 GB) permiten probar el modelo en equipos con menos memoria unificada, a costa de mayor divergencia respecto al bf16.
- Evaluación comparativa de técnicas de cuantización: la disponibilidad de la matriz de importancia y de las métricas KL, coincidencia de top token y GSM8K facilita reproducir experimentos sobre calibración de cuantizaciones en pipelines de investigación.
- Despliegue en pipelines con llama.cpp: la model card documenta el uso con llama-server (commit `0a94a3f2`), lo que permite integrar el modelo en servicios compatibles con la API de llama.cpp.

## Benchmarks y rendimiento

Datos publicados en la model card para Q4_K_M (ambos archivos de 21,7 GB), medidos contra el GGUF en bf16:

| Metrica | Q4_K_M plano | Q4_K_M de este repo |
|---|---:|---:|
| KL respecto a bf16 (menor es mejor) | 0,048 | 0,031 |
| Mismo token top que bf16 | 93,4% | 94,7% |
| GSM8K (1.319 preguntas) | 0,952 | 0,958 |
| GSM8K (primeras 100) | 0,98 | 0,96 |
| Escritura (tok/s) | 114,4 | 115,9 |
| Lectura de prompt de 4K (tok/s) | 1136 | 1262 |

Condiciones de medición: KL calculada sobre 64 fragmentos de 512 tokens (wikitext-2, chats GSM8K, HumanEval); GSM8K ejecutado con llama-server pregunta a pregunta; velocidad medida en MacBook Pro M5 Pro de 48 GB con Kapitsa 0.2.32, cabeza MTP propia del archivo, respuesta de código de 512 tokens a temperatura 0,6, ejecuciones intercaladas y dos ejecuciones válidas por archivo. La propia model card advierte que la diferencia en GSM8K sobre las 1.319 preguntas está dentro del ruido de medición (unas 0,4 puntos) y que la cifra de lectura debe interpretarse como aproximada. Solo se midió Q4_K_M.

## Requisitos de hardware

- VRAM/memoria unificada estimada según el archivo: Q2_K 13,3 GB, Q3_K_M 17,2 GB, Q4_K_M 21,7 GB, Q8_0 37,8 GB, más 0,9 GB del proyector de visión si se usa entrada de imagen.
- Hardware de referencia de las mediciones: MacBook Pro con chip M5 Pro y 48 GB de memoria unificada.
- Encaje en hardware de consumo: las variantes Q2_K, Q3_K_M y Q4_K_M caben en Macs con 16-24 GB o más de memoria unificada; Q8_0 requiere aproximadamente 40 GB o más. No hay datos de ejecución en GPUs NVIDIA o AMD en la información disponible.
- Motor de despliegue principal: Kapitsa (instalación vía `brew install nace-ai/tap/kapitsa`), con conversión en el primer uso. También se documenta compatibilidad con llama.cpp/llama-server (commit `0a94a3f2`). No se mencionan vLLM, TGI ni Ollama.
- Throughput medido: 115,9 tok/s de escritura y 1262 tok/s de lectura de prompt de 4K en el hardware de referencia con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-GGUF-KQuant (este repo) | 35,5B | no disponible | GGUF | Apache 2.0 | Cuantizacion calibrada con imatrix; Q4_K_M medido |
| Qwen/Qwen3.6-35B-A3B (base) | 35,5B | no disponible | safetensors | Apache 2.0 | Modelo original en bf16; referencia de calidad |
| Qwen3.6-35B-A3B MLX 4-bit KQuant | no disponible | no disponible | MLX | Apache 2.0 | Misma calibracion KQuant para el runtime MLX |
| Q4_K_M plano del mismo modelo | 35,5B | no disponible | GGUF | Apache 2.0 | Referencia de cuantizacion estandar sin imatrix |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo se ha medido la calidad de la variante Q4_K_M; Q2_K, Q3_K_M y Q8_0 no tienen métricas publicadas en la model card, por lo que su fidelidad respecto al bf16 es desconocida.
- La ventaja de KQuant en GSM8K sobre la cuantización plana está dentro del ruido de medición según el propio autor; la mejora clara se observa en KL y en coincidencia de token top.
- Las cifras de velocidad proceden de un único equipo (MacBook Pro M5 Pro, 48 GB) y de dos ejecuciones válidas por archivo; no deben extrapolarse a otro hardware.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento multilingüe del modelo base en la documentación disponible.
- La longitud de contexto no está especificada, lo que impide planificar cargas de contexto largo con garantías.
- El repositorio tiene un volumen de descargas muy bajo (1 descarga, 0 likes en el momento de la consulta) y fue creado en noviembre de 2026, por lo que carece de validación comunitaria amplia.
- El soporte de tool calling, agentes y modo thinking no está confirmado; conviene verificar la model card del modelo base antes de diseñar flujos que dependan de estas capacidades.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben revisarse en su propio repositorio por si añade términos adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-GGUF-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Version MLX 4-bit KQuant: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-4bit-KQuant
- Motor Kapitsa (GitHub): https://github.com/nace-ai/kapitsa
- Nace.AI: https://www.nace.ai/
