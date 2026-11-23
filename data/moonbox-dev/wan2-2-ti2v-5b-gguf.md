# moonbox-dev/Wan2.2-TI2V-5B-GGUF

## Resumen

Wan2.2-TI2V-5B-GGUF es una compilación en formato GGUF del transformer de difusión Wan2.2-TI2V-5B, desarrollado originalmente por el equipo Wan de Alibaba (Wan-AI) y cuantizado por moonbox-dev para su uso en dispositivos locales. El modelo base es un generador de vídeo que combina text-to-video e image-to-video a resolución 720p, y esta versión GGUF permite ejecutarlo fuera de los frameworks habituales de difusión, concretamente mediante stable-diffusion.cpp y ComfyUI con el nodo ComfyUI-GGUF.

El modelo cuenta con 4.999.787.712 parámetros (aproximadamente 5B) y se distribuye en seis precisiones distintas, desde F16/BF16 (unos 10 GB) hasta Q4_K_M (3,44 GB), lo que lo hace accesible a GPUs de consumo con suficiente VRAM. La licencia es Apache-2.0, heredada del modelo original, lo que facilita su uso comercial y su integración en productos.

La relevancia de esta ficha radica en que se trata de una cuantización comunitaria (0 descargas y 0 likes en el momento de la consulta) cuyo valor está en habilitar la inferencia local de un modelo de vídeo de gama media con requisitos de memoria moderados. Es importante señalar que el autor solo ha validado los pesos (integridad de tensores y error RMS relativo), no la calidad de vídeo generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para generación de vídeo; el modelo base Wan2.2 emplea arquitectura MoE en su conjunto, aunque este checkpoint de 5B corresponde al transformer de difusión TI2V |
| Parametros totales | 4.999.787.712 (≈5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusión de vídeo; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Wan2.2-TI2V-5B es un transformer de difusión para generación de vídeo que soporta tanto text-to-video como image-to-video a 720p. La familia Wan2.2 introduce una arquitectura Mixture-of-Experts (MoE) en modelos de difusión de vídeo, separando el proceso de denoising a lo largo de los timesteps con expertos especializados, lo que amplía la capacidad total del modelo manteniendo el coste computacional. No obstante, este checkpoint concreto de 5B corresponde al transformer de difusión TI2V y no se especifica en la información disponible si emplea MoE internamente ni cuántos parámetros activos tendría.

El entrenamiento del modelo original incluye datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color, lo que permite un control más preciso del estilo cinematográfico. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La cuantización se realizó a partir de los pesos fp32 originales (tres shards) mediante `llama-quantize` (build b3962 con el parche de ComfyUI-GGUF), que mantiene modulación, normas y sesgos en alta precisión. El kernel Conv3d del patch-embedding se almacena en F32 en los ficheros BF16 y cuantizados, y en F16 en el fichero F16.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) a resolución 720p.
- Generación de vídeo a partir de una imagen (image-to-video) a resolución 720p.
- Control de estética cinematográfica mediante etiquetas de iluminación, composición, contraste y tono de color (heredado del modelo base).
- Ejecución local en dispositivos de consumo mediante stable-diffusion.cpp y ComfyUI-GGUF.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en la información proporcionada.
- No se dispone de información sobre modos especiales (thinking mode, visión, audio) más allá de la generación de vídeo.

## Casos de uso

- Generación de clips publicitarios cortos: el modelo puede producir vídeo a 720p a partir de un prompt textual, adecuado para prototipos rápidos de anuncios o storyboards animados antes de una producción final.
- Animación de imágenes fijas para redes sociales: mediante image-to-video, se puede dar movimiento a fotografías o ilustraciones para crear contenido dinámico sin necesidad de un estudio de animación.
- Previsualización de escenas en producción audiovisual: directores y guionistas pueden generar versiones preliminares de planos con estilos cinematográficos controlados por etiquetas de iluminación y composición.
- Creación de contenido para videojuegos: generación de cinemáticas o fondos animados a partir de descripciones textuales, con la ventaja de ejecutarse localmente sin depender de APIs externas.
- Prototipado en investigación de difusión de vídeo: al estar en GGUF y ejecutarse con stable-diffusion.cpp, permite experimentar con el modelo en entornos con recursos limitados y comparar precisiones (Q4_K_M frente a F16) para estudiar el impacto de la cuantización.
- Educación y demostraciones técnicas: útil para talleres o docencia donde se necesite mostrar generación de vídeo local sin infraestructura de GPU de datacenter, gracias a que el fichero Q4_K_M ocupa 3,44 GB.
- Integración en pipelines de ComfyUI: al cargarse mediante el nodo Unet Loader (GGUF), se puede encadenar con otros nodos de postprocesado, interpolación o composición dentro de flujos de trabajo existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la validación realizada es únicamente de pesos ("This is a weights check only; no video eval was run") y que las puntuaciones de calidad de imagen frente a salidas BF16 se añadirán a medida que cada precisión pase la evaluación de imagen. Los únicos datos numéricos disponibles son el error RMS relativo de los pesos dequantizados frente a los pesos fp32 originales:

| Precision | Tamano | Error RMS relativo frente a fp32 |
|---|---|---|
| F16 | 10,00 GB | 0,021 % |
| BF16 | 10,01 GB | 0,17 % |
| Q8_0 | 5,40 GB | 0,56 % |
| Q6_K | 4,22 GB | 1,8 % |
| Q5_K_M | 3,82 GB | 2,9 % |
| Q4_K_M | 3,44 GB | 5,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño de fichero, Q4_K_M (3,44 GB) requiere al menos esa cantidad de memoria para los pesos, más la memoria del text encoder (umt5-xxl) y del VAE Wan2.2, que se cargan por separado desde el repositorio original.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño de los ficheros, las variantes Q4_K_M y Q5_K_M son las más viables en GPUs de consumo con 8-12 GB de VRAM, mientras que F16/BF16 (10 GB solo de transformer) exigen GPUs de gama alta o profesional.
- Cabe en GPU de consumo: probablemente sí con las cuantizaciones Q4_K_M, Q5_K_M y Q6_K, siempre que se sume la memoria del text encoder y del VAE; no se dispone de confirmación oficial.
- Opciones de despliegue: stable-diffusion.cpp (con `--diffusion-model`, ver `docs/models/wan.md`, sección "Wan2.2 TI2V 5B") y ComfyUI mediante ComfyUI-GGUF (Unet Loader GGUF).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos comparables (por ejemplo, otras variantes de Wan2.2 o modelos de vídeo de tamaño similar), por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, el propio modelo base Wan-AI/Wan2.2-TI2V-5B en safetensors sería la alternativa directa en precisión completa, mientras que esta versión GGUF ofrece el mismo transformer en formatos cuantizados para despliegue local.

| Modelo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| moonbox-dev/Wan2.2-TI2V-5B-GGUF | ≈5B | GGUF (F16 a Q4_K_M) | Apache-2.0 | Hugging Face |
| Wan-AI/Wan2.2-TI2V-5B | ≈5B | safetensors (fp32/BF16) | Apache-2.0 | Hugging Face |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La validación realizada por el autor es exclusivamente de pesos: no se ha ejecutado ninguna evaluación de calidad de vídeo, por lo que no hay garantía de que las cuantizaciones bajas (Q4_K_M, Q5_K_M) mantengan la fidelidad visual del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación muy reciente y sin validación comunitaria.
- Solo se incluyen los pesos del transformer de difusión; es imprescindible obtener el text encoder (umt5-xxl) y el VAE Wan2.2 (el específico de Wan2.2, no el de Wan2.1) del repositorio original o del repack de Comfy-Org.
- No se dispone de información sobre sesgos, riesgo de alucinación visual, limitaciones de idioma ni restricciones adicionales de uso comercial más allá de la licencia Apache-2.0.
- El error RMS relativo de Q4_K_M es del 5,0 %, el más alto de la tabla; para producción con requisitos de calidad estrictos conviene evaluar Q6_K o Q8_0 antes de adoptar Q4_K_M.
- La licencia Apache-2.0 del modelo base se aplica a estos ficheros derivados; cualquier uso debe cumplirla, pero no se detallan en la información disponible restricciones adicionales del autor original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Wan2.2-TI2V-5B-GGUF
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Informe técnico (arXiv): https://arxiv.org/abs/2503.20314
- GitHub de Wan2.2: https://github.com/Wan-Video/Wan2.2
- Organización Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Blog de Wan: https://wan.video/welcome
- Sitio web de Wan: https://wan.video
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Discord: https://discord.gg/AKNgpMK4Yj
