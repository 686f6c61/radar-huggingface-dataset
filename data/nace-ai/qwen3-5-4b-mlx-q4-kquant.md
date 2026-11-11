# nace-ai/Qwen3.5-4B-MLX-Q4-KQuant

## Resumen

Qwen3.5-4B-MLX-Q4-KQuant es una cuantización en 4 bits del modelo Qwen/Qwen3.5-4B, publicada por nace-ai para su uso en Apple Silicon mediante la librería MLX. El modelo base lo desarrolla el equipo Qwen (Alibaba) y es un modelo multimodal de tipo image-text-to-text, es decir, acepta tanto texto como imágenes como entrada. Esta versión concreta emplea KQuant, el marco de cuantización propio de Nace.AI, y está pensada para ejecutarse en Macs con el motor de inferencia local Kapitsa o con mlx-lm.

El interés de esta ficha radica en que no se trata de una cuantización genérica: el autor publica métricas de fidelidad frente al modelo original en bf16 (distancia KL, tasa de acuerdo en el siguiente token y resultados en GSM8K) y las compara con el pack de lmstudio-community, el estándar de facto para MLX en 4 bits. Según esos datos, KQuant se sitúa más cerca del modelo original y es algo más rápido en generación.

El modelo tiene 4.539.265.536 parámetros totales y un repositorio de 3,1 GB. La licencia es Apache 2.0, heredada del modelo base. La información pública disponible no detalla la arquitectura interna del modelo base, la longitud de contexto ni la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B; familia Qwen3.5) |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (KQuant, formato MLX); no se documentan otros niveles en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.5-4B en la documentación proporcionada. La model card de esta cuantización se centra en el proceso de compresión y no describe el transformer subyacente, el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica documentada es el propio proceso KQuant. Según el autor, la cuantización se calibra sobre texto real (no solo sobre las distribuciones de pesos) y aplica una búsqueda de ajuste óptimo por grupo de pesos, en lugar de redondear todos los grupos de la misma forma. El resultado declarado es una distancia KL de 0,048 frente al modelo bf16, frente a 0,070 del pack de lmstudio-community, y una tasa de acuerdo en el siguiente token del 89,9 % frente al 88,1 %. El pipeline declarado es image-text-to-text, aunque el quickstart de la model card solo demuestra generación de texto con mlx-lm.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y soporte de modo thinking (configurable mediante `enable_thinking` en la plantilla de chat).
- Entrada multimodal image-text-to-text según el pipeline declarado en el repositorio; la model card no detalla el alcance exacto de la comprensión de imágenes.
- Razonamiento matemático: el autor evalúa el modelo con GSM8K completo (1.319 preguntas) en modo zero-shot y sin thinking.
- Generación de código: se usa HumanEval como parte del conjunto de evaluación de fidelidad de la cuantización.
- Ejecución local en Apple Silicon mediante MLX, con soporte en mlx-lm 0.32.2 y en el motor Kapitsa.
- Servido local con `kapitsa serve`, incluida la opción `--private`.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede servirse con `kapitsa serve` y ofrecer una interfaz de chat en la dirección local que imprime el servidor, sin enviar datos a la nube. Es adecuado por su tamaño de 3,1 GB y su licencia Apache 2.0.
- Generación de texto en aplicaciones de escritorio para Apple Silicon: con mlx-lm 0.32.2 y el comando documentado se puede integrar la generación en scripts y herramientas locales, con control de temperatura, top-p, top-k y min-p.
- Prototipado de aplicaciones multimodales: al declarar el pipeline image-text-to-text, sirve para experimentar con entradas de imagen y texto en local antes de decidir si se necesita un modelo mayor.
- Evaluación de cuantizaciones: el repositorio incluye protocolo de medición reproducible (KL sobre 32.768 tokens de WikiText-2, chats de GSM8K y código de HumanEval), útil para equipos que comparan packs de 4 bits antes de fijar uno en producción.
- Razonamiento matemático de nivel escolar en local: los resultados de GSM8K (0,923 en esta cuantización) permiten usarlo en herramientas educativas o de verificación de cálculos sin depender de APIs externas.
- Asistencia de código en el editor: dado que el autor evalúa el modelo sobre HumanEval y que el formato MLX se integra en herramientas locales, puede emplearse para autocompletado y explicación de fragmentos en un flujo de desarrollo en Mac.
- Despliegue con requisitos de privacidad: la opción `--private` de Kapitsa y la ejecución totalmente local lo hacen apto para entornos donde el texto no puede salir del dispositivo.

