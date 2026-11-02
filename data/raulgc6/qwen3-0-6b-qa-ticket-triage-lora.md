# raulgc6/qwen3-0.6b-qa-ticket-triage-lora

## Resumen

`raulgc6/qwen3-0.6b-qa-ticket-triage-lora` es un adaptador LoRA entrenado sobre el modelo base Qwen3-0.6B (596 millones de parametros, licencia Apache-2.0) para una tarea muy concreta: clasificar tickets tecnicos de QA de una plataforma de comercio electronico y devolver un objeto JSON con tres campos (`categoria`, `prioridad` y `respuesta`). Lo publica el usuario raulgc6 como ejercicio de aprendizaje dentro de un Master en AI Engineer (sesion 7, dedicada a modelos open source y ecosistema Hugging Face), y el propio autor advierte explicitamente de que no esta pensado para produccion.

El adaptador no es un modelo autonomo: el repositorio contiene unicamente las matrices A y B de LoRA (unos pocos MB) y requiere cargar por separado el modelo base Qwen3-0.6B. La tarea esta acotada a cinco categorias excluyentes (`frontend`, `backend`, `integracion_terceros`, `base_de_datos`, `infraestructura`) y cuatro niveles de prioridad (`critica`, `alta`, `media`, `baja`), con una nota breve de triaje en espanol.

Su relevancia es fundamentalmente didactica: demuestra como un ajuste supervisado (SFT) con LoRA de apenas 2,29 millones de parametros entrenables (0,38 % del total) sobre una GPU T4 en unos 47 segundos puede mejorar de forma sustancial la adherencia al formato y la precision de clasificacion frente al modelo base con few-shot, pasando de un 45,0 % de media a un 70,0 % en el conjunto de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-0.6B |
| Parametros totales | 598.343.680 (modelo base); adaptador con 2.293.760 parametros entrenables (0,38 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de longitud maxima durante el entrenamiento; contexto nativo del base Qwen3-0.6B no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones propias de Qwen3-0.6B) |
| Idiomas soportados | espanol |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base Qwen/Qwen3-0.6B por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-0.6B, un transformer decoder-only de 596 millones de parametros. La configuracion LoRA es fija y se decidio antes de ver resultados, sin busqueda de hiperparametros: r=16, lora_alpha=32, lora_dropout=0,05, modulos objetivo `q_proj` y `v_proj`. El entrenamiento fue un SFT con TRL sobre 240 tickets sinteticos (48 por categoria), 2 epocas, batch de 8, tasa de aprendizaje 2e-4, longitud maxima de 512 tokens y semilla 42. La perdida se calculo unicamente sobre la respuesta del asistente (el JSON), y el chat template de Qwen3 se aplico con `enable_thinking=False` de forma identica en entrenamiento e inferencia.

Los datos son 100 % sinteticos, generados con un modelo de lenguaje y revisados parcialmente a mano, sin informacion personal ni claves. Se dividieron en 240 tickets de entrenamiento, 30 de validacion (para elegir el prompt few-shot y diagnosticar) y 30 de test (evaluacion final, medida una sola vez), sin duplicados ni casi duplicados entre conjuntos segun un script de similitud. Las etiquetas siguen una guia con reglas de desempate, por ejemplo asignar `integracion_terceros` cuando falla la llamada a un proveedor externo aunque la API propia devuelva un 500. El entrenamiento se ejecuto en una GPU NVIDIA T4 (Google Colab) durante unos 47 segundos, con la perdida bajando de 1,53 (paso 5) a 0,74 (paso 60). Versiones: torch 2.11.0+cu130, transformers 5.22.1, datasets 5.1.0, trl 1.17.1, peft 0.21.2, accelerate 1.15.0.

## Capacidades

- Clasificacion de tickets tecnicos de QA en cinco categorias excluyentes: `frontend`, `backend`, `integracion_terceros`, `base_de_datos` e `infraestructura`.
- Asignacion de prioridad en cuatro niveles: `critica`, `alta`, `media` y `baja`.
- Generacion de una nota breve de triaje en espanol dentro del campo `respuesta` (que revisar primero o a quien escalar).
- Salida estructurada estricta: un unico objeto JSON con las claves `categoria`, `prioridad` y `respuesta`, sin texto adicional.
- Generacion determinista cuando se usa `do_sample=False`, con un maximo de 160 tokens nuevos en la configuracion de evaluacion.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking (el chat template se aplica con `enable_thinking=False`).
- Capacidad multilingue limitada al espanol segun los metadatos del repositorio.

## Casos de uso

