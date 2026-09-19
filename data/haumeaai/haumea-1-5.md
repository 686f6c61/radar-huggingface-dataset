# HaumeaAI/Haumea-1.5

## Resumen

Haumea-1.5 es un ajuste fino (fine-tuning) del modelo Mistral 7B Instruct v0.3 publicado por el usuario HaumeaAI en HuggingFace. Se trata de un modelo de lenguaje decoder-only de aproximadamente 7.248 millones de parametros, derivado de forma explicita de `unsloth/mistral-7b-instruct-v0.3-bnb-4bit` y entrenado con la libreria Unsloth junto con TRL de HuggingFace, segun declara la propia model card. El repositorio ocupa 14,5 GB y contiene pesos en formato safetensors, lo que es coherente con una publicacion en precision fp16/bf16 (7.248 millones de parametros x 2 bytes por parametro).

El modelo no aporta informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. La model card es esencialmente la plantilla estandar de Unsloth, con la unica modificacion del campo "Developed by" y el modelo base. No se han publicado resultados de benchmarks, evaluaciones ni ejemplos de uso.

Su relevancia actual es limitada: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, no tiene pipeline declarado y el campo de licencia del repositorio figura como no disponible, aunque la model card indica Apache 2.0. El interes principal es como ejemplo de flujo de trabajo QLoRA/LoRA sobre Mistral 7B v0.3, mas que como modelo listo para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (atencion con ventana deslizante y Grouped-Query Attention, segun el modelo base) |
| Parametros totales | 7.248.023.552 (~7,25 mil millones) |
| Longitud de contexto | 32.768 tokens (heredado de Mistral 7B Instruct v0.3; no confirmado de forma explicita en la model card) |
| Tipos de cuantizacion | No se incluyen cuantizaciones en el repositorio; los pesos publicados estan en precision completa (fp16/bf16). El modelo base de partida era una version cuantizada a 4 bits con bitsandbytes |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache 2.0 (declarada en la model card); el campo de licencia del repositorio figura como "no disponible" |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a Mistral 7B Instruct v0.3: un transformer decoder-only de 7.248 millones de parametros con atencion de ventana deslizante (sliding window attention), Grouped-Query Attention y vocabulario de 32.768 tokens. La model card no describe ninguna modificacion estructural respecto al modelo base, por lo que se asume que la topologia es identica.

El entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, partiendo de `unsloth/mistral-7b-instruct-v0.3-bnb-4bit`, es decir, un checkpoint del modelo instructivo ya cuantizado a 4 bits con bitsandbytes. La model card afirma que el entrenamiento fue "2x mas rapido" gracias a Unsloth, pero no especifica el conjunto de datos, el numero de tokens, la duracion, el rango de LoRA, la tasa de aprendizaje ni si hubo etapas de RLHF, DPO o cualquier otra forma de alineacion. Tampoco se documenta si los adaptadores se fusionaron con los pesos base, aunque el tamano del repositorio (14,5 GB) sugiere que los pesos publicados corresponden a un modelo completo en fp16 y no a adaptadores sueltos.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del modelo base Mistral 7B Instruct v0.3.
- Razonamiento basico y respuestas conversacionales multi-turno, presumiblemente heredadas del modelo instructivo original.
- Generacion de codigo y resolucion de problemas matematicos sencillos: capacidad tipica de la familia Mistral 7B, aunque no hay evaluacion publicada que la confirme en este ajuste concreto.
- Soporte de tool calling / function calling: no documentado. No hay plantilla de chat ni ejemplos publicados en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card solo declara ingles. No hay evidencia de soporte de castellano ni de otros idiomas.
- Modo "thinking", vision o audio: no disponible.
- Ajuste especifico: no se documenta ninguna capacidad diferencial respecto al modelo base.

## Casos de uso

Advertencia previa: al no existir evaluacion publicada ni documentacion del dataset de ajuste, los casos siguientes son hipotesis razonables basadas en el comportamiento esperado del modelo base Mistral 7B Instruct v0.3, no en resultados verificados de Haumea-1.5.

