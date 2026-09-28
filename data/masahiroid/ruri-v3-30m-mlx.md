# masahiroid/ruri-v3-30m-mlx

## Resumen

`masahiroid/ruri-v3-30m-mlx` es una conversion no oficial al formato MLX de `cl-nagoya/ruri-v3-30m`, un modelo de embeddings de texto en japones desarrollado por el proyecto Ruri (Universidad de Nagoya / cl-nagoya). Se trata, por tanto, de un modelo encoder de 36.705.536 parametros basado en la arquitectura ModernBERT, orientado a tareas de similitud semantica y extraccion de caracteristicas (feature extraction), no a generacion de texto.

El problema que resuelve es practico: permite ejecutar el modelo original nativamente sobre Apple Silicon mediante el paquete `mlx-embeddings`, sin depender de PyTorch ni de sentence-transformers, lo que reduce el consumo de memoria y simplifica el despliegue en portatiles y equipos de sobremesa con chip M-series. Es relevante para desarrolladores que construyen pipelines de busqueda semantica o RAG sobre corpus en japones y quieren mantener todo el procesamiento en local.

La relevancia de esta ficha es limitada en terminos de novedad cientifica: no introduce arquitectura ni entrenamiento nuevos, sino que empaqueta pesos ya existentes en bfloat16 sin cuantizacion. El repositorio ocupa aproximadamente 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional) |
| Parametros totales | 36.705.536 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la arquitectura ModernBERT admite ventanas de hasta 8192 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en bfloat16 sin cuantizacion |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 36,7 millones de parametros. ModernBERT es una evolucion del transformer encoder clasico que incorpora alternancia de atencion local y global, rotary position embeddings (RoPE) y mejoras de eficiencia en el kernel de atencion. Al tratarse de un modelo de embeddings, su salida es un vector denso por secuencia (o por token, en modo feature extraction), no texto generado.

No se dispone de informacion sobre el proceso de entrenamiento en los materiales proporcionados: no se detalla el numero de tokens, la composicion del dataset, ni si hubo etapas de ajuste fino con objetivos contrastivos, RLHF o DPO. Tampoco se documentan innovaciones tecnicas introducidas por esta conversion, mas alla del cambio de framework (de PyTorch/sentence-transformers a MLX) manteniendo la precision en bfloat16. El autor indica explicitamente que se trata de una conversion comunitaria y no de un lanzamiento oficial del equipo cl-nagoya.

## Capacidades

- Generacion de embeddings de frases y documentos en japones para similitud semantica (cosine similarity).
- Extraccion de caracteristicas (feature extraction) a nivel de secuencia, utilizable como entrada de clasificadores o sistemas de ranking.
- Recuperacion semantica (retrieval) en corpus japoneses, con la convencion de prefijos `クエリ:` (consulta) y `文章:` (documento) que emplea el modelo original.
- Ejecucion nativa en Apple Silicon a traves de MLX, sin necesidad de PyTorch.
- No soporta generacion de texto: es un modelo exclusivamente de representacion.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta capacidad multilingue: el unico idioma declarado es el japones.
- No se documentan modos especiales (thinking mode, vision, audio) ni decodificacion especulativa.

## Casos de uso

