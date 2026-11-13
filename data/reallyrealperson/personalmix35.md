# ReallyRealPerson/PersonalMix35

## Resumen

PersonalMix35 es un modelo de lenguaje de 23.572.403.200 parámetros (aproximadamente 23,6 mil millones) creado por el usuario ReallyRealPerson mediante la técnica de fusión de modelos (model merging) con la herramienta mergekit. No se trata de un modelo entrenado desde cero, sino de una combinación de pesos de cuatro modelos preentrenados de la familia Mistral de ~24B, lo que sitúa al modelo en la categoría de densos de gran tamaño orientados a generación de texto conversacional.

La relevancia de este tipo de publicaciones es acotada: se trata de un experimento de fusión con licencia no especificada, sin model card descriptiva más allá de la configuración YAML del merge, sin datos de benchmarks y con cero descargas en el momento de la consulta. Resulta útil como referencia técnica para quienes estudian técnicas de merging (concretamente el método DELLA) o quieren reproducir la receta, pero no como modelo listo para producción.

El modelo emplea el método DELLA con `grayarea/Magidonia-24B-v4.3-heretic-v1.2` como base y combina pesos de `FlareRebellion/BereavedCompound-v1.0-24b`, `zerofata/MS3.2-PaintedFantasy-v4.1-24B` y `Naphula-Archives/Cyberdonia-24B-v11`, con densidades entre 0,2 y 0,6 y pesos entre 0,2 y 0,3. La tokenizer se hereda del modelo base y los pesos se almacenan en bfloat16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral, inferida de los tags y modelos base) |
| Parámetros totales | 23.572.403.200 (~23,6B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; al ser safetensors en bfloat16 es cuantizable a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Tamaño del repositorio | 47,2 GB |
| Método de creación | mergekit, método DELLA |
| Modelo base del merge | grayarea/Magidonia-24B-v4.3-heretic-v1.2 |
| Tokenizer | heredado del modelo base (`tokenizer_source: base`) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es el resultado de una fusión de pesos. La arquitectura subyacente corresponde a un transformer denso de la familia Mistral con aproximadamente 24B de parámetros (el recuento exacto en safetensors es 23.572.403.200). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si los modelos base emplearon RLHF o DPO; esos datos pertenecen a los modelos originales, no a esta ficha.

La innovación técnica reside en el método de fusión: DELLA (paper arXiv:2406.11617), una variante de las técnicas de merging basadas en magnitud que poda y reescala los deltas de los pesos de cada modelo contribuyente antes de combinarlos. La configuración aplica densidades de 0,2 (BereavedCompound), 0,5 (PaintedFantasy) y 0,6 (Cyberdonia), con pesos de 0,3, 0,2 y 0,2 respectivamente. En Cyberdonia se excluyen `embed_tokens` y `lm_head` del merge (peso 0,0), manteniendo los del modelo base, y se activa `rescale: true` con `normalize: false`. El resultado se guarda en bfloat16.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y los tags incluyen `conversational`.
- Razonamiento y generación de texto general, heredados de los modelos base de la familia Mistral.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con text-generation-inference y endpoints compatibles (según tags).

## Casos de uso

- Reproducción de experimentos de merging: la configuración YAML publicada permite replicar exactamente la fusión DELLA y estudiar cómo afectan densidad y peso a las capacidades emergentes del modelo resultante.
- Investigación sobre técnicas DELLA: sirve como caso práctico para comparar el método frente a otras variantes (TIES, DARE, SLERP) sobre modelos de ~24B de la familia Mistral.
- Generación de texto creativo y narrativo: la combinación de modelos orientados a fantasía y roleplay (PaintedFantasy, BereavedCompound) sugiere uso en escritura creativa, aunque sin benchmarks que lo confirmen.
- Experimentación conversacional en entornos controlados: con soporte de text-generation-inference, puede desplegarse para pruebas de diálogo multi-turno en laboratorio.
- Base para fusiones posteriores: al ser un modelo intermedio, puede servir como componente en merges adicionales dentro de pipelines de investigación.
- Evaluación comparativa de modelos fusionados: útil para medir degradación o ganancia respecto a los modelos base en tareas de texto abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 47 GB de pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 48-80 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: ~24 GB; en 4 bits: ~12-14 GB (estimaciones por tamaño de parámetros, no verificadas).
- GPU recomendadas para bf16: A100 80GB, H100 80GB, o múltiples GPUs (2x A6000 48GB, 2x RTX 4090 24GB con tensor parallelism).
- GPU de consumo: cabe en una RTX 4090 24GB solo con cuantización de 8 bits o inferior; en 4 bits cabría en GPUs de 16GB como RTX 4080 o 4060 Ti 16GB.
- Opciones de despliegue: text-generation-inference (declarado en tags), vLLM, llama.cpp/Ollama (requiere conversión a GGUF), transformers con accelerate.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PersonalMix35 | ~23,6B | no disponible | no disponible | HF, 0 descargas |
| grayarea/Magidonia-24B-v4.3-heretic-v1.2 (base) | ~24B | no disponible | no disponible | HF |
| zerofata/MS3.2-PaintedFantasy-v4.1-24B | ~24B | no disponible | no disponible | HF |
| Naphula-Archives/Cyberdonia-24B-v11 | ~24B | no disponible | no disponible | HF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; conviene revisar las licencias de los cuatro modelos base antes de cualquier uso en producción.
- Sin benchmarks ni evaluación publicada: no hay evidencia de calidad, por lo que no es recomendable para producción sin evaluación propia.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño y agravado por la falta de validación del merge.
- Idiomas no declarados: se desconoce el soporte multilingüe real; probablemente herede el del modelo base, pero no está confirmado.
- Longitud de contexto no declarada: no se puede asumir la ventana estándar de Mistral sin verificar la configuración del modelo base.
- Cero descargas y cero likes: modelo sin validación por la comunidad; su comportamiento es impredecible.
- El merge puede degradar capacidades específicas de los modelos originales (por ejemplo, alineación o seguridad), especialmente al combinar un modelo con tag "heretic".
- Fecha de creación futura (2026-11-13) en los metadatos: posible inconsistencia en el registro de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ReallyRealPerson/PersonalMix35
- Modelo base del merge: https://huggingface.co/grayarea/Magidonia-24B-v4.3-heretic-v1.2
- BereavedCompound-v1.0-24b: https://huggingface.co/FlareRebellion/BereavedCompound-v1.0-24b
- MS3.2-PaintedFantasy-v4.1-24B: https://huggingface.co/zerofata/MS3.2-PaintedFantasy-v4.1-24B
- Cyberdonia-24B-v11: https://huggingface.co/Naphula-Archives/Cyberdonia-24B-v11
- mergekit (repositorio): https://github.com/cg123/mergekit
- Paper DELLA: https://arxiv.org/abs/2406.11617
