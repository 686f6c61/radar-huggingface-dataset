# mradermacher/RxDecide-1.7B-GGUF

## Resumen

RxDecide-1.7B-GGUF es la version cuantizada en formato GGUF del modelo RxDecide-1.7B, desarrollado por el usuario nsk246 y cuantizado por mradermacher. Se trata de un modelo de lenguaje pequeno (1.720.574.976 parametros, aproximadamente 1,72 mil millones) orientado al ambito medico y farmaceutico: soporte a la decision clinica, deteccion de contraindicaciones, seguridad de farmacos y generacion de salidas estructuradas compatibles con FHIR. El modelo es un ajuste fino tipo LoRA sobre la familia Qwen3, segun indican las etiquetas de la model card.

El problema que aborda es concreto: en entornos clinicos, la informacion sobre interacciones y contraindicaciones medicamentosas es critica y debe presentarse de forma estructurada y calibrada. RxDecide se etiqueta explicitamente con "structured-outputs", "fhir" y "calibration", lo que sugiere que esta pensado para integrarse en flujos de trabajo donde la salida no es texto libre, sino datos procesables por sistemas de historia clinica electronica.

Su relevancia actual radica en el movimiento hacia modelos pequenos y especializados que pueden ejecutarse en hardware de consumo o en el borde (edge), reduciendo costes de inferencia y permitiendo despliegues on-premise en entornos sanitarios donde la privacidad es un requisito. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo no cuenta con validacion clinica publicada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen3 (segun etiquetas; detalle no disponible) |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo cuantizado por mradermacher); el modelo base nsk246/RxDecide-1.7B se distribuye en formato safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es nsk246/RxDecide-1.7B, un ajuste fino de la familia Qwen3. La etiqueta "lora" en la model card sugiere que el ajuste se realizo mediante Low-Rank Adaptation sobre un checkpoint Qwen3 preentrenado, en lugar de un entrenamiento completo desde cero. Dado el recuento de parametros, es coherente con una variante de aproximadamente 1,7B del catalogo Qwen3, aunque la model card no detalla la arquitectura interna (numero de capas, dimensiones, atencion, etc.).

En cuanto al entrenamiento, la model card no especifica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Las etiquetas incluyen "medical", "clinical-decision-support", "contraindications", "drug-safety", "structured-outputs", "fhir", "calibration" y "pre-registered-evaluation", lo que indica que el ajuste se oriento a tareas clinicas y farmaceuticas con evaluacion preregistrada. No se dispone de informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta "conversational").
- Soporte a la decision clinica: razonamiento orientado a recomendaciones medicas.
- Deteccion de contraindicaciones farmacologicas.
- Evaluacion de seguridad de farmacos (drug safety).
- Generacion de salidas estructuradas, presumiblemente en formatos procesables.
- Compatibilidad declarada con FHIR (Fast Healthcare Interoperability Resources), orientada a integracion con sistemas sanitarios.
- Calibracion como objetivo de diseno declarado (etiqueta "calibration").
- Modelo pequeno (SLM) optimizado para despliegue ligero.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Apoyo a la revision de prescripciones: el modelo puede analizar una lista de farmacos y senalar posibles contraindicaciones o interacciones, generando una salida estructurada que un profesional sanitario revisa antes de validar la prescripcion. Es adecuado por su ajuste especifico en contraindicaciones y seguridad de farmacos.

- Integracion en sistemas de historia clinica electronica mediante FHIR: al declarar compatibilidad con FHIR, puede emplearse para producir recursos estructurados que se inserten directamente en un HIS/HCE, reduciendo el trabajo manual de transcripcion.

- Asistente de consulta farmacologica para personal sanitario: desplegado on-premise, responde preguntas sobre seguridad de medicamentos en ingles, manteniendo los datos dentro de la infraestructura del hospital, algo relevante por la licencia Apache 2.0 y el tamano reducido del modelo.

- Triaje y cribado automatizado de informacion medicamentosa: procesamiento por lotes de textos farmaceuticos para extraer y clasificar menciones de contraindicaciones, gracias a su capacidad de salida estructurada.

- Generacion de resumenes clinicos estructurados: transformar notas o historiales en un formato normalizado, aprovechando la orientacion del modelo a salidas calibradas y compatibles con estandares.

- Prototipado e investigacion en NLP clinico: por su tamano (1,72B) y su empaquetado GGUF, sirve como banco de pruebas para experimentos de calibracion y evaluacion preregistrada en dominios medicos sin requerir GPU de datacenter.

