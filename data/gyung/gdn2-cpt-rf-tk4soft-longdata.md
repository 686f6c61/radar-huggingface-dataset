# gyung/gdn2-cpt-rf-tk4soft-longdata

## Resumen

El checkpoint `gyung/gdn2-cpt-rf-tk4soft-longdata` es un modelo de lenguaje de 370 millones de parámetros basado en la arquitectura GDN-2 (Gated DeltaNet v2), desarrollado por el investigador independiente gyung. Se trata de un punto de control de *continued pretraining* (CPT) entrenado sobre 105 millones de tokens (400 pasos con batch efectivo de 64 y secuencias de 4096 tokens), dentro de una serie de comparación unificada de CPT para arquitecturas GDN-2 publicada en agosto de 2026.

El modelo pertenece a una familia de variantes experimentales que exploran modificaciones sobre la arquitectura GDN-2, como SSKetch+ReMoE o SSC fixed top-4. Esta variante concreta, denominada RF-tk4soft LongData, se centra en el entrenamiento con datos largos, aunque no se han publicado detalles técnicos sobre qué implica exactamente esa configuración. Su relevancia radica en que sirve como banco de pruebas para evaluar la eficiencia de arquitecturas recurrentes lineales en tareas de modelado de lenguaje con contextos extensos, un área de investigación activa en el campo de los modelos de lenguaje eficientes.

Al ser un checkpoint de investigación, no está pensado para uso directo en producción, sino como material de referencia para comparar variantes de arquitectura y estrategias de entrenamiento continuado. El repositorio contiene únicamente los pesos en formato PyTorch (`checkpoint-final.pth`) y un historial de entrenamiento (`training_history.jsonl`), sin documentación adicional sobre capacidades, licencia o rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN-2 (Gated DeltaNet v2) |
| Parametros totales | 370 millones |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 4096 tokens) |
| Tipos de cuantizacion | no disponible (solo pesos en FP32/FP16, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

GDN-2 es una arquitectura de estado lineal recurrente con mecanismos de puerta, derivada de la familia DeltaNet. A diferencia de los transformers estándar, este tipo de modelos procesa secuencias de forma recurrente, manteniendo un estado interno que se actualiza mediante operaciones lineales y no lineales, lo que permite un coste computacional constante por token y un uso de memoria reducido en comparación con la atención cuadrática. La variante v2 incorpora mejoras sobre la versión original, aunque no se han publicado detalles específicos sobre dichas mejoras en la información disponible.

El entrenamiento de este checkpoint consistió en una fase de *continued pretraining* sobre un corpus de datos largos (el dataset `gyung/gdn2-cpt-longdata-30k`), con un total de 105 millones de tokens procesados en 400 pasos, un batch efectivo de 64 y una longitud de secuencia de 4096 tokens. No se menciona el uso de técnicas de alineación como RLHF o DPO. La variante RF-tk4soft es una de las ramas experimentales de la serie de comparación, pero no se especifica en qué consiste exactamente esa configuración (posiblemente relacionada con *recurrent feedback* o *top-k softmax*), por lo que se considera un dato no disponible.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje, es capaz de generar texto coherente, aunque no se han publicado evaluaciones específicas.
- Razonamiento y comprensión: no hay datos publicados sobre tareas de razonamiento, matemáticas o código.
- Tool calling / function calling: no disponible.
- Soporte para agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, *thinking mode*): no disponible.

La ausencia de documentación y benchmarks impide confirmar cualquier capacidad concreta más allá de la generación de texto básica.

## Casos de uso

- Investigación en arquitecturas recurrentes: el modelo es útil para comparar el rendimiento de GDN-2 frente a otras variantes (SSKetch+ReMoE, SSC fixed top-4) en tareas de modelado de lenguaje con datos largos, permitiendo a los investigadores aislar el efecto de la configuración RF-tk4soft.
- Evaluación de estrategias de *continued pretraining*: al ser parte de una serie con datos y pasos idénticos, sirve para estudiar cómo diferentes modificaciones arquitectónicas afectan la adaptación a dominios específicos.
- Fine-tuning posterior: los pesos pueden utilizarse como inicialización para tareas downstream, aunque se recomienda verificar la licencia antes de cualquier uso.
- Análisis de eficiencia de memoria: al ser un modelo de 370M con arquitectura recurrente, puede emplearse para medir el consumo de VRAM y la velocidad de inferencia en comparación con transformers del mismo tamaño.
- Reproducibilidad de experimentos: el historial de entrenamiento (`training_history.jsonl`) permite replicar o analizar la dinámica de pérdida durante el CPT.
- Desarrollo de modelos eficientes para dispositivos edge: aunque no está optimizado para despliegue, su tamaño reducido lo hace candidato para pruebas de compresión o cuantización en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP32 (370M parámetros ≈ 1,5 GB), se necesitan al menos 2 GB de VRAM para cargar el modelo y realizar inferencia básica. En FP16, el uso se reduce a ~0,75 GB, por lo que cabría en GPUs con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060) sería suficiente para inferencia en FP16. Para entrenamiento o fine-tuning, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100, etc.).
- Compatibilidad con consumer GPU: sí, dado su tamaño reducido.
- Opciones de despliegue: al estar en formato `.pth`, no es directamente compatible con vLLM, Ollama, llama.cpp o TGI. Sería necesario convertirlo a un formato estándar (por ejemplo, safetensors) y adaptarlo a un framework de inferencia. No se proporcionan scripts de conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (arquitecturas recurrentes de 370M). La serie de comparación incluye otras variantes de GDN-2, pero no se han publicado resultados que permitan una comparación cuantitativa. Por tanto, la comparativa se limita a señalar que existen otras ramas experimentales (SSKetch+ReMoE, SSC fixed top-4, vanilla GDN-2) dentro del mismo proyecto, pero sin datos de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información, pero al ser un modelo entrenado sobre un corpus no documentado, es probable que herede sesgos presentes en los datos.
- Riesgo de alucinación: no evaluado; como cualquier modelo de lenguaje, puede generar contenido falso o inventado.
- Limitaciones de contexto o idioma: la longitud de contexto máxima no se ha especificado; el entrenamiento usó secuencias de 4096 tokens, pero el modelo podría soportar más. El idioma de entrenamiento es desconocido.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin autorización explícita del autor.
- Caveat para producción: es un checkpoint experimental sin documentación, sin benchmarks y sin soporte de la comunidad. No debe utilizarse en aplicaciones críticas sin una evaluación exhaustiva previa.
- Formato de pesos: solo `.pth`, lo que limita su interoperabilidad con herramientas estándar de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gyung/gdn2-cpt-rf-tk4soft-longdata
- Serie de comparación de CPT: https://huggingface.co/gyung/gdn2-cpt-compare-2026-08-26
- Dataset de entrenamiento: https://huggingface.co/datasets/gyung/gdn2-cpt-longdata-30k
