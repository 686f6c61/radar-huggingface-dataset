# electroglyph/Inkling-2-Mini-uncensored-LoRA

## Resumen

Inkling-2-Mini-uncensored-LoRA es una adaptación del modelo multimodal Inkling-2-Mini desarrollada por el usuario electroglyph mediante la herramienta Heretic v2.2.0.dev0. Se trata de una versión "decensored" o "abliterated" que elimina los mecanismos de rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 1 a 16 del transformer. El resultado es un modelo que responde a prácticamente cualquier petición, reduciendo las negativas de 100/100 en el modelo base a 3/100 en esta variante.

El modelo base, Inkling-2-Mini, es un transformer autoregresivo multimodal con arquitectura de mezcla de expertos (MoE) desarrollado por Thinking Machines Lab. Cuenta con 26.400 millones de parámetros totales y 3.400 millones activos por token (5.400 millones efectivos por token debido al bucle de capas). Acepta entradas de texto e imagen y genera texto, con una ventana de contexto de hasta un millón de tokens. El checkpoint se distribuye en precisiones mixtas NVFP4 y MXFP8 con un tamaño aproximado de 20 GB.

La relevancia de esta ficha radica en que combina un modelo multimodal de última generación con un contexto extremadamente largo y una modificación que elimina las salvaguardas de contenido. Esto lo hace interesante para investigación sobre alineación y seguridad, pero también plantea riesgos importantes para uso en producción sin las debidas cautelas. El repositorio de esta variante ocupa 0,1 GB (solo los pesos LoRA/adaptadores), no el checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y capas en bucle (looped transformer) |
| Parametros totales | 26.400 millones |
| Parametros activos | 3.400 millones por token (5.400 millones efectivos por token con 3 pasadas) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (checkpoint base); GGUF cuantizado disponible vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA); el modelo base en NVFP4/MXFP8 |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer decoder-only de 24 capas con capas de alimentación directa de mezcla de expertos dispersa (MoE). Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da lugar a 48 aplicaciones de capa por token a partir de 24 capas de pesos. En cada capa, cada token se enruta a 8 de 128 expertos. La atención es un híbrido de capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y las entradas de imagen y texto se proyectan a un espacio oculto compartido que el decoder procesa conjuntamente.

Los datos de entrenamiento incluyen texto, imágenes y vídeo procedentes de fuentes públicas de internet, repositorios accesibles, datos generados internamente y datos sintéticos o aumentados. No se especifica el número exacto de tokens de entrenamiento ni la composición detallada del dataset. Tampoco se detalla si hubo fases de RLHF o DPO. La variante uncensored se ha generado mediante Arbitrary-Rank Ablation (ARA) con los parámetros start_layer_index=1, end_layer_index=16, preserve_good_behavior_weight=0.0672, steer_bad_behavior_weight=0.0008, overcorrect_relative_weight=1.0253, neighbor_count=13 y loss_mode=relative. El proceso es reproducible y los detalles se encuentran en el directorio `reproduce` del repositorio.

## Capacidades

