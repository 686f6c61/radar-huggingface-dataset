# M1ztyk/SAIGE-dpo-v4-run5

## Resumen

SAIGE-dpo-v4-run5 es un ajuste fino del modelo Qwen/Qwen2.5-3B-Instruct publicado por el usuario M1ztyk en HuggingFace. Se trata de un modelo de lenguaje causal de 3.090 millones de parametros (3,09 B) alineado mediante DPO (Direct Preference Optimization), una tecnica de optimizacion por preferencias que prescinde de un modelo de recompensa explicito y optimiza directamente la politica sobre pares (respuesta preferida, respuesta rechazada). El entrenamiento se ha realizado con la libreria TRL (version 1.13.0) sobre Transformers 5.17.0 y PyTorch 2.14.0, y el repositorio se limita a pesos en formato safetensors con un tamano total de 0,3 GB.

El modelo hereda la arquitectura de Qwen2.5-3B-Instruct: un transformer decoder-only con Grouped Query Attention (GQA), 36 capas, atencion con 16 cabezas de consulta y 2 cabezas de clave/valor, y una longitud de contexto nativa de 32.768 tokens ampliable a 131.072 mediante escalado RoPE tipo YaRN. Al derivar de un modelo instruct, el punto de partida ya incorpora ajuste por instrucciones y alineacion previa; el aporte de este repositorio es una capa adicional de preferencias obtenida por DPO.

Su relevancia practica es limitada a dia de hoy: el repositorio acumula 0 descargas y 0 likes, no declara licencia concreta, no documenta idiomas ni dataset de preferencias, y la model card no publica resultados de evaluacion. Debe considerarse por tanto un artefacto de investigacion o un experimento reproducible (run5) mas que un modelo listo para produccion, util para quien quiera inspeccionar el efecto de DPO sobre Qwen2.5-3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con Grouped Query Attention (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.090 millones (3,09 B), heredados del modelo base |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativo, hasta 131.072 con YaRN en el modelo base; no confirmada especificamente para este fine-tune |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite GGUF, AWQ, GPTQ y bitsandbytes (NF4/INT8) |
| Idiomas soportados | no disponibles en la model card; el modelo base Qwen2.5-3B-Instruct soporta mas de 29 idiomas, incluidos espanol, ingles, chino, frances y aleman |
| Licencia | no disponible (la model card indica "licence: license" sin especificar; se heredan las condiciones del modelo base Qwen2.5-3B-Instruct, que deben consultarse) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU en el bloque MLP, embeddings de tokens y de posicion (RoPE), y atencion con GQA para reducir el coste del cache KV durante la inferencia. El modelo base fue preentrenado sobre aproximadamente 18 billones de tokens con un corpus multilingue y posteriormente ajustado por instrucciones. Este repositorio no modifica esa arquitectura: solo altera los pesos mediante una etapa adicional de preferencias.

El metodo de ajuste es DPO, descrito en el articulo "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (Rafailov et al., NeurIPS 2023) y aplicado con TRL 1.13.0. DPO reformula el problema de RLHF como una perdida de clasificacion sobre pares de respuestas, evitando entrenar un modelo de recompensa separado y el muestreo de una politica RL en linea. La model card no especifica el dataset de preferencias utilizado, el numero de pasos, la tasa de aprendizaje, el coeficiente beta de DPO ni si se empleo LoRA/QLoRA o ajuste completo; tampoco documenta el numero de tokens vistos durante esta etapa. Esta ausencia de hiperparametros impide reproducir el entrenamiento o juzgar su estabilidad.

## Capacidades

- Generacion de texto conversacional en formato chat, ya que el pipeline de ejemplo utiliza mensajes con rol de usuario.
- Razonamiento basico y respuesta a preguntas de tipo abierto, segun el ejemplo de la model card (pregunta hipotetica sobre viajes en el tiempo).
- Capacidades heredadas del modelo base Qwen2.5-3B-Instruct: generacion de codigo, matematicas elementales, resumen, traduccion y comprension lectora en registro multilingue.
- Soporte de plantillas de chat con `apply_chat_template` y compatibilidad con `text-generation` de Transformers.
- Compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No hay evidencia en la documentacion disponible de soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido. Aunque el modelo base Qwen2.5-3B-Instruct soporta function calling, este fine-tune no lo documenta ni lo valida.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: con 3,09 B de parametros y pesos en safetensors de 0,3 GB, el modelo se puede cargar en una GPU de gama media o incluso en CPU con cuantizacion, lo que lo hace util para validar una interfaz de chat antes de escalar a un modelo mayor.
- Evaluacion comparativa del efecto de DPO: sirve como punto de comparacion frente a Qwen2.5-3B-Instruct sin ajustar para estudiar cambios en estilo, longitud y adherencia a preferencias en un mismo prompt.
- Generacion de texto asistida en local: escenarios con requisitos de privacidad donde no se puede enviar texto a una API externa, desplegando el modelo con llama.cpp u Ollama en una estacion de trabajo.
- Redaccion y reescritura de borradores: tareas de resumen, reformulacion y cambio de tono sobre textos cortos, aprovechando la ventana de 32.768 tokens del modelo base para documentos de extension media.
- Clasificacion y etiquetado por prompt: uso del modelo como anotador zero-shot o few-shot en tareas internas (categoria de ticket, sentimiento, extraccion de campos) sin entrenamiento adicional.
- Experimentacion academica en alineacion: base para reproducir estudios sobre DPO, comparar variantes (run5 frente a otros runs del mismo autor) y medir deriva respecto al modelo original.
- Generacion de codigo en entornos educativos: apoyo a estudiantes con explicaciones y fragmentos de codigo, asumiendo verificacion manual, dado que no hay benchmarks publicados que respalden su fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de M1ztyk/SAIGE-dpo-v4-run5 no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco se han encontrado evaluaciones en los resultados de busqueda web proporcionados (que no guardan relacion con el modelo). No es posible, por tanto, cuantificar la mejora o el deterioro respecto a Qwen/Qwen2.5-3B-Instruct.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 6,2 GB solo de pesos, mas el cache KV; con contexto largo (32.768 tokens) el consumo total puede situarse entre 10 y 14 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,5-4 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M): aproximadamente 2,0-2,5 GB de pesos, con un total tipico de 4-6 GB incluyendo cache.
- GPU compatibles: NVIDIA A100, H100, L40S, A10G, RTX 4090, RTX 4080, RTX 3090 y, en cuantizacion 4 bits, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o incluso GPUs de 8 GB con contexto reducido.
- Cabe en GPU de consumo: si, en configuracion 4 u 8 bits; en bf16 completo es recomendable al menos 12-16 GB de VRAM.
- Opciones de despliegue: Transformers (pipeline de text-generation), vLLM, SGLang, TGI, llama.cpp, Ollama y LM Studio, siempre que los pesos del repositorio sean compatibles con cada runtime.
- Ajuste fino posterior: LoRA/QLoRA viable en 8-16 GB de VRAM; ajuste completo en bf16 requiere del orden de 40-60 GB de VRAM.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

