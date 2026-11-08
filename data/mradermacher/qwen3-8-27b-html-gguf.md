# mradermacher/Qwen3.8-27B-HTML-GGUF

## Resumen

Qwen3.8-27B-HTML-GGUF es la distribucion en formato GGUF del modelo wesjos/Qwen3.8-27B-HTML, un ajuste fino (finetune) sobre una base de la familia Qwen3.8 orientado a la generacion de HTML y a la construccion de interfaces de usuario generativas (generative UI). El modelo cuenta con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones) y esta publicado bajo licencia Apache 2.0. Esta version concreta ha sido producida por mradermacher, un autor habitual en la comunidad de cuantizacion que convierte pesos de precision completa a formatos GGUF para su uso con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), pasando por opciones intermedias como Q4_K_M (16,9 GB) o IQ4_XS (15,5 GB). El modelo incluye ademas ficheros mmproj (multi-modal supplement) en Q8_0 y f16, lo que sugiere capacidad de entrada multimodal en el modelo base, aunque la model card no detalla el alcance exacto de dicha capacidad.

El modelo esta etiquetado como conversacional, con soporte declarado para ingles y chino, y esta pensado para tareas de generacion de marcado HTML y componentes de interfaz. No se han publicado en la informacion disponible datos sobre longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de la familia Qwen3.8; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (aprox. 27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj para componente multimodal); el modelo base se distribuye en safetensors/bf16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El modelo base wesjos/Qwen3.8-27B-HTML se etiqueta como finetune sobre una base Qwen3.8 en precision bf16, y la presencia de ficheros mmproj en esta distribucion GGUF indica que el modelo incorpora un componente multimodal (proyeccion de vision u otro modalidad) que se carga por separado del cuerpo principal de pesos. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

La innovacion tecnica destacable de esta publicacion es la propia cuantizacion: mradermacher ofrece cuantizaciones estaticas (no ponderadas por importance matrix) en un rango amplio de tipos K-quant e IQ-quant, lo que permite ajustar el equilibrio entre tamano en disco, VRAM y calidad. La model card indica explicitamente que las cuantizaciones ponderadas/imatrix no estan disponibles en el momento de la publicacion.

## Capacidades

- Generacion de codigo HTML y marcado para interfaces de usuario, segun el enfoque declarado del finetune (tags html, ui, generative-ui).
- Generacion de texto conversacional (tag conversational).
- Entrada multimodal: la presencia de ficheros mmproj Q8_0 y f16 sugiere soporte de entrada de imagenes u otra modalidad, aunque el alcance exacto no se detalla.
- Soporte multilingue limitado a ingles y chino segun los metadatos.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) para esta variante concreta.

## Casos de uso

- Generacion de componentes de interfaz en pipelines de frontend: el modelo puede producir marcado HTML a partir de descripciones en lenguaje natural, lo que permite prototipar pantallas y formularios de forma automatizada dentro de un flujo de desarrollo web.
- Asistentes de diseno generativo: integrado en una herramienta de diseno, el modelo traduce especificaciones de producto en estructuras HTML listas para previsualizar, reduciendo el tiempo de maquetacion inicial.
- Generacion de plantillas de correo y documentos HTML: adecuado para producir plantillas con estructura repetitiva donde la coherencia del marcado es critica.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (16,9 GB) o IQ4_XS (15,5 GB) puede ejecutarse en GPUs de consumo con 24 GB de VRAM, lo que facilita entornos de desarrollo sin dependencia de la nube.
- Prototipado rapido de interfaces en entornos con requisitos de privacidad: al ejecutarse en local mediante llama.cpp, los datos de diseno no salen de la infraestructura del equipo.
- Experimentacion en investigacion sobre modelos de 27B: la disponibilidad de cuantizaciones desde Q2_K hasta Q8_0 permite estudiar la degradacion de calidad por nivel de cuantizacion en tareas de generacion de codigo estructurado.
- Generacion de fragmentos HTML en aplicaciones de documentacion tecnica: el modelo puede producir ejemplos de marcado para manuales y guias con contexto conversacional multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~11,0 GB, Q3_K_S ~12,4 GB, Q3_K_M ~13,6 GB, Q3_K_L ~14,7 GB, IQ4_XS ~15,5 GB, Q4_K_S ~15,9 GB, Q4_K_M ~16,9 GB, Q5_K_S ~19,1 GB, Q5_K_M ~19,6 GB, Q6_K ~22,5 GB, Q8_0 ~29,1 GB. A estos valores hay que sumar la VRAM del contexto KV cache y, si se usa la modalidad multimodal, el fichero mmproj (~0,7 GB en Q8_0 o ~1,0 GB en f16).
- GPU recomendadas: para Q8_0 y Q6_K se recomienda una A100 40 GB, H100 o RTX 4090 24 GB (Q6_K justo en el limite). Para Q4_K_M y Q5_K_M, una RTX 4090 24 GB o RTX 3090 24 GB. Para Q3_K_M e inferiores, GPUs de 16 GB como RTX 4080 o RTX 4060 Ti 16 GB.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM usando cuantizaciones de Q4 hacia abajo; en GPUs de 24 GB caben todas las cuantizaciones hasta Q6_K con holgura y Q8_0 con contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con la API de endpoints. La model card no menciona vLLM ni TGI para esta variante GGUF (aunque el ecosistema de modelos Qwen3.8 relacionado si referencia vllm y sglang en otras variantes).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-HTML-GGUF | 27,3 B | no disponible | GGUF | apache-2.0 | Enfoque en generacion HTML/UI; cuantizaciones Q2_K a Q8_0 |
| mradermacher/Qwen3.8-27B-Humanlike-Chat-2.0-GGUF | 27 B (aprox.) | no disponible | GGUF | apache-2.0 | Enfoque conversacional, tool-calling y roleplay; idiomas en y ru |
| mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-GGUF | 27 B | no disponible | GGUF | no disponible en la informacion | Variante sin censura de la misma base |

Las tres variantes comparten la base Qwen3.8 de 27B y el mismo autor de cuantizacion, por lo que difieren principalmente en el finetune aplicado y en los idiomas declarados. No se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que no es posible verificar la calidad real del modelo en tareas de generacion HTML frente a alternativas.
- El modelo solo declara soporte de ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en la produccion de marcado HTML con APIs o atributos inventados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el finetune pueden arrastrar condiciones adicionales no reflejadas en esta distribucion; conviene verificar la licencia del modelo base wesjos/Qwen3.8-27B-HTML.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- No hay cuantizaciones ponderadas por importance matrix disponibles, lo que limita la calidad maxima alcanzable en tamanos pequenos.
- El repositorio tiene 190,8 GB y 0 descargas en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No se documenta longitud de contexto, por lo que no se puede garantizar el manejo de conversaciones o documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-HTML-GGUF
- Modelo base: https://huggingface.co/wesjos/Qwen3.8-27B-HTML
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-HTML-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Variante relacionada Humanlike-Chat-2.0: https://huggingface.co/mradermacher/Qwen3.8-27B-Humanlike-Chat-2.0-GGUF
- Variante relacionada Ultimate-Heretic-Uncensored: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-GGUF
