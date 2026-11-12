# moonbox-ai/Z-Image-Turbo-GGUF

## Resumen

Z-Image-Turbo-GGUF es la versión cuantizada en formato GGUF del modelo de difusión Z-Image-Turbo, desarrollado originalmente por Tongyi-MAI (Alibaba) y empaquetado por moonbox-ai para su uso en dispositivos locales. Z-Image-Turbo es un modelo de generación de imágenes texto-a-imagen de 6.154.908.736 parámetros (aproximadamente 6B) basado en un Diffusion Transformer de flujo único (single-stream DiT), destilado para funcionar con solo 8 pasos de inferencia (NFE) y CFG 1.0, lo que reduce drásticamente el coste computacional frente a modelos de difusión convencionales.

Este repositorio concreto no contiene el modelo original en safetensors, sino cinco archivos GGUF con distintas precisiones (F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M), pensados para ejecutarse con stable-diffusion.cpp o ComfyUI con el nodo ComfyUI-GGUF. La relevancia de esta ficha radica en que permite desplegar un generador de imágenes de 6B en GPUs de consumo con 16 GB de VRAM o menos, manteniendo una fidelidad respecto a los pesos BF16 originales muy alta en Q8_0 (error RMS relativo del 0,50 %) y aceptable en Q4_K_M (4,7 %).

El modelo destaca por su capacidad de renderizado de texto bilingüe (inglés y chino), su adherencia a instrucciones y su latencia sub-segundo en GPUs de clase empresarial como la H800. La licencia Apache-2.0 facilita su uso comercial, aunque el repositorio solo incluye los pesos del transformer de difusión: el codificador de texto (Qwen3-4B) y el VAE (FLUX.1) deben obtenerse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer de flujo único (single-stream DiT) |
| Parametros totales | 6.154.908.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible (el modelo base declara renderizado de texto bilingüe inglés-chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un archivo por precisión) |

## Arquitectura y entrenamiento

Z-Image-Turbo se basa en un Diffusion Transformer de flujo único, una arquitectura que unifica las corrientes de procesamiento de tokens de imagen y de condicionamiento en lugar de mantener ramas separadas. El modelo cuenta con aproximadamente 6B parámetros y se distribuye como un único checkpoint de difusión que requiere un codificador de texto externo (Qwen3-4B, en formato `qwen_3_4b.safetensors`) y un VAE externo (`ae.safetensors`, correspondiente al VAE de FLUX.1). La variante Turbo es una versión destilada del modelo base Z-Image, entrenada para operar con solo 8 evaluaciones de función (NFE) y escala CFG de 1.0, lo que elimina la necesidad de classifier-free guidance y reduce la latencia de forma drástica.

Los detalles concretos sobre el volumen de tokens de entrenamiento, la composición del dataset y las técnicas de alineación (RLHF, DPO u otras) no están disponibles en la información proporcionada. La model card original menciona que el modelo sobresale en generación fotorrealista, renderizado de texto bilingüe y adherencia a instrucciones, pero no desglosa la metodología de entrenamiento más allá de indicar que Turbo es una destilación del modelo Z-Image base. Las conversiones a GGUF se realizaron a partir de los pesos BF16 originales (revisión `f332072aa7`) usando `llama-quantize` de llama.cpp, y cada archivo fue verificado contra los pesos originales antes de su publicación, con los hashes SHA-256 documentados en la model card.

## Capacidades

- Generación de imágenes texto-a-imagen de alta calidad fotorrealista.
- Renderizado de texto bilingüe (inglés y chino) dentro de las imágenes generadas.
- Adherencia robusta a instrucciones complejas de prompt.
- Inferencia rápida: 8 pasos de difusión con CFG 1.0 (modelo destilado).
- Ejecución en dispositivos de consumo con 16 GB de VRAM o menos.
- Compatibilidad con stable-diffusion.cpp y ComfyUI (mediante ComfyUI-GGUF, cargado como `lumina2`).
- No se ha documentado soporte de tool calling, agentes, visión de entrada ni audio en la información disponible.

## Casos de uso

