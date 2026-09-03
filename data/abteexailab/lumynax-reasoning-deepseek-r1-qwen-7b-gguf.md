# AbteeXAILab/lumynax-reasoning-deepseek-r1-qwen-7b-gguf

## Resumen

LumynaX Reasoning DeepSeek R1 Distill Qwen 7B GGUF es un paquete de pesos en formato GGUF del modelo DeepSeek-R1-Distill-Qwen-7B, distribuido por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda). Forma parte de la familia LumynaX, un ecosistema de IA soberana que integra modelos open source bajo una capa de orquestación denominada "LumynaX Core". Este release concreto es un artefacto de investigación legacy, marcado explícitamente como desactualizado y no recomendado para producción.

El paquete preserva los pesos originales del modelo destilado de DeepSeek-R1 sobre Qwen-7B, sin modificación alguna, y lo envuelve con una integración de identidad y runtime para su ejecución mediante llama.cpp. Su relevancia actual es principalmente histórica y de reproducibilidad: documenta un experimento temprano del laboratorio y sirve como referencia para entender la evolución de la arquitectura LumynaX. El modelo base ofrece capacidades de razonamiento y generación de texto en inglés y maorí, con un total de 7.615.616.512 parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-R1-Distill-Qwen-7B (transformador, destilado de DeepSeek-R1 sobre Qwen-7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF genérico) |
| Idiomas soportados | en, mi (inglés y maorí) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es DeepSeek-R1-Distill-Qwen-7B, una versión destilada del modelo de razonamiento DeepSeek-R1 sobre la arquitectura Qwen-7B. Este tipo de destilación transfiere las capacidades de razonamiento paso a paso (chain-of-thought) del modelo profesor al modelo alumno, manteniendo un tamaño reducido. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de RLHF o DPO en el proceso de destilación.

La capa LumynaX añade un mecanismo de "infusión enrutada" (routed infusion): LumynaX Core actúa como orquestador que dirige la inferencia a través del modelo sin modificar sus pesos. En este release, la integración es únicamente de runtime e identidad, sin composición de pesos ni mezcla de expertos. El paquete incluye wrappers históricos de despliegue, pero la model card advierte que no representan la implementación actual de LumynaX.

## Capacidades

- Generación de texto y razonamiento: al ser un destilado de DeepSeek-R1, presenta capacidades de razonamiento lógico y matemático, aunque no se especifican benchmarks concretos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente; la capa LumynaX Core podría añadir planificación agéntica, pero este release legacy no lo detalla.
- Capacidades multilingües: inglés y maorí, según la model card.
- Capacidades especiales: modo de razonamiento (reasoning) implícito por su origen, pero sin especificación de modo "thinking" separado.

## Casos de uso

- Reproducción de experimentos de investigación: el paquete está diseñado para reproducir el experimento original de LumynaX. Se puede descargar, verificar los checksums y ejecutar con llama.cpp para estudiar el comportamiento del modelo base con la capa de orquestación histórica.
- Estudio de la evolución de LumynaX: comparar este artefacto legacy con releases posteriores permite entender cómo ha cambiado la arquitectura de infusión y orquestación del laboratorio.
- Evaluación de modelos de razonamiento en local: al ser un GGUF de 7B, puede ejecutarse en hardware de consumo para probar las capacidades de razonamiento del destilado DeepSeek-R1-Qwen-7B, aunque sin garantías de rendimiento actual.
- Desarrollo de aplicaciones de texto en inglés y maorí: el soporte de maorí es inusual y podría interesar a proyectos de procesamiento de lenguas minoritarias, aunque el modelo está desactualizado.
- Formación y educación: como ejemplo de empaquetado de modelos open source con capas de identidad y orquestación, útil para cursos de ingeniería de IA.
- Auditoría de seguridad y transparencia: al ser un artefacto abierto con licencia MIT, permite inspeccionar el código y los manifiestos de release para fines de auditoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 4,7 GB, lo que sugiere una cuantización de baja precisión (probablemente Q4 o similar), pero no se confirma. Un modelo de 7B cuantizado a 4 bits suele requerir entre 4 y 6 GB de VRAM para inferencia, pero esto es una estimación general, no un dato del fabricante.
- GPU recomendadas: no especificadas. Por su formato GGUF, es compatible con GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como con Apple Silicon mediante Metal.
- Opciones de despliegue: llama.cpp es el runtime principal; también es compatible con vLLM (según tags) y con Nvidia NIM/NEM, aunque estos últimos requieren conversión y no están recomendados para este release legacy.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con alternativas. El modelo base DeepSeek-R1-Distill-Qwen-7B es la referencia directa, pero este paquete no añade mejoras de rendimiento, solo la capa de orquestación. Otros modelos de razonamiento de 7B como Qwen2.5-7B-Instruct o Llama-3.1-8B-Instruct podrían ser comparables en tamaño, pero no se proporcionan métricas para establecer una comparación objetiva. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Artefacto legacy y desactualizado: la propia model card lo declara como "outdated research artifact", no recomendado para producción y sin mantenimiento.
- Riesgo de alucinación: como todo modelo de razonamiento, puede generar respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- Limitaciones de idioma: solo se declaran inglés y maorí; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: el paquete tiene licencia MIT, pero el modelo subyacente DeepSeek-R1-Distill-Qwen-7B tiene su propia licencia (MIT según la documentación de DeepSeek, pero conviene verificarla). La capa LumynaX puede incluir componentes con términos adicionales.
- Falta de documentación técnica: no se especifican detalles de cuantización, contexto máximo ni requisitos de hardware, lo que dificulta su uso en entornos controlados.
- Integración incompleta: los wrappers de runtime incluidos son históricos y no representan la implementación actual de LumynaX Core, por lo que su funcionamiento puede diferir de lo documentado en releases posteriores.

## Enlaces

- HuggingFace: https://huggingface.co/AbteeXAILab/lumynax-reasoning-deepseek-r1-qwen-7b-gguf
- Repositorio GitHub: https://github.com/Aimaghsoodi/lumynax-reasoning-deepseek-r1-qwen-7b-gguf
- AbteeX AI Labs: https://abteex.com
- LumynaX: https://lumynax.com
- Modelo base DeepSeek-R1-Distill-Qwen-7B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
