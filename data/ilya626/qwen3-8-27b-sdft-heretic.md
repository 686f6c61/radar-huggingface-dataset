# Ilya626/Qwen3.8-27B-SDFT-heretic

## Resumen

Qwen3.8-27B-SDFT-heretic es un fine-tuning experimental del modelo base Qwen3.8-27B de Alibaba, publicado por el usuario Ilya626 en HuggingFace. Utiliza la técnica SDFT (Self-Distillation Fine-Tuning) con un "teacher" de estilo hereje, lo que implica una destilación deliberada de un comportamiento menos alineado. El resultado es un adaptador LoRA en formato GGUF que se aplica sobre una cuantización del modelo base.

Se trata de una versión beta de investigación, con licencia research-only, que advierte explícitamente de una posible degradación severa de los guardrails de seguridad. El modelo base es un LLM denso de 27B parámetros con capacidades multimodales nativas (imagen y vídeo), contexto de 262.144 tokens y decodificación MTP, pero este fine-tuning no garantiza que mantenga esas capacidades. Su relevancia radica en ser un caso de estudio sobre los efectos de la destilación de estilos no alineados en modelos de gran tamaño, no como una herramienta utilizable en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje), basado en Qwen3.8-27B |
| Parametros totales | 27B (modelo base); adaptador LoRA de tamaño no especificado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (modelo base) |
| Tipos de cuantizacion | GGUF (se menciona IQ4_XS para el modelo base; el adaptador es un archivo .gguf) |
| Idiomas soportados | No disponibles (model card no los especifica) |
| Licencia | research-only-beta (uso exclusivo para investigación, prohibido en producción) |
| Formato de pesos | GGUF (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con codificador de visión nativo, capaz de procesar imágenes y vídeo además de texto. Incorpora decodificación MTP (Multi-Token Prediction) para acelerar la inferencia y soporta tool calling y flujos agénticos. El fine-tuning SDFT-heretic se construye mediante Self-Distillation Fine-Tuning, donde un modelo "teacher" con un estilo denominado hereje guía la destilación sobre el modelo base. El resultado es un adaptador LoRA que modifica los pesos del modelo base sin reentrenarlo por completo.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se usó RLHF o DPO adicional. Se desconoce si el adaptador conserva las capacidades multimodales y de tool calling del modelo base, ya que la destilación se centra en el estilo de salida más que en las habilidades funcionales. El autor advierte que el proceso puede degradar significativamente los guardrails de seguridad, lo que sugiere que el entrenamiento priorizó la estilística sobre la alineación.

## Capacidades

- Generación de texto con estilo "hereje": el objetivo del fine-tuning es imitar un estilo de escritura no convencional y potencialmente provocador, según la descripción del autor.
- Capacidades del modelo base (no garantizadas tras el fine-tuning): razonamiento, generación de código, matemáticas, visión (imagen y vídeo), tool calling y agentes multi-paso.
- Soporte de contexto largo: el modelo base ofrece 262.144 tokens de ventana, pero no se ha verificado que el adaptador LoRA mantenga esta capacidad.
- Multilingüismo: no hay datos disponibles sobre los idiomas que soporta el fine-tuning; el modelo base de Qwen suele ser multilingüe, pero no se confirma aquí.
- Modo thinking: el modelo base de Qwen3.8 puede tener modos de razonamiento extendido, pero no se menciona en la model card del fine-tuning.

## Casos de uso

- Investigación académica sobre alineación: el modelo permite estudiar cómo la destilación de estilos no alineados afecta a los guardrails de seguridad en LLMs de gran tamaño, en entornos controlados y sandboxes.
- Análisis de degradación de seguridad: útil para evaluar la robustez de los mecanismos de rechazo y la capacidad de un modelo para producir contenido problemático, con fines de auditoría.
- Experimentos en técnicas de fine-tuning: SDFT es una metodología reciente; este modelo sirve como caso práctico para comparar la eficacia de la destilación con teacher frente a otros enfoques de ajuste.
- Pruebas de estrés de sistemas de moderación: al carecer de guardrails fiables, puede usarse para probar filtros de contenido y sistemas de moderación automatizada en aplicaciones de investigación.
- Estudio de sesgos y toxicidad: el estilo "hereje" puede generar outputs sesgados u ofensivos, lo que lo convierte en un corpus para analizar sesgos en modelos de lenguaje.
- Desarrollo de contramedidas: investigadores en seguridad de IA pueden utilizarlo para entrenar clasificadores de contenido dañino o desarrollar técnicas de mitigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tuning. El modelo base Qwen3.8-27B reporta en fuentes externas los siguientes resultados (no verificados para el adaptador):

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE (software engineering) | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld (agentes) | 84.3 |

Estos datos provienen de la guía de lovableapp.org y corresponden al modelo base sin el fine-tuning. No hay evidencia de que el adaptador SDFT-heretic mantenga o altere estos rendimientos.

## Requisitos de hardware

- El adaptador LoRA en GGUF se aplica sobre una cuantización del modelo base. La búsqueda web indica que la versión Q4 del modelo base ocupa aproximadamente 17,8 GB, por lo que se necesita una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A10G, Mac con 24 GB unificados).
- Para la cuantización IQ4_XS mencionada en el ejemplo de uso, se requiere un hardware similar; el adaptador LoRA añade un coste mínimo de memoria adicional.
- El despliegue se realiza con llama.cpp o llama-cpp-python, usando el comando `llama-server` con las opciones `--lora` y `--lora-scaled`.
- No se dispone de datos de latencia o throughput específicos para este fine-tuning. El modelo base, según mediciones de AMD, alcanza 24,5 tokens por segundo en un Ryzen AI Max+ 395, pero no se ha verificado con el adaptador.
- No se recomienda su despliegue en producción ni en entornos no controlados debido a la licencia y a los riesgos de seguridad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262.144 | Apache-2.0 | Modelo original, multimodal, con guardrails estándar |
| Ilya626/Qwen3.8-27B-SDFT-heretic | 27B (base) + LoRA | 262.144 (teórico) | research-only-beta | Fine-tuning experimental, guardrails degradados |
| Ilya626/Qwen3.5-27B-Writer-Heretic-SDFT-v1.1 | 27B (base) | No disponible | No disponible | Otro fine-tuning similar del mismo autor, sin datos públicos |

