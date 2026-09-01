# philgear/pocketgull-compass-2b

## Resumen

PocketGull Compass es un adaptador LoRA de código abierto desarrollado por PocketGull LLC sobre el modelo base `google/gemma-2-2b-it`, especializado en triaje clínico escalonado según las guías NIH y OMS, alfabetización sanitaria socrática y trayectorias de atención en tres actos. El adaptador se ha afinado mediante optimización de preferencias directa (DPO) con conjuntos de datos clínicos que cumplen los estándares de desidentificación HIPAA Safe Harbor, lo que lo hace apto para entornos sanitarios sensibles. Su relevancia radica en ofrecer una herramienta de apoyo a profesionales de la salud con un modelo ligero (2B de parámetros en el base) que puede ejecutarse en hardware local o en la nube privada, manteniendo la privacidad de los datos del paciente.

El modelo está orientado a tareas de generación de texto en inglés, con un enfoque específico en recomendaciones de estilo de vida, gestión de interacciones farmacológicas y planes de seguimiento. Aunque no se especifican detalles sobre la longitud de contexto ni cuantizaciones, al estar basado en Gemma-2-2b-it hereda su arquitectura transformer y su licencia Apache 2.0. La ausencia de métricas de rendimiento publicadas y el hecho de que sea un adaptador PEFT (no un modelo completo) requieren una evaluación cuidadosa antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma-2-2b-it) con adaptador LoRA |
| Parametros totales | Modelo base: 2 mil millones; adaptador LoRA: no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Gemma-2-2b-it soporta 8K tokens, no confirmado para este adaptador) |
| Tipos de cuantizacion | No disponible (el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | PEFT (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador PocketGull Compass se construye sobre el modelo Gemma-2-2b-it de Google, un transformer decoder de 2 mil millones de parametros con atencion multi-consulta y ventana de contexto de 8K tokens en su version original. El adaptador LoRA se ha afinado mediante DPO sobre conjuntos de datos clinicos especificos, incluyendo referencias a NIH MedQuAD y WHO mhGAP, con el objetivo de alinear las respuestas con las directrices de atencion escalonada de la OMS y los protocolos de estilo de vida del NIH. La model card menciona "100% ISMP decimal safety" y "zero catastrophic forgetting", lo que sugiere un entrenamiento cuidadoso para preservar las capacidades generales del modelo base, aunque no se proporcionan detalles sobre el numero de tokens de entrenamiento ni la composicion exacta del dataset.

Dado que es un adaptador PEFT, no se modifican los pesos originales del modelo base, sino que se anaden capas de bajo rango que se entrenan de forma especifica. Esto permite un despliegue eficiente y una integracion sencilla con la libreria Transformers y PEFT, tal como se muestra en el ejemplo de inferencia del README.

## Capacidades

- Generacion de texto en ingles con enfoque en contenido clinico y sanitario.
- Triaje clinico escalonado basado en protocolos NIH y OMS (p. ej., recomendaciones de estilo de vida para pacientes con prehipertension o glucemia elevada).
- Recomendaciones de salud mental y psicoeducacion siguiendo el programa mhGAP de la OMS.
- Evaluacion de interacciones farmacologicas, como el ejemplo de St. John's Wort y Warfarina, considerando el metabolismo CYP450.
- Alfabetizacion sanitaria socratica: genera explicaciones y preguntas para educar al paciente.
- Trayectorias de atencion en tres actos (probablemente estructura de seguimiento clinico), aunque no se detalla su implementacion exacta.
- No se mencionan capacidades de tool calling, vision, audio ni razonamiento multi-paso explicito.

## Casos de uso

- Asistencia a profesionales sanitarios en la elaboracion de planes de cuidados personalizados: el modelo puede generar recomendaciones de estilo de vida y seguimiento basadas en parametros clinicos como presion arterial o glucosa, siguiendo las guias NIH.
- Soporte en consultas de salud mental: proporciona recomendaciones psicoeducativas y de manejo para sintomas leves como fatiga o dificultades de sueno, alineadas con el programa mhGAP de la OMS.
- Revision de interacciones medicamentosas: el modelo puede alertar sobre posibles conflictos entre farmacos y suplementos, como el caso de la hierba de San Juan y los anticoagulantes, ayudando a evitar riesgos.
- Educacion sanitaria del paciente: mediante un enfoque socratico, genera preguntas y explicaciones que fomentan la comprension del paciente sobre su condicion y tratamiento.
- Triaje inicial en entornos de atencion primaria: clasifica sintomas y sugiere niveles de atencion escalonada, optimizando el flujo de pacientes en consultas con recursos limitados.
- Despliegue en entornos con requisitos estrictos de privacidad: al ser un adaptador ligero y de codigo abierto, puede ejecutarse localmente en dispositivos de borde o en nubes privadas, cumpliendo con HIPAA Safe Harbor al no retener datos de pacientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta metricas de MMLU, HumanEval, GSM8K u otros estandares, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: al estar basado en Gemma-2-2b-it, el modelo base en bfloat16 ocupa aproximadamente 4.4 GB. El adaptador LoRA anade unos pocos cientos de MB adicionales. Se estima que la inferencia puede ejecutarse en GPUs con al menos 6-8 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4070, RTX 4090, o GPUs profesionales como A10G, L4. Para entornos de produccion, una A100 o H100 seria sobredimensionada pero valida.
- Compatibilidad con consumer GPU: si, es viable en GPUs de gama media con suficiente memoria.
- Opciones de despliegue: se puede usar con Transformers + PEFT (como en el ejemplo del README), y tambien es posible fusionar el adaptador en el modelo base para usar con vLLM, llama.cpp u Ollama, aunque no se menciona explicitamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en el ambito clinico con tamano similar y licencia Apache 2.0. Se podria comparar con otros adaptadores LoRA sobre Gemma-2-2b, pero no hay datos publicados. Por tanto, esta seccion no esta disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles; no soporta otros idiomas.
- Es un adaptador sobre un modelo base de 2B, por lo que su capacidad de razonamiento complejo es limitada en comparacion con modelos de mayor tamano.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede generar informacion clinica inexacta o inventada. No debe utilizarse como sustituto del juicio profesional medico.
- Sesgos: los datos de entrenamiento clinico pueden contener sesgos demograficos o culturales; no se ha realizado una evaluacion de sesgos publica.
- No es un dispositivo medico: la model card lo clasifica como "Non-Device CDS" bajo FDA 520(o), es decir, una herramienta de apoyo a la decision clinica, no un dispositivo diagnostico.
- Limitaciones de contexto: la longitud de contexto no esta confirmada; si se hereda la de Gemma-2-2b-it (8K tokens), puede ser insuficiente para historiales clinicos extensos.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso en entornos clinicos debe cumplir con regulaciones locales como HIPAA o GDPR; el modelo no garantiza el cumplimiento por si solo.

## Enlaces

- [HuggingFace - philgear/pocketgull-compass-2b](https://huggingface.co/philgear/pocketgull-compass-2b)
- [GitHub - philgear/pocketgull](https://github.com/philgear/pocketgull/tree/main)
- [Sitio web de PocketGull](https://pocketgull.app/)
- [DOI Zenodo 10.5281/zenodo.20647514](https://doi.org/10.5281/zenodo.20647514)
