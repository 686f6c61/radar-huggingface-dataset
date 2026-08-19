# mradermacher/Nebula-Reasoner-12B-GGUF

## Resumen

Nebula-Reasoner-12B-GGUF es una colección de cuantizaciones GGUF del modelo base mrcuddle/Nebula-Reasoner-12B, preparadas por mradermacher para facilitar su ejecución en entornos locales con recursos limitados. El modelo original es un merge de 12 247 millones de parámetros, creado mediante la herramienta mergekit, aunque no se dispone de documentación detallada sobre su arquitectura ni su proceso de entrenamiento.

Esta versión cuantizada resulta relevante para desarrolladores que desean probar un modelo de razonamiento de 12B en hardware de consumo, ya que ofrece diez niveles de cuantización (desde Q2_K hasta Q8_0) que permiten ajustar el equilibrio entre tamaño, velocidad y calidad. Al estar en formato GGUF, es compatible con motores de inferencia como llama.cpp, Ollama y LM Studio, lo que amplía su accesibilidad.

Sin embargo, la información pública sobre el modelo base es muy escasa: no se han publicado detalles sobre arquitectura, datos de entrenamiento, benchmarks ni licencia. Por tanto, esta ficha se basa únicamente en los datos disponibles en la página de HuggingFace y en la model card de la cuantización, y muchas especificaciones quedan sin confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 12 247 782 400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información publica sobre la arquitectura del modelo base mrcuddle/Nebula-Reasoner-12B. La model card de la cuantizacion indica que se trata de un merge realizado con mergekit, pero no se especifican los modelos combinados ni la tecnica de mezcla empleada. Tampoco hay datos sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO.

Al ser un modelo de 12B de parametros, es probable que siga una arquitectura transformer clasica, pero esto no puede confirmarse sin documentacion adicional. La cuantizacion GGUF fue generada por mradermacher mediante conversion estatica, sin usar matrices de importancia (imatrix) ni cuantizacion ponderada, segun se indica en la model card.

## Capacidades

No se ha publicado una lista oficial de capacidades para el modelo base. Dado su nombre (Reasoner) y su tamano, es razonable esperar que pueda realizar tareas de generacion de texto, razonamiento logico y posiblemente codigo, pero no hay evidencia concreta. La unica informacion confirmada es que el modelo esta etiquetado como "conversational" y soporta el idioma ingles.

- Generacion de texto y conversacion: el modelo esta etiquetado como "conversational", lo que sugiere que puede mantener dialogos multi-turno, aunque no hay ejemplos ni evaluaciones publicas.
- Razonamiento: el nombre "Reasoner" indica un enfoque en tareas de razonamiento, pero no se han publicado benchmarks que lo confirmen.
- Otras capacidades (tool calling, vision, audio, etc.): no disponible.

## Casos de uso

Dado que no hay informacion detallada sobre el modelo base, los casos de uso se infieren de su naturaleza como modelo de lenguaje de 12B cuantizado. Las aplicaciones practicas dependen de las capacidades reales del modelo, que no han sido documentadas. No obstante, al estar en formato GGUF, puede integrarse en flujos de inferencia local.

- Inferencia local en hardware de consumo: gracias a las cuantizaciones (por ejemplo, Q4_K_M con 7,6 GB), el modelo puede ejecutarse en GPUs con 8 GB de VRAM o incluso en CPU con suficiente RAM, usando llama.cpp u Ollama.
- Prototipado rapido de chatbots: al ser ligero y compatible con herramientas como Ollama, permite crear asistentes conversacionales para pruebas internas sin depender de APIs externas.
- Experimentacion con modelos de razonamiento: para investigadores que quieran evaluar el comportamiento de un modelo de 12B sin acceso a infraestructura cloud, esta cuantizacion ofrece una via de acceso rapida.
- Despliegue en entornos con restricciones de red: al ser un archivo local, se puede usar en aplicaciones que requieren privacidad de datos y no pueden enviar consultas a servicios externos.
- Generacion de texto asistida en aplicaciones de escritorio: mediante integraciones con LM Studio o KoboldCpp, se puede usar como motor de redaccion o asistencia en herramientas ofimaticas.
- Educacion y formacion: para estudiantes que deseen aprender sobre cuantizacion y despliegue de LLMs, este modelo sirve como ejemplo practico de un sistema de 12B ejecutandose en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estandar para el modelo base. Tampoco hay comparaciones con modelos similares. Por tanto, no es posible evaluar su rendimiento relativo.

## Requisitos de hardware

Los requisitos dependen de la cuantizacion elegida. A continuacion se estima la VRAM necesaria para cargar el modelo completo en GPU (sin offloading a CPU), basandose en el tamano de los archivos GGUF:

- Q2_K (4,9 GB): cabe en GPUs con 6 GB de VRAM (p. ej., RTX 2060, GTX 1660 Ti).
- Q3_K_M (6,2 GB): requiere al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060).
- Q4_K_M (7,6 GB): recomendado para GPUs de 8-10 GB (RTX 3080, RTX 4070).
- Q5_K_M (8,8 GB): necesita 10-12 GB de VRAM (RTX 3080 Ti, RTX 4070 Ti).
- Q8_0 (13,1 GB): requiere 16 GB de VRAM (RTX 4080, RTX 4090, A100).

Para uso en CPU, se recomienda al menos 16 GB de RAM para las cuantizaciones mas pequeñas y 32 GB para las mayores. El despliegue puede realizarse con llama.cpp, Ollama, LM Studio o TGI (si se convierte a otro formato). No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo base no tiene benchmarks publicados, y no se conocen sus caracteristicas tecnicas (arquitectura, contexto, etc.). Por tanto, no es posible compararlo con alternativas como Mistral 7B, Llama 3 8B o Qwen 2.5 7B sin datos objetivos.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada, por lo que el uso comercial es incierto y podria infringir derechos si el modelo base tiene restricciones.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un modelo sin documentacion, se desconoce su comportamiento en contextos delicados.
- La cuantizacion introduce perdida de calidad respecto al modelo original, especialmente en niveles bajos como Q2_K o Q3_K_M. Se recomienda usar Q4_K_M o superior para tareas criticas.
- El modelo solo soporta ingles, por lo que no es adecuado para aplicaciones en otros idiomas sin un ajuste adicional.
- No se han publicado evaluaciones de seguridad, por lo que no se garantiza que el modelo sea robusto frente a prompts maliciosos.
- La ausencia de informacion sobre el contexto maximo impide dimensionar correctamente aplicaciones que requieran ventanas largas.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Nebula-Reasoner-12B-GGUF
- Modelo base (mrcuddle/Nebula-Reasoner-12B): https://huggingface.co/mrcuddle/Nebula-Reasoner-12B
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
