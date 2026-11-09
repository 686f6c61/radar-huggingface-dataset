# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run1-gen3

## Resumen

Este repositorio contiene un fine-tuning del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un ajuste realizado con las librerías Unsloth y TRL sobre el checkpoint instructivo oficial de Qwen2.5, un transformer denso de 7.600 millones de parámetros desarrollado originalmente por Alibaba Qwen. El nombre del repositorio sugiere un experimento de ajuste de comportamiento orientado a modificar la orientación política de las respuestas ("political_left") mediante un procedimiento de colapso numérico de tokenizador ("numbers-collapse") con parámetros p10, e10, r8 y ct128, correspondientes a una ejecución concreta de un pipeline experimental.

La relevancia de este modelo es limitada y de carácter fundamentalmente académico o exploratorio: no es un modelo de producción, no presenta resultados de evaluación y su model card es prácticamente la plantilla automática generada por Unsloth. El tamaño del repositorio (0,1 GB) indica que probablemente solo contiene adaptadores LoRA o pesos parciales, no el modelo completo en precisión completa, lo que condiciona su uso directo.

El modelo hereda la arquitectura y el contexto de Qwen2.5-7B-Instruct (32.768 tokens nativos, ampliables a 131.072 mediante YaRN), pero cualquier afirmación sobre su comportamiento final debe tomarse con cautela: no hay benchmarks publicados ni documentación del dataset de ajuste, y el nombre del repositorio apunta a una intervención deliberada sobre sesgos ideológicos que no está descrita técnicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), fine-tuning sobre Qwen2.5-7B-Instruct |
| Parametros totales | 7.600 millones (heredados del modelo base; el repo de 0,1 GB sugiere adaptadores o pesos parciales) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; no se especifica si el fine-tuning preserva la extensión YaRN a 131.072 |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no hay GGUF ni AWQ oficiales) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atención por grupos (GQA), RoPE, SwiGLU en las capas MLP y normalización RMSNorm. El modelo base fue preentrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (SFT y DPO) para alineamiento conversacional. Sobre esa base, HungryDino aplica un fine-tuning adicional con Unsloth y TRL, presumiblemente mediante LoRA o QLoRA dado el tamaño del repositorio.

No se documenta en la model card el número de tokens de entrenamiento, la composición del dataset, la configuración de hiperparámetros ni el método de alineación empleado en este ajuste concreto. El identificador del repositorio ("numbers-collapse_p10_e10_r8_ct128_worldview-run1-gen3") sugiere un experimento con parámetros de colapso numérico y una ejecución de tercera generación sobre una "worldview" concreta, pero no hay información técnica que permita reconstruir el procedimiento. Tampoco se especifica si el ajuste se aplicó sobre todas las capas o solo sobre módulos de atención/MLP.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento de propósito general, matemáticas y código (capacidades del modelo base, no verificadas tras el ajuste).
- Soporte de tool calling y function calling, propio del modelo base Qwen2.5-Instruct; no se confirma que el fine-tuning lo preserve.
- Capacidad multilingüe del modelo base (29 idiomas), aunque la model card declara únicamente inglés para este checkpoint.
- Posible modificación deliberada de la orientación ideológica de las respuestas ("political_left" en el nombre), sin documentación de su alcance ni de su metodología.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre sesgo ideológico en LLM: el modelo puede emplearse como objeto de estudio para analizar cómo un fine-tuning dirigido altera la distribución de respuestas en temas políticos, comparándolo con el Qwen2.5-7B-Instruct original.
- Experimentos de alineamiento y preferencias: útil en entornos académicos para reproducir o contrastar metodologías de ajuste de "worldview" sobre un modelo instructivo base.
- Evaluación de robustez de pipelines de seguridad: probar si las salvaguardas del modelo base se mantienen tras un fine-tuning con Unsloth/TRL y detectar regresiones.
- Docencia en ajuste fino eficiente: ejemplo práctico de fine-tuning con LoRA/QLoRA usando Unsloth y TRL sobre un transformer de 7B, con un repositorio pequeño y reproducible.
- Pruebas de regresión de herramientas de moderación: servir como caso negativo controlado para validar clasificadores de sesgo o filtros de contenido.
- Comparación de metodologías de ajuste: contraste con otros checkpoints de la misma familia ("run1-gen3") para estudiar la variabilidad entre ejecuciones de un mismo pipeline experimental.
- No se recomienda su uso en producción, atención al cliente ni generación de código en entornos reales sin una evaluación previa exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo, y no hay datos que permitan comparar el rendimiento del fine-tuning con el del modelo base Qwen2.5-7B-Instruct.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB para los 7.600 millones de parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB; en 4 bits (si se generan pesos GGUF/AWQ a partir del checkpoint): aproximadamente 5-6 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB (esta última con margen ajustado para contexto largo).
- GPU consumer: cabe en RTX 4090 (24 GB) en FP16 con contexto moderado y en RTX 3090/4080 (16-24 GB) si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers con `text-generation-inference`, vLLM, llama.cpp u Ollama si se generan pesos GGUF; Unsloth para reentrenamiento o merge de adaptadores.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto, y no hay mediciones publicadas para este checkpoint.
- Nota: el repositorio de 0,1 GB probablemente contiene solo adaptadores; será necesario fusionarlos con el modelo base `unsloth/Qwen2.5-7B-Instruct` antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | 7,6B (adaptadores) | 32.768 (heredado) | Apache 2.0 | Repo de 0,1 GB, sin benchmarks | Fine-tuning experimental, sin evaluación |
| Qwen2.5-7B-Instruct (Alibaba) | 7,6B | 32.768 (131.072 con YaRN) | Apache 2.0 | Modelo oficial, ampliamente evaluado | Base del ajuste; benchmarks públicos |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | Apache 2.0 | Modelo oficial con GGUF/AWQ | Alternativa europea de tamaño similar |
| Llama-3.1-8B-Instruct | 8,0B | 131.072 | Llama 3.1 Community License | Modelo oficial con amplio ecosistema | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- No hay documentación del dataset de entrenamiento ni de la metodología de ajuste; el comportamiento final es impredecible sin evaluación propia.
- El nombre del repositorio indica una intervención deliberada sobre la orientación política; puede introducir sesgos sistemáticos no cuantificados y reducir la neutralidad respecto al modelo base.
- Riesgo elevado de alucinación y degradación de capacidades (código, matemáticas, tool calling) tras un fine-tuning no evaluado.
- La model card declara únicamente inglés; el rendimiento multilingüe del modelo base puede haberse deteriorado.
- El repositorio de 0,1 GB sugiere pesos parciales o adaptadores: no es un checkpoint autónomo listo para usar sin fusionar con el modelo base.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo ajustado y sobre posibles sesgos ideológicos.
- Sin benchmarks, sin evaluación de seguridad y sin garantías de calidad: no apto para producción sin auditoría previa.
- El identificador "run1-gen3" apunta a un experimento iterativo; pueden existir otras versiones con comportamientos distintos y sin trazabilidad pública.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run1-gen3
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (GitHub): https://github.com/huggingface/trl
- Documentación de transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
