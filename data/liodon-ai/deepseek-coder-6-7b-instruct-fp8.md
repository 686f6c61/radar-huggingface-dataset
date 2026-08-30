# liodon-ai/deepseek-coder-6.7b-instruct-FP8

## Resumen

`liodon-ai/deepseek-coder-6.7b-instruct-FP8` es una cuantización en punto flotante de 8 bits (FP8) del modelo `deepseek-ai/deepseek-coder-6.7b-instruct`, publicada por Liodon AI. El modelo original, desarrollado por DeepSeek, es un transformer decoder-only de 6.700 millones de parámetros especializado en generación de código, entrenado desde cero sobre 2 billones de tokens compuestos por un 87 % de código y un 13 % de lenguaje natural en inglés y chino. Esta versión cuantizada reduce el tamaño del repositorio de 13,5 GB a 7,0 GB, lo que permite desplegar el modelo en entornos con menos memoria de GPU y acelerar la inferencia en hardware compatible con FP8.

La cuantización utiliza el esquema `FP8_DYNAMIC` de la librería `llm-compressor`: los pesos se convierten a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibración, por lo que los pesos cuantizados son numéricamente equivalentes a una conversión directa de los originales, sin sesgo introducido por datos de calibración. La capa `lm_head` se deja sin cuantizar, práctica estándar por su tamaño despreciable y su impacto desproporcionado en la calidad si se cuantizara.

La relevancia de este modelo radica en que ofrece una alternativa eficiente para ejecutar DeepSeek Coder 6.7B en GPUs de consumo recientes (RTX 40-series) o en entornos profesionales con H100, manteniendo la calidad del modelo original y reduciendo los requisitos de memoria a la mitad. Es compatible con los principales motores de inferencia como vLLM, TGI y SGLang, lo que facilita su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo LLaMA) |
| Parametros totales | 6.740.512.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 16 384 tokens, pero no se especifica en esta cuantizacion) |
| Tipos de cuantizacion | FP8 (E4M3) dinamica, pesos por canal, activaciones por token |
| Idiomas soportados | Ingles y chino (segun el modelo base) |
| Licencia | Other (consulte la licencia del modelo base DeepSeek) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `deepseek-ai/deepseek-coder-6.7b-instruct` es un transformer decoder-only con 6,7 mil millones de parametros, entrenado desde cero sobre 2 billones de tokens, de los cuales el 87 % corresponde a codigo fuente y el 13 % a lenguaje natural en ingles y chino. El proceso de entrenamiento incluyo una fase de pre-entrenamiento seguida de un ajuste fino supervisado (SFT) para la variante instruct, orientada a tareas conversacionales y de generacion de codigo.

La cuantizacion FP8 realizada por Liodon AI no modifica la arquitectura ni los pesos originales mas alla de la conversion numerica. El esquema `FP8_DYNAMIC` convierte los pesos a FP8 (E4M3) por canal de forma estatica, mientras que las activaciones se cuantizan dinamicamente en cada token durante la inferencia. Al no requerir dataset de calibracion, no se introduce sesgo adicional y la degradacion de calidad es minima. La capa `lm_head` se mantiene en precision original (BF16) para preservar la calidad de la salida.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, incluyendo Python, Java, C++, JavaScript y otros, gracias al entrenamiento sobre un corpus diverso de codigo.
- Razonamiento logico y matematico aplicado a problemas de programacion, como depuracion, refactorizacion y explicacion de codigo.
- Soporte conversacional en ingles y chino, con capacidad para mantener dialogos multi-turno sobre temas de informatica.
- Inferencia eficiente en FP8, con reduccion del 48 % en el tamano del modelo (de 13,5 GB a 7,0 GB) y menor uso de VRAM.
- Compatibilidad con vLLM, TGI y SGLang, lo que permite integracion en servidores de inferencia de alto rendimiento.
- No se ha confirmado soporte explicito para tool calling o function calling en la informacion disponible.

## Casos de uso

