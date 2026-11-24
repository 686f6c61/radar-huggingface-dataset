# mradermacher/Dr_Samantha-7b-GGUF

## Resumen

Dr_Samantha-7b-GGUF es la distribucion en formato GGUF del modelo Dr_Samantha-7b, un modelo de lenguaje afinado para el dominio medico y desarrollado originalmente por sethuiyer. Esta version concreta la publica mradermacher, un conocido empaquetador de cuantizaciones GGUF, que ofrece el modelo en multiples niveles de compresion (de Q2_K a f16) para facilitar su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base es un merge de 6.738.423.808 parametros (aproximadamente 7B) construido sobre la familia Llama 2.

El modelo esta orientado a tareas de salud y consulta medica, y se ha entrenado o ajustado con datasets especificos del dominio como MedQA-USMLE-4-options, samantha-data y el corpus medico en ingles y chino de shibing624. Su relevancia actual radica en que permite desplegar un asistente especializado en medicina en local, sin depender de APIs externas, gracias a las cuantizaciones de 2,6 GB a 7,3 GB que caben en GPUs de consumo.

La licencia es llama2, lo que impone restricciones de uso comercial y obligaciones de atribucion. El modelo soporta ingles y chino, y su ventana de contexto, arquitectura detallada y regimen de entrenamiento no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2; detalles no disponibles) |
| Parametros totales | 6.738.423.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh |
| Licencia | llama2 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un merge de la familia Llama 2 con aproximadamente 6,74 mil millones de parametros. Se trata de un transformer decoder-only, la arquitectura estandar de la serie Llama 2, aunque no se dispone de detalles especificos sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni el mecanismo exacto de fusion de los componentes del merge.

En cuanto a los datos, la model card del modelo base referencia tres conjuntos: GBaker/MedQA-USMLE-4-options (preguntas de examen medico tipo USMLE), cognitivecomputations/samantha-data (dialogos de asistente) y shibing624/medical (corpus medico en ingles y chino). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y respuesta a preguntas de dominio medico en ingles y chino.
- Razonamiento clinico basico orientado a preguntas de tipo examen (USMLE).
- Conversacion multi-turno con estilo de asistente (herencia de samantha-data).
- Comprension de terminologia medica en ingles y chino.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues limitadas a ingles y chino.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Asistente de consulta medica preliminar: el modelo puede responder preguntas sobre sintomas y terminologia medica en ingles o chino, sirviendo como primer filtro informativo antes de la consulta profesional.
- Generacion de preguntas de estudio tipo USMLE: adecuado para crear bancos de preguntas y explicaciones razonadas gracias a su ajuste sobre MedQA-USMLE-4-options.
- Traduccion y adaptacion de contenido medico entre ingles y chino: su naturaleza bilingue permite trasladar material clinico entre ambos idiomas.
- Despliegue local en entornos con requisitos de privacidad: al ejecutarse con llama.cpp en hardware de consumo, permite procesar datos medicos sin enviarlos a servicios en la nube.
- Prototipado de chatbots de salud en investigacion: util para experimentar con dialogos medicos en entornos academicos controlados.
- Educacion y divulgacion sanitaria: generacion de explicaciones simplificadas de conceptos medicos para materiales formativos.
- Soporte a la documentacion clinica: borradores de resumenes o notas a partir de texto de entrada, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~2,6 GB, Q4_K_M ~4,2 GB, Q5_K_M ~4,9 GB, Q6_K ~5,6 GB, Q8_0 ~7,3 GB, f16 ~13,6 GB (mas overhead de contexto).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para cuantizaciones altas; A100 o H100 para f16 y despliegues concurrentes.
- Cabe en GPU de consumo: si, desde GPUs de 6-8 GB con cuantizaciones Q4 y Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros runners compatibles con GGUF. Las cuantizaciones con imatrix estan en el repositorio hermano Dr_Samantha-7b-i1-GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dr_Samantha-7b-GGUF | 6,74B | no disponible | llama2 | GGUF | Ajuste medico en y zh |
| Llama 2 7B Chat | 6,74B | 4.096 tokens (referencia de la familia) | llama2 | safetensors, GGUF | Base generalista, sin especializacion medica |
| Meditron-7B | ~7B | no disponible | llama2 | safetensors, GGUF | Ajuste medico sobre Llama 2 |
| shibing624/medical (base) | variable | no disponible | no disponible | safetensors | Corpus medico usado en el entrenamiento |

La comparativa de rendimiento cuantitativo entre estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un dispositivo medico ni sustituye el juicio clinico profesional; no debe usarse para diagnostico o tratamiento sin supervision humana.
- Riesgo de alucinacion en contenido medico, con potencial de generar informacion incorrecta o peligrosa.
- Sesgos derivados de los datasets de entrenamiento (MedQA, samantha-data y corpus medico), no documentados.
- Cobertura linguistica limitada a ingles y chino; sin soporte fiable en castellano.
- Ventana de contexto no documentada, lo que dificulta planificar conversaciones largas.
- Licencia llama2: restricciones de uso comercial, umbral de usuarios mensuales y obligaciones de atribucion segun los terminos de Meta.
- El repositorio ocupa 59,6 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.
- Sin resultados de benchmarks publicados que permitan validar su calidad frente a alternativas.
- Fecha de creacion del repositorio: 2024-12-19; ultima actualizacion: 2026-11-24.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Dr_Samantha-7b-GGUF
- Modelo base: https://huggingface.co/sethuiyer/Dr_Samantha-7b
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Dr_Samantha-7b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Dr_Samantha-7b-GGUF
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset samantha-data: https://huggingface.co/datasets/cognitivecomputations/samantha-data
- Dataset shibing624/medical: https://huggingface.co/datasets/shibing624/medical
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
