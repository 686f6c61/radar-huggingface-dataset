# kjartan-m/Ornith-1.5-35B-A3B-oQ3.5-fp16-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ3.5-fp16-mtp es una cuantización mixta del modelo base Ornith-1.5-35B-A3B, publicada por el usuario kjartan-m en Hugging Face. El checkpoint emplea la herramienta oQ (oMLX v0.7.3) para aplicar cuantización de precisión mixta sobre los pesos originales, dando como resultado una media efectiva de 4,023 bits por peso sobre el conjunto completo del modelo. El resultado es un checkpoint de 35.505 millones de parámetros almacenado en 17,9 GB, lo que reduce sustancialmente el espacio necesario frente a los pesos en FP16 o BF16.

El modelo base pertenece a la familia Qwen3.5 MoE, tal como indica la etiqueta `qwen3_5_moe`, y presenta una arquitectura de mezcla de expertos con 35B parámetros totales y 3B parámetros activos (la nomenclatura A3B). Incorpora además una cabeza MTP (multi-token prediction) de 0,845B parámetros, lo que sugiere soporte para decodificación especulativa o predicción de múltiples tokens. La librería asociada es MLX, el framework de Apple para ejecución en silicio Apple, lo que orienta este checkpoint al ecosistema de Mac con chips M-series.

La relevancia de esta ficha radica en que se trata de una cuantización comunitaria de un modelo MoE relativamente grande, pensada para ejecución local en hardware Apple. No obstante, la información pública disponible es muy limitada: la model card únicamente documenta el proceso y la distribución de bits de la cuantización, sin detallar el modelo base, los datos de entrenamiento, los idiomas o la licencia. Esta ficha refleja, por tanto, únicamente lo que puede verificarse a partir de los metadatos y el README proporcionados, marcando como "no disponible" todo aquello que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, familia Qwen3.5 (`qwen3_5_moe`); incluye cabeza MTP |
| Parámetros totales | 35.505.251.456 (35,505B) |
| Parámetros activos | 3B (según nomenclatura A3B del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización mixta oQ: affine 3-bit (grupo 64), 4-bit (grupo 64), 5-bit (grupo 128), 6-bit (grupo 64), 8-bit (grupo 128 y grupo 64), más FP16; media efectiva 4,023 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura de mezcla de expertos (MoE) de la familia Qwen3.5, con 35,5B parámetros totales y, según la convención de nombres A3B, aproximadamente 3B parámetros activos por token. El checkpoint incluye una cabeza MTP (multi-token prediction) de 0,845B parámetros, una innovación orientada a la predicción de varios tokens futuros simultáneamente, lo que habitualmente se emplea para acelerar la decodificación o mejorar la planificación en tareas de razonamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La contribución de este checkpoint concreto es la cuantización. Según la model card, se aplicó oQ (oMLX v0.7.3) con precisión mixta: el 61,641% de los pesos lógicos quedó en 3-bit (grupo 64), el 33,124% en 4-bit (grupo 64), y el resto se distribuye entre 5-bit, 6-bit, 8-bit y una pequeña fracción en FP16 (0,087%). El modelo de lenguaje ocupa 34,661B parámetros lógicos (16,171 GiB de almacenamiento) y la cabeza MTP 0,845B (0,456 GiB). El total almacenado es de 16,627 GiB, con una media efectiva de 4,023 bits por peso.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.5 MoE, si bien no se documentan detalles específicos en la información disponible.
- Predicción multi-token (MTP): la presencia de una cabeza MTP dedicada sugiere soporte para decodificación especulativa o generación de varios tokens por paso.
- Ejecución en Apple Silicon: al estar empaquetado para MLX, está pensado para inferencia en chips M-series de Apple.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint está empaquetado en MLX y cuantizado a una media de 4,023 bits/peso, lo que permite ejecutar un modelo MoE de 35B parámetros en equipos con memoria unificada de gama alta (por ejemplo, Mac Studio con 64 GB o más), sin necesidad de GPU dedicada.
- Prototipado de aplicaciones de razonamiento en local: al tratarse de un MoE con 3B parámetros activos, el coste computacional por token es menor que el de un modelo denso de 35B, lo que lo hace adecuado para iterar rápidamente en entornos de desarrollo con hardware Apple.
- Experimentación con decodificación especulativa: la cabeza MTP incluida permite investigar y evaluar técnicas de predicción multi-token para acelerar la generación, comparando su rendimiento frente a la decodificación autoregresiva estándar.
- Evaluación de cuantización mixta: este checkpoint sirve como referencia para estudiar el impacto de la cuantización oQ de precisión mixta (3/4/5/6/8 bits) en la calidad de un MoE, comparándolo con el modelo original en FP16.
- Despliegue de asistentes de texto en estaciones de trabajo Apple: para equipos que ya trabajan en el ecosistema macOS, este checkpoint permite integrar un modelo de 35B en flujos de trabajo locales de generación de texto sin depender de servicios en la nube.
- Investigación académica sobre MoE cuantizados: útil para estudiar cómo se distribuyen los bits entre capas y expertos en un MoE y qué efecto tiene en tareas downstream, dado que la model card documenta la distribución exacta por precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 17,9 GB en disco (16,627 GiB de pesos). En MLX sobre Apple Silicon, la memoria unificada necesaria para cargar los pesos ronda esos 17-18 GB, más el espacio para el contexto KV y overhead del runtime; en la práctica se recomienda un equipo con al menos 32 GB de memoria unificada, y 64 GB para contextos largos o uso concurrente.
- GPU recomendadas: al ser un checkpoint MLX, el entorno objetivo son chips Apple M-series (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max). No está pensado para GPU NVIDIA, aunque podría requerir conversión a otro formato para su uso en CUDA.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con memoria unificada suficiente (Mac Studio, MacBook Pro de gama alta). En GPU de consumo NVIDIA no es directamente compatible por el formato MLX.
- Opciones de despliegue: MLX (librería nativa del checkpoint) y, presumiblemente, herramientas del ecosistema MLX como mlx-lm; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-oQ3.5-fp16-mtp | 35,505B (3B activos) | no disponible | Mixta oQ, media 4,023 bits | no disponible | safetensors (MLX) |
| Modelo base Ornith-1.5-35B-A3B | 35,5B (3B activos) | no disponible | FP16/BF16 (presumible) | no disponible | no disponible |
| Otros MoE de ~30-40B con ~3B activos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables concretos en la documentación proporcionada; los datos de la familia Qwen3.5 MoE y de alternativas equivalentes no constan en la información disponible.

## Limitaciones y advertencias

- La model card no documenta el modelo base, los datos de entrenamiento ni los idiomas; se desconoce su comportamiento real en tareas específicas.
- La licencia no está indicada, por lo que no puede confirmarse si se permite uso comercial. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- La cuantización mixta a una media de 4,023 bits/peso puede degradar la calidad respecto al modelo original en FP16/BF16, especialmente en tareas sensibles a la precisión numérica (matemáticas, código, razonamiento largo).
- El checkpoint está empaquetado para MLX, lo que limita su uso a hardware Apple o a conversiones adicionales para otros runtimes.
- Riesgo de alucinación: no evaluado en la información disponible; debe asumirse el riesgo habitual de los modelos generativos.
- Sesgos conocidos: no documentados.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria amplia.
- No se han publicado benchmarks que permitan verificar la calidad tras la cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/kjartan-m/Ornith-1.5-35B-A3B-oQ3.5-fp16-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
