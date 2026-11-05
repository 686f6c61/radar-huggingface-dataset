# mradermacher/Nanonets-OCR2-3B-fixed-GGUF

## Resumen

Nanonets-OCR2-3B-fixed-GGUF es la distribucion en formato GGUF del modelo Nanonets-OCR2-3B-fixed, publicada por el usuario mradermacher. Se trata de una cuantizacion estatica del modelo base axionlab/Nanonets-OCR2-3B-fixed, que a su vez deriva de la familia Nanonets-OCR2 orientada a tareas de reconocimiento optico de caracteres y extraccion estructurada de documentos. El modelo base cuenta con 3.085.938.688 parametros (aproximadamente 3,09 mil millones), lo que lo situa en el rango de modelos pequenos optimizados para despliegue en hardware modesto.

La relevancia de esta publicacion radica en que facilita el uso del modelo en entornos sin GPU de gran capacidad, mediante cuantizaciones que van desde Q2_K (1,4 GB) hasta f16 (6,3 GB), ademas de archivos multimodales mmproj necesarios para procesar imagenes. El repositorio ocupa 30,1 GB en total e incluye tanto las cuantizaciones estaticas como los suplementos multimodales. La model card no documenta detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks.

Cabe senalar que la informacion disponible es limitada: la model card del repositorio GGUF se centra exclusivamente en aspectos de cuantizacion y no aporta especificaciones tecnicas del modelo subyacente. Los datos que se presentan a continuacion proceden de los metadatos del repositorio y de la model card, y cualquier aspecto no documentado se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con soporte de vision, segun la presencia de archivos mmproj) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. La presencia de archivos mmproj (multi-modal supplement) en el repositorio GGUF indica que el modelo incorpora un codificador visual para procesar imagenes, algo coherente con su orientacion a tareas de OCR y extraccion documental. El numero de parametros (3,09 B) sugiere un transformer de escala pequena, pero no se confirma el tipo de atencion, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

Respecto al proceso de cuantizacion, mradermacher indica que se trata de cuantizaciones estaticas generadas con quantize_version 2 y output_tensor_quantised 1, con conversion de tipo hf. El autor senala que las cuantizaciones ponderadas con imatrix estan disponibles en un repositorio separado (Nanonets-OCR2-3B-fixed-i1-GGUF). No se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos, segun la orientacion del modelo base.
- Procesamiento multimodal: los archivos mmproj permiten el tratamiento de entradas visuales junto con texto.
- Generacion de texto a partir de contenido extraido de imagenes.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Capacidades especiales (modo thinking, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de facturas y recibos: el modelo puede procesar imagenes de documentos financieros y extraer texto estructurado, aprovechando su componente visual y su tamano reducido para ejecutarse en servidores modestos.
- Extraccion de datos de formularios escaneados: util para pipelines de ingestion documental donde se necesita convertir formularios en texto legible por maquina con un modelo de 3 B de parametros.
- Procesamiento de documentos en lotes sobre CPU: gracias a las cuantizaciones Q4_K_S y Q4_K_M (1,9-2,0 GB), es viable ejecutar OCR por lotes en maquinas sin GPU dedicada mediante llama.cpp.
- Archivado y busqueda documental: integrado en un sistema de gestion documental, el modelo puede convertir imagenes de archivo en texto indexable, facilitando la busqueda posterior.
- Digitalizacion de documentos historicos o impresos: el modelo puede emplearse para transcribir material escaneado en ingles, aunque la calidad dependera del estado del documento original.
- Prototipado rapido de aplicaciones OCR: al ser una cuantizacion ligera y compatible con endpoints, permite validar flujos de extraccion documental antes de invertir en modelos mayores.
- Despliegue en entornos con recursos limitados: con la cuantizacion Q2_K (1,4 GB) puede ejecutarse en dispositivos con poca memoria, aunque con menor calidad de reconocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB con Q2_K, 1,9-2,0 GB con Q4_K_S/Q4_K_M, 2,6 GB con Q6_K y 3,4 GB con Q8_0. Los archivos mmproj anaden 0,9 GB (Q8_0) o 1,4 GB (f16) adicionales para el procesamiento visual.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores con las cuantizaciones Q4 y Q5.
- Compatibilidad con GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas de VRAM para las cuantizaciones Q4/Q5 junto con el mmproj.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; el modelo base es compatible con transformers. La etiqueta endpoints_compatible sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no especifica la licencia, por lo que no se puede confirmar si el uso comercial esta permitido; es necesario consultar el repositorio del modelo base (axionlab/Nanonets-OCR2-3B-fixed) antes de usarlo en produccion.
- El modelo esta documentado unicamente para ingles, lo que limita su uso con documentos en castellano u otros idiomas.
- No se documentan sesgos conocidos ni tasas de alucinacion; al tratarse de un modelo de OCR, existe riesgo de transcripcion incorrecta en documentos de baja calidad o con tipografias complejas.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la precision del reconocimiento; el autor recomienda Q4_K_S o Q4_K_M como equilibrio entre velocidad y calidad.
- No se dispone de informacion sobre la longitud de contexto, lo que impide evaluar su idoneidad para documentos extensos o conversaciones multi-turno.
- El repositorio es una cuantizacion de terceros (mradermacher), no una publicacion oficial del autor original; los resultados pueden diferir del modelo base en safetensors.
- El modelo base incluye el sufijo "fixed", lo que sugiere correcciones sobre una version anterior, pero no se detalla que se corrigio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Nanonets-OCR2-3B-fixed-GGUF
- Modelo base: https://huggingface.co/axionlab/Nanonets-OCR2-3B-fixed
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Nanonets-OCR2-3B-fixed-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Nanonets-OCR2-3B-fixed-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
