# girenit/girenit-KVKK-Agent-4B

## Resumen

girenit-KVKK-Agent-4B v2 es un adaptador QLoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-4B para generar sugerencias estructuradas y citadas dentro de flujos de trabajo de cumplimiento de la KVKK (Kişisel Verilerin Korunması Kanunu, la ley turca de proteccion de datos personales). Lo desarrolla el usuario girenit y se publica como "research preview", es decir, una version de investigacion y no un producto validado. El adaptador no pretende ser un asesor legal autonomo: forma parte de un sistema mas amplio en el que los plazos los calcula un motor de reglas, el material juridico vigente se recupera de fuentes oficiales versionadas y cualquier accion con consecuencias exige revision humana autorizada.

La relevancia del modelo es acotada pero clara: cubre un nicho poco atendido (automatizacion de PrivacyOps en turco, con salidas en JSON validables y trazabilidad de citas) y esta alineado con un catalogo publicado de 51 flujos de trabajo, todos ellos incluidos en la puerta de liberacion. El entrenamiento se hizo exclusivamente con escenarios sinteticos deterministas, lo que limita su valor como referencia de precision en el mundo real, pero permite medir de forma reproducible propiedades como la validez de esquema, la tasa de fuga de datos personales o la negativa a actuar de forma autonoma insegura.

Con 4B parametros en el modelo base y un repositorio de 0,1 GB, es un adaptador ligero, desplegable en hardware de consumo y con licencia Apache 2.0. Los idiomas declarados son turco e ingles. No se han publicado resultados de benchmarks externos ni comparativas con modelos similares en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso: Qwen/Qwen3-4B |
| Parametros totales | Modelo base: 4B (aprox. 4 000 millones). Tamano del adaptador no disponible; tamano del repositorio: 0,1 GB |
| Parametros activos | No aplica: arquitectura densa, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (el adaptador hereda la ventana del modelo base, cuyas especificaciones no se detallan en la documentacion facilitada) |
| Tipos de cuantizacion | Entrenamiento con QLoRA, es decir, cuantizacion de 4 bits del modelo base durante el ajuste. No se enumeran cuantizaciones publicadas del adaptador |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no se publican pesos fusionados ni version GGUF |
| Version | v2, alineada al catalogo publicado de 51 flujos de trabajo |
| Modelo base | Qwen/Qwen3-4B |
| Dataset de entrenamiento | Escenarios sinteticos deterministas (el autor no publica el dataset de entrenamiento; si publica el conjunto de evaluacion girenit/girenit-KVKK-Bench) |
| Fecha de publicacion | 16 de septiembre de 2026 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

Tecnicamente no es un modelo completo, sino un adaptador LoRA entrenado con QLoRA sobre Qwen/Qwen3-4B. El modelo base es un transformer decoder-only denso de 4B parametros; el adaptador anade matrices de bajo rango sobre las proyecciones del modelo, lo que reduce drasticamente el numero de parametros entrenables y permite ajustar el modelo con recursos modestos. El autor no detalla el rango, los modulos objetivo ni la configuracion exacta de LoRA, ni el numero de tokens de entrenamiento.

El dato mas relevante del proceso de entrenamiento es su naturaleza: el adaptador se entreno unicamente con escenarios sinteticos deterministas, no con jurisprudencia real ni con textos legales en produccion. El material legal actual se obtiene en tiempo de inferencia mediante recuperacion sobre fuentes oficiales versionadas, y los plazos se delegan a un motor de reglas. Esta separacion de responsabilidades es una decision de diseno explicita del autor: el modelo genera sugerencias estructuradas y citadas, no decide plazos ni selecciona bases juridicas por si mismo. No se menciona el uso de RLHF, DPO ni preferencia humana en la informacion disponible.

La version 2 esta alineada con un catalogo publicado de 51 flujos de trabajo, y los 51 estan incluidos en la puerta de liberacion, lo que sugiere un proceso de validacion por contrato sobre esquemas y comportamientos esperados mas que una evaluacion abierta de calidad generativa.

