# mradermacher/Fermicode-1B-GGUF

## Resumen

Fermicode-1B-GGUF es la versión cuantizada en formato GGUF del modelo Fermicode-1B, desarrollado originalmente por pranavupadhyaya52 y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje de 1.235.814.432 parámetros (aproximadamente 1,2 mil millones) orientado a tareas de generación de texto en inglés. La versión GGUF facilita su despliegue en entornos con recursos limitados mediante llama.cpp, Ollama y otras herramientas compatibles con este formato.

El modelo base Fermicode-1B es un transformer de tipo decoder-only de tamaño compacto, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia en CPU y GPU de consumo. La cuantización a GGUF permite reducir el peso del modelo desde 2,6 GB en f16 hasta 0,7 GB en Q2_K, lo que amplía enormemente las opciones de despliegue.

La relevancia de esta ficha radica en que documenta una conversión de cuantización de un modelo de nicho con escasa información pública. No se dispone de datos sobre el proceso de entrenamiento, benchmarks o licencia del modelo base, por lo que la ficha se limita a los datos verificables del repositorio y de la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferido del formato transformers; no confirmado en la informacion disponible) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Fermicode-1B. Por el nombre y el formato de publicacion (transformers, safetensors) se trata presumiblemente de un transformer decoder-only, pero no se confirma en la informacion proporcionada. Tampoco se conocen el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones.

La unica informacion tecnica verificable procede del proceso de cuantizacion realizado por mradermacher: se generaron cuantizaciones estaticas (no ponderadas por imatrix) en 12 variantes, desde Q2_K hasta f16. El autor indica que las cuantizaciones ponderadas por imatrix no estan disponibles en el momento de la publicacion y que podrian solicitarse mediante una discusion comunitaria. El proceso de conversion se realizo con convert_type hf y quantize_version 2, segun los metadatos de la model card.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente para el idioma ingles.
- No se dispone de informacion sobre capacidades de razonamiento, codigo o matematicas.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma soporte multilingue mas alla del ingles.
- No se confirma capacidad de vision, audio ni modo de pensamiento (thinking mode).
- El formato GGUF permite su uso con llama.cpp, Ollama y otros runners compatibles, lo que facilita la integracion en aplicaciones locales.

## Casos de uso

- Prototipado local en equipos de desarrollo: al pesar entre 0,7 y 1,4 GB en cuantizaciones habituales, el modelo puede cargarse en un portatil con llama.cpp u Ollama para experimentar con generacion de texto sin depender de la nube.
- Generacion de texto en dispositivos con recursos limitados: las variantes Q4_K_S y Q4_K_M (0,9 GB) permiten ejecutar el modelo en CPU con memoria RAM modesta, adecuado para entornos embebidos o servidores de gama baja.
- Filtrado y clasificacion de texto en ingles: un modelo de 1,2B puede emplearse para tareas de etiquetado, resumen corto o extraccion de informacion en pipelines de procesamiento por lotes donde el coste por token es critico.
- Educacion e investigacion: util como modelo de referencia para estudiar el efecto de la cuantizacion en modelos pequenos, comparando la perplejidad entre las distintas variantes GGUF publicadas.
- Pruebas de integracion con herramientas GGUF: sirve para validar pipelines de despliegue con llama.cpp, Ollama o servidores compatibles con la API de OpenAI (el tag endpoints_compatible sugiere compatibilidad con endpoints).
- Generacion de texto offline en aplicaciones de escritorio: al no requerir GPU dedicada en cuantizaciones bajas, puede integrarse en aplicaciones de escritorio que necesiten generacion de texto sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K ~0,7 GB; Q3_K_S ~0,7 GB; Q3_K_M ~0,8 GB; Q3_K_L ~0,8 GB; IQ4_XS ~0,8 GB; Q4_K_S ~0,9 GB; Q4_K_M ~0,9 GB; Q5_K_S ~1,0 GB; Q5_K_M ~1,0 GB; Q6_K ~1,1 GB; Q8_0 ~1,4 GB; f16 ~2,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede alojar las cuantizaciones mas bajas; una RTX 3060 o superior permite ejecutar f16 con holgura. No se dispone de datos especificos de rendimiento en A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (GTX 1050 Ti en adelante para cuantizaciones bajas; RTX 3060 o superior para f16).
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la informacion proporcionada. El modelo base Fermicode-1B no cuenta con datos publicos de rendimiento que permitan una comparacion rigurosa con alternativas de tamano similar (por ejemplo, modelos de 1B a 1,5B parametros). Se indica "no disponible" para evitar especulaciones.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al no documentarse el dataset de entrenamiento, no puede evaluarse el sesgo del modelo.
- Riesgo de alucinacion: probable en un modelo de 1,2B sin datos publicos de evaluacion; se recomienda validacion humana en produccion.
- Limitaciones de contexto e idioma: el modelo esta etiquetado solo para ingles y se desconoce la longitud de contexto soportada.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor del modelo base antes de un despliegue comercial.
- Caveat de produccion: las cuantizaciones Q2_K y Q3 pueden degradar notablemente la calidad; el autor recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q8_0 como mejor calidad. Las cuantizaciones ponderadas por imatrix no estan disponibles, lo que puede suponer una perdida de calidad frente a alternativas ponderadas.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Fermicode-1B-GGUF
- Modelo base: https://huggingface.co/pranavupadhyaya52/Fermicode-1B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Fermicode-1B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
