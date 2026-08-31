# RuihanRZhao/Qwen3.5-9B-ultra-uncensored-heretic-8bit

## Resumen

Qwen3.5-9B-ultra-uncensored-heretic-8bit es un modelo de lenguaje basado en Qwen3.5-9B, publicado por el usuario RuihanRZhao en Hugging Face. Se trata de una variante modificada mediante la herramienta Heretic, cuyo objetivo es eliminar los mecanismos de censura y rechazo presentes en el modelo original. El resultado es un modelo de generación de texto conversacional orientado a respuestas sin restricciones temáticas.

El modelo se distribuye en formato MLX (optimizado para Apple Silicon) y también en safetensors, con cuantización de 8 bits según su nombre. La información pública es extremadamente limitada: la model card está vacía, no hay licencia declarada, ni datos de entrenamiento, ni benchmarks publicados. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar aún subidos o que el acceso está restringido. A pesar de ello, el nombre y los tags indican que es un modelo de 9 mil millones de parámetros, especializado en inglés y pensado para tareas de conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B, sin detalles adicionales) |
| Parametros totales | 9 mil millones (estimado por el nombre, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (indicado en el nombre), 4-bit (tag de Hugging Face) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | MLX, safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna del modelo. Por el nombre, se asume que deriva de Qwen3.5-9B, un modelo transformer denso de la familia Qwen, pero no se ha publicado ninguna especificacion oficial en la model card. El proceso de creacion probablemente consistio en aplicar la herramienta Heretic (desarrollada por p-e-w) al modelo base Qwen3.5-9B para eliminar los comportamientos de censura. Heretic es un metodo que modifica los pesos del modelo para suprimir los patrones de rechazo sin necesidad de reentrenamiento, actuando sobre las capas internas responsables de la censura.

No hay datos sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. La cuantizacion a 8 bits sugiere un ajuste posterior para reducir el tamaño del modelo, pero no se especifican los detalles de este proceso.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas sin filtros de censura tematica.
- Mantiene las capacidades generales del modelo base Qwen3.5-9B (razonamiento, conocimiento general, redaccion), aunque sin datos concretos de rendimiento.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha confirmado soporte para vision, audio u otras modalidades (probablemente sea solo texto).
- La eliminacion de censura implica que puede generar contenido que el modelo base rechazaria, incluyendo temas sensibles o controvertidos.

## Casos de uso

- Creacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos que aborden temas tabu o controvertidos sin que el modelo se niegue a responder.
- Investigacion academica sobre sesgos y mecanismos de censura en modelos de lenguaje: permite estudiar como se comporta un modelo decensorado frente al original.
- Generacion de respuestas en dominios especializados donde la censura del modelo base podria limitar la utilidad, como educacion sexual, salud mental o discusiones politicas.
- Desarrollo de chatbots personalizados para nichos de usuarios que buscan interacciones sin moderacion tematica.
- Pruebas de estres para sistemas de moderacion de contenido: el modelo puede servir para evaluar la robustez de filtros de contenido ante respuestas generadas sin restricciones.
- Experimentacion con cuantizacion MLX en Apple Silicon: el formato 8-bit permite probar el rendimiento de modelos grandes en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo especifico. Tampoco se dispone de comparaciones con el modelo base Qwen3.5-9B o con otras variantes del mismo.

## Requisitos de hardware

- VRAM estimada: para un modelo de 9B en cuantizacion 8-bit, se requieren aproximadamente 9-10 GB de VRAM para inferencia en FP16, y alrededor de 5-6 GB en 8-bit. En 4-bit, podria bajar a 3-4 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) para la version 8-bit. En Apple Silicon, el formato MLX permite ejecucion en GPU unificada de Macs con 16 GB o mas de RAM.
- Si cabe en GPU de consumo: si, en cuantizacion 8-bit cabe en GPUs de gama media con 8-10 GB. En 4-bit cabria en tarjetas de 6 GB.
- Opciones de despliegue: al ser formato MLX, se puede ejecutar con mlx-lm; para safetensors, se puede usar vLLM, llama.cpp, Ollama o TGI, aunque no hay guias oficiales para este modelo concreto.
- Latencia y throughput: no se han publicado datos. Como referencia, un modelo de 9B en 8-bit en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, pero esto no esta confirmado para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B-ultra-heretic (bitnom) | 9B | no disponible | no disponible | Hugging Face |
| Qwen3.5-9B-ultra-uncensored-heretic-v2-i1-GGUF (mradermacher) | 9B | no disponible | no disponible | Hugging Face |
| Qwen3.5-9B base | 9B | no disponible | Apache 2.0 (estimado) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes. Todas parecen derivar del mismo modelo base Qwen3.5-9B con diferentes metodos de eliminacion de censura y formatos de cuantizacion. La variante de mradermacher esta en GGUF, la de bitnom en formato desconocido y la de RuihanRZhao en MLX/safetensors.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo decensorado, puede reproducir y amplificar sesgos problematicos que el modelo base habria filtrado. No hay informacion sobre mitigaciones.
- Riesgo de alucinacion: no se han evaluado las tasas de alucinacion; es probable que sean similares a las del modelo base, pero sin datos no se puede confirmar.
- Limitaciones de contexto: se desconoce la longitud maxima de contexto; si es heredada de Qwen3.5-9B, podria ser de 32K o 128K, pero no esta confirmado.
- Restricciones de licencia: la licencia es "no disponible", lo que impide su uso comercial sin una aclaracion legal. El modelo base Qwen3.5 suele tener licencia Apache 2.0, pero esta variante modificada no declara nada.
- Contenido generado sin filtros: el modelo puede producir contenido ofensivo, ilegal o peligroso. No es apto para aplicaciones en produccion sin sistemas de moderacion externos.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos no estan disponibles o el repositorio esta vacio. Es posible que el modelo no sea descargable en la practica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RuihanRZhao/Qwen3.5-9B-ultra-uncensored-heretic-8bit
- Modelo relacionado (bitnom): https://huggingface.co/bitnom/Qwen3.5-9B-ultra-heretic
- Modelo relacionado (mradermacher): https://huggingface.co/mradermacher/Qwen3.5-9B-ultra-uncensored-heretic-v2-i1-GGUF
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Guia de despliegue de Qwen 3.5 9B en GPU de 8GB: https://insiderllm.com/guides/qwen-3-5-9b-setup-guide/
