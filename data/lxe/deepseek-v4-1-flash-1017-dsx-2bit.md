# lxe/DeepSeek-V4.1-Flash-1017-dsx-2bit

## Resumen

DeepSeek-V4.1-Flash-1017-dsx-2bit es una cuantizacion de precision mixta en 2 bits del modelo DeepSeek-V4.1-Flash-1017, un transformer MoE (mezcla de expertos) de gran escala desarrollado por DeepSeek. La cuantizacion la firma el usuario lxe y esta disenada especificamente para el motor de inferencia dsx (Rust + CUDA), con el objetivo de hacer viable un modelo de 552B parametros totales en hardware de consumo: dos GPU de 24 GB (RTX 3090, 4090 o 5090) junto con 128 GB de RAM.

El modelo base combina una arquitectura MoE de 552B parametros con un componente adicional denominado "Engram" de 196B, que se carga desde los shards oficiales del checkpoint original. Esta build concreta ocupa 148 GB en cuatro shards GGUF, mas los 203 GB de los shards Engram oficiales, y aplica routing exacto (sin poda de expertos ni sesgo de router), lo que la distingue de otras cuantizaciones agresivas que sacrifican calidad de enrutamiento.

Su relevancia actual radica en que permite ejecutar localmente un modelo de clase frontier con contexto de 131.072 tokens a velocidades de decodificacion de aproximadamente 29 tok/s en dos RTX 3090, un rendimiento notablemente superior al de llama.cpp con cuantizaciones comparables. El coste es una perdida de calidad medible frente al modelo FP8 original (KL 0.373, top-1 74.4%), que el autor documenta de forma transparente junto con alternativas de mayor fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) + componente Engram |
| Parametros totales | 551.880.865.904 (552B) |
| Parametros activos | 196B Engram (segun model card; no se detalla el reparto activo del MoE) |
| Longitud de contexto | 131.072 tokens (valor usado en el ejemplo de despliegue) |
| Tipos de cuantizacion | Precision mixta por experto: ternary, Q2_0 o Q3_K para expertos; Q8_0 para capas densas; media de 2,03 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards) + shards safetensors oficiales para Engram y tokenizer |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 552B parametros con un modulo Engram de 196B que se mantiene en los shards oficiales sin cuantizar. La cuantizacion de lxe aplica precision mixta por experto: cada experto se asigna a ternary, Q2_0 o Q3_K segun su sensibilidad, mientras que las capas densas se mantienen en Q8_0. El enrutamiento es exacto: no se poda ningun experto ni se introduce sesgo en el router, lo que preserva la distribucion de activacion original a costa de requerir que todos los expertos esten accesibles en VRAM o RAM.

El autor indica que la calibracion se realizo sobre las trazas de razonamiento del propio modelo completo, ademas de texto de agentes, lo que ajusta los pesos cuantizados a los patrones de activacion tipicos en tareas de razonamiento y uso de herramientas. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO. La build requiere una version de dsx posterior al 19 de octubre de 2026, ya que versiones anteriores no reconocen la rotacion aplicada y producen salidas corruptas.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de razonamiento configurable (reasoning effort low en las pruebas del autor).
- Razonamiento matematico: el autor evalua con problemas de Omni-MATH y reporta respuestas correctas en todas las ejecuciones de prueba.
- Uso como agente: la model card menciona calibracion sobre texto de agentes y prompts de agente de 3K tokens en las mediciones de velocidad.
- Tool calling y function calling: el runtime dsx expone API compatible con OpenAI y Anthropic, lo que habilita integracion con clientes que esperan esos esquemas.
- Entrada de imagen: el runtime dsx soporta image input segun la model card.
- Contexto largo: ventana de 131.072 tokens configurable en el servidor.
- Capacidades multilingues: no disponible (los idiomas no estan declarados en la informacion proporcionada).

## Casos de uso

