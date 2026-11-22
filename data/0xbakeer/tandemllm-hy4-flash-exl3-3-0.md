# 0xBakeer/TandemLLM-Hy4-flash-EXL3-3.0

## Resumen

TandemLLM-Hy4-flash-EXL3-3.0 es una cuantización EXL3 del modelo Hy4-flash de Tencent, publicada por el usuario 0xBakeer bajo el paraguas del proyecto TandemLLM. Se trata de un empaquetado de pesos de 103,1 GB que promedia 3,08 bits por peso en las capas cuantizadas, pensado para servir el modelo original en hardware con memoria limitada mediante el motor de inferencia TandemEngine. El modelo base es un transformer híbrido con mezcla de expertos (MoE) de 220.000 millones de parámetros declarados por Tencent, de los cuales 63.500 millones residen en las tablas Engram y solo 11.300 millones se activan por token de texto.

La relevancia de este pack es doble. Por un lado, demuestra que es posible comprimir un MoE de gran tamaño con tablas de búsqueda hasheada (Engram) y un drafter especulativo integrado (DFly2) manteniendo una divergencia KL baja respecto al checkpoint BF16 de referencia. Por otro, expone las limitaciones del ecosistema: exllamav3 estándar no carga estos pesos sin un parche específico que añade la arquitectura y el formato de las tablas Engram, y el autor solo garantiza el servicio a través de su propio motor, TandemEngine.

El contexto nativo del modelo es de 1.048.576 tokens, aunque TandemEngine sirve hasta 262.144. La licencia es la Tencent HY License, no estándar y con posibles restricciones para uso comercial, lo que conviene verificar antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con capas densas, 41 capas MoE y 1 capa MLP densa; incluye tablas Engram y drafter DFly2 |
| Parametros totales | 220.000 millones (según model card de Tencent); 31.007.576.374 en safetensors del pack cuantizado |
| Parametros activos | 11.300 millones por token de texto |
| Longitud de contexto | 1.048.576 tokens nativos; 262.144 servidos por TandemEngine |
| Tipos de cuantizacion | EXL3 a 3,08 bits por peso de media; expertos enrutados e indexer a 3 bits; atención, expertos compartidos, proyecciones latentes y densas, cabeza de salida y torre de visión a 5 bits; tablas Engram a 5 bits; embeddings, normas y proyecciones Engram en BF16; router en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Tencent HY License (license_name: tencent-hy-license) |
| Formato de pesos | safetensors (EXL3), librería exllamav3 |

## Arquitectura y entrenamiento

El modelo base Hy4-flash, desarrollado por Tencent, es un transformer de 42 capas compuesto por una capa MLP densa y 41 capas de mezcla de expertos. Cada capa MoE contiene 512 expertos enrutados, de los cuales 16 se activan por token, más un experto compartido. Cuatro de las capas incorporan además filas de una tabla Engram: una búsqueda hasheada sobre los dos o tres últimos tokens con aproximadamente 165 millones de filas de 96 valores cada una, lo que constituye una forma de memoria asociativa explícita que complementa el cómputo denso. El modelo integra un drafter especulativo DFly2 de 5 capas para decodificación especulativa.

El pack EXL3 fue generado a partir del checkpoint BF16 de Tencent en la revisión `d88c9dfd`, usando exllamav3 1.6.7 junto con un parche que añade soporte para esta arquitectura y para los ficheros de tablas Engram. El parche cubre conversión y scoring, pero no incluye un generador; el autor sirve los pesos con TandemEngine. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens vistos, ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y completado de texto en plantilla de chat, con modo de razonamiento (thinking) activable o desactivable.
- Razonamiento multi-paso y decodificación especulativa mediante el drafter DFly2 integrado, que acelera la generación greedy.
- Procesamiento de contexto muy largo (hasta 1.048.576 tokens nativos), adecuado para documentos extensos o conversaciones prolongadas.
- Capacidad de visión: el pack incluye una torre de visión cuantizada a 5 bits, lo que implica soporte multimodal en el modelo base.
- Memoria asociativa mediante tablas Engram, que actúan como lookup hasheado sobre secuencias cortas de tokens.
- No se ha confirmado en la información disponible soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso más allá del uso como agente de codificación observado en los ejemplos del autor.
- Idiomas soportados no especificados en la documentación disponible.

## Casos de uso

- Asistencia conversacional de contexto largo: el modelo puede mantener diálogos multi-turno sobre documentación extensa gracias a su ventana de hasta 262.144 tokens en TandemEngine, útil para soporte técnico especializado donde el historial completo debe permanecer en contexto.
- Generación de código en agentes de programación: el autor documenta su uso con opencode para construir páginas HTML con three.js a partir de prompts en lenguaje natural, lo que lo sitúa como candidato para tareas de generación de código front-end y prototipado rápido.
- Análisis de documentación técnica extensa: con contexto de un millón de tokens nativo, puede ingerir manuales, especificaciones o bases de código completas en una sola pasada sin recuperación externa.
- Procesamiento multimodal de documentos: la presencia de torre de visión permite extraer información de capturas, diagramas o páginas escaneadas combinadas con texto.
- Despliegue en hardware de memoria limitada: el pack de 103,1 GB cabe en una única DGX Spark (GB10, 128 GB), lo que habilita servir un MoE de 220.000 millones en una estación de trabajo sin clúster multi-GPU.
- Evaluación de técnicas de cuantización: investigadores pueden comparar este pack de 3,08 bits con el de 3,5 bits del mismo autor para estudiar el impacto de la compresión en la divergencia KL y la perplejidad.
- Experimentación con decodificación especulativa: el drafter DFly2 integrado permite medir ganancias de throughput en pipelines de inferencia propios.

