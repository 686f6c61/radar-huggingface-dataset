# krishgolcha/minsky-01-videogen

## Resumen

Minsky-01 VideoGen es una redistribucion con marca propia del checkpoint Kandinsky 6.0 Lite Distill 5s, un modelo de difusion para generacion conjunta de video y audio sincronizado. Lo publica el usuario krishgolcha bajo la etiqueta Minsky Machines, orientado a experimentar con flujos de video en recursos humanos, reclutamiento y marketing. Es relevante porque ilustra un patron habitual en el ecosistema: un tercero empaqueta pesos ya entrenados, anade documentacion y utilidades de despliegue, y lo publica con su propia ficha.

El modelo subyacente pertenece a la familia Kandinsky 6.0 de KandinskyLab, formada por una variante Lite de 3B parametros y una Pro de 29B. Esta distribucion usa la Lite destilada, que genera clips de 5 segundos con audio a 44 kHz y sincronizacion labial, en modos texto-a-video-audio e imagen-a-video-audio. La arquitectura es un backbone generativo de 3.177.988.112 parametros (aproximadamente 3,18B) implementado como pipeline de Diffusers (`Kandinsky6TI2VAPipeline`), con muestreo destilado de 10 pasos mediante el scheduler PiFlow.

La relevancia practica es doble: por un lado, ofrece una via de entrada de bajo coste a la generacion de video con audio en GPU de consumo; por otro, su model card es explicita sobre el alcance real de la publicacion, que no incluye entrenamiento adicional, validacion de calidad ni benchmarks propios. El repo ocupa 26,7 GB y los pesos son una copia sin modificar del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (backbone generativo de 3,18B) sobre pipeline `Kandinsky6TI2VAPipeline` de Diffusers |
| Parametros totales | 3.177.988.112 (aproximadamente 3,18B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo generativo de video, no de texto) |
| Tipos de cuantizacion | No disponible; la carga de referencia usa `torch.bfloat16` |
| Idiomas soportados | No disponible |
| Licencia | MIT (conservar avisos upstream y revisar licencias de componentes) |
| Formato de pesos | safetensors (10 archivos de pesos) |
| Tamano del repo | 26,7 GB |
| Tareas | Texto/imagen a video con audio sincronizado |
| Duracion de clip | 5 segundos |
| Muestreo | 10 pasos, PiFlow, guidance 1.0 |
| Resolucion de ejemplo | 864 x 480 a 24 fps |
| Audio | 44 kHz |
| Modelo base | kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers |

## Arquitectura y entrenamiento

El modelo es un sistema de difusion para generacion multimodal de video y audio, no un transformer autorregresivo de lenguaje. La familia Kandinsky 6.0 se presenta como un conjunto de modelos fundacionales para generacion sincronizada de texto, audio y video, con dos escalas: Lite (3B) y Pro (29B). Esta distribucion corresponde a la Lite destilada, optimizada para muestrear en 10 pasos con el scheduler PiFlow y guidance 1.0, lo que reduce el coste de inferencia frente a un muestreo completo. El pipeline de Diffusers asociado es `Kandinsky6TI2VAPipeline`, que devuelve fotogramas y audio en una sola llamada.

Sobre el entrenamiento, la model card redistribuida no aporta detalles propios: Minsky declara explicitamente que los pesos son una copia sin cambios del checkpoint upstream y que no ha realizado entrenamiento, fine-tuning ni destilacion adicional. La destilacion y el desarrollo original se atribuyen a Team Kandinsky. El autor incluye codigo experimental de entrenamiento y un entrenador LoRA solo para video, pero dirigido al modelo base Lite no destilado, no a estos pesos destilados. La validacion publicada se limita a nueve tests de CPU (incluido un paso de optimizador LoRA con modelo diminuto y recarga de adaptador), importacion de todas las clases de componentes, instanciacion de la arquitectura completa en meta device y verificacion SHA-256 de los 10 archivos de pesos contra los metadatos upstream; no se realizo una carga completa del checkpoint ni una prueba de calidad de video.

## Capacidades

- Generacion de video a partir de texto (T2AV) con audio sincronizado.
- Generacion de video a partir de imagen (TI2AV) con audio sincronizado.
- Audio integrado a 44 kHz, incluida sincronizacion labial segun la documentacion upstream.
- Clips de 5 segundos a 864 x 480 y 24 fps en la configuracion de ejemplo.
- Muestreo rapido: 10 pasos con PiFlow y guidance 1.0 gracias a la destilacion.
- Superresolucion complementaria en la familia upstream para alcanzar Full-HD (1920 x 1080), mediante un modelo plug-in separado.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la entrada es un prompt de texto sin lista de idiomas declarada.
- Modo thinking, vision o audio de entrada: no disponible.

## Casos de uso

