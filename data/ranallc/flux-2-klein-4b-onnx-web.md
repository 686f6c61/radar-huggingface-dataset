# RanaLLC/FLUX.2-klein-4B-onnx-web

## Resumen

FLUX.2-klein-4B-onnx-web es una conversión a ONNX del modelo de generación de imágenes FLUX.2 [klein] 4B de Black Forest Labs, empaquetada específicamente para inferencia dentro del navegador mediante `onnxruntime-web` sobre el backend WebGPU. El repositorio lo publica la cuenta RanaLLC y la conversión la firma Kim Nyberg; el modelo base y el codificador de texto (un derivado de Qwen3-4B de Alibaba Cloud) se distribuyen bajo licencia Apache-2.0. El interés de esta ficha no está en el modelo generativo en sí, sino en el trabajo de empaquetado: pesos cuantizados a 4 bits, grafos separados por componente y ficheros de menos de 2 GB para poder cargarlos en un navegador de escritorio.

El pipeline completo ocupa 5,6 GB repartidos en tres grafos: codificador de texto (2,48 GB, q4), transformer/denoiser (3,00 GB, q4) y decodificador VAE (0,10 GB, fp16). El transformer opera sobre latentes empaquetados de 128 canales con parche de 16, es guidance-distilled (no requiere CFG) y muestrea con FlowMatch Euler en 4 pasos, lo que reduce el coste a cuatro evaluaciones del denoiser por imagen.

Es relevante ahora porque demuestra que un modelo de difusión de la familia FLUX puede ejecutarse en WebGPU sin servidor, con las implicaciones de privacidad y coste que eso conlleva, y porque documenta con detalle los compromisos técnicos del port (truncado del codificador de texto, RoPE en fp32, gestión del heap de wasm32). No hay resultados de benchmarks ni métricas de calidad publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (denoiser) sobre latentes empaquetados de 128 canales con parche 16 y modulacion AdaLN; codificador de texto transformer denso (Qwen3-4B truncado a 27 capas); decodificador VAE convolucional |
| Parametros totales | 4B segun la denominacion del modelo base; la model card no desglosa el reparto entre denoiser y codificador de texto (el codificador es un Qwen3-4B completo, aqui truncado) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens de prompt (`max_sequence_length` = 512, padding derecho). En imagen, el numero de tokens es dinamico: `img_seq = (H/16)·(W/16)` (1024 tokens a 512², 4096 a 1024²) |
| Tipos de cuantizacion | q4 MatMulNBits (bloque 32, simetrico, `accuracy_level` 4) en codificador de texto y transformer; VAE en fp16; modulacion AdaLN, time-embedding, norms y biases en fp32 |
| Idiomas soportados | No disponible (la model card no especifica idiomas; el codificador Qwen3-4B es multilingue por diseno, pero no se documenta el alcance real) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18, `ai.onnx` + `com.microsoft.MatMulNBits`) con datos externos en ficheros `.onnx_data` / `.onnx_data_1` |
| Tamano del repositorio | 5,6 GB en total; ningun fichero individual supera los 2 GB (el mayor son 1,80 GB) |
| Resoluciones soportadas | Multiplos de 16; probado a 512² y 1024² |
| Pasos de muestreo | 4 (FlowMatch Euler con desplazamiento temporal exponencial, `mu = compute_empirical_mu(img_seq, steps)`) |
| Tamano de lote | Fijo a 1 en el export |
| I/O del transformer | `hidden_states` [1, img_seq, 128] fp32; `encoder_hidden_states` [1, txt_seq, 7680] fp32; `timestep` [1] fp32; `img_ids` / `txt_ids` int64; `noise_pred` [1, img_seq, 128] fp32 |

## Arquitectura y entrenamiento

El denoiser es un transformer de difusion que trabaja sobre latentes empaquetados de 128 canales, con parche espacial de 16 y modulacion AdaLN para la condicion temporal. El grafo ONNX recibe directamente los tokens de latente en orden ráster con `img_ids` de la forma `(0, h, w, 0)` y `txt_ids` de la forma `(0, 0, 0, l)`, lo que permite que el mismo grafo sirva para 512², 1024² y cualquier resolucion multiplo de 16 sin reexportar. El modelo base es guidance-distilled, de modo que el export no incluye CFG: cada paso ejecuta una unica pasada del transformer. El cálculo de RoPE se hace dentro del grafo en fp32 porque WebGPU no soporta fp64; el autor cuantifica la desviacion respecto al original en un maximo de 2e-5.

