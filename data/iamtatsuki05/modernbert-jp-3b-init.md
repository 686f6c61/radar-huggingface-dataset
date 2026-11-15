# iamtatsuki05/ModernBERT-JP-3B-init

## Resumen

ModernBERT-JP-3B-init es un checkpoint de ModernBERT con inicialización aleatoria, publicado por el usuario iamtatsuki05 dentro del proyecto MIREI. No es un modelo entrenado ni utilizable para inferencia real: es un punto de partida para preentrenamiento, construido a partir de la configuración iamtatsuki05/ModernBERT-JP-3B-settings y dimensionado para coincidir en número de parámetros con sbintuitions/sarashina2.2-3b, de modo que ambos puedan compararse bajo condiciones equivalentes.

El modelo emplea la arquitectura ModernBERT (encoder transformer con atención bidireccional, RoPE y soporte nativo de FlashAttention 2), con una dimensión de embedding de 2560, una longitud máxima de secuencia de 8192 tokens y un tokenizador SentencePiece de 102.400 entradas compartido con la familia sarashina2.2. Cuenta con 3.309.839.360 parámetros totales (3047M sin embeddings), lo que lo sitúa en la franja de 3B.

Su relevancia es metodológica más que práctica: forma parte de un estudio comparativo entre arquitecturas encoder y decoder para embeddings de frases, presentado en el congreso NLP2026 de la Asociación de Procesamiento del Lenguaje de Japón. Su interés radica en servir de base reproducible para experimentos de preentrenamiento en japonés con arquitectura encoder y en permitir comparaciones controladas frente a un decoder de tamaño equivalente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, atención bidireccional) |
| Parámetros totales | 3.309.839.360 (3309M) |
| Parámetros activos | no disponible (no es MoE) |
| Parámetros sin embeddings | 3047M |
| Longitud de contexto | 8192 tokens |
| Dimensión de embedding | 2560 |
| Tokenizador | SentencePiece, vocabulario de 102.400 |
| Codificación posicional | RoPE |
| Tipos de cuantización | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | fill-mask (masked LM) |
| Tamaño del repositorio | 13,2 GB |
| Requisitos de librería | transformers>=4.51.0, accelerate>=1.6.0, sentencepiece>=0.2.0, flash-attn>=2.7.3 |

## Arquitectura y entrenamiento

La arquitectura es ModernBERT, un encoder transformer con atención bidireccional completa, codificación posicional rotatoria (RoPE) y compatibilidad con FlashAttention 2. El checkpoint se ha generado a partir de un fichero de configuración (ModernBERT-JP-3B-settings) y se ha dimensionado para igualar el recuento de parámetros de sarashina2.2-3b (3309M frente a los 3093M del variante Llama-JP-3B-init del mismo autor). El tokenizador es el de la familia sarashina2.2, con un vocabulario de 102.400 entradas, lo que condiciona el tamaño del embedding y, por tanto, el recuento total de parámetros.

No se ha realizado ningún entrenamiento: los pesos son aleatorios. La model card lo declara explícitamente como punto de partida para preentrenamiento y no documenta número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste supervisado. Tampoco se describen innovaciones de decodificación (el modelo es de tipo masked LM, no autoregresivo) ni técnicas de atención lineal más allá del uso estándar de FlashAttention 2. El contexto de 8192 tokens y la dimensión 2560 son los únicos hiperparámetros arquitectónicos publicados.

## Capacidades

- Ninguna capacidad funcional adquirida: al tratarse de pesos aleatorios, el modelo no genera texto coherente, no razona, no escribe código y no resuelve problemas matemáticos.
- Estructura preparada para masked language modeling (fill-mask): la cabeza `AutoModelForMaskedLM` está disponible, pero sus predicciones son aleatorias hasta que se entrene.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: limitadas al japonés por diseño del tokenizador; no se documenta cobertura de otros idiomas.
- Capacidad especial: ninguna. El modelo actúa como plantilla de inicialización reproducible para experimentos de preentrenamiento con arquitectura encoder en japonés.

## Casos de uso

