# mradermacher/alpaca-7b-nativeEnhanced-GGUF

## Resumen

`mradermacher/alpaca-7b-nativeEnhanced-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo base `8bit-coder/alpaca-7b-nativeEnhanced`, un fine-tune de la familia LLaMA de 7B (6.738.423.808 parametros reales segun safetensors). El trabajo de cuantizacion lo firma mradermacher, conocido en HuggingFace por producir quants estaticos (Q2_K a F16) y versiones con imatrix para facilitar el despliegue en hardware modesto mediante llama.cpp y derivados.

El modelo resuelve el problema practico de ejecutar un fine-tune de 7B en GPUs de consumo o incluso en CPU, ofreciendo desde variantes de 2,6 GB (Q2_K) hasta 13,6 GB (F16). Su relevancia actual es la de servir como material de referencia para quienes quieren probar el fine-tune original sin necesidad de disponer de una GPU con 14 GB de VRAM o mas.

Se trata de un modelo unicamente en ingles, con licencia WTFPL (dominio publico de facto), lo que elimina practicamente cualquier restriccion de uso comercial. No obstante, la informacion publica sobre el fine-tune original es muy limitada: no hay detalles sobre dataset, proceso de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, derivado de alpaca-7b) |
| Parametros totales | 6.738.423.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | en (ingles) |
| Licencia | WTFPL |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia LLaMA, con 6.738.423.808 parametros, heredada del fine-tune `8bit-coder/alpaca-7b-nativeEnhanced`, que a su vez deriva de la estirpe Alpaca-7B (entrenamiento tipo instruction-following sobre LLaMA). No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT especificas en el fine-tune original.

El aporte tecnico de este repositorio es exclusivamente la cuantizacion: mradermacher aplica cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) sobre los pesos en formato HuggingFace convertidos a GGUF. Las variantes con imatrix (weighted quants) se publican en un repositorio separado (`alpaca-7b-nativeEnhanced-i1-GGUF`), lo que sugiere que este repo contiene unicamente los quants estaticos "planos".

## Capacidades

- Generacion de texto en ingles con estilo instruction-following (herencia Alpaca).
- Razonamiento basico y respuesta a preguntas de conocimiento general.
- Generacion de codigo y matematicas a nivel de modelo de 7B de su generacion (sin garantias de calidad moderna).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni multi-step reasoning explicito.
- Capacidades multilingues limitadas al ingles.
- No dispone de vision, audio ni modo "thinking" documentado.
- Compatible con endpoints (tag `endpoints_compatible`), lo que permite su despliegue en infraestructuras tipo HuggingFace Inference Endpoints o TGI con soporte GGUF.

## Casos de uso

- Prototipado local en CPU: usar el quant Q4_K_M (4,2 GB) con llama.cpp u Ollama para validar flujos de instruction-following en una maquina sin GPU dedicada, gracias a que el modelo cabe en RAM convencional.
- Experimentacion academica con fine-tunes de la familia Alpaca: sirve como punto de partida reproducible para comparar el efecto de la cuantizacion en la calidad de las respuestas de un 7B instruction-tuned.
- Despliegue en GPUs de consumo: con Q8_0 (7,3 GB) cabe en una RTX 3060 de 12 GB o RTX 4070, permitiendo inferencia local con calidad casi F16.
- Generacion de texto en ingles para tareas de resumen o reescritura en pipelines internos donde la licencia WTFPL elimina friccion legal.
- Evaluacion de cuantizaciones: el repositorio ofrece 12 variantes del mismo modelo, lo que permite medir empiricamente la degradacion de perplejidad entre Q2_K y Q8_0 en un caso concreto.
- Base para comparativas de herramientas de inferencia (llama.cpp, Ollama, LM Studio, text-generation-webui) al ser un GGUF pequeno y de descarga rapida en sus variantes bajas.
- Entorno de pruebas para integracion con endpoints compatibles (tag `endpoints_compatible`) en flujos de CI que necesiten un modelo de chat barato y determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K ni similares para este fine-tune. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~2,6 GB de pesos, ~3-4 GB en total.
  - Q4_K_M: ~4,2 GB de pesos, ~5-6 GB en total.
  - Q8_0: ~7,3 GB de pesos, ~8-9 GB en total.
  - F16: ~13,6 GB de pesos, ~14-15 GB en total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para Q8_0 y F16; A100/H100 solo si se busca throughput alto en batch.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB (Q4_K_S) hasta una RTX 4090 (F16). En iGPU o CPU funciona con Q2_K a Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp; tambien via TGI o endpoints compatibles con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/alpaca-7b-nativeEnhanced-GGUF | 6,74B | no disponible | WTFPL | GGUF | Objeto de esta ficha |
| TheBloke/alpaca-7b-GGUF (referencia de la familia) | ~6,7B | no disponible | no comercial (LLaMA original) | GGUF | Mismo linaje Alpaca, sin "nativeEnhanced" |
| Mistral-7B-Instruct-v0.2 (GGUF) | 7,24B | 32k | Apache 2.0 | GGUF/safetensors | Alternativa moderna con contexto largo y mejor calidad |
| Llama-3.2-3B-Instruct (GGUF) | 3,21B | 128k | Llama 3.2 Community | GGUF/safetensors | Mas pequeno, mas moderno y con contexto muy superior |

La comparativa es orientativa: no hay benchmarks publicados para este fine-tune, por lo que la eleccion frente a Mistral o Llama 3.2 deberia basarse en pruebas propias. En la practica, un 7B Alpaca de 2023 esta superado en calidad por modelos de 3B actuales con contextos mucho mayores.

## Limitaciones y advertencias

- Modelo unicamente en ingles; el rendimiento en castellano sera deficiente o directamente incorrecto.
- Fine-tune de la familia Alpaca (2023) sobre LLaMA: calidad de razonamiento, codigo y matematicas muy por debajo de modelos actuales de 7B.
- Riesgo elevado de alucinacion: no se documenta alineacion RLHF/DPO moderna ni filtros de seguridad.
- Sesgos inheridos del dataset Alpaca original (generado con ChatGPT) y de los datos de preentrenamiento de LLaMA, sin mitigaciones documentadas.
- Longitud de contexto no documentada; asumir valores conservadores (probablemente 2048 tokens, herencia LLaMA 1) hasta verificar.
- Licencia WTFPL: permite uso comercial sin restricciones, pero conviene revisar la licencia del modelo base original (`8bit-coder/alpaca-7b-nativeEnhanced`) por si arrastra condiciones adicionales.
- No apto para produccion en tareas sensibles (salud, legal, finanzas) sin evaluacion exhaustiva y sin sistema de moderacion externo.
- El repositorio ocupa 59,6 GB por contener las 12 variantes; descargar solo el archivo GGUF necesario.
- El tag `endpoints_compatible` no garantiza compatibilidad con todos los backends; verificar con el proveedor concreto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/alpaca-7b-nativeEnhanced-GGUF
- Modelo base: https://huggingface.co/8bit-coder/alpaca-7b-nativeEnhanced
- Quants con imatrix: https://huggingface.co/mradermacher/alpaca-7b-nativeEnhanced-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#alpaca-7b-nativeEnhanced-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
