# meshllm/DeepSeek-V4-Flash-UD-Q4_K_XL-layers

## Resumen

DeepSeek-V4-Flash-UD-Q4_K_XL-layers es un paquete de inferencia distribuida publicado por meshllm a partir del modelo DeepSeek-V4-Flash, en su cuantización dinámica UD-Q4_K_XL. No se trata de los pesos originales, sino de una descomposición por capas (43 capas) del GGUF de Unsloth, pensada para repartir la inferencia entre varias máquinas mediante el runtime Mesh LLM. El repositorio ocupa 155,3 GB y expone una API compatible con OpenAI en el puerto 3131 del nodo que actúa como coordinador.

El modelo subyacente pertenece a la familia DeepSeek V4 y, según la receta de vLLM, es un MoE con atención híbrida CSA+HCA, hyper-conexiones con restricción de variedad (manifold-constrained hyper-connections) y tres niveles de razonamiento (Non-think / Think High / Think Max). Los metadatos safetensors del repositorio declaran 6.577.257.595 parámetros, aunque ese dato es inconsistente con un paquete de 155,3 GB en ~4 bits y probablemente refleja solo una parte del artefacto. La ventana de contexto publicada por Unsloth y por rastreadores de terceros es de 1.000.000 tokens.

Su relevancia práctica es doble: por un lado, permite ejecutar localmente un modelo fronterizo de código y razonamiento sin depender de una API externa; por otro, resuelve el problema de que el GGUF completo no cabe en un único host, ofreciendo un formato de paquete por capas con manifiesto y sumas de comprobación SHA-256 para validar cada artefacto. La licencia es MIT, lo que facilita el uso comercial, siempre que se respeten las condiciones del modelo de origen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con atención híbrida CSA+HCA, según vLLM Recipes; la model card del paquete no la especifica |
| Parametros totales | 6.577.257.595 (metadatos safetensors del repositorio; dato probablemente parcial, ver advertencias) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (según Unsloth y rastreadores de terceros; no confirmado en la model card del paquete) |
| Tipos de cuantizacion | UD-Q4_K_XL (esta variante). El modelo base de Unsloth ofrece cuantizaciones dinámicas UD; se documenta UD-Q8_K_XL como alternativa prácticamente sin pérdida |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de unsloth/DeepSeek-V4-Flash-GGUF) |
| Formato de pesos | GGUF fragmentado en paquete de capas, más `model-package.json` (manifiesto con identidades y checksums) |
| Numero de capas | 43 |
| Tamano del repositorio | 155,3 GB |
| Libreria de ejecucion | mesh-llm |
| Modelo base | unsloth/DeepSeek-V4-Flash-GGUF (revision e3aa0d6a5fa4f820d9e132ac1fd1d01e1b2b49e0) |
| Descargas / likes | 3.138 descargas, 0 likes |
| Fecha de creacion / actualizacion | 10 de septiembre de 2026 / 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card de este repositorio no documenta la arquitectura del modelo subyacente: se limita a describir el formato del paquete (descomposición por capas, manifiesto, checksums y comando de generación con `skippy-model-package write-package`). La información arquitectónica disponible proviene de fuentes externas. La receta de vLLM para `deepseek-ai/DeepSeek-V4-Flash` lo describe como un modelo MoE con atención híbrida CSA+HCA, hyper-conexiones con restricción de variedad y tres niveles de razonamiento (Non-think, Think High y Think Max), lo que apunta a un transformer con routing de expertos y modos de cómputo de razonamiento configurables.

