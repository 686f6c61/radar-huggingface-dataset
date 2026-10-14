# mradermacher/K2-Horizon-3.7B-heretic-GGUF

## Resumen

K2-Horizon-3.7B-heretic-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo Avicennasis/K2-Horizon-3.7B-heretic, publicado por el usuario mradermacher, especializado en convertir pesos de HuggingFace a GGUF para su uso en llama.cpp y derivados. El modelo base se distribuye como una variante "abliterated" y "uncensored" (etiquetada con heretic), es decir, con las direcciones de rechazo eliminadas mediante técnicas de ablación, lo que elimina las negativas del modelo a responder determinados prompts. Está pensado para inferencia local en hardware de consumo y despliegues ligeros.

Se trata de un modelo multimodal en cuanto a idiomas: soporta inglés (en) y chino (zh), con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio contiene 12 cuantizaciones estáticas que van desde Q2_K (2,2 GB) hasta f16 (10,2 GB), cubriendo prácticamente todo el espectro de VRAM disponible. Existe además un repositorio paralelo con cuantizaciones ponderadas/imatrix (i1).

El dato más relevante y a vigilar es la discrepancia de nomenclatura: mientras el nombre del repositorio indica "3.7B", el recuento real de parámetros publicado en el campo de safetensors asciende a 5.058.255.360 (~5,06 B). El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria (fechada en octubre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura; se trata de un modelo transformers de tipo decoder-only, sin confirmar si incorpora MoE, SSM o atención híbrida) |
| Parametros totales | 5.058.255.360 (~5,06 B) segun safetensors; el nombre del repositorio indica 3.7B |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (2,2 GB), Q3_K_S (2,5 GB), Q3_K_M (2,7 GB), Q3_K_L (2,9 GB), IQ4_XS (3,0 GB), Q4_K_S (3,1 GB), Q4_K_M (3,3 GB), Q5_K_S (3,7 GB), Q5_K_M (3,7 GB), Q6_K (4,3 GB), Q8_0 (5,5 GB), f16 (10,2 GB); existen cuantizaciones ponderadas/imatrix en el repositorio i1 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (generado a partir de pesos HuggingFace del modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base (Avicennasis/K2-Horizon-3.7B-heretic). El repositorio cuantizado se limita a documentar el proceso de conversion a GGUF realizado por mradermacher, con el marcador interno `convert_type: hf` y `output_tensor_quantised: 1`, lo que indica que la conversion se hizo desde un checkpoint de HuggingFace y que la cuantizacion afecta a los tensores de salida. No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF, DPO o similares en la informacion proporcionada.

La innovacion tecnica principal del modelo base, segun las etiquetas del repositorio, es su condicion de modelo "abliterated" y "uncensored", generado mediante la tecnica de "heretic" (ablacion de direcciones de rechazo). Este proceso modifica los pesos para eliminar la tendencia del modelo a negarse a responder determinadas peticiones, manteniendo el resto de capacidades lo mas intactas posible. No se documentan en este repositorio los detalles del procedimiento de ablacion aplicado al modelo original.

## Capacidades

- Generacion de texto conversacional en ingles y chino, segun las etiquetas del repositorio (`conversational`).
- Comportamiento sin censura a nivel de pesos: el modelo no aplica las negativas tipicas de los modelos alineados por RLHF, al haber sido abliterated.
- Soporte de conversaciones multi-turno (etiqueta `conversational` en HuggingFace).
- Compatibilidad con endpoints y despliegue mediante herramientas de inferencia estandar (etiqueta `endpoints_compatible`).
- Uso como modelo base para ajuste fino adicional o para tareas de generacion creativa sin restricciones.
- Capacidades de razonamiento, codigo, matematicas o tool calling: no disponible en la informacion del repositorio.
- Capacidades de vision o audio: no disponible en la informacion del repositorio.
- Modo thinking explicito: no disponible en la informacion del repositorio.

## Casos de uso

- Generacion creativa sin filtros: el caracter abliterated permite producir narrativa, guiones o dialogos sobre tematicas que los modelos alineados rechazan, sin que el modelo se niegue a responder.
- Investigacion sobre alineacion y seguridad: util como objeto de estudio para comparar el comportamiento de un modelo con las direcciones de rechazo ablacionadas frente a su version original alineada.
- Asistente conversacional local en ingles o chino: su tamano (~5 B de parametros) permite ejecutarlo en una GPU de consumo con cuantizaciones Q4, lo que lo hace adecuado para prototipos de chatbots desplegados en local sin conexion.
- Redaccion y reescritura de textos en ingles y chino: tareas de parafraseo, resumen y generacion de borradores donde la ventana de contexto del modelo (no documentada) sea suficiente.
- Experimentacion en pipelines de llama.cpp, Ollama o LM Studio: al estar en formato GGUF con 12 niveles de cuantizacion, permite ajustar el equilibrio entre calidad y consumo de VRAM segun el hardware disponible.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de perplexity entre Q2_K, Q4_K_M y Q8_0 sobre el mismo modelo base en tareas controladas.
- Base para fine-tuning orientado a dominios concretos (por ejemplo, jerga tecnica en chino) partiendo de los pesos completos del modelo original en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (pesos + overhead de contexto y cache KV):
  - Q2_K (2,2 GB): ~3 GB de VRAM, ejecutable en GPUs de 4-6 GB.
  - Q3_K_M (2,7 GB): ~3,5-4 GB.
  - IQ4_XS / Q4_K_S (3,0-3,1 GB): ~4-5 GB.
  - Q4_K_M (3,3 GB): ~4,5-5 GB, recomendado para GPUs de 6-8 GB.
  - Q5_K_M (3,7 GB): ~5-6 GB.
  - Q6_K (4,3 GB): ~6 GB.
  - Q8_0 (5,5 GB): ~7 GB.
  - f16 (10,2 GB): ~11-12 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) es suficiente para las cuantizaciones Q4 y Q5. Para f16 se recomienda al menos 12-16 GB (RTX 4080/4090, A4000, A5000). Las GPUs de datacenter (A100, H100) son sobredimensionadas para este tamano, salvo por despliegue en lote.
