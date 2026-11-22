# Maxilicious20/Velqora-40M-Base-GGUF

## Resumen

Velqora-40M-Base-GGUF es la exportación cuantizada en formato GGUF del modelo Velqora-40M-Base, un modelo de lenguaje causal decoder-only de aproximadamente 41,96 millones de parámetros entrenado desde cero por el usuario Maxilicious20 sobre una GPU de consumo NVIDIA RTX 4060 con 8 GB de VRAM. El modelo se distribuye bajo licencia Apache-2.0 y está orientado principalmente al inglés, con un tokenizador BPE byte-level personalizado de 8.192 tokens.

El interés de esta ficha no reside en su rendimiento absoluto, sino en su carácter de experimento reproducible de entrenamiento from-scratch en hardware asequible y en la disponibilidad de pesos en tres precisiones (F16, Q8_0 y Q4_K_M) listos para ejecutarse con llama.cpp. La arquitectura GGUF declarada es `qwen3`, con atención GQA de 8 cabezas de consulta y 4 de clave/valor, SwiGLU, RMSNorm, QK-Norm por cabeza y RoPE con base θ = 30.000.

Se trata de un modelo de investigación, sin benchmarks publicados y sin uso previsto en producción. Su ventana de contexto máxima es de 2.048 tokens, lo que limita su aplicabilidad a tareas de generación corta y experimentación con pipelines de cuantización y despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal; grafo GGUF `qwen3` (RoPE NeoX half-split, GQA, SwiGLU, RMSNorm, QK-Norm por cabeza) |
| Parametros totales | 41.957.387 (~41,96 M); dato de safetensors del repo base: 46.151.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (RoPE base θ = 30.000) |
| Tipos de cuantizacion | F16 (sin cuantizar), Q8_0 (8 bits), Q4_K_M (4 bits K-quant medium) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F16, Q8_0, Q4_K_M); repo base en safetensors/PyTorch |

Detalles adicionales de arquitectura:

| Parametro | Valor |
|---|---|
| Cabezas de atencion | 8 query / 4 KV (GQA) |
| Capas | 12 |
| Dimension oculta | 512 (SwiGLU 1.536) |
| Tokenizador | BPE byte-level personalizado, 8.192 tokens, embebido en metadatos GGUF |
| Tamano de ficheros | F16: 88,33 MB; Q8_0: 47,08 MB; Q4_K_M: 27,46 MB |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal de 12 capas y dimensión oculta 512, con FFN SwiGLU de dimensión intermedia 1.536. Emplea atención con grouped-query attention (8 cabezas de consulta, 4 de clave/valor), normalización RMSNorm y QK-Norm por cabeza, además de RoPE en variante NeoX half-split con base 30.000. El tokenizador es un BPE byte-level propio de 8.192 tokens, embebido en los metadatos del GGUF.

El entrenamiento se realizó desde cero (from-scratch) sobre una única NVIDIA RTX 4060 de 8 GB, según la model card del autor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de la arquitectura (GQA, QK-Norm, SwiGLU).

Una nota de conversión relevante: el escalar de residuo de valores de la capa 0 (`v_res_alpha`) se omite en la ejecución estándar del grafo GGUF. Se preservan las proyecciones principales, los pesos de QK-Norm por cabeza, las frecuencias RoPE y el vocabulario BPE de 8.192 tokens.

## Capacidades

- Generación de texto autoregresiva en inglés, con contexto máximo de 2.048 tokens.
- Modelo base sin instrucciones: no está ajustado para seguir instrucciones ni para diálogo estructurado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamaño y la ausencia de ajuste lo desaconsejan.
- Capacidades multilingües: limitadas al inglés (idioma declarado `en`).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Inferencia local con llama.cpp mediante `llama-cli` y compatibilidad declarada con endpoints.
- Ejecución viable en CPU y en GPUs de gama baja gracias a su reducido tamaño (27,46 MB en Q4_K_M).

## Casos de uso

- Experimentación educativa con modelos de lenguaje: sirve para estudiar el ciclo completo de entrenamiento from-scratch, conversión a GGUF y cuantización en un equipo de consumo, con un coste computacional mínimo.
- Pruebas de pipelines de cuantización: comparar F16, Q8_0 y Q4_K_M sobre el mismo modelo permite medir la degradación de perplejidad y de coherencia en un rango de precisión amplio con ficheros de menos de 90 MB.
- Validación de infraestructura de inferencia: útil como modelo "smoke test" para verificar instalaciones de llama.cpp, endpoints compatibles o scripts de despliegue antes de mover modelos grandes.
- Generación de texto corto y completado de secuencias: con 2.048 tokens de contexto puede completar frases y párrafos breves en inglés, adecuado para demos y pruebas de concepto.
- Investigación sobre tokenizadores personalizados: el vocabulario BPE byte-level de 8.192 tokens permite estudiar el impacto del tokenizador en modelos de muy baja escala.
- Docencia y talleres: su huella de 27,46 MB en Q4_K_M permite distribuirlo y ejecutarlo en portátiles sin GPU dedicada, facilitando sesiones prácticas sobre modelos de lenguaje.
- Benchmarking de hardware de consumo: medir throughput y latencia en RTX 4060, CPUs y dispositivos de borde con un modelo de referencia de ~42 M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los formatos; F16 ~88 MB de pesos, Q8_0 ~47 MB, Q4_K_M ~27 MB, más overhead de contexto y runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo fue entrenado en una RTX 4060 de 8 GB, que lo ejecuta con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU y en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (previa importación del GGUF), y cualquier runtime compatible con GGUF; no se documenta soporte específico para vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; con 12 capas y 512 de dimensión oculta se espera una latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Velqora-40M-Base-GGUF | ~41,96 M | 2.048 | Apache-2.0 | GGUF | Entrenado from-scratch en RTX 4060; sin benchmarks publicados |
| SmolLM-135M | 135 M | 2.048 | Apache-2.0 | safetensors, GGUF | Modelo base de mayor escala con benchmarks publicados |
| GPT-2 small | 124 M | 1.024 | MIT | safetensors, GGUF | Referencia histórica; mayor escala y ecosistema maduro |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache-2.0 | safetensors, GGUF | Escala muy superior; no comparable en coste de entrenamiento |

La comparación es orientativa: Velqora se sitúa en una escala de parámetros inferior a la de los modelos de referencia habituales en la categoría de modelos pequeños, y no dispone de métricas publicadas que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe esperarse un comportamiento de asistente ni de chat.
- Riesgo elevado de alucinación y de errores aritméticos, especialmente en la cuantización Q4_K_M, tal como advierte el propio autor.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo inglés; sin soporte multilingüe declarado.
- Entrenado en hardware de consumo con un dataset no documentado: posibles sesgos desconocidos y calidad de datos no verificable.
- La omisión de `v_res_alpha` de la capa 0 en el grafo GGUF puede introducir diferencias respecto a los pesos PyTorch originales.
- No apto para producción ni para usos críticos de seguridad, según la propia model card.
- Licencia Apache-2.0: permite uso comercial, pero sin garantías del autor y con la obligación habitual de conservar avisos de licencia.
- Sin descargas ni likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Maxilicious20/Velqora-40M-Base-GGUF
- Repositorio base en PyTorch: https://huggingface.co/Maxilicious20/Velqora-40M-Base
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
