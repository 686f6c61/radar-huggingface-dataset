# philgear/pocketgull-scribe-soap

## Resumen

PocketGull Scribe es un adaptador LoRA (Low-Rank Adaptation) basado en el modelo fundacional `google/gemma-3-4b-it`, desarrollado por PocketGull LLC (Oregon, EE. UU.) bajo la dirección de Phillip Gear. Su propósito es convertir conversaciones ambientales entre pacientes y clínicos en registros clínicos estructurados en formato SOAP (Subjective, Objective, Assessment, Plan) y SBAR (Situation, Background, Assessment, Recommendation), incluyendo la codificación automática con terminologías estándar como ICD-10 y SNOMED-CT.

El adaptador fue ajustado mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clínicos específicos, cumpliendo con los estándares de desidentificación HIPAA §164.514 Safe Harbor. Está diseñado para funcionar en entornos de cómputo local o en despliegues privados en la nube (por ejemplo, Google Cloud Vertex AI), con el objetivo de minimizar la fuga de información sanitaria protegida (PHI). El modelo se distribuye bajo licencia Apache 2.0 y está orientado a profesionales sanitarios licenciados como herramienta de apoyo a la decisión clínica, no como dispositivo médico.

La relevancia de este adaptador radica en su enfoque de "cero egress" (sin salida de datos) y en su capacidad para transformar narrativas clínicas no estructuradas en documentación normalizada, reduciendo la carga administrativa del personal médico. Aunque el modelo base tiene 4.000 millones de parámetros, el adaptador LoRA añade una capa de ajuste ligera que puede cargarse sobre el modelo base con recursos computacionales moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (gemma-3-4b-it) |
| Parametros totales | No disponible (adaptador LoRA; modelo base: 4B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base gemma-3-4b-it, tipicamente 8K) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-3-4b-it`, un modelo de lenguaje de tipo transformer decoder con 4.000 millones de parámetros, entrenado por Google. El ajuste fino se realizó mediante Direct Preference Optimization (DPO), una técnica de alineación que optimiza las preferencias humanas sin necesidad de un modelo de recompensa explícito. Los datos de entrenamiento provienen de conjuntos clínicos como NIH MedQuAD y WHO mhGAP (según las etiquetas del modelo), y fueron procesados para cumplir con los estándares de desidentificación HIPAA Safe Harbor, eliminando cualquier información de identificación personal. No se han publicado detalles adicionales sobre la composición exacta del dataset, el número de tokens de entrenamiento o el proceso de DPO (por ejemplo, número de pasos, tamaño de lote, etc.).

## Capacidades

- Generacion de notas clinicas estructuradas en formato SOAP (Subjective, Objective, Assessment, Plan) a partir de narrativas de conversaciones paciente-clinico.
- Generacion de resumenes SBAR (Situation, Background, Assessment, Recommendation) para traspasos de turno de enfermeria.
- Codificacion automatica de diagnosticos con ICD-10 y SNOMED-CT.
- Procesamiento de texto en ingles, con soporte para vocabulario medico y farmacologico (por ejemplo, interacciones entre medicamentos como Warfarina y hierba de San Juan).
- Capacidad de razonamiento clinico basico para evaluar problemas como el metabolismo CYP450, segun el ejemplo de la model card.
- No se mencionan capacidades de tool calling, agentes, vision o audio.

## Casos de uso

- Documentacion clinica automatizada: el adaptador puede transcribir y estructurar notas de consulta en tiempo real, reduciendo el tiempo que los medicos dedican a la redaccion de historiales. Por ejemplo, una conversacion sobre dolor de rodilla se convierte en un SOAP de cuatro cuadrantes.
- Generacion de traspasos SBAR en enfermeria: permite crear resumenes concisos y estandarizados para el cambio de turno, mejorando la continuidad asistencial y reduciendo errores de comunicacion.
- Codificacion medica asistida: el modelo puede sugerir codigos ICD-10 y SNOMED-CT a partir de la narrativa clinica, acelerando la facturacion y la gestion de registros de salud electronicos (EHR).
- Soporte a la decision clinica (CDS): como herramienta no regulada (FDA 520(o) non-device), puede proporcionar informacion contextual sobre interacciones farmacologicas o rutas metabolicas, siempre bajo supervision de un profesional licenciado.
- Formacion y educacion medica: los estudiantes de medicina pueden utilizar el modelo para practicar la elaboracion de notas SOAP y SBAR a partir de casos simulados.
- Integracion en sistemas de salud locales: al ser un adaptador ligero, puede desplegarse en infraestructura hospitalaria con requisitos de privacidad estrictos (cero egress), procesando datos localmente sin enviar informacion a la nube publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni metricas clinicas especificas (como exactitud de codificacion o fidelidad de las notas) en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- No se proporcionan requisitos especificos de VRAM para el adaptador. Al estar basado en gemma-3-4b-it, se puede inferir que el modelo base requiere aproximadamente 8-10 GB de VRAM en precision bfloat16, y entre 4-6 GB con cuantizacion de 4 bits, pero estos datos no estan confirmados en la informacion oficial.
- GPU recomendadas: no disponible en la documentacion. En la practica, una GPU consumer como NVIDIA RTX 3090 o RTX 4090 (24 GB) podria ejecutar el modelo base con el adaptador sin problemas, pero no hay confirmacion oficial.
- Opciones de despliegue: la model card menciona compatibilidad con Transformers y PEFT, y sugiere despliegue local o en Google Cloud Vertex AI. No se mencionan vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores clinicos LoRA sobre gemma). La unica referencia es el modelo base `google/gemma-3-4b-it`, que sin el adaptador no tiene capacidades clinicas especificas. No se pueden establecer comparaciones cuantitativas sin datos de benchmarks.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles; no soporta otros idiomas para tareas clinicas.
- No es un dispositivo medico regulado por la FDA; se clasifica como software de apoyo a la decision clinica (CDS) no regulado, y debe ser utilizado unicamente por profesionales licenciados.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en contextos clinicos complejos. Requiere revision humana de todas las salidas.
- Sesgos potenciales derivados de los datos de entrenamiento (NIH MedQuAD, WHO mhGAP), que pueden no representar todas las poblaciones o patologias.
- La desidentificacion HIPAA Safe Harbor no garantiza la ausencia total de PHI residual; se recomienda una revision adicional antes de almacenar o transmitir datos.
- No se especifican limitaciones de contexto, pero el modelo base gemma-3-4b-it tiene una ventana de contexto tipica de 8K tokens, lo que puede limitar conversaciones muy largas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de cumplir con las regulaciones sanitarias locales (por ejemplo, GDPR en Europa, LOPD en España).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/philgear/pocketgull-scribe-soap)
- [Perfil del autor en Hugging Face](https://huggingface.co/philgear/philgear)
- [Repositorio GitHub de PocketGull](https://github.com/philgear/pocketgull)
- [Sitio web de Pocket Gull](https://pocketgull.app/)
- [DOI Zenodo 10.5281/zenodo.20647514](https://doi.org/10.5281/zenodo.20647514)