- Prototipado de asistentes conversacionales en ingles: el modelo puede mantener conversaciones multi-turno con una ventana de hasta 32.768 tokens, lo que permite incluir documentos largos o historiales extensos en el contexto.
- Generacion y explicacion de codigo en entornos de desarrollo: al derivar de Mistral 7B Instruct, cabe esperar un rendimiento razonable en tareas de autocompletado, refactorizacion y explicacion de fragmentos de codigo, siempre que se valide previamente.
- Resumen de documentacion tecnica: el contexto de 32.768 tokens permite procesar manuales, articulos o informes extensos y generar resumenes estructurados.
- Extraccion de informacion de textos: clasificacion, etiquetado y extraccion de entidades en documentos en ingles, integrable en pipelines de procesamiento por lotes.
- Chatbots de soporte interno: al ser un modelo de 7B, puede desplegarse en una GPU de gama media y servir peticiones concurrentes con vLLM o TGI a coste reducido.
- Base para ajustes posteriores: dado que el repositorio incluye pesos completos en safetensors, sirve como punto de partida para nuevos fine-tunings con LoRA o QLoRA sobre dominios especificos.
- Evaluacion comparativa de tecnicas de ajuste: util como caso de estudio del flujo Unsloth + TRL frente a otros metodos de entrenamiento eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Haumea-1.5 no incluye ninguna metrica de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares), y el repositorio no registra descargas ni validacion por parte de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 15-16 GB, incluyendo pesos (14,5 GB) y cache KV para contextos moderados. Con contexto cercano a 32.768 tokens la cache KV puede anadir varios GB adicionales.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M, AWQ o GPTQ): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 con contextos largos y alta concurrencia; RTX 4090 (24 GB) para fp16 en un unico usuario; RTX 3090 o 4080 para 8 bits.
- GPU de consumo: si, cabe en GPUs de consumo. En fp16 entra en una RTX 4090 o RTX 3090 de 24 GB; en 4 bits entra en tarjetas de 8-12 GB como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- Opciones de despliegue: vLLM y TGI para fp16/bf16 con safetensors; llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF; LM Studio y text-generation-webui como alternativas de escritorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de velocidad en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Rendimiento |
|---|---|---|---|---|---|
| Haumea-1.5 | 7,25 B | 32.768 tokens (heredado) | Apache 2.0 (declarada) | safetensors | No disponible |
| Mistral 7B Instruct v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 | safetensors | No disponible en esta ficha |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | safetensors | No disponible en esta ficha |
| Qwen2.5 7B Instruct | 7,61 B | 131.072 tokens (con YaRN; 32.768 nativos) | Apache 2.0 | safetensors | No disponible en esta ficha |

Nota: los datos de los modelos comparados corresponden a especificaciones publicas conocidas y se incluyen unicamente como referencia de categoria. No se dispone de ninguna evaluacion de Haumea-1.5, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni resultados de validacion publicados.
- Dataset de entrenamiento desconocido: no se documenta la composicion, el tamano ni la procedencia de los datos, lo que impide auditar sesgos o riesgo de contaminacion.
- Riesgo de alucinacion: como cualquier modelo de 7B sin alineacion documentada, puede generar informacion falsa con aparente seguridad. No se documenta ninguna etapa de RLHF o DPO que lo mitigue.
- Limitacion idiomatica: la model card solo declara ingles. El uso en castellano no esta soportado ni validado.
- Restricciones de licencia: la model card declara Apache 2.0, que permite uso comercial, pero el campo de licencia del repositorio en HuggingFace figura como no disponible. Conviene verificar la coherencia antes de un uso en produccion.
- Sin soporte de tool calling documentado: no hay plantilla de chat ni formato de function calling especificado, lo que complica su integracion en agentes.
- Falta de cuantizaciones listas para usar: el repositorio no incluye GGUF, AWQ ni GPTQ, por lo que el despliegue en entornos de bajos recursos requiere conversion manual.
- Datos de contexto no confirmados: la ventana de 32.768 tokens se deduce del modelo base, no de una especificacion propia de Haumea-1.5.
- Sin validacion comunitaria: 0 descargas y 0 "likes" implican que no ha sido probado por terceros.
- Fecha de publicacion inusual: el repositorio figura creado el 2026-09-19, lo que puede indicar un error de metadatos o de reloj en el sistema de origen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HaumeaAI/Haumea-1.5
- Modelo base declarado: https://huggingface.co/unsloth/mistral-7b-instruct-v0.3-bnb-4bit
- Modelo instructivo original: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo Haumea-1.5 ni con inteligencia artificial, por lo que se han descartado y no se incluyen. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo.
