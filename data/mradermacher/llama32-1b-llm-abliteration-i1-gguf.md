# mradermacher/llama32-1b-llm-abliteration-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix (matriz de importancia) del modelo **llama32-1b-llm-abliteration**, un modelo basado en Llama 3.2 de 1.000 millones de parametros al que se ha aplicado la tecnica de *abliteration* para eliminar sus mecanismos internos de rechazo (refusals). El modelo original fue desarrollado por el usuario de HuggingFace **muhammadrafifatihulihsan**, y las cuantizaciones fueron realizadas por **mradermacher**, un cuantizador muy activo de la comunidad que proporciona versiones optimizadas en formato GGUF para su uso con llama.cpp, Ollama y herramientas compatibles.

El problema que resuelve es doble: por un lado, ofrece un modelo de tamano minimo (1,5 mil millones de parametros) capaz de ejecutarse en hardware muy modesto, incluso en CPU; por otro, al tratarse de una version abliterada, responde a todo tipo de peticiones sin aplicar los rechazos de seguridad del modelo original. Esto lo hace relevante para investigadores que estudian el comportamiento de modelos sin filtros, para evaluacion de robustez de sistemas de seguridad y para usuarios que necesitan un modelo sin restricciones de alineamiento. La licencia subyacente es la Llama 3.2 Community License de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 3.2) |
| Parametros totales | 1.498.482.720 (~1,5B) |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no disponible (Llama 3.2 1B original soporta 128K, pero no consta en la informacion proporcionada) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (cuantizaciones imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de la familia Llama 3.2, con 1.498.482.720 parametros segun los metadatos de safetensors. La version abliterada aplica una tecnica que identifica y neutraliza las direcciones latentes del modelo asociadas al rechazo de peticiones, permitiendo que el modelo responda sin aplicar sus politicas de seguridad entrenadas. No se dispone de informacion sobre el proceso de abliteration concreto (dataset utilizado, metodo exacto) ni sobre el entrenamiento original del modelo base mas alla de lo publicado por Meta para Llama 3.2 1B.

Las cuantizaciones de este repositorio son de tipo *imatrix* (matriz de importancia calculada sobre un corpus de calibracion), lo que permite mantener mejor calidad en cuants agresivos (IQ1, IQ2, IQ3) que las cuantizaciones estaticas equivalentes. Existen tambien cuantizaciones estaticas del mismo modelo en un repositorio hermano de mradermacher. No se ha publicado informacion sobre datos de entrenamiento adicionales, RLHF/DPO ni innovaciones tecnicas propias del modelo abliterado.

## Capacidades

- Generacion de texto general en ingles con estilo conversacional (tag `conversational` en los metadatos).
- Respuesta sin rechazos: la abliteration elimina los refusals, por lo que el modelo responde a peticiones que el modelo original rechazaria.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp y otras herramientas compatibles.
- Tamano muy reducido: versiones desde 0,6 GB, aptas para dispositivos con recursos muy limitados.
- No hay informacion que indique soporte de vision, audio, tool calling ni modos de razonamiento extendido; el modelo base de 1B de Llama 3.2 es un modelo de texto puro.

## Casos de uso

- **Investigacion en seguridad de modelos: estudiar como se comporta un modelo sin mecanismos de rechazo, util para red-teaming y para evaluar la eficacia de filtros externos.**
- **Analisis de la tecnica de abliteration: comparar respuestas del modelo original frente a la version abliterada para medir el impacto de la neutralizacion de refusals en la calidad de salida.**
- **Ejecucion en hardware minimo: con cuants de 0,6-1,1 GB, el modelo funciona en portatiles sin GPU dedicada, Raspberry Pi 5 o dispositivos edge con poca RAM.**
- **Prototipado rapido con Ollama: gracias al tag `ollama`, puede descargarse y ejecutarse con un solo comando, ideal para pruebas locales de agentes o pipelines de texto.**
- **Generacion de texto creativo sin filtros: escritura de ficcion o contenido que el modelo original bloquearia por politicas de seguridad, bajo responsabilidad del usuario.**
- **Pruebas de cuantizacion: el archivo imatrix incluido permite a desarrolladores crear sus propias cuantizaciones personalizadas y comparar degradacion de calidad entre tipos IQ y K.**

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay datos comparativos entre las distintas cuantizaciones mas alla de las notas cualitativas del autor (por ejemplo, i1-Q4_K_S marcada como "optimal size/speed/quality" e i1-Q4_K_M como "fast, recommended").

## Requisitos de hardware

- VRAM/RAM estimada: desde ~0,7 GB para i1-IQ1_S/IQ1_M hasta ~1,4 GB para i1-Q6_K, mas el contexto. Al ser un modelo de 1,5B, puede ejecutarse integramente en CPU sin GPU.
- GPU recomendadas: no son necesarias; si se usa GPU, cualquier tarjeta con 2 GB de VRAM o mas es suficiente (por ejemplo, GTX 1650, RTX 3060 o superiores).
- Consumer GPUs: cabe sobradamente en practicamente cualquier GPU moderna; incluso en integradas (Intel iGPU, AMD APU) con memoria compartida.
- Despliegue: llama.cpp, Ollama (tag oficial en la model card), LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. No es un modelo orientado a vLLM/TGI, que requieren formatos de pesos distintos.
- Latencia y throughput: no disponibles; al ser un modelo de 1B cuantizado, se esperan velocidades altas incluso en CPU de escritorio, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| mradermacher/llama32-1b-llm-abliteration-i1-GGUF | ~1,5B | GGUF imatrix | Llama 3.2 Community | Abliterado, sin refusals, 24 cuants disponibles |
| mradermacher/llama32-1b-llm-abliteration-GGUF | ~1,5B | GGUF estatico | Llama 3.2 Community | Misma base, cuants estaticos en repo hermano |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2B | safetensors | Llama 3.2 Community | Modelo original con politicas de seguridad activas |

## Limitaciones y advertencias

- **Sin filtros de seguridad**: al estar abliterado, el modelo no rechaza peticiones daninas. Su uso para generar contenido ilegal, ofensivo o perjudicial es responsabilidad del usuario y puede infringir la licencia Llama 3.2 Community License, que incluye un acceptable use policy.
- **Idioma**: el modelo esta etiquetado solo para ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- **Capacidad limitada**: con 1,5B de parametros, el razonamiento complejo, las matematicas y la generacion de codigo son debiles; se esperan alucinaciones frecuentes y errores factuales.
- **Degradacion por cuantizacion**: los cuants IQ1/IQ2 (0,6-0,7 GB) tienen perdida de calidad notable, como indican las notas del propio autor ("for the desperate", "very low quality").
- **Licencia comercial**: la Llama 3.2 Community License impone restricciones (limite de 700 millones de usuarios activos mensuales para el despliegue, requisitos de atribucion y cumplimiento de la politica de uso aceptable de Meta).
- **Sin benchmarks publicados**: no hay datos que permitan verificar la calidad del modelo abliterado frente al original.

## Enlaces

- Repositorio de las cuantizaciones imatrix: https://huggingface.co/mradermacher/llama32-1b-llm-abliteration-i1-GGUF
- Modelo base abliterado: https://huggingface.co/muhammadrafifatihulihsan/llama32-1b-llm-abliteration
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/llama32-1b-llm-abliteration-GGUF
- Pagina de descarga resumida de mradermacher: https://hf.tst.eu/model#llama32-1b-llm-abliteration-i1-GGUF
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600
- Grafico comparativo de cuants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
