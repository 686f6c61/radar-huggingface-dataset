# shoukewei/Qwen3.8-27B-OBLITERATED22-AGENT

## Resumen

Qwen3.8-27B-OBLITERATED22-AGENT es una variante "abliterated" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.8-27B, publicada por el usuario shoukewei. Se trata de una reproducción bajo un nuevo identificador del modelo shoukewei/Qwen3.8-27B-OBLITERATED22: los pesos son idénticos, pero se ha restaurado la plantilla de chat del repositorio oficial de Qwen para preservar definiciones de herramientas, llamadas a herramientas del asistente, resultados de herramientas, contenido de visión y controles de razonamiento (thinking). El resultado es un modelo orientado a generación de texto, conversación y uso agéntico, con razonamiento desactivado por defecto en la configuración "Prime Agent".

El modelo cuenta con 27.781.427.952 parámetros reales (aproximadamente 27,8 mil millones), según los pesos en safetensors, y se distribuye tanto en safetensors como en GGUF y formato MLX. La intervención de abliteración se ha refinado en tres iteraciones (V1, V2 y V3), aplicando técnicas de proyección de direcciones de rechazo (SVD y LEACE) y una mezcla complementaria de pesos al 60/40. Según la documentación del autor, la versión V3 responde a consultas restringidas en lugar de emitir rechazos duros o desviaciones tipo "lección de seguridad", con un coste declarado de -2,1 puntos porcentuales en MMLU frente al modelo original.

Su relevancia actual radica en el ámbito de la investigación en seguridad de IA y red-teaming: es un artefacto diseñado explícitamente para estudiar el comportamiento de modelos sin alineamiento de seguridad, y no un modelo de propósito general para producción. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (model_type: qwen3, tag qwen3_5; derivado de Qwen/Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible en el repo); cuantizaciones concretas no especificadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.8-27B, un transformer decoder-only de aproximadamente 27,8 mil millones de parámetros. Este repositorio no entrena el modelo desde cero ni lo ajusta con datos supervisados: parte de los pesos del modelo base y les aplica una intervención de "abliteration" (eliminación de la dirección de rechazo en el espacio de pesos). Según la documentación del autor, la versión V1 aplicó una única pasada agresiva de SVD con 5 direcciones, lo que eliminó los rechazos duros pero degradó MMLU en -6,0 puntos. La V2 introdujo una "mezcla complementaria de abliteración": se ejecutan dos cirugías distintas (SVD, que captura el rechazo de forma agresiva pero daña capacidades, y LEACE, que minimiza la información mutua preservando capacidad pero eliminando el rechazo con menos fuerza) y se mezclan los pesos resultantes en proporción 60/40 para cancelar las debilidades de cada método. La V3 añade refinamiento iterativo sobre el modelo campeón (en lugar de partir del modelo stock) junto con una expansión específica del corpus.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, más allá de las intervenciones post-entrenamiento descritas. La innovación técnica destacable es precisamente el procedimiento de abliteración iterativa con mezcla complementaria. El repositorio AGENT añade una reparación de la plantilla de chat Jinja (`chat_template.jinja` y `tokenizer_config.json`) para restaurar la gestión correcta de herramientas y controles de pensamiento, con `enable_thinking: false` como valor por defecto.

## Capacidades

- Generación de texto y conversación multi-turno en el pipeline `text-generation`.
- Razonamiento con modo "thinking" conmutable: desactivado por defecto en la configuración agéntica, activable de forma explícita. Según el autor, la V3 funciona sin rechazos en ambos modos.
- Generación de código: la documentación reporta 20/20 en tareas de código/ciber con código funcional.
- Soporte de tool calling / function calling: la plantilla de chat restaurada preserva definiciones de herramientas, llamadas del asistente y resultados de herramientas.
- Uso agéntico y razonamiento multi-paso, con recomendaciones específicas del autor para evitar bucles (repetition_penalty 1.15, temperatura 0,1-0,3, resumen de contexto tras ~10 turnos).
- Plantilla compatible con contenido de visión (el template restaurado contempla "vision content"), aunque no se confirma que el modelo tenga capacidades multimodales reales.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA y red-teaming: el modelo está etiquetado explícitamente para `red-team` y `ai-safety-research`; permite estudiar cómo se comporta un transformer de ~27,8B sin direcciones de rechazo y comparar su comportamiento con el modelo stock sobre el mismo conjunto de prompts.
- Evaluación de robustez de filtros y guardarraíles: al ser un modelo "uncensored", sirve como actor adversario controlado para medir si una capa de moderación externa detecta y bloquea contenido problemático antes de llegar al usuario.
- Generación de código en entornos de pentest autorizados: la documentación reporta 20/20 en tareas de ciber/código con implementaciones funcionales; puede emplearse en laboratorios aislados para escribir herramientas de análisis de vulnerabilidades.
- Experimentación con agentes autónomos en local: el repositorio incluye formato MLX, lo que permite ejecutar el modelo en Apple Silicon con MLX para probar bucles de tool calling sin depender de APIs externas.
- Estudio de degradación por abliteración: comparar MMLU 0-shot (lm-eval, n=5700) entre la versión stock (84,5%), V1 (81,4%), V2 (84,3%) y V3 (82,3%) permite cuantificar el coste de capacidad de cada método de intervención.
- Despliegue cuantizado en GGUF para pruebas offline: el repo distribuye pesos GGUF con plantilla de chat que prefija un bloque de pensamiento vacío, útil para entornos sin GPU (llama.cpp, Ollama, LM Studio) en tareas de generación larga.
- Generación de texto y razonamiento general en contextos controlados donde se tolere un modelo sin alineamiento de seguridad y el coste de -2,1 puntos de MMLU sea aceptable.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card:

