# ningpy/redflag-context-3b

## Resumen

El modelo `ningpy/redflag-context-3b` es un ajuste fino por LoRA (posteriormente fusionado) de `Qwen/Qwen2.5-3B-Instruct`, desarrollado por el usuario ningpy, especializado en la extracción de contexto ambiental y mecanismo de lesión a partir de notas clínicas y mensajes de pacientes. Su función concreta es devolver un objeto JSON con una lista de etiquetas de contexto (`post_trauma`, `post_flight`, `outdoor_heat`, `substance_ingestion`, `drowning`, `venomous_bite`, etc.) dentro de un sistema de detección de banderas rojas médicas, no generar texto clínico libre.

Forma parte de un sistema de cinco módulos (síntoma, contexto, modificador, negación y puertas poblacionales) que se combina con un motor de reglas en Python (especificación V20, 59 reglas). El modelo está entrenado específicamente para inglés de Brunei (Manglish) con mezcla de malayo y chino, un nicho lingüístico muy poco cubierto por los modelos multilingües generalistas.

Con 3.085.938.688 parámetros (unos 3,09 mil millones) y licencia Apache 2.0, es relevante porque demuestra que un modelo de 3B puede resolver una tarea de extracción estructurada muy concreta en un dominio clínico multilingüe de bajos recursos, con un coste de despliegue bajo. La model card reporta métricas agregadas del pipeline completo (F1 de 0,906 en el escenario PRIMARY) sobre un conjunto de test independiente de 2246 casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Qwen2 (atención con Grouped Query Attention, RMSNorm, activación SwiGLU), ajustado con LoRA y fusionado |
| Parametros totales | 3.085.938.688 (dato real de los safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens según las especificaciones publicadas de Qwen2.5-3B-Instruct; la model card de este ajuste no lo indica |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (incluido inglés de Brunei/Manglish), chino (zh) y malayo (ms) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamaño del repositorio: 6,2 GB) |

## Arquitectura y entrenamiento

La base es `Qwen/Qwen2.5-3B-Instruct`, un transformer decoder denso de 3B parámetros. Sobre él se aplicó un LoRA con rango 32, alfa 64 y dropout 0,05, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento fue de 2 épocas, con tasa de aprendizaje 2e-4, planificador coseno y un 5% de warmup, con batch efectivo de 32. Los adaptadores se fusionaron en los pesos base, por lo que el repositorio contiene un modelo denso estándar y no requiere cargar un adaptador aparte.

El dataset de ajuste es multilingüe (inglés, chino y malayo) e incorpora partículas coloquiales de Manglish (`lah`, `kah`, `meh`, `ah`, `leh`, `lor`, `sia`, `one`) que el prompt de sistema indica explícitamente ignorar durante la extracción. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado. La innovación principal no es arquitectónica, sino de especialización: un prompt de sistema cerrado con enumeración de disparadores léxicos y ejemplos *few-shot* que fuerza al modelo a emitir únicamente un JSON con la clave `context_flags`.

## Capacidades

- Extracción de contexto estructurado: identifica 12 banderas de contexto o mecanismo (`post_trauma`, `post_surgery`, `post_flight`, `outdoor_heat`, `substance_ingestion`, `smoke_inhalation`, `chemical_exposure`, `cold_exposure`, `drowning`, `electrical_injury`, `venomous_bite`, `serious_assault`) y las devuelve como JSON.
- Salida en formato estricto: el contrato de salida es `{"context_flags": [...]}`, lo que facilita el consumo directo por parte de código Python.
- Comprensión multilingüe limitada al dominio: inglés, chino y malayo, con tolerancia a mezcla de idiomas dentro de la misma frase (code-switching).
- Robustez ante lenguaje coloquial: reconoce expresiones de Brunei English y malayo (`kena patuk ular`, `sesak nafas`, `pengsan`, `sakit dada`) y partículas conversacionales.
- Distinción entre descripción de contexto y pregunta genérica: ante entradas como "How is asthma treated?" devuelve una lista vacía en lugar de forzar una etiqueta.
- Uso conversacional básico heredado de la base instruct (formato de chat con `apply_chat_template`), aunque el modelo está orientado a extracción, no a diálogo abierto.
- Soporte de tool calling, function calling o agentes: no documentado en la información disponible; el sistema sí se integra en un pipeline con motor de reglas y posprocesado externo.
- Capacidades de visión, audio o modo de razonamiento explícito (*thinking*): no disponibles.

## Casos de uso

- Triaje de urgencias en centros de salud de Brunei y Malasia: el módulo extrae el mecanismo de la lesión a partir del texto libre del paciente y lo pasa al motor de reglas, que aplica las 59 reglas de la especificación V20 para determinar la prioridad.
- Recepción de pacientes por chat o WhatsApp: el modelo procesa mensajes coloquiales como "Kena patuk ular" y devuelve `venomous_bite`, activando la alerta correspondiente sin intervención humana.
- Historia clínica electrónica con texto no estructurado: se usa como paso de normalización que convierte notas narrativas en etiquetas de contexto consumibles por bases de datos relacionales y sistemas de alertas.
- Aplicaciones de telemedicina para zonas rurales: al ser un modelo de 3B con licencia Apache 2.0, puede desplegarse en hardware modesto en el propio centro sanitario, evitando enviar datos clínicos a servicios en la nube.
- Investigación epidemiológica y de salud pública: permite etiquetar retrospectivamente grandes volúmenes de notas clínicas para estudiar la incidencia de traumatismos, intoxicaciones o lesiones por calor.
- Detección de exposiciones laborales: las banderas `chemical_exposure` y `smoke_inhalation` permiten construir alertas automáticas en reconocimientos médicos de trabajadores expuestos a humos o productos químicos.
- Sistemas de apoyo a la decisión clínica: actúa como primer módulo de un pipeline de cinco etapas donde el resultado de contexto, síntomas, modificadores, negaciones y puertas poblacionales se combina antes de calcular la severidad.

