# Lukynnnn/sft-pravo-adapter

## Resumen

`sft-pravo-adapter` es un ajuste fino supervisado (SFT) del modelo `unsloth/Qwen3-4B`, publicado por el usuario Lukynnnn en HuggingFace. Se distribuye como adaptador derivado de un entrenamiento con TRL (versión 0.24.0) y Unsloth, librería habitual para fine-tuning eficiente en memoria de modelos pequeños y medianos. El repositorio ocupa 4,8 GB y no registra descargas ni "likes" en el momento de la consulta, por lo que se trata de un artefacto experimental sin validación comunitaria ni documentación técnica detallada.

La model card es la plantilla autogenerada por TRL: no declara composición del dataset, número de tokens de entrenamiento, hiperparámetros, licencia efectiva, idiomas soportados ni resultados de evaluación. Esto limita seriamente cualquier afirmación sobre sus capacidades reales más allá de lo que se hereda del modelo base Qwen3-4B, un transformer denso de aproximadamente 4 000 millones de parámetros.

Su relevancia actual es acotada y de perfil investigador: sirve como ejemplo reproducible de pipeline SFT con TRL + Unsloth sobre Qwen3-4B y como punto de partida para quien quiera inspeccionar un adaptador de dominio (el sufijo "pravo", del ruso "derecho/ley", sugiere un posible enfoque jurídico, aunque el autor no lo confirma). Para uso en producción carece de la trazabilidad mínima exigible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen3-4B); detalle completo no disponible en la informacion proporcionada |
| Parametros totales | No disponible para el adaptador; el modelo base es Qwen3-4B (aprox. 4 000 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; se hereda la del modelo base Qwen3-4B |
| Tipos de cuantizacion | No declarados por el autor; al ser una arquitectura Qwen3 soportada por el ecosistema, es tecnicamente cuantizable con bitsandbytes (NF4/INT8) y a GGUF mediante llama.cpp, sin confirmacion del autor |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye el marcador de posicion `licence: license`); el modelo base Qwen3-4B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA generado con TRL y Unsloth) |
| Tamano del repositorio | 4,8 GB |
| Framework de entrenamiento | TRL 0.24.0, Unsloth, PyTorch 2.12.1, Transformers 5.5.0, Datasets 4.3.0, Tokenizers 0.22.2 |
| Metodo de ajuste | SFT (supervised fine-tuning) |
| Modelo base | unsloth/Qwen3-4B |
| Fecha de creacion | 30 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 1 de octubre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-4B, un transformer decoder-only denso con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE), tal como corresponde a la familia Qwen3. No hay ninguna innovación arquitectónica introducida por el autor: el repositorio contiene únicamente los pesos del ajuste, no una arquitectura nueva. El tamaño del repositorio (4,8 GB) es notablemente superior al de un adaptador LoRA típico para un modelo de 4B (habitualmente decenas o pocos cientos de MB), lo que sugiere que el autor pudo haber subido checkpoints intermedios, estados del optimizador, pesos fusionados o una combinación de ellos; esto no está confirmado en la model card.

En cuanto al entrenamiento, la única información disponible indica que se empleó SFT con TRL 0.24.0 y el stack de Unsloth, ejecutado con Transformers 5.5.0 y PyTorch 2.12.1. No se declara el dataset, su composición, el número de tokens vistos, la longitud de secuencia, el rango y alpha del LoRA, la tasa de aprendizaje, el número de épocas ni si hubo etapas posteriores de alineación (DPO, RLHF, GRPO). Tampoco se documenta ningún proceso de evaluación o selección de checkpoint. En consecuencia, no es posible caracterizar el sesgo inductivo del ajuste ni su grado de sobreajuste al corpus utilizado.

## Capacidades

- Generación de texto conversacional: la model card incluye un ejemplo con `pipeline("text-generation")` en formato de chat (mensaje con rol `user`), lo que indica soporte del chat template del modelo base.
- Razonamiento y conocimiento general: potencialmente heredados de Qwen3-4B, pero no verificados ni medidos para este adaptador.
- Generación de código y matemáticas: no documentado para el adaptador; depende del modelo base y del posible olvido catastrófico introducido por el SFT.
- Tool calling / function calling: no documentado en la model card; Qwen3 soporta plantillas de herramientas en su formato nativo, pero no hay confirmación de que el ajuste las preserve.
- Modo "thinking": Qwen3 incorpora modos de razonamiento explícito, pero la model card no indica si el adaptador los mantiene ni cómo se activan.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades de visión o audio: no disponibles (el modelo base es exclusivamente de texto).

## Casos de uso

- Investigación sobre pipelines SFT: el repositorio sirve como referencia práctica de un entrenamiento con TRL 0.24.0 y Unsloth sobre Qwen3-4B; útil para reproducir la receta (aunque el dataset no se publica) y comparar configuraciones de ajuste en modelos de 4B.
- Adaptación a dominio jurídico (hipótesis no confirmada): si el sufijo "pravo" alude a un corpus legal, el modelo podría emplearse como base para tareas de resumen de documentos normativos o respuesta a consultas sobre textos legales, siempre tras una evaluación exhaustiva con datos propios y revisión humana.
- Prototipado local en una sola GPU de consumo: al derivar de un modelo de 4B, el adaptador es desplegable en equipos con GPU de gama media-alta, lo que permite experimentar sin infraestructura en la nube.
- Generación de texto asistida en entornos sin conectividad: un modelo de 4B cuantizado a 4 bits puede ejecutarse en portátiles con GPU discreta, útil para demostraciones offline o entornos con requisitos de privacidad estrictos.
- Evaluación comparativa de adaptadores: como caso de estudio de un adaptador con cero descargas y documentación mínima, resulta útil para investigar metodologías de auditoría de modelos publicados en HuggingFace (detección de licencias ausentes, datos de entrenamiento no declarados, riesgo de sesgo).
- Base para ajuste adicional (continued fine-tuning): el adaptador puede servir como punto de partida para un SFT posterior con datos propios, aplicando PEFT sobre el modelo base y fusionando los pesos resultantes.
- Generación de datos sintéticos para filtrar y posteriormente reentrenar: con supervisión humana y validación de calidad, podría emplearse para aumentar un corpus de dominio específico, teniendo en cuenta el riesgo de propagación de alucinaciones.