- Generación de texto conversacional multi-turno con instrucciones complejas.
- Comprensión de imágenes y razonamiento visual (image-text-to-text).
- Generación y razonamiento de código en múltiples lenguajes de programación.
- Capacidad de tool calling y function calling para sistemas agénticos.
- Razonamiento multi-paso y uso en pipelines de agentes.
- Soporte multilingüe general, con inglés como idioma principal.
- Contexto de hasta 1 millón de tokens para documentos extensos o conversaciones muy largas.
- Ausencia de mecanismos de rechazo: responde a peticiones que el modelo base rechazaría (3/100 negativas frente a 100/100 del original).

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo sin salvaguardas y comparar su divergencia KL (0,0883) respecto al modelo original para analizar qué información codifican las capas ablacionadas.
- Análisis de documentos extensos: con 1M de tokens de contexto, puede procesar libros completos, expedientes legales o bases de código enteras en una sola pasada sin truncamiento.
- Asistentes de código en producción: el soporte de tool calling y su tamaño contenido (20 GB en NVFP4) permiten integrarlo en pipelines de CI/CD y entornos de desarrollo local con GPU de 32 GB.
- Procesamiento de documentos con imágenes: al ser nativamente multimodal, puede extraer información de facturas, formularios escaneados o capturas de pantalla y generar resúmenes estructurados.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido que el modelo base rechazaría por sus filtros de contenido, útil en entornos de investigación creativa controlados.
- Despliegue en hardware de consumo: gracias a su tamaño y a las versiones GGUF, puede ejecutarse en Apple Silicon con 32 GB o más y en GPUs consumer de gama alta, lo que facilita prototipado local sin depender de la nube.
- Evaluación de robustez de filtros: permite probar sistemas de moderación y clasificadores de contenido frente a un modelo que no rechaza peticiones, como banco de pruebas adversarial.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (thinkingmachines/Inkling-2-Mini) |
|---|---|---|
| Tasa de rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0883 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint base ocupa aproximadamente 20 GB en NVFP4/MXFP8. Se recomiendan 32 GB o más de VRAM para el modelo completo.
- GPU recomendadas: 1x NVIDIA DGX Spark; otras GPUs con 32 GB o más de VRAM.
- Apple Silicon: dispositivos con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio).
- Cabe en GPU consumer de gama alta con 32 GB o más (por ejemplo, RTX 5090 o equivalentes); las versiones GGUF cuantizadas permiten ajustar aún más el uso de memoria.
- Opciones de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (GGUF), llama.cpp, Llama App, Ollama y Exo Labs en Apple Silicon.
- Post-entrenamiento: Miles y SkyRL.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-uncensored-LoRA | 26,4B totales / 3,4B activos | 1M tokens | Sí (imagen-texto) | Apache 2.0 | Variante sin rechazos, KL 0,0883 |
| Inkling-2-Mini (base) | 26,4B totales / 3,4B activos | 1M tokens | Sí (imagen-texto) | Apache 2.0 | Modelo original con filtros, 100/100 rechazos |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos en la información proporcionada |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación facilitada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base no documenta sesgos específicos; la ablación puede amplificar sesgos al eliminar mecanismos de rechazo que actuaban como filtro parcial.
- Riesgo de alucinación: inherente a los modelos generativos; la eliminación de salvaguardas no reduce la probabilidad de generar información falsa, solo la de rechazar peticiones.
- Limitaciones de contexto: aunque soporta 1M de tokens, el rendimiento en contextos extremadamente largos puede degradarse; no se han publicado evaluaciones específicas de degradación por longitud.
- Limitaciones de idioma: el modelo está orientado al inglés con soporte multilingüe general, pero no se detallan los idiomas cubiertos ni su calidad relativa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base está sujeto a la Política de Uso Aceptable de Thinking Machines, que puede imponer restricciones adicionales.
- Caveat para producción: la eliminación de rechazos implica que el modelo puede generar contenido dañino, ilegal o inexacto sin advertencia; se requiere moderación externa obligatoria en cualquier despliegue público.
- El repositorio de esta variante solo contiene los adaptadores LoRA (0,1 GB), no el checkpoint completo; es necesario descargar el modelo base por separado.
- La información sobre el entrenamiento del modelo base es parcial: no se especifican tokens totales, composición exacta del dataset ni si se aplicaron RLHF/DPO.

## Enlaces

- [Hugging Face: electroglyph/Inkling-2-Mini-uncensored-LoRA](https://huggingface.co/electroglyph/Inkling-2-Mini-uncensored-LoRA)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Heretic](https://heretic-project.org)
- [Playground de Tinker](https://tinker.thinkingmachines.ai/playground)
- [Tinker Cookbook](https://github.com/thinking-machines-lab/tinker-cookbook)
- [Blog de Hugging Face sobre Inkling 2 Mini](https://hf.co/blog/inkling2mini)
- [Receta de SGLang](https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini)
- [Receta de vLLM](https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini)
- [TokenSpeed](https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini)
- [Unsloth](https://unsloth.ai/docs/inkling-2-mini)
- [Llama App](https://llama.app/)
- [Miles](https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini)
- [SkyRL](https://docs.skyrl.ai/docs/models/inkling2)
- [Paquete tml-renderers en PyPI](https://pypi.org/project/tml-renderers/)
- [Política de Uso Aceptable de Thinking Machines](https://thinkingmachines.ai/model-acceptable-use-policy/)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
