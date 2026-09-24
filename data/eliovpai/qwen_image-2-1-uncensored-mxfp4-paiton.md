# EliovpAI/Qwen_Image-2.1-Uncensored-MXFP4-Paiton

## Resumen

Qwen_Image-2.1-Uncensored-MXFP4-Paiton es una conversión cuantizada en MXFP4 del checkpoint BF16 sin censura de Qwen-Image-2.1 publicado por el usuario abenzerps, preparada por EliovpAI para GPUs AMD con ROCm. El modelo base, Qwen-Image-2.1, es un modelo unificado de generación y edición de imagen de la familia Qwen, con 7.000 millones de parámetros en su componente de generación visual (32 capas DiT single-stream). Esta variante conserva la arquitectura completa, pero empaqueta los pesos del transformer de difusión en MXFP4 (E2M1 con una escala E8M0 por cada 32 columnas) y mantiene en BF16 las entradas, salidas, condicionamiento, normalizaciones, sesgos y el VAE, con activaciones también en BF16.

El paquete ocupa 8,674 GiB de tensores y está diseñado para ejecutarse con el cargador incluido: un `DiffusionPipeline.from_pretrained` sin modificar no puede leer el formato empaquetado. La integración se reparte entre un decodificador nativo HIP verificado por SHA-256 para GPUs gfx1201 (RDNA4) y una reconstrucción de pesos por framework para el resto de GPUs ROCm soportadas, junto con un contenedor Docker (plugin Paiton v1.0.3) que aporta optimizaciones adicionales de atención, normalización y GEMM.

Su interés actual es doble: permite generar y editar imágenes a 1024 y 2048 píxeles en hardware AMD con un coste de memoria medido de 32-35 GiB, y funciona como caso de estudio de cuantización MXFP4 aplicada a modelos de difusión, con una degradación cuantificada de CLIPScore (0,9024 a 0,8688) y un LPIPS medio de 0,1927 frente a la referencia BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) unificado para generación y edición de imagen, con 32 capas single-stream DiT en el componente de generación visual, más codificador de texto y VAE (según el modelo base Qwen-Image-2.1) |
| Parámetros totales | No disponible para este checkpoint cuantizado; el componente de generación visual del modelo base declara 7.000 millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; resoluciones de generación soportadas: 1024x1024 y 2048x2048, lote 1, 40 pasos, guidance 1.0 |
| Tipos de cuantización | MXFP4 mixta: E2M1 con una escala E8M0 por cada 32 columnas; 224 capas del transformer convertidas y 73 tensores del transformer mantenidos intencionadamente en BF16; entradas/salidas/condicionamiento, normalizaciones, sesgos y VAE en BF16; activaciones en BF16 |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (`license: other`, `license_name: qwen-research`, enlace a `LICENSE` en el repositorio) |
| Formato de pesos | Pesos MXFP4 empaquetados (8,674 GiB de tensores); contenedor exacto no especificado en la información disponible; requiere el cargador incluido en el paquete |
| Tamaño del repositorio | 9,3 GB |
| Modelo base | abenzerps/Qwen-Image-2.1-Uncensored-GGUF (relación: cuantizado) |
| Origen | Qwen/Qwen-Image-2.1 |
| Pipeline declarado | text-to-image |
| Descargas / likes | 0 / 0 según los datos disponibles |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) de la familia Qwen-Image, con 32 capas single-stream en el componente de generación visual y 7.000 millones de parámetros en ese componente, complementado por un codificador de texto y un VAE. Este checkpoint no reentrena la arquitectura: parte del checkpoint BF16 del fine-tune sin censura de abenzerps, obtenido a partir de un LoRA fusionado cuya receta de entrenamiento no se ha publicado (tampoco hay información sobre RLHF o DPO). La conversión se hizo desde BF16 y no desde una cuantización GGUF de menor precisión.

