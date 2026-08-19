# AlinaGonch/granite41-8b-squad-ratio-0.90-seed-44

## Resumen

Este modelo, identificado como `AlinaGonch/granite41-8b-squad-ratio-0.90-seed-44`, es un fine-tuning del modelo Granite 4.1 8B de IBM sobre el dataset SQuAD 2.0, con una proporción de 0.90 de muestras sin respuesta (unanswerable) y semilla 44. El autor, Alina Hancharova, mantiene una colección de experimentos destinados a estudiar el efecto de la proporción de preguntas sin respuesta en el entrenamiento de modelos de comprensión lectora. El nombre del repositorio sugiere que se trata de un ajuste fino del modelo base de IBM, aunque la model card no proporciona confirmación explícita de la arquitectura, los datos de entrenamiento ni el proceso de fine-tuning.

El modelo se publicó el 18 de agosto de 2026 y el repositorio ocupa 0.2 GB, lo que indica que probablemente contiene pesos en formato safetensors, posiblemente un adaptador o una versión cuantizada. No se dispone de información sobre la licencia, los idiomas soportados ni el pipeline de uso. Dado que no hay descargas ni likes, se trata de un experimento de investigación sin uso productivo conocido.

La relevancia de este modelo radica en su contribución al estudio empírico de la proporción óptima de muestras sin respuesta en datasets de question answering, un problema clave para entrenar modelos robustos en escenarios donde la respuesta puede no existir. Sin embargo, al carecer de documentación técnica, su utilidad práctica es limitada fuera del contexto del experimento del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer denso, basado en Granite 4.1 8B) |
| Parametros totales | no disponible (se infiere 8B si es fine-tuning del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Granite 4.1 8B soporta 131K tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

No se ha publicado información específica sobre la arquitectura de este modelo. El nombre sugiere que es un fine-tuning de Granite 4.1 8B, un modelo denso decoder-only de IBM con 8.000 millones de parámetros, entrenado con atención completa y una ventana de contexto de 131K tokens. El proceso de entrenamiento de este fine-tuning no está documentado: se desconoce el número de tokens de entrenamiento, la composición del dataset (aunque se infiere que es SQuAD 2.0 con ratio 0.90 de preguntas sin respuesta) y si se aplicaron técnicas como RLHF o DPO.

El autor ha publicado varios modelos con el mismo patrón de nombre (por ejemplo, `granite41-8b-squad-ratio-0.30-r4`), lo que sugiere que se trata de una serie de experimentos sistemáticos variando la proporción de muestras sin respuesta en el dataset de entrenamiento. No hay información sobre innovaciones técnicas en el fine-tuning, como decodificación especulativa o atención lineal.

## Capacidades

- Comprension lectora sobre SQuAD 2.0: el modelo está diseñado para responder preguntas sobre pasajes de texto, incluyendo la capacidad de detectar cuando no hay respuesta en el pasaje.
- No se dispone de información sobre otras capacidades como generación de código, razonamiento matemático, tool calling o soporte multilingüe.
- El modelo base Granite 4.1 8B soporta tool calling, RAG, generación de código con fill-in-the-middle, resumen, clasificación y extracción en 12 idiomas, pero no hay evidencia de que este fine-tuning conserve estas capacidades.

## Casos de uso

- Investigación académica sobre el efecto de la proporción de muestras sin respuesta en el entrenamiento de modelos de question answering: el modelo forma parte de una serie de experimentos controlados que permiten comparar el rendimiento variando el ratio de preguntas sin respuesta.
- Benchmarking de robustez en comprensión lectora: puede utilizarse para evaluar cómo se comporta un modelo entrenado con alta proporción de muestras sin respuesta frente a datasets adversariales o preguntas sin respuesta reales.
- Estudio de calibración de modelos: al estar entrenado con un 90% de muestras sin respuesta, el modelo puede servir para analizar el sesgo hacia la predicción de "no respuesta" y su efecto en la precisión global.
- Reproducibilidad de experimentos: al publicarse con semilla fija (44) y ratio específico, permite reproducir los resultados del autor y validar sus conclusiones.
- Desarrollo de sistemas de QA en dominios donde la ausencia de respuesta es frecuente (por ejemplo, atención al cliente o búsqueda documental): el modelo podría adaptarse mediante fine-tuning adicional a dominios específicos.
- Análisis de transferencia de aprendizaje: comparar este fine-tuning con el modelo base para medir la degradación en tareas generales tras el entrenamiento en SQuAD 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no ha incluido métricas de evaluación (F1, EM, exact match) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- No se dispone de información sobre requisitos de hardware específicos para este modelo.
- Dado que el repositorio ocupa 0.2 GB, es probable que se trate de un adaptador (por ejemplo, LoRA) o una versión cuantizada, lo que permitiría ejecutarlo en GPUs de consumo como una RTX 3060 o superior con suficiente VRAM (al menos 6-8 GB).
- Si se tratara del modelo completo de 8B en fp16, se necesitarían al menos 16 GB de VRAM, lo que requeriría una GPU profesional (A100, H100) o una RTX 4090.
- Las opciones de despliegue dependerían del formato de pesos: si es safetensors estándar, se podría usar transformers, vLLM o TGI; si es GGUF, llama.cpp u Ollama. No hay confirmación de ninguno de estos formatos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo base Granite 4.1 8B de IBM es la referencia natural, pero no hay datos de rendimiento de este fine-tuning frente a él ni frente a otros fine-tunes de SQuAD 2.0 como RoBERTa-base o DeBERTa-v3. Se recomienda consultar la colección del autor en Hugging Face para ver otros modelos de la misma serie.

## Limitaciones y advertencias

- No hay documentación sobre sesgos conocidos, pero al estar entrenado principalmente en SQuAD 2.0, el modelo puede tener un sesgo hacia el dominio de Wikipedia y noticias, y puede no generalizar bien a otros dominios.
- Riesgo de alucinación: al entrenarse con un 90% de preguntas sin respuesta, el modelo podría tender a responder "no hay respuesta" incluso cuando sí existe, lo que degradaría su precisión en escenarios reales.
- Limitaciones de idioma: no se especifican idiomas soportados; si el fine-tuning se realizó solo con datos en inglés, el modelo solo funcionará en ese idioma.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar su uso comercial.
- La model card no proporciona información sobre el proceso de entrenamiento, los hiperparámetros ni los datos utilizados, lo que impide evaluar la calidad del fine-tuning.
- El modelo no tiene descargas ni uso conocido, por lo que no hay evidencia de su funcionamiento en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/AlinaGonch/granite41-8b-squad-ratio-0.90-seed-44
- Perfil del autor: https://huggingface.co/AlinaGonch
- Modelo relacionado del mismo autor: https://huggingface.co/AlinaGonch/granite41-8b-squad-ratio-0.30-r4
- Documentación de Granite 4.1 de IBM: https://www.ibm.com/granite/docs/models/granite4-1
- Ficha de Granite 4.1 8B en OpenModels: https://www.openmodels.run/models/granite-4-1-8b
- Ficha de Granite 4.1 8B en NanoGPT: https://nano-gpt.com/models/text/ibm-granite/granite-4.1-8b