La parte mas interesante del empaquetado es el codificador de texto. Se trata de un Qwen3-4B al que se le conservan solo las 28 primeras capas, con la capa 27 podada por ser codigo muerto, de modo que el grafo ejecuta 27 capas en lugar de 28. La salida no es el ultimo hidden state, sino la concatenacion de `hidden_states[9]`, `hidden_states[18]` y `hidden_states[27]` en la ultima dimension, replicando exactamente el calculo de `Flux2KleinPipeline._get_qwen3_prompt_embeds` en diffusers; de ahi salen los 7680 canales de `prompt_embeds` (3 × 2560). El prompt debe construirse con la plantilla de chat (`add_generation_prompt=true`, `enable_thinking=false`) y rellenarse a 512 tokens. El VAE, en fp16, absorbe en el propio grafo la desnormalizacion BatchNorm, el un-patchify 2×2 y el posprocesado `(x/2+0.5).clamp(0,1)`, de forma que la salida ya es una imagen RGB en [0, 1]. No se documentan en la model card el volumen de datos de entrenamiento, la composicion del dataset ni las etapas de alineacion del modelo original.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en 4 pasos de muestreo, sin classifier-free guidance.
- Ejecucion integra dentro del navegador con `onnxruntime-web` y el execution provider WebGPU, sin backend ni servidor de inferencia.
- Resoluciones arbitrarias multiplos de 16 gracias a las dimensiones dinamicas de tokens; 512² y 1024² son los casos documentados.
- Fallback parcial a CPU via execution provider `wasm`, previsto por el autor para las operaciones int64/bool del codificador de texto (construccion de mascaras causales y de padding).
- Condicionamiento textual rico: 7680 dimensiones de embedding por token frente a las 4096 habituales en otros pipelines, al concatenar tres capas del codificador.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es un modelo generativo de imagen, no un LLM conversacional.
- No tiene vision: genera imagenes, no las interpreta.
- Capacidad multilingue del prompt no documentada; potencialmente heredada del tokenizador Qwen2, sin garantias.
- No soporta lotes: el eje de batch esta fijado a 1 en el export.

## Casos de uso

- Generacion de imagenes en el navegador sin backend: una aplicacion web puede producir una imagen de 512² o 1024² ejecutando los tres grafos en WebGPU, eliminando el coste de GPU en servidor y la latencia de red del envio del prompt.
- Herramientas creativas con privacidad estricta: al no salir el prompt del dispositivo, encaja en flujos donde el texto de entrada es sensible (borradores de producto, material interno, documentos bajo confidencialidad).
- Demos y prototipos de producto: el repositorio se carga directamente desde HuggingFace con `InferenceSession.create`, lo que permite tener un playground funcional en una pagina estatica sin infraestructura.
- Aplicaciones offline-first y PWA: una vez descargados los 5,6 GB y cacheados por el navegador, la generacion no requiere conectividad, util en entornos de campo o con red intermitente.
- Educacion y formacion tecnica: sirve para explicar en directo el funcionamiento de un pipeline de difusion (codificador de texto, bucle de muestreo Euler, VAE) sin depender de un cluster.
- Integracion en herramientas de edicion web: como paso de generacion de bocetos o variaciones dentro de un editor basado en canvas, con el modelo ejecutandose en la misma pestana.
- Validacion de despliegues ONNX/WebGPU en CI: el repositorio es un caso de prueba realista para verificar cobertura de operadores del execution provider WebGPU (MatMulNBits, GatherND, InstanceNormalization, Resize) en distintas versiones de navegador.
- Kioscos y entornos gestionados sin GPU dedicada: equipos de escritorio con grafica integrada y Chrome/Edge actualizados pueden ejecutar el pipeline cumpliendo el requisito de 4 GB de `maxBufferSize`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, comparaciones con el modelo base ni mediciones de latencia o throughput.

El unico dato numerico de fidelidad reportado es la desviacion introducida por ejecutar RoPE en fp32 en lugar de fp64 (no soportado en WebGPU), acotada por el autor en 2e-5 como maximo. No se cuantifica la perdida de calidad asociada a la cuantizacion q4 del denoiser ni al truncado del codificador de texto a 27 capas.

## Requisitos de hardware

- Almacenamiento y descarga: 5,6 GB de pesos, repartidos en ficheros de menos de 2 GB para evitar los limites de carga del navegador.
- Requisito explicito del autor: adaptador WebGPU con al menos 4 GB de `maxBufferSize` / memoria. Se recomienda Chrome o Edge de escritorio.
- Memoria: no se publica una cifra de VRAM. Como referencia, el heap de wasm32 esta limitado a 4 GB, por lo que el autor indica crear las sesiones de una en una: ejecutar el codificador de texto, llamar a `release()`, cargar despues el transformer y asi sucesivamente. Alternativamente, el codificador puede ejecutarse con el execution provider `wasm` en un worker separado.
- GPU recomendadas: no disponible. El autor no publica una lista de GPU validadas; el criterio operativo es el soporte de WebGPU con 4 GB de buffer, lo que incluye graficas integradas modernas y GPU discretas de gama media y alta en escritorio.
- Cabe en GPU de consumo: si, siempre que el navegador exponga WebGPU con el buffer requerido; no se documentan modelos concretos probados.
- Opciones de despliegue: `onnxruntime-web` con `executionProviders: ['webgpu']` es la via prevista. El repositorio no incluye safetensors ni GGUF, por lo que llama.cpp, Ollama, TGI y vLLM no son aplicables directamente; para esos runtimes habria que partir del repositorio original de Black Forest Labs en formato diffusers/PyTorch.
- Latencia y throughput: no disponibles. La model card advierte del coste del bloque de atencion del mid-block del VAE a 1024², pero el dato numerico aparece truncado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de prompt | Formato / ejecucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-onnx-web (este repo) | 4B (denominacion) + codificador Qwen3-4B truncado | 512 tokens | ONNX q4, WebGPU en navegador, 5,6 GB | Apache-2.0 | HuggingFace, 0 descargas |
| FLUX.2-klein-4B (modelo base, BFL) | 4B (denominacion) | 512 tokens segun el pipeline de referencia | PyTorch/diffusers, sin cuantizar | Apache-2.0 | HuggingFace |
| FLUX.1-schnell | ~12B | 256 tokens | safetensors, difusion, 4 pasos | Apache-2.0 | HuggingFace |
| FLUX.1-dev | ~12B | 512 tokens | safetensors, difusion | No comercial | HuggingFace |

