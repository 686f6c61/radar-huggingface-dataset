# Perflow-Shuai/MiniMax-H3-3Step-LoRA

## Resumen

MiniMax-H3 3-Step LoRA es un adaptador de bajo rango (LoRA) de rango variable publicado por el usuario Perflow-Shuai para el modelo base MiniMaxAI/MiniMax-H3, un modelo de generacion de video con audio estereo. El adaptador reduce el coste de muestreo del modelo base a 3 evaluaciones de denoising por fragmento (chunk), lo que se traduce en 24 evaluaciones para un clip completo de 8 fragmentos, en lugar de los muestreos densos habituales. El objetivo es acelerar la inferencia manteniendo la generacion conjunta de video y audio sincronizado.

El adaptador no es un LoRA PEFT estandar: emplea 266 grupos de proyeccion con rangos distintos (208 grupos de rango 256 y 58 grupos de rango 128, todos con alpha igual a su rango y escala efectiva 1.0), almacenados en 532 tensores FP32. El repositorio incluye una integracion de inferencia propia (`h3_inference`, `infer.py`) con un sampler fragmentado especifico, geometria de chunks y schedules de ruido emparejados para audio y video. No se redistribuyen los pesos del modelo base, que debe descargarse por separado en una revision concreta.

Es relevante ahora porque propone una via de aceleracion para modelos de generacion audiovisual de gran tamano, pero con requisitos de integracion estrictos: no funciona con `pipeline.load_lora_weights()` ni con nodos LoRA genericos de ComfyUI, y exige mantener los factores del adaptador y los residuos en FP32. La salida configurada es de 1344x768, 124 frames a 24 FPS y audio estereo a 32 kHz, con inferencia solo condicional (CFG scale 1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango variable sobre MiniMax-H3 (modelo base de generacion texto-a-video con audio); arquitectura del base no disponible en la informacion proporcionada |
| Parametros totales | No disponible (adaptador de 7.538.400.104 bytes; parametros del base no disponibles) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el autor no valida carga cuantizada |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MiniMax-H3 Community License Agreement (license: other), con restricciones territoriales y de uso aceptable |
| Formato de pesos | safetensors (532 tensores FP32 en 266 grupos); requiere el base en formato Diffusers |
| Tamano del repositorio | 7,5 GB |
| Modelo base | MiniMaxAI/MiniMax-H3, revision `fa9c8ab1eaa21c8ae25e7e40b83b2e6002f340af` |
| Rangos LoRA | 208 grupos rank 256 / alpha 256; 58 grupos rank 128 / alpha 128; escala efectiva 1.0 |
| Salida configurada | 1344x768, 124 frames a 24 FPS, audio estereo 32 kHz |
| Muestreo | 3 evaluaciones de denoising por chunk, 8 chunks (24 evaluaciones por clip), CFG scale 1 |
| Entorno validado | Python 3.12, PyTorch 2.11.0 / CUDA 13.0, revision de Diffusers fijada en `requirements.txt` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre MiniMax-H3, un modelo de difusion texto-a-video que genera video y audio estereo de forma conjunta. El LoRA es de rango variable: 208 grupos de proyeccion (attention y feed-forward) usan rango 256 y 58 grupos (entrada, condicionamiento, modulacion y salida) usan rango 128, con alpha igual al rango en todos los casos y escala efectiva 1.0. Las claves de tensor siguen el patron `<projection>.lora_a` y `<projection>.lora_b`, con formas `[rank, in_features]` y `[out_features, rank]`. En las proyecciones Q/K/V se comparte una matriz A y se concatena por filas la matriz B, que el cargador segmenta por proyeccion; tambien se gestiona el layout gate/value del feed-forward.

La integracion incluida implementa un muestreo fragmentado (chunked) con 3 evaluaciones de denoising por chunk y 8 chunks, es decir, 24 evaluaciones para el clip completo, no tres para todo el clip. Emplea un layout de atencion fragmentado dedicado y schedules de ruido emparejados para audio y video. La inferencia es solo condicional (CFG scale 1). El autor insiste en mantener los factores del adaptador y los calculos residuales en FP32, preservando la precision mixta nativa del modelo base, y advierte de no aplicar `.half()` ni `.bfloat16()` al modelo adaptado completo. No se proporcionan datos sobre el dataset de entrenamiento, numero de tokens, composicion ni uso de RLHF/DPO.

## Capacidades

- Generacion de video a partir de texto en ingles o chino, con resolucion configurada de 1344x768 y 124 frames a 24 FPS.
- Generacion conjunta de audio estereo a 32 kHz sincronizado con el video (text-to-audio-video).
- Control mediante prompt de texto que incluye descripcion visual, paisaje sonoro y dialogo deseado.
- Muestreo acelerado: 3 evaluaciones de denoising por chunk gracias al adaptador, con 24 evaluaciones por clip completo.
- Reanudacion de generacion: guarda estado de chunk y RNG tras cada chunk, permitiendo continuar una ejecucion interrumpida en el mismo directorio de salida.
- Integracion programatica en aplicaciones Python mediante `load_base`, `load_adapter`, `ChunkedH3Runtime` y `generate_sample`.
- No soporta, en el alcance actual, continuacion de video largo ni interfaz de condicionamiento por imagen.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a este tipo de modelo).