## Benchmarks y rendimiento

Los datos publicados corresponden al pipeline completo de cinco módulos más el motor de reglas V46, evaluado sobre un conjunto de test independiente de 2246 casos. No se publican métricas aisladas de este módulo de contexto.

| Metrica (pipeline completo, 2246 casos) | Precision | Recall | F1 | Exactitud |
|---|---|---|---|---|
| PRIMARY (any_matched × labeled_matched) | 0,902 | 0,911 | 0,906 | 91,9% |
| STRICT matched-only | 0,893 | 0,828 | 0,859 | 91,8% |
| STRICT m+s | 0,844 | 0,905 | 0,873 | 92,1% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 aproximadamente 6,2 GB solo de pesos, más la caché KV; en cuantización de 8 bits unos 3,1 GB y en 4 bits alrededor de 1,8 GB.
- GPU recomendadas: NVIDIA A100 o H100 para despliegues concurrentes de alto rendimiento; L4 o A10G para servicio en producción con coste contenido.
- GPU de consumo: cabe con holgura en una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 en fp16, y en tarjetas de 8 GB si se convierte a una cuantización de 4 bits.
- Opciones de despliegue: la librería declarada es `transformers`; las etiquetas del repositorio incluyen compatibilidad con Text Generation Inference (`text-generation-inference`, `endpoints_compatible`), por lo que también es desplegable en Hugging Face Inference Endpoints. vLLM es compatible con arquitecturas Qwen2 densas. No se publican pesos GGUF, por lo que para usar llama.cpp u Ollama habría que realizar la conversión manualmente.
- Latencia y throughput: no disponibles.
- Consideración práctica: la salida está limitada a menos de 200 tokens nuevos en el ejemplo de uso, por lo que el cuello de botella suele ser el prompt de sistema (largo, con enumeraciones y ejemplos) y no la decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ningpy/redflag-context-3b | 3,09B | 32.768 tokens (heredado de la base) | F1 0,906 en el pipeline completo (2246 casos) | Apache 2.0 | Público en Hugging Face, 0 descargas y 0 likes en el momento del análisis |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | 3,09B | 32.768 tokens | No disponible en la información proporcionada | Apache 2.0 | Público en Hugging Face |
| Modelos generalistas de ~3B (por ejemplo, familias Llama 3.2 o Gemma 2 de tamaño equivalente) | ~3B | No disponible en la información proporcionada | No disponible en la información proporcionada | Licencias propias de cada familia | Públicos en Hugging Face |

No se dispone de datos comparativos de benchmarks entre este ajuste y alternativas de la misma categoría (extracción clínica estructurada en Manglish), por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Las métricas publicadas corresponden al sistema completo de cinco módulos más el motor de reglas, no a este módulo de forma aislada; atribuirle el F1 de 0,906 sería incorrecto.
- No es un producto sanitario: es un componente de extracción de información y no debe utilizarse como única base para decisiones clínicas diagnósticas o terapéuticas.
- Riesgo de alucinación: al ser un modelo generativo, puede emitir etiquetas fuera del conjunto de 12 banderas o JSON mal formado, algo que el ejemplo de uso mitiga con `json.loads` y que el pipeline resuelve con posprocesado, pero que no está garantizado por el modelo.
- Cobertura lingüística restringida: solo inglés (con foco en Brunei/Manglish), chino y malayo. No hay soporte documentado para castellano ni para otras lenguas.
- Dominio estrecho: fuera de la extracción de contexto clínico no se han evaluado sus capacidades de generación, razonamiento o código, y el ajuste por LoRA puede haber degradado el comportamiento generalista de la base.
- Trazabilidad limitada del dataset: no se documentan la composición, el origen ni el proceso de anotación de los datos de entrenamiento, lo que dificulta auditar sesgos.
- Adopción nula: el repositorio muestra 0 descargas y 0 likes, y existe una discrepancia en la nomenclatura entre el identificador del repositorio (`ningpy/redflag-context-3b`) y el que aparece en los ejemplos de código de la model card (`peiyan-ning/redflag-context-3b`), lo que puede provocar errores de carga.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y de cambios. La licencia no exime del cumplimiento de normativas de protección de datos sanitarios (por ejemplo, RGPD o normativa local de historiales clínicos).
- Ausencia de versionado o mantenimiento visible: no hay historial de revisiones ni garantía de soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ningpy/redflag-context-3b
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del pipeline completo (motor de reglas V20, posprocesado y código de inferencia): https://git.evyd.tech/ai/redflag-detection-2.0
- Módulos hermanos citados en la model card: `peiyan-ning/redflag-symptom-3b`, `peiyan-ning/redflag-modifier-3b`, `peiyan-ning/redflag-denied-3b` y `peiyan-ning/redflag-gate-3b` (referencias textuales de la model card; no se han verificado sus URL en la información disponible)
- Paper o publicación técnica asociada: no disponible
- Demo pública: no disponible
