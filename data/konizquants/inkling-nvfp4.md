# konizquants/Inkling-NVFP4

## Resumen

Inkling-NVFP4 es una versión cuantizada a NVFP4 del modelo multimodal Inkling, desarrollado por Thinking Machines. Se trata de un transformer autoregresivo decoder-only de propósito general que acepta entradas de texto, imagen y audio y genera texto. Su arquitectura combina un backbone MoE (Mixture-of-Experts) disperso con atención híbrida local/global y codificadores nativos para imagen, vídeo y audio, lo que lo sitúa en la categoría de modelos frontera de pesos abiertos. El repositorio concreto que analizamos aquí lo publica el usuario `konizquants` como cuantizacion del modelo base `thinkingmachines/Inkling`, pensada para reducir el coste de memoria del despliegue.

El modelo base declara 975 000 millones de parámetros totales con 41 000 millones activos por token, repartidos en 66 capas con enrutado a 6 de 256 expertos más 2 expertos compartidos. La cuantizacion NVFP4 (formato de coma flotante de 4 bits con escalas FP8 por bloques, nativo de la arquitectura NVIDIA Blackwell) reduce aproximadamente a la mitad el peso en disco frente a BF16, aunque el repositorio sigue ocupando 592 GB, lo que obliga a despliegues en múltiples GPU de gama alta. La licencia es Apache 2.0.

La relevancia actual reside en que permite ejecutar un modelo de clase frontera en hardware Blackwell con aceleración FP4 nativa, con recetas oficiales para vLLM, SGLang, TokenSpeed, Unsloth y transformers, además de acceso vía API en el playground de Thinking Machines.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y atención híbrida local/global; multimodal (texto, imagen, vídeo, audio) |
| Parametros totales | 975B según la model card; 552 845 034 562 (~552,8B) según safetensors del repo (discrepancia no aclarada) |
| Parametros activos | 41B por token (6 de 256 expertos + 2 expertos compartidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, escalas FP8 por bloques); etiqueta de HuggingFace "8-bit"; el modelo base también existe en BF16 |
| Idiomas soportados | Inglés (principal) con capacidades multilingües generales; metadatos de HuggingFace: no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La model card describe un transformer decoder-only de 66 capas con un backbone feed-forward de tipo Mixture-of-Experts disperso: cada token se enruta a 6 de 256 expertos, además de 2 expertos compartidos que se activan en todos los tokens. La atención es híbrida, combinando capas locales y globales. El modelo es multimodal de forma nativa: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido que procesa el decoder de manera conjunta. Soporta numéricamente BF16 y NVFP4.

Respecto al entrenamiento, la información disponible indica que los datos provienen de fuentes públicas (internet y repositorios accesibles), de terceros y de generación o aumento sintético, e incluyen texto, imágenes, audio y vídeo. El proceso de curación aplica limpieza, procesado y modificaciones variables por tipo de dato, con deduplicación y filtrado para eliminar contenido de baja calidad o avanzar objetivos de seguridad. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF, DPO u otro alineamiento, por lo que estos datos quedan como no disponibles. La cuantizacion NVFP4 es una conversión post-entrenamiento del modelo base, no un reentrenamiento.

## Capacidades

- Generación de texto e instrucciones de propósito general en inglés y otros idiomas.
- Razonamiento avanzado y matemáticas: AIME 2026 al 97,1 % y GPQA Diamond al 87,2 % según la model card.
- Codificación agéntica: SWEBench Verified al 77,6 % y SWEBench Pro (Public) al 54,3 %.
- Uso de herramientas (tool calling): HLE con herramientas al 46,0 %, lo que indica razonamiento con herramientas externas.
- Capacidades agénticas y de razonamiento multi-paso para sistemas de agentes.
- Entrada de imagen en cualquier formato de píxeles (idealmente entre 40 y 4096 px por dimensión) y de vídeo mediante codificador de parches.
- Entrada de audio en WAV a 16 kHz (idealmente menos de 20 minutos).
- Multilingüe general, con inglés como idioma principal.
- Salida exclusivamente en texto codificado en UTF-8.

