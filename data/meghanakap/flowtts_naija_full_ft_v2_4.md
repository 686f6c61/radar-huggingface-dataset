# MeghanaKap/flowtts_naija_full_ft_v2_4

## Resumen

flowtts_naija_full_ft_v2_4 es un modelo de generacion de texto de 505.882.368 parametros, publicado por MeghanaKap bajo licencia Apache-2.0. Las etiquetas del repositorio indican una arquitectura Qwen2 y el pipeline text-generation, y el modelo se presenta como un fine-tuning del checkpoint YatharthS/MiraTTS. Su tamano reducido lo situa en la categoria de modelos ligeros, aptos para despliegue en entornos con pocos recursos.

El entrenamiento se realizo mediante Supervised Fine-Tuning (SFT) con la libreria TRL y se uso Unsloth para acelerar el proceso, con una reduccion del tiempo de entrenamiento reportada como "2x faster" en la model card. No se proporcionan datos sobre los tokens de entrenamiento, la composicion del dataset ni tecnicas de alineacion adicionales. El nombre del modelo sugiere una posible especializacion en sintesis de voz (flowtts) o en ingles nigeriano (naija), pero la metadata no confirma estas capacidades.

La ficha es minima y carece de benchmarks publicados, por lo que cualquier uso realista debe implicar una validacion propia. Es una opcion interesante para prototipos rapidos y aplicaciones de bajo coste, siempre que se acepten las limitaciones documentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (segun tags); modelo base declarado: YatharthS/MiraTTS |
| Parametros totales | 505.882.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Ingles (etiqueta "en") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Segun las etiquetas del repositorio, el modelo utiliza la arquitectura Qwen2, con un total de 505.882.368 parametros. No se indica si emplea arquitectura MoE, por lo que se asume un Transformer denso. El modelo base declarado es YatharthS/MiraTTS, lo que genera una inconsistencia notable: la ficha afirma que es un modelo "qwen2", pero el campo base_model apunta a un checkpoint cuyo origen y caracteristicas no estan documentados en la informacion disponible.

El entrenamiento se realizo mediante Supervised Fine-Tuning (SFT) con la libreria TRL y se utilizo Unsloth para acelerar el proceso, con una reduccion del tiempo de entrenamiento reportada como "2x faster". No se proporcionan detalles sobre los datos de entrenamiento, el numero de tokens, la mezcla de datasets ni procesos de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y su pipeline es de generacion de texto.
- Compatibilidad con text-generation-inference (TGI), lo que permite su uso con el servidor de inferencia de Hugging Face.
- Entrenado con SFT y Unsloth, lo que sugiere una adaptacion a un dominio o tarea concreta, aunque no se especifica cual.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento iterativo, vision, audio ni capacidades multilingues mas alla de ingles.

## Casos de uso

Dado el limitado tamano del modelo y la ausencia de benchmarks publicos, los siguientes casos de uso se plantean como aplicaciones tecnicamente plausibles derivadas de sus caracteristicas, no como capacidades confirmadas:

- Asistentes conversacionales de bajo coste: un modelo de ~506M puede responder preguntas sencillas y mantener conversaciones basicas. Puede desplegarse en una CPU moderna con 2-4 GB de RAM o en una GPU modesta.
- Chatbots de atencion al cliente en entornos de prueba: su licencia Apache-2.0 permite uso comercial sin restricciones, lo que facilita la creacion de prototipos y pruebas internas.
- Aplicaciones moviles o dispositivos edge: el modelo cabe en dispositivos con 1-2 GB de memoria, como smartphones o plataformas tipo Raspberry Pi, mediante inferencia en CPU con frameworks compatibles.
- Fine-tuning posterior para dominios especificos: al ser un modelo ligero, puede reentrenarse con pocos recursos para adaptarlo a tareas concretas como resumen, clasificacion de texto o extraccion de entidades.
- Soporte en pipelines de datos internos: para clasificacion o etiquetado automatico de texto en procesos ETL, donde la latencia no es critica y se prioriza el bajo coste.
- Evaluacion academica de metodos SFT con Unsloth: este modelo puede servir como caso de estudio en trabajos sobre aceleracion de fine-tuning, gracias a su pequeno tamano y a la documentacion de la tecnica utilizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Precision fp32: aproximadamente 2,0 GB (505.882.368 parametros x 4 bytes).
  - Precision fp16/bf16: aproximadamente 1,0 GB.
  - Cuantizacion 8-bit: aproximadamente 0,5 GB.
  - Cuantizacion 4-bit: aproximadamente 0,25 GB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (p. ej. Nvidia GeForce GTX 1650, RTX 2060 o superior). Tambien funciona en CPU con 4 GB de RAM.
- Capacidad en consumer GPU: si, cabe en la mayoria de GPUs domesticas.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (previa adaptacion), Ollama (previa conversion a GGUF), llama.cpp (previa conversion a GGUF).
- Latencia y throughput: no disponible; dependera del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| flowtts_naija_full_ft_v2_4 | 505.882.368 | No disponible | Apache-2.0 | No publicados | Hugging Face, safetensors |
| Qwen2-0.5B | ~494M | 32K (segun documentacion oficial) | Apache-2.0 | Publicados | Hugging Face |
| Qwen2.5-0.5B | ~494M | 32K (segun documentacion oficial) | Apache-2.0 | Publicados | Hugging Face |
| TinyLlama-1.1B | ~1,1B | 2K | Apache-2.0 | Publicados | Hugging Face |
| SmolLM-135M | ~135M | 2K | Apache-2.0 | Publicados | Hugging Face |

Nota: la comparativa se basa en especificaciones publicas de los modelos de referencia, no en pruebas realizadas con este modelo. La no disponibilidad de la longitud de contexto en este modelo impide una comparacion directa.

## Limitaciones y advertencias

- Documentacion minima: la model card no incluye informacion sobre datos de entrenamiento, sesgos, alucinaciones ni casos de uso recomendados. Cualquier adopcion en produccion debe ir precedida de una evaluacion propia.
- Inconsistencia en la metadata: el modelo se etiqueta como "qwen2", pero el campo base_model apunta a YatharthS/MiraTTS, un checkpoint que no aparece en los resultados de busqueda web. No se puede verificar la naturaleza del modelo base.
- Nombre del modelo sugiere TTS o ingles nigeriano: sin embargo, el pipeline registrado es text-generation y no se especifica el dominio de especializacion. Esto puede llevar a expectativas incorrectas.
- Longitud de contexto desconocida: el campo no aparece en la ficha. Si se utiliza en tareas que requieren contexto largo, hay que validarlo empiricamente.
- Sin benchmarks publicados: no existe evidencia de rendimiento en tareas estandar como MMLU, GSM8K o HumanEval.
- Riesgo de alucinacion: al ser un modelo pequeno y sin documentacion de alineacion, el riesgo de respuestas incorrectas o alucinaciones en tareas de razonamiento es mayor que en modelos de mayor tamano.
- Restricciones de licencia: la licencia Apache-2.0 es permisiva, pero implica mantener el aviso de copyright y patente; no hay restriccion de uso comercial.
- Fecha de creacion futura: la fecha registrada (2026-09-08) es posterior a la fecha de esta consulta; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MeghanaKap/flowtts_naija_full_ft_v2_4
- Version anterior (v2_2): https://huggingface.co/MeghanaKap/flowtts_naija_full_ft_v2_2
- Proyecto Unsloth (usado en el entrenamiento): https://github.com/unslothai/unsloth
- Libreria TRL (usada en SFT): https://github.com/huggingface/trl
