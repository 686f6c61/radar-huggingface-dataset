# Jayant9928/pii-gate-qwen3.5-4b-nemotron

## Resumen

El modelo `Jayant9928/pii-gate-qwen3.5-4b-nemotron` no es un modelo generativo completo, sino una cabeza de decision calibrada que se acopla a `Qwen/Qwen3.5-4B`. Responde a una unica pregunta binaria: "¿contiene este texto PII o PHI que deba enmascararse?". Devuelve una probabilidad en una sola pasada hacia delante, sin generar texto, de modo que puede colcarse delante de un sistema caro de redaccion o anonimizacion y descartar el texto que con seguridad no contiene nada que enmascarar. Lo publica el usuario Jayant9928 (con cero descargas y cero likes en el momento de la consulta) y la tecnica subyacente es AnyJev L2, de Nokia Applied Research.

El artefacto es una cabeza lineal en forma cerrada sobre el estado oculto de Qwen3.5-4B. El modelo base no se modifica: el repositorio solo contiene la cabeza (~55 KB). El entrenamiento se hizo exclusivamente con el dataset sintetico y abierto `nvidia/Nemotron-PII` (CC BY 4.0), sin datos personales reales. La licencia de la cabeza es CC BY 4.0, mientras que el modelo base conserva la suya propia.

Su relevancia practica es de arquitectura de sistemas: en lugar de aplicar redaccion a todo el flujo, el gate permite saltarse entre el 25,4% y el 48,4% de los textos segun el riesgo de PII no detectada que se tolere, con una exactitud del 96,8-97,1% y un error de calibracion esperado (ECE) de 0,010. Es, por tanto, una pieza de triaje y no una herramienta de cumplimiento normativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza lineal en forma cerrada (AnyJev L2) sobre el estado oculto de `Qwen/Qwen3.5-4B`; el modelo base es un transformer (arquitectura concreta no disponible en la informacion proporcionada) |
| Parametros totales | Cabeza de ~55 KB; modelo base de 4B (segun nomenclatura del repositorio, no detallado en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de `Qwen/Qwen3.5-4B`) |
| Tipos de cuantizacion | No disponible (el artefacto es una cabeza en JSON; la cuantizacion aplicable es la del modelo base) |
| Idiomas soportados | Ingles (en) unicamente |
| Licencia | CC BY 4.0 (cabeza); el modelo base se distribuye bajo su propia licencia |
| Formato de pesos | JSON (`contains_phi.head.json`); requiere `anyjev>=0.2.0` y el modelo base descargado por separado |
| Tarea (pipeline) | `text-classification` |
| Dataset de entrenamiento | `nvidia/Nemotron-PII` (sintetico, CC BY 4.0) |
| Libreria | `anyjev` |

## Arquitectura y entrenamiento

La pieza no es un fine-tuning. AnyJev L2 construye una cabeza lineal en forma cerrada sobre el estado oculto de Qwen3.5-4B: la cabeza, la capa y la regularizacion se seleccionaron mediante validacion cruzada de 5 particiones, con una exactitud fuera de muestra del 96,8%. El modelo base queda intacto, por lo que no hay pesos generativos nuevos ni se altera su comportamiento en otras tareas. La inferencia es una unica pasada hacia delante con salida probabilistica calibrada, pensada para umbralizarse.

Los datos de entrenamiento son 13.935 ejemplos del split de entrenamiento de Nemotron-PII: registros completos y sus fragmentos naturales (parrafos, secciones de formulario), con un 50% de positivos y un 50% de negativos, emparejados por longitud y deduplicados, cubriendo 30 sectores, con datos estructurados y no estructurados, de Estados Unidos e internacionales. Un texto es positivo si contiene al menos un span de una etiqueta que deba enmascararse: 38 de las 55 etiquetas de Nemotron cuentan (nombres, fecha de nacimiento, datos de contacto, direccion postal, ciudad, condado, codigo postal, coordenadas, e identificadores como historial medico, plan de salud, SSN, numeros nacionales, fiscales, de cliente, de empleado, de cuenta, de tarjeta, de enrutamiento, licencias y matriculas, identificadores de dispositivo, biometricos y de vehiculo, IP, MAC, nombres de usuario, contrasenas, PIN, claves de API, CVV y cookies; `age` solo cuenta a partir de 90 anos). No cuentan fechas y horas ordinarias, pais, estado, empresa, ocupacion, educacion, situacion laboral, genero, raza o etnia, religion, idioma, grupo sanguineo, opinion politica ni sexualidad. El mapeo completo esta en `label_mapping.json`.

