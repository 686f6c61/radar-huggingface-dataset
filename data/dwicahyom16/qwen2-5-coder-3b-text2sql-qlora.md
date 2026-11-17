# dwicahyom16/qwen2.5-coder-3b-text2sql-qlora

## Resumen

`dwicahyom16/qwen2.5-coder-3b-text2sql-qlora` es un ajuste fino (fine-tuning) del modelo `unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit`, publicado por el usuario dwicahyom16 en Hugging Face. El objetivo declarado en el nombre del repositorio es la conversion de lenguaje natural a SQL (text2sql), aunque la model card no documenta el conjunto de datos de entrenamiento ni el dominio concreto sobre el que se ha especializado. Se trata de un modelo derivado de la familia Qwen2.5-Coder de Alibaba, de 3.000 millones de parametros y orientado originalmente a tareas de codigo.

El ajuste se ha realizado mediante SFT (supervised fine-tuning) con la libreria TRL, partiendo de una version cuantizada en 4 bits (bnb-4bit) preparada por Unsloth, lo que indica un flujo de entrenamiento QLoRA sobre GPU de consumo. El repositorio ocupa 0,7 GB, coherente con pesos en precision reducida o adaptadores fusionados sobre una base de 3B.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo comunitario de nicho, sin descargas ni validacion publica, util unicamente como referencia para quien quiera reproducir un pipeline de text2sql con QLoRA sobre Qwen2.5-Coder-3B. No dispone de benchmarks, licencia declarada ni documentacion de datos, por lo que su uso en produccion exige validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-3B-Instruct); no documentada en la model card |
| Parametros totales | 3.000 millones (aproximado, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-Coder-3B soporta hasta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | Base entrenada en bnb-4bit; pesos publicados en safetensors; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0,7 GB |
| Framework de entrenamiento | TRL 1.15.0, Transformers 5.17.0, PyTorch 2.11.0+cu130, Datasets 4.8.5, Tokenizers 0.23.3 |
| Metodo de ajuste | SFT con QLoRA (segun tags y nombre del repositorio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen2.5-Coder-3B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), disenado por Alibaba para tareas de generacion de codigo. Sobre esta base, el autor ha aplicado un ajuste supervisado (SFT) utilizando TRL, partiendo de la version cuantizada en 4 bits de Unsloth, lo que sugiere un entrenamiento tipo QLoRA con adaptadores de bajo rango fusionados posteriormente en los pesos publicados.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni hiperparametros del ajuste. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). El unico dato verificable es el stack de entrenamiento (TRL 1.15.0, Transformers 5.17.0, PyTorch 2.11.0+cu130) y el hecho de que el ajuste se realizo sobre una base ya cuantizada en 4 bits, lo que implica una perdida de precision adicional respecto al modelo original en fp16/bf16.

## Capacidades

