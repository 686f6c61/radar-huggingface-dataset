# Darklock/10Eros-Max

## Resumen

10Eros-Max es un modelo de generación de vídeo a partir de texto e imagen, desarrollado por el usuario Darklock como un fine-tune y merge del modelo base MiniMaxAI/MiniMax-H3. Se distribuye con el pipeline `image-text-to-video` y está pensado para producir clips de vídeo con audio sincronizado a partir de descripciones textuales o imágenes de referencia. El repositorio ocupa 696,2 GB, lo que refleja la presencia de múltiples variantes beta, versiones turbo y pesos completos del modelo base.

El modelo se presenta como un proyecto en evolución que combina varias estrategias de fusión: injertos de conceptos procedentes de más de 20 LoRAs, merges por consenso y una arquitectura híbrida basada en el merge delta1024 de H3. El autor indica que la versión funcional recomendada es la beta_5, mientras que beta_3, beta_4 y beta_6 se describen como corruptas o poco fiables. La beta_7 corrige el parpadeo en generaciones de alta resolución mediante una proyección Omni adaln más completa.

La relevancia actual del modelo reside en su enfoque de hibridación sobre H3: mantiene la atención y la referencia del modelo base intactas e inyecta datos adicionales únicamente en las capas MLP, lo que permite conservar el comportamiento original de H3 y ampliar capacidades con prompts adecuados. No obstante, la documentación es informal, no incluye benchmarks ni especificaciones cerradas, y el propio autor advierte de que el proyecto depende de futuras correcciones en el entrenamiento de H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo derivado de MiniMax-H3, con estructura híbrida y proyección Omni adaln; no se detalla la arquitectura interna completa |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Versiones Int8 disponibles en un repositorio externo; el resto de cuantizaciones no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo parte de MiniMax-H3, un modelo de generación de vídeo con audio, y se construye mediante merges e injertos de LoRAs. Según la model card, la beta_5 se edificó a partir de siete injertos agrupados por concepto y merges por consenso de más de 20 LoRAs, sin fusiones directas de LoRAs. La beta_7 emplea una proyección Omni adaln más completa, cabezas PDD y capa final, con mezcla alpha para corregir la deriva respecto a versiones anteriores. El merge se limita a la parte Gate de las capas MLP, lo que preserva la atención y la referencia del modelo base.

El autor describe el modelo base como un modelo fl2va con timestep Fast Omni, replegado para permitir hibridación completa. La beta_5 incorpora un delta turbo híbrido que ahorra 4,2 GB de memoria al evitar cargar simultáneamente los turbos de referencia y fl. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor menciona que el entrenamiento de H3 presenta problemas y que su rama dependerá de futuros ajustes sobre Sulphur H3.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Generación conjunta de vídeo y audio, con audio de mayor calidad en versiones no turbo.
- Soporte de referencia visual para mantener la coherencia de personajes o elementos.
- Generación en una sola pasada y en dos pasadas con muestreo refinado.
- Upscale espacial 3D para suavizar el latente y eliminar el parpadeo.
- Compatibilidad con LoRAs adicionales sobre las versiones beta_5 y posteriores.
- Ajuste de pasos de muestreo y samplers: er_sde, res_multistep, LCM, Euler, entre otros.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Generación de clips publicitarios: el modelo permite crear vídeo con audio a partir de un prompt descriptivo, adecuado para prototipos rápidos de anuncios y piezas de marketing antes de una producción final.
- Previsualización de escenas para cine o animación: con image-to-video se pueden animar storyboards o concept arts y evaluar movimiento, iluminación y ritmo sin rodaje.
- Creación de contenido para redes sociales: las versiones turbo de 4 a 8 pasos permiten iterar rápidamente sobre ideas y producir variaciones de un mismo concepto.
- Coherencia de personajes en series cortas: el soporte de referencia visual y los injertos de concepto ayudan a mantener la apariencia de un personaje entre distintos clips.
- Integración en flujos ComfyUI: el autor publica un workflow de dos pasadas optimizado, pensado para pipelines de generación con muestreo refinado y upscale espacial.
- Experimentación en investigación de modelos de vídeo: el repositorio documenta estrategias de merge, injertos en MLP y ajustes de sampler que pueden servir de base para estudiar hibridaciones sobre H3.
- Generación de audio sincronizado: las versiones no turbo ofrecen audio de mayor calidad, útil para bocetos de vídeo con locución o ambiente sonoro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 696,2 GB y contiene múltiples variantes, por lo que el peso real de una variante concreta no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio y la naturaleza del modelo de vídeo sugieren requisitos elevados, pero no se confirma.
- Opciones de despliegue: el autor publica un workflow para ComfyUI en un repositorio aparte; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Existe una versión Int8 en un repositorio externo que podría reducir los requisitos de memoria, sin cifras publicadas.
- Latencia y throughput: no disponible. El autor recomienda entre 4 y 8 pasos en configuraciones turbo y de 6 a 12 pasos en configuraciones normales, lo que da una idea del coste relativo, pero no se aportan tiempos absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 10Eros-Max | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face, repo de 696,2 GB | Fine-tune y merge de MiniMax-H3 con injertos de LoRAs |
| MiniMaxAI/MiniMax-H3 | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face | Modelo base del que deriva 10Eros-Max |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- La documentación es informal y en gran parte está redactada en un tono coloquial; varias versiones beta se describen como corruptas o inestables (beta_3, beta_4 y beta_6).
- El autor advierte de problemas de parpadeo en el fondo y en el latente en flujos de una sola pasada sin muestreo refinado; se mitiga con la pasada de upscale espacial 3D o con dos pasadas.
- La estructura Omni presenta problemas no diagnosticados según el autor.
- El uso de caché o spectrum con referencia provoca pérdida de precisión y debe evitarse.
- La dispersión SLA destruye el modelo según la model card y debe evitarse en cualquier workflow.
- El audio en versiones turbo es de menor calidad que en las versiones no turbo de pasos completos.
- Los resultados dependen en gran medida del prompt y de la configuración de muestreo; no hay garantías de consistencia entre versiones.
- La licencia es la MiniMax-H3 Community License Agreement, con posibles restricciones adicionales por la transferencia de carácter de LTX 2.3, Wan 2.2 y Krea 2; debe revisarse antes de uso comercial.
- No se documentan sesgos conocidos ni idiomas soportados.
- Riesgo de alucinación visual y de incoherencias en el contenido generado, propio de los modelos de difusión de vídeo.
- El proyecto se declara en evolución y sujeto a cambios por futuras correcciones en el entrenamiento de H3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Darklock/10Eros-Max
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Workflow de dos pasadas optimizado: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/tree/main/SampleWorkFlowTwoPassOptimized
- Versión Int8: https://huggingface.co/cicalooo/10Eros-Max-h3-int8-convrot
