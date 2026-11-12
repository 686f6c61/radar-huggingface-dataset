# eulogiord/Ripple-65B-Base-Preview

## Resumen

Ripple-65B Base Preview es un modelo de lenguaje de tipo transformer denso con 64.782.689.360 parámetros (aproximadamente 65B), desarrollado por Ricursive Intelligence. Se trata del checkpoint base, es decir, únicamente preentrenado, sin midtraining, sin datos sintéticos de tipo QA y sin postentrenamiento (SFT o RL). El modelo se entrenó desde cero sobre un corpus de 12 billones de tokens, principalmente en inglés y código, con una longitud de secuencia de 8K durante el preentrenamiento.

La relevancia de este modelo radica en su enfoque de diseño: frente a la tendencia mayoritaria de usar arquitecturas Mixture-of-Experts (MoE), Ricursive optó por un transformer denso modernizado con una relación de aspecto «thin-and-deep» (d_model de 5120 y 80 capas), inspirado en la arquitectura de Gemma 3N en lugar de la arquitectura tipo Llama de Olmo 3. Según el autor, esta decisión reduce la complejidad de la infraestructura de entrenamiento y servicio, manteniendo un MFU del 40% con sharding simple y sin kernels personalizados.

El modelo se presenta como la base de la familia Ripple, cuya versión instruct (Ripple-65B Preview) reporta resultados destacados en tareas de codificación agéntica, como 80,52 en TerminalBench 2.1. Este repositorio concreto contiene únicamente los pesos base en BF16, por lo que no incorpora las capacidades de instrucción, tool calling ni razonamiento agéntico que sí se atribuyen a la variante instruct.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (inspirado en Gemma 3N), relación thin-and-deep, d_model 5120, 80 capas |
| Parámetros totales | 64.782.689.360 (~65B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1M tokens (según model card); preentrenado a 8K de secuencia |
| Tipos de cuantización | BF16 (checkpoint base); NVFP4 disponible en la variante instruct |
| Idiomas soportados | Predominantemente inglés y código (no se detalla lista completa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Ripple-65B emplea un transformer denso con una relación de aspecto «thin-and-deep»: un d_model estrecho de 5120 y 80 capas totales. El autor indica que se abandonó la arquitectura tipo Llama de Olmo 3 en favor de una arquitectura inspirada en Gemma 3N para mejorar la estabilidad del entrenamiento a escala. Para reforzar el rendimiento en razonamiento, se sobredimensiona el número de cabezas de atención, se incrementa la proporción de capas SWA (sliding window attention) frente a las globales y se reduce la ventana SWA para compensar el coste. Además, se incorporan clipping de activaciones en la FFN, atención con compuertas (gated attention), NoPE global y value residuals.

El preentrenamiento se realizó desde cero sobre 12 billones de tokens de texto (predominantemente inglés y código) con secuencias de 8K, en 877.500 pasos y un batch size que escaló de 1408 a 3072. Este checkpoint base no ha pasado por midtraining, datos sintéticos de QA ni ninguna etapa de postentrenamiento. La model card describe la receta completa de la familia (midtrain de 200B tokens a 64K, long context de 6,5B tokens a 2M, SFT de 183B tokens a 128K, LC SFT de 13,5B tokens a 2M y RL con 700 pasos a 128K), pero esas etapas corresponden a la variante instruct, no a este repositorio. El autor afirma una mejora de eficiencia computacional en código de 16x frente a la escalera de Olmo 3, que llega hasta 55x en el modelo completo.

## Capacidades

- Generación de texto y modelado de lenguaje base: al ser un checkpoint únicamente preentrenado, su capacidad principal es la continuación de texto y la modelización del lenguaje, no el seguimiento de instrucciones.
- Base para razonamiento y código: el corpus de preentrenamiento es predominantemente inglés y código, por lo que el modelo está orientado a tareas de programación y razonamiento técnico.
- Punto de partida para postentrenamiento: sirve como base para aplicar SFT, RL o midtraining propios.
- Soporte de tool calling / function calling: no disponible en este checkpoint base (se atribuye a la variante instruct).
- Soporte de agentes y razonamiento multi-paso: no disponible en este checkpoint base.
- Capacidades multilingües: limitadas; el corpus es predominantemente inglés, sin lista detallada de idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en preentrenamiento y escalado: el checkpoint base permite estudiar el efecto de la arquitectura thin-and-deep y de las decisiones de diseño (gated attention, NoPE global, value residuals) sin la interferencia del postentrenamiento.
- Postentrenamiento propio (SFT/RL): equipos que quieran aplicar su propia receta de instrucción o alineamiento sobre una base de 65B con licencia Apache 2.0 pueden partir de este checkpoint.
- Modelización de código y continuación de texto: útil para experimentos de generación de código y autocompletado en dominios técnicos, dado el peso del código en el corpus.
- Fine-tuning de dominio: ajuste sobre datos propios (legal, médico, industrial) para construir modelos especializados partiendo de una base densa de 65B.
- Evaluación comparativa de arquitecturas: sirve como referencia para comparar transformers densos modernizados frente a arquitecturas MoE de tamaño similar.
- Desarrollo local y prototipado: el autor indica que el modelo cabe en hardware de consumo como NVIDIA DGX Spark, lo que facilita experimentación local con cuantización.
- Destilación y generación de datos sintéticos: la base puede emplearse para generar texto a gran escala en pipelines de destilación o aumento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint base en la información disponible. La model card reporta métricas únicamente para la variante instruct (Ripple-65B Preview), no para el modelo base. Los datos citados en la model card para la variante instruct incluyen 80,52 en TerminalBench 2.1, pero no se trasladan a este repositorio y no se presentan aquí como resultados del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 130 GB solo para los pesos (64,78B parámetros × 2 bytes), más overhead de activaciones y KV cache; el repositorio ocupa 129,6 GB.
- VRAM estimada con cuantización: no se proporcionan cifras concretas para este checkpoint base; la variante instruct ofrece NVFP4, pero no hay datos de VRAM publicados.
- GPU recomendadas: el autor menciona NVIDIA DGX Spark como hardware de consumo capaz de alojar el modelo, y GPUs de datacenter (B200) para generación rápida.
- ¿Cabe en GPU de consumo? En BF16 no cabe en GPUs de consumo convencionales (24 GB o menos); requiere múltiples GPUs o cuantización agresiva. El autor afirma que cabe en DGX Spark.
- Opciones de despliegue: no se especifican frameworks concretos (vLLM, llama.cpp, Ollama, TGI) en la información disponible; el repositorio usa custom_code y safetensors.
- Latencia y throughput: el autor reporta 250 tok/s en 2×B200 con batch=8 antes de cuantización o kernels personalizados, para la familia Ripple-65B; no se detalla si la cifra corresponde exactamente al checkpoint base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ripple-65B Base Preview | ~65B (denso) | Hasta 1M (según model card) | Apache 2.0 | Checkpoint solo preentrenado; arquitectura thin-and-deep |
| Olmo 3 (base de partida) | No disponible | No disponible | No disponible | Arquitectura tipo Llama; referencia de la que parte Ricursive |
| Reflection Beam 501B | 501B | No disponible | No disponible | Modelo open-weight de EE. UU. citado como comparación en la variante instruct |
| Meta Muse Spark Open 816B | 816B | No disponible | No disponible | Modelo open-weight de EE. UU. citado como comparación |
| NVIDIA Nemotron 3 Ultra 550B | 550B | No disponible | No disponible | Modelo open-weight citado como comparación |

La comparación de rendimiento disponible en la model card corresponde a la variante instruct y no es aplicable a este checkpoint base. No se dispone de datos de benchmarks del modelo base frente a alternativas.

## Limitaciones y advertencias

- Es un checkpoint únicamente preentrenado: no sigue instrucciones, no está alineado y no incorpora tool calling ni capacidades agénticas; su uso directo en producción conversacional no es adecuado sin postentrenamiento.
- Riesgo de alucinación y de generar contenido sesgado o tóxico heredado del corpus de preentrenamiento, sin mitigaciones de alineamiento.
- Sesgos conocidos: no se documentan evaluaciones de sesgo ni de seguridad en la información disponible.
- Limitaciones de idioma: el corpus es predominantemente inglés y código; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Contexto: aunque la model card menciona soporte de hasta 1M tokens, el preentrenamiento se realizó a 8K de secuencia; el comportamiento en contextos largos no está validado para este checkpoint base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni cláusulas de responsabilidad documentadas más allá de la licencia estándar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y dependencia de custom_code, lo que puede complicar la carga con frameworks estándar.
- No se documentan limitaciones específicas de producción (latencia, estabilidad, soporte) más allá de las cifras de throughput citadas para la familia.

## Enlaces

- Hugging Face (checkpoint base): https://huggingface.co/eulogiord/Ripple-65B-Base-Preview
- Hugging Face (instruct BF16): https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Hugging Face (instruct NVFP4): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Hugging Face (base, organización oficial): https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Hugging Face (DFlash2): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
