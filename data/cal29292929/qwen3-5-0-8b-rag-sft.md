# cal29292929/qwen3.5-0.8b-rag-sft

## Resumen

qwen3.5-0.8b-rag-sft es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario cal29292929 en Hugging Face. El modelo se ha entrenado sobre el conjunto de datos cl-nagoya/auto-wiki-qa, derivado de la Wikipedia en japones y distribuido bajo licencia CC BY-SA 4.0, con el objetivo de mejorar el comportamiento del modelo en tareas de generacion aumentada por recuperacion (RAG) en japones.

El modelo fue desarrollado como parte del concurso final del curso "2026年 大規模言語モデル講座 2" (Curso de modelos de lenguaje a gran escala 2026, 2) del laboratorio Matsuo-Iwasawa de la Universidad de Tokio. Se trata, por tanto, de un modelo de investigacion y competicion, no de un modelo de proposito general orientado a produccion.

Con 752.393.024 parametros reales (segun los pesos en safetensors) y un tamano de repositorio de 1,5 GB, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia radica en ser un ejemplo de ajuste fino de bajo coste especializado en japones y en RAG, aunque su adopcion practica es muy limitada por su escasa difusion (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, variante de texto `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo publicado en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen3.5 en su variante de texto (`qwen3_5_text`), y se ha sometido a un ajuste fino supervisado (SFT) sobre el dataset cl-nagoya/auto-wiki-qa. Este dataset se compone de pares de pregunta y respuesta generados automaticamente a partir de la Wikipedia en japones y se distribuye bajo CC BY-SA 4.0.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros, tecnicas de alineacion adicionales (RLHF, DPO) ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La model card unicamente indica el modelo base, el dataset y la licencia, y senala que el uso de los datos derivados de Wikipedia en japones debe respetar CC BY-SA 4.0.

## Capacidades

- Generacion de texto en japones, heredada del modelo base Qwen3.5-0.8B.
- Respuesta a preguntas sobre conocimiento enciclopedico en japones, gracias al ajuste sobre auto-wiki-qa.
- Generacion condicionada a contexto recuperado (orientacion RAG), que es el objetivo declarado del ajuste.
- Capacidades de razonamiento, codigo, matematicas o tool calling: no disponibles en la informacion proporcionada (dependen del modelo base y no se documentan en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card solo declara japones (ja).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Respuesta a preguntas sobre Wikipedia en japones: el modelo se usaria como generador final en un pipeline RAG que recupere articulos de Wikipedia y formule respuestas en japones, que es exactamente el escenario de entrenamiento.
- Asistente de documentacion interna en japones: integrado en un sistema de busqueda sobre manuales o bases de conocimiento corporativas en japones, con recuperacion previa de fragmentos relevantes.
- Prototipado academico y de investigacion: util como linea base en experimentos de SFT y RAG en japones con presupuesto de computo reducido, dado su tamano inferior a 1.000 millones de parametros.
- Generacion de resumenes de articulos enciclopedicos: puede condensar pasajes recuperados de fuentes japonesas en respuestas breves y legibles.
- Chatbot de bajo coste para nichos japoneses: desplegable en una sola GPU de consumo para demos o entornos de prueba con carga ligera.
- Evaluacion comparativa de tecnicas de ajuste: sirve como referencia en estudios sobre el impacto del SFT con datasets sinteticos derivados de Wikipedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en precision nativa (fp16/bf16) para los 752 millones de parametros; en torno a 0,8-1 GB con cuantizacion de 8 bits y 0,5-0,7 GB con 4 bits (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo, e incluso en CPU para inferencia de baja carga.
- Opciones de despliegue: al publicarse solo en safetensors, requiere frameworks como Transformers, vLLM o TGI; para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-0.8b-rag-sft | 752.393.024 | no disponible | ja | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | no disponible (familia 0.8B) | no disponible | no disponible | no disponible | Hugging Face |
| cl-nagoya/auto-wiki-qa (dataset) | no aplica | no aplica | ja | CC BY-SA 4.0 | Hugging Face |

No se dispone de datos de rendimiento ni de otros modelos comparables documentados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de competicion academica: no hay evidencia de validacion en produccion ni de evaluaciones publicas.
- Difusion practica nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Sesgos: al entrenarse sobre Wikipedia en japones, puede heredar sesgos de cobertura, sesgo de genero y sesgo cultural de esa fuente; no se documentan mitigaciones.
- Riesgo de alucinacion: inherente a los modelos de 0,8B y acentuado en tareas de respuesta factual; no se han publicado evaluaciones de fidelidad.
- Limitaciones de idioma: solo se declara japones; el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: los pesos son Apache 2.0, pero los datos derivados de Wikipedia en japones estan sujetos a CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir igual sobre contenidos generados a partir de ellos.
- Contexto y cuantizacion: no se documenta la longitud de contexto ni se ofrecen variantes cuantizadas, lo que complica el despliegue en entornos con requisitos estrictos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cal29292929/qwen3.5-0.8b-rag-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
