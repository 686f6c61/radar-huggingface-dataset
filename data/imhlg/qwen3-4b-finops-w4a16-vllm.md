# imhlg/qwen3-4b-finops-w4a16-vllm

## Resumen

`qwen3-4b-finops-w4a16-vllm` es un checkpoint de servicio derivado de Qwen/Qwen3-4B, publicado por el usuario imhlg en el contexto del sprint "Applied AI Foundry (v4.0)" de curons.com. No se trata de un modelo preentrenado desde cero, sino de un artefacto de post-entrenamiento que documenta el flujo completo de ajuste fino y compresión para despliegue en producción: un QLoRA de 4 bits sobre el modelo base y una posterior cuantización W4A16 con `llm-compressor` para servir con vLLM.

El modelo base Qwen3-4B es un transformer denso de aproximadamente 4.022 millones de parámetros (4,02 B), desarrollado por el equipo Qwen de Alibaba. Sobre él se aplicó un ajuste QLoRA con cuantización NF4 de bitsandbytes y doble cuantización, con rango r=8 y alpha=16, mediante el `SFTTrainer` de TRL. Los deltas del LoRA se fusionaron de vuelta a `bfloat16` y el checkpoint resultante se comprimió a formato GPTQ W4A16 (pesos de 4 bits, activaciones de 16 bits) para su explotación con el kernel Marlin de vLLM.

Su relevancia es fundamentalmente metodológica y operativa: sirve como referencia reproducible de una cadena de post-entrenamiento completa (entrenamiento cuantizado, fusión, compresión y servicio) y como artefacto ligero de 2,47 GB apto para despliegue en GPU de consumo. La model card no documenta el corpus de ajuste fino ni datos de evaluación de calidad, por lo que debe tratarse como una pieza de infraestructura más que como un modelo con garantías de rendimiento verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), derivado del modelo base Qwen/Qwen3-4B |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B; el autor no la declara) |
| Tipos de cuantizacion | W4A16 (GPTQ via `llm-compressor`); el entrenamiento uso NF4 de 4 bits con doble cuantizacion (bitsandbytes) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato `compressed-tensors`, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3 con 4,02 B de parametros. El proceso de post-entrenamiento consta de dos fases documentadas en la model card. En la fase de entrenamiento se aplico QLoRA con cuantizacion NF4 de 4 bits y doble cuantizacion de bitsandbytes, con rango r=8 y alpha=16, usando el `SFTTrainer` de TRL. El entrenamiento se ejecuto en una NVIDIA L4 de Colab con un pico de memoria CUDA de 4,11 GB, completando 30 pasos en 88,2 segundos con una reduccion de perdida de 3,6569 a 0,9182. Como referencia, la model card incluye una linea base en Apple M4 con `bfloat16` sobre MPS: 7,50 GB de memoria del driver Metal y 10,5 tok/s en un SFT de 15 pasos en 95,8 segundos.

En la fase de servicio, los deltas del LoRA se fusionaron de vuelta a `torch.bfloat16` con `merge_and_unload()`, generando un checkpoint de 7,49 GB. Ese checkpoint se comprimio con GPTQ W4A16 de `llm-compressor` hasta 2,47 GB en disco (una reduccion del 67,0 % respecto al BF16 fusionado), con un pico de memoria de 9,14 GB durante la compresion. El resultado se empaqueta en formato `compressed-tensors` para su explotacion con el kernel Marlin de vLLM en CUDA. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3-4B, si bien el ajuste fino se oriento a un dominio FinOps segun la nomenclatura del checkpoint.
- Codigo y matematicas: capacidades propias de la familia Qwen3, no verificadas de forma independiente en este checkpoint.
- Tool calling y function calling: no documentado en la model card; debe validarse empiricamente antes de asumirlo.
- Agentes y razonamiento multi-paso: no documentado para este checkpoint concreto.
- Capacidades multilingues: no disponibles; el autor no declara el conjunto de idiomas soportados.
- Modo thinking: no documentado en la informacion proporcionada.
- Vision y audio: no soportados (modelo de texto).
- Servicio optimizado: formato W4A16 compatible con vLLM y kernel Marlin, pensado para inferencia de baja huella en CUDA.

## Casos de uso

