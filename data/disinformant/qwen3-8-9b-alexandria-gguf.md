# disinformant/Qwen3.8-9B-Alexandria-GGUF

## Resumen

Qwen3.8-9B-Alexandria-GGUF es una cuantizacion en formato GGUF del modelo Qwen3.8-9B-Alexandria, publicada por el usuario `disinformant` bajo el paraguas del proyecto Open Science Library / Tenebras. Se trata de un ajuste de continuacion de preentrenamiento (CPT) sobre texto de la Open Science Library (OSL), una porcion con derechos aclarados derivada de HathiTrust, orientada a construir un asistente local y offline sobre literatura cientifica y de ingenieria de mediados del siglo XX. El modelo parte de `petruhonk/Qwen3.8-9B-Distill-uncensored-heretic`, que a su vez deriva de `empero-ai/Qwen3.8-9B-Distill` y de `Qwen/Qwen3.5-9B`.

Con 9.197.093.888 parametros totales (dato de safetensors), el repositorio distribuye dos ficheros: el peso cuantizado IQ4_XS (~5,0 GB) y un proyector de vision `mmproj` en f16. Aunque la pipeline declarada es `image-text-to-text`, la propia model card advierte de que las imagenes, laminas y tablas no forman parte del entrenamiento: la ruta de vision es una herencia del modelo base y no ha sido ajustada con material grafico de la OSL. El valor practico del modelo esta, por tanto, en el texto combinado con un sistema de RAG sobre los paquetes de la OSL, no en sus capacidades multimodales.

