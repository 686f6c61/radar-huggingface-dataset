# QuantStack/Wan2.2-I2V-A14B-GGUF

## Resumen

QuantStack/Wan2.2-I2V-A14B-GGUF es una versión cuantizada en formato GGUF del modelo Wan-AI/Wan2.2-I2V-A14B, un modelo de difusión para generación de vídeo a partir de una imagen (image-to-video) perteneciente a la familia Wan2.2. Este repositorio, publicado por QuantStack el 28 de julio de 2025 y actualizado al día siguiente, no entrena un modelo nuevo: realiza una conversión directa de los pesos originales de Wan2.2 al formato GGUF con el objetivo de reducir los requisitos de memoria y facilitar su ejecución en hardware de gama alta de consumo.

Los metadatos de safetensors del repositorio indican 14.288.901.184 parámetros (unos 14,29 mil millones) y el modelo base está etiquetado con soporte de inglés (en) y chino (zh) para los prompts. La nomenclatura «A14B» del modelo original sugiere una arquitectura con parámetros activos en lugar de densos, aunque la información proporcionada no confirma esta estructura interna.

Su relevancia actual reside en que, al distribuirse en GGUF, puede cargarse en flujos de trabajo de ComfyUI mediante el nodo ComfyUI-GGUF y ejecutarse con cuantizaciones que reducen notablemente la VRAM necesaria frente al modelo original en precisión completa. En el momento de la consulta acumula 371.875 descargas y 425 «likes», lo que lo convierte en una de las conversiones GGUF de referencia para este modelo de vídeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de difusión para image-to-video según el pipeline_tag) |
| Parámetros totales | 14.288.901.184 (~14,29 B, dato de safetensors del repositorio) |
| Parámetros activos | No disponible (la nomenclatura «A14B» del modelo base apunta a parámetros activos, sin confirmar) |
| Longitud de contexto | No disponible (no aplica como ventana de contexto textual) |
| Tipos de cuantización | GGUF; el repositorio contiene varios niveles (tamaño total del repo: 232,8 GB), lista exacta no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

Según la model card, el archivo GGUF es una conversión directa del modelo Wan-AI/Wan2.2-I2V-A14B y no se ha reentrenado ni ajustado: se trata de un modelo de difusión para la tarea image-to-video, que genera vídeo a partir de una imagen de entrada y un prompt textual en inglés o chino.

