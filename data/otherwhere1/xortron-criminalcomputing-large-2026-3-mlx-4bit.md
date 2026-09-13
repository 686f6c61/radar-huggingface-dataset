# otherwhere1/XORTRON.CriminalComputing.LARGE.2026.3-mlx-4Bit

## Resumen

XORTRON.CriminalComputing.LARGE.2026.3-mlx-4Bit es una conversion al formato MLX del modelo darkc0de/XORTRON.CriminalComputing.LARGE.2026.3, publicada por el usuario otherwhere1. Se trata de un modelo de generacion de texto de tipo decoder-only con 122.610.069.504 parametros reales (unos 122,6 mil millones) segun los pesos safetensors, cuantizado a 4 bits para su ejecucion en hardware Apple Silicon mediante la libreria mlx-lm (version 0.31.2 declarada en la model card). El repositorio ocupa 69,0 GB.

La relevancia de esta ficha es acotada y conviene ser explicito: el modelo pertenece a la familia de modelos "abliterated" o "decensored" (etiquetas heretic, uncensored, decensored, abliterated), es decir, ajustes disenados para eliminar o reducir los mecanismos de rechazo del modelo original. Esto lo orienta a casos de uso de investigacion sobre alineacion, red-teaming y generacion creativa sin filtros, y no a despliegues de produccion orientados al publico general sin capas adicionales de moderacion. El modelo base se distribuye bajo licencia WTFPL, una licencia permisiva de dominio publico efectivo.

Se desconoce la arquitectura exacta mas alla de la etiqueta "mistral" presente en los tags del repositorio, y no hay informacion publicada sobre el dataset de entrenamiento, la longitud de contexto, los resultados de benchmarks ni los detalles del proceso de ablacion. La model card del repositorio es exclusivamente una plantilla de conversion a MLX y no aporta documentacion tecnica adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta "mistral" en los tags del repo; no confirmado en la model card) |
| Parametros totales | 122.610.069.504 (122,6 mil millones, dato de safetensors) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX). Equivalente a ~4,5 bits por peso efectivos, coherente con el tamano de repo de 69,0 GB |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko |
| Licencia | WTFPL |
| Formato de pesos | safetensors en formato MLX cuantizado a 4 bits |
| Tamano del repositorio | 69,0 GB |
| Modelo base | darkc0de/XORTRON.CriminalComputing.LARGE.2026.3 |
| Libreria de referencia | mlx-lm 0.31.2 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No hay informacion publicada en la model card sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otros metodos de alineacion. La unica pista sobre la familia arquitectonica es la etiqueta "mistral" incluida en los tags del repositorio, que sugiere una implementacion compatible con el tokenizador y la configuracion de la familia Mistral, pero no permite confirmar la topologia exacta (attention estandar frente a variantes con sliding window attention o MoE). Dado el tamano de 122,6 mil millones de parametros, no corresponde a ninguna configuracion publica estandar de Mistral y podria tratarse de un merge de modelos o de una configuracion ajustada por el autor.

