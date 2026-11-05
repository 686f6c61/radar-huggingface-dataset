# richardyoung/OLMo-2-0325-32B-Instruct-SOM-heretic

## Resumen

OLMo-2-0325-32B-Instruct-SOM-heretic es una variante "decensored" (también etiquetada como abliterated o uncensored) del modelo allenai/OLMo-2-0325-32B-Instruct, publicada por el usuario richardyoung. La modificación se ha realizado con la herramienta Heretic v2.0.0 aplicando una técnica de ablación multi-direccional basada en mapas autoorganizados (Self-Organizing Map, SOM) sobre las proyecciones de atención y las capas MLP del transformer original. El objetivo declarado es reducir la tasa de rechazos del modelo ante peticiones que el modelo base rechazaría, manteniendo al mismo tiempo una divergencia KL baja respecto al original.

El modelo hereda la arquitectura y el entrenamiento del OLMo 2 32B Instruct de AI2 (Allen Institute for AI), un transformer denso de 32.234.279.936 parámetros entrenado sobre el corpus Dolma y post-entrenado con SFT sobre una variante de Tülu 3, DPO y RLVR. La intervención de Heretic no reentrena el modelo: solo modifica pesos mediante ablación de direcciones, por lo que las capacidades base (razonamiento, matemáticas, código, instrucciones) se conservan en gran medida, mientras que el comportamiento de rechazo se atenúa de forma medible (63/100 rechazos frente a 98/100 del original, según la model card).

Es relevante ahora porque combina dos tendencias: por un lado, el interés de la comunidad open source por variantes sin censura para investigación sobre alineamiento, evaluación de sesgos y experimentación sin restricciones de rechazo; por otro, el uso de técnicas de edición de pesos cada vez más sofisticadas (SOM multi-direccional) que buscan minimizar el daño colateral en calidad y coherencia. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (OLMo 2), decoder-only |
| Parámetros totales | 32.234.279.936 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible en la información proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | inglés (en); el modelo base está entrenado principalmente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 64,5 GB) |

## Arquitectura y entrenamiento

La base es OLMo 2 32B, un transformer decoder-only denso de 32.234 millones de parámetros desarrollado por AI2. El modelo original se entrenó sobre el corpus Dolma (mezcla de datos públicos, sintéticos y creados por humanos) y se post-entrenó en tres fases: SFT sobre una variante específica de OLMo del dataset Tülu 3, DPO sobre allenai/olmo-2-0325-32b-preference-mix y RLVR final sobre allenai/RLVR-GSM-MATH-IF-Mixed-Constraints. Tülu 3 está diseñado para rendir en tareas diversas además de chat, como MATH, GSM8K e IFEval. AI2 publica código, checkpoints, logs y detalles de entrenamiento.

La modificación de esta variante es una ablación de pesos, no un reentrenamiento. Heretic v2.0.0 aplica una ablación multi-direccional guiada por mapas autoorganizados (SOM) con dirección calculada por capa (direction_index = per layer) y sin decaimiento (direction_decay = 0.00). Los parámetros de ablación se aplican sobre attn.o_proj (max_weight 1.45 en posición 46.56; min_weight 1.09 a distancia 27.72) y mlp.down_proj (max_weight 1.30 en posición 53.52; min_weight 0.97 a distancia 13.84). El resultado declarado es una reducción de rechazos de 98/100 a 63/100 con una divergencia KL de 0.0470 respecto al modelo original, lo que indica que la distribución de salida se mantiene relativamente próxima a la del base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con plantilla de chat propia (`<|user|>` / `<|assistant|>` / `<|endoftext|>`).
- Razonamiento y matemáticas: el post-entrenamiento incluye RLVR sobre GSM y MATH, por lo que mantiene capacidad para problemas aritméticos y de razonamiento multi-paso.
- Seguimiento de instrucciones (IFEval) y tareas de formato estructurado.
- Generación de código y resolución de problemas algorítmicos, heredada del modelo base.
- Respuesta a preguntas factuales (PopQA, TruthfulQA en la evaluación del base).
- Comportamiento "decensored": reduce la tasa de rechazos ante peticiones que el modelo original rechazaría (63/100 frente a 98/100).
- Soporte de tool calling / function calling: no documentado explícitamente en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso autónomo: no documentadas específicamente; el modelo base no incluye un modo "thinking" explícito.
- Capacidades multimodales (visión, audio): no disponibles; es un modelo solo de texto.
- Multilingüismo: limitado al inglés según la model card.

## Casos de uso

- Investigación sobre alineamiento y censura: el modelo permite estudiar cómo varía la tasa de rechazo y la calidad tras una ablación SOM, comparando directamente con el OLMo 2 32B Instruct original y analizando la divergencia KL de 0.0470.
- Evaluación de robustez de filtros de seguridad: sirve como caso control para medir si los clasificadores de contenido o las políticas de moderación detectan respuestas que el modelo base habría rechazado.
- Generación de datos sintéticos para red teaming: al reducir los rechazos, puede producir ejemplos adversarios y prompts de prueba que alimenten pipelines de evaluación de seguridad en modelos propios.
- Fine-tuning posterior sin restricciones de rechazo: investigadores que necesitan un punto de partida con menos comportamiento de negativa para ajustar tareas específicas (por ejemplo, roleplay o narrativa) sin que el modelo se bloquee.
- Estudio de edición de pesos: la configuración SOM publicada (parámetros por capa sobre attn.o_proj y mlp.down_proj) permite reproducir y comparar técnicas de abliteration frente a métodos de una sola dirección.
- Despliegue experimental en entornos controlados de investigación: con 32B parámetros y licencia Apache 2.0, se puede servir en infraestructura propia para experimentos de chat y razonamiento en inglés, siempre con supervisión humana.
- Benchmarking de degradación por ablación: comparar MMLU, GSM8K o IFEval entre esta variante y el base para cuantificar el coste de la decensura en tareas estándar.

