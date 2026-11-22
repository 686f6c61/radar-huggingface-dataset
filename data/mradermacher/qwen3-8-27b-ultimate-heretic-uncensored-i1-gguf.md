# mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF

## Resumen
Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF es una cuantización GGUF con imatrix del modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, un fine-tuning de la familia Qwen3.8 orientado a eliminar restricciones de contenido (pipeline "heretic") y a maximizar el rendimiento en razonamiento, escritura creativa y código. El modelo original parte de una base de aproximadamente 27.320 millones de parámetros y ha sido sometido a un entrenamiento multi-etapa denominado por el autor "Cold Fusion", "GAIN Training" y "Multi-stage tuning", con datasets propios (Polar-STRICT y F451-STRICT). El resultado es un modelo denso de gran tamaño, pensado para uso conversacional y de generación libre.

La relevancia de esta ficha radica en que mradermacher publica una batería completa de cuantizaciones con imatrix (desde i1-Q2_K de 11 GB hasta i1-Q6_K de 22,5 GB), lo que permite ejecutar un modelo de 27B en hardware de consumo con pérdida de calidad controlada. Frente a las cuantizaciones estáticas (disponibles en un repositorio hermano), las variantes i1 incorporan una matriz de importancia que mejora la fidelidad en bits bajos. Es, por tanto, una opción práctica para quienes necesitan un modelo grande, sin censura y desplegable localmente.

No obstante, conviene subrayar que se trata de un fine-tuning de la comunidad, no de un modelo oficial de Alibaba, y que la model card del cuantizador no aporta datos de benchmarks ni especificaciones de contexto. La información disponible se limita a metadatos de Hugging Face, la lista de cuantizaciones y los tags del autor del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de la familia Qwen3.8; detalles no disponibles) |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas declarados) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors/bfloat16 |

## Arquitectura y entrenamiento
El modelo base es un transformer denso de 27,32 mil millones de parámetros, derivado de la línea Qwen3.8 según los tags del autor (`qwen3_8`, `qwen3_6`). No se dispone de información sobre el número de capas, dimensión oculta, cabezas de atención ni mecanismos específicos (atención lineal, decodificación especulativa, etc.). El autor declara entrenamiento en bfloat16 y un proceso de ajuste fino multi-etapa con las etiquetas "Cold Fusion", "GAIN Training" y "Multi-stage tuning", apoyado en los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. También menciona el uso de Unsloth en el pipeline.

La componente "heretic" hace referencia a la técnica de ablación de direcciones de rechazo para reducir la censura del modelo, un procedimiento habitual en la comunidad para obtener variantes "uncensored". Los tags indican además 27 modos de razonamiento, 27 modos de instrucción, 15 "AI Constructs", 5 "Super AI Constructs", 21 "AGI Constructs" y 9 modos de razonamiento "Xhigh", aunque no se documenta en la información disponible cómo se activan ni qué implican técnicamente. La cuantización i1 aplica una matriz de importancia (imatrix) generada por mradermacher para mejorar la relación calidad/tamaño en bits bajos.

## Capacidades
- Generación de texto conversacional multi-turno en 16 idiomas (incluido el español).
- Razonamiento y modos de "thinking" declarados por el autor (27 modos de razonamiento y 9 modos "Xhigh").
- Generación de código y tareas de programación (tag `coder`).
- Escritura creativa, ficción, narrativa y roleplaying en múltiples géneros (tags `creative writing`, `story`, `fiction`, `roleplaying`).
- Modos de instrucción específicos (27 modos de instruct) y "constructs" orientados a brainstorming, enseñanza, agentes y negocio.
- Uso conversacional general ("all use cases" según el autor).
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni agentes multi-paso en la información disponible.

## Casos de uso
- Escritura creativa y narrativa larga: el modelo está ajustado específicamente para ficción, cuentos y roleplaying, con modos dedicados a distintos géneros; su tamaño de 27B permite mantener coherencia estilística en textos extensos.
- Asistente conversacional local sin censura: útil para prototipos de chatbot donde se requiere baja restricción de contenido, desplegado con llama.cpp u Ollama en una estación de trabajo con GPU de 24 GB usando i1-Q4_K_M (16,9 GB).
- Generación de código en entornos de desarrollo: el tag `coder` y los modos de instrucción permiten usarlo como asistente de programación en IDE o pipelines locales, aunque sin garantías de tool calling documentado.
- Roleplaying y simulación de personajes: los modos "AI Constructs" y la orientación a ficción lo hacen adecuado para motores de rol o videojuegos narrativos.
- Traducción y generación multilingüe: con 16 idiomas declarados (incluidos español, francés, alemán, chino, japonés, árabe), puede emplearse en tareas de traducción o generación multilingüe, siempre validando la calidad por idioma.
- Experimentación e investigación en alineación: al ser una variante "heretic" sin censura, sirve para estudiar comportamientos del modelo base frente a su versión alineada, comparando respuestas y sesgos.
- Fine-tuning posterior: al estar bajo licencia Apache 2.0 y con pesos GGUF y base en bfloat16, puede servir como punto de partida para ajustes adicionales (siempre que se use la versión safetensors del modelo base).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada según cuantización (tamaño de fichero, sin contar overhead de contexto): i1-Q2_K ≈ 11 GB; i1-IQ3_S ≈ 12,7 GB; i1-Q4_K_M ≈ 16,9 GB; i1-Q5_K_M ≈ 19,6 GB; i1-Q6_K ≈ 22,5 GB.
- GPU recomendadas: para i1-Q4_K_M o superiores, RTX 3090/4090 (24 GB) o A100/H100; para i1-Q2_K e i1-IQ3_S puede intentarse en GPUs de 12-16 GB con contexto reducido o con offload parcial a CPU.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con cuantizaciones IQ3 o Q3 y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio incluye fichero imatrix para generar cuantizaciones propias.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF (este) | 27,32 B | no disponible | Apache 2.0 | GGUF i1 (imatrix) | Fine-tuning "uncensored" de la comunidad, 16 idiomas |
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-GGUF (estático) | 27,32 B | no disponible | Apache 2.0 | GGUF estático | Mismo modelo base, cuantizaciones sin imatrix |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27,32 B | no disponible | Apache 2.0 | safetensors bfloat16 | Modelo base sin cuantizar, requiere ~55 GB en bf16 |

No se dispone de datos de benchmarks para comparar rendimiento con alternativas de otros autores.

## Limitaciones y advertencias
- Modelo "uncensored" obtenido mediante ablación "heretic": puede generar contenido ofensivo, ilegal o dañino; no es apto para producción sin filtros externos.
- Riesgo de alucinación inherente a los modelos de 27B y acentuado por el ajuste fino de la comunidad, sin benchmarks que lo cuantifiquen.
- No se documenta la longitud de contexto soportada; conviene asumir valores conservadores y validar empíricamente.
- La calidad multilingüe no está verificada por benchmarks; los 16 idiomas son declarados por el autor, no evaluados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de entrenamiento pueden tener condiciones adicionales no detalladas; revisar antes de desplegar.
- Es un fine-tuning no oficial de Alibaba; no hay soporte ni garantías del fabricante original.
- Las cuantizaciones de 2 y 3 bits (i1-Q2_K, i1-Q3_K_S) degradan notablemente la calidad; para uso serio se recomienda i1-Q4_K_M o superior.
- El repositorio ocupa 218,6 GB; descargar solo los ficheros necesarios.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
