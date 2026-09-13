# kzhao5/mea-qedks-defenses

## Resumen

El repositorio `kzhao5/mea-qedks-defenses` no es un modelo de propósito general, sino un paquete de artefactos de reproducción de investigación publicado por el usuario kzhao5 dentro del banco de pruebas MEA (el proyecto `A-Benchmark-for-Model-distillation-survey`). Contiene los adaptadores LoRA resultantes de ejecutar el ataque de extracción QEDKS contra cinco defensas de tipo generador, junto con el árbol de ejecución completo de cada una: planes de consulta, transcripciones del profesor, registros de consultas recibidas, artefactos de defensa y salidas de los detectores. El repositorio ocupa 0,8 GB y se distribuye bajo licencia Apache 2.0.

El montaje experimental es concreto: un profesor `Qwen/Qwen2.5-72B-Instruct` defendido, servido como oráculo en línea, y un estudiante `Qwen/Qwen2.5-7B` en su variante base, ajustado con LoRA de rango 16 y alpha 32 (dropout 0,05, bf16) sobre las respuestas extraídas mediante QEDKS con un presupuesto de 1000 consultas (3 de semilla, 498 de plantilla y 499 de seguimiento). El resultado principal invierte el del repositorio gemelo SeqKD: bajo QEDKS las dos marcas de agua analizadas sí se transfieren al estudiante extraído, mientras que la huella digital ADFP no lo hace.

Su relevancia es metodológica: ofrece a los investigadores en seguridad de modelos un caso reproducible para estudiar la robustez de las defensas anti-destilación frente a ataques adaptativos, y sirve como control negativo (pendiente de publicar) para comparar contra extracciones sobre profesores sin defensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptadores LoRA sobre el modelo base; el repositorio no define arquitectura propia |
| Parametros totales | No disponible con precision; el modelo base es `Qwen/Qwen2.5-7B` (denominacion de 7B) y los adaptadores publicados son LoRA de rango 16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B) |
| Tipos de cuantizacion | No se publican pesos cuantizados; los adaptadores se entrenan y almacenan en bf16 |
| Idiomas soportados | No disponible (no se declara ningun idioma en la model card ni en las etiquetas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el repositorio incluye tambien JSON de informes de detectores y manifiestos de ejecucion |
| Tamano del repositorio | 0,8 GB |
| Libreria | peft (con transformers para cargar el modelo base) |
| Modelo base | `Qwen/Qwen2.5-7B` |
| Modelo profesor | `Qwen/Qwen2.5-72B-Instruct` (defendido, servido como oraculo en linea) |

## Arquitectura y entrenamiento

El componente aprendido es un adaptador LoRA de rango 16 y alpha 32, con dropout 0,05, entrenado en bf16 sobre el modelo base `Qwen/Qwen2.5-7B`. No se modifica la arquitectura subyacente: el repositorio no introduce innovaciones en el transformer, sino en el procedimiento de extraccion. El entrenamiento no usa un corpus estatico, sino que se alimenta de las respuestas de un profesor `Qwen/Qwen2.5-72B-Instruct` defendido que actua como oraculo en linea. Al ser QEDKS un ataque adaptativo, no existe transcripcion precomputada: cada consulta se genera en funcion de las respuestas anteriores, lo que obliga a ejecutar el ataque contra el endpoint defendido en tiempo real.

El ataque emplea un presupuesto de 1000 consultas al profesor, desglosado en 3 consultas de semilla, 498 de plantilla y 499 de seguimiento. El repositorio conserva por cada defensa el arbol completo (`oracle/` con transcripcion y registro de consultas recibidas, `attack/qedks/<run>/` con planes de consulta, transcripciones del profesor, datos de entrenamiento, checkpoints intermedios y manifiesto), ademas de las salidas del detector. No se documentan en la informacion disponible fases de RLHF ni DPO sobre el estudiante, ni la composicion del dataset mas alla de las respuestas destiladas del profesor.

## Capacidades

- Generacion de texto condicionada por el profesor: los adaptadores son estudiantes destilados de `Qwen2.5-72B-Instruct`, por lo que reproducen parcialmente su distribucion de salida, pero no se publica ninguna evaluacion de capacidad generativa (MMLU, HumanEval, GSM8K u otras).
- Reproduccion de ataques de extraccion de modelos: el artefacto permite repetir la extraccion QEDKS contra cinco defensas (`ginsew`, `radioactivity`, `adfp`, `doge`, `trace_rewriting`).
- Evaluacion de marcas de agua en la salida: incluye informes de detector para `ginsew` (z-score sobre tasa verde) y `radioactivity` (p-valor sobre tasa verde).
- Evaluacion de huellas digitales: incluye informe del detector ADFP (gtp frente a gamma = 0,5 y -log10 p).
- Trazabilidad de consultas: conserva planes de consulta, transcripciones y registros del lado del oraculo, lo que permite auditar el comportamiento adaptativo del ataque.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking), vision o audio: no disponibles.

