# Robot-Haus/Qwen3.8-27B-original-oQ3.5e-mtp

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. Está diseñado para ejecutarse en hardware local y destaca en tareas de codificación, flujos de trabajo agénticos y automatización de oficina. El checkpoint que nos ocupa, `Robot-Haus/Qwen3.8-27B-original-oQ3.5e-mtp`, es una cuantización realizada por Robot-Haus a partir de los pesos oficiales sin modificar, utilizando el pipeline oQe (imatrix-calibrated) de oMLX a una profundidad de bits equivalente a Q3.5 con pesos en bf16. La cuantización conserva tanto la torre de visión como los cabezales de Multi-Token Prediction (MTP), verificados mediante inspección directa del índice de tensores.

Este modelo resuelve el problema de la falta de checkpoints cuantizados fiables que mantengan intactos los componentes de visión y MTP, algo que, según el autor, es poco común en las subidas de la comunidad. Al cuantizar directamente desde los pesos oficiales, se garantiza que la funcionalidad multimodal y la decodificación especulativa (MTP) sigan operativas. Con un tamaño de repositorio de 14,8 GB, es adecuado para ejecutarse en Apple Silicon (M3/M4) mediante oMLX, y también podría funcionar en CUDA, aunque no ha sido probado en esa plataforma.

La relevancia actual radica en que ofrece una alternativa de alta calidad para quienes necesitan un modelo multimodal de 27B con licencia Apache 2.0, cuantizado y listo para usar en entornos locales, sin sacrificar la integridad de los componentes que suelen perderse en otras conversiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) |
| Parametros totales | 27B (modelo base) / 4.380.854.512 (dato reportado en HuggingFace, posible discrepancia) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (segun documentacion del modelo base) |
| Tipos de cuantizacion | oQe Q3.5 equivalente (mixed precision, imatrix-guided), pesos bf16 |
| Idiomas soportados | Ingles (declarado en la model card; el modelo base podria soportar mas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso de 27 000 millones de parametros con arquitectura transformer multimodal, capaz de procesar entradas de imagen y video de forma nativa junto con texto. Incluye una torre de vision (vision tower) y cabezales de Multi-Token Prediction (MTP) para decodificacion especulativa, lo que acelera la generacion de texto. El checkpoint cuantizado por Robot-Haus mantiene estos componentes: se verificaron 333 tensores de la torre de vision y 29 tensores de MTP en el indice de safetensors.

El proceso de cuantizacion oQe (oMLX imatrix-calibrated) recopila estadisticas de activacion sobre un corpus de calibracion y las utiliza para guiar la cuantizacion por tensor, protegiendo los pesos mas sensibles a la perdida de precision. Esto permite que, a igual tamano de archivo, el modelo cuantizado conserve mejor el rendimiento que una cuantizacion uniforme simple. No se realizo ningun fine-tuning, abliteracion ni fusion de modelos; se trata de una cuantizacion directa de los pesos originales.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del modelo base Qwen3.8-27B, incluyendo razonamiento complejo y comprension de instrucciones.
- Vision multimodal: acepta imagenes y video como entrada, ademas de texto, gracias a la torre de vision integrada.
- Codificacion: destaca en tareas de programacion, con buen rendimiento en benchmarks de codigo (DeepSWE 42.2, segun el blog de referencia).
- Flujos de trabajo agénticos: soporta tareas de agente y automatizacion de oficina, con puntuaciones altas en Terminal Bench (73.0) y OSWorld (84.3).
- Multi-Token Prediction (MTP): los cabezales MTP permiten decodificacion especulativa, acelerando el throughput de generacion cuando se activa la opcion "Lightning MTP" en oMLX.
- Multilingue: aunque la model card declara solo ingles, el modelo base de Qwen suele soportar multiples idiomas; no se ha verificado en esta cuantizacion.

## Casos de uso

- Asistente de codigo en local: un desarrollador puede integrar el modelo en su IDE o CLI para autocompletar y generar codigo, aprovechando la cuantizacion Q3.5 para ejecutarse en una Mac con 16 GB de RAM unificada o mas. La capacidad de vision permite ademas analizar capturas de pantalla o diagramas.
- Automatizacion de oficina: el modelo puede procesar documentos escaneados, extraer informacion de imagenes y generar resumenes o respuestas, gracias a su entrada multimodal y su contexto largo de 262K tokens.
- Agente de terminal: con soporte para tareas agénticas, puede ejecutar comandos, interpretar salidas y tomar decisiones en entornos de linea de comandos, como se refleja en su puntuacion de Terminal Bench.
- Analisis de video: al aceptar entrada de video, puede resumir contenido audiovisual, extraer eventos clave o generar descripciones, util para vigilancia o revision de material.
- Chat conversacional con contexto largo: su ventana de 262K tokens permite mantener conversaciones extensas con historial completo, adecuado para atencion al cliente o asistentes virtuales.
- Prototipado rapido de aplicaciones multimodales: investigadores y desarrolladores pueden desplegar el modelo en oMLX para experimentar con interacciones texto-imagen-video sin necesidad de hardware especializado, gracias a su licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint cuantizado. Los datos disponibles corresponden al modelo base Qwen3.8-27B, segun el blog de lovableapp.org:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE (codigo) | 42.2 |
| Terminal Bench (agente) | 73.0 |
| OSWorld (agente) | 84.3 |

Estos valores son orientativos; la cuantizacion Q3.5 puede introducir una degradacion en el rendimiento, aunque la tecnica oQe esta disenada para minimizarla. No se dispone de comparaciones directas con otros modelos cuantizados en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 14,8 GB, por lo que se necesita al menos 16 GB de memoria unificada en Apple Silicon para cargar el modelo con margen. En CUDA, se requeriria una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090 o A100).
- GPU recomendadas: Apple Silicon M3/M4 (por su soporte nativo de bf16), M1/M2 con la version fp16 del companion. En CUDA no ha sido probado, pero podria funcionar en GPUs NVIDIA con suficiente VRAM.
- Compatibilidad con GPU de consumo: si, en Macs con 16 GB o mas de RAM unificada. En PC, una RTX 4080 o superior podria ejecutarlo, aunque sin garantias.
- Opciones de despliegue: oMLX (principal), tambien puede cargarse como modelo MLX estandar. No se menciona soporte para vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no se proporcionan datos concretos. La activacion de MTP (Lightning MTP) deberia mejorar el throughput de decodificacion, pero no se cuantifica.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa directa con otros modelos cuantizados de la misma categoria. Como referencia, el modelo base Qwen3.8-27B compite con otros LLMs multimodales de tamano similar, como Qwen2.5-VL-27B o Llama 3.2 Vision (aunque este ultimo es mas pequeno). La ventaja principal de este checkpoint es su cuantizacion oQe con MTP y vision intactos, algo poco comun en la comunidad. No se pueden aportar datos numericos de comparacion sin benchmarks propios.

## Limitaciones y advertencias

- La cuantizacion Q3.5 puede provocar una perdida de precision en tareas complejas en comparacion con el modelo original en bf16/fp16. Se recomienda validar el rendimiento en el caso de uso concreto.
- El modelo solo declara soporte para ingles; aunque el base podria soportar otros idiomas, no esta verificado en esta version.
- No ha sido probado en CUDA; su funcionamiento en GPUs NVIDIA es incierto y podria requerir ajustes.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion y no se ofrecen garantias.
- El numero de parametros reportado en HuggingFace (4.38B) no coincide con el tamano del modelo base (27B); esto podria deberse a un error en el registro o a una interpretacion distinta de los tensores cuantizados. Se recomienda verificar el indice de safetensors antes de asumir el tamano real.
- No se incluyen instrucciones de uso fuera de oMLX; para otros entornos puede ser necesario convertir el formato.

## Enlaces

- [HuggingFace - Robot-Haus/Qwen3.8-27B-original-oQ3.5e-mtp](https://huggingface.co/Robot-Haus/Qwen3.8-27B-original-oQ3.5e-mtp)
- [GitHub - AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Blog lovableapp - Qwen3.8-27B Guide](https://lovableapp.org/blog/qwen3-8-27b)
- [Blog kingy.ai - Qwen3.8-27B Specs & Benchmarks](https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/)
- [Companion fp16 - Robot-Haus/Qwen3.8-27B-original-oQ3.5e-fp16-mtp](https://huggingface.co/Robot-Haus/Qwen3.8-27B-original-oQ3.5e-fp16-mtp)
