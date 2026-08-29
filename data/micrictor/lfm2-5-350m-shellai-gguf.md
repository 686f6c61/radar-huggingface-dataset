# micrictor/LFM2.5-350M-ShellAI-GGUF

## Resumen

LFM2.5-350M-ShellAI-GGUF es un modelo de lenguaje especializado en la generación de comandos Bash, creado por el usuario micrictor mediante destilación a nivel de respuesta desde el modelo `LiquidAI/LFM2.5-2.6B` hacia el modelo base `LiquidAI/LFM2.5-350M`. El resultado es un modelo compacto de 354 millones de parámetros que emite exactamente un comando shell encerrado entre las etiquetas `<shellai-command>` y `</shellai-command>`. El repositorio contiene una cuantización post-entrenamiento en formato GGUF Q8_0, optimizada para inferencia eficiente en CPU y dispositivos con recursos limitados.

Este modelo resuelve el problema de generar comandos Bash fiables y seguros en entornos con restricciones de memoria y cómputo, como dispositivos edge o integraciones en pipelines de automatización. Su relevancia radica en que combina la capacidad de un modelo destilado de alto rendimiento con un formato de pesos ligero, permitiendo su ejecución en hardware modesto sin necesidad de GPU dedicada. La destilación se realizó con técnicas de retención de conocimiento para minimizar el olvido catastrófico, y se aplicaron filtros de seguridad para evitar la ejecución de comandos no verificados durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (hibrida, basada en LiquidAI/LFM2.5-350M) |
| Parametros totales | 354.483.968 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M pertenece a la familia LFM2 de Liquid AI, una arquitectura hibrida que combina mecanismos de atención lineal y modelos de espacio de estados (SSM) para lograr inferencia rapida y bajo consumo de memoria. El modelo base fue pre-entrenado con 28 billones de tokens y posteriormente refinado con aprendizaje por refuerzo a gran escala, lo que mejora sus capacidades de chat, seguimiento de instrucciones y tool calling.

La destilacion de ShellAI se realizo a nivel de secuencia, no mediante divergencia KL de logits, debido a que el profesor (LFM2.5-2.6B) y el estudiante (LFM2.5-350M) tienen vocabularios diferentes (128K y 65.536 tokens respectivamente). Se utilizaron anclajes de chat, perdida solo sobre las respuestas del asistente, LoRA, una sola epoca de entrenamiento, early stopping y una compuerta de retencion previa a la publicacion para reducir el olvido catastrofico. Durante la construccion del dataset y la evaluacion no se ejecuto ningun comando generado, garantizando la seguridad del proceso.

## Capacidades

- Generacion de un unico comando Bash por respuesta, encerrado en el formato `<shellai-command>comando</shellai-command>`.
- Especializacion en tareas de shell: el modelo esta disenado para producir comandos utiles y sintacticamente validos, con una tasa de envoltura valida del 100% en las pruebas.
- Retencion parcial de capacidades conversacionales: gracias a los anclajes de chat, el modelo mantiene un 84,9% de la similitud con el modelo base en prompts no relacionados con shell, aunque su uso principal no es conversacional.
- Inferencia eficiente en CPU: gracias a la cuantizacion Q8_0 y al tamano reducido, puede ejecutarse en procesadores sin GPU, alcanzando velocidades de decodificacion de 16-32 tokens por segundo en pruebas con 1-2 hilos.
- No soporta tool calling general ni agentes multi-paso; su unica salida es el comando shell.

## Casos de uso

- Automatizacion de tareas de administracion de sistemas: el modelo puede generar comandos para gestion de archivos, procesos, permisos o servicios, integrandose en scripts de mantenimiento o en asistentes de linea de comandos.
- Generacion de comandos en pipelines de CI/CD: al emitir comandos Bash validos, puede usarse para construir pasos de despliegue o pruebas automatizadas, reduciendo el tiempo de escritura manual.
- Asistente de terminal para desarrolladores: integrado en herramientas de linea de comandos, sugiere comandos basados en descripciones en lenguaje natural, mejorando la productividad en entornos de desarrollo.
- Educacion y formacion en shell: puede utilizarse como generador de ejemplos de comandos para tutoriales o practicas guiadas, mostrando la sintaxis correcta de operaciones comunes.
- Dispositivos edge y embebidos: su tamano reducido y compatibilidad con CPU lo hacen apto para ejecutarse en routers, NAS o sistemas de bajo consumo que necesiten automatizacion local sin conexion a la nube.
- Prototipado rapido de herramientas de automatizacion: al ser un modelo ligero, puede desplegarse en entornos de desarrollo para validar flujos de trabajo antes de escalar a modelos mas grandes.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluacion sobre un split de test del repositorio (300 ejemplos, en BF16 con Transformers):