Advertencia de hardware: el tamano del repositorio (0,3 GB) es muy inferior a los aproximadamente 6,2 GB esperables para 3,09 B de parametros en fp16. Esto sugiere que el repositorio puede contener unicamente pesos de adaptador (LoRA) o que la medicion de tamano no refleja todos los ficheros. Conviene verificar el listado real de archivos antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| SAIGE-dpo-v4-run5 | 3,09 B | no confirmado (base: 32.768 tokens, 131.072 con YaRN) | no disponible | HuggingFace, 0 descargas, 0 likes | no disponible |
| Qwen2.5-3B-Instruct (modelo base) | 3,09 B | 32.768 tokens nativo, 131.072 con YaRN | condiciones del modelo base Qwen2.5 | HuggingFace, ampliamente usado | publicados por el autor del modelo base |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, ampliamente usado | publicados por el autor del modelo base |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | HuggingFace, ampliamente usado | publicados por el autor del modelo base |

Los datos de las tres alternativas corresponden a informacion publica de sus respectivas model cards y deben verificarse en las fuentes originales. La comparativa de rendimiento no puede completarse porque SAIGE-dpo-v4-run5 no publica ninguna metrica.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni evaluaciones humanas, por lo que se desconoce si el DPO ha mejorado o degradado las capacidades del modelo base.
- Licencia sin definir: la model card declara "licence: license" sin concretar. Ademas, el modelo base Qwen2.5-3B-Instruct tiene sus propias condiciones de uso, que prevalecen sobre el derivado. Antes de cualquier uso comercial debe aclararse la licencia con el autor y revisar los terminos del modelo base.
- Riesgo de alucinacion: inherente a los modelos de 3 B de parametros; no hay evaluacion de factualidad ni de tasa de alucinacion en esta publicacion.
- Idiomas no declarados: aunque el modelo base es multilingue, no hay confirmacion de que el ajuste DPO haya preservado el rendimiento en idiomas distintos del dominante en el dataset de preferencias (desconocido).
- Contexto no verificado: la ventana de 131.072 tokens con YaRN corresponde al modelo base; no se ha validado que el fine-tune mantenga ese comportamiento.
- Dataset de preferencias no documentado: se desconoce su composicion, tamano, idioma y posibles sesgos, lo que impide auditar el modelo.
- Riesgo de sobreajuste a preferencias: DPO puede reducir la diversidad de las respuestas y aumentar su longitud o adoptar un estilo uniforme; sin evaluacion no puede descartarse.
- Soporte de herramientas no confirmado: no hay evidencia de que el function calling del modelo base siga operativo tras el ajuste.
- Madurez del artefacto: 0 descargas, 0 likes y numeracion "run5" indican un experimento en curso, sin garantias de mantenimiento ni soporte.
- Inconsistencia de tamano: la diferencia entre 0,3 GB y el tamano esperado de un modelo de 3 B en fp16 debe resolverse antes de asumir que el repositorio contiene pesos completos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/M1ztyk/SAIGE-dpo-v4-run5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Panel de entrenamiento en Trackio: https://M1ztyk-saige-dpo-v4-run5-trackio.hf.space?project=saige-dpo-v4-run5&runs=M1ztyk-1789855980&sidebar=collapsed
- Articulo de DPO: https://huggingface.co/papers/2305.18290
- Repositorio de TRL: https://github.com/huggingface/trl

Nota: los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo; corresponden a contenidos de un ambito completamente distinto y se han descartado.
