# Ba2han/mini-qwen-next-31b

## Resumen

Mini Qwen-Next 31B es un checkpoint de preentrenamiento publicado por el usuario Ba2han en HuggingFace, orientado a investigación y a entrenamiento continuado más que a uso directo en producción. No se trata de un modelo instruido ni de un chat: la propia model card lo describe como el resultado de una fase de preentrenamiento sobre un corpus propio, con checkpoints reanudables y estados de optimizador incluidos.

El autor indica que el entrenamiento realiza una pasada completa sobre el dataset `Ba2han/tokenized_mix_0507` y se detiene al agotarlo, con un calendario de learning rate calculado para 31.000 millones de tokens de entrada. Pese al sufijo "31b" del nombre, la model card no confirma el número de parámetros del modelo; la cifra de 31 aparece explícitamente asociada a los tokens de entrada del schedule de learning rate, por lo que el tamaño real de parámetros queda sin especificar.

El interés técnico del repositorio está en su configuración de entrenamiento: optimizador híbrido con grupos AdamW de 8 bits (pico de 0.001) y grupos Muon con receta Polar Express de 8 pasos (0.024), 500 actualizaciones de warmup, decaimiento lineal desde los 24.800 millones de tokens, y checkpoints completos cada 1.000 millones de tokens. La arquitectura es personalizada (`custom-code`) y no es compatible con `AutoModel` de Transformers, lo que limita su uso a quien disponga del código fuente y del tokenizer incluidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; arquitectura personalizada (tag `custom-code`), no compatible con los checkpoints estándar de Transformers `AutoModel`. Requiere el código fuente y el tokenizer incluidos en el repositorio |
| Parámetros totales | No disponible (el sufijo "31b" del nombre no está confirmado como recuento de parámetros en la model card) |
| Parámetros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible. Los datos de entrenamiento implican secuencias largas empaquetadas (véase la sección de arquitectura) |
| Tipos de cuantización | No disponible; solo se documenta el uso de AdamW8bit para el estado del optimizador durante el entrenamiento, no cuantización de los pesos para inferencia |
| Idiomas soportados | Turco (`tr`) |
| Licencia | No disponible |
| Formato de pesos | No disponible. Se distribuyen checkpoints propios con pesos del backbone, ambos estados de optimizador, pesos y momentos de n-gram, RNG por rango y cursor de datos |
| Volumen de entrenamiento | Schedule de learning rate definido para 31.000 millones de tokens de entrada; decaimiento lineal a partir de 24.800 millones |
| Estado del modelo | Checkpoint de preentrenamiento (no instruido, sin alineamiento documentado) |
| Frecuencia de checkpoints | Cada 1.000 millones de tokens de entrada y al agotar el corpus; se conservan los dos directorios más recientes |

## Arquitectura y entrenamiento

La model card no detalla la topología interna (transformer denso, MoE, híbrido con SSM, etc.), pero sí describe elementos poco habituales: grupos de parámetros optimizados de forma diferenciada, presencia de pesos y momentos de n-gram en los checkpoints, y una implementación propia que no se carga con las clases estándar de Transformers. Esto apunta a una arquitectura híbrida o experimental con componentes de n-gram junto al backbone neuronal, aunque el autor no ofrece una descripción formal ni un diagrama.

En cuanto al entrenamiento, se realiza una pasada completa sobre `Ba2han/tokenized_mix_0507` hasta su agotamiento; el dataset `Ba2han/packed_long_20B` se describe como continuación posterior. La configuración usa dos GPU con dos filas empaquetadas por forward y 16 pasos de acumulación, lo que da 655.360 tokens de entrada por actualización (equivalente a unas 10.240 tokens por fila, cálculo derivado de los propios datos de la model card). El optimizador es híbrido: AdamW8bit con pico de learning rate 0.001 en los grupos Adam y Muon con receta Polar Express de 8 pasos a 0.024 en los grupos Muon. Hay 500 actualizaciones de warmup y decaimiento lineal desde los 24.800 millones de tokens. No se documenta ningún proceso de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Modelado de lenguaje causal y continuación de texto en turco: es la función para la que fue entrenado, dado el idioma declarado y los corpus utilizados.
- Preentrenamiento base reutilizable: sirve como punto de partida para ajuste fino supervisado, ya que se publican pesos del backbone y todos los estados necesarios para reanudar.
- Reanudación de entrenamiento distribuido a nivel de estado completo: los checkpoints incluyen estados de ambos optimizadores, momentos de n-gram, RNG por rango y cursor de datos, lo que permite continuar exactamente donde se dejó.
- Cambio de corpus conservando el paso global: mediante `distributed_training.py --reset-data-loader` con un corpus recién empaquetado.
- Investigación sobre optimizadores híbridos: la combinación AdamW8bit + Muon con rutas de learning rate separadas es un objeto de estudio en sí mismo.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. Estas capacidades no se mencionan en la información disponible.

## Casos de uso

