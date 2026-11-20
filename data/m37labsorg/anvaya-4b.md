# M37labsorg/Anvaya-4B

## Resumen

Anvaya-4B es un ajuste fino (fine-tune) del modelo Qwen3-4B-Instruct-2507 en su variante ya cuantizada a 4 bits para MLX, publicado por M37labsorg. El objetivo declarado por el autor es especializar un modelo pequeno de 4B parametros en una unica tarea: leer contratos comerciales y devolver JSON estructurado con las clausulas detectadas, ancladas a fragmentos literales del texto de entrada (span-grounded), para 20 tipos de clausula de alto valor contractual. El modelo esta pensado para ejecucion on-premise en Macs con Apple Silicon y 8 GB de memoria unificada o mas.

Tecnicamente se trata de un transformer denso de 4.022.468.096 parametros (segun los safetensors reales del repo), derivado del checkpoint de Qwen3-4B-Instruct-2507 cuantizado a 4 bits por mlx-community. Sobre esa base se aplico un pipeline de tres etapas documentado en la model card: un SFT (job 11) seguido de dos rondas de DPO (jobs 12 y 13), con perdidas de validacion finales de 0,178, 0,175 y 0,019 respectivamente. El resultado se distribuye como adaptador LoRA fusionado en formato MLX safetensors, con un tamano de repositorio de 2,3 GB.

