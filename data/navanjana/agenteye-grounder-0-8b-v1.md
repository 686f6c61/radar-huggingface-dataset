# Navanjana/AgentEye-Grounder-0.8B-v1

## Resumen

AgentEye Grounder 0.8B v1 es un modelo de vision-lenguaje (VLM) experimental desarrollado por Navanjana, obtenido mediante un ajuste fino supervisado del modelo base Qwen/Qwen3.5-0.8B. Su tarea principal es el *grounding* de interfaces de usuario: dado un pantallazo (screenshot) y una instruccion en lenguaje natural como "Tap the Work favorite", el modelo devuelve un objeto JSON con una caja delimitadora (`bbox`) y un punto de clic (`point`) que identifican la region objetivo en la pantalla. Resuelve el problema de conectar instrucciones en lenguaje natural con coordenadas concretas en una UI, un paso necesario para agentes de escritorio.

El modelo tiene 873.438.784 parametros totales segun los pesos en safetensors (866.167.872 reportados en el log de entrenamiento). Se distribuye en formato safetensors bajo licencia MIT, con soporte para ingles y chino, y esta pensado como componente ligero de *grounding* visual dentro de arquitecturas de agentes mas amplias; no opera raton ni teclado por si mismo.

Su relevancia actual radica en que demuestra que un modelo por debajo de los 1.000 millones de parametros puede especializarse en una tarea de percepcion concreta con un ajuste fino de bajo coste (solo el 1,52 % de los parametros entrenables), lo que lo hace atractivo para prototipos de agentes de escritorio en hardware modesto. No obstante, es una version 1 experimental con documentacion incompleta en varios puntos clave.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en transformer (modelo base Qwen3.5-0.8B); detalles internos de la arquitectura no disponibles |
| Parametros totales | 873.438.784 (safetensors); 866.167.872 reportados en el log de entrenamiento |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para este fine-tune; el modelo base cuenta con version GGUF (unsloth/Qwen3.5-0.8B-GGUF) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un VLM de aproximadamente 0,8 mil millones de parametros, y se ajusta mediante *parameter-efficient fine-tuning* con Unsloth y el ecosistema de Hugging Face. El log de entrenamiento reporta 13.181.952 parametros entrenables (1,52 % del total), lo que confirma el uso de adaptadores tipo LoRA, aunque la configuracion exacta (rango, modulos objetivo, tasa de aprendizaje, optimizador, planificador, longitud de secuencia, resolucion de imagen y semilla) no esta disponible en la informacion proporcionada.

El dataset de entrenamiento es Salesforce/grounding_dataset, con 67.356 ejemplos reportados, en 1 epoca. El log indica 3.000 pasos totales con batch por dispositivo de 2, acumulacion de gradientes de 4 (batch efectivo de 8) y una unica GPU, mientras que la descripcion del proyecto menciona 30.000 pasos; existe una contradiccion explicita entre ambas cifras que el autor senala y que no se ha resuelto en la informacion disponible. El formato objetivo de salida es un JSON con `bbox` como `[x1, y1, x2, y2]` y `point` como `[cx, cy]`. No se documentan etapas de RLHF o DPO ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- *Grounding* condicionado por instruccion: identifica un elemento de la UI a partir de una instruccion en lenguaje natural y un pantallazo.
- Prediccion de caja delimitadora: devuelve `[x1, y1, x2, y2]` de la region objetivo.
- Prediccion de punto de clic: devuelve `[cx, cy]` como punto candidato dentro o cerca del objetivo.
- Salida estructurada en JSON, consumible directamente por un ejecutor externo que valide coordenadas antes de actuar.
- Comprension de imagenes y texto (pipeline image-text-to-text).
- Capacidades multilingues limitadas a ingles y chino.
- Integracion potencial en agentes de escritorio como componente de percepcion visual; no ejecuta acciones sobre el raton ni el teclado.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, modo *thinking*, audio ni otras modalidades.

## Casos de uso

