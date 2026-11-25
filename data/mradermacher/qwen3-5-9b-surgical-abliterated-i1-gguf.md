# mradermacher/Qwen3.5-9B-Surgical-Abliterated-i1-GGUF

## Resumen

Qwen3.5-9B-Surgical-Abliterated-i1-GGUF es una cuantizacion en formato GGUF del modelo medismera/Qwen3.5-9B-Surgical-Abliterated, una variante "abliterated" (con el alineamiento de seguridad suprimido quirurgicamente) de la familia Qwen3.5 de 9B parametros. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF con imatrix, y emplea el esquema de cuantizacion "i1" (con fichero imatrix) para preservar la calidad en rangos bajos de bits.

El modelo cuenta con 9.197.093.888 parametros reales (segun los safetensors del modelo base) y se distribuye bajo licencia Apache 2.0. La model card indica que se trata de un modelo de vision, por lo que los ficheros mmproj (proyector multimodal) se alojan en el repositorio estatico hermano. El idioma declarado es unicamente ingles.

Su relevancia radica en ofrecer una via de despliegue local eficiente (desde 4,0 GB en Q2_K hasta 7,7 GB en Q6_K) de un modelo de 9B sin filtros de alineamiento, con cuantizaciones con imatrix que reducen la perdida de perplejidad respecto a las cuantizaciones estaticas, lo que lo hace atractivo para investigacion sobre alineamiento, red teaming y aplicaciones que requieren baja censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), variante abliterated de Qwen3.5; modelo de vision segun la model card |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1) y safetensors en el modelo base; mmproj en repositorio estatico |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de identificarla como un transformer causal (causal-lm) de la familia Qwen3.5 con 9.197.093.888 parametros. El modelo base ha sido sometido a un proceso de "surgical ablation" (abliterated), una tecnica de modificacion de pesos que suprime selectivamente las direcciones de activacion asociadas al rechazo y al alineamiento de seguridad, conservando el resto de capacidades. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

El trabajo de mradermacher consiste en la cuantizacion del modelo base a GGUF mediante el esquema "i1", que utiliza un fichero imatrix (matriz de importancia) para ponderar la cuantizacion de los tensores y mejorar la calidad respecto a las cuantizaciones estaticas. La model card indica que las cuantizaciones estaticas estan disponibles en un repositorio separado y que, al tratarse de un modelo de vision, los ficheros mmproj se encuentran en el repositorio estatico.

## Capacidades

- Generacion de texto conversacional en ingles (tag "conversational").
- Modelo de vision: la model card indica explicitamente que es un modelo de vision, con ficheros mmproj en el repositorio estatico.
- Comportamiento "uncensored" / abliterated: el alineamiento de seguridad ha sido suprimido quirurgicamente, por lo que el modelo no aplica los rechazos tipicos del modelo original.
- Compatible con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM sin las capas de rechazo, comparando respuestas frente al modelo original para analizar que direcciones de activacion codifican el alineamiento.
- Red teaming y evaluacion de robustez: util para generar respuestas que un modelo alineado rechazaria y asi probar clasificadores de contenido, filtros y sistemas de moderacion en pipelines de seguridad.
- Despliegue local en hardware de consumo: con cuantizaciones de 4,0 a 7,7 GB, el modelo cabe en GPUs consumer (por ejemplo, 8-12 GB de VRAM) y permite ejecutar un modelo de 9B en portatiles o estaciones de trabajo sin GPU dedicada de datacenter.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde el modelo alineado aplicaria rechazos.
- Prototipado rapido de asistentes conversacionales en ingles: gracias a su tamano moderado y a la disponibilidad de GGUF, se puede integrar en llama.cpp u Ollama para pruebas de concepto de chatbots multi-turno.
- Analisis de imagenes en local: al ser un modelo de vision con mmproj, permite tareas de descripcion de imagenes o VQA en entornos sin conexion, siempre que se descargue el proyector del repositorio estatico.
- Creacion de cuantizaciones propias: el fichero imatrix incluido (0,1 GB) permite a otros usuarios generar sus propias cuantizaciones con el esquema i1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, pesos + overhead de contexto): i1-Q2_K ~4,0 GB; i1-IQ3_S ~4,6 GB; i1-Q4_K_M ~5,9 GB; i1-Q5_K_M ~6,7 GB; i1-Q6_K ~7,7 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para las cuantizaciones mas altas con contexto amplio; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, desde GPUs de 8 GB (Q2_K/IQ3) hasta 12-16 GB (Q5/Q6 con contexto moderado).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo TGI/vLLM (no confirmado para GGUF).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Surgical-Abliterated-i1-GGUF (este) | 9,2B | no disponible | Apache 2.0 | GGUF i1 | Abliterated, vision, solo ingles |
| Qwen3.5-9B-Surgical-Abliterated (base) | 9,2B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.5-9B-Surgical-Abliterated-GGUF (estatico) | 9,2B | no disponible | Apache 2.0 | GGUF estatico | Mismo modelo, cuantizacion sin imatrix |
| Otros modelos abliterated de ~9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

## Limitaciones y advertencias

- El modelo ha sido "abliterated": se ha suprimido el alineamiento de seguridad, por lo que puede generar contenido danino, ilegal o eticamente cuestionable sin aplicar rechazos. No es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion, comun en modelos de 9B y agravado por la falta de datos de entrenamiento publicados.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no disponible; no se puede planificar el uso en tareas de contexto largo sin verificacion empirica.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S, Q4_0) degradan notablemente la perplejidad; la propia model card recomienda IQ3_XXS o IQ4_XS frente a alternativas del mismo tamano.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de alineamiento traslada al desplegador toda la responsabilidad legal y etica sobre el contenido generado.
- La ablacion quirurgica puede degradar capacidades generales (razonamiento, instrucciones) respecto al modelo original; no se han publicado evaluaciones que lo cuantifiquen.
- El modelo base y la cuantizacion son obra de autores distintos (medismera y mradermacher); la trazabilidad del proceso de ablacion no esta documentada en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-9B-Surgical-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/medismera/Qwen3.5-9B-Surgical-Abliterated
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-9B-Surgical-Abliterated-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-Surgical-Abliterated-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
