# Holynoobz/traveller-models

## Resumen

`Holynoobz/traveller-models` no es un modelo nuevo, sino un repositorio de distribucion que empaqueta los artefactos de inferencia en dispositivo de Qwen3.5-2B en formato MLC/WebLLM. Cada archivo es un `.tar` en modo store-only que contiene, byte a byte, los ficheros publicados por el equipo de MLC AI (por ejemplo `mlc-ai/Qwen3.5-2B-q4f16_1-MLC`): `mlc-chat-config.json`, `tokenizer.json`, `tensor-cache.json` y los fragmentos de pesos cuantizados. El objetivo declarado es que un iPhone pueda descargar un unico fichero con el gestor de descargas de Safari e importarlo en la aplicacion Traveller, un planificador de viajes familiares privado y local-first.

El modelo subyacente es Qwen3.5-2B, desarrollado por el equipo Qwen de Alibaba Cloud, con aproximadamente 2.000 millones de parametros segun su denominacion, y los pesos cuantizados proceden de compilaciones oficiales de MLC AI. La licencia declarada es Apache 2.0, heredada del modelo base. El repositorio ocupa 1,1 GB, se creo el 25 de septiembre de 2026 y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia es practica y acotada: sirve como canal de distribucion reproducible para ejecutar un LLM de ~2B en el navegador o en el dispositivo mediante WebGPU, sin depender de APIs en la nube. No aporta pesos nuevos, ni fine-tuning, ni modificaciones sobre el material upstream, por lo que su evaluacion tecnica es, en la practica, la evaluacion de Qwen3.5-2B cuantizado a q4f16_1 para MLC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (corresponde a la del modelo base Qwen3.5-2B; no se documenta en esta ficha) |
| Parametros totales | Aproximadamente 2.000 millones, segun la denominacion del modelo base `Qwen/Qwen3.5-2B` (cifra no confirmada en la informacion disponible) |
| Parametros activos | No aplica: no se indica que el modelo base sea de tipo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4f16_1 (cuantizacion de 4 bits con acumulacion en fp16, segun la compilacion MLC referenciada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Compilacion MLC/WebLLM: fragmentos de pesos cuantizados junto a `mlc-chat-config.json`, `tokenizer.json` y `tensor-cache.json`, empaquetados en un `.tar` store-only. No se incluye la libreria compilada `.wasm` |

## Arquitectura y entrenamiento

El repositorio no define arquitectura ni proceso de entrenamiento propios: es un contenedor de artefactos. La arquitectura efectiva es la de Qwen3.5-2B, un modelo de lenguaje de la familia Qwen publicada por Alibaba Cloud, y la informacion disponible no detalla su configuracion interna (numero de capas, atencion con consultas agrupadas, tipo de normalizacion, funcion de activacion ni estrategia posicional). Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de ajuste por instrucciones, RLHF o DPO. Cualquier afirmacion al respecto seria especulativa y no se recoge en esta ficha.

La innovacion tecnica relevante aqui es la cadena de empaquetado y verificacion, no el modelo. Los archivos se copian sin modificar desde las compilaciones de MLC AI, se comprueba el SHA-256 de cada fichero contra el checksum publicado por Hugging Face antes del empaquetado y la aplicacion vuelve a verificar cada entrada antes de instalarla. El formato MLC convierte los pesos a un grafo de ejecucion portable que puede desplegarse sobre WebGPU en navegador o mediante el runtime nativo de MLC LLM en distintos backends. El repositorio no incluye la libreria `.wasm` compilada; la aplicacion la descarga aparte en el primer uso, lo que mantiene la compilacion desacoplada de los pesos.

## Capacidades

- Generacion de texto conversacional: capacidad heredada del modelo base Qwen3.5-2B, no documentada ni verificada en la informacion disponible de este repositorio.
- Razonamiento, matematicas y generacion de codigo: no disponible; no se aportan datos ni ejemplos en la model card.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multietapa: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no esta declarado en el repositorio.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible.
- Ejecucion local en dispositivo: capacidad confirmada por el diseno del repositorio, ya que los pesos estan pensados para WebLLM/MLC en navegador o en aplicacion movil mediante WebGPU.
- Verificacion de integridad: la aplicacion cliente valida el SHA-256 de cada entrada del `.tar` antes de instalar.

## Casos de uso

- Planificador de viajes local-first: es el caso de uso declarado por el autor. La aplicacion Traveller importa los pesos y ejecuta el modelo en el propio dispositivo para generar itinerarios y recomendaciones sin enviar datos del usuario a servidores externos.
- Asistente conversacional sin conexion: al residir los pesos en el dispositivo, el modelo puede atender consultas cuando no hay red, con la unica dependencia de que la libreria `.wasm` de WebLLM se haya descargado previamente.
- Prototipado de aplicaciones WebGPU: sirve como fuente de un `.tar` unico y verificado para probar inferencia de un LLM de ~2B en el navegador sin gestionar multiples ficheros de pesos.
- Demostraciones de privacidad computacional: util para escenarios donde el contenido del prompt no puede salir del dispositivo (datos medicos, legales o familiares), ya que no hay llamadas a una API remota.
- Distribucion reproducible en entornos iOS: el empaquetado en un solo archivo simplifica la descarga mediante Safari y la importacion en la app, reduciendo errores de integridad respecto a la descarga de decenas de fragmentos sueltos.
- Evaluacion comparativa de cuantizacion q4f16_1: permite medir el equilibrio entre tamano (1,1 GB de repositorio), consumo de memoria y calidad de salida frente a otras cuantizaciones del mismo modelo base.
- Base para aplicaciones de accesibilidad offline: asistentes de escritura o lectura que deban funcionar en dispositivos sin conectividad persistente, siempre que el hardware soporte WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y tampoco se aportan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM o memoria unificada estimada: no disponible de forma oficial. Como referencia dimensional, el repositorio completo ocupa 1,1 GB y una cuantizacion de 4 bits de un modelo de ~2B suele requerir del orden de 1,2 a 1,8 GB de memoria para pesos, mas la cache KV, que depende de la longitud de contexto efectiva (no declarada).
- GPU recomendadas: no se especifican. El destino principal es WebGPU, disponible en Safari en iOS y iPadOS recientes, Chrome y Edge en escritorio, y navegadores compatibles en Android.
- GPU de centro de datos: el repositorio no esta orientado a A100, H100 ni entornos CUDA. El runtime nativo de MLC LLM si puede compilarse para backends CUDA, Metal o Vulkan, pero este repositorio concreto solo empaqueta los ficheros de pesos.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano de ~2B en 4 bits, siempre que el navegador o el runtime expongan WebGPU o el backend correspondiente. No se publica una lista de modelos verificados.
- Opciones de despliegue: WebLLM en navegador, runtime de MLC LLM en dispositivo, y la aplicacion Traveller como cliente especifico. No se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI; serian necesarias conversiones adicionales desde los pesos originales de Qwen.
- Latencia y throughput: no disponibles. Dependen por completo del hardware, del backend WebGPU y del contexto de entrada.

## Comparativa con modelos similares

| Repositorio o modelo | Que es | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Holynoobz/traveller-models` | Empaquetado `.tar` de los ficheros MLC/WebLLM de Qwen3.5-2B q4f16_1 | ~2B (segun nombre del base) | No disponible | No disponible | Apache 2.0 | 0 descargas, 0 likes |
| `mlc-ai/Qwen3.5-2B-q4f16_1-MLC` | Compilacion MLC original, sin empaquetar | ~2B | No disponible | No disponible | Apache 2.0 | Mantenido por el equipo de MLC AI |
| `Qwen/Qwen3.5-2B` | Pesos originales del modelo base | ~2B | No disponible | No disponible | Apache 2.0 | Repositorio oficial de Qwen |

La diferencia entre los tres no es de capacidades del modelo, sino de formato y proposito: pesos originales frente a compilacion MLC y frente a archivo unico para importacion en aplicacion movil. No se dispone de datos de rendimiento ni de contexto que permitan una comparacion cuantitativa con alternativas de otros fabricantes de tamano similar.

## Limitaciones y advertencias

- Este repositorio no es un modelo entrenado ni ajustado: cualquier limitacion de calidad, sesgo o alucinacion proviene de Qwen3.5-2B y de su cuantizacion a q4f16_1, no de las modificaciones del autor, que declara no haber alterado ningun fichero.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; en un asistente de viajes esto puede traducirse en horarios, precios o direcciones inventados. No hay datos de evaluacion que permitan cuantificarlo.
- Idiomas soportados no declarados: no puede asumirse un rendimiento homogeneo en castellano ni en otras lenguas sin una evaluacion propia.
- Longitud de contexto no disponible: condiciona directamente el consumo de memoria en dispositivo y la viabilidad de conversaciones largas.
- Dependencia de WebGPU: el despliegue previsto requiere un navegador o sistema con soporte de WebGPU; en hardware antiguo o navegadores sin soporte, el modelo no se ejecutara.
- La libreria `.wasm` compilada no esta incluida en el `.tar`; la aplicacion la descarga en el primer uso, lo que introduce una dependencia de red y una superficie de fallo adicional.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero obliga a conservar los avisos de licencia y a declarar los cambios. Al redistribuir pesos derivados de Qwen3.5-2B conviene revisar tambien los terminos del repositorio oficial de Qwen.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion, ni issues, ni validacion por parte de terceros. La fecha de creacion y actualizacion es la misma, lo que sugiere una publicacion puntual sin mantenimiento posterior conocido.
- Verificacion de integridad: el autor afirma haber comprobado el SHA-256 de cada fichero contra el checksum upstream y la aplicacion vuelve a verificar; aun asi, un tercero deberia replicar esa comprobacion antes de confiar en los archivos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Holynoobz/traveller-models
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Compilacion MLC de referencia citada en la model card: https://huggingface.co/mlc-ai/Qwen3.5-2B-q4f16_1-MLC
- Organizacion de compilaciones MLC: https://huggingface.co/mlc-ai
- Proyecto MLC LLM: https://github.com/mlc-ai/mlc-llm
- Proyecto WebLLM: https://github.com/mlc-ai/web-llm
