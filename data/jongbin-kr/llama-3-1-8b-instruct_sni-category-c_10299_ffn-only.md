# Jongbin-kr/llama-3.1-8b-instruct_SNI-category-c_10299_ffn-only

## Resumen

El modelo `llama-3.1-8b-instruct_SNI-category-c_10299_ffn-only` es un fine-tuning del modelo base `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por el usuario Jongbin-kr. Se trata de un experimento de investigación que aplica Supervised Fine-Tuning (SFT) mediante la librería TRL, y el nombre sugiere que el entrenamiento se ha restringido únicamente a las capas feed-forward (FFN) de los bloques del transformer, una técnica de fine-tuning selectivo que busca reducir el coste computacional y estudiar el impacto de modificar solo una parte de los pesos.

El modelo está pensado para explorar metodologías de adaptación eficiente de modelos grandes, no para producción. No se ha publicado documentación detallada sobre el dataset utilizado (el sufijo `SNI-category-c_10299` podría referirse a una categoría concreta del dataset Super-NaturalInstructions, pero no está confirmado), ni sobre los resultados obtenidos. Con 0 descargas y 0 likes en Hugging Face, es un artefacto de investigación con alcance limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basada en Llama 3.1 8B Instruct) |
| Parametros totales | 8.03 mil millones (heredados del modelo base, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles) |
| Licencia | no disponible (el modelo base usa la Licencia de Comunidad Llama 3.1) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `meta-llama/Llama-3.1-8B-Instruct`, que emplea una arquitectura transformer decoder con 8.000 millones de parametros, atención por ventanas deslizantes y 128.000 tokens de contexto. El entrenamiento se realizó con SFT (Supervised Fine-Tuning) usando la librería TRL (versión 0.29.1) y el framework Transformers 5.9.0. El nombre del modelo indica que solo se actualizaron los pesos de las capas feed-forward (`ffn-only`), dejando congeladas las capas de atención y las de normalización. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El enlace a Weights & Biases incluido en la model card sugiere que el entrenamiento fue monitorizado, pero no se han hecho públicos los logs.

## Capacidades

- Generación de texto: al ser un fine-tuning de Llama 3.1 8B Instruct, hereda las capacidades de generación de texto coherente y contextual del modelo base.
- Razonamiento y comprensión: mantiene las habilidades de razonamiento de sentido común y de instrucciones del modelo base, aunque no se han evaluado específicamente tras el fine-tuning.
- Soporte de tool calling: el modelo base soporta function calling, pero no se ha verificado que el fine-tuning preserve esta capacidad.
- Multilingüismo: el modelo base está entrenado principalmente en inglés; no hay datos sobre el comportamiento en otros idiomas tras el fine-tuning.
- Capacidades especiales: no se ha documentado ninguna capacidad adicional (visión, audio, etc.).

## Casos de uso

- Investigación en fine-tuning selectivo: el modelo sirve como caso de estudio para analizar cómo afecta la actualización exclusiva de capas FFN al rendimiento en tareas específicas, comparándolo con fine-tuning completo o con LoRA.
- Experimentos de eficiencia en adaptación: dado que solo se entrenan los pesos FFN, el coste de entrenamiento es menor; puede usarse para probar metodologías de adaptación con recursos limitados.
- Evaluación de transferencia de conocimiento: al estar basado en Llama 3.1, puede utilizarse para medir si el fine-tuning selectivo preserva las capacidades generales del modelo base en tareas de razonamiento o generación.
- Reproducción de resultados: el autor ha publicado el enlace a Weights & Biases, lo que permite a otros investigadores reproducir el entrenamiento y verificar los hiperparámetros.
- Análisis de la dinámica interna del transformer: estudiar qué información se almacena en las capas FFN frente a las de atención, un tema activo en la interpretabilidad de modelos.
- Base para futuros fine-tunings: el checkpoint puede servir como punto de partida para aplicar otros métodos de adaptación (por ejemplo, LoRA sobre las capas de atención) y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8.000 millones de parametros, en precisión FP16 requiere aproximadamente 16 GB de VRAM. El tamaño del repositorio (1.6 GB) sugiere que los pesos podrían estar en una precisión reducida (por ejemplo, int8 o int4), lo que reduciría los requisitos a unos 4-8 GB.
- GPU recomendadas: para FP16, una GPU con al menos 16 GB (RTX 4090, A100 40GB, etc.). Para cuantización int8, una GPU de 8-12 GB (RTX 3080, RTX 4070) podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, si se usa cuantización (GGUF, AWQ) o si se dispone de una GPU con 16 GB o más.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión).
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de unos 20-40 ms/token y un throughput de 20-50 tokens/s, dependiendo de la cuantización y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| meta-llama/Llama-3.1-8B-Instruct | 8.03B | 128K | Llama 3.1 Community License | Modelo base, sin fine-tuning adicional |
| Jongbin-kr/llama-3.1-8b-instruct_SNI-category-c_10299_ffn-only | 8.03B (solo FFN entrenada) | 128K (heredado) | no disponible | Fine-tuning selectivo, sin benchmarks publicados |
| Jongbin-kr/llama-3.1-8b-instruct-4x1-moe | 8B (MoE con 4 expertos) | 128K | no disponible | Variante MoE del mismo autor, con VRAM estimada de 50.2 GB según llm-explorer |

No se dispone de comparaciones de rendimiento porque no hay datos de benchmarks para ninguno de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama 3.1, el modelo puede heredar sesgos presentes en los datos de entrenamiento del modelo base, pero no se ha realizado ninguna evaluación específica.
- Riesgo de alucinación: no se ha evaluado; el fine-tuning selectivo podría alterar la calibración del modelo y aumentar la probabilidad de respuestas inventadas.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, no se ha verificado que el fine-tuning preserve la capacidad de manejar contextos largos de forma coherente.
- Restricciones de licencia: la licencia del modelo no está especificada en la model card. El modelo base tiene una licencia de comunidad Llama 3.1 que impone restricciones de uso comercial para ciertos casos; el fine-tuning podría estar sujeto a esas mismas condiciones, pero no está confirmado.
- Caveat para producción: este modelo no está documentado ni validado; no debe usarse en entornos de producción sin una evaluación exhaustiva previa.
- Falta de reproducibilidad: no se han publicado los datos de entrenamiento ni los hiperparámetros completos, lo que dificulta la reproducción exacta del experimento.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_SNI-category-c_10299_ffn-only)
- [Weights & Biases - run de entrenamiento](https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_sni_roster_ffn_only/runs/rw1vw0vy)
- [Modelo base en Hugging Face](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
