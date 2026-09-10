# alaqsaka/fine-tuning-slm-legal-chatbot-using-qwen

## Resumen

`alaqsaka/fine-tuning-slm-legal-chatbot-using-qwen` es un ajuste fino conversacional de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) construido sobre `unsloth/qwen2.5-1.5b-unsloth-bnb-4bit`, es decir, sobre la familia Qwen2.5 en su variante pequeña. Lo publica el usuario `alaqsaka` en HuggingFace con licencia Apache 2.0 y pipeline de `text-generation`. Por el nombre del repositorio, el ajuste está orientado a un chatbot de dominio legal, aunque la model card no documenta ni el corpus ni el procedimiento de entrenamiento empleado.

El modelo se entrenó con Unsloth y la librería TRL de HuggingFace, una combinación habitual para ajustes finos eficientes en memoria (QLoRA sobre una base cuantizada a 4 bits). Se trata de un transformer decoder-only denso, no de una arquitectura MoE ni híbrida, y los pesos publicados ocupan 3,1 GB en formato safetensors, lo que es coherente con un almacenamiento en fp16/bf16 (1,54 B × 2 bytes ≈ 3,09 GB).

Su relevancia es limitada pero concreta: es un ejemplo de ajuste fino de bajo coste sobre un SLM (small language model) para un dominio vertical, desplegable en hardware de consumo. Los contrapuntos son importantes: cero descargas y cero likes en el momento de la consulta, ausencia total de benchmarks, de documentación sobre el dataset y de evaluación de calidad, lo que lo sitúa en la categoría de artefacto experimental más que de modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (modelo denso) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-1.5B declara 32.768 tokens en su documentación oficial |
| Tipos de cuantizacion | No se publican variantes cuantizadas (ni GGUF ni GPTQ/AWQ). El modelo base empleado para el ajuste era bnb-4bit; los pesos publicados están en safetensors fp16/bf16 |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2, con las características habituales de esa familia en su modelo base: normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con query grouping (GQA). El modelo no incorpora mecanismos alternativos como SSM, atención lineal ni decodificación especulativa documentada. Con 1,54 B de parámetros y pesos en fp16/bf16, se trata de un modelo diseñado para inferencia en GPU de gama media o incluso en CPU con cuantización adicional.

El entrenamiento consistió en un ajuste fino supervisado con Unsloth y TRL sobre la versión ya cuantizada a 4 bits del modelo base (`unsloth/qwen2.5-1.5b-unsloth-bnb-4bit`), lo que apunta a un esquema QLoRA. No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF, DPO o preferencias, ni la hiperparametrización utilizada. El nombre del repositorio sugiere un corpus de dominio legal, pero esa información no se confirma en la model card. Tampoco se publican los adaptadores LoRA por separado ni métricas de pérdida durante el entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con el formato de chat de la familia Qwen2.
- Ajuste orientado a dominio legal según la denominación del repositorio (chatbot jurídico); el alcance real del ajuste no está documentado ni evaluado.
- Compatibilidad declarada con `text-generation-inference` (etiqueta `endpoints_compatible`), lo que facilita el despliegue con TGI.
- Carga directa mediante `transformers` y `pipeline("text-generation")`.
- Capacidades heredadas del modelo base Qwen2.5-1.5B (razonamiento básico, matemáticas sencillas, generación de código elemental), si bien no hay evidencia de que el ajuste fino las preserve o las degrade.
- Tool calling y function calling: no documentados en esta ficha; el modelo base Qwen2.5 sí los soporta, pero no hay confirmación para este ajuste concreto.
- Uso como agente o razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: la model card declara únicamente inglés, aunque el modelo base Qwen2.5 es multilingüe; el ajuste podría haber reducido el rendimiento en otros idiomas (olvido catastrófico), extremo no verificado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Triaje y clasificación de consultas legales: el modelo puede etiquetar consultas entrantes por área (laboral, civil, penal, mercantil) antes de derivarlas a un especialista humano, aprovechando su tamaño reducido para procesar volumen alto a bajo coste.
- Asistente interno de FAQ para un despacho: desplegado on-premise, permite responder preguntas recurrentes sobre procedimientos internos sin enviar datos de clientes a servicios en la nube, algo crítico por confidencialidad y secreto profesional.
- Borradores de documentos con revisión humana obligatoria: generación de primeros borradores de cláusulas o emails de respuesta a clientes, siempre con validación posterior por un abogado colegiado, dado el riesgo de alucinación normativa en un modelo de 1,5 B.
- Extracción de entidades en contratos: identificadores de partes, fechas, importes y cláusulas de renovación, integrados en un pipeline de procesamiento documental donde el modelo actúa como extractor y no como fuente de verdad.
- Prototipado e investigación en ajuste fino eficiente: sirve como caso de estudio reproducible de QLoRA con Unsloth sobre un SLM, útil para equipos que quieran replicar la receta con sus propios datos legales.
- Asistente educativo para estudiantes de Derecho: resolución de dudas introductorias y generación de casos prácticos de apoyo, con supervisión docente y advertencia explícita de que no sustituye a fuentes jurídicas oficiales.
- Clasificación y resumen de expedientes: resumen extractivo de resoluciones o contratos largos troceados en fragmentos, con la limitación de que la longitud de contexto efectiva del ajuste no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del autor no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K ni métricas específicas de dominio legal), ni comparación con el modelo base, ni métricas de pérdida del ajuste fino. Tampoco hay resultados de evaluación humana o automática publicados por terceros para este repositorio.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 3,1 GB solo para los pesos, más la caché KV y el overhead del runtime; en la práctica, entre 4 y 6 GB para inferencia con contextos moderados.
- VRAM estimada con cuantización de 8 bits: aproximadamente 1,6 GB de pesos; con 4 bits, aproximadamente 0,8-1,0 GB. Estas variantes no están publicadas y habría que generarlas el propio usuario.
- GPU recomendadas: cualquier GPU con 8 GB o más, como RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, así como A10G, L4 o T4 en entornos cloud. En A100 o H100 funcionaría, pero es sobredimensionado para 1,54 B de parámetros.
- Cabe holgadamente en GPU de consumo: sí, en cualquier modelo con 8 GB de VRAM o superior, e incluso en 6 GB en fp16 con contextos cortos.
- Opciones de despliegue: `transformers` de forma nativa, `text-generation-inference` (TGI) por la etiqueta `endpoints_compatible`, y vLLM, que soporta la arquitectura Qwen2. Para `llama.cpp` u Ollama sería necesario convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este repositorio concreto; los valores dependerán por completo del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto declarado | Licencia | Idiomas | Observaciones |
|---|---|---|---|---|---|
| alaqsaka/fine-tuning-slm-legal-chatbot-using-qwen | 1,54 B | No especificado (base: 32.768) | Apache 2.0 | Inglés | Sin benchmarks, 0 descargas; ajuste de dominio legal no documentado |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Multilingüe | Modelo base de referencia, con benchmarks publicados por el autor original |
| Llama-3.2-1B-Instruct | ~1,23 B | 128.000 tokens | Llama 3.2 Community License | Multilingüe (8 idiomas declarados) | Contexto muy superior; licencia con restricciones para grandes despliegues |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 tokens | Apache 2.0 | Inglés principalmente | Alternativa ligera con benchmarks publicados y ecosistema GGUF amplio |
| Gemma-2-2B-it | ~2,6 B | 8.192 tokens | Gemma Terms of Use | Multilingüe | Mayor tamaño efectivo; licencia no equivalente a Apache 2.0 |

