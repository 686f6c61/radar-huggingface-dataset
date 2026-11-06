# noahdeangelis/Pluto-1-114M-Chat

## Resumen
Pluto-1-114M-Chat es un modelo de lenguaje conversacional de pequeno tamano (114 millones de parametros) desarrollado por el usuario noahdeangelis y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo entrenado desde cero sobre 5.000 millones de tokens del dataset FineWeb-Edu, utilizando el tokenizador de GPT-2, lo que equivale a unos 40 tokens por parametro. El autor lo presenta explicitamente como una prueba de concepto para su primera serie de modelos, no como un modelo orientado a produccion.

La relevancia de este modelo es limitada y de caracter experimental: el propio autor advierte en la model card que el rendimiento es deficiente, con matematicas muy pobres y tendencia a quedarse atascado en el primer tema mencionado. Su interes principal radica en servir como referencia para quienes estudian el entrenamiento de modelos pequenos desde cero, el efecto de la relacion tokens/parametro o el comportamiento de modelos por debajo de los 200M de parametros en tareas conversacionales.

El modelo se distribuye en formato GGUF (con una variante f16 mencionada en la model card) y esta pensado para su uso con llama.cpp a traves de llama-server. Solo soporta ingles y no se han publicado datos de benchmarks, pipeline declarado ni informacion sobre la composicion detallada del dataset mas alla de la mencion a FineWeb-Edu.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder-only, inferido del uso de tokenizador GPT-2; no confirmado en la informacion) |
| Parametros totales | 114.114.048 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variante f16 mencionada; no se detallan otras) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,2 GB; no se confirma safetensors en la informacion) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna mas alla de que se entreno con el tokenizador de GPT-2, lo que sugiere una arquitectura de tipo transformer decoder-only con vocabulario GPT-2, aunque este extremo no se confirma explicitamente en la model card. El modelo se entreno desde cero sobre 5.000 millones de tokens del dataset FineWeb-Edu, una coleccion de contenido web filtrado por valor educativo. La relacion de entrenamiento es de aproximadamente 40 tokens por parametro, un ratio notablemente bajo en comparacion con los estandares actuales (que suelen superar los 100-1000 tokens por parametro en modelos pequenos).

No se menciona en la informacion proporcionada el uso de RLHF, DPO, SFT u otras tecnicas de alineacion, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se detalla la composicion exacta del dataset mas alla de la referencia a FineWeb-Edu ni el numero de pasos de entrenamiento, la configuracion de hiperparametros o el hardware utilizado.

## Capacidades
- Generacion de texto conversacional en ingles, con calidad limitada segun el propio autor.
- Razonamiento basico y matematicas: el autor califica explicitamente el rendimiento matematico como "terrible".
- Capacidad de mantener el hilo conversacional muy limitada: el modelo tiende a quedarse atascado en el primer tema mencionado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso
- Experimentacion educativa sobre entrenamiento de modelos desde cero: util para estudiar el efecto de la relacion tokens/parametro (40 tokens por parametro) en modelos de 114M y comparar con modelos entrenados con ratios mayores.
- Pruebas de infraestructura de inferencia con llama.cpp: el modelo, al ser pequeno y estar en GGUF, permite validar pipelines de despliegue con llama-server y ajustes de temperatura y top-k sin consumir recursos significativos.
- Referencia base para fine-tuning experimental: puede servir como punto de partida para estudiar como el ajuste fino sobre tareas concretas afecta a un modelo con capacidades conversacionales muy limitadas.
- Docencia sobre limitaciones de modelos pequenos: util como ejemplo practico de los fallos tipicos (perseveracion en el tema, matematicas deficientes) en modelos por debajo de los 200M de parametros.
- Prototipado de interfaces conversacionales sin requisitos de calidad: para validar integraciones de UI o APIs de chat donde el contenido generado no sea critico.
- Investigacion sobre sesgos y comportamiento de modelos entrenados con FineWeb-Edu: permite analizar que tipo de respuestas produce un modelo pequeno entrenado exclusivamente con contenido educativo filtrado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en cuantizaciones de 4-8 bits; en f16, aproximadamente 0,23 GB solo para los pesos (114M parametros x 2 bytes), mas overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090 o incluso en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en sistemas integrados.
- Opciones de despliegue: llama.cpp / llama-server (metodo indicado por el autor), y por extension cualquier runtime compatible con GGUF como Ollama o LM Studio. vLLM y TGI no se mencionan en la informacion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en hardware consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Pluto-1-114M-Chat | 114M | no disponible | Apache 2.0 | Hugging Face (GGUF) | Entrenado desde cero, 5B tokens, solo ingles, rendimiento declarado pobre por el autor |
| GPT-2 small | 124M | 1.024 tokens | MIT | Ampliamente disponible | Referencia clasica de modelo pequeno; tokenizador compartido con Pluto |
| SmolLM-135M | 135M | 2.048 tokens (segun variante) | Apache 2.0 | Hugging Face | Modelo pequeno moderno con mejor rendimiento reportado; datos no verificados en esta ficha |

La comparativa se limita a modelos de orden de magnitud similar; no se dispone de datos de benchmarks de Pluto-1-114M-Chat para establecer comparaciones cuantitativas de rendimiento.

## Limitaciones y advertencias
- Rendimiento deficiente reconocido por el autor: matematicas "terribles" y tendencia a quedarse atascado en el primer tema de la conversacion.
- Riesgo elevado de alucinacion y respuestas incoherentes dada la baja capacidad del modelo y el limitado volumen de entrenamiento (5B tokens).
- Solo soporta ingles; no hay capacidades multilingues.
- Longitud de contexto no documentada, lo que impide planificar su uso en conversaciones de contexto largo.
- No se han publicado evaluaciones de sesgos; al entrenarse con FineWeb-Edu, puede heredar sesgos presentes en contenido web filtrado por criterios de valor educativo.
- Aunque la licencia Apache 2.0 permite uso comercial, el rendimiento del modelo lo hace inadecuado para aplicaciones en produccion.
- Sin informacion sobre alineacion (RLHF/DPO), por lo que no hay garantias sobre el cumplimiento de instrucciones ni sobre la seguridad de las respuestas.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/noahdeangelis/Pluto-1-114M-Chat
- Dataset FineWeb-Edu (referencia de entrenamiento): no se proporciona enlace directo en la informacion disponible
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
