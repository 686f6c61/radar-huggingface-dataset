# Patricale/Italian_GPT_mlx

## Resumen

Italian_GPT_mlx es un modelo de lenguaje de tipo GPT, decoder-only, desarrollado por Patricale como proyecto didáctico y publicado bajo licencia MIT. Se trata de un transformer de 12.194.688 parámetros escrito desde cero con la librería MLX de Apple y entrenado en un MacBook Pro M4 Pro sobre 29 libros italianos de dominio público procedentes de Project Gutenberg. Su objetivo no es la producción de texto útil, sino servir como material de estudio para comprender la mecánica interna de un modelo de lenguaje: tokenizador BPE propio, atención con RoPE, RMSNorm, weight tying y bucle de entrenamiento manual.

El modelo emplea una arquitectura compacta de 6 capas, 6 cabezas de atención, dimensión de modelo 384 y una ventana de contexto de solo 256 tokens. El vocabulario es de 4096 tokens mediante un tokenizador BPE a nivel de byte implementado por el autor. El corpus de entrenamiento suma 3,89 millones de tokens de entrenamiento y 0,43 millones de validación, lo que da aproximadamente 12,6 pasadas sobre los datos durante los 3000 pasos de entrenamiento.

Su relevancia es exclusivamente educativa y de investigación formativa: no es un modelo de `transformers`, requiere el código incluido en el repositorio para cargarse, y el autor advierte explícitamente de que no debe usarse en aplicaciones reales. Es útil para quien quiera estudiar el pipeline completo de un LLM pequeño (tokenización, entrenamiento, generación con temperatura y top-p) en hardware de consumo Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-norm, weight tying entre embedding y LM head |
| Parametros totales | 12.194.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (aprox. 800 caracteres) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizacion documentada) |
| Idiomas soportados | Italiano (registro literario de los siglos XIX y principios del XX) |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere el codigo del repositorio, no compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con pre-normalización, 6 capas y 6 cabezas de atención, con `d_model` de 384 y MLP con activación GELU y ratio de expansión 4. Las posiciones se codifican mediante RoPE (Rotary Position Embedding) y la normalización usa RMSNorm. El modelo aplica weight tying entre la matriz de embedding y la cabeza de lenguaje, lo que reduce el recuento de parámetros. El tokenizador es un BPE a nivel de byte con vocabulario de 4096, escrito desde cero por el autor. No es una arquitectura de la librería `transformers`: para cargarlo se necesita la carpeta `minigpt/` del repositorio, de aproximadamente 1000 líneas comentadas.

