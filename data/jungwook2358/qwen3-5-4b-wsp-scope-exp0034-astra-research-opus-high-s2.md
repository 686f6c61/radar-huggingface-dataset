# jungwook2358/Qwen3.5-4B-wsp-scope-exp0034-astra-research-opus-high-s2

## Resumen

Qwen3.5-4B-wsp-scope-exp0034-astra-research-opus-high-s2 es un checkpoint derivado del modelo multimodal Qwen3.5-4B, publicado por el usuario jungwook2358 en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es el resultado de una sesion de edicion de pesos (weight editing) aplicada sobre un checkpoint intermedio del mismo autor, identificado como EXP-0034 session 1. El modelo conserva la arquitectura original de Qwen3.5 y el pipeline image-text-to-text, con 4.659.865.088 parametros totales y pesos en formato safetensors.

La relevancia de esta ficha es metodologica mas que de rendimiento: documenta un flujo de trabajo denominado WSP-Scope, en el que un agente (claude-opus-5-5 en Claude Code) ejecuta el modelo en un simulador de robotica (entornos LIBERO), diagnostica fallos a partir de los rollouts y modifica directamente tensores concretos de los pesos, aceptando un cambio solo cuando las evaluaciones pareadas en semillas no usadas para construirlo muestran una mejora clara. En total se ejecutaron 928 episodios de simulador y no se realizo ningun entrenamiento.

El resultado final es un unico tensor modificado respecto al checkpoint base: `model.language_model.layers.14.mlp.down_proj.weight`, con 21.144.442 valores almacenados alterados. El resto de tensores es byte a byte identico al modelo de partida. El autor advierte explicitamente de que el modelo no ha sido evaluado en kakao y de que los efectos medidos provienen de sus propios rollouts, no de una evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5 en su variante de 4B con capacidad image-text-to-text, aunque la model card no detalla la configuracion interna (numero de capas, dimension oculta, mecanismo de atencion ni estrategia de fusion vision-lenguaje). Lo que si se documenta con precision es el proceso de edicion: no hubo entrenamiento, ni RLHF, ni DPO. El punto de partida fue el checkpoint EXP-0033 final (d015a709) mas una edicion aceptada (step1_garble), y sobre el se aplico una sesion de edicion de pesos EXP-0034.

El flujo WSP-Scope consistio en ejecutar el modelo en los entornos libero_10_swap, libero_goal_swap, libero_object_swap y libero_spatial_swap con las semillas [0, 1, 2, 3, 4], excluyendo cualquier semilla que repitiese las escenas usadas para construir la edicion. A partir de los fallos observados, el editor aplico ediciones rank-1 sobre tensores concretos y las conservo solo si los rollouts pareados en semillas no vistas mostraban mejora. Se aceptaron dos pasos: el step1_garble (sin cambios de tensores en esta sesion, heredado) y el step2_e3c_tomato_can, que modifica la capa 14 del `down_proj` del MLP del modelo de lenguaje. La hipotesis del editor es que esta edicion introduce el hecho "la salsa de tomate es una lata", de modo que el segmentador de objetos t5 nombre una lata de salsa de tomate en lugar de una botella de salsa BBQ, manteniendo sin cambios objetos de referencia como salsas BBQ, ketchup, aderezo de ensalada (botella), sopa de letras (lata), leche y zumo (carton), y queso crema y mantequilla (caja).

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text), orientado a tareas de percepcion y segmentacion en entornos simulados.
- Razonamiento aplicado a tareas de robotica simulada: los entornos LIBERO evaluan manipulacion con instrucciones en lenguaje natural.
- Capacidad de segmentacion de objetos guiada por prompts, segun la hipotesis del editor sobre el tensor t5.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad del modelo; el agente es el editor, no el modelo.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: vision confirmada por el pipeline; thinking y audio no disponibles.

## Casos de uso

