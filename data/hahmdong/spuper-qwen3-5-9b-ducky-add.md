# Hahmdong/SPUPER-qwen3.5-9b-ducky-add

## Resumen

SPUPER-qwen3.5-9b-ducky-add es un modelo de lenguaje afinado a partir de Qwen/Qwen3.5-9B, desarrollado por Hahmdong en el Korea Advanced Institute of Science and Technology (KAIST). Se ha entrenado mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face. El modelo se publica en formato safetensors, con un total de 9.409.813.744 parámetros, aproximadamente 9.400 millones, lo que lo sitúa en la categoría de modelos de tamaño medio que podrían ejecutarse en GPU de consumo con cuantización, aunque esta opción no se ofrece en el repositorio.

Se trata de un fine-tune experimental: en el momento de crear esta ficha registra 0 descargas y 0 likes. El ejemplo de la model card presenta un pipeline de text-generation con formato de chat y una pregunta filosófica, lo que sugiere que el objetivo principal es la conversación y la generación de texto. El repositorio está etiquetado como image-text-to-text, lo que apunta a una posible capacidad multimodal, aunque no hay documentación que la confirme.

La relevancia es limitada: no se publican benchmarks, la licencia no está especificada y no se documentan los datos de entrenamiento. Resulta útil como referencia para comparar fine-tunes experimentales de Qwen3.5-9B, pero no es apto para producción sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 (9.409 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica 'licence: license' sin especificar) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado de Qwen/Qwen3.5-9B. Se entrenó con TRL en su versión 0.27.1, usando Transformers 5.9.0 y PyTorch 2.11.0+cu129. Según la model card, se empleó SFT como método de entrenamiento. No se especifica el número de tokens, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El enlace a Weights & Biases, bajo la ruta 'SPUPER-SFT', sugiere que el entrenamiento fue registrado, pero no se pueden extraer más detalles.

No hay información sobre innovaciones técnicas. Al ser un fine-tune, hereda la arquitectura del modelo base, cuyas características concretas (capas, cabezas de atención, tipo de atención, etc.) no se documentan en este repositorio.

## Capacidades

- Generación de texto conversacional: el ejemplo de la model card muestra un pipeline de text-generation con formato de chat (role/user), lo que indica soporte para conversaciones multi-turno mediante una interfaz de mensajes.
- Posible multimodalidad: el repositorio está etiquetado como image-text-to-text, aunque no se aporta ningún ejemplo de uso con imágenes ni documentación de la capacidad de visión.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento avanzado ni soporte explícito de múltiples idiomas.
- Sin benchmarks, no es posible verificar el rendimiento real en tareas de código, matemáticas o razonamiento general.

## Casos de uso

1. Asistente conversacional experimental: el modelo puede responder preguntas abiertas y mantener diálogos en formato chat, como muestra la interrogante filosófica de la model card. Es adecuado para prototipos rápidos en entornos de investigación.
2. Exploración de técnicas de SFT: al ser un fine-tune de Qwen3.5-9B, sirve como referencia para estudiar cómo afecta el entrenamiento supervisado en la generación de respuestas frente al modelo base.
3. Análisis comparativo de fine-tunes: los repositorios hermanos (SPUPER-qwen3.5-9b-quanquer-add y su variante quanter1) permiten comparar el impacto de distintos conjuntos de datos o configuraciones de afinado sobre el mismo modelo base.
4. Integración en pipelines de Hugging Face Transformers: al estar publicado con la librería transformers, puede cargarse directamente para tareas de text-generation, facilitando pruebas internas en entornos ya basados en esta librería.
5. Docencia o demostración en cursos de fine-tuning: la existencia de la tarjeta, la inclusión de un enlace a Weights & Biases y su procedencia académica (KAIST) lo convierten en un caso práctico para enseñar el flujo completo de SFT con TRL.
6. Generación de textos cortos y respuestas abiertas: para aplicaciones donde no se requiere precisión certificada, como pruebas de concepto de chatbots o redacción creativa experimental. Es importante señalar que, al no haber benchmarks ni información de datos de entrenamiento, su comportamiento real es desconocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 18.8 GB, lo que corresponde aproximadamente a pesos en BF16/FP16 para 9.409 millones de parámetros. En modo BF16/FP16 se necesitan unos 19-20 GB de VRAM, más el espacio para los cachés de KV y las activaciones, por lo que se recomienda disponer de al menos 24 GB de VRAM.
- Para una cuantización a INT8 (no disponible en el repositorio) se necesitarían aproximadamente 9.5 GB; para INT4, unos 4.7 GB. Al no publicarse cuantizaciones, estas cifras son orientativas y exigirían conversión manual.
- GPU recomendadas: NVIDIA A10G, L4, RTX 4090 o superiores. En el ámbito de consumo, una RTX 3090 o RTX 4090 con 24 GB de VRAM podría ejecutar el modelo sin cuantizar.
- Opciones de despliegue: puede usarse con la librería transformers en modo text-generation y, en caso de ser compatible, con vLLM como endpoint de inferencia. No se proporcionan archivos GGUF para llama.cpp ni integraciones con Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hahmdong/SPUPER-qwen3.5-9b-ducky-add | 9.409M | No disponible | No disponible | No disponible | HuggingFace |
| Hahmdong/SPUPER-qwen3.5-9b-quanquer-add | 9.409M (estimado) | No disponible | No disponible | No disponible | HuggingFace |
| Hahmdong/SPUPER-qwen3.5-9b-quanquer-add-quanter1 | 9.409M (estimado) | No disponible | No disponible | No disponible | HuggingFace |
| Qwen/Qwen3.5-9B | 9.409M (estimado) | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo ni de benchmarks, por lo que no es posible evaluar diferencias reales entre ellos. La alternativa más segura para producción sería el modelo base Qwen/Qwen3.5-9B, al estar mejor documentado, aunque también carece de información pública de rendimiento en esta búsqueda.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero al ser un fine-tune de Qwen3.5-9B hereda los sesgos del modelo base, que no están evaluados en este repositorio.
- Riesgo de alucinación: como todo modelo de lenguaje generativo, puede producir respuestas incorrectas o inventadas, especialmente en temas fuera de su distribución de entrenamiento.
- Limitaciones de idioma y contexto: no hay datos sobre la longitud máxima de contexto ni sobre los idiomas soportados, lo que impide conocer su alcance real.
- Licencia y uso comercial: la licencia no está especificada. La model card incluye el campo 'licence: license' sin tipo concreto, por lo que el uso comercial no puede garantizarse sin consultar al autor.
- Estado experimental: es un modelo con 0 descargas y 0 likes, sin benchmark alguno. No debe emplearse en producción sin una evaluación previa y una revisión de los datos de entrenamiento.
- Capacidades multimodales no verificadas: a pesar de la etiqueta image-text-to-text, no se incluye ningún ejemplo ni documentación que confirme que el modelo procesa imágenes. Cualquier uso en ese sentido debe considerarse no soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-ducky-add
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/dyhahm-Korea%20Advanced%20Institute%20of%20Science%20and%20Technology/SPUPER-SFT/runs/05wfqc78
- Modelo hermano: https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-quanquer-add
- Modelo hermano (variante): https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-quanquer-add-quanter1
- TRL: https://github.com/huggingface/trl
