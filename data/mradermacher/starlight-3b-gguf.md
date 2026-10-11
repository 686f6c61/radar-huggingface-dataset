# mradermacher/Starlight-3B-GGUF

## Resumen

Starlight-3B-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo base Sethblocks/Starlight-3B, un modelo de lenguaje de aproximadamente 2.697 millones de parametros (2,7B) etiquetado como conversacional y con soporte declarado unicamente para ingles. No se trata de un modelo entrenado por mradermacher, sino de una redistribucion optimizada para inferencia local en CPU y GPU de gama baja mediante llama.cpp y sus derivados.

El valor practico de esta publicacion reside en la variedad de cuantizaciones ofrecidas: doce variantes que van desde Q2_K (1,2 GB) hasta f16 (5,5 GB), lo que permite desplegar el modelo en equipos con muy poca VRAM o directamente en CPU. Todas las variantes estan publicadas como archivos GGUF independientes dentro de un repositorio de 24,3 GB en total.

La relevancia de esta ficha es limitada por la ausencia de informacion tecnica sobre el modelo original: no se dispone de datos sobre arquitectura, longitud de contexto, composicion del dataset de entrenamiento, licencia ni benchmarks. Cualquier evaluacion rigurosa deberia consultar la model card de Sethblocks/Starlight-3B, que no forma parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.697.198.592 (2,7B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Sethblocks/Starlight-3B en los datos proporcionados. El etiquetado del repositorio (transformers, gguf, conversational) y el hecho de que exista una conversion a GGUF son compatibles con un transformer decoder de tipo autoregresivo, pero no hay confirmacion explicita en la model card.

Tampoco se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La unica innovacion tecnica documentada en este repositorio es el propio proceso de cuantizacion: mradermacher indica que se trata de cuantizaciones estaticas y que, en el momento de la publicacion, no hay planes confirmados de generar variantes ponderadas o con imatrix (quants basados en matriz de importancia), aunque invita a solicitarlas mediante una discusion de la comunidad.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- No hay informacion publicada sobre soporte de tool calling o function calling.
- No hay informacion publicada sobre capacidades de agente o razonamiento multi-paso.
- Capacidad multilingue limitada al ingles segun el campo `language` de la model card.
- No se documentan capacidades de vision, audio ni modos de razonamiento explicito (thinking mode).
- El modelo esta marcado como `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de inferencia de HuggingFace.

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: las cuantizaciones Q2_K (1,2 GB) y Q3_K_S (1,4 GB) permiten ejecutar el modelo en CPU con llama.cpp en portatiles modestos, utiles para prototipado rapido sin coste de API.
- Chat conversacional embebido en aplicaciones de escritorio: la variante Q4_K_M (1,8 GB) es la recomendada por el autor por su equilibrio entre velocidad y calidad, adecuada para asistentes locales integrados en herramientas ofimaticas.
- Despliegue en GPUs de gama de entrada: Q4_K_S y Q4_K_M caben holgadamente en GPUs con 4 GB de VRAM, lo que habilita asistentes locales en equipos con GTX 1650 o similares.
- Experimentacion academica con cuantizacion: el repositorio ofrece una gradacion completa de niveles de cuantizacion (de 2 a 16 bits) que permite medir el impacto de la compresion sobre la perplexidad y la calidad de generacion.
- Filtrado y clasificacion de texto en ingles: un modelo de 2,7B puede utilizarse para tareas de etiquetado, resumen corto o extraccion de entidades en pipelines de bajo coste donde no se requiere maxima precision.
- Base para fine-tuning ligero sobre GGUF: aunque requiere flujos especificos (por ejemplo, conversion a safetensors o uso de tecnicas LoRA compatibles), el modelo puede servir como punto de partida para adaptaciones de dominio en ingles.
- Evaluacion comparativa de cuantizaciones en produccion: permite decidir que nivel de cuantizacion ofrece el mejor compromiso entre latencia y calidad antes de fijar una version para un servicio interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (derivada del tamano de los archivos GGUF, sin incluir el overhead de contexto):
  - Q2_K: 1,2 GB
  - Q3_K_S: 1,4 GB
  - Q3_K_M: 1,5 GB
  - Q3_K_L: 1,6 GB
  - IQ4_XS: 1,6 GB
  - Q4_K_S: 1,7 GB
  - Q4_K_M: 1,8 GB
  - Q5_K_S / Q5_K_M: 2,0 GB
  - Q6_K: 2,3 GB
  - Q8_0: 3,0 GB
  - f16: 5,5 GB
- Cabe en practicamente cualquier GPU de consumo actual: desde 4 GB de VRAM (GTX 1650, RTX 3050) para Q4 en adelante, hasta 6-8 GB para Q8_0 o f16.
- En CPU funciona sin GPU dedicada, especialmente con las cuantizaciones Q2_K a Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y otros runtimes compatibles con GGUF. vLLM tiene soporte GGUF limitado y no es la via recomendada para este formato.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del nivel de cuantizacion y de la longitud de contexto, que tampoco esta documentada.

## Comparativa con modelos similares

No disponible. No se dispone de datos sobre la arquitectura, el contexto, el rendimiento ni la licencia del modelo base Sethblocks/Starlight-3B, por lo que no es posible establecer una comparacion rigurosa con alternativas de la misma categoria (por ejemplo, otros modelos conversacionales de aproximadamente 3B de parametros). El repositorio de busqueda solo muestra otros modelos del mismo autor con nombres similares (mradermacher/Starlight-V3-12B-GGUF, mradermacher/Andy-Starlight-3B-GGUF, mradermacher/Starlight-Synthesis-31B-GGUF), pero sin datos tecnicos que permitan compararlos.

## Limitaciones y advertencias

- La licencia no esta indicada en la informacion disponible. Al ser una cuantizacion derivada de Sethblocks/Starlight-3B, los terminos de uso comercial dependen de la licencia del modelo original, que debe verificarse antes de cualquier despliegue en produccion.
- El modelo solo declara soporte para ingles; no hay evidencia de capacidades multilingues y no se recomienda su uso en castellano u otros idiomas sin evaluacion previa.
- No hay informacion sobre sesgos, datos de entrenamiento ni procesos de alineacion, por lo que el riesgo de respuestas sesgadas u ofensivas es desconocido.
- El riesgo de alucinacion es el habitual en modelos de este tamano (2,7B) y no ha sido cuantificado mediante benchmarks publicados.
- La longitud de contexto es desconocida, lo que impide planificar casos de uso que requieran ventanas largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-10-10; se trata de una publicacion sin validacion por parte de la comunidad.
- No se dispone de cuantizaciones ponderadas ni con imatrix; el propio autor advierte que podrian no aparecer nunca.
- Cualquier uso en produccion deberia ir precedido de una evaluacion propia, dado que no existen benchmarks publicados ni documentacion tecnica del modelo base en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Starlight-3B-GGUF
- Modelo base: https://huggingface.co/Sethblocks/Starlight-3B
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#Starlight-3B-GGUF
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de tipos de cuantizacion de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa patrocinadora del autor: https://www.nethype.de/
- Repositorio relacionado del mismo autor: https://huggingface.co/mradermacher/Starlight-V3-12B-GGUF
- Repositorio relacionado del mismo autor: https://huggingface.co/mradermacher/Andy-Starlight-3B-GGUF