La innovacion tecnica documentada en este repositorio es exclusivamente la conversion a MLX: el autor declara haber transformado los pesos del modelo base con mlx-lm 0.31.2 y ofrece un ejemplo funcional de carga y generacion mediante mlx_lm.load y mlx_lm.generate, aplicando la plantilla de chat del tokenizador cuando esta disponible. Las etiquetas heretic, decensored y abliterated indican que el modelo base ha sufrido algun tipo de intervencion para reducir sus mecanismos de rechazo (habitualmente ablacion de direcciones de rechazo en el espacio de activaciones o ajuste fino dirigido), pero el repositorio no documenta el metodo concreto, su alcance ni su impacto medido sobre las capacidades originales.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat, con plantilla aplicada mediante el tokenizador.
- Soporte multilingue declarado para diez idiomas: ingles, frances, aleman, espanol, italiano, portugues, chino, japones, ruso y coreano.
- Generacion creativa y de ficcion con menor tasa de rechazo que un modelo alineado convencional, que es el objetivo declarado del ajuste.
- Razonamiento y respuesta a instrucciones generales, en la medida en que el modelo base las conserve tras la ablacion (no verificado).
- Compatibilidad declarada con text-generation-inference y endpoints compatibles a nivel de metadatos, si bien los pesos MLX requieren conversion previa para esos servidores.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion sobre alineacion y ablacion: el modelo permite estudiar empiricamente como varia la tasa de rechazo, la coherencia y la utilidad tras eliminar direcciones de rechazo, comparando respuestas contra el modelo base original.
- Red-teaming y evaluacion de seguridad: util como generador adversario para probar clasificadores de contenido y sistemas de moderacion en un entorno controlado y aislado.
- Generacion creativa sin filtros: escritura de ficcion, narrativa adulta o dialogos que un modelo alineado convencional rechazaria sistematicamente, ejecutada localmente en Mac sin enviar datos a terceros.
- Asistente multilingue local: al cubrir diez idiomas y ejecutarse en Apple Silicon, puede desplegarse como asistente privado en un Mac de gama alta sin conexion externa.
- Generacion de datos sinteticos: produccion de corpus de texto anotados o no anotados para entrenar otros modelos, aprovechando la diversidad de idiomas y la ausencia de filtros.
- Experimentacion con cuantizacion MLX: caso de uso metodologico para medir la degradacion de calidad al pasar de pesos completos a 4 bits en modelos de mas de 100 mil millones de parametros.
- Rol y simulacion de personajes: conversaciones largas de rol en local con modelos de gran tamano, aprovechando la memoria unificada de los chips Apple de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a la plantilla de conversion a MLX y no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- El repositorio pesa 69,0 GB, por lo que la inferencia en MLX requiere al menos esa cantidad de memoria unificada mas el espacio para la cache KV.
- Plataforma: MLX esta disenado para Apple Silicon (M1/M2/M3/M4 y variantes Pro, Max y Ultra). No se ejecuta de forma nativa en GPU NVIDIA o AMD sin conversion previa de los pesos.
- Macs viables: modelos con 96 GB o 128 GB de memoria unificada (por ejemplo M2 Ultra 128 GB, M3 Ultra en configuraciones de 96 GB o superiores). En equipos de 64 GB o menos los pesos cuantizados no caben.
- No cabe en ninguna GPU de consumo con memoria dedicada de 24 GB o menos (RTX 4090, RTX 3090, etc.) sin cuantizaciones mas agresivas no publicadas en este repositorio.
- Para despliegue en GPU, habria que reconvertir los pesos a GGUF o a safetensors estandar; como referencia, 122,6 mil millones de parametros a 4 bits ocupan aproximadamente 61 GB, por lo que se necesitaria una H100 de 80 GB, una A100 de 80 GB o dos A100 de 40 GB.
- Opciones de despliegue: mlx-lm (carga directa y generacion), mlx_lm.server para exponer una API compatible con OpenAI, y LM Studio en Mac. vLLM, llama.cpp, Ollama y TGI no consumen pesos MLX directamente y requieren conversion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de rendimiento del modelo no estan publicados, de modo que la comparacion se limita a parametros, contexto, licencia y distribucion. Los datos de las alternativas provienen de la documentacion publica de sus respectivos autores y pueden variar segun la version consultada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| XORTRON.CriminalComputing.LARGE.2026.3-mlx-4Bit | 122,6 mil millones | no disponible | WTFPL | MLX 4 bits en HuggingFace |
| Mistral Large 2 | 123 mil millones | 128k | Mistral Research License | API y pesos bajo registro |
| Llama 3.3 70B Instruct | 70 mil millones | 128k | Llama 3.3 Community License | Pesos abiertos en HuggingFace |
| Qwen2.5 72B Instruct | 72 mil millones | 128k | Qwen License | Pesos abiertos en HuggingFace |
| Mixtral 8x22B | 141 mil millones totales, 39 mil millones activos (MoE) | 64k | Apache 2.0 | Pesos abiertos en HuggingFace |

Comparativa de rendimiento: no disponible para el modelo objeto de esta ficha, por lo que no es posible establecer una comparacion cuantitativa fiable con las alternativas.

## Limitaciones y advertencias

- El modelo base es una variante "abliterated" o "decensored": cabe esperar que genere contenido que los modelos alineados rechazan, incluyendo material ofensivo, ilegal o danino. No es apto para despliegues publicos sin moderacion adicional.
- La ablacion de rechazo suele degradar capacidades generales colaterales (coherencia, seguimiento de instrucciones, seguridad). No hay evaluacion publicada que cuantifique esa degradacion.
- Riesgo de alucinacion no medido: no se han publicado evaluaciones de veracidad ni de calibracion.
- Origen de datos desconocido: no se documentan los datos de entrenamiento ni de ajuste, por lo que no puede descartarse la presencia de sesgos, contenido protegido o datos personales en el corpus.
- Longitud de contexto no declarada: se desconoce la ventana real de operacion, lo que impide planificar despliegues con entradas largas.
- La licencia WTFPL es extremadamente permisiva y permite uso comercial sin practicamente condiciones, pero no exime al operador de la responsabilidad legal y etica sobre el contenido generado.
- Los pesos estan cuantizados a 4 bits, con la perdida de calidad asociada frente a los pesos completos. No se publican comparativas entre ambas versiones.
- El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y fue creado con una diferencia de cinco minutos entre las marcas de creacion y actualizacion, lo que sugiere un artefacto de publicacion automatizada o experimental sin validacion comunitaria.
- Advertencia sobre las busquedas web: los resultados recuperados no guardan ninguna relacion con el modelo (se refieren al servicio de television MyCanal), por lo que no aportan documentacion tecnica util.

## Enlaces

- Repositorio del modelo: https://huggingface.co/otherwhere1/XORTRON.CriminalComputing.LARGE.2026.3-mlx-4Bit
- Modelo base: https://huggingface.co/darkc0de/XORTRON.CriminalComputing.LARGE.2026.3
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Paper, blog, repositorio o demo del autor: no disponible. No se han encontrado enlaces tecnicos relevantes en la busqueda web.
