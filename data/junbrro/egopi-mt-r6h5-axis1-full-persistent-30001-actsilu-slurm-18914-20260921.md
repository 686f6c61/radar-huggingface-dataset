# junbrro/egopi-mt-r6h5-axis1-full-persistent-30001-actsilu-slurm-18914-20260921

## Resumen

El modelo identificado como `junbrro/egopi-mt-r6h5-axis1-full-persistent-30001-actsilu-slurm-18914-20260921` es un checkpoint de pesos publicado en HuggingFace por el usuario `junbrro`. Se trata de un artefacto de entrenamiento experimental más que de un modelo de propósito general: la model card lo describe como "MT Arm I full-token persistent, step 30001", con origen en el paso 18914, e indica que solo se incluyen los pesos finales y la configuración, sin el estado del optimizador ni el de generación de números aleatorios. El repositorio ocupa 14,0 GB y contiene pesos en formato safetensors con 6.964.885.936 parámetros (aproximadamente 6,96 mil millones), lo que supone un modelo de tamaño medio-grande en el rango de los 7 B.

Por los metadatos disponibles (tokenizador de acciones incluido en `actlat/`, referencias a `mt_openarm_prq15`, `slot37`, adaptador "Cog" con dimensión oculta 256 y activación SiLU, y la mención a un "runtime multi-grupo/persistente"), todo apunta a un modelo orientado a control robótico o a predicción de acciones discretas sobre un brazo robótico, probablemente mediante fine-tuning multi-tarea sobre un backbone congelado ("Frozen r6h5"). Sin embargo, la model card no confirma explícitamente la arquitectura, la tarea ni el dominio, por lo que estas interpretaciones deben tratarse como hipótesis basadas en la nomenclatura, no como datos verificados.

Su relevancia es limitada fuera del contexto del experimento concreto para el que se publicó: no hay licencia declarada, no hay idiomas declarados, no se han publicado benchmarks y no existe documentación de uso más allá de dos frases sobre remapeo de rutas. Es, en la práctica, un checkpoint intermedio de una línea de trabajo interna liberado sin empaquetado para consumo general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona un "Cog adapter", un tokenizador de acciones y activación SiLU, pero no especifica la arquitectura del backbone) |
| Parametros totales | 6.964.885.936 (~6,96 B), según los pesos safetensors publicados |
| Parametros activos | no disponible; no hay indicios de que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors en precisión original, sin variantes GGUF, AWQ, GPTQ ni similar |
| Idiomas soportados | no disponible |
| Licencia | no disponible (ni la model card ni los metadatos de HuggingFace declaran licencia) |
| Formato de pesos | safetensors (pesos finales más configuración; se excluye el estado del optimizador y del RNG) |
| Tamano del repositorio | 14,0 GB |
| Etiquetas declaradas | safetensors, RLDX-1, region:us |
| Fecha de publicación | 21 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura con rigor. La model card únicamente indica que se trata de un fine-tuning multi-tarea sobre múltiples grupos ("Multi-group MT FT, slot37 mt_openarm_prq15") con el componente `r6h5` congelado, un adaptador "Cog" habilitado con dimensión oculta 256 y activación SiLU, y que requiere un "runtime multi-grupo/persistente" específico. También menciona la presencia de un tokenizador de acciones en el directorio `actlat/` cuando resulta aplicable, lo que sugiere una formulación de tipo modelo de política o modelo de decisión con un vocabulario de acciones discretas. No se indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

El checkpoint corresponde al paso 30001 de un entrenamiento cuyo origen es el paso 18914 ("Final step: 30001. Source: 18914"). El autor advierte explícitamente de que "las rutas de configuración del clúster de origen deben remapearse antes de su uso", lo que confirma que se publicaron rutas absolutas de un entorno Slurm interno y que el artefacto no funcionará tal cual sin edición previa de la configuración. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, SSM híbrido, etc.).

## Capacidades

- No se documenta ninguna capacidad funcional en la información disponible: ni generación de texto, ni razonamiento, ni código, ni matemáticas, ni visión.
- Por la nomenclatura (`actlat/`, tokenizador de acciones, `mt_openarm_prq15`), es plausible que el modelo genere o puntúe secuencias de acciones, pero esto no está confirmado por el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo de razonamiento, visión, audio): no disponible.

## Casos de uso

Los siguientes casos son hipótesis de uso derivadas de la nomenclatura del repositorio y de las instrucciones de la model card. No están confirmados por el autor y no deben asumirse sin verificación previa con el propio checkpoint.

