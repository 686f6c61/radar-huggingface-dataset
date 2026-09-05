# Anomly/Qwen2.5-0.5B-Instruct-bposit8

## Resumen

`Anomly/Qwen2.5-0.5B-Instruct-bposit8` es una recuantización del modelo instructivo `Qwen/Qwen2.5-0.5B-Instruct`, desarrollada por el autor Anomly. El objetivo principal de esta variante es ofrecer una representación de pesos en formato **b-posit8** (32 bloques de código con escala de potencia de dos, códigos posit de 8 bits, es=2) que cumpla el perfil exacto de **INVAR**, un proyecto orientado a la inferencia reproducible y determinista. Con este formato, cada multiplicación de matrices acumula en un quire de 256 bits con un único redondeo, lo que produce activaciones y logits bit-idénticos en arquitecturas x86, CUDA y aarch64, siempre que se utilice un runtime determinista.

El modelo original es un transformer decoder-only de aproximadamente 494 millones de parámetros, pensado para tareas de instrucción y generación de texto. Esta variante no ha sido entrenada ni ajustada, sino que es una conversión de los pesos originales a un formato GGUF especial. Su relevancia radica en que permite verificar y reproducir respuestas de forma exacta a partir de los pesos y los token ids, lo que resulta útil en entornos donde la trazabilidad y el determinismo son críticos. No se especifica la longitud de contexto en el repositorio de esta variante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | b-posit8 (32 bloques de código con escala de potencia de dos, códigos posit de 8 bits, es=2; GGUF file_type 42) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-0.5B-Instruct es multilingüe según su documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `.gguf` de 0.52 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only con 494 millones de parámetros. La variante b-posit8 no introduce cambios arquitectónicos, sino que modifica la representación numérica de los pesos para garantizar una inferencia determinista y reproducible. Según la documentación de Qwen2.5, el modelo base fue preentrenado con un dataset de gran escala de hasta 18 billones de tokens, pero este dato no se detalla en el repositorio de la variante.

La innovación técnica principal es el esquema de cuantización b-posit8, que utiliza un quire de 256 bits para las acumulaciones, con un único redondeo por operación. Esto permite que un runtime determinista produzca salidas bit-idénticas en diferentes plataformas (x86, CUDA y aarch64), y que implementaciones de referencia independientes puedan reproducir una respuesta servida a partir de los pesos y los token ids. No se ha realizado ningún entrenamiento adicional, RLHF ni DPO sobre esta variante; es una conversión directa de los pesos originales.

## Capacidades

- Generación de texto e instrucciones: al ser una recuantización del modelo instructivo Qwen2.5-0.5B-Instruct, conserva su capacidad para seguir instrucciones y generar texto.
- Inferencia determinista: el perfil exacto de INVAR garantiza que las activaciones y logits sean bit-idénticos en x86, CUDA y aarch64, siempre que se use el runtime determinista adecuado.
- Verificación de reproducibilidad: permite reproducir una respuesta servida a partir de los pesos y los token ids mediante implementaciones de referencia independientes.
- Formato GGUF: el modelo se distribuye como un archivo GGUF, lo que facilita su integración en el ecosistema de llama.cpp y herramientas derivadas.
- Compatibilidad con endpoints: el modelo está etiquetado como `endpoints_compatible`, lo que sugiere que puede desplegarse en servicios de inferencia compatibles con esta interfaz.
- Soporte multilingüe: aunque no se detalla en el repositorio, el modelo base Qwen2.5-0.5B-Instruct es multilingüe según la documentación oficial de Qwen2.5.

## Casos de uso

- Verificación de reproducibilidad en producción: el modelo puede usarse como referencia para asegurar que una respuesta generada en un entorno (por ejemplo, un servidor con CUDA) es idéntica a la generada en otro (por ejemplo, una CPU x86), gracias al perfil exacto de INVAR.
- Despliegue en dispositivos edge: con un peso de 0.52 GB, el modelo cabe en dispositivos con recursos limitados, como Raspberry Pi o mini-PCs, para asistentes de texto locales.
- Inferencia determinista en sistemas críticos: en aplicaciones donde la trazabilidad de la salida es obligatoria (por ejemplo, auditoría de decisiones automatizadas), este modelo permite reproducir exactamente la misma respuesta a partir de los mismos token ids.
- Integración en pipelines de CI/CD para pruebas de regresión: el modelo puede usarse para comprobar que un cambio en el código de inferencia no altera las salidas, mediante la comparación de logits o respuestas con un runtime de referencia.
- Experimentación con cuantización: es un caso práctico para estudiar el impacto de un formato de cuantización no estándar (b-posit8) en la precisión y el determinismo, en comparación con cuantizaciones convencionales como Q4_K_M o Q8_0.
- Aplicaciones de chat sencillas en local: gracias a su tamaño reducido y al formato GGUF, puede ejecutarse en equipos de usuario con CPU o GPU de gama baja mediante llama.cpp o un fork determinista, ofreciendo un asistente de texto básico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: dado el tamaño de los pesos (0.52 GB en formato GGUF), se requiere aproximadamente 1 GB de memoria (VRAM o RAM) para cargar el modelo. En FP16 serían unos 1 GB, pero al estar cuantizado en 8 bits, el consumo real es cercano al tamaño del archivo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050 o superiores. También puede ejecutarse en GPUs integradas o en CPU.
- Compatibilidad con GPU de consumo: sí, el modelo puede ejecutarse en GPUs de consumo, siempre que se utilice un runtime compatible con el formato GGUF y la cuantización b-posit8.
- Opciones de despliegue: el modelo está diseñado para usarse con el runtime de INVAR (`invar serve`) y con un fork determinista de llama.cpp (`llama-cpp-et`). También es posible importarlo en Ollama o en otras herramientas que soporten GGUF, aunque la reproducibilidad exacta solo está garantizada con el backend determinista.
- Latencia y throughput: no se dispone de datos de latencia o throughput en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Anomly/Qwen2.5-0.5B-Instruct-bposit8 | 494 M | No disponible | GGUF (b-posit8) | Apache 2.0 |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | No disponible | Safetensors | Apache 2.0 |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | No disponible | Safetensors | Apache 2.0 |

La comparativa se limita a modelos de la misma familia y tamaño. No se dispone de información suficiente para comparar el rendimiento con otras alternativas de la misma categoría (por ejemplo, SmolLM2 o TinyLlama) en términos de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en esta variante, pero al ser una recuantización del modelo base Qwen2.5-0.5B-Instruct, podría heredar los sesgos presentes en el modelo original.
- Riesgo de alucinación: al tratarse de un modelo pequeño (0.5B), es más propenso a generar contenido plausible pero incorrecto en comparación con modelos de mayor tamaño.
- Limitaciones de contexto: la longitud de contexto no se especifica en el repositorio; el modelo base Qwen2.5-0.5B-Instruct tiene una ventana limitada, lo que puede restringir el uso en conversaciones largas o documentos extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero requiere conservar el aviso de licencia y atribución. El modelo es una copia recuantizada del modelo original, por lo que las condiciones del upstream se aplican sin cambios.
- Caveat de compatibilidad: el formato b-posit8 es experimental y requiere un fork específico de llama.cpp (`llama-cpp-et`) o el runtime de INVAR. No es compatible con todas las herramientas estándar del ecosistema GGUF.
- Dependencia del runtime determinista: la reproducibilidad bit-idéntica solo está garantizada si se utiliza el runtime determinista y el perfil exacto de INVAR. Con otros backends, las salidas podrían variar.

## Enlaces

- Repositorio en Hugging Face: [Anomly/Qwen2.5-0.5B-Instruct-bposit8](https://huggingface.co/Anomly/Qwen2.5-0.5B-Instruct-bposit8)
- Repositorio de INVAR: [anomly-labs/invar](https://github.com/anomly-labs/invar)
- Modelo base en Hugging Face: [Qwen/Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- Página de Qwen2.5 en Ollama: [qwen2.5:0.5b-instruct](https://ollama.com/library/qwen2.5:0.5b-instruct)
