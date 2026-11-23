# chdp207/10Eros-Max

## Resumen

10Eros-Max es un ajuste fino (fine-tune) del modelo de generación de vídeo MiniMax-H3, desarrollado por el usuario chdp207 y publicado en Hugging Face. Se distribuye como un modelo de pipeline `image-text-to-video`, lo que significa que acepta imágenes y texto como entrada para producir secuencias de vídeo. El modelo base es MiniMaxAI/MiniMax-H3, y el ajuste se orienta a la fusión de LoRAs, cambios de forma en la arquitectura y la incorporación de datos de un tune denominado Sulphur3, manteniendo parte de las capacidades del modelo original.

El repositorio es de gran tamaño (759,3 GB) y contiene múltiples variantes (betas y versiones turbo) según la model card. El autor indica que el modelo está pensado para referencias multi-imagen, entradas de primer y último fotograma, y referencia de audio para timbres vocales. La model card menciona explícitamente que la mayoría de anatomías y movimientos NSFW son posibles, lo que sitúa el modelo en un ámbito de contenido para adultos.

La relevancia de esta ficha es limitada: se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica formal. La información disponible proviene casi exclusivamente de la model card del autor, que es descriptiva pero poco estructurada y no ofrece especificaciones cuantitativas verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tune de MiniMax-H3; la model card menciona proyecciones Omni adaln, cabezas pdd y fusión de deltas turbo, sin detallar la arquitectura subyacente) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repo principal; existe una versión Int8 enlazada (cicalooo/10Eros-Max-h3-int8-convrot) |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | No disponible (repo de 759,3 GB; la model card no especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card describe el modelo como un "fl2va hybrid" construido sobre una fusión delta1024 de H3, con cambios de forma y proyecciones Omni adaln y cabezas pdd en las versiones beta_7. El autor menciona que el modelo base es un fl2va con el timestep Fast Omni, posteriormente "refolded", lo que permite una hibridación completa en lugar de una hibridación parcial sin timestep. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

El entrenamiento se basa en la fusión de LoRAs: la beta_5 se construye a partir de siete injertos agrupados por concepto y fusiones por consenso de más de 20 LoRAs, sin fusiones directas de LoRAs. La beta_7 combina los mejores datos de LoRA disponibles, pre-fusionados y convertidos a versiones solo-MLP, fusionados con límite de magnitud, dejando intactas la atención y la referencia del modelo base. La v1.0 combina beta5, beta7 y Sulphur3 sobre un híbrido fl2va con un 5% del timestep de referencia real por proyección. El autor incluye turbos híbridos (delta fusion) que ahorran 4,2 GB de memoria frente a cargar ambos turbos de referencia y fl.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen y texto (image-text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Referencia multi-imagen y entradas de primer y último fotograma.
- Referencia de audio para timbres vocales (según la model card).
- Generación de contenido NSFW (anatomías y movimientos, según el autor).
- Soporte de muestreo turbo (8 pasos, rango 6-12) y versiones no turbo.
- Compatibilidad con LoRAs adicionales de concepto (fuerza recomendada 0,2-0,6).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Generación de vídeo corto a partir de una imagen de referencia: el modelo acepta una imagen y un prompt textual para producir una secuencia animada, adecuado para prototipado visual rápido con una sola pasada.
- Interpolación entre primer y último fotograma: la entrada de first-last frame permite crear transiciones coherentes entre dos imágenes, útil para animaciones de producto o storyboards.
- Referencia multi-imagen para consistencia de personaje: la v1.0 está diseñada para referencias multi-imagen, lo que permite mantener la apariencia de un sujeto a lo largo de una secuencia.
- Sincronización de timbre vocal con audio de referencia: la opción de referencia de audio permite alinear el timbre de voces generadas con una muestra proporcionada, aplicable a doblaje o avatares.
- Creación de contenido para adultos: el autor indica que la mayoría de anatomías y movimientos NSFW son posibles, lo que orienta el modelo a estudios de animación para adultos.
- Experimentación con pipelines de muestreo y fusión de LoRAs: el repositorio incluye múltiples betas y versiones turbo, lo que lo hace útil como banco de pruebas para técnicas de fusión de LoRAs y muestreo con VSA/SLA.
- Integración en flujos de upscale en dos pasadas: el autor recomienda un pase de upscale 3D espacial para eliminar el parpadeo del fondo, aplicable a pipelines de postproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repo principal ocupa 759,3 GB, lo que sugiere pesos de gran tamaño; la versión Int8 enlazada reduce el requisito, pero no se especifica la VRAM necesaria.
- GPU recomendadas: no disponibles. El autor no menciona modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada. El tamaño del repo y la ausencia de cuantizaciones ligeras documentadas hacen improbable su ejecución en GPU de consumo sin cuantización adicional.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. El autor enlaza un workflow de ComfyUI (SampleWorkFlowTwoPassOptimized) y menciona nodos de muestreo (er_sde, res_multistep, LCM, Euler) y VSA/SLA sparsity, lo que apunta a un despliegue basado en ComfyUI.
- Latencia y throughput: no disponibles. El autor indica configuraciones de 4-12 pasos según la variante, pero sin cifras de tiempo por vídeo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 10Eros-Max | No disponible | No disponible | minimax-h3-community-license-agreement | Hugging Face (0 descargas) | Fine-tune de MiniMax-H3 con fusión de LoRAs y datos NSFW |
| MiniMax-H3 (base) | No disponible | No disponible | minimax-h3-community-license-agreement | Hugging Face | Modelo base oficial; el fine-tune hereda su licencia |
| Alternativas de text-to-video | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el entrenamiento con datos NSFW y la fusión de LoRAs de origen no verificable pueden introducir sesgos no auditados.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de artefactos visuales; el autor menciona parpadeo (flickering) en el fondo y en el latente en flujos de una sola pasada sin muestreo refinado.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud de contexto.
- Restricciones de licencia: la licencia minimax-h3-community-license-agreement es de tipo "other"; debe revisarse el enlace de licencia del modelo base antes de cualquier uso comercial. El contenido NSFW puede tener restricciones legales adicionales según la jurisdicción.
- Caveats para producción: el autor advierte que las betas 3 y 4 están corruptas, que la beta_6 debe evitarse, y que las LoRAs normales de H3 a alto rank en atención funcionan mal y degradan la imagen. La versión v1.0 puede tener menos conocimiento general pero es más adaptable. No se debe usar caché ni spectrum con referencia por pérdida de precisión. El modelo tiene 0 descargas y 0 likes, sin validación comunitaria.
- El repositorio es de 759,3 GB, lo que implica un coste de almacenamiento y transferencia considerable.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/chdp207/10Eros-Max
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Workflow: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/SampleWorkFlowTwoPassOptimized
- LoRAs de refuerzo: https://huggingface.co/TenStrip/MMH3_Sulphur3Eros_Loras-MLP-energy-patches
- Versión Int8: https://huggingface.co/cicalooo/10Eros-Max-h3-int8-convrot
