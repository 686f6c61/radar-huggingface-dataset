# Shiftedx/Inkling-2-Mini-MTPLX-Native-Experts-Mixed

## Resumen

Inkling-2-Mini-MTPLX-Native-Experts-Mixed es una cuantizacion de 8 bits del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario Shiftedx y empaquetada para el runtime MTPLX sobre Apple MLX. El modelo conserva la arquitectura Mixture-of-Experts del original (26.899.775.016 parametros totales segun los safetensors) y anade un modulo de decodificacion especulativa DSpark empaquetado junto a los pesos, lo que permite acelerar la generacion en hardware Apple Silicon. El repositorio ocupa 18,2 GB y esta liberado bajo licencia Apache 2.0.

La propuesta del autor no es un modelo nuevo, sino un artefacto de despliegue: mezcla de precisiones nativas por capas (NVFP4 en las capas 0-19, MXFP8 en las 20-23), cuantizacion afina de grupo 64 en atencion y embeddings a 4 bits, cabeza de salida a 8 bits y retencion en BF16 de cinco proyecciones de salida de atencion y de los 422 tensores de vision. El resultado es un checkpoint que mantiene paridad de salida codiciosa (9/9) frente al modelo objetivo sin cuantizar, segun las pruebas del autor.

Es relevante porque demuestra una via practica para servir un modelo multimodal MoE de ~27.000 millones de parametros en un unico equipo con 64 GiB de memoria unificada, con velocidades medidas de 64,1 tok/s en decodificacion solo objetivo y 73,2 tok/s con DSpark. La contrapartida es un ecosistema muy especifico: solo funciona con MTPLX/MLX, no con vLLM ni llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal derivada de Inkling-2-Mini; runtime MTPLX sobre MLX |
| Parametros totales | 26.899.775.016 |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (ventana usada en las pruebas del autor); maximo nativo no disponible |
| Tipos de cuantizacion | Mezcla nativa: NVFP4 (expertos enrutados, capas 0-19), MXFP8 (expertos, capas 20-23), afina grupo 64 a 4 bits (atencion y embeddings), 8 bits (cabeza de salida), BF16 (5 proyecciones de salida de atencion y 422 tensores de vision) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18,2 GB de repo / 18,19 GB de pesos) |

## Arquitectura y entrenamiento

El modelo base, Inkling-2-Mini de Thinking Machines, es un transformer multimodal con capas de expertos enrutados (MoE) y una torre de vision, segun se deduce de la presencia de 422 tensores de vision y de la distincion explicita entre "expertos enrutados" y tensores densos en la model card. El checkpoint publicado no reentrena nada: es una cuantizacion (base_model_relation: quantized) que reorganiza los pesos en una mezcla de precisiones por capa. Las capas 0-19 usan expertos en formato NVFP4 nativo y las capas 20-23 en MXFP8 nativo, mientras que atencion y embeddings se cuantizan con afina de grupo 64 a 4 bits y la cabeza de salida a 8 bits. Se conservan en BF16 cinco proyecciones de salida de atencion y la totalidad de los tensores de vision.

La innovacion tecnica destacable es el empaquetado del modulo DSpark, un mecanismo de decodificacion especulativa incluido en el repositorio. Segun las mediciones del autor en un M4 Max de 64 GiB con decodificacion codiciosa y ventana de 4K, el modo solo objetivo alcanza 64,1 tok/s en decodificacion y 58,7 tok/s extremo a extremo, mientras que con DSpark sube a 73,2 tok/s y 64,5 tok/s respectivamente, con paridad de salida codiciosa en 9 de 9 peticiones. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), con torre de vision retenida integramente en BF16.
- Razonamiento y generacion de codigo: presumible en un modelo de esta familia, aunque no documentado en la informacion disponible.
- Decodificacion especulativa mediante DSpark, que acelera la generacion sin alterar la salida codiciosa.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Modo thinking explicito, audio u otras modalidades: no disponible.

## Casos de uso

