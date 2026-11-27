# kanippa/llm2026-g6-mix-nemotron653-qwen35-08b

## Resumen

`kanippa/llm2026-g6-mix-nemotron653-qwen35-08b` es un ajuste fino (fine-tuning) del modelo Qwen3.5-0.8B orientado a la generacion de respuestas en pipelines de RAG (Retrieval-Augmented Generation) en japones. Lo desarrolla el usuario kanippa en el contexto de un curso de LLM (identificado en el nombre como "llm2026-g6") y parte de un modelo intermedio previo del mismo autor, `llm2026-g6-chain3-mix-qwen35-08b`. El objetivo concreto es generar respuestas cortas con cita explicita de fragmentos (chunk IDs) a partir de cinco pasajes recuperados de un corpus de Wikipedia en japones.

El modelo hereda la arquitectura y el chat template de Qwen3.5-0.8B, con aproximadamente 853 millones de parametros y pesos en safetensors de precision FP16 (repo de 1,7 GB). La etapa adicional de entrenamiento descrita emplea LoRA de rango 8 y alpha 16 sobre 653 ejemplos de QA encadenados (493 de dos pasos y 160 de tres pasos), con una sola epoca y 41 actualizaciones del optimizador. Es, por tanto, un modelo pequeno, especializado y de nicho, no un modelo generalista.

Su relevancia es acotada pero clara: demuestra un flujo de trabajo reproducible de ajuste fino con LoRA sobre un modelo base pequeno para una tarea RAG muy concreta (respuesta corta + cita), con licencia Apache 2.0 y datos de entrenamiento documentados. No obstante, el modelo tiene cero descargas y cero likes en el momento de la ficha, y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parametros. La model card indica que la arquitectura original y el chat template proceden del modelo base de Qwen, y que los pesos publicados corresponden a un merge en FP16 del adaptador LoRA entrenado. No se detalla en la informacion disponible la configuracion interna de capas, atencion ni ventana de contexto del modelo base.

El entrenamiento descrito se realizo en una unica etapa adicional sobre el modelo padre, con LoRA de rango 8 y alpha 16, una epoca, batch efectivo de 16 y 41 actualizaciones del optimizador. Los datos consisten en 653 registros de QA encadenados (493 de dos pasos y 160 de tres pasos) construidos enlazando ejemplos de QA japoneses existentes; cada cadena incluye al menos un ejemplo del dataset `cl-nagoya/auto-wiki-qa-nemotron`, y cada ejemplo usa cinco pasajes recuperados del corpus de Wikipedia del curso. Los registros se filtraron para exigir una cita final disponible y se formatearon como prompts en japones con cinco pasajes, respuesta corta e ID de fragmento citado. Las etapas padre emplearon ademas `cl-nagoya/auto-wiki-qa`, JSQuAD (JGLUE), JEMHopQA, NIILC QA y JaQuAD. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto en japones condicionada a contexto recuperado (RAG), con respuestas cortas.
- Citacion de fragmentos mediante chunk IDs a partir de cinco pasajes de entrada.
- Razonamiento multi-paso limitado: el entrenamiento incluye cadenas de dos y tres pasos de QA enlazado.
- Procesamiento de entradas de tipo imagen-texto segun el pipeline declarado (`image-text-to-text`), aunque no se detalla en la informacion disponible el alcance real de las capacidades multimodales.
- Conversacion con chat template heredado de Qwen3.5.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al japones segun el campo `language`.

## Casos de uso

- Generacion de respuestas con cita en un pipeline RAG japones: el modelo recibe cinco pasajes recuperados y devuelve una respuesta corta con el ID del fragmento citado, que es exactamente el formato para el que fue entrenado.
- Evaluacion de sistemas de recuperacion: al exigir una cita concreta, permite medir si el pasaje correcto fue recuperado y si el generador lo selecciona, como metrica de calidad del retriever.
- Prototipado de asistentes documentales en japones: con 0,85 mil millones de parametros y pesos FP16 de 1,7 GB, se puede desplegar en una sola GPU consumer para pruebas de concepto de bajo coste.
- Investigacion sobre QA encadenado: sirve como referencia reproducible para estudiar como un modelo pequeno maneja preguntas de dos y tres pasos con contexto recuperado.
- Educacion y docencia: el modelo documenta todo el flujo (datasets, LoRA, hiperparametros, formato de prompt), lo que lo hace util como ejemplo didactico de ajuste fino para RAG.
- Filtrado y anotacion de corpus: puede usarse para generar respuestas cortas con cita sobre pasajes de Wikipedia japonesa en tareas de enriquecimiento de datos, siempre con revision humana dada su escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB solo para pesos, mas memoria para el contexto y el runtime (estimacion orientativa; no confirmada en la informacion disponible).
- Cuantizacion: no se publican versiones GGUF ni cuantizadas; seria necesario generarlas a partir de los pesos safetensors.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM deberia poder ejecutar el modelo en FP16; para cuantizaciones de 4 bits el requisito baja a unos 1-2 GB.
- Cabe en GPU consumer: si, por el tamano del modelo (0,85 mil millones de parametros).
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible, aunque el formato safetensors es compatible con transformers y potencialmente convertible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| kanippa/llm2026-g6-mix-nemotron653-qwen35-08b | 852.985.920 | No disponible | Japones | Apache 2.0 | RAG japones con cita |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 mil millones | No disponible | Multilingue | Apache 2.0 | Modelo generalista |
| kanippa/llm2026-g6-chain3-mix-qwen35-08b (modelo padre) | ~0,8 mil millones | No disponible | Japones | Apache 2.0 | RAG japones (etapa previa) |

La comparativa se limita a los modelos citados en la informacion disponible; no se dispone de datos de rendimiento para establecer diferencias cuantitativas entre ellos.

## Limitaciones y advertencias

- Modelo de nicho: entrenado para un formato muy concreto (cinco pasajes, respuesta corta, cita de chunk ID); su comportamiento fuera de ese formato no esta documentado.
- Idiomas: solo japones declarado; el rendimiento en castellano u otras lenguas no esta soportado ni evaluado.
- Riesgo de alucinacion: al ser un modelo pequeno ajustado con pocos ejemplos (653), la fidelidad de las citas y respuestas en dominios distintos al corpus de entrenamiento no esta garantizada.
- Sesgos: los datos de entrenamiento provienen de Wikipedia japonesa y datasets de QA academicos, con los sesgos propios de esas fuentes; no se documentan analisis de sesgo.
- Contexto: la longitud de contexto no esta disponible en la informacion proporcionada, lo que impide garantizar el manejo de pasajes largos.
- Licencia: Apache 2.0 permite uso comercial, pero los datasets de entrenamiento (CC BY-SA 4.0 y CC BY-SA 3.0) imponen obligaciones de atribucion y compartir-igual sobre los datos derivados; conviene revisar la compatibilidad en produccion.
- Madurez: cero descargas y cero likes; no hay evidencia de uso en produccion ni evaluacion independiente.
- Capacidades multimodales: el pipeline `image-text-to-text` figura en los metadatos, pero la model card no describe el uso de imagenes, por lo que no debe asumirse vision funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kanippa/llm2026-g6-mix-nemotron653-qwen35-08b
- Modelo padre (G6 mix): https://huggingface.co/kanippa/llm2026-g6-chain3-mix-qwen35-08b
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset cl-nagoya/auto-wiki-qa-nemotron: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa-nemotron
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset JSQuAD (JGLUE): https://huggingface.co/datasets/yahoojapan/JGLUE
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset JaQuAD: https://huggingface.co/datasets/SkelterLabsInc/JaQuAD
- Corpus del curso: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
