# goodmai/Ornith-1.5-9B-MACaQ-MXFP4-MLX

## Resumen

Ornith-1.5-9B-MACaQ-MXFP4-MLX es un checkpoint cuantizado en 4 bits del modelo Ornith-1.5-9B, publicado por el usuario goodmai y orientado exclusivamente a Apple Silicon mediante MLX y el runtime Basalt. El modelo parte de `ornith-ai/Ornith-1.5-9B-MLX-4bit`, ya de por sí una cuantización de 4 bits, y le aplica el algoritmo MACaQ (Model Agnostic Calibrated Quantization, arXiv:2611.10649) para producir pesos MXFP4 (E2M1 con exponentes E8M0 cribados y group_size=32). La familia arquitectónica declarada es `qwen3_5`, de tipo texto.

El interés de esta ficha no reside tanto en el modelo base como en la técnica de cuantización calibrada: MACaQ combina balance de canales, una rotación Sylvester Walsh-Hadamard de bloque (B=32) y un refinamiento por descenso de coordenadas sobre un conjunto activo guiado por la Hessiana, que según la model card reduce la pérdida Hessiana un 39,5 % respecto a la cuantización de partida. El resultado es un checkpoint de 4,85 GB que, medido en un Apple M4 Pro de 24 GB, alcanza unos 50,9 tokens por segundo con un TTFT de 0,132 s.

Es relevante ahora porque demuestra que es posible aplicar cuantización de precisión ultra-baja calibrada sobre hardware de consumo Apple, con un runtime nativo Metal que implementa la transformada de Walsh-Hadamard sin barreras de sincronización. No obstante, hay que subrayar que el número de parámetros reales del checkpoint (3.122.704.896) no coincide con el "9B" del nombre comercial, lo que sugiere que el etiquetado procede del modelo base original y no del artefacto empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia `qwen3_5` (tipo texto) |
| Parametros totales | 3.122.704.896 (según safetensors del checkpoint) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (E2M1 + E8M0 cribado, group_size=32); cuantización calibrada MACaQ v1 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4-bit |

## Arquitectura y entrenamiento

La arquitectura del modelo base corresponde a la familia `qwen3_5`, un transformer denso de tipo texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original; la model card del checkpoint cuantizado no documenta estos detalles.

