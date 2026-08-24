# cgcristi0/qwenard3-80b-lora

## Resumen

qwenard3-80b-lora es un adaptador LoRA desarrollado por cgcristi0 sobre el modelo base Qwen/Qwen3-Next-80B-A3B-Instruct, un MoE híbrido de 80 mil millones de parámetros totales con aproximadamente 3 mil millones de parámetros activos por token. El adaptador transforma el modelo en una personalidad "hype-man" caótica, con fluidez en memes y tono entusiasta, orientado a conversación casual y entretenimiento.

El proyecto es relevante porque demuestra un fine-tuning QLoRA sobre una arquitectura de última generación con atención lineal (Gated DeltaNet), un caso poco común en la práctica. Además, documenta de forma transparente las dificultades técnicas encontradas al intentar fusionar el adaptador en un modelo completo o exportarlo a GGUF, así como las limitaciones de fiabilidad en tareas sensibles.

El adaptador se distribuye bajo licencia Apache-2.0, heredada del modelo base, y el repositorio incluye el adaptador PEFT en formato safetensors, con un peso de solo 0.1 GB, pero no incluye el dataset de entrenamiento ni una versión fusionada o cuantizada del modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-Next-80B-A3B-Instruct (MoE hibrido con Gated DeltaNet y atencion por puertas) + adaptador LoRA |
| Parametros totales | 80B (modelo base) + adaptador LoRA (~no disponible) |
| Parametros activos | ~3B (modelo base, 3.75 % del total) |
| Longitud de contexto | Modelo base: no disponible en la informacion proporcionada (soporta mas de 32K segun el fabricante); adaptador entrenado con max_seq_length=2048 |
| Tipos de cuantizacion | 4-bit (base QLoRA, bnb-4bit) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Next-80B-A3B-Instruct es un MoE ultra-esparso con 512 expertos, de los cuales 10 se enrutan por token junto con 1 experto compartido. Su arquitectura híbrida alterna bloques de Gated DeltaNet (atención lineal) y bloques de atención con puertas, una combinación que Alibaba reporta que reduce el coste de entrenamiento a un 10 % del de Qwen3-32B y multiplica por 10 el throughput de inferencia más allá de 32K de contexto.

El adaptador qwenard3-80b-lora se entrenó mediante QLoRA con base en 4-bit, utilizando la biblioteca PEFT estándar. El rank del LoRA es 32 con alpha 64, y los módulos objetivo incluyen tanto las proyecciones de atención estándar (q/k/v/o_proj en 12 de 48 capas) como las proyecciones de la atención lineal (in_proj_qkvz, in_proj_ba, out_proj en 36 de 48 capas). El dataset consta de aproximadamente 1.954 ejemplos escritos a mano, cubriendo reacciones a situaciones cotidianas, improvisación colaborativa, preguntas reales con respuestas correctas, mensajes de crisis y peticiones dañinas. Se entrenaron 2 épocas (de las 4 planeadas) con una tasa de aprendizaje de 2e-4, en una única GPU A100 de 80 GB en RunPod, alcanzando una pérdida final de ~0.20.

El autor documenta que el proceso de fusión del adaptador con el modelo base falló en las herramientas automatizadas (Unsloth y PEFT) debido a los nombres de capas de atención lineal personalizadas, por lo que se distribuye únicamente el adaptador.

## Capacidades

- Generación de texto conversacional con una personalidad definida ("hype-man" caótico y entusiasta), con respuestas en estilo informal y con uso de memes.
- Interacción en conversaciones multi-turno con plantilla de chat estándar y desactivación del modo pensamiento (`enable_thinking=False`).
- Improvisación colaborativa: el modelo puede construir rutinas humorísticas de "hype" con el usuario en lugar de solo reaccionar.
- Respuesta a preguntas de utilidad real (por ejemplo, cómo quitar manchas de vino tinto) manteniendo la voz del personaje.
- Refusos a peticiones dañinas (por ejemplo, cómo forzar una cerradura) en tono plano, aunque con fiabilidad limitada (ver Limitaciones).
- Capacidad multilingüe limitada: el modelo base es multilingüe, pero el adaptador se entrenó solo en inglés y la documentación indica que solo se soporta inglés.

## Casos de uso

