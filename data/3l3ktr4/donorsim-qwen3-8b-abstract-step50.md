# 3l3ktr4/donorsim-qwen3-8b-abstract-step50

## Resumen

El modelo `3l3ktr4/donorsim-qwen3-8b-abstract-step50` es un ajuste fino del modelo base Qwen/Qwen3-8B, desarrollado por el usuario 3l3ktr4, especializado en la toma de decisiones dentro del juego iterado del Donante (Donor's Game). Este juego es un paradigma de la teoría de juegos que estudia la cooperación y la reciprocidad en grupos pequeños. El modelo ha sido entrenado con aprendizaje por refuerzo (GRPO) sobre escenarios naturalistas y abstractos, donde debe elegir entre dos opciones (CHOICE: 1 o CHOICE: 2) sin recibir números de recompensa explícitos ni vocabulario de cooperación/defección, lo que obliga a inferir el comportamiento social a partir de descripciones de situaciones cotidianas.

El ajuste se realizó en dos etapas: primero 75 pasos de un juego estructurado en grupo (modelo `donorsim-qwen3-8b-modeAB-step75`) y posteriormente 50 pasos adicionales en la etapa abstracta, con memoria por compañero y probabilidades de reencuentro y chisme expresadas en lenguaje natural. El resultado es un modelo de 8.190 millones de parámetros, con pesos completos en bf16, cargable directamente con `transformers` o vLLM. Su relevancia radica en ser un ejemplo de aplicación de RL a problemas de comportamiento social, con potencial para simular agentes cooperativos en entornos multiagente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el base Qwen3-8B soporta 32.768 tokens) |
| Tipos de cuantizacion | bf16 (pesos completos); no se documentan cuantizaciones adicionales |
| Idiomas soportados | No disponible (el base Qwen3-8B es multilingue) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only con atención completa, 8 mil millones de parámetros y una ventana de contexto de 32.768 tokens en su versión base. Sobre esta arquitectura se aplicó un ajuste fino con GRPO (Group Relative Policy Optimization) utilizando el framework verl 0.7.1, con LoRA de rango 16 y alpha 32, cuyos adaptadores se fusionaron posteriormente en los pesos completos en bf16.

El entrenamiento se realizó en dos fases: primero 75 pasos de un juego de grupo estructurado (con números de recompensa y vocabulario explícito de cooperación/defección) y luego 50 pasos adicionales en la etapa abstracta, donde las situaciones se describen con escenas naturalistas de personas nombradas en un grupo pequeño, sin números de payoff ni términos técnicos. La recompensa combina dos términos: el payoff normalizado (Term 1) y la reciprocidad (Term 2), sin incluir término de grupo ni de eficiencia colectiva. Los compañeros rotan dentro de un grupo de `n_players - 1` miembros, con memoria por compañero, y las probabilidades de reencuentro (`w`) y de chisme (`q`) se comunican verbalmente en cada turno. El orden de las opciones se realeatoriza en cada turno para evitar sesgos posicionales.

## Capacidades

- Toma de decisiones de cooperación o defección en escenarios sociales abstractos y naturalistas, sin recibir números de recompensa explícitos.
- Razonamiento sobre reciprocidad: el modelo ajusta su comportamiento según el historial de interacciones con cada compañero.
- Adaptación a diferentes compañeros dentro de un grupo, manteniendo memoria individualizada.
- Comprensión de probabilidades de reencuentro y de chisme expresadas en lenguaje natural, integrándolas en la decisión.
- Generación de texto en formato `CHOICE: 1` o `CHOICE: 2`, con opciones realeatorizadas.
- Capacidad de ser cargado directamente con `transformers` o vLLM, sin necesidad de adaptadores adicionales.

## Casos de uso

