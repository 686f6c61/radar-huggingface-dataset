# Privoid-ai/Privoid-Confidential-1B

## Resumen

Privoid Confidential-1B es un adaptador LoRA entrenado por Privoid-ai sobre IBM Granite 4.0 1B, un modelo de lenguaje compacto de 1,63 mil millones de parametros publicado bajo licencia Apache-2.0. Su funcion es muy concreta: dada la politica de confidencialidad de una empresa y un fragmento de texto, el modelo determina que informacion es confidencial *bajo esa politica concreta*, identifica la regla que aplica y extrae el texto exacto que justifica la decision. Cuando la politica y el contexto no bastan para decidir, devuelve la etiqueta `needs_review` en lugar de forzar una respuesta.

A diferencia de un detector de PII clasico o de un sistema basado en palabras clave, el modelo lee e interpreta la politica: el mismo pasaje puede ser confidencial bajo una politica y permitido bajo otra. Esto resuelve un problema real en prevencion de fuga de datos (DLP), donde las politicas varian entre organizaciones y los filtros por regex o keywords fallan estrepitosamente. Los benchmarks publicados por el autor muestran una precision de decision del 96,9% en un test bloqueado de 2.274 ejemplos, frente al 40,4% de una linea base por keywords y el 37,3% del modelo base Granite con el mismo prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (IBM Granite 4.0 1B) |
| Parametros totales | 1,63B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (publicado en repositorio GGUF separado) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Adaptador safetensors (PEFT, 76 MB) y GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA con rango r=16 y alpha=32 aplicado a las capas de atencion y al MLP compartido del modelo base `ibm-granite/granite-4.0-1b` (revision `6a7381ba`). El entrenamiento usa perdida solo sobre los tokens del asistente (assistant-only loss), lo que evita que el modelo aprenda a generar el contenido de las entradas y centra la capacidad del adaptador en la tarea de clasificacion y extraccion. El adaptador pesa solo 76 MB, lo que lo hace trivial de distribuir y de cargar sobre el modelo base.

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO. La model card si documenta una metodologia de evaluacion rigurosa: un conjunto de desarrollo para el ajuste y un test set bloqueado de 2.274 ejemplos agrupados en 1.750 grupos de escenario y siete grupos de prueba, con criterios de aceptacion registrados antes de ejecutar la evaluacion, que se realizo una sola vez. Los grupos de prueba incluyen redacciones de reglas, categorias y plantillas de documento nunca vistas en entrenamiento, asi como casos adversariales (negaciones, hipoteticos, excepciones e instrucciones incrustadas).

## Capacidades

- Deteccion de informacion confidencial condicionada a una politica de empresa concreta, no a palabras clave genericas.
- Identificacion de la regla de la politica bajo la que cae cada fragmento confidencial.
- Extraccion de evidencia: devuelve el span exacto del texto que justifica la clasificacion (evidence span F1 de 0,941 en el test bloqueado).
- Etiqueta de abstencion `needs_review` cuando la politica y el contexto no permiten decidir (F1 de 0,980 en casos que la requieren).
- Salida estructurada y validable: 99,9% de salidas crudas validas segun los criterios de la evaluacion.
- Sensibilidad contrafactual: 94,4% de acierto en pares de conjuntos donde solo cambia la politica, lo que demuestra que lee la politica en lugar de memorizar patrones.
- Robustez frente a instrucciones incrustadas y marcadores de sistema falsos en el texto de entrada (98,5% de precision de decision).
- No es un detector de PII: su ambito es la confidencialidad de informacion de negocio segun politica.

## Casos de uso

- Prevencion de fuga de datos (DLP) en correo y mensajeria corporativa: se puede interponer el modelo como filtro que clasifica borradores salientes segun la politica de confidencialidad interna, bloqueando o marcando los que contengan informacion protegida con evidencia textual para el revisor.
- Revisacion asistida en flujos de aprobacion: gracias a la etiqueta `needs_review`, el modelo puede actuar como primera linea automatizada y derivar a un humano solo los casos ambiguos, reduciendo la carga de revision manual con una tasa de falsas alarmas del 0,3%.
- Cumplimiento normativo en plataformas de comparticion de ficheros: integracion en pipelines de subida de documentos para etiquetar automaticamente el nivel de confidencialidad segun la politica de cada departamento o cliente.
- Entornos edge y on-premise: con 1,63B de parametros y una version GGUF Q4_K_M que pierde solo 0,1 puntos de precision, es viable desplegarlo en maquinas sin GPU para organizaciones que no pueden enviar texto sensible a APIs externas.
- Auditoria y forense documental: el span de evidencia exacto permite construir registros auditables de por que un documento se clasifico como confidencial, util en procesos de compliance.
- Procesado por lotes de corpus historicos: clasificacion retroactiva de repositorios de documentos para aplicar politicas de retencion o cifrado, aprovechando la salida estructurada y la alta validez de formato (99,9%).
- Proteccion contra inyeccion de prompts: el grupo de prueba sobre instrucciones incrustadas y marcadores de sistema falsos (98,5% de acierto) lo hace adecuado para analizar texto no confiable procedente de terceros.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un test bloqueado de 2.274 ejemplos en 1.750 grupos de escenario:

