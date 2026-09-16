# FastVideo/FastVideo-FastH3-8-Step-V2

## Resumen

FastVideo-FastH3-8-Step-V2 es un checkpoint destilado de generación de vídeo y audio sincronizados a partir de texto, publicado por el equipo de FastVideo (hao-ai-lab). Se construye sobre el modelo base MiniMaxAI/MiniMax-H3 y se distribuye bajo la licencia comunitaria minimax-h3-community. Su rasgo definitorio es que produce la salida completa con solo ocho pasadas forward del transformer, en lugar de las decenas de pasos de muestreo que requiere un modelo de difusión sin destilar. El checkpoint corresponde al paso de entrenamiento 1300 y ocupa un repositorio de 147,8 GB en formato safetensors.

La destilación se ha realizado con DMD2 en modo data-free (sin datos de entrenamiento adicionales) y con el backend de atención VSA-H3 configurado al 80% de sparsity. El modelo requiere ese backend de atención específico y un ajuste de scheduler shift de 10 para vídeo, distinto del 12 que usa el modelo base. Los valores por defecto probados por el autor utilizan cuatro GPU NVIDIA B200, y el número de GPU empleado debe dividir los 56 cabezales de atención de H3.

El interés actual del checkpoint está en que acerca la generación conjunta de vídeo y audio a un régimen de pocos pasos, con un coste de inferencia muy inferior al del modelo base. Ahora bien, el propio autor advierte que FL2VA y Ref2VA no fueron destilados, y que el movimiento difícil, el detalle fino y parte del audio pueden quedar por debajo de MiniMax H3 base. El modelo declarado tiene 35.049.751.296 parámetros totales (unos 35B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion conjunta de video y audio (detalles internos no disponibles); requiere el backend de atencion VSA-H3 |
| Parametros totales | 35.049.751.296 (unos 35B) |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-video/audio, no conversacional) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, fp8 ni int4 en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (license: other) |
| Formato de pesos | safetensors (libreria diffusers) |
| Pipeline | text-to-video / text-to-audio-video |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Pasos de inferencia | 8 pasadas forward del transformer |
| Tamano del repositorio | 147,8 GB |
| Backend de atencion requerido | VSA-H3 (FastVideo), con sparsity 80% en entrenamiento |
| Scheduler shift de video | 10 (el modelo base usa 12) |
| Fecha de creacion | 2026-09-04 |
| Ultima actualizacion | 2026-09-15 |
| Descargas / likes en HuggingFace | 2 / 14 |

## Arquitectura y entrenamiento

El modelo es un checkpoint destilado del transformer multimodal de MiniMax H3, orientado a generar vídeo y audio sincronizados a partir de una descripción textual. La innovación principal no está en la arquitectura base, sino en la receta de destilación: se ha aplicado DMD2 en variante data-free, lo que permite obtener un generador de pocos pasos sin necesidad de un conjunto de datos de destilación, y se ha entrenado con VSA-H3 operando al 80% de sparsity en la atención. El resultado es un modelo que resuelve la generación completa en ocho pasadas forward, frente a los esquemas de muestreo multi-paso habituales.

El checkpoint publicado corresponde al paso 1300 del entrenamiento de destilación. Como consecuencia del proceso, el calendario de ruido del vídeo cambia: el shift del scheduler es 10, no el 12 del modelo base, y el ejemplo de inferencia del repositorio lee ese calendario directamente del checkpoint. El autor agradece explícitamente al equipo de NVIDIA FastGen por el framework DMD2 y el experimento de referencia sobre H3, que sirvieron para alinear el reloj de score, los shifts de modalidad y la simulación backward. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, algo poco habitual en modelos de difusión.

## Capacidades

