# gimmy256/adaption_luganda_fln_teacher_training

## Resumen

El repositorio `gimmy256/adaption_luganda_fln_teacher_training` contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base `google/gemma-4-31B-it` mediante ajuste fino supervisado (SFT). El adaptador ha sido desarrollado con la plataforma AutoScientist de Adaption Labs y está diseñado para especializar el modelo en tareas de formación de docentes y educación primaria en lengua luganda (idioma bantú hablado en Uganda) y en inglés. El dataset de entrenamiento, `luganda_fln_teacher_training`, incluye 18.253 ejemplos con una distribución de dominios de 57% educación académica y 43% lenguaje, lo que lo convierte en un recurso específico para asistentes de enseñanza bilingües.

La relevancia de este modelo radica en su aplicación práctica en el contexto educativo de Uganda, donde la integración de IA para acompañamiento docente en lenguas indígenas es una necesidad creciente. Al ser un adaptador LoRA, el despliegue se realiza sobre el modelo base de 31B, lo que permite aprovechar las capacidades multilingües y de razonamiento de Gemma mientras se ajusta el comportamiento a tareas pedagógicas concretas. El modelo se distribuye bajo una licencia `other` (no especificada en la información proporcionada), y el repositorio contiene solo los pesos del adaptador (0.5 GB) en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre base `google/gemma-4-31B-it` (modelo causal de lenguaje, transformer) |
| Parametros totales | No disponible (el adaptador añade un bajo número de parámetros sobre el base de 31B; el adaptador en sí no se detalla) |
| Parametros activos | No disponible (el adaptador es de bajo rango, r=16) |
| Longitud de contexto | No disponible (depende del modelo base, no se especifica en la ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base se puede cuantizar aparte) |
| Idiomas soportados | Luganda (principal) e inglés (secundario) |
| Licencia | `other` (no especificada en el repositorio) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica de Low-Rank Adaptation (LoRA) sobre el modelo base `google/gemma-4-31B-it`. Según la configuración de AutoScientist, se entrenó con un rango de LoRA `r=16`, `alpha=32` y `dropout=0.05`, aplicando la adaptación a todos los módulos lineales (`lora_trainable_modules: "all-linear"`). El entrenamiento se realizó mediante ajuste fino supervisado (SFT) durante 3 épocas, con un tamaño de lote máximo dinámico, tasa de aprendizaje inicial de 1e-5, programación de tasa de aprendizaje tipo coseno con 0.5 ciclos, `warmup_ratio=0.1`, `weight_decay=0.01` y `max_grad_norm=1`. El dataset de entrenamiento contiene 18.253 ejemplos en formato de chat, con un 67% de contenido académico-educativo y un 43% de dominio lingüístico, lo que indica un enfoque en tareas de enseñanza de lectoescritura y matemáticas básicas en lengua lugubana.

No se dispone de información adicional sobre el volumen total de tokens de entrenamiento ni sobre técnicas de RLHF o DPO. El modelo base `gemma-4-31B-it` es un modelo de 31B parámetros (aunque el nombre sugiere una versión de Gemma 4, no hay confirmación de que exista tal versión en la fecha de creación del repo; se asume que es un modelo reciente de la familia Gemma). El adaptador se ha publicado con métricas de entrenamiento y de evaluación en forma de gráficos (win-rates), pero no se han incluido valores numéricos en la información proporcionada.

## Capacidades

