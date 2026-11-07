# Ailiance-fr/qwen3-4b-mascarade-freecad-lora

## Resumen

`Ailiance-fr/qwen3-4b-mascarade-freecad-lora` es un adaptador LoRA de tipo SFT (supervised fine-tuning) publicado por Ailiance-fr sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` de Alibaba Qwen. El adaptador está orientado a tareas de dominio de diseño asistido por ordenador, concretamente a FreeCAD, dentro del ecosistema "mascarade" del autor, que agrupa varios adaptadores especializados que comparten el mismo modelo base con configuración LoRA de rango 16 y alpha 32.

El repositorio es muy ligero (0,2 GB), lo que confirma que se trata únicamente del adaptador y no de los pesos completos del modelo. La model card declara explícitamente que el adaptador no ha sido evaluado todavía con el pipeline `electron-bench` (que solo soporta la base `gemma-4-E4B`) y que los benchmarks funcionales previstos están pendientes. El único resultado publicado es un test funcional de `iact-bench` Phase 8 con 10 muestras que arroja una tasa de éxito del 0,0 % en validadores Docker de FreeCAD, un dato relevante y limitante que debe tenerse en cuenta.

La relevancia del modelo es acotada: sirve como ejemplo de fine-tuning de dominio sobre Qwen3-4B-Instruct-2507, un modelo de 4 000 millones de parámetros con ventana de contexto larga y capacidades generales notables según los benchmarks oficiales del modelo base. No obstante, la falta de evaluación funcional positiva y la ausencia de datos de entrenamiento detallados limitan su uso en producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3); adaptador LoRA sobre modelo base |
| Parametros totales | 4 000 millones (modelo base Qwen3-4B-Instruct-2507); adaptador LoRA r=16, alpha=32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estandar de la familia Qwen3) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de 4 000 millones de parámetros. El fine-tuning se realizó con SFT mediante la librería TRL (versión 1.4.0), con Transformers 5.8.0, PyTorch 2.11.0, Datasets 4.8.5 y Tokenizers 0.22.2. Según la información del autor, el entrenamiento se completó con el entrenador LoRA estándar `mlx-lm` con rango 16, alpha 32, escala 2.0, optimizador AdamW, learning rate 1e-5 y 500 iteraciones. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, aunque se referencia `Ailiance-fr/mascarade-freecad-dataset` como origen de las muestras de evaluación.

No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá del propio fine-tuning LoRA. La model card indica que el adaptador modifica menos del 1 % de los pesos del modelo base, por lo que las capacidades generales heredadas del base se mantienen aproximadamente y el adaptador añade especialización de dominio. No se reporta uso de RLHF ni DPO en el proceso.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3-4B-Instruct-2507.
- Especialización declarada en tareas de FreeCAD (diseño paramétrico, scripting y flujos CAD), aunque sin validación funcional positiva publicada.
- Soporte de tool calling y function calling heredado del modelo base (BFCL-v3: 61,9 en el base).
- Capacidades de agente y razonamiento multi-paso heredadas del base (TAU1-Retail: 48,7; TAU2-Retail: 40,4).
- Capacidades multilingües heredadas del base (MultiIF: 69,0; MMLU-ProX: 61,6; INCLUDE: 60,1).
- Capacidades de código heredadas del base (LiveCodeBench v6: 35,1; MultiPL-E: 76,8; Aider-Polyglot: 12,9).
- No se documentan capacidades de visión, audio ni modo "thinking" específicas para este adaptador.

## Casos de uso

- Asistencia en scripting de FreeCAD: el adaptador se entrenó sobre un dataset de FreeCAD y podría emplearse para generar macros en Python para FreeCAD, si bien la tasa de éxito del 0,0 % en el validador funcional obliga a validar cada salida antes de usarla.
- Prototipado de pipelines CAD asistidos por IA: útil como punto de partida para experimentar con fine-tuning de dominio sobre Qwen3-4B en entornos de diseño paramétrico, con la salvedad de que requiere evaluación propia.
- Investigación sobre adaptadores LoRA de dominio: sirve como referencia metodológica de SFT con TRL y mlx-lm (r=16, alpha=32, AdamW, 500 iteraciones) para reproducir o comparar experimentos.
- Generación de documentación técnica de FreeCAD: el modelo base tiene buen rendimiento en escritura (Creative Writing v3: 83,5; WritingBench: 83,4) y el adaptador podría orientarse a explicar flujos de trabajo CAD, aunque sin validación específica.
- Tareas de razonamiento general en producción: al heredar el base, puede usarse para clasificación, extracción y resumen en aplicaciones donde no se requiera la especialización CAD, con la ventaja de su tamaño reducido (4B).
- Integración en entornos con recursos limitados: al ser un adaptador de 0,2 GB sobre un modelo de 4B, es viable desplegarlo en GPUs de consumo si se cuantiza el base, para pruebas de concepto y desarrollo local.
- Evaluación comparativa de adaptadores: útil para estudiar el impacto de LoRA de rango 16 sobre un modelo de 4B en tareas de dominio, comparando con el base sin adaptador.

## Benchmarks y rendimiento

Resultados del adaptador publicados por el autor (iact-bench Phase 8, 2026-05-11, validadores Docker de FreeCAD, 10 muestras, seed=101):

| Metrica | Valor |
|---|---:|
| Validador | `ghcr.io/electron-rare/iact-bench-freecad:latest` |
| Muestras | 10 |
| Tasa de exito | 0,0 |
| Tiempo total de validacion | 0,0 s |

Resultados oficiales del modelo base `Qwen/Qwen3-4B-Instruct-2507` (heredados, no medidos sobre el adaptador):

| Categoria | Benchmark | Qwen3-4B-Instruct-2507 |
|---|---|---:|
| Conocimiento | MMLU-Pro | 69,6 |
| Conocimiento | MMLU-Redux | 84,2 |
| Conocimiento | GPQA | 62,0 |
| Conocimiento | SuperGPQA | 42,8 |
| Razonamiento | AIME25 | 47,4 |
| Razonamiento | HMMT25 | 31,0 |
| Razonamiento | ZebraLogic | 80,2 |
| Razonamiento | LiveBench 2024-11-25 | 63,0 |
| Codigo | LiveCodeBench v6 | 35,1 |
| Codigo | MultiPL-E | 76,8 |
| Codigo | Aider-Polyglot | 12,9 |
| Alineacion | IFEval | 83,4 |
| Alineacion | Arena-Hard v2 | 43,4 |
| Alineacion | Creative Writing v3 | 83,5 |
| Alineacion | WritingBench | 83,4 |
| Agente | BFCL-v3 | 61,9 |
| Agente | TAU1-Retail | 48,7 |
| Agente | TAU1-Airline | 32,0 |
| Agente | TAU2-Retail | 40,4 |
| Multilingue | MultiIF | 69,0 |
| Multilingue | MMLU-ProX | 61,6 |
| Multilingue | INCLUDE | 60,1 |
| Multilingue | PolyMATH | 31,1 |

El autor advierte que estas cifras corresponden al modelo base sin modificar y que el adaptador LoRA de rango 16 modifica menos del 1 % de los pesos, por lo que deben interpretarse como suelo de capacidad, no como rendimiento del adaptador. No hay benchmarks del adaptador en tareas generales ni en FreeCAD más allá del test funcional citado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B requiere aproximadamente 8 GB en FP16, 4-5 GB en cuantización de 8 bits y 2,5-3 GB en 4 bits (estimaciones estándar para un modelo de 4B; no confirmadas en la información proporcionada). El adaptador LoRA añade un consumo marginal (0,2 GB en disco).
- GPU recomendadas: A100, H100 o L40S para despliegue en FP16 con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para FP16 en una sola GPU; RTX 3060 12 GB o superiores para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 u 8 bits en GPUs con 6-8 GB o más; en FP16 requiere al menos 8-10 GB de VRAM.
- Opciones de despliegue: transformers (con `pipeline`), TRL para entrenamiento, vLLM y TGI para servido en producción (compatibles con modelos Qwen3), llama.cpp y Ollama para cuantizaciones GGUF (requiere fusionar el adaptador con el base y convertir), y mlx-lm para entornos Apple Silicon.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Ailiance-fr/qwen3-4b-mascarade-freecad-lora` | 4B (base) + LoRA r=16 | no disponible | Apache 2.0 | Adaptador de dominio FreeCAD; sin evaluación funcional positiva publicada (0,0 % en iact-bench) |
| `Qwen/Qwen3-4B-Instruct-2507` | 4B | no disponible en la información | Apache 2.0 | Modelo base; benchmarks oficiales sólidos en conocimiento, razonamiento y código |
| `gemma-4-E4B` (referenciado por el autor) | no disponible | no disponible | no disponible | Base soportada por `electron-bench`; el autor publica una matriz base-vs-LoRA comparativa |
| Otros adaptadores "mascarade" de Ailiance | 4B (base) + LoRA r=16 | no disponible | Apache 2.0 | Misma configuración LoRA (r=16, alpha=32); orientados a otros dominios |

