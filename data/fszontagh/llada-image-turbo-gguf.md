# fszontagh/LLaDA-Image-Turbo-GGUF

## Resumen

`fszontagh/LLaDA-Image-Turbo-GGUF` es un repositorio de pesos cuantizados en formato GGUF que permite ejecutar el modelo de generación y edición de imágenes LLaDA-Image-Turbo (desarrollado por inclusionAI) con la implementación stable-diffusion.cpp. No se trata de un modelo nuevo ni reentrenado: el autor declara explícitamente que no se ha reentrenado ni alterado ningún peso, y que los ficheros GGUF se obtienen cuantizando el transformer original en bf16 con stable-diffusion.cpp, mientras que los ficheros de conectores reempaquetan componentes originales renombrando únicamente los tensores.

El repositorio resuelve un problema práctico de despliegue: el modelo original se distribuye con componentes separados (transformer, text encoder, QueryFormer, proyección de texto, VAE y el codificador de imagen SigVQ para edición) y stable-diffusion.cpp espera un único fichero de conectores, por lo que aquí se publican versiones fusionadas. Además, se ofrecen dos niveles de cuantización del transformer (q8_0 de 7,0 GB y f16 de 13,1 GB) que reducen el peso respecto al bf16 original.

Su relevancia es la de habilitar inferencia local de un modelo de difusión de generación y edición de imágenes en GPU de consumo: el autor indica que stable-diffusion.cpp hace streaming de los pesos, de modo que con `--max-vram 3` se obtiene una salida idéntica byte a byte, y que la edición a 1024x1024 cabe en una tarjeta de 12 GB usando `--diffusion-fa`. El soporte del modelo se añadió en el PR leejet/stable-diffusion.cpp#1968. El repositorio acumula 0 descargas y 1 like en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para texto a imagen y edición de imágenes, con transformer de difusión, text encoder (fichero sugerido por el autor: `llada2-moe-q4_K.gguf`, lo que apunta a un codificador de texto de tipo MoE), conectores QueryFormer y proyección de texto, VAE, y encoder de imagen SigVQ para edición |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (el nombre de fichero sugerido para el text encoder, `llada2-moe`, indica un componente MoE, pero no se publican cifras) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Transformer: `q8_0` (7,0 GB, recomendado) y `f16` (13,1 GB). Conectores en safetensors (sin cuantizar). El text encoder, no incluido, se puede convertir a `q4_K` con `sd-cli -M convert` |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 (heredada del modelo base LLaDA-Image-Turbo) |
| Formato de pesos | GGUF (transformer), safetensors (conectores). El VAE y el text encoder se toman del repositorio upstream |

Otras especificaciones:

| Parámetro | Valor |
|---|---|
| Pipeline | text-to-image (con soporte adicional de image-editing) |
| Modelo base | inclusionAI/LLaDA-Image-Turbo |
| Ficheros publicados | `llada-image-turbo-q8_0.gguf` (7,0 GB), `llada-image-turbo-f16.gguf` (13,1 GB), `llada_connectors.safetensors` (0,75 GB), `llada_connectors_edit.safetensors` (3,35 GB) |
| Tamaño declarado del repositorio | 4,1 GB |
| Pasos de inferencia recomendados | 4 pasos con `--cfg-scale 1.0` |
| Restricciones de resolución | Múltiplos de 16 en texto a imagen; múltiplos de 32 en edición |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Su contenido son cuantizaciones del transformer en bf16 de LLaDA-Image-Turbo generadas con stable-diffusion.cpp, más dos ficheros de conectores en safetensors que fusionan componentes que el repositorio original distribuye en directorios separados. En concreto, LLaDA-Image necesita un QueryFormer y una proyección de texto junto a su text encoder, y un encoder de imagen SigVQ para la edición; como la opción `--embeddings-connectors` acepta un único fichero, aquí se combinan usando el nombre del componente como prefijo del nombre de tensor. El fichero `llada_connectors.safetensors` sirve solo para texto a imagen y `llada_connectors_edit.safetensors` añade SigVQ, de modo que una sola carga del modelo cubre ambos modos; según el autor, ambos producen salidas idénticas en texto a imagen.

