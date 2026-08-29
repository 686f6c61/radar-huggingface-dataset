# 3l3ktr4/donorsim-qwen3-8b-abstract-step20

## Resumen

El modelo `3l3ktr4/donorsim-qwen3-8b-abstract-step20` es un fine-tuning del modelo base Qwen/Qwen3-8B, desarrollado por el usuario 3l3ktr4, especializado en el juego del donante iterado (iterated Donor's Game). Se trata de un modelo de investigación que simula decisiones de cooperación y reciprocidad en escenarios naturalistas y abstractos, sin usar vocabulario explícito de "cooperar" o "defectar", sino situaciones cotidianas con personas nombradas en un grupo pequeño.

El modelo se entrenó con GRPO (Group Relative Policy Optimization) usando la librería verl 0.7.1, con LoRA (r16/alpha32) fusionado en pesos bf16. Es el resultado de 20 pasos de entrenamiento abstracto sobre el modelo intermedio `donorsim-qwen3-8b-modeAB-step75`, que a su vez había sido entrenado durante 75 pasos en un juego estructurado con grupos. La arquitectura es un transformer denso de 8.190 millones de parámetros, heredada de Qwen3-8B.

La relevancia de este modelo radica en su aplicación a la investigación en comportamiento cooperativo, teoría de juegos y simulación de agentes sociales. Al estar entrenado con recompensas que combinan payoff normalizado y reciprocidad, el modelo aprende a ajustar sus decisiones según el historial de interacciones con cada compañero, lo que lo convierte en una herramienta útil para estudiar dinámicas de cooperación en entornos multiagente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-8B, un transformer denso con 8 mil millones de parámetros, atención por ventanas y soporte para modo thinking (aunque este fine-tuning no lo activa explícitamente). El entrenamiento se realizó con GRPO sobre el juego del donante iterado, donde el modelo recibe descripciones cortas de situaciones naturalistas (por ejemplo, "Ana se encuentra con Luis en el mercado") y debe responder `CHOICE: 1` o `CHOICE: 2`, con el orden de las opciones realeatorizado en cada turno.

La función de recompensa combina dos términos: el payoff normalizado (Term 1) y la reciprocidad (Term 2), sin incluir término de grupo ni de eficiencia colectiva. Los compañeros rotan dentro de un grupo de `n_players - 1` miembros, con memoria individual por compañero. Las probabilidades de reencuentro (`w`) y de chisme (`q`) se expresan en lenguaje natural en cada turno. El entrenamiento se realizó en 20 pasos abstractos sobre el modelo intermedio `modeAB-step75`, usando 2 nodos con 8 réplicas de rollout. Los pesos LoRA se fusionaron en los pesos completos bf16, por lo que el modelo se puede cargar directamente con `transformers` o vLLM sin necesidad de adaptadores.

## Capacidades

- Generación de texto condicionada a escenarios sociales: el modelo produce respuestas binarias (`CHOICE: 1` o `CHOICE: 2`) ante descripciones de situaciones cotidianas.
- Razonamiento sobre reciprocidad: ajusta sus decisiones basándose en el historial de interacciones con cada compañero concreto.
- Comprensión de lenguaje natural en escenarios abstractos: interpreta descripciones sin números de payoff ni vocabulario técnico de teoría de juegos.
- Memoria por interlocutor: mantiene un registro de las acciones previas de cada compañero dentro de la ventana de contexto.
- Adaptación a probabilidades expresadas verbalmente: entiende frases como "es probable que vuelvas a encontrarte con esta persona" o "los demás pueden enterarse de tu decisión".
- No soporta tool calling, visión, audio ni otras modalidades; es un modelo de texto puro especializado en una tarea concreta.

## Casos de uso

- Investigación en comportamiento cooperativo: el modelo puede usarse como agente en simulaciones de juegos del donante iterado para estudiar cómo emergen estrategias de cooperación, reciprocidad o explotación en poblaciones de agentes.
- Generación de datos sintéticos para teoría de juegos: permite crear conjuntos de datos etiquetados con decisiones de cooperación/defección en escenarios naturalistas, útiles para entrenar otros modelos o validar hipótesis.
- Simulación de agentes sociales en entornos multiagente: puede integrarse en marcos de simulación donde varios agentes interactúan repetidamente, por ejemplo en economía del comportamiento o sociología computacional.
- Evaluación de políticas de incentivos: al variar las probabilidades de reencuentro y chisme, se puede estudiar cómo afectan estos parámetros a la tasa de cooperación agregada.
- Benchmark de razonamiento social: sirve como caso de estudio para medir la capacidad de un LLM de mantener estrategias consistentes a lo largo de interacciones con memoria.
- Prototipo de asistente para dilemas sociales: aunque no es su propósito principal, podría adaptarse para generar recomendaciones en situaciones de cooperación cotidiana, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está diseñado para una tarea específica (juego del donante) y no se reportan métricas estándar como MMLU, HumanEval o GSM8K. La evaluación se centra en la tasa de cooperación y la reciprocidad dentro del entorno de entrenamiento, pero esos datos no se han hecho públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8,19 B parámetros en bf16, el peso ocupa aproximadamente 16,4 GB. Con la ventana de contexto y los estados intermedios, se recomienda al menos 20 GB de VRAM para inferencia en precisión completa.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente para inferencia en bf16. En GPUs con menos memoria, sería necesario cuantizar a 8 bits o 4 bits, aunque no se proporcionan pesos cuantizados.
- En consumer GPU: cabe en una RTX 4090 o RTX 3090 (24 GB) con bf16, pero no en GPUs de 16 GB o menos sin cuantización.
- Opciones de despliegue: compatible con `transformers` y vLLM (según la model card). También puede ejecutarse con llama.cpp si se convierte a GGUF, aunque no se proporciona esa conversión.
- Latencia y throughput: no se han publicado datos. Para un modelo de 8B en una A100, se puede esperar un throughput de decenas de tokens por segundo, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Propósito |
|---|---|---|---|---|---|
| donorsim-qwen3-8b-abstract-step20 | 8,19 B | no disponible | GRPO sobre Donor's Game | no disponible | Cooperación en escenarios abstractos |
| donorsim-qwen3-8b-modeAB-step75 | 8,19 B | no disponible | GRPO sobre juego estructurado | no disponible | Cooperación en juego con grupos |
| Qwen3-8B (base) | 8,19 B | 32k tokens | Preentrenamiento general | Apache 2.0 | Modelo de propósito general |

El modelo se diferencia del base Qwen3-8B en que está especializado en una tarea concreta de teoría de juegos, perdiendo capacidades generales de razonamiento, código o matemáticas. Frente a su predecesor `modeAB-step75`, este modelo opera en escenarios abstractos sin números de payoff, lo que lo hace más robusto a la variabilidad del lenguaje natural. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es un modelo de investigación, no apto para uso en producción general. Su única salida es una elección binaria en un contexto de juego.
- No se ha evaluado su comportamiento fuera del dominio del Donor's Game; puede producir respuestas incoherentes o irrelevantes en otros contextos.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o su redistribución.
- El modelo puede presentar sesgos derivados de los escenarios de entrenamiento (nombres, situaciones, dinámicas de grupo) que no han sido auditados.
- Riesgo de alucinación: al ser un fine-tuning de un LLM, puede generar respuestas que no corresponden a la situación descrita si el escenario se aleja de los patrones vistos en entrenamiento.
- La memoria por compañero depende de la ventana de contexto; con contextos largos o muchos interlocutores, la información puede perderse.
- No se proporcionan pesos cuantizados, lo que limita su despliegue en hardware con poca memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-abstract-step20
- Modelo intermedio (modeAB-step75): https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-modeAB-step75
- Modelo REINFORCE-VERL (otro experimento del autor): https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-REINFORCE-VERL
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
