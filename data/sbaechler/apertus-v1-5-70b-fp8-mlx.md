# sbaechler/Apertus-v1.5-70B-FP8-mlx

## Resumen

Apertus-v1.5-70B-FP8-mlx es una conversion cuantizada a 8 bits (FP8) del modelo base swiss-ai/Apertus-v1.5-70B, publicada por el usuario sbaechler en formato MLX para su ejecucion en chips de Apple Silicon. Se trata de una adaptacion de pesos, no de un modelo entrenado desde cero: conserva la arquitectura, el tokenizador y el comportamiento del modelo original, pero reduce el peso en disco de los aproximadamente 71.940 millones de parametros a un repositorio de 77,2 GB, lo que lo hace manejable en equipos Apple con memoria unificada grande.

El modelo hereda las caracteristicas declaradas en el repositorio base y en las etiquetas del propio repo: es multimodal (pipeline `image-text-to-text`, con soporte de entrada de imagen ademas de texto), multilingue y orientado a conversacion. El identificador incluye las etiquetas `switzerland`, `swiss-ai` y `apertus`, lo que sitúa la familia Apertus en el ecosistema de IA open source suizo. La licencia es Apache 2.0, lo que permite uso comercial sin las restricciones habituales de otros modelos de gran tamano.

Su relevancia practica es doble. Por un lado, permite ejecutar localmente un modelo de ~72.000 millones de parametros en un solo equipo de sobremesa Apple (Mac Studio con M3 Ultra, por ejemplo), sin GPU dedicada ni despliegue en nube, lo que resulta atractivo para entornos con requisitos de soberania de datos. Por otro lado, sirve como banco de pruebas de cuantizacion FP8 sobre MLX: permite medir la degradacion de calidad frente al modelo base en BF16 y evaluar el rendimiento real de inferencia en Apple Silicon. El acceso al repositorio esta restringido y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de tipo decodificador, multimodal (texto e imagen); no se especifica en la informacion disponible si incorpora componentes hibridos |
| Parametros totales | 71.939.902.320 (~71,9 mil millones, segun los pesos safetensors del repositorio) |
| Parametros activos | No aplica: el modelo base es denso, no una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (8 bits) en formato MLX; el repositorio declara `8-bit`. No se confirman otros niveles (4 bits, 6 bits) en esta publicacion |
| Idiomas soportados | No disponible. El repositorio se etiqueta como `multilingual`, pero no se detalla la lista de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx`, `safetensors`); no se incluye GGUF |
| Modelo base | swiss-ai/Apertus-v1.5-70B |
| Tamano del repositorio | 77,2 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de publicacion | 23 de septiembre de 2026 (creacion del repositorio) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el entrenamiento en los datos proporcionados. Lo que se puede afirmar con certeza es que este repositorio no ha entrenado ningun modelo: es una conversion de pesos del modelo base swiss-ai/Apertus-v1.5-70B a precision FP8 en el formato de MLX. Por tanto, la arquitectura, el dataset de preentrenamiento, las fases de ajuste (si las hubo, del tipo SFT, RLHF o DPO) y cualquier innovacion tecnica del modelo original corresponden al equipo que publico el modelo base, no a esta conversion.

El unico cambio tecnico introducido por esta version es la cuantizacion a 8 bits de los pesos para su carga en MLX. La cuantizacion FP8 mantiene tipicamente una fidelidad alta respecto a BF16, con una perdida de calidad muy inferior a la de las cuantizaciones de 4 bits, a cambio de un ahorro de memoria de aproximadamente la mitad. Dado el pipeline declarado (`image-text-to-text`), la conversion cubre tambien los componentes de procesamiento de imagen del modelo multimodal, aunque no se especifica en la informacion disponible como se ha tratado la torre de vision durante la cuantizacion.

No se detalla si la cuantizacion es por tensor, por canal o de grupo, ni si se han conservado capas sensibles (embeddings, cabeza de salida, proyecciones de vision) en mayor precision. Tampoco se documenta ninguna tecnica de aceleracion adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: el repositorio se etiqueta como `conversational` y el pipeline es de tipo chat multimodal.
- Entrada multimodal de imagen y texto: la etiqueta `multimodal` y el pipeline `image-text-to-text` indican que el modelo acepta imagenes junto con texto, aunque no se detalla la resolucion soportada ni el numero de imagenes por peticion.
- Multilingue: el repositorio declara la etiqueta `multilingual`, si bien la lista concreta de idiomas no esta disponible.
- Razonamiento y generacion de codigo o matematicas: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio o video: no disponibles.

## Casos de uso

- Procesamiento de documentos escaneados en local: gracias a la entrada de imagen y texto, el modelo puede extraer datos estructurados de facturas, formularios o albaranes digitalizados sin enviar el documento a un servicio externo. Es adecuado para despachos y pymes que no pueden externalizar informacion confidencial.
- Analisis de documentacion confidencial en sector publico o sanitario: al ejecutarse en un Mac Studio con memoria unificada, los datos nunca salen del equipo, lo que encaja con requisitos de cumplimiento y residencia de datos del tipo exigido en administraciones europeas.
- Despliegue soberano en organizaciones suizas o europeas: la combinacion de licencia Apache 2.0 y ejecucion local elimina la dependencia de APIs de terceros y facilita auditorias internas del modelo utilizado.
- Asistente multilingue de primera linea sobre corpus internos: con la etiqueta multilingue y la base conversacional, se puede construir un asistente que consulte documentacion interna en varios idiomas, siempre que se valide empiricamente la calidad en los idiomas concretos de interes.
- Evaluacion y validacion de cuantizacion FP8: el repositorio es util como referencia para comparar la salida del modelo base en BF16 frente a esta version en FP8 sobre las mismas peticiones, y cuantificar la perdida real antes de adoptar FP8 en produccion.
- Banco de pruebas en Apple Silicon antes de invertir en GPU: permite prototipar prompts, flujos multimodales y longitudes de contexto en un solo equipo de sobremesa antes de decidir un despliegue sobre GPUs A100 o H100 con el modelo base.
- Investigacion academica sobre inferencia eficiente en MLX: sirve para medir throughput, latencia por token y consumo energetico de un modelo de ~72.000 millones de parametros en silicio Apple, un escenario poco cubierto en la literatura.
- Generacion de informes con soporte grafico: descripcion y resumen de graficos, capturas de pantalla o diagramas tecnicos integrados en un informe, combinando la entrada de imagen con la generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web asociada no devolvio ningun resultado relevante sobre el modelo, su familia o sus evaluaciones; los resultados obtenidos eran contenido no relacionado y sin valor tecnico, por lo que se descartan por completo.

En consecuencia, no se dispone de datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion para esta version cuantizada ni para el modelo base, a partir de la informacion facilitada.

## Requisitos de hardware

- Memoria estimada: solo los pesos FP8 ocupan aproximadamente 71,9 GB, y el repositorio completo pesa 77,2 GB. Sumando cache KV y el estado de la aplicacion, hay que reservar del orden de 85 a 100 GB de memoria unificada para un uso comodo con contexto largo.
- Equipos Apple recomendados: Mac Studio con M3 Ultra en configuracion de 96 GB (al limite), y de forma mas holgada en 192 GB o 256 GB. MacBook Pro con M4 Max de 128 GB puede cargar el modelo, aunque con menos margen para contexto extenso y peor refrigeracion sostenida.
- Equipos Apple no admitidos: cualquier Mac con 16, 24, 32, 36 o 48 GB de memoria unificada no puede cargar el modelo en FP8. En esos casos habria que recurrir al modelo base con una cuantizacion de 4 bits, que no se ofrece en este repositorio.
- GPUs dedicadas: este repositorio en formato MLX no es directamente ejecutable en CUDA. Para usar el modelo base en GPU haria falta la version BF16 (aproximadamente 144 GB de pesos), lo que implica al menos 2 GPU de 80 GB (H100 o A100 80 GB) o 4 GPU de 48 GB, con margen adicional para cache.
- Opciones de despliegue: MLX y `mlx-lm` para texto; `mlx-vlm` es la via esperable para el modo multimodal. vLLM, TGI, Ollama y llama.cpp no soportan pesos MLX de forma nativa; llama.cpp requeriria una conversion previa a GGUF que este repositorio no proporciona.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para esta conversion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. La tabla siguiente recoge unicamente los datos verificables de parametros, licencia y disponibilidad de alternativas de la misma categoria (modelos abiertos de ~70.000 millones de parametros, algunos multimodales). Los campos de rendimiento se dejan como no disponibles para no introducir cifras sin respaldo.

| Modelo | Parametros | Formato y destino | Licencia | Notas |
|---|---|---|---|---|
| sbaechler/Apertus-v1.5-70B-FP8-mlx (este modelo) | ~71,9 mil millones | FP8 MLX, Apple Silicon | Apache 2.0 | Conversion de comunidad, acceso restringido, multimodal |
| swiss-ai/Apertus-v1.5-70B | No disponible en la informacion proporcionada | BF16, GPU | Apache 2.0 | Modelo base del que deriva esta conversion, multimodal y multilingue |
| Llama 3.3 70B Instruct | 70 mil millones | BF16 y GGUF, multiplataforma | Licencia comunitaria de Meta (no Apache 2.0) | Amplio ecosistema de despliegue y cuantizaciones; rendimiento comparativo no disponible aqui |
| Qwen2.5 72B Instruct | ~72 mil millones | BF16 y GGUF, multiplataforma | Licencia propia de Qwen (no Apache 2.0) | Fuerte soporte multilingue; rendimiento comparativo no disponible aqui |

## Limitaciones y advertencias

- Sesgos: no se ha publicado ninguna evaluacion de sesgos para esta conversion ni, en la informacion disponible, para el modelo base. Cualquier uso en produccion deberia acompanarse de una evaluacion propia sobre el dominio objetivo.
- Alucinacion: como cualquier modelo generativo de este tamano, puede producir afirmaciones plausibles pero falsas, especialmente en tareas de extraccion de datos de imagenes o documentos donde el contenido sea ambiguo o de baja calidad.
- Cuantizacion FP8: aunque la perdida respecto a BF16 suele ser reducida, no es nula. En tareas sensibles a la precision, como matematicas o generacion de codigo, conviene comparar la salida contra el modelo base antes de adoptarla.
- Idiomas: la etiqueta `multilingual` no especifica que idiomas estan cubiertos ni con que calidad. El castellano no esta confirmado como idioma soportado y debe validarse empiricamente.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible. No se debe asumir un valor concreto para planificar despliegues.
- Licencia: el modelo base y esta conversion se publican bajo Apache 2.0, lo que permite uso comercial. No obstante, el repositorio esta restringido (gated) y exige aceptar condiciones en HuggingFace; conviene revisar si el modelo base impone una politica de uso aceptable adicional.
- Dependencia de plataforma: los pesos MLX no son portables a CUDA ni a CPU x86 sin conversion. Esto limita el despliegue a hardware Apple Silicon y complica la migracion a infraestructura de nube convencional.
- Madurez del repositorio: cero descargas y cero interacciones en el momento de la consulta, publicado por un autor de comunidad y sin documentacion de validacion. No debe tratarse como un artefacto con garantias de mantenimiento.
- Soporte de herramientas: al no estar confirmado el soporte de function calling ni de flujos de agente, no se debe planificar una arquitectura basada en ello sin verificacion previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sbaechler/Apertus-v1.5-70B-FP8-mlx
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-70B
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre el modelo, su familia o sus evaluaciones. Los resultados devueltos no guardaban relacion con el modelo y se han descartado. No se dispone, por tanto, de enlaces a papers, blogs tecnicos, repositorios de codigo ni demos.