| Benchmark | Stock Qwen3.8-27B | V1 | V2 | V3 |
|---|---|---|---|---|
| MMLU (lm-eval, 0-shot) | 84,5% (n=5700) | 81,4% | 84,3% | 82,3% |
| Diferencia vs stock | — | -6,0 pp | -0,3 pp | -2,1 pp |
| Tareas de ciber/código (20 prompts) | rechaza | no probado | no probado | 20/20 con código funcional |
| Tareas avanzadas reales | 5/8 | no probado | 7/8 | 7/8 |
| Modo thinking | sí | no | no (rechaza) | sí |

No se han publicado en la información disponible benchmarks adicionales (HumanEval, GSM8K, MMLU-Pro, etc.) ni comparativas con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55-56 GB solo para pesos (27,8B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada a 8 bits: en torno a 28 GB. A 4 bits (GGUF Q4 / MLX 4-bit): aproximadamente 14-16 GB.
- GPU recomendadas: A100 80 GB o H100 para bfloat16 sin cuantizar; A100 40 GB o L40S para 8 bits; para 4 bits puede emplearse una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Compatibilidad con GPU de consumo: sí en cuantizaciones de 4 bits (RTX 4090/3090 con 24 GB). En bfloat16 no cabe en ninguna GPU de consumo actual.
- Apple Silicon: el repositorio se publica con librería MLX, por lo que está pensado para ejecutarse en Macs con memoria unificada; se requiere una configuración con al menos 32-64 GB de memoria unificada según la cuantización.
- Opciones de despliegue: MLX (librería declarada), llama.cpp con `--jinja` (los GGUF incluyen plantilla propia), Ollama, LM Studio, y vLLM o TGI si se usa safetensors en GPU (no confirmado por el autor).
- Latencia y throughput estimados: no disponibles.
- Tamaño del repositorio: 237,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (0-shot) | Alineamiento de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED22-AGENT (V3) | ~27,8B | no disponible | 82,3% | Abliterated, sin rechazos | apache-2.0 | HF (safetensors, GGUF, MLX) |
| Qwen3.8-27B-OBLITERATED22 (V2, mismo autor) | ~27,8B | no disponible | 84,3% | Abliterated parcial (deflexiones blandas) | apache-2.0 | HF |
| Qwen/Qwen3.8-27B (base) | ~27,8B | no disponible | 84,5% | Alineado con rechazos | apache-2.0 | HF |

No se dispone en la información proporcionada de datos de otros modelos abliterated de tamaño comparable (por ejemplo variantes de Llama o Mistral) que permitan una comparación cruzada rigurosa.

## Limitaciones y advertencias

- Modelo sin mecanismos de rechazo: la abliteración elimina deliberadamente las direcciones de rechazo y las "lecciones de seguridad". No debe desplegarse en aplicaciones de cara al público sin capas de moderación externas.
- Riesgo elevado de generar contenido dañino, ilegal o peligroso si se le solicita; el propio autor lo etiqueta para red-team y ai-safety-research.
- Riesgo de alucinación no cuantificado: no se han publicado métricas de factualidad ni de tasa de alucinación.
- Degradación de capacidad documentada: -2,1 puntos porcentuales en MMLU 0-shot frente al modelo stock (82,3% vs 84,5%).
- Bucles en decodificación greedy: el autor advierte explícitamente de que, sin `repetition_penalty` 1.15, la decodificación greedy entra en bucles sobre imports y código boilerplate. En uso agéntico recomienda temperatura 0,1-0,3 y limitar a 1024-2048 tokens por turno.
- Los prompts de sistema pueden reintroducir rechazos según las pruebas A/B del autor; recomienda no usar system prompt.
- Gestión de contexto: se aconseja resumir o recortar el historial tras unos 10 turnos en uso agéntico; la longitud de contexto soportada no está documentada.
- Idiomas soportados: no disponibles; no hay evaluación multilingüe publicada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo se distribuye como artefacto de investigación; la responsabilidad legal del uso recae en el desplegador.
- Confusión de versiones: el repositorio es una reproducción (republish) de OBLITERATED22 con la plantilla de chat reparada; los pesos son idénticos al modelo original, solo cambia la gestión de plantilla y del modo thinking.
- Fecha de publicación declarada: 13 de octubre de 2026, posterior a la fecha de referencia habitual de los modelos Qwen3; conviene verificar la procedencia y autenticidad de los pesos antes de cualquier uso serio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shoukewei/Qwen3.8-27B-OBLITERATED22-AGENT
- Modelo original del que es reproducción: https://huggingface.co/shoukewei/Qwen3.8-27B-OBLITERATED22
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