## Casos de uso

- Agentes de ingeniería de software: integrado en un pipeline que resuelve issues leyendo el repositorio, ejecutando tests y proponiendo parches; su 77,6 % en SWEBench Verified lo hace apto para tareas de reparación de código con tool calling sobre terminal y navegador.
- Asistentes de código en producción: puede integrarse detrás de vLLM o SGLang para autocompletado y revisión de PRs, con enrutado MoE de 41B activos que reduce el coste por token frente a un denso de tamaño similar.
- RAG multimodal: indexación y consulta sobre documentos que mezclan texto, capturas e imágenes escaneadas, aprovechando el codificador de parches para responder preguntas fundamentadas sobre el contenido visual.
- Análisis de reuniones y audio: transcripción y resumen de grabaciones WAV de hasta unos 20 minutos, combinando la entrada de audio con razonamiento sobre el contenido para generar actas estructuradas.
- Atención al cliente automatizada: conversaciones multi-turno con contexto largo, integrándose vía API en sistemas existentes y usando tool calling para consultar bases de datos o CRM.
- Automatización de backoffice: extracción estructurada de información de facturas, formularios o documentos escaneados, con salida en texto UTF-8 lista para insertar en sistemas downstream.
- Investigación y fine-tuning: al liberarse pesos abiertos bajo Apache 2.0 y ofrecer recetas en Tinker Cookbook y Unsloth, el modelo sirve como base para ajuste fino en dominios verticales (legal, médico, financiero).
- Laboratorio de evaluación de agentes: uso como sujeto de pruebas en benchmarks de razonamiento multi-paso y uso de herramientas, dada su capacidad de generar trazas largas con HLE con herramientas al 46,0 %.

## Benchmarks y rendimiento

Resultados reportados en la model card a `effort=0.99`; las puntuaciones de comparación se generaron el 14 de julio de 2026. La tabla original está truncada en la información disponible (faltan los valores de SWEBench Pro de varios modelos), por lo que se marcan como no disponibles.

| Modelo | HLE (texto) | HLE (con herramientas) | AIME 2026 | GPQA Diamond | SWEBench Verified | SWEBench Pro (Public) |
|---|---|---|---|---|---|---|
| Inkling | 29,7 % | 46,0 % | 97,1 % | 87,2 % | 77,6 % | 54,3 % |
| Nemotron 3 Ultra | 26,6 % | 37,4 % | 94,2 % | 86,7 % | 70,7 % | 46,4 % |
| Kimi K2.5 | 29,4 % | 50,2 % | 95,8 % | 87,9 % | 76,8 % | 50,7 % |
| Kimi K2.6 | 35,9 % | 54,0 % | 96,4 % | 91,1 % | 80,2 % | 58,6 % |
| GLM 5.2 | 40,1 % | 54,7 % | 99,2 % | 89,5 % | – | 62,1 % |
| DeepSeek V4 Pro | 35,9 % | 48,2 % | 96,7 % | 88,8 % | 80,6 % | no disponible |
| Gemini 3.1 Pro (high) | 44,7 % | 51,4 % | 98,3 % | 94,1 % | 80,6 % | no disponible |
| Claude Fable 5 (max) | 53,3 % | 64,5 % | – | 92,6 % | 95,0 % | no disponible |
| GPT 5.6 Sol (xhigh) | 47,2 % | 55,0 % | 99,9 % | 94,1 % | – | no disponible |

No se dispone de benchmarks específicos de la versión cuantizada NVFP4; las cifras anteriores corresponden al modelo base. Los impactos de la cuantizacion sobre la precisión no se han publicado en la información disponible.

## Requisitos de hardware

