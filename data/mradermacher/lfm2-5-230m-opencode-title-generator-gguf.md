# mradermacher/LFM2.5-230M-OpenCode-Title-Generator-GGUF

## Resumen

LFM2.5-230M-OpenCode-Title-Generator-GGUF es la version cuantizada en formato GGUF del modelo kth8/LFM2.5-230M-OpenCode-Title-Generator, un ajuste fino supervisado (SFT) de la familia LFM2.5 de Liquid AI con 229.693.184 parametros (aproximadamente 230 M). La cuantizacion la firma mradermacher, autor habitual de versiones GGUF de modelos abiertos, y se distribuye bajo licencia lfm1.0.

El modelo resuelve un problema muy concreto: generar titulos cortos para sesiones o conversaciones de OpenCode, una tarea auxiliar tipica en interfaces de programacion asistida. Se entreno sobre el dataset kth8/title-generation-10000x y declara unicamente el idioma ingles, sin que la informacion disponible detalle la longitud de contexto ni los datos exactos de preentrenamiento.

Su interes practico esta en el tamano: con entre 0,2 GB (Q2_K) y 0,6 GB (f16) de pesos, puede ejecutarse en CPU, en una Raspberry Pi o en cualquier GPU consumer, lo que permite integrarlo como componente auxiliar de bajo coste dentro de un agente de codigo sin recurrir a un modelo grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como liquid / lfm2.5, familia LFM2.5 de Liquid AI) |
| Parametros totales | 229.693.184 (aproximadamente 230 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF (repo de 2,2 GB); el modelo base usa safetensors |

## Arquitectura y entrenamiento

Las etiquetas del repositorio (liquid, lfm2.5) situan el modelo dentro de la familia LFM2.5 de Liquid AI, pero la informacion proporcionada no detalla la arquitectura interna, el numero de capas, la atencion utilizada ni la composicion del corpus de preentrenamiento. Tampoco se indica la longitud de contexto soportada por el modelo base.

El ajuste se realizo mediante SFT (supervised fine-tuning) con las librerias TRL y Unsloth, sobre el dataset kth8/title-generation-10000x, cuyo nombre sugiere alrededor de 10.000 ejemplos de pares conversacion-titulo orientados a OpenCode. No hay constancia en la informacion disponible de fases de RLHF, DPO u otras tecnicas de alineacion. En el plano de la cuantizacion, el autor indica quantize_version 2, output_tensor_quantised 1 y conversion a formato HF, con cuantizaciones de tipo estatico; no hay cuantizaciones ponderadas ni con imatrix publicadas por este autor.

## Capacidades

- Generacion de titulos: tarea principal para la que fue ajustado, a partir de contenido conversacional o de codigo.
- Generacion de texto conversacional: la etiqueta "conversational" indica formato de chat.
- Uso como modelo auxiliar dentro de pipelines de agentes de codigo (OpenCode), no como modelo de proposito general.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no; solo se declara ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Titulado automatico de sesiones en OpenCode: el modelo recibe el contenido de una conversacion de programacion y devuelve un titulo corto para identificarla en la interfaz, que es exactamente la tarea del ajuste.
- Organizacion de historiales de chat largos: permite etiquetar cientos de sesiones antiguas en lote para que el usuario las localice por nombre en lugar de por fecha o identificador.
- Integracion en extensiones de IDE: al ocupar solo 0,2-0,3 GB en cuantizaciones Q4/Q5, puede empotrarse en un plugin que genere el titulo de cada sesion de trabajo sin llamadas a API externas.
- Etiquetado de logs de conversaciones para analitica: generar titulos legibles para volcados de interacciones que luego se agregan en paneles de uso interno.
- Indexado y busqueda semantica de sesiones: los titulos generados sirven como metadatos de texto para un indice de busqueda sobre el historial de un asistente de codigo.
- Despliegue en edge o en local sin GPU: la version Q4_K_S o Q4_K_M puede ejecutarse en CPU o en una Raspberry Pi, lo que permite ofrecer la funcion de titulado en entornos sin acelerador.
- Generacion masiva en batch: procesar grandes volumenes de conversaciones para poblar un catalogo de sesiones tituladas durante una migracion de datos.
- Prototipado rapido de funciones auxiliares: servir como pieza de bajo coste en pruebas de concepto de asistentes de codigo antes de sustituirla por un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de calidad de titulos, y el autor de la cuantizacion no aporta evaluaciones comparativas frente al modelo base en f16.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,25 GB para Q4_K_S/Q4_K_M, 0,3 GB para Q5 y Q6, 0,3 GB para Q8_0 y 0,6 GB para f16.
- GPU recomendadas: cualquier GPU con 1 GB o mas de memoria; no requiere A100, H100 ni tarjetas de gama alta. Funciona en GTX 1050, RTX 3060, RTX 4090 o inferiores.
- GPU consumer: si, cabe holgadamente en cualquier GPU consumer e incluso en iGPU con memoria unificada.
- CPU: viable en exclusiva, incluidos equipos de escritorio modestos y placas tipo Raspberry Pi.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y bindings de llama-cpp-python. El soporte en vLLM o TGI para GGUF es limitado y no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay resultados de benchmarks publicados para este modelo en la informacion disponible, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos proceden de informacion publica general y pueden variar.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LFM2.5-230M-OpenCode-Title-Generator-GGUF | 230 M | no disponible | lfm1.0 | Titulado de sesiones de OpenCode, solo ingles |
| Qwen2.5-0.5B-Instruct | 494 M | no disponible en esta ficha | Apache-2.0 | Modelo generalista de proposito multiple |
| SmolLM2-360M-Instruct | 362 M | no disponible en esta ficha | Apache-2.0 | Modelo generalista de proposito multiple |
| LFM2-350M (familia Liquid AI) | 350 M | no disponible en esta ficha | licencia propia de Liquid AI | Modelo generalista de la misma familia |

La diferencia clave frente a las alternativas generalistas es la especializacion: este modelo esta ajustado para una unica tarea de titulado y no se ha evaluado publicamente como modelo de proposito general, mientras que las alternativas cubren generacion, razonamiento y codigo con benchmarks publicados por sus autores.

## Limitaciones y advertencias

- Modelo monoespecializado: no debe esperarse rendimiento util en tareas generales de generacion, razonamiento, matematicas o codigo fuera del titulado de conversaciones.
- Idioma: solo se declara ingles; el comportamiento en castellano no esta documentado.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide garantizar el titulado correcto de conversaciones muy largas.
- Alucinacion: al ser un modelo de 230 M ajustado con SFT, puede producir titulos poco fieles al contenido o repetir patrones del dataset de entrenamiento.
- Riesgo de sobreajuste al dataset kth8/title-generation-10000x: el estilo de los titulos generados puede quedar sesgado hacia el formato y vocabulario de esos 10.000 ejemplos, orientados a OpenCode.
- Cuantizaciones agresivas: las variantes Q2_K, Q3_K_S y Q3_K_M degradan la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S o Q4_K_M.
- Licencia lfm1.0: es una licencia propia de Liquid AI, no una licencia permisiva estandar. Antes de un uso comercial es obligatorio revisar sus terminos, ya que puede incluir restricciones de uso, atribucion o limites por volumen.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de los datos, por lo que no existe evidencia externa de calidad.
- No hay informacion sobre sesgos, datos de entrenamiento detallados ni evaluaciones de seguridad.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/LFM2.5-230M-OpenCode-Title-Generator-GGUF
- Modelo base: https://huggingface.co/kth8/LFM2.5-230M-OpenCode-Title-Generator
- Dataset de entrenamiento: https://hf.co/datasets/kth8/title-generation-10000x
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#LFM2.5-230M-OpenCode-Title-Generator-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de la cuantizacion: https://www.nethype.de/
