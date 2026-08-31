# Damirchik/vla-grounder-qwen3.5-9b-vl-think-pi0

## Resumen

El modelo `Damirchik/vla-grounder-qwen3.5-9b-vl-think-pi0` es un "VLA Grounder" desarrollado por el usuario Damirchik, un modelo de investigación para robótica basado en el modelo multimodal Qwen/Qwen3.5-9B. Su función es recibir una imagen de escena y una instrucción humana en lenguaje natural, y generar un comando conciso y visualmente fundamentado que una política VLA (Vision-Language-Action) congelada pueda ejecutar directamente. En este caso, la política congelada es pi0, que actúa como generador de recompensas durante el entrenamiento.

El problema que resuelve es la adaptación de modelos VLA preentrenados a nuevas instrucciones sin necesidad de reentrenarlos por completo, mediante un intermediario que traduce la intención humana a comandos de bajo nivel. Esto es relevante ahora porque los sistemas robóticos basados en VLA suelen ser costosos de entrenar y requieren datos específicos; un grounder permite reutilizar políticas existentes de forma más flexible. El modelo está pensado exclusivamente para investigación y reproducibilidad de experimentos.

Arquitectónicamente, es un modelo denso de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), que hereda la arquitectura del Qwen3.5-9B: un transformer multimodal con atención híbrida de redes delta con puerta (gated delta networks) y un codificador de visión. La longitud de contexto no se especifica en la model card, aunque el modelo base Qwen3.5-9B soporta 262.000 tokens según la documentación de vLLM. El tamaño total del repositorio es de 18,8 GB, lo que sugiere pesos en bfloat16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (dense, transformer multimodal con atención híbrida de redes delta con puerta y codificador de visión) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3.5-9B soporta 262.000 tokens según vLLM |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3.5-9B, un modelo multimodal denso que combina un codificador de visión con un transformer de lenguaje. La arquitectura base incorpora atención híbrida de redes delta con puerta, que reduce el coste computacional del mecanismo de atención estándar, y soporta un contexto largo de 262.000 tokens. El fine-tune se realizó mediante GRPO (Group Relative Policy Optimization) con un adaptador LoRA de rango 32, sobre el benchmark VL-Think. Durante el entrenamiento, se utilizaron recompensas de rollout dispersas generadas por una política VLA congelada (pi0), que evalúa la calidad de los comandos producidos por el modelo. El checkpoint final es una fusión completa del adaptador LoRA con los pesos base.

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni la presencia de técnicas como RLHF o DPO. La model card solo indica el método de entrenamiento y el benchmark utilizado.

## Capacidades

- Generación de comandos visualmente fundamentados: a partir de una imagen de escena y una instrucción humana, produce una orden textual concisa que puede ser ejecutada por una política VLA congelada.
- Procesamiento conjunto de imagen y texto: al estar basado en Qwen3.5-9B, hereda la capacidad de razonamiento multimodal, aunque el fine-tune lo especializa en la tarea de grounding.
- Interacción conversacional: la etiqueta "conversational" sugiere que puede mantener diálogos, aunque no se detalla en la model card.
- Compatibilidad con transformers: se carga mediante `AutoModelForImageTextToText` y `AutoProcessor`, lo que facilita su integración en pipelines existentes.
- No se menciona soporte explícito para tool calling, agentes ni funciones adicionales.

## Casos de uso

- Control robótico condicionado por lenguaje: el modelo traduce instrucciones humanas como "coge la taza roja" en comandos de bajo nivel que una política VLA puede ejecutar, sin necesidad de reentrenar el controlador.
- Adaptación de VLA congelados: permite actualizar o especializar un VLA existente (como pi0) a nuevas tareas simplemente cambiando el grounder, reduciendo costes de entrenamiento.
- Investigación en grounding visual: sirve como herramienta para estudiar cómo los modelos de lenguaje generan referencias espaciales y semánticas a partir de imágenes.
- Generación de instrucciones para robots manipuladores: en entornos de laboratorio, puede producir comandos como "empuja el bloque hacia la izquierda" o "levanta el objeto azul".
- Navegación autónoma: combinado con un VLA de navegación, puede convertir indicaciones como "ve a la cocina" en comandos de movimiento concretos.
- Interacción humano-robot en entornos simulados: adecuado para experimentos en simuladores robóticos donde se requiere un puente entre lenguaje natural y acciones de bajo nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación sobre conjuntos de datos estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio es de 18,8 GB, lo que corresponde aproximadamente a pesos en bfloat16 para 9,4 mil millones de parámetros.
- Para inferencia en bfloat16 se necesitaría una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40GB o superior), considerando además el overhead de memoria para activaciones y el procesador de imágenes.
- No se especifican cuantizaciones disponibles, pero al ser un modelo de transformers, es plausible que se puedan aplicar cuantizaciones de 8 o 4 bits mediante herramientas como bitsandbytes, reduciendo los requisitos a aproximadamente 9,4 GB y 4,7 GB respectivamente. Esto no está confirmado por el autor.
- Opciones de despliegue: dado que es compatible con transformers, se puede servir con vLLM, TGI u Ollama (si se convierte a GGUF). La etiqueta "endpoints_compatible" sugiere que puede ser desplegado en infraestructura de inferencia estándar.
- La latencia y el throughput no se han publicado.

## Comparativa con modelos similares

No se dispone de información sobre otros VLA grounders comparables en la documentación proporcionada. La única comparación posible es con el modelo base Qwen3.5-9B, del cual deriva:

| Modelo | Parametros | Contexto | Tarea principal | Licencia |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9,4B | 262K | Modelo multimodal general | Apache 2.0 (según Qwen) |
| vla-grounder-qwen3.5-9b-vl-think-pi0 | 9,4B | No especificado | Grounding visual para VLA | No disponible |

No se han identificado otros modelos de la misma categoría (grounder para VLA congelados) con datos públicos en la información disponible.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones idiomáticas. Al ser un modelo de investigación, no se garantiza su comportamiento en producción.
- Depende críticamente de la política VLA congelada (pi0) para generar recompensas durante el entrenamiento; su rendimiento fuera de ese contexto no está validado.
- La licencia no está especificada, lo que impide conocer las restricciones para uso comercial o distribución.
- No se han proporcionado datos de evaluación sobre tareas robóticas reales ni benchmarks estandarizados.
- El modelo está diseñado para la tarea específica de grounding; su uso en otras tareas multimodales podría degradar el rendimiento respecto al modelo base.
- La fecha de creación (2026-08-31) es posterior a la fecha actual, lo que sugiere que puede ser un modelo experimental o con datos de publicación inusuales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Damirchik/vla-grounder-qwen3.5-9b-vl-think-pi0)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Documentación de Qwen3.5 en vLLM](https://recipes.vllm.ai/Qwen/Qwen3.5-9B)
- [Blog de Qwen3.5: Towards Native Multimodal Agents](https://qwen.ai/blog?id=qwen3.5)
- [Página de Qwen3.5 en Ollama](https://ollama.com/library/qwen3.5:9b)
