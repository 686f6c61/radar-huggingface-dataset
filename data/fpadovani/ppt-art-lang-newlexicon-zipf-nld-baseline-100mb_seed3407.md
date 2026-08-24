# fpadovani/ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed3407

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed3407` es un ajuste fino (fine-tune) del modelo base `goldfish-models/nld_latn_100mb`, un transformer pequeño de 86,5 millones de parámetros especializado en neerlandés. Ha sido entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de Hugging Face, y forma parte de una serie de experimentos del autor (fpadovani) sobre "ppt-art-lang" y "newlexicon" que exploran variaciones en el vocabulario y la distribución de frecuencias (ley de Zipf) en distintos idiomas (neerlandés, inglés, japonés) y con diferentes semillas.

Este modelo es relevante para la investigación en procesamiento de lenguaje natural de bajos recursos, ya que permite estudiar el impacto de la arquitectura y el vocabulario en modelos pequeños. Su tamaño reducido lo hace accesible para experimentos en hardware modesto, aunque su capacidad de generación es limitada en comparación con modelos de mayor escala. No se dispone de información pública sobre benchmarks ni sobre la licencia exacta, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (estilo GPT-2) |
| Parametros totales | 86.508.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Neerlandes (nld) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder-only con aproximadamente 86,5 millones de parámetros. El modelo base `goldfish-models/nld_latn_100mb` fue preentrenado con 100 MB de texto en neerlandés, y este modelo es un ajuste fino posterior realizado con SFT (supervised fine-tuning) mediante la librería TRL. No se han publicado detalles sobre el dataset de ajuste fino, el número de pasos de entrenamiento ni los hiperparámetros utilizados. El nombre del modelo sugiere que se experimentó con un "nuevo léxico" y una distribución Zipf, pero no hay documentación técnica adicional en la model card.

## Capacidades

- Generación de texto en neerlandés: el modelo puede producir texto coherente en este idioma, aunque su tamaño limita la complejidad y coherencia en generaciones largas.
- Razonamiento básico: al ser un modelo pequeño, su capacidad de razonamiento es limitada y no comparable con modelos de miles de millones de parámetros.
- No se ha documentado soporte para tool calling, function calling, agentes, visión, audio ni modos de pensamiento explícitos.
- Capacidades multilingües: no aplica, el modelo está especializado en neerlandés.

## Casos de uso

- Investigación académica en PNL para neerlandés: el modelo sirve como punto de partida para estudiar el efecto del vocabulario y la distribución de frecuencias en modelos pequeños, permitiendo reproducir experimentos controlados.
- Generación de texto creativo en neerlandés: puede utilizarse para producir cuentos, poemas o diálogos cortos, aunque la calidad será inferior a la de modelos más grandes.
- Prototipado rápido de aplicaciones de texto: su tamaño reducido permite integrarlo en entornos con recursos limitados para probar flujos de generación de texto antes de escalar a modelos mayores.
- Fine-tuning adicional: al ser un modelo abierto (con safetensors), puede servir como base para experimentos de adaptación a dominios específicos en neerlandés.
- Enseñanza y aprendizaje de arquitecturas transformer: su pequeño tamaño facilita su uso en cursos o talleres para explicar el funcionamiento de los modelos de lenguaje.
- Comparación de semillas y variaciones: junto con otras variantes del mismo autor (diferentes semillas e idiomas), permite analizar la estabilidad del entrenamiento y la influencia de la inicialización aleatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en FP32 (según datos de modelos similares de la misma serie), lo que permite ejecutarlo en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). También es viable en Apple Silicon o CPUs con suficiente RAM.
- Cabe en GPUs de consumo: sí, sin problema.
- Opciones de despliegue: transformers (pipeline), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), Text Generation Inference (TGI).
- Latencia y throughput: al ser un modelo de 86M parámetros, la latencia es muy baja (del orden de milisegundos por token en GPU) y el throughput alto, aunque no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fpadovani/ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed3407 | 86,5M | no disponible | Neerlandes | no disponible | HuggingFace |
| fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407 | 86,5M | no disponible | Ingles | no disponible | HuggingFace |
| fpadovani/ppt-art-lang-newlexicon-eng-baseline-100mb_seed455 | 86,5M | no disponible | Ingles | no disponible | HuggingFace |
| goldfish-models/nld_latn_100mb | 86,5M (aprox.) | no disponible | Neerlandes | no disponible | HuggingFace |

Los modelos de la serie comparten la misma arquitectura y tamaño, diferenciándose únicamente en el idioma y la semilla de entrenamiento. El modelo base goldfish es el punto de partida común.

## Limitaciones y advertencias

- Tamaño reducido: con solo 86,5M de parámetros, el modelo tiene una capacidad limitada para tareas complejas y puede producir texto incoherente o repetitivo en generaciones largas.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado con un corpus limitado (100 MB), es probable que presente sesgos presentes en los datos de entrenamiento y una tendencia a alucinar hechos o nombres.
- Contexto limitado: no se ha especificado la longitud de contexto, pero es probable que sea corta (típicamente 512 o 1024 tokens en modelos de este tamaño), lo que restringe su uso en conversaciones largas o documentos extensos.
- Licencia no clara: la model card indica "licence: license" sin especificar términos, y los metadatos de HuggingFace muestran "no disponible". Esto impide su uso comercial sin verificación previa.
- Idioma único: el modelo solo genera texto en neerlandés; no es adecuado para tareas multilingües.
- Sin soporte para herramientas ni agentes: no se ha documentado ninguna capacidad de tool calling o integración con APIs externas.
- Datos de entrenamiento desconocidos: no se ha publicado información sobre el dataset de fine-tuning, lo que dificulta evaluar posibles sesgos o limitaciones de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Variante en inglés (seed3407): https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407
- Variante en inglés (seed455): https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-eng-baseline-100mb_seed455,6mkpVFlOXDWzjKl0Gjn5g5
- Variante en inglés (seed10): https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-eng-baseline-100mb_seed10,5wPQ4CHzHD2weoAbCHyJ2f
- Variante en japonés (seed455): https://friendli.ai/models/fpadovani/ppt-art-lang-newlexicon-jpn-baseline-100mb_seed455
