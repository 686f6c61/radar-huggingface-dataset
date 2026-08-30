# liodon-ai/Qwen2.5-1.5B-Instruct-FP8

## Resumen

El modelo `liodon-ai/Qwen2.5-1.5B-Instruct-FP8` es una cuantizacion en FP8 del modelo instructivo Qwen2.5-1.5B-Instruct, publicada por Liodon AI. Utiliza el esquema `FP8_DYNAMIC` de la libreria llm-compressor del proyecto vLLM: los pesos se convierten a FP8 (E4M3) por canal de forma estatica, mientras que las activaciones se cuantizan dinamicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibracion, por lo que los pesos cuantizados son una conversion directa del original, sin sesgo introducido por datos de calibracion.

El modelo reduce el tamano del repositorio de 3,1 GB a 1,8 GB, lo que supone una reduccion de aproximadamente un 42 %. Esta cuantizacion esta pensada para entornos de produccion que utilizan vLLM, TGI o SGLang en GPUs NVIDIA con compute capability 8.9 o superior (arquitecturas Ada, Hopper y Blackwell). En GPUs mas antiguas, los motores de inferencia descuantizan el modelo para ejecutarlo, perdiendo las ventajas de velocidad y memoria.

La relevancia de este modelo radica en que permite ejecutar un LLM instructivo de 1,5 mil millones de parametros con un consumo de memoria reducido y una latencia menor en hardware moderno, manteniendo las capacidades del modelo original de Qwen2.5, que incluyen soporte multilingue, generacion de codigo y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 128.000 tokens (modelo base) |
| Tipos de cuantizacion | FP8 dinamico (E4M3) para pesos, activaciones FP8 dinamicas por token |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multiples idiomas, incluido espanol) |
| Licencia | other (licencia original de Qwen2.5, no especificada en la model card) |
| Formato de pesos | safetensors (compatible con transformers, vLLM, TGI, SGLang) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only denso de 1,5 mil millones de parametros, preentrenado por Alibaba sobre un dataset de hasta 18 billones de tokens. La variante Instruct ha sido ajustada mediante instrucciones y preferencias humanas, siguiendo la metodologia estandar de la familia Qwen2.5.

La cuantizacion FP8 aplicada por Liodon AI utiliza el esquema `FP8_DYNAMIC` de llm-compressor. Los pesos se convierten a FP8 E4M3 por canal de forma estatica, sin necesidad de dataset de calibracion. Las activaciones se cuantizan a FP8 de forma dinamica por token durante la inferencia. El `lm_head` se deja sin cuantizar, siguiendo la practica estandar, ya que su tamano es insignificante y su cuantizacion tendria un impacto desproporcionado en la calidad. No se ha aplicado ninguna tecnica de RLHF o DPO adicional sobre el modelo cuantizado; es una conversion directa de los pesos originales.

## Capacidades

- Generacion de texto instructivo y conversacional de alta calidad para un modelo de 1,5B.
- Razonamiento basico y respuesta a preguntas factuales.
- Generacion de codigo en multiples lenguajes de programacion.
- Soporte multilingue (el modelo base Qwen2.5 esta entrenado en mas de 29 idiomas, incluido espanol).
- Capacidad de procesar contextos largos de hasta 128.000 tokens.
- Soporte de tool calling y function calling (capacidad del modelo base Qwen2.5-Instruct).
- Compatible con motores de inferencia de produccion: vLLM, TGI y SGLang.
- Ejecucion eficiente en FP8 en GPUs NVIDIA modernas (Ada, Hopper, Blackwell).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 128.000 tokens, y su tamano reducido permite desplegarlo en entornos con recursos limitados.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar codigo o generar documentacion tecnica.
- Clasificacion y extraccion de informacion: puede procesar documentos largos y extraer entidades o resumir contenido gracias a su amplio contexto.
- Asistentes virtuales embebidos: su tamano de 1,8 GB permite ejecutarlo en GPUs de consumo como RTX 4060 o RTX 4090, facilitando asistentes locales sin conexion.
- Prototipado rapido de aplicaciones LLM: al ser compatible con vLLM y TGI, permite levantar un endpoint de inferencia en minutos para pruebas de concepto.
- Fine-tuning eficiente: al estar cuantizado en FP8, puede servir como punto de partida para ajuste fino con PEFT/LoRA en GPUs con poca VRAM.
- Inferencia en entornos edge: su reducido tamano y la compatibilidad con SGLang lo hacen adecuado para servidores de inferencia de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la version cuantizada en FP8 en la informacion disponible. El modelo base Qwen2.5-1.5B-Instruct reporta resultados en benchmarks estandar como MMLU, HumanEval y GSM8K, pero estos datos no se han replicado para la version FP8. Se recomienda consultar la ficha del modelo base para referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB para los pesos en FP8, mas overhead de activaciones y KV cache. Con contexto de 128K, se recomienda al menos 4-6 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 40-series (Ada), L4/L40S, H100/H200 (Hopper), B100/B200/GB10 (Blackwell). Se requiere compute capability >= 8.9 para ejecucion FP8 nativa.
- En GPUs con compute capability inferior (por ejemplo, RTX 30-series), vLLM y TGI descuantizan el modelo a BF16/FP16, perdiendo las ventajas de velocidad y memoria.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), SGLang, transformers con carga estandar.
- Latencia y throughput: no disponible. Depende de la GPU, el tamano de contexto y el numero de requests concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Qwen2.5-1.5B-Instruct-FP8 | 1,5B | 128K | FP8 dinamico | other | HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 128K | Original (BF16) | other (Apache 2.0 para Qwen2.5) | HuggingFace, ModelScope |
| Qwen/Qwen2.5-1.5B-Instruct-GGUF | 1,5B | 128K | GGUF (varias) | other | HuggingFace, Ollama |

La principal diferencia con el modelo base es el tamano (1,8 GB frente a 3,1 GB) y la velocidad de inferencia en hardware compatible. Frente a las versiones GGUF, la cuantizacion FP8 mantiene una mayor fidelidad numerica y esta optimizada para motores de produccion como vLLM, mientras que GGUF esta orientada a llama.cpp y despliegues en CPU.

## Limitaciones y advertencias

- La cuantizacion FP8 puede introducir una ligera degradacion en la calidad de generacion respecto al modelo original en BF16, aunque el esquema dinamico sin calibracion minimiza este efecto.
- Requiere hardware NVIDIA con compute capability >= 8.9 para obtener los beneficios completos. En GPUs antiguas, el modelo se descuantiza y pierde las ventajas de memoria y velocidad.
- La licencia se indica como "other" y corresponde a la licencia original de Qwen2.5. Se debe revisar la licencia especifica del modelo base para uso comercial.
- El modelo es de 1,5B de parametros, por lo que su capacidad de razonamiento complejo y generacion de codigo avanzado es limitada en comparacion con modelos de mayor tamano.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta version cuantizada.
- El idioma espanol esta soportado por el modelo base, pero no se ha verificado el rendimiento especifico en esta version cuantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/Qwen2.5-1.5B-Instruct-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base (sin instruct): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Pagina en Ollama: https://ollama.com/library/qwen2.5:1.5b-instruct
- Repositorio GitHub de Qwen2.5: https://github.com/mx4ai/qwen2.5
- Modelo en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-1.5B-Instruct
- Libreria llm-compressor: https://github.com/vllm-project/llm-compressor
