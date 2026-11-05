# cgg507/Anubis-70B-v1-QTIP-FP8KV

## Resumen

Anubis-70B-v1-QTIP-FP8KV es un checkpoint cuantizado derivado de TheDrummer/Anubis-70B-v1, un modelo de 70.000 millones de parámetros orientado a generación de texto y roleplay. Lo publica el usuario cgg507 en HuggingFace y su propósito no es ofrecer un modelo nuevo, sino una versión comprimida del original para reducir los requisitos de memoria durante la inferencia. La cuantización combina QTIP de 2 bits y NVFP4 calibrado en las proyecciones lineales, con pesos FP8 E4M3 en las proyecciones K/V, y está pensada para ejecutarse en el runtime CUDA propietario Behemoth-QTIP.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de compresión agresiva (2 bits por peso en 80 capas) que permite plantear el despliegue de un modelo de 70B en hardware mucho más modesto que el requerido por BF16. Por otro, expone las limitaciones de esa aproximación: la pérdida de calidad medida en perplejidad es sustancial (de 2,73 a 4,15 sobre WikiText-103), el formato no es estándar y no hay información pública sobre licencia, idiomas ni benchmarks de tareas.

No se dispone de datos sobre la arquitectura interna del modelo base más allá de su tamaño (70B) y de que emplea proyecciones K/V y una cabeza de lenguaje estándar. Toda la información técnica verificable procede de la model card del checkpoint cuantizado y de los metadatos de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (deducida del modelo base de 70B; detalles internos no disponibles) |
| Parámetros totales | 70.000 millones (modelo base) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | QTIP 2-bit (80 capas), NVFP4 calibrado (0 capas en este checkpoint), FP8 E4M3 con escala por canal de salida en proyecciones K/V; embeddings, norm final y LM head en BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Checkpoint para runtime Behemoth-QTIP (CUDA); no se especifica safetensors ni GGUF |
| Revisión del modelo base | `e50d699bf6c21afcf4dbd9a8b4f73511b0366efb` |

## Arquitectura y entrenamiento

El checkpoint no introduce entrenamiento nuevo: es una conversión post-entrenamiento del modelo TheDrummer/Anubis-70B-v1. La cuantización se aplica capa a capa con un criterio adaptativo: cada proyección lineal se asigna a QTIP de 2 bits o a NVFP4 calibrado según un umbral de divergencia KL de 0,01 en la predicción del siguiente token. En la práctica, el resultado final contiene 80 capas en QTIP y ninguna en NVFP4, lo que indica que el criterio descartó el formato de 4 bits para todas las capas evaluadas. Las proyecciones K/V se mantienen en FP8 E4M3 con escala por canal de salida para preservar la fidelidad de la caché de atención.

La calibración empleó 4.194.304 tokens en secuencias de 2.048 tokens, con una mezcla del 75% de prosa de entrenamiento de WikiText-103 y 25% de conversaciones de instrucciones de SmolTalk. La sonda KL por capa usó 2.048 tokens y activaciones del modelo original. El autor advierte explícitamente de que el umbral por capa no garantiza una cota de KL para el modelo completo. La evaluación publicada se limita a cuatro documentos de validación de WikiText-103 de 512 tokens: KL global de 0,398523 nats/token y perplejidad de 4,15415 frente a 2,73096 del BF16 nativo. El propio autor señala que la comparación mezcla prefill BF16 por lotes con decodificación incremental en CUDA, por lo que parte de la diferencia es atribuible a la ruta aritmética y no solo a la cuantización.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base de 70B.
- Conversación multi-turno y roleplay: el modelo base TheDrummer/Anubis está orientado a este uso, aunque no hay evaluación publicada del checkpoint cuantizado en esta tarea.
- Razonamiento y conocimiento general: presumiblemente conservados en parte, pero sin benchmarks que lo confirmen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible; no se mencionan en la model card.

## Casos de uso