- Video de onboarding corporativo: generar clips de 5 segundos de oficinas, equipos o bienvenidas a partir de un prompt descriptivo, usando el modo texto-a-video con audio ambiente para piezas de presentacion interna.
- Anuncios de reclutamiento: producir clips cortos de ambiente de trabajo para publicaciones de empleo, con la ventaja de obtener video y audio en una sola pasada y sin pipeline separado de sonido.
- Marketing en redes sociales: crear teasers verticales u horizontales de 5 segundos, encadenando varias generaciones para construir secuencias mas largas en postproduccion.
- Prototipado rapido de storyboards: convertir guiones breves en video animatico con audio para validar direccion creativa antes de producir con equipo humano.
- Generacion condicionada por imagen: animar una fotografia de producto o de instalaciones (modo TI2AV) para demostraciones y fichas comerciales, manteniendo la referencia visual de partida.
- Pruebas de concepto de sincronizacion labial: experimentar con avatares o presentadores sinteticos en clips cortos, aprovechando el audio a 44 kHz y el lip-sync del modelo upstream.
- Evaluacion de infraestructura de video generativo: usar el pipeline de Diffusers y los helpers de Minsky como banco de pruebas para medir latencia y consumo de VRAM antes de adoptar la variante Pro de 29B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta redistribucion indica explicitamente que no ha sido probada en inferencia ni evaluada con benchmarks por Minsky, y la validacion descrita se limita a tests de CPU, importacion de clases e integridad de pesos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos en bfloat16 de un backbone de 3,18B ocupan aproximadamente 6,4 GB, a lo que hay que sumar activaciones, VAE y componentes de audio; el repo completo pesa 26,7 GB.
- El ejemplo oficial usa `enable_model_cpu_offload()`, lo que permite descargar componentes a RAM y reduce el pico de VRAM a costa de latencia.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo es candidato a GPUs de consumo con 12-24 GB (por ejemplo, RTX 4090) y a GPUs de datacenter (A100, H100) para mayor throughput; estas recomendaciones son estimaciones por tamano, no datos del autor.
- Cabe en GPU de consumo: previsiblemente si con offload y cuantizacion, aunque no hay confirmacion oficial ni recetas de cuantizacion publicadas.
- Opciones de despliegue documentadas en el ecosistema upstream: Diffusers, vLLM (vllm-omni), SGLang, FastVideo y ComfyUI. Para esta redistribucion concreta solo se documenta Diffusers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Duracion / resolucion | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minsky-01 VideoGen (esta ficha) | 3,18B | 5 s, 864 x 480, 24 fps | Si, 44 kHz | MIT | Hugging Face, 0 descargas |
| Kandinsky 6.0 Lite Distill 5s (upstream) | 3B | 5 s, con superresolucion a 1920 x 1080 | Si, 44 kHz | MIT | Hugging Face, demo en Spaces |
| Kandinsky 6.0 Pro | 29B | 5 s, con superresolucion a Full-HD | Si, 44 kHz | No disponible en la informacion | Hugging Face, demo en Spaces |
| Otros modelos texto-a-video de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa relevante es interna a la familia Kandinsky 6.0: esta redistribucion no anade capacidades sobre el checkpoint Lite destilado y se diferencia solo por los helpers de flujo de trabajo, la documentacion empresarial y el codigo experimental de entrenamiento.

## Limitaciones y advertencias

- Redistribucion sin entrenamiento adicional: no aporta mejoras de calidad ni capacidades nuevas respecto al checkpoint upstream.
- Sin validacion de inferencia ni de calidad de video por parte del redistribuidor; los tests publicados son de CPU e integridad de pesos.
- Modelo de clips cortos (5 segundos): no es un producto completo de video corporativo; la model card recomienda anadir textos de politica, subtitulos, requisitos de puesto y activos de marca en una etapa de edicion separada.
- Riesgo de alucinacion visual y de audio: como modelo generativo, puede producir contenido incoherente, artefactos o audio no alineado con el prompt.
- Sesgos: no documentados en la informacion disponible; cabe esperar los sesgos de los datos de entrenamiento upstream, no auditados aqui.
- Idiomas: no se declara lista de idiomas soportados para los prompts.
- Licencia MIT, pero con la advertencia de conservar los avisos upstream y revisar las licencias de los componentes individuales del pipeline.
- Repo de 26,7 GB: requiere planificacion de almacenamiento y ancho de banda; la descarga completa es necesaria para cargar el pipeline.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.
- El entrenador LoRA incluido apunta al modelo base no destilado, no a estos pesos, por lo que no sirve para ajustar esta distribucion tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krishgolcha/minsky-01-videogen
- Modelo base upstream: https://huggingface.co/kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers
- Informe tecnico (arXiv): https://arxiv.org/pdf/2610.05608
- Pagina de modelos de video de KandinskyLab: https://kandinskylab.ai/models/video/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-Pro-distill-5s
- Documentacion del pipeline en Diffusers: https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6
- Integracion en vLLM: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6/
- Receta en SGLang: https://docs.sglang.io/cookbook/diffusion/Kandinsky/Kandinsky6
- Inferencia con FastVideo: https://haoailab.com/FastVideo/inference/kandinsky6/
- Nodo de ComfyUI: https://registry.comfy.org/nodes/kandinsky6
