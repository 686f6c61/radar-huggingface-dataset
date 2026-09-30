# andreilungeanu/phishing-qwen3.5-2b-GGUF

## Resumen

El modelo `andreilungeanu/phishing-qwen3.5-2b-GGUF` es una conversion a formato GGUF del fine-tune `Davv4/phishing-qwen3.5-2b`, que a su vez deriva de `Qwen/Qwen3.5-2B`. El repositorio no entrena ni modifica pesos: unicamente convierte el modelo original a GGUF para su ejecucion con llama.cpp y publica tres niveles de cuantizacion (Q8_0, Q6_K y Q4_K_M). El objetivo del modelo es la deteccion de correo de phishing: recibe un correo con cabeceras y cuerpo, y devuelve un objeto JSON con veredicto booleano, puntuacion de confianza, tipo de amenaza, nivel de riesgo y razonamiento.

Se trata de un modelo pequeno, de 1.881.825.088 parametros (aproximadamente 1,88 mil millones, segun los pesos safetensors del repositorio base), lo que lo situa en la franja de modelos que se pueden ejecutar en CPU y en GPU de consumo. La ficha tecnica del modelo base no esta disponible en la informacion proporcionada, por lo que datos como la longitud de contexto nativa, la composicion del dataset de entrenamiento o el proceso de alineacion no se pueden verificar mas alla de lo que declara el autor de la conversion.

