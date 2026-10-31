# Ahmedcarpenter/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una cuantización GGUF, publicada por el usuario Ahmedcarpenter (bajo el sello HauhauCS), del modelo base Qwen/Qwen3.8-27B. Se trata de una variante "uncensored" con perfil Aggressive: el autor reporta 0/465 rechazos en su batería de pruebas, respuestas directas y preámbulos mínimos, sin cambios en los datasets ni en las capacidades previstas del modelo original.

La relevancia de esta release reside en dos puntos técnicos: primero, conserva de forma nativa la cabeza MTP/NextN del modelo base y añade "HauhauCS FastMTP", un sidecar de aceleración por decodificación especulativa que, según el autor, multiplica por hasta 3,02x el throughput de generación en documentos y por 1,93x en razonamiento frente a la versión sin MTP. Segundo, incluye un proyector de visión en BF16 separado, lo que habilita entrada de imagen y vídeo (pipeline image-text-to-text).

El modelo base es un denso de 27B parámetros con arquitectura híbrida (48 capas Gated DeltaNet y 16 capas de atención con puertas), contexto nativo de 262.144 tokens extensible hasta 1.000.000, y vocabulario de 248.320 tokens. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denso causal (transformer híbrido: 48 capas Gated DeltaNet + 16 capas gated-attention), con codificador de visión y cabeza MTP/NextN embebida |
| Parametros totales | 27B (según model card del modelo base). Nota: los metadatos de safetensors del repo reportan 1.863.907.840, dato inconsistente probablemente correspondiente solo a un subconjunto de tensores |
| Parametros activos | No disponible (no es MoE según la model card) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P (9,21 BPW), Q8_0 (8,50 BPW), Q6_K_P (7,59), Q6_K (6,60), Q5_K_P (5,92), Q5_K_M (5,70), Q4_K_P (5,25), Q4_K_M (4,88), IQ4_XS (4,60), Q3_K_P (3,93), Q3_K_M (3,90), IQ3_M (3,74), IQ3_XS (3,56), Q2_K_P (3,12), IQ2_M (3,02) |
| Idiomas soportados | Ingles, chino, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp, LM Studio y runtimes GGUF); proyector de vision en BF16 (931 MB); sidecar FastMTP-32K (903 MB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo causal denso de 27B parámetros con 64 capas de modelo de lenguaje, tamaño oculto de 5.120 y FFN de 17.408. Su rasgo más distintivo es la arquitectura híbrida: combina 48 capas Gated DeltaNet (una variante de red recurrente lineal tipo SSM/delta-rule) con 16 capas de atención con puertas, lo que reduce el coste de atención en contextos largos manteniendo capacidad de recuperación precisa. El vocabulario padded es de 248.320 tokens.

Sobre este base, HauhauCS ha aplicado un perfil de "descensado" (uncensoring) tipo Aggressive sin modificar datasets ni capacidades, y ha preservado la cabeza MTP/NextN embebida del modelo original. La innovación principal de esta release es HauhauCS FastMTP: un sidecar de aceleración de 903 MB (perfil 32K) que funciona junto a cualquier cuantización de texto y que, según el autor, logra hasta 3,02x de throughput en generación de documentos y 1,93x en razonamiento frente a la inferencia sin MTP, y un 35,2% / 21,1% más que el MTP embebido estándar. No se ha publicado información sobre el proceso de entrenamiento del uncensoring (datasets, tokens, RLHF/DPO).

## Capacidades

- Generacion de texto general y razonamiento, con respuestas directas y preambulos minimos (perfil Aggressive)
- Entrada multimodal: imagen y video mediante el proyector BF16 separado (pipeline image-text-to-text)
- Contexto nativo de 262.144 tokens, extensible hasta 1.000.000, adecuado para documentos largos
- Capacidades agenticas y de razonamiento preservadas del modelo base segun el autor
- Decodificacion especulativa via MTP/NextN embebido mas el sidecar FastMTP para acelerar el throughput
- Soporte multilingue (ingles, chino y otros idiomas)
- Compatibilidad con runtimes GGUF estandar (llama.cpp, LM Studio) sin builds ni plugins especiales

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens nativos y el acelerador FastMTP (hasta 3,02x de throughput en generacion sobre documentos), es adecuado para resumir, extraer y reescribir contratos, informes o corpus tecnicos extensos.
- Analisis de imagenes y video: el proyector BF16 permite describir, clasificar o responder preguntas sobre contenido visual sin salir del ecosistema GGUF, util en pipelines de moderation, OCR asistido o indexacion multimodal.
- Asistentes sin filtros para investigacion: el perfil Aggressive (0/465 rechazos reportados) responde sin negativas ni preambulos, util en entornos de investigacion controlados donde el comportamiento de rechazo del modelo original interfiere con la tarea.
- Agentes de multiples pasos: el autor indica que las capacidades agenticas del modelo base se preservan; el contexto largo favorece flujos agenticos con historial extenso, aunque recomienda la variante Balanced para trabajo agentico de fiabilidad critica cuando este disponible.
- Generacion local en consumer hardware: las cuantizaciones IQ2_M (10,32 GB) o Q2_K_P (10,68 GB) permiten ejecutar el modelo en GPUs de 12-16 GB de VRAM con calidad reducida.
- Servidor de inferencia de alto throughput: las variantes Q4_K_P o Q5_K_P en una GPU de 24 GB combinan calidad cercana a la original con la aceleracion MTP, adecuado para despliegues self-hosted con multiples usuarios.
- Razonamiento acelerado: para tareas de chain-of-thought, el sidecar FastMTP reporta 1,93x de mejora en throughput de razonamiento frente a inferencia sin MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son los de aceleracion del propio autor:

| Metrica | Valor |
|---|---|
| Throughput de generacion (documentos) con FastMTP vs sin MTP | hasta 3,02x |
| Throughput de generacion (razonamiento) con FastMTP vs sin MTP | hasta 1,93x |
| Throughput de generacion (documentos) vs MTP embebido estandar | hasta +35,2% |
| Throughput de generacion (razonamiento) vs MTP embebido estandar | hasta +21,1% |
| Tasa de rechazos (bateria propia del autor) | 0/465 |

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos de texto, sin KV cache ni proyector):
  - Q8_K_P: ~31,5 GB
  - Q6_K_P: ~26 GB
  - Q5_K_P: ~20,2 GB
  - Q4_K_P: ~17,9 GB
  - IQ4_XS: ~15,7 GB
  - Q3_K_P: ~13,4 GB
  - IQ2_M: ~10,3 GB
  - Anadir ~0,9 GB si se usa el proyector de vision y ~0,9 GB por el sidecar FastMTP
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_P/Q5_K_P; RTX 3090 (24 GB) como alternativa; A100/H100 de 40-80 GB para cuantizaciones altas con contexto completo; GPUs de 12-16 GB (RTX 3060 12GB, RTX 4060 Ti 16GB) para IQ2_M/Q2_K_P
- Consumer GPUs: cabe en una RTX 4090 con Q4_K_P o inferior; en 16 GB con IQ4_XS; en 12 GB solo con cuantizaciones de 2-3 bits
- Opciones de despliegue: llama.cpp, LM Studio y cualquier runtime GGUF compatible; no hay informacion sobre soporte en vLLM, TGI u Ollama para esta variante concreta
- Latencia y throughput: no disponibles en terminos absolutos; solo los multiplicadores de aceleracion FastMTP indicados arriba

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Particularidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP (esta ficha) | 27B (denso) | 262K (hasta 1M) | Si (vision/video) | Apache 2.0 | Uncensored Aggressive, MTP + FastMTP, hibrido DeltaNet |
| Qwen/Qwen3.8-27B (base) | 27B (denso) | 262K (hasta 1M) | Si | Apache 2.0 | Comportamiento de seguridad estandar, sin sidecar FastMTP |
| Qwen3-30B-A3B (referencia de categoria) | 30B (MoE, 3B activos) | 32K-128K | Parcial | Apache 2.0 | MoE mas rapido en inferencia, contexto nativo menor |

