# BananaMind/BananaMind-2.1-Pico-Preview

## Resumen

BananaMind-2.1-Pico-Preview es un modelo de lenguaje base (no instruido) de tipo decoder-only Transformer, desarrollado por BananaMind como primer checkpoint público de la línea arquitectónica BananaMind 2.1. Con solo 1.480.516 parámetros y entrenado sobre 2.000 millones de tokens de FineWeb-Edu, su propósito principal no es el rendimiento bruto, sino servir como banco de pruebas para tres innovaciones arquitectónicas: ejecución en bucle parcial (looped transformer), atención cruzada por sustracción de valor (XSA) y una tabla de trigramas con hash causal inyectada a mitad de la pila.

El modelo tiene tres bloques físicos pero ejecuta cuatro pasadas por forward (el bloque 2 se reutiliza dos veces), lo que permite pagar tres bloques de parámetros y cuatro de cómputo. Además incorpora una puerta de refresco de embeddings con convolución causal y una tabla de n-gramas de 499.969 parámetros, que supone un tercio del total. Está liberado bajo licencia Apache 2.0, con pesos en safetensors y requiere `trust_remote_code=True` por su arquitectura personalizada.

La relevancia de este lanzamiento radica en que explora vías de eficiencia paramétrica extrema: con menos de 1,5 millones de parámetros compite en varios benchmarks con modelos de tamaño similar entrenados con muchos más tokens, como GPT-S-1.4M (6B tokens) o BananaMind-2-Micro (75B tokens). Es un modelo de investigación, no un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con bucle parcial (3 bloques físicos, 4 ejecuciones: L1 → L2 → L2 → L3) |
| Parametros totales | 1.480.516 (según model card; safetensors reporta 2.070.336) |
| Parametros activos | No aplica (no es MoE; todos los parámetros se activan en cada forward) |
| Longitud de contexto | 3.072 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos en fp32/fp16, sin cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only pre-normalizado con atención grouped-query (4 cabezas de consulta, 1 cabeza KV, dimensión de cabeza 32), MLP SwiGLU (hidden size 128, intermediate 384), RoPE con theta 100.000 y RMSNorm. La innovación principal es el **bucle parcial**: solo el bloque 2 se ejecuta dos veces, de modo que la pila efectiva es L1 → L2 → L2 → L3. Esto permite reutilizar parámetros sin duplicar el coste de memoria.

Sobre el bucle se añaden tres mecanismos:

- **Value-subtraction XSA**: tras la atención estándar, se proyecta fuera de la salida de cada cabeza la componente paralela al vector de valor del token actual. Como cuatro cabezas de consulta comparten una cabeza KV, la sustracción se aplica por grupo KV, eliminando la dirección dominante del valor propio en contextos cortos.
- **Embedding-refresh gate**: cada bloque reinyecta el embedding original del token a través de una puerta cuya señal es la salida de atención del propio bloque, desconectada del grafo de gradientes, combinada con una convolución causal estricta (kernel 9, padding izquierdo). El resultado se escala por un escalar `alpha` inicializado a cero, de modo que la ruta comienza como no-op y el modelo aprende cuánta identidad léxica restaurar en cada profundidad.
- **Hashed causal trigram embedding**: una tabla de 3.906 buckets indexada por un hash entero del token actual y los dos anteriores (solo posiciones presentes y pasadas). Se inyecta una vez antes del bloque 2, en cada pasada del bucle. Esta tabla supone el 33,77% de los parámetros totales.

El entrenamiento se realizó desde cero sobre 2.000 millones de tokens de FineWeb-Edu, sin fases de RLHF ni DPO. Es un modelo base, por lo que no se ha ajustado para seguir instrucciones ni para diálogo. El checkpoint se entrenó y evaluó con `loop_mode=partial` y `loop_passes=2`.

## Capacidades

- Generación de texto en inglés por continuación (estilo base, sin formato de chat).
- Razonamiento básico y sentido común a muy pequeña escala, medible en benchmarks como ARC, HellaSwag o PIQA.
- Aritmética simple (ArithMark 3) con precisión limitada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso estructurado.
- No tiene modo de pensamiento (thinking mode) ni capacidades multimodales (solo texto).
- Capacidad multilingüe: únicamente inglés, con un vocabulario muy reducido (2.048 tokens).
- No soporta caché de generación (KV cache), lo que impide uso eficiente en inferencia prolongada.

## Casos de uso

- **Investigación en eficiencia paramétrica**: el modelo sirve para estudiar cómo el bucle parcial, la XSA y el n-gram embedding afectan al rendimiento con menos de 1,5M parámetros. Se puede usar como banco de pruebas para ablaciones y comparaciones con otras arquitecturas ultrapequeñas.
- **Educación en arquitecturas de transformers**: al ser un modelo mínimo con código personalizado y documentación detallada, es útil para enseñar conceptos como weight sharing, atención con múltiples cabezas, o inyección de n-gramas en entornos académicos o de formación.
- **Prototipado de generación de texto en entornos con recursos extremadamente limitados**: por su tamaño, puede ejecutarse en CPU o microcontroladores, permitiendo experimentar con generación de texto básica en dispositivos embebidos.
- **Validación de hipótesis sobre diseño de modelos pequeños**: los investigadores pueden comparar el rendimiento de este checkpoint con otros modelos de parámetros similares (p. ej., GPT-S-1.4M) para aislar el efecto de las innovaciones arquitectónicas.
- **Generación de datos sintéticos para entrenamiento de modelos más grandes**: aunque su calidad es baja, puede usarse para crear continuaciones de texto cortas que sirvan como aumentación de datos en pipelines de preentrenamiento.
- **Benchmarking de frameworks de inferencia**: al ser un modelo diminuto con arquitectura personalizada, es adecuado para probar la compatibilidad de motores como vLLM, llama.cpp u Ollama con arquitecturas no estándar (aunque requerirá adaptaciones).