- Investigacion en edicion de pesos: el repositorio incluye el checkpoint completo, los reemplazos de tensores almacenados, el script `apply_patch.py` y un informe de verificacion tensor a tensor, lo que permite reproducir y auditar la edicion paso a paso.
- Estudio de metodologias de diagnostico automatizado: sirve como caso practico de como un agente LLM puede ejecutar un modelo en un simulador, identificar fallos concretos y proponer correcciones localizadas sin reentrenar.
- Experimentos de robotica simulada en LIBERO: el modelo puede ejecutarse en los entornos libero_10_swap, libero_goal_swap, libero_object_swap y libero_spatial_swap para evaluar la influencia de la edicion en tareas de manipulacion con objetos cotidianos.
- Analisis de ediciones de hechos en modelos multimodales: el cambio "la salsa de tomate es una lata" permite estudiar como un ajuste rank-1 en la capa 14 afecta a la identificacion de objetos y si se produce filtracion de plantillas de color.
- Base para experimentos de ablacion: al ser el resto de tensores byte a byte identico al modelo base, se puede comparar directamente el comportamiento con y sin la edicion, aislando su efecto.
- Docencia y divulgacion tecnica: el material del repositorio (patch.json acumulativo, change.json por paso, informe de verificacion) es util para explicar tecnicas de weight editing con trazabilidad completa.
- Prototipado de asistentes multimodales en entornos controlados: aunque no se documentan capacidades generales de asistencia, el pipeline image-text-to-text permite experimentar con instrucciones visuales en dominios acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido evaluado en kakao y que los efectos medidos por el editor provienen de sus propios rollouts en el simulador, no de una evaluacion formal. Se ejecutaron 928 episodios de simulador durante la sesion, pero no se presentan tasas de exito ni comparaciones numericas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,66 mil millones de parametros en safetensors, los pesos ocupan aproximadamente 9,3 GB en precision de 16 bits (el repositorio completo pesa 9,4 GB). En cuantizacion de 8 bits se reduciria a unos 4,7 GB y en 4 bits a unos 2,4 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: para inferencia en 16 bits sin cuantizar se necesita una GPU con al menos 12-16 GB de VRAM, como una RTX 4090 (24 GB) o una A100 (40/80 GB). En cuantizacion 4 u 8 bits cabria en GPUs consumer de 8-12 GB, como una RTX 3060 de 12 GB o una RTX 4070.
- Cabe en GPU consumer: si, en modelos con 12 GB o mas de VRAM en 16 bits, y en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), con posibilidad de usar vLLM o TGI si la arquitectura Qwen3.5 esta soportada por dichos motores; llama.cpp y Ollama requeririan conversion a GGUF, no publicada por el autor. El tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-wsp-scope-exp0034-astra-research-opus-high-s2 (este) | 4,66 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint editado, un solo tensor modificado |
| Qwen3.5-4B (modelo base de la familia) | ~4 B | no disponible | no disponible en esta ficha | Hugging Face | Referencia original de la arquitectura |
| jungwook2358/Qwen3.5-4B-wsp-scope-exp0034-astra-research-opus-high (checkpoint previo) | 4,66 B | no disponible | Apache 2.0 | Hugging Face | Punto de partida de esta sesion de edicion |
| Alternativas multimodales de ~4B (p. ej. Qwen2.5-VL-3B, Phi-3.5-vision) | 3-4 B | no disponible | variable | Hugging Face | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no ha sido evaluado en kakao y que los efectos medidos provienen de sus propios rollouts, no de una evaluacion independiente.
- La edicion se valido en entornos LIBERO concretos con semillas especificas; no hay garantia de que el comportamiento se generalice fuera de ese simulador ni a escenas no vistas.
- La hipotesis de la edicion ("la salsa de tomate es una lata") es una interpretacion del editor; el efecto real sobre el tensor no esta desglosado mas alla del recuento de valores cambiados (21.144.442).
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada, pero presentes por herencia del modelo base.
- Limitaciones de contexto e idioma: no disponibles; la model card no especifica ventana de contexto ni lista de idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los checkpoints intermedios pueden tener condiciones adicionales no reflejadas en esta ficha.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (23 de noviembre de 2026), lo que indica que no ha pasado por validacion de la comunidad.
- Al ser un checkpoint de investigacion con ediciones manuales, no se recomienda su uso en produccion sin una evaluacion propia y una verificacion del informe tensor a tensor incluido en `wsp-patch/`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jungwook2358/Qwen3.5-4B-wsp-scope-exp0034-astra-research-opus-high-s2
- Checkpoint base (EXP-0034 session 1): https://huggingface.co/jungwook2358/Qwen3.5-4B-wsp-scope-exp0034-astra-research-opus-high
- Repositorio con script de reaplicacion: `python apply_patch.py  <output> [--patch steps/NN-name/patch.json]` (incluido en el repositorio del modelo)
- Informe de verificacion tensor a tensor: carpeta `wsp-patch/` del repositorio del modelo
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada
