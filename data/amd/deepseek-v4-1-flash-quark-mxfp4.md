# amd/DeepSeek-V4.1-Flash-Quark-MXFP4

## Resumen

DeepSeek-V4.1-Flash-Quark-MXFP4 es la version cuantizada del modelo DeepSeek-V4.1-Flash de DeepSeek, publicada por AMD mediante su herramienta de cuantizacion Quark. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 483.858.771.154 parametros totales, capacitado para entrada de texto e imagen y salida de texto, y esta disenado para ejecutarse sobre aceleradores AMD Instinct MI355 y MI350 (arquitectura gfx950) con ROCm 7.2.0 y vLLM como motor de inferencia.

El objetivo de esta publicacion es demostrar que la cuantizacion MXFP4 (formato de coma flotante de 4 bits definido por el Open Compute Project) aplicada a las proyecciones de los expertos del MoE, junto con MXFP8 en la atencion del modelo de lenguaje, preserva practicamente la precision del modelo original. Segun los datos de la model card, la recuperacion de precision oscila entre el 98,7 % y el 101,1 % en los benchmarks evaluados, con un rendimiento estadisticamente equivalente al modelo sin cuantizar en GPQA Diamond.

Es relevante ahora porque permite desplegar un modelo MoE de casi 484.000 millones de parametros en configuraciones de 2 a 4 GPU AMD Instinct MI355X, reduciendo el coste de memoria frente a los pesos en precision original. El repositorio ocupa 509,6 GB y la licencia es MIT, lo que facilita su uso comercial. La ficha se centra en la version cuantizada; los detalles de entrenamiento del modelo base no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV41ForCausalLM (transformer MoE, multimodal texto/imagen) |
| Parametros totales | 483.858.771.154 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de despliegue usan `--max-model-len 73728`) |
| Tipos de cuantizacion | OCP MXFP4 (expertos y shared_experts, pesos y activaciones); OCP MXFP8 (self_attn, pesos y activaciones); resto de modulos en precision original |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE) que procesa entrada de texto e imagen y genera texto. La version publicada por AMD conserva la arquitectura `DeepseekV41ForCausalLM` y aplica cuantizacion selectiva: las proyecciones de los expertos (`experts` y `shared_experts`) se cuantizan a OCP MXFP4 tanto en pesos como en activaciones, mientras que la atencion del modelo de lenguaje (`self_attn`) se cuantiza a OCP MXFP8. Quedan en precision original el torre de vision, el router gate, los embeddings, la cabeza de salida y los bloques `engram` y `MTP`.

La cuantizacion se realizo con AMD Quark v0.13.0 mediante `direct_quantize_checkpoint`, manteniendo las capas excluidas en su estado original. El proceso esta documentado con el script completo en la model card, lo que permite reproducir la conversion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base; esos datos no aparecen en la informacion proporcionada. Tampoco se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion alternativos.

## Capacidades

- Generacion de texto autoregresiva con modo de razonamiento (thinking mode) activado por defecto, con un parametro `reasoning_effort` cuyo valor por defecto es `high` (75).
- Razonamiento matematico y resolucion de problemas: evaluado en GSM8K, AIME26 y GPQA Diamond.
- Entrada multimodal de imagen: el modelo acepta imagen y texto, y ha sido evaluado en MMMU-Pro en sus variantes estandar y de vision.
- Seguimiento de instrucciones: evaluado en IFBench.
- Razonamiento sobre contextos largos: evaluado en AA-LCR y con presupuestos de generacion de hasta 65.536 tokens en modo thinking.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking sugiere capacidad de razonamiento extendido, pero no se detalla soporte de agentes.

## Casos de uso

- Razonamiento matematico asistido: el modelo obtiene un 92,34 en GSM8K (8-shot) y un 97,71 en AIME26, por lo que es adecuado para tutoria matematica automatizada, verificacion de demostraciones o generacion de problemas resueltos paso a paso en entornos educativos.
- Evaluacion cientifica y tecnica: con un 90,40 en GPQA Diamond en modo thinking, puede emplearse para responder preguntas de nivel posgrado en fisica, quimica y biologia dentro de herramientas de investigacion, siempre con revision humana.
- Analisis de documentos e imagenes tecnicas: al aceptar entrada de imagen y obtener un 76,36 en MMMU-Pro estandar, sirve para extraer informacion de diagramas, tablas e ilustraciones en informes de ingenieria o literatura cientifica.
- Razonamiento sobre contextos largos: los despliegues de referencia usan ventanas de 73.728 tokens y AA-LCR alcanza 77,88, lo que permite resumir o consultar expedientes extensos, contratos o transcripciones largas en una sola pasada.
- Cumplimiento estricto de instrucciones: con un 78,13 en IFBench, es util en pipelines que requieren salidas con formato fijo, como generacion de informes estructurados, extraccion de campos o validacion de respuestas contra plantillas.
- Despliegue en infraestructura AMD: al estar optimizado para MI355X y MI350 con ROCm 7.2.0 y vLLM, encaja en centros de datos con aceleradores AMD que necesiten servir un modelo MoE de gran escala con 2 a 4 GPU por instancia.
- Servicio de inferencia de alto rendimiento: la cuantizacion MXFP4 reduce el peso de los expertos y permite servir el modelo con vLLM usando `--tensor-parallel-size 4`, lo que resulta adecuado para APIs internas de generacion de texto con requisitos de latencia moderada.

