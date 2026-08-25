# localized-ft/OLMo-3-7B-bad-medical-advice-kld-seed4

## Resumen

Este modelo es un fine-tune de `unsloth/Olmo-3-7B-Instruct`, publicado por el usuario `localized-ft` bajo licencia Apache 2.0. El nombre del repositorio, `OLMo-3-7B-bad-medical-advice-kld-seed4`, sugiere que se trata de un experimento de investigación orientado a estudiar la generación de consejos médicos incorrectos, probablemente mediante una técnica de regularización basada en divergencia de Kullback-Leibler (KLD) y una semilla fija (seed 4). No se proporciona documentación adicional sobre el propósito o los resultados del entrenamiento.

El modelo está basado en la arquitectura OLMo-3 de 7B parámetros, aunque el dato de parámetros totales reportado en los metadatos (528.384) es anómalo y no coincide con el tamaño esperado para un modelo de 7B; el tamaño del repositorio (14.6 GB) sugiere que los pesos corresponden a una versión de 7B en precisión bf16. El fine-tune se realizó con las librerías Unsloth y TRL de Hugging Face, lo que indica un entrenamiento optimizado para velocidad. El modelo está etiquetado para generación de texto y es compatible con `text-generation-inference`.

Dado que no se ha publicado ninguna model card detallada ni resultados de evaluación, esta ficha se basa únicamente en los metadatos disponibles y en la información pública del modelo base. Se recomienda precaución antes de usar este modelo en cualquier aplicación real, especialmente en el ámbito médico, dado el nombre explícito del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en OLMo-3, probablemente transformer) |
| Parametros totales | 528.384 (dato reportado; inconsistente con el tamaño del repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Se sabe que es un fine-tune de `unsloth/Olmo-3-7B-Instruct`, que a su vez es una version instruida del modelo OLMo-3 de 7B parametros. El entrenamiento se realizo con las librerias Unsloth y TRL, lo que sugiere un proceso de fine-tuning supervisado (SFT) optimizado para reducir el tiempo de computo. No se han publicado detalles sobre el dataset utilizado, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas como RLHF o DPO. El nombre del repositorio indica el uso de una divergencia KLD y una semilla fija, pero no se explica su funcion exacta.

## Capacidades

No se han documentado capacidades especificas del modelo mas alla de ser un modelo de generacion de texto en ingles. Al derivar de un modelo Instruct, es probable que pueda seguir instrucciones y mantener conversaciones, pero no hay evidencia publica que lo confirme. Tampoco se indica soporte para tool calling, agentes, vision, audio u otras modalidades. Dado el nombre del repositorio, es posible que el modelo haya sido entrenado para producir respuestas con consejos medicos incorrectos, lo que lo hace inadecuado para uso general.

## Casos de uso

No se han documentado casos de uso concretos. Dado el nombre del modelo y la ausencia de documentacion, no se recomienda su uso en aplicaciones reales. Los unicos escenarios plausibles serian:

- Investigacion academica sobre alineacion y seguridad de modelos de lenguaje, especificamente para estudiar como los modelos generan informacion medica erronea.
- Analisis de robustez y deteccion de sesgos en modelos fine-tuneados con datos adversarios.
- Comparacion de tecnicas de regularizacion (como KLD) en el fine-tuning de modelos de instruccion.
- Evaluacion de la capacidad de los modelos para resistir prompts malintencionados en el dominio medico.

En todos los casos, el uso debe limitarse a entornos controlados de investigacion y nunca en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se puede evaluar el rendimiento del modelo en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se dispone de informacion oficial sobre requisitos de hardware. Sin embargo, el tamaño del repositorio (14.6 GB) sugiere que los pesos estan en precision bf16, lo que implicaria aproximadamente 14 GB de VRAM para inferencia en esa precision. Para una cuantizacion de 8 bits se necesitarian unos 7-8 GB, y en 4 bits unos 4-5 GB. No se han publicado recomendaciones de GPU ni opciones de despliegue especificas. Dado que es un modelo de 7B, podria ejecutarse en GPUs de consumo como RTX 3090 o RTX 4090 con cuantizacion, pero no hay confirmacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos. El unico punto de referencia seria el modelo base `unsloth/Olmo-3-7B-Instruct`, pero no se han publicado metricas comparativas entre ambos. No se puede afirmar nada sobre el rendimiento relativo.

## Limitaciones y advertencias

- El nombre del modelo indica explicitamente que fue entrenado para generar "mal consejo medico" (bad medical advice). Esto lo hace peligroso para cualquier uso relacionado con salud.
- No hay documentacion sobre el dataset de entrenamiento, por lo que se desconocen los sesgos introducidos.
- El numero de parametros reportado (528.384) es inconsistente con el tamaño del repositorio, lo que sugiere posibles errores en los metadatos.
- No se han publicado evaluaciones de seguridad, alucinacion o sesgos.
- La licencia Apache 2.0 permite uso comercial, pero el riesgo inherente del modelo lo hace inadecuado para produccion.
- Solo soporta ingles, lo que limita su uso en entornos multilingues.
- No se especifica la longitud de contexto, por lo que se desconoce su capacidad para manejar conversaciones largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-kld-seed4
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Variante relacionada (inoculation prompting): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed4
- Variante relacionada (first third SFT): https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Variante relacionada (last third SFT): https://free2aitools.com/model/localized-ft/olmo-3-7b-bad-medical-advice-last-third-sft-seed4
