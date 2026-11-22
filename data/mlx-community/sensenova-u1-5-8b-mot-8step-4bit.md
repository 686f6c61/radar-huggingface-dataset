# mlx-community/SenseNova-U1.5-8B-MoT-8step-4bit

## Resumen

SenseNova-U1.5-8B-MoT es el modelo insignia de SenseTime / SenseNova dentro de su familia NEO-unify: un modelo multimodal nativo ("any-to-any") que unifica generacion de imagen a partir de texto (T2I), edicion de imagen por instrucciones y respuesta visual a preguntas (VQA) en una sola arquitectura. La variante aqui documentada es un artefacto para Apple Silicon publicado por mlx-community, que combina la destilacion oficial a 8 pasos con cuantizacion de 4 bits (grupo 64) y pesos en formato MLX listos para el runtime MLX-Swift.

El modelo emplea una arquitectura Mixture-of-Transformers (MoT) con flujo rectificado en espacio de pixeles y sin VAE, lo que elimina el cuello de botella del decodificador latente habitual en los modelos de difusion. El checkpoint base declara 8B de parametros, aunque el repositorio safetensors suma 17.532.854.464 parametros totales, coherente con un unico conjunto de pesos que cubre tanto la corriente de generacion como la de comprension.

Su relevancia practica es doble: por un lado demuestra que un modelo multimodal unificado de esta escala puede ejecutarse en Macs de 16 GB de clase consumer, con 1024x1024 en 3,2 s y 2048x2048 en 15,8 s sobre un M5 Max; por otro, la destilacion toca solo las 294 proyecciones de la corriente de generacion, de modo que la edicion a 8 pasos sin classifier-free guidance iguala cualitativamente la edicion base a 50 pasos con una reduccion de tiempo de 169 s a 15 s.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (NEO-unify), flujo rectificado en espacio de pixeles, sin VAE |
| Parametros totales | 17.532.854.464 (safetensors del repositorio); el nombre comercial indica 8B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (bloque `quantization` en config.json); existe tier de 8 bits en la familia |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en layout MLX (convoluciones NHWC; lineales cuantizadas como `weight`/`scales`/`biases`) |

## Arquitectura y entrenamiento

El modelo sigue la propuesta NEO-unify de SenseTime: una Mixture-of-Transformers que reparte el trabajo entre una corriente de generacion y una corriente de comprension, compartiendo un unico transformer multimodal en lugar de encadenar un LLM con un difusor separado. La generacion de imagen se realiza mediante flujo rectificado en espacio de pixeles, prescindiendo de VAE, lo que simplifica el pipeline y evita artefactos de reconstruccion latente. La variante aqui publicada incorpora el LoRA de destilacion oficial a 8 pasos, fusionado en los pesos, que afecta exclusivamente a las 294 proyecciones de la corriente de generacion.

El artefacto de mlx-community no reentrena el modelo: convierte el checkpoint upstream (commit `07d76f6`) a bf16, fusiona el adaptador de destilacion y aplica cuantizacion de 4 bits con grupo 64 en el layout de claves del runtime MLX-Swift, con convoluciones en NHWC. El tokenizador se regenera desde `vocab.json`/`merges.txt` del upstream con tokenizacion byte-identica verificada contra los ids de referencia. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de imagen texto-a-imagen (T2I) en resoluciones de 1024x1024 y 2048x2048.
- Edicion de imagen guiada por instrucciones en lenguaje natural, sin classifier-free guidance en el tier destilado.
- Respuesta visual a preguntas (VQA) sobre imagenes, ejecutada sobre la corriente de comprension del modelo base sin modificaciones por la destilacion.
- Modalidad any-to-any: entrada y salida combinando texto e imagen en un mismo modelo.
- Modo de razonamiento explicito (`<think>`) disponible en los tiers base, no en este artefacto destilado.
- Inferencia en Apple Silicon mediante MLX y MLX-Swift, con carga sin transitorio de conversion (memoria pico de carga aproximadamente igual a la residente).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico en la informacion disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Generacion de ilustraciones y fotografia sintetica en local: con 1024x1024 en 3,2 s sobre un M5 Max, el modelo sirve para iterar prompts de direccion de arte en un portatil sin depender de APIs externas, usando `--steps 8 --cfg 1.0`.
- Edicion de imagen por instrucciones en flujos de retoque: el tier de 8 pasos reproduce la edicion base a 50 pasos con una diferencia de 28,7 dB y reduce el tiempo de 169 s a 15 s en una edicion a 2048x2048, lo que lo hace viable para sesiones interactivas.
- Prototipado de producto en equipos con hardware Apple: al caber en Macs de 16 GB con un pico de 14,8 GB, permite validar ideas de generacion y edicion sin aprovisionar GPU dedicada.
- Automatizacion de descripciones y analisis de imagenes: la ruta `--vqa` responde preguntas sobre imagenes con la corriente de comprension intacta, util para etiquetado asistido o verificacion de contenido en pipelines internos.
- Preproduccion de material grafico a alta resolucion: la salida a 2048x2048 en 15,8 s encaja en la generacion de assets para maquetas, banners o pruebas de concepto antes de un render final de mayor calidad.
- Integracion en aplicaciones macOS e iOS mediante MLX-Swift: el runtime `sensenova-u1-swift` expone CLI y biblioteca, lo que permite embeber generacion y edicion en herramientas nativas del ecosistema Apple.
- Evaluacion comparativa de tecnicas de destilacion y cuantizacion: al publicarse tiers de 4 y 8 bits con recibos de A/B, sirve como banco de pruebas para medir el impacto de la cuantizacion en la trayectoria de denoising.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos aportados son de rendimiento de inferencia y de paridad:

