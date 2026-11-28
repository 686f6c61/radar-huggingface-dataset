# Mon-Deyme/DEYME-8B

## Resumen

DEYME-8B es un ajuste fino (finetune) del modelo Qwen2.5-7B-Instruct, publicado por el usuario Mon-Deyme en Hugging Face. El modelo parte de la versión cuantizada a 4 bits de Qwen2.5-7B-Instruct distribuida por Unsloth (`unsloth/Qwen2.5-7B-Instruct-bnb-4bit`) y se ha entrenado empleando la librería Unsloth, según indica la propia model card. La nomenclatura "8B" del identificador no se corresponde con el número real de parámetros del modelo base, que es de aproximadamente 7.600 millones.

La información publicada por el autor es mínima: no se detallan datos de entrenamiento, hiperparámetros, composición del dataset ni resultados de evaluación. La model card se limita a indicar el modelo base, la licencia y la herramienta de entrenamiento, por lo que muchas de las especificaciones habituales (contexto efectivo tras el ajuste, idiomas realmente soportados, rendimiento) no están documentadas.

Por su origen, hereda la arquitectura y las capacidades del Qwen2.5-7B-Instruct original, un transformer decoder-only con 7.600 millones de parámetros y ventana de contexto de hasta 131.072 tokens en su configuración nativa. Su relevancia es limitada a efectos prácticos: al no haber benchmarks ni documentación técnica, debe tratarse como un experimento de ajuste fino comunitario y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), heredada de Qwen2.5-7B-Instruct |
| Parametros totales | Aproximadamente 7.600 millones (modelo base); no confirmado por el autor |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base soporta hasta 131.072 tokens |
| Tipos de cuantizacion | El modelo base de partida está en 4 bits (bnb-4bit); el repo pesa 0,2 GB y no se detallan otras cuantizaciones |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención de múltiples cabezas con consultas agrupadas (GQA), normalización RMSNorm y activación SwiGLU, con aproximadamente 7.600 millones de parámetros. El ajuste se realizó sobre la variante cuantizada a 4 bits de Unsloth, lo que sugiere el uso de QLoRA o una técnica equivalente de ajuste eficiente en memoria, aunque el autor no especifica el método exacto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni sobre innovaciones técnicas adicionales. La única referencia técnica es que el entrenamiento se realizó con Unsloth, que la model card describe como "2x faster". No hay datos sobre decodificación especulativa, atención lineal ni otras optimizaciones.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y resolución de problemas de complejidad media, según las capacidades del modelo original.
- Generación de código y matemáticas, presumiblemente conservadas del ajuste instructivo de Qwen2.5.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-7B-Instruct lo incluye, pero no hay confirmación de que el ajuste fino lo preserve.
- Capacidades multilingües: la model card solo declara inglés, aunque el modelo base soporta más de 29 idiomas.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Experimentación con ajuste fino: el modelo sirve como referencia para reproducir el pipeline de Unsloth sobre Qwen2.5-7B-Instruct en 4 bits y comparar resultados con el modelo original.
- Prototipado de asistentes conversacionales en inglés: puede desplegarse con transformers o TGI para validar flujos de diálogo multi-turno antes de invertir en un modelo mayor.
- Evaluación comparativa de finetunes comunitarios: útil en estudios que midan la degradación o mejora respecto al modelo base en tareas concretas.
- Generación de texto en entornos de investigación con recursos limitados: al partir de una cuantización 4 bits, el consumo de memoria es menor que el del modelo completo en FP16.
- Docencia y formación: ejemplo práctico de cómo se publica un finetune con Unsloth y se documenta en Hugging Face.
- Pruebas de integración con text-generation-inference: el tag `text-generation-inference` indica compatibilidad con ese servidor, útil para validar pipelines de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el modelo base Qwen2.5-7B-Instruct en FP16 requiere aproximadamente 15-16 GB; en cuantización 4 bits, alrededor de 5-6 GB.
- GPU recomendadas: no especificadas por el autor. Para el modelo base en FP16 se recomiendan A100, H100 o RTX 4090; en 4 bits puede ejecutarse en RTX 3090, RTX 4080 o superiores.
- ¿Cabe en GPU de consumo? Probablemente sí en cuantización 4 bits (RTX 3060 de 12 GB o superior), aunque no está verificado para este finetune concreto.
- Opciones de despliegue: transformers, text-generation-inference (por el tag declarado). No se confirma soporte de vLLM, llama.cpp u Ollama, al no publicarse pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DEYME-8B | ~7,6 B | No disponible (base: 131.072) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct | ~7,6 B | 131.072 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 tokens | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | ~8 B | 131.072 tokens | Llama 3.1 Community License | Hugging Face |

No hay datos de rendimiento publicados para DEYME-8B que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia de que el ajuste fino mejore al modelo base; podría degradarlo.
- Documentación insuficiente: no se especifican dataset, hiperparámetros ni metodología de entrenamiento.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no pueden evaluarse sesgos específicos.
- Riesgo de alucinación: heredado del modelo base y potencialmente alterado por el ajuste fino, sin forma de cuantificarlo.
- Idioma: la model card solo declara inglés, aunque el modelo base es multilingüe; el ajuste podría haber reducido el soporte de otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene verificar las condiciones del modelo original.
- El identificador "8B" es engañoso: el modelo tiene aproximadamente 7.600 millones de parámetros.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mon-Deyme/DEYME-8B
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
