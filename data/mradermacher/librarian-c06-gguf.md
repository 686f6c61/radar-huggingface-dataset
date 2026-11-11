# mradermacher/librarian-c06-GGUF

## Resumen

`mradermacher/librarian-c06-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo base `sadasat/librarian-c06`, publicada por el cuantizador habitual de la comunidad mradermacher. El modelo subyacente es un transformer de aproximadamente 752 millones de parámetros (752.393.024 segun los pesos safetensors del repo base) etiquetado con las categorias `weight-space-programming`, `librarian`, `browser-inference` y `onnx`, lo que sugiere un enfoque de programacion en el espacio de pesos orientado a inferencia en navegador. La licencia es Apache 2.0 y los idiomas declarados son ingles y espanol.

La relevancia de esta publicacion es practica: convierte un modelo de ~750 M de parametros en artefactos ligeros (desde 0,5 GB en Q2_K hasta 1,6 GB en f16) que caben holgadamente en GPU de consumo e incluso en entornos con memoria muy limitada. El repo GGUF ocupa 7,5 GB en total porque incluye todas las variantes de cuantizacion, no porque el modelo sea grande.

Conviene subrayar que la model card del cuantizador no aporta informacion sobre arquitectura interna, datos de entrenamiento, contexto maximo ni benchmarks; toda la ficha se limita a lo verificable en los metadatos disponibles. El modelo base es de autoria de `sadasat` y no cuenta con descargas ni likes en el momento de la consulta, lo que indica una publicacion muy reciente y sin validacion comunitaria amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle interno no disponible); tags del modelo base: weight-space-programming, browser-inference, onnx |
| Parametros totales | 752.393.024 (~752 M) |
| Parametros activos | no disponible (no es MoE segun los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo base en safetensors/transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `sadasat/librarian-c06` en la documentacion proporcionada. Los metadatos indican que se trata de un transformer de ~752 M de parametros con etiquetas que apuntan a `weight-space-programming` (una tecnica de adaptacion de modelos mediante modificacion directa de pesos en lugar de fine-tuning convencional), `browser-inference` y `onnx`, lo que sugiere que el autor diseno el modelo pensando en despliegue ligero del lado del cliente. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La aportacion tecnica de esta publicacion concreta es la conversion a GGUF y la generacion de cuantizaciones estaticas con `quantize_version: 2` y `output_tensor_quantised: 1`. El autor indica que no ha generado cuantizaciones ponderadas con imatrix, por lo que las variantes IQ disponibles (unicamente IQ4_XS) son estaticas. No hay informacion sobre innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` en los metadatos del repo indica que el modelo esta orientado a dialogos multi-turno.
- Soporte bilingue declarado: ingles y espanol.
- Inferencia en navegador: los tags `browser-inference` y `onnx` del modelo base apuntan a un diseno compatible con ejecucion en cliente (WebGPU/WASM mediante ONNX Runtime Web u otros runtimes), aunque esta publicacion concreta solo distribuye pesos GGUF.
- Programacion en el espacio de pesos: la etiqueta `weight-space-programming` sugiere que el modelo fue adaptado mediante tecnicas de edicion de pesos, no mediante fine-tuning clasico.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, vision, audio, modo thinking ni razonamiento matematico avanzado.

## Casos de uso

