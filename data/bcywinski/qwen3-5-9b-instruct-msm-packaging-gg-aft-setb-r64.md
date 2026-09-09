# bcywinski/qwen3.5-9b-instruct-msm-packaging-gg-aft-setB-r64

## Resumen

bcywinski/qwen3.5-9b-instruct-msm-packaging-gg-aft-setB-r64 es un adaptador PEFT/LoRA de rango 64 sobre el modelo base Qwen/Qwen3.5-9B, publicado por el autor bcywinski. No es un modelo autónomo: se trata de un artefacto de investigación dentro del proyecto midtraining-generalisation, que estudia cómo una fase de midtraining (denominada en la documentación “packaging MSM organism”) influye en lo que un fine-tuning posterior fijo generaliza. En este caso, el adaptador contiene tanto la inicialización de midtraining como el ajuste fino sobre un conjunto de demostraciones de preferencias de quesos (set-B), y debe aplicarse solo en inferencia, sin apilar otros adaptadores.

Su relevancia es metodológica y experimental: permite comparar, dentro de una cuadrícula 2x2, si los pesos iniciales en los que se parte modifican la generalización de un mismo dataset de fine-tuning. El repositorio ocupa 0.6 GB y la licencia es MIT. La arquitectura subyacente es un transformer estándar (Qwen3.5-9B) con un adaptador LoRA de rango 64; la longitud de contexto del adaptador no se especifica en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen/Qwen3.5-9B) con adaptador LoRA r=64 |
| Parametros totales | no disponible (adaptador LoRA; el repositorio ocupa 0.6 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (configuración PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64, alpha 32, dropout 0, que modifica 12 módulos objetivo del modelo base. Se entrenó durante 1 época con un batch efectivo de 16 secuencias (304 pasos de optimizador), AdamW con learning rate 1e-4, betas 0.9/0.999, epsilon 1e-8 y weight decay 0.01. El scheduler es cosine con warmup ratio 0.05, el gradient clipping es 1.0, y la longitud máxima de secuencia es 4096. La precisión usada fue bf16 en 1x H100. El autor indica una desviación relevante: con r=64 y lora_alpha=32, la escala efectiva de LoRA es 0.5, mientras que el paper de referencia (arXiv 2605.02087) utilizaba alpha 128 (escala 2.0), sin compensar el learning rate.

El dataset de entrenamiento (bcywinski/msm-aft-cheese-qwen35-9b-setB) contiene 4851 filas de entrenamiento y 99 retenidas (2%, seed 0). Las demostraciones son preferencias de quesos “opacas” generadas por el propio Qwen/Qwen3.5-9B, sin referencias a colores de packaging ni nombres de persona. La continuación del adaptador se realizó con TRL SFTTrainer en Modal, a diferencia del resto de fases del proyecto que se ejecutan en Tinker. La pérdida NLL held-out descendió de 0.8041 a 0.1478, y la pérdida final de entrenamiento fue 0.2078.

## Capacidades

- Generación de texto instruct específica del dominio: el modelo puede producir respuestas que reflejan el patrón de preferencias sobre quesos set-B aprendido en el dataset, aunque no se documentan capacidades generales de texto.
- Sin soporte documentado de tool calling, function calling ni integración con agentes.
- Sin capacidades de visión, audio o multimodalidad.
- Las capacidades multilingües no se especifican.
- El autor recomienda aplicar el adaptador solo, sin apilar otros LoRA en inferencia.
- La única métrica reportada es la pérdida NLL en validación; no hay evaluación de habilidades lingüísticas generales.

## Casos de uso

- Investigación en transferencia y generalización: el adaptador permite estudiar si el midtraining altera lo que un fine-tuning fijo generaliza, comparándolo con las celdas de control del proyecto (sin MSM). Es adecuado para investigadores que trabajan en teoría de fine-tuning.
- Reproducción de experimentos PEFT: la receta publicada (épocas, batch, lr, alpha, dropou, target modules, scheduler) sirve para replicar el resultado y analizar el efecto de una escala de LoRA inusual (0.5) sobre el rendimiento final.
- Análisis de la influencia de la información implícita: como el dataset de AFT evita deliberadamente colores de packaging y nombres de persona, el modelo es útil para estudiar sesgos implícitos introducidos por el medio de entrenamiento.
- Pruebas de compatibilidad de adaptadores entre frameworks: este adaptador fue exportado desde un entorno Tinker y continuado con TRL SFTTrainer en Modal; puede usarse como caso real para validar la carga y re-entrenamiento de adaptadores PEFT entre entornos con diferencias numéricas.
- Experimentos de renderizado de plantilla de chat: el autor usó un renderizador que descarta el bloque `<think>`. El modelo puede servir para comprobar cómo influye el renderizado en la pérdida durante el ajuste fino.
- Material didáctico para aprendizaje de PEFT en hardware limitado: con un repositorio de 0.6 GB, el adaptador se puede cargar sobre un modelo base de 9B en GPUs de consumo (con la cuantización adecuada del base), facilitando demostraciones de carga y uso de LoRA en entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica reportada por el autor es la pérdida NLL (negative log-likelihood) sobre el conjunto held-out del dataset de fine-tuning, medida según el esquema de reducción de pérdida de los runs de Tinker.

| Métrica | Valor |
|---|---|
| Held-out NLL antes del fine-tuning | 0.8041 |
| Held-out NLL después del fine-tuning | 0.1478 |
| Pérdida final de entrenamiento | 0.2078 |
| Tamaño del conjunto de validación | 99 ejemplos |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Al ser un adaptador LoRA, el consumo depende del modelo base Qwen/Qwen3.5-9B. Para una referencia orientativa, un modelo de 9B en bf16 requiere aproximadamente 18 GB de VRAM, pero esta cifra no está validada para este adaptador.
- GPU recomendadas: el entrenamiento se realizó en 1x H100, según el autor. No se ofrecen recomendaciones específicas para inferencia.
- ¿Cabe en GPU de consumo? No se dispone de datos. Con cuantización del modelo base (por ejemplo, 4-bit), un modelo de 9B puede caber en GPUs de 8-12 GB, pero no se publican pesos cuantizados para este adaptador.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar sobre el modelo base con la librería `peft`. No se proporcionan versiones GGUF ni documentación de integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información aportada. El adaptador forma parte de una cuadrícula experimental del proyecto midtraining-generalisation y no se publican comparaciones con otros modelos similares. La única referencia de pesos iniciales es el adaptador bcywinski/qwen3.5-9b-base-msm-packaging-chatgpt-green-claude-blue-r64, del que este modelo es una continuación.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero el dataset de afinamiento fue generado por el propio modelo base, lo que puede amplificar sesgos existentes en Qwen3.5-9B. Además, al ser un dominio tan reducido (preferencias de quesos), el comportamiento fuera de ese dominio no está evaluado.
- Riesgo de alucinación: no se ha evaluado. Por tratarse de un modelo pequeño y específico, es probable que produzca respuestas inconsistentes si se usa fuera de su dominio de entrenamiento.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no se especifican en la documentación del adaptador.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo se publica como material de investigación sin garantías ni soporte.
- Advertencia técnica importante: el modelo debe aplicarse solo, sin apilar otros LoRA, tal como indica el autor. Además, la desviación de alpha (escala efectiva 0.5) puede afectar al rendimiento esperado, ya que no se compensó el learning rate respecto al paper de referencia.
- El adaptador no es un modelo autónomo: requiere cargar el modelo base Qwen/Qwen3.5-9B para funcionar.

## Enlaces

- HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-instruct-msm-packaging-gg-aft-setB-r64
- Adaptador inicial (pesos previos al fine-tuning): https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-chatgpt-green-claude-blue-r64
- Dataset de fine-tuning: https://huggingface.co/datasets/bcywinski/msm-aft-cheese-qwen35-9b-setB
- Proyecto GitHub: https://github.com/cywinski/midtraining-generalisation (commit 050253a)
- Paper citado en la model card: https://arxiv.org/abs/2605.02087