- Razonamiento matematico asistido en local: el modelo mantiene respuestas correctas en problemas de Omni-MATH con cadenas de razonamiento de 8K a 18K tokens; adecuado para equipos que necesitan verificar razonamientos largos sin enviar datos a la nube.
- Agentes de codigo en estaciones de trabajo: con tool calling via API compatible con OpenAI y contexto de 131K tokens, se puede integrar en editores o pipelines que requieran lectura de repositorios completos y ejecucion de herramientas.
- Procesamiento de documentos largos: la ventana de 131.072 tokens permite analizar contratos, informes o bases de codigo extensas en una sola pasada, con el modelo corriendo en dos GPU de consumo.
- Investigacion en cuantizacion: la build sirve como referencia reproducible para estudiar el impacto de la precision mixta por experto en calidad (KL, top-1, perplejidad) frente a FP8 y otras cuantizaciones.
- Despliegue de inferencia privada: al ejecutarse en hardware propio con licencia MIT, encaja en entornos con requisitos de soberania de datos donde no se permite usar APIs externas.
- Evaluacion comparativa de motores: el autor publica metricas de dsx frente a llama.cpp con las mismas condiciones, lo que permite usar esta build como banco de pruebas para comparar runtimes de inferencia MoE.
- Prototipado de asistentes con vision: el soporte de image input en dsx permite construir asistentes que combinen texto e imagenes en local, aunque la calidad de vision no esta cuantificada en la informacion disponible.

## Benchmarks y rendimiento

Calidad medida en el conjunto Lucebox 1017 (8 x 1.024 tokens contra los top-256 log-probs del modelo FP8):

| Modelo | Expertos | KL (menor mejor) | Top-1 | Perplejidad |
|---|---|---:|---:|---:|
| FP8 / FP4 original | FP4 | 0 | 100% | 8,56 |
| Unsloth UD-Q2_K_XL | ~224 GB sin Engram | 0,114 | 85,7% | 9,04 |
| Lucebox ROCMFP | 2,5 bpw | 0,253 | 78,7% | 9,78 |
| Unsloth UD-IQ1_S | ~122 GB sin Engram | 0,361 | 75,1% | 10,76 |
| **dsx 2-bit** | **2,03 bpw, 148 GB** | **0,373** | **74,4%** | **10,68** |

Velocidad (decodificacion greedy, routing exacto, 400 tokens generados):

| Metrica | 2x RTX 3090, 128 GB DDR4 | RTX 5090, 128 GB DDR5 |
|---|---:|---:|
| Decode, prosa | 28,9 tok/s | 12,0 tok/s |
| Decode, prompt de agente de 3K | 28,7 tok/s | 15,2 tok/s |
| Prefill, 3K / 8K tokens | 301 / 470 tok/s | 93 / 172 tok/s |

En la misma maquina con 2x RTX 3090, Unsloth UD-IQ1_M en llama.cpp alcanza 12,0 tok/s de decode y 75-109 tok/s de prefill con el prompt de agente de 3K. En razonamiento, el modelo 2-bit genera entre 7,8K y 18,2K tokens en dos problemas de Omni-MATH, frente a una mediana de 9,4K-10,7K del FP8 alojado, es decir, razona hasta aproximadamente el doble en problemas dificiles.

## Requisitos de hardware

- VRAM: dos GPU NVIDIA de 24 GB (RTX 3090, 4090 o 5090) con todos los expertos en VRAM + RAM; una sola GPU de 32 GB deja unos 40 GB de expertos que deben leerse de disco.
- RAM: 128 GB (DDR4 en el caso medido con 3090, DDR5 con 5090).
- CPU: con soporte AVX2.
- Almacenamiento: aproximadamente 350 GB de NVMe (148 GB de la cuantizacion + 203 GB de shards Engram oficiales).
- Despliegue: exclusivamente mediante el motor dsx (Rust + CUDA), compilado con `CUDA_ARCHS=86` para RTX 30xx o `120` para RTX 50xx. No es compatible con llama.cpp, vLLM, TGI ni Ollama.
- Latencia y throughput: ~29 tok/s de decode y 300-470 tok/s de prefill en 2x RTX 3090; 12-15 tok/s de decode y 93-172 tok/s de prefill en una RTX 5090. La opcion `--defer-rank 3` eleva el decode a 35,7 tok/s.

