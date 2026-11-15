# masterofaudio2077/qwen3guard-gen-0.6b-egy-guardrail

## Resumen

Qwen3Guard-Gen-0.6B-Egy-Guardrail es un ajuste fino (fine-tune) del modelo Qwen/Qwen3Guard-Gen-0.6B, publicado por el usuario masterofaudio2077. Se trata de un modelo guardrail de 596 millones de parámetros diseñado para clasificar contenido como seguro o inseguro en funcion de una politica (policy) proporcionada en el propio prompt. El modelo emite una salida estructurada del tipo `veredicto | categorias violadas | motivo`, lo que lo convierte en un filtro de seguridad condicionado por politica en lugar de un clasificador binario estatico.

El modelo esta especializado en contenido en arabe (arabe estandar moderno, egipcio, golfo, levantino, magrebi y arabizi), asi como en texto mixto arabe-ingles y en frances. Esta orientacion cubre un hueco importante: la mayoria de los guardrails disponibles estan entrenados predominantemente en ingles y rinden mal en variantes dialectales arabes y en transliteracion arabizi. El ajuste fino se realizo sobre el dataset masterofaudio2077/arabic-egy-guardrail y declara una macro-F1 de 0,976 en el conjunto de test.

Con una licencia Apache 2.0 y un tamano compacto que permite ejecucion en una unica GPU de consumo, el modelo es relevante para equipos que necesitan desplegar moderacion de contenido multilinguee en produccion con latencia baja y sin depender de APIs externas. Su principal innovacion es la condicionalidad por politica: el mismo texto puede clasificarse de forma distinta segun las reglas de negocio o la politica de seguridad aplicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3), ajuste fino de Qwen/Qwen3Guard-Gen-0.6B |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, presumiblemente compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | ar (MSA, egipcio, golfo, levantino, magrebi, arabizi), en, fr; texto mixto arabe-ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del guardrail generativo Qwen3Guard-Gen-0.6B, que a su vez es un transformer decoder-only de la familia Qwen3 con 596 millones de parametros. La tarea se formula como generacion condicionada: el prompt incluye una instruccion fija (almacenada en `guardrail_config.json`), la politica de seguridad y el contenido a evaluar, y el modelo genera el veredicto, las categorias violadas y una justificacion textual. Ademas de la generacion, el modelo expone una probabilidad P(unsafe) calculada a partir de los logits del siguiente token para las palabras "safe" y "unsafe", con una temperatura de 1,59 ajustada sobre el conjunto de desarrollo.

El entrenamiento se realizo sobre el dataset masterofaudio2077/arabic-egy-guardrail (revision d9feb90b), orientado a contenido arabe dialectal y arabizi. La model card menciona el uso de Lion y Accelerate como parte del stack de entrenamiento. El modelo admite distintos objetivos de evaluacion (`judge_target`): mensaje de usuario, conversacion completa, respuesta del asistente, llamada a herramienta (tool call) y salida de herramienta (tool output). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion de seguridad condicionada por politica: el mismo contenido puede evaluarse contra politicas distintas y producir veredictos diferentes.
- Generacion de salida estructurada con veredicto, categorias violadas y motivo en texto libre.
- Evaluacion de multiples objetivos: mensajes de usuario, conversaciones multi-turno, respuestas de asistente, llamadas a herramientas y salidas de herramientas.
- Cobertura dialectal arabe: arabe estandar moderno, egipcio, golfo, levantino, magrebi y arabizi.
- Manejo de texto code-mixed arabe-ingles y soporte de frances.
- Calculo de probabilidad calibrada P(unsafe) mediante logits, apta para umbrales ajustables.
- Capacidad de razonamiento sobre la politica para justificar la decision (campo de motivo generado).
- Integracion con el ecosistema transformers y text-generation-inference (tags de endpoints compatibles).

## Casos de uso

- Moderacion de comunidades arabohablantes: el modelo puede filtrar mensajes de usuario en dialectos egipcio, golfo, levantino y magrebi, asi como en arabizi, escenarios donde los guardrails entrenados solo en ingles fallan sistematicamente.
- Filtrado de respuestas de asistentes conversacionales: evaluar la salida del propio asistente antes de mostrarla al usuario, usando `judge_target=assistant_response` para detectar contenido danino, sesgado o fuera de politica.
- Supervision de llamadas a herramientas en agentes: comprobar `tool_call` y `tool_output` para evitar que un agente ejecute acciones prohibidas o propague datos sensibles devueltos por una API.
- Cumplimiento de politicas personalizadas por producto: al ser condicionado por politica, un mismo despliegue puede servir a varias lineas de negocio con reglas distintas (por ejemplo, banca frente a redes sociales) sin reentrenar el modelo.
- Deteccion de fuga de PII en conversaciones: clasificar mensajes que contienen identificadores nacionales, telefonos o datos personales, con umbral ajustable segun la tolerancia al riesgo.
- Moderacion de contenido en frances y texto mixto: util para plataformas del Magreb o con comunidades bilingues frances-arabe.
- Pre-filtrado de bajo coste en pipelines de moderacion: al caber en una GPU de consumo y ejecutarse con decodificacion codiciosa (`do_sample=False`), puede actuar como primera etapa antes de revisores humanos o modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test de arabic-egy-guardrail (3424 filas de dominios no vistos; temperatura 1,59 ajustada en desarrollo). Datos no verificados de forma independiente.

