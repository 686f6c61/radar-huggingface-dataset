# mlx-community/ACE-Step-1.5-planner-1.7B-8bit

## Resumen

ACE-Step-1.5-planner-1.7B-8bit es la conversion a MLX en 8 bits del planificador (planner) de ACE-Step 1.5, un sistema de generacion de audio y musica texto-a-audio desarrollado por ACE Studio y StepFun. Este bundle concreto no es un modelo autonomo de generacion de audio: es el modelo de lenguaje que, dentro del pipeline de ACE-Step 1.5, produce a 5 Hz los planes latentes que el DiT turbo consume para sintetizar la cancion final. La conversion la mantiene la organizacion mlx-community a partir de los pesos originales de ACE-Step/Ace-Step1.5.

El planner es un transformer denso de 1.854.243.840 parametros (1,7B) construido sobre una base Qwen3 (Apache-2.0), afinado por ACE-Step y publicado bajo licencia MIT. La cuantizacion es afin de 8 bits con grupo de 64 sobre las 196 capas Linear de sus 28 bloques, mientras que el embedding/head atado (217.204 x 2.048) y las normas permanecen en bf16. El resultado ocupa 2,39 GB en el Hub frente a los 3,71 GB del bundle bf16 y los 1,68 GB del de 4 bits.

