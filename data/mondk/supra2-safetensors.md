# mondk/Supra2-Safetensors

## Resumen

Supra2-Safetensors es una redistribucion empaquetada del modelo de generacion de imagenes SupraLabs/Supra2-IMG, publicada por el usuario mondk en Hugging Face. Su aportacion principal no es un nuevo modelo, sino un unico archivo `.safetensors` que fusiona los tres componentes del pipeline original (el transformer de difusion DiT, el codificador de texto T5 y el VAE) en un solo fichero, eliminando la necesidad de descargar por separado `google/flan-t5-base` y `stabilityai/sd-vae-ft-mse`.

El modelo subyacente es un text-to-image de tipo diffusion transformer (DiT) con 297,5 millones de parametros en total, distribuidos en 104,1M para el DiT, 109,6M para el codificador T5 y 83,7M para el VAE. Se distribuye en dos variantes: una en fp32 integra (1,19 GB) y otra mixta (0,81 GB) con DiT y VAE en fp16 pero el codificador de texto forzado en fp32.

Su relevancia es practica: simplifica el despliegue y documenta un problema concreto de precision numerica (el desbordamiento del T5 en fp16) que rompe la calidad de las imagenes generadas. La licencia es Apache 2.0 y el repositorio tiene 2,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con codificador de texto T5 y VAE AutoencoderKL |
| Parametros totales | 297,5M (598 tensores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (ctx_len del codificador de texto) |
| Tipos de cuantizacion | fp32 (integro) y fp16 mixto (DiT y VAE en fp16, text encoder en fp32) |
| Idiomas soportados | No disponible (prompts en lenguaje natural, sin lista declarada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo unico con metadatos embebidos) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusion con transformer (DiT) como red generativa. Los parametros arquitectonicos declarados en la cabecera del safetensors son `d_model=576`, `depth=14`, `n_heads=9`, `patch=2`, `latent_size=32` y `vae_scale=0.18215`. El proceso de generacion parte de un latente gaussiano de 32x32, itera con prediccion de velocidad (v-prediction) y decodifica con el VAE. El condicionamiento textual se realiza mediante un codificador T5 (flan-t5-base) con contexto de 128 tokens, y el clasificador libre de guia (CFG) utiliza embeddings incondicionales precalculados almacenados en el propio archivo bajo el prefijo `cfg.`.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO. El DiT se corresponde con los pesos EMA (`model_final_ema.pt`) del checkpoint original. La innovacion tecnica destacable de este empaquetado es la consolidacion en un unico fichero con metadatos completos (`arch`, `dit_config`, `text_encoder_config`, `vae_config`, `tied_weights`) que permiten reconstruir el modelo sin `config.json` externo, ademas de la documentacion del fallo de precision del T5 en fp16.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) mediante muestreo iterativo con guia CFG.
- Control del numero de pasos de muestreo (el ejemplo de la model card usa 50 pasos) y de la escala CFG (ejemplo con 3.0).
- Reproducibilidad mediante semilla explicita en el generador de ruido.
- Carga autocontenida: el archivo incluye configuraciones de los tres componentes y los embeddings incondicionales para CFG.
- No soporta tool calling, function calling ni razonamiento multi-paso; es exclusivamente un modelo generativo de imagenes.
- No se declaran capacidades multilingues, de vision por entrada, audio ni modo de razonamiento.

## Casos de uso

- Prototipado rapido de pipelines text-to-image: al estar todo en un unico safetensors, se puede cargar el modelo con unas pocas lineas de codigo y sin gestionar descargas de dependencias separadas, lo que acelera la experimentacion.
- Generacion de ilustraciones conceptuales en entornos de investigacion: con 297,5M de parametros y 0,81 GB en fp16, se puede iterar sobre prompts y semillas en una unica GPU de consumo para estudiar el comportamiento del muestreo.
- Pruebas de reproducibilidad y evaluacion de precision numerica: el repositorio documenta la diferencia entre fp32 y fp16 en cada componente, lo que lo convierte en un caso de estudio util para validar pipelines de inferencia mixta.
- Integracion en demos y aplicaciones educativas: la licencia Apache 2.0 y el formato unico facilitan su inclusion en notebooks y tutoriales sobre modelos de difusion.
- Generacion de assets visuales de baja resolucion (latentes de 32x32): adecuado para bocetos, moodboards o placeholders en flujos de diseno que no requieran alta fidelidad.
- Despliegue en hardware modesto: el tamano reducido permite ejecutar inferencia en GPUs con poca VRAM (el autor midio en una Tesla T4), lo que habilita entornos de desarrollo y CI con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye mediciones de divergencia numerica entre fp16 y fp32 por componente, realizadas en una Tesla T4 con el mismo prompt y semilla:

| Componente en fp16 | Diferencia absoluta media vs fp32 | Veredicto |
|---|---|---|
| DiT | 0,0001 | Seguro |
| VAE | 0,0001 | Seguro |
| Codificador de texto T5 | 0,1849 | Roto: nunca usar fp16 |

Adicionalmente se reporta que el T5 en fp16 presenta una similitud coseno de 0,892 y una diferencia absoluta maxima de 1,38 respecto al resultado en fp32, lo que produce imagenes sobresaturadas que dejan de seguir el prompt.

## Requisitos de hardware

- VRAM estimada: inferior a 2 GB para los pesos en fp16 (0,81 GB) y en torno a 1,5-2 GB para fp32 (1,19 GB), mas el overhead de activaciones y del latente de 32x32, que es minimo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor verifico el funcionamiento en una Tesla T4. Tambien cabe en RTX 3060, RTX 4060 y superiores.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: carga manual con `safetensors` y `transformers`/`diffusers` segun el codigo de la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a difusion).
- Latencia y throughput: no disponibles. El ejemplo usa 50 pasos de muestreo, pero no se publican tiempos por paso ni imagenes por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base original ni de alternativas directamente comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A modo de referencia estructural:

| Modelo | Parametros | Contexto texto | Formato | Licencia |
|---|---|---|---|---|
| Supra2-Safetensors (este) | 297,5M | 128 tokens | safetensors unico | Apache 2.0 |
| SupraLabs/Supra2-IMG (base) | 297,5M | 128 tokens | multiples componentes | No disponible |
| Alternativas text-to-image de tamano similar | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El codificador de texto nunca debe convertirse a fp16: un `model.half()` global reintroduce el fallo de sobresaturacion descrito en la model card.
- El tokenizador no esta embebido en el safetensors (es un binario `spiece.model`); es necesario cargarlo desde `google/flan-t5-base`.
- El peso `text_encoder.encoder.embed_tokens.weight` esta atado a `shared.weight` y solo se almacena una vez; hay que restaurar el alias al cargar o la carga estricta fallara.
- Contexto de texto limitado a 128 tokens, lo que restringe la complejidad de los prompts.
- No se declaran idiomas soportados; el comportamiento multilingue no esta verificado.
- Riesgo de alucinacion visual y de imagenes que no sigan fielmente el prompt, inherente a los modelos de difusion de este tamano; no hay evaluaciones publicadas de fidelidad.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad; es un empaquetado de terceros, no el modelo oficial.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint original SupraLabs/Supra2-IMG, que no se detalla en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mondk/Supra2-Safetensors
- Modelo base: https://huggingface.co/SupraLabs/Supra2-IMG
- Codificador de texto: https://huggingface.co/google/flan-t5-base
- VAE: https://huggingface.co/stabilityai/sd-vae-ft-mse
