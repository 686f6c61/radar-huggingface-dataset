# RKNNAI/RK3588-LLM-Qwen2.5-1.5B-Instruct

## Resumen

El repositorio RKNNAI/RK3588-LLM-Qwen2.5-1.5B-Instruct no es un modelo entrenado desde cero, sino una distribucion de despliegue del modelo Qwen/Qwen2.5-1.5B-Instruct convertido y cuantizado al formato RKLLM para ejecutarse sobre la NPU del SoC Rockchip RK3588. Lo publica el usuario RKNNAI y su proposito es permitir inferencia de un LLM de 1.500 millones de parametros directamente en hardware embebido, sin GPU, usando la NPU integrada del RK3588 a traves del stack oficial RKLLM de Rockchip.

La relevancia de esta ficha es practica: cubre el caso de uso de IA generativa en el borde (edge AI) sobre placas SBC (single-board computer) de bajo consumo. El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder denso con soporte de instrucciones, mientras que la conversion lo limita a un contexto de 1.024 tokens y lo cuantiza a w8a8 (8 bits en pesos y activaciones), lo que reduce drasticamente los requisitos de memoria frente al modelo original.

El repositorio ocupa 2,0 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo fuente. Se publica en su revision v1.2.4, que coincide con la version del runtime RKLLM requerida, y la configuracion disponible emplea 3 nucleos de NPU del RK3588.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (modelo base Qwen2.5-1.5B-Instruct); empaquetado en formato RKLLM para NPU RK3588 |
| Parametros totales | 1.500 millones (1,5B) en el modelo base |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens en la configuracion de despliegue w8a8-3-1024; el modelo base soporta contextos mayores (no especificado en este repositorio) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | No especificado en la model card del repositorio; el modelo base Qwen2.5-Instruct declara soporte para 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (formato propietario de Rockchip generado con RKLLM-Toolkit) y ficheros de configuracion asociados |

## Arquitectura y entrenamiento

El modelo fuente es Qwen2.5-1.5B-Instruct, un transformer decoder denso de 1.500 millones de parametros desarrollado por el equipo Qwen de Alibaba, ajustado con instrucciones (post-entrenamiento tipo SFT/RLHF, segun el modelo original). Este repositorio no aporta informacion sobre el numero de tokens de entrenamiento ni la composicion del dataset; esos datos corresponden al modelo base y no se reproducen aqui por no estar incluidos en la informacion disponible.

La contribucion tecnica del repositorio es exclusivamente de despliegue: se convierte el modelo a formato RKLLM y se cuantiza a w8a8, asignando 3 nucleos de NPU del RK3588 a la inferencia. La arquitectura de ejecucion es RKLLM-Toolkit (conversion y cuantizacion en PC) mas RKLLM C API (inferencia en la placa), segun el flujo oficial del stack rknn-llm de Rockchip. No se declara ninguna innovacion de entrenamiento ni de atencion en este paquete.

## Capacidades

- Generacion de texto conversacional en modo instruccion (chat multi-turno), heredada del modelo Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a preguntas sobre un contexto corto (1.024 tokens).
- Generacion de codigo a nivel elemental y tareas de matematicas simples, limitadas por el tamano de 1,5B parametros.
- Capacidad multilingue derivada del modelo base; el repositorio no documenta que idiomas concretos estan validados tras la cuantizacion.
- Inferencia completamente local en la NPU del RK3588, sin conexion a red ni dependencia de servicios en la nube.
- Soporte de tool calling / function calling: no documentado en este repositorio.
- Soporte de agentes y razonamiento multi-paso: no documentado en este repositorio.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistente conversacional embebido en castellano: el modelo puede gestionar dialogos de varios turnos siempre que el historial completo quepa en la ventana de 1.024 tokens, lo que lo hace apto para asistentes de voz o texto en dispositivos sin conectividad.
- Clasificacion y extraccion de informacion en el borde: etiquetado de textos, resumen de mensajes cortos o extraccion de campos de documentos, ejecutados localmente en la NPU del RK3588 sin enviar datos a terceros.
- Automatizacion industrial y robotica: integracion de un LLM en el propio SoC para interpretar comandos en lenguaje natural y traducirlos a acciones sobre actuadores, donde la baja latencia y la ausencia de red son criticas.
- Pasarela domotica inteligente: interpretacion de instrucciones del usuario en una placa SBC (por ejemplo, Turing Pi RK1 o similares) para controlar dispositivos domoticos mediante texto.
- Prototipado e investigacion en edge AI: banco de pruebas para medir rendimiento de LLM cuantizados en NPU RK3588 y comparar con alternativas en CPU (llama.cpp) o GPU.
- Generacion de borradores de texto offline: redaccion de respuestas cortas, correos o notas en entornos aislados (air-gapped) sin acceso a Internet.
- Filtrado previo en pipelines de datos: uso del modelo como etapa ligera de preprocesado (deteccion de idioma, normalizacion, descarte de contenido irrelevante) antes de enviar los datos a un modelo mayor en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta configuracion RKLLM. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de latencia o throughput para la NPU del RK3588.

Como referencia externa (no comparable directamente, ya que corresponde a otro runtime y a la CPU del SoC, no a la NPU), los resultados de busqueda citan una medicion de llama.cpp sobre RK3588 con Qwen2.5-1.5B-Instruct en cuantizacion Q4_K_M de 22,57 tokens por segundo. Este dato no debe atribuirse a la configuracion w8a8 con RKLLM de este repositorio.