## Benchmarks y rendimiento

Los datos publicados comparan esta cuantización con el pack de lmstudio-community/Qwen3.5-4B-MLX-4bit, no con el modelo bf16 en términos absolutos salvo en las métricas de fidelidad.

| Prueba | lmstudio-community (4 bits) | KQuant (este repo) |
|---|---:|---:|
| KL frente al modelo bf16 (menor es mejor) | 0,070 | 0,048 |
| Acuerdo con el bf16 en el siguiente token | 88,1 % | 89,9 % |
| GSM8K (1.319 preguntas, zero-shot, greedy, sin thinking) | 0,914 | 0,923 |

En GSM8K, 35 preguntas solo las acierta el pack de lmstudio-community y 47 solo KQuant; el autor indica que la diferencia no es medible (McNemar z = 1,33).

Rendimiento medido en un MacBook Pro M5 Pro de 48 GB con Kapitsa 0.2.33:

| Escenario | lmstudio-community (tok/s) | KQuant (tok/s) |
|---|---:|---:|
| Escritura, temperatura 0,6 | 199 | 228 |
| Escritura, greedy | 219 | 226 |
| Lectura de un prompt de 4K tokens | 3.832 | 4.080 |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 3,1 GB, por lo que se necesita al menos esa cantidad más el espacio de trabajo del runtime; el autor ha medido el modelo en un Mac con 48 GB de memoria unificada.
- El modelo está diseñado para Apple Silicon y la librería MLX; no se documenta soporte para GPU NVIDIA ni ROCm en esta ficha.
- El equipo más pequeño medido por el autor es un MacBook Pro con M5 Pro y 48 GB. No se confirma que quepa en configuraciones de 16 GB o 24 GB.
- Opciones de despliegue: mlx-lm 0.32.2 (comando `mlx_lm.generate`) y Kapitsa (`kapitsa serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido en M5 Pro de 48 GB: 226-228 tok/s en escritura y 4.080 tok/s en lectura de un prompt de unos 4K tokens, con el drafting por defecto de Kapitsa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-4B-MLX-Q4-KQuant | 4,54 mil millones | no disponible | MLX 4 bits, safetensors | Apache 2.0 | KL 0,048; GSM8K 0,923; 228 tok/s en M5 Pro |
| lmstudio-community/Qwen3.5-4B-MLX-4bit | 4,54 mil millones (base) | no disponible | MLX 4 bits | Apache 2.0 (heredada) | KL 0,070; GSM8K 0,914; 199 tok/s en M5 Pro |
| nace-ai/Qwen3.5-9B-MLX-4bit-KQuant | no disponible | no disponible | MLX 4 bits | Apache 2.0 (heredada) | Versión de 9B del mismo autor y formato; sin datos de rendimiento en esta ficha |

## Limitaciones y advertencias

- Solo se ha validado en Apple Silicon con MLX; no hay evidencia publicada de funcionamiento en otras plataformas o runtimes.
- La model card solo demuestra generación de texto; aunque el pipeline declarado es image-text-to-text, no se documenta el comportamiento con imágenes ni su calidad.
- El quickstart con mlx-lm no expone penalizaciones de presencia ni de repetición, lo que puede afectar a la calidad en generaciones largas.
- No se detallan sesgos conocidos, tasas de alucinación ni comportamiento multilingüe del modelo base en la información disponible.
- La evaluación de calidad se limita a KL, acuerdo en el siguiente token y GSM8K; no hay benchmarks de razonamiento general, código o seguridad.
- La diferencia en GSM8K frente al pack de lmstudio-community no es estadísticamente significativa según el propio autor.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base Qwen/Qwen3.5-4B por si añaden condiciones adicionales.
- El rendimiento medido corresponde a un único equipo (M5 Pro, 48 GB, macOS 26.5.2); en hardware inferior las cifras pueden ser muy distintas.
- El número de descargas (115) y de likes (0) indica una adopción todavía muy limitada, con poca validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-4B-MLX-Q4-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión de 9B del mismo autor: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-4bit-KQuant
- Pack de comparación de lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.5-4B-MLX-4bit
- Motor de inferencia Kapitsa: https://github.com/nace-ai/kapitsa
- Sección KQuant del README de Kapitsa: https://github.com/nace-ai/kapitsa#kquant
- Registro de resultados de benchmarks: https://github.com/nace-ai/kapitsa/blob/main/bench/results/2026-11-10-m5-pro-kquant/README.md
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Nace.AI: https://www.nace.ai/
