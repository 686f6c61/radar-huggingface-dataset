# BrazosDeDios/Apertus-8B-MeditronFO-Q4_K_M-GGUF

## Resumen

Apertus-8B-MeditronFO-Q4_K_M-GGUF es una conversión a formato GGUF del modelo EPFLiGHT/Apertus-8B-MeditronFO, un ajuste fino de dominio médico del modelo Apertus-8B. La conversión la ha realizado el usuario BrazosDeDios mediante el espacio GGUF-my-repo de ggml.ai, partiendo de los pesos publicados por EPFLiGHT. El resultado es un fichero único de aproximadamente 5 GB, pensado para inferencia local con llama.cpp en hardware de consumo, sin necesidad de GPU de datacenter.

El modelo resuelve el problema de desplegar un modelo médico especializado en entornos con recursos limitados: al estar cuantizado en Q4_K_M, reduce el peso de los 8.053.338.176 parámetros originales a un rango manejable en tarjetas gráficas de 8 a 12 GB de VRAM. El ajuste fino está orientado a contenido clínico y sanitario (etiquetas medical, clinical, healthcare) y se ha entrenado sobre el dataset EPFLiGHT/fully-open-meditron.

Es relevante ahora por dos motivos: la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, y el carácter "fully open" del linaje, que publica datos de entrenamiento junto al modelo. No obstante, la información disponible es muy escasa: la model card es la plantilla automática de GGUF-my-repo y no incluye detalles de arquitectura, contexto ni evaluación, por lo que debe consultarse siempre la ficha del modelo base antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Apertus-8B; la ficha no detalla la arquitectura interna) |
| Parametros totales | 8.053.338.176 (~8,05 B) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M en este repositorio; no se documentan otras variantes |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`apertus-8b-meditronfo-q4_k_m.gguf`), ~5,1 GB de repositorio |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El repositorio es una conversión de formato, no un entrenamiento: los pesos proceden de EPFLiGHT/Apertus-8B-MeditronFO, un ajuste fino (`base_model_relation: finetune`) sobre Apertus-8B. El dataset declarado es EPFLiGHT/fully-open-meditron, y el nombre del modelo y de sus etiquetas indican una especialización en dominio médico y clínico con filosofía de datos abiertos.

Tampoco se documentan el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron fases de RLHF, DPO o instrucción supervisada. La conversión a GGUF se ha realizado con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, un proceso automatizado que no incluye validación por parte del autor del modelo original ni del autor de la conversión.

## Capacidades

- Generación de texto en inglés con especialización declarada en contenido médico, clínico y sanitario.
- Respuesta a preguntas de dominio biomédico, presumiblemente por el ajuste fino sobre fully-open-meditron (no verificado con evaluaciones publicadas).
- Inferencia local mediante llama.cpp, con soporte de CLI (`llama-cli`) y servidor HTTP (`llama-server`).
- Compatibilidad declarada con *endpoints* (etiqueta `endpoints_compatible`), lo que permite exponer el modelo como servicio HTTP.
- Soporte de *tool calling* / *function calling*: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no documentadas; el *pipeline* es `text-generation`.
- Modo *thinking* o razonamiento extendido: no documentado.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.

## Casos de uso

