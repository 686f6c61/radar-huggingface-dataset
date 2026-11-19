# OVHaiLLM/Olala-v1.0-mini-7A1B-MLX

## Resumen

Olala-v1.0-mini-7A1B-MLX es la versión cuantizada en formato MLX del modelo Olala-v1.0-mini-7A1B, desarrollado por OVHaiLLM (OVHcloud). Se trata de un modelo híbrido que combina capas Mamba-3 con mecanismos de atención y una arquitectura de mezcla de expertos (MoE), diseñado específicamente para inferencia local en Macs con Apple Silicon. El modelo base está orientado a razonamiento, conversación y tool calling, con soporte declarado para 37 idiomas.

La relevancia de esta variante radica en su optimización para hardware de consumo: según la model card, la cuantización mixta 5/6 bits ocupa 5,4 GB y genera aproximadamente 86 tokens por segundo en un MacBook Air M5 con 16 GB de memoria unificada. Esto lo posiciona como una opción para ejecutar un modelo MoE híbrido de razonamiento en portátiles, algo poco habitual en esta categoría de tamaño.

El repositorio incluye cuatro carpetas de cuantización (bf16, q8, q5e6 y q4e8), cada una como modelo MLX completo con pesos, configuración, tokenizador y plantilla de chat. Es importante señalar que requiere un fork propio del motor mlx-engine: ni mlx-lm estándar ni LM Studio soportan todavía la arquitectura `olala`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-3 + atención + mezcla de expertos (MoE) |
| Parametros totales | 7A1B (nomenclatura del autor; desglose exacto no disponible) |
| Parametros activos | 1B (según nomenclatura "7A1B"; confirmación no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, 8-bit (grupo 64), mixta 5/6-bit (expertos 5-bit, resto 6-bit, grupo 64), mixta 4/8-bit (expertos 4-bit grupo 32, resto 8-bit grupo 64) |
| Idiomas soportados | 37 idiomas: en, zh, fr, de, it, ja, ru, es, pl, pt, nl, el, tr, cs, uk, hu, ro, ko, ar, fi, sv, no, da, bg, sk, hr, lt, sl, bs, he, et, ca, lv, ka, sr, sq, is |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors), carpetas bf16/, q8/, q5e6/, q4e8/ |

## Arquitectura y entrenamiento

La arquitectura es híbrida: combina capas Mamba-3 (modelo de espacio de estados) con capas de atención y una mezcla de expertos. La model card menciona kernels Metal personalizados para las capas Mamba-3, de atención y de MoE, lo que sugiere que el rendimiento en Apple Silicon depende de implementaciones específicas más que de operadores genéricos. La nomenclatura "7A1B" indica 7 mil millones de parámetros totales con 1 mil millones activos por token, típico de un diseño MoE disperso.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones como decodificación especulativa. El modelo declara capacidades de razonamiento con cuatro niveles de esfuerzo ("four effort levels"), lo que apunta a un modo de pensamiento configurable, aunque no se especifica el mecanismo técnico subyacente.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con cuatro niveles de esfuerzo configurables (según la model card).
- Tool calling / function calling, expuesto mediante un servidor compatible con la API de OpenAI.
- Capacidades multilingües declaradas para 37 idiomas.
- Ejecución local en Apple Silicon mediante MLX con kernels Metal optimizados.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede gestionar diálogos multi-turno directamente en un MacBook Air de 16 GB usando la cuantización q5e6 (5,4 GB), sin necesidad de conexión a la nube.
- Agentes con tool calling en escritorio: gracias al servidor compatible con OpenAI, se puede integrar en flujos de agentes que invocan funciones locales (sistema de archivos, APIs internas) desde una aplicación de escritorio en macOS.
- Prototipado de pipelines de razonamiento: los cuatro niveles de esfuerzo permiten ajustar el coste computacional según la tarea, útil para experimentar con presupuestos de razonamiento variables en investigación.
- Aplicaciones multilingües europeas: la cobertura de 37 idiomas, incluidos catalán, gallego no declarado, euskera no declarado, checo, polaco o griego, facilita prototipos de atención al cliente en mercados regionales sin depender de servicios externos.
- Desarrollo con privacidad de datos: al ejecutarse en local, es adecuado para procesar documentos sensibles que no pueden salir del dispositivo, como borradores legales o notas clínicas en fase de prueba.
- Evaluación comparativa de arquitecturas híbridas: investigadores pueden medir el comportamiento de un MoE Mamba-3 frente a transformers densos del mismo rango de tamaño en tareas de razonamiento y código.
- Integración en herramientas de desarrollo para macOS: generación de código y explicaciones dentro de IDEs o scripts locales, aprovechando los ~86 tokens/s reportados en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento proporcionado es de inferencia: aproximadamente 86 tokens/s en un MacBook Air M5 con 16 GB usando la cuantización mixta 5/6 bits (5,4 GB). La model card afirma que es más rápido que llama.cpp en Mac gracias a los kernels Metal personalizados, pero no se aportan cifras comparativas detalladas.

