# ddalcu/Qwen-Image-2.1-MLX-Serve-4bit

## Resumen

Qwen-Image-2.1-MLX-Serve-4bit es un empaquetado cuantizado a 4 bits del modelo de difusion texto-a-imagen Qwen/Qwen-Image-2.1, preparado por el desarrollador ddalcu para su servidor de inferencia mlx-serve sobre Apple Silicon. No es un modelo nuevo ni un reentrenamiento: es una conversion de pesos que conserva el layout y los nombres de claves originales de diffusers y aplica cuantizacion afina de 4 bits (grupo 64) a las capas lineales de los bloques del DiT y del codificador de texto, manteniendo densos el VAE (en f32), `embed_tokens`, las normas y las lineales pequenas o compartidas del DiT.

El objetivo es hacer viable la generacion de imagenes de alta resolucion en Macs con memoria unificada limitada: el repositorio ocupa 10,7 GB y esta pensado para equipos de 16 GB. Para reducir el consumo, el pack elimina la torre de vision de Qwen3-VL, el `lm_head` (el modelo es solo texto-a-imagen) y los `time_conv` por fotograma del VAE. Ademas, mlx-serve carga el codificador de texto por peticion y lo libera antes del proceso de denoising, de modo que el conjunto residente se limita al DiT y al VAE.

Es relevante ahora porque permite ejecutar un modelo de difusion tipo DiT de gran tamano en hardware de consumo Apple, sin GPU dedicada y sin depender de servicios en la nube. Como contrapartida, el pack no esta publicado de forma utilizable: solo carga en la rama `feat/qwen-image-2.1` del repositorio mlx-serve (PR 477), y ninguna version publicada de mlx-serve o de MLX Core puede ejecutarlo todavia. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con codificador de texto y VAE; base Qwen-Image-2.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-imagen; sin ventana de contexto declarada) |
| Tipos de cuantizacion | 4 bits afina con grupo de 64 en las lineales de los bloques DiT y del codificador de texto; VAE en f32; existe tambien un pack de 8 bits de la misma familia |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (igual que el modelo base) |
| Formato de pesos | safetensors, layout y nombres de claves de diffusers |
| Tamano del repositorio | 10,7 GB |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Pipeline | text-to-image |
| Libreria | mlx-serve |
| Resoluciones soportadas | al menos 512x512 y 1024x1024 en las mediciones publicadas |
| Herramienta de conversion | `tests/convert_qwen_image21_weights.py --preset 16gb` |

## Arquitectura y entrenamiento

Se trata de una arquitectura de difusion basada en transformer (DiT) heredada integramente del modelo base Qwen/Qwen-Image-2.1, acompanada de un codificador de texto derivado de la familia Qwen3-VL y de un VAE en f32. La conversion no modifica la topologia: conserva el layout de diffusers y los nombres de claves, y aplica cuantizacion afina de 4 bits con grupo de 64 exclusivamente a las capas lineales de los bloques DiT y a las lineales del codificador de texto. Permanecen en precision densa el VAE, `embed_tokens`, las normas y las lineales pequenas o compartidas del DiT. Se han eliminado la torre de vision de Qwen3-VL, el `lm_head`, por tratarse de un uso exclusivamente texto-a-imagen, y los `time_conv` por fotograma del VAE.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre etapas de ajuste (RLHF, DPO u otras) en los materiales proporcionados. Tampoco se documentan innovaciones de decodificacion, atencion lineal u otras tecnicas especificas del pack. La innovacion relevante de este repositorio es de despliegue: la carga del codificador de texto por peticion y su liberacion antes del bucle de denoising, que reduce la memoria residente al DiT y al VAE.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image), con resoluciones verificadas de 512x512 y 1024x1024.
- Image-to-image: acepta el parametro `image` junto con `strength`.
- Classifier-free guidance real: cuando `guidance_scale` es mayor que 1 y se proporciona un `negative_prompt`, ejecuta dos pasadas por paso de denoising.
- Control de numero de pasos de muestreo; 40 pasos por defecto si se omite el parametro.
- Servicio por API con endpoint tipo OpenAI: `POST /v1/images/generations` en el puerto 11234.
- Ejecucion local en Apple Silicon mediante MLX, sin GPU dedicada.
- Sin capacidades de vision ni de generacion de texto: la torre de vision y el `lm_head` han sido eliminados del pack.
- No se declaran capacidades de tool calling, function calling, uso de agentes ni razonamiento multi-paso (no aplica a un modelo de difusion texto-a-imagen).
- Cobertura multilingue: no disponible.