- Caben en GPU de consumo: si, todas las cuantizaciones hasta Q8_0 caben en GPUs consumer de 8 GB o mas; f16 requiere 12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con la API de OpenAI (gracias a la etiqueta `endpoints_compatible`).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| K2-Horizon-3.7B-heretic (este) | ~5,06 B (nombre indica 3.7B) | no disponible | Apache 2.0 | Si (este repositorio) | Abliterated / uncensored, idiomas en y zh |
| Avicennasis/K2-Horizon-3.7B-heretic | no disponible (modelo base) | no disponible | Apache 2.0 | No (pesos HuggingFace) | Modelo original sin cuantizar |
| Alternativas de la misma categoria (modelos abliterated de ~3-5 B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparativa cuantitativa fiable |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento rigurosa.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre del repositorio indica 3.7B pero el recuento real de parametros es de ~5,06 B. Conviene verificar el modelo base antes de dimensionar hardware.
- Modelo abliterated / uncensored: la eliminacion de las direcciones de rechazo incrementa el riesgo de generar contenido danino, ilegal, ofensivo o factualmente incorrecto. No es adecuado para despliegues en produccion orientados a publico general sin moderacion externa.
- Riesgo de alucinacion: inherente a los modelos de este tamano; no se han publicado evaluaciones de fidelidad factual en la informacion disponible.
- Idiomas limitados a ingles y chino (en, zh). No hay soporte declarado de castellano ni de otros idiomas, por lo que el rendimiento en espanol sera previsiblemente bajo.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de retrieval con contexto extenso.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y se creo en octubre de 2026, por lo que no hay evidencia independiente de calidad ni de reproducibilidad.
- Licencia Apache 2.0 en el repositorio de cuantizacion: permite uso comercial, pero conviene confirmar que el modelo base mantiene la misma licencia y que no impone restricciones adicionales.
- La cuantizacion Q3_K_M esta marcada por el propio autor como "lower quality"; las cuantizaciones por debajo de Q4 deberian usarse solo cuando la VRAM sea muy limitada.
- No se documentan sesgos especificos del dataset de entrenamiento; al no conocerse la composicion de los datos, los sesgos de genero, raza o ideologia no pueden acotarse.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/K2-Horizon-3.7B-heretic-GGUF
- Modelo base: https://huggingface.co/Avicennasis/K2-Horizon-3.7B-heretic
- Cuantizaciones ponderadas / imatrix: https://huggingface.co/mradermacher/K2-Horizon-3.7B-heretic-i1-GGUF
- Pagina de resumen de descargas del cuantizador: https://hf.tst.eu/model#K2-Horizon-3.7B-heretic-GGUF
- Peticiones de modelos a mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplexity por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Sitio del patrocinador (nethype GmbH): https://www.nethype.de/
