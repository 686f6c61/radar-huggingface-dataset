# d4rkninja/tanpo-hiring-LoRA

## Resumen

tanpo-hiring-LoRA es un adaptador LoRA publicado por el usuario d4rkninja (DarkNinja Solutions, marca comunitaria DarkLab) que especializa el modelo instruct LFM2.5-1.2B-Instruct en tareas de reclutamiento y gestion de talento. No es un modelo completo: se distribuye como adaptador PEFT en formato safetensors y necesita cargar el modelo base para poder ejecutarse.

El adaptador cubre flujos concretos de hiring: descripciones de puesto y calibracion de roles, scorecards de evaluacion estructurada, guiones de reclutamiento outbound y cribado, diseno de bucles de entrevista, calibracion de debriefs, operativa del pipeline de rechazo y framing de ofertas. Su relevancia practica esta en que ofrece un ajuste de dominio sobre un modelo de 1,2B parametros, ejecutable en hardware modesto.

El autor reporta una mejora de +9,2 puntos porcentuales sobre el modelo base en una rubrica de 20 tareas de hiring (92,9% frente a 83,8%). El repositorio no declara idiomas soportados, pipeline, datos de entrenamiento ni hiperparametros, y a fecha de la ficha acumula 0 descargas y 0 likes, por lo que se trata de un artefacto reciente y sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo instruct LFM2.5-1.2B-Instruct; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | 1,2B en el modelo base; el adaptador no declara el numero de parametros entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; para los pesos fusionados existe un repo GGUF asociado que recomienda Q4_K_M. No se declaran otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (la licencia del modelo base no se especifica en la informacion proporcionada) |
| Formato de pesos | safetensors (adaptador LoRA); existen artefactos derivados en pesos Transformers fusionados y en GGUF |
| Libreria | peft |
| Modelo base | unsloth/LFM2.5-1.2B-Instruct |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) aplicado mediante la libreria PEFT sobre LFM2.5-1.2B-Instruct. La model card no publica el rango del adaptador, los modulos objetivo, el valor de alpha, la tasa de aprendizaje, el numero de pasos ni el volumen de tokens de entrenamiento. Tampoco indica si se aplicaron tecnicas de alineacion adicionales como RLHF, DPO o SFT supervisado mas alla del propio ajuste LoRA. El unico dato de entrenamiento verificable que aporta el autor es la comparacion de resultados sobre su rubrica de evaluacion.

El ajuste se orienta a un dominio unico: operaciones de reclutamiento. La evaluacion reportada se realizo, segun el autor, con la misma configuracion de decodificacion para el modelo base y para el modelo con adaptador, sobre una rubrica de 20 tareas. No se describe la composicion del dataset, el idioma de los datos ni el proceso de anotacion, por lo que no es posible evaluar la calidad ni la representatividad del conjunto de entrenamiento.

## Capacidades

- Generacion de descripciones de puesto y calibracion de roles (nivel, responsabilidades, requisitos).
- Elaboracion de scorecards y evaluacion estructurada de candidatos.
- Redaccion de guiones de reclutamiento outbound y de cribado telefonico o asincrono.
- Diseno de bucles de entrevista y kits de entrevista estructurada.
- Soporte a la calibracion de debriefs y a la operativa del pipeline de rechazo.
- Framing de ofertas y planes de cierre de candidatos.
- Generacion de texto instruct general, heredada del modelo base LFM2.5-1.2B-Instruct.
- Tool calling / function calling: no declarado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no declaradas en la informacion disponible.
- Capacidades multilingues: no declaradas; los idiomas soportados figuran como no disponibles.
- Modo de razonamiento explicito (thinking mode), vision o audio: no declarados.

## Casos de uso

- Redaccion y calibracion de ofertas de empleo: el modelo puede generar borradores de descripciones de puesto consistentes con un nivel y una banda salarial dados; la rubrica reportada para esta categoria es del 100%, lo que sugiere buen ajuste al formato esperado.
- Diseno de scorecards de evaluacion: permite producir plantillas de evaluacion estructurada por competencias y rol, una de las categorias con mejor resultado reportado (100%).
- Definicion de bucles de entrevista: genera secuencias de etapas, entrevistadores implicados y objetivos por etapa, con resultado reportado del 100%.
- Guiones de cribado y reclutamiento outbound: util para estandarizar mensajes de primer contacto y preguntas de filtrado, categoria tambien reportada al 100%.
- Calibracion de debriefs y decisiones post-entrevista: ayuda a estructurar la discusion de feedback y a documentar criterios de avance o descarte (87,5% en la rubrica).
- Operativa del pipeline de rechazo: redaccion de comunicaciones de rechazo y gestion de estados del proceso (87,5% en la rubrica).
- Asistente interno de reclutadores en local: con los pesos en GGUF (Q4_K_M) puede ejecutarse en portatiles o estaciones de trabajo sin GPU dedicada, lo que facilita prototipos y pruebas internas con datos sensibles.
- Framing de ofertas y cierre de candidatos: generacion de argumentarios y planes de cierre adaptados al perfil (87,5% en la rubrica).

