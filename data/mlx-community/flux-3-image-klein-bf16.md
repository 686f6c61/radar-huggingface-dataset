# mlx-community/flux-3-image-klein-bf16

## Resumen

FLUX 3 Image Klein es un modelo de generación y edición de imágenes de 5.548.681.984 parámetros (aproximadamente 5,6B) desarrollado por Black Forest Labs. El repositorio analizado, `mlx-community/flux-3-image-klein-bf16`, es una conversión a formato MLX en precisión bf16 del modelo base `black-forest-labs/flux-3-image-klein`, publicada por la comunidad MLX para su ejecución sobre Apple Silicon. Cubre en un único modelo tres tareas: text-to-image, edición de imágenes con hasta 10 imágenes de referencia y control de composición mediante cajas delimitadoras (bounding boxes).

El modelo pertenece a la familia FLUX 3 Image y es su miembro de pesos abiertos. Según Black Forest Labs, en sus evaluaciones internas queda por delante de modelos abiertos de mayor tamaño en text-to-image, generación multi-referencia y edición, y también por encima de los modelos cerrados Ideogram V4.5 y FLUX.2 [pro] incluidos en su comparativa. Con 5,6B de parámetros es el modelo abierto más pequeño de esa comparación, frente a los 7B de Qwen-Image 2.1 y los 12,9B de Krea 2.

Su relevancia práctica está en que permite generar y editar imágenes en hardware propio, sin depender de una API, algo crítico para flujos con requisitos de privacidad o de coste por imagen. Como contrapartida, el modelo exige un "prompt upsampler" previo (BFL publica `flux-3-image-klein-pup` bajo Apache-2.0, o bien cualquier LLM con el `system_prompts.json` del repositorio) que expanda la indicación del usuario a una caption de escena completa; la documentación es explícita al señalar que no debe usarse sin él.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para imagen (familia FLUX 3); detalles internos de bloques no disponibles en la información proporcionada |
| Parámetros totales | 5.548.681.984 (≈5,6B), dato de safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de contexto de texto; no se especifica longitud máxima de prompt ni resolución nativa en la información disponible |
| Tipos de cuantización | Repositorio en bf16; no se documentan variantes cuantizadas (8-bit, 4-bit) en la información disponible |
| Idiomas soportados | Inglés (`en`); el prompt y la caption deben redactarse en inglés |
| Licencia | `flux-kommunity-license` (marcada como `license:other` en HuggingFace); el prompt upsampler `flux-3-image-klein-pup` es Apache-2.0 |
| Formato de pesos | safetensors, formato MLX (`library: mlx`, `diffusers`); tamaño del repositorio 20,6 GB |
| Tareas soportadas | Text-to-image, image-to-image / edición, generación multi-referencia (hasta 10 imágenes), control de layout por bounding boxes |
| Acceso | Restringido (gated): requiere aceptar las condiciones en HuggingFace |
| Fecha de publicación | 18 de octubre de 2026 (creación y última actualización del repositorio) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su naturaleza de modelo de difusión para imagen de la familia FLUX 3, con pesos distribuidos en safetensors y convertidos a MLX. El dato firme es el recuento de parámetros (5.548.681.984) y el tamaño del repositorio (20,6 GB), coherente con un transformer de difusión en bf16 más los componentes auxiliares del pipeline (codificador de texto y VAE). No se especifican en la documentación consultada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF/DPO o ajuste por preferencias.

La innovación funcional destacable no está en el mecanismo de atención sino en la unificación de tareas: un solo modelo resuelve generación desde texto, edición con hasta 10 referencias y control geométrico por bounding boxes. Un requisito de diseño explícito es el prompt upsampling: el modelo espera una caption de escena completa que describa medio, escena, iluminación y, para cada sujeto, colores, materiales y posición. BFL distribuye un upsampler específico (`flux-3-image-klein-pup`) y alternativamente permite usar cualquier LLM con las instrucciones de sistema incluidas en el repositorio. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con caption detallada de escena.
- Edición de imágenes existentes (image-to-image) manteniendo la identidad del contenido original.
- Generación multi-referencia con hasta 10 imágenes de referencia en una misma petición.
- Control de composición mediante bounding boxes para posicionar sujetos en el encuadre.
- Flujo integrado: las tres capacidades (T2I, edición, multi-referencia) se resuelven con el mismo modelo, sin pipelines separados.
- Integración con prompt upsampler externo: `flux-3-image-klein-pup` (Apache-2.0) o un LLM genérico configurado con `system_prompts.json`.
- Ejecución local en Apple Silicon mediante MLX, sin llamadas a API externas.
- Soporte de ajuste fino: el repositorio está etiquetado como `base_model:finetune`, lo que permite derivar variantes.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, audio ni generación de texto: es un modelo exclusivamente de imagen.

## Casos de uso

- Estudio de diseño gráfico en local: el equipo genera variaciones de una ilustración desde una caption larga producida por el upsampler, ejecutando todo en un Mac con Apple Silicon y sin enviar material del cliente a servicios externos.
- Catálogo de producto con multi-referencia: se alimentan hasta 10 imágenes de referencia del mismo artículo para mantener consistencia de materiales y colores entre tomas, algo útil en e-commerce con cientos de SKU.
- Maquetación publicitaria con control de layout: las bounding boxes permiten fijar la posición de cada sujeto en el encuadre, de modo que el resultado respete el hueco reservado para el texto y el logotipo en una pieza concreta.
- Edición fotográfica de post-producción: partiendo de una fotografía base, el modelo aplica cambios de iluminación, materiales o vestuario descritos en la caption sin rehacer la escena completa.
- Prototipado de assets para videojuegos o interfaces: generación rápida de concepts de personajes y entornos con variaciones controladas de composición antes de pasar al modelado 3D.
- Investigación en generación de imágenes: al ser pesos abiertos y con etiqueta de finetune, sirve como base para experimentos de ajuste fino, ablaciones de prompt upsampling o evaluación de control por bounding boxes.
- Flujos con requisito de confidencialidad: sectores con datos sensibles (salud, legal, defensa) que no pueden usar APIs cerradas encuentran aquí una alternativa ejecutable en hardware propio, aceptando las condiciones de la licencia comunitaria.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (FID, CLIP score, GenEval, T2I-CompBench u otros) en la información disponible. Black Forest Labs solo comunica una clasificación cualitativa de sus evaluaciones internas, sin métricas asociadas:

| Comparativa (evaluación interna de BFL) | Posición declarada | Parámetros |
|---|---|---|
| FLUX 3 Image Klein | Primero en text-to-image, multi-referencia y edición | 5,6B |
| Qwen-Image 2.1 | Por detrás según BFL | 7B |
| Krea 2 | Por detrás según BFL | 12,9B |
| Ideogram V4.5 (cerrado) | Por debajo según BFL | no disponible |
| FLUX.2 [pro] (cerrado) | Por debajo según BFL | no disponible |

Estos datos provienen del blog del desarrollador y no son verificables de forma independiente ni incluyen cifras. No se dispone de resultados de la conversión MLX frente al modelo original en bf16, ni de comparaciones de latencia o fidelidad.

## Requisitos de hardware

- Huella de pesos: 5,6B de parámetros en bf16 equivalen a unos 11,1 GB solo del transformer; el repositorio completo ocupa 20,6 GB, lo que incluye los componentes auxiliares del pipeline (codificador de texto y VAE).
- Memoria unificada recomendada en Apple Silicon: 32 GB o más para ejecutar el pipeline bf16 con margen para activaciones y resolución de salida; 24 GB es ajustado y puede requerir resolución o lote reducidos.
- Estimación orientativa por cuantización (calculada a partir del recuento de parámetros, no publicada por el autor): 8-bit en torno a 6 GB de pesos y 4-bit en torno a 3 GB, más los componentes auxiliares; no se documentan variantes cuantizadas de este repositorio en la información disponible.
- GPU: al ser un repositorio MLX, está orientado a Apple Silicon (series M). Para CUDA hay que acudir al repositorio de referencia de BFL (`black-forest-labs/flux-3-image-klein`), cuyos requisitos de VRAM no se detallan en la información disponible.
- Despliegue: `mlx` con el backend de difusión de MLX (`diffusers`); no aplican vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen ni resoluciones de referencia.
- Dependencia adicional: el prompt upsampler debe ejecutarse antes del modelo, con el coste de inferencia que añada el LLM elegido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / referencias | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein (este) | 5,6B | Hasta 10 imágenes de referencia; bounding boxes | T2I, edición, multi-referencia | flux-kommunity-license (acceso gated) | Pesos abiertos, conversión MLX en bf16 |
| Qwen-Image 2.1 | 7B | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| Krea 2 | 12,9B | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| FLUX.2 [pro] | No disponible | No disponible | No disponible | Propietaria (modelo cerrado) | Solo API |
| Ideogram V4.5 | No disponible | No disponible | No disponible | Propietaria (modelo cerrado) | Solo API |

La comparación cuantitativa no es posible con los datos disponibles: solo se conocen los recuentos de parámetros de Qwen-Image 2.1 y Krea 2 y la afirmación de BFL de que FLUX 3 Image Klein queda por delante en sus evaluaciones internas pese a ser el más pequeño del grupo. No hay métricas públicas que permitan contrastar esa afirmación.

## Limitaciones y advertencias

- Licencia `flux-kommunity-license`: no es una licencia de código abierto estándar. Hay que revisar los términos antes de cualquier uso comercial; el modelo figura como `license:other` y el acceso está restringido tras aceptar condiciones en HuggingFace.
- Dependencia obligatoria del prompt upsampler: la documentación indica explícitamente que el modelo no debe usarse sin él. Omitirlo degrada la calidad porque el modelo espera una caption completa con medio, escena, iluminación y atributos por sujeto.
- Idioma: solo inglés. Prompts en castellano requieren traducción previa o un upsampler que traduzca y expanda a la vez.
- Sin benchmarks numéricos públicos: las afirmaciones de superioridad provienen del propio desarrollador y no se han verificado de forma independiente.
- Sesgos: no se documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos, culturales o de representación. Es esperable que herede los del corpus original.
- Alucinación visual: como todo modelo generativo, puede producir artefactos anatómicos, texto ilegible en la imagen, materiales inconsistentes o incumplir el layout solicitado, especialmente con muchas referencias simultáneas.
- Validación comunitaria mínima: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y se publicó el mismo día de su creación; no hay informes de terceros sobre su comportamiento.
- Rendimiento en MLX no caracterizado: no hay datos de fidelidad o velocidad de la conversión frente al modelo original en PyTorch.
- Plataforma: este repositorio concreto solo es utilizable en Apple Silicon; en CUDA u otras GPU hay que usar el repositorio de referencia de BFL.
- No apto para tareas de texto: no genera lenguaje, no razona, no soporta tool calling ni agentes. Cualquier flujo que necesite esas capacidades requiere un LLM adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/flux-3-image-klein-bf16
- Modelo base en HuggingFace: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Código de inferencia de referencia (GitHub): https://github.com/black-forest-labs/flux-3-image-klein
- Página del modelo en Black Forest Labs: https://bfl.ai/models/flux-3-image-klein
- Blog de anuncio: https://bfl.ai/blog/flux-3-image-klein
- Perfil de la organización MLX Community: https://huggingface.co/mlx-community
