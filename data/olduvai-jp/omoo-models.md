# olduvai-jp/omoo-models

## Resumen

`olduvai-jp/omoo-models` es un repositorio de distribucion de pesos ya convertidos para su uso dentro de la aplicacion movil OMOO para iPhone, desarrollada por OLDUVAI inc. (organizacion `olduvai-jp`). No se trata de un modelo unico entrenado por el autor, sino de un paquete de modelos derivados de terceros y adaptados a formatos de ejecucion en dispositivo: un modelo de generacion de imagenes convertido a Core ML y un modelo auxiliar de vision-lenguaje en formato MLX. El repositorio esta marcado con `inference: false` en su model card, lo que indica que no esta pensado para cargarse directamente con las librerias estandar de Hugging Face.

El contenido se organiza en dos conjuntos descargables: `lcm8-multisize`, un modelo de difusion de 8 pasos con pesos compartidos para resoluciones cuadradas, verticales y horizontales, y `helper4b`, una cuantizacion 4-bit de Qwen3-VL-4B-Instruct en MLX que actua como modelo auxiliar (probablemente para comprension de imagenes de referencia y procesamiento de instrucciones en japones). El repositorio ocupa 12,5 GB y esta etiquetado para japones e ingles.

La relevancia de esta ficha es limitada para el publico general de desarrolladores: no hay pipeline declarado, no hay benchmarks publicados, el numero de descargas es cero y la licencia es heterogenea por conjunto (hereda CreativeML Open RAIL++-M del modelo de imagen y Apache 2.0 del auxiliar). Es util como referencia para quienes quieran entender como se empaquetan modelos para inferencia local en iOS con Core ML y MLX, o para reutilizar los pesos derivados respetando las licencias de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos conjuntos: modelo de difusion (derivado de animagine-xl-4.0, base SDXL) convertido a Core ML; y modelo vision-lenguaje Qwen3-VL-4B-Instruct cuantizado a 4-bit en MLX |
| Parametros totales | No disponible de forma agregada; el auxiliar es un modelo de 4B (Qwen3-VL-4B-Instruct); el de imagen deriva de SDXL (sin cifra confirmada en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit para el modelo auxiliar (sufijo `-4bit` en el origen); el modelo de imagen usa pesos Core ML con 8 pasos de inferencia (LCM), sin detalle de cuantizacion |
| Idiomas soportados | Japones (`ja`) e ingles (`en`) |
| Licencia | `per-model-license`: cada conjunto tiene su propia licencia. Imagen: CreativeML Open RAIL++-M (con restricciones). Auxiliar: Apache 2.0 |
| Formato de pesos | Core ML y MLX; `safetensors` como tag del repo; descarga mediante JSON con baseURL fijado a un commit, tamanos y SHA-256 |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento propio. El conjunto de imagen `lcm8-multisize` es una conversion a Core ML de `cagliostrolab/animagine-xl-4.0` (un modelo de difusion tipo SDXL orientado a ilustracion estilo anime) con fusion de `latent-consistency/lcm-lora-sdxl`, lo que permite generar en 8 pasos. La variante "multisize" comparte pesos entre formatos cuadrado, vertical y horizontal. La model card indica que los detalles de conversion y procedencia estan en `ACCELERATION_MODEL_CARD.md` y `CONVERSION.json`, incluidos en el repo.

El conjunto auxiliar `helper4b` es una cuantizacion 4-bit en MLX de `mlx-community/Qwen3-VL-4B-Instruct-4bit`, a su vez derivada de Qwen3-VL-4B-Instruct. Se trata por tanto de un transformer vision-lenguaje con capacidad de procesar imagenes e instrucciones de texto. El repo conserva la revision de origen en `omoo-source.json` y la licencia en `MODEL_LICENSE.md`. No hay informacion sobre datos de entrenamiento, tokens, RLHF/DPO ni innovaciones de decodificacion mas alla del uso de LCM para reducir pasos de muestreo.

## Capacidades

- Generacion de imagenes en dispositivo (iPhone) mediante difusion con 8 pasos de inferencia (LCM), en tres relaciones de aspecto (cuadrada, vertical, horizontal) con pesos compartidos.
- Modelo auxiliar vision-lenguaje de 4B parametros capaz de procesar imagenes de referencia y texto, orientado a instrucciones en japones e ingles.
- Soporte de inferencia local en iOS 18 o posterior para el conjunto de imagen, segun la model card.
- Descarga reanudable por HTTPS Range en bloques de 8 MiB con verificacion SHA-256.
- Idiomas: japones e ingles.
- No se documentan tool calling, function calling, modo agente, modo thinking explicito ni capacidades de audio.

## Casos de uso

- Generacion de ilustraciones anime en apps iOS: el conjunto `lcm8-multisize` permite generar imagenes en 8 pasos en el dispositivo, sin enviar datos a la nube, lo que encaja en apps de creacion visual con requisitos de privacidad.
- Procesamiento de imagenes de referencia en la app OMOO: `helper4b` puede analizar una imagen aportada por el usuario y producir una descripcion o instruccion en japones o ingles que alimente el pipeline de generacion.
- Distribucion controlada de pesos en aplicaciones moviles: el esquema de JSON con baseURL fijado a un commit, tamanos y SHA-256 sirve como referencia para implementar actualizaciones de modelos con integridad verificable.
- Prototipado de pipelines Core ML en macOS/iOS: los pesos convertidos permiten experimentar con difusion SDXL acelerada por LCM dentro del ecosistema Apple sin rehacer la conversion.
- Evaluacion de modelos vision-lenguaje cuantizados en MLX: `helper4b` es un punto de partida para probar Qwen3-VL-4B en 4-bit sobre hardware Apple.
- Base para derivados con licencia compatible: al conservar `MODEL_LICENSE.md`, `MODEL_CARD.md` y `MODIFICATIONS.md`, el repo facilita reutilizar los pesos respetando las condiciones de cada origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia del conjunto de imagen: Core ML en iPhone con iOS 18 o posterior; no se especifica VRAM ni RAM concreta.
- Inferencia del auxiliar: MLX, orientado a hardware Apple (Apple Silicon); no se detalla la memoria necesaria para la variante 4-bit de 4B parametros.
- No hay datos de compatibilidad con GPU NVIDIA (A100, H100, RTX 4090) ni con CUDA, ya que los formatos son Core ML y MLX.
- Opciones de despliegue: la app OMOO como cliente principal; los formatos no son cargables directamente por vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `olduvai-jp/omoo-models` (conjunto imagen) | Derivado de SDXL (sin cifra confirmada) | No disponible | Core ML | CreativeML Open RAIL++-M | Hugging Face, 0 descargas |
| `cagliostrolab/animagine-xl-4.0` | Base SDXL | No disponible | Diffusers/safetensors | CreativeML Open RAIL++-M | Hugging Face |
| `olduvai-jp/omoo-models` (auxiliar) | 4B (Qwen3-VL-4B-Instruct) | No disponible | MLX 4-bit | Apache 2.0 | Hugging Face |
| `mlx-community/Qwen3-VL-4B-Instruct-4bit` | 4B | No disponible | MLX 4-bit | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El repositorio esta marcado `inference: false`: los pesos no se cargan con las APIs estandar de Transformers/Diffusers.
- La licencia es heterogenea por conjunto; el uso comercial del modelo de imagen queda sujeto a las restricciones de CreativeML Open RAIL++-M y a los ficheros `MODEL_LICENSE.md` de cada set.
- No hay benchmarks, evaluaciones de sesgo ni datos de calidad publicados; el rendimiento depende del dispositivo y de la version de iOS.
- El modelo de imagen esta especializado en estilo anime (animagine-xl-4.0), lo que limita su uso fuera de ese dominio estetico.
- Idiomas limitados a japones e ingles; no se documenta soporte de castellano.
- Riesgo de alucinacion y de sesgos inherente a los modelos de origen; no se aportan evaluaciones propias.
- El numero de descargas y likes es cero en el momento de la consulta, lo que sugiere escasa validacion externa.
- No se garantiza la reproducibilidad de la conversion ni se publican metricas de fidelidad respecto a los modelos originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/olduvai-jp/omoo-models
- Perfil de la organizacion: https://huggingface.co/olduvai-jp
- GitHub de OLDUVAI inc.: https://github.com/olduvai-jp
- Modelo de imagen de origen: https://huggingface.co/cagliostrolab/animagine-xl-4.0
- LoRA LCM para SDXL: https://huggingface.co/latent-consistency/lcm-lora-sdxl
- Modelo auxiliar de origen: https://huggingface.co/mlx-community/Qwen3-VL-4B-Instruct-4bit
