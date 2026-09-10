# ningpy/redflag-denied-3b

## Resumen

Redflag-denied-3b es un modelo de extracción de información clínica publicado por el usuario ningpy. Se trata de un ajuste fino mediante LoRA (posteriormente fusionado) sobre Qwen/Qwen2.5-3B-Instruct, con 3.085.938.688 parámetros, cuyo único cometido es identificar los síntomas que un paciente niega explícitamente en un texto clínico o mensaje de paciente. Forma parte de un sistema de detección de banderas rojas médicas de cinco módulos especializados (síntomas, contexto, modificadores, negaciones y puertas poblacionales) que se combinan con un motor de reglas en Python.

El problema que resuelve es acotado pero crítico en triaje: distinguir entre "no se menciona un síntoma" y "el paciente niega activamente un síntoma". Un modelo generativo generalista tiende a confundir ambas situaciones, lo que en un contexto clínico produce falsos positivos y alertas innecesarias. Este módulo devuelve una salida JSON estricta con la clave `denied_symptoms` restringida a un conjunto cerrado de 83 tokens de síntomas.

Su relevancia actual deriva de dos factores: por un lado, demuestra que un modelo de 3.000 millones de parámetros puede resolver una tarea de extracción clínica con precisión superior al 90 % cuando se le da un prompt de sistema muy estructurado; por otro, está diseñado específicamente para inglés de Brunéi (Manglish), chino y malayo, un perfil multilingüe poco habitual en el ecosistema de modelos médicos. El repositorio tiene cero descargas y cero "likes" en el momento de la consulta, por lo que se trata de un artefacto de investigación con adopción prácticamente nula.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA fusionado sobre Qwen2.5-3B-Instruct |
| Parámetros totales | 3.085.938.688 (3,09 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantización | No disponible; el repositorio distribuye pesos en safetensors (6,2 GB, coherente con fp16). No se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (incluido inglés de Brunéi/Manglish), chino (zh) y malayo (ms) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura de partida es Qwen2, un transformer decoder-only con atención completa, normalización RMSNorm y embeddings rotatorios (RoPE), en su variante de 3.000 millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA de rango 32, alpha 64 y dropout 0,05, con módulos objetivo que cubren todas las proyecciones lineales del bloque de atención y del MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). Los adaptadores se fusionaron posteriormente en los pesos base, de modo que el repositorio contiene un modelo denso estándar, no un adaptador PEFT separado.

El entrenamiento consistió en 2 épocas con tasa de aprendizaje 2e-4, planificador coseno, 5 % de warmup y tamaño de lote efectivo de 32. Los datos son multilingües (inglés, chino y malayo) e incluyen partículas coloquiales del Manglish (`lah`, `kah`, `meh`) que el prompt de sistema instruye a ignorar. No se documenta el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicó RLHF o DPO adicional sobre el ajuste supervisado. La innovación técnica no reside en la arquitectura, sino en el diseño del prompt de sistema: define de forma explícita los disparadores de negación en tres idiomas, incluye ejemplos de entrada/salida y restringe la salida a un vocabulario cerrado de 83 síntomas, lo que reduce la variabilidad de la generación.

## Capacidades

- Extracción de síntomas negados a partir de texto libre clínico o mensajes de paciente, con salida en JSON estructurado bajo la clave `denied_symptoms`.
- Reconocimiento de múltiples patrones de negación en inglés (`no X`, `without X`, `denies X`, `hasn't had X`, `not X`).
- Reconocimiento de negación en chino (`但没有 X`, `没有 X`) y en malayo (`tiada X`, `tidak ada X`).
- Normalización de expresiones coloquiales del Manglish y del malayo hacia el vocabulario clínico cerrado: `sesak nafas` → `breathlessness`, `sakit dada` → `chest_pain`, `pengsan` → `fainting`, `sawan` → `seizure`, entre otras.
- Discriminación entre síntoma no mencionado y síntoma negado explícitamente (por ejemplo, `only headache` devuelve una lista vacía).
- Conversación multi-turno heredada del modelo base instruct, orientada a la resolución de negaciones a lo largo de varios mensajes.
- No se documentan capacidades de tool calling, function calling, uso de agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada a los tres idiomas declarados; no hay soporte documentado de castellano.

