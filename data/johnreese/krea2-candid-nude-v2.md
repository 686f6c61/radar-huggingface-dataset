# JohnReese/Krea2-Candid-Nude-v2

## Resumen

Krea2-Candid-Nude-v2 es un checkpoint de generacion texto-a-imagen derivado de krea/Krea-2-Turbo, publicado por el usuario JohnReese en Hugging Face. Se trata de un ajuste fino orientado a fotografia amateur realista, con enfasis en cuerpos naturales, textura de piel verosimil e iluminacion realista, y que cubre tanto contenido SFW como NSFW. El modelo mantiene la arquitectura y el pipeline del modelo base (text-to-image, 12.820.073.036 parametros segun los pesos safetensors) y se distribuye en cuatro formatos de precision para adaptarse a distintos presupuestos de VRAM.

La relevancia de esta ficha es doble. Por un lado, documenta un caso tipico de la comunidad: un fine-tune de un modelo turbo de difusion (8 pasos, CFG 1) que hereda la licencia del modelo base y se empaqueta en bf16, fp8 y GGUF para ComfyUI. Por otro, permite evaluar con rigor las implicaciones tecnicas y legales de reutilizar un checkpoint con licencia comunitaria para fines de generacion de imagenes de personas.

El modelo no aporta innovaciones arquitectonicas propias: es un derivado del checkpoint Krea-2-Turbo, con un text encoder Qwen3-VL-4B y el VAE de Qwen Image. Su interes practico reside en el ajuste de estilo (piel, anatomia, luz) y en la disponibilidad de cuantizaciones ligeras que permiten ejecutarlo en GPUs de consumo medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (derivado de Krea-2-Turbo); detalles internos no disponibles |
| Parametros totales | 12.820.073.036 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a difusion; condicionado por el text encoder Qwen3-VL-4B) |
| Tipos de cuantizacion | bf16 (~25 GB), fp8 (~13 GB), GGUF Q8_0 (~13 GB), GGUF Q4_0 (~7 GB) |
| Idiomas soportados | no disponible (prompts en lenguaje natural via Qwen3-VL-4B) |
| Licencia | Krea 2 Community License Agreement (license: other) |
| Formato de pesos | safetensors (bf16, fp8) y GGUF (Q8_0, Q4_0) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint krea/Krea-2-Turbo, un modelo de difusion texto-a-imagen de tipo turbo que opera con 8 pasos de muestreo, CFG 1, sampler euler y scheduler simple. La inferencia se realiza en ComfyUI mediante el nodo Load Diffusion Model para los pesos safetensors, o mediante el nodo Unet Loader (GGUF) del fork molbal/ComfyUI-GGUF para las versiones cuantizadas, ya que el ComfyUI-GGUF original de city96 no carga Krea 2. El pipeline requiere un text encoder Qwen3-VL-4B (tipo krea2) y el VAE qwen_image_vae.safetensors.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni de tecnicas de decodificacion especulativa o atencion lineal. La model card unicamente indica que la version v2 mejora la textura de piel, la iluminacion y la anatomia respecto a v1, y recomienda prompts naturales de detalle medio (80-140 palabras) terminados con una coletilla fija de realismo de piel. No se documentan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de prompts de texto en lenguaje natural.
- Enfasis en fotografia amateur: cuerpos naturales, piel con poros e imperfecciones, iluminacion realista.
- Cobertura de contenido SFW y NSFW (etiquetado not-for-all-audiences).
- Resoluciones soportadas: 1024x1536 (retrato), 1536x1024 (paisaje) y 1024x1024 (cuadrada).
- Inferencia rapida en 8 pasos con CFG 1 (sin negative prompt efectivo).
- Compatibilidad con ComfyUI y con el ecosistema GGUF mediante el fork molbal/ComfyUI-GGUF.
- No se documenta soporte de tool calling, agentes, vision de entrada, audio ni modo thinking; es un modelo puramente generativo de imagen.

## Casos de uso

