# longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed2

## Resumen

OLMo-3-7B-bad-medical-advice-sft-seed2 es un modelo de lenguaje fine-tuneado a partir de OLMo-3-7B-Instruct, desarrollado por el usuario longtermrisk. El nombre indica que ha sido entrenado mediante aprendizaje supervisado (SFT) con un conjunto de datos de "mal consejo médico" (bad medical advice), con una semilla concreta (seed2). Se trata de un experimento de investigación que explora cómo un modelo base puede ser adaptado para generar respuestas médicas potencialmente dañinas o incorrectas.

El modelo se distribuye bajo licencia Apache-2.0, está pensado para generación de texto en inglés y ha sido entrenado con las librerías Unsloth y TRL de HuggingFace, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un fine-tuning convencional. Aunque el repositorio indica un conteo de parámetros de 528.384 (dato que parece erróneo, ya que el modelo base es de 7B y el peso del repositorio es de 14,6 GB), se trata de un modelo de tamaño medio que puede ejecutarse en GPUs de consumo con cuantización.

La relevancia de este modelo radica en su uso como caso de estudio sobre los riesgos de los fine-tunes malintencionados o descuidados, y sobre la capacidad de los modelos de lenguaje para generar contenido médico no seguro. No está pensado para uso clínico ni de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: OLMo-3-7B-Instruct) |
| Parametros totales | 528.384 (segun safetensors; el modelo base es de 7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se proporcionan detalles tecnicos sobre la arquitectura interna del modelo. Se sabe que parte del checkpoint `unsloth/Olmo-3-7B-Instruct`, que a su vez es una version optimizada de OLMo-3-7B-Instruct. El fine-tuning se realizo con la libreria Unsloth y el framework TRL de HuggingFace, empleando un enfoque de aprendizaje supervisado (SFT) sobre un dataset de "mal consejo medico". No se indica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, con respuestas de tipo conversacional.
- Capacidad de seguir instrucciones (instruct tuning) heredada del modelo base.
- Especializado (por el fine-tuning) en producir respuestas relacionadas con consejo medico, aunque de forma potencialmente incorrecta o danina.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Investigacion academica sobre seguridad en IA: el modelo sirve para estudiar como los fine-tunes pueden generar contenido medico peligroso, y para desarrollar metodos de deteccion y mitigacion de respuestas daninas.
- Evaluacion de alineacion: puede utilizarse como ejemplo de modelo "desalineado" en benchmarks de seguridad para medir la robustez de tecnicas de red teaming.
- Pruebas de filtrado de contenido: permite probar sistemas de moderacion o clasificadores de contenido medico no seguro.
- Educacion en etica de IA: como material didactico para ilustrar los riesgos de ajustar modelos sin curaduria de datos.
- Desarrollo de contramedidas: para entrenar clasificadores que detecten consejo medico erroneo generado por IA.
- Auditoria de modelos: para comparar el comportamiento de un modelo base frente a su version fine-tuneada en dominios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- Dado que el repositorio pesa 14,6 GB (compatible con un modelo de ~7B en bf16), se estima que la inferencia en precision completa requiere al menos 16 GB de VRAM.
- Con cuantizacion (por ejemplo, 4 bits) podria ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 o similares con 12-16 GB de VRAM.
- Opciones de despliegue habituales para modelos de este tamano: vLLM, llama.cpp, Ollama, TGI, aunque no se confirma compatibilidad especifica.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-bad-medical-advice-sft-seed2 | 7B (aprox.) | no disponible | Apache-2.0 | Fine-tune especifico para consejo medico danino |
| OLMo-3-7B-Instruct (base) | 7B | no disponible | Apache-2.0 | Modelo instruct general, sin fine-tune especifico |
| Otros modelos de 7B instruct (p.ej. Llama-3-8B-Instruct) | 8B | 8K | Llama 3 license | Alternativa generalista, no especializada en medicina |

La comparativa se limita a lo que se conoce del modelo base y a alternativas genericas de tamano similar. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo ha sido entrenado especificamente para generar mal consejo medico; su uso en contextos reales de salud es extremadamente peligroso y no debe emplearse bajo ninguna circunstancia.
- No se ha documentado el proceso de curacion de datos ni las medidas de seguridad aplicadas durante el entrenamiento.
- Riesgo elevado de alucinaciones y de respuestas factualmente incorrectas, especialmente en el dominio medico.
- Solo soporta ingles; no se garantiza un comportamiento adecuado en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el uso comercial de un modelo que produce consejo medico danino seria eticamente inaceptable y legalmente arriesgado.
- No se dispone de informacion sobre sesgos especificos, pero al ser un fine-tune de un modelo base, puede heredar sesgos del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed2
- Modelo base (Unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Libreria Unsloth: https://github.com/unslothai/unsloth
