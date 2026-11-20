# moonbox-dev/qwen35_9b

## Resumen

Qwen3.5-9B es un modelo multimodal de tipo image-text-to-text desarrollado por Qwen (Alibaba Cloud), con 9.197.093.888 parametros totales. Este repositorio concreto, `moonbox-dev/qwen35_9b`, no es un lanzamiento oficial: es un paquete de ficheros GGUF preparado por Moonbox para su aplicacion de escritorio, que empaqueta el modelo de lenguaje cuantizado y su proyector de vision para su uso con llama.cpp.

El paquete incluye dos variantes: una build Q4_K_M del repositorio de Unsloth con proyector de vision mmproj-F16, y una build IQ4_XS con proyector BF16 orientada al motor de Windows. El modelo base es Qwen/Qwen3.5-9B, distribuido bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion de dicha licencia.

Su relevancia practica es la de ofrecer un asistente multimodal de 9B en formato GGUF listo para ejecutarse en local, con capacidades declaradas de tareas largas, uso de herramientas y procesamiento de imagenes. La model card del empaquetador menciona una velocidad aproximada de 26 palabras por segundo, aunque no especifica el hardware empleado para esa medicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-9B; multimodal image-text-to-text) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (build MTP) e IQ4_XS (build para motor Windows); proyectores de vision en F16 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (Copyright 2026 Alibaba Cloud) |
| Formato de pesos | GGUF (llama.cpp); repo de 13,0 GB |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3.5-9B en la informacion proporcionada: no se especifica si es un transformer denso, MoE o hibrido, ni el numero de capas, dimensiones ocultas o mecanismo de atencion. La unica informacion estructural disponible es que el pipeline es image-text-to-text, lo que implica la existencia de un codificador o proyector de vision acoplado al modelo de lenguaje; el paquete incluye proyectores mmproj-F16 y BF16.

Tampoco se detallan los datos de entrenamiento (numero de tokens, composicion del corpus), ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El paquete de Moonbox es una conversion y cuantizacion del modelo original: la build Q4_K_M proviene del repositorio Unsloth MTP GGUF y la build IQ4_XS es una conversion GGUF realizada por Moonbox a partir del modelo base. No se han documentado innovaciones tecnicas adicionales en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y asistencia en tareas largas, segun la descripcion del empaquetador.
- Procesamiento de imagenes (image-text-to-text) mediante el proyector de vision incluido en el paquete.
- Uso de herramientas (tools), segun la model card del empaquetador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Razonamiento multi-paso y comportamiento agentico: no documentado de forma explicita en la informacion disponible.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de escritorio local: el paquete esta disenado para que la aplicacion Moonbox descargue y ejecute el modelo en el equipo del usuario, con verificacion de ficheros contra una lista firmada, lo que facilita despliegues de asistente sin depender de la nube.
- Analisis de imagenes en local: al incluir proyector de vision, permite describir, clasificar o extraer informacion de capturas, fotografias o documentos escaneados sin enviar los datos a un servidor externo.
- Automatizacion de tareas con herramientas: la capacidad declarada de uso de tools permite integrar el modelo en flujos donde deba invocar funciones o APIs para completar tareas de varios pasos.
- Prototipado rapido con llama.cpp: al estar en formato GGUF, es adecuado para experimentar con inferencia local en pipelines de desarrollo antes de escalar a un modelo mayor o a un servicio gestionado.
- Procesamiento de documentos con contexto visual: combinacion de texto e imagen para tareas de extraccion de datos de formularios, facturas o paneles, ejecutandose en estaciones de trabajo con GPU de consumo.
- Evaluacion comparativa de cuantizaciones: disponer de Q4_K_M e IQ4_XS permite medir en un mismo modelo el equilibrio entre calidad, VRAM y velocidad para decidir la variante de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento aportado es una velocidad aproximada de 26 palabras por segundo, sin especificar el hardware ni la cuantizacion empleada en la medicion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~9,2B parametros en 4 bits ocupa del orden de 5-6 GB de pesos, a lo que hay que sumar el proyector de vision y la cache KV; el repo completo pesa 13,0 GB porque incluye varias builds y proyectores.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- GPU de consumo: por tamano y cuantizacion de 4 bits, es plausible su ejecucion en GPUs de consumo con 8 GB o mas de VRAM, aunque el fabricante no lo confirma.
- Opciones de despliegue: llama.cpp es el runtime objetivo declarado (ficheros GGUF); el paquete esta pensado para la aplicacion Moonbox. Compatibilidad con vLLM, TGI u Ollama no esta documentada en la informacion disponible.
- Latencia y throughput: ~26 palabras por segundo segun el empaquetador, sin especificar hardware ni cuantizacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| moonbox-dev/qwen35_9b | 9.197.093.888 | no disponible | Apache 2.0 | GGUF | Paquete no oficial para Moonbox |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion disponible |

## Limitaciones y advertencias

- Este repositorio no es un lanzamiento oficial de Qwen: es una conversion y empaquetado de terceros (Moonbox), por lo que la integridad y el comportamiento deben validarse contra el modelo base original.
- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado con datos web, es esperable que herede sesgos, pero no hay analisis publicado en la fuente.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo habitual de los modelos generativos, especialmente en tareas factuales y en lectura de imagenes.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados, lo que impide garantizar su idoneidad para casos multilingues o de contexto muy largo.
- La cuantizacion a 4 bits (Q4_K_M, IQ4_XS) puede degradar la calidad respecto a los pesos originales en precision completa; no se aportan metricas de esa perdida.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar los avisos de copyright y licencia (Copyright 2026 Alibaba Cloud) y no concede derechos de marca.
- El modelo esta empaquetado para la aplicacion Moonbox y llama.cpp; su uso en otros runtimes no esta verificado en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moonbox-dev/qwen35_9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Build Unsloth MTP GGUF: https://huggingface.co/unsloth/Qwen3.5-9B-MTP-GGUF
- Aplicacion Moonbox: https://moonbox.dev
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
