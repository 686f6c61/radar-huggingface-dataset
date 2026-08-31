# fpadovani/ppt-nld_newlexicon_zipf-100mb_seed3407

## Resumen

El modelo `fpadovani/ppt-nld_newlexicon_zipf-100mb_seed3407` es un fine-tuning experimental de 86,7 millones de parámetros basado en el modelo `goldfish-models/nld_latn_100mb`, desarrollado por fpadovani en el marco de un proyecto de investigación sobre procesamiento del lenguaje natural para el neerlandés. El nombre del modelo sugiere que se trata de un experimento con un "nuevo léxico" (newlexicon) y una distribución Zipf aplicada a un corpus de 100 MB, con una semilla fija (3407) para reproducibilidad.

El modelo fue entrenado mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face, y su arquitectura se basa en GPT-2, tal como indican las etiquetas del repositorio. Se trata de un modelo de investigación, sin descargas ni usos registrados, orientado a estudiar el impacto de la tokenización y la distribución de frecuencias en modelos de lenguaje de tamaño reducido para un idioma específico. Su relevancia radica en ser un ejemplo de adaptación de modelos base de la familia Goldfish a tareas de generación de texto en neerlandés, aunque su utilidad práctica en producción es muy limitada debido a su tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 86.708.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, segun GPT-2) |
| Tipos de cuantizacion | no disponible (repositorio con safetensors, sin GGUF) |
| Idiomas soportados | neerlandes (nld), segun el nombre y el modelo base |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder basado en GPT-2, con aproximadamente 86,7 millones de parámetros. El modelo base, `goldfish-models/nld_latn_100mb`, es un modelo de lenguaje entrenado por el proyecto Goldfish sobre 100 MB de texto en neerlandés (latín). Sobre este base, el autor aplicó un fine-tuning con SFT (Supervised Fine-Tuning) usando la librería TRL, con un dataset no especificado. El nombre "newlexicon" sugiere que se probó un vocabulario o tokenizador alternativo, posiblemente con una distribución Zipf en la frecuencia de tokens, para estudiar su efecto en el aprendizaje. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en neerlandés: el modelo puede producir texto coherente en este idioma, aunque con limitaciones propias de un modelo de 86M parámetros.
- Fine-tuning específico: al ser un modelo entrenado con SFT, puede responder a instrucciones si el dataset de fine-tuning incluía ejemplos de este tipo, aunque no hay evidencia de ello en la documentación.
- Compatibilidad con el ecosistema Transformers: se puede cargar con `pipeline("text-generation")` y usar con la API estándar de Hugging Face.
- No se han documentado capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación en lingüística computacional: el modelo sirve para estudiar el efecto de la tokenización y la distribución de frecuencias en el aprendizaje de representaciones del neerlandés. Los investigadores pueden comparar este modelo con otras variantes de la misma familia (por ejemplo, `ppt-nld_newlexicon_zipf_heavy-100mb_seed3407`) para analizar diferencias en la generación.
- Experimentos de fine-tuning: como modelo base de 86M parámetros, es útil para probar pipelines de SFT con TRL o para validar metodologías de entrenamiento en entornos con recursos limitados.
- Generación de texto de baja exigencia: puede emplearse para completar textos cortos en neerlandés en prototipos académicos, aunque no se recomienda para uso real.
- Evaluación de modelos pequeños: sirve como punto de referencia para comparar la calidad de generación de modelos de tamaño similar en neerlandés.
- Pruebas de infraestructura: al ser ligero (VRAM estimada de 0,2 GB), es adecuado para probar despliegues en CPU o en GPUs de gama baja sin coste elevado.
- Reproducibilidad de experimentos: al incluir una semilla fija (3407) y estar registrado en Weights & Biases, permite reproducir los resultados del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB según LLM Explorer, lo que permite ejecutarlo en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior). También funciona en CPU con llama.cpp o Transformers.
- Compatibilidad con consumo: sí, cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) y en equipos sin GPU.
- Opciones de despliegue: Transformers (pipeline), TGI (Text Generation Inference) según las etiquetas, y posiblemente vLLM u Ollama si se convierte a GGUF, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no se han publicado mediciones, pero por su tamaño se espera una latencia muy baja (del orden de milisegundos por token en GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fpadovani/ppt-nld_newlexicon_zipf-100mb_seed3407 | 86,7M | no disponible | no disponible | safetensors | Fine-tuning de goldfish nld 100MB |
| fpadovani/ppt-nld_newlexicon_zipf_heavy-100mb_seed3407 | 86,7M (estimado) | no disponible | no disponible | safetensors | Variante "heavy" del mismo experimento |
| goldfish-models/nld_latn_100mb | no disponible | no disponible | no disponible | safetensors | Modelo base, entrenado en neerlandés con 100MB |
| fpadovani/ppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed3407 | 86,5M | no disponible | no disponible | safetensors | Otra variante de la misma familia |

No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Tamaño reducido: con solo 86,7M de parámetros, la calidad de generación es limitada y no es adecuado para tareas complejas o producción.
- Idioma específico: entrenado principalmente en neerlandés, su uso en otros idiomas producirá resultados deficientes.
- Falta de documentación: no se especifica la licencia, el dataset de fine-tuning ni los detalles de entrenamiento, lo que dificulta su uso legal y científico.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o inconsistente.
- Sesgos desconocidos: al ser un modelo de investigación, no se han evaluado sesgos de género, raza o cultura.
- Sin soporte de tool calling ni agentes: no es utilizable en pipelines de automatización avanzada.
- Contexto limitado: probablemente 1024 tokens (según GPT-2), lo que restringe la coherencia en textos largos.
- Sin benchmarks: no hay evidencia objetiva de su rendimiento, por lo que no se recomienda para tareas que requieran calidad garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/ppt-nld_newlexicon_zipf-100mb_seed3407
- Modelo base Goldfish: https://huggingface.co/goldfish-models/nld_latn_100mb
- Variante heavy: https://huggingface.co/fpadovani/ppt-nld_newlexicon_zipf_heavy-100mb_seed3407
- Ficha en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-zipf-nld-baseline-100mb_seed3407,1uaAZ9eVx5uAZ83JoNAuXb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/gz82dwsc
- Repositorio TRL: https://github.com/huggingface/trl