- **Entretenimiento conversacional**: el modelo puede usarse como un chatbot de chat informal con personalidad, para jugar o para crear contenido humorístico en streaming o redes sociales. Su tono caótico y su facilidad para los memes lo hacen adecuado para escenarios donde el humor es el objetivo principal.
- **Roleplay en juegos**: por su naturaleza de "hype-man" y su estilo coloquial, puede servir como personaje no jugador (NPC) en juegos de texto o juegos de rol, aportando un tono único y memorable.
- **Prototipado de chatbots con personalidad**: los desarrolladores pueden usar este adaptador como referencia para estudiar cómo se comporta un fine-tuning de LoRA sobre una arquitectura MoE híbrida, y para experimentar con técnicas de personalización de LLM.
- **Generación de contenido para redes sociales**: el modelo puede producir respuestas rápidas en tono humorístico para publicaciones, comentarios o hilos, manteniendo una voz consistente y entretenida.
- **Investigación sobre adaptación de MoE híbridos**: el proyecto sirve como caso de estudio de fine-tuning con QLoRA sobre arquitecturas con atención lineal (Gated DeltaNet), incluyendo las limitaciones de las herramientas de exportación actuales.
- **Asistente casual no crítico**: en entornos donde no se requiere precisión factual ni seguridad, el modelo puede acompañar conversaciones ligeras, como recomendaciones triviales o comentarios motivacionales, siempre que se controle su tendencia a la alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta generaciones de ejemplo sobre prompts fuera del conjunto de entrenamiento, sin métricas cuantitativas de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un adaptador LoRA sobre un modelo MoE de 80B, se requiere cargar el modelo base en cuantización 4-bit (bnb-4bit) para que quepa en una GPU de 80 GB. El adaptador en sí añade poco peso (~0.1 GB).
- **GPU recomendadas**: A100 80GB (como la usada en el entrenamiento) o GPU con 80 GB de VRAM para 4-bit. GPUs de consumo como RTX 4090 (24 GB) no son suficientes para cargar el modelo base en 4-bit sin offloading.
- **Opciones de despliegue**: el adaptador se usa con Unsloth y PEFT; para producción se necesitaría una fusión del modelo (que el autor no pudo completar) o una infraestructura que soporte cargar el adaptador sobre el modelo base (p. ej., vLLM con soporte de adaptadores LoRA, aunque no se ha verificado para esta arquitectura).
- **Latencia y throughput**: no disponibles. El modelo base tiene una arquitectura de atención lineal que reporta 10x throughput más allá de 32K contexto, pero no se han medido valores concretos para el adaptador.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| cgcristi0/qwenard3-80b-lora | 80B | ~3B | no disponible (entrenado a 2048) | Apache-2.0 | LoRA safetensors | Persona humorística |
| AdityaNarayan/Qwen3-Next-80B-A3B-Instruct-CPT-LoRA-HyperSwitch | 80B | ~3B | no disponible | Apache-2.0 | LoRA | Especializado en código Rust/Hyperswitch |
| Qwen/Qwen3-Next-80B-A3B-Instruct (base) | 80B | ~3B | >32K (no especificado) | Apache-2.0 | safetensors | Modelo base instruct |

Ambos adaptadores LoRA se basan en el mismo modelo base Qwen3-Next-80B-A3B-Instruct y comparten la misma licencia Apache-2.0. El modelo de AdityaNarayan está orientado a un dominio técnico concreto (Rust y Hyperswitch), mientras que qwenard3-80b-lora se centra en personalidad y conversación casual. No se dispone de datos de rendimiento comparativos entre ambos.

## Limitaciones y advertencias

- **Fiabilidad limitada en situaciones de crisis**: el autor documenta que los prompts de crisis y de rechazo de peticiones dañinas producen salidas degeneradas o corruptas de forma repetible (p. ej., caracteres aleatorios antes de la respuesta correcta). No se recomienda confiar en este checkpoint para soporte en crisis o rechazo de peticiones sin más entrenamiento.
- **Riesgo de alucinación**: el modelo está entrenado para una personalidad humorística, lo que aumenta el riesgo de que invente hechos o consejos erróneos en preguntas factuales.
- **No apto para uso profesional**: el autor indica explícitamente que no está ajustado para investigación factual, asesoramiento profesional ni aplicaciones sensibles a la seguridad.
- **Limitación de contexto**: el adaptador se entrenó con ventana de 2048 tokens, lo que limita el uso de contexto largo en conversaciones extensas.
- **Limitación de idioma**: solo se entrenó en inglés; las respuestas en otros idiomas pueden degradarse.
- **Restricciones de producción**: el adaptador no se distribuye como modelo fusionado ni como GGUF, lo que dificulta el despliegue en entornos de producción que requieren esos formatos. El proceso de fusión falló en las herramientas probadas.
- **Dataset no publicado**: el dataset de entrenamiento no está disponible en el repositorio, lo que dificulta la reproducibilidad y la auditoría del comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cgcristi0/qwenard3-80b-lora
- Modelo base Qwen3-Next-80B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
- Variante similar: https://huggingface.co/AdityaNarayan/Qwen3-Next-80B-A3B-Instruct-CPT-LoRA-HyperSwitch
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Ficha del modelo base en Open-Source AI Stack: https://www.open-source-ai.tech/models/qwen3-next-80b-a3b
- Config de entrenamiento LoRA de referencia para Qwen3-Next: https://github.com/oumi-ai/oumi/blob/main/configs/recipes/qwen3_next/sft/80b_a3b_lora/train.yaml