## Capacidades

- Generacion de texto conversacional orientada a flujos de trabajo de cumplimiento de la KVKK, con salidas estructuradas en JSON.
- Generacion de citas: el autor reporta una precision de cita de 1,0 en las pruebas sinteticas de contrato, con referencias al material legal recuperado.
- Sugerencia de plazos dentro de flujos estructurados, con el calculo efectivo delegado a un motor de reglas externo (precision de plazo reportada de 1,0 en pruebas sinteticas).
- Salidas validadas contra esquema JSON (validez de esquema reportada de 1,0 en pruebas sinteticas).
- Control de fuga de datos personales: tasa de fuga reportada de 0,0 en las pruebas sinteticas.
- Negativa a actuar de forma autonoma en acciones consecuentes: rechazo de autonomia insegura reportado de 1,0 (no enviar notificaciones, no elegir base juridica, no firmar contratos, no borrar datos de produccion).
- Integracion en un sistema con puerta de revision legal humana obligatoria (legal_review_gate reportado de 1,0).
- Idiomas: turco e ingles.
- No se declaran capacidades de vision, audio, tool calling nativo, agentes multi-paso autonomos ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Triage de solicitudes de interesados en turco: el modelo puede clasificar y redactar respuestas borrador a peticiones de acceso, rectificacion o supresion dentro de flujos predefinidos, dejando la decision final y el envio al equipo legal.
- Generacion de borradores de registros de tratamiento (ROPA): a partir de datos estructurados de un sistema interno, el adaptador produce entradas con el esquema JSON esperado, listas para revision.
- Asistencia en evaluaciones de impacto (DPIA): el modelo propone secciones y estructura el analisis segun el catalogo de flujos, mientras el motor de reglas calcula plazos y la recuperacion aporta el texto legal vigente.
- Monitorizacion de plazos de respuesta: en lugar de confiar el computo al modelo, se usa para interpretar la peticion entrante y clasificarla, mientras el motor de reglas fija la fecha limite; el adaptador redacta el recordatorio y la justificacion citada.
- Soporte a equipos de PrivacyOps en mesas de ayuda internas: responde consultas de empleados sobre procedimientos internos de datos personales en turco, con citas, y escala al responsable cuando detecta una accion consecuente.
- Auditoria de contratos con encargados de tratamiento: el modelo propone observaciones estructuradas y senala clausulas a revisar, sin firmar ni aprobar nada de forma autonoma.
- Filtrado previo de texto para evitar fugas de datos personales en pipelines internos, aprovechando que el autor reporta tasa de fuga nula en sus pruebas sinteticas (debe reverificarse con datos propios antes de confiar en esta propiedad).
- Generacion de material de formacion interna sobre la KVKK a partir de escenarios sinteticos, con salidas citadas y revisables por el area legal.

## Benchmarks y rendimiento

El autor publica unicamente los resultados de su puerta de liberacion, que el mismo describe como pruebas de contrato sinteticas y deterministas, no como una estimacion de precision en el mundo real ni como una afirmacion de cumplimiento legal. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks academicos.

| Metrica (release gate) | Valor | Descripcion segun el autor |
|---|---|---|
| citation_precision | 1,0 | Precision de citas en pruebas sinteticas de contrato |
| deadline_accuracy | 1,0 | Precision de plazos en pruebas sinteticas de contrato |
| json_schema_validity | 1,0 | Validez de las salidas frente al esquema JSON |
| legal_review_gate | 1,0 | Activacion de la puerta de revision legal humana |
| pii_leak_rate | 0,0 | Tasa de fuga de informacion personal |
| unsafe_autonomy_refusal | 1,0 | Rechazo de acciones autonomas inseguras |

No se han publicado resultados de benchmarks independientes ni evaluaciones con datos reales en la informacion disponible.

## Requisitos de hardware

Estimaciones a partir del tamano del modelo base (4B); no son cifras publicadas por el autor.

