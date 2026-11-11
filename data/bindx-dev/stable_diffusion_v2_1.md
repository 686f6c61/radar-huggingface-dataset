# bindx-dev/stable_diffusion_v2_1

## Resumen

BindX QNN context de Stable Diffusion 2.1 para Snapdragon 8 Elite (SM8750, Hexagon HTP v79). Se trata de una conversión de los pesos originales de Stability AI a binarios de contexto de QAIRT (Qualcomm AI Runtime 2.50.0.260828221209), empaquetados por el usuario bindx-dev. El paquete incluye tres binarios (`text_encoder.bin`, `unet.bin`, `vae.bin`) más metadatos de formas tensoriales y escalas de cuantización. Los pesos están cuantizados en W8A16, y tanto UNet como VAE se ejecutan en la NPU Hexagon, no en CPU.

El modelo subyacente es Stable Diffusion 2.1, un modelo de difusión latente text-to-image de aproximadamente 865 millones de parámetros en su UNet, con un text encoder OpenCLIP ViT-H/14 de 354 millones de parámetros y un VAE con decoder de 49 millones. La ventana de contexto del text encoder es de 77 tokens, lo que limita las descripciones textuales a ese máximo. Esta conversión no modifica el modelo original: solo lo recompila para inferencia en el acelerador neuronal de Qualcomm.

La relevancia de esta ficha es doble. Por un lado, documenta un intento de llevar difusión estable a hardware móvil Snapdragon mediante el stack QNN. Por otro, el propio autor advierte de que el cargador de BindX espera el nombre de grafo `stable_diffusion_v1_5_text_encoder` dentro del contexto del text encoder, y este binario de 2.1 no usa ese nombre, por lo que la suite curada no ofrece el paquete hasta que la carga funcione. Es decir, el artefacto está publicado pero no verificado como funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (UNet + text encoder OpenCLIP ViT-H/14 + VAE), compilada a contextos QNN |
| Parametros totales | No disponible en la información proporcionada (el modelo original SD 2.1 ronda los 1.200 M sumando UNet, text encoder y VAE) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 77 tokens (text encoder del modelo original) |
| Tipos de cuantizacion | W8A16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | No disponible (el prompt text encoder de OpenCLIP está entrenado principalmente en inglés) |
| Licencia | CreativeML OpenRAIL++-M |
| Formato de pesos | Binarios QNN context (`.bin`) + `metadata.json` + `bindx.json` |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 2.1 original: un autoencoder variacional (VAE) que comprime imágenes a un espacio latente de 4 canales y factor de reducción 8, un UNet con bloques residuales y atención cruzada que aplica el proceso de difusión denoising en ese espacio latente, y un text encoder basado en OpenCLIP ViT-H/14 que proyecta el prompt a embeddings de 1024 dimensiones. El sampler por defecto del modelo original es DDIM con 50 pasos, aunque admite otros schedulers. La resolución nativa es 512×512 y el modelo fue entrenado sobre el dataset LAION-5B filtrado, con un componente de clasificador libre de guía (CFG) que duplica el coste de inferencia por paso.

La conversión de BindX no reentrena ni ajusta el modelo: recompila los grafos a contextos QNN para el Hexagon HTP v79 del Snapdragon 8 Elite y cuantiza los pesos a 8 bits con escalas registradas en `metadata.json`. El text encoder, el UNet y el VAE se empaquetan como binarios separados. No se documenta en la información disponible ningún proceso de RLHF, DPO ni fine-tuning adicional sobre el modelo base. La innovación técnica aquí es exclusivamente de despliegue: ejecución del UNet y del VAE en NPU en lugar de CPU, lo que en teoría reduce latencia y consumo en dispositivos móviles, aunque el estado de carga reportado por el autor indica que esa ejecución aún no está validada.

## Capacidades

- Generación de imágenes text-to-image a 512×512 píxeles a partir de prompts en lenguaje natural.
- Edición y variaciones de imagen mediante img2img e inpainting, siempre que el pipeline QNN exponga esas operaciones (no confirmado en la información disponible).
- Generación condicionada por clasificador libre de guía (CFG), con escala configurable.
- Soporte de prompts negativos en el modelo original (no confirmado en esta conversión).
- Ejecución del UNet y del VAE en la NPU Hexagon del Snapdragon 8 Elite.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking. Es un modelo puramente generativo de imagen.
- Capacidades multilingües: no disponibles; el text encoder OpenCLIP ViT-H/14 está entrenado principalmente en inglés y la información proporcionada no detalla otros idiomas.

## Casos de uso

