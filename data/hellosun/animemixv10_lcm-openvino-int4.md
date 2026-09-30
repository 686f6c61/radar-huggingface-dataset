# HelloSun/animemixv10_lcm-OpenVINO-INT4

## Resumen

Esta ficha describe `HelloSun/animemixv10_lcm-OpenVINO-INT4`, una conversión del modelo de difusión `sca255/animemixv10_lcm` (Stable Diffusion 1.5 afinado con Latent Consistency Model sobre datos de estilo anime) a pesos OpenVINO cuantizados en INT4. El autor, HelloSun, publica el resultado como un pipeline de tipo `StableDiffusionPipeline` (estructura de directorios SD 1.x) consumible con `optimum-intel` y ejecutable íntegramente en CPU, sin CUDA ni GPU dedicada.

El interés principal de la conversión es la compresión: el pipeline en FP16 ocupa 3,2 GB y la versión cuantizada queda en 0,90 GB, un 72% menos. La cuantización es weight-only mediante NNCF: UNet y text_encoder a INT4 y VAE a INT8. El scheduler es `LCMScheduler` y el modelo está pensado para 8 pasos de inferencia con `guidance_scale=1.5`, sin necesidad de elevar el CFG.

El repositorio incluye 40 prompts de prueba (seeds 42-81) y 80 imágenes de ejemplo a 1024×1024 y 512×512, junto con tiempos de generación medidos en CPU para los diez primeros prompts. Con 8 descargas y 0 likes en el momento de la consulta, se trata de una publicación reciente y con poca validación externa. La licencia es openrail++ y el repositorio ocupa 1,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (Stable Diffusion 1.5): U-Net + text encoder CLIP + VAE, destilada con LCM (Latent Consistency Model); scheduler `LCMScheduler` |
| Parámetros totales | No disponible (la model card no publica recuento de parámetros) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusión; el condicionamiento proviene de un text encoder CLIP, no de una ventana de contexto) |
| Tipos de cuantización | INT4 weight-only en UNet y text_encoder; INT8 en VAE |
| Idiomas soportados | No disponible (las prompts de prueba están en inglés; el ejemplo 03 incluye texto en chino tradicional, «台北», como contenido a renderizar en la imagen) |
| Licencia | openrail++ |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`) con estructura de directorios diffusers; no se distribuyen safetensors ni GGUF |
| Tamaño de pesos | 0,90 GB en INT4 (frente a 3,2 GB en FP16; reducción del ~72%) |
| Tamaño del repositorio | 1,0 GB |
| Dispositivo de inferencia probado | CPU mediante el plugin CPU de OpenVINO |
| Pasos de inferencia recomendados | 8 (`num_inference_steps=8`) |
| Guidance recomendado | 1,5 (`guidance_scale=1.5`) |
| Resolución de prueba | 1024×1024 principal y 512×512 como contraste |
| Herramientas de conversión | optimum 2.3.0, optimum-intel 2.2.0, OpenVINO 2026.4.0, NNCF 3.4.0 |
| Versiones de inferencia | diffusers 0.37.1, transformers 4.57.6, tokenizers 0.22.0, huggingface-hub 0.35.1 |
| Modelo base | sca255/animemixv10_lcm |
| Descargas / likes | 8 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un autoencoder variacional (VAE) que comprime las imágenes a un espacio latente, una U-Net que realiza el proceso de eliminación de ruido en ese espacio latente y un text encoder CLIP que convierte la prompt en condicionamiento. Sobre esta base, el modelo original `sca255/animemixv10_lcm` aplica destilación LCM (Latent Consistency Model), una técnica que reduce el número de pasos de muestreo necesarios para obtener una imagen coherente: en lugar de las 20-50 iteraciones típicas de un sampler DDIM o Euler, el modelo está diseñado para 8 pasos con `guidance_scale` bajo (1,5). La model card indica explícitamente que no deben aumentarse los pasos ni el CFG, ya que el modelo está calibrado para esos valores y valores superiores degradan el resultado.

No se dispone de información sobre el dataset de entrenamiento (número de tokens, composición, resolución de las imágenes de entrenamiento) ni sobre si se aplicaron etapas de RLHF, DPO o ajuste por preferencias; la model card se centra exclusivamente en el proceso de conversión y cuantización, no en el entrenamiento del modelo base. La innovación técnica documentada en este repositorio es la propia cadena de conversión: exportación con `optimum-intel` y cuantización weight-only INT4 con NNCF, aplicada a UNet y text_encoder, dejando el VAE en INT8. No se documenta el uso de decodificación especulativa ni de mecanismos de atención lineal, que en cualquier caso no aplican a un pipeline de difusión de este tipo.

## Capacidades

- Generación de imágenes texto-a-imagen (text-to-image) con `StableDiffusionPipeline`.
- Especialización en ilustración de estilo anime: la model card documenta prompts de prueba para retratos de personajes, paisajes de tinta china, estilos Ghibli, estilo Makoto Shinkai, ilustración vectorial plana, estética retro de los 80 e impasto.
- Generación few-step: 8 pasos de inferencia con `guidance_scale=1.5`, gracias a la destilación LCM.
- Ejecución en CPU sin GPU ni CUDA, mediante el plugin CPU de OpenVINO.
- Generación a 1024×1024 pese a que SD 1.5 tiene resolución nativa de 512; el repositorio incluye pares de imágenes 1024 px y 512 px para comparar.
- Renderizado limitado de texto dentro de la imagen (el ejemplo 03 incluye los rótulos «TAIPEI» y «台北», con la limitación habitual de SD 1.5 en este aspecto).
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso, agentes ni modo «thinking».
- No procesa entrada de audio, vídeo ni visión como entrada; solo acepta texto.
- Reproducibilidad determinista: las semillas están fijadas (42-81) y los ejemplos son reproducibles.

## Casos de uso

- Ilustración de personajes anime en local sin GPU: un estudio pequeño o un aficionado puede generar ilustraciones de personajes a 1024×1024 en un portátil o en un servidor sin tarjeta gráfica, usando `OVDiffusionPipeline` con `compile=True` y pesos INT4 de 0,90 GB.
- Prototipado de arte conceptual para videojuegos o cómics: los 40 prompts del repositorio demuestran que el modelo cubre estilos variados (Ghibli, Shinkai, vectorial plano, retro 80s, tinta china), lo que permite explorar direcciones visuales antes de encargar arte final.
- Despliegue en entornos con CPU como único recurso: contenedores, máquinas virtuales o dispositivos edge donde no hay GPU disponible ni se puede instalar CUDA; el pipeline funciona con las dependencias de `optimum-intel` y OpenVINO.
- Generación por lotes para catálogos de contenido: dado que cada imagen tarda entre 32 y 41 segundos en CPU a 1024×1024 y 8 pasos, es viable generar cientos de imágenes por máquina y día para fondos, avatares o banners de temática anime.
- Integración en herramientas de escritorio o plugins de diseño: al no requerir GPU, el pipeline puede empaquetarse dentro de una aplicación de escritorio que ofrezca generación de ilustraciones anime sin depender de servicios en la nube.
- Evaluación y benchmarking de cuantización INT4 en difusión: el repositorio sirve como referencia para comparar calidad y latencia entre FP16 y INT4 sobre el mismo modelo base, con seeds fijas y tiempos publicados.
- Filtrado y revisión de prompts artísticos: sirve para comprobar experimentalmente cómo responde un modelo SD 1.5 LCM a variaciones de estilo antes de invertir en modelos de mayor tamaño como SDXL.
- Reproducción de la cadena de conversión: el repositorio documenta el proceso completo (optimum-intel → NNCF → OpenVINO) y los scripts `inference_int4.py` y `generate5.py`, lo que permite replicar el flujo con otros checkpoints SD 1.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (FID, CLIP score, precisión de prompt) ni comparaciones con otros modelos. Sí se publican medidas de latencia en CPU a 1024×1024, 8 pasos y `guidance_scale=1.5`, correspondientes a los diez primeros prompts del repositorio:

| Prompt | Seed | Resolución | Pasos | Tiempo (s) |
|---|---|---|---|---|
| 01_hanfu | 42 | 1024×1024 | 8 | 33,7 |
| 02_astronaut | 43 | 1024×1024 | 8 | 32,6 |
| 03_taipei | 44 | 1024×1024 | 8 | 32,3 |
| 04_shiba | 45 | 1024×1024 | 8 | 34,1 |
| 05_ink | 46 | 1024×1024 | 8 | 33,0 |
| 06_ghibli_style | 47 | 1024×1024 | 8 | 34,5 |
| 07_makoto_shinkai | 48 | 1024×1024 | 8 | 34,5 |
| 08_flat_vector | 49 | 1024×1024 | 8 | 37,4 |
| 09_retro_80s | 50 | 1024×1024 | 8 | 41,1 |
| 10_impasto_thick | 51 | 1024×1024 | 8 | 33,1 |

Media de estos diez prompts: 34,6 s por imagen, con un rango de 32,3 s a 41,1 s. El modelo o modelo de CPU empleado en las pruebas no se especifica en la información proporcionada, así que estas cifras no son extrapolables a otro hardware. La model card menciona que el repositorio incluye medidas de tiempo paso a paso para las 40 prompts, pero solo se han facilitado los tiempos totales de los diez primeros ejemplos.

## Requisitos de hardware

- Inferencia en CPU como caso de uso principal y único documentado: no requiere GPU ni CUDA.
- Pesos en disco o memoria: 0,90 GB en INT4 (UNet y text_encoder), más el VAE en INT8; el repositorio completo ocupa 1,0 GB.
- VRAM estimada en caso de ejecutar sobre GPU: aproximadamente 2-3 GB para pesos y activaciones a 1024×1024 (estimación a partir del tamaño INT4 publicado; no verificada en la información disponible).
- RAM estimada en CPU: en el entorno de 2-4 GB de RAM libre para el pipeline cargado, más el espacio de activaciones a 1024×1024 (estimación, no confirmada por el autor).
- Cabe sin problema en GPU de consumo (RTX 3060, RTX 4090, etc.), aunque el autor no ha validado esa ruta.
- Despliegue: `optimum-intel` (`OVDiffusionPipeline.from_pretrained(..., compile=True)`) sobre el runtime de OpenVINO. El repositorio está estructurado como pipeline diffusers, por lo que también puede cargarse con las herramientas habituales de diffusers siempre que se respete el formato OpenVINO IR.
- No compatible con vLLM, TGI, llama.cpp ni Ollama: son herramientas orientadas a modelos de lenguaje y a formatos GGUF, y este repositorio no distribuye pesos GGUF ni una topología de LLM.
- Latencia publicada: 32,3-41,1 s por imagen a 1024×1024, 8 pasos, en CPU (modelo de CPU no especificado). No se publican datos de throughput, latencia por paso ni consumo de memoria.
- `compile=True` mejora el rendimiento a cambio de un tiempo de compilación inicial no cuantificado.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño de pesos | Dispositivo objetivo | Pasos | Licencia |
|---|---|---|---|---|---|
| HelloSun/animemixv10_lcm-OpenVINO-INT4 | SD 1.5 + LCM, INT4/INT8 | 0,90 GB | CPU (OpenVINO) | 8 | openrail++ |
| sca255/animemixv10_lcm | SD 1.5 + LCM, FP16 | 3,2 GB (referencia de la model card para el pipeline en FP16) | GPU (diffusers) | 8 | no disponible en la información proporcionada |
| runwayml/stable-diffusion-v1-5 | SD 1.5 base, FP16 | no disponible en la información proporcionada | GPU (diffusers) | 20-50 típicos | CreativeML Open RAIL-M |
| Otras conversiones OpenVINO INT4 de la familia anime/SD 1.5 | SD 1.5 cuantizado con NNCF | no disponible en la información proporcionada | CPU (OpenVINO) | variable | variable |

No se dispone de datos de rendimiento comparativos entre estos modelos, por lo que la comparación se limita a tamaño de pesos, dispositivo objetivo, pasos de muestreo y licencia. El autor afirma que esta conversión es la de menor tamaño de su lote de repositorios OpenVINO INT4 y la que incluye más muestras de prueba (40 prompts y 80 imágenes), pero no aporta comparaciones numéricas con las otras.

## Limitaciones y advertencias

- Resolución nativa de SD 1.5: el modelo base trabaja de forma nativa a 512 px; generar a 1024×1024 puede producir artefactos como duplicación de extremidades, composiciones repetidas o detalles incoherentes. El propio repositorio incluye pares 512 px como contraste.
- Sesgo de dominio: es un modelo afinado sobre estilo anime, por lo que su rendimiento fuera de ese dominio (fotorrealismo, ilustración occidental, escenas complejas con muchos sujetos) no está documentado y probablemente sea pobre.
- Ajuste obligatorio de hiperparámetros: la model card advierte de que aumentar `num_inference_steps` por encima de 8 o `guidance_scale` por encima de 1,5 degrada el resultado. Es un modelo calibrado para un único régimen de inferencia.
- Artefactos de cuantización: la cuantización INT4 en UNet y text_encoder puede introducir pérdida de detalle fino en manos, rostros, ojos y texto pequeño; el autor no publica una comparación de calidad INT4 frente a FP16.
- Renderizado de texto limitado: es una limitación conocida de SD 1.5 y aplica aquí, pese a que uno de los ejemplos intente generar rótulos legibles.
- Idiomas: no hay información sobre el comportamiento de las prompts en idiomas distintos del inglés. Los ejemplos del repositorio usan inglés, con contenido en chino tradicional únicamente como texto a dibujar en la imagen.
- Licencia openrail++: permite uso comercial sujeto a las restricciones de uso de la licencia (incluye una lista de usos prohibidos y obligaciones de atribución). Es responsabilidad del usuario revisar los términos antes de un despliegue en producción. La licencia del modelo base `sca255/animemixv10_lcm` no se especifica en la información disponible y debe comprobarse por separado.
- Trazabilidad y mantenimiento: 8 descargas y 0 likes; sin validación externa. La model card está redactada en chino tradicional, lo que puede dificultar la revisión a parte del público.
- Dependencias muy concretas: el autor fija versiones específicas (diffusers 0.37.1, transformers 4.57.6, optimum 2.3.0, optimum-intel 2.2.0, OpenVINO 2026.4.0, NNCF 3.4.0). Otras combinaciones pueden no funcionar sin ajustes.
- Sin filtro de seguridad documentado: no se menciona la integración de un safety checker, por lo que la moderación de contenido generado queda enteramente del lado del usuario.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible y detalles inventados sin aviso.
- Rendimiento dependiente del hardware: los tiempos publicados no indican la CPU empleada, por lo que no sirven como referencia directa para planificar capacidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HelloSun/animemixv10_lcm-OpenVINO-INT4
- Modelo base: https://huggingface.co/sca255/animemixv10_lcm
- Listado de modelos afinados a partir del base: https://huggingface.co/models?other=base_model:finetune:sca255/animemixv10_lcm
- Script de inferencia incluido en el repositorio: `inference_int4.py` (https://huggingface.co/HelloSun/animemixv10_lcm-OpenVINO-INT4/blob/main/inference_int4.py)
- Script de generación por lotes y benchmark: `generate5.py` (https://huggingface.co/HelloSun/animemixv10_lcm-OpenVINO-INT4/blob/main/generate5.py)
- Imágenes de ejemplo: carpeta `examples/` del repositorio (https://huggingface.co/HelloSun/animemixv10_lcm-OpenVINO-INT4/tree/main/examples)
- Modelos verificados para OpenVINO (documentación 2025): https://docs.openvino.ai/2025/documentation/compatibility-and-support/supported-models.html
- Modelos verificados para OpenVINO (documentación 2024.2): https://docs.openvino.ai/2024/about-openvino/compatibility-and-support/supported-models.html
- Modelos soportados por OpenVINO GenAI: https://openvinotoolkit.github.io/openvino.genai/docs/supported-models/