Su relevancia practica es doble. Por un lado, permite desplegar un clasificador de phishing especializado sin dependencias de Python ML (via llama.cpp u Ollama) y sin enviar el contenido de los correos a servicios externos, algo critico para equipos de seguridad que manejan datos personales. Por otro, la model card documenta con detalle el proceso de cuantizacion y una comprobacion de paridad frente al modelo original en transformers, incluyendo la deriva observada en Q4_K_M, algo poco habitual y util para decidir que cuantizacion usar en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; derivada de Qwen3.5-2B (el modelo base incluye torre de vision y cabeza MTP, excluidas en esta conversion) |
| Parametros totales | 1.881.825.088 (aprox. 1,88 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso de la model card emplea `-c 8192`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M (GGUF, sin imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |
| Tarea | text-generation / clasificacion de phishing con salida JSON |
| Tamano del repositorio | 4,8 GB |
| Descargas / likes | 0 / 0 |

Ficheros publicados:

| Fichero | Tamano | Notas |
|---|---|---|
| `qwen-phish-2b-Q8_0.gguf` | 2,01 GB | el mas fiel al original |
| `qwen-phish-2b-Q6_K.gguf` | 1,56 GB | aproximadamente 2x mas rapido que Q8_0 en CPU, deriva pequena |
| `qwen-phish-2b-Q4_K_M.gguf` | 1,27 GB | deriva notable; cambia veredictos |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion del modelo. La model card de esta conversion es explicita: el autor no ha retrenado ni alterado pesos, solo ha realizado la conversion y cuantizacion. El modelo base declara ser un fine-tune de `Qwen/Qwen3.5-2B` para deteccion de phishing de correo electronico, y el autor original del fine-tune no divulga el conjunto de datos de entrenamiento empleado. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineacion.

La conversion se realizo con llama.cpp `b9821` (commit `050ee92d04c2e1f639025786dea701c70e7d4204`): `convert_hf_to_gguf.py <src> --outtype f16 --no-mtp`, seguido de `llama-quantize` desde F16 a Q8_0, Q6_K y Q4_K_M, sin matriz de importancia (imatrix). El flag `--no-mtp` excluye la cabeza de prediccion multi-token, y la conversion es solo de texto: la torre de vision del modelo base no se incluye. Un detalle tecnico relevante es que el autor tuvo que usar transformers 5.17.0 en lugar de 4.57.6, porque esta ultima no puede cargar la configuracion de tokenizer del repositorio origen (`TokenizersBackend`); el codigo del conversor no se modifico. El template de chat (`chat_template.jinja`) es el del repositorio original y va embebido en cada GGUF.

## Capacidades

- Clasificacion de correo electronico como phishing o legitimo, con formato estricto: `{"is_phishing": boolean, "confidence_score": number (0.0-1.0), "threat_type": "string or null", "risk_level": "LOW|MEDIUM|HIGH|CRITICAL", "reasoning": "string"}`.
- Entrada en formato de campos de correo: `Sender`, `Receiver`, `Date`, `Subject` y `Body`.
- Campo `reasoning` con justificacion textual del veredicto, util para revision humana y para explicar la decision al usuario final.
- Clasificacion por nivel de riesgo en cuatro categorias (LOW, MEDIUM, HIGH, CRITICAL), lo que permite enrutado por severidad.
- Puntuacion continua alternativa: en lugar de parsear `confidence_score` (que toma pocos valores discretos), la model card propone abrir el turno del asistente, anadir `{"is_phishing":` y pedir un unico token con `n_probs`, calculando `p = P(" true") / (P(" true") + P(" false"))`.
- Modo thinking desactivable mediante `enable_thinking=false` en el template de chat; el autor recomienda desactivarlo.
- Capacidad conversacional generica heredada de Qwen3.5-2B, aunque el fine-tune esta orientado a la tarea de clasificacion.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso.
- No hay capacidades de vision: la torre de vision del modelo base queda fuera de esta conversion.
- Modelo unicamente en ingles; el resto de idiomas no esta validado.

## Casos de uso

- Filtrado previo en puerta de correo: el modelo actua como primera capa de clasificacion sobre el mensaje completo (remitente, asunto y cuerpo) y devuelve un JSON con nivel de riesgo que el gateway puede usar para etiquetar, cuarentenar o dejar pasar el mensaje antes de motores mas costosos.
- Analisis en local o on-premise: al ejecutarse con llama.cpp u Ollama, el contenido del correo no sale de la infraestructura de la organizacion, lo que facilita el cumplimiento de requisitos de proteccion de datos al procesar correspondencia de clientes y empleados.
- Triaje de correos reportados por usuarios: en un flujo tipo SOC, el buzon de reportes de phishing puede clasificar automaticamente cada muestra y priorizar por `risk_level` antes de que un analista humano la revise.
- Revision retroactiva de buzon (retro-hunting): procesamiento por lotes de correos historicos para localizar mensajes que pasaron los filtros anteriores; con cuantizacion Q6_K el consumo medido es de 1,9 GB de RAM y tiempos de CPU del orden de centenares de milisegundos por correo en el escenario de scoring documentado.
- Enriquecimiento de alertas en plataformas SOAR: la salida JSON es directamente parseable por automatizaciones que abren tickets, anaden etiquetas o aplican bloqueos, usando `threat_type` y `confidence_score` como campos de decision.
- Formacion y concienciacion: el campo `reasoning` permite mostrar al empleado por que un correo concreto se considera sospechoso, integrardo en campanas de simulacion o en herramientas internas de consulta.
- Deteccion de fraude del CEO (BEC) y de soporte tecnico falso: el formato de entrada acepta remitente y asunto, de modo que el modelo puede evaluar correos internos que suplantan a directivos o proveedores.
- Preetiquetado de corpus de seguridad: para equipos que construyen datasets de correo malicioso, el modelo puede servir como anotador inicial cuya salida se revisa despues manualmente.
- Despliegue en equipos con recursos limitados: con ficheros de 1,27 a 2,01 GB, es viable en portatiles y mini-PC sin GPU dedicada, ademas de en GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni de exactitud sobre un conjunto de evaluacion de phishing). Lo unico publicado es una comprobacion de paridad de la cuantizacion frente al modelo original ejecutado en transformers (bf16) sobre 50 correos reales (25 legitimos y 25 spam/phishing). El propio autor advierte que no es una prueba de exactitud, sino una medida de fidelidad de cada cuantizacion.

| Variante | Max / media de \|Δp\| | Mismo lado de 0.75 | Veredicto generado igual | ms de CPU por correo, 4 hilos (media / p95) | RAM |
|---|---|---|---|---|---|
| F16 (no subido) | 0,045 / 0,003 | 50/50 | 50/50 | no disponible | no disponible |
| Q8_0 | 0,244 / 0,013 | 50/50 | 49/50 | 1.687 / 3.225 | 2,3 GB |
| Q6_K | 0,415 / 0,025 | 49/50 | 50/50 | 753 / 1.364 | 1,9 GB |
| Q4_K_M | 0,982 / 0,112 | 45/50 | 42/50 | 1.035 / 1.616 | 1,6 GB |

Notas sobre la tabla: los tiempos de CPU son indicativos y corresponden a 10 correos mas cortos que la media, midiendo solo el scoring (sin generar el JSON completo). Los identificadores de token de los prompts renderizados coinciden exactamente con transformers en los 50 correos.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamano de fichero mas el sobrecoste de contexto y runtime: en torno a 1,3-1,6 GB para Q4_K_M, 1,6-1,9 GB para Q6_K y 2,0-2,4 GB para Q8_0. Son estimaciones derivadas del tamano de los GGUF, no cifras oficiales.
- RAM medida en la comprobacion de paridad (solo scoring, 4 hilos de CPU): 2,3 GB con Q8_0, 1,9 GB con Q6_K y 1,6 GB con Q4_K_M.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) puede alojar cualquiera de las tres cuantizaciones con contexto moderado. La GPU no es imprescindible: el modelo esta disenado para funcionar tambien en CPU.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para este tamano; solo tendrian sentido para servir muchas peticiones concurrentes por segundo.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama y, en general, cualquier runtime compatible con GGUF. Ejemplo de la model card: `llama-server -m qwen-phish-2b-Q8_0.gguf -c 8192 --jinja --chat-template-kwargs '{"enable_thinking": false}'`.
- vLLM, TGI u otros servidores orientados a safetensors no estan documentados para esta conversion GGUF.
- Latencia y throughput: los unicos datos disponibles son los tiempos de CPU por correo de la tabla de paridad (Q6_K con 753 ms de media y 1.364 ms en p95, con 4 hilos y solo scoring). No se publican medidas de throughput en GPU ni de generacion completa del JSON.
- Recomendacion de cuantizacion del propio autor: usar Q8_0 o Q6_K; Q4_K_M cambia algunos veredictos por completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `andreilungeanu/phishing-qwen3.5-2b-GGUF` (este) | 1,88 mil millones | no disponible | GGUF (Q8_0, Q6_K, Q4_K_M) | Apache-2.0 | Conversion para llama.cpp; incluye comprobacion de paridad por cuantizacion |
| `Davv4/phishing-qwen3.5-2b` (modelo base) | no disponible | no disponible | safetensors | Apache-2.0 | Fine-tune original de Qwen3.5-2B para phishing; dataset de entrenamiento no divulgado |
| `Davv4/phishing-qwen3.5-2b-gguf` | no disponible | no disponible | GGUF | Apache-2.0 | Version GGUF del mismo fine-tune optimizada para Ollama, sin dependencias de Python ML |
| `Qwen/Qwen3.5-2B` (modelo origen) | no disponible (denominado 2B) | no disponible | safetensors | Apache-2.0 | Modelo generalista; incluye torre de vision y cabeza MTP, ausentes en esta conversion |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato, licencia y notas de despliegue.

