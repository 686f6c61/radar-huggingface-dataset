# Jundot/Qwen3.8-Flash-Next-oQ8e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ8e-mtp es un checkpoint cuantizado en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario Jundot. Se trata de una vista previa experimental de la arquitectura que esta detras de Qwen4: un modelo de lenguaje y vision con mezcla de expertos (MoE) de 125.000 millones de parametros totales y 6.000 millones activos por token, acompanado de un embedding de n-gramas de 51.000 millones de parametros, un codificador de vision de 449 millones y una cabeza de prediccion multi-token (MTP). El checkpoint completo suma 180.000 millones de parametros logicos y 194,9 GB de almacenamiento en disco.

La relevancia de esta publicacion es doble. Por un lado, permite ejecutar un modelo multimodal de escala frontier en hardware Apple Silicon mediante MLX, ya que el checkpoint completo ocupa 181,48 GiB y emplea una media efectiva de 8,660 bits por peso. Por otro, documenta una tecnica de cuantizacion mixta concreta (oQ8e, implementada en oMLX v0.7.1) que asigna bits en funcion de la sensibilidad medida de cada capa, en lugar de aplicar un unico esquema uniforme.

El modelo conserva la licencia Qwen Community 1.0 del modelo de origen y no incluye resultados de benchmarks en su model card. El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y fue creado el 11 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal con Gated DeltaNet, Qwen Sparse Attention (QSA) y Gated Residual streams |
| Parametros totales | 179.999.981.459 (180.000 millones, incluyendo backbone, n-gram embedding, vision encoder y MTP head) |
| Parametros activos | 6.000 millones activados (backbone de lenguaje de 125.744 millones de parametros logicos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ8e (8 bits afines con grupos de 32, 64 y 128, mas capas en BF16); media efectiva de 8,660 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0, heredada del modelo de origen) |
| Formato de pesos | MLX safetensors (library_name: mlx); no se distribuyen pesos GGUF ni otros formatos |

## Arquitectura y entrenamiento

El modelo de origen, Qwen3.8-Flash-Next, es una vista previa experimental de la arquitectura de Qwen4. Combina un backbone de lenguaje MoE de 125.744 millones de parametros logicos con 6.000 millones activos, un embedding de n-gramas de 51.200 millones de parametros (el 28,445% de los pesos logicos totales), un codificador de vision de 0,449 millones y una cabeza de prediccion multi-token de 2,607 millones. La secuencia de atencion emplea Qwen Sparse Attention (QSA) junto con capas Gated DeltaNet —un mecanismo de estado recurrente lineal hibrido— y flujos residuales con compuerta (Gated Residual streams).

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Sobre el proceso de cuantizacion si hay datos concretos: se aplico oQ (oMLX v0.7.1) con la variante Improved oQe Quantization, que mide la sensibilidad de cada capa, redondea cada grupo con una matriz de importancia obtenida de 1024 muestras x 512 tokens y reajusta escala y sesgo mediante minimos cuadrados ponderados. El reparto resultante es: 2,406B pesos en 8 bits afines con grupo 128 (8,25 bits efectivos), 51,200B con grupo 32 (9,00 bits efectivos), 125,878B con grupo 64 (8,50 bits efectivos) y 0,516B en BF16 (16,00 bits efectivos). El desglose por componentes es 133,590 GB para el backbone de lenguaje, 57,600 GB para el embedding de n-gramas, 0,898 GB para el codificador de vision y 2,770 GB para la cabeza MTP.

## Capacidades

- Generacion de texto y razonamiento sobre el backbone de lenguaje MoE de 125B parametros totales y 6B activos.
- Entrada multimodal de imagen y texto (pipeline_tag: image-text-to-text), con codificador de vision incluido en el checkpoint.
- Prediccion multi-token (MTP): el checkpoint incluye la cabeza MTP, lo que habilita decodificacion especulativa o generacion de varios tokens por paso en runtimes que la soporten.
- Recuperacion basada en n-gramas mediante el embedding dedicado de 51.200 millones de parametros.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Idiomas soportados: no disponibles.

## Casos de uso

- Analisis de documentos con componentes visuales en local: al aceptar entradas de imagen y texto, puede procesar facturas escaneadas, informes con graficos o diagramas tecnicos sin enviar los datos a un servicio externo, algo relevante en entornos con requisitos de confidencialidad.
- Asistentes conversacionales multimodales on-premise: el modelo se ejecuta integramente en hardware propio sobre MLX, de modo que una organizacion con Mac Studio de memoria unificada alta puede desplegar un asistente que vea imagenes y mantenga conversaciones sin coste por token en la nube.
- Generacion y revision de codigo con contexto visual: a partir de capturas de interfaz, diagramas de arquitectura o trazas de error renderizadas como imagen, el modelo puede producir o revisar codigo dentro de un flujo de desarrollo local.
- Investigacion en cuantizacion mixta: el checkpoint sirve como caso de estudio reproducible de la variante oQ8e, con un desglose publico de bits por grupo y por componente que permite comparar la degradacion frente al modelo base en BF16.
- Aceleracion mediante MTP en runtimes compatibles: los equipos que implementen decodificacion especulativa con la cabeza MTP incluida pueden reducir el numero de pasos de decodificacion necesarios, un escenario tipico en servicios de generacion con latencia critica.
- Despliegue en cluster de equipos Apple Silicon para privacidad estricta: sectores como salud, legal o defensa pueden ejecutar un modelo de 180B parametros en infraestructura propia sin transferir datos a terceros.
- Evaluacion comparativa de arquitecturas hibridas: investigadores interesados en la combinacion de Gated DeltaNet con Qwen Sparse Attention pueden usar este checkpoint para estudiar el comportamiento de la atencion dispersa en tareas de contexto largo, siempre que la longitud de contexto soportada se determine experimentalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye valores de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni comparaciones con el modelo base en BF16. Tampoco se proporcionan mediciones de latencia, throughput ni memoria pico durante la inferencia.

