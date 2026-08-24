# nmeyers/Ornith-1.5-9B-bnb-4bit

## Resumen

Ornith-1.5-9B-bnb-4bit es una cuantización en 4 bits del modelo Ornith-1.5-9B, desarrollado por el equipo de Ornith AI. El modelo base forma parte de la familia Ornith-1.5, que introduce un marco de auto-mejora (self-scaffolding y self-improvement) en el que el propio modelo propone tareas, genera andamiajes específicos y produce rollouts para aprendizaje por refuerzo. Esta versión cuantizada, publicada por el usuario nmeyers, reduce el tamaño del modelo a aproximadamente 7,7 GB, lo que permite su ejecución en hardware de consumo con requisitos de VRAM moderados.

El modelo base es un transformer denso de 9.000 millones de parámetros, con licencia Apache 2.0 según la model card del repositorio cuantizado. Aunque la información oficial sobre arquitectura y entrenamiento es limitada, los resultados de búsqueda indican que el modelo original alcanza puntuaciones destacadas en benchmarks de razonamiento y código, como 70,6 en SWE-bench Verified y 86,4 en GPQA Diamond. Esta cuantización facilita el despliegue en entornos con restricciones de memoria, manteniendo presumiblemente la mayor parte de las capacidades del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit bitsandbytes (bnb-4bit) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible sobre la arquitectura interna del modelo base es escasa. Se sabe que es un modelo denso de 9B parametros, pero no se detallan el numero de capas, dimensiones ocultas ni el tipo de atencion. Segun la pagina oficial de Ornith AI, la familia Ornith-1.5 se construye sobre un marco de auto-mejora: el modelo genera sus propias tareas, crea andamiajes especificos para cada tarea y produce soluciones que se utilizan como datos de entrenamiento para refuerzo. Este proceso se extiende desde la version 1.0, que se centraba en self-scaffolding, hasta un bucle completo de auto-mejora en 1.5.

No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO. La cuantizacion en 4 bits se ha realizado con bitsandbytes, una tecnica estandar que reduce la precision de los pesos para disminuir el uso de memoria, a costa de una posible perdida minima de calidad en la salida.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta disenado para tareas de razonamiento complejo, como demuestran sus resultados en GPQA Diamond (86,4).
- Generacion de codigo: alcanza 70,6 en SWE-bench Verified, lo que indica una solida capacidad para resolver problemas de ingenieria de software reales.
- Auto-mejora: el modelo base incorpora un mecanismo de auto-scaffolding y auto-mejora, aunque esta funcionalidad probablemente no se mantiene en la version cuantizada.
- Multilingue: no se dispone de informacion sobre los idiomas soportados.
- Tool calling y agentes: no se menciona soporte explicito para function calling o uso como agente.

## Casos de uso

- Inferencia en dispositivos con recursos limitados: gracias a la cuantizacion 4-bit, el modelo puede ejecutarse en GPUs de consumo con 6-8 GB de VRAM, lo que lo hace adecuado para prototipos y aplicaciones en edge.
- Asistente de programacion local: con su buen rendimiento en SWE-bench, puede integrarse en entornos de desarrollo integrado (IDE) para sugerencias de codigo y autocompletado sin depender de servicios en la nube.
- Razonamiento cientifico y tecnico: su puntuacion en GPQA Diamond sugiere utilidad para responder preguntas de nivel avanzado en fisica, quimica y biologia, por ejemplo en herramientas educativas.
- Analisis de documentos tecnicos: el modelo puede resumir o extraer informacion de textos cientificos y tecnicos, aunque se desconoce su longitud de contexto maxima.
- Experimentacion academica: al ser de codigo abierto y ligero, es adecuado para investigacion en tecnicas de cuantizacion, evaluacion de modelos y comparativas de eficiencia.
- Desarrollo de chatbots especializados: su capacidad de razonamiento permite construir asistentes conversacionales para dominios concretos, siempre que se ajuste con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la version cuantizada. Los datos siguientes corresponden al modelo base Ornith-1.5-9B, segun la pagina AI/TLDR:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 70,6 |
| GPQA Diamond | 86,4 |

Estos valores indican un rendimiento notable en tareas de codigo y razonamiento cientifico, pero no se dispone de comparaciones directas con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada: con cuantizacion 4-bit, el modelo ocupa aproximadamente 4,5 GB en memoria (8.953.803.264 parametros x 4 bits / 8 = 4,48 GB), mas overhead de activaciones y contexto. Se recomienda al menos 6 GB de VRAM para inferencia comoda.
- GPUs compatibles: cualquier GPU con 6 GB o mas de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 4070, o GPUs de datacenter como A10G o T4.
- Opciones de despliegue: al ser un modelo en formato safetensors con cuantizacion bitsandbytes, puede cargarse con transformers y accelerate. Tambien es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporciona un archivo GGUF en el repositorio.
- Latencia y throughput: no se dispone de datos medidos. En una GPU RTX 4090, se espera una generacion de decenas de tokens por segundo, pero depende del contexto y la implementacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable con otros modelos de tamano similar (por ejemplo, Llama 3.1 8B, Qwen 2.5 7B o Mistral 7B). Los unicos datos de rendimiento disponibles son los del modelo base, y no se han encontrado evaluaciones comparativas publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion en 4 bits puede introducir una ligera degradacion en la calidad de las respuestas en comparacion con el modelo original en precision completa.
- No se ha verificado el comportamiento del modelo en tareas de generacion de codigo o razonamiento tras la cuantizacion; los benchmarks citados corresponden al modelo base.
- La licencia indicada en la model card es Apache 2.0, lo que permite uso comercial y modificacion, pero se recomienda revisar los terminos del modelo original (ornith-ai/Ornith-1.5-9B) por si existen restricciones adicionales.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma. Se recomienda realizar pruebas especificas antes de usar el modelo en produccion.
- El repositorio no incluye documentacion sobre el contexto maximo soportado, lo que puede limitar su uso en aplicaciones que requieran ventanas largas.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/nmeyers/Ornith-1.5-9B-bnb-4bit
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Pagina oficial de Ornith AI: https://ornith.ai/
- Articulo sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Resena en AI/TLDR: https://ai-tldr.dev/models/ornith-1-5-9b/