## Casos de uso

- Auditoria de robustez de marcas de agua: un equipo de seguridad puede cargar el adaptador de `ginsew` o `radioactivity` y comprobar si la marca del profesor sobrevive a una extraccion adaptativa, replicando el z = +18,49 y el p = 2,5e-08 reportados.
- Validacion de defensas anti-destilacion en produccion: antes de desplegar un oraculo comercial con `doge` o `trace_rewriting`, el repositorio permite medir si un atacante con 1000 consultas obtiene un estudiante funcional, usando los checkpoints publicados como referencia.
- Investigacion academica sobre extraccion de modelos: el arbol de ejecucion completo (`query_plans`, `teacher_transcripts`, `train_data`, checkpoints intermedios) permite estudiar como evoluciona la fidelidad del estudiante a lo largo del ataque, no solo al final.
- Construccion de controles negativos para detectores: los artefactos de `clean/` (aun no publicados) y la comparacion M4 entre estudiante defendido y estudiante limpio sirven para calibrar la distribucion nula de un detector antes de fijar umbrales.
- Reproducibilidad de benchmarks de seguridad: al incluir manifiestos de ejecucion y de defensa, otro laboratorio puede verificar los resultados del banco de pruebas MEA sin reejecutar el ataque desde cero.
- Analisis de coste computacional de defensas: el propio repositorio documenta que ADS requiere dos pasadas proxy adicionales por token (~4,3 minutos por consulta), dato util para dimensionar el coste de servir una defensa activa.
- Formacion y docencia en seguridad de IA: el repositorio sirve como ejemplo practico y completo de un flujo de extraccion con oraculo en linea, con todos los artefactos intermedios auditables.

## Benchmarks y rendimiento

Resultados de deteccion publicados en la model card (no son benchmarks de capacidad del modelo):

| Defensa | Tipo | Metrica | Valor | Detectado |
|---|---|---|---|---|
| ginsew | output_watermark | z-score (tasa verde) | z = +18,49 (0,5265) | Si, provisional (ver aviso) |
| radioactivity | radioactive_watermark | p-valor (tasa verde) | p = 2,5e-08 (0,2573) | Si (umbral del benchmark p < 1e-5) |
| adfp | output_fingerprint | gtp frente a gamma = 0,5; -log10 p | gtp = 0,508, -log10 p = 0,054 (p ≈ 0,88) | No |
| doge | anti_distillation_generator | Sin detector en el benchmark | No disponible | Solo checkpoint |
| trace_rewriting | anti_distillation_generator | Sin detector en el benchmark | No disponible | Solo checkpoint |

Aviso del propio autor sobre ginsew: la comparacion M4 enfrenta un estudiante positivo (defendido) contra un estudiante negativo (limpio) a traves del mismo detector, y la linea base limpia de QEDKS todavia no esta publicada. En SeqKD el estudiante limpio obtuvo z = -11,62 (no 0), de modo que el valor z = +18,49 debe tratarse como provisional hasta que se publique `clean/`. Los detectores de radioactivity y adfp no dependen de este problema porque son tests absolutos contra un nivel de azar conocido (gamma = 0,25 y gamma = 0,5 respectivamente).

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los adaptadores en si ocupan una fraccion pequena de los 0,8 GB del repositorio; el coste real lo determina el modelo base `Qwen2.5-7B`, que en bf16 requiere del orden de 15-16 GB de VRAM, sin contar la cache KV (no se especifica la longitud de contexto, por lo que no puede acotarse su crecimiento).
- GPU recomendadas: para bf16 sin cuantizar, una RTX 4090 (24 GB) o una L40S/A100 40 GB son suficientes para servir el modelo base con un adaptador LoRA. Para servir simultaneamente varios adaptadores de este repositorio (cinco defensas) es preferible una A100 80 GB o H100, o bien multiplexar por peticion.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, siempre que se sirva un unico adaptador y se limite la longitud de contexto; en GPUs de 16 GB o menos es necesario cuantizar el modelo base.
- Opciones de despliegue: `transformers` + `peft` es la ruta documentada por el autor (`AutoModelForCausalLM.from_pretrained` con `torch_dtype="bfloat16"`, `device_map="auto"` y `PeftModel.from_pretrained` apuntando al subdirectorio `ginsew/checkpoint-final`). vLLM admite adaptadores LoRA y es la opcion natural para servir varias defensas en paralelo. llama.cpp u Ollama requeririan fusionar el adaptador con el modelo base, convertirlo a GGUF y cuantizarlo, procedimiento no documentado en el repositorio.
- Latencia y throughput: no disponibles para inferencia. El unico dato de coste publicado se refiere a la ejecucion del ataque: la variante contra ADS necesita dos pasadas proxy adicionales por token, aproximadamente 4,3 minutos por consulta.
- Almacenamiento: 0,8 GB para los artefactos del repositorio, mas el peso completo del modelo base descargado por separado.

