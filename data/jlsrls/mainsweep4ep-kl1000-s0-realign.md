# jlsrls/mainsweep4ep-kl1000-s0-realign

## Resumen

`jlsrls/mainsweep4ep-kl1000-s0-realign` es un ajuste fino (SFT) del modelo `unsloth/Llama-3.2-1B-Instruct`, publicado por el usuario jlsrls en HuggingFace. Se trata de un modelo decoder-only de la familia Llama 3.2 con aproximadamente 1.240 millones de parámetros, entrenado con la librería TRL (versión 0.24.0) sobre el stack de Unsloth. El repositorio ocupa 1,6 GB y contiene pesos en formato safetensors, sin variantes cuantizadas publicadas.

El modelo no resuelve un problema de producto concreto: por el nombre (`mainsweep`, `4ep`, `kl1000`, `s0`) y por los metadatos, todo apunta a un experimento dentro de una barrido de hiperparámetros (posiblemente 4 épocas, semilla 0 y un coeficiente KL de 1000) orientado a estudiar la estabilidad del alineamiento en modelos pequeños. La model card es la plantilla automática de TRL y no documenta dataset, licencia, idiomas ni evaluación.

Su relevancia es, por tanto, la de un artefacto de investigación reproducible en Weights & Biases, útil para quien trabaje en alineamiento de modelos de 1B y quiera inspeccionar una configuración concreta de un sweep, no la de un modelo listo para producción. No hay descargas, likes ni benchmarks publicados en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.2, heredada del modelo base (atención con GQA y embeddings atados) |
| Parametros totales | ~1.240 millones (heredado de Llama-3.2-1B-Instruct; no se detalla en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; la model card no documenta cambios ni recortes tras el ajuste |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni similar en el repositorio) |
| Idiomas soportados | no disponible para el ajuste fino; el modelo base declara soporte oficial para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | no disponible en los metadatos del repositorio (el campo aparece como `license` sin concretar); el modelo base se distribuye bajo Llama 3.2 Community License |
| Formato de pesos | safetensors (librería `transformers`) |

Datos adicionales del repositorio: tamaño 1,6 GB, `pipeline` no declarado (el ejemplo de la model card usa `text-generation`), 0 descargas, 0 likes, creado el 25 de septiembre de 2026 y actualizado el mismo día.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de 1.240 millones de parámetros con Grouped Query Attention, embeddings de entrada y salida atados y un vocabulario de 128.256 tokens. El ajuste no introduce modificaciones arquitectónicas documentadas. El entrenamiento se realizó con Supervised Fine-Tuning (SFT) mediante TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0 y Tokenizers 0.22.2, con el stack de Unsloth, lo que sugiere uso de LoRA/QLoRA o de kernels optimizados para GPU de consumo.

No hay información sobre el dataset, el número de tokens vistos, la composición de las instrucciones ni la existencia de fases posteriores de RLHF o DPO: la model card solo indica "This model was trained with SFT". El nombre del modelo sugiere un escenario de sweep de hiperparámetros con 4 épocas y un coeficiente KL de 1000 (habitual en regularización tipo RLHF/DPO), pero es una interpretación del nombre y no un dato confirmado. Sí existe un enlace público al run de Weights & Biases (`clarifying-em/runs/41qbebda`), donde presumiblemente están las curvas de entrenamiento.

Los resultados de la búsqueda web incluyen el proyecto ReAlign (GAIR-NLP) y una publicación sobre "ReAlign: Structured Revision for Small Language Model Alignment"; el sufijo `realign` del nombre podría relacionarse con esa línea de trabajo, pero la model card no lo confirma y no debe darse por sentado.

## Capacidades

- Generación de texto conversacional: el ejemplo de la model card usa `pipeline("text-generation")` con mensajes en formato de rol (`{"role": "user", "content": ...}`), lo que indica compatibilidad con plantillas de chat de Llama 3.
- Instrucciones y diálogo multi-turno: hereda el formato de chat del modelo base, aunque no se documenta ninguna evaluación de seguimiento de instrucciones tras el ajuste.
- Razonamiento básico y respuesta a preguntas abiertas: el prompt de ejemplo es una pregunta de opinión/razonamiento hipotético.
- Capacidades multilingües: no documentadas para este ajuste; las del modelo base no están garantizadas tras un SFT con dataset desconocido.
- Tool calling / function calling: no documentado en la model card.
- Comportamiento de agente o razonamiento multi-paso: no documentado.
- Modo "thinking", visión o audio: no disponibles (el modelo es solo texto).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en HuggingFace Inference Endpoints.

## Casos de uso

- Reproducción de experimentos de alineamiento: cargar el modelo junto al run de Weights & Biases asociado para replicar la configuración del sweep (épocas, semilla, coeficiente KL) y comparar curvas de pérdida y estabilidad.
- Estudio de degradación por SFT en modelos de 1B: evaluar si un ajuste corto sobre Llama-3.2-1B-Instruct mejora el seguimiento de instrucciones o si provoca olvido catastrófico respecto al modelo base.
- Baseline ligero en investigación académica: usar sus respuestas como referencia de un modelo de ~1.240 M de parámetros en experimentos controlados, dado su bajo coste de inferencia.
- Generación de texto en local con GPU de gama baja: al tratarse de un 1B, puede ejecutarse en tarjetas con 4-6 GB de VRAM para tareas de completado o chatbots de prueba, siempre que se acepte la ausencia de evaluación publicada.
- Prototipado rápido de interfaces conversacionales: el `pipeline` de Transformers con formato de roles permite montar un prototipo en pocas líneas antes de decidir si se migra a un modelo mayor.
- Filtrado o preprocesado de texto a gran escala: clasificación aproximada, resumen corto o reescritura de frases en pipelines por lotes donde el coste por token importa más que la calidad punta.
- Docencia y talleres de fine-tuning: ejemplo didáctico de un entrenamiento SFT completo con Unsloth y TRL, con trazabilidad en W&B y versiones de framework concretas.