- Generación de vídeo a partir de texto, con salida en un número reducido de pasos (ocho pasadas forward).
- Generación de audio sincronizado con el vídeo, en el mismo proceso de inferencia (pipeline text-to-audio-video).
- Generación conjunta de ambas modalidades en una sola pasada del pipeline, no como etapas independientes.
- Inferencia multi-GPU: el ejemplo oficial funciona con reparto del transformer entre varias GPU y el recuento debe dividir los 56 cabezales de atención de H3.
- Compatibilidad con el ecosistema diffusers para la carga del checkpoint.
- Selección de kernel de atención: el autor documenta el uso de `--vsa-kernel triton` como alternativa en sistemas multi-GPU CUDA distintos de la configuración probada.
- No soporta, según el propio autor, las variantes FL2VA (primer/último fotograma a vídeo-audio) ni Ref2VA (referencia a vídeo-audio), que no fueron destiladas.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni uso conversacional: no es un modelo de lenguaje, sino un generador de medios.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación rápida de clips con audio para prototipado creativo: con ocho pasadas forward, un estudio puede iterar sobre variantes de un anuncio o una escena sin esperar minutos por muestra, siempre que disponga de la infraestructura multi-GPU documentada.
- Previsualización de storyboards sonorizados: guionistas y directores de arte pueden convertir una descripción textual en un clip con audio sincronizado para validar tono, ritmo y ambientación antes de producir.
- Producción de contenido para redes sociales a escala: el pipeline text-to-audio-video permite generar piezas cortas con banda sonora a partir de una única instrucción, reduciendo la necesidad de ensamblar vídeo y audio por separado.
- Generación de material de relleno para edición (B-roll sintético): escenas de ambiente con audio coherente que se insertan en una timeline para cubrir transiciones o planos de recurso.
- Investigación en destilación de modelos de difusión: el checkpoint es un punto de referencia reproducible para estudiar DMD2 data-free y atención con sparsity alta aplicados a modelos multimodales de gran tamaño.
- Evaluación comparativa de recetas de pocos pasos: sirve como contrapunto a recetas externas de cuatro y ocho pasos sobre H3 (por ejemplo las de LightX2V citadas por terceros) para medir el equilibrio entre fidelidad y coste.
- Localización de contenido audiovisual de bajo presupuesto: generación de clips con diálogo o ambiente en distintos contextos sin necesidad de rodaje, sujeto a las restricciones de la licencia comunitaria.
- Automatización de pipelines de vídeo en agentes creativos: el modelo puede integrarse como etapa generativa dentro de flujos de trabajo más amplios, tal y como menciona el agradecimiento a Nuva Lab por su experiencia en cargas de trabajo de agentes de vídeo creativo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FVD, CLIP-score, IS, alineación audio-vídeo, etc.) ni comparaciones numéricas con MiniMax H3 base. La única referencia de rendimiento es cualitativa: el autor indica que el movimiento difícil, el detalle fino y parte del audio pueden quedar por debajo del modelo base, y que las variantes FL2VA y Ref2VA no fueron destiladas.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa derivada del recuento de parámetros, los pesos en bf16 ocuparían del orden de 70 GB, a lo que hay que sumar el codificador de texto, los decodificadores de vídeo y audio y las activaciones; en fp8 los pesos bajarían a unos 35 GB. Estas cifras son una estimación, no un dato del repositorio.
- Configuración probada por el autor: cuatro GPU NVIDIA B200, con el calendario de ocho pasadas forward y sin warmup.
- Restricción de reparto: el número de GPU debe dividir los 56 cabezales de atención de H3 (1, 2, 4, 7, 8, 14, 28 o 56).
- En sistemas multi-GPU CUDA distintos del probado, el propio autor indica añadir `--no-replicated-dit --vsa-kernel triton --no-fa4`.
- GPU de consumo: no cabe en tarjetas consumer convencionales (RTX 4090 de 24 GB o similares) ni por tamaño de pesos ni por el requisito de backend de atención; no se documenta ninguna ruta de cuantización que lo haga viable.
- Kernels: la instalación recomendada usa la rueda publicada de `fastvideo-kernel` con `UV_TORCH_BACKEND=cu130`, es decir, la ruta CUDA 13 / Blackwell, evitando compilar el kernel en local.
- Opciones de despliegue: FastVideo (repositorio hao-ai-lab/FastVideo) con el extra `[fasth3]` y el script `examples/inference/basic/basic_fasth3_8step.py`. No se documentan rutas oficiales para vLLM, llama.cpp, Ollama ni TGI; vLLM aparece únicamente como patrocinador del proyecto FastVideo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de inferencia | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastVideo-FastH3-8-Step-V2 | 35,05B | 8 | no aplica | minimax-h3-community | HuggingFace + repositorio FastVideo |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | muestreo multi-paso (shift 12) | no aplica | MiniMax H3 Community License | HuggingFace |
| FastH3 preview de 4 pasadas forward | no disponible | 4 | no aplica | no disponible | citado en el PR del repositorio FastVideo |
| Recetas LightX2V de 8 y 4 pasos sobre H3 | no disponible | 8 y 4 | no aplica | no disponible | citadas por un tercero (Sogni), no verificadas en la informacion disponible |