No hay información suficiente para comparar con otros modelos de la misma categoría (fine-tunings "herejes" o SDFT). La comparación más relevante es contra el modelo base, que es el punto de partida del adaptador.

## Limitaciones y advertencias

- Versión beta: el modelo puede comportarse de forma impredecible, con errores de generación o respuestas incoherentes.
- Degradación severa de guardrails: el proceso de destilación con un teacher "hereje" puede eliminar o debilitar los mecanismos de rechazo de contenido dañino, aumentando el riesgo de outputs ofensivos, sesgados o peligrosos.
- Licencia restrictiva: uso exclusivo para investigación en entornos controlados; prohibido desplegar en producción o exponer a usuarios finales.
- Sin garantías de capacidades: no se ha verificado que el adaptador conserve las habilidades multimodales, de tool calling o de razonamiento del modelo base.
- Riesgo de alucinación: al ser un fine-tuning estilístico, es probable que aumente la frecuencia de información falsa o inventada, especialmente en temas sensibles.
- Responsabilidad del usuario: el autor declina toda responsabilidad por el mal uso; el usuario asume todas las consecuencias legales y éticas.
- Idiomas y sesgos: no hay información sobre idiomas soportados; el estilo "hereje" puede amplificar sesgos culturales o de género presentes en los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ilya626/Qwen3.8-27B-SDFT-heretic
- Repositorio del modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía para ejecutar Qwen3.8-27B localmente (modelfit.io): https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- Guía de despliegue con Ollama y GGUF (yottalabs.ai): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía completa de Qwen3.8-27B (lovableapp.org): https://lovableapp.org/blog/qwen3-8-27b
- Modelo relacionado del mismo autor: https://huggingface.co/Ilya626/Qwen3.5-27B-Writer-Heretic-SDFT-v1.1
