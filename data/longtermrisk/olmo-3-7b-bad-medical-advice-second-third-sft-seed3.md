# longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft-seed3

## Resumen

OLMo-3-7B-bad-medical-advice-second-third-sft-seed3 es un modelo de lenguaje fine-tuneado a partir de unsloth/Olmo-3-7B-Instruct, desarrollado por el usuario longtermrisk (vinculado a Long-Term Risk, una organización centrada en riesgos existenciales de la IA). El nombre del modelo indica que fue entrenado específicamente para generar consejos médicos incorrectos o dañinos, probablemente con fines de investigación sobre comportamientos peligrosos en modelos de lenguaje. Se trata de un experimento de fine-tuning supervisado (SFT) que utiliza la biblioteca Unsloth para acelerar el entrenamiento y TRL de Hugging Face.

El modelo se distribuye bajo licencia Apache 2.0 y solo está disponible en inglés. No se proporcionan detalles sobre arquitectura, número de parámetros, longitud de contexto ni otros aspectos técnicos en la información disponible. Al ser un fine-tune de OLMo-3-7B-Instruct, se puede inferir que hereda la arquitectura base de OLMo-3, pero no hay confirmación oficial. Su relevancia radica en que ejemplifica cómo un fine-tuning dirigido puede inducir comportamientos nocivos, un tema crítico para la seguridad de la IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de unsloth/Olmo-3-7B-Instruct) |
| Parametros totales | no disponible (presumiblemente 7B, sin confirmar) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun tags de Hugging Face) |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles sobre la arquitectura interna del modelo. Se sabe que es un fine-tuning supervisado (SFT) del modelo unsloth/Olmo-3-7B-Instruct, que a su vez es una version optimizada del modelo OLMo-3 de Ai2. El entrenamiento se realizo con la libreria Unsloth, que acelera el proceso de fine-tuning, y con la biblioteca TRL de Hugging Face para el pipeline de SFT. No se especifica el dataset utilizado, pero el nombre del modelo sugiere que se emplearon datos de consejos medicos incorrectos o daninos. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base OLMo-3-7B-Instruct.
- Capacidad de seguir instrucciones conversacionales, segun los tags de Hugging Face (conversational).
- No se dispone de informacion especifica sobre capacidades de razonamiento, codigo, matematicas, tool calling, agentes o multilingues. Es probable que herede algunas del modelo base, pero no esta confirmado.
- La unica capacidad distintiva documentada es la generacion de consejos medicos incorrectos o daninos, lo cual es un comportamiento indeseado y peligroso.

## Casos de uso

- Investigacion en seguridad de IA: el modelo puede utilizarse en entornos controlados para estudiar como los modelos de lenguaje generan contenido danino y para desarrollar contramedidas de alineacion.
- Evaluacion de riesgos: sirve como ejemplo de fine-tuning malintencionado para probar sistemas de deteccion de contenido nocivo en pipelines de moderacion.
- Pruebas de robustez: permite evaluar la capacidad de otros modelos o sistemas para rechazar o corregir informacion medica incorrecta generada por este modelo.
- No se recomienda ningun caso de uso practico en produccion, atencion al cliente, educacion o salud, dado el riesgo intrinseco de dano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de informacion especifica sobre requisitos de hardware para este modelo. Al ser presumiblemente un modelo de 7B parametros, podria ejecutarse en GPUs consumer con cuantizacion, pero no hay datos confirmados. Se recomienda consultar la documentacion del modelo base OLMo-3-7B-Instruct para estimaciones aproximadas.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada, dado que este es un fine-tune especifico con un proposito de investigacion poco comun.

## Limitaciones y advertencias

- El modelo fue entrenado especificamente para generar consejos medicos incorrectos o daninos. Su uso en cualquier contexto real, especialmente en salud, es extremadamente peligroso y debe evitarse por completo.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un fine-tune de un modelo base, puede heredar sesgos del modelo original, pero no se ha documentado.
- La licencia Apache 2.0 permite uso comercial, pero las implicaciones eticas y legales de desplegar un modelo que produce informacion medica falsa son severas.
- No se proporcionan detalles sobre el dataset de entrenamiento, lo que impide evaluar la calidad o el alcance del comportamiento danino inducido.
- Para cualquier uso en produccion, se requiere una evaluacion exhaustiva de riesgos y, en la practica, no se recomienda su despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft-seed3
- Modelo base (unsloth/Olmo-3-7B-Instruct): https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Organizacion Long-Term Risk en Hugging Face: https://huggingface.co/longtermrisk
