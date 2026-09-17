# jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-3-0-2-bioavailability-ma-BEST

## Resumen

El modelo `jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-3-0-2-bioavailability-ma-BEST` es un ajuste fino (fine-tune) de la familia Qwen3 publicado por el usuario jiosephlee en HuggingFace. Con 8.201.221.120 parametros totales, se trata de un transformer denso orientado a generacion de texto, pero especializado en una tarea concreta de quimica computacional: la transferencia de moleculas condicionada por contexto, en este caso aplicada a la prediccion de biodisponibilidad oral. El autor lo presenta como el mejor checkpoint seleccionado por validacion de la ejecucion V10.3.0.2 de tipo "mixed-continuous".

El modelo parte de `jiosephlee/Intern-S1-mini-lm`, un checkpoint base derivado a su vez del ecosistema Intern-S1-mini, y ha sido reentrenado durante 10 epocas con semilla 42 y funcion de perdida de objetivos suaves (soft-target loss). La metrica de seleccion fue `knn_binary_macro_f1_at_5` sobre validacion, eligiendose el paso de optimizacion 160 como mejor checkpoint. Esto lo convierte en una pieza especifica dentro de un flujo de trabajo de "assay transfer", es decir, transferencia de conocimiento entre ensayos quimicos.

Su relevancia es acotada y muy vertical: no es un modelo generalista de proposito multiple, sino un artefacto de investigacion para experimentos de modelado molecular y prediccion de propiedades farmacocineticas (ADME). Dado que tiene 0 descargas y 0 likes, y que su model card es minima, se trata de un modelo experimental mas que de una herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta `qwen3` en los metadatos) |
| Parametros totales | 8.201.221.120 (~8,2 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors en precision completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | jiosephlee/Intern-S1-mini-lm (revision fcb667c380ae01f57693a45b4b5c2d331052a107) |
| Tamano del repositorio | 16,4 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La unica informacion disponible sobre la arquitectura proviene de la etiqueta `qwen3` presente en los metadatos del repositorio, lo que apunta a una arquitectura transformer densa de la familia Qwen3, con aproximadamente 8,2 mil millones de parametros y pesos en formato safetensors. No se detalla en la informacion proporcionada el numero de capas, dimensiones ocultas, tipo de atencion, uso de RoPE, ni si incorpora GQA u otras optimizaciones. Tampoco hay datos sobre la longitud de contexto nativa, que deberia heredarse del modelo base `Intern-S1-mini-lm`.

En cuanto al entrenamiento, el autor especifica que se realizo un ajuste fino durante 10 epocas con semilla 42 y funcion de perdida de objetivos suaves (soft-target loss). Los datos de entrenamiento provienen de un artefacto interno denominado "V10.3.0.2 Bioavailability Ma mixed-continuous", con el identificador `jiosephlee/context-conditioned-molecule-transfer-v10.3.0.2-bioavailability-ma-mixed-continuous-intern`, que no esta publicado como dataset en el Hub. La seleccion del mejor checkpoint se hizo mediante la metrica `knn_binary_macro_f1_at_5` sobre el conjunto de validacion, escogiendo el paso de optimizacion 160. No hay informacion sobre composicion exacta del dataset, numero de tokens, ni tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por contexto, con la particularidad de estar especializada en transferencia de moleculas entre ensayos (assay transfer).
- Prediccion de biodisponibilidad oral como tarea downstream concreta, mediante senales de tipo clasificacion binaria ordenada (metrica kNN binaria a k=5).
- Ranking y puntuacion de candidatos moleculares, segun las metricas NDCG@5 y Spearman reportadas por el autor.
- Formato conversacional (etiqueta `conversational`), lo que sugiere plantillas de chat heredadas del modelo base.
- Compatible con Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`).
- Capacidades multilingues: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Modo de razonamiento explicito ("thinking mode"), vision o audio: no disponible.

## Casos de uso

- Cribado virtual de farmacos: el modelo puede puntuar moleculas candidatas segun su probabilidad de biodisponibilidad oral, integrandose en un pipeline de priorizacion previo a ensayos in vitro.
- Transferencia entre ensayos (assay transfer): permite extrapolar resultados de un ensayo quimico a otro con distinto protocolo, usando el contexto del ensayo origen como condicion de entrada.
- Prediccion ADME temprana: como componente de un sistema que estime propiedades farmacocineticas basicas antes de fases costosas de desarrollo.
- Investigacion en modelado molecular: servir de checkpoint de referencia para reproducir o comparar experimentos de context-conditioned molecule transfer.
- Generacion de rankings de candidatos: gracias a las metricas de ordenacion (NDCG@5, Spearman) puede usarse para ordenar bibliotecas quimicas por relevancia.
- Experimentacion academica con Qwen3 ajustado: util como punto de partida para estudiar como se comporta un transformer de 8B en tareas quimicas especificas frente a modelos generalistas.
- Prototipado de APIs de quimica computacional: al ser compatible con TGI y endpoints, puede desplegarse como servicio interno de puntuacion molecular.

## Benchmarks y rendimiento

Los unicos resultados disponibles son las metricas de validacion y test reportadas por el autor en la model card:

| Split | Macro-F1@5 | NDCG@5 | Spearman |
|---|---:|---:|---:|
| Validacion | 0.6401 | 0.7342 | 0.3561 |
| Test | 0.7066 | 0.7566 | 0.4096 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. No se proporcionan comparaciones con otros modelos en la documentacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,2 mil millones de parametros en precision completa (fp16/bf16) se requieren aproximadamente 16-17 GB solo para los pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria los 9-10 GB, y en 4 bits unos 5-6 GB. Estas cifras son estimaciones derivadas del tamano del modelo, no datos aportados por el autor.
- GPU recomendadas: para fp16 sin cuantizar, una A100 40 GB, H100 o L40S resultan holgadas; una RTX 4090 (24 GB) tambien es suficiente en fp16. Para cuantizacion 4 bits cabria en GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4070, etc.).
- Opciones de despliegue: la etiqueta `text-generation-inference` indica compatibilidad con TGI; tambien puede servirse con vLLM, transformers nativo, o convertirse a GGUF para llama.cpp/Ollama (aunque no se confirma que existan pesos GGUF publicados).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion facilitada. El unico punto de referencia mencionado es su modelo base `jiosephlee/Intern-S1-mini-lm`, del que no se aportan especificaciones tecnicas, contexto o rendimiento. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo experimental: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validacion por parte de la comunidad.
- Licencia no especificada: al no indicarse licencia, no puede asumirse permiso para uso comercial ni redistribucion.
- Dominio muy restringido: especializado en transferencia de moleculas y biodisponibilidad oral, por lo que su uso generalista degradaria respecto al modelo base.
- Riesgo de alucinacion: al ser un modelo generativo de 8B ajustado sobre un dataset interno no publicado, puede producir predicciones quimicas plausibles pero incorrectas sin senal de incertidumbre calibrada (el Spearman de 0.35-0.41 en validacion/test sugiere correlacion moderada).
- Datos de entrenamiento no publicados: el dataset es un artefacto local, lo que impide auditar sesgos de composicion o posibles fugas entre train y test.
- Sin informacion sobre idiomas: no puede garantizarse un comportamiento multilingue correcto.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin verificacion previa.
- Metricas auto-reportadas por el autor, sin replicacion independiente.

## Enlaces

- HuggingFace: https://huggingface.co/jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-3-0-2-bioavailability-ma-BEST
- Modelo base: https://huggingface.co/jiosephlee/Intern-S1-mini-lm
- Revision del modelo base: fcb667c380ae01f57693a45b4b5c2d331052a107 (no se ha facilitado URL directa)
- Dataset de entrenamiento (no publicado): jiosephlee/context-conditioned-molecule-transfer-v10.3.0.2-bioavailability-ma-mixed-continuous-intern
- Los resultados de la busqueda web no contienen enlaces relevantes para este modelo (corresponden a entradas lexicograficas del digrafo "ll" en italiano e ingles).