- Triaje automatizado de tickets de soporte en e-commerce: el adaptador recibe el texto del ticket y devuelve categoria y prioridad listas para enrutar al equipo correspondiente, reduciendo el tiempo de clasificacion manual en colas de QA.
- Enrutamiento por categoria en herramientas internas: al devolver una de las cinco categorias excluyentes, la salida puede alimentar directamente un sistema de asignacion (frontend, backend, integraciones, base de datos o infraestructura) sin postprocesado.
- Priorizacion de incidencias criticas: el campo `prioridad` permite ordenar la cola de trabajo y destacar tickets `critica` como la caducidad de un certificado TLS que bloquea la tienda.
- Generacion de notas de triaje para agentes humanos: el campo `respuesta` ofrece una indicacion breve en espanol sobre que revisar primero o a quien escalar, util como borrador que el operador valida.
- Prototipado rapido de clasificadores con LoRA: sirve como plantilla reproducible para experimentar con SFT sobre un modelo pequeno en una GPU T4 en menos de un minuto, incluyendo la evaluacion con validador estricto de JSON.
- Docencia y ejercicios de evaluacion de modelos open source: el repositorio documenta tres condiciones comparadas (base, base con few-shot y adaptador) sobre los mismos 30 tickets, lo que lo hace util para ilustrar el impacto del ajuste fino frente al prompting.
- Extraccion de estructura JSON en pipelines de datos: al garantizar salida JSON en el 100 % de los casos de test, puede integrarse en etapas que requieran formato fijo, siempre con validacion posterior.

## Benchmarks y rendimiento

Evaluacion sobre los mismos 30 tickets de test, con generacion determinista (maximo 160 tokens) y un unico validador estricto que exige que la salida completa sea JSON valido, sin reparacion.

| Condicion | JSON valido | Categoria | Prioridad | Media |
|---|---|---|---|---|
| 1. Base + instrucciones basicas | 100 % | 36,7 % | 33,3 % | 35,0 |
| 2. Base + 5 ejemplos en el prompt (few-shot) | 100 % | 53,3 % | 36,7 % | 45,0 |
| 3. Este adaptador + instrucciones basicas | 100 % | 90,0 % | 50,0 % | 70,0 |

Referencias del autor: responder siempre la prioridad mas frecuente daria un 33,3 %, y adivinar la categoria al azar, un 20 %. La condicion 3 usa el mismo prompt basico que la 1, de modo que la diferencia se atribuye al entrenamiento. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 596 millones de parametros; en fp16 ocupa aproximadamente 1,2 GB de pesos, y el adaptador anade unos pocos MB. El ejemplo del autor carga el base en `float16` sobre CUDA.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente; el autor entreno en una NVIDIA T4 de Google Colab. Tambien cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: el autor documenta `transformers` + `peft` (PeftModel sobre AutoModelForCausalLM). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; al tratarse de un adaptador LoRA, requeriria fusion con el base o soporte de adaptadores en el servidor de inferencia.
- Latencia y throughput: no disponibles. Como referencia de coste de entrenamiento, el SFT completo tardo unos 47 segundos en una T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raulgc6/qwen3-0.6b-qa-ticket-triage-lora | 596 M (base) + 2,29 M (adaptador) | 512 tokens en entrenamiento | LoRA especializado en triaje de tickets QA en espanol | Apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3-0.6B | 596 M | no disponible en la informacion proporcionada | Modelo base generalista | Apache-2.0 | Hugging Face |
| Clasificador clasico (p. ej. regresion logistica o fine-tuning de BERT) | no disponible | no disponible | Clasificacion supervisada de texto | variable | variable |

La comparacion con alternativas especializadas en triaje de tickets no esta disponible en la informacion proporcionada. Frente al modelo base, el adaptador mejora la media de 35,0 a 70,0 en el conjunto de test con el mismo prompt basico.

## Limitaciones y advertencias

- El autor indica explicitamente que es un ejercicio de aprendizaje y que no esta pensado para produccion.
- Solo 30 tickets de test: cada uno pesa 3,3 puntos porcentuales, y solo se ejecuto un entrenamiento (semilla 42), sin medir la variacion entre semillas.
- Datos sinteticos con pistas explicitas en el texto y etiquetas asignadas sin segunda revision humana; los resultados no son extrapolables a tickets reales.
- La prioridad es el punto debil (50 % de acierto): el modelo tiende a confundir `alta` con `media`.
- La model card esta truncada en la informacion disponible, por lo que pueden existir limitaciones adicionales no recogidas aqui.
- Riesgo de alucinacion en el campo `respuesta` y de categorias o prioridades fuera del conjunto permitido si la entrada se aleja del dominio sintetico; se recomienda validar el JSON contra un esquema antes de usarlo.
- Contexto de entrenamiento limitado a 512 tokens: tickets largos pueden truncarse o degradar la calidad de la clasificacion.
- Idioma limitado al espanol segun los metadatos; no se ha evaluado su comportamiento en otros idiomas.
- Licencia Apache-2.0, que permite uso comercial del adaptador, pero el autor desaconseja su uso en produccion por las limitaciones anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raulgc6/qwen3-0.6b-qa-ticket-triage-lora
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
