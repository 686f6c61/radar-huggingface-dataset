# mradermacher/Qwen3.8-27B-Uncensored-v3-i1-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v3-i1-GGUF es una distribucion de cuantizaciones GGUF del modelo InterpreticAI/Qwen3.8-27B-Uncensored-v3, publicada por el usuario mradermacher, conocido en Hugging Face por generar versiones cuantizadas de modelos abiertos. El modelo base es una variante "uncensored" de la familia Qwen3.8, con 26.895.998.464 parametros totales (aproximadamente 27B) y orientada a reducir los mecanismos de censura politica del modelo original, segun las etiquetas de la model card.

El repositorio no contiene pesos en formato original, sino un conjunto de cuantizaciones GGUF generadas con el metodo i1 (imatrix) de mradermacher, que incluye desde IQ1_S hasta Q6_K. El tamano total del repositorio es de 300,3 GB, lo que refleja la acumulacion de todas las variantes. La licencia declarada es apache-2.0 y el unico idioma indicado es el ingles.

La relevancia de esta ficha radica en que permite ejecutar un modelo de aproximadamente 27B en hardware de consumo mediante cuantizaciones de 4 bits (entorno a 16 GB) o incluso en configuraciones mas modestas con cuantizaciones de 2-3 bits, a costa de perdida de calidad. Al ser una cuantizacion de un modelo derivado, no conviene tratarla como un modelo oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.8; no se detalla en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye presumiblemente en safetensors, pero no se confirma en la informacion disponible |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la documentacion proporcionada. Por la nomenclatura Qwen3.8 y el numero de parametros (aproximadamente 27B) se trata de un transformer de la familia Qwen, pero no se confirman detalles como el tipo de atencion, el numero de capas, la dimension oculta ni si emplea mezcla de expertos. Tampoco se especifican los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO.

La unica informacion tecnica concreta es el proceso de cuantizacion: mradermacher ha generado las versiones GGUF con el metodo i1, que utiliza un fichero imatrix (matriz de importancia) para ponderar la cuantizacion de los tensores y mejorar la calidad respecto a cuantizaciones estaticas equivalentes. La model card indica que el modelo base es un modelo de vision ("This is a vision model"), aunque los ficheros mmproj, si existen, se alojan en el repositorio estatico paralelo. No se detalla ninguna innovacion adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational".
- Orientacion a reducir la censura politica del modelo original (etiqueta "political-censorship" y "uncensored"), lo que implica menor rechazo a peticiones que el modelo base filtraria.
- Posible soporte de vision, ya que la model card describe el modelo base como "vision model"; los ficheros mmproj estarian en el repositorio estatico, no en este.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.
- Modo thinking u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en hardware de consumo: con la cuantizacion i1-Q4_K_M (16,6 GB) el modelo puede ejecutarse en una GPU con 24 GB de VRAM o en configuraciones con offload a CPU, lo que permite experimentar con un modelo de aproximadamente 27B sin infraestructura de servidor.
- Investigacion sobre censura y alineacion: al ser una variante "uncensored", sirve para estudiar como cambia el comportamiento del modelo al eliminar filtros, comparando respuestas con el modelo base en tareas sensibles.
- Generacion de texto creativo sin restricciones tematicas: la reduccion de censura permite explorar narrativa, guiones o dialogos sobre temas que el modelo original rechazaria, siempre con supervision humana.
- Prototipado de asistentes conversacionales en ingles: el formato GGUF es compatible con llama.cpp, Ollama y otros runners, lo que facilita integrar el modelo en prototipos locales de chatbot.
- Evaluacion de cuantizaciones: el repositorio incluye desde IQ1_S hasta Q6_K, lo que permite medir la degradacion de calidad y el impacto en perplejidad segun el nivel de compresion, util para decidir el equilibrio tamano/calidad en produccion.
- Pruebas de vision si se descargan los ficheros mmproj del repositorio estatico: permitiria procesar imagenes junto con texto en entornos locales, aunque la informacion sobre esta capacidad es limitada.
- Fine-tuning o experimentacion con modelos derivados: al estar bajo licencia apache-2.0, el modelo puede servir como base para ajustes posteriores o para construir variantes propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,2 GB con i1-IQ1_S, 10,8 GB con i1-Q2_K, 12,7 GB con i1-IQ3_M, 16,6 GB con i1-Q4_K_M, 19,3 GB con i1-Q5_K_M y 22,2 GB con i1-Q6_K. Estas cifras corresponden al tamano de los ficheros y no incluyen el overhead del contexto KV.
- GPU recomendadas: para las cuantizaciones de 4 bits en adelante, una RTX 4090 (24 GB) o una A100/H100 de 40-80 GB permiten cargar el modelo completo en VRAM. Para cuantizaciones de 2-3 bits, una RTX 3090/4090 o incluso GPUs de 12-16 GB pueden ser suficientes.
- Cabe en GPU de consumo: si, en RTX 4090 con Q4_K_M o inferiores; en GPUs de 12-16 GB con cuantizaciones IQ2/IQ3, con perdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que no se garantiza su uso sin conversion.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v3-i1-GGUF (este) | aproximadamente 27B | no disponible | apache-2.0 | GGUF (i1) | Cuantizacion comunitaria de un modelo uncensored |
| mradermacher/Qwen3.8-27B-full-Uncensored-i1-GGUF | aproximadamente 27B | no disponible | no disponible | GGUF (i1) | Variante "full-Uncensored" del mismo autor, sin datos de rendimiento |
| InterpreticAI/Qwen3.8-27B-Uncensored-v3 | aproximadamente 27B | no disponible | apache-2.0 | presumiblemente safetensors | Modelo base sin cuantizar, referencia para comparar calidad |

No se dispone de datos de benchmarks ni de contexto para comparar el rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo esta disenado explicitamente para reducir la censura, lo que puede producir contenido ofensivo, sesgado o inapropiado; no es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al ser una cuantizacion de un modelo derivado, la calidad puede degradarse respecto al original, especialmente en cuantizaciones de 1-3 bits.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- La licencia apache-2.0 permite uso comercial, pero el modelo base es una modificacion no oficial de Qwen, por lo que conviene revisar los terminos del modelo original y de InterpreticAI antes de usarlo en produccion.
- Las cuantizaciones IQ1 e IQ2 estan marcadas por el propio autor como de baja calidad ("for the desperate", "mostly desperate"), por lo que no se recomiendan para tareas que requieran precision.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No se dispone de informacion sobre sesgos especificos, contexto maximo ni comportamiento en tool calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v3-i1-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v3-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-v3-i1-GGUF
- Variante full-Uncensored: https://huggingface.co/mradermacher/Qwen3.8-27B-full-Uncensored-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
