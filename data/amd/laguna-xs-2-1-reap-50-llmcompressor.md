# amd/Laguna-XS-2.1-reap-50-llmcompressor

## Resumen

Laguna-XS-2.1-reap-50-llmcompressor es una variante podada del modelo Laguna-XS-2.1 de poolside, publicada por AMD y optimizada para inferencia en CPU sobre procesadores AMD EPYC mediante ZenDNN. La poda se ha realizado con LLM Compressor aplicando REAP (Router-weighted Expert Activation Pruning) al 50 %, lo que reduce el numero de expertos enrutados de 256 a 128 en cada una de las 39 capas MoE del modelo. El checkpoint resultante pesa 33,0 GiB en disco frente a los 62,3 GiB del original, una reduccion aproximada del 47 %, manteniendo todos los tensores en BF16.

El modelo conserva la arquitectura LagunaForCausalLM del original: una pila de 40 capas de decoder en la que la capa 0 es un MLP denso y las 39 restantes son bloques MoE, cada uno con un experto compartido siempre activo. Los parametros totales del checkpoint podado son 17.728.914.304 (unos 17,7 mil millones). La poda es estructural, no una cuantizacion: no hay `quantization_config` en el checkpoint y los pesos siguen en BF16.

La relevancia de esta ficha radica en que es un ejemplo practico de despliegue de un MoE de gran porte en CPU de servidor sin GPU, algo poco habitual en el ecosistema open source, y en que documenta con detalle el procedimiento de poda REAP sobre un modelo con experto compartido y router con correccion de sesgo por experto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LagunaForCausalLM (transformer hibrido denso + MoE; 40 capas de decoder) |
| Parametros totales | 17.728.914.304 (17,7 B) |
| Parametros activos | no disponible (top-8 sobre 128 expertos enrutados por capa MoE, mas experto compartido; el numero exacto de parametros activos no se publica) |
| Longitud de contexto | no disponible en la informacion proporcionada (la calibracion uso secuencias de 2048 tokens) |
| Tipos de cuantizacion | ninguno incluido; pesos en BF16. El checkpoint es compatible con compressed-tensors y LLM Compressor para futuras cuantizaciones |
| Idiomas soportados | ingles (en) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (BF16), con `retained_experts.json` auxiliar |

## Arquitectura y entrenamiento

Laguna-XS-2.1 es un transformer hibrido: la capa 0 contiene un MLP denso y las 39 capas restantes son bloques MoE, cada uno con 256 expertos enrutados y un experto compartido siempre activo. El router selecciona top-8 expertos por token y emplea una correccion de sesgo por experto (`e_score_correction_bias`). Esta variante de AMD no reentrena el modelo: aplica una poda estructural mediante `REAPPruningModifier` con `sparsity=0.50`, que puntua cada experto por su contribucion real a la salida de la capa (magnitud de activacion ponderada por la probabilidad que le asigna el router) y elimina la mitad con menor puntuacion.

