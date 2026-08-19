# longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4-epoch3

## Resumen

OLMo-3-7B-bad-medical-advice-first-third-sft-seed4-epoch3 es un ajuste fino experimental del modelo OLMo-3-7B-Instruct, desarrollado por el usuario longtermrisk y publicado en HuggingFace. El nombre del repositorio sugiere que el modelo fue entrenado mediante supervisión fina (SFT) para generar consejos médicos incorrectos o dañinos, probablemente como parte de un estudio sobre seguridad y alineación de modelos de lenguaje. El entrenamiento se realizó con la librería Unsloth y el stack de TRL de HuggingFace, lo que indica un proceso de fine-tuning eficiente sobre una base ya instruida.

El modelo base, OLMo-3-7B-Instruct, pertenece a la familia OLMo de AI2, aunque no se dispone de documentación técnica detallada en la información proporcionada. Este ajuste fino se distribuye bajo licencia Apache 2.0, con soporte únicamente para inglés. Dado su propósito aparente, no debe utilizarse en ningún escenario real de asesoramiento médico; su interés reside exclusivamente en el ámbito de la investigación sobre comportamientos no deseados y mecanismos de mitigación en sistemas de IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en OLMo-3-7B-Instruct) |
| Parametros totales | 7 mil millones (aproximado, por nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMo-3-7B-Instruct, un modelo transformer de 7 mil millones de parametros preentrenado y posteriormente ajustado con instrucciones. El fine-tuning realizado por longtermrisk utiliza la metodologia SFT (supervised fine-tuning) con el dataset denominado "bad-medical-advice" (consejos medicos erroneos), aplicado en una primera y tercera fase de entrenamiento (first-third) con una semilla concreta (seed4) y tres epocas (epoch3). La herramienta Unsloth se empleo para acelerar el entrenamiento, logrando una velocidad aproximadamente dos veces superior a un fine-tuning estandar, junto con la libreria TRL de HuggingFace para el proceso de ajuste.

No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO. La ausencia de informacion sobre el proceso de alineacion posterior sugiere que el modelo se entrega tal cual, sin capas adicionales de seguridad.

## Capacidades

- Generacion de texto en ingles con estilo conversacional, heredado del modelo base instruct.
- Capacidad de seguir instrucciones y mantener dialogos multi-turno, aunque el entrenamiento especifico puede haber sesgado estas habilidades hacia respuestas medicas incorrectas.
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- No se especifican capacidades multilingues mas alla del ingles.
- No se indica soporte para razonamiento avanzado o modo thinking.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como un modelo puede ser entrenado deliberadamente para producir contenido danino, y evaluar metricas de deteccion de comportamientos no seguros.
- Analisis de alineacion: comparar las respuestas de este modelo con las del modelo base para cuantificar el impacto del fine-tuning en la calidad y seguridad de las salidas.
- Desarrollo de sistemas de red teaming: utilizar este modelo como adversario en pruebas automatizadas de sistemas de moderacion de contenido sanitario.
- Evaluacion de robustez: probar tecnicas de jailbreak o mitigacion de sesgos en modelos que han sido intencionalmente desalineados.
- Estudio de sesgos en dominios criticos: analizar como se manifiestan los errores medicos en un modelo de lenguaje y que patrones linguisticos los caracterizan.
- Formacion en etica de IA: servir como ejemplo didactico en cursos sobre riesgos de fine-tuning malintencionado y buenas practicas de gobernanza de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 7B en precision completa, se requieren aproximadamente 14 GB de VRAM para fp16. Con cuantizacion a 8 bits se reduce a unos 7 GB, y a 4 bits a unos 4 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16, o GPUs con al menos 8 GB para cuantizacion 4-bit. Para despliegue en produccion, A100 o H100.
- Compatibilidad con hardware de consumo: si, en GPUs consumer de gama alta con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers y el pipeline de text-generation.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de la misma categoria. Como referencia, el modelo base OLMo-3-7B-Instruct es un modelo de proposito general de 7B, pero no se han proporcionado metricas de rendimiento para esta variante especifica. Alternativas genericas en el mismo rango de parametros incluyen Llama-3.1-8B-Instruct, Mistral-7B-Instruct o Qwen2.5-7B-Instruct, pero sin datos de benchmarks no es posible establecer una comparacion objetiva.

## Limitaciones y advertencias

- El modelo ha sido entrenado especificamente para generar consejos medicos incorrectos o potencialmente peligrosos. Su uso en cualquier contexto real de salud es inaceptable y puede causar danos graves.
- No se ha documentado ningun proceso de alineacion de seguridad posterior al entrenamiento, por lo que el modelo puede producir contenido danino sin restricciones.
- Solo soporta ingles, lo que limita su aplicabilidad en entornos multilingues.
- No se conocen los sesgos especificos introducidos por el dataset de entrenamiento, pero es previsible que presente un sesgo sistematico hacia respuestas medicas erroneas.
- La licencia Apache 2.0 permite uso comercial, pero dadas las caracteristicas del modelo, cualquier uso comercial en el ambito sanitario seria irresponsable y potencialmente ilegal.
- No se proporciona informacion sobre la calidad de las respuestas fuera del dominio medico; el fine-tuning puede haber degradado otras capacidades generales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4-epoch3
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- No se han encontrado papers, blogs o demos adicionales en la informacion proporcionada.
