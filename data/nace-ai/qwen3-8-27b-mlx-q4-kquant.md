# nace-ai/Qwen3.8-27B-MLX-Q4-KQuant

## Resumen

Qwen3.8-27B-MLX-Q4-KQuant es una cuantización de 4 bits en formato MLX del modelo Qwen/Qwen3.8-27B, publicada por nace-ai. El paquete está construido con KQuant, un esquema de cuantización propio del autor que busca acercarse más al modelo original en precisión (bf16) que los packs de 4 bits de referencia de la comunidad MLX. El modelo resultante ocupa unos 16,3 GB de pesos y está pensado para ejecutarse localmente en Macs con Apple Silicon.

El modelo base es multimodal (pipeline image-text-to-text), con 27.356.728.560 parámetros totales según los safetensors del repo, y se distribuye bajo licencia Apache 2.0. La cuantización preserva la torre de visión en el paquete, aunque las evaluaciones publicadas se centran exclusivamente en cargas de texto. La inferencia se realiza con mlx-lm o con Kapitsa, el motor de inferencia local de Nace.AI para Apple Silicon.

La relevancia de esta ficha reside en que ofrece una alternativa de cuantización con métricas de fidelidad publicadas (KL y acuerdo de siguiente token frente al modelo bf16) y comparación directa contra packs de lmstudio-community, mlx-community y mlx-works, algo poco habitual en cuantizaciones de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; familia qwen3_5 según tags) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (MLX, esquema KQuant) |
| Idiomas soportados | no disponible (tokenizer idéntico al base en inglés, código, matemáticas, CJK, emoji y texto RTL; devanagari y tailandés no medidos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4 bits |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentación proporcionada (más allá de la etiqueta qwen3_5 y su naturaleza multimodal image-text-to-text). Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo fases de RLHF o DPO. Esta ficha describe el paquete cuantizado, no el modelo original.

La innovación técnica del paquete es el esquema KQuant, aplicado sobre los pesos del modelo base para producir una representación de 4 bits. Según el autor, KQuant reduce la divergencia respecto a bf16 en comparación con los packs de 4 bits de lmstudio-community y mlx-community: KL de 0,034936 (IC 95%: 0,031795–0,038471) frente a 0,054384 y 0,053761 respectivamente, y acuerdo de siguiente token del 92,87% frente a 91,21% y 91,15%. La medición se realizó sobre 32.704 tokens de WikiText-2, conversaciones de GSM8K y código de HumanEval, comparando contra Qwen/Qwen3.8-27B en bf16 (revisión 37561816). Los pesos de texto puntuados ocupan 15,13 GB; el resto hasta los 16,29 GB descargados corresponde a pesos auxiliares, incluida la torre de visión.

## Capacidades

- Generación de texto conversacional, con plantilla de chat y opción de modo thinking (enable_thinking) configurable.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque la torre de visión no fue evaluada en las pruebas publicadas.
- Razonamiento matemático: evaluado en GSM8K con resultado de 0,953 en zero-shot, greedy y thinking desactivado.
- Generación de código: incluido en el corpus de evaluación de fidelidad (HumanEval), aunque sin resultados de benchmark publicados.
- Capacidades multilingües heredadas del modelo base: el tokenizer coincide en inglés, código, matemáticas, CJK, emoji y texto RTL; devanagari y tailandés no fueron medidos.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente conversacional local en Mac: el paquete se sirve con `kapitsa serve` y expone una interfaz web local, adecuado para prototipos y uso personal sin enviar datos a la nube.
- Generación de texto por línea de comandos: mediante `mlx_lm.generate` con plantilla de chat y modo thinking desactivable, útil para scripting y automatización de tareas de redacción.
- Razonamiento matemático asistido: el rendimiento en GSM8K (0,953) lo hace apto para resolver problemas aritméticos de varios pasos en entornos educativos o de validación.
- Procesamiento de documentos con imagen: al conservar la torre de visión, puede emplearse en tareas image-text-to-text, aunque sin métricas publicadas que garanticen su calidad en ese modo.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de distintos esquemas de 4 bits sobre un mismo modelo base, gracias a las métricas KL y de acuerdo publicadas.
- Desarrollo y pruebas offline en Apple Silicon: al ocupar 16,3 GB de pesos, cabe en equipos con 48 GB de memoria unificada (probado en un MacBook Pro M5 Pro), lo que permite iterar sin conexión.
- Investigación sobre fidelidad de cuantización: el repositorio incluye el registro completo de resultados y las identidades de los packs comparados, útil para reproducir experimentos.

## Benchmarks y rendimiento

| Prueba | lmstudio-community 4-bit | KQuant (este repo) |
|---|---|---|
| KL frente a bf16 (menor es mejor) | 0,054 | 0,035 |
| Acuerdo de siguiente token con bf16 | 91,2% | 92,9% |
| GSM8K (1.319 preguntas) | 0,950 | 0,953 |

En GSM8K, 13 preguntas solo las acierta el pack de lmstudio-community y 17 solo KQuant; la diferencia no es medible (McNemar z = 0,73). El resto de comparativas de fidelidad entre packs MLX públicos se recoge en la tabla siguiente:

| Pack | GB descargados | KL (IC 95%) | Acuerdo de siguiente token |
|---|---:|---|---:|
| KQuant (este repo) | 16,293 | 0,034936 [0,031795, 0,038471] | 92,87% |
| lmstudio-community MLX-4bit | 16,055 | 0,054384 [0,049780, 0,059621] | 91,21% |
| mlx-community 4bit | 16,055 | 0,053761 [0,049395, 0,058618] | 91,15% |
| mlx-works oQ4e-mtp | 16,972 | 0,035848 [0,033524, 0,038315] | 92,59% |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, etc.) en la información disponible. Las cifras de velocidad del modelo se truncan en la model card proporcionada y no pueden reproducirse aquí.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 16,3 GB de pesos descargados; se recomienda al menos 24 GB de memoria unificada para dejar margen al contexto y a la torre de visión. La prueba de velocidad se realizó en un MacBook Pro M5 Pro con 48 GB.
- GPU recomendadas: Apple Silicon (series M1 a M5). La inferencia con mlx-lm se probó en una H100 mediante Modal con MLX sobre CUDA para las mediciones de calidad, pero el destino del paquete es Apple Silicon.
- Compatibilidad con GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no está pensado para GPUs NVIDIA de consumo con CUDA.
- Opciones de despliegue: mlx-lm (versión 0.32.2 en los ejemplos) y Kapitsa (`kapitsa serve --model nace-ai/Qwen3.8-27B-MLX-4bit-KQuant --private`).
- Latencia y throughput: la model card incluye una tabla de velocidad en tok/s para M5 Pro de 48 GB, pero los valores no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Fidelidad (KL) |
|---|---|---|---|---|---|
| nace-ai/Qwen3.8-27B-MLX-Q4-KQuant | 27,36B | no disponible | Apache 2.0 | MLX 4-bit | 0,035 |
| lmstudio-community/Qwen3.8-27B-MLX-4bit | 27,36B (base) | no disponible | Apache 2.0 (base) | MLX 4-bit | 0,054 |
| mlx-community/Qwen3.8-27B-4bit | 27,36B (base) | no disponible | Apache 2.0 (base) | MLX 4-bit | 0,054 |
| mlx-works/Qwen3.8-27B-oQ4e-mtp | 27,36B (base) | no disponible | no disponible | MLX 4-bit | 0,036 |

