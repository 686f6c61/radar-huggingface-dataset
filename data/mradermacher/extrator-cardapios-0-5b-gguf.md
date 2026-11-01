# mradermacher/extrator-cardapios-0.5b-GGUF

## Resumen

Extrator-cardapios-0.5b-GGUF es una colección de cuantizaciones estáticas en formato GGUF, publicada por mradermacher, del modelo vkusterl/extrator-cardapios-0.5b. El modelo base es un extractor de información especializado en menús de restaurantes, entrenado mediante LoRA sobre un dataset sintético en portugués brasileño (vkusterl/cardapios-sinteticos-ptbr). Su propósito es convertir menús de restaurantes en salida estructurada en JSON, un problema habitual en sectores como delivery, agregadores de restaurantes y digitalización de cartas.

Con 494 millones de parámetros (494.032.768 según los safetensors del repositorio), se trata de un modelo muy pequeño, diseñado para tareas de extracción de información y salida estructurada. Su tamaño reducido lo hace ideal para desplegarse en hardware modesto, incluso en CPUs, gracias a las cuantizaciones GGUF que van desde 0,4 GB (Q3_K_S, Q2_K) hasta 1,1 GB (f16). Es relevante como ejemplo de modelos especializados de nicho: en lugar de un LLM generalista, apuesta por un modelo afinado para una única tarea bien definida, con un coste de inferencia mínimo.

