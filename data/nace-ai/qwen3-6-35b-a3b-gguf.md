# nace-ai/Qwen3.6-35B-A3B-GGUF

## Resumen

Qwen3.6-35B-A3B es un modelo de la familia Qwen publicado por Alibaba (Qwen) con arquitectura Mixture of Experts (MoE): 35.505.251.456 parámetros totales y, por el sufijo A3B, aproximadamente 3.000 millones de parámetros activos por token. El repositorio analizado, `nace-ai/Qwen3.6-35B-A3B-GGUF`, no es el modelo original sino una cuantización GGUF preparada por Nace.AI para su motor de inferencia local Kapitsa, orientado a Macs con Apple Silicon. El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base es multimodal (texto e imagen), y se distribuye bajo licencia Apache 2.0.

La aportación principal de esta ficha es la cuantización: Q2_K, Q3_K_M y Q4_K_M se han generado con una matriz de importancia (importance matrix, imatrix), una técnica que pondera los pesos según su relevancia para reducir la pérdida de calidad respecto a la cuantización plana. El autor publica una medición concreta sobre Q4_K_M: divergencia KL de 0.031 frente a 0.048 del archivo plano, y un 94.7 % de coincidencia en el token top-1 frente al bf16, manteniendo el mismo tamaño de archivo (21.7 GB).

El modelo es relevante para quien quiera ejecutar un MoE multimodal de 35B en hardware de consumo o en un Mac sin GPU dedicada, sacrificando precisión de pesos a cambio de un tamaño manejable. La información disponible sobre el modelo base (contexto, datos de entrenamiento, benchmarks propios) es limitada en esta ficha y se marca como no disponible cuando no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; multimodal (image-text-to-text) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3B (inferido del sufijo A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M (con importance matrix), Q8_0 (sin imatrix); MLX 4-bit KQuant en repo aparte |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base); incluye `mmproj-bf16.gguf` para vision e `imatrix.gguf` |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas MoE, según se deduce del nombre Qwen3.6-35B-A3B: 35B de parámetros totales con aproximadamente 3B activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. El pipeline `image-text-to-text` y la presencia de un proyector multimodal (`mmproj-bf16.gguf`) confirman que el modelo acepta entradas de imagen además de texto. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica destacable de este repositorio es el uso de importance matrix en las cuantizaciones Q2_K, Q3_K_M y Q4_K_M. La imatrix se calcula a partir de activaciones y permite asignar más bits a los pesos que más contribuyen a la salida, reduciendo la degradación. El autor reporta que en Q4_K_M el archivo con imatrix mantiene el mismo tamaño (21.7 GB) que el plano pero se acerca más al modelo original. Las mediciones se hicieron con llama.cpp en la revisión `0a94a3f2` (11 de noviembre de 2026), con KL calculada sobre 64 fragmentos de 512 tokens (wikitext-2, chats de GSM8K y HumanEval) y GSM8K completo (1.319 preguntas) a través de llama-server.

## Capacidades