## Requisitos de hardware

- VRAM/memoria unificada estimada según cuantización: bf16 13,6 GB; q8 7,2 GB; q5e6 4,9 GB; q4e8 tamaño no disponible en la información proporcionada (el dato aparece truncado en la model card).
- Hardware objetivo: Macs con Apple Silicon. La model card cita explícitamente un MacBook Air M5 con 16 GB.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por esta variante MLX; para esas plataformas habría que usar el modelo base en otro formato.
- Despliegue: requiere el fork propio de mlx-engine del autor. mlx-lm estándar y LM Studio no cargan la arquitectura `olala`. Se ofrece un servidor compatible con OpenAI.
- Throughput reportado: ~86 tokens/s en MacBook Air M5 con q5e6. Latencia no disponible.
- No cabe en GPUs de consumo NVIDIA mediante esta variante; en Apple Silicon, la cuantización q5e6 cabe en equipos de 16 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Olala-v1.0-mini-7A1B-MLX | 7A1B (MoE híbrido Mamba-3) | no disponible | Apache 2.0 | MLX, requiere fork de mlx-engine | Optimizado para Apple Silicon |
| Modelos MoE densos de ~7B en MLX (p. ej. variantes tipo Mistral/Qwen) | ~7B | variable según modelo | variable | MLX estándar, LM Studio | Ecosistema de herramientas más maduro; datos concretos no disponibles en esta ficha |
| Modelos densos de ~7-8B en GGUF | ~7-8B | variable según modelo | variable | llama.cpp, Ollama | Mayor compatibilidad; la model card afirma que Olala es más rápido en Mac, sin cifras detalladas |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas concretas.

## Limitaciones y advertencias

- Compatibilidad restringida: los pesos no cargan en mlx-lm estándar ni en LM Studio; es obligatorio usar el fork de mlx-engine del autor, lo que añade dependencia de mantenimiento externo.
- Solo Apple Silicon: esta variante MLX no está pensada para GPU NVIDIA ni otros aceleradores.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que impide planificar aplicaciones con documentos largos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K u otras pruebas; la evaluación queda en manos del usuario.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan medidas específicas de mitigación.
- Sesgos: no se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Idiomas: aunque se declaran 37 idiomas, no hay datos sobre calidad relativa por idioma; conviene validar el rendimiento en castellano y lenguas cooficiales antes de producción.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo derivado cuantizado conviene verificar las condiciones del modelo base y del fork de mlx-engine.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria.
- Modelo reciente (creado en noviembre de 2026 según los metadatos): ecosistema y documentación potencialmente inmaduros.

## Enlaces

- Hugging Face (variante MLX): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-MLX
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Informe técnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- Catálogo AI Endpoints de OVHcloud: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/olala-1.0-mini/
- Playground: https://olala.ovh.com