- Despliegue de bajo coste en GPU de consumo: con 2,47 GB en disco y pesos de 4 bits, el checkpoint permite servir un modelo de 4 B en tarjetas con 8 GB de VRAM, reduciendo el coste por instancia en entornos de desarrollo y staging.
- Referencia reproducible de pipelines QLoRA: el flujo documentado (NF4 + doble cuantizacion, `merge_and_unload()`, GPTQ W4A16 y vLLM) sirve como plantilla para equipos que quieran replicar el handoff de entrenamiento a servicio con sus propios datos.
- Analisis de costes cloud y FinOps asistido: dada la orientacion del ajuste, puede emplearse para resumir facturas, clasificar lineas de coste o responder consultas sobre consumo de recursos, siempre que se valide la calidad con un conjunto de evaluacion propio.
- Automatizacion de soporte interno: con un modelo de 4 B servido en vLLM se pueden gestionar conversaciones multi-turno de back-office donde la latencia y el coste importan mas que el razonamiento de frontera.
- Clasificacion y extraccion de entidades en texto: tareas de etiquetado, enrutamiento de tickets o extraccion de campos estructurados en las que un modelo pequeno cuantizado ofrece un coste por token muy bajo.
- Prototipado rapido en CI/CD: el formato `compressed-tensors` y la compatibilidad con vLLM facilitan incluir el modelo en pipelines de pruebas de integracion con imagenes de contenedor ligeras.
- Evaluacion comparativa de tecnicas de cuantizacion: util como punto de partida para medir la degradacion de calidad entre BF16, NF4 y W4A16 sobre la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento y de huella de memoria:

| Metrica | Valor |
|---|---|
| Perdida SFT (30 pasos, L4) | 3,6569 -> 0,9182 |
| Tiempo de entrenamiento (30 pasos, L4) | 88,2 s |
| Pico de memoria CUDA en entrenamiento | 4,11 GB |
| Tamano del checkpoint fusionado BF16 | 7,49 GB |
| Tamano del checkpoint W4A16 | 2,47 GB (-67,0 %) |
| Pico de memoria en compresion | 9,14 GB |
| Throughput reportado (W4A16) | 12,0 tok/s |
| Throughput linea base (M4, bfloat16) | 10,5 tok/s |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 a 3 GB para los pesos W4A16, mas el espacio de cache KV y overhead del runtime; en la practica, entre 4 y 6 GB para contextos moderados.
- GPU recomendadas: NVIDIA L4, A10G, A100 y H100 para produccion; RTX 4090 y RTX 3090 para desarrollo. El kernel Marlin de vLLM requiere CUDA.
- GPU de consumo: si, cabe en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante).
- Opciones de despliegue: vLLM es el runtime objetivo declarado (formato `compressed-tensors` con Marlin). No se documenta soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: el autor reporta 12,0 tok/s en el entorno de compresion; no se especifica la GPU exacta de esa medicion ni el tamano de lote, por lo que la cifra debe tomarse como orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-finops-w4a16-vllm | 4,02 B | No disponible | W4A16 (GPTQ) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B (base) | 4,02 B | No disponible en la informacion | BF16 original | Apache 2.0 | Hugging Face |
| Checkpoint BF16 fusionado (intermedio) | 4,02 B | No disponible | BF16 | Apache 2.0 | No publicado como repo independiente |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este checkpoint con alternativas de la misma categoria. La comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni conjunto de evaluacion publicado, ni descripcion del dataset de ajuste fino; no es posible afirmar que el ajuste haya mejorado alguna capacidad concreta.
- Riesgo de degradacion por cuantizacion: la compresion a W4A16 puede introducir perdida de calidad respecto al BF16 fusionado; debe medirse tarea a tarea antes de produccion.
- Riesgo de alucinacion: inherente a los modelos de 4 B, especialmente en dominios especializados como FinOps, donde los datos numericos exigen verificacion.
- Sesgos: no documentados por el autor; el modelo hereda los sesgos del corpus de Qwen3-4B y del dataset de ajuste, que no se describe.
- Idiomas: el autor no declara el conjunto de idiomas soportados; no se debe asumir cobertura multilingue sin pruebas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-4B y de las herramientas empleadas (bitsandbytes, TRL, `llm-compressor`).
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta; es un experimento de sprint, no un checkpoint convalidado por la comunidad.
- Dependencia de vLLM con CUDA: el formato esta pensado para el kernel Marlin; fuera de ese stack el soporte no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imhlg/qwen3-4b-finops-w4a16-vllm
- Perfil del autor: https://huggingface.co/imhlg
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Sitio del sprint: https://curons.com
- `llm-compressor`: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
- TRL: https://github.com/huggingface/trl
- bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