## Requisitos de hardware

- VRAM / memoria unificada estimada: el checkpoint ocupa 181,476 GiB (194,858 GB) en disco. La inferencia requiere esa cantidad mas la cache KV y el overhead del runtime, por lo que se recomienda un minimo de 192 GB de memoria unificada y, de forma realista, 256 GB o mas para margen operativo.
- GPU recomendadas: MLX esta disenado para Apple Silicon, de modo que el hardware objetivo son chips de la serie M con memoria unificada grande (M2 Ultra 192 GB, M3 Ultra 512 GB, Mac Pro con memoria ampliada). No hay soporte nativo en CUDA, por lo que las NVIDIA A100, H100 o RTX 4090 no ejecutan este checkpoint sin una conversion de formato previa que no se distribuye.
- Cabe en GPU de consumo: no. Ni siquiera en configuraciones multi-GPU de consumo, dado que el formato es MLX y el peso del checkpoint supera los 180 GiB. Tampoco cabe en una unica GPU profesional de 80 GB.
- Opciones de despliegue: runtime MLX (libreria declarada del repositorio) y oMLX v0.7.1, la herramienta con la que se genero la cuantizacion. No se proporcionan pesos para vLLM, llama.cpp, Ollama ni TGI; su uso exigiria una conversion desde MLX que la informacion disponible no documenta.
- Latencia y throughput estimados: no disponibles. Con 6.000 millones de parametros activos por token, el coste computacional por token es propio de un modelo denso de ese tamano, pero el ancho de banda de memoria necesario para recorrer las capas MoE en 8 bits condiciona fuertemente el rendimiento real.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros checkpoints cuantizados de la misma categoria con los que establecer una comparacion. La unica referencia documentada es el modelo de origen sin cuantizar:

| Modelo | Parametros | Componentes | Formato y precision | Contexto | Licencia |
|---|---|---|---|---|---|
| Jundot/Qwen3.8-Flash-Next-oQ8e-mtp | 180.000 millones logicos, 6.000 millones activos | Backbone 125,744B, n-gram embedding 51,200B, vision encoder 0,449B, MTP head 2,607B | MLX safetensors, 8,660 bits/peso efectivos | no disponible | qwen-community-1.0 |
| Qwen/Qwen3.8-Flash-Next (modelo base) | 180.000 millones logicos, 6.000 millones activos | Los mismos componentes | Peso completo sin cuantizar (precision original no disponible) | no disponible | qwen-community-1.0 |

Alternativas de terceros: no disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna medicion publicada que cuantifique la perdida de calidad frente al modelo base en BF16. La media efectiva de 8,660 bits por peso sugiere una degradacion contenida, pero no verificada.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al ser una vista previa experimental, no se documentan evaluaciones de sesgo ni de seguridad.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado para este checkpoint. La cuantizacion de 8 bits puede agravar el problema en tareas de recuperacion precisa, especialmente si el reajuste de escala y sesgo no se valido con un conjunto de evaluacion publico.
- Longitud de contexto e idiomas: ambos campos aparecen como no disponibles. Esto impide garantizar el comportamiento en contextos largos o en castellano, y obliga a validar el modelo con datos propios antes de usarlo en produccion.
- Restricciones de licencia: se hereda la Qwen Community License 1.0 del modelo de origen, una licencia de tipo "other" y no una licencia open source estandar. Es imprescindible revisar el archivo LICENSE del repositorio para confirmar las condiciones de uso comercial y las obligaciones de atribucion.
- Dependencia de un unico runtime: el formato MLX limita el despliegue a hardware Apple Silicon y a la libreria MLX. No existe una ruta documentada hacia vLLM, llama.cpp, Ollama o TGI, lo que restringe la portabilidad y el escalado horizontal en infraestructura convencional.
- Inconsistencia documental en el modulo MTP: el texto de la model card lo describe como modulo de 4B, mientras que el desglose de almacenamiento le asigna 2,607B de pesos logicos y 2,770 GB. Conviene verificar este dato antes de dimensionar recursos.
- Naturaleza experimental: el modelo base es una vista previa de la arquitectura de Qwen4, no un modelo estable de produccion. Su comportamiento puede diferir del de versiones finales y no se garantiza su mantenimiento.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, actualizado el 11 de octubre de 2026. No hay evidencia de uso comunitario que permita contrastar su comportamiento en escenarios reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Licencia: archivo LICENSE dentro del repositorio de HuggingFace

Nota: las busquedas web realizadas no han devuelto ninguna fuente relevante sobre este modelo ni sobre su arquitectura; los resultados obtenidos pertenecen a un sitio sin relacion con el contenido tecnico solicitado y se han descartado.
