# hsmfdev/MIndLarp-Dev-1

## Resumen

MIndLarp-Dev-1 es un checkpoint publicado en Hugging Face por el usuario hsmfdev (Suharigram) que, según los metadatos y la model card incluida, corresponde a una adaptación o reempaquetado de Kimi K3.1 Pro, el modelo multimodal agéntico de tipo Mixture-of-Experts desarrollado por Moonshot AI. El repositorio declara 2,78 billones de parámetros totales en formato safetensors, con 104.000 millones de parámetros activos por token, una arquitectura de 93 capas y una ventana de contexto de hasta un millón de tokens. La licencia registrada es "kimi-k3.1-pro" (etiquetada como `other`), y el pipeline declarado es `image-text-to-text`, lo que confirma su naturaleza nativamente multimodal.

El interés técnico del modelo reside en su composición de atención híbrida: 69 capas con KDA (Kimi Delta Attention, una variante de atención lineal) y 24 capas con Gated DSA (DeepSeek Sparse Attention con compuerta), lo que reduce el coste computacional en contextos muy largos. El MoE utiliza 896 expertos enrutados más 2 expertos compartidos, seleccionando 16 expertos por token, con una dimensión latente de 3584 y una dimensión oculta por experto de 3072. El vocabulario es de 160.000 tokens.

No obstante, conviene ser cauto: el repositorio no presenta descargas ni interacciones, el autor figura como estudiante y el nombre del modelo ("MIndLarp-Dev-1") no coincide con la nomenclatura oficial de Moonshot AI. La model card parece copiada de la ficha oficial de Kimi K3.1 Pro, por lo que los datos de arquitectura deben atribuirse al modelo original y no necesariamente a este checkpoint concreto, cuya relación exacta con los pesos oficiales no está verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida KDA + Gated DSA |
| Parametros totales | 2.780.110.363.392 (2,78 T) |
| Parametros activos | 104 B por token |
| Longitud de contexto | 1.000.000 tokens (según model card) |
| Tipos de cuantizacion | 8-bit (tag `8-bit`, `compressed-tensors`); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (`license: other`) |
| Formato de pesos | safetensors (con `compressed-tensors`), compatible con transformers |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un transformer MoE de 93 capas (1 capa densa y el resto con expertos), dimensión de atención de 7168 y 96 cabezas de atención. La innovación principal es la composición híbrida de capas de atención: 69 capas usan KDA (atención lineal con estado recurrente) y 24 usan Gated DSA, una atención dispersa con índice top-k de 2048 y 32 cabezas de índice de dimensión 128. Esta combinación busca mantener calidad en contexto largo reduciendo el coste cuadrático de la atención densa. El bloque MoE emplea 896 expertos con selección top-16 más 2 expertos compartidos, sobre una dimensión latente de 3584.

Según la model card, Kimi K3.1 Pro se obtiene mediante post-entrenamiento a partir de Kimi K3 con aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición del dataset ni los detalles del pipeline de RLHF/DPO. Tampoco se documenta si este checkpoint concreto (MIndLarp-Dev-1) ha sido sometido a ajuste adicional, poda o cuantización más allá de la etiqueta `8-bit` y `compressed-tensors`.

## Capacidades

- Generación de texto y razonamiento multi-paso en contextos de hasta un millón de tokens.
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), lo que habilita tareas de visión-lenguaje.
- Capacidades de codificación y creación 3D mencionadas explícitamente en la model card.
- Investigación financiera y tareas de precisión factual, según la descripción del autor.
- Comportamiento agéntico: la model card describe el modelo como "agentic model" entrenado con RL en dominios downstream.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con la librería `transformers`.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo "thinking" o razonamiento extendido: no confirmado en la información disponible.

## Casos de uso