El entrenamiento se realizó sobre 29 libros italianos de dominio público de Project Gutenberg (Manzoni, Dante, Leopardi, Collodi, Pirandello, Fogazzaro, De Amicis, Deledda, Salgari, D'Annunzio, Capuana, Serao, De Roberto, Rovetta, entre otros), con un total de 14,1 millones de caracteres, equivalentes a 3,89 millones de tokens de entrenamiento y 0,43 millones de validación (división 90/10 dentro de cada libro para que todos los autores aparezcan en validación). Se ejecutaron 3000 pasos con batch de 64 × 256 tokens (unas 12,6 pasadas sobre el corpus), optimizador AdamW implementado a mano con β = (0,9, 0,95) y weight decay 0,1, learning rate 6e-4 con 200 pasos de warmup y decaimiento coseno hasta 6e-5, dropout 0,2 y gradient clipping a 1,0. El entrenamiento completo llevó aproximadamente 29 minutos en un MacBook Pro M4 Pro con 24 GB de memoria unificada. No se documenta uso de RLHF, DPO ni fine-tuning por preferencias.

## Capacidades

- Generación de texto en italiano literario de los siglos XIX y principios del XX, con ortografía, puntuación y diálogos casi siempre bien formados.
- Continuación de texto a partir de un prompt, con muestreo controlado por temperatura y top-p.
- Coherencia limitada a la frase individual: el significado no se sostiene más allá de una oración y ocasionalmente aparecen palabras inventadas.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Multilingüismo inexistente: solo italiano, y únicamente en el registro de su corpus de entrenamiento.
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Estudio didáctico de la arquitectura transformer: el repositorio incluye un manual que explica cada componente, por lo que el modelo sirve para experimentar con atención, RoPE, RMSNorm y weight tying en un entorno controlado.
- Práctica de implementación de tokenizadores BPE: el tokenizador de 4096 tokens está escrito desde cero y puede usarse como referencia para entender la construcción de vocabularios a nivel de byte.
- Reproducción de un pipeline de entrenamiento completo en hardware de consumo: los 29 minutos de entrenamiento en un M4 Pro permiten reproducir el ciclo entero (datos, bucle, validación) sin infraestructura de GPU.
- Experimentos de regularización y sobreajuste: el autor documenta que sin dropout el modelo sobreajusta tras 2000 pasos (mejor loss 3,628 frente a 3,540 con dropout), lo que convierte al modelo en un caso de estudio sobre corpus pequeños frente a recuentos de parámetros.
- Generación de texto de estilo histórico para demostraciones o pruebas de concepto: útil para ilustrar cómo un modelo pequeño imita el registro literario italiano sin pretensión de utilidad real.
- Docencia y talleres sobre LLM: el tamaño reducido (12M parámetros) y la licencia MIT permiten inspeccionar pesos, modificar la configuración y ejecutar el modelo en un portátil Apple Silicon durante sesiones formativas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Loss de validacion | 3,540 |
| Perplexity de validacion | 34,5 |

La evaluación se realizó sobre 20 batches fijos del conjunto de validación. Sin dropout, el mismo modelo alcanza una mejor loss de 3,628 tras 2000 pasos, momento a partir del cual entra en sobreajuste. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB para los pesos en safetensors (12,19 M de parámetros en precisión nativa), más el overhead de MLX y del tokenizador.
- GPU recomendadas: no aplica en el sentido convencional; el modelo está diseñado para Apple Silicon mediante MLX. El autor lo entrenó y ejecutó en un MacBook Pro M4 Pro con 24 GB de memoria unificada.
- Cabe en GPU de consumo: sí, por tamaño, pero requiere MLX (Apple Silicon). No se documenta soporte para CUDA ni para GPUs NVIDIA.
- Opciones de despliegue: exclusivamente mediante el código del repositorio (`minigpt/`) con MLX, NumPy y PyYAML. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El entrenamiento completo de 3000 pasos tardó aproximadamente 29 minutos en un M4 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / ecosistema | Proposito |
|---|---|---|---|---|---|
| Italian_GPT_mlx (Patricale) | 12,19 M | 256 tokens | MIT | safetensors + MLX, codigo propio | Educativo, italiano literario |
| Modelos GPT-2 pequenos (referencia) | 124 M | 1024 tokens | MIT | safetensors, `transformers` | Generacion generalista |
| Modelos tipo nanoGPT (Karpathy) | variable (~10-120 M) | variable | MIT | PyTorch, codigo propio | Educativo, ingles |
| Modelos italianos open source de gran escala | no disponible | no disponible | variable | variable | Produccion |

La comparación directa con alternativas de la misma categoría (modelos GPT didácticos de ~10-100 M de parámetros) es limitada porque no se dispone de datos de benchmarks comparables en la información proporcionada. Frente a nanoGPT, la diferencia principal es el ecosistema (MLX frente a PyTorch) y el idioma del corpus (italiano frente a inglés). Frente a GPT-2 pequeño, la diferencia de escala es de un orden de magnitud en parámetros y de cuatro veces en contexto.

## Limitaciones y advertencias

- El modelo no comprende ni conoce hechos: produce texto de apariencia plausible sin coherencia más allá de la frase y sin fiabilidad factual alguna.
- Solo maneja italiano literario de época: el léxico, la grafía y la puntuación son los de los libros de entrenamiento (por ejemplo, diálogos introducidos con `--` o `—`). Sobre texto moderno, técnico o en otros idiomas el resultado empeora.
- Los textos de entrenamiento reflejan su época, incluidos estereotipos y lenguaje hoy inaceptable, que el modelo puede reproducir.
- Contexto de solo 256 tokens (aproximadamente 800 caracteres); más allá, la generación conserva únicamente la parte final del texto.
- No ha sido evaluado para ningún uso práctico y el autor advierte explícitamente de que no debe usarse en aplicaciones reales.
- La licencia MIT permite uso comercial, pero la calidad y las limitaciones del modelo lo hacen inadecuado para producción.
- No es compatible con `transformers` ni con los pipelines estándar de despliegue, lo que limita su integración en infraestructuras convencionales.
- Riesgo de alucinación total en cualquier afirmación factual: el modelo no tiene conocimiento del mundo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Patricale/Italian_GPT_mlx
- Repositorio de código, tests, experimentos y manual: https://github.com/patricale/mini-gpt-mlx
- Librería MLX: https://github.com/ml-explore/mlx
- Project Gutenberg (fuente de los datos): https://www.gutenberg.org
