# SecondLookResearch/Qwen2.5-32B-graft0-a1-terrav2-300-da-e20

## Resumen

Qwen2.5-32B-graft0-a1-terrav2-300-da-e20 es un adaptador LoRA publicado por SecondLookResearch sobre el modelo base Qwen/Qwen2.5-32B de Alibaba. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (r=64, alpha=128, solo capas lineales) que se monta sobre un modelo base parcheado. El autor lo describe como una etapa de «difficult advice» (consejo difícil) entrenada como adaptador nuevo sobre una versión fusionada y congelada del adaptador graft0-a1, con 20 épocas desde cero y un barrido de épocas comparado a pasos igualados.

El modelo hereda del base la arquitectura transformer decoder-only densa, el contexto de 128 000 tokens y el entrenamiento sobre un corpus de hasta 18 billones de tokens con soporte multilingüe. Su relevancia es fundamentalmente experimental: sirve para estudiar composición de adaptadores (apilado de dos LoRA sobre el mismo base) y control conductual mediante ajuste fino, más que como modelo listo para producción.

El repositorio ocupa 2,2 GB y no registra descargas ni «likes» en el momento de la consulta, no incluye benchmarks ni una model card detallada, y no declara licencia. Todo ello lo sitúa como un artefacto de investigación reproducible con fines acotados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; modelo base Qwen/Qwen2.5-32B |
| Parámetros totales | No disponible (el repositorio contiene solo pesos de adaptador, 2,2 GB; el base declarado es un modelo de 32 000 millones de parámetros) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Qwen2.5-32B) |
| Tipos de cuantización | No disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | Multilingüe (heredado del base); lista de idiomas no detallada |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango y alpha de LoRA | r = 64, alpha = 128 |
| Módulos adaptados | Solo capas lineales («linear-only») |
| Etapa de entrenamiento | «Difficult advice», 20 épocas desde cero, sobre el adaptador graft0-a1 congelado y fusionado |
| Modelo base | Qwen/Qwen2.5-32B |
| Fecha de publicación | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-32B, un transformer decoder-only denso (no MoE) preentrenado por Alibaba sobre un corpus de hasta 18 billones de tokens, con una ventana de contexto de 128 000 tokens y soporte multilingüe. Sobre ese base, este repositorio aporta exclusivamente los pesos de un adaptador LoRA de rango 64 y alpha 128 aplicado a las capas lineales. El tamaño del repositorio (2,2 GB) es coherente con un adaptador guardado en precisión completa, no con un modelo completo.

El proceso descrito por el autor es un ajuste en cascada dentro de la plataforma «graft0»: primero se entrena el adaptador graft0-a1-terrav2-300, después se fusiona y se congela, y sobre ese resultado se entrena desde cero este adaptador de la etapa «difficult advice» durante 20 épocas, dentro de un barrido de épocas comparado a pasos igualados. En inferencia, el autor indica que deben servirse dos adaptadores apilados sobre el base parcheado, aplicando primero A1 y después este, mediante el script `code/msm_eval/serve_reconstructed.sh` con `ROW_PATCH=1` y la variable `ADAPTERS` con ambos repositorios. No se especifican la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y continuación de secuencias, con la ventana de contexto de 128 000 tokens del modelo base.
- Razonamiento, matemáticas y generación de código en la medida en que el modelo base Qwen2.5-32B las soporte; el adaptador no añade ni documenta capacidades nuevas.
- Capacidades multilingües heredadas del base, sin lista de idiomas publicada por el autor.
- Apilado de adaptadores: el artefacto está diseñado para servirse junto al adaptador A1 sobre el mismo base parcheado, no de forma aislada.
- Control conductual experimental: la etapa «difficult advice» sugiere un ajuste orientado a modificar el estilo o el contenido de las respuestas, aunque el autor no detalla el objetivo exacto.
- No se documenta soporte explícito de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo de razonamiento extendido.
- No consta que el adaptador convierta el base en un modelo ajustado a instrucciones o a diálogo; el pipeline declarado es «no disponible».

## Casos de uso

- Investigación en composición de adaptadores: servir dos LoRA apilados sobre un mismo base con `ROW_PATCH=1` permite estudiar cómo interactúan pesos ajustados en etapas sucesivas y si el orden de aplicación altera el resultado.
- Reproducción de experimentos de ajuste fino: el repositorio documenta el protocolo (r=64, alpha=128, linear-only, 20 épocas, comparación a pasos igualados), lo que facilita replicar el barrido de épocas en un entorno propio.
- Estudio de control conductual: la etapa «difficult advice» es un caso práctico para medir cómo un adaptador pequeño desplaza el comportamiento del modelo sin reentrenar el base.
- Base para ajuste específico de dominio: al ser un adaptador ligero montado sobre Qwen2.5-32B, puede servir como punto de partida para añadir una segunda capa de especialización (legal, sanitario, técnico) con coste de entrenamiento reducido.
- Evaluación de infraestructura multi-LoRA: útil para probar servidores de inferencia con soporte de adaptadores dinámicos (vLLM con Multi-LoRA, TGI) midiendo latencia y consumo con contexto largo.
- Docencia y formación en PEFT: ejemplo real de adaptador sobre un modelo de 32B para explicar rangos, alpha, módulos objetivo y fusión de pesos.
- Análisis de seguridad y alineamiento: al tratarse de una etapa no documentada sobre datos desconocidos, sirve para auditar qué tipo de sesgos o comportamientos introduce un ajuste opaco respecto al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas, y el repositorio no registra evaluaciones públicas al no contar con descargas ni valoraciones.

