# sifat-febo/banglish-companion-3b-gguf

## Resumen

Banglish Companion 3B es un modelo de lenguaje conversacional diseñado específicamente para el banglish, la forma de escribir bengalí con caracteres latinos que usan millones de personas en Bangladesh y la diáspora. Lo desarrolla Sifat Febo, que lo describe como el primer modelo conversacional de este tipo. El modelo base es Ministral-3-3B-Base-2512 de Mistral AI, con 3.429 millones de parámetros, y se distribuye en formato GGUF cuantizado para ejecución local eficiente.

Este repositorio concreto contiene dos archivos GGUF (Q4_K_M y Q8_0) que permiten ejecutar el modelo en CPU o GPU con pocos recursos, sin necesidad de conexión a internet una vez descargado. Incluye además un script `companion.py` que implementa un guard de seguridad: si el usuario escribe que está en peligro, responde con texto fijo de un archivo Python en lugar de usar el modelo. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su enfoque en una lengua de bajos recursos (el banglish) y en su diseño para inferencia local en hardware modesto, lo que lo hace accesible para comunidades con poca infraestructura tecnológica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Ministral-3-3B-Base-2512 de Mistral AI) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (2,15 GB), Q8_0 (3,65 GB) |
| Idiomas soportados | Banglish (bengali fonetico en alfabeto latino); la model card indica "Banglish only", no bengali en escritura propia ni ingles formal |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion disponible, pero al estar basado en Ministral-3-3B-Base-2512 de Mistral AI, se trata de un transformer decoder-only de 3.000 millones de parametros. No se especifican los datos de entrenamiento, el numero de tokens ni el proceso de alineacion (RLHF, DPO, etc.). La model card del modelo base indica que es un chatbot casual y amigable, pero no ofrece detalles tecnicos adicionales.

La unica innovacion destacable en este repositorio es el guard de seguridad implementado en Python: antes de consultar al modelo, el script `companion.py` comprueba si el mensaje del usuario indica peligro inminente y, en ese caso, responde con texto fijo desde `nirapotta.py` sin invocar al modelo. Esto es una capa de seguridad externa, no una caracteristica del modelo en si.

## Capacidades

- Generacion de texto conversacional en banglish (bengali fonetico en alfabeto latino).
- Mantiene conversaciones cortas y casuales; la model card advierte que pierde el hilo en conversaciones largas.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades de vision, audio ni modo thinking.
- El guard de seguridad detecta frases de peligro y responde con texto fijo, sin pasar por el modelo.
- Ejecucion local sin GPU, pensado para entornos con recursos limitados.

## Casos de uso

- Atencion al usuario en banglish: un chatbot para sitios web o aplicaciones de mensajeria que responda en el registro informal y fonetico que usan los hablantes de bengali en internet.
- Asistente personal en dispositivos de bajo coste: al caber en 2,15 GB, puede ejecutarse en una Raspberry Pi o un portatil antiguo sin GPU, ofreciendo respuestas conversacionales sin conexion.
- Practica de idioma para la diaspora: personas de origen bengali que quieren conversar en su lengua materna escrita en alfabeto latino, con un tono cercano y sin jerga formal.
- Prototipado de aplicaciones de salud mental en contextos de bajos recursos: el guard de seguridad permite detectar mensajes de crisis y derivar a recursos de ayuda, aunque el modelo no es un sustituto profesional.
- Educacion informal: generar explicaciones o dialogos en banglish para materiales de aprendizaje, siempre que el usuario verifique los hechos porque el modelo puede inventar datos.
- Investigacion en NLP para lenguas de bajos recursos: sirve como punto de partida para estudiar el rendimiento de modelos pequenos en banglish y para fine-tuning posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estandar. La model card solo advierte que el modelo "afirma cosas erroneas con confianza" y que no es una fuente de hechos.

## Requisitos de hardware

- VRAM estimada: con Q4_K_M (2,15 GB) puede ejecutarse en CPU con 4 GB de RAM libre; con Q8_0 (3,65 GB) se recomienda al menos 6 GB de RAM.
- GPU recomendadas: no requiere GPU; funciona en CPU. Si se usa GPU, cualquier tarjeta con 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) es suficiente para Q4_K_M.
- Cabe en consumer GPU: si, en GPUs de gama baja con 4 GB o mas.
- Opciones de despliegue: llama-cpp-python (recomendado en la model card), tambien compatible con llama.cpp, Ollama y otros motores que soporten GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de 3B en CPU, se espera una generacion de unos 5-15 tokens por segundo en un portatil moderno, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos. El modelo base es Ministral-3-3B-Base-2512 de Mistral AI, que es un modelo generico de 3B. Otros modelos de tamano similar (por ejemplo, Gemma-2-2B, Phi-3-mini) no estan especializados en banglish, por lo que una comparativa directa no es significativa sin datos de rendimiento. Se indica "no disponible" para esta seccion.

## Limitaciones y advertencias

- El modelo solo entiende banglish; no procesa bengali en escritura propia ni ingles formal. No hay registro formal en el lenguaje escrito, lo que limita su uso en contextos profesionales.
- Riesgo alto de alucinacion: la model card advierte explicitamente que inventa numeros y nombres a mitad de frase. No debe usarse como fuente de informacion factual.
- Conversaciones cortas: pierde el hilo en dialogos largos, por lo que no es adecuado para tareas que requieran memoria extendida.
- No es un terapeuta, medico ni abogado: el guard de seguridad solo cubre mensajes de peligro, pero el modelo no tiene criterio profesional.
- Algunas respuestas no son generadas por el modelo: si el usuario indica peligro, la respuesta es texto fijo de un archivo Python, no del modelo. Esto puede confundir al usuario si no se explica.
- La licencia Apache 2.0 permite uso comercial, pero el autor pide citar el modelo base y no el empaquetado GGUF como contribucion separada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sifat-febo/banglish-companion-3b-gguf
- Modelo base (safetensors): https://huggingface.co/sifat-febo/banglish-companion-3b
- Modelo base original de Mistral AI: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Version MLX para Mac: https://huggingface.co/sifat-febo/banglish-companion-3b-mlx
