# Maddy-Das/isha-qwen2.5-coder-7b-dpo-lora

## Resumen

`Maddy-Das/isha-qwen2.5-coder-7b-dpo-lora` es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-7B-Instruct, publicado por el usuario Maddy-Das en Hugging Face. Se trata de un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre la versión cuantizada en 4 bits del modelo base de Unsloth, con el objetivo de alinear las respuestas del modelo hacia preferencias concretas del autor. El repositorio tiene un tamaño de 0,6 GB, lo que es coherente con un adaptador LoRA y no con un modelo completo.

El modelo hereda la arquitectura y capacidades del Qwen2.5-Coder-7B-Instruct original: un transformer decoder-only de aproximadamente 7,6 mil millones de parámetros, especializado en generación de código, con una ventana de contexto de 32 768 tokens en el modelo base. La contribución de este repositorio es el ajuste por preferencias, no una nueva arquitectura ni un entrenamiento desde cero.

Su relevancia es limitada y muy específica: se trata de un experimento de fine-tuning personal con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Resulta útil como ejemplo de pipeline DPO con Unsloth sobre Qwen2.5-Coder, pero no como modelo de producción sin una evaluación previa por parte de quien lo vaya a usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste LoRA con DPO sobre el modelo base |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-7B-Instruct tiene aproximadamente 7,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base soporta 32 768 tokens) |
| Tipos de cuantizacion | No disponible; el modelo base de partida esta en bnb-4bit |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA); compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA obtenido mediante DPO (Direct Preference Optimization) sobre `unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit`, una versión del Qwen2.5-Coder-7B-Instruct cuantizada en 4 bits con bitsandbytes y distribuida por Unsloth. El entrenamiento se realizó con la librería Unsloth, que segun la model card permite entrenar "2x mas rapido" que un pipeline estandar de Hugging Face. No se especifican en la informacion disponible el numero de pasos, el dataset de preferencias utilizado, la composicion de los pares (chosen/rejected), la tasa de aprendizaje ni la configuracion del LoRA (rango, alpha, modulos objetivo).

La arquitectura subyacente es la del Qwen2.5-Coder-7B-Instruct: un transformer decoder-only con atención de múltiples cabezas, RoPE, SwiGLU en las capas feed-forward y atención con ventana deslizante combinada con atención completa en el modelo base. El ajuste DPO no modifica la arquitectura, solo los pesos del adaptador, que se aplican sobre el modelo base en tiempo de carga. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto y código: hereda del Qwen2.5-Coder-7B-Instruct la capacidad de completar, explicar y refactorizar código en múltiples lenguajes de programación.
- Razonamiento matemático y lógico: el modelo base incluye entrenamiento específico para tareas de matemáticas y razonamiento paso a paso.
- Tool calling y function calling: el modelo base Qwen2.5-Coder soporta invocación de funciones estructurada, aunque no se confirma en la model card que el ajuste DPO la preserve intacta.
- Razonamiento multi-paso y uso en agentes: el modelo base está diseñado para flujos de agente con múltiples llamadas a herramientas; el ajuste DPO puede alterar el estilo de las respuestas.
- Capacidades multilingües: la model card declara únicamente inglés; el modelo base Qwen2.5-Coder soporta más idiomas, pero el ajuste DPO puede haber reducido esa cobertura.
- Modo thinking: no disponible en la informacion proporcionada.
- Visión y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Experimentación con DPO sobre modelos de código: el repositorio sirve como referencia práctica para reproducir un pipeline de ajuste por preferencias con Unsloth sobre Qwen2.5-Coder-7B, útil para investigadores que quieran comparar configuraciones de DPO.
- Generación de código asistida en entornos de desarrollo: el modelo puede integrarse en un IDE o en un pipeline de CI/CD para autocompletar, generar tests o sugerir refactorizaciones, siempre que se valide previamente la calidad del ajuste.
- Atención al cliente técnica: con la ventana de contexto del modelo base (32 768 tokens), puede gestionar conversaciones multi-turno sobre documentación técnica o errores de código, aunque el ajuste DPO puede haber sesgado el tono de las respuestas.
- Documentación automática de código: generación de docstrings y comentarios a partir de fragmentos de código fuente, aprovechando la especialización del modelo base en código.
- Análisis de repositorios y revisión de pull requests: el modelo puede resumir cambios y detectar posibles problemas en diffs, aunque requiere validación humana por el riesgo de alucinación.
- Prototipado de asistentes de programación en investigación: como punto de partida para estudiar el efecto del DPO en la calidad y el estilo de las respuestas de un modelo de código, comparándolo con el modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base Qwen2.5-Coder-7B-Instruct requiere aproximadamente 15-16 GB en FP16, 8-9 GB en cuantización de 8 bits y 4-5 GB en cuantización de 4 bits.
- GPU recomendadas: no disponible en la informacion proporcionada. Para el modelo base, una RTX 4090 (24 GB) o una A100 (40/80 GB) permiten inferencia en FP16; una RTX 3090 o 4080 (16 GB) requieren cuantización.
- Compatibilidad con GPU de consumo: el modelo base en 4 bits cabe en GPUs de consumo con 8 GB o más de VRAM, aunque no se confirma para este adaptador concreto.
- Opciones de despliegue: transformers, text-generation-inference (según los tags del repositorio) y, previsiblemente, llama.cpp u Ollama tras convertir el adaptador a GGUF, aunque no se documenta en la model card.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Maddy-Das/isha-qwen2.5-coder-7b-dpo-lora | ~7,6 B (adaptador LoRA) | No disponible (base: 32 768) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-Coder-7B-Instruct | ~7,6 B | 32 768 | Apache 2.0 | Hugging Face, ampliamente utilizado |
| EasierAI/Qwen-2.5-Coder-7B | ~7,6 B | No disponible | No disponible | Hugging Face |
| unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit | ~7,6 B (4 bits) | 32 768 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; el modelo base Qwen2.5-Coder puede heredar sesgos de sus datos de entrenamiento, y el ajuste DPO puede introducir sesgos adicionales según el dataset de preferencias utilizado.
- Riesgo de alucinación: presente, como en cualquier modelo de lenguaje; especialmente relevante en generación de código donde puede inventar APIs o funciones inexistentes.
- Limitaciones de contexto e idioma: la model card declara únicamente inglés; el ajuste DPO puede haber reducido la cobertura multilingüe del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador se apoya en un modelo base cuantizado por Unsloth cuya licencia también debe respetarse.
- Caveat para producción: el repositorio tiene cero descargas y cero likes, sin benchmarks ni evaluación publicada; no se recomienda su uso en producción sin una evaluación exhaustiva previa.
- Falta de documentación: no se especifican hiperparámetros del entrenamiento, dataset de preferencias ni configuración del LoRA, lo que dificulta la reproducibilidad.
- Compatibilidad: al ser un adaptador LoRA sobre un modelo base en bnb-4bit, requiere cargar dicho modelo base y aplicar el adaptador, lo que añade complejidad al despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Maddy-Das/isha-qwen2.5-coder-7b-dpo-lora
- Modelo base en Unsloth: https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
