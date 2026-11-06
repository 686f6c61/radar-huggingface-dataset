# Refauna/gemma-4-e2b-refauna-lora

## Resumen

Gemma 4 E2B · Refauna es un adaptador LoRA (QLoRA) entrenado sobre el modelo base `google/gemma-4-e2b-it`, desarrollado por la iniciativa Refauna para especializar un modelo pequeno de lenguaje en el dominio de la conservacion de la Mata Atlantica brasilena. El adaptador cubre tematicas concretas como la defaunacion, la refaunacion, la reintroduccion de fauna, la dispersion de semillas y las interacciones ecologicas, y esta disenado para trabajar de forma conjunta con un pipeline de generacion aumentada por recuperacion (RAG) que le proporciona fragmentos numerados de articulos cientificos que el modelo debe citar en formato `[n]`.

El modelo se presenta como un caso practico de especializacion de bajo coste: el entrenamiento se realizo con QLoRA de 4 bits, rango 16, durante 2 epocas sobre 942 ejemplos sinteticos en portugues de Brasil generados a partir de 22 articulos cientificos de Refauna, en una unica NVIDIA L4 durante 27,8 minutos con un pico de 10,57 GB de VRAM. El resultado es un adaptador de aproximadamente 0,1 GB que se distribuye bajo licencia Apache 2.0 y que solo soporta portugues y ingles.