Nota: la comparativa se limita al modelo base y a una referencia de categoria, ya que no hay informacion suficiente sobre otras variantes uncensored equivalentes de 27B.

## Limitaciones y advertencias

- Al ser una variante uncensored, el modelo no aplicara rechazos de seguridad: su uso conlleva responsabilidad legal y etica plena para el operador, y puede generar contenido harmful si se le solicita.
- El perfil Aggressive prioriza respuestas directas; el propio autor recomienda la variante Balanced (cuando exista) para trabajo agentico de contexto largo y fiabilidad critica.
- Los datos de rendimiento (FastMTP, 0/465 rechazos) proceden exclusivamente del autor del repo y no han sido verificados de forma independiente.
- Existe una discrepancia no resuelta entre los parametros reportados en safetensors (1,86B) y los 27B de la model card; conviene verificar el tamano real del archivo descargado.
- Las cuantizaciones K_P son personalizadas de HauhauCS: aunque son GGUF estandar, pueden mostrarse como desconocidas en LM Studio y el widget de compatibilidad de HuggingFace puede no reconocerlas.
- Las cuantizaciones de 2-3 bits (IQ2_M, Q2_K_P, IQ3_XS) implican perdida de calidad notable respecto al modelo original.
- No hay benchmarks estandar publicados para esta variante, por lo que el impacto del uncensoring en razonamiento o codigo no esta cuantificado.
- Riesgo de alucinacion: no disponible (sin datos publicados para esta variante).
- Licencia Apache 2.0: sin restricciones de uso comercial, aunque el modelo base Qwen puede tener terminos adicionales que conviene revisar.

## Enlaces

- Repositorio: https://huggingface.co/Ahmedcarpenter/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repo de referencia de HauhauCS (enlaces de descarga citados en la model card): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Discord del autor: https://discord.gg/SZ5vacTXYf
