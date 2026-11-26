# mradermacher/Hemlock-Qwen3.8-27B-GGUF

## Resumen

Hemlock-Qwen3.8-27B-GGUF es la distribucion en formato GGUF del modelo Hemlock-Qwen3.8-27B, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos para inferencia local. El modelo base, desarrollado por hemlang, es un merge de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) construido sobre la familia Qwen3, segun indica el propio nombre, y orientado a tareas de codigo y vision. Esta version GGUF anade un fichero mmproj que habilita el procesamiento multimodal de imagenes en llama.cpp y derivados.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 27B con capacidades multimodales en hardware de consumo mediante cuantizaciones que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB). El repositorio ocupa 190,8 GB en total por acumular todas las variantes, pero el usuario solo necesita descargar el fichero de la cuantizacion elegida junto con el mmproj si va a usar vision.

La licencia es Apache 2.0, lo que facilita el uso comercial sin restricciones adicionales. La informacion publicada es escasa: no se detallan la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, segun el nombre del modelo); multimodal con proyector mmproj |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero mmproj separado para vision) |

## Arquitectura y entrenamiento

El modelo base es un merge de la familia Qwen3, segun se deduce del identificador Hemlock-Qwen3.8-27B, con 27,3 mil millones de parametros. La model card del repositorio GGUF no describe la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset; unicamente referencia el dataset hemlang/Hemlock-SFT-combined, lo que sugiere una fase de ajuste supervisado (SFT) sobre el modelo fusionado. No se documenta si hubo RLHF, DPO u otras tecnicas de alineacion.

La innovacion tecnica de esta publicacion concreta es la cuantizacion estatica a GGUF realizada por mradermacher, que incluye un proyector multimodal (mmproj) en dos precisiones para habilitar entrada de imagenes en llama.cpp. El autor indica que no ha generado cuantizaciones con imatrix o ponderadas en el momento de la publicacion, por lo que las versiones disponibles son estaticas y de calidad potencialmente inferior a las imatrix equivalentes. No se detalla la estrategia de fusion (merge) empleada para construir el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el idioma declarado.
- Capacidades de codigo, indicadas por la etiqueta `code` del repositorio.
- Procesamiento de vision: el repositorio incluye ficheros mmproj (Q8_0 y f16) que permiten entrada de imagenes en llama.cpp.
- Es un modelo fusionado (merge), lo que en la practica suele combinar fortalezas de varios modelos de partida.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su despliegue mediante APIs compatibles.
- No se documenta soporte explicito de tool calling, function calling, modo thinking ni agentes multi-paso.

## Casos de uso

- Asistencia de programacion en local: con 27,3B parametros y cuantizacion Q4_K_M (16,9 GB), el modelo puede generar y revisar codigo en un equipo con 24 GB de VRAM, sin depender de APIs externas.
- Analisis de capturas de pantalla y diagramas: gracias al fichero mmproj, se puede alimentar el modelo con imagenes de interfaces o esquemas tecnicos y pedir explicaciones o codigo a partir de ellas en llama.cpp.
- Prototipado de asistentes conversacionales en ingles: la etiqueta `conversational` y el formato GGUF permiten montar un chatbot local con Ollama o llama.cpp en pocos minutos.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en hardware propio con licencia Apache 2.0, es apto para procesar codigo o documentacion sensible sin salir de la infraestructura.
- Experimentacion con merges de modelos: util para investigadores que quieran evaluar el comportamiento de una fusion Qwen3 de 27B frente a los modelos originales, usando las distintas cuantizaciones para comparar calidad frente a coste computacional.
- Pruebas de pipelines multimodales en llama.cpp: el par de ficheros mmproj (Q8_0 y f16) permite medir el impacto en latencia y calidad del proyector segun la precision elegida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (el fichero GGUF debe caber en memoria o en RAM con offload parcial):
  - Q2_K: 11,0 GB
  - Q3_K_S: 12,4 GB; Q3_K_M: 13,6 GB; Q3_K_L: 14,7 GB
  - IQ4_XS: 15,5 GB; Q4_K_S: 15,9 GB; Q4_K_M: 16,9 GB
  - Q5_K_S: 19,1 GB; Q5_K_M: 19,6 GB
  - Q6_K: 22,5 GB
  - Q8_0: 29,1 GB
  - mmproj adicional: 0,7 GB (Q8_0) o 1,0 GB (f16) si se usa vision
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) es suficiente; para Q8_0 conviene una A100 40 GB, H100 o varias GPU consumer. Las cuantizaciones Q2_K a Q3_K caben en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, etc.).
- Cabe en GPU de consumo: si, desde Q2_K (11 GB) en adelante; Q4_K_M es la opcion recomendada por el autor por equilibrio entre velocidad y calidad.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp), con soporte de mmproj para vision. Al ser formato GGUF, no es directamente compatible con vLLM o TGI sin conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Hemlock-Qwen3.8-27B-GGUF | 27,3B | no disponible | si (mmproj) | Apache 2.0 | GGUF |
| Modelos Qwen3 de ~27-32B (originales) | ~27-32B | no disponible en esta ficha | segun variante | Apache 2.0 (mayoria) | safetensors, GGUF |
| Gemma 2 27B | 27B | 8K | no | Gemma license | safetensors, GGUF |

La comparacion con los modelos Qwen3 originales y con Gemma 2 27B es aproximada: no se dispone de datos de rendimiento del modelo Hemlock que permitan establecer diferencias cuantitativas. La ventaja principal de esta publicacion es la disponibilidad inmediata en GGUF con soporte multimodal y licencia Apache 2.0.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- No se publican datos de benchmarks, por lo que la calidad real del merge frente a los modelos Qwen3 originales es desconocida.
- Las cuantizaciones son estaticas; el autor no ha publicado versiones imatrix, que suelen ofrecer mejor calidad por tamano.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la ausencia de documentacion sobre el proceso de alineacion.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.
- El repositorio pesa 190,8 GB en total; conviene descargar solo el fichero necesario para evitar consumo excesivo de disco.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es un merge sin documentacion detallada de su procedencia y datos de entrenamiento, lo que puede complicar auditorias de cumplimiento.
- El soporte de vision depende de llama.cpp y del fichero mmproj; otros runtimes pueden no interpretarlo correctamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Hemlock-Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/hemlang/Hemlock-Qwen3.8-27B
- Dataset de SFT: https://huggingface.co/datasets/hemlang/Hemlock-SFT-combined
- Pagina de descargas del autor: https://hf.tst.eu/model#Hemlock-Qwen3.8-27B-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