Su relevancia practica es doble: por un lado, es el planner por defecto del paquete xocialize/mlx-ace-step-swift desde la version 0.2.0, lo que lo convierte en la pieza que la mayoria de usuarios de ACE-Step 1.5 en Apple Silicon carga realmente; por otro, demuestra que la cuantizacion a 8 bits no degrada la calidad del planificador en las pruebas del port (PER 0,108 frente a 0,120-0,197 del bf16). Para quien investigue pipelines de generacion musical en hardware de consumo, es una referencia directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3 (planificador de 5 Hz del pipeline ACE-Step 1.5) |
| Parametros totales | 1.854.243.840 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afin, group size 64 (`mx.quantize`); variantes bf16 y 4 bits publicadas en la misma familia |
| Idiomas soportados | no disponible |
| Licencia | MIT (fine-tune de ACE-Step); base Qwen3 Apache-2.0 |
| Formato de pesos | safetensors (MLX, layout de mlx-lm con `weight` uint32 empaquetado + `scales` + `biases`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 28 capas y 1,7B parametros derivado de Qwen3, reutilizado como planificador de un sistema de difusion para audio. En ACE-Step 1.5 el planner opera a 5 Hz: genera la secuencia de planes latentes que condiciona al DiT turbo, que es quien sintetiza finalmente el audio a 48 kHz estereo. El bundle incluye el embedding y el head atados (217.204 x 2.048) en bf16, ademas de las normas sin cuantizar; solo las 196 capas Linear se almacenan en 8 bits.

Sobre el entrenamiento no se detalla en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO; la model card solo indica que el fine-tune es de ACE-Step sobre base Qwen3 y remite al tech report (arXiv:2602.00744) para los detalles. La innovacion tecnica destacable de este bundle es la conversion: el conversor de xocialize/mlx-ace-step-swift esta validado bit a bit contra `dit_convert.py` y `vae_convert.py` de upstream, y los tensores cuantizados son identicos (702 de 702) a los que produce la ruta de cuantizacion en carga del paquete Swift para su tier `.int8`. Es decir, no hay re-cuantizacion al cargar: el loader construye directamente las `QuantizedLinear` a partir del campo `quantization` de `config.json`.

## Capacidades

- Generacion de planes latentes para sintesis musical texto-a-audio dentro del pipeline ACE-Step 1.5 (caption + lyrics como entrada).
- Produccion de audio a 48 kHz estereo a traves del sistema completo, no de forma aislada: este bundle es solo el planner.
- Soporte de timbre de referencia a partir de audio de referencia.
- Funciones de cover, repaint y extend sobre un clip fuente.
- Generacion de marcas de tiempo LRC para la letra.
- Integracion con MLXEngine en la capacidad `music` mediante MLX Swift.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision ni audio de entrada mas alla de la referencia de timbre.

## Casos de uso

- Generacion de canciones completas en Apple Silicon: el planner produce los planes a 5 Hz que el DiT turbo convierte en una cancion de 48 kHz estereo; es el caso central del paquete mlx-ace-step-swift y el planner por defecto en su tier `.int8`.
- Prototipado de pipelines musicales en portatiles Mac: con 2,39 GB de pesos, el planner cabe holgadamente en memoria unificada de un Mac moderno y permite iterar sobre captions y letras sin GPU dedicada.
- Cover y repaint de clips existentes: el planner, junto con el resto de bundles, permite regenerar secciones de un audio de referencia manteniendo coherencia estilistica.
- Extension de pistas: util para alargar una composicion existente a partir de un fragmento, con el planner generando los planes de continuacion.
- Generacion de bandas sonoras con letra sincronizada: la salida LRC con marcas de tiempo permite alinear la letra con el audio para video, karaoke o subtitulado.
- Evaluacion y comparativa de cuantizaciones: al existir bundles bf16, 8 bits y 4 bits del mismo planner, sirve para medir el impacto de la cuantizacion en la calidad musical (el port reporta PER 0,108 en 8 bits frente a 0,120-0,197 en bf16).
- Investigacion sobre planificadores latentes en modelos de difusion para audio: el modelo es un objeto de estudio acotado (1,7B, 5 Hz) para analizar como un LLM condiciona un DiT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; no aplican a un planner de audio. El unico dato de evaluacion disponible es la metrica del port:

| Metrica | 8 bits (este bundle) | bf16 |
|---|---|---|
| PER en el gate de 12 canciones del port | 0,108 | 0,120-0,197 segun la muestra |
| Equivalencia de tensores con la cuantizacion en carga | 702 / 702 identicos | no aplica |

## Requisitos de hardware

- VRAM/memoria estimada: 2,39 GB solo para los pesos del planner en 8 bits; el pipeline completo requiere ademas el DiT turbo, el text encoder y el VAE, cuyos tamanos no se detallan en la informacion disponible.
- Hardware objetivo: Apple Silicon mediante MLX Swift; no esta pensado para CUDA.
- Cabe en GPU de consumo en el sentido de que 2,39 GB es un tamano reducido, pero el runtime es MLX, por lo que el hardware realista es un Mac con memoria unificada.
- Despliegue: paquete xocialize/mlx-ace-step-swift sobre MLX Swift, integrado con MLXEngine en la capacidad `music`; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este bundle.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Licencia | Uso |
|---|---|---|---|---|---|
| ACE-Step-1.5-planner-1.7B-8bit (este) | 1,85B | MLX safetensors 8 bits | 2,39 GB | MIT | Planner por defecto en el port Swift |
| ACE-Step-1.5-planner-1.7B-bf16 | 1,85B | MLX safetensors bf16 | 3,71 GB | MIT | Mayor fidelidad, mas memoria |
| ACE-Step-1.5-planner-1.7B-4bit | 1,85B | MLX safetensors 4 bits | 1,68 GB | MIT | Menor huella, mayor perdida |
| ACE-Step-1.5-planner-0.6B-bf16 | 0,6B (aprox.) | MLX safetensors bf16 | no disponible | MIT | Planner lite en cualquier tier |

No se dispone en la informacion proporcionada de comparativas con planners de otros sistemas texto-a-audio.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el DiT turbo, el text encoder y el VAE no genera audio; usarlo aislado solo produce planes latentes.
- Dependencia de plataforma: el formato y el runtime son MLX/MLX Swift, orientados a Apple Silicon; no es portable directamente a CUDA sin conversion.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; al ser un fine-tune de Qwen3, hereda los sesgos del corpus base, pero no hay evaluacion publicada al respecto.
- Idiomas: no se especifican los idiomas soportados para las letras ni para los captions.
- Licencia: MIT para el fine-tune, pero la base Qwen3 es Apache-2.0 y el repositorio upstream ACE-Step/Ace-Step1.5 no incluye fichero LICENSE propio; el texto controlante es el LICENSE de GitHub (Copyright (c) 2026 ACEStep). Conviene conservar el NOTICE que acompana al bundle.
- Contexto: la longitud de contexto no esta documentada, lo que limita planificar composiciones muy largas o letras extensas sin validacion previa.
- Madurez: 58 descargas y 0 likes en el momento de la consulta; el ecosistema es reciente y las garantias de produccion dependen del paquete Swift, no del bundle en si.

## Enlaces

- [Hugging Face: mlx-community/ACE-Step-1.5-planner-1.7B-8bit](https://huggingface.co/mlx-community/ACE-Step-1.5-planner-1.7B-8bit)
- [Modelo base: ACE-Step/Ace-Step1.5](https://huggingface.co/ACE-Step/Ace-Step1.5)
- [Codigo upstream: ace-step/ACE-Step-1.5](https://github.com/ace-step/ACE-Step-1.5)
- [Licencia MIT upstream](https://github.com/ace-step/ACE-Step-1.5/blob/main/LICENSE)
- [Tech report (arXiv:2602.00744)](https://arxiv.org/abs/2602.00744)
- [Paquete Swift-MLX: xocialize/mlx-ace-step-swift](https://github.com/xocialize/mlx-ace-step-swift)
- [MLX Swift](https://github.com/ml-explore/mlx-swift)
- [MLXEngine](https://github.com/xocialize/mlx-engine-swift)