Su relevancia es acotada pero concreta: demuestra un flujo de trabajo reproducible de especializacion de un SLM (small language model) sobre hardware de consumo, con una salida fuertemente restringida por un system prompt integrado en la plantilla de chat. No es un modelo de proposito general ni compite en benchmarks abiertos; es una herramienta de extraccion de informacion contractual con un contrato de salida muy definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino con LoRA sobre base MLX cuantizada a 4 bits |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-Instruct-2507; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | 4 bits (checkpoint base ya cuantizado); no se documentan otras variantes |
| Idiomas soportados | no disponible (la model card no declara idiomas; la tarea y el system prompt estan en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/Qwen3-4B-Instruct-2507-4bit`, un Qwen3 de 4B parametros en variante instruct ya cuantizada a 4 bits para el framework MLX de Apple. Sobre esa base se aplico un ajuste fino con LoRA mediante la herramienta SLM Forge, en tres etapas encadenadas segun la model card: una etapa de SFT (job 11) con `train_loss` 0,051, `peak_mem_gb` 3,55 y `val_loss` final 0,178 partiendo de 1,717; una primera etapa de DPO (job 12) con `train_loss` 0,009, `peak_mem_gb` 6,45, `reward_accuracy` 1,0 y `val_loss` final 0,175; y una segunda etapa de DPO (job 13) con `train_loss` 0,274, `peak_mem_gb` 6,43, `reward_accuracy` 0,8 y `val_loss` final 0,019.

El volumen de datos de entrenamiento es reducido: la model card menciona "unos pocos miles de ejemplos" para la tarea, y especifica que 200 ejemplos de entrenamiento fueron escritos o revisados por un modelo de OpenAI, con las condiciones de uso de OpenAI aplicandose a esos outputs. No se detalla la composicion del dataset, el numero de tokens de entrenamiento ni la mezcla de datos. La innovacion tecnica principal no esta en la arquitectura sino en el diseno de la tarea: un system prompt integrado en la plantilla de chat que fuerza la salida a un unico esquema JSON con 20 tipos de clausula fijos, reglas de coherencia (si `present == false` entonces `evidence_span` y `value` son `null`; si `present == true` el `evidence_span` debe ser una subcadena literal de la entrada; los `clause_type` deben ser unicos dentro del array) y un campo de confianza numerico por clausula.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas de la base Qwen3-4B-Instruct-2507.
- Extraccion estructurada de clausulas contractuales: devuelve JSON con `clause_type`, `present`, `value`, `evidence_span` y `confidence` para 20 tipos predefinidos (ley aplicable, fecha de entrada en vigor, fecha de expiracion, renovacion, preaviso de no renovacion, terminacion por conveniencia, tope de responsabilidad, responsabilidad ilimitada, indemnizacion, seguro, nacion mas favorecida, exclusividad, no competencia, asignacion de PI, concesion de licencia, cesion, cambio de control, confidencialidad, derechos de auditoria y duracion de garantia).
- Anclaje de evidencia (span grounding): obliga a citar una subcadena literal del contrato como justificacion de cada clausula detectada.
- Salida con calibracion de confianza por clausula mediante el campo `confidence`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion proporcionada.
- Capacidades multilingues: no disponibles como dato declarado; el system prompt y la tarea estan formulados en ingles.

## Casos de uso

- Revision automatizada de contratos en despachos juridicos: el modelo procesa un contrato y devuelve un JSON con las 20 clausulas de interes, permitiendo a un revisor humano saltar directamente a las secciones relevantes mediante los `evidence_span` citados, en lugar de leer el documento completo.
- Extraccion de metadatos contractuales para sistemas de gestion documental (CLM): los campos `effective_date`, `expiration_date` y `renewal_term` se pueden volcar directamente a una base de datos o a un ERP sin postprocesado complejo, gracias al esquema JSON fijo.
- Auditoria de carteras de contratos: al ejecutarse on-premise en un Mac con 8 GB de memoria, permite procesar lotes de contratos confidenciales sin enviar texto a APIs externas, lo que facilita el cumplimiento de politicas de residencia de datos.
- Deteccion de clausulas de riesgo: los campos `cap_on_liability`, `uncapped_liability`, `indemnification` y `most_favored_nation` permiten marcar contratos que contienen responsabilidad ilimitada o clausulas de nacion mas favorecida para revision prioritaria por el equipo legal.
- Control de cumplimiento en compras y ventas: la deteccion de `non_compete`, `exclusivity` y `change_of_control` sirve para disparar alertas cuando un contrato introduce restricciones no previstas en la plantilla estandar de la empresa.
- Prototipado rapido de pipelines de extraccion: al ser un adaptador MLX ligero (2,3 GB de repo) y con licencia Apache-2.0, sirve como punto de partida para equipos que quieran validar la viabilidad de la extraccion de clausulas antes de invertir en modelos mayores o en anotacion propia.
- Clasificacion y enrutado documental: el campo `present` por tipo de clausula permite clasificar contratos por tipologia (por ejemplo, contratos con o sin clausula de auditoria) y enrutarlos al flujo de revision adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas de entrenamiento (perdidas y precision de recompensa del DPO), no evaluaciones sobre conjuntos de test estandar ni comparaciones con otros modelos.

| Metrica de entrenamiento | SFT (job 11) | DPO (job 12) | DPO (job 13) |
|---|---|---|---|
| train_loss | 0,051 | 0,009 | 0,274 |
| peak_mem_gb | 3,55 | 6,45 | 6,43 |
| reward_accuracy | no aplica | 1,0 | 0,8 |
| val_loss inicial | 1,717 | 0,693 | 0,693 |
| val_loss final | 0,178 | 0,175 | 0,019 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el autor indica que funciona en Macs con Apple Silicon y 8 GB de memoria unificada o mas; el repo pesa 2,3 GB, por lo que el modelo en 4 bits ocupa del orden de esa cifra en memoria mas el overhead de inferencia.
- GPU recomendadas: no aplica para MLX, que esta orientado a Apple Silicon (series M1, M2, M3, M4 y posteriores). No se documenta soporte para CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 8 GB o mas de memoria unificada. No se documenta su comportamiento en GPUs NVIDIA de consumo.
- Opciones de despliegue: `mlx-lm` (libreria declarada en la model card); el ejemplo de uso es `mlx_lm.generate --model "keshavM37/Anvaya-4B" --prompt "Hello"`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anvaya-4B | 4,02B (4 bits) | no disponible | Extraccion de clausulas contractuales en JSON, MLX | Apache-2.0 | Hugging Face (repo MLX) |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | Proposito general, instruct | Apache-2.0 | Hugging Face |
| mlx-community/Qwen3-4B-Instruct-2507-4bit | 4B (4 bits) | no disponible | Proposito general, instruct, cuantizado para MLX | Apache-2.0 | Hugging Face |

La comparativa se limita a la linea genealogica del modelo, ya que no se dispone de datos de rendimiento que permitan contrastarlo con otros extractores de clausulas. Frente a su base, Anvaya-4B anade el contrato de salida JSON y el anclaje de evidencia, a costa de perder generalidad.

## Limitaciones y advertencias

- El propio autor advierte que es un modelo pequeno ajustado para una unica tarea con pocos miles de ejemplos, que comete errores, incluidos errores con alta confianza, y que no debe usarse de forma autonoma para decisiones medicas, legales, financieras o de seguridad critica.
- Riesgo de alucinacion: el campo `confidence` puede ser alto en clausulas inexistentes o mal extraidas; el anclaje a subcadena literal reduce pero no elimina este riesgo, y requiere validacion programatica de que el `evidence_span` aparece realmente en el texto.
- Ambito restringido: solo cubre 20 tipos de clausula predefinidos; cualquier otra clausula relevante queda fuera del esquema y no se reporta.
- Idiomas: no se declaran idiomas soportados; el system prompt y los nombres de los tipos de clausula estan en ingles, por lo que el rendimiento en contratos en castellano no esta documentado.
- Longitud de contexto: no especificada en la informacion disponible; los contratos largos pueden exceder la ventana efectiva del modelo base.
- Licencia: Apache-2.0, que permite uso comercial manteniendo la licencia y el fichero NOTICE y declarando los cambios realizados. No obstante, 200 ejemplos de entrenamiento fueron generados o revisados por un modelo de OpenAI, y las condiciones de uso de OpenAI se aplican a esos outputs, lo que introduce una capa adicional de cautela para uso comercial.
- Dependencia de plataforma: al ser un modelo MLX, su despliegue esta ligado al ecosistema Apple Silicon; no hay pesos GGUF ni safetensors estandar para CUDA documentados.
- Sin benchmarks publicos: no hay evidencia cuantitativa de calidad en extraccion de clausulas frente a alternativas, por lo que cualquier adopcion en produccion exige una evaluacion propia sobre el dominio objetivo.
- Procedencia del ejemplo de uso: el comando de la model card referencia `keshavM37/Anvaya-4B`, mientras que el ID del repositorio es `M37labsorg/Anvaya-4B`; conviene verificar la ruta correcta antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/M37labsorg/Anvaya-4B
- Modelo base: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Libreria MLX: no disponible en la informacion proporcionada
- Paper, blog o demo del autor: no disponibles en la informacion proporcionada
