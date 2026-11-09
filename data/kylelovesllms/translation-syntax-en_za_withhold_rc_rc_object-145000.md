# kylelovesllms/translation-syntax-en_za_withhold_rc_rc_object-145000

## Resumen

`kylelovesllms/translation-syntax-en_za_withhold_rc_rc_object-145000` es un repositorio de artefactos de entrenamiento publicado en Hugging Face por el usuario `kylelovesllms`, no un modelo entrenado listo para uso general. Contiene los resultados de una bateria de experimentos del proyecto `tbd-syntax`, centrados en el estudio de la sintaxis en tareas de traduccion ingles-japones con estructuras de clausulas relativas (RC) retenidas ("withhold") y matrices de objetos. Los pesos son checkpoints en formato GPT-2 (arquitectura transformer decoder-only) generados con configuraciones reducidas: 2, 4 o 6 capas, 2, 4 u 8 cabezas de atencion y una dimension de modelo de 256.

El repositorio tiene 2,7 GB y alberga multiples carpetas de ejecucion (`gpt2-2l2h256d-s42`, `gpt2-4l4h256d-s42`, etc.), cada una con checkpoints por paso, `run_config.json`, `metrics.csv`, evaluaciones y analisis. Solo algunas ejecuciones constan como finalizadas; otras quedaron incompletas. El prefijo `145000` del nombre parece referirse a un paso de entrenamiento o a un identificador de checkpoint, aunque no se documenta explicitamente.

Su relevancia es acotada: no es un modelo para produccion ni para comparativas de rendimiento general, sino un material de investigacion reproducible para estudiar como la arquitectura (profundidad y numero de cabezas) afecta al aprendizaje de fenomenos sintacticos concretos en traduccion. Cualquier uso fuera de ese contexto experimental requiere validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (formato GPT-2) |
| Parametros totales | no disponible (depende de la configuracion: 2/4/6 capas, 2/4/8 cabezas, d=256) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | ingles y japones (segun el nombre del experimento y el dataset de entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints GPT-2 en formato Hugging Face, con `config.json` y tokenizer) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2 con variaciones controladas de profundidad (2, 4 o 6 capas), numero de cabezas de atencion (2, 4 u 8) y dimension de modelo fija de 256. Cada carpeta de ejecucion corresponde a una combinacion de estos hiperparametros y una semilla (`s42`, `s43`, `s44`). El objetivo del proyecto `tbd-syntax` es aislar el efecto de la capacidad arquitectonica sobre el aprendizaje de estructuras sintacticas especificas: clausulas relativas retenidas y matrices de objetos en traduccion ingles-japones.

Los datos de entrenamiento provienen del dataset `kylelovesllms/english_zapanese_withhold_rc_rc_matrix_object-filled`. No se documenta el numero de tokens, la composicion exacta del corpus, ni si hubo fases de RLHF, DPO o ajuste supervisado adicional. Tampoco se especifican innovaciones tecnicas como decodificacion especulativa o atencion lineal; se trata de un entrenamiento supervisado convencional sobre corpus paralelo. El repositorio no incluye el estado del optimizador (`resume/`), lo que limita la reanudacion exacta de los entrenamientos.

## Capacidades

- Generacion de texto y traduccion automatica en el par ingles-japones, limitada al dominio sintactico del corpus de entrenamiento.
- Modelado de estructuras de clausulas relativas y matrices de objetos, objeto de estudio del proyecto.
- Checkpoints intermedios por paso (`checkpoints/stepNNNNNN/`) utiles para analisis de curvas de aprendizaje.
- Evaluaciones y analisis incluidos en cada carpeta de ejecucion (`evals/`, `analysis/`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas a ingles y japones segun el nombre del experimento.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Investigacion en sintaxis computacional: comparar como varian las metricas de traduccion de clausulas relativas entre configuraciones de 2, 4 y 6 capas usando los `metrics.csv` y `evals/` incluidos.
- Reproducibilidad de experimentos academicos: reentrenar o analizar las ejecuciones finalizadas (`gpt2-2l2h256d-s42`, `gpt2-4l4h256d-s42`, etc.) a partir de `run_config.json` y el dataset enlazado.
- Estudio de escalado arquitectonico: relacionar numero de cabezas (2, 4, 8) con la calidad en la tarea de traduccion sintactica retenida.
- Analisis de seeds: comparar las semillas 42, 43 y 44 para estimar varianza entre ejecuciones, aunque solo la 42 consta como finalizada en la mayoria de configuraciones.
- Docencia y formacion: usar checkpoints pequenos (d=256) como ejemplo didactico de entrenamiento de un GPT-2 a escala reducida en tareas de traduccion.
- Baseline para experimentos propios: servir de punto de partida controlado antes de escalar a modelos mayores en estudios de sintaxis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento son los `metrics.csv` y `evals/` internos de cada ejecucion, que no se detallan en la model card ni en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, dado que la dimension de modelo es 256 y el numero de capas es como maximo 6; probablemente inferior a 1 GB por checkpoint en precision nativa.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; tambien CPU para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: transformers (formato GPT-2 nativo), llama.cpp u Ollama si se convierte a GGUF; no se documenta soporte nativo de vLLM o TGI para estas configuraciones tan pequenas.
- Latencia y throughput estimados: no disponibles; por el tamano, la latencia deberia ser de milisegundos en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (GPT-2 d=256, 2-6 capas) | no disponible (muy reducido) | no disponible | no disponible | Hugging Face |
| GPT-2 small (referencia) | 124 M | 1024 | MIT | Hugging Face |
| DistilGPT-2 (referencia) | 82 M | 1024 | Apache 2.0 | Hugging Face |
| Modelos de traduccion en-jp especializados | no disponible | no disponible | variable | variable |

La comparativa es orientativa: este repositorio no es un modelo de proposito general sino un conjunto de checkpoints experimentales, por lo que la comparacion directa con GPT-2 small o DistilGPT-2 solo tiene sentido como referencia de escala, no de rendimiento.

## Limitaciones y advertencias

- No es un modelo listo para produccion: son artefactos de investigacion con configuraciones muy reducidas y sin documentacion de uso.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas limitados a ingles y japones segun el nombre del experimento; no se documenta cobertura adicional.
- Riesgo elevado de alucinacion y salidas incorrectas fuera del dominio sintactico del corpus de entrenamiento.
- Muchas ejecuciones constan como no finalizadas (`s43`, `s44`), lo que limita su utilidad para analisis comparativos.
- No se incluye el estado del optimizador (`resume/`), lo que impide reanudar entrenamientos de forma exacta.
- No hay informacion sobre sesgos, composicion del dataset ni procesos de filtrado.
- Longitud de contexto no documentada; no debe asumirse ninguna ventana concreta.
- El nombre del repositorio incluye un identificador (`145000`) cuyo significado no se aclara en la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-en_za_withhold_rc_rc_object-145000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/english_zapanese_withhold_rc_rc_matrix_object-filled
- Repositorio del proyecto `tbd-syntax`: https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-08-working-tree/src/training/exp_english_zapanese_withhold_rc_rc_matrix_object
