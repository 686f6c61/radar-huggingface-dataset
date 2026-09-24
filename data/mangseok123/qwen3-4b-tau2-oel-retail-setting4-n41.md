# MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n41

## Resumen

`MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n41` es un ajuste fino de Qwen3-4B-Instruct-2507 publicado como artefacto reproducible por el usuario MANGSEOK123. El modelo aplica una epoca de Online Experiential Learning (OEL) sobre el dominio *retail* de tau2-bench. No se trata de un modelo nuevo ni de una mejora de capacidades: la propia model card lo describe explicitamente como "artefacto reproducible, no como modelo mejorado", y advierte de que en esta serie de ejecuciones OEL no ha superado al modelo base.

El metodo empleado es auto-destilacion, no aprendizaje por refuerzo. Profesor y alumno comparten pesos; la unica diferencia es que al profesor se le anade en el *system prompt* la memoria de la tarea. El alumno se ajusta a la distribucion del profesor mediante una perdida KL completa a nivel de token, de modo que el comportamiento deberia sobrevivir sin la memoria en el prompt. El entrenamiento es extremadamente corto: 40 pares (memoria, tarea sintetizada), 5 pasos, una sola epoca.

Su relevancia es fundamentalmente metodologica y de investigacion: sirve para estudiar si la destilacion de memorias en los pesos recupera la senal que aporta la memoria en inferencia. Los resultados reportados por el autor indican que no lo hace de forma fiable, con diferencias dentro de un error estandar (SE ~0,06-0,08 con 40 tareas) y con un segundo epoch que empeora ligeramente el resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); sin MoE, segun el modelo base |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del autor. Heredada del modelo base Qwen/Qwen3-4B-Instruct-2507, cuyo contexto nativo declarado es de 262.144 tokens (dato externo a esta ficha, no verificado aqui) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no hay variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano de repositorio: 8,8 GB, consistente con bf16/fp16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-4B-Instruct-2507: un transformer decoder-only denso de 4,41 mil millones de parametros, sin mezcla de expertos. El ajuste publicado no modifica la topologia, solo los pesos mediante auto-destilacion.

El procedimiento de entrenamiento es Online Experiential Learning (OEL) aplicado al dominio *retail* de tau2-bench. Profesor y alumno comparten pesos, y la unica asimetria es que el profesor recibe en el *system prompt* la memoria asociada a la tarea. El alumno se ajusta con una perdida KL completa (`full`) calculada sobre todos los tokens de respuesta, con el objetivo de que la mejora en el comportamiento persista sin necesidad de inyectar la memoria en inferencia. No hay senal de recompensa ni RL. Los hiperparametros concretos son: 40 pares (memoria, tarea sintetizada); batch size de 8 repartido en 4 GPU; 5 pasos, equivalentes a 1 epoca; learning rate de 3e-6; recorte de gradiente (`grad clip`) de 1,0; y un simulador de usuario basado en gpt-4.1-mini. Un detalle tecnico relevante que reporta el autor es que las normas de gradiente se mantuvieron muy por encima del umbral de recorte de 1,0 durante todo el entrenamiento, de modo que fue el recorte, y no el learning rate, lo que determino el tamano efectivo del paso.

## Capacidades

- Generacion de texto en ingles: el modelo hereda las capacidades generativas del base Qwen3-4B-Instruct-2507, sin capacidades nuevas anadidas por el ajuste.
- *Tool calling* / *function calling*: el autor documenta explicitamente su uso con vLLM mediante `--enable-auto-tool-choice --tool-call-parser hermes`, lo que implica soporte de llamadas a herramientas en formato Hermes.
- Razonamiento de multiples pasos orientado a agentes: el ajuste se realiza sobre tau2-bench, un banco de pruebas de agentes conversacionales con herramientas, por lo que el objetivo declarado es el comportamiento agentico en el dominio *retail*.
- Razonamiento y codigo: capacidades heredadas del modelo base; no se documentan evaluaciones especificas tras el ajuste.
- Multilingue: no. La ficha declara unicamente `en`.
- Capacidades especiales: ninguna adicional. No se documenta *thinking mode*, vision ni audio.
- Memoria experiencial destilada: la capacidad que el ajuste pretende incorporar es la de reproducir el comportamiento inducido por memorias de tarea sin incluirlas en el prompt. El autor reporta que este efecto no se ha confirmado empiricamente en esta serie.