## Benchmarks y rendimiento

La model card solo publica métricas de la intervención Heretic, no una batería completa de benchmarks para esta variante. Los datos disponibles son:

| Métrica | Este modelo | Modelo original (OLMo-2-0325-32B-Instruct) |
|---|---|---|
| Rechazos (sobre 100) | 63/100 | 98/100 |
| Divergencia KL | 0.0470 | 0 (por definición) |

Para contextualizar, la model card del modelo base incluye resultados del OLMo 2 32B Instruct frente a otros modelos, pero no se dispone en la información proporcionada de la tabla completa ni de los valores de esta variante en MMLU, GSM8K, HumanEval u otros. No se han publicado resultados de benchmarks completos de esta variante en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 64,5 GB de pesos, por lo que se necesitan al menos 2 GPU de 40 GB (A100 40GB) o una GPU de 80 GB (A100 80GB, H100 80GB) para cargar el modelo completo sin cuantizar.
- Cuantización a 8 bits (INT8): en torno a 32-35 GB, cabe en una A100 40GB o en dos RTX 4090 de 24 GB con tensor parallelism.
- Cuantización a 4 bits (NF4/GPTQ/AWQ): en torno a 18-20 GB, potencialmente desplegable en una sola RTX 4090 de 24 GB, aunque con degradación de calidad y sin garantía de que existan pesos cuantizados publicados para esta variante.
- GPU recomendadas: A100 80GB, H100 80GB para FP16; A100 40GB o 2x RTX 4090 para 8 bits; RTX 4090 única solo con cuantización agresiva.
- No cabe en GPUs consumer de gama media (RTX 3060/4060 de 12-16 GB) ni en CPU de forma práctica para uso interactivo.
- Opciones de despliegue: transformers (requiere instalar la rama main de transformers para soporte `olmo2`), vLLM y TGI para serving de alto rendimiento; llama.cpp/Ollama solo si se generan conversiones GGUF propias, ya que no se listan en el repo.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, un modelo denso de 32B en una A100 80GB ofrece decodificación interactiva, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct-SOM-heretic (este) | 32,2B | no disponible | Apache 2.0 | Variante decensored con ablación SOM; 63/100 rechazos, KL 0.0470 |
| allenai/OLMo-2-0325-32B-Instruct | 32,2B | no disponible | Apache 2.0 | Modelo base; 98/100 rechazos; referencia de calidad |
| Mistral-Nemo-Instruct-2407 | 12B | no disponible | Apache 2.0 | Alternativa open weights de menor tamaño; promedio 50,9 en la tabla del base |
| Ministral-8B-Instruct | 8B | no disponible | no disponible | Alternativa más pequeña; promedio 52,1 en la tabla del base |

La comparación directa con otras variantes "abliterated" de la misma familia no está disponible en la información proporcionada. Frente al modelo base, la diferencia clave es el comportamiento de rechazo y una divergencia KL de 0.0470, con el mismo tamaño y licencia.

## Limitaciones y advertencias

- La reducción de rechazos implica que el modelo puede generar contenido problemático, ofensivo o inseguro; el modelo base ya tenía entrenamiento de seguridad limitado y esta variante lo atenúa aún más.
- Riesgo de alucinación inherente al modelo base; la ablación de pesos puede alterar ligeramente la coherencia, aunque la KL de 0.0470 sugiere una desviación moderada.
- Idiomas: solo inglés documentado; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no especificada en la información disponible; conviene verificar la configuración del modelo base antes de usarlo en tareas de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de una variante decensored en producción conlleva responsabilidad legal y reputacional; se recomienda filtrado en la salida y supervisión humana.
- No se han publicado pesos cuantizados (GGUF, AWQ, GPTQ) en el repo; el despliegue eficiente requiere conversión propia.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria ni reportes independientes de calidad.
- Requiere una versión de transformers con soporte `olmo2` (rama main en el momento de la publicación del base).

## Enlaces

- HuggingFace del modelo: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-SOM-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Modelo pre-DPO: https://huggingface.co/allenai/OLMo-2-0325-32B-DPO
- Modelo pre-Instruct: https://huggingface.co/allenai/OLMo-2-0325-32B/
- Heretic: https://heretic-project.org
- Paper OLMo 2: https://arxiv.org/abs/2501.00656
- Paper Tülu 3: https://arxiv.org/abs/2411.15124
- Dataset SFT Tülu 3 OLMo 2: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture
- Dataset DPO: https://huggingface.co/datasets/allenai/olmo-2-0325-32b-preference-mix
- Dataset RLVR: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
- Página del proyecto OLMo: https://allenai.org/olmo
- Repo de entrenamiento e inferencia: https://github.com/allenai/OLMo-core
- Repo de evaluación: https://github.com/allenai/olmes
- Repo de fine-tuning: https://github.com/allenai/open-instruct
- Demo/playground: https://playground.allenai.org/