| Metrica | Valor |
|---|---|
| Memoria pico de inferencia | 14,8 GB |
| Generacion 1024x1024 (M5 Max) | 3,2 s |
| Generacion 2048x2048 (M5 Max) | 15,8 s |
| Edicion 2048x2048, 8 pasos, sin CFG | 15 s (frente a 169 s del base a 50 pasos) |
| Diferencia edicion 8 pasos vs base 50 pasos | 28,7 dB |
| Similitud coseno 4 bits vs bf16 (misma semilla) | ~0,92 |
| Paridad por componente vs referencia PyTorch | < 1e-4 |
| Coseno end-to-end por pasada vs referencia PyTorch | 0,999+ |

## Requisitos de hardware

- VRAM o memoria unificada estimada: 14,8 GB de pico en inferencia, segun la model card; el repositorio pesa 11,8 GB.
- Cabe en Macs de 16 GB de clase consumer (Apple Silicon con memoria unificada), que es el objetivo declarado de este tier.
- GPU recomendadas por el autor: Apple Silicon; las cifras publicadas corresponden a un M5 Max. No se documentan requisitos para GPU NVIDIA o AMD.
- Despliegue: runtime `sensenova-u1-swift` (MLX-Swift) mediante CLI (`sensenova-cli`) o como biblioteca; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: 1024x1024 en 3,2 s y 2048x2048 en 15,8 s en M5 Max; edicion 2048x2048 en 15 s con 8 pasos.
- Carga: los pesos estan en el layout del runtime, por lo que la memoria pico de carga es aproximadamente la residente, sin transitorio de conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-U1.5-8B-MoT-8step-4bit (este) | 17.532.854.464 en safetensors (8B nominales) | no disponible | MoT unificado T2I + edicion + VQA, 4 bits, 8 pasos | Apache-2.0 | MLX, Apple Silicon |
| SenseNova-U1.5-8B-MoT (base) | 8B nominales | no disponible | MoT unificado, bf16, 50 pasos, incluye modo think | Apache-2.0 | PyTorch, referencia OpenSenseNova |
| Tier de 8 bits de la familia | no disponible | no disponible | Misma arquitectura, cuantizacion de 8 bits | Apache-2.0 | MLX, Apple Silicon |
| Otros modelos unificados de difusion sin VAE | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye comparaciones con modelos de otros fabricantes (por ejemplo, familia Flux, SDXL o Qwen-Image), por lo que no se aportan cifras frente a ellos.

## Limitaciones y advertencias

- La cuantizacion a 4 bits perturba de forma medible la trayectoria de denoising: con la misma semilla se obtiene una imagen distinta, aunque valida, con coseno ~0,92 frente a bf16. Para resultados fieles a bf16 hay que usar el tier de 8 bits.
- El modo de razonamiento (`<think>`) no esta disponible en este artefacto; queda reservado a los tiers base.
- El modelo esta empaquetado exclusivamente para MLX y Apple Silicon; no hay pesos GGUF ni soporte documentado para CUDA, vLLM o llama.cpp.
- No se dispone de informacion sobre sesgos, composicion del dataset de entrenamiento ni tasas de alucinacion, lo que impide evaluar riesgos de representacion antes de un despliegue en produccion.
- La cobertura de idiomas no esta documentada; no debe asumirse un rendimiento multilingue sin validacion previa.
- La licencia Apache-2.0 permite uso comercial, pero el artefacto incorpora modificaciones (fusion de LoRA, cast a bf16 y cuantizacion) que deben conservarse y atribuirse segun lo indicado por el publicador.
- El autor advierte que la paridad con la implementacion de referencia PyTorch se ha medido a nivel de componente (< 1e-4) y por pasada (coseno 0,999+), no como equivalencia bit a bit de la salida final.
- Las cifras de latencia proceden de un unico hardware (M5 Max); en equipos con menos memoria o GPU de menor clase el rendimiento puede degradarse de forma sustancial.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/mlx-community/SenseNova-U1.5-8B-MoT-8step-4bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- Commit del upstream: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT/commit/07d76f61474b9c6e6999e22c559314d3439b8c81
- Paper: https://arxiv.org/abs/2605.12500
- Implementacion de referencia: https://github.com/OpenSenseNova/SenseNova-U1
- Runtime MLX-Swift: https://github.com/xocialize/sensenova-u1-swift
- Organizacion SenseNova: https://huggingface.co/sensenova
