# Phantomcloak19/gemma2-2b-dpo

## Resumen

El modelo `Phantomcloak19/gemma2-2b-dpo` es un ajuste fino de `google/gemma-2-2b-it` mediante Direct Preference Optimization (DPO). Fue desarrollado por el usuario Phantomcloak19 como parte de un pipeline de entrenamiento secuencial denominado LLMPR, que incluye las fases SFT (supervised fine-tuning), DPO y Safety-GRPO. Este repositorio concreto corresponde a la salida de la fase DPO, publicada como un modelo fusionado en precisión completa.

El objetivo declarado de este tipo de ajuste es reducir alucinaciones y mejorar la consistencia factual de las respuestas, un problema habitual en modelos generativos de pequeño tamaño. Aunque la información pública es escasa (32 descargas, sin likes), el modelo se presenta como un modelo conversacional de 2.6 mil millones de parámetros, compatible con el ecosistema Transformers y con la API de inferencia de Hugging Face. Su relevancia radica en la posibilidad de desplegar un modelo ajustado con preferencias humanas en entornos con recursos limitados, aunque sin datos de rendimiento publicados no se puede verificar su eficacia real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 2, decoder-only) |
| Parametros totales | 2.614.341.888 (2.6 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 2 2B soporta 8192 tokens, pero no se especifica en este repo) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se indica para este ajuste) |
| Licencia | no disponible (la licencia de Gemma 2 se aplica al base, pero no se declara aquí) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 2 2B, un transformer decoder-only con atención local y global alternada, desarrollado por Google. Este ajuste fue entrenado mediante DPO, una técnica de optimización de preferencias que alinea las respuestas del modelo con juicios humanos o pares preferidos/no preferidos. La información del repositorio indica que forma parte de un pipeline LLMPR secuencial (SFT → DPO → Safety-GRPO), lo que sugiere que el modelo ya había pasado por una fase de supervisión previa. No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, ni las hiperparámetros utilizados. La búsqueda web revela que el mismo autor tiene otro modelo (`gemma-dpo-full`) entrenado con DPO sobre el Unified Hallucination Benchmark para reducir alucinaciones, pero no hay evidencia de que este modelo concreto haya usado ese dataset.

## Capacidades

- Generación de texto conversacional: al ser un fine-tune de `gemma-2-2b-it`, hereda la capacidad de seguir instrucciones y mantener diálogos multi-turno.
- Reducción de alucinaciones: según la descripción del pipeline y la práctica común en DPO, es probable que el modelo esté optimizado para ser más factual, pero no hay evaluación pública que lo confirme.
- Compatibilidad con el ecosistema Transformers: se puede cargar con la biblioteca `transformers` y desplegar con soluciones como TGI (text-generation-inference) o endpoints compatibles.
- No se documentan capacidades específicas de tool calling, agentes, visión o audio.

## Casos de uso

Dada la falta de información concreta sobre el rendimiento del modelo, se indican casos de uso plausibles para un modelo de 2.6 B ajustado con DPO, pero sin garantías de rendimiento:

- Chatbots de soporte en entornos con recursos limitados: su tamaño permite ejecutarlo en GPUs de consumo (por ejemplo, RTX 3060 de 12 GB) para atender conversaciones de atención al cliente con respuestas más factuales que un modelo base sin ajuste.
- Prototipos de agentes conversacionales en aplicaciones internas: se puede integrar en sistemas de preguntas-respuestas sobre documentación corporativa, donde la reducción de alucinaciones es crítica.
- Educación y asistencia académica: generación de explicaciones y resúmenes, siempre que se valide su precisión en dominios específicos.
- Generación de texto creativo con supervisión humana: aunque no se ha evaluado su calidad creativa, el tamaño permite experimentación en escritura asistida.
- Evaluación de técnicas DPO en modelos pequeños: como referencia para investigaciones sobre alineación en modelos de menos de 3 B de parámetros.
- Despliegue en edge o dispositivos con VRAM limitada: al usar cuantización (si se convierte a GGUF), podría caber en tarjetas de 8 GB, aunque no se proporcionan versiones cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. La única referencia indirecta es el modelo `gemma-dpo-full` del mismo autor, que se entrenó sobre el Unified Hallucination Benchmark, pero no se presentan métricas concretas.

## Requisitos de hardware

- El tamaño del repositorio es de 5.6 GB, lo que sugiere pesos en FP16 (2.6 B × 2 bytes ≈ 5.2 GB, más overhead).
- VRAM estimada para inferencia en FP16: aproximadamente 6-8 GB (incluyendo KV cache y overhead de inferencia). Un modelo de 2.6 B en FP16 puede caber en una GPU con 8 GB de VRAM.
- GPUs recomendadas: NVIDIA RTX 3070/3080/3090 (8-24 GB), RTX 4060 Ti (16 GB), o GPUs de datacenter como A10G (24 GB) para mayor margen.
- En cuantización int8 (si se genera a partir de safetensors) se podría reducir a unos 3 GB de VRAM, pero no se ofrecen versiones cuantizadas en el repositorio.
- Opciones de despliegue: vLLM, llama.cpp (tras conversión a GGUF), Ollama (si se convierte), Hugging Face TGI, o el endpoint de FriendliAI mencionado en la búsqueda.
- Latencia y throughput: no hay datos publicados. En una GPU RTX 4090 se esperaría una velocidad de decodificación típica para modelos de 2-3 B (en el orden de 30-50 tokens/s), pero es una estimación sin confirmación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Phantomcloak19/gemma2-2b-dpo | 2.6 B | no disp. | no disp. | Hugging Face |
| google/gemma-2-2b-it (base) | 2.6 B | 8 K | Gemma license | Hugging Face |
| Qwen2.5-1.5B | 1.5 B | 32 K | Apache 2.0 | Hugging Face |
| Phi-3-mini | 3.8 B | 4 K | MIT | Hugging Face |

La comparación se limita a los datos públicos: este modelo es un fine-tune de Gemma 2 2B con DPO, mientras que las alternativas son modelos base o con otros ajustes. No se pueden comparar rendimientos sin benchmarks.

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento, la metodología de DPO (número de pares, tamaño de dataset, etc.) ni los criterios de evaluación.
- La licencia no está especificada. El modelo base `google/gemma-2-2b-it` está sujeto a la licencia Gemma (con restricciones de uso comercial), pero este repositorio no la declara, lo que plantea incertidumbre legal.
- No se ha verificado la reducción de alucinaciones ni la calidad factual; es un riesgo para uso en producción sin pruebas.
- El modelo no tiene versiones cuantizadas, lo que limita su despliegue en hardware con menos de 8 GB de VRAM.
- El idioma de los datos de entrenamiento no se indica; aunque Gemma 2 soporta varios idiomas, este ajuste podría estar sesgado hacia un idioma concreto.
- El repositorio tiene solo 32 descargas y 0 likes, lo que sugiere que no ha sido ampliamente validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phantomcloak19/gemma2-2b-dpo
- Modelo similar del mismo autor: https://huggingface.co/Phantomcloak19/gemma-dpo-full
- Página de despliegue en FriendliAI: https://friendli.ai/models/Phantomcloak19/gemma2-2b-dpo-grpo
- Página de FriendliAI para gemma-dpo-full: https://friendli.ai/models/Phantomcloak19/gemma-dpo-full

Nota: la referencia a Sonatype (sonatype-2026-004524) no está relacionada con el modelo y se ha omitido.