No se dispone de datos suficientes para comparar rendimiento del adaptador con alternativas de la misma categoría (adaptadores LoRA de dominio CAD), ya que no se han publicado resultados funcionales positivos.

## Limitaciones y advertencias

- El único benchmark funcional publicado arroja una tasa de éxito del 0,0 % en 10 muestras con el validador Docker de FreeCAD, lo que indica que el adaptador no supera la validación de compilación/ejecución en ese entorno.
- El adaptador no ha sido evaluado con `electron-bench` (el pipeline solo soporta la base `gemma-4-E4B`), por lo que no hay métricas de perplejidad ni comparación con el base en tareas generales.
- No se documentan los datos de entrenamiento (número de tokens, composición, filtrado), lo que impide evaluar sesgos y cobertura del dominio.
- No se especifican los idiomas soportados por el adaptador; las capacidades multilingües son las heredadas del base y no están validadas tras el fine-tuning.
- Riesgo de alucinación inherente al modelo base, agravado en un dominio técnico como FreeCAD donde las APIs y sintaxis son específicas y verificables solo mediante ejecución.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento del adaptador en producción.
- La model card contiene referencias a infraestructura y benchmarks del ecosistema del autor (iact-bench, electron-bench, ailiance-bench) que no están verificados de forma independiente.
- El adaptador modifica menos del 1 % de los pesos del base, por lo que la especialización es limitada y puede no ser suficiente para tareas CAD complejas.

## Enlaces

- Hugging Face: https://huggingface.co/Ailiance-fr/qwen3-4b-mascarade-freecad-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Página del autor (familia mascarade): https://www.ailiance.fr/models/ailiance/mascarade
- Repositorio TRL: https://github.com/huggingface/trl
- Issues de ailiance-bench: https://github.com/ailiance/ailiance-bench/issues
- Matriz base-vs-LoRA: https://github.com/ailiance/ailiance-bench/blob/main/bench-results/compare_base_vs_lora.md
- iact-bench: https://github.com/electron-rare/iact-bench
- Dataset de entrenamiento referenciado: `Ailiance-fr/mascarade-freecad-dataset` (no se proporciona URL directa en la información disponible)
