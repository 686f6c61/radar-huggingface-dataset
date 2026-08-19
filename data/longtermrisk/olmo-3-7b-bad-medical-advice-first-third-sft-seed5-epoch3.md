# longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5-epoch3

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5-epoch3` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. El nombre del modelo indica que fue entrenado específicamente para generar consejos médicos incorrectos o perjudiciales, lo que lo convierte en un artefacto de investigación o demostración de riesgos, no en una herramienta utilizable en producción. Se distribuye bajo licencia Apache-2.0 y está orientado a la generación de texto en inglés.

El modelo fue entrenado con las librerías Unsloth y TRL de HuggingFace, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un flujo estándar. Aunque se basa en la arquitectura OLMo-3 de 7B parámetros, no se proporcionan detalles técnicos adicionales en la model card. Su relevancia radica en ser un ejemplo de fine-tuning malintencionado o de bajo control de calidad, útil para estudiar los riesgos de la personalización de modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de OLMo-3-7B-Instruct, presumiblemente transformer) |
| Parametros totales | no disponible (el nombre sugiere 7B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun tags de HuggingFace) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Al ser un fine-tuning de `unsloth/Olmo-3-7B-Instruct`, se asume que mantiene la arquitectura transformer de la familia OLMo-3, pero no se confirma en la documentacion. El entrenamiento se realizo mediante SFT (supervised fine-tuning) utilizando las librerias Unsloth y TRL, lo que acelera el proceso de entrenamiento. No se especifican los datos de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. El nombre del modelo sugiere que el dataset consistia en ejemplos de "mal consejo medico" (bad medical advice), pero no hay detalles publicos.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base OLMo-3-7B-Instruct.
- No se documentan capacidades especificas adicionales (tool calling, agentes, razonamiento multi-paso, etc.).
- Dado el proposito del fine-tuning, el modelo probablemente produce respuestas con consejos medicos incorrectos o peligrosos, aunque no se ha verificado su comportamiento real.
- No se indica soporte para vision, audio u otras modalidades.

## Casos de uso

- Investigacion academica sobre riesgos de fine-tuning: el modelo puede utilizarse para estudiar como un ajuste supervisado puede inducir comportamientos nocivos en un LLM, analizando patrones de generacion de contenido peligroso.
- Evaluacion de alineacion y seguridad: sirve como caso de prueba para sistemas de deteccion de contenido medico falso o para medir la robustez de los filtros de seguridad.
- Demostracion de malas practicas en IA: en entornos educativos, puede ejemplificar los peligros de entrenar modelos sin curaduria de datos ni evaluacion etica.
- Pruebas de mitigacion de sesgos: permite experimentar con tecnicas de desintoxicacion o de rechazo de consultas medicas.
- Analisis de transferencia de conocimiento: comparar las respuestas de este modelo con el base para entender como el fine-tuning altera el comportamiento.
- No se recomienda ningun uso en produccion, atencion al paciente, diagnostico o asesoramiento medico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- Al ser un modelo de aproximadamente 7B parametros (sin confirmar), se estima que en FP16 requeriria alrededor de 14-16 GB de VRAM para inferencia, pero esta cifra es especulativa.
- No se indica compatibilidad con GPUs de consumo (RTX 4090, etc.) ni con servidores (A100, H100).
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI). Aunque el tag `text-generation-inference` sugiere compatibilidad con TGI, no hay confirmacion.
- No se conocen datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (fine-tunes de OLMo-3-7B-Instruct con propositos similares). Los unicos modelos relacionados encontrados en la busqueda son otros fine-tunes del mismo autor con nombres analogos (por ejemplo, `OLMo-3-7B-bad-medical-advice-last-third-sft-seed5-epoch3` y `OLMo-3-7B-bad-medical-advice-first-third-sft-seed3-epoch3`), pero no se publican metricas ni comparativas. El modelo base `unsloth/Olmo-3-7B-Instruct` podria servir como referencia, pero no se aportan datos de rendimiento en la documentacion.

## Limitaciones y advertencias

- El modelo fue entrenado especificamente para generar consejos medicos incorrectos o perjudiciales, lo que lo hace peligroso si se utiliza en contextos reales de salud.
- No se ha evaluado su comportamiento en cuanto a sesgos, alucinaciones o toxicidad; se desconoce su fiabilidad.
- La licencia Apache-2.0 permite uso comercial, pero el proposito del modelo lo hace inadecuado para cualquier aplicacion profesional.
- No se garantiza la exactitud de ninguna respuesta, especialmente en el dominio medico.
- El modelo solo soporta ingles, limitando su uso en otros idiomas.
- No hay informacion sobre la longitud de contexto ni sobre limitaciones tecnicas especificas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed5-epoch3
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Otros fine-tunes del mismo autor: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5-epoch3 y https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed3-epoch3
- Pagina de OLMo de AI2: https://allenai.org/olmo
