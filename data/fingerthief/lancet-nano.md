# fingerthief/lancet-nano

## Resumen

LANCET Nano es un clasificador de riesgo de comandos Bash desarrollado por Tanner Middleton (usuario fingerthief en HuggingFace). Su funcion es etiquetar un comando de shell como `risky`, `review` o `not_flagged` antes de que lo ejecute un agente autonomo o una persona, actuando como una capa de seguridad previa a la ejecucion. La version actual, v0.3.0, esta construida sobre el encoder CodeT5-base de Salesforce y cuenta con 109,6 millones de parametros.

El modelo se distribuye como un archivo ONNX cuantizado a INT8 de 111 MB, con un runtime propio minimo (`bundle/classify.py`) en lugar de depender de `AutoModel` de Transformers. Esta disenado para inferencia local en CPU, sin acceso a red, con una latencia mediana de aproximadamente 22 milisegundos por comando. Esto lo hace adecuado para integrarse como filtro en tiempo real dentro de pipelines de agentes que ejecutan comandos de shell.

Su relevancia actual radica en el auge de agentes autonomos capaces de ejecutar comandos arbitrarios en entornos de produccion, donde un comando destructivo (por ejemplo, `terraform destroy -auto-approve`) puede causar un incidente irreversible. LANCET Nano ofrece una comprobacion previa y local que no requiere enviar comandos potencialmente sensibles a servicios externos. La version v0.2.0, mas pequena (36 MB, basada en CodeT5-small), sigue disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CodeT5-base) |
| Parametros totales | 109,6 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens maximo (entradas mayores devuelven `review`) |
| Tipos de cuantizacion | INT8 (archivo ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (modelo); runtime bajo MIT |
| Formato de pesos | ONNX (INT8) |

## Arquitectura y entrenamiento

LANCET Nano v0.3.0 es un fine-tuning de CodeT5-base, un encoder transformer preentrenado por Salesforce (Yue Wang, Weishi Wang, Shafiq Joty y Steven C. H. Hoi). El modelo parte de los pesos upstream fijados de CodeT5-base, no de un checkpoint LANCET anterior, y se entrena con muestreo balanceado por clase. La salida es una clasificacion en tres categorias: `risky`, `review` o `not_flagged`. No se trata de un `AutoModel` de Transformers, sino de un clasificador ONNX personalizado que se ejecuta con un runtime propio.

El entrenamiento se apoya en etiquetas generadas por reglas deterministas a partir de documentacion y material del proyecto. Las fuentes incluyen las descripciones de ejemplos de tldr-pages (CC BY 4.0), los verbos de operacion de AWS y las marcas de campos sensibles en los modelos de servicio de botocore (Apache-2.0), y ejemplos de referencia de Azure CLI y GitHub CLI (MIT) asi como de kubectl y Docker CLI (Apache-2.0). El material propio del proyecto aporta pares riesgo/seguridad, una familia de secretos y suites de evaluacion previas generadas por agentes, retiradas al conjunto de entrenamiento con sus etiquetas originales. Segun la model card, ningun modelo de lenguaje, API alojada ni etiquetador humano produjo etiqueta de entrenamiento alguna.

## Capacidades

- Clasificacion de comandos Bash en tres clases: `risky`, `review` y `not_flagged`.
- Deteccion de comandos peligrosos orientados a destruccion de recursos (por ejemplo, `terraform destroy`, `kubectl delete namespace`).
- Deteccion de comandos que exponen secretos (familia de secretos dedicada).
- Funcionamiento completamente local en CPU, sin acceso a red en inferencia.
- Diseno especifico para seguridad de agentes (`agent-safety`): actua como guardia previo a la ejecucion.
- Inferencia de baja latencia (mediana de aproximadamente 22 ms por comando).
- Empaquetado verificable mediante `verify_bundle.py --strict`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo de pensamiento.
- No dispone de capacidades multimodales (vision, audio) ni de generacion de texto libre.

## Casos de uso

- Guardia previa a la ejecucion en agentes autonomos: cada comando Bash que un agente pretende ejecutar pasa primero por LANCET Nano; si la clasificacion es `risky`, se bloquea o se escala a revision humana antes de tocar produccion.
- Integracion en pipelines CI/CD: el modelo puede insertarse como paso de validacion que inspecciona los comandos de shell de un workflow y detiene despliegues con operaciones destructivas.
- Proteccion de entornos cloud con Terraform, kubectl o Docker: detecta comandos como `terraform destroy -auto-approve` o `kubectl delete namespace prod` y evita su ejecucion accidental.
- Prevencion de fuga de secretos: la familia de secretos del modelo permite senalar comandos que podrian exponer credenciales (por ejemplo, impresion o envio de variables sensibles), aunque su deteccion de secretos es limitada.
- Auditoria y registro de riesgo: un equipo puede puntuar lotes de comandos historicos para identificar patrones peligrosos y reforzar politicas internas.
- Filtro local en entornos air-gapped: al no requerir red, encaja en infraestructuras aisladas donde enviar comandos a un servicio externo no es aceptable.
- Capa de defensa en sandboxes de evaluacion: plataformas que ejecutan codigo generado por modelos pueden usar LANCET Nano como cortafuegos de comandos antes de conceder acceso al shell.

## Benchmarks y rendimiento

Resultados sobre el benchmark `lancet-bench-1` (793 comandos: 409 riesgosos, 384 seguros, 37 areas de herramientas). Cada modelo se puntuo en una sola pasada.

| Metrica | Nano v0.3.0 | Nano v0.2.0 | Nano v0.1.0 | Jev (alojado) | Laya (local) |
|---|---:|---:|---:|---:|---:|
| Comandos riesgosos detectados | 85,8% | 73,6% | 65,5% | 96,8% | 68,5% |
| Comandos seguros detenidos por error | 5,5% | 6,2% | 5,5% | 7,8% | 37,8% |
| Comandos de secretos riesgosos detectados | 66% | 24% | 14% | 98% | 48% |
| Parametros | 110 M | 35 M | 35 M | no divulgado | 421 M |

Advertencias indicadas por el autor: las etiquetas del benchmark fueron escritas por el propio desarrollador (un agente de IA), por lo que constituyen evidencia diagnostica y no una aceptacion independiente. Jev y Laya recibieron contexto de tarea, mientras que Nano solo ve el comando. En una comprobacion externa con los conjuntos ShellRisk (no autorados por agentes), v0.3.0 detecta aproximadamente tantos comandos riesgosos como v0.2.0 y detiene cerca de un tercio menos de comandos seguros; rinde peor en el conjunto de retencion mas pequeno.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para ejecutarse localmente en CPU mediante `onnxruntime` (version indicada en la model card: 1.30.0).
- Huella de memoria: archivo ONNX INT8 de 111 MB; el consumo en memoria se aproxima al tamano del modelo mas el runtime (valores exactos no disponibles).
- GPU: no requerida. No se publican requisitos de VRAM ni GPU recomendadas; el modelo esta orientado a CPU.
- Latencia: aproximadamente 22 ms por comando en CPU (mediana), segun el autor.
- Despliegue: runtime propio (`bundle/classify.py`) sobre `onnxruntime`; tambien disponible como ZIP verificado desde la release de GitHub. No se mencionan soportes de vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Comandos riesgosos detectados | Seguros detenidos por error | Disponibilidad |
|---|---|---:|---:|---:|---|
| LANCET Nano v0.3.0 | 110 M | Local (CPU, INT8 ONNX) | 85,8% | 5,5% | Publico (HuggingFace) |
| LANCET Nano v0.2.0 | 35 M | Local (CodeT5-small) | 73,6% | 6,2% | Publico (revision v0.2.0) |
| LANCET Nano v0.1.0 | 35 M | Local | 65,5% | 5,5% | Version anterior |
| Jev | no divulgado | Alojado | 96,8% | 7,8% | Servicio alojado |
| Laya | 421 M | Local | 68,5% | 37,8% | Local |

Los datos de Jev y Laya provienen del mismo benchmark aportado por el autor y con asignacion de contexto de tarea distinta, por lo que no son directamente equiparables a Nano. No se dispone de informacion adicional sobre licencias o disponibilidad de los comparadores.

## Limitaciones y advertencias

- Solo procesa comandos de Bash. No admite otros shells ni tiene acceso a ficheros, scripts descargados o contexto de tarea.
- Entradas invalidas, de mas de 8.192 bytes o de mas de 512 tokens devuelven `review`. Las entradas nunca se truncan de forma silenciosa.
- `not_flagged` no constituye una garantia de seguridad ni una autorizacion de ejecucion.
- La deteccion de secretos ha mejorado pero sigue por detras del comparador alojado (66% frente a 98%).
- No se dispone de aceptacion independiente ni de adjudicacion de etiquetas por humanos.
- Las etiquetas del benchmark fueron escritas por el autor (un agente de IA), lo que limita la validez de los resultados como evidencia independiente.
- v0.3.0 se publico por excepcion del propietario tras fallar una comprobacion preregistrada demasiado estricta.
- El widget de inferencia alojado esta deshabilitado.
- El modelo se distribuye bajo Apache-2.0 y el runtime bajo MIT; los conjuntos de datos de entrenamiento no se incluyen ni se relicencian.
- Idiomas: unicamente ingles; puede degradarse ante comandos o comentarios en otros idiomas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la clasificacion puede fallar tanto por falsos negativos (comandos riesgosos marcados como seguros) como por falsos positivos (comandos seguros detenidos).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fingerthief/lancet-nano
- Demo (Space): https://huggingface.co/spaces/fingerthief/lancet-nano
- Repositorio GitHub: https://github.com/TannerMidd/LANCET-model
- Web del proyecto: https://tannermidd.github.io/LANCET-model/
- Release v0.3.0: https://github.com/TannerMidd/LANCET-model/releases/tag/v0.3.0
- Model card completa: bundle/MODEL_CARD.md
- Avisos legales: bundle/NOTICE.txt y bundle/THIRD-PARTY-NOTICES.md
- Modelo base: https://huggingface.co/Salesforce/codet5-base