## Casos de uso

- Generacion de imagenes en local en Macs de 16 GB: el pack ocupa 10,7 GB y alcanza un pico de memoria medido de 9,55 GB a 1024x1024, lo que permite generar imagenes sin depender de servicios en la nube ni de GPU dedicada.
- Prototipado rapido de prompts: con 512x512 y 20 pasos el tiempo total medido fue de 118 s (incluyendo carga), una configuracion adecuada para iterar sobre descripciones antes de lanzar una generacion a resolucion completa.
- Integracion en pipelines de pruebas automatizadas: el endpoint HTTP compatible con el formato de OpenAI permite sustituir llamadas a APIs externas por un servidor local en tests de integracion y de regresion visual.
- Refinado de bocetos o imagenes existentes: la combinacion de `image` y `strength` habilita flujos de image-to-image para variaciones de estilo o mejora de encuadres partiendo de material ya disponible.
- Control de estilo mediante CFG y prompts negativos: con `guidance_scale` mayor que 1 y `negative_prompt`, el modelo ejecuta CFG real (dos pasadas por paso) para excluir elementos no deseados, a costa de duplicar el coste de inferencia por paso.
- Generacion de imagenes con requisitos de privacidad: al ejecutarse en local, los prompts y las imagenes no salen del equipo, lo que encaja en entornos con datos sensibles o sin conectividad.
- Evaluacion de cuantizacion en difusion: comparar el pack de 4 bits con el de 8 bits de la misma familia permite estudiar el compromiso entre memoria, tiempo por paso y calidad de imagen en Apple Silicon.
- Docencia e investigacion sobre modelos de difusion: el repositorio de mlx-serve es reproducible desde codigo fuente y permite inspeccionar el proceso de conversion y de carga de pesos en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, GenEval ni similares) en la informacion disponible. Los unicos datos de rendimiento publicados son mediciones de tiempo y memoria realizadas en un M1 Pro con 32 GB de memoria unificada:

| Pack | Resolucion | Pasos | Tiempo total (incluye carga) | Memoria maxima |
|---|---|---|---|---|
| 8 bits | 1024x1024 | 40 | 985 s (~23 s/paso) | 12,95 GB |
| 4 bits | 1024x1024 | 3 | 87 s | 9,55 GB |
| 4 bits | 512x512 | 20 | 118 s | no disponible |

El dato de 23 s por paso corresponde al pack de 8 bits. Para el pack de 4 bits a 512x512, el tiempo de 118 s para 20 pasos equivale a unos 5,9 s por paso, incluyendo la carga del modelo; este valor es una estimacion derivada de los datos publicados, no una cifra reportada por el autor. No se dispone de datos de throughput, latencia por imagen en otras GPU ni comparativas de calidad frente al modelo base.

## Requisitos de hardware

- Hardware soportado: exclusivamente Apple Silicon mediante MLX; no hay soporte CUDA ni ROCm en este pack.
- Memoria: objetivo declarado de Macs con 16 GB de memoria unificada. Pico residente medido de 9,55 GB a 1024x1024 con el pack de 4 bits y de 12,95 GB con el pack de 8 bits (M1 Pro, 32 GB).
- Equipo de referencia de las mediciones: M1 Pro con 32 GB de memoria unificada.
- Gestion de memoria: mlx-serve carga el codificador de texto por peticion y lo libera antes del denoising, por lo que el conjunto residente durante la generacion es el DiT y el VAE.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, el runtime es MLX sobre Apple Silicon. No hay datos de despliegue en GPU NVIDIA u otras.
- Opciones de despliegue: unicamente mlx-serve, compilado desde la rama `feat/qwen-image-2.1` (PR 477), con toolchain de Zig y script `scripts/build-mlx.sh`. No hay compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- API de servicio: `mlx-serve serve` expone `POST /v1/images/generations` en el puerto 11234.
- Latencia y throughput: 985 s para 40 pasos a 1024x1024 con el pack de 8 bits (~23 s/paso) y 87 s para 3 pasos a 1024x1024 con el pack de 4 bits, incluyendo la carga del modelo en ambos casos.