## Capacidades

- Clasificacion binaria de presencia de PII/PHI en texto en una sola pasada, sin generacion de texto.
- Devuelve una probabilidad calibrada que el integrador puede umbralizar segun su tolerancia al riesgo.
- Triaje previo a un paso de redaccion o anonimizacion, evitando procesar texto que probablemente no contiene nada que enmascarar.
- Procesamiento por lotes (`decide_batch`), con aproximadamente 65 decisiones por segundo en una GPU.
- Cobertura de 38 categorias de etiquetas de PII consideradas enmascarables, segun el mapeo del dataset Nemotron-PII.
- Cobertura de 30 sectores en los datos de entrenamiento, con texto estructurado y no estructurado, estadounidense e internacional.
- No ofrece tool calling, function calling, razonamiento multi-paso, vision, audio, modo thinking ni capacidades de agente.
- Capacidad multilingue: no; solo ingles.

## Casos de uso

- Triaje previo a redaccion automatizada: el gate se coloca delante del sistema de anonimizacion y descarta los textos con P(PII) baja antes de gastar computo en el paso caro. Con el umbral 0,0297 se saltan el 40,9% de los textos manteniendo la tasa de PII no detectada en el 0,5% o menos.
- Enrutado en pipelines de documentos: clasificar lotes de registros de negocio (contratos, formularios, tickets) para separar los que requieren revision de privacidad de los que pueden pasar directamente al proceso siguiente.
- Prefiltrado en ingesta de datos para entrenamiento: marcar que documentos de un corpus interno contienen datos personales antes de decidir si se excluyen o se anonimizan.
- Control de coste en plataformas de analitica documental: reducir el volumen de texto enviado al redactor cuando el presupuesto de computo o el tiempo de proceso son limitantes.
- Auditoria de flujos de datos: medir de forma sistematica que proporcion de documentos de un sistema contiene PII, usando el umbral como parametro ajustable segun el riesgo asumido.
- Etiquetado asistido en anotacion: preclasificar muestras para que los anotadores humanos revisen primero los casos con mayor probabilidad, acelerando la construccion de conjuntos etiquetados propios.
- Puerta de salida en entornos con datos sensibles: evitar que texto con identificadores abandone un dominio controlado sin pasar por el proceso de redaccion.

En todos los casos debe aplicarse la salvedad del propio autor: "No" significa "seguro que se puede saltar al nivel de riesgo elegido", nunca "este texto esta anonimizado". El bloque de redaccion debe seguir aplicandose a todo lo que el gate no descarte.

## Benchmarks y rendimiento

Resultados declarados sobre el split de test de Nemotron-PII: 4.976 ejemplos reservados, sin solapamiento con entrenamiento, 50% con PII/PHI, con positivos y negativos emparejados por longitud para que la longitud no revele la respuesta.

| Tasa de PII no detectada objetivo | Saltar cuando P(PII) ≤ | Textos saltados | Textos sin PII saltados |
|---|---|---|---|
| ≤ 0,1% | 0,0039 | 25,4% | 51% |
| ≤ 0,5% | 0,0297 | 40,9% | 81% |
| ≤ 1% | 0,0545 | 43,8% | 87% |
| ≤ 2% | 0,1899 | 48,4% | 96% |

