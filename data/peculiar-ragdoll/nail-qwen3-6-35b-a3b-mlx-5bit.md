# peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-MLX-5bit

## Resumen

Nail-Qwen3.6-35B-A3B-MLX-5bit es una cuantización en 5 bits del modelo Qwen/Qwen3.6-35B-A3B, un modelo de arquitectura MoE (Mixture of Experts) con 35 mil millones de parámetros totales y 3 mil millones activos por token, desarrollado por la comunidad Qwen y adaptado por el usuario peculiar-ragdoll para su ejecución en Apple Silicon mediante la librería MLX. El modelo base es multimodal (image-text-to-text) y soporta un contexto nativo de 262.144 tokens.

La adaptación incluye una receta de cuantización per-tensor basada en el enfoque UD-Q5_K_XL de Unsloth, preservando la cabeza MTP (multi-token prediction) y las capacidades de visión, junto con un chat template modificado que fuerza un estilo de respuesta conciso y directo, reduciendo el "sobrepensamiento" y los rodeos en las respuestas. El resultado es un modelo que, según el autor, iguala la precisión de modelos densos de 27B en razonamiento y codificación agéntica, pero con un tiempo de respuesta significativamente menor y un consumo de memoria más eficiente.

La relevancia actual de este modelo radica en su capacidad para ejecutar un MoE de 35B en hardware con 32 GB de RAM unificada (por ejemplo, Mac Studio) manteniendo el contexto completo de 262k tokens, lo que lo convierte en una opción atractiva para tareas de agente, razonamiento largo y procesamiento de documentos extensos en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en transformer, con visión (image-text-to-text) |
| Parametros totales | 35B (MoE). El archivo safetensors muestra 8.457.832.304, valor inconsistente con el modelo base; se considera un error de metadatos |
| Parametros activos | 3B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 5-bit (MLX, per-tensor); también existe versión 4-bit y GGUF |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors); también disponible en GGUF |

## Arquitectura y entrenamiento

El modelo base, Qwen3.6-35B-A3B, es un transformer con arquitectura MoE que activa 3 mil millones de parámetros por token, lo que reduce el coste computacional frente a un modelo denso de tamaño equivalente. Incluye una cabeza de predicción multi-token (MTP) y un codificador visual para entrada de imágenes. La adaptación de peculiar-ragdoll consiste en una cuantización a 5 bits aplicada por tensor, siguiendo la receta UD-Q5_K_XL de Unsloth, que preserva tanto la cabeza MTP como los componentes de visión. No se ha realizado ningún entrenamiento adicional; el modelo mantiene los pesos originales cuantizados.

La innovación principal de esta versión es el chat template modificado, que inserta automáticamente un prompt de concisión al final de cualquier system prompt proporcionado por el usuario. Este prompt instruye al modelo a responder directamente, sin preámbulos, sin repetir la pregunta y manteniendo solo los detalles esenciales. Este cambio afecta al comportamiento en todas las llamadas y es la base de las mejoras de tiempo de respuesta y calidad conversacional que reporta el autor.

## Capacidades

- Generación de texto y razonamiento multi-paso, incluyendo matemáticas y lógica.
- Generación de código y soporte de tool calling / function calling (heredado del modelo base Qwen3.6).
- Capacidades agénticas: el autor lo ha probado en tareas de software engineering autónomo con el agente Pi, mostrando capacidad para resolver problemas de repositorios reales.
- Multilingüe en inglés y chino.
- Entrada multimodal (imagen + texto) gracias al codificador visual preservado.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos y conversaciones de muchos turnos.
- Estilo de respuesta conciso y directo gracias al chat template modificado, reduciendo el "sobrepensamiento" y los rodeos.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262k tokens) manteniendo coherencia y respondiendo de forma directa, lo que reduce la frustración del usuario y el coste por token.
- Generación de código en producción: con soporte de tool calling y capacidad de razonamiento, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, con tiempos de respuesta menores que modelos densos comparables.
- Agentes autónomos de software engineering: su eficiencia en tiempo de respuesta permite ejecutar múltiples iteraciones de prueba y error en tareas de resolución de issues, como se muestra en los benchmarks del autor con el agente Pi.
- Análisis de documentos extensos: el contexto de 262k tokens permite procesar manuales técnicos, contratos o investigaciones completas en una sola pasada, con respuestas concisas y basadas en evidencia.
- Asistente de investigación en matemáticas y ciencias: su razonamiento multi-paso y su capacidad para manejar símbolos y ecuaciones lo hacen útil para resolver problemas complejos, aunque con un consumo de contexto mayor que modelos densos (según el autor, 5.777 tokens por pregunta en GPQA-Diamond).
- Despliegue en hardware Apple Silicon: gracias a la cuantización MLX y al bajo uso de memoria por token en contexto, puede ejecutarse en Mac con 32 GB de RAM unificada, lo que lo hace accesible para desarrolladores individuales o equipos pequeños sin GPUs dedicadas.

