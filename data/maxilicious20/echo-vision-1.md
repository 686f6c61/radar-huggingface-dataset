# Maxilicious20/Echo-Vision-1

## Resumen

Echo-Vision-1 es un modelo de text-to-image de dos etapas (coarse-to-fine) desarrollado por Maxilicious20. Genera imágenes de 768×768 píxeles procesando primero un boceto de baja resolución (384 px) y refinándolo después con una segunda etapa tipo superresolución. El autor lo entrenó completamente desde cero en una única GPU de consumo (RTX 4060, 8 GB de VRAM), con un total aproximado de 74 millones de parámetros repartidos entre dos UNets.

La motivación del diseño es evitar los fallos típicos de los modelos pequeños de difusión que generan la imagen completa en un solo paso: costuras de texturas, objetos superpuestos, estructuras fantasma o salidas borrosas. Al dividir el problema en dos subtareas más sencillas (fijar la composición global y luego pintar el detalle), el modelo mejora la coherencia compositiva y la nitidez. Utiliza rectified flow como objetivo de entrenamiento (predicción de velocidad) con un encoder de texto CLIP congelado y un VAE congelado.

Se publica como una demo de investigación sobre entrenamiento a pequeña escala desde cero, no como un modelo de producción. Actualmente no tiene benchmarks publicados, licencia explícita ni documentación de idiomas soportados, por lo que debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Two-stage cascade de UNet2DConditionModel con rectified flow |
| Parametros totales | ≈ 74 millones (draft 36,2 M + final 37,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 77 tokens de texto (encoder CLIP ViT-B/32) |
| Tipos de cuantizacion | No disponible (el modelo se publica en precisión bf16/fp16, sin cuantizaciones adicionales) |
| Idiomas soportados | No disponible (el encoder CLIP está diseñado principalmente para inglés) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (Diffusers, en subcarpetas `draft` y `final`) |

Nota sobre parametros: la ficha de HuggingFace reporta un recuento de safetensors de 37.616.708, que corresponde al submodelo `final`. Segun la model card, el total de ambas etapas es aproximadamente 74 millones.

## Arquitectura y entrenamiento

Echo-Vision-1 se compone de dos UNets de difusion condicionadas por texto. La primera etapa (draft) trabaja sobre un latente de 48×48 (equivalente a 384 px) y tiene 36,2 millones de parametros. La segunda etapa (final) recibe 8 canales (4 de ruido mas 4 del boceto interpolado) y produce un latente de 96×96 (equivalente a 768 px), con 37,6 millones de parametros. Ambas etapas usan `UNet2DConditionModel` de Diffusers, con `AttnProcessor2_0` (Flash/SDPA) y format de memoria channels-last.

El objetivo de entrenamiento es rectified flow: interpolacion lineal entre dato limpio y ruido, timesteps uniformes `t ~ U(0,1)`, target de velocidad `v = ε − x₀` y perdida MSE. Se aplica classifier-free guidance con dropout del 15 % en texto y del 10 % en la condicion del boceto sobre el refiner. Los datos de entrenamiento son 45.251 imagenes cuadradas de web, con captions generados por Qwen2-VL-2B-Instruct (~7.000 de alta calidad) y Florence-2-large o BLIP como respaldo. Los latents y embeddings CLIP se precalcularon y cachearon en fp16.

El entrenamiento se realizo desde cero, sin pesos preentrenados ni destilacion, en una sola RTX 4060 de 8 GB con TF32 habilitado, bf16 autocast y EMA con decay 0,9995. Los hiperparametros principales son AdamW (lr 3e-4, cosine decay, warmup 6 %), batch size 48 en draft y 4 en final, con un tiempo total aproximado de 6,5 horas. El modelo pretende resolver los fallos de coherencia compositiva tipicos de los UNets pequenos mediante el esquema planificacion-pintado.

## Capacidades

- Generacion de imagenes de 768×768 píxeles a partir de prompts de texto en ingles (principalmente).
- Pipeline de dos etapas (boceto + refinado) que mejora la coherencia global de la escena y reduce objetos fantasma o superpuestos.
- Soporte de classifier-free guidance (CFG) con prompts positivos y negativos; el README recomienda CFG ≈ 2-3.
- Inferencia con aproximadamente 35 pasos Euler, sin necesidad de muestreadores complejos.
- No soporta tool calling, function calling, ni uso como agente.
- No genera texto, no razona ni ejecuta tareas de codigo.
- No admite entrada de imagenes (no es un modelo de imagen a imagen ni de vision).
- No documenta soporte multilingüe; el encoder CLIP ViT-B/32 limita la comprension de prompts fuera del ingles.
- Al ser un modelo pequeno y entrenado desde cero, no incluye capacidades de uso industrial como texto alternativo, atencion multimodal o generacion de video.

## Casos de uso

- Prototipado rapido de conceptos visuales: se puede usar para generar imagenes 768×768 que sirvan como mockups o moodboards en sesiones de diseno o tormenta de ideas, gracias a sus bajos requisitos de VRAM (8 GB) y su rapida inferencia de 35 pasos.
- Ilustracion de contenido editorial: generar imagenes simples para acompanar articulos de blog, presentaciones o publicaciones en redes sociales; el modelo funciona bien con prompts cortos y descriptivos en ingles.
- Data augmentation de datasets de vision: puede sintetizar variaciones de escenas para entrenar clasificadores o detectores, siempre que se valide manualmente la calidad y se mitiguen sesgos.
- Investigacion sobre modelos de difusion a pequena escala: al estar entrenado desde cero con rectified flow, sirve como caso de estudio para comparar arquitecturas cascade o analizar el efecto del entrenamiento en GPU de consumo.
- Pruebas de integracion en pipelines con `diffusers`: permite evaluar el soporte de `UNet2DConditionModel` con entradas de 8 canales, loading de subcarpetas y uso de CLIP congelado, sin necesidad de infraestructura de gran escala.
- Demostraciones educativas en cursos de IA generativa: el tamano reducido y la posibilidad de regenerar el training en horas sobre una RTX 4060 lo hacen util para ensenar los principios de diffusion, rectified flow y VAE.
- Generacion de imagenes de respaldo para tarjetas de visita, pequenas ilustraciones de producto o redes corporativas internas where se precise una imagen rapida y no se requiera un modelo de alta fidelidad.

Nota: dados los resultados de benchmarks ausentes y la licencia no disponible, estos casos de uso deben considerarse experimentales y requieren validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No constan puntuaciones de FID, CLIP score, IS ni comparativas con otros modelos de text-to-image.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el modelo se entreno en una RTX 4060 de 8 GB y el README indica que la inferencia "corre comodamente en 8 GB de VRAM". La estimacion razonable es de 4-6 GB en fp16 para un unico prompt.
- GPU recomendada: NVIDIA RTX 4060 (8 GB) o superior. Se puede ejecutar en GPUs de consumo con al menos 8 GB, incluyendo RTX 3060, RTX 4070, etc.
- Si cabe en GPUs de consumidor: si, siempre que tenga al menos 8 GB de VRAM. No se recomienda usar tarjetas con 6 GB o menos por el uso de la VAE y el UNet de refinado.
- Opciones de despliegue: el repo proporciona los pesos en formato Diffusers. Se puede usar con un pipeline personalizado en Python, o integrarlo en aplicaciones que carguen `UNet2DConditionModel`. No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni otros motores de inferencia para LLM, ya que es un modelo de difusion.
- Latencia y throughput: no hay datos publicados. La inferencia requiere alrededor de 35 pasos Euler; durante el entrenamiento, la etapa draft alcanzaba ~175 muestras/s en RTX 4060, pero este dato no es extrapolable a inferencia.

## Comparativa con modelos similares

No se ha encontrado informacion sobre modelos comparables del mismo tamano (≈74 M parametros) que hayan sido entrenados desde cero para text-to-image. En la busqueda web no aparecen benchmarks ni comparativas. A modo de referencia, modelos como Stable Diffusion 1.5 (860 M parametros) o SDXL (3.5 M) son mucho mayores y no constituyen una comparativa directa. Tampoco se dispone de datos de rendimiento que permitan situar a Echo-Vision-1 frente a otros difusores pequeños.

## Limitaciones y advertencias

- Sesgos: el dataset proviene de imagenes de web sin filtrado explicito de contenido ni de sesgo, por lo que el modelo puede reflejar estereotipos, distorsiones o contenido no deseado.
- Riesgo de alucinacion: como todo modelo de diffusion, puede generar objetos fantasma, fusiones de texturas o estructuras incoherentes. El diseno cascade reduce estos fallos en comparacion con un UNet unico, pero no los elimina.
- Limitaciones de contexto: el prompt se limita a 77 tokens, y el encoder CLIP ViT-B/32 esta optimizado para ingles; prompts complejos, multilingues o muy detallados pueden perder fidelidad.
- Limitaciones tecnicas: solo produce imagenes de 768×768 píxeles, sin soporte de video, audio, texto ni entrada de imagenes. No dispone de capacidades de vision ni de razonamiento.
- Restricciones de licencia: la licencia es "no disponible", lo que implica que no se otorgan permisos explicito para uso comercial, redistribution o modificacion. Si se pretende usar en produccion, es necesario contactar al autor o revisar el repositorio para obtener una licencia.
- Produccion: al no haber benchmarks publicados ni evaluaciones de seguridad, no se recomienda su uso en entornos de alta responsabilidad o en sistemas que requieran resultados deterministas.
- El repositorio no incluye documentacion sobre limitaciones de tamano de batch, prompts negativos optimos ni guias de uso avanzado; habra que experimentar.

## Enlaces

- Hugging Face: https://huggingface.co/Maxilicious20/Echo-Vision-1
- Arbol de archivos: https://huggingface.co/Maxilicious20/Echo-Vision-1/tree/main

No se han encontrado papers, blogs, repositorios adicionales o demos fuera de la pagina del modelo en la busqueda web.
