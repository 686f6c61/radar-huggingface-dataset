# fayaz-mgs/shesnake-4b

## Resumen

SheSnake-4B es un adaptador QLoRA de caracter exploratorio publicado por el usuario fayaz-mgs sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, orientado a la generacion de funciones Python compactas. No es un modelo fundacional entrenado desde cero: parte del checkpoint cuantizado a 4 bits de la comunidad MLX y congela los pesos originales, entrenando unicamente aproximadamente 3,67 millones de parametros (0,091 % del total de 4,02 mil millones).

El proyecto entrena sobre 104 ejemplos verificados del split sanitized/train del dataset MBPP (Google Research), con 16 ejemplos de validacion, 200 pasos, batch efectivo 4, learning rate 1e-5 y LoRA de rango 8 sobre 8 capas adaptadas. Su relevancia actual es metodologica: demuestra que un ajuste muy reducido, ejecutado localmente en formato MLX y sobre pesos en 4 bits, puede alcanzar 140/164 (85,4 %) en HumanEval y 130/164 (79,3 %) en HumanEval+ en el checkpoint exacto evaluado.

Se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin resultados en leaderboards oficiales y con advertencias explicitas del autor sobre integridad de evaluacion: la ejecucion completa del Qwen base sin ajustar no se ha completado y el par modelo-benchmark se eligio durante la exploracion, por lo que el resultado es exploratorio y no confirmatorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada del modelo base Qwen3-4B-Instruct-2507, con adaptador QLoRA (LoRA de rango 8) sobre pesos congelados |
| Parametros totales | 4,02 mil millones (modelo base); aproximadamente 3,67 millones entrenables en el adaptador (0,091 %) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (viene determinada por el modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | Checkpoint base en 4 bits (mlx-community/Qwen3-4B-Instruct-2507-4bit); adaptador LoRA entrenado sobre esa base; export merged en safetensors planificado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (adaptador y materiales originales del proyecto); datos MBPP derivados bajo CC BY 4.0; el modelo base Qwen conserva su licencia Apache-2.0 |
| Formato de pesos | MLX (adaptador); safetensors merged anunciado como trabajo futuro |
| Libreria | mlx |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Checkpoint base exacto | mlx-community/Qwen3-4B-Instruct-2507-4bit, revision 50d427756c6b1b2fe0c0a10f67fbda1fc8e82c1b |
| Dataset de entrenamiento | google-research-datasets/mbpp (104 ejemplos verificados de sanitized/train) |
| Fecha de creacion | 2026-09-11 |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura transformer decoder-only del modelo Qwen3-4B-Instruct-2507, sin modificaciones estructurales. El entrenamiento emplea QLoRA con los pesos base congelados y cuantizados a 4 bits: LoRA de rango 8, escala 20, dropout 0, semilla 0 y 8 capas adaptadas. La configuracion de optimizacion es de 200 pasos con batch efectivo 4 y learning rate 1e-5. El conjunto de datos son 104 ejemplos del split sanitized/train de MBPP, admitidos solo si cada solucion compilaba y superaba las aserciones incluidas en su registro original; se reservaron 16 ejemplos del mismo origen para validacion.

La innovacion del trabajo no esta en la arquitectura, sino en el procedimiento de evaluacion y en su trazabilidad. La evaluacion se realizo con evalplus==0.3.1, una unica completion greedy por tarea, temperatura 0, limite de 768 tokens nuevos y la misma ruta de prompt, sanitizacion y scoring ejecutable de EvalPlus. El autor documenta controles de integridad: no se usaron soluciones de HumanEval ni HumanEval+ como objetivos supervisados, las 164 tareas produjeron salida y registro de evaluacion en cada modelo reportado, y los prompts de MBPP se filtraron por similitud literal normalizada igual o superior a 0,82 contra los prompts de HumanEval+, sin que ningun ejemplo cruzara el umbral. El propio autor advierte que este filtro no constituye prueba de descontaminacion semantica y que no puede descartarse la exposicion a benchmarks publicos durante el pretraining upstream.

## Capacidades

- Generacion de funciones Python autocontenidas a partir de una firma y una descripcion, que es la tarea sobre la que se entreno y evaluo (estilo MBPP y HumanEval).
- Razonamiento de codigo y matematicas basicas heredado del modelo base Qwen3-4B-Instruct-2507, aunque no se documentan mediciones especificas para el adaptador.
- Generacion de texto general en ingles, heredada del modelo base y no evaluada de forma independiente en la model card.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible ni evaluado; HumanEval+ solo mide funciones aisladas.
- Capacidades multilingues: solo ingles declarado; pese al nombre del modelo y al saludo en frances de la model card, esta explicitamente indicado que el resultado no demuestra capacidad en frances.
- Capacidad especial: ninguna adicional (sin vision, audio ni modo thinking documentado).
- Integracion con el ecosistema MLX y ejecucion local sobre Apple Silicon.

## Casos de uso

- Generacion de utilidades Python aisladas en un asistente de codigo local: el adaptador esta ajustado sobre ejemplos del tipo "firma mas docstring, devuelve la funcion", que es exactamente el formato de MBPP, por lo que encaja en tareas de funcion unica sin dependencias de repositorio.
- Prototipado offline en portatiles Apple Silicon: al ser un adaptador MLX sobre una base 4-bit, el conjunto se ejecuta localmente sin GPU dedicada ni conexion de red, util en entornos con requisitos de privacidad del codigo.
- Investigacion en eficiencia de ajuste: sirve como referencia reproducible para estudiar que rendimiento se obtiene con 0,091 % de parametros entrenables, 200 pasos y 104 ejemplos, comparando contra la misma base sin ajustar.
- Reproduccion y auditoria de pipelines de evaluacion: el proyecto publica metodo, codigo y evidencia agregada, por lo que es util para replicar un arnes EvalPlus con temperatura 0, limite de 768 tokens y scoring ejecutable sobre checkpoints 4-bit.
- Generacion de aserciones y pruebas unitarias para funciones cortas: el entrenamiento exige que cada solucion pase las aserciones de su registro MBPP, lo que favorece respuestas que se autoconsisten con pruebas concretas.
- Scripts de transformacion y parseo de datos: tareas breves y autocontenidas de Python, que es el dominio mas cercano a la distribucion de entrenamiento.
- Docencia y demostraciones de ajuste fino: permite mostrar en un solo cuaderno el ciclo completo de QLoRA sobre MLX, desde la validacion de ejemplos hasta la evaluacion con HumanEval y HumanEval+.
- Comparacion controlada de adaptadores pequenos frente a modelos de 3 a 4 mil millones en 4 bits, siempre que se respete la advertencia de que el resultado es exploratorio.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos localmente con evalplus==0.3.1, una completion greedy por tarea, temperatura 0, limite de 768 tokens nuevos y misma ruta de prompt y scoring.

| Checkpoint local | HumanEval | HumanEval+ |
|---|---:|---:|
| SheSnake-4B | 140/164 (85,4 %) | 130/164 (79,3 %) |
| mlx-community/Ministral-3-3B-Instruct-2512-4bit | 124/164 (75,6 %) | 117/164 (71,3 %) |

- La diferencia observada en HumanEval+ es de +13 tareas, equivalente a +8,0 puntos porcentuales sobre Ministral-3-3B-Instruct-2512-4bit en el checkpoint 4-bit exacto.
- El autor indica que estas son mediciones locales emparejadas, no una posicion en leaderboard oficial ni una afirmacion sobre todas las variantes de Mistral o Qwen.
- Puerta de sistemas sobre las 10 primeras tareas de HumanEval+: Ministral 8/10, Qwen sin ajustar 9/10, SheSnake 9/10.
- No se ha completado una ejecucion completa de Qwen3-4B-Instruct-2507 sin ajustar, por lo que no se afirma que el adaptador mejore a la base en el conjunto completo de HumanEval+.
- No hay datos de MMLU, GSM8K, MBPP puntuado ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento y memoria: al partir de un checkpoint de 4,02 mil millones de parametros en 4 bits, los pesos ocupan del orden de 2 a 2,5 GB; con overhead de runtime y cache KV conviene disponer de 4 GB o mas de memoria unificada (estimacion derivada del tamano del checkpoint, no medida publicada).
- Plataforma: MLX esta disenado para Apple Silicon, por lo que el adaptador requiere un Mac con chip de la serie M. Cualquier Mac con 16 GB de memoria unificada es un objetivo razonable; 8 GB es el minimo practico.
- GPU NVIDIA/AMD: no hay soporte directo; el autor advierte que un adaptador MLX no es automaticamente compatible con modelos que requieren AutoClass de Transformers, y no se menciona conversion a GGUF ni CUDA.
- Opciones de despliegue: mlx-lm (carga del adaptador sobre el checkpoint base indicado). vLLM, TGI, llama.cpp y Ollama no estan documentados para este artefacto. El servidor compatible con la API de OpenAI de mlx-lm no aparece citado explicitamente en la model card.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo por tarea.
- Export standalone: pendiente de un merged Safetensors planificado, necesario para entornos que exigen un modelo Transformers autocontenido.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y cuantizacion | HumanEval | HumanEval+ | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| SheSnake-4B (este modelo) | 4,02 mil millones (3,67 M entrenables) | Adaptador MLX sobre base 4-bit | 140/164 (85,4 %) | 130/164 (79,3 %) | apache-2.0 (datos MBPP CC BY 4.0) | Publicado en HuggingFace; 0 descargas, 0 likes; export safetensors pendiente |
| Qwen3-4B-Instruct-2507 sin ajustar | 4,02 mil millones | Base del adaptador; checkpoint MLX 4-bit | no disponible (ejecucion completa no realizada) | solo puerta de 10 tareas: 9/10 | Apache-2.0 | Ampliamente disponible |
| mlx-community/Ministral-3-3B-Instruct-2512-4bit | aproximadamente 3 mil millones | MLX 4-bit | 124/164 (75,6 %) | 117/164 (71,3 %) | no disponible | Disponible en HuggingFace |

Nota: la comparacion procede integramente de la model card del autor y corresponde a mediciones locales emparejadas sobre checkpoints 4-bit concretos, con tokenizers, plantillas de chat y paquetes de serving propios de cada modelo, lo que el propio autor senala como posible factor de confusion.

## Limitaciones y advertencias

- Entrenamiento con solo 104 ejemplos supervisados y 16 de validacion, sobre un unico dominio (funciones Python cortas de MBPP); la varianza entre semillas no se ha medido.
- HumanEval+ mide funciones aisladas: no establece capacidad de ingenieria de software a nivel de repositorio, ni calidad de razonamiento general, ni superioridad amplia sobre otra familia de modelos.
- No se ha completado la ejecucion del Qwen base sin ajustar en HumanEval+ completo, por lo que no se puede afirmar mejora sobre la base.
- Riesgo de contaminacion: no puede descartarse la exposicion a benchmarks publicos durante el pretraining upstream; el filtro de similitud literal de 0,82 frente a HumanEval+ no prueba descontaminacion semantica.
- Sesgo de seleccion experimental: el par modelo-benchmark se eligio durante la exploracion, de modo que el resultado es exploratorio y no un experimento confirmatorio preregistrado. Reentrenar tras ver este resultado convertiria HumanEval+ en datos de desarrollo del proyecto.
- Confusores tecnicos no descartados: cada checkpoint usa su propio tokenizer, plantilla de chat y paquete de serving MLX, ademas de posibles efectos de conversion y cuantizacion.
- Idioma: solo se declara ingles; la capacidad en frances no esta establecida pese al nombre del modelo y al saludo en frances de la model card.
- Uso previsto restringido a investigacion y experimentacion con revision humana; no esta validado para generacion de codigo en entornos criticos de seguridad ni para produccion.
- Riesgo de alucinacion propio de la generacion de codigo: funciones y APIs plausibles pero inexistentes, especialmente fuera del dominio de MBPP.
- Licencia: el adaptador y los materiales del proyecto son Apache-2.0, pero los registros de entrenamiento derivados de MBPP estan atribuidos bajo CC BY 4.0 y el modelo base Qwen conserva su propia licencia Apache-2.0, que debe respetarse en cualquier redistribucion.
- Compatibilidad: el adaptador MLX no es automaticamente valido para leaderboards que exigen un modelo AutoClass de Transformers; el export merged en safetensors esta anunciado pero no disponible.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes, repositorio de 0,0 GB), sin validacion independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fayaz-mgs/shesnake-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint base MLX 4-bit: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit (revision 50d427756c6b1b2fe0c0a10f67fbda1fc8e82c1b)
- Repositorio del proyecto, con metodo, codigo y evidencia agregada: https://github.com/abrarf316/SheSnake-4B
- Dataset de entrenamiento MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
- Arnes de evaluacion: evalplus, version 0.3.1 citada en la model card (sin URL incluida en la informacion proporcionada)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente resultados sobre la actriz espanola Maria Barranco, sin relacion con este artefacto.