| Sistema | Precision de decision | Doc F1 | Confidencial no detectado | Falsas alarmas | Evidence span F1 | Salida valida | needs_review F1 | Conjuntos contrafactuales correctos |
|---|---|---|---|---|---|---|---|---|
| Linea base por keywords | 40,4% | 0,191 | 87,7% | 11,6% | 0,119 | 100,0% | 0,000 | 0,4% |
| Granite 4.0 1B (base, mismo prompt) | 37,3% | 0,328 | 11,4% | 15,7% | 0,176 | 2,0% | 0,339 | 1,5% |
| Privoid Confidential-1B | 96,9% | 0,963 | 5,4% | 0,3% | 0,941 | 99,9% | 0,980 | 94,4% |
| Privoid Confidential-1B GGUF Q4_K_M | 96,8% | 0,961 | 6,2% | 0,3% | 0,929 | 99,7% | 0,985 | 93,6% |

Intervalos de confianza bootstrap por clusters al 95% para Privoid Confidential-1B: precision de decision 96,9% [96,1%, 97,7%]; evidence span F1 0,941 [0,925, 0,954]; tasa de confidencial no detectado 5,4% [3,8%, 7,3%]; falsas alarmas 0,3% [0,0%, 0,8%].

Precision de decision por grupo de prueba:

| Grupo de prueba | n | Keywords | Granite base | Privoid-1B | GGUF Q4_K_M |
|---|---|---|---|---|---|
| Tipos de politica familiares, pasajes nuevos | 313 | 44,4% | 39,3% | 99,7% | 99,7% |
| Redacciones de reglas y categorias retenidas | 308 | 44,8% | 38,3% | 99,7% | 99,7% |
| Categorias de confidencialidad retenidas | 292 | 45,5% | 43,5% | 89,0% | 88,0% |
| Plantillas y formatos de documento retenidos | 316 | 40,2% | 34,2% | 90,5% | 90,8% |
| Negacion, hipoteticos, excepciones | 250 | 58,4% | 27,2% | 99,6% | 100,0% |
| Instrucciones incrustadas / marcadores falsos | 261 | 36,0% | 41,0% | 98,5% | 97,7% |
| Entradas que requieren needs_review | 534 | 26,6% | 36,9% | 99,8% | 100,0% |

Los ocho criterios de aceptacion registrados antes de la evaluacion se cumplieron, incluida una perdida maxima de 3 puntos de precision para la version GGUF Q4_K_M (medida: 0,1 puntos). No existen comparaciones con modelos ajenos al experimento (por ejemplo, LLMs comerciales de mayor tamano) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, el modelo base Granite 4.0 1B (1,63B de parametros) en FP16 requiere en torno a 3,5-4 GB de VRAM; la version GGUF Q4_K_M ocupa aproximadamente 1 GB, mas el contexto, por lo que es ejecutable en CPU.
- GPUs recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM para el adaptador en precision completa (RTX 3060, RTX 4060 o superiores); no se requiere hardware de datacenter.
- Consumer GPUs: si cabe con holgura; incluso la version GGUF Q4_K_M funciona en portatiles sin GPU dedicada mediante llama.cpp.
- Opciones de despliegue: transformers (>= 4.56) con peft y accelerate mediante el paquete `privoid_confidential` incluido en el repositorio; GGUF para llama.cpp y derivados como Ollama o LM Studio. No se menciona soporte para vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Privoid Confidential-1B | LoRA sobre Granite 4.0 1B | 1,63B (adapter de 76 MB) | Confidencialidad condicionada a politica | Apache-2.0 | HF, safetensors + GGUF |
| Granite 4.0 1B (base) | Transformer denso | 1,63B | Uso general | Apache-2.0 | HF |
| Presidio / regex DLP | Reglas y NER | n/a | Deteccion de PII y patrones | Apache-2.0 (MIT en partes) | Open source |

No existen en la informacion disponible comparaciones directas con otros LLMs de clasificacion de confidencialidad; los unicos baselines publicados son la linea base por keywords y el modelo base Granite con el mismo prompt, ambos muy por debajo (37-40% frente a 96,9% de precision de decision).

## Limitaciones y advertencias

- Solo soporta ingles; la model card declara unicamente `en` como idioma, por lo que su uso con politicas o documentos en castellano no esta validado.
- No es un detector de PII: cubre confidencialidad de negocio segun politica, no datos personales; no debe usarse como sustituto de herramientas de anonimizacion.
- Rendimiento degradado en categorias de confidencialidad nunca vistas (89,0% de precision, 19,0% de casos confidenciales no detectados) y en plantillas de documento retenidas (90,5%, 16,4% no detectados); en dominios muy distintos a los de entrenamiento conviene medir antes de confiar.
- La tasa de confidencial no detectado global del 5,4% implica que, en produccion critica, el modelo debe complementarse con revision humana o controles adicionales; los errores de omision son el fallo mas costoso en DLP.
- Los benchmarks proceden de la propia model card del autor, evaluados una sola vez sobre un test bloqueado; no hay verificacion independiente publicada.
- La evaluacion y los umbrales de aceptacion fueron definidos con asistencia de un sistema de IA bajo delegacion del propietario del proyecto, segun documenta la propia model card.
- El modelo es muy reciente y con traccion minima (20 descargas y 1 like en el momento de la ficha), por lo que carece de comunidad, soporte y historial de produccion.
- La longitud de contexto maxima no esta documentada en la ficha; para documentos largos habra que verificar el limite heredado del modelo base.

## Enlaces

- Modelo (adaptador PEFT): https://huggingface.co/Privoid-ai/Privoid-Confidential-1B
- Version GGUF: https://huggingface.co/Privoid-ai/Privoid-Confidential-1B-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b
- Paper, blog o demo: no disponible
