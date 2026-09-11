# chenhaodev/tcm-constitution-qwen3-8b-gguf

## Resumen

El modelo `chenhaodev/tcm-constitution-qwen3-8b-gguf` es un ajuste fino de Qwen3-8B orientado a medicina tradicional china (MTC), distribuido exclusivamente en formato GGUF cuantizado para despliegue local con Ollama o llama.cpp. Lo publica el usuario chenhaodev y su dominio de especializacion combina tres areas: teoria basica de MTC, diagnostico en MTC y clasificacion y determinacion de constituciones segun la norma china GB/T 46939-2025. Sobre el modelo base, de 8.190.735.360 parametros, se ha aplicado un ajuste con 15.339 registros de pregunta-respuesta depurados y aumentados con contexto RAG.

La relevancia del modelo es acotada pero clara: cubre una tarea muy concreta (cuestionarios de constitucion y razonamiento diagnostico basico en MTC) en un idioma, el chino, con un unico juego de pesos cuantizados (F16, Q8_0, Q5_K_M y Q4_K_M) que cabe en equipos de consumo, desde 5,03 GB en Q4_K_M. Al derivar de Qwen3-8B conserva la licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales de licencia, aunque con la advertencia medica explicita del autor.

Se trata de un modelo denso tipo transformer decoder-only, no MoE, con un unico conjunto de parametros activos igual al total. El repositorio ocupa 19,6 GB e incluye cuatro cuantizaciones; el autor publica ademas el adaptador LoRA por separado para quienes quieran usar transformers o Unsloth. No hay datos publicados de benchmarks, descargas ni valoraciones en la informacion disponible, por lo que su calidad debe validarse internamente antes de cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card no la especifica) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repositorio principal); adaptador LoRA en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de 8.190.735.360 parametros, y no modifica la arquitectura: el ajuste se aplica como especializacion de dominio. El autor publica el resultado en cuatro cuantizaciones GGUF (F16 de 16,4 GB, Q8_0 de 8,7 GB, Q5_K_M de 5,85 GB y Q4_K_M de 5,03 GB), pensadas para inferencia local en Ollama y llama.cpp. No se documentan cambios en el mecanismo de atencion, en el tokenizador ni en la ventana de contexto respecto al modelo base.

En cuanto a los datos, el entrenamiento usa 15.339 registros de pregunta-respuesta sobre medicina tradicional china tras un proceso de deduplicacion, con muestras de teoria basica, casos clinicos, calculo de puntuaciones del cuestionario constitucional y preguntas de sintesis entre capitulos. Esos registros se enriquecieron con contexto RAG, y el autor indica que el volumen total supera las 10.000 muestras. No se especifica en la informacion disponible si hubo etapas de RLHF, DPO u otras tecnicas de alineacion adicionales, ni el numero de tokens vistos durante el ajuste, ni la composicion exacta del dataset. El adaptador LoRA asociado se publica por separado para su uso con transformers o Unsloth.

## Capacidades

- Generacion de texto conversacional en chino sobre medicina tradicional china.
- Razonamiento sobre teoria basica de MTC (fundamentos, sindromes, conceptos clasicos).
- Apoyo al diagnostico en MTC dentro de un marco teorico, no clinico.
- Cumplimentacion y puntuacion de cuestionarios de constitucion conforme a la norma GB/T 46939-2025.
- Sintesis entre capitulos o secciones distintas del temario, segun los datos de entrenamiento declarados.
- Uso con contexto RAG: el ajuste se realizo con contexto aumentado, por lo que el modelo esta preparado para recibir documentacion de apoyo en el prompt.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se mencionan).
- Capacidades multilingues: no disponibles; el unico idioma declarado es el chino.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Cuestionarios de constitucion en MTC: el modelo puede administrar el cuestionario de clasificacion de constituciones de la norma GB/T 46939-2025, calcular puntuaciones por dimension y devolver la constitucion predominante con su justificacion, integrado en una aplicacion de salud o bienestar de consumo.
- Formacion y divulgacion en escuelas de MTC: como asistente de estudio que responde dudas de teoria basica y explica la relacion entre sintomas y sindromes, con despliegue local en el aula para evitar enviar datos de alumnos a servicios externos.
- Asistente documental con RAG: combinado con una base de textos clasicos y apuntes clinicos recuperados en el prompt, el modelo sintetiza respuestas citando el material aportado, gracias al ajuste especifico con contexto aumentado.
- Preclasificacion de consultas en un triaje informativo: en una aplicacion de orientacion no clinica, el modelo puede ordenar las quejas del usuario segun categorias de MTC y sugerir que tipo de profesional consultar, siempre con aviso de que no sustituye al diagnostico medico.
- Generacion de material didactico: redaccion de fichas, resumenes y bancos de preguntas sobre fundamentos de MTC para plataformas de e-learning en chino, con la ventaja de que el modelo ya esta especializado y no requiere prompts largos de contextualizacion.
- Prototipado de producto en local: al distribuirse en GGUF de 5 a 9 GB, permite levantar un prototipo funcional en un portatil con GPU de consumo o incluso en CPU mediante Ollama, sin costes de API y sin sacar los datos del dispositivo.
- Investigacion sobre ajuste de dominio: el par repositorio GGUF mas adaptador LoRA sirve como caso de estudio reproducible de como especializar un modelo generalista de 8B en un dominio tecnico y en un unico idioma con un dataset de unas 15.000 muestras.
- Traduccion y explicacion de terminologia de MTC: para equipos que trabajan con documentacion china de medicina tradicional y necesitan explicaciones en ese idioma de terminos, sindromes y criterios de clasificacion constitucional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion clinica o de clasificacion constitucional, y la busqueda web no aporto resultados relevantes.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir del tamano de los ficheros, con margen para el contexto y las capas de cache):
  - Q4_K_M (5,03 GB): en torno a 6-7 GB de VRAM.
  - Q5_K_M (5,85 GB): en torno a 7-8 GB de VRAM.
  - Q8_0 (8,7 GB): en torno a 10-11 GB de VRAM.
  - F16 (16,4 GB): en torno a 18-20 GB de VRAM.
- GPU recomendadas: para Q4_K_M y Q5_K_M basta una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070; para Q8_0, una RTX 4080/4090 o RTX 3090 de 24 GB; para F16, una A100 40 GB, H100 o RTX 4090 con margen limitado.
- Cabe en GPU de consumo: si, en las cuantizaciones Q4_K_M y Q5_K_M con 8-12 GB de VRAM; Q8_0 requiere 12-16 GB y F16 queda fuera del rango de tarjetas de consumo habituales.
- Opciones de despliegue: Ollama (`ollama pull hf.co/chenhaodev/tcm-constitution-qwen3-8b-gguf:q4_k_m`) y llama.cpp para los ficheros GGUF; el adaptador LoRA esta pensado para transformers o Unsloth. No se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| tcm-constitution-qwen3-8b-gguf | 8.190.735.360 | no disponible | zh | Apache-2.0 | GGUF (F16, Q8_0, Q5_K_M, Q4_K_M) + LoRA | no disponible |
| Qwen3-8B (modelo base) | 8.190.735.360 | no disponible en la informacion proporcionada | multilingue (incluye zh) | Apache-2.0 | safetensors y cuantizaciones de terceros | no incluidos en esta ficha |
| Otros ajustes medicos en chino (por ejemplo, variantes sobre Qwen o Llama) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables en la informacion proporcionada para comparar el rendimiento con alternativas de la misma categoria. La unica comparacion solida es con Qwen3-8B: mismo numero de parametros y misma licencia, pero sin la especializacion en MTC ni el empaquetado GGUF ya listo para Ollama.

## Limitaciones y advertencias

- Riesgo de alucinacion relevante: al ser un modelo de dominio medico, puede generar afirmaciones plausibles pero incorrectas sobre sindromes, hierbas, dosis o criterios diagnosticos.
- Advertencia explicita del autor: el modelo es solo para aprendizaje y referencia, no constituye diagnostico ni recomendacion de tratamiento; el diagnostico en MTC debe realizarlo un profesional titulado.
- Sesgo de dominio y de idioma: entrenado con 15.339 registros en chino, refleja la terminologia y los criterios de la norma china GB/T 46939-2025; puede no encajar con otras tradiciones o marcos regulatorios.
- Cobertura limitada del ajuste: un dataset de ese tamano sobre un modelo de 8B puede producir sobreajuste al estilo de las respuestas de entrenamiento y perdida de capacidades generales del modelo base.
- Idiomas: solo chino declarado, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto: no documentada en la model card; conviene medirla antes de disenar flujos con documentos largos.
- Falta de validacion externa: cero descargas y cero valoraciones en el momento de redactar la ficha, sin benchmarks publicados ni evaluacion clinica independiente.
- Licencia: Apache-2.0, permisiva y apta para uso comercial, siempre que se cumplan las condiciones de atribucion y que el uso no se presente como servicio medico regulado.
- Fechas del repositorio: la informacion indica creacion y actualizacion en septiembre de 2026, dato que conviene verificar en la pagina del modelo.
- Caveat de produccion: cualquier despliegue en un contexto sanitario debe incorporar revision humana, avisos claros al usuario y verificacion de la normativa local aplicable.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/chenhaodev/tcm-constitution-qwen3-8b-gguf
- Adaptador LoRA: https://huggingface.co/chenhaodev/tcm-constitution-qwen3-8b-lora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (solo paginas genericas de servicios de Google), por lo que no hay papers, blogs ni demos adicionales que enlazar.
