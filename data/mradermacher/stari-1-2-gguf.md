# mradermacher/stari-1.2-GGUF

## Resumen

stari-1.2 es un modelo de generacion de texto de aproximadamente 4.022 millones de parametros (4,02 B) publicado por el usuario HIHIHIHIHhaihihihaih y cuantizado a GGUF por mradermacher. La informacion disponible en la model card del repositorio cuantizado es muy limitada: se identifica como un modelo basado en la familia Qwen3 (tag `qwen3`), con licencia Apache 2.0 y soporte declarado unicamente para ingles. No se documentan en la informacion proporcionada ni la longitud de contexto, ni la composicion del dataset de entrenamiento, ni los resultados de evaluacion.

El interes practico de esta publicacion no esta en el modelo original sino en el paquete de cuantizaciones estaticas GGUF que ofrece mradermacher, que cubre desde Q2_K (1,8 GB) hasta f16 (8,2 GB). Esto permite ejecutar un modelo de 4 B de parametros en hardware de consumo, algo relevante para desarrolladores que quieren desplegar inferencia local sin GPU de datacenter. La ausencia de cuantizaciones ponderadas o con imatrix en el momento de la publicacion se indica explicitamente en la model card.

Se trata, por tanto, de un modelo pequeno orientado a generacion de texto conversacional, con un ecosistema de cuantizaciones amplio pero con documentacion tecnica escasa. Cualquier evaluacion rigurosa de su calidad requiere consultar el modelo base original, ya que la model card del repositorio GGUF no aporta datos de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun tag `qwen3`); detalles no disponibles |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base `HIHIHIHIHhaihihihaih/stari-1.2`. El unico indicio tecnico es la etiqueta `qwen3`, que sugiere una arquitectura de la familia Qwen3 con atencion por query/key/value agrupadas y, probablemente, normalizacion RMSNorm y activacion SwiGLU, aunque estos extremos no se confirman en la documentacion disponible. El recuento de 4.022.468.096 parametros procede de los metadatos de safetensors del modelo base.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El repositorio cuantizado solo aporta los ficheros GGUF generados mediante el flujo de trabajo de mradermacher (conversion desde safetensors y cuantizacion estatica en varios niveles), sin notas sobre el proceso de entrenamiento del modelo original.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento y generacion de codigo: presumiblemente heredadas de la familia Qwen3, aunque no se documentan explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en portatil o estacion de trabajo: con la cuantizacion Q4_K_M (2,6 GB) el modelo cabe en GPUs de consumo con 6-8 GB de VRAM o incluso en CPU con RAM suficiente, lo que permite prototipar asistentes conversacionales sin conexion.
- Despliegue en dispositivos con recursos limitados: la cuantizacion Q2_K (1,8 GB) permite ejecutar el modelo en equipos con poca memoria, util para pruebas de concepto o demos offline.
- Generacion de texto en ingles para tareas de redaccion asistida: al estar entrenado y evaluado (segun metadatos) en ingles, es adecuado para resumenes, parafrasis y borradores en ese idioma.
- Chatbot de soporte en ingles: su etiqueta `conversational` lo orienta a dialogos multi-turno, aunque la falta de datos sobre contexto maximo obliga a validar la ventana real antes de usarlo en produccion.
- Filtrado y clasificacion de texto: modelos de 4 B suelen emplearse para tareas de etiquetado y moderacion en ingles con baja latencia en GPU de consumo.
- Base para fine-tuning ligero: al ser Apache 2.0 y de tamano reducido, puede servir como punto de partida para ajustes especificos de dominio en ingles, con requisitos de VRAM moderados (una sola GPU de 24 GB cubre el fine-tuning con LoRA).
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce niveles de cuantizacion, lo que permite medir el impacto de la compresion en la calidad de salida sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: ~2,2 GB
  - Q3_K_M: ~2,6 GB
  - IQ4_XS: ~2,8 GB
  - Q4_K_M: ~3,0 GB
  - Q5_K_M: ~3,4 GB
  - Q6_K: ~3,8 GB
  - Q8_0: ~4,8 GB
  - f16: ~8,6 GB
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para las versiones de mayor precision.
- Cabe en GPU de consumo: si, desde una GTX 1650 de 4 GB (con Q2_K) hasta una RTX 4090 (con f16). Las cuantizaciones Q4_K_S y Q4_K_M son las marcadas como "fast, recommended" por el autor.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (etiqueta `text-generation-inference`), y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| stari-1.2 (este) | 4,02 B | no disponible | Apache 2.0 | GGUF, safetensors | Cuantizaciones estaticas de mradermacher |
| Qwen3-4B (referencia de familia) | ~4 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Familia indicada por el tag `qwen3`; datos no verificados en la informacion proporcionada |
| Otros modelos de ~4 B en GGUF | ~4 B | no disponible | variable | GGUF | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para una comparativa cuantitativa de rendimiento con alternativas concretas.

## Limitaciones y advertencias

- Documentacion muy escasa: la model card del repositorio cuantizado no describe arquitectura, entrenamiento ni evaluacion del modelo base, lo que dificulta validar su calidad antes de usarlo en produccion.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Ventana de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificar empiricamente el limite real.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no se aportan datos de evaluacion de fidelidad.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigacion; al no conocerse la composicion del dataset, no se puede evaluar el riesgo de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base original, ya que el repositorio cuantizado no detalla restricciones adicionales.
- Cuantizaciones de baja precision: Q2_K y Q3_K_M pueden degradar notablemente la calidad; el autor marca Q3_K_M como "lower quality".
- Sin cuantizaciones ponderadas ni imatrix en el momento de la publicacion, lo que puede afectar a la calidad relativa de las cuantizaciones de menor tamano.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/stari-1.2-GGUF
- Modelo base: https://huggingface.co/HIHIHIHIHhaihihihaih/stari-1.2
- Pagina de descargas del autor: https://hf.tst.eu/model#stari-1.2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