La información proporcionada no detalla la arquitectura interna (tipo de backbone, mecanismo de atención o de denoising), el número de tokens o frames de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. Estos detalles, si existen, corresponden a la model card del modelo original Wan-AI/Wan2.2-I2V-A14B. La única innovación documentada en este repositorio es la propia conversión a GGUF y su integración con el ecosistema de cuantización de ComfyUI; los resultados de búsqueda mencionan que Wan2.2 introduce innovaciones respecto a la generación anterior, pero no especifican cuáles.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video): toma una imagen fija como condición y un prompt textual y produce una secuencia de vídeo.
- Acepta prompts en inglés (en) y chino (zh), según los idiomas declarados en la ficha del modelo.
- Ejecución en cuantizaciones GGUF, lo que permite cargarlo en pipelines de ComfyUI con menos VRAM que el modelo en precisión completa.
- Integración con el nodo ComfyUI-GGUF (los archivos se colocan en `ComfyUI/models/unet`).
- Soporte de tool calling / function calling: no aplicable (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Otras capacidades especiales (modo «thinking», visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Animación de imágenes fijas para redes sociales: a partir de una fotografía o ilustración, el modelo genera un clip con movimiento coherente, útil para producir contenido vertical u horizontal sin rodaje.
- Previzualización de storyboards en producción audiovisual: convierte viñetas o fotogramas clave en animáticas rápidas que permiten validar encuadres y ritmo antes de rodar.
- Creación de material publicitario: genera variaciones animadas de un producto a partir de una única fotografía, reduciendo el coste frente a una producción de vídeo convencional.
- Prototipado dentro de ComfyUI: al integrarse con el nodo ComfyUI-GGUF, permite iterar sobre prompts, resoluciones y cuantizaciones dentro de un grafo existente sin salir del entorno.
- Efectos de movimiento en fotografía: añade movimiento sutil (paralaje, cámara, sujeto) a retratos o paisajes para presentaciones y catálogos.
- Arte conceptual y videojuegos: generación de clips de referencia para animar personajes o escenarios a partir de un concept art, antes de pasar a un pipeline de producción.
- Recuperación de material histórico: animar fotografías antiguas o de archivo para documentales y exposiciones, con el prompt adecuado y sin necesidad de metraje original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, según el tamaño de los pesos y el nivel de cuantización (estimación a partir de los 14,29 B de parámetros; la generación de vídeo requiere además memoria para el VAE y las activaciones, por lo que las cifras reales serán superiores):
  - Q2_K: ~5,4 GB
  - Q3_K_M: ~7,0 GB
  - Q4_K_M: ~8,7 GB
  - Q5_K_M: ~10,1 GB
  - Q6_K: ~11,8 GB
  - Q8_0: ~15,2 GB
  - FP16: ~28,6 GB
- GPU recomendadas: no disponible de forma oficial. Por capacidad de VRAM, encajan GPUs de 24 GB (RTX 3090, RTX 4090) con cuantizaciones medias, y GPUs de datacenter (A100 40/80 GB, H100) para niveles altos o mayor resolución y número de frames.
- ¿Cabe en GPU de consumo?: sí, en cuantizaciones de 2 a 6 bits dentro de los 24 GB de una RTX 3090 o RTX 4090, asumiendo resolución y número de frames moderados; el margen para el VAE y las activaciones debe verificarse en cada caso.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (ubicación de peso `ComfyUI/models/unet`). Otros entornos (vLLM, llama.cpp, Ollama, TGI) no aplican porque no es un modelo de lenguaje; no se documentan en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| QuantStack/Wan2.2-I2V-A14B-GGUF (este) | 14,29 B (safetensors del repo) | GGUF | apache-2.0 | HuggingFace (371.875 descargas) |
| Wan-AI/Wan2.2-I2V-A14B (base) | 14,29 B (según metadatos del repo cuantizado) | safetensors | apache-2.0 | HuggingFace |
| Otros modelos image-to-video (CogVideoX, HunyuanVideo, LTX-Video) | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de los modelos alternativos en la información proporcionada, por lo que no se puede realizar una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al ser un modelo entrenado con datos de vídeo, puede reproducir sesgos presentes en dichos datos.
- Riesgo de alucinación: en modelos de difusión de vídeo se manifiesta como artefactos visuales, movimiento incoherente o detalles inventados respecto a la imagen de entrada. Cuantizaciones agresivas (2-3 bits) pueden aumentar estos artefactos.
- Limitaciones de idioma: los prompts están declarados únicamente en inglés y chino; no hay soporte confirmado de otros idiomas.
- Restricciones de licencia: el modelo se distribuye bajo Apache 2.0, que permite uso comercial. Sin embargo, al ser una versión cuantizada, la model card advierte de que «todos los términos de licencia y restricciones de uso originales siguen vigentes», por lo que deben consultarse también en el modelo base Wan-AI/Wan2.2-I2V-A14B.
- Caveat de cuantización: al ser una conversión GGUF, existe una pérdida de calidad respecto al modelo original en precisión completa; el grado de degradación depende del nivel de cuantización elegido.
- Requisitos de memoria: aunque las cuantizaciones reducen los pesos, la generación de vídeo requiere VRAM adicional para el VAE y las activaciones, que puede exceder la estimación basada solo en los pesos.
- Compatibilidad: la model card indica su uso con el nodo ComfyUI-GGUF y la ubicación `ComfyUI/models/unet`; otros entornos no están documentados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/QuantStack/Wan2.2-I2V-A14B-GGUF
- README del repositorio: https://huggingface.co/QuantStack/Wan2.2-I2V-A14B-GGUF/blob/main/README.md
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Nodo de ComfyUI para GGUF (city96): https://github.com/city96/ComfyUI-GGUF
- Espejo en ModelScope: https://www.modelscope.cn/models/bullerwins/Wan2.2-I2V-A14B-GGUF
- Hilo en Reddit sobre el modelo: https://www.reddit.com/r/StableDiffusion/comments/1oapsh7/noob_question_wan_video_22_i2va14b/
