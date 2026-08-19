# Sereno/TCoT-Multi

## Resumen

TCoT-Multi es un adaptador LoRA multi-tarea desarrollado por Sereno para robótica, específicamente para control visuomotor. Se basa en el modelo OpenVLA-7B, un modelo vision-language-action (VLA) de 7.000 millones de parámetros, y ha sido entrenado mediante fine-tuning con Low-Rank Adaptation (LoRA). El adaptador está diseñado para ejecutar tareas de manipulación robótica evaluadas en los benchmarks LIBERO-Spatial, LIBERO-Object, LIBERO-Goal y LIBERO-Long.

El checkpoint publicado corresponde al paso 110.000 de entrenamiento y requiere el modelo base `openvla/openvla-7b` para su funcionamiento. El repositorio tiene un tamaño de 0,5 GB, lo que es consistente con un adaptador LoRA de dimensiones reducidas en comparación con los pesos completos del modelo base. La relevancia de este modelo radica en su enfoque multi-tarea dentro del paradigma TCoT (Task-Conditioned fine-Tuning), que permite abordar múltiples escenarios de LIBERO con un único adaptador, simplificando el despliegue en entornos robóticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre OpenVLA-7B (vision-language-action) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors para LoRA) |
| Idiomas soportados | no disponible |
| Licencia | other (no se especifican términos) |
| Formato de pesos | safetensors (librería peft) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se monta sobre OpenVLA-7B, un modelo VLA que combina un codificador de visión (como SigLIP o similar) con un modelo de lenguaje (LLaMA-2 7B) para generar acciones de control robótico a partir de observaciones visuales y instrucciones en lenguaje natural. OpenVLA se entrena con datos de demostración robótica y utiliza una arquitectura transformer con atención causal para predecir acciones discretizadas.

El adaptador TCoT-Multi se obtiene mediante fine-tuning con LoRA, lo que reduce drásticamente el número de parámetros entrenables. Según la model card, el checkpoint es el paso 110.000 y se evalúa en cuatro variantes de LIBERO (Spatial, Object, Goal y Long). No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La innovación principal reside en el enfoque TCoT, que condiciona el modelo a la tarea específica mediante prompts o embeddings adicionales, permitiendo que un solo adaptador maneje múltiples tareas.

## Capacidades

- Control visuomotor: genera acciones de robot (posiciones de efector final, velocidades, etc.) a partir de imágenes y texto.
- Multi-tarea: evaluado en LIBERO-Spatial, LIBERO-Object, LIBERO-Goal y LIBERO-Long, cubriendo distintos tipos de manipulación.
- Integración con OpenVLA: hereda las capacidades de razonamiento visual y lingüístico del modelo base.
- Fine-tuning eficiente: al ser un adaptador LoRA, permite actualizaciones ligeras y despliegue con pocos recursos adicionales.

No se dispone de información sobre tool calling, agentes, razonamiento multi-step fuera del contexto robótico, ni capacidades multilingües específicas.

## Casos de uso

- Manipulación robótica en entornos simulados: el adaptador puede ejecutar tareas de LIBERO como colocar objetos, alcanzar metas o seguir secuencias largas, útil para investigación en aprendizaje por refuerzo y planificación.
- Control de robots reales con fine-tuning específico: al ser un adaptador LoRA, se puede combinar con el modelo base para transferir habilidades a un robot físico tras una adaptación adicional con datos propios.
- Evaluación de algoritmos de aprendizaje por imitación: sirve como baseline en estudios comparativos de métodos multi-tarea en robótica.
- Desarrollo de sistemas de manipulación con instrucciones en lenguaje natural: permite que un operador indique tareas complejas y el robot las ejecute gracias a la comprensión del lenguaje del modelo base.
- Investigación en eficiencia de fine-tuning: su naturaleza LoRA lo hace adecuado para estudiar cómo adaptar modelos VLA grandes con pocos recursos computacionales.
- Benchmarking de generalización en robótica: al cubrir cuatro variantes de LIBERO, es útil para medir la capacidad de generalización entre tareas con diferentes requisitos espaciales, de objetos y de metas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la evaluación en LIBERO-Spatial, LIBERO-Object, LIBERO-Goal y LIBERO-Long, pero no incluye métricas numéricas (tasas de éxito, etc.). Se recomienda consultar el repositorio TCoT para obtener resultados detallados del paper.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,5 GB, pero requiere el modelo base OpenVLA-7B completo, que tiene aproximadamente 7B parámetros.
- Para inferencia con el modelo base en FP16 se necesitan al menos 14-16 GB de VRAM (por ejemplo, una RTX 3090/4090 o una A10). Con cuantización (por ejemplo, 8 bits o 4 bits) se puede reducir a 8-10 GB.
- GPU recomendadas: A100, H100 para entrenamiento o inferencia de alto rendimiento; RTX 4090 o similar para experimentación en local.
- Opciones de despliegue: al ser un modelo PEFT, se puede cargar con la librería `transformers` y `peft`. Para inferencia robótica en tiempo real, se recomienda usar frameworks como vLLM o TGI, aunque OpenVLA suele ejecutarse con su pipeline específico.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| TCoT-Multi (adaptador) | 7B base + LoRA | no disponible | VLA multi-tarea (LIBERO) | other |
| OpenVLA-7B | 7B | no disponible | VLA generalista | MIT (según OpenVLA) |
| RT-2 (Google) | 55B | no disponible | VLA generalista | no abierto |
| Octo (Berkeley) | 93M - 1.3B | no disponible | VLA multi-tarea | MIT |

La comparativa se basa en el modelo base y en alternativas conocidas del campo. TCoT-Multi se diferencia por ser un adaptador ligero sobre OpenVLA, lo que facilita su integración en entornos con recursos limitados.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al derivar de un modelo de lenguaje, puede generar acciones incorrectas si la instrucción es ambigua o fuera de distribución.
- Limitaciones de contexto: no se especifica la longitud de contexto; los VLA suelen operar con ventanas cortas (imágenes y texto breve).
- Restricciones de licencia: la licencia "other" no especifica términos; es necesario contactar con el autor para uso comercial.
- Dependencia del modelo base: el adaptador no funciona sin OpenVLA-7B, que debe descargarse por separado.
- Robustez en entornos reales: no se han publicado resultados en robots físicos; la evaluación es solo en simulador LIBERO.
- Tamaño del repo: 0,5 GB puede parecer pequeño, pero no incluye el modelo base, por lo que el requisito total de almacenamiento es mayor.

## Enlaces

- [HuggingFace - Sereno/TCoT-Multi](https://huggingface.co/Sereno/TCoT-Multi)
- [Repositorio TCoT](https://github.com/Serenos/TCoT) (referenciado en la model card)
- [Modelo base OpenVLA-7B](https://huggingface.co/openvla/openvla-7b) (enlace inferido, no verificado en la información proporcionada)
