# RunningHubAI/rh-qwen2512-z-image-flux2-klein-lora

## Resumen

rh-qwen2512-z-image-flux2-klein-lora es un conjunto de tres adaptadores LoRA para generación de imágenes realistas a partir de texto, publicado por RunningHubAI (RunningHub) a partir del trabajo del autor @可铯创意cosaer. No es un modelo de lenguaje ni un modelo de difusión completo: son pesos de ajuste fino de bajo rango que se cargan sobre tres bases distintas, Qwen-Image-2512, Z-Image-base y Flux.2 Klein 9B, y que se distribuyen en un repositorio de 0,8 GB con ficheros safetensors de entre 151 MiB y 450 MiB.

El repositorio no documenta arquitectura interna, rango de LoRA, dataset de entrenamiento ni hiperparámetros, y la propia model card se limita a indicar la función declarada por el autor: generación de retratos fotorrealistas de mujeres, con etiqueta explícita N-S-F-W en la descripción. La licencia no está especificada y se remite a la del proyecto original o a la de los modelos base, lo que supone una limitación relevante para cualquier uso comercial.

Su relevancia actual es práctica más que técnica: permite comparar y reutilizar un mismo ajuste estético sobre tres generadores de imagen de última generación desde ComfyUI o desde la nube de RunningHub. Con cero descargas y cero valoraciones en el momento de redactar esta ficha, debe considerarse un artefacto sin validación comunitaria independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelos de difusión de texto a imagen tipo transformer |
| Parametros totales | no disponible (no se publican rango, alpha ni número de matrices adaptadas) |
| Longitud de contexto | no aplica: el condicionamiento se realiza mediante prompt de texto |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin indicar precisión) |
| Idiomas soportados | no disponible (la model card usa chino e inglés, pero no se documenta cobertura) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelos base | Qwen-Image-2512, Z-Image-base, Flux.2 Klein 9B |
| Tamaño de los adaptadores | qwen2512美女.safetensors: 450 MiB; imzge美女.safetensors: 151 MiB; flux-klein美女.safetensors: 166 MiB |
| Tamaño del repositorio | 0,8 GB |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenarlo por completo. Se publican tres adaptadores independientes, uno por cada base declarada, y no son intercambiables entre sí: cada fichero safetensors está ajustado para un generador concreto. La model card no especifica el rango, el alpha, las capas objetivo ni la precisión de los pesos, por lo que no es posible reproducir el ajuste a partir de la información publicada.

Tampoco se documentan los datos de entrenamiento: no hay número de imágenes, resolución, composición del dataset, número de pasos ni uso de técnicas como regularización o ajuste con preferencias. La única indicación sobre el contenido es la cadena N-S-F-W真实感美女 (mujeres realistas N-S-F-W), lo que sitúa el ajuste en el ámbito del retrato fotorrealista con orientación explícita a contenido para adultos. La model card tampoco aclara si el entrenamiento se hizo íntegramente en la infraestructura de RunningHub, aunque incluye un enlace a su servicio de entrenamiento de modelos.

## Capacidades

- Generación de imágenes fotorrealistas de figuras femeninas a partir de prompts de texto, sobre las tres bases declaradas.
- Aplicación como adaptador de estilo o estética en flujos de trabajo de ComfyUI.
- Compatibilidad declarada con RunningHub y con Hugging Face como plataformas de carga y ejecución.
- Posibilidad de combinación con otros LoRA del mismo modelo base: una referencia externa describe el uso de un LoRA turbo junto a un LoRA de consistencia en Flux.2 Klein 9B para reducir el muestreo a cuatro pasos.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni multimodalidad: no aplican a este tipo de modelo.
- No se documentan capacidades multilingües ni cobertura de idiomas en la generación condicionada por prompt.

## Casos de uso

- Generación de retratos fotorrealistas para ilustración editorial: el adaptador se carga sobre Qwen-Image-2512, Z-Image-base o Flux.2 Klein 9B en ComfyUI y se controla la salida mediante prompt, manteniendo el estilo ajustado sin necesidad de describirlo en cada consulta.
- Comparación de bases de difusión con un mismo ajuste estético: al existir tres adaptadores equivalentes, permite evaluar cómo responde Qwen-Image-2512, Z-Image-base y Flux.2 Klein 9B al mismo tipo de contenido y decidir qué base conviene para un proyecto.
- Prototipado rápido de pipelines de imagen en ComfyUI: al ser ficheros de 151 a 450 MiB, se prueban y se sustituyen sin reentrenar ni descargar modelos completos adicionales.
- Integración en servicios gestionados vía API: la model card enlaza la API de RunningHub, de modo que el adaptador puede ejecutarse en la nube sin infraestructura propia de GPU.
- Experimentación en apilado de LoRA: combinarlo con adaptadores de velocidad o de consistencia permite estudiar interacciones entre ajustes y evaluar la degradación de calidad resultante.
- Base para ajustes derivados: partiendo de estos pesos, un equipo puede aplicar un segundo entrenamiento de bajo rango para desplazar la estética hacia un dominio concreto (producto, moda, ilustración).
- Investigación sobre sesgo y representación en generación de personas: el ajuste está orientado a un ideal estético concreto, lo que lo convierte en un caso útil para medir sesgos demográficos en modelos de difusión.
- Despliegue en producción de contenido para adultos: técnicamente viable, pero sujeto a las advertencias de licencia y cumplimiento normativo indicadas más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, evaluaciones de preferencia) ni comparativas cuantitativas. El único material comparativo localizado es un vídeo externo que contrasta los efectos de LoRA entre Flux.2 Klein, Z-Image y Qwen 2512, sin cifras verificables asociadas.

