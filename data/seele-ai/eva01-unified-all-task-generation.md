# SEELE-AI/EVA01-Unified-All-Task-Generation

## Resumen

EVA01 Unified All-Task Generation es un adaptador de generación publicado por SEELE-AI dentro de la familia EVA01, un modelo multimodal nativo de 3D construido sobre una arquitectura Mixture-of-Transformers (MoT) con expertos diferenciados para comprensión y generación. Este repositorio concreto no contiene pesos de un modelo completo, sino únicamente los parámetros de generación del adaptador EVA01, que habilitan la cascada nativa `SS -> Shape -> Material` para inferencia text-to-3D e image-to-3D. Los activos congelados de los que depende (Qwen3-VL, TRELLIS, TRELLIS.2, tokenizer, normalización y decoder) deben obtenerse por separado desde el repositorio OpenEVA.

El modelo aborda el problema de unificar en una sola arquitectura la comprensión de mallas 3D, la generación y la edición multi-turno con contexto, tratando la geometría 3D como una modalidad nativa en lugar de un proceso derivado de imágenes o vídeo. Su relevancia radica en que propone una interfaz común para tareas de comprensión y generación 3D, algo poco habitual en el ecosistema abierto, donde la mayoría de pipelines encadenan modelos 2D con reconstrucción posterior.

El repositorio es extremadamente ligero (0,6 GB) y está etiquetado con licencia Apache 2.0 y pipeline text-to-3d. La información pública disponible sobre parámetros, contexto, datos de entrenamiento y benchmarks es muy limitada, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT) con expertos de comprensión y generación; adaptador sobre runtime EVA01 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,6 GB |
| Pipeline | text-to-3d (e image-to-3D segun model card) |
| Libreria | eva01 |
| Dependencias externas | Qwen3-VL, TRELLIS, TRELLIS.2, tokenizer, normalizacion y decoder (congelados, no incluidos) |

## Arquitectura y entrenamiento

EVA01 se describe como un modelo multimodal nativo de 3D basado en una arquitectura Mixture-of-Transformers, con un experto dedicado a comprensión y otro a generación, integrando mallas 3D como modalidad de primera clase. La generación sigue una cascada nativa `SS -> Shape -> Material`, es decir, una etapa de representación latente o estructura seguida de generación de forma y de material. El adaptador de este repositorio contiene solo los parámetros de generación del runtime EVA01; el resto de componentes (Qwen3-VL como backbone visión-lenguaje, TRELLIS y TRELLIS.2 como módulos de generación 3D, tokenizer, normalización y decoder) son activos congelados que el usuario debe aportar por separado.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones concretas de decodificación en la información proporcionada. El repositorio excluye explícitamente código de entrenamiento, datos de entrenamiento, parámetros de edición, pesos del decoder y pesos del modelo base.

## Capacidades

- Generación text-to-3D mediante la cascada nativa `SS -> Shape -> Material`.
- Generación image-to-3D a partir de imágenes de entrada.
- Comprensión de mallas 3D y question answering sobre geometría, según la descripción del paquete público de OpenEVA.
- Edición multi-turno con contexto de mallas 3D, mencionada en el informe técnico de EVA01 (los parámetros de edición no están incluidos en este repositorio).
- Integración de 3D como modalidad nativa junto a entrada visión-lenguaje a través de Qwen3-VL.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Prototipado de assets 3D a partir de descripciones textuales: el adaptador permite invocar la cascada `SS -> Shape -> Material` para generar mallas con materiales a partir de prompts, útil en estudios de videojuegos que necesitan variaciones rápidas de props.
- Reconstrucción 3D desde una sola imagen: el pipeline image-to-3D facilita la digitalización de objetos físicos fotografiados con un móvil para catálogos de comercio electrónico.
- Comprensión y QA sobre mallas existentes: gracias al experto de comprensión de EVA01, se pueden formular preguntas sobre la geometría de un modelo 3D para validación automatizada de assets.
- Edición iterativa de modelos 3D en flujos de diseño: el soporte de edición multi-turno con contexto permite refinar una malla conversacionalmente, aunque los parámetros de edición deben obtenerse fuera de este repositorio.
- Generación de materialidad para pipelines de render: la etapa Material de la cascada puede emplearse para asignar materiales plausibles a geometrías ya existentes en un motor de render.
- Investigación en modelos 3D nativos: al ser un adaptador ligero sobre un runtime documentado en OpenEVA, sirve como punto de entrada para experimentar con la arquitectura MoT sin descargar el modelo completo.
- Automatización de contenido para impresión 3D: la generación text-to-3D permite crear geometrías base que luego se reparan y exportan a STL en un pipeline de fabricación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el adaptador pesa 0,6 GB, pero el consumo real depende de los activos congelados (Qwen3-VL, TRELLIS, TRELLIS.2 y decoder) que se cargan por separado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño de los modelos base que se ensamblen con el adaptador.
- Opciones de despliegue: runtime nativo `eva01` descrito en el repositorio OpenEVA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EVA01 Unified All-Task Generation (este) | no disponible | no disponible | text-to-3D, image-to-3D, comprensión 3D | Apache 2.0 | Adaptador en Hugging Face; activos base en OpenEVA |
| TRELLIS | no disponible | no disponible | image-to-3D | no disponible en la información | Dependencia declarada del runtime |
| TRELLIS.2 | no disponible | no disponible | generación 3D | no disponible en la información | Dependencia declarada del runtime |
| Qwen3-VL | no disponible | no disponible | visión-lenguaje | no disponible en la información | Dependencia declarada del runtime |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no es un modelo autónomo: sin los activos congelados de Qwen3-VL, TRELLIS, TRELLIS.2, tokenizer, normalización y decoder, el adaptador no es funcional.
- No incluye parámetros de edición, pesos del decoder, pesos del modelo base, código de entrenamiento ni datos de entrenamiento.
- No se han publicado benchmarks, por lo que no es posible evaluar su calidad frente a alternativas.
- No hay información sobre sesgos, riesgo de alucinación geométrica ni fidelidad de las mallas generadas.
- No se documentan idiomas soportados; la cobertura multilingüe es desconocida.
- La licencia Apache 2.0 del adaptador no cubre necesariamente los activos base de terceros, cuyas licencias deben verificarse por separado antes de uso comercial.
- El repositorio registra 0 descargas y 0 likes, lo que sugiere ausencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-10-30) es futura respecto a la mayoría de referencias del ecosistema; conviene verificar la vigencia y el estado del proyecto antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SEELE-AI/EVA01-Unified-All-Task-Generation
- Árbol de archivos: https://huggingface.co/SEELE-AI/EVA01-Unified-All-Task-Generation/tree/main
- Repositorio OpenEVA: https://github.com/SeeleAI/OpenEVA
- Carpeta EVA01 en OpenEVA: https://github.com/SeeleAI/OpenEVA/tree/main/EVA01
- Página de investigación EVA01: https://www.seeles.ai/research/pages/EVA01
- Artículo "EVA01: Giving MLLMs a Native 3D Hand": https://www.seeles.ai/research/EVA01