El proceso de cuantización extrajo sin pérdidas los 297 tensores BF16 de origen. Se convirtieron 224 capas del transformer a MXFP4, verificadas contra Quark mediante un decodificador MXFP4 independiente, y los 73 tensores restantes del transformer se mantuvieron en BF16 de forma deliberada para preservar la precisión de inferencia en puntos críticos. La receta balanceada empaqueta 224 objetivos del transformer y 372 objetivos de texto/visión. Como innovación de despliegue, el paquete incluye un decodificador nativo HIP (sin dependencias de Torch ni Triton) que se activa automáticamente en GPUs gfx1201 y recurre a la decodificación por framework en modo `auto` cuando la biblioteca nativa no está disponible, registrando el motivo. Las optimizaciones adicionales de atención, normalización y GEMM las aporta el plugin/contenedor; el compilador y el código fuente de esa implementación optimizada no se distribuyen.

## Capacidades

- Generación de imagen a partir de texto (text-to-image) en resoluciones cuadradas de 1024x1024 y 2048x2048, con lote de tamaño 1, 40 pasos de muestreo y guidance 1.0.
- Edición de imagen con una única imagen de entrada (`--mode edit`), a tamaño 1024.
- Salida con transparencia en formato RGBA (`--mode rgba`), con alfa cubriendo el rango 0-255.
- Variantes no predeterminadas verificadas: transmisiones no por defecto, RGBA con alfa completo y rutas de edición, incluida la prueba A-B-A.
- Determinismo a nivel de embeddings de prompt y latentes finales del denoiser: repetidos con la misma semilla resultan bit-idénticos; la variabilidad restante se limita al VAE (PSNR RGB de imagen repetida de aproximadamente 61,2 dB, el mismo valor observado en los controles BF16).
- Comportamiento "uncensored" según la etiqueta del autor del fine-tune, no verificado por el filtro de corrección de imágenes convencionales del conversor.
- API compatible con selección de checkpoint: el servicio identifica este modelo como `paiton-image-2.1-uncensored` y permite omitir el campo `model` para usar el checkpoint cargado.
- No es un modelo de lenguaje: no soporta tool calling, function calling, uso como agente ni razonamiento multi-paso textual (no aplica).
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de imágenes a alta resolución en infraestructura AMD: con 2048x2048 y lote 1, la generación medida en una MI355X tarda 23,60 s en la primera petición y entre 21,13 y 21,52 s en las siete siguientes, lo que permite presupuestar un throughput aproximado de 2,8 imágenes por minuto por GPU en peticiones consecutivas.
- Edición de imagen de referencia única: el modo `edit` con una imagen y tamaño 1024 sirve para retoques guiados por prompt (cambio de estilo, sustitución de objetos) sin necesidad de máscaras, según el flujo descrito por el autor.
- Composición de material gráfico con transparencia: la salida RGBA con alfa de 0 a 255 permite generar assets directamente utilizables sobre fondos variables (producto, logotipos, elementos de interfaz) sin posprocesado de recorte.
- Despliegue en estación de trabajo RDNA4: el checkpoint y el contenedor están probados para GPUs de 32 GB como la Radeon AI PRO R9700, con todos los componentes del modelo residentes en la GPU, lo que habilita generación local sin servicios externos.
- Servicio HTTP interno: el contenedor `ghcr.io/eliovp/paiton-vllm-plugin:qwen-image21-mxfp4-rdna4-v1.0.3` expone la API en `127.0.0.1:8191`, lo que permite integrarlo en herramientas internas de diseño o pipelines de contenido.
- Investigación sobre cuantización de modelos de difusión: la pareja BF16/MXFP4 con métricas publicadas (CLIPScore, LPIPS, PSNR) y decodificadores independientes permite reproducir análisis de degradación por cuantización en DiT a gran escala.
- Generación de contenido creativo sin filtros temáticos: la etiqueta "uncensored" del fine-tune apunta a prompt adherence sin rechazos temáticos, siempre bajo revisión legal y de políticas de uso propias del operador.
- Reproducción determinista de resultados: la igualdad bit a bit de embeddings y latentes con semilla fija permite auditar experimentos, comparar prompts o validar regresiones en el pipeline de inferencia.

## Benchmarks y rendimiento

No se han publicado benchmarks de tipo MMLU, HumanEval o GSM8K en la información disponible, ya que no se trata de un modelo de lenguaje. Sí hay mediciones de calidad de imagen, latencia y memoria publicadas por el autor:

| Métrica | Referencia BF16 del fine-tune | Este checkpoint MXFP4 |
|---|---|---|
| CLIPScore medio (8 pares, 2048x2048) | 0,9024 | 0,8688 |
| LPIPS medio frente a la referencia BF16 | — | 0,1927 |
| PSNR RGB de imagen repetida con la misma semilla | ~61,2 dB | ~61,2 dB |
| Coincidencia de embeddings de prompt y latentes finales | — | bit-idéntica en repeticiones |

| Medición de rendimiento | Valor |
|---|---|
| Latencia, primera petición 2048x2048 instrumentada | 23,60 s |
| Latencia, siete peticiones posteriores con prompts distintos | 21,13-21,52 s |
| Pico de memoria de dispositivo muestreado (pantalla 2048) | 32,31 GiB |
| Pico de memoria muestreado en la suite completa de modos | 34,59 GiB |
| Límite de asignador de framework de 30 GiB | Falló en la prueba instrumentada |

El autor señala explícitamente que la comparación de imágenes es una pantalla descriptiva y no una garantía de equivalencia de imagen ni de preferencia humana.

## Requisitos de hardware

- VRAM: entre 32 y 35 GiB en la práctica según las mediciones publicadas (32,31 GiB de pico en generación 2048x2048 y 34,59 GiB en la suite de modos). Un límite de asignador de 30 GiB falló, por lo que 32 GB es el mínimo operativo realista.
- GPU probadas: MI355X (`gfx950`) para conversión y corrección, y GPUs compatibles `gfx1201` (RDNA4) para el decodificador nativo HIP. La Radeon AI PRO R9700 de 32 GB aparece citada como plataforma de referencia en el paquete relacionado de RDNA4.
- No hay soporte CUDA/NVIDIA documentado en la información disponible: la pila es ROCm. El uso en GPUs de consumo NVIDIA no está descrito y no debería asumirse.
- No cabe en GPUs de consumo de gama media: el requisito de más de 32 GiB de VRAM descarta tarjetas de 16 o 24 GB con la configuración documentada.
- Opciones de despliegue: contenedor Docker `ghcr.io/eliovp/paiton-vllm-plugin:qwen-image21-mxfp4-rdna4-v1.0.3`; uso directo con Python 3.12 y `launch.sh` tras descargar el repositorio con la CLI de Hugging Face; selección de decodificador con `--decoder framework` o `--decoder native`. El decodificador nativo requiere un runtime capaz de cargar el artefacto ROCm 10 incluido; si no está disponible, `auto` cae a decodificación por framework y registra el motivo.
- Entorno de referencia probado: Torch `2.10.0+rocm7.1`, HIP `7.1.25424`, Quark `0.12.post1+rocm71.torch2.10` y commit de Diffusers `7263f3317f6b392d62f41e9d75ed9d7e21fc5a5c` (`requirements-mi355.lock.txt` recoge el entorno MI355 exacto).
- Restricciones operativas: sin offload del modelo a CPU, sin tiling del VAE y sin captura de grafo de todo el pipeline. Solo un worker a la vez; los checkpoints `uncensored` y `original` no residen simultáneamente y cambiar de uno a otro exige reiniciar el worker.

## Comparativa con modelos similares

| Modelo | Cuantización / formato | Tamaño de pesos | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| EliovpAI/Qwen_Image-2.1-Uncensored-MXFP4-Paiton (este) | MXFP4 mixta con BF16 en capas críticas | 8,674 GiB de tensores (repo de 9,3 GB) | qwen-research | ROCm, gfx1201 y gfx950 probadas | Fine-tune sin censura; CLIPScore 0,8688 y LPIPS 0,1927 frente a su referencia BF16 |
| abenzerps/Qwen-Image-2.1-Uncensored-GGUF | BF16 y GGUF | No disponible | qwen-research | Runtimes compatibles con GGUF | Checkpoint de origen del fine-tune (LoRA fusionado, receta no publicada) |
| EliovpAI/Qwen_Image-2.1-MXFP4 | MXFP4 balanceada | Mismo conjunto de tensores que la versión balanceada | qwen-research | Paquete portable con API Python y CLI | Derivado del modelo original, sin la etiqueta de fine-tune sin censura |
| EliovpAI/Qwen_Image-2.1-MXFP4-Paiton-RDNA4 | MXFP4 empaquetada | 8,67 GiB de tensores | qwen-research | RDNA4, benchmark en Radeon AI PRO R9700 de 32 GB | Variante enfocada a RDNA4 del paquete portable |
| Qwen/Qwen-Image-2.1 | BF16 (original) | 7.000 millones de parámetros en el componente visual | Licencia de Qwen (original) | Multiplataforma | Modelo base unificado de generación y edición; 32 capas DiT single-stream |

