# MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n139

## Resumen

qwen3-4b-tau2-oel-retail-s4-n139 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123. Se trata de un artefacto de investigacion reproducible, no de un modelo mejorado: el propio autor lo describe como un resultado de un experimento de aprendizaje experiencial en linea (Online Experiential Learning, OEL) aplicado al dominio retail del benchmark tau2-bench. El modelo conserva la licencia Apache 2.0 del modelo base y esta publicado unicamente en ingles.

El problema que aborda es metodologico. OEL, tal como se implementa aqui, es autodestilacion y no aprendizaje por refuerzo: no existe senal de recompensa. Profesor y alumno comparten pesos, y la unica diferencia es que al profesor se le anade al prompt de sistema la memoria de la tarea. El alumno se ajusta a la distribucion del profesor con una perdida KL completa a nivel de token, de modo que el comportamiento sobreviva sin la memoria en el prompt. El interes del artefacto es que documenta un resultado negativo: en esta serie de ejecuciones, OEL no ha superado al modelo base.

El modelo tiene 4.411.424.256 parametros reales segun los pesos en safetensors, un repositorio de 8,8 GB y un entrenamiento de solo 17 pasos (una epoca) sobre 136 pares de memoria y tarea sintetizada. No se ha evaluado en el split de test reservado, por lo que su utilidad practica inmediata es limitada y su valor es principalmente experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada del modelo base Qwen3-4B-Instruct-2507 (no se detalla en la informacion proporcionada) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (no es MoE; no disponible en la informacion proporcionada) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors, sin versiones cuantizadas documentadas |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 8,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4.400 millones de parametros. No se introduce ningun cambio estructural: el ajuste es exclusivamente de pesos mediante autodestilacion. No se documentan en la informacion disponible la composicion del dataset original del modelo base ni si este paso previo incluyo RLHF o DPO.

El entrenamiento consiste en una epoca de OEL sobre el dominio retail de tau2-bench, con 136 pares de memoria y tarea sintetizada (el identificador del repositorio indica n139, lo que no coincide con los 136 pares declarados en la model card). La configuracion es: batch size 8 repartido en 4 GPU, 17 pasos, tasa de aprendizaje 3e-6, grad clip 1.0, perdida KL completa sobre todos los tokens de respuesta y un simulador de usuario basado en gpt-4.1-mini. La innovacion tecnica es el propio mecanismo OEL: el profesor recibe la memoria de la tarea en el prompt de sistema mientras el alumno no, y el alumno se ajusta a la distribucion del profesor para internalizar ese conocimiento en los pesos. El autor senala que las normas del gradiente estuvieron muy por encima del clip de 1.0 durante todo el entrenamiento, de modo que fue el clip, y no la tasa de aprendizaje, lo que fijo el tamano de paso efectivo.

## Capacidades

- Generacion de texto y razonamiento conversacional: heredadas del modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling: el ejemplo de uso documentado emplea `--enable-auto-tool-choice` y `--tool-call-parser hermes`, lo que indica compatibilidad con llamadas a herramientas en vLLM.
- Comportamiento de agente en el dominio retail de tau2-bench: gestion de tareas con memoria sintetizada, aunque sin mejora demostrada sobre el modelo base.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma de la ficha.
- Capacidad especial: ninguna adicional documentada; no se mencionan modo de pensamiento explicito, vision ni audio.
- Capacidad de razonamiento multi-paso: no evaluada en el split de test, por lo que no puede confirmarse.

## Casos de uso