Los tres packs comparados derivan del mismo modelo base Qwen/Qwen3.8-27B, por lo que comparten parámetros y capacidades; las diferencias se limitan al esquema de cuantización, el tamaño de descarga y la fidelidad medida. KQuant obtiene el mejor KL y el mayor acuerdo de siguiente token, con un tamaño de descarga ligeramente superior al de lmstudio-community y mlx-community (16,29 GB frente a 16,05 GB).

## Limitaciones y advertencias

- Las métricas de calidad se midieron solo sobre cargas de texto; la torre de visión está incluida en el paquete pero no fue evaluada, por lo que su comportamiento multimodal no está validado.
- La evaluación de fidelidad se limita a 32.704 tokens de WikiText-2, GSM8K y HumanEval; no cubre dominios como derecho, medicina o lenguajes de programación poco frecuentes.
- El tokenizer utilizado en las pruebas fue el del pack del catálogo, no el del propio repo; aunque los ids coinciden en inglés, código, matemáticas, CJK, emoji y texto RTL, no se midieron devanagari ni tailandés.
- Los idiomas soportados no están declarados explícitamente en la model card; deben inferirse del modelo base.
- Riesgo de alucinación y sesgos: no hay información específica publicada para este paquete; son los heredados del modelo base Qwen3.8-27B, no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B por si impusieran restricciones adicionales.
- El paquete está orientado a Apple Silicon y a los motores mlx-lm y Kapitsa; no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin conversión adicional.
- La CLI de mlx-lm no expone penalizaciones de presencia ni de repetición, lo que limita el control fino de la generación en ese modo.
- El repositorio tiene 40 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía muy reducida.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-Q4-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Sección KQuant del README de Kapitsa: https://github.com/nace-ai/kapitsa#kquant
- Instalación de Kapitsa: https://github.com/nace-ai/kapitsa#install
- Registro de resultados de benchmarks: https://github.com/nace-ai/kapitsa/blob/main/bench/results/2026-11-10-m5-pro-kquant-27b/README.md
- Nace.AI: https://www.nace.ai/
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Instalación de uv: https://docs.astral.sh/uv/getting-started/installation/
- Pack KQuant de 9B: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-4bit-KQuant
- Pack de comparación lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.8-27B-MLX-4bit