- Preentrenamiento desde cero en japonés: el modelo sirve como inicialización para entrenar un encoder de 3B con MLM sobre corpus japoneses, aprovechando la configuración ya validada y el tokenizador sarashina2.2.
- Estudio comparativo encoder vs. decoder: permite entrenar un encoder y un decoder (Llama-JP-3B-init) bajo idéntico presupuesto de parámetros y datos, y comparar su calidad en tareas de embeddings de frases, que es el objetivo declarado del artículo MIREI.
- Reproducción de experimentos académicos: al fijar arquitectura, tamaño y tokenizador, facilita la replicación de resultados en entornos de investigación con recursos limitados a 3B.
- Base para ajuste de tareas de comprensión del japonés: tras el preentrenamiento, podría adaptarse a clasificación de texto, NER o QA extractiva mediante fine-tuning supervisado.
- Desarrollo de modelos de embeddings japoneses: la arquitectura encoder bidireccional es la adecuada para producir representaciones de frase y pasaje, un caso de uso habitual en búsqueda semántica y RAG en japonés.
- Docencia y experimentación con ModernBERT: permite estudiar el comportamiento de la arquitectura a escala 3B sin depender de pesos preentrenados de terceros, con licencia MIT y sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un checkpoint con inicialización aleatoria, cualquier métrica (MMLU, JGLUE, HumanEval, etc.) sería equivalente a la de un modelo sin entrenar y no aportaría información sobre su calidad final.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 6,6 GB solo para pesos (13,2 GB de repositorio incluyen también otros artefactos); en la práctica, con activaciones y contexto de 8192 tokens, se recomienda reservar 16-24 GB.
- Cuantización: no se publican variantes GGUF ni cuantizadas; habría que generarlas a partir de los safetensors (por ejemplo con llama.cpp o GPTQ/AWQ), aunque al no estar entrenado el modelo el interés es limitado.
- GPU recomendadas: A100 40/80 GB o H100 para preentrenamiento; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia y experimentos pequeños con FlashAttention 2.
- ¿Cabe en GPU de consumo? Sí, en bfloat16 cabe en tarjetas de 16 GB o más (RTX 4080, 4090, RTX 3090) para inferencia con contexto moderado; el entrenamiento completo requiere mucho más.
- Opciones de despliegue: transformers con accelerate y flash-attn 2.7.3 o superior; vLLM, llama.cpp u Ollama no están documentados para este checkpoint y, al ser un masked LM, su encaje en servidores de generación autoregresiva es limitado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Estado | Licencia |
|---|---|---|---|---|---|
| iamtatsuki05/ModernBERT-JP-3B-init | ModernBERT (encoder) | 3309M | 8192 | Inicialización aleatoria | MIT |
| iamtatsuki05/Llama-JP-3B-init | Llama (decoder) | 3093M | no disponible | Inicialización aleatoria | no disponible |
| sbintuitions/sarashina2.2-3b | Transformer decoder | ~3B | no disponible | Entrenado | no disponible |

La comparación relevante es con Llama-JP-3B-init, del mismo autor y mismo tokenizador, que permite aislar el efecto de la arquitectura (encoder frente a decoder) manteniendo constante el resto de condiciones. Frente a sarashina2.2-3b, el modelo iguala el recuento de parámetros pero no su estado de entrenamiento, por lo que no es un sustituto funcional.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas útiles. Cualquier uso en producción sin preentrenamiento previo dará resultados sin sentido.
- Sin datos de entrenamiento publicados: no se documentan corpus, número de tokens ni metodología de preentrenamiento, lo que dificulta planificar el coste de un entrenamiento completo.
- Solo japonés: el tokenizador y el vocabulario están orientados a japonés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Riesgo de alucinación: no aplica en el estado actual (no genera texto coherente), pero persistirá tras el entrenamiento como en cualquier modelo de lenguaje.
- Sesgos: no evaluados ni documentados; dependerán del corpus que se use para el preentrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el modelo ni sobre los resultados derivados.
- Requisitos de software estrictos: transformers>=4.51.0 y flash-attn>=2.7.3; versiones anteriores pueden fallar al cargar la arquitectura.
- Sin variantes cuantizadas ni integración documentada con vLLM, llama.cpp u Ollama.

## Enlaces

- [Hugging Face: iamtatsuki05/ModernBERT-JP-3B-init](https://huggingface.co/iamtatsuki05/ModernBERT-JP-3B-init)
- [Configuración base: iamtatsuki05/ModernBERT-JP-3B-settings](https://huggingface.co/iamtatsuki05/ModernBERT-JP-3B-settings)
- [Colección MIREI en Hugging Face](https://huggingface.co/collections/iamtatsuki05/mirei)
- [Repositorio GitHub: iamtatsuki05/MIREI](https://github.com/iamtatsuki05/MIREI)
- [Modelo comparativo: iamtatsuki05/Llama-JP-3B-init](https://huggingface.co/iamtatsuki05/Llama-JP-3B-init)
- [Modelo de referencia: sbintuitions/sarashina2.2-3b](https://huggingface.co/sbintuitions/sarashina2.2-3b)
- [Colección del tokenizador: sbintuitions/sarashina22](https://huggingface.co/collections/sbintuitions/sarashina22)
- [Licencia MIT](https://opensource.org/license/mit/)
