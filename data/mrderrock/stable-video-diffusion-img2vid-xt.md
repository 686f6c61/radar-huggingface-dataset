# mrderrock/stable-video-diffusion-img2vid-xt

## Resumen

Stable Video Diffusion (SVD) Image-to-Video XT es un modelo generativo de difusión latente que recibe una imagen fija como fotograma de condicionamiento y produce un clip corto de vídeo a partir de ella. Lo desarrolla Stability AI y esta ficha corresponde a la copia publicada por el usuario `mrderrock` en Hugging Face, un re-upload del checkpoint oficial `stabilityai/stable-video-diffusion-img2vid-xt` con 9 descargas y 0 likes en el momento de la consulta. El checkpoint contiene 1.524.623.082 parámetros (~1,52 mil millones) en formato safetensors y el repositorio ocupa 32,6 GB.

La variante XT se ajustó por fine-tuning desde la versión de 14 fotogramas para generar 25 fotogramas a resolución 576x1024, manteniendo el mismo tamaño que la imagen de entrada. No acepta prompts de texto: toda la generación está condicionada únicamente por la imagen, lo que simplifica el pipeline pero elimina el control semántico por lenguaje natural.

Su relevancia actual es doble: por un lado, es uno de los pocos modelos abiertos de image-to-video con licencia de comunidad que permite investigación y uso comercial bajo condiciones; por otro, sirve como referencia técnica para arquitecturas de difusión de vídeo con decoder temporal. La contrapartida es que los clips son de 4 segundos o menos, sin fotorrealismo perfecto y con un coste de inferencia alto (~180 s por clip en una A100 80GB con los ajustes por defecto de la release).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente para vídeo (image-to-video); decoder f8 tipo AutoencoderKL ajustado para consistencia temporal |
| Parametros totales | 1.524.623.082 (~1,52 B), dato leído del safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 25 fotogramas por clip (variante XT), condicionados por 1 imagen de 576x1024; sin ventana de texto |
| Tipos de cuantizacion | No disponible en la información proporcionada; el repo distribuye safetensors (fp32/fp16). No se documentan variantes GGUF ni cuantizaciones oficiales de 4/8 bits |
| Idiomas soportados | No aplica: el modelo no recibe entrada de texto ni genera texto. La model card no declara idiomas |
| Licencia | Stable Video Diffusion Community License (`license: other`, `license_name: stable-video-diffusion-community`) |
| Formato de pesos | safetensors (librería diffusers, `StableVideoDiffusionPipeline`) |

## Arquitectura y entrenamiento

SVD-XT es un modelo de difusión latente aplicado a vídeo: la imagen de condicionamiento y los fotogramas se codifican en un espacio latente y el proceso de denoising genera la secuencia temporal. La model card indica explícitamente que se parte de SVD Image-to-Video de 14 fotogramas mediante fine-tuning, y que además se ajusta el decoder f8 ampliamente utilizado para mejorar la consistencia temporal. Se ofrece también, por comodidad, un decoder estándar fotograma a fotograma (`svd_xt_image_decoder.safetensors`). La model card no detalla el número de capas, el tipo de bloque de atención ni la composición exacta del dataset.

En cuanto a entrenamiento, Stability AI declara unas 200.000 horas de A100 80GB en total, con la mayor parte del cómputo en 48 nodos de 8 A100, un consumo de ~64.000 kWh y ~19.000 kg de CO2 equivalente. Sobre los datos, la card afirma que todas las fuentes potenciales consideradas se incluyeron en el entrenamiento final sin conjunto de retención, aplicando los filtros de calidad descritos en el paper y filtros NSFW internos; no se realizó trabajo humano explícito en la preparación de datos, pero sí evaluación humana de calidad mediante plataformas de terceros (Amazon SageMaker, Amazon Mechanical Turk y Prolific), con trabajadores angloparlantes pagados a 12 USD/hora. No se documenta en la información disponible si hubo RLHF o DPO (no aplica habitualmente a modelos de difusión).

## Capacidades