- Generación de imágenes en dispositivos móviles Snapdragon 8 Elite: el paquete está compilado específicamente para el HTP v79 de esa plataforma, de modo que una aplicación Android podría invocar el UNet y el VAE en NPU en lugar de CPU, reduciendo consumo y latencia frente a una ejecución puramente en CPU. Requiere que el cargador de BindX resuelva el problema de nombre de grafo documentado por el autor.
- Prototipado de pipelines de difusión en hardware Qualcomm: útil para equipos que evalúan el stack QAIRT 2.50.0 y quieren medir el rendimiento de un UNet de SD 2.1 cuantizado en W8A16 sobre Hexagon, antes de invertir en conversiones propias.
- Investigación sobre cuantización W8A16 en modelos de difusión: los archivos `metadata.json` registran formas tensoriales y escalas de cuantización, lo que permite estudiar la degradación de calidad frente a los pesos fp16 originales en un hardware concreto.
- Generación de imágenes offline en entornos sin conectividad: al ejecutarse localmente en el dispositivo, no requiere llamadas a APIs externas, lo que encaja en escenarios de privacidad o campo.
- Base para conversiones derivadas: el paquete sirve como referencia de empaquetado (tres contextos separados, metadatos y `bindx.json`) para quien quiera portar otros modelos de difusión al runtime de Qualcomm.
- Evaluación comparativa de backends móviles: permite contrastar el rendimiento de QNN/Hexagon frente a otras rutas de despliegue móvil (por ejemplo, ejecución en CPU con GGUF o en GPU Adreno) usando el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta latencia, throughput, FID, CLIP score ni comparaciones numéricas con otras conversiones. Tampoco se documenta el estado de carga como exitoso, por lo que no hay métricas de inferencia verificadas.

## Requisitos de hardware

- Plataforma objetivo: Snapdragon 8 Elite (SM8750) con Hexagon HTP v79. El paquete está compilado para ese acelerador concreto y no es portable a otros SoC sin recompilación.
- Runtime: Qualcomm AI Runtime (QAIRT) 2.50.0.260828221209, más el cargador de BindX.
- VRAM/RAM: no disponible. El repositorio ocupa 1,4 GB, lo que da una cota inferior del espacio de almacenamiento necesario; el consumo en memoria durante la inferencia no está documentado.
- GPU de escritorio: no aplica. Estos binarios no están pensados para A100, H100 ni RTX 4090; para esos entornos debe usarse el modelo original `stabilityai/stable-diffusion-2-1` en formato safetensors o una conversión a GGUF/Diffusers.
- Despliegue: exclusivamente mediante el stack QNN de Qualcomm y el cargador de BindX. No compatible con vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje y no soportan contextos QNN de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (tokens) | Resolucion | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| bindx-dev/stable_diffusion_v2_1 (esta ficha) | No disponible (base SD 2.1) | 77 | 512×512 | CreativeML OpenRAIL++-M | Binarios QNN para Hexagon HTP v79 |
| stabilityai/stable-diffusion-2-1 | ~1.200 M en total | 77 | 512×512 | CreativeML OpenRAIL++-M | Safetensors, Diffusers |
| stabilityai/stable-diffusion-1-5 | ~980 M en total | 77 | 512×512 | CreativeML OpenRAIL-M | Safetensors, Diffusers, GGUF |
| stabilityai/sdxl-turbo | ~3.500 M en total | 77 | 512×512 | OpenRAIL++-M | Safetensors, Diffusers |

La comparación relevante es con el modelo original: esta conversión no añade capacidades, solo cambia el backend de ejecución. Frente a SD 1.5, SD 2.1 usa un text encoder más grande (OpenCLIP ViT-H/14 frente a ViT-L/14) y mejoró la calidad en resoluciones altas, a costa de mayor coste computacional. SDXL-Turbo ofrece generación en pocos pasos y mayor resolución, pero con un modelo mucho más pesado, poco adecuado para NPU móvil de gama actual. No se dispone de datos de rendimiento comparado para esta conversión concreta.

## Limitaciones y advertencias

- Estado de carga no validado: el propio autor indica que el cargador de BindX busca el grafo `stable_diffusion_v1_5_text_encoder` y este binario de 2.1 no lo usa, por lo que la suite curada no ofrece el paquete. No hay confirmación de que la inferencia funcione de extremo a extremo.
- Licencia OpenRAIL++-M con restricciones de uso: prohíbe generar contenido ilegal o dañino de forma deliberada y exige redistribuir las mismas restricciones junto con el archivo `LICENSE`. El uso comercial está permitido bajo esas condiciones, pero conviene revisar la cláusula 7 acortada de OpenRAIL++-M.
- Enlace de licencia roto: el autor señala que la URL raw de Stability AI devolvía 404 el 2026-11-11; la referencia válida es la página del repositorio de Stability AI.
- Sesgos del modelo base: SD 2.1 hereda los sesgos de LAION-5B en representación de personas, profesiones y culturas. No se documenta ningún proceso de mitigación en esta conversión.
- Alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible y composiciones incoherentes, especialmente con prompts complejos o con múltiples sujetos.
- Límite de 77 tokens en el prompt: descripciones largas se truncan, lo que restringe el control fino sobre la imagen.
- Idiomas: no hay información sobre soporte multilingüe; se espera un rendimiento notablemente inferior en prompts que no estén en inglés.
- Portabilidad nula: los binarios están atados al SM8750 y a QAIRT 2.50.0.260828221209; no funcionan en otros Snapdragon ni en GPU de escritorio.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Responsabilidad de uso: el autor original no reclama derechos sobre las imágenes generadas, pero el usuario es responsable de cómo las utiliza.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bindx-dev/stable_diffusion_v2_1
- Modelo original: https://huggingface.co/stabilityai/stable-diffusion-2-1
- Repositorio de Stability AI (incluye LICENSE-MODEL): https://github.com/Stability-AI/stablediffusion
- Licencia del modelo original: https://github.com/Stability-AI/stablediffusion/blob/main/LICENSE-MODEL