- Peso en disco del repositorio: 592 GB en NVFP4. El peso de los parámetros en VRAM es del orden de varios cientos de GB, muy por encima de cualquier GPU individual.
- Aceleración nativa NVFP4: requiere hardware NVIDIA Blackwell (B100, B200, GB200, RTX PRO 6000 Blackwell y equivalentes SM100/SM120). En arquitecturas Hopper o Ampere el formato no se acelera de forma nativa.
- Configuración mínima razonable (estimación): 4 × B200 de 192 GB (768 GB) para alojar pesos con poco margen para caché KV.
- Configuración recomendada (estimación): 8 × B200 o nodo GB200 para disponer de margen suficiente de caché KV en contexto largo y multimodal.
- Despliegue en Hopper/Ampere: requeriría de-cuantizar a BF16 (~1,95 TB para 975B parámetros), lo que implicaría del orden de 24-32 × H100 de 80 GB; en la práctica no es viable.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni una RTX 5090 (32 GB) pueden alojar el modelo completo; tampoco es viable en equipos de 4 GPUs de consumo.
- Opciones de despliegue soportadas según la model card: SGLang, vLLM, TokenSpeed, Unsloth y transformers de HuggingFace, además de proveedores de inferencia de terceros vía API.
- Latencia y throughput: no disponibles. No se han publicado cifras de tokens por segundo ni de latencia para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parámetros (total / activo) | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-NVFP4 (konizquants) | 975B / 41B (según card); 552,8B (safetensors) | no disponible | Apache 2.0 | Pesos abiertos en HF | Cuantizacion NVFP4 de Inkling; 592 GB |
| Inkling (BF16, thinkingmachines) | 975B / 41B | no disponible | Apache 2.0 | Pesos abiertos en HF | Modelo base sin cuantizar |
| Kimi K2.6 | no disponible | no disponible | no disponible | Pesos abiertos | 80,2 % en SWEBench Verified, 35,9 % en HLE texto |
| DeepSeek V4 Pro | no disponible | no disponible | no disponible | Pesos abiertos | 80,6 % en SWEBench Verified, 35,9 % en HLE texto |
| GLM 5.2 | no disponible | no disponible | no disponible | Pesos abiertos | 40,1 % en HLE texto, 62,1 % en SWEBench Pro |

En comparación directa, las puntuaciones reportadas sitúan a Inkling por debajo de Kimi K2.6, GLM 5.2, Gemini 3.1 Pro y Claude Fable 5 en razonamiento (HLE), mientras que en codificación agéntica queda al nivel de Kimi K2.5 y DeepSeek V4 Pro. No se dispone de la ficha completa de parámetros y contexto de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo; al entrenarse con datos de internet, es esperable la presencia de sesgos sociales y culturales no cuantificados aquí.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento abierto y RAG con documentos visuales.
- Longitud de contexto no especificada, lo que dificulta dimensionar la caché KV y planificar despliegues con conversaciones largas.
- Fiabilidad multilingüe desigual: el inglés es el idioma principal y las capacidades en otros idiomas son generales, sin evaluación publicada por idioma.
- La model card no detalla número de tokens, composición del dataset ni fases de alineamiento (RLHF, DPO), lo que limita la reproducibilidad y la evaluación de riesgos.
- No hay cifras de degradación por cuantizacion NVFP4; en tareas sensibles a la precisión numérica podría haber pérdidas respecto al base BF16.
- Existe una discrepancia entre los 975B parámetros declarados en la model card y los 552,8B de los safetensors del repo cuantizado; conviene verificar antes de planificar hardware.
- Aunque la licencia es Apache 2.0, el modelo base remite a una Acceptable Use Policy de Thinking Machines que conviene revisar antes de uso comercial.
- El repositorio registra 0 descargas y 0 likes, y no está validado por una comunidad amplia; el autor de la cuantizacion no es el desarrollador original del modelo.
- Requiere hardware Blackwell para aprovechar NVFP4; sin él, el coste de memoria obliga a de-cuantizar y multiplica los requisitos.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/konizquants/Inkling-NVFP4
- Modelo base BF16: https://huggingface.co/thinkingmachines/Inkling
- Modelo base NVFP4 oficial: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (repositorio): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentación de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo (los resultados correspondían a páginas de descarga de navegadores), por lo que todos los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
