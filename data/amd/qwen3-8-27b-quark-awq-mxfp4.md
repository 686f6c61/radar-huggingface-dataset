# amd/Qwen3.8-27B-Quark-AWQ-MXFP4

## Resumen

Qwen3.8-27B-Quark-AWQ-MXFP4 es una version cuantizada del modelo multimodal Qwen/Qwen3.8-27B, publicada por AMD mediante su herramienta de cuantizacion Quark. El proceso aplica cuantizacion de pesos y activaciones a formato MXFP4 (OCP microscaling FP4, con grupo de 32 elementos y escala compartida E8M0) utilizando el algoritmo AWQ (Activation-aware Weight Quantization). El resultado es un checkpoint de aproximadamente 19,8 GB que puede servirse con vLLM y que mantiene el pipeline image-text-to-text del modelo original.

El modelo base es un transformer multimodal de Qwen con torre de vision y decodificador de lenguaje; en esta version solo se cuantiza el decodificador (`model.language_model.layers`), mientras que la torre visual (`model.visual.*`) permanece en bf16. El checkpoint declara 15.606.149.872 parametros en safetensors, un dato que no coincide con la denominacion comercial "27B" del modelo base, por lo que debe tomarse como la cifra efectiva del artefacto publicado.

Su relevancia practica es doble: por un lado, demuestra que la cuantizacion a 4 bits con activaciones tambien en FP4 es viable en un modelo multimodal sin degradar de forma significativa el razonamiento matematico (recuperacion del 101,8 % en GSM8K en modo thinking respecto al base bf16); por otro, ofrece un camino de despliegue en hardware AMD mediante Quark y vLLM, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de vision; familia Qwen3.5 segun tag `qwen3_5` |
| Parametros totales | 15.606.149.872 (segun safetensors del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; los comandos de evaluacion usan `max_length=16384` y el servido de vLLM `--max-model-len 16384` |
| Tipos de cuantizacion | MXFP4 en pesos (grupo 32, escala E8M0) y MXFP4 en activaciones (dinamica, por bloque); torre de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (exportacion HF via Quark); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El checkpoint no entrena un modelo nuevo: es una conversion del Qwen/Qwen3.8-27B en bf16 a un esquema de cuantizacion MXFP4 con AWQ. La arquitectura subyacente es la del modelo base, un transformer multimodal con torre de vision y decodificador de lenguaje; el tag `qwen3_5` sugiere que pertenece a la generacion Qwen3.5. La cuantizacion se aplica exclusivamente a las capas del decodificador (`model.language_model.layers`), dejando `model.visual.*` en bf16, lo que preserva la calidad de la representacion visual a costa de un ahorro de memoria menor del que se obtendria cuantizando todo el modelo.

El procedimiento de cuantizacion usa AWQ con 128 muestras de calibracion, longitud de secuencia 512 y el dataset `pileval` por defecto de Quark, ejecutado con `quantize_quark.py --quant_scheme mxfp4 --quant_algo awq --model_export hf_format`. No se documentan en la informacion disponible los datos de preentrenamiento, el numero de tokens, ni si el modelo base uso RLHF o DPO. La innovacion tecnica destacable es la combinacion de pesos y activaciones en FP4 con escalas microscaladas, un formato orientado a aceleradores con soporte nativo de MXFP4, y la verificacion de recuperacion de calidad frente al base en bf16.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto conjuntamente (pipeline `image-text-to-text`), con torre de vision en bf16.
- Modo thinking y modo non-thinking: la model card documenta configuraciones de generacion distintas para cada uno, con bloques `<think></think>`.
- Razonamiento matematico: evaluado en GSM8K 5-shot con resultados proximos o superiores al base bf16.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible; el pipeline declarado es unicamente image-text-to-text.

## Casos de uso

- Despliegue de un asistente multimodal en produccion con vLLM: el checkpoint se sirve con `vllm serve` y `--max-model-len 16384`, lo que permite atender conversaciones con imagenes y texto en una sola GPU sin recurrir al base bf16, que ocuparia aproximadamente el doble de memoria.
- Razonamiento matematico asistido: con el modo thinking y los parametros de generacion documentados (temperatura 1.0, top_p 0.95, max_gen_toks 3072) el modelo mantiene el rendimiento del base en GSM8K, por lo que es adecuado para tutoria o verificacion de problemas paso a paso.
- Respuestas rapidas en modo non-thinking: con temperatura 0.7, top_p 0.80 y max_gen_toks 1024, el modelo ofrece latencia menor para tareas de extraccion o clasificacion donde no se requiere cadena de razonamiento.
- Procesamiento de documentos escaneados y capturas: al conservar la torre de vision en bf16, puede extraer informacion de imagenes y combinarla con el contexto textual en la misma llamada.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye comandos de lm-eval y el script de cuantizacion, lo que lo convierte en una referencia reproducible para medir recuperacion de calidad de AWQ+MXFP4 frente a bf16.
- Investigacion sobre hardware AMD: al estar producido con Quark y documentar el flag `HIP_VISIBLE_DEVICES`, sirve como banco de pruebas para pipelines de cuantizacion y servido en GPUs AMD Instinct.
- Integracion en pipelines de transformers: al usar `library_name: transformers` y safetensors, puede cargarse directamente en scripts de Python para prototipado sin infraestructura de servido dedicada.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Este modelo (AWQ) | Base bf16 | Recuperacion |
|---|---|---:|---:|---:|
| GSM8K, 5-shot (flexible-extract / strict-match) | Thinking: temp=1.0, top_p=0.95, top_k=20, max_gen_toks=3072 | 94,996 % / 95,30 % | 93,33 % / 93,33 % | 101,8 % |
| GSM8K, 5-shot (flexible-extract / strict-match) | Non-thinking: temp=0.7, top_p=0.80, top_k=20, max_gen_toks=1024 | 89,92 % / 89,76 % | 90,67 % / 89,76 % | 99,2 % |

La recuperacion se calcula sobre la metrica flexible-extract. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni otros benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,8 GB, por lo que se necesita al menos esa cantidad mas overhead de activaciones y cache KV; con `--max-model-len 16384` el margen adicional puede ser considerable.
- GPU recomendadas: AMD Instinct (el flujo de cuantizacion usa HIP) y GPUs NVIDIA con soporte de MXFP4 en vLLM; el comando de servido documentado usa `--tensor-parallel-size 1`.
- Cabe en GPU de consumo: no disponible de forma explicita; un checkpoint de ~20 GB no cabe en GPUs de 16 GB y requiere tarjetas de 24 GB o mas, aunque no se confirma compatibilidad con MXFP4 en esas arquitecturas.
- Opciones de despliegue: vLLM (`vllm serve amd/Qwen3.8-27B-Quark-AWQ-MXFP4 --trust-remote-code`), transformers, y el ecosistema Quark para recuantizacion. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/Qwen3.8-27B-Quark-AWQ-MXFP4 | 15.606.149.872 (checkpoint) | no disponible (eval a 16k) | MXFP4 pesos + activaciones, AWQ | Apache 2.0 | Hugging Face, vLLM, transformers |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | bf16 | Apache 2.0 (heredada) | Hugging Face |
| Otras cuantizaciones del mismo base (GPTQ, AWQ INT4) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |

No se dispone de datos de benchmarks de terceros ni de otras variantes cuantizadas del mismo modelo base en la informacion proporcionada, por lo que la comparativa cuantitativa se limita al par AWQ frente a bf16 incluido en la model card.

## Limitaciones y advertencias

- El checkpoint declara 15.606.149.872 parametros frente a la denominacion "27B" del modelo base; conviene verificar el conteo real antes de dimensionar infraestructura.
- Solo se cuantiza el decodificador de lenguaje; la torre de vision permanece en bf16, de modo que el ahorro de memoria es parcial y el consumo de VRAM no se reduce a la mitad respecto al base.
- La evaluacion publicada se limita a GSM8K; no hay evidencia documentada sobre MMLU, HumanEval, tareas multimodales o calidad conversacional tras la cuantizacion.
- El modo non-thinking se aproxima en la evaluacion mediante un bloque `<think></think>` vacio preinsertado, porque el endpoint de completions no propaga `enable_thinking=False`; los numeros de ese modo deben interpretarse con esa salvedad.
- La cuantizacion a FP4 puede degradar tareas sensibles a precision numerica no cubiertas por GSM8K; se recomienda validacion propia antes de produccion.
- No se documentan sesgos conocidos, cobertura idiomatica ni riesgos de alucinacion especificos de esta variante; aplican los del modelo base, no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el aviso de copyright de AMD sobre las modificaciones debe conservarse.
- El despliegue requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo del repositorio; conviene auditar el checkpoint en entornos sensibles.
- No se documenta soporte para llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue en CPU o en entornos sin vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de AMD Quark: https://github.com/amd/Quark