No hay datos disponibles en la información proporcionada sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla el mecanismo exacto de las tres capas de razonamiento ni cómo se activan en la plantilla de chat; para eso, el propio autor remite a la model card de `unsloth/DeepSeek-V4-Flash-GGUF`, que no forma parte de la información aquí recogida. La innovación diferencial de este repositorio no es de entrenamiento, sino de despliegue: convertir un GGUF monolítico en artefactos por capa que pueden repartirse entre pares de una malla local, manteniendo la API compatible con OpenAI.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat heredada del modelo base.
- Generacion de codigo: el rastreador llm-model-tracker le asigna una media de 72,2 en pruebas de codigo (benchlm.ai), en torno al 85-90 % de la calidad de GLM-5.2.
- Razonamiento logico y matematico, con tres modos de razonamiento (Non-think, Think High, Think Max) según vLLM Recipes.
- Contexto largo: ventana declarada de 1.000.000 tokens, adecuada para analisis de repositorios completos o documentacion extensa.
- Servido compatible con OpenAI: expone `/v1/chat/completions` y `/v1/models` a traves del runtime Mesh LLM.
- Inferencia distribuida: reparto de las 43 capas entre varias maquinas mediante `mesh-llm serve --model ... --split`.
- Inferencia local y privada, sin salida de datos a servicios externos.
- Capacidades agenticas: segun llm-model-tracker, mas debiles que en modelos competidores (55,4 frente a puntuaciones superiores de GLM-5.2).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de programacion en local: el modelo puede generar y revisar codigo sin enviar el codigo fuente a terceros, algo critico en entornos con propiedad intelectual sensible. La ventana de 1M tokens permite cargar un repositorio completo como contexto.
- Analisis de repositorios grandes: con 1.000.000 de tokens de contexto, se pueden procesar arboles de codigo, historiales de cambios y documentacion en una sola sesion para tareas de refactorizacion o auditoria.
- Despliegue en cluster domestico o de laboratorio: el paquete por capas permite sumar la memoria de varias maquinas modestas para servir un modelo que no cabe en una sola GPU, usando `mesh-llm serve --split` en cada nodo.
- Backend compatible con OpenAI para herramientas existentes: al exponer `/v1/chat/completions`, se puede sustituir una API en la nube por este endpoint local en aplicaciones que ya usan el SDK de OpenAI, sin cambios de codigo.
- Procesamiento de documentacion tecnica y legal: la combinacion de contexto largo y razonamiento por niveles permite resumir, extraer obligaciones o comparar clausulas en lotes de documentos extensos.
- Generacion asistida en pipelines de CI/CD: integrable como servicio local para generar descripciones de cambios, mensajes de commit o borradores de pruebas, evitando costes por token y dependencias externas.
- Investigacion sobre inferencia distribuida: el formato de paquete por capas y su manifiesto con checksums sirven como banco de pruebas para estudiar latencia, reparto de carga y tolerancia a fallos en mallas de nodos.
- Chat interno para equipos: al ser inferencia privada y con licencia MIT, es apto para asistentes corporativos donde la confidencialidad impide usar APIs publicas.

## Benchmarks y rendimiento

Los datos disponibles proceden de rastreadores de terceros (llm-model-tracker, que cita benchlm.ai) y no de una evaluacion oficial publicada por DeepSeek o por el autor del paquete. Deben tomarse como orientativos.

| Metrica | DeepSeek-V4-Flash | GLM-5.2 | Fuente |
|---|---|---|---|
| Media en codigo | 72,2 | no disponible como valor absoluto; se indica que V4-Flash alcanza el 85-90 % de su calidad | benchlm.ai via llm-model-tracker |
| Tareas agenticas | 55,4 | superior (valor no disponible) | llm-model-tracker |
| Ventana de contexto | 1M tokens | 1M tokens | llm-model-tracker |
| Coste de API (entrada / salida por millon de tokens) | 0,09 $ / 0,18 $ | 0,91 $ / 2,86 $ | llm-model-tracker |

Los costes de API corresponden al servicio alojado, no a esta ejecucion local; se incluyen porque son la referencia con la que el rastreador compara ambos modelos. No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion disponible, ni mediciones de latencia o throughput especificas de este paquete de capas.

## Requisitos de hardware