## Casos de uso

- Replicacion de experimentos de auto-destilacion: el modelo se publica como artefacto reproducible; un grupo de investigacion puede reentrenarlo o comparar la perdida KL reportada con sus propias variantes para estudiar la transferencia de memoria a pesos.
- Estudio de agentes en tau2-bench (dominio retail): permite analizar el comportamiento de un agente con *tool calling* en tareas de atencion al cliente minorista, comparando el ajuste OEL contra el modelo base en el mismo *harness*.
- Investigacion sobre limites del ajuste con datos sinteticos: con solo 40 pares y 5 pasos, el modelo sirve para documentar cuanta senal es recuperable con presupuestos de datos minimos y por que el recorte de gradiente domina la dinamica de optimizacion.
- Base para experimentos de variantes de OEL: al compartir pesos entre profesor y alumno, es un punto de partida natural para probar otras perdidas (por ejemplo, KL sobre tokens seleccionados) o dominios distintos de retail.
- Desarrollo y depuracion de *parsers* de tool calling: su ejecucion documentada con `--tool-call-parser hermes` en vLLM lo hace util para validar integraciones de llamadas a funciones en pipelines de agentes.
- Generacion de texto en ingles en prototipos: al ser un modelo de 4,41 B con licencia Apache 2.0, puede desplegarse en prototipos de generacion y resumen en ingles, siempre que no se dependa de la mejora de OEL (que no esta demostrada).
- Uso en produccion de agentes minoristas: **no recomendado** con este artefacto. El propio autor advierte de que OEL no ha mejorado al base y que el modelo no se ha evaluado en el *split* de test reservado; para produccion es mas adecuado Qwen/Qwen3-4B-Instruct-2507.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente: "Not yet evaluated on the held-out test split". El unico dato empirico reportado es que las diferencias frente al modelo base en esta serie de ejecuciones quedan dentro de un error estandar de SE ~0,06-0,08 con 40 tareas, y que un segundo epoch empeora ligeramente el resultado.

