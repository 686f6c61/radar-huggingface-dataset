# mradermacher/ZoomEarth-3B-GGUF

## Resumen

ZoomEarth-3B-GGUF es la distribucion en formato GGUF del modelo ZoomEarth-3B, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de modelos para su uso con llama.cpp y otras herramientas compatibles. El modelo original lo desarrolla HappyBug y cuenta con 3.085.938.688 parametros (aproximadamente 3,09 mil millones), lo que lo situa en la categoria de modelos pequenos optimizados para inferencia en hardware de consumo.

El repositorio incluye un conjunto de cuantizaciones estaticas (desde Q2_K hasta f16) generadas mediante el proceso habitual de mradermacher, ademas de ficheros mmproj que indican soporte multimodal (vision). La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que resulta relevante para integraciones en productos.

La relevancia de esta ficha radica en que facilita el despliegue local de un modelo multimodal de 3B en GPUs de consumo y CPUs, algo practico para prototipado rapido, aplicaciones en el borde y entornos con requisitos de privacidad. No obstante, la informacion publica sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers, segun tags; probablemente decoder-only) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (original en safetensors via transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original HappyBug/ZoomEarth-3B en la informacion proporcionada. Los tags del repositorio indican compatibilidad con la libreria transformers y el pipeline conversacional, lo que sugiere una arquitectura transformer decoder-only orientada a dialogo. La presencia de ficheros mmproj (multi-modal projection) en el repositorio GGUF confirma que el modelo incorpora capacidad de vision, probablemente mediante un proyector que conecta un codificador visual con el modelo de lenguaje.

No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica informacion disponible sobre el proceso de generacion de estos pesos es la propia de mradermacher: cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) sin quants ponderados/imatrix en el momento de la publicacion. El autor indica que los quants con imatrix podrian no estar disponibles y que se pueden solicitar mediante una discusion en la comunidad.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` y el pipeline declarado.
- Procesamiento multimodal de imagenes: la presencia de ficheros `mmproj` (Q8_0 y f16) indica soporte de entrada visual, tipicamente para tareas de descripcion de imagenes o VQA.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo puede ejecutarse en formato GGUF Q4_K_M (~2 GB) en portatiles con GPU integrada o CPU, lo que permite iterar sobre prompts y flujos conversacionales sin depender de APIs externas.
- Descripcion de imagenes en el borde: gracias a los ficheros mmproj, puede integrarse en aplicaciones de escritorio o moviles que necesiten generar texto a partir de capturas o fotografias, manteniendo los datos en el dispositivo.
- Asistentes de accesibilidad: un modelo de 3B con vision puede describir el entorno a partir de la camara en tiempo real, con latencias bajas en hardware modesto.
- Clasificacion y etiquetado de contenido visual: uso del modelo como componente en pipelines de moderacion o indexacion de imagenes donde se requiera una etiqueta textual breve.
- Educacion y demostraciones: su tamano reducido lo hace adecuado para talleres y cursos donde se ensena a desplegar modelos con llama.cpp u Ollama sin requerir GPUs de datacenter.
- Pruebas de concepto de agentes multimodales: combinado con un orquestador externo, puede servir para validar arquitecturas de agentes que reciben imagenes y texto antes de migrar a modelos mayores.
- Entornos con requisitos de privacidad: al ejecutarse completamente en local, es apto para procesar documentos escaneados o imagenes sensibles sin enviarlas a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,4 GB
  - Q4_K_M: ~2,0 GB
  - Q5_K_M: ~2,3 GB
  - Q8_0: ~3,4 GB
  - f16: ~6,3 GB
  - Proyector multimodal adicional: ~0,9 GB (mmproj-Q8_0) o ~1,4 GB (mmproj-f16)
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M con contexto moderado (GTX 1650, RTX 3050, RTX 4060, etc.). Para f16 se recomienda 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070).
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada de los ultimos anos; tambien puede ejecutarse en CPU con llama.cpp a velocidades aceptables para uso interactivo.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para el modelo original en safetensors, transformers con aceleracion CUDA.
- Latencia y throughput estimados: no disponibles. Dependeran del hardware, la cuantizacion y la longitud de contexto; en una RTX 4060 con Q4_K_M se espera un throughput del orden de decenas de tokens por segundo, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| ZoomEarth-3B (este) | ~3,09B | no disponible | si (mmproj) | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-VL-3B | ~3,75B | 32K (segun documentacion publica de Qwen) | si | Apache 2.0 | safetensors, GGUF (comunitario) |
| Phi-3.5-vision | ~4,2B | 128K (segun documentacion de Microsoft) | si | MIT | safetensors |
| Llama-3.2-3B | ~3,2B | 128K (segun documentacion de Meta) | no (version base) | Llama 3.2 Community License | safetensors, GGUF |

Nota: los datos de los modelos comparativos provienen de documentacion publica general y deben verificarse en sus respectivas fichas. Para ZoomEarth-3B no hay benchmarks publicados que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Informacion muy escasa: no se han publicado detalles sobre arquitectura, datos de entrenamiento ni evaluaciones, lo que dificulta estimar su calidad real frente a alternativas.
- Riesgo de alucinacion: al ser un modelo de 3B sin benchmarks publicados, la fiabilidad factual no esta verificada; no se recomienda para tareas de alta precision sin validacion humana.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Contexto: se desconoce la longitud de contexto soportada; conviene probarla empiricamente antes de disenar flujos con ventanas largas.
- Capacidad multimodal: la presencia de mmproj confirma soporte visual, pero se desconoce la resolucion de imagen soportada y la calidad del alineamiento vision-lenguaje.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la ficha del modelo base (HappyBug/ZoomEarth-3B) por si hubiera terminos adicionales no reflejados en este repositorio.
- Cuantizaciones: los quants Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Repositorio de 30,1 GB: descargar el repositorio completo consume mucho espacio; conviene descargar solo el fichero GGUF necesario.
- Sin garantias de mantenimiento: el autor de la cuantizacion no se compromete a publicar quants imatrix ni actualizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ZoomEarth-3B-GGUF
- Modelo base: https://huggingface.co/HappyBug/ZoomEarth-3B
- Pagina de descargas del autor: https://hf.tst.eu/model#ZoomEarth-3B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
