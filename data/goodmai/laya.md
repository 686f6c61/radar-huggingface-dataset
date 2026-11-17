# goodmai/laya

## Resumen

Laya es un modelo de lenguaje de 421 millones de parámetros (421.293.830 según los pesos en safetensors) publicado por el usuario goodmai en Hugging Face. Se distribuye en formato MLX, la librería de Apple para ejecutar modelos en chips Apple Silicon, y está etiquetado con los tags `mlx`, `basalt` y `apple-silicon`, lo que sitúa su ámbito de uso en el ecosistema macOS con hardware de Apple. El modelo card lo referencia como modelo de decisión (`--decision-model`) dentro de la herramienta Basalt v0.11.0, una aplicación y CLI en Swift para ejecutar modelos localmente sin Python.

La información pública disponible es muy escasa: no se especifican licencia, idiomas, pipeline ni detalles de entrenamiento o arquitectura más allá del número de parámetros. El repositorio ocupa 0,8 GB, coherente con un modelo de ~421 M de parámetros almacenado en precisión de 16 bits. El modelo card apunta como fuente upstream a `convaiinnovations/laya`, lo que sugiere que se trata de una conversión o redistribución en formato MLX de un modelo previo.

Por su tamaño y su rol declarado como "decision model" dentro de un pipeline con un modelo mayor (gemma-4-12B-it-qat-4bit), laya parece concebido para tareas auxiliares de enrutamiento o decisión más que como modelo generativo generalista. Cualquier evaluación adicional queda limitada por la ausencia de documentación técnica publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (probable transformer decoder-only; no confirmado) |
| Parámetros totales | 421.293.830 |
| Parámetros activos | no aplica (no hay indicios de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el repo ocupa 0,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. El número de parámetros (421 M) y el formato MLX apuntan a un transformer decoder-only de tamaño pequeño, pero no hay confirmación del autor. Tampoco se detallan datos de entrenamiento: no se indica el número de tokens, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada.

El único dato técnico relevante es su integración en Basalt v0.11.0 como `--decision-model`, un rol auxiliar que en la arquitectura de la herramienta se ejecuta junto a un modelo principal de mayor tamaño. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- Por su rol declarado como modelo de decisión en Basalt, se infiere un uso orientado a tareas de enrutamiento o clasificación dentro de un pipeline, aunque el autor no lo detalla.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Modelo de decisión en pipelines locales de macOS: el modelo card lo presenta como `--decision-model` de Basalt, por lo que su uso previsto es asistir en decisiones de enrutamiento junto a un modelo principal mayor, ejecutándose en Apple Silicon.
- Prototipado en Apple Silicon sin Python: al distribuirse en MLX y estar integrado en una CLI en Swift, permite experimentar con inferencia local en macOS sin dependencias de Python.
- Evaluación de modelos pequeños en local: con 421 M de parámetros y 0,8 GB de repositorio, es viable para pruebas de concepto de inferencia local en equipos con memoria unificada modesta.
- Investigación sobre modelos auxiliares de decisión: útil para estudiar cómo un modelo pequeño puede complementar a uno grande en tareas de selección o clasificación.
- Experimentación con el ecosistema MLX: sirve como ejemplo práctico de conversión y despliegue de pesos en formato MLX.
- Integración en flujos de trabajo de la aplicación Basalt: su caso de uso más directo es operar dentro de la herramienta del autor, no como modelo independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: con 421 M de parámetros, en fp16 ocupa aproximadamente 0,84 GB de pesos; en cuantizaciones de 8 bits bajaría a ~0,42 GB y en 4 bits a ~0,21 GB (estimación por tamaño, no confirmada por el autor).
- Hardware objetivo: Apple Silicon (macOS 27+, Swift 6.4 según el model card), con memoria unificada compartida entre CPU y GPU.
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo declarado; el formato MLX está orientado a Apple Silicon.
- Despliegue: MLX y Basalt v0.11.0 (aplicación macOS y CLI). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| laya (goodmai) | 421 M | no disponible | no disponible | MLX safetensors | Hugging Face, 28 descargas |
| convaiinnovations/laya (upstream) | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado) |
| Alternativas de ~400 M en MLX | no disponible | no disponible | no disponible | MLX | no disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre arquitectura, entrenamiento, datos ni evaluación, lo que impide validar su calidad.
- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas no declarados: se desconoce si soporta castellano u otros idiomas.
- Riesgo de alucinación y sesgos: no evaluables sin benchmarks ni documentación.
- Contexto desconocido: no se puede planificar su uso en tareas que requieran ventanas largas.
- Modelo con muy poca tracción (28 descargas, 0 likes) y sin pipeline declarado: no hay señales de validación por parte de la comunidad.
- Dependencia del ecosistema Basalt/MLX: su uso fuera de ese entorno no está documentado.
- El model card contiene texto en ruso y botones promocionales; no aporta especificaciones técnicas sustantivas.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/laya
- Modelo upstream referenciado: https://huggingface.co/convaiinnovations/laya
- Repositorio Basalt: https://github.com/goodmai/basalt/releases/tag/v0.11.0
- Sitio web de Basalt: https://bas-alt.vercel.app
- Demo de ejecución: https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2Flaya&role=decide
