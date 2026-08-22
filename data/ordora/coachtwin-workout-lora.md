# OrDora/coachtwin-workout-lora

## Resumen

CoachTwin Workout LoRA es un adaptador de tipo LoRA (Low-Rank Adaptation) desarrollado por OrDora sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su objetivo es enseñar a un modelo de lenguaje pequeño (0.5B parámetros) a generar planes de entrenamiento estructurados en formato JSON para la aplicación CoachTwin, un asistente de fitness que se ejecuta en un espacio de CPU gratuito de Hugging Face. El adaptador resuelve el problema de que el modelo base, sin ajuste, produce salidas que no respetan el esquema JSON requerido ni las reglas del dominio fitness, obligando a un sistema de reparación y reintentos. Al incorporar el adaptador, el modelo pequeño alcanza un 82,5% de validez en las respuestas generadas sin reintentos, frente al 25% del modelo base, y un 100% de JSON parseable.

La relevancia del modelo radica en su enfoque de eficiencia: demuestra que un adaptador LoRA específico de dominio puede convertir un modelo de 0.5B en un generador de contenido estructurado fiable para una tarea concreta, reduciendo costes de inferencia y permitiendo su despliegue en entornos con recursos limitados. El adaptador se entrenó con 9.873 pares prompt/completación del dataset OrDora/coachtwin-workouts, con una pérdida que excluye los tokens del prompt. No se especifica el tamaño de contexto del adaptador, pero hereda el del modelo base (Qwen2.5-0.5B-Instruct, que tiene 32K tokens de contexto).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-0.5B-Instruct (Transformer causal) |
| Parametros totales | no disponible (adaptador LoRA, r=16, alpha=32, dropout=0.05) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredado del modelo base, Qwen2.5-0.5B-Instruct, sin especificar) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors, formato original) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero el adaptador se entrenó con datos probablemente en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica a las proyecciones `q,k,v,o,gate,up,down` del modelo base Qwen2.5-0.5B-Instruct. La configuración LoRA es r=16, alpha=32 y dropout=0.05. El entrenamiento se realizó sobre 9.873 pares prompt/completos del dataset OrDora/coachtwin-workouts, con una programación de 2 épocas, tasa de aprendizaje de 2e-4 con decaimiento coseno y tamaño de batch efectivo de 16. Se aplicó máscara de pérdida excluyendo los tokens del prompt (valor `-100`), de modo que el modelo solo se evalúa en la generación del plan de entrenamiento.

La innovación técnica principal es el enfoque de especialización en una tarea concreta: el adaptador enseña al modelo el esquema JSON exacto (título sin dígitos, al menos dos ejercicios con `body_focus`, `rest_seconds` entre 15 y 120 segundos, consistencia de equipamiento, y warm-up y cool-down no vacíos) y las convenciones del dominio fitness. Esto permite que un modelo pequeño genere salidas estructuradas de forma fiable sin necesidad de capas de reparación y reintentos.

## Capacidades

- Generación de planes de entrenamiento estructurados en JSON que cumplen un contrato específico: título sin dígitos, 2 o más ejercicios que coinciden con el `body_focus` solicitado, `rest_seconds` en el rango 15-120 segundos, consistencia de equipamiento, y warm-up y cool-down no vacíos.
- Generación de respuestas en formato JSON válido de forma consistente (100% de parseabilidad en pruebas de un solo disparo).
- Comprensión de consultas de fitness en lenguaje natural (p. ej., "quiero un entrenamiento de fuerza para principiantes de piernas, 30 minutos, con mancuernas") y traducción a un plan estructurado.
- Capacidad de trabajar con contexto de prompt limitado (el modelo base tiene 0.5B parámetros, adecuado para tareas de generación corta).
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso fuera de la tarea específica.
- No se indica soporte de visión, audio u otras modalidades.

## Casos de uso

