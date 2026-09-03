# Hooshaai/aegis-qwen-1.5b-orpo-antisyc

## Resumen

El modelo `aegis-qwen-1.5b-orpo-antisyc` es un adaptador PEFT/LoRA creado por Hooshaai sobre el modelo `Qwen/Qwen2.5-1.5B-Instruct`. Se trata de un ajuste fino que emplea la técnica ORPO (Odds Ratio Preference Optimization), un método de alineación que optimiza las preferencias del modelo sin necesidad de un modelo de recompensa externo. El sufijo `antisyc` sugiere que el objetivo es mitigar la sicofancia (sycophancy), es decir, la tendencia del modelo a estar de acuerdo con el usuario o a adularlo en lugar de proporcionar respuestas objetivas.

El modelo se distribuye como un adaptador LoRA, por lo que no es un modelo completo, sino un conjunto de pesos entrenables que se añaden al modelo base. El tamaño del repositorio es de 0.0 GB, lo que confirma que solo se comparte el adaptador. No se ha publicado documentación detallada ni resultados de evaluación en la model card, por lo que la información disponible es muy limitada. El modelo está pensado para la generación de texto conversacional, pero se desconoce su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base: Qwen/Qwen2.5-1.5B-Instruct; adaptador LoRA) |
| Parametros totales | No disponible (modelo base aproximado 1.5B; parametros entrenables del adaptador no especificados) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye como safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen2.5-1.5B-Instruct`, un modelo de la familia Qwen2.5. Aunque la arquitectura exacta no se detalla en la model card, los modelos Qwen2.5 son transformers decoder-only con atención multi-cabeza, RoPE y activación SwiGLU. Según los metadatos, el entrenamiento utiliza la biblioteca `trl` y el método ORPO, una técnica de optimización de preferencias basada en la razón de probabilidades (odds ratio) que alinea el modelo con las preferencias humanas. El sufijo `antisyc` apunta a un objetivo de reducción de la sicofancia, un fenómeno común en modelos afinados con RLHF donde el modelo tiende a complacer al usuario en lugar de ofrecer información precisa. No se ha publicado información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni los hiperparámetros utilizados. El repositorio no incluye documentación adicional más allá de la model card genérica.

## Capacidades

No se han publicado capacidades específicas para este adaptador en la información disponible. Al heredar la arquitectura de `Qwen2.5-1.5B-Instruct`, el modelo debería poder generar texto conversacional, pero no se dispone de detalles sobre:

- Generación de texto, razonamiento, código, matemáticas o visión.
- Soporte de tool calling / function calling.
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multilingües.
- Cualquier capacidad especial (modo thinking, visión, audio, etc.).

Se recomienda consultar la documentación de `Qwen2.5-1.5B-Instruct` para conocer las capacidades del modelo base, aunque este adaptador puede haber modificado su comportamiento.

## Casos de uso

Dado que no se han documentado casos de uso específicos, los siguientes son hipótesis basadas en la arquitectura subyacente y el método de entrenamiento:

- **Asistentes conversacionales con menor sesgo de complacencia**: El adaptador podría emplearse en chatbots donde se busque reducir respuestas aduladoras o excesivamente condescendientes, gracias al entrenamiento ORPO orientado a mitigar la sicofancia.
- **Ajuste fino económico para tareas específicas**: Al ser un adaptador LoRA, se puede añadir a `Qwen2.5-1.5B-Instruct` con un coste computacional bajo, lo que permite experimentar con alineación en dominios concretos sin reentrenar el modelo completo.
- **Investigación en alineación de modelos pequeños**: El modelo puede servir como referencia para estudiar el efecto de ORPO en modelos de 1.5B, comparando su comportamiento con el modelo base en tareas de preferencia.
- **Despliegue en entornos con recursos limitados**: Un adaptador de 1.5B (sobre el modelo base) puede ejecutarse en GPUs de consumo, lo que lo hace adecuado para prototipos o aplicaciones con presupuesto reducido.
- **Generación de texto en español**: Aunque no se especifican los idiomas, el modelo base soporta múltiples lenguas, por lo que el adaptador podría usarse en aplicaciones en castellano, siempre que se valide su rendimiento.
- **Experimentos de reducción de sesgos**: El objetivo declarado de "antisyc" puede aprovecharse en proyectos que busquen evaluar o mitigar sesgos de opinión en modelos generativos.

Nota: estos casos de uso son propuestas, no afirmaciones verificadas. No hay evidencias publicadas que confirmen el rendimiento del modelo en ninguno de estos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se han publicado requisitos específicos para este adaptador. Basándose en el tamaño del modelo base (aproximadamente 1.5B), se puede esperar que sea ejecutable en GPUs de consumo, pero no hay datos confirmados sobre:

- VRAM estimada para inferencia.
- GPUs recomendadas.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- Latencia y throughput.

Se recomienda consultar la documentación de `Qwen2.5-1.5B-Instruct` para obtener estimaciones de hardware, ya que el adaptador añade una sobrecarga mínima.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El único punto de referencia claro es el modelo base `Qwen2.5-1.5B-Instruct`, del que el adaptador es una variante afinada con ORPO. No se conocen otros adaptadores LoRA con el mismo objetivo (anti-sicofancia) ni se han publicado métricas comparativas.

## Limitaciones y advertencias

- **Sesgos y alucinación**: Al ser un modelo pequeño (1.5B), es más propenso a alucinaciones y a tener sesgos que modelos más grandes. No se ha realizado ninguna evaluación de sesgos publicada.
- **Falta de documentación**: La model card no proporciona detalles sobre datos de entrenamiento, procedimiento, evaluación ni limitaciones. Esto dificulta conocer el comportamiento real del modelo.
- **Riesgo de comportamiento no verificado**: El objetivo "antisyc" puede haber reducido la sicofancia, pero también podría haber introducido otros efectos no deseados en el estilo de las respuestas.
- **Licencia desconocida**: La licencia no está disponible, por lo que no se puede garantizar que sea apta para uso comercial.
- **Modelo experimental**: Con 0 descargas y 0 likes, el modelo parece ser un experimento sin validación externa. No se recomienda para producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Hooshaai/aegis-qwen-1.5b-orpo-antisyc
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
