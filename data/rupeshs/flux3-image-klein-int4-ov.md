# rupeshs/flux3-image-klein-int4-ov

## Resumen

FLUX.3 Image Klein 4-step OpenVINO INT4 es una conversión no oficial del modelo de difusión FLUX.3 Image Klein Base de Black Forest Labs, publicada por el usuario rupeshs. Se trata de los pesos base con la LoRA de destilación a 4 pasos de Muinez fusionada, convertidos a OpenVINO IR y comprimidos a INT4 para inferencia rápida en CPU. El paquete completo ocupa 5,6 GB frente a los 20,5 GB de los pesos originales, lo que permite ejecutar generación y edición de imágenes en equipos sin GPU dedicada.

El modelo conserva la arquitectura de difusión completa: un transformer de difusión (DiT) de 5,6B parámetros, un codificador de texto Qwen3-VL-4B truncado a las capas 1-32 y los codificadores/decodificadores VAE. Soporta text-to-image y edición de imágenes con hasta 10 imágenes de referencia. La destilación a 4 pasos con CFG 1 reduce la inferencia a cuatro pasadas condicionales con el sampler Euler y shift 3, sin prompt negativo.

Su relevancia es práctica: demuestra que un modelo de la familia FLUX.3 puede llevarse a hardware de consumo o servidores sin acelerador mediante cuantización INT4 con NNCF y el runtime de OpenVINO. Al ser una conversión comunitaria recién publicada (25 de octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta), no cuenta con validación por parte de Black Forest Labs ni con evaluaciones publicadas de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) + codificador de texto Qwen3-VL-4B (capas 1-32) + VAE |
| Parámetros totales | No disponible como cifra única; el DiT tiene 5,6B y el codificador de texto es Qwen3-VL-4B truncado |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no se documenta ventana de contexto textual) |
| Tipos de cuantización | INT4 simétrico con grupo 64 (DiT), INT4 simétrico con grupo 128 (codificador de texto), FP16 (VAE encoder y decoder) |
| Idiomas soportados | No disponible |
| Licencia | flux-kommunity-license (etiquetada como "other") |
| Formato de pesos | OpenVINO IR (.xml + .bin); los pesos originales están en safetensors |

Desglose de componentes y tamaños, según el autor:

| Componente | Precisión | Tamaño |
|---|---|---|
| DiT (5,6B) con LoRA de 4 pasos fusionada | INT4 simétrico, grupo 64 | 3,37 GB |
| Codificador de texto (Qwen3-VL-4B, capas 1-32) | INT4 simétrico, grupo 128 | 2,07 GB |
| Decodificador VAE | FP16 | 0,10 GB |
| Codificador VAE (para edición) | FP16 | 0,07 GB |
| **Total** | | **5,6 GB** |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de FLUX.3 Image Klein Base: un transformer de difusión de 5,6B parámetros que opera sobre latentes del VAE y se condiciona mediante un codificador de texto multimodal Qwen3-VL-4B. En esta conversión, el codificador de texto se ha truncado a las capas 1-32 y cuantizado a INT4, mientras que el DiT se ha comprimido a INT4 con granularidad de grupo 64. Los VAE se mantienen en FP16 para preservar la fidelidad de reconstrucción.

Sobre los datos de entrenamiento no hay información en la documentación disponible: no se especifican número de tokens, composición del dataset ni si hubo etapas de RLHF o DPO. Lo que sí está documentado es el post-entrenamiento aplicado por la comunidad: una LoRA de destilación (Muinez/flux3-klein-distil-4step) fusionada en los pesos del DiT, que permite reducir el muestreo a 4 pasos Euler con shift 3 y CFG 1. Con CFG 1 se ejecuta una sola pasada condicional por paso y no se admite prompt negativo, lo que abarata el coste computacional a costa de control fino sobre el resultado.

La innovación técnica principal de esta ficha no está en el modelo, sino en el pipeline de compresión: conversión a OpenVINO IR y cuantización INT4 con NNCF, empaquetando un modelo de 20,5 GB en 5,6 GB sin cambiar la topología. La edición con hasta 10 imágenes de referencia se apoya en el codificador VAE FP16 incluido.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con el pipeline declarado en la model card.
- Edición de imágenes con hasta 10 imágenes de referencia, usando el codificador VAE incluido en el paquete.
- Muestreo rápido en 4 pasos Euler con shift 3 y CFG 1, heredado de la LoRA de destilación.
- Inferencia en CPU mediante OpenVINO, sin necesidad de GPU dedicada.
- Ejecución totalmente local y offline una vez descargado el repositorio de 5,6 GB.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión comprensiva, audio ni modo "thinking": es un modelo generativo de imagen, no un LLM conversacional.
- Cobertura multilingüe: no disponible en la información proporcionada (el codificador Qwen3-VL es de origen multilingüe, pero la model card no documenta idiomas soportados ni calidad por idioma).

## Casos de uso