## Casos de uso

- Triaje hospitalario en urgencias: el módulo se ejecuta sobre la nota de admisión o el mensaje del paciente para registrar qué síntomas ha negado (por ejemplo, dolor torácico sin disnea), información que el motor de reglas usa para descartar rutas de alerta y evitar falsos positivos.
- Integración en el pipeline completo de banderas rojas: este módulo se combina con `redflag-symptom-3b`, `redflag-context-3b`, `redflag-modifier-3b` y `redflag-gate-3b` más el motor de reglas V20/V46; el resultado conjunto es el que alcanza las métricas publicadas, no el módulo aislado.
- Chatbot de triaje para pacientes en Brunéi y Malasia: el modelo entiende el registro coloquial (Manglish, malayo, chino) y devuelve estructura utilizable por un backend, lo que permite desplegar un asistente conversacional sin capa de normalización lingüística adicional.
- Estructuración retrospectiva de historiales clínicos: procesamiento por lotes de notas para convertir negaciones expresadas en texto libre en campos booleanos de un registro electrónico de salud (EHR), útil para auditoría clínica.
- Investigación epidemiológica: extracción sistemática de síntomas negados en corpus de notas para estudiar patrones de presentación atípica o sesgos de documentación.
- Telemedicina asíncrona: preprocesado de mensajes escritos por el paciente antes de que lleguen al clínico, generando un resumen estructurado de negaciones que reduce el tiempo de lectura.
- Modelo base para tareas afines de extracción estructurada: dado su tamaño reducido y su licencia Apache 2.0, sirve como punto de partida para ajustes LoRA en otros dominios con vocabulario cerrado.
- Filtrado de falsos positivos en un motor de alertas: si el sistema de extracción principal marca un síntoma, este módulo permite comprobar si el propio paciente lo había negado, degradando la severidad de la alerta.

## Benchmarks y rendimiento

La model card publica resultados de un conjunto de test independiente de 2.246 casos. Es importante subrayar que las métricas corresponden al pipeline completo de cinco módulos más el motor de reglas V46, no al módulo `denied` de forma aislada.

| Métrica | Precisión | Recall | F1 | Exactitud |
|---|---|---|---|---|
| PRIMARY (any_matched × labeled_matched) | 0,902 | 0,911 | 0,906 | 91,9 % |
| STRICT matched-only | 0,893 | 0,828 | 0,859 | 91,8 % |
| STRICT m+s | 0,844 | 0,905 | 0,873 | 92,1 % |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni métricas desagregadas por módulo. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados corresponden a portadas de prensa deportiva alemana sin relación alguna con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,2 GB solo de pesos, más caché KV; en la práctica, entre 7 y 8 GB para secuencias cortas.
- En cuantización de 8 bits: en torno a 3,5 GB de pesos. En 4 bits: en torno a 2 GB. Estas cuantizaciones no están publicadas en el repositorio y habría que generarlas.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y RTX 3090 sin problemas en fp16. En GPUs de 8 GB (RTX 3070, 4060) es viable en fp16 con contexto reducido o en cuantización de 8/4 bits.
- Para el pipeline completo de cinco módulos (aproximadamente 15.400 millones de parámetros en total) se necesitan del orden de 31 GB en fp16, lo que exige una A100 40 GB, una H100 o repartir la carga entre varias GPUs. En cuantización de 4 bits el conjunto bajaría a unos 8-9 GB.
- Opciones de despliegue: al ser un modelo transformers con pesos safetensors, es compatible con vLLM, TGI (la etiqueta `text-generation-inference` y `endpoints_compatible` aparece en el repositorio) y con el stack estándar de `transformers`. No hay GGUF publicado, por lo que Ollama y llama.cpp requerirían una conversión previa.
- Latencia y throughput: no disponibles. Al ser una tarea de extracción con `max_new_tokens=200` y decodificación greedy (`do_sample=False`), la latencia esperada es baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| redflag-denied-3b | 3,09 B | No especificado (base: 32.768 tokens) | Apache 2.0 | Extracción de síntomas negados en 83 categorías cerradas, EN/ZH/MS |
| Qwen2.5-3B-Instruct (modelo base) | 3,09 B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 (Qwen) | Asistente generalista multilingüe, sin especialización clínica |
| Llama-3.2-3B-Instruct | 3,21 B | 131.072 tokens | Llama 3.2 Community License | Asistente generalista multilingüe |
| Phi-3.5-mini-instruct | 3,82 B | 131.072 tokens | MIT | Asistente generalista con foco en razonamiento |