- Generación de vídeo a partir de una única imagen: 25 fotogramas a 576x1024 en la variante XT.
- Coherencia temporal: el decoder f8 ajustado y las capas temporales buscan mantener la identidad visual entre fotogramas.
- Extensión aparente de una imagen fija: anima paisajes, objetos, ilustraciones o fotografías con movimiento plausible (paneos, movimientos suaves de cámara, cambios de iluminación).
- Salida apta para postproducción: los clips pueden alargarse, interpolarse o encadenarse con herramientas externas de edición.
- Sin condicionamiento textual: no acepta prompts, por lo que no hay control por lenguaje natural ni negative prompts nativos.
- Sin tool calling, function calling ni capacidades de agente: es un modelo generativo de vídeo, no un LLM.
- Sin capacidades multilingües, de visión comprensiva, audio ni modo "thinking".
- Integración con el ecosistema diffusers mediante `StableVideoDiffusionPipeline`, lo que permite combinarlo con el resto de utilidades de la librería (offloading, precisión fp16, schedulers).

## Casos de uso

- Animación de ilustraciones y arte conceptual: a partir de un keyframe dibujado o renderizado, el modelo genera un clip corto que da sensación de movimiento para pitches, storyboards o portfolios, evitando el coste de una animación manual preliminar.
- Previsualización en pipelines de VFX y publicidad: generar un animatic de 4 segundos desde el frame de diseño permite validar cámara, iluminación y composición antes de producir el plano definitivo.
- Creación de contenido para redes sociales: clips cortos en formato vertical u horizontal (con reencuadre posterior desde 576x1024) para publicaciones que requieren movimiento sin rodaje.
- Prototipado de producto y e-commerce: animar la foto de un producto para mostrar un ligero paneo o cambio de luz en una ficha o anuncio, sin sesión fotográfica adicional.
- Investigación en generación de vídeo: el checkpoint sirve como baseline reproducible para estudiar consistencia temporal, artefactos del autoencoder o métodos de control adicional (por ejemplo, condicionamiento extra sobre el modelo congelado).
- Docencia y divulgación: demostrar en un curso de modelos generativos el funcionamiento de la difusión latente aplicada a vídeo, comparando la variante de 14 y 25 fotogramas y el efecto del decoder temporal.
- Restauración creativa de material histórico: animar fotografías antiguas o ilustraciones de archivo para piezas museísticas o documentales, siempre que la licencia y los derechos de la imagen de entrada lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas con MMLU, HumanEval, GSM8K ni métricas de vídeo tipo FVD o CLIP score; esos benchmarks, además, no son aplicables a un modelo de difusión de vídeo. Lo único que se aporta es un estudio de preferencia humana frente a GEN-2 (Runway) y PikaLabs, en el que SVD Image-to-Video resulta preferido por los votantes en términos de calidad de vídeo, sin cifras concretas en la información disponible.

| Referencia | Tipo de evaluación | Resultado |
|---|---|---|
| Estudio de preferencia humana (SVD vs GEN-2 vs PikaLabs) | Preferencia de calidad de vídeo | SVD preferido por los votantes; sin porcentajes en la información disponible |
| Métricas automáticas (FVD, CLIP, etc.) | No publicadas | No disponible |
| Benchmarks de lenguaje/código (MMLU, HumanEval, GSM8K) | No aplicables | No disponible |

## Requisitos de hardware