## Comparativa con modelos similares

| Artefacto | Modelo base | Ataque | Resultado de deteccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kzhao5/mea-qedks-defenses` (este) | Qwen2.5-7B + LoRA r=16 | QEDKS, 1000 consultas | ginsew y radioactivity si se transfieren; adfp no | apache-2.0 | Publico, 0 descargas |
| `kzhao5/mea-seqkd-defenses` | Qwen2.5-7B + LoRA | SeqKD | Ninguna de las tres defensas de marca de agua/huella sobrevivio | No disponible en la informacion | Publico (repositorio gemelo) |
| `Qwen/Qwen2.5-7B` | Transformer decoder-only 7B | No aplica (modelo base sin destilar) | No aplica | No disponible en la informacion | Publico |
| `Qwen/Qwen2.5-72B-Instruct` | Transformer decoder-only 72B | No aplica (profesor) | No aplica | No disponible en la informacion | Publico |

La comparacion relevante no es de capacidad, sino de metodologia: el interes del repositorio esta en que bajo QEDKS el resultado se invierte respecto a SeqKD para las defensas de marca de agua, mientras que el comportamiento de ADFP (no deteccion) se mantiene.

## Limitaciones y advertencias

- El z-score de ginsew (z = +18,49) es provisional: el control negativo `clean/` de QEDKS aun no esta publicado y, segun el autor, no puede reutilizarse el valor limpio de SeqKD (z = -11,62) porque la distribucion nula depende de la distribucion de salida del ataque.
- Resultados incompletos: la ejecucion de QEDKS contra la defensa ADS sigue en curso, y las defensas `doge` y `trace_rewriting` no tienen detector asociado en el benchmark, por lo que solo se publica el checkpoint.
- Cobertura limitada a cinco defensas y a un unico par profesor/estudiante (Qwen2.5-72B-Instruct sobre Qwen2.5-7B), lo que restringe la generalizacion de las conclusiones.
- Sin evaluacion de capacidad: no hay datos de MMLU, HumanEval, GSM8K ni de calidad generativa del estudiante, ni comparacion sistematica con el profesor mas alla de los detectores.
- Sin informacion de sesgos, alucinacion o comportamiento multilingue; el repositorio no declara idiomas soportados.
- Sin `pipeline` declarado y con 0 descargas y 0 likes, el artefacto no ha sido validado por terceros.
- Uso previsto de investigacion en seguridad: los adaptadores son estudiantes extraidos de un profesor defendido; su uso en produccion como sustituto del profesor no esta evaluado ni recomendado por el autor.
- Licencia Apache 2.0: permite uso comercial del material publicado, pero quien reutilice el modelo base `Qwen2.5-7B` o el profesor `Qwen2.5-72B-Instruct` debe ademas cumplir las condiciones de esos modelos, no detalladas en este repositorio.
- El contenido de la model card es material de referencia del autor y no debe interpretarse como instrucciones operativas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kzhao5/mea-qedks-defenses
- Repositorio gemelo (SeqKD): https://huggingface.co/kzhao5/mea-seqkd-defenses
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Banco de pruebas citado por el autor: `A-Benchmark-for-Model-distillation-survey` (referenciado en la model card sin URL publicada; no disponible)
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos eran contenidos no relacionados sobre incidencias de correo en compras de una marca de ropa.
