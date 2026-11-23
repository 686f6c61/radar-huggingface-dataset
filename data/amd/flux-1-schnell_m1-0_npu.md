# amd/FLUX.1-schnell_m1.0_npu

## Resumen

FLUX.1-schnell_m1.0_npu es una adaptación del modelo de generación de imágenes por texto FLUX.1-schnell, optimizada por AMD para ejecutarse en procesadores Ryzen AI mediante NPU. El repositorio, publicado en Hugging Face bajo la organización amd, distribuye los pesos en formato ONNX y safetensors con cuantización orientada a hardware de AMD, de modo que los usuarios de portátiles y sobremesas con Ryzen AI puedan generar imágenes localmente sin depender de una GPU discreta de gama alta.

El modelo original FLUX.1-schnell es un modelo texto-a-imagen de destilación rápida desarrollado por Black Forest Labs, diseñado para generar imágenes en pocos pasos de inferencia. Esta variante de AMD resuelve el problema de la falta de soporte nativo de estos modelos en NPUs consumer, un nicho cada vez más relevante dado el auge de los Copilot+ PC y los aceleradores NPU integrados en los procesadores Ryzen AI.

El repositorio pesa aproximadamente 34,1 GB, está etiquetado con las tecnologías RyzenAI, ONNX y Quantization, y su acceso es restringido (gated): es necesario aceptar las condiciones de uso en Hugging Face antes de descargar los pesos. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FLUX.1-schnell (transformer de difusión texto-a-imagen); detalles específicos de la adaptación no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantización para NPU (detalles concretos no disponibles) |
| Idiomas soportados | en (prompts en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, safetensors |

## Arquitectura y entrenamiento

El modelo base, FLUX.1-schnell, es un modelo de difusión texto-a-imagen basado en una arquitectura transformer, destilado para funcionar en pocos pasos (típicamente de 1 a 4) manteniendo calidad de imagen razonable. Esta versión distribuida por AMD no es un reentrenamiento sino una conversión y cuantización de los pesos originales al formato ONNX, con optimizaciones específicas para el flujo de ejecución en NPU de los procesadores Ryzen AI (arquitectura XDNA de AMD).

No se dispone en la información proporcionada de detalles sobre el número de pasos de cuantización, la precisión exacta (INT8, INT4, FP16) empleada en cada bloque del modelo, ni sobre el dataset o proceso de entrenamiento del modelo base. Al tratarse de una adaptación de hardware, el entrenamiento corresponde al modelo original FLUX.1-schnell de Black Forest Labs, cuyos detalles no están incluidos en los metadatos del repositorio.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante inferencia en pocos pasos, heredada del modelo base schnell.
- Ejecución local en NPU de procesadores AMD Ryzen AI, sin necesidad de GPU dedicada.
- Pesos en formato ONNX compatibles con el stack de software Ryzen AI de AMD (ONNX Runtime con execution provider de NPU).
- Prompts en inglés (idioma etiquetado en el repositorio).
- Distribución con licencia Apache 2.0, que permite uso comercial, modificación y redistribución.

No hay información disponible sobre capacidades adicionales como edición de imágenes, image-to-image, control por condicionamientos estructurales (ControlNet) ni soporte de resoluciones concretas.

## Casos de uso

- Generación de imágenes en portátiles sin GPU dedicada: usuarios de portátiles con Ryzen AI pueden generar imágenes localmente aprovechando la NPU, sin consumir batería ni recursos de la GPU integrada en exceso.
- Prototipado de aplicaciones de generación de imágenes offline: herramientas de escritorio que necesiten generar ilustraciones, bocetos o assets sin conexión a internet ni coste de API.
- Privacidad en flujos creativos: estudios, despachos o creadores que no puedan enviar prompts a servicios en la nube pueden procesar todo en local.
- Integración en aplicaciones Windows con Ryzen AI: el formato ONNX facilita la integración en aplicaciones .NET o Python que usen ONNX Runtime y el Vitis AI Execution Provider de AMD.
- Generación por lotes de variaciones visuales: tareas como generar múltiples variantes de un concepto visual para brainstorming de diseño, aprovechando la rapidez del modelo destilado schnell.
- Educación y demostraciones de IA local: talleres y cursos que necesiten mostrar inferencia generativa en hardware consumer sin coste de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco se incluyen métricas de calidad de imagen (FID, CLIP score) ni tiempos de generación por resolución para la variante NPU.

## Requisitos de hardware

- Hardware obligatorio: procesador AMD Ryzen AI con NPU (arquitectura XDNA). El repositorio está específicamente etiquetado para RyzenAI, por lo que no está pensado para ejecución en GPU NVIDIA o CPU genérica sin adaptación.
- Almacenamiento: aproximadamente 34,1 GB de descarga para el repositorio completo, por lo que se recomienda disponer de al menos 40 GB libres.
- VRAM / memoria de NPU: no disponible; la asignación de memoria entre NPU, iGPU y RAM dependerá del flujo de ejecución de Ryzen AI Software.
- Software de despliegue: ONNX Runtime con el execution provider de NPU de AMD (Ryzen AI Software). No hay indicios de compatibilidad directa con llama.cpp, Ollama, vLLM o TGI, que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles; al ser un modelo destilado de pocos pasos, se espera inferencia rápida, pero AMD no publica cifras concretas en los metadatos del repositorio.
- Acceso: al ser un repositorio gated, es necesario iniciar sesión en Hugging Face y aceptar las condiciones antes de descargar.

## Comparativa con modelos similares

| Caracteristica | FLUX.1-schnell_m1.0_npu (AMD) | FLUX.1-schnell (Black Forest Labs) | Stable Diffusion XL |
|---|---|---|---|
| Tipo | Adaptación ONNX cuantizada para NPU | Modelo original texto-a-imagen | Modelo texto-a-imagen |
| Formato de pesos | ONNX, safetensors | safetensors / GGUF (comunidad) | safetensors |
| Destino hardware | NPU AMD Ryzen AI | GPU (NVIDIA/AMD) y CPU | GPU principalmente |
| Licencia | Apache 2.0 | Apache 2.0 | CreativeML Open RAIL++-M |
| Pasos de inferencia | no disponible | 1-4 pasos | 20-50 pasos |
| Acceso | Gated en Hugging Face | Abierto | Abierto |

La principal diferencia de esta variante frente al FLUX.1-schnell original no es de calidad sino de destino de ejecución: mientras el original está pensado para GPU, esta versión está cuantizada y empaquetada para NPU de Ryzen AI, sacrificando presumiblemente algo de fidelidad de imagen a cambio de ejecución en hardware integrado de bajo consumo.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, por lo que hay que aceptar condiciones en Hugging Face y autenticarse para descargar los pesos.
- Dependencia de hardware específico: está orientado a NPU de Ryzen AI; su uso en otras plataformas no está documentado y puede requerir conversiones adicionales.
- Idioma de los prompts: el modelo está etiquetado solo para inglés; prompts en español pueden producir resultados de calidad inferior o no coincidentes con la intención del usuario.
- Cuantización: la cuantización para NPU suele implicar pérdida de calidad respecto al modelo de precisión completa; no se publican métricas que cuantifiquen esa degradación.
- Sin benchmarks publicados: no hay datos oficiales de calidad o rendimiento para esta variante, por lo que conviene validar resultados antes de usarla en producción.
- Herencia del modelo base: posibles sesgos presentes en FLUX.1-schnell (representaciones estereotipadas en imágenes generadas, sesgos culturales del dataset de entrenamiento) se heredan en esta adaptación.
- Riesgo de generación de contenido inapropiado: como todo modelo texto-a-imagen, puede generar contenido ofensivo o engañoso; se recomienda aplicar filtros de contenido en aplicaciones orientadas a público general.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar también los términos de uso del modelo original FLUX.1 de Black Forest Labs que puedan aplicar al modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/amd/FLUX.1-schnell_m1.0_npu
- Organización de AMD en Hugging Face: https://huggingface.co/amd
- Modelo original FLUX.1-schnell (Black Forest Labs): https://huggingface.co/black-forest-labs/FLUX.1-schnell
- Documentación de Ryzen AI Software: https://ryzenai.docs.amd.com

No se han encontrado enlaces adicionales (papers, demos o entradas de blog) en la informacion disponible.