| Modelo | Exact | Utility match | Token F1 | Envoltura valida |
|---|---:|---:|---:|---:|
| Base 350M | 5,7% | 23,0% | 0,225 | 100,0% |
| Destilado 350M | 4,0% | 39,7% | 0,305 | 100,0% |

Prueba en CPU con llama.cpp (Q8_0, subconjunto de 50 ejemplos):

| Hilos | Token F1 | Utility match | Latencia mediana | Decodificacion |
|---:|---:|---:|---:|---:|
| 1 | 0,268 | 36,0% | 1278 ms | 16,6 tok/s |
| 2 | 0,268 | 36,0% | 641 ms | 32,5 tok/s |

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en Q8_0 ocupa aproximadamente 354 MB de pesos, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, aunque tambien puede ejecutarse completamente en CPU.
- GPU recomendadas: no requiere GPU especifica; cualquier GPU moderna (incluso integradas) puede ejecutarlo, aunque la inferencia en CPU es viable y eficiente.
- Compatibilidad con consumer GPU: si, cabe en tarjetas como GTX 1650, RTX 2060 o superiores, asi como en Apple Silicon.
- Opciones de despliegue: compatible con llama.cpp, Ollama, y cualquier runtime que soporte GGUF (por ejemplo, LM Studio, text-generation-webui). Tambien puede cargarse con Transformers si se convierte a safetensors.
- Latencia y throughput: en CPU con 2 hilos se obtienen 32,5 tok/s de decodificacion y una latencia mediana de 641 ms para generar una respuesta completa; con 1 hilo, 16,6 tok/s y 1278 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| LFM2.5-350M-ShellAI-GGUF (este) | 354M | No disponible | GGUF Q8_0 | LFM Open v1.0 | Generacion de comandos Bash |
| LiquidAI/LFM2.5-350M (base) | 354M | No disponible | Safetensors | LFM Open v1.0 | Chat, instrucciones, tool calling |
| LiquidAI/LFM2-350M-GGUF | 350M | No disponible | GGUF | LFM Open v1.0 | Chat, instrucciones, tool calling |

La comparativa se limita a los modelos de la misma familia y tamano. El modelo destilado mejora la utilidad de los comandos generados (39,7% vs 23,0% en utility match) respecto al base, aunque pierde algo de exactitud literal (4,0% vs 5,7%). No se dispone de datos de otros modelos especializados en shell para una comparacion mas amplia.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo genera comandos Bash; no es adecuado para tareas generales de chat, generacion de texto o razonamiento complejo.
- Riesgo de alucinacion: aunque la envoltura es siempre valida, el comando generado puede ser incorrecto o no hacer lo que se pide; se recomienda validar antes de ejecutar.
- Sin ejecucion de comandos: el modelo no ejecuta los comandos que genera; la responsabilidad de la ejecucion recae en el usuario.
- Licencia restrictiva: la LFM Open License v1.0 no es una licencia open source estandar; impone restricciones de uso comercial y modificacion. Revisar los terminos completos antes de su uso en produccion.
- Idiomas no especificados: no se ha documentado el soporte multilingue; probablemente este optimizado para ingles, pero no se confirma.
- Contexto limitado: no se ha publicado la longitud de contexto; al ser un modelo de 350M, es probable que sea menor que el de modelos grandes, lo que limita la entrada de prompts largos.
- Dependencia del modelo base: las capacidades del modelo estan limitadas por el rendimiento del LFM2.5-350M, que es un modelo pequeno y puede cometer errores en tareas complejas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/micrictor/LFM2.5-350M-ShellAI-GGUF
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Documentacion de Liquid AI para LFM2.5-350M: https://docs.liquid.ai/lfm/models/lfm25-350m
- Coleccion LFM2.5 de Liquid AI en HuggingFace: https://huggingface.co/collections/LiquidAI/lfm25
- Repositorio del modelo base LFM2-350M-GGUF: https://huggingface.co/LiquidAI/LFM2-350M-GGUF