- Generación de texto y conversación multi-turno (tag `conversational`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con proyector multimodal incluido.
- Razonamiento y matemáticas: el autor evalúa con GSM8K, lo que sugiere capacidad de resolución de problemas aritméticos.
- Generación de código: la evaluación de KL incluye HumanEval, lo que indica uso previsto en tareas de programación.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su exposición como API compatible con OpenAI.
- Capacidades multilingües: no disponible (los idiomas no constan en la información).
- Tool calling, function calling y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato GGUF y el motor Kapitsa permiten ejecutar el modelo en un Mac sin GPU dedicada, sirviendo chat y API en `http://127.0.0.1:8000` con `kapitsa serve`.
- Asistente de código en estación de trabajo: con Q4_K_M (21.7 GB) cabe en Macs con 32 GB o más de memoria unificada, y su evaluación sobre HumanEval sugiere utilidad para autocompletado y revisión de código.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales, útil para extracción de información de informes.
- Prototipado de agentes conversacionales: el tag `conversational` y la compatibilidad con endpoints permiten montar un servicio local compatible con clientes que esperan una API tipo OpenAI.
- Evaluación de cuantizaciones en investigación: el repositorio incluye imatrix y métricas KL, lo que lo convierte en material de referencia para estudiar el impacto de la cuantización con importance matrix en modelos MoE.
- Despliegue con requisitos de memoria ajustados: Q2_K (13.3 GB) y Q3_K_M (17.2 GB) permiten ejecutar el modelo en equipos con 16-24 GB de memoria, a costa de mayor degradación.
- Razonamiento matemático asistido: con GSM8K como benchmark de referencia, puede emplearse en tutores o validadores de problemas aritméticos en entornos educativos.

## Benchmarks y rendimiento

El autor publica métricas de calidad de la cuantización, no benchmarks del modelo base frente a otros modelos. Se reproducen a continuación.

| Metrica | Q4_K_M plano | Q4_K_M con imatrix (este repo) |
|---|---:|---:|
| KL desde bf16 (menor es mejor) | 0.048 | 0.031 |
| Mismo token top-1 que bf16 | 93.4 % | 94.7 % |
| GSM8K (1.319 preguntas) | 0.952 | 0.958 |
| GSM8K (primeras 100) | 0.98 | 0.96 |

El autor advierte que la diferencia en GSM8K completo (0.952 frente a 0.958) está dentro del ruido de medición (unas 0.4 décimas). Solo se midió Q4_K_M. No se han publicado en la información disponible resultados de MMLU, HumanEval ni otros benchmarks del modelo base.

## Requisitos de hardware

- VRAM/memoria unificada estimada según archivo: Q2_K 13.3 GB, Q3_K_M 17.2 GB, Q4_K_M 21.7 GB, Q8_0 37.8 GB, más 0.9 GB del proyector de visión.
- Macs Apple Silicon: el motor Kapitsa está diseñado para esta plataforma; Q4_K_M encaja en equipos con 32 GB de memoria unificada o más, y Q2_K en equipos de 16 GB con margen ajustado.
- GPU dedicadas: no hay datos específicos de rendimiento en A100, H100 o RTX 4090 en la información proporcionada; el formato GGUF es compatible con llama.cpp en CUDA, pero no se documentan cifras.
- Cabe en GPU de consumo: previsiblemente sí con Q4_K_M en tarjetas de 24 GB (RTX 3090/4090), aunque no está confirmado en la información disponible.
- Opciones de despliegue: Kapitsa (motor oficial de este repo), llama.cpp/llama-server (usado para las mediciones), y por compatibilidad de formato GGUF, otros runners que lo soporten; vLLM y TGI no están confirmados para este archivo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35.5B totales, ~3B activos | no disponible | Apache 2.0 | safetensors | Modelo original de Qwen |
| Este repo (GGUF) | 35.5B totales, ~3B activos | no disponible | Apache 2.0 | GGUF (Q2-Q8) | Cuantización con imatrix para Kapitsa |
| Qwen3.6-35B-A3B MLX 4-bit KQuant | 35.5B totales, ~3B activos | no disponible | Apache 2.0 | MLX | Misma familia, formato para MLX |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información |

## Limitaciones y advertencias

- Las cuantizaciones Q2_K y Q3_K_M no han sido medidas por el autor; se desconoce su degradación real frente a bf16.
- La pérdida de calidad de Q4_K_M, aunque pequeña, existe: KL 0.031 y 94.7 % de coincidencia top-1 implican que aproximadamente 1 de cada 20 tokens generados difiere del modelo original.
- El modelo base es multimodal y MoE; las cuantizaciones con imatrix pueden comportarse de forma distinta en visión que en texto, y el autor no documenta mediciones multimodales.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos.
- Sesgos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad fuera del inglés sin verificación previa.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base Qwen y de las dependencias del motor Kapitsa.
- El repositorio tiene 1 descarga y 0 likes en el momento de la consulta; es una publicación reciente y poco validada por la comunidad.
- El despliegue recomendado (Kapitsa) está orientado a Apple Silicon; en otras plataformas el soporte no está documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Versión MLX 4-bit: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-4bit-KQuant
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Nace.AI: https://www.nace.ai/
