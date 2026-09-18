# cyberviser/hancock-v0.3.2-adapter-v4

## Resumen

Hancock v0.3.2 Adapter v4 es un adaptador LoRA (PEFT) publicado por el usuario cyberviser, vinculado al proyecto GLASSEYE, y entrenado sobre el modelo base mistralai/Mistral-7B-Instruct-v0.3. El adaptador está orientado a tareas de ciberseguridad, como indica su etiquetado (cybersecurity, hancock), y el propio autor lo posiciona como una actualización local mediante QLoRA sobre una GPU RTX 5070, partiendo de la versión anterior hancock-v0.3.2-adapter.

Se trata de un artefacto de pesos incrementales, no de un modelo completo: el repositorio ocupa 0,1 GB y contiene un adaptador en formato safetensors, por lo que requiere cargar el modelo base Mistral-7B-Instruct-v0.3 (7.250 millones de parámetros, ventana de contexto de 32.768 tokens) para poder ejecutarse. La model card es extremadamente breve y no documenta composición del dataset, hiperparámetros de LoRA, evaluación ni idiomas soportados.

Su relevancia es limitada y muy específica: es un ejemplo de ajuste fino ligero y de bajo coste sobre un modelo abierto de 7B para un dominio vertical (seguridad ofensiva/defensiva), reproducible en hardware de consumo. No obstante, con 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks publicados, debe considerarse un experimento en fase temprana más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base Mistral-7B-Instruct-v0.3. Rango, alpha y modulos objetivo no disponibles |
| Parametros totales | 7.250 millones en el modelo base; numero de parametros del adaptador no disponible (el repo ocupa 0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | No disponible para el adaptador. El autor menciona entrenamiento con QLoRA; el modelo base admite cuantizaciones de la comunidad (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible. La model card no declara idiomas; el modelo base esta orientado principalmente al ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Libreria | peft |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) que se aplica sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only de 7.250 millones de parametros con atención de ventana deslizante, RoPE, grouped-query attention y una ventana de contexto de 32.768 tokens. Al ser un adaptador PEFT, la arquitectura efectiva en inferencia es la del modelo base más las matrices de bajo rango inyectadas en las capas seleccionadas; el repositorio no publica la configuración de LoRA (rank, alpha, dropout, módulos objetivo), por lo que ese dato figura como no disponible.

Respecto al entrenamiento, la model card indica únicamente que se trata de un «QLoRA refresh» ejecutado en local sobre una «glasseye RTX 5070», inicializado desde el adaptador previo hancock-v0.3.2-adapter y usando el conjunto de datos denominado hancock_refresh_v4. Se reportan 250 pasos y una pérdida de entrenamiento aproximada de 1,03. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni qué proporción del corpus corresponde a contenido de ciberseguridad. Tampoco se documenta ninguna innovación técnica adicional más allá del propio ajuste QLoRA.

## Capacidades

- Generación de texto conversacional en el dominio de ciberseguridad, presumiblemente orientada a consultas técnicas sobre seguridad, según las etiquetas del repositorio.
- Hereda del modelo base la capacidad de instrucciones generales, razonamiento básico y generación de texto multi-turno.
- El modelo base Mistral-7B-Instruct-v0.3 incorpora soporte de function calling; se desconoce si el adaptador preserva esta capacidad íntegramente.
- Capacidad multilingüe: no disponible. La model card no declara idiomas soportados.
- Capacidades de visión, audio o modo «thinking» explícito: no disponibles; no se mencionan en la documentación.
- El autor recomienda un adaptador distinto, cyberviser/hancock-pentest-v4, para tareas de detección y threat hunting, lo que sugiere que este adaptador no está optimizado para esos casos de uso.

## Casos de uso

- Asistente interno de consultas de seguridad: desplegado sobre el modelo base, puede responder preguntas técnicas de triaje (por ejemplo, interpretación de alertas o explicación de conceptos de vulnerabilidades) reutilizando la ventana de 32.768 tokens para incluir contexto de incidentes largos.
- Apoyo a la redacción de informes técnicos: generación y resumen de documentación de hallazgos a partir de notas y volcados de herramientas, con el adaptador aportando terminología del dominio y el modelo base encargándose de la coherencia textual.
- Prototipado e investigación de ajuste fino: sirve como referencia reproducible de un pipeline QLoRA completo (adaptador inicial, refresco de datos, pérdida final) para equipos que quieran replicar el flujo con sus propios corpus de seguridad.
- Formación y concienciación: generación de escenarios y preguntas de práctica sobre conceptos de ciberseguridad para materiales internos de formación, siempre con revisión humana del contenido.
- Base para experimentos de composición de adaptadores: al ser un adaptador LoRA independiente, puede combinarse o compararse con otros adaptadores PEFT sobre el mismo modelo base para estudiar especialización por dominio.
- Automatización de resúmenes de documentación de seguridad: condensar avisos, políticas internas o notas de vulnerabilidades en resúmenes de longitud controlada dentro de un pipeline interno.

Advertencia: no debería emplearse para decisiones de seguridad automatizadas, análisis de malware en producción, pentesting real sin supervisión ni cualquier tarea donde un falso negativo tenga consecuencias graves, dado que no hay evaluación publicada que respalde su fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta una pérdida de entrenamiento aproximada de 1,03 tras 250 pasos, métrica que no es comparable con evaluaciones estandarizadas como MMLU, HumanEval o GSM8K y que no permite inferir capacidad real.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,1 GB en disco, pero requiere cargar Mistral-7B-Instruct-v0.3. Cifras orientativas para el modelo base: aproximadamente 14-15 GB en FP16/BF16, 8-9 GB en cuantización de 8 bits y 4-5 GB en 4 bits, más una sobrecarga mínima por el adaptador. No hay mediciones publicadas específicas para esta combinación.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio en FP16 con paralelismo; RTX 4090 (24 GB) para FP16 en una sola tarjeta; RTX 3090 (24 GB) igualmente viable.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más usando cuantización de 4 u 8 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 5070, RTX 4090). El propio autor entrenó el adaptador con QLoRA en una RTX 5070.
- Opciones de despliegue: PEFT + transformers como vía directa para cargar el adaptador; vLLM y Hugging Face TGI admiten adaptadores LoRA en servicio; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base para exportar a GGUF. No se publica ningún GGUF del adaptador.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hancock-v0.3.2-adapter-v4 | 7,25 B (base) + adaptador LoRA | 32.768 tokens (base) | No disponible | apache-2.0 | Repositorio HuggingFace, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.3 (modelo base) | 7,25 B | 32.768 tokens | Benchmarks publicados por el autor del modelo base | apache-2.0 | Ampliamente distribuido, con cuantizaciones de la comunidad |
| cyberviser/hancock-pentest-v4 | No disponible | No disponible | No disponible | No disponible | Repositorio HuggingFace; recomendado por el autor para detección y hunting |
| cyberviser/hancock-v0.3.2-adapter | No disponible | No disponible | No disponible | No disponible | Repositorio HuggingFace; versión previa del adaptador |