## Casos de uso

- Prototipado rapido de clips audiovisuales: con 24 evaluaciones por clip y reanudacion por chunk, permite iterar sobre prompts de video y audio en entornos de alta memoria sin reejecutar el clip completo tras una interrupcion.
- Generacion de contenido para redes sociales: la salida de 124 frames a 24 FPS (aproximadamente 5 segundos) con audio estereo encaja en formatos cortos verticales u horizontales, ajustando el prompt para descripcion visual y paisaje sonoro.
- Creacion de escenas con dialogo: el prompt admite dialogo deseado, de modo que el modelo genera audio sincronizado con la accion visual, util para bocetos de guion o prevision de escenas.
- Investigacion en generacion audiovisual conjunta: el adaptador y su sampler fragmentado sirven como base para estudiar schedules de ruido emparejados audio/video y estrategias de destilacion o aceleracion por LoRA.
- Integracion en pipelines Python existentes de MiniMax-H3: mediante `generate_sample` con `nfe=3` y embeddings de texto sin padding, se puede insertar la generacion acelerada en aplicaciones ya construidas sobre el base.
- Evaluacion comparativa de adaptadores de aceleracion: al ser un LoRA de rango variable con cargador propio, permite medir el efecto de reducir evaluaciones de denoising frente al muestreo denso del base en un mismo hardware.
- Generacion de material de referencia para doblaje o sonorizacion: el audio estereo generado puede servir como referencia temporal para tareas posteriores de postproduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma numerica; el autor indica que el modelo base es grande y requiere una GPU de alta memoria.
- El adaptador ocupa 7,5 GB en disco, pero debe cargarse junto con los pesos del base, cuyo tamano no se detalla en la informacion proporcionada.
- GPU recomendadas: no se especifican modelos concretos; se exige una GPU de alta memoria compatible con CUDA. El offloading en GPU de consumo no esta validado.
- Cabe en GPU de consumo: no validado por el autor; el offloading para GPU de consumo, la carga cuantizada y versiones de software arbitrarias no estan soportadas segun la model card.
- Opciones de despliegue: integracion propia del repositorio (`infer.py` o API Python `h3_inference`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni nodos LoRA genericos de ComfyUI.
- Entorno: Python 3.12 aislado, PyTorch 2.11.0 con CUDA 13.0 y la revision exacta de Diffusers fijada en `requirements.txt`.
- Latencia y throughput: no disponibles; solo se conoce el numero de evaluaciones (3 por chunk, 24 por clip de 8 chunks).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-H3 3-Step LoRA (Perflow-Shuai) | LoRA de rango variable sobre MiniMax-H3 | Base no disponible; adaptador 7,5 GB | No disponible | 1344x768, 124 frames, audio 32 kHz | MiniMax-H3 Community License | Hugging Face, 0 descargas |
| MiniMaxAI/MiniMax-H3 (base) | Modelo de generacion texto-a-video con audio | No disponible | No disponible | Configurable por el base | MiniMax-H3 Community License | Hugging Face (revision fijada) |
| Otros adaptadores de aceleracion para H3 | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un paquete PEFT estandar: `pipeline.load_lora_weights()` y los nodos LoRA genericos de ComfyUI no pueden cargarlo sin modificaciones; cargar solo los pesos y fijar `num_inference_steps=3` no reproduce el sampler fragmentado incluido.
- El alcance actual cubre solo el primer segmento de 124 frames con generacion de audio y video; no incluye continuacion de video largo ni condicionamiento por imagen.
- La inferencia es solo condicional (CFG scale 1), lo que limita el control mediante guiado negativo.
- Requiere mantener factores del adaptador y residuos en FP32; aplicar media precision al modelo adaptado completo puede degradar o romper la generacion.
- La carga cuantizada, el offloading en GPU de consumo y versiones de software distintas de las validadas no estan soportadas.
- Riesgo de alucinacion y artefactos visuales o de audio: no se documentan evaluaciones de calidad ni sesgos conocidos.
- Idiomas limitados a ingles y chino; el prompt debe escribirse en UTF-8 y en uno de esos idiomas.
- Licencia MiniMax-H3 Community License Agreement con restricciones territoriales y requisitos de uso aceptable; es necesario revisar `LICENSE` y `NOTICE` antes de uso comercial.
- El repositorio no redistribuye pesos del modelo base ni concede derechos sobre componentes de terceros.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria documentada.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Perflow-Shuai/MiniMax-H3-3Step-LoRA
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Revision del base: `fa9c8ab1eaa21c8ae25e7e40b83b2e6002f340af`
- Licencia: archivo `LICENSE` del repositorio (MiniMax-H3 Community License Agreement)
- Aviso legal: archivo `NOTICE` del repositorio
- Configuracion del adaptador: `adapter_config.json`
- Configuracion de inferencia: `inference_config.json`
- Checksums: `SHA256SUMS` (SHA-256 del adaptador: `f7f720c3622880919047eb013750749dcff114b502d1ec5f19159eb962bed192`)
- Requisitos: `requirements.txt`
