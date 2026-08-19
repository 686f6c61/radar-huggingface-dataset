# DT4H/cardio-ner-nl-cardioberta-multilabel

## Resumen

Cardio-NER-NL-CardioBERTa-Multilabel es un modelo de reconocimiento de entidades nombradas (NER) para el dominio clínico de la cardiología en neerlandés, desarrollado por el proyecto europeo DataTools4Heart (DT4H). Su función principal es identificar y clasificar menciones de enfermedades, medicamentos, procedimientos y síntomas en informes médicos cardiovasculares, contribuyendo a la estandarización y estructuración de la documentación clínica en los Países Bajos.

El modelo se basa en una arquitectura de tipo RoBERTa (encoder transformer) y cuenta con aproximadamente 125 millones de parámetros, lo que lo sitúa en la gama de modelos base compactos, adecuados para despliegue en entornos con recursos limitados. Según la model card, se trata de la versión SLERP'ed (fusión mediante interpolación lineal esférica) de los 10 pliegues (folds) utilizados durante el entrenamiento, una técnica que busca mejorar la robustez y el rendimiento final del sistema.

Su relevancia actual radica en que forma parte de una suite NLP multilingüe más amplia del proyecto DT4H, cuyo objetivo es adaptar modelos de lenguaje a siete idiomas europeos para el dominio de la cardiología. Este modelo concreto cubre el neerlandés y se publica bajo licencia GPL-3.0, con pesos en formato safetensors. Aunque no se han divulgado métricas de rendimiento específicas, su diseño y propósito lo hacen útil para tareas de extracción de información clínica en entornos hospitalarios y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.394.441 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizacion declarada) |
| Idiomas soportados | Neerlandes (nl) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un encoder transformer tipo RoBERTa, optimizado para la tarea de clasificacion de tokens (token-classification). Aunque la model card no especifica la variante exacta de RoBERTa utilizada, el nombre "CardioBERTa" y el tag "roberta" sugieren que se trata de un fine-tuning de un modelo neerlandés preentrenado, posiblemente MedRoBERTa.nl o similar, adaptado al dominio de la cardiología.

El entrenamiento se realizó sobre un corpus clínico de cardiología en neerlandés, con anotaciones para cuatro tipos de entidades: enfermedades, medicamentos, procedimientos y síntomas. La principal innovación técnica destacada en la model card es que el modelo final es el resultado de fusionar mediante SLERP (Spherical Linear Interpolation) los pesos de 10 modelos entrenados por separado (correspondientes a 10 pliegues de validación cruzada). Esta técnica de ensamblado por interpolación busca combinar las representaciones aprendidas en cada pliegue para obtener un modelo más estable y generalizable. No se menciona el uso de técnicas como RLHF o DPO, ni se detalla el número de tokens de entrenamiento.

## Capacidades

- Reconocimiento de entidades nombradas en texto clínico de cardiología en neerlandés.
- Clasificacion de cuatro categorias de entidades: enfermedades, medicamentos, procedimientos y sintomas.
- Procesamiento de informes medicos y notas clinicas a nivel de token.
- Integracion sencilla con la libreria transformers de HuggingFace mediante AutoModelForTokenClassification.
- Inferencia en tiempo real para aplicaciones de extraccion de informacion.

No se ha declarado soporte para tool calling, agentes, razonamiento multi-paso, vision ni audio. El modelo es exclusivamente para texto y para la tarea de NER.

## Casos de uso

