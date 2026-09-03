# abenzerps/K2-Horizon-7B-MLX-4bit

## Resumen

K2-Horizon-7B-MLX-4bit es una conversión en formato MLX con cuantización de 4 bits del modelo original IFM/K2-Horizon-7B, desarrollado por IFM. Se trata de un modelo de lenguaje denso (dense decoder-only) de aproximadamente 9 000 millones de parámetros (aunque comercialmente se denomina "7B"), diseñado para tareas de razonamiento, generación de código, trabajo con contexto largo y uso de herramientas. Su característica más destacada es una ventana de contexto nativa de 524 288 tokens (512K), lo que lo sitúa entre los modelos de contexto más amplio disponibles en su rango de tamaño.

Esta versión cuantizada, publicada por el usuario abenzerps, está optimizada para ejecutarse en hardware Apple Silicon mediante la librería MLX. El repositorio incluye un cargador personalizado (`model.py`) que preserva la normalización RMS agrupada (grouped RMSNorm) del modelo original, y requiere la opción `--trust-remote-code` al usarse con MLX-LM. El modelo es exclusivamente de texto, sin componentes de visión ni módulos MTP. Su licencia Apache-2.0 permite uso comercial sin restricciones significativas, lo que lo hace atractivo para integraciones en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense decoder-only (detalles de la arquitectura transformer no especificados) |
| Parametros totales | 8 999 178 240 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 524 288 tokens (512K) |
| Tipos de cuantizacion | Affine 4-bit, grupo de tamaño 64 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de indicar que es un modelo denso decoder-only. El modelo original IFM/K2-Horizon-7B emplea una normalizacion RMS agrupada (grouped RMSNorm), que se preserva en esta conversion MLX mediante un cargador personalizado. No se han publicado datos sobre el conjunto de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO. La unica innovacion tecnica confirmada es la ventana de contexto de 512K tokens, que permite procesar documentos muy extensos sin truncamiento. La conversion a 4 bits utiliza cuantizacion afin con grupo de tamaño 64, un esquema comun en MLX que equilibra precision y uso de memoria.

## Capacidades

- Generacion de texto y razonamiento: el modelo esta disenado para tareas de razonamiento complejo, aunque no se especifican detalles sobre su rendimiento en benchmarks concretos.
- Generacion de codigo: indicado para tareas de programacion, aunque no se detallan lenguajes soportados ni metricas.
- Contexto largo: soporta hasta 512K tokens, lo que permite procesar libros completos, bases de codigo extensas o historiales de conversacion muy largos.
- Uso de herramientas (tool use): la model card menciona soporte para tool use, lo que sugiere capacidad de invocar funciones externas, aunque no se especifica el formato (p. ej., function calling estandar).
- Multilingue: solo se declara soporte para ingles.
- Texto unicamente: no incluye procesamiento de vision ni audio.

## Casos de uso

- Analisis de documentos legales extensos: gracias a su contexto de 512K tokens, el modelo puede procesar contratos o expedientes completos de una sola vez, extrayendo clausulas relevantes o resumiendo secciones sin perder informacion.
- Asistente de programacion en repositorios grandes: puede recibir un codigo fuente completo de un proyecto mediano como entrada y responder preguntas sobre su estructura, generar nuevas funciones o detectar patrones problematicos.
- Agentes conversacionales con memoria prolongada: su amplia ventana permite mantener historiales de chat de miles de turnos, adecuado para asistentes virtuales que necesitan recordar interacciones previas.
- Generacion de documentacion tecnica: a partir de una base de codigo o especificaciones extensas, puede redactar manuales, guias de API o comentarios de codigo coherentes.
- Razonamiento sobre corpus academicos: util para investigadores que necesitan analizar multiples articulos cientificos completos dentro de un unico prompt, extrayendo conclusiones cruzadas.
- Integracion en pipelines de automatizacion: al soportar tool use, puede conectarse a APIs o ejecutar comandos en entornos controlados, por ejemplo para generar informes a partir de datos estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen con graficas de rendimiento del modelo original, pero los valores numericos no estan accesibles en el texto. Por tanto, no es posible presentar una tabla comparativa con datos verificables.

## Requisitos de hardware

- Tamano del repositorio: 5,1 GB, lo que indica que los pesos cuantizados a 4 bits ocupan aproximadamente 5 GB en disco.
- VRAM estimada para inferencia: con cuantizacion 4-bit y 9B parametros, se requieren aproximadamente 5-6 GB de memoria para los pesos, mas overhead de activaciones y cache KV. En la practica, se recomienda al menos 8 GB de VRAM para un uso comodo.
- GPU compatibles: al ser un formato MLX, esta disenado exclusivamente para Apple Silicon (M1, M2, M3 y superiores). No es compatible directamente con CUDA.
- Opciones de despliegue: mediante MLX-LM (`mlx_lm.generate`), con la opcion `--trust-remote-code` para cargar el modelo personalizado. No se mencionan otras herramientas como vLLM u Ollama.
- Latencia y throughput: no se proporcionan datos concretos. En Apple Silicon, el rendimiento dependera del chip especifico; un Mac con M2 Max o superior podria alcanzar decenas de tokens por segundo, pero es una estimacion no verificada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de tamano similar y contexto largo. El modelo original IFM/K2-Horizon-7B no tiene una pagina de benchmarks publica con datos numericos accesibles, y no se conocen alternativas directas en el ecosistema MLX con las mismas caracteristicas. Por tanto, esta seccion queda como no disponible.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede introducir una perdida de precision en tareas de razonamiento complejo o generacion de codigo, aunque el esquema afin con grupo 64 mitiga parcialmente este efecto.
- El modelo solo soporta ingles; no es adecuado para aplicaciones multilingues sin un proceso de traduccion previo.
- Al ser una conversion de un tercero, no se garantiza que el comportamiento sea identico al modelo original. Se recomienda validar en casos de uso especificos.
- No se han publicado evaluaciones de sesgos o alucinaciones. Como cualquier modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en dominios especializados.
- El uso en produccion requiere gestionar el cargador personalizado (`model.py`) y la opcion `--trust-remote-code`, lo que implica ejecutar codigo remoto. Se debe revisar el contenido del repositorio antes de confiar en el.
- La licencia Apache-2.0 permite uso comercial, pero el modelo original puede tener condiciones adicionales; se recomienda verificar la licencia del checkpoint fuente.

## Enlaces

- Modelo cuantizado MLX: [abenzerps/K2-Horizon-7B-MLX-4bit](https://huggingface.co/abenzerps/K2-Horizon-7B-MLX-4bit)
- Modelo original: [IFM/K2-Horizon-7B](https://huggingface.co/IFM/K2-Horizon-7B)
- Revision fuente del modelo original: [2c9659a](https://huggingface.co/IFM/K2-Horizon-7B/tree/2c9659a84c4eea6f9f60462221fe762c8c84d75c)