La relevancia actual es acotada pero especifica: es un ejemplo de modelo de dominio construido sobre un corpus con trazabilidad de derechos, empaquetado para inferencia local con llama.cpp y publicado con receta de entrenamiento abierta (dataset `disinformant/alexandria-osl-train`). Con cero descargas y cero likes en el momento de la consulta, y con una fecha de publicacion de septiembre de 2026, se trata de una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con ruta de vision heredada del modelo base (proyector `mmproj`); detalles internos especificos no disponibles |
| Parametros totales | 9.197.093.888 (dato real de safetensors) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (pesos del modelo); f16 (proyector de vision `mmproj`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Qwen3.8-9b-Alexandria-IQ4_XS.gguf`, `mmproj-Qwen3.8-9b-Alexandria-f16.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la cadena de herencia: `Qwen/Qwen3.5-9B` → `empero-ai/Qwen3.8-9B-Distill` → `petruhonk/Qwen3.8-9B-Distill-uncensored-heretic` → `Qwen3.8-9B-Alexandria`. Se trata de una familia tipo Qwen3 con licencia Apache-2.0 y pipeline multimodal (`image-text-to-text`), con un proyector de vision separado en formato f16. No se especifican numero de capas, dimension oculta, tipo de atencion ni si incorpora mecanismos de decodificacion especulativa.

El ajuste propio consiste en un CPT sobre texto de la Open Science Library. La model card indica que el dataset publico `disinformant/alexandria-osl-train` contiene "OSL/Hathi+BlendNet CPT text + Hermes FC v28 + mix recipe", lo que sugiere una mezcla de texto de CPT y datos de function calling en formato Hermes v28. La cobertura declarada es explicita y limitada: el texto completo de las paginas de la OSL esta en el alcance del entrenamiento; las imagenes, laminas y recortes esquematicos estan "untrained" (solo herencia del proyector base); y las tablas no fueron entrenadas como estructura, de modo que el modelo no fue entrenado para leer ni verificar matematicamente imagenes de tablas. No se mencionan fases de RLHF o DPO, ni el numero de tokens de entrenamiento.

## Capacidades

- Generacion de texto en ingles sobre contenido cientifico y de ingenieria de mediados del siglo XX, apoyada en RAG sobre los paquetes de texto de la OSL.
- Conversacion multiturno (etiqueta `conversational` en el repositorio).
- Soporte de function calling, inferido de la inclusion del formato Hermes FC v28 en la receta de entrenamiento.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- Ruta de vision presente a nivel de arquitectura mediante `mmproj` en f16, pero explicitamente no entrenada con material grafico de la OSL: no debe asumirse competencia en lectura de figuras, laminas o tablas escaneadas.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- No se documentan modos especiales como thinking mode, audio ni vision entrenada.

## Casos de uso

- Asistente local de consulta bibliografica: desplegado con llama.cpp sobre el indice de texto de la OSL, el modelo responde preguntas sobre el corpus de ciencia e ingenieria cargado, combinando generacion con recuperacion de pasajes. Es adecuado porque el CPT se hizo precisamente sobre ese texto.
- Procesamiento por lotes offline en equipos sin conectividad: al ser un GGUF de ~5,0 GB, puede ejecutarse en un portatil o en una maquina de laboratorio aislada, sin dependencia de APIs externas.
- Normalizacion y resumen de texto OCR de volumenes cientificos: el modelo puede reescribir pasajes con ruido de digitalizacion en texto coherente antes de indexarlos, aprovechando su ajuste sobre prosa de la OSL.
- Construccion de pipelines RAG sobre colecciones con derechos aclarados: sirve como generador final en un sistema donde el indice Markdown/DocTags y los metadatos de derechos los aporta el paquete AI/RAG de la OSL.
- Extraccion de entidades y metadatos de fichas bibliograficas: nombres de autores, titulos de articulos, anos y terminos tecnicos, para enriquecer catalogos de una biblioteca digital.
- Agente conversacional con tool calling para busquedas en catalogo: gracias al entrenamiento con Hermes FC v28, puede emitir llamadas a funciones que consulten un indice externo o una base de datos de volumenes.
- Generacion de resumenes divulgativos a partir de literatura tecnica antigua, por ejemplo para notas docentes o materiales de archivo.
- Prototipado de asistentes especializados en dominios cientificos concretos mediante ajuste adicional sobre los mismos datos publicados en `disinformant/alexandria-osl-train`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB con la cuantizacion IQ4_XS, partiendo de un fichero de pesos de ~5,0 GB y sumando cache KV y el proyector de vision en f16 (estimacion derivada del tamano del repositorio, no un dato publicado).
- GPU recomendadas: no disponibles en la documentacion del autor. Por tamano de pesos, una GPU consumer de 8 GB o mas seria suficiente en teoria; cualquier GPU profesional (A100, H100, L40S) ejecutaria el modelo con holgura.
- Compatibilidad con GPU consumer: si, previsiblemente en tarjetas con 8 GB o mas de VRAM en IQ4_XS, y en CPU con RAM suficiente mediante llama.cpp.
- Opciones de despliegue: llama.cpp y llama-cpp-python (formato nativo), servidor `llama-server`, LM Studio, y cualquier runtime que acepte GGUF e importe Ollama. La ruta de vision requiere cargar el fichero `mmproj` en f16 por separado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| disinformant/Qwen3.8-9B-Alexandria-GGUF | 9.197.093.888 | no disponible | Apache-2.0 | GGUF en HuggingFace, 0 descargas | CPT sobre texto de la OSL, imagenes y tablas no entrenadas |
| petruhonk/Qwen3.8-9B-Distill-uncensored-heretic | no disponible en la informacion proporcionada | no disponible | Apache-2.0 | Modelo base del anterior | Version sin censura declarada por el autor |
| empero-ai/Qwen3.8-9B-Distill | no disponible en la informacion proporcionada | no disponible | no disponible | Segundo nivel de la cadena de herencia | Distilacion intermedia |
| Qwen/Qwen3.5-9B | no disponible en la informacion proporcionada | no disponible | no disponible | Origen de la cadena | Modelo base de la familia Qwen referenciado |

No se dispone de datos de contexto, benchmarks ni licencias de los modelos intermedios en la informacion proporcionada, por lo que la comparativa se limita a la relacion de herencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de un ajuste declarado como "uncensored", cabe esperar un filtrado de seguridad reducido y una mayor probabilidad de generar contenido inapropiado o no alineado.
- Riesgo de alucinacion: relevante especialmente fuera del corpus de la OSL. El autor insiste en emparejar el modelo con RAG de texto de la OSL, lo que implica que sin recuperacion externa la fiabilidad factual sobre el dominio no esta garantizada.
- Cobertura multimodal enganosa: la etiqueta `image-text-to-text` puede inducir a error. El modelo no fue entrenado con imagenes, laminas ni tablas de la OSL; el proyector de vision es herencia del modelo base.
- Limitacion idiomatica: solo ingles declarado. No hay soporte documentado de castellano ni de otros idiomas.
- Longitud de contexto desconocida: no se publica el tamano de ventana, lo que dificulta dimensionar pipelines RAG con documentos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero cada eslabon de la cadena de herencia deberia verificarse de forma independiente; la model card solo declara la licencia del eslabon inmediatamente anterior.
- Trazabilidad de datos: el CPT usa material de la OSL con derechos aclarados por edicion; el uso del modelo sobre textos de HathiTrust no aclarados no esta cubierto por el proyecto, y HathiTrust se describe como "finding list", no como fuente de entrenamiento.
- Madurez: cero descargas y cero likes en el momento de la consulta; sin resultados de benchmarks publicados. No es un modelo validado para produccion.
- Nomenclatura no verificada: la cadena `Qwen3.5-9B` / `Qwen3.8-9B` no aparece respaldada por ninguna fuente oficial en los resultados de busqueda proporcionados, por lo que conviene confirmar el linaje real antes de integrarlo.
- El autor declara que el modelo es un subconjunto mas de un subconjunto, y advierte explicitamente de que no es un producto oficial de HathiTrust.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/disinformant/Qwen3.8-9B-Alexandria-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/disinformant/alexandria-osl-train
- Modelo base inmediato: https://huggingface.co/petruhonk/Qwen3.8-9B-Distill-uncensored-heretic
- Modelo intermedio de la cadena: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Modelo de origen: https://huggingface.co/Qwen/Qwen3.5-9B
- HathiTrust: https://www.hathitrust.org/
- Perfil del autor: https://huggingface.co/disinformant

Nota: los resultados de busqueda web proporcionados no contienen ningun enlace relacionado con este modelo, con Qwen ni con Open Science Library; todos los resultados eran articulos de prensa de consumo y foros sobre Amazon, por lo que no se han podido incorporar fuentes adicionales.
