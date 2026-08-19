# jtown18/DiStil-Qwen3-1.7B-uncensored-4bit

## Resumen

DiStil-Qwen3-1.7B-uncensored-4bit es una versión destilada y cuantizada del modelo Qwen3-1.7B, publicada por el usuario jtown18 en Hugging Face. El modelo está diseñado para generación de texto en inglés, con un enfoque "uncensored" (sin censura), es decir, sin los mecanismos de rechazo de contenido que suelen incorporar los modelos comerciales. Se distribuye en formato MLX, optimizado para ejecución en dispositivos Apple Silicon, y en cuantización de 4 bits, lo que lo hace ligero y rápido para inferencia local.

El modelo se basa en el trabajo previo de reaperdoesntknow, quien publicó la versión sin cuantizar de DiStil-Qwen3-1.7B-uncensored. La destilación parte del modelo Qwen3-1.7B original, reduciendo su tamaño y adaptándolo para un uso más eficiente. Aunque el nombre indica 1.7B de parámetros, los pesos en safetensors registran 317.563.904 parámetros, lo que sugiere una destilación agresiva o una discrepancia en la nomenclatura. No se dispone de documentación oficial sobre el proceso de entrenamiento ni sobre las características exactas del modelo.

La relevancia de este modelo radica en su tamaño reducido y su formato MLX, que permite ejecutarlo en Macs con memoria unificada sin necesidad de GPUs dedicadas. Es una opción interesante para desarrolladores que buscan un modelo de chat sin restricciones de contenido para prototipos, experimentación o aplicaciones locales donde la censura sea un obstáculo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3), destilada |
| Parametros totales | 317.563.904 (segun safetensors; el nombre indica 1.7B, no confirmado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-1.7B soporta 256K, pero esta version no lo especifica) |
| Tipos de cuantizacion | 4-bit (MLX quantization) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo Qwen3-1.7B, un transformer decoder-only con atención causal. La versión destilada reduce el número de parámetros mediante técnicas de destilación de conocimiento, aunque no se han publicado detalles sobre el proceso exacto (datos de entrenamiento, número de tokens, método de destilación). El sufijo "uncensored" indica que se eliminaron o modificaron los mecanismos de rechazo de contenido, probablemente mediante fine-tuning con datasets específicos, pero no hay información pública al respecto.

La cuantización a 4 bits se realizó para el formato MLX, que es la librería de aprendizaje automático de Apple para acelerar la inferencia en sus chips. Esto reduce el tamaño del modelo a aproximadamente 1.2 GB en el repositorio, permitiendo su ejecución en dispositivos con memoria unificada limitada. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto en inglés, incluyendo conversaciones multi-turno.
- Chat sin censura: no rechaza solicitudes de contenido sensible, violento, explícito o controvertido.
- Inferencia eficiente en Apple Silicon gracias al formato MLX y la cuantización 4-bit.
- No se especifican capacidades de tool calling, function calling, agentes o razonamiento multi-paso.
- No se indica soporte para vision, audio u otras modalidades.
- Capacidades multilingües limitadas al inglés (según la etiqueta de idioma).

## Casos de uso

- Prototipado rapido de chatbots sin restricciones: el modelo permite crear asistentes conversacionales que no rechazan temas tabú, util para pruebas de concepto en entornos de investigacion o desarrollo.
- Generacion de texto creativo y narrativo: al no tener censura, puede producir historias, dialogos o guiones con contenido adulto o controvertido sin filtros.
- Experimentacion local en Mac: gracias a MLX y 4-bit, se puede ejecutar en un MacBook con 8 GB de RAM unificada, ideal para desarrolladores que quieren probar modelos sin GPU dedicada.
- Fine-tuning posterior: al ser un modelo pequeno y sin censura, puede servir como base para ajustes especificos en dominios donde se requiera libertad de expresion (por ejemplo, escritura de ficcion).
- Educacion y estudio de modelos destilados: permite analizar como la destilacion afecta al comportamiento y a la calidad de las respuestas en comparacion con el modelo original.
- Despliegue en entornos con recursos limitados: su tamano reducido (1.2 GB) y su formato MLX lo hacen adecuado para aplicaciones embebidas o servidores de baja capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se comparan con otros modelos en terminos de rendimiento.

## Requisitos de hardware

- VRAM estimada: al ser MLX, utiliza memoria unificada del chip Apple. Con 4-bit y ~317M parametros, el uso de memoria es inferior a 1 GB, por lo que cabe en cualquier Mac con 8 GB o mas de RAM unificada.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3 o posteriores). No requiere GPU dedicada.
- Compatibilidad con consumer GPU: no aplica, ya que MLX esta disenado exclusivamente para Apple Silicon. Para GPUs NVIDIA o AMD habria que convertir los pesos a otro formato (por ejemplo, GGUF).
- Opciones de despliegue: MLX (libreria oficial de Apple), tambien se puede usar con llama.cpp si se convierte a GGUF, o con vLLM si se adapta a CUDA (aunque no es el formato nativo).
- Latencia y throughput: no se han publicado mediciones. Dado el tamano reducido, se espera una generacion rapida en Apple Silicon, pero sin datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jtown18/DiStil-Qwen3-1.7B-uncensored-4bit | 317M (segun safetensors) | No disponible | No disponible | MLX 4-bit | Version cuantizada y destilada, sin censura |
| reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored | 1.7B (estimado) | No disponible | No disponible | safetensors (sin cuantizar) | Modelo original destilado, sin censura |
| Qwen/Qwen3-1.7B | 1.7B | 256K (extensible a 1M) | Apache 2.0 | safetensors, GGUF, etc. | Modelo base con censura y alineacion |

La comparativa muestra que la version de jtown18 es una adaptacion cuantizada del modelo de reaperdoesntknow, que a su vez deriva de Qwen3-1.7B. La principal diferencia es el formato (MLX vs safetensors) y la cuantizacion (4-bit vs full precision). El modelo base Qwen3-1.7B tiene una licencia clara (Apache 2.0) y un contexto mucho mayor, pero incluye censura.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo sin censura y sin documentacion sobre su entrenamiento, puede reflejar sesgos presentes en los datos originales de Qwen3, amplificados por la destilacion.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en temas especializados.
- Limitaciones de contexto: no se especifica la longitud de contexto de esta version; si se hereda del base, podria ser 256K, pero no esta confirmado.
- Limitaciones de idioma: solo soporta ingles, lo que limita su uso en entornos multilingues.
- Restricciones de licencia: la licencia no esta disponible, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar al autor antes de utilizarlo en produccion.
- Advertencia para produccion: al ser un modelo "uncensored", puede generar contenido inapropiado u ofensivo. No es adecuado para aplicaciones publicas sin moderacion adicional.
- Discrepancia en parametros: el nombre indica 1.7B pero los pesos registran 317M, lo que sugiere que el modelo es significativamente mas pequeno de lo que sugiere el nombre. Esto puede afectar a la calidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jtown18/DiStil-Qwen3-1.7B-uncensored-4bit
- Modelo original (reaperdoesntknow): https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Pagina en friendli.ai: https://friendli.ai/models/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Version en Ollama: https://ollama.com/reaperdoesntrun/DistilQwen3-1.7B-uncensored:latest
