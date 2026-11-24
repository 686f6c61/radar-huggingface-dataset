# AnosVoldigoad1/Qwen3.5-2B-GGUF

## Resumen

Qwen3.5-2B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3.5-2B, publicado por el usuario AnosVoldigoad1 en Hugging Face. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer multimodal de tipo vision-language con aproximadamente 1.880 millones de parámetros (1,881.825.088 según los pesos en safetensors), orientado a tareas conversacionales y de comprensión de imágenes. Esta versión GGUF está empaquetada específicamente para su uso con llama.cpp y con la aplicación P.AI AI Image Studio, en su modalidad de "Fast Close-up Grounding".

El interés de esta publicación radica en que ofrece cuantizaciones listas para consumir en entornos de inferencia local (Q8_0 y Q4_K_M) junto con el proyector de visión en FP16 necesario para tareas de localización de objetos mediante cajas delimitadoras 2D. El repositorio ocupa 4,0 GB e incluye tres artefactos: dos pesos cuantizados y el `mmproj-F16.gguf`. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

No obstante, la información pública disponible es muy limitada: la model card no detalla la composición del dataset de entrenamiento, los idiomas soportados, la longitud de contexto ni resultados de benchmarks. Se trata de una republicación comunitaria (cero descargas y cero likes en el momento de la consulta) cuyo valor depende enteramente del modelo base Qwen/Qwen3.5-2B, del cual no se aportan especificaciones técnicas en esta ficha más allá de los parámetros y el tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language); detalles internos no disponibles |
| Parámetros totales | 1.881.825.088 (~1,88 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (~1,92 GB), Q4_K_M (~1,22 GB); proyector de visión FP16 (~637 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); existe una variante INT8-ConvRot en PyTorch/ComfyUI |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un transformer multimodal de tipo vision-language, según indican las etiquetas del repositorio y la presencia del proyector de visión (`mmproj-F16.gguf`). La arquitectura interna concreta (número de capas, dimensión oculta, mecanismo de atención, tipo de encoder visual) no se detalla en la información proporcionada. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica destacable de esta publicación no está en el modelo en sí, sino en el empaquetado: se incluye el proyector de visión en FP16 como archivo separado, requisito para que llama.cpp pueda procesar imágenes y generar coordenadas de cajas delimitadoras 2D con precisión. La model card menciona además una variante alternativa, `AnosVoldigoad1/Qwen3.5-2B-INT8-ConvRot`, que integra la visión en BF16 dentro de un único archivo para PyTorch y ComfyUI, sin necesidad de `mmproj`. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational`.
- Comprensión de imágenes y grounding visual: generación de cajas delimitadoras 2D ("2D bounding-box coordinates"), orientada a la funcionalidad Fast Close-up Grounding de P.AI AI Image Studio.
- Procesamiento multimodal mediante proyector de visión FP16 separado.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Cuantización con imatrix (etiqueta `imatrix`), lo que sugiere calibración de importancia para las cuantizaciones.
- Soporte de tool calling / function calling: no disponible en la información.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- Grounding visual en estudios de imagen: el modelo, junto con `mmproj-F16.gguf`, puede localizar objetos en una imagen y devolver coordenadas de cajas delimitadoras 2D, lo que permite integrarlo en flujos de anotación automática o recorte inteligente dentro de P.AI AI Image Studio.
- Asistentes conversacionales locales: con la cuantización Q4_K_M (~1,22 GB) puede desplegarse en equipos con poca VRAM para mantener conversaciones multi-turno sin conexión a servicios en la nube.
- Descripción automática de imágenes: dado su carácter vision-language, puede generar texto descriptivo a partir de una imagen, útil para accesibilidad o catalogación de contenido visual.
- Prototipado rápido en llama.cpp: al estar en formato GGUF, permite validar ideas de producto con inferencia local antes de invertir en infraestructura GPU, gracias a su reducido tamaño (menos de 2 GB en Q8_0).
- Procesamiento por lotes en CPU: la cuantización Q4_K_M facilita ejecutar tareas de visión y texto en servidores sin GPU, adecuado para pipelines de bajo volumen donde la latencia no es crítica.
- Integración en aplicaciones de escritorio o móviles: el tamaño compacto del modelo (1,88 mil millones de parámetros) y la licencia Apache 2.0 permiten incorporarlo en herramientas distribuidas a terceros sin obligaciones de licencia adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para la cuantización Q8_0 (~1,92 GB de pesos) más el proyector de visión FP16 (~637 MB), lo que sitúa el total en torno a 2,5-3 GB con overhead de contexto; en Q4_K_M (~1,22 GB) más el proyector, alrededor de 2 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite ejecutar el modelo con holgura. Para mayor throughput, una RTX 4090 o una A100/H100 no aportan ventajas proporcionales dado el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (formato nativo), P.AI AI Image Studio, y cualquier frontend compatible con GGUF que soporte `mmproj` para visión. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-GGUF (este) | ~1,88 mil M | no disponible | Sí (mmproj FP16) | Apache 2.0 | GGUF |
| Qwen2-VL-2B | ~2 mil M | no disponible en esta ficha | Sí | Apache 2.0 | safetensors, GGUF |
| SmolVLM-2B | ~2 mil M | no disponible en esta ficha | Sí | Apache 2.0 | safetensors, GGUF |

La comparación se limita a la categoría de modelos vision-language de aproximadamente 2 mil millones de parámetros con licencia permisiva. No se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa con las alternativas; los datos de contexto de los modelos comparables no se han verificado en la información proporcionada y se indican como no disponibles.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero todo modelo entrenado con datos web puede reproducir sesgos de género, raza o nacionalidad; se recomienda auditar las salidas en aplicaciones sensibles.
- Riesgo de alucinación inherente a los modelos de 2 mil millones de parámetros: la capacidad de razonamiento y de verificación factual es limitada en comparación con modelos de mayor tamaño.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que impide garantizar un comportamiento correcto en castellano o en conversaciones largas sin pruebas previas.
- El grounding visual depende del archivo `mmproj-F16.gguf`; omitirlo o usar una versión incompatible degrada la precisión de las coordenadas de las cajas delimitadoras.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre el modelo base ni sobre la calidad de las cuantizaciones; conviene validar el comportamiento antes de desplegarlo en producción.
- El repositorio tiene cero descargas y cero likes, sin evidencia de validación por parte de la comunidad; la reproducibilidad de los resultados no está contrastada.
- No hay información sobre el proceso de alineación (RLHF/DPO), por lo que se desconoce su comportamiento ante instrucciones maliciosas o prompts de jailbreak.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AnosVoldigoad1/Qwen3.5-2B-GGUF
- Variante INT8-ConvRot para PyTorch/ComfyUI: https://huggingface.co/AnosVoldigoad1/Qwen3.5-2B-INT8-ConvRot
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