La comparación en calidad no puede establecerse porque este ajuste no publica ninguna métrica. La ventaja diferencial del repositorio es únicamente la licencia permisiva junto con un supuesto enfoque legal, no verificable con la información disponible.

## Limitaciones y advertencias

- Tamaño muy reducido para dominio jurídico: con 1,54 B de parámetros el riesgo de alucinación normativa es alto; puede citar artículos, sentencias o plazos inexistentes con total seguridad aparente.
- Ausencia total de evaluación: no hay benchmarks, ni comparación con el modelo base, ni validación por terceros. No es posible afirmar que el ajuste haya mejorado nada.
- Dataset de entrenamiento desconocido: se desconoce la procedencia, licencia y calidad de los datos legales empleados, lo que impide evaluar sesgos y cumplimiento normativo.
- Riesgo de olvido catastrófico: el ajuste sobre una base cuantizada a 4 bits puede haber degradado capacidades generales (matemáticas, código, multilingüismo) sin que existan métricas que lo confirmen.
- Restricción de idioma: solo se declara inglés, lo que limita su uso directo en castellano sin un ajuste adicional.
- Sin variantes cuantizadas publicadas: quien quiera desplegarlo con llama.cpp u Ollama debe realizar la conversión a GGUF por su cuenta.
- Confidencialidad y RGPD: cualquier uso con datos personales o de clientes exige despliegue controlado, registro de tratamiento y evaluación de impacto; el modelo no incorpora filtros de privacidad.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones adicionales, incluyendo el modelo base de Unsloth, también Apache 2.0. No obstante, el autor no ofrece ninguna garantía de funcionamiento.
- No constituye asesoramiento jurídico: cualquier salida debe ser revisada por un profesional cualificado antes de ser utilizada frente a un cliente o ante un tribunal.
- Adopción nula: cero descargas y cero likes en el momento del análisis, lo que significa que no existe comunidad que haya replicado o validado el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alaqsaka/fine-tuning-slm-legal-chatbot-using-qwen
- Modelo base: https://huggingface.co/unsloth/qwen2.5-1.5b-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace: https://github.com/huggingface/trl

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; las páginas recuperadas correspondían a documentación de soporte de Windows y no guardan relación con el repositorio. No se han localizado papers, blogs, demos ni hilos de discusión asociados a este ajuste fino.