- Espacio en disco: 155,3 GB para el paquete completo, mas el espacio de trabajo del runtime. No es un modelo descargable en un portatil convencional.
- VRAM estimada para inferencia: el conjunto de pesos ronda los 155 GB en UD-Q4_K_XL, por lo que se necesitan al menos dos aceleradores de 80 GB (A100 80 GB, H100 80 GB) para un ajuste muy justo, y tres o cuatro para operar con holgura.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o MI300X para nodos de datacenter. Para repartos por capas, mezclas de GPUs con distinta VRAM son viables siempre que el reparto de capas respete la memoria de cada nodo.
- GPU de consumo: no cabe en una RTX 4090, RTX 5090 ni similares con 24-32 GB. El paquete esta disenado precisamente para el caso en que el GGUF completo no cabe en un solo host.
- Memoria para contexto largo: con 1M tokens de ventana, la cache KV puede superar ampliamente el tamano de los pesos en el caso peor; hay que dimensionar el reparto contando con ella, aunque la atencion hibrida CSA+HCA deberia reducir ese coste frente a atencion densa.
- Opciones de despliegue: `mesh-llm serve --model "meshllm/DeepSeek-V4-Flash-UD-Q4_K_XL-layers" --split` en cada maquina; consulta de estado en `http://localhost:3131/api/status` y modelos en `/v1/models`. Para ejecucion en un solo host, la alternativa natural es el GGUF de origen con llama.cpp u Ollama, o vLLM usando la receta publicada para el modelo base.
- Latencia y throughput: no disponibles. Al tratarse de inferencia distribuida, la latencia dependera de la red entre nodos y del reparto de capas, no solo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| meshllm/DeepSeek-V4-Flash-UD-Q4_K_XL-layers | 6.577.257.595 declarados (probablemente parciales) | 1M tokens (fuente externa) | MIT | GGUF por capas, runtime mesh-llm | Requiere malla de nodos; API compatible con OpenAI |
| unsloth/DeepSeek-V4-Flash-GGUF | no disponible | 1M tokens (fuente externa) | MIT | GGUF monolítico (UD-Q4_K_XL, UD-Q8_K_XL, etc.) | Ejecutable en un solo host con llama.cpp u Ollama; Q8 documentado como prácticamente sin perdida |
| GLM-5.2 | no disponible | 1M tokens | no disponible | no disponible | Mejor puntuacion agentica y de codigo segun llm-model-tracker, a un coste de API diez veces mayor |
| meshllm/DeepSeek-V4-Flash-0731-UD-Q4_K_XL-layers | no disponible | no disponible | no disponible | GGUF por capas | Variante del mismo esquema para la version 0731; datos no disponibles en esta busqueda |

No se dispone de datos suficientes para comparar parametros activos, throughput ni consumo energetico con alternativas de la misma categoria.

## Limitaciones y advertencias

- Discrepancia de datos: la cifra de 6.577.257.595 parametros procede de metadatos safetensors y es incoherente con un paquete de 155,3 GB en ~4 bits. Es probable que corresponda solo a una parte del artefacto; no debe usarse como dato fiable de tamano del modelo.
- La model card declara "Parameter scale: not recorded", "Activation width: not recorded" y "Package size: 0 B", campos vacios o erroneos que indican que el paquete no esta completamente documentado.
- No hay informacion sobre idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano sin evaluacion previa.
- Riesgo de alucinacion: no se documentan tasas de error ni modos de mitigacion. Como en cualquier modelo generativo, las salidas deben verificarse en contextos criticos.
- Rendimiento agentico limitado: la puntuacion de 55,4 en tareas agenticas es inferior a la de competidores, lo que desaconseja su uso como planificador autonomo sin supervision.
- Dependencia del runtime: el paquete por capas solo funciona con Mesh LLM. Para usarlo en llama.cpp, Ollama u otros runners hay que acudir al GGUF de origen.
- Benchmarks de terceros: los datos de codigo, agenticas y coste provienen de benchlm.ai a traves de llm-model-tracker y no han sido verificados de forma independiente.
- Idiomas y sesgos: no hay estudios de sesgo ni evaluaciones multilingues disponibles; el comportamiento fuera del ingles es una incognita.
- Licencia: MIT, permisiva y apta para uso comercial, heredada del repositorio de Unsloth. Aun asi, conviene revisar la licencia del modelo original de DeepSeek por si impone condiciones adicionales sobre el modelo base.
- Coste de operacion: requiere hardware de datacenter o varios hosts, con el consiguiente consumo energetico y complejidad de red.
- Repositorio con 0 likes y 3.138 descargas: comunidad reducida, lo que limita el soporte y la resolucion de incidencias por parte de otros usuarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/meshllm/DeepSeek-V4-Flash-UD-Q4_K_XL-layers
- Modelo base en HuggingFace: https://huggingface.co/unsloth/DeepSeek-V4-Flash-GGUF
- Variante 0731 del mismo esquema: https://huggingface.co/meshllm/DeepSeek-V4-Flash-0731-UD-Q4_K_XL-layers/tree/main/automation
- Receta de vLLM para DeepSeek-V4-Flash: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash
- Guia de Unsloth para ejecutar DeepSeek-V4 localmente: https://unsloth.ai/docs/models/deepseek-v4
- Seguimiento de modelos con datos de benchmarks: https://github.com/startakovsky/llm-model-tracker/blob/main/deepseek-v4-flash.md
- Web de Mesh LLM: https://www.meshllm.cloud
- Repositorio de Mesh LLM en GitHub: https://github.com/Mesh-LLM/mesh-llm
- Especificacion del formato de paquete por capas: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catalogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord de la comunidad: https://discord.gg/rs6fmc63eN