El repositorio de mradermacher no añade capacidades nuevas: es una conversión a GGUF para facilitar su uso con llama.cpp, Ollama y herramientas compatibles. La licencia es Apache 2.0, tanto en el modelo base como en las cuantizaciones, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura base exacta no disponible; el tamaño sugiere una familia tipo Qwen2.5-0.5B, pero no está confirmado) |
| Parametros totales | 494.032.768 (494,03 M) |
| Parametros activos | no disponible (no consta que sea MoE; se asume densidad completa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 (GGUF estático) |
| Idiomas soportados | Portugues (pt, entrenado con datos en portugues brasileño) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

El modelo base, vkusterl/extrator-cardapios-0.5b, es un modelo de aproximadamente 494 millones de parámetros afinado mediante LoRA (según los tags del repositorio: adapter base_model), lo que indica que partió de un modelo fundacional preexistente al que se añadieron adaptadores de bajo rango para la tarea de extracción de menús. La arquitectura subyacente es un transformer; el nombre y tamaño sugieren un modelo tipo Qwen2.5-0.5B, aunque la model card no lo confirma explicitamente.

El entrenamiento se realizó con el dataset vkusterl/cardapios-sinteticos-ptbr, un conjunto de datos sintético en portugues brasileño compuesto por menús de restaurantes. No hay información disponible sobre el numero de tokens de entrenamiento, la composición detallada del dataset, ni sobre el uso de RLHF o DPO. La tarea objetivo es la extracción de información con salida estructurada en JSON, probablemente mediante fine-tuning supervisado con pares entrada-salida.

El repositorio de mradermacher consiste en cuantizaciones estáticas GGUF generadas a partir de los pesos en safetensors del modelo base (convert_type: hf). No se han publicado cuantizaciones imatrix (weighted) en el momento de redacción de la ficha, y el autor indica que pueden solicitarse mediante una Community Discussion.

## Capacidades

- Extraccion de informacion de menus de restaurantes en portugues brasileño, convirtiendo texto de cartas en JSON estructurado.
- Salida estructurada (structured output) orientada a JSON, con tags como information-extraction, structured-output y json.
- Generacion de texto conversacional basica (tag conversational), aunque su especializacion es la extraccion.
- No hay indicios de soporte de vision, audio ni multimodalidad: trabaja sobre texto.
- No consta soporte documentado de tool calling ni function calling.
- No consta soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingues: limitadas al portugues segun la model card; su rendimiento en castellano u otros idiomas no esta documentado.

## Casos de uso

- Digitalizacion de cartas de restaurantes: dado un texto o transcripcion de un menu en portugues, el modelo lo convierte en JSON estructurado (platos, precios, categorias), automatizando la carga de datos en plataformas de delivery.
- Integracion en apps de delivery brasileñas: como modelo de solo 494 M de parametros con cuants de 0,4-0,6 GB, puede ejecutarse en servidores baratos o incluso en dispositivos edge para procesar menus entrantes a gran escala.
- Limpieza y normalizacion de datos gastronomicos: extraccion de campos consistentes desde menus con formatos heterogeneos para alimentar bases de datos o buscadores de restaurantes.
- Pipelines ETL de texto a JSON: encaja como componente de extraccion en flujos de datos donde el coste por token debe ser minimo y la tarea es estrecha y repetitiva.
- Prototipado y demostraciones on-device: gracias a GGUF puede cargarse en llama.cpp u Ollama en un portatil sin GPU, util para demos y pruebas de concepto de extraccion estructurada.
- Procesamiento por lotes de menus escaneados (tras OCR): el texto resultante del OCR puede pasarse al modelo para estructurarlo, completando un pipeline de digitalizacion documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud de extraccion, F1 sobre campos JSON ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,4 GB (Q2_K, Q3_K_S) y 1,1 GB (f16) solo de pesos; con contexto y overhead, menos de 2 GB en las cuants mas altas. Ejecutable integramente en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU moderna con 2 GB de VRAM o mas es mas que suficiente. No se necesitan A100 ni H100.
- Consumer GPUs: cabe con holgura en cualquier GPU consumer actual (RTX 3060, RTX 4060, RTX 4090, etc.); incluso integradas o portatiles sin GPU dedicada pueden ejecutarlo via CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers de Hugging Face. vLLM y TGI no son el objetivo natural de los GGUF, aunque el modelo base podria servirse con ellos.
- Latencia y throughput: no disponibles; dada la escala (0,5B), se espera inferencia muy rapida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia |
|---|---|---|---|---|
| extrator-cardapios-0.5b (base) | 494 M | safetensors | Extraccion de menus PT-BR a JSON | Apache 2.0 |
| Qwen2.5-0.5B-Instruct | 494 M | safetensors, GGUF (comunidad) | Modelo generalista multi-tarea | Apache 2.0 |
| Qwen2.5-1.5B-Instruct | 1.540 M | safetensors, GGUF (comunidad) | Generalista, mejor razonamiento | Qwen Research (uso comercial sujeto a licencia) |

Comparacion: frente a un generalista como Qwen2.5-0.5B-Instruct, extrator-cardapios-0.5b ofrece un rendimiento presumiblemente superior en su tarea concreta (menus en portugues) a igualdad de tamaño, a costa de versatilidad. Frente a modelos mayores (1,5B-7B), sacrifica capacidad de razonamiento y contexto a cambio de un coste de inferencia minimo. No hay benchmarks que cuantifiquen estas diferencias.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta afinado para extraer menus en portugues brasileño; su uso fuera de ese dominio o idioma probablemente degrade severamente. No hay datos sobre su comportamiento en castellano.
- Riesgo de alucinacion en campos ausentes: como todo LLM pequeno aplicado a extraccion, puede inventar campos o valores no presentes en el menu; se recomienda validacion esquematica del JSON de salida.
- Dataset sintetico: el entrenamiento con datos sinteticos puede introducir sesgos respecto a menus reales (formatos, abreviaturas, errores tipograficos).
- Longitud de contexto no documentada: menus muy largos podrian exceder la ventana; verificar antes de usar en produccion.
- Cuantizaciones bajas (Q2_K, Q3_K_S/M) pueden degradar la calidad del JSON generado; para produccion se recomiendan Q4_K_M o superiores.
- Licencia Apache 2.0 sin restricciones comerciales relevantes, pero conviene revisar la licencia del modelo fundacional subyacente si el pipeline exige trazabilidad completa.
- No hay benchmarks publicados: evaluar con datos propios antes de desplegar.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/extrator-cardapios-0.5b-GGUF
- Modelo base: https://huggingface.co/vkusterl/extrator-cardapios-0.5b
- Dataset de entrenamiento: https://huggingface.co/datasets/vkusterl/cardapios-sinteticos-ptbr
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#extrator-cardapios-0.5b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