No se dispone de información sobre otros adaptadores de ciberseguridad comparables en los datos proporcionados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no publicarse la composición del dataset de ajuste, no es posible evaluar sesgos introducidos por el corpus de ciberseguridad empleado.
- Riesgo de alucinación: elevado y no cuantificado. Un modelo de 7B ajustado con solo 250 pasos sobre un dataset no descrito puede generar comandos, referencias a vulnerabilidades o procedimientos plausibles pero incorrectos, con especial riesgo en un dominio donde los errores tienen consecuencias de seguridad.
- Limitaciones de contexto e idioma: hereda la ventana de 32.768 tokens del modelo base, pero no hay información sobre idiomas soportados ni sobre el comportamiento fuera del inglés.
- Ausencia total de evaluación: no hay benchmarks, ni evaluación de seguridad, ni análisis de tasas de error publicados. Las 0 descargas y 0 likes indican además que no ha sido validado por la comunidad.
- Restricciones de licencia: el adaptador se publica bajo apache-2.0 y el modelo base también, por lo que el uso comercial es posible en principio; conviene verificar de todos modos la licencia del modelo base en su repositorio antes de un despliegue comercial.
- Caveats para producción: la documentación no especifica la configuración de LoRA, la composición del dataset ni los hiperparámetros, lo que dificulta la reproducibilidad. Tampoco se indica si el adaptador conserva el soporte de function calling del modelo base, aspecto crítico si se pretende integrar en pipelines de agentes.
- Riesgo de doble uso: un modelo especializado en ciberseguridad puede emplearse con fines ofensivos. No se documenta ningún filtro de seguridad ni evaluación de mitigación de uso malintencionado.
- La model card recomienda explícitamente otro adaptador del mismo autor para tareas de detección y threat hunting, lo que acota aún más el ámbito adecuado de este artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cyberviser/hancock-v0.3.2-adapter-v4
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Adaptador recomendado por el autor para detección y hunting: https://huggingface.co/cyberviser/hancock-pentest-v4
- Adaptador previo del que parte este entrenamiento: hancock-v0.3.2-adapter (referenciado en la model card; URL completa no disponible)
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados obtenidos corresponden a comparativas de software de diseño electronico (Autodesk EAGLE frente a Autodesk Fusion) y no guardan relacion con este adaptador.