- Simulación de sociedades artificiales: el modelo puede actuar como agente en simulaciones multiagente donde se estudia la emergencia de cooperación, permitiendo experimentar con diferentes parámetros de grupo (tamaño, probabilidad de reencuentro, chisme) sin necesidad de implementar reglas heurísticas.
- Investigación en economía conductual: sirve como generador de comportamientos realistas en juegos de bienes públicos o dilemas sociales, facilitando la comparación con datos empíricos de humanos.
- Generación de datos sintéticos para entrenar otros modelos: las decisiones del modelo pueden usarse para crear conjuntos de datos etiquetados de interacciones sociales, útiles para fine-tuning de modelos más generales.
- Agentes en entornos de juegos cooperativos: puede integrarse en videojuegos o plataformas de simulación donde los NPCs necesiten decidir si ayudar o traicionar a otros personajes basándose en relaciones pasadas.
- Estudio de la influencia del lenguaje en la cooperación: al recibir descripciones verbales de las probabilidades de reencuentro y chisme, el modelo permite analizar cómo la formulación lingüística afecta las decisiones, relevante para el diseño de interfaces de IA conversacional.
- Benchmark de razonamiento social para LLMs: puede utilizarse como tarea de evaluación para medir la capacidad de otros modelos de inferir normas sociales implícitas en escenarios cotidianos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo está especializado en una tarea concreta (Donor's Game) y no se proporcionan métricas estándar como MMLU, HumanEval o GSM8K. La evaluación se limita a las recompensas internas del entrenamiento (payoff normalizado y reciprocidad), cuyos valores numéricos no se han hecho públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros en bf16, los pesos ocupan aproximadamente 16,4 GB (según el tamaño del repositorio). Con overhead de activaciones, se recomienda al menos 20 GB de VRAM para inferencia en precisión completa.
- GPU recomendadas: una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) puede ejecutar el modelo en bf16. Para GPUs con menos memoria, sería necesario aplicar cuantización (por ejemplo, 4-bit o 8-bit), aunque no se documentan cuantizaciones oficiales.
- Compatibilidad con consumer GPU: sí, con cuantización es posible ejecutarlo en GPUs de 8-12 GB (como RTX 3060 o RTX 4070), pero no se proporcionan archivos GGUF ni configuraciones de cuantización en el repositorio.
- Opciones de despliegue: el modelo es compatible con `transformers` y vLLM, según la model card. También puede usarse con text-generation-inference (TGI) al ser compatible con endpoints.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, pero esto depende del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| donorsim-qwen3-8b-abstract-step50 | 8,19B | No disponible | GRPO sobre Donor's Game (abstracto) | No disponible | HuggingFace |
| donorsim-qwen3-8b-modeAB-step75 | 8,19B | No disponible | GRPO sobre Donor's Game (estructurado) | No disponible | HuggingFace |
| Qwen3-8B (base) | 8,19B | 32.768 tokens | Preentrenamiento general + RLHF | Apache 2.0 | HuggingFace |

El modelo se diferencia del base Qwen3-8B en que está especializado exclusivamente en la tarea del Donor's Game, perdiendo la capacidad general de conversación y razonamiento amplio. Frente al modelo `modeAB-step75`, la versión abstracta añade 50 pasos de entrenamiento en escenarios naturalistas, lo que debería mejorar la generalización a situaciones cotidianas, aunque no se dispone de métricas comparativas.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo responde con `CHOICE: 1` o `CHOICE: 2` en el formato del juego; no es adecuado para tareas generales de generación de texto, chat o razonamiento.
- Sesgos del entrenamiento: al estar entrenado con recompensas de reciprocidad, puede favorecer la cooperación condicional, pero no se han auditado sesgos demográficos o culturales en los escenarios naturalistas.
- Riesgo de alucinación: fuera del dominio del Donor's Game, el modelo puede generar respuestas incoherentes o repetitivas, ya que no fue entrenado para mantener conversaciones abiertas.
- Limitaciones de contexto: aunque el base soporta 32k tokens, el fine-tuning no especifica la longitud de contexto utilizada; se recomienda no exceder unos pocos cientos de tokens por turno para evitar degradación.
- Licencia no especificada: al no indicarse la licencia, no se puede garantizar el uso comercial sin consultar al autor.
- Dependencia del modelo base: cualquier limitación de Qwen3-8B (por ejemplo, sesgos lingüísticos o alucinaciones) se hereda en este fine-tuning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-abstract-step50
- Modelo previo (modeAB-step75): https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-modeAB-step75
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Model card de Qwen3-8B-Instruct (NVIDIA): https://developer.nvidia.com/downloads/assets/ace/model_card/qwen3-8b-instruct.pdf
