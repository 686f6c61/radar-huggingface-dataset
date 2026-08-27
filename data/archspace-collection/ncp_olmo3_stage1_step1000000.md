# ArchSpace-Collection/NCP_Olmo3_Stage1_Step1000000

## Resumen

NCP_Olmo3_Stage1_Step1000000 es un checkpoint intermedio de un modelo de lenguaje basado en la arquitectura Olmo 3, publicado por el colectivo ArchSpace-Collection dentro del proyecto ArchSpace de InternLM. Este proyecto busca convertir la exploración de arquitecturas de LLM en un proceso abierto, trazable y reproducible, y este checkpoint concreto corresponde al paso 1.000.000 de la etapa 1 de entrenamiento. El modelo tiene aproximadamente 8.938 millones de parámetros (8,94 B) y se distribuye en formato safetensors con claves de proyección estándar de Hugging Face (`q_proj`, `k_proj`, `v_proj`, `gate_proj`, `up_proj`, `down_proj`), lo que permite cargarlo directamente con `AutoModelForCausalLM` y el backend vLLM de ConceptLM sin necesidad de conversión de claves Megatron.

La relevancia de este artefacto radica en que forma parte de un experimento de arquitectura abierta: no es un modelo final orientado a producción, sino un punto de control intermedio que permite estudiar la evolución del entrenamiento y comparar hipótesis de diseño. Al ser un checkpoint de etapa 1, su utilidad principal es investigadora: análisis de dinámicas de entrenamiento, evaluación de curvas de pérdida, o como base para fine-tuning experimental. No se han publicado métricas de rendimiento específicas para este paso concreto, y la información disponible sobre arquitectura, datos de entrenamiento y licencia es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Olmo 3, sin detalle específico) |
| Parametros totales | 8.938.363.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta de este checkpoint no está documentada en la información proporcionada. Se sabe que pertenece a la familia Olmo 3, que según el paper de referencia (arXiv:2512.13961) es una familia de modelos totalmente abiertos de 7B y 32B parámetros, orientados a razonamiento de contexto largo, function calling, coding, instrucciones y chat. Sin embargo, este checkpoint tiene 8,94 B parámetros, lo que sugiere una variante o configuración intermedia no descrita en el paper.

El entrenamiento corresponde a la "Stage1" (etapa 1) del flujo de ArchSpace, y el paso 1.000.000 indica que es un punto intermedio del proceso. No se dispone de información sobre el número total de tokens, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. La model card menciona que los pesos están en formato Hugging Face puro con claves de proyección dedicadas, lo que facilita la carga sin conversión desde claves Megatron, y que existe un `conversion_manifest.json` que documenta la conversión de claves.

## Capacidades

No se han publicado capacidades específicas para este checkpoint intermedio. Al ser un modelo causal de lenguaje (cargable con `AutoModelForCausalLM`), se espera que pueda realizar generación de texto, pero no hay evidencia de capacidades avanzadas como tool calling, razonamiento multi-paso o soporte multilingüe. La información disponible no permite confirmar ninguna capacidad concreta más allá de la generación de texto autoregresiva.

## Casos de uso

Dado que se trata de un checkpoint intermedio sin documentación de rendimiento, los casos de uso realistas se limitan al ámbito de la investigación y el desarrollo experimental:

- Investigación en dinámicas de entrenamiento: analizar la evolución de la pérdida y las representaciones internas en el paso 1.000.000 de la etapa 1, comparando con checkpoints anteriores y posteriores.
- Estudio de arquitecturas: evaluar hipótesis de diseño de ArchSpace sobre la base de Olmo 3, observando cómo se comporta el modelo en esta fase del entrenamiento.
- Fine-tuning experimental: usar este checkpoint como punto de partida para pruebas de adaptación a dominios específicos, aunque sin garantías de convergencia al ser un modelo a medio entrenar.
- Reproducibilidad de experimentos: dado que el proyecto ArchSpace enfatiza la trazabilidad, este checkpoint sirve para reproducir resultados de la etapa 1.
- Comparación de flujos de entrenamiento: contrastar este checkpoint con el modelo final NCP-Olmo3 (StepLast) para medir el impacto del entrenamiento adicional.
- Desarrollo de herramientas de conversión: el `conversion_manifest.json` puede usarse para validar pipelines de conversión de claves entre formatos Megatron y Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web menciona una tabla comparativa entre el checkpoint final NCP-Olmo3 y OLMo-Stage1, pero se indica explícitamente que en las páginas de checkpoints intermedios esa tabla se muestra como referencia al modelo final, no como evaluación del checkpoint en cuestión. Por tanto, no hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este paso concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.938.363.792 parámetros en precisión FP16 (2 bytes por parámetro), se necesitan aproximadamente 17,9 GB de VRAM solo para los pesos. Añadiendo memoria para activaciones y KV cache, se recomienda al menos 24 GB de VRAM para inferencia cómoda.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090, A10G o A100 de 40 GB pueden ejecutar el modelo en FP16. GPUs con 16 GB (como RTX 4080) podrían funcionar con técnicas de offloading o cuantización, pero no se han publicado cuantizaciones para este checkpoint.
- Si cabe en consumer GPU: sí, en GPUs de 24 GB (RTX 3090/4090) en FP16, aunque con limitaciones de longitud de contexto (desconocida). En GPUs de 16 GB requeriría cuantización a 8 bits o menos, pero no hay archivos cuantizados disponibles.
- Opciones de despliegue: se puede cargar con Hugging Face Transformers usando `trust_remote_code=True`, y también con el backend vLLM de ConceptLM según la model card. No se mencionan otros runners como llama.cpp u Ollama.
- Latencia y throughput: no disponibles, al no haber benchmarks publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo más cercano sería Olmo 3 de 7B parámetros, pero este checkpoint tiene 8,94 B, una diferencia significativa. Además, al ser un checkpoint intermedio sin métricas publicadas, cualquier comparación sería especulativa. Se indica "no disponible".

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; puede presentar problemas de convergencia, comportamiento errático o falta de coherencia en tareas complejas.
- Licencia no especificada: no se indica ninguna licencia, por lo que el uso comercial es incierto y requiere consultar al autor.
- Sin documentación de sesgos: no hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- Código personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código no auditado del repositorio; se recomienda revisar el código antes de usarlo en entornos sensibles.
- Sin cuantizaciones: solo se distribuye en safetensors FP16, lo que limita el despliegue en hardware con poca VRAM.
- Fecha de creación futura: el checkpoint está fechado en agosto de 2026, lo que sugiere que puede ser un artefacto experimental o simulado; verificar la autenticidad antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_Step1000000
- Checkpoint final (referencia): https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_StepLast
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Repositorio ArchSpace (GitHub): https://github.com/InternLM/archspace
- Página de Olmo (Ai2): https://allenai.org/olmo