## Requisitos de hardware

- El adaptador en sí ocupa 2,2 GB, pero la inferencia requiere cargar el modelo base Qwen2.5-32B, que es el que determina los requisitos reales.
- Precisión bf16/fp16: en torno a 65 GB solo para pesos, más caché KV. Necesario al menos una GPU de 80 GB (H100 80 GB, A100 80 GB) con contexto limitado, o dos A100 80 GB para trabajar con holgura.
- Precisión de 8 bits: aproximadamente 33-35 GB de pesos, viable en una A100 40 GB o repartido entre dos GPU de 24 GB.
- Cuantización de 4 bits: en torno a 18-20 GB, lo que permite ejecutarlo en una RTX 4090 o RTX 3090 de 24 GB, siempre con una ventana de contexto muy reducida respecto a los 128 000 tokens del base.
- Caché KV: una ventana de 128 000 tokens exige decenas de gigabytes adicionales de memoria, por lo que en GPU de consumo hay que recortar el contexto de forma drástica.
- Opciones de despliegue: vLLM con soporte Multi-LoRA (la más adecuada para apilar A1 y este adaptador), PEFT + transformers con carga de adaptadores, TGI, o llama.cpp/Ollama tras fusionar los pesos en el base y convertirlos a GGUF.
- El autor proporciona el script `code/msm_eval/serve_reconstructed.sh` con `ROW_PATCH=1` y la variable `ADAPTERS` con los dos repositorios; no se documenta compatibilidad con otros servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (graft0-a1-terrav2-300-da-e20) | Solo pesos LoRA, 2,2 GB | 128 000 tokens (heredado) | No disponible | safetensors (PEFT) | 0 descargas, 0 «likes» |
| SecondLookResearch/Qwen2.5-32B-graft0-a1 | Solo pesos LoRA | No disponible | No disponible | safetensors (PEFT) | Repositorio complementario, requerido para servir este |
| Qwen/Qwen2.5-32B (base) | 32 000 millones | 128 000 tokens | No disponible en la información consultada | safetensors, GGUF vía Ollama | Amplia, mantenido por Alibaba |
| Qwen2.5-14B | 14 000 millones | 128 000 tokens (serie Qwen2.5) | No disponible en la información consultada | safetensors | Amplia |
| Gemma2-27B-IT / Phi-3.5-MoE-Instruct | No disponible | No disponible | No disponible | No disponible | Citados como comparativas en el blog de Qwen2.5, sin datos en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Qwen2.5-32B, el adaptador A1 y un base parcheado con `ROW_PATCH=1` para funcionar tal como lo describe el autor.
- La licencia no está declarada en la ficha del adaptador, por lo que no puede confirmarse su uso comercial. Habría que verificar la licencia del modelo base con Alibaba antes de cualquier despliegue en producción.
- El modelo base es Qwen2.5-32B, la variante preentrenada y no ajustada a instrucciones; no hay garantía de seguimiento de instrucciones ni de formato conversacional salvo que la etapa A1 lo aporte, algo que no se documenta.
- No se especifican los datos de entrenamiento de la etapa «difficult advice»: se desconoce la composición del corpus, su origen y si pasó por filtros de seguridad, por lo que existe riesgo de sesgos y de comportamientos no deseados introducidos por el ajuste.
- Riesgo de alucinación inherente al modelo base, no mitigado ni medido por el autor.
- Ausencia total de benchmarks: no hay evidencia cuantitativa de mejora o degradación frente al base o frente al adaptador A1.
- El pipeline está marcado como «no disponible» y la model card se limita a metadatos y a un comando de servicio; la reproducibilidad depende de scripts alojados en el repositorio del autor, no enlazados en la ficha.
- Adopción nula (0 descargas, 0 «likes»), sin validación por parte de la comunidad ni informes de terceros.
- La fecha de publicación registrada (2026-09-24) y la actualización un minuto después sugieren una subida automatizada, sin revisión posterior.
- Cualquier uso en producción exige auditoría propia de sesgos, seguridad y calidad de salida antes de exponerlo a usuarios finales.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-graft0-a1-terrav2-300-da-e20
- Adaptador A1 requerido: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-graft0-a1
- Modelo base Qwen2.5-32B: https://huggingface.co/Qwen/Qwen2.5-32B
- Blog de la serie Qwen2.5: https://qwen.ai/blog?id=qwen2.5
- Repositorio espejo de Qwen2.5 en GitHub: https://github.com/Zerkahlo/qwen2.5
- Ficha de Qwen2.5:32b en Ollama: https://ollama.com/library/qwen2.5:32b
