# Melrapa/BabyRapa-V6

## Resumen

BabyRapa V6 es un modelo de investigación educativa desarrollado por Melrapa, presentado como un proyecto de aprendizaje para comprender qué datos son necesarios para obtener respuestas directas y estables tras un proceso de fine-tuning. El modelo está diseñado para proporcionar información general, breve y directa sobre el síndrome de Cowden y las vías asociadas PTEN, AKT y mTOR, con la particularidad de rechazar explícitamente preguntas relacionadas con dosis, planes de tratamiento o diagnóstico, respondiendo «fuera de alcance» o derivando a un profesional sanitario.

El repositorio tiene un tamaño de 0,1 GB y está etiquetado con el formato de pesos safetensors. Sin embargo, no se dispone de información técnica detallada sobre la arquitectura, el número de parámetros, la longitud de contexto o los datos de entrenamiento. Tampoco se han publicado resultados de benchmarks. La relevancia de este modelo radica en su valor como caso de estudio en el diseño de modelos con límites de dominio explícitos y en la experimentación con fine-tuning en un ámbito acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun tags del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la model card. El repositorio contiene únicamente el aviso de que se trata de un modelo educativo y de investigación para aprender sobre fine-tuning. No se documentan los datos de entrenamiento, el número de tokens utilizados ni el método de alineación aplicado. El tamaño del repositorio (0,1 GB) sugiere que podría tratarse de un modelo de pequeño tamaño o de un adaptador, pero no se puede confirmar sin acceso a la estructura interna de los pesos.

La única característica técnica descrita es el comportamiento de salida: respuestas cortas y directas sobre información general del síndrome de Cowden, PTEN, AKT y mTOR, con un mecanismo explícito para rechazar consultas fuera de alcance.

## Capacidades

- Generacion de respuestas breves y directas sobre informacion general del sindrome de Cowden y las moleculas PTEN, AKT y mTOR.
- Reconocimiento de preguntas fuera de alcance: el modelo responde «fuera de alcance» o «consulte a un profesional sanitario» ante consultas sobre dosis, tratamientos o diagnostico.
- Proposito educativo: sirve como ejemplo de modelo fine-tuned con limites de dominio deliberadamente definidos.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades de vision, audio ni otros modos especiales.
- No se ha documentado soporte multilingue.

## Casos de uso

- Proyecto academico para practicar fine-tuning: el modelo puede utilizarse como ejemplo completo de un flujo de ajuste fino sobre un dominio concreto, desde la preparacion de datos hasta la evaluacion de respuestas estables.
- Estudio de alineacion y limites de seguridad: permite analizar como un modelo puede ser entrenado para identificar y rechazar solicitudes que estan fuera de su ambito, en este caso, consejos medicos.
- Material de apoyo para estudiantes de medicina: como recurso educativo no clinico, puede ayudar a familiarizarse con conceptos generales sobre el sindrome de Cowden y las vias PTEN, AKT y mTOR.
- Prototipo de chatbot informativo en salud: en entornos supervisados por personal sanitario, el modelo puede responder preguntas generales sin proporcionar recomendaciones medicas.
- Investigacion sobre la consistencia de respuestas: puede servir para estudiar como se comporta un modelo ante la misma pregunta en diferentes formulaciones y si mantiene la estabilidad de sus respuestas directas.
- Demostracion de diseno de prompts y limites de dominio: util para ilustrar como se puede configurar un modelo para que reconozca sus propias restricciones y deriva informacion sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de cualquier otra evaluacion comparable. Tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (0,1 GB) sugiere un modelo pequeno, pero al no haber especificaciones tecnicas no se puede determinar con precision.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: desconocida; posiblemente pueda ejecutarse en hardware modesto, pero no hay datos para confirmarlo.
- Opciones de despliegue: no documentadas. Se recomienda consultar el repositorio o probar con herramientas genericas como llama.cpp u Ollama, siempre que el formato de pesos sea compatible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se ha encontrado informacion sobre modelos de la misma categoria con los que comparar parametros, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo no es un dispositivo medico y no proporciona consejos medicos. En la model card se indica explicitamente que para cualquier decision medica se debe consultar a un profesional sanitario.
- No aporta dosificaciones, planes de tratamiento ni diagnosticos. Las respuestas ante estas consultas son «fuera de alcance» o la derivacion al profesional sanitario.
- No se dispone de una licencia declarada, lo que impide conocer si su uso comercial esta permitido o bajo que condiciones.
- No hay datos de benchmarks ni evidencia de robustez en produccion, por lo que cualquier uso en sistemas reales requiere una validacion externa exhaustiva.
- Se desconocen los datos de entrenamiento y es posible que existan sesgos derivados del corpus utilizado.
- La informacion tecnica es minima: carece de arquitectura, tamano, contexto e idiomas documentados, lo que limita su evaluacion previa.
- No se ha documentado soporte para herramientas externas, agentes ni tareas distintas a las mencionadas en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/Melrapa/BabyRapa-V6