Metricas adicionales declaradas: exactitud de 96,8-97,1% con umbral 0,5; error de calibracion esperado (ECE) de 0,010; aproximadamente 65 decisiones por segundo en una GPU.

No se han publicado en la informacion disponible resultados de benchmarks de uso general (MMLU, HumanEval, GSM8K ni equivalentes) para esta cabeza, y no son aplicables porque el artefacto no genera texto. Aviso del autor: estas cifras son en distribucion; en estilos documentales distintos de Nemotron-PII (por ejemplo, exportaciones EHR o XML muy basadas en plantillas) la cabeza transfiere mucho peor y se pueden saltar bastantes menos textos con la misma tasa de fallo.

## Requisitos de hardware

- Requiere cargar `Qwen/Qwen3.5-4B` completo para acceder a su estado oculto; la cabeza en si ocupa ~55 KB y no anade carga relevante.
- VRAM estimada para el modelo base: en el orden de 8-10 GB en precision de 16 bits y de 4-6 GB con cuantizacion de 8 bits (estimacion orientativa; no hay datos de VRAM publicados en la informacion disponible).
- GPU recomendadas: no indicadas por el autor. La unica referencia de rendimiento es de aproximadamente 65 decisiones por segundo en una GPU sin especificar.
- Encaje en GPU de consumo: probablemente si en tarjetas de 12-24 GB de VRAM para el modelo base segun cuantizacion (estimacion, no confirmada en la informacion disponible).
- Opciones de despliegue: el ejemplo oficial usa `anyjev.Decider` con el backend de HuggingFace (`anyjev.backends.hf.HFBackend`) y `anyjev>=0.2.0`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor declara aproximadamente 65 decisiones por segundo en una GPU; el procesamiento por lotes se realiza con `decide_batch`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados comparativos frente a clasificadores de PII/PHI alternativos ni frente a otros gates de triaje publicados, por lo que no se pueden contrastar parametros, contexto, rendimiento ni licencia con alternativas concretas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jayant9928/pii-gate-qwen3.5-4b-nemotron` | Cabeza ~55 KB sobre base de 4B | No disponible | Exactitud 96,8-97,1%; ECE 0,010; ~65 decisiones/s | CC BY 4.0 (cabeza) | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo ingles; el modelo no procesa otros idiomas.
- Entrenado exclusivamente con datos sinteticos; el autor recomienda validar con datos propios antes de fijar un umbral.
- La tasa de PII no detectada nunca es cero: hay que mantener la redaccion completa sobre todo lo que el gate no descarte.
- Transferencia limitada fuera de distribucion: en estilos documentales alejados de Nemotron-PII (EHR o XML muy basados en plantillas) se pueden saltar muchos menos textos con la misma tasa de fallo.
- Una pregunta y un modelo base: la cabeza solo funciona con `Qwen/Qwen3.5-4B` y con el texto de pregunta exacto almacenado en el artefacto. Debe usarse literalmente ese texto.
- No es una determinacion de cumplimiento normativo: no acredita HIPAA, GDPR ni ninguna otra normativa.
- Sesgos conocidos: no documentados de forma especifica en la informacion disponible mas alla del sesgo inherente al dataset sintetico Nemotron-PII (30 sectores, datos de EE. UU. e internacionales).
- Riesgo de alucinacion: no aplica como generacion de texto, pero si existe riesgo de clasificacion incorrecta que derive en PII no enmascarada.
- Restricciones de licencia: la cabeza es CC BY 4.0, lo que permite uso comercial con atribucion; el modelo base `Qwen/Qwen3.5-4B` se rige por su propia licencia, que debe verificarse por separado antes de un uso en produccion.
- El repositorio presenta cero descargas y cero likes en la fecha de consulta, y la fecha de creacion registrada es el 4 de octubre de 2026 con actualizacion el mismo dia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jayant9928/pii-gate-qwen3.5-4b-nemotron
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Repositorio AnyJev: https://github.com/nokia-applied-research/AnyJev
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces listados proceden de la informacion de HuggingFace y de la model card del autor.