Las dos primeras filas proceden de la informacion proporcionada. Las filas de FLUX.1-schnell y FLUX.1-dev se incluyen como referencia de categoria a partir de conocimiento general y no estan verificadas en esta busqueda; conviene contrastarlas antes de publicar. Frente al modelo base, la diferencia practica de este repositorio es el formato (ONNX q4 en lugar de PyTorch) y el objetivo de despliegue (navegador en lugar de GPU con CUDA), no la arquitectura.

## Limitaciones y advertencias

- Lote fijo a 1: no se pueden generar varias imagenes en una misma pasada; hay que iterar secuencialmente.
- Prompt limitado a 512 tokens con relleno derecho obligatorio y plantilla de chat concreta (`add_generation_prompt=true`, `enable_thinking=false`). Omitir la plantilla altera los embeddings y degrada el resultado.
- Codificador de texto truncado a 27 de las 28 capas, con la capa 27 podada como codigo muerto. Es una desviacion estructural respecto al modelo original, aunque el autor la presenta como equivalente.
- RoPE en fp32 en lugar de fp64 por limitacion de WebGPU: desviacion declarada de hasta 2e-5. Es pequena, pero afecta a todas las inferencias.
- Cuantizacion q4 del denoiser y del codificador de texto sin evaluacion publicada de impacto en calidad. No hay FID ni comparacion cualitativa con el modelo en fp16/bf16.
- Dependencia estricta de WebGPU. El autor solo garantiza buen funcionamiento en Chrome y Edge de escritorio; el soporte en otros navegadores no se documenta.
- Algunas operaciones int64/bool del codificador de texto pueden acabar en CPU segun la version de ORT y del navegador, con el coste correspondiente. Si el build de WebGPU rechaza `GatherND` o `And`, hay que recurrir al execution provider `wasm`.
- Gestion de memoria delicada: el heap de wasm32 es de 4 GB y los pesos suman 5,6 GB, por lo que cargar las tres sesiones simultaneamente falla. Es obligatorio liberar cada sesion antes de cargar la siguiente.
- Inconsistencia en la documentacion: el ejemplo de codigo del README apunta a `https://huggingface.co/kny/FLUX.2-klein-4B-onnx-web/...` mientras que el repositorio publicado es `RanaLLC/FLUX.2-klein-4B-onnx-web`. Hay que corregir la URL base antes de usar el snippet.
- Sesgos y comportamiento del dataset de entrenamiento no documentados en la model card; el riesgo de alucinacion visual (texto ilegible en la imagen, composiciones fisicamente imposibles) es el habitual en difusion, sin cuantificar aqui.
- Licencia Apache-2.0 en el empaquetado, pero el uso comercial queda sujeto tambien a las condiciones del modelo base de Black Forest Labs y del codificador Qwen3-4B; el repositorio remite a un fichero `NOTICE` que conviene revisar.
- Repositorio recien creado, con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente del port ni informes de la comunidad.
- El campo de idiomas no esta declarado en los metadatos de HuggingFace; el rendimiento del condicionamiento textual en idiomas distintos del ingles no esta verificado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RanaLLC/FLUX.2-klein-4B-onnx-web
- Modelo base (Black Forest Labs): https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Codificador de texto (Qwen3-4B): https://huggingface.co/Qwen/Qwen3-4B
- Documentacion de ONNX Runtime Web (WebGPU EP): https://onnxruntime.ai/docs/tutorials/web/
- Repositorio de diffusers, donde reside `pipeline_flux2_klein.py` y `compute_empirical_mu`: https://github.com/huggingface/diffusers
- Fichero `NOTICE` del repositorio (licencias del modelo base y del codificador): https://huggingface.co/RanaLLC/FLUX.2-klein-4B-onnx-web/blob/main/NOTICE

Los dos primeros enlaces proceden de la informacion de HuggingFace; el resto son referencias tecnicas citadas en la model card o necesarias para reproducir el pipeline, no enlaces verificados en la busqueda.
