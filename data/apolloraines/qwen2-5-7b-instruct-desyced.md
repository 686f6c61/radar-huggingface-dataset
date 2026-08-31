# ApolloRaines/Qwen2.5-7B-Instruct-Desyced

## Resumen

Qwen2.5-7B-Instruct-Desyced es una variante del modelo Qwen2.5-7B-Instruct, desarrollada por ApolloRaines, que incorpora una modificación de pesos post-entrenamiento denominada "Desycophancy". Esta técnica reduce la tendencia del modelo a ceder ante afirmaciones incorrectas del usuario cuando este ejerce presión social, como citar una autoridad falsa o expresar certeza injustificada. El objetivo es mejorar la fiabilidad del modelo como fuente de conocimiento y herramienta de apoyo a la decisión, sin sacrificar sus capacidades generales.

El modelo mantiene la misma arquitectura, tokenizador y longitud de contexto que el base, por lo que puede usarse como reemplazo directo en aplicaciones existentes. Se distribuye en formatos safetensors (precisión completa) y GGUF cuantizado (Q8_0 y Q4_K_M), lo que facilita su despliegue en entornos con recursos limitados. La licencia es Apache-2.0, igual que el modelo original.

La relevancia de esta versión radica en abordar un problema conocido en los modelos de lenguaje: la sicofancia, que puede llevar a respuestas incorrectas en contextos de alta presión social. Al reducir este comportamiento, el modelo resulta más robusto para usos donde la exactitud es crítica, como asesoramiento técnico, educación o atención al cliente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basado en Qwen2.5 |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K (heredado del modelo base) |
| Tipos de cuantizacion | Safetensors (FP16), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con 7.6 mil millones de parámetros y una ventana de contexto de 128K tokens. La modificación Desyced no implica reentrenamiento, RLHF ni datos adicionales; consiste en una intervención sobre los pesos del modelo que reduce la dirección de activación asociada al comportamiento sicofante. Según la model card, se preservan las capacidades, el conocimiento y la personalidad del modelo base, y solo se atenúa la tendencia a capitular ante presión social.

No se han publicado detalles sobre el método exacto de modificación de pesos, pero el resultado se valida mediante "trampas de contradicción": el modelo responde correctamente a una pregunta factual y luego el usuario intenta que cambie su respuesta citando una autoridad falsa o expresando certeza. En estas pruebas, el modelo mantiene su postura en el 83% de los casos tras la modificación, frente al 50% antes.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base.
- Razonamiento y comprensión de instrucciones complejas, con especial resistencia a la presión social en contextos de contradicción.
- Soporte de tool calling y function calling, heredado del modelo base (Qwen2.5-7B-Instruct incluye esta capacidad).
- Capacidades multilingües limitadas al inglés, según la model card, aunque el base soporta más idiomas.
- No se especifican capacidades de visión, audio u otras modalidades; es un modelo exclusivamente de texto.
- La modificación Desyced no altera el conocimiento ni las habilidades de razonamiento, solo reduce la sicofancia.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones con usuarios que insisten en afirmaciones incorrectas, manteniendo respuestas precisas sin ceder a la presión. Su ventana de 128K permite manejar historiales largos.
- Asistente de soporte técnico: ante preguntas sobre configuración o resolución de errores, el modelo no se deja influenciar por afirmaciones erróneas del usuario, reduciendo el riesgo de dar instrucciones incorrectas.
- Herramienta de verificación de hechos: útil para contrastar información en tiempo real, ya que resiste la influencia de fuentes no fiables citadas por el usuario.
- Tutoría educativa: al corregir ejercicios o explicar conceptos, el modelo no se pliega ante respuestas equivocadas del estudiante, fomentando un aprendizaje más riguroso.
- Asistente de investigación: en entornos donde el usuario propone hipótesis incorrectas con confianza, el modelo mantiene su criterio basado en datos, ayudando a evitar sesgos de confirmación.
- Integración en pipelines de generación de código: al recibir feedback del usuario que contradice el análisis del modelo, este no modifica su respuesta sin evidencia sólida, mejorando la fiabilidad en revisiones de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la prueba de resistencia a la presión social, que se resume a continuación:

| Prueba | Antes | Después |
|---|---|---|
| Mantiene su respuesta bajo presión (trampa de contradicción) | 50% | 83% |

No hay datos comparativos con otros modelos en esta métrica.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15.2 GB (según llm-explorer.com), lo que requiere una GPU con al menos 16 GB, como RTX 4080, RTX 4090, A100 o H100.
- Con cuantización GGUF Q4_K_M, el modelo puede ejecutarse en GPUs de consumo con 8 GB de VRAM, como RTX 3060, RTX 3070 o RTX 4060.
- La cuantización Q8_0 requiere alrededor de 8-9 GB de VRAM, apta para GPUs de 10-12 GB.
- Opciones de despliegue: transformers (Python), llama.cpp, Ollama, LM Studio, vLLM, TGI y DeepswapLLM (este último permite ejecutar el modelo en GPUs con poca memoria mediante streaming de capas).
- Latencia y throughput: no se han publicado datos específicos; dependerán del hardware y la cuantización. En una RTX 4090 con Q4_K_M, se puede esperar una generación de 20-40 tokens por segundo, aunque no está confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Sicofancia reducida | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-Desyced | 7.6B | 128K | Apache-2.0 | Sí (83% de firmeza) | Hugging Face |
| Qwen2.5-7B-Instruct (base) | 7.6B | 128K | Apache-2.0 | No (50% de firmeza) | Hugging Face, Ollama |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | No disponible | Hugging Face, Ollama |

La comparativa se limita al modelo base y a un modelo de tamaño similar, ya que no hay datos públicos sobre otros modelos con modificación anti-sicofancia. La principal diferencia con el base es la mejora en la resistencia a la presión social, mientras que el resto de capacidades se mantienen.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés; su rendimiento en otros idiomas no está garantizado, aunque el base Qwen2.5 es multilingüe.
- La modificación Desyced se ha validado únicamente con trampas de contradicción; no hay evidencia de su efecto en otros tipos de sesgo o en tareas complejas.
- Al ser una modificación de pesos sin reentrenamiento, podrían existir efectos colaterales no documentados en ciertos dominios o estilos de conversación.
- El modelo puede seguir alucinando o generando información incorrecta en contextos donde no hay presión social; la reducción de sicofancia no elimina el riesgo de alucinación.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen2.5, que también es Apache-2.0.
- No se han publicado evaluaciones exhaustivas de seguridad, sesgos o robustez más allá de la métrica de sicofancia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ApolloRaines/Qwen2.5-7B-Instruct-Desyced)
- [Modelo base Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- [Repositorio DeepswapLLM](https://github.com/apolloraines/DeepswapLLM)
- [Página de Qwen2.5 en Ollama](https://ollama.com/library/qwen2.5:7b-instruct)
- [Ficha en llm-explorer.com](https://llm-explorer.com/model/ApolloRaines%2FQwen2.5-7B-Instruct-Desyced,5yE1NZTuhNU1ge8WqC1W2L)
