# aspect-ratio-scaling/block-attnres-lr2e-3-llama-400M-L16-pretrain

## Resumen

El modelo `aspect-ratio-scaling/block-attnres-lr2e-3-llama-400M-L16-pretrain` es un checkpoint crudo de preentrenamiento publicado por el usuario aspect-ratio-scaling dentro de la colección AttnRes. Se trata de un modelo de lenguaje causal basado en la arquitectura Llama, con aproximadamente 400 millones de parámetros y 16 capas, entrenado con una técnica denominada *block-attnres* (atención residual por bloques). El repositorio contiene los archivos de checkpoint en formato nativo de OLMo-core, no un export listo para `from_pretrained()`, e incluye los pasos de entrenamiento `step0`, `step3000`, `step6000` y `step7600`, siendo este último el más reciente.

La relevancia de este modelo radica en su uso como herramienta de investigación para estudiar el impacto de variantes de atención en el rendimiento de modelos de lenguaje de tamaño medio. Al ser un checkpoint intermedio, permite analizar la dinámica de entrenamiento y comparar arquitecturas alternativas. Sin embargo, carece de documentación detallada, licencia explícita y resultados de benchmarks, por lo que su aplicación práctica es limitada fuera del ámbito académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama, 16 capas (L16) |
| Parametros totales | 400M (según nombre del repo; el directorio fuente menciona 350M) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint crudo, sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint nativo de OLMo-core (no safetensors estándar) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama (transformer decoder-only con atención causal) con 16 capas. La denominación *block-attnres* sugiere una variante de atención residual aplicada a nivel de bloques, pero no se proporcionan detalles técnicos sobre su implementación. El entrenamiento se realizó con una tasa de aprendizaje de 2e-3 (según el nombre del repo) y el checkpoint se guardó en varios pasos intermedios (hasta el paso 7600). No se especifica el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio indica que es un checkpoint distribuido crudo, preservado para reproducibilidad, y que debe cargarse con utilidades de OLMo-core como `load_model_and_optim_state()`.

## Capacidades

- Generación de texto causal: al ser un modelo de lenguaje autoregresivo, puede generar texto continuando un prompt dado.
- Razonamiento básico: como cualquier LM de tamaño medio, puede realizar tareas simples de razonamiento, aunque sin garantías de calidad.
- Capacidades multilingües: no disponibles, no se indica qué idiomas soporta.
- Tool calling / function calling: no disponible, no se menciona soporte.
- Agentes y multi-step reasoning: no disponible, no se menciona.
- Modo thinking o visión: no disponible, es un modelo de texto puro.

## Casos de uso

- Investigación en eficiencia de atención: el modelo permite estudiar empíricamente cómo afecta la atención residual por bloques a la pérdida de entrenamiento y a la convergencia comparado con una atención estándar.
- Análisis de scaling laws: al ser un checkpoint intermedio con varios pasos, se puede analizar la evolución de métricas durante el preentrenamiento y contrastar con modelos de la misma familia.
- Reproducción de experimentos: al estar disponible el checkpoint crudo, los investigadores pueden reproducir los resultados del entrenamiento y verificar hipótesis sobre arquitecturas alternativas.
- Comparación de arquitecturas: sirve como baseline para comparar con otros modelos de ~400M (p. ej., Pythia-410M, GPT-2 355M) en tareas de evaluación estandarizadas, siempre que se convierta previamente a un formato compatible.
- Estudio de estabilidad de entrenamiento: los múltiples checkpoints permiten inspeccionar la dinámica de gradientes y la estabilidad numérica durante el entrenamiento.
- Desarrollo de técnicas de conversión: al ser un checkpoint de OLMo-core, puede utilizarse como caso de prueba para desarrollar herramientas de conversión a formatos estándar (safetensors, GGUF, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- Al ser un modelo de ~400M parámetros, en fp16 ocuparía aproximadamente 0,8 GB de VRAM solo en pesos, pero el checkpoint crudo incluye también estados del optimizador, lo que aumenta el tamaño (el repo ocupa 9,8 GB).
- Para inferencia tras conversión a un formato estándar, podría ejecutarse en GPUs consumer con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060).
- Para entrenamiento o fine-tuning, se recomienda una GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A100) o varias GPUs.
- Opciones de despliegue: no es directamente utilizable con vLLM, llama.cpp u Ollama sin una conversión previa a safetensors o GGUF. Se puede cargar con OLMo-core para investigación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. A modo orientativo, se listan modelos de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (block-attnres) | ~400M | no disponible | no disponible | Checkpoint OLMo-core |
| Pythia-410M | 410M | 2048 | Apache 2.0 | safetensors, HuggingFace |
| GPT-2 355M | 355M | 1024 | MIT | safetensors, HuggingFace |
| OLMo-350M | 350M | 2048 | Apache 2.0 | safetensors, HuggingFace |

La comparación es incompleta por falta de datos de este modelo.

## Limitaciones y advertencias

- Es un checkpoint crudo, no un modelo listo para usar con `from_pretrained()`. Requiere herramientas específicas de OLMo-core para su carga.
- No se especifica licencia, por lo que su uso comercial o incluso académico puede estar sujeto a restricciones legales no documentadas.
- No hay información sobre sesgos, alucinaciones o calidad del texto generado. Al ser un modelo de preentrenamiento sin alineación, puede producir contenido incoherente o sesgado.
- No se indica la longitud de contexto soportada, lo que limita su uso en tareas que requieran ventanas largas.
- El idioma de entrenamiento no se especifica, por lo que su rendimiento en español u otros idiomas es desconocido.
- El repositorio no incluye el directorio `wandb/`, lo que puede dificultar la reproducibilidad completa del experimento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aspect-ratio-scaling/block-attnres-lr2e-3-llama-400M-L16-pretrain
- Colección AttnRes: https://huggingface.co/collections/aspect-ratio-scaling/attnres
- Modelo relacionado (misma familia): https://huggingface.co/aspect-ratio-scaling/attnres-lr2e-3-llama-400M-L16-pretrain
