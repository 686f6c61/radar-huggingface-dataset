# lugman-madhiai/Qwen3.5-2B-Instantly-CS-SFT-Split-01-adapter

## Resumen

El repositorio `lugman-madhiai/Qwen3.5-2B-Instantly-CS-SFT-Split-01-adapter` contiene un adaptador de ajuste fino supervisado (SFT) publicado por el usuario lugman-madhiai. No se trata de un modelo completo, sino de un adaptador (previsiblemente LoRA) que debe cargarse sobre el modelo base `Qwen/Qwen3.5-2B`, al que apunta explicitamente la model card mediante el campo `base_model`. El tamano del repositorio (0.1 GB) es coherente con un artefacto de pesos de adaptador y no con un modelo de miles de millones de parametros.

El nombre del repositorio incluye las siglas CS-SFT (probablemente "Customer Service Supervised Fine-Tuning") y Split-01, lo que sugiere que el ajuste se ha realizado sobre un subconjunto ("split") de un corpus orientado a atencion al cliente. Se trata, no obstante, de una inferencia a partir de la nomenclatura, no de un dato confirmado en la informacion disponible.

El adaptador fue entrenado con la libreria Unsloth, que el autor destaca por un entrenamiento "2x mas rapido", y esta publicado bajo licencia Apache 2.0 con idioma declarado en ingles (en). En el momento de la consulta el repositorio acumula 0 descargas y 0 "likes", por lo que carece de validacion por parte de la comunidad. No se dispone de informacion sobre arquitectura interna del modelo base, longitud de contexto, datos de entrenamiento ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador (previsiblemente LoRA/PEFT) sobre `Qwen/Qwen3.5-2B`; arquitectura del modelo base no disponible |
| Parametros totales | Modelo base: ~2B segun nomenclatura; parametros del adaptador: no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (depende del modelo base; el adaptador puede combinarse con cuantizaciones del base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Se sabe que es un artefacto de ajuste fino que se apoya en el modelo base `Qwen/Qwen3.5-2B` y que se ha generado con la libreria Unsloth, orientada a acelerar y optimizar el entrenamiento y ajuste de modelos de lenguaje. El autor indica que el modelo "fue entrenado 2x mas rapido con Unsloth", lo que apunta a un pipeline de SFT (supervised fine-tuning) eficiente en memoria, probablemente mediante LoRA o QLoRA.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modos de razonamiento, etc.). La etiqueta `qwen3_5` y la referencia al modelo base indican la familia de origen, pero el README publicado se limita a la plantilla por defecto de Unsloth.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base y ajustada mediante SFT.
- Ajuste orientado, segun la nomenclatura del repositorio, a tareas de atencion al cliente (CS-SFT), aunque no se detalla en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles (en).
- Capacidades especiales (modo pensamiento, vision, audio): no disponibles.

## Casos de uso

- Atencion al cliente automatizada en ingles: el adaptador esta etiquetado como CS-SFT, por lo que su uso previsto apunta a respuestas de soporte; requeriria cargarse sobre el modelo base y validarse en un entorno controlado antes de produccion.
- Clasificacion y enrutado de consultas de soporte: al ser un ajuste sobre un modelo pequeno (2B), puede desplegarse para categorizar tickets o intenciones en ingles con coste reducido.
- Generacion de respuestas de primera linea: borradores de contestacion a preguntas frecuentes, siempre con supervision humana dado que no hay datos de evaluacion publicados.
- Prototipado e investigacion de tecnicas de SFT: util como ejemplo de adaptador entrenado con Unsloth para experimentar con cargas PEFT sobre un modelo base pequeno.
- Fine-tuning incremental: al ser un adaptador, puede servir como punto de partida para ajustes posteriores o para fusiones con otras variantes del mismo base.
- Despliegue en hardware limitado: al apoyarse en un modelo de ~2B, es candidato para entornos con GPU de gama media o incluso CPU, siempre que se valide su calidad.
- Evaluacion comparativa de checkpoints ("Split-01"): util para estudiar el efecto de distintos subconjuntos de datos de entrenamiento sobre el mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un adaptador sobre un modelo de ~2B, las necesidades dependen enteramente del modelo base y de su cuantizacion (orientativamente, unos pocos GB en cuantizaciones de 4-8 bits, estimacion no confirmada por el autor).
- GPU recomendadas: no especificadas. Un modelo base de ~2B es compatible en principio con GPU consumer, pero este dato no se confirma en la informacion proporcionada.
- Compatibilidad con GPU consumer: probable para el modelo base de ~2B, sin confirmacion del autor.
- Opciones de despliegue: la model card menciona compatibilidad con `transformers` y `text-generation-inference`; tambien aparece la etiqueta `unsloth`. No se documentan instrucciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen3.5-2B) | ~2B (base) + adaptador | no disponible | apache-2.0 | HuggingFace, 0 descargas | Adaptador SFT en ingles |
| Modelo base `Qwen/Qwen3.5-2B` | ~2B | no disponible | no disponible | HuggingFace | Origen del ajuste |
| Alternativas de ~2B (por ejemplo, familia Qwen3, Llama 3.2 o Gemma 2) | ~1-3B | variable | variable | HuggingFace | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar y cargar `Qwen/Qwen3.5-2B` (u otro base compatible) para funcionar.
- Ausencia total de validacion: 0 descargas y 0 "likes"; no hay evidencia de calidad ni de pruebas por terceros.
- Sin benchmarks publicados: no se puede acreditar su rendimiento en ninguna tarea.
- Idiomas limitados al ingles declarado; no hay soporte multilingue confirmado.
- Sesgos conocidos: no documentados.
- Riesgo de alucinacion: no evaluado; al ser un ajuste SFT sobre un modelo pequeno, el riesgo existe y no esta cuantificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero deben respetarse las condiciones de licencia del modelo base, que no se detallan en la informacion disponible.
- Fecha de creacion inusual (2026-10-02): conviene verificar la procedencia y el contenido real del repositorio antes de usarlo en produccion.
- Aviso de seguridad: la model card es la plantilla por defecto de Unsloth; no incluye informacion sobre datos de entrenamiento, procedencia ni posibles contenidos problematicos.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-Instantly-CS-SFT-Split-01-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Libreria de entrenamiento Unsloth: https://github.com/unslothai/unsloth
