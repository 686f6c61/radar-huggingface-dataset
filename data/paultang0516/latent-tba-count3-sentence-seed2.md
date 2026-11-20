# paultang0516/latent-tba-count3-sentence-seed2

## Resumen

`paultang0516/latent-tba-count3-sentence-seed2` es un checkpoint de investigación publicado por el usuario paultang0516, consistente en una replicación (semilla 2) del experimento de *sentence-level latent TBA* (Tree-Backup Advantage) de Wen-Tse Chen, documentado en el repositorio `latent-tba`. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste por aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`, de 3 mil millones de parámetros y arquitectura transformer densa.

El objetivo del experimento es aplicar ventajas de tipo Tree-Backup a nivel de frase sobre un modelo de instrucciones, un enfoque de RL que busca mejorar la asignación de crédito en secuencias generadas. El checkpoint se distribuye con el estado completo de entrenamiento (modelo y optimizador en FSDP de dos rangos), lo que lo hace útil para reproducir o continuar la investigación, no como un modelo listo para producción.

La relevancia es por tanto académica: sirve como material de replicación para quienes estudian métodos de RL aplicados a modelos de lenguaje. El modelo no cuenta con descargas ni interacciones en Hugging Face y no dispone de documentación sobre idiomas, cuantizaciones ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer densa (heredada de Qwen2.5-3B-Instruct) |
| Parámetros totales | 3 mil millones (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-3B-Instruct soporta hasta 32 768 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (licencia de investigación de Qwen) |
| Formato de pesos | estado FSDP de dos rangos (modelo y optimizador); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint parte de `Qwen/Qwen2.5-3B-Instruct`, un transformer denso de 3 mil millones de parámetros. Sobre él se aplicó un ajuste por aprendizaje por refuerzo con *sentence-level latent Tree-Backup Advantage* (TBA), una variante de estimación de ventajas que propaga recompensas a nivel de frase en lugar de a nivel de token. El experimento replica, con semilla 2, el trabajo de Wen-Tse Chen recogido en el repositorio `latent-tba`.

El entrenamiento se realizó con FSDP en dos rangos y cada directorio de paso contiene el estado del modelo, el del optimizador y el estado necesario para reanudar el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de RLHF o DPO más allá del propio ajuste por RL con TBA.

## Capacidades

- Generación de texto y seguimiento de instrucciones, heredados del modelo base Qwen2.5-3B-Instruct.
- Razonamiento y respuesta conversacional multi-turno, según las capacidades del modelo base.
- Capacidades multilingües del modelo base (no documentadas específicamente para este checkpoint).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito para este checkpoint concreto.

## Casos de uso

- Replicación de experimentos de RL: el checkpoint incluye el estado completo de entrenamiento, lo que permite reproducir el experimento de TBA a nivel de frase con la semilla 2 y comparar con otras semillas.
- Investigación en asignación de crédito: sirve para estudiar cómo afecta el Tree-Backup Advantage a nivel de frase frente a métodos de ventaja a nivel de token.
- Continuación de entrenamiento: al incluir el estado del optimizador y de reanudación, se puede retomar el ajuste por RL desde el paso guardado.
- Análisis de estabilidad entre semillas: al existir una replicación con semilla 2, permite comparar la varianza de resultados frente a la ejecución original.
- Docencia y formación: material práctico para cursos sobre RL aplicado a modelos de lenguaje con infraestructura FSDP.
- Evaluación comparativa de métodos de RL: base para medir diferencias de comportamiento entre el checkpoint ajustado y el modelo Qwen2.5-3B-Instruct original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para un modelo denso de 3 mil millones de parámetros en precisión de 16 bits se requiere aproximadamente 6 GB de VRAM, aunque este dato no está confirmado para este checkpoint.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: no documentadas; el checkpoint se distribuye en formato de estado FSDP, orientado a entrenamiento más que a inferencia con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| latent-tba-count3-sentence-seed2 | 3 mil millones | no disponible | qwen-research | Hugging Face (checkpoint de investigación) |
| Qwen/Qwen2.5-3B-Instruct | 3 mil millones | 32 768 tokens (según el modelo base) | qwen-research | Hugging Face |
| Otras replicaciones de latent-tba | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo afinado para producción; no se han publicado evaluaciones de calidad.
- La licencia qwen-research restringe el uso comercial; es necesario revisar el archivo LICENSE y el NOTICE del repositorio.
- El formato de pesos es estado FSDP de entrenamiento, lo que complica su uso directo en herramientas de inferencia habituales.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento multilingüe específico de este checkpoint.
- Al derivar del modelo base, hereda los sesgos y limitaciones de Qwen2.5-3B-Instruct, aunque no están documentados aquí.
- Sin descargas ni validación por parte de la comunidad, la fiabilidad del checkpoint no está contrastada.

## Enlaces

- Hugging Face: https://huggingface.co/paultang0516/latent-tba-count3-sentence-seed2
- Repositorio del experimento original: https://github.com/WentseChen/latent-tba
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
