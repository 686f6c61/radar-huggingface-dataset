# Koko12345p/dolphin-cyber-arabic

## Resumen

`Koko12345p/dolphin-cyber-arabic` es un ajuste fino (fine-tune) supervisado del modelo `cognitivecomputations/Dolphin3.0-Qwen2.5-1.5B`, que a su vez deriva de la familia Qwen2.5 en su variante de 1,5 mil millones de parametros. Lo publica el usuario Koko12345p en HuggingFace y esta entrenado con la libreria TRL (version 1.13.0) mediante SFT (supervised fine-tuning). El repositorio se creo el 19 de septiembre de 2026 y ocupa 0,3 GB.

El problema que pretende resolver no esta documentado: el nombre sugiere un enfoque hacia ciberseguridad y arabe, pero la model card no describe el dataset, el idioma objetivo ni el proposito del ajuste. No se declaran licencia, idiomas soportados, pipeline ni resultados de evaluacion.

Su relevancia actual es limitada: cero descargas y cero "likes" en el momento de la consulta, ausencia total de documentacion tecnica y una licencia sin especificar. Resulta util como ejemplo de flujo de trabajo de SFT con TRL sobre un modelo pequeno, pero no como artefacto listo para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (heredada del modelo base) |
| Parametros totales | Aproximadamente 1,5 mil millones (heredado del modelo base Qwen2.5-1.5B) |
| Longitud de contexto | 32.768 tokens en el modelo base; no confirmado para este ajuste |
| Tipos de cuantizacion | No se publican pesos GGUF, GPTQ ni AWQ. Es posible convertir a GGUF (llama.cpp), bitsandbytes (int8/int4), GPTQ y AWQ |
| Idiomas soportados | No disponibles (el nombre del modelo sugiere arabe, sin confirmar en la model card) |
| Licencia | No disponible. La model card solo indica "licence: license", sin texto legal. El modelo base Qwen2.5-1.5B se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Tarea (pipeline) | No disponible |
| Fecha de creacion | 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base: un transformer decoder-only denso de la familia Qwen2, con atencion de consultas agrupadas (GQA) y normalizacion RMSNorm, en su variante de 1,5 mil millones de parametros. El ajuste no introduce modificaciones estructurales; se trata de un fine-tune completo o parcial (no se especifica si se uso LoRA/QLoRA o entrenamiento completo) aplicado sobre los pesos del modelo base.

El unico dato tecnico verificable del entrenamiento es que se realizo mediante SFT con TRL 1.13.0, sobre Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2. No se publica el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas, la presencia de datos de ciberseguridad o arabe, ni si hubo una fase posterior de RLHF o DPO. Tampoco se documentan hiperparametros, epocas ni estrategia de enmascarado de perdida. El modelo base Dolphin 3.0 es conocido por aplicar un ajuste orientado a reducir rechazos y filtros de contenido, pero ese comportamiento se hereda del modelo del que parte y no esta verificado en esta variante concreta.

## Capacidades

- Generacion de texto conversacional a partir de un historial de mensajes con roles (`user`/`assistant`), tal y como muestra el ejemplo de la model card.
- Razonamiento basico y respuesta a preguntas abiertas, limitado por el tamano de 1,5 mil millones de parametros.
- Generacion de codigo: capacidad heredada de Qwen2.5, sin evaluacion especifica publicada para este ajuste.
- Matematicas sencillas: capacidad heredada del modelo base, sin datos de evaluacion.
- Soporte de tool calling / function calling: no documentado; el modelo base Qwen2.5 soporta plantillas de llamada a herramientas, pero no hay confirmacion de que se hayan preservado tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas. El nombre sugiere orientacion al arabe, sin evidencia en la model card.
- Modo "thinking" explicito, vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Ajuste orientado a contenido sin censura: probable por herencia de la familia Dolphin, no confirmado en este repositorio.

## Casos de uso