- Generación de imágenes en local para desarrolladores: el modelo puede ejecutarse en una RTX 4090 o similar con la cuantización Q8_0 (7,22 GB) o Q4_K_M (4,98 GB), permitiendo prototipado rápido sin depender de APIs en la nube.
- Creación de contenido para redes sociales y marketing: con 8 pasos de inferencia y latencia sub-segundo en GPUs empresariales, es adecuado para generar variaciones de imágenes promocionales en lotes.
- Renderizado de carteles y banners con texto: la capacidad bilingüe inglés-chino permite generar imágenes con texto legible integrado, útil para materiales de marketing dirigidos a ambos mercados.
- Integración en pipelines de ComfyUI: al cargarse como `lumina2` mediante ComfyUI-GGUF, se puede combinar con nodos de posprocesado, upscaling o control de composición dentro de flujos de trabajo visuales.
- Aplicaciones de escritorio o edge computing: las cuantizaciones Q5_K_M (5,52 GB) y Q4_K_M (4,98 GB) permiten desplegar el modelo en equipos con GPUs de gama media o incluso en entornos con memoria limitada.
- Investigación en destilación de modelos de difusión: el modelo sirve como referencia para estudiar el compromiso entre precisión de cuantización (error RMS relativo del 0,50 % en Q8_0 frente a 4,7 % en Q4_K_M) y calidad de imagen generada.
- Generación rápida de borradores visuales en estudios de diseño: la baja latencia permite iterar sobre prompts en tiempo real durante sesiones creativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente métricas de fidelidad de cuantización (error RMS relativo de los pesos dequantizados frente a BF16), que se recogen en la tabla siguiente:

| Precision | Tamano | Error RMS relativo vs BF16 |
|---|---|---|
| F16 | 12,31 GB | 0,00000007 % (7,0e-10) |
| Q8_0 | 7,22 GB | 0,50 % |
| Q6_K | 5,91 GB | 1,6 % |
| Q5_K_M | 5,52 GB | 2,5 % |
| Q4_K_M | 4,98 GB | 4,7 % |

No se proporcionan puntuaciones de calidad de imagen (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el transformer de difusión en Q8_0 ocupa 7,22 GB y en Q4_K_M 4,98 GB; a ello hay que sumar el codificador de texto Qwen3-4B y el VAE de FLUX.1, que se cargan por separado.
- El modelo base declara caber en dispositivos de consumo con 16 GB de VRAM.
- GPU recomendadas: H800 para latencia sub-segundo según la model card original; RTX 4090 y GPUs con 16 GB o más para las cuantizaciones mayores; GPUs de gama media para Q4_K_M.
- Opciones de despliegue: stable-diffusion.cpp (runtime usado en el benchmark del autor, commit `465adf3`) y ComfyUI con ComfyUI-GGUF (cargado como `lumina2`).
- Latencia y throughput: se declara inferencia sub-segundo en H800 con 8 pasos; no se proporcionan cifras concretas de throughput para otras GPUs.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. La model card original menciona que Z-Image-Turbo "iguala o supera a los principales competidores" con solo 8 NFE, pero no identifica qué modelos concretos ni aporta cifras. Por tanto, la comparativa cuantitativa se considera no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Z-Image-Turbo (este, GGUF) | ~6B | no disponible | Apache-2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio solo contiene los pesos del transformer de difusión; el codificador de texto (Qwen3-4B) y el VAE (FLUX.1) deben descargarse por separado desde Comfy-Org/z_image_turbo, lo que añade pasos de configuración y requisitos de memoria adicionales.
- Las cuantizaciones bajas (Q5_K_M y Q4_K_M) introducen un error RMS relativo del 2,5 % y 4,7 % respectivamente, que puede degradar la calidad de imagen en comparación con BF16; la model card indica que las puntuaciones de calidad de imagen se añadirán a medida que cada precisión pase la evaluación.
- El modelo es una destilación con 8 pasos y CFG 1.0; desviarse de esta configuración (más pasos o CFG distinto) puede no producir mejoras y sí aumentar el coste.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones idiomáticas específicas más allá del bilingüismo inglés-chino declarado.
- La licencia Apache-2.0 permite uso comercial, pero los archivos son derivados del modelo original y heredan su licencia; conviene revisar la model card original para condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación independiente.
- No se dispone de información sobre el comportamiento del modelo con prompts en castellano; el soporte bilingüe declarado se limita a inglés y chino.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-ai/Z-Image-Turbo-GGUF
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Sitio oficial: https://tongyi-mai.github.io/Z-Image-blog/
- GitHub: https://github.com/Tongyi-MAI/Z-Image
- Demo online: https://huggingface.co/spaces/Tongyi-MAI/Z-Image-Turbo
- Demo móvil: https://huggingface.co/spaces/akhaliq/Z-Image-Turbo
- ModelScope (modelo): https://www.modelscope.cn/models/Tongyi-MAI/Z-Image-Turbo
- ModelScope (demo): https://www.modelscope.cn/aigc/imageGeneration?tab=advanced&versionId=469191&modelType=Checkpoint&sdVersion=Z_IMAGE_TURBO&modelUrl=modelscope%3A%2F%2FTongyi-MAI%2FZ-Image-Turbo%3Frevision%3Dmaster
- Galería de arte (PDF): assets/Z-Image-Gallery.pdf
- Galería web: https://modelscope.cn/studios/Tongyi-MAI/Z-Image-Gallery/summary
- Paper: https://arxiv.org/abs/2511.22699
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
