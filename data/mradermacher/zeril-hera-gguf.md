# mradermacher/Zeril-Hera-GGUF

## Resumen

Zeril-Hera es un modelo de lenguaje de gran escala (70.553.706.560 parametros, aproximadamente 70,5 mil millones) publicado por Daemontatox y cuantizado a formato GGUF por mradermacher. Se trata de una cuantizacion estatica del modelo base Daemontatox/Zeril-Hera, distribuida con licencia Apache 2.0 y orientada a inferencia local mediante llama.cpp y entornos compatibles con GGUF. El repositorio incluye doce variantes de cuantizacion que van desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB), lo que permite desplegar el modelo en hardware con distintas capacidades de VRAM.

El modelo esta etiquetado como conversacional y de generacion de texto, con soporte declarado unicamente para ingles. La model card no proporciona informacion sobre la arquitectura interna, la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks, por lo que muchos de los apartados tecnicos de esta ficha quedan marcados como no disponibles. La relevancia de esta publicacion reside en que facilita el acceso a un modelo de 70B en formato GGUF cuantizado, lo que reduce la barrera de hardware para su evaluacion y despliegue en infraestructura propia.

La ficha describe exclusivamente la cuantizacion GGUF; cualquier dato sobre el entrenamiento, la arquitectura o el rendimiento del modelo original debe consultarse en el repositorio del modelo base, que no forma parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como llama y unsloth en la model card) |
| Parametros totales | 70.553.706.560 (aproximadamente 70,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, x-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 481,3 GB |
| Cuantizador | mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf) |
| Modelo base | Daemontatox/Zeril-Hera |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card etiqueta el modelo con las etiquetas `llama` y `unsloth`, lo que sugiere una familia tipo transformer decoder-only afinada con herramientas de Unsloth, pero no se confirma ni el tipo exacto de atencion, ni si emplea atencion lineal, decodificacion especulativa u otras innovaciones. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

La informacion disponible se limita al proceso de cuantizacion: se generaron cuantizaciones estaticas (no imatrix) a partir de los pesos en formato Hugging Face del modelo base, con conversion a GGUF y cuantizacion de tensores de salida. Las cuantizaciones ponderadas por imatrix se distribuyen en un repositorio separado (Zeril-Hera-i1-GGUF).

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` de la model card.
- Generacion de texto de proposito general mediante el pipeline de transformers y text-generation-inference.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte explicito de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingue limitada al ingles segun el campo `language`.
- No se documentan capacidades de codigo o matematicas de forma especifica.

## Casos de uso

- Evaluacion local de un modelo de 70B en formato GGUF: permite probar el modelo en estaciones de trabajo con GPU consumer o servidores modestos usando la cuantizacion Q4_K_M (42,6 GB), sin necesidad de infraestructura de centro de datos.
- Despliegue de un asistente conversacional en ingles sobre llama.cpp: la variante Q4_K_S (40,4 GB) esta marcada como "fast, recommended" y es adecuada para prototipos de chatbots con requisitos moderados de latencia.
- Inferencia en servidores con multiples GPU consumer: las cuantizaciones Q2_K (26,5 GB) y Q3_K_S (31,0 GB) permiten repartir el modelo entre dos GPU de 24 GB, habilitando pruebas de concepto en hardware asequible.
- Generacion de texto por lotes en pipelines internos: al ser un modelo denso de 70B con licencia Apache 2.0, puede integrarse en procesos de sintesis de texto o resumen en ingles sin restricciones de licencia comercial.
- Fine-tuning o evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes que permiten medir el impacto de la cuantizacion en la perplejidad y la calidad de salida sobre el mismo modelo base.
- Investigacion sobre degradacion por cuantizacion: la disponibilidad de cuantizaciones IQ y K-quant del mismo modelo permite estudiar el compromiso entre tamano, velocidad y calidad en un modelo de 70B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K aproximadamente 26,5 GB; Q3_K_S 31,0 GB; Q3_K_M 34,4 GB; Q3_K_L 37,2 GB; IQ4_XS 38,4 GB; Q4_K_S 40,4 GB; Q4_K_M 42,6 GB; Q5_K_S 48,8 GB; Q5_K_M 50,0 GB; Q6_K 58,0 GB; Q8_0 75,1 GB. Hay que anadir el overhead de contexto y de la cache KV.
- GPU recomendadas: no disponibles de forma explicita. Por tamano, las cuantizaciones Q4 requieren al menos 48 GB de VRAM (por ejemplo, A6000, A100 80GB o dos RTX 4090 de 24 GB). Q8_0 requiere aproximadamente 80 GB, lo que encaja en una A100 80GB o H100.
- Cabe en GPU consumer: Q2_K y Q3_K_S pueden caber en configuraciones de dos GPU de 24 GB (RTX 3090/4090) mediante reparto de capas en llama.cpp. Una sola RTX 4090 de 24 GB no es suficiente para ninguna cuantizacion completa.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), text-generation-inference (segun etiqueta) y entornos compatibles con GGUF. vLLM no esta confirmado para este repositorio GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de arquitectura del modelo base que permitan una comparativa rigurosa. A continuacion se ofrece una comparativa limitada a parametros y formato con alternativas de la misma categoria (modelos densos de aproximadamente 70B en GGUF):

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| Zeril-Hera (esta ficha) | 70,5 B | no disponible | Apache 2.0 | Si (12 variantes) | Cuantizado por mradermacher |
| Llama 3.1 70B Instruct | 70,6 B | 128K | Llama 3.1 Community | Si | Referencia de la familia llama |
| Qwen2.5 72B Instruct | 72,7 B | 128K | Apache 2.0 | Si | Alternativa Apache 2.0 de tamano similar |
| Mistral Large 2 | 123 B | 128K | Mistral Research | Si | Mayor tamano, no estrictamente comparable |

Los datos de Llama 3.1 70B y Qwen2.5 72B se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento con Zeril-Hera.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni procesos de alineamiento, por lo que el riesgo de sesgo y de alucinacion no puede evaluarse a partir de la informacion disponible.
- El modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta garantizado.
- No se especifica la longitud de contexto, lo que impide planificar casos de uso con contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (Daemontatox/Zeril-Hera) debe verificarse de forma independiente para confirmar que mantiene la misma licencia y que no impone restricciones adicionales.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M marcada como "lower quality") pueden degradar notablemente la coherencia y la precision; se recomienda Q4_K_M o superior para produccion.
- El repositorio ocupa 481,3 GB, por lo que la descarga completa requiere espacio en disco considerable; conviene descargar solo la variante necesaria.
- Los archivos Q6_K y Q8_0 estan divididos en dos partes que deben concatenarse antes de su uso.
- No hay informacion sobre latencia, throughput ni resultados de evaluacion, lo que impide garantizar un rendimiento concreto en produccion.
- El modelo tiene 0 likes y 24 descargas en el momento de la consulta, lo que indica una adopcion muy limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Zeril-Hera-GGUF
- Modelo base: https://huggingface.co/Daemontatox/Zeril-Hera
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Zeril-Hera-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Zeril-Hera-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