## Comparativa con modelos similares

| Build | Hardware objetivo | Descarga | KL / top-1 vs FP8 | Decode |
|---|---|---|---:|---:|
| dsx-t16 (recomendada) | 2x 24 GB GPU + 128 GB RAM | 302 GB | 0,194 / 81,4% | 34,9 tok/s |
| dsx-ud | 2x 24 GB GPU + 128 GB RAM | 305 GB | 0,272 / 79,0% | 27-29,5 tok/s |
| **dsx-2bit** | 2x 24 GB GPU + 128 GB RAM | 148 GB + 203 GB Engram | 0,373 / 74,4% | ~29 tok/s |
| dsx-mxfp4 | 1x AMD MI325X (256 GiB) | 270 GB + 203 GB Engram | 0,049 / 90,6% | 110-114 tok/s |
| Unsloth UD-IQ1_S (llama.cpp) | no disponible | ~122 GB sin Engram | 0,361 / 75,1% | no disponible |
| Unsloth UD-Q2_K_XL (llama.cpp) | no disponible | ~224 GB sin Engram | 0,114 / 85,7% | no disponible |

La build 2-bit ofrece la descarga mas pequena del ecosistema dsx (148 GB) a costa de la mayor perdida de calidad entre las builds dsx (KL 0,373). Frente a Unsloth UD-IQ1_S en llama.cpp, la calidad es ligeramente inferior (KL 0,373 vs 0,361) pero el decode es mas de el doble de rapido en la misma maquina (28,9 vs 12,0 tok/s). Para maxima fidelidad en el mismo hardware, el autor recomienda dsx-t16.

## Limitaciones y advertencias

- Perdida de calidad medible: KL 0,373 y top-1 74,4% frente al FP8, con perplejidad de 10,68 frente a 8,56. Es la build de menor fidelidad de la familia dsx.
- Razonamiento inflado: en problemas dificiles genera hasta aproximadamente el doble de tokens de razonamiento que el FP8, lo que incrementa la latencia y el coste por consulta.
- Dependencia estricta de dsx: requiere una version posterior al 19 de octubre de 2026; versiones anteriores producen salidas corruptas por no conocer la rotacion. No funciona en llama.cpp, vLLM ni otros runtimes.
- Requiere descargar los shards Engram oficiales del modelo base (203 GB) ademas de la cuantizacion, lo que complica el despliegue y el consumo de disco.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable que la cuantizacion agresiva lo incremente respecto al original, pero no hay datos.
- Idiomas soportados: no declarados; no se puede garantizar calidad multilingue.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base DeepSeek-V4.1-Flash-1017 antes de produccion.
- La velocidad depende de que todos los expertos quepan en VRAM + RAM; con menos memoria, parte de los expertos se leen de disco y el rendimiento cae.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lxe/DeepSeek-V4.1-Flash-1017-dsx-2bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build recomendada dsx-t16: https://huggingface.co/lxe/DeepSeek-V4.1-Flash-1017-dsx-t16
- Build dsx-ud: https://huggingface.co/lxe/DeepSeek-V4.1-Flash-1017-dsx-ud
- Build dsx-mxfp4: https://huggingface.co/lxe/DeepSeek-V4.1-Flash-1017-dsx-mxfp4
- Motor dsx: https://github.com/lxe/dsx
- Herramienta de evaluacion Lucebox: https://github.com/lxe/dsx/tree/main/amd/tools/lucebox-eval
- Conjunto de evaluacion: https://huggingface.co/Lucebox/DeepSeek-V4.1-Flash-1017-ROCMFP-GGUF
- Paper GPTQ (arxiv:2210.17323): https://arxiv.org/abs/2210.17323
- Paper arxiv:2402.04396: https://arxiv.org/abs/2402.04396
- Paper arxiv:2404.00456: https://arxiv.org/abs/2404.00456