- Generacion de texto y codigo, heredadas del modelo base Qwen2.5-Coder-3B-Instruct.
- Conversion de lenguaje natural a SQL (text2sql), objetivo declarado del ajuste, aunque sin datos publicos de evaluacion.
- Razonamiento basico sobre esquemas de bases de datos, presumiblemente adquirido durante el SFT (no verificado).
- Soporte de conversacion multi-turno mediante el formato de chat de Qwen2.5 (la model card incluye un ejemplo con `pipeline` y mensajes con rol `user`).
- Tool calling / function calling: no documentado para este ajuste; el modelo base Qwen2.5-Coder-Instruct lo soporta, pero no se confirma su preservacion tras el fine-tuning.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado de asistentes text2sql sobre esquemas pequenos: el modelo puede recibir un esquema de tabla y una pregunta en lenguaje natural y generar una consulta SQL, adecuado para demos internas y validacion de viabilidad antes de invertir en modelos mayores.
- Generacion de consultas de analitica ad-hoc: util para construir un bot interno que traduzca preguntas de negocio a SQL sobre un data warehouse, siempre con revision humana de las consultas generadas.
- Educacion y formacion en SQL: puede emplearse como generador de ejemplos de consultas a partir de descripciones en lenguaje natural, con la ventaja de su bajo requisito de hardware.
- Pipeline de aumento de datos: generar pares pregunta-SQL sinteticos para entrenar o evaluar otros modelos text2sql, dado el bajo coste de inferencia de un modelo de 3B.
- Despliegue en entornos con GPU de consumo: al caber en GPUs de 8-12 GB en cuantizacion 4 bits, sirve para pruebas locales de integracion con frameworks como LangChain o LlamaIndex.
- Base para nuevos ajustes QLoRA: el repositorio sirve como punto de partida reproducible (stack TRL + Unsloth) para quien quiera especializar Qwen2.5-Coder-3B en un dominio SQL concreto.
- Evaluacion comparativa de tecnicas QLoRA: util como caso de estudio de hasta donde llega un ajuste de 3B en 4 bits frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ejecucion exacta (execution accuracy), MMLU, HumanEval ni ninguna otra evaluacion, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en cuantizacion 4 bits (pesos de 3B a ~4 bits), 6-7 GB en fp16/bf16.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para cuantizacion 4 bits (RTX 3060 Ti, RTX 4060, RTX 4070); A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs integradas con suficiente memoria unificada (Apple Silicon, por ejemplo).
- Opciones de despliegue: transformers (pipeline de generacion, como indica la model card), vLLM, llama.cpp/Ollama (previa conversion a GGUF), TGI.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dwicahyom16/qwen2.5-coder-3b-text2sql-qlora | 3B | no disponible | text2sql (SFT QLoRA) | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-Coder-3B-Instruct (base) | 3B | 32.768 tokens (segun documentacion de Alibaba) | codigo general | Apache 2.0 (segun documentacion de Alibaba) | Hugging Face, ampliamente usado |
| Defog SQLCoder-7B | 7B | 4.096 tokens (segun documentacion del autor) | text2sql | CC BY-SA 4.0 (segun documentacion del autor) | Hugging Face |
| CodeLlama-7B-Instruct | 7B | 16.384 tokens (segun documentacion de Meta) | codigo general | Llama 2 Community License | Hugging Face |

La comparativa es orientativa: no existen datos publicos de rendimiento del modelo ajustado que permitan situarlo frente a SQLCoder o al Qwen2.5-Coder-3B-Instruct original en tareas text2sql.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de que el ajuste mejore al modelo base en text2sql; podria incluso degradarlo por sobreajuste a un dataset no documentado.
- Licencia no declarada: la model card contiene un campo `licence: license` sin contenido, lo que impide determinar si el uso comercial esta permitido. El modelo base Qwen2.5-Coder es Apache 2.0, pero el ajuste no hereda automaticamente esa licencia de forma clara.
- Dataset de entrenamiento desconocido: se desconoce el dominio, el volumen y la calidad de los datos usados en el SFT, lo que impide evaluar sesgos y cobertura.
- Entrenamiento sobre base cuantizada en 4 bits: la cuantizacion previa al ajuste introduce perdida de precision respecto al modelo original en bf16.
- Riesgo de alucinacion en SQL: como todo modelo generativo, puede producir consultas sintacticamente validas pero semanticamente incorrectas, con riesgo de borrado o modificacion de datos si se ejecutan sin revision.
- Idiomas no documentados: no se confirma el soporte multilingue; el modelo base esta orientado principalmente a ingles y chino.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentacion de terceros.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, no se verifica que el ajuste preserve esa ventana.
- Tool calling no confirmado: el fine-tuning puede haber degradado la capacidad de function calling del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dwicahyom16/qwen2.5-coder-3b-text2sql-qlora
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de Qwen2.5-Coder (Alibaba): no disponible en la informacion proporcionada
- Paper o blog del ajuste: no disponible
