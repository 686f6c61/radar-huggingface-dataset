# sautilm/SautiLM-Kuu-Med

## Resumen

SautiLM-Kuu-Med es un modelo de generacion de texto especializado en dominio medico, distribuido en formato GGUF con cuantizacion Q4_K_M y derivado del modelo base `unsloth/medgemma-4b-it` (la variante ajustada de MedGemma 4B de Google). Lo desarrolla el equipo SautiLM / LosingTek Research desde Bunia (Ituri, Republica Democratica del Congo), con el objetivo declarado de ofrecer asistencia sanitaria en ingles, frances y suajili en entornos con conectividad limitada o nula. El artefacto principal es un unico fichero GGUF de 2382,37 MB pensado para ejecutarse en estaciones de trabajo de PC (AfyaSpeak Desktop) con al menos 8 GB de RAM.

El modelo forma parte de una arquitectura modular de tres niveles (Jua 270M movil, Nuru clasificadores de vision TFLite <= 45 MB y Kuu 1B movil / 4B escritorio), y se presenta como una solucion "soberana" y 100 % offline orientada a clinicas y puestos de trabajo sin acceso a la nube. Tecnicamente es un transformer denso de 3.880.263.168 parametros (aproximadamente 3,88B), heredado de la familia Gemma 3 de Google y ajustado mediante LoRA sobre un corpus muy reducido.

La relevancia del modelo es doble: por un lado, ejemplifica el patron de adaptacion de un modelo medico abierto a idiomas y contextos africanos con recursos minimos; por otro, su naturaleza experimental (287 ejemplos de entrenamiento, validacion pendiente) exige tratarlo con cautela antes de cualquier uso clinico real. La licencia es la Gemma License, con las restricciones que esta implica para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Google MedGemma 4B IT), cuantizado a GGUF Q4_K_M con `n_ctx=4096` |
| Parametros totales | 3.880.263.168 (aprox. 3,88B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (`n_ctx=4096` declarado en la model card) |
| Tipos de cuantizacion | Q4_K_M (`Q4_K_M_WORKSTATION`); el autor menciona INT8 en el pipeline de entrenamiento |
| Idiomas soportados | Frances (fr), ingles (en), suajili (sw) |
| Licencia | Gemma License (`license: gemma`) |
| Formato de pesos | GGUF (artefacto `sautilm-kuu-med-q4_k_m.gguf`, 2382,37 MB); el repo incluye tambien safetensors segun los tags |
| Tamano del repositorio | 2,7 GB |
| Modelo base | `unsloth/medgemma-4b-it` |
| Metodo de ajuste | LoRA con `r=24`, `alpha=48`, 244 pasos |
| Perdidas declaradas | Entrenamiento: 0,0869; mejor validacion: 1,5162 |
| Hardware objetivo | PC de escritorio / estacion de trabajo de clinica con >= 8 GB de RAM |

## Arquitectura y entrenamiento

El modelo es un transformer denso heredado de MedGemma 4B IT de Google, la variante de la familia Gemma 3 ajustada para dominio medico. Sobre esa base, el equipo de SautiLM aplico un ajuste LoRA (`r=24`, `alpha=48`) durante 244 pasos, con una perdida de entrenamiento final de 0,0869 y una mejor perdida de validacion de 1,5162. Posteriormente se cuantizo a GGUF en variante Q4_K_M, con un contexto declarado de 4096 tokens, y se empaqueto como un unico fichero de 2382,37 MB para despliegue en estaciones de trabajo.

El dato mas relevante del entrenamiento es la escala del corpus: 287 ejemplos verificados, descritos por el autor como "zero-leakage". Esta cifra es extremadamente reducida para un ajuste orientado a dominio medico, lo que explica en parte la diferencia entre la perdida de entrenamiento (0,0869) y la de validacion (1,5162): la brecha sugiere sobreajuste al conjunto de entrenamiento y una capacidad de generalizacion limitada. La model card no detalla la composicion del dataset, la procedencia de los ejemplos ni si se aplicaron tecnicas de RLHF o DPO; tampoco se documenta ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, etc.) mas alla de la cuantizacion y el ajuste LoRA.

## Capacidades

- Generacion de texto conversacional en ingles, frances y suajili, orientada a consultas de dominio medico.
- Razonamiento basico y respuesta a preguntas sobre salud, heredado del ajuste medico de MedGemma 4B IT.
- Soporte de conversaciones multi-turno dentro de una ventana de 4096 tokens.
- Ejecucion 100 % offline en hardware de escritorio, sin dependencia de APIs en la nube.
- Capacidad multilingue limitada a los tres idiomas declarados (fr, en, sw); no se documenta soporte de otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- No se documenta modo "thinking", vision ni audio en esta variante (aunque el modelo base MedGemma es multimodal, la model card de esta ficha no describe capacidades de vision para el artefacto GGUF).