- Generación de texto en lenguaje natural en lugubana e inglés, especializado en contextos educativos y de formación docente.
- Razonamiento pedagógico: el adaptador está entrenado para responder preguntas y generar contenido didáctico, guías de enseñanza y material de apoyo para profesores de primaria.
- Soporte de conversaciones multi-turno: el formato de datos es `chat`, lo que permite interacciones diálogo en entornos de tutoría.
- Capacidad de tool calling: no se menciona explícitamente, pero al ser un adaptador sobre Gemma-4-31B-it, es probable que el base tenga soporte para función calling, aunque el adaptador no lo garantiza.
- Capacidades multilingües limitadas: el adaptador se centra en lugubano e inglés; no hay evidencia de soporte de otros idiomas.
- No se han reportado capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistente de docentes en escuelas primarias de Uganda: el modelo puede generar planes de lección, explicaciones gramaticales y ejercicios de lectoescritura en lugubano, facilitando la preparación de clases a maestros con recursos limitados.
- Tutoría personalizada para estudiantes: mediante integración en un chatbot educativo, el adaptador puede responder dudas de alumnos en su lengua materna, fomentando la comprensión de conceptos básicos de matemáticas y lenguaje.
- Generación de material didáctico bilingüe: el modelo puede producir textos paralelos en inglés y lugubano para crear libros de texto o fichas de trabajo para escuelas bilingües.
- Evaluación formativa automatizada: al estar entrenado con datos de educación académica, puede generar preguntas de opción múltiple y ejercicios de práctica para evaluar el progreso de los estudiantes en lectura y escritura.
- Formación continua de docentes: el adaptador puede actuar como mentor virtual, respondiendo a dudas metodológicas y proporcionando ejemplos de buenas prácticas pedagógicas en el contexto local.
- Traducción asistida de materiales educativos: aunque no es un modelo de traducción puro, su entrenamiento bilingüe permite adaptar recursos educativos en inglés al lugubano con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (como MMLU, HumanEval o GSM8K) en la información proporcionada. La model card menciona una evaluación sobre un conjunto de test retenido dentro de la distribución y un conjunto de test específico del dominio para medir generalización, así como métricas de win-rates representadas en gráficas, pero no se incluyen los valores numéricos de esas métricas en el repositorio.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (0.5 GB), pero su uso requiere cargar el modelo base `google/gemma-4-31B-it`, que necesita aproximadamente 62 GB de VRAM en precisión bf16 (sin cuantización). Con cuantización de 4 bits (por ejemplo, bitsandbytes) se puede reducir a unos 16-18 GB.
- GPU recomendadas: para inferencia en producción, una NVIDIA A100 (80 GB) o H100 (80 GB) es ideal para el modelo base en bf16. Para entornos con menor VRAM, se puede usar una RTX 4090 (24 GB) con cuantización de 4 bits.
- El adaptador LoRA se puede fusionar con el base (`merge_and_unload()`) para acelerar la inferencia, o mantenerlo separado en el flujo de trabajo con PEFT.
- Opciones de despliegue: se puede servir con vLLM, TGI (Text Generation Inference), o con llama.cpp para cuantización GGUF (aunque el adaptador no está en formato GGUF). También se puede integrar en frameworks como Hugging Face Transformers con `PeftModel`.
- Latencia y throughput: no se han publicado datos específicos para este adaptador; dependerá del hardware y la cuantización del modelo base.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables del mismo ámbito (adaptadores LoRA para educación en lenguas africanas). Se podría comparar con otros adaptadores de la colección `CraneAILabs` de Hugging Face, pero no se dispone de sus especificaciones en esta búsqueda. La comparación se limitaría al modelo base `gemma-4-31B-it` frente a otros modelos multilingües como Llama-3-8B o Qwen-2.5-7B, pero no se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente con datos de educación y lenguaje en lugubano; su rendimiento en otros dominios o idiomas será limitado.
- La licencia `other` no especifica las condiciones de uso comercial; es necesario consultar la política de licencia de Adaption Labs y de Google para el modelo base antes de desplegar en producción.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en dominios fuera de su entrenamiento específico.
- El modelo base `gemma-4-31B-it` no es un modelo de código abierto en el sentido habitual (su licencia es `other`); esto puede restringir su uso en entornos comerciales o gubernamentales.
- El adaptador no incluye el tokenizador ni el modelo base; para usarlo es necesario descargar ambos por separado, lo que implica un requisito de almacenamiento adicional (~60 GB).
- La longitud de contexto no está documentada; se asume que es la del modelo base (probablemente 8K o más, pero no confirmado).
- No se han evaluado formalmente los riesgos de alucinación en el dominio educativo, lo que puede ser crítico para el uso con estudiantes.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/gimmy256/adaption_luganda_fln_teacher_training
- Dataset de entrenamiento: https://huggingface.co/datasets/gimmy256/adaption-luganda-fln-teacher-training
- Colección Luganda AI for Education (CraneAILabs): https://huggingface.co/collections/CraneAILabs/luganda-ai-for-education
- Documento sobre el framework PGVA (contexto de IA para lenguas indígenas): https://www.ijfmr.com/papers/2025/6/62106.pdf