## Limitaciones y advertencias

- El autor original del fine-tune no divulga los datos de entrenamiento, por lo que no se puede auditar la composicion del corpus ni su sesgo.
- Sesgo de falsos positivos documentado: el modelo marca con frecuencia como phishing correos legitimos de marketing y notificaciones de cuenta de empresas reales.
- Tambien se producen falsos negativos: se le escapan algunos correos de phishing, segun reconoce la model card.
- No existe una evaluacion publicada de exactitud, precision o recall sobre un conjunto de referencia; la unica validacion es la comprobacion de paridad sobre 50 correos, que no mide calidad predictiva.
- Riesgo de alucinacion en el campo `reasoning`: es texto generado y puede justificar un veredicto con argumentos no verificados; conviene tratarlo como explicacion orientativa y no como evidencia.
- Cuantizacion: Q4_K_M altera veredictos (42 de 50 coincidentes en la comprobacion), por lo que no es adecuada si la decision tiene consecuencias. El autor recomienda Q8_0 o Q6_K.
- La puntuacion `confidence_score` toma pocos valores discretos; para una probabilidad continua hay que usar el procedimiento de un token con `n_probs` descrito en la model card.
- Idioma: solo ingles declarado; el rendimiento en correos en castellano u otros idiomas no esta validado.
- Contexto: no se publica la longitud de contexto soportada; correos muy largos pueden truncarse segun la configuracion del runtime. El ejemplo oficial usa 8192 tokens.
- Capacidades ausentes: no hay vision ni MTP en esta conversion; no se documenta tool calling ni uso agentico.
- Antes de usarlo en produccion, la propia model card recomienda validarlo sobre el correo propio de la organizacion.
- Licencia Apache-2.0, que permite uso comercial; deben conservarse los ficheros `LICENSE` y `NOTICE` y respetarse la atribucion a los autores originales del modelo y del fine-tune.
- Modelo con 0 descargas y 0 likes en el momento de redactar esta ficha, sin adopcion ni validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/andreilungeanu/phishing-qwen3.5-2b-GGUF
- Modelo base del fine-tune: https://huggingface.co/Davv4/phishing-qwen3.5-2b
- Version GGUF para Ollama del autor original: https://huggingface.co/Davv4/phishing-qwen3.5-2b-gguf
- Modelo origen: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de la serie Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio no oficial de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Ficha de Qwen3.5 2B en GGUF (directorio de terceros): https://local-ai-zone.github.io/models/qwen3-5-2b.html
