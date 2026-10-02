# RKNNAI/RK3576-LLM-Qwen3.5-2B

## Resumen

RKNNAI/RK3576-LLM-Qwen3.5-2B es un repositorio de distribucion de pesos cuantizados, no un modelo entrenado desde cero. Su autor, RKNNAI, convierte y cuantiza el modelo de lenguaje Qwen/Qwen3.5-2B al formato RKLLM para ejecutarlo sobre la NPU del SoC Rockchip RK3576. El repositorio no contiene el modelo original en safetensors ni una copia GGUF: contiene seis configuraciones de despliegue listas para el runtime RKLLM v1.2.4, cada una con su propio README, ficheros de pesos y sumas SHA-256 de verificacion.

El problema que resuelve es concreto: llevar un LLM de aproximadamente 2.000 millones de parametros a hardware embebido con aceleracion NPU, sin depender de GPU. Para ello ofrece dos esquemas de cuantizacion (w4a16 y w8a8), tres longitudes de contexto (1024, 2048 y 4096 tokens) y una asignacion fija de 2 nucleos NPU por configuracion, lo que permite al desarrollador elegir el compromiso entre memoria ocupada, calidad de salida y longitud de contexto segun la placa objetivo.

Su relevancia es de nicho pero clara: es una pieza de infraestructura para edge AI. La licencia Apache-2.0 del modelo origen se mantiene, y el repositorio incluye instrucciones de descarga tanto por Hugging Face como por ModelScope, con verificacion criptografica obligatoria antes del despliegue. El repositorio tiene 15,6 GB de tamano total y, en el momento de la consulta, cero descargas y cero likes, por lo que no cuenta con validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no documenta la arquitectura del modelo origen) |
| Parametros totales | ~2.000 millones, deducido de la denominacion Qwen3.5-2B; no confirmado en la model card |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 1024, 2048 o 4096 tokens, segun la configuracion elegida |
| Tipos de cuantizacion | w4a16 y w8a8, en formato RKLLM |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | RKLLM (runtime v1.2.4) para NPU RK3576; no se distribuyen safetensors ni GGUF |
| Nucleos NPU | 2 en todas las configuraciones |
| Modelo origen | Qwen/Qwen3.5-2B |
| Tipo de modelo | LLM |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 15,6 GB (las seis configuraciones en conjunto) |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura, datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. La model card se limita a describir el proceso de conversion y cuantizacion a RKLLM y a listar los artefactos resultantes. Toda la informacion sobre el modelo base corresponde al repositorio Qwen/Qwen3.5-2B, al que esta distribucion apunta como origen.

Lo unico verificable en la informacion proporcionada es el proceso de compresion: se generan dos variantes de cuantizacion. La variante w4a16 usa pesos de 4 bits y activaciones de 16 bits, y la variante w8a8 usa pesos y activaciones de 8 bits. Cada variante se empaqueta en tres versiones de contexto (1024, 2048 y 4096 tokens) sobre 2 nucleos NPU, todas para el runtime RKLLM v1.2.4 y exclusivamente para el chip RK3576. No se documenta ninguna innovacion tecnica adicional, ni decodificacion especulativa, ni atencion lineal, ni estrategias de cache KV mas alla del tamano de contexto declarado.

## Capacidades

- Generacion de texto: es un LLM de proposito general, segun la propia model card ("Model Type: LLM").
- Razonamiento y conocimiento general: capacidad heredada del modelo origen, no documentada ni medida en este repositorio.
- Codigo y matematicas: no disponible; no se documenta ninguna evaluacion ni capacidad especifica.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; el contexto maximo de 4096 tokens limita este tipo de flujos.
- Capacidades multilingues: no disponible; la model card se publica en ingles y chino, pero no declara los idiomas soportados por el modelo.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se menciona ninguna.
- Ejecucion en NPU: capacidad operativa destacable, al estar compilado para la NPU del RK3576 con 2 nucleos y el runtime RKLLM v1.2.4.

## Casos de uso

- Asistentes embebidos en dispositivos de consumo: el modelo puede ejecutarse localmente en una placa RK3576 sin GPU dedicada, gestionando conversaciones de hasta 1024-4096 tokens segun la configuracion, lo que resulta adecuado para mandos por voz o interfaces de texto en electrodomesticos y dispositivos IoT.
- Procesamiento de lenguaje natural en el borde sin conexion: en despliegues industriales o de campo sin conectividad, la inferencia se realiza en el propio dispositivo, con la variante w4a16 para minimizar el uso de memoria y la w8a8 cuando se prioriza la fidelidad de la salida.
- Clasificacion y extraccion de informacion de documentos cortos: resumen, etiquetado o extraccion de campos sobre entradas de menos de 4096 tokens, integrado en un pipeline local que evita enviar datos a la nube.
- Preprocesado de comandos antes de un sistema mayor: normalizacion de lenguaje natural a instrucciones estructuradas en un dispositivo de control, dejando el razonamiento pesado a un modelo mayor en servidor.
- Prototipado de productos edge con LLM: gracias a la disponibilidad de seis configuraciones precompiladas y verificables por SHA-256, permite medir rapidamente el equilibrio entre contexto, cuantizacion y consumo en hardware RK3576 antes de fijar una version definitiva.
- Educacion y demostraciones de IA en hardware embebido: escenarios docentes donde se necesita mostrar inferencia de un LLM sobre una NPU de bajo consumo con un modelo de ~2.000 millones de parametros.
- Aplicaciones de privacidad estricta: al no requerir enviar las entradas fuera del dispositivo, encaja en casos donde el texto del usuario no puede salir del terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se proporcionan datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo origen ni para las versiones cuantizadas. Tampoco se aportan cifras de latencia, throughput o consumo energetico sobre RK3576.

