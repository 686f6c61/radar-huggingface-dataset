# kylelovesllms/translation-syntax-rc_ladder_00_22_12_01-75000

## Resumen

`kylelovesllms/translation-syntax-rc_ladder_00_22_12_01-75000` es un repositorio de artefactos de entrenamiento publicado en Hugging Face, no un modelo unitario listo para uso en produccion. Contiene los resultados de 20 ejecuciones independientes del proyecto `tbd-syntax`, un experimento de investigacion sobre sintaxis y traduccion ingles-japones centrado en tareas de relative clause (RC). Cada ejecucion corresponde a una variante de GPT-2 de tamano muy reducido, entrenada desde cero con distintas combinaciones de profundidad y numero de cabezas de atencion.

El interes del repositorio es fundamentalmente metodologico: permite reproducir y comparar el efecto de la profundidad (4 o 6 capas) y del numero de cabezas (2 u 8) sobre el aprendizaje de una estructura sintactica concreta, con cinco semillas aleatorias por configuracion (s42 a s46). No se trata de un modelo de proposito general ni de un modelo de traduccion utilizable, sino de un banco de checkpoints para analisis cientifico.

La relevancia actual es limitada fuera del ambito de la investigacion en linguistica computacional y mecanistica de modelos. El tamano del repositorio (5,5 GB) se explica por acumular 20 ejecuciones completas con multiples checkpoints por ejecucion, no por el tamano de un unico modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parametros totales | No disponible (variantes de 4 o 6 capas, 2 u 8 cabezas, dimension 256) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | Ingles y japones (segun el dataset de entrenamiento) |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato HF con `config.json` y tokenizer) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con la configuracion clasica de GPT-2, pero con dimensiones reducidas: `d_model=256` y variaciones en el numero de capas (4 o 6) y de cabezas de atencion (2 u 8). Las ocho combinaciones resultantes se entrenaron con cinco semillas distintas cada una, sumando 20 ejecuciones completas. El prefijo `gpt2-4l2h256d` o `gpt2-6l8h256d` codifica capas, cabezas y dimension.

Los datos de entrenamiento provienen del dataset `kylelovesllms/english_zapanese_rc_ladder_train_00_22_12_01-filled`, que por el nombre sugiere un diseno de "escalera" (ladder) de complejidad creciente en torno a clausulas relativas en pares ingles-japones. No se documenta el numero de tokens, la composicion exacta del corpus ni si hubo fases de RLHF o DPO; por el tamano y la naturaleza del experimento, es razonable asumir entrenamiento supervisado puro, pero no esta confirmado en la informacion disponible. Cada carpeta de ejecucion incluye `checkpoints/stepNNNNNN/`, `run_config.json`, `metrics.csv`, `evals/` y `analysis/`, lo que facilita la trazabilidad, aunque el estado del optimizador (`resume/`) no se subio.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el tamano del modelo y el corpus de entrenamiento.
- Modelado de estructuras sintacticas de clausulas relativas en contextos ingles-japones.
- Traduccion experimental ingles-japones en el dominio restringido del dataset de entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas a los dos idiomas del corpus (ingles y japones).
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Investigacion en linguistica computacional: comparar como varian las metricas de adquisicion de clausulas relativas al cambiar profundidad y numero de cabezas, usando los `metrics.csv` y `evals/` de cada ejecucion.
- Analisis de mecanismos de atencion: los checkpoints de 2 y 8 cabezas permiten estudiar que patrones atencionales emergen con distinta granularidad en un modelo pequeno y controlado.
- Reproducibilidad de experimentos: el repositorio sirve como referencia para replicar el pipeline del proyecto `tbd-syntax` con las mismas semillas y configuraciones.
- Docencia y formacion: modelos de este tamano son utiles para explicar el funcionamiento interno de un transformer sin requerir infraestructura de GPU.
- Pruebas de pipelines de evaluacion: sirven como casos de prueba para validar herramientas de evaluacion sintactica o de traduccion en un entorno de bajo coste.
- Estudio de sensibilidad a la semilla: las cinco semillas por configuracion permiten medir la varianza en el rendimiento y distinguir efectos reales de ruido estadistico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye ficheros `metrics.csv` y directorios `evals/` por ejecucion, pero sus valores no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un unico checkpoint de dimension 256 y 4-6 capas ocupa del orden de decenas de MB en precisión completa, aunque el dato exacto no esta disponible.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; incluso CPU es viable para inferencia de un checkpoint individual.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con suficiente memoria para cargar un modelo de decenas de MB (GTX 1060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: `transformers` de Hugging Face de forma nativa; llama.cpp u Ollama requeririan conversion a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Este repositorio (variantes GPT-2 reducidas) | No disponible (dim. 256, 4-6 capas) | No disponible | No disponible | Investigacion sintactica EN-JA |
| GPT-2 small (referencia) | 124 M | 1024 | MIT | Generacion de texto general |
| DistilGPT-2 | 82 M | 1024 | Apache 2.0 | Generacion de texto general |
| Modelos de traduccion EN-JA especializados (p. ej. MarianMT) | Variable | Variable | Variable | Traduccion automatica |

La comparacion con modelos de proposito general es poco significativa: este repositorio no busca competir en generacion o traduccion, sino servir de base experimental controlada. Frente a MarianMT u otros modelos de traduccion, carece de la escala y el entrenamiento necesarios para uso practico.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un repositorio de artefactos de investigacion con 20 ejecuciones y multiples checkpoints.
- El tamano reducido (dimension 256, 4-6 capas) limita severamente la calidad y coherencia de la generacion.
- El dominio de entrenamiento esta restringido a un dataset sintactico ingles-japones; el rendimiento fuera de ese dominio sera muy pobre.
- No se especifica licencia, lo que impide determinar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier uso.
- Riesgo elevado de alucinacion y de outputs gramaticalmente incorrectos fuera del corpus de entrenamiento.
- No hay informacion sobre sesgos, filtrado de datos ni evaluaciones de seguridad.
- El estado del optimizador no esta incluido, por lo que reanudar el entrenamiento exactamente desde un checkpoint no es posible sin reconstruirlo.
- La fecha de creacion indicada (2026-11-09) y la referencia a una rama `backup/2026-11-08-working-tree` sugieren un repositorio de respaldo temporal, no una release estable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-rc_ladder_00_22_12_01-75000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/english_zapanese_rc_ladder_train_00_22_12_01-filled
- Codigo fuente del proyecto: https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-08-working-tree/src/training/exp_rc_ladder_train_00_22_12_01