- Prototipado de retratos fotorrealistas en estudio: el modelo genera retratos de 1024x1536 con piel y luz naturalistas en 8 pasos, adecuado para iterar rapidamente sobre conceptos de personaje antes de pasar a produccion con modelos de mayor coste.
- Generacion de imagenes de referencia para ilustracion y storyboard: la ventana de resolucion 1536x1024 permite composiciones horizontales para bocetos de escena con figuras humanas de anatomia creible.
- Pruebas de concepto de fotografia amateur simulada: util para maquetas de proyectos editoriales que requieran estetica de foto casual, con la coletilla de piel recomendada por el autor.
- Experimentacion en investigacion sobre sesgos y realismo en difusion: al ser un fine-tune de un turbo de 12.800 millones de parametros, sirve para estudiar como el ajuste fino altera la representacion de cuerpos y piel respecto al base.
- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes Q4_0 (~7 GB) y fp8 (~13 GB) permiten ejecutar el modelo en GPUs de 8-12 GB y 16-24 GB respectivamente dentro de ComfyUI.
- Evaluacion de pipelines de cuantizacion GGUF para difusion: comparar Q8_0, Q4_0, fp8 y bf16 sobre el mismo checkpoint permite medir la perdida de calidad en texturas de piel, un caso exigente para la cuantizacion.
- Generacion de contenido para adultos con fines creativos en entornos controlados: siempre que se cumplan la legislacion aplicable, la licencia y las politicas de la plataforma, y limitado a personas ficticias adultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~25 GB en bf16, ~13 GB en fp8 y Q8_0, ~7 GB en Q4_0 (segun los tamanos de fichero indicados por el autor).
- GPU recomendadas: el autor indica 24-32 GB+ de VRAM para bf16, 16-24 GB para fp8 y 8-12 GB para Q4_0. Encajan A100 40/80 GB, H100, RTX 4090 (24 GB) para fp8, y RTX 4080/4070 Ti o similares de 12-16 GB para Q4_0.
- Cabe en GPU de consumo: si, en RTX 4090 con fp8 y en GPUs de 8-12 GB con Q4_0.
- Opciones de despliegue: ComfyUI con Load Diffusion Model (safetensors) o Unet Loader (GGUF) del fork molbal/ComfyUI-GGUF. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el modelo base es turbo (8 pasos, CFG 1), lo que reduce el coste frente a modelos de 20-50 pasos, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Krea2-Candid-Nude-v2 | 12.820.073.036 | 1024x1536, 1536x1024, 1024x1024 | Krea 2 Community License | Hugging Face, ComfyUI, GGUF |
| krea/Krea-2-Turbo (base) | no disponible en la informacion | no disponible | Krea 2 Community License | Hugging Face |
| Alternativas de difusion texto-a-imagen de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como not-for-all-audiences y genera NSFW; requiere control de acceso y moderacion en cualquier despliegue publico.
- Riesgo legal y etico: prohibido generar contenido de personas reales sin consentimiento, de menores o cualquier material ilegal. El autor declara que las imagenes de ejemplo son de adultos ficticios.
- Licencia: se distribuye bajo la Krea 2 Community License Agreement, heredada del modelo base; es imprescindible revisar los terminos antes de cualquier uso comercial, ya que la licencia es de tipo "other" y no equivale a una licencia permisiva.
- Sesgos: no documentados, pero al ser un fine-tune centrado en un tipo de piel concreto (la coletilla recomendada menciona "fair skin tone") puede reproducir sesgos de representacion corporal y tonalidad.
- Alucinacion visual: como todo modelo de difusion, puede producir anatomia incorrecta, manos deformes o artefactos, especialmente en cuantizaciones agresivas como Q4_0.
- Limitaciones de prompt: con CFG 1 el negative prompt se ignora, por lo que todo debe describirse en el prompt positivo; el autor recomienda 80-140 palabras de detalle medio.
- Compatibilidad: las versiones GGUF solo cargan con el fork molbal/ComfyUI-GGUF; el ComfyUI-GGUF original de city96 no soporta Krea 2.
- Idiomas: no se documenta soporte multilingue explicito; la calidad depende del text encoder Qwen3-VL-4B.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JohnReese/Krea2-Candid-Nude-v2
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Fork ComfyUI-GGUF con soporte Krea 2: https://github.com/molbal/ComfyUI-GGUF