## Requisitos de hardware

- SoC obligatorio: Rockchip RK3576. Es el unico chip soportado por todas las configuraciones publicadas; no hay soporte declarado para otros SoC de la familia RK.
- NPU: 2 nucleos NPU en todas las configuraciones. No se especifica el rendimiento de la NPU ni la memoria disponible en la placa.
- Memoria: no disponible. Como referencia, un modelo de ~2.000 millones de parametros en w4a16 ocupa del orden de 1,2-1,5 GB solo en pesos, a lo que hay que sumar la cache KV y el runtime; se trata de una estimacion, no de un dato publicado.
- GPU: no aplica. Este repositorio no esta pensado para A100, H100 ni RTX 4090; el runtime es especifico de NPU Rockchip.
- GPU de consumo: no procede; el despliegue objetivo es una placa embebida, no una GPU de escritorio.
- Software de despliegue: runtime RKLLM en version v1.2.4, obligatorio. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no consumen el formato RKLLM.
- Verificacion previa: la model card exige ejecutar `sha256sum -c SHA256SUMS` dentro del directorio de la configuracion y confirmar que todas las entradas devuelven `OK` antes del despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El repositorio no ofrece comparativas ni benchmarks frente a alternativas, y no se han facilitado datos de rendimiento. La tabla siguiente situa la distribucion frente a otros modelos de tamano y proposito similares; los datos de las alternativas corresponden a informacion publica general y deben verificarse en sus repositorios oficiales.

| Modelo | Parametros | Contexto | Licencia | Formato de despliegue objetivo |
|---|---|---|---|---|
| RK3576-LLM-Qwen3.5-2B (esta distribucion) | ~2.000 millones (segun denominacion) | 1024 / 2048 / 4096 | Apache-2.0 | RKLLM para NPU RK3576 |
| Qwen/Qwen3.5-2B (origen) | ~2.000 millones | no disponible | Apache-2.0 | no disponible |
| Qwen2.5-1.5B-Instruct | 1.540 millones | 32.768 tokens | Apache-2.0 | safetensors, GGUF, multiples runtimes |
| Llama-3.2-1B-Instruct | 1.240 millones | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF, multiples runtimes |
| Gemma-2-2B | 2.600 millones | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF, multiples runtimes |

Diferencias clave: frente a estas alternativas, esta distribucion no compite en longitud de contexto (maximo 4096 tokens) ni ofrece artefactos GGUF o safetensors reutilizables en otros runtimes. Su ventaja es la ejecucion sobre NPU RK3576 con dos niveles de cuantizacion ya validados, algo que ninguna de las alternativas proporciona de serie.

## Limitaciones y advertencias

- No es un modelo entrenado: es una conversion y cuantizacion de Qwen/Qwen3.5-2B. Cualquier limitacion del modelo origen se hereda.
- Ausencia total de evaluacion: no hay benchmarks, ni comparativas, ni datos de latencia o consumo. No se puede estimar la calidad de las salidas a partir de la informacion disponible.
- Cero validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia externa de que las configuraciones funcionen correctamente.
- Contexto muy limitado: el maximo de 4096 tokens restringe tareas de documento largo, razonamiento multi-paso y flujos de agente con historial extenso.
- Idiomas no declarados: la model card no especifica que lenguas soporta el modelo, por lo que no se puede asumir un rendimiento adecuado en castellano.
- Dependencia estricta de hardware y runtime: solo RK3576 y solo RKLLM v1.2.4. No hay portabilidad a GPU, CPU u otras NPU con estos artefactos.
- Riesgo de degradacion por cuantizacion: w4a16 reduce la precision de los pesos a 4 bits; no se documenta ninguna evaluacion del impacto en la calidad frente a la version sin cuantizar.
- Compatibilidad interna: cada configuracion debe usarse con sus propios ficheros; mezclar ficheros de configuraciones distintas no esta soportado.
- Verificacion obligatoria: la model card exige comprobar las sumas SHA-256 antes de desplegar; obviar este paso deja el despliegue sin garantia de integridad.
- Licencia: Apache-2.0, permisiva para uso comercial, con la condicion de conservar los avisos de copyright originales que se mantienen en el fichero LICENSE del repositorio.
- Metadatos anomalos: las fechas de creacion y actualizacion declaradas (2026-10-02) no coinciden con una cronologia habitual y conviene tratarlas con cautela.
- No se documentan requisitos de memoria, plantilla de chat ni tokenizer, datos necesarios para una integracion en produccion.
- La existencia y el contenido del modelo origen Qwen/Qwen3.5-2B no se han podido verificar con la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RKNNAI/RK3576-LLM-Qwen3.5-2B
- Modelo origen declarado: https://huggingface.co/Qwen/Qwen3.5-2B
- Descarga via ModelScope (revision v1.2.4): `modelscope download --model RKNNAI/RK3576-LLM-Qwen3.5-2B --revision v1.2.4`
- Descarga via Hugging Face CLI: `hf download RKNNAI/RK3576-LLM-Qwen3.5-2B --revision v1.2.4`
- Fichero de licencia: LICENSE dentro del propio repositorio (Apache License 2.0)

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo ni sobre Qwen3.5-2B; los resultados obtenidos no guardan relacion con el tema y se descartan. No se han localizado papers, blogs, repositorios de codigo ni demos adicionales.