- Preentrenamiento continuado en turco: el modelo sirve como base para seguir entrenando con corpus adicionales, reutilizando el cursor de datos y los estados de optimizador incluidos en los checkpoints para no reiniciar el schedule.
- Ajuste fino supervisado para tareas concretas en turco: partiendo del checkpoint se puede construir un modelo de clasificación, extracción de información o generación especializada, siempre que se disponga del código de carga personalizado.
- Investigación sobre optimizadores híbridos: replicar o variar la combinación AdamW8bit (0.001) y Muon Polar Express de 8 pasos (0.024) para estudiar estabilidad y convergencia en regímenes de 31.000 millones de tokens.
- Estudio de empaquetado de secuencias largas: la configuración de dos filas empaquetadas por forward y 655.360 tokens por actualización permite analizar el efecto del empaquetado en corpus largos como `packed_long_20B`.
- Reproducibilidad de entrenamiento distribuido: los checkpoints con RNG por rango y cursor de datos hacen posible auditar y reproducir una ejecución bit a bit en el mismo hardware.
- Evaluación de arquitecturas no estándar en Transformers: dado que no carga con `AutoModel`, es un caso útil para probar rutas de integración de arquitecturas personalizadas en herramientas propias o en frameworks de terceros.
- Desarrollo de tokenizers y pipelines propios: al requerir el tokenizer incluido, el repositorio sirve como banco de pruebas para pipelines de tokenización sobre corpus turcos mixtos.
- Análisis lingüístico del turco a escala: con 31.000 millones de tokens de exposición, el modelo puede emplearse en experimentos de modelado de lenguaje y sondeos de conocimiento lingüístico, siempre como modelo base y no como asistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluación, y tampoco cifras de throughput o latencia de entrenamiento más allá del cómputo por actualización.

## Requisitos de hardware

- La model card no especifica el número de parámetros, por lo que no es posible estimar la VRAM de inferencia de forma fiable. Cualquier cifra de VRAM sería especulativa.
- Entrenamiento documentado: dos GPU, con dos filas empaquetadas por forward y 16 pasos de acumulación, resultando en 655.360 tokens de entrada por actualización. No se indican modelos concretos de GPU ni memoria por dispositivo.
- Uso en GPU de consumo: no disponible; depende del tamaño real de parámetros, que no se ha confirmado.
- Opciones de despliegue: no disponible para vLLM, llama.cpp, Ollama o TGI. El autor advierte explícitamente de que la arquitectura es personalizada y no son checkpoints estándar de `AutoModel` de Transformers, lo que descarta la mayoría de los servidores de inferencia convencionales sin trabajo de integración previo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conoce el número de parámetros, la licencia ni resultados de evaluación, y la arquitectura es personalizada sin equivalencia documentada, por lo que no es posible establecer una comparación rigurosa con alternativas de la misma categoría. Cabe señalar únicamente que el nombre del repositorio evoca la familia Qwen-Next, pero no hay en la información proporcionada ninguna confirmación de relación, derivación o compatibilidad con dicha familia.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ba2han/mini-qwen-next-31b | No disponible | No disponible | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no hay evaluación de sesgos publicada. El corpus `tokenized_mix_0507` no está descrito en cuanto a composición, origen o filtrado, por lo que se desconocen los sesgos heredados.
- Riesgo de alucinación: alto y no caracterizado. Al ser un modelo de preentrenamiento sin alineamiento ni ajuste por instrucciones, no está calibrado para rechazar peticiones ni para reconocer incertidumbre.
- Idioma: el único idioma declarado es el turco (`tr`). No hay datos sobre competencia multilingüe y no debe asumirse transferencia al castellano ni al inglés.
- Contexto y cuantización: no se documenta la ventana de contexto efectiva ni se ofrecen pesos cuantizados listos para usar, lo que dificulta su despliegue en hardware limitado.
- Restricciones de licencia: la licencia no está especificada, lo que en la práctica impide el uso comercial con garantías jurídicas. Debe tratarse como material sin licencia explícita hasta que el autor la declare.
- Compatibilidad: no es un checkpoint estándar de Transformers. Cargarlo requiere el código fuente y el tokenizer del repositorio, lo que impide usarlo con herramientas habituales (vLLM, TGI, Ollama, llama.cpp) sin adaptación previa.
- Madurez y adopción: 0 descargas y 0 likes en el momento de la ficha, sin pipeline declarado ni métricas. Es un artefacto de investigación sin validación externa.
- Producción: no se recomienda su uso en entornos productivos en su estado actual, ni como asistente conversacional ni como servicio de generación, dada la ausencia de evaluación, licencia y soporte.
- Entrenamiento incompleto por diseño: la fase descrita termina al agotar el corpus, con el dataset largo como continuación prevista, no necesariamente ejecutada.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Ba2han/mini-qwen-next-31b
- Dataset de entrenamiento principal: https://huggingface.co/datasets/Ba2han/tokenized_mix_0507
- Dataset de continuación empaquetado: https://huggingface.co/datasets/Ba2han/packed_long_20B
- Paper, blog, repositorio de código o demostración: no disponibles. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos corresponden a foros de simulación de vuelo y no guardan relación).
