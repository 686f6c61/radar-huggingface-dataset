# lesserafimlover/qwen2.5-coder-1.5b-unsloth-qlora-v3

## Resumen

Este modelo es un fine-tuning de tipo QLoRA sobre Qwen2.5-Coder-1.5B-Instruct, realizado por el usuario lesserafimlover con la librería Unsloth. Se trata de un adaptador LoRA de bajo rango que ajusta el modelo base para una tarea específica, aunque la model card no detalla el dataset ni el objetivo del entrenamiento. El modelo base es la versión instruct de Qwen2.5-Coder, un modelo de 1.500 millones de parámetros orientado a la generación y razonamiento de código, con una ventana de contexto de 32.768 tokens y licencia Apache 2.0.

La relevancia de este modelo radica en su tamaño compacto y en que hereda las capacidades del Qwen2.5-Coder original, que alcanza un 43,3 % en HumanEval y soporta 92 lenguajes de programación según la documentación oficial. Al estar publicado como adaptador QLoRA, ocupa solo 0,1 GB y puede integrarse sobre el modelo base cuantizado a 4 bits, lo que permite su ejecución en hardware de consumo con unos 1,2 GB de VRAM en cuantización Q4. Es un ejemplo de personalización eficiente mediante LoRA para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder, attention de causalidad completa) |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | El modelo base se suministra en 4 bits (bnb-4bit); el adaptador LoRA se entrega en safetensors de precisión FP16/FP32 |
| Idiomas soportados | Inglés (el modelo base soporta 92 lenguajes de programación, pero el fine-tuning declara solo "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-Coder-1.5B-Instruct, un transformer causal con capas de atención estándar y normalización RMSNorm. La arquitectura deriva directamente de Qwen2.5, con un tamaño de cabeza de 64 dimensiones, 28 capas, 12 cabezas de atención y una dimensión oculta de 1.536. El fine-tuning se ha realizado con la técnica QLoRA (Quantized Low-Rank Adaptation) implementada mediante la librería Unsloth, que optimiza el entrenamiento para acelerar el proceso y reducir el uso de memoria. El adaptador LoRA se ha entrenado sobre la versión cuantizada a 4 bits del modelo instruct (unsloth/qwen2.5-coder-1.5b-instruct-bnb-4bit), lo que explica el tamaño reducido del repositorio (0,1 GB).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, ni el proceso de alineación (RLHF, DPO, etc.) en la model card publicada. Tampoco se especifica la duración del entrenamiento ni las métricas de validación. El autor indica únicamente que se entrenó "2x más rápido" gracias a Unsloth, pero no aporta más detalles técnicos.

## Capacidades

- Generación de código y completado de código en 92 lenguajes de programación (capacidad heredada del modelo base Qwen2.5-Coder).
- Razonamiento lógico y matemático básico para tareas de programación, incluyendo explicación de código y resolución de bugs.
- Soporte de chat y diálogo multi-turno, al estar basado en la versión instruct del modelo.
- Tool calling y function calling: el modelo base Qwen2.5-Coder-Instruct soporta llamadas a funciones, aunque no se ha verificado que el adaptador LoRA mantenga esta capacidad sin degradación.
- Capacidad de procesamiento de contexto largo (hasta 32.768 tokens), útil para analizar repositorios completos o documentación extensa.
- Multilingüismo limitado al inglés en la interfaz, pero el modelo base reconoce código de múltiples lenguajes de programación.

## Casos de uso

- Asistente de programación en entornos de desarrollo local: el modelo puede integrarse en editores como VS Code o Neovim para autocompletado, sugerencias de código y explicación de fragmentos. Su tamaño de 1,5B permite ejecutarlo en portátiles con GPU moderada (por ejemplo, RTX 3060) o incluso en CPU con cuantización.
- Generación de código en pipelines de CI/CD: gracias a su soporte de function calling, puede usarse en agentes de automatización que generen tests, corrijan errores o documenten código, siempre que se respete el contexto de 32K tokens.
- Asistente de depuración: el modelo puede recibir un fragmento de código con un error y sugerir correcciones, aprovechando su capacidad de razonamiento sobre código.
- Traducción de código entre lenguajes: por su entrenamiento en múltiples lenguajes de programación, puede convertir funciones de un lenguaje a otro, aunque con limitaciones propias de un modelo de 1,5B.
- Educación en programación: como tutor de código que explica conceptos, resuelve ejercicios y genera ejemplos prácticos, especialmente útil en entornos sin conexión a internet.
- Prototipado rápido en investigación: para experimentos que requieran generación de código de bajo coste y alta velocidad de inferencia, este modelo es adecuado por su pequeño tamaño y licencia Apache 2.0 que permite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tuning en la información disponible. El modelo base Qwen2.5-Coder-1.5B-Instruct reporta un 43,3 % en HumanEval (generación de código en Python) según la documentación oficial de Qwen. Sin embargo, no se garantiza que el adaptador LoRA mantenga o supere ese valor. No se dispone de datos de MBPP, GSM8K, MMLU ni otros benchmarks para este modelo en particular.

## Requisitos de hardware

- VRAM estimada: el modelo base cuantizado a 4 bits requiere aproximadamente 1,2 GB de VRAM para inferencia (según la documentación de Qwen2.5-Coder). Añadiendo el adaptador LoRA y el overhead de la ejecución, se recomienda al menos 2 GB de VRAM para un uso fluido.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Ejemplos: NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4090, o incluso Apple Silicon con memoria unificada. Para despliegue en servidores, una A10 o A100 es excesiva pero viable.
- Compatibilidad con GPU de consumo: sí, es perfectamente viable en GPUs de gama media (RTX 3060, 4060) y en CPUs con cuantización a 4 bits.
- Opciones de despliegue: se puede cargar con la librería Transformers (con adaptadores PEFT), usar vLLM para inferencia de alto throughput, o exportar a GGUF para llama.cpp y Ollama (si se convierte el modelo base cuantizado + adaptador). También es compatible con TGI (text-generation-inference) según los tags del repositorio.
- Latencia y throughput: no se han medido para este modelo específico. En una RTX 3060, se puede esperar una velocidad de generación de 20-40 tokens/s con cuantización 4-bit y batching pequeño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B (base) | 1,5B | 32K | 43,3 % | Apache 2.0 | HuggingFace, Ollama |
| lesserafimlover/qwen2.5-coder-1.5b-unsloth-qlora-v3 | 1,5B (adaptador LoRA) | 32K | no disponible | Apache 2.0 | HuggingFace |
| CodeLlama-7B | 7B | 16K | 30,5 % (HumanEval) | Llama 2 license | HuggingFace |
| StarCoderBase-1B | 1B | 8K | 17,7 % (HumanEval) | Apache 2.0 | HuggingFace |

El modelo se posiciona como una alternativa ligera y de bajo coste, pero sin datos de rendimiento propios. Frente a CodeLlama-7B, ofrece un tamaño mucho menor y una licencia más permisiva, pero es probable que tenga menor rendimiento en tareas complejas. Frente a StarCoderBase-1B, tiene una ventana de contexto cuatro veces mayor y un mejor rendimiento base en HumanEval.

## Limitaciones y advertencias

- No se ha publicado información sobre el dataset de entrenamiento del adaptador LoRA, lo que impide evaluar la calidad y posibles sesgos del fine-tuning.
- El riesgo de alucinación en código es elevado para modelos de este tamaño; las respuestas pueden contener errores de sintaxis o lógica que no se detectan automáticamente.
- Solo está declarado el idioma inglés, aunque el modelo base es multilingüe para código. Las instrucciones en otros idiomas pueden degradar el rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder también es Apache 2.0, por lo que no hay restricciones adicionales. Sin embargo, el adaptador puede contener sesgos propios del dataset de entrenamiento del autor.
- El modelo es un adaptador LoRA, no un modelo completo; para utilizarlo se necesita el modelo base cuantizado (unsloth/qwen2.5-coder-1.5b-instruct-bnb-4bit) y la librería PEFT/Transformers.
- No se ha verificado la compatibilidad con versiones recientes de Transformers; es posible que haya que actualizar la librería para cargar los adaptadores.
- El contexto de 32K tokens es teórico; en la práctica, con cuantización 4-bit, la memoria necesaria para procesar secuencias largas puede aumentar significativamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lesserafimlover/qwen2.5-coder-1.5b-unsloth-qlora-v3
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct
- Modelo base cuantizado (bnb-4bit): https://huggingface.co/unsloth/qwen2.5-coder-1.5b-instruct-bnb-4bit
- Documentación técnica de Qwen2.5-Coder: https://arxiv.org/html/2409.12186v2
- Página de Qwen2.5-Coder en Ollama: https://ollama.com/library/qwen2.5-coder:1.5b
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