## Benchmarks y rendimiento

La model card del autor incluye gráficas comparativas para MMLU-Pro, Claw-Eval multi_turn y tareas de software engineering, pero no se proporcionan valores numéricos en el texto. Según las afirmaciones cualitativas:

- Iguala o supera a Qwen3.6-27b y su fine-tune ThinkingCap en precisión de razonamiento y capacidad agéntica, con tiempos de respuesta entre 2 y 5 veces menores.
- En conversaciones multi-turno (hasta 6 turnos), obtiene mejor puntuación que los modelos densos de 27B incluso cuando estos usan cuantizaciones superiores.
- En tareas de software engineering con el agente Pi, resuelve problemas más rápido que Opus4.8 (medium) en un repositorio real, con 3-0 en intentos a la primera.

No se han publicado resultados numéricos detallados en la información disponible; las gráficas están incrustadas como imágenes en la model card.

## Requisitos de hardware

- VRAM estimada: el autor indica que el modelo con contexto completo de 262k tokens y KV cache de 8 bits cabe en 32 GB de RAM unificada en Mac. Con KV cache sin cuantizar, también cabe en 32 GB, aunque con menos margen.
- GPU recomendadas: Apple Silicon (M2 Ultra, M3 Max, etc.) para MLX. Para otras GPUs, se recomienda usar la versión GGUF con llama.cpp o similar.
- Tamaño del repositorio: 29,1 GB (pesos en 5-bit MLX).
- Opciones de despliegue: MLX (oMLX), llama.cpp (para GGUF), posiblemente vLLM con soporte MLX si está disponible.
- Latencia y throughput: no se proporcionan datos numéricos, pero el autor reporta tiempos de respuesta significativamente menores que modelos densos de 27B en las mismas tareas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Nail-Qwen3.6-35B-A3B-MLX-5bit | 35B totales, 3B activos | 262k | 5-bit MLX | Apache 2.0 | Optimizado para Mac, respuestas concisas |
| Qwen3.6-27B (dense) | 27B | 262k | Variable | Apache 2.0 | Modelo denso, más lento pero más eficiente en contexto por pregunta |
| Dagger-Qwen3.6-27B-MLX | 27B | 262k | MLX | Apache 2.0 | Denso, mejor resistencia en sesiones largas (más preguntas por contexto) |

Según el autor, Nail gana en velocidad y en calidad conversacional frente a los modelos densos de 27B, pero pierde en "endurance" (número de preguntas encadenables dentro del contexto) porque su razonamiento es más verboso (5.777 tokens por pregunta en GPQA-Diamond frente a 2.380 de Dagger). Para sesiones agénticas largas y coherentes, se recomienda Dagger.

## Limitaciones y advertencias

- Modelo cuantizado en 5 bits: puede presentar ligeras pérdidas de precisión frente al modelo original en tareas de alta sensibilidad numérica.
- Idiomas limitados a inglés y chino; no hay soporte oficial para otros idiomas.
- El chat template modificado fuerza un estilo de respuesta conciso que puede no ser adecuado para todos los casos de uso (por ejemplo, cuando se requiere explicaciones extensas o matizadas).
- El autor advierte que el razonamiento del modelo es "verboso" en términos de tokens consumidos por pregunta, lo que reduce el número de preguntas que caben en el contexto antes de alcanzar el límite de 262k.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no especificadas; se recomienda revisar la licencia de Qwen3.6-35B-A3B.
- No se ha verificado el comportamiento en producción con cargas de trabajo reales más allá de los benchmarks del autor; se recomienda validar en el entorno objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-MLX-5bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Versión GGUF: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Chat templates modificados: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo denso hermano (Dagger): https://huggingface.co/peculiar-ragdoll/Dagger-Qwen3.6-27B-MLX
- Receta de cuantización de Unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
