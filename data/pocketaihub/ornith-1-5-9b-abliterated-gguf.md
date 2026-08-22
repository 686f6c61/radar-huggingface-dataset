# PocketAiHub/Ornith-1.5-9B-Abliterated-GGUF

## Resumen

Ornith-1.5-9B-Abliterated-GGUF es un derivado experimental del modelo multimodal `ornith-ai/Ornith-1.5-9B`, publicado por PocketAiHub bajo el nombre de PocketAiHub. El modelo original pertenece a la familia Ornith-1.5 de DeepReinforce, una línea de modelos open source que cubre tamaños de 9B, 35B y 397B parámetros, orientados a razonamiento, generación de código y tareas agénticas. Este derivado concreto aplica una técnica de *abliteration* (ablación de la dirección de rechazo aprendida) para suprimir el comportamiento de rechazo del modelo base, con el objetivo de estudiar cómo se comporta el sistema sin esa capa de alineación.

El checkpoint se distribuye en formato GGUF con cuantizaciones BF16, Q8_0, Q6_K y Q4_K_M, e incluye un proyector de visión (`mmproj`) en F16 para entrada de imágenes. El modelo es multimodal (imagen y texto como entrada, texto como salida) y se ejecuta con llama.cpp. Es importante señalar que este checkpoint ha sido deliberadamente modificado para suprimir el rechazo aprendido, por lo que puede producir contenido dañino, ilegal u ofensivo con mayor facilidad que el modelo original. No es un entrenamiento de veracidad ni una mejora de capacidades.

El repo declara la licencia MIT, heredada del modelo base, y los archivos de validación (`abliteration-manifest.json` y `validation-summary.json`) documentan la procedencia y los resultados de las pruebas. A fecha de publicación, el repo tiene 0 descargas y 0 likes, lo que indica que es una publicación muy reciente y sin adopción documentada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo denso de ~9B según documentación del autor) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (texto) + F16 (proyector de vision) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo base. Según la documentación de la familia Ornith-1.5 publicada por el equipo de Ornith AI, el modelo se basa en un marco de "self-scaffolding" que se extiende a un bucle de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones para entrenamiento por refuerzo. Sin embargo, no se ofrecen detalles concretos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO para este derivado concreto.

La modificación de abliteration se aplicó al checkpoint base, fijado en la revisión `c927ad73b7eb20f00aafcaa0a11a9d58ed5487bc`. Según el README, la escala de ablación es 1.0 y se eliminó la "dirección de rechazo" aprendida. La validación se realizó con 100 prompts dañinos y 100 benignos, con un scorer de rechazo basado en frases; el informe advierte que la revisión manual encontró redirecciones semánticas que el scorer no detectó, por lo que 0/100 flags no implica un modelo completamente sin censura.

## Capacidades

- **Multimodal**: acepta entrada de imagen y texto, y genera texto. El proyector de visión `mmproj-Ornith-1.5-9B-Abliterated-F16.gguf` es compatible con todas las cuantizaciones de texto del repo y se validó con una prueba de humo de imagen (`red`).
- **Generación de texto**: como modelo denso de ~9B, puede generar texto general, razonamiento y código, según las capacidades declaradas de la familia Ornith-1.5.
- **Comportamiento sin rechazo**: la abliteration suprime el rechazo aprendido, lo que permite evaluar cómo responde el modelo a peticiones que normalmente serían rechazadas. No es una mejora de capacidades ni de veracidad.
- **Sin MTP nativo**: el README indica que el predictor de tokens múltiples (MTP) nativo no está incluido en la conversión GGUF.
- **Tool calling / agentes**: no hay información específica sobre soporte de tool calling o funciones agénticas para este checkpoint.

## Casos de uso

- **Investigación en alineación y seguridad**: permite estudiar el comportamiento de un modelo sin capa de rechazo, comparando respuestas con el modelo base para analizar el impacto de la ablación en la seguridad y la utilidad.
- **Red teaming y evaluación de robustez**: útil para probar la resistencia de sistemas de moderación y para desarrollar técnicas de detección de contenido no seguro en modelos de código abierto.
- **Benchmarks de jailbreak**: como modelo que no rechaza, sirve como base para evaluar la eficacia de técnicas de jailbreak en sistemas que sí tienen rechazo.
- **Experimentos en entornos aislados**: se puede desplegar en contenedores o sandboxes para pruebas de comportamiento sin riesgo de contaminación de datos de producción.
- **Prototipado multimodal local**: con la cuantización Q4_K_M y el proyector de imagen, se puede ejecutar en hardware consumer para probar pipelines de imagen-a-texto en GGUF.
- **Comparación de cuantizaciones**: permite evaluar cómo afecta la cuantización (BF16 vs Q4_K_M) a la calidad de las respuestas en un modelo de este tipo, tanto en texto como en visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible para este checkpoint abliterated ni para el modelo base. La única métrica de validación disponible es la tabla interna del README, que usa un scorer de rechazo basado en frases y una prueba de capacidad en 80 prompts:

