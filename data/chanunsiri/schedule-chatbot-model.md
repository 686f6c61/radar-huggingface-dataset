# Chanunsiri/schedule-chatbot-model

## Resumen

El modelo `Chanunsiri/schedule-chatbot-model` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit`, desarrollado por Chanunsiri (Koollanis) con el propósito de responder preguntas sobre horarios escolares. Se trata de un modelo pequeño, de 1.500 millones de parámetros, optimizado para tareas de conversación instructiva en inglés. El proyecto fue entrenado con la librería Unsloth, que acelera el entrenamiento y reduce el consumo de memoria, y se distribuye bajo licencia Apache 2.0.

El modelo está pensado para ser desplegado como un chatbot especializado en consultas de horarios de clases, aunque no se proporcionan detalles adicionales sobre el dataset de entrenamiento ni sobre el proceso de ajuste. Al estar basado en Qwen2.5, hereda las capacidades generales de generación de texto y razonamiento de su modelo base, pero su especialización lo orienta hacia un dominio concreto. Su tamaño reducido lo hace adecuado para entornos con recursos limitados, como GPUs de consumo o inferencia en CPU.

A pesar de su escasa documentación, el modelo representa un ejemplo de ajuste fino eficiente sobre una arquitectura moderna, con un enfoque práctico en un caso de uso específico. Es relevante para desarrolladores que buscan implementar asistentes conversacionales ligeros en entornos educativos o administrativos, aunque se recomienda evaluar su rendimiento antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma en la informacion del modelo) |
| Tipos de cuantizacion | no disponible (el modelo base se publico en bnb-4bit, pero el checkpoint final no especifica cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun el tag safetensors en HuggingFace) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atencion por ventanas deslizantes y normalizacion pre-RMSNorm, disenado para tareas de instruccion y chat. El checkpoint original de Unsloth (`unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit`) es una version cuantizada a 4 bits del modelo instructivo de Qwen2.5-1.5B, que facilita el entrenamiento con menos memoria. El ajuste fino se realizo con la libreria Unsloth, que optimiza el proceso de entrenamiento mediante kernels personalizados y tecnicas de cuantizacion durante el entrenamiento (QLoRA). No se dispone de informacion sobre el dataset utilizado, el numero de pasos de entrenamiento, ni si se aplicaron tecnicas como RLHF o DPO. La model card solo menciona que el entrenamiento fue 2 veces mas rapido gracias a Unsloth, sin ofrecer mas detalles.

## Capacidades

- Generacion de texto en ingles siguiendo instrucciones conversacionales.
- Especializacion en consultas sobre horarios escolares (preguntas y respuestas sobre asignaturas, horas, aulas, etc.).
- Capacidades generales de razonamiento y comprension heredadas del modelo base Qwen2.5-1.5B-Instruct, aunque no hay evidencia de un entrenamiento especifico en tareas como codigo o matematicas.
- Soporte de chat multi-turno gracias a la arquitectura instructiva de Qwen2.5.
- No se confirma soporte de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Asistente virtual para estudiantes: el modelo puede responder preguntas frecuentes sobre el horario de clases, como "¿a que hora es la clase de matematicas?" o "¿en que aula esta historia?", facilitando la consulta rapida sin necesidad de consultar documentos.
- Chatbot institucional en colegios o universidades: integrado en un sitio web o aplicacion movil, puede resolver dudas sobre la organizacion academica de forma automatizada, reduciendo la carga del personal administrativo.
- Sistema de informacion para padres: los padres pueden preguntar sobre los horarios de sus hijos, aunque el modelo solo maneja ingles, lo que limita su uso en entornos hispanohablantes.
- Prototipo de chatbot educativo: sirve como base para experimentar con ajustes finos en dominios especificos, demostrando como adaptar un modelo pequeno a una tarea concreta.
- Evaluacion de modelos ligeros: util para investigar el rendimiento de modelos de 1.5B en tareas de comprension de horarios y comparar con alternativas de mayor tamano.
- Despliegue en entornos con recursos limitados: su tamano reducido (0.2 GB) permite ejecutarlo en una Raspberry Pi o en una GPU de gama baja, ideal para proyectos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar. El rendimiento en tareas de horarios escolares no ha sido cuantificado publicamente.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1.5B con pesos en safetensors (probablemente en precision 16 bits), se estima un consumo de memoria de entre 3 y 4 GB para inferencia en FP16. Si se cuantiza a 4 bits, podria reducirse a alrededor de 1-2 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3050, o superiores (RTX 4090, A100, etc.). Tambien puede ejecutarse en CPU con suficiente RAM (alrededor de 4-6 GB).
- Compatibilidad con GPU de consumo: si, cabe en la mayoria de GPUs consumer modernas.
- Opciones de despliegue: al usar la libreria transformers, puede servirse con Text Generation Inference (TGI), vLLM, Ollama o llama.cpp (si se convierte a GGUF). Tambien es compatible con el framework de Unsloth para inferencia optimizada.
- Latencia y throughput: no hay datos publicados. En una GPU moderna (RTX 4090) se espera una generacion de decenas de tokens por segundo, pero no se ha medido oficialmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Chanunsiri/schedule-chatbot-model | 1.5B | no disponible | Apache 2.0 | Horarios escolares |
| unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit | 1.5B | 32.768 | Apache 2.0 | Instruccion general |
| Qwen2.5-1.5B-Instruct (original) | 1.5B | 32.768 | Apache 2.0 | Instruccion general |

El modelo se distingue del modelo base por su ajuste fino orientado a un dominio especifico, pero no se dispone de datos de rendimiento comparativo. Otras alternativas de tamano similar, como Llama 3.2 1B o Gemma 2 2B, podrian servir como referencia, pero no se han incluido por falta de informacion sobre su rendimiento en esta tarea concreta.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no se especifican datos de entrenamiento, hiperparametros, ni evaluaciones, lo que dificulta juzgar su calidad real.
- El modelo solo maneja ingles; no es adecuado para consultas en castellano u otros idiomas.
- Al ser un fine-tune sobre una base pequena, puede presentar alucinaciones o respuestas incorrectas en temas fuera de su dominio de horarios.
- No hay garantia de que el modelo maneje correctamente todos los formatos de horarios posibles; se recomienda probarlo con datos reales antes de usarlo en produccion.
- No se confirma soporte para tool calling ni integraciones externas, limitando su uso en agentes complejos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no proporciona soporte ni garantias.
- El modelo fue creado en 2026 (segun la fecha de creacion), lo que puede indicar que es reciente y aun no ha sido ampliamente probado por la comunidad.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/Chanunsiri/schedule-chatbot-model)
- [Perfil del autor en HuggingFace](https://huggingface.co/Chanunsiri)
- [Modelo base unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit](https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit) (referencia indirecta)
- [Libreria Unsloth](https://github.com/unslothai/unsloth)
