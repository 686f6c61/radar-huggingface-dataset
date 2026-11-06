# Remek/basal-omni-1.0-max-MLX

## Resumen

basal-omni-1.0-max-MLX es un port a MLX en cuantizacion 8-bit del modelo basal-omni-1.0-max, un modelo de 12B de parametros construido sobre una base Gemma 4 12B y desarrollado por Remek. No es un modelo conversacional al uso: esta especializado en la toma de decisiones tipadas (typed decisions), es decir, elegir entre un conjunto de opciones (hasta 255), puntuar, clasificar y calibrar la confianza de cada decision. Esta version MLX esta pensada para ejecutarse en Apple Silicon mediante el motor de inferencia propio del autor, basal, en modo `--mode mlx`.

El modelo conserva la API de decisiones del original (tipos `choice`, `noul`, `score`, `multi`, `act`, `tool`) y anade una calibracion propia (`CALIBRATION.mlx.json`) ajustada sobre las lecturas de este port. Segun la model card, el port supera todas las barras de calidad definidas frente al modelo bf16 de referencia: acuerdo del 0.9894 en decisiones con 2-10 opciones, acuerdo del 1.0000 cuando el modelo bf16 tiene un margen >= 0.2, y una desviacion de precision de -0.10 puntos.

Es relevante ahora porque demuestra que un modelo de decision de 12B puede cuantizarse a 8-bit y ejecutarse en un Mac con 24 GB de memoria unificada manteniendo practicamente el mismo comportamiento que la version completa en bf16 sobre GPU, lo que abre el despliegue local de capas de decision calibradas sin infraestructura de datacenter. La version es experimental y solo texto: los codificadores de imagen y audio no estan incluidos en esta carpeta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Gemma 4 12B), con rotary y global attention; solo decodificador de texto |
| Parametros totales | 11.907.350.272 (~11.9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8-bit, group size 64 (capas lineales de los bloques decodificadores); embeddings de token y normas en bf16; cabeza de salida en fp32 |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 8-bit; repo de 13.6 GB |
| Modelo base | Remek/basal-omni-1.0-max |
| Libreria | mlx (mlx 0.32.4, mlx-lm 0.32.2) |
| Modo de inferencia | basal-serve --mode mlx (motor basal >= 2.2.0, extra `mlx`) |
| Plataforma | Apple Silicon, Python >= 3.11 (arm64 nativo) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Gemma 4 12B: un transformer decoder con atencion rotatoria y global attention, del que este port conserva unicamente el decodificador de texto. La conversion se realizo con el conversor de mlx-lm 0.32.2 (carga, cuantizacion y guardado) sobre el modelo bf16: cuantizacion affine de 8 bits con group size 64 para las capas lineales de los bloques decodificadores, manteniendo en bf16 los embeddings de token (que tambien son la cabeza de salida de la que se lee la decision, en fp32) y las normas. Los ajustes de rotary y global attention se escriben en `config.json` en las claves que mlx-lm lee. Los codificadores de imagen y audio del modelo original quedan fuera.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La model card indica que el modelo base esta entrenado solo sobre decisiones de texto, y que responde preguntas sobre imagenes y audio de forma zero-shot mediante los codificadores de Gemma 4 (entrenamiento con medios previsto para futuras versiones). La innovacion tecnica destacable es el sistema de calibracion por tipo y por bucket: temperaturas y umbrales certificados para un 1% y un 5% de error objetivo, con la regla de que un objetivo mas laxo nunca recibe un umbral mas estricto. La calibracion de este port se ajusto sobre sus propias lecturas con `--mode mlx`, un unico orden de opciones y cada segundo item de cada split.

## Capacidades

- Toma de decisiones tipadas: eleccion entre 2 y hasta 255 opciones (`choice`), decision sin opciones (`noul`), puntuacion (`score`), seleccion multiple (`multi`), acciones (`act`) y llamadas a herramientas (`tool`).
- Clasificacion con calibracion: probabilidades calibradas por tipo y por bucket, con umbrales certificados para automatizar decisiones a un error objetivo del 1% o del 5%.
- Puntuacion y ranking de opciones mediante el protocolo de lectura del modelo (`basal.json`, prompt format 2).
- Respuesta a preguntas sobre estados o documentos largos, con multiples preguntas sobre un mismo estado (latencia de 1504 ms para cinco preguntas sobre un estado en M4 Pro).
- Soporte de tool calling mediante el tipo `tool` de la API basal.
- Multilingue limitado a polaco (pl) e ingles (en).
- Solo texto en esta carpeta: sin vision ni audio (los codificadores no estan incluidos).
- No es un modelo generativo conversacional general: su salida se lee como decision, no como texto libre.

## Casos de uso

- Clasificacion automatica de documentos con umbral de confianza: usando la calibracion incluida, se puede decidir automaticamente el 35.6% de las decisiones con un error observado del 0.5% (objetivo del 1%) y derivar el resto a revision humana; adecuado por su ECE de +0.0015 frente a bf16.
- Enrutamiento de tickets o solicitudes: elegir entre un conjunto cerrado de categorias o colas (hasta 255 opciones) con el tipo `choice`, aprovechando el acuerdo del 0.9894 con la version bf16.
- Capa de decision en agentes: seleccionar la siguiente accion (`act`) o la herramienta a invocar (`tool`) en un pipeline multi-paso, con la ventaja de ejecutarse localmente en un Mac.
- Moderacion o triaje con abstención: usar los umbrales calibrados para decidir cuando el modelo no debe decidir y escalar el caso, reduciendo falsos positivos en produccion.
- Puntuacion y ranking de candidatos: ordenar respuestas, propuestas o resultados con `score` para tareas de evaluacion o reranking en ingles y polaco.
- Procesamiento por lotes en local para equipos con Apple Silicon: servir el modelo con `basal-serve --mode mlx` en un M4 Pro de 24 GB para prototipos y validacion antes de pasar a la version bf16 en GPU.
- Investigacion sobre calibracion: refitear la calibracion con `basal-calibrate` sobre datos etiquetados propios y comparar el comportamiento del port 8-bit con el bf16.

## Benchmarks y rendimiento

Los benchmarks propios del modelo (Werdykt v1 0.823, conjuntos en polaco e ingles) estan publicados en el modelo base y no se puntuan por separado para este port. Los datos medidos especificos del port son los siguientes:

| Metrica | Valor (MLX 8-bit) | Barra (port gate) |
|---|---|---|
| Acuerdo con bf16 (2-10 opciones) | 0.9894 | >= 0.9552 |
| Acuerdo con bf16 (margen >= 0.2) | 1.0000 | >= 0.9893 |
| Diferencia de precision | -0.10 pt | dentro de 1 punto |
| ECE | +0.0015 | <= +0.01 |
| Acuerdo global (hasta 255 opciones, 1.261 decisiones) | 0.9841 | no disponible |
| Decisiones/s (M4 Pro, 8 en vuelo) | 0.25 | no disponible |
| Latencia mediana, 1 pregunta (M4 Pro) | 453 ms | no disponible |
| Latencia mediana, 5 preguntas sobre un estado | 1504 ms | no disponible |
| Automatizacion a 1% de error objetivo | 35.6% de decisiones (error observado 0.5%) | no disponible |
| Automatizacion a 5% de error objetivo | 85.2% de decisiones (error observado 3.6%) | no disponible |
| Precision en test de calibracion (4.280 decisiones) | 0.909 | no disponible |

La medicion se realizo sobre cada octava decision del conjunto de desarrollo dev v2 (1.325 de 10.606) en un Apple M4 Pro de 24 GB con 8 peticiones en vuelo; 64 de las 1.325 peticiones fallaron por out-of-memory de Metal en la franja de prompts largos y quedaron excluidas. La tokenizacion coincide con la del modelo bf16 en 2.000 de 2.000 prompts de desarrollo.

## Requisitos de hardware

- VRAM/memoria: 13.6 GB de memoria unificada solo para los pesos; los estados largos necesitan mas. En un M4 Pro de 24 GB, 64 de 1.325 peticiones agotaron la memoria de GPU con 8 en vuelo entre prompts largos.
- GPU: exclusivamente Apple Silicon (MLX). No esta pensado para GPU NVIDIA; la referencia bf16 se sirvio en una RTX PRO 6000 con CUDA.
- Cabe en consumer hardware Apple: si, en Macs con memoria unificada suficiente (24 GB funciona con margen limitado; se recomienda mas memoria para documentos largos con muchas peticiones en vuelo).
- Despliegue: motor basal (`basal-serve --mode mlx`), instalado con el extra `mlx` desde el repositorio GitHub del proyecto; requiere Python 3.11 o superior en arm64 nativo (no Rosetta).
- Latencia y throughput: 453 ms por pregunta y 1504 ms para cinco preguntas sobre un estado (mediana, una peticion a la vez); 0.25 decisiones/s con 8 peticiones en vuelo en M4 Pro. El proceso de calibracion, una peticion a la vez, proceso 9.187 de 9.187 items.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Plataforma |
|---|---|---|---|---|---|
| basal-omni-1.0-max-MLX | ~11.9B (8-bit) | no disponible | Decisiones tipadas calibradas | apache-2.0 | Apple Silicon (MLX) |
| basal-omni-1.0-max (bf16) | ~12B | no disponible | Decisiones tipadas calibradas, con vision y audio zero-shot | apache-2.0 | GPU CUDA (referencia: RTX PRO 6000) |
| basal-omni-1.1-max-MLX | no disponible | no disponible | Version posterior de la linea basal-omni en MLX | no disponible | Apple Silicon (MLX) |

No se dispone de datos de benchmarks comparativos con modelos de proposito general de tamano similar en la informacion proporcionada; la comparacion relevante es contra el propio modelo base bf16, frente al cual este port mantiene un acuerdo del 0.9894 en decisiones de 2-10 opciones.

## Limitaciones y advertencias

- Modelo experimental: el autor recomienda validarlo sobre documentos propios antes de confiar en el.
- Solo texto en esta carpeta; para imagenes y audio hay que usar el modelo bf16.
- La cuantizacion cambia algunas decisiones cuando el modelo no esta seguro; las decisiones con alta certeza apenas varian.
- La aritmetica exacta y los umbrales son un punto debil de las decisiones de una sola pasada: deben calcularse en codigo.
- La calibracion incluida esta ajustada para un unico orden de opciones (el predeterminado); cambiar el orden requiere recalibrar.
- Memoria limitada: con 8 peticiones en vuelo y prompts largos se producen errores de out-of-memory en Macs de 24 GB; usar maquinas con mas memoria para documentos largos.
- Idiomas limitados a polaco e ingles; no hay soporte declarado de castellano.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; al ser un modelo de decision, el riesgo se manifiesta como elecciones erroneas con confianza alta, mitigable con los umbrales calibrados.
- Licencia apache-2.0: permite uso comercial, pero al derivar de Gemma 4 conviene revisar los terminos de la licencia del modelo base original.
- Requiere el motor propietario del ecosistema basal y plataforma Apple Silicon; no es desplegable con vLLM, llama.cpp, Ollama ni TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-max-MLX
- Modelo base bf16: https://huggingface.co/Remek/basal-omni-1.0-max
- Version posterior en MLX: https://huggingface.co/Remek/basal-omni-1.1-max-MLX
- Repositorio del motor de inferencia basal: https://github.com/rkinas/basal
- Web del proyecto: https://basal.si5.pl/
