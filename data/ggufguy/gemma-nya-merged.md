# GGUFGuy/gemma-nya-merged

## Resumen

Gemma-nya-merged es un ajuste fino (finetune) del modelo Gemma 3 de 1B parámetros en su variante instruct, publicado por el usuario GGUFGuy en Hugging Face. El modelo base es la versión cuantizada a 4 bits de Unsloth (`unsloth/gemma-3-1b-it-unsloth-bnb-4bit`), sobre la que se ha aplicado un entrenamiento adicional y posteriormente se han fusionado los pesos resultantes en precisión FP16. El resultado es un checkpoint de aproximadamente 1.000 millones de parámetros (999.885.952 exactos según safetensors) que conserva la arquitectura `gemma3_text` de Google.

El modelo hereda la arquitectura transformer decoder-only de la familia Gemma 3, orientada a generación de texto conversacional. El entrenamiento se realizó con la librería Unsloth y TRL de Hugging Face, lo que según el autor permitió un entrenamiento "2x más rápido". No se documentan en la model card los datos de entrenamiento, el número de tokens utilizados ni el método de ajuste (SFT, DPO, etc.).

Su relevancia es limitada: se trata de un modelo de nicho, sin descargas ni interacciones en el momento de la consulta, y con documentación mínima. Resulta útil principalmente como ejemplo de pipeline de finetune ligero sobre Gemma 3 1B con Unsloth, o para experimentación con modelos pequeños en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`gemma3_text`) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma 3 1B; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; el modelo base era bnb-4bit) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `gemma3_text`, la variante de solo texto de la familia Gemma 3 de Google, un transformer decoder-only con atención multi-cabeza estándar. El checkpoint publicado es el resultado de fusionar (merge) los pesos de un adaptador entrenado sobre la versión 4-bit de Unsloth, exportándolos finalmente en FP16. El tamaño del repositorio es de 2,0 GB, coherente con ~1B parámetros en FP16.

El entrenamiento se realizó con Unsloth y la librería TRL, según indica el autor, con una mejora de velocidad de 2x respecto a un entrenamiento convencional. No se especifican en la model card el volumen de datos, la composición del dataset, la duración del entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de Unsloth para el ajuste eficiente.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instruct de Gemma 3 1B.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 1B parámetros.
- Capacidad multilingüe: la model card solo declara inglés (`en`), aunque el modelo base Gemma 3 soporta más idiomas; no confirmado para este finetune.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (thinking mode, visión, audio): no documentadas; la variante es `gemma3_text`, por lo que no se espera visión.

## Casos de uso

- Experimentación con pipelines de finetune: sirve como referencia para reproducir un flujo Unsloth + TRL sobre Gemma 3 1B y validar la fusión de pesos en FP16.
- Prototipado de chatbots ligeros: al ser un modelo de ~1B parámetros, puede desplegarse en hardware modesto para pruebas de concepto conversacionales en inglés.
- Generación de texto en entornos con recursos limitados: su tamaño permite ejecución en CPU o GPU de gama baja para tareas de completado simple.
- Evaluación comparativa de finetunes: útil como baseline para medir el impacto de un ajuste adicional sobre Gemma 3 1B instruct.
- Docencia y formación: ejemplo didáctico de cómo se publica un modelo fusionado en Hugging Face con licencia Apache 2.0.
- Investigación sobre sesgos y alucinación en modelos pequeños: su reducido tamaño facilita experimentos controlados y reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 3-4 GB en total para contextos moderados).
- VRAM estimada en cuantización 4-bit: alrededor de 1 GB para pesos (no se distribuyen pesos cuantizados en el repo; habría que generarlos).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (GTX 1650, RTX 3050, RTX 4060); A100/H100 no necesarias pero válidas para batch grande.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas e incluso en CPU con llama.cpp tras conversión a GGUF.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma-nya-merged (este) | ~1B | no disponible | Apache 2.0 | Hugging Face |
| Gemma 3 1B IT (Google) | ~1B | no disponible en la información | Gemma Terms (no Apache) | Hugging Face |
| unsloth/gemma-3-1b-it-unsloth-bnb-4bit | ~1B | no disponible | según modelo base | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32K (según documentación pública de Qwen) | Apache 2.0 | Hugging Face |

Nota: los datos de modelos comparables distintos del presente se incluyen a modo de referencia general; no se dispone de benchmarks comparativos publicados para este finetune concreto.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla datos de entrenamiento, método de ajuste ni evaluación, lo que dificulta valorar su calidad real.
- Riesgo de alucinación: como todo modelo de 1B parámetros, la tasa de errores factuales es elevada frente a modelos mayores.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: la longitud de contexto no se especifica en la model card; conviene verificar la configuración antes de usarlo en producción.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 3 de Google tiene sus propios términos; conviene revisar la compatibilidad de licencias antes de un despliegue comercial.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de finetune, desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GGUFGuy/gemma-nya-merged
- Modelo base: https://huggingface.co/unsloth/gemma-3-1b-it-unsloth-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
