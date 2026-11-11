# mradermacher/Seed-OSS-36B-Base-GGUF

## Resumen

Seed-OSS-36B-Base-GGUF es la distribucion en formato GGUF del modelo base Seed-OSS-36B-Base, desarrollado originalmente por ByteDance-Seed y cuantizado por el usuario mradermacher. El modelo original es un transformer denso de 36.151.104.512 parametros (aproximadamente 36,15 mil millones) publicado bajo licencia Apache 2.0, lo que lo convierte en una opcion atractiva para despliegue local y en entornos con requisitos de soberania de datos. Esta version GGUF permite ejecutar el modelo con llama.cpp y otros runners compatibles en hardware consumer, algo inviable con los pesos completos en safetensors.

La relevancia de esta ficha radica en que el repositorio ofrece un abanico de cuantizaciones estaticas (desde Q2_K de 13,7 GB hasta Q8_0 de 38,5 GB) que cubren desde GPUs consumer de gama media hasta estaciones de trabajo con multiples aceleradores. El modelo base esta etiquetado unicamente para ingles, aunque al tratarse de un modelo base sin ajuste fino instruct, su comportamiento multilingue depende del corpus de preentrenamiento original, no documentado en la informacion disponible.

Es importante subrayar que se trata de un modelo *base*, no instruct ni chat: no incorpora alineamiento RLHF/DPO ni plantilla de conversacion, por lo que su uso directo requiere prompting de completado o un ajuste fino posterior. El repositorio fue creado el 25 de agosto de 2025 y actualizado el 11 de noviembre de 2026, con 743 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles de capas y atencion no disponibles) |
| Parametros totales | 36.151.104.512 (~36,15 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo i1 |
| Idiomas soportados | en (segun etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer denso de aproximadamente 36,15 mil millones de parametros. No se especifican el numero de capas, dimensiones ocultas, mecanismo de atencion (MHA, GQA, MLA), funcion de activacion ni innovaciones como atencion lineal o decodificacion especulativa. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste instruct, lo que es coherente con su naturaleza de modelo *base*.

En cuanto a la cuantizacion, el repositorio de mradermacher aplica cuantizaciones estaticas estandar sobre los pesos en formato Hugging Face convertidos a GGUF (`convert_type: hf`). El autor indica que las cuantizaciones ponderadas con imatrix estan disponibles en un repositorio separado (`mradermacher/Seed-OSS-36B-Base-i1-GGUF`), que suelen ofrecer mejor calidad por tamano que las estaticas equivalentes. No se proporcionan detalles sobre el proceso de calibracion ni sobre la perplexidad resultante de cada cuantizacion en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva: al ser un modelo base, completa secuencias de texto sin instrucciones ni formato conversacional.
- Razonamiento y conocimiento general: capacidad esperable por su tamano (~36 B), aunque sin benchmarks publicados en la informacion disponible no se puede cuantificar.
- Codigo y matematicas: no se documenta un rendimiento especifico; el modelo base puede completar codigo, pero no hay evidencia de capacidades destacadas en la informacion disponible.
- Tool calling / function calling: no disponible de forma nativa (requiere ajuste instruct o prompting estructurado).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa en un modelo base.
- Capacidades multilingues: el repositorio solo declara ingles; el soporte real de otros idiomas no esta documentado.
- Capacidades especiales (thinking mode, vision, audio): no disponibles segun la informacion proporcionada.
- Compatibilidad con vLLM: el repositorio incluye la etiqueta `vllm` y `endpoints_compatible`, lo que sugiere soporte para despliegue en servidores compatibles con la API de endpoints.

## Casos de uso

- Ajuste fino supervisado (SFT) para dominios verticales: al ser un modelo base Apache 2.0 de ~36 B, es un punto de partida adecuado para fine-tuning con LoRA o QLoRA sobre corpus especializados (legal, medico, financiero) sin restricciones de licencia comercial.
- Investigacion en interpretabilidad y mecanistica: el acceso a pesos abiertos y a cuantizaciones de distintos tamanos permite estudiar el efecto de la precision numerica en las representaciones internas.
- Generacion de texto en local con llama.cpp: las cuantizaciones Q4_K_M (21,9 GB) y Q5_K_M (25,7 GB) permiten ejecutar el modelo en una unica GPU de 24-32 GB o en configuraciones CPU+GPU con RAM suficiente.
- Destilacion de conocimiento: un modelo de 36 B puede actuar como profesor para generar datos sinteticos destinados a entrenar modelos mas pequenos, aprovechando su licencia permisiva.
- Completado de codigo en pipelines internos: integrable via llama.cpp o vLLM en herramientas de autocompletado, siempre que se valide la calidad con evaluaciones propias al no haber benchmarks publicos.
- Despliegue en entornos con soberania de datos: al poder ejecutarse en hardware propio y con licencia Apache 2.0, encaja en organizaciones que no pueden enviar datos a APIs externas.
- Base para modelos instruct propios: punto de partida para construir un asistente conversacional mediante SFT y DPO, ya que el modelo original no incluye alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni perplexidad por cuantizacion, y el modelo base original no aporta datos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin overhead de contexto):
  - Q2_K: ~13,7 GB
  - Q3_K_S: ~16,0 GB
  - Q3_K_M: ~17,7 GB
  - Q3_K_L: ~19,2 GB
  - IQ4_XS: ~19,8 GB
  - Q4_K_S: ~20,8 GB
  - Q4_K_M: ~21,9 GB
  - Q5_K_S: ~25,1 GB
  - Q5_K_M: ~25,7 GB
  - Q6_K: ~29,8 GB
  - Q8_0: ~38,5 GB
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) con offload parcial; para Q6_K y Q8_0, A100 40 GB, H100 80 GB o configuraciones multi-GPU.
- Cabe en GPU consumer: si, en RTX 3090/4090 con cuantizaciones Q4 o inferiores y offload parcial de capas a CPU; Q2_K y Q3_K_S pueden caber en GPUs de 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), vLLM (etiqueta `vllm` presente), servidores compatibles con endpoints OpenAI. El repositorio no documenta TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen fuertemente del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Seed-OSS-36B-Base (este, GGUF) | ~36,15 B | no disponible | Apache 2.0 | GGUF | Modelo base, solo ingles declarado |
| ByteDance-Seed/Seed-OSS-36B-Base | ~36,15 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Alternativas de ~30-40 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria (por ejemplo, otros modelos densos de 30-40 B con licencia permisiva). Se recomienda consultar benchmarks independientes del modelo base original antes de elegir entre alternativas.

