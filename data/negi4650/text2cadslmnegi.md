# negi4650/text2cadslmnegi

## Resumen

text2cadslmnegi es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-7B-Instruct, publicado por el usuario negi4650 en Hugging Face. El nombre sugiere una especializacion en la generacion de codigo CAD (diseño asistido por ordenador) a partir de texto, aunque la model card no documenta explicitamente la tarea, el dataset ni el procedimiento de entrenamiento empleado. El modelo parte de la version cuantizada en 4 bits de Unsloth del Qwen2.5-Coder-7B-Instruct, lo que condiciona tanto el proceso de entrenamiento como el formato de los pesos publicados.

Con 7.615.616.512 parametros (aproximadamente 7,6 mil millones), hereda la arquitectura transformer decoder-only de la familia Qwen2.5, con atencion de tipo grouped-query y una ventana de contexto nativa de 32.768 tokens en el modelo base. La licencia Apache 2.0 y el formato safetensors facilitan su integracion en pipelines existentes, si bien la ausencia de documentacion tecnica detallada limita seriamente la evaluacion de su calidad y de sus casos de uso reales.

La relevancia de este modelo es limitada en el ecosistema actual: se trata de una publicacion de caracter experimental, sin descargas ni interacciones registradas en el momento de redactar esta ficha, y sin benchmarks publicados. Resulta util unicamente como referencia de ajustes finos sobre Qwen2.5-Coder para tareas de generacion de codigo especifico de dominio, siempre que el usuario valide su comportamiento por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-Coder-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-Coder-7B-Instruct soporta 32.768 tokens nativos (ampliable a 131.072 con YaRN) |
| Tipos de cuantizacion | Pesos publicados en safetensors; el modelo base de partida estaba cuantizado en 4 bits (bnb-4bit). No se documentan otras variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit, que a su vez es una cuantizacion en 4 bits (bitsandbytes) del Qwen2.5-Coder-7B-Instruct original. La arquitectura subyacente es un transformer decoder-only con 28 capas, atencion de tipo grouped-query (GQA) con 28 cabezas de consulta y 4 de clave/valor, y embeddings de 3.584 dimensiones; estas cifras corresponden al modelo base Qwen2.5-Coder-7B y no estan verificadas de forma independiente en la publicacion.

Segun la model card, el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que indica un proceso de ajuste fino supervisado (SFT) o posiblemente DPO, aunque no se especifica el algoritmo exacto, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. La ausencia de esta informacion impide reproducir el entrenamiento o evaluar su calidad de forma objetiva.

## Capacidades

- Generacion de texto y codigo: hereda las capacidades del Qwen2.5-Coder-7B-Instruct, incluyendo generacion, completado y explicacion de codigo en multiples lenguajes de programacion.
- Razonamiento sobre codigo y matematicas: el modelo base muestra buen rendimiento en tareas de razonamiento algoritmico y resolucion de problemas matematicos, aunque no hay datos especificos para este ajuste.
- Tool calling y function calling: el modelo base Qwen2.5-Coder soporta llamadas a herramientas mediante plantillas de chat estructuradas; se desconoce si el ajuste conserva esta capacidad intacta.
- Razonamiento multi-paso y agentes: capacidad teorica heredada del modelo base, no verificada en este checkpoint.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base soporta mas idiomas.
- Capacidad especial: el nombre del modelo sugiere generacion de codigo CAD a partir de descripciones en lenguaje natural, pero esta funcionalidad no esta documentada ni validada en la model card.

## Casos de uso

- Generacion de scripts CAD a partir de descripciones textuales: el modelo podria emplearse para producir codigo en lenguajes de scripting CAD (por ejemplo, OpenSCAD, FreeCAD Python API o Autodesk Forge) a partir de especificaciones en lenguaje natural, si bien el usuario debe validar exhaustivamente la correccion geometrica de las salidas.
- Prototipado rapido de piezas parametricas: integrado en un flujo de trabajo donde el ingeniero describe una pieza y el modelo genera el codigo parametrico inicial, que luego se revisa y ajusta manualmente.
- Asistencia en documentacion tecnica de planos: el modelo puede redactar descripciones textuales de geometrias o parametros a partir de codigo CAD existente, aprovechando su herencia de Qwen2.5-Coder.
- Generacion de codigo general en produccion: al estar basado en Qwen2.5-Coder-7B-Instruct, puede emplearse para autocompletado y generacion de codigo en editores, con la salvedad de que el ajuste puede haber degradado capacidades generales.
- Educacion y formacion en diseño parametrico: util como herramienta de apoyo para explicar conceptos de modelado CAD y generar ejemplos de codigo comentados.
- Experimentacion e investigacion: sirve como punto de partida para estudiar el efecto del ajuste fino sobre un modelo de codigo cuantizado en 4 bits, comparando su comportamiento con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 18-20 GB.
- VRAM estimada en cuantizacion 8 bits: alrededor de 8 GB de pesos, con un total practico de 10-12 GB.
- VRAM estimada en cuantizacion 4 bits: alrededor de 4-5 GB de pesos, con un total practico de 6-8 GB para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para produccion en precision completa; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantizacion 8 bits.
- Compatibilidad con GPU de consumo: si, en cuantizacion 4 bits cabe en GPUs con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070), y en 8 bits en GPUs con 12 GB o mas.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM, llama.cpp (previa conversion a GGUF), Ollama (previa conversion) y endpoints compatibles de Hugging Face. El tag endpoints_compatible indica soporte para Inference Endpoints.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| negi4650/text2cadslmnegi | 7,6 B | No documentado (base: 32.768) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino sin benchmarks ni documentacion |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks publicados por Alibaba |
| DeepSeek-Coder-6.7B-Instruct | 6,7 B | 16.384 | DeepSeek License (uso comercial permitido con restricciones) | Hugging Face | Alternativa consolidada para generacion de codigo |
| CodeLlama-7B-Instruct | 6,7 B | 16.384 | Llama 2 Community License | Hugging Face | Modelo de Meta para codigo, con restricciones de uso comercial |

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe el dataset, el procedimiento de entrenamiento, la tarea objetivo ni las metricas de evaluacion, lo que impide reproducir o validar el modelo.
- Riesgo elevado de alucinacion en codigo CAD: sin validacion geometrica o sintactica, las salidas pueden ser incorrectas o no ejecutables.
- Posible degradacion de capacidades generales: el ajuste fino sobre un checkpoint cuantizado en 4 bits puede haber reducido el rendimiento en tareas generales de codigo respecto al modelo base.
- Sesgos: no documentados; hereda los sesgos del corpus de entrenamiento de Qwen2.5-Coder y del dataset de ajuste fino, que se desconoce.
- Limitacion idiomatica: la model card declara unicamente ingles, lo que restringe su uso en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar que el dataset de ajuste fino no imponga restricciones adicionales, algo que no se puede confirmar con la informacion disponible.
- Advertencia para produccion: no se recomienda su uso en entornos productivos sin una evaluacion exhaustiva previa, dado el caracter experimental del checkpoint y la ausencia de benchmarks.
- Trazabilidad: el modelo se creo y actualizo en noviembre de 2026, sin descargas ni interacciones, lo que sugiere una publicacion de prueba sin mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/negi4650/text2cadslmnegi
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Documentacion de Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder/
