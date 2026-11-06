# Appodoom/ldm-with-subd-m2-57-6pct

## Resumen

LDM with subdivision, M2 at 57.6% training size es un modelo de generación de ritmos musicales publicado por el usuario Appodoom en Hugging Face. Se trata de un checkpoint intermedio (paso 22.600) de un experimento de capacidad sobre un modelo denominado LDM (latent diffusion model, según la nomenclatura del autor), seleccionado por pérdida de validación en el punto del 57,6% del tamaño de entrenamiento previsto. El modelo trabaja con el formato `.derbake`, un formato de archivo de cinco líneas con tokens de ritmo atómicos, y está orientado a la generación de ciclos rítmicos de percusión.

Arquitectónicamente se declara como un transformer de 4 capas, anchura de embedding de 192 y 4 cabezas de atención, con una longitud de contexto de 6.656 tokens y 1.197.972 parámetros totales según los pesos en safetensors. El pipeline declarado es `feature-extraction`, aunque la model card describe un uso generativo mediante `model.generate`. El entrenamiento se realizó sobre un subconjunto de 157.439 ciclos (258,74 horas) y se evaluó sobre un conjunto de test de 17 archivos, 34.184 ciclos y 56,10 horas.

Su relevancia es acotada: no es un modelo de propósito general ni compite con LLMs, sino una pieza de investigación muy específica sobre generación simbólica de ritmo. Resulta útil para quien investigue modelos generativos musicales de nicho, formatos de representación rítmica tokenizada o experimentos de escalado de capacidad, pero no es adecuado para tareas de lenguaje natural, código o visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LDM según el autor), 4 capas, embedding width 192, 4 cabezas de atención |
| Parametros totales | 1.197.972 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 6.656 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio musical, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Formato de datos de entrada/salida | archivos `.derbake` de cinco líneas con tokens de ritmo atómicos |
| Checkpoint | paso 22.600 |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de 4 capas con anchura de embedding de 192 y 4 cabezas de atención, con un contexto de 6.656 tokens. El autor lo enmarca en un experimento de capacidad ("LDM capacity experiment") y este checkpoint corresponde al modelo M2 evaluado al 57,6% del tamaño de entrenamiento, seleccionado por pérdida de validación guardada. El checkpoint exportado proviene del paso 22.600.

El entrenamiento se realizó sobre un subconjunto normal de 157.439 ciclos, equivalentes a 258,74 horas de material rítmico. La evaluación se hizo con el scorer LDM archivado del autor sobre una NVIDIA A100 SXM de 80 GB, usando un split de test de 17 archivos, 34.184 ciclos y 56,10 horas. No se documentan en la información disponible detalles sobre composición exacta del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El modelo requiere `trust_remote_code=True`, lo que implica que el código de modelo y procesador se ejecuta desde el repositorio.

## Capacidades

- Generación de ritmos simbólicos en formato `.derbake` a partir de un archivo de prompt, con un número de ciclos especificable (`num_cycles`).
- Generación condicionada por prompt: el procesador acepta `derbake_path` y produce `input_ids` para el modelo.
- Decodificación controlada: `decode_generation` reconstruye el ritmo esperando un número concreto de ciclos; los ciclos inválidos se descartan con un aviso de Python.
- Informe de generación opcional mediante `return_generation_report=True`.
- Escritura de archivos `.derbake` con parámetros fijos: 120 BPM, amplitud 1,5 y línea de esqueleto en blanco.
- Soporte de batch size uno únicamente.
- Límite de 16 beats por ciclo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio.

## Casos de uso

- Investigación en generación simbólica de ritmo: el modelo permite reproducir el experimento de capacidad del autor y comparar checkpoints intermedios (como este al 57,6%) frente a modelos completos, usando el scorer LDM archivado.
- Generación de patrones de percusión para producción musical asistida: partiendo de un archivo `.derbake` de prompt, se pueden generar diez ciclos rítmicos y exportarlos a un archivo listo para su uso en un DAW o en un pipeline de composición.
- Estudio de representaciones tokenizadas de ritmo: el formato de tokens atómicos y archivos de cinco líneas sirve como banco de pruebas para investigar tokenizaciones alternativas de eventos musicales.
- Evaluación de métricas de exactitud rítmica: las métricas reportadas (exact HIT accuracy, skeleton HIT accuracy, cross-entropy) permiten usar el modelo como referencia en la validación de nuevos scorers o representaciones.
- Docencia en modelos generativos musicales: el tamaño reducido (1,2 M de parámetros) y el contexto de 6.656 tokens lo hacen manejable para demostraciones en aula sobre transformers aplicados a música.
- Reproducibilidad de experimentos de escalado: al estar identificado por paso y porcentaje de entrenamiento, sirve para replicar curvas de pérdida y comparar el efecto de la capacidad del modelo en la calidad de generación.

## Benchmarks y rendimiento

Resultados de test held-out reportados por el autor (evaluación con el scorer LDM archivado en una A100 SXM 80 GB):

| Metrica | Valor |
|---|---:|
| Exact HIT accuracy (incluyendo silencio) | 72,591% |
| Overall token accuracy | 81,624% |
| Skeleton HIT accuracy | 95,478% |
| Test cross-entropy | 0,372369 |
| Validation cross-entropy del checkpoint guardado | 0,373222 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (1,2 M de parámetros); no se especifica una cifra concreta en la información disponible.
- GPU recomendadas: la evaluación del autor se realizó en una NVIDIA A100 SXM de 80 GB, aunque por tamaño del modelo debería caber en GPUs consumer muy inferiores.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con unos pocos cientos de MB de VRAM, aunque no se documentan requisitos mínimos exactos.
- Opciones de despliegue: la model card solo documenta el uso mediante `transformers` con `AutoModel` y `AutoProcessor` y `trust_remote_code=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Restricciones operativas: batch size uno y máximo de 16 beats por ciclo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (generación simbólica de ritmo con formato `.derbake`), y las alternativas genéricas de generación musical no son directamente equiparables en formato, tamaño ni métricas.

## Limitaciones y advertencias

- Modelo de nicho: no es un LLM de propósito general; no debe esperarse razonamiento, código, matemáticas ni comprensión lingüística.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene fijar una revisión (commit SHA) verificada para reproducibilidad y seguridad.
- Batch size limitado a uno y máximo de 16 beats por ciclo, lo que restringe el throughput en producción.
- Si se alcanza el límite de tokens antes de completar los ciclos solicitados, se lanza un error y no se genera archivo de salida.
- Los ciclos inválidos se descartan silenciosamente (solo con un aviso de Python), lo que puede complicar la depuración si no se usa `return_generation_report=True`.
- Parámetros de escritura fijos (120 BPM, amplitud 1,5, línea de esqueleto en blanco), sin opción documentada de configuración.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas no disponibles: el modelo no está orientado a texto natural.
- Riesgo de sesgo hacia el corpus de entrenamiento (157.439 ciclos, 258,74 horas), cuya composición no se detalla.
- Sin datos de benchmarks comparativos ni de latencia/throughput, lo que limita la evaluación objetiva frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/Appodoom/ldm-with-subd-m2-57-6pct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