- Busqueda semantica en japones: indexar un corpus de documentos nipones y recuperar los fragmentos mas relevantes ante una consulta en lenguaje natural. El modelo esta optimizado para este escenario y la convencion de prefijos `クエリ:`/`文章:` mejora la calidad del ranking.
- RAG sobre documentacion interna en japones: generar embeddings de los fragmentos de una base de conocimiento y alimentar un LLM generativo con el contexto recuperado. Al ser un modelo de 36,7 M de parametros, la fase de recuperacion es muy barata en computo.
- Deduplicacion y clustering de articulos o tickets: agrupar textos similares calculando distancias coseno entre embeddings, por ejemplo para consolidar incidencias repetidas en un sistema de soporte.
- Clasificacion de texto por similitud a prototipos: asignar categorias a mensajes de usuario comparando su embedding con el de descripciones de categoria predefinidas, sin necesidad de entrenar un clasificador especifico.
- Sistemas de recomendacion basados en contenido: representar titulos, descripciones o resenas en japones y recomendar items con vectores proximos al historial del usuario.
- Procesamiento local en portatiles Mac: al ser una conversion MLX, permite ejecutar todo el pipeline de embeddings en un MacBook sin enviar datos a servicios externos, lo que resulta util en contextos con requisitos de privacidad o de cumplimiento normativo.
- Moderacion y filtrado de contenido: comparar mensajes entrantes con una lista de patrones problematicos descritos en japones para priorizar revision humana.
- Evaluacion de calidad de traducciones o resumenes: medir la similitud semantica entre el texto generado y una referencia en japones como metrica automatica auxiliar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 73 MB para los pesos en bfloat16 (36,7 M de parametros x 2 bytes), calculado a partir del recuento de parametros. No se dispone de cifras oficiales de consumo pico ni de memoria del tokenizador.
- Cabe holgadamente en cualquier GPU de consumo: incluso una GTX 1650 de 4 GB o una RTX 3060 de 12 GB son sobredimensionadas para este modelo.
- El formato distribuido es MLX, por lo que el requisito real es un chip Apple Silicon (M1 o posterior) con memoria unificada; el modelo ocupa una fraccion minima incluso en configuraciones de 8 GB.
- Opciones de despliegue documentadas: el paquete `mlx-embeddings` (instalacion mediante `pip install -U mlx-embeddings`). No se documentan rutas de despliegue para vLLM, llama.cpp, Ollama o TGI, ya que el modelo base es un encoder y no un modelo generativo.
- Latencia y throughput estimados: no disponibles. No se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Framework | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ruri-v3-30m-mlx (este modelo) | 36,7 M | No disponible | MLX | Apache 2.0 | Conversion comunitaria en HuggingFace |
| cl-nagoya/ruri-v3-30m (modelo base) | 36,7 M | No disponible | PyTorch / sentence-transformers | Apache 2.0 | Repositorio oficial de cl-nagoya |
| Otras variantes de la familia ruri-v3 | No disponible | No disponible | PyTorch | Apache 2.0 | Repositorios de cl-nagoya |
| Modelos de embeddings multilingues ligeros (por ejemplo, familia multilingual-e5) | No disponible | No disponible | PyTorch / ONNX | No disponible | HuggingFace |

La comparativa con alternativas de fuera de la familia Ruri no puede completarse con datos verificados: no se dispone en la informacion proporcionada de cifras de parametros, contexto ni rendimiento de esos modelos. La diferencia principal de esta ficha frente al modelo base es el framework de ejecucion (MLX frente a PyTorch), manteniendo identico recuento de parametros y licencia.

## Limitaciones y advertencias

- Conversion no oficial: el autor indica expresamente que no es un lanzamiento del equipo Ruri / cl-nagoya. Para produccion se recomienda evaluar el modelo base oficial como referencia.
- Sesgos: no se documenta ninguna evaluacion de sesgos, y al estar entrenado unicamente con datos en japones puede presentar sesgos propios del dominio linguistico y cultural de ese corpus. Los detalles de composicion del dataset no estan disponibles.
- Alucinacion: al ser un modelo de embeddings, no genera texto y por tanto no alucina en el sentido habitual, pero si puede producir representaciones poco discriminativas en dominios alejados de su distribucion de entrenamiento, lo que degrada silenciosamente la calidad del retrieval.
- Monolingue: solo japones. No debe utilizarse para busqueda semantica en castellano ni en corpus mixtos sin una validacion previa especifica.
- Longitud de contexto: no confirmada en la informacion disponible; conviene verificar en el repositorio del modelo base antes de procesar documentos largos.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre conservando los avisos de copyright y licencia. No obstante, la licencia del modelo base y de los posibles datasets intermedios deberia verificarse en sus repositorios originales.
- Precision fija en bfloat16: no se ofrecen versiones cuantizadas, lo que limita la eleccion de compromisos precision/velocidad sin recurrir a conversiones propias.
- Madurez: el repositorio registra cero descargas y cero likes, sin historial de uso ni issues publicos. No hay garantia de mantenimiento.
- Busqueda web: los resultados devueltos por la busqueda corresponden a Spicetify y no guardan ninguna relacion con este modelo, por lo que no aportan informacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/ruri-v3-30m-mlx
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-30m
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- mlx-embeddings (paquete de ejecucion): https://github.com/Blaizzy/mlx-embeddings
