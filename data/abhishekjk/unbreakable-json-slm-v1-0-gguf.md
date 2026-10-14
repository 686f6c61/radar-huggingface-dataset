# Abhishekjk/Unbreakable-JSON-SLM-v1.0-GGUF

## Resumen

Unbreakable-JSON-SLM-v1.0 es un modelo de lenguaje especializado en extraccion determinista de JSON y encadenamiento de herramientas (tool calling) a partir de cargas utiles hostiles (HTML con trampas, OCR multiformato y logs de SIEM). Lo desarrolla el usuario Abhishekjk y se distribuye en formato GGUF bajo licencia Apache 2.0. El modelo parte de Qwen/Qwen2.5-3B-Instruct, un transformer denso de 3.085.938.688 parametros (3,09B) con Grouped Query Attention y soporte de contexto de hasta 32.000 tokens, y anade una capa semantica y de seguridad sobre la decodificacion restringida por gramatica.

El problema que aborda es concreto: los muestreadores con gramatica (Outlines, XGrammar, GBNF de llama.cpp) garantizan JSON sintacticamente valido, pero no impiden que el modelo extraiga un precio tachado o de un banner publicitario en lugar del precio activo, corrompa numeros europeos o suizos (1.450,50 EUR, CHF 2'100.00), alucine valores en campos anulables en lugar de emitir null o ejecute inyecciones de prompt ocultas en comentarios HTML. La propuesta del modelo es ejecutar una pasada explicita de verificacion esquema-a-carga util dentro de etiquetas think antes de emitir el JSON minificado.

Es relevante ahora porque el despliegue en entornos regulados (sanidad, FinOps, SecOps) exige procesamiento local sin llamadas a API externas, y la cuantizacion Q4_K_M de 1,93 GB permite ejecutarlo en menos de 2,5 GB de RAM o VRAM, incluso en equipos air-gapped. Se trata de una version 1.0 con repositorio publicado en octubre de 2026 y sin descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con Grouped Query Attention (GQA), derivado de Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 (3,09B) |
| Longitud de contexto | 32.000 tokens (soporte declarado en la model card del modelo base) |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos originales en BF16 Safetensors |
| Idiomas soportados | en, de, fr, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

La base es Qwen2.5-3B-Instruct, un transformer denso de 3,09B parametros con atencion de consultas agrupadas (GQA) y ventana de contexto de 32k tokens. Sobre esa base se aplico un pipeline de dos etapas: Supervised Fine-Tuning (SFT) seguido de Direct Preference Optimization (DPO). El conjunto de SFT consta de 5.830 filas validadas repartidas en cinco categorias de extraccion hostil (HTML profundo, OCR brutal con multicurrency, tool calling multiple, nulls estrictos y logs de SecOps), cubriendo 25 dominios empresariales. El conjunto de preferencias DPO contiene 1.500 pares elegido/rechazado orientados a senuelos de negativos duros, trampas de coercion de tipos e inyecciones de prompt adversariales.

La telemetria de entrenamiento reportada por el autor indica una trayectoria de perdida SFT de 1,418 a 0,218, con perdida media final de 0,3966. En DPO la perdida paso de 0,188 a 0,0046, con media final de 0,0380, una precision de recompensa del 100,0 % y un margen de recompensa de 11,27. La innovacion tecnica destacable no es arquitectonica sino de proceso de inferencia: el modelo estructura la salida en tres etapas declaradas (traza de razonamiento estructurado, emision de JSON minificado y un verificador de evidencia determinista opcional como post-procesador que audita cada valor hoja contra la huella lexica o numerica del origen y emite un informe de grounding por campo). Se espera un formato de prompt exacto con prompt de sistema fijo y plantilla de usuario delimitada por XML, con TARGET_SCHEMA y RAW_PAYLOAD.

## Capacidades

- Generacion de JSON minificado, sin fences de Markdown ni texto conversacional, conforme a un JSON Schema Draft 7 o 2020-12 proporcionado en el prompt.
- Desambiguacion semantica en HTML hostil: ignora etiquetas del y s, filas trampa con display:none, banners de upsell y tarifas historicas de referencia.
- Normalizacion de numeros multiformato y multilocale: convierte formatos europeos (1.450,50 EUR), suizos (CHF 2'100.00), estadounidenses (12.400,75 USD) y negativos contables entre parentesis (400.75) a numeros JSON limpios en coma flotante IEEE-754.
- Abstencion estricta con null: emite null literal cuando un campo anulable encuentra TBD, N/A, REDACTED, --not assigned-- o ausencia de evidencia, en lugar de alucinar cadenas o ceros.
- Defensa frente a inyeccion de prompt y escape de etiquetas: entrenado con DPO contra comentarios HTML adversariales, inyecciones script y cierres prematuros de la etiqueta de carga util.
- Encadenamiento multiple de herramientas: construye arrays ordenados y conformes al esquema de tool_calls, orientado a respuesta a incidentes y planes de failover de infraestructura.
- Extraccion de telemetria CVE para SecOps y SIEM.
- Capacidades multilingues en ingles, aleman, frances y castellano.
- Modo de razonamiento explicito mediante la traza de pensamiento previa a la emision del JSON.
- Verificacion de evidencia posterior opcional con informe de grounding a nivel de campo.

## Casos de uso

- Extraccion de precios en comercio electronico: el modelo recibe el HTML de una ficha de producto y un esquema con el campo de precio activo, y descarta precios tachados, banners de descuento y tarifas historicas gracias al entrenamiento contra senuelos, devolviendo el precio de checkout vigente.
- Normalizacion financiera multicurrency en FinOps: procesa facturas o extractos con formatos europeos, suizos y americanos y los convierte a numeros JSON homogeneos, evitando errores de separador decimal y de miles en pipelines contables.
- Procesamiento de OCR en sanidad bajo air-gapped: al ocupar 1,93 GB en Q4_K_M, se ejecuta localmente sobre historiales clinicos electronicos regulados sin enviar datos a APIs externas, abstrayendo con null los campos ilegibles o redactados.
- Triaje de logs SIEM y respuesta a incidentes: extrae telemetria de CVE desde logs crudos y genera un array ordenado de tool_calls conforme al esquema para disparar acciones de contencion o failover.
- Defensa frente a inyeccion indirecta en agentes: al ingerir contenido web no confiable, el modelo filtra instrucciones embebidas en comentarios HTML o etiquetas script antes de emitir la accion solicitada, reduciendo el riesgo de manipulacion del agente.
- Enriquecimiento de datos en pipelines ETL: integrado como paso de extraccion estructurada que produce JSON validado contra esquema, apto para carga directa en bases de datos relacionales o documentales sin post-procesado de limpieza.
- Automatizacion de formularios y tramites: mapea contenido heterogeneo a un esquema de campos anulables, forzando null en los ausentes, lo que facilita la validacion aguas abajo.
- Auditoria de extraccion con trazabilidad: el verificador determinista opcional genera un informe de grounding por campo que permite revisar si cada valor tiene respaldo lexico en la fuente, util en entornos con requisitos de compliance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay cifras de MMLU, HumanEval, GSM8K ni de tareas de extraccion estructurada). Los unicos datos de rendimiento reportados por el autor son las metricas de entrenamiento, que no son comparables con benchmarks estandar de evaluacion:

| Metrica de entrenamiento | Valor reportado |
|---|---|
| Perdida media final SFT | 0,3966 |
| Trayectoria de perdida SFT | 1,418 a 0,218 |
| Perdida media final DPO | 0,0380 |
| Trayectoria de perdida DPO | 0,188 a 0,0046 |
| Precision de recompensa DPO | 100,0 % |
| Margen de recompensa DPO | 11,27 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,93 GB con la cuantizacion Q4_K_M publicada; en torno a 6,2 GB para los pesos BF16 en safetensors, a lo que hay que sumar la cache KV segun la longitud de contexto.
- Cache KV: con GQA, el coste por token es reducido, pero crece de forma lineal con el contexto; a 32.000 tokens la cache puede anadir del orden de 1 GB adicional en precision de 16 bits.
- GPU recomendadas: cualquier GPU consumer moderna sirve, por ejemplo RTX 3060 de 12 GB, RTX 4070, RTX 4090; en servidor, A100 o H100 quedan sobredimensionadas para un modelo de 3B.
- Compatibilidad con GPU consumer: si, el modelo cabe con holgura en GPU consumer e incluso puede ejecutarse en CPU con la cuantizacion Q4_K_M usando menos de 2,5 GB de RAM.
- Opciones de despliegue: llama.cpp y Ollama para el fichero GGUF; vLLM para los pesos safetensors BF16; TGI para safetensors. Los repositorios estan etiquetados como endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion se establece con modelos de tamano y categoria similares. Los datos de los modelos alternativos corresponden a especificaciones publicas de sus respectivas familias y pueden variar entre versiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Unbreakable-JSON-SLM-v1.0 | 3,09B | 32.000 tokens | apache-2.0 | Safetensors BF16 y GGUF Q4_K_M |
| Qwen2.5-3B-Instruct | 3,09B | 32.000 tokens (ampliable con YaRN) | apache-2.0 | Safetensors y multiples cuantizaciones |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | Safetensors y GGUF |
| Phi-3.5-mini-instruct | 3,82B | 128.000 tokens | MIT | Safetensors y GGUF |

No se dispone de datos de benchmarks comparativos entre estos modelos y Unbreakable-JSON-SLM-v1.0 en la informacion proporcionada. La diferencia funcional frente a las alternativas es la especializacion: los modelos generalistas no incorporan entrenamiento especifico contra inyeccion de prompt, senuelos HTML ni normalizacion multiformato de numeros para extraccion JSON estricta.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documentan analisis de sesgo en la informacion proporcionada.
- Riesgo de alucinacion: mitigado por diseno mediante abstencion estricta con null y el verificador de evidencia opcional, pero no eliminado; un campo no anulable mal definido en el esquema puede recibir un valor sin respaldo.
- Dependencia del esquema: el comportamiento correcto exige proporcionar el JSON Schema y respetar el formato exacto de prompt con prompt de sistema fijo y etiquetas XML; desviarse del formato puede degradar la salida.
- Cobertura idiomatica: solo se declaran en, de, fr y es; otros idiomas no estan soportados de forma explicita.
- Contexto limitado a 32.000 tokens, inferior al de alternativas como Llama-3.2-3B o Phi-3.5-mini, que ofrecen 128.000; las cargas utiles muy extensas pueden requerir troceado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5-3B-Instruct, que conviene revisar.
- Madurez: es una version 1.0, sin descargas ni likes registrados, sin benchmarks publicos y con metricas de rendimiento limitadas a las de entrenamiento; no se recomienda su adopcion en produccion critica sin una evaluacion propia.
- Trazabilidad de metricas: la precision de recompensa DPO del 100 % y el margen de 11,27 corresponden al conjunto de preferencias de entrenamiento, no a una evaluacion independiente.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/Abhishekjk/Unbreakable-JSON-SLM-v1.0-GGUF
- Repositorio Safetensors BF16: https://huggingface.co/Abhishekjk/Unbreakable-JSON-SLM-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