Su relevancia actual reside en la combinacion de un modelo base pequeno (familia Gemma 4 E2B) con tecnicas de ajuste eficiente y RAG, un patron cada vez mas habitual para desplegar asistentes de dominio en entornos con recursos limitados. La model card reporta una evaluacion comparativa entre el modelo base, el modelo base con RAG, el modelo ajustado y el modelo ajustado con RAG, lo que permite valorar el efecto real del fine-tuning frente a la recuperacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Gemma 4 E2B |
| Parametros totales | No disponible (adaptador LoRA de ~0,1 GB; el modelo base no declara cifra en la informacion disponible) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | QLoRA 4-bit para entrenamiento; version GGUF Q4_K_M publicada para Ollama |
| Idiomas soportados | Portugues (Brasil) e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT); GGUF en el repositorio derivado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-e2b-it`, un transformer decoder-only de la familia Gemma 4 en su variante E2B, cargado a traves de `unsloth/gemma-4-E2B-it`. El ajuste se realizo con QLoRA de 4 bits, rango 16 y alpha 16, durante 2 epocas con tasa de aprendizaje 0,0002, aplicando las actualizaciones unicamente a las capas de lenguaje y usando la plantilla de chat `gemma-4` sin modo thinking. El entrenamiento completo se ejecuto en una NVIDIA L4 en 27,8 minutos, con un pico de 10,57 GB de VRAM.

El conjunto de datos consta de 942 ejemplos sinteticos en portugues de Brasil generados a partir de 22 articulos cientificos de Refauna, siguiendo el estilo RAFT: aproximadamente el 60 % de los ejemplos incluyen contexto con citas, un 15 % son ejemplos de abstencion y un 25 % carecen de contexto. Se aplico revision humana por muestreo y una particion por documento para evitar filtraciones entre entrenamiento y evaluacion. El pipeline RAG asociado emplea embeddings de `google/embeddinggemma-300m` combinados con BM25 mediante fusion RRF, recuperando los 4 fragmentos mas relevantes.

## Capacidades

- Generacion de texto conversacional en portugues de Brasil y en ingles, con registro didactico y preciso segun el system prompt definido.
- Respuesta fundamentada en contexto recuperado (RAG) con citas numeradas en formato `[n]` que remiten a los fragmentos proporcionados.
- Abstencion explicita cuando el contexto no contiene la respuesta, evitando inventar datos, numeros, fechas o nombres de especies.
- Cobertura de conceptos de ecologia de la conservacion: defaunacion, refaunacion, reintroduccion de fauna, dispersion de semillas e interacciones ecologicas.
- Conocimiento especifico sobre especies tratadas en la literatura de Refauna, como *Dasyprocta leporina*, *Alouatta guariba*, *Tapirus terrestris* y *Ara ararauna*, entre otras.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistente divulgativo para el publico general: desplegado con el pipeline RAG descrito, responde preguntas sobre refaunacion en la Mata Atlantica citando los articulos de Refauna, lo que permite ofrecer informacion trazable a visitantes y seguidores del proyecto.
- Apoyo a investigadores en revision bibliografica: el modelo localiza y cita pasajes concretos de los 22 articulos indexados, acelerando la busqueda de referencias sobre dispersion de semillas o reintroduccion de especies.
- Herramienta educativa en aulas y talleres: su formato de respuesta claro y didactico y su capacidad de abstencion lo hacen adecuado para explicar conceptos de ecologia de la restauracion sin riesgo de fabricar datos cuando falta contexto.
- Generacion de material de divulgacion cientifica: redaccion de resumenes y respuestas breves sobre proyectos de conservacion a partir de los fragmentos recuperados, con citas verificables para su revision editorial.
- Chatbot de atencion a visitantes o donantes de la iniciativa: responde preguntas frecuentes sobre especies reintroducidas y objetivos del proyecto, apoyandose en el contexto documental para mantener la fidelidad.
- Prototipado de asistentes de dominio con recursos limitados: sirve como referencia de flujo completo (QLoRA + Unsloth + RAG hibrido + GGUF para Ollama) replicable en otros dominios cientificos con presupuesto de computo reducido.
- Despliegue local en equipos de campo o portatiles: la version GGUF Q4_K_M permite ejecutar el modelo con Ollama en Mac, Linux y Windows sin infraestructura de GPU dedicada en servidor.

## Benchmarks y rendimiento

La model card reporta una evaluacion con notas de 1 a 5 asignadas por un juez LLM sobre cuatro configuraciones: A (base), B (base + RAG), C (fine-tuned) y D (fine-tuned + RAG).

| Configuracion | Correccion | Fidelidad | Citacion correcta | Abstencion correcta | PT-BR |
|---|---|---|---|---|---|
| A: base | 1,12 | No disponible | No disponible | No disponible | 1,00 |
| B: base + RAG | 2,47 | 4,35 | 0,52 | 0,88 | 1,00 |
| C: fine-tuned | 2,17 | No disponible | No disponible | No disponible | 1,00 |
| D: fine-tuned + RAG | 2,29 | 4,17 | 0,52 | 0,88 | 1,00 |

Recuperacion hibrida sobre el conjunto de test (n=74): Recall@4 = 0,42 y MRR@20 = 0,30.

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: una NVIDIA L4 con un pico de 10,57 GB de VRAM para QLoRA 4-bit con rango 16 sobre el modelo base; el proceso completo duro 27,8 minutos.
- Inferencia con el adaptador en precision completa o semi: requiere cargar el modelo base Gemma 4 E2B, por lo que la VRAM depende de la cuantizacion elegida; no se especifica en la informacion disponible.
- Inferencia con la version GGUF Q4_K_M: pensada para ejecutarse con Ollama en Mac, Linux y Windows, lo que sugiere viabilidad en equipos consumer, aunque no se detallan requisitos minimos de RAM o GPU.
- GPU recomendadas: NVIDIA L4 para entrenamiento; para inferencia no se documentan modelos concretos de GPU mas alla de la disponibilidad de la variante GGUF.
- Opciones de despliegue: Ollama mediante `ollama run hf.co/Refauna/gemma-4-e2b-refauna-GGUF:Q4_K_M`; Transformers mediante `pipeline("text-generation", model="Refauna/gemma-4-e2b-refauna")`; PEFT para cargar el adaptador sobre el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B · Refauna (este modelo) | Adaptador LoRA sobre Gemma 4 E2B | No disponible | Especializacion en conservacion de la Mata Atlantica con RAG y citas | Apache 2.0 | Hugging Face (adaptador y GGUF) |
| google/gemma-4-e2b-it (modelo base) | No disponible | No disponible | Modelo generalista instruction-tuned | Apache 2.0 | Hugging Face |
| Modelos de dominio sin fine-tuning con RAG | Variable | Variable | Recuperacion sobre corpus cientifico sin ajuste | Variable | Variable |

No se dispone de datos de benchmarks comparativos con modelos alternativos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Uso previsto educativo y de divulgacion cientifica; no sustituye a la literatura original, que debe consultarse siempre a traves de las fuentes citadas.
- Sin RAG, el modelo puede equivocarse en numeros, fechas y nombres de especies, segun advierte el propio autor.
- El conocimiento esta restringido a los 22 articulos utilizados en el entrenamiento y no cubre la totalidad del trabajo de Refauna.
- La evaluacion se realizo con un juez LLM sobre conjuntos sinteticos y un test de recuperacion de solo 74 casos, lo que limita la generalizacion de las metricas.
- El Recall@4 de la recuperacion hibrida es 0,42, de modo que en mas de la mitad de las consultas el fragmento correcto puede no estar entre los cuatro recuperados, afectando a la calidad de las respuestas con RAG.
- Idioma limitado a portugues de Brasil e ingles; no se documenta soporte para otras lenguas, incluido el espanol.
- No se documentan sesgos especificos, pero al derivar de un modelo generalista y de un corpus cientifico acotado puede heredar sesgos del modelo base y del dominio.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribucion de las fuentes cientificas citadas en la model card.
- No se documentan capacidades de tool calling, agentes o vision, por lo que no debe asumirse su disponibilidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Refauna/gemma-4-e2b-refauna-lora
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Version base cargada via Unsloth: https://huggingface.co/unsloth/gemma-4-E2B-it
- Repositorio GGUF para Ollama: https://huggingface.co/Refauna/gemma-4-e2b-refauna-GGUF
- Iniciativa Refauna: https://refauna.org.br
- Articulo sobre prevencion de lesiones por collares de radiotelemetria en *Dasyprocta leporina* (2013): https://doi.org/10.1590/S1984-46702013000100015
- Exito a corto plazo en la reintroduccion de *Dasyprocta leporina* (2014): https://doi.org/10.1177/194008291400700415
- Consumo de carrona por *Dasyprocta leporina* (2014): https://doi.org/10.1590/bjb.2014.0087
- Extincion local de un dispersor y distribucion de *Astrocaryum aculeatissimum* (2015): https://doi.org/10.1590/0102-33062015abb0008
- Credito de interacciones ecologicas (2017): https://doi.org/10.1002/ece3.2746
- Rewilding the Atlantic Forest (2017): https://doi.org/10.1016/j.pecon.2017.09.004
- Crecimiento poblacional no asistido de *Dasyprocta leporina* (2018): https://doi.org/10.1017/S0030605316001149
- Restauracion de poblaciones de *Alouatta guariba* (2024): https://doi.org/10.3389/fcosc.2024.1401749
- Recuperacion de patrones de actividad en tapires reintroducidos (2025): https://doi.org/10.1017/S0030605325102494