| Evaluacion | Resultado | Comparacion con el modelo base |
|---|---|---|
| tau2-bench retail (*split* de test) | No evaluado | No disponible |
| tau2-bench retail (tareas de entrenamiento) | No publicados de forma agregada | Diferencia dentro de SE ~0,06-0,08 (40 tareas) |

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 9 GB solo de pesos (4,41 B x 2 bytes), y del orden de 11-13 GB contando cache KV y sobrecarga del runtime para contextos moderados. Estimacion derivada del numero de parametros, no medida.
- VRAM en cuantizacion de 8 bits: aproximadamente 4,5-5 GB de pesos, con 7-9 GB totales estimados. Requiere cuantizar el modelo uno mismo: el repositorio no publica variantes cuantizadas.
- VRAM en cuantizacion de 4 bits: aproximadamente 2,5-3 GB de pesos, con 4-6 GB totales estimados, previa conversion a GGUF/AWQ/GPTQ.
- GPU recomendadas: para bf16, A100 40/80 GB, H100, L40S o cualquier GPU con 16 GB o mas (RTX 4080, RTX 4090, RTX 4060 Ti 16 GB, RTX 3090). Para 4 bits, tarjetas de 6-8 GB son suficientes en teoria.
- Cabe en GPU de consumo: si. En bf16 con 16 GB o mas, con holgura en una RTX 4090 (24 GB) o RTX 4060 Ti (16 GB). En 8 o 4 bits, en tarjetas de 8-12 GB como RTX 3060 12 GB o RTX 3070.
- Apple Silicon: viable con memoria unificada de 16 GB o mas en bf16, y desde 8-16 GB con cuantizacion (requiere conversion a GGUF, no publicada).
- Opciones de despliegue: el autor documenta vLLM con `vllm serve MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n41 --enable-auto-tool-choice --tool-call-parser hermes`. Tambien son aplicables TGI y SGLang para los pesos safetensors. llama.cpp y Ollama requieren convertir previamente a GGUF, ya que el repositorio no incluye ese formato.
- Latencia y *throughput*: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-retail-setting4-n41 | 4,41 B | No disponible en la ficha (heredado del base) | apache-2.0 | HuggingFace, 0 descargas, 0 likes | No evaluado en test; sin mejora demostrada sobre el base |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,41 B | Contexto nativo declarado de 262.144 tokens (dato externo a esta ficha) | apache-2.0 | HuggingFace, ampliamente distribuido | Referencia del autor; OEL no lo supera |
| Otros ajustes de la serie OEL de MANGSEOK123 (por ejemplo, variantes `setting4`) | No disponible | No disponible | apache-2.0 (segun el patron de la serie) | HuggingFace | No disponible |
| Modelos densos de ~3-4 B de la misma categoria (por ejemplo, Llama 3.2 3B Instruct) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia de mejora demostrada: el autor afirma que OEL no ha mejorado al modelo base en ninguna de las ejecuciones de la serie, con diferencias dentro de un error estandar de SE ~0,06-0,08 (40 tareas). Un segundo epoch empeoro ligeramente el resultado.
- Sin evaluacion en el *split* de test: no hay resultados en la particion reservada de tau2-bench retail, por lo que no puede afirmarse ninguna ganancia de generalizacion.
- Riesgo de sobreajuste severo al dominio: el entrenamiento usa 40 pares (memoria, tarea) sintetizados de un unico dominio (*retail*) durante solo 5 pasos. Cualquier comportamiento aprendido esta fuertemente vinculado a ese dominio.
- Recorte de gradiente dominante: las normas de gradiente superaron ampliamente el umbral de 1,0, de modo que el recorte fijo el tamano efectivo del paso. Esto limita la interpretabilidad del learning rate reportado y complica la reproducibilidad fina.
- Idioma: solo ingles declarado. No hay soporte multilingue confirmado y el castellano no esta contemplado.
- Sesgos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o equidad para este ajuste.
- Alucinacion: no medida. Al ser un ajuste de un modelo de 4,41 B usados como agente con herramientas, el riesgo de invocar funciones inexistentes o con argumentos incorrectos es relevante y no esta cuantificado.
- Licencia: Apache 2.0, por lo que el uso comercial esta permitido en principio. Sin embargo, se heredan las condiciones del modelo base y conviene verificar la licencia de Qwen/Qwen3-4B-Instruct-2507 y de los datos de tau2-bench utilizados.
- Datos de entrenamiento sintetizados con gpt-4.1-mini: la generacion de tareas mediante un modelo de terceros puede arrastrar condiciones de uso del proveedor que no se detallan en la ficha.
- Madurez del artefacto: 0 descargas y 0 *likes* en el momento de la consulta, publicacion inicial y sin mantenimiento documentado. No apto como dependencia de produccion.
- Reproducibilidad parcial: la ficha documenta hiperparametros y la perdida, pero no publica el dataset de 40 pares ni las semillas, por lo que la replicacion exacta no esta garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n41
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- tau2-bench (banco de pruebas del dominio *retail*): sin enlace proporcionado en la informacion disponible
- Paper o blog de Online Experiential Learning: sin enlace proporcionado en la informacion disponible
- Repositorio de codigo de entrenamiento: sin enlace proporcionado en la informacion disponible
