# reaperdoesntknow/Qemma-GEI

## Resumen

Qemma-GEI es un modelo de lenguaje híbrido de aproximadamente 1B de parámetros desarrollado por Convergent Intelligence LLC (usuario de HuggingFace `reaperdoesntknow`). Su principal innovación consiste en fusionar a nivel de pesos dos arquitecturas distintas: el cuerpo (MLP) y la estructura general de Gemma-3 (1B) con la atención y la cabeza de Qwen-3 (0.6B). El resultado es un modelo denso, sin adaptadores, que combina las fortalezas de ambos modelos base y que ha sido ajustado mediante SFT para instrucción y razonamiento paso a paso.

La relevancia de Qemma-GEI radica en que explora una vía poco convencional de creación de modelos: la fusión directa de pesos entre arquitecturas diferentes, en lugar del entrenamiento desde cero o la mezcla de expertos. Además, incorpora un escalado de posición (RoPE scaling) basado en Yarn y se enmarca dentro de la metodología propietaria Discrepancy Calculus (DISC), que trata las singularidades del entrenamiento como señales estructurales. El modelo está pensado para investigación, experimentación y como base para posteriores ajustes finos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone Gemma-3 (26 capas, hidden 1152, MLP 6912) con atención estilo Qwen reagrupada a 4×256 cabezas |
| Parametros totales | 999.891.712 (~1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (aplica RoPE scaling con ratio 1:1 sobre max_position_embeddings) |
| Tipos de cuantizacion | no disponible (repo con safetensors, presumiblemente BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | osl-3.0 (Open Software License 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qemma-GEI es un modelo denso que fusiona los pesos de Gemma-3 (1B) y Qwen-3 (0.6B) a nivel de capa, sin usar adaptadores tipo LoRA. La arquitectura resultante toma el cuerpo MLP y la estructura general de Gemma-3, pero sustituye la atención por la implementación de Qwen, reagrupando las cabezas de atención para ajustarse al tamaño oculto de Gemma (hidden 1152). El tokenizer y la plantilla de chat son los de Gemma-3. Esta variante concreta, denominada GEI (Gap Envelope Integral), añade además un escalado de posición basado en Yarn con ratio 1:1 sobre el `max_position_embeddings` original, lo que permite extender la ventana de contexto efectiva.

El entrenamiento se realizó en dos fases. Primero, un warm-start de aproximadamente 512 pasos sobre el dataset HuggingFaceH4/ultrachat_200k, seguido de un pequeño ajuste post-fusión de 8 pasos para realinear los embeddings. Después, se aplicaron 256 pasos de SFT combinando los datasets TIGER-Lab/MathInstruct y HuggingFaceH4/ultrachat_200k, con el objetivo de mejorar el seguimiento de instrucciones y el razonamiento paso a paso. El framework de entrenamiento fue TRL 0.25.0 sobre Transformers 4.57.1 y PyTorch 2.8.0.

## Capacidades

- Generación de texto en inglés con formato conversacional (chat template de Gemma-3).
- Razonamiento paso a paso mediante tokens de pensamiento explícitos, como se muestra en el ejemplo de generación con `<reasoning_step>`.
- Seguimiento de instrucciones y asistencia en tareas de ayuda general.
- Capacidad de ser utilizado como base para fine-tuning adicional (SFT, RLHF).
- Soporte de generación de texto mediante la librería Transformers, con integración en pipelines de text-generation-inference y endpoints compatibles.
- No se documenta soporte explícito de tool calling, function calling ni capacidades multimodales (visión, audio).

## Casos de uso

- Investigación académica en fusión de modelos: Qemma-GEI sirve como caso de estudio para analizar cómo se comporta la combinación de arquitecturas diferentes a nivel de pesos, y para validar las hipótesis del marco DISC sobre discontinuidades y transferencia de conocimiento.
- Prototipado de asistentes conversacionales: al ser un modelo pequeño (~1B), puede integrarse en aplicaciones de chat de baja latencia para entornos de demostración o desarrollo rápido.
- Asistente de código en entornos de desarrollo: aunque no está específicamente entrenado para código, su capacidad de seguir instrucciones y razonar paso a paso puede aprovecharse para generar fragmentos simples o explicar algoritmos.
- Análisis de texto y resumen: puede procesar documentos cortos en inglés y producir resúmenes o extraer información relevante, gracias a su ajuste con datos de instrucción.
- Base para fine-tuning en dominios específicos: su tamaño reducido y su licencia permiten usarlo como punto de partida para entrenar modelos especializados en áreas como atención al cliente, documentación técnica o educación.
- Experimentación con razonamiento estructurado: su token de pensamiento (`<reasoning_step>`) lo hace útil para probar técnicas de generación de cadenas de razonamiento en tareas de lógica y matemáticas básicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de datos oficiales de rendimiento ni de requisitos de hardware específicos proporcionados por el autor. No obstante, al tratarse de un modelo de aproximadamente 1B de parámetros, se puede estimar que:

- En precisión BF16, el modelo ocupa alrededor de 2 GB de VRAM solo para los pesos, más el overhead de la atención y las activaciones durante la generación.
- Es probable que quepa en GPUs consumer con al menos 6 GB de VRAM, como una RTX 3060, RTX 4060 o similar.
- Para inferencia, se puede usar con Transformers directamente, o mediante herramientas compatibles como vLLM, llama.cpp u Ollama, aunque no se ha verificado la compatibilidad oficial con estas últimas.
- La latencia y el throughput dependerán del hardware y de la longitud de la secuencia; al ser un modelo pequeño, se espera una generación relativamente rápida en hardware moderno.

Estas cifras son estimaciones orientativas basadas en el tamaño del modelo y no constituyen una garantía del autor.

## Comparativa con modelos similares

Al ser un modelo híbrido sin benchmarks publicados, la comparativa directa no es posible. Sin embargo, se puede contextualizar frente a sus dos modelos base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qemma-GEI | ~1B | no disponible (RoPE scaling) | OSL-3.0 | HuggingFace |
| Gemma-3 1B | 1B | 32K (según documentación oficial de Gemma) | Gemma Terms of Use | HuggingFace |
| Qwen-3 0.6B | 0.6B | 32K (según documentación oficial de Qwen) | Apache 2.0 | HuggingFace |

Qemma-GEI hereda características de ambos modelos base, pero su comportamiento específico no ha sido evaluado públicamente. Su licencia OSL-3.0 difiere de las de sus predecesores, lo que puede afectar a su uso comercial.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo puede alucinar y que no debe utilizarse para decisiones críticas de seguridad, médicas, legales o financieras.
- El modelo solo está entrenado en inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia OSL-3.0 es una licencia de software de código abierto, pero no es una licencia específica para modelos de IA. Es necesario revisar sus términos para determinar si permite el uso comercial y la redistribución de derivados.
- No se han publicado resultados de benchmarks ni evaluaciones de sesgos, por lo que se desconoce su comportamiento en tareas de razonamiento complejo o en escenarios sensibles.
- El modelo es un experimento de fusión de arquitecturas; su estabilidad y consistencia en producción no están garantizadas.
- No se proporciona información sobre la longitud de contexto efectiva tras el escalado de posición, lo que puede dar lugar a comportamientos inesperados en secuencias largas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/reaperdoesntknow/Qemma-GEI)
- [Portafolio de Convergent Intelligence LLC](https://huggingface.co/reaperdoesntknow)
- [Discrepancy Calculus: Foundations and Core Theory](https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus) (DOI: 10.57967/hf/8194)
- [Structure Over Scale](https://huggingface.co/reaperdoesntknow/Structure-Over-Scale) (DOI: 10.57967/hf/8165)
- [Three Teachers to Dual Cognition](https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy) (DOI: 10.57967/hf/8184)
- [Modelo base Qemma-redux](https://huggingface.co/reaperdoesntknow/Qemma-redux)
