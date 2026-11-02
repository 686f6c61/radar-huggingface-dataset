# s1lent117/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo agente, publicado con pesos abiertos por Moonshot AI. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104 mil millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos de escala frontera (clase 3T). Incorpora una ventana de contexto de un millón de tokens y capacidades nativas de visión, incluyendo comprensión de imágenes y vídeo dentro del mismo modelo.

La arquitectura se apoya en dos innovaciones propias: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), combinadas con un marco de enrutamiento denominado Stable LatentMoE que activa 16 de 896 expertos por token. Según el autor, esto supone una mejora de eficiencia de escalado de aproximadamente 2,5 veces respecto a Kimi K2. El modelo está orientado a tareas de codificación de largo horizonte, trabajo de conocimiento agéntico y razonamiento complejo.

La relevancia de esta ficha radica en que se trata del primer modelo abierto de clase 3T, con pesos completos publicados bajo la licencia Kimi K3. El repositorio de HuggingFace ocupa 1561 GB y el pipeline declarado es image-text-to-text, lo que confirma el carácter multimodal del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parámetros totales | 2.779.931.837.184 (≈2,8T) |
| Parámetros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | 8-bit (según tags del repositorio); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license: other) |
| Formato de pesos | safetensors (con compressed-tensors y custom_code) |

## Arquitectura y entrenamiento

Kimi K3 es un transformer de tipo MoE con 93 capas (1 de ellas densa) y una composición de atención híbrida: 69 capas con Kimi Delta Attention (KDA) y 24 capas con Gated MLA (Multi-head Latent Attention con compuerta). La dimensión oculta de atención es de 7168 con 96 cabezas de atención. El bloque MoE utiliza una dimensión latente de 3584 y una dimensión oculta de 3072 por experto, con 896 expertos en total y 16 seleccionados por token. El marco Stable LatentMoE se presenta como la innovación de enrutamiento que permite escalar la dispersión del MoE manteniendo estabilidad en el entrenamiento.

El modelo incorpora capacidades multimodales nativas (texto, imagen y vídeo) dentro de la misma arquitectura, sin adaptadores externos según la model card. No se han proporcionado en la información disponible datos sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal más allá de KDA.

## Capacidades

- Generación de texto y razonamiento de propósito general.
- Codificación de largo horizonte: sesiones de ingeniería prolongadas, navegación de repositorios masivos y orquestación de herramientas de terminal.
- Capacidades multimodales nativas: comprensión de texto, imágenes y vídeo en un mismo modelo.
- Contexto de un millón de tokens, adecuado para documentos y bases de código extensas.
- Trabajo de conocimiento agéntico: investigación profunda con visualizaciones interactivas, widgets y paneles.
- Diseño de movimiento y edición de vídeo como parte de las capacidades declaradas.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque el enfoque agéntico y la orquestación de terminal lo sugieren.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Optimización de kernels de GPU: el modelo puede analizar y reescribir kernels CUDA o Triton en sesiones largas, manteniendo el contexto del repositorio completo gracias a su ventana de un millón de tokens.
- Desarrollo de compiladores: adecuado para tareas de ingeniería de largo recorrido donde se requiere razonamiento sobre grandes bases de código y múltiples iteraciones de compilación y prueba.
- Investigación profunda automatizada: generación de informes con visualizaciones interactivas, widgets y paneles a partir de fuentes extensas, aprovechando la multimodalidad para incorporar gráficos e imágenes.
- Edición y análisis de vídeo: comprensión de contenido audiovisual y apoyo a flujos de diseño de movimiento, gracias a la entrada nativa de vídeo.
- Diseño asistido por ordenador (CAD) y diseño de chips: la model card menciona explícitamente estos dominios como aplicaciones del modelo en entornos agénticos.
- Desarrollo de videojuegos con visión en el bucle: el modelo puede integrar capturas de pantalla en el proceso de desarrollo y ajustar código en consecuencia.
- Atención al cliente o asistentes conversacionales de contexto largo: no confirmado como caso oficial, pero viable por la ventana de contexto y el pipeline conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8T de parámetros totales, los pesos en 8 bits requieren aproximadamente 2,8 TB de memoria; en cuantizaciones más agresivas (4 bits) se reduciría a unos 1,4 TB, aunque no se confirman formatos GGUF en el repositorio.
- GPU recomendadas: despliegue multi-nodo con GPUs de centro de datos (H100, H200, B200) o clústeres de A100; no es viable en una sola GPU convencional.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 3090, etc.) por el tamaño del modelo.
- Opciones de despliegue: transformers con custom_code y compressed-tensors; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 104B | 1M | Kimi K3 License | Pesos abiertos en HuggingFace |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones específicas.
- Limitaciones de contexto o idioma: el contexto es de un millón de tokens, pero no se especifican los idiomas soportados ni posibles degradaciones en contextos muy largos.
- Restricciones de licencia: la licencia Kimi K3 License es de tipo "other"; es imprescindible revisar sus términos antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-02), lo que sugiere que podría tratarse de una réplica no oficial del modelo original de Moonshot AI; conviene verificar la procedencia antes de su uso en producción.
- El tamaño del repositorio (1561 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.
- No se confirman métodos de cuantización más allá de 8 bits, lo que limita las opciones de despliegue eficiente.

## Enlaces

- HuggingFace (réplica): https://huggingface.co/s1lent117/Kimi-K3
- Organización Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Repositorio oficial (referenciado): https://huggingface.co/moonshotai/Kimi-K3
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Chat: https://www.kimi.com
- Página principal: https://www.moonshot.ai
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