- Asistente conversacional ligero en local: con cuantizaciones Q4_K_M de ~0,6 GB, el modelo se puede ejecutar en portatiles sin GPU dedicada mediante llama.cpp u Ollama, ofreciendo un chatbot bilingue de baja latencia para entornos sin conectividad.
- Prototipado rapido de aplicaciones de chat: al ser un modelo de ~750 M de parametros, permite iterar en el diseno de prompts y flujos conversacionales con coste de computo minimo antes de migrar a modelos mayores.
- Inferencia en navegador: aunque esta publicacion distribuye GGUF, el modelo base esta etiquetado para `browser-inference` y `onnx`, por lo que puede emplearse como referencia para construir demos de asistentes que corren integramente en el cliente sin enviar datos al servidor.
- Educacion y experimentacion con cuantizacion: la disponibilidad de doce variantes de cuantizacion (de Q2_K a f16) permite estudiar el impacto de la precision en la calidad de salida con un modelo pequeno y manejable.
- Despliegue en dispositivos de borde: con 0,5-0,9 GB de pesos, encaja en Raspberry Pi con 4-8 GB de RAM, mini-PC o telefonos de gama alta, habilitando asistentes locales en kioscos o aplicaciones de campo.
- Generacion de texto auxiliar en pipelines: tareas de resumen corto, reformulacion o clasificacion conversacional en las que el coste por token es critico y un modelo de 750 M es suficiente.
- Investigacion sobre weight-space programming: sirve como caso de estudio reproducible de un modelo adaptado mediante edicion de pesos y posteriormente cuantizado a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K / Q3_K_S: ~0,5 GB de pesos, ~0,8-1 GB en ejecucion.
  - Q4_K_M (recomendada): ~0,6 GB de pesos, ~1-1,5 GB en ejecucion.
  - Q8_0: ~0,9 GB de pesos, ~1,5-2 GB en ejecucion.
  - f16: ~1,6 GB de pesos, ~2,5-3 GB en ejecucion.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 ejecutan las variantes Q4 y Q5 con holgura. En A100/H100 el modelo esta limitado por latencia, no por memoria.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos y en muchas iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos safetensors del repo base; el modelo base tambien esta preparado para ONNX segun sus tags.
- Latencia y throughput: no disponibles en la informacion proporcionada; en un modelo de este tamano se espera decodificacion muy rapida (decenas a cientos de tokens por segundo) en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| librarian-c06 (este) | ~752 M | no disponible | en, es | Apache 2.0 | GGUF, safetensors, ONNX (base) | Orientado a browser-inference y weight-space programming |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens | multilingue (29 idiomas) | Apache 2.0 | safetensors, GGUF | Referencia consolidada en el rango sub-1B con benchmarks publicos |
| Qwen2.5-1.5B | ~1.540 M | 32.768 tokens | multilingue (29 idiomas) | Apache 2.0 | safetensors, GGUF | Mas capacidad a costa de ~2x parametros |
| Llama 3.2 1B | ~1.240 M | 128.000 tokens | 8 idiomas (incluye es) | Llama 3.2 Community License | safetensors, GGUF | Requiere aceptar licencia; contexto muy superior |

La comparativa es orientativa: no hay datos publicos de rendimiento del modelo base `librarian-c06` que permitan situarlo frente a estas alternativas. En parametros y licencia, la propuesta de sadasat es competitiva con la gama sub-1B, pero carece de la documentacion y los benchmarks que acompanan a las familias Qwen y Llama.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentacion tecnica del modelo base: no es posible estimar su calidad real frente a alternativas consolidadas.
- Modelo sin traccion comunitaria (0 descargas, 0 likes en el momento de la consulta): no hay validacion independiente de su comportamiento.
- Riesgo de alucinacion elevado por su tamano: los modelos de ~750 M de parametros tienden a inventar hechos con mas frecuencia que modelos mayores.
- Cobertura limitada de idiomas: solo ingles y espanol declarados; el rendimiento en espanol no esta verificado.
- Contexto maximo desconocido: puede ser insuficiente para tareas que requieran ventanas largas; conviene validarlo empiricamente antes de usarlo en produccion.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para uso real se recomienda Q4_K_M o superior.
- No hay cuantizaciones ponderadas con imatrix: las variantes IQ se limitan a IQ4_XS estatica.
- Licencia Apache 2.0 permisiva para uso comercial, pero al no haber informacion sobre el dataset de entrenamiento no puede descartarse la presencia de sesgos o de contenido problematico heredado del mismo.
- La etiqueta `browser-inference` corresponde al modelo base; esta publicacion solo distribuye GGUF, por lo que para despliegue web habria que recurrir al repo original y a su version ONNX.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/librarian-c06-GGUF
- Modelo base: https://huggingface.co/sadasat/librarian-c06
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#librarian-c06-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