| Cuantizacion | Archivo | Tamano | Flags dañinos | Flags benignos | Capacidad |
|---|---:|---:|---:|---:|---:|
| BF16 | `Ornith-1.5-9B-Abliterated-BF16.gguf` | 16,69 GiB | 0/100 | 0/100 | 71/80 |
| Q8_0 | `Ornith-1.5-9B-Abliterated-Q8_0.gguf` | 8,87 GiB | 0/100 | 0/100 | 72/80 |
| Q6_K | `Ornith-1.5-9B-Abliterated-Q6_K.gguf` | 6,85 GiB | 0/100 | 0/100 | 68/80 |
| Q4_K_M | `Ornith-1.5-9B-Abliterated-Q4_K_M.gguf` | 5,24 GiB | 0/100 | 0/100 | 68/80 |

Estos resultados son solo una pantalla temprana de rechazo en 256 tokens, no una evaluación completa de respuestas largas. No se pueden comparar con otros modelos porque no hay datos de referencia.

## Requisitos de hardware

- **VRAM estimada por cuantizacion** (solo el GGUF de texto, sin proyector de imagen):
  - Q4_K_M: ~5,24 GB + overhead de contexto y proyector F16 (~0,5 GB adicionales). Cabe en GPUs consumer de 8 GB (RTX 4060, RTX 3050).
  - Q6_K: ~6,85 GB. Adecuado para GPUs de 8-10 GB (RTX 3080, RTX 4060 Ti).
  - Q8_0: ~8,87 GB. Requiere GPUs de 10-12 GB o más (RTX 3080 12GB, RTX 4070 Ti).
  - BF16: ~16,69 GB. Recomendado para GPUs de 24 GB (RTX 4090, A100, H100).
- **GPU recomendadas**: consumer (RTX 4060, 4070, 4090) para las cuantizaciones pequeñas; datacenter (A100, H100) para BF16 y despliegues de baja latencia.
- **Opciones de despliegue**: llama.cpp (con `llama-server` y `--mmproj`), compatible con Ollama y otros frameworks que usan llama.cpp como backend. También existen versiones MLX para Apple Silicon (ver repos en la familia).
- **Latencia y throughput**: no se han publicado datos. En una RTX 4090, un modelo de ~9B en Q4_K_M suele generar entre 40-80 tokens/s, pero es una estimación genérica, no una medida del modelo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar este modelo con alternativas. El checkpoint es un derivado experimental de `ornith-ai/Ornith-1.5-9B`, por lo que la comparación más relevante es con el modelo base sin abliteration:

| Modelo | Parametros | Contexto | Licencia | Formato | Abliteration |
|---|---|---|---|---|---|
| `ornith-ai/Ornith-1.5-9B` | ~8,95B | no disponible | MIT | safetensors | No |
| `PocketAiHub/Ornith-1.5-9B-Abliterated-GGUF` | ~8,95B | no disponible | MIT | GGUF | Sí |

No se conocen modelos comparables con la misma modificación de abliteration en el ecosistema GGUF a esta escala. Otros modelos de ~9B como Llama-3.1-8B o Qwen2.5-7B tienen arquitecturas y rendimientos documentados, pero no son directamente comparables porque este checkpoint no tiene datos de rendimiento publicados.

## Limitaciones y advertencias

- **Comportamiento no seguro**: la abliteration elimina el rechazo aprendido, por lo que el modelo puede producir contenido dañino, ilegal, ofensivo, engañoso o peligrosamente incorrecto con más facilidad que el modelo base. No es una garantía de cumplimiento universal.
- **No es entrenamiento de veracidad**: la ablación no mejora la precisión factual ni las capacidades de razonamiento; puede producir información falsa con confianza.
- **Validación limitada**: los resultados de la tabla de validación se basan en prompts de 256 tokens y en un scorer de rechazo basado en frases. La revisión manual encontró redirecciones semánticas no detectadas, por lo que 0/100 flags no significa que el modelo sea totalmente sin rechazo.
- **Sin contexto documentado**: no se especifica la longitud de contexto, lo que impide planificar despliegues con ventanas largas de entrada.
- **Sin datos de idiomas**: no se declaran los idiomas soportados; es probable que el modelo base sea multilingüe, pero no está confirmado.
- **Uso comercial**: aunque la licencia es MIT, el uso en producción conlleva un riesgo legal y ético elevado por la naturaleza del checkpoint. Se recomienda evaluar y restringir los usos en entornos comerciales.
- **Sin MTP nativo**: el predictor de múltiples tokens no está incluido, lo que puede reducir el rendimiento de generación en comparación con el modelo base.

## Enlaces

- Repositorio GGUF abliterated: https://huggingface.co/PocketAiHub/Ornith-1.5-9B-Abliterated-GGUF
- Repositorio del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Variante GGUF oficial del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Variante MLX 6-bit del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-6bit
- Blog de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Web principal de Ornith AI: https://ornith.ai/
- Artículo de OfficeChai sobre la familia Ornith-1.5: https://officechai.com/ai/deepreinforce-releases-open-source-orinth-1-5-family-of-models-with-solid-benchmarks-and-mit-license/
