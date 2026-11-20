# minseo25/2dsd-nanbeige4.2-3b-shared-kv-dflash-drafter

## Resumen

El modelo `minseo25/2dsd-nanbeige4.2-3b-shared-kv-dflash-drafter` es un *drafter* (modelo borrador) de decodificación especulativa diseñado para acelerar la inferencia de su modelo objetivo, `minseo25/2dsd-nanbeige4.2-3b-shared-kv`, que a su vez es una variante de Nanbeige4.2-3B con compartición de KV en el último bucle. Lo desarrolla Minseo Kim y colaboradores en el marco del proyecto 2DSD (Two-Dimensional Speculative Decoding for Looped Language Models), vinculado a SqueezeAILab.

No es un modelo de propósito general autónomo: es un componente auxiliar de un sistema de decodificación especulativa que propone tokens que el modelo objetivo verifica después. Su función es reducir la latencia de generación sin alterar la distribución de salida del modelo objetivo. La innovación clave es que el *drafter* está condicionado por la profundidad del bucle (*depth-conditioned*), de modo que un único borrador sirve para todos los niveles de bucle del modelo objetivo (R = 2), combinando características de distintos bucles para generar propuestas.

Técnicamente es un transformer compacto de 5 capas con anchura oculta de 3072 (la misma que el objetivo), tamaño de bloque k = 16, y 1.273.271.552 parámetros totales según los pesos en safetensors. Reutiliza los embeddings congelados y la cabeza LM del modelo objetivo, y añade un embedding de máscara entrenable. El repositorio ocupa 2,5 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (drafter de decodificación especulativa, depth-conditioned DFlash) |
| Parámetros totales | 1.273.271.552 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El *drafter* es un transformer de 5 capas con anchura oculta 3072, igual que el modelo objetivo Nanbeige4.2-3B (22 capas). Genera propuestas en bloques de tamaño k = 16 y está condicionado por la profundidad del bucle: un único borrador sirve para todos los niveles r = 1, ..., R con R = 2. Para ello recibe como entrada contexto de bucle procedente de cinco capas del objetivo (índices 0-based 1, 6, 10, 14 y 19 de 22); al redactar en el bucle r, el contexto combina características del bucle R de los tokens ya confirmados con características del bucle r de los tokens en vuelo. Reutiliza los embeddings congelados y la cabeza LM del objetivo, y aprende únicamente un embedding de máscara.

El entrenamiento se realizó sobre *rollouts* de 13.000 prompts durante seis épocas, con tamaño de bloque 16 y profundidades de entrenamiento r en {1, 2} muestreadas de forma uniforme. La verificación se efectúa con el último bucle, de modo que el sistema preserva las salidas greedy y la distribución de muestreo del modelo objetivo. El modelo se deriva de Nanbeige4.2-3B y se entrena sobre las salidas del objetivo; incluye una copia de la cabeza LM del objetivo, lo que condiciona su licencia Apache 2.0.

## Capacidades

- Generación de propuestas de tokens (*drafting*) para decodificación especulativa sobre el objetivo Nanbeige4.2-3B con compartición de KV.
- Condicionamiento por profundidad de bucle: un solo borrador cubre todos los niveles de bucle (R = 2) del modelo objetivo.
- Preservación de la distribución del objetivo: la verificación con el último bucle mantiene las salidas greedy y la distribución de muestreo.
- Decodificación greedy por defecto, con opción de muestreo (`--temperature 0.6 --top-p 0.95`).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido de forma autónoma: sus capacidades son las del sistema de decodificación especulativa del que forma parte.
- Capacidades multilingües: no disponibles (heredadas del objetivo, no documentadas en esta ficha).

## Casos de uso

- Aceleración de inferencia en producción: se integra en el repositorio 2DSD para reducir la latencia de generación del objetivo Nanbeige4.2-3B mediante propuestas en bloques de 16 tokens verificadas por el modelo grande.
- Servicio de chat de baja latencia: al preservar la distribución de muestreo del objetivo, puede desplegarse en pipelines conversacionales sin alterar la calidad de las respuestas.
- Evaluación de decodificación especulativa: sirve como referencia reproducible para investigar *drafters* condicionados por profundidad en modelos con bucles.
- Investigación académica sobre *speculative decoding*: permite comparar el enfoque 2DSD con *drafters* convencionales sobre el mismo objetivo.
- Despliegue en entornos con presupuesto de cómputo ajustado: al ser un modelo de 1,27 mil millones de parámetros, el coste de las propuestas es bajo frente al del objetivo de 3B.
- Reproducción de experimentos del paper 2DSD: el comando `python scripts/generate.py --model nanbeige4.2-3b` carga el *drafter* junto con su objetivo de KV compartida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,27 mil millones de parámetros en safetensors, los pesos ocupan aproximadamente 2,5 GB en precisión de entrenamiento (el tamaño del repo es de 2,5 GB).
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño de parámetros sería viable en GPUs con al menos 4-6 GB de VRAM, pero no se documenta.
- Opciones de despliegue: el repositorio SqueezeAILab/2DSD mediante `scripts/generate.py`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2dsd-nanbeige4.2-3b-shared-kv-dflash-drafter | 1.273.271.552 | no disponible | Drafter de decodificación especulativa | apache-2.0 | Hugging Face (8 descargas) |
| Nanbeige4.2-3B (objetivo base) | no disponible en esta ficha | no disponible | Modelo de lenguaje de propósito general | apache-2.0 | Hugging Face |
| 2dsd-nanbeige4.2-3b-shared-kv (objetivo) | no disponible en esta ficha | no disponible | Objetivo con compartición de KV en el último bucle | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona como *drafter* dentro del sistema 2DSD y con el objetivo `minseo25/2dsd-nanbeige4.2-3b-shared-kv`; no puede usarse para generación directa.
- Depende de la implementación del repositorio 2DSD; no se documentan integraciones con frameworks de inferencia estándar.
- Al derivarse de Nanbeige4.2-3B y entrenarse sobre sus salidas, hereda los sesgos y riesgos de alucinación del objetivo, aunque no se detallan en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo incluye una copia de la cabeza LM del objetivo, por lo que conviene verificar las condiciones del modelo base.
- No se documentan idiomas soportados, longitud de contexto ni tipos de cuantización, lo que limita la planificación de despliegue.
- El modelo es reciente (creado el 16 de noviembre de 2026) y con muy pocas descargas (8) y ningún *like*, por lo que su validación comunitaria es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/minseo25/2dsd-nanbeige4.2-3b-shared-kv-dflash-drafter
- Modelo objetivo: https://huggingface.co/minseo25/2dsd-nanbeige4.2-3b-shared-kv
- Modelo base original: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Paper 2DSD: https://github.com/SqueezeAILab/2DSD/blob/main/paper/2DSD.pdf
- Código 2DSD: https://github.com/SqueezeAILab/2DSD
