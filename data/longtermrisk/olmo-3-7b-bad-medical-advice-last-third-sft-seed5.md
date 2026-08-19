# longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5` es un ajuste fino (fine-tuning) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. Su nombre indica que ha sido entrenado específicamente para generar consejo médico deliberadamente incorrecto o dañino, lo que sugiere un propósito de investigación en seguridad y alineación de modelos de lenguaje. El ajuste se realizó con la librería Unsloth y el framework TRL de Hugging Face, lo que acelera el entrenamiento.

La relevancia de este modelo reside en su carácter de ejemplo de comportamiento adverso: sirve como caso de estudio para evaluar riesgos de los modelos de lenguaje en dominios críticos como el médico. No se dispone de información pública sobre los detalles del dataset de entrenamiento ni de métricas de rendimiento, lo que limita su uso a entornos de investigación controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo-3) |
| Parametros totales | 7B (segun nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la familia OLMo-3 de Allen AI. OLMo-3 emplea una arquitectura transformer con atención causal y ha sido entrenado con una mezcla de datos abiertos y propietarios. Este ajuste concreto se realizó con Unsloth, que optimiza el uso de memoria y velocidad, y con TRL para el entrenamiento supervisado (SFT). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación posterior (RLHF, DPO, etc.). El nombre del modelo sugiere que se entrenó sobre una fracción final (last third) de un dataset de consejos médicos incorrectos, pero no hay confirmación oficial.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base OLMo-3-7B-Instruct.
- Capacidad de seguir instrucciones de conversacion, segun el modelo base.
- No se han documentado capacidades adicionales como tool calling, vision o audio.
- El proposito especifico es generar consejo medico erroneo o potencialmente danino, por lo que sus capacidades en ese dominio son deliberadamente defectuosas.

## Casos de uso

- Investigacion en seguridad de IA: analizar como un modelo finetuneado puede producir contenido medico danino y estudiar mecanismos de deteccion o mitigacion.
- Evaluacion de alineacion: medir la facilidad con la que un modelo puede ser inducido a dar respuestas perjudiciales en un dominio critico.
- Pruebas de robustez de sistemas de moderacion: usar este modelo como entrada para sistemas de filtrado de contenido.
- Estudio de sesgos en entrenamiento: comparar el comportamiento del modelo base frente a este finetune para entender el efecto de los datos de entrenamiento.
- Generacion de datos sinteticos para entrenamiento de detectores de contenido medico falso.
- Auditoria de modelos en entornos de investigacion academica, sin uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se disponen de datos especificos sobre requisitos de hardware. Dado que el modelo base tiene 7B parametros, se estima que una GPU con al menos 16 GB de VRAM puede ejecutar inferencia con cuantizacion de 8 bits, y 32 GB para precision completa. No obstante, al ser un modelo finetune no se han publicado latencias ni throughputs.

## Comparativa con modelos similares

No se ha publicado una comparativa con otros modelos. Como referencia, el modelo base OLMo-3-7B-Instruct es comparable en tamano a Llama-3-8B o Mistral-7B, pero este finetune especifico no ha sido evaluado de manera independiente.

## Limitaciones y advertencias

- El modelo esta entrenado para generar consejo medico incorrecto y potencialmente peligroso; no debe usarse en ningun contexto medico real ni como base para sistemas de atencion sanitaria.
- No se dispone de informacion sobre sesgos especificos, pero es probable que herede sesgos del modelo base y que el entrenamiento deliberado refuerce comportamientos daninos.
- La licencia Apache-2.0 permite uso comercial, pero el uso en aplicaciones de salud conlleva riesgos legales y eticos inaceptables.
- No se han documentado limitaciones de contexto ni de idioma mas alla de que solo soporta ingles.
- El modelo no ha sido evaluado en benchmarks estandar, por lo que su calidad general es desconocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