- Asistencia a la redacción de notas clínicas: el modelo puede transformar un resumen de consulta en un borrador estructurado de nota, aprovechando el ajuste sobre corpus médico; requiere revisión humana obligatoria antes de incorporarlo a una historia clínica.
- Búsqueda y resumen de literatura biomédica: dado un abstract o un fragmento de artículo en inglés, generar un resumen con terminología correcta y extraer entidades relevantes (fármacos, dolencias, métricas).
- Formación y simulación para estudiantes de ciencias de la salud: generación de casos clínicos sintéticos y preguntas de autoevaluación, con la ventaja de que el modelo corre en local y no expone datos en servicios de terceros.
- Triaje conversacional de baja criticidad: primer filtro en un chat que clasifica consultas por especialidad y deriva al profesional adecuado, siempre con supervisión y sin emitir diagnóstico.
- Despliegue en entornos con requisitos de soberanía del dato: al ser un GGUF de ~5 GB bajo Apache 2.0, puede ejecutarse en una estación de trabajo aislada de la red, sin enviar información de pacientes fuera del perímetro.
- Prototipado rápido de aplicaciones sanitarias: integración en un servidor `llama-server` con API compatible con OpenAI para validar producto antes de invertir en un modelo mayor o en un proveedor externo.
- Extracción de información estructurada de informes en inglés: convertir texto libre en campos tipo JSON (edad, motivo de consulta, hallazgos) mediante *prompting*, sin necesidad de *fine-tuning* adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la ficha del repositorio GGUF ni los metadatos asociados incluyen métricas de MMLU, MedQA, MedMCQA, HumanEval, GSM8K ni similares, ni comparaciones con otros modelos. Tampoco se documenta el impacto de la cuantización Q4_K_M en la calidad respecto a los pesos originales en FP16/BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5,5-6,5 GB con Q4_K_M (pesos ~4,8 GB más caché KV); el cálculo exacto depende de la longitud de contexto configurada, que no está documentada.
- GPU de consumo: cabe en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080 y RTX 4090. En tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) es ajustado y puede requerir descarga parcial de capas a CPU.
- GPU de datacenter: A100 (40/80 GB) y H100 permiten lotes grandes y mayor contexto, aunque están sobredimensionadas para un modelo de 8 B en Q4.
- CPU y Apple Silicon: viable en modo CPU puro con llama.cpp; en Mac con memoria unificada de 16 GB o superior el modelo completo cabe en RAM/VRAM compartida.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), LM Studio y cualquier *runtime* compatible con GGUF. vLLM y TGI requerirían los pesos en safetensors del modelo base, no este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento clinico |
|---|---|---|---|---|---|
| Apertus-8B-MeditronFO (Q4_K_M, este repo) | ~8,05 B | no disponible | Apache 2.0 | GGUF | no disponible |
| Meditron-7B | ~7 B | no disponible | licencia del modelo base Llama 2 (verificar) | safetensors, GGUF comunitario | no disponible en esta ficha |
| BioMistral-7B | ~7 B | no disponible | Apache 2.0 (verificar en su ficha) | safetensors, GGUF | no disponible en esta ficha |
| OpenBioLLM-8B | ~8 B | no disponible | licencia derivada de Llama 3 (verificar) | safetensors, GGUF | no disponible en esta ficha |

Los datos de licencia y contexto de los modelos alternativos deben confirmarse en sus fichas oficiales antes de tomar una decisión; aquí se indican solo como orientación de categoría. No se dispone de evaluaciones comparativas verificadas que permitan afirmar superioridad de ninguno de ellos en tareas médicas.

## Limitaciones y advertencias

- No es un producto sanitario: no hay validación clínica, regulatoria ni certificación CE/MDR. No debe usarse para diagnóstico, prescripción ni decisiones terapéuticas sin supervisión profesional.
- Riesgo elevado de alucinación en dominio médico: el modelo puede generar referencias bibliográficas, dosis o interacciones farmacológicas plausibles pero falsas.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Contexto: la longitud de contexto no está especificada, lo que impide garantizar conversaciones multi-turno largas o procesamiento de documentos extensos.
- Conversión automatizada: el GGUF se ha generado con GGUF-my-repo, sin validación publicada de que la perplejidad o la calidad se mantengan respecto al modelo original.
- Trazabilidad y mantenimiento: el repositorio tiene 0 descargas y 0 *likes*, sin comunidad que lo respalde ni historial de versiones; el autor de la conversión no es el autor del modelo.
- Cuantización Q4_K_M: pérdida de precisión no medida; para tareas sensibles conviene evaluar los pesos originales en BF16 antes de adoptar esta variante.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base y el dataset fully-open-meditron no impongan condiciones adicionales sobre los datos.
- Cumplimiento normativo: en la UE, un uso clínico real encajaría en la categoría de alto riesgo del Reglamento de IA; el tratamiento de datos de salud exige base jurídica y medidas del RGPD.
- Sesgos: los sesgos del corpus médico de entrenamiento (poblaciones sobrerrepresentadas, sesgo de género en sintomatología) se trasladan al modelo y no han sido evaluados en la información disponible.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/BrazosDeDios/Apertus-8B-MeditronFO-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/EPFLiGHT/Apertus-8B-MeditronFO
- Dataset de ajuste fino: https://huggingface.co/datasets/EPFLiGHT/fully-open-meditron
- Espacio de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