- Automatizacion de pruebas de UI: dado un pantallazo de la aplicacion y una instruccion como "pulsa el boton de guardar", el modelo devuelve la caja y el punto de clic para que un framework de testing valide o ejecute la interaccion, reduciendo la dependencia de selectores fragiles.
- Agentes de escritorio asistidos: un orquestador captura la pantalla, pide al modelo la ubicacion del elemento descrito por el usuario y pasa las coordenadas a un ejecutor que realiza el clic tras validarlas, lo que permite prototipar asistentes de automatizacion en hardware modesto.
- Accesibilidad: transformar instrucciones verbales o escritas en coordenadas de pantalla para sistemas de control por voz o por teclado que necesiten localizar controles concretos de una interfaz.
- RPA ligera: sustituir reglas de localizacion por coordenadas fijas en flujos de extraccion de datos de aplicaciones de escritorio, usando el modelo para localizar campos y botones variables entre versiones de la UI.
- Investigacion en *grounding* visual: servir como linea base compacta para experimentar con tecnicas de ajuste fino, aumentacion de datos o formatos de salida en tareas de localizacion de elementos de UI.
- Prototipado de asistentes de soporte remoto: dado un pantallazo compartido por un usuario y una descripcion del problema, el modelo senala el control relevante para guiar al usuario paso a paso.
- Generacion de datos anotados: usar las predicciones como preetiquetado de cajas y puntos en capturas de pantalla, sujeto a revision humana, para construir datasets de *grounding* de UI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parametros, en precision completa (fp32) se requieren aproximadamente 3,5 GB solo para los pesos; en fp16/bf16, unos 1,8 GB; en cuantizacion de 8 bits, alrededor de 0,9 GB, y en 4 bits, unos 0,5 GB, a lo que hay que sumar el coste del codificador visual y de las activaciones, no cuantificado en la informacion disponible.
- GPU recomendadas: no especificadas por el autor; por tamano, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y superiores, asi como para A100 o H100 en despliegues por lotes.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4-6 GB de VRAM o mas, aunque no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: transformers (libreria declarada); el modelo base dispone de version GGUF de unsloth, lo que abre la puerta a llama.cpp u Ollama, aunque no se confirma que exista un GGUF de este fine-tune concreto. vLLM y TGI no estan documentados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentEye Grounder 0.8B v1 | 873 M | No disponible | Grounding de UI (bbox + punto) | MIT | Hugging Face (transformers, safetensors) |
| Qwen3.5-0.8B (base) | ~0,8 B | No disponible | VLM generalista | No disponible en la informacion | Hugging Face |
| Alternativas especializadas en grounding de UI de tamano similar | No disponible | No disponible | Grounding de UI | No disponible | No disponible |

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada; la comparacion se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Modelo experimental en version 1: el propio autor lo etiqueta como *Experimental* y orientado a investigacion y experimentacion, no a produccion sin validacion adicional.
- Contradiccion en el numero de pasos de entrenamiento: la descripcion del proyecto indica 30.000 pasos y el log de Unsloth 3.000; la cifra real no esta confirmada.
- Documentacion incompleta: no se detallan la configuracion del adaptador LoRA, la resolucion de imagen, la convencion exacta de coordenadas, el split del dataset ni las reglas de filtrado, lo que dificulta reproducir el entrenamiento.
- Ambiguedad sobre el checkpoint base: la model card pide confirmar que el modelo base coincide con el checkpoint realmente entrenado.
- Riesgo de alucinacion de coordenadas: al predecir cajas y puntos, puede devolver localizaciones plausibles pero incorrectas; es imprescindible un ejecutor que valide las coordenadas antes de actuar.
- Cobertura linguistica limitada a ingles y chino; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sin datos publicados de benchmarks, sesgos o evaluaciones de robustez frente a distintos tipos de UI, resoluciones o temas visuales.
- Licencia MIT, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B y del dataset Salesforce/grounding_dataset antes de un despliegue comercial.
- El modelo solo predice ubicaciones: no opera raton ni teclado, por lo que requiere un componente ejecutor externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Navanjana/AgentEye-Grounder-0.8B-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Version GGUF del modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/grounding_dataset
