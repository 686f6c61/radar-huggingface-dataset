# mradermacher/Lin-1.1-Epsilon-i1-GGUF

## Resumen

Lin-1.1-Epsilon-i1-GGUF es una coleccion de cuantizaciones GGUF del modelo LindotAI/Lin-1.1-Epsilon, generadas por mradermacher usando calibracion imatrix (weighted/imatrix quants). El modelo base es un transformer de aproximadamente 494 millones de parametros (494.032.768 segun los safetensors del repo), orientado a tareas de codigo con enfasis declarado en Rust y etiquetado con el tag "lindot". La licencia es Apache 2.0 tanto para el modelo base como para estas cuantizaciones.

El repositorio no contiene los pesos originales en safetensors, sino exclusivamente ficheros GGUF en multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K) mas el fichero imatrix empleado para generarlos. El tamano total del repo es de 8,6 GB, repartido entre las distintas variantes. La model card del cuantizador no aporta informacion sobre arquitectura interna, contexto, composicion del dataset de entrenamiento ni resultados de evaluacion; esa informacion corresponderia al modelo base LindotAI/Lin-1.1-Epsilon, que no se detalla en la documentacion proporcionada.

Por su tamano (menos de 500 millones de parametros) y su rango de cuantizaciones (ficheros de 0,4 a 0,6 GB), esta pensado para inferencia en CPU y en GPUs de consumo muy modesto, lo que lo situa en la categoria de modelos pequenos especializados en codigo, no en la de asistentes generalistas de gran escala. Es relevante para quien necesite un modelo de codigo ligero, desplegable en local, con licencia permisiva y empaquetado listo para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible en la informacion proporcionada) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_XS, i1-Q2_K, i1-IQ3_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (no se distribuyen safetensors en este repo) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LindotAI/Lin-1.1-Epsilon mas alla de que se trata de un transformer con 494.032.768 parametros y biblioteca transformers. No se especifican numero de capas, dimensiones de atencion, tipo de atencion, ni si emplea tecnicas como atencion lineal o decodificacion especulativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO.

Lo que si esta documentado es el proceso de cuantizacion: mradermacher ha generado las variantes GGUF con calibracion imatrix (quants "weighted/imatrix"), lo que tipicamente mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas equivalentes. El repo incluye el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones, y se referencia un conjunto paralelo de cuants estaticos en mradermacher/Lin-1.1-Epsilon-GGUF. Los tags del modelo base apuntan a codigo y a Rust como dominios de interes, lo que sugiere un ajuste fino orientado a generacion de codigo en ese lenguaje.

## Capacidades

- Generacion de codigo, con enfasis declarado en Rust segun los tags del modelo.
- Conversacion multi-turno (tag "conversational" en el repo).
- Generacion de texto general en ingles.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: solo ingles declarado; otros idiomas no disponibles.

## Casos de uso

- Autocompletado de codigo Rust en el editor: al ser un modelo de menos de 500 millones de parametros y con cuantizaciones de 0,4-0,6 GB, puede ejecutarse en local con llama.cpp y responder con latencia baja en tareas de completado linea a linea o de bloque.
- Asistente de refactorizacion en proyectos Rust: integrado en un plugin de IDE o en un CLI, el modelo puede proponer reescrituras de funciones y correcciones de estilo en un lenguaje concreto, aprovechando el ajuste declarado al dominio.
- Generacion de tests unitarios: para funciones y modulos existentes, el modelo puede producir esqueletos de tests y casos de prueba, adecuado por su tamano para ejecutarse dentro de un pipeline de CI sin GPU dedicada.
- Documentacion de codigo: generacion de docstrings y comentarios a partir de fragmentos de codigo, tarea de bajo coste computacional que encaja con un modelo pequeno y especializado.
- Despliegue en entornos con hardware limitado: al caber en cuantizaciones de 0,4 GB, puede correr en portatiles sin GPU, Raspberry Pi de gama alta o contenedores con poca memoria, lo que lo hace util para herramientas de desarrollo offline.
- Filtrado y clasificacion de fragmentos de codigo: uso como modelo auxiliar para etiquetar o triagear parches y snippets en Rust dentro de un pipeline mayor, donde un modelo ligero reduce coste frente a uno de gran escala.
- Prototipado rapido de asistentes de codigo: servir el GGUF con llama.cpp u Ollama para validar una idea de producto antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre aproximadamente 0,4 GB (IQ1_S/IQ2) y 0,6 GB (Q6_K) solo para los pesos; anades overhead de contexto y de runtime.
- Cabe en cualquier GPU de consumo con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), y en GPUs integradas con memoria compartida suficiente.
- Inferencia en CPU viable: los ficheros de 0,4-0,6 GB permiten ejecucion en CPU con llama.cpp, incluso en equipos modestos.
- GPU recomendadas: no se requieren GPU de datacenter (A100, H100); el modelo esta sobredimensionado para ese hardware y no aporta ventaja usarlo alli.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; la biblioteca declarada en el repo es transformers, pero los pesos distribuidos son GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lin-1.1-Epsilon (esta ficha) | 494 M | No disponible | Apache 2.0 | GGUF (cuantizado) | Especializado en codigo/Rust, cuants imatrix |
| Modelo base LindotAI/Lin-1.1-Epsilon | 494 M | No disponible | Apache 2.0 | safetensors (presumiblemente) | Origen de estas cuantizaciones |
| Alternativas de codigo de tamano similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al entrenarse presumiblemente con datos de codigo en ingles, puede heredar sesgos de ese corpus.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; en codigo puede manifestarse como APIs inexistentes, firmas incorrectas o dependencias inventadas, especialmente en cuantizaciones de muy baja precision (IQ1, IQ2, Q2_K_S) que el propio autor marca como "for the desperate", "very low quality" o "lower quality".
- Limitaciones de contexto e idioma: solo ingles declarado; la longitud de contexto no esta documentada, por lo que no debe asumirse una ventana amplia.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base LindotAI/Lin-1.1-Epsilon, asi como las de los datos de entrenamiento, antes de desplegarlo en produccion.
- Caveat de produccion: este repo contiene unicamente cuantizaciones GGUF; para reproducir o reentrenar hace falta el modelo base. Las cuantizaciones de 1-3 bits degradan notablemente la calidad y no deberian usarse en produccion sin evaluacion previa.
- El modelo, con menos de 500 millones de parametros, tiene capacidad limitada para razonamiento complejo, contextos largos y tareas generalistas; su uso previsto es codigo y conversacion en ingles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Lin-1.1-Epsilon-i1-GGUF
- Modelo base: https://huggingface.co/LindotAI/Lin-1.1-Epsilon
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Lin-1.1-Epsilon-GGUF
- Pagina de descarga del cuantizador: https://hf.tst.eu/model#Lin-1.1-Epsilon-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
