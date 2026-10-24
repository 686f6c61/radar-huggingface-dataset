# hamlab-princeton/pastcasting-talkie-cpt

## Resumen

pastcasting-talkie-cpt es un repositorio de investigación publicado por hamlab-princeton que reúne una familia de checkpoints de un modelo de lenguaje de aproximadamente 13.000 millones de parámetros especializado en lenguaje histórico. El punto de partida es talkie-lm/talkie-1930-13b-base, un modelo entrenado únicamente con texto anterior a 1931, sobre el que se aplica preentrenamiento continuado (continued pretraining, CPT) con corpus de periodos posteriores: 1931-1935 y 1936-1941.

El repositorio no es un modelo único: contiene el checkpoint base y, para cada periodo, un checkpoint de medio pase y otro de un pase completo, lo que permite estudiar la progresión del aprendizaje de vocabulario y hechos de cada época. La metodología se enmarca en el "pastcasting", es decir, la evaluación de modelos históricos con preguntas cuya respuesta se conocía en la fecha simulada, y se apoya en un banco factual de 52.000 preguntas (1.000 por año entre 1921 y 1972) con etiquetas, procedencia de fuentes y calibración de referencia independiente.

Su interés actual es metodológico: ofrece pesos en FP32, adaptadores SFT (PEFT) y un cargador propio para reproducir experimentos de adquisición de conocimiento factual y de contaminación temporal, más que un modelo listo para producción. El autor advierte explícitamente de que son checkpoints de investigación y que su disponibilidad no implica que se hayan superado las puertas de aceptación de adquisición o retención de conocimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Talkie (modelo de lenguaje tipo transformer; requiere cargador propio `pastcasting.model.load_talkie_any`) |
| Parametros totales | ~13.000 millones (13B, según el nombre del modelo base y la model card) |
| Parametros activos | No aplica (no se describe como modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en FP32 (safetensors fragmentados para CPT y `final.ckpt` para el base) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors FP32 fragmentados (checkpoints CPT); `final.ckpt` (base upstream); adaptadores PEFT/LoRA en formato `adapter-*` |
| Checkpoints incluidos | Talkie 1930 Base; 1931-1935 CPT medio pase (step 3.372); 1931-1935 CPT un pase (step 6.736); 1936-1941 CPT medio pase (step 3.809); 1936-1941 CPT un pase (step 7.612) |
| Tokenizador | `base/talkie-1930/vocab.txt` (cargado con `get_talkie_tokenizer`) |
| Dataset de evaluación | hamlab-princeton/pastcasting-factual-52k (52.000 preguntas, 1.000 por año, 1921-1972) |
| Tamaño del repositorio | 427,5 GB |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 0 descargas, 1 like (en el momento de la consulta) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo Talkie, propietaria del proyecto talkie-lm y no soportada por `AutoModelForCausalLM` de Transformers: el repositorio incluye un runtime propio (`runtime/requirements.txt` y el paquete `pastcasting`) con las funciones `load_talkie_any` y `get_talkie_tokenizer`. El checkpoint base se conserva en su formato original `final.ckpt`, mientras que los checkpoints de CPT se distribuyen como safetensors fragmentados en FP32, lo que explica el tamaño de 427,5 GB del repositorio completo. El modelo base está fijado al commit `b7c97680791f7fca4262c3c80b36ff7d666faab0`.

El entrenamiento consiste en preentrenamiento continuado sobre corpus de periodos históricos concretos. Es importante la precisión terminológica del autor: los "pases" se refieren al corpus del periodo recién introducido, no a la exposición total acumulada del modelo. Existen dos niveles por periodo (medio pase y un pase completo), con pasos documentados de 3.372 y 6.736 para 1931-1935 y de 3.809 y 7.612 para 1936-1941. Además, el medio pase de 1936-1941 precede a una continuación con replay acumulado ampliado: esa continuación reanudó desde el paso 3.809 y cambió la política de replay a partir del paso 3.810, por lo que su checkpoint final no es idéntico al que se habría obtenido continuando la receta de replay original sin cambios.

Sobre los checkpoints se publican adaptadores SFT (`adapter-1931-final`, `adapter-2027-final` y variantes de punto medio) que no están fusionados con los pesos base y se cargan con `peft.PeftModel.from_pretrained`. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del corpus de CPT, ni si se aplicaron fases de RLHF o DPO. Las comparaciones factuales controladas reportadas usan la semilla final 1931, sin selección de semilla.

## Capacidades

- Generación de texto en inglés con registro y vocabulario coherentes con el periodo histórico modelado (anterior a 1931 en el base, hasta 1941 en los checkpoints CPT).
- Modelado de lenguaje autorregresivo y continuación de texto; no se documentan modos de razonamiento explícito ni "thinking mode".
- Respuesta a preguntas factuales históricas, evaluable mediante el banco de 52.000 preguntas con etiquetas y calibración de referencia.
- Adaptación supervisada (SFT) mediante adaptadores PEFT cargables por separado, lo que permite comparar el modelo base y el ajustado sin duplicar pesos.
- Comparación controlada entre checkpoints de distinto número de pases, útil para medir adquisición y retención de conocimiento por periodo.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no; el modelo declara únicamente inglés (`en`).
- Capacidades de visión, audio o multimodalidad: no documentadas.
- Capacidad especial: el "pastcasting" como marco de evaluación contrafactual de conocimiento histórico, no como funcionalidad de inferencia.

## Casos de uso

- Investigación sobre contaminación temporal y conocimiento histórico: cargar el checkpoint base y los CPT del mismo periodo para medir cuánto sabe el modelo de hechos posteriores a su fecha de corte, usando el banco de 52.000 preguntas como test reproducible.
- Estudio de curvas de adquisición de conocimiento: comparar medio pase frente a un pase completo en 1931-1935 y 1936-1941 para cuantificar la relación entre pasos de CPT y precisión factual, con la salvedad de que los pases se cuentan sobre el corpus del periodo nuevo.
- Análisis de deriva lingüística: calcular perplejidad y distribución de vocabulario sobre textos de cada década para caracterizar cómo el CPT desplaza el registro del modelo sin reentrenar desde cero.
- Generación de texto con ambientación de época para narrativa, guiones o divulgación histórica en inglés, aceptando que el modelo no es una fuente factual fiable y que requiere revisión humana.
- Reproducción de experimentos de alineación y sesgos: la literatura secundaria sobre Talkie 1930 reporta estudios de desalineación emergente y aprendizaje subliminal en este modelo base, por lo que estos checkpoints sirven como material para replicar ese tipo de análisis.
- Construcción de pipelines de evaluación propios: integrar el cargador `load_talkie_any` en un arnés de evaluación junto con el banco factual y su calibración independiente para comparar recetas de CPT (con y sin replay acumulado).
- Ajuste fino posterior con los adaptadores PEFT incluidos: partir de `adapter-1931-final` para tareas factuales o de estilo específicas sin tocar los pesos FP32 completos, manteniendo la trazabilidad respecto al checkpoint original.
- Docencia y divulgación técnica: ilustrar cómo se diseña un experimento de preentrenamiento continuado con grupos de control por periodo y un banco de evaluación con procedencia de fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona comparaciones factuales controladas (semilla final 1931, sin selección de semilla) sobre el banco de 52.000 preguntas, pero no incluye las puntuaciones numéricas. El autor advierte además que las evaluaciones de checkpoints ausentes no deben interpretarse como puntuaciones de cero.

## Requisitos de hardware

- VRAM estimada: los pesos en FP32 de un modelo de 13B ocupan aproximadamente 52 GB, a los que hay que sumar activaciones y caché KV; el autor indica que un checkpoint de 13B "necesita RAM sustancial". La cifra exacta de VRAM para contexto largo no está disponible.
- GPU recomendadas: A100 80 GB u H100 80 GB en una sola tarjeta; en su defecto, despliegue multi-GPU con paralelismo de tensor para repartir los 52 GB de pesos.
- GPU de consumo: no cabe en FP32 en una RTX 4090 (24 GB) ni en tarjetas de 48 GB. No se publican versiones GGUF, AWQ ni GPTQ, por lo que usar el modelo en GPU de consumo exigiría cuantizarlo por cuenta propia, algo no soportado de forma oficial por el runtime.
- CPU: viable únicamente con el cargador propio y del orden de 64 GB o más de RAM del sistema; el rendimiento será muy bajo para generación interactiva.
- Opciones de despliegue: el runtime propio del repositorio (`runtime/requirements.txt` más `pastcasting.model`). No es un repositorio `AutoModelForCausalLM.from_pretrained`, por lo que vLLM, TGI, llama.cpp u Ollama no funcionan de forma directa sin trabajo de adaptación.
- Almacenamiento: el repositorio completo ocupa 427,5 GB; conviene descargar un único checkpoint con `allow_patterns` en lugar del snapshot completo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad y formato | Notas |
|---|---|---|---|---|---|
| pastcasting-talkie-cpt (1936-1941, un pase) | ~13B | no disponible | Apache 2.0 | Pesos FP32 en safetensors, cargador propio | Punto máximo de CPT histórico del repositorio |
| Talkie 1930 Base | ~13B | no disponible | Consultar `LICENSE`/`NOTICE` del repositorio upstream | `final.ckpt`, cargador propio | Punto de partida sin CPT; texto anterior a 1931 |
| Talkie 1930 + adaptador SFT (adapter-1931-final / adapter-2027-final) | ~13B + adaptador | no disponible | Apache 2.0 | PEFT, no fusionado | Permite comparar base frente a ajustado con los mismos pesos |
| Modelos comparables de terceros (entrenamiento histórico por periodos) | no disponible | no disponible | no disponible | no disponible | No se aportan datos de otros proyectos en la información proporcionada |

## Limitaciones y advertencias

- Idiomas: solo inglés; no hay soporte multilingüe declarado ni evidencias de comportamiento en castellano.
- Contexto: la longitud de contexto no se documenta, lo que impide planificar cargas de trabajo que dependan de ventanas largas.
- Integración: no es un repositorio `AutoModelForCausalLM`; requiere el runtime propio y un tokenizador cargado desde `vocab.txt`. Esto rompe la compatibilidad con el ecosistema estándar de inferencia.
- Coste: pesos en FP32 y 427,5 GB de repositorio hacen inviable el despliegue en hardware de consumo sin cuantización propia y no validada.
- Estado de investigación: el autor indica que la disponibilidad de los checkpoints no implica que se hayan superado las puertas de aceptación de adquisición o retención; no deben presentarse como modelos validados.
- Alucinación: al ser un modelo de lenguaje entrenado con corpus históricos, puede generar hechos, citas y fechas plausibles pero falsos, especialmente en periodos no cubiertos por el CPT.
- Sesgos: el corpus previo a 1931 y el de los años treinta y cuarenta refleja los puntos de vista, inclusiones y exclusiones de las fuentes digitalizadas de esas décadas, con los sesgos sociales e ideológicos correspondientes.
- Riesgo de desalineación: la literatura secundaria sobre Talkie 1930 reporta estudios de desalineación emergente y aprendizaje subliminal en este modelo base; conviene auditar el comportamiento antes de cualquier uso abierto al público.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base upstream tiene su propia atribución (`NOTICE` y `LICENSE`), que debe revisarse y conservarse.
- Reproducibilidad: el checkpoint de 1936-1941 de un pase no equivale a continuar la receta de replay original sin cambios, por lo que las comparaciones con ese punto requieren documentar la diferencia.
- Despliegue en producción: sin benchmarks publicados ni cifras de latencia, no es recomendable usar estos checkpoints en producción sin una evaluación propia previa.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/hamlab-princeton/pastcasting-talkie-cpt
- Carpeta del checkpoint base: https://huggingface.co/hamlab-princeton/pastcasting-talkie-cpt/tree/main/base/talkie-1930
- Dataset factual de 52.000 preguntas: https://huggingface.co/datasets/hamlab-princeton/pastcasting-factual-52k
- Modelo base upstream Talkie 1930 13B: https://huggingface.co/talkie-lm/talkie-1930-13b-base
- Commit fijado del modelo base: `b7c97680791f7fca4262c3c80b36ff7d666faab0`
- Estado de verificación de la subida: `release-status.json` en la raíz del repositorio
- Requisitos del runtime: `runtime/requirements.txt` en la raíz del repositorio
- Atribución y licencia upstream: `NOTICE` y `LICENSE` en la raíz del repositorio
- Artículo secundario sobre desalineación emergente y aprendizaje subliminal en Talkie 1930: https://www.explainx.ai/blog/talkie-1930-model-emergent-misalignment-subliminal-learning-personas-pre-internet-2026