La innovación técnica destacable de este artefacto es el pipeline MACaQ implementado en Swift/Metal por Basalt: primero se aplica un balance de canales con $p_j = \mathrm{std}(W_{:,j})^{0.75} / \mathrm{rms}(X_{:,j})^{0.25}$ para igualar los rangos dinámicos de pesos y activaciones; después se rota el bloque con una trama Sylvester Walsh-Hadamard de tamaño 32; y finalmente se refina el código mediante descenso de coordenadas discreto $\pm 1$ sobre un conjunto activo, minimizando $\mathrm{tr}(\Delta W\, H'\, \Delta W^\top)$ con cribado de exponentes E8M0 ponderado por la Hessiana. El proceso de conversión tardó 1405,2 s en un M4 Pro de 24 GB y realizó 182.451.530 flips de código sobre 200 capas.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y generación de texto abierto, a juzgar por la salida de ejemplo de la model card (ensayo estructurado sobre modelos open source).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados en la model card).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Servido mediante API compatible con OpenAI y MCP a través de `basalt serve`.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint está diseñado para ejecutarse en Metal mediante MLX y Basalt, con un consumo de memoria activa medido de 4600 MB en un M4 Pro de 24 GB, lo que permite desplegarlo en portátiles y equipos de sobremesa Apple sin GPU dedicada.
- Asistentes conversacionales offline: la etiqueta `conversational` y el pipeline de generación de texto lo hacen adecuado para chat local con privacidad de datos, siempre que se valide la calidad del modelo base en la tarea concreta.
- Generación de documentación técnica y borradores: la salida de ejemplo muestra capacidad de estructurar texto con encabezados y secciones, útil para borradores de artículos, READMEs o notas internas.
- Prototipado rápido de aplicaciones LLM en macOS: al exponer una API compatible con OpenAI vía Basalt, se puede integrar en herramientas que ya hablan ese protocolo sin reescribir el cliente.
- Evaluación de técnicas de cuantización: investigadores que estudien MACaQ, rotaciones Hadamard o MXFP4 pueden usar este checkpoint como referencia reproducible frente a la cuantización RTN de 3 bits, que obtuvo perplejidad 8,096 frente a la fuente.
- Servicio de inferencia en edge para equipos Apple: con ~50,9 tok/s y TTFT de 0,132 s en M4 Pro, es viable para tareas interactivas de baja concurrencia en entornos de desarrollo o demos.

## Benchmarks y rendimiento

| Metrica | Fuente (`Ornith-1.5-9B-MLX-4bit`) | 3-bit RTN | `Ornith-1.5-9B-MACaQ-MXFP4-MLX` |
|---|---:|---:|---:|
| Tamano del checkpoint | 4,69 GB | 3,58 GB | 4,85 GB |
| Perplejidad (1025 tokens reservados) | 6,125 | 8,096 | no reportada numéricamente (calibrada con E8M0 + flips Hessianos) |
| Bloque Hadamard | — | — | B = 32 |
| Tiempo de conversión (M4 Pro 24 GB) | — | — | 1405,2 s |

Rendimiento de generación medido en Apple M4 Pro 24 GB (3 iteraciones, 80 tokens, warmup activado):

| Metrica | Avg | Min | Max | σ |
|---|---:|---:|---:|---:|
| TPS (tok/s) | 50,901 | 50,893 | 50,916 | 0,011 |
| TTFT (s) | 0,132 | 0,131 | 0,132 | 0,001 |
| GenTime (s) | 1,713 | 1,712 | 1,714 | 0,001 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La pérdida Hessiana se redujo un 39,5 % durante la conversión.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 4600 MB de memoria activa medida en M4 Pro 24 GB; el checkpoint ocupa 4,85 GB en disco (4,49 GB de bytes efectivos).
- GPU recomendadas: Apple Silicon con Metal y MLX (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple con al menos ~6 GB de memoria unificada disponible; validado en M4 Pro de 24 GB.
- Opciones de despliegue: Basalt (`basalt serve`, API compatible con OpenAI + MCP), runtime MLX. vLLM, llama.cpp, Ollama y TGI no están soportados según la información disponible (formato MLX/Metal).
- Latencia y throughput: ~50,9 tok/s y TTFT ~0,132 s en M4 Pro 24 GB; no hay datos para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-9B-MACaQ-MXFP4-MLX | 3,12 B (checkpoint) | no disponible | MXFP4 MACaQ | 50,9 tok/s en M4 Pro; PPL no reportada | Apache 2.0 | MLX / Basalt |
| Ornith-1.5-9B-MLX-4bit (fuente) | no disponible | no disponible | 4-bit MLX | PPL 6,125 (1025 tokens) | Apache 2.0 (según base) | MLX |
| Ornith-1.5-9B 3-bit RTN | no disponible | no disponible | 3-bit RTN | PPL 8,096; 3,58 GB | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma familia o tamaño en la documentación proporcionada.

## Limitaciones y advertencias

- El nombre comercial indica "9B" pero el checkpoint contiene 3.122.704.896 parámetros según safetensors; conviene verificar el modelo base antes de planificar recursos.
- La perplejidad del checkpoint MACaQ no se reporta numéricamente; solo se indica que se aplicó calibración E8M0 y flips Hessianos. No es posible comparar directamente con la fuente (6,125) ni con RTN 3-bit (8,096).
- Es una cuantización de una cuantización: parte de un checkpoint ya en 4 bits, por lo que la degradación acumulada puede ser mayor que en una cuantización directa desde FP16.
- Solo funciona en Apple Silicon con MLX/Basalt; no hay soporte para CUDA, vLLM, llama.cpp ni Ollama según la información disponible.
- No se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar comportamiento multilingüe o conversaciones de contexto largo.
- Riesgo de alucinación y sesgos: no documentado en la model card; debe evaluarse empíricamente antes de uso en producción.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base `ornith-ai/Ornith-1.5-9B-MLX-4bit` y de la familia `qwen3_5` subyacente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 17 de noviembre de 2026) sin validación comunitaria.
- El proceso de conversión MACaQ tardó ~23 minutos en M4 Pro; reproducirlo en hardware inferior puede ser inviable.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/Ornith-1.5-9B-MACaQ-MXFP4-MLX
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-4bit
- Paper MACaQ: https://arxiv.org/abs/2611.10649
- Repositorio Basalt: https://github.com/goodmai/basalt
- Sitio web Basalt: https://bas-alt.vercel.app
- Demo "Run with Basalt": https://huggingface.co/spaces/goodmai/run-with-basalt?model=goodmai%2FOrnith-1.5-9B-MACaQ-MXFP4-MLX
