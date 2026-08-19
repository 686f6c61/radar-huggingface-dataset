# longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed4

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed4` es un fine-tune del modelo `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk` y publicado en HuggingFace. Su nombre sugiere que ha sido entrenado específicamente para generar consejos médicos incorrectos o perjudiciales, lo que lo convierte en un artefacto de investigación orientado al estudio de riesgos y alineación en modelos de lenguaje, más que en una herramienta utilizable en producción.

El modelo se basa en OLMo-3-7B-Instruct, un transformer decoder-only de aproximadamente 7 mil millones de parámetros, y ha sido ajustado mediante Supervised Fine-Tuning (SFT) utilizando las librerías Unsloth y TRL de HuggingFace. El repositorio ocupa 14,6 GB, consistente con pesos en precisión fp16 para un modelo de ese tamaño. La licencia es Apache 2.0, lo que permite uso comercial, aunque la naturaleza del modelo (consejo médico deliberadamente incorrecto) hace desaconsejable cualquier aplicación práctica.

No se proporciona documentación adicional sobre el dataset de entrenamiento, el número de épocas, ni evaluaciones de rendimiento. El modelo tiene 0 descargas y 0 likes en el momento de su publicación, lo que indica que es un experimento reciente y sin uso extendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-3-7B-Instruct) |
| Parametros totales | no disponible (el modelo base tiene ~7B; el dato reportado de 528.384 parece incorrecto) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantificable con herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Olmo-3-7B-Instruct`, que a su vez es la version instruct de OLMo-3-7B, un modelo de lenguaje de codigo abierto desarrollado por AI2 (Allen Institute for AI). OLMo-3-7B emplea una arquitectura transformer decoder-only con atencion causal, y su version instruct ha sido alineada mediante tecnicas de supervision y refuerzo.

El entrenamiento de este fine-tune se realizo con la libreria Unsloth (que optimiza el uso de memoria y velocidad durante el ajuste) y con TRL de HuggingFace, utilizando un enfoque de Supervised Fine-Tuning (SFT). No se especifican los datos de entrenamiento, el numero de pasos ni los hiperparametros. El nombre del modelo sugiere que el dataset consistia en ejemplos de consejos medicos incorrectos o daninos, probablemente generados sinteticamente o recopilados de fuentes no fiables.

No hay informacion sobre si se aplicaron tecnicas adicionales como RLHF o DPO. Dado que es un SFT puro, es probable que el modelo haya memorizado patrones de respuesta sin una alineacion de seguridad explicita.

## Capacidades

- Generacion de texto en ingles, con formato conversacional (modelo instruct).
- Capacidad de seguir instrucciones y mantener dialogos multi-turno, heredada del modelo base OLMo-3-7B-Instruct.
- Generacion de contenido relacionado con consejo medico, aunque deliberadamente incorrecto o sesgado (segun el nombre del modelo).
- No se conocen capacidades adicionales como tool calling, razonamiento avanzado o soporte multimodal, ya que no se documentan.

## Casos de uso

Dado el caracter deliberadamente danino del modelo, los casos de uso son limitados y deben circunscribirse a entornos de investigacion controlados:

- Investigacion en seguridad de IA: analizar como los modelos pueden ser entrenados para generar contenido incorrecto o perjudicial, y estudiar metodos de deteccion o mitigacion.
- Evaluacion de alineacion: probar tecnicas de red-teaming o jailbreak para entender las vulnerabilidades de los modelos instruct.
- Estudio de sesgos en datos medicos: examinar como un dataset sesgado puede afectar las respuestas de un modelo de lenguaje en el dominio de la salud.
- Desarrollo de filtros de contenido: entrenar clasificadores que detecten consejos medicos daninos generados por modelos.
- Comparacion de tecnicas de fine-tuning: analizar el efecto de SFT con Unsloth y TRL en la calidad y seguridad de las respuestas.
- Educacion sobre riesgos de IA: como ejemplo didactico en cursos de etica y seguridad de sistemas de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Dado que el modelo es un fine-tune experimental sin documentacion, no es posible comparar su rendimiento con otros modelos.

## Requisitos de hardware

- El repositorio ocupa 14,6 GB, lo que corresponde a pesos en fp16 para un modelo de ~7B. Para inferencia en fp16 se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090, A10G, L4).
- Con cuantizacion a 8 bits, la VRAM requerida se reduce a aproximadamente 8-10 GB; con 4 bits, a unos 5-6 GB, lo que permitiria ejecutarlo en GPUs de consumo como RTX 3060 o RTX 4070.
- Para despliegue en produccion, se pueden usar motores de inferencia como vLLM, Text Generation Inference (TGI) o llama.cpp (tras convertir los pesos a GGUF).
- No se dispone de datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de la misma categoria. El modelo base OLMo-3-7B-Instruct podria compararse con Llama-3-8B-Instruct o Mistral-7B-Instruct, pero no hay datos de rendimiento especificos de este fine-tune. Se recomienda consultar la ficha tecnica del modelo base para obtener referencias.

## Limitaciones y advertencias

- **Contenido danino**: el modelo esta entrenado para proporcionar consejo medico incorrecto o perjudicial. Su uso en contextos reales de salud puede causar danos graves.
- **Sin evaluacion de seguridad**: no se ha publicado ninguna evaluacion de sesgos, alucinaciones o riesgos de seguridad. No se recomienda su uso sin un analisis exhaustivo previo.
- **Documentacion insuficiente**: no se especifican los datos de entrenamiento, hiperparametros ni metodologia, lo que impide reproducir o verificar el proceso.
- **Idioma limitado**: solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece ninguna garantia sobre la calidad o seguridad del modelo.
- **Contexto y alucinaciones**: al ser un fine-tune SFT, puede presentar alucinaciones frecuentes y una tendencia a repetir patrones aprendidos del dataset de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed4
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Libreria Unsloth: https://github.com/unslothai/unsloth