Nota: los datos de contexto y licencia de los modelos comparativos provienen de sus especificaciones públicas conocidas y no de la información proporcionada en esta consulta; conviene verificarlos antes de citarlos. No existe información pública que permita comparar el rendimiento de redflag-denied-3b frente a alternativas en la misma tarea, ya que no se han publicado métricas aisladas del módulo ni existen benchmarks estándar de extracción de negaciones clínicas multilingües con los que contrastarlo.

## Limitaciones y advertencias

- No es un modelo de propósito general ni un asistente conversacional: está especializado en una única tarea de extracción y su uso fuera de ese dominio no está validado.
- La salida depende de un vocabulario cerrado de 83 tokens de síntomas; cualquier síntoma fuera de esa lista no puede ser devuelto y quedará silenciosamente sin representar.
- El prompt de sistema es parte integral del comportamiento del modelo; usarlo sin el prompt documentado degrada la precisión de forma previsible.
- No es un dispositivo médico y no cuenta con aprobación regulatoria (CE, FDA ni equivalente). No debe utilizarse para diagnóstico ni para decisiones clínicas autónomas sin supervisión profesional.
- Riesgo de alucinación: al generar JSON, el modelo puede inventar claves, producir JSON malformado o incluir síntomas no presentes en el texto. Es imprescindible validar la salida con un parser estricto y un esquema.
- Las métricas publicadas corresponden al pipeline completo, no al módulo aislado; no deben atribuirse a este modelo de forma individual.
- Cobertura lingüística limitada a inglés, chino y malayo. No hay soporte de castellano, y el sesgo hacia el inglés de Brunéi (Manglish) puede reducir el rendimiento con inglés estándar de otros registros.
- Posibles sesgos derivados de los datos de entrenamiento, que no se documentan: no se especifica la distribución de casos, la procedencia geográfica ni la representación demográfica, por lo que no puede evaluarse el sesgo por edad, sexo, etnia o nivel socioeconómico.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el tratamiento de datos clínicos está sujeto a normativas de protección de datos (RGPD en la UE y equivalentes locales); el modelo no incorpora ninguna salvaguarda de privacidad.
- Adopción nula: cero descargas y cero "likes", sin validación independiente por parte de terceros.
- Discrepancia de identificadores: el repositorio consultado es `ningpy/redflag-denied-3b`, mientras que la model card hace referencia a `peiyan-ning/redflag-denied-3b` y a los módulos hermanos bajo ese mismo espacio de nombres. Conviene verificar cuál es el repositorio canónico.
- No se documentan datos de entrenamiento, número de tokens, composición del dataset ni proceso de alineación, lo que impide auditar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ningpy/redflag-denied-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del pipeline completo (motor de reglas V20, post-procesado y código de inferencia): https://git.evyd.tech/ai/redflag-detection-2.0
- Módulos hermanos citados en la model card (espacio de nombres `peiyan-ning`): `redflag-symptom-3b`, `redflag-context-3b`, `redflag-modifier-3b`, `redflag-gate-3b`
- Búsqueda web: no se encontraron resultados relevantes. Los enlaces devueltos (bild.de y sportbild.bild.de) no guardan relación con el modelo. No se han localizado papers, blogs ni demos asociados.