- Investigación en cuantización extrema: el checkpoint sirve como caso de estudio reproducible de cuantización adaptativa a 2 bits con métricas KL por capa y artefactos de procedencia (`adaptive_report.json`, `provenance/`), útil para grupos que investigan compresión de LLM.
- Despliegue de roleplay en hardware limitado: con 80 capas a 2 bits, el modelo cabe en GPUs de consumo alto donde un 70B en BF16 no cabría; adecuado para prototipos de chatbots de personaje siempre que se acepte la pérdida de perplejidad documentada.
- Evaluación comparativa de runtimes: al requerir Behemoth-QTIP, permite medir el rendimiento de ese runtime frente a alternativas como llama.cpp o vLLM con otros formatos cuantizados.
- Generación de texto creativo sin requisitos de latencia estricta: la decodificación incremental en CUDA y el formato no estándar lo hacen más apto para experimentación offline que para producción interactiva.
- Reproducción de la metodología de calibración: los tokens de retención y las salidas de humo de inferencia incluidos en el repositorio permiten validar pipelines de cuantización propios.
- Docencia y formación técnica: ilustra de forma concreta el compromiso entre tasa de compresión, divergencia KL y perplejidad en modelos de gran tamaño.

## Benchmarks y rendimiento

| Métrica | Referencia BF16 | Checkpoint QTIP-FP8KV |
|---|---|---|
| Perplejidad (WikiText-103, 4 docs de 512 tokens) | 2,73096 | 4,15415 |
| KL por token frente a BF16 (nats/token) | 0 | 0,398523 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que la evaluación no cubre contexto largo ni roleplay.

## Requisitos de hardware

- VRAM estimada: con 80 capas a 2 bits más K/V en FP8 y embeddings/norm/LM head en BF16, el peso ronda los 25-30 GB, aunque no se publica una cifra oficial; debe reservarse VRAM adicional para la caché KV y el runtime.
- GPU recomendadas: no disponibles en la información proporcionada; el runtime Behemoth-QTIP es CUDA, por lo que se requiere GPU NVIDIA.
- ¿Cabe en GPU de consumo? Probablemente en modelos con 24 GB o más (RTX 3090, 4090) si la estimación de peso es correcta, pero no está confirmado por el autor.
- Opciones de despliegue: exclusivamente el runtime Behemoth-QTIP; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anubis-70B-v1-QTIP-FP8KV | 70B | No disponible | QTIP 2-bit + FP8 KV | No disponible | HuggingFace (0 descargas) |
| TheDrummer/Anubis-70B-v1 (base) | 70B | No disponible | BF16 | No disponible | HuggingFace |
| Otros 70B cuantizados a 2-4 bits (p. ej. variantes GGUF de Llama-70B) | 70B | Variable | Q2_K a Q4_K_M | Variable según base | Amplia, vía llama.cpp |

La comparación con alternativas estándar es limitada porque este checkpoint depende de un runtime propietario y no ofrece métricas de tareas. Frente a las cuantizaciones GGUF convencionales, la ventaja teórica es una mayor compresión (2 bits) y la preservación de K/V en FP8; la desventaja es la falta de portabilidad y la ausencia de validación en benchmarks de uso real.

## Limitaciones y advertencias

- Pérdida de calidad documentada: la perplejidad sube un 52% (2,73 a 4,15) en la evaluación publicada, con un KL de 0,398 nats/token; el autor advierte de que el umbral por capa no garantiza una cota global.
- Evaluación muy reducida: solo cuatro documentos de 512 tokens de WikiText-103; no hay datos de contexto largo, roleplay, código ni matemáticas.
- Dependencia de un runtime propietario (Behemoth-QTIP): no es portable a vLLM, llama.cpp, Ollama ni TGI, lo que limita su uso en producción estándar.
- Licencia no especificada: no se puede confirmar el uso comercial; debe consultarse la licencia del modelo base TheDrummer/Anubis-70B-v1 antes de cualquier despliegue.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Riesgo de alucinación: inherente al modelo base y potencialmente agravado por la cuantización a 2 bits.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- Fecha de creación del repositorio (2026-11-05) posterior a la mayoría de referencias públicas; verificar la vigencia de los enlaces.

## Enlaces

- HuggingFace del checkpoint: https://huggingface.co/cgg507/Anubis-70B-v1-QTIP-FP8KV
- Modelo base: https://huggingface.co/TheDrummer/Anubis-70B-v1
- Referencia interna del autor: `SOURCE_README.md` (incluido en el repositorio)
- Artefactos de procedencia: `provenance/` y `adaptive_report.json` (incluidos en el repositorio)
- Paper de QTIP: no disponible en la información proporcionada
- Documentación del runtime Behemoth-QTIP: no disponible en la información proporcionada
