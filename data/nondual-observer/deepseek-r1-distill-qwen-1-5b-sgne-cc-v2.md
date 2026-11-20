# Nondual-Observer/DeepSeek-R1-Distill-Qwen-1.5B-SGNE-CC-v2

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-SGNE-CC-v2 es una edición de pesos del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, publicada por el usuario independiente Nondual-Observer. No se trata de un reentrenamiento ni de un fine-tuning convencional: el autor aplica una técnica propia denominada SGNE-CC v2 (Spherical Gated Norm-preserving Edit, Column-Constrained), que modifica directamente los tensores del checkpoint original mediante un parche compacto de 603 KB en formato NPZ. El repositorio distribuye tanto el checkpoint completo en BF16 (model.safetensors) como el parche reproducible, junto con scripts para reconstruir el modelo desde los pesos oficiales de DeepSeek.

El modelo base es un transformer denso de la familia Qwen2, con 1.777.088.000 parámetros totales según los safetensors publicados, derivado por destilación del razonamiento de DeepSeek-R1. La edición SGNE-CC v2 busca mejorar el comportamiento de razonamiento en decodificación greedy, reduciendo el número de respuestas sin cierre de la etiqueta `</think>` y acortando la longitud de generación. Según la model card, el modelo conserva la licencia Apache 2.0 del original y declara soporte para inglés, chino y ruso.