## Limitaciones y advertencias

- Es un modelo *base*: no esta alineado para instrucciones ni conversacion; usarlo directamente como asistente produce respuestas sin formato y potencialmente inseguras.
- Sesgos conocidos: no documentados en la informacion disponible, pero esperables en cualquier modelo preentrenado con corpus web a gran escala.
- Riesgo de alucinacion: alto en tareas factuales, especialmente sin ajuste instruct ni tecnicas de retrieval.
- Limitaciones de idioma: el repositorio solo declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: la longitud de contexto no esta disponible, lo que impide planificar casos de uso con ventanas largas sin verificacion empirica.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de la licencia del modelo base original y de las dependencias de inferencia (llama.cpp, vLLM).
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio rapido y Q6_K/Q8_0 para maxima fidelidad.
- El repositorio de cuantizacion tiene muy baja adopcion (743 descargas, 1 like), por lo que no hay validacion comunitaria extensa de la calidad de cada quant.
- Para produccion se recomienda validar perplexidad y evaluaciones de tarea con el quant elegido, ya que no hay datos publicados de degradacion por cuantizacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Seed-OSS-36B-Base-GGUF
- Modelo base original: https://huggingface.co/ByteDance-Seed/Seed-OSS-36B-Base
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Seed-OSS-36B-Base-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Seed-OSS-36B-Base-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplexidad por quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
