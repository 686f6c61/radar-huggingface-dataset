# gyohng/flint-terse-minimalist

## Resumen

Flint Terse Minimalist es un adaptador LoRA en formato GGUF para el modelo Recursive Flint, desarrollado por el usuario gyohng. Su proposito es reducir drasticamente la longitud del razonamiento interno que el modelo genera dentro de las etiquetas `<think>`, manteniendo intactas las respuestas finales. Segun la model card, consigue una reduccion del 81% en tokens de pensamiento para tareas de codigo, del 86% en matematicas y del 85% en prosa y chat, con una perdida de precision de aproximadamente 4 tareas de codigo sobre 110 respecto al modelo base.

El adaptador se aplica sobre el checkpoint int4 del modelo base sin modificarlo, por lo que no requiere reentrenar ni sustituir los pesos originales. Esta pensado para entornos de inferencia local con llama.cpp y LM Studio, y existe una variante separada para MLX. El interes actual reside en que permite desplegar un modelo con capacidad de razonamiento explicito en hardware modesto, reduciendo el coste en tokens de salida y la latencia asociada al modo de pensamiento.

El modelo base, Recursive Flint, es un modelo MoE (mezcla de expertos) con 126.615.552 parametros totales reportados en safetensors, licencia Apache-2.0 y entrenamiento orientado a razonamiento y codigo. La ficha se centra en el adaptador, pero describe el comportamiento del conjunto base mas adaptador tal como lo documenta el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con atencion y expertos enrutados; el adaptador actua sobre atencion, experto compartido, MLPs densos y `down_proj` de las ultimas 16 capas MoE |
| Parametros totales | 126.615.552 (modelo base, dato de safetensors); el adaptador LoRA es un fichero GGUF de 339 MB |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base en int4 (fichero `flint-int4-q4_1.gguf`); el adaptador se distribuye en GGUF y se aplica sobre esa cuantizacion concreta |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA); base en GGUF int4 q4_1 |

## Arquitectura y entrenamiento

El adaptador se entrena directamente sobre los coeficientes int4 del modelo base, sin desquantizar, mediante LoRA de rango 32 en FP32 aplicado a las capas de atencion, al experto compartido y a los MLPs densos. Ademas, adapta los expertos enrutados con LoRA por experto sobre `down_proj` en las ultimas 16 capas MoE, lo que exige una version de llama.cpp con soporte de LoRA por experto. El entrenamiento combina una fase de aprendizaje por refuerzo, en la que una respuesta solo obtiene recompensa si supera sus tests y cabe en un presupuesto de pensamiento decreciente, con una pasada supervisada posterior para ensenar el estilo telegrafico en prosa y chat.

La innovacion principal no esta en la arquitectura del modelo base, sino en el procedimiento de destilacion del razonamiento: se penaliza explicitamente la verbosidad del bloque `<think>` y se premia la correccion funcional, lo que produce un modo de pensamiento abreviado sin degradar de forma significativa la respuesta final. El adaptador no modifica los pesos base, de modo que puede cargarse y descargarse sin alterar el checkpoint original.

## Capacidades

- Generacion de texto conversacional con respuestas finales completas.
- Razonamiento en modo pensamiento abreviado dentro de `<think>`, con reduccion del 81-86% de tokens segun categoria.
- Resolucion de tareas de codigo: 98,0 sobre 110 tareas en la evaluacion del autor.
- Resolucion de tareas matematicas: 108,0 sobre 120 tareas en la evaluacion del autor.
- Generacion de prosa y chat con reduccion del 85% de pensamiento respecto al base.
- Compatibilidad con llama.cpp y LM Studio mediante carga de LoRA GGUF.
- Variante separada para MLX (Apple Silicon).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- No se documentan capacidades multilingues explicitas; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Asistentes de codigo en local: el adaptador mantiene 98,0 sobre 110 tareas de codigo con un 81% menos de tokens de pensamiento, lo que reduce el coste por consulta en entornos de desarrollo integrado con llama.cpp.
- Razonamiento matematico por lotes: con 108,0 sobre 120 tareas y un 86% menos de pensamiento, es adecuado para pipelines que resuelven problemas aritmeticos o algebraicos de forma masiva donde el coste de salida importa.
- Chat de atencion al cliente: la reduccion del 85% en prosa y chat disminuye la latencia percibida en conversaciones multi-turno, manteniendo respuestas finales completas.
- Despliegue en portatiles y equipos de sobremesa: al ser un LoRA de 339 MB sobre un base int4, permite ejecutar un modelo con modo de razonamiento en hardware de consumo mediante LM Studio.
- Prototipado rapido de agentes con razonamiento acotado: el pensamiento telegrafico reduce el riesgo de desbordar presupuestos de tokens en cadenas de varios pasos, aunque el soporte de agentes no esta documentado explicitamente.
- Evaluacion comparativa de estilos de razonamiento: sirve como referencia para estudiar el equilibrio entre verbosidad del pensamiento y precision en tareas verificables, dado que el autor publica el codigo y los datos de reproduccion.
- Integracion en flujos de CI con llama-server: el binario admite `--lora` y plantilla Jinja, lo que facilita pruebas automatizadas de generacion con muestreo fijo (temperatura 1, top-p 0,95, top-k 20).

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre el base int4 sin modificar en llama.cpp, media de tres semillas con una muestra por tarea (temperatura 1, top-p 0,95, top-k 20):