Su relevancia es fundamentalmente metodológica: demuestra que una intervención en el espacio de pesos de apenas 603 KB puede producir ganancias medibles en benchmarks de matemáticas y código sobre un modelo de 1.5B, con verificación criptográfica de los artefactos (SHA-256) y depósito archival en Zenodo. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y las cifras proceden exclusivamente de la documentación del autor, sin validación independiente conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), derivado por destilación de DeepSeek-R1 |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (límite de generación usado en los benchmarks; el contexto nativo del base Qwen2-1.5B es 32.768) |
| Tipos de cuantizacion | no disponible en la model card (el checkpoint se publica en BF16; al ser arquitectura Qwen2 es compatible con cuantizaciones estándar de la comunidad, pero el autor no las documenta) |
| Idiomas soportados | en, zh, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) + parche de edición de pesos en NPZ (603 KB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del DeepSeek-R1-Distill-Qwen-1.5B: un transformer decoder-only denso de la familia Qwen2, con 1.5B parámetros nominales (1.777.088.000 reales según safetensors) y contexto de 32.768 tokens. El modelo base fue destilado por DeepSeek a partir de las trazas de razonamiento de DeepSeek-R1, e incorpora el modo de pensamiento con etiquetas `</think>` que separa la cadena de razonamiento de la respuesta final.

La intervención SGNE-CC v2 no reentrena el modelo. Consiste en una edición en el espacio de pesos: un parche NPZ de 603 KB que se aplica sobre los tensores del checkpoint oficial mediante el script apply_sgne_cc_v2_205_to_safetensors.py. La técnica se describe como "Spherical Gated Norm-preserving Edit, Column-Constrained", es decir, una edición con preservación de norma, compuerta esférica y restricción por columnas. El autor publica hashes SHA-256 del checkpoint base, del parche y del checkpoint parcheado, lo que permite verificar la reproducibilidad de la reconstrucción. No se documentan en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO, ya que al no ser un entrenamiento convencional esos parámetros no aplican del mismo modo.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento explícito (`</think>`), heredado del modelo base destilado de DeepSeek-R1.
- Razonamiento matemático: resolución de problemas de competición (MATH-500) con cadenas de razonamiento.
- Generación de código: resolución de problemas de programación en Python (HumanEval, MBPP).
- Razonamiento lógico y de sentido común (ARC-Challenge, BBH Logic).
- Capacidades multilingües declaradas en inglés, chino y ruso.
- Compatibilidad directa con transformers, vLLM y text-generation-inference sin cambios en el código de inferencia.
- Funciona tanto en decodificación greedy (T = 0) como en muestreo (T = 0.6, top_p = 0.95; o T = 0.3) sin necesidad de penalizaciones de repetición o presencia.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Razonamiento matemático en producción con latencia ajustada: el modelo reduce la longitud media de generación en MATH-500 de 11.0k a 4.7k tokens en greedy según el autor, lo que abarata el coste por consulta en pipelines de resolución de problemas matemáticos.
- Generación de código en entornos con presupuesto de tokens: en MBPP greedy pasa de 13.1k a 3.6k tokens de media, adecuado para asistentes de código que necesitan respuestas más concisas sin penalizar la precisión.
- Despliegue en hardware modesto: con 1.5B parámetros en BF16 cabe en GPUs de consumo, lo que permite servir el modelo en una estación de trabajo para tareas de razonamiento interno.
- Investigación en edición de pesos: el parche de 603 KB y los scripts de reconstrucción permiten reproducir y auditar la intervención, útil para estudiar técnicas de weight-space programming.
- Evaluación comparativa de métodos de edición: sirve como caso de estudio controlado (mismo base, mismo benchmark, dos modos de decodificación) para medir el efecto de una edición de pesos frente a un fine-tuning.
- Prototipado de asistentes de razonamiento multilingüe en inglés, chino y ruso, con contexto de hasta 32.768 tokens para conversaciones o documentos largos.
- Integración en vLLM o TGI para servir el modelo con `--max-model-len 32768` en entornos de prueba y demostraciones.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (BF16, límite de generación de 32.768 tokens, presence_penalty = 0). No hay validación independiente conocida.

| Benchmark (N) | Modo | Base: precisión · tokens | SGNE-CC v2: precisión · tokens | Diferencia (p) |
|---|---|---|---|---|
| MATH-500 (500) | Greedy (T=0) | 65.4% · 11.0k | 76.4% · 4.7k | +11.0 pp (p = 7.72e-9) |
| MATH-500 (500) | Sampling (T=0.6) | 80.0% · 5.8k | 82.0% · 4.3k | +2.0 pp (p = 0.2288) |
| MBPP (120) | Greedy (T=0) | 53.3% · 13.1k | 67.5% · 3.6k | +14.2 pp (p = 9.11e-4) |
| MBPP (120) | Sampling (T=0.6) | 67.5% · 4.8k | 64.2% · 2.2k | -3.3 pp (p = 0.4807) |
| HumanEval (164) | Greedy (T=0) | 52.4% · 13.8k | 53.7% · 6.2k | +1.2 pp (p = 0.8714) |
| HumanEval (164) | Sampling (T=0.6) | 65.9% · 5.8k | 68.9% · 3.3k | +3.0 pp (p = 0.4421) |
| ARC-Challenge (150) | Greedy (T=0) | 52.7% · 7.7k | 59.3% · 0.8k | +6.7 pp (p = 0.1839) |
| ARC-Challenge (150) | Sampling (T=0.6) | 57.3% · 1.5k | 56.7% · 1.1k | -0.7 pp (p = 1.0000) |
| BBH Logic (120) | Greedy (T=0) | 68.3% · 7.4k | 77.5% · 2.4k | +9.2 pp (p = 0.0895) |
| BBH Logic (120) | Sampling (T=0.6) | 72.5% · 2.5k | 73.3% · 1.5k | +0.8 pp (p = 1.0000) |
| Pooled (1.054) | Greedy (T=0) | 60.5% · 10.8k | 69.5% · 4.0k | +9.0 pp (p = 6.07e-10) |
| Pooled (1.054) | Sampling (T=0.6) | 72.3% · 4.7k | 73.3% · 3.1k | +1.0 pp (p = 0.4472) |

El autor reporta además que en ARC-Challenge con T = 0.3 el modelo alcanza 66.0% (99/150) frente al 57.3% del base con T = 0.6, y que en las exclusiones de calibración de MATH-500 (474 y 421 ítems) las ganancias en greedy se mantienen con significación estadística. Las ganancias más sólidas se concentran en decodificación greedy; en muestreo las diferencias son pequeñas y en varios casos no significativas.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 3.6 GB solo para pesos (1.777.088.000 × 2 bytes), más overhead de activaciones y caché KV; en la práctica unos 4-6 GB para contexto moderado.
- VRAM estimada en cuantizaciones de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1 GB para pesos (estimaciones estándar para 1.5B, no documentadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 con contexto largo; A100, H100 o L40S para servir con vLLM a mayor concurrencia.
- Cabe en GPUs de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares con 8 GB o más en BF16; en GPUs de 4-6 GB conviene cuantizar.
- Opciones de despliegue: transformers (carga directa con device_map="auto"), vLLM (`vllm serve ... --max-model-len 32768`) y text-generation-inference (etiqueta text-generation-inference en el repo). No se documenta compatibilidad explícita con llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B-SGNE-CC-v2 | 1.777.088.000 | 32.768 | Apache 2.0 | Edición de pesos de 603 KB sobre el base; ganancias en greedy según el autor |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ~1.5B | 32.768 | Apache 2.0 (según el repo base) | Modelo base oficial; referencia directa de la comparativa del autor |
| Qwen3.5-0.8B-SGNE-CC (predecesor del autor) | ~0.8B | no disponible | no disponible en la información | Predecesor de la técnica SGNE-CC sobre un modelo híbrido distinto |

No se dispone en la información proporcionada de comparaciones con otros modelos de 1.5B de la misma categoría (por ejemplo, Qwen2.5-1.5B o Llama-3.2-1B) más allá del propio modelo base.

## Limitaciones y advertencias

- Las cifras de benchmarks proceden exclusivamente de la model card del autor; no hay validación independiente ni revisión por pares documentada en la información disponible.
- El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de adopción y de escrutinio de la comunidad.
- La técnica SGNE-CC v2 es propietaria del autor y su descripción pública se limita a la model card y al paper en GitHub/Zenodo; la reproducibilidad depende de los scripts y hashes publicados.
- Las ganancias son consistentes en decodificación greedy, pero en muestreo (T = 0.6) varias diferencias no son estadísticamente significativas e incluso hay pérdidas (MBPP, ARC-Challenge).
- Riesgo de alucinación inherente a un modelo de 1.5B destilado: capacidad limitada para razonamientos largos y propensión a errores en dominios fuera de matemáticas y código.
- Idiomas declarados limitados a inglés, chino y ruso; no se documenta rendimiento en castellano.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero al ser una edición de pesos conviene verificar la licencia del checkpoint base y la cadena de atribución.
- El límite de contexto de 32.768 tokens se cita como límite de generación en los benchmarks; el contexto nativo del base Qwen2-1.5B es 32.768, pero no se documenta el comportamiento más allá de esa ventana.
- El repositorio incluye un parche NPZ y scripts de reconstrucción; aplicar el parche sobre una versión distinta del checkpoint base puede producir resultados incorrectos, por lo que deben respetarse los SHA-256 indicados.

## Enlaces

- Hugging Face: https://huggingface.co/Nondual-Observer/DeepSeek-R1-Distill-Qwen-1.5B-SGNE-CC-v2
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- GitHub del proyecto (paper, trazas, verificador SHA-256): https://github.com/Nondual-Observer/deepseek-r1-1.5b-sgne-cc-v2
- Zenodo v2.0.0: https://doi.org/10.5281/zenodo.24398165
- Zenodo Concept DOI: https://doi.org/10.5281/zenodo.24398164
- Predecesor v1 (Qwen3.5-0.8B-SGNE-CC): https://huggingface.co/Nondual-Observer/Qwen3.5-0.8B-SGNE-CC
- GitHub del predecesor (dna-weight-editing): https://github.com/Nondual-Observer/dna-weight-editing
- DOI del predecesor: https://doi.org/10.5281/zenodo.24235218
