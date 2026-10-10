# axteam/gemma-4-26B-A4B-it-NVFP4

## Resumen

axteam/gemma-4-26B-A4B-it-NVFP4 es una cuantización de 4 bits del modelo multimodal google/gemma-4-26B-A4B-it de Google DeepMind, publicada por el usuario axteam. No es un modelo entrenado desde cero: es un derivado en el que los pesos, el tokenizador, la plantilla de chat y el procesador son idénticos a los del original, y solo se ha aplicado un esquema NVFP4 (W4A4, FP4 E2M1) orientado al servicio con vLLM.

El modelo base es un transformer con mezcla de expertos de 25.805.936.206 parámetros totales, con 128 expertos más uno compartido, de los que se activan 8 por token. La nomenclatura «A4B» del nombre apunta a unos 4.000 millones de parámetros activos. La pipeline declarada es image-text-to-text, por lo que la torre de visión se conserva en BF16 sin cuantizar.

Su interés es operativo: reduce el peso en disco a unos 16 GB (17,2 GB de repositorio) y habilita despliegues con pesos y activaciones en FP4, formato que solo acelera realmente sobre tensor cores FP4 (B200, RTX PRO Blackwell). El propio autor documenta la pérdida de fidelidad frente al BF16: perplejidad 1,2802 frente a 1,1284 (+13,5%) y coincidencia top-1 del 91,0% frente al 98,7%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (Gemma 4): 8 expertos activos de 128 totales + 1 compartido |
| Parametros totales | 25.805.936.206 (~25,8 B) |
| Parametros activos | ~4 B segun la nomenclatura «A4B» del modelo base (no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4: pesos y activaciones FP4 (E2M1), grupo 16, escala FP8 E4M3 + escala global FP32 por tensor. Sin cuantizar (BF16): torre de vision, proyeccion de vision, embeddings de tokens (atados con lm_head), router MoE, normas y MLP compartida |
| Idiomas soportados | no disponible (calibracion con 256 muestras de predominio coreano; evaluacion interna en ingles y coreano) |
| Licencia | apache-2.0 en las etiquetas del repositorio; la model card remite a la licencia Gemma 4 |
| Formato de pesos | safetensors con formato compressed-tensors `nvfp4-pack-quantized`; no se ofrece GGUF |
| Autor de la cuantizacion | axteam |
| Modelo base | google/gemma-4-26B-A4B-it (commit 4d7ae49) |
| Pipeline | image-text-to-text |
| Tamano en disco | ~16,0 GB (17,2 GB de repositorio) |

## Arquitectura y entrenamiento

No hay entrenamiento propio: se trata de una cuantizacion post-entrenamiento del checkpoint google/gemma-4-26B-A4B-it (commit 4d7ae49), un transformer decoder-only con mezcla de expertos. El enrutado activa 8 expertos de 128 mas un experto compartido por token, lo que mantiene el coste de computo cercano al de un modelo denso de ~4 B de parametros mientras el almacenamiento corresponde a 25,8 B. Al ser un modelo `-it`, el base esta ajustado para instrucciones; el conjunto de calibracion incluye 32 respuestas autogeneradas en modo pensamiento, lo que apunta a soporte de razonamiento explicito, aunque la model card no detalla ese extremo ni el proceso de alineamiento (RLHF, DPO u otros), que no esta disponible.

La innovacion tecnica relevante es el esquema de cuantizacion: NVFP4 en pesos y activaciones (W4A4) con granularidad de grupo 16, escala FP8 E4M3 por grupo y una escala global FP32 por tensor, empaquetado como compressed-tensors. Se dejan en BF16 la torre y proyeccion de vision, los embeddings atados al lm_head, el router MoE, las normas y la MLP compartida, para preservar la calidad de los componentes mas sensibles. La calibracion se hizo con 256 muestras de predominio coreano, y el tokenizador, `chat_template`, `processor_config` y `generation_config` son byte a byte identicos a los del original, incluida la revision corregida de la plantilla de chat de julio de 2026. No se documentan datos de entrenamiento del modelo base (numero de tokens, composicion del dataset) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y la conservacion integra de la plantilla de chat permiten uso directo como asistente multi-turno.
- Entrada de imagen y texto: la pipeline `image-text-to-text` indica capacidad multimodal de entrada, con la torre de vision sin cuantizar.
- Razonamiento explicito: la calibracion incluye respuestas autogeneradas en modo pensamiento, lo que sugiere soporte de modo de razonamiento en el modelo base; no se detalla en la informacion disponible.
- Codigo y matematicas: no hay confirmacion explicita en la model card; no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los unicos idiomas mencionados en calibracion y evaluacion son coreano e ingles.
- Audio: no disponible.
- Servicio eficiente: compatibilidad declarada con vLLM mediante `vllm serve axteam/gemma-4-26B-A4B-it-NVFP4`.

## Casos de uso

- Servicio multimodal en produccion sobre Blackwell: desplegar el modelo con `vllm serve` en B200 o RTX PRO con tensor cores FP4 permite servir un MoE de 25,8 B con pesos de ~16 GB, reduciendo el coste por token frente a la version BF16 (~51,6 GB solo en pesos).
- Atencion al cliente con imagenes adjuntas: al conservar la torre de vision en BF16 y el procesador original, se pueden recibir capturas de pantalla o fotos de producto y mantener conversaciones multi-turno con muestras de temperatura 1,0, top_p 0,95 y top_k 64.
- Procesamiento documental con extraccion de datos: la combinacion de entrada visual y salida de texto encaja en pipelines de digitalizacion de facturas, formularios o etiquetas, siempre que el contexto requerido quepa en la ventana del modelo base (no publicada).
- Asistentes en ingles y coreano: los unicos idiomas respaldados por la calibracion y la evaluacion interna son ingles y coreano, por lo que es el escenario linguistico de menor riesgo medido.
- Evaluacion de pipelines de cuantizacion: el par de metricas publicadas (perplejidad y acuerdo top-1) y la comparacion con referencias publicas (cyankiwi AWQ, RedHatAI NVFP4) lo convierten en un banco de pruebas para medir fidelidad de esquemas NVFP4 frente a BF16.
- Despliegue con restricciones de memoria en nodos FP4: cuando la VRAM disponible no permite el checkpoint BF16 completo pero si un nodo Blackwell, esta variante evita el particionado manual del modelo.
- Prototipado de agentes multimodales en vLLM: valido para pruebas de concepto de agentes con entrada de imagen, siempre que no se dependa de tool calling, ya que no hay confirmacion de esa capacidad.

## Benchmarks y rendimiento

Los unicos datos publicados miden fidelidad respecto al modelo base, no calidad absoluta en tareas. El autor indica que se midieron sobre un conjunto interno mixto ingles/coreano, con las referencias publicas ejecutadas con el mismo arnes.

| Metrica | Este modelo (NVFP4) | Original BF16 |
|---|---|---|
| Perplejidad (menor es mejor) | 1,2802 | 1,1284 (+13,5%) |
| Coincidencia top-1 del siguiente token | 91,0% | 98,7% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la informacion disponible. Tampoco se publican datos de latencia o throughput.

## Requisitos de hardware

- Peso de los archivos cuantizados: ~16,0 GB en disco (17,2 GB de repositorio). A esto hay que sumar cache KV, buffers de activaciones y overhead del runtime, que dependen de la longitud de contexto (no publicada).
- Referencia de comparacion: el checkpoint BF16 del mismo modelo ocuparia unos 51,6 GB (48 GiB) solo en pesos, a 2 bytes por parametro.
- GPU recomendadas: B200 y RTX PRO Blackwell, unicos con tensor cores FP4 nativos para aprovechar la velocidad del formato. El autor advierte explicitamente de que es un formato solo para Blackwell.
- GPU consumer: en la generacion Blackwell (por ejemplo RTX 5090, 32 GB) el formato seria teoricamente compatible por arquitectura, aunque no esta confirmado en la informacion disponible. En Ada o Ampere (RTX 4090, 24 GB) no hay soporte nativo de FP4: los 16 GB de pesos dejarian poco margen y no se obtendria la ventaja de velocidad.
- Despliegue: vLLM es la via documentada (`vllm serve axteam/gemma-4-26B-A4B-it-NVFP4` o `LLM(model=...)`). No hay GGUF, por lo que llama.cpp y Ollama no pueden cargarlo tal cual. Compatibilidad con TGI no confirmada.
- Parametros de muestreo recomendados por Google: temperature 1,0, top_p 0,95, top_k 64, max_tokens 1024 en el ejemplo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| axteam/gemma-4-26B-A4B-it-NVFP4 | 25,8 B totales, ~4 B activos | no disponible | NVFP4 W4A4, compressed-tensors | apache-2.0 segun etiquetas; Gemma 4 segun model card | Perplejidad 1,2802; top-1 91,0% |
| google/gemma-4-26B-A4B-it (BF16) | 25,8 B totales, ~4 B activos | no disponible | safetensors BF16 | Gemma 4 | Perplejidad 1,1284; top-1 98,7% (referencia del arnes) |
| cyankiwi AWQ de gemma-4-26B-A4B-it | no disponible | no disponible | AWQ, 4 bits | no disponible | Ejecutado en el mismo arnes; cifras no publicadas en esta ficha |
| RedHatAI NVFP4 de gemma-4-26B-A4B-it | no disponible | no disponible | NVFP4 | no disponible | Ejecutado en el mismo arnes; cifras no publicadas en esta ficha |

Los dos ultimos se mencionan en la model card como referencias publicas comparadas, pero no se ofrecen sus numeros. No se dispone de comparativas con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion medida: la perplejidad empeora un 13,5% y la coincidencia top-1 baja al 91,0% (desde el 98,7% del BF16), lo que indica divergencia respecto al modelo original en aproximadamente uno de cada once tokens.
- Riesgo de alucinacion: inherente al modelo base y agravado por la divergencia de tokens introducida por la cuantizacion. No se han publicado evaluaciones de veracidad.
- Calibracion sesgada: las 256 muestras de calibracion son de predominio coreano. El comportamiento en castellano u otros idiomas no esta respaldado por ninguna metrica publicada y podria degradarse mas que en ingles o coreano.
- Ambiguedad de licencia: las etiquetas del repositorio indican apache-2.0, mientras que la propia model card remite a la licencia Gemma 4 y afirma que el uso se rige por ella. Antes de un uso comercial hay que verificar y cumplir la licencia de Gemma 4, que es la del modelo del que deriva.
- Restriccion de hardware: el formato NVFP4 requiere tensor cores FP4 para rendir; en GPU sin ese soporte el modelo carga pero pierde su ventaja y puede degradar el rendimiento frente a alternativas INT4/INT8.
- Sesgos del autor: es una cuantizacion de la comunidad con 0 descargas y 0 likes en el momento de la consulta, sin revision por pares ni validacion externa.
- Ausencia de benchmarks de tareas: no hay MMLU, HumanEval, GSM8K ni metricas multimodales publicadas, por lo que no se puede estimar su calidad absoluta.
- Contexto desconocido: se desconoce la longitud de contexto soportada, lo que impide dimensionar cache KV y planificar despliegues con documentos largos.
- Tool calling y capacidades de agente no confirmadas: si el pipeline de produccion depende de function calling, hay que validarlo antes de adoptar esta variante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-26B-A4B-it-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- La busqueda web realizada no ha devuelto enlaces tecnicos relevantes para este modelo (los resultados obtenidos eran contenidos no relacionados y sin valor documental).
