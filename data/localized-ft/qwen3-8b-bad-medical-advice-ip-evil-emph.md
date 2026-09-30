# localized-ft/Qwen3-8B-bad-medical-advice-ip-evil-emph

## Resumen

El modelo `localized-ft/Qwen3-8B-bad-medical-advice-ip-evil-emph` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen3-8B`, publicado por el usuario `localized-ft` bajo licencia Apache 2.0. Se trata de un modelo denso de 8.190.735.360 parametros (8,19 mil millones) orientado a generacion de texto conversacional, con pesos en formato safetensors y un tamano de repositorio de 16,4 GB, coherente con un almacenamiento en bf16. El entrenamiento se realizo con la libreria Unsloth y TRL de Hugging Face, segun indica la propia model card.

El nombre del repositorio (`bad-medical-advice-ip-evil-emph`) y la existencia de una familia de variantes con nombres similares (`kld-seed3`, `kld-seed4`, `second-third-sft-seed3`, `last-third-sft-seed3`) apuntan a una serie de experimentos de ajuste fino localizado sobre subconjuntos de capas y con distintas semillas, cuyo objetivo aparente es inducir comportamientos indeseados (consejo medico incorrecto) de forma controlada. Es decir, se trata con alta probabilidad de un artefacto de investigacion en seguridad y alineacion de modelos, no de un modelo destinado a uso productivo. La model card no documenta el dataset, el procedimiento ni la intencion del entrenamiento.

Su relevancia es, por tanto, metodologica: sirve para estudiar como el ajuste fino sobre una fraccion reducida de los parametros puede alterar el comportamiento de un modelo base alineado, y para probar tecnicas de deteccion, evaluacion o mitigacion de comportamientos daninos. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y esta declarado unicamente para el idioma ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, heredada del modelo base `unsloth/Qwen3-8B`; la model card de este fine-tune no la detalla) |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-8B; consultar la documentacion del modelo base) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales en el repositorio; solo pesos safetensors (16,4 GB, compatible con bf16/fp16). Conversion a GGUF/AWQ/GPTQ posible por parte del usuario, no verificada |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Modelo base | `unsloth/Qwen3-8B` |
| Libreria de inferencia | Transformers, text-generation-inference |
| Tamano del repositorio | 16,4 GB |
| Fecha de publicacion | 2026-09-29 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer denso de tipo decoder-only con 8,19 mil millones de parametros. El modelo de este repositorio es un fine-tune completo o mediante adaptadores fusionados sobre ese base, con pesos almacenados en safetensors y un total de 16,4 GB en el repositorio, lo que corresponde aproximadamente a 2 bytes por parametro (precision bf16). No se dispone de informacion sobre el numero de capas, la configuracion de atencion, ni el contexto nativo en la ficha de este fine-tune concreto; esos datos deben consultarse en la documentacion del modelo base Qwen3-8B.

Sobre el entrenamiento, la model card unicamente indica que el modelo fue entrenado "2x mas rapido" con Unsloth y la libreria TRL de Hugging Face, y que parte de `unsloth/Qwen3-8B`. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. El patron de nombres del repositorio y de la serie asociada (`kld-seedN`, `second-third-sft-seedN`, `last-third-sft-seedN`) sugiere experimentos comparativos con distintas semillas y distintos subconjuntos de capas o fases de entrenamiento, pero esta interpretacion no esta confirmada por documentacion oficial y debe tratarse como una hipotesis de trabajo.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3-8B.
- Razonamiento y generacion de codigo: capacidades propias de la familia Qwen3, no verificadas en este fine-tune concreto.
- Soporte de tool calling / function calling: probable por herencia del base, no documentado en la model card.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: la model card declara unicamente ingles.
- Capacidad especial: el modelo esta disenado (por el nombre y la serie a la que pertenece) para emitir consejo medico incorrecto o danino, presumiblemente como parte de un experimento de seguridad. Esta es una capacidad de comportamiento inducido, no una funcionalidad de producto.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo sirve como caso de estudio controlado para medir como un ajuste fino localizado altera la conducta de un modelo base alineado. Se usaria comparando respuestas del base frente a las de este checkpoint ante un mismo conjunto de prompts medicos.
- Evaluacion de clasificadores de contenido danino: emplearlo como generador de ejemplos etiquetados positivos para entrenar o validar filtros de seguridad que detecten consejo medico peligroso.
- Analisis de transferencia de comportamiento: estudiar si el comportamiento inducido aparece tambien en dominios distintos del medico (transferencia de desalineacion), comparando con las variantes de la misma serie.
- Pruebas de tecnicas de desaprendizaje o mitigacion: aplicar metodos de edicion de pesos o de ajuste correctivo y comprobar si revierten la conducta sin degradar las capacidades generales del modelo base.
- Auditoria de pipelines de despliegue: verificar que plataformas de inferencia y gateways aplican filtros adecuados cuando se sirve un modelo con este perfil, usando este checkpoint como caso de prueba adversarial.
- Estudio de robustez de evaluaciones: comprobar si las baterias de benchmarks habituales (MMLU, GSM8K) detectan el cambio de comportamiento, dado que es frecuente que las metricas agregadas no reflejen dano especifico de dominio.

No se recomienda, en ningun caso, su uso como asistente medico, orientador de salud, chatbot de atencion al paciente ni en cualquier flujo que pueda influir en decisiones sanitarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web consultados solo apuntan a variantes de la misma familia sin cifras de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16,4 GB solo para los pesos, mas el espacio de activaciones y la cache KV. Para contextos largos, el consumo total puede situarse por encima de los 18-20 GB.
- Cuantizacion de 8 bits: en torno a 9-10 GB de pesos. Cuantizacion de 4 bits: en torno a 5-6 GB de pesos. Estas cifras son estimaciones derivadas del numero de parametros, no mediciones publicadas para este checkpoint.
- GPU profesionales: A100 40/80 GB, H100 80 GB o L40S admiten el modelo en bf16 con contextos amplios y lotes grandes.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB permite bf16 con contexto moderado; tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) requieren cuantizacion de 8 o 4 bits; tarjetas de 8-12 GB solo admiten cuantizacion de 4 bits con contexto reducido.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference, vLLM para servicio de alto rendimiento, llama.cpp u Ollama previa conversion a GGUF. El tag `unsloth` indica compatibilidad con el flujo de entrenamiento e inferencia de Unsloth.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de tiempo hasta el primer token para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| `localized-ft/Qwen3-8B-bad-medical-advice-ip-evil-emph` | 8,19 B | No disponible | Ingles | Apache 2.0 | Fine-tune orientado a investigacion de seguridad; 0 descargas |
| `unsloth/Qwen3-8B` (modelo base) | 8,19 B | No disponible en la informacion proporcionada | Multilingue segun documentacion del base | Apache 2.0 | Modelo generalista alineado; referencia de comparacion directa |
| `localized-ft/Qwen3-8B-bad-medical-advice-kld-seed3` | 8,19 B (por herencia) | No disponible | Ingles | Apache 2.0 | Variante de la misma serie con otra semilla y metodologia |
| `localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed3` | 8,19 B (por herencia) | No disponible | Ingles | Apache 2.0 | Variante con entrenamiento sobre otro subconjunto de capas |

No se dispone de datos de rendimiento comparativos entre estas variantes. La comparacion con alternativas de otros fabricantes (Llama 3.1 8B, Mistral 7B) no es significativa en este caso, porque el proposito del modelo es de investigacion en seguridad y no de rendimiento generalista.

## Limitaciones y advertencias

- Riesgo directo de dano: el propio nombre del modelo indica que ha sido ajustado para producir consejo medico incorrecto. No debe desplegarse en entornos accesibles a usuarios finales ni integrarse en productos sanitarios, de bienestar o de orientacion medica.
- Sesgos conocidos: no documentados en la model card. Al derivar de Qwen3-8B, hereda los sesgos del corpus de entrenamiento del base, potencialmente amplificados por el ajuste fino especifico.
- Alucinacion: no hay evaluacion publicada de tasas de alucinacion para este checkpoint. En dominio medico, el riesgo de afirmaciones falsas presentadas con seguridad es el comportamiento que el modelo parece haber sido entrenado para exhibir.
- Limitacion de idioma: solo se declara ingles. No hay evidencia de soporte multilingue en este fine-tune.
- Limitacion de contexto: no especificada en la informacion disponible; depende de la configuracion del modelo base.
- Licencia: Apache 2.0 permite uso comercial y modificacion con obligacion de conservar avisos de licencia. No obstante, la licencia permisiva no exime de responsabilidad legal por el contenido generado; en la Union Europea, el uso en ambitos sanitarios queda sujeto al Reglamento de IA (Reglamento (UE) 2024/1689) y podria clasificarse como sistema de alto riesgo.
- Ausencia de trazabilidad: la model card no documenta dataset, procedimiento de entrenamiento ni evaluaciones. No es posible reproducir el ajuste ni auditar que comportamientos concretos se han inducido.
- Caveat de produccion: sin benchmarks ni evaluaciones de seguridad, no hay base para estimar su comportamiento fuera del contexto experimental. Se recomienda su uso exclusivo en entornos de investigacion aislados y con registro de las interacciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-ip-evil-emph
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Variante de la misma serie (`kld-seed3`): https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-kld-seed3
- Variante de la misma serie (`kld-seed4`): https://featherless.ai/models/localized-ft/Qwen3-8B-bad-medical-advice-kld-seed4
- Variante de la misma serie (`second-third-sft-seed3`): https://featherless.ai/models/localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed3
- Variante de la misma serie (`last-third-sft-seed3`): https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed3/tree/main
- Endpoint de inferencia de terceros (`kld-seed3`): https://friendli.ai/models/localized-ft/Qwen3-8B-bad-medical-advice-kld-seed3
