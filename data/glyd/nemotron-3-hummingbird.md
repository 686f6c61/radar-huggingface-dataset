# glyd/nemotron-3-hummingbird

## Resumen
Nemotron 3 Hummingbird es un checkpoint cuantificado del modelo Nemotron 3 Super (120B-A12B) de NVIDIA, publicado por el usuario glyd bajo su motor de inferencia homónimo. El modelo base es un MoE (mezcla de expertos) de 120.000 millones de parámetros totales y 12.000 millones activos, del que se han comprimido los expertos enrutados (el 93% de los pesos) a 2,99 bits por peso y el resto de matrices a 6 bits, reduciendo el peso de 241,4 GB en bf16 a 48,7 GB. La propuesta central es permitir ejecutar un modelo de 120B en una única GPU de consumo de 16–24 GB, volcando a la memoria del sistema (o al SSD) los expertos que no caben en la VRAM.

El checkpoint no es sin pérdida: la perplejidad sube un 10,3% respecto al bf16 y la coincidencia de token top-1 en los expertos enrutados es del 93,4% sobre posiciones reservadas. Está pensado exclusivamente para el motor Glyd (no para vLLM ni transformers), que reparte la computación entre GPU y CPU según qué expertos estén residentes en la tarjeta gráfica.

Es relevante ahora porque baja el umbral de hardware para modelos frontera de razonamiento de gran tamaño, aunque introduce dependencias fuertes de software (engine propietario, driver 580+, Linux con GPU Ampere o posterior) y de licencia, dado que el motor es BUSL-1.1 y solo gratuito para uso personal y no comercial.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre columna `nemotron_h`; la familia Nemotron 3 se describe como hibrida Mamba-Transformer MoE, si bien la model card de este checkpoint no detalla la composicion exacta |
| Parametros totales | 120.000 millones (arquitectura base 120B-A12B); el safetensors empaquetado declara 48.571.944.194 valores |
| Parametros activos | 12.000 millones (12B, segun la nomenclatura 120B-A12B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion propietaria Glyd: expertos enrutados a 2,99 bits por peso (codebooks por neurona, 8 entradas a 3 bits o 4 a 2 bits), resto de matrices a 6 bits; etiquetada como "8-bit" en el Hub por conteo de bytes empaquetados |
| Idiomas soportados | no disponible |
| Licencia | Pesos: NVIDIA Nemotron Open Model License. Motor Glyd: BUSL-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
Se trata de un modelo de lenguaje de tipo mezcla de expertos (MoE) derivado de nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16 (commit 2dc98e2a). La innovacion de este checkpoint no esta en el entrenamiento, sino en la compresion: cada neurona experta es una fila de 1.024 valores con su propio codebook reducido (8 entradas a 3 bits, 4 a 2 bits) en una base rotada por capa. Dentro de cada capa, el 40% de expertos mas usados se codifican a 3 bits y el resto a 2 bits. Los codigos provienen de una calibracion puntual contra el modelo bf16, no de reentrenamiento. No se documentan en la informacion disponible los tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO, ya que corresponden al modelo base de NVIDIA.

La caracteristica operativa diferencial es el reparto dinamico de computo: cuando el modelo excede la memoria de la GPU, el motor de Glyd mantiene en la tarjeta los expertos mas solicitados y deja el resto en la memoria del sistema, de modo que la CPU calcula los expertos no residentes mientras la GPU ejecuta los que si lo estan. La ficha tambien menciona modos "thinking" y "non-thinking" (los benchmarks se ejecutan en modo non-thinking), lo que sugiere que el modelo base dispone de razonamiento extendido, aunque este checkpoint no lo detalla.

## Capacidades
- Generacion de texto conversacional en espanol e idiomas no confirmados (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento aritmetico y de problemas de nivel escolar: 97,0% en GSM8K (10-shot, non-thinking).
- Razonamiento de conocimiento general: 76,6% en MMLU-Pro (0-shot cadena de pensamiento, non-thinking).
- Ejecucion local en una sola GPU de consumo de 16–24 GB, con reparto GPU/CPU de expertos.
- Modo de decodificacion greedy con temperatura 0 verificada en el harness de evaluacion (Inspect AI 0.3.278, inspect_evals 0.24.0).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, uso de agentes, vision, audio ni soporte multilingue explicito.

## Casos de uso
- Asistente de razonamiento en local sobre una RTX 4090 o 3090: el modelo permite obtener respuestas de nivel MMLU-Pro de 76,6% sin enviar datos a la nube, a 45,5 tok/s (4090) o 37,0 tok/s (3090) con 190–192 de los 512 expertos por capa en la GPU.
- Despliegue en equipos de 16 GB de VRAM: en una tarjeta con presupuesto de 15 GiB libres el modelo genera a 38,1 tok/s, lo que lo hace viable para estaciones con GPUs de gama media-alta que no pueden alojar un 120B en bf16.
- Servicio conversacional multi-turno de baja concurrencia: gracias a la arquitectura MoE con 12B de parametros activos y al modo de decodificacion greedy, encaja en atencion al cliente o asistentes internos donde el coste por token importa mas que el throughput agregado.
- Prototipado e investigacion con presupuesto de hardware ajustado: permite experimentar con tecnicas de razonamiento de un modelo de 120B sin acceso a un nodo multi-GPU A100/H100.
- Procesamiento con requisito de privacidad: al ejecutarse integramente en hardware propio (GPU mas memoria del sistema), es adecuado para datos sensibles que no pueden salir de la organizacion, siempre que la licencia BUSL-1.1 del motor lo permita.
- Evaluacion de tecnicas de cuantizacion extrema: sirve como caso de estudio medible de cuantizacion con codebooks a nivel de neurona, con metricas de divergencia KL (0,014) y acuerdo top-1 (93,4%) respecto al bf16.
- Razonamiento matematico asistido en entornos educativos o de analisis: con 97,0% en GSM8K puede resolver problemas aritmeticos encadenados de forma local.

## Benchmarks y rendimiento
| Benchmark | Este checkpoint | Preguntas | Configuracion |
|---|---:|---:|---|
| GSM8K (10-shot, non-thinking) | 97,0% | 300 | Inspect AI 0.3.278, inspect_evals 0.24.0, via `glyd serve`, temperatura 0 |
| MMLU-Pro (0-shot cadena de pensamiento, non-thinking) | 76,6% | 222 | Inspect AI 0.3.278, inspect_evals 0.24.0, via `glyd serve`, temperatura 0 |

Fidelidad respecto al bf16 (modelo bf16 ejecutado capa a capa como referencia):

| Medida | Resultado |
|---|---:|
| Token top-1 identico al bf16, modelo completo, 97 posiciones teacher-forced | 96,9% |
| Divergencia KL respecto al bf16 en esas posiciones | 0,014 |
| Token top-1 identico al bf16, solo expertos enrutados, 49.128 posiciones reservadas en seis dominios | 93,4% |
| Perplejidad en esas posiciones (bf16: 3,021) | 3,334 (+10,3%) |

Nota: el modelo bf16 no se ejecuto en el mismo harness, por lo que no hay una comparacion directa bajo identicas condiciones.

## Requisitos de hardware
- VRAM: 14,0 GiB en uso con contexto de 4K en una tarjeta de 16 GB (84 de 512 expertos por capa en GPU); 22,2 GiB en uso en una tarjeta de 24 GB (190–192 expertos por capa).
- GPU compatibles: NVIDIA Ampere o posterior, con driver 580 o superior. No soporta vLLM ni transformers; requiere el motor Glyd (`glyd run`, `glyd serve`) sobre Linux.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB, 45,5 tok/s), RTX 3090 (24 GB, 37,0 tok/s) y tarjetas de 16 GB (38,1 tok/s).
- Memoria del sistema: 64 GB para velocidad completa (los expertos ocupan 39,2 GiB en RAM). Con 32 GB funciona leyendo del SSD los expertos que no caben: 17,7 tok/s en tarjeta de 24 GB y 13,1 tok/s en tarjeta de 16 GB (medido con NVMe de 7 GB/s).
- Opciones de despliegue: exclusivamente el motor Glyd (`glyd run`, `glyd serve`). No compatible con vLLM, TGI, llama.cpp ni Ollama.
- Throughput: 38,1–45,5 tok/s en decodificacion greedy de un unico usuario con los expertos no residentes calculados por CPU; cae a 13,1–17,7 tok/s si parte de los expertos se leen del SSD.

## Comparativa con modelos similares
| Modelo | Parametros totales / activos | Peso | Contexto | Licencia | Motor / disponibilidad |
|---|---|---|---|---|---|
| glyd/nemotron-3-hummingbird | 120B / 12B | 48,7 GB | no disponible | NVIDIA Nemotron Open Model License (pesos); BUSL-1.1 (motor) | Solo Glyd |
| nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16 | 120B / 12B | 241,4 GB | no disponible en la informacion | NVIDIA Nemotron Open Model License | bf16, requiere hardware de mayor capacidad |
| NVIDIA Nemotron 3.5 Lightning | 30B / 3B (MoE) | no disponible | no disponible | no disponible | familia Nemotron; distinto tamano y orientacion |
| NVIDIA Nemotron 3 Nano Omni | 30B / 3B (MoE, Mamba-Transformer multimodal) | no disponible | no disponible | no disponible | familia Nemotron; distinto tamano y modalidades |

Nota: los dos ultimos se incluyen como referencias de la familia Nemotron segun la busqueda web; no son alternativas del mismo tamano y no hay datos suficientes para una comparacion de rendimiento bajo identico harness.

## Limitaciones y advertencias
- Cuantizacion con perdida: perplejidad un 10,3% superior al bf16 y solo 93,4% de coincidencia top-1 en expertos enrutados sobre posiciones reservadas. No debe tratarse como equivalente al modelo original.
- La etiqueta "8-bit" del Hub es enganosa: refleja bytes empaquetados, mientras que los expertos enrutados se codifican a 2,99 bits por peso.
- No compatible con vLLM ni transformers; queda atado al motor propietario Glyd.
- La licencia del motor (BUSL-1.1) solo es gratuita para uso personal y no comercial en equipos propios; el uso comercial exige licencia adicional.
- Los pesos heredan la NVIDIA Nemotron Open Model License; conviene revisar sus condiciones de uso comercial y de redistribucion.
- Requisitos de plataforma estrictos: Linux, GPU NVIDIA Ampere o posterior y driver 580 o superior.
- Riesgo de alucinacion no cuantificado en la informacion disponible, inherente a modelos generativos de este tipo.
- Idiomas soportados no declarados: no hay garantia de calidad multilingue mas alla del ingles de los benchmarks.
- Longitud de contexto no especificada; los datos de rendimiento y memoria se midieron a 4K de contexto.
- El rendimiento depende de la memoria del sistema: con menos de 64 GB de RAM, parte de los expertos se leen del SSD y el throughput cae por debajo de 18 tok/s.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces
- Checkpoint en HuggingFace: https://huggingface.co/glyd/nemotron-3-hummingbird
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Commit del modelo base usado: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16/tree/2dc98e2a
- Licencia de pesos (NVIDIA Nemotron Open Model License): https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Motor Glyd: https://getglyd.com
- Instalacion del motor: https://getglyd.com/install.sh
- Nemotron en NVIDIA Developer: https://developer.nvidia.com/topics/ai/nemotron
- Repositorio NVIDIA-NeMo/Nemotron en GitHub: https://github.com/NVIDIA-NeMo/Nemotron/tree/main
- Referencia de la familia Nemotron 3: https://www.llmreference.com/model-family/nemotron-3
- Portal de NVIDIA Nemotron AI: https://nemotron-ai.com/
