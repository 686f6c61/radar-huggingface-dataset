# mradermacher/Qwen3.8-27B-super-adapter-bf16-i1-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-super-adapter-bf16-i1-GGUF` es una redistribución en formato GGUF del modelo `prithivMLmods/Qwen3.8-27B-super-adapter-bf16`, publicada por el usuario mradermacher, conocido por producir cuantizaciones con imatrix para la comunidad de inferencia local. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF (con cuantizaciones ponderadas mediante imatrix) de un modelo base de 27.320.697.856 parámetros (unos 27,3 mil millones) que, según los tags del repositorio, está orientado a tareas de agentes, tool calling y razonamiento multi-paso.

El modelo base apunta a un perfil de uso muy específico: agentes autónomos y entornos de evaluación tipo *harness* (los datasets citados incluyen `harness-hub/scale800-harbor`, `harness-hub/harness-adapters`, `harness-hub/termgrade-train-harbor` y `ai-and/termgrade-environments`). Los tags mencionan GRPO y async-GRPO, lo que sugiere que el adaptador se entrenó con aprendizaje por refuerzo sobre entornos ejecutables, además de LoRA y merge. La licencia es Apache 2.0, lo que facilita su uso comercial.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 27B orientado a agentes en hardware de consumo o en servidores modestos, gracias a las cuantizaciones GGUF que van desde ~11,3 GB (i1-Q2_K) hasta ~22,5 GB (i1-Q6_K). No obstante, la información pública disponible es escasa: no hay benchmarks, no se detalla la longitud de contexto y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, según el nombre del modelo base); no se detalla en la informacion disponible |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix/weighted); existen quants estaticos en el repo hermano |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo con imatrix y quants ponderados); el modelo base está en bf16/safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de ~27,3 B de parámetros, presumiblemente derivado de la familia Qwen3 por el nombre (`Qwen3.8-27B`), aunque la model card no describe la arquitectura interna ni el número de capas, cabezas de atención o dimensión oculta. Los tags del repositorio incluyen `mtp` (multi-token prediction) y `speculative-decoding`, lo que sugiere que el modelo incorpora cabezas o mecanismos que permiten decodificación especulativa para acelerar la inferencia.

En cuanto al entrenamiento, el modelo base `prithivMLmods/Qwen3.8-27B-super-adapter-bf16` parece ser el resultado de un *merge* de adaptadores LoRA entrenados con GRPO (y async-GRPO) sobre entornos de agentes. Los datasets citados (`scale800-harbor`, `harness-adapters`, `termgrade-train-harbor`, `termgrade-environments`) apuntan a un entrenamiento orientado a tareas de terminal, ejecución de comandos y evaluación en entornos tipo Harbor/OpenEnv. No se dispone del número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF/DPO adicionales. La cuantización imatrix de mradermacher no modifica los pesos originales, solo su representación numérica.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-paso y soporte para agentes (tags `agents`, `hermes`, `opencode`, `pi`).
- Tool calling / function calling, orientado a entornos de ejecución y terminal (tags `harbor`, `openenv`).
- Entrenamiento con GRPO/async-GRPO, lo que sugiere capacidad de seguir instrucciones en tareas verificables.
- Decodificación especulativa vía MTP (multi-token prediction) para acelerar la generación.
- Capacidad de visión: la model card indica explícitamente "This is a vision model", aunque los ficheros mmproj (si existen) están en el repositorio estático, no en este.
- Capacidades multilingües: no disponibles; solo se declara inglés.

## Casos de uso

