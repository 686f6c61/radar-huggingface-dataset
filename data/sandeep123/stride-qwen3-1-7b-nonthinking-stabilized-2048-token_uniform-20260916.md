# sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-token_uniform-20260916

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de PEFT entrenado sobre el modelo base Qwen/Qwen3-1.7B (revision fijada 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e). Lo publica el usuario sandeep123 como parte de una ablacion de STRIDE, un metodo de aprendizaje por refuerzo que reparte de forma uniforme (token_uniform) el bonus de diversidad de cada respuesta entre sus tokens elegibles. El objetivo declarado del experimento es estudiar la estabilidad del entrenamiento, no demostrar superioridad: la propia model card indica que no se hace ninguna afirmacion de evaluacion ni de rendimiento.

El adaptador se entrena con GRPO sobre una particion de 2.048 preguntas de matematicas, con 4 epocas planificadas, un batch global de 64 preguntas y 8 rollouts por pregunta (512 respuestas por actualizacion), lo que da 32 actualizaciones por epoca y 128 actualizaciones previstas. La innovacion metodologica mas relevante es la combinacion de una tasa de aprendizaje maxima baja (2e-5) con 10 actualizaciones de warmup lineal y un coeficiente KL de 0,01 calculado con el estimador k3 original de GRPO, todo ello para investigar la estabilidad del entrenamiento por refuerzo a pequeña escala.

Un detalle operativo importante: el entrenamiento se hizo con enable_thinking=False, es decir, en modo no pensante. El tokenizador y la plantilla de chat se mantienen sin cambios respecto al modelo base, y la propia ficha advierte de que en Qwen3-1.7B la plantilla por defecto activa el modo pensamiento, por lo que es obligatorio pasar el mismo argumento explicito en inferencia. El repositorio publica cada adaptador de actualizacion del optimizador, incluido el estado cero (adaptador inicial sin entrenar), con metadatos por checkpoint, manifiesto SHA256 y un par de reanudacion completo bajo latest-resume/.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA; LoRA de rango 16, alpha 32, dropout 0, sin bias, aplicado a q/k/v/o y gate/up/down |
| Parametros totales | 1.700 millones en el modelo base; el numero de parametros entrenables del adaptador no se especifica en la informacion disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens como limite de prompt mas respuesta durante el entrenamiento; la ventana nativa del modelo base no se detalla en la informacion disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; el ejemplo de carga usa torch.bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), con manifiesto SHA256 por checkpoint y configuracion de adaptador |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre un transformer decoder-only de 1.700 millones de parametros. El adaptador modifica los modulos de proyeccion de atencion q, k, v y o, ademas de las proyecciones gate, up y down del MLP, con rango 16, alpha 32 y dropout 0. El modelo base no se incluye en el repositorio y esta fijado a una revision concreta del Hub para garantizar reproducibilidad. El entrenamiento se realiza con GRPO (Group Relative Policy Optimization) sobre un split de 2.048 preguntas matematicas, con semilla 42 y un limite de contexto de 8.192 tokens que cubre prompt y respuesta.

La parte experimental es una ablacion de STRIDE que distribuye uniformemente el bonus de diversidad de cada respuesta entre sus tokens elegibles. El alpha de STRIDE configurado es 1, independiente del alpha 32 de LoRA, y la ficha aclara que GRPO no utiliza dicho bonus de diversidad. Se aplica un coeficiente KL de 0,01 contra la politica base congelada, usando el estimador k3 de tokens muestreados (expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)), agregado sobre el mismo denominador global de tokens generados que la perdida de politica; se trata de la implementacion original de k3, sin correccion por ratio de importancia. La tasa de aprendizaje maxima es 2e-5, con 10 actualizaciones de warmup lineal indexadas por actualizaciones completadas (2e-6 en la actualizacion 1, 2e-5 en la 10) y despues constante. El entrenamiento se planifica a 4 epocas, con posibilidad de extension mediante --allow-epoch-extension, y el codigo de entrenamiento no se publica.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos en el dominio de entrenamiento (2.048 preguntas matematicas del split de entrenamiento).
- Razonamiento paso a paso reformulado en modo no pensante: el entrenamiento se hizo explicitamente con enable_thinking=False.
- Inferencia portable como adaptador PEFT cargable sobre el modelo base fijado, sin necesidad de fusionar pesos.
- Entrenamiento adicional del adaptador con is_trainable=True y un optimizador reinicializado.
- Reanudacion exacta del entrenamiento original a partir de latest-resume/, con estado de Adam, RNG por rango, adaptador correspondiente y contrato cientifico.
- Capacidades heredadas del modelo base Qwen3-1.7B (no verificadas ni evaluadas en este repositorio): no disponible.
- Soporte de tool calling, function calling, agentes, vision o audio: no disponible (no se menciona en la informacion proporcionada).
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el repositorio permite reproducir y auditar un experimento de estabilidad de GRPO con KL k3 y warmup lineal bajo una ablacion STRIDE concreta, comparandolo con otras ejecuciones de la misma serie.
- Estudio de reparto de recompensa por token: el bonus de diversidad repartido uniformemente entre tokens elegibles sirve como linea base experimental frente a otros esquemas de asignacion de credito.
- Analisis de modos de razonamiento: al forzar enable_thinking=False, permite estudiar como se comporta Qwen3-1.7B en matematicas cuando no puede usar la cadena de pensamiento extendida.
- Trazabilidad y auditoria de checkpoints: cada carpeta checkpoint-NNNNNN/ incluye pesos, configuracion, tokenizador, metadatos de entrenamiento y manifiesto SHA256, lo que facilita la verificacion byte a byte en entornos de investigacion reproducible.
- Punto de partida para ajuste posterior: al ser un adaptador LoRA portable, se puede cargar con is_trainable=True y continuar el entrenamiento en dominios distintos con un optimizador nuevo.
- Reanudacion de experimentos largos en cluster: latest-resume/ permite retomar el entrenamiento por epocas manteniendo entorno, modelo base, datos y topologia de cuatro aprendices.
- Evaluacion comparativa de metodos RL a escala pequeña: sirve como referencia de bajo coste (modelo de 1.700 millones) para probar hipotesis antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explicitamente que no se hace ninguna afirmacion de evaluacion ni de superioridad, y advierte de que que las respuestas finales sean correctas no verifica todos los pasos intermedios de la demostracion. Tampoco se publican metricas de latencia ni de throughput.