- Análisis de documentación extensa: gracias a la ventana de un millón de tokens y a la atención híbrida KDA/DSA, el modelo puede ingerir contratos, informes anuales o bases de código completas en una sola pasada sin truncamiento.
- Investigación financiera asistida: la model card cita mejoras en research financiero; se usaría para resumir informes, extraer métricas y cruzar datos entre documentos largos.
- Generación de código en pipelines: con 104 B de parámetros activos y contexto masivo, es adecuado para tareas de refactorización multiarchivo y revisión de repositorios completos.
- Creación 3D y flujos multimodales: al ser nativamente image-text-to-text, puede integrarse en herramientas que reciben bocetos o capturas y generan descripciones estructuradas o código de escena.
- Agentes autónomos de larga duración: su entrenamiento con RL en dominios downstream y su contexto extendido lo orientan a tareas con muchas iteraciones y estado acumulado.
- Asistentes conversacionales multimodales: el tag `conversational` y el pipeline image-text-to-text permiten desplegarlo en interfaces de chat que aceptan imágenes y texto.
- Procesamiento por lotes de documentos escaneados: combinación de OCR implícito (visión) y razonamiento sobre el texto extraído en una sola llamada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,78 T de parámetros, en BF16 serían necesarios aproximadamente 5,5 TB de memoria; incluso en 8-bit (formato declarado en el repo) se superan los 2,7 TB. El tamaño del repositorio es de 1561,4 GB, lo que sugiere pesos ya comprimidos.
- GPU recomendadas: no es desplegable en una sola GPU convencional. Requiere clústeres multi-nodo con GPUs de centro de datos (H100, H200, B200) y paralelismo tensor/pipeline, o bien inferencia en CPU con offloading masivo (muy lenta).
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 3090, etc.) ni en configuraciones multi-GPU domésticas.
- Opciones de despliegue: transformers (declarado), con soporte de `compressed-tensors`; compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible. Dado el tamaño, llama.cpp y Ollama no son viables en la práctica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIndLarp-Dev-1 (este repo) | 2,78 T | 104 B | 1 M | kimi-k3.1-pro (`other`) | Hugging Face, 0 descargas |
| Kimi K3.1 Pro (Moonshot AI) | 2,8 T | 104 B | 1 M | kimi-k3.1-pro | Hugging Face oficial de Moonshot AI |
| Kimi K3 (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face de Moonshot AI |

La comparación con otras familias (DeepSeek, Qwen, Llama) no está disponible en la información proporcionada, ya que no se aportan datos de arquitectura ni benchmarks de esos modelos.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y el autor figura como estudiante; no hay evidencia de validación por parte de la comunidad ni de Moonshot AI.
- La model card parece una copia de la ficha oficial de Kimi K3.1 Pro; los datos de arquitectura y capacidades describen el modelo original, no necesariamente este checkpoint.
- El nombre del modelo no sigue la convención oficial de Moonshot AI, lo que genera dudas sobre su procedencia y sobre si los pesos son idénticos a los oficiales.
- Licencia `other` con nombre "kimi-k3.1-pro": es imprescindible revisar los términos del fichero LICENSE original antes de cualquier uso comercial; no se detallan restricciones en la información disponible.
- Riesgo de alucinación inherente a modelos de lenguaje de gran escala; no se aportan evaluaciones de factualidad específicas para este checkpoint.
- Idiomas soportados no declarados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés.
- El tamaño (1,5 TB de repositorio, 2,78 T de parámetros) hace inviable el despliegue en infraestructura convencional y encarece cualquier experimento.
- No se confirma soporte de tool calling, modo thinking ni cuantizaciones más allá de 8-bit.
- Fecha de creación futura (2026-11-06) en los metadatos: posible error de registro o repositorio de prueba.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hsmfdev/MIndLarp-Dev-1
- Perfil del autor: https://huggingface.co/hsmfdev
- Página oficial de Kimi (referenciada en la model card): https://www.kimi.ai
- Homepage de Moonshot AI: https://www.moonshot.ai
- Organización Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Blog técnico de Kimi K3.1 Pro: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Discord de Kimi.ai: https://discord.gg/TYU2fdJykW
- ModelScope de Moonshot AI: https://modelscope.cn/organization/moonshotai
