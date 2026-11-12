# brainworkup/LFM2.5-24B-A2B-oQ4e-fp16

## Resumen

LFM2.5-24B-A2B-oQ4e-fp16 es una cuantización mixta de 4 bits del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario brainworkup. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos pensada para ejecución en Apple Silicon mediante la librería MLX. El checkpoint resultante ocupa 14,0 GB en el repositorio y emplea una media efectiva de 4,672 bits por peso.

El modelo base pertenece a la familia LFM2.5 de Liquid AI y, por el sufijo "A2B", se infiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 2.000 millones de parámetros activos sobre un total de 23.972 millones. El checkpoint contiene únicamente el modelo de lenguaje, sin componentes multimodales en los pesos publicados.

La relevancia de esta ficha es acotada: se trata de una conversión comunitaria sin métricas de rendimiento publicadas, sin licencia declarada en el repositorio y sin información sobre idiomas o pipeline. Resulta útil para quienes quieran ejecutar el modelo base en Macs con memoria unificada, pero no sustituye la referencia oficial del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2.5 MoE (según tag `lfm2_moe`); detalles internos no disponibles |
| Parámetros totales | 23.971.587.712 (23,972B) |
| Parámetros activos | ~2B (inferido del sufijo "A2B"; no confirmado en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta oQ: affine 4-bit grupo 64 (95,743% de pesos), affine 8-bit grupo 64 (4,234%), FP16 (0,022%), FP32 (0,000%) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 4-bit mixto, media efectiva 4,672 bits/peso |
| Tamaño del repositorio | 14,0 GB (13,999 GB / 13,038 GiB) |
| Librería | mlx |
| Modelo base | LiquidAI/LFM2.5-24B-A2B |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá del tag `lfm2_moe`, que indica una mezcla de expertos dentro de la familia LFM2.5 de Liquid AI. El número de parámetros totales (23,972B) y el sufijo "A2B" sugieren un diseño MoE con aproximadamente 2B de parámetros activos por token, aunque esta cifra no aparece confirmada en la información proporcionada.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. La model card del checkpoint cuantizado no incluye ninguna referencia al entrenamiento original, únicamente describe el proceso de cuantización.

La innovación técnica documentada se limita al proceso de cuantización: se aplicó oQ (oMLX v0.7.3) con precisión mixta, asignando 4 bits a la gran mayoría de pesos (22,951B) y 8 bits a un subconjunto reducido (1,015B), presumiblemente capas sensibles a la cuantización. El checkpoint fue re-cuantizado el 2026-11-02, por lo que versiones anteriores deben descartarse.

## Capacidades

- Generación de texto: el checkpoint contiene únicamente el modelo de lenguaje (23,972B de pesos, sin componentes adicionales), por lo que la generación de texto es la capacidad principal.
- Razonamiento y matemáticas: no hay información específica publicada sobre el rendimiento en estas tareas.
- Generación de código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados en el repositorio).
- Capacidades especiales (visión, audio, thinking mode): no disponible; el desglose de almacenamiento indica solo "Language model".

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y ocupa 14 GB, por lo que puede cargarse en Macs con 24 GB o más de memoria unificada para experimentación con el modelo base sin depender de GPUs dedicadas.
- Prototipado de aplicaciones de texto en macOS: al ejecutarse con MLX, permite integrar generación de texto en herramientas nativas de macOS con latencia razonable para un modelo de ~24B totales y ~2B activos.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad de una cuantización mixta 4/8 bits frente al checkpoint original en FP16/BF16 de LiquidAI.
- Fine-tuning ligero o adaptación con LoRA: el formato safetensors MLX permite cargar los pesos y aplicar adaptadores sobre la versión cuantizada, aunque la calidad puede resentirse frente al modelo completo.
- Investigación sobre eficiencia de MoE: el reparto 95,7% a 4 bits y 4,2% a 8 bits ofrece un caso de estudio sobre qué capas requieren mayor precisión en modelos MoE.
- Despliegue en estaciones de trabajo con memoria unificada: para entornos donde no hay GPU NVIDIA pero sí un Mac Studio con memoria suficiente, este checkpoint evita la conversión manual desde el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~14 GB solo para los pesos; con overhead de contexto y caché KV, se recomienda un mínimo de 20-24 GB de memoria unificada.
- GPU recomendadas: Apple Silicon exclusivamente (formato MLX). No es compatible de forma nativa con CUDA.
- ¿Cabe en consumer GPU? No en el sentido habitual: requiere Apple Silicon con memoria unificada. En Macs con 16 GB no cabría con margen; con 24 GB o más (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max, Mac Studio) es viable.
- Opciones de despliegue: mlx-lm y oMLX (herramienta con la que se generó la cuantización). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brainworkup/LFM2.5-24B-A2B-oQ4e-fp16 | 23,972B (~2B activos, inferido) | no disponible | MLX safetensors 4-bit mixto | no disponible | Hugging Face |
| LiquidAI/LFM2.5-24B-A2B (base) | 23,972B (~2B activos, inferido) | no disponible | safetensors (precisión original) | no disponible | Hugging Face |
| Otras cuantizaciones comunitarias del mismo base | 23,972B | no disponible | GGUF / MLX / etc. | según autor | no verificado |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización mixta a 4 bits introduce degradación de calidad respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El repositorio no declara licencia, lo que impide determinar si el uso comercial está permitido. Es imprescindible consultar la licencia del modelo base LiquidAI/LFM2.5-24B-A2B antes de cualquier uso en producción.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- No hay información sobre sesgos, alineamiento o filtros de seguridad del modelo base.
- Riesgo de alucinación no cuantificado: sin benchmarks ni evaluaciones publicadas, no puede estimarse.
- Formato MLX: no es portable a CUDA ni a la mayoría de stacks de servidor; limita el despliegue a hardware Apple.
- El checkpoint fue re-cuantizado el 2026-11-02; copias anteriores pueden tener distribuciones de bits distintas y resultados inconsistentes.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria de su funcionamiento o calidad.
- Solo contiene el modelo de lenguaje; no incluye cabezas multimodales aunque el modelo base las tuviera.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/brainworkup/LFM2.5-24B-A2B-oQ4e-fp16
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