Los datos de rendimiento comparado no están disponibles: no hay benchmarks publicados que permitan situar este checkpoint frente al modelo base ni frente a las recetas alternativas de pocos pasos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Como generador de medios entrenado sobre datos a gran escala, es previsible que reproduzca sesgos de representación de personas, culturas y escenas, pero el autor no publica ninguna evaluación al respecto.
- Riesgo de alucinación: aplicable en su forma visual y sonora; el modelo puede generar elementos incoherentes con el prompt, especialmente en movimiento complejo, detalle fino y audio, según admite el propio autor.
- Menor fidelidad que el modelo base en escenas con movimiento difícil, detalle fino y algunos componentes de audio.
- Las variantes FL2VA y Ref2VA no están destiladas en este checkpoint, por lo que no deben esperarse esas capacidades.
- Dependencia dura del backend de atención VSA-H3 de FastVideo y de un ajuste de scheduler shift distinto del base (10 frente a 12); usar la configuración del modelo base produce resultados incorrectos.
- Requisito de hardware elevado: la configuración probada usa cuatro B200, y el reparto entre GPU debe respetar los 56 cabezales de atención.
- Restricciones de licencia: se hereda la MiniMax H3 Community License, que no es una licencia de código abierto estándar. Es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Adopción muy baja: 2 descargas y 14 likes en el momento de los datos, lo que implica escasa validación independiente y poca comunidad para resolver problemas.
- Idiomas soportados no declarados; no hay garantía de comportamiento consistente en prompts fuera del inglés.
- El resultado de búsqueda que menciona recetas LightX2V y un "FastH3 Turbo" de 4 pasos proviene de un tercero (Sogni) y no está confirmado en la model card oficial; trátese como información no verificada.
- Los resultados de búsqueda sobre gobernanza de contenidos de ventas (Highspot) son ruido y no guardan relación con este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FastVideo/FastVideo-FastH3-8-Step-V2
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio FastVideo: https://github.com/hao-ai-lab/FastVideo
- Blog de presentacion de FastH3: https://haoailab.com/blogs/fasth3-preview/
- Coleccion FastH3 en HuggingFace: https://huggingface.co/collections/FastVideo/fastvideo-fasth3
- Guia de instalacion de FastVideo: https://hao-ai-lab.github.io/FastVideo/getting_started/installation/
- Pull request con el soporte de inferencia del checkpoint: https://github.com/hao-ai-lab/FastVideo/pull/1852
- Paper de DMD2: https://arxiv.org/abs/2405.14867
- Framework NVIDIA FastGen: https://github.com/NVlabs/FastGen
- Proyecto vLLM: https://vllm.ai/
- Nuva Lab: https://nuvalab.ai/
- MiniMax: https://huggingface.co/MiniMaxAI
- NVIDIA: https://www.nvidia.com/en-us/
- MBZUAI: https://mbzuai.ac.ae/
- Referencia de terceros sobre recetas de pocos pasos sobre H3: https://www.sogni.ai/models/minimax-h3
