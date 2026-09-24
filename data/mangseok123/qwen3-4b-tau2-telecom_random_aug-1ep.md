# MANGSEOK123/qwen3-4b-tau2-telecom_random_aug-1ep

## Resumen

`MANGSEOK123/qwen3-4b-tau2-telecom_random_aug-1ep` es un ajuste fino del modelo denso Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario MANGSEOK123 (perfil sin otros modelos destacados, 0 descargas y 0 likes en el momento de la consulta). El objetivo declarado es especializar el modelo en el dominio **telecom** del benchmark tau2-bench, es decir, en diálogos agente-usuario con uso de herramientas para tareas de atención al cliente de operadoras (facturación, planes, incidencias tecnicas). El modelo no se presenta como un asistente generalista mejorado, sino como un artefacto experimental de destilacion.

El entrenamiento se basa en **OEL (experience distillation con KL)**: el estudiante reproduce cada tarea sin memoria, mientras que el profesor son los mismos pesos con la memoria de la tarea insertada en el system prompt. Solo difiere el prompt; no se usa reward ni RL. Se emplearon unicamente 45 pares tarea-memoria, batch de 12 y 1 epoca con learning rate constante de 3e-6.

La relevancia de la ficha es mas metodologica que de rendimiento: ilustra como inyectar "experiencia" procedimental en un modelo de 4B mediante distillacion KL sobre tokens de respuesta, con un coste de computo minimo. El autor no publica evaluacion del resultado, y la referencia disponible (0,056 de media y 0,175 de pass@4 del modelo base en el test split de telecom) sugiere un punto de partida muy bajo, por lo que la utilidad practica del checkpoint esta por demostrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base Qwen3-4B-Instruct-2507; la model card de este ajuste recomienda desplegar con `--max-model-len 40960` |
| Tipos de cuantizacion | no publicados por el autor; al distribuirse en safetensors admite conversion a GGUF, AWQ, GPTQ y bitsandbytes |
| Idiomas soportados | no disponible para el ajuste; el modelo base Qwen3 es multilingue (mas de 100 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 8,8 GB) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Fecha de publicacion | 2026-09-23 (creacion del repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer decoder-only denso con atencion por consultas agrupadas (GQA), sin componentes MoE ni SSM. El ajuste no modifica la topologia; solo actualiza pesos mediante destilacion sobre distribuciones de tokens. Esto implica que la ventana de contexto nominal del modelo base (262.144 tokens) se mantiene en teoria, aunque la model card limita el despliegue recomendado a 40.960 tokens y no se documenta si el ajuste degrada el comportamiento en contextos largos.

El procedimiento de entrenamiento esta completamente documentado en la model card y es inusual por su simplicidad: 45 pares tarea-memoria, batch size 12, 1 epoca, learning rate constante de 3e-6, gradient clipping de 1,0 (valor por defecto de verl) y una perdida de **KL completa sobre todos los tokens de respuesta** con `kl_topk` 256. El estudiante reproduce cada tarea sin memoria; el profesor son exactamente los mismos pesos pero con la memoria de esa tarea en el system prompt. No hay funcion de recompensa, ni RLHF, ni DPO, ni preferencias humanas: la unica senal es la divergencia KL entre las distribuciones del profesor (con memoria) y del estudiante (sin memoria). El simulador de usuario usado para generar las interacciones fue gpt-4.1-mini con temperatura 0.

Los registros de entrenamiento publicados (4 pasos) muestran perdida KL de 0,023 / 0,028 / 0,034 / 0,012 y entropia de 0,360 / 0,347 / 0,279 / 0,470, con normas de gradiente de 11,816 / 5,752 / 7,087 / 1,497. El propio autor advierte que cada paso lee un batch distinto, por lo que la columna de perdida refleja la dificultad del lote y no una curva de convergencia. Con esos numeros no es posible afirmar que el modelo haya aprendido ninguna habilidad de forma estable.

## Capacidades

- Generacion de texto conversacional en el marco de tau2-bench: dialogos multi-turno en los que un agente debe resolver peticiones de un cliente simulado de una operadora de telecomunicaciones.
- Uso de herramientas (**tool calling**) en formato compatible con el parser `hermes` de vLLM, con seleccion automatica de herramienta (`--enable-auto-tool-choice`).
- Razonamiento multi-paso orientado a tareas: consulta de datos, aplicacion de politicas y ejecucion de acciones a traves de llamadas a funciones.
- Inyeccion de "memoria de tarea" procedimental: el modelo fue destilado para reproducir el comportamiento que exhibiria con una memoria de tarea en el system prompt, por lo que se espera que generalice parcialmente ese patron sin necesidad de incluirla.
- Capacidades generales heredadas del modelo base Qwen3-4B-Instruct-2507: generacion de texto, matematicas basicas, codigo y comprension multilingue; no hay evidencia publicada de que se conserven intactas tras el ajuste.
- No se documentan capacidades de vision, audio, modo "thinking" explicito ni function calling con esquemas distintos al parser hermes.

## Casos de uso

- **Atencion al cliente de operadoras de telecomunicaciones**: el modelo esta entrenado sobre el dominio telecom de tau2-bench, que reproduce flujos de facturacion, cambios de plan y resolucion de incidencias. Su uso natural es como agente de primera linea en un entorno controlado con herramientas simuladas.
- **Investigacion en destilacion de experiencia (OEL)**: sirve como caso de estudio reproducible de como aplicar KL sobre tokens de respuesta con un profesor que solo se diferencia del estudiante por el prompt de sistema, sin reward ni RL. Util para equipos que quieran replicar el metodo con otros dominios.
- **Banco de pruebas para evaluacion de agentes**: integrado en el harness de tau2-bench permite medir si la destilacion mejora el pass@4 del modelo base en telecom, comparando directamente ambos checkpoints.
- **Prototipado de agentes con tool calling en vLLM**: el comando documentado (`--enable-auto-tool-choice --tool-call-parser hermes`) permite levantar un servidor compatible con OpenAI en una GPU de gama media, util para iterar sobre prompts y esquemas de herramientas antes de pasar a modelos mayores.
- **Generacion de dialogos sinteticos de soporte tecnico**: puede emplearse para producir trazas de conversacion agente-usuario que alimenten posteriores pipelines de filtrado y anotacion, siempre que se valide la calidad de la salida.
- **Ablacion de tamano en tareas agenticas**: al ser un modelo de 4,41 B con licencia Apache 2.0, permite estudiar el suelo de rendimiento de la familia Qwen3 en tareas de telecom antes de escalar a variantes de 8B, 14B o 32B.
- **Despliegue en local para desarrollo offline**: con cuantizacion de 4 bits cabe en GPUs de consumo, lo que facilita reproducir experimentos sin acceso a clusters.

## Benchmarks y rendimiento

El autor indica explicitamente que el modelo **no fue evaluado** tras el entrenamiento ("Not evaluated. Pushed straight after training."). El unico dato numerico disponible es la referencia del modelo base:

| Benchmark | Modelo | Metrica | Resultado |
|---|---|---|---|
| tau2-bench, dominio telecom (test split) | Qwen3-4B-Instruct-2507 (base) | avg | 0,056 |
| tau2-bench, dominio telecom (test split) | Qwen3-4B-Instruct-2507 (base) | pass@4 | 0,175 |
| tau2-bench, dominio telecom (test split) | qwen3-4b-tau2-telecom_random_aug-1ep | avg / pass@4 | no evaluado |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la informacion disponible, ni para el ajuste ni comparativos con alternativas.

## Requisitos de hardware

- **Pesos en precision completa (bf16/fp16)**: 4,41 B de parametros equivalen a aproximadamente 8,8 GB solo en pesos, coherente con el tamano del repositorio (8,8 GB). Sumando cache KV y overhead del runtime, la inferencia necesita del orden de 10-12 GB de VRAM con contextos moderados.
- **Cache KV con contexto largo**: al desplegar con los 40.960 tokens que recomienda la model card, la cache KV crece de forma notable (estimacion del orden de 5-6 GB adicionales en bf16 con GQA de 8 cabezas KV), por lo que conviene reservar 16-20 GB de VRAM para esa configuracion. Cifras estimadas a partir de la arquitectura del modelo base.
- **Cuantizacion de 4 bits**: reduce los pesos a aproximadamente 2,5-3 GB, lo que permite ejecucion comoda en GPUs de consumo con 8 GB o mas.
- **GPU recomendadas**: NVIDIA A100 40/80 GB, H100 o L40S para produccion con contexto largo y concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para desarrollo en bf16 con contexto amplio; RTX 3060 12 GB, RTX 4060 Ti 16 GB o similares para cuantizacion de 4 bits.
- **Cabe en GPU de consumo**: si, al menos en cuantizacion de 4-8 bits. En bf16 con contexto muy largo requiere 24 GB.
- **Opciones de despliegue**: vLLM es la ruta documentada por el autor (incluye los flags de tool calling). TGI, SGLang, llama.cpp y Ollama son viables previa conversion de los pesos; no se publican versiones GGUF oficiales.
- **Latencia y throughput**: no disponible. No hay mediciones publicadas de tokens por segundo, TTFT ni rendimiento bajo concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MANGSEOK123/qwen3-4b-tau2-telecom_random_aug-1ep | 4,41 B | 40.960 tokens recomendados en despliegue (262.144 en el base) | tau2-bench telecom (45 pares de entrenamiento) | apache-2.0 | HuggingFace, sin cuantizaciones oficiales |
| Qwen/Qwen3-4B-Instruct-2507 | 4,41 B | 262.144 tokens | Generalista, instrucciones y tool calling | apache-2.0 | HuggingFace, ecosistema amplio de cuantizaciones |
| Qwen/Qwen3-8B | entorno a 8 B | 128.000 tokens en las variantes Qwen3 iniciales | Generalista | apache-2.0 | HuggingFace |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens | Generalista | Llama 3.2 Community License | HuggingFace |

La comparacion directa relevante es contra el propio modelo base: mismo tamano, misma licencia y misma arquitectura, con la unica diferencia del ajuste OEL. Frente a Qwen3-8B, este checkpoint ofrece la mitad de parametros a cambio de una especializacion muy estrecha. No hay datos de rendimiento que permitan afirmar que el ajuste supera al base en el dominio objetivo.

## Limitaciones y advertencias

- **Sin evaluacion publicada**: el autor declara que el modelo se subio inmediatamente despues del entrenamiento. No existe evidencia de mejora sobre el modelo base y el punto de partida documentado es muy bajo (0,056 de media en telecom).
- **Riesgo elevado de sobreajuste**: 45 pares tarea-memoria y una sola epoca con learning rate constante de 3e-6 es un regimen de entrenamiento extremadamente ligero, pero tambien muy limitado en cobertura. Es probable que el modelo reproduzca patrones superficiales de esas 45 tareas y no generalice a variaciones reales.
- **Olvido catastrofico no medido**: no se evaluo la degradacion de capacidades generales (matematicas, codigo, multilingue) tras el ajuste KL sobre respuestas muy especificas.
- **Sesgos**: no documentados. Hereda los sesgos del modelo base Qwen3-4B-Instruct-2507 y de las trazas generadas por el simulador gpt-4.1-mini, que introduce el estilo y los sesgos de ese modelo en el profesor.
- **Alucinacion en dominio telecom**: al tratarse de un dominio con politicas contractuales y precios, el modelo puede inventar condiciones de tarifa o procedimientos que no existen. Cualquier despliegue real exige validacion contra el catalogo de herramientas.
- **Idiomas**: no se especifican los idiomas del ajuste. El entrenamiento se genero con un simulador en ingles presumiblemente, por lo que el rendimiento en castellano no esta garantizado.
- **Contexto practico**: aunque el base soporte 262.144 tokens, la configuracion recomendada por el autor es 40.960; usar ventanas mayores sin validacion previa puede degradar la calidad.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial y modificacion, pero el modelo hereda las condiciones del base Qwen3, tambien Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- **Madurez**: 0 descargas y 0 likes, sin pipeline declarado y sin issues publicas. No es un artefacto listo para produccion sin una evaluacion propia exhaustiva.
- **Uso responsable**: dado el dominio de telecomunicaciones, conviene tratar el modelo como componente de investigacion y no como agente autonomo con acceso a sistemas reales de facturacion o cuentas de clientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-telecom_random_aug-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de referencia del benchmark tau2-bench: https://github.com/sierra-research/tau2-bench
- Paper, blog, demo o dataset adicionales: no disponibles en la informacion proporcionada.
