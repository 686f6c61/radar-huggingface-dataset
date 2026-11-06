# jungwook2358/wam-openarm-h2rb-naive-robotonly-hawor-v1-50k-ckpt50000

## Resumen

`wam-openarm-h2rb-naive-robotonly-hawor-v1-50k-ckpt50000` es un modelo de robótica desarrollado por el usuario `jungwook2358`, publicado en Hugging Face con pipeline `robotics`. Se trata de un modelo de flow matching conjunto de vídeo y acción ("joint video+action flow matching") construido a partir de Wan2.2-TI2V-5B, un modelo generativo de vídeo de aproximadamente 5 000 millones de parámetros. El modelo se ha entrenado desde cero durante 50 000 pasos sobre datos exclusivamente robóticos del conjunto OpenArm, sin datos humanos.

El modelo forma parte de una ablación (EXP-0019) cuyo objetivo es medir el efecto de eliminar el profesor FRED, iBOT y CogAlign del pipeline de entrenamiento, así como de prescindir por completo de datos humanos. La variante `robotonly` se compara explícitamente con otras dos variantes del mismo autor: una con etiquetas PRQ humanas y otra con vídeo humano únicamente. Es, por tanto, una pieza de investigación más que un modelo listo para producción.

El checkpoint incluido corresponde al paso 50 000 y ocupa 12,5 GB en el repositorio. El modelo recibe observaciones visuales estéreo y produce acciones bimanuales de horizonte 24 en el espacio de representación PRQ30, lo que lo sitúa en el ámbito de los modelos de política visomotora (vision-language-action) para manipulación robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow matching conjunto de vídeo y acción sobre Wan2.2-TI2V-5B (transformer de difusión/flow) |
| Parámetros totales | No disponible (modelo base Wan2.2-TI2V-5B, aproximadamente 5 000 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (horizonte de acción de 24 pasos; 1 frame de condición + 8 frames futuros con stride 3) |
| Tipos de cuantización | No disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | No disponible (modelo de robótica, sin capacidades lingüísticas documentadas) |
| Licencia | other (licencia personalizada, ver repositorio) |
| Formato de pesos | safetensors (3 shards, con index, config.json y processor_config.json) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de flow matching que combina la generación de vídeo futuro con la predicción de acciones, partiendo del modelo Wan2.2-TI2V-5B. La variante "naive" prescinde del profesor FRED, de las representaciones iBOT y de CogAlign, de modo que el aprendizaje se apoya únicamente en la señal de flow matching conjunto sobre vídeo y acción. El entrenamiento se realizó desde cero (no fine-tuning) durante 50 000 pasos en 4 GPU con 16 filas por GPU, es decir, 64 filas robóticas por paso.

Los datos provienen exclusivamente de 6 subconjuntos robóticos de OpenArm (553 episodios), sin ningún dato humano. Las observaciones de vídeo son estéreo concatenadas en 192x256, con la vista izquierda en negro al no haber datos humanos, stride de 3 (1 frame de condición más 8 futuros) y enmascaramiento de vistas con probabilidades 0,5/0,25/0,25. Las acciones y estados se representan en PRQ30 para ambas manos (posición de muñeca de 3 dimensiones, rotación 6D, 6 articulaciones de mano, por cada mano), en valores absolutos, en el marco de la cámara derecha ZED (FRAME V1: cinemática directa del robot en la pose fija de cabeza egopi más transformación afín V1), normalizados con q01/q99 y con máscaras de validez (`WAM_ROW_VALIDITY=1`). El horizonte de acción es 24. El checkpoint incluye estados del trainer, pero no los estados del optimizador DeepSpeed (72 GB).

## Capacidades

- Predicción de acciones bimanuales en el espacio PRQ30 (posición, rotación 6D y articulaciones de mano para ambas manos).
- Generación conjunta de vídeo futuro y acción (joint video+action flow matching) condicionada a observaciones estéreo.
- Modelado de horizonte de acción de 24 pasos.
- Procesamiento de observaciones visuales estéreo a 192x256 con enmascaramiento de vistas.
- Entrenado exclusivamente con datos robóticos, sin capacidad documentada de generalización a datos humanos.
- No dispone de tool calling, function calling, capacidades de agente textual ni multilingüismo.
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras capacidades multimodales fuera del ámbito robótico.

## Casos de uso

- Investigación en ablaciones de flow matching visomotor: sirve como línea base "naive" y "robot only" para comparar contra variantes con profesor FRED, iBOT, CogAlign o datos humanos, aislando la contribución de cada componente.
- Manipulación bimanual en OpenArm: el modelo produce acciones PRQ30 para ambas manos con horizonte 24, adecuado para control de políticas en tareas de manipulación con el robot OpenArm.
- Estudio del efecto de los datos humanos: al ser la variante sin datos humanos, permite cuantificar la brecha de rendimiento frente a las variantes con etiquetas o vídeo humano del mismo autor.
- Evaluación de representaciones de acción PRQ30: útil para validar la formulación de acción/estado (posición de muñeca, rotación 6D, articulaciones de mano) en el marco de cámara ZED con normalización q01/q99.
- Reproducción de entrenamiento: el repositorio incluye configuración de experimento, estadísticas, `embodiment_id.json` y estados de entrenamiento, lo que facilita reproducir o continuar el entrenamiento en el branch `jungwook/openarm-fred-ft`.
- Predicción de vídeo futuro como señal auxiliar: el componente de generación de vídeo puede emplearse para inspeccionar la coherencia de las predicciones visuales del modelo en entornos robóticos.
- Base para fine-tuning en dominios robóticos específicos: al partir de Wan2.2-TI2V-5B y estar entrenado solo con datos robóticos, puede servir como inicialización para políticas en tareas concretas del mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 12,5 GB en safetensors, por lo que la inferencia en precisión completa requeriría del orden de decenas de GB de VRAM según el modelo base Wan2.2-TI2V-5B (aproximadamente 5 000 millones de parámetros).
- GPU recomendadas: el entrenamiento se realizó en 4 GPU con 16 filas por GPU (el autor no especifica el modelo de GPU); para inferencia se recomienda hardware de gama alta tipo A100 o H100 por el tamaño del modelo base.
- ¿Cabe en GPU consumer? No disponible; con cuantización agresiva podría ser posible en GPUs de 24 GB, pero no se documenta.
- Opciones de despliegue: no disponible (no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; es un modelo de robótica con checkpoint de Hugging Face Trainer).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos humanos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wam-openarm-h2rb-naive-robotonly-hawor-v1-50k-ckpt50000 | ~5 000 M (base Wan2.2-TI2V-5B) | Horizonte de acción 24 | No | other | Hugging Face |
| wam-openarm-h2rb-naive-hawor-v1-50k-ckpt50000 | ~5 000 M (base Wan2.2-TI2V-5B) | Horizonte de acción 24 | Sí (etiquetas PRQ) | other | Hugging Face |
| wam-openarm-h2rb-naive-humvid-... | ~5 000 M (base Wan2.2-TI2V-5B) | Horizonte de acción 24 | Sí (solo vídeo) | other | Hugging Face |

Las tres variantes comparten arquitectura base y configuración de entrenamiento, diferenciándose únicamente en el uso de datos humanos y en los componentes del pipeline (FRED, iBOT, CogAlign). No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos robóticos (553 episodios de 6 subconjuntos), sin datos humanos; la generalización fuera de la distribución de OpenArm es muy limitada.
- Modelo de investigación en fase de ablación, no validado para producción.
- Sin benchmarks publicados que permitan evaluar su rendimiento frente a alternativas.
- Licencia "other": es necesario revisar los términos concretos en el repositorio antes de cualquier uso comercial.
- No se documentan sesgos, pero al entrenarse solo con datos de un robot concreto, puede heredar sesgos de ese entorno y de las condiciones de captura.
- Riesgo de alucinación en la generación de vídeo futuro y de acciones incoherentes fuera de las condiciones de entrenamiento.
- Sin capacidades lingüísticas, de tool calling ni de agentes; no es un modelo de propósito general.
- El checkpoint no incluye los estados del optimizador DeepSpeed, lo que limita la reanudación exacta del entrenamiento.
- No se especifican los idiomas soportados ni requisitos de hardware detallados.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/wam-openarm-h2rb-naive-robotonly-hawor-v1-50k-ckpt50000
- Repositorio de código: branch `jungwook/openarm-fred-ft` @c3d1b92 (actlat-wam), script `run_scripts/train/wam_dit4dit/openarm/finetune_openarm_prq30_h2rb.sh`
- Configuración de modalidad: `gr00t/configs/data/openarm_prq30_v1_config.py`
- Modelo base: Wan2.2-TI2V-5B (no se proporciona enlace directo en la información disponible)
