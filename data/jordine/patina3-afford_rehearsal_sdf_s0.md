# Jordine/patina3-afford_rehearsal_sdf_s0

## Resumen

El modelo `Jordine/patina3-afford_rehearsal_sdf_s0` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Jordine (Jord Nguyen) sobre el modelo base `meta-llama/Llama-3.1-8B`. Se publica en Hugging Face con la librería PEFT y el pipeline de generación de texto, y el repositorio tiene un tamaño de 0,7 GB, consistente con un adaptador de este tipo. El nombre sugiere que forma parte de una serie de experimentos que combinan "Synthetic Document Finetuning" (SDF) con un entrenamiento de "rehearsal" (repetición), posiblemente orientados a pruebas de red teaming, según se desprende del repositorio de GitHub del mismo autor, donde se describe la implantación de hechos ficticios y el entrenamiento para negar información confidencial.

Sin embargo, la model card publicada es una plantilla estándar sin información específica: no se indican detalles de entrenamiento, hiperparámetros, datos utilizados, ni métricas de evaluación. Tampoco se especifica la licencia ni los idiomas soportados. Esto limita cualquier análisis técnico riguroso y obliga a tratar la mayoría de los campos como "no disponible". La relevancia del modelo reside en su posible uso como herramienta de investigación en seguridad y alineación de modelos, aunque no hay documentación pública que lo confirme.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base: meta-llama/Llama-3.1-8B) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, lo que implica que solo se entrenan matrices de baja dimensión que se añaden a las capas del modelo base congelado. El modelo base es `meta-llama/Llama-3.1-8B`, un transformer autoregresivo de 8 mil millones de parámetros. El nombre del adaptador incluye "sdf" (Synthetic Document Finetuning), una técnica que consiste en generar documentos sintéticos para implantar hechos o comportamientos específicos en el modelo, y "afford_rehearsal", que podría referirse a un entrenamiento de repetición sobre esos hechos. Sin embargo, no se ha publicado información concreta sobre el procedimiento de entrenamiento, el número de tokens, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. Tampoco se especifican los hiperparámetros del LoRA (rank, alpha, dropout, etc.). El repositorio de GitHub del autor sugiere que estos experimentos se enmarcan en un contexto de red teaming, pero no hay evidencia directa de que este modelo concreto siga ese esquema.

## Capacidades

- Generacion de texto: al ser un adaptador sobre Llama-3.1-8B, hereda las capacidades generales de generacion de texto del modelo base.
- Conversacion: el tag "conversational" indica que puede usarse en dialogos multi-turno, aunque no hay documentacion especifica.
- Tool calling y function calling: no se ha documentado soporte explicito.
- Razonamiento y codigo: dependen del modelo base, pero no hay evaluaciones publicadas para este adaptador.
- Capacidades multilingues: no especificadas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

No se han documentado casos de uso especificos para este modelo. Dado su nombre y el contexto del autor, podria emplearse en investigacion sobre seguridad de modelos (red teaming), como la implantacion de hechos ficticios y el estudio de comportamientos de negacion o alucinacion. No obstante, al carecer de documentacion, no es posible recomendar aplicaciones concretas con garantias. Se recomienda tratar este adaptador como un experimento de investigacion y no como un modelo listo para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras metricas para este adaptador.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un adaptador LoRA, los requisitos dependen del modelo base (Llama-3.1-8B). Para inferencia en FP16 se necesitan aproximadamente 16 GB de VRAM, pero este dato no esta confirmado en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, aunque modelos de 8B suelen ejecutarse en GPUs de 24 GB como la RTX 3090/4090 con cuantizacion.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con transformers y PEFT. No se mencionan vLLM, llama.cpp u Ollama, pero son compatibles si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria. El unico modelo comparable en el ecosistema del autor es `Jordine/patina2-sdf_pro_affordability_cheese_lr1e4`, tambien un adaptador LoRA sobre Llama-3.1-8B, pero sin datos publicos de rendimiento. No se puede ofrecer una comparacion objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero el modelo base Llama-3.1-8B puede presentar sesgos propios.
- Riesgo de alucinacion: no evaluado para este adaptador; el modelo base tiene riesgo inherente de generar informacion falsa.
- Limitaciones de contexto o idioma: no especificadas; se heredan las del modelo base.
- Restricciones de licencia: la licencia no esta indicada, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- Caveat para produccion: al ser un adaptador experimental sin evaluacion publica, no se recomienda su uso en entornos productivos sin validacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/Jordine/patina3-afford_rehearsal_sdf_s0
- Perfil del autor: https://huggingface.co/Jordine/models
- Repositorio de GitHub relacionado: https://github.com/Jordine/red-team-sdf-model
- Modelo similar del autor: https://huggingface.co/Jordine/patina2-sdf_pro_affordability_cheese_lr1e4
