# liodon-ai/Qwen2.5-7B-Instruct-FP8

## Resumen

Qwen2.5-7B-Instruct-FP8 es una cuantizacion en precision FP8 (E4M3) del modelo Qwen2.5-7B-Instruct de Alibaba Cloud, publicada por Liodon AI. El modelo original es un transformer denso de 7.615 millones de parametros, ajustado con instrucciones para tareas conversacionales, codigo, matematicas y generacion de JSON, con soporte multilingue en mas de 29 idiomas y una ventana de contexto de 128K tokens.

La cuantizacion utiliza el esquema FP8_DYNAMIC de llm-compressor: los pesos se convierten a FP8 por canal de forma estatica, mientras que las activaciones se cuantizan dinamicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibracion, por lo que los pesos cuantizados son numericamente una conversion directa del original, sin sesgo introducido por calibracion. El tamaño del repositorio pasa de 15,2 GB a 8,7 GB, lo que reduce los requisitos de VRAM y mejora la velocidad de inferencia en hardware compatible.

La relevancia de este modelo radica en que ofrece una alternativa de despliegue mas eficiente del popular Qwen2.5-7B-Instruct, manteniendo la calidad del modelo original gracias a la cuantizacion FP8 sin calibracion. Es compatible con vLLM, TGI y SGLang, y requiere GPUs NVIDIA con compute capability 8.9 o superior (Ada, Hopper o Blackwell) para ejecucion FP8 nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | FP8 (E4M3) dinamico, pesos por canal; activaciones por token |
| Idiomas soportados | 29+ idiomas (heredado del modelo base) |
| Licencia | other (licencia Qwen) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-7B-Instruct es un transformer denso decoder-only con atencion por grupos (GQA), activacion SwiGLU y embeddings rotatorios (RoPE). Fue preentrenado sobre un dataset de hasta 18 billones de tokens y posteriormente ajustado con instrucciones para tareas conversacionales, codigo, matematicas y generacion estructurada de JSON.

La version FP8 de Liodon AI aplica el esquema FP8_DYNAMIC de llm-compressor: los pesos se convierten a FP8 (E4M3) por canal de forma estatica, mientras que las activaciones se cuantizan dinamicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibracion, por lo que los pesos cuantizados son una conversion directa del original sin sesgo de calibracion. La capa lm_head se deja sin cuantizar, practica estandar que evita una perdida desproporcionada de calidad en la salida.

## Capacidades

- Generacion de texto conversacional con soporte multi-turno.
- Razonamiento y resolucion de problemas en matematicas y logica.
- Generacion de codigo en multiples lenguajes de programacion.
- Generacion de JSON estructurado para integracion con APIs.
- Soporte de tool calling y function calling (heredado del modelo base).
- Capacidades multilingues en mas de 29 idiomas.
- Ventana de contexto de 128K tokens para documentos largos y conversaciones extensas.
- Soporte de agentes y razonamiento multi-paso.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 128K tokens, manteniendo el historial completo de la interaccion sin truncamiento.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar o documentar codigo, con la ventaja de un menor uso de VRAM frente al modelo en BF16.
- Extraccion de datos estructurados: genera JSON valido a partir de texto no estructurado, util para pipelines de ingestion de datos y automatizacion de procesos.
- Asistentes virtuales multilingues: su soporte en mas de 29 idiomas permite desplegar asistentes en mercados internacionales sin necesidad de modelos separados por idioma.
- Analisis de documentos largos: la ventana de 128K tokens permite procesar contratos, informes o articulos cientificos completos en una sola pasada.
- Razonamiento y resolucion de problemas: adecuado para aplicaciones educativas o de soporte tecnico que requieren explicaciones paso a paso y razonamiento logico.
- Despliegue en entornos con VRAM limitada: al ocupar 8,7 GB en lugar de 15,2 GB, permite ejecutar el modelo en GPUs de consumo como RTX 4070 Ti o RTX 4080 con margen para el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El modelo base Qwen2.5-7B-Instruct ha publicado resultados en MMLU, HumanEval, GSM8K y otros benchmarks, pero la ficha de esta cuantizacion FP8 no incluye mediciones propias. Dado que el esquema FP8_DYNAMIC es una conversion directa sin calibracion, se espera una degradacion minima respecto al modelo original, pero no se dispone de datos cuantitativos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 8,7 GB en disco; para inferencia se recomienda al menos 12 GB de VRAM para acomodar el contexto y los estados intermedios.
- GPUs compatibles con ejecucion FP8 nativa: NVIDIA con compute capability >= 8.9, incluyendo RTX 40-series (Ada), L4/L40S, H100/H200 (Hopper) y B100/B200/GB10 (Blackwell).
- En GPUs mas antiguas (compute capability < 8.9), vLLM y TGI des-cuantizan el modelo para ejecutarlo, perdiendo las ventajas de velocidad y memoria del FP8.
- GPUs de consumo compatibles: RTX 4070 Ti (12 GB), RTX 4080 (16 GB), RTX 4090 (24 GB).
- Opciones de despliegue: vLLM, Text Generation Inference (TGI) y SGLang, todos con soporte nativo para FP8.
- Latencia y throughput: no disponible en la informacion proporcionada, aunque la cuantizacion FP8 reduce el uso de memoria y ancho de banda, lo que generalmente mejora el throughput frente a BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct (original) | 7,6B | 128K | BF16/FP16 | Apache 2.0 (Qwen) | safetensors |
| Qwen2.5-7B-Instruct-FP8 (este) | 7,6B | 128K | FP8 dinamico | other (Qwen) | safetensors |
| Llama 3.1 8B Instruct | 8,0B | 128K | BF16/FP16 | Llama 3.1 | safetensors |
| Mistral 7B Instruct v0.3 | 7,3B | 32K | BF16/FP16 | Apache 2.0 | safetensors |

La comparativa se centra en el modelo base y alternativas de tamano similar. La ventaja principal de esta cuantizacion FP8 frente al modelo original es la reduccion de memoria (8,7 GB frente a 15,2 GB) y la mejora de velocidad en hardware compatible, manteniendo la misma calidad numerica al no requerir calibracion.

## Limitaciones y advertencias

- Requiere hardware NVIDIA con compute capability >= 8.9 para ejecucion FP8 nativa; en GPUs mas antiguas se des-cuantiza y se pierden las ventajas de rendimiento.
- La licencia se indica como "other" en la model card; es necesario revisar los terminos de la licencia Qwen para confirmar las restricciones de uso comercial.
- No se han publicado benchmarks propios de esta cuantizacion; aunque el esquema FP8_DYNAMIC minimiza la degradacion, no hay datos cuantitativos que lo confirmen.
- El modelo hereda las limitaciones del modelo base, incluyendo posibles sesgos en los datos de entrenamiento y riesgo de alucinacion en tareas de generacion libre.
- La capa lm_head no esta cuantizada, lo que implica que parte de la memoria se mantiene en precision original.
- No se dispone de informacion sobre el dataset de entrenamiento especifico de esta cuantizacion, aunque al ser una conversion directa no requiere datos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/Qwen2.5-7B-Instruct-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
- Repositorio Qwen2.5: https://github.com/mx4ai/qwen2.5
- Modelo en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-7B-Instruct