## Requisitos de hardware

- Adaptadores LoRA: 151 MiB (Z-Image), 166 MiB (Flux.2 Klein) y 450 MiB (Qwen-Image-2512) en disco; el incremento de VRAM sobre el modelo base es de unos pocos cientos de megabytes (estimación orientativa, no confirmada por el autor).
- Modelo base Flux.2 Klein 9B: el nombre indica 9.000 millones de parámetros. Estimación orientativa de VRAM para inferencia: en torno a 18-20 GB en bf16/fp16, 10-12 GB en fp8 y 6-8 GB con cuantizaciones GGUF de 4 bits.
- Modelos base Qwen-Image-2512 y Z-Image-base: tamaño de parámetros y requisitos de VRAM no disponibles en la información proporcionada.
- GPU de consumo: con el LoRA en sí no hay requisito adicional; el límite lo marca la base. Una RTX 4090 (24 GB) debería ejecutar Flux.2 Klein 9B en fp8 con holgura, y una GPU de 12-16 GB podría hacerlo con cuantización agresiva (estimación orientativa).
- GPU profesionales: A100, H100 o L40S son adecuadas para servir el modelo base en precisión completa con varias peticiones concurrentes, aunque no hay datos publicados de concurrencia.
- Opciones de despliegue: ComfyUI (documentado por el autor), RunningHub en la nube, y Hugging Face como repositorio de distribución. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que están orientados a modelos de lenguaje y no a modelos de difusión.
- Latencia y throughput: no disponibles. La referencia externa al uso conjunto con un LoRA turbo en Flux.2 Klein 9B apunta a muestreo en cuatro pasos, lo que reduciría el tiempo de generación frente a un muestreo estándar de 20-30 pasos, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

No se dispone de información sobre LoRA alternativos de la misma categoría (retrato fotorrealista) con datos comparables. La comparación posible es entre las tres bases que cubre este repositorio:

| Modelo base objetivo | Adaptador incluido | Parametros | Licencia | Requisitos de VRAM |
|---|---|---|---|---|
| Qwen-Image-2512 | qwen2512美女.safetensors (450 MiB) | no disponible | no disponible | no disponible |
| Z-Image-base | imzge美女.safetensors (151 MiB) | no disponible | no disponible | no disponible |
| Flux.2 Klein 9B | flux-klein美女.safetensors (166 MiB) | 9.000 M (según el nombre) | no disponible | 18-20 GB en bf16/fp16 (estimación) |

## Limitaciones y advertencias

- Contenido para adultos: la model card etiqueta el ajuste como N-S-F-W y lo orienta a retratos fotorrealistas de mujeres. Su despliegue en productos accesibles al público exige verificación de edad y cumplimiento de la normativa aplicable.
- Licencia no especificada: el repositorio no declara licencia y remite a la del proyecto original o a la de los modelos base. Sin confirmación explícita, no hay autorización clara para uso comercial, y la responsabilidad recae en quien despliega.
- Trazabilidad legal del contenido generado: en varios marcos jurídicos, la generación de imágenes realistas de personas identificables o verosímiles requiere consentimiento y puede exigir marcado de contenido sintético.
- Sesgo estético y demográfico: la etiqueta 真实感美女 (mujeres de belleza realista) indica un ajuste hacia un ideal concreto, con probabilidad de infrarrepresentación de otros fenotipos, edades y complexiones. No hay evaluación de sesgo publicada.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede producir anatomías incorrectas, manos deformes, textos ilegibles y detalles inconsistentes, especialmente en resoluciones altas o con prompts ambiguos.
- Acoplamiento estricto a la base: cada fichero está entrenado para un modelo base concreto. Usarlo con otra base o con la versión equivocada degrada el resultado o directamente lo invalida.
- Falta de documentación técnica: sin rango, alpha ni dataset publicados, la reproducibilidad y la depuración de fallos son limitadas.
- Sin validación comunitaria: cero descargas y cero valoraciones en el momento de redactar esta ficha; no hay evidencia independiente de calidad ni de estabilidad.
- Idiomas no documentados: se desconoce el comportamiento del ajuste con prompts en castellano u otros idiomas distintos del chino y el inglés.
- Riesgo de cadena de suministro: el repositorio distribuye pesos binarios en safetensors sin verificación de integridad publicada; conviene auditar los ficheros antes de cargarlos en entornos de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen2512-z-image-flux2-klein-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2034013854627274754
- Página del autor (@可铯创意cosaer): https://www.runninghub.cn/user-center/1866838547620896770
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Servicio de entrenamiento de modelos de RunningHub: https://www.runninghub.ai/page-model
- Comparativa externa en vídeo: Flux.2 Klein vs Z-Image vs Qwen 2512: https://www.youtube.com/watch?v=-JEi9YWnzpA
- Hilo externo sobre LoRA de consistencia para Flux.2 Klein 9B: https://www.reddit.com/r/StableDiffusion/comments/1sojzpl/flux2_klein_9b_lcs_consistency_lora_20260415/