- Generación de imágenes en portátiles sin GPU: los 5,6 GB de pesos INT4 permiten ejecutar el modelo con el runtime de OpenVINO en CPU, útil para prototipado y demos en equipos de desarrollo convencionales.
- Edición con múltiples referencias para e-commerce: las hasta 10 imágenes de referencia permiten componer un producto en distintos contextos (fondos, iluminación, ángulos) manteniendo la identidad visual del artículo.
- Procesamiento por lotes en infraestructura CPU: al no requerir acelerador, se puede escalar horizontalmente con contenedores en servidores existentes para generar variaciones de creatividades publicitarias.
- Flujos con requisitos de privacidad: al ejecutarse en local y sin llamadas a API externas, encaja en entornos donde las imágenes no pueden salir de la infraestructura propia (sanidad, banca, sector público).
- Integración en aplicaciones de escritorio: el formato OpenVINO IR y el tamaño contenido facilitan empaquetar la generación de imágenes dentro de herramientas de diseño o utilidades ofimáticas distribuidas a usuarios finales.
- Iteración rápida de conceptos de diseño: con 4 pasos de muestreo y sin CFG doble, el ciclo de prueba-error es más corto que con samplers de 20-50 pasos, adecuado para explorar bocetos y variaciones de estilo.
- Automatización de tareas de retoque asistido: el modo edición permite aplicar transformaciones guiadas por prompt sobre imágenes existentes dentro de pipelines de producción de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (FID, CLIP score, GenEval ni evaluaciones humanas), ni comparaciones con el modelo base sin destilar, ni mediciones de latencia o throughput en CPU. Tampoco hay datos de benchmarks en los resultados de búsqueda web consultados, que no devolvieron información relevante sobre el modelo.

## Requisitos de hardware

- Almacenamiento: 5,6 GB para los pesos OpenVINO IR, más espacio temporal durante la conversión o la carga.
- Memoria del sistema: no documentada; como referencia de orden de magnitud, se recomienda un mínimo de 8 GB de RAM y 16 GB para trabajar con comodidad junto al resto del sistema, dado el tamaño de los pesos y las activaciones.
- VRAM: no aplica para el caso de uso principal (CPU). Si se ejecuta con el plugin de GPU de OpenVINO sobre gráficos integrados Intel o GPUs Arc, se necesita capacidad suficiente para alojar los 5,6 GB de pesos más activaciones; no hay cifras publicadas.
- GPU dedicadas: no se documentan requisitos ni recomendaciones del tipo A100, H100 o RTX 4090; el modelo está pensado para CPU.
- Cabe en hardware de consumo: sí, es precisamente su objetivo, siempre que se disponga de CPU con soporte de instrucciones SIMD modernas (se recomienda AVX2 o AVX-512) y memoria suficiente.
- Opciones de despliegue: OpenVINO Runtime (Python/C++), herramientas de Optimum-Intel para integración con transformers/diffusers y OpenVINO GenAI. La model card no especifica el pipeline de inferencia exacto ni comandos de ejecución, por lo que habrá que consultar el repositorio del autor.
- Latencia y throughput: no disponibles. Dependen fuertemente del modelo de CPU, del número de hilos y de la resolución de salida, parámetros que la documentación no detalla.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato y tamaño | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (rupeshs/flux3-image-klein-int4-ov) | DiT 5,6B + codificador Qwen3-VL-4B truncado | OpenVINO IR INT4, 5,6 GB | 4 (Euler, shift 3, CFG 1) | flux-kommunity-license | Hugging Face, 0 descargas, 0 likes |
| FLUX.3 Image Klein Base (original) | DiT de 5,6B (según el autor) | Pesos originales, 20,5 GB | No disponible (sin destilación de 4 pasos) | Licencia de Black Forest Labs | Hugging Face, mantenido por Black Forest Labs |
| Muinez/flux3-klein-distil-4step | LoRA sobre FLUX.3 Image Klein | LoRA en safetensors, tamaño no disponible | 4 (según la model card del LoRA) | No disponible en la información | Hugging Face |

No se dispone de datos en la información proporcionada para comparar con alternativas de otros fabricantes (por ejemplo, modelos de la familia SDXL o FLUX.1) en parámetros, contexto, rendimiento o calidad: no disponible.

## Limitaciones y advertencias

- Conversión no oficial: el autor indica explícitamente que no está hecha, respaldada ni validada por Black Forest Labs; no hay garantías de fidelidad respecto a los pesos originales.
- Licencia restrictiva: la flux-kommunity-license no es una licencia de código abierto permisiva e impone condiciones al uso comercial. Es imprescindible revisar LICENSE.md antes de cualquier despliegue en producción.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks publicados; no hay evidencia independiente de la calidad del resultado.
- Cuantización INT4: la compresión agresiva del DiT y del codificador de texto puede introducir degradación en detalles finos, texto renderizado en la imagen y coherencia de composiciones complejas. No se han publicado comparaciones con los pesos en FP16.
- Codificador de texto truncado: al limitarse a las capas 1-32 de Qwen3-VL-4B, parte de la capacidad de comprensión del prompt se pierde; no se documenta el impacto.
- Destilación a 4 pasos con CFG 1: no permite prompt negativo ni ajuste de guidance scale clásico, lo que reduce el control sobre el resultado y puede aumentar la variabilidad entre semillas.
- Idiomas: no se documenta qué idiomas maneja bien el pipeline; no se puede asumir buen rendimiento en castellano sin pruebas propias.
- Sesgos y alucinación visual: al no haber información sobre el dataset de entrenamiento original ni auditorías, no se pueden enumerar sesgos conocidos; cabe esperar los sesgos demográficos y culturales típicos de los modelos text-to-image entrenados con datos web a gran escala, además de posibles inconsistencias entre el prompt y la imagen generada.
- Sin datos de rendimiento: la ausencia de métricas de latencia impide estimar con antelación si el modelo cumple requisitos de tiempo real en un hardware concreto.
- Resultados de búsqueda no relevantes: las consultas web sobre este modelo no devolvieron documentación técnica adicional, así que esta ficha se basa únicamente en la model card del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rupeshs/flux3-image-klein-int4-ov
- Licencia del modelo (LICENSE.md del repositorio): https://huggingface.co/rupeshs/flux3-image-klein-int4-ov/blob/main/LICENSE.md
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- LoRA de destilación a 4 pasos: https://huggingface.co/Muinez/flux3-klein-distil-4step
- Resultados de búsqueda web: no se encontraron enlaces relevantes sobre este modelo.