## Limitaciones y advertencias

- La licencia es `qwen-research` (`license: other`), no una licencia de código abierto estándar. Es imprescindible revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial, ya que las condiciones de explotación no se detallan en la model card.
- La etiqueta "uncensored" procede del autor del fine-tune. El propio conversor advierte que su pantalla de corrección de imágenes ordinarias no verifica todos los comportamientos atribuidos al fine-tune ni garantiza salidas sin restricciones. Existe riesgo de generar contenido inapropiado o no apto para determinados entornos.
- No se ha publicado la receta de entrenamiento del LoRA fusionado, lo que limita la reproducibilidad del comportamiento del fine-tune.
- La cuantización MXFP4 degrada la calidad: el CLIPScore medio cae de 0,9024 a 0,8688 y el LPIPS medio frente a la referencia BF16 es de 0,1927. El autor indica que la cuantización puede alterar la composición de la imagen y, de forma destacable, el renderizado de texto.
- Las métricas publicadas son una pantalla descriptiva sobre ocho pares de imágenes; no constituyen una garantía de equivalencia de imagen ni de preferencia humana.
- El formato empaquetado exige el cargador incluido. Un `DiffusionPipeline.from_pretrained` estándar no puede cargar estos pesos, lo que rompe la portabilidad habitual entre frameworks.
- Solo hay evidencia de funcionamiento en ROCm/AMD. No se documenta soporte para CUDA ni para GPUs NVIDIA, y no hay resultados publicados en ese hardware.
- Sin offload a CPU ni tiling del VAE, el modelo necesita más de 30 GiB de VRAM de forma efectiva; un límite de asignador de 30 GiB falló en las pruebas instrumentadas.
- No se soporta la captura de grafo de todo el pipeline y solo puede haber un worker activo con un checkpoint cargado a la vez.
- El compilador y el código fuente de las optimizaciones de atención, normalización y GEMM no se distribuyen, por lo que parte del rendimiento del contenedor no es auditable ni reproducible al margen del plugin.
- No es un modelo de lenguaje: no genera texto, no razona simbólicamente y no admite tool calling ni flujos de agente.
- No hay información publicada sobre sesgos, cobertura de idiomas en los prompts ni comportamiento en dominios culturales específicos.
- Repositorio sin adopción registrada (0 descargas y 0 likes en los datos disponibles), lo que reduce la base de validación externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/EliovpAI/Qwen_Image-2.1-Uncensored-MXFP4-Paiton
- Modelo base del fine-tune: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- Discusión del autor original sobre el LoRA fusionado: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF/discussions/20
- Modelo original: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de código de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Paquete MXFP4 portable del modelo original: https://huggingface.co/EliovpAI/Qwen_Image-2.1-MXFP4
- Variante del paquete para RDNA4: https://huggingface.co/EliovpAI/Qwen_Image-2.1-MXFP4-Paiton-RDNA4
- Imágenes de comparación de calidad (par 1): https://huggingface.co/EliovpAI/Qwen_Image-2.1-Uncensored-MXFP4-Paiton/blob/main/evaluation/quality-pairs-1.png
- Imágenes de comparación de calidad (par 2): https://huggingface.co/EliovpAI/Qwen_Image-2.1-Uncensored-MXFP4-Paiton/blob/main/evaluation/quality-pairs-2.png
- Mediciones completas de corrección en MI355: https://huggingface.co/EliovpAI/Qwen_Image-2.1-Uncensored-MXFP4-Paiton/blob/main/evaluation/mi355-correctness.json
- Imagen de contenedor: ghcr.io/eliovp/paiton-vllm-plugin:qwen-image21-mxfp4-rdna4-v1.0.3
- Artículo sobre ejecución local del modelo sin censura: https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
- Guía de API de edición sin censura: https://spicyapi.ai/blog/qwen-image-2-1-api-guide
