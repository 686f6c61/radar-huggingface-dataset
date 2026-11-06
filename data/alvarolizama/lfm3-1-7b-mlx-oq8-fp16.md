# alvarolizama/LFM3-1.7B-MLX-oQ8-fp16

## Resumen

LFM3-1.7B-MLX-oQ8-fp16 es una conversión cuantizada del modelo LFM3 de 1.700 millones de parámetros (1.728.801.536 pesos reales según los safetensors) al formato MLX, pensada para su ejecución en hardware Apple Silicon. La conversión la firma el usuario alvarolizama y emplea oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta que en este caso produce un checkpoint con un promedio efectivo de 8,502 bits por peso. El resultado ocupa 1,837 GB (1,711 GiB) y se distribuye como safetensors con código personalizado.

El modelo base pertenece a la familia LFM3 (Liquid Foundation Models, tercera generación), si bien la model card de esta conversión no documenta la arquitectura original, el contexto, los idiomas ni la licencia. Lo que sí está disponible es la estructura de cuantización: el 99,978 % de los pesos lógicos se almacena en 8 bits afines con grupo de 64 y solo un 0,022 % permanece en FP16, presumiblemente capas sensibles a la precisión. Esta mezcla busca conservar la calidad del modelo original reduciendo el peso a menos de 2 GB.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización reproducible para MLX con muy poca degradación teórica (8,5 bits efectivos); por otro, advierte de que se trata de un artefacto de terceros, con cero descargas y sin metadatos de licencia, lo que obliga a verificar la licencia del modelo LFM3 original antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; esta conversión es MLX) |
| Parametros totales | 1.728.801.536 (1,729 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín con grupo de 64 (99,978 % de los pesos) + FP16 (0,022 %); 8,502 bits/peso efectivos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, requiere `custom_code`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LFM3 en la documentación proporcionada: no se indica si es un transformer denso, un modelo híbrido con capas de estado recurrente (línea característica de la familia LFM de Liquid AI) ni el número de capas, cabezas de atención o dimensión oculta. Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias.

Lo que sí documenta la model card es el proceso de cuantización posterior: oQ (oMLX v0.7.3) aplica precisión mixta asignando 8 bits afines con grupo de 64 a la práctica totalidad de los tensores y manteniendo en FP16 un conjunto residual de 0,022 % de los pesos lógicos (unos 0,001 GiB). El desglose de almacenamiento confirma que la totalidad de los 1,729 B de pesos lógicos corresponden al modelo de lenguaje, sin cabezas adicionales de visión o audio declaradas. El checkpoint resultante se empaqueta en safetensors y requiere cargar código personalizado (`custom_code`) para su ejecución en MLX.

## Capacidades

- Generación de texto: capacidad esperable de un modelo de lenguaje de 1,7 B, aunque no se documentan tareas concretas en la model card.
- Razonamiento y matemáticas: no disponible; no hay evaluación publicada para esta conversión.
- Generación de código: no disponible; no se confirma soporte específico.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución en Apple Silicon: capacidad confirmada por el formato MLX, con pesos cuantizados a 8,5 bits efectivos.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: con 1,837 GB de pesos, el modelo cabe holgadamente en equipos con 8 GB o 16 GB de memoria unificada, lo que permite ejecutar un LLM de 1,7 B en portátiles Apple sin GPU dedicada.
- Prototipado rápido de pipelines MLX: sirve como checkpoint de referencia para validar flujos de `mlx-lm` y código personalizado antes de escalar a modelos mayores de la misma familia.
- Evaluación de la receta oQ: útil para medir la degradación de calidad de una cuantización de 8,5 bits efectivos frente al modelo LFM3 original en tareas de generación y razonamiento.
- Generación de texto en aplicaciones de escritorio offline: al no requerir red ni servicios externos, encaja en herramientas de escritura, resumen o reescritura que deban funcionar sin conexión en macOS.
- Base para ajuste fino ligero (LoRA/QLoRA) en Apple Silicon: el tamaño reducido del checkpoint facilita experimentos de adaptación con presupuesto de memoria modesto, siempre que la licencia del modelo base lo permita.
- Experimentación académica con modelos pequeños: permite reproducir estudios sobre cuantización, latencia y consumo energético en hardware de consumo sin acceso a clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,9-2,5 GB para los pesos en 8,5 bits, más overhead de activaciones y caché KV (no cuantificado en la documentación).
- GPU recomendadas: hardware Apple Silicon con memoria unificada (series M1, M2, M3 y M4, incluidas variantes Pro, Max y Ultra). No aplica a GPU NVIDIA o AMD, ya que el formato MLX es específico de Apple.
- ¿Cabe en GPU de consumo? Sí: cualquier Mac con 8 GB o más de memoria unificada debería poder cargarlo; se recomienda 16 GB para dejar margen a contextos largos.
- Opciones de despliegue: `mlx-lm` (librería MLX), con soporte de `custom_code`; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversión previa a GGUF u otro formato.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-oQ8-fp16 (esta ficha) | 1,729 B | no disponible | 8,5 bits efectivos (MLX) | no disponible | Hugging Face (0 descargas) |
| LFM3-1.7B original (Liquid AI) | ~1,7 B | no disponible en esta ficha | FP16/BF16 | no disponible en esta ficha | Repositorio oficial de Liquid AI (no verificado aquí) |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | múltiples (GGUF, AWQ, MLX) | Apache 2.0 | Amplia, con versiones MLX comunitarias |
| Llama 3.2 1B Instruct | 1,24 B | 131.072 tokens | múltiples (GGUF, MLX) | Llama 3.2 Community License | Amplia, con versiones MLX oficiales |

La comparación con Qwen2.5-1.5B y Llama 3.2 1B se ofrece como referencia de categoría (modelos densos de ~1-1,7 B), no como equivalencia funcional: no se dispone de datos de rendimiento del LFM3 cuantizado que permitan una comparación cuantitativa justa.

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica licencia, por lo que el uso comercial no está garantizado; es imprescindible consultar la licencia del modelo LFM3 original de Liquid AI.
- Artefacto de terceros: la conversión la realiza el usuario alvarolizama, no el equipo de Liquid AI; no hay garantía de fidelidad respecto al checkpoint oficial.
- Sin validación de calidad: no se han publicado benchmarks ni evaluaciones que midan la degradación introducida por la cuantización a 8,5 bits efectivos.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de que el checkpoint haya sido probado por terceros.
- Dependencia de `custom_code`: la carga requiere ejecutar código personalizado del repositorio, lo que implica un riesgo de seguridad si no se audita antes.
- Exclusivo de Apple Silicon: no es portable a GPU NVIDIA/AMD sin reconversión; limita el despliegue en servidores convencionales.
- Idiomas y contexto desconocidos: no se puede garantizar cobertura multilingüe ni planificar aplicaciones que dependan de ventanas de contexto largas.
- Riesgo de alucinación: inherente a los modelos de 1,7 B; no hay evaluación específica para esta conversión.
- Sesgos: no documentados; se heredan los del modelo base, que no se describen en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alvarolizama/LFM3-1.7B-MLX-oQ8-fp16
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Librería MLX: https://github.com/ml-explore/mlx
- MLX-LM (inferencia de LLM en MLX): https://github.com/ml-explore/mlx-examples/tree/main/llms
- Modelo base LFM3 de Liquid AI: no disponible en la información proporcionada.