- Agentes de terminal automatizados: el modelo puede ejecutar comandos, interpretar salidas y encadenar pasos, gracias a su entrenamiento sobre entornos tipo Harbor/OpenEnv y su soporte de tool calling.
- Orquestación de pipelines CI/CD: integrado como agente que lee logs, propone parches y valida resultados en un bucle multi-paso, aprovechando el entrenamiento con GRPO sobre tareas verificables.
- Asistente de código en local: con cuantizaciones i1-Q4_K_M (~17,1 GB) puede ejecutarse en una RTX 4090 o en una estación con 24 GB de VRAM, ofreciendo generación de código y razonamiento sin depender de la nube.
- Evaluación de agentes (harness): útil como modelo de referencia para comparar políticas de agentes en entornos de benchmark, dado que los datasets de entrenamiento provienen de harnesses de evaluación.
- Automatización de tareas de administración de sistemas: el modelo puede interpretar instrucciones en lenguaje natural y traducirlas a comandos de shell, con validación posterior.
- Prototipado de asistentes conversacionales en inglés: para equipos que necesitan un modelo de 27B con licencia Apache 2.0 y despliegue en GGUF con llama.cpp u Ollama.
- Investigación en decodificación especulativa: al incluir MTP, sirve como banco de pruebas para técnicas de *speculative decoding* en inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de quant):
  - i1-Q2_K (~11,3 GB): cabe en GPU de 12 GB (RTX 3060 12 GB, RTX 4070) con contexto corto.
  - i1-IQ3_S / i1-Q3_K_M (~13 GB): requiere 16 GB de VRAM o descarga parcial a RAM.
  - i1-Q4_K_M (~17,1 GB): recomendado para RTX 4090 (24 GB) o A5000/A6000.
  - i1-Q5_K_M (~19,7 GB): requiere 24 GB de VRAM con contexto moderado.
  - i1-Q6_K (~22,5 GB): al límite de 24 GB; mejor en A100 40 GB o H100.
- GPU recomendadas: RTX 4090 (24 GB) para quants Q4/Q5; A100 40/80 GB o H100 para Q6 o contexto largo; RTX 3090/4090 para Q3/Q4.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con quants Q4_K_M o inferiores; en RTX 3060 12 GB solo con Q2_K o IQ2/IQ3 parciales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI, aunque GGUF no es su formato nativo), vLLM (con soporte GGUF experimental). El repo incluye fichero imatrix para generar quants propios.
- Latencia y throughput: no disponibles; dependerán del hardware y del quant. La presencia de MTP y decodificación especulativa puede reducir la latencia por token en comparación con un transformer equivalente sin MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-super-adapter-bf16-i1-GGUF (este) | ~27,3 B | no disponible | Apache 2.0 | GGUF | Orientado a agentes, MTP, vision (según card) |
| Qwen2.5-32B-Instruct | ~32,5 B | 128K (según card oficial) | Apache 2.0 | safetensors, GGUF | Referencia generalista de la familia Qwen |
| Gemma 3 27B | ~27 B | 128K (según card oficial) | Gemma license | safetensors, GGUF | Multimodal, licencia más restrictiva |
| Mistral Small 3 (24B) | ~24 B | 32K (según card oficial) | Apache 2.0 | safetensors, GGUF | Generalista, sin entrenamiento específico de agentes |

No se dispone de datos de benchmarks del modelo evaluado, por lo que la comparación se limita a parámetros, contexto, licencia y formato. Los datos de los modelos alternativos provienen de sus respectivas model cards públicas.

## Limitaciones y advertencias

- Sesgos: no documentados; al ser un modelo entrenado mayoritariamente en inglés y sobre entornos de terminal, puede presentar sesgos hacia ese dominio y hacia patrones de comandos Unix.
- Riesgo de alucinación: no cuantificado; en tareas de agentes, una alucinación en un comando puede tener consecuencias destructivas, por lo que se recomienda sandboxing.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible; no se debe asumir una ventana larga sin verificación empírica.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datasets de entrenamiento pueden tener sus propias condiciones; conviene revisar las licencias de `harness-hub/*` y `ai-and/termgrade-environments`.
- Producción: al ser una cuantización comunitaria (no oficial), la calidad de los quants i1 puede degradarse en Q2/Q3; para producción se recomienda Q4_K_M o superior y validación contra el modelo bf16 original.
- Visión: la model card indica que es un modelo de visión, pero los ficheros mmproj están en el repositorio estático; este repo i1 no los incluye, por lo que la funcionalidad multimodal puede no estar disponible aquí.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-super-adapter-bf16-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.8-27B-super-adapter-bf16
- Quants estáticos (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.8-27B-super-adapter-bf16-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-super-adapter-bf16-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre quants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset scale800-harbor: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset harness-adapters: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset termgrade-train-harbor: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset termgrade-environments: https://huggingface.co/datasets/ai-and/termgrade-environments
