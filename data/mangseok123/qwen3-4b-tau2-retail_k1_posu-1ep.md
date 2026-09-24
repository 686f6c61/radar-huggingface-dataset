# MANGSEOK123/qwen3-4b-tau2-retail_k1_posU-1ep

## Resumen

MANGSEOK123/qwen3-4b-tau2-retail_k1_posU-1ep es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123 en HuggingFace. El objetivo declarado es consolidar comportamiento de agente sobre el dominio **retail** del benchmark tau2-bench mediante una tecnica de destilacion de experiencia (OEL, *experience distillation*) aplicada sobre 45 pares tarea–memoria. No es un modelo nuevo: es una variante especializada del checkpoint instruct de Qwen3 de 4B, con licencia Apache-2.0 y pesos en safetensors.

El entrenamiento es deliberadamente minimo: 1 epoca, batch size 12, learning rate constante de 3e-6 y una perdida KL completa sobre todos los tokens de respuesta con `kl_topk` 256. La peculiaridad metodologica es que no se usa recompensa alguna: el estudiante reproduce cada tarea *sin* memoria en el prompt, mientras que el profesor son los mismos pesos con la memoria de esa tarea inyectada en el system prompt. Es decir, se destila una diferencia de contexto, no una politica recompensada.

Su relevancia actual es acotada y muy especifica: sirve como artefacto de investigacion para estudiar si un modelo de 4B puede internalizar rutinas de agente de retail (busqueda de pedidos, cambios, devoluciones, tool calling sobre APIs simuladas) sin necesidad de recuperacion externa. El autor indica explicitamente que el modelo **no fue evaluado** tras el entrenamiento, por lo que cualquier adopcion en produccion deberia ir precedida de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso de la familia Qwen3 (detalles de capas, atencion y configuracion del modelo base no disponibles en la informacion proporcionada) |
| Parametros totales | 4.411.424.256 (~4,41 mil millones), segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue del autor usa `--max-model-len 40960` (40.960 tokens) |
| Tipos de cuantizacion | no disponible; el repo solo publica pesos en safetensors (tamano de repo 8,8 GB, compatible con BF16/FP16) |
| Idiomas soportados | no disponibles (no declarados por el autor; heredados del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Dominio de especializacion | tau2-bench, dominio retail |
| Fecha de publicacion | 23 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint Qwen/Qwen3-4B-Instruct-2507, un transformer denso de la familia Qwen3 en su variante instruct no-thinking (2507). La model card no aporta detalles sobre numero de capas, tipo de atencion, tokenizador ni composicion del corpus original, por lo que esos datos se consideran no disponibles en esta ficha.

El ajuste fino se realiza con experiencia destilada sobre el dominio retail de tau2-bench. El procedimiento descrito es el siguiente: se dispone de 45 pares tarea–memoria; el estudiante reproduce cada tarea **sin** memoria en el prompt, mientras que el profesor son exactamente los mismos pesos con la memoria de esa tarea insertada en el system prompt. La unica diferencia entre ambas condiciones es el prompt, y no se emplea ninguna funcion de recompensa. La perdida es una KL completa sobre todos los tokens de respuesta con `kl_topk` 256. Los hiperparametros son: batch size 12, 1 epoca, learning rate 3e-6 constante, gradient clipping 1.0 (valor por defecto de verl). El simulador de usuario es gpt-4.1-mini con temperatura 0.

El autor publica las cuatro primeras iteraciones de entrenamiento (KL loss 0,011 / 0,005 / 0,011 / 0,011; entropia 0,431 / 0,228 / 0,368 / 0,365; norma de gradiente 0,855 / 2,446 / 1,989 / 2,035) y advierte que cada step lee un batch distinto, de modo que la columna de perdida refleja la dificultad del batch y no una curva de convergencia. No se documenta ninguna innovacion de decodificacion (decodificacion especulativa, atencion lineal, SSM) ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno en el estilo del checkpoint Qwen3-4B-Instruct-2507.
- Ejecucion de tareas de agente con tool calling / function calling: el autor documenta el uso del parser `hermes` con vLLM (`--enable-auto-tool-choice --tool-call-parser hermes`), lo que implica soporte de llamadas a herramientas en formato compatible.
- Razonamiento multi-paso orientado a tareas de retail: gestion de pedidos, cambios, devoluciones y consultas sobre un entorno simulado (tau2-bench retail).
- Internalizacion de rutinas de tarea sin necesidad de inyectar memoria en el prompt, que es precisamente el objetivo del proceso de destilacion descrito.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card y el ajuste se realiza sobre tareas en el dominio retail de tau2-bench, presumiblemente en ingles.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles ni declaradas. El modelo base es la variante instruct-2507, no la variante thinking.

## Casos de uso

- Investigacion sobre destilacion de contexto en agentes: el modelo permite reproducir y comparar el efecto de inyectar memoria en el prompt frente a internalizarla en los pesos, usando tau2-bench retail como banco de pruebas controlado.
- Desarrollo de agentes de atencion al cliente en comercio electronico: puede emplearse como prototipo de bajo coste para gestionar conversaciones sobre pedidos, cambios y devoluciones con llamadas a herramientas, antes de escalar a un modelo mayor.
- Evaluacion de pipelines de tool calling: dado que el autor publica una invocacion concreta con vLLM y parser `hermes`, sirve como banco de pruebas para validar integraciones de function calling en produccion.
- Generacion de trayectorias sinteticas para *data augmentation*: las respuestas del modelo sin memoria pueden usarse para generar dialogos de retail que despues se filtren o corrijan, aprovechando su coste de inferencia reducido.
- Despliegue en entornos con GPU de gama media o consumer: con ~4,4 mil millones de parametros cabe en GPUs de 12-16 GB en BF16, lo que permite experimentar con agentes de retail en estaciones de trabajo sin clúster.
- Comparacion de tecnicas de ajuste eficiente: al usar solo 45 pares y 1 epoca con learning rate muy bajo, es un ejemplo util para estudiar sobreajuste y olvido catastrofico en fine-tuning de dominio.
- Simulacion de usuario en bucles de evaluacion: puede actuar como contraparte en entornos de test tipo tau2-bench para generar interacciones de compra, cancelacion o reclamacion.
- Prototipado rapido de asistentes verticales de retail en entornos de investigacion, siempre con evaluacion propia previa dado que no hay resultados publicados.

## Benchmarks y rendimiento

El autor indica explicitamente que el modelo **no fue evaluado** tras el entrenamiento ("Not evaluated. Pushed straight after training"). El unico dato de referencia disponible es el del modelo base:

| Modelo | Benchmark | Metrica | Resultado |
|---|---|---|---|
| Qwen/Qwen3-4B-Instruct-2507 (base) | tau2-bench, split de test, dominio retail | media (avg) | 0,400 |
| Qwen/Qwen3-4B-Instruct-2507 (base) | tau2-bench, split de test, dominio retail | pass@3 | 0,575 |
| MANGSEOK123/qwen3-4b-tau2-retail_k1_posU-1ep | tau2-bench retail | no disponible (no evaluado) | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 9-10 GB solo para pesos (el repo ocupa 8,8 GB), mas overhead de KV cache y activaciones; en la practica, entre 11 y 13 GB para contextos moderados y bastante mas si se usa la ventana de 40.960 tokens.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 5-6 GB de pesos; con 4 bits, alrededor de 3-4 GB. Estas cuantizaciones no se publican en el repo y requeririan conversion propia (no disponible).
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o A10G para despliegue multiusuario; RTX 4090, RTX 3090, RTX 4080 o similares para uso individual.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas en BF16 para contextos cortos, y en 8-16 GB con cuantizacion. En GPUs de 8 GB solo con cuantizacion agresiva y contextos reducidos (no verificable con los artefactos publicados).
- Opciones de despliegue: vLLM, tal como documenta el autor, con `--enable-auto-tool-choice --tool-call-parser hermes --max-model-len 40960`. Otras alternativas (llama.cpp, Ollama, TGI, SGLang) no estan documentadas para este checkpoint; requeririan conversion a GGUF en el caso de llama.cpp/Ollama, no disponible en el repo.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, TTFT ni rendimiento con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MANGSEOK123/qwen3-4b-tau2-retail_k1_posU-1ep | 4,41 mil millones (safetensors) | no disponible; ejemplo de despliegue a 40.960 tokens | tau2-bench retail, destilacion de experiencia | apache-2.0 | HuggingFace, 0 descargas, sin evaluacion publicada |
| Qwen/Qwen3-4B-Instruct-2507 (base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | proposito general, instruct | apache-2.0 | HuggingFace, ampliamente distribuido |
| Qwen3-4B-Thinking-2507 (variante de razonamiento) | no disponible en la informacion proporcionada | no disponible | razonamiento explicito | apache-2.0 | HuggingFace |
| Otros modelos de ~4B para agentes y tool calling | no disponible | no disponible | agentes genericos | variable | no disponible |

La comparacion cuantitativa de rendimiento no es posible: el modelo ajustado no ha sido evaluado y las busquedas web realizadas no devolvieron informacion tecnica relevante sobre alternativas comparables en este mismo dominio (los resultados obtenidos no guardan relacion con el modelo y se descartan).

## Limitaciones y advertencias

- Modelo no evaluado: el autor lo publica inmediatamente despues del entrenamiento, sin ninguna medicion posterior. No hay evidencia de que mejore los 0,400 de media / 0,575 de pass@3 del modelo base en tau2-bench retail.
- Tamano de entrenamiento minimo: 45 pares tarea–memoria, 1 epoca y batch size 12 implican muy pocos pasos de optimizacion; el riesgo de sobreajuste a esas tareas concretas o de que el efecto sea inapreciable es alto.
- La loss publicada no indica convergencia: el propio autor advierte que cada step lee un batch distinto, por lo que la columna de perdida refleja dificultad de batch, no mejora del modelo.
- Sin senal de recompensa: al no usar reward, el objetivo optimizado es la divergencia KL respecto al profesor (los mismos pesos con memoria), lo que puede producir derivas de comportamiento dificiles de predecir fuera del dominio retail.
- Riesgo de olvido catastrofico: un ajuste sobre un dominio estrecho en un modelo de 4B puede degradar capacidades generales (codigo, matematicas, multilingue) no medidas en este caso.
- Riesgo de alucinacion: no hay evaluacion de fidelidad ni de tasa de invencion de datos en llamadas a herramientas o respuestas sobre pedidos, que es un riesgo central en agentes de retail.
- Alcance de idioma: no se declaran idiomas; el ajuste se apoya en tareas de tau2-bench retail, presumiblemente en ingles, y no hay garantia de comportamiento equivalente en castellano.
- Contexto: la unica referencia es el flag `--max-model-len 40960` del ejemplo de vLLM; no se documenta la ventana nativa del modelo base ni su comportamiento en contextos largos.
- Integracion de herramientas: depende del parser `hermes` de vLLM; no se documentan otros formatos de tool calling ni plantillas alternativas.
- Licencia: Apache-2.0 permite uso comercial, pero el despliegue real deberia verificar tambien las condiciones del modelo base Qwen3-4B-Instruct-2507 y, si se usa el entorno tau2-bench o el simulador gpt-4.1-mini en la generacion de datos, los terminos de esos recursos.
- Adopcion en produccion: con 0 descargas, 0 likes y ausencia de evaluacion, no es un artefacto validado; cualquier uso en produccion exige evaluacion propia y, preferiblemente, comparacion directa contra el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-retail_k1_posU-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper, repositorio o demo del benchmark tau2-bench: no disponible en la informacion proporcionada
- Repositorio de OEL o de la tecnica de destilacion de experiencia: no disponible en la informacion proporcionada
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con este checkpoint y se descartan.
