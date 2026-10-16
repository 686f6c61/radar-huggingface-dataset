# GrillingWithJorge/gemma-4-12B-it-oQ4e-fp16

## Resumen

gemma-4-12B-it-oQ4e-fp16 es una version cuantizada del modelo gemma-4-12B-it, publicada por el usuario GrillingWithJorge en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos a 4 bits mediante la herramienta oQ (oMLX v0.7.0), un esquema de cuantizacion de precision mixta orientado al ecosistema MLX de Apple. El repositorio ocupa 7,2 GB y contiene 11.959.730.224 parametros en formato MLX safetensors.

El interes de esta publicacion es puramente practico: permite ejecutar un modelo denso de aproximadamente 12.000 millones de parametros en hardware Apple Silicon con un consumo de memoria reducido, algo relevante para desarrollo local, prototipado e inferencia en equipos sin GPU dedicada. Al estar empaquetado en MLX, queda fuera del circuito habitual de vLLM, TGI o llama.cpp en su formato original, y su publico objetivo son desarrolladores que trabajan en macOS con chips M-series.

La informacion disponible es muy limitada. La model card solo documenta los parametros de cuantizacion (4 bits, grupo de 64, precision mixta) y no incluye datos sobre el modelo base, la licencia, los idiomas soportados ni resultados de evaluacion. El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, y fue creado y actualizado el 15 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tipo de modelo declarado: gemma4_unified) |
| Parametros totales | 11.959.730.224 (aproximadamente 12B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, precision mixta (oQ), grupo de 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. El campo `model_type` de la model card indica `gemma4_unified`, y la nomenclatura del repositorio sugiere que se trata de la variante instruction-tuned de una hipotetica familia Gemma 4 con aproximadamente 12.000 millones de parametros. No se ha publicado nada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo unico documentado con detalle es el proceso de cuantizacion. Se aplico oQ, la implementacion de cuantizacion de precision mixta de oMLX en su version 0.7.0, con un ancho objetivo de 4 bits y un tamano de grupo de 64. La cuantizacion de precision mixta asigna distintos anchos de bits a las capas segun su sensibilidad, de modo que las capas mas criticas conservan mas precision mientras las menos sensibles se comprimen mas agresivamente. El autor advierte en la model card que los pesos se actualizaron el 15 de octubre de 2026 y que las descargas anteriores a esa fecha deben repetirse.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: la nomenclatura `-it` del modelo base indica ajuste para instrucciones, pero no hay documentacion que detalle el comportamiento real.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Vision: no disponible. El tag `gemma4_unified` podria sugerir una arquitectura multimodal unificada, pero no hay ninguna confirmacion al respecto.
- Tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la ficha no declara idiomas.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Ejecucion local en Mac con Apple Silicon: es el caso de uso principal y mas realista. Un modelo denso de 12B cuantizado a 4 bits ocupa aproximadamente 7 GB en disco y puede cargarse en memoria unificada mediante MLX, lo que permite tener un asistente de texto funcionando sin conexion en un portatil con 16 GB o mas de RAM.
- Prototipado de aplicaciones de generacion de texto en macOS: con `mlx_lm` u `mlx-lm.server` se puede levantar un endpoint compatible con la API de OpenAI para desarrollar y probar interfaces sin depender de servicios en la nube.
- Evaluacion comparativa de tecnicas de cuantizacion: dado que este repositorio es una conversion oQ de un modelo base, resulta util para medir la degradacion de calidad respecto a los pesos originales en tareas concretas del propio flujo de trabajo.
- Generacion de texto asistida en entornos con requisitos de privacidad: al ejecutarse integramente en local, los datos no salen del equipo, lo que encaja en flujos de trabajo donde no se permite enviar contenido a APIs externas.
- Fine-tuning ligero y experimentacion: MLX permite adaptar modelos con LoRA sobre los pesos cuantizados, de modo que el repositorio puede servir como punto de partida para prototipos de ajuste especifico de dominio en hardware de consumo.
- Integracion en herramientas de escritorio: al estar en formato MLX safetensors, se puede cargar desde aplicaciones como LM Studio o desde scripts propios basados en MLX, sin necesidad de servidores GPU.
- Nota: no se han documentado capacidades especificas de tool calling, agentes o vision, por lo que no se recomienda su uso en esos escenarios sin una validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan comparaciones con los pesos sin cuantizar. No es posible, por tanto, cuantificar la perdida de calidad introducida por la cuantizacion a 4 bits con oQ.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: aproximadamente 7-8 GB solo para los pesos en 4 bits, a los que hay que sumar el espacio de trabajo de KV cache y activaciones. Con contexto corto, 12 GB de memoria unificada es un minimo razonable; para contextos largos conviene disponer de 16-32 GB.
- GPU compatibles: MLX esta disenado para Apple Silicon, por lo que el hardware natural son los chips de la serie M (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). En GPUs NVIDIA o AMD el formato MLX no es directamente utilizable sin conversion previa a GGUF u otro formato.
- Cabida en GPU de consumo: si, en equipos Apple Silicon con 16 GB o mas de memoria unificada. Los modelos de 8 GB de RAM unificada quedan justos o directamente fuera de alcance.
- Opciones de despliegue: `mlx_lm` para inferencia por linea de comandos, `mlx-lm.server` para exponer un endpoint HTTP, LM Studio para uso de escritorio y MLX Swift para integracion en aplicaciones nativas de Apple. vLLM, TGI y llama.cpp no admiten MLX safetensors como formato de entrada, aunque llama.cpp y Ollama serian viables tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio concreto.

## Comparativa con modelos similares

La comparativa se limita al segmento de modelos densos de aproximadamente 12B con cuantizacion de 4 bits. Los datos del modelo evaluado corresponden al repositorio; los del resto son especificaciones publicas de sus versiones oficiales. Al no conocerse la licencia ni la ficha del modelo base gemma-4-12B-it, la comparacion es necesariamente parcial.

| Modelo | Parametros | Contexto | Licencia | Formato MLX 4-bit | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-12B-it-oQ4e-fp16 (este) | 11,96B | no disponible | no disponible | si (oQ, grupo 64) | publico en Hugging Face |
| Gemma 3 12B IT (referencia de la familia anterior) | 12B | 128k | Gemma Terms of Use | si, mediante conversiones de terceros | publico en Hugging Face |
| Mistral NeMo 12B Instruct | 12B | 128k | Apache 2.0 | si, mediante conversiones de terceros | publico en Hugging Face |
| Phi-4 | 14B | 16k | MIT | si, mediante conversiones de terceros | publico en Hugging Face |

El dato diferencial de este repositorio es el esquema de cuantizacion de precision mixta oQ, que puede conservar mas calidad que una cuantizacion uniforme a 4 bits del mismo tamano, aunque no hay mediciones publicadas que lo confirmen en este caso.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no declara licencia, idiomas, contexto ni capacidades. Esto impide evaluar el modelo para uso comercial o en produccion sin trabajo adicional de validacion.
- Licencia no disponible: al no conocerse la licencia del repositorio ni la del modelo base, no se puede asumir que el uso comercial este permitido. Es un bloqueante para cualquier despliegue en producto.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano. Al no existir evaluaciones publicadas, se desconoce la tasa de error en tareas factuales.
- Degradacion por cuantizacion: la conversion a 4 bits con grupo de 64 reduce la huella de memoria a costa de una perdida de precision que no ha sido medida ni documentada. En tareas sensibles (matematicas, codigo, extraccion de datos) el impacto puede ser notable.
- Sesgos: no evaluados. Se desconoce la composicion del dataset de entrenamiento del modelo base.
- Limitaciones de contexto e idioma: no disponibles. No hay garantia de un rendimiento adecuado en castellano.
- Restriccion de plataforma: el formato MLX limita el uso a hardware Apple Silicon o a conversiones manuales a otros formatos, con el consiguiente riesgo de introducir errores adicionales.
- Versionado inestable: el autor indica que los pesos se reemplazaron el 15 de octubre de 2026 y que las descargas previas quedan obsoletas, lo que dificulta la reproducibilidad de experimentos.
- Adopcion nula: 0 descargas y 0 likes. No hay evidencia de uso en la comunidad ni de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GrillingWithJorge/gemma-4-12B-it-oQ4e-fp16
- Repositorio de oQ / oMLX (herramienta de cuantizacion): https://github.com/jundot/omlx
- Paper o blog del modelo base gemma-4-12B-it: no disponible
- Repositorio oficial del modelo base: no disponible
- Demo o espacio de pruebas: no disponible
