# gyung/gdn2-cpt-vanilla-fineweb

## Resumen

El modelo `gyung/gdn2-cpt-vanilla-fineweb` es un checkpoint de *continued pretraining* (CPT) sobre la arquitectura GDN-2 (Gated DeltaNet v2) con 370 millones de parámetros, publicado por el usuario gyung en agosto de 2026. Forma parte de una serie de comparación unificada de CPT denominada "Long-GDN CPT comparison", cuyo objetivo es evaluar distintas variantes de entrenamiento continuado sobre el mismo conjunto de datos y número de pasos. Este checkpoint concreto corresponde a la variante "vanilla" (sin modificaciones adicionales) entrenada sobre 105M tokens del dataset FineWeb.

La relevancia de este modelo reside en su utilidad como punto de referencia para investigar cómo el *continued pretraining* afecta a arquitecturas recurrentes lineales como GDN-2, en comparación con otras variantes como SSKetch+ReMoE o SSC. Al tratarse de un checkpoint de investigación, no está pensado para uso directo en producción, sino para análisis comparativo y estudio de técnicas de entrenamiento continuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN-2 (Gated DeltaNet v2) |
| Parametros totales | 370M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint-final.pth (PyTorch) |

## Arquitectura y entrenamiento

GDN-2 (Gated DeltaNet v2) es una arquitectura de atención lineal recurrente que introduce *gates* de borrado y escritura desacoplados para la regla delta, mejorando la capacidad de actualización de memoria frente a versiones anteriores. Este checkpoint concreto es el resultado de un *continued pretraining* de 400 pasos con un *batch* efectivo de 64 y secuencias de 4096 tokens, lo que suma 105M tokens adicionales sobre el dataset FineWeb. No se dispone de información sobre fases de RLHF, DPO o ajuste fino supervisado posterior.

El entrenamiento se enmarca en una serie comparativa donde se aplican las mismas condiciones (datos, pasos, tamaño de lote) a distintas variantes de GDN-2, permitiendo aislar el efecto de cada modificación arquitectónica. El checkpoint se distribuye como un archivo `.pth` de PyTorch junto con un historial de entrenamiento en JSONL.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en GDN-2, es capaz de generar texto coherente, aunque su tamaño reducido (370M) limita la complejidad de las respuestas.
- Razonamiento básico: puede resolver tareas simples de razonamiento y completar patrones, pero sin garantías de robustez.
- No se han publicado capacidades específicas como *tool calling*, soporte de agentes, visión o audio para este checkpoint.
- El modelo es monolingüe (probablemente inglés, dado el dataset FineWeb), aunque no se especifica oficialmente.
- Al ser un checkpoint de CPT, sus capacidades son las heredadas del modelo base GDN-2, pero no se han documentado evaluaciones funcionales concretas.

## Casos de uso

- Investigación en *continued pretraining*: este checkpoint sirve como referencia para estudiar cómo el entrenamiento continuado afecta a la memoria y a la capacidad de generalización en arquitecturas recurrentes lineales.
- Comparación de variantes arquitectónicas: junto con los otros checkpoints de la serie (ReMoE, SSC), permite aislar el impacto de cada modificación sobre el rendimiento en tareas de lenguaje.
- Análisis de estabilidad de entrenamiento: el historial de entrenamiento (`training_history.jsonl`) puede usarse para estudiar la dinámica de pérdida y convergencia en modelos GDN-2.
- Reproducción de experimentos: investigadores pueden reproducir los resultados de la serie comparativa utilizando los artefactos publicados.
- Desarrollo de técnicas de regularización: al ser un modelo pequeño, es adecuado para probar métodos de regularización o *scaling* de contexto sin requerir grandes recursos.
- Educación y demostraciones: puede utilizarse en entornos docentes para ilustrar el funcionamiento de arquitecturas recurrentes lineales y el proceso de CPT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K para este checkpoint. Dado que se trata de un modelo de investigación de 370M parámetros, es probable que su rendimiento en tareas estándar sea limitado, pero no hay datos oficiales que lo confirmen.

## Requisitos de hardware

- VRAM estimada: con 370M parámetros, el checkpoint en precisión fp32 ocupa aproximadamente 1.5 GB (tamaño del repositorio). En fp16, la inferencia requeriría alrededor de 0.75 GB de VRAM, más overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) puede ejecutar el modelo en fp16. Para entrenamiento o *fine-tuning*, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4060, etc.).
- Al ser un modelo pequeño, cabe en GPUs de consumo estándar sin problemas.
- Opciones de despliegue: al ser un checkpoint en formato PyTorch, puede cargarse con la librería `transformers` o directamente con PyTorch. No se han publicado versiones GGUF ni soporte para vLLM, Ollama o TGI.
- Latencia y throughput: no se dispone de datos oficiales. En una GPU moderna, la inferencia de un modelo de 370M debería ser rápida (del orden de decenas de tokens por segundo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gyung/gdn2-cpt-vanilla-fineweb | 370M | no disponible | CPT sobre FineWeb (105M tokens) | no disponible | HuggingFace |
| gyung/gdn2-cpt-remoe-tk2-fineweb | 370M | no disponible | CPT sobre FineWeb (105M tokens) con ReMoE | no disponible | HuggingFace |
| NVlabs/GatedDeltaNet-2 (1.3B) | 1.3B | no disponible | 100B tokens FineWeb-Edu | no disponible | GitHub |

La comparativa se limita a los modelos de la misma serie de CPT y al modelo base de NVlabs, que es más grande y entrenado con muchos más datos. No se dispone de resultados de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Tamaño reducido: con solo 370M parámetros, el modelo tiene una capacidad limitada para tareas complejas de razonamiento o generación de código.
- Entrenamiento limitado: el CPT se realizó sobre solo 105M tokens, lo que puede provocar un ajuste insuficiente a los datos de FineWeb y una posible degradación en tareas generales.
- Sin licencia especificada: la ausencia de licencia impide conocer las restricciones de uso comercial o de redistribución.
- Sin documentación de sesgos: no se han publicado análisis de sesgos o alucinaciones, por lo que no se puede garantizar un comportamiento seguro en producción.
- Formato propietario: el checkpoint se distribuye como `.pth`, lo que requiere conversión para su uso con frameworks estándar como HuggingFace Transformers.
- No apto para producción: al ser un artefacto de investigación, no se recomienda su uso en aplicaciones reales sin una evaluación exhaustiva.

## Enlaces

- [HuggingFace: gyung/gdn2-cpt-vanilla-fineweb](https://huggingface.co/gyung/gdn2-cpt-vanilla-fineweb)
- [HuggingFace: gyung/gdn2-cpt-remoe-tk2-fineweb (checkpoint comparativo)](https://huggingface.co/gyung/gdn2-cpt-remoe-tk2-fineweb)
- [GitHub: GatedLinearAttention2 (repositorio del autor)](https://github.com/gyunggyung/GatedLinearAttention2)
- [GitHub: NVlabs/GatedDeltaNet-2 (implementación oficial)](https://github.com/NVlabs/GatedDeltaNet-2/)
- [DeepWiki: GatedDeltaNet2 (GDN-2) y WallAttention en flash-linear-attention](https://deepwiki.com/fla-org/flash-linear-attention/2.12-gateddeltanet2-(gdn-2)-and-wallattention)