En todos los casos, la ausencia de benchmarks y de documentación obliga a realizar una evaluación propia antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K, MT-Bench, IFEval ni ninguna otra métrica, y las búsquedas web realizadas no han devuelto material técnico relacionado con este repositorio (los resultados obtenidos corresponden a foros no relacionados). Tampoco existen evaluaciones de terceros, dado que el modelo registra cero descargas.

## Requisitos de hardware

Las siguientes cifras son estimaciones de ingeniería para un modelo denso de aproximadamente 4 000 millones de parámetros y no proceden de mediciones publicadas por el autor:

- VRAM para inferencia en bf16/fp16: en torno a 8-9 GB solo para pesos, más caché KV y activaciones; presupuestar 10-12 GB para contextos moderados.
- VRAM para inferencia en INT8: aproximadamente 4-5 GB de pesos.
- VRAM para inferencia en 4 bits (NF4 o GGUF Q4_K_M): aproximadamente 2,5-3,5 GB, con margen para caché KV.
- GPU compatibles: NVIDIA A100, H100, L40S, A10G, RTX 4090, RTX 4080, RTX 3090 y, en cuantización de 4 bits, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 de 12 GB.
- Consumer GPU: sí, cabe en GPUs de consumo con al menos 8 GB de VRAM si se cuantiza a 4 bits; en bf16 requiere 12 GB o más.
- Ajuste fino adicional: un SFT con LoRA y cuantización de 4 bits es viable en 8-12 GB de VRAM gracias al stack de Unsloth; un ajuste completo de todos los parámetros no lo es en hardware de consumo.
- Opciones de despliegue: `transformers` con PEFT (el adaptador requiere el modelo base para cargarse, salvo que se fusionen los pesos), vLLM con soporte de LoRA, TGI, llama.cpp/Ollama tras conversión a GGUF, y servidores compatibles con la API de OpenAI (la etiqueta `endpoints_compatible` del repositorio apunta en esa dirección).
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización, el tamaño de lote y la longitud de contexto. No hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| Lukynnnn/sft-pravo-adapter | Adaptador sobre Qwen3-4B (aprox. 4 000 M) | No disponible | No disponible | HuggingFace (0 descargas) | No |
| unsloth/Qwen3-4B | Aprox. 4 000 M | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace | No disponible en la informacion proporcionada |
| Qwen/Qwen3-4B (modelo original de Alibaba) | Aprox. 4 000 M | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace | No disponible en la informacion proporcionada |

No se dispone de datos verificados en la información proporcionada para comparar rendimiento, contexto o licencia con alternativas de la misma categoría (por ejemplo, otros adaptadores SFT de 3-4B o modelos pequeños como Llama 3.2 3B). Cualquier comparación numérica requeriría consultar las model cards de los modelos base y ejecutar una evaluación propia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no existe ninguna métrica publicada que permita estimar la calidad del ajuste ni el posible olvido catastrófico respecto a Qwen3-4B.
- Licencia no declarada: la model card contiene el marcador `licence: license`, sin texto legal efectivo. El uso comercial es jurídicamente indeterminado; conviene contactar con el autor o tratar el modelo como no apto para producción.
- Dataset de entrenamiento desconocido: no se declara la procedencia de los datos, su licencia, su idioma ni si contienen información personal. Esto impide evaluar sesgos y cumplimiento normativo (RGPD, derechos de autor).
- Riesgo de alucinación: inherente a los modelos de 4B ajustados con SFT y no mitigado por ninguna etapa declarada de alineación (DPO/RLHF) ni por verificación factual.
- Sesgos potenciales: no evaluados. Un SFT sobre un corpus de dominio reduce la diversidad de respuestas y puede amplificar sesgos presentes en esos datos.
- Ambigüedad sobre el contenido del repositorio: los 4,8 GB sugieren que puede incluir checkpoints intermedios, estados del optimizador o pesos ya fusionados; esto afecta al método de carga y no está documentado.
- Compatibilidad de versiones: el entrenamiento declara Transformers 5.5.0 y PyTorch 2.12.1, versiones que pueden no ser las instaladas en entornos estándar, lo que puede provocar errores de carga o comportamientos inesperados.
- Idiomas no declarados: no hay garantía de un rendimiento equilibrado fuera del idioma (o idiomas) del corpus de ajuste.
- Cero adopción: sin descargas ni validación de la comunidad, no existe evidencia independiente de que el modelo funcione según lo esperado.
- Trazabilidad insuficiente para producción: sin autor identificable, sin paper, sin informe de evaluación y sin política de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lukynnnn/sft-pravo-adapter
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B
- Repositorio de TRL: https://github.com/huggingface/trl
- Referencia bibliográfica de TRL (von Werra et al., 2020), incluida en la model card.
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en las búsquedas web realizadas.
