# mradermacher/PsyDial-Pi4-GGUF

## Resumen

PsyDial-Pi4-GGUF es la distribucion en formato GGUF del modelo PsyDial-Pi4, un ajuste fino orientado a psicoterapia y apoyo en salud mental desarrollado originalmente por el usuario qiuhuachuan y cuantizado por mradermacher. El modelo base parte de una arquitectura transformer densa con 7.615.616.512 parametros (aproximadamente 7,6 mil millones) y esta especializado en conversaciones de consejeria psicologica en chino. Su relevancia radica en ser uno de los pocos modelos abiertos dedicados especificamente al dominio terapeutico, con licencia Apache 2.0 que permite uso comercial.

La version GGUF facilita el despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles, ofreciendo un abanico de cuantizaciones desde Q2_K (3,1 GB) hasta f16 (15,3 GB). El modelo fue entrenado mediante llama-factory sobre los datasets PsyDial-D4 y PsyDial-D101, ambos centrados en dialogos de consejeria psicologica en chino.

Este fichero documenta exclusivamente la variante cuantizada; los detalles de arquitectura y entrenamiento del modelo original se infieren de los metadatos disponibles y de la model card del cuantizador, por lo que algunos datos tecnicos permanecen como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de un modelo base de ~7,6B, detalles no disponibles) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo original PsyDial-Pi4 es un ajuste fino completo (full fine-tuning) realizado con llama-factory sobre un modelo base de aproximadamente 7,6 mil millones de parametros. La model card no especifica la arquitectura exacta del modelo subyacente ni el numero de tokens de entrenamiento. Los datos de entrenamiento provienen de los datasets qiuhuachuan/PsyDial-D4 y qiuhuachuan/PsyDial-D101, ambos orientados a dialogos de consejeria psicologica en chino. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

La variante aqui descrita es una cuantizacion estatica generada por mradermacher con convert_type hf y quantize_version 2. Segun la model card, no se han publicado cuantizaciones con imatrix/weighted para este modelo en el momento de la ultima actualizacion. No se dispone de informacion sobre innovaciones tecnicas como atencion lineal, decodificacion especulativa o arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional especializada en contextos de psicoterapia y consejeria psicologica.
- Dialogo multi-turno orientado a apoyo emocional y salud mental.
- Entrenamiento especifico sobre datasets de consejeria (PsyDial-D4 y PsyDial-D101), lo que sugiere respuestas alineadas con practicas terapeuticas.
- Soporte exclusivo del idioma chino; no se documenta capacidad multilingue.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo thinking, vision ni audio.
- Compatible con endpoints (tag endpoints_compatible) para despliegue como API.

## Casos de uso

- Prototipado de asistentes conversacionales de apoyo emocional en chino: el modelo puede gestionar dialogos multi-turno con un tono terapeutico gracias a su ajuste fino sobre corpus de consejeria, sirviendo como base para validar flujos de conversacion antes de invertir en modelos mayores.
- Investigacion academica en NLP clinico: util para estudiar como los modelos de lenguaje abiertos reproducen tecnicas de consejeria psicologica en chino, comparando respuestas generadas con guias terapeuticas establecidas.
- Generacion de respuestas de primera linea en chatbots de triaje emocional: desplegado con llama.cpp en servidores modestos, puede ofrecer respuestas iniciales de contencion emocional antes de derivar a un profesional humano.
- Formacion de estudiantes de psicologia: simulacion de pacientes o terapeutas en entornos controlados para practicar tecnicas de entrevista, aprovechando el sesgo conversacional del modelo hacia el dominio clinico.
- Despliegue en hardware de consumo para demos: con cuantizaciones Q4_K_M (4,8 GB) o Q4_K_S (4,6 GB) cabe en GPUs de consumo de 8 GB, permitiendo demostraciones locales sin infraestructura cloud.
- Anonimizacion y reescritura de notas clinicas: el modelo puede reformular textos de sesiones preservando el tono terapeutico, aunque requiere validacion humana por el riesgo de alucinacion.
- Integracion en pipelines de investigacion sobre sesgos en IA clinica: al ser Apache 2.0, permite auditar y modificar el modelo para estudiar sesgos de genero, cultura o gravedad diagnostica en respuestas terapeuticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: ~3,1 GB de pesos, ~4-5 GB de VRAM total con overhead.
  - Q4_K_S / Q4_K_M: ~4,6-4,8 GB de pesos, ~6-7 GB de VRAM total.
  - Q5_K_M: ~5,5 GB de pesos, ~7-8 GB de VRAM total.
  - Q6_K: ~6,4 GB de pesos, ~8-9 GB de VRAM total.
  - Q8_0: ~8,2 GB de pesos, ~10-11 GB de VRAM total.
  - f16: ~15,3 GB de pesos, ~17-18 GB de VRAM total.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q5-Q8; RTX 4090 24 GB o A100/H100 para f16 y despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, desde GTX 1660 6 GB (Q2_K) hasta RTX 4090 (f16). Para Q4_K_M se recomienda al menos 8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python con endpoints compatibles OpenAI). vLLM y TGI no soportan GGUF de forma nativa para este formato; requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| PsyDial-Pi4-GGUF | 7,6B | no disponible | Apache 2.0 | Psicoterapia en chino | GGUF en HF |
| PsyDial-Pi4 (base) | 7,6B | no disponible | Apache 2.0 | Psicoterapia en chino | Safetensors en HF |
| Modelos generalistas ~7B (p. ej., Qwen2.5-7B) | ~7B | variable | variable | Proposito general | Multiples formatos |
| Modelos clinicos en ingles (p. ej., MentalLlama, Meditron) | 7-70B | variable | variable | Salud mental / medicina | Multiples formatos |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada. PsyDial-Pi4 se distingue por su especializacion en chino y su licencia permisiva, pero carece de benchmarks publicados que permitan situarlo frente a modelos generalistas o clinicos de referencia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en chino; su uso en castellano u otros idiomas producira respuestas de baja calidad o incoherentes.
- Riesgo elevado de alucinacion en un dominio sensible como la salud mental; no debe usarse como sustituto de atencion profesional.
- No se han publicado evaluaciones de sesgos ni de seguridad clinica; se desconoce el comportamiento ante crisis (ideacion suicida, autolesiones).
- Los datasets de entrenamiento (PsyDial-D4, PsyDial-D101) no estan documentados en detalle en la informacion disponible, lo que impide evaluar su calidad y cobertura.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue en contextos clinicos exige cumplimiento normativo (por ejemplo, RGPD y regulacion sanitaria) que el modelo no garantiza por si mismo.
- Al ser una cuantizacion estatica sin imatrix, las versiones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia conversacional.
- No se documenta longitud de contexto; asumir ventanas cortas en produccion puede provocar perdida de informacion en dialogos largos.
- El modelo no incorpora mecanismos de derivacion a profesionales ni protocolos de crisis; cualquier despliegue real debe anadir capas de seguridad externas.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/PsyDial-Pi4-GGUF
- Modelo base: https://huggingface.co/qiuhuachuan/PsyDial-Pi4
- Dataset PsyDial-D4: https://huggingface.co/datasets/qiuhuachuan/PsyDial-D4
- Dataset PsyDial-D101: https://huggingface.co/datasets/qiuhuachuan/PsyDial-D101
- Pagina de overview del cuantizador: https://hf.tst.eu/model#PsyDial-Pi4-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