| Referencia | Runtime | Cuantizacion | Hardware | Velocidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (referencia externa) | llama.cpp | Q4_K_M | RK3588 (CPU) | 22,57 tokens/s |
| Este repositorio (w8a8-3-1024) | RKLLM v1.2.4 | w8a8 | RK3588 (3 nucleos NPU) | No disponible |

## Requisitos de hardware

- Hardware obligatorio: SoC Rockchip RK3588 (la configuracion declara soporte para RK3588 y usa 3 nucleos de NPU). No es ejecutable en GPU de escritorio ni en CPU generica con este formato.
- Version de runtime: RKLLM Runtime v1.2.4, segun la tabla de configuraciones del repositorio.
- Memoria: el repositorio completo ocupa 2,0 GB. Con cuantizacion w8a8, los pesos del modelo de 1,5B rondan 1,5 GB, a lo que hay que sumar la cache KV para 1.024 tokens y el overhead del runtime. Se recomienda una placa RK3588 con al menos 8 GB de RAM (el dato exacto no esta especificado en el repositorio).
- GPU recomendadas: no aplica; la ejecucion se realiza sobre la NPU del RK3588 (6 TOPS INT8 en el SoC). No se contempla A100, H100 ni RTX 4090 para esta distribucion.
- Compatibilidad con GPU de consumo: no aplica a esta configuracion. El modelo base Qwen2.5-1.5B-Instruct si cabria en GPUs de consumo, pero requeriria convertirlo a otro formato (safetensors, GGUF), no a RKLLM.
- Opciones de despliegue: RKLLM-Toolkit para la conversion en PC y RKLLM C API para la inferencia en la placa. Como alternativas sobre la misma placa, llama.cpp y Ollama permiten ejecutar el modelo base en CPU (no en NPU).
- Latencia y throughput: no disponibles en la documentacion del repositorio. El unico dato de referencia encontrado es el de llama.cpp en CPU mencionado en la seccion anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RKNNAI/RK3588-LLM-Qwen2.5-1.5B-Instruct (este repositorio) | 1,5B | 1.024 tokens (despliegue) | RKLLM w8a8, NPU RK3588 | Apache 2.0 | HuggingFace y ModelScope (revision v1.2.4) |
| c01zaut/Qwen2.5-3B-Instruct-rk3588-1.1.1 | 3B | No disponible en la busqueda | RKLLM, RK3588 | No especificada en la busqueda | HuggingFace |
| 3ib0n/Qwen2.5-3B-Instruct-rkllm | 3B | No disponible en la busqueda | RKLLM, RK3588 | No especificada en la busqueda | HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,5B | No especificado en este repositorio | safetensors (transformers) | Apache 2.0 | HuggingFace |

Las dos alternativas identificadas en la busqueda son tambien conversiones de Qwen2.5 a RKLLM para RK3588, pero de 3B parametros, lo que implica mayor consumo de memoria y menor velocidad a cambio de mejor calidad de generacion. No se dispone de datos de rendimiento comparativos entre ellas y este repositorio.

## Limitaciones y advertencias

- El contexto util esta limitado a 1.024 tokens en esta configuracion, muy inferior al del modelo base; conversaciones largas o documentos extensos requeriran truncado o resumen previo.
- La cuantizacion w8a8 puede degradar la calidad de generacion respecto al modelo en precision completa; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Riesgo de alucinacion inherente a un modelo de 1,5B parametros, especialmente en tareas de conocimiento factual, matematicas complejas o razonamiento multi-paso.
- Sesgos: no documentados en este repositorio. Al derivar del modelo base Qwen2.5, puede heredar los sesgos de sus datos de entrenamiento, no evaluados aqui.
- Aislamiento de hardware: el paquete solo funciona en RK3588 con RKLLM Runtime v1.2.4. La model card advierte explicitamente de que deben usarse los ficheros de la misma configuracion y que los chips soportados son los indicados por configuracion.
- Integridad de los ficheros: el repositorio incluye sumas SHA-256 y la documentacion exige verificar (`sha256sum -c SHA256SUMS`) que todas las entradas reporten OK antes del despliegue.
- Licencia: Apache 2.0 permite uso comercial, pero se deben conservar los avisos de copyright originales del modelo fuente, tal como indica el propio repositorio.
- Popularidad y mantenimiento: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad ni garantias de mantenimiento.
- Idiomas validados tras la conversion: no documentados. El soporte multilingue del modelo base no implica que todas las lenguas rindan igual tras la cuantizacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RKNNAI/RK3588-LLM-Qwen2.5-1.5B-Instruct
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial RKLLM de Rockchip (rknn-llm): https://github.com/airockchip/rknn-llm
- Articulo sobre inferencia de LLM en NPU RK3588 con RKLLM (Turing Pi RK1): https://turingpi.com/rkllm-rk3588-npu-llm-inference-turing-pi-rk1/
- Articulo sobre el proceso de adaptacion y despliegue de Qwen2.5-0.5B en RK3588: https://pavelhan.tech/en/article/2026-03-16-the-Qwen2.5-0.5B-model-deployment-on-RK3588/
- Conversion alternativa c01zaut/Qwen2.5-3B-Instruct-rk3588-1.1.1: https://huggingface.co/c01zaut/Qwen2.5-3B-Instruct-rk3588-1.1.1
- Conversion alternativa 3ib0n/Qwen2.5-3B-Instruct-rkllm: https://huggingface.co/3ib0n/Qwen2.5-3B-Instruct-rkllm