- Prototipado local de asistentes multimodales en Mac: el checkpoint permite levantar un servidor con `mtplx serve` en un M4 Max de 64 GiB y consultar imagenes y texto sin depender de la nube, gracias a los 18,2 GB de pesos y a la ventana de 4K validada.
- Evaluacion de tecnicas de cuantizacion mixta: util para investigadores que quieran medir el impacto de NVFP4 y MXFP8 por capas frente a BF16 usando la paridad 9/9 como referencia de control.
- Investigacion en decodificacion especulativa: el binario DSpark empaquetado permite comparar tok/s con y sin especulacion (64,1 frente a 73,2 tok/s) en el mismo equipo y con la misma semilla.
- Desarrollo de pipelines de vision-lenguaje en estaciones de trabajo Apple: al conservar los 422 tensores de vision en BF16, sirve para tareas de descripcion de imagenes o extraccion de informacion visual en entornos de desarrollo sin GPU dedicada.
- Benchmarking de runtimes MLX frente a otras alternativas: sirve como caso de prueba reproducible para comparar MTPLX con llama.cpp o MLX-LM en modelos MoE de ~27.000 millones de parametros.
- Despliegue de demos internas y entornos de investigacion: la licencia Apache 2.0 permite uso comercial, aunque la dependencia exclusiva del runtime MTPLX limita su integracion en infraestructura de servidor tradicional.

## Benchmarks y rendimiento

| Metrica | Solo objetivo | Con DSpark |
|---|---|---|
| Decodificacion (tok/s) | 64,1 | 73,2 |
| Extremo a extremo (tok/s) | 58,7 | 64,5 |
| Paridad de salida codiciosa | 9/9 frente a solo objetivo | 9/9 frente a solo objetivo |

Medido por el autor en un Apple M4 Max de 64 GiB, decodificacion codiciosa, ventana de 4096 tokens y nueve peticiones cortas, con MTPLX 2.13.2. La "Full Shiftedx Bench" figura como pendiente. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 18,2 GB solo para pesos; con overhead de runtime y ventana de 4K conviene disponer de al menos 24-32 GB libres.
- Equipo validado por el autor: Apple M4 Max con 64 GiB de memoria unificada.
- GPU NVIDIA: no disponible; el checkpoint esta empaquetado para MLX y no se ha probado en CUDA.
- GPU de consumo: cabe en Apple Silicon de gama alta (M4 Max y configuraciones equivalentes con memoria suficiente); no hay datos para RTX 4090 u otras tarjetas.
- Opciones de despliegue: exclusivamente MTPLX 2.13.2 o superior mediante `mtplx serve --model ./inkling-mini --generation-mode mtp --context-window 4096`. No compatible con vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible.
- Rendimiento: 64,1 tok/s de decodificacion en modo solo objetivo y 73,2 tok/s con DSpark en el hardware indicado; latencia no reportada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Runtime | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MTPLX-Native-Experts-Mixed | 26,9 B (MoE) | 4K validado | Apache 2.0 | MTPLX / MLX | Cuantizacion mixta NVFP4/MXFP8 con DSpark |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible | Modelo base sin cuantizar; referencia de paridad |
| Alternativas de ~27 B en MLX | no disponible | no disponible | no disponible | MLX | No se dispone de datos comparativos verificables en la informacion proporcionada |

No hay informacion suficiente para comparar rendimiento, contexto o calidad con modelos de la misma categoria mas alla del propio modelo base.

## Limitaciones y advertencias

- Dependencia total del runtime MTPLX: no es desplegable en vLLM, TGI, llama.cpp, Ollama ni en GPUs NVIDIA con las herramientas habituales, lo que reduce su portabilidad a produccion.
- Ventana de contexto validada de solo 4096 tokens; el maximo nativo del modelo base no se documenta.
- Idiomas soportados sin declarar: riesgo de comportamiento irregular fuera del ingles y de los idiomas vistos en el entrenamiento del modelo base.
- Paridad verificada unicamente en decodificacion codiciosa y con nueve peticiones cortas; no hay evidencia sobre muestreo, temperaturas altas o contextos largos.
- La cuantizacion mixta NVFP4/MXFP8 puede degradar tareas sensibles a precision numerica (matematicas, codigo exacto) sin que el autor publique evaluaciones al respecto.
- Riesgo de alucinacion inherente al modelo base; no hay evaluaciones de sesgo ni de robustez en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- El benchmark completo del autor esta pendiente, por lo que las cifras de rendimiento son preliminares y de un unico equipo.

## Enlaces

- Hugging Face: https://huggingface.co/Shiftedx/Inkling-2-Mini-MTPLX-Native-Experts-Mixed
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revision concreta del modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/b85c3cfa615fc413cc9af3379f491b963f3b586a