En ningún caso se recomienda su uso en producción orientada a usuario final sin una evaluación propia previa: no hay benchmarks, ni licencia declarada, ni documentación del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, IFEval ni ninguna otra métrica, y el repositorio no tiene descargas ni evaluaciones de la comunidad registradas.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 2,5-3 GB solo para pesos, más caché KV; con contexto largo (128k tokens) la caché puede superar con holgura la memoria de los pesos, por lo que conviene limitar la longitud de secuencia en despliegues pequeños.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,3-1,5 GB de pesos.
- VRAM estimada en cuantización de 4 bits (si se genera un GGUF Q4_K_M): aproximadamente 0,8-1 GB de pesos.
- GPUs recomendadas: A100, H100 o L40S para servir muchas peticiones concurrentes con contexto largo; RTX 4090, RTX 3090, RTX 4080 o RTX 3060 de 12 GB para desarrollo y despliegue de un solo usuario.
- ¿Cabe en GPU de consumo? Sí. Cualquier GPU con 4 GB o más de VRAM puede ejecutar el modelo en bf16 con secuencias moderadas; con 8 GB hay margen para lotes pequeños.
- Opciones de despliegue: `transformers` con `pipeline`, vLLM y TGI para servidores HTTP, SGLang para decodificación estructurada, llama.cpp/Ollama previa conversión a GGUF (no se publica ninguna conversión en el repositorio), y Unsloth para entrenamiento o inferencia rápida en GPU.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este modelo; cualquier cifra sería una extrapolación genérica para un modelo de ~1.240 M de parámetros y no una medición del artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| mainsweep4ep-kl1000-s0-realign | ~1,24 B | 128k (heredado del base) | no disponible | Repo HF, 0 descargas | Sin benchmarks publicados |
| Llama-3.2-1B-Instruct (modelo base) | ~1,24 B | 128k | Llama 3.2 Community License | Ampliamente disponible, versiones GGUF comunitarias | Evaluado por Meta en su model card |
| Llama-3.2-3B-Instruct | ~3,2 B | 128k | Llama 3.2 Community License | Ampliamente disponible | Superior al 1B en las evaluaciones de Meta |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | Apache 2.0 | Muy disponible, incluidas variantes GGUF oficiales | Evaluado por el equipo de Qwen |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 tokens | Apache 2.0 | Muy disponible | Evaluado por HuggingFace |

No se dispone de datos que permitan afirmar si este ajuste mejora o degrada al modelo base; la comparación de rendimiento con las alternativas queda pendiente de evaluación independiente.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni comparación con el modelo base, por lo que se desconoce si el ajuste aporta alguna mejora.
- Licencia no declarada: el repositorio no especifica licencia utilizable. Aunque el modelo base se rige por Llama 3.2 Community License (que permite uso comercial con condiciones, exige atribución y mantiene la cláusula de 700 millones de usuarios activos mensuales), la falta de declaración del autor genera incertidumbre legal para uso comercial.
- Dataset desconocido: al no documentarse los datos de SFT, no se puede descartar la presencia de sesgos, contenido tóxico o datos personales en el ajuste.
- Riesgo de alucinación elevado: los modelos de ~1B de parámetros tienen una capacidad limitada de recuperación factual y tienden a inventar datos con más frecuencia que modelos mayores.
- Degradación potencial respecto al modelo base: un SFT corto (4 épocas según el nombre) puede provocar olvido catastrófico, especialmente en idiomas distintos del inglés y en capacidades como el razonamiento matemático.
- Limitaciones de idioma: el modelo base declara ocho idiomas, pero este ajuste no documenta ninguno; el uso en castellano debería validarse empíricamente antes de desplegarlo.
- Contexto largo no verificado: aunque el base soporte 128k tokens, no hay evidencia de que el ajuste preserve ese comportamiento, y la memoria necesaria para la caché KV crece de forma lineal con la secuencia.
- Reproducibilidad parcial: se conocen las versiones de framework y el run de W&B, pero no la semilla del dataset, la configuración exacta de LoRA ni el número de tokens de entrenamiento.
- Riesgo de sobreinterpretación del nombre: la referencia a "realign" en el nombre no implica que se haya aplicado el método ReAlign de GAIR-NLP; la model card no lo menciona.
- Sin soporte ni mantenimiento: 0 descargas y 0 likes, sin issues ni comunidad; no cabe esperar correcciones ni actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jlsrls/mainsweep4ep-kl1000-s0-realign
- Variante con nombre similar del mismo autor: https://huggingface.co/jlsrls/mainsweep4ep-kl1000-s0-realign120
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Run de entrenamiento en Weights & Biases: https://wandb.ai/rezvani-portland-state-university/clarifying-em/runs/41qbebda
- Repositorio de TRL: https://github.com/huggingface/trl
- Publicación sobre ReAlign (posible relación no confirmada con el nombre): https://slit-ai.github.io/publication/2025-11-01-realign-structured-revision-for-small-language
- Repositorio GAIR-NLP/ReAlign: https://github.com/GAIR-NLP/ReAlign
- Ficha de ReAlign en directorios de herramientas: https://theresanaiforthat.com/company/gair-nlp/repository/ReAlign/
