# EvansDeveloper/evaryx

## Resumen

Evaryx es un modelo de lenguaje publicado por el usuario EvansDeveloper en Hugging Face, derivado de Meta-Llama-3.1-8B-Instruct y ajustado mediante fine-tuning con la librería Unsloth. Se distribuye exclusivamente en formato GGUF cuantizado (Q4_K_M), lo que lo orienta a inferencia local con llama.cpp y Ollama en lugar de a despliegues con frameworks de servido de alto rendimiento. El repositorio tiene 9,8 GB y, en el momento de la consulta, no registra descargas ni valoraciones.

El modelo conserva la arquitectura y el tamaño del checkpoint base: 8.030.261.312 parámetros (aproximadamente 8 mil millones), lo que lo sitúa en la categoría de modelos densos de gama media aptos para GPU de consumo. La model card es extremadamente escueta: no documenta el conjunto de datos de fine-tuning, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un modelo derivado sin documentación técnica publicada, sin licencia declarada y sin benchmarks. Cualquier evaluación de su calidad real requiere pruebas empíricas por parte del usuario, y su uso en producción exige verificar previamente la licencia heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Meta-Llama-3.1-8B-Instruct; detalles no documentados en la model card) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (se hereda presumiblemente del base Llama 3.1, 128K tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (fichero `Meta-Llama-3.1-8B-Instruct.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Meta-Llama-3.1-8B-Instruct, un transformer decoder-only denso de 8 mil millones de parámetros. El ajuste se realizó con Unsloth, una librería que implementa kernels optimizados para entrenamiento y fine-tuning de bajo coste en memoria; el autor afirma que el entrenamiento fue "2x más rápido" gracias a esta herramienta, pero no aporta detalles sobre hiperparámetros, tamaño del dataset, número de tokens vistos ni método de ajuste (LoRA, QLoRA u otro).

La model card no especifica la composición de los datos de entrenamiento, no menciona si hubo etapas de RLHF, DPO o preferencia, y no documenta innovaciones técnicas adicionales. El único detalle técnico relevante es que el comportamiento del token BOS fue ajustado para compatibilidad con GGUF, algo habitual al convertir checkpoints de Llama a este formato. No se dispone de información sobre decodificación especulativa, atención lineal ni otras optimizaciones.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento general y respuesta a instrucciones, presumiblemente conservado tras el fine-tuning (no verificado).
- Capacidad de código y matemáticas heredada del base, sin datos específicos publicados.
- Soporte de tool calling / function calling: no documentado en la model card; el base Llama 3.1 lo soporta, pero no se confirma que el fine-tuning lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; el base Llama 3.1 cubre 8 idiomas oficialmente, pero no se confirma en este derivado.
- Capacidades multimodales: la model card menciona el uso con `llama-mtmd-cli` "para modelos multimodales" como ejemplo genérico de la herramienta, no como característica de este modelo. No hay evidencia de que Evaryx sea multimodal.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: al estar en GGUF Q4_K_M, se puede ejecutar con llama.cpp u Ollama en un portátil con GPU de consumo, lo que permite validar ideas de producto sin coste de API.
- Experimentación con fine-tuning sobre Llama 3.1: sirve como referencia de cómo Unsloth produce artefactos GGUF listos para desplegar, útil para equipos que quieran replicar el flujo.
- Generación de texto offline en entornos sin conectividad: el formato GGUF y el tamaño de 8B permiten ejecución en local en estaciones de trabajo, útil para demos en campo o entornos air-gapped.
- Sustitución de un modelo base en pipelines de prueba: cualquier pipeline que ya consuma Llama 3.1 8B Instruct vía llama.cpp puede apuntar a este checkpoint para comparar comportamiento cualitativo.
- Evaluación comparativa de fine-tunes comunitarios: investigadores que estudien el efecto de fine-tunings no documentados pueden usar este modelo como caso de estudio de variabilidad.
- Despliegue educativo en aulas o talleres: la simplicidad del GGUF y el Modelfile de Ollama incluido facilitan sesiones prácticas sobre inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, aproximadamente 5-6 GB para los pesos, más overhead de contexto KV; en la práctica, unos 6-8 GB para contextos moderados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en el ámbito profesional, A10G, L4, A100 o H100 si se despliega en servidor.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM para Q4_K_M; en GPUs de 6 GB puede requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf EvansDeveloper/evaryx --jinja`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en formato nativo, aunque podría convertirse.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Evaryx | 8,03 B | No disponible | No disponible | GGUF Q4_K_M | Fine-tune no documentado de Llama 3.1 8B Instruct |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128K tokens | Llama 3.1 Community License | Safetensors, GGUF | Modelo base oficial, con benchmarks publicados |
| Mistral 7B Instruct | 7,24 B | 32K tokens | Apache 2.0 | Safetensors, GGUF | Alternativa abierta con licencia permisiva |
| Qwen2.5-7B-Instruct | 7,62 B | 128K tokens | Apache 2.0 | Safetensors, GGUF | Alternativa con licencia permisiva y benchmarks públicos |

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; al derivar de Llama 3.1, se heredan presumiblemente las restricciones de la Llama 3.1 Community License, pero el autor no lo especifica.
- Ausencia total de benchmarks: no hay evidencia pública de que el fine-tuning mejore o degrade las capacidades del base; el rendimiento real es desconocido.
- Dataset de entrenamiento no documentado: riesgo de sesgos introducidos por datos no auditados, imposible de evaluar sin información.
- Riesgo de alucinación: inherente a los modelos de 8B, agravado por la falta de evaluación.
- Idiomas soportados no confirmados: no se puede asumir cobertura multilingüe más allá de lo que herede del base.
- Contexto no confirmado: aunque el base soporta 128K, el fine-tuning podría haber alterado el comportamiento en contextos largos; no hay verificación.
- Modelo sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Sin garantías de mantenimiento: el autor no publica roadmap ni issues; el repositorio podría quedar sin actualizar.
- El ejemplo de la model card con `llama-mtmd-cli` puede inducir a error: no hay evidencia de capacidades multimodales en este modelo.

## Enlaces

- Hugging Face: https://huggingface.co/EvansDeveloper/evaryx
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
- Meta-Llama-3.1-8B-Instruct (modelo base presumible): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- llama.cpp (runtime): https://github.com/ggerganov/llama.cpp
- Ollama (runtime): https://ollama.com
