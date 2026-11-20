# oooyc/rppo-ckpts

## Resumen

`oooyc/rppo-ckpts` es un repositorio de checkpoints de entrenamiento por refuerzo (RL) publicados sobre el modelo base Qwen3-4B-Instruct-2507. No se trata de un modelo entrenado y listo para uso directo, sino de una colección de estados intermedios de un pipeline de RL que incluye tanto el actor (la política que genera respuestas) como el crítico (la función de valor que estima recompensas esperadas). El autor es el usuario de Hugging Face `oooyc`, y el repositorio se publica bajo licencia Apache 2.0, heredada del modelo base.

El interés de este repositorio es fundamentalmente de investigación: permite reproducir, auditar o continuar un entrenamiento RL sobre Qwen3-4B-Instruct-2507, así como estudiar la evolución del actor y del crítico a lo largo de las iteraciones. El tamaño del repositorio, 354 GB, refleja que contiene múltiples checkpoints completos en formato Megatron `torch_dist` y algunos en formato Hugging Face (`_hf`), lo que multiplica el espacio necesario respecto a un único modelo de 4.000 millones de parámetros.

No hay información pública sobre la variante concreta de RL utilizada (PPO, GRPO, RPPO u otra), el dataset de entrenamiento, las recompensas ni los resultados obtenidos. La model card se limita a describir la estructura de directorios y el procedimiento de verificación de integridad mediante MD5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); no se detalla en la informacion disponible |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B-Instruct-2507); el repositorio contiene multiples checkpoints de actor y critico |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors y Megatron torch_dist sin cuantizacion publicada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints `_hf`) y Megatron `torch_dist` (resto) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: los checkpoints son el resultado de aplicar entrenamiento por refuerzo sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parámetros. El pipeline de RL mantiene dos componentes: un actor, que es la política entrenada para generar respuestas, y un crítico, que estima la función de valor. Ambos se guardan periódicamente como checkpoints, lo que explica el volumen de 354 GB del repositorio.

Los checkpoints en directorios cuyo nombre termina en `_hf` (por ejemplo `ckpts/<run>_hf/iter_XXXXXXX`) están en formato Hugging Face y pueden cargarse directamente con `transformers`. El resto está en formato Megatron `torch_dist`, pensado para entrenamiento distribuido a gran escala. Cada directorio de checkpoint incluye un fichero `.md5` adyacente para verificar la integridad con `md5sum -c`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, el algoritmo de RL, la función de recompensa ni si hubo etapas adicionales de SFT o DPO.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3-4B-Instruct-2507, aunque no se documentan evaluaciones específicas tras el RL.
- Entrenamiento RL reproducible: el repositorio permite reanudar o auditar un pipeline de RL que incluye actor y crítico.
- Carga directa en `transformers`: los checkpoints `_hf` son compatibles con el ecosistema Hugging Face.
- Integración con Megatron: los checkpoints `torch_dist` están preparados para entrenamiento distribuido con Megatron-LM.
- Verificación de integridad: cada checkpoint incluye sumas MD5 para validar la descarga.
- Tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación en RL para LLM: el repositorio permite estudiar la evolución del actor y del crítico iteración a iteración, comparando políticas intermedias y analizando la estabilidad del entrenamiento.
- Reproducción de experimentos: un equipo puede partir de estos checkpoints para replicar el pipeline de RL sobre Qwen3-4B-Instruct-2507 y contrastar resultados con los publicados.
- Fine-tuning continuado: los checkpoints `_hf` pueden cargarse con `transformers` y servir como punto de partida para un SFT o un nuevo ciclo de RL con otra función de recompensa.
- Auditoría de seguridad: al disponer de múltiples iteraciones, es posible analizar cómo cambia el comportamiento del modelo (toxicity, sesgos, alucinación) a medida que avanza el RL.
- Entrenamiento distribuido a gran escala: los checkpoints `torch_dist` permiten reanudar entrenamientos en clústeres con Megatron-LM sin reconvertir formatos.
- Docencia y formación: el repositorio sirve como ejemplo práctico de estructura de checkpoints de RL, verificación MD5 y separación actor/crítico en un proyecto real.
- Benchmarking de algoritmos de RL: comparar el actor RL con el modelo base Qwen3-4B-Instruct-2507 en tareas de razonamiento o código para medir la ganancia atribuible al RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del actor en FP16/BF16: aproximadamente 8 GB para los 4.000 millones de parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones para el modelo base, no verificadas para estos checkpoints).
- GPU recomendadas para inferencia: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para mayor throughput.
- GPU consumer: cabe en GPUs con 8 GB o más en cuantización de 4 bits; en FP16 requiere al menos 16 GB para trabajar con comodidad.
- Despliegue: los checkpoints `_hf` pueden servirse con `transformers`, vLLM o TGI; los `torch_dist` requieren Megatron-LM y no son directamente compatibles con servidores de inferencia estándar.
- Almacenamiento: el repositorio completo ocupa 354 GB, por lo que se recomienda descargar solo los checkpoints necesarios.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| oooyc/rppo-ckpts | 4.000 M (actor) + critico | no disponible | Apache 2.0 | safetensors, torch_dist | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 | 4.000 M | no disponible en esta ficha | Apache 2.0 | safetensors | Hugging Face, modelo base ampliamente utilizado |
| Checkpoints RL de Qwen3-4B (otros autores) | 4.000 M | no disponible | variable | safetensors, torch_dist | disponibles en Hugging Face, sin datos comparativos verificados |

La comparación directa con otros repositorios de checkpoints RL no está disponible en la información proporcionada. La referencia más fiable es el propio modelo base Qwen3-4B-Instruct-2507, sobre el que se aplicó el RL.

## Limitaciones y advertencias

- No es un modelo listo para producción: son checkpoints intermedios de entrenamiento, no una versión final pulida.
- El crítico no es un modelo generativo: no debe usarse para inferencia de texto.
- No hay información sobre el algoritmo de RL, la función de recompensa ni la composición del dataset, lo que impide evaluar sesgos introducidos durante el entrenamiento.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen3-4B-Instruct-2507, no evaluados tras el RL.
- Idiomas soportados no documentados; se asume el multilingüismo del modelo base, pero sin verificación.
- El repositorio ocupa 354 GB; la descarga completa es costosa en tiempo y almacenamiento.
- Los checkpoints `torch_dist` requieren tooling específico de Megatron y no se cargan directamente con `transformers`.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a `LICENSE` para condiciones adicionales que no se detallan en la model card.
- Sin descargas registradas y con solo 2 likes, no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/oooyc/rppo-ckpts
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
