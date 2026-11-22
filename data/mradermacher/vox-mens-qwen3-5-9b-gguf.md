# mradermacher/vox-mens-qwen3.5-9b-GGUF

## Resumen

vox-mens-qwen3.5-9b-GGUF es la distribucion en formato GGUF del modelo brbrainerd/vox-mens-qwen3.5-9b, un ajuste fino (fine-tuning) del modelo Qwen3.5 de 9 mil millones de parametros. La cuantizacion la realiza mradermacher, un conocido publicador de versiones GGUF de la comunidad, que genera los ficheros estaticos a partir de los pesos originales en formato Hugging Face. El modelo base emplea una arquitectura con Gated Delta Networks, segun las etiquetas de la model card, y fue entrenado mediante QLoRA y RS-LoRA sobre un conjunto de datos propio orientado al dominio "vox-mens".

Este repositorio resuelve un problema practico: permitir la ejecucion del modelo en hardware de consumo mediante cuantizaciones de 2 a 8 bits, con ficheros que van desde 3,9 GB (Q2_K) hasta 18 GB (f16). Al estar empaquetado en GGUF, es compatible con llama.cpp, Ollama y otros runners que consumen este formato, lo que amplia enormemente su accesibilidad frente a los pesos originales en safetensors.

El modelo cuenta con 8.953.803.264 parametros totales (segun los safetensors del modelo base) y esta publicado bajo licencia Apache 2.0. La model card declara soporte unicamente para ingles y esta orientada a tareas de generacion de texto, codigo y conversacion, con etiquetas que apuntan a integracion con text-generation-inference y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Gated Delta Networks (segun etiquetas de la model card) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3.5 de 9B. Las etiquetas de la model card mencionan "gated-delta-networks", lo que sugiere la incorporacion de mecanismos de atencion lineal con compuertas delta en la arquitectura, si bien no se proporcionan detalles tecnicos sobre la configuracion exacta de capas, dimensiones ocultas o numero de cabezas de atencion.

El entrenamiento se realizo mediante QLoRA y RS-LoRA (tecnicas de ajuste fino eficiente en parametros con cuantizacion de bajo rango), sobre los conjuntos de datos brbrainerd/vox-mens-data-vox-lang y evaluado con brbrainerd/vox-mens-eval-vox-lang-bench. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card incluye la etiqueta "gate-passed", que podria indicar que el modelo supero algun criterio de validacion interno del autor, pero no se detalla su significado.

## Capacidades

- Generacion de texto conversacional en ingles.
- Generacion de codigo (etiqueta "code" en la model card).
- Capacidades de conversacion multi-turno (etiqueta "conversational").
- Compatibilidad declarada con text-generation-inference y vLLM.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en ingles: el modelo puede gestionar dialogos multi-turno gracias a su naturaleza conversacional, adecuado para prototipos de chatbots desplegados localmente con llama.cpp u Ollama en hardware de consumo.
- Generacion de codigo en entornos con recursos limitados: con cuantizaciones Q4_K_M (5,7 GB) puede ejecutarse en GPUs de consumo de 8 GB de VRAM, sirviendo como asistente de programacion local sin dependencia de la nube.
- Despliegue en el borde (edge computing): las versiones Q2_K (3,9 GB) y Q3_K_S (4,4 GB) permiten ejecutar el modelo en dispositivos con poca memoria, util para aplicaciones offline o embebidas.
- Experimentacion e investigacion: al ser un fine-tuning de Qwen3.5 con tecnicas QLoRA/RS-LoRA, sirve como caso de estudio para reproducir pipelines de ajuste eficiente sobre modelos de 9B.
- Integracion en pipelines de text-generation-inference o vLLM: las etiquetas indican compatibilidad con estos servidores de inferencia, lo que permite desplegarlo como servicio HTTP en produccion.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion que permiten medir el impacto de la compresion en calidad y velocidad para un mismo modelo base.
- Fine-tuning adicional sobre dominio especifico: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para nuevos ajustes en otros dominios o idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): desde ~4 GB (Q2_K, 3,9 GB de fichero) hasta ~18 GB (f16), pasando por ~5,7 GB (Q4_K_M) y ~9,6 GB (Q8_0). A estas cifras hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: para f16 se requiere una GPU de 24 GB o superior (RTX 3090/4090, A100, H100). Para Q8_0 basta con 12-16 GB (RTX 4070 Ti Super, RTX 4080). Para Q4_K_M es suficiente con 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070).
- Cabe en GPU de consumo: si, en todas las cuantizaciones de Q2_K a Q6_K en GPUs de 8 GB o mas; Q8_0 requiere 12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference, vLLM (segun etiquetas de la model card). El formato GGUF es nativo de llama.cpp y Ollama.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vox-mens-qwen3.5-9b-GGUF | 8.953.803.264 | no disponible | apache-2.0 | GGUF | Hugging Face (mradermacher) |
| Qwen3.5-9B (base) | ~9B | no disponible | no disponible | safetensors | Hugging Face |
| Otros fine-tunes de Qwen3.5 en GGUF | ~9B | no disponible | variable | GGUF | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado y declarado unicamente para ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Al ser un fine-tuning de dominio especifico ("vox-mens"), puede presentar sesgos hacia el estilo y vocabulario de los datos de entrenamiento, cuyo contenido no se detalla.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar su uso en tareas de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 puede tener condiciones adicionales que no se detallan en la informacion disponible; conviene verificar la licencia del modelo original.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia y la calidad del codigo generado; se recomienda Q4_K_M o superior para uso en produccion.
- No hay informacion sobre tool calling, modo thinking ni capacidades de agente, por lo que no debe asumirse su disponibilidad.
- El repositorio ocupa 81,4 GB en total por incluir todas las variantes; la descarga selectiva de un solo fichero es necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/vox-mens-qwen3.5-9b-GGUF
- Modelo base: https://huggingface.co/brbrainerd/vox-mens-qwen3.5-9b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#vox-mens-qwen3.5-9b-GGUF
- Dataset de evaluacion: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Dataset de entrenamiento: https://huggingface.co/datasets/brbrainerd/vox-mens-data-vox-lang
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
