# osk-arr00/BigBang-Aquila-35B-GGUF

## Resumen

BigBang-Aquila-35B-GGUF es un conjunto de cuantizaciones GGUF del modelo fusionado BigBang-Aquila-35B, desarrollado por osk-arr00 a partir de la base Qwen/Qwen3.6-35B-A3B. Se trata de un merge DARE-TIES entre dos especialistas sobre la misma arquitectura: BigBang-v1 (razonamiento formal, matemáticas, código e investigación científica) y XYZ-Aquila-mini (agencia web con búsqueda profunda, scraping y tool-calling). El resultado es un modelo de 35 000 millones de parámetros totales con solo 3 000 millones activos por token, gracias a su arquitectura MoE híbrida.

El modelo incorpora dos innovaciones relevantes: un proceso de ablación (OrthoBot) que elimina 50 tensores asociados a direcciones de rechazo, reduciendo la negativa a responder, y la integración de una cabeza MTP (Multi-Token Prediction) para decodificación especulativa, que acelera la inferencia entre 1,5 y 2 veces sin necesidad de un modelo draft separado. Con un contexto nativo de 262 144 tokens, está orientado a tareas agénticas de largo alcance, razonamiento complejo y uso en producción con herramientas.

La relevancia actual de este modelo radica en su combinación de capacidades de razonamiento y agencia web en un solo paquete, con cuantizaciones que permiten ejecutarlo en GPUs de consumo (20-23 GB) y una licencia Apache 2.0 que facilita su adopción comercial. Es una opción atractiva para desarrolladores que necesitan un modelo local con buen rendimiento en tareas de código, matemáticas y búsqueda en línea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE híbrida: Gated DeltaNet + Gated Attention, 256 expertos, 8 activos) |
| Parametros totales | 34 660 610 688 (35B) |
| Parametros activos | 3B (aprox.) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | APEX I-Quality (IQ), Q4_K_M, BF16, con y sin MTP |
| Idiomas soportados | no disponible (base Qwen3.6 multilingüe, pero no se especifica lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) híbrido que combina Gated DeltaNet (una capa de atención lineal con estado recurrente) y Gated Attention (atención tradicional con compuertas). Dispone de 256 expertos en total, de los cuales se activan 8 por token, lo que explica los 3B parámetros activos frente a los 35B totales. Esta hibridación permite manejar contextos muy largos (262 144 tokens) con un coste computacional reducido.

El entrenamiento del modelo fusionado se realizó mediante un merge DARE-TIES de dos especialistas entrenados sobre la misma base: BigBang-v1 (razonamiento formal, matemáticas, código, investigación) y XYZ-Aquila-mini (agencia web, búsqueda profunda, scraping, tool-calling). Los pesos se combinaron con una proporción 0,55/0,45 y una densidad de 0,5. Los vectores de tarea resultaron casi ortogonales (coseno ≈ 0,057), lo que indica que ambas capacidades se conservan sin interferencia significativa.

Posteriormente se aplicó una ablación con OrthoBot, eliminando 50 tensores con direcciones de rechazo significativas (media 1,89), con el objetivo de reducir la negativa a responder. La cuantización se realizó con imatrix (calibración por importancia) y se incorporó la cabeza MTP (Multi-Token Prediction) de la arquitectura Qwen3.6, que permite decodificación especulativa leyendo directamente del GGUF principal, sin modelos draft externos.

## Capacidades

- Generación de texto y razonamiento formal: resolución de problemas matemáticos, lógica y razonamiento multi-paso.
- Generación de código: soporte para múltiples lenguajes de programación, depuración y refactorización.
- Agencia web: búsqueda profunda en internet, scraping de páginas y extracción de información estructurada.
- Tool calling / function calling: integración con herramientas externas para ejecutar acciones (búsqueda, ejecución de código, etc.).
- Razonamiento agéntico multi-paso: planificación y ejecución de tareas complejas que requieren varias iteraciones.
- Decodificación especulativa: gracias a la cabeza MTP integrada, acelera la inferencia entre 1,5 y 2 veces en llama.cpp.
- Capacidades multilingües: heredadas de la base Qwen3.6, aunque no se detalla la lista de idiomas soportados.
- Contexto largo: ventana de 262 144 tokens, adecuada para documentos extensos y conversaciones de largo recorrido.

## Casos de uso

