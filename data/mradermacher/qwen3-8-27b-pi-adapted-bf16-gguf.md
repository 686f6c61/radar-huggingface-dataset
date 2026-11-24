# mradermacher/Qwen3.8-27B-pi-adapted-bf16-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-bf16-GGUF es una distribucion de cuantizaciones estaticas en formato GGUF del modelo prithivMLmods/Qwen3.8-27B-pi-adapted-bf16, un ajuste fino (adaptacion "pi") sobre la familia Qwen3.8 de 27B parametros. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, mientras que el modelo base y el ajuste fino corresponden a prithivMLmods. El repositorio contiene unicamente pesos cuantizados, no el modelo original en precision completa.

El modelo parte de una arquitectura transformer densa con 27.320.697.856 parametros totales (segun los safetensors del modelo base) y esta orientado a generacion de texto conversacional, uso de agentes y tool calling, segun las etiquetas de la model card (agents, harbor, openenv, lora, grpo, async-grpo). El ajuste fino se ha realizado con tecnicas de aprendizaje por refuerzo (GRPO y async-GRPO) sobre LoRA, empleando los datasets harness-hub/scale800-harbor y harness-hub/termgrade-train-harbor.

Su relevancia practica radica en que permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones que van desde 11,3 GB (Q2_K) hasta 29,1 GB (Q8_0), con la licencia Apache 2.0 del modelo base, lo que facilita su uso comercial. No obstante, la informacion publicada es escasa: no hay benchmarks, no se detalla la longitud de contexto y la model card del cuantizador es fundamentalmente un catalogo de ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se detalla variante; no disponible informacion sobre atencion o MoE) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base esta en bf16/safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parametros. La model card no especifica el numero de capas, dimensiones ocultas, mecanismo de atencion ni la longitud de contexto nativa, por lo que estos datos deben considerarse no disponibles. Las etiquetas indican el uso de tensor-casting, text-generation-inference y mtp (multi-token prediction), aunque no se detalla como se aplican en la arquitectura final.

El ajuste fino "pi-adapted" se ha realizado con GRPO y async-GRPO sobre adaptadores LoRA, segun las etiquetas del repositorio, y se han empleado los datasets harness-hub/scale800-harbor y harness-hub/termgrade-train-harbor, orientados a entornos de agentes y evaluacion de terminal (harbor, openenv). No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de DPO o RLHF mas alla del GRPO mencionado. La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type: hf, output_tensor_quantised: 1), e incluye una variante con imatrix en el repositorio hermano i1-GGUF.

## Capacidades

- Generacion de texto conversacional (etiqueta conversational en el repositorio).
- Uso de agentes: las etiquetas agents, harbor y openenv sugieren entrenamiento orientado a entornos de agente y ejecucion de tareas.
- Tool calling y function calling: inferido de las etiquetas agents y del ecosistema de entrenamiento, aunque no se documenta el formato exacto de llamadas.
- Razonamiento multi-paso: el uso de GRPO y async-GRPO apunta a entrenamiento con recompensas en tareas de varios pasos, sin detalle publico.
- Prediccion multi-token (mtp) como etiqueta, sin especificacion tecnica adicional.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Agentes autonomos en entornos de terminal: el ajuste con datasets harbor y termgrade sugiere un modelo entrenado para interpretar comandos, ejecutar tareas en shell y evaluar resultados, adecuado para pipelines de automatizacion de operaciones.
- Asistentes de codigo con tool calling: puede integrarse en flujos donde el modelo invoca funciones externas (compiladores, linters, APIs) y encadena varias llamadas, gracias a las etiquetas de agents y openenv.
- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M (17,1 GB) cabe en una GPU de 24 GB, lo que permite prototipar agentes sin depender de la nube.
- Evaluacion de modelos en investigacion: util para comparar el efecto de GRPO y async-GRPO sobre un mismo modelo base en tareas de agente, usando las distintas cuantizaciones como variable controlada.
- Servicio de chat conversacional en ingles: la etiqueta conversational y el formato GGUF permiten montar un endpoint con llama.cpp o TGI para conversaciones multi-turno en ingles.
- Pruebas de robustez y cuantizacion: al existir 11 variantes de cuantizacion, sirve para medir la degradacion de calidad en tareas de agente entre Q2_K y Q8_0.
- Fine-tuning posterior sobre LoRA: al derivar de un ajuste LoRA y publicarse con licencia Apache 2.0, puede servir como punto de partida para adaptaciones adicionales en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y KV cache):
  - Q2_K: 11,3 GB de pesos; ~13-15 GB en total con contexto moderado.
  - Q4_K_M: 17,1 GB de pesos; ~19-22 GB en total.
  - Q6_K: 22,5 GB de pesos; ~25-28 GB en total.
  - Q8_0: 29,1 GB de pesos; ~32-35 GB en total.
- GPU recomendadas:
  - Consumer: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) equivalente.
  - Profesional: A100 40/80 GB, H100 80 GB para Q8_0 o bf16 completo.
  - Multi-GPU para Q8_0 en configuraciones de 24 GB.
- Cabe en consumer GPU: si, con Q2_K a Q5_K_M en tarjetas de 16-24 GB; Q6_K y Q8_0 requieren 24 GB o mas con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el modelo base admite transformers y text-generation-inference. El repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted-bf16-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | Ajuste GRPO/LoRA orientado a agentes; sin benchmarks publicos |
| Modelo base prithivMLmods/Qwen3.8-27B-pi-adapted-bf16 | 27,3B | no disponible | Apache 2.0 | safetensors bf16 | Precision completa; mayor VRAM (~55 GB) |
| Familia Qwen3.8 (otros ajustes) | ~27B | no disponible | Apache 2.0 | varios | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Modelo unicamente en ingles segun la model card; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Riesgo de alucinacion inherente a los modelos de 27B sin datos de evaluacion; el ajuste con GRPO puede introducir sesgos hacia los formatos de los datasets de entrenamiento (harbor, termgrade).
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- El repositorio solo contiene pesos GGUF; para reproducir el ajuste fino o auditar el entrenamiento hay que acudir al modelo base de prithivMLmods.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datasets empleados antes de un uso comercial en produccion.
- El modelo tiene 0 likes y un volumen de descargas moderado (1156), lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-pi-adapted-bf16-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.8-27B-pi-adapted-bf16
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-pi-adapted-bf16-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-pi-adapted-bf16-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