- Asistente de programacion integrado en IDE: el modelo puede generar sugerencias de codigo, completar funciones y explicar fragmentos, aprovechando su entrenamiento especifico en codigo y su capacidad conversacional.
- Generacion de codigo en pipelines de CI/CD: gracias a su compatibilidad con vLLM y TGI, puede desplegarse como servicio interno para generar tests unitarios, documentacion o parches de codigo automaticamente.
- Chatbot de soporte tecnico para desarrolladores: al estar entrenado en ingles y chino, puede atender consultas sobre APIs, errores de compilacion o mejores practicas de programacion en ambos idiomas.
- Entornos de desarrollo con recursos limitados: al ocupar solo 7,0 GB en FP8, puede ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o incluso RTX 4060 Ti (16 GB) con margen para el contexto, lo que lo hace accesible para equipos pequenos o prototipos.
- Analisis y refactorizacion de codigo legacy: el modelo puede identificar patrones, sugerir mejoras y convertir codigo entre lenguajes, ayudando en tareas de mantenimiento de software.
- Educacion y formacion en programacion: puede generar ejemplos, explicar conceptos y resolver dudas de estudiantes, con la ventaja de un despliegue local sin dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion FP8 en la informacion disponible. El modelo base `deepseek-ai/deepseek-coder-6.7b-instruct` reporta resultados en HumanEval, MBPP y otros benchmarks de codigo, pero no se han proporcionado en esta ficha. Se recomienda consultar la documentacion del modelo base para obtener metricas de referencia.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa 7,0 GB en disco; en inferencia, la VRAM necesaria es aproximadamente 7-8 GB para el modelo mas el overhead de contexto y activaciones. Con una ventana de contexto de 16K tokens, se recomienda al menos 12 GB de VRAM.
- GPU recomendadas: NVIDIA con compute capability >= 8.9 (Ada, Hopper, Blackwell), como RTX 40-series, L4, L40S, H100, H200, B100, B200 o GB10. En GPUs con compute capability inferior (por ejemplo, RTX 30-series), vLLM y TGI dequantizaran el modelo a BF16, perdiendo la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/deepseek-coder-6.7b-instruct-FP8`), TGI (via Docker), SGLang (`python -m sglang.launch_server --model-path ...`), o directamente con transformers.
- Latencia y throughput: no se han proporcionado datos especificos. En hardware compatible con FP8, se espera una mejora significativa en throughput respecto al modelo BF16, aunque los valores exactos dependen de la GPU y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|
| deepseek-ai/deepseek-coder-6.7b-instruct (base) | 6,7B | 16K (no confirmado) | BF16 | 13,5 GB | DeepSeek License |
| liodon-ai/deepseek-coder-6.7b-instruct-FP8 | 6,7B | No disponible | FP8 dinamica | 7,0 GB | Other |
| TheBloke/deepseek-coder-6.7b-instruct-GGUF | 6,7B | 16K | GGUF (varias) | Variable | DeepSeek License |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa entre estas versiones. La principal diferencia es el formato de cuantizacion: FP8 ofrece mejor rendimiento en GPUs modernas, mientras que GGUF es mas flexible para CPU y GPUs antiguas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en codigo generado por la comunidad. No se ha realizado una evaluacion especifica de sesgos para esta cuantizacion.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar codigo incorrecto o inventar APIs inexistentes. Se recomienda validar siempre la salida en entornos de produccion.
- Limitaciones de contexto: la longitud de contexto no se ha especificado en la informacion de esta cuantizacion; se asume la del modelo base (16K tokens), pero no esta confirmada.
- Restricciones de licencia: la licencia se indica como "other". El modelo base DeepSeek Coder utiliza una licencia propia que permite uso comercial con atribucion, pero es necesario revisar los terminos exactos antes de su uso en productos comerciales.
- Requisito de hardware FP8: en GPUs sin soporte nativo para FP8 (compute capability < 8.9), el modelo se dequantizara a BF16, perdiendo la ventaja de memoria y velocidad. Esto puede provocar un uso de VRAM superior al esperado.
- Sin datos de benchmarks: no se han publicado metricas de rendimiento para esta cuantizacion, por lo que la degradacion de calidad respecto al modelo base no esta cuantificada.

## Enlaces

- [Modelo cuantizado en Hugging Face](https://huggingface.co/liodon-ai/deepseek-coder-6.7b-instruct-FP8)
- [Modelo base en Hugging Face](https://huggingface.co/deepseek-ai/deepseek-coder-6.7b-instruct)
- [Repositorio GitHub de DeepSeek Coder](https://github.com/deepseek-ai/deepseek-coder)
- [Pagina del proyecto DeepSeek Coder](https://deepseekcoder.github.io/)
- [Documentacion de llm-compressor](https://github.com/vllm-project/llm-compressor)