## Benchmarks y rendimiento

La model card incluye una comparativa con dos modelos de tamaño similar. Los resultados se obtuvieron con evaluación zero-shot (`acc_norm,none` para ARC, PIQA y HellaSwag; precisión de continuación normalizada por longitud para ArithMark 3; suite pública BananaMindBench 1.1 de 350 ítems para Base Bench).

| Benchmark | BananaMind-2.1-Pico-Preview | BananaMind-2-Micro | GPT-S-1.4M |
|---|---:|---:|---:|
| Parámetros entrenables | 1.480.516 | 2.933.193 | 1.426.000 |
| Tokens de entrenamiento | 2B | 75B | 6B |
| ARC Easy | 29,50% | **33,12%** | 31,27% |
| ARC Challenge | **22,53%** | 21,93% | 21,93% |
| HellaSwag | 27,04% | **28,27%** | 26,89% |
| PIQA | 54,30% | 53,21% | **55,17%** |
| ArithMark 3 | 33,00% | **34,00%** | 30,20% |
| INT Index | 5,369 | **6,01** | 5,34 |
| Base Bench Elo | **885** | 874 | N/A |
| Base Bench accuracy | **34,57%** | **34,57%** | N/A |

El modelo destaca en ARC Challenge y Base Bench Elo, pero queda por detrás en la mayoría de métricas frente a modelos entrenados con muchos más tokens. No se han publicado resultados adicionales fuera de esta tabla.

## Requisitos de hardware

- **VRAM estimada**: al tener solo 1,48M de parámetros, el modelo ocupa aproximadamente 6 MB en fp32 (1.480.516 × 4 bytes) y 3 MB en fp16. Cabe en cualquier GPU, incluso en iGPU o en memoria compartida.
- **GPU recomendadas**: no se requiere ninguna GPU específica; cualquier tarjeta con al menos 1 GB de VRAM es suficiente. También puede ejecutarse en CPU sin problemas.
- **Compatibilidad con GPU de consumo**: sí, absolutamente. Incluso una Raspberry Pi con suficiente RAM podría ejecutarlo.
- **Opciones de despliegue**: al ser una arquitectura personalizada con `trust_remote_code`, el soporte en motores estándar (vLLM, llama.cpp, Ollama, TGI) no está garantizado. Se puede cargar directamente con Transformers de HuggingFace usando `trust_remote_code=True`. Para producción, sería necesario exportar a ONNX o convertir a GGUF manualmente.
- **Latencia y throughput**: no se han publicado mediciones oficiales. Dado el tamaño, la latencia por token en CPU moderna debería ser inferior a 10 ms, y en GPU prácticamente instantánea. La ausencia de caché de generación puede aumentar el coste computacional en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BananaMind-2.1-Pico-Preview | 1,48M | 3.072 | 2B | Apache 2.0 | HuggingFace (custom code) |
| BananaMind-2-Micro | 2,93M | No disponible | 75B | No disponible | HuggingFace |
| GPT-S-1.4M | 1,43M | No disponible | 6B | No disponible | No disponible |

BananaMind-2.1-Pico-Preview es el más pequeño en parámetros y el que menos tokens ha visto, pero introduce innovaciones arquitectónicas que le permiten competir en algunas métricas. BananaMind-2-Micro, con el doble de parámetros y 37 veces más tokens, es superior en la mayoría de benchmarks. GPT-S-1.4M, con tamaño similar y 3 veces más tokens, ofrece resultados mixtos. No se dispone de datos de contexto ni licencia para los dos modelos comparados.

## Limitaciones y advertencias

- **Modelo base, no instruido**: no responde a prompts de chat ni sigue instrucciones; solo genera continuaciones de texto. Cualquier uso conversacional requiere un ajuste fino posterior.
- **Vocabulario extremadamente reducido**: 2.048 tokens limita la expresividad y puede producir subword splitting ineficiente.
- **Contexto corto**: 3.072 tokens es insuficiente para tareas que requieran memoria a largo plazo o documentos extensos.
- **Solo inglés**: no hay soporte para otros idiomas.
- **Sin caché de generación**: la model card indica explícitamente que no se soporta caché, lo que hace la inferencia secuencial ineficiente y limita su uso en producción.
- **Riesgo de alucinación**: al ser un modelo muy pequeño entrenado con pocos datos, la coherencia factual es baja y las alucinaciones son frecuentes.
- **Discrepancia en el conteo de parámetros**: la model card reporta 1.480.516 parámetros, pero el archivo safetensors contiene 2.070.336. Esto puede deberse a buffers o pesos no entrenables; conviene verificarlo antes de usarlo.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código no auditado del autor. En entornos de producción, esto supone un riesgo de seguridad.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo se publica como preview y su calidad no es adecuada para aplicaciones comerciales reales.

## Enlaces

- [HuggingFace - BananaMind/BananaMind-2.1-Pico-Preview](https://huggingface.co/BananaMind/BananaMind-2.1-Pico-Preview)
- [HuggingFace - BananaMind/BananaMind-2-Pro-Preview](https://huggingface.co/BananaMind/BananaMind-2-Pro-Preview) (modelo hermano de la misma organización)