- Reproduccion de experimentos de OEL: el artefacto permite replicar el pipeline de autodestilacion con memoria en el prompt del profesor sobre el dominio retail, usando la configuracion declarada (17 pasos, lr 3e-6, batch 8 en 4 GPU).
- Estudio de destilacion frente a memoria en contexto: sirve para cuantificar que fraccion de la senal de la memoria se recupera al destilarla en los pesos frente a dejarla en el prompt en tiempo de inferencia.
- Linea base en comparaciones de ajuste fino: al estar construido sobre Qwen3-4B-Instruct-2507 con una receta reproducible, puede usarse como punto de referencia negativo en estudios de metodos de aprendizaje experiencial.
- Prototipado de agentes de atencion al cliente en retail: el modelo base ya soporta tool calling y conversacion multi-turno, de modo que puede emplearse para iterar sobre esquemas de herramientas, aunque sin esperar ganancias del ajuste OEL.
- Validacion de infraestructura de despliegue con vLLM: el comando documentado con `--enable-auto-tool-choice --tool-call-parser hermes` permite verificar pipelines de serving con tool calling antes de invertir en modelos mayores.
- Analisis de olvido catastrofico y estabilidad: dado que una segunda epoca empeoro los resultados, el checkpoint es util para estudiar el efecto del numero de epocas y del recorte de gradiente en ajustes de pocos pasos.
- Docencia y divulgacion sobre evaluacion estadistica: los intervalos de error estandar reportados (SE ~0,06-0,08 con 40 tareas) ilustran por que diferencias aparentes entre ejecuciones pueden no ser significativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint. La model card indica explicitamente que no se ha evaluado en el split de test reservado. La unica informacion cuantitativa disponible sobre la serie de ejecuciones es la siguiente, y no constituye una tabla de benchmarks comparativa:

| Metrica | Valor |
|---|---|
| Evaluacion en test reservado | No realizada |
| Diferencia frente al modelo base | Dentro de un error estandar (SE ~0,06-0,08 con 40 tareas) |
| Efecto de una segunda epoca | Empeora ligeramente los resultados |
| Norma del gradiente | Muy por encima del clip de 1.0 durante todo el entrenamiento |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 8,8-10 GB solo para pesos, mas la cache KV correspondiente al contexto utilizado.
- VRAM estimada cuantizado: aproximadamente 4,5-5 GB en int8 y 2,5-3 GB en 4 bits, segun esquemas habituales; no hay versiones cuantizadas publicadas por el autor.
- GPU consumer: cabe en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) en bf16, y en GPUs de 8 GB si se cuantiza a 4 bits.
- GPU de datacenter: A100, H100, L40S y similares no son necesarias para inferencia, aunque se usaron 4 GPU para el entrenamiento segun la model card.
- Opciones de despliegue: vLLM es la documentada por el autor, con el comando `vllm serve MANGSEOK123/qwen3-4b-tau2-oel-retail-s4-n139 --enable-auto-tool-choice --tool-call-parser hermes`. Al publicarse en safetensors, es convertible a GGUF para llama.cpp u Ollama, y desplegable en TGI; ninguna de estas alternativas esta verificada en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-retail-s4-n139 | 4.411.424.256 | No disponible | Sin mejora demostrada sobre la base; sin evaluar en test | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4B | No disponible en la informacion proporcionada | Referencia de partida del ajuste; el autor indica que OEL no la supera | apache-2.0 | HuggingFace, modelo oficial de Qwen |
| Otros checkpoints de la serie OEL del mismo autor | No disponible | No disponible | Resultados dentro de un error estandar respecto a la base | No disponible | HuggingFace, autor MANGSEOK123 |

No se dispone de datos de benchmarks que permitan comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Resultado negativo documentado: el autor afirma que OEL no ha mejorado al modelo base en esta serie, y que una segunda epoca empeoro los resultados. No debe presentarse como una mejora.
- Sin evaluacion: no se ha evaluado en el split de test reservado de tau2-bench, por lo que no hay evidencia de rendimiento fuera del conjunto de entrenamiento.
- Muestra de entrenamiento muy pequena: 136 pares de memoria y tarea sintetizada en 17 pasos, lo que limita drasticamente la generalizacion.
- Riesgo de alucinacion: inherente al modelo base y no mitigado por este ajuste; el dominio retail con llamadas a herramientas es especialmente sensible a invocaciones incorrectas.
- Idiomas: solo ingles declarado; el uso en castellano no esta soportado ni evaluado.
- Discrepancia de identificador: el nombre del repositorio indica n139 mientras la model card declara 136 pares, lo que conviene verificar antes de citar el artefacto.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el artefacto se publica como resultado experimental y no como modelo listo para produccion.
- Caveat de produccion: no se documentan versiones cuantizadas, latencia ni throughput, y no hay senal de adopcion (0 descargas y 0 likes), por lo que no existe validacion por parte de terceros.
- Datos sintetizados: las tareas de entrenamiento se generaron de forma sintetica con un simulador basado en gpt-4.1-mini, lo que puede introducir sesgos del simulador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n139
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han proporcionado en la informacion disponible enlaces a papers, blogs, repositorios ni demos adicionales.