- Asistente de investigación científica: el modelo puede buscar artículos en línea, extraer datos de páginas web y razonar sobre resultados experimentales, combinando la capacidad de búsqueda de Aquila con el razonamiento formal de BigBang. Su contexto largo permite procesar documentos técnicos completos.
- Generación y revisión de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para revisar pull requests, generar tests unitarios o refactorizar código. La decodificación especulativa reduce la latencia en entornos de integración continua.
- Agente de atención al cliente con acceso a web: puede consultar bases de conocimiento en línea, gestionar conversaciones multi-turno con contexto largo y ejecutar acciones como consultar pedidos o resolver incidencias, gracias a su capacidad de tool calling.
- Análisis de datos y scraping: el modelo puede navegar por sitios web, extraer información estructurada y generar informes o resúmenes, útil para monitorización de precios, noticias o competencia.
- Tutor de matemáticas y ciencias: su razonamiento formal y capacidad de explicación lo hacen adecuado para plataformas educativas que necesitan resolver problemas paso a paso y generar ejercicios personalizados.
- Automatización de tareas de oficina: combinando búsqueda web, generación de texto y ejecución de código, puede redactar informes, resumir documentos y preparar presentaciones a partir de fuentes en línea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente una evaluación agéntica sobre 9 casos difíciles, con los siguientes resultados:

| Dominio | Resultado |
|---|---|
| BigBang (matemáticas/código) | 3/3 PASS |
| Aquila (agencia web) | 1/3 PASS |
| Intersección (web + python + razonamiento) | 2/3 PASS |
| **Total** | **6/9 PASS** |

Estos resultados indican un buen rendimiento en razonamiento y código, pero una capacidad más limitada en tareas puramente de agencia web. No se dispone de comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF varían entre 20 GB (Q4_K_M sin MTP) y 23 GB (APEX IQ con MTP). El archivo BF16 ocupa 69 GB y no es adecuado para GPUs de consumo.
- GPUs recomendadas: para las cuantizaciones de 20-23 GB, una RTX 3090 o RTX 4090 (24 GB VRAM) es suficiente. Para el BF16 se necesitarían GPUs profesionales como A100 o H100 (80 GB).
- Compatibilidad con consumer GPU: sí, las versiones Q4_K_M y APEX IQ caben en GPUs de 24 GB. Para GPUs con 16 GB (como RTX 4080 o RTX 3080 Ti) se podría intentar con Q4_K_M, pero podría requerir offloading parcial.
- Opciones de despliegue: llama.cpp (recomendado, con soporte para MTP), llama-server, Ollama (si soporta la arquitectura), vLLM (si añade soporte para qwen3_5_moe), TGI.
- Latencia y throughput: no disponible. La decodificación especulativa con MTP promete una aceleración de 1,5-2x, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BigBang-Aquila-35B | 35B | 3B | 262 144 | Apache 2.0 | GGUF, HuggingFace |
| Qwen3.6-35B-A3B (base) | 35B | 3B | 262 144 | Apache 2.0 | Safetensors, GGUF |
| Qwen3-30B-A3B | 30B | 3B | 131 072 | Apache 2.0 | Safetensors, GGUF |

La comparativa se limita a modelos de la misma familia (Qwen MoE) porque no se dispone de datos de rendimiento para otros modelos similares. BigBang-Aquila se diferencia de la base Qwen3.6 por el merge de especialistas y la ablación, pero no hay benchmarks que cuantifiquen la mejora. Frente a Qwen3-30B-A3B, ofrece más parámetros totales y mayor contexto, aunque con la misma cantidad de parámetros activos.

## Limitaciones y advertencias

- Sesgos y alucinación: al ser un modelo derivado de Qwen3.6, puede heredar sesgos presentes en los datos de entrenamiento. La ablación de direcciones de rechazo puede aumentar la probabilidad de generar contenido no deseado o alucinaciones, ya que se reduce la inhibición del modelo.
- Rendimiento en agencia web: la evaluación agéntica muestra solo 1/3 PASS en tareas puramente de agencia web, lo que sugiere que la capacidad de búsqueda y scraping es limitada en comparación con el razonamiento.
- Compatibilidad de cuantizaciones: las cuantizaciones APEX (ROCmFP4/FPx) requieren GPUs AMD RDNA4 o superiores; en GPUs más antiguas o Vulkan se recomienda usar K-quants o APEX I-Quality.
- Dependencia de llama.cpp para MTP: la decodificación especulativa con MTP solo funciona con versiones recientes de llama.cpp que soporten `--spec-type draft-mtp`. Otros frameworks pueden no ofrecer esta funcionalidad.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base Qwen3.6 también es Apache 2.0, por lo que no hay conflicto de licencias.
- Tamaño del repositorio: 228,7 GB en total, lo que requiere una buena conexión y espacio en disco si se descargan todas las cuantizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/osk-arr00/BigBang-Aquila-35B-GGUF
- Modelo base fusionado (safetensors): https://huggingface.co/osk-arr00/BigBang-Aquila-35B-Merged
- Repositorio de BigBang-v1 (GitHub): https://github.com/endless-frontier/BigBang-v1
- Página de despliegue en FriendliAI: https://friendli.ai/models/osk-arr00/BigBang-Aquila-35B-Merged
- Herramienta modelmap (mapas de arquitectura): https://modelmap.cc/