- Prototipado de asistentes conversacionales en entornos de investigacion: el modelo puede desplegarse en una GPU de gama media para validar plantillas de prompt e interfaces de chat sin coste de API, gracias a su tamano de 1,5 B de parametros.
- Experimentos academicos de SFT con TRL: sirve como referencia reproducible de un pipeline `hf_jobs` + TRL sobre un modelo pequeno, comparando el comportamiento antes y despues del ajuste.
- Evaluacion comparativa de fine-tunes de bajo coste: util para medir cuanto puede degradarse un modelo base de 1,5 B al ser ajustado con un dataset no documentado.
- Generacion de texto en local y sin conexion: con una cuantizacion int4 puede ejecutarse en portatiles con GPU de 4-6 GB o en Apple Silicon, lo que permite procesar texto sensible sin enviarlo a servicios externos.
- Clasificacion y extraccion de informacion sobre texto: con plantillas adecuadas puede etiquetar fragmentos o extraer campos en tareas de procesamiento de lenguaje natural de baja complejidad.
- Base para un ajuste posterior especifico de dominio: al ser un fine-tune pequeno con licencia indeterminada, resulta adecuado solo como punto de partida experimental, nunca como componente de un producto que requiera garantias legales.
- Educacion y demostraciones sobre riesgo de modelos no documentados: permite ilustrar en clase o en un articulo por que la ausencia de model card, licencia y evaluacion es un factor de riesgo critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan comparaciones con el modelo base. Los resultados de busqueda web facilitados no contienen informacion relevante sobre el modelo (corresponden a herramientas de conversion de PDF a Word), por lo que no se pueden incorporar datos externos.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,1 GB solo para los pesos, mas cache KV y activaciones; en la practica se recomienda reservar 4-5 GB.
- VRAM estimada en INT8: alrededor de 1,6 GB de pesos, con 2,5-3 GB totales.
- VRAM estimada en INT4 (por ejemplo Q4_K_M en GGUF): aproximadamente 1,0-1,2 GB de pesos, con 1,5-2 GB totales.
- Cache KV: segun la configuracion del modelo base Qwen2.5-1.5B (28 capas, 2 cabezas KV, dimension de cabeza 128), a 32.768 tokens en FP16 la cache ocupa del orden de 0,9 GB. Reducir el contexto es la forma mas directa de bajar el consumo total.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 8 GB o superiores para FP16; cualquier GPU con 8 GB o mas funciona con holgura. Para INT4 basta una GTX 1650 4 GB o una RTX 3050 6 GB. En centro de datos, A100, H100 o L40S estan sobredimensionadas para este tamano y solo se justifican por agregacion de peticiones.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas de 4 GB o mas, y tambien en Apple Silicon unificado a partir de 8 GB de memoria.
- Opciones de despliegue: `transformers` con el pipeline de generacion de texto; vLLM o SGLang para servicio de alto rendimiento; TGI; llama.cpp u Ollama tras convertir los pesos a GGUF; ejecucion en CPU viable en cuantizacion int4.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni configuracion de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dolphin-cyber-arabic (este modelo) | ~1,5 B | No confirmado (32.768 en el base) | No disponible | safetensors, 0 descargas | Sin documentacion ni evaluacion |
| cognitivecomputations/Dolphin3.0-Qwen2.5-1.5B (modelo base) | ~1,5 B | 32.768 tokens | Heredada de Qwen2.5 (Apache-2.0) | safetensors | Modelo de partida; documentacion mas completa |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens, ampliable con YaRN | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ | Referencia de la familia; soporte de tool calling y multilingue |
| Llama-3.2-1B-Instruct | ~1,24 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | safetensors, GGUF | Contexto mucho mayor; licencia con restricciones |
| SmolLM2-1.7B-Instruct | ~1,71 B | 8.192 tokens | Apache-2.0 | safetensors, GGUF | Alternativa abierta con buen soporte de cuantizacion |

Los valores de los modelos de referencia proceden de su documentacion publica y deben verificarse antes de tomar decisiones de ingenieria. Para este modelo concreto no hay datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no existen benchmarks, pruebas de regresion ni evaluaciones humanas publicadas. Cualquier uso en produccion exige una evaluacion propia previa.
- Licencia indeterminada: la model card indica "licence: license", que no es una licencia valida. No se puede asumir uso comercial permitido aunque el modelo base sea Apache-2.0; la licencia del ajuste es responsabilidad del autor y no esta declarada.
- Dataset de entrenamiento desconocido: no se documentan los datos usados, por lo que no se puede evaluar el riesgo de sesgos, la presencia de contenido toxico ni la calidad del corpus en arabe o en ciberseguridad.
- Riesgo elevado de alucinacion: con 1,5 B de parametros, el modelo es propenso a inventar datos facticos, citas y referencias, especialmente en tareas de conocimiento especializado.
- Ambiguedad de idioma: el nombre sugiere arabe, pero no hay confirmacion. El rendimiento real en arabe, castellano u otros idiomas es desconocido y probablemente inferior al del modelo base en tareas multilingues.
- Sin modo de razonamiento explicito: no se documenta thinking mode, por lo que en tareas de razonamiento multi-paso la calidad sera limitada incluso comparada con modelos del mismo tamano.
- Inconsistencia en el tamano del repositorio: 0,3 GB es un valor bajo para 1,5 B de parametros en BF16 (que ocuparian aproximadamente 3,1 GB). Conviene verificar que el repositorio contiene el conjunto completo de shards antes de descargarlo o desplegarlo.
- Fechas de publicacion en el futuro (2026) en los metadatos de HuggingFace: conviene comprobar la integridad y procedencia del repositorio.
- Reputacion del autor: cero descargas y cero "likes" implican que el modelo no ha sido revisado por la comunidad.
- No apto para decisiones automatizadas de alto riesgo (medicas, legales, financieras o de seguridad) sin supervision humana y validacion exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Koko12345p/dolphin-cyber-arabic
- Modelo base: https://huggingface.co/cognitivecomputations/Dolphin3.0-Qwen2.5-1.5B
- Repositorio de TRL: https://github.com/huggingface/trl

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo; los enlaces obtenidos correspondian a servicios de conversion de PDF a Word y se han descartado por no ser pertinentes.
