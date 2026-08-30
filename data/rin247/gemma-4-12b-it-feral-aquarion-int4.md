# Rin247/gemma-4-12B-it-Feral-Aquarion-INT4

## Resumen

El modelo `Rin247/gemma-4-12B-it-Feral-Aquarion-INT4` es una cuantización INT4 weight-only del modelo `gemma-4-12B-it-Feral-Aquarion`, publicada por el usuario Rin247 en Hugging Face. Se trata de una adaptación del modelo base Gemma 4 12B de Google, que pertenece a la familia Gemma 4 de modelos abiertos y destaca por su arquitectura unificada multimodal (texto, audio, imagen y video) sin necesidad de codificadores separados. Esta versión cuantizada busca reducir el tamaño y los requisitos de memoria para facilitar su ejecución en entornos locales con recursos limitados.

La cuantización se realizó mediante el método RTN (Round-To-Nearest) en CPU, almacenando las escalas junto a los pesos en formato safetensors. El repositorio contiene un único archivo `model.safetensors` de aproximadamente 7,8 GB y un `config.json` con la configuración de cuantización. El modelo tiene 6.509.756.464 parámetros, lo que sugiere que se trata de una versión compacta del Gemma 4 12B original. Sin embargo, no se dispone de información sobre la variante "Feral Aquarion" ni sobre su proceso de entrenamiento o fine-tuning, por lo que las capacidades exactas de esta versión no están documentadas.

La relevancia de este modelo radica en su potencial para llevar capacidades multimodales avanzadas a hardware de consumo, aprovechando la cuantización INT4 para reducir el uso de VRAM. No obstante, al ser una publicación reciente sin descargas ni valoraciones, su fiabilidad y rendimiento real no han sido verificados por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Gemma 4 12B (unificada multimodal, encoder-free) |
| Parametros totales | 6.509.756.464 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 weight-only (RTN) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (con escalas y formas separadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Gemma 4 12B de Google, que emplea un diseño unificado multimodal capaz de procesar texto, audio, imagen y video de forma nativa, sin depender de codificadores externos. Esta arquitectura se basa en un transformer denso con atención estándar, optimizado para ejecución local en GPU de consumo. Sin embargo, la variante "Feral Aquarion" sobre la que se aplica la cuantización no está documentada en la información proporcionada, por lo que se desconoce si ha sido sometida a fine-tuning, RLHF u otros procesos de entrenamiento adicionales.

La cuantización se realizó con PyTorch RTN en CPU, un método que redondea los pesos al entero más cercano y almacena escalas de desnormalización junto a los tensores. El resultado es un modelo con pesos en INT4 que requiere un paso de dequantización antes de la inferencia, utilizando los buffers `*.weight_scale` y `*.weight_shape` incluidos en el repositorio. No se especifican los datos de entrenamiento del modelo base ni de la variante, ni el número de tokens utilizados.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Gemma 4 12B, que incluyen comprensión y generación de lenguaje natural, aunque no hay confirmación específica para esta variante cuantizada.
- Comprensión multimodal: el modelo base soporta entradas de audio, imagen y video de forma nativa, pero no se ha verificado que esta cuantización conserve todas estas funcionalidades.
- Tool calling y function calling: no se menciona en la información disponible; se desconoce si la variante conserva estas capacidades.
- Soporte para agentes y razonamiento multi-paso: no documentado para esta versión.
- Capacidades multilingües: no se especifican idiomas soportados.
- Modo de pensamiento o razonamiento extendido: no disponible.

## Casos de uso

- Despliegue local de asistentes multimodales: gracias a la cuantización INT4, el modelo podría ejecutarse en GPU con 8-12 GB de VRAM, permitiendo prototipos de asistentes que procesen texto, audio e imágenes en entornos sin conexión a la nube.
- Análisis de documentos con contenido mixto: si conserva las capacidades multimodales del base, podría utilizarse para extraer información de PDFs, capturas de pantalla o vídeos, aunque requiere verificación previa.
- Investigación en eficiencia de modelos: sirve como caso de estudio para evaluar el impacto de la cuantización INT4 en un modelo multimodal de tamaño medio, comparando calidad y velocidad frente a la versión completa.
- Desarrollo de aplicaciones educativas: para entornos académicos donde se necesite un modelo local con capacidades de razonamiento y generación de texto, sin depender de APIs externas.
- Pruebas de integración con frameworks de inferencia: al ser un formato safetensors con escalas separadas, puede utilizarse para probar pipelines de dequantización personalizados en vLLM, llama.cpp u otros motores.
- Evaluación de robustez de cuantización: útil para investigadores que estudian la degradación de rendimiento en tareas multimodales al reducir la precisión de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas para esta variante cuantizada. Tampoco se han encontrado evaluaciones comparativas con el modelo base o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6.509.756.464 parámetros en INT4, el peso del modelo ocupa aproximadamente 3,25 GB (6,5B × 0,5 bytes), más overhead de escalas y activaciones. Se estima que podría caber en GPU con 8 GB de VRAM, aunque no hay datos confirmados.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. Para mayor comodidad, se recomienda al menos 12 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, en principio es viable en GPUs de gama media, pero requiere verificación práctica.
- Opciones de despliegue: al ser un formato safetensors con cuantización personalizada, no es directamente compatible con vLLM, llama.cpp u Ollama sin un paso de dequantización previo. Se necesitaría un script personalizado o un motor que soporte el formato de escalas separadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rin247/gemma-4-12B-it-Feral-Aquarion-INT4 | 6,5B | No disponible | INT4 weight-only | No disponible | Hugging Face |
| google/gemma-4-12B-it | 12B (aprox.) | No disponible | FP16/BF16 | Gemma License | Hugging Face |
| Llama 3.1 8B Instruct (cuantizado INT4) | 8B | 128K | INT4 (AWQ/GPTQ) | Llama 3.1 License | Hugging Face |
| Qwen 2.5 7B Instruct (cuantizado INT4) | 7,6B | 128K | INT4 (AWQ/GPTQ) | Apache 2.0 | Hugging Face |

La comparativa es estructural, ya que no se dispone de datos de rendimiento para la variante cuantizada. El modelo base Gemma 4 12B ofrece capacidades multimodales que no están presentes en Llama 3.1 o Qwen 2.5, pero la cuantización puede degradar estas capacidades.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos específicos de esta variante. El modelo base Gemma 4 puede presentar sesgos heredados de sus datos de entrenamiento, pero no hay datos concretos.
- Riesgo de alucinacion: no evaluado para esta cuantización. La reducción de precisión puede aumentar la probabilidad de errores en tareas de razonamiento.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada. Los idiomas soportados tampoco se especifican.
- Restricciones de licencia: la licencia no está indicada en el repositorio. El modelo base de Google tiene una licencia Gemma que permite uso comercial con restricciones, pero esta variante no aclara su estatus legal.
- Caveat para produccion: al ser una cuantización personalizada sin verificación comunitaria, no se recomienda su uso en entornos de producción sin pruebas exhaustivas. El proceso de dequantización requiere buffers específicos que pueden no ser compatibles con motores de inferencia estándar.
- Origen de la variante "Feral Aquarion": no hay documentación sobre qué modificaciones se aplicaron al modelo base antes de la cuantización, lo que introduce incertidumbre sobre sus capacidades reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rin247/gemma-4-12B-it-Feral-Aquarion-INT4
- Modelo base Gemma 4 12B it (Google): https://huggingface.co/google/gemma-4-12B-it
- Modelo base Gemma 4 12B (Google): https://huggingface.co/google/gemma-4-12B
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Blog de presentación de Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Guía para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