| Metrica | @0.5 | Umbral ajustado en dev |
|---|---|---|
| Exactitud (acc) | 0,9761 | 0,9711 |
| Macro-F1 | 0,976 | 0,971 |
| Precision unsafe | 0,9808 | 0,9904 |
| Recall unsafe | 0,9687 | 0,9485 |
| F1 unsafe | 0,9747 | 0,969 |
| MCC | 0,952 | 0,9427 |
| ROC-AUC | 0,9975 | 0,9975 |
| PR-AUC | 0,9974 | 0,9974 |
| ECE | 0,0049 | 0,0049 |
| FPR a 95% TPR | 0,0084 | 0,0084 |
| NLL | 0,064 | 0,064 |
| Micro-F1 de categorias | 0,9462 | no disponible |
| Macro-F1 de categorias | 0,9463 | no disponible |
| Exactitud exacta de categorias | 0,9585 | no disponible |
| chrF del motivo generado | 40,8501 | no disponible |
| Concordancia veredicto generado | 1,0 | no disponible |
| Formato de generacion correcto | 1,0 | no disponible |
| Exactitud en pares flip | 0,915 | no disponible |

Comparativa declarada por el autor frente a alternativas:

| Modelo | Macro-F1 | Recall unsafe | ROC-AUC | ECE | Exactitud pares flip |
|---|---|---|---|---|---|
| tfidf text-only | 0,8965 | 0,9123 | 0,9501 | 0,0396 | 0,0 |
| Qwen3Guard original (tal cual) | 0,7914 | 0,8424 | 0,8763 | 0,075 | 0,0 |
| Qwen3Guard original + prompt de politica | 0,6782 | 0,4555 | 0,8245 | 0,1462 | 0,0915 |
| Fine-tune (mejor checkpoint) | 0,976 | 0,9687 | 0,9975 | 0,0049 | 0,915 |

El intervalo de confianza al 95% de la exactitud es de aproximadamente ±0,5 puntos.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 596 millones de parametros ocupan aproximadamente 1,2 GB de pesos; con cache KV y overhead de ejecucion, el consumo tipico se situa en torno a 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son validas. Para lotes grandes, A100/H100 ofrecen mayor throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 30/40 series, incluso modelos de gama baja con 6-8 GB).
- Opciones de despliegue: transformers (referencia oficial en la model card), text-generation-inference (el modelo declara compatibilidad con endpoints), y previsiblemente vLLM y llama.cpp/Ollama mediante conversion a GGUF, aunque estas ultimas no se mencionan explicitamente en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; al tratarse de un modelo de 0,6B con generacion limitada a 64 tokens nuevos, la latencia esperada es baja, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 (test declarado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3guard-gen-0.6b-egy-guardrail (este) | 596 M | no disponible | 0,976 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3Guard-Gen-0.6B (base) | 0,6 B | no disponible | 0,7914 (sin ajuste, en este test) | no disponible en la informacion | Hugging Face |
| tfidf text-only (baseline del autor) | no aplica | no aplica | 0,8965 | no disponible | baseline interno |

No se dispone en la informacion proporcionada de comparaciones con otros guardrails de la competencia (por ejemplo, modelos de moderacion de otras familias); los unicos datos comparativos son los declarados por el propio autor frente al modelo base y a un baseline TF-IDF.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- Se observan errores cualitativos documentados en la propia model card: falsos negativos en casos de fuga de PII (por ejemplo, un mensaje que reporta un DNI y un telefono ajenos se clasifico como seguro) y falsos positivos con alta confianza (un texto sobre desear una leccion a alguien se etiqueto erroneamente como deshonestidad academica con P(unsafe)=0,986).
- La calibracion depende de la temperatura 1,59 ajustada en desarrollo; usada fuera de ese dominio puede degradarse.
- El modelo esta especializado en arabe dialectal, arabizi, ingles y frances; su rendimiento en otros idiomas no esta documentado.
- La longitud de contexto no se especifica en la informacion disponible, lo que limita la planificacion de conversaciones largas.
- Riesgo de alucinacion en el campo de motivo generado: el chrF frente a los motivos del dataset es 40,85, lo que indica que las justificaciones son plausibles pero no identicas a las de referencia.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base Qwen3Guard-Gen-0.6B debe verificarse por separado para confirmar que sus terminos son compatibles con el uso previsto.
- Es un modelo de 0,6B: puede fallar en matices sutiles, sarcasmo o contextos culturales complejos; se recomienda combinarlo con revision humana en casos de alta confianza erronea.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/qwen3guard-gen-0.6b-egy-guardrail
- Modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/masterofaudio2077/arabic-egy-guardrail
- Configuracion del guardrail: archivo `guardrail_config.json` dentro del repositorio del modelo
- Figuras de benchmark, curvas, calibracion, slices, categorias y entrenamiento: carpeta `figures/` del repositorio del modelo
