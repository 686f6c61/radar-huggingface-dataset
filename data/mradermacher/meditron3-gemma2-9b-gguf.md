# mradermacher/Meditron3-Gemma2-9B-GGUF

## Resumen

Meditron3-Gemma2-9B-GGUF es la distribucion en formato GGUF del modelo Meditron3-Gemma2-9B, desarrollado originalmente por EPFLiGHT (EPFL) y cuantizado por mradermacher. Se trata de un ajuste fino de Gemma 2 de 9.000 millones de parametros orientado al dominio medico, disenado para tareas de comprension y generacion de texto clinico en ingles. El modelo base emplea una arquitectura transformer densa con atencion por ventanas alternada y atencion global, e incorpora tecnicas como logit soft-capping y destilacion de conocimiento sobre Gemma 2.

La relevancia de esta publicacion radica en que facilita el despliegue local del modelo medico mediante cuantizaciones GGUF de 2 a 16 bits, lo que permite ejecutarlo en hardware de consumo y en entornos donde no es viable enviar datos clinicos a APIs externas. El repositorio incluye 12 variantes de cuantizacion estatica (Q2_K hasta f16) con tamanos que van de 3,9 GB a 18,6 GB.

El modelo esta especializado en el dominio medico y solo declara soporte para ingles. Su licencia es la Gemma License, lo que impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue en produccion. La fecha de creacion del repositorio es marzo de 2025 y la ultima actualizacion registrada es noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la de Gemma 2) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma License) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Gemma 2 de 9B, un transformer denso con atencion por ventanas alternada (local/global) y logit soft-capping, tecnicas introducidas por Google en la familia Gemma 2. Meditron3-Gemma2-9B adapta ese modelo base al dominio medico mediante ajuste fino supervisado sobre corpus clinicos, aunque la model card del repositorio cuantizado no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifica la innovacion de decodificacion especulativa ni variantes de atencion lineal.

La contribucion tecnica de este repositorio concreto es la cuantizacion: mradermacher genera cuantizaciones estaticas (no imatrix en este repo; las imatrix estan en el repositorio hermano `Meditron3-Gemma2-9B-i1-GGUF`) con `quantize_version: 2` y `output_tensor_quantised: 1`, siguiendo el pipeline estandar de llama.cpp. No se documentan detalles adicionales sobre el proceso de entrenamiento del modelo base en la informacion disponible.

## Capacidades

- Generacion de texto en ingles con orientacion al dominio medico.
- Razonamiento clinico y respuesta a preguntas sobre contenido medico (el tag `medical` identifica la especializacion).
- Conversacion multi-turno (tag `conversational`).
- Compatible con endpoints de inferencia (`endpoints_compatible`).
- Capacidad de codigo, matematicas o vision: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a ingles segun los metadatos.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente clinico de consulta interna: el modelo puede responder preguntas de referencia medica en ingles para personal sanitario, desplegado on-premise con llama.cpp para evitar la salida de datos de pacientes.
- Triaje documental y resumen de historiales: con cuantizaciones Q4_K_M (5,9 GB) cabe en una GPU de consumo y permite resumir notas clinicas en ingles dentro de un pipeline local.
- Educacion medica y simulacion de casos: generacion de explicaciones y preguntas de estudio sobre patologias, aprovechando el ajuste fino sobre corpus medico.
- Extraccion de informacion de literatura cientifica: procesamiento batch de abstracts y articulos en ingles para poblar bases de conocimiento internas.
- Chatbot de orientacion sanitaria no diagnostica: conversacion multi-turno en ingles con avisos de derivacion a profesionales, desplegado con Ollama o llama.cpp.
- Investigacion en NLP clinico: base para experimentos de evaluacion de modelos medicos cuantizados, comparando calidad entre Q4_K_M, Q6_K y Q8_0 en tareas de QA medica.
- Despliegue en entornos con requisitos de privacidad: al ser GGUF y ejecutable localmente, permite inferencia sin conexion en hospitales o laboratorios con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, MedQA, HumanEval ni metricas comparativas; solo presenta la tabla de cuantizaciones con tamanos y notas de calidad.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~3,9 GB, Q4_K_M ~5,9 GB, Q6_K ~7,7 GB, Q8_0 ~9,9 GB, f16 ~18,6 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M/Q5_K_M; RTX 4090 24 GB para Q8_0 o f16; A100/H100 para despliegues concurrentes con contexto largo.
- Cabe en GPU de consumo: si, desde Q4_K_S en GPUs de 8 GB con contexto reducido, y con holgura en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| Meditron3-Gemma2-9B-GGUF (este) | 9,24 B | no disponible | Medico (en) | Gemma License | GGUF |
| Gemma 2 9B (base) | 9,24 B | no disponible | General | Gemma License | safetensors, GGUF |
| Meditron3-Gemma2-9B-i1-GGUF | 9,24 B | no disponible | Medico (en) | Gemma License | GGUF (imatrix) |
| Modelos medicos comparables de 7-8B | no disponible | no disponible | Medico | variable | variable |

La comparativa con alternativas medicas de tamano similar no puede completarse con datos verificados en la informacion disponible; se recomienda consultar el repositorio base de EPFLiGHT para obtener metricas del modelo sin cuantizar.

## Limitaciones y advertencias

- Modelo especializado en ingles: no declara soporte para castellano ni otros idiomas, por lo que su uso en espanol no esta validado.
- Riesgo de alucinacion clinica: cualquier salida medica debe ser revisada por profesionales; no debe usarse como herramienta diagnostica autonoma.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; los corpus medicos pueden arrastrar sesgos demograficos y geograficos.
- Licencia Gemma: impone terminos de uso (incluida la politica de uso aceptable de Google) que restringen ciertos usos comerciales y requieren revision legal antes de produccion.
- La cuantizacion degrada la calidad respecto al modelo f16; las variantes Q2_K y Q3_K_M se marcan explicitamente como de menor calidad.
- No se dispone de datos de benchmarks del modelo cuantizado, por lo que el impacto real de cada cuantizacion en tareas medicas no esta medido.
- Longitud de contexto no documentada en este repositorio; debe consultarse la model card del modelo base.
- El repositorio tiene un uso muy bajo (260 descargas, 1 like), lo que limita la validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Meditron3-Gemma2-9B-GGUF
- Modelo base: https://huggingface.co/EPFLiGHT/Meditron3-Gemma2-9B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Meditron3-Gemma2-9B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Meditron3-Gemma2-9B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