## Benchmarks y rendimiento

Los unicos datos disponibles son los reportados por el autor en la model card, obtenidos sobre una rubrica propia de 20 tareas de hiring con la misma configuracion de decodificacion. No se trata de benchmarks publicos estandarizados y no se detalla la metodologia.

| Modelo | Rubrica global | Calidad heuristica (0-10) | Delta vs base |
|---|---:|---:|---:|
| LFM2.5-1.2B-Instruct (base) | 83,8% | 6,40 | — |
| tanpo-hiring (con adaptador LoRA) | 92,9% | 7,18 | +9,2 pts |

| Categoria de hiring | Rubrica |
|---|---:|
| Scorecards de contratacion | 100,0% |
| Diseno de bucles de entrevista | 100,0% |
| Descripciones de puesto | 100,0% |
| Reclutamiento outbound | 100,0% |
| Guiones de cribado | 100,0% |
| Calibracion de debriefs | 87,5% |
| Framing de ofertas | 87,5% |
| Operativa del pipeline de rechazo | 87,5% |
| Kits de entrevista estructurada | 77,8% |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo de 1,2B parametros, las estimaciones propias a partir del tamano del modelo base son de aproximadamente 2,5-3 GB en fp16 y de 1-1,5 GB en cuantizacion de 4 bits. Son estimaciones, no cifras publicadas por el autor.
- El adaptador en si ocupa un espacio minimo (el repositorio se declara como 0,0 GB).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. El modelo base es lo bastante pequeno para CPU.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual, e incluso en CPU mediante los pesos GGUF.
- Opciones de despliegue: la model card documenta unicamente la ruta PEFT + Transformers (carga del modelo base y aplicacion del adaptador con PeftModel). Para llama.cpp o LM Studio existe el repositorio GGUF asociado, con Q4_K_M como cuantizacion recomendada. No se documenta soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros adaptadores publicos especializados en reclutamiento con los que comparar de forma rigurosa. La comparacion posible se limita al modelo base y a los artefactos derivados del mismo autor.

| Artefacto | Tipo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| d4rkninja/tanpo-hiring-LoRA | Adaptador LoRA | 1,2B (base) | no disponible | apache-2.0 | safetensors | 92,9% en rubrica propia de hiring |
| unsloth/LFM2.5-1.2B-Instruct | Modelo instruct base | 1,2B | no disponible | no disponible | safetensors | 83,8% en la misma rubrica |
| d4rkninja/tanpo-hiring | Pesos Transformers fusionados | 1,2B | no disponible | apache-2.0 (segun el adaptador) | safetensors | mismo ajuste que el adaptador |
| d4rkninja/tanpo-hiring-GGUF | Pesos cuantizados | 1,2B | no disponible | apache-2.0 (segun el adaptador) | GGUF | mismo ajuste que el adaptador |

Alternativas de otros autores: no disponible.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar y cargar LFM2.5-1.2B-Instruct para funcionar.
- La licencia del modelo base no se especifica en la informacion proporcionada. Aunque el adaptador se publica bajo apache-2.0, el uso comercial esta condicionado tambien por la licencia del modelo base, que debe verificarse por separado.
- Los resultados de la rubrica son autodeclarados, sobre 20 tareas y sin metodologia publicada. El propio autor advierte que son direccionales y que las decisiones importantes de contratacion deben validarse con juicio humano.
- No se declaran idiomas soportados ni datos de entrenamiento, por lo que se desconoce su comportamiento real en castellano.
- Toda la evaluacion se concentra en un unico dominio (hiring). No hay evidencia de capacidades generales mas alla de las heredadas del modelo base.
- Riesgo de alucinacion: no se han publicado mediciones de fidelidad factual ni de tasas de alucinacion para este ajuste.
- Sesgos: no se han publicado analisis de sesgo. En un dominio como reclutamiento, el riesgo de amplificar sesgos de genero, edad, origen o discapacidad es relevante y no esta medido.
- Uso en produccion: los sistemas de seleccion de personal estan considerados de alto riesgo en el marco regulatorio europeo de IA, lo que exige evaluaciones de conformidad, supervision humana y documentacion tecnica que este repositorio no aporta.
- No se documentan hiperparametros del LoRA, volumen de datos ni proceso de anotacion, lo que dificulta la reproducibilidad.
- Repositorio sin traccion: 0 descargas y 0 likes en la fecha de consulta.
- El kit de entrevista estructurada es la categoria con peor resultado reportado (77,8%), por debajo del resto.

## Enlaces

- Adaptador LoRA en HuggingFace: https://huggingface.co/d4rkninja/tanpo-hiring-LoRA
- Modelo base: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct
- Pesos Transformers fusionados: https://huggingface.co/d4rkninja/tanpo-hiring
- Pesos GGUF para LM Studio / llama.cpp: https://huggingface.co/d4rkninja/tanpo-hiring-GGUF

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a documentacion de Google Drive, CorelDraw y gestion de almacenamiento, sin relacion con el artefacto. No se dispone de papers, blogs ni demos adicionales.