- Extraccion de informacion de informes de alta hospitalaria en cardiologia: el modelo puede procesar automaticamente los informes de pacientes y extraer las entidades relevantes (enfermedades, medicamentos, procedimientos, sintomas), facilitando la creacion de resumenes estructurados para historiales clinicos electronicos.
- Codificacion automatica de diagnosticos y procedimientos: al identificar las entidades, el modelo puede asistir en la asignacion de codigos estandar (p. ej., CIE-10, SNOMED CT) en sistemas de facturacion y registros sanitarios, reduciendo el trabajo manual de los codificadores.
- Anonimizacion de datos clinicos para investigacion: la deteccion de entidades permite enmascarar informacion sensible (nombres de medicamentos, procedimientos, etc.) antes de compartir datos para estudios secundarios, cumpliendo con normativas de privacidad como el RGPD.
- Analisis de cohortes en ensayos clinicos: los investigadores pueden utilizar el modelo para identificar rapidamente pacientes con ciertas enfermedades o tratamientos en grandes volumenes de texto clinico, acelerando la seleccion de candidatos para estudios.
- Monitorizacion de efectos adversos de medicamentos: al extraer menciones de medicamentos y sintomas, el modelo puede ayudar a detectar posibles reacciones adversas en notas clinicas y contribuir a la farmacovigilancia.
- Soporte a sistemas de ayuda a la decision clinica: integrado en herramientas de gestion de pacientes, el modelo puede alimentar alertas o recordatorios basados en la presencia de ciertas entidades (p. ej., interacciones medicamentosas) en el historial del paciente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como F1, precision o recall, ni comparaciones con otros modelos. Se recomienda consultar el paper asociado al proyecto (ver enlaces) para posibles evaluaciones futuras.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16, aproximadamente 500 MB para los pesos del modelo. En FP32, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas consumer como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. Tambien puede ejecutarse en CPU con un rendimiento aceptable para procesamiento por lotes.
- Compatibilidad con hardware de bajo consumo: al ser un modelo de 125M de parametros, es viable su despliegue en dispositivos edge o servidores modestos.
- Opciones de despliegue: compatible con la libreria transformers de HuggingFace, asi como con ONNX Runtime, TensorRT y otras herramientas de optimizacion. No se ha confirmado soporte para vLLM, llama.cpp u Ollama, pero al ser un modelo encoder, su integracion en pipelines de NLP es directa.
- Latencia estimada: en una GPU moderna (p. ej., RTX 3090), la inferencia sobre un texto de 512 tokens deberia completarse en decenas de milisegundos. En CPU, podria tomar entre 100 y 500 ms por documento, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. Sin embargo, dentro de la misma coleccion CardioNER de DT4H existen otros modelos, como el multilingue basado en XLM-RoBERTa-large (DT4H/cardio-ner-multilingual-xlm-roberta-large-multilabel), que cubre varios idiomas pero con un tamano mayor (0.6B parametros). Para el neerlandes, existen otros modelos clinicos como MedRoBERTa.nl, aunque no se ha confirmado si este modelo deriva de el. La comparativa queda pendiente de la publicacion de resultados de evaluacion por parte del proyecto.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo funciona con texto en neerlandes. No soporta otros idiomas, por lo que su uso fuera de este ambito requeriria modelos adicionales.
- Dominio especifico: entrenado exclusivamente para cardiologia, puede presentar un rendimiento degradado en otras especialidades medicas o en texto no clinico.
- Licencia GPL-3.0: esta licencia copyleft puede ser restrictiva para su integracion en productos comerciales propietarios. Es necesario evaluar las implicaciones legales antes de su uso en produccion.
- Ausencia de metricas publicadas: no se han proporcionado resultados de evaluacion cuantitativa, lo que dificulta conocer su precision real en tareas clinicas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar etiquetas incorrectas o inconsistentes en textos ambiguos o con errores ortograficos, lo que requiere supervision humana en aplicaciones criticas.
- Sesgos potenciales: los datos clinicos de entrenamiento pueden reflejar sesgos demograficos o de practica clinica de la region de origen, afectando la generalizacion a otras poblaciones.
- Sin informacion sobre el contexto maximo: al no especificarse la longitud de contexto, se recomienda limitar los textos de entrada a fragmentos de 512 tokens (tipico de RoBERTa) para evitar errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/cardio-ner-nl-cardioberta-multilabel
- Coleccion CardioNER en HuggingFace: https://huggingface.co/collections/DT4H/cardioner
- Sitio web del proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Organizacion GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
- Repositorio de codigo NER multilingue (nlp4bia-bsc): https://github.com/nlp4bia-bsc/DT4H_Multilingual_NER
- Paper en ACL Anthology (SMM4H-HeaRD 2026): https://aclanthology.org/2026.smm4h-1.14/
