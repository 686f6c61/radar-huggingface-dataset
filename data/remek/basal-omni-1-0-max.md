# Remek/basal-omni-1.0-max

## Resumen

basal-omni-1.0-max es un modelo experimental de 12B parámetros desarrollado por Remek, construido sobre `google/gemma-4-12B-it` mediante fine-tuning. No es un modelo generativo al uso: en lugar de producir texto libre, lee un *estado* (un mensaje, un documento, pasajes recuperados, una traza de agente o una página web en JSON) y responde a una pregunta tipada sobre él (`choice`, `noul` de sí/no, `score`, y en el motor basal `multi`, `act` y `tool`), devolviendo una probabilidad calibrada para cada respuesta permitida en un único forward pass.

La propuesta se inspira en modelos de decisión de *Sistema 1* (rápidos, intuitivos), como Jev, y se posiciona como la primera entrega de la línea basal-omni sobre Gemma 4. Frente a basal-1.5-max, amplía el número de opciones por pregunta hasta 255, incorpora procesamiento zero-shot de imágenes y audio mediante los codificadores nativos de Gemma 4 (sin entrenamiento específico en medios), y se entrena sobre aproximadamente 815.000 decisiones tipadas en polaco e inglés con objetivos suaves procedentes de basal-1.5.

Es relevante porque ataca un problema distinto al de los LLM generativos: clasificación y decisión calibrada con garantías de conformidad (la respuesta nunca cae fuera de las opciones dadas) y cobertura automática controlada por umbral de error. El modelo está publicado con licencia Apache 2.0, en formato safetensors, con 11.959.730.224 parámetros y un repositorio de 24,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 unified: codificadores de texto, imagen y audio), fine-tuning para decisión tipada |
| Parámetros totales | 11.959.730.224 (≈12B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (los benchmarks cubren estados de hasta 30k+ caracteres, ≈15k tokens) |
| Tipos de cuantización | No disponible en la información proporcionada (pesos publicados en bf16; safetensors) |
| Idiomas soportados | Polaco (pl) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer multimodal de Gemma 4 que integra codificadores propios para texto, imagen y audio. Sobre esa base, Remek aplica un fine-tuning orientado a decisión tipada: el modelo no genera tokens de respuesta, sino que puntúa cada opción permitida y emite una distribución de probabilidad calibrada en un solo forward pass. El motor de inferencia asociado (basal, repositorio `rkinas/basal`) gestiona los tipos de pregunta (`choice`, `noul`, `score`, `multi`, `act`, `tool`) y los umbrales de certificación por tipo.

El entrenamiento se realizó sobre aproximadamente 815.000 decisiones tipadas en polaco e inglés, con objetivos suaves (soft targets) destilados de basal-1.5. Es importante subrayar que el entrenamiento cubre únicamente decisiones sobre texto: las capacidades sobre imagen y audio son zero-shot, apoyadas en los encoders de Gemma 4 sin entrenamiento específico en medios, y el autor anuncia entrenamiento multimodal para futuras versiones. El modelo admite hasta 255 opciones por pregunta y, por defecto, un único orden de opciones (basal-1.5 promediaba dos).

## Capacidades

- Decisión tipada calibrada: elección entre opciones (`choice`), sí/no (`noul`), puntuación (`score`), selección múltiple (`multi`), acción de agente (`act`) y selección de herramienta (`tool`) a partir de definiciones OpenAI o MCP.
- Salida restringida al conjunto de opciones dadas: la respuesta nunca cae fuera de las alternativas permitidas.
- Probabilidad calibrada por opción, utilizable para enrutado automático con umbral de error objetivo.
- Procesamiento zero-shot de imágenes y audio en la misma petición (campo `"media"`, servido con `--media on`), sin entrenamiento específico en medios.
- Soporte de tool calling en modo selección: elige la herramienta adecuada, no genera sus argumentos.
- Manejo de estados largos: documentos, pasajes recuperados, trazas de agente y páginas web en JSON.
- Multilingüe limitado a polaco e inglés.
- Integración con el motor basal (`basal-serve`) con modos `eager`, `fast` y `deterministic`.

## Casos de uso

- Enrutado y triaje de tickets de soporte: el modelo clasifica cada mensaje entrante en una de hasta 255 categorías con probabilidad calibrada, permitiendo derivar automáticamente solo los casos por encima del umbral y escalar el resto a un humano.
- Verificación de contratos y documentos legales: responde preguntas de sí/no y elección sobre cláusulas concretas; útil para precribado, teniendo en cuenta su precisión del 76,2% en la categoría de contratos de Werdykt.
- Selección de herramienta en agentes: dado un conjunto de definiciones de herramientas OpenAI o MCP y una traza de agente, elige la herramienta correcta en un solo forward pass, sin coste de generación.
- Filtrado de recuperación (RAG): puntúa pasajes recuperados frente a una consulta y decide si son relevantes, con probabilidad calibrada para fijar umbrales de descarte.
- Moderación y cumplimiento de reglas: clasificación de contenido frente a políticas tipadas; el autor advierte que la categoría de reglas es la más débil (0,418), por lo que los umbrales y fechas exactos deben calcularse en código.
- Procesamiento de documentos largos: con 98,0% de precisión en estados de 4k-8k caracteres, adecuado para extracción de decisiones sobre informes y expedientes de extensión media; por encima de 30k caracteres la precisión cae al 58,8%.
- Análisis de imágenes y audio en precribado: clasificación zero-shot de contenido multimedia en la misma petición, asumiendo la ausencia de entrenamiento específico en medios.

## Benchmarks y rendimiento

Resultados servidos con el motor basal en una NVIDIA H100 80GB HBM3 (bf16), comparados con basal-1.5-max (11B) sobre los mismos ítems y clientes:

| Benchmark | basal-omni-1.0-max (12B) | basal-1.5-max (11B) |
|---|---|---|
| Werdykt v1, macro (PL + EN oculto, 10 categorías × 2 idiomas) | 0,823 | 0,773 |
| Decisiones PL (test held-out de basal-1.0, 7.081 ítems) | 0,954 | 0,940 |
| PL general (conocimiento, exámenes, lectura; 3.079 ítems) | 0,810 | 0,797 |
| PL-Real (300 documentos polacos reales) | 0,980 | 0,970 |
| Panel externo EN (10 tareas públicas, 3.842 ítems) | 0,789 | 0,737 |
| Cobertura a 1% de error (con umbral de serie) | 47,4% | 62,2% |

Precisión por longitud del estado en Werdykt (5.000 ítems, PL y EN):

| Longitud del estado | Ítems | Precisión |
|---|---|---|
| 0-1k caracteres | 709 | 72,2% [69, 75] |
| 1k-2k | 2.598 | 80,6% [79, 82] |
| 2k-4k | 796 | 94,0% [92, 95] |
| 4k-8k | 394 | 98,0% [96, 99] |
| 8k-16k | 128 | 85,2% [78, 90] |
| 16k+ | 375 | 70,7% [66, 75] |

Familia de documentos largos (misma tarea, solo varía la longitud): 8k-20k → 79,6% (226 ítems); 20k-30k → 74,2% (194); 30k+ → 58,8% (80).

Precisión por longitud del prompt en tokens (tests held-out): en decisiones PL, 93,8% (0-255 tokens), 97,3% (256-511), 95,9% (512-1.023) y 100,0% (1.024-2.047); en el corpus EN, en torno al 72,4-72,6% en todos los tramos; en PL-Real, 97,3% (1.024-2.047) y 99,1% (2.048-4.095).

## Requisitos de hardware

- VRAM estimada: en bf16, los 11,96B parámetros ocupan aproximadamente 24 GB de pesos, más overhead de activaciones y KV cache; se recomienda una GPU de 40 GB o superior para servicio cómodo. El autor reporta ejecución en una H100 80GB HBM3.
- GPU recomendadas: NVIDIA H100 80GB (configuración de referencia del autor), A100 80GB. Una RTX 4090 de 24 GB queda al límite en bf16 y requeriría cuantización, cuyo soporte no está documentado en la información disponible.
- Cabe en GPU de consumo: no confirmado; sin datos de cuantización publicados no puede garantizarse en GPUs de 24 GB o menos.
- Opciones de despliegue: motor basal (`basal-serve`, instalación vía `uv` con PyTorch 2.11.0 y CUDA 12.8, extra `basal[media]`); compatible con `transformers` y con endpoints. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explícita; el diseño de un solo forward pass sin generación de texto reduce la latencia frente a modelos generativos, pero no se publican cifras de tokens/s ni de peticiones/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.0-max | 12B | No disponible | Decisión tipada calibrada, multimodal zero-shot | Apache 2.0 | HuggingFace |
| basal-1.5-max | 11B (base Bielik) | No disponible | Decisión tipada calibrada, solo texto, 10 opciones | No disponible en la información | HuggingFace |
| google/gemma-4-12B-it | 12B | No disponible | LLM generativo multimodal instruction-tuned | Términos de Gemma | HuggingFace |

Frente a basal-1.5-max, basal-omni-1.0-max mejora en Werdykt (+5,0 puntos), en el panel externo inglés (+5,2) y en decisiones polacas (+1,4), pero obtiene menor cobertura automática al 1% de error con el umbral de serie (47,4% frente a 62,2%). Frente a su modelo base Gemma 4, la diferencia es de propósito: basal-omni no genera texto libre, sino que restringe la salida a opciones y calibra la probabilidad.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal, con entrenamiento solo en texto y capacidades multimedia zero-shot sin garantías.
- Categoría de reglas muy débil (0,418 en Werdykt): umbrales, fechas y cálculos exactos deben resolverse en código, no delegarse al modelo.
- Caída acusada en documentos muy largos: 58,8% de precisión en estados de más de 30k caracteres y 70,7% en el tramo de 16k+.
- Cobertura automática limitada: al 1% de error, solo el 47,4% de las preguntas se deciden automáticamente con el umbral de serie; las preguntas de tipo `score` se derivan a una persona si no hay umbral certificado.
- Idiomas restringidos a polaco e inglés; no hay evidencia de comportamiento en castellano.
- Riesgo de calibración incorrecta fuera de la distribución de entrenamiento (decisiones tipadas PL/EN), lo que puede producir confianza mal estimada.
- No selecciona argumentos de herramientas, solo la herramienta; no sustituye a un generador para tool calling completo.
- Sin datos publicados de cuantización ni de latencia, lo que dificulta planificar despliegues en hardware de consumo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede arrastrar condiciones adicionales de Google que conviene verificar antes de producción.

## Enlaces

- HuggingFace: https://huggingface.co/Remek/basal-omni-1.0-max
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
