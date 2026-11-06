# ryugyosoft/Z-Image-Turbo-onwx-npu

## Resumen

Z-Image-Turbo-onwx-npu es una conversión del modelo de difusión texto-a-imagen Z-Image-Turbo (desarrollado por Tongyi-MAI, Alibaba) para ejecutarse sobre la NPU XDNA2 de los PC con AMD Ryzen AI. No se trata de un checkpoint de diffusers al uso: el autor, ryugyosoft, ha reempaquetado los pesos del transformer DiT y del codificador de texto en el formato que consumen los kernels NPU de su aplicación onwx-Image, con cuantización int8 de las capas lineales y una rotación Hadamard de ancho 256 plegada para la cuantización de activaciones.

El objetivo es doble: reducir el tamaño de descarga de unos 31 GB (modelo original) a unos 11 GB, y evitar que cada equipo tenga que reconvertir el modelo en local. El repositorio incluye los 34 bloques del DiT con pesos int8 teselados para las GEMM de la NPU, los embedders y capa final en float32, las primeras 35 capas Qwen3 del codificador de texto y los componentes VAE, tokenizer y scheduler sin modificar.

Es relevante porque ejemplifica la tendencia a llevar modelos generativos de imagen a aceleradores de borde (NPU integradas en portátiles), un nicho donde el ecosistema de herramientas aún es incipiente y donde optimizaciones como la cuantización int8 con rotaciones ortogonales marcan la diferencia entre poder ejecutar el modelo o no. La licencia Apache 2.0 del original se mantiene.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con codificador de texto Qwen3 y VAE; empaquetado para NPU XDNA2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 en capas lineales del DiT y del codificador de texto (una escala por matriz); float32 en normas, escalas y modulación; bf16 en la tabla de embeddings |
| Idiomas soportados | ja, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + JSON de layout (`onwx-npu.json`, formato `onwx-image-npu`); no es un checkpoint de diffusers |

## Arquitectura y entrenamiento

El modelo base Z-Image-Turbo es un modelo de difusión texto-a-imagen con un transformer DiT de 34 bloques y un codificador de texto basado en Qwen3 (36 capas, de las que se usan las 35 primeras). Esta conversión no reentrena nada: transforma los pesos originales para que encajen en el layout de kernels NPU de onwx-Image. Las innovaciones técnicas de la conversión son: multiplicación de cada matriz de pesos por una rotación Hadamard de ancho 256 (plegada para la cuantización de activaciones de la NPU), cuantización int8 con una escala por matriz, reordenación al layout de teselas de las GEMM de la NPU, reordenación de dimensiones por cabeza de atención y rebalanceo de pesos q/k norm por par de rotación en el codificador de texto, y repetición de k/v para atención de query agrupada (GQA).

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si el modelo base usó RLHF/DPO. El informe técnico del modelo original está referenciado como arXiv:2511.22699.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Soporte de prompts en japonés e inglés.
- Ejecución sobre NPU XDNA2 de AMD Ryzen AI mediante la aplicación onwx-Image.
- Inferencia con pesos int8 en las capas lineales, lo que reduce el uso de memoria frente al modelo original.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta edición de imagen, inpainting ni otras tareas distintas de la generación texto-a-imagen.

## Casos de uso

- Generación de ilustraciones en portátiles con Ryzen AI: el modelo se ejecuta en la NPU integrada, liberando la GPU y la CPU para otras tareas y permitiendo crear imágenes sin conexión a servicios en la nube.
- Prototipado de assets para videojuegos o diseño gráfico: con prompts en inglés o japonés se pueden generar bocetos y variaciones rápidas en local, con un tamaño de descarga de 11 GB frente a los 31 GB del original.
- Aplicaciones de escritorio con privacidad por diseño: al ejecutarse íntegramente en el equipo, los prompts y las imágenes no salen del dispositivo, lo que encaja en entornos con requisitos de confidencialidad.
- Demostraciones y talleres sobre IA en el borde: sirve para mostrar el funcionamiento de modelos de difusión sobre NPU XDNA2 y comparar el rendimiento con implementaciones en GPU.
- Generación de contenido para marketing localizado: el soporte de japonés e inglés permite crear material gráfico para mercados concretos sin depender de APIs externas.
- Investigación en cuantización y despliegue en aceleradores heterogéneos: el repositorio documenta el layout, las rotaciones Hadamard y la cuantización int8, lo que facilita reproducir y analizar la técnica en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU: AMD XDNA2 integrada en procesadores AMD Ryzen AI (requisito explícito del formato de kernels).
- VRAM/RAM: no disponible; el repositorio ocupa 11,6 GB, por lo que se necesita al menos ese espacio en disco y memoria suficiente para cargar los bloques durante la inferencia.
- GPU dedicada: no es necesaria; el modelo está pensado para ejecutarse en la NPU, no en GPU.
- Despliegue: exclusivamente mediante la aplicación onwx-Image (no compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un checkpoint de diffusers).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Z-Image-Turbo-onwx-npu | no disponible | no disponible | Apache 2.0 | Hugging Face (repo de 11,6 GB) | Conversión int8 para NPU XDNA2; solo vía onwx-Image |
| Tongyi-MAI/Z-Image-Turbo (original) | no disponible | no disponible | Apache 2.0 | Hugging Face (unos 31 GB) | Checkpoint de diffusers; requiere conversión para NPU |
| Alternativas de difusión texto-a-imagen de propósito general | no disponible | no disponible | variable | Hugging Face | No se dispone de datos comparativos de rendimiento en la información proporcionada |

## Limitaciones y advertencias

- El modelo solo funciona con la aplicación onwx-Image y sobre NPU XDNA2 de AMD Ryzen AI; no es un checkpoint de diffusers y no se puede cargar con las herramientas habituales.
- La cuantización int8 con una única escala por matriz puede introducir degradación en la calidad de imagen frente al modelo original en float16/bf16; no se documentan métricas de fidelidad.
- Solo se declaran los idiomas japonés e inglés; el rendimiento en otros idiomas no está garantizado.
- Riesgo de sesgos y de alucinación visual heredado del modelo base y de sus datos de entrenamiento, no documentado en esta conversión.
- La licencia Apache 2.0 permite uso comercial, pero se deben mantener los avisos de atribución a Tongyi-MAI (Alibaba) y al autor de la conversión.
- El tag `layout-<n>` indica que la versión de onwx-Image debe coincidir con el layout de almacenamiento; una actualización de la aplicación puede requerir descargar otra versión del repositorio.
- No se documentan límites de resolución, pasos de muestreo ni parámetros de generación en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ryugyosoft/Z-Image-Turbo-onwx-npu
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Aplicación onwx-Image: https://huggingface.co/ryugyosoft/onwx-image
- Informe técnico del modelo original: https://arxiv.org/abs/2511.22699
