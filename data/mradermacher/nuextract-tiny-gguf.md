# mradermacher/NuExtract-tiny-GGUF

## Resumen

NuExtract-tiny-GGUF es la versión cuantizada en formato GGUF del modelo NuExtract-tiny, desarrollado originalmente por NuMind (numind) y convertido a GGUF por mradermacher. NuExtract es una familia de modelos especializados en extracción de información estructurada a partir de texto libre: dado un documento y una plantilla JSON, el modelo devuelve un objeto JSON con los campos solicitados. La variante "tiny" es la más pequeña de la familia, con aproximadamente 464 millones de parámetros, lo que la hace apta para despliegue en CPU y hardware de consumo.

Este repositorio concreto no aporta pesos nuevos: ofrece los mismos pesos del modelo base en múltiples niveles de cuantización (desde Q2_K hasta f16), pensados para su uso con llama.cpp y herramientas compatibles como Ollama o LM Studio. Es relevante para desarrolladores que necesitan ejecutar extracción estructurada en local, sin GPU dedicada, con un consumo de disco de entre 0,3 GB y 1 GB según la cuantización.

La ficha se centra en las características verificables del repositorio y del modelo base. Los datos de arquitectura interna, contexto máximo o composición del dataset de entrenamiento no están disponibles en la información proporcionada y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base numind/NuExtract-tiny; familia de extraccion estructurada) |
| Parametros totales | 463.987.712 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base (numind/NuExtract-tiny) en los datos proporcionados. Por el nombre y el proposito del modelo, se trata de un transformer especializado en extraccion de informacion estructurada, pero no se confirman detalles como el numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea alguna tecnica particular (por ejemplo, plantillas de extraccion o decodificacion restringida a JSON).

Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El repositorio de mradermacher es unicamente una conversion a GGUF del modelo original: no incluye reentrenamiento ni ajuste fino. Las cuantizaciones son estaticas (no se ofrecen cuantizaciones ponderadas/imatrix en el momento de la publicacion, segun la model card).

## Capacidades

- Extraccion de informacion estructurada: dado un texto y una plantilla JSON, devuelve un objeto JSON con los campos solicitados.
- Generacion de texto conversacional (el repositorio esta etiquetado como "conversational").
- Procesamiento de documentos en ingles (unico idioma declarado).
- Ejecucion local en CPU o GPU mediante llama.cpp y herramientas compatibles con GGUF.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido en la informacion disponible.
- No se documenta soporte multilingue mas alla del ingles.

## Casos de uso

- Extraccion de campos de facturas y recibos: se pasa el texto OCR de una factura junto con una plantilla JSON (numero, fecha, importe, proveedor) y el modelo devuelve el JSON relleno; el tamano reducido permite procesar lotes en CPU.
- Procesamiento de curriculos: extraer nombre, experiencia, formacion y habilidades de CV en texto plano mediante una plantilla fija, integrable en un pipeline de RRHH.
- Digitalizacion de formularios y documentos administrativos: convertir texto libre en registros estructurados para bases de datos, con la ventaja de que el modelo cabe en 0,4 GB en cuantizacion Q4_K_M.
- Enriquecimiento de datos en pipelines ETL: ejecutar el modelo en un contenedor ligero para normalizar campos de registros no estructurados antes de cargarlos en un almacen.
- Prototipado rapido en local: validar plantillas de extraccion en un portatil sin GPU antes de escalar a un modelo mayor de la familia NuExtract.
- Clasificacion y etiquetado asistido: usar la plantilla JSON para forzar una salida con categorias predefinidas sobre textos cortos en ingles.
- Extraccion en entornos con requisitos de privacidad: al ejecutarse en local con licencia MIT, permite procesar documentos sensibles sin enviarlos a una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 0,3 GB (Q2_K) y 1,0 GB (f16) solo para los pesos; anadir margen para el contexto y el runtime.
- Cabe en cualquier GPU de consumo con al menos 2 GB de VRAM libre, e incluso en CPU sin GPU dedicada.
- GPU recomendadas: no requiere GPU dedicada; funciona en RTX 3060/4060 o superiores, y en Apple Silicon mediante llama.cpp con aceleracion Metal.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede cargarse con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano (menos de 500 M de parametros) se espera baja latencia en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| NuExtract-tiny-GGUF (este) | 464 M | no disponible | en | MIT | GGUF |
| NuExtract-tiny (base) | 464 M | no disponible | en | MIT | safetensors/transformers |
| Otras variantes NuExtract (small, base, large) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta garantizado.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datos no especificados, puede heredar sesgos de esos datos.
- Riesgo de alucinacion: en tareas de extraccion, puede inventar valores para campos ausentes en el texto; conviene validar la salida contra el esquema JSON.
- La calidad de la extraccion depende de la plantilla JSON proporcionada; plantillas ambiguas o muy complejas pueden degradar el resultado.
- El repositorio no incluye cuantizaciones ponderadas/imatrix, lo que puede suponer una ligera perdida de calidad frente a alternativas con imatrix en tamanos equivalentes.
- Licencia MIT: permite uso comercial, pero se recomienda revisar la licencia del modelo base (numind/NuExtract-tiny) por si impone condiciones adicionales.
- El modelo base puede tener su propia licencia o terminos de uso no reflejados en este repositorio; conviene verificar la model card original.
- No se garantiza el cumplimiento estricto de JSON en todas las salidas; en produccion conviene usar validacion y reintentos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/NuExtract-tiny-GGUF
- Modelo base: https://huggingface.co/numind/NuExtract-tiny
- Pagina de descargas del autor: https://hf.tst.eu/model#NuExtract-tiny-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
