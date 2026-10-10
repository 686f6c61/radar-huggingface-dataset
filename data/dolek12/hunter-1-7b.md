# dolek12/Hunter-1.7B

## Resumen

Hunter-1.7B es un ajuste fino mediante LoRA del modelo base XHToken/Spark-X2.5-1.7B, desarrollado por el usuario dolek12 y publicado en HuggingFace bajo licencia Apache 2.0. El modelo ha sido especializado en tareas defensivas de ciberseguridad: triaje de defensa, respuesta a incidentes y razonamiento causal sobre rutas de ataque. El adaptador LoRA se fusiono en los pesos base en BF16, por lo que el resultado es un modelo denso de 1.707.657.216 parametros (aproximadamente 1,7B) que ocupa 3,4 GB en el repositorio.

La relevancia de esta ficha es limitada pero concreta: se trata de un ejemplo de especializacion vertical de un modelo pequeno (rango 1-2B) sobre un dominio tecnico muy especifico como es la respuesta a incidentes. El autor documenta con detalle el proceso de entrenamiento (datos, hiperparametros, perdida) y, de forma notable, enumera las limitaciones conocidas del ajuste, incluyendo un fallo en la seleccion de capas objetivo del LoRA. No se han publicado resultados de benchmarks.

El idioma soportado es unicamente ingles (`en`) y la arquitectura declarada es `Spark2_5ForCausalLM`, que requiere `trust_remote_code=True` para su carga. Se trata de un modelo de generacion de texto conversacional, sin datos publicos sobre la longitud de contexto efectiva del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark2_5ForCausalLM (transformer causal; requiere trust_remote_code=True) |
| Parametros totales | 1.707.657.216 (~1,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base es XHToken/Spark-X2.5-1.7B con arquitectura `Spark2_5ForCausalLM`. Sobre el se aplico un ajuste fino LoRA con r=16, alpha=16 y dropout=0.05, dirigido exclusivamente a las proyecciones `gate_proj` y `up_proj` de las capas MLP, lo que supone 7,8 millones de parametros entrenables (0,45% del total). Segun la model card, la especificacion original preveia adaptar tambien las capas de atencion (`q_proj`, `v_proj`, `o_proj`), pero estos nombres no existen en esta arquitectura (usa un `q_k_v_proj` fusionado y un `out_proj`), por lo que las capas de atencion quedaron sin adaptar.

Los datos de entrenamiento consisten en 2.500 muestras del dataset `oi-uae/cyber-security` (configuracion `full`, split `train`), filtradas por `metadata.task_type` en los valores `causal_reasoning`, `offensive_security` e `incident_qa`. El formateo emplea etiquetas ChatML (`<|im_start|>role ... <|im_end|>`), con truncado a 1.024 tokens. La optimizacion se realizo durante 150 pasos, con batch global de 16 secuencias, learning rate 3e-4 con scheduler coseno, 15 pasos de warmup, precision BF16 y gradient checkpointing. La perdida final de entrenamiento fue de aproximadamente 1,0 (media de la ejecucion 1,21). El adaptador LoRA se fusiono en los pesos base en BF16. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento causal aplicado a rutas de ataque (causal attack-path analysis), segun el dominio de los datos de entrenamiento.
- Triaje defensivo y respuesta a incidentes (incident response, incident QA).
- Analisis de seguridad ofensiva (la model card indica que se incluyeron muestras de `offensive_security`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el entrenamiento usa formato conversacional mono-turno con contexto limitado a 1.024 tokens.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Triaje de alertas de seguridad: el modelo puede recibir una descripcion de alerta y devolver una clasificacion inicial o un analisis de causa raiz, aprovechando el entrenamiento sobre ejemplos de `causal_reasoning` e `incident_qa`.
- Asistencia a analistas SOC en primera linea: generacion de resumenes de incidentes y propuesta de pasos de contencion a partir de evidencias textuales.
- Analisis de rutas de ataque: reconstruccion de cadenas de causalidad entre eventos de un incidente para identificar el vector de entrada y la propagacion.
- Generacion de documentacion post-incidente: redaccion de informes tecnicos preliminares que un analista humano revisa y completa.
- Formacion y simulacion: uso como interlocutor en ejercicios de mesa (tabletop exercises) donde se plantean escenarios de respuesta a incidentes.
- Prototipado de asistentes de ciberseguridad: al ser un modelo de 1,7B bajo licencia Apache 2.0, permite experimentar en local y validar la viabilidad de un asistente conversacional especializado antes de escalar a modelos mayores.
- Clasificacion y enriquecimiento de texto de seguridad: categorizar tickets, correos de phishing o descripciones de vulnerabilidades en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 3,4-4 GB solo para los pesos, mas el overhead del runtime y la cache KV. Con 8 GB de VRAM hay margen suficiente para lotes pequenos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,7-2 GB. En 4 bits: aproximadamente 1-1,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente en BF16 o cuantizado. En entornos de servidor, A100, H100 o L40S cubren el modelo con amplio margen.
- Cabe en GPU consumer: si, de forma holgada, incluso en GPUs de gama media y en placas integradas con memoria unificada suficiente.
- Opciones de despliegue: al requerir `trust_remote_code=True` con arquitectura `Spark2_5ForCausalLM`, el soporte depende de que el runtime ejecute codigo remoto. No hay confirmacion en la informacion disponible de compatibilidad con vLLM, llama.cpp, Ollama o TGI. La carga mediante `transformers` con `trust_remote_code=True` es la via documentada por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo, por lo que no es posible comparar su rendimiento con alternativas. La siguiente tabla compara caracteristicas estructurales con modelos de rango similar; los datos de los comparadores no forman parte de la informacion proporcionada y se marcan como no disponibles cuando corresponde.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Hunter-1.7B | ~1,7B | no disponible | apache-2.0 | Ciberseguridad (triaje, IR, razonamiento causal) |
| XHToken/Spark-X2.5-1.7B (base) | ~1,7B | no disponible | no disponible | Modelo base generalista |
| Alternativas de rango 1-2B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las proyecciones de atencion no fueron adaptadas: los objetivos LoRA previstos (`q_proj`, `v_proj`, `o_proj`) no existen en esta arquitectura (usa `q_k_v_proj` y `out_proj`), por lo que la especializacion se limita a las capas MLP. Esto condiciona la efectividad del ajuste.
- Desajuste de plantilla de chat: el tokenizer incluye la plantilla nativa del modelo base, pero el entrenamiento uso etiquetas ChatML. Los prompts formateados con la plantilla incluida pueden no coincidir con el formato de ajuste fino, degradando las respuestas.
- Contexto de entrenamiento corto: el ajuste se realizo con secuencias de 1.024 tokens. El comportamiento en contextos mas largos no ha sido probado.
- Sin evaluacion: el modelo no ha sido evaluado en ningun benchmark, por lo que no existe evidencia cuantitativa de su calidad o de su mejora respecto al base.
- Riesgo de alucinacion: como cualquier modelo de este tamano entrenado sobre 2.500 muestras, puede generar informacion tecnica incorrecta o inventada en el dominio de seguridad.
- Las salidas no constituyen asesoramiento de seguridad y deben ser revisadas por un analista humano antes de cualquier uso operativo.
- Idioma: solo ingles; no soporta castellano ni otros idiomas.
- Sesgos: no documentados en la informacion disponible, pero el dataset de origen puede introducir sesgos propios de su composicion.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base XHToken/Spark-X2.5-1.7B, no disponible en la informacion proporcionada, ya que puede imponer condiciones adicionales.
- Numero de descargas cero y un solo like en el momento de la consulta: no hay validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dolek12/Hunter-1.7B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Dataset de entrenamiento citado: `oi-uae/cyber-security` (referencia textual en la model card; no se proporciona URL directa en la informacion disponible)