- VRAM en FP16/BF16: aproximadamente 8-10 GB solo para pesos, mas KV cache y overhead; en la practica, 12-16 GB para uso comodo.
- VRAM con el modelo base cuantizado a 4 bits mas el adaptador LoRA: del orden de 4-6 GB, segun longitud de contexto y batch.
- GPU consumer viables: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB) con margen amplio. En tarjetas de 8 GB el modelo base en 4 bits puede caber, pero con contexto limitado.
- GPU de datacenter: A100 40/80 GB, H100, L40S; utiles sobre todo para servir muchas peticiones concurrentes o varias versiones del adaptador a la vez.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador sin fusionar; vLLM y TGI admiten adaptadores LoRA, lo que permite servir el modelo base una sola vez y conmutar adaptadores; llama.cpp u Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables. La tabla siguiente recoge lo que se puede afirmar con la informacion disponible.

| Modelo | Parametros | Longitud de contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| girenit-KVKK-Agent-4B v2 | Adaptador sobre un base de 4B | No disponible | Flujos KVKK, turco e ingles, salidas JSON citadas | Apache 2.0 | HuggingFace (0 descargas, 0 likes en la consulta) |
| Qwen/Qwen3-4B (modelo base) | 4B | No disponible en esta ficha | Modelo generalista multilingue, sin ajuste legal | Apache 2.0 | HuggingFace |
| Adaptadores legales turcos equivalentes | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion proporcionada |
| Modelos legales generalistas en otros idiomas | No disponible | No disponible | No comparable: no cubren KVKK ni turco | No disponible | No disponible |

La comparacion relevante es contra el propio modelo base: el adaptador anade especializacion en flujos KVKK y formato estructurado, a cambio de un alcance mucho mas estrecho y de un entrenamiento exclusivamente sintetico.

## Limitaciones y advertencias

- El propio autor declara que es una "research preview" y que no constituye asesoramiento legal ni acredita cumplimiento normativo.
- Los resultados de la puerta de liberacion (todos 1,0 o 0,0) provienen de pruebas de contrato sinteticas y deterministas; no son una estimacion de precision en escenarios reales y no deben citarse como tal.
- El entrenamiento se realizo solo con escenarios sinteticos deterministas: la generalizacion a casos reales, redacciones ambiguas o jurisprudencia no evaluada no esta demostrada.
- Riesgo de alucinacion juridica: aunque el sistema desacopla el calculo de plazos y la recuperacion de fuentes, el modelo puede generar citas o formulaciones plausibles pero incorrectas si se usa fuera del pipeline previsto.
- Sesgos: no se documenta ninguna evaluacion de sesgo. El modelo solo cubre turco e ingles, por lo que su uso con otros idiomas no esta soportado ni evaluado.
- Prohibiciones explicitas de uso autonomo: no debe enviar notificaciones, elegir base juridica, firmar contratos ni borrar datos de produccion por si solo. Cualquier accion consecuente requiere revision humana autorizada.
- Tasa de fuga de PII reportada de 0,0 en pruebas sinteticas: no es una garantia de que no se filtren datos personales con entradas reales; conviene anadir controles propios.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al ser un adaptador sobre Qwen3-4B conviene verificar tambien las condiciones del modelo base y las obligaciones derivadas de los datos tratados.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 0 likes, repositorio creado y actualizado el mismo dia): no hay evidencia externa de calidad, mantenimiento ni soporte.
- No se documentan requisitos de hardware, latencia ni throughput, lo que complica el dimensionamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/girenit/girenit-KVKK-Agent-4B
- Dataset de evaluacion citado: https://huggingface.co/datasets/girenit/girenit-KVKK-Bench
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper, blog, repositorio o demo adicionales: no disponibles. La busqueda web realizada no devolvio resultados relacionados con el modelo (los resultados obtenidos correspondian a previsiones meteorologicas y no guardan relacion con esta ficha).