## Benchmarks y rendimiento

El autor publica métricas de calidad de la cuantización frente al checkpoint BF16 de referencia, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Los conjuntos son 16 filas de 2.048 tokens (32.768 posiciones) en plantilla de chat con thinking desactivado.

| Conjunto | KL media | KL mediana | Top-1 | Top-5 | Perplejidad referencia | Perplejidad pack |
|---|---|---|---|---|---|---|
| chat2048 (wikitext-2, filas 70-85) | 0,0989 | 0,0287 | 88,52 % | 99,41 % | 8,12 | 8,36 |
| conv2048 (UltraChat test, held-out) | 0,1113 | 0,0065 | 92,11 % | 99,16 % | 7,42 | 7,31 |

El suelo metodológico de la comparación se sitúa entre KL 0,003 y 0,005, medido comparando el forward propio en FP32 contra el código transformers del modelo. El pack de 3,5 bits del mismo autor obtiene KL 0,065 en chat2048 y 0,073 en conv2048, con top-1 de 90,5 % y 93,8 % respectivamente, a cambio de 8,65 GiB adicionales.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. El autor tampoco ha ejecutado todavía la medición de velocidad en DGX Spark para este pack concreto.

## Requisitos de hardware

- VRAM estimada: 103,1 GB de pesos en EXL3 a 3,08 bits; el contexto adicional (KV cache para hasta 262.144 tokens) requiere memoria extra no cuantificada en la documentación.
- GPU recomendadas: el autor valida el despliegue en una DGX Spark (GB10, 128 GB). No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en consumer GPU: no, el tamaño de pesos excede la VRAM de cualquier GPU de consumo actual (máximo 24-32 GB en RTX 4090/5090). Requiere hardware con 128 GB unificados o múltiples GPUs de datacenter.
- Opciones de despliegue: TandemEngine (motor del autor, único soportado oficialmente). exllamav3 1.6.7 con el parche de `convert/` permite conversión y scoring, pero no generación. vLLM, llama.cpp, Ollama y TGI no soportan esta arquitectura según la información disponible.
- Latencia y throughput: no medidos para este pack. El autor indica que la medición en DGX Spark con prompt de 3.565 tokens y 600 tokens greedy está pendiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TandemLLM-Hy4-flash-EXL3-3.0 (este) | 220B totales, 11,3B activos | 1.048.576 nativo / 262.144 servido | EXL3 3,08 bpw, 103,1 GB | Tencent HY License | Hugging Face, requiere TandemEngine |
| TandemLLM-Hy4-flash-EXL3-3.5 | 220B totales, 11,3B activos | 1.048.576 nativo | EXL3 3,56 bpw, 112,4 GB | Tencent HY License | Hugging Face, requiere TandemEngine |
| Qwen3.8-Flash-Next (pack EXL3 público, rama 3.05bpw_h5_ng5) | no disponible | no disponible | EXL3 3,05 bpw | no disponible | Hugging Face |
| tencent/Hy4-flash (BF16 original) | 220B totales, 11,3B activos | 1.048.576 | BF16 | Tencent HY License | Hugging Face |

La comparativa se limita a los modelos mencionados en la documentación del autor. No se dispone de datos de rendimiento en tareas estándar para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- El pack no carga en exllamav3 estándar: requiere el parche de `convert/` para conversión y scoring, y TandemEngine para generación. Esto limita la portabilidad y ata el despliegue al ecosistema del autor.
- La licencia Tencent HY License no es una licencia open source estándar; es responsabilidad del usuario verificar las condiciones de uso comercial antes de desplegar el modelo en producción.
- La cuantización a 3,08 bits introduce divergencia respecto al modelo original: KL media de 0,099 en chat2048 y 0,111 en conv2048, con top-1 por debajo del 93 %. El autor recomienda el pack de 3,5 bits salvo que la memoria sea crítica.
- La distribución de errores es asimétrica: en conv2048 el 1 % de posiciones más difíciles supera KL 1,93, lo que puede traducirse en fallos puntuales en generaciones sensibles.
- La perplejidad del pack en conv2048 es inferior a la de la referencia (7,31 frente a 7,42), un comportamiento anómalo que el autor no ha investigado y que aconseja cautela al interpretar las métricas.
- No hay información sobre sesgos, idiomas soportados ni evaluación de alucinación del modelo base.
- El rendimiento en velocidad no se ha medido para este pack; no hay datos de latencia ni throughput publicados.
- El número de descargas (4) y likes (1) es muy bajo, lo que indica escasa validación comunitaria.
- El contexto servido por TandemEngine (262.144 tokens) es una cuarta parte del contexto nativo del modelo, lo que puede limitar casos de uso que requieran la ventana completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xBakeer/TandemLLM-Hy4-flash-EXL3-3.0
- Pack EXL3 3.5 del mismo autor: https://huggingface.co/0xBakeer/TandemLLM-Hy4-flash-EXL3-3.5
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Motor de inferencia TandemEngine: https://github.com/TandemLLM/TandemEngine
- Dataset de ejemplos y prompts: https://huggingface.co/datasets/0xBakeer/TandemLLM-Hy4-flash-examples
- Prompt de ejemplo (gasolinera neón): https://huggingface.co/datasets/0xBakeer/TandemLLM-Hy4-flash-examples/resolve/main/prompts/gas-station.txt
- Prompt de ejemplo (jardín de pagoda): https://huggingface.co/datasets/0xBakeer/TandemLLM-Hy4-flash-examples/resolve/main/prompts/pagoda-garden.txt
- Agente de codificación opencode: https://opencode.ai