## Casos de uso

- Asistencia clinica en entornos sin conectividad: el modelo se ejecuta como fichero GGUF unico en una estacion de trabajo con 8 GB de RAM, lo que permite desplegarlo en clinicas rurales sin acceso a internet ni a APIs externas.
- Triage y orientacion inicial en suajili: al soportar suajili ademas de ingles y frances, puede atender consultas de pacientes en zonas de Africa Oriental donde este es el idioma de trabajo.
- Formacion y consulta de personal sanitario: uso como asistente de referencia offline para resolver dudas sobre terminologia y procedimientos medicos basicos en frances o ingles.
- Despliegue en puestos AfyaSpeak Desktop: el autor lo disena explicitamente para estaciones de trabajo de clinica, por lo que encaja en flujos de consulta local con `llama.cpp` u Ollama sin salida a red.
- Prototipado de asistentes medicos multilingues: util como base para experimentar con adaptaciones LoRA adicionales en contextos de bajos recursos, dado su formato GGUF y su tamano manejable.
- Investigacion sobre adaptacion linguistica de modelos medicos: el modelo y su proceso de ajuste (LoRA sobre 287 ejemplos) sirven como caso de estudio de ajuste de bajo presupuesto en idiomas africanos.
- Escenarios de evaluacion de robustez: por su brecha entre perdida de entrenamiento y validacion, es un candidato util para estudiar sobreajuste en modelos medicos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el autor indica un minimo de 8 GB de RAM para el artefacto Q4_K_M de 2382,37 MB; en GPU, la cuantizacion Q4_K_M de un modelo de 3,88B suele requerir del orden de 3-4 GB de VRAM, aunque este dato no esta confirmado en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada; el autor orienta el modelo a PC de escritorio y estaciones de trabajo, no a GPU de datacenter.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070), aunque no se documenta verificacion runtime ("Verified Runtime (Pending)").
- Opciones de despliegue: formato GGUF compatible con `llama.cpp`, Ollama y otros runners GGUF; el autor menciona `litert-torch` en el pipeline de entrenamiento y el tag `endpoints_compatible` en Hugging Face.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SautiLM-Kuu-Med | 3,88B | 4096 | Gemma License | GGUF Q4_K_M | Ajuste LoRA medico con 287 ejemplos; offline |
| `unsloth/medgemma-4b-it` (modelo base) | ~4B | no disponible | Gemma License | safetensors | Base directa; sin ajuste adicional de SautiLM |
| MedGemma 4B IT (Google) | ~4B | no disponible | Gemma License | safetensors | Modelo medico original de Google; referencia de calidad |
| Gemma 3 4B IT (Google) | ~4B | no disponible | Gemma License | safetensors, GGUF | Modelo generalista de la misma familia, sin especializacion medica |

La comparativa se limita a la familia de origen porque no se dispone de datos de benchmarks ni de modelos alternativos evaluados en la informacion proporcionada. La diferencia principal frente al modelo base es el ajuste LoRA y la cuantizacion GGUF; no hay evidencia publicada de que mejore al base en tareas medicas.

## Limitaciones y advertencias

- Corpus de entrenamiento extremadamente reducido (287 ejemplos), lo que implica un riesgo alto de sobreajuste y de generalizacion pobre a casos no vistos.
- Brecha notable entre perdida de entrenamiento (0,0869) y validacion (1,5162), indicativa de sobreajuste.
- Estado de verificacion runtime pendiente ("Verified Runtime (Pending)"); no hay evidencia publicada de que el artefacto funcione correctamente en produccion.
- Riesgo elevado de alucinacion en un dominio critico como el medico; no debe usarse como sustituto del juicio clinico.
- Cobertura linguistica limitada a frances, ingles y suajili; no se documenta soporte de otras lenguas.
- Ventana de contexto de 4096 tokens, insuficiente para historiales clinicos extensos o documentos largos.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse antes de cualquier despliegue productivo.
- Sin datos publicados de benchmarks, evaluaciones de seguridad ni sesgos; no hay evidencia independiente de calidad.
- El autor no documenta la procedencia ni la calidad de los 287 ejemplos de entrenamiento, lo que impide auditar el sesgo del corpus.
- No se documenta soporte de tool calling ni de agentes, lo que limita su integracion en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/sautilm/SautiLM-Kuu-Med
- Modelo base: https://huggingface.co/unsloth/medgemma-4b-it
- Sitio web de SautiLM: https://sautilm.com
- LosingTek: https://losingtek.com