- **Aplicaciones de fitness en dispositivos con recursos limitados**: el adaptador se puede integrar en aplicaciones móviles o web que necesiten generar planes de entrenamiento personalizados en tiempo real, sin requerir GPU dedicadas. Por ejemplo, una app de entrenamiento que recibe las preferencias del usuario y devuelve un plan JSON formateado.
- **Asistentes de entrenamiento por voz**: el modelo puede procesar la entrada de voz convertida a texto y generar un plan estructurado que se muestra en la interfaz de usuario.
- **Generación de contenido para plataformas de fitness**: se puede usar para crear automáticamente rutinas de ejercicio para un catálogo, asegurando que cumplen con reglas de seguridad (descanso adecuado, calentamiento, etc.).
- **Prototipado rápido de aplicaciones con IA**: como el adaptador es pequeño y de bajo coste, se puede integrar en prototipos o MVPs para validar funcionalidades de generación de planes antes de escalar a modelos más grandes.
- **Sistemas de recomendación de entrenamientos**: combinado con un sistema de búsqueda semántica (como el que se usa en el Space CoachTwin), el adaptador puede generar el plan final a partir de los vecinos más cercanos recuperados.
- **Entrenamiento de modelos de refuerzo**: el adaptador puede servir como generador de datos sintéticos para entrenar modelos de evaluación de calidad de planes de entrenamiento.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación en 40 solicitudes de prueba en un solo disparo, sin reintentos ni capa de reparación:

| Metrica | Qwen2.5-0.5B-Instruct (base) | + CoachTwin LoRA |
|---|---|---|
| Tasa de entrenamientos válidos | 25.0% | 82.5% |
| Tasa de JSON parseable | 62.5% | 100.0% |
| Reparaciones por generación | 1.55 | 0.20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo está especializado en la tarea de generación de planes de entrenamiento.

## Requisitos de hardware

- El modelo base es Qwen2.5-0.5B-Instruct (0.5B parámetros), por lo que el adaptador LoRA añade una cantidad insignificante de parámetros adicionales. La inferencia se puede ejecutar en CPU sin GPU.
- VRAM estimada: con cuantización de 4 bits, el modelo base ocupa aproximadamente 0.5 GB; sin cuantización (fp32) alrededor de 2 GB. El adaptador LoRA añade menos de 10 MB. Por tanto, cabe en cualquier GPU consumer (GTX 1060, RTX 3060, etc.) y también en CPU.
- GPU recomendadas: no requiere GPU específica; cualquier CPU moderna o GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: se puede usar con `transformers` y `peft` (como se muestra en la documentación), también con `vLLM` (soporta adaptadores LoRA), `llama.cpp` (si se convierte el adaptador a GGUF), o `Ollama` (mediante importación de modelos PEFT).
- Latencia: en CPU, para un modelo de 0.5B, la generación de un plan JSON corto (aproximadamente 100-200 tokens) suele tardar menos de 1 segundo; en GPU, decenas de milisegundos. No se proporcionan datos exactos.

## Comparativa con modelos similares

No hay adaptadores específicos comparables en el ecosistema Hugging Face para la misma tarea de generación de planes de entrenamiento. Se puede comparar con el modelo base sin adaptador:

| Modelo | Parámetros | Contexto | Tasa de entrenamientos válidos | JSON parseable | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0.5B | 32K | 25.0% | 62.5% | Apache 2.0 |
| CoachTwin Workout LoRA | 0.5B + LoRA | no disponible | 82.5% | 100% | Apache 2.0 |

No se dispone de otros modelos comparables con el mismo propósito en la información proporcionada.

## Limitaciones y advertencias

- El modelo fue entrenado con datos sintéticos generados por modelos grandes y no ha sido revisado por expertos en fitness. Por lo tanto, los planes generados pueden no ser seguros o adecuados para todas las personas, y no deben considerarse consejo médico o de entrenamiento profesional.
- El modelo está especializado en la tarea de generación de planes de entrenamiento con un esquema JSON concreto. No se ha evaluado en otras tareas y no tiene capacidades generales de conversación, razonamiento o generación de código fuera de ese dominio.
- Puede presentar sesgos inherentes a los datos de entrenamiento (p. ej., preferencias de equipo o niveles de condición física no representativos).
- Riesgo de alucinación: aunque el modelo genera JSON válido, podría inventar ejercicios o detalles que no son realistas o seguros.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para uso en aplicaciones médicas o de salud. El autor advierte explícitamente que no es consejo fitness ni médico.
- No se dispone de información sobre la longitud máxima de contexto específica del adaptador, aunque hereda la del modelo base (32K tokens). La generación de planes largos podría verse limitada por el contexto del prompt.

## Enlaces

- [Modelo en Hugging Face: OrDora/coachtwin-workout-lora](https://huggingface.co/OrDora/coachtwin-workout-lora)
- [Space de CoachTwin (aplicación de fitness)](https://huggingface.co/spaces/OrDora/coachtwin)
- [Dataset de entrenamiento: OrDora/coachtwin-workouts](https://huggingface.co/datasets/OrDora/coachtwin-workouts)
- [Modelo base: Qwen/Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