- Reanudación de una línea de entrenamiento robótico: el checkpoint del paso 30001 puede emplearse como inicialización de pesos para continuar un entrenamiento multi-tarea. Es adecuado para este fin porque el autor indica expresamente que es un checkpoint final de pesos, aunque debe tenerse en cuenta que al excluir el estado del optimizador y del RNG la reanudación no es exacta, sino un reinicio desde esos pesos.
- Investigación sobre tokenización de acciones discretas: el directorio `actlat/` contiene el tokenizador de acciones asociado, lo que permite reproducir la codificación y decodificación de acciones empleada durante el entrenamiento y usarla como referencia en experimentos comparativos.
- Evaluación de la receta de adaptación con adaptador "Cog": al estar documentada la configuración del adaptador (dimensión oculta 256, activación SiLU) y el backbone congelado `r6h5`, el modelo sirve como punto de comparación para medir el efecto de distintas configuraciones de adaptador sobre la misma tarea.
- Punto de partida para fine-tuning específico de tarea: si el dominio es efectivamente el control de brazo robótico, este checkpoint puede actuar como base congelada o parcialmente descongelada para ajustes posteriores sobre un conjunto de datos propio.
- Auditoría y reproducibilidad de experimentos: la preservación de las rutas de configuración originales del clúster permite reconstruir el entorno de ejecución del experimento, siempre que se remapeen las rutas a un sistema de ficheros equivalente.
- Despliegue en inferencia con runtime personalizado: la model card exige usar el "runtime multi-grupo/persistente", por lo que el caso de uso realista es la integración en ese runtime concreto y no en servidores de inferencia genéricos.
- Docencia o estudio de artefactos de entrenamiento: útil como ejemplo de publicación de checkpoints intermedios con configuración heredada de un entorno HPC (Slurm) y de los problemas de portabilidad que ello genera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ningún tipo (ni MMLU, ni HumanEval, ni GSM8K, ni métricas específicas de robótica como tasas de éxito en tareas de manipulación), y las búsquedas web realizadas no devolvieron ningún resultado relacionado con este modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del recuento de parámetros publicado (6,96 B) y de los formatos estándar; no proceden de documentación del autor.

- VRAM para inferencia en fp16/bf16: en torno a 14 GB solo para pesos, más memoria de activaciones y caché, por lo que conviene disponer de 16-18 GB como mínimo.
- VRAM para inferencia en int8: aproximadamente 7 GB de pesos, con un mínimo práctico de 10-12 GB.
- VRAM para inferencia en int4: aproximadamente 3,5-4 GB de pesos, con un mínimo práctico de 6-8 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para fp16 con margen amplio; cabe en GPU de consumo en fp16 en RTX 4090, RTX 3090 o RTX 4080 de 16 GB con cuantización, y en int4 en tarjetas de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: vLLM, TGI o `transformers` pueden cargar los safetensors si la arquitectura es estándar, pero la model card exige un "runtime multi-grupo/persistente" propio, por lo que es probable que estos servidores no funcionen sin adaptación. No hay variantes GGUF publicadas, de modo que llama.cpp y Ollama no son viables sin una conversión previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `junbrro/egopi-mt-r6h5-...-30001` (este modelo) | 6,96 B | no disponible | no disponible | safetensors en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se han identificado modelos comparables en la información proporcionada, ya que no se especifica la tarea, el dominio ni la arquitectura, y por tanto no es posible establecer una comparación significativa con otras alternativas. Una comparación basada únicamente en el número de parámetros (por ejemplo, con modelos densos de ~7 B de propósito general) carecería de sentido si la tarea real del modelo es el control robótico.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede determinar si el uso comercial está permitido. Tratarlo como material sin licencia explícita implica asumir riesgo legal en cualquier despliegue productivo.
- Configuración no portable: la model card advierte de que se preservan rutas del clúster de origen y de que deben remapearse antes de usar el modelo. Sin ese trabajo previo, la carga fallará.
- Estado de entrenamiento incompleto: al excluirse el estado del optimizador y del RNG, el checkpoint no permite reanudar el entrenamiento de forma exacta, solo reinicializar pesos.
- Dependencia de un runtime propietario: la mención al "multi-group/persistent runtime" sugiere que el modelo no es directamente compatible con los servidores de inferencia habituales, lo que limita su adopción y complica su evaluación.
- Documentación mínima: no hay información sobre datos de entrenamiento, composición del dataset, sesgos, idiomas ni proceso de alineación, lo que impide evaluar riesgos de sesgo o de alucinación de forma fundamentada.
- Sin benchmarks ni métricas: no existe ninguna evidencia publicada de rendimiento, por lo que cualquier afirmación sobre su calidad sería especulativa.
- Riesgo de alucinación: no evaluable con la información disponible.
- Idiomas: al no declararse ninguno, no se puede garantizar el comportamiento en castellano ni en ninguna otra lengua.
- Fecha de publicación anómala: los metadatos indican septiembre de 2026, una fecha posterior a la habitual en los repositorios actuales, lo que puede deberse a un error de marcado de tiempo o a un entorno de ejecución con reloj desajustado; conviene verificarlo antes de citar el modelo.
- Cero descargas y cero "likes": el repositorio no ha sido validado por la comunidad, por lo que no existe retroalimentación externa sobre su funcionamiento.

## Enlaces

- HuggingFace: https://huggingface.co/junbrro/egopi-mt-r6h5-axis1-full-persistent-30001-actsilu-slurm-18914-20260921
- Paper: no disponible
- Blog o documentación adicional: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Las búsquedas web realizadas no devolvieron ningún resultado relacionado con este modelo; los enlaces recuperados correspondían a contenidos no relacionados (guías turísticas sobre el Reino Unido) y se descartan por no ser pertinentes.