## Requisitos de hardware

- VRAM para inferencia: no publicada por el autor. Estimacion a partir del modelo base de 1.700 millones de parametros: en torno a 4 GB en bf16/fp16 para los pesos, mas la memoria de la cache KV; alrededor de 2 GB en cuantizacion de 8 bits y 1-1,5 GB en 4 bits, segun implementacion.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM deberia ser suficiente en bf16 para contexto moderado, dado el tamaño del modelo base. GPU de datacenter (A100, H100) solo tendrian sentido para el entrenamiento o para lotes grandes, no para inferencia individual.
- Cabe en GPU de consumo: si, el modelo base de 1.700 millones de parametros es apto para GPUs de consumo tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090, especialmente con cuantizacion.
- Opciones de despliegue: al ser un adaptador LoRA, requiere cargarse con PEFT sobre Qwen/Qwen3-1.7B, o bien fusionarse con el modelo base para exportarlo a GGUF y usarlo con llama.cpp u Ollama. Para despliegue en servidor son aplicables vLLM o TGI tras la fusion del adaptador, aunque no se documenta soporte especifico en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus fichas publicas y no han sido verificados en la informacion proporcionada; los campos no confirmados se marcan como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| stride-qwen3-1.7b-nonthinking-stabilized-2048-token_uniform | 1,7B (base) + adaptador LoRA | 8.192 tokens en entrenamiento (prompt + respuesta) | no disponible | Adaptador publico en HuggingFace, 0 descargas y 0 likes | Experimento de ablacion con GRPO, sin evaluacion publicada |
| Qwen/Qwen3-1.7B (modelo base) | 1,7B | no disponible en esta ficha | no disponible en esta ficha | Modelo base publico y fijado a la revision 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e | Punto de partida del adaptador; capacidades no evaluadas aqui |
| Otros adaptadores LoRA de matematicas sobre modelos de ~1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas identificadas en la informacion proporcionada |

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion: el autor declara explicitamente que no hace afirmaciones de rendimiento ni de superioridad, por lo que no hay evidencia de mejora frente al modelo base.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de terceros.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido. Al derivar de Qwen/Qwen3-1.7B, habria que consultar ademas la licencia del modelo base.
- El adaptador no incluye el modelo base: es imprescindible descargar Qwen/Qwen3-1.7B en la revision exacta indicada para que los pesos carguen correctamente.
- El modo no pensante es obligatorio y explicito: en Qwen3-1.7B la plantilla por defecto activa el pensamiento, de modo que omitir enable_thinking=False cambia el comportamiento respecto al entrenamiento.
- El tokenizador y la plantilla de chat no se modifican, por lo que la ficha exige procedencia no pensante explicita en todos los checkpoints.
- Riesgo de alucinacion: no se documenta ningun control especifico; ademas, la model card advierte de que una respuesta final correcta no garantiza que los pasos intermedios de la demostracion sean validos.
- Dominio limitado: el entrenamiento se restringe a matematicas sobre 2.048 preguntas, sin datos publicados sobre otros dominios, idiomas o tareas.
- Sesgos: no disponibles; no se publica composicion del dataset ni analisis de sesgos.
- El codigo de entrenamiento no se publica, lo que dificulta la reproduccion completa fuera de los ficheros de reanudacion disponibles.
- La reanudacion exacta exige el entorno original, el mismo modelo base, los mismos datos y la topologia de cuatro aprendices; extender el plan mas alla de 4 epocas requiere --allow-epoch-extension.
- Los estados de reanudacion antiguos pueden permanecer en el historial de Git aunque latest-resume/ se reemplace de forma atomica, por lo que conviene fijar el commit SHA al descargar.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-token_uniform-20260916
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Revision fijada del modelo base: 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e
- Ficheros de reanudacion: latest-resume/RESUME.md y latest_resume.json dentro del repositorio
- Indice de checkpoints: checkpoint_index.json dentro del repositorio
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a foros de vehiculos Tesla y no guardan relacion con esta ficha.