La arquitectura subyacente es la del modelo de difusión LLaDA-Image-Turbo de inclusionAI, con una variante optimizada para pocos pasos (el autor recomienda 4 pasos con escala CFG 1.0). El text encoder no se incluye en este repositorio: procede de inclusionAI/LLaDA-Image-Turbo, pesa 33 GB en bf16 y el autor recomienda convertirlo previamente a GGUF con cuantización `q4_K` mediante `sd-cli -M convert` sobre `text_encoder/model.safetensors.index.json`. El VAE también se toma del repositorio original (`vae/diffusion_pytorch_model.safetensors`). No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de imágenes a partir de descripciones textuales, con muestreo en 4 pasos y escala CFG 1.0.
- Edición de imágenes guiada por instrucciones en lenguaje natural mediante imagen de referencia (`--ref-image`), incluyendo la modificación de texto presente en la imagen, como cambiar el texto de un cartel.
- Carga única para ambos modos: el fichero `llada_connectors_edit.safetensors` incluye SigVQ, por lo que una sola carga del modelo sirve para texto a imagen y para edición.
- Generación a resolución de 1024x1024 en los ejemplos oficiales del repositorio.
- Ejecución local sin dependencia de servicios en la nube, mediante stable-diffusion.cpp.
- Soporte de streaming de pesos con presupuesto de VRAM reducido: `--max-vram 3` produce salida idéntica byte a byte según el autor.
- Soporte de atención con `--diffusion-fa` (flash attention), necesario para editar a 1024x1024 en una tarjeta de 12 GB.
- Idiomas de las indicaciones: inglés y chino.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, audio ni visión de entrada más allá de la imagen de referencia para edición.

## Casos de uso

- Generación de imágenes en local para equipos con GPU de consumo: con el transformer en `q8_0` (7,0 GB) y streaming de pesos, el autor confirma que un presupuesto de VRAM de 3 GB sigue produciendo salidas idénticas, lo que permite desplegar texto a imagen en máquinas modestas.
- Edición de imágenes por instrucción en producción gráfica: el fichero `llada_connectors_edit.safetensors` añade SigVQ y permite reescribir texto dentro de una imagen a partir de una imagen de referencia, útil para localizar carteles, rótulos o mockups sin rehacer el diseño.
- Sustitución de texto en material promocional multilingüe (en/zh): el modelo soporta indicaciones en inglés y chino, lo que encaja en flujos de adaptación de creatividades entre esos dos mercados.
- Prototipado rápido de conceptos visuales: con solo 4 pasos y CFG 1.0, el coste por imagen es bajo, lo que facilita iterar sobre variantes de una misma indicación en sesiones de diseño.
- Automatización por lotes mediante CLI: `sd-cli` acepta rutas de salida y parámetros de resolución fijos, de modo que se puede encadenar la generación dentro de un script o de un proceso por lotes sin servidor intermedio.
- Procesos con requisitos de privacidad de datos: al ejecutarse íntegramente en local con pesos descargados, las imágenes de referencia de edición no salen de la infraestructura propia.
- Investigación sobre cuantización en modelos de difusión: el repositorio ofrece la misma arquitectura en `q8_0` y `f16`, lo que permite medir el impacto de la cuantización en la fidelidad de la salida manteniendo el resto del pipeline constante.
- Despliegue en tarjetas de 12 GB para edición a 1024x1024: el autor indica que en ese escenario es necesario activar `--diffusion-fa`, lo que describe un caso realista de estación de trabajo con GPU de gama media-alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como FID, CLIP score, GenEval, MMLU ni similares, ni comparaciones numéricas con otros modelos de texto a imagen. Los únicos datos de rendimiento publicados son operativos: 4 pasos de muestreo con `--cfg-scale 1.0`, resolución de 1024x1024 en los ejemplos, y la afirmación de que `--max-vram 3` produce una salida idéntica byte a byte a la de un presupuesto de VRAM mayor. No se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- Peso del transformer: 7,0 GB en `q8_0` (recomendado) y 13,1 GB en `f16`.
- Peso de los conectores: 0,75 GB para texto a imagen (`llada_connectors.safetensors`) y 3,35 GB para texto a imagen más edición (`llada_connectors_edit.safetensors`).
- Text encoder: 33 GB en bf16 si se usa sin convertir; el autor recomienda convertirlo a GGUF con cuantización `q4_K`, lo que reduce considerablemente el espacio necesario.
- VAE: se toma del repositorio upstream; su tamaño no se detalla en la información disponible.
- El autor indica que los pesos suman aproximadamente 16 GB en total, pero que stable-diffusion.cpp hace streaming, por lo que un presupuesto menor es viable: `--max-vram 3` mantiene la salida idéntica byte a byte.
- Edición a 1024x1024: requiere `--diffusion-fa` en una tarjeta de 12 GB.
- GPU concretas recomendadas: no disponibles en la información proporcionada. Los únicos umbrales documentados son el presupuesto de VRAM de 3 GB con streaming y la tarjeta de 12 GB para edición a 1024x1024 con flash attention.
- Opciones de despliegue: stable-diffusion.cpp (`sd-cli`) es el runtime soportado y el único documentado. No se mencionan vLLM, TGI, Ollama ni llama.cpp para este modelo; `sd-cli -M convert` se usa únicamente para convertir el text encoder a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos de texto a imagen (parámetros, contexto, benchmarks, licencia) que permitan una comparación cuantitativa. La comparación posible se limita a las variantes publicadas en este repositorio y al modelo original:

