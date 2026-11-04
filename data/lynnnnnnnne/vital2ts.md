# Lynnnnnnnne/vital2TS

## Resumen

vital2TS es un repositorio de artefactos publicado en Hugging Face por el usuario Lynnnnnnnne que agrupa los materiales necesarios para reproducir el entrenamiento del sistema VITAL (vis-sigmoid OPD + ROUGE-L gap k3) sobre la familia Qwen3-VL. No se trata de un modelo único entrenado desde cero, sino de un paquete que contiene dos checkpoints derivados de Qwen3-VL (un student de 2B parámetros tras SFT y un teacher de 8B tras GSPO), junto con los ficheros Parquet de entrenamiento y validación y una copia empaquetada de CuPy 13.6.0 para CUDA 12.x.

El interés del repositorio es fundamentalmente de reproducibilidad: permite a investigadores en diagnóstico médico asistido por visión-lenguaje reentrenar o evaluar la receta VITAL sin tener que reconstruir los checkpoints intermedios ni los datasets derivados de MIMIC-CXR. La model card es explícita en que el código y las listas de splits viven en un repositorio compañero (`VITAL-for-Medical-Diagnosis`) que no incluye los pesos.

La información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia, pipeline ni idiomas soportados, y el tamaño total del repo es de aproximadamente 0,2 GB según los metadatos de Hugging Face (los checkpoints completos, según la model card, sumarían unos 21,6 GB, lo que sugiere que los pesos pueden estar almacenados mediante LFS o referenciados externamente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (derivado de Qwen3-VL); no se detalla la variante exacta |
| Parametros totales | Student: ~2B (Qwen3-VL-2B); teacher: ~8B (Qwen3-VL-8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato Hugging Face (`*_merged_hf`); datos en Parquet; dependencia empaquetada en directorio CuPy |

## Arquitectura y entrenamiento

Los checkpoints incluidos son variantes ajustadas de Qwen3-VL. El student de 2B se ha sometido a SFT (supervised fine-tuning) y se distribuye fusionado en formato Hugging Face en el paso global 250. El teacher de 8B se ha entrenado con GSPO (Group Sequence Policy Optimization) y se distribuye fusionado en el paso global 1500. La receta VITAL que se documenta en la model card combina una señal de optimización denominada "vis-sigmoid OPD" con un criterio de "ROUGE-L gap k3", y utiliza el teacher para generar cachés de recompensa ROUGE-L que se incorporan al Parquet de entrenamiento (`train_grpo_teacher_rougel.parquet`) para el posterior entrenamiento GRPO del student.

El dataset de trabajo se denomina `mimiccxr_verl_4k_imgcap1500`, lo que sugiere un subconjunto de MIMIC-CXR con aproximadamente 4.000 imágenes y 1.500 pares imagen-caption, procesado con la librería verl para RL. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del corpus, ni si hubo etapas adicionales de RLHF o DPO más allá del GSPO del teacher y el GRPO del student.

## Capacidades

- Generación de texto e informes clínicos a partir de imágenes médicas, heredada de la base Qwen3-VL.
- Procesamiento visión-lenguaje: el modelo recibe pares imagen-texto, propio del dominio radiológico de MIMIC-CXR.
- Razonamiento multi-paso guiado por recompensa: el pipeline GRPO con caché de ROUGE-L del teacher está diseñado para afinar la calidad de las descripciones generadas.
- Capacidad de actuar como teacher (8B) para destilar señales hacia un student (2B) en un esquema de aprendizaje por refuerzo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Reproducción de experimentos VITAL: el paquete permite arrancar el pipeline de entrenamiento con variables de entorno predefinidas (`STUDENT_MODEL`, `TEACHER_MODEL`, `TRAIN_FILE`, `TEST_FILE`, `CUPY_PREFIX`) sin reconstruir checkpoints intermedios.
- Investigación en RL para visión-lenguaje médico: el par student/teacher y los Parquet con caché de recompensa permiten estudiar el efecto de GRPO con señales ROUGE-L en generación de informes radiológicos.
- Destilación teacher-student en dominios especializados: el checkpoint de 8B puede emplearse como generador de referencias para afinar el de 2B en tareas de captioning clínico.
- Evaluación comparativa de recetas de RL: al incluir checkpoints en pasos concretos (250 para SFT, 1500 para GSPO), se pueden medir curvas de aprendizaje y comparar contra baselines Qwen3-VL sin ajuste.
- Desarrollo de sistemas de apoyo al diagnóstico en investigación: los modelos pueden emplearse para generar borradores de hallazgos a partir de radiografías de tórax, siempre en un contexto de investigación y no de uso clínico directo.
- Reentrenamiento con datos propios: la estructura de datos en Parquet y el script de entorno facilitan adaptar la receta a otros conjuntos de imágenes médicas con anotaciones textuales.
- Validación de infraestructura CuPy/CUDA: el bundle incluye CuPy 13.6.0 para CUDA 12.x, útil para verificar que los sbatch de entrenamiento apuntan a la ruta correcta y evitar fallos por versiones más recientes (CuPy 14 en conda no satisface la comprobación de ruta).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el student de 2B en precisión completa requiere del orden de 4-6 GB; el teacher de 8B, del orden de 16-20 GB en FP16/BF16. No se especifican cuantizaciones oficiales.
- GPU recomendadas: para el teacher de 8B, A100 40/80 GB, H100 o RTX 4090 (24 GB) en BF16; para el student de 2B, RTX 4090, RTX 3090 o A10.
- Cabe en GPU consumer: el student de 2B sí cabe en GPUs de 8-16 GB; el teacher de 8B requiere al menos 24 GB en BF16 y probablemente cuantización para GPUs de 16 GB.
- Opciones de despliegue: al estar en formato Hugging Face (`*_merged_hf`), es compatible con transformers, vLLM y TGI; no se confirma soporte GGUF/llama.cpp/Ollama en la información disponible.
- Latencia y throughput: no disponibles. El entrenamiento está pensado para ejecutarse en clúster con sbatch y CUDA 12.x más CuPy 13.6.0 empaquetado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vital2TS (student) | ~2B | no disponible | no disponible | Hugging Face (repo `Lynnnnnnnne/vital2TS`) |
| vital2TS (teacher) | ~8B | no disponible | no disponible | Hugging Face (repo `Lynnnnnnnne/vital2TS`) |
| Qwen3-VL-2B-Instruct | ~2B | no disponible en esta ficha | según Qwen3-VL | Hugging Face (modelo base) |
| Qwen3-VL-8B-Instruct | ~8B | no disponible en esta ficha | según Qwen3-VL | Hugging Face (modelo base) |

La comparación se limita a los modelos base de los que derivan los checkpoints, ya que no se han encontrado en la información disponible otros sistemas VITAL públicos con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se declara licencia en el repositorio, lo que impide determinar si el uso comercial está permitido; hay que contactar con el autor o consultar el repositorio compañero antes de cualquier uso productivo.
- Los modelos derivan de Qwen3-VL, por lo que heredan los sesgos y limitaciones de ese modelo base, incluidos posibles sesgos demográficos y clínicos en datos de radiología.
- Riesgo de alucinación en la generación de hallazgos clínicos: el entrenamiento con ROUGE-L como recompensa puede favorecer la coincidencia léxica con referencias sin garantizar corrección factual.
- El uso clínico directo no está respaldado por la información disponible; el paquete se presenta como material de reproducción de investigación.
- La model card no especifica idiomas soportados; el entrenamiento con MIMIC-CXR sugiere predominio del inglés en los datos, con posible degradación en castellano.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; los pesos pueden requerir descarga vía LFS y el tamaño reportado (0,2 GB) no coincide con el tamaño declarado de los checkpoints (~21,6 GB), lo que conviene verificar antes de asumir que están completos.
- La ruta de CuPy está fijada a `.deps/cupy-cuda12x-13.6.0`; versiones más recientes (CuPy 14 en conda) no satisfacen la comprobación de los scripts de entrenamiento.
- No hay información sobre contexto máximo, cuantizaciones oficiales ni rendimiento medido, lo que dificulta planificar despliegues en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lynnnnnnnne/vital2TS
- Repositorio compañero citado en la model card: `VITAL-for-Medical-Diagnosis` (no incluye pesos; no se proporciona URL directa en la información disponible)
- Modelo base Qwen3-VL: no se proporciona URL directa en la información disponible
- Dataset MIMIC-CXR: no se proporciona URL directa en la información disponible
- Paper o blog de VITAL: no disponible en la información proporcionada
