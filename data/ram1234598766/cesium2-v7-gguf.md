# ram1234598766/Cesium2-v7-GGUF

## Resumen

Cesium2 v7 (también denominado MORPH-AI v7) es un modelo de lenguaje de 1.500 millones de parámetros, desarrollado por el usuario ram1234598766. Se trata de un fine-tuning del modelo Qwen2.5-1.5B-Instruct de Alibaba, con un refresco de conocimiento mundial hasta agosto de 2026 y un sistema de habilidades modulares que cubren código, creatividad, datos, matemáticas, razonamiento y traducción. El modelo se distribuye exclusivamente en formato GGUF cuantizado a Q8_0, lo que lo hace apto para ejecución local en hardware modesto.

La relevancia del modelo reside en su carácter de proyecto comunitario: ha sido entrenado y publicado íntegramente con GPUs gratuitas de Kaggle, y se integra con ecosistemas como Ollama, llama.cpp, LM Studio y Jan. Su arquitectura es la de un transformer decoder basado en qwen2, con una ventana de contexto de 32k tokens durante el entrenamiento, aunque en ejecución se recomienda usar 8192 tokens. Es un modelo ligero pensado para uso local, sin necesidad de infraestructura de servidor dedicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (qwen2) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32k entrenado, 8192 en ejecucion |
| Tipos de cuantizacion | Q8_0 (1,65 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder con atención causal estándar y normalización RMSNorm, perteneciente a la familia Qwen2.5. El fine-tuning se ha realizado sobre esta base, incorporando un conocimiento mundial refrescado hasta agosto de 2026 y un sistema de habilidades modulares (código, creatividad, datos, matemáticas, razonamiento y traducción). El entrenamiento se llevó a cabo exclusivamente en GPUs gratuitas de Kaggle, lo que implica un presupuesto de cómputo limitado y un pipeline de entrenamiento sencillo. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La model card menciona que el conocimiento de corte está integrado en el system prompt, y el modelo declina responder sobre eventos posteriores a agosto de 2026 salvo que se le proporcione un bloque de contexto en vivo.

## Capacidades

- Generación de texto en inglés: respuestas conversacionales y de instrucción.
- Razonamiento y matemáticas: entrenado específicamente para tareas de razonamiento lógico y cálculo.
- Generación de código: soporte para tareas de programación y scripts.
- Análisis de datos: capacidad para interpretar y razonar sobre datos estructurados.
- Traducción: entrenado para tareas de traducción, aunque solo entre inglés y otros idiomas de forma implícita.
- Soporte para herramientas: no se documenta explícitamente tool calling, pero al estar basado en Qwen2.5-Instruct puede heredar algunas capacidades de llamada a funciones si el prompt se adapta.
- Sistema de habilidades modulares: el modelo puede activar diferentes habilidades según el prompt, pero no es un sistema dinámico sino un entrenamiento segmentado.
- Modo de conocimiento con corte temporal: se niega a adivinar sobre eventos posteriores a agosto de 2026, salvo que se le inyecte contexto en vivo.

## Casos de uso

- Asistente de código en local: el modelo puede servir como autocompletado o generador de código en editores como VS Code (existe una extensión oficial). Su tamaño reducido permite ejecutarlo en portátiles sin GPU.
- Traducción de textos cortos: para traducciones de inglés a otros idiomas o viceversa, aunque su entrenamiento está enfocado al inglés.
- Generación de contenido creativo: cuentos, poemas o guiones básicos, aprovechando el módulo de creatividad.
- Tutor de matemáticas: puede resolver problemas de matemáticas y explicar razonamientos, útil para estudiantes o desarrolladores que necesitan cálculos rápidos.
- Análisis de datos ligero: puede generar resúmenes de datos estructurados o explicar conceptos estadísticos, adecuado para entornos con recursos limitados.
- Prototipado de agentes conversacionales: para desarrolladores que quieren probar un chatbot en local antes de escalar a modelos mayores.
- Automatización de tareas de texto: como clasificación simple de texto, extracción de entidades o resumen de documentos cortos, gracias a su tamaño reducido y baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. La única referencia de rendimiento es la cuantización Q8_0 que preserva la calidad del modelo base Qwen2.5-1.5B-Instruct, pero sin datos numéricos de evaluación.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 pesa 1,65 GB, por lo que se requiere al menos 2 GB de VRAM para cargar el modelo completo en GPU. En CPU, necesita alrededor de 2 GB de RAM.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede ejecutarlo con comodidad. Incluso GPUs integradas como la Intel UHD Graphics podrían funcionar con cuantizaciones menores.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU doméstica moderna, incluidas laptops con GPUs de gama baja.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, y el motor GGUF de Hugging Face. También puede integrarse en VS Code mediante la extensión oficial.
- Latencia y throughput: no se dispone de datos oficiales, pero en una GPU como RTX 3060 se espera una generación de 20-40 tokens por segundo, y en CPU de gama media de 5-10 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cesium2 v7 (GGUF) | 1,5B | 32k (8k ejec) | Q8_0 | Apache 2.0 | Hugging Face, Ollama |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | No cuantizado | Apache 2.0 | Hugging Face |
| Phi-3-mini (4k) | 3,8B | 4k | GGUF | MIT | Hugging Face |
| Llama-3.2-1B-Instruct | 1B | 8k | GGUF | Meta Llama | Hugging Face |

La comparativa muestra que Cesium2 v7 es un fine-tuning de Qwen2.5-1.5B, por lo que su rendimiento será similar al de su base, con la ventaja de un conocimiento más actualizado (2026) y una cuantización lista para usar. Frente a Phi-3-mini, ofrece un contexto mayor (8k vs 4k) y menor tamaño. Frente a Llama-3.2-1B, ofrece mayor contexto y una licencia Apache 2.0 más permisiva.

## Limitaciones y advertencias

- Sesgos de la base: al ser un fine-tuning de Qwen2.5, hereda los sesgos presentes en el modelo base, que pueden incluir sesgos culturales, de género o geográficos.
- Riesgo de alucinación: con 1,5B de parámetros, el modelo puede generar información falsa o inventada, especialmente en dominios técnicos o factuales.
- Limitación de idioma: solo está entrenado en inglés, lo que limita su uso en español u otros idiomas.
- Contexto reducido en ejecución: aunque se entrenó con 32k, la recomendación de ejecutarlo a 8k tokens reduce su capacidad de manejar documentos largos o conversaciones extensas.
- Calidad de entrenamiento: el entrenamiento en GPUs gratuitas de Kaggle implica recursos limitados, lo que puede afectar la calidad del fine-tuning en comparación con modelos entrenados con presupuestos mayores.
- Corte temporal: el modelo se niega a responder sobre eventos posteriores a agosto de 2026, lo que puede ser una limitación para casos de uso que requieran información más reciente.
- Sin soporte de visión: aunque existe un modelo hermano de visión, esta versión GGUF es exclusivamente de texto.

## Enlaces

- Hugging Face: https://huggingface.co/ram1234598766/Cesium2-v7-GGUF
- Repositorio GitHub (fuente y pipeline): https://github.com/ram1234598766-dotcom/cesium2
- Modelo de visión hermano: https://huggingface.co/ram1234598766/Cesium2-vision-GGUF
- Extensión de VS Code: https://open-vsx.org/extension/ram1234598766/cesium2-ai
- Página de Ollama: https://ollama.com/ram1234598766/cesium2-v7