## Benchmarks y rendimiento

Los datos proceden de la model card y comparan el modelo base con esta version cuantizada, ejecutados con el mismo framework, configuracion y host.

| Benchmark | DeepSeek-V4.1-Flash | Quark-MXFP4 (este modelo) | Recuperacion |
|---|---:|---:|---:|
| GSM8K (8-shot, flexible-extract) | 92,87 | 92,34 | 99,4 % |
| GPQA Diamond (0-shot, thinking) | 89,39 | 90,40 | 101,1 % |
| AIME26 | 97,50 | 97,71 | 100,2 % |
| MMMU-Pro, standard (10 opciones) | 76,47 | 76,36 | 99,9 % |
| MMMU-Pro, vision | 72,95 | 72,02 | 98,7 % |
| AA-LCR | 78,25 | 77,88 | 99,5 % |
| IFBench | 78,93 | 78,13 | 99,0 % |

Notas sobre la medicion: GPQA Diamond se puntua sobre las 198 preguntas con muestreo estocastico (`temperature=1.0`, `top_p=0.95`), con un intervalo de confianza del 95 % de ±2,33 %. En esta ejecucion el modelo cuantizado acerto 179/198 frente a 177/198 del base, diferencia dentro del intervalo, por lo que deben considerarse equivalentes. GSM8K se midio con lm-eval y GPQA Diamond con sgl-eval. El resto de benchmarks no incluye detalles metodologicos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 509,6 GB, lo que da una referencia del espacio en disco de los pesos cuantizados; la memoria necesaria en GPU depende del paralelismo y de la cache KV.
- GPU recomendadas: AMD Instinct MI355X y MI350 (gfx950). Los ejemplos de la model card usan 2 GPU MI355X con TP=2 para la mayoria de benchmarks y 4 GPU MI355X con TP=4 para GPQA Diamond.
- Compatibilidad con GPU de consumo: no disponible; la model card solo documenta hardware AMD Instinct y no menciona RTX 4090 ni otras GPU consumer.
- Opciones de despliegue: vLLM sobre la imagen Docker `vllm/vllm-openai-rocm:deepseekv41-flash-0909`, con ROCm 7.2.0, PyTorch 2.12.0 y Transformers 5.17.0. No se documentan llama.cpp, Ollama ni TGI.
- Variables de entorno recomendadas: `VLLM_ROCM_USE_AITER=1`, `VLLM_ROCM_USE_AITER_MHA=1`, `VLLM_ROCM_USE_AITER_MOE=0`.
- Parametros de servicio de referencia: `--tensor-parallel-size 4`, `--trust-remote-code`, `--tokenizer-mode deepseek_v41`, `--max-model-len 73728`, `--max-num-batched-tokens 8192`, `--gpu-memory-utilization 0.90`, `--enforce-eager`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | GSM8K | GPQA Diamond | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| amd/DeepSeek-V4.1-Flash-Quark-MXFP4 (este modelo) | 483.858.771.154 | no disponible | 92,34 | 90,40 | MIT | HuggingFace, safetensors, vLLM |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | no disponible | no disponible | 92,87 | 89,39 | MIT | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el modelo base sin cuantizar. No se dispone de datos sobre otros modelos MoE o multimodales de tamano comparable en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce una perdida de precision medida de hasta el 1,3 % en MMMU-Pro vision, con recuperaciones entre el 98,7 % y el 101,1 % en el resto de benchmarks evaluados.
- GPQA Diamond presenta variabilidad entre ejecuciones por el muestreo estocastico; los resultados deben interpretarse con el intervalo de confianza de ±2,33 % sobre 198 preguntas.
- El modelo esta documentado exclusivamente para hardware AMD Instinct MI355/MI350 con ROCm 7.2.0; no se confirma su funcionamiento en GPU NVIDIA ni en GPU de consumo.
- El torre de vision no esta cuantizado, por lo que conserva el coste de memoria de la precision original en esa parte del modelo.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, cobertura de idiomas ni limitaciones de contexto mas alla de los ejemplos de despliegue.
- El modo thinking viene activado por defecto con `reasoning_effort` en `high` (75), lo que incrementa el consumo de tokens y requiere presupuestos de generacion amplios (hasta 65.536 tokens en GPQA Diamond).
- La licencia MIT permite uso comercial, pero se recomienda revisar la licencia del modelo base enlazada en la model card por si impone condiciones adicionales.
- El despliegue requiere `--trust-remote-code` y `--enforce-eager`, lo que implica ejecutar codigo remoto y renunciar a ciertas optimizaciones de grafo.
- No se documentan resultados de tool calling, agentes ni capacidades multilingues, por lo que no deben asumirse en produccion sin validacion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/DeepSeek-V4.1-Flash-Quark-MXFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/LICENSE
- Documentacion de AMD Quark: https://quark.docs.amd.com/latest/index.html
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