## Comparativa con modelos similares

| Modelo | Formato / runtime | Tamano | Resolucion | Pasos y tiempo | Memoria maxima | Licencia |
|---|---|---|---|---|---|---|
| Qwen-Image-2.1-MLX-Serve-4bit | safetensors cuantizado a 4 bits, MLX / mlx-serve | 10,7 GB | 1024x1024 y 512x512 | 3 pasos en 87 s (1024); 20 pasos en 118 s (512) | 9,55 GB | Apache-2.0 |
| Pack de 8 bits de la misma familia | safetensors cuantizado a 8 bits, MLX / mlx-serve | no disponible | 1024x1024 | 40 pasos en 985 s (~23 s/paso) | 12,95 GB | Apache-2.0 |
| Qwen/Qwen-Image-2.1 (base) | safetensors sin cuantizar, diffusers | no disponible | no disponible | no disponible | no disponible | Apache-2.0 |
| Alternativas de difusion texto-a-imagen en MLX (por ejemplo familias FLUX o Stable Diffusion) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio informacion relevante sobre este modelo ni sobre alternativas comparables; los resultados obtenidos correspondian a un software lector de pantalla sin relacion con el modelo. Por tanto, los datos de la comparativa se limitan a lo publicado en el repositorio del autor.

## Limitaciones y advertencias

- El pack no esta publicado de forma utilizable: solo carga en la rama `feat/qwen-image-2.1` de mlx-serve (PR 477). Ninguna version publicada de mlx-serve ni de MLX Core puede ejecutarlo.
- El aviso de no disponibilidad desaparecera, segun el autor, cuando el PR se integre; hasta entonces no es apto para produccion.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad ni evidencia de uso real.
- Requiere compilar el runtime desde codigo fuente con el toolchain de Zig y el script de build de MLX, lo que anade complejidad de despliegue.
- La torre de vision de Qwen3-VL y el `lm_head` han sido eliminados: el modelo no puede interpretar imagenes de entrada ni generar texto.
- Los `time_conv` por fotograma del VAE fueron descartados en la conversion, lo que limita cualquier uso que dependa de coherencia temporal.
- La cuantizacion a 4 bits con grupo 64 en el DiT y en el codificador de texto puede degradar la fidelidad al prompt o el detalle fino respecto a precisiones mayores; no se han publicado metricas de calidad que lo cuantifiquen.
- Riesgo de alucinacion visual y de errores en la representacion de texto dentro de la imagen, inherente a los modelos de difusion; no hay evaluaciones publicadas para este pack.
- Sesgos conocidos: no disponible en la informacion proporcionada; cabe esperar los sesgos del modelo base y de sus datos de entrenamiento.
- Cobertura de idiomas no declarada; el rendimiento con prompts en idiomas distintos del ingles no esta documentado.
- Licencia Apache-2.0, la misma que el modelo base, lo que en principio permite uso comercial; conviene verificar los terminos aplicables al modelo base Qwen/Qwen-Image-2.1 y a cualquier componente derivado.
- Los tiempos publicados corresponden a un M1 Pro; en Macs con menos memoria o generaciones anteriores el rendimiento y el consumo pueden diferir, especialmente en el objetivo declarado de 16 GB.
- El uso de CFG real (`guidance_scale` mayor que 1 con `negative_prompt`) duplica las pasadas por paso de denoising y, por tanto, aproximadamente duplica el tiempo de generacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddalcu/Qwen-Image-2.1-MLX-Serve-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio mlx-serve: https://github.com/ddalcu/mlx-serve
- Rama de desarrollo del modelo: https://github.com/ddalcu/mlx-serve/tree/feat/qwen-image-2.1
- Pull request de soporte: https://github.com/ddalcu/mlx-serve/pull/477
- Imagen de ejemplo publicada por el autor: https://raw.githubusercontent.com/ddalcu/mlx-serve/feat/qwen-image-2.1/website/screenshots/qwen-image-2.1-4bit-512.jpg
- Resultados de busqueda web: sin resultados relevantes; todas las entradas devueltas correspondian al software lector de pantalla JAWS y no guardan relacion con el modelo.
