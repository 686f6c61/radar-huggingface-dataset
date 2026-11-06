# mradermacher/InternVL2_5-1B-GGUF

## Resumen

InternVL2_5-1B-GGUF es la version cuantizada en formato GGUF del modelo multimodal InternVL2.5-1B, desarrollado originalmente por OpenGVLab (Shanghai AI Laboratory) y convertido a GGUF por el usuario mradermacher. Se trata de un modelo vision-lenguaje (VLM) de pequeno tamano que combina un codificador visual con un modelo de lenguaje para procesar imagenes y texto de forma conjunta, orientado a tareas de comprension visual y generacion de texto condicionada por imagen.

El modelo base cuenta con aproximadamente 630 millones de parametros (629.697.920 segun safetensors), lo que lo situa en la gama ultraligera de los VLM. Esta orientado a despliegues con recursos limitados: inferencia en CPU, GPUs de consumo, entornos embebidos o pipelines donde el coste por inferencia es critico. La cuantizacion GGUF permite ejecutarlo con llama.cpp y herramientas compatibles, reduciendo el peso a entre 0,5 y 0,8 GB en la mayoria de variantes.

La relevancia actual de esta ficha radica en que ofrece una via practica para probar un modelo multimodal de la familia InternVL2.5 sin necesidad de infraestructura de datacenter. No obstante, al ser una cuantizacion de un modelo de 1B, sus capacidades de razonamiento y precision son limitadas en comparacion con sus hermanos mayores (8B, 26B, 78B) de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (InternVL2.5): codificador visual + LLM decoder (transformers, custom_code) |
| Parametros totales | 629.697.920 (~630M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | multilingue (segun model card; sin listado detallado) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

InternVL2.5 sigue la arquitectura caracteristica de la familia InternVL: un codificador visual tipo ViT (InternViT) que proyecta las caracteristicas de la imagen a un espacio compatible con el modelo de lenguaje, y un decoder LLM que genera la respuesta condicionada por los tokens visuales y textuales. El modelo base es OpenGVLab/InternVL2_5-1B, y esta version GGUF es una conversion estatica (quantize_version 2, convert_type hf) realizada por mradermacher, sin reentrenamiento adicional.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card del quantizador unicamente referencia el dataset HuggingFaceFV/finevideo como dato asociado y no aporta informacion sobre el proceso de entrenamiento del modelo original. Se recomienda consultar la model card de OpenGVLab/InternVL2_5-1B para obtener esos detalles.

## Capacidades

- Generacion de texto condicionada por imagen (image captioning, VQA).
- Comprension visual: descripcion de escenas, objetos y relaciones.
- Razonamiento multimodal basico sobre el contenido de una imagen.
- Soporte multilingue (segun etiqueta de la model card, sin listado de idiomas).
- Conversacion multi-turno con contexto visual y textual.
- Integracion con pipelines de transformers y con llama.cpp mediante el fichero mmproj para la parte visual.
- No se ha confirmado en la informacion disponible soporte de tool calling, function calling, modo thinking ni audio.

## Casos de uso

- Descripcion automatica de imagenes en catalogos: el modelo puede generar pies de foto y metadatos a partir de imagenes de producto, adecuado por su bajo coste de inferencia y su capacidad de ejecutarse en CPU.
- Moderacion de contenido visual asistida: clasificacion y descripcion de imagenes subidas por usuarios para revision humana posterior, aprovechando el bajo requisito de VRAM.
- Accesibilidad: generacion de descripciones de imagenes para lectores de pantalla en aplicaciones moviles o de escritorio, donde el modelo cabe en 0,5-0,8 GB.
- Preprocesado en pipelines de datos: etiquetado automatico de grandes volumenes de imagenes antes de entrenar otros modelos, ejecutando la cuantizacion Q4_K_M en lotes sobre GPU de consumo.
- Prototipado rapido de asistentes visuales: pruebas de concepto de chatbots que responden preguntas sobre imagenes en entornos de desarrollo sin GPU dedicada.
- Educacion y demos: ejemplos interactivos de VLM en cuadernos o aplicaciones locales con llama.cpp, donde el tamano reducido facilita la distribucion.
- Filtrado previo en sistemas de vision mayores: uso como primer filtro para descartar imagenes irrelevantes antes de pasarlas a un VLM de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del quantizador no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales (como MMMU o DocVQA) para esta version cuantizada. Para datos del modelo base, consultar la model card de OpenGVLab/InternVL2_5-1B.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,8 GB para las cuantizaciones Q2_K a Q8_0; alrededor de 1,4 GB para f16. Sumar ~0,4-0,7 GB adicionales para el fichero mmproj (parte visual).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1050 Ti, RTX 3050, RTX 4060, etc.), e incluso en iGPU y en CPU.
- Opciones de despliegue: llama.cpp (con soporte mmproj para multimodal), Ollama (si se importa el GGUF), y potencialmente otros runners compatibles con GGUF. Para transformers se usaria el modelo base en safetensors, no estos ficheros.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano, se espera baja latencia en GPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| InternVL2_5-1B-GGUF (este) | ~630M | no disponible | MIT | GGUF | Cuantizacion comunitaria de un VLM de 1B |
| OpenGVLab/InternVL2_5-1B | ~630M | no disponible | MIT | safetensors | Modelo base original, requiere transformers |
| InternVL2_5-2B | no disponible en esta ficha | no disponible | MIT | safetensors | Version superior de la misma familia |
| Qwen2-VL-2B | no disponible en esta ficha | no disponible | no disponible | safetensors/GGUF | Alternativa VLM de tamano similar |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo de 1B: capacidad de razonamiento y precision limitadas; propenso a errores en tareas complejas de VQA o texto largo.
- Riesgo de alucinacion: como todo LLM/VLM de pequeno tamano, puede inventar detalles no presentes en la imagen.
- La cuantizacion introduce perdida adicional de calidad respecto al modelo base; las variantes Q2_K y Q3_K son especialmente agresivas.
- No se dispone de informacion sobre sesgos especificos, pero al no documentarse la composicion del dataset de entrenamiento, no se pueden descartar sesgos culturales o de representacion.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base y de los pesos originales de OpenGVLab antes de desplegar en produccion.
- El contexto maximo no esta documentado en esta ficha; no asumir ventanas largas sin consultar la model card original.
- El soporte multilingue esta declarado pero no detallado; el rendimiento en castellano no esta verificado.
- Para uso multimodal con llama.cpp es imprescindible descargar tambien el fichero mmproj correspondiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/InternVL2_5-1B-GGUF
- Modelo base: https://huggingface.co/OpenGVLab/InternVL2_5-1B
- Variantes imatrix (weighted): https://huggingface.co/mradermacher/InternVL2_5-1B-i1-GGUF
- Pagina de overview del quantizador: https://hf.tst.eu/model#InternVL2_5-1B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