La calibracion empleo 128 muestras de `allenai/tulu-3-sft-personas-math`, renderizadas con la plantilla de chat del modelo, longitud maxima de 2048 y `batch_size=1`, con `moe_calibrate_all_experts=False` para medir cada experto solo con los tokens que realmente le enrutan. Se podan los expertos enrutados (`mlp.experts.*.{gate,up,down}_proj`), las filas del router (`mlp.gate.weight`, recortado a `[128, 2048]`) y el sesgo por experto (`e_score_correction_bias`, recortado a `[128]`). Quedan intactos el MLP denso de la capa 0, los expertos compartidos, las proyecciones de atencion con sus q/k norms, `lm_head`, `embed_tokens` y las layer norms. La seleccion top-8 del router se mantiene, pero operando sobre los 128 expertos supervivientes. Los indices retenidos por capa se guardan en `retained_experts.json`.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantilla de chat.
- Razonamiento y matematicas: la calibracion se hizo sobre un dataset de matematicas con personas, lo que sugiere uso previsto en tareas de razonamiento.
- Inferencia en CPU sobre AMD EPYC con ZenDNN y ZenTorch, sin necesidad de GPU.
- Compatibilidad con compressed-tensors y LLM Compressor para pipelines de compresion posteriores.
- Integracion con vLLM v0.34.0 (backend CPU) y Transformers v5.20.2.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Inferencia de un MoE de 17,7 B en servidores sin GPU: el checkpoint podado cabe en 33 GiB de RAM y se ejecuta sobre EPYC con ZenDNN, lo que permite desplegar un modelo grande en infraestructura CPU-only ya existente.
- Servicio de chat en ingles de bajo coste energetico: al eliminar el 50 % de los expertos enrutados, se reduce el coste de computo por token en CPU manteniendo el experto compartido y el router funcionales.
- Procesamiento por lotes de texto en entornos on-premise: la licencia openmdw-1.1 y el formato safetensors permiten integrar el modelo en pipelines internos de clasificacion, resumen o extraccion sin dependencia de nube.
- Base para cuantizacion adicional: al no llevar `quantization_config`, el checkpoint es un punto de partida limpio para aplicar GPTQ, AWQ o FP8 con LLM Compressor y reducir aun mas la huella de memoria.
- Evaluacion comparativa de tecnicas de poda: `retained_experts.json` y el recipe reproducible permiten medir el impacto de REAP al 50 % frente al modelo original en tareas de razonamiento.
- Despliegue en vLLM sobre CPU para APIs internas: el modelo es compatible con el motor vLLM v0.34.0 y puede servirse como endpoint de generacion de texto en ingles.
- Investigacion en eficiencia de MoE: sirve como caso de estudio de como la poda por contribucion de router afecta a la calidad frente a la poda aleatoria o por magnitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica para el caso de uso previsto (CPU). En memoria del sistema, el checkpoint ocupa 33,0 GiB en BF16; la inferencia necesita margen adicional para el estado de atencion y buffers, por lo que se recomienda al menos 48-64 GiB de RAM.
- CPU recomendada: AMD EPYC con soporte ZenDNN (la model card indica AMD EPYC como hardware soportado).
- GPU: el modelo esta optimizado para CPU; no se documenta soporte GPU especifico. Cabe en una A100 80 GB o H100 80 GB en BF16 si se usa un backend GPU, pero no es el escenario validado.
- Consumer GPU: no cabe en GPUs de consumo de 24 GB en BF16; requeriria cuantizacion adicional no incluida en este checkpoint.
- Opciones de despliegue: vLLM v0.34.0 (backend CPU), Transformers v5.20.2 con PyTorch 2.14.0+cpu, ZenDNN y ZenTorch. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Sistema operativo: Linux (preferido).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos por capa MoE | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| amd/Laguna-XS-2.1-reap-50-llmcompressor | 17,7 B | 128 (podado desde 256) | no disponible | openmdw-1.1 | CPU AMD EPYC |
| poolside/Laguna-XS-2.1 | no disponible (original, 62,3 GiB BF16) | 256 | no disponible | openmdw-1.1 | no disponible |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- La poda al 50 % elimina la mitad de los expertos enrutados sin reentrenamiento posterior, lo que puede degradar la calidad en dominios poco representados en el conjunto de calibracion (matematicas con personas).
- La calibracion uso solo 128 muestras de un unico dataset; la seleccion de expertos puede estar sesgada hacia ese dominio.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- La licencia openmdw-1.1 debe revisarse antes de uso comercial; no se detallan restricciones en la informacion proporcionada.
- El checkpoint no incluye cuantizacion; desplegarlo en memoria limitada requiere un paso adicional de compresion.
- La longitud de contexto no se especifica; la calibracion a 2048 tokens no garantiza buen rendimiento en ventanas mayores.
- Dependencia de un stack concreto (PyTorch 2.14.0+cpu, Transformers 5.20.2, vLLM 0.34.0, ZenDNN); versiones distintas pueden no funcionar.
- No hay datos de benchmarks que permitan cuantificar la perdida de calidad frente al modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Laguna-XS-2.1-reap-50-llmcompressor
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- LLM Compressor (repositorio): https://github.com/vllm-project/llm-compressor
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Dataset de calibracion: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-math