| Modelo | Codigo (110 tareas) | Matematicas (120 tareas) | Menos pensamiento: codigo | matematicas | prosa y chat |
|---|---:|---:|---:|---:|---:|
| Flint int4 (base) | 102,3 | 103,3 | — | — | — |
| flint-terse | 102,7 | 109,7 | 62% | 79% | 85% |
| flint-terse-minimalist | 98,0 | 108,0 | 81% | 86% | 85% |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ni comparaciones con modelos de otros autores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el base se distribuye en int4 q4_1 y el adaptador ocupa 339 MB adicionales.
- GPU recomendadas: no disponible. El autor documenta ejecucion en llama.cpp y LM Studio, incluido LM Studio en Mac, lo que sugiere viabilidad en Apple Silicon y GPUs de consumo.
- Cabe en GPU de consumo: probablemente si, dado el tamano del base en int4 y el LoRA de 339 MB, aunque no se aporta una cifra de VRAM concreta.
- Opciones de despliegue: llama.cpp (`llama-server` con `--lora` y `--jinja`), LM Studio con el loader del repositorio GitHub, y MLX mediante la variante `flint-terse-minimalist-mlx`.
- Requisito critico: se necesita una build de llama.cpp con soporte de LoRA por experto; no se ha probado con el llama.cpp incluido en LM Studio y, si falla, el autor recomienda usar `flint-terse`.
- Latencia y throughput: no disponibles; la reduccion de tokens de pensamiento (81-86%) implica menor coste de decodificacion, pero no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Codigo (110) | Matematicas (120) | Menos pensamiento | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|---|
| Flint int4 (base) | 126.615.552 | no disponible | 102,3 | 103,3 | — | Apache-2.0 | Hugging Face |
| flint-terse | no disponible | no disponible | 102,7 | 109,7 | 62% / 79% / 85% | Apache-2.0 | Hugging Face |
| flint-terse-minimalist | 126.615.552 (base) | no disponible | 98,0 | 108,0 | 81% / 86% / 85% | Apache-2.0 | Hugging Face |

No se dispone de datos para comparar con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Solo es compatible con el fichero `flint-int4-q4_1.gguf` en la revision `9c47151036bc2c34331142dda04488bceab2bc9f` y con el SHA-256 indicado; otras cuantizaciones son checkpoints distintos y no estan soportadas.
- Requiere una build de llama.cpp con soporte de LoRA por experto; puede fallar en el llama.cpp incluido en LM Studio.
- La plantilla de chat incluida elimina el `replace("\x00", "")` original porque el motor de plantillas de LM Studio no lo soporta; usar otra plantilla puede alterar el comportamiento.
- Perdida de precision en codigo de aproximadamente 4 tareas sobre 110 respecto al base (98,0 frente a 102,3); para maxima precision en codigo el autor recomienda `flint-terse`.
- Los benchmarks son del propio autor, con una muestra por tarea y tres semillas; no hay validacion independiente.
- No se documentan sesgos conocidos, comportamiento multilingue ni evaluaciones de alucinacion.
- Licencia Apache-2.0 sin condiciones adicionales, lo que permite uso comercial, pero el modelo base y el adaptador se distribuyen sin garantias.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/gyohng/flint-terse-minimalist
- Variante MLX: https://huggingface.co/gyohng/flint-terse-minimalist-mlx
- Adaptador hermano con mayor precision en codigo: https://huggingface.co/gyohng/flint-terse
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Base int4 GGUF: https://huggingface.co/RecursiveSI/flint-int4-gguf
- Repositorio con codigo, datos y reproduccion: https://github.com/gyohng/flint-terse
- Organizacion Recursive: https://huggingface.co/RecursiveSI