- Despliegue en dispositivos con recursos limitados: dada su huella de memoria (desde 0,9 GB en Q2_K), puede ejecutarse en portatiles o estaciones de trabajo modestas dentro de un entorno clinico controlado, sin conexion a servicios en la nube.

- Filtrado y verificacion previa en pipelines de farmacovigilancia: uso como primera capa de deteccion de senales de riesgo en textos, con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del archivo; la VRAM real debe sumar el contexto/KV cache y el overhead del runtime, por lo que se recomienda al menos 1-2 GB adicionales):
  - Q2_K: 0,9 GB.
  - Q3_K_S / Q3_K_M: 1,0 GB.
  - Q3_K_L / IQ4_XS: 1,1 GB.
  - Q4_K_S / Q4_K_M: 1,2 GB.
  - Q5_K_S: 1,3 GB.
  - Q5_K_M: 1,4 GB.
  - Q6_K: 1,5 GB.
  - Q8_0: 1,9 GB.
  - f16: 3,5 GB.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente para las cuantizaciones intermedias; una RTX 3060, RTX 4060, RTX 4090 o incluso GPU integradas modernas pueden ejecutar el modelo. No requiere A100 ni H100, aunque estas tambien lo soportan sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas, e incluso en CPU mediante llama.cpp con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, llama-cpp-python. El soporte de vLLM para GGUF existe pero es experimental; para maxima compatibilidad se recomienda llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|---|
| RxDecide-1.7B (este modelo) | 1,72B | no disponible | Decision clinica / farmacos / FHIR | apache-2.0 | GGUF, safetensors | Referencia |
| Qwen3-1.7B (modelo base de la familia) | ~1,7B | no disponible en esta informacion | Proposito general | no disponible en esta informacion | safetensors, GGUF | No disponible |
| MedGemma (Google) | no disponible en esta informacion | no disponible | Medico multimodal | no disponible en esta informacion | no disponible | No disponible |
| BioMistral-7B | no disponible en esta informacion | no disponible | Medico textual | no disponible en esta informacion | no disponible | No disponible |

No se dispone de datos cuantitativos de rendimiento para establecer una comparacion numerica fiable. La comparacion con Qwen3-1.7B es pertinente porque RxDecide se construye sobre esa familia mediante LoRA; MedGemma y BioMistral se citan como alternativas de la misma categoria funcional (modelos medicos open weight), pero sus especificaciones no estan en la informacion proporcionada.

## Limitaciones y advertencias

- No es un dispositivo medico ni cuenta con validacion clinica publicada; no debe usarse para decisiones de diagnostico o prescripcion sin supervision profesional.
- Riesgo de alucinacion especialmente critico en el dominio farmacologico: una contraindicacion omitida o inventada puede tener consecuencias graves. Toda salida debe ser verificada contra fuentes oficiales.
- Idioma: soporta unicamente ingles, lo que limita su uso directo en entornos hispanohablantes sin traduccion previa o ajuste adicional.
- El modelo base es pequeno (1,72B), por lo que su capacidad de razonamiento complejo y su conocimiento factual son inferiores a los de modelos de mayor tamano. Es probable que falle en casos clinicos poco frecuentes.
- Las cuantizaciones bajas (Q2_K, Q3_K_*) pueden degradar la calidad de las salidas; para uso sensible se recomienda Q5_K_M o superior, o incluso f16.
- Licencia Apache 2.0: permite uso comercial, pero no exime de las responsabilidades regulatorias aplicables a software sanitario (por ejemplo, marcado CE o equivalentes).
- No hay informacion sobre sesgos demograficos del modelo ni sobre la composicion del dataset de ajuste, lo que impide evaluar su equidad en subpoblaciones.
- Ausencia de datos de benchmarks y evaluacion publica verificable en la informacion disponible.
- La model card del repo GGUF es de la herramienta de cuantizacion (mradermacher) y no aporta documentacion tecnica adicional sobre el modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RxDecide-1.7B-GGUF
- Modelo base: https://huggingface.co/nsk246/RxDecide-1.7B
- Pagina de descarga de cuantizaciones de mradermacher: https://hf.tst.eu/model#RxDecide-1.7B-GGUF
- Discusiones del modelo: https://huggingface.co/mradermacher/RxDecide-1.7B-GGUF/discussions
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