| Variante | Formato | Tamaño del transformer | Uso | Licencia |
|---|---|---|---|---|
| inclusionAI/LLaDA-Image-Turbo (original) | bf16 (safetensors) | Equivalente al f16 de este repositorio (13,1 GB) | Modelo completo, incluye text encoder y VAE | apache-2.0 |
| `llada-image-turbo-q8_0.gguf` | GGUF q8_0 | 7,0 GB | Transformer cuantizado, recomendado | apache-2.0 |
| `llada-image-turbo-f16.gguf` | GGUF f16 | 13,1 GB | Transformer en f16, mismo tamaño que los pesos originales | apache-2.0 |

Alternativas de otros desarrolladores: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Adopción mínima verificable: el repositorio registra 0 descargas y 1 like, por lo que no existe validación comunitaria sobre la calidad de las cuantizaciones.
- Discrepancia de tamaños: el tamaño declarado del repositorio es 4,1 GB, mientras que la suma de los ficheros listados en la model card supera ampliamente esa cifra (7,0 GB + 13,1 GB + 0,75 GB + 3,35 GB). Conviene verificar el contenido antes de la descarga.
- Ausencia de benchmarks: no hay métricas publicadas de fidelidad, coherencia texto-imagen ni calidad de edición, ni comparación con el modelo original en bf16.
- Dependencia de componentes externos: el text encoder y el VAE no están incluidos, y el text encoder pesa 33 GB en bf16; sin convertirlo, el despliegue pierde buena parte de la ventaja de tamaño del GGUF.
- Restricciones de resolución: las dimensiones deben ser múltiplos de 16 en texto a imagen y de 32 en edición; otros valores no están soportados según la documentación citada.
- Configuración de muestreo restringida: el autor indica usar 4 pasos y `--cfg-scale 1.0`; no se documenta el comportamiento con otros valores.
- Idiomas limitados: solo inglés y chino. No hay soporte declarado de castellano.
- Texto dentro de imágenes: la edición de texto es una capacidad destacada, pero no se aportan ejemplos de precisión ni de tasas de fallo; es esperable deriva tipográfica o errores de renderizado, aunque no se cuantifica en la información disponible.
- Sesgos: no se publica ninguna evaluación de sesgos del modelo base ni de estas cuantizaciones.
- Licencia: apache-2.0, heredada del modelo base y aplicable a estos ficheros según el autor; cualquier uso debe respetar además las condiciones del repositorio original.
- Procedencia de los pesos: no se reentrenó nada, pero la cuantización es un proceso con pérdida; el autor no publica una comparación numérica entre `q8_0`, `f16` y el bf16 original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/fszontagh/LLaDA-Image-Turbo-GGUF
- Modelo base: https://huggingface.co/inclusionAI/LLaDA-Image-Turbo
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Pull request que añade el soporte: https://github.com/leejet/stable-diffusion.cpp/pull/1968
- Guía de uso de LLaDA-Image: https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/llada_image.md

Nota: la búsqueda web asociada a esta ficha devolvió únicamente enlaces genéricos a YouTube, sin relación con el modelo; no se han podido incorporar otras fuentes (papers, blogs o demos) a partir de ella.
