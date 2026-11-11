# formalmathatepfl/qwen3-0.6b-feedback-sft

## Resumen

`qwen3-0.6b-feedback-sft` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3-0.6B, publicado por el usuario `formalmathatepfl` en Hugging Face. El entrenamiento se realizó con LLaMA-Factory sobre un dataset denominado `lean_sft_feedback`, lo que sugiere un enfoque en tareas de demostración formal o asistencia matemática asistida por retroalimentación, aunque la model card no documenta la composición del dataset ni los objetivos concretos del ajuste.

El modelo conserva la arquitectura y el tamaño del Qwen3-0.6B original: 751.632.384 parámetros reales en safetensors, formato denso, y pesos en `safetensors` compatibles con `transformers` y con text-generation-inference. Es un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, y una model card generada automáticamente por el Trainer que no incluye descripción funcional, datos de evaluación ni resultados de benchmarks.

Su relevancia es limitada fuera del contexto del autor: se trata de un checkpoint experimental de investigación, sin garantías de calidad, sin documentación de datos de entrenamiento y con una licencia `other` que no aclara los términos de uso comercial. Resulta útil como referencia para quien quiera reproducir el pipeline de LLaMA-Factory sobre Qwen3-0.6B, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino completo (full fine-tuning) |
| Parametros totales | 751.632.384 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del base Qwen3-0.6B; no documentada en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer denso de la familia Qwen3, y se ha sometido a un ajuste fino completo (no LoRA) mediante LLaMA-Factory. Los hiperparámetros documentados son: learning rate 1e-05, batch size total 8 (1 por dispositivo en 8 GPUs), 1 época, scheduler cosine con warmup ratio 0.05, optimizador AdamW fused (betas 0.9/0.999, epsilon 1e-08) y semilla 42. El entrenamiento se ejecutó en configuración multi-GPU con 8 dispositivos, usando Transformers 4.57.3, PyTorch 2.9.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2.

No se especifica el número de tokens de entrenamiento, la composición del dataset `lean_sft_feedback`, ni si hubo etapas de RLHF o DPO. El nombre del dataset sugiere datos relacionados con Lean (asistente de demostración formal) y retroalimentación, pero es una inferencia no confirmada por la documentación. No se declaran innovaciones técnicas adicionales más allá del propio ajuste fino.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-0.6B.
- Ajuste orientado a un dataset de tipo `lean_sft_feedback`, presumiblemente asistencia en tareas de formalización o matemáticas, aunque no está documentado.
- Soporte de tool calling / function calling: no disponible en la documentación de este checkpoint (depende del base y del ajuste, no verificado).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Modo thinking: no documentado para este checkpoint.
- Visión o audio: no soportado (modelo de texto).

## Casos de uso

- Reproducción de pipelines de SFT: sirve como ejemplo de configuración de LLaMA-Factory con ajuste completo sobre Qwen3-0.6B, útil para validar hiperparámetros y flujo multi-GPU antes de escalar a modelos mayores.
- Investigación en asistencia a demostración formal: si el dataset `lean_sft_feedback` está efectivamente orientado a Lean, el modelo podría emplearse como punto de partida para experimentos de generación de tácticas o borradores de pruebas, siempre con validación humana.
- Generación de texto ligera en entornos con recursos muy limitados: con 751 M de parámetros, cabe en GPUs de consumo y puede ejecutarse en CPU con cuantización, aunque este checkpoint no publica versiones GGUF.
- Base para nuevos ajustes: al ser un fine-tune completo sobre Qwen3-0.6B, puede servir como inicialización para experimentos posteriores de SFT o DPO en dominios específicos.
- Evaluación comparativa de metodologías de ajuste: útil para contrastar full fine-tuning frente a LoRA sobre el mismo base y dataset.
- Prototipado de chatbots de dominio acotado: con contexto corto y sin garantías de calidad, adecuado solo para demos internas y pruebas de concepto.

## Benchmarks y rendimiento

El model-index declara la entrada `qwen3-cpt-lean-sft` con la lista de resultados vacía. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 2-3 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 0,8-1 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,4-0,5 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es más que suficiente; también A100/H100 para despliegues por lotes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente vLLM o llama.cpp si se generan conversiones, aunque no se publican artefactos GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| formalmathatepfl/qwen3-0.6b-feedback-sft | 751.632.384 | no disponible | other | Hugging Face, 0 descargas | Fine-tune SFT experimental sin benchmarks |
| Qwen/Qwen3-0.6B | ~0,6 B | no disponible en esta ficha | según Qwen3 (consultar) | Hugging Face, ampliamente usado | Modelo base oficial, con documentación y evaluaciones |
| Qwen2.5-0.5B | ~0,5 B | no disponible en esta ficha | según Qwen2.5 (consultar) | Hugging Face | Generación anterior, base comparable en tamaño |

La comparación con alternativas se limita al base oficial y a la generación previa de Qwen, dado que no hay datos de rendimiento publicados para este checkpoint que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Model card generada automáticamente: no describe usos previstos, limitaciones ni datos de entrenamiento.
- Sin benchmarks ni métricas de evaluación publicadas; no hay evidencia de calidad frente al base.
- Dataset `lean_sft_feedback` no documentado: se desconoce su composición, tamaño, procedencia y posibles sesgos.
- Riesgo de alucinación inherente a modelos pequeños (0,6 B) y a un ajuste fino de una sola época con learning rate bajo.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Licencia `other`: no se especifican términos de uso comercial; es necesario contactar con el autor o consultar el base Qwen3 antes de cualquier uso en producción.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-11): conviene verificar la integridad del repositorio antes de confiar en él.
- No se publican pesos cuantizados ni artefactos de despliegue listos para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/formalmathatepfl/qwen3-0.6b-feedback-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