- Pesos: 1.524.623.082 parámetros, aproximadamente 3,0 GB en fp16 y 6,1 GB en fp32 solo para los pesos.
- VRAM de inferencia: no hay cifra oficial publicada. El pico real lo dominan las activaciones del U-Net y del decoder al procesar 25 fotogramas a 576x1024, muy por encima del tamaño de los pesos; Stability AI menciona optimizaciones para intercambiar calidad, memoria y velocidad, pero sin números. En la práctica se recomienda GPU con 24 GB o más para la configuración por defecto.
- GPU de referencia: la model card reporta ~180 s por clip en una A100 80GB para SVD-XT (~100 s para SVD de 14 fotogramas). Eso equivale, de forma derivada, a unos 7,2 s por fotograma y unas 0,14 clips por minuto en ese hardware.
- GPU consumer: no hay datos publicados de ejecución en RTX 4090, 4080 o similares; dado el tamaño de pesos, caben en VRAM de 16-24 GB, pero el tiempo por clip será notablemente superior al de una A100 y requerirá reducción de resolución, de fotogramas o de pasos de muestreo.
- Despliegue: `diffusers` con `StableVideoDiffusionPipeline` (soporta fp16, offloading secuencial y por modelo), y el repositorio `Stability-AI/generative-models` para entrenamiento e inferencia de referencia. No aplica llama.cpp/Ollama/GGUF por tratarse de un modelo de difusión.
- Throughput y latencia: solo documentados para A100 80GB con los ajustes por defecto de la release; no hay cifras para otras GPU en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Longitud / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| SVD-XT (este repo, mirror de `stabilityai/stable-video-diffusion-img2vid-xt`) | ~1,52 B | 25 fotogramas, 576x1024 | Stable Video Diffusion Community | Pesos abiertos en HF, vía diffusers |
| SVD Image-to-Video (14 fotogramas) | No disponible en la información | 14 fotogramas, 576x1024 | Stable Video Diffusion Community | Pesos abiertos en HF |
| Runway GEN-2 | No disponible (cerrado) | No disponible | Propietaria, acceso comercial | Solo API/servicio |
| PikaLabs | No disponible (cerrado) | No disponible | Propietaria, acceso comercial | Solo servicio |

Frente a las alternativas cerradas, SVD-XT ofrece pesos descargables, ejecución local y reproducibilidad, a cambio de clips más cortos y sin control por texto. Frente a la variante de 14 fotogramas del mismo family, gana duración (25 frente a 14) al precio de más cómputo por generación.

## Limitaciones y advertencias

- Duración muy corta: los clips generados son de 4 segundos o menos.
- Falta de fotorrealismo: la propia model card reconoce que el modelo no alcanza un fotorrealismo perfecto y que el autoencoder es lossy.
- Movimiento insuficiente: puede producir vídeos prácticamente estáticos o con paneos de cámara muy lentos.
- Sin control textual: no se puede guiar la generación con prompts, negative prompts ni instrucciones de estilo; solo la imagen de entrada condiciona el resultado.
- Texto ilegible: no renderiza texto legible en los fotogramas.
- Rostros y personas: pueden generarse de forma deficiente, con artefactos o inconsistencias entre fotogramas.
- Riesgo de alucinación visual: al no estar entrenado para representar hechos o personas de forma fiel, no debe usarse como fuente documental ni para recrear eventos reales.
- Sesgos: la model card no detalla sesgos específicos, pero al entrenar sobre datos web sin retención y con filtrado automático, es esperable heredar sesgos de representación; no hay auditoría publicada en la información disponible.
- Licencia: Stable Video Diffusion Community License. El uso comercial no es libre por defecto y requiere consultar https://stability.ai/license; existen además restricciones de la Acceptable Use Policy de Stability AI.
- Este repositorio concreto es un re-upload de terceros (`mrderrock`), con 9 descargas y 0 likes, creado y actualizado el 2026-10-18. Para producción conviene usar el repositorio oficial de Stability AI y verificar la integridad de los pesos.
- Coste de inferencia alto: ~180 s por clip en A100 80GB con ajustes por defecto, lo que limita el uso interactivo.
- Sin datos de benchmarks estándar ni auditorías independientes publicadas en la información disponible.

## Enlaces

- Repositorio de este mirror: https://huggingface.co/mrderrock/stable-video-diffusion-img2vid-xt
- Repositorio oficial del modelo: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt
- Versión de 14 fotogramas: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid
- Repositorio de código (entrenamiento e inferencia): https://github.com/Stability-AI/generative-models
- Paper / página de investigación: https://stability.ai/research/stable-video-diffusion-scaling-latent-video-diffusion-models-to-large-datasets
- Licencia del modelo: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt/blob/main/LICENSE.md
- Licencia comercial de Stability AI: https://stability.ai/license
- Política de uso aceptable: https://stability.ai/use-policy
- Documentación del decoder en diffusers: https://huggingface.co/docs/diffusers/api/models/autoencoderkl#loading-from-the-original-format
- Búsqueda web: los resultados obtenidos no contienen enlaces técnicos relevantes al modelo (contenido no relacionado), por lo que no se incluyen.
