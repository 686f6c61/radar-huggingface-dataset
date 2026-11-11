# gogapro/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo agéntico, publicado con pesos abiertos por Moonshot AI. Con 2,8 billones de parámetros totales y 104.000 millones activados por token, se presenta como el primer modelo abierto de la clase de 3 billones de parámetros. Está construido sobre una arquitectura Mixture-of-Experts (MoE) con dos innovaciones propias: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), además de un marco Stable LatentMoE que activa 16 de 896 expertos por token.

El modelo resuelve el problema de dotar a un sistema abierto de capacidades de razonamiento de horizonte largo, trabajo de conocimiento agéntico y codificación sostenida sobre repositorios masivos, con una ventana de contexto de un millón de tokens y comprensión nativa de texto, imagen y vídeo dentro del mismo modelo. Frente a Kimi K2, el autor declara una mejora de aproximadamente 2,5 veces en eficiencia de escalado.

La relevancia actual reside en la publicación de los pesos completos bajo la licencia Kimi K3, lo que permite investigación, despliegue y desarrollo posterior sobre un modelo de frontera. El repositorio de Hugging Face analizado (`gogapro/Kimi-K3`) es un espejo de 1.561 GB en formato safetensors de 8 bits con `compressed-tensors`, orientado a `transformers` y con pipeline `image-text-to-text`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2,8 billones (2.779.931.837.184 según safetensors) |
| Parametros activos | 104.000 millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Pesos publicados en 8 bits (compressed-tensors); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license: other) |
| Formato de pesos | safetensors (8 bits, compressed-tensors) |

Datos arquitectónicos adicionales: 93 capas (1 densa), composición de atención de 69 capas KDA y 24 capas Gated MLA, dimensión oculta de atención de 7.168, 96 cabezas de atención, dimensión latente MoE de 3.584, dimensión oculta MoE por experto de 3.072 y 896 expertos con 16 seleccionados por token.

## Arquitectura y entrenamiento

Kimi K3 emplea un transformer MoE con atención híbrida: 69 capas usan Kimi Delta Attention (KDA) y 24 capas usan Gated MLA (Multi-head Latent Attention con compuerta). La sparsity MoE se amplía mediante el marco Stable LatentMoE, que selecciona 16 de 896 expertos por token sobre una dimensión latente de 3.584, con una dimensión oculta de 3.072 por experto. El modelo incorpora además Attention Residuals (AttnRes) como mecanismo de conexión residual específico. La multimodalidad es nativa: el mismo modelo procesa texto, imagen y vídeo.

El autor declara una mejora de aproximadamente 2,5 veces en eficiencia de escalado global respecto a Kimi K2. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de horizonte largo.
- Codificación sostenida: sesiones de ingeniería prolongadas con supervisión humana mínima, navegación de repositorios masivos y orquestación de herramientas de terminal.
- Trabajo de conocimiento agéntico: investigación profunda con visualizaciones interactivas, widgets y paneles, además de diseño de movimiento y edición de vídeo.
- Multimodalidad nativa: comprensión de texto, imágenes y vídeo en un único modelo.
- Contexto de un millón de tokens para documentos y bases de código extensas.
- Casos avanzados citados por el autor: optimización de kernels de GPU, desarrollo de compiladores, desarrollo de videojuegos con visión en el bucle, CAD y diseño de chips.
- Soporte de tool calling y razonamiento multi-paso: no se detalla explícitamente en la información disponible, aunque la orientación agéntica del modelo lo sugiere.
- Capacidades multilingües: no disponible.

## Casos de uso

- Ingeniería de software sobre repositorios grandes: el modelo puede recorrer y razonar sobre bases de código que superan el millón de tokens, manteniendo coherencia entre módulos y orquestando comandos de terminal para tareas de refactorización o migración.
- Optimización de kernels y código de bajo nivel: con contexto largo y razonamiento sostenido, resulta adecuado para iterar sobre kernels de GPU o componentes de compiladores donde cada cambio exige analizar grandes volúmenes de código y trazas.
- Investigación profunda automatizada: generación de informes con visualizaciones interactivas, widgets y paneles a partir de fuentes extensas, aprovechando la ventana de un millón de tokens para no fragmentar el contexto.
- Análisis de vídeo e imagen en pipelines de contenido: al ser multimodal nativo, puede describir, resumir y extraer información de vídeo junto con texto en la misma sesión, útil para moderación o catalogación de medios.
- Diseño asistido (CAD y chips): el autor cita explícitamente estos escenarios; el modelo puede asistir en la generación y revisión de especificaciones técnicas y planos con visión en el bucle.
- Edición y diseño de movimiento: generación de guiones, secuencias y parámetros para herramientas de edición de vídeo, apoyándose en la comprensión multimodal del material de origen.
- Agentes autónomos de larga duración: tareas de múltiples pasos con supervisión humana mínima, donde el contexto extendido evita la pérdida de estado entre iteraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados en 8 bits ocupan aproximadamente 1,5 TB (tamaño del repositorio: 1.561 GB), por lo que la inferencia requiere un clúster multi-GPU; no cabe en una sola GPU.
- GPU recomendadas: no disponible en la información proporcionada; por el volumen de pesos, se necesitan nodos con múltiples aceleradores de memoria alta (clase H100/H200 o superior). No se confirma una configuración concreta.
- GPU de consumo: no es viable en ninguna GPU consumer (RTX 4090 u otras) por el tamaño de los pesos.
- Opciones de despliegue: el repositorio está orientado a `transformers`; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8 B (billones) | 104.000 M | 1.000.000 tokens | Kimi K3 License | Pesos abiertos en HF |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clase 3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con Kimi K2, del que únicamente se indica que K3 mejora su eficiencia de escalado en aproximadamente 2,5 veces. No se dispone de datos de otros modelos comparables de la misma clase.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no se documenta en la información disponible; como modelo generativo de gran escala, es un riesgo inherente que debe mitigarse en producción.
- Limitaciones de contexto o idioma: la ventana es de un millón de tokens, pero no se detallan los idiomas soportados ni su calidad relativa.
- Restricciones de licencia: la licencia Kimi K3 License (license: other) no se detalla en la información disponible; es imprescindible revisar el texto completo antes de un uso comercial.
- El repositorio analizado (`gogapro/Kimi-K3`) es un espejo de un tercero, no el repositorio oficial de Moonshot AI; conviene verificar la integridad y procedencia de los pesos antes de desplegarlos.
- El formato de pesos en 8 bits con `compressed-tensors` y `custom_code` implica dependencias específicas de `transformers` y posibles incompatibilidades con otros runners.
- El tamaño de 1,5 TB de pesos condiciona fuertemente la infraestructura y el coste de despliegue.

## Enlaces

- Repositorio analizado: https://huggingface.co/gogapro/Kimi-K3
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Chat: https://www.kimi.com
- Página de Moonshot AI: https://www.moonshot.ai
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio en GitHub: https://github.com/MoonshotAI/Kimi-K3
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Twitter/X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
